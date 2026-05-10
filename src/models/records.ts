import { Schema, model, Types } from 'mongoose';

/**
 * Record's type
 */
export enum TypeofRecord {
  CLINIC_VISIT = 'Consulta Ambulatoria',
  HOSPITALIZATION = 'Ingreso Hospitalario'
}
/**
 * Current status
 */
export enum Status {
  OPEN = 'abierto',
  CLOSE = 'cerrado'
}
/**
 * Represents a medication prescription
 */
export interface PrescriptionMedications {
  /**
   * Id of the medication
   */
  medicationId: Types.ObjectId;
  /**
   * Numbers of units prescribed
   */
  quantity: number;
  /**
   * Specific isntructions of the dose
   */
  dosage?: string;
}
/**
 * Represents a 
 */
export interface PrescriptionInput {
  /**
   * Id of the medication
   */
  nationalCode: string;
  /**
   * Numbers of units prescribed
   */
  quantity: number;
  /**
   * Specific isntructions of the dose
   */
  dosage?: string;
}
/**
 * Represents a medical record
 */
export interface Records {
  /**
   * MongoDB document identifier
   */
  _id?: Types.ObjectId;
  /**
   * Patient Identification number
   */
  patientId: Types.ObjectId;
  /**
   * Staff member responsible for this record
   */
  staffId: Types.ObjectId;
  /**
   * Type of medical record
   */
  record: TypeofRecord;
  /**
   * Patient admission date
   */
  admissionDate: Date;
  /**
   * Patient discharge date
   */
  dischargeDate?: Date | null;
  /**
   * Reason of the admission
   */
  reason: string;
  /**
   * Medical diagnosis 
   */
  diagnosis: string;
  /**
   * List of medications prescribed in the record
   */
  prescription: PrescriptionMedications[];
  /**
   * Total cost of the prescribed medications
   */
  totalPrice: number;
  /**
   * Current status of the medical record
   */
  status: Status;
  /**
   * Marks when the document was created 
   */
  createdAt?: Date;
  /**
   * Marks when the document was updated 
   */
  updatedAt?: Date;
}

/**
 * Input shape for creating a new medical record
 */
export interface CreateRecordInput {
  /**
   * Patient Identification number
   */
  patientIdentificationNumber: string;
  /**
   * Staff member responsible for this record
   */
  staffCollegeId: string;
  /**
   * Type of medical record
   */
  record: TypeofRecord;
  /**
   * Patient admission date
   */
  admissionDate?: Date;
  /**
   * Patient discharge date
   */
  dischargeDate?: Date | null;
  /**
   * Reason of the admission
   */
  reason: string;
  /**
   * Medical diagnosis
   */
  diagnosis: string;
  /**
   * List of medications prescribed in the record
   */
  prescription: PrescriptionInput[];
  /**
   * Current status of the medical record
   */
  status?: Status;
}

/**
 * Input shape for an update from an existing medical record
 */
export interface UpdateRecordInput {
  /**
   * Patient Identification number
   */
  patientId?: string | Types.ObjectId;
  /**
   * Staff member responsible for this record
   */
  staffId?: string | Types.ObjectId;
  /**
   * Type of medical record
   */
  record?: TypeofRecord;
  /**
   * Patient admission date
   */
  admissionDate?: Date;
  /**
   * Patient discharge date
   */
  dischargeDate?: Date | null;
  /**
   * Reason of the admission
   */
  reason?: string;
  /**
   * Medical diagnosis
   */
  diagnosis?: string;
  /**
   * List of medications prescribed in the record
   */
  prescription?: Array<{
    medicationId: string | Types.ObjectId;
    quantity: number;
    dosage: string;
  }>;
  /**
   * Current status of the medical record
   */
  status?: Status;
}

const PrescriptionSchema = new Schema<PrescriptionMedications>(
  {
    /**
     * Reference to the 'Medication' collection
     */
    medicationId: { type: Schema.Types.ObjectId, ref: 'Medications', required: true },
    /**
     * Number of units prescribed. Min 1
     */
    quantity: { type: Number, required: true, min: 1 },
    /**
     * Optional dose instruction
     */
    dosage: { type: String, required: false, trim: true }
  },
  { _id: false }
);

const RecordsSchema = new Schema<Records>(
  {
    /**
     * Reference to the 'Patient' collection
     */
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    /**
     * Reference to the 'Staff' collection
     */
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    /**
     * Type of record
     * Validated from the enum TypeofRecord
     */
    record: { type: String, required: true, enum: Object.values(TypeofRecord) },
    /**
     * Patient admission date
     */
    admissionDate: { type: Date, default: Date.now },
    /**
     * Patient discharge date
     */
    dischargeDate: { type: Date, default: null },
    /**
     * Clinical reason for the record
     */
    reason: { type: String, required: true, trim: true },
    /**
     * Medical diagnosis
     */
    diagnosis: { type: String, required: true, trim: true },
    /**
     * List of medications prescribed in the record
     */
    prescription: { type: [PrescriptionSchema], required: true, default: [] },
    /**
     * Total cost of the prescribed medications
     */
    totalPrice: { type: Number, required: true, default: 0, min: 0 },
    /**
     * Current status of the medical record
     */
    status: { type: String, required: true, enum: Object.values(Status), default: Status.OPEN }
  },
  {
    timestamps: true,
    collection: 'records'
  }
);

export const RecordsModel = model<Records>('Record', RecordsSchema);