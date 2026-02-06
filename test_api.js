const fetch = require('node-fetch');

async function testAPI() {
    console.log('--- Testing Contact API ---');
    try {
        const contactResponse = await fetch('http://localhost:3000/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                message: 'Hello, this is a test message.'
            })
        });
        const contactResult = await contactResponse.json();
        console.log('Contact Response:', contactResponse.status, contactResult);
    } catch (error) {
        console.error('Contact Test Error:', error.message);
    }

    console.log('\n--- Testing Subscription API ---');
    try {
        const subResponse = await fetch('http://localhost:3000/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test_sub@example.com',
                tier: 'Premium'
            })
        });
        const subResult = await subResponse.json();
        console.log('Subscription Response:', subResponse.status, subResult);
    } catch (error) {
        console.error('Subscription Test Error:', error.message);
    }
}

testAPI();
