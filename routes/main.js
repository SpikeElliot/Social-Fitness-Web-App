// REQUIRED MODULES AND VARIABLES
const express = require('express');
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/', redirectLogin, (req, res, next) => {
    res.render('index.ejs', req.session.user);
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