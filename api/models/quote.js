const mongoose = require('mongoose');

const QuoteSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  author: {
    type: String, 
    required: true
  },
  text: {
    type: String, 
    required: true
  },
  authorImage: { 
    type: String, 
    required: false 
  }
});

module.exports = mongoose.model('Quote', QuoteSchema);