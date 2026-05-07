import { Request, Response } from 'express';
import { Patient } from '../models/patient.js';

export async function createPatient(req: Request, res: Response) {
  const patient = new Patient(req.body);

  patient.save().then((patient) => {
    res.status(201).send(patient);
  }).catch((error) => {
    res.status(400).send(error);
  });
}