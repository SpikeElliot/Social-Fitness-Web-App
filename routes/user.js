const express = require('express');
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.post('/followed', (req, res, next) => {
    let newRecord = [req.session.user.id, req.body.followingID];
    let sqlQuery = `CALL pr_follow(?,?);`;
    // Create new row in follower table with session user and followed foreign keys
    console.log('----------------------------------------');
    console.log('Saving follower relationship to database...');
    db.query(sqlQuery, newRecord, followUser);

    function followUser(err, result) {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Result: Follower relationship saved successfully');
        }
        res.redirect(rootPath);
    }
});

router.post('/unfollowed', (req, res, next) => {
    let newRecord = [req.session.user.id, req.body.followingID];
    let sqlQuery = `CALL pr_unfollow(?,?);`; // Remove follower procedure
    // Delete row in follower table with matching follower and user IDs
    console.log('----------------------------------------');
    console.log('Deleting follower relationship from database...');
    db.query(sqlQuery, newRecord, unfollowUser);

    function unfollowUser(err, result) {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Result: Follower relationship deleted successfully');
        }
        res.redirect(rootPath);
    }
});

// Export the router so index.js can access it
module.exports = router;