const http = require('http');

const data = JSON.stringify({
    name: 'Test Location',
    description: 'Testing API',
    bins: ['Bin 1', 'Bin 2'],
    shelves: ['Shelf 1']
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/locations',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    let body = '';
    res.on('data', (chunk) => {
        console.log(`BODY CHUNK: ${chunk}`);
        body += chunk;
    });
    res.on('end', () => {
        console.log('No more data in response.');
        if (body) {
            try {
                console.log('Parsed JSON:', JSON.parse(body));
            } catch (e) {
                console.log('Failed to parse JSON body');
            }
        } else {
            console.log('Body is empty');
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
