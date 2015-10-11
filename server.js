// server.js

try {
    require('dotenv').load();
    console.log("true");
} catch(ex) {
    console.log(ex);
}


// call the packages we need
var express    = require('express'),        // call express
    app        = express(),                 // define our app using express
    mongoose   = require('mongoose'),
    IDhero = require('./routes/auth'),
    users = require('./routes/users'),
    bodyParser = require('body-parser'),
    cors       = require('cors'),
    http = require('http'),
    twilio = require('twilio');
    var twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// UTILITIES
var util = require("./models/util");

// Setup Mongoose
mongoose.connect(process.env.MONGOLAB_URI, function(err) {
       if (err) {
           console.log("DB error!");
            throw err;
        }
});

// Load Models
var User = require('./models/users');

// configure app to use bodyParser()
// this will let us get the data from a POST

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb'}));
app.use(bodyParser.json());
app.use(cors());

var port = process.env.PORT || 8080;        // set our port

var router = express.Router();

router.get('/', function(req, res) {
    res.json({ message: 'APIv1' });
});

router.post('/search', function(req, res) {

        // Sending a example JSON/
        console.log(req.body.idSearch);
        res.json({
            phone:"+1 646 421 96 94",
            name: 'Batu Aytemiz',
            dob: "05-31-95",
            height: "172"
        });
    });


router.post('/', function(req, res) {
     var body = "";
     var textInput;

  req.on('data', function(data) {
    body += data;
  });

  req.on('end', function() {
    //Create TwiML response
    var twiml = new twilio.TwimlResponse();
    textInput = parseBody(body);
    textInput = textInput.split(' ');

    var name = "NotAvailable";
    var dob = "NotAvailable";
    var height = "NotAvailable";


    if(textInput[0].toUpperCase() == "HERO"){
        console.log("HELP code executed");
        twiml.message('REGISTER to create your account. NAME <FirstNameLastName> to add your name.');
        twiml.message('DOB <Month-Day-Year> to add your date of birth. HEIGHT <#height> to add your height.');
        twiml.message('VERIFY <#PhoneNumber> to ask for the phonenumber owner to verify you. PROFILE to see your stored info.');

    } else if(textInput[0].toUpperCase() == "REGISTER"){
        if (textInput.length == 1) {
            twiml.message("Thank you, your account has been created. Your ID is your phone number.");
        //var data = new Data();
        //data.key = "name";
        //data.data = textInput[1];
        //console.log(data.data);
        } else {
            twiml.message("Please do not any other keywords next to REGISTER");
        }


        //twiml.message('Thanks, your message of "' + body + '" was received!');
    } else if(textInput[0].toUpperCase() == "NAME"){
        if (textInput.length > 1) {
        twiml.message("Your name is recorded as " + textInput.splice(1, textInput.length).join(' ') + ". You are still awaiting for verification.");
        name = textInput.splice(1, textInput.length).join(' ');
        //var data = new Data();
        //data.key = "name";
        //data.data = textInput[1];
        //console.log(data.data);
        } else {
            twiml.message('Please enter your NAME in the correct format: NAME "FirstNameLastName" (without the quotes)');
        }

    } else if(textInput[0].toUpperCase() == "DOB"){
        if (textInput.length == 2 && textInput[1][2] == '-' && util.isNumeric(textInput[1][0]))  {
        twiml.message("Your date of birth is recorded as " + textInput[1] + ". You are still awaiting for verification.");
        dob = textInput[1];
        //var data = new Data();
        //data.key = "name";
        //data.data = textInput[1];
        //console.log(data.data);
        } else {
            twiml.message('Please enter your Date Of Birth in the correct format: DOB "MM-DD-YY" (without the quotes)');
        }
    } else if(textInput[0].toUpperCase() == "HEIGHT"){
        if (textInput.length == 2 && util.isNumeric(textInput[1][0])) {
        twiml.message("Your height is recorded as " + textInput[1] + ". You are still awaiting for verification.");
        height = textInput[1];
        //var data = new Data();
        //data.key = "name";
        //data.data = textInput[1];
        //console.log(data.data);
        } else {
            twiml.message('Please enter your HEIGHT in the correct format: HEIGHT "#height" (without the quotes in number format)');
        }
    } else if(textInput[0].toUpperCase() == "VERIFY"){
        if (textInput.length == 2 && util.isNumeric(textInput[1][0])) {
        twiml.message("You have asked for verification from this number" + textInput[1] + ". Wait for verification.");
        //var data = new Data();
        //data.key = "name";
        //data.data = textInput[1];
        //console.log(data.data);
        } else {
            twiml.message('Please enter in the correct format: VERIFY "#PhoneNumber" (without the quotes in number format)');
        }
    } else if(textInput[0].toUpperCase() == "PROFILE"){
        if (textInput.length == 1 ) {
        twiml.message("Here is your PROFILE: Name: " +name + ". Date Of Birth: " + dob + ". Height: " + height + ".");
        //var data = new Data();
        //data.key = "name";
        //data.data = textInput[1];
        //console.log(data.data);
        }
    }  else {
        twiml.message('Input not valid. Please enter HERO to get a list of valid commands.');
    }
    //twiml.message('Thanks, your message of "' + body + '" was received!');

   res.writeHead(200, {'Content-Type': 'text/xml'});
   res.end(twiml.toString());
   });
});


// function parseBody(textClump){
//     var text = textClump;
//     var body = "";
//     var indexStart = 0;
//     var indexEnd = 0;
//
//     for (var i = 0; i  <= text.length - 6; i++) {
//         if(text.slice(i, i+5) == "&Body"){
//             indexStart = i + 6;
//             break;
//         }
//
//     }
//     for ( i = indexStart; i < text.length; i++) {
//         if (text[i] == '&'){
//             indexEnd = i;
//             break;
//         }
//     }
//     body = text.slice(indexStart,indexEnd);
//     cleanBody = body.split('+').join(' ');
//     console.log(cleanBody);
// }

// START THE SERVER
app.use("/",router);
app.listen(port);
console.log('Magic happens on port ' + port);
