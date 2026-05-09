import { ObjectId } from 'mongodb';
import { describe, test, beforeAll, beforeEach, afterAll, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/db/database.js';
import { Medications } from '../src/models/medications.js';
import { deleteMedication } from '../src/medications/medicationsController.js';

let createdMedicationId = '';
let patientCounter = 0;

const getNationalCode = (counter: number) => String(counter).padStart(6, '0');

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
      nationalCode: getNationalCode(patientCounter),
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
    await request(app)
      .delete(`/medications/`)   
      .expect(200);

    await disconnectDB();
  });

  test("should create a new medication", async () => {
    expect(createdMedicationId).not.toBe("");
    await request(app)
      .get(`/medications/code/${getNationalCode(patientCounter)}`)
      .expect(200)
      .expect((response: any) => {
        expect(response.body.name.comercialName).toBe(`Medication ${patientCounter}`);
        expect(response.body.name.activeIngredientName).toBe(`Active Ingredient ${patientCounter}`);
      });
  });

  test("should try create a new medication and catch status error 400", async () => {
    const invalidMedicationData = {
      name: {
        comercialName: `Medication ${patientCounter}`,
        activeIngredientName: `Active Ingredient ${patientCounter}`
      },
      nationalCode: getNationalCode(patientCounter),
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

    await request(app)
      .post('/medications')
      .send(invalidMedicationData)
      .expect(400);
  });

  test("should get all medications", async () => {
    const medicationData = {
      name: {
        comercialName: `Medication ${patientCounter + 1}`,
        activeIngredientName: `Active Ingredient ${patientCounter + 1}`
      },
      nationalCode: `12345${patientCounter + 1}`,
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

    await request(app)
      .post('/medications')
      .send(medicationData)
      .expect(201);

    await request(app)
      .get('/medications/all')
      .expect(200)
      .expect((response: any) => {
        expect(response.body.length).toBe(2);
      });
  });

  test("should get a medication by id", async () => {
    await request(app)
      .get(`/medications/${createdMedicationId}`)
      .expect(200)
      .expect((response: any) => {
        expect(response.body._id).toBe(createdMedicationId);
        expect(response.body.name.comercialName).toBe(`Medication ${patientCounter}`);
        expect(response.body.name.activeIngredientName).toBe(`Active Ingredient ${patientCounter}`);
      });
  });

  test("should try get a medication by national code and catch status error 404", async () => {
    await request(app)
      .get('/medications/code/999999')
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe('Medication not found');
      });
  });

  test("should try get all medications and catch status error 400", async () => {
    vi.spyOn(Medications, 'find').mockRejectedValueOnce(new Error('Database error'));

    await request(app)
      .get('/medications/all')
      .expect(400);
  });

  test("should try get a medication by id and catch status error 404", async () => {
    const missingMedicationId = new ObjectId().toString();

    await request(app)
      .get(`/medications/${missingMedicationId}`)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe('Medication not found');
      });
  });

  test("should try get a medication by id and catch status error 400", async () => {
    const invalidMedicationId = 'invalid-id';

    await request(app)
      .get(`/medications/${invalidMedicationId}`)
      .expect(400);
  });

  test("should try get a medication by national code and catch status error 400", async () => {
    vi.spyOn(Medications, 'findOne').mockRejectedValueOnce(new Error('Database error'));

    await request(app)
      .get('/medications/code/123456')
      .expect(400);
  });

  test("should update a medication", async () => {
    const updatedData = {
      name: {
        comercialName: `Updated Medication ${patientCounter}`,
        activeIngredientName: `Updated Active Ingredient ${patientCounter}`
      },
      nationalCode: `${getNationalCode(patientCounter)}`,
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

    await request(app)
      .patch(`/medications/${createdMedicationId}`)
      .send(updatedData)
      .expect(200)
      .then((response) => {
        expect(response.body.name.comercialName).toBe(`Updated Medication ${patientCounter}`);
        expect(response.body.name.activeIngredientName).toBe(`Updated Active Ingredient ${patientCounter}`);
      });

    const updatedData2 = {
      standarDose: {
        amount: 400,
        unit: 'mg'
      }
    };

    await request(app)
      .patch(`/medications/${createdMedicationId}`)
      .send(updatedData2)
      .expect(200)
      .then((response) => {
        expect(response.body.standarDose.amount).toBe(400);
      });
  });

  test("should try update a medication and catch status error 400", async () => {
    const invalidMedicationId = 'invalid-id';
    const updatedData = {
      name: {
        comercialName: `Updated Medication ${patientCounter}`,
        activeIngredientName: `Updated Active Ingredient ${patientCounter}`
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

    await request(app)
      .patch(`/medications/${invalidMedicationId}`)
      .send(updatedData)
      .expect(400);
  });

  test("should try update a medication and catch status error 404", async () => {
    const missingMedicationId = new ObjectId().toString();
    const updatedData = {
      channel: 'Intravenosa'
    };

    await request(app)
      .patch(`/medications/${missingMedicationId}`)
      .send(updatedData)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe('Medication not found');
      });
  });

  test("should delete a medication by name", async () => {
    await request(app)
      .delete(`/medications/name/${encodeURIComponent(`Medication ${patientCounter}`)}`)
      .expect(200);
  });

  test("should try delete a medication by name and catch status error 400", async () => {
    vi.spyOn(Medications, 'deleteOne').mockRejectedValueOnce(new Error('Database error'));

    await request(app)
      .delete(`/medications/name/${encodeURIComponent(`Medication ${patientCounter}`)}`)
      .expect(400);
  });

  test("should try delete a medication by name and catch status error 404", async () => {
    const missingMedicationName = `Nonexistent Medication ${patientCounter}`;

    await request(app)
      .delete(`/medications/name/${encodeURIComponent(missingMedicationName)}`)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe('Medication not found');
      });
  });

  test("should return 400 when deleting a medication by name without name", async () => {
    const deleteOneSpy = vi.spyOn(Medications, 'deleteOne');
    deleteOneSpy.mockClear();
    const statusMock = vi.fn().mockReturnThis();
    const sendMock = vi.fn().mockReturnThis();

    const req = { params: {}, body: {} } as any;
    const res = { status: statusMock, send: sendMock } as any;

    await deleteMedication(req, res);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(sendMock).toHaveBeenCalledWith({ message: 'Medication name is required' });
    expect(deleteOneSpy).not.toHaveBeenCalled();

    deleteOneSpy.mockRestore();
  });

  test("should try delete a medication by name and catch status error 400", async () => {
    vi.spyOn(Medications, 'deleteOne').mockRejectedValueOnce(new Error('Database error'));

    await request(app)
      .delete(`/medications/name/${encodeURIComponent(`Medication ${patientCounter}`)}`)
      .expect(400);
  });

  test("should try delete all medications and catch status error 400", async () => {
    vi.spyOn(Medications, 'deleteMany').mockRejectedValueOnce(new Error('Database error'));

    await request(app)
      .delete('/medications')
      .expect(400);
  });

  test("should delete a medication by id", async () => {
    await request(app)
      .delete(`/medications/${createdMedicationId}`)
      .expect(200);
  });

  test("should try delete a medication by id and catch status error 404", async () => {
    const missingMedicationId = new ObjectId().toString();

    await request(app)
      .delete(`/medications/${missingMedicationId}`)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe('Medication not found');
      });
  });

  test("should try delete a medication by id and catch status error 400", async () => {
    const invalidMedicationId = 'invalid-id';

    await request(app)
      .delete(`/medications/${invalidMedicationId}`)
      .expect(400);
  });
});

