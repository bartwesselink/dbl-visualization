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
                    intro: "Here you will be able to see your dataset as a tree with nodes you can collapse and expand.",
                    element: '.sidebar-content',
                    position: "left"
                },
                {
                    intro: "This bar contains the visualization tabs, each tab represents a visualization of your dataset.",
                    element: '.mdl-layout__tab-bar-container'
                },
                {
                    intro: "To add a new visualization to the tabs, click here and choose one of the options.",
                    element: 'app-visualization-picker > button'
                },
                {
                    intro: "This is the visualization window, your dataset will be visualized here according to your selected visualization.",
                    element: '.mdl-layout__tab-panel.is-active'
                },
                {
                    intro: "If you want to change something about the current visualization, click here.",
                    element: '.mdl-layout__tab-panel.is-active app-settings-button button'
                },
                {
                    intro: "If you want to make a screenshot of your visualization window, click here.",
                    element: '.mdl-layout__tab-panel.is-active app-screenshot-button button'
                }
            ],
            showStepNumbers: false, // Hide step numbers
            showBullets: false,     // Hide bullets
            showProgress: true,     // Instead use progress bar
            overlayOpacity: 0.5,    // Set opacity of page overlay to 0.5
            nextLabel: "Next",      // Default has arrow, doesn't fit with material style
            prevLabel: "Back",      // Default has arrow, doesn't fit with material style
        })
    }

    public startTour(): void {
        if(this.tour) {
            this.tour.start();
        }
    }
    /** @end-author Mathijs Boezer */
}
