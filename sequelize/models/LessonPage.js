import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class LessonPage extends Model {
  static associate(models) {
    // Each page belongs to a specific lesson
    LessonPage.belongsTo(models.Lesson, { foreignKey: 'lesson_id', as: 'lesson' });
  }
}

LessonPage.init({
  lesson_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lessons',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false, // e.g., "Introduction", "Objectives"
  },
  content: {
    type: DataTypes.TEXT, // Page content (could be HTML or Markdown)
    allowNull: true,
  },
  order: {
    type: DataTypes.INTEGER, // Order of the page in the lesson
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING, // Type of the page (e.g., "Intro", "Quiz", etc.)
    allowNull: true,
  },
  template: {
    type: DataTypes.STRING, // Name of the template to use for rendering
    allowNull: false, // e.g., "two_column", "video"
  },
}, {
  sequelize,
  modelName: 'LessonPage',
  tableName: 'lesson_pages',
  underscored: true,
});

export default LessonPage;
