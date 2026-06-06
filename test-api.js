const https = require('https');

// Try to get today's fixtures to see what data structure we get
const options = {
    method: 'GET',
    hostname: 'api-football-v1.p003.com',
    path: '/v3/fixtures?date=2026-01-02',  // Today's date
    headers: {
        'x-rapidapi-key': 'e582ab92f4740ba22f4659d138fcca74',
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
    }
};

console.log('Fetching today\'s fixtures to find Saudi league...\n');

const req = https.request(options, function (res) {
    const chunks = [];

    res.on('data', function (chunk) {
        chunks.push(chunk);
    });

    res.on('end', function () {
        const body = Buffer.concat(chunks);
        const data = JSON.parse(body.toString());

        console.log('API Response Status:', res.statusCode);
        console.log('Remaining Requests:', res.headers['x-ratelimit-requests-remaining']);
        console.log('\n');

        if (data.errors && Object.keys(data.errors).length > 0) {
            console.log('API Errors:', data.errors);
        }

        if (data.response && data.response.length > 0) {
            // Look for Saudi leagues in fixtures
            const saudiMatches = data.response.filter(match =>
                match.league.country === 'Saudi-Arabia' ||
                match.league.name.includes('Saudi') ||
                match.league.name.includes('Pro League')
            );

            if (saudiMatches.length > 0) {
                console.log('=== Saudi Pro League Matches Found ===\n');
                saudiMatches.forEach(match => {
                    console.log(`League: ${match.league.name}`);
                    console.log(`League ID: ${match.league.id}`);
                    console.log(`Country: ${match.league.country}`);
                    console.log(`Season: ${match.league.season}`);
                    console.log(`Match: ${match.teams.home.name} vs ${match.teams.away.name}`);
                    console.log('---');
                });
            } else {
                console.log('No Saudi Pro League matches today');
                console.log('\nTip: Based on API-Football documentation, Saudi Pro League ID should be: 307');
                console.log('Season 2024 for current season');
            }
        } else {
            console.log('No fixtures found for today');
            console.log('\nNote: If subscription doesn\'t include fixtures endpoint,');
            console.log('the Saudi Pro League ID is typically: 307');
            console.log('Current season: 2024');
        }

        console.log('\n=== Subscription Info ===');
        console.log(JSON.stringify(data, null, 2).substring(0, 500));
    });
});

req.on('error', function (e) {
    console.error('Error:', e.message);
    console.log('\nDefault Saudi Pro League values:');
    console.log('League ID: 307');
    console.log('Season: 2024');
});

req.end();
