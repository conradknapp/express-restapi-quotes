const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
// allows you to adjust how files get stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().toISOString()}${file.originalname}`);
  }
});

// filters out files uploaded that are not .jpg or .png
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

// Init multer; specifies place where multer will upload files (multer automatically creates it), or can pass storage object (to let us specify more detailed name/destination info on file upload)
const upload = multer({ 
  storage, 
  limits: {
    // stores files only up to 5mb
    fileSize: 1024 * 1024 * 5
  }, 
  fileFilter
});

// bring in Quote model
const Quote = require('../models/quote');

router.get('/', (req, res, next) => {
  Quote.find()
  // .select() returns only gets the fields we specify
    .select('author text authorImage _id')
    .exec()
    .then(docs => {
      // changing the default data (i.e. _v, etc.) into a more comprehensible response
      const response = {
        count: docs.length,
        quotes: docs.map(doc => {
          return {
            author: doc.author,
            text: doc.text,
            authorImage: doc.authorImage,
            id: doc._id,
            request: {
              type: 'GET',
              url: `http://localhost:3030/quotes/${doc._id}`
            }
          }
        })
      }
      res.status(200).json(response);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: err});
    })
});

router.post('/', upload.single('authorImage'), (req, res, next) => {
  // 'req.file' is an object available through upload.single()
  console.log(req.file);
  const quote = new Quote({
    _id: new mongoose.Types.ObjectId(),
    author: req.body.author,
    text: req.body.text,
    // we use req.file to get the url of the image
    authorImage: req.file.path
  });
  quote.save().then(result => {
    console.log(result);
    res.status(201).json({
      message: 'Created quote successfully',
      createdQuote: {
        author: result.author,
        text: result.text,
        _id: result._id,
        request: {
          type: 'GET',
          url: `http://localhost:3030/quotes/${result._id}`
        }
      }
    });
  })
  .catch(err => {
    console.error(error);
    res.status(500).json({
      error: err
    });
  });
});

router.get('/:quote_id', (req, res, next) => {
  const id = req.params.quote_id;
  Quote.findById(id)
    .select('author text _id')
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json({
          quote: doc,
          request: {
            type: 'GET',
            url: `http://localhost:3030/quotes/${id}`
          }
        });
      } else {
        // if we provided a valid id format, but there is no corresponding entry in db
        res.status(404).json({message: "No entry for given id"});
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
});

router.patch('/:quote_id', (req, res, next) => {
  const id = req.params.quote_id;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Quote.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(doc => {
      res.status(200).json({
        message: 'Quote updated',
        request: {
          type: 'GET',
          url: `http://localhost:3030/quotes/${id}`
        }
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err });
    })
});

router.delete('/:quote_id', (req, res, next) => {
  const id = req.params.quote_id;
  Quote.remove({ _id: id })
    .exec()
    .then(doc => {
      res.status(200).json({
        message: 'Quote deleted',
        request: {
          type: 'POST',
          url: 'http://localhost:3030/quotes',
          reqFormat: { author: 'String', text: 'String' }
        }
      });
    })
    .catch(err => {
      console.error(err);
      res.status(404).json({ error: err });
    });
});

module.exports = router;