import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {SidebarComponent} from '../components/sidebar/sidebar.component';
import {WindowComponent} from '../components/window/window.component';


@NgModule({
    declarations: [
        AppComponent,
        SidebarComponent,
        WindowComponent,
    ],
    imports: [
        BrowserModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
