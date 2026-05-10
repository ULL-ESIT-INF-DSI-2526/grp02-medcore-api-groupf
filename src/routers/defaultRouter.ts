import express from 'express';

export const defaultRouter = express.Router();

defaultRouter.all('/{*splat}', (_, res) => {
  res.status(404).json({ message: 'Route not found' });
});