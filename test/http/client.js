const http = require('http');
const querystring = require('querystring');

const postData = querystring.stringify({
  name: 'James',
  age: 34,
});

const options = {
  hostname: 'localhost',
  port: 3232,
  method: 'POST',
  header: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length,
  },
};

const req = http.request(options, (res) => {
  console.log('status', res.statusCode);
  console.log('headers', JSON.stringify(res.headers));

  res.setEncoding('utf8');

  let body = '';
  res.on('data', data => {
    body += data;
  });

  res.on('end', () => {
    console.log('No more data in response');
    console.log(body);
  });
});

req.write(postData);
req.end();
