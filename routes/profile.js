// REQUIRED MODULES AND VARIABLES
const express = require('express');
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/profile/:username', redirectLogin, (req, res, next) => {
    // Query database to get user info
    let sqlQuery = `SELECT username, follower_count, following_count, country, city, date_joined
                    FROM user
                    WHERE username = '${req.params.username}'`;
    // Execute sql query
    db.query(sqlQuery, (err, result) => {
        let newData = {user: req.session.user, profile: result[0]}
        if (err) { // Error handling
            res.redirect('/');
            return console.error(err.message);
        }
        let sqlQuery = `SELECT p.post_id, p.body, p.date_posted
                        FROM post p 
                        INNER JOIN user u 
                        ON p.user_id = u.user_id
                        WHERE u.username = '${req.params.username}'`;
        db.query(sqlQuery, (err, result) => { // Execute sql query
            if (err) next(err); // Move to next middleware function
            // If match found in database
            if (result) {
                // Create newData object to use in EJS view
                newData.posts = result;
                // Query database to find posts liked by session user
                let sqlQuery = `SELECT p.post_id
                                FROM post p 
                                INNER JOIN post_like pl
                                ON p.post_id = pl.post_id 
                                WHERE pl.user_id = '${req.session.user.id}'`;
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
                    res.render('profile.ejs', newData);
                });
            } else {
                res.send('No posts found'); // Send error message when no match found
            }
        });
    });
});

// Export the router so index.js can access it
module.exports = router;