const baseInvalidMedicationData = {
  name: {
    comercialName: `Medication ${patientCounter}`,
    activeIngredientName: `Active Ingredient ${patientCounter}`
  },
  nationalCode: getNationalCode(patientCounter),
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

describe('Medications Model Validation', () => {
  let invalidMedicationData: typeof baseInvalidMedicationData;

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(() => {
    invalidMedicationData = structuredClone(baseInvalidMedicationData);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test("should throw new error with invalid national code", async () => {
    invalidMedicationData.nationalCode = 'ABC123';

    await request(app)
      .post('/medications')
      .send(invalidMedicationData)
      .expect(400)
      .expect((response: { body: { errors?: { nationalCode?: { message: string } } } }) => {
        expect(response.body.errors?.nationalCode?.message)
          .toContain('National code must be numeric');
      });

    invalidMedicationData.nationalCode = '123';

    await request(app)
      .post('/medications')
      .send(invalidMedicationData)
      .expect(400)
      .expect((response: { body: { errors?: { nationalCode?: { message: string } } } }) => {
        expect(response.body.errors?.nationalCode?.message)
          .toContain('Path `nationalCode` (`123`, length 3) is shorter than the minimum allowed length (6).');
      });

    invalidMedicationData.nationalCode = '1234567';

    await request(app)
      .post('/medications')
      .send(invalidMedicationData)
      .expect(400)
      .expect((response: { body: { errors?: { nationalCode?: { message: string } } } }) => {
        expect(response.body.errors?.nationalCode?.message)
          .toContain('Path `nationalCode` (`1234567`, length 7) is longer than the maximum allowed length (6).');
      });
  });

  test("should throw new error whit invalid dosage form", async () => {
    invalidMedicationData.dosageForm = 'InvalidDosageForm';

    await request(app)
      .post('/medications')
      .send(invalidMedicationData)
      .expect(400)
      .expect((response: { body: { errors?: { dosageForm?: { message: string } } } }) => {
        expect(response.body.errors?.dosageForm?.message)
          .toContain('Dosage form must be one of: Comprimido, Cápsula, Solución oral, Solución inyectable, Pomada, Parche transdérmico, Inhalador, Otro');
      });
  });

  test("should throw new error whit invalid administration channel", async () => {
    invalidMedicationData.channel = 'InvalidChannel';

    await request(app)
      .post('/medications')
      .send(invalidMedicationData)
      .expect(400)
      .expect((response: { body: { errors?: { channel?: { message: string } } } }) => {
        expect(response.body.errors?.channel?.message)
          .toContain('Administration channel must be one of: Oral, Intravenosa, Intramuscular, Subcutánea, Tópica, Inhalatoria');
      });
  });

  test("should throw new error whit negative stock", async () => {
    invalidMedicationData.stock = -10;

    await request(app)
      .post('/medications')
      .send(invalidMedicationData)
      .expect(400)
      .expect((response: { body: { errors?: { stock?: { message: string } } } }) => {
        expect(response.body.errors?.stock?.message)
          .toContain('Path `stock` (-10) is less than minimum allowed value (0).');
      });

    invalidMedicationData.stock = 3.5;

    await request(app)
      .post('/medications')
      .send(invalidMedicationData)
      .expect(400)
      .expect((response: { body: { errors?: { stock?: { message: string } } } }) => {
        expect(response.body.errors?.stock?.message)
          .toContain('Stock must be an integer');
      });
  });
});