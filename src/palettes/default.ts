import {Palette} from '../interfaces/palette'
import {Color} from '../utils/color'

export class Default implements Palette {
    primary = new Color();
    secondary = new Color();
    accents = [
        new Color(),
        new Color(),
        new Color()
    ];

}
