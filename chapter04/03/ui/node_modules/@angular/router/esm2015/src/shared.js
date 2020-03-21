/**
 * @fileoverview added by tsickle
 * Generated from: packages/router/src/shared.ts
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
 * The primary routing outlet.
 *
 * \@publicApi
 * @type {?}
 */
export const PRIMARY_OUTLET = 'primary';
/**
 * A map that provides access to the required and optional parameters
 * specific to a route.
 * The map supports retrieving a single value with `get()`
 * or multiple values with `getAll()`.
 *
 * @see [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
 *
 * \@publicApi
 * @record
 */
export function ParamMap() { }
if (false) {
    /**
     * Names of the parameters in the map.
     * @type {?}
     */
    ParamMap.prototype.keys;
    /**
     * Reports whether the map contains a given parameter.
     * @param {?} name The parameter name.
     * @return {?} True if the map contains the given parameter, false otherwise.
     */
    ParamMap.prototype.has = function (name) { };
    /**
     * Retrieves a single value for a parameter.
     * @param {?} name The parameter name.
     * @return {?} The parameter's single value,
     * or the first value if the parameter has multiple values,
     * or `null` when there is no such parameter.
     */
    ParamMap.prototype.get = function (name) { };
    /**
     * Retrieves multiple values for a parameter.
     * @param {?} name The parameter name.
     * @return {?} An array containing one or more values,
     * or an empty array if there is no such parameter.
     *
     */
    ParamMap.prototype.getAll = function (name) { };
}
class ParamsAsMap {
    /**
     * @param {?} params
     */
    constructor(params) { this.params = params || {}; }
    /**
     * @param {?} name
     * @return {?}
     */
    has(name) { return this.params.hasOwnProperty(name); }
    /**
     * @param {?} name
     * @return {?}
     */
    get(name) {
        if (this.has(name)) {
            /** @type {?} */
            const v = this.params[name];
            return Array.isArray(v) ? v[0] : v;
        }
        return null;
    }
    /**
     * @param {?} name
     * @return {?}
     */
    getAll(name) {
        if (this.has(name)) {
            /** @type {?} */
            const v = this.params[name];
            return Array.isArray(v) ? v : [v];
        }
        return [];
    }
    /**
     * @return {?}
     */
    get keys() { return Object.keys(this.params); }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    ParamsAsMap.prototype.params;
}
/**
 * Converts a `Params` instance to a `ParamMap`.
 * \@publicApi
 * @param {?} params The instance to convert.
 * @return {?} The new map instance.
 *
 */
export function convertToParamMap(params) {
    return new ParamsAsMap(params);
}
/** @type {?} */
const NAVIGATION_CANCELING_ERROR = 'ngNavigationCancelingError';
/**
 * @param {?} message
 * @return {?}
 */
export function navigationCancelingError(message) {
    /** @type {?} */
    const error = Error('NavigationCancelingError: ' + message);
    ((/** @type {?} */ (error)))[NAVIGATION_CANCELING_ERROR] = true;
    return error;
}
/**
 * @param {?} error
 * @return {?}
 */
export function isNavigationCancelingError(error) {
    return error && ((/** @type {?} */ (error)))[NAVIGATION_CANCELING_ERROR];
}
// Matches the route configuration (`route`) against the actual URL (`segments`).
/**
 * @param {?} segments
 * @param {?} segmentGroup
 * @param {?} route
 * @return {?}
 */
