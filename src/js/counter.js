const $ = require('jquery');
require('gsap'); /* global TweenMax, Sine */
require('snapsvg');

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

        this.Graph = Graph;
        this.size = 3;
        this.segment = this.randomiseSegment();
        this.relevance = 0;
        this.paper = this.Graph.generatePaper(this, 'counter');
        this.$wrapper = this.buildCounter();
        this.$number = this.$wrapper.find('> .hero__number');
        this.$point = this.$wrapper.find('> .hero__counter-point');
        this.digits = this.referenceDigits();
        this.prepDigits();
        this.obscure = 4;

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

        if (this.relevance > this.obscure) {

            this.obscureCounter({show: false});
            this.querySegment();
            this.relevance = 0; // reset relevance

        } else if (this.relevance === 2 ) {

            this.obscureCounter({show: true});

        }

    }

    obscureCounter({show}) {

        const speed = this.Graph.speed / 1000;
        const duration = 0.5;
        const delay = show ? 0 : speed - duration;
        const opacity = show ? 1 : 0;

        TweenMax.to([this.$point, this.$number], duration, {delay: delay, opacity: opacity});

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

    prepDigits() {

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
            'transform': 'translate(-14, -14)'
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

    positionCounter(init) {

        this.distillCoordinates();

        const speed = init ? 0 : this.Graph.speed / 1000;
        const x = this.Graph.x;
        const y = this.Graph.y;

        TweenMax.to(this.$wrapper, speed, {x: x, y: y, transformOrigin:'center center', ease: Sine.easeInOut});

    }

    cycleCounterText() {

        // Get the current 3 digit number
        // if < 3 digits prepent a 0 on the front
        // if > 3 digits === 999
        // split the number into the array
        // transition each number strip to their new value

        this.invertNumber();
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

                TweenMax.fromTo($current, speed, {attr: {opacity: 1, y: 0}}, {attr: {opacity: 0, y: -10}});
                TweenMax.fromTo($latest, speed, {attr: {opacity: 0, y: 10}}, {attr: {opacity: 1, y: 0}});

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

            scale *= 1.032;

        }

        TweenMax.to(this.$number, speed, {scale: scale / 100, transformOrigin: 'center center'});

    }

}

module.exports = Counter;
