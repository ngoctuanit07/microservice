const http = require('http');

const data = JSON.stringify({ name: 'dd', type: 'INCOME', amount: 333, date: '2025-09-19' });

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/transaction',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS:', res.headers);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('BODY:', body);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('problem with request:', e.message);
  process.exit(1);
});

req.write(data);
req.end();
