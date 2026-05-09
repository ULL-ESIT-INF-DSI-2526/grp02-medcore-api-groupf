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
});