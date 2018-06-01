import {Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
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
import {ViewMode} from '../enums/view-mode';

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

    public readonly MAX_SIDE_BY_SIDE = 4;

    @ViewChild(SidebarComponent) private sidebar: SidebarComponent;
    @ViewChild("snackbar") public snackbar: ElementRef;
    @ViewChild('fullScreenLoader') private fullScreenLoader: ElementRef;
    @ViewChild('appHolder') private appHolder: ElementRef;

    @ViewChildren('tabSection') private tabSections: QueryList<ElementRef>;

    private parser: NewickParser;
    public darkMode = false;
    public viewMode = ViewMode.SIDE_BY_SIDE;

    // variables for dragging the column around
    public windowResizeIndex: number;
    public windowResizeLastX: number;
    public windowResizing: boolean = false;

    constructor(private settingsBus: SettingsBus) {
        this.createVisualizers();

        this.settingsBus.settingsChanged.subscribe((settings: Settings) => {
            this.darkMode = settings.darkMode;

            if (this.viewMode !== settings.viewMode) {
                this.resizeActiveTab(true);

                if (settings.viewMode === ViewMode.SIDE_BY_SIDE) {
                    if (this.tabs.length > this.MAX_SIDE_BY_SIDE) {
                        this.snackbar.nativeElement.MaterialSnackbar.showSnackbar({message: 'Please close tabs, because for this view-mode there are only ' + this.MAX_SIDE_BY_SIDE + ' windows allowed.'});

                        return;
                    }
                }
            }

            this.viewMode = settings.viewMode;
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
            this.tree = this.parser.parseTree(line);

            setTimeout(() => {
                this.sidebar.reloadData();
                this.redrawAllTabs();
            }, 100);
        }
    }
    /** @end-author Jordy Verhoeven */

    /** @author Bart Wesselink */
    public addVisualization(visualizer: Visualizer): void {
        this.addTab(visualizer);
    }

    public updateVisualization(visualizer: Visualizer, tab: Tab): void {
        tab.visualizer = visualizer;

        setTimeout(() => {
            tab.window.computeScene();
        }, 100);
    }

    public closeTab(tab: Tab) {
        tab.window.destroyScene();

        const wasActive = tab === this.activeTab;
        const index = this.tabs.indexOf(tab);

        this.tabs = this.tabs.filter(item => item !== tab);

        if (this.tabs.length > 0 && wasActive) {
            this.switchTab(this.tabs[Math.max(index - 1, 0)]);
        }

        if (this.viewMode === ViewMode.SIDE_BY_SIDE) {
            this.resizeActiveTab();
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

    private resizeActiveTab(forceAll: boolean = false): void {
        if (this.viewMode === ViewMode.TAB && !forceAll) {
            if (!this.activeTab) {
                return;
            }

            setTimeout(() => {
                this.activeTab.window.setHeight();
            });
        } else {
            for (const tab of this.tabs) {
                setTimeout(() => {
                    tab.window.setHeight();
                }, 300);
            }
        }
    }

    public async redrawAllTabs(): Promise<void> {
        for (const tab of this.tabs.slice().sort((a, b) => a === this.activeTab ? 0 : 1)) {
            if (tab.window) {
                await tab.window.computeScene();
            }
        }
    }

    public isTabViewMode(): boolean {
        return this.viewMode === ViewMode.TAB;
    }

    public isSideBySideViewMode(): boolean {
        return this.viewMode === ViewMode.SIDE_BY_SIDE;
    }

    public startResize($event, index: number): void {
        this.windowResizing = true;
        this.windowResizeIndex = index;
        this.windowResizeLastX = $event.screenX;
    }

    public doResize($event): void {
        if (this.windowResizing) {
            $event.stopImmediatePropagation();
            $event.preventDefault();

            const sections = this.tabSections.toArray();

            const firstTab = sections[this.windowResizeIndex];
            const secondTab = sections[this.windowResizeIndex + 1];
            const currentX = $event.screenX;
            const delta = this.windowResizeLastX - currentX;

            if (firstTab != null && secondTab != null) {
                const firstElement = firstTab.nativeElement;
                const secondElement = secondTab.nativeElement;

                const firstOldWidth = firstElement.clientWidth;
                const secondOldWidth = secondElement.clientWidth;

                const firstNewWidth = firstOldWidth - delta;
                const secondNewWidth = secondOldWidth + delta;

                firstElement.style.width = firstNewWidth + 'px';
                secondElement.style.width = secondNewWidth + 'px';
            }

            this.windowResizeLastX = $event.screenX;
        }
    }

    public stopResize(): void {
        if (this.windowResizing) {
            this.windowResizing = false;
            this.windowResizeIndex = null;

            this.resizeActiveTab();
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

        if (this.viewMode === ViewMode.SIDE_BY_SIDE) {
            setTimeout(() => {
                this.resizeActiveTab();
            }, 200);
        }
    }
    /** @end-author Bart Wesselink */
}
