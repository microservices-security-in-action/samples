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
        define("@angular/compiler-cli/src/ngtsc/incremental/src/dependency_tracking", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * An implementation of the `DependencyTracker` dependency graph API.
     *
     * The `FileDependencyGraph`'s primary job is to determine whether a given file has "logically"
     * changed, given the set of physical changes (direct changes to files on disk).
     *
     * A file is logically changed if at least one of three conditions is met:
     *
     * 1. The file itself has physically changed.
     * 2. One of its dependencies has physically changed.
     * 3. One of its resource dependencies has physically changed.
     */
    var FileDependencyGraph = /** @class */ (function () {
        function FileDependencyGraph() {
            this.nodes = new Map();
        }
        FileDependencyGraph.prototype.addDependency = function (from, on) { this.nodeFor(from).dependsOn.add(on.fileName); };
        FileDependencyGraph.prototype.addResourceDependency = function (from, resource) {
            this.nodeFor(from).usesResources.add(resource);
        };
        FileDependencyGraph.prototype.addTransitiveDependency = function (from, on) {
            var e_1, _a;
            var nodeFrom = this.nodeFor(from);
            nodeFrom.dependsOn.add(on.fileName);
            var nodeOn = this.nodeFor(on);
            try {
                for (var _b = tslib_1.__values(nodeOn.dependsOn), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var dep = _c.value;
                    nodeFrom.dependsOn.add(dep);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        FileDependencyGraph.prototype.addTransitiveResources = function (from, resourcesOf) {
            var e_2, _a;
            var nodeFrom = this.nodeFor(from);
            var nodeOn = this.nodeFor(resourcesOf);
            try {
                for (var _b = tslib_1.__values(nodeOn.usesResources), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var dep = _c.value;
                    nodeFrom.usesResources.add(dep);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        };
        FileDependencyGraph.prototype.isStale = function (sf, changedTsPaths, changedResources) {
            return isLogicallyChanged(sf, this.nodeFor(sf), changedTsPaths, EMPTY_SET, changedResources);
        };
        /**
         * Update the current dependency graph from a previous one, incorporating a set of physical
         * changes.
         *
         * This method performs two tasks:
         *
         * 1. For files which have not logically changed, their dependencies from `previous` are added to
         *    `this` graph.
         * 2. For files which have logically changed, they're added to a set of logically changed files
         *    which is eventually returned.
         *
         * In essence, for build `n`, this method performs:
         *
         * G(n) + L(n) = G(n - 1) + P(n)
         *
         * where:
         *
         * G(n) = the dependency graph of build `n`
         * L(n) = the logically changed files from build n - 1 to build n.
         * P(n) = the physically changed files from build n - 1 to build n.
         */
        FileDependencyGraph.prototype.updateWithPhysicalChanges = function (previous, changedTsPaths, deletedTsPaths, changedResources) {
            var e_3, _a;
            var logicallyChanged = new Set();
            try {
                for (var _b = tslib_1.__values(previous.nodes.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var sf = _c.value;
                    var node = previous.nodeFor(sf);
                    if (isLogicallyChanged(sf, node, changedTsPaths, deletedTsPaths, changedResources)) {
                        logicallyChanged.add(sf.fileName);
                    }
                    else if (!deletedTsPaths.has(sf.fileName)) {
                        this.nodes.set(sf, {
                            dependsOn: new Set(node.dependsOn),
                            usesResources: new Set(node.usesResources),
                        });
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return logicallyChanged;
        };
        FileDependencyGraph.prototype.nodeFor = function (sf) {
            if (!this.nodes.has(sf)) {
                this.nodes.set(sf, {
                    dependsOn: new Set(),
                    usesResources: new Set(),
                });
            }
            return this.nodes.get(sf);
        };
        return FileDependencyGraph;
    }());
    exports.FileDependencyGraph = FileDependencyGraph;
    /**
     * Determine whether `sf` has logically changed, given its dependencies and the set of physically
     * changed files and resources.
     */
    function isLogicallyChanged(sf, node, changedTsPaths, deletedTsPaths, changedResources) {
        var e_4, _a, e_5, _b;
        // A file is logically changed if it has physically changed itself (including being deleted).
        if (changedTsPaths.has(sf.fileName) || deletedTsPaths.has(sf.fileName)) {
            return true;
        }
        try {
            // A file is logically changed if one of its dependencies has physically changed.
            for (var _c = tslib_1.__values(node.dependsOn), _d = _c.next(); !_d.done; _d = _c.next()) {
                var dep = _d.value;
                if (changedTsPaths.has(dep) || deletedTsPaths.has(dep)) {
                    return true;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_4) throw e_4.error; }
        }
        try {
            // A file is logically changed if one of its resources has physically changed.
            for (var _e = tslib_1.__values(node.usesResources), _f = _e.next(); !_f.done; _f = _e.next()) {
                var dep = _f.value;
                if (changedResources.has(dep)) {
                    return true;
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return false;
    }
    var EMPTY_SET = new Set();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwZW5kZW5jeV90cmFja2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvaW5jcmVtZW50YWwvc3JjL2RlcGVuZGVuY3lfdHJhY2tpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBT0g7Ozs7Ozs7Ozs7O09BV0c7SUFDSDtRQUFBO1lBRVUsVUFBSyxHQUFHLElBQUksR0FBRyxFQUFlLENBQUM7UUFnRnpDLENBQUM7UUE5RUMsMkNBQWEsR0FBYixVQUFjLElBQU8sRUFBRSxFQUFLLElBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdEYsbURBQXFCLEdBQXJCLFVBQXNCLElBQU8sRUFBRSxRQUF3QjtZQUNyRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUVELHFEQUF1QixHQUF2QixVQUF3QixJQUFPLEVBQUUsRUFBSzs7WUFDcEMsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFcEMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQzs7Z0JBQ2hDLEtBQWtCLElBQUEsS0FBQSxpQkFBQSxNQUFNLENBQUMsU0FBUyxDQUFBLGdCQUFBLDRCQUFFO29CQUEvQixJQUFNLEdBQUcsV0FBQTtvQkFDWixRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENB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RjtZQUNqRixLQUFrQixJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQSxnQkFBQSw0QkFBRTtnQkFBN0IsSUFBTSxHQUFHLFdBQUE7Z0JBQ1osSUFBSSxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3RELE9BQU8sSUFBSSxDQUFDO2lCQUNiO2FBQ0Y7Ozs7Ozs7Ozs7WUFFRCw4RUFBOEU7WUFDOUUsS0FBa0IsSUFBQSxLQUFBLGlCQUFBLElBQUksQ0FBQyxhQUFhLENBQUEsZ0JBQUEsNEJBQUU7Z0JBQWpDLElBQU0sR0FBRyxXQUFBO2dCQUNaLElBQUksZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUM3QixPQUFPLElBQUksQ0FBQztpQkFDYjthQUNGOzs7Ozs7Ozs7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFPRCxJQUFNLFNBQVMsR0FBcUIsSUFBSSxHQUFHLEVBQU8sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGh9IGZyb20gJy4uLy4uL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7RGVwZW5kZW5jeVRyYWNrZXJ9IGZyb20gJy4uL2FwaSc7XG5cbi8qKlxuICogQW4gaW1wbGVtZW50YXRpb24gb2YgdGhlIGBEZXBlbmRlbmN5VHJhY2tlcmAgZGVwZW5kZW5jeSBncmFwaCBBUEkuXG4gKlxuICogVGhlIGBGaWxlRGVwZW5kZW5jeUdyYXBoYCdzIHByaW1hcnkgam9iIGlzIHRvIGRldGVybWluZSB3aGV0aGVyIGEgZ2l2ZW4gZmlsZSBoYXMgXCJsb2dpY2FsbHlcIlxuICogY2hhbmdlZCwgZ2l2ZW4gdGhlIHNldCBvZiBwaHlzaWNhbCBjaGFuZ2VzIChkaXJlY3QgY2hhbmdlcyB0byBmaWxlcyBvbiBkaXNrKS5cbiAqXG4gKiBBIGZpbGUgaXMgbG9naWNhbGx5IGNoYW5nZWQgaWYgYXQgbGVhc3Qgb25lIG9mIHRocmVlIGNvbmRpdGlvbnMgaXMgbWV0OlxuICpcbiAqIDEuIFRoZSBmaWxlIGl0c2VsZiBoYXMgcGh5c2ljYWxseSBjaGFuZ2VkLlxuICogMi4gT25lIG9mIGl0cyBkZXBlbmRlbmNpZXMgaGFzIHBoeXNpY2FsbHkgY2hhbmdlZC5cbiAqIDMuIE9uZSBvZiBpdHMgcmVzb3VyY2UgZGVwZW5kZW5jaWVzIGhhcyBwaHlzaWNhbGx5IGNoYW5nZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBGaWxlRGVwZW5kZW5jeUdyYXBoPFQgZXh0ZW5kc3tmaWxlTmFtZTogc3RyaW5nfSA9IHRzLlNvdXJjZUZpbGU+IGltcGxlbWVudHNcbiAgICBEZXBlbmRlbmN5VHJhY2tlcjxUPiB7XG4gIHByaXZhdGUgbm9kZXMgPSBuZXcgTWFwPFQsIEZpbGVOb2RlPigpO1xuXG4gIGFkZERlcGVuZGVuY3koZnJvbTogVCwgb246IFQpOiB2b2lkIHsgdGhpcy5ub2RlRm9yKGZyb20pLmRlcGVuZHNPbi5hZGQob24uZmlsZU5hbWUpOyB9XG5cbiAgYWRkUmVzb3VyY2VEZXBlbmRlbmN5KGZyb206IFQsIHJlc291cmNlOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQge1xuICAgIHRoaXMubm9kZUZvcihmcm9tKS51c2VzUmVzb3VyY2VzLmFkZChyZXNvdXJjZSk7XG4gIH1cblxuICBhZGRUcmFuc2l0aXZlRGVwZW5kZW5jeShmcm9tOiBULCBvbjogVCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGVGcm9tID0gdGhpcy5ub2RlRm9yKGZyb20pO1xuICAgIG5vZGVGcm9tLmRlcGVuZHNPbi5hZGQob24uZmlsZU5hbWUpO1xuXG4gICAgY29uc3Qgbm9kZU9uID0gdGhpcy5ub2RlRm9yKG9uKTtcbiAgICBmb3IgKGNvbnN0IGRlcCBvZiBub2RlT24uZGVwZW5kc09uKSB7XG4gICAgICBub2RlRnJvbS5kZXBlbmRzT24uYWRkKGRlcCk7XG4gICAgfVxuICB9XG5cbiAgYWRkVHJhbnNpdGl2ZVJlc291cmNlcyhmcm9tOiBULCByZXNvdXJjZXNPZjogVCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGVGcm9tID0gdGhpcy5ub2RlRm9yKGZyb20pO1xuICAgIGNvbnN0IG5vZGVPbiA9IHRoaXMubm9kZUZvcihyZXNvdXJjZXNPZik7XG4gICAgZm9yIChjb25zdCBkZXAgb2Ygbm9kZU9uLnVzZXNSZXNvdXJjZXMpIHtcbiAgICAgIG5vZGVGcm9tLnVzZXNSZXNvdXJjZXMuYWRkKGRlcCk7XG4gICAgfVxuICB9XG5cbiAgaXNTdGFsZShzZjogVCwgY2hhbmdlZFRzUGF0aHM6IFNldDxzdHJpbmc+LCBjaGFuZ2VkUmVzb3VyY2VzOiBTZXQ8QWJzb2x1dGVGc1BhdGg+KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzTG9naWNhbGx5Q2hhbmdlZChzZiwgdGhpcy5ub2RlRm9yKHNmKSwgY2hhbmdlZFRzUGF0aHMsIEVNUFRZX1NFVCwgY2hhbmdlZFJlc291cmNlcyk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjdXJyZW50IGRlcGVuZGVuY3kgZ3JhcGggZnJvbSBhIHByZXZpb3VzIG9uZSwgaW5jb3Jwb3JhdGluZyBhIHNldCBvZiBwaHlzaWNhbFxuICAgKiBjaGFuZ2VzLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBwZXJmb3JtcyB0d28gdGFza3M6XG4gICAqXG4gICAqIDEuIEZvciBmaWxlcyB3aGljaCBoYXZlIG5vdCBsb2dpY2FsbHkgY2hhbmdlZCwgdGhlaXIgZGVwZW5kZW5jaWVzIGZyb20gYHByZXZpb3VzYCBhcmUgYWRkZWQgdG9cbiAgICogICAgYHRoaXNgIGdyYXBoLlxuICAgKiAyLiBGb3IgZmlsZXMgd2hpY2ggaGF2ZSBsb2dpY2FsbHkgY2hhbmdlZCwgdGhleSdyZSBhZGRlZCB0byBhIHNldCBvZiBsb2dpY2FsbHkgY2hhbmdlZCBmaWxlc1xuICAgKiAgICB3aGljaCBpcyBldmVudHVhbGx5IHJldHVybmVkLlxuICAgKlxuICAgKiBJbiBlc3NlbmNlLCBmb3IgYnVpbGQgYG5gLCB0aGlzIG1ldGhvZCBwZXJmb3JtczpcbiAgICpcbiAgICogRyhuKSArIEwobikgPSBHKG4gLSAxKSArIFAobilcbiAgICpcbiAgICogd2hlcmU6XG4gICAqXG4gICAqIEcobikgPSB0aGUgZGVwZW5kZW5jeSBncmFwaCBvZiBidWlsZCBgbmBcbiAgICogTChuKSA9IHRoZSBsb2dpY2FsbHkgY2hhbmdlZCBmaWxlcyBmcm9tIGJ1aWxkIG4gLSAxIHRvIGJ1aWxkIG4uXG4gICAqIFAobikgPSB0aGUgcGh5c2ljYWxseSBjaGFuZ2VkIGZpbGVzIGZyb20gYnVpbGQgbiAtIDEgdG8gYnVpbGQgbi5cbiAgICovXG4gIHVwZGF0ZVdpdGhQaHlzaWNhbENoYW5nZXMoXG4gICAgICBwcmV2aW91czogRmlsZURlcGVuZGVuY3lHcmFwaDxUPiwgY2hhbmdlZFRzUGF0aHM6IFNldDxzdHJpbmc+LCBkZWxldGVkVHNQYXRoczogU2V0PHN0cmluZz4sXG4gICAgICBjaGFuZ2VkUmVzb3VyY2VzOiBTZXQ8QWJzb2x1dGVGc1BhdGg+KTogU2V0PHN0cmluZz4ge1xuICAgIGNvbnN0IGxvZ2ljYWxseUNoYW5nZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAgIGZvciAoY29uc3Qgc2Ygb2YgcHJldmlvdXMubm9kZXMua2V5cygpKSB7XG4gICAgICBjb25zdCBub2RlID0gcHJldmlvdXMubm9kZUZvcihzZik7XG4gICAgICBpZiAoaXNMb2dpY2FsbHlDaGFuZ2VkKHNmLCBub2RlLCBjaGFuZ2VkVHNQYXRocywgZGVsZXRlZFRzUGF0aHMsIGNoYW5nZWRSZXNvdXJjZXMpKSB7XG4gICAgICAgIGxvZ2ljYWxseUNoYW5nZWQuYWRkKHNmLmZpbGVOYW1lKTtcbiAgICAgIH0gZWxzZSBpZiAoIWRlbGV0ZWRUc1BhdGhzLmhhcyhzZi5maWxlTmFtZSkpIHtcbiAgICAgICAgdGhpcy5ub2Rlcy5zZXQoc2YsIHtcbiAgICAgICAgICBkZXBlbmRzT246IG5ldyBTZXQobm9kZS5kZXBlbmRzT24pLFxuICAgICAgICAgIHVzZXNSZXNvdXJjZXM6IG5ldyBTZXQobm9kZS51c2VzUmVzb3VyY2VzKSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxvZ2ljYWxseUNoYW5nZWQ7XG4gIH1cblxuICBwcml2YXRlIG5vZGVGb3Ioc2Y6IFQpOiBGaWxlTm9kZSB7XG4gICAgaWYgKCF0aGlzLm5vZGVzLmhhcyhzZikpIHtcbiAgICAgIHRoaXMubm9kZXMuc2V0KHNmLCB7XG4gICAgICAgIGRlcGVuZHNPbjogbmV3IFNldDxzdHJpbmc+KCksXG4gICAgICAgIHVzZXNSZXNvdXJjZXM6IG5ldyBTZXQ8QWJzb2x1dGVGc1BhdGg+KCksXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubm9kZXMuZ2V0KHNmKSAhO1xuICB9XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoZXRoZXIgYHNmYCBoYXMgbG9naWNhbGx5IGNoYW5nZWQsIGdpdmVuIGl0cyBkZXBlbmRlbmNpZXMgYW5kIHRoZSBzZXQgb2YgcGh5c2ljYWxseVxuICogY2hhbmdlZCBmaWxlcyBhbmQgcmVzb3VyY2VzLlxuICovXG5mdW5jdGlvbiBpc0xvZ2ljYWxseUNoYW5nZWQ8VCBleHRlbmRze2ZpbGVOYW1lOiBzdHJpbmd9PihcbiAgICBzZjogVCwgbm9kZTogRmlsZU5vZGUsIGNoYW5nZWRUc1BhdGhzOiBSZWFkb25seVNldDxzdHJpbmc+LCBkZWxldGVkVHNQYXRoczogUmVhZG9ubHlTZXQ8c3RyaW5nPixcbiAgICBjaGFuZ2VkUmVzb3VyY2VzOiBSZWFkb25seVNldDxBYnNvbHV0ZUZzUGF0aD4pOiBib29sZWFuIHtcbiAgLy8gQSBmaWxlIGlzIGxvZ2ljYWxseSBjaGFuZ2VkIGlmIGl0IGhhcyBwaHlzaWNhbGx5IGNoYW5nZWQgaXRzZWxmIChpbmNsdWRpbmcgYmVpbmcgZGVsZXRlZCkuXG4gIGlmIChjaGFuZ2VkVHNQYXRocy5oYXMoc2YuZmlsZU5hbWUpIHx8IGRlbGV0ZWRUc1BhdGhzLmhhcyhzZi5maWxlTmFtZSkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIEEgZmlsZSBpcyBsb2dpY2FsbHkgY2hhbmdlZCBpZiBvbmUgb2YgaXRzIGRlcGVuZGVuY2llcyBoYXMgcGh5c2ljYWxseSBjaGFuZ2VkLlxuICBmb3IgKGNvbnN0IGRlcCBvZiBub2RlLmRlcGVuZHNPbikge1xuICAgIGlmIChjaGFuZ2VkVHNQYXRocy5oYXMoZGVwKSB8fCBkZWxldGVkVHNQYXRocy5oYXMoZGVwKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gQSBmaWxlIGlzIGxvZ2ljYWxseSBjaGFuZ2VkIGlmIG9uZSBvZiBpdHMgcmVzb3VyY2VzIGhhcyBwaHlzaWNhbGx5IGNoYW5nZWQuXG4gIGZvciAoY29uc3QgZGVwIG9mIG5vZGUudXNlc1Jlc291cmNlcykge1xuICAgIGlmIChjaGFuZ2VkUmVzb3VyY2VzLmhhcyhkZXApKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5pbnRlcmZhY2UgRmlsZU5vZGUge1xuICBkZXBlbmRzT246IFNldDxzdHJpbmc+O1xuICB1c2VzUmVzb3VyY2VzOiBTZXQ8QWJzb2x1dGVGc1BhdGg+O1xufVxuXG5jb25zdCBFTVBUWV9TRVQ6IFJlYWRvbmx5U2V0PGFueT4gPSBuZXcgU2V0PGFueT4oKTtcbiJdfQ==