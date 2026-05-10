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

PatientRouter.post('/', createPatient);
PatientRouter.get('/', getPatients);
PatientRouter.get('/:id', getPatientById);
PatientRouter.patch('/:id', updatePatient);
PatientRouter.put('/:id', updatePatient);
PatientRouter.delete('/', deletePatient);
PatientRouter.delete('/:id', deletePatientById);


