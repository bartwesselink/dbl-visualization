import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Form} from '../../form/form';
import {FormType} from '../../enums/form-type';
import 'rxjs/add/operator/debounceTime';
import {ChoiceFormOptions} from '../../interfaces/choice-form-options';
import {FormField} from '../../interfaces/form-field';

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
        this.form.valueChanges.debounceTime(this.debounceTime).subscribe((value: object) => this.valueChanges.next(value));
    }

    getChoiceOptions(field: FormField): ChoiceFormOptions {
        return field.options as ChoiceFormOptions;
    }

    /** @end-author Bart Wesselink */
}
