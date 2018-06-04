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
import {HelpButtonComponent} from "../components/help-button/help-button.component";
import {FormFactory} from '../form/form-factory';
import {FormComponent} from '../components/form/form.component';
import {ReactiveFormsModule} from '@angular/forms';
import {NgPipesModule} from 'ngx-pipes';
import {VisualizationSettingsButtonComponent} from '../components/visualization-settings-button/visualization-settings-button.component';
import {GeneralSettingsButtonComponent} from '../components/general-settings-button/general-settings-button.component';
import {SettingsBus} from '../providers/settings-bus';
import {MdlDirective} from '../directives/material-design/material-design.directive';
import {WelcomePageComponent} from '../components/welcome-page/welcome-page.component';
import {APP_BASE_HREF} from '@angular/common';
import {WorkerManager} from '../utils/worker-manager';
import { WebWorkerService } from 'angular2-web-worker';
import {LoaderComponent} from '../components/loader/loader.component';
import {SelectBus} from '../providers/select-bus';
import {TooltipComponent} from '../components/tooltip/tooltip.component';
import {SearchComponent} from '../components/search/search.component';
import {DatasetSelectionComponent} from "../components/dataset-selection/dataset-selection.component";
import {DatasetStorageService} from "../providers/dataset-storage-service";

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
        HelpButtonComponent,
        FormComponent,
        VisualizationSettingsButtonComponent,
        GeneralSettingsButtonComponent,
        MdlDirective,
        WelcomePageComponent,
        LoaderComponent,
        TooltipComponent,
        SearchComponent,
        DatasetSelectionComponent,
    ],
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        NgPipesModule,
    ],
    providers: [
        FormFactory,
        WebWorkerService,
        WorkerManager,
        SettingsBus,
        SelectBus,
        DatasetStorageService,
        {provide: APP_BASE_HREF, useValue : '/' }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
