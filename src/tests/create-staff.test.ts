import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStaff } from '../staff/staffController.js';
import {
  MedicalSpecialty,
  ProfessionalCategory,
  StaffStatus,
  WorkShift,
  Staff,
} from '../models/staff.js';

describe('create staff', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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

    // Mock Mongoose save() on the model instance
    vi.spyOn(Staff.prototype as any, 'save').mockResolvedValueOnce(createdStaff as any);

    const req = {
      body: {
        fullName: 'Dr. Luis Gómez',
        collegeId: 'COL-12345',
        medicalSpecialty: MedicalSpecialty.CARDIOLOGY,
        professionalCategory: ProfessionalCategory.ATTENDING_PHYSICIAN,
        yearsOfExperience: 12,
        workShift: WorkShift.MORNING,
        consultationRoomOrWard: 'Consulta 12',
        status: StaffStatus.ACTIVE
      }
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn()
    } as any;

    await createStaff(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(createdStaff);
  });
});