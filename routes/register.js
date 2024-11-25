// REQUIRED MODULES AND VARIABLES
const express = require('express');
const bcrypt = require('bcrypt'); // Bcrypt module for hashing passwords
const saltRounds = 10; // Number of rounds for hash salting function
const {check, validationResult} = require('express-validator'); // Validation
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/register', redirectHome, (req, res, next) => {
    res.render('register.ejs');                                                             
});  

// Create validation chains for register page fields
registerValidation = [check('email').isEmail().isLength({max: 255}).normalizeEmail(), 
                    check('username').escape().isLength({min: 3, max: 64}).matches("^[a-zA-Z_.'-]+$"),
                    check('password').escape().isLength({min: 8, max: 255}),
                    check('firstname').escape().isLength({min: 1, max: 255}).trim(),
                    check('lastname').escape().isLength({min: 1, max: 255}).trim()];

router.post('/registered', registerValidation, (req, res, next) => {
    // Check validation of fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Reload the page if any field has an error
        res.redirect('/register');
        return;
    }
    // Save new user data in database
    const plainPassword = req.body.password;
    // Encrypt user's password using bcrypt hashing algorithm
    bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
        let sqlquery = `INSERT INTO user
                        (username, hashed_password, firstname, lastname, email) 
                        VALUES (?,?,?,?,?)`;
        // Create record for query
        let newrecord = [req.body.username, hashedPassword, req.body.firstname,
                        req.body.lastname, req.body.email];
        db.query(sqlquery, newrecord, (err, result) => { // Execute sql query
            if (err) { // Error handling
                next(err);
                return;
            }
            res.redirect('/login'); // Send user to login page if no errors
        });
    });                                                              
});

// Export the router so index.js can access it
module.exports = router;