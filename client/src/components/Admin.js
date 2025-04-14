import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { decryptVote } from '../utils/encryption';

const Admin = () => {
  const [votes, setVotes] = useState([]);
  const [error, setError] = useState('');
  const [selectedVote, setSelectedVote] = useState(null);
  const [decryptedVote, setDecryptedVote] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchVotes();
  }, [navigate]);

  const fetchVotes = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('http://localhost:5000/api/votes', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVotes(data);
      } else {
        setError('Failed to fetch votes');
      }
    } catch (error) {
      setError('An error occurred while fetching votes');
    }
  };

  const handleVerifyVote = async (vote) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('http://localhost:5000/api/votes/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          voteId: vote.id,
          privateKey: user.privateKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedVote(vote);
        setDecryptedVote(data.decryptedVote);
      } else {
        setError('Failed to verify vote');
      }
    } catch (error) {
      setError('An error occurred while verifying vote');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-grow">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Vote Administration
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              View and verify cast votes
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

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
          >
            View Dashboard Statistics
          </button>
        </div>

        <div className="mt-8">
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Voter
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vote ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {votes.map((vote) => (
                        <tr key={vote.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vote.User.username}</div>
                            <div className="text-sm text-gray-500">{vote.User.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {vote.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(vote.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleVerifyVote(vote)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Verify Vote
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedVote && (
          <div className="mt-8 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Verified Vote Details
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Voter: {selectedVote.User.username}</p>
                <p>Decrypted Vote: {decryptedVote}</p>
                <p>Timestamp: {new Date(selectedVote.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin; 