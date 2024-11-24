const express = require('express');
const bcrypt = require('bcrypt'); // Bcrypt module for hashing passwords
const saltRounds = 10; // Number of rounds for hash salting function
const router = express.Router(); // Create a router object

// Route handlers

router.get('/register', (req, res, next) => {
    res.render('register.ejs');                                                             
});  

router.post('/registered', (req, res, next) => {
    // Save new user data in database
    const plainPassword = req.body.password;
    // Encrypt user's password using bcrypt hashing algorithm
    bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
        let sqlquery = `INSERT INTO user
                        (username, hashed_password, firstname, lastname, email) 
                        VALUES (?,?,?,?,?)`;
        // Create record for query
        let newrecord = [req.body.username, hashedPassword, req.body.first,
                         req.body.last, req.body.email];
        db.query(sqlquery, newrecord, (err, result) => { // Execute sql query
            if (err) { // Error handling
                next(err);
                return;
            }
            res.redirect('/login'); // Redirect to login page if no errors
        })
    });                                                              
});

// Export the router so index.js can access it
module.exports = router;