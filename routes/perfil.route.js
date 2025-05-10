import express from 'express';
import perfilController from '../controller/empleado/perfil.controller.js';

const router  = express.Router();

// Vinculamos el router del controlador a la ruta '/perfil'
router.use('/perfil', perfilController);

export default router;