/**
 * @fileoverview added by tsickle
 * Generated from: packages/router/src/url_handling_strategy.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * \@description
 *
 * Provides a way to migrate AngularJS applications to Angular.
 *
 * \@publicApi
 * @abstract
 */
export class UrlHandlingStrategy {
}
if (false) {
    /**
     * Tells the router if this URL should be processed.
     *
     * When it returns true, the router will execute the regular navigation.
     * When it returns false, the router will set the router state to an empty state.
     * As a result, all the active components will be destroyed.
     *
     * @abstract
     * @param {?} url
     * @return {?}
     */
    UrlHandlingStrategy.prototype.shouldProcessUrl = function (url) { };
    /**
     * Extracts the part of the URL that should be handled by the router.
     * The rest of the URL will remain untouched.
     * @abstract
     * @param {?} url
     * @return {?}
     */
    UrlHandlingStrategy.prototype.extract = function (url) { };
    /**
     * Merges the URL fragment with the rest of the URL.
     * @abstract
     * @param {?} newUrlPart
     * @param {?} rawUrl
     * @return {?}
     */
    UrlHandlingStrategy.prototype.merge = function (newUrlPart, rawUrl) { };
}
/**
 * \@publicApi
 */
export class DefaultUrlHandlingStrategy {
    /**
     * @param {?} url
     * @return {?}
     */
    shouldProcessUrl(url) { return true; }
    /**
     * @param {?} url
     * @return {?}
     */
    extract(url) { return url; }
    /**
     * @param {?} newUrlPart
     * @param {?} wholeUrl
     * @return {?}
     */
    merge(newUrlPart, wholeUrl) { return newUrlPart; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsX2hhbmRsaW5nX3N0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy91cmxfaGFuZGxpbmdfc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQkEsTUFBTSxPQUFnQixtQkFBbUI7Q0FxQnhDOzs7Ozs7Ozs7Ozs7O0lBWkMsb0VBQWlEOzs7Ozs7OztJQU1qRCwyREFBd0M7Ozs7Ozs7O0lBS3hDLHdFQUE4RDs7Ozs7QUFNaEUsTUFBTSxPQUFPLDBCQUEwQjs7Ozs7SUFDckMsZ0JBQWdCLENBQUMsR0FBWSxJQUFhLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFDeEQsT0FBTyxDQUFDLEdBQVksSUFBYSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7Ozs7OztJQUM5QyxLQUFLLENBQUMsVUFBbUIsRUFBRSxRQUFpQixJQUFhLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQztDQUM5RSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtVcmxUcmVlfSBmcm9tICcuL3VybF90cmVlJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBQcm92aWRlcyBhIHdheSB0byBtaWdyYXRlIEFuZ3VsYXJKUyBhcHBsaWNhdGlvbnMgdG8gQW5ndWxhci5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBVcmxIYW5kbGluZ1N0cmF0ZWd5IHtcbiAgLyoqXG4gICAqIFRlbGxzIHRoZSByb3V0ZXIgaWYgdGhpcyBVUkwgc2hvdWxkIGJlIHByb2Nlc3NlZC5cbiAgICpcbiAgICogV2hlbiBpdCByZXR1cm5zIHRydWUsIHRoZSByb3V0ZXIgd2lsbCBleGVjdXRlIHRoZSByZWd1bGFyIG5hdmlnYXRpb24uXG4gICAqIFdoZW4gaXQgcmV0dXJucyBmYWxzZSwgdGhlIHJvdXRlciB3aWxsIHNldCB0aGUgcm91dGVyIHN0YXRlIHRvIGFuIGVtcHR5IHN0YXRlLlxuICAgKiBBcyBhIHJlc3VsdCwgYWxsIHRoZSBhY3RpdmUgY29tcG9uZW50cyB3aWxsIGJlIGRlc3Ryb3llZC5cbiAgICpcbiAgICovXG4gIGFic3RyYWN0IHNob3VsZFByb2Nlc3NVcmwodXJsOiBVcmxUcmVlKTogYm9vbGVhbjtcblxuICAvKipcbiAgICogRXh0cmFjdHMgdGhlIHBhcnQgb2YgdGhlIFVSTCB0aGF0IHNob3VsZCBiZSBoYW5kbGVkIGJ5IHRoZSByb3V0ZXIuXG4gICAqIFRoZSByZXN0IG9mIHRoZSBVUkwgd2lsbCByZW1haW4gdW50b3VjaGVkLlxuICAgKi9cbiAgYWJzdHJhY3QgZXh0cmFjdCh1cmw6IFVybFRyZWUpOiBVcmxUcmVlO1xuXG4gIC8qKlxuICAgKiBNZXJnZXMgdGhlIFVSTCBmcmFnbWVudCB3aXRoIHRoZSByZXN0IG9mIHRoZSBVUkwuXG4gICAqL1xuICBhYnN0cmFjdCBtZXJnZShuZXdVcmxQYXJ0OiBVcmxUcmVlLCByYXdVcmw6IFVybFRyZWUpOiBVcmxUcmVlO1xufVxuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRVcmxIYW5kbGluZ1N0cmF0ZWd5IGltcGxlbWVudHMgVXJsSGFuZGxpbmdTdHJhdGVneSB7XG4gIHNob3VsZFByb2Nlc3NVcmwodXJsOiBVcmxUcmVlKTogYm9vbGVhbiB7IHJldHVybiB0cnVlOyB9XG4gIGV4dHJhY3QodXJsOiBVcmxUcmVlKTogVXJsVHJlZSB7IHJldHVybiB1cmw7IH1cbiAgbWVyZ2UobmV3VXJsUGFydDogVXJsVHJlZSwgd2hvbGVVcmw6IFVybFRyZWUpOiBVcmxUcmVlIHsgcmV0dXJuIG5ld1VybFBhcnQ7IH1cbn0iXX0=