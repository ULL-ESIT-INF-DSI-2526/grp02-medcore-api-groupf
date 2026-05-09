import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../src/app.js';
import { Patient } from '../src/models/patient.js';

describe('patients routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('lists patients', async () => {
    vi.spyOn(Patient, 'find').mockResolvedValueOnce([
      { _id: 'patient-1', fullName: 'Ana Pérez' }
    ] as any);

    const response = await request(app).get('/patients');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ _id: 'patient-1', fullName: 'Ana Pérez' }]);
  });

  it('gets a patient by id', async () => {
    vi.spyOn(Patient, 'findById').mockResolvedValueOnce({
      _id: 'patient-1',
      fullName: 'Ana Pérez'
    } as any);

    const response = await request(app).get('/patients/patient-1');

    expect(response.status).toBe(200);
    expect(response.body.fullName).toBe('Ana Pérez');
  });

  it('returns 404 when a patient is missing', async () => {
    vi.spyOn(Patient, 'findById').mockResolvedValueOnce(null as any);

    const response = await request(app).get('/patients/missing-id');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Patient not found');
  });

  it('updates a patient', async () => {
    vi.spyOn(Patient, 'findByIdAndUpdate').mockResolvedValueOnce({
      _id: 'patient-1',
      fullName: 'Ana Pérez Actualizada'
    } as any);

    const response = await request(app).patch('/patients/patient-1').send({
      fullName: 'Ana Pérez Actualizada'
    });

    expect(response.status).toBe(200);
    expect(response.body.fullName).toBe('Ana Pérez Actualizada');
  });

  it('deletes a patient', async () => {
    vi.spyOn(Patient, 'findByIdAndDelete').mockResolvedValueOnce({
      _id: 'patient-1',
      fullName: 'Ana Pérez'
    } as any);

    const response = await request(app).delete('/patients/patient-1');

    expect(response.status).toBe(200);
    expect(response.body.fullName).toBe('Ana Pérez');
  });

  it('returns 404 when trying to delete a missing patient', async () => {
    vi.spyOn(Patient, 'findByIdAndDelete').mockResolvedValueOnce(null as any);

    const response = await request(app).delete('/patients/missing-id');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Patient not found');
  });
  
  it('creates a patient', async () => {
    vi.spyOn(Patient.prototype, 'save').mockResolvedValueOnce({
      _id: 'patient-1',
      fullName: 'Ana Pérez'
    } as any);
    const response = await request(app).post('/patients').send({
      fullName: 'Ana Pérez',
      dateOfBirth: '1990-01-01',
      identificationNumber: '12345678A',
      recordNumber: 'RN000001',
      gender: 'female',
      allergies: [],
      status: 'active'
    });

    expect(response.status).toBe(201);
    expect(response.body.fullName).toBe('Ana Pérez');
  });

  
});