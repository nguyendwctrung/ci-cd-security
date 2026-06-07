// Parser for Pokemon Ultra Sun Encounter Tables
// Map Size: 1000 x 1000 px
// Coordinate System: Leaflet Simple (Lat: -Height, Lng: Width)
import encounterTableRaw from "@/assets/maps/Pokemon Ultra Sun - Encounter Tables.txt?raw";

/* COORDINATES OPTIMIZED FOR 1000x1000 MAP */

const LOCATION_COORDINATES = {
    // --- MELEMELE ISLAND (Top Left) ---
    "Route 1": { lat: -340, lng: 376 },
    "Route 1 (Hau'oli Outskirts)": { lat: -338, lng: 419 },
    "Route 1 (Trainers' School)": { lat: -304, lng: 269 },
    "Hau'oli City": { lat: -366, lng: 280 },
    "Hau'oli City (Beachfront)": { lat: -385, lng: 346 },
    "Hau'oli City (Shopping District)": { lat: -377, lng: 326 },
    "Hau'oli City (Marina)": { lat: -400, lng: 329 },
    "Iki Town": { lat: -318, lng: 346 },
    "Route 2": { lat: -333, lng: 285 },
    "Hau'oli Cemetery": { lat: -328, lng: 312 },
    "Berry Fields": { lat: -307, lng: 295 },
    "Verdant Cavern": { lat: -297, lng: 314 },
    "Route 3": { lat: -274, lng: 350 },
    "Melemele Meadow": { lat: -292, lng: 375 },
    "Seaward Cave": { lat: -291, lng: 356 },
    "Kala'e Bay": { lat: -305, lng: 387 },
    "Ten Carat Hill": { lat: -425, lng: 164 },
    "Ten Carat Hill (Farthest Hollow)": { lat: -425, lng: 164 },
    "Melemele Sea": { lat: -308, lng: 268 },

    // --- AKALA ISLAND (Top Right) ---
    "Heahea City": { lat: -272, lng: 593 },
    "Route 4": { lat: -268, lng: 599 },
    "Paniola Ranch": { lat: -268, lng: 599 },
    "Paniola Town": { lat: -268, lng: 606 },
    "Route 5": { lat: -268, lng: 606 },
    "Brooklet Hill": { lat: -268, lng: 639 },
    "Route 6": { lat: -268, lng: 599 },
    "Royal Avenue": { lat: -268, lng: 599 },
    "Route 7": { lat: -288, lng: 654 },
    "Wela Volcano Park": { lat: -279, lng: 635 },
    "Route 8": { lat: -327, lng: 577 },
    "Lush Jungle": { lat: -308, lng: 596 },
    "Diglett's Tunnel": { lat: -352, lng: 558 },
    "Route 9": { lat: -365, lng: 547 },
    "Konikoni City": { lat: -395, lng: 541 },
    "Memorial Hill": { lat: -490, lng: 566 },
    "Akala Outskirts": { lat: -346, lng: 567 },
    "Hano Beach": { lat: -268, lng: 643 },
    "Hano Grand Resort": { lat: -272, lng: 647 },

    // --- ULA'ULA ISLAND (Bottom Right) ---
    "Malie City": { lat: -519, lng: 731 },
    "Malie Garden": { lat: -529, lng: 740 },
    "Route 10": { lat: -560, lng: 727 },
    "Mount Hokulani": { lat: -599, lng: 716 },
    "Route 11": { lat: -577, lng: 750 },
    "Route 12": { lat: -615, lng: 769 },
    "Geothermal Power Plant": { lat: -606, lng: 788 },
    "Blush Mountain": { lat: -625, lng: 779 },
    "Route 13": { lat: -654, lng: 808 },
    "Haina Desert": { lat: -673, lng: 827 },
    "Tapu Village": { lat: -635, lng: 846 },
    "Route 14": { lat: -654, lng: 856 },
    "Thrifty Megamart (Abandoned Site)": { lat: -663, lng: 856 },
    "Route 15": { lat: -644, lng: 885 },
    "Aether House": { lat: -635, lng: 894 },
    "Route 16": { lat: -624, lng: 893 },
    "Ula'ula Meadow": { lat: -600, lng: 892 },
    "Lake of the Sun/Moone": { lat: -600, lng: 892 },
    "Route 17": { lat: -569, lng: 863 },
    "Po Town": { lat: -569, lng: 863 },
    "Mount Lanakila": { lat: -538, lng: 808 },

    // --- PONI ISLAND (Bottom Left) ---
    "Seafolk Village": { lat: -545, lng: 135 },
    "Poni Wilds": { lat: -649, lng: 359 },
    "Ancient Poni Path": { lat: -651, lng: 364 },
    "Poni Breaker Coast": { lat: -656, lng: 389 },
    "Ruins of Hope": { lat: -656, lng: 404 },
    "Exeggutor Island": { lat: -528, lng: 85 },
    "Vast Poni Canyon": { lat: -643, lng: 343 },
    "Altar of the Sunne/Moone": { lat: -635, lng: 342 },
    "Poni Grove": { lat: -642, lng: 342 },
    "Poni Plains": { lat: -642, lng: 342 },
    "Poni Meadow": { lat: -567, lng: 138 },
    "Resolution Cave": { lat: -567, lng: 138 },
    "Poni Coast": { lat: -642, lng: 342 },
    "Battle Tree": { lat: -617, lng: 345 },

    // --- OTHERS ---
    "Aether Paradise": { lat: -630, lng: 403 },
    "Team Rocket's Castle": { lat: -414, lng: 445 }
};

