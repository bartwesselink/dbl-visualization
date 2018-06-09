<<<<<<< HEAD
import {GradientType} from "../enums/gradient-type";

export interface Settings {
    darkMode: boolean;
    colorMode: boolean;
    palette: string;
    reversePalette: boolean;
    gradientMapType: boolean;
    gradientType: GradientType;
    invertHSV: boolean;
=======
import {InteractionOptions} from "../enums/interaction-options";

export interface Settings {
    darkMode: boolean;
    interactionSettings: InteractionOptions
>>>>>>> develop
}
