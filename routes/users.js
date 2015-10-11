var Users = require("../models/users");
var twilio = require('twilio');
var twiml = new twilio.TwimlResponse();
var util = require("../models/util");

function addData(req, res){
  if (req.action.key in req.user.data){
    console.log("Already exists");
    util.breakValidate(req.user, req.action.key);
  }
  else {
    req.user.data[req.action.key] = req.action.data;
  }

  req.user.markModified('data');
  req.user.save(function(err, user){
    if (err) console.log(err);
    else {
      twiml.message(util.texts.nameS(req.action.data));
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
  });

}

exports.process = function(req, res){
  if (req.action.key == "register"){
    req.user.phone = req.action.phone;
    req.user.save(function(err, user){
      if (err) console.log(err);
      else{
        twiml.message(util.texts.registerS);
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
      }
    });
  }
  if (req.action.verb == "upsert"){
    addData(req,res);
  }
};

exports.verify = function(req, res){


};

exports.getProfile = function(req, res){

};
