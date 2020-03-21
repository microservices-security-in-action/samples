/**
 * @fileoverview added by tsickle
 * Generated from: packages/router/src/recognize.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Observable, of } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot, inheritedParamsDataResolve } from './router_state';
import { PRIMARY_OUTLET, defaultUrlMatcher } from './shared';
import { UrlSegmentGroup, mapChildrenIntoArray } from './url_tree';
import { forEach, last } from './utils/collection';
import { TreeNode } from './utils/tree';
class NoMatch {
}
/**
 * @param {?} rootComponentType
 * @param {?} config
 * @param {?} urlTree
 * @param {?} url
 * @param {?=} paramsInheritanceStrategy
 * @param {?=} relativeLinkResolution
 * @return {?}
 */
export function recognize(rootComponentType, config, urlTree, url, paramsInheritanceStrategy = 'emptyOnly', relativeLinkResolution = 'legacy') {
    return new Recognizer(rootComponentType, config, urlTree, url, paramsInheritanceStrategy, relativeLinkResolution)
        .recognize();
}
class Recognizer {
    /**
     * @param {?} rootComponentType
     * @param {?} config
     * @param {?} urlTree
     * @param {?} url
     * @param {?} paramsInheritanceStrategy
     * @param {?} relativeLinkResolution
     */
    constructor(rootComponentType, config, urlTree, url, paramsInheritanceStrategy, relativeLinkResolution) {
        this.rootComponentType = rootComponentType;
        this.config = config;
        this.urlTree = urlTree;
        this.url = url;
        this.paramsInheritanceStrategy = paramsInheritanceStrategy;
        this.relativeLinkResolution = relativeLinkResolution;
    }
    /**
     * @return {?}
     */
    recognize() {
        try {
            /** @type {?} */
            const rootSegmentGroup = split(this.urlTree.root, [], [], this.config, this.relativeLinkResolution).segmentGroup;
            /** @type {?} */
            const children = this.processSegmentGroup(this.config, rootSegmentGroup, PRIMARY_OUTLET);
            /** @type {?} */
            const root = new ActivatedRouteSnapshot([], Object.freeze({}), Object.freeze(Object.assign({}, this.urlTree.queryParams)), (/** @type {?} */ (this.urlTree.fragment)), {}, PRIMARY_OUTLET, this.rootComponentType, null, this.urlTree.root, -1, {});
            /** @type {?} */
            const rootNode = new TreeNode(root, children);
            /** @type {?} */
            const routeState = new RouterStateSnapshot(this.url, rootNode);
            this.inheritParamsAndData(routeState._root);
            return of(routeState);
        }
        catch (e) {
            return new Observable((/**
             * @param {?} obs
             * @return {?}
             */
            (obs) => obs.error(e)));
        }
    }
    /**
     * @param {?} routeNode
     * @return {?}
     */
    inheritParamsAndData(routeNode) {
        /** @type {?} */
        const route = routeNode.value;
        /** @type {?} */
        const i = inheritedParamsDataResolve(route, this.paramsInheritanceStrategy);
        route.params = Object.freeze(i.params);
        route.data = Object.freeze(i.data);
        routeNode.children.forEach((/**
         * @param {?} n
         * @return {?}
         */
        n => this.inheritParamsAndData(n)));
    }
    /**
     * @param {?} config
     * @param {?} segmentGroup
     * @param {?} outlet
     * @return {?}
     */
    processSegmentGroup(config, segmentGroup, outlet) {
        if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
            return this.processChildren(config, segmentGroup);
        }
        return this.processSegment(config, segmentGroup, segmentGroup.segments, outlet);
    }
    /**
     * @param {?} config
     * @param {?} segmentGroup
     * @return {?}
     */
    processChildren(config, segmentGroup) {
        /** @type {?} */
        const children = mapChildrenIntoArray(segmentGroup, (/**
         * @param {?} child
         * @param {?} childOutlet
         * @return {?}
         */
        (child, childOutlet) => this.processSegmentGroup(config, child, childOutlet)));
        checkOutletNameUniqueness(children);
        sortActivatedRouteSnapshots(children);
        return children;
    }
    /**
     * @param {?} config
     * @param {?} segmentGroup
     * @param {?} segments
     * @param {?} outlet
     * @return {?}
     */
    processSegment(config, segmentGroup, segments, outlet) {
        for (const r of config) {
            try {
                return this.processSegmentAgainstRoute(r, segmentGroup, segments, outlet);
            }
            catch (e) {
                if (!(e instanceof NoMatch))
                    throw e;
            }
        }
        if (this.noLeftoversInUrl(segmentGroup, segments, outlet)) {
            return [];
        }
        throw new NoMatch();
    }
    /**
     * @private
     * @param {?} segmentGroup
     * @param {?} segments
     * @param {?} outlet
     * @return {?}
     */
    noLeftoversInUrl(segmentGroup, segments, outlet) {
        return segments.length === 0 && !segmentGroup.children[outlet];
    }
    /**
     * @param {?} route
     * @param {?} rawSegment
     * @param {?} segments
     * @param {?} outlet
     * @return {?}
     */
    processSegmentAgainstRoute(route, rawSegment, segments, outlet) {
        if (route.redirectTo)
            throw new NoMatch();
        if ((route.outlet || PRIMARY_OUTLET) !== outlet)
            throw new NoMatch();
        /** @type {?} */
        let snapshot;
        /** @type {?} */
        let consumedSegments = [];
        /** @type {?} */
        let rawSlicedSegments = [];
        if (route.path === '**') {
            /** @type {?} */
            const params = segments.length > 0 ? (/** @type {?} */ (last(segments))).parameters : {};
            snapshot = new ActivatedRouteSnapshot(segments, params, Object.freeze(Object.assign({}, this.urlTree.queryParams)), (/** @type {?} */ (this.urlTree.fragment)), getData(route), outlet, (/** @type {?} */ (route.component)), route, getSourceSegmentGroup(rawSegment), getPathIndexShift(rawSegment) + segments.length, getResolve(route));
        }
        else {
            /** @type {?} */
            const result = match(rawSegment, route, segments);
            consumedSegments = result.consumedSegments;
            rawSlicedSegments = segments.slice(result.lastChild);
            snapshot = new ActivatedRouteSnapshot(consumedSegments, result.parameters, Object.freeze(Object.assign({}, this.urlTree.queryParams)), (/** @type {?} */ (this.urlTree.fragment)), getData(route), outlet, (/** @type {?} */ (route.component)), route, getSourceSegmentGroup(rawSegment), getPathIndexShift(rawSegment) + consumedSegments.length, getResolve(route));
        }
        /** @type {?} */
        const childConfig = getChildConfig(route);
        const { segmentGroup, slicedSegments } = split(rawSegment, consumedSegments, rawSlicedSegments, childConfig, this.relativeLinkResolution);
        if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
            /** @type {?} */
            const children = this.processChildren(childConfig, segmentGroup);
            return [new TreeNode(snapshot, children)];
        }
        if (childConfig.length === 0 && slicedSegments.length === 0) {
            return [new TreeNode(snapshot, [])];
        }
        /** @type {?} */
        const children = this.processSegment(childConfig, segmentGroup, slicedSegments, PRIMARY_OUTLET);
        return [new TreeNode(snapshot, children)];
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    Recognizer.prototype.rootComponentType;
    /**
     * @type {?}
     * @private
     */
    Recognizer.prototype.config;
    /**
     * @type {?}
     * @private
     */
    Recognizer.prototype.urlTree;
    /**
     * @type {?}
     * @private
     */
    Recognizer.prototype.url;
    /**
     * @type {?}
     * @private
     */
    Recognizer.prototype.paramsInheritanceStrategy;
    /**
     * @type {?}
     * @private
     */
    Recognizer.prototype.relativeLinkResolution;
}
/**
 * @param {?} nodes
 * @return {?}
 */
