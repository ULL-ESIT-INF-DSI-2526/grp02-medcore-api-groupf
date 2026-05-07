import { Document, Schema, model } from 'mongoose';
import { ContactDocument, ContactSchema } from '../schema/contact.js';

enum BloodGroup {
  A_POS = 'A+',
  A_NEG = 'A-',
  B_POS = 'B+',
  B_NEG = 'B-',
  AB_POS = 'AB+',
  AB_NEG = 'AB-',
  O_POS = '0+',
  O_NEG = '0-'
}

enum Gender{
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNKNOWN = 'unknown'
}

enum PatientStatus {
  ACTIVE = 'active',
  TEMPORARY_LEAVE = 'temporary_leave',
  DECEASED = 'deceased'
}

export interface PatientDocument extends Document {
  fullName: string;
  dateOfBirth: Date;
  identificationNumber: string; // DNI / Passport - unique
  recordNumber: string; // Social security or clinical record number - unique
  gender: Gender;
  contact: ContactDocument;
  allergies: string[];
  bloodGroup: BloodGroup;
  status: PatientStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<PatientDocument>({
  fullName: { 
    type: String, 
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: (value: Date) => value < new Date(),
      message: 'Date of birth must be in the past'
    }
  },
  identificationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
    // Añadir opcinalmente validador de formato para DNI, pasaporte u otro documento
  },
  recordNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
    // Añadir opcinalmente validador de formato para número de seguridad social o número de historia clínica
  },
  gender: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      const validGender = Object.values(Gender);
      if (!validGender.includes(value as Gender)) {
        throw new Error(`Gender must be one of: ${validGender.join(', ')}`);
      }
    }
  },
  contact: {
    type: ContactSchema,
    trim: true
  },
  allergies: {
    type: [String],
    default: [],
    trim: true
  },
  bloodGroup: {
    type: String,
    trim: true,
    validate: (value: string) => {
      const validBloodGroups = Object.values(BloodGroup);
      if (!validBloodGroups.includes(value as BloodGroup)) {
        throw new Error(`Blood group must be one of: ${validBloodGroups.join(', ')}`);
      }
    }
  },
  status: {
    type: String,
    trim: true,
    validate: (value: string) => {
      const validStatuses = Object.values(PatientStatus);
      if (!validStatuses.includes(value as PatientStatus)) {
        throw new Error(`Patient status must be one of: ${validStatuses.join(', ')}`);
      }
    }
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

export const Patient = model<PatientDocument>('Patient', PatientSchema);