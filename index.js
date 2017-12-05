const config = require('./config.json');
const Lightwatch = require('./lib/lightwatch');
const lightwatch = new Lightwatch(config);


setInterval(lightwatch.start.bind(lightwatch), config.interval);