import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/timeInterval';

import {NgModule} from '@angular/core';
import {MatButtonModule, MatDialogModule, MatFormFieldModule, MatSnackBarModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {ClarityModule} from '@clr/angular';
import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {NgxRemoteDesktopModule} from '@illgrenoble/ngx-remote-desktop';
import {HotkeyModule} from 'angular2-hotkeys';
import {MomentModule} from 'ngx-moment';

import {NgPipesModule} from 'ngx-pipes';
import {FileSizePipe, TimeDurationPipe} from './pipes';
import {NgxErrorsModule} from '@hackages/ngxerrors';

import {FullscreenOverlayContainer, OverlayContainer} from '@angular/cdk/overlay';
import {MAT_DIALOG_DEFAULT_OPTIONS} from '@angular/material';
import {AppComponent} from './app.component';
import {ROUTING} from './app.routing';

import {HttpClientModule} from '@angular/common/http';
import { DesktopService } from './services';
import { InstanceComponent } from './components';

@NgModule({
    declarations: [
        AppComponent,
        FileSizePipe,
        TimeDurationPipe,
        InstanceComponent
    ],
    imports: [
        BrowserModule,
        RouterModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatSnackBarModule,
        MatButtonModule,
        MatFormFieldModule,
        ClarityModule,
        MomentModule,
        HotkeyModule.forRoot(),
        CodemirrorModule,
        NgPipesModule,
        NgxErrorsModule,
        NgxRemoteDesktopModule,
        HttpClientModule,
        ROUTING
    ],
    providers: [
        DesktopService,
        {provide: OverlayContainer, useClass: FullscreenOverlayContainer},
        {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {disableClose: true, hasBackdrop: true}},
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
