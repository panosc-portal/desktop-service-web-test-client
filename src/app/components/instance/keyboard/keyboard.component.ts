import 'jqueryui';
import * as $ from 'jquery';
import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, Renderer2, ViewChild, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {OnScreenKeyboard} from '@illgrenoble/guacamole-common-js';
import {RemoteDesktopManager} from '@illgrenoble/ngx-remote-desktop';
import {de, en, fr} from './layouts';

@Component({
    selector: 'app-instance-keyboard-dialog',
    templateUrl: './keyboard.component.html',
    styleUrls: ['./keyboard.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class KeyboardComponent implements AfterViewInit, OnDestroy {

    public manager: RemoteDesktopManager;

    public layouts = [
        {id: 'en', value: 'Qwerty', layout: en},
        {id: 'fr', value: 'Azerty', layout: fr},
        {id: 'de', value: 'Qwertz', layout: de}
    ];

    public selectedLayout = this.layouts[0];

    private keyboard: OnScreenKeyboard;

    @ViewChild('container')
    private container: ElementRef;

    constructor(private dialogRef: MatDialogRef<KeyboardComponent>,
                @Inject(MAT_DIALOG_DATA)
                private data: any,
                private el: ElementRef,
                private renderer: Renderer2) {
        this.manager = data.manager;
    }

    onNoClick(): void {
        this.keyboard.reset();
        this.dialogRef.close();
    }

    public handleLayoutChange($event: any) {
        this.removeKeyboardDisplay();
        this.createKeyboardDisplay(this.selectedLayout.layout);
    }

    ngAfterViewInit() {
        this.makeDraggable();
        this.createKeyboardDisplay(this.selectedLayout.layout);
    }

    ngOnDestroy(): void {
    }

    private createKeyboard(layoutId: string): OnScreenKeyboard {
        const layout = new OnScreenKeyboard.Layout(layoutId);
        const keyboard = new OnScreenKeyboard(layout);
        return keyboard;
    }

    private bindKeyboardHandlers(): void {
        this.keyboard.onkeydown = this.handleKeyDown.bind(this);
        this.keyboard.onkeyup = this.handleKeyUp.bind(this);
    }

    private handleKeyDown(key: number): void {
        this.manager.getClient().sendKeyEvent(1, key);
    }

    private handleKeyUp(key: number): void {
        this.manager.getClient().sendKeyEvent(0, key);
    }

    private removeKeyboardDisplay(): void {
        const element = this.container.nativeElement;
        this.renderer.removeChild(element, this.keyboard.getElement());
    }

    private createKeyboardElement(): void {
        const element = this.container.nativeElement;
        this.renderer.appendChild(element, this.keyboard.getElement());
        this.keyboard.resize(element.offsetWidth);
    }

    private createKeyboardDisplay(layoutId): void {
        this.keyboard = this.createKeyboard(layoutId);
        this.createKeyboardElement();
        this.bindKeyboardHandlers();
    }

    private makeDraggable(): void {
        const containerRef = <ElementRef>(<any>this.dialogRef)._containerInstance._elementRef;
        const parentContainer = $('.ngx-remote-desktop');
        $(containerRef.nativeElement).draggable({
            containment: parentContainer,
            scroll: false
        });
    }

}
