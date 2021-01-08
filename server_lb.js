require('dotenv').config()
const cors = require("cors");
const port = process.env.PORT || 3000;
const authorized_servers = require('./.authorized_servers.json');
const { db } = require('./database/');

// Express service
const express = require('express');
const app = express();

// Accept request from servers in authorized_servers ...
app.use(cors({
  origin: authorized_servers,
  credentials: true
}));

// Initalize database if ./database/db.json is empty
db.defaults({ calls: [], errors: [], counts: { errors: 0, success: 0 } })
  .write();

// Format responses and requests to json 
app.use(express.json());

/**
 * Tasks' import
 */
require('./tasks');

/**
 * Routes' imports 
 */
const CPU = require('./routes/cpu');
const HDMEM = require('./routes/hmemory');
const PROCESSES = require('./routes/processes');
const RAM = require('./routes/ram');
const WHICHSERV = require('./routes/which_server');
const DASHBOARD = require('./routes/dashboard');
/**
 * Routes Middleware
 */
app.use('/cpu', CPU); // Get CPU stats for each server
app.use('/hmem', HDMEM); // Get Hard Drive memory available on each server
app.use('/processes', PROCESSES); // Get Processes running on each server
app.use('/ram', RAM); // Get RAM memory available on each server
app.use('/launchable', WHICHSERV); // Get the server to use depending on memory, cpu and ram available
app.use('/ext', DASHBOARD);

/**
 *  Launching the api
 */
app.listen(port, () => { console.log('API is up and running'); });

module.exports = app;
