const https = require('https');

// Using current .env.local values
const API_KEY = 'cae5fd50147bb2b2094c561ff214dfcf';
const API_HOST = 'v3.football.api-sports.io';
const LEAGUE_ID = 307;
const SEASON = 2025;

// Get upcoming fixtures for Saudi Pro League
const today = new Date();
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 14);

const fromDate = today.toISOString().split('T')[0];
const toDate = nextWeek.toISOString().split('T')[0];

const path = `/fixtures?league=${LEAGUE_ID}&season=${SEASON}&from=${fromDate}&to=${toDate}`;

console.log('=== API-Football Test ===');
console.log(`Host: ${API_HOST}`);
console.log(`League ID: ${LEAGUE_ID}`);
console.log(`Season: ${SEASON}`);
console.log(`Date Range: ${fromDate} to ${toDate}`);
console.log(`Full Path: ${path}`);
console.log('');

const options = {
    method: 'GET',
    hostname: API_HOST,
    path: path,
    headers: {
        'x-apisports-key': API_KEY
    }
};

const req = https.request(options, function (res) {
    const chunks = [];

    res.on('data', function (chunk) {
        chunks.push(chunk);
    });

    res.on('end', function () {
        const body = Buffer.concat(chunks);
        const data = JSON.parse(body.toString());

        console.log('=== Response Info ===');
        console.log('Status Code:', res.statusCode);
        console.log('');

        if (data.errors && Object.keys(data.errors).length > 0) {
            console.log('API Errors:', JSON.stringify(data.errors, null, 2));
            return;
        }

        console.log('=== Account Info ===');
        console.log('Plan:', data.paging);
        console.log('Results:', data.results);
        console.log('');

        if (data.response && data.response.length > 0) {
            console.log(`=== Found ${data.response.length} Fixtures ===\n`);
            data.response.slice(0, 5).forEach((match, i) => {
                console.log(`${i + 1}. ${match.teams.home.name} vs ${match.teams.away.name}`);
                console.log(`   Date: ${match.fixture.date}`);
                console.log(`   League: ${match.league.name}`);
                console.log(`   Season: ${match.league.season}`);
                console.log(`   Status: ${match.fixture.status.long}`);
                console.log('');
            });
        } else {
            console.log('No fixtures found for the specified date range.');
            console.log('');
            console.log('Possible reasons:');
            console.log('1. No matches scheduled in this period');
            console.log('2. Wrong season - try 2024 instead of 2025');
            console.log('3. API subscription limitations');
            console.log('');
            console.log('Full response:', JSON.stringify(data, null, 2).substring(0, 1000));
        }
    });
});

req.on('error', function (e) {
    console.error('Request Error:', e.message);
});

req.end();
