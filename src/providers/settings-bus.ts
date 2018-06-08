import {Injectable} from '@angular/core';
import {Settings} from '../interfaces/settings';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class SettingsBus {
    /** @author Bart Wesselink */
    private settingsChangedSubject: Subject<Settings> = new Subject<Settings>();
    public settingsChanged: Observable<Settings> = this.settingsChangedSubject.asObservable();

    private currentSettings: Settings;

    public getSettings(): Settings|null {
        if (!this.currentSettings) {
            console.error('Settings component has not been initialized yet.');
            return;
        } else {
            return this.currentSettings;
        }
    }

    public updateSettings(settings: Settings): void {
        this.currentSettings = settings;
        this.settingsChangedSubject.next(settings);
    }
    /** @end-author Bart Wesselink */
}