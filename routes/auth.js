var User = require('../models/users');
var twilio = require('twilio');
var twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);



exports.auth = function(req, res, next){
  res.header('Content-Type', 'text/xml');
  var twiml = new twilio.TwimlResponse();

  User.findOne({"phone":req.body.From}, function(err, user){
    if (user === null && req.body.Body.toUpperCase() == "REGISTER"){
      req.user = new User();
      req.action = {
        key: "register",
        phone: req.body.From,
        data: null
      };
    }
    else if(user === null){
      console.log("User does not exist");
      twiml.message("Your user does not exist. Please type REGISTER to register first");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
    else{
      req.user = user;
      req.action = {};
      console.log(req.body.Body.split(' ')[0].toUpperCase());
      switch (req.body.Body.split(' ')[0].toUpperCase()) {
        case "HERO":
          twiml.message('Help activated');
          next();
          break;
        case "NAME":
          twiml.message("Name asked");
          req.action = {
            key: "name",
            phone: req.body.From,
            data: req.body.Body.substring(4,req.body.Body.length)
          };
          next();
          break;
        case "DOB":
          twiml.message("DOB asked");
          req.action = {
            key: "dob",
            phone: req.body.From,
            data: req.body.Body.substring(3, req.body.Body.length)
          };
          next();
          break;
        case "HEIGHT":
          twiml.message("Height added");
          req.action = {
            key: "height",
            phone: req.body.From,
            data: req.body.Body.substring(6, req.body.Body.length)
          };
          next();
          break;
        case "VERIFY":
          twiml.message("Verify called");
          req.action = {
            key: "verify",
            phone: req.body.From,
            data: req.body.Body.substring(6, req.body.Body.length)
          };
          next();
          break;
        case "PROFILE":
          twiml.message("profile called");
          req.action = {
            key: "profile",
            phone: req.body.From,
            data: req.body.Body.substring(7, req.body.Body.length)
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

    //   if(textInput[0].toUpperCase() == "HERO"){
    //       console.log("HELP code executed");
    //       twiml.message('REGISTER to create your account. NAME <FirstNameLastName> to add your name.');
    //       twiml.message('DOB <Month-Day-Year> to add your date of birth. HEIGHT <#height> to add your height.');
    //       twiml.message('VERIFY <#PhoneNumber> to ask for the phonenumber owner to verify you. PROFILE to see your stored info.');
    //
    //   } else if(textInput[0].toUpperCase() == "REGISTER"){
    //       if (textInput.length == 1) {
    //           twiml.message("Thank you, your account has been created. Your ID is your phone number.");
    //       //var data = new Data();
    //       //data.key = "name";
    //       //data.data = textInput[1];
    //       //console.log(data.data);
    //       } else {
    //           twiml.message("Thank you, your account has been created. Your ID is your phone number.");
    //       }
    //
    //
    //       //twiml.message('Thanks, your message of "' + body + '" was received!');
    //   } else if(textInput[0].toUpperCase() == "NAME"){
    //       if (textInput.length > 1) {
    //       twiml.message("Your name is recorded as " + textInput.splice(1, textInput.length).join(' ') + ". You are still awaiting for verification.");
    //       name = textInput.splice(1, textInput.length).join(' ');
    //       //var data = new Data();
    //       //data.key = "name";
    //       //data.data = textInput[1];
    //       //console.log(data.data);
    //       } else {
    //           twiml.message('Please enter your NAME in the correct format: NAME "FirstNameLastName" (without the quotes)');
    //       }
    //
    //   } else if(textInput[0].toUpperCase() == "DOB"){
    //       if (textInput.length == 2 && textInput[1][2] == '-' && util.isNumeric(textInput[1][0]))  {
    //       twiml.message("Your date of birth is recorded as " + textInput[1] + ". You are still awaiting for verification.");
    //       dob = textInput[1];
    //       //var data = new Data();
    //       //data.key = "name";
    //       //data.data = textInput[1];
    //       //console.log(data.data);
    //       } else {
    //           twiml.message('Please enter your Date Of Birth in the correct format: DOB "MM-DD-YY" (without the quotes)');
    //       }
    //   } else if(textInput[0].toUpperCase() == "HEIGHT"){
    //       if (textInput.length == 2 && util.isNumeric(textInput[1][0])) {
    //       twiml.message("Your height is recorded as " + textInput[1] + ". You are still awaiting for verification.");
    //       height = textInput[1];
    //       //var data = new Data();
    //       //data.key = "name";
    //       //data.data = textInput[1];
    //       //console.log(data.data);
    //       } else {
    //           twiml.message('Please enter your HEIGHT in the correct format: HEIGHT "#height" (without the quotes in number format)');
    //       }
    //   } else if(textInput[0].toUpperCase() == "VERIFY"){
    //       if (textInput.length == 2 && util.isNumeric(textInput[1][0])) {
    //       twiml.message("You have asked for verification from this number" + textInput[1] + ". Wait for verification.");
    //       //var data = new Data();
    //       //data.key = "name";
    //       //data.data = textInput[1];
    //       //console.log(data.data);
    //       } else {
    //           twiml.message('Please enter in the correct format: VERIFY "#PhoneNumber" (without the quotes in number format)');
    //       }
    //   } else if(textInput[0].toUpperCase() == "PROFILE"){
    //       if (textInput.length == 1 ) {
    //       twiml.message("Here is your PROFILE: Name: " +name + ". Date Of Birth: " + dob + ". Height: " + height + ".");
    //       //var data = new Data();
    //       //data.key = "name";
    //       //data.data = textInput[1];
    //       //console.log(data.data);
    //       }
    //   }  else {
    //       twiml.message('Input not valid. Please enter HERO to get a list of valid commands.');
    //   }
    //
    // }
