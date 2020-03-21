/**
 * @fileoverview added by tsickle
 * Generated from: packages/platform-browser/src/security/dom_sanitization_service.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Injector, SecurityContext, forwardRef, ɵ_sanitizeHtml as _sanitizeHtml, ɵ_sanitizeStyle as _sanitizeStyle, ɵ_sanitizeUrl as _sanitizeUrl, ɵallowSanitizationBypassAndThrow as allowSanitizationBypassOrThrow, ɵbypassSanitizationTrustHtml as bypassSanitizationTrustHtml, ɵbypassSanitizationTrustResourceUrl as bypassSanitizationTrustResourceUrl, ɵbypassSanitizationTrustScript as bypassSanitizationTrustScript, ɵbypassSanitizationTrustStyle as bypassSanitizationTrustStyle, ɵbypassSanitizationTrustUrl as bypassSanitizationTrustUrl, ɵgetSanitizationBypassType as getSanitizationBypassType, ɵunwrapSafeValue as unwrapSafeValue } from '@angular/core';
import * as i0 from "@angular/core";
export { SecurityContext };
/**
 * Marker interface for a value that's safe to use in a particular context.
 *
 * \@publicApi
 * @record
 */
export function SafeValue() { }
/**
 * Marker interface for a value that's safe to use as HTML.
 *
 * \@publicApi
 * @record
 */
export function SafeHtml() { }
/**
 * Marker interface for a value that's safe to use as style (CSS).
 *
 * \@publicApi
 * @record
 */
export function SafeStyle() { }
/**
 * Marker interface for a value that's safe to use as JavaScript.
 *
 * \@publicApi
 * @record
 */
export function SafeScript() { }
/**
 * Marker interface for a value that's safe to use as a URL linking to a document.
 *
 * \@publicApi
 * @record
 */
export function SafeUrl() { }
/**
 * Marker interface for a value that's safe to use as a URL to load executable code from.
 *
 * \@publicApi
 * @record
 */
export function SafeResourceUrl() { }
/**
 * DomSanitizer helps preventing Cross Site Scripting Security bugs (XSS) by sanitizing
 * values to be safe to use in the different DOM contexts.
 *
 * For example, when binding a URL in an `<a [href]="someValue">` hyperlink, `someValue` will be
 * sanitized so that an attacker cannot inject e.g. a `javascript:` URL that would execute code on
 * the website.
 *
 * In specific situations, it might be necessary to disable sanitization, for example if the
 * application genuinely needs to produce a `javascript:` style link with a dynamic value in it.
 * Users can bypass security by constructing a value with one of the `bypassSecurityTrust...`
 * methods, and then binding to that value from the template.
 *
 * These situations should be very rare, and extraordinary care must be taken to avoid creating a
 * Cross Site Scripting (XSS) security bug!
 *
 * When using `bypassSecurityTrust...`, make sure to call the method as early as possible and as
 * close as possible to the source of the value, to make it easy to verify no security bug is
 * created by its use.
 *
 * It is not required (and not recommended) to bypass security if the value is safe, e.g. a URL that
 * does not start with a suspicious protocol, or an HTML snippet that does not contain dangerous
 * code. The sanitizer leaves safe values intact.
 *
 * \@security Calling any of the `bypassSecurityTrust...` APIs disables Angular's built-in
 * sanitization for the value passed in. Carefully check and audit all values and code paths going
 * into this call. Make sure any user data is appropriately escaped for this security context.
 * For more detail, see the [Security Guide](http://g.co/ng/security).
 *
 * \@publicApi
 * @abstract
 */
