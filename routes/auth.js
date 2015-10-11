var User = require('../models/users');
var twilio = require('twilio');
var util = require("../models/util");



exports.auth = function(req, res, next){
  res.header('Content-Type', 'text/xml');

  User.findOne({"phone":req.body.From}, function(err, user){
    if (user === null && req.body.Body.toUpperCase() == "REGISTER"){
      console.log("here!");
      user = new User();
      req.action = {
        verb: "register",
        key: "register",
        phone: req.body.From,
        data: null
      };
      req.user = user;
      next();
    }
    else if(user === null){
      var twiml = new twilio.TwimlResponse();
      console.log("User does not exist");
      twiml.message("You've reached IDHero, one ID to rule them all. We see you don't have an account. Type REGISTER to join the revolution now.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
    else{
      var twiml = new twilio.TwimlResponse();
      req.user = user;
      req.action = {};
      console.log(req.body.Body.split(' ')[0].toUpperCase());
      switch (req.body.Body.split(' ')[0].toUpperCase()) {
        case "HERO":
          twiml.message(util.texts.hero1);
          twiml.message(util.texts.hero2);
          twiml.message(util.texts.hero3);
          res.writeHead(200, {'Content-Type': 'text/xml'});
          res.end(twiml.toString());
          break;
        case "NAME":
          req.action = {
            verb: "upsert",
            key: "name",
            phone: req.body.From,
            data: req.body.Body.substring(5,req.body.Body.length)
          };
          next();
          break;
        case "DOB":
          req.action = {
            verb: "upsert",
            key: "dob",
            phone: req.body.From,
            data: req.body.Body.substring(4, req.body.Body.length)
          };
          next();
          break;
        case "HEIGHT":
          req.action = {
            verb: "upsert",
            key: "height",
            phone: req.body.From,
            data: req.body.Body.substring(7, req.body.Body.length)
          };
          next();
          break;
        case "VERIFY":
          req.action = {
            verb: "verify",
            key: "verify",
            phone: req.body.From,
            data: req.body.Body.substring(7, req.body.Body.length)
          };
          twiml.message(util.texts.verifyS(req.action.data));
          next();
          break;
        case "PROFILE":
          req.action = {
            key: "profile",
            phone: req.body.From,
            data: req.body.Body.substring(8, req.body.Body.length)
          };
          next();
          break;
        case "CONFIRM":
          req.action = {
            verb: "confirm",
            key: "confirm",
            phone: req.body.From,
            data: req.body.Body.substring(8, req.body.Body.length)
          };
          next();
          break;
        default:
          twiml.message("default called");
          req.action = {
            key: "help",
            phone: req.body.From,
            data: req.body.Body
          };
          next();
          break;
      }
    }
  });
};
