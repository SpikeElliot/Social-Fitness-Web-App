const express = require('express');
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/profile/:username', redirectLogin, (req, res, next) => {
    let newData = {}; // Create newData object for profile data to use in EJS
    newData.errMsg = null; // Initialise error message as null
    let newRecord = [req.params.username];
    let sqlQuery = `CALL pr_profileinfo(?);`; // Get user profile info procedure
    db.query(sqlQuery, newRecord, getProfileInfo); // Start query chain

    // Query database for user profile information
    function getProfileInfo(err, result) {
        if (err) { // Handle MySQL Errors
            res.redirect('/');
            return console.error(err.message);
        }
        // Case: No matching username found (User does not exist)
        if (result[0].length == 0) { 
            newData.errMsg = 'User not found'; // Set error message for EJS
            return res.render('profile.ejs', newData);
        }
        // Case: Matching username found
        newData.user = req.session.user; // Update newData object with profile info
        newData.profile = result[0][0];
        newData.profile.username = req.params.username;
        
        newRecord = [req.session.user.id, req.params.username];
        sqlQuery = `CALL pr_profileposts(?,?);`; // Get all posts by user procedure
        // Move to next function in chain
        db.query(sqlQuery, newRecord, getProfilePosts);
    }

    // Query database for all posts made by profile user
    function getProfilePosts(err, result) {
        if (err) { // Handle MySQL Errors
            res.redirect('/');
            return console.error(err.message);
        }
        newData.posts = result[0]; // Update newData object with user's posts
        res.render('profile.ejs', newData);
    }
});

// Export the router so index.js can access it
module.exports = router;