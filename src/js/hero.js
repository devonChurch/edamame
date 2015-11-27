const $ = require('jquery');
require('gsap'); /* global TweenMax, TimelineMax, Linear */
require('snapsvg'); /* global Snap, mina */

// Hero
    // Graph
        // Spline
        // Counter

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\

 .o88b.  .d88b.  db    db d8b   db d888888b d88888b d8888b.
d8P  Y8 .8P  Y8. 88    88 888o  88 `~~88~~' 88'     88  `8D
8P      88    88 88    88 88V8o 88    88    88ooooo 88oobY'
8b      88    88 88    88 88 V8o88    88    88~~~~~ 88`8b
Y8b  d8 `8b  d8' 88b  d88 88  V888    88    88.     88 `88.
 `Y88P'  `Y88P'  ~Y8888P' VP   V8P    YP    Y88888P 88   YD

\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

 class Counter {

    constructor (Graph) {

        console.log(`Constructing Counter| id = ${Graph.i}`);

        this.Graph = Graph;
        this.size = 3; // what to name???
        this.segment = this.randomiseSegment();
        this.relevance = 0;
        this.paper = this.Graph.generatePaper('counter');
        this.$wrapper = this.buildCounter();
        this.$number = this.$wrapper.find('> .hero__number');
        this.$point = this.$wrapper.find('> .hero__counter-point');
        this.digits = this.referenceDigits();
        // this.prepElements();
        this.obscure = this.obscureCounter();

    }

    randomiseSegment() {

        const max = this.Graph.size.total - 2;

        return this.Graph.randomise(max);

    }

    querySegment() {

        let latest;

        do {

            latest = this.randomiseSegment();

        } while (this.segment === latest);

        this.segment = latest;

    }

    checkRelevance() {

        this.relevance += 1;

        if (this.relevance > 4) {

            this.obscure.restart();
            this.querySegment();
            this.relevance = 0; // reset relevance

        }

    }

    obscureCounter() {

        const timeline = new TimelineMax();
        const speed = this.Graph.speed / 1000;
        const duration = 0.5;
        const delay = speed - duration;

        timeline
            .stop()
            .delay(delay)
            .to([this.$point, this.$number], duration, {opacity: 0})
            .to([this.$point, this.$number], duration, {opacity: 1}, `+=${speed + delay}`);

        return timeline;

    }

    buildCounter() {

        const x = 0;
        const y = 0;
        const bigCircle = this.paper.circle(x, y, 30).attr('class', 'hero__counter-alignment');
        const smallCircle = this.paper.circle(x, y, 5).attr('class', 'hero__counter-point');
        const numbers = this.buildNumbers();
        this.paper.group(bigCircle, smallCircle, numbers).attr('class', 'hero__counter-anchor');
        const $wrapper = this.Graph.Hero.$wrapper.find(`#hero__counter-${this.Graph.i} .hero__counter-anchor`);

        return $wrapper;

    }

    referenceDigits() {

        const $strips = this.$number.find('> g');
        const digits = [];

        for (let i = 0; i < this.size; i += 1) {

            digits[i] = {
                $dom: $strips.eq(i).find('text'),
                current: null
            };

        }

        return digits;

    }

    prepElements() {

        // TweenMax.set([this.$point, this.$number], {opacity: 0});

        for (let i = 0; i < this.digits.length; i += 1) {

            TweenMax.set(this.digits[i].$dom, {attr: {opacity: 0}});

        }

    }

    buildNumbers() {

        /*

        wrapper
         --> number
              --> strip
                    --> 0, 1, 2, 3, 4, 5, 6, 7, 8, 9

        */

        const numbers = this.paper.g().attr({
            'class': 'hero__number',
            'transform': 'translate(-17-14)'
        });

        for (let i = 0; i < 3; i += 1) {

            const strip = this.paper.g();

            for (let j = 0; j < 10; j += 1) {

                const x = 10 * i;
                const y = 0;
                const text = this.paper.text(x, y, `${j}`);

                strip.add(text);

            }

            numbers.add(strip);

        }

        return numbers;

    }

    distillCoordinates() {

        this.Graph.x = this.Graph.x[this.segment];
        this.Graph.y = this.Graph.y[this.segment];

    }

    positionCounter({init} = {}) {

        this.distillCoordinates();

        const speed = init ? 0 : this.Graph.speed / 1000;
        const x = this.Graph.x;
        const y = this.Graph.y;

        TweenMax.to(this.$wrapper, speed, {x: x, y: y, transformOrigin:'center center', ease: Linear.easeNone});

    }

    cycleCounterText() {

        // Get the current 3 digit number
        // if < 3 digits prepent a 0 on the front
        // if > 3 digits === 999
        // split the number into the array
        // transition each number strip to their new value

        this.invertNumber();
        this.increaseNUmber();
        this.roundNumber();
        this.inspectNumber();
        this.scaleNumber();
        this.splitNumber();
        this.swapNumber();

    }

    roundNumber(number = this.Graph.y) {

        this.Graph.y = Math.round(number);

    }

    invertNumber(number = this.Graph.y) {

        this.Graph.y = this.Graph.Hero.size.height - number / 2;

    }

    increaseNUmber() {

        this.Graph.y *= 3;

    }

    inspectNumber(number = this.Graph.y) {

        if (number > 999) {

            number = 999;

        } else if (number < 100) {

            const length = 3 - `${number}`.length;

            for (let i = 0; i < length; i += 1) {

                number = `0${number}`;

            }

            number = parseInt(number, 10);

        }

        this.Graph.y = number;

    }

    splitNumber(number = this.Graph.y) {

        number = `${number}`.split('');

        for (let i = 0; i < number.length; i += 1) {

            this.digits[i].latest = parseInt(number[i]);

        }

        this.Graph.y = number;

    }

    swapNumber() {

        const speed = this.Graph.speed / 1000 / 2;

        for (let i = 0; i < this.size; i += 1) {

            const current = this.digits[i].current;
            const latest = this.digits[i].latest;

            if (current !== latest) {

                const $current = this.digits[i].$dom.eq(current);
                const $latest = this.digits[i].$dom.eq(latest);

                // TweenMax.fromTo($current, speed, {attr: {opacity: 1, y: 0}}, {attr: {opacity: 0, y: -10}});
                TweenMax.fromTo($current, speed, {attr: {y: 0}}, {attr: {y: -10}});
                // TweenMax.fromTo($latest, speed, {attr: {opacity: 0, y: 10}}, {attr: {opacity: 1, y: 0}});
                TweenMax.fromTo($latest, speed, {attr: {y: 10}}, {attr: {y: 0}});

                this.digits[i].current = latest;

            }

        }

    }

    scaleNumber() {

        // Exponential growth

        const speed = this.Graph.speed / 1000;
        const length = this.Graph.y / 1.5;
        let scale = 1;

        for (let i = 0; i < length; i += 1) {

            scale *= 1.035;

        }

        TweenMax.to(this.$number, speed, {scale: scale / 100, transformOrigin: 'center center'});

    }

}

