const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const pool_of_servers_nf = require('../../.pool_of_servers.json');
const pool_of_servers = pool_of_servers_nf.filter((s => s.itp === true));
const isReachable = require('is-reachable');
const { setInDb } = require('../../database/');

const api_key_missing = 'You didn\'t provide a valid api key || headers[\'api_key\'] is missing';


router.get('/lb/diskInfo', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/hmem/lb/diskInfo' });
    return res.send({ status: 400, error: api_key_missing });
  }

  try {
    const disks_info = [];
    for (let i = 0; i < pool_of_servers.length; i++) {
      const server = pool_of_servers[i].server_domain;
      if (await isReachable(server)) {

        const url_endp = `${server}/hd_memory/diskInfo`;
        const response = await axios.get(url_endp, {
          headers: {
            'api_key': process.env.API_KEY
          },
        });

        if (!response.data.error) {
          disks_info.push({ disk_info: response.data.disk_info, server, reachable: true });
        } else {
          disks_info.push({ disk_info: 'not-defined', server, reachable: true, error: response.data.error });
        }

      } else {
        disks_info.push({ disk_info: 'not-defined', server, reachable: false });
      }
    }

    setInDb('calls', { data: disks_info, endpoint: '/hmem/lb/diskInfo' });
    res.send({ disks_info });
  } catch (error) {
    setInDb('errors', { error: error, endpoint: '/hmem/lb/diskInfo' });
    return res.send({ status: 400, error: error });
  }

});

router.get('/lb/available_space', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/hmem/lb/available_space' });
    return res.send({ status: 400, error: api_key_missing });
  }

  try {
    const spaces_available = [];
    for (let i = 0; i < pool_of_servers.length; i++) {
      const server = pool_of_servers[i].server_domain;
      if (await isReachable(server)) {

        const url_endp = `${server}/hd_memory/available_space`;
        const response = await axios.get(url_endp, {
          headers: {
            'api_key': process.env.API_KEY
          },
        });

        if (!response.data.error) {
          spaces_available.push({ available: response.data.available, server, reachable: true });
        } else {
          spaces_available.push({ available: 'not-defined', server, reachable: true, error: response.data.error });
        }

      } else {
        spaces_available.push({ available: 'not-defined', server, reachable: false });
      }
    }

    setInDb('calls', { data: spaces_available, endpoint: '/hmem/lb/available_space' });
    res.send({ spaces_available });
  } catch (error) {
    setInDb('errors', { error: error, endpoint: '/hmem/lb/available_space' });
    return res.send({ status: 400, error: error });
  }

});

router.get('/lb/disk_read_write_stats', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/hmem/lb/disk_read_write_stats' });
    return res.send({ status: 400, error: api_key_missing });
  }

  try {
    const read_write_stats = [];
    for (let i = 0; i < pool_of_servers.length; i++) {
      const server = pool_of_servers[i].server_domain;
      if (await isReachable(server)) {

        const url_endp = `${server}/hd_memory/disk_read_write_stats`;
        const response = await axios.get(url_endp, {
          headers: {
            'api_key': process.env.API_KEY
          },
        });

        if (!response.data.error) {
          read_write_stats.push({ stats: response.data.stats, server, reachable: true });
        } else {
          read_write_stats.push({ stats: 'not-defined', server, reachable: true, error: response.data.error });
        }

      } else {
        read_write_stats.push({ stats: 'not-defined', server, reachable: false });
      }
    }

    setInDb('calls', { data: read_write_stats, endpoint: '/hmem/lb/disk_read_write_stats' });
    res.send({ read_write_stats });
  } catch (error) {
    setInDb('errors', { error: error, endpoint: '/hmem/lb/disk_read_write_stats' });
    return res.send({ status: 400, error: error });
  }

});


module.exports = router;
