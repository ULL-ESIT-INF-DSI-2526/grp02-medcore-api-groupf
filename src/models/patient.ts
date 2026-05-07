import { Document, Schema, model } from 'mongoose';

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

export interface ContactDocument {
  address: string;
  phone: string;
  email: string;
}

const ContactSchema = new Schema<ContactDocument>({
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
    // Añadir opcionalmente validador de formato para número de teléfono
  },
  email: {
    type: String,
    trim: true
    // Añadir opcionalmente validador de formato para correo electrónico
  }
});

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
  }
});

export const Patient = model<PatientDocument>('Patient', PatientSchema);