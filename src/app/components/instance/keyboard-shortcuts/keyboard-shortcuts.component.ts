import {Component, Output} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Component({
    selector: 'app-instance-keyboard-shortcuts',
    templateUrl: './keyboard-shortcuts.component.html'
})
export class KeyboardShortcutsComponent {

    @Output()
    close: Subject<null> = new Subject();

}
