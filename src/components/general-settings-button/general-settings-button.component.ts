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
    private storageKey = 'General-settings';
    private defaultSettings: Settings;

    public form: Form;
    @ViewChild('dialog') private dialog: ElementRef;

    constructor (private formFactory: FormFactory, private settingsBus: SettingsBus) {
    }

    public ngOnInit(): void {
        this.createForm();
        dialogPolyfill.registerDialog(this.dialog.nativeElement);
        this.defaultSettings = this.form.getFormGroup().value; // save the default for potential resetting
        // get stored settings (if any)
        this.fetchPersistentSettings();

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
        localStorage.setItem(this.storageKey, JSON.stringify(this.form.getFormGroup().value)); // store updated values
        console.log(JSON.stringify(this.form.getFormGroup().value));
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

    /** @author Mathijs Boezer */
    private fetchPersistentSettings(): void {
        if (localStorage.getItem(this.storageKey)) { // uses defaults if nothing is saved
            try {
                this.loadSetting(JSON.parse(localStorage.getItem(this.storageKey)));
            } catch {
                console.error("Settings in storage do not correspond to expected format."); // when more settings get added this will show once
            }
        }
    }

    private loadSetting(setting: Settings): void {
        this.form.getFormGroup().setValue(setting);
    }

    public resetDefault(): void {
        this.close();
        this.loadSetting(this.defaultSettings);
        this.updateValue();
        this.form.getFormGroup();
        this.open();
    }
    /** @end-author Mathijs Boezer */
}
