const express = require('express');
const {check, validationResult} = require('express-validator'); // Validation
const router = express.Router(); // Create a router object
let db = require('../index.js'); // Get pool connection

// ROUTE HANDLERS

// Create sanitisation and validation chain for search box
let searchValidation = [check('searchtext').escape().trim().notEmpty()];

router.get('/search/posts', searchValidation, redirectLogin, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Handle search validation errors
        // TO DO: Eventually add error message to give user without reloading page
        return res.redirect(`${rootPath}/login`);
    }
    let newRecord = [req.session.user.id, req.query.searchtext];
    let sqlQuery = `CALL pr_searchedposts(?,?);`; // Search posts procedure
    // Query database to find posts containing search term
    console.log('----------------------------------------');
    console.log(`Searching for posts containing: "${req.query.searchtext}"...`);
    db.query(sqlQuery, newRecord, searchPosts);

    function searchPosts(err, result) {
        if (err) {
            console.error(err.message);
            return res.redirect(rootPath);
        };
        // Create newData object to use in EJS view
        console.log('Result: All matching posts found successfully');
        let newData = {user: req.session.user, 
                       searchtext: req.query.searchtext,
                       posts: result[0]};
        return res.render('searchedposts.ejs', newData);
    }
});

// Export the router so index.js can access it
module.exports = router;