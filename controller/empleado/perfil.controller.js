import express from 'express';
import { sequelize } from '../../config/database.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import initModels from '../../models/init-models.js';

const perfilRoute = express.Router();
const models = initModels(sequelize);
const { empleados, usuarios, registro_asistencia, personas } = models;

// Función para buscar usuario por ID
async function buscarUsuario(userId) {
  const usuario = await usuarios.findByPk(userId);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  return usuario;
}

// Función para buscar empleado por usuario_id
async function buscarEmpleado(usuario_id) {
  const empleado = await empleados.findOne({ where: { usuario_id } });
  if (!empleado) {
    throw new Error('Empleado no encontrado para el usuario');
  }
  return empleado;
}

// Función para buscar persona por persona_id
async function buscarPersona(persona_id) {
  const persona = await personas.findByPk(persona_id);
  if (!persona) {
    throw new Error('Datos personales no encontrados para el usuario');
  }
  return persona;
}

// Función para obtener las últimas 5 asistencias
async function obtenerAsistencias(usuario_id) {
  const asistencias = await registro_asistencia.findAll({
    where: { usuario_id },
    order: [['fecha', 'DESC']],
    limit: 5
  });
  return asistencias.length > 0 ? asistencias : 'No hay datos disponibles.';
}

// Función para construir el resumen del perfil
function construirResumenPerfil(usuario, empleado, asistencias) {
  return {
    datos_personales: {
      id: usuario.id,
      username: usuario.username,
      puesto: empleado.puesto,
      departamento: empleado.departamento,
      numero_identificador: empleado.numero_identificador
    },
    historial_asistencias: asistencias
  };
}

// Función para construir el perfil completo
function construirPerfilCompleto(usuario, persona, empleado) {
  return {
    datos_cuenta: {
      id: usuario.id,
      username: usuario.username
    },
    datos_personales: {
      nombre: persona.nombre,
      apellido_paterno: persona.apellido_paterno,
      apellido_materno: persona.apellido_materno,
      correo: persona.correo,
      telefono: persona.telefono
    },
    informacion_laboral: {
      puesto: empleado.puesto,
      departamento: empleado.departamento,
      numero_identificador: empleado.numero_identificador
    }
  };
}

// Endpoint para datos resumen
perfilRoute.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const usuario = await buscarUsuario(userId);
    const empleado = await buscarEmpleado(userId);
    const asistencias = await obtenerAsistencias(userId);
    const perfilResumen = construirResumenPerfil(usuario, empleado, asistencias);
    res.status(200).json(perfilResumen);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    if (error.message === 'Usuario no encontrado' || error.message === 'Empleado no encontrado para el usuario') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al obtener el perfil', detail: error.message });
    }
  }
});

// Endpoint para visualizar información completa del usuario
perfilRoute.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const usuario = await buscarUsuario(userId);
    const persona = await buscarPersona(usuario.persona_id);
    const empleado = await buscarEmpleado(userId);
    const perfilCompleto = construirPerfilCompleto(usuario, persona, empleado);
    res.status(200).json(perfilCompleto);
  } catch (error) {
    console.error('Error al obtener perfil completo:', error);
    if (error.message === 'Usuario no encontrado' || error.message === 'Datos personales no encontrados para el usuario' || error.message === 'Empleado no encontrado para el usuario') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al obtener el perfil completo', detail: error.message });
    }
  }
});

// Endpoint para actualizar datos personales
perfilRoute.put('/actualizar-me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nombre, apellido_paterno, apellido_materno, correo, telefono } = req.body;
    const usuario = await buscarUsuario(userId);
    const persona = await buscarPersona(usuario.persona_id);
    await persona.update({
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      telefono
    });
    res.status(200).json({ message: 'Datos personales actualizados correctamente' });
  } catch (error) {
    console.error('Error al actualizar datos personales:', error);
    if (error.message === 'Usuario no encontrado' || error.message === 'Datos personales no encontrados para el usuario') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al actualizar los datos personales', detail: error.message });
    }
  }
});

export default perfilRoute;