import Sequelize from 'sequelize';

export default (sequelize, DataTypes) => {
  return usuarios.init(sequelize, DataTypes);
}

class usuarios extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      persona_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'personas',
          key: 'id'
        }
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: "usuarios_username_key"
      },
      password_hash: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      rol_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        }
      }
    }, {
      sequelize,
      tableName: 'usuarios',
      schema: 'public',
      timestamps: false,
      indexes: [
        {
          name: "usuarios_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "usuarios_username_key",
          unique: true,
          fields: [
            { name: "username" },
          ]
        },
      ]
    });
  }
}