import express from 'express';
import dashboardController from '../controller/admin/dashboard.controller.js';

const router = express.Router();

// Vinculamos el router del controlador a la ruta '/dashboard'
router.use('/dashboard', dashboardController);

export default router;