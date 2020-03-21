/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/location/platform_location.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, InjectionToken, ɵɵinject } from '@angular/core';
import { getDOM } from '../dom_adapter';
import { DOCUMENT } from '../dom_tokens';
import * as i0 from "@angular/core";
/**
 * This class should not be used directly by an application developer. Instead, use
 * {\@link Location}.
 *
 * `PlatformLocation` encapsulates all calls to DOM apis, which allows the Router to be platform
 * agnostic.
 * This means that we can have different implementation of `PlatformLocation` for the different
 * platforms that angular supports. For example, `\@angular/platform-browser` provides an
 * implementation specific to the browser environment, while `\@angular/platform-webworker` provides
 * one suitable for use with web workers.
 *
 * The `PlatformLocation` class is used directly by all implementations of {\@link LocationStrategy}
 * when they need to interact with the DOM apis like pushState, popState, etc...
 *
 * {\@link LocationStrategy} in turn is used by the {\@link Location} service which is used directly
 * by the {\@link Router} in order to navigate between routes. Since all interactions between {\@link
 * Router} /
 * {\@link Location} / {\@link LocationStrategy} and DOM apis flow through the `PlatformLocation`
 * class they are all platform independent.
 *
 * \@publicApi
 * @abstract
 */
export class PlatformLocation {
}
PlatformLocation.decorators = [
    { type: Injectable, args: [{
                providedIn: 'platform',
                // See #23917
                useFactory: useBrowserPlatformLocation
            },] }
];
/** @nocollapse */ PlatformLocation.ɵprov = i0.ɵɵdefineInjectable({ factory: useBrowserPlatformLocation, token: PlatformLocation, providedIn: "platform" });
if (false) {
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.getBaseHrefFromDOM = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.getState = function () { };
    /**
     * @abstract
     * @param {?} fn
     * @return {?}
     */
    PlatformLocation.prototype.onPopState = function (fn) { };
    /**
     * @abstract
     * @param {?} fn
     * @return {?}
     */
    PlatformLocation.prototype.onHashChange = function (fn) { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.href = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.protocol = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.hostname = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.port = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.pathname = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.search = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.hash = function () { };
    /**
     * @abstract
     * @param {?} state
     * @param {?} title
     * @param {?} url
     * @return {?}
     */
    PlatformLocation.prototype.replaceState = function (state, title, url) { };
    /**
     * @abstract
     * @param {?} state
     * @param {?} title
     * @param {?} url
     * @return {?}
     */
    PlatformLocation.prototype.pushState = function (state, title, url) { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.forward = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.back = function () { };
}
/**
 * @return {?}
 */
export function useBrowserPlatformLocation() {
    return ɵɵinject(BrowserPlatformLocation);
}
/**
 * \@description
 * Indicates when a location is initialized.
 *
 * \@publicApi
 * @type {?}
 */
export const LOCATION_INITIALIZED = new InjectionToken('Location Initialized');
/**
 * \@description
 * A serializable version of the event from `onPopState` or `onHashChange`
 *
 * \@publicApi
 * @record
 */
export function LocationChangeEvent() { }
if (false) {
    /** @type {?} */
    LocationChangeEvent.prototype.type;
    /** @type {?} */
    LocationChangeEvent.prototype.state;
}
/**
 * \@publicApi
 * @record
 */
export function LocationChangeListener() { }
/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * {\@link Location}.
 */
export class BrowserPlatformLocation extends PlatformLocation {
    /**
     * @param {?} _doc
     */
    constructor(_doc) {
        super();
        this._doc = _doc;
        this._init();
    }
    // This is moved to its own method so that `MockPlatformLocationStrategy` can overwrite it
    /**
     * \@internal
     * @return {?}
     */
    _init() {
        ((/** @type {?} */ (this))).location = getDOM().getLocation();
        this._history = getDOM().getHistory();
    }
    /**
     * @return {?}
     */
    getBaseHrefFromDOM() { return (/** @type {?} */ (getDOM().getBaseHref(this._doc))); }
    /**
     * @param {?} fn
     * @return {?}
     */
    onPopState(fn) {
        getDOM().getGlobalEventTarget(this._doc, 'window').addEventListener('popstate', fn, false);
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onHashChange(fn) {
        getDOM().getGlobalEventTarget(this._doc, 'window').addEventListener('hashchange', fn, false);
    }
    /**
     * @return {?}
     */
    get href() { return this.location.href; }
    /**
     * @return {?}
     */
    get protocol() { return this.location.protocol; }
    /**
     * @return {?}
     */
    get hostname() { return this.location.hostname; }
    /**
     * @return {?}
     */
    get port() { return this.location.port; }
    /**
     * @return {?}
     */
    get pathname() { return this.location.pathname; }
    /**
     * @return {?}
     */
    get search() { return this.location.search; }
    /**
     * @return {?}
     */
    get hash() { return this.location.hash; }
    /**
     * @param {?} newPath
     * @return {?}
     */
    set pathname(newPath) { this.location.pathname = newPath; }
    /**
     * @param {?} state
     * @param {?} title
     * @param {?} url
     * @return {?}
     */
    pushState(state, title, url) {
        if (supportsState()) {
            this._history.pushState(state, title, url);
        }
        else {
            this.location.hash = url;
        }
    }
    /**
     * @param {?} state
     * @param {?} title
     * @param {?} url
     * @return {?}
     */
    replaceState(state, title, url) {
        if (supportsState()) {
            this._history.replaceState(state, title, url);
        }
        else {
            this.location.hash = url;
        }
    }
    /**
     * @return {?}
     */
    forward() { this._history.forward(); }
    /**
     * @return {?}
     */
    back() { this._history.back(); }
    /**
     * @return {?}
     */
    getState() { return this._history.state; }
}
BrowserPlatformLocation.decorators = [
    { type: Injectable, args: [{
                providedIn: 'platform',
                // See #23917
                useFactory: createBrowserPlatformLocation,
            },] }
];
/** @nocollapse */
BrowserPlatformLocation.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
/** @nocollapse */ BrowserPlatformLocation.ɵprov = i0.ɵɵdefineInjectable({ factory: createBrowserPlatformLocation, token: BrowserPlatformLocation, providedIn: "platform" });
if (false) {
    /** @type {?} */
    BrowserPlatformLocation.prototype.location;
    /**
     * @type {?}
     * @private
     */
    BrowserPlatformLocation.prototype._history;
    /**
     * @type {?}
     * @private
     */
    BrowserPlatformLocation.prototype._doc;
}
/**
 * @return {?}
 */
export function supportsState() {
    return !!window.history.pushState;
}
/**
 * @return {?}
 */
export function createBrowserPlatformLocation() {
    return new BrowserPlatformLocation(ɵɵinject(DOCUMENT));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fbG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDM0UsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3RDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE2QnZDLE1BQU0sT0FBZ0IsZ0JBQWdCOzs7WUFMckMsVUFBVSxTQUFDO2dCQUNWLFVBQVUsRUFBRSxVQUFVOztnQkFFdEIsVUFBVSxFQUFFLDBCQUEwQjthQUN2Qzs7Ozs7Ozs7SUFFQyxnRUFBc0M7Ozs7O0lBQ3RDLHNEQUE2Qjs7Ozs7O0lBQzdCLDBEQUFzRDs7Ozs7O0lBQ3RELDREQUF3RDs7Ozs7SUFFeEQsa0RBQTRCOzs7OztJQUM1QixzREFBZ0M7Ozs7O0lBQ2hDLHNEQUFnQzs7Ozs7SUFDaEMsa0RBQTRCOzs7OztJQUM1QixzREFBZ0M7Ozs7O0lBQ2hDLG9EQUE4Qjs7Ozs7SUFDOUIsa0RBQTRCOzs7Ozs7OztJQUU1QiwyRUFBb0U7Ozs7Ozs7O0lBRXBFLHdFQUFpRTs7Ozs7SUFFakUscURBQXlCOzs7OztJQUV6QixrREFBc0I7Ozs7O0FBR3hCLE1BQU0sVUFBVSwwQkFBMEI7SUFDeEMsT0FBTyxRQUFRLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUMzQyxDQUFDOzs7Ozs7OztBQVFELE1BQU0sT0FBTyxvQkFBb0IsR0FBRyxJQUFJLGNBQWMsQ0FBZSxzQkFBc0IsQ0FBQzs7Ozs7Ozs7QUFRNUYseUNBR0M7OztJQUZDLG1DQUFhOztJQUNiLG9DQUFXOzs7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LElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7O0lBRXRDLFFBQVEsS0FBYyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs7O1lBNURwRCxVQUFVLFNBQUM7Z0JBQ1YsVUFBVSxFQUFFLFVBQVU7O2dCQUV0QixVQUFVLEVBQUUsNkJBQTZCO2FBQzFDOzs7OzRDQUtjLE1BQU0sU0FBQyxRQUFROzs7OztJQUg1QiwyQ0FBcUM7Ozs7O0lBQ3JDLDJDQUE0Qjs7Ozs7SUFFaEIsdUNBQW1DOzs7OztBQXNEakQsTUFBTSxVQUFVLGFBQWE7SUFDM0IsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFDcEMsQ0FBQzs7OztBQUNELE1BQU0sVUFBVSw2QkFBNkI7SUFDM0MsT0FBTyxJQUFJLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ3pELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgybXJtWluamVjdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2dldERPTX0gZnJvbSAnLi4vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi4vZG9tX3Rva2Vucyc7XG5cbi8qKlxuICogVGhpcyBjbGFzcyBzaG91bGQgbm90IGJlIHVzZWQgZGlyZWN0bHkgYnkgYW4gYXBwbGljYXRpb24gZGV2ZWxvcGVyLiBJbnN0ZWFkLCB1c2VcbiAqIHtAbGluayBMb2NhdGlvbn0uXG4gKlxuICogYFBsYXRmb3JtTG9jYXRpb25gIGVuY2Fwc3VsYXRlcyBhbGwgY2FsbHMgdG8gRE9NIGFwaXMsIHdoaWNoIGFsbG93cyB0aGUgUm91dGVyIHRvIGJlIHBsYXRmb3JtXG4gKiBhZ25vc3RpYy5cbiAqIFRoaXMgbWVhbnMgdGhhdCB3ZSBjYW4gaGF2ZSBkaWZmZXJlbnQgaW1wbGVtZW50YXRpb24gb2YgYFBsYXRmb3JtTG9jYXRpb25gIGZvciB0aGUgZGlmZmVyZW50XG4gKiBwbGF0Zm9ybXMgdGhhdCBhbmd1bGFyIHN1cHBvcnRzLiBGb3IgZXhhbXBsZSwgYEBhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXJgIHByb3ZpZGVzIGFuXG4gKiBpbXBsZW1lbnRhdGlvbiBzcGVjaWZpYyB0byB0aGUgYnJvd3NlciBlbnZpcm9ubWVudCwgd2hpbGUgYEBhbmd1bGFyL3BsYXRmb3JtLXdlYndvcmtlcmAgcHJvdmlkZXNcbiAqIG9uZSBzdWl0YWJsZSBmb3IgdXNlIHdpdGggd2ViIHdvcmtlcnMuXG4gKlxuICogVGhlIGBQbGF0Zm9ybUxvY2F0aW9uYCBjbGFzcyBpcyB1c2VkIGRpcmVjdGx5IGJ5IGFsbCBpbXBsZW1lbnRhdGlvbnMgb2Yge0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9XG4gKiB3aGVuIHRoZXkgbmVlZCB0byBpbnRlcmFjdCB3aXRoIHRoZSBET00gYXBpcyBsaWtlIHB1c2hTdGF0ZSwgcG9wU3RhdGUsIGV0Yy4uLlxuICpcbiAqIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fSBpbiB0dXJuIGlzIHVzZWQgYnkgdGhlIHtAbGluayBMb2NhdGlvbn0gc2VydmljZSB3aGljaCBpcyB1c2VkIGRpcmVjdGx5XG4gKiBieSB0aGUge0BsaW5rIFJvdXRlcn0gaW4gb3JkZXIgdG8gbmF2aWdhdGUgYmV0d2VlbiByb3V0ZXMuIFNpbmNlIGFsbCBpbnRlcmFjdGlvbnMgYmV0d2VlbiB7QGxpbmtcbiAqIFJvdXRlcn0gL1xuICoge0BsaW5rIExvY2F0aW9ufSAvIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fSBhbmQgRE9NIGFwaXMgZmxvdyB0aHJvdWdoIHRoZSBgUGxhdGZvcm1Mb2NhdGlvbmBcbiAqIGNsYXNzIHRoZXkgYXJlIGFsbCBwbGF0Zm9ybSBpbmRlcGVuZGVudC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3BsYXRmb3JtJyxcbiAgLy8gU2VlICMyMzkxN1xuICB1c2VGYWN0b3J5OiB1c2VCcm93c2VyUGxhdGZvcm1Mb2NhdGlvblxufSlcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQbGF0Zm9ybUxvY2F0aW9uIHtcbiAgYWJzdHJhY3QgZ2V0QmFzZUhyZWZGcm9tRE9NKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0U3RhdGUoKTogdW5rbm93bjtcbiAgYWJzdHJhY3Qgb25Qb3BTdGF0ZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IHZvaWQ7XG4gIGFic3RyYWN0IG9uSGFzaENoYW5nZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IHZvaWQ7XG5cbiAgYWJzdHJhY3QgZ2V0IGhyZWYoKTogc3RyaW5nO1xuICBhYnN0cmFjdCBnZXQgcHJvdG9jb2woKTogc3RyaW5nO1xuICBhYnN0cmFjdCBnZXQgaG9zdG5hbWUoKTogc3RyaW5nO1xuICBhYnN0cmFjdCBnZXQgcG9ydCgpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGdldCBwYXRobmFtZSgpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGdldCBzZWFyY2goKTogc3RyaW5nO1xuICBhYnN0cmFjdCBnZXQgaGFzaCgpOiBzdHJpbmc7XG5cbiAgYWJzdHJhY3QgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZDtcblxuICBhYnN0cmFjdCBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcpOiB2b2lkO1xuXG4gIGFic3RyYWN0IGZvcndhcmQoKTogdm9pZDtcblxuICBhYnN0cmFjdCBiYWNrKCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbigpIHtcbiAgcmV0dXJuIMm1ybVpbmplY3QoQnJvd3NlclBsYXRmb3JtTG9jYXRpb24pO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogSW5kaWNhdGVzIHdoZW4gYSBsb2NhdGlvbiBpcyBpbml0aWFsaXplZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBMT0NBVElPTl9JTklUSUFMSVpFRCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxQcm9taXNlPGFueT4+KCdMb2NhdGlvbiBJbml0aWFsaXplZCcpO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQSBzZXJpYWxpemFibGUgdmVyc2lvbiBvZiB0aGUgZXZlbnQgZnJvbSBgb25Qb3BTdGF0ZWAgb3IgYG9uSGFzaENoYW5nZWBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYXRpb25DaGFuZ2VFdmVudCB7XG4gIHR5cGU6IHN0cmluZztcbiAgc3RhdGU6IGFueTtcbn1cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYXRpb25DaGFuZ2VMaXN0ZW5lciB7IChldmVudDogTG9jYXRpb25DaGFuZ2VFdmVudCk6IGFueTsgfVxuXG5cblxuLyoqXG4gKiBgUGxhdGZvcm1Mb2NhdGlvbmAgZW5jYXBzdWxhdGVzIGFsbCBvZiB0aGUgZGlyZWN0IGNhbGxzIHRvIHBsYXRmb3JtIEFQSXMuXG4gKiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgdXNlZCBkaXJlY3RseSBieSBhbiBhcHBsaWNhdGlvbiBkZXZlbG9wZXIuIEluc3RlYWQsIHVzZVxuICoge0BsaW5rIExvY2F0aW9ufS5cbiAqL1xuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncGxhdGZvcm0nLFxuICAvLyBTZWUgIzIzOTE3XG4gIHVzZUZhY3Rvcnk6IGNyZWF0ZUJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uLFxufSlcbmV4cG9ydCBjbGFzcyBCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbiBleHRlbmRzIFBsYXRmb3JtTG9jYXRpb24ge1xuICBwdWJsaWMgcmVhZG9ubHkgbG9jYXRpb24gITogTG9jYXRpb247XG4gIHByaXZhdGUgX2hpc3RvcnkgITogSGlzdG9yeTtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIF9kb2M6IGFueSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5faW5pdCgpO1xuICB9XG5cbiAgLy8gVGhpcyBpcyBtb3ZlZCB0byBpdHMgb3duIG1ldGhvZCBzbyB0aGF0IGBNb2NrUGxhdGZvcm1Mb2NhdGlvblN0cmF0ZWd5YCBjYW4gb3ZlcndyaXRlIGl0XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2luaXQoKSB7XG4gICAgKHRoaXMgYXN7bG9jYXRpb246IExvY2F0aW9ufSkubG9jYXRpb24gPSBnZXRET00oKS5nZXRMb2NhdGlvbigpO1xuICAgIHRoaXMuX2hpc3RvcnkgPSBnZXRET00oKS5nZXRIaXN0b3J5KCk7XG4gIH1cblxuICBnZXRCYXNlSHJlZkZyb21ET00oKTogc3RyaW5nIHsgcmV0dXJuIGdldERPTSgpLmdldEJhc2VIcmVmKHRoaXMuX2RvYykgITsgfVxuXG4gIG9uUG9wU3RhdGUoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiB2b2lkIHtcbiAgICBnZXRET00oKS5nZXRHbG9iYWxFdmVudFRhcmdldCh0aGlzLl9kb2MsICd3aW5kb3cnKS5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGZuLCBmYWxzZSk7XG4gIH1cblxuICBvbkhhc2hDaGFuZ2UoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiB2b2lkIHtcbiAgICBnZXRET00oKS5nZXRHbG9iYWxFdmVudFRhcmdldCh0aGlzLl9kb2MsICd3aW5kb3cnKS5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgZm4sIGZhbHNlKTtcbiAgfVxuXG4gIGdldCBocmVmKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmxvY2F0aW9uLmhyZWY7IH1cbiAgZ2V0IHByb3RvY29sKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmxvY2F0aW9uLnByb3RvY29sOyB9XG4gIGdldCBob3N0bmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5sb2NhdGlvbi5ob3N0bmFtZTsgfVxuICBnZXQgcG9ydCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5sb2NhdGlvbi5wb3J0OyB9XG4gIGdldCBwYXRobmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5sb2NhdGlvbi5wYXRobmFtZTsgfVxuICBnZXQgc2VhcmNoKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmxvY2F0aW9uLnNlYXJjaDsgfVxuICBnZXQgaGFzaCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5sb2NhdGlvbi5oYXNoOyB9XG4gIHNldCBwYXRobmFtZShuZXdQYXRoOiBzdHJpbmcpIHsgdGhpcy5sb2NhdGlvbi5wYXRobmFtZSA9IG5ld1BhdGg7IH1cblxuICBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoc3VwcG9ydHNTdGF0ZSgpKSB7XG4gICAgICB0aGlzLl9oaXN0b3J5LnB1c2hTdGF0ZShzdGF0ZSwgdGl0bGUsIHVybCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9jYXRpb24uaGFzaCA9IHVybDtcbiAgICB9XG4gIH1cblxuICByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoc3VwcG9ydHNTdGF0ZSgpKSB7XG4gICAgICB0aGlzLl9oaXN0b3J5LnJlcGxhY2VTdGF0ZShzdGF0ZSwgdGl0bGUsIHVybCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9jYXRpb24uaGFzaCA9IHVybDtcbiAgICB9XG4gIH1cblxuICBmb3J3YXJkKCk6IHZvaWQgeyB0aGlzLl9oaXN0b3J5LmZvcndhcmQoKTsgfVxuXG4gIGJhY2soKTogdm9pZCB7IHRoaXMuX2hpc3RvcnkuYmFjaygpOyB9XG5cbiAgZ2V0U3RhdGUoKTogdW5rbm93biB7IHJldHVybiB0aGlzLl9oaXN0b3J5LnN0YXRlOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdXBwb3J0c1N0YXRlKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gISF3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGU7XG59XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQnJvd3NlclBsYXRmb3JtTG9jYXRpb24oKSB7XG4gIHJldHVybiBuZXcgQnJvd3NlclBsYXRmb3JtTG9jYXRpb24oybXJtWluamVjdChET0NVTUVOVCkpO1xufSJdfQ==