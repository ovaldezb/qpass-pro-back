'use strict'

const mongoose = require('mongoose');

const bulkDB = (mongoUri)=>{
  mongoose.connect(mongoUri,{useNewUrlParser: true,
    useUnifiedTopology: true});
  return {

  }
};

module.exports = bulkDB;