import {BaseFormOptions} from './base-form-options';

/** @author Bart Wesselink */
export interface ChoiceFormOptions extends BaseFormOptions {
    expanded: boolean;
    choices: { [s: string]: string; }; // key is the value returned, value is the label presented to the user
}
/** @end-author Bart Wesselink */