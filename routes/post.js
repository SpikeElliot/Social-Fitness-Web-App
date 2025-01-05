const express = require('express');
const {body, validationResult} = require('express-validator'); // Validation
const router = express.Router(); // Create a router object
let db = require('../index.js'); // Get pool connection

// ROUTE HANDLERS

router.get('/post/:id', redirectLogin, (req, res, next) => {
    let newData = {}; // Create newData object for post data to use in EJS
    newData.error = false; // Initialise error (when no result found) as false
    let newRecord = [req.params.id, req.session.user.id];
    let sqlQuery = `CALL pr_postinfo(?,?);`;
    // Get necessary post data for post matching ID parameter
    console.log('----------------------------------------');
    console.log(`Getting post (ID: ${req.params.id})...`);
    db.query(sqlQuery, newRecord, getPost);
    
    function getPost(err, result) {
        if (err) { // Handle MySQL Errors
            console.error(err.message);
            return res.redirect(rootPath);
        }
        // Case: No matching post ID found
        if (result[0].length == 0) {
            console.log('Result: No matching post found');
            newData.error = true;
            return res.render('post.ejs', newData);
        }
        // Case: Matching post ID found
        newData.user = req.session.user; 
        newData.post = result[0][0];

        // Check post has a linked activity
        if (newData.post.activity_id) formatActivity(newData.post);

        newRecord = [newData.post.post_id, newData.user.id];
        sqlQuery = `CALL pr_postcomments(?,?);`;
        // Query database for comments matching post's post_id
        console.log('Getting all comments on post...');
        db.query(sqlQuery, newRecord, getComments);  
    }

    function getComments(err, result) {
        if (err) {
            console.error(err.message);
            return res.redirect(rootPath);
        }
        console.log('Result: All comments found');
        // Update newData object with comments, render post page
        newData.comments = result[0];
        res.render('post.ejs', newData);
    }
});

// Create validation chain for comment field
const commentValidation = [body('content').trim().notEmpty().isLength({max:255})];

router.post('/commented', commentValidation, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Handle comment text validation errors
        // TO DO: Eventually add error message to give user without redirecting
        return res.redirect(rootPath);
    }
    let newRecord = [req.body.user_id, req.body.post_id, req.body.content];
    let sqlQuery = `CALL pr_makecomment(?,?,?);`;
    // Add new comment linked to post and user in database
    console.log('----------------------------------------');
    console.log('Saving comment to database...');
    db.query(sqlQuery, newRecord, addComment);

    function addComment(err, result) {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Result: Comment successfully saved');
        } // Handle MySQL Errors
        res.redirect(`${rootPath}/post/${req.body.post_id}`);
    }
});

router.post('/postliked', (req, res, next) => {
    let newRecord = [req.body.postID, req.session.user.id];
    let sqlQuery = `CALL pr_makepostlike(?,?);`;
    // Create new row in relationship table between post liked and liker
    console.log('----------------------------------------');
    console.log('Saving post like to database...');
    db.query(sqlQuery, newRecord, newPostLike);

    function newPostLike(err, result) {
        if (err) {
            console.error(err.message); 
        } else {
            console.log('Result: Post like saved successfully');
        }
        res.redirect(`${rootPath}/post/${req.body.postID}`);
    }
});

router.post('/postunliked', (req, res, next) => {
    let newRecord = [req.body.postID, req.session.user.id];
    let sqlQuery = `CALL pr_deletepostlike(?,?);`;
    // Delete row in relationship table between post unliked and liker
    console.log('----------------------------------------');
    console.log('Deleting post like from database...');
    db.query(sqlQuery, newRecord, deletePostLike);

    function deletePostLike(err, result) {
        if (err) {
            console.error(err.message); 
        } else {
            console.log('Result: Post like deleted successfully');
        }
        res.redirect(`${rootPath}/post/${req.body.postID}`);
    }
});

router.post('/commentliked', (req, res, next) => {
    let newRecord = [req.body.commentID, req.session.user.id];
    let sqlQuery = `CALL pr_makecommentlike(?,?);`;
    // Create new row in relationship table between comment liked and liker
    console.log('----------------------------------------');
    console.log('Saving comment like to database...');
    db.query(sqlQuery, newRecord, newCommentLike);

    function newCommentLike(err, result) {
        if (err) {
            console.error(err.message); 
        } else {
            console.log('Result: Comment like saved successfully');
        }
        res.redirect(rootPath);
    }
});

router.post('/commentunliked', (req, res, next) => {
    let newRecord = [req.body.commentID, req.session.user.id];
    let sqlQuery = `CALL pr_deletecommentlike(?,?);`; // Delete comment_like row procedure
    // Delete row in relationship table between comment unliked and liker
    console.log('----------------------------------------');
    console.log('Deleting comment like from database...');
    db.query(sqlQuery, newRecord, deleteCommentLike);

    function deleteCommentLike(err, result) {
        if (err) {
            console.error(err.message); 
        } else {
            console.log('Result: comment like deleted successfully');
        }
        res.redirect(rootPath);
    }
});

router.post('/commentdeleted', (req, res, next) => {
    let newRecord = [req.body.commentID, req.body.userID];
    let sqlQuery = `CALL pr_deletecomment(?,?)`; // Delete comment procedure
    // Delete comment row in database matching comment_id
    console.log('----------------------------------------');
    console.log('Deleting comment from database...');
    db.query(sqlQuery, newRecord, deleteComment);

    function deleteComment(err, result) {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Result: Comment deleted successfully');
        }
        res.redirect(rootPath);
    }
});

router.post('/postdeleted', (req, res, next) => {
    let newRecord = [req.body.postID, req.session.user.id];
    let sqlQuery = `CALL pr_deletepost(?,?)`; // Delete post procedure
    // Delete post row in database matching post_id
    console.log('----------------------------------------');
    console.log('Deleting post from database...');
    db.query(sqlQuery, newRecord, deletePost);

    function deletePost(err, result) {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Result: Post deleted successfully');
        }
        res.redirect(rootPath);
    }
});

// Export the router so index.js can access it
module.exports = router;