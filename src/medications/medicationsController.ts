import { Request, Response } from 'express';
import { Medications } from '../models/medications.js';

export async function createMedication(req: Request, res: Response) {
  const medication = new Medications(req.body);

  medication.save().then((medication) => {
    res.status(201).send(medication);
  }).catch((error) => {
    res.status(400).send(error);
  });
}