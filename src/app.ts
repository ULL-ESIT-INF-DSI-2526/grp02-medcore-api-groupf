import express from 'express';
import './db/database.js';
import { PatientRouter } from './patients/patientRouter.js';
import { defaultRouter } from './routers/defaultRouter.js';

export const app = express();
app.use(express.json());
app.use(PatientRouter);
app.use(defaultRouter);

export default app;
