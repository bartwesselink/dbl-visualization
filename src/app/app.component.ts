import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Tab} from '../models/tab';
import { Node } from '../models/node';
import {NewickParser} from '../utils/newick-parser';
import {SidebarComponent} from '../components/sidebar/sidebar.component';
import {Visualizer} from '../interfaces/visualizer';
import {GeneralizedPythagorasTree} from '../visualizations/generalized-pythagoras-tree';
import {SettingsBus} from '../providers/settings-bus';
import {Settings} from '../interfaces/settings';
import {OpenglDemoTree} from "../visualizations/opengl-demo-tree";
import {SimpleTreeMap} from "../visualizations/simple-tree-map";
import {WorkerManager} from '../utils/worker-manager';

declare var dialogPolyfill;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    public tabs: Tab[] = [];
    public tree: Node;
    public visualizers: Visualizer[];
    public showFullScreenLoader: boolean = false;

    private activeTab: Tab;
    private amountOfWindowsLoading: number = 0;

    @ViewChild(SidebarComponent) private sidebar: SidebarComponent;
    @ViewChild("snackbar") public snackbar: ElementRef;
    @ViewChild('fullScreenLoader') private fullScreenLoader: ElementRef;

    private parser: NewickParser;
    public darkMode = false;
    constructor(private settingsBus: SettingsBus) {
        this.createVisualizers();

        this.settingsBus.settingsChanged.subscribe((settings: Settings) => {
            this.darkMode = settings.darkMode;
        });

        window.addEventListener('resize', () => this.resizeActiveTab());
    }

    public ngOnInit(): void {
        dialogPolyfill.registerDialog(this.fullScreenLoader.nativeElement);

        this.parser = new NewickParser(this.snackbar);
    }

    /** @author Jordy Verhoeven */
    parseTree(data: string) {
        const line = this.parser.extractLines(data);

        if (line !== null) {
            const hadTree = this.tree != null;

            this.tree = this.parser.parseTree(line);

            setTimeout(() => {
                this.sidebar.reloadData();
                this.redrawAllTabs();
            }, 100);

            if(!hadTree) {
                this.resizeActiveTab();
            }
        }
    }
    /** @end-author Jordy Verhoeven */

    /** @author Bart Wesselink */
    public addVisualization(visualizer: Visualizer): void {
        this.addTab(visualizer);
    }

    public closeTab(tab: Tab) {
        tab.window.destroyScene();

        const wasActive = tab === this.activeTab;
        const index = this.tabs.indexOf(tab);

        this.tabs = this.tabs.filter(item => item !== tab);

        if (this.tabs.length > 0 && wasActive) {
            this.switchTab(this.tabs[Math.max(index - 1, 0)]);
        }
    }

    public switchTab(tab: Tab) {
        for (const item of this.tabs) {
            item.active = false;
        }

        tab.active = true;
        this.activeTab = tab;

        if (tab.window) {
            setTimeout(() => {
                tab.window.render();
            }, 100);

            this.resizeActiveTab();
        }
    }

    public updateLoading(isLoading: boolean) {
        if (isLoading) {
            this.amountOfWindowsLoading++;
        } else {
            this.amountOfWindowsLoading--;
        }

        // check if we need to show the full screen modal, in case there is no visualization yet
        if (this.amountOfWindowsLoading > 0 && this.showFullScreenLoader) {
            // check if modal is already open, to prevent any errors
            if (!this.fullScreenLoader.nativeElement.open) {
                this.fullScreenLoader.nativeElement.showModal();
            }
        } else if (this.showFullScreenLoader) {
            this.showFullScreenLoader = false;
            this.fullScreenLoader.nativeElement.close();
        }
    }

    public isLoading(): boolean {
        return this.amountOfWindowsLoading > 0;
    }

    private createVisualizers(): void {
        this.visualizers = [
            new OpenglDemoTree(),
            new GeneralizedPythagorasTree(),
            new SimpleTreeMap(),
        ];
    }

    private resizeActiveTab(): void {
        if (!this.activeTab) {
            return;
        }

        setTimeout(() => {
            this.activeTab.window.setHeight();
        });
    }

    public async redrawAllTabs(): Promise<void> {
        for (const tab of this.tabs.slice().sort((a, b) => a === this.activeTab ? 0 : 1)) {
            if (tab.window) {
                await tab.window.computeScene();
            }
        }
    }

    private addTab(visualizer: Visualizer) {
        this.tabs.push({
            id: this.tabs.length + 1,
            visualizer: visualizer,
            active: false,
        });

        this.switchTab(this.tabs[this.tabs.length - 1]); // always show new visualization when tab is added
        this.showFullScreenLoader = true;
    }
    /** @end-author Bart Wesselink */
}
