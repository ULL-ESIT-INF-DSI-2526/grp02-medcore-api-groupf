import express from 'express';
import './db/database.js';
import { PatientRouter } from './patients/patientRouter.js';
import { StaffRouter } from './staff/staffRouter.js';
import { MedicationsRouter } from './medications/medicationsRouter.js';
import { RecordsRouter } from './records/recordsRouter.js';
import { defaultRouter } from './routers/defaultRouter.js';

export const app = express();
app.use(express.json());
app.use(PatientRouter);
app.use(StaffRouter);
app.use(MedicationsRouter);
app.use(RecordsRouter);
app.use(defaultRouter);

export default app;
