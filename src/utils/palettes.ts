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
    static alt = new Palette(
        Color.fromHex('F21D2F'),
        Color.fromHex('023859'),
        [
            Color.fromHex('0367A6'),
            Color.fromHex('F2CD5C'),
            Color.fromHex('F26A4B')
        ]
    );
    static greyScale = new Palette(
        Color.fromHex('0D0D0D'),
        Color.fromHex('262626'),
        [
            Color.fromHex('595959'),
            Color.fromHex('A6A6A6'),
            Color.fromHex('D9D9D9')
        ]
    );


}
