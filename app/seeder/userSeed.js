const bcrypt = require('bcryptjs');
const User = require('../models/user'); // Adjust the path as necessary

const seedUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash('12345678', 10);
    await User.create({
      username: 'karthick',
      password: hashedPassword,
      attempts: 0,
      locked: false
    });
    console.log('Default user seeded successfully');
  } catch (error) {
    console.error('Error seeding default user:', error);
  }
};

module.exports = seedUser;