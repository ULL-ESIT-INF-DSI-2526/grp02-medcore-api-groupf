import { describe, test, beforeAll, beforeEach, afterAll, expect } from 'vitest';
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

  test("should try create a new patient and catch status error 400", async () => {
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
      .expect(400);
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
});