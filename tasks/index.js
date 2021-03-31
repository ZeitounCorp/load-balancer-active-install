const CronJob = require('cron').CronJob;
const axios = require('axios').default;
const isReachable = require('is-reachable');
const editJsonFile = require("edit-json-file");
const sha1 = require('sha1');
const parser = require('xml2json');
const path = require('path');

let file = editJsonFile(path.join(__dirname, '../.pool_of_servers.json'), {
  autosave: true
});

const job = new CronJob('0 */5 * * * *', async function () {
  const d = new Date();
  console.log(d, 'Checking on webhook');
  const updated_pool = file.toObject();
  const pool = Array.from(updated_pool);
  const { SSECRET_KEY } = process.env;
  try {
    for (let i = 0; i < pool.length; i++) {
      const server = pool[i].server_domain;
      if (await isReachable(server)) {

        let stringQuery = `callbackURL=https://www.beecome.io/video/hook/bbb/callback`;

        const compute = 'hooks/create' + stringQuery + SSECRET_KEY;

        const checksum = sha1(compute);

        stringQuery += `&checksum=${checksum}`;

        const host = new URL(server).hostname;

        const create_hook = `https://${host}/bigbluebutton/api/hooks/create?${stringQuery}`;

        const response = await axios.get(create_hook);

        if (response) {
          const data = parser.toJson(response.data, { object: true, coerce: true }).response;
          if (data.returncode === 'SUCCESS') {
            if (!data.messageKey) {
              console.log(`Created a hook on server: ${host}, hookID: ${data.hookID}`);
            } else {
              console.log(`Hook already registered on server: ${host}, messageKey: ${data.messageKey}, hookID: ${data.hookID}`);
            }
          } else {
            console.log(`ERROR => Hook not created on server: ${host}, messageKey: ${data.messageKey}, errorMessage: ${data.message}`);
          }
        } else {
          console.log(`No response for hooks on server: ${host}`);
        }
      } else {
        console.log('SERVER UNREACHABLE: ' + server);
      }
    }
  } catch (error) {
    console.log('ERROR: ' + error);
  }
});


job.start();
