mongoose = require('mongoose');

var schema = new mongoose.Schema(
{
  phone: {
    type: String,
    unique: true
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
