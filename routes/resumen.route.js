import express from 'express';
import resumenController from '../controller/empleado/resumen.controller.js';

const router = express.Router();
// Vinculamos el router del controlador a la ruta '/resumen'
router.use('/inicio', resumenController);
export default router;