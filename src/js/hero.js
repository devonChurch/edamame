const $ = require('jquery');
require('match-media');
const debounce = require('debounce');
const ifvisible = require('ifvisible.js');
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

    // ON LOAD: ////////////////////////////////////////////////////////////////

    // HERO...
    // find the width and height based on media query
    // set all relevance checks to true

    // GRAPH...
    // find the segment width based on current window width (set via hero)


    // ON RESIZE: //////////////////////////////////////////////////////////////

    // HERO...
    // rebuild the graph instances based on the new window width

    constructor() {

        this.$window = $(window);
        this.$wrapper = $('#hero');
        this.instances = 4;
        this.mobile = '768px';

        setTimeout(() => {

            this.initialise();
            this.windowChangeListner();
            this.tabChangeListener();

        }, 0);

    }

    windowChangeListner() {

        const that = this;

        this.$window
            .on('resize', () => {

                debounce(() => {

                    that.setViewport();
                    that.resumeAnimation();

                }, 1000);

            })
            .on('scroll', () => {

                debounce(() => {

                    that.setScrollView();
                    that.resumeAnimation();

                }, 200);

            });

    }

    tabChangeListener() {

        ifvisible
            .on('blur', () => {

                this.setTabActive(false);
                this.resumeAnimation();

            })
            .on('focus', () => {

                this.setTabActive(true);
                this.destroyGraphInstances();
                this.initialise();

            });

    }

    initialise() {

        this.createRelevance();
        this.calcSize();
        this.createGraphInstances();

    }

    calcSize() {

        const height = 300;
        const width = 1024;

        this.size = {height, width};

    }

    createGraphInstances() {

        this.Graphs = [];

        for (let i = 0; i < this.instances; i += 1) {

            this.Graphs[i] = new Graph(this, i);

        }

    }

    destroyGraphInstances() {

        for (let i = 0; i < this.instances; i += 1) {

            this.Graphs[i].animateCallback = () => {};
            this.Graphs[i].$wrapper.remove();
            // this.$wrapper.find(`#hero__spline-${i}, #hero__counter-${i}`).remove();

        }

    }

    getOffset(i) {

        const offset = 2; // % base

        return i + offset; // negitive offset

    }

    createRelevance() {

        this.relevance = {};

        this.setTabActive(ifvisible.now());
        this.setScrollView();
        this.setViewport();

    }

    testRelevance() {

        return this.relevance.tabActive && this.relevance.scrollView && this.relevance.viewport;

        // Current media query?
        // Is the hero in view (scroll)?
        // Is the tab active?


    }

    setTabActive(state) {

        this.relevance.tabActive = state;

    }

    setScrollView() {

        const scrollView = this.$window.scrollTop() < (this.$wrapper.offset().top + this.$wrapper.outerHeight());

        this.relevance.scrollView = scrollView;

    }

    setViewport() {

        const viewport = typeof matchMedia === 'function' ? matchMedia(`(min-width: ${this.mobile})`).matches : true;

        this.relevance.viewport = viewport;

    }

    resumeAnimation() {

        if (this.testRelevance()) {

            for (let i = 0; i < this.instances; i += 1) {

                if (!this.Graphs[i].animation) {

                    this.Graphs[i].animateCallback();

                }

            }

        }

    }

}

module.exports = new Hero();
