const appRoot = require('app-root-path');

const mongoose = require(`${appRoot}/databases/us-database`);
const pointSchema = require(`${appRoot}/models/schemas/point-schema`);
const lineStringSchema = require(`${appRoot}/models/schemas/line-string-schema`);

const addressFeature = {
  type: {
    type: String,
    required: true,
    enum: 'Feature',
  },
  geometry: pointSchema,
  properties: {
    required: true,
    number: {
      type: Number,
      required: true,
    }
  }
};

const addressFeatureCollection = {
  type: {
    type: String,
    enum: 'FeatureCollection',
    required: true,
  },
  features: {
    type: [addressFeature],
    required: true,
  }
};

const blockSchema = {
  path: lineStringSchema,
  addresses: addressFeatureCollection,
};

const streetHundredSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  hundred: {
    type: Number,
    required: true,
  },
  referencePoint: pointSchema,
  odd: addressFeatureCollection,
  even: addressFeatureCollection,
});

const StreetHundred = mongoose.model('Hundred', streetHundredSchema);

module.exports = StreetHundred;
