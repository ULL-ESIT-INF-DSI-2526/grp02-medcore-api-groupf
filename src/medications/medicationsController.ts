import { Request, Response } from 'express';
import { Medications } from '../models/medications.js';
import { sendErrorResponse } from '../utils/http.js';

export async function createMedication(req: Request, res: Response) {
  const medication = new Medications(req.body);

  medication.save().then((medication) => {
    return res.status(201).send(medication);
  }).catch((error) => {
    sendErrorResponse(res, error);
  });
}

export async function getAllMedications(req: Request, res: Response) {
  try {
    const medications = await Medications.find();
    return res.status(200).send(medications);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}

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

export async function deleteAllMedications(req: Request, res: Response) {
  try {
    const result = await Medications.deleteMany({});
    return res.status(200).send({ message: `${result.deletedCount} medications deleted successfully` });
  } catch (error) {
    sendErrorResponse(res, error);
  }
}