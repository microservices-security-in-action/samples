/**
 * @fileoverview added by tsickle
 * Generated from: packages/router/src/config.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EmptyOutletComponent } from './components/empty_outlet';
import { PRIMARY_OUTLET } from './shared';
/**
 * A configuration object that defines a single route.
 * A set of routes are collected in a `Routes` array to define a `Router` configuration.
 * The router attempts to match segments of a given URL against each route,
 * using the configuration options defined in this object.
 *
 * Supports static, parameterized, redirect, and wildcard routes, as well as
 * custom route data and resolve methods.
 *
 * For detailed usage information, see the [Routing Guide](guide/router).
 *
 * \@usageNotes
 *
 * ### Simple Configuration
 *
 * The following route specifies that when navigating to, for example,
 * `/team/11/user/bob`, the router creates the 'Team' component
 * with the 'User' child component in it.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *  component: Team,
 *   children: [{
 *     path: 'user/:name',
 *     component: User
 *   }]
 * }]
 * ```
 *
 * ### Multiple Outlets
 *
 * The following route creates sibling components with multiple outlets.
 * When navigating to `/team/11(aux:chat/jim)`, the router creates the 'Team' component next to
 * the 'Chat' component. The 'Chat' component is placed into the 'aux' outlet.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team
 * }, {
 *   path: 'chat/:user',
 *   component: Chat
 *   outlet: 'aux'
 * }]
 * ```
 *
 * ### Wild Cards
 *
 * The following route uses wild-card notation to specify a component
 * that is always instantiated regardless of where you navigate to.
 *
 * ```
 * [{
 *   path: '**',
 *   component: WildcardComponent
 * }]
 * ```
 *
 * ### Redirects
 *
 * The following route uses the `redirectTo` property to ignore a segment of
 * a given URL when looking for a child path.
 *
 * When navigating to '/team/11/legacy/user/jim', the router changes the URL segment
 * '/team/11/legacy/user/jim' to '/team/11/user/jim', and then instantiates
 * the Team component with the User child component in it.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   children: [{
 *     path: 'legacy/user/:name',
 *     redirectTo: 'user/:name'
 *   }, {
 *     path: 'user/:name',
 *     component: User
 *   }]
 * }]
 * ```
 *
 * The redirect path can be relative, as shown in this example, or absolute.
 * If we change the `redirectTo` value in the example to the absolute URL segment '/user/:name',
 * the result URL is also absolute, '/user/jim'.
 * ### Empty Path
 *
 * Empty-path route configurations can be used to instantiate components that do not 'consume'
 * any URL segments.
 *
 * In the following configuration, when navigating to
 * `/team/11`, the router instantiates the 'AllUsers' component.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   children: [{
 *     path: '',
 *     component: AllUsers
 *   }, {
 *     path: 'user/:name',
 *     component: User
 *   }]
 * }]
 * ```
 *
 * Empty-path routes can have children. In the following example, when navigating
 * to `/team/11/user/jim`, the router instantiates the wrapper component with
 * the user component in it.
 *
 * Note that an empty path route inherits its parent's parameters and data.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   children: [{
 *     path: '',
 *     component: WrapperCmp,
 *     children: [{
 *       path: 'user/:name',
 *       component: User
 *     }]
 *   }]
 * }]
 * ```
 *
 * ### Matching Strategy
 *
 * The default path-match strategy is 'prefix', which means that the router
 * checks URL elements from the left to see if the URL matches a specified path.
 * For example, '/team/11/user' matches 'team/:id'.
 *
 * ```
 * [{
 *   path: '',
 *   pathMatch: 'prefix', //default
 *   redirectTo: 'main'
 * }, {
 *   path: 'main',
 *   component: Main
 * }]
 * ```
 *
 * You can specify the path-match strategy 'full' to make sure that the path
 * covers the whole unconsumed URL. It is important to do this when redirecting
 * empty-path routes. Otherwise, because an empty path is a prefix of any URL,
 * the router would apply the redirect even when navigating to the redirect destination,
 * creating an endless loop.
 *
 * In the following example, supplying the 'full' `pathMatch` strategy ensures
 * that the router applies the redirect if and only if navigating to '/'.
 *
 * ```
 * [{
 *   path: '',
 *   pathMatch: 'full',
 *   redirectTo: 'main'
 * }, {
 *   path: 'main',
 *   component: Main
 * }]
 * ```
 *
 * ### Componentless Routes
 *
 * You can share parameters between sibling components.
 * For example, suppose that two sibling components should go next to each other,
 * and both of them require an ID parameter. You can accomplish this using a route
 * that does not specify a component at the top level.
 *
 * In the following example, 'MainChild' and 'AuxChild' are siblings.
 * When navigating to 'parent/10/(a//aux:b)', the route instantiates
 * the main child and aux child components next to each other.
 * For this to work, the application component must have the primary and aux outlets defined.
 *
 * ```
 * [{
 *    path: 'parent/:id',
 *    children: [
 *      { path: 'a', component: MainChild },
 *      { path: 'b', component: AuxChild, outlet: 'aux' }
 *    ]
 * }]
 * ```
 *
 * The router merges the parameters, data, and resolve of the componentless
 * parent into the parameters, data, and resolve of the children.
 *
 * This is especially useful when child components are defined
 * with an empty path string, as in the following example.
 * With this configuration, navigating to '/parent/10' creates
 * the main child and aux components.
 *
 * ```
 * [{
 *    path: 'parent/:id',
 *    children: [
 *      { path: '', component: MainChild },
 *      { path: '', component: AuxChild, outlet: 'aux' }
 *    ]
 * }]
 * ```
 *
 * ### Lazy Loading
 *
 * Lazy loading speeds up application load time by splitting the application
 * into multiple bundles and loading them on demand.
 * To use lazy loading, provide the `loadChildren` property  instead of the `children` property.
 *
 * Given the following example route, the router will lazy load
 * the associated module on demand using the browser native import system.
 *
 * ```
 * [{
 *   path: 'lazy',
 *   loadChildren: () => import('./lazy-route/lazy.module').then(mod => mod.LazyModule),
 * }];
 * ```
 *
 * \@publicApi
 * @record
 */
export function Route() { }
if (false) {
    /**
     * The path to match against. Cannot be used together with a custom `matcher` function.
     * A URL string that uses router matching notation.
     * Can be a wild card (`**`) that matches any URL (see Usage Notes below).
     * Default is "/" (the root path).
     *
     * @type {?|undefined}
     */
    Route.prototype.path;
    /**
     * The path-matching strategy, one of 'prefix' or 'full'.
     * Default is 'prefix'.
     *
     * By default, the router checks URL elements from the left to see if the URL
     * matches a given  path, and stops when there is a match. For example,
     * '/team/11/user' matches 'team/:id'.
     *
     * The path-match strategy 'full' matches against the entire URL.
     * It is important to do this when redirecting empty-path routes.
     * Otherwise, because an empty path is a prefix of any URL,
     * the router would apply the redirect even when navigating
     * to the redirect destination, creating an endless loop.
     *
     * @type {?|undefined}
     */
    Route.prototype.pathMatch;
    /**
     * A custom URL-matching function. Cannot be used together with `path`.
     * @type {?|undefined}
     */
    Route.prototype.matcher;
    /**
     * The component to instantiate when the path matches.
     * Can be empty if child routes specify components.
     * @type {?|undefined}
     */
    Route.prototype.component;
    /**
     * A URL to which to redirect when a the path matches.
     * Absolute if the URL begins with a slash (/), otherwise relative to the path URL.
     * When not present, router does not redirect.
     * @type {?|undefined}
     */
    Route.prototype.redirectTo;
    /**
     * Name of a `RouterOutlet` object where the component can be placed
     * when the path matches.
     * @type {?|undefined}
     */
    Route.prototype.outlet;
    /**
     * An array of dependency-injection tokens used to look up `CanActivate()`
     * handlers, in order to determine if the current user is allowed to
     * activate the component. By default, any user can activate.
     * @type {?|undefined}
     */
    Route.prototype.canActivate;
    /**
     * An array of DI tokens used to look up `CanActivateChild()` handlers,
     * in order to determine if the current user is allowed to activate
     * a child of the component. By default, any user can activate a child.
     * @type {?|undefined}
     */
    Route.prototype.canActivateChild;
    /**
     * An array of DI tokens used to look up `CanDeactivate()`
     * handlers, in order to determine if the current user is allowed to
     * deactivate the component. By default, any user can deactivate.
     *
     * @type {?|undefined}
     */
    Route.prototype.canDeactivate;
    /**
     * An array of DI tokens used to look up `CanLoad()`
     * handlers, in order to determine if the current user is allowed to
     * load the component. By default, any user can load.
     * @type {?|undefined}
     */
    Route.prototype.canLoad;
    /**
     * Additional developer-defined data provided to the component via
     * `ActivatedRoute`. By default, no additional data is passed.
     * @type {?|undefined}
     */
    Route.prototype.data;
    /**
     * A map of DI tokens used to look up data resolvers. See `Resolve`.
     * @type {?|undefined}
     */
    Route.prototype.resolve;
    /**
     * An array of child `Route` objects that specifies a nested route
     * configuration.
     * @type {?|undefined}
     */
    Route.prototype.children;
    /**
     * A `LoadChildren` object specifying lazy-loaded child routes.
     * @type {?|undefined}
     */
    Route.prototype.loadChildren;
    /**
     * Defines when guards and resolvers will be run. One of
     * - `paramsOrQueryParamsChange` : Run when query parameters change.
     * - `always` : Run on every execution.
     * By default, guards and resolvers run only when the matrix
     * parameters of the route change.
     * @type {?|undefined}
     */
    Route.prototype.runGuardsAndResolvers;
    /**
     * Filled for routes with `loadChildren` once the module has been loaded
     * \@internal
     * @type {?|undefined}
     */
    Route.prototype._loadedConfig;
}
export class LoadedRouterConfig {
    /**
     * @param {?} routes
     * @param {?} module
     */
    constructor(routes, module) {
        this.routes = routes;
        this.module = module;
    }
}
if (false) {
    /** @type {?} */
    LoadedRouterConfig.prototype.routes;
    /** @type {?} */
    LoadedRouterConfig.prototype.module;
}
/**
 * @param {?} config
 * @param {?=} parentPath
 * @return {?}
 */
