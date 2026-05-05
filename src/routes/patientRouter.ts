import express from "express";
import { createPatient } from "../models/patient.js";

export const PatientRouter = express.Router();

PatientRouter.post("/", async (req: express.Request, res: express.Response) => {
	try {
		const body = req.body;

		// Normalize/parse dateOfBirth if provided as string
		if (body.dateOfBirth && typeof body.dateOfBirth === "string") {
			body.dateOfBirth = new Date(body.dateOfBirth);
		}

		const created = await createPatient(body);
		return res.status(201).json(created);
	} catch (err: any) {
		return res.status(400).json({ error: err.message || "Failed to create patient" });
	}
});

export default PatientRouter;