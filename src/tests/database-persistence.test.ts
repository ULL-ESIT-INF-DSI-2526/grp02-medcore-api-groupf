// import { ObjectId } from 'mongodb';
// import { beforeAll, afterAll, afterEach, describe, expect, it } from 'vitest';
// import { connectDB, disconnectDB, getDb } from '../db/database.js';
// import { createPatient } from '../models/patient.js';
// import {
//   MedicalSpecialty,
//   ProfessionalCategory,
//   StaffStatus,
//   WorkShift,
//   createStaff
// } from '../models/staff.js';

// describe('database persistence', () => {
//   const patientIdentificationNumber = `ID-${new ObjectId().toHexString()}`;
//   const patientRecordNumber = `RN-${new ObjectId().toHexString()}`;
//   const staffCollegeId = `COL-${new ObjectId().toHexString()}`;

//   beforeAll(async () => {
//     await connectDB();
//   });

//   afterEach(async () => {
//     const db = getDb();
//     await db.collection('patients').deleteMany({
//       identificationNumber: patientIdentificationNumber,
//       recordNumber: patientRecordNumber
//     });
//     await db.collection('staff').deleteMany({ collegeId: staffCollegeId });
//   });

//   afterAll(async () => {
//     await disconnectDB();
//   });

//   it('stores a patient in the database', async () => {
//     const created = await createPatient({
//       fullName: 'Ana Pérez',
//       dateOfBirth: new Date('1990-01-01'),
//       identificationNumber: patientIdentificationNumber,
//       recordNumber: patientRecordNumber,
//       gender: 'female',
//       allergies: [],
//       status: 'active'
//     });

//     expect(created).not.toBeNull();

//     const savedPatient = await getDb().collection('patients').findOne({
//       identificationNumber: patientIdentificationNumber
//     });

//     expect(savedPatient).not.toBeNull();
//     expect(savedPatient?.recordNumber).toBe(patientRecordNumber);
//     expect(savedPatient?.fullName).toBe('Ana Pérez');
//   });

//   it('stores a staff member in the database', async () => {
//     const created = await createStaff({
//       fullName: 'Dr. Luis Gómez',
//       collegeId: staffCollegeId,
//       medicalSpecialty: MedicalSpecialty.CARDIOLOGY,
//       professionalCategory: ProfessionalCategory.ATTENDING_PHYSICIAN,
//       yearsOfExperience: 12,
//       workShift: WorkShift.MORNING,
//       consultationRoomOrWard: 'Consulta 12',
//       status: StaffStatus.ACTIVE
//     });

//     expect(created).not.toBeNull();

//     const savedStaff = await getDb().collection('staff').findOne({
//       collegeId: staffCollegeId
//     });

//     expect(savedStaff).not.toBeNull();
//     expect(savedStaff?.fullName).toBe('Dr. Luis Gómez');
//     expect(savedStaff?.medicalSpecialty).toBe(MedicalSpecialty.CARDIOLOGY);
//   });
// });