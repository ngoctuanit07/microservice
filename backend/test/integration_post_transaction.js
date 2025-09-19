const http = require('http');

const data = JSON.stringify({ name: 'ci-test', type: 'INCOME', amount: 999, date: '2025-09-19' });
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
  if (res.statusCode >= 200 && res.statusCode < 300) {
    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      console.log('OK', res.statusCode, body);
      process.exit(0);
    });
  } else {
    console.error('Unexpected status', res.statusCode);
    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      console.error('BODY:', body);
      process.exit(1);
    });
  }
});

req.on('error', (e) => {
  console.error('request error', e.message);
  process.exit(1);
});

req.write(data);
req.end();
