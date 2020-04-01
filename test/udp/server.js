const dgram = require('dgram');

const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
  console.log(msg + ' from ' + rinfo.address + ':' + rinfo.port);
});

server.bind(3232);