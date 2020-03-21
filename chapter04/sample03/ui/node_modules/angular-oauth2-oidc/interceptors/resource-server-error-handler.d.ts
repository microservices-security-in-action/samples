import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
export declare abstract class OAuthResourceServerErrorHandler {
    abstract handleError(err: HttpResponse<any>): Observable<any>;
}
export declare class OAuthNoopResourceServerErrorHandler implements OAuthResourceServerErrorHandler {
    handleError(err: HttpResponse<any>): Observable<any>;
}
