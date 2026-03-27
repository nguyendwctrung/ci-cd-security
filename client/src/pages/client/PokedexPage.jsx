import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PokedexCard from '@/components/pokemon/PokedexCard';
import PokedexFilterBar from '@/components/pokemon/PokedexFilterBar';
import Loading from "@/components/common/ClientLoading.jsx";

let cachedData = []; 

export default function PokedexPage() {
  const [allPokemon, setAllPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;
  
  const navigate = useNavigate();

  useEffect(() => {
    if (cachedData.length > 0) {
      setAllPokemon(cachedData);
      setLoading(false);
      return; 
    }

    const fetchPokemon = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1500&offset=0');
        const data = await response.json();

        const detailedPromises = data.results.map(async (pokemon) => {
          const res = await fetch(pokemon.url);
          return res.json();
        });

        const fullData = await Promise.all(detailedPromises);

        const optimizedData = fullData.map(p => ({
            id: p.id,
            name: p.name,
            types: p.types,
            sprites: p.sprites
        }));

        cachedData = optimizedData;
        setAllPokemon(optimizedData);
      } catch (error) {
        console.error("Error fetching pokemon:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []); 

  const globalFilteredPokemon = useMemo(() => {
    return allPokemon.filter((pokemon) => {
      const matchesSearch = 
        pokemon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(pokemon.id).includes(searchQuery);

      const matchesType = 
        selectedTypes.length === 0 || 
        selectedTypes.every(type => 
          pokemon.types.some(t => t.type.name === type)
        );

      return matchesSearch && matchesType;
    });
  }, [allPokemon, searchQuery, selectedTypes]);

  const pokemonToDisplay = useMemo(() => {
    if (searchQuery !== '' || selectedTypes.length > 0) {
      return globalFilteredPokemon;
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return globalFilteredPokemon.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  }, [globalFilteredPokemon, currentPage, searchQuery, selectedTypes]);

  const totalPages = Math.ceil(globalFilteredPokemon.length / ITEMS_PER_PAGE);

  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isSearching = searchQuery !== '' || selectedTypes.length > 0;

  if (loading) return <Loading text="Pika pika ~" />;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto pb-10">
        
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Pokedex
        </h1>

        <PokedexFilterBar 
          searchQuery={searchQuery}
          setSearchQuery={(val) => {
             setSearchQuery(val);
             setCurrentPage(1);
          }}
          selectedTypes={selectedTypes}
          toggleType={toggleType}
        />

        {!isSearching && (
          <div className="flex justify-center items-center gap-6 my-6">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-lg font-semibold text-slate-300">
              Page <span className="text-white">{currentPage}</span> of {totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {isSearching && (
           <div className="mb-4 text-slate-400">
              Found <span className="text-white font-bold">{globalFilteredPokemon.length}</span> results
           </div>
        )}

        {pokemonToDisplay.length === 0 ? (
           <div className="text-center text-gray-500 mt-20 text-xl">No Pokemon found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {pokemonToDisplay.map((pokemon) => (
              <PokedexCard 
                key={pokemon.id} 
                pokemon={pokemon} 
                onClick={() => {navigate(`/pokedex/detail?id=${pokemon.id}`);}}
              />
            ))}
          </div>
        )}

        {!isSearching && pokemonToDisplay.length > 0 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-slate-400">Page {currentPage} / {totalPages}</span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div className="fixed inset-0 h-full bg-gradient-to-t from-blue-900/50 via-transparent to-transparent pointer-events-none z-0"></div>
    </div>
  );
}