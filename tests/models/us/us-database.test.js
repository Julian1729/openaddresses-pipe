const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const {expect} = require('chai');

const usDatabase = require(`${appRoot}/databases/us-database`);

const testSchema = new mongoose.Schema({
  name: String,
});

const Test = usDatabase.model('Test', testSchema);

describe('US Database', () => {

  it('should connect to db and insert test doc', async () => {

    const testDoc = new Test({name: 'Julian'});
    await testDoc.save();
    expect(testDoc).to.have.property('_id');

  });

});
