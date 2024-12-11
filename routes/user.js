const express = require('express');
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.post('/followed', (req, res, next) => {
    let newRecord = [req.session.user.id, req.body.followingID];
    let sqlQuery = `CALL pr_follow(?,?);`; // Create follower procedure
    // Create new row in follower table with session user and followed foreign keys
    db.query(sqlQuery, newRecord, followUser);

    function followUser(err, result) {
        if (err) console.error(err.message); // MySQL Error handling
        res.redirect('/');
    }
});

router.post('/unfollowed', (req, res, next) => {
    let newRecord = [req.session.user.id, req.body.followingID];
    let sqlQuery = `CALL pr_unfollow(?,?);`; // Remove follower procedure
    // Delete row in follower table with matching follower and user IDs
    db.query(sqlQuery, newRecord, unfollowUser);

    function unfollowUser(err, result) {
        if (err) console.error(err.message); // MySQL Error handling
        res.redirect('/');
    }
});

// Export the router so index.js can access it
module.exports = router;