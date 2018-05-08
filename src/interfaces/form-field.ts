/** @author Bart Wesselink */
import {FormType} from '../enums/form-type';
import {BaseFormOptions} from './base-form-options';
import {ChoiceFormOptions} from './choice-form-options';
import {FormControl} from '@angular/forms';

export interface FormField {
    name: string;
    defaultValue: any;
    type: FormType;
    options: ChoiceFormOptions|BaseFormOptions;
    control?: FormControl;
}
/** @end-author Bart Wesselink */