var express = require('express');
var router = express.Router();
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var groups = require('./groups/index.json');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'RSVP | Husak & Bhatrimony' });
});

router.get('/search/:term', function(req, res) {
  // query database files
  var data = [];

  for (var i = 0; i < groups.length; i++) {
    var name = groups[i].name.toLowerCase();

    if (name.includes(req.params.term)) {
      data.push(groups[i]);
    }
  }
  data = JSON.stringify(data);
  res.send(data);
});

router.get('/group/:groupId', function (req, res, next) {
  // Render group page by id
  var family = fs.readFileSync(__dirname + `/groups/${req.params.groupId}.json`);
  family = JSON.parse(family);
  res.render('group', { title: "" + groups[req.params.groupId].name + " Family | Husak & Bhatrimony", group: groups[req.params.groupId], members: family });
});

router.get('/group/:groupId/add', function (req, res) {
  res.send(groups[req.params.groupId].requests);
});

router.get('/group/:groupId/add/:song', function (req, res) {
  // Add new song to group requests
  var songs = groups[req.params.groupId].requests;
  var found = false;

  for (var i = 0; i < songs.length; i++) {
    if(req.params.song.toLowerCase() == songs[i].toLowerCase()) {
      found = true;
    }
  }
  if (found) {
    res.send(songs);
  } else {
      // songs.push(req.params.song);
      groups[req.params.groupId].requests.push(req.params.song);
      res.send(songs);
      fs.writeFileSync(__dirname + '/groups/index.json', JSON.stringify(groups));
  }
});

router.get('/group/:groupId/remove/:song', function (req, res, next) {
  // Remove Song from requests
  var songs = groups[req.params.groupId].requests;
  var found = false;
  for (var i = 0; i < songs.length; i++) {
    if (songs[i].toLowerCase() == req.params.song.toLowerCase()) {
      songs.splice(i, 1);
      groups[req.params.groupId].requests.splice(i, 1);
      res.send(songs);
      found = true;
      fs.writeFileSync(__dirname + '/groups/index.json', JSON.stringify(groups));
    }
  }
  if (!found) {
    res.send(songs);
  }
});

router.post('/group/:groupId', body('group').isArray(), function (req, res) {
  req.body.group = JSON.parse(req.body.group);

  var groupFile = fs.readFileSync(__dirname + `/groups/${req.params.groupId}.json`);
  groupFile = JSON.parse(groupFile);

  for (var i = 0; i < req.body.group.length; i++) {
    groupFile[i].hindu = req.body.group[i].hindu;
    groupFile[i].civil = req.body.group[i].civil;
    groupFile[i].dance = req.body.group[i].dance;
  }
  groupFile = JSON.stringify(groupFile);
  fs.writeFileSync(__dirname + `/groups/${req.params.groupId}.json`, groupFile);
});

router.get('/finish', function(req, res) {
  res.render('finish', { title: 'Redirecting | Husak & Bhatrimony' });
});

module.exports = router;
