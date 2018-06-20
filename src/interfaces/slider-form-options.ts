import {BaseFormOptions} from './base-form-options';

/** @author Bart Wesselink */
export interface SliderFormOptions extends BaseFormOptions {
    min: number;
    max: number;
    step?: number;
}
/** @end-author Bart Wesselink */