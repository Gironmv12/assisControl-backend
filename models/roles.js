import Sequelize from 'sequelize';

export default (sequelize, DataTypes) => {
  return roles.init(sequelize, DataTypes);
}

class roles extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      nombre: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: "roles_nombre_key"
      }
    }, {
      sequelize,
      tableName: 'roles',
      schema: 'public',
      timestamps: false,
      indexes: [
        {
          name: "roles_nombre_key",
          unique: true,
          fields: [
            { name: "nombre" },
          ]
        },
        {
          name: "roles_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    });
  }
}