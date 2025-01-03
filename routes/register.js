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
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Error handling for field registration
        // TO DO: Add error message
        console.error(errors);
        return res.redirect(`${rootPath}/register`);
    }
    const plainPassword = req.body.password;
    // Encrypt user's password using bcrypt hashing algorithm
    console.log('----------------------------------------');
    console.log('Hashing password...');
    bcrypt.hash(plainPassword, saltRounds, encryptPassword);
    
    function encryptPassword(err, hashedPassword) {
        if (err) {
            console.error(err.message);
            return res.redirect(rootPath);
        }
        let newRecord = [req.body.username, hashedPassword, req.body.firstname,
            req.body.lastname, req.body.email];
        let sqlQuery = `CALL pr_registeruser(?,?,?,?,?);`;
        // Add new user to database
        console.log('Saving new user to database...');
        db.query(sqlQuery, newRecord, registerUser);   
    }

    function registerUser(err, result) {
        if (err) {
            res.redirect(`${rootPath}/register`);
            return console.error(err.message);
        }
        // Case: No database errors
        console.log('Result: New user saved successfully');
        res.redirect(`${rootPath}/login`); // Send user to login page
    }
});

// Export the router so index.js can access it
module.exports = router;