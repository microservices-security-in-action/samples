/**
 * @fileoverview added by tsickle
 * Generated from: packages/router/src/utils/collection.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵisObservable as isObservable, ɵisPromise as isPromise } from '@angular/core';
import { from, of } from 'rxjs';
import { concatAll, last as lastValue, map } from 'rxjs/operators';
import { PRIMARY_OUTLET } from '../shared';
/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
export function shallowEqualArrays(a, b) {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; ++i) {
        if (!shallowEqual(a[i], b[i]))
            return false;
    }
    return true;
}
/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
export function shallowEqual(a, b) {
    // Casting Object.keys return values to include `undefined` as there are some cases
    // in IE 11 where this can happen. Cannot provide a test because the behavior only
    // exists in certain circumstances in IE 11, therefore doing this cast ensures the
    // logic is correct for when this edge case is hit.
    /** @type {?} */
    const k1 = (/** @type {?} */ (Object.keys(a)));
    /** @type {?} */
    const k2 = (/** @type {?} */ (Object.keys(b)));
    if (!k1 || !k2 || k1.length != k2.length) {
        return false;
    }
    /** @type {?} */
    let key;
    for (let i = 0; i < k1.length; i++) {
        key = k1[i];
        if (!equalArraysOrString(a[key], b[key])) {
            return false;
        }
    }
    return true;
}
/**
 * Test equality for arrays of strings or a string.
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
export function equalArraysOrString(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length != b.length)
            return false;
        return a.every((/**
         * @param {?} aItem
         * @return {?}
         */
        aItem => b.indexOf(aItem) > -1));
    }
    else {
        return a === b;
    }
}
/**
 * Flattens single-level nested arrays.
 * @template T
 * @param {?} arr
 * @return {?}
 */
export function flatten(arr) {
    return Array.prototype.concat.apply([], arr);
}
/**
 * Return the last element of an array.
 * @template T
 * @param {?} a
 * @return {?}
 */
export function last(a) {
    return a.length > 0 ? a[a.length - 1] : null;
}
/**
 * Verifys all booleans in an array are `true`.
 * @param {?} bools
 * @return {?}
 */
export function and(bools) {
    return !bools.some((/**
     * @param {?} v
     * @return {?}
     */
    v => !v));
}
/**
 * @template K, V
 * @param {?} map
 * @param {?} callback
 * @return {?}
 */
export function forEach(map, callback) {
    for (const prop in map) {
        if (map.hasOwnProperty(prop)) {
            callback(map[prop], prop);
        }
    }
}
/**
 * @template A, B
 * @param {?} obj
 * @param {?} fn
 * @return {?}
 */
export function waitForMap(obj, fn) {
    if (Object.keys(obj).length === 0) {
        return of({});
    }
    /** @type {?} */
    const waitHead = [];
    /** @type {?} */
    const waitTail = [];
    /** @type {?} */
    const res = {};
    forEach(obj, (/**
     * @param {?} a
     * @param {?} k
     * @return {?}
     */
    (a, k) => {
        /** @type {?} */
        const mapped = fn(k, a).pipe(map((/**
         * @param {?} r
         * @return {?}
         */
        (r) => res[k] = r)));
        if (k === PRIMARY_OUTLET) {
            waitHead.push(mapped);
        }
        else {
            waitTail.push(mapped);
        }
    }));
    // Closure compiler has problem with using spread operator here. So we use "Array.concat".
    // Note that we also need to cast the new promise because TypeScript cannot infer the type
    // when calling the "of" function through "Function.apply"
    return ((/** @type {?} */ (of.apply(null, waitHead.concat(waitTail)))))
        .pipe(concatAll(), lastValue(), map((/**
     * @return {?}
     */
    () => res)));
}
/**
 * @template T
 * @param {?} value
 * @return {?}
 */
