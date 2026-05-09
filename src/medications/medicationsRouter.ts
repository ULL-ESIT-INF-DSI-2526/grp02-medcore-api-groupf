import express from 'express';
import {
  createMedication,
  deleteMedication,
  deleteMedicationById,
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
MedicationsRouter.delete('/medications', deleteMedication);
MedicationsRouter.delete('/medications/:id', deleteMedicationById);