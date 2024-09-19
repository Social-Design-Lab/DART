'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Lesson extends Model {
    static associate(models) {
      // define association here
      Lesson.belongsTo(models.Course, { foreignKey: 'course_id' });
    }
  }

  Lesson.init({
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER, // Store duration in minutes
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true // URL or path to an image
    },
    objectives: {
      type: DataTypes.ARRAY(DataTypes.STRING), // Bullet point objectives
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER, // Order of the lesson in the course
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Lesson',
    tableName: 'lessons',
    underscored: true
  });

  return Lesson;
};
