import {Color} from '../utils/color'

/** @author Nico Klaassen */
export class Palette {
    primary : Color;
    secondary: Color;
    accents: Color[];

    constructor(primary: Color, secondary: Color, accents: Color[]) {
        this.primary = primary;
        this.secondary = secondary;
        this.accents = accents;
    }
}
/** @end-author Nico Klaassen */
