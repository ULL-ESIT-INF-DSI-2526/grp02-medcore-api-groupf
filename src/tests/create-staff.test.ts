import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  staffCollection: {
    findOne: vi.fn(),
    insertOne: vi.fn(),
    createIndex: vi.fn()
  },
  getDbMock: vi.fn(() => ({
    collection: vi.fn((name: string) => {
      if (name === 'staff') return mocks.staffCollection;
      throw new Error(`Unexpected collection: ${name}`);
    })
  }))
}));

vi.mock('../db/database.js', () => ({
  getDb: mocks.getDbMock
}));

import {
  MedicalSpecialty,
  ProfessionalCategory,
  StaffStatus,
  WorkShift,
  createStaff
} from '../models/staff.js';

describe('create staff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a staff member', async () => {
    const insertedId = new ObjectId();
    const createdStaff = {
      _id: insertedId,
      fullName: 'Dr. Luis Gómez',
      collegeId: 'COL-12345',
      medicalSpecialty: MedicalSpecialty.CARDIOLOGY,
      professionalCategory: ProfessionalCategory.ATTENDING_PHYSICIAN,
      yearsOfExperience: 12,
      workShift: WorkShift.MORNING,
      consultationRoomOrWard: 'Consulta 12',
      status: StaffStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mocks.staffCollection.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createdStaff);
    mocks.staffCollection.insertOne.mockResolvedValueOnce({ insertedId });

    const result = await createStaff({
      fullName: 'Dr. Luis Gómez',
      collegeId: 'COL-12345',
      medicalSpecialty: MedicalSpecialty.CARDIOLOGY,
      professionalCategory: ProfessionalCategory.ATTENDING_PHYSICIAN,
      yearsOfExperience: 12,
      workShift: WorkShift.MORNING,
      consultationRoomOrWard: 'Consulta 12',
      status: StaffStatus.ACTIVE
    });

    expect(result).toEqual(createdStaff);
    expect(mocks.staffCollection.insertOne).toHaveBeenCalledTimes(1);
  });
});