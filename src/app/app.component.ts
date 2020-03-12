import { Component } from '@angular/core';

@Component({
    selector: 'app-main',
    template: `
        <div>
            <router-outlet></router-outlet>
        </div>
    `
})
export class AppComponent {
}
