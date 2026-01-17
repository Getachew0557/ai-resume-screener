import "dotenv/config";
import express from 'express';
import sequelize from './src/config/db.js';
import initializeDatabase from './src/config/init_db.js';
import cors from 'cors';

const app = express();

import leaveRoutes from './src/routes/leaveRoutes.js';

const PORT = process.env.PORT || 3003;
const HOST = process.env.HOST || "localhost";

app.use(express.json());
app.use(cors());
app.use('/api/leave', leaveRoutes);

app.get("/", (_req, res) => {
  res.send({ message: 'leave service is running' });
})

async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database created/verified successfully');

    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');

    app.listen(PORT, HOST, () => {
      console.log(`leave service running on port: ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
