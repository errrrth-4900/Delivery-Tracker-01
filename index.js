const axios = require('axios');
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Configuration
const CONFIG = {
    // Default coordinates (example: New York City area)
    driverLocation: {
        lat: 40.7128,
        lng: -74.0060
    },
    customerLocation: {
        lat: 40.7580,
        lng: -73.9855
    },
    // Trigger threshold in seconds (5 minutes)
    triggerThreshold: 300,
    // Update interval in milliseconds (1 minute)
    updateInterval: 60000,
    // Webhook URL for triggering the smart plug
    webhookUrl: process.env.WEBHOOK_URL || 'https://webhook.site/your-url-here'
};

// Mock Google Distance Matrix API response
const mockDistanceMatrixResponse = {
    duration: {
        text: "4 mins",
        value: 240 // 4 minutes in seconds
    }
};

// Function to simulate Google Distance Matrix API call
async function getETA() {
    // TODO: Replace this with actual Google Maps API call
    // Example real API call:
    // const response = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${CONFIG.driverLocation.lat},${CONFIG.driverLocation.lng}&destinations=${CONFIG.customerLocation.lat},${CONFIG.customerLocation.lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
    // return response.data.rows[0].elements[0].duration.value;
    
    // For now, return mock data
    return mockDistanceMatrixResponse.duration.value;
}

// Function to trigger smart plug
async function triggerSmartPlug() {
    try {
        await axios.get(CONFIG.webhookUrl);
        console.log('✅ Smart plug triggered!');
    } catch (error) {
        console.error('❌ Error triggering smart plug:', error.message);
    }
}

// Main monitoring function
async function monitorDelivery() {
    try {
        const eta = await getETA();
        console.log(`Current ETA: ${Math.floor(eta / 60)} minutes and ${eta % 60} seconds`);

        if (eta <= CONFIG.triggerThreshold) {
            console.log('🚨 Driver is within trigger threshold!');
            await triggerSmartPlug();
        }

        // Emit status update to all connected clients
        const status = {
            driverLocation: CONFIG.driverLocation,
            customerLocation: CONFIG.customerLocation,
            eta,
            triggerThreshold: CONFIG.triggerThreshold
        };
        clients.forEach(client => {
            client.write(`data: ${JSON.stringify(status)}\n\n`);
        });
    } catch (error) {
        console.error('Error monitoring delivery:', error.message);
    }
}

// Function to update coordinates
function updateCoordinates(driverLat, driverLng, customerLat, customerLng) {
    CONFIG.driverLocation = { lat: driverLat, lng: driverLng };
    CONFIG.customerLocation = { lat: customerLat, lng: customerLng };
    console.log('Coordinates updated successfully!');
}

// Server-Sent Events clients
const clients = new Set();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/simple.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'simple.html'));
});

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Add this client to the clients set
    clients.add(res);

    // Remove client when they disconnect
    req.on('close', () => {
        clients.delete(res);
    });
});

app.post('/update-coordinates', (req, res) => {
    const { driverLat, driverLng, customerLat, customerLng } = req.body;
    updateCoordinates(driverLat, driverLng, customerLat, customerLng);
    res.json({ success: true });
});

// Serve Google Maps API key
app.get('/api/maps-key', (req, res) => {
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log('Driver location:', CONFIG.driverLocation);
    console.log('Customer location:', CONFIG.customerLocation);
    console.log(`Trigger threshold: ${CONFIG.triggerThreshold} seconds`);
});

// Initial check
monitorDelivery();

// Set up interval for continuous monitoring
setInterval(monitorDelivery, CONFIG.updateInterval);

// Export functions for external use
module.exports = {
    updateCoordinates,
    monitorDelivery
}; 