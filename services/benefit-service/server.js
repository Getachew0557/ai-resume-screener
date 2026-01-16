const express = require('express');
const app = express();
const cors = require('cors'); // Ensure you have cors installed
require('dotenv').config();

// 1. Import ONLY Benefit Routes
const benefitRoutes = require('./src/routes/benefitRoutes');

app.use(cors());
app.use(express.json());

// 2. Use ONLY Benefit Routes
app.use('/api/benefits', benefitRoutes);

// Database Sync (Optional depending on your setup)
const sequelize = require('./src/config/db');
sequelize.sync().then(() => {
  console.log("Benefit Database connected and synced.");
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Benefit Microservice running on port ${PORT}`);
});