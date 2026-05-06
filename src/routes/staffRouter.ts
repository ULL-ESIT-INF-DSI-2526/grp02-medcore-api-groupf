import express from 'express';
import { createStaff } from '../models/staff.js';


export const StaffRouter = express.Router();

StaffRouter.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const body = req.body;
    const created = await createStaff(body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res
      .status(400)
      .json({ error: err.message || 'Failed to create staff member' });
  }
});

export default StaffRouter;