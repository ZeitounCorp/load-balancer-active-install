const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const pool_of_servers_nf = require('../../.pool_of_servers.json');
const pool_of_servers = pool_of_servers_nf.filter((s => s.itp === true));
const isReachable = require('is-reachable');
const { setInDb } = require('../../database/');

const api_key_missing = 'You didn\'t provide a valid api key || headers[\'api_key\'] is missing';

router.get('/lb/get_ram_info', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/ram/lb/get_ram_info' });
    return res.send({ status: 400, error: api_key_missing });
  }

  const type = req.body.type;
  if (!type) {
    setInDb('errors', { error: '(req.body.filter was type)', endpoint: '/ram/lb/get_ram_info' });
    return res.send({ status: 400, error: 'You didn\'t provide a type or array of type thus we cannot return info about the ram (req.body.type was missing)' });
  }

  const axios_body = {
    type
  };

  try {
    const get_ram_info_from_servers = [];
    for (let i = 0; i < pool_of_servers.length; i++) {
      const server = pool_of_servers[i].server_domain;
      if (await isReachable(server)) {

        const url_endp = `${server}/r_memory/get_ram_info`;
        const response = await axios.get(url_endp, {
          headers: {
            'api_key': process.env.API_KEY
          },
          data: axios_body
        });

        if (!response.data.error) {
          get_ram_info_from_servers.push({ memory_stat: response.data.memory_stat, server, reachable: true, filtered_by: type });
        } else {
          get_ram_info_from_servers.push({ memory_stat: 'not-defined', server, reachable: true, error: response.data.error, filtered_by: type });
        }

      } else {
        get_ram_info_from_servers.push({ memory_stat: 'not-defined', server, reachable: false, filtered_by: type });
      }
    }
    
    setInDb('calls', { data: get_ram_info_from_servers, endpoint: '/ram/lb/get_ram_info' });
    res.send({ get_ram_info_from_servers });
  } catch (error) {
    setInDb('errors', { error: error, endpoint: '/ram/lb/get_ram_info' });
    return res.send({ status: 400, error: error });
  }

});




module.exports = router;
