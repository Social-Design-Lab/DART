import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class Course extends Model {
    static associate(models) {
        Course.hasMany(models.Lesson, {
            foreignKey: 'course_id',
            as: 'lessons',  // This 'as' alias will be used in include statements
            onDelete: 'CASCADE',
        });
    }
}

Course.init({
    title: DataTypes.STRING,
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: DataTypes.TEXT,
    level: DataTypes.STRING,
    link: DataTypes.STRING,
    image_link: DataTypes.STRING,
    keywords: DataTypes.ARRAY(DataTypes.STRING),
    duration: DataTypes.INTEGER,
}, {
    sequelize, 
    modelName: 'Course',
    tableName: 'courses',
    underscored: true,
});

export default Course;
