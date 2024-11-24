const express = require('express');
const router = express.Router(); // Create a router object

// Route handlers

router.get('/', (req, res, next) => {
    res.render('index.ejs');
});

// Export the router so index.js can access it
module.exports = router;