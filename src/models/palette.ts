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
    private deselectedGrey: number[] = [0.5, 0.5, 0.5, 1];

    public calcGradientColorMap(minDepth: number, maxDepth: number, gradientMapType: boolean, gradientType: GradientType, invertHSV: boolean) {
        this.gradientColorMap = [];
        this.gradientColorMapSelected = [];
        this.gradientMapType = gradientMapType;
        this.invertHSV = invertHSV;
        switch (+gradientType) {
            case GradientType.HSV:
                this.calcColorMapHSV(minDepth, maxDepth);
                break;
            case GradientType.RGBLinear:
                this.calcColorMapRGBLinear(minDepth, maxDepth);
                break;
        }
    }

    private calcColorMapHSV(minDepth: number, maxDepth: number) {
        let RGB: number[];
        let hsvValues: number[][];
        let alpha: number[];
        if (this.gradientMapType) {
            if (minDepth === 0) {
                for (let depth = 0; depth <= maxDepth; depth++) {
                    this.gradientColorMap.push([]);
                    this.gradientColorMapSelected.push([]);
                    alpha = this.calcLinearAlphaGradient(minDepth, depth);
                    hsvValues = this.calcHSVValues(minDepth, depth);
                    for (let i = 0; i < hsvValues[0].length; i++) {
                        RGB = this.HSVtoRGB(hsvValues[0][i], hsvValues[1][i], hsvValues[2][i]);
                        this.gradientColorMap[depth].push([RGB[0], RGB[1], RGB[2], alpha[i]]);
                        this.gradientColorMapSelected[depth].push([RGB[0], RGB[1], RGB[2], alpha[i]]);
                    }
                }
            } else {
                for (let depth = 0; depth <= maxDepth; depth++) {
                    this.gradientColorMap.push([]);
                    this.gradientColorMapSelected.push([]);
                    alpha = this.calcLinearAlphaGradient(minDepth, depth);
                    hsvValues = this.calcHSVValues(minDepth, depth);
                    for (let i = 0; i < hsvValues[0].length; i++) {
                        RGB = this.HSVtoRGB(hsvValues[0][i], hsvValues[1][i], hsvValues[2][i]);
                        this.gradientColorMap[depth].push(this.deselectedGrey);
                        this.gradientColorMapSelected[depth].push([RGB[0], RGB[1], RGB[2], alpha[i]]);
                    }
                }
            }
        } else {
            if (minDepth === 0) {
                for (let depth = 0; depth <= maxDepth; depth++) {
                    this.gradientColorMap.push([]);
                    this.gradientColorMapSelected.push([]);
                    alpha = this.calcLinearAlphaGradient(minDepth, maxDepth);
                    hsvValues = this.calcHSVValues(minDepth, maxDepth);
                    for (let i = 0; i < hsvValues[0].length; i++) {
                        RGB = this.HSVtoRGB(hsvValues[0][i], hsvValues[1][i], hsvValues[2][i]);
                        this.gradientColorMap[depth].push([RGB[0], RGB[1], RGB[2], alpha[i]]);
                        this.gradientColorMapSelected[depth].push([RGB[0], RGB[1], RGB[2], alpha[i]]);
                    }
                }
            } else {
                for (let depth = 0; depth <= maxDepth; depth++) {
                    this.gradientColorMap.push([]);
                    this.gradientColorMapSelected.push([]);
                    alpha = this.calcLinearAlphaGradient(minDepth, maxDepth);
                    hsvValues = this.calcHSVValues(minDepth, maxDepth);
                    for (let i = 0; i < hsvValues[0].length; i++) {
                        RGB = this.HSVtoRGB(hsvValues[0][i], hsvValues[1][i], hsvValues[2][i]);
                        this.gradientColorMap[depth].push(this.deselectedGrey);
                        this.gradientColorMapSelected[depth].push([RGB[0], RGB[1], RGB[2], alpha[i]]);
                    }
                }
            }
        }
    }

    private calcColorMapRGBLinear(minDepth: number, maxDepth: number) {
        if (this.gradientMapType) {
            for (let depth = 0; depth <= maxDepth; depth++) {
                this.gradientColorMap.push([]);
                this.gradientColorMapSelected.push([]);
                if (minDepth === 0) {
                    for (let i = 0; i <= depth; i++) {
                        this.gradientColorMap[depth].push(this.calcLinearRGBGradient(i, minDepth, depth));
                        this.gradientColorMapSelected[depth].push(this.calcLinearRGBGradient(i, minDepth, depth));
                    }
                } else {
                    for (let i = 0; i <= depth; i++) {
                        this.gradientColorMap[depth].push(this.deselectedGrey);
                        this.gradientColorMapSelected[depth].push(this.calcLinearRGBGradient(i, minDepth, depth));
                    }
                }
            }
        } else {
            for (let depth = 0; depth <= maxDepth; depth++) {
                this.gradientColorMap.push([]);
                this.gradientColorMapSelected.push([]);
                if (minDepth === 0) {
                    for (let i = 0; i <= depth; i++) {
                        this.gradientColorMap[depth].push(this.calcLinearRGBGradient(i, minDepth, maxDepth));
                        this.gradientColorMapSelected[depth].push(this.calcLinearRGBGradient(i, minDepth, maxDepth));
                    }
                } else {
                    for (let i = 0; i <= depth; i++) {
                        this.gradientColorMap[depth].push(this.deselectedGrey);
                        this.gradientColorMapSelected[depth].push(this.calcLinearRGBGradient(i, minDepth, maxDepth));
                    }
                }
            }
        }
    }

    private calcLinearRGBGradient(depth: number, minDepth: number, maxDepth: number): number[] {
        let percent: number = ((depth - minDepth) / maxDepth);
        let red: number = this.primary.r - percent * (this.primary.r - this.secondary.r);
        let green: number = this.primary.g - percent * (this.primary.g - this.secondary.g);
        let blue: number = this.primary.b - percent * (this.primary.b - this.secondary.b);
        let alpha: number = this.primary.a - percent * (this.primary.a - this.secondary.a);
        return [red, green, blue, alpha];
    }


    private calcLinearAlphaGradient(minDepth: number, maxDepth: number): number[] {
        let alpha: number[] = [];
        for (let i = 0; i <= maxDepth; i++) {
            alpha.push(this.primary.a - (this.primary.a - this.secondary.a) * ((i - minDepth) / maxDepth));
        }
        return alpha;
    }

    private calcHSVValues(minDepth: number, maxDepth: number): number[][] {
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
            percent = (i - minDepth) / maxDepth;
            hueValues.push(((this.primary.h + (delta * percent) + 360) % 360) / 360);
            satValues.push(this.primary.s - (this.primary.s - this.secondary.s) * percent;
            valValues.push(this.primary.v - (this.primary.v - this.secondary.v) * percent;
        }
        return [hueValues, satValues, valValues];
    }

    /** Taken from https://stackoverflow.com/a/17243070
     Modified to work within our code */
    private HSVtoRGB(hue: number, sat: number, val: number): number[] {
        var red, green, blue, i, f, p, q, t;
        i = Math.floor(hue * 6);
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
