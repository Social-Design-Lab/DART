'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Courses', [
      {
        title: 'Identity Theft',
        description: 'Learn how to protect yourself from identity theft and what steps to take if your identity is stolen.',
        level: 'Beginner',
        keywords: ['Identity Theft', 'Fraud'],
        duration: 60,
        link: '/about/identity',
        image_link: '/images/courses/identity-scams-banner.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Romance & Friendship Scams',
        description: 'Recognize the warning signs of romance and friendship scams and how to avoid falling victim.',
        level: 'Beginner',
        keywords: ['Romance Scams', 'Fraud'],
        duration: 60,
        link: '/about/romance',
        image_link: '/images/courses/romance-scams-banner.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Tech Support Scams',
        description: 'Identify tech support scams and learn what to do when a scammer pretends to be tech support.',
        level: 'Beginner',
        keywords: ['Tech Support Scams', 'Fraud'],
        duration: 60,
        link: '/about/tech',
        image_link: '/images/courses/tech-scams-banner.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Medication Scams',
        description: 'Understand common medication scams and how to safeguard yourself against fraudulent medication offers.',
        level: 'Beginner',
        keywords: ['Medication Scams', 'Fraud'],
        duration: 60,
        link: '/about/medication',
        image_link: '/images/courses/medication-scams-banner.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Grandparent Scams',
        description: 'Learn how scammers exploit emotional manipulation to target grandparents and how to protect yourself.',
        level: 'Beginner',
        keywords: ['Grandparent Scams', 'Fraud'],
        duration: 60,
        link: '/about/grandparent',
        image_link: '/images/courses/grandparent-scams-banner.jpg',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Courses', null, {});
  }
};
