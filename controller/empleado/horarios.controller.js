import express from 'express';
import { sequelize } from '../../config/database.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import initModels from '../../models/init-models.js';

const horarios = express.Router();
const models = initModels(sequelize);
const { empleados, horarios_laborales } = models;

// Función para buscar empleado por usuario_id
async function buscarEmpleadoPorUsuario(usuario_id) {
  const empleado = await empleados.findOne({ where: { usuario_id } });
  if (!empleado) {
    throw new Error('Empleado no encontrado para el usuario');
  }
  return empleado;
}

// Función para obtener horarios laborales por empleado_id
async function obtenerHorariosPorEmpleado(empleado_id) {
  return await horarios_laborales.findAll({
    where: { empleado_id },
    order: [['dia_semana', 'ASC']]
  });
}

horarios.get('/', authMiddleware, async (req, res) => {
  try {
    const usuario_id = req.user.userId;
    // Buscar empleado
    const empleado = await buscarEmpleadoPorUsuario(usuario_id);
    // Obtener horarios
    const horariosAsignados = await obtenerHorariosPorEmpleado(empleado.id);
    res.status(200).json({ horarios: horariosAsignados });
  } catch (error) {
    console.error('Error al consultar horarios:', error);
    if (error.message === 'Empleado no encontrado para el usuario') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al obtener los horarios', detail: error.message });
    }
  }
});

export default horarios;