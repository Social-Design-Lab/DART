'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Answers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Answers.init({
    question_id: DataTypes.INTEGER,
    correct_answer: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Answers',
    underscored: true,
  });
  return Answers;
};