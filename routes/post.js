const express = require('express');
const {body, validationResult} = require('express-validator'); // Validation
const router = express.Router(); // Create a router object

// ROUTE HANDLERS

router.get('/post/:id', redirectLogin, (req, res, next) => {
    let newData = {}; // Create newData object for post data to use in EJS
    newData.error = false; // Initialise error (when no result found) as false
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
            newData.error = true;
            return res.render('post.ejs', newData);
        }
        // Case: Matching post ID found
        newData.user = req.session.user; // Update newData object with post data
        newData.post = result[0][0];
        newRecord = [newData.post.post_id, newData.user.id];
        sqlQuery = `CALL pr_postcomments(?,?);`; // Get all post comments procedure
        // Query database for comments matching post's post_id
        db.query(sqlQuery, newRecord, getComments);  
    }

    function getComments(err, result) {
        if (err) { // Handle MySQL Errors
            console.error(err.message);
            return res.redirect('/');
        }
        // Update newData object with comments, render post page
        newData.comments = result[0];
        console.log(newData.comments);
        res.render('post.ejs', newData);
    }
});

// Create validation chain for comment field
const commentValidation = [body('content').trim().notEmpty().isLength({max:255})];

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
});

router.post('/postliked', (req, res, next) => {
    let newRecord = [req.body.postID, req.session.user.id];
    let sqlQuery = `CALL pr_makepostlike(?,?);`; // Insert user IDs into post_like procedure
    // Create new row in relationship table between post liked and liker
    db.query(sqlQuery, newRecord, newPostLike);

    function newPostLike(err, result) {
        if (err) { // Handle MySQL Errors
            res.redirect('/');
            return console.error(err.message); 
        }
        let newRecord = [req.body.postID];
        let sqlQuery = `CALL pr_incrementpostlikes(?);`; // Update post like_count procedure
        // Increment liked post's like counter by 1
        db.query(sqlQuery, newRecord, incrementPostLikeCount);
    }

    function incrementPostLikeCount(err, result) {
        if (err) console.error(err.message);
        // TO DO: Eventually make it so page doesn't reload after liking
        res.redirect('/');
    }
});

router.post('/postunliked', (req, res, next) => {
    let newRecord = [req.body.postID, req.session.user.id];
    let sqlQuery = `CALL pr_deletepostlike(?,?);`; // Delete post_like row procedure
    // Delete row in relationship table between post unliked and liker
    db.query(sqlQuery, newRecord, deletePostLike);

    function deletePostLike(err, result) {
        if (err) { // Handle MySQL Errors
            res.redirect('/');
            return console.error(err.message); 
        }
        let newRecord = [req.body.postID];
        let sqlQuery = `CALL pr_decrementpostlikes(?);`; // Update post like_count procedure
        // Decrement unliked post's like counter by 1
        db.query(sqlQuery, newRecord, decrementPostLikeCount)
    }

    function decrementPostLikeCount(err, result) {
        if (err) console.error(err.message);
        // TO DO: Eventually make it so page doesn't reload after liking
        res.redirect('/');
    }
});

router.post('/commentliked', (req, res, next) => {
    let newRecord = [req.body.commentID, req.session.user.id];
    let sqlQuery = `CALL pr_makecommentlike(?,?);`; // Insert IDs into comment_like procedure
    // Create new row in relationship table between comment liked and liker
    db.query(sqlQuery, newRecord, newCommentLike);

    function newCommentLike(err, result) {
        if (err) { // Handle MySQL Errors
            res.redirect('/');
            return console.error(err.message); 
        }
        let newRecord = [req.body.commentID];
        let sqlQuery = `CALL pr_incrementcommentlikes(?);`; // Update comment like_count procedure
        // Increment liked comment's like counter by 1
        db.query(sqlQuery, newRecord, incrementCommentLikeCount);
    }

    function incrementCommentLikeCount(err, result) {
        if (err) console.error(err.message);
        // TO DO: Eventually make it so page doesn't reload after liking
        res.redirect('/');
    }
});

router.post('/commentunliked', (req, res, next) => {
    let newRecord = [req.body.commentID, req.session.user.id];
    let sqlQuery = `CALL pr_deletecommentlike(?,?);`; // Delete comment_like row procedure
    // Delete row in relationship table between comment unliked and liker
    db.query(sqlQuery, newRecord, deleteCommentLike);

    function deleteCommentLike(err, result) {
        if (err) { // Handle MySQL Errors
            res.redirect('/');
            return console.error(err.message); 
        }
        let newRecord = [req.body.commentID];
        let sqlQuery = `CALL pr_decrementcommentlikes(?);`; // Update comment like_count procedure
        // Decrement unliked comment's like counter by 1
        db.query(sqlQuery, newRecord, decrementCommentLikeCount)
    }

    function decrementCommentLikeCount(err, result) {
        if (err) console.error(err.message);
        // TO DO: Eventually make it so page doesn't reload after liking
        res.redirect('/');
    }
});

router.post('/commentdeleted', (req, res, next) => {
    let newRecord = [req.body.commentID, req.body.userID];
    let sqlQuery = `CALL pr_deletecomment(?,?)`; // Delete comment procedure
    // Delete comment row in database matching comment_id
    db.query(sqlQuery, newRecord, deleteComment);

    function deleteComment(err, result) {
        if (err) console.error(err.message);
        res.redirect('/');
    }
});

router.post('/postdeleted', (req, res, next) => {
    let newRecord = [req.body.postID, req.body.userID];
    let sqlQuery = `CALL pr_deletepost(?,?)`; // Delete post procedure
    // Delete post row in database matching post_id
    db.query(sqlQuery, newRecord, deletePost);

    function deletePost(err, result) {
        if (err) console.error(err.message);
        res.redirect('/');
    }
});

// Export the router so index.js can access it
module.exports = router;