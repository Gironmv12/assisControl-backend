import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { sequelize } from '../../config/database.js';
import initModels from '../../models/init-models.js';

const models = initModels(sequelize);
const { usuarios: Usuarios, roles: Roles, personas: Personas } = models;

const auth = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'secretKey'; // Usa variable de entorno

// Función para buscar usuario por username
async function buscarUsuario(username) {
  return await Usuarios.findOne({
    where: { username },
    include: [
      { model: Roles, as: 'rol' },
      { model: Personas, as: 'persona' }
    ]
  });
}

// Función para verificar password
async function verificarPassword(inputPassword, storedHash) {
  return await bcrypt.compare(inputPassword, storedHash);
}

// Función para generar JWT
function generarToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      rol: user.rol.nombre,
      personaId: user.persona.id
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// Función para construir respuesta
function construirRespuesta(user, token) {
  return {
    token,
    rol: user.rol.nombre,
    persona: {
      nombre: user.persona.nombre,
      apellido_paterno: user.persona.apellido_paterno,
      apellido_materno: user.persona.apellido_materno,
      curp: user.persona.curp,
      correo: user.persona.correo
    }
  };
}

auth.post('/login', [
  body('username').notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password } = req.body;

    // Busca usuario
    const user = await buscarUsuario(username);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verifica password
    const isMatch = await verificarPassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Genera token
    const token = generarToken(user);

    // Construye y envía respuesta
    const respuesta = construirRespuesta(user, token);
    res.json(respuesta);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', detail: error.message });
  }
});

export default auth;