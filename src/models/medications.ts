import { ObjectId } from "mongodb";
import { getDb } from "../db/database.js";

export enum Names {
  COMERCIAL_NAME = "Nombre comercial",
  ACTIVE_INGREDIENT_NAME = "Nombre del principio activo"
}

export enum DosageForm {
  TABLET = "Comprimido",
  CAPSULE = "Cápsula",
  ORAL_SOLUTION = "Solución oral",
  INJECTABLE_SOLUTION = "Solución inyectable",
  OINTMENT = "Pomada",
  TRANSDERMAL_PATCH = "Parche transdérmico",
  INHALER = "Inhalador"
}

export enum AdministrationChannel {
  ORAL = "Oral",
  INTRAVENOUS = "Intravenosa",
  INTRAMUSCULAR = "Intramuscular",
  SUBCUTANEOUS = "Subcutánea",
  TOPICAL = "Tópica",
  INHALATION = "Inhalatoria"
}

export interface Dose {
  amount: number
  unit: string;
}

export interface Medications {
  _id?: ObjectId;
  name: Names;
  nationalCode: string; // unico en el sistema
  dosageForm: DosageForm;
  standarDose: Dose;
  channel: AdministrationChannel;
  stock: number;
  price: number;
  prescription: boolean;
  expiryDate: Date;
  contraindications: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const COLLECTION = "Medications";
  
function col() {
  return getDb().collection<Medications>(COLLECTION);
}

export async function ensureMedicationIndexes(): Promise<void> {
  const c = col();
  await c.createIndex({ nationalCode: 1234567 }, { unique: true });
}

export async function createMedic(data: Omit<Medications, "_id" | "createdAt" | "updatedAt">): Promise<Medications | null> {
  if (!data.name || 
    !data.nationalCode || 
    !data.dosageForm || 
    !data.standarDose || 
    !data.channel || 
    !data.stock || 
    !data.price || 
    !data.prescription || 
    !data.expiryDate || 
    !data.contraindications) {
    throw new Error("Missing required medications fields");
  }

  const c = col();
  const exists = await c.findOne({
    $or: [{ nationalCode: data.nationalCode }],
  });

  if (exists) {
    throw new Error("A medication with the same nationalCode already exists");
  }

  // Validaciones de valores inferiores al mínimo
  if (data.stock < 0) {
    throw new Error('Stock cannot be negative');
  }
  if (data.price < 5) {
    throw new Error('Price cannot be lower than 5 euros');
  }
  if (data.standarDose.amount < 0) {
    throw new Error('The amount of dose cannot be negative');
  }
  if (isNaN(data.expiryDate.getTime())){
    throw new Error('Not a valid expiration date')
  }
  const today = new Date()
  if (today >= data.expiryDate){
    throw new Error('Cannot include a expired medication')
  }



  const now = new Date();
  const res = await c.insertOne({ ...data, createdAt: now, updatedAt: now });
  return c.findOne({ _id: res.insertedId });
}

export async function findMedicationtById(id: string | ObjectId): Promise<Medications | null> {
  const _id = typeof id === "string" ? new ObjectId(id) : id;
  return col().findOne({ _id });
}

export async function findMedicationtByComercialName(Name: string) {
  return col().findOne({Name});
}
export async function findMedicationtByActiveIngredient(Name: string) {
  return col().findOne({Name});
}
export async function findMedicationtByNationalCode(nationalCode: string){
  return col().findOne({nationalCode});
}