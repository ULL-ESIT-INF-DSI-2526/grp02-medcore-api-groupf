import { Request, Response } from 'express';
import {
  CreateRecordInput,
  Records,
  RecordsModel,
  Status,
  TypeofRecord,
  UpdateRecordInput,
  PrescriptionInput,
  PrescriptionMedications
} from '../models/records.js';
import { Patient } from '../models/patient.js';
import { Staff, StaffStatus } from '../models/staff.js';
import { Medications } from '../models/medications.js';
import { Types } from 'mongoose';

interface PrescriptionResolvedItem {
  medication: { _id: Types.ObjectId; price: number; stock: number; save: () => Promise<unknown> };
  quantity: number;
  dosage?: string;
}

async function calculateResolvedPrescriptionTotal(
  prescription: PrescriptionResolvedItem[]
): Promise<number> {
  let total = 0;

  for (const item of prescription) {
    total += item.quantity * item.medication.price;
  }

  return total;
}

function normalizeResolvedPrescription(
  prescription: PrescriptionResolvedItem[]
): PrescriptionMedications[] {
  return prescription.map((item) => ({
    medicationId: item.medication._id,
    quantity: item.quantity,
    dosage: item.dosage
  }));
}

async function ensureRelatedEntitiesExist(
  patientIdentificationNumber: string,
  staffCollegeId: string
): Promise<{
  patient: { _id: Types.ObjectId };
  staff: { _id: Types.ObjectId };
}> {
  const [patient, staff] = await Promise.all([
    Patient.findOne({ identificationNumber: patientIdentificationNumber }),
    Staff.findOne({ collegeId: staffCollegeId, status: StaffStatus.ACTIVE })
  ]);

  if (!patient) {
    throw new Error('The patient mentioned do not exist');
  }

  if (!staff) {
    throw new Error('The staff mentioned do not exist or is not active');
  }

  return { patient: patient as { _id: Types.ObjectId }, staff: staff as { _id: Types.ObjectId } };
}

async function ensureRelatedEntitiesExistById(
  patientId: string | Types.ObjectId,
  staffId: string | Types.ObjectId
): Promise<void> {
  const [patient, staff] = await Promise.all([
    Patient.findById(patientId),
    Staff.findById(staffId)
  ]);

  if (!patient) {
    throw new Error('The patient mentioned do not exist');
  }

  if (!staff) {
    throw new Error('The staff mentioned do not exist');
  }
}

async function resolvePrescriptionItems(
  prescription: PrescriptionInput[]
): Promise<PrescriptionResolvedItem[]> {
  const resolvedItems: PrescriptionResolvedItem[] = [];

  for (const item of prescription) {
    if (!item.nationalCode) {
      throw new Error('Missing medication national code');
    }

    if (item.quantity <= 0) {
      throw new Error('Prescription quantity must be greater than zero');
    }

    const medication = await Medications.findOne({ nationalCode: item.nationalCode });
    if (!medication) {
      throw new Error('The medication mentioned do not exist');
    }

    if (medication.stock < item.quantity) {
      throw new Error(`Insufficient stock for medication ${item.nationalCode}`);
    }

    resolvedItems.push({
      medication,
      quantity: item.quantity,
      dosage: item.dosage
    });
  }

  return resolvedItems;
}

async function deductPrescriptionStock(prescription: PrescriptionResolvedItem[]): Promise<void> {
  for (const item of prescription) {
    item.medication.stock -= item.quantity;
    await item.medication.save();
  }
}

export async function createRecord(data: CreateRecordInput): Promise<Records> {
  if (
    !data.patientIdentificationNumber ||
    !data.staffCollegeId ||
    !data.record ||
    !data.reason ||
    !data.diagnosis ||
    !data.prescription
  ) {
    throw new Error('Missing required record fields');
  }

  const { patient, staff } = await ensureRelatedEntitiesExist(
    data.patientIdentificationNumber,
    data.staffCollegeId
  );
  const prescription = await resolvePrescriptionItems(data.prescription);

  const totalPrice = await calculateResolvedPrescriptionTotal(prescription);
  await deductPrescriptionStock(prescription);

  const created = await RecordsModel.create({
    patientId: patient._id,
    staffId: staff._id,
    record: data.record,
    admissionDate: data.admissionDate ?? new Date(),
    dischargeDate: data.dischargeDate ?? null,
    reason: data.reason,
    diagnosis: data.diagnosis,
    prescription: normalizeResolvedPrescription(prescription),
    totalPrice,
    status: data.status ?? Status.OPEN
  });

  return created.toObject();
}

