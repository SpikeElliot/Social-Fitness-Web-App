const express = require('express');
const router = express.Router(); // Create a router object

router.get('/exchange_token', redirectLogin, (req, res, next) => {
    async function exchangeToken() {
        const authorizationCode = req.query.code;
        console.log(authorizationCode);

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

                db.query(sqlQuery, newRecord, postUserStravaData);
            })
            .catch(err => {
                console.error('Request failed,', err);
            })
    }

    function postUserStravaData(err, result) {
        if (err) console.error(err.message);
        return res.redirect('/');
    }

    exchangeToken();
})

// Export the router so index.js can access it
module.exports = router;