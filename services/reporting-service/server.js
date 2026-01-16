const express = require('express');
const app = express();
const reportingRoutes = require('./src/routes/reportingRoutes');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use('/api/reporting', reportingRoutes);

app.get('/', (req, res) => {
  res.send('reporting-service is running');
});

app.listen(PORT, () => {
  console.log(`reporting-service running on port ${PORT}`);
});
