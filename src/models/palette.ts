import {Color} from '../utils/color'
import {GradientType} from "../enums/gradient-type";

/** @author Nico Klaassen */
export class Palette {
    primary: Color;
    secondary: Color;
    accents: Color[];

    gradientColorMap: number[][][];
    gradientColorMapSelected: number[][][];

    constructor(primary: Color, secondary: Color, accents: Color[]) {
        this.primary = primary;
        this.secondary = secondary;
        this.accents = accents;
    }

    /** @end-author Nico Klaassen */
    /** @author Jules Cornelissen */
    private gradientMapType: boolean;
    private invertHSV: boolean;
    private deselectedGrey: number[] = [0.5, 0.5, 0.5];

    /**
     * Calculates the gradient for the given settings
     * @param {number} selectedDepth The depth of the selected node, 0 if no node is selected or the root
     * @param {number} maxDepth The maximum distance from the root to any node
     * @param {boolean} gradientMapType Determines if the gradient should be calculated per depth or only for the maxDepth
     * @param {GradientType} gradientType Enum for which gradient to calculate
     * @param {boolean} invertHSV Determines if the HSV gradient should take the long route (=false) or the short route (=true)
     */
    public calcGradientColorMap(selectedDepth: number, maxDepth: number, gradientMapType: boolean, gradientType: GradientType, invertHSV: boolean) {
        this.gradientColorMap = [];
        this.gradientColorMapSelected = [];
        this.gradientMapType = gradientMapType;
        this.invertHSV = invertHSV;
        switch (+gradientType) {
            case GradientType.HSV:
                this.calcColorMapHSV(selectedDepth, maxDepth);
                break;
            case GradientType.RGBLinear:
                this.calcColorMapRGBLinear(selectedDepth, maxDepth);
                break;
        }
    }

    private calcColorMapHSV(selectedDepth: number, maxDepth: number) {
        let RGB: number[];
        let hsvValues: number[][];
        if (this.gradientMapType) {
            if (selectedDepth === 0) {
                for (let depth = 0; depth <= maxDepth; depth++) {
                    this.gradientColorMap.push([]);
                    this.gradientColorMapSelected.push([]);
                    hsvValues = this.calcHSVValues(selectedDepth, depth);
                    for (let i = 0; i < hsvValues[0].length; i++) {
                        RGB = this.HSVtoRGB(hsvValues[0][i], hsvValues[1][i], hsvValues[2][i]);
                        this.gradientColorMap[depth].push([RGB[0], RGB[1], RGB[2]]);
                        this.gradientColorMapSelected[depth].push([RGB[0], RGB[1], RGB[2]]);
                    }
                }
            } else {
                for (let depth = 0; depth <= maxDepth; depth++) {
                    this.gradientColorMap.push([]);
                    this.gradientColorMapSelected.push([]);
                    hsvValues = this.calcHSVValues(selectedDepth, depth);
                    for (let i = 0; i < hsvValues[0].length; i++) {
                        RGB = this.HSVtoRGB(hsvValues[0][i], hsvValues[1][i], hsvValues[2][i]);
                        this.gradientColorMap[depth].push(this.deselectedGrey);
                        this.gradientColorMapSelected[depth].push([RGB[0], RGB[1], RGB[2]]);
                    }
                }
            }
        } else {
            if (selectedDepth === 0) {
                for (let depth = 0; depth <= maxDepth; depth++) {
                    this.gradientColorMap.push([]);
                    this.gradientColorMapSelected.push([]);
                    hsvValues = this.calcHSVValues(selectedDepth, maxDepth);
                    for (let i = 0; i < hsvValues[0].length; i++) {
                        RGB = this.HSVtoRGB(hsvValues[0][i], hsvValues[1][i], hsvValues[2][i]);
                        this.gradientColorMap[depth].push([RGB[0], RGB[1], RGB[2]]);
                        this.gradientColorMapSelected[depth].push([RGB[0], RGB[1], RGB[2]]);
                    }
                }
            } else {
                for (let depth = 0; depth <= maxDepth; depth++) {
                    this.gradientColorMap.push([]);
                    this.gradientColorMapSelected.push([]);
                    hsvValues = this.calcHSVValues(selectedDepth, maxDepth);
                    for (let i = 0; i < hsvValues[0].length; i++) {
                        RGB = this.HSVtoRGB(hsvValues[0][i], hsvValues[1][i], hsvValues[2][i]);
                        this.gradientColorMap[depth].push(this.deselectedGrey);
                        this.gradientColorMapSelected[depth].push([RGB[0], RGB[1], RGB[2]]);
                    }
                }
            }
        }
    }

