'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserActivity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserActivity.init({
    user_id: DataTypes.INTEGER,
    activity_type: DataTypes.STRING,
    activity_date: DataTypes.DATE,
    page_accessed: DataTypes.STRING,
    module_name: DataTypes.STRING,
    ip_address: DataTypes.STRING,
    geo_location: DataTypes.STRING,
    browser: DataTypes.STRING,
    os: DataTypes.STRING,
    current_streak: DataTypes.INTEGER,
    longest_streak: DataTypes.INTEGER,
    last_access_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'UserActivity',
    underscored: true,
  });
  return UserActivity;
};