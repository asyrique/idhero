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

router.post('/', IDhero.auth, function(req, res) {
    console.log(req.body);

    req.on('end', function() {
    //Create TwiML response
      var twiml = new twilio.TwimlResponse();

      var name = "NotAvailable";
      var dob = "NotAvailable";
      var height = "NotAvailable";



    //twiml.message('Thanks, your message of "' + body + '" was received!');
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
