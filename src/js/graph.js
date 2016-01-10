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

 Edamame
  —> [GRAPH]
    —> Spline
    —> Counter

A wrapper for the Spline and Counter portions of a Graph instance. The animation
initialiser for the Graph wrapper and the nested Spline and Counter is
controlled here.

\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

class Graph {

    constructor (Edamame, i) {

        this.Edamame = Edamame;

        this.i = i;
        this.size = this.calcSize();
        // the x and y position of the current spline segment where the counter
        // will reside for its current duration.
        this.x = 0;
        this.y = 0;
        // Animation speed for the graph x-offset,  the spline “wave” animation
        // and the counter displacement.
        this.speed = 1000 * (this.i + 1);
        // A hook for the “animation relevance” checks in the Edamame module. If
        // the Edamame pings a callback but the current animation cycle is still
        // going we do not want to run an additional animation sequence so
        // instead we would change this boolean from “false” to “true” and the
        // animation will continue seamlessly.
        this.animation = true;

        // Create elements:
        this.$wrapper = this.buildWrapper();
        this.Spline = new Spline(this);
        this.Counter = new Counter(this);

        // Prep elements:
        this.fadeGraph();
        // A number that acts as a percentage for both scale and x-axis offset
        this.displacement = this.i + 1;
        this.setOffset();
        this.Counter.positionCounter({init: true});
        this.Counter.cycleCounterText({init: true});

        setTimeout(this.animateCallback(), 100);

    }

    calcSize() {

        const total = this.i + 4;
        const width = this.Edamame.size.width / total;

        return {total, width};

    }

    randomise(max, min = 0) {

        const random =  Math.floor(Math.random() * (max - min + 1)) + min;

        return random;

    }

    buildWrapper() {

        const $wrapper = $(`
            <div id="edamame__graph-${this.i}"
                 class="edamame__graph" />`);

        this.Edamame.$wrapper.append($wrapper);

        return $wrapper;

    }

    generatePaper(that, type) {

        that.Graph.$wrapper.append($(`
            <svg id="edamame__${type}-${this.i}"
                 class="edamame__${type} edamame__svg"
                 xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 ${this.Edamame.size.width} ${this.Edamame.size.height}"
                 preserveAspectRatio="xMidYMid meet" />`));

        return Snap(`#edamame__${type}-${this.i}`);

    }

    fadeGraph() {

        // Each graph has a staggered opacity that culminates at 100% on the
        // last instance.

        var opacity = 1 / this.Edamame.instances * (this.i + 1);

        this.Spline.paper.attr('opacity', opacity);
        this.Counter.paper.attr('opacity', opacity);

    }

    setOffset() {

        // Setting the graph offset to be either 0 or the displacement value.
        // Offsets alternate between each instance off the Graph generation
        // loop. The graph scale is also increased proportionally to the maximum
        // displacement so that there are no bleed issue during the transitions.

        this.offset =  this.i % 2 * this.displacement * -1;
        TweenMax.set(this.$wrapper, {scale: (this.displacement / 100) + 1, transformOrigin:'left center', x: `${this.offset}%`});

    }

    toggleOffset() {

        // At each animation loop we alternate the current offset between 0 and
        // the displacement value.

        const speed = this.speed / 1000;
        this.offset = this.offset === 0 ? this.displacement * -1 : 0;

        TweenMax.to(this.$wrapper, speed, {x: `${this.offset}%`, ease: Sine.easeInOut});

    }

    animateSpline() {

        // Runs a single animation loop of the Spline transition. We use
        // SnapSVG’s animation callback to re-run this and the other animation
        // sets again (if deemed relevant by the Edamame Class).

        this.Spline.svg.animate(
			{ path: this.Spline.createSpline() },
			this.speed,
			mina.easeinout,
			() => { this.animateCallback(); }
        );

    }

    animateCallback() {

        // Either starts or stops the animation process based on the “animation
        // relevance” check in the Edamame Class.

        if (this.Edamame.testRelevance()) {

            this.animateSpline();
            this.toggleOffset();
            this.Counter.positionCounter();
            this.Counter.cycleCounterText();
            this.Counter.checkRelevance();

            this.animation = true;

        } else {

            // We set the animation boolean to false as some animations could
            // still be running in-between becoming relevant / irrelevant (which
            // would result in two animations being called during the same
            // transition loop).
            this.animation = false;

        }

    }

}

module.exports = Graph;
