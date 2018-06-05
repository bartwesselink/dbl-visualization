import {Palette} from '../models/palette'
import {Color} from './color'

export class Palettes {
    static default = new Palette(
        Color.fromHex('112C61'),
        Color.fromHex('2C95FF'),
        [
            Color.fromHex('1F52B2'),
            Color.fromHex('E00200'),
            Color.fromHex('EDEDED')
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
        Color.fromHex('D9D9D9'),
        [
            Color.fromHex('595959'),
            Color.fromHex('A6A6A6'),
            Color.fromHex('D9D9D9')
        ]
    );
}