export async function getRecords(): Promise<Records[]> {
  return RecordsModel.find().lean();
}

export async function findRecordsById(
  id: string | Types.ObjectId
): Promise<Records | null> {
  return RecordsModel.findById(id).lean();
}

export async function updateRecordsByID(
  id: string | Types.ObjectId,
  data: UpdateRecordInput
): Promise<Records | null> {
  const existingRecord = await RecordsModel.findById(id);
  if (!existingRecord) {
    throw new Error('Record unavailable');
  }

  if (data.patientId || data.staffId) {
    await ensureRelatedEntitiesExistById(
      data.patientId ?? existingRecord.patientId,
      data.staffId ?? existingRecord.staffId
    );
  }

  const mergedPrescription = data.prescription
    ? normalizeLegacyPrescription(data.prescription)
    : existingRecord.prescription;

  const totalPrice = data.prescription
    ? await calculateLegacyPrescriptionTotal(data.prescription)
    : existingRecord.totalPrice;

  existingRecord.patientId = (data.patientId ?? existingRecord.patientId) as Types.ObjectId;
  existingRecord.staffId = (data.staffId ?? existingRecord.staffId) as Types.ObjectId;
  if (data.record !== undefined) existingRecord.record = data.record;
  if (data.admissionDate !== undefined) existingRecord.admissionDate = data.admissionDate;
  if (data.dischargeDate !== undefined) existingRecord.dischargeDate = data.dischargeDate;
  if (data.reason !== undefined) existingRecord.reason = data.reason;
  if (data.diagnosis !== undefined) existingRecord.diagnosis = data.diagnosis;
  existingRecord.prescription = mergedPrescription as unknown as PrescriptionMedications[];
  existingRecord.totalPrice = totalPrice;
  if (data.status !== undefined) existingRecord.status = data.status;

  await existingRecord.save();
  return existingRecord.toObject();
}

export async function deleteRecord(id: string | Types.ObjectId): Promise<Records | null> {
  return RecordsModel.findByIdAndDelete(id).lean();
}

export async function findRecordsByDates(
  startDate: Date,
  endDate: Date,
  register?: TypeofRecord
): Promise<Records[]> {
  const filter: Record<string, unknown> = {
    admissionDate: { $gte: startDate, $lte: endDate }
  };

  if (register !== undefined) {
    filter.record = register;
  }

  return RecordsModel.find(filter).lean();
}

export async function findRecordsByPatient(patient: string): Promise<Records[]> {
  return RecordsModel.find({ patientId: patient }).lean();
}

async function calculateLegacyPrescriptionTotal(
  prescription: UpdateRecordInput['prescription']
): Promise<number> {
  let total = 0;

  for (const item of prescription ?? []) {
    if (item.quantity <= 0) {
      throw new Error('Prescription quantity must be greater than zero');
    }

    const medication = await Medications.findById(item.medicationId);
    if (!medication) {
      throw new Error('The medication mentioned do not exist');
    }

    total += item.quantity * medication.price;
  }

  return total;
}

function normalizeLegacyPrescription(
  prescription: UpdateRecordInput['prescription']
): PrescriptionMedications[] {
  return (prescription ?? []).map((item) => ({
    medicationId: new Types.ObjectId(item.medicationId),
    quantity: item.quantity,
    dosage: item.dosage
  }));
}
export async function createRecords(req: Request, res: Response) {
  try {
    const record = await createRecord(req.body);
    return res.status(201).send(record);
  } catch (error) {
    return res.status(400).send(error);
  }
}

export async function getAllRecords(_req: Request, res: Response) {
  try {
    const records = await getRecords();
    return res.send(records);
  } catch (error) {
    return res.status(400).send(error);
  }
}

export async function getRecordById(req: Request, res: Response) {
  try {
    const record = await findRecordsById(String(req.params.id));
    if (!record) {
      return res.status(404).send({ message: 'Record not found' });
    }

    return res.send(record);
  } catch (error) {
    return res.status(400).send(error);
  }
}

export async function updateRecord(req: Request, res: Response) {
  try {
    const record = await updateRecordsByID(String(req.params.id), req.body);
    if (!record) {
      return res.status(404).send({ message: 'Record not found' });
    }

    return res.send(record);
  } catch (error) {
    return res.status(400).send(error);
  }
}

export async function deleteRecordById(req: Request, res: Response) {
  try {
    const record = await deleteRecord(String(req.params.id));
    if (!record) {
      return res.status(404).send({ message: 'Record not found' });
    }

    return res.send(record);
  } catch (error) {
    return res.status(400).send(error);
  }
}
