import { Request, Response } from 'express';
import { Staff } from '../models/staff.js';
import { sendErrorResponse } from '../utils/http.js';

export async function createStaff(req: Request, res: Response) {
  try{
    const staff = new Staff(req.body);
    const savedStaff = await staff.save();
    res.status(201).send(savedStaff);
  } catch (error){
    sendErrorResponse(res, error);
  }
}

export async function getAllStaff(req: Request, res: Response){
  try{
    const staff = await Staff.find();
    res.send(staff);
  }catch (error){
    sendErrorResponse(res, error);
  }
}

export async function updateStaff(req: Request, res: Response) {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      context: 'query'
    });

    if (!staff) {
      return res.status(404).send({ message: 'Staff not found' });
    }

    res.send(staff);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}

export async function findStaffById(req: Request, res: Response) {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).send({ message: 'Staff not found' });
    }
    res.send(staff);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}

export async function deleteStaff(req: Request, res: Response) {
  try {
    const fullName = req.body?.fullName;
    const filter = fullName ? { fullName } : {};
    const result = await Staff.deleteMany(filter);
    res.send(result);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}

export async function deleteStaffById(req: Request, res: Response) {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).send({ message: 'Staff not found' });
    }
    res.send({ message: 'Staff deleted successfully' });
  } catch (error) {
    sendErrorResponse(res, error);
  }
}