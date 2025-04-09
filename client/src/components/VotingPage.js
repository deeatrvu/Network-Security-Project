import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { encryptVote } from '../utils/encryption';

const VotingPage = () => {
  const [candidates, setCandidates] = useState([
    { id: 1, name: 'Candidate 1' },
    { id: 2, name: 'Candidate 2' },
    { id: 3, name: 'Candidate 3' }
  ]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [justVoted, setJustVoted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if user has already voted
    checkIfUserHasVoted(user);
  }, [navigate]);

  const checkIfUserHasVoted = async (user) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/votes/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Only set hasVoted to true if the server explicitly confirms the user has voted
        setHasVoted(data.hasVoted === true);
      } else {
        // If there's an error, assume the user hasn't voted yet
        setHasVoted(false);
        console.error('Failed to check if user has voted');
      }
    } catch (error) {
      // If there's an error, assume the user hasn't voted yet
      setHasVoted(false);
      console.error('Error checking if user has voted:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    // Check if user has already voted before proceeding
    if (hasVoted) {
      setError('You have already cast your vote. You cannot vote again.');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        setError('Please login to vote');
        navigate('/login');
        return;
      }

      if (!user.publicKey) {
        setError('Encryption key not found. Please register again.');
        navigate('/register');
        return;
      }

      const encryptedVote = encryptVote(selectedCandidate.toString(), user.publicKey);

      const response = await fetch('http://localhost:5000/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          encryptedVote,
          electionId: '1' // In a real application, this would be dynamic
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Your vote has been recorded successfully!');
        setSelectedCandidate('');
        setHasVoted(true);
        setJustVoted(true);
      } else {
        // Check if the error is due to already voting
        if (data.message && data.message.includes('already voted')) {
          setHasVoted(true);
          setError('You have already cast your vote. You cannot vote again.');
        } else {
          setError(data.message || 'Failed to submit vote');
        }
      }
    } catch (error) {
      console.error('Vote submission error:', error);
      setError('An error occurred while submitting your vote. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center flex-grow">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Cast Your Vote
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please select your preferred candidate
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {hasVoted && !justVoted ? (
          <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline font-bold">You have already cast your vote!</span>
            <p className="mt-2 text-sm">Thank you for participating in the election.</p>
          </div>
        ) : !hasVoted && (
          <form className="mt-8 space-y-6" onSubmit={handleVote}>
            <div className="rounded-md shadow-sm -space-y-px">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="relative">
                  <input
                    type="radio"
                    id={`candidate-${candidate.id}`}
                    name="candidate"
                    value={candidate.id}
                    checked={selectedCandidate === candidate.id.toString()}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label
                    htmlFor={`candidate-${candidate.id}`}
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    {candidate.name}
                  </label>
                </div>
              ))}
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Submit Vote
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VotingPage; 