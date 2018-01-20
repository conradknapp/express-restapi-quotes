const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const keys = require('./config/keys');
const quoteRoutes = require('./api/routes/quotes');

mongoose.connect(keys.mongoURI);

// adds useful logging in the terminal, gives us info about our requests
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
// will extract json data and makes it readable
app.use(bodyParser.json());

// append headers to any response we give back to resolve potential CORS issues; will makes sure all responses have this header
app.use((req, res, next) => {
  // * gives access to any origin, which is typical of REST APIs
  res.header('Access-Control-Allow-Origin', '*');
  // to define which headers can be sent with the request
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// anything starting with /quotes in the url will be forwarded to the quoteRoutes file
app.use('/quotes', quoteRoutes);

// middleware that will catch errors here if no fitting route was found
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

// uses error-first handling to potential errors possibly from anywhere in the app; this middleware will be called by next once an error is thrown
app.use((error, req, res, next) => {
  // we either send back the status code the error has or assign it a 500 code
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  });
});

const port = process.env.PORT || 3030;

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});