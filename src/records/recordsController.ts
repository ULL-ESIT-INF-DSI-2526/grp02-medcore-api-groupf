import { Request, Response } from 'express';
import {
  createRecord,
  deleteRecord,
  findRecordsById,
  getRecords,
  updateRecordsByID
} from '../models/records.js';

export async function createRecords(req: Request, res: Response) {
  try {
    const record = await createRecord(req.body);
    return res.status(201).send(record);
  } catch (error) {
    return res.status(400).send(error);
  }
}

export async function getAllRecords(_req: Request, res: Response) {
  try {
    const records = await getRecords();
    return res.send(records);
  } catch (error) {
    return res.status(400).send(error);
  }
}

export async function getRecordById(req: Request, res: Response) {
  try {
    const record = await findRecordsById(String(req.params.id));
    if (!record) {
      return res.status(404).send({ message: 'Record not found' });
    }

    return res.send(record);
  } catch (error) {
    return res.status(400).send(error);
  }
}

export async function updateRecord(req: Request, res: Response) {
  try {
    const record = await updateRecordsByID(String(req.params.id), req.body);
    if (!record) {
      return res.status(404).send({ message: 'Record not found' });
    }

    return res.send(record);
  } catch (error) {
    return res.status(400).send(error);
  }
}

export async function deleteRecordById(req: Request, res: Response) {
  try {
    const record = await deleteRecord(String(req.params.id));
    if (!record) {
      return res.status(404).send({ message: 'Record not found' });
    }

    return res.send(record);
  } catch (error) {
    return res.status(400).send(error);
  }
}
