import fs from 'fs/promises'; // Replaces fs and util
import User from '../sequelize/models/User.js';
import Course from '../sequelize/models/Course.js';
import Lesson from '../sequelize/models/Lesson.js';
import logger from '../config/logger/index.js';

// GET /courses
export const getCourses = async function (req, res) {
    try {
        const courses = await Course.findAll();  
        // Render the Pug template and pass the courses to the template
        res.render('courses', {
            title: 'Courses',
            courses: courses  // Passing courses data to the Pug template
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send('Error fetching courses');
    }
};


// GET /about/:modId
export const getAbout = async (req, res) => {
    const modId = req.params.modId;
    const introPage = `module-content/about.pug`;
    const title = 'About';
    try {
        // Fetch the course based on modId (courseId)
        logger.debug(`Fetching course for modId slug: ${modId}`);

        const course = await Course.findOne({
            where: { slug: modId },  // Assuming you have a slug field in your database
            include: [
                {
                    model: Lesson,
                    as: 'lessons',  // Assuming 'lessons' is the alias
                }
            ]
        });



        // log courses and lessons
        // logger.info(`Course found: ${course.id} - ${course.title} - ${course.slug}  lessons: ${course.lessons.length}`);
        logger.debug(`Course found: ${JSON.stringify(course, null, 2)}`);



        res.render(introPage, {
            title: `About ${course.title}`, // Dynamic page title
            course // Pass the course object to the template
        });
    }  catch (err) {  // Corrected: err should be used instead of error
        logger.error('Error fetching course details:', err);
        res.status(500).render('error', {
            message: 'Failed to load course details',
            error: {
                status: 500,
                stack: err.stack
            }
        });
    }




//     try {
//       // Fetch the course based on modId (courseId)
//       const course = await Course.findByPk(modId);

//       logger.info('*In get about Course: ', course);
  
//       if (!course) {
//         return res.status(404).render('error', { message: 'Course not found' });
//       }
  
//       // Fetch lessons related to the course (optional if you want to display them here)
//       const lessons = await course.getLessons(); // Assuming you've set up the Course -> Lesson relationship
  
//       // Render the generic "about" page, passing course data
//       res.render('module-content/about.pug', {
//         title: `About ${course.title}`, // Dynamic page title
//         course, // Pass course object to the template
//         lessons // Pass lessons array if needed
//       });
//     } catch (error) {
//       res.status(500).render('error', { message: 'Failed to load course details' });
//     }


  };

// Function to get the lessons of a course
export const getLessons = async (req, res, next) => {
    try {
        const courseSlug = req.params.slug;  // Get course slug from URL
        const course = await Course.findOne({
            where: { slug: courseSlug },
            attributes: ['id', 'title', 'slug']  // Only fetch relevant fields
        });

        if (!course) {
            return res.status(404).render('404', { title: 'Course Not Found' });
        }

        // Get all lessons associated with the course
        const lessons = await Lesson.findAll({
            where: { course_id: course.id },
            attributes: ['id', 'title']  // Fetch only necessary fields like title and id
        });

        // Pass the lessons and course to the template
        res.render('course-lessons', {
            title: course.title,
            course,
            lessons,
        });

    } catch (error) {
        console.error('Error fetching lessons:', error);
        next(error);  // Pass the error to the error handler
    }
};

// /**
//  * GET /about/:modId
// export const getAbout = async (req, res) => {
//     const { modId } = req.params;
  
//     try {
//       // Fetch the course based on modId (courseId)
//       const course = await Course.findByPk(modId);

//       logger.info('*In get about Course: ', course);
  
//       if (!course) {
//         return res.status(404).render('error', { message: 'Course not found' });
//       }
  
//       // Fetch lessons related to the course (optional if you want to display them here)
//       const lessons = await course.getLessons(); // Assuming you've set up the Course -> Lesson relationship
  
//       // Render the generic "about" page, passing course data
//       res.render('module-content/about.pug', {
//         title: `About ${course.title}`, // Dynamic page title
//         course, // Pass course object to the template
//         lessons // Pass lessons array if needed
//       });
//     } catch (error) {
//       res.status(500).render('error', { message: 'Failed to load course details' });
//     }
//   };
  


//  * Render the about pages for the module.
//  */
// export const getAbout = (req, res) => {
//   const modId = req.params.modId;
//   const introPage = `module-content/${modId}/about.pug`;
//   const title = 'About';
//   res.render(introPage, { title });
// };
// export const getAbout = (req, res) => {
//   const modId = req.params.modId;
//   const introPage = `${modId}/${modId}_about`;
//   const title = 'About';
//   res.render(introPage, { title });
// };

/**
 * GET /intro/:page?/:modId
 * Render the intro pages for the module.
 */
export const getIntro = async (req, res, next) => {
  const totalNumPages = 3;
  let { modId, pageNum } = req.params;
  pageNum = pageNum || 1;

  const introPage = `${modId}/intro/${modId}_intro${pageNum}`;
  const title = 'Intro';

  try {
    const existingUser = await User.findOne({ where: { email: req.user.email } });

    if (existingUser) {
      const progress = (pageNum / totalNumPages) * 100;
      existingUser.moduleStatus[modId].intro = progress;
      await existingUser.save();

      req.session.passport.user.moduleStatus[modId].intro = progress;
      req.session.save(err => {
        if (err) return next(err);
        res.render(introPage, { title });
      });
    } else {
      res.render(introPage, { title });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * GET /challenge/:page?/:modId
 * Render the challenge page for the module.
 */
export const getChallenge = async (req, res, next) => {
  const { modId, pageNum } = req.params;
  const title = 'Challenge';

  if (modId === 'identity' && parseInt(pageNum, 10) === 2) {
    try {
      const quizData = JSON.parse(await fs.readFile(`./public/json/${modId}/challenge.json`, 'utf8'));
      const currentTime = getCurrentTime();
      const currentDate = getCurrentDate();
      res.render('dart-quiz-template.pug', {
        title,
        quizData,
        modID: modId,
        currentSection: 'challenge',
        page: 'challenge2',
        backLink: `/challenge/${modId}`,
        nextLink: `/challenge/3/${modId}`,
        progress: 100,
        currentTime,
        currentDate,
      });
    } catch (error) {
      next(error);
    }
  } else {
    res.render(`${modId}/challenge/${modId}_challenge${pageNum || ''}`, { title });
  }
};

/**
 * GET /learn/:submod/:page?/:modId
 * Render the learn pages for the module.
 */
export const getLearn = async (req, res, next) => {
  const { submod, modId, pageNum } = req.params;
  const title = 'Learn';

  try {
    const learnPage = `${modId}/learn/${submod}/${modId}_sub_learn${pageNum || ''}`;
    const currentTime = getCurrentTime();
    const currentDate = getCurrentDate();

    const existingUser = await User.findOne({ where: { email: req.user.email } });

    if (existingUser) {
      const totalNumPages = 8;
      const progress = (parseInt(pageNum, 10) / totalNumPages) * 100;
      existingUser.moduleStatus[modId].concepts = progress;
      await existingUser.save();

      req.session.passport.user.moduleStatus[modId].concepts = progress;
      req.session.save(err => {
        if (err) return next(err);
        res.render(learnPage, { title, currentTime, currentDate });
      });
    } else {
      res.render(learnPage, { title, currentTime, currentDate });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /explore/:page?/:modId
 * Render the explore pages for the module.
 */
export const getExplore = async (req, res, next) => {
  const { modId, pageNum } = req.params;
  const title = 'Explore';

  try {
    if (parseInt(pageNum, 10) === 3) {
      const currentTime = getCurrentTime();
      const currentDate = getCurrentDate();

      const emails = getSampleEmails(currentTime);
      res.render(`${modId}/explore/${modId}_explore3`, { title, emails });
    } else {
      res.render(`${modId}/explore/${modId}_explore${pageNum || ''}`, { title });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Helper functions
 */
function getCurrentTime() {
  const now = new Date();
  const randomMinutes = Math.floor(Math.random() * (240 - 5 + 1)) + 5;
  const pastTime = new Date(now.getTime() - randomMinutes * 60 * 1000);
  return pastTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' });
}

function getCurrentDate() {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });
}

function getSampleEmails(currentTime) {
  // Returns a sample email array based on the current time, similar to the original code
  return [
    { sender: 'Agent Intrepid', subject: 'Great Job!', date: currentTime },
    // Additional email data...
  ];
}
