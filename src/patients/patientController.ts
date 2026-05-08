import { Request, Response } from 'express';
import { Patient } from '../models/patient.js';

export async function createPatient(req: Request, res: Response) {
  try {
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    res.status(201).send(savedPatient);
  } catch (error) {
    res.status(400).send(error);
  }
}

export async function getPatients(_req: Request, res: Response) {
  try {
    const patients = await Patient.find();
    res.send(patients);
  } catch (error) {
    res.status(400).send(error);
  }
}

export async function getPatientById(req: Request, res: Response) {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).send({ message: 'Patient not found' });
    }

    res.send(patient);
  } catch (error) {
    res.status(400).send(error);
  }
}

export async function updatePatient(req: Request, res: Response) {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      context: 'query'
    });

    if (!patient) {
      return res.status(404).send({ message: 'Patient not found' });
    }

    res.send(patient);
  } catch (error) {
    res.status(400).send(error);
  }
}

export async function deletePatient(req: Request, res: Response) {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).send({ message: 'Patient not found' });
    }

    res.send(patient);
  } catch (error) {
    res.status(400).send(error);
  }
}

