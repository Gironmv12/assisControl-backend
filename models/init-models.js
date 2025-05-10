import { DataTypes } from "sequelize";
import _empleados from "./empleados.js";
import _horarios_laborales from "./horarios_laborales.js";
import _personas from "./personas.js";
import _registro_asistencia from "./registro_asistencia.js";
import _roles from "./roles.js";
import _usuarios from "./usuarios.js";

function initModels(sequelize) {
  const empleados = _empleados(sequelize, DataTypes);
  const horarios_laborales = _horarios_laborales(sequelize, DataTypes);
  const personas = _personas(sequelize, DataTypes);
  const registro_asistencia = _registro_asistencia(sequelize, DataTypes);
  const roles = _roles(sequelize, DataTypes);
  const usuarios = _usuarios(sequelize, DataTypes);

  horarios_laborales.belongsTo(empleados, { as: "empleado", foreignKey: "empleado_id"});
  empleados.hasMany(horarios_laborales, { as: "horarios_laborales", foreignKey: "empleado_id"});
  usuarios.belongsTo(personas, { as: "persona", foreignKey: "persona_id"});
  personas.hasMany(usuarios, { as: "usuarios", foreignKey: "persona_id"});
  usuarios.belongsTo(roles, { as: "rol", foreignKey: "rol_id"});
  roles.hasMany(usuarios, { as: "usuarios", foreignKey: "rol_id"});
  empleados.belongsTo(usuarios, { as: "usuario", foreignKey: "usuario_id"});
  usuarios.hasOne(empleados, { as: "empleado", foreignKey: "usuario_id"});
  registro_asistencia.belongsTo(usuarios, { as: "usuario", foreignKey: "usuario_id"});
  usuarios.hasMany(registro_asistencia, { as: "registro_asistencia", foreignKey: "usuario_id"});

  return {
    empleados,
    horarios_laborales,
    personas,
    registro_asistencia,
    roles,
    usuarios,
  };
}

export default initModels;