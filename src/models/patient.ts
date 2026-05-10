import { Document, Schema, model } from 'mongoose';
import { ContactDocument, ContactSchema } from '../schema/contact.js';
import validator from 'validator';

/**
 * Valid Blood Groops
 */
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
/**
 * Valid Genders
 */
enum Gender{
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNKNOWN = 'unknown'
}
/**
 * Current status of the patient
 */
enum PatientStatus {
  ACTIVE = 'active',
  TEMPORARY_LEAVE = 'temporary_leave',
  DECEASED = 'deceased'
}
/**
 * Represents patient document
 */
export interface PatientDocument extends Document {
  /**
   * Full name of the patient
   */
  fullName: string;
  /**
   * Birth Date of the patient
   */
  dateOfBirth: Date;
  /**
   * Identification Number (DNI, Passport).
   * Must be unique
   */
  identificationNumber: string;
  /**
   * Social security or clinical record number
   * Must be unique
   */
  recordNumber: string; 
  /**
   * Gender of the patient
   */
  gender: Gender;
  /**
   * Patient's contact details
   */
  contact: ContactDocument;
  /**
   * Patient's allergies
   */
  allergies: string[];
  /**
   * Patient's blood group
   */
  bloodGroup: BloodGroup;
  /**
   * Patient's current status
   */
  status: PatientStatus;
  /**
   * Marks when the document was created 
   */
  createdAt: Date;
  /**
   * Marks when the document was updated 
   */
  updatedAt: Date;
}

const PatientSchema = new Schema<PatientDocument>({
  /**
   * Full legal name of the patient.
   * Trimmed
   */
  fullName: { 
    type: String, 
    required: true,
    trim: true
  },
  /**
   * Patient's Date of birth
   */
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: (value: Date) => value < new Date(),
      message: 'Date of birth must be in the past'
    }
  },
  /**
   * National ID or passport number of the patient.
   * Must be unique.
   */
  identificationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: (value: string) => {
      if(!validator.isIdentityCard(value, 'any') && !validator.isPassportNumber(value, 'any')) {
        throw new Error('Identification number must be a valid ID or Passport');
      }
    }
  },
  /**
   * Internal medical record number assigned to the patient.
   * Must be unique and alphanumeric. 
   * Validated with `validator.isAlphanumeric`. 
   */
  recordNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: (value: string) => {
      if (!validator.isAlphanumeric(value)) {
        throw new Error('Record number must be alphanumeric');
      }
    }
  },
  /**
   * Gender of the patient
   */
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
  /**
   * Patient's contact details
   */
  contact: {
    type: ContactSchema,
    trim: true
  },
  /**
   * List of known allergies for the patient.
   * Defaults to an empty array if not provided.
   */
  allergies: {
    type: [String],
    default: [],
    trim: true
  },
  /**
   * Blood group of the patient
   */
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
  /**
   * Current status of the patient
   */
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
});

export const Patient = model<PatientDocument>('Patient', PatientSchema);