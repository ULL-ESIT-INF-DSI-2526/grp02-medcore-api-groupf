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

export async function getAllMedications(req: Request, res: Response) {
  try {
    const medications = await Medications.find();
    res.send(medications);
  } catch (error) {
    res.status(400).send(error);
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

    res.send(medication);
  } catch (error) {
    res.status(400).send(error);
  }
}

export async function getMedicationByCode(req: Request, res: Response) {
  try {
    const medication = await Medications.findOne({ nationalCode: req.params.nationalCode });
    if (!medication) {
      return res.status(404).send({ message: 'Medication not found' });
    }
    res.send(medication);
  } catch (error) {
    res.status(400).send(error);
  }
}


export async function deleteMedication(req: Request, res: Response) {
  try {
    const medication = await Medications.findByIdAndDelete(req.params.id);
    if (!medication) {
      return res.status(404).send({ message: 'Medication not found' });
    }
    res.send({ message: 'Medication deleted successfully' });
  } catch (error) {
    res.status(400).send(error);
  }
} 