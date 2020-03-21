/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata, __values } from "tslib";
import { Location, LocationStrategy } from '@angular/common';
import { MockLocationStrategy, SpyLocation } from '@angular/common/testing';
import { Compiler, Injectable, Injector, NgModule, NgModuleFactoryLoader, Optional } from '@angular/core';
import { ChildrenOutletContexts, NoPreloading, PreloadingStrategy, ROUTER_CONFIGURATION, ROUTES, Router, RouterModule, UrlHandlingStrategy, UrlSerializer, provideRoutes, ɵROUTER_PROVIDERS as ROUTER_PROVIDERS, ɵflatten as flatten } from '@angular/router';
/**
 * @description
 *
 * Allows to simulate the loading of ng modules in tests.
 *
 * ```
 * const loader = TestBed.inject(NgModuleFactoryLoader);
 *
 * @Component({template: 'lazy-loaded'})
 * class LazyLoadedComponent {}
 * @NgModule({
 *   declarations: [LazyLoadedComponent],
 *   imports: [RouterModule.forChild([{path: 'loaded', component: LazyLoadedComponent}])]
 * })
 *
 * class LoadedModule {}
 *
 * // sets up stubbedModules
 * loader.stubbedModules = {lazyModule: LoadedModule};
 *
 * router.resetConfig([
 *   {path: 'lazy', loadChildren: 'lazyModule'},
 * ]);
 *
 * router.navigateByUrl('/lazy/loaded');
 * ```
 *
 * @publicApi
 */
var SpyNgModuleFactoryLoader = /** @class */ (function () {
    function SpyNgModuleFactoryLoader(compiler) {
        this.compiler = compiler;
        /**
         * @docsNotRequired
         */
        this._stubbedModules = {};
    }
    Object.defineProperty(SpyNgModuleFactoryLoader.prototype, "stubbedModules", {
        /**
         * @docsNotRequired
         */
        get: function () { return this._stubbedModules; },
        /**
         * @docsNotRequired
         */
        set: function (modules) {
            var e_1, _a;
            var res = {};
            try {
                for (var _b = __values(Object.keys(modules)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var t = _c.value;
                    res[t] = this.compiler.compileModuleAsync(modules[t]);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this._stubbedModules = res;
        },
        enumerable: true,
        configurable: true
    });
    SpyNgModuleFactoryLoader.prototype.load = function (path) {
        if (this._stubbedModules[path]) {
            return this._stubbedModules[path];
        }
        else {
            return Promise.reject(new Error("Cannot find module " + path));
        }
    };
    SpyNgModuleFactoryLoader = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Compiler])
    ], SpyNgModuleFactoryLoader);
    return SpyNgModuleFactoryLoader;
}());
export { SpyNgModuleFactoryLoader };
function isUrlHandlingStrategy(opts) {
    // This property check is needed because UrlHandlingStrategy is an interface and doesn't exist at
    // runtime.
    return 'shouldProcessUrl' in opts;
}
/**
 * Router setup factory function used for testing.
 *
 * @publicApi
 */
export function setupTestingRouter(urlSerializer, contexts, location, loader, compiler, injector, routes, opts, urlHandlingStrategy) {
    var router = new Router(null, urlSerializer, contexts, location, injector, loader, compiler, flatten(routes));
    if (opts) {
        // Handle deprecated argument ordering.
        if (isUrlHandlingStrategy(opts)) {
            router.urlHandlingStrategy = opts;
        }
        else {
            // Handle ExtraOptions
            if (opts.malformedUriErrorHandler) {
                router.malformedUriErrorHandler = opts.malformedUriErrorHandler;
            }
            if (opts.paramsInheritanceStrategy) {
                router.paramsInheritanceStrategy = opts.paramsInheritanceStrategy;
            }
        }
    }
    if (urlHandlingStrategy) {
        router.urlHandlingStrategy = urlHandlingStrategy;
    }
    return router;
}
/**
 * @description
 *
 * Sets up the router to be used for testing.
 *
 * The modules sets up the router to be used for testing.
 * It provides spy implementations of `Location`, `LocationStrategy`, and {@link
 * NgModuleFactoryLoader}.
 *
 * @usageNotes
 * ### Example
 *
 * ```
 * beforeEach(() => {
 *   TestBed.configureTestModule({
 *     imports: [
 *       RouterTestingModule.withRoutes(
 *         [{path: '', component: BlankCmp}, {path: 'simple', component: SimpleCmp}]
 *       )
 *     ]
 *   });
 * });
 * ```
 *
 * @publicApi
 */
