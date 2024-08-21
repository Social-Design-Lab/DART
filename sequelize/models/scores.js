'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Scores extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Scores.init({
    user_id: DataTypes.INTEGER,
    quiz_id: DataTypes.INTEGER,
    score_total: DataTypes.FLOAT,
    correct_answers: DataTypes.INTEGER,
    timestamp: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Scores',
    underscored: true,
  });
  return Scores;
};