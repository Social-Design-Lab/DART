import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class Enrollment extends Model {
  static associate(models) {
    // Define the associations here
    Enrollment.belongsTo(models.User, { foreignKey: 'user_id' });
    Enrollment.belongsTo(models.Course, { foreignKey: 'course_id' });
  }
}

Enrollment.init({
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  percent_progress: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  last_page: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Enrollment',
  tableName: 'enrollments',
  underscored: true,
});

export default Enrollment;
