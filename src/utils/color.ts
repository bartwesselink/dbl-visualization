/** @author Nico Klaassen */


export class Color {
    static BLACK = [0, 0, 0, 1];
    static WHITE = [1, 1, 1, 1];
    static RED = [1, 0, 0, 1];
    static GREEN = [0, 1, 0, 1];
    static BLUE = [0, 0, 1, 1];

    r: number;
    g: number;
    b: number;
    a: number;
    rgba: [number, number, number, number];

    h: number; // Hue [0,360) degrees
    s: number; // Saturation [0,1]
    v: number; // Value [0,1]

    constructor(r?: number, g?: number, b?: number, alpha?: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = alpha;
        this.rgba = [r, g, b, alpha];
        let hsv = this.RGBToHSV();
        this.h = hsv[0], this.s = hsv[1], this.v = hsv[2];
    };

    static fromRGB(r: number, g: number, b: number) {
        if (r > 1 || g > 1 || b > 1) {
            // Here we assume we got passed rgb on a 0-255 scale
            r /= 255;
            g /= 255;
            b /= 255;
        }
        return new Color(r, g, b, 1);
    }

    static fromRGBA(r: number, g: number, b: number, a: number) {
        if (r > 1 || g > 1 || b > 1 || a > 1) {
            // Here we assume we got passed rgb on a 0-255 scale
            r /= 255;
            g /= 255;
            b /= 255;
            a /= 255
        }
        return new Color(r, g, b, a);
    }

    static fromHex(hex: string) {
        const hexInt = parseInt(hex, 16);
        const r = (hexInt >> 16) & 255;
        const g = (hexInt >> 8) & 255;
        const b = hexInt & 255;
        return new Color(r / 255, g / 255, b / 255, 1);
    }

    public fromHSV(): void {

    }

    /** Taken from http://www.javascripter.net/faq/rgb2hsv.htm */
    private RGBToHSV(): number[] {
        let r = this.r;
        let g = this.g;
        let b = this.b;
        var minRGB = Math.min(r, Math.min(g, b));
        var maxRGB = Math.max(r, Math.max(g, b));
        // Black-gray-white
        if (minRGB == maxRGB) {
            let computedV = minRGB;
            return [0, 0, computedV];
        }
        // Colors other than black-gray-white:
        let d = (r == minRGB) ? g - b : ((b == minRGB) ? r - g : b - r);
        let h = (r == minRGB) ? 3 : ((b == minRGB) ? 1 : 5);
        let computedH = 60 * (h - d / (maxRGB - minRGB));
        let computedS = (maxRGB - minRGB) / maxRGB;
        let computedV = maxRGB;
        return [computedH, computedS, computedV];
    }
}

/** @end-author Nico Klaassen */
