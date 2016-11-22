var path = require('path');
var url = require('url');
var archive = require('../helpers/archive-helpers');
var httpHelper = require('./http-helpers');

exports.handleRequest = function (req, res) {
  res.end(archive.paths.list);
};
