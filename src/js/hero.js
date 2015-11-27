const $ = require('jquery');
const Graph = require('./graph');

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
        this.instances = 3;

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
