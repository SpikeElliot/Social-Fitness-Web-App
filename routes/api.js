const express = require('express');
const router = express.Router(); // Create a router object
let db = require('../index.js'); // Get pool connection

router.get('/api/posts', (req, res, next) => {
    console.log('----------------------------------------');

    let sqlQuery;
    if (req.query.search_text) {
        console.log(`Getting post info for API Provision matching text: "${req.query.search_text}"...`);
        let newRecord = [req.query.search_text];
        sqlQuery = `CALL pr_apisearchposts(?)`
        db.query(sqlQuery, newRecord, getPosts);
    } else {
        console.log('Getting post info for API Provision...');
        sqlQuery = `CALL pr_apigetposts()`;
        db.query(sqlQuery, getPosts);
    }

    function getPosts(err, result) {
        if (err) {
            res.json(err);
            console.error(err.message);
        }
        else {
            console.log('Result: Posts successfully retrieved')
            res.json(result);
        }
    }
});

// Export the router so index.js can access it
module.exports = router;