function sortActivatedRouteSnapshots(nodes) {
    nodes.sort((/**
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    (a, b) => {
        if (a.value.outlet === PRIMARY_OUTLET)
            return -1;
        if (b.value.outlet === PRIMARY_OUTLET)
            return 1;
        return a.value.outlet.localeCompare(b.value.outlet);
    }));
}
/**
 * @param {?} route
 * @return {?}
 */
function getChildConfig(route) {
    if (route.children) {
        return route.children;
    }
    if (route.loadChildren) {
        return (/** @type {?} */ (route._loadedConfig)).routes;
    }
    return [];
}
/**
 * @record
 */
function MatchResult() { }
if (false) {
    /** @type {?} */
    MatchResult.prototype.consumedSegments;
    /** @type {?} */
    MatchResult.prototype.lastChild;
    /** @type {?} */
    MatchResult.prototype.parameters;
}
/**
 * @param {?} segmentGroup
 * @param {?} route
 * @param {?} segments
 * @return {?}
 */
function match(segmentGroup, route, segments) {
    if (route.path === '') {
        if (route.pathMatch === 'full' && (segmentGroup.hasChildren() || segments.length > 0)) {
            throw new NoMatch();
        }
        return { consumedSegments: [], lastChild: 0, parameters: {} };
    }
    /** @type {?} */
    const matcher = route.matcher || defaultUrlMatcher;
    /** @type {?} */
    const res = matcher(segments, segmentGroup, route);
    if (!res)
        throw new NoMatch();
    /** @type {?} */
    const posParams = {};
    forEach((/** @type {?} */ (res.posParams)), (/**
     * @param {?} v
     * @param {?} k
     * @return {?}
     */
    (v, k) => { posParams[k] = v.path; }));
    /** @type {?} */
    const parameters = res.consumed.length > 0 ? Object.assign(Object.assign({}, posParams), res.consumed[res.consumed.length - 1].parameters) :
        posParams;
    return { consumedSegments: res.consumed, lastChild: res.consumed.length, parameters };
}
/**
 * @param {?} nodes
 * @return {?}
 */
function checkOutletNameUniqueness(nodes) {
    /** @type {?} */
    const names = {};
    nodes.forEach((/**
     * @param {?} n
     * @return {?}
     */
    n => {
        /** @type {?} */
        const routeWithSameOutletName = names[n.value.outlet];
        if (routeWithSameOutletName) {
            /** @type {?} */
            const p = routeWithSameOutletName.url.map((/**
             * @param {?} s
             * @return {?}
             */
            s => s.toString())).join('/');
            /** @type {?} */
            const c = n.value.url.map((/**
             * @param {?} s
             * @return {?}
             */
            s => s.toString())).join('/');
            throw new Error(`Two segments cannot have the same outlet name: '${p}' and '${c}'.`);
        }
        names[n.value.outlet] = n.value;
    }));
}
/**
 * @param {?} segmentGroup
 * @return {?}
 */
function getSourceSegmentGroup(segmentGroup) {
    /** @type {?} */
    let s = segmentGroup;
    while (s._sourceSegment) {
        s = s._sourceSegment;
    }
    return s;
}
/**
 * @param {?} segmentGroup
 * @return {?}
 */
function getPathIndexShift(segmentGroup) {
    /** @type {?} */
    let s = segmentGroup;
    /** @type {?} */
    let res = (s._segmentIndexShift ? s._segmentIndexShift : 0);
    while (s._sourceSegment) {
        s = s._sourceSegment;
        res += (s._segmentIndexShift ? s._segmentIndexShift : 0);
    }
    return res - 1;
}
/**
 * @param {?} segmentGroup
 * @param {?} consumedSegments
 * @param {?} slicedSegments
 * @param {?} config
 * @param {?} relativeLinkResolution
 * @return {?}
 */
function split(segmentGroup, consumedSegments, slicedSegments, config, relativeLinkResolution) {
    if (slicedSegments.length > 0 &&
        containsEmptyPathMatchesWithNamedOutlets(segmentGroup, slicedSegments, config)) {
        /** @type {?} */
        const s = new UrlSegmentGroup(consumedSegments, createChildrenForEmptyPaths(segmentGroup, consumedSegments, config, new UrlSegmentGroup(slicedSegments, segmentGroup.children)));
        s._sourceSegment = segmentGroup;
        s._segmentIndexShift = consumedSegments.length;
        return { segmentGroup: s, slicedSegments: [] };
    }
    if (slicedSegments.length === 0 &&
        containsEmptyPathMatches(segmentGroup, slicedSegments, config)) {
        /** @type {?} */
        const s = new UrlSegmentGroup(segmentGroup.segments, addEmptyPathsToChildrenIfNeeded(segmentGroup, consumedSegments, slicedSegments, config, segmentGroup.children, relativeLinkResolution));
        s._sourceSegment = segmentGroup;
        s._segmentIndexShift = consumedSegments.length;
        return { segmentGroup: s, slicedSegments };
    }
    /** @type {?} */
    const s = new UrlSegmentGroup(segmentGroup.segments, segmentGroup.children);
    s._sourceSegment = segmentGroup;
    s._segmentIndexShift = consumedSegments.length;
    return { segmentGroup: s, slicedSegments };
}
/**
 * @param {?} segmentGroup
 * @param {?} consumedSegments
 * @param {?} slicedSegments
 * @param {?} routes
 * @param {?} children
 * @param {?} relativeLinkResolution
 * @return {?}
 */
function addEmptyPathsToChildrenIfNeeded(segmentGroup, consumedSegments, slicedSegments, routes, children, relativeLinkResolution) {
    /** @type {?} */
    const res = {};
    for (const r of routes) {
        if (emptyPathMatch(segmentGroup, slicedSegments, r) && !children[getOutlet(r)]) {
            /** @type {?} */
            const s = new UrlSegmentGroup([], {});
            s._sourceSegment = segmentGroup;
            if (relativeLinkResolution === 'legacy') {
                s._segmentIndexShift = segmentGroup.segments.length;
            }
            else {
                s._segmentIndexShift = consumedSegments.length;
            }
            res[getOutlet(r)] = s;
        }
    }
    return Object.assign(Object.assign({}, children), res);
}
/**
 * @param {?} segmentGroup
 * @param {?} consumedSegments
 * @param {?} routes
 * @param {?} primarySegment
 * @return {?}
 */
function createChildrenForEmptyPaths(segmentGroup, consumedSegments, routes, primarySegment) {
    /** @type {?} */
    const res = {};
    res[PRIMARY_OUTLET] = primarySegment;
    primarySegment._sourceSegment = segmentGroup;
    primarySegment._segmentIndexShift = consumedSegments.length;
    for (const r of routes) {
        if (r.path === '' && getOutlet(r) !== PRIMARY_OUTLET) {
            /** @type {?} */
            const s = new UrlSegmentGroup([], {});
            s._sourceSegment = segmentGroup;
            s._segmentIndexShift = consumedSegments.length;
            res[getOutlet(r)] = s;
        }
    }
    return res;
}
/**
 * @param {?} segmentGroup
 * @param {?} slicedSegments
 * @param {?} routes
 * @return {?}
 */
function containsEmptyPathMatchesWithNamedOutlets(segmentGroup, slicedSegments, routes) {
    return routes.some((/**
     * @param {?} r
     * @return {?}
     */
    r => emptyPathMatch(segmentGroup, slicedSegments, r) && getOutlet(r) !== PRIMARY_OUTLET));
}
/**
 * @param {?} segmentGroup
 * @param {?} slicedSegments
 * @param {?} routes
 * @return {?}
 */
function containsEmptyPathMatches(segmentGroup, slicedSegments, routes) {
    return routes.some((/**
     * @param {?} r
     * @return {?}
     */
    r => emptyPathMatch(segmentGroup, slicedSegments, r)));
}
/**
 * @param {?} segmentGroup
 * @param {?} slicedSegments
 * @param {?} r
 * @return {?}
 */
function emptyPathMatch(segmentGroup, slicedSegments, r) {
    if ((segmentGroup.hasChildren() || slicedSegments.length > 0) && r.pathMatch === 'full') {
        return false;
    }
    return r.path === '' && r.redirectTo === undefined;
}
/**
 * @param {?} route
 * @return {?}
 */
function getOutlet(route) {
    return route.outlet || PRIMARY_OUTLET;
}
/**
 * @param {?} route
 * @return {?}
 */
function getData(route) {
    return route.data || {};
}
/**
 * @param {?} route
 * @return {?}
 */
function getResolve(route) {
    return route.resolve || {};
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb2duaXplLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9yZWNvZ25pemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBU0EsT0FBTyxFQUFDLFVBQVUsRUFBWSxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFHL0MsT0FBTyxFQUFDLHNCQUFzQixFQUE2QixtQkFBbUIsRUFBRSwwQkFBMEIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2xJLE9BQU8sRUFBQyxjQUFjLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDM0QsT0FBTyxFQUFhLGVBQWUsRUFBVyxvQkFBb0IsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUN0RixPQUFPLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFdEMsTUFBTSxPQUFPO0NBQUc7Ozs7Ozs7Ozs7QUFFaEIsTUFBTSxVQUFVLFNBQVMsQ0FDckIsaUJBQWtDLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsR0FBVyxFQUNqRiw0QkFBdUQsV0FBVyxFQUNsRSx5QkFBaUQsUUFBUTtJQUMzRCxPQUFPLElBQUksVUFBVSxDQUNWLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLHlCQUF5QixFQUNsRSxzQkFBc0IsQ0FBQztTQUM3QixTQUFTLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsTUFBTSxVQUFVOzs7Ozs7Ozs7SUFDZCxZQUNZLGlCQUFpQyxFQUFVLE1BQWMsRUFBVSxPQUFnQixFQUNuRixHQUFXLEVBQVUseUJBQW9ELEVBQ3pFLHNCQUE0QztRQUY1QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWdCO1FBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFVLFlBQU8sR0FBUCxPQUFP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Q0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsS0FBSyxNQUFNLEVBQUU7UUFDdkYsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELE9BQU8sQ0FBQyxDQUFDLElBQUksS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUM7QUFDckQsQ0FBQzs7Ozs7QUFFRCxTQUFTLFNBQVMsQ0FBQyxLQUFZO0lBQzdCLE9BQU8sS0FBSyxDQUFDLE1BQU0sSUFBSSxjQUFjLENBQUM7QUFDeEMsQ0FBQzs7Ozs7QUFFRCxTQUFTLE9BQU8sQ0FBQyxLQUFZO0lBQzNCLE9BQU8sS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7QUFDMUIsQ0FBQzs7Ozs7QUFFRCxTQUFTLFVBQVUsQ0FBQyxLQUFZO0lBQzlCLE9BQU8sS0FBSyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7QUFDN0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgT2JzZXJ2ZXIsIG9mIH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7RGF0YSwgUmVzb2x2ZURhdGEsIFJvdXRlLCBSb3V0ZXN9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgUGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSwgUm91dGVyU3RhdGVTbmFwc2hvdCwgaW5oZXJpdGVkUGFyYW1zRGF0YVJlc29sdmV9IGZyb20gJy4vcm91dGVyX3N0YXRlJztcbmltcG9ydCB7UFJJTUFSWV9PVVRMRVQsIGRlZmF1bHRVcmxNYXRjaGVyfSBmcm9tICcuL3NoYXJlZCc7XG5pbXBvcnQge1VybFNlZ21lbnQsIFVybFNlZ21lbnRHcm91cCwgVXJsVHJlZSwgbWFwQ2hpbGRyZW5JbnRvQXJyYXl9IGZyb20gJy4vdXJsX3RyZWUnO1xuaW1wb3J0IHtmb3JFYWNoLCBsYXN0fSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtUcmVlTm9kZX0gZnJvbSAnLi91dGlscy90cmVlJztcblxuY2xhc3MgTm9NYXRjaCB7fVxuXG5leHBvcnQgZnVuY3Rpb24gcmVjb2duaXplKFxuICAgIHJvb3RDb21wb25lbnRUeXBlOiBUeXBlPGFueT58IG51bGwsIGNvbmZpZzogUm91dGVzLCB1cmxUcmVlOiBVcmxUcmVlLCB1cmw6IHN0cmluZyxcbiAgICBwYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5OiBQYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5ID0gJ2VtcHR5T25seScsXG4gICAgcmVsYXRpdmVMaW5rUmVzb2x1dGlvbjogJ2xlZ2FjeScgfCAnY29ycmVjdGVkJyA9ICdsZWdhY3knKTogT2JzZXJ2YWJsZTxSb3V0ZXJTdGF0ZVNuYXBzaG90PiB7XG4gIHJldHVybiBuZXcgUmVjb2duaXplcihcbiAgICAgICAgICAgICByb290Q29tcG9uZW50VHlwZSwgY29uZmlnLCB1cmxUcmVlLCB1cmwsIHBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3ksXG4gICAgICAgICAgICAgcmVsYXRpdmVMaW5rUmVzb2x1dGlvbilcbiAgICAgIC5yZWNvZ25pemUoKTtcbn1cblxuY2xhc3MgUmVjb2duaXplciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSByb290Q29tcG9uZW50VHlwZTogVHlwZTxhbnk+fG51bGwsIHByaXZhdGUgY29uZmlnOiBSb3V0ZXMsIHByaXZhdGUgdXJsVHJlZTogVXJsVHJlZSxcbiAgICAgIHByaXZhdGUgdXJsOiBzdHJpbmcsIHByaXZhdGUgcGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneTogUGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSxcbiAgICAgIHByaXZhdGUgcmVsYXRpdmVMaW5rUmVzb2x1dGlvbjogJ2xlZ2FjeSd8J2NvcnJlY3RlZCcpIHt9XG5cbiAgcmVjb2duaXplKCk6IE9ic2VydmFibGU8Um91dGVyU3RhdGVTbmFwc2hvdD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByb290U2VnbWVudEdyb3VwID1cbiAgICAgICAgICBzcGxpdCh0aGlzLnVybFRyZWUucm9vdCwgW10sIFtdLCB0aGlzLmNvbmZpZywgdGhpcy5yZWxhdGl2ZUxpbmtSZXNvbHV0aW9uKS5zZWdtZW50R3JvdXA7XG5cbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5wcm9jZXNzU2VnbWVudEdyb3VwKHRoaXMuY29uZmlnLCByb290U2VnbWVudEdyb3VwLCBQUklNQVJZX09VVExFVCk7XG5cbiAgICAgIGNvbnN0IHJvb3QgPSBuZXcgQWN0aXZhdGVkUm91dGVTbmFwc2hvdChcbiAgICAgICAgICBbXSwgT2JqZWN0LmZyZWV6ZSh7fSksIE9iamVjdC5mcmVlemUoey4uLnRoaXMudXJsVHJlZS5xdWVyeVBhcmFtc30pLFxuICAgICAgICAgIHRoaXMudXJsVHJlZS5mcmFnbWVudCAhLCB7fSwgUFJJTUFSWV9PVVRMRVQsIHRoaXMucm9vdENvbXBvbmVudFR5cGUsIG51bGwsXG4gICAgICAgICAgdGhpcy51cmxUcmVlLnJvb3QsIC0xLCB7fSk7XG5cbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gbmV3IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+KHJvb3QsIGNoaWxkcmVuKTtcbiAgICAgIGNvbnN0IHJvdXRlU3RhdGUgPSBuZXcgUm91dGVyU3RhdGVTbmFwc2hvdCh0aGlzLnVybCwgcm9vdE5vZGUpO1xuICAgICAgdGhpcy5pbmhlcml0UGFyYW1zQW5kRGF0YShyb3V0ZVN0YXRlLl9yb290KTtcbiAgICAgIHJldHVybiBvZiAocm91dGVTdGF0ZSk7XG5cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8Um91dGVyU3RhdGVTbmFwc2hvdD4oXG4gICAgICAgICAgKG9iczogT2JzZXJ2ZXI8Um91dGVyU3RhdGVTbmFwc2hvdD4pID0+IG9icy5lcnJvcihlKSk7XG4gICAgfVxuICB9XG5cbiAgaW5oZXJpdFBhcmFtc0FuZERhdGEocm91dGVOb2RlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90Pik6IHZvaWQge1xuICAgIGNvbnN0IHJvdXRlID0gcm91dGVOb2RlLnZhbHVlO1xuXG4gICAgY29uc3QgaSA9IGluaGVyaXRlZFBhcmFtc0RhdGFSZXNvbHZlKHJvdXRlLCB0aGlzLnBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3kpO1xuICAgIHJvdXRlLnBhcmFtcyA9IE9iamVjdC5mcmVlemUoaS5wYXJhbXMpO1xuICAgIHJvdXRlLmRhdGEgPSBPYmplY3QuZnJlZXplKGkuZGF0YSk7XG5cbiAgICByb3V0ZU5vZGUuY2hpbGRyZW4uZm9yRWFjaChuID0+IHRoaXMuaW5oZXJpdFBhcmFtc0FuZERhdGEobikpO1xuICB9XG5cbiAgcHJvY2Vzc1NlZ21lbnRHcm91cChjb25maWc6IFJvdXRlW10sIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCBvdXRsZXQ6IHN0cmluZyk6XG4gICAgICBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PltdIHtcbiAgICBpZiAoc2VnbWVudEdyb3VwLnNlZ21lbnRzLmxlbmd0aCA9PT0gMCAmJiBzZWdtZW50R3JvdXAuaGFzQ2hpbGRyZW4oKSkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc0NoaWxkcmVuKGNvbmZpZywgc2VnbWVudEdyb3VwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wcm9jZXNzU2VnbWVudChjb25maWcsIHNlZ21lbnRHcm91cCwgc2VnbWVudEdyb3VwLnNlZ21lbnRzLCBvdXRsZXQpO1xuICB9XG5cbiAgcHJvY2Vzc0NoaWxkcmVuKGNvbmZpZzogUm91dGVbXSwgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXApOlxuICAgICAgVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD5bXSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBtYXBDaGlsZHJlbkludG9BcnJheShcbiAgICAgICAgc2VnbWVudEdyb3VwLCAoY2hpbGQsIGNoaWxkT3V0bGV0KSA9PiB0aGlzLnByb2Nlc3NTZWdtZW50R3JvdXAoY29uZmlnLCBjaGlsZCwgY2hpbGRPdXRsZXQpKTtcbiAgICBjaGVja091dGxldE5hbWVVbmlxdWVuZXNzKGNoaWxkcmVuKTtcbiAgICBzb3J0QWN0aXZhdGVkUm91dGVTbmFwc2hvdHMoY2hpbGRyZW4pO1xuICAgIHJldHVybiBjaGlsZHJlbjtcbiAgfVxuXG4gIHByb2Nlc3NTZWdtZW50KFxuICAgICAgY29uZmlnOiBSb3V0ZVtdLCBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCwgc2VnbWVudHM6IFVybFNlZ21lbnRbXSxcbiAgICAgIG91dGxldDogc3RyaW5nKTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD5bXSB7XG4gICAgZm9yIChjb25zdCByIG9mIGNvbmZpZykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc1NlZ21lbnRBZ2FpbnN0Um91dGUociwgc2VnbWVudEdyb3VwLCBzZWdtZW50cywgb3V0bGV0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIE5vTWF0Y2gpKSB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5ub0xlZnRvdmVyc0luVXJsKHNlZ21lbnRHcm91cCwgc2VnbWVudHMsIG91dGxldCkpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgTm9NYXRjaCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBub0xlZnRvdmVyc0luVXJsKHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCBzZWdtZW50czogVXJsU2VnbWVudFtdLCBvdXRsZXQ6IHN0cmluZyk6XG4gICAgICBib29sZWFuIHtcbiAgICByZXR1cm4gc2VnbWVudHMubGVuZ3RoID09PSAwICYmICFzZWdtZW50R3JvdXAuY2hpbGRyZW5bb3V0bGV0XTtcbiAgfVxuXG4gIHByb2Nlc3NTZWdtZW50QWdhaW5zdFJvdXRlKFxuICAgICAgcm91dGU6IFJvdXRlLCByYXdTZWdtZW50OiBVcmxTZWdtZW50R3JvdXAsIHNlZ21lbnRzOiBVcmxTZWdtZW50W10sXG4gICAgICBvdXRsZXQ6IHN0cmluZyk6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+W10ge1xuICAgIGlmIChyb3V0ZS5yZWRpcmVjdFRvKSB0aHJvdyBuZXcgTm9NYXRjaCgpO1xuXG4gICAgaWYgKChyb3V0ZS5vdXRsZXQgfHwgUFJJTUFSWV9PVVRMRVQpICE9PSBvdXRsZXQpIHRocm93IG5ldyBOb01hdGNoKCk7XG5cbiAgICBsZXQgc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3Q7XG4gICAgbGV0IGNvbnN1bWVkU2VnbWVudHM6IFVybFNlZ21lbnRbXSA9IFtdO1xuICAgIGxldCByYXdTbGljZWRTZWdtZW50czogVXJsU2VnbWVudFtdID0gW107XG5cbiAgICBpZiAocm91dGUucGF0aCA9PT0gJyoqJykge1xuICAgICAgY29uc3QgcGFyYW1zID0gc2VnbWVudHMubGVuZ3RoID4gMCA/IGxhc3Qoc2VnbWVudHMpICEucGFyYW1ldGVycyA6IHt9O1xuICAgICAgc25hcHNob3QgPSBuZXcgQWN0aXZhdGVkUm91dGVTbmFwc2hvdChcbiAgICAgICAgICBzZWdtZW50cywgcGFyYW1zLCBPYmplY3QuZnJlZXplKHsuLi50aGlzLnVybFRyZWUucXVlcnlQYXJhbXN9KSwgdGhpcy51cmxUcmVlLmZyYWdtZW50ICEsXG4gICAgICAgICAgZ2V0RGF0YShyb3V0ZSksIG91dGxldCwgcm91dGUuY29tcG9uZW50ICEsIHJvdXRlLCBnZXRTb3VyY2VTZWdtZW50R3JvdXAocmF3U2VnbWVudCksXG4gICAgICAgICAgZ2V0UGF0aEluZGV4U2hpZnQocmF3U2VnbWVudCkgKyBzZWdtZW50cy5sZW5ndGgsIGdldFJlc29sdmUocm91dGUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcmVzdWx0OiBNYXRjaFJlc3VsdCA9IG1hdGNoKHJhd1NlZ21lbnQsIHJvdXRlLCBzZWdtZW50cyk7XG4gICAgICBjb25zdW1lZFNlZ21lbnRzID0gcmVzdWx0LmNvbnN1bWVkU2VnbWVudHM7XG4gICAgICByYXdTbGljZWRTZWdtZW50cyA9IHNlZ21lbnRzLnNsaWNlKHJlc3VsdC5sYXN0Q2hpbGQpO1xuXG4gICAgICBzbmFwc2hvdCA9IG5ldyBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KFxuICAgICAgICAgIGNvbnN1bWVkU2VnbWVudHMsIHJlc3VsdC5wYXJhbWV0ZXJzLCBPYmplY3QuZnJlZXplKHsuLi50aGlzLnVybFRyZWUucXVlcnlQYXJhbXN9KSxcbiAgICAgICAgICB0aGlzLnVybFRyZWUuZnJhZ21lbnQgISwgZ2V0RGF0YShyb3V0ZSksIG91dGxldCwgcm91dGUuY29tcG9uZW50ICEsIHJvdXRlLFxuICAgICAgICAgIGdldFNvdXJjZVNlZ21lbnRHcm91cChyYXdTZWdtZW50KSxcbiAgICAgICAgICBnZXRQYXRoSW5kZXhTaGlmdChyYXdTZWdtZW50KSArIGNvbnN1bWVkU2VnbWVudHMubGVuZ3RoLCBnZXRSZXNvbHZlKHJvdXRlKSk7XG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRDb25maWc6IFJvdXRlW10gPSBnZXRDaGlsZENvbmZpZyhyb3V0ZSk7XG5cbiAgICBjb25zdCB7c2VnbWVudEdyb3VwLCBzbGljZWRTZWdtZW50c30gPSBzcGxpdChcbiAgICAgICAgcmF3U2VnbWVudCwgY29uc3VtZWRTZWdtZW50cywgcmF3U2xpY2VkU2VnbWVudHMsIGNoaWxkQ29uZmlnLCB0aGlzLnJlbGF0aXZlTGlua1Jlc29sdXRpb24pO1xuXG4gICAgaWYgKHNsaWNlZFNlZ21lbnRzLmxlbmd0aCA9PT0gMCAmJiBzZWdtZW50R3JvdXAuaGFzQ2hpbGRyZW4oKSkge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLnByb2Nlc3NDaGlsZHJlbihjaGlsZENvbmZpZywgc2VnbWVudEdyb3VwKTtcbiAgICAgIHJldHVybiBbbmV3IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+KHNuYXBzaG90LCBjaGlsZHJlbildO1xuICAgIH1cblxuICAgIGlmIChjaGlsZENvbmZpZy5sZW5ndGggPT09IDAgJiYgc2xpY2VkU2VnbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gW25ldyBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PihzbmFwc2hvdCwgW10pXTtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMucHJvY2Vzc1NlZ21lbnQoY2hpbGRDb25maWcsIHNlZ21lbnRHcm91cCwgc2xpY2VkU2VnbWVudHMsIFBSSU1BUllfT1VUTEVUKTtcbiAgICByZXR1cm4gW25ldyBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PihzbmFwc2hvdCwgY2hpbGRyZW4pXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzb3J0QWN0aXZhdGVkUm91dGVTbmFwc2hvdHMobm9kZXM6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+W10pOiB2b2lkIHtcbiAgbm9kZXMuc29ydCgoYSwgYikgPT4ge1xuICAgIGlmIChhLnZhbHVlLm91dGxldCA9PT0gUFJJTUFSWV9PVVRMRVQpIHJldHVybiAtMTtcbiAgICBpZiAoYi52YWx1ZS5vdXRsZXQgPT09IFBSSU1BUllfT1VUTEVUKSByZXR1cm4gMTtcbiAgICByZXR1cm4gYS52YWx1ZS5vdXRsZXQubG9jYWxlQ29tcGFyZShiLnZhbHVlLm91dGxldCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRDaGlsZENvbmZpZyhyb3V0ZTogUm91dGUpOiBSb3V0ZVtdIHtcbiAgaWYgKHJvdXRlLmNoaWxkcmVuKSB7XG4gICAgcmV0dXJuIHJvdXRlLmNoaWxkcmVuO1xuICB9XG5cbiAgaWYgKHJvdXRlLmxvYWRDaGlsZHJlbikge1xuICAgIHJldHVybiByb3V0ZS5fbG9hZGVkQ29uZmlnICEucm91dGVzO1xuICB9XG5cbiAgcmV0dXJuIFtdO1xufVxuXG5pbnRlcmZhY2UgTWF0Y2hSZXN1bHQge1xuICBjb25zdW1lZFNlZ21lbnRzOiBVcmxTZWdtZW50W107XG4gIGxhc3RDaGlsZDogbnVtYmVyO1xuICBwYXJhbWV0ZXJzOiBhbnk7XG59XG5cbmZ1bmN0aW9uIG1hdGNoKHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCByb3V0ZTogUm91dGUsIHNlZ21lbnRzOiBVcmxTZWdtZW50W10pOiBNYXRjaFJlc3VsdCB7XG4gIGlmIChyb3V0ZS5wYXRoID09PSAnJykge1xuICAgIGlmIChyb3V0ZS5wYXRoTWF0Y2ggPT09ICdmdWxsJyAmJiAoc2VnbWVudEdyb3VwLmhhc0NoaWxkcmVuKCkgfHwgc2VnbWVudHMubGVuZ3RoID4gMCkpIHtcbiAgICAgIHRocm93IG5ldyBOb01hdGNoKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtjb25zdW1lZFNlZ21lbnRzOiBbXSwgbGFzdENoaWxkOiAwLCBwYXJhbWV0ZXJzOiB7fX07XG4gIH1cblxuICBjb25zdCBtYXRjaGVyID0gcm91dGUubWF0Y2hlciB8fCBkZWZhdWx0VXJsTWF0Y2hlcjtcbiAgY29uc3QgcmVzID0gbWF0Y2hlcihzZWdtZW50cywgc2VnbWVudEdyb3VwLCByb3V0ZSk7XG4gIGlmICghcmVzKSB0aHJvdyBuZXcgTm9NYXRjaCgpO1xuXG4gIGNvbnN0IHBvc1BhcmFtczoge1tuOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIGZvckVhY2gocmVzLnBvc1BhcmFtcyAhLCAodjogVXJsU2VnbWVudCwgazogc3RyaW5nKSA9PiB7IHBvc1BhcmFtc1trXSA9IHYucGF0aDsgfSk7XG4gIGNvbnN0IHBhcmFtZXRlcnMgPSByZXMuY29uc3VtZWQubGVuZ3RoID4gMCA/XG4gICAgICB7Li4ucG9zUGFyYW1zLCAuLi5yZXMuY29uc3VtZWRbcmVzLmNvbnN1bWVkLmxlbmd0aCAtIDFdLnBhcmFtZXRlcnN9IDpcbiAgICAgIHBvc1BhcmFtcztcblxuICByZXR1cm4ge2NvbnN1bWVkU2VnbWVudHM6IHJlcy5jb25zdW1lZCwgbGFzdENoaWxkOiByZXMuY29uc3VtZWQubGVuZ3RoLCBwYXJhbWV0ZXJzfTtcbn1cblxuZnVuY3Rpb24gY2hlY2tPdXRsZXROYW1lVW5pcXVlbmVzcyhub2RlczogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD5bXSk6IHZvaWQge1xuICBjb25zdCBuYW1lczoge1trOiBzdHJpbmddOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90fSA9IHt9O1xuICBub2Rlcy5mb3JFYWNoKG4gPT4ge1xuICAgIGNvbnN0IHJvdXRlV2l0aFNhbWVPdXRsZXROYW1lID0gbmFtZXNbbi52YWx1ZS5vdXRsZXRdO1xuICAgIGlmIChyb3V0ZVdpdGhTYW1lT3V0bGV0TmFtZSkge1xuICAgICAgY29uc3QgcCA9IHJvdXRlV2l0aFNhbWVPdXRsZXROYW1lLnVybC5tYXAocyA9PiBzLnRvU3RyaW5nKCkpLmpvaW4oJy8nKTtcbiAgICAgIGNvbnN0IGMgPSBuLnZhbHVlLnVybC5tYXAocyA9PiBzLnRvU3RyaW5nKCkpLmpvaW4oJy8nKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVHdvIHNlZ21lbnRzIGNhbm5vdCBoYXZlIHRoZSBzYW1lIG91dGxldCBuYW1lOiAnJHtwfScgYW5kICcke2N9Jy5gKTtcbiAgICB9XG4gICAgbmFtZXNbbi52YWx1ZS5vdXRsZXRdID0gbi52YWx1ZTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNvdXJjZVNlZ21lbnRHcm91cChzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCk6IFVybFNlZ21lbnRHcm91cCB7XG4gIGxldCBzID0gc2VnbWVudEdyb3VwO1xuICB3aGlsZSAocy5fc291cmNlU2VnbWVudCkge1xuICAgIHMgPSBzLl9zb3VyY2VTZWdtZW50O1xuICB9XG4gIHJldHVybiBzO1xufVxuXG5mdW5jdGlvbiBnZXRQYXRoSW5kZXhTaGlmdChzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCk6IG51bWJlciB7XG4gIGxldCBzID0gc2VnbWVudEdyb3VwO1xuICBsZXQgcmVzID0gKHMuX3NlZ21lbnRJbmRleFNoaWZ0ID8gcy5fc2VnbWVudEluZGV4U2hpZnQgOiAwKTtcbiAgd2hpbGUgKHMuX3NvdXJjZVNlZ21lbnQpIHtcbiAgICBzID0gcy5fc291cmNlU2VnbWVudDtcbiAgICByZXMgKz0gKHMuX3NlZ21lbnRJbmRleFNoaWZ0ID8gcy5fc2VnbWVudEluZGV4U2hpZnQgOiAwKTtcbiAgfVxuICByZXR1cm4gcmVzIC0gMTtcbn1cblxuZnVuY3Rpb24gc3BsaXQoXG4gICAgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIGNvbnN1bWVkU2VnbWVudHM6IFVybFNlZ21lbnRbXSwgc2xpY2VkU2VnbWVudHM6IFVybFNlZ21lbnRbXSxcbiAgICBjb25maWc6IFJvdXRlW10sIHJlbGF0aXZlTGlua1Jlc29sdXRpb246ICdsZWdhY3knIHwgJ2NvcnJlY3RlZCcpIHtcbiAgaWYgKHNsaWNlZFNlZ21lbnRzLmxlbmd0aCA+IDAgJiZcbiAgICAgIGNvbnRhaW5zRW1wdHlQYXRoTWF0Y2hlc1dpdGhOYW1lZE91dGxldHMoc2VnbWVudEdyb3VwLCBzbGljZWRTZWdtZW50cywgY29uZmlnKSkge1xuICAgIGNvbnN0IHMgPSBuZXcgVXJsU2VnbWVudEdyb3VwKFxuICAgICAgICBjb25zdW1lZFNlZ21lbnRzLCBjcmVhdGVDaGlsZHJlbkZvckVtcHR5UGF0aHMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWdtZW50R3JvdXAsIGNvbnN1bWVkU2VnbWVudHMsIGNvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBVcmxTZWdtZW50R3JvdXAoc2xpY2VkU2VnbWVudHMsIHNlZ21lbnRHcm91cC5jaGlsZHJlbikpKTtcbiAgICBzLl9zb3VyY2VTZWdtZW50ID0gc2VnbWVudEdyb3VwO1xuICAgIHMuX3NlZ21lbnRJbmRleFNoaWZ0ID0gY29uc3VtZWRTZWdtZW50cy5sZW5ndGg7XG4gICAgcmV0dXJuIHtzZWdtZW50R3JvdXA6IHMsIHNsaWNlZFNlZ21lbnRzOiBbXX07XG4gIH1cblxuICBpZiAoc2xpY2VkU2VnbWVudHMubGVuZ3RoID09PSAwICYmXG4gICAgICBjb250YWluc0VtcHR5UGF0aE1hdGNoZXMoc2VnbWVudEdyb3VwLCBzbGljZWRTZWdtZW50cywgY29uZmlnKSkge1xuICAgIGNvbnN0IHMgPSBuZXcgVXJsU2VnbWVudEdyb3VwKFxuICAgICAgICBzZWdtZW50R3JvdXAuc2VnbWVudHMsIGFkZEVtcHR5UGF0aHNUb0NoaWxkcmVuSWZOZWVkZWQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnRHcm91cCwgY29uc3VtZWRTZWdtZW50cywgc2xpY2VkU2VnbWVudHMsIGNvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudEdyb3VwLmNoaWxkcmVuLCByZWxhdGl2ZUxpbmtSZXNvbHV0aW9uKSk7XG4gICAgcy5fc291cmNlU2VnbWVudCA9IHNlZ21lbnRHcm91cDtcbiAgICBzLl9zZWdtZW50SW5kZXhTaGlmdCA9IGNvbnN1bWVkU2VnbWVudHMubGVuZ3RoO1xuICAgIHJldHVybiB7c2VnbWVudEdyb3VwOiBzLCBzbGljZWRTZWdtZW50c307XG4gIH1cblxuICBjb25zdCBzID0gbmV3IFVybFNlZ21lbnRHcm91cChzZWdtZW50R3JvdXAuc2VnbWVudHMsIHNlZ21lbnRHcm91cC5jaGlsZHJlbik7XG4gIHMuX3NvdXJjZVNlZ21lbnQgPSBzZWdtZW50R3JvdXA7XG4gIHMuX3NlZ21lbnRJbmRleFNoaWZ0ID0gY29uc3VtZWRTZWdtZW50cy5sZW5ndGg7XG4gIHJldHVybiB7c2VnbWVudEdyb3VwOiBzLCBzbGljZWRTZWdtZW50c307XG59XG5cbmZ1bmN0aW9uIGFkZEVtcHR5UGF0aHNUb0NoaWxkcmVuSWZOZWVkZWQoXG4gICAgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIGNvbnN1bWVkU2VnbWVudHM6IFVybFNlZ21lbnRbXSwgc2xpY2VkU2VnbWVudHM6IFVybFNlZ21lbnRbXSxcbiAgICByb3V0ZXM6IFJvdXRlW10sIGNoaWxkcmVuOiB7W25hbWU6IHN0cmluZ106IFVybFNlZ21lbnRHcm91cH0sXG4gICAgcmVsYXRpdmVMaW5rUmVzb2x1dGlvbjogJ2xlZ2FjeScgfCAnY29ycmVjdGVkJyk6IHtbbmFtZTogc3RyaW5nXTogVXJsU2VnbWVudEdyb3VwfSB7XG4gIGNvbnN0IHJlczoge1tuYW1lOiBzdHJpbmddOiBVcmxTZWdtZW50R3JvdXB9ID0ge307XG4gIGZvciAoY29uc3QgciBvZiByb3V0ZXMpIHtcbiAgICBpZiAoZW1wdHlQYXRoTWF0Y2goc2VnbWVudEdyb3VwLCBzbGljZWRTZWdtZW50cywgcikgJiYgIWNoaWxkcmVuW2dldE91dGxldChyKV0pIHtcbiAgICAgIGNvbnN0IHMgPSBuZXcgVXJsU2VnbWVudEdyb3VwKFtdLCB7fSk7XG4gICAgICBzLl9zb3VyY2VTZWdtZW50ID0gc2VnbWVudEdyb3VwO1xuICAgICAgaWYgKHJlbGF0aXZlTGlua1Jlc29sdXRpb24gPT09ICdsZWdhY3knKSB7XG4gICAgICAgIHMuX3NlZ21lbnRJbmRleFNoaWZ0ID0gc2VnbWVudEdyb3VwLnNlZ21lbnRzLmxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMuX3NlZ21lbnRJbmRleFNoaWZ0ID0gY29uc3VtZWRTZWdtZW50cy5sZW5ndGg7XG4gICAgICB9XG4gICAgICByZXNbZ2V0T3V0bGV0KHIpXSA9IHM7XG4gICAgfVxuICB9XG4gIHJldHVybiB7Li4uY2hpbGRyZW4sIC4uLnJlc307XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNoaWxkcmVuRm9yRW1wdHlQYXRocyhcbiAgICBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCwgY29uc3VtZWRTZWdtZW50czogVXJsU2VnbWVudFtdLCByb3V0ZXM6IFJvdXRlW10sXG4gICAgcHJpbWFyeVNlZ21lbnQ6IFVybFNlZ21lbnRHcm91cCk6IHtbbmFtZTogc3RyaW5nXTogVXJsU2VnbWVudEdyb3VwfSB7XG4gIGNvbnN0IHJlczoge1tuYW1lOiBzdHJpbmddOiBVcmxTZWdtZW50R3JvdXB9ID0ge307XG4gIHJlc1tQUklNQVJZX09VVExFVF0gPSBwcmltYXJ5U2VnbWVudDtcbiAgcHJpbWFyeVNlZ21lbnQuX3NvdXJjZVNlZ21lbnQgPSBzZWdtZW50R3JvdXA7XG4gIHByaW1hcnlTZWdtZW50Ll9zZWdtZW50SW5kZXhTaGlmdCA9IGNvbnN1bWVkU2VnbWVudHMubGVuZ3RoO1xuXG4gIGZvciAoY29uc3QgciBvZiByb3V0ZXMpIHtcbiAgICBpZiAoci5wYXRoID09PSAnJyAmJiBnZXRPdXRsZXQocikgIT09IFBSSU1BUllfT1VUTEVUKSB7XG4gICAgICBjb25zdCBzID0gbmV3IFVybFNlZ21lbnRHcm91cChbXSwge30pO1xuICAgICAgcy5fc291cmNlU2VnbWVudCA9IHNlZ21lbnRHcm91cDtcbiAgICAgIHMuX3NlZ21lbnRJbmRleFNoaWZ0ID0gY29uc3VtZWRTZWdtZW50cy5sZW5ndGg7XG4gICAgICByZXNbZ2V0T3V0bGV0KHIpXSA9IHM7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5zRW1wdHlQYXRoTWF0Y2hlc1dpdGhOYW1lZE91dGxldHMoXG4gICAgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIHNsaWNlZFNlZ21lbnRzOiBVcmxTZWdtZW50W10sIHJvdXRlczogUm91dGVbXSk6IGJvb2xlYW4ge1xuICByZXR1cm4gcm91dGVzLnNvbWUoXG4gICAgICByID0+IGVtcHR5UGF0aE1hdGNoKHNlZ21lbnRHcm91cCwgc2xpY2VkU2VnbWVudHMsIHIpICYmIGdldE91dGxldChyKSAhPT0gUFJJTUFSWV9PVVRMRVQpO1xufVxuXG5mdW5jdGlvbiBjb250YWluc0VtcHR5UGF0aE1hdGNoZXMoXG4gICAgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIHNsaWNlZFNlZ21lbnRzOiBVcmxTZWdtZW50W10sIHJvdXRlczogUm91dGVbXSk6IGJvb2xlYW4ge1xuICByZXR1cm4gcm91dGVzLnNvbWUociA9PiBlbXB0eVBhdGhNYXRjaChzZWdtZW50R3JvdXAsIHNsaWNlZFNlZ21lbnRzLCByKSk7XG59XG5cbmZ1bmN0aW9uIGVtcHR5UGF0aE1hdGNoKFxuICAgIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCBzbGljZWRTZWdtZW50czogVXJsU2VnbWVudFtdLCByOiBSb3V0ZSk6IGJvb2xlYW4ge1xuICBpZiAoKHNlZ21lbnRHcm91cC5oYXNDaGlsZHJlbigpIHx8IHNsaWNlZFNlZ21lbnRzLmxlbmd0aCA+IDApICYmIHIucGF0aE1hdGNoID09PSAnZnVsbCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gci5wYXRoID09PSAnJyAmJiByLnJlZGlyZWN0VG8gPT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZ2V0T3V0bGV0KHJvdXRlOiBSb3V0ZSk6IHN0cmluZyB7XG4gIHJldHVybiByb3V0ZS5vdXRsZXQgfHwgUFJJTUFSWV9PVVRMRVQ7XG59XG5cbmZ1bmN0aW9uIGdldERhdGEocm91dGU6IFJvdXRlKTogRGF0YSB7XG4gIHJldHVybiByb3V0ZS5kYXRhIHx8IHt9O1xufVxuXG5mdW5jdGlvbiBnZXRSZXNvbHZlKHJvdXRlOiBSb3V0ZSk6IFJlc29sdmVEYXRhIHtcbiAgcmV0dXJuIHJvdXRlLnJlc29sdmUgfHwge307XG59XG4iXX0=