const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'skywing_airlines',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// JWT Secret
const JWT_SECRET = 'your_jwt_secret_key';

// Authentication middleware
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [decoded.userId]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        req.user = users[0];
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Routes

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, full_name, phone_number, date_of_birth } = req.body;
        
        // Check if user exists
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ? OR email = ?', 
            [username, email]
        );
        
        if (users.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password_hash, full_name, phone_number, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, full_name, phone_number, date_of_birth]
        );
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ 
            token,
            user: {
                id: user.user_id,
                username: user.username,
                email: user.email,
                full_name: user.full_name
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Search flights
app.get('/api/flights/search', async (req, res) => {
    try {
        const { departure, arrival, date, passengers, class: flightClass } = req.query;
        
        // Basic validation
        if (!departure || !arrival || !date) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Convert date to MySQL format
        const formattedDate = new Date(date).toISOString().split('T')[0];
        
        // Build query
        let query = `
            SELECT f.*, a1.airport_name AS departure_airport_name, a1.city AS departure_city,
                   a2.airport_name AS arrival_airport_name, a2.city AS arrival_city,
                   al.airline_name, al.logo_url
            FROM flights f
            JOIN airports a1 ON f.departure_airport = a1.airport_code
            JOIN airports a2 ON f.arrival_airport = a2.airport_code
            JOIN airlines al ON f.airline_id = al.airline_id
            WHERE f.departure_airport = ? AND f.arrival_airport = ?
            AND DATE(f.departure_time) = ?
            AND f.available_seats >= ?
        `;
        
        const params = [departure, arrival, formattedDate, passengers || 1];
        
        // Add class filter if specified
        if (flightClass) {
            query += ` AND f.${flightClass}_price IS NOT NULL`;
        }
        
        // Execute query
        const [flights] = await pool.query(query, params);
        
        // Format results
        const results = flights.map(flight => {
            const departureTime = new Date(flight.departure_time);
            const arrivalTime = new Date(flight.arrival_time);
            
            // Calculate duration
            const durationMs = arrivalTime - departureTime;
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
            
            return {
                id: flight.flight_id,
                airline: {
                    name: flight.airline_name,
                    code: flight.airline_code,
                    logo: flight.logo_url
                },
                flight_number: flight.flight_number,
                departure: {
                    airport: flight.departure_airport,
                    airport_name: flight.departure_airport_name,
                    city: flight.departure_city,
                    time: departureTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    date: departureTime.toLocaleDateString('vi-VN')
                },
                arrival: {
                    airport: flight.arrival_airport,
                    airport_name: flight.arrival_airport_name,
                    city: flight.arrival_city,
                    time: arrivalTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    date: arrivalTime.toLocaleDateString('vi-VN')
                },
                duration: `${hours}h ${minutes}m`,
                prices: {
                    economy: flight.economy_price,
                    premium: flight.premium_economy_price,
                    business: flight.business_price,
                    first: flight.first_class_price
                },
                available_seats: flight.available_seats
            };
        });
        
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create booking
app.post('/api/bookings', authenticate, async (req, res) => {
    try {
        const { flight_id, passengers, contact_info, payment_method } = req.body;
        
        // Validate input
        if (!flight_id || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
            return res.status(400).json({ error: 'Invalid booking data' });
        }
        
        // Start transaction
        const conn = await pool.getConnection();
        await conn.beginTransaction();
        
        try {
            // Generate booking reference
            const bookingRef = 'SKW' + Math.floor(100000 + Math.random() * 900000);
            
            // Calculate total amount
            const [flights] = await conn.query('SELECT * FROM flights WHERE flight_id = ?', [flight_id]);
            
            if (flights.length === 0) {
                throw new Error('Flight not found');
            }
            
            const flight = flights[0];
            let totalAmount = 0;
            
            passengers.forEach(passenger => {
                let price;
                switch (passenger.seat_class) {
                    case 'premium':
                        price = flight.premium_economy_price;
                        break;
                    case 'business':
                        price = flight.business_price;
                        break;
                    case 'first':
                        price = flight.first_class_price;
                        break;
                    default:
                        price = flight.economy_price;
                }
                
                totalAmount += price;
            });
            
            // Add taxes and fees (20%)
            totalAmount *= 1.2;
            
            // Create booking
            const [bookingResult] = await conn.query(
                'INSERT INTO bookings (user_id, booking_reference, total_amount) VALUES (?, ?, ?)',
                [req.user.user_id, bookingRef, totalAmount]
            );
            
            const bookingId = bookingResult.insertId;
            
            // Add booking details
            for (const passenger of passengers) {
                let price;
                switch (passenger.seat_class) {
                    case 'premium':
                        price = flight.premium_economy_price;
                        break;
                    case 'business':
                        price = flight.business_price;
                        break;
                    case 'first':
                        price = flight.first_class_price;
                        break;
                    default:
                        price = flight.economy_price;
                }
                
                await conn.query(
                    'INSERT INTO booking_details (booking_id, flight_id, passenger_name, passenger_type, seat_class, price) VALUES (?, ?, ?, ?, ?, ?)',
                    [bookingId, flight_id, passenger.name, passenger.type, passenger.seat_class, price]
                );
            }
            
            // Update available seats
            await conn.query(
                'UPDATE flights SET available_seats = available_seats - ? WHERE flight_id = ?',
                [passengers.length, flight_id]
            );
            
            // Commit transaction
            await conn.commit();
            
            res.status(201).json({ 
                booking_id: bookingId,
                booking_reference: bookingRef,
                total_amount: totalAmount
            });
        } catch (error) {
            // Rollback transaction on error
            await conn.rollback();
            throw error;
        } finally {
            // Release connection
            conn.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user bookings
app.get('/api/bookings', authenticate, async (req, res) => {
    try {
        const [bookings] = await pool.query(`
            SELECT b.*, 
                   COUNT(bd.booking_detail_id) AS passenger_count,
                   MIN(f.departure_time) AS earliest_departure
            FROM bookings b
            JOIN booking_details bd ON b.booking_id = bd.booking_id
            JOIN flights f ON bd.flight_id = f.flight_id
            WHERE b.user_id = ?
            GROUP BY b.booking_id
            ORDER BY b.booking_date DESC
        `, [req.user.user_id]);
        
        const formattedBookings = await Promise.all(bookings.map(async booking => {
            const [details] = await pool.query(`
                SELECT bd.*, f.flight_number, f.departure_time, f.arrival_time,
                       a1.airport_code AS departure_airport, a1.city AS departure_city,
                       a2.airport_code AS arrival_airport, a2.city AS arrival_city,
                       al.airline_name
                FROM booking_details bd
                JOIN flights f ON bd.flight_id = f.flight_id
                JOIN airports a1 ON f.departure_airport = a1.airport_code
                JOIN airports a2 ON f.arrival_airport = a2.airport_code
                JOIN airlines al ON f.airline_id = al.airline_id
                WHERE bd.booking_id = ?
            `, [booking.booking_id]);
            
            const passengers = details.map(detail => ({
                name: detail.passenger_name,
                type: detail.passenger_type,
                seat_class: detail.seat_class
            }));
            
            const flights = details.reduce((unique, detail) => {
                if (!unique.some(f => f.flight_id === detail.flight_id)) {
                    unique.push({
                        flight_id: detail.flight_id,
                        flight_number: detail.flight_number,
                        airline: detail.airline_name,
                        departure: {
                            airport: detail.departure_airport,
                            city: detail.departure_city,
                            time: new Date(detail.departure_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                            date: new Date(detail.departure_time).toLocaleDateString('vi-VN')
                        },
                        arrival: {
                            airport: detail.arrival_airport,
                            city: detail.arrival_city,
                            time: new Date(detail.arrival_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                            date: new Date(detail.arrival_time).toLocaleDateString('vi-VN')
                        }
                    });
                }
                return unique;
            }, []);
            
            return {
                id: booking.booking_id,
                reference: booking.booking_reference,
                date: new Date(booking.booking_date).toLocaleDateString('vi-VN'),
                status: booking.payment_status,
                total_amount: booking.total_amount,
                passenger_count: booking.passenger_count,
                passengers,
                flights
            };
        }));
        
        res.json(formattedBookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});