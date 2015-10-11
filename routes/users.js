var Users = require("../models/users");

exports.addData = function(req, res){

  if (Users.findOne())
  req.user.data.push({key: req.data.key, value: req.data.value});

};

exports.verify = function(req, res){

};

exports.getProfile = function(req, res){

};
