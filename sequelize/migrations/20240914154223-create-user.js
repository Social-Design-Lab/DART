'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      avatar: {
        type: Sequelize.STRING,
        defaultValue: 'Daring',
      },
      avatar_img: {
        type: Sequelize.STRING,
        defaultValue: '/images/agent-daring.png',
      },
      role_play: Sequelize.STRING,
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password_reset_token: Sequelize.STRING,
      password_reset_expires: Sequelize.DATE,
      email_verification_token: Sequelize.STRING,
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      google: Sequelize.STRING,
      account_type: Sequelize.STRING,
      newsletter_consent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
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
    await queryInterface.dropTable('users');
  }
};
