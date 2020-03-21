/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/dependencies/dependency_resolver", ["require", "exports", "tslib", "dependency-graph", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/packages/entry_point", "@angular/compiler-cli/ngcc/src/dependencies/dependency_host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var dependency_graph_1 = require("dependency-graph");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var entry_point_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point");
    var dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/dependency_host");
    var builtinNodeJsModules = new Set(require('module').builtinModules);
    /**
     * A class that resolves dependencies between entry-points.
     */
    var DependencyResolver = /** @class */ (function () {
        function DependencyResolver(fs, logger, config, hosts, typingsHost) {
            this.fs = fs;
            this.logger = logger;
            this.config = config;
            this.hosts = hosts;
            this.typingsHost = typingsHost;
        }
        /**
         * Sort the array of entry points so that the dependant entry points always come later than
         * their dependencies in the array.
         * @param entryPoints An array entry points to sort.
         * @param target If provided, only return entry-points depended on by this entry-point.
         * @returns the result of sorting the entry points by dependency.
         */
        DependencyResolver.prototype.sortEntryPointsByDependency = function (entryPoints, target) {
            var _a = this.computeDependencyGraph(entryPoints), invalidEntryPoints = _a.invalidEntryPoints, ignoredDependencies = _a.ignoredDependencies, graph = _a.graph;
            var sortedEntryPointNodes;
            if (target) {
                if (target.compiledByAngular && graph.hasNode(target.path)) {
                    sortedEntryPointNodes = graph.dependenciesOf(target.path);
                    sortedEntryPointNodes.push(target.path);
                }
                else {
                    sortedEntryPointNodes = [];
                }
            }
            else {
                sortedEntryPointNodes = graph.overallOrder();
            }
            return {
                entryPoints: sortedEntryPointNodes
                    .map(function (path) { return graph.getNodeData(path); }),
                graph: graph,
                invalidEntryPoints: invalidEntryPoints,
                ignoredDependencies: ignoredDependencies,
            };
        };
        DependencyResolver.prototype.getEntryPointDependencies = function (entryPoint) {
            var formatInfo = this.getEntryPointFormatInfo(entryPoint);
            var host = this.hosts[formatInfo.format];
            if (!host) {
                throw new Error("Could not find a suitable format for computing dependencies of entry-point: '" + entryPoint.path + "'.");
            }
            var depInfo = dependency_host_1.createDependencyInfo();
            host.collectDependencies(formatInfo.path, depInfo);
            this.typingsHost.collectDependencies(entryPoint.typings, depInfo);
            return depInfo;
        };
        /**
         * Computes a dependency graph of the given entry-points.
         *
         * The graph only holds entry-points that ngcc cares about and whose dependencies
         * (direct and transitive) all exist.
         */
        DependencyResolver.prototype.computeDependencyGraph = function (entryPoints) {
            var _this = this;
            var invalidEntryPoints = [];
            var ignoredDependencies = [];
            var graph = new dependency_graph_1.DepGraph();
            var angularEntryPoints = entryPoints.filter(function (entryPoint) { return entryPoint.compiledByAngular; });
            // Add the Angular compiled entry points to the graph as nodes
            angularEntryPoints.forEach(function (entryPoint) { return graph.addNode(entryPoint.path, entryPoint); });
            // Now add the dependencies between them
            angularEntryPoints.forEach(function (entryPoint) {
                var _a = _this.getEntryPointDependencies(entryPoint), dependencies = _a.dependencies, missing = _a.missing, deepImports = _a.deepImports;
                var missingDependencies = Array.from(missing).filter(function (dep) { return !builtinNodeJsModules.has(dep); });
                if (missingDependencies.length > 0 && !entryPoint.ignoreMissingDependencies) {
                    // This entry point has dependencies that are missing
                    // so remove it from the graph.
                    removeNodes(entryPoint, missingDependencies);
                }
                else {
                    dependencies.forEach(function (dependencyPath) {
                        if (!graph.hasNode(entryPoint.path)) {
                            // The entry-point has already been identified as invalid so we don't need
                            // to do any further work on it.
                        }
                        else if (graph.hasNode(dependencyPath)) {
                            // The entry-point is still valid (i.e. has no missing dependencies) and
                            // the dependency maps to an entry point that exists in the graph so add it
                            graph.addDependency(entryPoint.path, dependencyPath);
                        }
                        else if (invalidEntryPoints.some(function (i) { return i.entryPoint.path === dependencyPath; })) {
                            // The dependency path maps to an entry-point that was previously removed
                            // from the graph, so remove this entry-point as well.
                            removeNodes(entryPoint, [dependencyPath]);
                        }
                        else {
                            // The dependency path points to a package that ngcc does not care about.
                            ignoredDependencies.push({ entryPoint: entryPoint, dependencyPath: dependencyPath });
                        }
                    });
                }
                if (deepImports.size > 0) {
                    var notableDeepImports = _this.filterIgnorableDeepImports(entryPoint, deepImports);
                    if (notableDeepImports.length > 0) {
                        var imports = notableDeepImports.map(function (i) { return "'" + i + "'"; }).join(', ');
                        _this.logger.warn("Entry point '" + entryPoint.name + "' contains deep imports into " + imports + ". " +
                            "This is probably not a problem, but may cause the compilation of entry points to be out of order.");
                    }
                }
            });
            return { invalidEntryPoints: invalidEntryPoints, ignoredDependencies: ignoredDependencies, graph: graph };
            function removeNodes(entryPoint, missingDependencies) {
                var nodesToRemove = tslib_1.__spread([entryPoint.path], graph.dependantsOf(entryPoint.path));
                nodesToRemove.forEach(function (node) {
                    invalidEntryPoints.push({ entryPoint: graph.getNodeData(node), missingDependencies: missingDependencies });
                    graph.removeNode(node);
                });
            }
        };
        DependencyResolver.prototype.getEntryPointFormatInfo = function (entryPoint) {
            var e_1, _a;
            try {
                for (var SUPPORTED_FORMAT_PROPERTIES_1 = tslib_1.__values(entry_point_1.SUPPORTED_FORMAT_PROPERTIES), SUPPORTED_FORMAT_PROPERTIES_1_1 = SUPPORTED_FORMAT_PROPERTIES_1.next(); !SUPPORTED_FORMAT_PROPERTIES_1_1.done; SUPPORTED_FORMAT_PROPERTIES_1_1 = SUPPORTED_FORMAT_PROPERTIES_1.next()) {
                    var property = SUPPORTED_FORMAT_PROPERTIES_1_1.value;
                    var formatPath = entryPoint.packageJson[property];
                    if (formatPath === undefined)
                        continue;
                    var format = entry_point_1.getEntryPointFormat(this.fs, entryPoint, property);
                    if (format === undefined)
                        continue;
                    return { format: format, path: file_system_1.resolve(entryPoint.path, formatPath) };
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (SUPPORTED_FORMAT_PROPERTIES_1_1 && !SUPPORTED_FORMAT_PROPERTIES_1_1.done && (_a = SUPPORTED_FORMAT_PROPERTIES_1.return)) _a.call(SUPPORTED_FORMAT_PROPERTIES_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            throw new Error("There is no appropriate source code format in '" + entryPoint.path + "' entry-point.");
        };
        /**
         * Filter out the deepImports that can be ignored, according to this entryPoint's config.
         */
        DependencyResolver.prototype.filterIgnorableDeepImports = function (entryPoint, deepImports) {
            var version = (entryPoint.packageJson.version || null);
            var packageConfig = this.config.getConfig(entryPoint.package, version);
            var matchers = packageConfig.ignorableDeepImportMatchers || [];
            return Array.from(deepImports)
                .filter(function (deepImport) { return !matchers.some(function (matcher) { return matcher.test(deepImport); }); });
        };
        return DependencyResolver;
    }());
    exports.DependencyResolver = DependencyResolver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwZW5kZW5jeV9yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9kZXBlbmRlbmNpZXMvZGVwZW5kZW5jeV9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxxREFBMEM7SUFDMUMsMkVBQW1GO0lBR25GLG1GQUF1SDtJQUV2SCwrRkFBdUY7SUFFdkYsSUFBTSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FBUyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7SUErRC9FOztPQUVHO0lBQ0g7UUFDRSw0QkFDWSxFQUFjLEVBQVUsTUFBYyxFQUFVLE1BQXlCLEVBQ3pFLEtBQXdELEVBQ3hELFdBQTJCO1lBRjNCLE9BQUUsR0FBRixFQUFFLENBQVk7WUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7WUFDekUsVUFBSyxHQUFMLEtBQUssQ0FBbUQ7WUFDeEQsZ0JBQVcsR0FBWCxXQUFXLENBQWdCO1FBQUcsQ0FBQztRQUMzQzs7Ozs7O1dBTUc7UUFDSCx3REFBMkIsR0FBM0IsVUFBNEIsV0FBeUIsRUFBRSxNQUFtQjtZQUVsRSxJQUFBLDZDQUNzQyxFQURyQywwQ0FBa0IsRUFBRSw0Q0FBbUIsRUFBRSxnQkFDSixDQUFDO1lBRTdDLElBQUkscUJBQStCLENBQUM7WUFDcEMsSUFBSSxNQUFNLEVBQUU7Z0JBQ1YsSUFBSSxNQUFNLENBQUMsaUJBQWlCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzFELHFCQUFxQixHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMxRCxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsTUFB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LElBQU0sT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFrQixDQUFDO1lBQzFFLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDekUsSUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLDJCQUEyQixJQUFJLEVBQUUsQ0FBQztZQUNqRSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO2lCQUN6QixNQUFNLENBQUMsVUFBQSxVQUFVLElBQUksT0FBQSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQSxPQUFPLElBQUksT0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUF4QixDQUF3QixDQUFDLEVBQW5ELENBQW1ELENBQUMsQ0FBQztRQUNqRixDQUFDO1FBQ0gseUJBQUM7SUFBRCxDQUFDLEFBbEpELElBa0pDO0lBbEpZLGdEQUFrQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEZXBHcmFwaH0gZnJvbSAnZGVwZW5kZW5jeS1ncmFwaCc7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBGaWxlU3lzdGVtLCByZXNvbHZlfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtMb2dnZXJ9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyJztcbmltcG9ydCB7TmdjY0NvbmZpZ3VyYXRpb259IGZyb20gJy4uL3BhY2thZ2VzL2NvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHtFbnRyeVBvaW50LCBFbnRyeVBvaW50Rm9ybWF0LCBTVVBQT1JURURfRk9STUFUX1BST1BFUlRJRVMsIGdldEVudHJ5UG9pbnRGb3JtYXR9IGZyb20gJy4uL3BhY2thZ2VzL2VudHJ5X3BvaW50JztcbmltcG9ydCB7UGFydGlhbGx5T3JkZXJlZExpc3R9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7RGVwZW5kZW5jeUhvc3QsIERlcGVuZGVuY3lJbmZvLCBjcmVhdGVEZXBlbmRlbmN5SW5mb30gZnJvbSAnLi9kZXBlbmRlbmN5X2hvc3QnO1xuXG5jb25zdCBidWlsdGluTm9kZUpzTW9kdWxlcyA9IG5ldyBTZXQ8c3RyaW5nPihyZXF1aXJlKCdtb2R1bGUnKS5idWlsdGluTW9kdWxlcyk7XG5cbi8qKlxuICogSG9sZHMgaW5mb3JtYXRpb24gYWJvdXQgZW50cnkgcG9pbnRzIHRoYXQgYXJlIHJlbW92ZWQgYmVjYXVzZVxuICogdGhleSBoYXZlIGRlcGVuZGVuY2llcyB0aGF0IGFyZSBtaXNzaW5nIChkaXJlY3RseSBvciB0cmFuc2l0aXZlbHkpLlxuICpcbiAqIFRoaXMgbWlnaHQgbm90IGJlIGFuIGVycm9yLCBiZWNhdXNlIHN1Y2ggYW4gZW50cnkgcG9pbnQgbWlnaHQgbm90IGFjdHVhbGx5IGJlIHVzZWRcbiAqIGluIHRoZSBhcHBsaWNhdGlvbi4gSWYgaXQgaXMgdXNlZCB0aGVuIHRoZSBgbmdjYCBhcHBsaWNhdGlvbiBjb21waWxhdGlvbiB3b3VsZFxuICogZmFpbCBhbHNvLCBzbyB3ZSBkb24ndCBuZWVkIG5nY2MgdG8gY2F0Y2ggdGhpcy5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgY29uc2lkZXIgYW4gYXBwbGljYXRpb24gdGhhdCB1c2VzIHRoZSBgQGFuZ3VsYXIvcm91dGVyYCBwYWNrYWdlLlxuICogVGhpcyBwYWNrYWdlIGluY2x1ZGVzIGFuIGVudHJ5LXBvaW50IGNhbGxlZCBgQGFuZ3VsYXIvcm91dGVyL3VwZ3JhZGVgLCB3aGljaCBoYXMgYSBkZXBlbmRlbmN5XG4gKiBvbiB0aGUgYEBhbmd1bGFyL3VwZ3JhZGVgIHBhY2thZ2UuXG4gKiBJZiB0aGUgYXBwbGljYXRpb24gbmV2ZXIgdXNlcyBjb2RlIGZyb20gYEBhbmd1bGFyL3JvdXRlci91cGdyYWRlYCB0aGVuIHRoZXJlIGlzIG5vIG5lZWQgZm9yXG4gKiBgQGFuZ3VsYXIvdXBncmFkZWAgdG8gYmUgaW5zdGFsbGVkLlxuICogSW4gdGhpcyBjYXNlIHRoZSBuZ2NjIHRvb2wgc2hvdWxkIGp1c3QgaWdub3JlIHRoZSBgQGFuZ3VsYXIvcm91dGVyL3VwZ3JhZGVgIGVuZC1wb2ludC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbnZhbGlkRW50cnlQb2ludCB7XG4gIGVudHJ5UG9pbnQ6IEVudHJ5UG9pbnQ7XG4gIG1pc3NpbmdEZXBlbmRlbmNpZXM6IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIEhvbGRzIGluZm9ybWF0aW9uIGFib3V0IGRlcGVuZGVuY2llcyBvZiBhbiBlbnRyeS1wb2ludCB0aGF0IGRvIG5vdCBuZWVkIHRvIGJlIHByb2Nlc3NlZFxuICogYnkgdGhlIG5nY2MgdG9vbC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgdGhlIGByeGpzYCBwYWNrYWdlIGRvZXMgbm90IGNvbnRhaW4gYW55IEFuZ3VsYXIgZGVjb3JhdG9ycyB0aGF0IG5lZWQgdG8gYmVcbiAqIGNvbXBpbGVkIGFuZCBzbyB0aGlzIGNhbiBiZSBzYWZlbHkgaWdub3JlZCBieSBuZ2NjLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIElnbm9yZWREZXBlbmRlbmN5IHtcbiAgZW50cnlQb2ludDogRW50cnlQb2ludDtcbiAgZGVwZW5kZW5jeVBhdGg6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZXBlbmRlbmN5RGlhZ25vc3RpY3Mge1xuICBpbnZhbGlkRW50cnlQb2ludHM6IEludmFsaWRFbnRyeVBvaW50W107XG4gIGlnbm9yZWREZXBlbmRlbmNpZXM6IElnbm9yZWREZXBlbmRlbmN5W107XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHBhcnRpYWxseSBvcmRlcmVkIGxpc3Qgb2YgZW50cnktcG9pbnRzLlxuICpcbiAqIFRoZSBlbnRyeS1wb2ludHMnIG9yZGVyL3ByZWNlZGVuY2UgaXMgc3VjaCB0aGF0IGRlcGVuZGVudCBlbnRyeS1wb2ludHMgYWx3YXlzIGNvbWUgbGF0ZXIgdGhhblxuICogdGhlaXIgZGVwZW5kZW5jaWVzIGluIHRoZSBsaXN0LlxuICpcbiAqIFNlZSBgRGVwZW5kZW5jeVJlc29sdmVyI3NvcnRFbnRyeVBvaW50c0J5RGVwZW5kZW5jeSgpYC5cbiAqL1xuZXhwb3J0IHR5cGUgUGFydGlhbGx5T3JkZXJlZEVudHJ5UG9pbnRzID0gUGFydGlhbGx5T3JkZXJlZExpc3Q8RW50cnlQb2ludD47XG5cbi8qKlxuICogQSBsaXN0IG9mIGVudHJ5LXBvaW50cywgc29ydGVkIGJ5IHRoZWlyIGRlcGVuZGVuY2llcywgYW5kIHRoZSBkZXBlbmRlbmN5IGdyYXBoLlxuICpcbiAqIFRoZSBgZW50cnlQb2ludHNgIGFycmF5IHdpbGwgYmUgb3JkZXJlZCBzbyB0aGF0IG5vIGVudHJ5IHBvaW50IGRlcGVuZHMgdXBvbiBhbiBlbnRyeSBwb2ludCB0aGF0XG4gKiBhcHBlYXJzIGxhdGVyIGluIHRoZSBhcnJheS5cbiAqXG4gKiBTb21lIGVudHJ5IHBvaW50cyBvciB0aGVpciBkZXBlbmRlbmNpZXMgbWF5IGhhdmUgYmVlbiBpZ25vcmVkLiBUaGVzZSBhcmUgY2FwdHVyZWQgZm9yXG4gKiBkaWFnbm9zdGljIHB1cnBvc2VzIGluIGBpbnZhbGlkRW50cnlQb2ludHNgIGFuZCBgaWdub3JlZERlcGVuZGVuY2llc2AgcmVzcGVjdGl2ZWx5LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNvcnRlZEVudHJ5UG9pbnRzSW5mbyBleHRlbmRzIERlcGVuZGVuY3lEaWFnbm9zdGljcyB7XG4gIGVudHJ5UG9pbnRzOiBQYXJ0aWFsbHlPcmRlcmVkRW50cnlQb2ludHM7XG4gIGdyYXBoOiBEZXBHcmFwaDxFbnRyeVBvaW50Pjtcbn1cblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgcmVzb2x2ZXMgZGVwZW5kZW5jaWVzIGJldHdlZW4gZW50cnktcG9pbnRzLlxuICovXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jeVJlc29sdmVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGZzOiBGaWxlU3lzdGVtLCBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyLCBwcml2YXRlIGNvbmZpZzogTmdjY0NvbmZpZ3VyYXRpb24sXG4gICAgICBwcml2YXRlIGhvc3RzOiBQYXJ0aWFsPFJlY29yZDxFbnRyeVBvaW50Rm9ybWF0LCBEZXBlbmRlbmN5SG9zdD4+LFxuICAgICAgcHJpdmF0ZSB0eXBpbmdzSG9zdDogRGVwZW5kZW5jeUhvc3QpIHt9XG4gIC8qKlxuICAgKiBTb3J0IHRoZSBhcnJheSBvZiBlbnRyeSBwb2ludHMgc28gdGhhdCB0aGUgZGVwZW5kYW50IGVudHJ5IHBvaW50cyBhbHdheXMgY29tZSBsYXRlciB0aGFuXG4gICAqIHRoZWlyIGRlcGVuZGVuY2llcyBpbiB0aGUgYXJyYXkuXG4gICAqIEBwYXJhbSBlbnRyeVBvaW50cyBBbiBhcnJheSBlbnRyeSBwb2ludHMgdG8gc29ydC5cbiAgICogQHBhcmFtIHRhcmdldCBJZiBwcm92aWRlZCwgb25seSByZXR1cm4gZW50cnktcG9pbnRzIGRlcGVuZGVkIG9uIGJ5IHRoaXMgZW50cnktcG9pbnQuXG4gICAqIEByZXR1cm5zIHRoZSByZXN1bHQgb2Ygc29ydGluZyB0aGUgZW50cnkgcG9pbnRzIGJ5IGRlcGVuZGVuY3kuXG4gICAqL1xuICBzb3J0RW50cnlQb2ludHNCeURlcGVuZGVuY3koZW50cnlQb2ludHM6IEVudHJ5UG9pbnRbXSwgdGFyZ2V0PzogRW50cnlQb2ludCk6XG4gICAgICBTb3J0ZWRFbnRyeVBvaW50c0luZm8ge1xuICAgIGNvbnN0IHtpbnZhbGlkRW50cnlQb2ludHMsIGlnbm9yZWREZXBlbmRlbmNpZXMsIGdyYXBofSA9XG4gICAgICAgIHRoaXMuY29tcHV0ZURlcGVuZGVuY3lHcmFwaChlbnRyeVBvaW50cyk7XG5cbiAgICBsZXQgc29ydGVkRW50cnlQb2ludE5vZGVzOiBzdHJpbmdbXTtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBpZiAodGFyZ2V0LmNvbXBpbGVkQnlBbmd1bGFyICYmIGdyYXBoLmhhc05vZGUodGFyZ2V0LnBhdGgpKSB7XG4gICAgICAgIHNvcnRlZEVudHJ5UG9pbnROb2RlcyA9IGdyYXBoLmRlcGVuZGVuY2llc09mKHRhcmdldC5wYXRoKTtcbiAgICAgICAgc29ydGVkRW50cnlQb2ludE5vZGVzLnB1c2godGFyZ2V0LnBhdGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc29ydGVkRW50cnlQb2ludE5vZGVzID0gW107XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHNvcnRlZEVudHJ5UG9pbnROb2RlcyA9IGdyYXBoLm92ZXJhbGxPcmRlcigpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBlbnRyeVBvaW50czogKHNvcnRlZEVudHJ5UG9pbnROb2RlcyBhcyBQYXJ0aWFsbHlPcmRlcmVkTGlzdDxzdHJpbmc+KVxuICAgICAgICAgICAgICAgICAgICAgICAubWFwKHBhdGggPT4gZ3JhcGguZ2V0Tm9kZURhdGEocGF0aCkpLFxuICAgICAgZ3JhcGgsXG4gICAgICBpbnZhbGlkRW50cnlQb2ludHMsXG4gICAgICBpZ25vcmVkRGVwZW5kZW5jaWVzLFxuICAgIH07XG4gIH1cblxuICBnZXRFbnRyeVBvaW50RGVwZW5kZW5jaWVzKGVudHJ5UG9pbnQ6IEVudHJ5UG9pbnQpOiBEZXBlbmRlbmN5SW5mbyB7XG4gICAgY29uc3QgZm9ybWF0SW5mbyA9IHRoaXMuZ2V0RW50cnlQb2ludEZvcm1hdEluZm8oZW50cnlQb2ludCk7XG4gICAgY29uc3QgaG9zdCA9IHRoaXMuaG9zdHNbZm9ybWF0SW5mby5mb3JtYXRdO1xuICAgIGlmICghaG9zdCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBDb3VsZCBub3QgZmluZCBhIHN1aXRhYmxlIGZvcm1hdCBmb3IgY29tcHV0aW5nIGRlcGVuZGVuY2llcyBvZiBlbnRyeS1wb2ludDogJyR7ZW50cnlQb2ludC5wYXRofScuYCk7XG4gICAgfVxuICAgIGNvbnN0IGRlcEluZm8gPSBjcmVhdGVEZXBlbmRlbmN5SW5mbygpO1xuICAgIGhvc3QuY29sbGVjdERlcGVuZGVuY2llcyhmb3JtYXRJbmZvLnBhdGgsIGRlcEluZm8pO1xuICAgIHRoaXMudHlwaW5nc0hvc3QuY29sbGVjdERlcGVuZGVuY2llcyhlbnRyeVBvaW50LnR5cGluZ3MsIGRlcEluZm8pO1xuICAgIHJldHVybiBkZXBJbmZvO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIGEgZGVwZW5kZW5jeSBncmFwaCBvZiB0aGUgZ2l2ZW4gZW50cnktcG9pbnRzLlxuICAgKlxuICAgKiBUaGUgZ3JhcGggb25seSBob2xkcyBlbnRyeS1wb2ludHMgdGhhdCBuZ2NjIGNhcmVzIGFib3V0IGFuZCB3aG9zZSBkZXBlbmRlbmNpZXNcbiAgICogKGRpcmVjdCBhbmQgdHJhbnNpdGl2ZSkgYWxsIGV4aXN0LlxuICAgKi9cbiAgcHJpdmF0ZSBjb21wdXRlRGVwZW5kZW5jeUdyYXBoKGVudHJ5UG9pbnRzOiBFbnRyeVBvaW50W10pOiBEZXBlbmRlbmN5R3JhcGgge1xuICAgIGNvbnN0IGludmFsaWRFbnRyeVBvaW50czogSW52YWxpZEVudHJ5UG9pbnRbXSA9IFtdO1xuICAgIGNvbnN0IGlnbm9yZWREZXBlbmRlbmNpZXM6IElnbm9yZWREZXBlbmRlbmN5W10gPSBbXTtcbiAgICBjb25zdCBncmFwaCA9IG5ldyBEZXBHcmFwaDxFbnRyeVBvaW50PigpO1xuXG4gICAgY29uc3QgYW5ndWxhckVudHJ5UG9pbnRzID0gZW50cnlQb2ludHMuZmlsdGVyKGVudHJ5UG9pbnQgPT4gZW50cnlQb2ludC5jb21waWxlZEJ5QW5ndWxhcik7XG5cbiAgICAvLyBBZGQgdGhlIEFuZ3VsYXIgY29tcGlsZWQgZW50cnkgcG9pbnRzIHRvIHRoZSBncmFwaCBhcyBub2Rlc1xuICAgIGFuZ3VsYXJFbnRyeVBvaW50cy5mb3JFYWNoKGVudHJ5UG9pbnQgPT4gZ3JhcGguYWRkTm9kZShlbnRyeVBvaW50LnBhdGgsIGVudHJ5UG9pbnQpKTtcblxuICAgIC8vIE5vdyBhZGQgdGhlIGRlcGVuZGVuY2llcyBiZXR3ZWVuIHRoZW1cbiAgICBhbmd1bGFyRW50cnlQb2ludHMuZm9yRWFjaChlbnRyeVBvaW50ID0+IHtcbiAgICAgIGNvbnN0IHtkZXBlbmRlbmNpZXMsIG1pc3NpbmcsIGRlZXBJbXBvcnRzfSA9IHRoaXMuZ2V0RW50cnlQb2ludERlcGVuZGVuY2llcyhlbnRyeVBvaW50KTtcblxuICAgICAgY29uc3QgbWlzc2luZ0RlcGVuZGVuY2llcyA9IEFycmF5LmZyb20obWlzc2luZykuZmlsdGVyKGRlcCA9PiAhYnVpbHRpbk5vZGVKc01vZHVsZXMuaGFzKGRlcCkpO1xuXG4gICAgICBpZiAobWlzc2luZ0RlcGVuZGVuY2llcy5sZW5ndGggPiAwICYmICFlbnRyeVBvaW50Lmlnbm9yZU1pc3NpbmdEZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgLy8gVGhpcyBlbnRyeSBwb2ludCBoYXMgZGVwZW5kZW5jaWVzIHRoYXQgYXJlIG1pc3NpbmdcbiAgICAgICAgLy8gc28gcmVtb3ZlIGl0IGZyb20gdGhlIGdyYXBoLlxuICAgICAgICByZW1vdmVOb2RlcyhlbnRyeVBvaW50LCBtaXNzaW5nRGVwZW5kZW5jaWVzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlcGVuZGVuY2llcy5mb3JFYWNoKGRlcGVuZGVuY3lQYXRoID0+IHtcbiAgICAgICAgICBpZiAoIWdyYXBoLmhhc05vZGUoZW50cnlQb2ludC5wYXRoKSkge1xuICAgICAgICAgICAgLy8gVGhlIGVudHJ5LXBvaW50IGhhcyBhbHJlYWR5IGJlZW4gaWRlbnRpZmllZCBhcyBpbnZhbGlkIHNvIHdlIGRvbid0IG5lZWRcbiAgICAgICAgICAgIC8vIHRvIGRvIGFueSBmdXJ0aGVyIHdvcmsgb24gaXQuXG4gICAgICAgICAgfSBlbHNlIGlmIChncmFwaC5oYXNOb2RlKGRlcGVuZGVuY3lQYXRoKSkge1xuICAgICAgICAgICAgLy8gVGhlIGVudHJ5LXBvaW50IGlzIHN0aWxsIHZhbGlkIChpLmUuIGhhcyBubyBtaXNzaW5nIGRlcGVuZGVuY2llcykgYW5kXG4gICAgICAgICAgICAvLyB0aGUgZGVwZW5kZW5jeSBtYXBzIHRvIGFuIGVudHJ5IHBvaW50IHRoYXQgZXhpc3RzIGluIHRoZSBncmFwaCBzbyBhZGQgaXRcbiAgICAgICAgICAgIGdyYXBoLmFkZERlcGVuZGVuY3koZW50cnlQb2ludC5wYXRoLCBkZXBlbmRlbmN5UGF0aCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpbnZhbGlkRW50cnlQb2ludHMuc29tZShpID0+IGkuZW50cnlQb2ludC5wYXRoID09PSBkZXBlbmRlbmN5UGF0aCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXBlbmRlbmN5IHBhdGggbWFwcyB0byBhbiBlbnRyeS1wb2ludCB0aGF0IHdhcyBwcmV2aW91c2x5IHJlbW92ZWRcbiAgICAgICAgICAgIC8vIGZyb20gdGhlIGdyYXBoLCBzbyByZW1vdmUgdGhpcyBlbnRyeS1wb2ludCBhcyB3ZWxsLlxuICAgICAgICAgICAgcmVtb3ZlTm9kZXMoZW50cnlQb2ludCwgW2RlcGVuZGVuY3lQYXRoXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXBlbmRlbmN5IHBhdGggcG9pbnRzIHRvIGEgcGFja2FnZSB0aGF0IG5nY2MgZG9lcyBub3QgY2FyZSBhYm91dC5cbiAgICAgICAgICAgIGlnbm9yZWREZXBlbmRlbmNpZXMucHVzaCh7ZW50cnlQb2ludCwgZGVwZW5kZW5jeVBhdGh9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGVlcEltcG9ydHMuc2l6ZSA+IDApIHtcbiAgICAgICAgY29uc3Qgbm90YWJsZURlZXBJbXBvcnRzID0gdGhpcy5maWx0ZXJJZ25vcmFibGVEZWVwSW1wb3J0cyhlbnRyeVBvaW50LCBkZWVwSW1wb3J0cyk7XG4gICAgICAgIGlmIChub3RhYmxlRGVlcEltcG9ydHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGNvbnN0IGltcG9ydHMgPSBub3RhYmxlRGVlcEltcG9ydHMubWFwKGkgPT4gYCcke2l9J2ApLmpvaW4oJywgJyk7XG4gICAgICAgICAgdGhpcy5sb2dnZXIud2FybihcbiAgICAgICAgICAgICAgYEVudHJ5IHBvaW50ICcke2VudHJ5UG9pbnQubmFtZX0nIGNvbnRhaW5zIGRlZXAgaW1wb3J0cyBpbnRvICR7aW1wb3J0c30uIGAgK1xuICAgICAgICAgICAgICBgVGhpcyBpcyBwcm9iYWJseSBub3QgYSBwcm9ibGVtLCBidXQgbWF5IGNhdXNlIHRoZSBjb21waWxhdGlvbiBvZiBlbnRyeSBwb2ludHMgdG8gYmUgb3V0IG9mIG9yZGVyLmApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge2ludmFsaWRFbnRyeVBvaW50cywgaWdub3JlZERlcGVuZGVuY2llcywgZ3JhcGh9O1xuXG4gICAgZnVuY3Rpb24gcmVtb3ZlTm9kZXMoZW50cnlQb2ludDogRW50cnlQb2ludCwgbWlzc2luZ0RlcGVuZGVuY2llczogc3RyaW5nW10pIHtcbiAgICAgIGNvbnN0IG5vZGVzVG9SZW1vdmUgPSBbZW50cnlQb2ludC5wYXRoLCAuLi5ncmFwaC5kZXBlbmRhbnRzT2YoZW50cnlQb2ludC5wYXRoKV07XG4gICAgICBub2Rlc1RvUmVtb3ZlLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIGludmFsaWRFbnRyeVBvaW50cy5wdXNoKHtlbnRyeVBvaW50OiBncmFwaC5nZXROb2RlRGF0YShub2RlKSwgbWlzc2luZ0RlcGVuZGVuY2llc30pO1xuICAgICAgICBncmFwaC5yZW1vdmVOb2RlKG5vZGUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRFbnRyeVBvaW50Rm9ybWF0SW5mbyhlbnRyeVBvaW50OiBFbnRyeVBvaW50KTpcbiAgICAgIHtmb3JtYXQ6IEVudHJ5UG9pbnRGb3JtYXQsIHBhdGg6IEFic29sdXRlRnNQYXRofSB7XG4gICAgZm9yIChjb25zdCBwcm9wZXJ0eSBvZiBTVVBQT1JURURfRk9STUFUX1BST1BFUlRJRVMpIHtcbiAgICAgIGNvbnN0IGZvcm1hdFBhdGggPSBlbnRyeVBvaW50LnBhY2thZ2VKc29uW3Byb3BlcnR5XTtcbiAgICAgIGlmIChmb3JtYXRQYXRoID09PSB1bmRlZmluZWQpIGNvbnRpbnVlO1xuXG4gICAgICBjb25zdCBmb3JtYXQgPSBnZXRFbnRyeVBvaW50Rm9ybWF0KHRoaXMuZnMsIGVudHJ5UG9pbnQsIHByb3BlcnR5KTtcbiAgICAgIGlmIChmb3JtYXQgPT09IHVuZGVmaW5lZCkgY29udGludWU7XG5cbiAgICAgIHJldHVybiB7Zm9ybWF0LCBwYXRoOiByZXNvbHZlKGVudHJ5UG9pbnQucGF0aCwgZm9ybWF0UGF0aCl9O1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFRoZXJlIGlzIG5vIGFwcHJvcHJpYXRlIHNvdXJjZSBjb2RlIGZvcm1hdCBpbiAnJHtlbnRyeVBvaW50LnBhdGh9JyBlbnRyeS1wb2ludC5gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWx0ZXIgb3V0IHRoZSBkZWVwSW1wb3J0cyB0aGF0IGNhbiBiZSBpZ25vcmVkLCBhY2NvcmRpbmcgdG8gdGhpcyBlbnRyeVBvaW50J3MgY29uZmlnLlxuICAgKi9cbiAgcHJpdmF0ZSBmaWx0ZXJJZ25vcmFibGVEZWVwSW1wb3J0cyhlbnRyeVBvaW50OiBFbnRyeVBvaW50LCBkZWVwSW1wb3J0czogU2V0PEFic29sdXRlRnNQYXRoPik6XG4gICAgICBBYnNvbHV0ZUZzUGF0aFtdIHtcbiAgICBjb25zdCB2ZXJzaW9uID0gKGVudHJ5UG9pbnQucGFja2FnZUpzb24udmVyc2lvbiB8fCBudWxsKSBhcyBzdHJpbmcgfCBudWxsO1xuICAgIGNvbnN0IHBhY2thZ2VDb25maWcgPSB0aGlzLmNvbmZpZy5nZXRDb25maWcoZW50cnlQb2ludC5wYWNrYWdlLCB2ZXJzaW9uKTtcbiAgICBjb25zdCBtYXRjaGVycyA9IHBhY2thZ2VDb25maWcuaWdub3JhYmxlRGVlcEltcG9ydE1hdGNoZXJzIHx8IFtdO1xuICAgIHJldHVybiBBcnJheS5mcm9tKGRlZXBJbXBvcnRzKVxuICAgICAgICAuZmlsdGVyKGRlZXBJbXBvcnQgPT4gIW1hdGNoZXJzLnNvbWUobWF0Y2hlciA9PiBtYXRjaGVyLnRlc3QoZGVlcEltcG9ydCkpKTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgRGVwZW5kZW5jeUdyYXBoIGV4dGVuZHMgRGVwZW5kZW5jeURpYWdub3N0aWNzIHtcbiAgZ3JhcGg6IERlcEdyYXBoPEVudHJ5UG9pbnQ+O1xufVxuIl19