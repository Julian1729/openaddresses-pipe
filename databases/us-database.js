const mongoose = require('mongoose');

const init = state => new Promise((resolve, reject) => {

  mongoose.Promise = global.Promise;

  mongoose.connect(`mongodb://localhost/US-${state.toUpperCase()}`, {useNewUrlParser: true, useUnifiedTopology: true});

  mongoose.connection.on('connected', function(){
      console.log(`Connected to US-${state.toUpperCase()}`);
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

module.exports = {mongoose, init};
