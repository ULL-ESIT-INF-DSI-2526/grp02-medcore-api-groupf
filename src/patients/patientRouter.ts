import express from 'express';
import { createPatient } from './patientController.js';

export const PatientRouter = express.Router();

PatientRouter.post('/patients', createPatient);