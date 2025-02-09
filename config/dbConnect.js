const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('justo', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

sequelize.authenticate()
  .then(() => {
    console.log('Connected to the database successfully');
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

module.exports = sequelize;