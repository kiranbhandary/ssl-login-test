const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3000;

// This is a "fake" database for demonstration purposes.
// In a real app, you would fetch this from a database like PostgreSQL, MySQL, or MongoDB.
const users = [
    {
        email: 'user@example.com',
        // Password is "password123". NEVER store plain text.
        // This is a hash generated from "password123".
        passwordHash: '$2b$10$f9NAb/T6LzB1d.4zJ3zL2e5d7nF3gH.oQ/1Zg9b8b7jK9mK4lJ3jO'
    }
];

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname))); // Serve static files like HTML and CSS

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle the login form submission
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = users.find(u => u.email === email);
    if (!user) {
        // We send a generic message to avoid revealing which emails are registered.
        return res.status(401).send('Invalid email or password.');
    }

    try {
        // 2. Compare the submitted password with the stored hash
        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (isMatch) {
            // Passwords match!
            // In a real app, you would create a session/token here.
            res.send('<h1>Login Successful!</h1><p>Welcome to your application.</p>');
        } else {
            // Passwords do not match
            res.status(401).send('Invalid email or password.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An internal error occurred.');
    }
});

const https = require('https');
const fs = require('fs');

// --- HTTPS Options ---
const options = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem')
};

// --- Create HTTPS server instead of HTTP ---
https.createServer(options, app).listen(PORT, () => {
    console.log(`Server is running securely on https://localhost:${PORT}`);
});