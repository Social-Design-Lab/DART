'use strict';
import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

// If the table Users does not exist in the database, make sure it is created by syncing your models:

// sequelize.sync({ force: true }).then(() => {
//     console.log('Database & tables created!');
// });

class Users extends Model {
  static associate(models) {
    // define association here
  }
}

Users.init({
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  avatar: {
    type: DataTypes.STRING,
    defaultValue: "Daring",
  },
  avatar_img: {
    type: DataTypes.STRING,
    defaultValue: "/images/agent-daring.png",
  },
  role_play: DataTypes.STRING,
  password: DataTypes.STRING,
  password_reset_token: DataTypes.STRING,
  password_reset_expires: DataTypes.DATE,
  email_verification_token: DataTypes.STRING,
  email_verified: DataTypes.BOOLEAN,
  google: DataTypes.STRING,
  account_type: DataTypes.STRING
}, {
  sequelize,
  modelName: 'Users',
  tableName: 'Users',
  underscored: true,
});

export default Users;
