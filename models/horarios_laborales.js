import Sequelize from 'sequelize';

export default (sequelize, DataTypes) => {
  return horarios_laborales.init(sequelize, DataTypes);
}

class horarios_laborales extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      empleado_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'empleados',
          key: 'id'
        }
      },
      dia_semana: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false
      },
      hora_fin: {
        type: DataTypes.TIME,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'horarios_laborales',
      schema: 'public',
      timestamps: false,
      indexes: [
        {
          name: "horarios_laborales_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    });
  }
}