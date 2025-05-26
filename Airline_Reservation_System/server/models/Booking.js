const mongoose = require('mongoose');

const PassengerSchema = new mongoose.Schema({
    title: {
        type: String,
        enum: ['Mr', 'Mrs', 'Ms']
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    dob: {
        type: Date
    },
    nationality: {
        type: String
    },
    passport: {
        number: String,
        expiry: Date,
        country: String
    },
    specialRequests: {
        meal: String,
        assistance: String
    }
});

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    flight: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
        required: true
    },
    passengers: [PassengerSchema],
    contactInfo: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },
    bookingClass: {
        type: String,
        enum: ['economy', 'premium', 'business', 'first'],
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'cancelled', 'refunded'],
        default: 'pending'
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: String,
    transactionId: String
});

module.exports = mongoose.model('Booking', BookingSchema);