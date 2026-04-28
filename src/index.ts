import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT ?? 3000);

console.log(`MedCore API configured on port ${port}`);
