import { Request, Response } from 'express';
import { Staff } from '../models/staff.js';

export async function createStaff(req: Request, res: Response) {
  const staff = new Staff(req.body);

  staff.save().then((staff) => {
    res.status(201).send(staff);
  }).catch((error) => {
    res.status(400).send(error);
  });
}