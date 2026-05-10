import express, { NextFunction, Request, Response } from 'express';
import './db/database.js';
import { PatientRouter } from './patients/patientRouter.js';
import { StaffRouter } from './staff/staffRouter.js';
import { MedicationsRouter } from './medications/medicationsRouter.js';
import { RecordsRouter } from './records/recordsRouter.js';
import { defaultRouter } from './routers/defaultRouter.js';
import { sendErrorResponse } from './utils/http.js';

export const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('¡API funcionando correctamente!');
});

app.use('/patients', PatientRouter);
app.use('/staff', StaffRouter);
app.use('/medications', MedicationsRouter);
app.use('/records', RecordsRouter);


app.use(defaultRouter);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
	sendErrorResponse(res, error);
});



export default app;
