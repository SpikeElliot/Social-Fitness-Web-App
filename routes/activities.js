const express = require('express');
const router = express.Router(); // Create a router object

router.get('/activities', redirectLogin, (req, res, next) => {
    let accessToken;
    let newRecord = [req.session.user.id]
    let sqlQuery = `CALL pr_getuserapitoken(?);`;
    db.query(sqlQuery, newRecord, getToken);

    function getToken(err, result) {
        if (err) {
            console.error(err.message);
            return res.redirect('/');
        }

        accessToken = result[0][0].access_token;
        // Case: no access token stored in database
        if (accessToken == null) {
            return res.send('No Strava account connected');
        }

        const expiration = result[0][0].token_expiration;
        const now = Date.now();

        // Case: access token has expired
        if (expiration < now) {
            const refreshToken = result[0][0].refresh_token;
            return getNewToken(refreshToken);
        }

        // Case: access token still valid
        getActivites();
    }

    async function getNewToken(rToken) {
        const url = `https://www.strava.com/api/v3/oauth/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token&refresh_token=${rToken}`;
        const options = {
            method: 'POST'
        }
        
        const result = await fetch(url, options)
            .then(response => response.json())
            .then(data => {
                // Set access token variable to updated token
                const newToken = data.access_token;
                accessToken = newToken;
                const newExpiration = data.expires_at;

                // Update user row with new token data
                newRecord = [req.session.user.id, newToken, newExpiration];
                sqlQuery = `CALL pr_updateuserapitoken(?,?,?);`;
                db.query(sqlQuery, newRecord, updateToken);
            })
    }
    
    function updateToken(err, result) {
        if (err) {
            console.error(err.message);
            return res.redirect('/');
        }
        // Case: no errors, proceed to fetch activity data
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