// REQUIRED MODULES AND VARIABLES
const express = require('express');
const bcrypt = require('bcrypt'); // Bcrypt module for hashing passwords
const {check, validationResult} = require('express-validator'); // Validation
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/login', redirectHome, (req, res, next) => {
    res.render('login.ejs');                                                        
});

loginValidation = [check('username').escape().isLength({min: 3, max: 64}).matches("^[a-zA-Z_.'-]+$"),
                check('password').escape().isLength({min: 8, max: 255})];

router.post('/loggedin', loginValidation, (req, res, next) => {
    // Check validation of fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Reload the page if any field has an error
        res.redirect('/login');
        return;
    }
    // Query database to find username matching input and get hashed pw
    let sqlQuery = `SELECT hashed_password, user_id
                    FROM user 
                    WHERE username = '${req.body.username}'`;
    db.query(sqlQuery, (err, result) => { // Execute sql query
        // Error handling
        if (err || result.length == 0) { // Send error message when no match found
            res.send('Error: user not found');
            return;
        }
        // If matching username found in database, get their hashed pw
        let hashedPw = result[0].hashed_password.toString();
        let user_id = result[0].user_id;
        // Compare hashed input to hashed password of user in database
        bcrypt.compare(req.body.password, hashedPw, (err, result) => {
            if (err) next(err);
            if (result) { // Passwords match, log user in and redirect to home
                req.session.user = {id: user_id, 
                                    username: req.body.username};
                res.redirect('/');
            } else { // Passwords don't match, send error message
                res.send('Error: Incorrect password');
            }
        });
    });
});

// Export the router so index.js can access it
module.exports = router;