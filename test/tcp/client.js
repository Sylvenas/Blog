const net = require('net');

const client = new net.Socket();
client.setEncoding('utf8');

client.connect('/hello/world', 'localhost', () => {
  console.log('connected to server');
  client.write('Hi, I am client');
});

client.on('data', data => {
  console.log(data);
});

client.on('close', () => {
  console.log('connection is closed');
});