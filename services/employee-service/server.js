// server.js
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import sequelize from './src/config/db.js';
import initializeDatabase from './src/config/initDb.js';
import seedPositions from './src/config/seed.js';
import appLogic from './app.js'; // This has current route mounts

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Main App Logic (Routes: /api/employees, /api/positions)
app.use(appLogic);

// Root test
app.get('/', (req, res) => {
  res.send('Employee Service & Gateway is running');
});

// Start server and sync DB
async function startServer() {
  try {
    // 1. Ensure DB exists
    await initializeDatabase();

    // 2. Connect and Sync
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');

    // 3. Seed default data
    await seedPositions();

    app.listen(PORT, () => {
      console.log(`Employee Service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Employee Service:', error);
  }
}

startServer();
