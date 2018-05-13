import {Visualizer} from '../interfaces/visualizer';
import {WindowComponent} from '../components/window/window.component';

export interface Tab {
    id: number;
    visualizer: Visualizer;
    active: boolean;
    window?: WindowComponent;
}