export class DomSanitizer {
}
DomSanitizer.decorators = [
    { type: Injectable, args: [{ providedIn: 'root', useExisting: forwardRef((/**
                 * @return {?}
                 */
                () => DomSanitizerImpl)) },] }
];
/** @nocollapse */ DomSanitizer.ɵprov = i0.ɵɵdefineInjectable({ factory: function DomSanitizer_Factory() { return i0.ɵɵinject(DomSanitizerImpl); }, token: DomSanitizer, providedIn: "root" });
if (false) {
    /**
     * Sanitizes a value for use in the given SecurityContext.
     *
     * If value is trusted for the context, this method will unwrap the contained safe value and use
     * it directly. Otherwise, value will be sanitized to be safe in the given context, for example
     * by replacing URLs that have an unsafe protocol part (such as `javascript:`). The implementation
     * is responsible to make sure that the value can definitely be safely used in the given context.
     * @abstract
     * @param {?} context
     * @param {?} value
     * @return {?}
     */
    DomSanitizer.prototype.sanitize = function (context, value) { };
    /**
     * Bypass security and trust the given value to be safe HTML. Only use this when the bound HTML
     * is unsafe (e.g. contains `<script>` tags) and the code should be executed. The sanitizer will
     * leave safe HTML intact, so in most situations this method should not be used.
     *
     * **WARNING:** calling this method with untrusted user data exposes your application to XSS
     * security risks!
     * @abstract
     * @param {?} value
     * @return {?}
     */
    DomSanitizer.prototype.bypassSecurityTrustHtml = function (value) { };
    /**
     * Bypass security and trust the given value to be safe style value (CSS).
     *
     * **WARNING:** calling this method with untrusted user data exposes your application to XSS
     * security risks!
     * @abstract
     * @param {?} value
     * @return {?}
     */
    DomSanitizer.prototype.bypassSecurityTrustStyle = function (value) { };
    /**
     * Bypass security and trust the given value to be safe JavaScript.
     *
     * **WARNING:** calling this method with untrusted user data exposes your application to XSS
     * security risks!
     * @abstract
     * @param {?} value
     * @return {?}
     */
    DomSanitizer.prototype.bypassSecurityTrustScript = function (value) { };
    /**
     * Bypass security and trust the given value to be a safe style URL, i.e. a value that can be used
     * in hyperlinks or `<img src>`.
     *
     * **WARNING:** calling this method with untrusted user data exposes your application to XSS
     * security risks!
     * @abstract
     * @param {?} value
     * @return {?}
     */
    DomSanitizer.prototype.bypassSecurityTrustUrl = function (value) { };
    /**
     * Bypass security and trust the given value to be a safe resource URL, i.e. a location that may
     * be used to load executable code from, like `<script src>`, or `<iframe src>`.
     *
     * **WARNING:** calling this method with untrusted user data exposes your application to XSS
     * security risks!
     * @abstract
     * @param {?} value
     * @return {?}
     */
    DomSanitizer.prototype.bypassSecurityTrustResourceUrl = function (value) { };
}
/**
 * @param {?} injector
 * @return {?}
 */
