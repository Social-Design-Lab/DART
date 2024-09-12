'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Users.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    avatar: DataTypes.STRING,
    avatar_img: DataTypes.STRING,
    role_play: DataTypes.STRING,
    password: DataTypes.STRING,
    password_reset_token: DataTypes.STRING,
    password_reset_expires: DataTypes.DATE,
    email_verification_token: DataTypes.STRING,
    email_verified: DataTypes.BOOLEAN,
    google: DataTypes.STRING,
    account_type: DataTypes.STRING,
    newsletter_consent: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Users',
    underscored: true,
  });
  return Users;
};