require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres'
  },
  test: {
    username: 'jct324',
    password: '123',
    database: 'dart_db',
    host: '127.0.0.1',
    dialect: 'postgres'
  },
  production: {
    url: process.env.DATABASE_URL,

    username: 'jct324',
    password: '123',
    database: 'dart_db',
    host: '127.0.0.1',
    dialect: 'postgres'
  }
}

