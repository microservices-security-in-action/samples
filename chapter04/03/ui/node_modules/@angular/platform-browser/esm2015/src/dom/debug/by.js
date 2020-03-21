/**
 * @fileoverview added by tsickle
 * Generated from: packages/platform-browser/src/dom/debug/by.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵgetDOM as getDOM } from '@angular/common';
/**
 * Predicates for use with {\@link DebugElement}'s query functions.
 *
 * \@publicApi
 */
export class By {
    /**
     * Match all nodes.
     *
     * \@usageNotes
     * ### Example
     *
     * {\@example platform-browser/dom/debug/ts/by/by.ts region='by_all'}
     * @return {?}
     */
    static all() { return (/**
     * @return {?}
     */
    () => true); }
    /**
     * Match elements by the given CSS selector.
     *
     * \@usageNotes
     * ### Example
     *
     * {\@example platform-browser/dom/debug/ts/by/by.ts region='by_css'}
     * @param {?} selector
     * @return {?}
     */
    static css(selector) {
        return (/**
         * @param {?} debugElement
         * @return {?}
         */
        (debugElement) => {
            return debugElement.nativeElement != null ?
                elementMatches(debugElement.nativeElement, selector) :
                false;
        });
    }
    /**
     * Match nodes that have the given directive present.
     *
     * \@usageNotes
     * ### Example
     *
     * {\@example platform-browser/dom/debug/ts/by/by.ts region='by_directive'}
     * @param {?} type
     * @return {?}
     */
    static directive(type) {
        return (/**
         * @param {?} debugNode
         * @return {?}
         */
        (debugNode) => (/** @type {?} */ (debugNode.providerTokens)).indexOf(type) !== -1);
    }
}
/**
 * @param {?} n
 * @param {?} selector
 * @return {?}
 */
function elementMatches(n, selector) {
    if (getDOM().isElementNode(n)) {
        return n.matches && n.matches(selector) ||
            n.msMatchesSelector && n.msMatchesSelector(selector) ||
            n.webkitMatchesSelector && n.webkitMatchesSelector(selector);
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL3NyYy9kb20vZGVidWcvYnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLE9BQU8sSUFBSSxNQUFNLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7Ozs7O0FBVWxELE1BQU0sT0FBTyxFQUFFOzs7Ozs7Ozs7O0lBU2IsTUFBTSxDQUFDLEdBQUcsS0FBMkI7OztJQUFPLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7Ozs7Ozs7Ozs7O0lBVXpELE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBZ0I7UUFDekI7Ozs7UUFBTyxDQUFDLFlBQVksRUFBRSxFQUFFO1lBQ3RCLE9BQU8sWUFBWSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsQ0FBQztnQkFDdkMsY0FBYyxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDdEQsS0FBSyxDQUFDO1FBQ1osQ0FBQyxFQUFDO0lBQ0osQ0FBQzs7Ozs7Ozs7Ozs7SUFVRCxNQUFNLENBQUMsU0FBUyxDQUFDLElBQWU7UUFDOUI7Ozs7UUFBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsbUJBQUEsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQztJQUN4RSxDQUFDO0NBQ0Y7Ozs7OztBQUVELFNBQVMsY0FBYyxDQUFDLENBQU0sRUFBRSxRQUFnQjtJQUM5QyxJQUFJLE1BQU0sRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUM3QixPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7WUFDbkMsQ0FBQyxDQUFDLGlCQUFpQixJQUFJLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7WUFDcEQsQ0FBQyxDQUFDLHFCQUFxQixJQUFJLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNsRTtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHvJtWdldERPTSBhcyBnZXRET019IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0RlYnVnRWxlbWVudCwgRGVidWdOb2RlLCBQcmVkaWNhdGUsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5cblxuLyoqXG4gKiBQcmVkaWNhdGVzIGZvciB1c2Ugd2l0aCB7QGxpbmsgRGVidWdFbGVtZW50fSdzIHF1ZXJ5IGZ1bmN0aW9ucy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBCeSB7XG4gIC8qKlxuICAgKiBNYXRjaCBhbGwgbm9kZXMuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIHtAZXhhbXBsZSBwbGF0Zm9ybS1icm93c2VyL2RvbS9kZWJ1Zy90cy9ieS9ieS50cyByZWdpb249J2J5X2FsbCd9XG4gICAqL1xuICBzdGF0aWMgYWxsKCk6IFByZWRpY2F0ZTxEZWJ1Z05vZGU+IHsgcmV0dXJuICgpID0+IHRydWU7IH1cblxuICAvKipcbiAgICogTWF0Y2ggZWxlbWVudHMgYnkgdGhlIGdpdmVuIENTUyBzZWxlY3Rvci5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIHBsYXRmb3JtLWJyb3dzZXIvZG9tL2RlYnVnL3RzL2J5L2J5LnRzIHJlZ2lvbj0nYnlfY3NzJ31cbiAgICovXG4gIHN0YXRpYyBjc3Moc2VsZWN0b3I6IHN0cmluZyk6IFByZWRpY2F0ZTxEZWJ1Z0VsZW1lbnQ+IHtcbiAgICByZXR1cm4gKGRlYnVnRWxlbWVudCkgPT4ge1xuICAgICAgcmV0dXJuIGRlYnVnRWxlbWVudC5uYXRpdmVFbGVtZW50ICE9IG51bGwgP1xuICAgICAgICAgIGVsZW1lbnRNYXRjaGVzKGRlYnVnRWxlbWVudC5uYXRpdmVFbGVtZW50LCBzZWxlY3RvcikgOlxuICAgICAgICAgIGZhbHNlO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogTWF0Y2ggbm9kZXMgdGhhdCBoYXZlIHRoZSBnaXZlbiBkaXJlY3RpdmUgcHJlc2VudC5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIHBsYXRmb3JtLWJyb3dzZXIvZG9tL2RlYnVnL3RzL2J5L2J5LnRzIHJlZ2lvbj0nYnlfZGlyZWN0aXZlJ31cbiAgICovXG4gIHN0YXRpYyBkaXJlY3RpdmUodHlwZTogVHlwZTxhbnk+KTogUHJlZGljYXRlPERlYnVnTm9kZT4ge1xuICAgIHJldHVybiAoZGVidWdOb2RlKSA9PiBkZWJ1Z05vZGUucHJvdmlkZXJUb2tlbnMgIS5pbmRleE9mKHR5cGUpICE9PSAtMTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbGVtZW50TWF0Y2hlcyhuOiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKGdldERPTSgpLmlzRWxlbWVudE5vZGUobikpIHtcbiAgICByZXR1cm4gbi5tYXRjaGVzICYmIG4ubWF0Y2hlcyhzZWxlY3RvcikgfHxcbiAgICAgICAgbi5tc01hdGNoZXNTZWxlY3RvciAmJiBuLm1zTWF0Y2hlc1NlbGVjdG9yKHNlbGVjdG9yKSB8fFxuICAgICAgICBuLndlYmtpdE1hdGNoZXNTZWxlY3RvciAmJiBuLndlYmtpdE1hdGNoZXNTZWxlY3RvcihzZWxlY3Rvcik7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG4iXX0=