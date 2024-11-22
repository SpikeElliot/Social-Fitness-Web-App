// Import node modules
const express = require('express'); // Express
const ejs = require('ejs'); // EJS

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
app.locals.appData = {appName: 'Test App'};

// Load the route handlers
const mainRoutes = require('./routes/main'); // Main route
app.use('/', mainRoutes);

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port: ${port}`));