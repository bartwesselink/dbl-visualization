import {GradientType} from "../enums/gradient-type";

export interface Settings {
    darkMode: boolean;
    colorMode: boolean;
    palette: string;
    reversePalette: boolean;
    gradientMapType: boolean;
    gradientType: GradientType;
    invertHSV: boolean;
}
