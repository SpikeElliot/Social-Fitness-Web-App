const express = require('express');
const bcrypt = require('bcrypt'); // Bcrypt module for hashing passwords
const {check, validationResult} = require('express-validator'); // Validation
const router = express.Router(); // Create a router object
let db = require('../index.js'); // Get pool connection

// ROUTE HANDLERS

router.get('/login', redirectHome, (req, res, next) => {
    res.render('login.ejs');                                              
});

// Create sanitisation and validation chain for login fields
loginValidation = [check('username')
                   .trim()
                   .escape()
                   .isLength({min: 3, max: 64})
                   .withMessage('Username must be between 3 and 64 characters')
                   .bail()
                   .matches("^[a-zA-Z_.-]+$")
                   .withMessage('Username can only contain letters, numbers, underscores, full stops, and hyphens'),

                   check('password')
                   .trim()
                   .escape()
                   .isLength({min: 8, max: 255})
                   .withMessage('Password must be between 8 and 255 characters')];

router.post('/loggedin', loginValidation, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Error handling for field validation
        let errArray = errors.array();
        let errString = "Error:\n\n";
        for (let i = 0; i < errArray.length; i++) errString += `${errArray[i].msg} | `;
        return res.send(errString);
    }
    let user_id; // Initialise user_id variable in outer function scope
    let user_strava_id;
    let newRecord = [req.body.username];
    let sqlQuery = `CALL pr_login(?);`;
    // Query database to find username matching input and get hashed pw
    console.log('----------------------------------------');
    console.log('Getting login details with matching username...');
    db.query(sqlQuery, newRecord, getLoginDetails);

    function getLoginDetails(err, result) {
        if (err) { // Handle MySQL Errors
            res.redirect(`${rootPath}/login`);
            return console.error(err);
        }
        // Case: No matching username found
        if (result[0].length == 0) {
            // TO DO: Make this cleaner and functional
            console.log('Result: No matching username found');
            return res.send('User not found'); // Send error message
        }
        // Case: Matching username found
        let hashedPw = result[0][0].hashed_password.toString(); // Get hashed pw
        user_id = result[0][0].user_id; // Set outer scope user_id value
        user_strava_id = result[0][0].strava_id; // Set user's strava_id
        // Compare hashed input to hashed password of user in database
        console.log('Comparing hashed input to saved password hash...');
        bcrypt.compare(req.body.password, hashedPw, matchPasswords);
    }

    function matchPasswords(err, result) {
        if (err) { // Handle Bcrypt Errors
            console.error(err.message);
            return res.redirect(rootPath);
        }
        // Case: Passwords match
        if (result) { // Log user in and redirect to home
            console.log('Result: Input password is correct');
            req.session.user = {id: user_id,
                                username: req.body.username,
                                strava_id: user_strava_id};
            return res.redirect(rootPath);
        } 
        // Case: Passwords do not match
        // TO DO: Make this cleaner and functional
        console.log('Result: Input password is incorrect');
        res.send('Incorrect password'); // Send error message
    }
});

// Export the router so index.js can access it
module.exports = router;