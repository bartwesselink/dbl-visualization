import {Color} from '../utils/color'

/** @author Nico Klaassen */
export class Palette {
    primary: Color;
    secondary: Color;
    accents: Color[];

    gradientColorMap: number[][];
    gradientColorMapSelected: number[][];

    constructor(primary: Color, secondary: Color, accents: Color[]) {
        this.primary = primary;
        this.secondary = secondary;
        this.accents = accents;
    }

    public calcGradientColorMap(minDepth: number, maxDepth: number) {
        this.gradientColorMap = [];
        this.gradientColorMapSelected = [];
        if (minDepth === 0) {
            for (let i = 0; i <= maxDepth; i++) {
                this.gradientColorMap.push(this.calcColor(i, minDepth, maxDepth));
                this.gradientColorMapSelected.push(this.calcColor(i, minDepth, maxDepth));
            }
        } else {
            for (let i = 0; i <= maxDepth; i++) {
                this.gradientColorMap.push([0.5, 0.5, 0.5, 1]);
                this.gradientColorMapSelected.push(this.calcColor(i, minDepth, maxDepth));
            }
        }
    }

    private calcColor(depth: number, minDepth: number, maxDepth: number): number[] {
        let red: number = (this.primary.r - this.secondary.r) * ((depth - minDepth) / maxDepth) + this.secondary.r;
        let green: number = (this.primary.g - this.secondary.g) * ((depth - minDepth) / maxDepth) + this.secondary.g;
        let blue: number = (this.primary.b - this.secondary.b) * ((depth - minDepth) / maxDepth) + this.secondary.b;
        let alpha: number = (this.primary.a - this.secondary.a) * ((depth - minDepth) / maxDepth) + this.secondary.a;
        return [red, green, blue, alpha];
    }
}

/** @end-author Nico Klaassen */
