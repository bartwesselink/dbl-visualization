import {ViewMode} from '../enums/view-mode';

import {InteractionOptions} from "../enums/interaction-options";
import {GradientType} from "../enums/gradient-type";

export interface Settings {
    darkMode: boolean;
    grid: boolean;
    viewMode: ViewMode;
    interactionSettings: InteractionOptions
    colorMode: boolean;
    palette: string;
    reversePalette: boolean;
    gradientMapType: boolean;
    gradientType: GradientType;
    invertHSV: boolean;
}
