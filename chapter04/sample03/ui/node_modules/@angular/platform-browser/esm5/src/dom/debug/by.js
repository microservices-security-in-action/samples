/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵgetDOM as getDOM } from '@angular/common';
/**
 * Predicates for use with {@link DebugElement}'s query functions.
 *
 * @publicApi
 */
var By = /** @class */ (function () {
    function By() {
    }
    /**
     * Match all nodes.
     *
     * @usageNotes
     * ### Example
     *
     * {@example platform-browser/dom/debug/ts/by/by.ts region='by_all'}
     */
    By.all = function () { return function () { return true; }; };
    /**
     * Match elements by the given CSS selector.
     *
     * @usageNotes
     * ### Example
     *
     * {@example platform-browser/dom/debug/ts/by/by.ts region='by_css'}
     */
    By.css = function (selector) {
        return function (debugElement) {
            return debugElement.nativeElement != null ?
                elementMatches(debugElement.nativeElement, selector) :
                false;
        };
    };
    /**
     * Match nodes that have the given directive present.
     *
     * @usageNotes
     * ### Example
     *
     * {@example platform-browser/dom/debug/ts/by/by.ts region='by_directive'}
     */
    By.directive = function (type) {
        return function (debugNode) { return debugNode.providerTokens.indexOf(type) !== -1; };
    };
    return By;
}());
export { By };
function elementMatches(n, selector) {
    if (getDOM().isElementNode(n)) {
        return n.matches && n.matches(selector) ||
            n.msMatchesSelector && n.msMatchesSelector(selector) ||
            n.webkitMatchesSelector && n.webkitMatchesSelector(selector);
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL3NyYy9kb20vZGVidWcvYnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE9BQU8sSUFBSSxNQUFNLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUtsRDs7OztHQUlHO0FBQ0g7SUFBQTtJQXNDQSxDQUFDO0lBckNDOzs7Ozs7O09BT0c7SUFDSSxNQUFHLEdBQVYsY0FBcUMsT0FBTyxjQUFNLE9BQUEsSUFBSSxFQUFKLENBQUksQ0FBQyxDQUFDLENBQUM7SUFFekQ7Ozs7Ozs7T0FPRztJQUNJLE1BQUcsR0FBVixVQUFXLFFBQWdCO1FBQ3pCLE9BQU8sVUFBQyxZQUFZO1lBQ2xCLE9BQU8sWUFBWSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsQ0FBQztnQkFDdkMsY0FBYyxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDdEQsS0FBSyxDQUFDO1FBQ1osQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSSxZQUFTLEdBQWhCLFVBQWlCLElBQWU7UUFDOUIsT0FBTyxVQUFDLFNBQVMsSUFBSyxPQUFBLFNBQVMsQ0FBQyxjQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBL0MsQ0FBK0MsQ0FBQztJQUN4RSxDQUFDO0lBQ0gsU0FBQztBQUFELENBQUMsQUF0Q0QsSUFzQ0M7O0FBRUQsU0FBUyxjQUFjLENBQUMsQ0FBTSxFQUFFLFFBQWdCO0lBQzlDLElBQUksTUFBTSxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQzdCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztZQUNuQyxDQUFDLENBQUMsaUJBQWlCLElBQUksQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztZQUNwRCxDQUFDLENBQUMscUJBQXFCLElBQUksQ0FBQyxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ2xFO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge8m1Z2V0RE9NIGFzIGdldERPTX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7RGVidWdFbGVtZW50LCBEZWJ1Z05vZGUsIFByZWRpY2F0ZSwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cblxuXG4vKipcbiAqIFByZWRpY2F0ZXMgZm9yIHVzZSB3aXRoIHtAbGluayBEZWJ1Z0VsZW1lbnR9J3MgcXVlcnkgZnVuY3Rpb25zLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEJ5IHtcbiAgLyoqXG4gICAqIE1hdGNoIGFsbCBub2Rlcy5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIHBsYXRmb3JtLWJyb3dzZXIvZG9tL2RlYnVnL3RzL2J5L2J5LnRzIHJlZ2lvbj0nYnlfYWxsJ31cbiAgICovXG4gIHN0YXRpYyBhbGwoKTogUHJlZGljYXRlPERlYnVnTm9kZT4geyByZXR1cm4gKCkgPT4gdHJ1ZTsgfVxuXG4gIC8qKlxuICAgKiBNYXRjaCBlbGVtZW50cyBieSB0aGUgZ2l2ZW4gQ1NTIHNlbGVjdG9yLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgcGxhdGZvcm0tYnJvd3Nlci9kb20vZGVidWcvdHMvYnkvYnkudHMgcmVnaW9uPSdieV9jc3MnfVxuICAgKi9cbiAgc3RhdGljIGNzcyhzZWxlY3Rvcjogc3RyaW5nKTogUHJlZGljYXRlPERlYnVnRWxlbWVudD4ge1xuICAgIHJldHVybiAoZGVidWdFbGVtZW50KSA9PiB7XG4gICAgICByZXR1cm4gZGVidWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQgIT0gbnVsbCA/XG4gICAgICAgICAgZWxlbWVudE1hdGNoZXMoZGVidWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQsIHNlbGVjdG9yKSA6XG4gICAgICAgICAgZmFsc2U7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXRjaCBub2RlcyB0aGF0IGhhdmUgdGhlIGdpdmVuIGRpcmVjdGl2ZSBwcmVzZW50LlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgcGxhdGZvcm0tYnJvd3Nlci9kb20vZGVidWcvdHMvYnkvYnkudHMgcmVnaW9uPSdieV9kaXJlY3RpdmUnfVxuICAgKi9cbiAgc3RhdGljIGRpcmVjdGl2ZSh0eXBlOiBUeXBlPGFueT4pOiBQcmVkaWNhdGU8RGVidWdOb2RlPiB7XG4gICAgcmV0dXJuIChkZWJ1Z05vZGUpID0+IGRlYnVnTm9kZS5wcm92aWRlclRva2VucyAhLmluZGV4T2YodHlwZSkgIT09IC0xO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRNYXRjaGVzKG46IGFueSwgc2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoZ2V0RE9NKCkuaXNFbGVtZW50Tm9kZShuKSkge1xuICAgIHJldHVybiBuLm1hdGNoZXMgJiYgbi5tYXRjaGVzKHNlbGVjdG9yKSB8fFxuICAgICAgICBuLm1zTWF0Y2hlc1NlbGVjdG9yICYmIG4ubXNNYXRjaGVzU2VsZWN0b3Ioc2VsZWN0b3IpIHx8XG4gICAgICAgIG4ud2Via2l0TWF0Y2hlc1NlbGVjdG9yICYmIG4ud2Via2l0TWF0Y2hlc1NlbGVjdG9yKHNlbGVjdG9yKTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cbiJdfQ==