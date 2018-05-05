import {Visualizer} from '../interfaces/visualizer';
import {WindowComponent} from '../components/window/window.component';

export interface Tab {
    visualizer: Visualizer;
    active: boolean;
    window?: WindowComponent;
}
