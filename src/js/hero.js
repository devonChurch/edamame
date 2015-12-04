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

        // this.relevance = this.createRelevance();
        // this.calcSize();



        this.initialise();

        this.windowChangeListner();
        this.tabChangeListener();

        // this.createcreateGraphInstances();

    }

    windowChangeListner() {

        this.$window
            .on('resize', () => {

                const callback = this.setViewport();
                debounce(callback, 1000);

            })
            .on('scroll', () => {

                const callback = this.setScrollView();
                debounce(callback, 200);

            });

    }

    tabChangeListener() {

        ifvisible
            .on('blur', () => this.setTabActive(false))
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
            this.$wrapper.find(`#hero__spline-${i}, #hero__counter-${i}`).remove();

        }

    }

    createRelevance() {

        this.relevance = {};

        this.setTabActive(ifvisible.now());
        this.setScrollView();
        this.setViewport();

    }

    testRelevance() {

        console.log(`${this.relevance.tabActive} && ${this.relevance.scrollView} && ${this.relevance.viewport}`);

        return this.relevance.tabActive && this.relevance.scrollView && this.relevance.viewport;

        // Current media query?
        // Is the hero in view (scroll)?
        // Is the tab active?


    }

    setTabActive(state) {

        this.relevance.tabActive = state;
        this.resumeAnimation();

    }

    setScrollView() {

        const scrollView = this.$window.scrollTop() < (this.$wrapper.offset().top + this.$wrapper.outerHeight());

        console.log(scrollView);

        this.relevance.scrollView = scrollView;
        this.resumeAnimation();

    }

    setViewport() {

        const viewport = matchMedia(`(min-width: ${this.mobile})`).matches;

        this.relevance.viewport = viewport;
        this.resumeAnimation();

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
