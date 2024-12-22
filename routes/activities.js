const express = require('express');
const router = express.Router(); // Create a router object

router.get('/activities', redirectLogin, (req, res, next) => {
    let accessToken;

    let newRecord = [req.session.user.id]
    let sqlQuery = `CALL pr_getuserapitoken(?)`;
    db.query(sqlQuery, newRecord, getToken);

    function getToken(err, result) {
        if (err) {
            console.error(err.message);
            return res.redirect('/');
        }

        accessToken = result[0][0].access_token;
        if (accessToken == null) {
            return res.send('No Strava account connected');
        }
        
        getActivites();
    }

    async function getActivites() {
        const url = `https://www.strava.com/api/v3/athlete/activities`;
        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }

        const result = await fetch(url, options)
            .then(response => response.json())
            .then(data => {
                res.json(data);
                // TO DO: Post activity data to database and render page
                // showing all activities
            })
            .catch(err => {
                console.error('Request failed,', err);
            })
    }
})

// Export the router so index.js can access it
module.exports = router;