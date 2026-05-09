import { ObjectId } from 'mongodb';
import { describe, test, beforeAll, beforeEach, afterAll, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/db/database.js';
import { Medications } from '../src/models/medications.js';

let createdMedicationId = '';
let patientCounter = 0;

describe('Medications API', () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await Medications.deleteMany({});
    patientCounter += 1;
    
    const medicationData = {
      name: {
        comercialName: `Medication ${patientCounter}`,
        activeIngredientName: `Active Ingredient ${patientCounter}`
      },
      nationalCode: `12345${patientCounter}`,
      dosageForm: 'Comprimido',
      standarDose: {
        amount: 500,
        unit: 'mg'
      },
      channel: 'Oral',
      stock: 100,
      price: 19.99,
      prescription: true,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      contraindications: ['Allergy to active ingredient']
    };

    const response = await request(app)
      .post('/medications')
      .send(medicationData)
      .expect(201);

    createdMedicationId = response.body._id;
  });

  afterAll(async () => {
    // Clean up test data and close DB connection directly
    await Medications.deleteMany({});
    await disconnectDB();
  });

  test("should create a new medication", async () => {
    expect(createdMedicationId).not.toBe("");
    await request(app)
      .get(`/medications/code/12345${patientCounter}`)
      .expect(200)
      .expect((response: any) => {
        expect(response.body.name.comercialName).toBe(`Medication ${patientCounter}`);
        expect(response.body.name.activeIngredientName).toBe(`Active Ingredient ${patientCounter}`);
      });
  });
});