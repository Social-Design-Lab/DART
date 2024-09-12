'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserActivities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      activity_type: {
        type: Sequelize.STRING
      },
      activity_date: {
        type: Sequelize.DATE
      },
      page_accessed: {
        type: Sequelize.STRING
      },
      module_name: {
        type: Sequelize.STRING
      },
      ip_address: {
        type: Sequelize.STRING
      },
      geo_location: {
        type: Sequelize.STRING
      },
      browser: {
        type: Sequelize.STRING
      },
      os: {
        type: Sequelize.STRING
      },
      current_streak: {
        type: Sequelize.INTEGER
      },
      longest_streak: {
        type: Sequelize.INTEGER
      },
      last_access_date: {
        type: Sequelize.DATE
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserActivities');
  }
};