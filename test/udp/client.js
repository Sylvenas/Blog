const dgram = require('dgram');

const client = dgram.createSocket('udp4');

const data = 'Hello World';

client.send(data, 0, data.length, 3232, (err, bytes) => {
  if (err) {
    console.log(err);
  } else {
    console.log('successful');
  }
});