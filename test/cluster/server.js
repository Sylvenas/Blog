const http = require('http');
const cluster = require('cluster');
const os = require('os');

const cpuLen = os.cpus().length;
const workers = [];

if (cluster.isMaster) {
  for (let i = 0; i < cpuLen; i++) {
    const worker = cluster.fork();
    workers.push(worker);
    // worker.on('message', message => {
    //   console.log('worker log:', message);
    // });
    worker.send('[master] ' + 'send msg ' + i + ' to worker ' + worker.id);
  }
} else {
  process.on('message', function (message) {
    console.log('get worker log:', message);
  });
  // process.send('hello world');

  http.createServer((req, res) => {
    const pid = process.pid;
    res.writeHead(200);
    res.end(`hello world from process: ${pid}`);
  }).listen(3232);
}