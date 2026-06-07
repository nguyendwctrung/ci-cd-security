import { useState, useEffect, useCallback, useRef } from 'react';
import PokemonMap from "@/components/pokemon/PokemonMap.jsx";
import PokemonList from "@/components/pokemon/PokemonList.jsx";
import MarkerInfoModal from "@/components/pokemon/MarkerInfoModal.jsx";
import { getPokemonSpawnLocations } from "@/utils/encounterParser.js";
import Loading from "@/components/common/ClientLoading.jsx";
import { Button } from "@/components/ui/button.jsx";

// Island center coordinates (calculated from location data)
const ISLAND_CENTERS = {
    melemele: { lat: -340, lng: 360 }, // Top Left
    akala: { lat: -365, lng: 620 },    // Top Right
    ulaula: { lat: -640, lng: 820 },   // Bottom Right
    poni: { lat: -500, lng: 200 },     // Bottom Left
    aether: { lat: -630, lng: 403 }    // Aether Paradise (Center)
};

export default function MapPage() {
    const [markers, setMarkers] = useState([]);
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const [selectedPokemonIds, setSelectedPokemonIds] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [showMarkerModal, setShowMarkerModal] = useState(false);
    const [pendingMarkerPosition, setPendingMarkerPosition] = useState(null);
    const [markerIdCounter, setMarkerIdCounter] = useState(1);
    const [isLoadingSpawns, setIsLoadingSpawns] = useState(false);
    const [isLoadingState, setIsLoadingState] = useState(true);
    const mapRef = useRef(null);
    const [squareSize, setSquareSize] = useState(0);
    const mapContainerRef = useRef(null);
    const headerRef = useRef(null);

    // Load map state from API
    useEffect(() => {
        const loadMapState = async () => {
            try {
                setIsLoadingState(true);
                const response = await fetch('/api/map/state', {
                    credentials: 'include'
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        // Restore selected Pokemon IDs
                        if (result.data.selectedPokemon && result.data.selectedPokemon.length > 0) {
                            setSelectedPokemonIds(result.data.selectedPokemon);
                        }

                        // Restore markers
                        if (result.data.markers && result.data.markers.length > 0) {
                            const restoredMarkers = result.data.markers.map((marker, index) => ({
                                ...marker,
                                id: marker.id || index + 1,
                                isPinned: marker.isPinned !== undefined ? marker.isPinned : true
                            }));
                            setMarkers(restoredMarkers);
                            // Set counter to max ID + 1
                            const maxId = Math.max(...restoredMarkers.map(m => m.id || 0), 0);
                            setMarkerIdCounter(maxId + 1);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading map state:', error);
            } finally {
                setIsLoadingState(false);
            }
        };

        loadMapState();
    }, []);

    // Save map state to API (debounced)
    const saveMapState = useCallback(async () => {
        try {
            console.log('Saving map state:', {
                selectedPokemon: selectedPokemonIds.length,
                markers: markers.length
            });

            const response = await fetch('/api/map/state', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    selectedPokemon: selectedPokemonIds,
                    markers: markers
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('Map state saved successfully');
            } else {
                console.error('Failed to save map state:', result.message);
            }
        } catch (error) {
            console.error('Error saving map state:', error);
        }
    }, [selectedPokemonIds, markers]);

    // Auto-save when state changes (debounced)
    useEffect(() => {
        if (!isLoadingState) {
            const timeoutId = setTimeout(() => {
                saveMapState();
            }, 1000); // Debounce 1 second

            return () => clearTimeout(timeoutId);
        }
    }, [selectedPokemonIds, markers, isLoadingState, saveMapState]);

    // Toggle Pokemon selection
    const handleTogglePokemon = async (pokemon) => {
        const pokemonId = pokemon.id;
        const isSelected = selectedPokemonIds.includes(pokemonId);

        if (isSelected) {
            // Unselect: remove from list and remove markers
            setSelectedPokemonIds(prev => prev.filter(id => id !== pokemonId));
            setMarkers(prevMarkers => prevMarkers.filter(m => m.pokemonId !== pokemonId));
        } else {
            // Select: add to list and load markers
            setSelectedPokemonIds(prev => [...prev, pokemonId]);

            // Load spawn locations for this Pokemon
            setIsLoadingSpawns(true);
            try {
                console.log('Loading spawn locations for:', pokemon.name);
                const spawnLocations = await getPokemonSpawnLocations(pokemon.name);
                console.log('Received spawn locations:', spawnLocations);

                if (spawnLocations.length > 0) {
                    // Create markers for each spawn location
                    const newMarkers = spawnLocations.map((spawn, index) => ({
                        id: markerIdCounter + index,
                        lat: spawn.lat,
                        lng: spawn.lng,
                        pokemonId: pokemon.id,
                        pokemonName: pokemon.name,
                        notes: `${spawn.location} (${spawn.percentage}%${spawn.isDay ? ', Day' : ', Night'})`,
                        location: spawn.location,
                        percentage: spawn.percentage,
                        isPinned: true
                    }));

                    console.log('Created markers:', newMarkers);
                    setMarkers(prev => {
                        // Remove existing markers for this Pokemon first
                        const filtered = prev.filter(m => m.pokemonId !== pokemon.id);
                        const updated = [...filtered, ...newMarkers];
                        return updated;
                    });
                    setMarkerIdCounter(prev => prev + newMarkers.length);
                }
            } catch (error) {
                console.error('Error loading spawn locations:', error);
            } finally {
                setIsLoadingSpawns(false);
            }
        }
    };

    // Handle Pokemon click from list - automatically place markers
    const handlePokemonClick = async (pokemon) => {
        setSelectedPokemon(pokemon);
        setIsLoadingSpawns(true);

        // Add to selected list if not already
        if (!selectedPokemonIds.includes(pokemon.id)) {
            setSelectedPokemonIds(prev => [...prev, pokemon.id]);
        }

        try {
            console.log('Fetching spawn locations for:', pokemon.name);
            // Get spawn locations from encounter tables
            const spawnLocations = await getPokemonSpawnLocations(pokemon.name);
            console.log('Received spawn locations:', spawnLocations);

            if (spawnLocations.length > 0) {
                // Create markers for each spawn location
                const newMarkers = spawnLocations.map((spawn, index) => ({
                    id: markerIdCounter + index,
                    lat: spawn.lat,
                    lng: spawn.lng,
                    pokemonId: pokemon.id,
                    pokemonName: pokemon.name,
                    notes: `${spawn.location} (${spawn.percentage}%${spawn.isDay ? ', Day' : ', Night'})`,
                    location: spawn.location,
                    percentage: spawn.percentage,
                    isPinned: true
                }));

                console.log('Created markers:', newMarkers);
                setMarkers(prev => {
                    // Remove existing markers for this Pokemon
                    const filtered = prev.filter(m => m.pokemonId !== pokemon.id);
                    const updated = [...filtered, ...newMarkers];
                    console.log('Updated markers array:', updated);
                    return updated;
                });
                setMarkerIdCounter(prev => prev + newMarkers.length);
            } else {
                // If no spawn data found, allow manual placement
                console.log(`No spawn data found for ${pokemon.name}`);
                alert(`No spawn data found for ${pokemon.name}. You can still click on the map to add markers manually.`);
            }
        } catch (error) {
            console.error('Error loading spawn locations:', error);
            alert(`Error loading spawn locations: ${error.message}`);
        } finally {
            setIsLoadingSpawns(false);
        }
    };

    // Handle map click - add marker
    const handleMapClick = (latlng) => {
        if (selectedPokemon) {
            // Add marker at clicked position with selected Pokemon
            const newMarker = {
                id: markerIdCounter,
                lat: latlng.lat,
                lng: latlng.lng,
                pokemonId: selectedPokemon.id,
                pokemonName: selectedPokemon.name,
                notes: '',
                isPinned: true
            };
            setMarkers(prev => [...prev, newMarker]);
            setMarkerIdCounter(prev => prev + 1);
            setSelectedPokemon(null); // Reset selection
        } else {
            // No Pokemon selected - open modal to add marker with info
            setPendingMarkerPosition(latlng);
            setShowMarkerModal(true);
        }
    };

    // Handle marker click - show/edit marker info
    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
        setShowMarkerModal(true);
    };

    // Handle save marker info
    const handleSaveMarker = (markerData) => {
        if (selectedMarker) {
            // Update existing marker
            const updatedMarker = { ...selectedMarker, ...markerData };
            setMarkers(prev => prev.map(m =>
                m.id === selectedMarker.id
                    ? updatedMarker
                    : m
            ));
            setSelectedMarker(null); // Reset after update
        } else if (pendingMarkerPosition) {
            // Create new marker
            const newMarker = {
                id: markerIdCounter,
                lat: pendingMarkerPosition.lat,
                lng: pendingMarkerPosition.lng,
                pokemonId: markerData.pokemonId,
                pokemonName: markerData.pokemonName || '',
                notes: markerData.notes || '',
                isPinned: markerData.isPinned !== undefined ? markerData.isPinned : true
            };
            setMarkers(prev => [...prev, newMarker]);
            setMarkerIdCounter(prev => prev + 1);
            setPendingMarkerPosition(null);
            setSelectedMarker(null); // Reset so modal closes
        }
    };

    // Handle delete marker
    const handleDeleteMarker = (markerId) => {
        setMarkers(prev => prev.filter(m => m.id !== markerId));
        setSelectedMarker(null);
    };

    // Handle close modal
    const handleCloseModal = () => {
        setShowMarkerModal(false);
        setSelectedMarker(null);
        setPendingMarkerPosition(null);
    };

    // Calculate square size for map based on available height minus header
    useEffect(() => {
        const calculateSquareSize = () => {
            // Get header height dynamically
            const headerHeight = headerRef.current ? headerRef.current.offsetHeight : 50;
            // Calculate based on viewport height minus navbar
            const viewportHeight = window.innerHeight - 64; // 64px navbar (top-16)
            // Map size should be the available height minus header, ensuring it's square
            const availableHeight = viewportHeight - headerHeight;
            const size = Math.floor(availableHeight);
            setSquareSize(size);
        };

        calculateSquareSize();
        window.addEventListener('resize', calculateSquareSize);
        // Use ResizeObserver to watch for header size changes
        const resizeObserver = new ResizeObserver(() => {
            calculateSquareSize();
        });
        if (headerRef.current) {
            resizeObserver.observe(headerRef.current);
        }

        return () => {
            window.removeEventListener('resize', calculateSquareSize);
            resizeObserver.disconnect();
        };
    }, []);

    // Handle island button click - zoom 2x and center on island
    const handleIslandClick = (islandKey) => {
        if (mapRef.current && ISLAND_CENTERS[islandKey]) {
            const center = ISLAND_CENTERS[islandKey];
            mapRef.current.zoomToIsland([center.lat, center.lng]);
        }
    };

    return (
        isLoadingState ? <Loading></Loading> :
            <div className="fixed inset-0 top-16 w-full h-[calc(100vh-4rem)] overflow-hidden z-0 flex px-6 py-4 gap-4 rounded-lg">
                {/* Left Sidebar - Expands to meet map frame */}
                <div className="flex-1 bg-gray-900/90 backdrop-blur-sm border-r border-gray-700 min-w-0 rounded-lg">
                    {isLoadingState ? (
                        <div className="h-full w-full flex items-center justify-center">
                            <div className="text-white">Loading map state...</div>
                        </div>
                    ) : (
                        <div className="h-full w-full">
                            <PokemonList
                                onPokemonClick={handlePokemonClick}
                                selectedPokemon={selectedPokemon}
                                selectedPokemonIds={selectedPokemonIds}
                                onTogglePokemon={handleTogglePokemon}
                            />
                        </div>
                    )}
                </div>

                {/* Right Side - Square Map Frame with fixed width, sticks to the right */}
                <div
                    className="flex-shrink-0 flex flex-col overflow-hidden border-2 border-gray-700 bg-gray-900/50 rounded-lg"
                    style={{
                        width: squareSize > 0 ? `${squareSize}px` : 'auto'
                    }}
                >
                    {/* Map Title */}
                    <div ref={headerRef} className="px-4 py-2 border-b border-gray-700 bg-gray-900/80 flex items-center justify-between flex-shrink-0 rounded-t-lg">
                        <h2 className="text-white text-lg font-semibold">
                            Pokemon Ultramoon
                        </h2>
                        <div className="flex gap-2">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleIslandClick('melemele')}
                                className="text-white transition-all hover:shadow-[0_4px_12px_rgba(128,125,219,0.5)]"
                                style={{ backgroundColor: '#807DDB' }}
                            >
                                Melemele Island
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleIslandClick('akala')}
                                className="text-white transition-all hover:shadow-[0_4px_12px_rgba(128,125,219,0.5)]"
                                style={{ backgroundColor: '#807DDB' }}
                            >
                                Akala Island
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleIslandClick('ulaula')}
                                className="text-white transition-all hover:shadow-[0_4px_12px_rgba(128,125,219,0.5)]"
                                style={{ backgroundColor: '#807DDB' }}
                            >
                                Ula'ula Island
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleIslandClick('poni')}
                                className="text-white transition-all hover:shadow-[0_4px_12px_rgba(128,125,219,0.5)]"
                                style={{ backgroundColor: '#807DDB' }}
                            >
                                Poni Island
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleIslandClick('aether')}
                                className="text-white transition-all hover:shadow-[0_4px_12px_rgba(128,125,219,0.5)]"
                                style={{ backgroundColor: '#807DDB' }}
                            >
                                Aether Paradise
                            </Button>
                        </div>
                    </div>

                    {/* Map Container - Square frame to match imageBounds exactly */}
                    <div className="flex-1 flex items-center justify-center overflow-hidden relative">
                        {squareSize > 0 && (
                            <div
                                style={{
                                    width: `${squareSize}px`,
                                    height: `${squareSize}px`,
                                    flexShrink: 0
                                }}
                            >
                                <PokemonMap
                                    ref={mapRef}
                                    className="w-full h-full"
                                    markers={markers}
                                    onMapClick={handleMapClick}
                                    onMarkerClick={handleMarkerClick}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Marker Info Modal */}
                {showMarkerModal && (
                    <MarkerInfoModal
                        marker={selectedMarker || {
                            lat: pendingMarkerPosition?.lat,
                            lng: pendingMarkerPosition?.lng
                        }}
                        onClose={handleCloseModal}
                        onSave={handleSaveMarker}
                        onDelete={selectedMarker?.id ? handleDeleteMarker : null}
                    />
                )}

                {/* Loading overlay when fetching spawn data */}
                {isLoadingSpawns && (
                    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-40">
                        Loading spawn locations for {selectedPokemon?.name}...
                    </div>
                )}

                {/* Info overlay when Pokemon is selected */}
                {selectedPokemon && !isLoadingSpawns && (
                    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-40">
                        Markers placed for {selectedPokemon.name}. Click on map to add more.
                    </div>
                )}
            </div>
    );
}


