const net = require('net');
const path = require('path');

const unixSocket =
  //  path.join('\\\\?', process.cwd(), 'hello');
  '/Users/sylvenas/Documents/github/blog/Blog/test/tcp/hello';

const server = net.createServer(conn => {
  console.log('connected');

  conn.on('data', data => {
    console.log(data + ' from' + conn.remoteAddress + ' ' + conn.remotePort);
    conn.write(data);
  });

  conn.on('close', () => {
    console.log('client closed connection');
  });
});

server.on('error', e => {
  console.log(e.message);
});

server.listen(unixSocket);
