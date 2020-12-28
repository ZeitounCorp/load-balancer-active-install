const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const pool_of_servers_nf = require('../../.pool_of_servers.json');
const pool_of_servers = pool_of_servers_nf.filter(( s => s.itp === true ));
const isReachable = require('is-reachable');
const { setInDb } = require('../../database/');

const api_key_missing = 'You didn\'t provide a valid api key || headers[\'api_key\'] is missing';

router.get('/lb/cpuLoad', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/cpu/lb/cpuLoad' });
    return res.send({ status: 400, error: api_key_missing });
  }

  try {
    const loads = [];
    for (let i = 0; i < pool_of_servers.length; i++) {
      const server = pool_of_servers[i].server_domain;
      if (await isReachable(server)) {

        const url_endp = `${server}/cpu_usage/cpuLoad`;
        const response = await axios.get(url_endp, {
          headers: {
            'api_key': process.env.API_KEY
          },
        });

        if (!response.data.error) {
          loads.push({ load: response.data.load, server, reachable: true });
        } else {
          loads.push({ load: 'not-defined', server, reachable: true, error: response.data.error });
        }

      } else {
        loads.push({ load: 'not-defined', server, reachable: false });
      }
    }

    setInDb('calls', { data: loads, endpoint: '/cpu/lb/cpuLoad' });

    res.send({ loads });
  } catch (error) {
    setInDb('errors', { error: error, endpoint: '/cpu/lb/cpuLoad' });
    return res.send({ status: 400, error: error });
  }
});

router.get('/lb/cpuLoadOn', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/cpu/lb/cpuLoadOn' });
    return res.send({ status: 400, error: api_key_missing });
  }

  const cpuNb = Number(req.body.cpu_nb);
  if (!cpuNb) {
    setInDb('errors', { error: '(req.body.cpu_nb was missing)', endpoint: '/cpu/lb/cpuLoadOn' });
    return res.send({ status: 400, error: 'You didn\'t provide the cpu core number (req.body.cpu_nb was missing)' });
  }

  const axios_body = {
    cpu_nb: cpuNb
  };

  try {
    const loads = [];
    for (let i = 0; i < pool_of_servers.length; i++) {
      const server = pool_of_servers[i].server_domain;
      if (await isReachable(server)) {

        const url_endp = `${server}/cpu_usage/cpuLoadOn`;
        const response = await axios.get(url_endp, {
          headers: {
            'api_key': process.env.API_KEY
          },
          data: axios_body
        });
        if (!response.data.error) {
          loads.push({ load: response.data.load, server, reachable: true, cpuNb: cpuNb });
        } else {
          loads.push({ load: 'not-defined', server, reachable: true, cpuNb: cpuNb, error: response.data.error });
        }

      } else {
        loads.push({ load: 'not-defined', server, reachable: false });
      }
    }

    setInDb('calls', { data: loads, endpoint: '/cpu/lb/cpuLoadOn' });
    res.send({ loads, core_nb: cpuNb });
  } catch (error) {
    setInDb('errors', { error: error, endpoint: '/cpu/lb/cpuLoadOn' });
    return res.send({ status: 400, error: error })
  }
});

router.get('/lb/cpuLoadOnEach', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/cpu/lb/cpuLoadOnEach' });
    return res.send({ status: 400, error: api_key_missing });
  }

  try {
    const loads = [];
    for (let i = 0; i < pool_of_servers.length; i++) {
      const server = pool_of_servers[i].server_domain;
      if (await isReachable(server)) {

        const url_endp = `${server}/cpu_usage/cpuLoadOnEach`;
        const response = await axios.get(url_endp, {
          headers: {
            'api_key': process.env.API_KEY
          },
        });

        if (!response.data.error) {
          loads.push({ load: response.data.load, server, reachable: true });
        } else {
          loads.push({ load: 'not-defined', server, reachable: true, error: response.data.error });
        }

      } else {
        loads.push({ load: 'not-defined', server, reachable: false });
      }
    }

    setInDb('calls', { data: loads, endpoint: '/cpu/lb/cpuLoadOnEach' });
    res.send({ loads });
  } catch (error) {
    setInDb('errors', { error: error, endpoint: '/cpu/lb/cpuLoadOnEach' });
    return res.send({ status: 400, error: error });
  }
});

router.get('/lb/cpusAvgSpeed', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/cpu/lb/cpusAvgSpeed' });
    return res.send({ status: 400, error: api_key_missing });
  }

  try {
    const speeds = [];
    for (let i = 0; i < pool_of_servers.length; i++) {
      const server = pool_of_servers[i].server_domain;
      if (await isReachable(server)) {

        const url_endp = `${server}/cpu_usage/cpusAvgSpeed`;
        const response = await axios.get(url_endp, {
          headers: {
            'api_key': process.env.API_KEY
          },
        });

        if (!response.data.error) {
          speeds.push({ speed_avg: response.data.speed, unit: 'GHz', server, reachable: true });
        } else {
          speeds.push({ speed_avg: 'not-defined', unit: 'GHz', server, reachable: true, error: response.data.error });
        }

      } else {
        speeds.push({ speed_avg: 'not-defined', unit: 'GHz', server, reachable: false });
      }
    }

    setInDb('calls', { data: speeds, endpoint: '/cpu/lb/cpusAvgSpeed' });
    res.send({ speeds });
  } catch (error) {
    setInDb('errors', { error: error, endpoint: '/cpu/lb/cpusAvgSpeed' });
    return res.send({ status: 400, error: error });
  }
});


module.exports = router;
