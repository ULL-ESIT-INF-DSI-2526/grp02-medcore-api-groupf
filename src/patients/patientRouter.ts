import express from 'express';
import {
  createPatient,
  deletePatientById,
  deletePatient,
  getPatientById,
  getPatients,
  updatePatient
} from './patientController.js';

export const PatientRouter = express.Router();

PatientRouter.post('/patients', createPatient);
PatientRouter.get('/patients', getPatients);
PatientRouter.get('/patients/:id', getPatientById);
PatientRouter.patch('/patients/:id', updatePatient);
PatientRouter.put('/patients/:id', updatePatient);
PatientRouter.delete('/patients', deletePatient);
PatientRouter.delete('/patients/:id', deletePatientById);


