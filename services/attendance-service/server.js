const express = require('express');
const cors =require("cors")
const app = express();
const attendanceRoutes = require('./src/routes/attendanceRoutes.js');

app.use(express.json());
app.use(cors())

app.use('/api/attendance', attendanceRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