// Hero
    // Graph
        // Spline
        // Counter

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\

.d8888. d8888b. db      d888888b d8b   db d88888b
88'  YP 88  `8D 88        `88'   888o  88 88'
`8bo.   88oodD' 88         88    88V8o 88 88ooooo
  `Y8b. 88~~~   88         88    88 V8o88 88~~~~~
db   8D 88      88booo.   .88.   88  V888 88.
`8888Y' 88      Y88888P Y888888P VP   V8P Y88888P

\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

class Spline {

    constructor (Graph) {

        console.log(`Constructing Spline| id = ${Graph.i}`);

        this.Graph = Graph;
        this.paper = this.Graph.generatePaper('spline');
        this.svg = this.paper.path(this.createSpline());

    }

    createSpline() {

        this.resetSplineData();
        this.generateSplineData();
        return this.generateSvgCode();

    }

    resetSplineData() {

        this.Graph.x = 0;
        this.Graph.y = 0;

        this.data = {
            m: {}, // Starting coordinates
            c: {}, // Initial cubic bezier curve
            s: [] // All proceeding smooth curves
        };

    }

    generateSplineData() {

        // generate path data in object format THEN build spline
        // this way you can pass in data and determain new offset based on previous coordinates
        // also we can build the animated circles with solid x and y positions

        this.buildM();
        this.buildC();

        // turn Graph data into an array and store the current coordinates
        // this far as the first reference.
        this.Graph.x = [this.Graph.x];
        this.Graph.y = [this.Graph.y];

        for (let i = 0; i < this.Graph.size.total - 1; i += 1) {

            this.buildS(i);

        }

    }

    buildM() { // startPoint

        const x1 = 0;
        const y1 = (this.Graph.Hero.size.height / 3 * 2) + (this.Graph.i * 5);

        this.Graph.x += x1;
        this.Graph.y += y1;
        this.data.m = {x1, y1};

        // return `M${x1},${y1}`;

    }

    buildC() { // cubicBezier

        const x1 = 0;
        const y1 = 0;
        const x2 = this.Graph.size.width;
        const y2 = 0;
        const xC = x2 / 2;
        const yC = this.offset(20, 20);

        this.Graph.x += x1 + x2;
        this.Graph.y += y1 + y2;
        this.data.c = {x1, y1, xC, yC, x2, y2};

        // return `c${x1},${y1}, ${xC},${yC}, ${x2},${y2}`;

    }

    buildS(i) { // smoothCurve

        const sX = this.offset(70, 20);
        const sY = sX / 2.5 * i;
        const x1 = this.Graph.size.width;
        const y1 = this.Graph.randomise(25, 10) * i / 2 * -1;

        this.Graph.x[i + 1] = this.Graph.x[i] + x1;
        this.Graph.y[i + 1] = this.Graph.y[i] + y1;
        this.data.s[i] = {sX, sY, x1, y1};

        // return `s${sX},{sY}, ${x1},${y1}`;

    }

    offset(base, variance) {

        return this.Graph.randomise(1) === 0 ? base + this.Graph.randomise(variance) : base - this.Graph.randomise(variance);

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
        svg += `V${this.Graph.Hero.size.height} H${0} z`;

        return svg;

    }

}

// Hero
    // Graph
        // Spline
        // Counter

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\

 d888b  d8888b.  .d8b.  d8888b. db   db
88' Y8b 88  `8D d8' `8b 88  `8D 88   88
88      88oobY' 88ooo88 88oodD' 88ooo88
88  ooo 88`8b   88~~~88 88~~~   88~~~88
88. ~8~ 88 `88. 88   88 88      88   88
 Y888P  88   YD YP   YP 88      YP   YP

