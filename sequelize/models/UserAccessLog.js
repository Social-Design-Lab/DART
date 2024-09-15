import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class UserAccessLog extends Model {}

UserAccessLog.init({
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',  // Name of the User table
      key: 'id',       // Primary key of the User table
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  ip_address: DataTypes.STRING,
  user_agent: DataTypes.STRING,
  browser_name: DataTypes.STRING,
  browser_version: DataTypes.STRING,
  os_name: DataTypes.STRING,
  os_version: DataTypes.STRING,
  device_model: DataTypes.STRING,
  device_type: DataTypes.STRING,
  device_vendor: DataTypes.STRING,
  cpu_architecture: DataTypes.STRING,
  engine_name: DataTypes.STRING,
  engine_version: DataTypes.STRING,
}, {
  sequelize,
  modelName: 'UserAccessLog',
  tableName: 'user_access_logs',
  underscored: true,
});

export default UserAccessLog;
