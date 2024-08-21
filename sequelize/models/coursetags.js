'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseTags extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CourseTags.init({
    course_id: DataTypes.INTEGER,
    tag_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CourseTags',
    underscored: true,
  });
  return CourseTags;
};