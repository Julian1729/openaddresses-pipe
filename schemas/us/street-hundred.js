const appRoot = require('app-root-path');
const mongoose = require('mongoose');

const pointSchema = require(`${appRoot}/schemas/point-schema`);
const lineStringSchema = require(`${appRoot}/schemas/line-string-schema`);

const addressFeature = {
  type: {
    type: String,
    required: true,
    enum: 'Feature',
  },
  geometry: pointSchema,
  properties: {
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
  odd: blockSchema,
  even: blockSchema,
});

module.exports = streetHundredSchema;
