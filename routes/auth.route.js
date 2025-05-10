import express from 'express';
import authController from '../controller/auth/auth.controller.js';

const router  = express.Router();

// Vinculamos el router del controlador a la ruta '/auth'
router.use('/auth', authController);

export default router;