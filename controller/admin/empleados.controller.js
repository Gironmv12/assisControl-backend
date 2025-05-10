import express from 'express';
import { sequelize } from '../../config/database.js';
import { Op } from 'sequelize';
import initModels from '../../models/init-models.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

const { empleados: Empleados, personas: Personas, roles: Roles, usuarios: Usuarios, horarios_laborales: HorariosLaborales } = initModels(sequelize);
const empleados = express.Router();

const ROLES = { EMPLEADO: 'empleado' };


// Función para crear una persona
async function crearPersona(data, transaction) {
  return await models.personas.create(data, { transaction });
}

// Función para obtener un rol por nombre
async function obtenerRol(nombre, transaction) {
  return await models.roles.findOne({ where: { nombre } }, { transaction });
}

// Función para verificar si un username ya existe
async function usernameExiste(username) {
  return await models.usuarios.findOne({ where: { username } });
}

// Función para crear un usuario
async function crearUsuario(data, transaction) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return await models.usuarios.create({
    persona_id: data.persona_id,
    username: data.username,
    password_hash: hashedPassword,
    rol_id: data.rol_id
  }, { transaction });
}

// Función para crear un empleado
async function crearEmpleado(data, transaction) {
  return await models.empleados.create(data, { transaction });
}

async function obtenerSiguienteNumeroIdentificador(transaction) {
    const max = await models.empleados.max('numero_identificador', { transaction });
    return (max || 0) + 1;
  }

empleados.post('/crear', [
    body('nombre').notEmpty(),
    body('apellido_paterno').notEmpty(),
    body('curp').notEmpty(),
    body('correo').isEmail(),
    body('telefono').optional(),
    body('username').notEmpty(),
    body('password').notEmpty(),
    body('puesto').optional(),
    body('departamento').optional()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
    const t = await sequelize.transaction();
    try {
      const {
        nombre, apellido_paterno, apellido_materno, curp,
        correo, telefono, username, password,
        puesto, departamento
      } = req.body;
  
      // 1. Crear persona
      const persona = await Personas.create({
        nombre,
        apellido_paterno,
        apellido_materno,
        curp,
        correo,
        telefono
      }, { transaction: t });
  
      // 2. Obtener rol 'empleado'
      const rol = await Roles.findOne({ where: { nombre: ROLES.EMPLEADO } }, { transaction: t });
      if (!rol) {
        await t.rollback();
        return res.status(400).json({ error: 'Rol empleado no encontrado' });
      }
  
      // 3. Verificar username
      if (await Usuarios.findOne({ where: { username } })) {
        await t.rollback();
        return res.status(400).json({ error: 'El username ya está en uso' });
      }
  
      // 4. Crear usuario con rol 'empleado'
      const hashedPassword = await bcrypt.hash(password, 10);
      const usuario = await Usuarios.create({
        persona_id: persona.id,
        username,
        password_hash: hashedPassword,
        rol_id: rol.id
      }, { transaction: t });
  
      // 5. Generar número identificador
      const max = await Empleados.max('numero_identificador', { transaction: t });
    // Empieza desde 1000 como mínimo
    const numero_identificador = (max && max >= 1000) ? max + 1 : 1000;
  
      // 6. Crear empleado
    const empleado = await Empleados.create({
      usuario_id: usuario.id,
      puesto,
      departamento,
      numero_identificador
    }, { transaction: t });

    // 7. Crear horarios laborales
    if (req.body.horarios && Array.isArray(req.body.horarios)) {
      for (const horario of req.body.horarios) {
        await HorariosLaborales.create({
          empleado_id: empleado.id,
          dia_semana: horario.dia_semana,
          hora_inicio: horario.hora_inicio,
          hora_fin: horario.hora_fin
        }, { transaction: t });
      }
    }
      await t.commit();
      res.status(201).json({ empleado });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: error.message });
    }
});
  
