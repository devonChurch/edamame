const $ = require('jquery');
require('gsap'); /* global TweenMax TimelineMax */
require('snapsvg'); /* global Snap, mina */
// console.log(Snap);

const Hero = class {

    constructor() {

        this.$window = $(window);
        this.$hero = $('#hero');
        // this.listeners();
        this.graphInstances();


    }

    listeners() {

        this.$window.on('resize', () => {

            this.graphInstances();

        }).on('scroll', () => {

            this.testViewPort();

        }).resize().scroll();

    }

    graphInstances() {

        this.graphs = [];

        for (let i = 0; i < 3; i += 1) {

            this.graphs[i] = new Graph(i, this.$window, this.$hero);

        }

    }

    testViewPort() {

    }

};

//
//
//
//
//

const Graph = class {

    constructor(i, $window, $hero) {

        this.id = i;
        this.size = this.calcSize();
        this.speed = 1000 * (this.id + 1);

        this.$hero = $hero;
        this.$hero.append($(`<svg id="hero__graph-${this.id}" class="hero__graph" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.size.svgWidth} ${this.size.svgHeight}" preserveAspectRatio="xMidYMid meet" />`));

        this.paper = Snap(`#hero__graph-${this.id}`);
        this.path = this.paper.path(this.createPath());

        this.$counter = this.buildCounter();
        this.$counterText = this.$counter.find('.hero__counter-text');
        this.positionCounter({init: true});

        setTimeout(() => {

            this.cycleCounterText({init: true});
            // this.animateSequence();
            this.positionCounter();

        }, 0);


    }

    calcSize() {

        const svgWidth = 1024;
        const svgHeight = 300;
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
            x: 0, // Current total x position
            y: 0, // Current total y position
            m: {}, // Starting coordinates
            c: {}, // Initial cubic bezier curve
            s: [] // All proceeding smooth curves
        };

    }

    generatePathData() {

        // generate path data in object format THEN build spline
        // this way you can pass in data and determain new offset based on previous coordinates
        // also we can build the animated circles with solid x and y positions

        this.buildM();
        this.buildC();

        for (let i = 0; i < this.size.curveTotal - 1; i += 1) {

            this.buildS(i);

        }

    }

    buildM() { // startPoint

        const x1 = 0;
        const y1 = (this.size.svgHeight / 3 * 2) + (this.id * 5);

        this.data.x += x1;
        this.data.y += y1;
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
        this.data.y += y1 + y2;
        this.data.c = {x1, y1, xC, yC, x2, y2};

        // return `c${x1},${y1}, ${xC},${yC}, ${x2},${y2}`;

    }

    buildS(i) { // smoothCurve

        const sX = this.offset(70, 20);
        const sY = sX / 2.5 * i;
        const x1 = this.size.curveWidth;
        const y1 = this.randomise(25, 10) * i / 2 * -1;

        this.data.x += i < this.size.curveTotal - 2 ? x1 : 0;
        this.data.y += i < this.size.curveTotal - 2 ? y1 : 0;
        this.data.s[i] = {sX, sY, x1, y1};

        // return `s${sX},{sY}, ${x1},${y1}`;

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

        // Close off path (so that we can add in a fill)
        svg += `V${this.size.svgHeight} H${0} z`;

        return svg;

    }

    buildCounter() {

        const x = 0;
        const y = 0;
        const bigCircle = this.paper.circle(x, y, 30).attr('class', 'hero__counter-wrapper');
        const smallCircle = this.paper.circle(x, y, 5).attr('class', 'hero__counter-point');
        // const number = this.invertNumber();
        // const text = // this.paper.group(this.paper.text(x, y, ['0', '1', '2', '3', '4', '5']).attr('class', 'hero__counter-text'));
        const numbers = this.buildNumbers();



        this.paper.group(bigCircle, smallCircle, numbers).attr('class', 'hero__counter');

        return this.$hero.find(`#hero__graph-${this.id} .hero__counter`);

    }

    buildNumbers() {

        /*

        number
          --> number-strip
                --> 0, 1, 2, 3, 4, 5, 6, 7, 8, 9

        */

        const numbers = this.paper.g().attr({
            'class': 'hero__number',
            'transform': 'translate(-19-14)'
        });

        for (let i = 0; i < 3; i += 1) {

            const strip = this.paper.g().attr('class', `hero__number-strip-${i}`);

            for (let j = 0; j < 10; j += 1) {

                const x = 14 * i;
                const y = 18 * j;
                const text = this.paper.text(x, y, `${j}`).attr('class', `hero__number-strip-${i}--${j}`);

                strip.add(text);

            }

            numbers.add(strip);

        }

        return numbers;

        //
        //
        //
        // let svg = '';
        //
        // for (let i = 0; i < 10; i += 1) {
        //
        //     svg += `<tspan x="0" y="${18 * i}" font-family="'HelveticaNeue-Thin'" font-size="15">${i}</tspan>`;
        //
        // }
        //
        // return svg;



        // let svg = '';
        //
        // for (let i = 0; i < 10; i += 1) {
        //
        //     svg += `<tspan x="0" y="${18 * i}" font-family="'HelveticaNeue-Thin'" font-size="15">${i}</tspan>`;
        //
        // }
        //
        // return svg;

        /// ---- -- - - - - - - -- - - - --  --

        // const numbers = this.paper.g().attr('class', 'hero__number');
        // const paths = [
        //     'M7.251,6.68c0,1.377-0.298,2.438-0.894,3.18s-1.423,1.113-2.483,1.113c-1.055,0-1.884-0.373-2.486-1.117 C0.785,9.11,0.483,8.053,0.483,6.68V4.3c0-1.372,0.298-2.432,0.894-3.179S2.8,0,3.86,0s1.89,0.374,2.49,1.121 S7.251,2.928,7.251,4.3V6.68z M6.372,4.15c0-1.093-0.215-1.933-0.645-2.521S4.675,0.748,3.86,0.748S2.424,1.042,2,1.63 S1.362,3.058,1.362,4.15v2.657c0,1.083,0.216,1.923,0.648,2.521c0.433,0.599,1.054,0.896,1.864,0.896s1.429-0.297,1.856-0.893 c0.427-0.595,0.641-1.437,0.641-2.524V4.15z',
        //     'M4.46,28.869H3.582V19.07l-2.71,0.314V18.77l3.589-0.645V28.869z',
        //     'M7.119,46.818H0.498v-0.682l3.494-3.955c0.645-0.727,1.1-1.336,1.366-1.827c0.266-0.49,0.399-0.96,0.399-1.409 c0-0.664-0.187-1.196-0.56-1.598c-0.374-0.399-0.902-0.6-1.586-0.6c-0.811,0-1.426,0.225-1.846,0.674s-0.63,1.05-0.63,1.801H0.322 L0.308,39.18c-0.024-0.889,0.264-1.641,0.864-2.256S2.585,36,3.611,36c0.918,0,1.653,0.264,2.205,0.791s0.828,1.236,0.828,2.125 c0,0.586-0.185,1.18-0.553,1.783c-0.369,0.603-0.883,1.275-1.542,2.018l-2.937,3.318l0.015,0.036h5.493V46.818z',
        //     'M2.446,59.01h1.018c0.776,0,1.365-0.193,1.765-0.582c0.4-0.388,0.601-0.887,0.601-1.498c0-0.663-0.188-1.193-0.564-1.589 s-0.935-0.593-1.677-0.593c-0.684,0-1.244,0.201-1.681,0.604c-0.437,0.403-0.655,0.934-0.655,1.594h-0.82L0.417,56.9 c-0.024-0.829,0.266-1.521,0.872-2.072S2.661,54,3.589,54c0.952,0,1.71,0.262,2.274,0.784c0.564,0.522,0.846,1.248,0.846,2.175 c0,0.504-0.156,0.976-0.469,1.418c-0.312,0.441-0.752,0.771-1.318,0.984c0.664,0.191,1.161,0.512,1.491,0.964 c0.329,0.451,0.494,0.985,0.494,1.601c0,0.947-0.307,1.691-0.919,2.233c-0.613,0.542-1.4,0.813-2.362,0.813 c-0.933,0-1.733-0.266-2.402-0.795c-0.669-0.53-0.991-1.266-0.967-2.209l0.015-0.043h0.82c0,0.676,0.235,1.229,0.707,1.657 c0.471,0.428,1.08,0.642,1.827,0.642c0.757,0,1.348-0.195,1.772-0.588s0.637-0.954,0.637-1.686c0-0.746-0.222-1.298-0.667-1.656 s-1.079-0.537-1.904-0.537H2.446V59.01z',
        //     'M5.874,79.383h1.67v0.748h-1.67v2.688H5.002v-2.688H0v-0.504l4.915-7.473h0.959V79.383z M1.04,79.383h3.962v-6.078 l-0.044-0.016l-0.374,0.799L1.04,79.383z',
        //     'M0.879,95.992l0.593-5.838H6.65v0.812H2.219l-0.396,3.802c0.269-0.244,0.564-0.433,0.886-0.563 C3.032,94.072,3.469,94,4.021,93.984c0.908-0.014,1.641,0.291,2.197,0.916s0.835,1.465,0.835,2.52c0,1.079-0.27,1.941-0.81,2.586 s-1.351,0.967-2.435,0.967c-0.879,0-1.611-0.246-2.197-0.736c-0.586-0.491-0.867-1.217-0.842-2.18l0.015-0.043h0.784 c0,0.715,0.204,1.263,0.612,1.642c0.407,0.38,0.951,0.569,1.629,0.569c0.791,0,1.383-0.238,1.776-0.716 c0.393-0.479,0.59-1.171,0.59-2.078c0-0.794-0.197-1.432-0.59-1.912s-0.943-0.721-1.651-0.721c-0.684,0-1.205,0.108-1.563,0.326 c-0.359,0.217-0.619,0.546-0.78,0.985L0.879,95.992z',
        //     'M4.233,108c0.366,0,0.728,0.042,1.084,0.125s0.674,0.203,0.952,0.359l-0.227,0.717c-0.278-0.155-0.554-0.271-0.828-0.344 s-0.601-0.109-0.981-0.109c-0.791,0-1.447,0.307-1.966,0.922c-0.521,0.615-0.78,1.424-0.78,2.425v0.944 c0.293-0.381,0.667-0.686,1.121-0.915s0.957-0.345,1.509-0.345c0.957,0,1.714,0.33,2.271,0.989s0.835,1.519,0.835,2.578 c0,1.05-0.299,1.917-0.897,2.601c-0.599,0.684-1.376,1.025-2.333,1.025c-0.981,0-1.791-0.367-2.428-1.1 c-0.638-0.732-0.956-1.735-0.956-3.01v-2.688c0-1.23,0.349-2.234,1.047-3.011S3.213,108,4.233,108z M3.94,112.498 c-0.591,0-1.107,0.153-1.549,0.46c-0.442,0.308-0.743,0.703-0.904,1.186v0.782c0,1.02,0.234,1.824,0.703,2.414 s1.069,0.885,1.802,0.885c0.713,0,1.283-0.278,1.71-0.837s0.641-1.24,0.641-2.045c0-0.853-0.208-1.541-0.623-2.062 S4.712,112.498,3.94,112.498z',
        //     'M7.053,126.901c-1.152,1.367-2.034,2.755-2.644,4.164c-0.61,1.408-1.018,3.028-1.223,4.859l-0.081,0.894H2.227l0.081-0.894 c0.205-1.807,0.63-3.441,1.274-4.903c0.645-1.463,1.499-2.836,2.563-4.12H0.059v-0.747h6.995V126.901z',
        //     'M6.79,146.9c0,0.577-0.168,1.081-0.505,1.513c-0.337,0.433-0.786,0.746-1.348,0.941c0.649,0.2,1.17,0.533,1.564,1 c0.393,0.466,0.589,1.012,0.589,1.637c0,0.957-0.32,1.693-0.959,2.208c-0.64,0.516-1.462,0.773-2.468,0.773 c-1.025,0-1.854-0.257-2.487-0.77s-0.948-1.25-0.948-2.212c0-0.63,0.193-1.178,0.579-1.645c0.386-0.466,0.903-0.799,1.553-0.999 c-0.562-0.195-1.007-0.508-1.336-0.938c-0.33-0.43-0.495-0.933-0.495-1.51c0-0.917,0.29-1.63,0.868-2.139 C1.974,144.255,2.725,144,3.647,144c0.918,0,1.671,0.256,2.259,0.766C6.495,145.276,6.79,145.988,6.79,146.9z M6.211,151.995 c0-0.673-0.244-1.22-0.732-1.642s-1.099-0.633-1.831-0.633c-0.742,0-1.353,0.211-1.831,0.633s-0.718,0.969-0.718,1.642 c0,0.697,0.237,1.243,0.71,1.638s1.091,0.592,1.853,0.592c0.742,0,1.353-0.198,1.831-0.596S6.211,152.688,6.211,151.995z M5.911,146.894c0-0.615-0.216-1.127-0.648-1.534c-0.432-0.408-0.97-0.611-1.615-0.611c-0.659,0-1.199,0.195-1.619,0.586 s-0.63,0.91-0.63,1.56c0,0.63,0.211,1.134,0.634,1.513c0.422,0.378,0.965,0.567,1.629,0.567c0.649,0,1.187-0.189,1.611-0.567 C5.698,148.027,5.911,147.523,5.911,146.894z',
        //     'M3.237,172.225c0.811,0,1.455-0.27,1.934-0.811c0.479-0.54,0.718-1.315,0.718-2.324v-1.068 c-0.259,0.449-0.607,0.796-1.043,1.039c-0.438,0.245-0.924,0.367-1.461,0.367c-0.972,0-1.754-0.338-2.347-1.012 c-0.594-0.674-0.89-1.545-0.89-2.614c0-1.079,0.311-1.982,0.934-2.71C1.703,162.364,2.473,162,3.391,162 c1.03,0,1.855,0.336,2.476,1.008c0.62,0.671,0.93,1.646,0.93,2.926v3.143c0,1.235-0.327,2.193-0.981,2.874 c-0.654,0.682-1.514,1.022-2.578,1.022c-0.381,0-0.763-0.037-1.146-0.111c-0.384-0.074-0.749-0.188-1.095-0.341l0.161-0.735 c0.332,0.157,0.66,0.27,0.985,0.338S2.832,172.225,3.237,172.225z M3.384,168.68c0.635,0,1.166-0.162,1.593-0.486 c0.427-0.324,0.731-0.726,0.912-1.203v-1.126c0-1.01-0.221-1.781-0.663-2.315c-0.442-0.534-1.042-0.801-1.798-0.801 c-0.688,0-1.256,0.297-1.703,0.892c-0.447,0.596-0.67,1.314-0.67,2.158c0,0.819,0.21,1.505,0.63,2.056S2.671,168.68,3.384,168.68z'
        // ];
        //
        // for (let i = 0; i < 3; i += 1) {
        //
        //     let strip = this.paper.g().attr('class', `hero__number-strip-${i}`);
        //
        //     for (let j = 0; j < paths.length; j += 1) {
        //
        //         let path = this.paper.path(paths[j]).attr('class', `hero__number-strip-${i}--${j}`);
        //         strip.add(path);
        //
        //     }
        //
        //     numbers.add(strip);
        //
        // }
        //
        // return numbers;

    }

    positionCounter({init} = {}) {

        const duration = init ? 0 : this.speed  / 1000;
        const x = this.data.x;
        const y = this.data.y;

        this.$counter.css({
            'transform': `translate(${x}px, ${y}px)`,
            'transition-duration': `${duration}s`
        });

    }

    cycleCounterText() {

        console.log('Cycling numbers');

        // const current = parseInt(this.$counterText.text(), 10);
        // console.log(current);
        // const latest = this.invertNumber();
        // const numbers = this.generateNumbers(current, latest);
        //
        // this.$counterText.text(latest);
        // this.scaleNumber();

    }

    invertNumber(number = this.data.y) {

        console.log(`number = ${number}`);

        return (this.size.svgHeight - number); // * 3;

    }

    scaleNumber() {

        // Exponential growth

        const length = this.invertNumber() / this.size.svgHeight * 100;
        let scale = 1;

        for (let i = 0; i < length; i += 1) {

            scale *= 1.035;

        }

        scale /= 3.5;

        console.log(`scale = ${scale}`);

        const duration = this.speed / 1000;

        this.$counterText.closest('g').css({
            'transform': `scale(${scale})`,
            'transition-duration': `${duration}s`
        });

    }

    generateNumbers(current, latest) {

        const length = Math.ceil(this.speed / 200);
        const difference = current > latest ? current - latest : latest - current;
        const direction = current > latest ? -1 : 1;
        const increment = difference / length * direction;
        const numbers = [current];

        console.log(`current    : ${current}`);
        console.log(`latest     : ${latest}`);
        console.log(`length     : ${length}`);
        console.log(`difference : ${difference}`);
        console.log(`increment  : ${increment}`);

        for (let i = 1; i < length + 1; i += 1) {

            numbers[i] = numbers[i - 1] += increment;

        }

        console.log(numbers);

    }

    animateSequence() {

        this.path.animate(
			{ path: this.createPath() },
			this.speed,
			mina.linear, // mina.easeinout,
			() => {
                this.animateSequence();
                this.positionCounter();
                this.cycleCounterText();
            }
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
			animateSequence(i, $smoke, path);
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

	animateSequence = function (i, $smoke, path) {

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
