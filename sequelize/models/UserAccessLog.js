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
  action: DataTypes.STRING,
  page_accessed: DataTypes.STRING,
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
  screen_width: DataTypes.INTEGER,
  screen_height: DataTypes.INTEGER,
  screen_orientation: DataTypes.STRING,
  viewport_width: DataTypes.INTEGER,
  viewport_height: DataTypes.INTEGER,
  device_memory: DataTypes.STRING,
  cpu_cores: DataTypes.STRING,
  connection_type: DataTypes.STRING,
  downlink: DataTypes.STRING,
  time_zone: DataTypes.STRING,
  language: DataTypes.STRING,
  referrer: DataTypes.STRING,
  cookies_enabled: DataTypes.BOOLEAN,
  is_touch_device: DataTypes.BOOLEAN,
  zoom_level: DataTypes.STRING,  // Calculated from the browser window size
  device_pixel_ratio: DataTypes.STRING,
  prefers_color_scheme: DataTypes.STRING,
  prefers_reduced_data: DataTypes.BOOLEAN,
  prefers_reduced_motion: DataTypes.BOOLEAN,
  prefers_contrast: DataTypes.STRING,
}, {
  sequelize,
  modelName: 'UserAccessLog',
  tableName: 'user_access_logs',
  underscored: true,
});

export default UserAccessLog;
