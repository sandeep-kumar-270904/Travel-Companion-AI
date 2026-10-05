import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LocalGuide() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [itinerary, setItinerary] = useState(null);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  
  const fetchNearbyPlaces = (lat, lon, locationName = '') => {
    setLoading(true);
    setError('');
    if (locationName) setLocationStatus(`Found ${locationName}. Discovering attractions...`);
    
    // 1. Search for nearby coordinates using Wikipedia API
    const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=10000&gslimit=10&format=json&origin=*`;
    
    fetch(geoUrl)
      .then(res => res.json())
      .then(data => {
        if (!data.query || !data.query.geosearch || data.query.geosearch.length === 0) {
          setError('No prominent places found nearby.');
          setLoading(false);
          setLocationStatus('');
          return;
        }

        const pageIds = data.query.geosearch.map(place => place.pageid).join('|');
        const detailsUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageIds}&prop=extracts|pageimages|coordinates&exintro=1&explaintext=1&exchars=200&pithumbsize=400&format=json&origin=*`;
        
        return fetch(detailsUrl)
          .then(res => res.json())
          .then(detailsData => {
            const pages = detailsData.query.pages;
            const placesArray = Object.keys(pages).map(key => {
              const page = pages[key];
              return {
                id: page.pageid,
                title: page.title,
                extract: page.extract,
                image: page.thumbnail ? page.thumbnail.source : null,
                lat: page.coordinates ? page.coordinates[0].lat : null,
                lon: page.coordinates ? page.coordinates[0].lon : null,
                url: `https://en.wikipedia.org/?curid=${page.pageid}`
              };
            });
            setPlaces(placesArray);
            setLoading(false);
            setLocationStatus('');
          });
      })
      .catch(err => {
        console.error('Error fetching places:', err);
        setError('Failed to fetch nearby places. Ensure you have an internet connection.');
        setLoading(false);
        setLocationStatus('');
      });
  };

  const handleGenerateItinerary = async () => {
    if (!searchQuery.trim()) {
      setError('Please search for a city first.');
      return;
    }
    setItineraryLoading(true);
    setItinerary(null);
    setError('');
    
    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      const response = await fetch('/api/ai/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: searchQuery, days: 3, apiKey })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setItinerary(data.itinerary);
    } catch (err) {
      console.error(err);
      setError('Failed to generate AI Itinerary. Ensure you have added your Gemini API key in AI Assistant.');
    } finally {
      setItineraryLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError('');
    setLocationStatus('Searching for city...');
    setPlaces([]);

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=coordinates&titles=${encodeURIComponent(searchQuery)}&format=json&origin=*`;
    
    fetch(searchUrl)
      .then(res => res.json())
      .then(data => {
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        
        if (pageId === '-1' || !pages[pageId].coordinates) {
          setError(`Could not find coordinates for "${searchQuery}". Try a major city or landmark.`);
          setLoading(false);
          setLocationStatus('');
          return;
        }

        const coords = pages[pageId].coordinates[0];
        fetchNearbyPlaces(coords.lat, coords.lon, pages[pageId].title);
      })
      .catch(err => {
        console.error('Search error:', err);
        setError('Failed to search. Please try again.');
        setLoading(false);
        setLocationStatus('');
      });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLocationStatus('Acquiring GPS Signal...');
    setLoading(true);
    setPlaces([]);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus('Location found! Searching nearby...');
        fetchNearbyPlaces(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        setError('Unable to retrieve your location. Please check your permissions.');
        setLocationStatus('');
        setLoading(false);
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]">
          Local Guide & Itinerary
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
          Discover famous landmarks or generate a custom AI travel itinerary for any city in the world.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center mb-12">
        <div className="w-full max-w-2xl flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city (e.g. Kyoto, Paris)..."
              className="w-full bg-space-900/80 border border-white/10 rounded-2xl pl-6 pr-32 py-4 text-white focus:outline-none focus:border-teal-400 shadow-glass-inset text-lg"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-6 bg-teal-500 hover:bg-teal-400 text-space-900 font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              Search
            </motion.button>
          </form>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateItinerary}
            disabled={itineraryLoading || loading || !searchQuery}
            className="px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {itineraryLoading ? 'Generating...' : '✨ AI Itinerary'}
          </motion.button>
        </div>

        <div className="flex items-center gap-4 text-slate-500 text-sm mb-6 w-full max-w-2xl">
          <div className="h-px bg-white/10 flex-1"></div>
          OR
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetLocation}
          disabled={loading}
          className="flex items-center gap-3 px-8 py-4 bg-space-800/80 text-teal-400 font-bold rounded-2xl border border-teal-400/30 hover:border-teal-400 hover:bg-space-800 transition-all disabled:opacity-50"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {loading ? 'Scanning...' : 'Use My GPS Location'}
        </motion.button>
        
        {locationStatus && !error && <p className="mt-4 text-teal-400 text-sm font-medium animate-pulse">{locationStatus}</p>}
        {error && <p className="mt-4 text-red-400 text-sm font-medium">{error}</p>}
      </div>

      <AnimatePresence>
        {itinerary && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-12 bg-space-800/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(168,85,247,0.15)] max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-purple-400">✨</span> Your AI Itinerary for {searchQuery}
            </h2>
            <div className="prose prose-invert prose-teal max-w-none text-slate-300">
              {itinerary.split('\n').map((line, i) => {
                if (line.startsWith('#')) return <h3 key={i} className="text-xl font-bold text-teal-400 mt-6 mb-2">{line.replace(/#/g, '')}</h3>;
                if (line.startsWith('*') || line.startsWith('-')) return <li key={i} className="ml-4 mb-1">{line.substring(1)}</li>;
                if (line.trim() === '') return <br key={i} />;
                return <p key={i} className="mb-2">{line}</p>;
              })}
            </div>
          </motion.div>
        )}

        {places.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
          >
            {places.map((place, idx) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="break-inside-avoid bg-space-800/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:border-teal-400/50 hover:bg-space-800/80 transition-all flex flex-col group"
              >
                {place.image ? (
                  <div className="h-48 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-space-900 to-transparent z-10" />
                    <img src={place.image} alt={place.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                ) : (
                  <div className="h-48 bg-space-800 flex items-center justify-center relative">
                     <div className="absolute inset-0 bg-gradient-to-t from-space-900 to-transparent z-10" />
                     <svg className="w-16 h-16 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col relative z-20 -mt-6">
                  <h3 className="text-xl font-bold text-white mb-2 font-outfit leading-tight group-hover:text-teal-400 transition-colors">{place.title}</h3>
                  <p className="text-slate-400 text-sm flex-1 leading-relaxed">{place.extract ? `${place.extract}...` : 'No description available.'}</p>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <a 
                      href={place.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:text-white text-sm font-bold flex items-center gap-1 transition-colors"
                    >
                      Read Wiki
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    {place.lat && place.lon && (
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white/5 hover:bg-teal-500/20 text-slate-300 hover:text-teal-400 rounded-full transition-colors border border-white/5 hover:border-teal-500/30"
                        title="Get Directions"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
