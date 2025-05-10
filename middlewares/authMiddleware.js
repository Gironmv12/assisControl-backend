import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secretKey';

// Función para extraer el token del header
function extraerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token no proporcionado o mal formateado');
  }
  return authHeader.split(' ')[1];
}

// Función para verificar el token
function verificarToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido');
  }
}

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extraerToken(authHeader);
    const decoded = verificarToken(token);
    req.user = {
        userId: decoded.userId,
        rol: decoded.rol, 
        personaId: decoded.personaId
      };
      
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}