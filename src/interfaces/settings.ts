import {GradientType} from "../enums/gradient-type";

export interface Settings {
    darkMode: boolean;
    colorMode: boolean;
    palette: string;
    gradientMapType: boolean;
    gradientType: GradientType;
    invertHSV: boolean;
}
