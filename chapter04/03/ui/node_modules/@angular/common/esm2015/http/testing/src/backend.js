/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/http/testing/src/backend.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TestRequest } from './request';
/**
 * A testing backend for `HttpClient` which both acts as an `HttpBackend`
 * and as the `HttpTestingController`.
 *
 * `HttpClientTestingBackend` works by keeping a list of all open requests.
 * As requests come in, they're added to the list. Users can assert that specific
 * requests were made and then flush them. In the end, a verify() method asserts
 * that no unexpected requests were made.
 *
 *
 */
export class HttpClientTestingBackend {
    constructor() {
        /**
         * List of pending requests which have not yet been expected.
         */
        this.open = [];
    }
    /**
     * Handle an incoming request by queueing it in the list of open requests.
     * @param {?} req
     * @return {?}
     */
    handle(req) {
        return new Observable((/**
         * @param {?} observer
         * @return {?}
         */
        (observer) => {
            /** @type {?} */
            const testReq = new TestRequest(req, observer);
            this.open.push(testReq);
            observer.next((/** @type {?} */ ({ type: HttpEventType.Sent })));
            return (/**
             * @return {?}
             */
            () => { testReq._cancelled = true; });
        }));
    }
    /**
     * Helper function to search for requests in the list of open requests.
     * @private
     * @param {?} match
     * @return {?}
     */
    _match(match) {
        if (typeof match === 'string') {
            return this.open.filter((/**
             * @param {?} testReq
             * @return {?}
             */
            testReq => testReq.request.urlWithParams === match));
        }
        else if (typeof match === 'function') {
            return this.open.filter((/**
             * @param {?} testReq
             * @return {?}
             */
            testReq => match(testReq.request)));
        }
        else {
            return this.open.filter((/**
             * @param {?} testReq
             * @return {?}
             */
            testReq => (!match.method || testReq.request.method === match.method.toUpperCase()) &&
                (!match.url || testReq.request.urlWithParams === match.url)));
        }
    }
    /**
     * Search for requests in the list of open requests, and return all that match
     * without asserting anything about the number of matches.
     * @param {?} match
     * @return {?}
     */
    match(match) {
        /** @type {?} */
        const results = this._match(match);
        results.forEach((/**
         * @param {?} result
         * @return {?}
         */
        result => {
            /** @type {?} */
            const index = this.open.indexOf(result);
            if (index !== -1) {
                this.open.splice(index, 1);
            }
        }));
        return results;
    }
    /**
     * Expect that a single outstanding request matches the given matcher, and return
     * it.
     *
     * Requests returned through this API will no longer be in the list of open requests,
     * and thus will not match twice.
     * @param {?} match
     * @param {?=} description
     * @return {?}
     */
    expectOne(match, description) {
        description = description || this.descriptionFromMatcher(match);
        /** @type {?} */
        const matches = this.match(match);
        if (matches.length > 1) {
            throw new Error(`Expected one matching request for criteria "${description}", found ${matches.length} requests.`);
        }
        if (matches.length === 0) {
            /** @type {?} */
            let message = `Expected one matching request for criteria "${description}", found none.`;
            if (this.open.length > 0) {
                // Show the methods and URLs of open requests in the error, for convenience.
                /** @type {?} */
                const requests = this.open
                    .map((/**
                 * @param {?} testReq
                 * @return {?}
                 */
                testReq => {
                    /** @type {?} */
                    const url = testReq.request.urlWithParams;
                    /** @type {?} */
                    const method = testReq.request.method;
                    return `${method} ${url}`;
                }))
                    .join(', ');
                message += ` Requests received are: ${requests}.`;
            }
            throw new Error(message);
        }
        return matches[0];
    }
    /**
     * Expect that no outstanding requests match the given matcher, and throw an error
     * if any do.
     * @param {?} match
     * @param {?=} description
     * @return {?}
     */
    expectNone(match, description) {
        description = description || this.descriptionFromMatcher(match);
        /** @type {?} */
        const matches = this.match(match);
        if (matches.length > 0) {
            throw new Error(`Expected zero matching requests for criteria "${description}", found ${matches.length}.`);
        }
    }
    /**
     * Validate that there are no outstanding requests.
     * @param {?=} opts
     * @return {?}
     */
    verify(opts = {}) {
        /** @type {?} */
        let open = this.open;
        // It's possible that some requests may be cancelled, and this is expected.
        // The user can ask to ignore open requests which have been cancelled.
        if (opts.ignoreCancelled) {
            open = open.filter((/**
             * @param {?} testReq
             * @return {?}
             */
            testReq => !testReq.cancelled));
        }
        if (open.length > 0) {
            // Show the methods and URLs of open requests in the error, for convenience.
            /** @type {?} */
            const requests = open.map((/**
             * @param {?} testReq
             * @return {?}
             */
            testReq => {
                /** @type {?} */
                const url = testReq.request.urlWithParams.split('?')[0];
                /** @type {?} */
                const method = testReq.request.method;
                return `${method} ${url}`;
            }))
                .join(', ');
            throw new Error(`Expected no open requests, found ${open.length}: ${requests}`);
        }
    }
    /**
     * @private
     * @param {?} matcher
     * @return {?}
     */
    descriptionFromMatcher(matcher) {
        if (typeof matcher === 'string') {
            return `Match URL: ${matcher}`;
        }
        else if (typeof matcher === 'object') {
            /** @type {?} */
            const method = matcher.method || '(any)';
            /** @type {?} */
            const url = matcher.url || '(any)';
            return `Match method: ${method}, URL: ${url}`;
        }
        else {
            return `Match by function: ${matcher.name}`;
        }
    }
}
HttpClientTestingBackend.decorators = [
    { type: Injectable }
];
if (false) {
    /**
     * List of pending requests which have not yet been expected.
     * @type {?}
     * @private
     */
    HttpClientTestingBackend.prototype.open;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3Rlc3Rpbmcvc3JjL2JhY2tlbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUF5QixhQUFhLEVBQWMsTUFBTSxzQkFBc0IsQ0FBQztBQUN4RixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQzs7Ozs7Ozs7Ozs7O0FBZXRDLE1BQU0sT0FBTyx3QkFBd0I7SUFEckM7Ozs7UUFLVSxTQUFJLEdBQWtCLEVBQUUsQ0FBQztJQTZIbkMsQ0FBQzs7Ozs7O0lBeEhDLE1BQU0sQ0FBQyxHQUFxQjtRQUMxQixPQUFPLElBQUksVUFBVTs7OztRQUFDLENBQUMsUUFBdUIsRUFBRSxFQUFFOztrQkFDMUMsT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUM7WUFDOUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEIsUUFBUSxDQUFDLElBQUksQ0FBQyxtQkFBQSxFQUFFLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFFLEVBQWtCLENBQUMsQ0FBQztZQUM5RDs7O1lBQU8sR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUM7UUFDOUMsQ0FBQyxFQUFDLENBQUM7SUFDTCxDQUFDOzs7Ozs7O0lBS08sTUFBTSxDQUFDLEtBQStEO1FBQzVFLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBQzdCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNOzs7O1lBQUMsT0FBTyxDQUFDLEVB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Q2xDLE9BQU8saUJBQWlCLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztTQUMvQzthQUFNO1lBQ0wsT0FBTyxzQkFBc0IsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQzdDO0lBQ0gsQ0FBQzs7O1lBaklGLFVBQVU7Ozs7Ozs7O0lBS1Qsd0NBQWlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kLCBIdHRwRXZlbnQsIEh0dHBFdmVudFR5cGUsIEh0dHBSZXF1ZXN0fSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cFRlc3RpbmdDb250cm9sbGVyLCBSZXF1ZXN0TWF0Y2h9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7VGVzdFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5cblxuLyoqXG4gKiBBIHRlc3RpbmcgYmFja2VuZCBmb3IgYEh0dHBDbGllbnRgIHdoaWNoIGJvdGggYWN0cyBhcyBhbiBgSHR0cEJhY2tlbmRgXG4gKiBhbmQgYXMgdGhlIGBIdHRwVGVzdGluZ0NvbnRyb2xsZXJgLlxuICpcbiAqIGBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmRgIHdvcmtzIGJ5IGtlZXBpbmcgYSBsaXN0IG9mIGFsbCBvcGVuIHJlcXVlc3RzLlxuICogQXMgcmVxdWVzdHMgY29tZSBpbiwgdGhleSdyZSBhZGRlZCB0byB0aGUgbGlzdC4gVXNlcnMgY2FuIGFzc2VydCB0aGF0IHNwZWNpZmljXG4gKiByZXF1ZXN0cyB3ZXJlIG1hZGUgYW5kIHRoZW4gZmx1c2ggdGhlbS4gSW4gdGhlIGVuZCwgYSB2ZXJpZnkoKSBtZXRob2QgYXNzZXJ0c1xuICogdGhhdCBubyB1bmV4cGVjdGVkIHJlcXVlc3RzIHdlcmUgbWFkZS5cbiAqXG4gKlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudFRlc3RpbmdCYWNrZW5kIGltcGxlbWVudHMgSHR0cEJhY2tlbmQsIEh0dHBUZXN0aW5nQ29udHJvbGxlciB7XG4gIC8qKlxuICAgKiBMaXN0IG9mIHBlbmRpbmcgcmVxdWVzdHMgd2hpY2ggaGF2ZSBub3QgeWV0IGJlZW4gZXhwZWN0ZWQuXG4gICAqL1xuICBwcml2YXRlIG9wZW46IFRlc3RSZXF1ZXN0W10gPSBbXTtcblxuICAvKipcbiAgICogSGFuZGxlIGFuIGluY29taW5nIHJlcXVlc3QgYnkgcXVldWVpbmcgaXQgaW4gdGhlIGxpc3Qgb2Ygb3BlbiByZXF1ZXN0cy5cbiAgICovXG4gIGhhbmRsZShyZXE6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKChvYnNlcnZlcjogT2JzZXJ2ZXI8YW55PikgPT4ge1xuICAgICAgY29uc3QgdGVzdFJlcSA9IG5ldyBUZXN0UmVxdWVzdChyZXEsIG9ic2VydmVyKTtcbiAgICAgIHRoaXMub3Blbi5wdXNoKHRlc3RSZXEpO1xuICAgICAgb2JzZXJ2ZXIubmV4dCh7IHR5cGU6IEh0dHBFdmVudFR5cGUuU2VudCB9IGFzIEh0dHBFdmVudDxhbnk+KTtcbiAgICAgIHJldHVybiAoKSA9PiB7IHRlc3RSZXEuX2NhbmNlbGxlZCA9IHRydWU7IH07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRvIHNlYXJjaCBmb3IgcmVxdWVzdHMgaW4gdGhlIGxpc3Qgb2Ygb3BlbiByZXF1ZXN0cy5cbiAgICovXG4gIHByaXZhdGUgX21hdGNoKG1hdGNoOiBzdHJpbmd8UmVxdWVzdE1hdGNofCgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSk6IFRlc3RSZXF1ZXN0W10ge1xuICAgIGlmICh0eXBlb2YgbWF0Y2ggPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcGVuLmZpbHRlcih0ZXN0UmVxID0+IHRlc3RSZXEucmVxdWVzdC51cmxXaXRoUGFyYW1zID09PSBtYXRjaCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbWF0Y2ggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLm9wZW4uZmlsdGVyKHRlc3RSZXEgPT4gbWF0Y2godGVzdFJlcS5yZXF1ZXN0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLm9wZW4uZmlsdGVyKFxuICAgICAgICAgIHRlc3RSZXEgPT4gKCFtYXRjaC5tZXRob2QgfHwgdGVzdFJlcS5yZXF1ZXN0Lm1ldGhvZCA9PT0gbWF0Y2gubWV0aG9kLnRvVXBwZXJDYXNlKCkpICYmXG4gICAgICAgICAgICAgICghbWF0Y2gudXJsIHx8IHRlc3RSZXEucmVxdWVzdC51cmxXaXRoUGFyYW1zID09PSBtYXRjaC51cmwpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VhcmNoIGZvciByZXF1ZXN0cyBpbiB0aGUgbGlzdCBvZiBvcGVuIHJlcXVlc3RzLCBhbmQgcmV0dXJuIGFsbCB0aGF0IG1hdGNoXG4gICAqIHdpdGhvdXQgYXNzZXJ0aW5nIGFueXRoaW5nIGFib3V0IHRoZSBudW1iZXIgb2YgbWF0Y2hlcy5cbiAgICovXG4gIG1hdGNoKG1hdGNoOiBzdHJpbmd8UmVxdWVzdE1hdGNofCgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSk6IFRlc3RSZXF1ZXN0W10ge1xuICAgIGNvbnN0IHJlc3VsdHMgPSB0aGlzLl9tYXRjaChtYXRjaCk7XG4gICAgcmVzdWx0cy5mb3JFYWNoKHJlc3VsdCA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMub3Blbi5pbmRleE9mKHJlc3VsdCk7XG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMub3Blbi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGVjdCB0aGF0IGEgc2luZ2xlIG91dHN0YW5kaW5nIHJlcXVlc3QgbWF0Y2hlcyB0aGUgZ2l2ZW4gbWF0Y2hlciwgYW5kIHJldHVyblxuICAgKiBpdC5cbiAgICpcbiAgICogUmVxdWVzdHMgcmV0dXJuZWQgdGhyb3VnaCB0aGlzIEFQSSB3aWxsIG5vIGxvbmdlciBiZSBpbiB0aGUgbGlzdCBvZiBvcGVuIHJlcXVlc3RzLFxuICAgKiBhbmQgdGh1cyB3aWxsIG5vdCBtYXRjaCB0d2ljZS5cbiAgICovXG4gIGV4cGVjdE9uZShtYXRjaDogc3RyaW5nfFJlcXVlc3RNYXRjaHwoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbiksIGRlc2NyaXB0aW9uPzogc3RyaW5nKTpcbiAgICAgIFRlc3RSZXF1ZXN0IHtcbiAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uIHx8IHRoaXMuZGVzY3JpcHRpb25Gcm9tTWF0Y2hlcihtYXRjaCk7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHRoaXMubWF0Y2gobWF0Y2gpO1xuICAgIGlmIChtYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgRXhwZWN0ZWQgb25lIG1hdGNoaW5nIHJlcXVlc3QgZm9yIGNyaXRlcmlhIFwiJHtkZXNjcmlwdGlvbn1cIiwgZm91bmQgJHttYXRjaGVzLmxlbmd0aH0gcmVxdWVzdHMuYCk7XG4gICAgfVxuICAgIGlmIChtYXRjaGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgbGV0IG1lc3NhZ2UgPSBgRXhwZWN0ZWQgb25lIG1hdGNoaW5nIHJlcXVlc3QgZm9yIGNyaXRlcmlhIFwiJHtkZXNjcmlwdGlvbn1cIiwgZm91bmQgbm9uZS5gO1xuICAgICAgaWYgKHRoaXMub3Blbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIFNob3cgdGhlIG1ldGhvZHMgYW5kIFVSTHMgb2Ygb3BlbiByZXF1ZXN0cyBpbiB0aGUgZXJyb3IsIGZvciBjb252ZW5pZW5jZS5cbiAgICAgICAgY29uc3QgcmVxdWVzdHMgPSB0aGlzLm9wZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCh0ZXN0UmVxID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSB0ZXN0UmVxLnJlcXVlc3QudXJsV2l0aFBhcmFtcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXRob2QgPSB0ZXN0UmVxLnJlcXVlc3QubWV0aG9kO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHttZXRob2R9ICR7dXJsfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5qb2luKCcsICcpO1xuICAgICAgICBtZXNzYWdlICs9IGAgUmVxdWVzdHMgcmVjZWl2ZWQgYXJlOiAke3JlcXVlc3RzfS5gO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hlc1swXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBlY3QgdGhhdCBubyBvdXRzdGFuZGluZyByZXF1ZXN0cyBtYXRjaCB0aGUgZ2l2ZW4gbWF0Y2hlciwgYW5kIHRocm93IGFuIGVycm9yXG4gICAqIGlmIGFueSBkby5cbiAgICovXG4gIGV4cGVjdE5vbmUobWF0Y2g6IHN0cmluZ3xSZXF1ZXN0TWF0Y2h8KChyZXE6IEh0dHBSZXF1ZXN0PGFueT4pID0+IGJvb2xlYW4pLCBkZXNjcmlwdGlvbj86IHN0cmluZyk6XG4gICAgICB2b2lkIHtcbiAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uIHx8IHRoaXMuZGVzY3JpcHRpb25Gcm9tTWF0Y2hlcihtYXRjaCk7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHRoaXMubWF0Y2gobWF0Y2gpO1xuICAgIGlmIChtYXRjaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgRXhwZWN0ZWQgemVybyBtYXRjaGluZyByZXF1ZXN0cyBmb3IgY3JpdGVyaWEgXCIke2Rlc2NyaXB0aW9ufVwiLCBmb3VuZCAke21hdGNoZXMubGVuZ3RofS5gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgdGhhdCB0aGVyZSBhcmUgbm8gb3V0c3RhbmRpbmcgcmVxdWVzdHMuXG4gICAqL1xuICB2ZXJpZnkob3B0czoge2lnbm9yZUNhbmNlbGxlZD86IGJvb2xlYW59ID0ge30pOiB2b2lkIHtcbiAgICBsZXQgb3BlbiA9IHRoaXMub3BlbjtcbiAgICAvLyBJdCdzIHBvc3NpYmxlIHRoYXQgc29tZSByZXF1ZXN0cyBtYXkgYmUgY2FuY2VsbGVkLCBhbmQgdGhpcyBpcyBleHBlY3RlZC5cbiAgICAvLyBUaGUgdXNlciBjYW4gYXNrIHRvIGlnbm9yZSBvcGVuIHJlcXVlc3RzIHdoaWNoIGhhdmUgYmVlbiBjYW5jZWxsZWQuXG4gICAgaWYgKG9wdHMuaWdub3JlQ2FuY2VsbGVkKSB7XG4gICAgICBvcGVuID0gb3Blbi5maWx0ZXIodGVzdFJlcSA9PiAhdGVzdFJlcS5jYW5jZWxsZWQpO1xuICAgIH1cbiAgICBpZiAob3Blbi5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBTaG93IHRoZSBtZXRob2RzIGFuZCBVUkxzIG9mIG9wZW4gcmVxdWVzdHMgaW4gdGhlIGVycm9yLCBmb3IgY29udmVuaWVuY2UuXG4gICAgICBjb25zdCByZXF1ZXN0cyA9IG9wZW4ubWFwKHRlc3RSZXEgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSB0ZXN0UmVxLnJlcXVlc3QudXJsV2l0aFBhcmFtcy5zcGxpdCgnPycpWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXRob2QgPSB0ZXN0UmVxLnJlcXVlc3QubWV0aG9kO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7bWV0aG9kfSAke3VybH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5qb2luKCcsICcpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBubyBvcGVuIHJlcXVlc3RzLCBmb3VuZCAke29wZW4ubGVuZ3RofTogJHtyZXF1ZXN0c31gKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGRlc2NyaXB0aW9uRnJvbU1hdGNoZXIobWF0Y2hlcjogc3RyaW5nfFJlcXVlc3RNYXRjaHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSk6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiBtYXRjaGVyID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGBNYXRjaCBVUkw6ICR7bWF0Y2hlcn1gO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1hdGNoZXIgPT09ICdvYmplY3QnKSB7XG4gICAgICBjb25zdCBtZXRob2QgPSBtYXRjaGVyLm1ldGhvZCB8fCAnKGFueSknO1xuICAgICAgY29uc3QgdXJsID0gbWF0Y2hlci51cmwgfHwgJyhhbnkpJztcbiAgICAgIHJldHVybiBgTWF0Y2ggbWV0aG9kOiAke21ldGhvZH0sIFVSTDogJHt1cmx9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBNYXRjaCBieSBmdW5jdGlvbjogJHttYXRjaGVyLm5hbWV9YDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==