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

    constructor(r?: number, g?: number, b?: number, alpha?: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = alpha;
        this.rgba = [r, g, b, alpha];
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

}

/** @end-author Nico Klaassen */
