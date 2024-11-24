// REQUIRED MODULES
const express = require('express');
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/', redirectLogin, (req, res, next) => {
    res.render('index.ejs', {username: req.session.user.uname});
});

// Export the router so index.js can access it
module.exports = router;