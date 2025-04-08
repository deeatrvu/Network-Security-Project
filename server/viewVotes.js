const { sequelize } = require('./config/db');
const Vote = require('./models/Vote');
const User = require('./models/User');

async function viewVotes() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to the database successfully.');

    // Fetch all votes with user information
    const votes = await Vote.findAll({
      include: [{
        model: User,
        attributes: ['username', 'email']
      }]
    });

    console.log('Votes found:', votes.length);
    
    if (votes.length === 0) {
      console.log('No votes have been cast yet.');
    } else {
      console.log('Vote details:');
      votes.forEach((vote, index) => {
        console.log(`\nVote #${index + 1}:`);
        console.log(`ID: ${vote.id}`);
        console.log(`Voter: ${vote.User.username} (${vote.User.email})`);
        console.log(`Encrypted Vote: ${vote.encryptedVote}`);
        console.log(`Election ID: ${vote.electionId}`);
        console.log(`Timestamp: ${vote.createdAt}`);
      });
    }

    // Close the database connection
    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error viewing votes:', error);
  }
}

// Run the function
viewVotes(); 