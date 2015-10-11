var User = require('../models/user');


exports.auth = function(req, res, next){
  response.header('Content-Type', 'text/xml');

  var body = request.param('Body').trim();
  var from = req.param('From');
  User.findOne({"phone":from}, function(err, user){
    if (err && body == "REGISTER"){
      req.user = new User();

      req.user.phone = from;

      next();
    }
    else{
      req.user = user;
    }
  });
};
