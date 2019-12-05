const _ = require('lodash');
const path = require('path');
const fs = require('fs').promises;
const logUpdate = require('log-update');
const appRoot = require('app-root-path');

const USParser = require(`${appRoot}/parsers/USParser`);
const usDatabase = require(`${appRoot}/databases/us-database`);
const streetHundredSchema = require(`${appRoot}/schemas/us/street-hundred`);

class USPipe {

  constructor(directory){
    this.directory = directory;
    this.dbs = [];
  }

  /**
   * Traverse directory and collect states
   */
  _collectStates = async () => {

    // get states (parent level directories)
    let states = await fs.readdir(this.directory, {withFileTypes: true});

    if(!states.length){
      return console.log(`No state directories found in ${directory}`);
    }

    // filter out non-directories and then return only name
    states = states.filter(dirent => dirent.isDirectory() ).map(dirent => dirent.name);

    return states;

  }

  /**
   * Initialize database connection
   * @param  {String}  state State string
   * @return {Object}       Mongoose model
   */
  _initDB = async state => {

    const db = await usDatabase.init(state);
    this.dbs.push(db);
    return db;

  }

  /**
   * Get cities names from state path
   * @param  {String}  state
   * @return {Array} array of city csv files
   */
  _getCityFiles = async state => {

    const statePath = path.join(this.directory, state);
    let cities = await fs.readdir(statePath);
    // filter out any non-csv files
    cities = cities.filter(filename => path.extname(filename) === '.csv');
    return cities;

  }

  /**
   * Create new city model and collection
   * @param  {String} cityFilename Filename of city csv
   * @param  {Object} db           Database connection
   * @return {Object}              Mongoose model
   */
  _createCityModel = (cityName, db) => {

    // set collection name in schema
    streetHundredSchema.set('collection', cityName);
    // create model
    const model = db.model(cityName, streetHundredSchema);
    return model;

  }

  /**
   * Remove extension from filename
   * @param  {String} cityFilename
   * @return {String} city slug
   */
  _extractCityName(cityFilename){
    // remove extension from filename
    return path.parse(cityFilename).name;
  }

  /**
   *
   * @param  {Array}  docs      Array of documents
   * @param  {Object}  cityModel [description]
   * @return {Promise}           [description]
   */
  _insertDocs = async (docs, cityModel) => {

    const count = await cityModel.insertMany(docs);
    return count;

  }

  _normalizeCityName(cityName){
    return _.startCase(cityName);
  }

  run = async () => {

    const summary = {};
    const stateDirs = await this._collectStates();
    // loop through stateDirs
    for (let i = 0; i < stateDirs.length; i++) {
      let stateDir = stateDirs[i];
      // create state database
      let stateDB = await this._initDB(stateDir);
      // get city files
      let cityFilenames = await this._getCityFiles(stateDir);
      let stateAbbreviation = stateDir.toUpperCase();
      console.log(`${stateAbbreviation}...`);
      // init summary stats obj
      summary[stateAbbreviation] = {cities: [], documents: 0};
      // loop through city filenames
      for (let c = 0; c < cityFilenames.length; c++) {
        let cityFilename = cityFilenames[c];
        let cityName = this._extractCityName(cityFilename);
        console.log(`\t${this._normalizeCityName(cityName)}...`);
        // create city collection / model
        let cityModel = this._createCityModel(cityName, stateDB);
        let cityFilePath = path.join(this.directory, stateDir, cityFilename);
        // create new parser
        let parser = new USParser(cityFilePath);
        await parser.parse();
        parser.sort();
        // console.log( JSON.stringify(parser.hundreds, null, 2) );
        logUpdate(`Inserting ${parser.hundreds.length}`);
        let {length : insertedDocCount} = await this._insertDocs(parser.hundreds, cityModel);
        logUpdate.done();
        summary[stateAbbreviation].documents += insertedDocCount;
        summary[stateAbbreviation].cities.push(this._normalizeCityName(cityName));
      }
    }

    return summary;

  }

}


module.exports = USPipe;
