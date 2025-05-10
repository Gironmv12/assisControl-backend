import express from 'express';  
import asistenciaController from '../controller/admin/asistencias.controller.js';

const router  = express.Router();

// Vinculamos el router del controlador a la ruta '/asistencias'
router.use('/asistencias', asistenciaController);

export default router;