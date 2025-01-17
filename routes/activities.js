const express = require('express');
const router = express.Router(); // Create a router object
let db = require('../index.js'); // Get pool connection

router.post('/getactivities', redirectLogin, (req, res, next) => {
    let accessToken;
    let activityData = [];
    let newRecord = [req.session.user.id];
    let sqlQuery = `CALL pr_getuserapitoken(?);`;

    console.log('----------------------------------------');
    console.log('Getting current API access token...');
    db.query(sqlQuery, newRecord, getToken);

    function getToken(err, result) {
        if (err) {
            console.error(err.message);
            return res.redirect(rootPath);
        }

        accessToken = result[0][0].access_token;
        // Case: no access token stored in database
        if (accessToken == null) {
            return res.redirect(`${rootPath}/profile/${req.session.user.username}`);
        }

        const expiration = result[0][0].token_expiration;
        const now = Date.now() / 1000; // Convert from milliseconds to seconds

        // Case: access token has expired
        if (expiration < now) {
            const refreshToken = result[0][0].refresh_token;
            return getNewToken(refreshToken);
        }

        // Case: access token still valid
        getActivities();
    }

    async function getNewToken(rToken) {
        console.log('Requesting new API access token...');

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
                console.log('Updating token...');
                db.query(sqlQuery, newRecord, updateToken);
            })
            .catch(err => {
                console.error('Request failed,', err);
                return res.redirect(rootPath);
            })
    }
    
    function updateToken(err, result) {
        if (err) {
            console.error(err.message);
            return res.redirect(rootPath);
        }
        // Case: no errors, proceed to fetch activity data
        getActivities();
    }

    async function getActivities() {
        console.log('Requesting API activity data...');

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
                // Case: no activities
                if (data.length == 0) {
                    return res.send('No activites found. Post some activities on Strava to see them here!');
                }

                // Get all relevant activity data to insert into database
                for (activity of data) {
                    let dataToInsert = [activity.name, activity.id, activity.start_date,
                                        activity.elapsed_time, activity.kilojoules,
                                        activity.distance, activity.average_speed,
                                        activity.average_watts, activity.max_speed,
                                        activity.max_watts];

                    // Data formatting for entry in database

                    // Format datetime for MySQL
                    dataToInsert[2] = dataToInsert[2].replace("T", " ");
                    dataToInsert[2] = dataToInsert[2].replace("Z", "");

                    // Convert undefined values into null to be inserted in db
                    let convertToNull = (values) => {
                        // Starts at activity.kilojoules as name, id, start_date
                        // and elapsed_time will never be undefined
                        for (let i = 4; i < values.length; i++) {
                            if (values[i] === undefined) values[i] = null;
                        }
                    };
                    
                    convertToNull(dataToInsert);
                    // Enter values into activityData record
                    for (d of dataToInsert) { activityData.push(d) };
                }

                // Get the most recent activity from database
                newRecord = [req.session.user.id];
                sqlQuery = `CALL pr_getlastactivity(?);`;
                console.log('Getting most recent saved activity...');
                db.query(sqlQuery, newRecord, getLastActivity);
            })
            .catch(err => {
                console.error('Request failed,', err);
                return res.redirect(rootPath);
            })
    }

    function getLastActivity(err, result) {
        if (err) {
            res.redirect(rootPath);
            return console.error(err.message);
        }

        let activityCutoff = false;
        // Case: most recent activity found
        if (result[0].length != 0) {
            activityCutoff = new Date(result[0][0].start_date);
        }

        let newActivities = true;

        sqlQuery = `INSERT INTO activity (user_id, name, strava_id, start_date,
                                          elapsed_time, calories, distance,
                                          average_speed, average_watts,
                                          max_speed, max_watts) VALUES `;
        for (let i = 0; i < activityData.length; i += 10) {
            // Check if activity is new and hasn't already been added to database
            if (activityCutoff != false) {
                if (new Date(activityData[i+2]) <= activityCutoff) {
                    if (i == 0) newActivities = false;
                    break;
                }
            }
            
            // Necessary formatting for SQL query
            if (i != 0) {
                sqlQuery += ', ';
            }
            sqlQuery += `("${req.session.user.id}"`;

            // Add values to insert into row
            for (let j = i; j < i + 10; j++) {
                if (activityData[j] != null) {
                    sqlQuery += `,"${activityData[j]}"`
                } else {
                    // If value is null, add without quotes
                    sqlQuery += `,${activityData[j]}`
                };
            }
            sqlQuery += ')';
        }
        sqlQuery += ';';

        if (newActivities) {
            // Case: new activities, insert into database
            console.log('Saving new activities to database...')
            db.query(sqlQuery, insertActivities);
        } else {
            // Case: no new activities, send user to activities page
            console.log('Result: No new activities to save');
            res.redirect(`${rootPath}/activities`);
        }
    }

    function insertActivities(err, result) {
        if (err) {
            console.error(err.message);
            return res.redirect(rootPath);
        }

        // TO DO: Create activities page that displays all saved in database
        console.log('Result: New activities saved');
        res.redirect(`${rootPath}/activities`);
    }
});

router.get('/activities', redirectLogin, (req, res, next) => {
    let newRecord = [req.session.user.id];
    let sqlQuery = `CALL pr_getactivities(?);`;
    console.log('----------------------------------------');
    console.log(`Getting user ${req.session.user.id} activities...`);
    db.query(sqlQuery, newRecord, getUserActivities);
    
    function getUserActivities(err, result) {
        if (err) {
            console.error(err.message);
            return res.redirect(rootPath);
        }
        // Case: user activities found successfully
        console.log('Result: Activities found successfully');
        let newData = {};
        newData.user = req.session.user;
        newData.activities = result[0];
        for (let i = 0; i < newData.activities.length; i++) {
            formatActivity(newData.activities[i]);
        }
        res.render('activities.ejs', newData);
    }
});

// Export the router so index.js can access it
module.exports = router;