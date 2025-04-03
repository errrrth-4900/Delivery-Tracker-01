# Rustlers Delivery Tracker

A real-time delivery tracking application that simulates a driver's journey to a customer's location. The app includes features like:

- Real-time distance tracking
- Smart plug status monitoring
- Estimated time of arrival
- Interactive map with driver animation
- Cooking and delivery notifications

## Features

- 🗺️ Interactive map with driver animation
- ⚡ Smart plug status that changes based on distance
- ⏱️ Time away from customer tracking
- 📏 Real-time distance updates
- 🕒 Estimated time of arrival
- 🍔 Cooking notification when driver is close
- 🛍️ Delivery confirmation popup

## Setup

1. Clone the repository
2. Open `public/index.html` in a web browser
3. No additional setup required - it's a pure HTML/CSS/JS application

## Usage

- Enter a time (0-60 minutes) in the "Time Away from Customer" input
- Click "Update" to set the driver's position
- Watch the driver move along the route
- The smart plug will automatically turn on when the driver is within 0.6 miles
- A cooking notification will appear when the driver is close
- A delivery notification will appear when the driver arrives

## Technologies Used

- Google Maps JavaScript API
- HTML5
- CSS3
- JavaScript (ES6+) 