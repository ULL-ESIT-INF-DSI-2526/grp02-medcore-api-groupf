import { ObjectId } from 'mongodb';
import { getDb } from '../db/database.js';

// Especialidades médicas - El equipo puede ampliar este enum según sea necesario
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
export enum ProfessionalCategory {
  ATTENDING_PHYSICIAN = 'Médico/a adjunto/a',
  RESIDENT_PHYSICIAN = 'Médico/a residente',
  NURSE = 'Enfermero/a',
  NURSING_ASSISTANT = 'Auxiliar de enfermería',
  SERVICE_HEAD = 'Jefe/a de servicio',
  MEDICAL_DIRECTOR = 'Director/a médico',
  OTHER = 'Otro'
}

// Turnos de trabajo
export enum WorkShift {
  MORNING = 'Mañana',
  AFTERNOON = 'Tarde',
  NIGHT = 'Noche',
  ROTATING = 'Rotativo'
}

// Estado del personal
export enum StaffStatus {
  ACTIVE = 'activo',
  INACTIVE = 'inactivo'
}

export interface ContactInfoDepartment {
  address: string;
  phone: string;
  email: string;
}

export interface Staff {
  _id?: ObjectId;
  // Datos básicos
  fullName: string;
  collegeId: string; // Único en el sistema

  medicalSpecialty: MedicalSpecialty;
  professionalCategory: ProfessionalCategory;
  yearsOfExperience: number;
  workShift: WorkShift;
  consultationRoomOrWard?: string; // Número de consulta o planta
  departmentContact?: ContactInfoDepartment;
  status: StaffStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const COLLECTION = 'staff';

function col() {
  return getDb().collection<Staff>(COLLECTION);
}

export async function ensureStaffIndexes(): Promise<void> {
  const c = col();
  await c.createIndex({ collegeId: 1 }, { unique: true });
}

export async function createStaff(
  data: Omit<Staff, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Staff | null> {
  // Validar campos requeridos
  if (
    !data.fullName ||
    !data.collegeId ||
    !data.medicalSpecialty ||
    !data.professionalCategory ||
    data.yearsOfExperience === undefined ||
    !data.workShift ||
    !data.status
  ) {
    throw new Error('Missing required staff fields');
  }

  // Validar que yearsOfExperience sea no negativo
  if (data.yearsOfExperience < 0) {
    throw new Error('Years of experience cannot be negative');
  }

  const c = col();
  const exists = await c.findOne({ collegeId: data.collegeId });

  if (exists) {
    throw new Error('A staff member with this collegeId already exists');
  }

  const now = new Date();
  const res = await c.insertOne({ ...data, createdAt: now, updatedAt: now });
  return c.findOne({ _id: res.insertedId });
}

export async function findStaffById(
  id: string | ObjectId
): Promise<Staff | null> {
  const _id = typeof id === 'string' ? new ObjectId(id) : id;
  return col().findOne({ _id });
}

// Buscar por nombre (query string)
export async function findStaffByName(name: string): Promise<Staff[]> {
  return col()
    .find({
      fullName: { $regex: name, $options: 'i' } // Case-insensitive search
    })
    .toArray();
}

// Buscar por número de colegiado
export async function findStaffByCollegeId(
  collegeId: string
): Promise<Staff | null> {
  return col().findOne({ collegeId });
}
