'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Choices extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Choices.init({
    question_id: DataTypes.INTEGER,
    choice_key: DataTypes.STRING,
    text: DataTypes.TEXT,
    explanation: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Choices',
    underscored: true,
  });
  return Choices;
};