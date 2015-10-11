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
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  level: {
    type: Number,
    default: 0
  },
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
    fields: [{
      type: String,
      default: all
    }],
    state: 0
  }]
});

module.exports = mongoose.model('User', schema);
