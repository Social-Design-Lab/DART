import LessonPage from '../sequelize/models/LessonPage.js';

export const getLessonPage = async (req, res) => {
  const { lessonPageId } = req.params;

  try {
    // Fetch the lesson page data from the database
    const lessonPage = await LessonPage.findByPk(lessonPageId);

    // Check if the page exists
    if (!lessonPage) {
      return res.status(404).render('error', { message: 'Page not found' });
    }

    // Render the page using the specified template
    res.render(`templates/${lessonPage.template}`, {
      lessonPage, // Pass the lesson page data to the template
    });
  } catch (error) {
    res.status(500).render('error', { message: 'Failed to load the lesson page' });
  }
};
