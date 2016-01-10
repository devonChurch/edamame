require('../sass/style.scss');
const Edamame = require('./edamame');

// Initialising for demo.
const $ = require('jquery');
const $hero = $('#hero');
const Demo = new Edamame({injectInto: $hero});
