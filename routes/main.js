const express = require('express');
const {body, validationResult} = require('express-validator'); // Validation
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/', redirectLogin, (req, res, next) => {
    // TO DO: Make feed customised based on user location, preferences, etc.
    let newRecord = [req.session.user.id];
    let sqlQuery = `CALL pr_indexposts(?);`; // Get home posts procedure
    // Query database to find posts containing search term
    console.log('----------------------------------------');
    console.log('Getting all posts...');
    db.query(sqlQuery, newRecord, getHomePosts);

    function getHomePosts(err, result) {
        if (err) return console.error(err.message);
        // Case: all posts successfully selected
        console.log('Result: All posts found successfully');
        // Create newData object to use in EJS view
        let newData = {user: req.session.user, 
                       searchtext: req.query.searchtext,
                       posts: result[0]};
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
    let newRecord = [req.body.userid, req.body.content];
    let sqlQuery = `CALL pr_makepost(?,?)`; // Insert post data procedure
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