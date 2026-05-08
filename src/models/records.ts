import mongoose, { Schema, model } from 'mongoose';
import { Staff } from './staff.js';
import { Medications } from './medications.js';
import { Patient } from './patient.js';

export enum TypeofRecord {
  CLINIC_VISIT = 'Consulta Ambulatoria',
  HOSPITALIZATION = 'Ingreso Hospitalario'
}

export enum Status {
  OPEN = 'abierto',
  CLOSE = 'cerrado'
}

export interface PrescriptionMedications {
  medication_id: string,
  cuantity: number;
  dosage: string;
}

export interface Records {
  _id?: mongoose.Types.ObjectId;

  patientId: string;
  staffID: string;
  record: TypeofRecord;
  admissionDate?: Date;
  reason: string;
  diagnosis: string;
  prescription: PrescriptionMedications[];
  totalPrice?: number;
  status: Status;

  createdAt?: Date;
  updatedAt?: Date;
}
const PrescriptionSchema = new Schema<PrescriptionMedications>({
  medication_id: { type: String, required: true, trim: true },
  cuantity: { type: Number, required: true, min: 0 },
  dosage: { type: String, required: true, trim: true }
});

const RecordsSchema = new Schema<Records>({
  patientId: { type: String, required: true, trim: true },
  staffID: { type: String, required: true, trim: true },
  record: { type: String, required: true, trim: true },
  admissionDate: { type: Date },
  reason: { type: String, required: true, trim: true },
  diagnosis: { type: String, required: true, trim: true },
  prescription: { type: [PrescriptionSchema], required: true, default: [] },
  totalPrice: { type: Number, default: 0 },
  status: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const RecordsModel = model<Records>('Record', RecordsSchema);

export async function createrecord(
  data: Omit<Records, '_id' | 'admissionDate' |'totalPrice' | 'createdAt' | 'updatedAt'>
): Promise<Records | null> {
  // Validar campos requeridos
  if (
    !data.patientId ||
    !data.staffID ||
    !data.record || 
    !data.reason ||
    !data.diagnosis ||
    !data.prescription ||
    !data.status
  ) {
    throw new Error('Missing required Record fields');
  }

  // Validar que los datos entregados realmente existan en la base de datos
  const exist_staff = await Staff.findById(data.staffID);
  if (!exist_staff) {
    throw new Error('The staff mentioned do not exist');
  }

  const exist_patient = await Patient.findById(data.patientId);
  if (!exist_patient) {
    throw new Error('The patient mentioned do not exist');
  }
  let price = 0;

  for (const medications of data.prescription) {
    const exist_medication = await Medications.findOne({ nationalCode: medications.medication_id });
    if (!exist_medication){
      throw new Error('The medication mentioned do not exist');
    } else if (exist_medication.stock < medications.cuantity){
      throw new Error('The medication has not enough available stock');
    } else {
      price += medications.cuantity * exist_medication.price;
      await Medications.updateOne({ nationalCode: medications.medication_id }, { $inc: { stock: -medications.cuantity } });
    }
  }
  const now = new Date();
  const created = await RecordsModel.create({ ...data, admissionDate: now, totalPrice: price, createdAt: now, updatedAt: now });
  return created.toObject();
}

export async function findRecordsById(
  id: string | mongoose.Types.ObjectId
): Promise<Records | null> {
  return RecordsModel.findById(id).lean();
}


export async function findRecordsByDates(startDate: Date, endDate: Date, register?: TypeofRecord): Promise<Records[]> {
  
  // Si no ha seleccionado un filtro por tipo de registro, se le muestran ambos tipos

  const filter: any = {
    admissionDate: { $gte: startDate, $lte: endDate }
  };
  if (register != undefined) {
    filter.record = { $regex: register };
  }
  return RecordsModel.find(filter).lean();

}

export async function findRecordsByPatient(patient: string): Promise<Records[]> {
  return RecordsModel.find({ patientId: patient }).lean();

}

export async function updateRecordsByID(id: string | mongoose.Types.ObjectId, newPrescription: PrescriptionMedications[]): Promise<void> {
  const records = await RecordsModel.findById(id);
  if (!records) throw new Error('Record unavailable');

  // Restock previous prescription
  for (const medications of records.prescription) {
    await Medications.updateOne({ nationalCode: medications.medication_id }, { $inc: { stock: medications.cuantity } });
  }

  let price = 0;
  for (const medications of newPrescription) {
    const exist_medication = await Medications.findOne({ nationalCode: medications.medication_id });
    if (!exist_medication) throw new Error('The medication mentioned do not exist');
    if (exist_medication.stock < medications.cuantity) throw new Error('The medication has not enough available stock');
    price += medications.cuantity * exist_medication.price;
    await Medications.updateOne({ nationalCode: medications.medication_id }, { $inc: { stock: -medications.cuantity } });
  }

  records.prescription = newPrescription as any;
  records.totalPrice = price;
  records.updatedAt = new Date();
  await records.save();
}