/**
 * @fileoverview added by tsickle
 * Generated from: packages/router/src/router_config_loader.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken, NgModuleFactory } from '@angular/core';
import { from, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { LoadedRouterConfig, standardizeConfig } from './config';
import { flatten, wrapIntoObservable } from './utils/collection';
/**
 * The [DI token](guide/glossary/#di-token) for a router configuration.
 * @see `ROUTES`
 * \@publicApi
 * @type {?}
 */
export const ROUTES = new InjectionToken('ROUTES');
export class RouterConfigLoader {
    /**
     * @param {?} loader
     * @param {?} compiler
     * @param {?=} onLoadStartListener
     * @param {?=} onLoadEndListener
     */
    constructor(loader, compiler, onLoadStartListener, onLoadEndListener) {
        this.loader = loader;
        this.compiler = compiler;
        this.onLoadStartListener = onLoadStartListener;
        this.onLoadEndListener = onLoadEndListener;
    }
    /**
     * @param {?} parentInjector
     * @param {?} route
     * @return {?}
     */
    load(parentInjector, route) {
        if (this.onLoadStartListener) {
            this.onLoadStartListener(route);
        }
        /** @type {?} */
        const moduleFactory$ = this.loadModuleFactory((/** @type {?} */ (route.loadChildren)));
        return moduleFactory$.pipe(map((/**
         * @param {?} factory
         * @return {?}
         */
        (factory) => {
            if (this.onLoadEndListener) {
                this.onLoadEndListener(route);
            }
            /** @type {?} */
            const module = factory.create(parentInjector);
            return new LoadedRouterConfig(flatten(module.injector.get(ROUTES)).map(standardizeConfig), module);
        })));
    }
    /**
     * @private
     * @param {?} loadChildren
     * @return {?}
     */
    loadModuleFactory(loadChildren) {
        if (typeof loadChildren === 'string') {
            return from(this.loader.load(loadChildren));
        }
        else {
            return wrapIntoObservable(loadChildren()).pipe(mergeMap((/**
             * @param {?} t
             * @return {?}
             */
            (t) => {
                if (t instanceof NgModuleFactory) {
                    return of(t);
                }
                else {
                    return from(this.compiler.compileModuleAsync(t));
                }
            })));
        }
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    RouterConfigLoader.prototype.loader;
    /**
     * @type {?}
     * @private
     */
    RouterConfigLoader.prototype.compiler;
    /**
     * @type {?}
     * @private
     */
    RouterConfigLoader.prototype.onLoadStartListener;
    /**
     * @type {?}
     * @private
     */
    RouterConfigLoader.prototype.onLoadEndListener;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2NvbmZpZ19sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9yb3V0ZXIvc3JjL3JvdXRlcl9jb25maWdfbG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBVyxjQUFjLEVBQVksZUFBZSxFQUF3QixNQUFNLGVBQWUsQ0FBQztBQUN6RyxPQUFPLEVBQWEsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMzQyxPQUFPLEVBQUMsR0FBRyxFQUFFLFFBQVEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzdDLE9BQU8sRUFBZSxrQkFBa0IsRUFBUyxpQkFBaUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNwRixPQUFPLEVBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7Ozs7Ozs7QUFPL0QsTUFBTSxPQUFPLE1BQU0sR0FBRyxJQUFJLGNBQWMsQ0FBWSxRQUFRLENBQUM7QUFFN0QsTUFBTSxPQUFPLGtCQUFrQjs7Ozs7OztJQUM3QixZQUNZLE1BQTZCLEVBQVUsUUFBa0IsRUFDekQsbUJBQXdDLEVBQ3hDLGlCQUFzQztRQUZ0QyxXQUFNLEdBQU4sTUFBTSxDQUF1QjtRQUFVLGFBQVEsR0FBUixRQUFRLENBQVU7UUFDekQsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUN4QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQXFCO0lBQUcsQ0FBQzs7Ozs7O0lBRXRELElBQUksQ0FBQyxjQUF3QixFQUFFLEtBQVk7UUFDekMsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDNUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2pDOztjQUVLLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsbUJBQUEsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRW5FLE9BQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHOzs7O1FBQUMsQ0FBQyxPQUE2QixFQUFFLEVBQUU7WUFDL0QsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMvQjs7a0JBRUssTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDO1lBRTdDLE9BQU8sSUFBSSxrQkFBa0IsQ0FDekIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDM0UsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUNOLENBQUM7Ozs7OztJQUVPLGlCQUFpQixDQUFDLFlBQTBCO1FBQ2xELElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFO1lBQ3BDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7U0FDN0M7YUFBTTtZQUNMLE9BQU8sa0JBQWtCLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUTs7OztZQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUU7Z0JBQ2pFLElBQUksQ0FBQyxZQUFZLGVBQWUsRUFBRTtvQkFDaEMsT0FBTyxFQUFFLENBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ2Y7cUJBQU07b0JBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNsRDtZQUNILENBQUMsRUFBQyxDQUFDLENBQUM7U0FDTDtJQUNILENBQUM7Q0FDRjs7Ozs7O0lBcENLLG9DQUFxQzs7Ozs7SUFBRSxzQ0FBMEI7Ozs7O0lBQ2pFLGlEQUFnRDs7Ozs7SUFDaEQsK0NBQThDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVyLCBJbmplY3Rpb25Ub2tlbiwgSW5qZWN0b3IsIE5nTW9kdWxlRmFjdG9yeSwgTmdNb2R1bGVGYWN0b3J5TG9hZGVyfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgZnJvbSwgb2YgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7bWFwLCBtZXJnZU1hcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtMb2FkQ2hpbGRyZW4sIExvYWRlZFJvdXRlckNvbmZpZywgUm91dGUsIHN0YW5kYXJkaXplQ29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge2ZsYXR0ZW4sIHdyYXBJbnRvT2JzZXJ2YWJsZX0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBUaGUgW0RJIHRva2VuXShndWlkZS9nbG9zc2FyeS8jZGktdG9rZW4pIGZvciBhIHJvdXRlciBjb25maWd1cmF0aW9uLlxuICogQHNlZSBgUk9VVEVTYFxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgUk9VVEVTID0gbmV3IEluamVjdGlvblRva2VuPFJvdXRlW11bXT4oJ1JPVVRFUycpO1xuXG5leHBvcnQgY2xhc3MgUm91dGVyQ29uZmlnTG9hZGVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGxvYWRlcjogTmdNb2R1bGVGYWN0b3J5TG9hZGVyLCBwcml2YXRlIGNvbXBpbGVyOiBDb21waWxlcixcbiAgICAgIHByaXZhdGUgb25Mb2FkU3RhcnRMaXN0ZW5lcj86IChyOiBSb3V0ZSkgPT4gdm9pZCxcbiAgICAgIHByaXZhdGUgb25Mb2FkRW5kTGlzdGVuZXI/OiAocjogUm91dGUpID0+IHZvaWQpIHt9XG5cbiAgbG9hZChwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsIHJvdXRlOiBSb3V0ZSk6IE9ic2VydmFibGU8TG9hZGVkUm91dGVyQ29uZmlnPiB7XG4gICAgaWYgKHRoaXMub25Mb2FkU3RhcnRMaXN0ZW5lcikge1xuICAgICAgdGhpcy5vbkxvYWRTdGFydExpc3RlbmVyKHJvdXRlKTtcbiAgICB9XG5cbiAgICBjb25zdCBtb2R1bGVGYWN0b3J5JCA9IHRoaXMubG9hZE1vZHVsZUZhY3Rvcnkocm91dGUubG9hZENoaWxkcmVuICEpO1xuXG4gICAgcmV0dXJuIG1vZHVsZUZhY3RvcnkkLnBpcGUobWFwKChmYWN0b3J5OiBOZ01vZHVsZUZhY3Rvcnk8YW55PikgPT4ge1xuICAgICAgaWYgKHRoaXMub25Mb2FkRW5kTGlzdGVuZXIpIHtcbiAgICAgICAgdGhpcy5vbkxvYWRFbmRMaXN0ZW5lcihyb3V0ZSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1vZHVsZSA9IGZhY3RvcnkuY3JlYXRlKHBhcmVudEluamVjdG9yKTtcblxuICAgICAgcmV0dXJuIG5ldyBMb2FkZWRSb3V0ZXJDb25maWcoXG4gICAgICAgICAgZmxhdHRlbihtb2R1bGUuaW5qZWN0b3IuZ2V0KFJPVVRFUykpLm1hcChzdGFuZGFyZGl6ZUNvbmZpZyksIG1vZHVsZSk7XG4gICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBsb2FkTW9kdWxlRmFjdG9yeShsb2FkQ2hpbGRyZW46IExvYWRDaGlsZHJlbik6IE9ic2VydmFibGU8TmdNb2R1bGVGYWN0b3J5PGFueT4+IHtcbiAgICBpZiAodHlwZW9mIGxvYWRDaGlsZHJlbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBmcm9tKHRoaXMubG9hZGVyLmxvYWQobG9hZENoaWxkcmVuKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB3cmFwSW50b09ic2VydmFibGUobG9hZENoaWxkcmVuKCkpLnBpcGUobWVyZ2VNYXAoKHQ6IGFueSkgPT4ge1xuICAgICAgICBpZiAodCBpbnN0YW5jZW9mIE5nTW9kdWxlRmFjdG9yeSkge1xuICAgICAgICAgIHJldHVybiBvZiAodCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZyb20odGhpcy5jb21waWxlci5jb21waWxlTW9kdWxlQXN5bmModCkpO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfVxuICB9XG59XG4iXX0=