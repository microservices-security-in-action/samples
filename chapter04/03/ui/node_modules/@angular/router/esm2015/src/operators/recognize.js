/**
 * @fileoverview added by tsickle
 * Generated from: packages/router/src/operators/recognize.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { map, mergeMap } from 'rxjs/operators';
import { recognize as recognizeFn } from '../recognize';
/**
 * @param {?} rootComponentType
 * @param {?} config
 * @param {?} serializer
 * @param {?} paramsInheritanceStrategy
 * @param {?} relativeLinkResolution
 * @return {?}
 */
export function recognize(rootComponentType, config, serializer, paramsInheritanceStrategy, relativeLinkResolution) {
    return (/**
     * @param {?} source
     * @return {?}
     */
    function (source) {
        return source.pipe(mergeMap((/**
         * @param {?} t
         * @return {?}
         */
        t => recognizeFn(rootComponentType, config, t.urlAfterRedirects, serializer(t.urlAfterRedirects), paramsInheritanceStrategy, relativeLinkResolution)
            .pipe(map((/**
         * @param {?} targetSnapshot
         * @return {?}
         */
        targetSnapshot => (Object.assign(Object.assign({}, t), { targetSnapshot }))))))));
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb2duaXplLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9vcGVyYXRvcnMvcmVjb2duaXplLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVVBLE9BQU8sRUFBQyxHQUFHLEVBQUUsUUFBUSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFHN0MsT0FBTyxFQUFDLFNBQVMsSUFBSSxXQUFXLEVBQUMsTUFBTSxjQUFjLENBQUM7Ozs7Ozs7OztBQUl0RCxNQUFNLFVBQVUsU0FBUyxDQUNyQixpQkFBa0MsRUFBRSxNQUFlLEVBQUUsVUFBb0MsRUFDekYseUJBQWlELEVBQUUsc0JBQ3BDO0lBQ2pCOzs7O0lBQU8sVUFBUyxNQUF3QztRQUN0RCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUTs7OztRQUN2QixDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FDUCxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsRUFDL0UseUJBQXlCLEVBQUUsc0JBQXNCLENBQUM7YUFDakQsSUFBSSxDQUFDLEdBQUc7Ozs7UUFBQyxjQUFjLENBQUMsRUFBRSxDQUFDLGlDQUFLLENBQUMsS0FBRSxjQUFjLElBQUUsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ3hFLENBQUMsRUFBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7VHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbiwgT2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge21hcCwgbWVyZ2VNYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtSb3V0ZX0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7cmVjb2duaXplIGFzIHJlY29nbml6ZUZufSBmcm9tICcuLi9yZWNvZ25pemUnO1xuaW1wb3J0IHtOYXZpZ2F0aW9uVHJhbnNpdGlvbn0gZnJvbSAnLi4vcm91dGVyJztcbmltcG9ydCB7VXJsVHJlZX0gZnJvbSAnLi4vdXJsX3RyZWUnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVjb2duaXplKFxuICAgIHJvb3RDb21wb25lbnRUeXBlOiBUeXBlPGFueT58IG51bGwsIGNvbmZpZzogUm91dGVbXSwgc2VyaWFsaXplcjogKHVybDogVXJsVHJlZSkgPT4gc3RyaW5nLFxuICAgIHBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3k6ICdlbXB0eU9ubHknIHwgJ2Fsd2F5cycsIHJlbGF0aXZlTGlua1Jlc29sdXRpb246ICdsZWdhY3knIHxcbiAgICAgICAgJ2NvcnJlY3RlZCcpOiBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248TmF2aWdhdGlvblRyYW5zaXRpb24+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHNvdXJjZTogT2JzZXJ2YWJsZTxOYXZpZ2F0aW9uVHJhbnNpdGlvbj4pIHtcbiAgICByZXR1cm4gc291cmNlLnBpcGUobWVyZ2VNYXAoXG4gICAgICAgIHQgPT4gcmVjb2duaXplRm4oXG4gICAgICAgICAgICAgICAgIHJvb3RDb21wb25lbnRUeXBlLCBjb25maWcsIHQudXJsQWZ0ZXJSZWRpcmVjdHMsIHNlcmlhbGl6ZXIodC51cmxBZnRlclJlZGlyZWN0cyksXG4gICAgICAgICAgICAgICAgIHBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3ksIHJlbGF0aXZlTGlua1Jlc29sdXRpb24pXG4gICAgICAgICAgICAgICAgIC5waXBlKG1hcCh0YXJnZXRTbmFwc2hvdCA9PiAoey4uLnQsIHRhcmdldFNuYXBzaG90fSkpKSkpO1xuICB9O1xufVxuIl19