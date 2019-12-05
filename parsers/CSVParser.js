const fs = require('fs');
const _ = require('lodash');
const csv = require('csv-parser');
const logUpdate = require('log-update');

class CSVParser {

  constructor(filePath){
    this.filePath = filePath;
    this.addressData = {};
  }

  parse(onData){

    return new Promise((resolve, reject) => {

      let counter = 0;
      fs.createReadStream(this.filePath)
        .pipe(csv())
        .on('data', data => {
          logUpdate(`Parsing ${counter}`);
          this.onData(data);
          counter++;
        })
        .on('end', () => resolve(this.addressData));

    });

  }

}

module.exports = CSVParser;
