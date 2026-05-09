import { ObjectId } from "mongodb";
import { describe, test, beforeAll, beforeEach, afterAll, expect, vi} from "vitest";
import request from "supertest";
import app from "../src/app";
import { connectDB, disconnectDB } from "../src/db/database.js";
import { Staff } from '../src/models/staff.js';

let createdStaffId = '';
let staffCounter = 0;

describe('Staff API', () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async() => {
    await Staff.deleteMany({});
    staffCounter += 1;
    const staffData = {
      fullName: `Test Staff ${staffCounter}`,
      collegeId: '282812345',
      medicalSpecialty: 'Medicina General',
      professionalCategory: 'Médico/a adjunto/a',
      workShift: 'Mañana',
      status: 'activo',
      consultNumber: `CONSULT${staffCounter}`,
      yearsOfExperience: 5,
      contactInfo: {
        address: `123 Test St, City ${staffCounter}`,
        phone: `+34600300200`,
        email: `staff${staffCounter}@gmail.com`
      }
    };
    
    const response = await request(app)
      .post('/staff')
      .send(staffData)
      .expect(201);

    createdStaffId = response.body._id;
  });

  afterAll(async () => {
    await request(app)
          .delete(`/staff/`)
          .expect(200);
    
    await disconnectDB();
  })

  test("should create a new staff member", async () => {
    expect(createdStaffId).not.toBe("");
    await request(app)
      .get(`/staff/${createdStaffId}`)
      .expect(200)
      .then((response) => {
        expect(response.body.fullName).toBe(`Test Staff ${staffCounter}`);
        expect(response.body.professionalCategory).toBe('Médico/a adjunto/a');
        expect(response.body.workShift).toBe('Mañana');
        expect(response.body.status).toBe('activo');
        expect(response.body.consultNumber).toBe(`CONSULT${staffCounter}`);
        expect(response.body.yearsOfExperience).toBe(5);
        expect(response.body.contactInfo.email).toBe(`staff${staffCounter}@gmail.com`);
      });
  });
  
  test("should try create a new staff member and catch status error 400", async () => {
    const invalidStaffData = {
      fullName: `Test Staff ${staffCounter + 1}`,
      collegeId: 'invalid_college_id',
      medicalSpecialty: 'Medicina General',
      professionalCategory: 'Médico/a adjunto/a',
      workShift: 'Mañana',
      status: 'activo',
      consultNumber: `CONSULT${staffCounter + 1}`,
      yearsOfExperience: 5,
      contactInfo: {
        address: `123 Test St, City ${staffCounter + 1}`,
        phone: `+34600300200`,
        email: `staff${staffCounter + 1}@gmail.com`
      }
    };

    await request(app)
      .post('/staff')
      .send(invalidStaffData)
      .expect(400);
  });

  test("should get all staff members", async () => {
    const staffData = {
      fullName: `Test Staff ${staffCounter + 1}`,
      collegeId: '282812346',
      medicalSpecialty: 'Medicina General',
      professionalCategory: 'Médico/a adjunto/a',
      workShift: 'Mañana',
      status: 'activo',
      consultNumber: `CONSULT${staffCounter}`,
      yearsOfExperience: 5,
      contactInfo: {
        address: `123 Test St, City ${staffCounter}`,
        phone: `+34600300200`,
        email: `staff${staffCounter}@gmail.com`
      }
    };

    await request(app)
      .post('/staff')
      .send(staffData)
      .expect(201);

    await request(app)
      .get('/staff')
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
      });
  });

  test("should try get all staff memeber and catch status error 400", async () => {
    vi.spyOn(Staff, 'find').mockRejectedValueOnce(new Error('Database error'));

    await request(app)
      .get('/staff')
      .expect(400);
  });

  test("should try get a staff member by id and catch status error 404", async () => {
    const missingStaffId = new ObjectId().toString();

    await request(app)
      .get(`/staff/${missingStaffId}`)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe('Staff not found');
      });
  });

  test("should try get a patient by id and catch status error 400", async () => {
    const invalidStaffId = 'invalid_id';

    await request(app)
      .get(`/staff/${invalidStaffId}`)
      .expect(400);
  });

  test("should update a staff member", async () => {
    const updatedData = {
      fullName: `Updated Test Staff ${staffCounter}`,
      collegeId: '282812347',
      medicalSpecialty: 'Cardiología',
      professionalCategory: 'Médico/a adjunto/a',
      workShift: 'Tarde',
      status: 'activo',
      consultNumber: `UPDATED_CONSULT${staffCounter}`,
      yearsOfExperience: 10,
      contactInfo: {
        address: `456 Updated St, City ${staffCounter}`,
        phone: `+34600300201`,
        email: `updatedstaff${staffCounter}@gmail.com`
      }
    };

    await request(app)
      .put(`/staff/${createdStaffId}`)
      .send(updatedData)
      .expect(200)
      .then((response) => {
        expect(response.body.fullName).toBe(`Updated Test Staff ${staffCounter}`);
        expect(response.body.medicalSpecialty).toBe('Cardiología');
        expect(response.body.workShift).toBe('Tarde');
        expect(response.body.consultNumber).toBe(`UPDATED_CONSULT${staffCounter}`);
        expect(response.body.yearsOfExperience).toBe(10);
        expect(response.body.contactInfo.email).toBe(`updatedstaff${staffCounter}@gmail.com`);
      });
  });

  test("should try update a staff member and catch status error 404", async () => {
    const missingStaffId = new ObjectId().toString();
    const updatedData = {
      fullName: `Updated Test Staff ${staffCounter}`,
      collegeId: '282812347',
      medicalSpecialty: 'Cardiología',
      professionalCategory: 'Médico/a adjunto/a',
      workShift: 'Tarde',
      status: 'activo',
      consultNumber: `UPDATED_CONSULT${staffCounter}`,
      yearsOfExperience: 10,
      contactInfo: {
        address: `456 Updated St, City ${staffCounter}`,
        phone: `+34600300201`,
        email: `updatedstaff${staffCounter}@gmail.com`
      }
    };

    await request(app)
      .put(`/staff/${missingStaffId}`)
      .send(updatedData)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe('Staff not found');
      });
  });

  test("should try update a staff member and catch status error 400", async () => {
    const invalidStaffId = 'invalid_id';
    const updatedData = {
      fullName: `Updated Test Staff ${staffCounter}`,
      collegeId: '282812347',
      medicalSpecialty: 'Cardiología',
      professionalCategory: 'Médico/a adjunto/a',
      workShift: 'Tarde',
      status: 'activo',
      consultNumber: `UPDATED_CONSULT${staffCounter}`,
      yearsOfExperience: 10,
      contactInfo: {
        address: `456 Updated St, City ${staffCounter}`,
        phone: `+34600300201`,
        email: `updatedstaff${staffCounter}@gmail.com`
      }
    };

    await request(app)
      .put(`/staff/${invalidStaffId}`)
      .send(updatedData)
      .expect(400);
  });

  test("should try delete all staff member anf catch status error 400", async () => {
    vi.spyOn(Staff, 'deleteMany').mockRejectedValueOnce(new Error('Database error'));

    await request(app)
      .delete('/staff')
      .expect(400);
  })

  test("should delete a staff member by id", async () => {
    await request(app)
      .delete(`/staff/${createdStaffId}`)
      .expect(200);
  });

  test("shoyld try delet a staff member by id and catch status errro 404", async () => {
    const missingStaffId = new ObjectId().toString();

    await request(app)
      .delete(`/staff/${missingStaffId}`)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe('Staff not found');
      });
  });

  test("should try delete a staff member by id and catch status error 400", async () => {
    const invalidStaffId = 'invalid_id';

    await request(app)
      .delete(`/staff/${invalidStaffId}`)
      .expect(400);
  });

  test("should detele a staff member by full name", async () => {
    await request(app)
      .delete(`/staff/`)
      .send({ fullName: `Test Staff ${staffCounter}` })
      .expect(200);
  });
});

