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
        this.counter = this.buildCounter();
        this.graph = this.paper.path(this.createPath());

        TweenMax.set(this.counter.dom.find('text'), {attr: {opacity: 0}});


        // this.$counterText = this.$counter.find('.hero__counter-text');
        this.positionCounter({init: true});

        setTimeout(() => {

            this.animateSequence();
            this.positionCounter();
            this.cycleCounterText({init: true});

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
        let p; // reference to current (P)ath data

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
        const numbers = this.buildNumbers();
        this.paper.group(bigCircle, smallCircle, numbers).attr('class', 'hero__counter');
        const $counter = this.$hero.find(`#hero__graph-${this.id} .hero__counter`);

        // return {
        //     dom: $counter,
        //     digits: [],
        //
        // };

        return {
            dom: $counter,
            digits: (function () {

                console.log('building numbers....');

                const digits = [];
                const $digits = $counter.find('> .hero__number');

                for (let i = 0; i < 3; i += 1) {

                    digits[i] = {
                        dom: $digits.eq(i),
                        current: null
                    };

                }

                return digits;

            })()

        };

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

            const strip = this.paper.g(); // .attr('class', `hero__number-strip-${i}`);

            for (let j = 0; j < 10; j += 1) {

                const x = 14 * i;
                const y = 0; // -18 * j;
                const text = this.paper.text(x, y, `${j}`); // .attr('opacity', '0'); // .attr('class', `hero__number-strip-${i}--${j}`);

                strip.add(text);

            }

            numbers.add(strip);

        }

        return numbers;

    }

    positionCounter({init} = {}) {

        const duration = init ? 0 : this.speed  / 1000;
        const x = this.data.x;
        const y = this.data.y;

        this.counter.dom.css({
            'transform': `translate(${x}px, ${y}px)`,
            'transition-duration': `${duration}s`
        });

    }

    cycleCounterText() {

        // Get the current 3 digit number
        // if < 3 digits prepent a 0 on the front
        // if > 3 digits === 999
        // split the number into the array
        // transition each number strip to their new value

        this.roundNumber();
        this.invertNumber();
        this.inspectnumber();
        this.splitNumbers();
        this.swapNumbers();

        console.log('After number augmentation');
        console.log(this.data.y);

        // const current = parseInt(this.$counterText.text(), 10);
        // console.log(current);
        // const latest = this.invertNumber();
        // const numbers = this.generateNumbers(current, latest);
        //
        // this.$counterText.text(latest);
        // this.scaleNumber();

    }

    roundNumber(number = this.data.y) {

        this.data.y = Math.round(number);

    }

    invertNumber(number = this.data.y) {

        this.data.y = this.size.svgHeight - number; // * 3;

    }


    inspectnumber(number = this.data.y) {

        console.log(number);

        if (number > 999) {

            console.log('greater than 3 digits');

            number = 999;

        } else if (number < 100) {

            console.log('less than 3 digits');

            const length = 3 - `${number}`.length;

            for (let i = 0; i < length; i += 1) {

                number = `0${number}`;

            }

        }

        this.data.y = `${number}`;

    }

    splitNumbers(number = this.data.y) {

        // console.log(this.data.y.trim().length);
        // console.log(number.trim().length);
        console.log(number.length);
        console.log(this.counter);

        number = number.split('');

        for (let i = 0; i < number.length; i += 1) {

            this.counter.digits[i].latest = parseInt(number[i]);

        }

        this.data.y = number;

    }

    //
    //
    //
    //
    //
    //


    swapNumbers() {

        console.log('');
        console.log('swapNumbers()');

        const speed = this.speed / 1000;
        const $strips = this.counter.dom.find('.hero__number > g');

        for (let i = 0; i < 3; i += 1) {

            const current = this.counter.digits[i].current;
            const latest = this.counter.digits[i].latest;

            console.log(this.data.y);
            console.log(`${current} | ${latest}`);

            if (current !== latest) {

                console.log('ANIMATE!');

                const $digits = $strips.eq(i).find('text');
                const $current = $digits.eq(current);
                const $latest = $digits.eq(latest);

                console.log($current);
                console.log($latest);

                // TweenMax.to($current, speed, {opacity: 0, y: -20});
                // TweenMax.fromTo($latest, speed, {opacity: 0, y: 20}, {opacity: 1, y: 0});

                // TweenMax.to($current, speed, {attr: {opacity: 0, y: -20}});
                TweenMax.fromTo($current, speed / 2, {attr: {opacity: 1, y: 0}}, {attr: {opacity: 0, y: -10}});
                TweenMax.fromTo($latest, speed, {attr: {opacity: 0, y: 10}}, {attr: {opacity: 1, y: 0}});


                // 'transform': `translate(${x}px, ${y}px)`,

                this.counter.digits[i].current = latest;

            }

        }

        console.log('');

    }

    scaleNumber() {

        // Exponential growth

        const length = this.invertNumber() / this.size.svgHeight * 100; // instead of dividing at the end just times by a higher number to lessen the length?
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

    // generateNumbers(current, latest) {
    //
    //     const length = Math.ceil(this.speed / 200);
    //     const difference = current > latest ? current - latest : latest - current;
    //     const direction = current > latest ? -1 : 1;
    //     const increment = difference / length * direction;
    //     const numbers = [current];
    //
    //     console.log(`current    : ${current}`);
    //     console.log(`latest     : ${latest}`);
    //     console.log(`length     : ${length}`);
    //     console.log(`difference : ${difference}`);
    //     console.log(`increment  : ${increment}`);
    //
    //     for (let i = 1; i < length + 1; i += 1) {
    //
    //         numbers[i] = numbers[i - 1] += increment;
    //
    //     }
    //
    //     console.log(numbers);
    //
    // }

    animateSequence() {

        this.graph.animate(
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
