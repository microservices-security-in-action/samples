/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/dom_adapter.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** @type {?} */
let _DOM = (/** @type {?} */ (null));
/**
 * @return {?}
 */
export function getDOM() {
    return _DOM;
}
/**
 * @param {?} adapter
 * @return {?}
 */
export function setDOM(adapter) {
    _DOM = adapter;
}
/**
 * @param {?} adapter
 * @return {?}
 */
export function setRootDomAdapter(adapter) {
    if (!_DOM) {
        _DOM = adapter;
    }
}
/* tslint:disable:requireParameterType */
/**
 * Provides DOM operations in an environment-agnostic way.
 *
 * \@security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 * @abstract
 */
export class DomAdapter {
}
if (false) {
    /**
     * @abstract
     * @param {?} el
     * @param {?} name
     * @return {?}
     */
    DomAdapter.prototype.getProperty = function (el, name) { };
    /**
     * @abstract
     * @param {?} el
     * @param {?} evt
     * @return {?}
     */
    DomAdapter.prototype.dispatchEvent = function (el, evt) { };
    /**
     * @abstract
     * @param {?} error
     * @return {?}
     */
    DomAdapter.prototype.log = function (error) { };
    /**
     * @abstract
     * @param {?} error
     * @return {?}
     */
    DomAdapter.prototype.logGroup = function (error) { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.logGroupEnd = function () { };
    /**
     * @abstract
     * @param {?} el
     * @return {?}
     */
    DomAdapter.prototype.remove = function (el) { };
    /**
     * @abstract
     * @param {?} tagName
     * @param {?=} doc
     * @return {?}
     */
    DomAdapter.prototype.createElement = function (tagName, doc) { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.createHtmlDocument = function () { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.getDefaultDocument = function () { };
    /**
     * @abstract
     * @param {?} node
     * @return {?}
     */
    DomAdapter.prototype.isElementNode = function (node) { };
    /**
     * @abstract
     * @param {?} node
     * @return {?}
     */
    DomAdapter.prototype.isShadowRoot = function (node) { };
    /**
     * @abstract
     * @param {?} el
     * @param {?} evt
     * @param {?} listener
     * @return {?}
     */
    DomAdapter.prototype.onAndCancel = function (el, evt, listener) { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.supportsDOMEvents = function () { };
    /**
     * @abstract
     * @param {?} doc
     * @param {?} target
     * @return {?}
     */
    DomAdapter.prototype.getGlobalEventTarget = function (doc, target) { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.getHistory = function () { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.getLocation = function () { };
    /**
     * This is the ambient Location definition, NOT Location from \@angular/common.
     * @abstract
     * @param {?} doc
     * @return {?}
     */
    DomAdapter.prototype.getBaseHref = function (doc) { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.resetBaseElement = function () { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.getUserAgent = function () { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.performanceNow = function () { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.supportsCookies = function () { };
    /**
     * @abstract
     * @param {?} name
     * @return {?}
     */
    DomAdapter.prototype.getCookie = function (name) { };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RvbV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFRSSxJQUFJLEdBQWUsbUJBQUEsSUFBSSxFQUFFOzs7O0FBRTdCLE1BQU0sVUFBVSxNQUFNO0lBQ3BCLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsTUFBTSxDQUFDLE9BQW1CO0lBQ3hDLElBQUksR0FBRyxPQUFPLENBQUM7QUFDakIsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsT0FBbUI7SUFDbkQsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULElBQUksR0FBRyxPQUFPLENBQUM7S0FDaEI7QUFDSCxDQUFDOzs7Ozs7Ozs7QUFTRCxNQUFNLE9BQWdCLFVBQVU7Q0E2Qy9COzs7Ozs7OztJQTNDQywyREFBcUQ7Ozs7Ozs7SUFDckQsNERBQStDOzs7Ozs7SUFHL0MsZ0RBQThCOzs7Ozs7SUFDOUIscURBQW1DOzs7OztJQUNuQyxtREFBNEI7Ozs7OztJQUc1QixnREFBK0I7Ozs7Ozs7SUFDL0IsaUVBQTZEOzs7OztJQUM3RCwwREFBNEM7Ozs7O0lBQzVDLDBEQUF3Qzs7Ozs7O0lBR3hDLHlEQUEyQzs7Ozs7O0lBRzNDLHdEQUEwQzs7Ozs7Ozs7SUFHMUMsb0VBQWlFOzs7OztJQUNqRSx5REFBc0M7Ozs7Ozs7SUFHdEMsdUVBQWtFOzs7OztJQUdsRSxrREFBK0I7Ozs7O0lBQy9CLG1EQUNROzs7Ozs7O0lBQ1Isc0RBQWlEOzs7OztJQUNqRCx3REFBa0M7Ozs7O0lBR2xDLG9EQUFnQzs7Ozs7SUFHaEMsc0RBQWtDOzs7OztJQUdsQyx1REFBb0M7Ozs7OztJQUNwQyxxREFBOEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmxldCBfRE9NOiBEb21BZGFwdGVyID0gbnVsbCAhO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RE9NKCk6IERvbUFkYXB0ZXIge1xuICByZXR1cm4gX0RPTTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldERPTShhZGFwdGVyOiBEb21BZGFwdGVyKSB7XG4gIF9ET00gPSBhZGFwdGVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Um9vdERvbUFkYXB0ZXIoYWRhcHRlcjogRG9tQWRhcHRlcikge1xuICBpZiAoIV9ET00pIHtcbiAgICBfRE9NID0gYWRhcHRlcjtcbiAgfVxufVxuXG4vKiB0c2xpbnQ6ZGlzYWJsZTpyZXF1aXJlUGFyYW1ldGVyVHlwZSAqL1xuLyoqXG4gKiBQcm92aWRlcyBET00gb3BlcmF0aW9ucyBpbiBhbiBlbnZpcm9ubWVudC1hZ25vc3RpYyB3YXkuXG4gKlxuICogQHNlY3VyaXR5IFRyZWFkIGNhcmVmdWxseSEgSW50ZXJhY3Rpbmcgd2l0aCB0aGUgRE9NIGRpcmVjdGx5IGlzIGRhbmdlcm91cyBhbmRcbiAqIGNhbiBpbnRyb2R1Y2UgWFNTIHJpc2tzLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRG9tQWRhcHRlciB7XG4gIC8vIE5lZWRzIERvbWluby1mcmllbmRseSB0ZXN0IHV0aWxpdHlcbiAgYWJzdHJhY3QgZ2V0UHJvcGVydHkoZWw6IEVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IGFueTtcbiAgYWJzdHJhY3QgZGlzcGF0Y2hFdmVudChlbDogYW55LCBldnQ6IGFueSk6IGFueTtcblxuICAvLyBVc2VkIGJ5IHJvdXRlclxuICBhYnN0cmFjdCBsb2coZXJyb3I6IGFueSk6IGFueTtcbiAgYWJzdHJhY3QgbG9nR3JvdXAoZXJyb3I6IGFueSk6IGFueTtcbiAgYWJzdHJhY3QgbG9nR3JvdXBFbmQoKTogYW55O1xuXG4gIC8vIFVzZWQgYnkgTWV0YVxuICBhYnN0cmFjdCByZW1vdmUoZWw6IGFueSk6IE5vZGU7XG4gIGFic3RyYWN0IGNyZWF0ZUVsZW1lbnQodGFnTmFtZTogYW55LCBkb2M/OiBhbnkpOiBIVE1MRWxlbWVudDtcbiAgYWJzdHJhY3QgY3JlYXRlSHRtbERvY3VtZW50KCk6IEhUTUxEb2N1bWVudDtcbiAgYWJzdHJhY3QgZ2V0RGVmYXVsdERvY3VtZW50KCk6IERvY3VtZW50O1xuXG4gIC8vIFVzZWQgYnkgQnkuY3NzXG4gIGFic3RyYWN0IGlzRWxlbWVudE5vZGUobm9kZTogYW55KTogYm9vbGVhbjtcblxuICAvLyBVc2VkIGJ5IFRlc3RhYmlsaXR5XG4gIGFic3RyYWN0IGlzU2hhZG93Um9vdChub2RlOiBhbnkpOiBib29sZWFuO1xuXG4gIC8vIFVzZWQgYnkgS2V5RXZlbnRzUGx1Z2luXG4gIGFic3RyYWN0IG9uQW5kQ2FuY2VsKGVsOiBhbnksIGV2dDogYW55LCBsaXN0ZW5lcjogYW55KTogRnVuY3Rpb247XG4gIGFic3RyYWN0IHN1cHBvcnRzRE9NRXZlbnRzKCk6IGJvb2xlYW47XG5cbiAgLy8gVXNlZCBieSBQbGF0Zm9ybUxvY2F0aW9uIGFuZCBTZXJ2ZXJFdmVudE1hbmFnZXJQbHVnaW5cbiAgYWJzdHJhY3QgZ2V0R2xvYmFsRXZlbnRUYXJnZXQoZG9jOiBEb2N1bWVudCwgdGFyZ2V0OiBzdHJpbmcpOiBhbnk7XG5cbiAgLy8gVXNlZCBieSBQbGF0Zm9ybUxvY2F0aW9uXG4gIGFic3RyYWN0IGdldEhpc3RvcnkoKTogSGlzdG9yeTtcbiAgYWJzdHJhY3QgZ2V0TG9jYXRpb24oKTpcbiAgICAgIGFueTsgLyoqIFRoaXMgaXMgdGhlIGFtYmllbnQgTG9jYXRpb24gZGVmaW5pdGlvbiwgTk9UIExvY2F0aW9uIGZyb20gQGFuZ3VsYXIvY29tbW9uLiAgKi9cbiAgYWJzdHJhY3QgZ2V0QmFzZUhyZWYoZG9jOiBEb2N1bWVudCk6IHN0cmluZ3xudWxsO1xuICBhYnN0cmFjdCByZXNldEJhc2VFbGVtZW50KCk6IHZvaWQ7XG5cbiAgLy8gVE9ETzogcmVtb3ZlIGRlcGVuZGVuY3kgaW4gRGVmYXVsdFZhbHVlQWNjZXNzb3JcbiAgYWJzdHJhY3QgZ2V0VXNlckFnZW50KCk6IHN0cmluZztcblxuICAvLyBVc2VkIGJ5IEFuZ3VsYXJQcm9maWxlclxuICBhYnN0cmFjdCBwZXJmb3JtYW5jZU5vdygpOiBudW1iZXI7XG5cbiAgLy8gVXNlZCBieSBDb29raWVYU1JGU3RyYXRlZ3lcbiAgYWJzdHJhY3Qgc3VwcG9ydHNDb29raWVzKCk6IGJvb2xlYW47XG4gIGFic3RyYWN0IGdldENvb2tpZShuYW1lOiBzdHJpbmcpOiBzdHJpbmd8bnVsbDtcbn1cbiJdfQ==