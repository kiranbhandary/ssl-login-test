// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = 3000;

// --- Session Setup ---
// This allows us to store a user's login state
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // Use 'true' because we are using HTTPS
}));

// --- Passport (Authentication) Setup ---
app.use(passport.initialize());
app.use(passport.session());

// This function tells Passport how to save a user into the session
passport.serializeUser((user, done) => {
    done(null, user);
});

// This function tells Passport how to get a user out of the session
passport.deserializeUser((user, done) => {
    // In a real app, you would find the user in your database here
    done(null, user);
});

// Configure the Google Strategy for Passport
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
        // This function is called after Google successfully authenticates the user.
        // 'profile' contains the user's Google profile information.
        // In a real app, you would find or create a user in your database here.
        console.log('Google profile:', profile);
        return done(null, profile);
    }
));


// --- Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname))); // Serve static files like HTML and CSS

// A simple middleware to protect routes
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

// --- Routes ---

// Home page / Login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// == Google SSO Routes ==
// This route starts the Google sign-in process
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// This is the route Google redirects to after the user logs in
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect to a protected profile page.
        res.redirect('/profile');
    }
);

// == Protected Route ==
// This page is only accessible after a user logs in
app.get('/profile', isLoggedIn, (req, res) => {
    // req.user is populated by Passport with the user's profile information
    const displayName = req.user.displayName || 'User';
    res.send(`<h1>Hello, ${displayName}!</h1><p>You are logged in.</p><a href="/logout">Logout</a>`);
});

// == Logout Route ==
app.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// --- ADD THIS BLOCK INSTEAD ---
app.listen(3000, () => {
    console.log('Server is ready.');
});

module.exports = app;