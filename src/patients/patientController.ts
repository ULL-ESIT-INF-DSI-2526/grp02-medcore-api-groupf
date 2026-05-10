import { Request, Response } from 'express';
import { Patient } from '../models/patient.js';
import { sendErrorResponse } from '../utils/http.js';

/**
 * Creates a new patient document in the database.
 * @param req - Express request.
 * @param res - Express response.
 * @returns '201' with the created patient document.
 * @returns '400' if validation fails
 * 
 */
export async function createPatient(req: Request, res: Response) {
  try {
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    return res.status(201).send(savedPatient);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}
/**
 * Returns all patient documents from the database.
 * @param req - Express request.
 * @param res - Express response.
 * @returns '200' with an array of PatientDocument.
 * 
 */
export async function getPatients(_req: Request, res: Response) {
  try {
    const patients = await Patient.find();
    return res.status(200).send(patients);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}
/**
 * Returns a patient document from the database by its '_id'.
 * @param req - Express request.
 * @param res - Express response
 * @returns '200' with the matching PatientDocument.
 * @returns '400' if no patient matches the given 'id'.
 * 
 */
export async function getPatientById(req: Request, res: Response) {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).send({ message: 'Patient not found' });
    }

    return res.status(200).send(patient);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}
/**
 * Updates a patient document by its '_id'
 * @param req - Express request.
 * @param res - Express response
 * @returns '200' with the updated patient document.
 * @returns '404' if no patient matches the provided 'id'.
 * @returns '400' if validation fails on the updated fields.
 * 
 */
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

    return res.status(200).send(patient);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}
/**
 * Deletes a patient document matching provided filter.
 * @param req - Express request.
 * @param res - Express response
 * @returns '200' with the 'deleteOne' result if a filter was provided.
 * @returns '400' if neither 'identificationNumber' nor 'fullName' is provided.
 * 
 */
export async function deletePatient(req: Request, res: Response) {
  try {
    const identificationNumber = req.body?.identificationNumber;
    const fullName = req.body?.fullName;

    // If an identification number is provided, delete a single patient matching it
    if (identificationNumber) {
      const result = await Patient.deleteOne({ identificationNumber });
      return res.status(200).send(result);
    }

    // If a fullName is provided, delete a single patient matching the full name
    if (fullName) {
      const result = await Patient.deleteOne({ fullName });
      return res.status(200).send(result);
    }

    // No specific filter provided -> reject the request to avoid accidental full deletes
    return res.status(400).send({ message: 'No delete filter provided. Specify identificationNumber or fullName.' });
  } catch (error) {
    sendErrorResponse(res, error);
  }
}
/**
 * Deletes a patient document by its '_id'
 * @param req - Express request.
 * @param res - Express response
 * @returns '201' with the deleted PatientDocument.
 * @returns '400' if no patient matches the provided 'id'.
 * 
 */
export async function deletePatientById(req: Request, res: Response) {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).send({ message: 'Patient not found' });
    }

    return res.status(200).send(patient);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}

