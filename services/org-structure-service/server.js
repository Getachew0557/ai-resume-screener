const express = require('express');
const app = express();
const cors = require('cors');
const sequelize = require('./src/config/db');
const initializeDatabase = require('./src/config/initDb');
require('dotenv').config();
const HOST = '127.0.0.1';
const PORT = process.env.PORT || 3006;
const departmentRoutes = require('./src/routes/departmentRoutes.js');
const jobCategoryRoutes = require('./src/routes/jobCategoryRoutes.js');
const benefitRoutes = require('./src/routes/benefitRoutes.js');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Organization Service is running');
});


app.use('/api/organization/departments', departmentRoutes);
app.use('/api/organization/job-categories', jobCategoryRoutes);
app.use('/api/organization/benefits', benefitRoutes);

async function startServer() {
  try {

    await initializeDatabase();
    console.log('Database created/verified successfully');

    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');

    app.listen(PORT, () => {
      console.log(`Organization Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
