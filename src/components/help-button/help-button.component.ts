import {Component, ElementRef, Input, OnInit} from '@angular/core';
import * as introJs from 'intro.js';

@Component({
    selector: 'app-help-button',
    templateUrl: './help-button.component.html',
})
export class HelpButtonComponent implements OnInit{
    /** @author Mathijs Boezer */

    @Input() container: Element;

    private tour: any;

    ngOnInit(): void {
        this.tour = introJs(this.container);

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
                    intro: "This short tour will explain how to use this website to visualize a Newick dataset.",
                    execute: () => {
                        // close all tabs to make sure we don't accidentally create a third side-by-side tab
                        let buttons = document.querySelectorAll(".holder-header-close");
                        for(let i = 0; i < document.querySelectorAll(".holder-header-close").length; i++) {
                            (buttons[i] as HTMLElement).click(); // close tab
                        }
                    }
                },
                {
                    intro: "To visualize something, you need a dataset. There are a couple of options you can choose."
                },
                {
                    intro: "Either you upload a dataset by clicking this button.",
                    element: ".mdi-upload"
                },
                {
                    intro: "Or you choose one of the datasets we provide.",
                    element: ".data-selection-chevron",
                    clickStart: true,
                },
                {
                    intro: "For the tour we will be using the Phyloviz dataset.",
                    element: ".data-selection-menu .dropdown",
                    execute: () => {
                        (document.querySelector(".data-selection-chevron") as HTMLElement).click(); // close menu
                        (document.querySelector(".data-selection-list li") as HTMLElement).click(); // close menu
                        (document.querySelector("app-visualization-picker .header-button-icon") as HTMLElement).click(); // open visualization picker dropdown
                    },
                },
                {
                    intro: "Now you can choose a visualization, for the tour we use the Generalized Pythagoras Tree.",
                    execute: () => {
                        (document.querySelectorAll(".visualization-picker-dropdown-item")[1] as HTMLElement).click(); // TODO When the demo tree is gone this could be index 0
                    }
                },
                {
                    intro: "Here you can see the Phyloviz dataset visualized with the Generalized Pythagoras Tree visualization.",
                },
                {
                    intro: "In the canvas you are able to move around using either the keyboard, the mouse or the navigation widget. You can also click on a node to select it and move to it."
                },
                {
                    intro: "On the right side of the page you can find the tree navigator. Here you can select nodes, open their subtrees, export the current tree as a Newick file, and browse through the hierarchy.",
                    execute: () => {
                        (document.querySelector(".settings-button") as HTMLElement).click(); // open visualization settings
                    }
                },
                {
                    intro: "Each visualization has settings you can tweak. For example the Generalized Pythagoras Tree allows you to increase the height of the rectangles.",
                    execute: () => {
                        (document.querySelector(".settings-button") as HTMLElement).click(); // close visualization settings
                        (document.querySelector("app-general-settings-button .header-button-icon") as HTMLElement).click(); // open general settings
                    }
                },
                {
                    intro: "There are also settings for the entire page. These include, dark mode, alternate colors for the gradients, different types of gradients and more!",
                    execute: () => {
                        (document.querySelector("app-general-settings-button .header-button-icon") as HTMLElement).click(); // close general settings
                    }
                },
                {
                    intro: "That wraps up the tour, if you ever need help, you can go through the tour again by clicking here.",
                    element: "app-help-button .header-button-icon"
                }

            ],
            showStepNumbers: false, // Hide step numbers
            showBullets: false,     // Hide bullets
            showProgress: true,     // Instead use progress bar
            overlayOpacity: 0.0,    // Set opacity of page overlay to 0.5
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

            if(this._options.steps[this._currentStep - 1] &&
                this._options.steps[this._currentStep - 1].execute) {
                this._options.steps[this._currentStep - 1].execute();
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

        // Edge case for triggering a click or a execute on exiting the last step of the tour
        this.tour.onbeforeexit(function() {
            if(this._options.steps[this._currentStep - 1] &&
                this._options.steps[this._currentStep - 1].clickExit) {
                this._introItems[this._currentStep - 1].element.click();
            }

            if(this._options.steps[this._currentStep - 1] &&
                this._options.steps[this._currentStep - 1].execute) {
                this._options.steps[this._currentStep - 1].execute();
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
