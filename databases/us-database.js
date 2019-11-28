const mongoose = require('mongoose');

module.exports = () => new Promise((resolve, reject) => {

  mongoose.Promise = global.Promise;

  mongoose.connect('mongodb://localhost/US-PA', {useNewUrlParser: true, useUnifiedTopology: true});

  mongoose.connection.on('connected', function(){
      console.log('Mongoose default connection is open');
      resolve(mongoose);
  });

  mongoose.connection.on('error', function(err){
      reject(err);
  });

  mongoose.connection.on('disconnected', function(){
      console.log('Mongoose default connection is disconnected');
  });

  process.on('SIGINT', function(){
      mongoose.connection.close(function(){
          console.log('Mongoose default connection is disconnected due to application termination');
          process.exit(0);
      });
  });

});
