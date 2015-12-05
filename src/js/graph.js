const $ = require('jquery');
require('snapsvg'); /* global Snap, mina */
require('gsap'); /* global TweenMax, Sine */
const Spline = require('./spline');
const Counter = require('./counter');

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
        this.animation = true;

        this.$wrapper = this.buildWrapper();
        this.Spline = new Spline(this);
        this.Counter = new Counter(this);

        // Prep
        this.fadeGraph();
        this.setOffset();
        this.Counter.positionCounter({init: true});
        this.Counter.cycleCounterText({init: true});

        setTimeout(this.animateCallback(), 100);

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

    buildWrapper() {

        const $wrapper = $(`
            <div id="hero__graph-${this.i}"
                 class="hero__graph" />`);
                //  style="width: ${100 + this.Hero.getOffset(this.i)}%"/>`);

        this.Hero.$wrapper.append($wrapper);

        return $wrapper;

    }

    generatePaper(that, type) {

        that.Graph.$wrapper.append($(`
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

    setOffset() {

        this.offset =  this.i % 2 * this.Hero.getOffset(this.i) * -1;
        TweenMax.set(this.$wrapper, {scale: (this.Hero.getOffset(this.i) / 100) + 1, transformOrigin:'left center', x: `${this.offset}%`});

    }

    toggleOffset() {

        const speed = this.speed / 1000;
        this.offset = this.offset === 0 ? this.Hero.getOffset(this.i) * -1 : 0;

        TweenMax.to(this.$wrapper, speed, {x: `${this.offset}%`, ease: Sine.easeInOut});

    }

    animateSequence() {

        // console.log('animateSequence()');

        this.Spline.svg.animate(
			{ path: this.Spline.createSpline() },
			this.speed,
			mina.easeinout,
			() => { this.animateCallback(); }
        );

    }

    animateCallback() {

        if (this.Hero.testRelevance()) {

            this.animateSequence();
            this.toggleOffset();
            this.Counter.positionCounter();
            this.Counter.cycleCounterText();
            this.Counter.checkRelevance();

            this.animation = true;

        } else {

            this.animation = false; // set to false as some animation could still be going inbetween becoming relevan . irellivent

        }

    }

}

module.exports = Graph;
