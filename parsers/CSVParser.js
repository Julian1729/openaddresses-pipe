const fs = require('fs');
const _ = require('lodash');
const csv = require('csv-parser');

class CSVParser {

  constructor(filePath){
    this.filePath = filePath;
    this.addressData = {};
  }

  parse(onData){

    return new Promise((resolve, reject) => {

      fs.createReadStream(this.filePath)
        .pipe(csv())
        .on('data', this.onData)
        .on('end', () => resolve(this.addressData));

    });

  }

}

module.exports = CSVParser;
