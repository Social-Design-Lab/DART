'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('quiz_scores', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        userID: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        moduleID: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        section: {
          type: Sequelize.STRING,
          allowNull: false
        },
        scoreTotal: {
          type: Sequelize.FLOAT,
          defaultValue: 0
        },
        correctAnswers: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        questionScores: {
          type: Sequelize.ARRAY(Sequelize.FLOAT),
          allowNull: false
        },
        questionChoices: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        timestamp: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        }
      });
    },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('quiz_scores');
  }
};
