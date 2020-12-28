const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const pool_of_servers_nf = require('../../.pool_of_servers.json');
const pool_of_servers = pool_of_servers_nf.filter((s => s.itp === true));
const isReachable = require('is-reachable');
const { setInDb } = require('../../database/');

const api_key_missing = 'You didn\'t provide a valid api key || headers[\'api_key\'] is missing';

router.get('/lb/processes_list_by_status', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/processes/lb/processes_list_by_status' });
    return res.send({ status: 400, error: api_key_missing });
  }

  const status = req.body.filter;
  if (!status) {
    setInDb('errors', { error: '(req.body.filter was missing)', endpoint: '/processes/lb/processes_list_by_status' });
    return res.send({ status: 400, error: 'You didn\'t provide a processes filter (req.body.filter was missing)' });
  }

  const axios_body = {
    filter: status
  };

  try {
    const processes_list = [];
    for (let i = 0; i < pool_of_servers.length; i++) {
      const server = pool_of_servers[i].server_domain;
      if (await isReachable(server)) {

        const url_endp = `${server}/processes/processes_list_by_status`;
        const response = await axios.get(url_endp, {
          headers: {
            'api_key': process.env.API_KEY
          },
          data: axios_body
        });

        if (!response.data.error) {
          processes_list.push({ processes: response.data.processes, server, reachable: true, filtered_by: status });
        } else {
          processes_list.push({ processes: 'not-defined', server, reachable: true, error: response.data.error, filtered_by: status });
        }

      } else {
        processes_list.push({ processes: 'not-defined', server, reachable: false, filtered_by: status });
      }
    }

    setInDb('calls', { data: processes_list, endpoint: '/processes/lb/processes_list_by_status' });
    res.send({ processes_list });
  } catch (error) {
    setInDb('errors', { error: error, endpoint: '/processes/lb/processes_list_by_status' });
    return res.send({ status: 400, error: error });
  }

});

router.get('/lb/processes_list', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/processes/lb/processes_list' });
    return res.send({ status: 400, error: api_key_missing });
  }

  const percent = Number(req.body.percent);
  if (!percent) {
    setInDb('errors', { error: '(req.body.percent was missing)', endpoint: '/processes/lb/processes_list' });
    return res.send({ status: 400, error: 'You didn\'t provide a percent from which processes that use more can be returned (req.body.percent was missing)' });
  }

  const axios_body = {
    percent
  };

  try {
    const processes_list = [];
    for (let i = 0; i < pool_of_servers.length; i++) {
      const server = pool_of_servers[i].server_domain;
      if (await isReachable(server)) {

        const url_endp = `${server}/processes/processes_list`;
        const response = await axios.get(url_endp, {
          headers: {
            'api_key': process.env.API_KEY
          },
          data: axios_body
        });

        if (!response.data.error) {
          processes_list.push({ processes: response.data.processes, server, reachable: true, nb_of_processes: response.data.processes.length, usage_sup_to: `${percent}%` });
        } else {
          processes_list.push({ processes: 'not-defined', server, reachable: true, error: response.data.error });
        }

      } else {
        processes_list.push({ processes: 'not-defined', server, reachable: false });
      }
    }

    setInDb('calls', { data: processes_list, endpoint: '/processes/lb/processes_list' });
    res.send({ processes_list });
  } catch (error) {
    setInDb('errors', { error: error, endpoint: '/processes/lb/processes_list' });
    return res.send({ status: 400, error: error });
  }

});

router.get('/lb/most_intensive_process', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/processes/lb/most_intensive_process' });
    return res.send({ status: 400, error: api_key_missing });
  }

  try {
    const most_intensive_processes = [];
    for (let i = 0; i < pool_of_servers.length; i++) {
      const server = pool_of_servers[i].server_domain;
      if (await isReachable(server)) {

        const url_endp = `${server}/processes/most_intensive_process`;
        const response = await axios.get(url_endp, {
          headers: {
            'api_key': process.env.API_KEY
          },
        });

        if (!response.data.error) {
          most_intensive_processes.push({ process: response.data.process, server, reachable: true });
        } else {
          most_intensive_processes.push({ process: 'not-defined', server, reachable: true, error: response.data.error });
        }

      } else {
        most_intensive_processes.push({ process: 'not-defined', server, reachable: false });
      }
    }

    setInDb('calls', { data: most_intensive_processes, endpoint: '/processes/lb/most_intensive_process' });
    res.send({ most_intensive_processes });
  } catch (error) {
    setInDb('errors', { error: error, endpoint: '/processes/lb/most_intensive_process' });
    return res.send({ status: 400, error: error });
  }

});


module.exports = router;
