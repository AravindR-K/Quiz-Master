const jwt = require('jsonwebtoken');
const http = require('http');

const JWT_SECRET = 'quiz_app_super_secret_key_2026';

// The admin user id from the previous query was 69d49c922c5d4255f1586365
const token = jwt.sign({ id: '69d49c922c5d4255f1586365', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

const data = JSON.stringify({
  assigneeIds: ['69dbd7dc839ed359fa93408a', '69e60a415b06f9656a2dc37d']
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/quiz/69e88245efc8e25294852356/assign',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
