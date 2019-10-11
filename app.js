const express = require('express');
const admin = require("firebase-admin");

const app = express();

// TODO: Enter the path to your service account json file
// Need help with this step go here: https://firebase.google.com/docs/admin/setup

const serviceAccount = require("./dugan-760bc-firebase-adminsdk-bguij-42efe32ea8.json");
// TODO: Enter your database url from firebase

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dugan-760bc.firebaseio.com"
});

app.set('port', (process.env.PORT || 3001));

// get user 
app.get('/:user', function(req, res) {
    return res.send("username is set to " + req.params.user);
});

// delete user data
app.get('/delete/:user', function(req, res) {
    const db = admin.database();
    const ref = db.ref();
    const dataRef = ref.child(req.params.user);
    dataRef.remove();
    return res.send('Madden Data Cleared for ' + req.params.user);
});

app.post('/:username/:platform/:leagueId/leagueteams', (req, res) => {
    const db = admin.database();
    const ref = db.ref();
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        const dataRef = ref.child(`${username}/data/leagueteams`);
        const { leagueTeamInfoList: teams } = JSON.parse(body);
        dataRef.update(teams);

        res.sendStatus(202);
    });
});

app.post('/:username/:platform/:leagueId/standings', (req, res) => {
    const db = admin.database();
    const ref = db.ref();
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const { teamStandingInfoList: teams } = JSON.parse(body);
        const dataRef = ref.child(`${username}/data/standings`);
        dataRef.update(teams);
        
        res.sendStatus(202);
    });
});


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

app.post('/:username/:platform/:leagueId/week/:weekType/:weekNumber/:dataType', (req, res) => {
    const db = admin.database();
    const ref = db.ref();
    const {
        params: { username, leagueId, weekType, weekNumber, dataType },
    } = req;
    // const basePath = `data/${username}/${leagueId}/`;
    // "defense", "kicking", "passing", "punting", "receiving", "rushing"
    //const statsPath = `${basePath}stats`;
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        switch (dataType) {
            case 'schedules': {
                const weekRef = ref.child(`${username}/data/week/${weekType}/${weekNumber}/schedules`);
                const { gameScheduleInfoList: schedules } = JSON.parse(body);
                weekRef.update(schedules);
                break;
            }
            case 'teamstats': {
                const weekRef = ref.child(`${username}/data/week/${weekType}/${weekNumber}/teamstats`);
                const { teamStatInfoList: teamStats } = JSON.parse(body);
                weekRef.update(teamStats);
                break;
            }
            case 'defense': {
                const weekRef = ref.child(`${username}/data/week/${weekType}/${weekNumber}/defense`);
                const { playerDefensiveStatInfoList: defensiveStats } = JSON.parse(body);
                weekRef.update(defensiveStats);
                break;
            }
            default: {
                const property = `player${capitalizeFirstLetter(dataType)}StatInfoList`;
                const weekRef = ref.child(`${username}/data/week/${weekType}/${weekNumber}/${dataType}/${property}`);
                const stats = JSON.parse(body)[property];
                weekRef.update(stats);
                break;
            }
        }
        res.sendStatus(202);
    });
});

// Free Agents
app.post('/:username/:platform/:leagueId/freeagents/roster', (req, res) => {
    const db = admin.database();
    const ref = db.ref();
    const { params: { username, leagueId, teamId } } = req;
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        const dataRef = ref.child(`${username}/data/freeagents/rosterInfoList`);
        const { rosterInfoList: players } = JSON.parse(body);
        dataRef.update(players);
    });
    res.sendStatus(202);
});

// Team Rosters
app.post('/:username/:platform/:leagueId/team/:teamId/roster', (req, res) => {
    const db = admin.database();
    const ref = db.ref();
    const { params: { username, leagueId, teamId } } = req;
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        const dataRef = ref.child(`${username}/data/team/${teamId}/rosterInfoList`);
        const { rosterInfoList: players } = JSON.parse(body);
        dataRef.update(players);
    });
    res.sendStatus(202);
});

app.listen(app.get('port'), () =>
    console.log('Madden Data is running on port', app.get('port'))
);
