const express = require('express');
const router = express.Router();
const path = require('path');
const axios = require('axios').default;
const editJsonFile = require("edit-json-file");
const isReachable = require('is-reachable');
const sha1 = require('sha1');
const uniqid = require('uniqid');
const parser = require('xml2json');
const { setInDb } = require('../../database/');

let file = editJsonFile(path.join(__dirname, '../../.pool_of_servers.json'), {
  autosave: true
});

const api_key_missing = 'You didn\'t provide a valid api key || headers[\'api_key\'] is missing';

router.get('/dashboard/get_pool', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/ext/dashboard/get_pool' });
    return res.send({ status: 400, error: api_key_missing });
  }

  const updated_pool = file.toObject();

  for (let s of updated_pool) {
    let serv = s;
    serv.available = await isReachable(serv.server_domain);
  }

  const pool = Array.from(updated_pool);

  res.send({ pool });

});

router.post('/dashboard/add_server', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/ext/dashboard/add_server' });
    return res.send({ status: 400, error: api_key_missing });
  }

  const server_name = req.body.server_name;
  if (!server_name) {
    setInDb('errors', { error: '(req.body.server_name was missing)', endpoint: '/ext/dashboard/add_server' });
    return res.send({ status: 400, error: 'You didn\'t provide a server_name' });
  }

  const server_to_add = {
    server_domain: `http://${server_name}.beecome.io:5555`,
    itp: true
  }

  let updated_pool = file.toObject();

  const index = updated_pool.length;

  file.set(`${index}`, server_to_add);

  updated_pool = file.toObject();

  for (let s of updated_pool) {
    let serv = s;
    serv.available = await isReachable(serv.server_domain);
  }

  const pool = Array.from(updated_pool);

  setInDb('calls', { data: server_to_add, endpoint: '/ext/dashboard/add_server' });
  res.send({ server_added: server_to_add, pool });

});

router.post('/dashboard/pause_server', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/ext/dashboard/pause_server' });
    return res.send({ status: 400, error: api_key_missing });
  }

  const server_name = req.body.server_name;
  if (!server_name) {
    setInDb('errors', { error: '(req.body.server_name was missing)', endpoint: '/ext/dashboard/pause_server' });
    return res.send({ status: 400, error: 'You didn\'t provide a server_name' });
  }

  let updated_pool = file.toObject();

  const index = updated_pool.findIndex((s) => s.server_domain.includes(server_name));

  file.set(`${index}.itp`, false);

  updated_pool = file.toObject();

  for (let s of updated_pool) {
    let serv = s;
    serv.available = await isReachable(serv.server_domain);
  }

  const pool = Array.from(updated_pool);

  setInDb('calls', { data: server_name, endpoint: '/ext/dashboard/pause_server' });
  res.send({ server_paused: server_name, pool });
});

router.post('/dashboard/unpause_server', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/ext/dashboard/unpause_server' });
    return res.send({ status: 400, error: api_key_missing });
  }

  const server_name = req.body.server_name;
  if (!server_name) {
    setInDb('errors', { error: '(req.body.server_name was missing)', endpoint: '/ext/dashboard/unpause_server' });
    return res.send({ status: 400, error: 'You didn\'t provide a server_name' });
  }

  let updated_pool = file.toObject();

  const index = updated_pool.findIndex((s) => s.server_domain.includes(server_name));

  file.set(`${index}.itp`, true);

  updated_pool = file.toObject();

  for (let s of updated_pool) {
    let serv = s;
    serv.available = await isReachable(serv.server_domain);
  }

  const pool = Array.from(updated_pool);

  setInDb('calls', { data: server_name, endpoint: '/ext/dashboard/unpause_server' });
  res.send({ server_unpaused: server_name, pool });
});

router.post('/dashboard/remove_server', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/ext/dashboard/remove_server' });
    return res.send({ status: 400, error: api_key_missing });
  }

  const server_name = req.body.server_name;
  if (!server_name) {
    setInDb('errors', { error: '(req.body.server_name was missing)', endpoint: '/ext/dashboard/remove_server' });
    return res.send({ status: 400, error: 'You didn\'t provide a server_name' });
  }

  let updated_pool = file.toObject();

  const index = updated_pool.findIndex((s) => s.server_domain.includes(server_name));

  file.set(`${index}.removed`, true);
  file.set(`${index}.itp`, false);

  updated_pool = file.toObject();

  for (let s of updated_pool) {
    let serv = s;
    serv.available = await isReachable(serv.server_domain);
  }

  const pool = Array.from(updated_pool);

  setInDb('calls', { data: server_name, endpoint: '/ext/dashboard/remove_server' });
  res.send({ server_removed: server_name, pool });
});

router.post('/dashboard/terminal', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/ext/dashboard/terminal' });
    return res.send({ status: 400, error: api_key_missing });
  }

  const server_name = req.body.server_name;
  if (!server_name) {
    setInDb('errors', { error: '(req.body.server_name was missing)', endpoint: '/ext/dashboard/terminal' });
    return res.send({ status: 400, error: 'You didn\'t provide a server_name' });
  }

  const cmd = req.body.cmd;
  if (!cmd) {
    setInDb('errors', { error: '(req.body.cmd was missing)', endpoint: '/ext/dashboard/terminal' });
    return res.send({ status: 400, error: 'You didn\'t provide a command' });
  }

  let updated_pool = file.toObject();

  const index = updated_pool.findIndex((s) => s.server_domain.includes(server_name));
  const host = updated_pool[index].server_domain;

  const axios_body = {
    cmd: cmd
  };

  try {
    if (await isReachable(host)) {

      const server_to_reach = `${host}/enhanced/terminal_cmd`;

      const response = await axios.post(server_to_reach, axios_body, {
        headers: {
          'api_key': process.env.API_KEY
        }
      });

      if (response.data.success) {
        setInDb('calls', { data: { server_n: server_name, cmd: cmd }, endpoint: '/ext/dashboard/terminal' });
        res.send({ stdout: response.data.text, cmd: cmd, success: true });
      } else {
        setInDb('calls', { data: { server_n: server_name, cmd: cmd }, endpoint: '/ext/dashboard/terminal' });
        res.send({ error: true, stderr: response.data.text, cmd: cmd });
      }

    } else {
      setInDb('errors', { error: 'Not reachable', endpoint: '/ext/dashboard/terminal' });
      return res.send({ status: 400, err: 'Server is not reachable', cmd: cmd });
    }
  } catch (error) {
    setInDb('errors', { error: error, endpoint: '/ext/dashboard/terminal' });
    return res.send({ status: 400, err: error, cmd: cmd });
  }
});

