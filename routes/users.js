var Users = require("../models/users");
var twilio = require('twilio');
var twiml = new twilio.TwimlResponse();
var util = require("../models/util");
var client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

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

function verify(req, res){
  User.findOne({"phone":req.action.data}, function(err, user){
    if (err) {
      twiml.message("This phone number is not within our Web of Trust (tm). Please find a friend who's an ID Hero to verify you."); // stretch suggest phone numbers
    }
    else {
      req.user.verifications.push({user: user._id, fields: ["all"], state:0});
      req.user.save(function(err, user){
        if (err) console.log(err);
        else {
          client.sendMessage({
            to: req.action.data,
            from: "+15852964537",
            body: req.user.phone + " has just asked you to verify them. Text CONFIRM " + req.user.phone + " to confirm you know them."
          }, function(err, responseData){
            if (err) console.log(err);
          });
        }
      });
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
  if (req.action.verb == "verify"){
    verify(req,res);
  }
};

exports.getProfile = function(req, res){

};
