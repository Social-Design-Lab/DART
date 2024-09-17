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
          model: 'users', // Name of the 'users' table
          key: 'id', // Primary key of the 'users' table
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      action: Sequelize.STRING,
      page_accessed: Sequelize.STRING,
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
      screen_width: Sequelize.INTEGER,
      screen_height: Sequelize.INTEGER,
      screen_orientation: Sequelize.STRING,
      viewport_width: Sequelize.INTEGER,
      viewport_height: Sequelize.INTEGER,
      device_memory: Sequelize.STRING,
      cpu_cores: Sequelize.STRING,
      connection_type: Sequelize.STRING,
      downlink: Sequelize.STRING,
      time_zone: Sequelize.STRING,
      language: Sequelize.STRING,
      referrer: Sequelize.STRING,
      cookies_enabled: Sequelize.BOOLEAN,
      is_touch_device: Sequelize.BOOLEAN,
      zoom_level: Sequelize.STRING,
      device_pixel_ratio: Sequelize.STRING,
      prefers_color_scheme: Sequelize.STRING,
      prefers_reduced_data: Sequelize.BOOLEAN,
      prefers_reduced_motion: Sequelize.BOOLEAN,
      prefers_contrast: Sequelize.STRING,
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
