import express from 'express';
import {
  createMedication,
  deleteMedication,
  getAllMedications,
  getMedicationByCode,
  updateMedication
} from './medicationsController.js';
  
export const MedicationsRouter = express.Router();

MedicationsRouter.post('/medications', createMedication);
MedicationsRouter.get('/medications/all', getAllMedications);
MedicationsRouter.get('/medications/code/:nationalCode', getMedicationByCode);
MedicationsRouter.patch('/medications/:id', updateMedication);
MedicationsRouter.put('/medications/:id', updateMedication);
MedicationsRouter.delete('/medications/:id', deleteMedication);