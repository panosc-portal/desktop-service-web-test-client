import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {ActivatedRoute} from '@angular/router';
import {SocketIOTunnel} from '@illgrenoble/guacamole-common-js';
import {RemoteDesktopManager} from '@illgrenoble/ngx-remote-desktop';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';
import * as FileSaver from 'file-saver';
import {ClipboardComponent} from './clipboard';
import {KeyboardComponent} from './keyboard';
import { DesktopService } from 'app/services';

@Component({
    encapsulation: ViewEncapsulation.None,
    templateUrl: './instance.component.html',
    styleUrls: ['./instance.component.scss']
})
export class InstanceComponent implements OnInit, OnDestroy {

    public manager: RemoteDesktopManager;

    /**
     * Hot keys
     */
    private hotkeys: Hotkey[] = [];


    /**
     * Update the stats for the connection every 1 second
     */
    private statsInterval$;

    /**
     * Subscription for a tunnel instruction is received from the remote desktop
     */
    private tunnelInstruction$;

    /**
     * Subscription for the remote desktop state
     */
    private state$;

    private instanceId: number;

    private ownerNotConnected = false;

    constructor(private route: ActivatedRoute,
                private dialog: MatDialog,
                private hotkeysService: HotkeysService,
                private desktopService: DesktopService) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.instanceId = +params.get('id');
            this.createManager();
            this.createAndBindHotkeys();
            this.connectToRemoteDesktop(this.instanceId);
        });
}

    /**
     * Clean up handlers and disconnect from services
     */
    ngOnDestroy(): void {
        this.closeAllDialogs();
        this.unbindManagerHandlers();
        this.unbindHotkeys();
        this.unbindManagerHandlers();
        this.manager.disconnect();
    }

    /**
     * Open the keyboard dialog
     */
    public handleKeyboard(): void {
        if (this.dialog.getDialogById('keyboard-dialog') === undefined) {
            this.createKeyboardDialog();
        }
    }

    /**
     * Connect to the remote desktop
     */
    public handleConnect(): void {
        this.ownerNotConnected = false;
        this.connectToRemoteDesktop(this.instanceId);
    }

    /**
     * Create a screenshot
     */
    public handleScreenshot(): void {
        this.createScreenshot();
    }

    /**
     * Open the clipboard dialog
     */
    public handleClipboard(): void {
        this.createClipboardDialog();
    }

    /**
     * Enter into full screen mode
     */
    public handleEnterFullScreen(): void {
        this.manager.setFullScreen(true);
    }

    /**
     * Exit out of full screen mode
     */
    public handleExitFullScreen(): void {
        this.manager.setFullScreen(false);
    }


    /**
     * Generate a screenshot of the remote desktop and download to the client
     */
    private createScreenshot(): void {
        this.manager.createScreenshot(blob => {
            if (blob) {
                FileSaver.saveAs(blob, `screenshot.png`);
            }
        });
    }

    /**
     * If the manager does not exist, create it.
     */
    private createManager(): void {
        if (this.manager) {
            return;
        }
        const tunnel = this.desktopService.createRemoteDesktopTunnel();
        this.manager = new RemoteDesktopManager(tunnel);
    }

    /**
     * Create an authentication ticket and then connect to the remote desktop
     * Bind the manager handlers
     */
    private connectToRemoteDesktop(instanceId: number) {
        if (this.manager.isConnected()) {
            return;
        }

        this.desktopService.getInstanceAuthenticationToken()
            .filter(token => token !== null).subscribe(token => {
                this.manager.connect({
                    token: token, 
                    instanceId: instanceId,
                    screenWidth: window.screen.width,
                    screenHeight: window.screen.height,
                });
                this.bindManagerHandlers();
            });
    }

    /**
     * Bind all manager handlers
     */
    private bindManagerHandlers(): void {
        this.handleSocketMessages();
        this.handleState();
    }

    /**
     * Handle the current state of the remote desktop connection
     * If the state is disconnected, unbind all of the manager handles and close any relevant open dialogs
     */
    private handleState(): void {
        this.state$ = this.manager.onStateChange.subscribe(state => {
            if (state === 'DISCONNECTED') {
                this.unbindManagerHandlers();
                this.removeDialog('keyboard-dialog');
                this.removeDialog('clipboard-dialog');
            }
        });
    }

    /**
     * Unbind all of the manager handlers
     */
    private unbindManagerHandlers(): void {
        if (this.statsInterval$) {
            this.statsInterval$.unsubscribe();
        }
        if (this.tunnelInstruction$) {
            this.tunnelInstruction$.unsubscribe();
        }
        if (this.state$) {
            this.state$.unsubscribe();
        }
    }

    /**
     * Handle any socket messages received
     */
    private handleSocketMessages(): void {
        const tunnel = <SocketIOTunnel>this.manager.getTunnel();
        const socket = tunnel.getSocket();
        socket.on('disconnect', () => {
            console.log('disconnect');
        });
        socket.on('users:connected', data => {
            console.log('Users connected', data);
        });
        socket.on('user:connected', data => {
            console.log('User connected', data);
            // this.snotifyService.success(`${data.fullName} has connected to the instance`);
        });
        socket.on('user:disconnected', data => {
            console.log('User disconnected', data);
            // this.snotifyService.success(`${data.fullName} has disconnected from the instance`);
        });
        socket.on('owner:away', data => {
            this.ownerNotConnected = true;
        });
    }

    private handleSendRemoteClipboardData(text: string): void {
        this.manager.sendRemoteClipboardData(text);
    }

    /**
     * Create all of the hot keys
     */
    private createAndBindHotkeys(): void {
        this.createKeyboardHotkey();
        this.createClipboardHotKey();
        this.createFullScreenHotkey();
        this.bindHotkeys();
    }

    /**
     * Bind all of the hot keys to the hotkey service
     */
    private bindHotkeys(): void {
        this.hotkeys.forEach(hotkey => this.hotkeysService.add(hotkey));
    }

    /**
     * Unbind all of the hot keys from the hotkey service
     */
    private unbindHotkeys(): void {
        this.hotkeys.forEach(hotkey => this.hotkeysService.remove(hotkey));
    }

    /**
     * Associate a keyboard hot key to open and close the keyboard dialog
     */
    private createKeyboardHotkey(): void {
        this.hotkeys.push(new Hotkey('ctrl+shift+alt+k', (event: KeyboardEvent): boolean => {
            const id = 'keyboard-dialog';
            if (this.isDialogOpen(id)) {
                this.removeDialog(id);
            } else {
                this.createKeyboardDialog();
            }
            return false; // Prevent bubbling
        }));
    }

    /**
     * Associate a hot key to open and close the clipboard dialog
     */
    private createClipboardHotKey(): void {
        this.hotkeys.push(new Hotkey('ctrl+shift+alt+c', (event: KeyboardEvent): boolean => {
            const id = 'clipboard-dialog';
            if (this.isDialogOpen(id)) {
                this.removeDialog(id);
            } else {
                this.createClipboardDialog();
            }
            return false; // Prevent bubbling
        }));
    }

    /**
     * Associate a hot key to enter into full screen
     */
    private createFullScreenHotkey(): void {
        this.hotkeys.push(new Hotkey('ctrl+shift+alt+f', (event: KeyboardEvent): boolean => {
            this.handleEnterFullScreen();
            return false; // Prevent bubbling
        }));
    }

    /**
     * Create a new dialog
     * @param component
     * @param {string} id
     * @returns {MatDialogRef<any, {}>}
     */
    private createDialog(component, id: string): MatDialogRef<any, {}> {
        return this.dialog.open(component, {
            height: 'auto',
            id: id,
            width: '850px',
            data: {
                manager: this.manager
            }
        });
    }

    /**
     * Remove a dialog
     * @param {string} id
     */
    private removeDialog(id: string): void {
        const dialog = this.dialog.getDialogById(id);
        if (dialog) {
            dialog.close();
        }
        this.manager.setFocused(true);
    }

    /**
     * Create the keyboard dialog
     */
    private createKeyboardDialog(): void {
        if (!this.manager.isConnected()) {
            return;
        }
        this.dialog.open(KeyboardComponent, {
            id: 'keyboard-dialog',
            height: 'auto',
            width: '750px',
            panelClass: 'mat-dialog-container-semi-transparent',
            data: {
                manager: this.manager
            },
            hasBackdrop: false
        });
    }

    /**
     * Create the clipboard dialog
     */
    private createClipboardDialog(): void {
        if (!this.manager.isConnected()) {
            return;
        }
        this.manager.setFocused(false);
        const dialog = this.createDialog(ClipboardComponent, 'clipboard-dialog');
        dialog.afterClosed()
            .finally(() => this.manager.setFocused(true))
            .filter(text => text != null)
            .subscribe(text => this.handleSendRemoteClipboardData(text.toString()));
    }

    /**
     * Check if a dialog for a given identifier is open
     * @param {string} id
     * @returns {boolean}
     */
    private isDialogOpen(id: string): boolean {
        const dialog = this.dialog.getDialogById(id);
        return (dialog !== undefined);
    }

    /**
     * Close all open dialogs
     */
    private closeAllDialogs(): void {
        this.dialog.closeAll();
    }

}


