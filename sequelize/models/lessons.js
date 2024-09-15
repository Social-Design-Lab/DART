'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lesson extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Lesson.init({
    course_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    subtitle: DataTypes.STRING,
    duration: DataTypes.FLOAT,
    image: DataTypes.STRING,
    link: DataTypes.STRING,
    imagelink: DataTypes.STRING,
    keywords: DataTypes.ARRAY(DataTypes.STRING)
  }, {
    sequelize,
    modelName: 'Lesson',
    tableName: 'lessons',
    underscored: true,
  });
  return Lesson;
};