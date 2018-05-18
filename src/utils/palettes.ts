import {Palette} from '../models/palette'
import {Color} from './color'

export class Palettes {
    static default = new Palette(
        Color.fromHex('333741'),
        Color.fromHex('28B799'),
        [
            Color.fromHex('F8bF39'),
            Color.fromHex('F1EAD1'),
            Color.fromHex('D75749')
        ]
    );

}
