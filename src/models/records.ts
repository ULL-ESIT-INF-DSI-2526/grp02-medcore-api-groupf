import { Schema, model, Types } from 'mongoose';

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
  dosage?: string;
}

export interface PrescriptionInput {
  nationalCode: string;
  quantity: number;
  dosage?: string;
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
  patientIdentificationNumber: string;
  staffCollegeId: string;
  record: TypeofRecord;
  admissionDate?: Date;
  dischargeDate?: Date | null;
  reason: string;
  diagnosis: string;
  prescription: PrescriptionInput[];
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
    dosage: { type: String, required: false, trim: true }
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