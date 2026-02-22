// utils/xmlHelper.js – read/write XML data files via xml2js
const fs   = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const DATA_DIR = path.join(__dirname, '..', 'data');

const parser  = new xml2js.Parser({ explicitArray: false });
const builder = new xml2js.Builder({ xmldec: { version: '1.0', encoding: 'UTF-8' } });

/**
 * Read and parse an XML file.
 * @param {string} filename  – e.g. 'users.xml'
 * @returns {Promise<object>} parsed JS object
 */
async function readXml(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const xml = fs.readFileSync(filePath, 'utf8');
  return parser.parseStringPromise(xml);
}

/**
 * Convert a JS object back to XML and persist it.
 * @param {string} filename
 * @param {object} data
 */
function writeXml(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  const xml = builder.buildObject(data);
  fs.writeFileSync(filePath, xml, 'utf8');
}

/**
 * Normalise users XML → always returns an array.
 */
async function getUsers() {
  const data = await readXml('users.xml');
  const raw  = data.users.user;
  return Array.isArray(raw) ? raw : [raw];
}

/**
 * Persist a modified users array back to XML.
 */
function saveUsers(usersArray) {
  writeXml('users.xml', { users: { user: usersArray } });
}

/**
 * Normalise records XML → always returns an array.
 */
async function getRecords() {
  const data = await readXml('records.xml');
  const raw  = data.records.record;
  return Array.isArray(raw) ? raw : [raw];
}

module.exports = { getUsers, saveUsers, getRecords };
