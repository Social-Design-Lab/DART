'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Courses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Courses.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    level: DataTypes.STRING,
    keywords: DataTypes.ARRAY(DataTypes.STRING),
    duration: DataTypes.INTEGER,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Courses',
    underscored: true,
  });
  return Courses;
};