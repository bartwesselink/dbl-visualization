import {DrawType} from '../enums/draw-type';
import {AaQuadOptions} from './aa-quad-options';
import {CircleOptions} from './circle-options';
import {EllipsoidOptions} from './ellipsoid-options';
import {RotatedQuadOptions} from './rotated-quad-options';
import {ArcOptions} from './arc-options';
import {CircleSliceOptions} from './circle-slice-options';
import {RingSliceOptions} from './ring-slice-options';
import {LineOptions} from './line-options';

export interface Draw {
    type: DrawType;
    options: AaQuadOptions|CircleOptions|EllipsoidOptions|RotatedQuadOptions|ArcOptions|CircleSliceOptions|RingSliceOptions|LineOptions;
    identifier?: number;
    glid?: number;
    linked?: number;
}