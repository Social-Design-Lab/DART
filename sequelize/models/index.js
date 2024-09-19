// models/index.js
import Sequelize from 'sequelize';
import sequelize from '../../config/database.js';

// Import all models
import Course from './Course.js';
import Lesson from './Lesson.js';

// Initialize models and pass the Sequelize instance
const models = {
    Course: Course.init({
        title: Sequelize.STRING,
        slug: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        description: Sequelize.TEXT,
        level: Sequelize.STRING,
        link: Sequelize.STRING,
        image_link: Sequelize.STRING,
        keywords: Sequelize.ARRAY(Sequelize.STRING),
        duration: Sequelize.INTEGER,
    }, {
        sequelize,
        modelName: 'Course',
        tableName: 'courses',
        underscored: true,  // Enable underscored option
    }),
    Lesson: Lesson.init({
        course_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'courses',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        duration: {
            type: Sequelize.INTEGER, // Store duration in minutes
            allowNull: false,
        },
        image: {
            type: Sequelize.STRING,
            allowNull: true, // URL or path to an image
        },
        objectives: {
            type: Sequelize.ARRAY(Sequelize.STRING), // Bullet point objectives
            allowNull: true,
        },
        order: {
            type: Sequelize.INTEGER, // Order of the lesson in the course
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Lesson',
        tableName: 'lessons',
        underscored: true,  // Enable underscored option
    })
};

// Define model relationships
Object.values(models).forEach((model) => {
    if (model.associate) {
        model.associate(models);
    }
});

// Export models for use in other parts of the app
export default models;
