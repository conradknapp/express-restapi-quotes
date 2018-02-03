// bring in Quote model
const Quote = require("../models/quote");
const mongoose = require("mongoose");

exports.quotes_get_all = (req, res, next) => {
  Quote.find()
    // .select() returns only gets the fields we specify
    .select("author text authorImage _id")
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
              type: "GET",
              url: `http://localhost:3030/quotes/${doc._id}`
            }
          };
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err });
    });
};

exports.quotes_create_quote = (req, res, next) => {
  // 'req.file' is an object available through upload.single()
  const quote = new Quote({
    _id: new mongoose.Types.ObjectId(),
    author: req.body.author,
    text: req.body.text
    // we use req.file to get the url of the image
  });
  quote
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Created quote successfully",
        createdQuote: {
          author: result.author,
          text: result.text,
          _id: result._id,
          request: {
            type: "GET",
            url: `http://localhost:3030/quotes/${result._id}`
          }
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};

exports.quotes_get_quote = (req, res, next) => {
  const id = req.params.quote_id;
  Quote.findById(id)
    .select("author text _id")
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json({
          quote: doc,
          request: {
            type: "GET",
            url: `http://localhost:3030/quotes/${id}`
          }
        });
      } else {
        // if we provided a valid id format, but there is no corresponding entry in db
        res.status(404).json({ message: "No entry for given id" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.quotes_update_quote = (req, res, next) => {
  const id = req.params.quote_id;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Quote.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(doc => {
      res.status(200).json({
        message: "Quote updated",
        request: {
          type: "GET",
          url: `http://localhost:3030/quotes/${id}`
        }
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err });
    });
};

exports.quotes_delete_quote = (req, res, next) => {
  const id = req.params.quote_id;
  Quote.remove({ _id: id })
    .exec()
    .then(doc => {
      res.status(200).json({
        message: "Quote deleted",
        request: {
          type: "POST",
          url: "http://localhost:3030/quotes",
          reqFormat: { author: "String", text: "String" }
        }
      });
    })
    .catch(err => {
      console.error(err);
      res.status(404).json({ error: err });
    });
};
