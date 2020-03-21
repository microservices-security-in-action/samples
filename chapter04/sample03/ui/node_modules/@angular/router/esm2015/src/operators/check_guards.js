/**
 * @fileoverview added by tsickle
 * Generated from: packages/router/src/operators/check_guards.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { defer, from, of } from 'rxjs';
import { concatAll, concatMap, first, map, mergeMap } from 'rxjs/operators';
import { ActivationStart, ChildActivationStart } from '../events';
import { wrapIntoObservable } from '../utils/collection';
import { getCanActivateChild, getToken } from '../utils/preactivation';
import { isBoolean, isCanActivate, isCanActivateChild, isCanDeactivate, isFunction } from '../utils/type_guards';
import { prioritizedGuardValue } from './prioritized_guard_value';
/**
 * @param {?} moduleInjector
 * @param {?=} forwardEvent
 * @return {?}
 */
export function checkGuards(moduleInjector, forwardEvent) {
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
            const { targetSnapshot, currentSnapshot, guards: { canActivateChecks, canDeactivateChecks } } = t;
            if (canDeactivateChecks.length === 0 && canActivateChecks.length === 0) {
                return of(Object.assign(Object.assign({}, t), { guardsResult: true }));
            }
            return runCanDeactivateChecks(canDeactivateChecks, (/** @type {?} */ (targetSnapshot)), currentSnapshot, moduleInjector)
                .pipe(mergeMap((/**
             * @param {?} canDeactivate
             * @return {?}
             */
            canDeactivate => {
                return canDeactivate && isBoolean(canDeactivate) ?
                    runCanActivateChecks((/** @type {?} */ (targetSnapshot)), canActivateChecks, moduleInjector, forwardEvent) :
                    of(canDeactivate);
            })), map((/**
             * @param {?} guardsResult
             * @return {?}
             */
            guardsResult => (Object.assign(Object.assign({}, t), { guardsResult })))));
        })));
    });
}
/**
 * @param {?} checks
 * @param {?} futureRSS
 * @param {?} currRSS
 * @param {?} moduleInjector
 * @return {?}
 */
function runCanDeactivateChecks(checks, futureRSS, currRSS, moduleInjector) {
    return from(checks).pipe(mergeMap((/**
     * @param {?} check
     * @return {?}
     */
    check => runCanDeactivate(check.component, check.route, currRSS, futureRSS, moduleInjector))), first((/**
     * @param {?} result
     * @return {?}
     */
    result => { return result !== true; }), (/** @type {?} */ (true))));
}
/**
 * @param {?} futureSnapshot
 * @param {?} checks
 * @param {?} moduleInjector
 * @param {?=} forwardEvent
 * @return {?}
 */
function runCanActivateChecks(futureSnapshot, checks, moduleInjector, forwardEvent) {
    return from(checks).pipe(concatMap((/**
     * @param {?} check
     * @return {?}
     */
    (check) => {
        return from([
            fireChildActivationStart(check.route.parent, forwardEvent),
            fireActivationStart(check.route, forwardEvent),
            runCanActivateChild(futureSnapshot, check.path, moduleInjector),
            runCanActivate(futureSnapshot, check.route, moduleInjector)
        ])
            .pipe(concatAll(), first((/**
         * @param {?} result
         * @return {?}
         */
        result => {
            return result !== true;
        }), (/** @type {?} */ (true))));
    })), first((/**
     * @param {?} result
     * @return {?}
     */
    result => { return result !== true; }), (/** @type {?} */ (true))));
}
/**
 * This should fire off `ActivationStart` events for each route being activated at this
 * level.
 * In other words, if you're activating `a` and `b` below, `path` will contain the
 * `ActivatedRouteSnapshot`s for both and we will fire `ActivationStart` for both. Always
 * return
 * `true` so checks continue to run.
 * @param {?} snapshot
 * @param {?=} forwardEvent
 * @return {?}
 */
function fireActivationStart(snapshot, forwardEvent) {
    if (snapshot !== null && forwardEvent) {
        forwardEvent(new ActivationStart(snapshot));
    }
    return of(true);
}
/**
 * This should fire off `ChildActivationStart` events for each route being activated at this
 * level.
 * In other words, if you're activating `a` and `b` below, `path` will contain the
 * `ActivatedRouteSnapshot`s for both and we will fire `ChildActivationStart` for both. Always
 * return
 * `true` so checks continue to run.
 * @param {?} snapshot
 * @param {?=} forwardEvent
 * @return {?}
 */
