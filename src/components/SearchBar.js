import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      setSearchTerm('');
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full animate-slide-up">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Search for a city..."
            className="search-input"
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="search-button flex-shrink-0 flex items-center justify-center gap-2"
          disabled={!searchTerm.trim()}
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>
      
      {/* Quick search suggestions */}
      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        {['London', 'New York', 'Tokyo', 'Paris', 'Sydney'].map((city) => (
          <button
            key={city}
            onClick={() => onSearch(city)}
            className="px-3 py-1 text-sm bg-white/10 backdrop-blur-sm border border-white/20 
                     rounded-full text-white/80 hover:text-white hover:bg-white/20 
                     transition-all duration-300"
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
