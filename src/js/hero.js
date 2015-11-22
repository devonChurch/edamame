const $ = require('jquery');
require('gsap');
require('snapsvg'); /* global Snap, mina */
// console.log(Snap);

const Hero = class {

    constructor() {

        console.log('Constructing Hero');

        this.$window = $(window);
        this.$hero = $('#hero');
        // this.listeners();
        this.graphInstances();


    }

    listeners() {

        console.log('Hero => listeners()');

        this.$window.on('resize', () => {

            this.graphInstances();

        }).on('scroll', () => {

            this.testViewPort();

        }).resize().scroll();

    }

    graphInstances() {

        console.log('Hero => graphInstances()');

        this.graphs = [];

        for (let i = 0; i < 3; i += 1) {

            this.graphs[i] = new Graph(i, this.$window, this.$hero);

        }

    }

    testViewPort() {

        console.log('Hero => testViewPort()');

    }

};

//
//
//
//
//

const Graph = class {

    constructor(i, $window, $hero) {

        console.log(`Constructing Graph (${i})`);

        this.id = i;
        this.size = this.calcSize();
        $hero.append($(`<svg id="hero__graph-${this.id}" class="hero__graph" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.size.svgWidth} ${this.size.svgHeight}" preserveAspectRatio="xMidYMid meet" />`));
        this.$window;
        this.paper = Snap(`#hero__graph-${this.id}`);
        this.path = this.paper.path(this.createPath());
        this.animatePath();

    }

    calcSize() {

        const svgWidth = 1024;
        const svgHeight = 500;
        const curveTotal = this.id + 4;
        const curveWidth = svgWidth / curveTotal;

        return {svgWidth, svgHeight, curveTotal, curveWidth};

    }

    createPath() {

        this.resetPathData();
        this.generatePathData();
        return this.generateSvgCode();

    }

    resetPathData() {

        this.data = {
            x: 0, // Total x position
            m: {}, // Starting coordinates
            c: {}, // Initial cubic bezier curve
            s: [], // All proceeding smooth curves
            v: 0, // Vertical closing path
            h: 0 // Horizontal closing path
        };

    }

    generatePathData() {

        // generate path data in object format THEN build spline
        // this way you can pass in data and determain new offset based on previous coordinates
        // also we can build the animated circles with solid x and y positions

        this.buildM();
        this.buildC();

        for (let i = 0; i < this.size.curveTotal; i += 1) {

            this.buildS(i);

        }

        // this.buildV();
        // this.buildH();

    }

    buildM() { // startPoint

        const x1 = 0;
        const y1 = 250 + (this.id * 5);

        this.data.x += x1;
        this.data.m = {x1, y1};

        // return `M${x1},${y1}`;

    }

    buildC() { // cubicBezier

        const x1 = 0;
        const y1 = 0;
        const x2 = this.size.curveWidth;
        const y2 = 0;
        const xC = x2 / 2;
        const yC = this.offset(20, 20);

        this.data.x += x1 + x2;
        this.data.c = {x1, y1, xC, yC, x2, y2};

        // return `c${x1},${y1}, ${xC},${yC}, ${x2},${y2}`;

    }

    buildS(i) { // smoothCurve

        const sX = this.offset(70, 20);
        const sY = sX / 2.5 * i;
        const x1 = this.size.curveWidth;
        const y1 = this.randomise(25, 10) * i / 2 * -1;

        this.data.x += x1;
        this.data.s[i] = {sX, sY, x1, y1};

        // return `s${sX},{sY}, ${x1},${y1}`;

    }

    buildV() {

        this.path.v = this.size.svgHeight;

    }

    buildH() {

        this.path.h = 0;

    }

    offset(base, variance) {

        return this.randomise(1) === 0 ? base + this.randomise(variance) : base - this.randomise(variance);

    }

    randomise(max, min = 0) {

        const random =  Math.floor(Math.random() * (max - min + 1)) + min;

        return random;

    }

    generateSvgCode() {

        let svg = '';
        let p;

        p = this.data.m;
        svg += `M${p.x1},${p.y1}`; // buildM();

        p = this.data.c;
        svg += `c${p.x1},${p.y1}, ${p.xC},${p.yC}, ${p.x2},${p.y2}`; // buildC();

        for (let i = 0; i < this.data.s.length; i += 1) {

            p = this.data.s[i];
            svg += `s${p.sX},${p.sY}, ${p.x1},${p.y1}`; // buildS();

        }

        console.log(this.size.svgHeight);
        svg += `V${this.size.svgHeight} H${0} z`;

        return svg;

    }

    animatePath() {

        const speed = 1000 * (this.id + 1);

        this.path.animate(
			{ path: this.createPath() },
			speed,
			mina.easeinout,
			() => { this.animatePath(); }
        );

    }

};

module.exports = new Hero();

/*

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

*/

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
