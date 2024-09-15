import { Model, DataTypes } from 'sequelize';
import bcrypt from '@node-rs/bcrypt';
import sequelize from '../../config/database.js';

class User extends Model {
  static associate(models) {
    // define association here
  }

  // Method to compare the candidate password with the hashed password
  async comparePassword(candidatePassword) {
    return bcrypt.verify(candidatePassword, this.password);
  }
}

User.init({
  name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: "Daring",
  },
  avatar_img: {
    type: DataTypes.STRING,
    defaultValue: "/images/agent-daring.png",
  },
  role_play: DataTypes.STRING,
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password_reset_token: DataTypes.STRING,
  password_reset_expires: DataTypes.DATE,
  email_verification_token: DataTypes.STRING,
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  google: DataTypes.STRING,
  account_type: DataTypes.STRING,
  newsletter_consent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Default value if the user hasn't opted in
  }
}, {
  sequelize,
  modelName: 'User',  // Singular model name pascalcase
  tableName: 'users', // Plural table name snakecase
  underscored: true,

  // Lifecycle hooks for password hashing
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

// Export the User model
export default User;
