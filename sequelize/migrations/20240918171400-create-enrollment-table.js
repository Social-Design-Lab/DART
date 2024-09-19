'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('enrollments', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        course_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'courses',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        percent_progress: {
          type: Sequelize.FLOAT,
          defaultValue: 0,
          validate: {
            min: 0,
            max: 100,
          },
        },
        last_page: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      });
    },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('enrollments');
  }
};
