import mongoose, { Schema, model, Types } from 'mongoose';
import { Patient } from './patient.js';
import { Staff } from './staff.js';
import { Medications } from './medications.js';

export enum TypeofRecord {
  CLINIC_VISIT = 'Consulta Ambulatoria',
  HOSPITALIZATION = 'Ingreso Hospitalario'
}

export enum Status {
  OPEN = 'abierto',
  CLOSE = 'cerrado'
}

export interface PrescriptionMedications {
  medicationId: Types.ObjectId;
  quantity: number;
  dosage: string;
}

export interface Records {
  _id?: Types.ObjectId;
  patientId: Types.ObjectId;
  staffId: Types.ObjectId;
  record: TypeofRecord;
  admissionDate: Date;
  dischargeDate?: Date | null;
  reason: string;
  diagnosis: string;
  prescription: PrescriptionMedications[];
  totalPrice: number;
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRecordInput {
  patientId: string | Types.ObjectId;
  staffId: string | Types.ObjectId;
  record: TypeofRecord;
  admissionDate?: Date;
  dischargeDate?: Date | null;
  reason: string;
  diagnosis: string;
  prescription: Array<{
    medicationId: string | Types.ObjectId;
    quantity: number;
    dosage: string;
  }>;
  status?: Status;
}

export interface UpdateRecordInput {
  patientId?: string | Types.ObjectId;
  staffId?: string | Types.ObjectId;
  record?: TypeofRecord;
  admissionDate?: Date;
  dischargeDate?: Date | null;
  reason?: string;
  diagnosis?: string;
  prescription?: Array<{
    medicationId: string | Types.ObjectId;
    quantity: number;
    dosage: string;
  }>;
  status?: Status;
}

const PrescriptionSchema = new Schema<PrescriptionMedications>(
  {
    medicationId: { type: Schema.Types.ObjectId, ref: 'Medications', required: true },
    quantity: { type: Number, required: true, min: 1 },
    dosage: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const RecordsSchema = new Schema<Records>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    record: { type: String, required: true, enum: Object.values(TypeofRecord) },
    admissionDate: { type: Date, default: Date.now },
    dischargeDate: { type: Date, default: null },
    reason: { type: String, required: true, trim: true },
    diagnosis: { type: String, required: true, trim: true },
    prescription: { type: [PrescriptionSchema], required: true, default: [] },
    totalPrice: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, required: true, enum: Object.values(Status), default: Status.OPEN }
  },
  {
    timestamps: true,
    collection: 'records'
  }
);

export const RecordsModel = model<Records>('Record', RecordsSchema);

async function calculatePrescriptionTotal(
  prescription: CreateRecordInput['prescription']
): Promise<number> {
  let total = 0;

  for (const item of prescription) {
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

function normalizePrescription(
  prescription: CreateRecordInput['prescription']
): PrescriptionMedications[] {
  return prescription.map((item) => ({
    medicationId: new Types.ObjectId(item.medicationId),
    quantity: item.quantity,
    dosage: item.dosage
  }));
}

async function ensureRelatedEntitiesExist(
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

export async function createRecord(data: CreateRecordInput): Promise<Records> {
  if (
    !data.patientId ||
    !data.staffId ||
    !data.record ||
    !data.reason ||
    !data.diagnosis ||
    !data.prescription
  ) {
    throw new Error('Missing required record fields');
  }

  await ensureRelatedEntitiesExist(data.patientId, data.staffId);

  const totalPrice = await calculatePrescriptionTotal(data.prescription);
  const created = await RecordsModel.create({
    patientId: data.patientId,
    staffId: data.staffId,
    record: data.record,
    admissionDate: data.admissionDate ?? new Date(),
    dischargeDate: data.dischargeDate ?? null,
    reason: data.reason,
    diagnosis: data.diagnosis,
    prescription: normalizePrescription(data.prescription),
    totalPrice,
    status: data.status ?? Status.OPEN
  });

  return created.toObject();
}

export async function getRecords(): Promise<Records[]> {
  return RecordsModel.find().lean();
}

export async function findRecordsById(
  id: string | mongoose.Types.ObjectId
): Promise<Records | null> {
  return RecordsModel.findById(id).lean();
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

export async function updateRecordsByID(
  id: string | mongoose.Types.ObjectId,
  data: UpdateRecordInput
): Promise<Records | null> {
  const existingRecord = await RecordsModel.findById(id);
  if (!existingRecord) {
    throw new Error('Record unavailable');
  }

  if (data.patientId || data.staffId) {
    await ensureRelatedEntitiesExist(
      data.patientId ?? existingRecord.patientId,
      data.staffId ?? existingRecord.staffId
    );
  }

  const mergedPrescription = data.prescription
    ? normalizePrescription(data.prescription)
    : existingRecord.prescription;

  const totalPrice = data.prescription
    ? await calculatePrescriptionTotal(data.prescription)
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

export async function deleteRecord(id: string | mongoose.Types.ObjectId): Promise<Records | null> {
  return RecordsModel.findByIdAndDelete(id).lean();
}