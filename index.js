// Import node modules
const express = require('express'); // Express
const ejs = require('ejs'); // EJS
const mysql = require('mysql2'); // MySQL (for database)

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

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port: ${port}`));