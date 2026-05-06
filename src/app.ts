import express from 'express';
import PatientRouter from './routes/patientRouter.js';

const app = express();

app.use(express.json());

app.use('/patients', PatientRouter);

export default app;
