import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const QuizScore = sequelize.define('QuizScore', {
    userID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    moduleID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    section: {
        type: DataTypes.STRING,
        allowNull: false
    },
    scoreTotal: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    correctAnswers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    questionScores: {
        type: DataTypes.ARRAY(DataTypes.FLOAT),
        allowNull: false
    },
    questionChoices: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'quiz_scores',
    timestamps: true, // Enable `createdAt` and `updatedAt`
});

export default QuizScore;