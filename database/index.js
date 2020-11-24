// Require utilities to create a database
const low = require('lowdb');
const lodashId = require('lodash-id');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

// Instanciate the database
const adapter = new FileSync(path.join(__dirname, './db.json'));
const db = low(adapter);

// Generate auto_ids for inserts in db
db._.mixin(lodashId);

function setInDb(collection, data) {
  db.get(collection).push({ timestamp: Date.now(), ...data}).write();
  if (collection === 'errors') {
    updateCount('errors');
  } else {
    updateCount('success');
  }
}

function updateCount(type) {
  db.update(`counts[${type}]`, n => n + 1).write();
}

exports.db = db;
exports.setInDb = setInDb;
