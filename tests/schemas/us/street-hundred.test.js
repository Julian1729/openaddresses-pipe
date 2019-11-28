const {expect} = require('chai');
const appRoot = require('app-root-path');

const usDatabase = require(`${appRoot}/databases/us-database`);
const streetHundreds = require(`${appRoot}/tests/fixtures/us/street-hundreds.fixture.js`);
const streetHundredSchema = require(`${appRoot}/schemas/us/street-hundred`);

describe('Street Hundred Schema', () => {

  let db = null;
  before( async () => {
    // connect to db
    db = await usDatabase();
  })

  it('should create model with schema', async () => {

    expect(db).to.exist;
    const RandomCity = db.model('RandomCity', streetHundredSchema);
    const collection = await db.connection.db.listCollections({name: 'RandomCity'});
    expect(collection).to.exist;

  });

  it('should insert street hundred data', async () => {

    const RandomCity = db.model('RandomCity', streetHundredSchema);
    const testHundred = new RandomCity(streetHundreds[0]);
    const insertedHundred = await testHundred.save();
    expect(insertedHundred).to.have.property('_id');

    // find in db
    const foundHundred = await RandomCity.findById(insertedHundred.id);
    expect(foundHundred).to.exist;

  });

});
