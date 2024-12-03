// Import node modules
const express = require('express'); // Express
const ejs = require('ejs'); // EJS
const mysql = require('mysql2'); // MySQL (for database)
const session = require('express-session'); // Session for user account log-ins
const validator = require('express-validator'); // For validation and sanitisation

// Create the express application object
const app = express();
const port = 8000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Set up body-parser
app.use(express.urlencoded({ extended: true }));

// Set up public folder (contains css and static js)
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
    saveUninitialized: false,
    cookie: {expires: 600000}
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

// Set global redirect functions
global.redirectHome = redirectHome;
global.redirectLogin = redirectLogin;

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

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port: ${port}`));