const express = require('express');
const {check, validationResult} = require('express-validator'); // Validation
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

// Create sanitisation and validation chain for search box
let searchValidation = [check('searchtext').escape().trim().notEmpty()];

router.get('/search', searchValidation, redirectLogin, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Handle search validation errors
        // TO DO: Eventually add error message to give user without reloading page
        return res.redirect('/login');
    }
    let newRecord = [req.session.user.id, req.query.searchtext];
    let sqlQuery = `CALL pr_searchedposts(?,?);`; // Search posts procedure
    // Query database to find posts containing search term
    db.query(sqlQuery, newRecord, searchPosts);

    function searchPosts(err, result) {
        if (err) next(err); // Move to next middleware function
        // Create newData object to use in EJS view
        let newData = {user: req.session.user, 
                       searchtext: req.query.searchtext,
                       posts: result[0]};
        // Case: Matching post found
        if (result) return res.render('postlist.ejs', newData);
        // Case: No matching post found
        res.send('No posts found');
    }
});

// Export the router so index.js can access it
module.exports = router;