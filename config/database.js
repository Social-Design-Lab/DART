const { Sequelize } = require('sequelize');
const logger = require('./logger/dev-logger');

module.exports = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'postgres',
  logging: msg => logger.debug(msg)
});