router.post('/dashboard/process_media', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/ext/dashboard/process_media' });
    return res.send({ status: 400, error: api_key_missing });
  }

  const { server, media } = req.body;

  const accepted_error_types = ["audio", "video"];


  if (!media) {
    setInDb('errors', { error: '(req.body.media was missing)', endpoint: '/ext/dashboard/process_media' });
    return res.send({ status: 400, error: 'You didn\'t provide a media type' });
  }

  if (!server) {
    setInDb('errors', { error: '(req.body.server was missing)', endpoint: '/ext/dashboard/process_media' });
    return res.send({ status: 400, error: 'You didn\'t provide a server' });
  }

  if (media && !accepted_error_types.includes(media)) {
    setInDb('errors', { error: '(media was not audio or video)', endpoint: '/ext/dashboard/process_media' });
    return res.send({ status: 400, error: "Options are ['audio', 'video']" });
  }

  try {
    const url_endp = `${server}/restart/error_muggles`;

    const response = await axios.get(url_endp, {
      headers: {
        'api_key': process.env.API_KEY
      },
      data: {
        error_codes: media === 'video' ? ['1020'] : ['1005']
      }
    });

    if (!response.data.error) {
      setInDb('calls', { data: { server_n: server, cmd: response.data.cmd }, endpoint: '/ext/dashboard/process_media' });
      res.send({ cmd: response.data.cmd });
    } else {
      setInDb('errors', { error: response.data.text, endpoint: '/ext/dashboard/process_media' });
      res.send({ status: 400, error: response.data.text });
    }
  } catch (error) {
    setInDb('errors', { error: error, endpoint: '/ext/dashboard/process_media' });
    return res.send({ status: 400, error });
  }
});

router.post('/dashboard/create_room', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/ext/dashboard/create_room' });
    return res.send({ status: 400, error: api_key_missing });
  }

  const { host, name, record, maxParticipants, duration, seshared } = req.body;

  const uniq_id = uniqid();

  const room_name = name.replace(/ /g, '+');

  let stringQuery = `name=${room_name}&meetingID=${uniq_id}&record=${record}&maxParticipants=${maxParticipants}&duration=${duration}`;

  const compute = 'create' + stringQuery + seshared;

  const checksum = sha1(compute);

  stringQuery += `&checksum=${checksum}`;

  const create_endpoint_bbb = `https://${host}/bigbluebutton/api/create?${stringQuery}`;

  try {
    const response = await axios.post(create_endpoint_bbb);

    if (response) {
      const data = parser.toJson(response.data, { object: true }).response;
      if (data.returncode === 'SUCCESS') {
        res.send({ response: data, success: true });
      } else {
        res.send({ error: true, message: data.message, messageKey: data.messageKey });
      }
    } else {
      res.send({ status: 400, error: 'no response' });
    }
  } catch (error) {
    setInDb('errors', { error: error, endpoint: '/ext/dashboard/create_room' });
    return res.send({ status: 400, error });
  }
});

router.post('/dashboard/get_list_meetings', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/ext/dashboard/get_list_meetings' });
    return res.send({ status: 400, error: api_key_missing });
  }

  const { host, seshared } = req.body;

  const compute = 'getMeetings' + seshared;

  const checksum = sha1(compute);

  const stringQuery = `checksum=${checksum}`;

  const list_meets_endpoint_bbb = `https://${host}/bigbluebutton/api/getMeetings?${stringQuery}`;

  try {
    const response = await axios.get(list_meets_endpoint_bbb);

    if (response) {
      const data = parser.toJson(response.data, { object: true, coerce: true }).response;
      if (data.returncode === 'SUCCESS') {
        res.send({ response: data, success: true });
      } else {
        res.send({ error: true, message: data.message, messageKey: data.messageKey });
      }
    } else {
      res.send({ status: 400, error: 'no response' });
    }
  } catch (error) {
    return res.send({ status: 400, error });
  }
});

router.post('/dashboard/join_room', async function (req, res) {
  if (!req.headers['api_key'] || req.headers['api_key'] !== process.env.API_KEY) {
    setInDb('errors', { error: api_key_missing, endpoint: '/ext/dashboard/join_room' });
    return res.send({ status: 400, error: api_key_missing });
  }

  const { host, seshared, fullName, meetingID, modPassword } = req.body;

  let stringQuery = `meetingID=${meetingID}&fullName=${fullName}&password=${modPassword}`;

  const compute = 'join' + stringQuery + seshared;

  const checksum = sha1(compute);

  stringQuery += `&checksum=${checksum}`;

  const join_room_endpoint_bbb = `https://${host}/bigbluebutton/api/join?${stringQuery}`;

  res.send({ joinUrl: join_room_endpoint_bbb });
});



module.exports = router;
