const $ = require('jquery');
require('match-media');
const debounce = require('debounce');
const ifvisible = require('ifvisible.js');
const Graph = require('./graph');

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\

db   db d88888b d8888b.  .d88b.
88   88 88'     88  `8D .8P  Y8.
88ooo88 88ooooo 88oobY' 88    88
88~~~88 88~~~~~ 88`8b   88    88
88   88 88.     88 `88. `8b  d8'
YP   YP Y88888P 88   YD  `Y88P'

The main component Class that nests the other Class based references inside
itself i.e.

[EDAMAME]
  —> Graph
    —> Spline
    —> Counter

In addition to holding the more “global” references to the execution, we also
check for the animation “relevance”. This functionality pauses the Graph’s
animation when the following conditions are not met:

-> The tab is active.
-> The component is in the viewport.
-> The current media query is greater than mobile dimensions.

\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

class Edamame {

    constructor({injectInto = $('body')} = {}) {

        this.$window = $(window);
        this.$wrapper = this.generateWrapper(injectInto);
        // How many graphs (x1 spline / counter combos) to build.
        this.instances = 4;
        // Anything less than this will not invoke animation.
        this.mobile = '768px';

        // Wait for the next CPU cycle then begin initialising the component.
        setTimeout(() => {

            this.initialise();
            this.windowChangeListner();
            this.tabChangeListener();

        }, 0);

    }

    generateWrapper(injectInto) {

        const $wrapper = $('<div id="edamame" class="edamame" />');

        injectInto.append($wrapper);

        return $wrapper;

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

        }

    }

    createRelevance() {

        this.relevance = {};

        this.setTabActive(ifvisible.now());
        this.setScrollView();
        this.setViewport();

    }

    testRelevance() {

        // Every animation loop we check to see if we should invoke another set
        // of animations. In no animation is needed then we save the CPU cycles
        // for something else.

        return this.relevance.tabActive && this.relevance.scrollView && this.relevance.viewport;

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

        // If one of the animation “relevance” settings changes then we try to
        // ping the animation callback.

        if (this.testRelevance()) {

            for (let i = 0; i < this.instances; i += 1) {

                if (!this.Graphs[i].animation) {

                    this.Graphs[i].animateCallback();

                }

            }

        }

    }

}

module.exports = Edamame;
