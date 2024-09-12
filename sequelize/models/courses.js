import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class Courses extends Model {
  static associate(models) {
    // define associations here, if any
  }
}

Courses.init({
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  level: DataTypes.STRING,
  link: DataTypes.STRING,
  image_link: DataTypes.STRING,
  keywords: DataTypes.ARRAY(DataTypes.STRING),
  duration: DataTypes.INTEGER
}, {
  sequelize,  // Use the correct `db` instance
  modelName: 'Courses',
  tableName: 'Courses',  
  underscored: true,
});

export default Courses;
