import express from 'express';
import { sequelize } from '../../config/database.js';
import initModels from '../../models/init-models.js';
import { body, validationResult, query } from 'express-validator';
import { Op } from 'sequelize';


const asistencia = express.Router();
const models = initModels(sequelize);
const { registro_asistencia: Asistencia, empleados: Empleados, usuarios: Usuarios, personas: Personas } = models;

const REGISTRO_MANUAL_DEFAULT = 'admin';

// Función para validar empleado por su usuario_id
async function validarEmpleado(usuario_id) {
  const empleado = await Empleados.findOne({ where: { usuario_id } });
  if (!empleado) {
    throw new Error('Empleado no encontrado');
  }
  return empleado;
}

// Función para crear registro de asistencia
async function crearAsistencia(data) {
  return await Asistencia.create(data);
}

asistencia.post('/registrar', [
  body('fecha').isISO8601(),
  body('hora_entrada').optional().isISO8601(),
  body('hora_salida').optional().isISO8601(),
  body('registro_manual').optional().isString(),
  body('usuario_id').isInt() // validamos que se envíe usuario_id
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let { fecha, hora_entrada, hora_salida, registro_manual, usuario_id } = req.body;

  try {
    // Validar que exista un empleado con el usuario_id proporcionado
    await validarEmpleado(usuario_id);

    // Extraer solo la hora si se proporcionó hora_entrada y/o hora_salida
    if (hora_entrada) {
      const parts = hora_entrada.split('T');
      hora_entrada = parts.length > 1 ? parts[1] : hora_entrada;
    }
    if (hora_salida) {
      const parts = hora_salida.split('T');
      hora_salida = parts.length > 1 ? parts[1] : hora_salida;
    }

    // Crear el registro de asistencia
    const nuevaAsistencia = await crearAsistencia({
      fecha,
      hora_entrada,
      hora_salida,
      registro_manual: registro_manual || REGISTRO_MANUAL_DEFAULT,
      usuario_id
    });

    res.status(201).json({ asistencia: nuevaAsistencia });
  } catch (error) {
    console.error(error);
    if (error.message === 'Empleado no encontrado') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al registrar asistencia', detail: error.message });
    }
  }
});


asistencia.get(
  '/consultar',
  [
    query('usuario_id').optional().isInt(),
    query('fecha').optional().isISO8601(),
    query('fecha_inicio').optional().isISO8601(),
    query('fecha_fin').optional().isISO8601()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { usuario_id, fecha, fecha_inicio, fecha_fin } = req.query;
    
    try {
      const whereClause = {};
      if (usuario_id) whereClause.usuario_id = usuario_id;
      if (fecha) whereClause.fecha = fecha;
      if (fecha_inicio && fecha_fin) {
        whereClause.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
      }
      
      const asistencias = await Asistencia.findAll({
        where: whereClause,
        include: [
          {
            model: Usuarios,
                as: 'usuario',
                include: [
                  {
                    model: Personas,
                    as: 'persona',
                    attributes: ['nombre', 'apellido_paterno', 'apellido_materno']
                  }
                ]
          }
        ]
      });
      
      res.json(asistencias);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: 'Error al consultar asistencias', detail: error.message });
    }
  }
);

//actualizar entrada/salida 
asistencia.put('/actualizar/:id', [
    body('hora_entrada').optional().matches(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{3})?$/).withMessage('Invalid time format for hora_entrada'),
  body('hora_salida').optional().matches(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{3})?$/).withMessage('Invalid time format for hora_salida'),
  body('registro_manual').optional().isString()
  ], async (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    let { hora_entrada, hora_salida, registro_manual } = req.body;
  
    // Extraer solo la hora si se proporcionó hora_entrada y/o hora_salida
    if (hora_entrada) {
      const parts = hora_entrada.split('T');
      hora_entrada = parts.length > 1 ? parts[1] : hora_entrada;
    }
    if (hora_salida) {
      const parts = hora_salida.split('T');
      hora_salida = parts.length > 1 ? parts[1] : hora_salida;
    }
  
    try {
      const asistenciaEncontrada = await Asistencia.findByPk(id);
      if (!asistenciaEncontrada) {
        return res.status(404).json({ error: 'Asistencia no encontrada' });
      }
  
      if (hora_entrada) {
        asistenciaEncontrada.hora_entrada = hora_entrada;
      }
      if (hora_salida) {
        asistenciaEncontrada.hora_salida = hora_salida;
      }
      if (registro_manual) {
        asistenciaEncontrada.registro_manual = registro_manual;
      }
  
      await asistenciaEncontrada.save();
      res.json({ asistencia: asistenciaEncontrada });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar asistencia', detail: error.message });
    }
  });

  
export default asistencia;