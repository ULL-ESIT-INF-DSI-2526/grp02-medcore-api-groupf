import express from 'express';
import { createStaff, findStaffById, getAllStaff, updateStaff, deleteStaff, deleteStaffById } from './staffController.js';

export const StaffRouter = express.Router();

StaffRouter.post('/', createStaff);
StaffRouter.get('/', getAllStaff);
StaffRouter.get('/:id', findStaffById);
StaffRouter.patch('/:id', updateStaff);
StaffRouter.put('/:id', updateStaff);
StaffRouter.delete('/', deleteStaff);
StaffRouter.delete('/:id', deleteStaffById);