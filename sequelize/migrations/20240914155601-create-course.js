'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('courses', {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          title: {
            type: Sequelize.STRING,
            allowNull: false
          },
          slug: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          level: {
            type: Sequelize.STRING,
            allowNull: false
          },
          link: {
            type: Sequelize.STRING,
            allowNull: true
          },
          image_link: {
            type: Sequelize.STRING,
            allowNull: true
          },
          keywords: {
            type: Sequelize.ARRAY(Sequelize.STRING),
            allowNull: true
          },
          duration: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.fn('NOW')
          },
          updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.fn('NOW')
          }
        });
      },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('courses');
  }
};
