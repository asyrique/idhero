var Users = require("../models/users");
var twilio = require('twilio');
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
      var twiml = new twilio.TwimlResponse();
      switch(req.action.key){
        case "name":
          twiml.message(util.texts.nameS(req.action.data));
          break;
        case "dob":
          twiml.message(util.texts.dobS(req.action.data));
          break;
        case "height":
          twiml.message(util.texts.heightS(req.action.data));
          break;
          default:
          break;
      }
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
  });
}

function verify(req, res){
  console.log("Called verify with" + req.action.data);
  Users.findOne({"phone":req.action.data}, function(err, user){
    console.log(req.action.data);
    if (user === "null") {
      var twiml = new twilio.TwimlResponse();
      twiml.message("This phone number is not within our Web of Trust (tm). Please find a friend who's an ID Hero to verify you."); // stretch suggest phone numbers
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
    else {
      req.user.verifications.push({user: user._id, fields: ["all"], state:0});
      req.user.save(function(err, user){
        if (err) console.log(err);
        else {
          client.sendMessage({
            to: req.action.data,
            from: "+15517774376",
            body: req.user.phone + " has just asked you to verify them. Text CONFIRM " + req.user.phone + " to confirm you know them."
          }, function(err, responseData){
            if (err) console.log(err);
          });
        }
      });
    }
  });
}

function confirm(req, res){
  console.log("called confirm with " + req.action.data);
  Users.findOne({"phone":req.action.data}, function(err, user){
    var twiml = new twilio.TwimlResponse();
    console.log(req.action.data);
    if (err) {
      twiml.message(req.action.data + " is not an ID Hero user."); // stretch suggest phone numbers
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
    else {
        var matchedUsers = user.verifications.filter(function(item){
          return String(item.user) == String(req.user._id);
        });
        if (matchedUsers.length !== 1){
          twiml.message("Sorry, we're experiencing a server error. Superheroes have been dispatched to fight it."); // stretch suggest phone numbers
          res.writeHead(200, {'Content-Type': 'text/xml'});
          res.end(twiml.toString());
        }
        else {
          user.verifications.forEach(function(item, index){
            if(String(item.user) == String(req.user._id)){
              user.verifications[index].state = 1;
              item.date = Date.now();
            }
          });
          user.save(function(err, user){
            if (err) console.log(err);
            else {
              client.sendMessage({
                to: req.action.data,
                from: process.env.TWILIO_NUMBER,
                body: req.user.phone + " has just verified you. Yay!"
              }, function(err, responseData){
                if (err) console.log(err);
              });
            }
          });
        }
    }
  });
}

function profile(req,res){
  var unique_code = Math.random().toString(36).substring(7);
  if (req.action.data !== ""){
    client.sendMessage({
      to: req.action.data,
      from: "+15517774376",
      body: req.user.phone + " has just granted you access to their profile.\n This transaction's unique IDHero code to verify is " + unique_code
    }, function(err, responseData){
      if (err) console.log(err);
    });
  }

  var twiml = new twilio.TwimlResponse();
  twiml.message("Here's your current profile in our system: " +
  "\nName: " + (req.user.data.name || "N/A" ) + "\n" +
  "D.O.B: " + (req.user.data.dob || "N/A" ) + "\n" +
  "Height: " + (req.user.data.height || "N/A") + "\n" +
  "Verified by " + (req.user.verifications.length) + " people\n" +
  "IDHero verification code: " + unique_code);
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}


exports.process = function(req, res){
  var twiml = new twilio.TwimlResponse();
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
  if (req.action.verb == "confirm"){
    confirm(req,res);
  }
  if (req.action.key == "profile"){
    profile(req,res);
  }
};
