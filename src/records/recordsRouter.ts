import express from 'express';
import {
  createRecords,
  deleteRecordById,
  getAllRecords,
  getRecordById,
  updateRecord
} from './recordsController.js';

export const RecordsRouter = express.Router();

RecordsRouter.route('/')
  .post(createRecords)
  .get(getAllRecords);

RecordsRouter.route('/:id')
  .get(getRecordById)
  .patch(updateRecord)
  .put(updateRecord)
  .delete(deleteRecordById);
