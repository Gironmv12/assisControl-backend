import Sequelize from 'sequelize';

export default (sequelize, DataTypes) => {
  return empleados.init(sequelize, DataTypes);
}

class empleados extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        unique: "empleados_usuario_id_key"
      },
      puesto: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      departamento: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      numero_identificador: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: "empleados_numero_identificador_key"
      }
    }, {
      sequelize,
      tableName: 'empleados',
      schema: 'public',
      timestamps: false,
      indexes: [
        {
          name: "empleados_numero_identificador_key",
          unique: true,
          fields: [
            { name: "numero_identificador" },
          ]
        },
        {
          name: "empleados_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "empleados_usuario_id_key",
          unique: true,
          fields: [
            { name: "usuario_id" },
          ]
        },
      ]
    });
  }
}