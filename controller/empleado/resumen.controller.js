import express from 'express';
import { sequelize } from '../../config/database.js';
import initModels from '../../models/init-models.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import { Op } from 'sequelize'

const resumen = express.Router();
const models = initModels(sequelize);

const { empleados: Empleados, personas: Personas, usuarios: Usuarios, horarios_laborales: HorariosLaborales, registro_asistencia: RegistroAsistencia  } = models;

// GET inicio/resumen 

resumen.get('/resumen', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    
    // 1. Nombre completo
    const usuario = await Usuarios.findOne({
      where: { id: userId },
      include: [{ model: Personas, as: 'persona' }],
    });
    const { nombre, apellido_paterno, apellido_materno } = usuario.persona;
    const nombre_completo = `${nombre} ${apellido_paterno} ${apellido_materno || ''}`.trim();

    // 2. Asistencia hoy
    const hoy = new Date();
    const asistenciaHoy = await RegistroAsistencia.findOne({
      where: {
        usuario_id: userId,
        fecha: hoy,
      },
    });
    const asistencia_hoy = !!asistenciaHoy;

    // 3. Horario del día
    const empleado = await Empleados.findOne({ where: { usuario_id: userId } });
    const diasSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    const diaActual = diasSemana[hoy.getDay()];
    const horarioDelDia = await HorariosLaborales.findOne({
      where: {
        empleado_id: empleado.id,
        dia_semana: diaActual
      }
    });

    // 4. Asistencias del mes
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const asistencias_del_mes = await RegistroAsistencia.count({
      where: {
        usuario_id: userId,
        fecha: { [Op.gte]: inicioMes }
      }
    });

    // 5. Última asistencia
    const ultimaAsistencia = await RegistroAsistencia.findOne({
      where: { usuario_id: userId },
      order: [
        ['fecha', 'DESC'],
        ['hora_entrada', 'DESC']
      ],
    });

    res.json({
      nombre_completo,
      asistencia_hoy,
      horario_del_dia: horarioDelDia ? {
        dia: diaActual,
        hora_inicio: horarioDelDia.hora_inicio,
        hora_fin: horarioDelDia.hora_fin
      } : null,
      asistencias_del_mes,
      ultima_asistencia: ultimaAsistencia
        ? {
            fecha: ultimaAsistencia.fecha,
            hora_entrada: ultimaAsistencia.hora_entrada,
            hora_salida: ultimaAsistencia.hora_salida
          }
        : null,
      avisos: "Los empleados deben registrar su entrada y salida diariamente usando la aplicación móvil. En caso de problemas técnicos, comuníquese con el departamento de TI."
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default resumen;