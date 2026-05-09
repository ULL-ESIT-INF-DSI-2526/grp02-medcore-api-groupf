import express from 'express';
import {
  createRecords,
  deleteRecordById,
  getAllRecords,
  getRecordById,
  updateRecord
} from './recordsController.js';

export const RecordsRouter = express.Router();

RecordsRouter.post('/records', createRecords);
RecordsRouter.get('/records', getAllRecords);
RecordsRouter.get('/records/:id', getRecordById);
RecordsRouter.patch('/records/:id', updateRecord);
RecordsRouter.put('/records/:id', updateRecord);
RecordsRouter.delete('/records/:id', deleteRecordById);
