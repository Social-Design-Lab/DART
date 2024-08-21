'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lessons extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Lessons.init({
    course_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    subtitle: DataTypes.STRING,
    duration: DataTypes.FLOAT,
    image: DataTypes.STRING,
    link: DataTypes.STRING,
    imagelink: DataTypes.STRING,
    keywords: DataTypes.ARRAY(DataTypes.STRING),
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Lessons',
    underscored: true,
  });
  return Lessons;
};