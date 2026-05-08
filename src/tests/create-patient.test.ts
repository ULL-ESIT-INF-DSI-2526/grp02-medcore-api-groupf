import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createPatient } from '../patients/patientController.js';
import { Patient } from '../models/patient.js';

describe('create patient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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

    vi.spyOn(Patient.prototype as any, 'save')
      .mockResolvedValueOnce(createdPatient);

    const req = {
      body: {
        fullName: 'Ana Pérez',
        dateOfBirth: new Date('1990-01-01'),
        identificationNumber: '12345678A',
        recordNumber: 'RN-001',
        gender: 'female',
        allergies: [],
        status: 'active'
      }
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn()
    } as any;

    await createPatient(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(createdPatient);
  });
});