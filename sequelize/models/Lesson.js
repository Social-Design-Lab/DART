import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class Lesson extends Model {
    static associate(models) {
        // Define associations here
        this.belongsTo(models.Course, {
            foreignKey: 'course_id',
            as: 'course',
            onDelete: 'CASCADE'
        });
    }
}

Lesson.init({
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    objectives: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Lesson',
    tableName: 'lessons',
    underscored: true
});

export default Lesson;
