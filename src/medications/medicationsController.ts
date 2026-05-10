import { Request, Response } from 'express';
import { Medications } from '../models/medications.js';
import { sendErrorResponse } from '../utils/http.js';
/**
 * Creates a new medication in the database
 * @param req - Express request.
 * @param res - Express response.
 * @returns '201' with the created medication document
 * 
 */
export async function createMedication(req: Request, res: Response) {
  const medication = new Medications(req.body);

  medication.save().then((medication) => {
    return res.status(201).send(medication);
  }).catch((error) => {
    sendErrorResponse(res, error);
  });
}
/**
 * Returns all medication documents from the database.
 * @param req - Express request.
 * @param res - Express response.
 * @returns '200' with an array of MedicationDocuments. Can be empty.
 * 
 */
export async function getAllMedications(req: Request, res: Response) {
  try {
    const medications = await Medications.find();
    return res.status(200).send(medications);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}
/**
 * Updates a medication document by '_id'.
 * @param req - Express request.
 * @param res - Express response.
 * @returns '200' with the updated medication document.
 * @returns '404' if no medication matches the 'id'
 * 
 */
export async function updateMedication(req: Request, res: Response) {
  try {
    const medication = await Medications.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      context: 'query'
    });

    if (!medication) {
      return res.status(404).send({ message: 'Medication not found' });
    }

    return res.status(200).send(medication);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}

/**
 * Returns a medication documents from the database by '_id'.
 * @param req - Express request.
 * @param res - Express response.
 * @returns '200' with the matching MedicationDocument.
 * @returns '404' if no medication matches the 'id'
 * 
 */
export async function getMedicationById(req: Request, res: Response) {
  try {
    const medication = await Medications.findById(req.params.id);
    if (!medication) {
      return res.status(404).send({ message: 'Medication not found' });
    }
    return res.status(200).send(medication);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}
/**
 * Returns a medication documents from the database by national code.
 * @param req - Express request.
 * @param res - Express response.
 * @returns '200' with the matching MedicationDocument.
 * @returns '404' if no medication matches the 'id'
 * 
 */
export async function getMedicationByCode(req: Request, res: Response) {
  try {
    const medication = await Medications.findOne({ nationalCode: req.params.nationalCode });
    if (!medication) {
      return res.status(404).send({ message: 'Medication not found' });
    }
    return res.status(200).send(medication);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}
/**
 * Deletes a medication documents from the database by its commercial name.
 * @param req - Express request.
 * @param res - Express response.
 * @returns '200' with a confirmation message if the medication was delected.
 * @returns '400' if no medication name is provided in params or body.
 * @returns '404' if no medication matches the given commercial name.
 * 
 */
export async function deleteMedication(req: Request, res: Response) {
  try {
    const medicationName = req.params.name ?? req.body?.name;

    if (!medicationName) {
      return res.status(400).send({ message: 'Medication name is required' });
    }

    const result = await Medications.deleteOne({ 'name.comercialName': medicationName });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: 'Medication not found' });
    }

    return res.status(200).send({ message: 'Medication deleted successfully' });
  } catch (error) {
    sendErrorResponse(res, error);
  }
}
/**
 * Deletes a medication documents from the database by '_id'.
 * @param req - Express request.
 * @param res - Express response.
 * @returns '200' with a confirmation message if the medication was delected.
 * @returns '404' if no medication matches the given commercial name.
 * 
 */
export async function deleteMedicationById(req: Request, res: Response) {
  try {
    const medication = await Medications.findByIdAndDelete(req.params.id);
    if (!medication) {
      return res.status(404).send({ message: 'Medication not found' });
    }
    return res.status(200).send({ message: 'Medication deleted successfully' });
  } catch (error) {
    sendErrorResponse(res, error);
  }
} 
/**
 * Deletes all medications documents from the database.
 * @param req - Express request.
 * @param res - Express response.
 * @returns '200' with a message indicating how many documents were deleted.
 * 
 */
export async function deleteAllMedications(req: Request, res: Response) {
  try {
    const result = await Medications.deleteMany({});
    return res.status(200).send({ message: `${result.deletedCount} medications deleted successfully` });
  } catch (error) {
    sendErrorResponse(res, error);
  }
}