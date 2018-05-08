import {Component, ElementRef, EventEmitter, Input, Output} from '@angular/core';
import {Form} from '../../form/form';

@Component({
    selector: 'app-settings-button',
    templateUrl: './settings-button.component.html',
})
export class SettingsButtonComponent {
    /** @author Bart Wesselink */
    @Input() public form: Form;
    @Output() public valueChanges: EventEmitter<object> = new EventEmitter<object>();

    public viewSettings: boolean = false;

    public toggle(): void {
        this.viewSettings = !this.viewSettings;
    }

    public change(value: any): void {
        this.valueChanges.emit(value);
    }
    /** @end-author Bart Wesselink */
}
