import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { InstanceComponent } from './components/instance/instance.component';

export const ROUTES: Routes = [
    {
        path: 'instances/:id',
        component: InstanceComponent
    }
];

export const ROUTING: ModuleWithProviders = RouterModule.forRoot(ROUTES, {
    useHash: false,
});
