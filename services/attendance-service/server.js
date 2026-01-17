const express = require('express');
const cors = require("cors");
const app = express();
const db = require('./src/models');
const attendanceRoutes = require('./src/routes/attendanceRoutes.js');
const PORT = process.env.PORT || 3004;
const initializeDatabase = require('./src/config/initDb');

app.use(cors());
app.use(express.json());

app.use('/api/attendance', attendanceRoutes);

// Initialize DB and Start Server
const startServer = async () => {
  await initializeDatabase();

  // Sync Database
  db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('Unable to connect to database:', err);
  });
};

startServer();