const baseInvalidStaffData = {
      fullName: `Invalid Staff`,
      collegeId: '282812346',
      medicalSpecialty: 'Medicina General',
      professionalCategory: 'Médico/a adjunto/a',
      workShift: 'Mañana',
      status: 'activo',
      consultNumber: `CONSULT${staffCounter}`,
      yearsOfExperience: 5,
      contactInfo: {
        address: `123 Test St, City ${staffCounter}`,
        phone: `+34600300200`,
        email: `staff${staffCounter}@gmail.com`
      }
    };

describe('Staff Model Validation', () => {
  let invalidStaffData: typeof baseInvalidStaffData;

  beforeAll(async() => {
    await connectDB();
  });

  beforeEach(() => {
    invalidStaffData = structuredClone(baseInvalidStaffData);
  });

  afterAll(async() => {
    await disconnectDB();
  });

  test("should throw new error with invalid College ID", async () => {
    invalidStaffData.collegeId = '28281234X';

    await request(app)
      .post('/staff')
      .send(invalidStaffData)
      .expect(400)
      .expect((response: { body: { errors?: { collegeId?: { message?: string } } } }) => {
        expect(response.body.errors?.collegeId?.message)
          .toContain('College ID must be numeric');
      });

    invalidStaffData.collegeId = 'invalid';

    await request(app)
      .post('/staff')
      .send(invalidStaffData)
      .expect(400)
      .expect((response: { body: { errors?: { collegeId?: { message?: string } } } }) => {
        expect(response.body.errors?.collegeId?.message)
          .toContain('Path `collegeId` (`invalid`, length 7) is shorter than the minimum allowed length (9).');
      });

    invalidStaffData.collegeId = 'invalid_college_id';

    await request(app)
      .post('/staff')
      .send(invalidStaffData)
      .expect(400)
      .expect((response: { body: { errors?: { collegeId?: { message?: string } } } }) => {
        expect(response.body.errors?.collegeId?.message)
          .toContain('Path `collegeId` (`invalid_college_id`, length 18) is longer than the maximum allowed length (9).');
      });
  });
});