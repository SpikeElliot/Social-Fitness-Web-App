// REQUIRED MODULES AND VARIABLES
const express = require('express');
const {body, validationResult} = require('express-validator'); // Validation
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/', redirectLogin, (req, res, next) => {
    // Query database to find posts containing search term
    let newRecord = [req.session.user.id];
    let sqlQuery = `CALL pr_indexposts(?);`;
    db.query(sqlQuery, newRecord, (err, result) => { // Execute sql query
        if (err) next(err); // Move to next middleware function
        // Create newData object to use in EJS view
        let newData = {user: req.session.user, searchtext: req.query.searchtext, posts: result[0]};
        res.render('index.ejs', newData);
     });
});

let postValidation = [body('content').escape().trim().notEmpty()];

router.post('/posted', postValidation, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Reload the page if search bar is empty
        res.redirect('/');
        return
    }
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