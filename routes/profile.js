const express = require('express');
const router = express.Router(); // Create a router object
let db = require('../index.js'); // Get pool connection

// ROUTE HANDLERS

router.get('/profile/:username', redirectLogin, (req, res, next) => {
    let newData = {}; // Create newData object for profile data to use in EJS
    newData.error = false; // Initialise error (when no result found) as false
    newData.user = req.session.user; // Add user info to object
    let newRecord = [req.params.username, req.session.user.id];
    let sqlQuery = `CALL pr_profileinfo(?,?);`;
    console.log('----------------------------------------');
    console.log(`Getting user: ${req.params.username} profile info...`);
    db.query(sqlQuery, newRecord, getProfileInfo); // Start query chain

    // Query database for user profile information
    function getProfileInfo(err, result) {
        if (err) {
            res.redirect(rootPath);
            return console.error(err.message);
        }
        // Case: No matching username found (User does not exist)
        if (result[0].length == 0) {
            console.log('Result: No matching username found');
            newData.error = true;
            return res.render('profile.ejs', newData);
        }
        // Case: Matching username found
        // Update newData object with profile info
        newData.profile = result[0][0];
        newData.profile.username = req.params.username;
        
        newRecord = [req.session.user.id, req.params.username];
        sqlQuery = `CALL pr_profileposts(?,?);`;
        console.log(`Getting all posts made by user: ${req.params.username}`);
        db.query(sqlQuery, newRecord, getProfilePosts);
    }

    // Query database for all posts made by profile user
    function getProfilePosts(err, result) {
        if (err) { // Handle MySQL Errors
            res.redirect(rootPath);
            return console.error(err.message);
        }
        console.log('Result: All user profile data found successfully');
        newData.posts = result[0]; // Update newData object with user's posts
        // Formatting for posts' linked activity data
        for (let i = 0; i < newData.posts.length; i++) {
            // Check post has a linked activity
            if (newData.posts[i].activity_id) formatActivity(newData.posts[i]);
        }
        res.render('profile.ejs', newData);
    }
});

router.get('/profile/:username/likedposts', redirectLogin, (req, res, next) => {
    let newRecord = [req.session.user.id, req.params.username];
    let sqlQuery = `CALL pr_getlikedposts(?,?);`;
    console.log('----------------------------------------');
    console.log(`Getting posts liked by user: ${req.params.username}...`);
    db.query(sqlQuery, newRecord, getLikedPosts);

    function getLikedPosts(err, result) {
        if (err) {
            console.error(err.message);
            return res.redirect(rootPath);
        }
        // Case: liked posts found
        console.log('Result: Liked posts found successfully');
        let newData = {};
        newData.posts = result[0];
        // Formatting for posts' linked activity data
        for (let i = 0; i < newData.posts.length; i++) {
            // Check post has a linked activity
            if (newData.posts[i].activity_id) formatActivity(newData.posts[i]);
        }
        newData.user = req.session.user;
        newData.profile = {};
        newData.profile.username = req.params.username;
        res.render('likedposts.ejs', newData)
    }
});

// Export the router so index.js can access it
module.exports = router;