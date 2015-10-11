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
    //mongoose   = require('mongoose'),
    //bodyParser = require('body-parser'),
    //cors       = require('cors'),
    //PlanBear = require('./routes/auth'),
    //users = require('./routes/users'),
    //plans = require('./routes/plan'),
    //smsauth = require('./routes/twilio'),
    bodyParser = require('body-parser'),
    cors       = require('cors'),
    //qs = require('querystring'),
    http = require('http'),
    twilio = require('twilio');
    var twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


/*
twilio.messages.create({
    to: "+1 646 421 96 94",
    from: "+15852964537",
    body: "TEST",
}, function(err, message) {
    console.log(message.sid);
});
*/

// UTILITIES
// Load Mongo URI from .env for local development

// Load Models
//var User = require('./models/user'),
    //Plan = require('./models/plan'),
    //SMSAuth = require('./models/sms-auth');

// configure app to use bodyParser()
// this will let us get the data from a POST
/*
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb'}));
app.use(bodyParser.json());
app.use(cors());
*/

var port = process.env.PORT || 8080;        // set our port



var router = express.Router();

router.get('/', function(req, res) {
    res.json({ message: 'APIv1' });
});





router.post('/', function(req, res) {
     var body = "";
     var textInput = "";

  req.on('data', function(data) {
    body += data;
  });

  req.on('end', function() {
    //Create TwiML response
    var twiml = new twilio.TwimlResponse();
    
    textInput = parseBody(body);
    textInput = textInput.split();

    if(textInput[0].toUpperCase() == "REGISTER"){
        console.log(textInput[0]);
    }
    twiml.message('Thanks, your message of "' + body + '" was received!');

   res.writeHead(200, {'Content-Type': 'text/xml'});
   res.end(twiml.toString());
   });
});

function parseBody(textClump){
    var text = textClump;
    var body = "";
    var indexStart = 0;
    var indexEnd = 0;

    for (var i = 0; i  <= text.length - 6; i++) {
        if(text.slice(i, i+5) == "&Body"){
            indexStart = i + 6;
            break;
        }

    }
    for ( i = indexStart; i < text.length; i++) {
        if (text[i] == '&'){
            indexEnd = i;
            break;
        }
    }
    body = text.slice(indexStart,indexEnd);
    cleanBody = body.split('+').join(' ');
    return(cleanBody);
}

// START THE SERVER
app.use("/",router);
app.listen(port);
console.log('Magic happens on port ' + port);





/*

// =============================================================================

twilioClient.sendMessage({

    to:'+16464219694', // Any number Twilio can deliver to
    from: '+15852964537', // A number you bought from Twilio and can use for outbound communication
    body: 'word to your mother.' // body of the SMS message

}, function(err, responseData) { //this function is executed when a response is received from Twilio

    if (!err) { // "err" is an error received during the request, if any

        // "responseData" is a JavaScript object containing data received from Twilio.
        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

        console.log(responseData.from); // outputs "+14506667788"
        console.log(responseData.body); // outputs "word to your mother."

    }
});

// SMS Auth
router.post('/verify', smsauth.getcode);
router.get('/verify/:id/:code', smsauth.verify);


// Setup Mongoose
mongoose.connect(process.env.MONGOLAB_URI, function(err) {
        if (err) {
            console.log("DB error!");
            throw err;
        }
});

//Users
router.post('/users', users.create);
router.get('/users/:id', PlanBear.auth, users.fetch);
router.put('/users/:id', PlanBear.auth, users.update);
router.post('/users/:id/rating', PlanBear.auth, users.rating);
router.post('/users/:id/report', PlanBear.auth, users.report);
router.get('/users/:id/photo', users.photo);

//Plans
router.post('/plans', PlanBear.auth, plans.create);
router.get('/plans', PlanBear.auth, plans.fetch);
router.get('/plans/:id', PlanBear.auth, plans.fetchOne);
router.post('/plans/:id', PlanBear.auth, plans.join);
router.post('/plans/:id/comments', PlanBear.auth, plans.comments);

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);


app.post('/', function(request, response) {
    if (twilio.validateExpressRequest(request, config.twilio.key, {url: config.twilio.smsWebhook}) || config.disableTwilioSigCheck) {
        response.header('Content-Type', 'text/xml');
        var body = request.param('Body').trim();

        // the number the vote it being sent to (this should match an Event)
        var to = request.param('To');

        // the voter, use this to keep people from voting more than once
        var from = request.param('From');

        events.findBy('phonenumber', to, function(err, event) {
            if (err) {
                console.log(err);
                // silently fail for the user
                response.send('<Response></Response>');
            }
            else if (event.state == "off") {
                response.send('<Response><Sms>Voting is now closed.</Sms></Response>');
            }
            else if (!utils.testint(body)) {
                console.log('Bad vote: ' + event.name + ', ' + from + ', ' + body);
                response.send('<Response><Sms>Sorry, invalid vote. Please text a number between 1 and '+ event.voteoptions.length +'</Sms></Response>');
            }
            else if (utils.testint(body) && (parseInt(body, 10) <= 0 || parseInt(body,10) > event.voteoptions.length)) {
                console.log('Bad vote: ' + event.name + ', ' + from + ', ' + body + ', ' + ('[1-'+event.voteoptions.length+']'));
                response.send('<Response><Sms>Sorry, invalid vote. Please text a number between 1 and '+ event.voteoptions.length +'</Sms></Response>');
            }
            else if (events.hasVoted(event, from)) {
                console.log('Denying vote: ' + event.name + ', ' + from);
                response.send('<Response><Sms>Sorry, you are only allowed to vote once.</Sms></Response>');
            }
            else {

                var vote = parseInt(body,10);

                events.saveVote(event, vote, from, function(err, res) {
                    if (err) {
                        response.send('<Response><Sms>We encountered an error saving your vote. Try again?</Sms></Response>');
                    }
                    else {
                        console.log('Accepting vote: ' + event.name + ', ' + from);
                        response.send('<Response><Sms>Thanks for your vote for ' + res.name + '. Powered by Twilio.</Sms></Response>');
                    }
                });
            }
        });
    }
    else {
        response.statusCode = 403;
        response.render('forbidden');
    }
});

*/