\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

class Graph {

    constructor (Hero, i) {

        this.Hero = Hero;

        this.i = i;
        this.size = this.calcSize();
        this.x = 0;
        this.y = 0;
        this.speed = 1000 * (this.i + 1);

        this.Spline = new Spline(this);
        this.Counter = new Counter(this);

        // Prep
        this.fadeGraph();
        this.Counter.positionCounter({init: true});
        this.Counter.cycleCounterText({init: true});

        setTimeout(() => {
            this.animateCallback();
        }, 100);

    }

    calcSize() {

        const total = this.i + 4;
        const width = this.Hero.size.width / total;

        return {total, width};

    }

    randomise(max, min = 0) {

        const random =  Math.floor(Math.random() * (max - min + 1)) + min;

        return random;

    }

    generatePaper(type) {

        this.Hero.$wrapper.append($(`
            <svg id="hero__${type}-${this.i}"
                 class="hero__${type} hero__svg"
                 xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 ${this.Hero.size.width} ${this.Hero.size.height}"
                 preserveAspectRatio="xMidYMid meet" />`));

        return Snap(`#hero__${type}-${this.i}`);

    }

    fadeGraph() {

        var opacity = 1 / this.Hero.instances * (this.i + 1);

        this.Spline.paper.attr('opacity', opacity);
        this.Counter.paper.attr('opacity', opacity);

    }

    animateSequence() {

        this.Spline.svg.animate(
			{ path: this.Spline.createSpline() },
			this.speed,
			mina.linear,
			() => {
                this.animateCallback();
            }
        );

    }

    animateCallback() {
        this.animateSequence();
        this.Counter.positionCounter();
        this.Counter.cycleCounterText();
        this.Counter.checkRelevance();
    }

}

// Hero
    // Graph
        // Spline
        // Counter

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\

db   db d88888b d8888b.  .d88b.
88   88 88'     88  `8D .8P  Y8.
88ooo88 88ooooo 88oobY' 88    88
88~~~88 88~~~~~ 88`8b   88    88
88   88 88.     88 `88. `8b  d8'
YP   YP Y88888P 88   YD  `Y88P'

\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

class Hero {

    constructor() {

        this.$window = $(window);
        this.$wrapper = $('#hero');
        this.size = this.calcSize();
        this.instances = 1;

        this.graphInstances();

    }

    // listeners() {
    //
    //     this.$window.on('resize', () => {
    //
    //         this.graphInstances();
    //
    //     }).on('scroll', () => {
    //
    //         this.testViewPort();
    //
    //     }).resize().scroll();
    //
    // }

    calcSize() {

        const height = 300;
        const width = 1024;

        return {height, width};

    }

    graphInstances() {

        this.Graphs = [];

        for (let i = 0; i < this.instances; i += 1) {

            this.Graphs[i] = new Graph(this, i);

        }

    }

    // testViewPort() {
    //
    // }

}

module.exports = new Hero();

// { // Create hero instances...
//
//     const hero = $('.hero');
//     const instances = [];
//
//     for (let i = 0; i < hero.length; i += 1) {
//
//         instances[i] = new Hero();
//
//     }
//
// }
