import mongoose from "mongoose";

const mapPinSchema = new mongoose.Schema({
    pokemonID: {
        type: Number,
        required: true
    },
    pokemonName: {
        type: String,
        default: ''
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    percentage: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    strict: false
});

const MapPin = mongoose.model("MapPin", mapPinSchema);

export default MapPin;