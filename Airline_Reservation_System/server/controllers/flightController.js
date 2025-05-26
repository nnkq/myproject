const Flight = require('../models/Flight');

// Get all flights
exports.getAllFlights = async (req, res) => {
    try {
        const { from, to, date, passengers, class: flightClass } = req.query;
        
        // Basic query
        let query = {};
        
        // Add filters based on query parameters
        if (from) query['departure.airport'] = from;
        if (to) query['arrival.airport'] = to;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            
            query['departure.time'] = {
                $gte: startDate,
                $lt: endDate
            };
        }
        
        // Check available seats
        if (passengers) {
            const numPassengers = parseInt(passengers);
            query[`availableSeats.${flightClass || 'economy'}`] = { $gte: numPassengers };
        }
        
        const flights = await Flight.find(query);
        
        res.json({
            success: true,
            count: flights.length,
            data: flights
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Get flight by ID
exports.getFlightById = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        
        if (!flight) {
            return res.status(404).json({
                success: false,
                error: 'Flight not found'
            });
        }
        
        res.json({
            success: true,
            data: flight
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Create new flight (admin only)
exports.createFlight = async (req, res) => {
    try {
        const flight = await Flight.create(req.body);
        
        res.status(201).json({
            success: true,
            data: flight
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Update flight (admin only)
exports.updateFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        if (!flight) {
            return res.status(404).json({
                success: false,
                error: 'Flight not found'
            });
        }
        
        res.json({
            success: true,
            data: flight
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Delete flight (admin only)
exports.deleteFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndDelete(req.params.id);
        
        if (!flight) {
            return res.status(404).json({
                success: false,
                error: 'Flight not found'
            });
        }
        
        res.json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};