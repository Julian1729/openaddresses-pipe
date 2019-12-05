const yargs = require('yargs').argv;
const appRoot = require('app-root-path');

const ct = yargs.country;
const dir = yargs.dir;

if( !ct ){
  return console.log('Please provide country');
}

if( !dir ){
  return console.log(`Please provide directory ${ct && `for ${ct}`}`);
}

(async (country, directory) => {

  switch (country) {
    case 'US':
      const USPipe = require(`${appRoot}/pipes/USPipe.js`);
      const pipe = new USPipe(directory);
      const summary = await pipe.run();
      console.log( JSON.stringify(summary, null, 2));
      process.exit();
      break;
    default:
      return console.log(`Country not recognized - ${country}`);
  }

})(ct, dir);
