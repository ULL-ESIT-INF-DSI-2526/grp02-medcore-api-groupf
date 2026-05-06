import { ObjectId } from "mongodb";
import { getDb } from "../db/database.js";

export interface Medic {
  _id?: ObjectId;
  fullName: string;
  collegueNumber: string;   // 9 numbers, unique
  specialism: 'General Practice' | 'Cardiology' | 'Traumatology' | 'Paediatrics' | 'Oncology' | 'ER';
  category: 'Assistant doctor' | 'Junior doctor' | 'Nurse' | 'Nursing assistant' | 'Head of department';
  shift?: 'Morning' | 'Afternoon' | 'Evening' | 'Rotating';
  roomNumber?: string;
  experience: number;
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  status: 'Active' | 'Inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

const COLLECTION = "Medics";
  
function col() {
  return getDb().collection<Medic>(COLLECTION);
}

export async function ensureMedicIndexes(): Promise<void> {
  const c = col();
  await c.createIndex({ collegeNumber: 123456789 }, { unique: true });
}

export async function createMedic(data: Omit<Medic, "_id" | "createdAt" | "updatedAt">): Promise<Medic | null> {
  if (!data.fullName || !data.collegueNumber || !data.specialism || !data.category || !data.experience || !data.status) {
    throw new Error("Missing required medic fields");
  }

  const c = col();
  const exists = await c.findOne({
    $or: [{ collegueNumber: data.collegueNumber }],
  });

  if (exists) {
    throw new Error("A medic with the same collegeNumber already exists");
  }

  // Comprobaciones extras


  const now = new Date();
  const res = await c.insertOne({ ...data, createdAt: now, updatedAt: now });
  return c.findOne({ _id: res.insertedId });
}

export async function findMedictById(id: string | ObjectId): Promise<Medic | null> {
  const _id = typeof id === "string" ? new ObjectId(id) : id;
  return col().findOne({ _id });
}