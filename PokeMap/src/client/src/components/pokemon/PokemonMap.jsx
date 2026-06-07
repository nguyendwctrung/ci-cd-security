import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { MapContainer, ImageOverlay, useMap, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import pokemonMapImage from '@/assets/maps/PokeMap.png';

// Fix for default marker icons in Leaflet with webpack/vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map bounds and fit to image
function MapBounds({ bounds }) {
    const map = useMap();

    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [map, bounds]);

    return null;
}

// Component to fit map to show all markers
function FitMarkers({ markers, imageBounds }) {
    const map = useMap();

    useEffect(() => {
        if (markers && markers.length > 0 && imageBounds) {
            try {
                const bounds = markers.map(m => [m.lat, m.lng]);
                if (bounds.length > 0) {
                    // Create a LatLngBounds from marker positions
                    const markerBounds = L.latLngBounds(bounds);
                    // Fit bounds with padding, but don't zoom too much
                    map.fitBounds(markerBounds, {
                        padding: [50, 50],
                        maxZoom: 2,
                        animate: true
                    });
                }
            } catch (error) {
                console.error('Error fitting markers:', error);
            }
        }
    }, [map, markers, imageBounds]);

    return null;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click: (e) => {
            if (onMapClick) {
                onMapClick(e.latlng);
            }
        }
    });
    return null;
}

// Component to control map zoom and center from parent
function MapController({ onMapReady }) {
    const map = useMap();

    useEffect(() => {
        if (onMapReady && map) {
            onMapReady(map);
        }
    }, [map, onMapReady]);

    return null;
}

// Custom Pokemon marker icon
function createPokemonIcon(pokemonSprite, isPinned = true) {
    if (!pokemonSprite) return DefaultIcon;

    const opacity = isPinned ? 1 : 0.8;
    const backgroundColor = isPinned ? 'white' : 'gray';

    return L.divIcon({
        className: 'pokemon-marker',
        html: `<div style="
            background: ${backgroundColor};
            border-radius: 50%;
            padding: 2px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            opacity: ${opacity};
        ">
            <img src="${pokemonSprite}" style="width: 32px; height: 32px; opacity: ${opacity};" />
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
}

const PokemonMap = forwardRef(function PokemonMap({
    className = "",
    markers = [],
    onMapClick,
    onMarkerClick
}, ref) {
    const MAP_SIZE = 1000;
    const imageBounds = [[0, 0], [-MAP_SIZE, MAP_SIZE]];
    const [pokemonSprites, setPokemonSprites] = useState({});
    const mapRef = useRef(null);

    // Expose map control methods via ref
    useImperativeHandle(ref, () => ({
        zoomToIsland: (center) => {
            if (mapRef.current) {
                // 4x from minimum zoom (minZoom is 0, so 4x = zoom level 2)
                const newZoom = 2;
                mapRef.current.setView(center, newZoom, {
                    animate: true,
                    duration: 0.5
                });
            }
        }
    }));

    const handleMapReady = (map) => {
        mapRef.current = map;
    };

    // Fetch Pokemon sprites for markers
    useEffect(() => {
        const fetchSprites = async () => {
            const spritePromises = markers
                .filter(m => m.pokemonId && !pokemonSprites[m.pokemonId])
                .map(async (marker) => {
                    try {
                        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${marker.pokemonId}`);
                        const data = await res.json();
                        return {
                            id: marker.pokemonId,
                            sprite: data.sprites.front_default
                        };
                    } catch (err) {
                        console.error(`Error fetching sprite for Pokemon ${marker.pokemonId}:`, err);
                        return null;
                    }
                });

            const results = await Promise.all(spritePromises);
            const newSprites = {};
            results.forEach(result => {
                if (result) {
                    newSprites[result.id] = result.sprite;
                }
            });
            setPokemonSprites(prev => ({ ...prev, ...newSprites }));
        };

        if (markers.length > 0) {
            fetchSprites();
        }
    }, [markers]);

    // Center point for initial view (middle of the image)
    const center = [-MAP_SIZE / 2, MAP_SIZE / 2];

    return (
        <div className={`w-full h-full ${className}`} style={{ background: 'transparent' }}>
            <MapContainer
                center={center}
                zoom={2}
                minZoom={0}
                maxZoom={5}
                style={{ height: '100%', width: '100%', zIndex: 0, background: 'transparent' }}
                crs={L.CRS.Simple}
                maxBounds={imageBounds}
                zoomControl={true}
                scrollWheelZoom={true}
                doubleClickZoom={true}
                dragging={true}
                attributionControl={false}
            >
                <ImageOverlay
                    url={pokemonMapImage}
                    bounds={imageBounds}
                    opacity={1}
                />
                <MapBounds bounds={imageBounds} />
                <FitMarkers markers={markers} imageBounds={imageBounds} />
                <MapClickHandler onMapClick={onMapClick} />
                <MapController onMapReady={handleMapReady} />

                {/* Render markers */}
                {markers.map((marker, index) => {
                    const sprite = pokemonSprites[marker.pokemonId];
                    const isPinned = marker.isPinned !== undefined ? marker.isPinned : true;
                    const markerIcon = sprite ? createPokemonIcon(sprite, isPinned) : DefaultIcon;

                    // Debug: log marker positions
                    if (index < 3) {
                        console.log(`Marker ${index}:`, {
                            id: marker.id,
                            lat: marker.lat,
                            lng: marker.lng,
                            name: marker.pokemonName,
                            imageBounds: imageBounds
                        });
                    }

                    return (
                        <Marker
                            key={`${marker.id || index}-${isPinned ? 'pinned' : 'unpinned'}`}
                            position={[marker.lat, marker.lng]}
                            icon={markerIcon}
                            eventHandlers={{
                                click: () => {
                                    if (onMarkerClick) {
                                        onMarkerClick(marker);
                                    }
                                }
                            }}
                        >
                            <Popup>
                                <div className="text-center">
                                    {marker.pokemonName && (
                                        <div className="font-bold text-lg">{marker.pokemonName}</div>
                                    )}
                                    {marker.notes && (
                                        <div className="text-sm text-gray-600 mt-1">{marker.notes}</div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-2">
                                        Lat: {marker.lat?.toFixed(2) || 'N/A'}, Lng: {marker.lng?.toFixed(2) || 'N/A'}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
});

export default PokemonMap;

