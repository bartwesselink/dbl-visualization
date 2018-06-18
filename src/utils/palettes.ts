import {Palette} from '../models/palette'
import {Color} from './color'

export class Palettes {
    static defaultBlue = new Palette(
        Color.fromHex('112C61'),
        Color.fromHex('2C95FF'),
        [
            Color.fromHex('1F52B2'),
            Color.fromHex('E00200'),
            Color.fromHex('EDEDED')
        ]
    );
    static redBlue = new Palette(
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
    static vaporWave = new Palette(
        Color.fromHex('cbffe6'),
        Color.fromHex('afe9ff'),
        [
            Color.fromHex('bfb9ff'),
            Color.fromHex('ffcfea'),
            Color.fromHex('feffbe')
        ]
    );
    static malachite = new Palette(
        Color.fromHex('5fbd98'),
        Color.fromHex('193e2c'),
        [
            Color.fromHex('3b9b75'),
            Color.fromHex('2c8863'),
            Color.fromHex('1e583f')
        ]
    );
    static candy = new Palette(
        Color.fromHex('eef970'),
        Color.fromHex('c900bd'),
        [
            Color.fromHex('ff0000'),
            Color.fromHex('023bff'),
            Color.fromHex('c2fffd')
        ]
    );
    static goldenBlue = new Palette(
        Color.fromHex('3773ff'),
        Color.fromHex('f4cc24'),
        [
            Color.fromHex('f29200'),
            Color.fromHex('002472'),
            Color.fromHex('0037ab')
        ]
    );
    static neon = new Palette(
        Color.fromHex('00ff6b'),
        Color.fromHex('ff00db'),
        [
            Color.fromHex('00dfff'),
            Color.fromHex('fdff00'),
            Color.fromHex('7c00ff')
        ]
    );
}
