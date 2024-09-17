import QuizScore from '../sequelize/models/QuizScore.js';
import User from '../sequelize/models/User.js';
import logger from '../config/logger/index.js';

// Get the latest quiz attempt
export const getLatestQuizScore = async (req, res, next) => {
  const { modID, currentSection } = req.query;

  logger.info("In GET latest quiz score request", { modID, currentSection });

  try {
    // Get the current user from the session (assuming Passport.js is being used)
    const userEmail = req.user.email;

    logger.info("Fetching user by email", { userEmail });

    // Fetch the user using Sequelize if needed
    const existingUser = await User.findOne({
      where: { email: userEmail }
    });

    if (!existingUser) {
      logger.warn("User not found while retrieving quiz score", { userEmail });
      return res.status(404).send('User not found while retrieving quiz score');
    }

    // Fetch the latest quiz attempt for the user
    const latestQuizScore = await QuizScore.findAll({
      where: {
        userID: existingUser.id,
        moduleID: modID,
        section: currentSection
      },
      order: [['timestamp', 'DESC']],
      limit: 1
    });

    if (latestQuizScore.length === 0) {
      logger.info("No quiz attempts found", { modID, currentSection, userID: existingUser.id });
      return res.status(200).json([]);
    }

    logger.info("Latest quiz score retrieved", { latestQuizScore });
    // Send the latest quiz attempt
    res.status(200).json(latestQuizScore[0]);
    
  } catch (err) {
    logger.error("Error retrieving latest quiz score", { error: err });
    next(err);
  }
};
