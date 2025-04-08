const { sequelize } = require('./config/db');
const Vote = require('./models/Vote');
const User = require('./models/User');

async function viewTables() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to the database successfully.');

    // Get all tables
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables in the database:');
    results.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });

    // Get table structure for Users
    console.log('\nUser table structure:');
    const userColumns = await User.describe();
    Object.entries(userColumns).forEach(([column, details]) => {
      console.log(`${column}: ${details.type.key} (${details.allowNull ? 'nullable' : 'not null'})`);
    });

    // Get table structure for Votes
    console.log('\nVote table structure:');
    const voteColumns = await Vote.describe();
    Object.entries(voteColumns).forEach(([column, details]) => {
      console.log(`${column}: ${details.type.key} (${details.allowNull ? 'nullable' : 'not null'})`);
    });

    // Close the database connection
    await sequelize.close();
    console.log('\nDatabase connection closed.');
  } catch (error) {
    console.error('Error viewing tables:', error);
  }
}

// Run the function
viewTables(); 