export function validateConfig(config, parentPath = '') {
    // forEach doesn't iterate undefined values
    for (let i = 0; i < config.length; i++) {
        /** @type {?} */
        const route = config[i];
        /** @type {?} */
        const fullPath = getFullPath(parentPath, route);
        validateNode(route, fullPath);
    }
}
/**
 * @param {?} route
 * @param {?} fullPath
 * @return {?}
 */
function validateNode(route, fullPath) {
    if (!route) {
        throw new Error(`
      Invalid configuration of route '${fullPath}': Encountered undefined route.
      The reason might be an extra comma.

      Example:
      const routes: Routes = [
        { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
        { path: 'dashboard',  component: DashboardComponent },, << two commas
        { path: 'detail/:id', component: HeroDetailComponent }
      ];
    `);
    }
    if (Array.isArray(route)) {
        throw new Error(`Invalid configuration of route '${fullPath}': Array cannot be specified`);
    }
    if (!route.component && !route.children && !route.loadChildren &&
        (route.outlet && route.outlet !== PRIMARY_OUTLET)) {
        throw new Error(`Invalid configuration of route '${fullPath}': a componentless route without children or loadChildren cannot have a named outlet set`);
    }
    if (route.redirectTo && route.children) {
        throw new Error(`Invalid configuration of route '${fullPath}': redirectTo and children cannot be used together`);
    }
    if (route.redirectTo && route.loadChildren) {
        throw new Error(`Invalid configuration of route '${fullPath}': redirectTo and loadChildren cannot be used together`);
    }
    if (route.children && route.loadChildren) {
        throw new Error(`Invalid configuration of route '${fullPath}': children and loadChildren cannot be used together`);
    }
    if (route.redirectTo && route.component) {
        throw new Error(`Invalid configuration of route '${fullPath}': redirectTo and component cannot be used together`);
    }
    if (route.path && route.matcher) {
        throw new Error(`Invalid configuration of route '${fullPath}': path and matcher cannot be used together`);
    }
    if (route.redirectTo === void 0 && !route.component && !route.children && !route.loadChildren) {
        throw new Error(`Invalid configuration of route '${fullPath}'. One of the following must be provided: component, redirectTo, children or loadChildren`);
    }
    if (route.path === void 0 && route.matcher === void 0) {
        throw new Error(`Invalid configuration of route '${fullPath}': routes must have either a path or a matcher specified`);
    }
    if (typeof route.path === 'string' && route.path.charAt(0) === '/') {
        throw new Error(`Invalid configuration of route '${fullPath}': path cannot start with a slash`);
    }
    if (route.path === '' && route.redirectTo !== void 0 && route.pathMatch === void 0) {
        /** @type {?} */
        const exp = `The default value of 'pathMatch' is 'prefix', but often the intent is to use 'full'.`;
        throw new Error(`Invalid configuration of route '{path: "${fullPath}", redirectTo: "${route.redirectTo}"}': please provide 'pathMatch'. ${exp}`);
    }
    if (route.pathMatch !== void 0 && route.pathMatch !== 'full' && route.pathMatch !== 'prefix') {
        throw new Error(`Invalid configuration of route '${fullPath}': pathMatch can only be set to 'prefix' or 'full'`);
    }
    if (route.children) {
        validateConfig(route.children, fullPath);
    }
}
/**
 * @param {?} parentPath
 * @param {?} currentRoute
 * @return {?}
 */
function getFullPath(parentPath, currentRoute) {
    if (!currentRoute) {
        return parentPath;
    }
    if (!parentPath && !currentRoute.path) {
        return '';
    }
    else if (parentPath && !currentRoute.path) {
        return `${parentPath}/`;
    }
    else if (!parentPath && currentRoute.path) {
        return currentRoute.path;
    }
    else {
        return `${parentPath}/${currentRoute.path}`;
    }
}
/**
 * Makes a copy of the config and adds any default required properties.
 * @param {?} r
 * @return {?}
 */
