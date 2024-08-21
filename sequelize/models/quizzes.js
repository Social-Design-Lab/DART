'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Quizzes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Quizzes.init({
    lesson_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Quizzes',
    underscored: true,
  });
  return Quizzes;
};