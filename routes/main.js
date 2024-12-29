const express = require('express');
const {body, validationResult} = require('express-validator'); // Validation
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/', redirectLogin, (req, res, next) => {
    // TO DO: Make feed customised based on user location, preferences, etc.
    let newData;
    let newRecord = [req.session.user.id];
    let sqlQuery = `CALL pr_indexposts(?);`;
    // Query database to find posts containing search term
    console.log('----------------------------------------');
    console.log('Getting all posts...');
    db.query(sqlQuery, newRecord, getHomePosts);

    function getHomePosts(err, result) {
        if (err) return console.error(err.message);
        // Case: all posts successfully selected
        
        // Create newData object to use in EJS view
        newData = {user: req.session.user, 
                       searchtext: req.query.searchtext,
                       posts: result[0],
                       activities: null};

        // Formatting for posts' linked activity data
        for (let i = 0; i < newData.posts.length; i++) {
            // Check post has a linked activity
            if (newData.posts[i].activity_id) formatActivity(newData.posts[i]);
        }

        // Case: user has a connected Strava account
        if (req.session.user.strava_id) {
            // Get all user's activities from database
            sqlQuery = `CALL pr_getactivities(?);`;
            console.log(`Getting user ${req.session.user.id} activities for home page...`);
            db.query(sqlQuery, newRecord, getHomeActivities);
        } else {
            // Case: no connected Strava account
            console.log('Result: All posts found successfully');
            res.render('index.ejs', newData);
        }
    }

    function getHomeActivities(err, result) {
        if (!err) { // Case: all activities found
            console.log('Result: All posts and activities found successfully');
            newData.activities = result[0];
        } else { // Case: error getting activities
            console.error(err.message);
        }
        res.render('index.ejs', newData);
    }
});

// Create validation chain for post form
const postValidation = [body('content').trim().notEmpty().isLength({max: 255})];

router.post('/posted', postValidation, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Handle post text validation errors
        // TO DO: Eventually add error message to give user without reloading page
        return res.redirect('/');
    }
    // If no activity selected, set ID to null for database
    if (req.body.activity == "none") {
        req.body.activity = null;
        console.log(req.body.activity);
    }
    let newRecord = [req.body.userid, req.body.content, req.body.activity];
    let sqlQuery = `CALL pr_makepost(?,?,?);`;
    // Add new post to database
    console.log('----------------------------------------');
    console.log('Saving new post to database...');
    db.query(sqlQuery, newRecord, addPost);

    function addPost(err, result) {
        if (err) {
            console.error(err.message); 
        } else {
            console.log('Result: Post successfully saved');
        }
        res.redirect('/');
    }
});

router.get('/logout', (req, res, next) => {
    console.log('----------------------------------------');
    console.log(`User ${req.session.user.id} logged out`);
    req.session.destroy();
    res.redirect('/login');
});

// Export the router so index.js can access it
module.exports = router;