export function standardizeConfig(r) {
    /** @type {?} */
    const children = r.children && r.children.map(standardizeConfig);
    /** @type {?} */
    const c = children ? Object.assign(Object.assign({}, r), { children }) : Object.assign({}, r);
    if (!c.component && (children || c.loadChildren) && (c.outlet && c.outlet !== PRIMARY_OUTLET)) {
        c.component = EmptyOutletComponent;
    }
    return c;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBV0EsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFFL0QsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLFVBQVUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcVh4QywyQkFxR0M7Ozs7Ozs7Ozs7SUE3RkMscUJBQWM7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JkLDBCQUFtQjs7Ozs7SUFJbkIsd0JBQXFCOzs7Ozs7SUFLckIsMEJBQXNCOzs7Ozs7O0lBTXRCLDJCQUFvQjs7Ozs7O0lBS3BCLHVCQUFnQjs7Ozs7OztJQU1oQiw0QkFBb0I7Ozs7Ozs7SUFNcEIsaUNBQXlCOzs7Ozs7OztJQU96Qiw4QkFBc0I7Ozs7Ozs7SUFNdEIsd0JBQWdCOzs7Ozs7SUFLaEIscUJBQVk7Ozs7O0lBSVosd0JBQXNCOzs7Ozs7SUFLdEIseUJBQWtCOzs7OztJQUlsQiw2QkFBNEI7Ozs7Ozs7OztJQVE1QixzQ0FBOEM7Ozs7OztJQUs5Qyw4QkFBbUM7O0FBR3JDLE1BQU0sT0FBTyxrQkFBa0I7Ozs7O0lBQzdCLFlBQW1CLE1BQWUsRUFBUyxNQUF3QjtRQUFoRCxXQUFNLEdBQU4sTUFBTSxDQUFTO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBa0I7SUFBRyxDQUFDO0NBQ3hFOzs7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S0QsTUFBTSxVQUFVLGlCQUFpQixDQUFDLENBQVE7O1VBQ2xDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDOztVQUMxRCxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsaUNBQUssQ0FBQyxLQUFFLFFBQVEsSUFBRSxDQUFDLG1CQUFLLENBQUMsQ0FBQztJQUM5QyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssY0FBYyxDQUFDLEVBQUU7UUFDN0YsQ0FBQyxDQUFDLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQztLQUNwQztJQUNELE9BQU8sQ0FBQyxDQUFDO0FBQ1gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZUZhY3RvcnksIE5nTW9kdWxlUmVmLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7RW1wdHlPdXRsZXRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9lbXB0eV9vdXRsZXQnO1xuaW1wb3J0IHtBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90fSBmcm9tICcuL3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQge1BSSU1BUllfT1VUTEVUfSBmcm9tICcuL3NoYXJlZCc7XG5pbXBvcnQge1VybFNlZ21lbnQsIFVybFNlZ21lbnRHcm91cH0gZnJvbSAnLi91cmxfdHJlZSc7XG5cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgcm91dGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIFJvdXRlciBzZXJ2aWNlLlxuICogQW4gYXJyYXkgb2YgYFJvdXRlYCBvYmplY3RzLCB1c2VkIGluIGBSb3V0ZXIuY29uZmlnYCBhbmQgZm9yIG5lc3RlZCByb3V0ZSBjb25maWd1cmF0aW9uc1xuICogaW4gYFJvdXRlLmNoaWxkcmVuYC5cbiAqXG4gKiBAc2VlIGBSb3V0ZWBcbiAqIEBzZWUgYFJvdXRlcmBcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgUm91dGVzID0gUm91dGVbXTtcblxuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSByZXN1bHQgb2YgbWF0Y2hpbmcgVVJMcyB3aXRoIGEgY3VzdG9tIG1hdGNoaW5nIGZ1bmN0aW9uLlxuICpcbiAqICogYGNvbnN1bWVkYCBpcyBhbiBhcnJheSBvZiB0aGUgY29uc3VtZWQgVVJMIHNlZ21lbnRzLlxuICogKiBgcG9zUGFyYW1zYCBpcyBhIG1hcCBvZiBwb3NpdGlvbmFsIHBhcmFtZXRlcnMuXG4gKlxuICogQHNlZSBgVXJsTWF0Y2hlcigpYFxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBVcmxNYXRjaFJlc3VsdCA9IHtcbiAgY29uc3VtZWQ6IFVybFNlZ21lbnRbXTsgcG9zUGFyYW1zPzoge1tuYW1lOiBzdHJpbmddOiBVcmxTZWdtZW50fTtcbn07XG5cbi8qKlxuICogQSBmdW5jdGlvbiBmb3IgbWF0Y2hpbmcgYSByb3V0ZSBhZ2FpbnN0IFVSTHMuIEltcGxlbWVudCBhIGN1c3RvbSBVUkwgbWF0Y2hlclxuICogZm9yIGBSb3V0ZS5tYXRjaGVyYCB3aGVuIGEgY29tYmluYXRpb24gb2YgYHBhdGhgIGFuZCBgcGF0aE1hdGNoYFxuICogaXMgbm90IGV4cHJlc3NpdmUgZW5vdWdoLiBDYW5ub3QgYmUgdXNlZCB0b2dldGhlciB3aXRoIGBwYXRoYCBhbmQgYHBhdGhNYXRjaGAuXG4gKlxuICogQHBhcmFtIHNlZ21lbnRzIEFuIGFycmF5IG9mIFVSTCBzZWdtZW50cy5cbiAqIEBwYXJhbSBncm91cCBBIHNlZ21lbnQgZ3JvdXAuXG4gKiBAcGFyYW0gcm91dGUgVGhlIHJvdXRlIHRvIG1hdGNoIGFnYWluc3QuXG4gKiBAcmV0dXJucyBUaGUgbWF0Y2gtcmVzdWx0LlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVGhlIGZvbGxvd2luZyBtYXRjaGVyIG1hdGNoZXMgSFRNTCBmaWxlcy5cbiAqXG4gKiBgYGBcbiAqIGV4cG9ydCBmdW5jdGlvbiBodG1sRmlsZXModXJsOiBVcmxTZWdtZW50W10pIHtcbiAqICAgcmV0dXJuIHVybC5sZW5ndGggPT09IDEgJiYgdXJsWzBdLnBhdGguZW5kc1dpdGgoJy5odG1sJykgPyAoe2NvbnN1bWVkOiB1cmx9KSA6IG51bGw7XG4gKiB9XG4gKlxuICogZXhwb3J0IGNvbnN0IHJvdXRlcyA9IFt7IG1hdGNoZXI6IGh0bWxGaWxlcywgY29tcG9uZW50OiBBbnlDb21wb25lbnQgfV07XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIFVybE1hdGNoZXIgPSAoc2VnbWVudHM6IFVybFNlZ21lbnRbXSwgZ3JvdXA6IFVybFNlZ21lbnRHcm91cCwgcm91dGU6IFJvdXRlKSA9PlxuICAgIFVybE1hdGNoUmVzdWx0O1xuXG4vKipcbiAqXG4gKiBSZXByZXNlbnRzIHN0YXRpYyBkYXRhIGFzc29jaWF0ZWQgd2l0aCBhIHBhcnRpY3VsYXIgcm91dGUuXG4gKlxuICogQHNlZSBgUm91dGUjZGF0YWBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIERhdGEgPSB7XG4gIFtuYW1lOiBzdHJpbmddOiBhbnlcbn07XG5cbi8qKlxuICpcbiAqIFJlcHJlc2VudHMgdGhlIHJlc29sdmVkIGRhdGEgYXNzb2NpYXRlZCB3aXRoIGEgcGFydGljdWxhciByb3V0ZS5cbiAqXG4gKiBAc2VlIGBSb3V0ZSNyZXNvbHZlYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIFJlc29sdmVEYXRhID0ge1xuICBbbmFtZTogc3RyaW5nXTogYW55XG59O1xuXG4vKipcbiAqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHRvIHJlc29sdmUgYSBjb2xsZWN0aW9uIG9mIGxhenktbG9hZGVkIHJvdXRlcy5cbiAqXG4gKiBPZnRlbiB0aGlzIGZ1bmN0aW9uIHdpbGwgYmUgaW1wbGVtZW50ZWQgdXNpbmcgYW4gRVMgZHluYW1pYyBgaW1wb3J0KClgIGV4cHJlc3Npb24uIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYFxuICogW3tcbiAqICAgcGF0aDogJ2xhenknLFxuICogICBsb2FkQ2hpbGRyZW46ICgpID0+IGltcG9ydCgnLi9sYXp5LXJvdXRlL2xhenkubW9kdWxlJykudGhlbihtb2QgPT4gbW9kLkxhenlNb2R1bGUpLFxuICogfV07XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIF9tdXN0XyBtYXRjaCB0aGUgZm9ybSBhYm92ZTogYW4gYXJyb3cgZnVuY3Rpb24gb2YgdGhlIGZvcm1cbiAqIGAoKSA9PiBpbXBvcnQoJy4uLicpLnRoZW4obW9kID0+IG1vZC5NT0RVTEUpYC5cbiAqXG4gKiBAc2VlIGBSb3V0ZSNsb2FkQ2hpbGRyZW5gLlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBMb2FkQ2hpbGRyZW5DYWxsYmFjayA9ICgpID0+IFR5cGU8YW55PnwgTmdNb2R1bGVGYWN0b3J5PGFueT58IE9ic2VydmFibGU8VHlwZTxhbnk+PnxcbiAgICBQcm9taXNlPE5nTW9kdWxlRmFjdG9yeTxhbnk+fFR5cGU8YW55Pnxhbnk+O1xuXG4vKipcbiAqXG4gKiBBIHN0cmluZyBvZiB0aGUgZm9ybSBgcGF0aC90by9maWxlI2V4cG9ydE5hbWVgIHRoYXQgYWN0cyBhcyBhIFVSTCBmb3IgYSBzZXQgb2Ygcm91dGVzIHRvIGxvYWQsXG4gKiBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBzdWNoIGEgc2V0LlxuICpcbiAqIFRoZSBzdHJpbmcgZm9ybSBvZiBgTG9hZENoaWxkcmVuYCBpcyBkZXByZWNhdGVkIChzZWUgYERlcHJlY2F0ZWRMb2FkQ2hpbGRyZW5gKS4gVGhlIGZ1bmN0aW9uXG4gKiBmb3JtIChgTG9hZENoaWxkcmVuQ2FsbGJhY2tgKSBzaG91bGQgYmUgdXNlZCBpbnN0ZWFkLlxuICpcbiAqIEBzZWUgYFJvdXRlI2xvYWRDaGlsZHJlbmAuXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIExvYWRDaGlsZHJlbiA9IExvYWRDaGlsZHJlbkNhbGxiYWNrIHwgRGVwcmVjYXRlZExvYWRDaGlsZHJlbjtcblxuLyoqXG4gKiBBIHN0cmluZyBvZiB0aGUgZm9ybSBgcGF0aC90by9maWxlI2V4cG9ydE5hbWVgIHRoYXQgYWN0cyBhcyBhIFVSTCBmb3IgYSBzZXQgb2Ygcm91dGVzIHRvIGxvYWQuXG4gKlxuICogQHNlZSBgUm91dGUjbG9hZENoaWxkcmVuYFxuICogQHB1YmxpY0FwaVxuICogQGRlcHJlY2F0ZWQgdGhlIGBzdHJpbmdgIGZvcm0gb2YgYGxvYWRDaGlsZHJlbmAgaXMgZGVwcmVjYXRlZCBpbiBmYXZvciBvZiB0aGUgcHJvcG9zZWQgRVMgZHluYW1pY1xuICogYGltcG9ydCgpYCBleHByZXNzaW9uLCB3aGljaCBvZmZlcnMgYSBtb3JlIG5hdHVyYWwgYW5kIHN0YW5kYXJkcy1iYXNlZCBtZWNoYW5pc20gdG8gZHluYW1pY2FsbHlcbiAqIGxvYWQgYW4gRVMgbW9kdWxlIGF0IHJ1bnRpbWUuXG4gKi9cbmV4cG9ydCB0eXBlIERlcHJlY2F0ZWRMb2FkQ2hpbGRyZW4gPSBzdHJpbmc7XG5cbi8qKlxuICpcbiAqIEhvdyB0byBoYW5kbGUgcXVlcnkgcGFyYW1ldGVycyBpbiBhIHJvdXRlciBsaW5rLlxuICogT25lIG9mOlxuICogLSBgbWVyZ2VgIDogTWVyZ2UgbmV3IHdpdGggY3VycmVudCBwYXJhbWV0ZXJzLlxuICogLSBgcHJlc2VydmVgIDogUHJlc2VydmUgY3VycmVudCBwYXJhbWV0ZXJzLlxuICpcbiAqIEBzZWUgYE5hdmlnYXRpb25FeHRyYXMjcXVlcnlQYXJhbXNIYW5kbGluZ2BcbiAqIEBzZWUgYFJvdXRlckxpbmtgXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIFF1ZXJ5UGFyYW1zSGFuZGxpbmcgPSAnbWVyZ2UnIHwgJ3ByZXNlcnZlJyB8ICcnO1xuXG4vKipcbiAqXG4gKiBBIHBvbGljeSBmb3Igd2hlbiB0byBydW4gZ3VhcmRzIGFuZCByZXNvbHZlcnMgb24gYSByb3V0ZS5cbiAqXG4gKiBAc2VlIGBSb3V0ZSNydW5HdWFyZHNBbmRSZXNvbHZlcnNgXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIFJ1bkd1YXJkc0FuZFJlc29sdmVycyA9ICdwYXRoUGFyYW1zQ2hhbmdlJyB8ICdwYXRoUGFyYW1zT3JRdWVyeVBhcmFtc0NoYW5nZScgfFxuICAgICdwYXJhbXNDaGFuZ2UnIHwgJ3BhcmFtc09yUXVlcnlQYXJhbXNDaGFuZ2UnIHwgJ2Fsd2F5cycgfFxuICAgICgoZnJvbTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgdG86IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpID0+IGJvb2xlYW4pO1xuXG4vKipcbiAqIEEgY29uZmlndXJhdGlvbiBvYmplY3QgdGhhdCBkZWZpbmVzIGEgc2luZ2xlIHJvdXRlLlxuICogQSBzZXQgb2Ygcm91dGVzIGFyZSBjb2xsZWN0ZWQgaW4gYSBgUm91dGVzYCBhcnJheSB0byBkZWZpbmUgYSBgUm91dGVyYCBjb25maWd1cmF0aW9uLlxuICogVGhlIHJvdXRlciBhdHRlbXB0cyB0byBtYXRjaCBzZWdtZW50cyBvZiBhIGdpdmVuIFVSTCBhZ2FpbnN0IGVhY2ggcm91dGUsXG4gKiB1c2luZyB0aGUgY29uZmlndXJhdGlvbiBvcHRpb25zIGRlZmluZWQgaW4gdGhpcyBvYmplY3QuXG4gKlxuICogU3VwcG9ydHMgc3RhdGljLCBwYXJhbWV0ZXJpemVkLCByZWRpcmVjdCwgYW5kIHdpbGRjYXJkIHJvdXRlcywgYXMgd2VsbCBhc1xuICogY3VzdG9tIHJvdXRlIGRhdGEgYW5kIHJlc29sdmUgbWV0aG9kcy5cbiAqXG4gKiBGb3IgZGV0YWlsZWQgdXNhZ2UgaW5mb3JtYXRpb24sIHNlZSB0aGUgW1JvdXRpbmcgR3VpZGVdKGd1aWRlL3JvdXRlcikuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgU2ltcGxlIENvbmZpZ3VyYXRpb25cbiAqXG4gKiBUaGUgZm9sbG93aW5nIHJvdXRlIHNwZWNpZmllcyB0aGF0IHdoZW4gbmF2aWdhdGluZyB0bywgZm9yIGV4YW1wbGUsXG4gKiBgL3RlYW0vMTEvdXNlci9ib2JgLCB0aGUgcm91dGVyIGNyZWF0ZXMgdGhlICdUZWFtJyBjb21wb25lbnRcbiAqIHdpdGggdGhlICdVc2VyJyBjaGlsZCBjb21wb25lbnQgaW4gaXQuXG4gKlxuICogYGBgXG4gKiBbe1xuICogICBwYXRoOiAndGVhbS86aWQnLFxuICAqICBjb21wb25lbnQ6IFRlYW0sXG4gKiAgIGNoaWxkcmVuOiBbe1xuICogICAgIHBhdGg6ICd1c2VyLzpuYW1lJyxcbiAqICAgICBjb21wb25lbnQ6IFVzZXJcbiAqICAgfV1cbiAqIH1dXG4gKiBgYGBcbiAqXG4gKiAjIyMgTXVsdGlwbGUgT3V0bGV0c1xuICpcbiAqIFRoZSBmb2xsb3dpbmcgcm91dGUgY3JlYXRlcyBzaWJsaW5nIGNvbXBvbmVudHMgd2l0aCBtdWx0aXBsZSBvdXRsZXRzLlxuICogV2hlbiBuYXZpZ2F0aW5nIHRvIGAvdGVhbS8xMShhdXg6Y2hhdC9qaW0pYCwgdGhlIHJvdXRlciBjcmVhdGVzIHRoZSAnVGVhbScgY29tcG9uZW50IG5leHQgdG9cbiAqIHRoZSAnQ2hhdCcgY29tcG9uZW50LiBUaGUgJ0NoYXQnIGNvbXBvbmVudCBpcyBwbGFjZWQgaW50byB0aGUgJ2F1eCcgb3V0bGV0LlxuICpcbiAqIGBgYFxuICogW3tcbiAqICAgcGF0aDogJ3RlYW0vOmlkJyxcbiAqICAgY29tcG9uZW50OiBUZWFtXG4gKiB9LCB7XG4gKiAgIHBhdGg6ICdjaGF0Lzp1c2VyJyxcbiAqICAgY29tcG9uZW50OiBDaGF0XG4gKiAgIG91dGxldDogJ2F1eCdcbiAqIH1dXG4gKiBgYGBcbiAqXG4gKiAjIyMgV2lsZCBDYXJkc1xuICpcbiAqIFRoZSBmb2xsb3dpbmcgcm91dGUgdXNlcyB3aWxkLWNhcmQgbm90YXRpb24gdG8gc3BlY2lmeSBhIGNvbXBvbmVudFxuICogdGhhdCBpcyBhbHdheXMgaW5zdGFudGlhdGVkIHJlZ2FyZGxlc3Mgb2Ygd2hlcmUgeW91IG5hdmlnYXRlIHRvLlxuICpcbiAqIGBgYFxuICogW3tcbiAqICAgcGF0aDogJyoqJyxcbiAqICAgY29tcG9uZW50OiBXaWxkY2FyZENvbXBvbmVudFxuICogfV1cbiAqIGBgYFxuICpcbiAqICMjIyBSZWRpcmVjdHNcbiAqXG4gKiBUaGUgZm9sbG93aW5nIHJvdXRlIHVzZXMgdGhlIGByZWRpcmVjdFRvYCBwcm9wZXJ0eSB0byBpZ25vcmUgYSBzZWdtZW50IG9mXG4gKiBhIGdpdmVuIFVSTCB3aGVuIGxvb2tpbmcgZm9yIGEgY2hpbGQgcGF0aC5cbiAqXG4gKiBXaGVuIG5hdmlnYXRpbmcgdG8gJy90ZWFtLzExL2xlZ2FjeS91c2VyL2ppbScsIHRoZSByb3V0ZXIgY2hhbmdlcyB0aGUgVVJMIHNlZ21lbnRcbiAqICcvdGVhbS8xMS9sZWdhY3kvdXNlci9qaW0nIHRvICcvdGVhbS8xMS91c2VyL2ppbScsIGFuZCB0aGVuIGluc3RhbnRpYXRlc1xuICogdGhlIFRlYW0gY29tcG9uZW50IHdpdGggdGhlIFVzZXIgY2hpbGQgY29tcG9uZW50IGluIGl0LlxuICpcbiAqIGBgYFxuICogW3tcbiAqICAgcGF0aDogJ3RlYW0vOmlkJyxcbiAqICAgY29tcG9uZW50OiBUZWFtLFxuICogICBjaGlsZHJlbjogW3tcbiAqICAgICBwYXRoOiAnbGVnYWN5L3VzZXIvOm5hbWUnLFxuICogICAgIHJlZGlyZWN0VG86ICd1c2VyLzpuYW1lJ1xuICogICB9LCB7XG4gKiAgICAgcGF0aDogJ3VzZXIvOm5hbWUnLFxuICogICAgIGNvbXBvbmVudDogVXNlclxuICogICB9XVxuICogfV1cbiAqIGBgYFxuICpcbiAqIFRoZSByZWRpcmVjdCBwYXRoIGNhbiBiZSByZWxhdGl2ZSwgYXMgc2hvd24gaW4gdGhpcyBleGFtcGxlLCBvciBhYnNvbHV0ZS5cbiAqIElmIHdlIGNoYW5nZSB0aGUgYHJlZGlyZWN0VG9gIHZhbHVlIGluIHRoZSBleGFtcGxlIHRvIHRoZSBhYnNvbHV0ZSBVUkwgc2VnbWVudCAnL3VzZXIvOm5hbWUnLFxuICogdGhlIHJlc3VsdCBVUkwgaXMgYWxzbyBhYnNvbHV0ZSwgJy91c2VyL2ppbScuXG5cbiAqICMjIyBFbXB0eSBQYXRoXG4gKlxuICogRW1wdHktcGF0aCByb3V0ZSBjb25maWd1cmF0aW9ucyBjYW4gYmUgdXNlZCB0byBpbnN0YW50aWF0ZSBjb21wb25lbnRzIHRoYXQgZG8gbm90ICdjb25zdW1lJ1xuICogYW55IFVSTCBzZWdtZW50cy5cbiAqXG4gKiBJbiB0aGUgZm9sbG93aW5nIGNvbmZpZ3VyYXRpb24sIHdoZW4gbmF2aWdhdGluZyB0b1xuICogYC90ZWFtLzExYCwgdGhlIHJvdXRlciBpbnN0YW50aWF0ZXMgdGhlICdBbGxVc2VycycgY29tcG9uZW50LlxuICpcbiAqIGBgYFxuICogW3tcbiAqICAgcGF0aDogJ3RlYW0vOmlkJyxcbiAqICAgY29tcG9uZW50OiBUZWFtLFxuICogICBjaGlsZHJlbjogW3tcbiAqICAgICBwYXRoOiAnJyxcbiAqICAgICBjb21wb25lbnQ6IEFsbFVzZXJzXG4gKiAgIH0sIHtcbiAqICAgICBwYXRoOiAndXNlci86bmFtZScsXG4gKiAgICAgY29tcG9uZW50OiBVc2VyXG4gKiAgIH1dXG4gKiB9XVxuICogYGBgXG4gKlxuICogRW1wdHktcGF0aCByb3V0ZXMgY2FuIGhhdmUgY2hpbGRyZW4uIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSwgd2hlbiBuYXZpZ2F0aW5nXG4gKiB0byBgL3RlYW0vMTEvdXNlci9qaW1gLCB0aGUgcm91dGVyIGluc3RhbnRpYXRlcyB0aGUgd3JhcHBlciBjb21wb25lbnQgd2l0aFxuICogdGhlIHVzZXIgY29tcG9uZW50IGluIGl0LlxuICpcbiAqIE5vdGUgdGhhdCBhbiBlbXB0eSBwYXRoIHJvdXRlIGluaGVyaXRzIGl0cyBwYXJlbnQncyBwYXJhbWV0ZXJzIGFuZCBkYXRhLlxuICpcbiAqIGBgYFxuICogW3tcbiAqICAgcGF0aDogJ3RlYW0vOmlkJyxcbiAqICAgY29tcG9uZW50OiBUZWFtLFxuICogICBjaGlsZHJlbjogW3tcbiAqICAgICBwYXRoOiAnJyxcbiAqICAgICBjb21wb25lbnQ6IFdyYXBwZXJDbXAsXG4gKiAgICAgY2hpbGRyZW46IFt7XG4gKiAgICAgICBwYXRoOiAndXNlci86bmFtZScsXG4gKiAgICAgICBjb21wb25lbnQ6IFVzZXJcbiAqICAgICB9XVxuICogICB9XVxuICogfV1cbiAqIGBgYFxuICpcbiAqICMjIyBNYXRjaGluZyBTdHJhdGVneVxuICpcbiAqIFRoZSBkZWZhdWx0IHBhdGgtbWF0Y2ggc3RyYXRlZ3kgaXMgJ3ByZWZpeCcsIHdoaWNoIG1lYW5zIHRoYXQgdGhlIHJvdXRlclxuICogY2hlY2tzIFVSTCBlbGVtZW50cyBmcm9tIHRoZSBsZWZ0IHRvIHNlZSBpZiB0aGUgVVJMIG1hdGNoZXMgYSBzcGVjaWZpZWQgcGF0aC5cbiAqIEZvciBleGFtcGxlLCAnL3RlYW0vMTEvdXNlcicgbWF0Y2hlcyAndGVhbS86aWQnLlxuICpcbiAqIGBgYFxuICogW3tcbiAqICAgcGF0aDogJycsXG4gKiAgIHBhdGhNYXRjaDogJ3ByZWZpeCcsIC8vZGVmYXVsdFxuICogICByZWRpcmVjdFRvOiAnbWFpbidcbiAqIH0sIHtcbiAqICAgcGF0aDogJ21haW4nLFxuICogICBjb21wb25lbnQ6IE1haW5cbiAqIH1dXG4gKiBgYGBcbiAqXG4gKiBZb3UgY2FuIHNwZWNpZnkgdGhlIHBhdGgtbWF0Y2ggc3RyYXRlZ3kgJ2Z1bGwnIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBwYXRoXG4gKiBjb3ZlcnMgdGhlIHdob2xlIHVuY29uc3VtZWQgVVJMLiBJdCBpcyBpbXBvcnRhbnQgdG8gZG8gdGhpcyB3aGVuIHJlZGlyZWN0aW5nXG4gKiBlbXB0eS1wYXRoIHJvdXRlcy4gT3RoZXJ3aXNlLCBiZWNhdXNlIGFuIGVtcHR5IHBhdGggaXMgYSBwcmVmaXggb2YgYW55IFVSTCxcbiAqIHRoZSByb3V0ZXIgd291bGQgYXBwbHkgdGhlIHJlZGlyZWN0IGV2ZW4gd2hlbiBuYXZpZ2F0aW5nIHRvIHRoZSByZWRpcmVjdCBkZXN0aW5hdGlvbixcbiAqIGNyZWF0aW5nIGFuIGVuZGxlc3MgbG9vcC5cbiAqXG4gKiBJbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUsIHN1cHBseWluZyB0aGUgJ2Z1bGwnIGBwYXRoTWF0Y2hgIHN0cmF0ZWd5IGVuc3VyZXNcbiAqIHRoYXQgdGhlIHJvdXRlciBhcHBsaWVzIHRoZSByZWRpcmVjdCBpZiBhbmQgb25seSBpZiBuYXZpZ2F0aW5nIHRvICcvJy5cbiAqXG4gKiBgYGBcbiAqIFt7XG4gKiAgIHBhdGg6ICcnLFxuICogICBwYXRoTWF0Y2g6ICdmdWxsJyxcbiAqICAgcmVkaXJlY3RUbzogJ21haW4nXG4gKiB9LCB7XG4gKiAgIHBhdGg6ICdtYWluJyxcbiAqICAgY29tcG9uZW50OiBNYWluXG4gKiB9XVxuICogYGBgXG4gKlxuICogIyMjIENvbXBvbmVudGxlc3MgUm91dGVzXG4gKlxuICogWW91IGNhbiBzaGFyZSBwYXJhbWV0ZXJzIGJldHdlZW4gc2libGluZyBjb21wb25lbnRzLlxuICogRm9yIGV4YW1wbGUsIHN1cHBvc2UgdGhhdCB0d28gc2libGluZyBjb21wb25lbnRzIHNob3VsZCBnbyBuZXh0IHRvIGVhY2ggb3RoZXIsXG4gKiBhbmQgYm90aCBvZiB0aGVtIHJlcXVpcmUgYW4gSUQgcGFyYW1ldGVyLiBZb3UgY2FuIGFjY29tcGxpc2ggdGhpcyB1c2luZyBhIHJvdXRlXG4gKiB0aGF0IGRvZXMgbm90IHNwZWNpZnkgYSBjb21wb25lbnQgYXQgdGhlIHRvcCBsZXZlbC5cbiAqXG4gKiBJbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUsICdNYWluQ2hpbGQnIGFuZCAnQXV4Q2hpbGQnIGFyZSBzaWJsaW5ncy5cbiAqIFdoZW4gbmF2aWdhdGluZyB0byAncGFyZW50LzEwLyhhLy9hdXg6YiknLCB0aGUgcm91dGUgaW5zdGFudGlhdGVzXG4gKiB0aGUgbWFpbiBjaGlsZCBhbmQgYXV4IGNoaWxkIGNvbXBvbmVudHMgbmV4dCB0byBlYWNoIG90aGVyLlxuICogRm9yIHRoaXMgdG8gd29yaywgdGhlIGFwcGxpY2F0aW9uIGNvbXBvbmVudCBtdXN0IGhhdmUgdGhlIHByaW1hcnkgYW5kIGF1eCBvdXRsZXRzIGRlZmluZWQuXG4gKlxuICogYGBgXG4gKiBbe1xuICogICAgcGF0aDogJ3BhcmVudC86aWQnLFxuICogICAgY2hpbGRyZW46IFtcbiAqICAgICAgeyBwYXRoOiAnYScsIGNvbXBvbmVudDogTWFpbkNoaWxkIH0sXG4gKiAgICAgIHsgcGF0aDogJ2InLCBjb21wb25lbnQ6IEF1eENoaWxkLCBvdXRsZXQ6ICdhdXgnIH1cbiAqICAgIF1cbiAqIH1dXG4gKiBgYGBcbiAqXG4gKiBUaGUgcm91dGVyIG1lcmdlcyB0aGUgcGFyYW1ldGVycywgZGF0YSwgYW5kIHJlc29sdmUgb2YgdGhlIGNvbXBvbmVudGxlc3NcbiAqIHBhcmVudCBpbnRvIHRoZSBwYXJhbWV0ZXJzLCBkYXRhLCBhbmQgcmVzb2x2ZSBvZiB0aGUgY2hpbGRyZW4uXG4gKlxuICogVGhpcyBpcyBlc3BlY2lhbGx5IHVzZWZ1bCB3aGVuIGNoaWxkIGNvbXBvbmVudHMgYXJlIGRlZmluZWRcbiAqIHdpdGggYW4gZW1wdHkgcGF0aCBzdHJpbmcsIGFzIGluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZS5cbiAqIFdpdGggdGhpcyBjb25maWd1cmF0aW9uLCBuYXZpZ2F0aW5nIHRvICcvcGFyZW50LzEwJyBjcmVhdGVzXG4gKiB0aGUgbWFpbiBjaGlsZCBhbmQgYXV4IGNvbXBvbmVudHMuXG4gKlxuICogYGBgXG4gKiBbe1xuICogICAgcGF0aDogJ3BhcmVudC86aWQnLFxuICogICAgY2hpbGRyZW46IFtcbiAqICAgICAgeyBwYXRoOiAnJywgY29tcG9uZW50OiBNYWluQ2hpbGQgfSxcbiAqICAgICAgeyBwYXRoOiAnJywgY29tcG9uZW50OiBBdXhDaGlsZCwgb3V0bGV0OiAnYXV4JyB9XG4gKiAgICBdXG4gKiB9XVxuICogYGBgXG4gKlxuICogIyMjIExhenkgTG9hZGluZ1xuICpcbiAqIExhenkgbG9hZGluZyBzcGVlZHMgdXAgYXBwbGljYXRpb24gbG9hZCB0aW1lIGJ5IHNwbGl0dGluZyB0aGUgYXBwbGljYXRpb25cbiAqIGludG8gbXVsdGlwbGUgYnVuZGxlcyBhbmQgbG9hZGluZyB0aGVtIG9uIGRlbWFuZC5cbiAqIFRvIHVzZSBsYXp5IGxvYWRpbmcsIHByb3ZpZGUgdGhlIGBsb2FkQ2hpbGRyZW5gIHByb3BlcnR5ICBpbnN0ZWFkIG9mIHRoZSBgY2hpbGRyZW5gIHByb3BlcnR5LlxuICpcbiAqIEdpdmVuIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSByb3V0ZSwgdGhlIHJvdXRlciB3aWxsIGxhenkgbG9hZFxuICogdGhlIGFzc29jaWF0ZWQgbW9kdWxlIG9uIGRlbWFuZCB1c2luZyB0aGUgYnJvd3NlciBuYXRpdmUgaW1wb3J0IHN5c3RlbS5cbiAqXG4gKiBgYGBcbiAqIFt7XG4gKiAgIHBhdGg6ICdsYXp5JyxcbiAqICAgbG9hZENoaWxkcmVuOiAoKSA9PiBpbXBvcnQoJy4vbGF6eS1yb3V0ZS9sYXp5Lm1vZHVsZScpLnRoZW4obW9kID0+IG1vZC5MYXp5TW9kdWxlKSxcbiAqIH1dO1xuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJvdXRlIHtcbiAgLyoqXG4gICAqIFRoZSBwYXRoIHRvIG1hdGNoIGFnYWluc3QuIENhbm5vdCBiZSB1c2VkIHRvZ2V0aGVyIHdpdGggYSBjdXN0b20gYG1hdGNoZXJgIGZ1bmN0aW9uLlxuICAgKiBBIFVSTCBzdHJpbmcgdGhhdCB1c2VzIHJvdXRlciBtYXRjaGluZyBub3RhdGlvbi5cbiAgICogQ2FuIGJlIGEgd2lsZCBjYXJkIChgKipgKSB0aGF0IG1hdGNoZXMgYW55IFVSTCAoc2VlIFVzYWdlIE5vdGVzIGJlbG93KS5cbiAgICogRGVmYXVsdCBpcyBcIi9cIiAodGhlIHJvb3QgcGF0aCkuXG4gICAqXG4gICAqL1xuICBwYXRoPzogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIHBhdGgtbWF0Y2hpbmcgc3RyYXRlZ3ksIG9uZSBvZiAncHJlZml4JyBvciAnZnVsbCcuXG4gICAqIERlZmF1bHQgaXMgJ3ByZWZpeCcuXG4gICAqXG4gICAqIEJ5IGRlZmF1bHQsIHRoZSByb3V0ZXIgY2hlY2tzIFVSTCBlbGVtZW50cyBmcm9tIHRoZSBsZWZ0IHRvIHNlZSBpZiB0aGUgVVJMXG4gICAqIG1hdGNoZXMgYSBnaXZlbiAgcGF0aCwgYW5kIHN0b3BzIHdoZW4gdGhlcmUgaXMgYSBtYXRjaC4gRm9yIGV4YW1wbGUsXG4gICAqICcvdGVhbS8xMS91c2VyJyBtYXRjaGVzICd0ZWFtLzppZCcuXG4gICAqXG4gICAqIFRoZSBwYXRoLW1hdGNoIHN0cmF0ZWd5ICdmdWxsJyBtYXRjaGVzIGFnYWluc3QgdGhlIGVudGlyZSBVUkwuXG4gICAqIEl0IGlzIGltcG9ydGFudCB0byBkbyB0aGlzIHdoZW4gcmVkaXJlY3RpbmcgZW1wdHktcGF0aCByb3V0ZXMuXG4gICAqIE90aGVyd2lzZSwgYmVjYXVzZSBhbiBlbXB0eSBwYXRoIGlzIGEgcHJlZml4IG9mIGFueSBVUkwsXG4gICAqIHRoZSByb3V0ZXIgd291bGQgYXBwbHkgdGhlIHJlZGlyZWN0IGV2ZW4gd2hlbiBuYXZpZ2F0aW5nXG4gICAqIHRvIHRoZSByZWRpcmVjdCBkZXN0aW5hdGlvbiwgY3JlYXRpbmcgYW4gZW5kbGVzcyBsb29wLlxuICAgKlxuICAgKi9cbiAgcGF0aE1hdGNoPzogc3RyaW5nO1xuICAvKipcbiAgICogQSBjdXN0b20gVVJMLW1hdGNoaW5nIGZ1bmN0aW9uLiBDYW5ub3QgYmUgdXNlZCB0b2dldGhlciB3aXRoIGBwYXRoYC5cbiAgICovXG4gIG1hdGNoZXI/OiBVcmxNYXRjaGVyO1xuICAvKipcbiAgICogVGhlIGNvbXBvbmVudCB0byBpbnN0YW50aWF0ZSB3aGVuIHRoZSBwYXRoIG1hdGNoZXMuXG4gICAqIENhbiBiZSBlbXB0eSBpZiBjaGlsZCByb3V0ZXMgc3BlY2lmeSBjb21wb25lbnRzLlxuICAgKi9cbiAgY29tcG9uZW50PzogVHlwZTxhbnk+O1xuICAvKipcbiAgICogQSBVUkwgdG8gd2hpY2ggdG8gcmVkaXJlY3Qgd2hlbiBhIHRoZSBwYXRoIG1hdGNoZXMuXG4gICAqIEFic29sdXRlIGlmIHRoZSBVUkwgYmVnaW5zIHdpdGggYSBzbGFzaCAoLyksIG90aGVyd2lzZSByZWxhdGl2ZSB0byB0aGUgcGF0aCBVUkwuXG4gICAqIFdoZW4gbm90IHByZXNlbnQsIHJvdXRlciBkb2VzIG5vdCByZWRpcmVjdC5cbiAgICovXG4gIHJlZGlyZWN0VG8/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBOYW1lIG9mIGEgYFJvdXRlck91dGxldGAgb2JqZWN0IHdoZXJlIHRoZSBjb21wb25lbnQgY2FuIGJlIHBsYWNlZFxuICAgKiB3aGVuIHRoZSBwYXRoIG1hdGNoZXMuXG4gICAqL1xuICBvdXRsZXQ/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBkZXBlbmRlbmN5LWluamVjdGlvbiB0b2tlbnMgdXNlZCB0byBsb29rIHVwIGBDYW5BY3RpdmF0ZSgpYFxuICAgKiBoYW5kbGVycywgaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIGlmIHRoZSBjdXJyZW50IHVzZXIgaXMgYWxsb3dlZCB0b1xuICAgKiBhY3RpdmF0ZSB0aGUgY29tcG9uZW50LiBCeSBkZWZhdWx0LCBhbnkgdXNlciBjYW4gYWN0aXZhdGUuXG4gICAqL1xuICBjYW5BY3RpdmF0ZT86IGFueVtdO1xuICAvKipcbiAgICogQW4gYXJyYXkgb2YgREkgdG9rZW5zIHVzZWQgdG8gbG9vayB1cCBgQ2FuQWN0aXZhdGVDaGlsZCgpYCBoYW5kbGVycyxcbiAgICogaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIGlmIHRoZSBjdXJyZW50IHVzZXIgaXMgYWxsb3dlZCB0byBhY3RpdmF0ZVxuICAgKiBhIGNoaWxkIG9mIHRoZSBjb21wb25lbnQuIEJ5IGRlZmF1bHQsIGFueSB1c2VyIGNhbiBhY3RpdmF0ZSBhIGNoaWxkLlxuICAgKi9cbiAgY2FuQWN0aXZhdGVDaGlsZD86IGFueVtdO1xuICAvKipcbiAgICogQW4gYXJyYXkgb2YgREkgdG9rZW5zIHVzZWQgdG8gbG9vayB1cCBgQ2FuRGVhY3RpdmF0ZSgpYFxuICAgKiBoYW5kbGVycywgaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIGlmIHRoZSBjdXJyZW50IHVzZXIgaXMgYWxsb3dlZCB0b1xuICAgKiBkZWFjdGl2YXRlIHRoZSBjb21wb25lbnQuIEJ5IGRlZmF1bHQsIGFueSB1c2VyIGNhbiBkZWFjdGl2YXRlLlxuICAgKlxuICAgKi9cbiAgY2FuRGVhY3RpdmF0ZT86IGFueVtdO1xuICAvKipcbiAgICogQW4gYXJyYXkgb2YgREkgdG9rZW5zIHVzZWQgdG8gbG9vayB1cCBgQ2FuTG9hZCgpYFxuICAgKiBoYW5kbGVycywgaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIGlmIHRoZSBjdXJyZW50IHVzZXIgaXMgYWxsb3dlZCB0b1xuICAgKiBsb2FkIHRoZSBjb21wb25lbnQuIEJ5IGRlZmF1bHQsIGFueSB1c2VyIGNhbiBsb2FkLlxuICAgKi9cbiAgY2FuTG9hZD86IGFueVtdO1xuICAvKipcbiAgICogQWRkaXRpb25hbCBkZXZlbG9wZXItZGVmaW5lZCBkYXRhIHByb3ZpZGVkIHRvIHRoZSBjb21wb25lbnQgdmlhXG4gICAqIGBBY3RpdmF0ZWRSb3V0ZWAuIEJ5IGRlZmF1bHQsIG5vIGFkZGl0aW9uYWwgZGF0YSBpcyBwYXNzZWQuXG4gICAqL1xuICBkYXRhPzogRGF0YTtcbiAgLyoqXG4gICAqIEEgbWFwIG9mIERJIHRva2VucyB1c2VkIHRvIGxvb2sgdXAgZGF0YSByZXNvbHZlcnMuIFNlZSBgUmVzb2x2ZWAuXG4gICAqL1xuICByZXNvbHZlPzogUmVzb2x2ZURhdGE7XG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBjaGlsZCBgUm91dGVgIG9iamVjdHMgdGhhdCBzcGVjaWZpZXMgYSBuZXN0ZWQgcm91dGVcbiAgICogY29uZmlndXJhdGlvbi5cbiAgICovXG4gIGNoaWxkcmVuPzogUm91dGVzO1xuICAvKipcbiAgICogQSBgTG9hZENoaWxkcmVuYCBvYmplY3Qgc3BlY2lmeWluZyBsYXp5LWxvYWRlZCBjaGlsZCByb3V0ZXMuXG4gICAqL1xuICBsb2FkQ2hpbGRyZW4/OiBMb2FkQ2hpbGRyZW47XG4gIC8qKlxuICAgKiBEZWZpbmVzIHdoZW4gZ3VhcmRzIGFuZCByZXNvbHZlcnMgd2lsbCBiZSBydW4uIE9uZSBvZlxuICAgKiAtIGBwYXJhbXNPclF1ZXJ5UGFyYW1zQ2hhbmdlYCA6IFJ1biB3aGVuIHF1ZXJ5IHBhcmFtZXRlcnMgY2hhbmdlLlxuICAgKiAtIGBhbHdheXNgIDogUnVuIG9uIGV2ZXJ5IGV4ZWN1dGlvbi5cbiAgICogQnkgZGVmYXVsdCwgZ3VhcmRzIGFuZCByZXNvbHZlcnMgcnVuIG9ubHkgd2hlbiB0aGUgbWF0cml4XG4gICAqIHBhcmFtZXRlcnMgb2YgdGhlIHJvdXRlIGNoYW5nZS5cbiAgICovXG4gIHJ1bkd1YXJkc0FuZFJlc29sdmVycz86IFJ1bkd1YXJkc0FuZFJlc29sdmVycztcbiAgLyoqXG4gICAqIEZpbGxlZCBmb3Igcm91dGVzIHdpdGggYGxvYWRDaGlsZHJlbmAgb25jZSB0aGUgbW9kdWxlIGhhcyBiZWVuIGxvYWRlZFxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF9sb2FkZWRDb25maWc/OiBMb2FkZWRSb3V0ZXJDb25maWc7XG59XG5cbmV4cG9ydCBjbGFzcyBMb2FkZWRSb3V0ZXJDb25maWcge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcm91dGVzOiBSb3V0ZVtdLCBwdWJsaWMgbW9kdWxlOiBOZ01vZHVsZVJlZjxhbnk+KSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb25maWcoY29uZmlnOiBSb3V0ZXMsIHBhcmVudFBhdGg6IHN0cmluZyA9ICcnKTogdm9pZCB7XG4gIC8vIGZvckVhY2ggZG9lc24ndCBpdGVyYXRlIHVuZGVmaW5lZCB2YWx1ZXNcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb25maWcubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByb3V0ZTogUm91dGUgPSBjb25maWdbaV07XG4gICAgY29uc3QgZnVsbFBhdGg6IHN0cmluZyA9IGdldEZ1bGxQYXRoKHBhcmVudFBhdGgsIHJvdXRlKTtcbiAgICB2YWxpZGF0ZU5vZGUocm91dGUsIGZ1bGxQYXRoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZU5vZGUocm91dGU6IFJvdXRlLCBmdWxsUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gIGlmICghcm91dGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxuICAgICAgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IEVuY291bnRlcmVkIHVuZGVmaW5lZCByb3V0ZS5cbiAgICAgIFRoZSByZWFzb24gbWlnaHQgYmUgYW4gZXh0cmEgY29tbWEuXG5cbiAgICAgIEV4YW1wbGU6XG4gICAgICBjb25zdCByb3V0ZXM6IFJvdXRlcyA9IFtcbiAgICAgICAgeyBwYXRoOiAnJywgcmVkaXJlY3RUbzogJy9kYXNoYm9hcmQnLCBwYXRoTWF0Y2g6ICdmdWxsJyB9LFxuICAgICAgICB7IHBhdGg6ICdkYXNoYm9hcmQnLCAgY29tcG9uZW50OiBEYXNoYm9hcmRDb21wb25lbnQgfSwsIDw8IHR3byBjb21tYXNcbiAgICAgICAgeyBwYXRoOiAnZGV0YWlsLzppZCcsIGNvbXBvbmVudDogSGVyb0RldGFpbENvbXBvbmVudCB9XG4gICAgICBdO1xuICAgIGApO1xuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KHJvdXRlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IEFycmF5IGNhbm5vdCBiZSBzcGVjaWZpZWRgKTtcbiAgfVxuICBpZiAoIXJvdXRlLmNvbXBvbmVudCAmJiAhcm91dGUuY2hpbGRyZW4gJiYgIXJvdXRlLmxvYWRDaGlsZHJlbiAmJlxuICAgICAgKHJvdXRlLm91dGxldCAmJiByb3V0ZS5vdXRsZXQgIT09IFBSSU1BUllfT1VUTEVUKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiBhIGNvbXBvbmVudGxlc3Mgcm91dGUgd2l0aG91dCBjaGlsZHJlbiBvciBsb2FkQ2hpbGRyZW4gY2Fubm90IGhhdmUgYSBuYW1lZCBvdXRsZXQgc2V0YCk7XG4gIH1cbiAgaWYgKHJvdXRlLnJlZGlyZWN0VG8gJiYgcm91dGUuY2hpbGRyZW4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb2Ygcm91dGUgJyR7ZnVsbFBhdGh9JzogcmVkaXJlY3RUbyBhbmQgY2hpbGRyZW4gY2Fubm90IGJlIHVzZWQgdG9nZXRoZXJgKTtcbiAgfVxuICBpZiAocm91dGUucmVkaXJlY3RUbyAmJiByb3V0ZS5sb2FkQ2hpbGRyZW4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb2Ygcm91dGUgJyR7ZnVsbFBhdGh9JzogcmVkaXJlY3RUbyBhbmQgbG9hZENoaWxkcmVuIGNhbm5vdCBiZSB1c2VkIHRvZ2V0aGVyYCk7XG4gIH1cbiAgaWYgKHJvdXRlLmNoaWxkcmVuICYmIHJvdXRlLmxvYWRDaGlsZHJlbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiBjaGlsZHJlbiBhbmQgbG9hZENoaWxkcmVuIGNhbm5vdCBiZSB1c2VkIHRvZ2V0aGVyYCk7XG4gIH1cbiAgaWYgKHJvdXRlLnJlZGlyZWN0VG8gJiYgcm91dGUuY29tcG9uZW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IHJlZGlyZWN0VG8gYW5kIGNvbXBvbmVudCBjYW5ub3QgYmUgdXNlZCB0b2dldGhlcmApO1xuICB9XG4gIGlmIChyb3V0ZS5wYXRoICYmIHJvdXRlLm1hdGNoZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb2Ygcm91dGUgJyR7ZnVsbFBhdGh9JzogcGF0aCBhbmQgbWF0Y2hlciBjYW5ub3QgYmUgdXNlZCB0b2dldGhlcmApO1xuICB9XG4gIGlmIChyb3V0ZS5yZWRpcmVjdFRvID09PSB2b2lkIDAgJiYgIXJvdXRlLmNvbXBvbmVudCAmJiAhcm91dGUuY2hpbGRyZW4gJiYgIXJvdXRlLmxvYWRDaGlsZHJlbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nLiBPbmUgb2YgdGhlIGZvbGxvd2luZyBtdXN0IGJlIHByb3ZpZGVkOiBjb21wb25lbnQsIHJlZGlyZWN0VG8sIGNoaWxkcmVuIG9yIGxvYWRDaGlsZHJlbmApO1xuICB9XG4gIGlmIChyb3V0ZS5wYXRoID09PSB2b2lkIDAgJiYgcm91dGUubWF0Y2hlciA9PT0gdm9pZCAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IHJvdXRlcyBtdXN0IGhhdmUgZWl0aGVyIGEgcGF0aCBvciBhIG1hdGNoZXIgc3BlY2lmaWVkYCk7XG4gIH1cbiAgaWYgKHR5cGVvZiByb3V0ZS5wYXRoID09PSAnc3RyaW5nJyAmJiByb3V0ZS5wYXRoLmNoYXJBdCgwKSA9PT0gJy8nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb2Ygcm91dGUgJyR7ZnVsbFBhdGh9JzogcGF0aCBjYW5ub3Qgc3RhcnQgd2l0aCBhIHNsYXNoYCk7XG4gIH1cbiAgaWYgKHJvdXRlLnBhdGggPT09ICcnICYmIHJvdXRlLnJlZGlyZWN0VG8gIT09IHZvaWQgMCAmJiByb3V0ZS5wYXRoTWF0Y2ggPT09IHZvaWQgMCkge1xuICAgIGNvbnN0IGV4cCA9XG4gICAgICAgIGBUaGUgZGVmYXVsdCB2YWx1ZSBvZiAncGF0aE1hdGNoJyBpcyAncHJlZml4JywgYnV0IG9mdGVuIHRoZSBpbnRlbnQgaXMgdG8gdXNlICdmdWxsJy5gO1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAne3BhdGg6IFwiJHtmdWxsUGF0aH1cIiwgcmVkaXJlY3RUbzogXCIke3JvdXRlLnJlZGlyZWN0VG99XCJ9JzogcGxlYXNlIHByb3ZpZGUgJ3BhdGhNYXRjaCcuICR7ZXhwfWApO1xuICB9XG4gIGlmIChyb3V0ZS5wYXRoTWF0Y2ggIT09IHZvaWQgMCAmJiByb3V0ZS5wYXRoTWF0Y2ggIT09ICdmdWxsJyAmJiByb3V0ZS5wYXRoTWF0Y2ggIT09ICdwcmVmaXgnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IHBhdGhNYXRjaCBjYW4gb25seSBiZSBzZXQgdG8gJ3ByZWZpeCcgb3IgJ2Z1bGwnYCk7XG4gIH1cbiAgaWYgKHJvdXRlLmNoaWxkcmVuKSB7XG4gICAgdmFsaWRhdGVDb25maWcocm91dGUuY2hpbGRyZW4sIGZ1bGxQYXRoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRGdWxsUGF0aChwYXJlbnRQYXRoOiBzdHJpbmcsIGN1cnJlbnRSb3V0ZTogUm91dGUpOiBzdHJpbmcge1xuICBpZiAoIWN1cnJlbnRSb3V0ZSkge1xuICAgIHJldHVybiBwYXJlbnRQYXRoO1xuICB9XG4gIGlmICghcGFyZW50UGF0aCAmJiAhY3VycmVudFJvdXRlLnBhdGgpIHtcbiAgICByZXR1cm4gJyc7XG4gIH0gZWxzZSBpZiAocGFyZW50UGF0aCAmJiAhY3VycmVudFJvdXRlLnBhdGgpIHtcbiAgICByZXR1cm4gYCR7cGFyZW50UGF0aH0vYDtcbiAgfSBlbHNlIGlmICghcGFyZW50UGF0aCAmJiBjdXJyZW50Um91dGUucGF0aCkge1xuICAgIHJldHVybiBjdXJyZW50Um91dGUucGF0aDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYCR7cGFyZW50UGF0aH0vJHtjdXJyZW50Um91dGUucGF0aH1gO1xuICB9XG59XG5cbi8qKlxuICogTWFrZXMgYSBjb3B5IG9mIHRoZSBjb25maWcgYW5kIGFkZHMgYW55IGRlZmF1bHQgcmVxdWlyZWQgcHJvcGVydGllcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YW5kYXJkaXplQ29uZmlnKHI6IFJvdXRlKTogUm91dGUge1xuICBjb25zdCBjaGlsZHJlbiA9IHIuY2hpbGRyZW4gJiYgci5jaGlsZHJlbi5tYXAoc3RhbmRhcmRpemVDb25maWcpO1xuICBjb25zdCBjID0gY2hpbGRyZW4gPyB7Li4uciwgY2hpbGRyZW59IDogey4uLnJ9O1xuICBpZiAoIWMuY29tcG9uZW50ICYmIChjaGlsZHJlbiB8fCBjLmxvYWRDaGlsZHJlbikgJiYgKGMub3V0bGV0ICYmIGMub3V0bGV0ICE9PSBQUklNQVJZX09VVExFVCkpIHtcbiAgICBjLmNvbXBvbmVudCA9IEVtcHR5T3V0bGV0Q29tcG9uZW50O1xuICB9XG4gIHJldHVybiBjO1xufVxuIl19