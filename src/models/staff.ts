import { Document, Schema, model } from 'mongoose';
import { ContactDocument, ContactSchema } from '../schema/contact.js';
import validator from 'validator';

/**
 * Medical Specialties.
 * This enum can be extended by the team
 */
export enum MedicalSpecialty {
  GENERAL_MEDICINE = 'Medicina General',
  PEDIATRICS = 'Pediatría',
  CARDIOLOGY = 'Cardiología',
  TRAUMATOLOGY = 'Traumatología',
  ONCOLOGY = 'Oncología',
  EMERGENCY_MEDICINE = 'Urgencias',
  DERMATOLOGY = 'Dermatología',
  NEUROLOGY = 'Neurología',
  ORTHOPEDICS = 'Ortopedia',
  PSYCHIATRY = 'Psiquiatría',
  RADIOLOGY = 'Radiología',
  SURGERY = 'Cirugía',
  GASTROENTEROLOGY = 'Gastroenterología',
  RHEUMATOLOGY = 'Reumatología',
  NEPHROLOGY = 'Nefrología'
}

// Categorías profesionales
/**
 * Professional categories for medical staff members
 */
export enum ProfessionalCategory {
  ATTENDING_PHYSICIAN = 'Médico/a adjunto/a',
  RESIDENT_PHYSICIAN = 'Médico/a residente',
  NURSE = 'Enfermero/a',
  NURSING_ASSISTANT = 'Auxiliar de enfermería',
  SERVICE_HEAD = 'Jefe/a de servicio',
  MEDICAL_DIRECTOR = 'Director/a médico',
  OTHER = 'Otro'
}

/**
 * Wotk shifts
 */
export enum WorkShift {
  MORNING = 'Mañana',
  AFTERNOON = 'Tarde',
  NIGHT = 'Noche',
  ROTATING = 'Rotativo'
}

/**
 * Employment status
 */
export enum StaffStatus {
  ACTIVE = 'activo',
  INACTIVE = 'inactivo'
}

/**
 * Represents a medical staff member
 */
export interface StaffDocument extends Document {
  /**
   * Full legal name
   */
  fullName: string;
  /**
   * Professional collegue ID
   * Must be unique
   */
  collegeId: string;
  /**
   * Medical specialty 
   */
  medicalSpecialty: MedicalSpecialty;
  /**
   * Professional Role
   */
  professionalCategory: ProfessionalCategory;
  /**
   * Assigned work shift 
   */
  workShift: WorkShift;
  /**
   * Current employment status
   */
  status: StaffStatus;
  /**
   * Consultation room or number assigned
   */
  consultNumber: string;
  /**
   * Number of years of experience
   */
  yearsOfExperience: number;
  /**
   * Staff's contact details
   */
  contactInfo: ContactDocument;
  /**
   * Marks when the document was created 
   */
  createdAt: Date;
  /**
   * Marks when the document was updated 
   */
  updatedAt: Date;
}

const StaffSchema = new Schema<StaffDocument>({
  /**
   * Full legal name
   * Trimmed
   */
  fullName: { 
    type: String, 
    required: true,
    trim: true
  },
  /**
   * Professional college ID
   * Must be exactly 9 numeric digits.
   * Must be unique.
   * Validated by 'validator.isNumeric'
   * Trimmed
   */
  collegeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 9,
    maxlength: 9,
    validate: (value: string) => {
      if (!validator.isNumeric(value)) {
        throw new Error('College ID must be numeric');
      }
    }
  },
  /**
   * Medical specialty
   * Must match MediclaSpecialty
   * Trimmed
   */
  medicalSpecialty: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      const validSpecialties = Object.values(MedicalSpecialty);
      if (!validSpecialties.includes(value as MedicalSpecialty)) {
        throw new Error(`Medical specialty must be one of: ${validSpecialties.join(', ')}`);
      }
    }
  },
  /**
   * Professional role
   * Must match ProfessionalCategory
   * Trimmed
   */
  professionalCategory: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      const validCategories = Object.values(ProfessionalCategory);
      if (!validCategories.includes(value as ProfessionalCategory)) {
        throw new Error(`Professional category must be one of: ${validCategories.join(', ')}`);
      }
    }
  },
  /**
   * Assigned work shift
   * Must match WorkShift
   * Trimmed
   */
  workShift: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      const validShifts = Object.values(WorkShift);
      if (!validShifts.includes(value as WorkShift)) {
        throw new Error(`Work shift must be one of: ${validShifts.join(', ')}`);
      }
    }
  },
  /**
   * Current status
   * Must match StaffStatus
   * Trimmed
   */
  status: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      const validStatuses = Object.values(StaffStatus);
      if (!validStatuses.includes(value as StaffStatus)) {
        throw new Error(`Staff status must be one of: ${validStatuses.join(', ')}`);
      }
    }
  },
  /**
   * Consultation room or number assigned.
   * Trimmed
   */
  consultNumber: {
    type: String,
    required: true,
    trim: true
  },
  /**
   * Number of year of experience.
   * Must be a non-negative integer.
   * Validated by 'Number.isInteger' 
   */
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0,
    validate: (value: number) => {
      if (!Number.isInteger(value)) {
        throw new TypeError('Years of experience must be an integer');
      }
    }
  },
  /**
   * Staff' contact details
   */
  contactInfo: {
    type: ContactSchema,
    trim: true
  },
  /**
   * Marks when the document was created 
   */
  createdAt: {
    type: Date,
    default: Date.now
  },
  /**
   * Marks when the document was updated 
   */
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'staff'
});

export const Staff = model<StaffDocument>('Staff', StaffSchema);