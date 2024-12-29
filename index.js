// Import node modules
const express = require('express'); // Express
const ejs = require('ejs'); // EJS
const mysql = require('mysql2'); // MySQL (for database)
const session = require('express-session'); // Session for user account log-ins
const validator = require('express-validator'); // For validation and sanitisation
require('dotenv').config(); // Use environment variables for API
const clientSecret = process.env.clientSecret;
const clientId = process.env.clientId;
// Set global variables for API
global.clientSecret = clientSecret;
global.clientId = clientId;

// Create the express application object
const app = express();
const port = 8000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Set up body-parser
app.use(express.urlencoded({extended: true}));

// Set up public folder (contains css, static js, and assets)
app.use(express.static(__dirname + '/public'));

// Define application-specific data
app.locals.appData = {appName: 'Fitter'};

// Define the database connection
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'fitter_app',
    password: 'password',
    database: 'fitter'
});

// Connect to the database
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

global.db = db; // Set global database variable

// Define data for session
app.use(session({
    secret: 'paperpadlock',
    resave: false,
    saveUninitialized: false
}));

// Redirects user to home page when user logged in
const redirectHome = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/');
    } else {
        next(); // Move to next middleware function
    }
};

// Redirects user to login page when user not logged in
const redirectLogin = (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/login'); 
    } else {
        next(); // Move to next middleware function
    }
};

// Take a time in seconds and convert to necessary format
const timeConvert = duration => {
    let hrs = Math.floor(duration/3600);
    let mins = Math.floor((duration - hrs*3600)/60);
    let secs = (duration%60);
    
    let timeString = '';
    if (hrs != 0) timeString += `${hrs} hours `;
    if (mins != 0) timeString += `${mins} mins `;
    timeString += `${secs} secs`;

    return timeString;
};

// Formatting for posts' linked activity data
const formatActivity = a => {
    // Convert elapsed_time to correct format
    let convertedTime = timeConvert(a.elapsed_time);
    a.elapsed_time = convertedTime;

    // Find paces from speeds
    if (a.average_speed) {
        let average_pace = Math.floor(1000/a.average_speed);
        let max_pace = Math.floor(1000/a.max_speed);
        // Convert paces to correct format
        a.average_pace = timeConvert(average_pace);
        a.max_pace = timeConvert(max_pace);
    }
};

// Set global functions
global.redirectHome = redirectHome;
global.redirectLogin = redirectLogin;
global.timeConvert = timeConvert;
global.formatActivity = formatActivity;

// Load the route handlers

// Main routes
const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);

// Login routes
const loginRoutes = require('./routes/login');
app.use(('/login', loginRoutes));

// Register routes
const registerRoutes = require('./routes/register');
app.use(('/register', registerRoutes));

// User profile routes
const profileRoutes = require('./routes/profile');
app.use(('/profile', profileRoutes));

// Post search routes
const searchRoutes = require('./routes/search');
app.use(('/search', searchRoutes));

// Post routes
const postRoutes = require('./routes/post');
app.use(('/post', postRoutes));

// User routes
const userRoutes = require('./routes/user');
app.use(('/user', userRoutes));

// exchange_token route (for Strava API)
const exchangeTokenRoute = require('./routes/exchange_token');
app.use(('/exchange_token', exchangeTokenRoute));

// Activities routes
const activitiesRoutes = require('./routes/activities');
app.use(('/activities', activitiesRoutes));

// API routes
const apiRoutes = require('./routes/api');
app.use(('/api', apiRoutes));

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port: ${port}`));