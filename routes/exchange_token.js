const express = require('express');
const router = express.Router(); // Create a router object

// TO DO: Post connected user's athlete info to database

router.get('/exchange_token', (req, res, next) => {
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
                res.json(data);
            })
            .catch(err => {
                console.error('Request failed,', err);
            })
    }

    exchangeToken();
})

// Export the router so index.js can access it
module.exports = router;