'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Get the course ID for the Tech Support course
    const techSupportCourse = await queryInterface.rawSelect('courses', { where: { title: 'Tech Support Scams' } }, ['id']);

    // Insert lessons for the Tech Support Scams course
    await queryInterface.bulkInsert('lessons', [
      {
        course_id: techSupportCourse,
        title: 'Challenge',
        order: 1,
        duration: 5, // Duration in minutes
        image: 'locked-badge.svg', // Image filename or URL
        objectives: ['Assess your current knowledge', 'Earn your first badge'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        course_id: techSupportCourse,
        title: 'Concepts',
        order: 2,
        duration: 10,
        image: 'filler.png',
        objectives: ['Identify basic scams', 'Understand how tech support scams work'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        course_id: techSupportCourse,
        title: 'Consequences',
        order: 3,
        duration: 10,
        image: 'filler.png',
        objectives: ['Understand the consequences', 'Learn how scammers select targets'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        course_id: techSupportCourse,
        title: 'Recognize Techniques',
        order: 4,
        duration: 10,
        image: 'filler.png',
        objectives: ['Identify common techniques', 'Understand how tech support scams work'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        course_id: techSupportCourse,
        title: 'Warning Signs',
        order: 5,
        duration: 10,
        image: 'filler.png',
        objectives: ['Learn to spot the warning signs of a tech support scam'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        course_id: techSupportCourse,
        title: 'Methods of Protection',
        order: 6,
        duration: 10,
        image: 'filler.png',
        objectives: ['Learn Preventative Measures Before Scam Contact', 'Reactive Measure During Scam Contact', 'Post-Scam Actions for Victims'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        course_id: techSupportCourse,
        title: 'Practice',
        order: 7,
        duration: 10,
        image: 'filler.png',
        objectives: ['Practice responding to popup warnings'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        course_id: techSupportCourse,
        title: 'Evaluation',
        order: 8,
        duration: 10,
        image: 'locked-badge.svg',
        objectives: ['Take this to assess your understanding of identity theft and earn a badge!'],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

  },

  async down (queryInterface, Sequelize) {
    const techSupportCourse = await queryInterface.rawSelect('courses', { where: { title: 'Tech Support Scams' } }, ['id']);
    await queryInterface.bulkDelete('lessons', { course_id: techSupportCourse }, {});
  }
};
