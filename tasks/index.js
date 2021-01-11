const CronJob = require('cron').CronJob;
const axios = require('axios').default;
const isReachable = require('is-reachable');
const pool_of_servers_nf = require('../.pool_of_servers.json');
const pool_of_servers = pool_of_servers_nf.filter((s => s.itp === true));

const job = new CronJob('00 00 07 * * *', async function () {
  const d = new Date();
  console.log(d);
  try {
    for (let i = 0; i < pool_of_servers.length; i++) {
      const server = pool_of_servers[i].server_domain;
      if (await isReachable(server)) {
        const url_endp = `${server}/enhanced/terminal_cmd`;

        const axios_body = {
          cmd: 'pm2 restart 0'
        };

        const response = await axios.post(url_endp, axios_body, {
          headers: {
            'api_key': process.env.API_KEY
          }
        });
        if(response.data.success) {
          console.log('success running pm2 restart 0');
        } else {
          console.log('error running pm2 restart 0, MESSAGE: ' + response.data.text);
        }
      } else {
        console.log('error running pm2 restart 0, SERVER UNREACHABLE: ' + server);
      }
    }
  } catch (error) {
    console.log('error running pm2 restart 0, ERROR: ' + error);
  }
});


job.start();
