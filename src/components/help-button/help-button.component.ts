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
                    click: true,
                    clickTime: 'exit'
                },
                {
                    intro: "For this tour we will use this one as an example.",
                    element: 'app-visualization-picker div ul li',
                    click: true,
                    clickTime: 'exit'
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
                },
                {
                    intro: "If you want to make a screenshot of your visualization window, click here.",
                    element: '.mdl-layout__tab-panel.is-active app-screenshot-button button',
                },
                {
                    intro: "Finally you can close a visualization by clicking here",
                    element: '.mdl-layout__tab-app.is-active i',
                    click: true,
                    clickTime: 'exit',
                }
            ],
            showStepNumbers: false, // Hide step numbers
            showBullets: false,     // Hide bullets
            showProgress: true,     // Instead use progress bar
            overlayOpacity: 0.5,    // Set opacity of page overlay to 0.5
            nextLabel: "Next",      // Default has arrow, doesn't fit with material style
            prevLabel: "Back",      // Default has arrow, doesn't fit with material style
        });

        // This implements the click attribute in the steps so we can do things like opening menus in the tour
        // The clickTime attribute determines when in a step the click event is triggered
        // start means right when the tour gets to the element, exit right when it goes to the next
        // By default clickTime is 'start'
        let self = this;
        this.tour.onchange(function(element) {
            if(this._options.steps[this._currentStep].click && this._options.steps[this._currentStep].clickTime != 'exit' && element) {
                element.click();
            }

            if(this._options.steps[this._currentStep - 1] &&
                this._options.steps[this._currentStep - 1].click &&
                this._options.steps[this._currentStep - 1].clickTime == 'exit') {
                (document.querySelector(this._options.steps[this._currentStep - 1].element) as HTMLElement).click();
            }

            for (var i = this._currentStep; i < this._options.steps.length; i++) {
                var currentItem = this._introItems[i];
                var step = this._options.steps[i];

                if (step.element && document.querySelector(step.element)) {
                    currentItem.element = (document.querySelector(step.element) as HTMLElement);
                    currentItem.position = step.position;
                }

                if(step.element == '.mdl-layout__tab-panel.is-active') {
                    console.log(document.querySelector(step.element) as HTMLElement);
                }
            }
        });

        // Edge case for triggering a click on exiting the last step of the tour
        this.tour.onbeforeexit(function() {
            if(this._options.steps[this._currentStep - 1] &&
                this._options.steps[this._currentStep - 1].click &&
                this._options.steps[this._currentStep - 1].clickTime == 'exit') {
                (document.querySelector(this._options.steps[this._currentStep - 1].element) as HTMLElement).click();
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
