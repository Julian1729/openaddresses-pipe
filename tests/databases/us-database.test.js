const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const {expect} = require('chai');

const usDatabase = require(`${appRoot}/databases/us-database`);

const testSchema = new mongoose.Schema({
  name: String,
});

describe('US Database', () => {

  let db = null;
  let TestModel = null;
  before(async () => {

    db = await usDatabase();

    TestModel = db.model('TestModel', testSchema);

  });

  it('should connect to db and insert test doc', async () => {

    expect(db).to.exist;
    const testDoc = new TestModel({name: 'Julian'});
    await testDoc.save();
    expect(testDoc).to.have.property('_id');

  });

});
