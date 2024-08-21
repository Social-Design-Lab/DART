'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Questions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Questions.init({
    quiz_id: DataTypes.INTEGER,
    progress: DataTypes.FLOAT,
    type: DataTypes.STRING,
    partial: DataTypes.STRING,
    prompt: DataTypes.TEXT,
    explanation: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Questions',
    underscored: true,
  });
  return Questions;
};