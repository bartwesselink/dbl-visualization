/** @author Nico Klaassen */


export class Color {
    r: number;
    g: number;
    b: number;
    rgb: [number, number, number];

    h: number; // Hue [0,360) degrees
    s: number; // Saturation [0,1]
    v: number; // Value [0,1]

    constructor(r?: number, g?: number, b?: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.rgb = [r, g, b];
        let hsv = this.RGBToHSV(this.r, this.g, this.b);
        this.h = hsv[0], this.s = hsv[1], this.v = hsv[2];
    };

    static fromRGB(r: number, g: number, b: number) {
        if (r > 1 || g > 1 || b > 1) {
            // Here we assume we got passed rgb on a 0-255 scale
            r /= 255;
            g /= 255;
            b /= 255;
        }
        return new Color(r, g, b);
    }

    static fromHex(hex: string) {
        const hexInt = parseInt(hex, 16);
        const r = (hexInt >> 16) & 255;
        const g = (hexInt >> 8) & 255;
        const b = hexInt & 255;
        return new Color(r / 255, g / 255, b / 255);
    }

    public fromHSV(): void {

    }

    /** Taken from http://www.javascripter.net/faq/rgb2hsv.htm
     * Takes RGB as input and returns HSV
     * @param {number} r red
     * @param {number} g green
     * @param {number} b blue
     * @returns {number[]} [hue, saturation, value]
     */
    private RGBToHSV(r: number, g: number, b: number): number[] {
        let minRGB = Math.min(r, Math.min(g, b));
        let maxRGB = Math.max(r, Math.max(g, b));
        // Black-gray-white
        if (minRGB == maxRGB) {
            let computedV = minRGB;
            return [0, 0, computedV];
        }
        // Colors other than black-gray-white:
        let d = (r == minRGB) ? g - b : ((b == minRGB) ? r - g : b - r);
        let h = (r == minRGB) ? 3 : ((b == minRGB) ? 1 : 5);
        let calculatedHue = 60 * (h - d / (maxRGB - minRGB));
        let calculatedSat = (maxRGB - minRGB) / maxRGB;
        let calculatedVal = maxRGB;
        return [calculatedHue, calculatedSat, calculatedVal];
    }
}

/** @end-author Nico Klaassen */