export function domSanitizerImplFactory(injector) {
    return new DomSanitizerImpl(injector.get(DOCUMENT));
}
export class DomSanitizerImpl extends DomSanitizer {
    /**
     * @param {?} _doc
     */
    constructor(_doc) {
        super();
        this._doc = _doc;
    }
    /**
     * @param {?} ctx
     * @param {?} value
     * @return {?}
     */
    sanitize(ctx, value) {
        if (value == null)
            return null;
        switch (ctx) {
            case SecurityContext.NONE:
                return (/** @type {?} */ (value));
            case SecurityContext.HTML:
                if (allowSanitizationBypassOrThrow(value, "HTML" /* Html */)) {
                    return unwrapSafeValue(value);
                }
                return _sanitizeHtml(this._doc, String(value));
            case SecurityContext.STYLE:
                if (allowSanitizationBypassOrThrow(value, "Style" /* Style */)) {
                    return unwrapSafeValue(value);
                }
                return _sanitizeStyle((/** @type {?} */ (value)));
            case SecurityContext.SCRIPT:
                if (allowSanitizationBypassOrThrow(value, "Script" /* Script */)) {
                    return unwrapSafeValue(value);
                }
                throw new Error('unsafe value used in a script context');
            case SecurityContext.URL:
                /** @type {?} */
                const type = getSanitizationBypassType(value);
                if (allowSanitizationBypassOrThrow(value, "URL" /* Url */)) {
                    return unwrapSafeValue(value);
                }
                return _sanitizeUrl(String(value));
            case SecurityContext.RESOURCE_URL:
                if (allowSanitizationBypassOrThrow(value, "ResourceURL" /* ResourceUrl */)) {
                    return unwrapSafeValue(value);
                }
                throw new Error('unsafe value used in a resource URL context (see http://g.co/ng/security#xss)');
            default:
                throw new Error(`Unexpected SecurityContext ${ctx} (see http://g.co/ng/security#xss)`);
        }
    }
    /**
     * @param {?} value
     * @return {?}
     */
    bypassSecurityTrustHtml(value) { return bypassSanitizationTrustHtml(value); }
    /**
     * @param {?} value
     * @return {?}
     */
    bypassSecurityTrustStyle(value) { return bypassSanitizationTrustStyle(value); }
    /**
     * @param {?} value
     * @return {?}
     */
    bypassSecurityTrustScript(value) {
        return bypassSanitizationTrustScript(value);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    bypassSecurityTrustUrl(value) { return bypassSanitizationTrustUrl(value); }
    /**
     * @param {?} value
     * @return {?}
     */
    bypassSecurityTrustResourceUrl(value) {
        return bypassSanitizationTrustResourceUrl(value);
    }
}
DomSanitizerImpl.decorators = [
    { type: Injectable, args: [{ providedIn: 'root', useFactory: domSanitizerImplFactory, deps: [Injector] },] }
];
/** @nocollapse */
DomSanitizerImpl.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
/** @nocollapse */ DomSanitizerImpl.ɵprov = i0.ɵɵdefineInjectable({ factory: function DomSanitizerImpl_Factory() { return domSanitizerImplFactory(i0.ɵɵinject(i0.INJECTOR)); }, token: DomSanitizerImpl, providedIn: "root" });
if (false) {
    /**
     * @type {?}
     * @private
     */
    DomSanitizerImpl.prototype._doc;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX3Nhbml0aXphdGlvbl9zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcGxhdGZvcm0tYnJvd3Nlci9zcmMvc2VjdXJpdHkvZG9tX3Nhbml0aXphdGlvbl9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQWEsZUFBZSxFQUFFLFVBQVUsRUFBNkIsY0FBYyxJQUFJLGFBQWEsRUFBRSxlQUFlLElBQUksY0FBYyxFQUFFLGFBQWEsSUFBSSxZQUFZLEVBQUUsZ0NBQWdDLElBQUksOEJBQThCLEVBQUUsNEJBQTRCLElBQUksMkJBQTJCLEVBQUUsbUNBQW1DLElBQUksa0NBQWtDLEVBQUUsOEJBQThCLElBQUksNkJBQTZCLEVBQUUsNkJBQTZCLElBQUksNEJBQTRCLEVBQUUsMkJBQTJCLElBQUksMEJBQTBCLEVBQUUsMEJBQTBCLElBQUkseUJBQXlCLEVBQUUsZ0JBQWdCLElBQUksZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUV0c0IsT0FBTyxFQUFDLGVBQWUsRUFBQyxDQUFDOzs7Ozs7O0FBU3pCLCtCQUE2Qjs7Ozs7OztBQU83Qiw4QkFBOEM7Ozs7Ozs7QUFPOUMsK0JBQStDOzs7Ozs7O0FBTy9DLGdDQUFnRDs7Ozs7OztBQU9oRCw2QkFBNkM7Ozs7Ozs7QUFPN0MscUNBQXFEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQ3JELE1BQU0sT0FBZ0IsWUFBWTs7O1lBRGpDLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVU7OztnQkFBQyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBQyxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0lBVS9FLGdF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RCxDQUFDOzs7WUFqREYsVUFBVSxTQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUM7Ozs7NENBRXhFLE1BQU0sU0FBQyxRQUFROzs7Ozs7OztJQUFoQixnQ0FBbUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0b3IsIFNhbml0aXplciwgU2VjdXJpdHlDb250ZXh0LCBmb3J3YXJkUmVmLCDJtUJ5cGFzc1R5cGUgYXMgQnlwYXNzVHlwZSwgybVfc2FuaXRpemVIdG1sIGFzIF9zYW5pdGl6ZUh0bWwsIMm1X3Nhbml0aXplU3R5bGUgYXMgX3Nhbml0aXplU3R5bGUsIMm1X3Nhbml0aXplVXJsIGFzIF9zYW5pdGl6ZVVybCwgybVhbGxvd1Nhbml0aXphdGlvbkJ5cGFzc0FuZFRocm93IGFzIGFsbG93U2FuaXRpemF0aW9uQnlwYXNzT3JUaHJvdywgybVieXBhc3NTYW5pdGl6YXRpb25UcnVzdEh0bWwgYXMgYnlwYXNzU2FuaXRpemF0aW9uVHJ1c3RIdG1sLCDJtWJ5cGFzc1Nhbml0aXphdGlvblRydXN0UmVzb3VyY2VVcmwgYXMgYnlwYXNzU2FuaXRpemF0aW9uVHJ1c3RSZXNvdXJjZVVybCwgybVieXBhc3NTYW5pdGl6YXRpb25UcnVzdFNjcmlwdCBhcyBieXBhc3NTYW5pdGl6YXRpb25UcnVzdFNjcmlwdCwgybVieXBhc3NTYW5pdGl6YXRpb25UcnVzdFN0eWxlIGFzIGJ5cGFzc1Nhbml0aXphdGlvblRydXN0U3R5bGUsIMm1YnlwYXNzU2FuaXRpemF0aW9uVHJ1c3RVcmwgYXMgYnlwYXNzU2FuaXRpemF0aW9uVHJ1c3RVcmwsIMm1Z2V0U2FuaXRpemF0aW9uQnlwYXNzVHlwZSBhcyBnZXRTYW5pdGl6YXRpb25CeXBhc3NUeXBlLCDJtXVud3JhcFNhZmVWYWx1ZSBhcyB1bndyYXBTYWZlVmFsdWV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5leHBvcnQge1NlY3VyaXR5Q29udGV4dH07XG5cblxuXG4vKipcbiAqIE1hcmtlciBpbnRlcmZhY2UgZm9yIGEgdmFsdWUgdGhhdCdzIHNhZmUgdG8gdXNlIGluIGEgcGFydGljdWxhciBjb250ZXh0LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTYWZlVmFsdWUge31cblxuLyoqXG4gKiBNYXJrZXIgaW50ZXJmYWNlIGZvciBhIHZhbHVlIHRoYXQncyBzYWZlIHRvIHVzZSBhcyBIVE1MLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTYWZlSHRtbCBleHRlbmRzIFNhZmVWYWx1ZSB7fVxuXG4vKipcbiAqIE1hcmtlciBpbnRlcmZhY2UgZm9yIGEgdmFsdWUgdGhhdCdzIHNhZmUgdG8gdXNlIGFzIHN0eWxlIChDU1MpLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTYWZlU3R5bGUgZXh0ZW5kcyBTYWZlVmFsdWUge31cblxuLyoqXG4gKiBNYXJrZXIgaW50ZXJmYWNlIGZvciBhIHZhbHVlIHRoYXQncyBzYWZlIHRvIHVzZSBhcyBKYXZhU2NyaXB0LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTYWZlU2NyaXB0IGV4dGVuZHMgU2FmZVZhbHVlIHt9XG5cbi8qKlxuICogTWFya2VyIGludGVyZmFjZSBmb3IgYSB2YWx1ZSB0aGF0J3Mgc2FmZSB0byB1c2UgYXMgYSBVUkwgbGlua2luZyB0byBhIGRvY3VtZW50LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTYWZlVXJsIGV4dGVuZHMgU2FmZVZhbHVlIHt9XG5cbi8qKlxuICogTWFya2VyIGludGVyZmFjZSBmb3IgYSB2YWx1ZSB0aGF0J3Mgc2FmZSB0byB1c2UgYXMgYSBVUkwgdG8gbG9hZCBleGVjdXRhYmxlIGNvZGUgZnJvbS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2FmZVJlc291cmNlVXJsIGV4dGVuZHMgU2FmZVZhbHVlIHt9XG5cbi8qKlxuICogRG9tU2FuaXRpemVyIGhlbHBzIHByZXZlbnRpbmcgQ3Jvc3MgU2l0ZSBTY3JpcHRpbmcgU2VjdXJpdHkgYnVncyAoWFNTKSBieSBzYW5pdGl6aW5nXG4gKiB2YWx1ZXMgdG8gYmUgc2FmZSB0byB1c2UgaW4gdGhlIGRpZmZlcmVudCBET00gY29udGV4dHMuXG4gKlxuICogRm9yIGV4YW1wbGUsIHdoZW4gYmluZGluZyBhIFVSTCBpbiBhbiBgPGEgW2hyZWZdPVwic29tZVZhbHVlXCI+YCBoeXBlcmxpbmssIGBzb21lVmFsdWVgIHdpbGwgYmVcbiAqIHNhbml0aXplZCBzbyB0aGF0IGFuIGF0dGFja2VyIGNhbm5vdCBpbmplY3QgZS5nLiBhIGBqYXZhc2NyaXB0OmAgVVJMIHRoYXQgd291bGQgZXhlY3V0ZSBjb2RlIG9uXG4gKiB0aGUgd2Vic2l0ZS5cbiAqXG4gKiBJbiBzcGVjaWZpYyBzaXR1YXRpb25zLCBpdCBtaWdodCBiZSBuZWNlc3NhcnkgdG8gZGlzYWJsZSBzYW5pdGl6YXRpb24sIGZvciBleGFtcGxlIGlmIHRoZVxuICogYXBwbGljYXRpb24gZ2VudWluZWx5IG5lZWRzIHRvIHByb2R1Y2UgYSBgamF2YXNjcmlwdDpgIHN0eWxlIGxpbmsgd2l0aCBhIGR5bmFtaWMgdmFsdWUgaW4gaXQuXG4gKiBVc2VycyBjYW4gYnlwYXNzIHNlY3VyaXR5IGJ5IGNvbnN0cnVjdGluZyBhIHZhbHVlIHdpdGggb25lIG9mIHRoZSBgYnlwYXNzU2VjdXJpdHlUcnVzdC4uLmBcbiAqIG1ldGhvZHMsIGFuZCB0aGVuIGJpbmRpbmcgdG8gdGhhdCB2YWx1ZSBmcm9tIHRoZSB0ZW1wbGF0ZS5cbiAqXG4gKiBUaGVzZSBzaXR1YXRpb25zIHNob3VsZCBiZSB2ZXJ5IHJhcmUsIGFuZCBleHRyYW9yZGluYXJ5IGNhcmUgbXVzdCBiZSB0YWtlbiB0byBhdm9pZCBjcmVhdGluZyBhXG4gKiBDcm9zcyBTaXRlIFNjcmlwdGluZyAoWFNTKSBzZWN1cml0eSBidWchXG4gKlxuICogV2hlbiB1c2luZyBgYnlwYXNzU2VjdXJpdHlUcnVzdC4uLmAsIG1ha2Ugc3VyZSB0byBjYWxsIHRoZSBtZXRob2QgYXMgZWFybHkgYXMgcG9zc2libGUgYW5kIGFzXG4gKiBjbG9zZSBhcyBwb3NzaWJsZSB0byB0aGUgc291cmNlIG9mIHRoZSB2YWx1ZSwgdG8gbWFrZSBpdCBlYXN5IHRvIHZlcmlmeSBubyBzZWN1cml0eSBidWcgaXNcbiAqIGNyZWF0ZWQgYnkgaXRzIHVzZS5cbiAqXG4gKiBJdCBpcyBub3QgcmVxdWlyZWQgKGFuZCBub3QgcmVjb21tZW5kZWQpIHRvIGJ5cGFzcyBzZWN1cml0eSBpZiB0aGUgdmFsdWUgaXMgc2FmZSwgZS5nLiBhIFVSTCB0aGF0XG4gKiBkb2VzIG5vdCBzdGFydCB3aXRoIGEgc3VzcGljaW91cyBwcm90b2NvbCwgb3IgYW4gSFRNTCBzbmlwcGV0IHRoYXQgZG9lcyBub3QgY29udGFpbiBkYW5nZXJvdXNcbiAqIGNvZGUuIFRoZSBzYW5pdGl6ZXIgbGVhdmVzIHNhZmUgdmFsdWVzIGludGFjdC5cbiAqXG4gKiBAc2VjdXJpdHkgQ2FsbGluZyBhbnkgb2YgdGhlIGBieXBhc3NTZWN1cml0eVRydXN0Li4uYCBBUElzIGRpc2FibGVzIEFuZ3VsYXIncyBidWlsdC1pblxuICogc2FuaXRpemF0aW9uIGZvciB0aGUgdmFsdWUgcGFzc2VkIGluLiBDYXJlZnVsbHkgY2hlY2sgYW5kIGF1ZGl0IGFsbCB2YWx1ZXMgYW5kIGNvZGUgcGF0aHMgZ29pbmdcbiAqIGludG8gdGhpcyBjYWxsLiBNYWtlIHN1cmUgYW55IHVzZXIgZGF0YSBpcyBhcHByb3ByaWF0ZWx5IGVzY2FwZWQgZm9yIHRoaXMgc2VjdXJpdHkgY29udGV4dC5cbiAqIEZvciBtb3JlIGRldGFpbCwgc2VlIHRoZSBbU2VjdXJpdHkgR3VpZGVdKGh0dHA6Ly9nLmNvL25nL3NlY3VyaXR5KS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCcsIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IERvbVNhbml0aXplckltcGwpfSlcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEb21TYW5pdGl6ZXIgaW1wbGVtZW50cyBTYW5pdGl6ZXIge1xuICAvKipcbiAgICogU2FuaXRpemVzIGEgdmFsdWUgZm9yIHVzZSBpbiB0aGUgZ2l2ZW4gU2VjdXJpdHlDb250ZXh0LlxuICAgKlxuICAgKiBJZiB2YWx1ZSBpcyB0cnVzdGVkIGZvciB0aGUgY29udGV4dCwgdGhpcyBtZXRob2Qgd2lsbCB1bndyYXAgdGhlIGNvbnRhaW5lZCBzYWZlIHZhbHVlIGFuZCB1c2VcbiAgICogaXQgZGlyZWN0bHkuIE90aGVyd2lzZSwgdmFsdWUgd2lsbCBiZSBzYW5pdGl6ZWQgdG8gYmUgc2FmZSBpbiB0aGUgZ2l2ZW4gY29udGV4dCwgZm9yIGV4YW1wbGVcbiAgICogYnkgcmVwbGFjaW5nIFVSTHMgdGhhdCBoYXZlIGFuIHVuc2FmZSBwcm90b2NvbCBwYXJ0IChzdWNoIGFzIGBqYXZhc2NyaXB0OmApLiBUaGUgaW1wbGVtZW50YXRpb25cbiAgICogaXMgcmVzcG9uc2libGUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGNhbiBkZWZpbml0ZWx5IGJlIHNhZmVseSB1c2VkIGluIHRoZSBnaXZlbiBjb250ZXh0LlxuICAgKi9cbiAgYWJzdHJhY3Qgc2FuaXRpemUoY29udGV4dDogU2VjdXJpdHlDb250ZXh0LCB2YWx1ZTogU2FmZVZhbHVlfHN0cmluZ3xudWxsKTogc3RyaW5nfG51bGw7XG5cbiAgLyoqXG4gICAqIEJ5cGFzcyBzZWN1cml0eSBhbmQgdHJ1c3QgdGhlIGdpdmVuIHZhbHVlIHRvIGJlIHNhZmUgSFRNTC4gT25seSB1c2UgdGhpcyB3aGVuIHRoZSBib3VuZCBIVE1MXG4gICAqIGlzIHVuc2FmZSAoZS5nLiBjb250YWlucyBgPHNjcmlwdD5gIHRhZ3MpIGFuZCB0aGUgY29kZSBzaG91bGQgYmUgZXhlY3V0ZWQuIFRoZSBzYW5pdGl6ZXIgd2lsbFxuICAgKiBsZWF2ZSBzYWZlIEhUTUwgaW50YWN0LCBzbyBpbiBtb3N0IHNpdHVhdGlvbnMgdGhpcyBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuICAgKlxuICAgKiAqKldBUk5JTkc6KiogY2FsbGluZyB0aGlzIG1ldGhvZCB3aXRoIHVudHJ1c3RlZCB1c2VyIGRhdGEgZXhwb3NlcyB5b3VyIGFwcGxpY2F0aW9uIHRvIFhTU1xuICAgKiBzZWN1cml0eSByaXNrcyFcbiAgICovXG4gIGFic3RyYWN0IGJ5cGFzc1NlY3VyaXR5VHJ1c3RIdG1sKHZhbHVlOiBzdHJpbmcpOiBTYWZlSHRtbDtcblxuICAvKipcbiAgICogQnlwYXNzIHNlY3VyaXR5IGFuZCB0cnVzdCB0aGUgZ2l2ZW4gdmFsdWUgdG8gYmUgc2FmZSBzdHlsZSB2YWx1ZSAoQ1NTKS5cbiAgICpcbiAgICogKipXQVJOSU5HOioqIGNhbGxpbmcgdGhpcyBtZXRob2Qgd2l0aCB1bnRydXN0ZWQgdXNlciBkYXRhIGV4cG9zZXMgeW91ciBhcHBsaWNhdGlvbiB0byBYU1NcbiAgICogc2VjdXJpdHkgcmlza3MhXG4gICAqL1xuICBhYnN0cmFjdCBieXBhc3NTZWN1cml0eVRydXN0U3R5bGUodmFsdWU6IHN0cmluZyk6IFNhZmVTdHlsZTtcblxuICAvKipcbiAgICogQnlwYXNzIHNlY3VyaXR5IGFuZCB0cnVzdCB0aGUgZ2l2ZW4gdmFsdWUgdG8gYmUgc2FmZSBKYXZhU2NyaXB0LlxuICAgKlxuICAgKiAqKldBUk5JTkc6KiogY2FsbGluZyB0aGlzIG1ldGhvZCB3aXRoIHVudHJ1c3RlZCB1c2VyIGRhdGEgZXhwb3NlcyB5b3VyIGFwcGxpY2F0aW9uIHRvIFhTU1xuICAgKiBzZWN1cml0eSByaXNrcyFcbiAgICovXG4gIGFic3RyYWN0IGJ5cGFzc1NlY3VyaXR5VHJ1c3RTY3JpcHQodmFsdWU6IHN0cmluZyk6IFNhZmVTY3JpcHQ7XG5cbiAgLyoqXG4gICAqIEJ5cGFzcyBzZWN1cml0eSBhbmQgdHJ1c3QgdGhlIGdpdmVuIHZhbHVlIHRvIGJlIGEgc2FmZSBzdHlsZSBVUkwsIGkuZS4gYSB2YWx1ZSB0aGF0IGNhbiBiZSB1c2VkXG4gICAqIGluIGh5cGVybGlua3Mgb3IgYDxpbWcgc3JjPmAuXG4gICAqXG4gICAqICoqV0FSTklORzoqKiBjYWxsaW5nIHRoaXMgbWV0aG9kIHdpdGggdW50cnVzdGVkIHVzZXIgZGF0YSBleHBvc2VzIHlvdXIgYXBwbGljYXRpb24gdG8gWFNTXG4gICAqIHNlY3VyaXR5IHJpc2tzIVxuICAgKi9cbiAgYWJzdHJhY3QgYnlwYXNzU2VjdXJpdHlUcnVzdFVybCh2YWx1ZTogc3RyaW5nKTogU2FmZVVybDtcblxuICAvKipcbiAgICogQnlwYXNzIHNlY3VyaXR5IGFuZCB0cnVzdCB0aGUgZ2l2ZW4gdmFsdWUgdG8gYmUgYSBzYWZlIHJlc291cmNlIFVSTCwgaS5lLiBhIGxvY2F0aW9uIHRoYXQgbWF5XG4gICAqIGJlIHVzZWQgdG8gbG9hZCBleGVjdXRhYmxlIGNvZGUgZnJvbSwgbGlrZSBgPHNjcmlwdCBzcmM+YCwgb3IgYDxpZnJhbWUgc3JjPmAuXG4gICAqXG4gICAqICoqV0FSTklORzoqKiBjYWxsaW5nIHRoaXMgbWV0aG9kIHdpdGggdW50cnVzdGVkIHVzZXIgZGF0YSBleHBvc2VzIHlvdXIgYXBwbGljYXRpb24gdG8gWFNTXG4gICAqIHNlY3VyaXR5IHJpc2tzIVxuICAgKi9cbiAgYWJzdHJhY3QgYnlwYXNzU2VjdXJpdHlUcnVzdFJlc291cmNlVXJsKHZhbHVlOiBzdHJpbmcpOiBTYWZlUmVzb3VyY2VVcmw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkb21TYW5pdGl6ZXJJbXBsRmFjdG9yeShpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgcmV0dXJuIG5ldyBEb21TYW5pdGl6ZXJJbXBsKGluamVjdG9yLmdldChET0NVTUVOVCkpO1xufVxuXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnLCB1c2VGYWN0b3J5OiBkb21TYW5pdGl6ZXJJbXBsRmFjdG9yeSwgZGVwczogW0luamVjdG9yXX0pXG5leHBvcnQgY2xhc3MgRG9tU2FuaXRpemVySW1wbCBleHRlbmRzIERvbVNhbml0aXplciB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgX2RvYzogYW55KSB7IHN1cGVyKCk7IH1cblxuICBzYW5pdGl6ZShjdHg6IFNlY3VyaXR5Q29udGV4dCwgdmFsdWU6IFNhZmVWYWx1ZXxzdHJpbmd8bnVsbCk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgc3dpdGNoIChjdHgpIHtcbiAgICAgIGNhc2UgU2VjdXJpdHlDb250ZXh0Lk5PTkU6XG4gICAgICAgIHJldHVybiB2YWx1ZSBhcyBzdHJpbmc7XG4gICAgICBjYXNlIFNlY3VyaXR5Q29udGV4dC5IVE1MOlxuICAgICAgICBpZiAoYWxsb3dTYW5pdGl6YXRpb25CeXBhc3NPclRocm93KHZhbHVlLCBCeXBhc3NUeXBlLkh0bWwpKSB7XG4gICAgICAgICAgcmV0dXJuIHVud3JhcFNhZmVWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9zYW5pdGl6ZUh0bWwodGhpcy5fZG9jLCBTdHJpbmcodmFsdWUpKTtcbiAgICAgIGNhc2UgU2VjdXJpdHlDb250ZXh0LlNUWUxFOlxuICAgICAgICBpZiAoYWxsb3dTYW5pdGl6YXRpb25CeXBhc3NPclRocm93KHZhbHVlLCBCeXBhc3NUeXBlLlN0eWxlKSkge1xuICAgICAgICAgIHJldHVybiB1bndyYXBTYWZlVmFsdWUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfc2FuaXRpemVTdHlsZSh2YWx1ZSBhcyBzdHJpbmcpO1xuICAgICAgY2FzZSBTZWN1cml0eUNvbnRleHQuU0NSSVBUOlxuICAgICAgICBpZiAoYWxsb3dTYW5pdGl6YXRpb25CeXBhc3NPclRocm93KHZhbHVlLCBCeXBhc3NUeXBlLlNjcmlwdCkpIHtcbiAgICAgICAgICByZXR1cm4gdW53cmFwU2FmZVZhbHVlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc2FmZSB2YWx1ZSB1c2VkIGluIGEgc2NyaXB0IGNvbnRleHQnKTtcbiAgICAgIGNhc2UgU2VjdXJpdHlDb250ZXh0LlVSTDpcbiAgICAgICAgY29uc3QgdHlwZSA9IGdldFNhbml0aXphdGlvbkJ5cGFzc1R5cGUodmFsdWUpO1xuICAgICAgICBpZiAoYWxsb3dTYW5pdGl6YXRpb25CeXBhc3NPclRocm93KHZhbHVlLCBCeXBhc3NUeXBlLlVybCkpIHtcbiAgICAgICAgICByZXR1cm4gdW53cmFwU2FmZVZhbHVlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Nhbml0aXplVXJsKFN0cmluZyh2YWx1ZSkpO1xuICAgICAgY2FzZSBTZWN1cml0eUNvbnRleHQuUkVTT1VSQ0VfVVJMOlxuICAgICAgICBpZiAoYWxsb3dTYW5pdGl6YXRpb25CeXBhc3NPclRocm93KHZhbHVlLCBCeXBhc3NUeXBlLlJlc291cmNlVXJsKSkge1xuICAgICAgICAgIHJldHVybiB1bndyYXBTYWZlVmFsdWUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICd1bnNhZmUgdmFsdWUgdXNlZCBpbiBhIHJlc291cmNlIFVSTCBjb250ZXh0IChzZWUgaHR0cDovL2cuY28vbmcvc2VjdXJpdHkjeHNzKScpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIFNlY3VyaXR5Q29udGV4dCAke2N0eH0gKHNlZSBodHRwOi8vZy5jby9uZy9zZWN1cml0eSN4c3MpYCk7XG4gICAgfVxuICB9XG5cbiAgYnlwYXNzU2VjdXJpdHlUcnVzdEh0bWwodmFsdWU6IHN0cmluZyk6IFNhZmVIdG1sIHsgcmV0dXJuIGJ5cGFzc1Nhbml0aXphdGlvblRydXN0SHRtbCh2YWx1ZSk7IH1cbiAgYnlwYXNzU2VjdXJpdHlUcnVzdFN0eWxlKHZhbHVlOiBzdHJpbmcpOiBTYWZlU3R5bGUgeyByZXR1cm4gYnlwYXNzU2FuaXRpemF0aW9uVHJ1c3RTdHlsZSh2YWx1ZSk7IH1cbiAgYnlwYXNzU2VjdXJpdHlUcnVzdFNjcmlwdCh2YWx1ZTogc3RyaW5nKTogU2FmZVNjcmlwdCB7XG4gICAgcmV0dXJuIGJ5cGFzc1Nhbml0aXphdGlvblRydXN0U2NyaXB0KHZhbHVlKTtcbiAgfVxuICBieXBhc3NTZWN1cml0eVRydXN0VXJsKHZhbHVlOiBzdHJpbmcpOiBTYWZlVXJsIHsgcmV0dXJuIGJ5cGFzc1Nhbml0aXphdGlvblRydXN0VXJsKHZhbHVlKTsgfVxuICBieXBhc3NTZWN1cml0eVRydXN0UmVzb3VyY2VVcmwodmFsdWU6IHN0cmluZyk6IFNhZmVSZXNvdXJjZVVybCB7XG4gICAgcmV0dXJuIGJ5cGFzc1Nhbml0aXphdGlvblRydXN0UmVzb3VyY2VVcmwodmFsdWUpO1xuICB9XG59XG4iXX0=