export function defaultUrlMatcher(segments, segmentGroup, route) {
    /** @type {?} */
    const parts = (/** @type {?} */ (route.path)).split('/');
    if (parts.length > segments.length) {
        // The actual URL is shorter than the config, no match
        return null;
    }
    if (route.pathMatch === 'full' &&
        (segmentGroup.hasChildren() || parts.length < segments.length)) {
        // The config is longer than the actual URL but we are looking for a full match, return null
        return null;
    }
    /** @type {?} */
    const posParams = {};
    // Check each config part against the actual URL
    for (let index = 0; index < parts.length; index++) {
        /** @type {?} */
        const part = parts[index];
        /** @type {?} */
        const segment = segments[index];
        /** @type {?} */
        const isParameter = part.startsWith(':');
        if (isParameter) {
            posParams[part.substring(1)] = segment;
        }
        else if (part !== segment.path) {
            // The actual URL part does not match the config, no match
            return null;
        }
    }
    return { consumed: segments.slice(0, parts.length), posParams };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9zaGFyZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBLE1BQU0sT0FBTyxjQUFjLEdBQUcsU0FBUzs7Ozs7Ozs7Ozs7O0FBdUJ2Qyw4QkEwQkM7Ozs7OztJQURDLHdCQUF3Qjs7Ozs7O0lBbkJ4Qiw2Q0FBMkI7Ozs7Ozs7O0lBUTNCLDZDQUErQjs7Ozs7Ozs7SUFRL0IsZ0RBQStCOztBQU1qQyxNQUFNLFdBQVc7Ozs7SUFHZixZQUFZLE1BQWMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7OztJQUUzRCxHQUFHLENBQUMsSUFBWSxJQUFhLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztJQUV2RSxHQUFHLENBQUMsSUFBWTtRQUNkLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTs7a0JBQ1osQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQzNCLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDcEM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Ozs7O0lBRUQsTUFBTSxDQUFDLElBQVk7UUFDakIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFOztrQkFDWixDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDM0IsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkM7UUFFRCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7Ozs7SUFFRCxJQUFJLElBQUksS0FBZSxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMxRDs7Ozs7O0lBekJDLDZCQUF1Qjs7Ozs7Ozs7O0FBa0N6QixNQUFNLFVBQVUsaUJBQWlCLENBQUMsTUFBYztJQUM5QyxPQUFPLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2pDLENBQUM7O01BRUssMEJBQTBCLEdBQUcsNEJBQTRCOzs7OztBQUUvRCxNQUFNLFVBQVUsd0JBQXdCLENBQUMsT0FBZTs7VUFDaEQsS0FBSyxHQUFHLEtBQUssQ0FBQyw0QkFBNEIsR0FBRyxPQUFPLENBQUM7SUFDM0QsQ0FBQyxtQkFBQSxLQUFLLEVBQU8sQ0FBQyxDQUFDLDBCQUEwQixDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ2xELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsMEJBQTBCLENBQUMsS0FBWTtJQUNyRCxPQUFPLEtBQUssSUFBSSxDQUFDLG1CQUFBLEtBQUssRUFBTyxDQUFDLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUM3RCxDQUFDOzs7Ozs7OztBQUdELE1BQU0sVUFBVSxpQkFBaUIsQ0FDN0IsUUFBc0IsRUFBRSxZQUE2QixFQUFFLEtBQVk7O1VBQy9ELEtBQUssR0FBRyxtQkFBQSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUVyQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRTtRQUNsQyxzREFBc0Q7UUFDdEQsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUVELElBQUksS0FBSyxDQUFDLFNBQVMsS0FBSyxNQUFNO1FBQzFCLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ2xFLDRGQUE0RjtRQUM1RixPQUFPLElBQUksQ0FBQztLQUNiOztVQUVLLFNBQVMsR0FBZ0MsRUFBRTtJQUVqRCxnREFBZ0Q7SUFDaEQsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7O2NBQzNDLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDOztjQUNuQixPQUFPLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQzs7Y0FDekIsV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDO1FBQ3hDLElBQUksV0FBVyxFQUFFO1lBQ2YsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7U0FDeEM7YUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQ2hDLDBEQUEwRDtZQUMxRCxPQUFPLElBQUksQ0FBQztTQUNiO0tBQ0Y7SUFFRCxPQUFPLEVBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLEVBQUMsQ0FBQztBQUNoRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1JvdXRlLCBVcmxNYXRjaFJlc3VsdH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtVcmxTZWdtZW50LCBVcmxTZWdtZW50R3JvdXB9IGZyb20gJy4vdXJsX3RyZWUnO1xuXG5cbi8qKlxuICogVGhlIHByaW1hcnkgcm91dGluZyBvdXRsZXQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgUFJJTUFSWV9PVVRMRVQgPSAncHJpbWFyeSc7XG5cbi8qKlxuICogQSBjb2xsZWN0aW9uIG9mIG1hdHJpeCBhbmQgcXVlcnkgVVJMIHBhcmFtZXRlcnMuXG4gKiBAc2VlIGBjb252ZXJ0VG9QYXJhbU1hcCgpYFxuICogQHNlZSBgUGFyYW1NYXBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBQYXJhbXMgPSB7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn07XG5cbi8qKlxuICogQSBtYXAgdGhhdCBwcm92aWRlcyBhY2Nlc3MgdG8gdGhlIHJlcXVpcmVkIGFuZCBvcHRpb25hbCBwYXJhbWV0ZXJzXG4gKiBzcGVjaWZpYyB0byBhIHJvdXRlLlxuICogVGhlIG1hcCBzdXBwb3J0cyByZXRyaWV2aW5nIGEgc2luZ2xlIHZhbHVlIHdpdGggYGdldCgpYFxuICogb3IgbXVsdGlwbGUgdmFsdWVzIHdpdGggYGdldEFsbCgpYC5cbiAqXG4gKiBAc2VlIFtVUkxTZWFyY2hQYXJhbXNdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9VUkxTZWFyY2hQYXJhbXMpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBhcmFtTWFwIHtcbiAgLyoqXG4gICAqIFJlcG9ydHMgd2hldGhlciB0aGUgbWFwIGNvbnRhaW5zIGEgZ2l2ZW4gcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0gbmFtZSBUaGUgcGFyYW1ldGVyIG5hbWUuXG4gICAqIEByZXR1cm5zIFRydWUgaWYgdGhlIG1hcCBjb250YWlucyB0aGUgZ2l2ZW4gcGFyYW1ldGVyLCBmYWxzZSBvdGhlcndpc2UuXG4gICAqL1xuICBoYXMobmFtZTogc3RyaW5nKTogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhIHNpbmdsZSB2YWx1ZSBmb3IgYSBwYXJhbWV0ZXIuXG4gICAqIEBwYXJhbSBuYW1lIFRoZSBwYXJhbWV0ZXIgbmFtZS5cbiAgICogQHJldHVybiBUaGUgcGFyYW1ldGVyJ3Mgc2luZ2xlIHZhbHVlLFxuICAgKiBvciB0aGUgZmlyc3QgdmFsdWUgaWYgdGhlIHBhcmFtZXRlciBoYXMgbXVsdGlwbGUgdmFsdWVzLFxuICAgKiBvciBgbnVsbGAgd2hlbiB0aGVyZSBpcyBubyBzdWNoIHBhcmFtZXRlci5cbiAgICovXG4gIGdldChuYW1lOiBzdHJpbmcpOiBzdHJpbmd8bnVsbDtcbiAgLyoqXG4gICAqIFJldHJpZXZlcyBtdWx0aXBsZSB2YWx1ZXMgZm9yIGEgcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0gbmFtZSBUaGUgcGFyYW1ldGVyIG5hbWUuXG4gICAqIEByZXR1cm4gQW4gYXJyYXkgY29udGFpbmluZyBvbmUgb3IgbW9yZSB2YWx1ZXMsXG4gICAqIG9yIGFuIGVtcHR5IGFycmF5IGlmIHRoZXJlIGlzIG5vIHN1Y2ggcGFyYW1ldGVyLlxuICAgKlxuICAgKi9cbiAgZ2V0QWxsKG5hbWU6IHN0cmluZyk6IHN0cmluZ1tdO1xuXG4gIC8qKiBOYW1lcyBvZiB0aGUgcGFyYW1ldGVycyBpbiB0aGUgbWFwLiAqL1xuICByZWFkb25seSBrZXlzOiBzdHJpbmdbXTtcbn1cblxuY2xhc3MgUGFyYW1zQXNNYXAgaW1wbGVtZW50cyBQYXJhbU1hcCB7XG4gIHByaXZhdGUgcGFyYW1zOiBQYXJhbXM7XG5cbiAgY29uc3RydWN0b3IocGFyYW1zOiBQYXJhbXMpIHsgdGhpcy5wYXJhbXMgPSBwYXJhbXMgfHwge307IH1cblxuICBoYXMobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnBhcmFtcy5oYXNPd25Qcm9wZXJ0eShuYW1lKTsgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgaWYgKHRoaXMuaGFzKG5hbWUpKSB7XG4gICAgICBjb25zdCB2ID0gdGhpcy5wYXJhbXNbbmFtZV07XG4gICAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2KSA/IHZbMF0gOiB2O1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2V0QWxsKG5hbWU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICBpZiAodGhpcy5oYXMobmFtZSkpIHtcbiAgICAgIGNvbnN0IHYgPSB0aGlzLnBhcmFtc1tuYW1lXTtcbiAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHYpID8gdiA6IFt2XTtcbiAgICB9XG5cbiAgICByZXR1cm4gW107XG4gIH1cblxuICBnZXQga2V5cygpOiBzdHJpbmdbXSB7IHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnBhcmFtcyk7IH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIGBQYXJhbXNgIGluc3RhbmNlIHRvIGEgYFBhcmFtTWFwYC5cbiAqIEBwYXJhbSBwYXJhbXMgVGhlIGluc3RhbmNlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyBUaGUgbmV3IG1hcCBpbnN0YW5jZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0VG9QYXJhbU1hcChwYXJhbXM6IFBhcmFtcyk6IFBhcmFtTWFwIHtcbiAgcmV0dXJuIG5ldyBQYXJhbXNBc01hcChwYXJhbXMpO1xufVxuXG5jb25zdCBOQVZJR0FUSU9OX0NBTkNFTElOR19FUlJPUiA9ICduZ05hdmlnYXRpb25DYW5jZWxpbmdFcnJvcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBuYXZpZ2F0aW9uQ2FuY2VsaW5nRXJyb3IobWVzc2FnZTogc3RyaW5nKSB7XG4gIGNvbnN0IGVycm9yID0gRXJyb3IoJ05hdmlnYXRpb25DYW5jZWxpbmdFcnJvcjogJyArIG1lc3NhZ2UpO1xuICAoZXJyb3IgYXMgYW55KVtOQVZJR0FUSU9OX0NBTkNFTElOR19FUlJPUl0gPSB0cnVlO1xuICByZXR1cm4gZXJyb3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05hdmlnYXRpb25DYW5jZWxpbmdFcnJvcihlcnJvcjogRXJyb3IpIHtcbiAgcmV0dXJuIGVycm9yICYmIChlcnJvciBhcyBhbnkpW05BVklHQVRJT05fQ0FOQ0VMSU5HX0VSUk9SXTtcbn1cblxuLy8gTWF0Y2hlcyB0aGUgcm91dGUgY29uZmlndXJhdGlvbiAoYHJvdXRlYCkgYWdhaW5zdCB0aGUgYWN0dWFsIFVSTCAoYHNlZ21lbnRzYCkuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdFVybE1hdGNoZXIoXG4gICAgc2VnbWVudHM6IFVybFNlZ21lbnRbXSwgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIHJvdXRlOiBSb3V0ZSk6IFVybE1hdGNoUmVzdWx0fG51bGwge1xuICBjb25zdCBwYXJ0cyA9IHJvdXRlLnBhdGggIS5zcGxpdCgnLycpO1xuXG4gIGlmIChwYXJ0cy5sZW5ndGggPiBzZWdtZW50cy5sZW5ndGgpIHtcbiAgICAvLyBUaGUgYWN0dWFsIFVSTCBpcyBzaG9ydGVyIHRoYW4gdGhlIGNvbmZpZywgbm8gbWF0Y2hcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGlmIChyb3V0ZS5wYXRoTWF0Y2ggPT09ICdmdWxsJyAmJlxuICAgICAgKHNlZ21lbnRHcm91cC5oYXNDaGlsZHJlbigpIHx8IHBhcnRzLmxlbmd0aCA8IHNlZ21lbnRzLmxlbmd0aCkpIHtcbiAgICAvLyBUaGUgY29uZmlnIGlzIGxvbmdlciB0aGFuIHRoZSBhY3R1YWwgVVJMIGJ1dCB3ZSBhcmUgbG9va2luZyBmb3IgYSBmdWxsIG1hdGNoLCByZXR1cm4gbnVsbFxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgcG9zUGFyYW1zOiB7W2tleTogc3RyaW5nXTogVXJsU2VnbWVudH0gPSB7fTtcblxuICAvLyBDaGVjayBlYWNoIGNvbmZpZyBwYXJ0IGFnYWluc3QgdGhlIGFjdHVhbCBVUkxcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBhcnRzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgIGNvbnN0IHBhcnQgPSBwYXJ0c1tpbmRleF07XG4gICAgY29uc3Qgc2VnbWVudCA9IHNlZ21lbnRzW2luZGV4XTtcbiAgICBjb25zdCBpc1BhcmFtZXRlciA9IHBhcnQuc3RhcnRzV2l0aCgnOicpO1xuICAgIGlmIChpc1BhcmFtZXRlcikge1xuICAgICAgcG9zUGFyYW1zW3BhcnQuc3Vic3RyaW5nKDEpXSA9IHNlZ21lbnQ7XG4gICAgfSBlbHNlIGlmIChwYXJ0ICE9PSBzZWdtZW50LnBhdGgpIHtcbiAgICAgIC8vIFRoZSBhY3R1YWwgVVJMIHBhcnQgZG9lcyBub3QgbWF0Y2ggdGhlIGNvbmZpZywgbm8gbWF0Y2hcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7Y29uc3VtZWQ6IHNlZ21lbnRzLnNsaWNlKDAsIHBhcnRzLmxlbmd0aCksIHBvc1BhcmFtc307XG59XG4iXX0=