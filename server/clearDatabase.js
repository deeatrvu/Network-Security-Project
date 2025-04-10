const { sequelize } = require('./config/db');
const User = require('./models/User');
const Vote = require('./models/Vote');

async function clearDatabase() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to the database successfully.');

    // Drop all tables
    await sequelize.query('DROP TABLE IF EXISTS "Votes" CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS "Users" CASCADE');
    console.log('All tables dropped successfully.');

    // Sync models to recreate tables
    await sequelize.sync({ force: true });
    console.log('Tables recreated successfully.');

    // Close the database connection
    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error clearing database:', error);
    try {
      await sequelize.close();
    } catch (closeError) {
      console.error('Error closing database connection:', closeError);
    }
  }
}

// Run the function
clearDatabase(); 