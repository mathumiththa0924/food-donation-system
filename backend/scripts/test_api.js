const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testEndpoint() {
    try {
        // Generate a fake admin token
        const token = jwt.sign(
            { id: '123456789012345678901234', role: 'admin' },
            'mySuperSecretKey_12345_foodApp',
            { expiresIn: '1h' }
        );
        
        const statsRes = await axios.get('http://localhost:5000/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Stats fetched successfully:', statsRes.data);
    } catch (e) {
        if (e.response) {
            console.error('Server responded with error:', e.response.status, e.response.data);
        } else {
            console.error('Error:', e.message);
        }
    }
}

testEndpoint();
