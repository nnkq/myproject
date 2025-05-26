const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
    airline: {
        type: String,
        required: true,
        enum: ['Vietravel Airlines', 'Vietnam Airlines', 'Bamboo Airways', 'Vietjet Air', 'Jetstar Pacific']
    },
    flightNumber: {
        type: String,
        required: true
    },
    departure: {
        airport: {
            type: String,
            required: true
        },
        time: {
            type: Date,
            required: true
        }
    },
    arrival: {
        airport: {
            type: String,
            required: true
        },
        time: {
            type: Date,
            required: true
        }
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    price: {
        economy: {
            type: Number,
            required: true
        },
        premium: {
            type: Number,
            required: true
        },
        business: {
            type: Number,
            required: true
        },
        first: {
            type: Number,
            required: true
        }
    },
    stops: {
        type: Number,
        default: 0
    },
    availableSeats: {
        economy: {
            type: Number,
            default: 100
        },
        premium: {
            type: Number,
            default: 30
        },
        business: {
            type: Number,
            default: 20
        },
        first: {
            type: Number,
            default: 10
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Flight', FlightSchema);