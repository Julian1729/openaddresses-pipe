const _ = require('lodash');
const appRoot = require('app-root-path');

const CSVParser = require(`${appRoot}/parsers/CSVParser`);

class USParser extends CSVParser {

  constructor(filePath){
    super(filePath);
    this.hundreds = [];
  }

  _calcHundred(houseNumber){

    houseNumber = parseInt(houseNumber);

    // handle cases of house numbers that are consecutive
    // and start before the 100 block of street e.g. 59 W Mt. Airy Ave
    if(houseNumber < 100){
      // default hundred to 10
      return 10;
    }

    // divide by hundred, remove remainder
    let base = Math.floor(houseNumber / 100);
    // multiply by 100 to get block hundred
    return (base * 100);

  }

  _removeLeadingZeros(unitName){

    return unitName.replace(/^[0]+/, '');

  }

  _oddOrEven(houseNumber){

    if((houseNumber % 2) === 0) return 'even';

    return 'odd';

  }

  onData = (row) => {

    // find street
    let streetName = row.STREET;
    let streetRecord = this.addressData[streetName];
    if(!streetRecord){
      // create street object
      streetRecord = this.addressData[streetName] = {};
    }

    // find hundred
    const hundredNumber = this._calcHundred(row.NUMBER);
    let hundredRecord = streetRecord[hundredNumber];
    if(!hundredRecord){
      // create hundred record
      hundredRecord = streetRecord[hundredNumber] = {};
    }

    // find house object in hundred if it exists
    let houseNumber = row.NUMBER;
    let addressRecord = hundredRecord[houseNumber];
    // if house record already exists, check for unit
    if(addressRecord){
      if(_.isEmpty(row.UNIT)) return; // if no unit is present, skip
      return addressRecord.units.push(this._removeLeadingZeros(row.UNIT));
    }

    const {LAT: lat, LON: lng} = row;

    // create house object
    addressRecord = hundredRecord[houseNumber] = {lat, lng, units: []};

  }

  /**
   * Sort address data by hundred,
   * ready to be inserted into db
   * @return {Array}
   */
  sort(){

    for (const street in this.addressData) {
      if (this.addressData.hasOwnProperty(street)) {
        const streetData = this.addressData[street];

        // loop through hundreds
        for (const hundredString in streetData) {
          if (streetData.hasOwnProperty(hundredString)) {

            const hundredData = streetData[hundredString];
            // convert hundred string into number
            const hundred = parseInt(hundredString);
            let hundredDoc = {
              street,
              hundred,
              referencePoint: {
                type: 'Point',
                coordinates: null,
              },
              odd: {
                path: {
                  type: 'LineString',
                  coordinates: []
                },
                addresses: {
                  type: 'FeatureCollection',
                  features: []
                }
              },
              even: {
                path: {
                  type: 'LineString',
                  coordinates: []
                },
                addresses: {
                  type: 'FeatureCollection',
                  features: []
                }
              },
            };

            const addresses = Object.entries(hundredData);
            // add hundred points (lat and lng of first address)
            const firstAddress = addresses[0][1];
            const lastAddress = _.last(addresses)[1];
            // add reference point coordinates and parse numbers
            hundredDoc.referencePoint.coordinates = [parseFloat(firstAddress.lng), parseFloat(firstAddress.lat)];

            addresses.forEach(address => {
              // add address number to data object
              const number = parseInt(address[0]);
              const data = address[1];
              const latitude = parseFloat(data.lat);
              const longitude = parseFloat(data.lng);
              const addressObj = {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [longitude, latitude],
                },
                properties: {
                  number,
                  units: data.units,
                }
              };
              // determine even or odd
              const oddEven = this._oddOrEven(number);
              hundredDoc[oddEven].addresses.features.push(addressObj);
              // add to block line string
              hundredDoc[oddEven].path.coordinates.push([longitude, latitude]);
            });

            this.hundreds.push(hundredDoc);

          }
        }
      }
    }

  }

}

module.exports = USParser;
