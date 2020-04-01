const fs = require('fs');
const https = require('https');

const preivateKey = fs.readFileSync('./site.key', 'utf8').toString();
const certificate = fs.readFileSync('./final.crt', 'utf8').toString();

const options = {
  key: preivateKey,
  cert: certificate,
  passphrase: 'forthelichking',
};

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('Hello Secure World');
}).listen(443);

