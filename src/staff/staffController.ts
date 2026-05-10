import { Request, Response } from 'express';
import { Staff } from '../models/staff.js';
import { sendErrorResponse } from '../utils/http.js';

/**
 * Create a new Staff member document in the database.
 * @param req - Express request.
 * @param res - Express response.
 * @returns '201' with the created StaffDocument.
 * 
 */
export async function createStaff(req: Request, res: Response) {
  try{
    const staff = new Staff(req.body);
    const savedStaff = await staff.save();
    return res.status(201).send(savedStaff);
  } catch (error){
    sendErrorResponse(res, error);
  }
}
/**
 * Returns all staff member
 * @param req - Express request.
 * @param res - Express response.
 * @returns '200' with an array of StaffDocument.
 * 
 */
export async function getAllStaff(req: Request, res: Response){
  try{
    const staff = await Staff.find();
    return res.status(200).send(staff);
  }catch (error){
    sendErrorResponse(res, error);
  }
}
/**
 * Updates a staff member by '_id'
 * @param req - Express request.
 * @param res - Express response.
 * @returns '200' with the updated StaffDocument.
 * @returns '404' if no staff member matches the given 'id'.
 * 
 */
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

    return res.status(200).send(staff);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}
/**
 * Returns a staff member document by its '_id'
 * @param req - Express request.
 * @param res - Express response.
 * @returns '200' with the marching StaffDocument.
 * @returns '404' if no staff member matches the given 'id'.
 * 
 */
export async function findStaffById(req: Request, res: Response) {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).send({ message: 'Staff not found' });
    }
    return res.status(200).send(staff);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}
/**
 * Deletes a staff by fullName
 * @param req - Express request.
 * @param res - Express response.
 * @returns '200' with the number of documents deleted.
 * 
 */
export async function deleteStaff(req: Request, res: Response) {
  try {
    const fullName = req.body?.fullName;
    const filter = fullName ? { fullName } : {};
    const result = await Staff.deleteMany(filter);
    return res.status(200).send(result);
  } catch (error) {
    sendErrorResponse(res, error);
  }
}
/**
 * Deletes a staff member document by its '_id'
 * @param req - Express request.
 * @param res - Express response.
 * @returns '200' with a confirmation message if the staff was deleted.
 * @returns '404' if no staff member matches the given 'id'.
 * 
 */
export async function deleteStaffById(req: Request, res: Response) {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).send({ message: 'Staff not found' });
    }
    return res.status(200).send({ message: 'Staff deleted successfully' });
  } catch (error) {
    sendErrorResponse(res, error);
  }
}