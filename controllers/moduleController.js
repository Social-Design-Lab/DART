// Import necessary modules using ES module syntax
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../sequelize/models/users.js'; // Adjust path to the correct location of the Sequelize User model

// Helper functions for time calculations
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Functions to get current time, date, and other utilities
function getCurrentTime() {
  const now = new Date();
  const randomMinutes = Math.floor(Math.random() * (240 - 5 + 1)) + 5;
  const pastTime = new Date(now.getTime() - randomMinutes * 60 * 1000);
  const estOptions = { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' };
  return pastTime.toLocaleString('en-US', estOptions);
}

function getCurrentDate() {
  const now = new Date();
  const options = { month: 'numeric', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' };
  return now.toLocaleString('en-US', options);
}

function getFutureDate() {
  const today = new Date();
  const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const options = { month: 'numeric', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' };
  return oneWeekLater.toLocaleString('en-US', options);
}

function formatDate(date) {
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// GET /about/:page?/:modId
export const getAbout = (req, res) => {
  const modId = req.params.modId;
  const introPage = `module-content/${modId}/about.pug`;
  const title = 'About';
  res.render(introPage, { title });
};

// GET /about/:page?/:modId - References
export const getReferences = (req, res) => {
  const modId = req.params.modId;
  const introPage = `module-content/${modId}/references.pug`;
  const title = 'References';
  res.render(introPage, { title });
};

// GET /getModule - Render the module content
export const getModule = async (req, res) => {
  const { module, section, page } = req.query;
  let numPages;

  switch (section) {
    case 'challenge':
      numPages = 7;
      break;
    case 'concepts':
      numPages = module === 'identity' ? 10 : module === 'romance' ? 11 : module === 'grandparent' ? 9 : module === 'tech' ? 11 : undefined;
      break;
    case 'consequences':
      numPages = 8;
      break;
    case 'fake':
      numPages = 12;
      break;
    case 'contact':
      numPages = 16;
      break;
    case 'requests':
      numPages = 13;
      break;
    case 'techniques':
      numPages = 12;
      break;
    case 'signs':
      numPages = 19;
      break;
    case 'protection':
      numPages = module === 'identity' ? 10 : module === 'romance' ? 12 : module === 'grandparent' ? 15 : undefined;
      break;
    case 'reporting':
      numPages = 9;
      break;
    case 'practice':
      numPages = module === 'grandparent' ? 8 : 12;
      break;
    case 'evaluation':
      numPages = module === 'identity' ? 12 : module === 'romance' ? 11 : module === 'grandparent' ? 3 : undefined;
      break;
    default:
      numPages = undefined;
  }

  const modulePage = `module-content/${module}/${section}.pug`;

  const currentTime = getCurrentTime();
  const currentDate = getCurrentDate();
  const futureDate = getFutureDate();

  try {
    const data = await fs.readFile(path.join(__dirname, '../public/json/', module, `${section}.json`), 'utf-8');
    const quizData = JSON.parse(data);

    const narrationData = await fs.readFile(path.join(__dirname, '../public/json/', module, 'narration.json'), 'utf-8');
    const fullJson = JSON.parse(narrationData);
    const speechMarks = fullJson[section];

    if (section === 'practice') {
      const emails = [
        { index: 0, sender: "Agent Intrepid", subject: "Great Job!", date: currentTime, from: "<intrepid@gmail.com>", content: "..." },
        // Add other email data here...
      ];

      res.render(modulePage, { module, section, page, numPages, quizData, speechMarks, currentTime, currentDate, futureDate, emails });
    } else {
      res.render(modulePage, { module, section, page, numPages, quizData, speechMarks, currentTime, currentDate, futureDate });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading module data');
  }
};

// POST /completeModuleStatus
export const completeModuleStatus = async (req, res, next) => {
  try {
    const { modId, section } = req.body;

    const existingUser = await User.findOne({
      where: { email: req.user.email },
    });

    if (existingUser) {
      const moduleStatus = existingUser.moduleStatus || {};
      moduleStatus[modId] = moduleStatus[modId] || {};
      moduleStatus[modId][section] = 100;

      existingUser.moduleStatus = moduleStatus;
      await existingUser.save();

      // Also manually update the current session
      req.session.passport.user.moduleStatus[modId][section] = existingUser.moduleStatus[modId][section];

      req.session.save((err) => {
        if (err) return next(err);
        res.status(200).json({ message: 'Module status updated successfully.' });
      });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (err) {
    next(err);
  }
};

// GET /ModuleStatus
export const getModuleStatus = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({
      where: { email: req.body.email },
    });

    if (existingUser) {
      const holdModules = existingUser.moduleStatus;
      const result = Object.keys(holdModules).map((moduleName) => {
        const module = holdModules[moduleName];
        const total = Object.keys(module).length;
        const progress = Object.values(module).filter((value) => value === 100).length;

        return progress > 0
          ? {
              moduleName,
              total,
              progress,
            }
          : null;
      }).filter(Boolean);

      res.status(200).json(result);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    next(err);
  }
};
