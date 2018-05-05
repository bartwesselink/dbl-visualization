import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {SidebarComponent} from '../components/sidebar/sidebar.component';
import {WindowComponent} from '../components/window/window.component';
import {ScreenshotButtonComponent} from '../components/screenshot-button/screenshot-button.component';
import {TreeNavigatorComponent} from '../components/tree-navigator/tree-navigator.component';
import {TreeNavigatorItemComponent} from '../components/tree-navigator-item/tree-navigator-item.component';
import {UploadToolComponent} from '../components/upload-tool/upload-tool.component';
import {VisualizationPickerComponent} from '../components/visualization-picker/visualization-picker.component';

@NgModule({
    declarations: [
        AppComponent,
        SidebarComponent,
        WindowComponent,
        ScreenshotButtonComponent,
        TreeNavigatorComponent,
        TreeNavigatorItemComponent,
        UploadToolComponent,
        VisualizationPickerComponent,
    ],
    imports: [
        BrowserModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
