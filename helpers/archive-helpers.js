var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var httpHelpers = require('../web/http-helpers.js');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  fs.readFile(exports.paths.list, function(err, data) {
    data = data.toString().split('\n');
    callback(data);
  });
};

exports.isUrlInList = function(url, callback) {
  exports.readListOfUrls(function(data) {
    if (data.indexOf(url) !== -1) {
      callback(true);
    } else {
      callback(false);
    }
  });
};

exports.addUrlToList = function(url, callback) {
  fs.appendFile(exports.paths.list, url, callback);
};

exports.isUrlArchived = function(url, callback) {
  var pathname = exports.paths.archivedSites + '/' + url;
  try {
    if (fs.lstatSync(pathname).isFile()) {
      callback(true);
    }
  } catch (error) {
    callback(false);
  }
};

exports.downloadUrls = function(list) {
  list.forEach(function(url) {
    exports.isUrlArchived(url, function(bool) {
      if (!bool) {
        var pathname = exports.paths.archivedSites + '/' + url;
        httpHelpers.getHtml('http://' + url, function(body) { 
          fs.writeFile(pathname, body, function(err) {
            if (err) {
              console.log(err);
            }
          });
        });
      }
    });
  });
};

