const http = require('http');
const { spawn } = require('child_process');
const { networkInterfaces } = require('os');

function createDeferred() {
  let r;
  let j;
  const promise = new Promise((resolve, reject) => {
    r = resolve;
    j = reject;
  });

  // @ts-ignore
  return { promise, resolve: r, reject: j };
}

function getLocalIpAddressFromHost() {
  if (process.env.HOST_IP) {
    return process.env.HOST_IP;
  }

  const nets = networkInterfaces();
  const results = Object.create(null); // or just '{}', an empty object

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }

        results[name].push(net.address);
      }
    }
  }

  console.log('IP Adresses found:', JSON.stringify(results, null, 2));

  return results['en0'][0];
}

async function runDockerContainer() {
  const defer = createDeferred();
  const cwd = process.cwd();
  const hostIP = getLocalIpAddressFromHost();

  const dockerProcess = spawn('docker', [
    'run',
    '--rm',
    '--env',
    `HOST_IP=${hostIP}`,
    '-v',
    `${cwd}/client:/tmp`,
    'node:14-alpine',
    'node',
    '/tmp/index.js',
  ]);

  dockerProcess.on('exit', (code) => {
    if (code === 0) {
      return defer.resolve();
    }

    defer.reject();
  });

  dockerProcess.stdout?.on('data', (data) => {
    console.log(`[container]: ${data}`);
  });

  dockerProcess.stderr?.on('data', (data) => {
    console.log(`[container]: ${data}`);
  });

  return defer.promise;
}

async function main() {
  const server = http.createServer((_req, res) => {
    res.writeHead(200);
    res.end('Hello from Host!');
  });
  server.listen(3000);

  try {
    await runDockerContainer();
  } catch (err) {
    process.exitCode = 1;
    console.log(err);
  } finally {
    await new Promise((resolve) => {
      server.close(() => resolve());
    });
  }
}

main();
