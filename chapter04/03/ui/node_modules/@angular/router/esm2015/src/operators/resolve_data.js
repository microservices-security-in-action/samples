/**
 * @fileoverview added by tsickle
 * Generated from: packages/router/src/operators/resolve_data.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { from, of } from 'rxjs';
import { concatMap, last, map, mergeMap, reduce } from 'rxjs/operators';
import { inheritedParamsDataResolve } from '../router_state';
import { wrapIntoObservable } from '../utils/collection';
import { getToken } from '../utils/preactivation';
/**
 * @param {?} paramsInheritanceStrategy
 * @param {?} moduleInjector
 * @return {?}
 */
export function resolveData(paramsInheritanceStrategy, moduleInjector) {
    return (/**
     * @param {?} source
     * @return {?}
     */
    function (source) {
        return source.pipe(mergeMap((/**
         * @param {?} t
         * @return {?}
         */
        t => {
            const { targetSnapshot, guards: { canActivateChecks } } = t;
            if (!canActivateChecks.length) {
                return of(t);
            }
            return from(canActivateChecks)
                .pipe(concatMap((/**
             * @param {?} check
             * @return {?}
             */
            check => runResolve(check.route, (/** @type {?} */ (targetSnapshot)), paramsInheritanceStrategy, moduleInjector))), reduce((/**
             * @param {?} _
             * @param {?} __
             * @return {?}
             */
            (_, __) => _)), map((/**
             * @param {?} _
             * @return {?}
             */
            _ => t)));
        })));
    });
}
/**
 * @param {?} futureARS
 * @param {?} futureRSS
 * @param {?} paramsInheritanceStrategy
 * @param {?} moduleInjector
 * @return {?}
 */
function runResolve(futureARS, futureRSS, paramsInheritanceStrategy, moduleInjector) {
    /** @type {?} */
    const resolve = futureARS._resolve;
    return resolveNode(resolve, futureARS, futureRSS, moduleInjector)
        .pipe(map((/**
     * @param {?} resolvedData
     * @return {?}
     */
    (resolvedData) => {
        futureARS._resolvedData = resolvedData;
        futureARS.data = Object.assign(Object.assign({}, futureARS.data), inheritedParamsDataResolve(futureARS, paramsInheritanceStrategy).resolve);
        return null;
    })));
}
/**
 * @param {?} resolve
 * @param {?} futureARS
 * @param {?} futureRSS
 * @param {?} moduleInjector
 * @return {?}
 */
function resolveNode(resolve, futureARS, futureRSS, moduleInjector) {
    /** @type {?} */
    const keys = Object.keys(resolve);
    if (keys.length === 0) {
        return of({});
    }
    if (keys.length === 1) {
        /** @type {?} */
        const key = keys[0];
        return getResolver(resolve[key], futureARS, futureRSS, moduleInjector)
            .pipe(map((/**
         * @param {?} value
         * @return {?}
         */
        (value) => { return { [key]: value }; })));
    }
    /** @type {?} */
    const data = {};
    /** @type {?} */
    const runningResolvers$ = from(keys).pipe(mergeMap((/**
     * @param {?} key
     * @return {?}
     */
    (key) => {
        return getResolver(resolve[key], futureARS, futureRSS, moduleInjector)
            .pipe(map((/**
         * @param {?} value
         * @return {?}
         */
        (value) => {
            data[key] = value;
            return value;
        })));
    })));
    return runningResolvers$.pipe(last(), map((/**
     * @return {?}
     */
    () => data)));
}
/**
 * @param {?} injectionToken
 * @param {?} futureARS
 * @param {?} futureRSS
 * @param {?} moduleInjector
 * @return {?}
 */
