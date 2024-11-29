// REQUIRED MODULES AND VARIABLES
const express = require('express');
const {check, validationResult} = require('express-validator'); // Validation
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

let searchValidation = [check('searchtext').escape().trim().notEmpty()];

router.get('/search', searchValidation, redirectLogin, (req, res, next) => {
    // Check validation of fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Reload the page if search bar is empty
        res.redirect('/login');
        return;
    }
    // Query database to find posts containing search term
    let newRecord = [req.session.user.id, req.query.searchtext];
    let sqlQuery = `CALL pr_searchedposts(?, ?);`;
    db.query(sqlQuery, newRecord, (err, result) => { // Execute sql query
        if (err) next(err); // Move to next middleware function
        // Create newData object to use in EJS view
        let newData = {user: req.session.user, searchtext: req.query.searchtext, posts: result[0]};
        if (result) { // If match found in database
            console.log(newData);
            res.render('postlist.ejs', newData);
            return;
        }
        // Send error message when no match found
        res.send('No posts found');
     });
});

// TO DO: Probably move these to their own '/post' route

router.post('/postliked', (req, res, next) => {
    // Create new row in relationship table between post liked and liker
    let sqlQuery = `INSERT INTO post_like (post_id, user_id)
                    VALUES (${req.body.postID},${req.session.user.id})`;
    db.query(sqlQuery, (err, result) => {
        if (err) return console.error(err.message);
        // Increment liked post's like counter by 1
        let sqlQuery = `UPDATE post
                        SET like_count = like_count + 1
                        WHERE post_id = ${req.body.postID}`;
        db.query(sqlQuery, (err, result) => {
            if (err) return console.error(err.message); 
        });
        res.redirect('/');
    });
});

router.post('/postunliked', (req, res, next) => {
    // Delete row in relationship table between post unliked and liker
    let sqlQuery = `DELETE FROM post_like
                    WHERE post_id = ${req.body.postID} 
                    AND user_id = ${req.session.user.id}`;
    db.query(sqlQuery, (err, result) => {
        if (err) return console.error(err.message);
        // Decrement unliked post's like counter by 1
        let sqlQuery = `UPDATE post
                        SET like_count = like_count - 1
                        WHERE post_id = ${req.body.postID}`;
        db.query(sqlQuery, (err, result) => {
            if (err) return console.error(err.message); 
        });
        res.redirect('/');
    });
});

// Export the router so index.js can access it
module.exports = router;