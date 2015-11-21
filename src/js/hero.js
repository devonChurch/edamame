const $ = require('jquery');
require('gsap');
require('snapsvg'); /* global Snap, mina */
// console.log(Snap);

const Hero = class {

    constructor() {

        this.$hero = $('#hero');
        this.paper = this.createPaper();

        const pathData = [
            'M5,0c-13.5,42.6,17.1,61.1,5,100C10,100-8.1,24.1,5,0z',
            'M10,0c18.8,83.2,5.4,83.8,0,100C10,100,19.7,57.5,10,0z'
        ];

        const path = this.paper.path(pathData[0]);

        path.animate(
			{ path: pathData[1] },
			1000,
			mina.easeinout,
			() => { console.log('Finished animation'); });

    }

    createPaper() {

        console.log('Creating paper');

        const id = 'sequence--1';
        const $svg = $(`<svg id="${id}" />`);
        this.$hero.append($svg);

        return Snap(`#${id}`);

    }




};

// module.exports = new Hero();



/*

var hero = (function() {

	var init = function() {

		if (!Snap || !Modernizr.svg) { createFallback(); }
		else { createInstance(0); }

	},

	$body = $('body'),

	createFallback = function () {

		$body.prepend('<div class="smoke-fallback"></div>');

	},

	createInstance = function (i) {

		var delay = Math.random() * 1000,
			paper, path, $smoke;

		setTimeout(function () {

			$body.prepend('<svg id="smoke-' + i + '"></svg>');
			paper = createPaper(i);
			$smoke = $('#smoke-' + i);
			path = createPath(i, paper);
			animatePath(i, $smoke, path);
			createInstance(i += 1);

		}, delay);

	},

	pathData = [
		'M5,0c-13.5,42.6,17.1,61.1,5,100C10,100-8.1,24.1,5,0z',
		'M10,0c18.8,83.2,5.4,83.8,0,100C10,100,19.7,57.5,10,0z'
	],

	createPaper = function (i) {

		var blur = Math.random() + 1,
			opacity = Math.random() / 2;

		paper = Snap('#smoke-' + i);
		paper.attr({
			fill: paper.gradient('l(0, 0, 1, 1)rgba(0, 0, 0, ' + opacity + ')-rgba(0, 0, 0, 0)'),
			filter: paper.filter(Snap.filter.blur(1 * blur, 3 * blur))
		});

		return paper;

	},

	createPath = function (i, paper) {

		return paper.path(pathData[i % 2]);

	},

	animatePath = function (i, $smoke, path) {

		var scale = Math.floor(Math.random() * 2) + 1,
			speed = Math.floor(Math.random() * 5) + 5,
			y = Math.floor(Math.random() * 30) + 20;

		$smoke.css({
			'opacity': '0',
			'transform': 'scale(' + scale + ') translateY(-' + y + 'px)',
			'transition-duration': speed + 's'
		});

		path.animate(
			{ path: pathData[i % 2] },
			speed * 1000,
			mina.easeinout,
			function () { $smoke.remove(); });

	};

	return {

		init: init()

	};

})();

*/
