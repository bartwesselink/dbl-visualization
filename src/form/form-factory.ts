import {Injectable} from '@angular/core';
import {FormBuilder} from './form-builder';
import {FormBuilder as AngularFormBuilder} from '@angular/forms';

@Injectable()
export class FormFactory {
    /** @author Bart Wesselink */
    private numberOfForms: number = 0;

    constructor (private fb: AngularFormBuilder) {
    }

    public createFormBuilder(name: string = String(++this.numberOfForms)): FormBuilder {
        return new FormBuilder(this.fb, name);
    }
    /** @end-author Bart Wesselink */
}