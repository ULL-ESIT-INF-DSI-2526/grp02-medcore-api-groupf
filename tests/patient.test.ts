import { ObjectId } from 'mongodb';
import { describe, test, beforeAll, beforeEach, afterAll, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/db/database.js';
import { Patient } from '../src/models/patient.js';

let createdPatientId = '';
let patientCounter = 0;

describe('Patient API', () => {
  beforeAll(async() => {
    await connectDB();
  });

  beforeEach(async() => {
    await Patient.deleteMany({});
    patientCounter += 1;
    const recordNumber = `RN${String(patientCounter).padStart(6, '0')}`;

    const patientData = {
      fullName: `Patient ${patientCounter}`,
      dateOfBirth: '1990-01-01',
      identificationNumber: '12345678Z',
      recordNumber,
      gender: 'male',
      contact: {
        address: '123 Main St',
        phone: '+34612345678',
        email: `patient${patientCounter}@gmail.com`
      },
      allergies: ['Peanuts'],
      bloodGroup: 'A+',
      status: 'active'
    };

    const response = await request(app)
      .post('/patients')
      .send(patientData)
      .expect(201);

    createdPatientId = response.body._id;
  })

  afterAll(async () => {
    await request(app)
      .delete(`/patients/`)
      .expect(200);

    await disconnectDB();
  });

  test("should create a new patient", async () => {
    expect(createdPatientId).not.toBe("");
    await request(app)
      .get(`/patients/${createdPatientId}`)
      .expect(200)
      .then((response) => {
        expect(response.body.fullName).toBe(`Patient ${patientCounter}`);
      });
  });

  test("should try create a new patient and catch status error 409", async () => {
    const invalidPatientData = {
      fullName: `Patient ${patientCounter + 1}`,
      dateOfBirth: '1990-01-01',
      identificationNumber: '12345678Z',
      recordNumber: `RN${String(patientCounter + 1).padStart(6, '0')}`,
      gender: 'male',
      contact: {
        address: '123 Main St',
        phone: '+34612345678',
        email: `patient${patientCounter + 1}@gmail.com`
      },
      allergies: ['Peanuts'],
      bloodGroup: 'A+',
      status: 'active'
    };

    await request(app)
      .post('/patients')
      .send(invalidPatientData)
      .expect(409);
  });

  test("should get all patients", async () => {
    const patientData = {
      fullName: `Patient ${patientCounter + 1}`,
      dateOfBirth: '1990-01-01',
      identificationNumber: '00000000T',
      recordNumber: `RN${String(patientCounter + 1).padStart(6, '0')}`,
      gender: 'male',
      contact: {
        address: '123 Main St',
        phone: '+34612345678',
        email: `patient${patientCounter + 1}@gmail.com`
      },
      allergies: ['Peanuts'],
      bloodGroup: 'A+',
      status: 'active'
    };

    await request(app)
      .post('/patients')
      .send(patientData)
      .expect(201);

    await request(app)
      .get('/patients')
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
      });
  });

  test("should try get all patients and catch status error 400", async () => {
    vi.spyOn(Patient, 'find').mockRejectedValueOnce(new Error('Database error'));

    await request(app)
      .get('/patients')
      .expect(500);
  });

  test("should try get a patient by id and catch status error 404", async () => {
    const missingPatientId = new ObjectId().toString();

    await request(app)
      .get(`/patients/${missingPatientId}`)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe('Patient not found');
      });
  });

  test("should try get a patient by id and catch status error 400", async () => {
    const invalidPatientId = 'invalid-id';

    await request(app)
      .get(`/patients/${invalidPatientId}`)
      .expect(400);
  });

  test("should update a patient", async () => {
    const updatedData = {
      fullName: `Updated Patient ${patientCounter}`,
      dateOfBirth: '1990-01-01',
      identificationNumber: '12345678Z',
      recordNumber: `RN${String(patientCounter).padStart(6, '0')}`,
      gender: 'male',
      contact: {
        address: '123 Main St',
        phone: '+34612345678',
        email: `updatedpatient${patientCounter}@gmail.com`
      },
      allergies: ['Peanuts'],
      bloodGroup: 'A+',
      status: 'active'
    };

    await request(app)
      .put(`/patients/${createdPatientId}`)
      .send(updatedData)
      .expect(200);
  });

  test("should try update a patient and catch status error 404", async () => {
    const missingPatientId = new ObjectId().toString();
    const updatedData = {
      fullName: `Updated Patient ${patientCounter}`,
      dateOfBirth: '1990-01-01',
      identificationNumber: '12345678Z',
      recordNumber: `RN${String(patientCounter).padStart(6, '0')}`,
      gender: 'male',
      contact: {
        address: '123 Main St',
        phone: '+34612345678',
        email: `updatedpatient${patientCounter}@gmail.com`
      },
      allergies: ['Peanuts'],
      bloodGroup: 'A+',
      status: 'active'
    };

    await request(app)
      .put(`/patients/${missingPatientId}`)
      .send(updatedData)
      .expect(404);
  });

  test("should try update a patient and catch status error 400", async () => {
    const invalidPatientId = 'invalid-id';
    const updatedData = {
      fullName: `Updated Patient ${patientCounter}`,
      dateOfBirth: '1990-01-01',
      identificationNumber: '12345678Z',
      recordNumber: `RN${String(patientCounter).padStart(6, '0')}`,
      gender: 'male',
      contact: {
        address: '123 Main St',
        phone: '+34612345678',
        email: `updatedpatient${patientCounter}@gmail.com`
      },
      allergies: ['Peanuts'],
      bloodGroup: 'A+',
      status: 'active'
    };

    await request(app)
      .put(`/patients/${invalidPatientId}`)
      .send(updatedData)
      .expect(400);
  });

  test("should try delete all patients and catch status error 400", async () => {
    vi.spyOn(Patient, 'deleteMany').mockRejectedValueOnce(new Error('Database error'));

    await request(app)
      .delete('/patients')
      .expect(500);
  });

  test("should delete a patient by id", async () => {
    await request(app)
      .delete(`/patients/${createdPatientId}`)
      .expect(200);
  });

  test("should try delete a patient by id and catch status error 404", async () => {
    const missingPatientId = new ObjectId().toString();

    await request(app)
      .delete(`/patients/${missingPatientId}`)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe('Patient not found');
      });
  });

  test("should try delete a patient by id and catch status error 400", async () => {
    const invalidPatientId = 'invalid-id';

    await request(app)
      .delete(`/patients/${invalidPatientId}`)
      .expect(400);
  });

  test("should delete a patient by full name", async () => {
    await request(app)
      .delete('/patients')
      .send({ fullName: `Patient ${patientCounter}` })
      .expect(200);
  });
});

