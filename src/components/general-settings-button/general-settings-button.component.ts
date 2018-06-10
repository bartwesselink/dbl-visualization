import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Form} from '../../form/form';
import {FormFactory} from '../../form/form-factory';
import {SettingsBus} from '../../providers/settings-bus';
import {Settings} from '../../interfaces/settings';
import {InteractionOptions} from '../../enums/interaction-options';

declare var dialogPolyfill;

@Component({
    selector: 'app-general-settings-button',
    templateUrl: './general-settings-button.component.html',
})
export class GeneralSettingsButtonComponent implements OnInit {
    /** @author Bart Wesselink */
    public form: Form;
    @ViewChild('dialog') private dialog: ElementRef;

    constructor (private formFactory: FormFactory, private settingsBus: SettingsBus) {
    }

    public ngOnInit(): void {
        this.createForm();
        dialogPolyfill.registerDialog(this.dialog.nativeElement);
        // emit first value
        this.updateValue();
    }

    public open(): void {
        this.dialog.nativeElement.showModal();

        // fix for button being selected
        setTimeout(() => this.dialog.nativeElement.focus());
    }

    public close(): void {
        this.dialog.nativeElement.close();
    }

    public updateValue(): void {
        this.settingsBus.updateSettings(this.form.getFormGroup().value as Settings);
    }

    private createForm(): void {
        this.form = this.formFactory
            .createFormBuilder()
            .addToggleField('darkMode', false, { label: 'Dark mode' })
            .addChoiceField('interactionSettings', InteractionOptions.ZoomAndPan, {
                label: 'Action on clicking a node',
                choices:{
                    '0': 'Zoom and pan to the node',
                    '1': 'Pan to the node',
                    '2': 'Do nothing'
                },
                expanded: false
            })
            .getForm();
    }

    /** @end-author Bart Wesselink */
}
