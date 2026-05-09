import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const recordModelMock = vi.hoisted(() => ({
  create: vi.fn(),
  find: vi.fn(),
  findById: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findByIdAndDelete: vi.fn()
}));

const patientModelMock = vi.hoisted(() => ({
  findOne: vi.fn(),
  findById: vi.fn()
}));

const staffModelMock = vi.hoisted(() => ({
  findOne: vi.fn(),
  findById: vi.fn()
}));

const medicationModelMock = vi.hoisted(() => ({
  findOne: vi.fn(),
  findById: vi.fn()
}));

vi.mock('../src/models/records.js', () => ({
  RecordsModel: recordModelMock,
  Status: { OPEN: 'abierto' },
  StaffStatus: { ACTIVE: 'activo' }
}));

vi.mock('../src/models/patient.js', () => ({
  Patient: patientModelMock
}));

vi.mock('../src/models/staff.js', () => ({
  Staff: staffModelMock,
  StaffStatus: { ACTIVE: 'activo' }
}));

vi.mock('../src/models/medications.js', () => ({
  Medications: medicationModelMock
}));

import { app } from '../src/app.js';

describe('records routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a record', async () => {
    const mockRecord = { 
      _id: 'record-1', 
      reason: 'Checkup',
      toObject: () => ({ _id: 'record-1', reason: 'Checkup' })
    };

    patientModelMock.findOne.mockResolvedValueOnce({ _id: 'patient-1' });
    staffModelMock.findOne.mockResolvedValueOnce({ _id: 'staff-1' });
    recordModelMock.create.mockResolvedValueOnce(mockRecord);

    const response = await request(app).post('/records').send({
      patientIdentificationNumber: 'P123',
      staffCollegeId: 'S456',
      record: 'Consulta Ambulatoria',
      reason: 'Checkup',
      diagnosis: 'Healthy',
      prescription: [],
      status: 'abierto'
    });

    expect(response.status).toBe(201);
    expect(response.body._id).toBe('record-1');
    expect(recordModelMock.create).toHaveBeenCalledTimes(1);
  });

  it('lists records', async () => {
    recordModelMock.find.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce([{ _id: 'record-1' }])
    });

    const response = await request(app).get('/records');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ _id: 'record-1' }]);
  });

  it('returns 404 when a record is missing', async () => {
    recordModelMock.findById.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce(null)
    });

    const response = await request(app).get('/records/missing-id');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Record not found');
  });

  it('deletes a record', async () => {
    const mockRecord = { 
      _id: 'record-1', 
      reason: 'Checkup',
      toObject: () => ({ _id: 'record-1', reason: 'Checkup' })
    };

    recordModelMock.findByIdAndDelete.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce(mockRecord)
    });

    const response = await request(app).delete('/records/record-1');

    expect(response.status).toBe(200);
    expect(response.body.reason).toBe('Checkup');
  });

  it('returns 404 when trying to delete a missing record', async () => {
    recordModelMock.findByIdAndDelete.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce(null)
    });

    const response = await request(app).delete('/records/missing-id');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Record not found');
  });

  

});
