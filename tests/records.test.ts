import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const modelMocks = vi.hoisted(() => ({
  createRecord: vi.fn(),
  getRecords: vi.fn(),
  findRecordsById: vi.fn(),
  updateRecordsByID: vi.fn(),
  deleteRecord: vi.fn()
}));

vi.mock('../src/models/records.js', () => modelMocks);

import app from '../src/app.js';

describe('records routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a record', async () => {
    modelMocks.createRecord.mockResolvedValueOnce({ _id: 'record-1', reason: 'Checkup' });

    const response = await request(app).post('/records').send({
      patientId: 'patient-1',
      staffId: 'staff-1',
      record: 'Consulta Ambulatoria',
      reason: 'Checkup',
      diagnosis: 'Healthy',
      prescription: [],
      status: 'abierto'
    });

    expect(response.status).toBe(201);
    expect(response.body._id).toBe('record-1');
    expect(modelMocks.createRecord).toHaveBeenCalledTimes(1);
  });

  it('lists records', async () => {
    modelMocks.getRecords.mockResolvedValueOnce([{ _id: 'record-1' }]);

    const response = await request(app).get('/records');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ _id: 'record-1' }]);
  });

  it('returns 404 when a record is missing', async () => {
    modelMocks.findRecordsById.mockResolvedValueOnce(null);

    const response = await request(app).get('/records/missing-id');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Record not found');
  });
});
