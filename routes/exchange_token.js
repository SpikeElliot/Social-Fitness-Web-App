const express = require('express');
const router = express.Router(); // Create a router object

router.get('/exchange_token', redirectLogin, (req, res, next) => {
    async function exchangeToken() {
        console.log('----------------------------------------');
        console.log('Exchanging authorisation token for access and refresh tokens...');
        const authorizationCode = req.query.code;

        const url = `https://www.strava.com/oauth/token?client_id=${clientId}&client_secret=${clientSecret}&code=${authorizationCode}&grant_type=authorization_code`;
        const options = {
            method: 'POST'
        }

        const result = await fetch(url, options)
            .then(response => response.json())
            .then(data => {
                const accessToken = data.access_token;
                const refreshToken = data.refresh_token;
                const userCountry = data.athlete.country;
                const userCity = data.athlete.city;
                const stravaId = data.athlete.id;
                const tokenExpiration = data.expires_at;

                let newRecord = [req.session.user.id, accessToken, 
                                 refreshToken, userCountry,
                                 userCity, stravaId, tokenExpiration];
                let sqlQuery = `CALL pr_setuserstravadata(?,?,?,?,?,?,?)`;
                console.log('Saving connected Strava user data to database...');
                db.query(sqlQuery, newRecord, saveUserStravaData);
            })
            .catch(err => {
                console.error('Request failed,', err);
            })
    }

    function saveUserStravaData(err, result) {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Result: Strava user data saved to database');
        }
        res.redirect(`${rootPath}/getactivities`);
    }

    exchangeToken();
});

// Export the router so index.js can access it
module.exports = router;