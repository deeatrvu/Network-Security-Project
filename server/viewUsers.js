const { sequelize } = require('./config/db');
const User = require('./models/User');

async function viewUsers() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to the database successfully.');

    // Fetch all users
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'hasVoted', 'createdAt']
    });

    console.log('Users found:', users.length);
    
    if (users.length === 0) {
      console.log('No users have been registered yet.');
    } else {
      console.log('User details:');
      users.forEach((user, index) => {
        console.log(`\nUser #${index + 1}:`);
        console.log(`ID: ${user.id}`);
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Has Voted: ${user.hasVoted ? 'Yes' : 'No'}`);
        console.log(`Created At: ${user.createdAt}`);
      });
    }

    // Close the database connection
    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error viewing users:', error);
  }
}

// Run the function
viewUsers(); 