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
    key: String,
    value: {
      type: String,
      default: null
    }
  }],
  sponsors:
  [{
    user:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  verifications:
  [{
    user:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    },
    fields: [String],
    trusted: Boolean
  }]
});

module.exports = mongoose.model('User', schema);
