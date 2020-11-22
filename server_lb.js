require('dotenv').config()
const cors = require("cors");
const port = process.env.PORT || 3000;
const authorized_servers = require('./.authorized_servers.json');

// Express service
const express = require('express');
const app = express();

// Accept request from servers in authorized_servers ...
app.use(cors({
  origin: authorized_servers,
  credentials: true
}));

// Require utilities to create a database
const low = require('lowdb');
const lodashId = require('lodash-id');
const FileSync = require('lowdb/adapters/FileSync');

// Instanciate the database
const adapter = new FileSync('./database/db.json');
const db = low(adapter);
db.defaults({ calls: [], errors: [], stats: [] })
  .write();

// Generate auto_ids for inserts in db
db._.mixin(lodashId);

// Format responses and requests to json 
app.use(express.json());

/**
 *  Launching the api
 */
app.listen(port, () => { console.log('API is up and running'); });

module.exports = app;
