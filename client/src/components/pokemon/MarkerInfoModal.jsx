import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function MarkerInfoModal({ marker, onClose, onSave, onDelete, pokemonList = [] }) {
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const [pokemonInput, setPokemonInput] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoadingPokemon, setIsLoadingPokemon] = useState(false);
    const [pokemonDetails, setPokemonDetails] = useState(null);
    const [searchError, setSearchError] = useState('');
    const [pokemonNamesList, setPokemonNamesList] = useState([]);
    const [isPinned, setIsPinned] = useState(true);
    const debounceTimer = useRef(null);

    // Load Pokemon names list for search
    useEffect(() => {
        const loadPokemonNames = async () => {
            try {
                // Fetch all Pokemon species (limit to first 1000)
                const response = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=1000');
                const data = await response.json();
                const names = data.results.map((p, index) => ({
                    id: index + 1,
                    name: p.name
                }));
                setPokemonNamesList(names);
            } catch (err) {
                console.error('Error loading Pokemon names:', err);
            }
        };
        loadPokemonNames();
    }, []);

    // Find best match Pokemon by partial name
    const findBestMatch = (searchValue) => {
        if (!searchValue || pokemonNamesList.length === 0) return null;

        const query = searchValue.toLowerCase().trim();

        // Check if it's a number
        const id = parseInt(query);
        if (!isNaN(id) && id > 0 && id <= pokemonNamesList.length) {
            return pokemonNamesList[id - 1];
        }

        // Search for partial name match
        const matches = pokemonNamesList.filter(p =>
            p.name.toLowerCase().startsWith(query) ||
            p.name.toLowerCase().includes(query)
        );

        // Return best match (starts with query first, then contains)
        const startsWith = matches.find(p => p.name.toLowerCase().startsWith(query));
        if (startsWith) return startsWith;

        return matches.length > 0 ? matches[0] : null;
    };

    // Fetch Pokemon by ID or name
    const fetchPokemon = async (searchValue) => {
        if (!searchValue || searchValue.trim() === '') {
            setPokemonDetails(null);
            setSelectedPokemon(null);
            setSearchError('');
            return;
        }

        setIsLoadingPokemon(true);
        setSearchError('');

        try {
            let pokemonName = null;

            // Check if input is a number
            const id = parseInt(searchValue);
            const isNumeric = !isNaN(id) && id > 0;

            if (isNumeric) {
                // Use ID directly
                pokemonName = id;
            } else {
                // Search for best match
                const bestMatch = findBestMatch(searchValue);
                if (!bestMatch) {
                    throw new Error('Pokemon not found');
                }
                pokemonName = bestMatch.name;
            }

            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

            if (!response.ok) {
                throw new Error('Pokemon not found');
            }

            const data = await response.json();
            setPokemonDetails({
                id: data.id,
                name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
                number: `#${String(data.id).padStart(3, '0')}`,
                types: data.types.map(t => t.type.name),
                image: data.sprites.front_default || data.sprites.other?.['official-artwork']?.front_default,
                height: data.height / 10,
                weight: data.weight / 10,
                abilities: data.abilities.map(a => a.ability.name)
            });
            setSelectedPokemon(data.id);
            setPokemonInput(data.name.charAt(0).toUpperCase() + data.name.slice(1));
        } catch (err) {
            console.error('Error fetching Pokemon:', err);
            setPokemonDetails(null);
            setSelectedPokemon(null);
            setSearchError('Pokemon not found. Try entering ID or name.');
        } finally {
            setIsLoadingPokemon(false);
        }
    };

    useEffect(() => {
        if (marker?.pokemonId) {
            fetchPokemon(marker.pokemonId.toString());
        } else {
            setPokemonInput('');
            setPokemonDetails(null);
            setSelectedPokemon(null);
        }
        if (marker?.notes) {
            setNotes(marker.notes);
        }
        if (marker?.isPinned !== undefined) {
            setIsPinned(marker.isPinned);
        } else {
            setIsPinned(true); // Default to pinned
        }
    }, [marker]);

    const handleSave = () => {
        const savedMarker = {
            ...marker,
            pokemonId: selectedPokemon,
            pokemonName: pokemonDetails?.name || '',
            notes: notes,
            isPinned: isPinned
        };
        onSave(savedMarker);
        // Close modal after save
        onClose();
    };

    const handleTogglePin = () => {
        setIsPinned(!isPinned);
    };

    const getTypeColor = (type) => {
        const colors = {
            normal: 'bg-gray-500',
            fire: 'bg-red-500',
            water: 'bg-blue-500',
            electric: 'bg-yellow-500',
            grass: 'bg-green-500',
            ice: 'bg-cyan-500',
            fighting: 'bg-orange-500',
            poison: 'bg-purple-500',
            ground: 'bg-amber-600',
            flying: 'bg-indigo-400',
            psychic: 'bg-pink-500',
            bug: 'bg-lime-500',
            rock: 'bg-stone-600',
            ghost: 'bg-indigo-700',
            dragon: 'bg-violet-600',
            dark: 'bg-gray-800',
            steel: 'bg-gray-400',
            fairy: 'bg-pink-300'
        };
        return colors[type] || 'bg-transparent';
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900/50 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl animate__animated animate__zoomIn animate__faster">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-white text-xl font-bold">Marker Information</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Pokemon Selection */}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            Select Pokemon (ID or Name)
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Pokemon ID (e.g. 25) or Name (e.g. Pikachu)"
                            value={pokemonInput}
                            onChange={(e) => {
                                const value = e.target.value;
                                setPokemonInput(value);
                                setSearchError('');

                                // Clear previous timer
                                if (debounceTimer.current) {
                                    clearTimeout(debounceTimer.current);
                                }

                                // Debounce: wait 1200ms after user stops typing
                                debounceTimer.current = setTimeout(() => {
                                    if (value.trim()) {
                                        fetchPokemon(value.trim());
                                    } else {
                                        setPokemonDetails(null);
                                        setSelectedPokemon(null);
                                    }
                                }, 1200);
                            }}
                            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Enter Pokemon ID (1-1010) or name (e.g. pikachu, charizard)
                        </p>
                        {searchError && (
                            <p className="text-xs text-red-400 mt-1">{searchError}</p>
                        )}
                    </div>

                    {/* Pokemon Details */}
                    {isLoadingPokemon && (
                        <div className="text-center text-white py-4">Loading Pokemon...</div>
                    )}
                    {pokemonDetails && !isLoadingPokemon && (
                        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <div className="flex items-center space-x-4 mb-3">
                                {pokemonDetails.image && (
                                    <img
                                        src={pokemonDetails.image}
                                        alt={pokemonDetails.name}
                                        className="w-20 h-20"
                                    />
                                )}
                                <div>
                                    <div className="text-gray-400 text-sm">{pokemonDetails.number}</div>
                                    <div className="text-white text-lg font-bold">{pokemonDetails.name}</div>
                                    <div className="flex gap-2 mt-1">
                                        {pokemonDetails.types.map((type, idx) => (
                                            <span
                                                key={idx}
                                                className={`text-xs px-2 py-1 rounded ${getTypeColor(type)} text-white`}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                                <div>Height: {pokemonDetails.height}m</div>
                                <div>Weight: {pokemonDetails.weight}kg</div>
                            </div>
                        </div>
                    )}

                    {/* Coordinates */}
                    {(marker?.lat !== undefined || marker?.lng !== undefined) && (
                        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <label className="block text-white text-sm font-medium mb-2">
                                Coordinates
                            </label>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-400">Latitude:</span>
                                    <span className="text-white ml-2 font-mono">
                                        {marker?.lat !== undefined ? marker.lat.toFixed(2) : 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Longitude:</span>
                                    <span className="text-white ml-2 font-mono">
                                        {marker?.lng !== undefined ? marker.lng.toFixed(2) : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes about this location..."
                            rows={3}
                            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* Pin/Unpin Button */}
                    <div>
                        <button
                            type="button"
                            onClick={handleTogglePin}
                            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${isPinned
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-600 text-white hover:bg-gray-700'
                                }`}
                        >
                            {isPinned ? 'Pinned' : 'Unpin'}
                        </button>
                        <p className="text-xs text-gray-400 mt-1">
                            {isPinned ? 'Marker is pinned (fully visible)' : 'Marker is unpinned (semi-transparent)'}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-4 border-t border-gray-700">
                    {onDelete && marker?.id && (
                        <button
                            onClick={() => {
                                onDelete(marker.id);
                                onClose();
                            }}
                            className="px-4 py-2 bg-red-600 cursor-pointer text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 cursor-pointer text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
            {/* Click outside to close */}
            <div
                className="fixed inset-0 -z-1"
                onClick={onClose}
            />
        </div>
    );
}

