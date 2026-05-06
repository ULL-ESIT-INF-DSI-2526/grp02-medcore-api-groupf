import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  patientCollection: {
    findOne: vi.fn(),
    insertOne: vi.fn(),
    createIndex: vi.fn()
  },
  getDbMock: vi.fn(() => ({
    collection: vi.fn((name: string) => {
      if (name === 'patients') return mocks.patientCollection;
      throw new Error(`Unexpected collection: ${name}`);
    })
  }))
}));

vi.mock('../db/database.js', () => ({
  getDb: mocks.getDbMock
}));

import { createPatient } from '../models/patient.js';

describe('create patient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a patient', async () => {
    const insertedId = new ObjectId();
    const createdPatient = {
      _id: insertedId,
      fullName: 'Ana Pérez',
      dateOfBirth: new Date('1990-01-01'),
      identificationNumber: '12345678A',
      recordNumber: 'RN-001',
      gender: 'female' as const,
      allergies: [],
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mocks.patientCollection.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createdPatient);
    mocks.patientCollection.insertOne.mockResolvedValueOnce({ insertedId });

    const result = await createPatient({
      fullName: 'Ana Pérez',
      dateOfBirth: new Date('1990-01-01'),
      identificationNumber: '12345678A',
      recordNumber: 'RN-001',
      gender: 'female',
      allergies: [],
      status: 'active'
    });

    expect(result).toEqual(createdPatient);
    expect(mocks.patientCollection.insertOne).toHaveBeenCalledTimes(1);
  });
});