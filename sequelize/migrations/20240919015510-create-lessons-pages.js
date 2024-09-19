'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('lesson_pages', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        lesson_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'lessons',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        order: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        type: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        template: {
          type: Sequelize.STRING,
          allowNull: false, // Template for the page (e.g., "two_column", "video")
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
    await queryInterface.dropTable('lesson_pages');
  }
};
