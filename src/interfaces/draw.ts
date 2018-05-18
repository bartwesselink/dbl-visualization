import {DrawType} from '../enums/draw-type';
import {AaQuadOptions} from './aa-quad-options';
import {CircleOptions} from './circle-options';
import {EllipsoidOptions} from './ellipsoid-options';
import {RotatedQuadOptions} from './rotated-quad-options';

export interface Draw {
    type: DrawType;
    options: AaQuadOptions|CircleOptions|EllipsoidOptions|RotatedQuadOptions;
    identifier?: number;
}