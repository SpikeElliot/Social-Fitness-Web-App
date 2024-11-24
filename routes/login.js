const express = require('express');
const bcrypt = require('bcrypt'); // Bcrypt module for hashing passwords
const router = express.Router(); // Create a router object

// Route handlers

router.get('/login', (req, res, next) => {
    res.render('login.ejs');                                                        
});

router.post('/loggedin', (req, res, next) => {
    // Query database to find username matching input and get hashed pw
    let sqlquery = `SELECT hashed_password FROM user WHERE username = '${req.body.username}'`;
    db.query(sqlquery, (err, result) => { // Execute sql query
        // Error handling
        if (err) next(err); // Move to next middleware function
        if (result.length == 0) { // Send error message when no match found
            res.send('Error: user not found');
            return;
        }
        // If matching username found in database, get their hashed pw
        let hashedPw = result[0].hashed_password.toString();
        // Compare hashed input to hashed password of user in database
        bcrypt.compare(req.body.password, hashedPw, (err, result) => {
            if (err) next(err);
            if (result) { // Passwords match, log user in and redirect to home
                res.redirect('/');
            } else { // Passwords don't match, send error message
                res.send('Error: Incorrect password');
            }
        });
    });
});

// Export the router so index.js can access it
module.exports = router;