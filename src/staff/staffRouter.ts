import express from 'express';
import { createStaff } from './staffController.js';

export const StaffRouter = express.Router();

StaffRouter.post('/staff', createStaff);