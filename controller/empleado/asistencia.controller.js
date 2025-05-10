import express from 'express';
import { sequelize } from '../../config/database.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import initModels from '../../models/init-models.js';

const models = initModels(sequelize);
const { registro_asistencia } = models;

const empleadoRoute = express.Router();

// Ruta para registrar asistencia
empleadoRoute.post('/registrar-asistencia', authMiddleware, async (req, res) => {
    const usuario_id = req.user.userId;
  
    try {
      await sequelize.query('SELECT registrar_asistencia(:usuario_id, :manual)', {
        replacements: {
          usuario_id,
          manual: 'empleado'
        }
      });
  
      res.status(200).json({ mensaje: 'Asistencia registrada correctamente.' });
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      res.status(500).json({ error: 'No se pudo registrar la asistencia', detail: error.message });
    }
});

// Ruta para consultar asistencias sin usar sequelize.query
empleadoRoute.get('/consultar-asistencias', authMiddleware, async (req, res) => {
    const usuario_id = req.user.userId;
    try {
        const asistencias = await registro_asistencia.findAll({
            where: { usuario_id },
            order: [['fecha', 'DESC']]
        });
        res.status(200).json({ asistencias });
    } catch (error) {
        console.error('Error al consultar asistencias:', error);
        res.status(500).json({ error: 'No se pudo consultar las asistencias', detail: error.message });
    }
});

export default empleadoRoute;