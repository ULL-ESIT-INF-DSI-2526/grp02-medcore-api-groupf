import { Document, Schema, model } from 'mongoose';
import { ContactDocument, ContactSchema } from '../schema/contact.js';

// Especialidades médicas - El equipo puede ampliar este enum según sea necesario
enum MedicalSpecialty {
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
enum ProfessionalCategory {
  ATTENDING_PHYSICIAN = 'Médico/a adjunto/a',
  RESIDENT_PHYSICIAN = 'Médico/a residente',
  NURSE = 'Enfermero/a',
  NURSING_ASSISTANT = 'Auxiliar de enfermería',
  SERVICE_HEAD = 'Jefe/a de servicio',
  MEDICAL_DIRECTOR = 'Director/a médico',
  OTHER = 'Otro'
}

// Turnos de trabajo
enum WorkShift {
  MORNING = 'Mañana',
  AFTERNOON = 'Tarde',
  NIGHT = 'Noche',
  ROTATING = 'Rotativo'
}

// Estado del personal
enum StaffStatus {
  ACTIVE = 'activo',
  INACTIVE = 'inactivo'
}

export interface StaffDocument extends Document {
  fullName: string;
  collegeId: string; // Único en el sistema

  medicalSpecialty: MedicalSpecialty;
  professionalCategory: ProfessionalCategory;
  workShift: WorkShift;
  status: StaffStatus;
  contactInfo: ContactDocument;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<StaffDocument>({
  fullName: { 
    type: String, 
    required: true,
    trim: true
  },
  collegeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
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
  contactInfo: {
    type: ContactSchema,
    trim: true
   },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const Staff = model<StaffDocument>('Staff', StaffSchema);