const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const pool_of_servers_nf = require('../../.pool_of_servers.json');
const pool_of_servers = pool_of_servers_nf.filter((s => s.itp === true));
const isReachable = require('is-reachable');
const { setInDb } = require('../../database/');

const api_key_missing = 'You didn\'t provide a valid api key || headers[\'api_key\'] is missing';

router.get('/lb/server_to_use', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/launchable/lb/server_to_use' });
    return res.send({ status: 400, error: api_key_missing });
  }

  try {
    const get_vital_infos = [];
    for (let i = 0; i < pool_of_servers.length; i++) {
      const server = pool_of_servers[i].server_domain;
      const hostname = server.substring(0, server.lastIndexOf(':'));

      if (await isReachable(server)) {

        const url_endp = `${server}/which_to_use/this_server_stat`;
        const response = await axios.get(url_endp, {
          headers: {
            'api_key': process.env.API_KEY
          }
        });

        if (!response.data.error) {
          get_vital_infos.push({ hostname, cpuLoad: response.data.cpuLoad, hdMem: response.data.hdMem, ip: response.data.ip, reachable: true });
        } else {
          get_vital_infos.push({ hostname, cpuLoad: 'not-defined', hdMem: 'not-defined', ip: 'not-defined', reachable: true, error: response.data.error });
        }

      } else {
        get_vital_infos.push({ hostname, cpuLoad: 'not-defined', hdMem: 'not-defined', ip: 'not-defined', reachable: false });
      }
    }

    const reachable_and_viable = get_vital_infos.filter((ser) => ser.reachable === true && !ser.error);
    const overCharged_servers = reachable_and_viable.filter((ser) => ser.cpuLoad > 60);
    const not_reachable_or_viable = get_vital_infos.filter((ser) => ser.reachable === false || ser.error);

    const most_viable_server = reachable_and_viable.reduce((prev, curr) => prev.cpuLoad < curr.cpuLoad ? prev : curr);


    setInDb('calls', { data: most_viable_server, endpoint: '/launchable/lb/server_to_use' });
    res.send({ most_viable_server, reachable_and_viable, overCharged_servers, not_reachable_or_viable });
  } catch (error) {
    setInDb('errors', { error: error, endpoint: '/launchable/lb/server_to_use' });
    return res.send({ status: 400, error });
  }

});

module.exports = router;
