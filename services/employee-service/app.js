// app.js
import express from 'express';
import employeeRoutes from './src/routes/employee.routes.js';
import positionRoutes from './src/routes/position.routes.js';

const app = express();
app.use(express.json());

// Mount routes
app.use('/api/employees', employeeRoutes);
app.use('/api/positions', positionRoutes);

export default app;
