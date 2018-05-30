import {FormGroup, FormBuilder as AngularFormBuilder, Validators} from '@angular/forms';
import {FormType} from '../enums/form-type';
import {FormField} from '../interfaces/form-field';
import {BaseFormOptions} from '../interfaces/base-form-options';
import {ChoiceFormOptions} from '../interfaces/choice-form-options';
import {Form} from './form';
import {SliderFormOptions} from '../interfaces/slider-form-options';

export class FormBuilder {
    /** @author Bart Wesselink */
    private fields: FormField[] = [];

    constructor (private fb: AngularFormBuilder, private name: string) {
    }

    public addTextField(name: string, defaultValue: string, options: BaseFormOptions): FormBuilder {
        this.addField(name, FormType.Text, defaultValue, options);

        return this;
    }

    public addNumberField(name: string, defaultValue: number, options: BaseFormOptions): FormBuilder {
        this.addField(name, FormType.Number, defaultValue, options);

        return this;
    }

    public addChoiceField(name: string, defaultValue: string, options: ChoiceFormOptions): FormBuilder {
        this.addField(name, FormType.Choice, defaultValue, options);

        return this;
    }

    public addToggleField(name: string, defaultValue: boolean, options: BaseFormOptions): FormBuilder {
        this.addField(name, FormType.Toggle, defaultValue, options);

        return this;
    }

    public addSliderField(name: string, defaultValue: number, options: SliderFormOptions): FormBuilder {
        this.addField(name, FormType.Slider, String(defaultValue), options);

        return this;
    }

    public addField(name: string, type: FormType, defaultValue: any, options: BaseFormOptions|ChoiceFormOptions|SliderFormOptions): FormBuilder {
        this.fields.push({
            name,
            defaultValue,
            type,
            options,
        });

        return this;
    }

    public getForm(): Form {
        const reactiveForm: FormGroup = this.fb.group({}); // Angular reactive forms layer

        for (const field of this.fields) {
            const control = this.fb.control(field.defaultValue, field.type === FormType.Toggle ? null : Validators.required);

            reactiveForm.addControl(field.name, control);

            field.control = control;
        }

        return new Form(this.name, reactiveForm, this.fields);
    }

    /** @end-author Bart Wesselink */
}