const baseInvalidPatientData = {
      fullName: 'Invalid Patient',
      dateOfBirth: '1990-01-01',
      identificationNumber: '12345678Z',
      recordNumber: 'RN000001',
      gender: 'male',
      contact: {
        address: '123 Main St',
        phone: '+34612345678',
        email: 'invalidpatient@gmail.com'
      },
      allergies: ['Peanuts'],
      bloodGroup: 'A+',
      status: 'active'
    };

describe('Patient Model Validation', () => {
  let invalidPatientData: typeof baseInvalidPatientData;

  beforeAll(async() => {
    await connectDB();
  });

  beforeEach(() => {
    invalidPatientData = structuredClone(baseInvalidPatientData);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test("should throw new error with invalid Identification Number", async () => {
    invalidPatientData.identificationNumber = 'invalid-id'; // Invalid identification number (not a valid ID or Passport)

    await request(app)
      .post('/patients')
      .send(invalidPatientData)
      .expect(400)
      .expect((response: { body: { errors?: { identificationNumber?: { message?: string } } } }) => {
        expect(response.body.errors?.identificationNumber?.message)
          .toContain('Identification number must be a valid ID or Passport');
      });
  });

  test("should throw new error with invalid Record Number", async () => {
    invalidPatientData.recordNumber = 'invalid-record'; // Invalid record number (not alphanumeric)

    await request(app)
      .post('/patients')
      .send(invalidPatientData)
      .expect(400)
      .expect((response: { body: { errors?: { recordNumber?: { message?: string } } } }) => {
        expect(response.body.errors?.recordNumber?.message)
          .toContain('Record number must be alphanumeric');
      });
  });

  test("should throw new error with invalid Gender", async () => {
    invalidPatientData.gender = 'invalid-gender'; // Invalid gender (not one of the allowed values)

    await request(app)
      .post('/patients')
      .send(invalidPatientData)
      .expect(400)
      .expect((response: { body: { errors?: { gender?: { message?: string } } } }) => {
        expect(response.body.errors?.gender?.message)
          .toContain('Gender must be one of: male, female, other');
      });
  });

  test("should throw new error with invalid Blood Group", async () => {
    invalidPatientData.bloodGroup = 'invalid-blood-group'; // Invalid blood group (not one of the allowed values)

    await request(app)
      .post('/patients')
      .send(invalidPatientData)
      .expect(400)
      .expect((response: { body: { errors?: { bloodGroup?: { message?: string } } } }) => {
        expect(response.body.errors?.bloodGroup?.message)
          .toContain('Blood group must be one of: A+, A-, B+, B-, AB+, AB-, 0+, 0-');
      });
  });

  test("should throw new error with invalid Status", async () => {
    invalidPatientData.status = 'invalid-status'; // Invalid status (not one of the allowed values)

    await request(app)
      .post('/patients')
      .send(invalidPatientData)
      .expect(400)
      .expect((response: { body: { errors?: { status?: { message?: string } } } }) => {
        expect(response.body.errors?.status?.message)
          .toContain('Patient status must be one of: active, temporary_leave, deceased');
      });
  });
});