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
    commandParse = require('./routes/parse'),
    interface = require('./routes/interface'),
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

router.post('/', commandParse.auth, interface.process);

// For web UI implmentation
router.post('/search', function(req, res) {

});

// START THE SERVER
app.use("/", router);
app.listen(port);
console.log('Magic happens on port ' + port);
