import express from 'express';
import horariosController from '../controller/empleado/horarios.controller.js';

const router  = express.Router();

// Vinculamos el router del controlador a la ruta '/horarios'
router.use('/horarios', horariosController);

export default router;