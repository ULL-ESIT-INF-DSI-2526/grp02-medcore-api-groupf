import express from 'express';
import {
  createMedication,
  deleteMedication,
  deleteMedicationById,
  getAllMedications,
  getMedicationByCode,
  getMedicationById,
  updateMedication,
  deleteAllMedications
} from './medicationsController.js';
  
export const MedicationsRouter = express.Router();

  MedicationsRouter.post('/', createMedication);
  MedicationsRouter.get('/all', getAllMedications);
  MedicationsRouter.get('/code/:nationalCode', getMedicationByCode);
  MedicationsRouter.get('/:id', getMedicationById);
  MedicationsRouter.patch('/:id', updateMedication);
  MedicationsRouter.put('/:id', updateMedication);
  MedicationsRouter.delete('/name/:name', deleteMedication);
  MedicationsRouter.delete('/:id', deleteMedicationById);
  MedicationsRouter.delete('/', deleteAllMedications);