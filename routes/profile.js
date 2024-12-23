const express = require('express');
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/profile/:username', redirectLogin, (req, res, next) => {
    let newData = {}; // Create newData object for profile data to use in EJS
    newData.error = false; // Initialise error (when no result found) as false
    newData.user = req.session.user; // Add user info to object
    let newRecord = [req.params.username, req.session.user.id];
    let sqlQuery = `CALL pr_profileinfo(?,?);`; // Get user profile info procedure
    db.query(sqlQuery, newRecord, getProfileInfo); // Start query chain

    // Query database for user profile information
    function getProfileInfo(err, result) {
        if (err) { // Handle MySQL Errors
            res.redirect('/');
            return console.error(err.message);
        }
        // Case: No matching username found (User does not exist)
        if (result[0].length == 0) { 
            newData.error = true;
            return res.render('profile.ejs', newData);
        }
        // Case: Matching username found
        // Update newData object with profile info
        newData.profile = result[0][0];
        console.log(newData.profile);
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

router.get('/profile/:username/likedposts', redirectLogin, (req, res, next) => {
    let newRecord = [req.session.user.id, req.params.username];
    let sqlQuery = `CALL pr_getlikedposts(?,?);`;
    db.query(sqlQuery, newRecord, getLikedPosts);

    function getLikedPosts(err, result) {
        if (err) {
            console.error(err.message);
            return res.redirect('/');
        }
        let newData = {};
        newData.posts = result[0];
        newData.user = req.session.user;
        newData.profile = {};
        newData.profile.username = req.params.username;
        res.render('likedposts.ejs', newData)
    }
})

// Export the router so index.js can access it
module.exports = router;