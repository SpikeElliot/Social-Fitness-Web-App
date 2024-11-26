// REQUIRED MODULES AND VARIABLES
const express = require('express');
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/', redirectLogin, (req, res, next) => {
    let sqlQuery = `SELECT p.*, u.username
                    FROM post p 
                    LEFT JOIN user u 
                    ON p.user_id = u.user_id`;
    db.query(sqlQuery, (err, result) => { // Execute sql query
        if (err) next(err); // Move to next middleware function
        // If match found in database
        if (result) {
            // Create newData object to use in EJS view
            let newData = {user: req.session.user, posts: result};
            // Query database to find posts liked by session user
            let sqlQuery = `SELECT p.post_id
                            FROM post p 
                            INNER JOIN post_like pl
                            ON p.post_id = pl.post_id 
                            WHERE pl.user_id = ${req.session.user.id}`;
            db.query(sqlQuery, (err, result) => {
                if (err) next(err); // Move to next middleware function
                let likedposts = {}; // Create liked posts dictionary
                if (result) { // If any liked posts are found
                    // Insert post IDs as keys into dictionary for fast access
                    for (let i = 0; i < result.length; i++) {
                        likedposts[result[i].post_id] = "exists";
                    }
                    // Enter dictionary into newData object
                    newData.likedposts = likedposts;
                }
                res.render('index.ejs', newData);
            });
        } else {
            // TO DO: MAKE THIS WORK WHEN NO POSTS
            res.render('index.ejs', req.session.user); // When no posts found
        }
    });;
});

router.post('/posted', (req, res, next) => {
    // Insert new post into database
    let newRecord = [req.body.userid, req.body.content];
    let sqlQuery = `INSERT INTO post (user_id, body)
                    VALUES (?,?)`;
    db.query(sqlQuery, newRecord, (err, result) => {
        if (err) return console.error(err.message);
        res.redirect('/');
    });
});

// Export the router so index.js can access it
module.exports = router;