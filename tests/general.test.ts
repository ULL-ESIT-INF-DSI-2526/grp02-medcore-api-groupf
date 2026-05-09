import { describe, test, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/db/database.js';

describe('Default Router', () => {
  test('should return 501 for undefined routes', async () => {
    await request(app)
      .get('/undefined-route')
      .expect(501);
  });
});

const baseInvalidContactData = {
  address: '123 Main St',
  phone: '+34123456789',
  email: 'example@gmail.com'
};

const recordNumber = `RN${String().padStart(6, '0')}`;
const patientData = {
  fullName: 'Patient',
  dateOfBirth: '1990-01-01',
  identificationNumber: '12345678A',
  recordNumber,
  gender: 'male',
  contact: baseInvalidContactData,
  allergies: ['Peanuts'],
  bloodGroup: 'A+',
  status: 'active'
};

describe('Contact Schema Validation', () => {
  let invalidPatientData: typeof patientData;

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(() => {
    invalidPatientData = structuredClone(patientData);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('should throw new error with invalid phone number', async () => {
    invalidPatientData.contact.phone = 'invalid-phone';

    await request(app)
      .post('/patients')
      .send(invalidPatientData)
      .expect(400)
      .expect((response: { body: { errors?: { 'contact.phone'?: { message?: string } } } }) => {
        expect(response.body.errors?.['contact.phone']?.message)
          .toContain('Invalid phone number format');
      });
  });

  test('should throw new error with invalid email', async () => {
    invalidPatientData.contact.email = 'invalid-email';

    await request(app)
      .post('/patients')
      .send(invalidPatientData)
      .expect(400)
      .expect((response: { body: { errors?: { 'contact.email'?: { message?: string } } } }) => {
        expect(response.body.errors?.['contact.email']?.message)
          .toContain('Invalid email format');
      });
  });
});