const pokemonNameToIdCache = {};

function normalizePokemonName(name) {
    return name.toLowerCase()
        .replace(/['.: ]/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

export async function parseEncounterData(textData) {
    const lines = textData.split('\n');
    const markers = [];

    let currentMapNames = [];
    let currentCoords = null;
    let isDay = true;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('Map:')) {
            const rawMaps = line.replace('Map:', '').split('/');
            currentMapNames = [];
            currentCoords = null;

            for (let rawMap of rawMaps) {
                const match = rawMap.match(/\d+\s+-\s+(.+)/);
                if (match) {
                    let mapName = match[1].trim();
                    currentMapNames.push(mapName);
                    if (!currentCoords && LOCATION_COORDINATES[mapName]) {
                        currentCoords = LOCATION_COORDINATES[mapName];
                    }
                }
            }
            if (!currentCoords && currentMapNames.length > 0) {
                const primeName = currentMapNames[0];
                const baseName = primeName.split('(')[0].trim();
                if (LOCATION_COORDINATES[baseName]) {
                    currentCoords = LOCATION_COORDINATES[baseName];
                }
            }
            // Default center if not found
            if (!currentCoords) currentCoords = { lat: -500, lng: 500 };
        }
        else if (line.startsWith('Table')) {
            isDay = !line.toLowerCase().includes('night');
        }
        else if (line.startsWith('Encounters') || line.startsWith('SOS Slot') || line.startsWith('Surfing') || line.startsWith('Fishing')) {
            const parts = line.split(':');
            if (parts.length < 2) continue;
            const type = parts[0].trim();
            const mons = parts[1].trim().split(',');

            for (let monStr of mons) {
                const monMatch = monStr.trim().match(/([a-zA-Z0-9''. ]+)(?:\((\d+)%\))?/);
                if (monMatch) {
                    const pokemonName = monMatch[1].trim();
                    const rate = monMatch[2] ? parseInt(monMatch[2]) : 0;

                    if (pokemonName && pokemonName !== 'None') {
                        // Jitter ~10px for 1000px map
                        const jitterLat = (Math.random() - 0.5) * 10;
                        const jitterLng = (Math.random() - 0.5) * 10;

                        markers.push({
                            lat: currentCoords.lat + jitterLat,
                            lng: currentCoords.lng + jitterLng,
                            locationName: currentMapNames[0] || "Unknown",
                            pokemon: pokemonName,
                            rate: rate,
                            method: type,
                            isDay: isDay,
                            rawLine: line
                        });
                    }
                }
            }
        }
    }
    return markers;
}

export async function getPokemonIdByName(name) {
    const normalizedName = normalizePokemonName(name);
    if (pokemonNameToIdCache[normalizedName]) return pokemonNameToIdCache[normalizedName];
    if (normalizedName === 'type-null') return 772;
    if (normalizedName === 'tapu-koko') return 785;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${normalizedName}`);
        if (response.ok) {
            const data = await response.json();
            pokemonNameToIdCache[normalizedName] = data.id;
            return data.id;
        }
        const alolaResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${normalizedName}-alola`);
        if (alolaResponse.ok) {
            const data = await alolaResponse.json();
            pokemonNameToIdCache[normalizedName] = data.id;
            return data.id;
        }
    } catch (error) {
        console.warn(`Could not fetch ID for ${name}`);
    }
    return 0;
}

let cachedEncounterMarkers = null;

async function loadEncounterMarkers() {
    if (cachedEncounterMarkers) return cachedEncounterMarkers;

    try {
        const textData = encounterTableRaw || "";
        cachedEncounterMarkers = await parseEncounterData(textData);
        return cachedEncounterMarkers;
    } catch (error) {
        console.error("Failed to load encounter table:", error);
        cachedEncounterMarkers = [];
        return cachedEncounterMarkers;
    }
}

export async function getPokemonSpawnLocations(pokemonName) {
    if (!pokemonName) return [];

    const markers = await loadEncounterMarkers();
    if (!markers || markers.length === 0) return [];

    const normalizedTarget = normalizePokemonName(pokemonName);
    const pokemonId = await getPokemonIdByName(pokemonName);

    return markers
        .filter(marker => normalizePokemonName(marker.pokemon) === normalizedTarget)
        .map(marker => ({
            lat: marker.lat,
            lng: marker.lng,
            location: marker.locationName,
            percentage: marker.rate,
            isDay: marker.isDay,
            pokemonId,
            pokemonName
        }));
}

// Get all unique Pokemon names that appear in the encounter data
export async function getAllMapPokemonNames() {
    const markers = await loadEncounterMarkers();
    if (!markers || markers.length === 0) return [];

    // Get unique Pokemon names from encounter data
    const uniqueNames = new Set();
    markers.forEach(marker => {
        if (marker.pokemon && marker.pokemon !== 'None') {
            uniqueNames.add(marker.pokemon);
        }
    });

    return Array.from(uniqueNames);
}