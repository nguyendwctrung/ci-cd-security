import MapPin from "../../models/mapPin.model.js";
import { User } from "../../models/user.model.js";

// Get user's map state
export const getMapState = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        // Get user's selected Pokemon
        const user = await User.findById(userId);
        const selectedPokemon = user?.selectedPokemon || [];

        // Get all markers for this user
        const mapPins = await MapPin.find({ userID: userId });

        // Convert MapPin documents to marker format
        const markers = mapPins.map(pin => ({
            id: pin._id.toString(),
            pokemonId: pin.pokemonID,
            pokemonName: pin.pokemonName || '',
            lat: pin.latitude,
            lng: pin.longitude,
            notes: pin.notes || '',
            location: pin.location || '',
            percentage: pin.percentage || 0,
            isPinned: pin.isPinned !== undefined ? pin.isPinned : true
        }));

        res.status(200).json({
            success: true,
            message: "Map state retrieved successfully",
            data: {
                selectedPokemon: selectedPokemon,
                markers: markers
            }
        });
    } catch (error) {
        console.error('Get map state error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during fetching map state'
        });
    }
};

// Save user's map state
export const saveMapState = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { selectedPokemon, markers } = req.body;

        // Validate input
        if (!Array.isArray(selectedPokemon) || !Array.isArray(markers)) {
            return res.status(400).json({
                success: false,
                message: "Invalid data format. selectedPokemon and markers must be arrays"
            });
        }

        // Update user's selected Pokemon
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { selectedPokemon: selectedPokemon || [] },
            { new: true }
        );

        // Delete all existing markers for this user
        const deleteResult = await MapPin.deleteMany({ userID: userId });

        // Create new markers
        if (markers && markers.length > 0) {
            const mapPinsToInsert = markers.map(marker => ({
                pokemonID: marker.pokemonId,
                pokemonName: marker.pokemonName || '',
                userID: userId,
                latitude: marker.lat,
                longitude: marker.lng,
                notes: marker.notes || '',
                location: marker.location || '',
                percentage: marker.percentage || 0,
                status: false,
                isPinned: marker.isPinned !== undefined ? marker.isPinned : true
            }));

            const insertResult = await MapPin.insertMany(mapPinsToInsert);
        }

        res.status(200).json({
            success: true,
            message: "Map state saved successfully",
            data: {
                selectedPokemon: selectedPokemon,
                markers: markers
            }
        });
    } catch (error) {
        console.error('Save map state error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during saving map state'
        });
    }
};

// Clear user's map state
export const clearMapState = async (req, res) => {
    try {
        const userId = req.user.id;

        // Clear selected Pokemon
        await User.findByIdAndUpdate(userId, {
            selectedPokemon: []
        });

        // Delete all markers
        await MapPin.deleteMany({ userID: userId });

        res.status(200).json({
            success: true,
            message: "Map state cleared successfully"
        });
    } catch (error) {
        console.error('Clear map state error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during clearing map state'
        });
    }
};

