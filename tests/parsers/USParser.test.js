const appRoot = require('app-root-path');
const chai = require('chai');
const assertType = require('chai-asserttype');
chai.use(assertType);
const expect = chai.expect;

const USParser = require(`${appRoot}/parsers/USParser`);

describe('US Parser', () => {

  const testCSV = `${appRoot}/tests/fixtures/us/csv-directory/philadelphia.csv`;

  // it('should log row', (done) => {
  //
  //   const parser = new USParser(testCSV);
  //   parser.parse()
  //     .then(() => {})
  //     .catch(e => done(e));
  //
  // });

  describe('parse', () => {

    it('should parse csv into streets > hundreds > addresses', done => {

      const parser = new USParser(testCSV);
      parser.parse()
        .then(addressData => {
          expect(addressData).to.exist;
          expect(addressData).to.have.property('S 04TH ST');
          expect(addressData['S 04TH ST']).to.have.property('1600');
          const addresses1600 = Object.keys(addressData['S 04TH ST']['1600']);
          expect(addresses1600).to.have.members([
            '1600',
            '1602',
            '1604',
            '1606',
            '1608',
            '1610',
            '1612',
            '1614',
            '1616',
            '1618',
            '1620',
            '1624',
            '1626',
            '1628',
            '1630',
            '1632',
          ]);
          done();
        })
        .catch(e => done(e));

    });

  });

  describe('sort', () => {

    it('should sort data by hundreds and cast to correct data types', async () => {

      const parser = new USParser(testCSV);
      await parser.parse();
      const sorted = parser.sort();
      expect(parser.hundreds).to.exist;
      expect(parser.hundreds).to.have.lengthOf(17);
      // inspect first hundred
      const firstHundred = parser.hundreds[0];
      expect(firstHundred).to.have.property('hundred').and.to.be.number().and.to.equal(1600);
      expect(firstHundred).to.have.property('street').and.to.equal('S 04TH ST');
      // use coordinates of first address
      expect(firstHundred).to.have.property('referencePoint').and.to.eql({type: 'Point', coordinates: [-75.1523537, 39.9282832]});
      expect(firstHundred.odd.addresses.features).to.have.lengthOf(0);
      expect(firstHundred.even.addresses.features).to.have.lengthOf(16);
      // block paths
      expect(firstHundred.odd.path.coordinates).to.have.lengthOf(0);
      expect(firstHundred.even.path.coordinates).to.have.lengthOf(16);

      // loop through all hundreds and assure
      // required properties are present
      parser.hundreds.forEach(streetHundred => {
        expect(streetHundred).to.have.property('hundred').and.to.be.number();
        expect(streetHundred).to.have.property('street').and.to.be.string();
        expect(streetHundred).to.have.property('referencePoint').and.to.have.keys('type', 'coordinates');
        // longitude
        expect(streetHundred.referencePoint.coordinates[0]).to.be.number();
        // latitude
        expect(streetHundred.referencePoint.coordinates[1]).to.be.number();
      });

    });

  });

});