// Obtener todos los empleados
empleados.get('/', async (req, res) => {
  try {
    const empleadosList = await Empleados.findAll({
      include: [
        {
          model: Usuarios,
          as: 'usuario',
          include: [
            {
              model: Personas,
              as: 'persona'
            },
          ]
        },
        {
          model: HorariosLaborales,
          as: 'horarios_laborales'
        }
      ]
    });
    res.status(200).json(empleadosList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un empleado por ID
empleados.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const empleado = await Empleados.findByPk(id, {
      include: [
        {
          model: Usuarios,
          as: 'usuario',
          include: [
            {
              model: Personas,
              as: 'persona'
            }
          ]
        },
        {
          model: HorariosLaborales,
          as: 'horarios_laborales'
        }
      ]
    });
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.status(200).json(empleado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un empleado
empleados.put('/:id', [
  body('nombre').optional().notEmpty(),
  body('apellido_paterno').optional().notEmpty(),
  body('apellido_materno').optional().notEmpty(),
  body('curp').optional().notEmpty(),
  body('correo').optional().isEmail(),
  body('telefono').optional(),
  body('puesto').optional(),
  body('departamento').optional(),
  body('rol').optional().notEmpty() // nueva validación para rol
], async (req, res) => {
const { id } = req.params;
const errors = validationResult(req);
if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

const t = await sequelize.transaction();
try {
  // Buscar empleado
  const empleado = await Empleados.findByPk(id, { transaction: t });
  if (!empleado) {
    await t.rollback();
    return res.status(404).json({ error: 'Empleado no encontrado' });
  }

  // Desestructurar campos desde req.body
  const {
    nombre, apellido_paterno, apellido_materno,
    curp, correo, telefono, puesto, departamento, horarios, rol
  } = req.body;

  // Actualizar persona
  await Personas.update({
    nombre,
    apellido_paterno,
    apellido_materno,
    curp,
    correo,
    telefono
  }, {
    where: { id: empleado.usuario_id },
    transaction: t
  });

  // Actualizar rol del usuario si se provee en la petición
  if (rol) {
    const rolNuevo = await Roles.findOne({ where: { nombre: rol } }, { transaction: t });
    if (!rolNuevo) {
      await t.rollback();
      return res.status(400).json({ error: 'Rol no encontrado' });
    }
    await Usuarios.update({
      rol_id: rolNuevo.id
    }, {
      where: { id: empleado.usuario_id },
      transaction: t
    });
  }

  // Actualizar empleado
  await Empleados.update({
    puesto,
    departamento
  }, {
    where: { id },
    transaction: t
  });

  // Actualizar horarios laborales si se provee el array
  if (horarios && Array.isArray(horarios)) {
    // Elimina horarios actuales del empleado
    await HorariosLaborales.destroy({
      where: { empleado_id: empleado.id },
      transaction: t
    });

    // Crea nuevos horarios
    for (const horario of horarios) {
      await HorariosLaborales.create({
        empleado_id: empleado.id,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin
      }, { transaction: t });
    }
  }

  await t.commit();
  res.status(200).json({ message: 'Empleado actualizado' });
} catch (error) {
  await t.rollback();
  res.status(500).json({ error: error.message });
}
});

// Eliminar un empleado
empleados.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  try {
    const empleado = await Empleados.findByPk(id, { transaction: t });
    if (!empleado) {
      await t.rollback();
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
  
    // Eliminar empleado
    await Empleados.destroy({ where: { id }, transaction: t });
  
    // Eliminar usuario
    await Usuarios.destroy({ where: { id: empleado.usuario_id }, transaction: t });
  
    // Eliminar persona
    await Personas.destroy({ where: { id: empleado.usuario_id }, transaction: t });
  
    await t.commit();
    res.status(200).json({ message: 'Empleado eliminado' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
});

//buscar empleado por nombre apellidos 
empleados.get('/buscar/:nombre', async (req, res) => {
  const { nombre } = req.params;
  try {
    const empleadosList = await Empleados.findAll({
      where: {
        [Op.or]: [
          { '$usuario.persona.nombre$': { [Op.like]: `%${nombre}%` } },
          { '$usuario.persona.apellido_paterno$': { [Op.like]: `%${nombre}%` } },
          { '$usuario.persona.apellido_materno$': { [Op.like]: `%${nombre}%` } }
        ]
      },
      include: [
        {
          model: Usuarios,
          as: 'usuario',
          include: [
            {
              model: Personas,
              as: 'persona'
            }
          ]
        }
      ]
    });
    res.status(200).json(empleadosList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default empleados;