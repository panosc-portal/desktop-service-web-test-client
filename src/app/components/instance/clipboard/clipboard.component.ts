import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Component, Inject} from '@angular/core';

@Component({
    selector: 'app-instance-clipboard-dialog',
    templateUrl: './clipboard.component.html'
})
export class ClipboardComponent {
    public text = '';
    private clipboardSubscription;

    constructor(private dialogRef: MatDialogRef<ClipboardComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any) {
        const manager = data.manager;
        this.clipboardSubscription = manager.onRemoteClipboardData;
        this.clipboardSubscription.subscribe(text => this.text = text);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

}
