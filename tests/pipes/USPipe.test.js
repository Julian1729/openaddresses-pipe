const appRoot = require('app-root-path');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const assertType = require('chai-asserttype');
const {expect} = chai;
chai.expect();
chai.use(sinonChai);
chai.use(assertType);

const streetHundredSchema = require(`${appRoot}/schemas/us/street-hundred`);
const streetHundreds = require(`${appRoot}/tests/fixtures/us/street-hundreds.fixture`);

const USPipe = require(`${appRoot}/pipes/USPipe`);

describe('US Pipe', () => {

  let pipe = null;
  const fixedDir = `${appRoot}/tests/fixtures/us/csv-directory`;
  beforeEach(() => {
    pipe = new USPipe(fixedDir);
  });

  describe('_collectStates', () => {

    it('finds 2 states in dir', async () => {
      const states = await pipe._collectStates();
      expect(states).to.have.lengthOf(2).and.to.have.members(['pa', 'ny']);
    });

  });


  describe('_initDB', () => {

    it('initializes the database', async () => {
      const db = await pipe._initDB('pa');
      expect(db).to.exist.and.to.have.property('model').and.to.be.function();
    });

  });

  describe('_getCityFiles', () => {

    it('collects correct city files', async () => {
      const fileNames = await pipe._getCityFiles('pa');
      expect(fileNames).to.have.lengthOf(1).and.to.include('philadelphia.csv');
    });

  });

  describe('_createCityModel', () => {

    it('creates city model', async () => {
      sinon.spy(streetHundredSchema, 'set');
      const db = await pipe._initDB('pa');
      const model = pipe._createCityModel('philadelphia', db);
      expect(streetHundredSchema.set).to.have.been.calledOnceWith('collection', 'philadelphia');
      streetHundredSchema.set.restore();
      expect(model).to.have.property('create').and.to.be.function();
      // empty collection
      await model.remove({});
      await db.connection.db.dropDatabase();
    });

    it('inserts hundred into db', async () => {
      const db = await pipe._initDB('pa');
      const model = pipe._createCityModel('philadelphia', db);
      const hundred = new model(streetHundreds[0]);
      const insertedHundred = await hundred.save();
      expect(insertedHundred).to.have.property('_id');
      const found = await model.findById(insertedHundred.id);
      expect(found).to.exist;
      // empty collection
      await db.connection.db.dropDatabase();
    });

  });

  describe('_insertDocs', () => {

    it('should insert batch docs', async () => {
      const db = await pipe._initDB('pa');
      const model = pipe._createCityModel('philadelphia', db);
      const streetHundredsArray = [streetHundreds[0], streetHundreds[0], streetHundreds[0]];
      await pipe._insertDocs(streetHundredsArray, model);
      const count = await model.count({});
      expect(count).to.equal(3);
      await db.connection.db.dropDatabase();
    });

  });

  describe('_normalizeCityName', () => {

    it('removes underscores from name', () => {
      const result = pipe._normalizeCityName('city_of_sullivan');
      expect(result).to.equal('City Of Sullivan');
    });

  });

  describe('_extractCityName', () => {

    it('removes extension from name', () => {
      const result = pipe._extractCityName('philadelphia.csv');
      expect(result).to.eql('philadelphia');
    });

  });

  describe('run', () => {

    it('should insert correct documents into db and return summary', async () => {
      sinon.spy(pipe, '_initDB');
      sinon.spy(pipe, '_createCityModel');
      sinon.spy(pipe, '_getCityFiles');
      const summary = await pipe.run();
      // should be called twice with 2 states -> 2 dbs
      expect(pipe._initDB).to.have.callCount(2);
      expect(pipe._initDB).to.have.been.calledWith('pa');
      expect(pipe._initDB).to.have.been.calledWith('ny');
      expect(pipe._createCityModel).to.have.been.calledTwice;
      expect(summary).to.eql({
        'NY' : {
          cities: ['Sullivan'],
          documents: 28,
        },
        'PA' : {
          cities: ['Philadelphia'],
          documents: 17
        }
      });
    });

  });

});