export function wrapIntoObservable(value) {
    if (isObservable(value)) {
        return value;
    }
    if (isPromise(value)) {
        // Use `Promise.resolve()` to wrap promise-like instances.
        // Required ie when a Resolver returns a AngularJS `$q` promise to correctly trigger the
        // change detection.
        return from(Promise.resolve(value));
    }
    return of(value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci9zcmMvdXRpbHMvY29sbGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQWtCLGFBQWEsSUFBSSxZQUFZLEVBQUUsVUFBVSxJQUFJLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN0RyxPQUFPLEVBQWEsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMzQyxPQUFPLEVBQUMsU0FBUyxFQUFFLElBQUksSUFBSSxTQUFTLEVBQUUsR0FBRyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFakUsT0FBTyxFQUFDLGNBQWMsRUFBUyxNQUFNLFdBQVcsQ0FBQzs7Ozs7O0FBRWpELE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxDQUFRLEVBQUUsQ0FBUTtJQUNuRCxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLE1BQU07UUFBRSxPQUFPLEtBQUssQ0FBQztJQUN4QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtRQUNqQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztLQUM3QztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQzs7Ozs7O0FBRUQsTUFBTSxVQUFVLFlBQVksQ0FBQyxDQUFTLEVBQUUsQ0FBUzs7Ozs7O1VBS3pDLEVBQUUsR0FBRyxtQkFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUF3Qjs7VUFDM0MsRUFBRSxHQUFHLG1CQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQXdCO0lBQ2pELElB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SyxjQUFjLEVBQUU7WUFDeEIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN2QjthQUFNO1lBQ0wsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN2QjtJQUNILENBQUMsRUFBQyxDQUFDO0lBRUgsMEZBQTBGO0lBQzFGLDBGQUEwRjtJQUMxRiwwREFBMEQ7SUFDMUQsT0FBTyxDQUFDLG1CQUFBLEVBQUUsQ0FBRSxLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBNkIsQ0FBQztTQUMzRSxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRzs7O0lBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFDLENBQUMsQ0FBQztBQUN0RCxDQUFDOzs7Ozs7QUFFRCxNQUFNLFVBQVUsa0JBQWtCLENBQUksS0FBb0M7SUFDeEUsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDdkIsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3BCLDBEQUEwRDtRQUMxRCx3RkFBd0Y7UUFDeEYsb0JBQW9CO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUNyQztJQUVELE9BQU8sRUFBRSxDQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3BCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGVGYWN0b3J5LCDJtWlzT2JzZXJ2YWJsZSBhcyBpc09ic2VydmFibGUsIMm1aXNQcm9taXNlIGFzIGlzUHJvbWlzZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIGZyb20sIG9mIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2NvbmNhdEFsbCwgbGFzdCBhcyBsYXN0VmFsdWUsIG1hcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge1BSSU1BUllfT1VUTEVULCBQYXJhbXN9IGZyb20gJy4uL3NoYXJlZCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzaGFsbG93RXF1YWxBcnJheXMoYTogYW55W10sIGI6IGFueVtdKTogYm9vbGVhbiB7XG4gIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCFzaGFsbG93RXF1YWwoYVtpXSwgYltpXSkpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNoYWxsb3dFcXVhbChhOiBQYXJhbXMsIGI6IFBhcmFtcyk6IGJvb2xlYW4ge1xuICAvLyBDYXN0aW5nIE9iamVjdC5rZXlzIHJldHVybiB2YWx1ZXMgdG8gaW5jbHVkZSBgdW5kZWZpbmVkYCBhcyB0aGVyZSBhcmUgc29tZSBjYXNlc1xuICAvLyBpbiBJRSAxMSB3aGVyZSB0aGlzIGNhbiBoYXBwZW4uIENhbm5vdCBwcm92aWRlIGEgdGVzdCBiZWNhdXNlIHRoZSBiZWhhdmlvciBvbmx5XG4gIC8vIGV4aXN0cyBpbiBjZXJ0YWluIGNpcmN1bXN0YW5jZXMgaW4gSUUgMTEsIHRoZXJlZm9yZSBkb2luZyB0aGlzIGNhc3QgZW5zdXJlcyB0aGVcbiAgLy8gbG9naWMgaXMgY29ycmVjdCBmb3Igd2hlbiB0aGlzIGVkZ2UgY2FzZSBpcyBoaXQuXG4gIGNvbnN0IGsxID0gT2JqZWN0LmtleXMoYSkgYXMgc3RyaW5nW10gfCB1bmRlZmluZWQ7XG4gIGNvbnN0IGsyID0gT2JqZWN0LmtleXMoYikgYXMgc3RyaW5nW10gfCB1bmRlZmluZWQ7XG4gIGlmICghazEgfHwgIWsyIHx8IGsxLmxlbmd0aCAhPSBrMi5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgbGV0IGtleTogc3RyaW5nO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGsxLmxlbmd0aDsgaSsrKSB7XG4gICAga2V5ID0gazFbaV07XG4gICAgaWYgKCFlcXVhbEFycmF5c09yU3RyaW5nKGFba2V5XSwgYltrZXldKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBUZXN0IGVxdWFsaXR5IGZvciBhcnJheXMgb2Ygc3RyaW5ncyBvciBhIHN0cmluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsQXJyYXlzT3JTdHJpbmcoYTogc3RyaW5nIHwgc3RyaW5nW10sIGI6IHN0cmluZyB8IHN0cmluZ1tdKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGEpICYmIEFycmF5LmlzQXJyYXkoYikpIHtcbiAgICBpZiAoYS5sZW5ndGggIT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gYS5ldmVyeShhSXRlbSA9PiBiLmluZGV4T2YoYUl0ZW0pID4gLTEpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBhID09PSBiO1xuICB9XG59XG5cbi8qKlxuICogRmxhdHRlbnMgc2luZ2xlLWxldmVsIG5lc3RlZCBhcnJheXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbGF0dGVuPFQ+KGFycjogVFtdW10pOiBUW10ge1xuICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgYXJyKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGxhc3QgZWxlbWVudCBvZiBhbiBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxhc3Q8VD4oYTogVFtdKTogVHxudWxsIHtcbiAgcmV0dXJuIGEubGVuZ3RoID4gMCA/IGFbYS5sZW5ndGggLSAxXSA6IG51bGw7XG59XG5cbi8qKlxuICogVmVyaWZ5cyBhbGwgYm9vbGVhbnMgaW4gYW4gYXJyYXkgYXJlIGB0cnVlYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuZChib29sczogYm9vbGVhbltdKTogYm9vbGVhbiB7XG4gIHJldHVybiAhYm9vbHMuc29tZSh2ID0+ICF2KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvckVhY2g8SywgVj4obWFwOiB7W2tleTogc3RyaW5nXTogVn0sIGNhbGxiYWNrOiAodjogViwgazogc3RyaW5nKSA9PiB2b2lkKTogdm9pZCB7XG4gIGZvciAoY29uc3QgcHJvcCBpbiBtYXApIHtcbiAgICBpZiAobWFwLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICBjYWxsYmFjayhtYXBbcHJvcF0sIHByb3ApO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2FpdEZvck1hcDxBLCBCPihcbiAgICBvYmo6IHtbazogc3RyaW5nXTogQX0sIGZuOiAoazogc3RyaW5nLCBhOiBBKSA9PiBPYnNlcnZhYmxlPEI+KTogT2JzZXJ2YWJsZTx7W2s6IHN0cmluZ106IEJ9PiB7XG4gIGlmIChPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBvZiAoe30pO1xuICB9XG5cbiAgY29uc3Qgd2FpdEhlYWQ6IE9ic2VydmFibGU8Qj5bXSA9IFtdO1xuICBjb25zdCB3YWl0VGFpbDogT2JzZXJ2YWJsZTxCPltdID0gW107XG4gIGNvbnN0IHJlczoge1trOiBzdHJpbmddOiBCfSA9IHt9O1xuXG4gIGZvckVhY2gob2JqLCAoYTogQSwgazogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgbWFwcGVkID0gZm4oaywgYSkucGlwZShtYXAoKHI6IEIpID0+IHJlc1trXSA9IHIpKTtcbiAgICBpZiAoayA9PT0gUFJJTUFSWV9PVVRMRVQpIHtcbiAgICAgIHdhaXRIZWFkLnB1c2gobWFwcGVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2FpdFRhaWwucHVzaChtYXBwZWQpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gQ2xvc3VyZSBjb21waWxlciBoYXMgcHJvYmxlbSB3aXRoIHVzaW5nIHNwcmVhZCBvcGVyYXRvciBoZXJlLiBTbyB3ZSB1c2UgXCJBcnJheS5jb25jYXRcIi5cbiAgLy8gTm90ZSB0aGF0IHdlIGFsc28gbmVlZCB0byBjYXN0IHRoZSBuZXcgcHJvbWlzZSBiZWNhdXNlIFR5cGVTY3JpcHQgY2Fubm90IGluZmVyIHRoZSB0eXBlXG4gIC8vIHdoZW4gY2FsbGluZyB0aGUgXCJvZlwiIGZ1bmN0aW9uIHRocm91Z2ggXCJGdW5jdGlvbi5hcHBseVwiXG4gIHJldHVybiAob2YgLmFwcGx5KG51bGwsIHdhaXRIZWFkLmNvbmNhdCh3YWl0VGFpbCkpIGFzIE9ic2VydmFibGU8T2JzZXJ2YWJsZTxCPj4pXG4gICAgICAucGlwZShjb25jYXRBbGwoKSwgbGFzdFZhbHVlKCksIG1hcCgoKSA9PiByZXMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBJbnRvT2JzZXJ2YWJsZTxUPih2YWx1ZTogVCB8IFByb21pc2U8VD58IE9ic2VydmFibGU8VD4pOiBPYnNlcnZhYmxlPFQ+IHtcbiAgaWYgKGlzT2JzZXJ2YWJsZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBpZiAoaXNQcm9taXNlKHZhbHVlKSkge1xuICAgIC8vIFVzZSBgUHJvbWlzZS5yZXNvbHZlKClgIHRvIHdyYXAgcHJvbWlzZS1saWtlIGluc3RhbmNlcy5cbiAgICAvLyBSZXF1aXJlZCBpZSB3aGVuIGEgUmVzb2x2ZXIgcmV0dXJucyBhIEFuZ3VsYXJKUyBgJHFgIHByb21pc2UgdG8gY29ycmVjdGx5IHRyaWdnZXIgdGhlXG4gICAgLy8gY2hhbmdlIGRldGVjdGlvbi5cbiAgICByZXR1cm4gZnJvbShQcm9taXNlLnJlc29sdmUodmFsdWUpKTtcbiAgfVxuXG4gIHJldHVybiBvZiAodmFsdWUpO1xufVxuIl19