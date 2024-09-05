'use strict';
import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class User extends Model {
  static associate(models) {
    // define association here
  }
}

User.init({
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  avatar: {
    type: DataTypes.STRING,
    defaultValue: "Daring",
  },
  avatar_img: {
    type: DataTypes.STRING,
    defaultValue: "/images/agent-daring.png",
  },
  role_play: DataTypes.STRING,
  password: DataTypes.STRING,
  password_reset_token: DataTypes.STRING,
  password_reset_expires: DataTypes.DATE,
  email_verification_token: DataTypes.STRING,
  email_verified: DataTypes.BOOLEAN,
  google: DataTypes.STRING,
  account_type: DataTypes.STRING
}, {
  sequelize,
  modelName: 'User',  // Singular model name
  tableName: 'Users', // Plural table name
  underscored: true,
});

export default User;