function fireChildActivationStart(snapshot, forwardEvent) {
    if (snapshot !== null && forwardEvent) {
        forwardEvent(new ChildActivationStart(snapshot));
    }
    return of(true);
}
/**
 * @param {?} futureRSS
 * @param {?} futureARS
 * @param {?} moduleInjector
 * @return {?}
 */
function runCanActivate(futureRSS, futureARS, moduleInjector) {
    /** @type {?} */
    const canActivate = futureARS.routeConfig ? futureARS.routeConfig.canActivate : null;
    if (!canActivate || canActivate.length === 0)
        return of(true);
    /** @type {?} */
    const canActivateObservables = canActivate.map((/**
     * @param {?} c
     * @return {?}
     */
    (c) => {
        return defer((/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            const guard = getToken(c, futureARS, moduleInjector);
            /** @type {?} */
            let observable;
            if (isCanActivate(guard)) {
                observable = wrapIntoObservable(guard.canActivate(futureARS, futureRSS));
            }
            else if (isFunction(guard)) {
                observable = wrapIntoObservable(guard(futureARS, futureRSS));
            }
            else {
                throw new Error('Invalid CanActivate guard');
            }
            return observable.pipe(first());
        }));
    }));
    return of(canActivateObservables).pipe(prioritizedGuardValue());
}
/**
 * @param {?} futureRSS
 * @param {?} path
 * @param {?} moduleInjector
 * @return {?}
 */
function runCanActivateChild(futureRSS, path, moduleInjector) {
    /** @type {?} */
    const futureARS = path[path.length - 1];
    /** @type {?} */
    const canActivateChildGuards = path.slice(0, path.length - 1)
        .reverse()
        .map((/**
     * @param {?} p
     * @return {?}
     */
    p => getCanActivateChild(p)))
        .filter((/**
     * @param {?} _
     * @return {?}
     */
    _ => _ !== null));
    /** @type {?} */
    const canActivateChildGuardsMapped = canActivateChildGuards.map((/**
     * @param {?} d
     * @return {?}
     */
    (d) => {
        return defer((/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            const guardsMapped = d.guards.map((/**
             * @param {?} c
             * @return {?}
             */
            (c) => {
                /** @type {?} */
                const guard = getToken(c, d.node, moduleInjector);
                /** @type {?} */
                let observable;
                if (isCanActivateChild(guard)) {
                    observable = wrapIntoObservable(guard.canActivateChild(futureARS, futureRSS));
                }
                else if (isFunction(guard)) {
                    observable = wrapIntoObservable(guard(futureARS, futureRSS));
                }
                else {
                    throw new Error('Invalid CanActivateChild guard');
                }
                return observable.pipe(first());
            }));
            return of(guardsMapped).pipe(prioritizedGuardValue());
        }));
    }));
    return of(canActivateChildGuardsMapped).pipe(prioritizedGuardValue());
}
/**
 * @param {?} component
 * @param {?} currARS
 * @param {?} currRSS
 * @param {?} futureRSS
 * @param {?} moduleInjector
 * @return {?}
 */
