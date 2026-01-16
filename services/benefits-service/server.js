const express = require('express');
const app = express();
const benefitsRoutes = require('./src/routes/benefitsRoutes');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use('/api/benefits', benefitsRoutes);

app.get('/', (req, res) => {
  res.send('benefits-service is running');
});

app.listen(PORT, () => {
  console.log(`benefits-service running on port ${PORT}`);
});
