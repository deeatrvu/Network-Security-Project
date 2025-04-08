import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { decryptVote } from '../utils/encryption';

const AdminDashboard = () => {
  const [votes, setVotes] = useState([]);
  const [candidateStats, setCandidateStats] = useState({
    '1': 0,
    '2': 0,
    '3': 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('http://localhost:5000/api/votes', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVotes(data);
        
        // Calculate candidate statistics
        const stats = {
          '1': 0,
          '2': 0,
          '3': 0
        };
        
        data.forEach(vote => {
          try {
            const decryptedVote = decryptVote(vote.encryptedVote, vote.User.publicKey);
            if (stats.hasOwnProperty(decryptedVote)) {
              stats[decryptedVote]++;
            }
          } catch (error) {
            console.error('Error decrypting vote:', error);
          }
        });
        
        setCandidateStats(stats);
      } else {
        setError('Failed to fetch votes');
      }
    } catch (error) {
      setError('An error occurred while fetching votes');
    } finally {
      setLoading(false);
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
        alert(`Vote verified: ${data.decryptedVote}`);
      } else {
        setError('Failed to verify vote');
      }
    } catch (error) {
      setError('An error occurred while verifying vote');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading vote data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            View and verify cast votes
          </p>
        </div>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Vote Statistics */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Vote Statistics
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Current vote distribution
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Candidate 1
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {candidateStats['1']} votes ({((candidateStats['1'] / votes.length) * 100).toFixed(1)}%)
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Candidate 2
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {candidateStats['2']} votes ({((candidateStats['2'] / votes.length) * 100).toFixed(1)}%)
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Candidate 3
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {candidateStats['3']} votes ({((candidateStats['3'] / votes.length) * 100).toFixed(1)}%)
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Total Votes
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {votes.length}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Vote List */}
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
                          Timestamp
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(vote.createdAt).toLocaleString()}
                            </div>
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
      </div>
    </div>
  );
};

export default AdminDashboard; 