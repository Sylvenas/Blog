const http = require('http');
const querystring = require('querystring');

const pid = process.pid;

const server = http.createServer().listen(3232);

server.on('request', (request, response) => {
  if (request.method === 'GET') {
    response.end(`handled by process.${pid}`);
    return;
  }
  if (request.method === 'POST') {
    let body = '';

    request.on('data', data => {
      body += data;
    });

    request.on('end', () => {
      let post = querystring.parse(body);
      post = {
        ...post,
        serverTag: 'server append the data',
      };
      console.log(post);
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end(JSON.stringify(post));
    });
  }
});

console.log('server listening on port 3232');