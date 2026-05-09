import express from 'express';
import { createMedication } from './medicationsController.js';

export const MedicationsRouter = express.Router();

MedicationsRouter.post('/medications', createMedication);
MedicationsRouter.get('/medications', createMedication);
MedicationsRouter.get('/medications/:id', createMedication);
MedicationsRouter.get('/medications/code/:nationalCode', createMedication);
MedicationsRouter.patch('/medications/:id', createMedication);
MedicationsRouter.put('/medications/:id', createMedication);
MedicationsRouter.delete('/medications/:id', createMedication);