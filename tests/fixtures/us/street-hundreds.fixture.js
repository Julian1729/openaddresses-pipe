module.exports = [

  {

  street: 'Oakland',

  hundred: 4400,

  referencePoint: {
    type: 'Point',
    coordinates: [0.45, 0.67],
  },

  odd: {

    path: {
      type: 'LineString',
      coordinates: [ [0.67, 9.00], [0.45, 0.56] ]
    },

    addresses: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [5.6, 6,7],
          },
          properties: {
            number: 4451,
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [9.7, 88,999],
          },
          properties: {
            number: 4453,
          }
        }
      ]
    }

  },

  even: {
    path: {
      type: 'LineString',
      coordinates: [ [0.67, 9.00], [0.45, 0.56] ]
    },
    addresses: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [5.6, 6,7],
          },
          properties: {
            number: 4450,
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [9.7, 88,999],
          },
          properties: {
            number: 4452,
          }
        }
      ]
    }
  }
}

];
