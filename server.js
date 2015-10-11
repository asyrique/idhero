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
// Load Mongo URI from .env for local development

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


function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var port = process.env.PORT || 8080;        // set our port



var router = express.Router();

router.get('/', function(req, res) {
    res.json({ message: 'APIv1' });
});

router.post('/', function(req, res) {
    console.log(req.body);
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
            twiml.message("Thank you, your account has been created. Your ID is your phone number.");
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
        if (textInput.length == 2 && textInput[1][2] == '-' && isNumeric(textInput[1][0]))  {
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
        if (textInput.length == 2 && isNumeric(textInput[1][0])) {
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
        if (textInput.length == 2 && isNumeric(textInput[1][0])) {
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
    console.log(cleanBody);
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
