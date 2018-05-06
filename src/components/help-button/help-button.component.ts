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

        this.tour.setOptions({
            steps: [
                {
                    intro: "This short tour will explain each of the major elements of the website and how to use it."
                },
                {
                    intro: "This is the upload button, by clicking it you will be able to select your Newick dataset and upload it.",
                    element: 'app-upload-tool > button'
                },
                {
                    intro: "Here you can see your dataset as a tree with nodes you can collapse and expand.",
                    element: '.sidebar-content',
                    position: "left"
                },
                {
                    intro: "This bar contains your visualization tabs, each tab represents a visualization of your dataset.",
                    element: '.mdl-layout__tab-bar-container'
                },
                {
                    intro: "To add a new visualization to the tabs, click here.",
                    element: 'app-visualization-picker > button'
                },
                {
                    intro: "This is the visualization window, your dataset will be visualized here according to your selected visualization.",
                    element: 'app-window > canvas'
                },
                {
                    intro: "If you want to make a screenshot of your visualization window, click here.",
                    element: 'app-screenshot-button > button'
                }
            ],
            showStepNumbers: false,
            showBullets: false,
            showProgress: true,
            overlayOpacity: 0.5
        })
    }

    startTour(): void {
        if(this.tour) {
            this.tour.start();
        }
    }
    /** @end-author Mathijs Boezer */
}