function runCanDeactivate(component, currARS, currRSS, futureRSS, moduleInjector) {
    /** @type {?} */
    const canDeactivate = currARS && currARS.routeConfig ? currARS.routeConfig.canDeactivate : null;
    if (!canDeactivate || canDeactivate.length === 0)
        return of(true);
    /** @type {?} */
    const canDeactivateObservables = canDeactivate.map((/**
     * @param {?} c
     * @return {?}
     */
    (c) => {
        /** @type {?} */
        const guard = getToken(c, currARS, moduleInjector);
        /** @type {?} */
        let observable;
        if (isCanDeactivate(guard)) {
            observable =
                wrapIntoObservable(guard.canDeactivate((/** @type {?} */ (component)), currARS, currRSS, futureRSS));
        }
        else if (isFunction(guard)) {
            observable = wrapIntoObservable(guard(component, currARS, currRSS, futureRSS));
        }
        else {
            throw new Error('Invalid CanDeactivate guard');
        }
        return observable.pipe(first());
    }));
    return of(canDeactivateObservables).pipe(prioritizedGuardValue());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tfZ3VhcmRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9vcGVyYXRvcnMvY2hlY2tfZ3VhcmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVNBLE9BQU8sRUFBdUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDNUUsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUUxRSxPQUFPLEVBQUMsZUFBZSxFQUFFLG9CQUFvQixFQUFRLE1BQU0sV0FBVyxDQUFDO0FBS3ZFLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3ZELE9BQU8sRUFBNkIsbUJBQW1CLEVBQUUsUUFBUSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDakcsT0FBTyxFQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBRS9HLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDOzs7Ozs7QUFFaEUsTUFBTSxVQUFVLFdBQVcsQ0FBQyxjQUF3QixFQUFFLFlBQW1DO0lBRXZGOzs7O0lBQU8sVUFBUyxNQUF3QztRQUV0RCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUTs7OztRQUFDLENBQUMsQ0FBQyxFQUFFO2tCQUN4QixFQUFDLGNBQWMsRUFBRSxlQUFlLEVBQUUsTUFBTSxFQUFFLEVBQUMsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUMsRUFBQyxHQUFHLENBQUM7WUFDN0YsSUFBSSxtQkFBbUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3RFLE9B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LGtCQUFrQixDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQ2hGO2FBQU07WUFDTCxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7U0FDaEQ7UUFDRCxPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNsQyxDQUFDLEVBQUM7SUFDRixPQUFPLEVBQUUsQ0FBRSx3QkFBd0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7QUFDckUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbiwgT2JzZXJ2YWJsZSwgZGVmZXIsIGZyb20sIG9mIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2NvbmNhdEFsbCwgY29uY2F0TWFwLCBmaXJzdCwgbWFwLCBtZXJnZU1hcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0FjdGl2YXRpb25TdGFydCwgQ2hpbGRBY3RpdmF0aW9uU3RhcnQsIEV2ZW50fSBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0IHtDYW5BY3RpdmF0ZUNoaWxkRm4sIENhbkFjdGl2YXRlRm4sIENhbkRlYWN0aXZhdGVGbn0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge05hdmlnYXRpb25UcmFuc2l0aW9ufSBmcm9tICcuLi9yb3V0ZXInO1xuaW1wb3J0IHtBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBSb3V0ZXJTdGF0ZVNuYXBzaG90fSBmcm9tICcuLi9yb3V0ZXJfc3RhdGUnO1xuaW1wb3J0IHtVcmxUcmVlfSBmcm9tICcuLi91cmxfdHJlZSc7XG5pbXBvcnQge3dyYXBJbnRvT2JzZXJ2YWJsZX0gZnJvbSAnLi4vdXRpbHMvY29sbGVjdGlvbic7XG5pbXBvcnQge0NhbkFjdGl2YXRlLCBDYW5EZWFjdGl2YXRlLCBnZXRDYW5BY3RpdmF0ZUNoaWxkLCBnZXRUb2tlbn0gZnJvbSAnLi4vdXRpbHMvcHJlYWN0aXZhdGlvbic7XG5pbXBvcnQge2lzQm9vbGVhbiwgaXNDYW5BY3RpdmF0ZSwgaXNDYW5BY3RpdmF0ZUNoaWxkLCBpc0NhbkRlYWN0aXZhdGUsIGlzRnVuY3Rpb259IGZyb20gJy4uL3V0aWxzL3R5cGVfZ3VhcmRzJztcblxuaW1wb3J0IHtwcmlvcml0aXplZEd1YXJkVmFsdWV9IGZyb20gJy4vcHJpb3JpdGl6ZWRfZ3VhcmRfdmFsdWUnO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tHdWFyZHMobW9kdWxlSW5qZWN0b3I6IEluamVjdG9yLCBmb3J3YXJkRXZlbnQ/OiAoZXZ0OiBFdmVudCkgPT4gdm9pZCk6XG4gICAgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPE5hdmlnYXRpb25UcmFuc2l0aW9uPiB7XG4gIHJldHVybiBmdW5jdGlvbihzb3VyY2U6IE9ic2VydmFibGU8TmF2aWdhdGlvblRyYW5zaXRpb24+KSB7XG5cbiAgICByZXR1cm4gc291cmNlLnBpcGUobWVyZ2VNYXAodCA9PiB7XG4gICAgICBjb25zdCB7dGFyZ2V0U25hcHNob3QsIGN1cnJlbnRTbmFwc2hvdCwgZ3VhcmRzOiB7Y2FuQWN0aXZhdGVDaGVja3MsIGNhbkRlYWN0aXZhdGVDaGVja3N9fSA9IHQ7XG4gICAgICBpZiAoY2FuRGVhY3RpdmF0ZUNoZWNrcy5sZW5ndGggPT09IDAgJiYgY2FuQWN0aXZhdGVDaGVja3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBvZiAoey4uLnQsIGd1YXJkc1Jlc3VsdDogdHJ1ZX0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcnVuQ2FuRGVhY3RpdmF0ZUNoZWNrcyhcbiAgICAgICAgICAgICAgICAgY2FuRGVhY3RpdmF0ZUNoZWNrcywgdGFyZ2V0U25hcHNob3QgISwgY3VycmVudFNuYXBzaG90LCBtb2R1bGVJbmplY3RvcilcbiAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgbWVyZ2VNYXAoY2FuRGVhY3RpdmF0ZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbkRlYWN0aXZhdGUgJiYgaXNCb29sZWFuKGNhbkRlYWN0aXZhdGUpID9cbiAgICAgICAgICAgICAgICAgICAgcnVuQ2FuQWN0aXZhdGVDaGVja3MoXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRTbmFwc2hvdCAhLCBjYW5BY3RpdmF0ZUNoZWNrcywgbW9kdWxlSW5qZWN0b3IsIGZvcndhcmRFdmVudCkgOlxuICAgICAgICAgICAgICAgICAgICBvZiAoY2FuRGVhY3RpdmF0ZSk7XG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICBtYXAoZ3VhcmRzUmVzdWx0ID0+ICh7Li4udCwgZ3VhcmRzUmVzdWx0fSkpKTtcbiAgICB9KSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHJ1bkNhbkRlYWN0aXZhdGVDaGVja3MoXG4gICAgY2hlY2tzOiBDYW5EZWFjdGl2YXRlW10sIGZ1dHVyZVJTUzogUm91dGVyU3RhdGVTbmFwc2hvdCwgY3VyclJTUzogUm91dGVyU3RhdGVTbmFwc2hvdCxcbiAgICBtb2R1bGVJbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgcmV0dXJuIGZyb20oY2hlY2tzKS5waXBlKFxuICAgICAgbWVyZ2VNYXAoXG4gICAgICAgICAgY2hlY2sgPT5cbiAgICAgICAgICAgICAgcnVuQ2FuRGVhY3RpdmF0ZShjaGVjay5jb21wb25lbnQsIGNoZWNrLnJvdXRlLCBjdXJyUlNTLCBmdXR1cmVSU1MsIG1vZHVsZUluamVjdG9yKSksXG4gICAgICBmaXJzdChyZXN1bHQgPT4geyByZXR1cm4gcmVzdWx0ICE9PSB0cnVlOyB9LCB0cnVlIGFzIGJvb2xlYW4gfCBVcmxUcmVlKSk7XG59XG5cbmZ1bmN0aW9uIHJ1bkNhbkFjdGl2YXRlQ2hlY2tzKFxuICAgIGZ1dHVyZVNuYXBzaG90OiBSb3V0ZXJTdGF0ZVNuYXBzaG90LCBjaGVja3M6IENhbkFjdGl2YXRlW10sIG1vZHVsZUluamVjdG9yOiBJbmplY3RvcixcbiAgICBmb3J3YXJkRXZlbnQ/OiAoZXZ0OiBFdmVudCkgPT4gdm9pZCkge1xuICByZXR1cm4gZnJvbShjaGVja3MpLnBpcGUoXG4gICAgICBjb25jYXRNYXAoKGNoZWNrOiBDYW5BY3RpdmF0ZSkgPT4ge1xuICAgICAgICByZXR1cm4gZnJvbShbXG4gICAgICAgICAgICAgICAgIGZpcmVDaGlsZEFjdGl2YXRpb25TdGFydChjaGVjay5yb3V0ZS5wYXJlbnQsIGZvcndhcmRFdmVudCksXG4gICAgICAgICAgICAgICAgIGZpcmVBY3RpdmF0aW9uU3RhcnQoY2hlY2sucm91dGUsIGZvcndhcmRFdmVudCksXG4gICAgICAgICAgICAgICAgIHJ1bkNhbkFjdGl2YXRlQ2hpbGQoZnV0dXJlU25hcHNob3QsIGNoZWNrLnBhdGgsIG1vZHVsZUluamVjdG9yKSxcbiAgICAgICAgICAgICAgICAgcnVuQ2FuQWN0aXZhdGUoZnV0dXJlU25hcHNob3QsIGNoZWNrLnJvdXRlLCBtb2R1bGVJbmplY3RvcilcbiAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAucGlwZShjb25jYXRBbGwoKSwgZmlyc3QocmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCAhPT0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH0sIHRydWUgYXMgYm9vbGVhbiB8IFVybFRyZWUpKTtcbiAgICAgIH0pLFxuICAgICAgZmlyc3QocmVzdWx0ID0+IHsgcmV0dXJuIHJlc3VsdCAhPT0gdHJ1ZTsgfSwgdHJ1ZSBhcyBib29sZWFuIHwgVXJsVHJlZSkpO1xufVxuXG4vKipcbiAgICogVGhpcyBzaG91bGQgZmlyZSBvZmYgYEFjdGl2YXRpb25TdGFydGAgZXZlbnRzIGZvciBlYWNoIHJvdXRlIGJlaW5nIGFjdGl2YXRlZCBhdCB0aGlzXG4gICAqIGxldmVsLlxuICAgKiBJbiBvdGhlciB3b3JkcywgaWYgeW91J3JlIGFjdGl2YXRpbmcgYGFgIGFuZCBgYmAgYmVsb3csIGBwYXRoYCB3aWxsIGNvbnRhaW4gdGhlXG4gICAqIGBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90YHMgZm9yIGJvdGggYW5kIHdlIHdpbGwgZmlyZSBgQWN0aXZhdGlvblN0YXJ0YCBmb3IgYm90aC4gQWx3YXlzXG4gICAqIHJldHVyblxuICAgKiBgdHJ1ZWAgc28gY2hlY2tzIGNvbnRpbnVlIHRvIHJ1bi5cbiAgICovXG5mdW5jdGlvbiBmaXJlQWN0aXZhdGlvblN0YXJ0KFxuICAgIHNuYXBzaG90OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90IHwgbnVsbCxcbiAgICBmb3J3YXJkRXZlbnQ/OiAoZXZ0OiBFdmVudCkgPT4gdm9pZCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICBpZiAoc25hcHNob3QgIT09IG51bGwgJiYgZm9yd2FyZEV2ZW50KSB7XG4gICAgZm9yd2FyZEV2ZW50KG5ldyBBY3RpdmF0aW9uU3RhcnQoc25hcHNob3QpKTtcbiAgfVxuICByZXR1cm4gb2YgKHRydWUpO1xufVxuXG4vKipcbiAgICogVGhpcyBzaG91bGQgZmlyZSBvZmYgYENoaWxkQWN0aXZhdGlvblN0YXJ0YCBldmVudHMgZm9yIGVhY2ggcm91dGUgYmVpbmcgYWN0aXZhdGVkIGF0IHRoaXNcbiAgICogbGV2ZWwuXG4gICAqIEluIG90aGVyIHdvcmRzLCBpZiB5b3UncmUgYWN0aXZhdGluZyBgYWAgYW5kIGBiYCBiZWxvdywgYHBhdGhgIHdpbGwgY29udGFpbiB0aGVcbiAgICogYEFjdGl2YXRlZFJvdXRlU25hcHNob3RgcyBmb3IgYm90aCBhbmQgd2Ugd2lsbCBmaXJlIGBDaGlsZEFjdGl2YXRpb25TdGFydGAgZm9yIGJvdGguIEFsd2F5c1xuICAgKiByZXR1cm5cbiAgICogYHRydWVgIHNvIGNoZWNrcyBjb250aW51ZSB0byBydW4uXG4gICAqL1xuZnVuY3Rpb24gZmlyZUNoaWxkQWN0aXZhdGlvblN0YXJ0KFxuICAgIHNuYXBzaG90OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90IHwgbnVsbCxcbiAgICBmb3J3YXJkRXZlbnQ/OiAoZXZ0OiBFdmVudCkgPT4gdm9pZCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICBpZiAoc25hcHNob3QgIT09IG51bGwgJiYgZm9yd2FyZEV2ZW50KSB7XG4gICAgZm9yd2FyZEV2ZW50KG5ldyBDaGlsZEFjdGl2YXRpb25TdGFydChzbmFwc2hvdCkpO1xuICB9XG4gIHJldHVybiBvZiAodHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIHJ1bkNhbkFjdGl2YXRlKFxuICAgIGZ1dHVyZVJTUzogUm91dGVyU3RhdGVTbmFwc2hvdCwgZnV0dXJlQVJTOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LFxuICAgIG1vZHVsZUluamVjdG9yOiBJbmplY3Rvcik6IE9ic2VydmFibGU8Ym9vbGVhbnxVcmxUcmVlPiB7XG4gIGNvbnN0IGNhbkFjdGl2YXRlID0gZnV0dXJlQVJTLnJvdXRlQ29uZmlnID8gZnV0dXJlQVJTLnJvdXRlQ29uZmlnLmNhbkFjdGl2YXRlIDogbnVsbDtcbiAgaWYgKCFjYW5BY3RpdmF0ZSB8fCBjYW5BY3RpdmF0ZS5sZW5ndGggPT09IDApIHJldHVybiBvZiAodHJ1ZSk7XG5cbiAgY29uc3QgY2FuQWN0aXZhdGVPYnNlcnZhYmxlcyA9IGNhbkFjdGl2YXRlLm1hcCgoYzogYW55KSA9PiB7XG4gICAgcmV0dXJuIGRlZmVyKCgpID0+IHtcbiAgICAgIGNvbnN0IGd1YXJkID0gZ2V0VG9rZW4oYywgZnV0dXJlQVJTLCBtb2R1bGVJbmplY3Rvcik7XG4gICAgICBsZXQgb2JzZXJ2YWJsZTtcbiAgICAgIGlmIChpc0NhbkFjdGl2YXRlKGd1YXJkKSkge1xuICAgICAgICBvYnNlcnZhYmxlID0gd3JhcEludG9PYnNlcnZhYmxlKGd1YXJkLmNhbkFjdGl2YXRlKGZ1dHVyZUFSUywgZnV0dXJlUlNTKSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb248Q2FuQWN0aXZhdGVGbj4oZ3VhcmQpKSB7XG4gICAgICAgIG9ic2VydmFibGUgPSB3cmFwSW50b09ic2VydmFibGUoZ3VhcmQoZnV0dXJlQVJTLCBmdXR1cmVSU1MpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBDYW5BY3RpdmF0ZSBndWFyZCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9ic2VydmFibGUucGlwZShmaXJzdCgpKTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBvZiAoY2FuQWN0aXZhdGVPYnNlcnZhYmxlcykucGlwZShwcmlvcml0aXplZEd1YXJkVmFsdWUoKSk7XG59XG5cbmZ1bmN0aW9uIHJ1bkNhbkFjdGl2YXRlQ2hpbGQoXG4gICAgZnV0dXJlUlNTOiBSb3V0ZXJTdGF0ZVNuYXBzaG90LCBwYXRoOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90W10sXG4gICAgbW9kdWxlSW5qZWN0b3I6IEluamVjdG9yKTogT2JzZXJ2YWJsZTxib29sZWFufFVybFRyZWU+IHtcbiAgY29uc3QgZnV0dXJlQVJTID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdO1xuXG4gIGNvbnN0IGNhbkFjdGl2YXRlQ2hpbGRHdWFyZHMgPSBwYXRoLnNsaWNlKDAsIHBhdGgubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmV2ZXJzZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChwID0+IGdldENhbkFjdGl2YXRlQ2hpbGQocCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihfID0+IF8gIT09IG51bGwpO1xuXG4gIGNvbnN0IGNhbkFjdGl2YXRlQ2hpbGRHdWFyZHNNYXBwZWQgPSBjYW5BY3RpdmF0ZUNoaWxkR3VhcmRzLm1hcCgoZDogYW55KSA9PiB7XG4gICAgcmV0dXJuIGRlZmVyKCgpID0+IHtcbiAgICAgIGNvbnN0IGd1YXJkc01hcHBlZCA9IGQuZ3VhcmRzLm1hcCgoYzogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGd1YXJkID0gZ2V0VG9rZW4oYywgZC5ub2RlLCBtb2R1bGVJbmplY3Rvcik7XG4gICAgICAgIGxldCBvYnNlcnZhYmxlO1xuICAgICAgICBpZiAoaXNDYW5BY3RpdmF0ZUNoaWxkKGd1YXJkKSkge1xuICAgICAgICAgIG9ic2VydmFibGUgPSB3cmFwSW50b09ic2VydmFibGUoZ3VhcmQuY2FuQWN0aXZhdGVDaGlsZChmdXR1cmVBUlMsIGZ1dHVyZVJTUykpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb248Q2FuQWN0aXZhdGVDaGlsZEZuPihndWFyZCkpIHtcbiAgICAgICAgICBvYnNlcnZhYmxlID0gd3JhcEludG9PYnNlcnZhYmxlKGd1YXJkKGZ1dHVyZUFSUywgZnV0dXJlUlNTKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIENhbkFjdGl2YXRlQ2hpbGQgZ3VhcmQnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZS5waXBlKGZpcnN0KCkpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gb2YgKGd1YXJkc01hcHBlZCkucGlwZShwcmlvcml0aXplZEd1YXJkVmFsdWUoKSk7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gb2YgKGNhbkFjdGl2YXRlQ2hpbGRHdWFyZHNNYXBwZWQpLnBpcGUocHJpb3JpdGl6ZWRHdWFyZFZhbHVlKCkpO1xufVxuXG5mdW5jdGlvbiBydW5DYW5EZWFjdGl2YXRlKFxuICAgIGNvbXBvbmVudDogT2JqZWN0IHwgbnVsbCwgY3VyckFSUzogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgY3VyclJTUzogUm91dGVyU3RhdGVTbmFwc2hvdCxcbiAgICBmdXR1cmVSU1M6IFJvdXRlclN0YXRlU25hcHNob3QsIG1vZHVsZUluamVjdG9yOiBJbmplY3Rvcik6IE9ic2VydmFibGU8Ym9vbGVhbnxVcmxUcmVlPiB7XG4gIGNvbnN0IGNhbkRlYWN0aXZhdGUgPSBjdXJyQVJTICYmIGN1cnJBUlMucm91dGVDb25maWcgPyBjdXJyQVJTLnJvdXRlQ29uZmlnLmNhbkRlYWN0aXZhdGUgOiBudWxsO1xuICBpZiAoIWNhbkRlYWN0aXZhdGUgfHwgY2FuRGVhY3RpdmF0ZS5sZW5ndGggPT09IDApIHJldHVybiBvZiAodHJ1ZSk7XG4gIGNvbnN0IGNhbkRlYWN0aXZhdGVPYnNlcnZhYmxlcyA9IGNhbkRlYWN0aXZhdGUubWFwKChjOiBhbnkpID0+IHtcbiAgICBjb25zdCBndWFyZCA9IGdldFRva2VuKGMsIGN1cnJBUlMsIG1vZHVsZUluamVjdG9yKTtcbiAgICBsZXQgb2JzZXJ2YWJsZTtcbiAgICBpZiAoaXNDYW5EZWFjdGl2YXRlKGd1YXJkKSkge1xuICAgICAgb2JzZXJ2YWJsZSA9XG4gICAgICAgICAgd3JhcEludG9PYnNlcnZhYmxlKGd1YXJkLmNhbkRlYWN0aXZhdGUoY29tcG9uZW50ICEsIGN1cnJBUlMsIGN1cnJSU1MsIGZ1dHVyZVJTUykpO1xuICAgIH0gZWxzZSBpZiAoaXNGdW5jdGlvbjxDYW5EZWFjdGl2YXRlRm48YW55Pj4oZ3VhcmQpKSB7XG4gICAgICBvYnNlcnZhYmxlID0gd3JhcEludG9PYnNlcnZhYmxlKGd1YXJkKGNvbXBvbmVudCwgY3VyckFSUywgY3VyclJTUywgZnV0dXJlUlNTKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBDYW5EZWFjdGl2YXRlIGd1YXJkJyk7XG4gICAgfVxuICAgIHJldHVybiBvYnNlcnZhYmxlLnBpcGUoZmlyc3QoKSk7XG4gIH0pO1xuICByZXR1cm4gb2YgKGNhbkRlYWN0aXZhdGVPYnNlcnZhYmxlcykucGlwZShwcmlvcml0aXplZEd1YXJkVmFsdWUoKSk7XG59XG4iXX0=