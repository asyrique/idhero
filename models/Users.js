mongoose = require('mongoose');

var schema = new mongoose.Schema(
{
  username: {
    type: String,
    unique: true
  },
  passphrase: {
    type: String,
    select: false
  },
  joined:{
      type: Date,
      default: Date.now
  },
  data: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Data'
  }],
  sponsors:
  [{
    user:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
});

module.exports = mongoose.model('User', schema);
