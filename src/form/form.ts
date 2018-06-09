import {FormGroup} from '@angular/forms';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {FormField} from '../interfaces/form-field';

export class Form {
    private changeSubject: Subject<object> = new Subject<object>();
    public valueChanges: Observable<object> = this.changeSubject.asObservable();

    private initialValues: any;

    constructor(private name: string, private formGroup: FormGroup, private fieldDefinition: FormField[]) {
        this.subscribeChanges();
        this.initialValues = this.getFormGroup().value;
    }

    public getName(): string {
        return this.name;
    }

    public getFormGroup(): FormGroup {
        return this.formGroup;
    }

    public getFieldDefinition(): FormField[] {
        return this.fieldDefinition;
    }

    public isValid(): boolean {
        return this.formGroup.valid;
    }

    public restoreDefault(): void {
        this.getFormGroup().setValue(this.initialValues);
    }

    private subscribeChanges(): void {
        // method to check if value has been changed
        this.formGroup.valueChanges.subscribe((value: any) => this.changeSubject.next(value));
    }
}
