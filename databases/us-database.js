const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/US-PA', {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on('connected', function(){
    console.log('Mongoose default connection is open');
});

mongoose.connection.on('error', function(err){
    console.log(`Mongoose default connection ${err} has occured error`);
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

module.exports = mongoose;
