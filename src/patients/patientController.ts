import { Request, Response } from 'express';
import { Patient } from '../models/patient.js';
import { sendErrorResponse } from '../utils/http.js';

export async function createPatient(req: Request, res: Response) {
  try {
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    res.status(201).send(savedPatient);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}

export async function getPatients(_req: Request, res: Response) {
  try {
    const patients = await Patient.find();
    res.send(patients);
  } catch (error) {
    sendErrorResponse(res, error);
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
    sendErrorResponse(res, error);
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
    sendErrorResponse(res, error);
  }
}

export async function deletePatient(req: Request, res: Response) {
  try {
    const identificationNumber = req.body?.identificationNumber;
    const fullName = req.body?.fullName;

    // If an identification number is provided, delete a single patient matching it
    if (identificationNumber) {
      const result = await Patient.deleteOne({ identificationNumber });
      return res.send(result);
    }

    // If a fullName is provided, delete a single patient matching the full name
    if (fullName) {
      const result = await Patient.deleteOne({ fullName });
      return res.send(result);
    }

    // No specific filter provided -> reject the request to avoid accidental full deletes
    return res.status(400).send({ message: 'No delete filter provided. Specify identificationNumber or fullName.' });
  } catch (error) {
    sendErrorResponse(res, error);
  }
}

export async function deletePatientById(req: Request, res: Response) {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).send({ message: 'Patient not found' });
    }

    res.send(patient);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}

