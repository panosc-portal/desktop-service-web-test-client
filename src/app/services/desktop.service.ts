import 'rxjs/add/operator/map';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {SocketIOTunnel} from '@illgrenoble/guacamole-common-js';
import {environment} from 'environments/environment';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class DesktopService {
    constructor(private http: HttpClient,
                private route: ActivatedRoute) {
    }

    /**
     * Create a instance authentication ticket
     * This ticket is used for connecting to the SocketIO endpoints
     * @param {Instance} instance
     * @returns {Observable<string>}
     */
    getInstanceAuthenticationToken(): Observable<string> {
        return this.route.queryParamMap.filter(params => params != null).map(params => params.get('token'));

        // const url = `${baseUrl}/account/instances/${instance.id}/auth/token`;
        // const url = '';
        // return this.http.post<any>(url, null).map(response => {
        //     const data = response.data;
        //     return data.token;
        // });
    }

    /**
     * Create a new remote desktop tunnel to connect to a instance
     * @returns SocketIOTunnel
     */
    createRemoteDesktopTunnel(): SocketIOTunnel {
        const {url, path} = environment.servers.vdi;
        const connectionOptions = {
            'force new connection': true,
            'reconnection': false,
            'forceNew': true,
            'path': path,
            'transports': ['websocket']
        };
        return new SocketIOTunnel(url, connectionOptions, 'display');
    }


}