function getResolver(injectionToken, futureARS, futureRSS, moduleInjector) {
    /** @type {?} */
    const resolver = getToken(injectionToken, futureARS, moduleInjector);
    return resolver.resolve ? wrapIntoObservable(resolver.resolve(futureARS, futureRSS)) :
        wrapIntoObservable(resolver(futureARS, futureRSS));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9kYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9vcGVyYXRvcnMvcmVzb2x2ZV9kYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVNBLE9BQU8sRUFBdUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNyRSxPQUFPLEVBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBSXRFLE9BQU8sRUFBOEMsMEJBQTBCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN4RyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUV2RCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7Ozs7OztBQUVoRCxNQUFNLFVBQVUsV0FBVyxDQUN2Qix5QkFBaUQsRUFDakQsY0FBd0I7SUFDMUI7Ozs7SUFBTyxVQUFTLE1BQXdDO1FBQ3RELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFROzs7O1FBQUMsQ0FBQyxDQUFDLEVBQUU7a0JBQ3hCLEVBQUMsY0FBYyxFQUFFLE1BQU0sRUFBRSxFQUFDLGlCQUFpQixFQUFDLEVBQUMsR0FBRyxDQUFDO1lBRXZELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUU7Z0JBQzdCLE9BQU8sRUFBRSxDQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ2Y7WUFFRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztpQkFDekIsSUFBSSxDQUNELFNBQVM7Ozs7WUFDTCxLQUFLLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FDZixLQUFLLENBQUMsS0FBSyxFQUFFLG1CQUFBLGNBQWMsRUFBRSxFQUFFLHlCQUF5QixFQUFFLGNBQWMsQ0FBQyxFQUFDLEVBQ2xGLE1BQU07Ozs7O1lBQUMsQ0FB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OlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uLCBPYnNlcnZhYmxlLCBmcm9tLCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtjb25jYXRNYXAsIGxhc3QsIG1hcCwgbWVyZ2VNYXAsIHJlZHVjZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge1Jlc29sdmVEYXRhfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtOYXZpZ2F0aW9uVHJhbnNpdGlvbn0gZnJvbSAnLi4vcm91dGVyJztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgUm91dGVyU3RhdGVTbmFwc2hvdCwgaW5oZXJpdGVkUGFyYW1zRGF0YVJlc29sdmV9IGZyb20gJy4uL3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQge3dyYXBJbnRvT2JzZXJ2YWJsZX0gZnJvbSAnLi4vdXRpbHMvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7Z2V0VG9rZW59IGZyb20gJy4uL3V0aWxzL3ByZWFjdGl2YXRpb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZURhdGEoXG4gICAgcGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneTogJ2VtcHR5T25seScgfCAnYWx3YXlzJyxcbiAgICBtb2R1bGVJbmplY3RvcjogSW5qZWN0b3IpOiBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248TmF2aWdhdGlvblRyYW5zaXRpb24+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHNvdXJjZTogT2JzZXJ2YWJsZTxOYXZpZ2F0aW9uVHJhbnNpdGlvbj4pIHtcbiAgICByZXR1cm4gc291cmNlLnBpcGUobWVyZ2VNYXAodCA9PiB7XG4gICAgICBjb25zdCB7dGFyZ2V0U25hcHNob3QsIGd1YXJkczoge2NhbkFjdGl2YXRlQ2hlY2tzfX0gPSB0O1xuXG4gICAgICBpZiAoIWNhbkFjdGl2YXRlQ2hlY2tzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gb2YgKHQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZnJvbShjYW5BY3RpdmF0ZUNoZWNrcylcbiAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgY29uY2F0TWFwKFxuICAgICAgICAgICAgICAgICAgY2hlY2sgPT4gcnVuUmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICBjaGVjay5yb3V0ZSwgdGFyZ2V0U25hcHNob3QgISwgcGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSwgbW9kdWxlSW5qZWN0b3IpKSxcbiAgICAgICAgICAgICAgcmVkdWNlKChfOiBhbnksIF9fOiBhbnkpID0+IF8pLCBtYXAoXyA9PiB0KSk7XG4gICAgfSkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBydW5SZXNvbHZlKFxuICAgIGZ1dHVyZUFSUzogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgZnV0dXJlUlNTOiBSb3V0ZXJTdGF0ZVNuYXBzaG90LFxuICAgIHBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3k6ICdlbXB0eU9ubHknIHwgJ2Fsd2F5cycsIG1vZHVsZUluamVjdG9yOiBJbmplY3Rvcikge1xuICBjb25zdCByZXNvbHZlID0gZnV0dXJlQVJTLl9yZXNvbHZlO1xuICByZXR1cm4gcmVzb2x2ZU5vZGUocmVzb2x2ZSwgZnV0dXJlQVJTLCBmdXR1cmVSU1MsIG1vZHVsZUluamVjdG9yKVxuICAgICAgLnBpcGUobWFwKChyZXNvbHZlZERhdGE6IGFueSkgPT4ge1xuICAgICAgICBmdXR1cmVBUlMuX3Jlc29sdmVkRGF0YSA9IHJlc29sdmVkRGF0YTtcbiAgICAgICAgZnV0dXJlQVJTLmRhdGEgPSB7XG4gICAgICAgICAgICAuLi5mdXR1cmVBUlMuZGF0YSxcbiAgICAgICAgICAgIC4uLmluaGVyaXRlZFBhcmFtc0RhdGFSZXNvbHZlKGZ1dHVyZUFSUywgcGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSkucmVzb2x2ZX07XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSkpO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlTm9kZShcbiAgICByZXNvbHZlOiBSZXNvbHZlRGF0YSwgZnV0dXJlQVJTOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBmdXR1cmVSU1M6IFJvdXRlclN0YXRlU25hcHNob3QsXG4gICAgbW9kdWxlSW5qZWN0b3I6IEluamVjdG9yKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHJlc29sdmUpO1xuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gb2YgKHt9KTtcbiAgfVxuICBpZiAoa2V5cy5sZW5ndGggPT09IDEpIHtcbiAgICBjb25zdCBrZXkgPSBrZXlzWzBdO1xuICAgIHJldHVybiBnZXRSZXNvbHZlcihyZXNvbHZlW2tleV0sIGZ1dHVyZUFSUywgZnV0dXJlUlNTLCBtb2R1bGVJbmplY3RvcilcbiAgICAgICAgLnBpcGUobWFwKCh2YWx1ZTogYW55KSA9PiB7IHJldHVybiB7W2tleV06IHZhbHVlfTsgfSkpO1xuICB9XG4gIGNvbnN0IGRhdGE6IHtbazogc3RyaW5nXTogYW55fSA9IHt9O1xuICBjb25zdCBydW5uaW5nUmVzb2x2ZXJzJCA9IGZyb20oa2V5cykucGlwZShtZXJnZU1hcCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gZ2V0UmVzb2x2ZXIocmVzb2x2ZVtrZXldLCBmdXR1cmVBUlMsIGZ1dHVyZVJTUywgbW9kdWxlSW5qZWN0b3IpXG4gICAgICAgIC5waXBlKG1hcCgodmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlO1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSkpO1xuICB9KSk7XG4gIHJldHVybiBydW5uaW5nUmVzb2x2ZXJzJC5waXBlKGxhc3QoKSwgbWFwKCgpID0+IGRhdGEpKTtcbn1cblxuZnVuY3Rpb24gZ2V0UmVzb2x2ZXIoXG4gICAgaW5qZWN0aW9uVG9rZW46IGFueSwgZnV0dXJlQVJTOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBmdXR1cmVSU1M6IFJvdXRlclN0YXRlU25hcHNob3QsXG4gICAgbW9kdWxlSW5qZWN0b3I6IEluamVjdG9yKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgY29uc3QgcmVzb2x2ZXIgPSBnZXRUb2tlbihpbmplY3Rpb25Ub2tlbiwgZnV0dXJlQVJTLCBtb2R1bGVJbmplY3Rvcik7XG4gIHJldHVybiByZXNvbHZlci5yZXNvbHZlID8gd3JhcEludG9PYnNlcnZhYmxlKHJlc29sdmVyLnJlc29sdmUoZnV0dXJlQVJTLCBmdXR1cmVSU1MpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd3JhcEludG9PYnNlcnZhYmxlKHJlc29sdmVyKGZ1dHVyZUFSUywgZnV0dXJlUlNTKSk7XG59Il19