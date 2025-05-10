import Sequelize from 'sequelize';

export default (sequelize, DataTypes) => {
  return personas.init(sequelize, DataTypes);
}

class personas extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      apellido_paterno: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      apellido_materno: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      curp: {
        type: DataTypes.CHAR(18),
        allowNull: false,
        unique: "personas_curp_key"
      },
      correo: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: "personas_correo_key"
      },
      telefono: {
        type: DataTypes.STRING(10),
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'personas',
      schema: 'public',
      timestamps: false,
      indexes: [
        {
          name: "personas_correo_key",
          unique: true,
          fields: [
            { name: "correo" },
          ]
        },
        {
          name: "personas_curp_key",
          unique: true,
          fields: [
            { name: "curp" },
          ]
        },
        {
          name: "personas_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    });
  }
}