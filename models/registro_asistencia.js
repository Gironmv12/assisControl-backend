import Sequelize from 'sequelize';

export default (sequelize, DataTypes) => {
  return registro_asistencia.init(sequelize, DataTypes);
}

class registro_asistencia extends Sequelize.Model {
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
        }
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      hora_entrada: {
        type: DataTypes.TIME,
        allowNull: true
      },
      hora_salida: {
        type: DataTypes.TIME,
        allowNull: true
      },
      registro_manual: {
        type: DataTypes.STRING(100),
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'registro_asistencia',
      schema: 'public',
      timestamps: false,
      indexes: [
        {
          name: "registro_asistencia_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    });
  }
}