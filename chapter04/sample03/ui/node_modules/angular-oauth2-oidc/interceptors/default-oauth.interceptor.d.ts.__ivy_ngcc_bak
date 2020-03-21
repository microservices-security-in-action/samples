import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OAuthResourceServerErrorHandler } from './resource-server-error-handler';
import { OAuthModuleConfig } from '../oauth-module.config';
import { OAuthStorage } from '../types';
import { OAuthService } from '../oauth-service';
export declare class DefaultOAuthInterceptor implements HttpInterceptor {
    private authStorage;
    private oAuthService;
    private errorHandler;
    private moduleConfig;
    constructor(authStorage: OAuthStorage, oAuthService: OAuthService, errorHandler: OAuthResourceServerErrorHandler, moduleConfig: OAuthModuleConfig);
    private checkUrl;
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}