var RouterTestingModule = /** @class */ (function () {
    function RouterTestingModule() {
    }
    RouterTestingModule_1 = RouterTestingModule;
    RouterTestingModule.withRoutes = function (routes, config) {
        return {
            ngModule: RouterTestingModule_1,
            providers: [
                provideRoutes(routes),
                { provide: ROUTER_CONFIGURATION, useValue: config ? config : {} },
            ]
        };
    };
    var RouterTestingModule_1;
    RouterTestingModule = RouterTestingModule_1 = __decorate([
        NgModule({
            exports: [RouterModule],
            providers: [
                ROUTER_PROVIDERS, { provide: Location, useClass: SpyLocation },
                { provide: LocationStrategy, useClass: MockLocationStrategy },
                { provide: NgModuleFactoryLoader, useClass: SpyNgModuleFactoryLoader }, {
                    provide: Router,
                    useFactory: setupTestingRouter,
                    deps: [
                        UrlSerializer, ChildrenOutletContexts, Location, NgModuleFactoryLoader, Compiler, Injector,
                        ROUTES, ROUTER_CONFIGURATION, [UrlHandlingStrategy, new Optional()]
                    ]
                },
                { provide: PreloadingStrategy, useExisting: NoPreloading }, provideRoutes([])
            ]
        })
    ], RouterTestingModule);
    return RouterTestingModule;
}());
export { RouterTestingModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX3Rlc3RpbmdfbW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3Rlc3Rpbmcvc3JjL3JvdXRlcl90ZXN0aW5nX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzNELE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxXQUFXLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUMxRSxPQUFPLEVBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQXVCLFFBQVEsRUFBbUIscUJBQXFCLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzlJLE9BQU8sRUFBQyxzQkFBc0IsRUFBZ0IsWUFBWSxFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLE1BQU0sRUFBUyxNQUFNLEVBQUUsWUFBWSxFQUFVLG1CQUFtQixFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsaUJBQWlCLElBQUksZ0JBQWdCLEVBQUUsUUFBUSxJQUFJLE9BQU8sRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBSXpSOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNEJHO0FBRUg7SUFzQkUsa0NBQW9CLFFBQWtCO1FBQWxCLGFBQVEsR0FBUixRQUFRLENBQVU7UUFyQnRDOztXQUVHO1FBQ0ssb0JBQWUsR0FBb0QsRUFBRSxDQUFDO0lBa0JyQyxDQUFDO0lBYjFDLHNCQUFJLG9EQUFjO1FBUWxCOztXQUVHO2FBQ0gsY0FBOEMsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQWQ1RTs7V0FFRzthQUNILFVBQW1CLE9BQThCOztZQUMvQyxJQUFNLEdBQUcsR0FBMEIsRUFBRSxDQUFDOztnQkFDdEMsS0FBZ0IsSUFBQSxLQUFBLFNBQUEs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QU8sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsb0JBQW9CLEVBQUM7Z0JBQzNELEVBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFFBQVEsRUFBRSx3QkFBd0IsRUFBQyxFQUFFO29CQUNwRSxPQUFPLEVBQUUsTUFBTTtvQkFDZixVQUFVLEVBQUUsa0JBQWtCO29CQUM5QixJQUFJLEVBQUU7d0JBQ0osYUFBYSxFQUFFLHNCQUFzQixFQUFFLFFBQVEsRUFBRSxxQkFBcUIsRUFBRSxRQUFRLEVBQUUsUUFBUTt3QkFDMUYsTUFBTSxFQUFFLG9CQUFvQixFQUFFLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxRQUFRLEVBQUUsQ0FBQztxQkFDcEU7aUJBQ0Y7Z0JBQ0QsRUFBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBQyxFQUFFLGFBQWEsQ0FBQyxFQUFFLENBQUM7YUFDNUU7U0FDRixDQUFDO09BQ1csbUJBQW1CLENBVy9CO0lBQUQsMEJBQUM7Q0FBQSxBQVhELElBV0M7U0FYWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TG9jYXRpb24sIExvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge01vY2tMb2NhdGlvblN0cmF0ZWd5LCBTcHlMb2NhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL3Rlc3RpbmcnO1xuaW1wb3J0IHtDb21waWxlciwgSW5qZWN0YWJsZSwgSW5qZWN0b3IsIE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlLCBOZ01vZHVsZUZhY3RvcnksIE5nTW9kdWxlRmFjdG9yeUxvYWRlciwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDaGlsZHJlbk91dGxldENvbnRleHRzLCBFeHRyYU9wdGlvbnMsIE5vUHJlbG9hZGluZywgUHJlbG9hZGluZ1N0cmF0ZWd5LCBST1VURVJfQ09ORklHVVJBVElPTiwgUk9VVEVTLCBSb3V0ZSwgUm91dGVyLCBSb3V0ZXJNb2R1bGUsIFJvdXRlcywgVXJsSGFuZGxpbmdTdHJhdGVneSwgVXJsU2VyaWFsaXplciwgcHJvdmlkZVJvdXRlcywgybVST1VURVJfUFJPVklERVJTIGFzIFJPVVRFUl9QUk9WSURFUlMsIMm1ZmxhdHRlbiBhcyBmbGF0dGVufSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBbGxvd3MgdG8gc2ltdWxhdGUgdGhlIGxvYWRpbmcgb2YgbmcgbW9kdWxlcyBpbiB0ZXN0cy5cbiAqXG4gKiBgYGBcbiAqIGNvbnN0IGxvYWRlciA9IFRlc3RCZWQuaW5qZWN0KE5nTW9kdWxlRmFjdG9yeUxvYWRlcik7XG4gKlxuICogQENvbXBvbmVudCh7dGVtcGxhdGU6ICdsYXp5LWxvYWRlZCd9KVxuICogY2xhc3MgTGF6eUxvYWRlZENvbXBvbmVudCB7fVxuICogQE5nTW9kdWxlKHtcbiAqICAgZGVjbGFyYXRpb25zOiBbTGF6eUxvYWRlZENvbXBvbmVudF0sXG4gKiAgIGltcG9ydHM6IFtSb3V0ZXJNb2R1bGUuZm9yQ2hpbGQoW3twYXRoOiAnbG9hZGVkJywgY29tcG9uZW50OiBMYXp5TG9hZGVkQ29tcG9uZW50fV0pXVxuICogfSlcbiAqXG4gKiBjbGFzcyBMb2FkZWRNb2R1bGUge31cbiAqXG4gKiAvLyBzZXRzIHVwIHN0dWJiZWRNb2R1bGVzXG4gKiBsb2FkZXIuc3R1YmJlZE1vZHVsZXMgPSB7bGF6eU1vZHVsZTogTG9hZGVkTW9kdWxlfTtcbiAqXG4gKiByb3V0ZXIucmVzZXRDb25maWcoW1xuICogICB7cGF0aDogJ2xhenknLCBsb2FkQ2hpbGRyZW46ICdsYXp5TW9kdWxlJ30sXG4gKiBdKTtcbiAqXG4gKiByb3V0ZXIubmF2aWdhdGVCeVVybCgnL2xhenkvbG9hZGVkJyk7XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTcHlOZ01vZHVsZUZhY3RvcnlMb2FkZXIgaW1wbGVtZW50cyBOZ01vZHVsZUZhY3RvcnlMb2FkZXIge1xuICAvKipcbiAgICogQGRvY3NOb3RSZXF1aXJlZFxuICAgKi9cbiAgcHJpdmF0ZSBfc3R1YmJlZE1vZHVsZXM6IHtbcGF0aDogc3RyaW5nXTogUHJvbWlzZTxOZ01vZHVsZUZhY3Rvcnk8YW55Pj59ID0ge307XG5cbiAgLyoqXG4gICAqIEBkb2NzTm90UmVxdWlyZWRcbiAgICovXG4gIHNldCBzdHViYmVkTW9kdWxlcyhtb2R1bGVzOiB7W3BhdGg6IHN0cmluZ106IGFueX0pIHtcbiAgICBjb25zdCByZXM6IHtbcGF0aDogc3RyaW5nXTogYW55fSA9IHt9O1xuICAgIGZvciAoY29uc3QgdCBvZiBPYmplY3Qua2V5cyhtb2R1bGVzKSkge1xuICAgICAgcmVzW3RdID0gdGhpcy5jb21waWxlci5jb21waWxlTW9kdWxlQXN5bmMobW9kdWxlc1t0XSk7XG4gICAgfVxuICAgIHRoaXMuX3N0dWJiZWRNb2R1bGVzID0gcmVzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkb2NzTm90UmVxdWlyZWRcbiAgICovXG4gIGdldCBzdHViYmVkTW9kdWxlcygpOiB7W3BhdGg6IHN0cmluZ106IGFueX0geyByZXR1cm4gdGhpcy5fc3R1YmJlZE1vZHVsZXM7IH1cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNvbXBpbGVyOiBDb21waWxlcikge31cblxuICBsb2FkKHBhdGg6IHN0cmluZyk6IFByb21pc2U8TmdNb2R1bGVGYWN0b3J5PGFueT4+IHtcbiAgICBpZiAodGhpcy5fc3R1YmJlZE1vZHVsZXNbcGF0aF0pIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdHViYmVkTW9kdWxlc1twYXRoXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDxhbnk+UHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGBDYW5ub3QgZmluZCBtb2R1bGUgJHtwYXRofWApKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNVcmxIYW5kbGluZ1N0cmF0ZWd5KG9wdHM6IEV4dHJhT3B0aW9ucyB8IFVybEhhbmRsaW5nU3RyYXRlZ3kpOlxuICAgIG9wdHMgaXMgVXJsSGFuZGxpbmdTdHJhdGVneSB7XG4gIC8vIFRoaXMgcHJvcGVydHkgY2hlY2sgaXMgbmVlZGVkIGJlY2F1c2UgVXJsSGFuZGxpbmdTdHJhdGVneSBpcyBhbiBpbnRlcmZhY2UgYW5kIGRvZXNuJ3QgZXhpc3QgYXRcbiAgLy8gcnVudGltZS5cbiAgcmV0dXJuICdzaG91bGRQcm9jZXNzVXJsJyBpbiBvcHRzO1xufVxuXG4vKipcbiAqIFJvdXRlciBzZXR1cCBmYWN0b3J5IGZ1bmN0aW9uIHVzZWQgZm9yIHRlc3RpbmcuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBUZXN0aW5nUm91dGVyKFxuICAgIHVybFNlcmlhbGl6ZXI6IFVybFNlcmlhbGl6ZXIsIGNvbnRleHRzOiBDaGlsZHJlbk91dGxldENvbnRleHRzLCBsb2NhdGlvbjogTG9jYXRpb24sXG4gICAgbG9hZGVyOiBOZ01vZHVsZUZhY3RvcnlMb2FkZXIsIGNvbXBpbGVyOiBDb21waWxlciwgaW5qZWN0b3I6IEluamVjdG9yLCByb3V0ZXM6IFJvdXRlW11bXSxcbiAgICBvcHRzPzogRXh0cmFPcHRpb25zLCB1cmxIYW5kbGluZ1N0cmF0ZWd5PzogVXJsSGFuZGxpbmdTdHJhdGVneSk6IFJvdXRlcjtcblxuLyoqXG4gKiBSb3V0ZXIgc2V0dXAgZmFjdG9yeSBmdW5jdGlvbiB1c2VkIGZvciB0ZXN0aW5nLlxuICpcbiAqIEBkZXByZWNhdGVkIEFzIG9mIHY1LjIuIFRoZSAybmQtdG8tbGFzdCBhcmd1bWVudCBzaG91bGQgYmUgYEV4dHJhT3B0aW9uc2AsIG5vdFxuICogYFVybEhhbmRsaW5nU3RyYXRlZ3lgXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cFRlc3RpbmdSb3V0ZXIoXG4gICAgdXJsU2VyaWFsaXplcjogVXJsU2VyaWFsaXplciwgY29udGV4dHM6IENoaWxkcmVuT3V0bGV0Q29udGV4dHMsIGxvY2F0aW9uOiBMb2NhdGlvbixcbiAgICBsb2FkZXI6IE5nTW9kdWxlRmFjdG9yeUxvYWRlciwgY29tcGlsZXI6IENvbXBpbGVyLCBpbmplY3RvcjogSW5qZWN0b3IsIHJvdXRlczogUm91dGVbXVtdLFxuICAgIHVybEhhbmRsaW5nU3RyYXRlZ3k/OiBVcmxIYW5kbGluZ1N0cmF0ZWd5KTogUm91dGVyO1xuXG4vKipcbiAqIFJvdXRlciBzZXR1cCBmYWN0b3J5IGZ1bmN0aW9uIHVzZWQgZm9yIHRlc3RpbmcuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBUZXN0aW5nUm91dGVyKFxuICAgIHVybFNlcmlhbGl6ZXI6IFVybFNlcmlhbGl6ZXIsIGNvbnRleHRzOiBDaGlsZHJlbk91dGxldENvbnRleHRzLCBsb2NhdGlvbjogTG9jYXRpb24sXG4gICAgbG9hZGVyOiBOZ01vZHVsZUZhY3RvcnlMb2FkZXIsIGNvbXBpbGVyOiBDb21waWxlciwgaW5qZWN0b3I6IEluamVjdG9yLCByb3V0ZXM6IFJvdXRlW11bXSxcbiAgICBvcHRzPzogRXh0cmFPcHRpb25zIHwgVXJsSGFuZGxpbmdTdHJhdGVneSwgdXJsSGFuZGxpbmdTdHJhdGVneT86IFVybEhhbmRsaW5nU3RyYXRlZ3kpIHtcbiAgY29uc3Qgcm91dGVyID0gbmV3IFJvdXRlcihcbiAgICAgIG51bGwgISwgdXJsU2VyaWFsaXplciwgY29udGV4dHMsIGxvY2F0aW9uLCBpbmplY3RvciwgbG9hZGVyLCBjb21waWxlciwgZmxhdHRlbihyb3V0ZXMpKTtcbiAgaWYgKG9wdHMpIHtcbiAgICAvLyBIYW5kbGUgZGVwcmVjYXRlZCBhcmd1bWVudCBvcmRlcmluZy5cbiAgICBpZiAoaXNVcmxIYW5kbGluZ1N0cmF0ZWd5KG9wdHMpKSB7XG4gICAgICByb3V0ZXIudXJsSGFuZGxpbmdTdHJhdGVneSA9IG9wdHM7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEhhbmRsZSBFeHRyYU9wdGlvbnNcblxuICAgICAgaWYgKG9wdHMubWFsZm9ybWVkVXJpRXJyb3JIYW5kbGVyKSB7XG4gICAgICAgIHJvdXRlci5tYWxmb3JtZWRVcmlFcnJvckhhbmRsZXIgPSBvcHRzLm1hbGZvcm1lZFVyaUVycm9ySGFuZGxlcjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdHMucGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSkge1xuICAgICAgICByb3V0ZXIucGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSA9IG9wdHMucGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAodXJsSGFuZGxpbmdTdHJhdGVneSkge1xuICAgIHJvdXRlci51cmxIYW5kbGluZ1N0cmF0ZWd5ID0gdXJsSGFuZGxpbmdTdHJhdGVneTtcbiAgfVxuICByZXR1cm4gcm91dGVyO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFNldHMgdXAgdGhlIHJvdXRlciB0byBiZSB1c2VkIGZvciB0ZXN0aW5nLlxuICpcbiAqIFRoZSBtb2R1bGVzIHNldHMgdXAgdGhlIHJvdXRlciB0byBiZSB1c2VkIGZvciB0ZXN0aW5nLlxuICogSXQgcHJvdmlkZXMgc3B5IGltcGxlbWVudGF0aW9ucyBvZiBgTG9jYXRpb25gLCBgTG9jYXRpb25TdHJhdGVneWAsIGFuZCB7QGxpbmtcbiAqIE5nTW9kdWxlRmFjdG9yeUxvYWRlcn0uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBiZWZvcmVFYWNoKCgpID0+IHtcbiAqICAgVGVzdEJlZC5jb25maWd1cmVUZXN0TW9kdWxlKHtcbiAqICAgICBpbXBvcnRzOiBbXG4gKiAgICAgICBSb3V0ZXJUZXN0aW5nTW9kdWxlLndpdGhSb3V0ZXMoXG4gKiAgICAgICAgIFt7cGF0aDogJycsIGNvbXBvbmVudDogQmxhbmtDbXB9LCB7cGF0aDogJ3NpbXBsZScsIGNvbXBvbmVudDogU2ltcGxlQ21wfV1cbiAqICAgICAgIClcbiAqICAgICBdXG4gKiAgIH0pO1xuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7XG4gIGV4cG9ydHM6IFtSb3V0ZXJNb2R1bGVdLFxuICBwcm92aWRlcnM6IFtcbiAgICBST1VURVJfUFJPVklERVJTLCB7cHJvdmlkZTogTG9jYXRpb24sIHVzZUNsYXNzOiBTcHlMb2NhdGlvbn0sXG4gICAge3Byb3ZpZGU6IExvY2F0aW9uU3RyYXRlZ3ksIHVzZUNsYXNzOiBNb2NrTG9jYXRpb25TdHJhdGVneX0sXG4gICAge3Byb3ZpZGU6IE5nTW9kdWxlRmFjdG9yeUxvYWRlciwgdXNlQ2xhc3M6IFNweU5nTW9kdWxlRmFjdG9yeUxvYWRlcn0sIHtcbiAgICAgIHByb3ZpZGU6IFJvdXRlcixcbiAgICAgIHVzZUZhY3Rvcnk6IHNldHVwVGVzdGluZ1JvdXRlcixcbiAgICAgIGRlcHM6IFtcbiAgICAgICAgVXJsU2VyaWFsaXplciwgQ2hpbGRyZW5PdXRsZXRDb250ZXh0cywgTG9jYXRpb24sIE5nTW9kdWxlRmFjdG9yeUxvYWRlciwgQ29tcGlsZXIsIEluamVjdG9yLFxuICAgICAgICBST1VURVMsIFJPVVRFUl9DT05GSUdVUkFUSU9OLCBbVXJsSGFuZGxpbmdTdHJhdGVneSwgbmV3IE9wdGlvbmFsKCldXG4gICAgICBdXG4gICAgfSxcbiAgICB7cHJvdmlkZTogUHJlbG9hZGluZ1N0cmF0ZWd5LCB1c2VFeGlzdGluZzogTm9QcmVsb2FkaW5nfSwgcHJvdmlkZVJvdXRlcyhbXSlcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJUZXN0aW5nTW9kdWxlIHtcbiAgc3RhdGljIHdpdGhSb3V0ZXMocm91dGVzOiBSb3V0ZXMsIGNvbmZpZz86IEV4dHJhT3B0aW9ucyk6XG4gICAgICBNb2R1bGVXaXRoUHJvdmlkZXJzPFJvdXRlclRlc3RpbmdNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IFJvdXRlclRlc3RpbmdNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZVJvdXRlcyhyb3V0ZXMpLFxuICAgICAgICB7cHJvdmlkZTogUk9VVEVSX0NPTkZJR1VSQVRJT04sIHVzZVZhbHVlOiBjb25maWcgPyBjb25maWcgOiB7fX0sXG4gICAgICBdXG4gICAgfTtcbiAgfVxufVxuIl19