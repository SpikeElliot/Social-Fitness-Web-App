// REQUIRED MODULES AND VARIABLES
const express = require('express');
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/profile/:username', redirectLogin, (req, res, next) => {
    let newData = {}; // Create newData object for profile data to use in EJS
    newData.errMsg = null; // Initialise error message as null
    let newRecord = [req.params.username];
    let sqlQuery = `CALL pr_profileinfo(?);`;
    db.query(sqlQuery, newRecord, getProfileInfo); // Start query chain

    // Query database for user profile information
    function getProfileInfo(err, result) {
        if (err) { // Handle MySQL Errors
            res.redirect('/');
            return console.error(err.message);
        }
        // Case no user with matching username found
        if (result[0].length == 0) { 
            newData.errMsg = 'User not found'; // Set error message
            return res.render('profile.ejs', newData);
        }
        // Update newData object with profile info
        newData.user = req.session.user;
        newData.profile = result[0][0];
        newData.profile.username = req.params.username;
        // If user found, query database for all of their posts
        newRecord = [req.session.user.id, req.params.username];
        sqlQuery = `CALL pr_profileposts(?,?);`;
        db.query(sqlQuery, newRecord, getProfilePosts);
    }

    // Query database for all posts made by profile user
    function getProfilePosts(err, result) {
        if (err) { // Handle MySQL Errors
            res.redirect('/');
            return console.error(err.message);
        }
        newData.posts = result[0];
        res.render('profile.ejs', newData);
    }
});

// Export the router so index.js can access it
module.exports = router;