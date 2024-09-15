import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class Course extends Model {
  static associate(models) {
    // define associations here, if any
  }
}

Course.init({
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  level: DataTypes.STRING,
  link: DataTypes.STRING,
  image_link: DataTypes.STRING,
  keywords: DataTypes.ARRAY(DataTypes.STRING),
  duration: DataTypes.INTEGER
}, {
  sequelize, 
  modelName: 'Course',
  tableName: 'courses',  
  underscored: true,
});

export default Course;
