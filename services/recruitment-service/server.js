const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { sequelize } = require('./src/models');
const initializeDatabase = require('./src/config/initDb');
const recruitmentRoutes = require('./src/routes/recruitmentRoutes');
const { errorHandler } = require('./src/middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/recruitment', recruitmentRoutes);

app.get('/', (req, res) => {
  res.send('Recruitment Service is running');
});

// Error Handling Middleware (must be after routes)
app.use(errorHandler);

// Database Initialization and Server Start
async function startServer() {
  try {
    // Ensure Database exists
    await initializeDatabase();

    // Sync Models
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Recruitment Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();
