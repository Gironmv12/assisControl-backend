import express from 'express';
import empleadosController from '../controller/admin/empleados.controller.js';

const router  = express.Router();

// Vinculamos el router del controlador a la ruta '/empleados'
router.use('/empleados', empleadosController);

export default router;