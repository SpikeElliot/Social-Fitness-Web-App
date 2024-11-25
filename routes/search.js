// REQUIRED MODULES AND VARIABLES
const express = require('express');
const {check, validationResult} = require('express-validator'); // Validation
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

let searchValidation = [check('searchtext').escape().trim().notEmpty()];

router.get('/search', searchValidation, redirectLogin, (req, res, next) => {
    // Check validation of fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Reload the page if searchbar is empty
        res.redirect('/login');
        return;
    }
    // Query database to find posts containing search term
    let sqlquery = `SELECT p.post_id, p.user_id, p.body, p.date_posted, p.like_count, u.username
                    FROM post p 
                    LEFT JOIN user u 
                    ON p.user_id = u.user_id 
                    WHERE p.body LIKE '%${req.query.searchtext}%'`;
    db.query(sqlquery, (err, result) => { // Execute sql query
        if (err) next(err); // Move to next middleware function
        if (result) {
            newData = {searchtext: req.query.searchtext, posts: result}
            res.render('postlist.ejs', newData);
        } else { // Send error message when no match found
            res.send('No posts found');
            return;
        }
     });
});

// Export the router so index.js can access it
module.exports = router;