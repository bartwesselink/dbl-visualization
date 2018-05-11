import {Component, OnInit} from '@angular/core';
import {introJs} from 'intro.js';

@Component({
    selector: 'app-help-button',
    templateUrl: './help-button.component.html',
})
export class HelpButtonComponent implements OnInit{
    /** @author Mathijs Boezer */
    private tour: any;

    ngOnInit(): void {
        this.tour = introJs();

        /** Each step in the tour is followed in the same order as entered in the steps array below
         *  Each step has the following format:
         *  {
         *      intro: message
         *      element: element selector
         *      position: {left|right|top|bottom} (relative to the element)
         *  }
         *
         *  Only intro is required, if element is left out that step is not anchored to any object and floats in the center
         *  if the position is left it chooses one according to how much space there is on either side of the element
        */

        this.tour.setOptions({
            steps: [
                {
                    intro: "This short tour will explain how to use this website to visualize a Newick dataset."
                },
                {
                    intro: "This is the upload button, by clicking it you will be able to select your Newick dataset and upload it.",
                    element: 'app-upload-tool label'
                },
                {
                    intro: "This bar contains the visualization tabs, each tab represents a visualization of your dataset.",
                    element: '.mdl-layout__tab-bar-container'
                },
                {
                    intro: "To add a new visualization to the tabs, click here and choose one of the options.",
                    element: 'app-visualization-picker > button',
                    clickExit: true,
                },
                {
                    intro: "For this tour we will use this one as an example.",
                    element: 'app-visualization-picker div ul li',
                    clickExit: true,
                },
                {
                    intro: "Here you will be able to see your dataset as a tree with nodes you can collapse and expand.",
                    element: '.sidebar-content',
                    position: "left"
                },
                {
                    intro: "This is the visualization window, your dataset will be visualized here according to your selected visualization.",
                    element: '.mdl-layout__tab-panel.is-active'
                },
                {
                    intro: "If you want to change something about the current visualization, click here.",
                    element: '.mdl-layout__tab-panel.is-active app-visualization-settings-button button',
                    clickStart: true,
                    clickExit: true,
                    position: 'right'
                },
                {
                    intro: "If you want to make a screenshot of your visualization window, click here.",
                    element: '.mdl-layout__tab-panel.is-active app-screenshot-button button',
                },
                {
                    intro: "Finally you can close a visualization by clicking here",
                    element: '.mdl-layout__tab-app.is-active i',
                    clickExit: true,
                }
            ],
            showStepNumbers: false, // Hide step numbers
            showBullets: false,     // Hide bullets
            showProgress: true,     // Instead use progress bar
            overlayOpacity: 0.5,    // Set opacity of page overlay to 0.5
            nextLabel: "Next",      // Default has arrow, doesn't fit with material style
            prevLabel: "Back",      // Default has arrow, doesn't fit with material style
        });

        // This implements the click attributes in the steps so we can do things like opening menus in the tour
        // clickStart clicks the selected element when the tour gets to that element, and exit when it leaves.
        this.tour.onchange(function(element) {
            if(this._options.steps[this._currentStep].clickStart && element) {
                element.click();
            }

            if(this._options.steps[this._currentStep - 1] &&
                this._options.steps[this._currentStep - 1].clickExit) {
                this._introItems[this._currentStep - 1].element.click();
            }

            // Update the tour elements for if new elements have been added since the tour started (in our case the canvas and its buttons)
            for (let i = this._currentStep; i < this._options.steps.length; i++) {
                let currentItem = this._introItems[i];
                let step = this._options.steps[i];

                if (step.element && document.querySelector(step.element)) {
                    currentItem.element = (document.querySelector(step.element) as HTMLElement);
                    currentItem.position = step.position;
                }
            }
        });

        // Edge case for triggering a click on exiting the last step of the tour
        this.tour.onbeforeexit(function() {
            if(this._options.steps[this._currentStep - 1] &&
                this._options.steps[this._currentStep - 1].clickExit) {
                this._introItems[this._currentStep - 1].element.click();
            }
        })
    }

    public startTour(): void {
        if(this.tour) {
            this.tour.start();
        }
    }
    /** @end-author Mathijs Boezer */
}
