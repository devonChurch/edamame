const $ = require('jquery');
require('snapsvg');

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\

.d8888. d8888b. db      d888888b d8b   db d88888b
88'  YP 88  `8D 88        `88'   888o  88 88'
`8bo.   88oodD' 88         88    88V8o 88 88ooooo
  `Y8b. 88~~~   88         88    88 V8o88 88~~~~~
db   8D 88      88booo.   .88.   88  V888 88.
`8888Y' 88      Y88888P Y888888P VP   V8P Y88888P

Edamame
  —> Graph
    —> [SPLINE]
    —> Counter

This Class produces a Graph instance “wave” element. On every Graph animation
cycle, we dynamically create a new wave instance and animate to the new splines
path location using SnapSVG. Each generated wave instance has a randomised
structure and an exponential growth pattern from left to right. Each concurrent
Graph instance created from the Edamame Class will produce a wave with an
additional segment for further visual diversity.

\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

class Spline {

    constructor (Graph) {

        this.Graph = Graph;
        this.paper = this.Graph.generatePaper(this, 'spline');
        this.svg = this.paper.path(this.createSpline());

    }

    createSpline() {

        this.resetSplineData();
        // Build a generic data object with the path data.
        this.generateSplineData();
        // Transfer path data into SVG format.
        return this.generateSvgCode();

    }

    resetSplineData() {

        // The axis points for where the counter will reside on the current
        // spline path.
        this.Graph.x = 0;
        this.Graph.y = 0;

        this.data = {
            m: {}, // Starting coordinates
            c: {}, // Initial cubic bezier curve
            s: [] // All proceeding smooth curves
        };

    }

    generateSplineData() {

        this.buildM();
        this.buildC();

        // Turn Graph data into an array and store the current coordinates
        // thus far as the first reference. This will make it easy for the
        // counter to select a random segment from the array to transition to it
        // location.
        this.Graph.x = [this.Graph.x];
        this.Graph.y = [this.Graph.y];

        for (let i = 0; i < this.Graph.size.total - 1; i += 1) {

            this.buildS(i);

        }

    }

    buildM() {

        // Starting Point:
        // Generates -> `M${x1},${y1}`;

        const x1 = 0;
        const y1 = (this.Graph.Edamame.size.height / 3 * 2) + (this.Graph.i * 5);

        this.Graph.x += x1;
        this.Graph.y += y1;
        this.data.m = {x1, y1};

    }

    buildC() {

        // Cubic Bezier curve
        // Generates -> `c${x1},${y1}, ${xC},${yC}, ${x2},${y2}`;

        const x1 = 0;
        const y1 = 0;
        const x2 = this.Graph.size.width;
        const y2 = 0;
        const xC = x2 / 2;
        const yC = this.offset(20, 20);

        this.Graph.x += x1 + x2;
        this.Graph.y += y1 + y2;
        this.data.c = {x1, y1, xC, yC, x2, y2};

    }

    buildS(i) {

        // Smooth Curve
        // Generates -> `s${sX},{sY}, ${x1},${y1}`;

        const sX = this.offset(70, 20);
        const sY = sX / 2.5 * i;
        const x1 = this.Graph.size.width;
        const y1 = this.Graph.randomise(25, 10) * i / 2 * -1;

        this.Graph.x[i + 1] = this.Graph.x[i] + x1;
        this.Graph.y[i + 1] = this.Graph.y[i] + y1;
        this.data.s[i] = {sX, sY, x1, y1};

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
        svg += `V${this.Graph.Edamame.size.height} H${0} z`;

        return svg;

    }

}

module.exports = Spline;
