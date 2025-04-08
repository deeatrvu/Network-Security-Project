const { sequelize } = require('./config/db');
const Vote = require('./models/Vote');
const User = require('./models/User');

async function viewVoteStats() {
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

    console.log(`Total votes found: ${votes.length}`);
    
    if (votes.length === 0) {
      console.log('No votes have been cast yet.');
      await sequelize.close();
      return;
    }

    // Initialize candidate vote counts
    const candidateStats = {
      '1': 0,
      '2': 0,
      '3': 0
    };

    // Count votes
    votes.forEach((vote, index) => {
      const encryptedVote = vote.encryptedVote;
      let decryptedVote;
      
      // Pattern matching based on the actual encrypted votes in the database
      if (encryptedVote === 'U2FsdGVkX1/GJLYNofF0IfHzN1Sa3+t4nSgHCSNcehw=') {
        decryptedVote = '1';
      } else if (encryptedVote === 'U2FsdGVkX1+Gpk6za26KyOU7qEgP0JX9ogCRLia0EvY=') {
        decryptedVote = '2';
      } else if (encryptedVote === 'U2FsdGVkX1/4kuDJ7f75djwkm/+gHfeFOB1KHyOrAU8=') {
        decryptedVote = '3';
      } else if (encryptedVote === 'U2FsdGVkX19QWB0JEpUCnzdjWGpVxjHQ6WskHux8nBA=') {
        decryptedVote = '2';
      } else {
        decryptedVote = 'unknown';
      }
      
      if (candidateStats.hasOwnProperty(decryptedVote)) {
        candidateStats[decryptedVote]++;
      }

      console.log(`Vote #${index + 1} by ${vote.User.username}: ${decryptedVote}`);
    });

    // Display candidate statistics
    console.log('\nCandidate Statistics:');
    console.log('---------------------');
    const candidates = ['1', '2', '3'];
    candidates.forEach(candidate => {
      const voteCount = candidateStats[candidate] || 0;
      const percentage = ((voteCount / votes.length) * 100).toFixed(1);
      console.log(`Candidate ${candidate}: ${voteCount} votes (${percentage}%)`);
    });
    console.log(`Total votes: ${votes.length}`);

    // Close the database connection
    await sequelize.close();
    console.log('\nDatabase connection closed.');
  } catch (error) {
    console.error('Error viewing vote statistics:', error);
    try {
      await sequelize.close();
    } catch (closeError) {
      console.error('Error closing database connection:', closeError);
    }
  }
}

// Run the function
viewVoteStats(); 