import app from './app.js';
import { connectDB } from './db/database.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to the database:', err);
    process.exit(1); // Exit with failure code
  }
});
