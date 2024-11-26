// REQUIRED MODULES AND VARIABLES
const express = require('express');
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/', redirectLogin, (req, res, next) => {
    let sqlquery = `SELECT p.*, u.username
                    FROM post p 
                    LEFT JOIN user u 
                    ON p.user_id = u.user_id`;
    db.query(sqlquery, (err, result) => { // Execute sql query
        if (err) next(err); // Move to next middleware function
                
        if (result) {
            let newData = {user: req.session.user, posts: result};
            let sqlquery = `SELECT p.post_id
                            FROM post p 
                            INNER JOIN post_like pl
                            ON p.post_id = pl.post_id 
                            WHERE pl.user_id = ${req.session.user.id}`;
            db.query(sqlquery, (err, result) => {
            if (err) next(err); // Move to next middleware function
            let likedposts = {};
            if (result) {
                for (let i = 0; i < result.length; i++) {
                    likedposts[result[i].post_id] = "exists";
                }
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
    let newrecord = [req.body.userid, req.body.content];
    let sqlquery = `INSERT INTO post (user_id, body)
                    VALUES (?,?)`;
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) return console.error(err.message);
        res.redirect('/');
    });
});

// Export the router so index.js can access it
module.exports = router;