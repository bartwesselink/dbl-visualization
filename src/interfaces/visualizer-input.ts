import {Node} from '../models/node';
import {Palette} from "../models/palette";

export interface VisualizerInput {
    tree: Node;
    settings: any;
    palette: Palette;
}
