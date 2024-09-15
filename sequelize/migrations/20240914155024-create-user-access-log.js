'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_access_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'User', 
          key: 'id', // Primary key of the 'users' table
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ip_address: Sequelize.STRING,
      user_agent: Sequelize.STRING,
      browser_name: Sequelize.STRING,
      browser_version: Sequelize.STRING,
      os_name: Sequelize.STRING,
      os_version: Sequelize.STRING,
      device_model: Sequelize.STRING,
      device_type: Sequelize.STRING,
      device_vendor: Sequelize.STRING,
      cpu_architecture: Sequelize.STRING,
      engine_name: Sequelize.STRING,
      engine_version: Sequelize.STRING,
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user_access_logs');
  }
};
