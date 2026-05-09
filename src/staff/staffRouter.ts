import express from 'express';
import { createStaff, findStaffById, getAllStaff, updateStaff, deleteStaff, deleteStaffById } from './staffController.js';

export const StaffRouter = express.Router();

StaffRouter.post('/staff', createStaff);
StaffRouter.get('/staff', getAllStaff);
StaffRouter.get('/staff/:id', findStaffById);
StaffRouter.patch('/staff/:id', updateStaff);
StaffRouter.put('/staff/:id', updateStaff);
StaffRouter.delete('/staff', deleteStaff);
StaffRouter.delete('/staff/:id', deleteStaffById); 