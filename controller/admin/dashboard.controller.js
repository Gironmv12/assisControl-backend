import express from 'express';
import { sequelize } from '../../config/database.js';
import initModels from '../../models/init-models.js';

const dashboard = express.Router();
const models = initModels(sequelize);
const { empleados: Empleados, personas: Personas, usuarios: Usuarios, roles: Roles, horarios_laborales: HorariosLaborales, registro_asistencia: RegistroAsistencia  } = models;

// GET /admin/empleados para listar empleados.
dashboard.get('/empleados', async (req, res) => {
  try {
    const empleados = await Empleados.findAll({
      include: [
        {
          model: Usuarios,
          as: 'usuario',
          include: [
            { model: Personas, as: 'persona' }
          ]
        }
      ]
    });
    res.status(200).json(empleados);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

//GET /admin/usuarios para mostrar usuarios.
dashboard.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuarios.findAll({
      include: [
        { model: Personas, as: 'persona' }
      ]
    });
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

//GET /admin/roles para consultar roles.
dashboard.get('/roles', async (req, res) => {
  try {
    const roles = await Roles.findAll();
    res.status(200).json(roles);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
});

//GET /admin/asistencias para ver registros de asistencia.
dashboard.get('/asistencias', async (req, res) => {
  try {
    const asistencias = await RegistroAsistencia.findAll({
      include: [
        { model: Usuarios, as: 'usuario' }
      ]
    });
    res.status(200).json(asistencias);
  } catch (error) {
    console.error('Error al obtener asistencias:', error);
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
});

//GET /admin/horarios para revisar horarios laborales.
dashboard.get('/horarios', async (req, res) => {
  try {
    const horarios = await HorariosLaborales.findAll({
      include: [
        { model: Empleados, as: 'empleado' }
      ]
    });
    res.status(200).json(horarios);
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    res.status(500).json({ error: 'Error al obtener horarios' });
  }
});
export default dashboard;