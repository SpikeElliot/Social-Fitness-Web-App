const express = require('express');
const {body, validationResult} = require('express-validator'); // Validation
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/post/:id', redirectLogin, (req, res, next) => {
    let newData = {}; // Create newData object for post data to use in EJS
    newData.errMsg = null; // Initialise error message as null
    let newRecord = [req.params.id, req.session.user.id];
    let sqlQuery = `CALL pr_postinfo(?,?);`; // Get post data procedure
    // Get necessary post data for post matching ID parameter
    db.query(sqlQuery, newRecord, getPost);
    
    function getPost(err, result) {
        if (err) { // Handle MySQL Errors
            console.error(err.message);
            return res.redirect('/');
        }
        // Case: No matching post ID found
        if (result[0].length == 0) {
            newData.errMsg = "This post has been deleted or never existed!";
            return res.render('post.ejs', newData);
        }
        // Case: Matching post ID found
        newData.user = req.session.user; // Update newData object with post data
        newData.post = result[0][0];
        res.render('post.ejs', newData);
    }
});

// Create sanitisation and validation chain for comment field
const commentValidation = [body('content').escape().trim().notEmpty()];

router.post('/commented', commentValidation, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Handle comment text validation errors
        // TO DO: Eventually add error message to give user without redirecting
        return res.redirect('/');
    }
    let newRecord = [req.body.user_id, req.body.post_id, req.body.content];
    let sqlQuery = `CALL pr_makecomment(?,?,?);`; // Insert comment data procedure
    // Add new comment linked to post and user in database
    db.query(sqlQuery, newRecord, addComment);

    function addComment(err, result) {
        if (err) return console.error(err.message); // Handle MySQL Errors
        res.redirect(`post/${req.body.post_id}`);
    }
})

// Export the router so index.js can access it
module.exports = router;