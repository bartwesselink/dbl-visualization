import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Form} from '../../form/form';
import {FormType} from '../../enums/form-type';
import 'rxjs/add/operator/debounceTime';
import {ChoiceFormOptions} from '../../interfaces/choice-form-options';
import {FormField} from '../../interfaces/form-field';
import {SliderFormOptions} from '../../interfaces/slider-form-options';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
})
export class FormComponent implements OnInit {
    /** @author Bart Wesselink */
    @Input() public form: Form;
    @Input() private debounceTime: number = 500; // time to wait when the user has changed something
    @Output() private valueChanges: EventEmitter<object> = new EventEmitter<object>();

    // fix for Angular templating enums
    public FormType = FormType;

    ngOnInit(): void {
        // output when form value has changed
        this.form.valueChanges.debounceTime(this.debounceTime).subscribe((value: object) => {
            if (this.form.isValid()) {
                this.valueChanges.next(value);
            }
        });

        // fixes #85, weird issue where value is changed by DOM to half of the slider
        setTimeout(() => {
            const formGroup = this.form.getFormGroup();
            formGroup.patchValue(formGroup.value, { emitEvent: false });
        }, 100);
    }

    getChoiceOptions(field: FormField): ChoiceFormOptions {
        return field.options as ChoiceFormOptions;
    }

    getSliderOptions(field: FormField): SliderFormOptions {
        return field.options as SliderFormOptions;
    }

    /** @end-author Bart Wesselink */
}
