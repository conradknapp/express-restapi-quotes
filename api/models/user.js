const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String, 
    required: true,
    // the 'unique' field helps to MongoDB to search for emails, it does not validate
    unique: true
    // we can also add in a 'match' field which takes a regex, which can do additional validation (will throw an error if the email provided doesn't match regex)
  },
  password: {
    type: String, 
    required: true
  }
});

module.exports = mongoose.model('User', UserSchema);