'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Enrollments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Enrollments.init({
    user_id: DataTypes.INTEGER,
    course_id: DataTypes.INTEGER,
    enrollment_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Enrollments',
    underscored: true,
  });
  return Enrollments;
};