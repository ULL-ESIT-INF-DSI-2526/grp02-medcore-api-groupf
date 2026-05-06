import { ObjectId } from 'mongodb';
import { getDb } from '../db/database.js';

export type BloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | '0+'
  | '0-';
export type Gender = 'male' | 'female' | 'other' | 'unknown';
export type PatientStatus = 'active' | 'temporary_leave' | 'deceased';

export interface Patient {
  _id?: ObjectId;
  fullName: string;
  dateOfBirth: Date;
  identificationNumber: string; // DNI / Passport - unique
  recordNumber: string; // Social security or clinical record number - unique
  gender: Gender;
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  allergies: string[];
  bloodGroup?: BloodGroup;
  status: PatientStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const COLLECTION = 'patients';

function col() {
  return getDb().collection<Patient>(COLLECTION);
}

const ALLOWED_BLOOD: BloodGroup[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  '0+',
  '0-'
];

export async function ensurePatientIndexes(): Promise<void> {
  const c = col();
  await c.createIndex({ identificationNumber: 1 }, { unique: true });
  await c.createIndex({ recordNumber: 1 }, { unique: true });
}

export async function createPatient(
  data: Omit<Patient, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Patient | null> {
  if (
    !data.fullName ||
    !data.dateOfBirth ||
    !data.identificationNumber ||
    !data.recordNumber ||
    !data.gender
  ) {
    throw new Error('Missing required patient fields');
  }

  if (data.bloodGroup && !ALLOWED_BLOOD.includes(data.bloodGroup)) {
    throw new Error('Invalid blood group');
  }

  const c = col();
  const exists = await c.findOne({
    $or: [
      { identificationNumber: data.identificationNumber },
      { recordNumber: data.recordNumber }
    ]
  });

  if (exists) {
    throw new Error(
      'A patient with the same identificationNumber or recordNumber already exists'
    );
  }

  const now = new Date();
  const res = await c.insertOne({ ...data, createdAt: now, updatedAt: now });
  return c.findOne({ _id: res.insertedId });
}

export async function findPatientById(
  id: string | ObjectId
): Promise<Patient | null> {
  const _id = typeof id === 'string' ? new ObjectId(id) : id;
  return col().findOne({ _id });
}
