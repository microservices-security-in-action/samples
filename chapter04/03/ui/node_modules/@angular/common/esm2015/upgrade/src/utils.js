/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/upgrade/src/utils.ts
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
 * @param {?} val
 * @param {?} prefix
 * @return {?}
 */
export function stripPrefix(val, prefix) {
    return val.startsWith(prefix) ? val.substring(prefix.length) : val;
}
/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
export function deepEqual(a, b) {
    if (a === b) {
        return true;
    }
    else if (!a || !b) {
        return false;
    }
    else {
        try {
            if ((a.prototype !== b.prototype) || (Array.isArray(a) && Array.isArray(b))) {
                return false;
            }
            return JSON.stringify(a) === JSON.stringify(b);
        }
        catch (e) {
            return false;
        }
    }
}
/**
 * @param {?} el
 * @return {?}
 */
export function isAnchor(el) {
    return ((/** @type {?} */ (el))).href !== undefined;
}
/**
 * @param {?} obj
 * @return {?}
 */
export function isPromise(obj) {
    // allow any Promise/A+ compliant thenable.
    // It's up to the caller to ensure that obj.then conforms to the spec
    return !!obj && typeof obj.then === 'function';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vdXBncmFkZS9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFRQSxNQUFNLFVBQVUsV0FBVyxDQUFDLEdBQVcsRUFBRSxNQUFjO0lBQ3JELE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNyRSxDQUFDOzs7Ozs7QUFFRCxNQUFNLFVBQVUsU0FBUyxDQUFDLENBQU0sRUFBRSxDQUFNO0lBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNYLE9BQU8sSUFBSSxDQUFDO0tBQ2I7U0FBTSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO1FBQ25CLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7U0FBTTtRQUNMLElBQUk7WUFDRixJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDM0UsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLEtBQUssQ0FBQztTQUNkO0tBQ0Y7QUFDSCxDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxRQUFRLENBQUMsRUFBd0M7SUFDL0QsT0FBTyxDQUFDLG1CQUFtQixFQUFFLEVBQUEsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7QUFDcEQsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsU0FBUyxDQUFDLEdBQVE7SUFDaEMsMkNBQTJDO0lBQzNDLHFFQUFxRTtJQUNyRSxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQztBQUNqRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBQcmVmaXgodmFsOiBzdHJpbmcsIHByZWZpeDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHZhbC5zdGFydHNXaXRoKHByZWZpeCkgPyB2YWwuc3Vic3RyaW5nKHByZWZpeC5sZW5ndGgpIDogdmFsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVlcEVxdWFsKGE6IGFueSwgYjogYW55KTogYm9vbGVhbiB7XG4gIGlmIChhID09PSBiKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoIWEgfHwgIWIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICgoYS5wcm90b3R5cGUgIT09IGIucHJvdG90eXBlKSB8fCAoQXJyYXkuaXNBcnJheShhKSAmJiBBcnJheS5pc0FycmF5KGIpKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYSkgPT09IEpTT04uc3RyaW5naWZ5KGIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQW5jaG9yKGVsOiAoTm9kZSAmIFBhcmVudE5vZGUpIHwgRWxlbWVudCB8IG51bGwpOiBlbCBpcyBIVE1MQW5jaG9yRWxlbWVudCB7XG4gIHJldHVybiAoPEhUTUxBbmNob3JFbGVtZW50PmVsKS5ocmVmICE9PSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2Uob2JqOiBhbnkpOiBvYmogaXMgUHJvbWlzZTxhbnk+IHtcbiAgLy8gYWxsb3cgYW55IFByb21pc2UvQSsgY29tcGxpYW50IHRoZW5hYmxlLlxuICAvLyBJdCdzIHVwIHRvIHRoZSBjYWxsZXIgdG8gZW5zdXJlIHRoYXQgb2JqLnRoZW4gY29uZm9ybXMgdG8gdGhlIHNwZWNcbiAgcmV0dXJuICEhb2JqICYmIHR5cGVvZiBvYmoudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cbiJdfQ==