mongoose = require('mongoose');

var schema = new mongoose.Schema(
  {
    key: String,
    data: [Schema.Types.Mixed]
  }, {strict:false}
);

module.exports = mongoose.model('Data', schema);
