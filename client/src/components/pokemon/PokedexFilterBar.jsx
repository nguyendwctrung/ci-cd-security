import React, { useState } from 'react';
import { Search, Filter} from 'lucide-react'; 
import { TYPE_COLORS } from './constants.js';

const PokedexFilterBar = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedTypes, 
  toggleType 
}) => {
  const [isExpanded, setIsExpanded] = useState(true); 
  const allTypes = Object.keys(TYPE_COLORS);

  return (
    <div className="w-full space-y-4 mb-8">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Enter pokemon name or number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-600/50 text-white placeholder-gray-400 px-5 py-3 pl-5 rounded-full outline-none focus:ring-2 focus:ring-purple-500 border border-transparent backdrop-blur-sm"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-purple-900/50"
        >
          {isExpanded ? 'Hide' : 'Filter'}
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {isExpanded && (
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          
          <div className="mb-4">
            <h4 className="text-white font-bold mb-3 text-lg">Type</h4>
            <div className="flex flex-wrap gap-2">
              {allTypes.map((type) => {
                const isSelected = selectedTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`
                      px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-200
                      ${isSelected 
                        ? `${TYPE_COLORS[type]} text-white ring-2 ring-white scale-105` 
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}
                    `}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* <div>
            <h4 className="text-white font-bold mb-3 text-lg">Category</h4>
            <div className="flex gap-6">
              <label className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-white">
                <input type="checkbox" className="form-checkbox rounded text-purple-500 bg-slate-700 border-slate-500" />
                <span>Seed</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-white">
                <input type="checkbox" className="form-checkbox rounded text-purple-500 bg-slate-700 border-slate-500" />
                <span>Rock</span>
              </label>
            </div>
          </div> */}

          {/* <div className="flex justify-end mt-4">
             <button className="bg-purple-500/80 hover:bg-purple-500 text-white text-sm px-6 py-2 rounded-full">
                Apply
             </button>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default PokedexFilterBar;