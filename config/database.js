import { Sequelize } from 'sequelize';
import logger from './logger/index.js';

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'postgres',
  logging: msg => logger.database(msg),
});

export default sequelize;
