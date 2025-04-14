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
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  const handleVote = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCandidate) {
      setError('Please select a candidate');
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

      console.log('User data:', user);
      console.log('Selected candidate:', selectedCandidate);
      console.log('Public key:', user.publicKey);

      const encryptedVote = encryptVote(selectedCandidate.toString(), user.publicKey);
      console.log('Encrypted vote:', encryptedVote);

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
      console.log('Server response:', data);

      if (response.ok) {
        setSuccess('Your vote has been recorded successfully!');
        setSelectedCandidate('');
      } else {
        setError(data.message || 'Failed to submit vote');
      }
    } catch (error) {
      console.error('Vote submission error:', error);
      setError('An error occurred while submitting your vote. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
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
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
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
      </div>
    </div>
  );
};

export default VotingPage; 