    private calcColorMapRGBLinear(selectedDepth: number, maxDepth: number) {
        if (this.gradientMapType) {
            for (let depth = 0; depth <= maxDepth; depth++) {
                this.gradientColorMap.push([]);
                this.gradientColorMapSelected.push([]);
                if (selectedDepth === 0) {
                    for (let i = 0; i <= depth; i++) {
                        this.gradientColorMap[depth].push(this.calcLinearRGBGradient(i, selectedDepth, depth));
                        this.gradientColorMapSelected[depth].push(this.calcLinearRGBGradient(i, selectedDepth, depth));
                    }
                } else {
                    for (let i = 0; i <= depth; i++) {
                        this.gradientColorMap[depth].push(this.deselectedGrey);
                        this.gradientColorMapSelected[depth].push(this.calcLinearRGBGradient(i, selectedDepth, depth));
                    }
                }
            }
        } else {
            for (let depth = 0; depth <= maxDepth; depth++) {
                this.gradientColorMap.push([]);
                this.gradientColorMapSelected.push([]);
                if (selectedDepth === 0) {
                    for (let i = 0; i <= depth; i++) {
                        this.gradientColorMap[depth].push(this.calcLinearRGBGradient(i, selectedDepth, maxDepth));
                        this.gradientColorMapSelected[depth].push(this.calcLinearRGBGradient(i, selectedDepth, maxDepth));
                    }
                } else {
                    for (let i = 0; i <= depth; i++) {
                        this.gradientColorMap[depth].push(this.deselectedGrey);
                        this.gradientColorMapSelected[depth].push(this.calcLinearRGBGradient(i, selectedDepth, maxDepth));
                    }
                }
            }
        }
    }

    private calcLinearRGBGradient(depth: number, selectedDepth: number, maxDepth: number): number[] {
        let percent: number = ((depth - selectedDepth) / (maxDepth - selectedDepth));
        let red: number = this.primary.r - percent * (this.primary.r - this.secondary.r);
        let green: number = this.primary.g - percent * (this.primary.g - this.secondary.g);
        let blue: number = this.primary.b - percent * (this.primary.b - this.secondary.b);
        return [red, green, blue];
    }

    /**
     * Calculates the gradient for HSV colors
     * @param {number} selectedDepth The depth of the selected node
     * @param {number} maxDepth The maximum depth of the subtree
     * @returns {number[][]} [hueValues[], saturationValues[], valueValues[]]
     */
    private calcHSVValues(selectedDepth: number, maxDepth: number): number[][] {
        let hueValues: number[] = [];
        let satValues: number[] = [];
        let valValues: number[] = [];
        let percent: number;
        let d = this.secondary.h - this.primary.h;
        let delta: number;
        if (this.invertHSV) {
            delta = d + ((Math.abs(d) > 180) ? ((d < 0) ? 360 : -360) : 0);
        } else {
            delta = d + ((Math.abs(d) < 180) ? ((d < 0) ? 360 : -360) : 0);
        }
        for (let i = 0; i <= maxDepth; i++) {
            percent = (i - selectedDepth) / (maxDepth - selectedDepth);
            hueValues.push(((this.primary.h + (delta * percent) + 360) % 360) / 360);
            satValues.push(this.primary.s - (this.primary.s - this.secondary.s) * percent);
            valValues.push(this.primary.v - (this.primary.v - this.secondary.v) * percent);
        }
        return [hueValues, satValues, valValues];
    }

    /** Taken from https://stackoverflow.com/a/17243070
        Modified to work within our code and for readability
     * Takes HSV as input and converts it to RGB
     * @param {number} hue The hue of the color
     * @param {number} sat The saturation of the color
     * @param {number} val The value of the color
     * @returns {number[]} [red, green, blue]
     */
    private HSVtoRGB(hue: number, sat: number, val: number): number[] {
        let red, green, blue, i, f, p, q, t;
        i = Math.floor(hue * 6); // Determines which case for the formula
        f = hue * 6 - i;
        p = val * (1 - sat);
        q = val * (1 - f * sat);
        t = val * (1 - (1 - f) * sat);
        switch (i % 6) {
            case 0:
                red = val, green = t, blue = p;
                break;
            case 1:
                red = q, green = val, blue = p;
                break;
            case 2:
                red = p, green = val, blue = t;
                break;
            case 3:
                red = p, green = q, blue = val;
                break;
            case 4:
                red = t, green = p, blue = val;
                break;
            case 5:
                red = val, green = p, blue = q;
                break;
        }
        return ([red, green, blue]);
    }
}

/** @end-author Jules Cornelissen */
