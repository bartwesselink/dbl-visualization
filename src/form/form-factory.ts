import {Injectable} from '@angular/core';
import {FormBuilder} from './form-builder';
import {FormBuilder as AngularFormBuilder} from '@angular/forms';

@Injectable()
export class FormFactory {
    /** @author Bart Wesselink */
    constructor (private fb: AngularFormBuilder) {
    }

    public createFormBuilder(): FormBuilder {
        return new FormBuilder(this.fb);
    }
    /** @end-author Bart Wesselink */
}