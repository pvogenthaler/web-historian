var path = require('path');
var fs = require('fs');
var http = require('http');
var archive = require('../helpers/archive-helpers');
var request = require('request');
var url = require('url');

exports.headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'content-type': 'text/html'
};

exports.serveAssets = function(res, asset, statusCode) {
  var headers = exports.headers;
  res.writeHead(statusCode, headers);
  res.end(asset);
};

exports.getHtml = function(url, callback) {
  request(url, function(err, res, body) {
    if (!err && res.statusCode === 200) {
      callback(body.toString());
    }
  });
};

exports.collectData = function(request, callback) {
  var data = '';
  request.on('data', function(chunk) {
    data += chunk;
  });
  request.on('end', function() {
    callback(data.slice(4));
  });

};

exports.sendFile = function(filePath, res, statusCode) {
  fs.readFile(filePath, function(err, content) {
    if (err) {
      console.log(err);
    } else {
      exports.serveAssets(res, content.toString(), statusCode);
    }
  });
};

exports.actionMap = {
  
  'GET': function(req, res) {
    var pathname = url.parse(req.url).pathname;
    
    if (pathname === '/') {
      var filePath = '/Users/student/hrsf51-web-historian/web/public/index.html';
      exports.sendFile(filePath, res, 200);
    } else if (pathname === '/styles.css') {
      var filePath = '/Users/student/hrsf51-web-historian/web/public/styles.css';
      exports.sendFile(filePath, res, 200);
    } else {
      var filePath = archive.paths.archivedSites + '/' + pathname;
      archive.isUrlArchived(pathname, function(isArchived) {
        
        if (isArchived) {
          exports.sendFile(filePath, res, 200);
        } else { //url is not archived
          exports.serveAssets(res, null, 404);
        }
      });
    }
  },
  
  'POST': function(req, res) {
    var pathname = url.parse(req.url).pathname;
    var site;

    if (pathname === '/') {
      exports.collectData(req, function(parsedData) {
        site = parsedData;
        archive.isUrlInList(site, function(urlIsInList) {
          
          if (urlIsInList) {
            archive.isUrlArchived(site, function(urlIsArchived) {
              
              if (urlIsArchived) {
                var filePath = archive.paths.archivedSites + '/' + site;
                exports.sendFile(filePath, res, 302);
              
              } else { // url is not in the archive
                var filePath = '/Users/student/hrsf51-web-historian/web/public/loading.html';
                exports.sendFile(filePath, res, 302);
              }
            });
          
          } else { //url is not in list
            var filePath = '/Users/student/hrsf51-web-historian/web/public/loading.html';
            exports.sendFile(filePath, res, 302);
            archive.addUrlToList(site, function () {} );
          }
        });
      });
    }
    var filePath = archive.paths.list;
    fs.readFile(filePath, function(err, content) {
      if (err) {
        console.log(err);
      } else {
        content = content.toString().split('\n');
        archive.downloadUrls(content);
      }
    });

  },
  
  'OPTIONS': function(req, res) {
    exports.serveAssets(res, null, 200);
  }
};

// As you progress, keep thinking about what helper functions you can put here!
