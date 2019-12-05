const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.expect();
chai.use(sinonChai);

const usDatabase = require(`${appRoot}/databases/us-database`);

const testSchema = new mongoose.Schema({
  name: String,
});

describe('US Database', () => {

  it('builds correct db string', (done) => {

    sinon.stub(usDatabase.mongoose, 'connect');
    usDatabase.init('pa')
      .then(() => {
        expect(usDatabase.mongoose.connect).to.have.been.calledOnceWith('`mongodb://localhost/US-PA');
      })
      .catch(e => done(e));
    done()

  });

});
