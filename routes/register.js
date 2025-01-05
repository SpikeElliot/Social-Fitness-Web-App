const express = require('express');
const bcrypt = require('bcrypt'); // Bcrypt module for hashing passwords
const saltRounds = 10; // Number of rounds for hash salting function
const {check, validationResult} = require('express-validator'); // Validation
const router = express.Router(); // Create a router object
let db = require('../index.js'); // Get pool connection

// ROUTE HANDLERS

router.get('/register', redirectHome, (req, res, next) => {
    res.render('register.ejs');                                                             
});  

// Create validation chains for register form
registerValidation = [check('username')
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
                      .withMessage('Password must be between 8 and 255 characters'),

                      check('firstname')
                      .trim()
                      .escape()
                      .isLength({min: 1, max: 255})
                      .withMessage('First name must be between 1 and 255 characters'),

                      check('lastname')
                      .trim()
                      .escape()
                      .isLength({min: 1, max: 255})
                      .withMessage('Last name must be between 1 and 255 characters'),
                    
                      check('email')
                      .trim()
                      .isEmail()
                      .withMessage('Must be a valid email')
                      .bail()
                      .isLength({max: 255})
                      .withMessage('Email must be less than 255 characters')
                      .bail()
                      .normalizeEmail()];

router.post('/registered', registerValidation, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Error handling for register form validation
        let errArray = errors.array();
        let errString = "Error:\n\n";
        for (let i = 0; i < errArray.length; i++) errString += `${errArray[i].msg} | `;
        return res.send(errString);
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