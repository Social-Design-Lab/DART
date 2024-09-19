'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('lessons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'courses', // Assumes 'courses' table exists
          key: 'id'
        },
        onDelete: 'CASCADE' // Cascade delete if the course is deleted
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      duration: {
        type: Sequelize.INTEGER, // Duration in minutes
        allowNull: false
      },
      image: {
        type: Sequelize.STRING, // URL or path to the image
        allowNull: true
      },
      objectives: {
        type: Sequelize.ARRAY(Sequelize.STRING), // Bullet point objectives
        allowNull: true
      },
      order: {
        type: Sequelize.INTEGER, // Order of the lesson in the course
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('lessons');
  }
};
