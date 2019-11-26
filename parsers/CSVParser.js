const fs = require('fs');
const _ = require('lodash');
const csv = require('csv-parser');


class CSVParser {

  constructor(filePath){
    this.addressData = {};
  }

  parse(onData){

    return new Promise((resolve, reject) => {

      fs.createReadStream(this.filePath)
        .pipe(csv())
        .on('data', onData)
        .on('end', resolve);

    });

  }

}
