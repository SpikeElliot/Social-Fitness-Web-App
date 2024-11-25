// REQUIRED MODULES AND VARIABLES
const express = require('express');
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/profile/:username', redirectLogin, (req, res, next) => {
    // Query database to get user info
    let sqlquery = `SELECT follower_count, following_count, country, city, date_joined
                    FROM user
                    WHERE username = ?`;
    // Execute sql query
    db.query(sqlquery, [req.params.username], (err,result) => {
        if (err) { // Error handling
            res.redirect('./');
            return console.error(err.message);
        }
        if (result.length == 0) { // If no user found in database
            res.redirect('./');
            return;
        }
        // If user found, render user's information on profile page
        result[0].username = req.params.username;
        res.render('profile.ejs', result[0]);
    });
});

// Export the router so index.js can access it
module.exports = router;