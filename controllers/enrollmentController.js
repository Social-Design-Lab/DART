import Enrollment from '../sequelize/models/Enrollment.js';

// Controller to enroll a user in a course
export const enrollUserInCourse = async (req, res) => {
  const { userId, courseId } = req.body;

  try {
    const existingEnrollment = await Enrollment.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'User is already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      user_id: userId,
      course_id: courseId,
    });

    res.status(201).json({ message: 'User enrolled in course successfully', enrollment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enroll user', details: error.message });
  }
};

// Controller to update progress of a user in a course
export const updateEnrollmentProgress = async (req, res) => {
  const { userId, courseId, percentProgress, lastPage } = req.body;

  try {
    const enrollment = await Enrollment.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    enrollment.percent_progress = percentProgress;
    enrollment.last_page = lastPage;
    await enrollment.save();

    res.status(200).json({ message: 'Progress updated successfully', enrollment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress', details: error.message });
  }
};
