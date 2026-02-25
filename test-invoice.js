const https = require('https');

const testData = JSON.stringify({
    contact_id: 'test_manual_' + Date.now(),
    id: 'test_manual_' + Date.now(),
    full_name: 'Gowtham Sivakumar',
    email: 'gowtham.svkmr@gmail.com',
    opportunity_name: 'Canyon Lake Manual Test',
    lead_value: 2500
});

const options = {
    hostname: 'handleghlopportunity-tgdtaycazq-uc.a.run.app',
    path: '/',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            if (response.brandedUrl) {
                console.log('\n✅ SUCCESS! Fresh invoice link generated:\n');
                console.log(response.brandedUrl);
                console.log('\nCopy this link and open it in your browser to test.\n');
            } else {
                console.log('\n⚠️ Response received but no brandedUrl found.');
                console.log('Full Response:', JSON.stringify(response, null, 2));
            }
        } catch (e) {
            console.log('\nRaw Response:', data);
            console.log('\nParse Error:', e.message);
        }
    });
});

req.on('error', (error) => {
    console.error('\n❌ ERROR:', error.message);
});

req.write(testData);
req.end();
