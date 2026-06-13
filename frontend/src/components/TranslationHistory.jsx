import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TranslationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [error, setError] = useState('');

  // We assume the user is authenticated and token is available in localstorage
  // For the sake of this component, if it fails, it means user is not logged in.
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your history.');
          setLoading(false);
          return;
        }

        const res = await axios.get('/api/users/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) {
        setError('Failed to fetch translation history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const toggleFavorite = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/users/history/${id}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(history.map(item => 
        item._id === id ? { ...item, isFavorite: !item.isFavorite } : item
      ));
    } catch (err) {
      alert('Failed to update favorite status');
    }
  };

  const filteredHistory = history.filter(item => {
    if (showFavoritesOnly && !item.isFavorite) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        item.originalText.toLowerCase().includes(s) || 
        item.translatedText.toLowerCase().includes(s)
      );
    }
    return true;
  });

  if (loading) return <div className="text-center p-8">Loading history...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Translation History</h2>

      {error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input 
              type="text" 
              placeholder="Search translations..." 
              className="border p-2 rounded flex-grow"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showFavoritesOnly} 
                onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
              />
              Show Favorites Only
            </label>
          </div>

          <div className="space-y-4">
            {filteredHistory.length === 0 ? (
              <p className="text-gray-500 text-center p-8">No history found.</p>
            ) : (
              filteredHistory.map(item => (
                <div key={item._id} className="bg-white border rounded-lg p-4 shadow-sm flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">{item.originalText}</p>
                    <p className="text-blue-600 mt-1">{item.translatedText}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {item.fromLang} &rarr; {item.toLang} | {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => toggleFavorite(item._id)}
                    className={`text-2xl ${item.isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-gray-400'}`}
                  >
                    ★
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
