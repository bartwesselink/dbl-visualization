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

    // constructor(){
    //
    // };
    constructor(r?: any, g?: number, b?: number, alpha?: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = alpha;
        this.rgba = [r, g, b, alpha];
    };

    static fromHex(hex: string) {
        const hexInt = parseInt(hex, 16);
        console.log(hex + " : " + hexInt);
        const r = (hexInt >> 16) & 255;
        console.log('r: ' + r);
        const g = (hexInt >> 8) & 255;
        console.log('g: ' + g);
        const b = hexInt & 255;
        console.log('b: ' + b);
        return new Color(r / 255, g / 255, b / 255, 1);
    }

    public fromHSV(): void {

    }

}

/** @end-author Nico Klaassen */
