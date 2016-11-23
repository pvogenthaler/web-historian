var path = require('path');
var url = require('url');
var archive = require('../helpers/archive-helpers');
var httpHelper = require('./http-helpers');

exports.handleRequest = function (req, res) {
  var action = httpHelper.actionMap[req.method];
  if (action) {
    action(req, res);
  } else {
    httpHelper.serveAssets(res, '', 404);
  }
};
