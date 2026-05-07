import { ObjectId } from 'mongodb';
import { getDb } from '../db/database.js';
import { findStaffByCollegeId } from './staff.js';
import { findPatientByIdentificationNumber } from './patient.js';
import { findMedicationtByNationalCode, updateMedicationStockbyNationalCode } from './medications.js';

export enum TypeofRecord {
  CLINIC_VISIT = 'Consulta Ambulatoria',
  HOSPITALIZATION = 'Ingreso Hospitalario'
}

export enum Status {
  OPEN = 'abierto',
  CLOSE = 'cerrado'
}

export interface PrescriptionMedications {
  medication_id: string,
  cuantity: number;
  dosage: string;
}

export interface Records {
  _id?: ObjectId;

  patientId: string;
  staffID: string;
  record: TypeofRecord;
  admissionDate?: Date | undefined;
  reason: string;
  diagnosis: string;
  prescription: PrescriptionMedications[];
  totalPrice?: number;
  status: Status;

  createdAt?: Date;
  updatedAt?: Date;
}

const COLLECTION = 'records';

function col() {
  return getDb().collection<Records>(COLLECTION);
}


export async function createrecord(
  data: Omit<Records, '_id' | 'admissionDate' |'totalPrice' | 'createdAt' | 'updatedAt'>
): Promise<Records | null> {
  // Validar campos requeridos
  if (
    !data.patientId ||
    !data.staffID ||
    !data.record || 
    !data.reason ||
    !data.diagnosis ||
    !data.prescription ||
    !data.status
  ) {
    throw new Error('Missing required Record fields');
  }

  // Validar que los datos entregados realmente existan en la base de datos
  
  const exist_staff = await findStaffByCollegeId(data.staffID);

  if (!exist_staff){
    throw new Error('The staff mentioned do not exist');
  }

  const exist_patient = await findPatientByIdentificationNumber(data.patientId);
  
  if (!exist_patient){
    throw new Error('The patient mentioned do not exist');
  }
  let price = 0;

  for (const medications of data.prescription) {
    const exist_medication = await findMedicationtByNationalCode(medications.medication_id)
    if (!exist_medication){
      throw new Error('The medication mentioned do not exist');
    } else if(exist_medication.stock < medications.cuantity){
      throw new Error('The medication has not enough available stock');
    } else {
      price += medications.cuantity * exist_medication.price;
      await updateMedicationStockbyNationalCode(medications.medication_id, -medications.cuantity);
    }
  }


  const c = col();

  const now = new Date();
  const res = await c.insertOne({ ...data, admissionDate: now ,totalPrice: price, createdAt: now, updatedAt: now });
  return c.findOne({ _id: res.insertedId });
}

export async function findRecordsById(
  id: string | ObjectId
): Promise<Records | null> {
  const _id = typeof id === 'string' ? new ObjectId(id) : id;
  return col().findOne({ _id });
}


export async function findRecordsByDates(startDate: Date, endDate: Date, register?: TypeofRecord): Promise<Records[]> {
  
  // Si no ha seleccionado un filtro por tipo de registro, se le muestran ambos tipos

  if (register == undefined) {
    return col().find({
      admissionDate: { 
        $gte: startDate,              // Greater or equal than start Date
        $lte: endDate                 // Less or equal than end Date
      }
    }).toArray()
  }

  // Si no, se le muestra por el filtro

  return col().find({
    admissionDate: { 
      $gte: startDate, 
      $lte: endDate
    },
    record: {
      $regex: register
    }
  }).toArray()

}

export async function findRecordsByPatient(patient: string): Promise<Records[]> {

  return col().find({
    patientId: patient
  }).toArray()

}

export async function updateRecordsByID(id: string | ObjectId, newPrescription: PrescriptionMedications[]): Promise<void> {
  const records = await findRecordsById(id);
  if (records == undefined){
    throw new Error('Record unaviable');
  } else {
    let price = 0;
    // Stock actualizado con los medicamentos cambiados
    for (const medications of records.prescription) {
      const actual_medication = await findMedicationtByNationalCode(medications.medication_id);
      await updateMedicationStockbyNationalCode(medications.medication_id, medications.cuantity);
    }

    for (const medications of newPrescription) {
      const exist_medication = await findMedicationtByNationalCode(medications.medication_id)
      if (!exist_medication){
        throw new Error('The medication mentioned do not exist');
      } else if(exist_medication.stock < medications.cuantity){
        throw new Error('The medication has not enough available stock');
      } else {
        price += medications.cuantity * exist_medication.price;
        await updateMedicationStockbyNationalCode(medications.medication_id, -medications.cuantity);
      }
    }

    const c = col();
    const now = new Date();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    c.updateOne(
      {_id: _id}, 
      {
        $set: {
          prescription: newPrescription,
          totalPrice: price,
          updatedAt: now
        }
      } 
    )
  }
}