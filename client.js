/**
 * Source for the client that runs inside of the container
 */

const fetch = require('node-fetch');

function fetchTimeout(url, options, timeout = 3000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Timeout while fetching config from ${url}`)),
        timeout
      )
    ),
  ]);
}

async function main() {
  const hostIp = process.env.HOST_IP;

  try {
    const response = await fetchTimeout(`http://${hostIp}:3000`);
    const textResponse = await response.text();
    console.log('textResponse: ', textResponse);

    process.exitCode = 0;
  } catch (err) {
    console.log(err);
    process.exitCode = 1;
  }
}

main();
