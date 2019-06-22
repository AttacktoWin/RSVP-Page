var express = require('express');
var router = express.Router();
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const mongoose = require('mongoose');
const uri = "mongodb+srv://<user>:<pass>@mongourl";
mongoose.connect(uri, { useNewUrlParser: true, useFindAndModify: false});
const db = mongoose.connection;

var Schema = mongoose.Schema;
var peopleSchema = new Schema({
  name: String,
  hindu: Boolean,
  civil: Boolean,
  dance: Boolean
});
var groupSchema = new Schema({
  name: String,
  main: String,
  members: Number,
  requests: [String],
  hindu: Boolean,
  civil: Boolean,
  people: [peopleSchema]
});
var groupModel = mongoose.model('group', groupSchema, 'groups');

var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'RSVP | Husak & Bhatrimony' });
});

router.get('/search/:term', function(req, res) {
  // query database files
  var query = {name: new RegExp(req.params.term, 'i')};

  groupModel.find(query).exec((err, result) => {
    if (err) throw err;
    var data = result;
    data = JSON.stringify(data);
    res.send(data);
  });

  
});

router.get('/group/:groupId', function (req, res, next) {
  // Render group page by id
  try {
    // MONGO Connect
    groupModel.findById(req.params.groupId, '_id name requests hindu civil people').exec((err, result) => {
      res.render('group', { title: "" + result.name + " Family | Husak & Bhatrimony", group: result});
    });
  } catch (err) {
    fs.writeFile(__dirname + `/../log/${Date.now()}.txt`, err, (err) => {
      if (err) throw err;
      console.log('ERROR LOGGED');
      res.render('groupError', {title: "Oops! | Husak & Bhatrimony"})
    });
  }
});

router.get('/group/:groupId/add', function (req, res) {
  groupModel.findById(req.params.groupId, 'requests', (err, result) => {
    if (err) throw err;
    requests = result;
    res.send(result);
  });
});

router.get('/group/:groupId/add/:song', function (req, res) {
  // Add new song to group requests
  groupModel.findByIdAndUpdate(req.params.groupId, {$addToSet: {requests: req.params.song}}, {new: true}, (err, result) => {
    if (err) throw err;
    res.send(result.requests);
  });
});

router.get('/group/:groupId/remove/:song', function (req, res, next) {
  // Remove Song from requests
  groupModel.findByIdAndUpdate(req.params.groupId, {$pull: {requests: req.params.song}}, {new: true}, (err, result) => {
    if (err) throw err;
    res.send(result.requests);
  });
});

router.post('/group/:groupId', body('group').isArray(), function (req, res) {
  req.body.group = JSON.parse(req.body.group);

  groupModel.findById(req.params.groupId)
    .exec((err, result) => {
      if (err) throw err;
      for (var i = 0; i < result.people.length; i++) {
        result.people[i].hindu = req.body.group[i].hindu;
        result.people[i].civil = req.body.group[i].civil;
        result.people[i].dance = req.body.group[i].dance;
      }
      result.save(err => {
        if (err) throw err;
        fs.writeFile(__dirname + `/../log/rsvp/${Date.now()}.txt`, `${req.params.groupId} has RSVPd`, (err) => {
          if (err) throw err;
        });
        res.sendStatus(200);
      });
    });
});

router.get('/finish', function(req, res) {
  res.render('finish', { title: 'Redirecting | Husak & Bhatrimony' });
});

module.exports = router;
