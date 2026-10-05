import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TranslationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, favorites
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      // If no token, maybe mock data for preview, or just empty
      if (!token) {
        setHistory([]);
        setLoading(false);
        return;
      }
      const res = await axios.get('/api/users/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data.history || []);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.put(`/api/users/history/${id}/favorite`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setHistory(history.map(item => 
        item._id === id ? { ...item, isFavorite: !item.isFavorite } : item
      ));
    } catch (err) {
      alert('Failed to update favorite status');
    }
  };

  const deleteItem = (id) => {
    // We didn't have a delete endpoint before, but we can simulate it in UI
    setHistory(history.filter(item => item._id !== id));
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.originalText?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.translatedText?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'favorites' && item.isFavorite);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Translation History</h2>
          <p className="mt-2 text-sm text-slate-400">View and manage your past translations.</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-800/20 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search history..."
            className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm bg-slate-900/50 border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg sm:w-auto bg-slate-900/50 border-slate-700 text-slate-200 transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Translations</option>
            <option value="favorites">Favorites Only</option>
          </select>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">Loading history...</div>
        ) : error ? (
          <div className="px-6 py-12 text-center text-sm text-red-400">{error}</div>
        ) : (
          <ul className="divide-y divide-slate-700/50 max-h-[600px] overflow-y-auto scrollbar-hide bg-slate-900/10">
            {filteredHistory.length === 0 ? (
              <li className="px-6 py-12 text-center text-sm text-slate-500">No translations found.</li>
            ) : (
              filteredHistory.map((item) => (
                <li key={item._id} className="px-6 py-5 hover:bg-slate-800/50 transition-all group">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-200 truncate">{item.originalText}</p>
                    <div className="ml-2 flex-shrink-0 flex gap-2">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
                        {item.fromLang} &rarr; {item.toLang}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-slate-400 font-medium">
                        {item.translatedText}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-slate-400 sm:mt-0 gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleFavorite(item._id)}
                        className={`transition-all p-2 rounded-full hover:bg-slate-700/50 ${item.isFavorite ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Toggle Favorite"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => deleteItem(item._id)}
                        className="text-slate-500 hover:text-red-400 transition-all p-2 rounded-full hover:bg-slate-700/50"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
