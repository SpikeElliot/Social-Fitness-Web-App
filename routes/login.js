const express = require('express');
const bcrypt = require('bcrypt'); // Bcrypt module for hashing passwords
const {check, validationResult} = require('express-validator'); // Validation
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/login', redirectHome, (req, res, next) => {
    res.render('login.ejs');                                              
});

// Create sanitisation and validation chain for login fields
loginValidation = [check('username').escape().isLength({min: 3, max: 64}).matches("^[a-zA-Z_.'-]+$"),
                   check('password').escape().isLength({min: 8, max: 255})];

router.post('/loggedin', loginValidation, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Error handling for field validation
        // TO DO: Add error message
        return res.redirect('/login');
    }
    let user_id; // Initialise user_id variable in outer function scope
    let newRecord = [req.body.username];
    let sqlQuery = `CALL pr_login(?);`; // Get Login Details Procedure
    // Query database to find username matching input and get hashed pw
    db.query(sqlQuery, newRecord, getLoginDetails);

    function getLoginDetails(err, result) {
        if (err) { // Handle MySQL Errors
            res.redirect('/login');
            return console.error(err);
        }
        // Case: No matching username found
        if (result[0].length == 0) {
            // TO DO: Make this cleaner and functional
            return res.send('User not found'); // Send error message
        }
        // Case: Matching username found
        let hashedPw = result[0][0].hashed_password.toString(); // Get hashed pw
        user_id = result[0][0].user_id; // Set outer scope user_id value
        // Compare hashed input to hashed password of user in database
        bcrypt.compare(req.body.password, hashedPw, matchPasswords);
    }

    function matchPasswords(err, result) {
        if (err) next(err); // Handle Bcrypt Errors
        // Case: Passwords match
        if (result) { // Log user in and redirect to home
            req.session.user = {id: user_id,
                                username: req.body.username};
            return res.redirect('/');
        } 
        // Case: Passwords do not match
        // TO DO: Make this cleaner and functional
        res.send('Incorrect password'); // Send error message
    }
});

// Export the router so index.js can access it
module.exports = router;