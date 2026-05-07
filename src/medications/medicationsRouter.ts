import express from 'express';
import { createMedication } from './medicationsController.js';

export const MedicationsRouter = express.Router();

MedicationsRouter.post('/medications', createMedication);