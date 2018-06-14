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
import {SubtreeBus} from "../providers/subtree-bus";
import {SelectBus} from "../providers/select-bus";
import {BasicTree} from "../visualizations/basic-tree";
import {Circles} from "../visualizations/circles";

declare var dialogPolyfill;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    public tabs: Tab[] = [];
    public tree: Node;
    private originalTree: Node;
    public visualizers: Visualizer[];
    public showFullScreenLoader: boolean = false;

    private activeTab: Tab;
    private amountOfWindowsLoading: number = 0;
    private firstTabAdded: boolean = false;

    public readonly SIDE_BY_SIDE_MAX_WINDOWS = 2;
    public readonly SIDE_BY_SIDE_MAX_WIDTH = 200;

    @ViewChild(SidebarComponent) private sidebar: SidebarComponent;
    @ViewChild("snackbar") public snackbar: ElementRef;
    @ViewChild('fullScreenLoader') private fullScreenLoader: ElementRef;
    @ViewChild('appHolder') private appHolder: ElementRef;
    @ViewChild('resizer') private resizer: ElementRef;

    @ViewChildren('tabSection') private tabSections: QueryList<ElementRef>;

    private parser: NewickParser;
    public darkMode = false;

    public viewMode = ViewMode.SIDE_BY_SIDE;

    // variables for dragging the column around
    public windowResizing: boolean = false;

    constructor(private settingsBus: SettingsBus, private selectBus: SelectBus, private subtreeBus: SubtreeBus) {
        this.createVisualizers();

        this.settingsBus.settingsChanged.subscribe((settings: Settings) => {
            this.darkMode = settings.darkMode;

            if (this.viewMode !== settings.viewMode) {
                this.resizeActiveTab(true);

                if (settings.viewMode === ViewMode.SIDE_BY_SIDE) {
                    if (this.tabs.length > this.SIDE_BY_SIDE_MAX_WINDOWS) {
                        this.snackbar.nativeElement.MaterialSnackbar.showSnackbar({message: 'Please close tabs, because for this view-mode there are only ' + this.SIDE_BY_SIDE_MAX_WINDOWS + ' windows allowed.'});

                        return;
                    }
                }
            }

            this.viewMode = settings.viewMode;
            for (const tab of this.tabs) {
                if (tab.window) {
                    tab.window.setDarkmode(this.darkMode);
                }
            }
            this.selectBus.interactionOptions = settings.interactionSettings;
        });

        this.subtreeBus.subtreeSelected.subscribe((node: Node) => {
            this.openTree(node);
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

            this.openTree(this.parser.parseTree(line));
            this.originalTree = this.tree;

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

    public updateVisualization(visualizer: Visualizer, tab: Tab): void {
        tab.visualizer = visualizer;

        setTimeout(() => {
            tab.window.ngOnInit();
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

        this.resetTabWidths();
    }

    public switchTab(tab: Tab) {
        for (const item of this.tabs) {
            item.active = false;
        }

        tab.active = true;
        this.activeTab = tab;

        if (tab.window) {
            setTimeout(() => {
                tab.window.computeScene();
                // tab.window.render();
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
            new BasicTree(),
            new Circles(),
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

    public async redrawAllTabs(): Promise<void> { // We generally only want to recompute the tab that is active.
        for (const tab of this.tabs) {
            if (this.isSideBySideViewMode() || tab.active && tab.window) {
                await tab.window.computeScene();
            }
        }
        // for (const tab of this.tabs.slice().sort((a, b) => a === this.activeTab ? 0 : 1)) {
        //     if (tab.window) {
        //         await tab.window.computeScene();
        //     }
        // }
    }

    private addTab(visualizer: Visualizer) {
        const tab: Tab = {
            id: this.tabs.length + 1,
            visualizer: visualizer,
            active: false,
        };

        this.tabs.push(tab);

        if (!this.firstTabAdded) {
            setTimeout(() => {
                if (tab.window != null) {
                    tab.window.checkGpu();
                }
            }, 400); // wait for the commponent to set the window

            this.firstTabAdded = true;
        }

        this.switchTab(this.tabs[this.tabs.length - 1]); // always show new visualization when tab is added
        this.showFullScreenLoader = true;

        if (this.viewMode === ViewMode.SIDE_BY_SIDE) {
            setTimeout(() => {
                this.resizeActiveTab();
            }, 200);
        }
    }
    /** @end-author Bart Wesselink */

    /** @author Bart Wesselink */
    public startResize(): void {
        this.windowResizing = true;
    }

    public stopResize(): void {
        this.windowResizing = false;
    }

    public doResize($event: MouseEvent) {
        if (this.isTabViewMode() || !this.windowResizing || this.tabSections.length < 2) {
            return;
        }

        $event.preventDefault();
        $event.stopPropagation();

        let sections = this.tabSections.toArray();
        let firstWindow = sections[0];
        let secondWindow = sections[1];

        let screenWidth = document.body.clientWidth;

        let firstWindowSize = ($event.clientX - this.resizer.nativeElement.clientWidth / 2);
        let secondWindowSize = (screenWidth - ($event.clientX - this.resizer.nativeElement.clientWidth / 2));

        if (firstWindowSize < this.SIDE_BY_SIDE_MAX_WIDTH || secondWindowSize < this.SIDE_BY_SIDE_MAX_WIDTH) {
            return;
        }

        // take divider into account in calculation
        firstWindow.nativeElement.style.width = firstWindowSize + 'px';
        secondWindow.nativeElement.style.width = secondWindowSize + 'px';

        this.resizeActiveTab(true);
    }

    public isSideBySideViewMode(): boolean {
        return this.viewMode === ViewMode.SIDE_BY_SIDE;
    }

    public isTabViewMode(): boolean {
        return this.viewMode === ViewMode.TAB;
    }

    public resetTabWidths(): void {
        for (const tabSection of this.tabSections.toArray()) {
            tabSection.nativeElement.style.width = '100%';
        }
    }
    /** @end-author Bart Wesselink */

    /** @author Mathijs Boezer */

    private openTree(node: Node): void {
        // reset selection on old tree
        if (this.tree && this.tree.selectedNode) {
            this.tree.selectedNode.selected = false;
            this.tree.selectedNode = null;
        }

        this.tree = node;

        setTimeout(() => {
            this.sidebar.reloadData();
            this.redrawAllTabs();
            this.resetAllTabTransformations();
        }, 100);
    }

    private resetAllTabTransformations() {
        for (let tab of this.tabs) {
            tab.window.resetTransformation();
        }
    }

    public restoreTree() {
        this.openTree(this.originalTree);
    }
    /** @end-author Mathijs Boezer */
}
