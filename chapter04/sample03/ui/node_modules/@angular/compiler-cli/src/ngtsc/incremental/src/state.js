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
        define("@angular/compiler-cli/src/ngtsc/incremental/src/state", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/incremental/src/dependency_tracking"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var dependency_tracking_1 = require("@angular/compiler-cli/src/ngtsc/incremental/src/dependency_tracking");
    /**
     * Drives an incremental build, by tracking changes and determining which files need to be emitted.
     */
    var IncrementalDriver = /** @class */ (function () {
        function IncrementalDriver(state, allTsFiles, depGraph, logicalChanges) {
            this.allTsFiles = allTsFiles;
            this.depGraph = depGraph;
            this.logicalChanges = logicalChanges;
            this.state = state;
        }
        /**
         * Construct an `IncrementalDriver` with a starting state that incorporates the results of a
         * previous build.
         *
         * The previous build's `BuildState` is reconciled with the new program's changes, and the results
         * are merged into the new build's `PendingBuildState`.
         */
        IncrementalDriver.reconcile = function (oldProgram, oldDriver, newProgram, modifiedResourceFiles) {
            var e_1, _a, e_2, _b, e_3, _c, e_4, _d, e_5, _e;
            // Initialize the state of the current build based on the previous one.
            var state;
            if (oldDriver.state.kind === BuildStateKind.Pending) {
                // The previous build never made it past the pending state. Reuse it as the starting state for
                // this build.
                state = oldDriver.state;
            }
            else {
                // The previous build was successfully analyzed. `pendingEmit` is the only state carried
                // forward into this build.
                state = {
                    kind: BuildStateKind.Pending,
                    pendingEmit: oldDriver.state.pendingEmit,
                    changedResourcePaths: new Set(),
                    changedTsPaths: new Set(),
                    lastGood: oldDriver.state.lastGood,
                };
            }
            // Merge the freshly modified resource files with any prior ones.
            if (modifiedResourceFiles !== null) {
                try {
                    for (var modifiedResourceFiles_1 = tslib_1.__values(modifiedResourceFiles), modifiedResourceFiles_1_1 = modifiedResourceFiles_1.next(); !modifiedResourceFiles_1_1.done; modifiedResourceFiles_1_1 = modifiedResourceFiles_1.next()) {
                        var resFile = modifiedResourceFiles_1_1.value;
                        state.changedResourcePaths.add(file_system_1.absoluteFrom(resFile));
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (modifiedResourceFiles_1_1 && !modifiedResourceFiles_1_1.done && (_a = modifiedResourceFiles_1.return)) _a.call(modifiedResourceFiles_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            // Next, process the files in the new program, with a couple of goals:
            // 1) Determine which TS files have changed, if any, and merge them into `changedTsFiles`.
            // 2) Produce a list of TS files which no longer exist in the program (they've been deleted
            //    since the previous compilation). These need to be removed from the state tracking to avoid
            //    leaking memory.
            // All files in the old program, for easy detection of changes.
            var oldFiles = new Set(oldProgram.getSourceFiles());
            // Assume all the old files were deleted to begin with. Only TS files are tracked.
            var deletedTsPaths = new Set(tsOnlyFiles(oldProgram).map(function (sf) { return sf.fileName; }));
            try {
                for (var _f = tslib_1.__values(newProgram.getSourceFiles()), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var newFile = _g.value;
                    if (!newFile.isDeclarationFile) {
                        // This file exists in the new program, so remove it from `deletedTsPaths`.
                        deletedTsPaths.delete(newFile.fileName);
                    }
                    if (oldFiles.has(newFile)) {
                        // This file hasn't changed; no need to look at it further.
                        continue;
                    }
                    // The file has changed since the last successful build. The appropriate reaction depends on
                    // what kind of file it is.
                    if (!newFile.isDeclarationFile) {
                        // It's a .ts file, so track it as a change.
                        state.changedTsPaths.add(newFile.fileName);
                    }
                    else {
                        // It's a .d.ts file. Currently the compiler does not do a great job of tracking
                        // dependencies on .d.ts files, so bail out of incremental builds here and do a full build.
                        // This usually only happens if something in node_modules changes.
                        return IncrementalDriver.fresh(newProgram);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_2) throw e_2.error; }
            }
            try {
                // The next step is to remove any deleted files from the state.
                for (var deletedTsPaths_1 = tslib_1.__values(deletedTsPaths), deletedTsPaths_1_1 = deletedTsPaths_1.next(); !deletedTsPaths_1_1.done; deletedTsPaths_1_1 = deletedTsPaths_1.next()) {
                    var filePath = deletedTsPaths_1_1.value;
                    state.pendingEmit.delete(filePath);
                    // Even if the file doesn't exist in the current compilation, it still might have been changed
                    // in a previous one, so delete it from the set of changed TS files, just in case.
                    state.changedTsPaths.delete(filePath);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (deletedTsPaths_1_1 && !deletedTsPaths_1_1.done && (_c = deletedTsPaths_1.return)) _c.call(deletedTsPaths_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            // Now, changedTsPaths contains physically changed TS paths. Use the previous program's logical
            // dependency graph to determine logically changed files.
            var depGraph = new dependency_tracking_1.FileDependencyGraph();
            // If a previous compilation exists, use its dependency graph to determine the set of logically
            // changed files.
            var logicalChanges = null;
            if (state.lastGood !== null) {
                // Extract the set of logically changed files. At the same time, this operation populates the
                // current (fresh) dependency graph with information about those files which have not
                // logically changed.
                logicalChanges = depGraph.updateWithPhysicalChanges(state.lastGood.depGraph, state.changedTsPaths, deletedTsPaths, state.changedResourcePaths);
                try {
                    for (var _h = tslib_1.__values(state.changedTsPaths), _j = _h.next(); !_j.done; _j = _h.next()) {
                        var fileName = _j.value;
                        logicalChanges.add(fileName);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_j && !_j.done && (_d = _h.return)) _d.call(_h);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                try {
                    // Any logically changed files need to be re-emitted. Most of the time this would happen
                    // regardless because the new dependency graph would _also_ identify the file as stale.
                    // However there are edge cases such as removing a component from an NgModule without adding
                    // it to another one, where the previous graph identifies the file as logically changed, but
                    // the new graph (which does not have that edge) fails to identify that the file should be
                    // re-emitted.
                    for (var logicalChanges_1 = tslib_1.__values(logicalChanges), logicalChanges_1_1 = logicalChanges_1.next(); !logicalChanges_1_1.done; logicalChanges_1_1 = logicalChanges_1.next()) {
                        var change = logicalChanges_1_1.value;
                        state.pendingEmit.add(change);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (logicalChanges_1_1 && !logicalChanges_1_1.done && (_e = logicalChanges_1.return)) _e.call(logicalChanges_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
            // `state` now reflects the initial pending state of the current compilation.
            return new IncrementalDriver(state, new Set(tsOnlyFiles(newProgram)), depGraph, logicalChanges);
        };
        IncrementalDriver.fresh = function (program) {
            // Initialize the set of files which need to be emitted to the set of all TS files in the
            // program.
            var tsFiles = tsOnlyFiles(program);
            var state = {
                kind: BuildStateKind.Pending,
                pendingEmit: new Set(tsFiles.map(function (sf) { return sf.fileName; })),
                changedResourcePaths: new Set(),
                changedTsPaths: new Set(),
                lastGood: null,
            };
            return new IncrementalDriver(state, new Set(tsFiles), new dependency_tracking_1.FileDependencyGraph(), /* logicalChanges */ null);
        };
        IncrementalDriver.prototype.recordSuccessfulAnalysis = function (traitCompiler) {
            var e_6, _a;
            if (this.state.kind !== BuildStateKind.Pending) {
                // Changes have already been incorporated.
                return;
            }
            var pendingEmit = this.state.pendingEmit;
            var state = this.state;
            try {
                for (var _b = tslib_1.__values(this.allTsFiles), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var sf = _c.value;
                    if (this.depGraph.isStale(sf, state.changedTsPaths, state.changedResourcePaths)) {
                        // Something has changed which requires this file be re-emitted.
                        pendingEmit.add(sf.fileName);
                    }
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_6) throw e_6.error; }
            }
            // Update the state to an `AnalyzedBuildState`.
            this.state = {
                kind: BuildStateKind.Analyzed,
                pendingEmit: pendingEmit,
                // Since this compilation was successfully analyzed, update the "last good" artifacts to the
                // ones from the current compilation.
                lastGood: {
                    depGraph: this.depGraph,
                    traitCompiler: traitCompiler,
                }
            };
        };
        IncrementalDriver.prototype.recordSuccessfulEmit = function (sf) { this.state.pendingEmit.delete(sf.fileName); };
        IncrementalDriver.prototype.safeToSkipEmit = function (sf) { return !this.state.pendingEmit.has(sf.fileName); };
        IncrementalDriver.prototype.priorWorkFor = function (sf) {
            if (this.state.lastGood === null || this.logicalChanges === null) {
                // There is no previous good build, so no prior work exists.
                return null;
            }
            else if (this.logicalChanges.has(sf.fileName)) {
                // Prior work might exist, but would be stale as the file in question has logically changed.
                return null;
            }
            else {
                // Prior work might exist, and if it does then it's usable!
                return this.state.lastGood.traitCompiler.recordsFor(sf);
            }
        };
        return IncrementalDriver;
    }());
    exports.IncrementalDriver = IncrementalDriver;
    var BuildStateKind;
    (function (BuildStateKind) {
        BuildStateKind[BuildStateKind["Pending"] = 0] = "Pending";
        BuildStateKind[BuildStateKind["Analyzed"] = 1] = "Analyzed";
    })(BuildStateKind || (BuildStateKind = {}));
    function tsOnlyFiles(program) {
        return program.getSourceFiles().filter(function (sf) { return !sf.isDeclarationFile; });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2luY3JlbWVudGFsL3NyYy9zdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFJSCwyRUFBK0Q7SUFJL0QsMkdBQTBEO0lBRTFEOztPQUVHO0lBQ0g7UUFRRSwyQkFDSSxLQUF3QixFQUFVLFVBQThCLEVBQ3ZELFFBQTZCLEVBQVUsY0FBZ0M7WUFEOUMsZUFBVSxHQUFWLFVBQVUsQ0FBb0I7WUFDdkQsYUFBUSxHQUFSLFFBQVEsQ0FBcUI7WUFBVSxtQkFBYyxHQUFkLGNBQWMsQ0FBa0I7WUFDbEYsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDckIsQ0FBQztRQUVEOzs7Ozs7V0FNRztRQUNJLDJCQUFTLEdBQWhCLFVBQ0ksVUFBc0IsRUFBRSxTQUE0QixFQUFFLFVBQXNCLEVBQzVFLHFCQUF1Qzs7WUFDekMsdUVBQXVFO1lBQ3ZFLElBQUksS0FBd0IsQ0FBQztZQUM3QixJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLGNBQWMsQ0FBQyxPQUFPLEVBQUU7Z0JBQ25ELDhGQUE4RjtnQkFDOUYsY0FBYztnQkFDZCxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQzthQUN6QjtpQkFBTTtnQkFDTCx3RkFBd0Y7Z0JBQ3hGLDJCQUEyQjtnQkFDM0IsS0FBSyxHQUFHO29CQUNOLElBQUksRUFBRSxjQUFjLENBQUMsT0FBTztvQkFDNUIsV0FBVyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsV0FBVztvQkFDeEMsb0JBQW9CLEVBQUUsSUFBSSxHQUFHLEVBQWtCO29CQUMvQyxjQUFjLEVBQUUsSUFBSSxHQUFHLEVBQVU7b0JBQ2pDLFFBQVEsRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLFFBQVE7aUJBQ25DLENB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QUssSUFBSSxJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssSUFBSSxFQUFFO2dCQUNoRSw0REFBNEQ7Z0JBQzVELE9BQU8sSUFBSSxDQUFDO2FBQ2I7aUJBQU0sSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQy9DLDRGQUE0RjtnQkFDNUYsT0FBTyxJQUFJLENBQUM7YUFDYjtpQkFBTTtnQkFDTCwyREFBMkQ7Z0JBQzNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN6RDtRQUNILENBQUM7UUFDSCx3QkFBQztJQUFELENBQUMsQUFqTUQsSUFpTUM7SUFqTVksOENBQWlCO0lBcU05QixJQUFLLGNBR0o7SUFIRCxXQUFLLGNBQWM7UUFDakIseURBQU8sQ0FBQTtRQUNQLDJEQUFRLENBQUE7SUFDVixDQUFDLEVBSEksY0FBYyxLQUFkLGNBQWMsUUFHbEI7SUF1RkQsU0FBUyxXQUFXLENBQUMsT0FBbUI7UUFDdEMsT0FBTyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQXJCLENBQXFCLENBQUMsQ0FBQztJQUN0RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgYWJzb2x1dGVGcm9tfSBmcm9tICcuLi8uLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0NsYXNzUmVjb3JkLCBUcmFpdENvbXBpbGVyfSBmcm9tICcuLi8uLi90cmFuc2Zvcm0nO1xuaW1wb3J0IHtJbmNyZW1lbnRhbEJ1aWxkfSBmcm9tICcuLi9hcGknO1xuXG5pbXBvcnQge0ZpbGVEZXBlbmRlbmN5R3JhcGh9IGZyb20gJy4vZGVwZW5kZW5jeV90cmFja2luZyc7XG5cbi8qKlxuICogRHJpdmVzIGFuIGluY3JlbWVudGFsIGJ1aWxkLCBieSB0cmFja2luZyBjaGFuZ2VzIGFuZCBkZXRlcm1pbmluZyB3aGljaCBmaWxlcyBuZWVkIHRvIGJlIGVtaXR0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBJbmNyZW1lbnRhbERyaXZlciBpbXBsZW1lbnRzIEluY3JlbWVudGFsQnVpbGQ8Q2xhc3NSZWNvcmQ+IHtcbiAgLyoqXG4gICAqIFN0YXRlIG9mIHRoZSBjdXJyZW50IGJ1aWxkLlxuICAgKlxuICAgKiBUaGlzIHRyYW5zaXRpb25zIGFzIHRoZSBjb21waWxhdGlvbiBwcm9ncmVzc2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0ZTogQnVpbGRTdGF0ZTtcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKFxuICAgICAgc3RhdGU6IFBlbmRpbmdCdWlsZFN0YXRlLCBwcml2YXRlIGFsbFRzRmlsZXM6IFNldDx0cy5Tb3VyY2VGaWxlPixcbiAgICAgIHJlYWRvbmx5IGRlcEdyYXBoOiBGaWxlRGVwZW5kZW5jeUdyYXBoLCBwcml2YXRlIGxvZ2ljYWxDaGFuZ2VzOiBTZXQ8c3RyaW5nPnxudWxsKSB7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhbiBgSW5jcmVtZW50YWxEcml2ZXJgIHdpdGggYSBzdGFydGluZyBzdGF0ZSB0aGF0IGluY29ycG9yYXRlcyB0aGUgcmVzdWx0cyBvZiBhXG4gICAqIHByZXZpb3VzIGJ1aWxkLlxuICAgKlxuICAgKiBUaGUgcHJldmlvdXMgYnVpbGQncyBgQnVpbGRTdGF0ZWAgaXMgcmVjb25jaWxlZCB3aXRoIHRoZSBuZXcgcHJvZ3JhbSdzIGNoYW5nZXMsIGFuZCB0aGUgcmVzdWx0c1xuICAgKiBhcmUgbWVyZ2VkIGludG8gdGhlIG5ldyBidWlsZCdzIGBQZW5kaW5nQnVpbGRTdGF0ZWAuXG4gICAqL1xuICBzdGF0aWMgcmVjb25jaWxlKFxuICAgICAgb2xkUHJvZ3JhbTogdHMuUHJvZ3JhbSwgb2xkRHJpdmVyOiBJbmNyZW1lbnRhbERyaXZlciwgbmV3UHJvZ3JhbTogdHMuUHJvZ3JhbSxcbiAgICAgIG1vZGlmaWVkUmVzb3VyY2VGaWxlczogU2V0PHN0cmluZz58bnVsbCk6IEluY3JlbWVudGFsRHJpdmVyIHtcbiAgICAvLyBJbml0aWFsaXplIHRoZSBzdGF0ZSBvZiB0aGUgY3VycmVudCBidWlsZCBiYXNlZCBvbiB0aGUgcHJldmlvdXMgb25lLlxuICAgIGxldCBzdGF0ZTogUGVuZGluZ0J1aWxkU3RhdGU7XG4gICAgaWYgKG9sZERyaXZlci5zdGF0ZS5raW5kID09PSBCdWlsZFN0YXRlS2luZC5QZW5kaW5nKSB7XG4gICAgICAvLyBUaGUgcHJldmlvdXMgYnVpbGQgbmV2ZXIgbWFkZSBpdCBwYXN0IHRoZSBwZW5kaW5nIHN0YXRlLiBSZXVzZSBpdCBhcyB0aGUgc3RhcnRpbmcgc3RhdGUgZm9yXG4gICAgICAvLyB0aGlzIGJ1aWxkLlxuICAgICAgc3RhdGUgPSBvbGREcml2ZXIuc3RhdGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZSBwcmV2aW91cyBidWlsZCB3YXMgc3VjY2Vzc2Z1bGx5IGFuYWx5emVkLiBgcGVuZGluZ0VtaXRgIGlzIHRoZSBvbmx5IHN0YXRlIGNhcnJpZWRcbiAgICAgIC8vIGZvcndhcmQgaW50byB0aGlzIGJ1aWxkLlxuICAgICAgc3RhdGUgPSB7XG4gICAgICAgIGtpbmQ6IEJ1aWxkU3RhdGVLaW5kLlBlbmRpbmcsXG4gICAgICAgIHBlbmRpbmdFbWl0OiBvbGREcml2ZXIuc3RhdGUucGVuZGluZ0VtaXQsXG4gICAgICAgIGNoYW5nZWRSZXNvdXJjZVBhdGhzOiBuZXcgU2V0PEFic29sdXRlRnNQYXRoPigpLFxuICAgICAgICBjaGFuZ2VkVHNQYXRoczogbmV3IFNldDxzdHJpbmc+KCksXG4gICAgICAgIGxhc3RHb29kOiBvbGREcml2ZXIuc3RhdGUubGFzdEdvb2QsXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIE1lcmdlIHRoZSBmcmVzaGx5IG1vZGlmaWVkIHJlc291cmNlIGZpbGVzIHdpdGggYW55IHByaW9yIG9uZXMuXG4gICAgaWYgKG1vZGlmaWVkUmVzb3VyY2VGaWxlcyAhPT0gbnVsbCkge1xuICAgICAgZm9yIChjb25zdCByZXNGaWxlIG9mIG1vZGlmaWVkUmVzb3VyY2VGaWxlcykge1xuICAgICAgICBzdGF0ZS5jaGFuZ2VkUmVzb3VyY2VQYXRocy5hZGQoYWJzb2x1dGVGcm9tKHJlc0ZpbGUpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBOZXh0LCBwcm9jZXNzIHRoZSBmaWxlcyBpbiB0aGUgbmV3IHByb2dyYW0sIHdpdGggYSBjb3VwbGUgb2YgZ29hbHM6XG4gICAgLy8gMSkgRGV0ZXJtaW5lIHdoaWNoIFRTIGZpbGVzIGhhdmUgY2hhbmdlZCwgaWYgYW55LCBhbmQgbWVyZ2UgdGhlbSBpbnRvIGBjaGFuZ2VkVHNGaWxlc2AuXG4gICAgLy8gMikgUHJvZHVjZSBhIGxpc3Qgb2YgVFMgZmlsZXMgd2hpY2ggbm8gbG9uZ2VyIGV4aXN0IGluIHRoZSBwcm9ncmFtICh0aGV5J3ZlIGJlZW4gZGVsZXRlZFxuICAgIC8vICAgIHNpbmNlIHRoZSBwcmV2aW91cyBjb21waWxhdGlvbikuIFRoZXNlIG5lZWQgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBzdGF0ZSB0cmFja2luZyB0byBhdm9pZFxuICAgIC8vICAgIGxlYWtpbmcgbWVtb3J5LlxuXG4gICAgLy8gQWxsIGZpbGVzIGluIHRoZSBvbGQgcHJvZ3JhbSwgZm9yIGVhc3kgZGV0ZWN0aW9uIG9mIGNoYW5nZXMuXG4gICAgY29uc3Qgb2xkRmlsZXMgPSBuZXcgU2V0PHRzLlNvdXJjZUZpbGU+KG9sZFByb2dyYW0uZ2V0U291cmNlRmlsZXMoKSk7XG5cbiAgICAvLyBBc3N1bWUgYWxsIHRoZSBvbGQgZmlsZXMgd2VyZSBkZWxldGVkIHRvIGJlZ2luIHdpdGguIE9ubHkgVFMgZmlsZXMgYXJlIHRyYWNrZWQuXG4gICAgY29uc3QgZGVsZXRlZFRzUGF0aHMgPSBuZXcgU2V0PHN0cmluZz4odHNPbmx5RmlsZXMob2xkUHJvZ3JhbSkubWFwKHNmID0+IHNmLmZpbGVOYW1lKSk7XG5cbiAgICBmb3IgKGNvbnN0IG5ld0ZpbGUgb2YgbmV3UHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpKSB7XG4gICAgICBpZiAoIW5ld0ZpbGUuaXNEZWNsYXJhdGlvbkZpbGUpIHtcbiAgICAgICAgLy8gVGhpcyBmaWxlIGV4aXN0cyBpbiB0aGUgbmV3IHByb2dyYW0sIHNvIHJlbW92ZSBpdCBmcm9tIGBkZWxldGVkVHNQYXRoc2AuXG4gICAgICAgIGRlbGV0ZWRUc1BhdGhzLmRlbGV0ZShuZXdGaWxlLmZpbGVOYW1lKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9sZEZpbGVzLmhhcyhuZXdGaWxlKSkge1xuICAgICAgICAvLyBUaGlzIGZpbGUgaGFzbid0IGNoYW5nZWQ7IG5vIG5lZWQgdG8gbG9vayBhdCBpdCBmdXJ0aGVyLlxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGZpbGUgaGFzIGNoYW5nZWQgc2luY2UgdGhlIGxhc3Qgc3VjY2Vzc2Z1bCBidWlsZC4gVGhlIGFwcHJvcHJpYXRlIHJlYWN0aW9uIGRlcGVuZHMgb25cbiAgICAgIC8vIHdoYXQga2luZCBvZiBmaWxlIGl0IGlzLlxuICAgICAgaWYgKCFuZXdGaWxlLmlzRGVjbGFyYXRpb25GaWxlKSB7XG4gICAgICAgIC8vIEl0J3MgYSAudHMgZmlsZSwgc28gdHJhY2sgaXQgYXMgYSBjaGFuZ2UuXG4gICAgICAgIHN0YXRlLmNoYW5nZWRUc1BhdGhzLmFkZChuZXdGaWxlLmZpbGVOYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEl0J3MgYSAuZC50cyBmaWxlLiBDdXJyZW50bHkgdGhlIGNvbXBpbGVyIGRvZXMgbm90IGRvIGEgZ3JlYXQgam9iIG9mIHRyYWNraW5nXG4gICAgICAgIC8vIGRlcGVuZGVuY2llcyBvbiAuZC50cyBmaWxlcywgc28gYmFpbCBvdXQgb2YgaW5jcmVtZW50YWwgYnVpbGRzIGhlcmUgYW5kIGRvIGEgZnVsbCBidWlsZC5cbiAgICAgICAgLy8gVGhpcyB1c3VhbGx5IG9ubHkgaGFwcGVucyBpZiBzb21ldGhpbmcgaW4gbm9kZV9tb2R1bGVzIGNoYW5nZXMuXG4gICAgICAgIHJldHVybiBJbmNyZW1lbnRhbERyaXZlci5mcmVzaChuZXdQcm9ncmFtKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGUgbmV4dCBzdGVwIGlzIHRvIHJlbW92ZSBhbnkgZGVsZXRlZCBmaWxlcyBmcm9tIHRoZSBzdGF0ZS5cbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGRlbGV0ZWRUc1BhdGhzKSB7XG4gICAgICBzdGF0ZS5wZW5kaW5nRW1pdC5kZWxldGUoZmlsZVBhdGgpO1xuXG4gICAgICAvLyBFdmVuIGlmIHRoZSBmaWxlIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGN1cnJlbnQgY29tcGlsYXRpb24sIGl0IHN0aWxsIG1pZ2h0IGhhdmUgYmVlbiBjaGFuZ2VkXG4gICAgICAvLyBpbiBhIHByZXZpb3VzIG9uZSwgc28gZGVsZXRlIGl0IGZyb20gdGhlIHNldCBvZiBjaGFuZ2VkIFRTIGZpbGVzLCBqdXN0IGluIGNhc2UuXG4gICAgICBzdGF0ZS5jaGFuZ2VkVHNQYXRocy5kZWxldGUoZmlsZVBhdGgpO1xuICAgIH1cblxuICAgIC8vIE5vdywgY2hhbmdlZFRzUGF0aHMgY29udGFpbnMgcGh5c2ljYWxseSBjaGFuZ2VkIFRTIHBhdGhzLiBVc2UgdGhlIHByZXZpb3VzIHByb2dyYW0ncyBsb2dpY2FsXG4gICAgLy8gZGVwZW5kZW5jeSBncmFwaCB0byBkZXRlcm1pbmUgbG9naWNhbGx5IGNoYW5nZWQgZmlsZXMuXG4gICAgY29uc3QgZGVwR3JhcGggPSBuZXcgRmlsZURlcGVuZGVuY3lHcmFwaCgpO1xuXG4gICAgLy8gSWYgYSBwcmV2aW91cyBjb21waWxhdGlvbiBleGlzdHMsIHVzZSBpdHMgZGVwZW5kZW5jeSBncmFwaCB0byBkZXRlcm1pbmUgdGhlIHNldCBvZiBsb2dpY2FsbHlcbiAgICAvLyBjaGFuZ2VkIGZpbGVzLlxuICAgIGxldCBsb2dpY2FsQ2hhbmdlczogU2V0PHN0cmluZz58bnVsbCA9IG51bGw7XG4gICAgaWYgKHN0YXRlLmxhc3RHb29kICE9PSBudWxsKSB7XG4gICAgICAvLyBFeHRyYWN0IHRoZSBzZXQgb2YgbG9naWNhbGx5IGNoYW5nZWQgZmlsZXMuIEF0IHRoZSBzYW1lIHRpbWUsIHRoaXMgb3BlcmF0aW9uIHBvcHVsYXRlcyB0aGVcbiAgICAgIC8vIGN1cnJlbnQgKGZyZXNoKSBkZXBlbmRlbmN5IGdyYXBoIHdpdGggaW5mb3JtYXRpb24gYWJvdXQgdGhvc2UgZmlsZXMgd2hpY2ggaGF2ZSBub3RcbiAgICAgIC8vIGxvZ2ljYWxseSBjaGFuZ2VkLlxuICAgICAgbG9naWNhbENoYW5nZXMgPSBkZXBHcmFwaC51cGRhdGVXaXRoUGh5c2ljYWxDaGFuZ2VzKFxuICAgICAgICAgIHN0YXRlLmxhc3RHb29kLmRlcEdyYXBoLCBzdGF0ZS5jaGFuZ2VkVHNQYXRocywgZGVsZXRlZFRzUGF0aHMsXG4gICAgICAgICAgc3RhdGUuY2hhbmdlZFJlc291cmNlUGF0aHMpO1xuICAgICAgZm9yIChjb25zdCBmaWxlTmFtZSBvZiBzdGF0ZS5jaGFuZ2VkVHNQYXRocykge1xuICAgICAgICBsb2dpY2FsQ2hhbmdlcy5hZGQoZmlsZU5hbWUpO1xuICAgICAgfVxuXG4gICAgICAvLyBBbnkgbG9naWNhbGx5IGNoYW5nZWQgZmlsZXMgbmVlZCB0byBiZSByZS1lbWl0dGVkLiBNb3N0IG9mIHRoZSB0aW1lIHRoaXMgd291bGQgaGFwcGVuXG4gICAgICAvLyByZWdhcmRsZXNzIGJlY2F1c2UgdGhlIG5ldyBkZXBlbmRlbmN5IGdyYXBoIHdvdWxkIF9hbHNvXyBpZGVudGlmeSB0aGUgZmlsZSBhcyBzdGFsZS5cbiAgICAgIC8vIEhvd2V2ZXIgdGhlcmUgYXJlIGVkZ2UgY2FzZXMgc3VjaCBhcyByZW1vdmluZyBhIGNvbXBvbmVudCBmcm9tIGFuIE5nTW9kdWxlIHdpdGhvdXQgYWRkaW5nXG4gICAgICAvLyBpdCB0byBhbm90aGVyIG9uZSwgd2hlcmUgdGhlIHByZXZpb3VzIGdyYXBoIGlkZW50aWZpZXMgdGhlIGZpbGUgYXMgbG9naWNhbGx5IGNoYW5nZWQsIGJ1dFxuICAgICAgLy8gdGhlIG5ldyBncmFwaCAod2hpY2ggZG9lcyBub3QgaGF2ZSB0aGF0IGVkZ2UpIGZhaWxzIHRvIGlkZW50aWZ5IHRoYXQgdGhlIGZpbGUgc2hvdWxkIGJlXG4gICAgICAvLyByZS1lbWl0dGVkLlxuICAgICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgbG9naWNhbENoYW5nZXMpIHtcbiAgICAgICAgc3RhdGUucGVuZGluZ0VtaXQuYWRkKGNoYW5nZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYHN0YXRlYCBub3cgcmVmbGVjdHMgdGhlIGluaXRpYWwgcGVuZGluZyBzdGF0ZSBvZiB0aGUgY3VycmVudCBjb21waWxhdGlvbi5cblxuICAgIHJldHVybiBuZXcgSW5jcmVtZW50YWxEcml2ZXIoXG4gICAgICAgIHN0YXRlLCBuZXcgU2V0PHRzLlNvdXJjZUZpbGU+KHRzT25seUZpbGVzKG5ld1Byb2dyYW0pKSwgZGVwR3JhcGgsIGxvZ2ljYWxDaGFuZ2VzKTtcbiAgfVxuXG4gIHN0YXRpYyBmcmVzaChwcm9ncmFtOiB0cy5Qcm9ncmFtKTogSW5jcmVtZW50YWxEcml2ZXIge1xuICAgIC8vIEluaXRpYWxpemUgdGhlIHNldCBvZiBmaWxlcyB3aGljaCBuZWVkIHRvIGJlIGVtaXR0ZWQgdG8gdGhlIHNldCBvZiBhbGwgVFMgZmlsZXMgaW4gdGhlXG4gICAgLy8gcHJvZ3JhbS5cbiAgICBjb25zdCB0c0ZpbGVzID0gdHNPbmx5RmlsZXMocHJvZ3JhbSk7XG5cbiAgICBjb25zdCBzdGF0ZTogUGVuZGluZ0J1aWxkU3RhdGUgPSB7XG4gICAgICBraW5kOiBCdWlsZFN0YXRlS2luZC5QZW5kaW5nLFxuICAgICAgcGVuZGluZ0VtaXQ6IG5ldyBTZXQ8c3RyaW5nPih0c0ZpbGVzLm1hcChzZiA9PiBzZi5maWxlTmFtZSkpLFxuICAgICAgY2hhbmdlZFJlc291cmNlUGF0aHM6IG5ldyBTZXQ8QWJzb2x1dGVGc1BhdGg+KCksXG4gICAgICBjaGFuZ2VkVHNQYXRoczogbmV3IFNldDxzdHJpbmc+KCksXG4gICAgICBsYXN0R29vZDogbnVsbCxcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBJbmNyZW1lbnRhbERyaXZlcihcbiAgICAgICAgc3RhdGUsIG5ldyBTZXQodHNGaWxlcyksIG5ldyBGaWxlRGVwZW5kZW5jeUdyYXBoKCksIC8qIGxvZ2ljYWxDaGFuZ2VzICovIG51bGwpO1xuICB9XG5cbiAgcmVjb3JkU3VjY2Vzc2Z1bEFuYWx5c2lzKHRyYWl0Q29tcGlsZXI6IFRyYWl0Q29tcGlsZXIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5raW5kICE9PSBCdWlsZFN0YXRlS2luZC5QZW5kaW5nKSB7XG4gICAgICAvLyBDaGFuZ2VzIGhhdmUgYWxyZWFkeSBiZWVuIGluY29ycG9yYXRlZC5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwZW5kaW5nRW1pdCA9IHRoaXMuc3RhdGUucGVuZGluZ0VtaXQ7XG5cbiAgICBjb25zdCBzdGF0ZTogUGVuZGluZ0J1aWxkU3RhdGUgPSB0aGlzLnN0YXRlO1xuXG4gICAgZm9yIChjb25zdCBzZiBvZiB0aGlzLmFsbFRzRmlsZXMpIHtcbiAgICAgIGlmICh0aGlzLmRlcEdyYXBoLmlzU3RhbGUoc2YsIHN0YXRlLmNoYW5nZWRUc1BhdGhzLCBzdGF0ZS5jaGFuZ2VkUmVzb3VyY2VQYXRocykpIHtcbiAgICAgICAgLy8gU29tZXRoaW5nIGhhcyBjaGFuZ2VkIHdoaWNoIHJlcXVpcmVzIHRoaXMgZmlsZSBiZSByZS1lbWl0dGVkLlxuICAgICAgICBwZW5kaW5nRW1pdC5hZGQoc2YuZmlsZU5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgc3RhdGUgdG8gYW4gYEFuYWx5emVkQnVpbGRTdGF0ZWAuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGtpbmQ6IEJ1aWxkU3RhdGVLaW5kLkFuYWx5emVkLFxuICAgICAgcGVuZGluZ0VtaXQsXG5cbiAgICAgIC8vIFNpbmNlIHRoaXMgY29tcGlsYXRpb24gd2FzIHN1Y2Nlc3NmdWxseSBhbmFseXplZCwgdXBkYXRlIHRoZSBcImxhc3QgZ29vZFwiIGFydGlmYWN0cyB0byB0aGVcbiAgICAgIC8vIG9uZXMgZnJvbSB0aGUgY3VycmVudCBjb21waWxhdGlvbi5cbiAgICAgIGxhc3RHb29kOiB7XG4gICAgICAgIGRlcEdyYXBoOiB0aGlzLmRlcEdyYXBoLFxuICAgICAgICB0cmFpdENvbXBpbGVyOiB0cmFpdENvbXBpbGVyLFxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICByZWNvcmRTdWNjZXNzZnVsRW1pdChzZjogdHMuU291cmNlRmlsZSk6IHZvaWQgeyB0aGlzLnN0YXRlLnBlbmRpbmdFbWl0LmRlbGV0ZShzZi5maWxlTmFtZSk7IH1cblxuICBzYWZlVG9Ta2lwRW1pdChzZjogdHMuU291cmNlRmlsZSk6IGJvb2xlYW4geyByZXR1cm4gIXRoaXMuc3RhdGUucGVuZGluZ0VtaXQuaGFzKHNmLmZpbGVOYW1lKTsgfVxuXG4gIHByaW9yV29ya0ZvcihzZjogdHMuU291cmNlRmlsZSk6IENsYXNzUmVjb3JkW118bnVsbCB7XG4gICAgaWYgKHRoaXMuc3RhdGUubGFzdEdvb2QgPT09IG51bGwgfHwgdGhpcy5sb2dpY2FsQ2hhbmdlcyA9PT0gbnVsbCkge1xuICAgICAgLy8gVGhlcmUgaXMgbm8gcHJldmlvdXMgZ29vZCBidWlsZCwgc28gbm8gcHJpb3Igd29yayBleGlzdHMuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKHRoaXMubG9naWNhbENoYW5nZXMuaGFzKHNmLmZpbGVOYW1lKSkge1xuICAgICAgLy8gUHJpb3Igd29yayBtaWdodCBleGlzdCwgYnV0IHdvdWxkIGJlIHN0YWxlIGFzIHRoZSBmaWxlIGluIHF1ZXN0aW9uIGhhcyBsb2dpY2FsbHkgY2hhbmdlZC5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBQcmlvciB3b3JrIG1pZ2h0IGV4aXN0LCBhbmQgaWYgaXQgZG9lcyB0aGVuIGl0J3MgdXNhYmxlIVxuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUubGFzdEdvb2QudHJhaXRDb21waWxlci5yZWNvcmRzRm9yKHNmKTtcbiAgICB9XG4gIH1cbn1cblxudHlwZSBCdWlsZFN0YXRlID0gUGVuZGluZ0J1aWxkU3RhdGUgfCBBbmFseXplZEJ1aWxkU3RhdGU7XG5cbmVudW0gQnVpbGRTdGF0ZUtpbmQge1xuICBQZW5kaW5nLFxuICBBbmFseXplZCxcbn1cblxuaW50ZXJmYWNlIEJhc2VCdWlsZFN0YXRlIHtcbiAga2luZDogQnVpbGRTdGF0ZUtpbmQ7XG5cbiAgLyoqXG4gICAqIFRoZSBoZWFydCBvZiBpbmNyZW1lbnRhbCBidWlsZHMuIFRoaXMgYFNldGAgdHJhY2tzIHRoZSBzZXQgb2YgZmlsZXMgd2hpY2ggbmVlZCB0byBiZSBlbWl0dGVkXG4gICAqIGR1cmluZyB0aGUgY3VycmVudCBjb21waWxhdGlvbi5cbiAgICpcbiAgICogVGhpcyBzdGFydHMgb3V0IGFzIHRoZSBzZXQgb2YgZmlsZXMgd2hpY2ggYXJlIHN0aWxsIHBlbmRpbmcgZnJvbSB0aGUgcHJldmlvdXMgcHJvZ3JhbSAob3IgdGhlXG4gICAqIGZ1bGwgc2V0IG9mIC50cyBmaWxlcyBvbiBhIGZyZXNoIGJ1aWxkKS5cbiAgICpcbiAgICogQWZ0ZXIgYW5hbHlzaXMsIGl0J3MgdXBkYXRlZCB0byBpbmNsdWRlIGFueSBmaWxlcyB3aGljaCBtaWdodCBoYXZlIGNoYW5nZWQgYW5kIG5lZWQgYSByZS1lbWl0XG4gICAqIGFzIGEgcmVzdWx0IG9mIGluY3JlbWVudGFsIGNoYW5nZXMuXG4gICAqXG4gICAqIElmIGFuIGVtaXQgaGFwcGVucywgYW55IHdyaXR0ZW4gZmlsZXMgYXJlIHJlbW92ZWQgZnJvbSB0aGUgYFNldGAsIGFzIHRoZXkncmUgbm8gbG9uZ2VyIHBlbmRpbmcuXG4gICAqXG4gICAqIFRodXMsIGFmdGVyIGNvbXBpbGF0aW9uIGBwZW5kaW5nRW1pdGAgc2hvdWxkIGJlIGVtcHR5IChvbiBhIHN1Y2Nlc3NmdWwgYnVpbGQpIG9yIGNvbnRhaW4gdGhlXG4gICAqIGZpbGVzIHdoaWNoIHN0aWxsIG5lZWQgdG8gYmUgZW1pdHRlZCBidXQgaGF2ZSBub3QgeWV0IGJlZW4gKGR1ZSB0byBlcnJvcnMpLlxuICAgKlxuICAgKiBgcGVuZGluZ0VtaXRgIGlzIHRyYWNrZWQgYXMgYXMgYFNldDxzdHJpbmc+YCBpbnN0ZWFkIG9mIGEgYFNldDx0cy5Tb3VyY2VGaWxlPmAsIGJlY2F1c2UgdGhlXG4gICAqIGNvbnRlbnRzIG9mIHRoZSBmaWxlIGFyZSBub3QgaW1wb3J0YW50IGhlcmUsIG9ubHkgd2hldGhlciBvciBub3QgdGhlIGN1cnJlbnQgdmVyc2lvbiBvZiBpdFxuICAgKiBuZWVkcyB0byBiZSBlbWl0dGVkLiBUaGUgYHN0cmluZ2BzIGhlcmUgYXJlIFRTIGZpbGUgcGF0aHMuXG4gICAqXG4gICAqIFNlZSB0aGUgUkVBRE1FLm1kIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHRoaXMgYWxnb3JpdGhtLlxuICAgKi9cbiAgcGVuZGluZ0VtaXQ6IFNldDxzdHJpbmc+O1xuXG5cbiAgLyoqXG4gICAqIFNwZWNpZmljIGFzcGVjdHMgb2YgdGhlIGxhc3QgY29tcGlsYXRpb24gd2hpY2ggc3VjY2Vzc2Z1bGx5IGNvbXBsZXRlZCBhbmFseXNpcywgaWYgYW55LlxuICAgKi9cbiAgbGFzdEdvb2Q6IHtcbiAgICAvKipcbiAgICAgKiBUaGUgZGVwZW5kZW5jeSBncmFwaCBmcm9tIHRoZSBsYXN0IHN1Y2Nlc3NmdWxseSBhbmFseXplZCBidWlsZC5cbiAgICAgKlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIGxvZ2ljYWwgaW1wYWN0IG9mIHBoeXNpY2FsIGZpbGUgY2hhbmdlcy5cbiAgICAgKi9cbiAgICBkZXBHcmFwaDogRmlsZURlcGVuZGVuY3lHcmFwaDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBgVHJhaXRDb21waWxlcmAgZnJvbSB0aGUgbGFzdCBzdWNjZXNzZnVsbHkgYW5hbHl6ZWQgYnVpbGQuXG4gICAgICpcbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gZXh0cmFjdCBcInByaW9yIHdvcmtcIiB3aGljaCBtaWdodCBiZSByZXVzYWJsZSBpbiB0aGlzIGNvbXBpbGF0aW9uLlxuICAgICAqL1xuICAgIHRyYWl0Q29tcGlsZXI6IFRyYWl0Q29tcGlsZXI7XG4gIH18bnVsbDtcbn1cblxuLyoqXG4gKiBTdGF0ZSBvZiBhIGJ1aWxkIGJlZm9yZSB0aGUgQW5ndWxhciBhbmFseXNpcyBwaGFzZSBjb21wbGV0ZXMuXG4gKi9cbmludGVyZmFjZSBQZW5kaW5nQnVpbGRTdGF0ZSBleHRlbmRzIEJhc2VCdWlsZFN0YXRlIHtcbiAga2luZDogQnVpbGRTdGF0ZUtpbmQuUGVuZGluZztcblxuICAvKipcbiAgICogU2V0IG9mIGZpbGVzIHdoaWNoIGFyZSBrbm93biB0byBuZWVkIGFuIGVtaXQuXG4gICAqXG4gICAqIEJlZm9yZSB0aGUgY29tcGlsZXIncyBhbmFseXNpcyBwaGFzZSBjb21wbGV0ZXMsIGBwZW5kaW5nRW1pdGAgb25seSBjb250YWlucyBmaWxlcyB0aGF0IHdlcmVcbiAgICogc3RpbGwgcGVuZGluZyBhZnRlciB0aGUgcHJldmlvdXMgYnVpbGQuXG4gICAqL1xuICBwZW5kaW5nRW1pdDogU2V0PHN0cmluZz47XG5cbiAgLyoqXG4gICAqIFNldCBvZiBUeXBlU2NyaXB0IGZpbGUgcGF0aHMgd2hpY2ggaGF2ZSBjaGFuZ2VkIHNpbmNlIHRoZSBsYXN0IHN1Y2Nlc3NmdWxseSBhbmFseXplZCBidWlsZC5cbiAgICovXG4gIGNoYW5nZWRUc1BhdGhzOiBTZXQ8c3RyaW5nPjtcblxuICAvKipcbiAgICogU2V0IG9mIHJlc291cmNlIGZpbGUgcGF0aHMgd2hpY2ggaGF2ZSBjaGFuZ2VkIHNpbmNlIHRoZSBsYXN0IHN1Y2Nlc3NmdWxseSBhbmFseXplZCBidWlsZC5cbiAgICovXG4gIGNoYW5nZWRSZXNvdXJjZVBhdGhzOiBTZXQ8QWJzb2x1dGVGc1BhdGg+O1xufVxuXG5pbnRlcmZhY2UgQW5hbHl6ZWRCdWlsZFN0YXRlIGV4dGVuZHMgQmFzZUJ1aWxkU3RhdGUge1xuICBraW5kOiBCdWlsZFN0YXRlS2luZC5BbmFseXplZDtcblxuICAvKipcbiAgICogU2V0IG9mIGZpbGVzIHdoaWNoIGFyZSBrbm93biB0byBuZWVkIGFuIGVtaXQuXG4gICAqXG4gICAqIEFmdGVyIGFuYWx5c2lzIGNvbXBsZXRlcyAodGhhdCBpcywgdGhlIHN0YXRlIHRyYW5zaXRpb25zIHRvIGBBbmFseXplZEJ1aWxkU3RhdGVgKSwgdGhlXG4gICAqIGBwZW5kaW5nRW1pdGAgc2V0IHRha2VzIGludG8gYWNjb3VudCBhbnkgb24tZGlzayBjaGFuZ2VzIG1hZGUgc2luY2UgdGhlIGxhc3Qgc3VjY2Vzc2Z1bGx5XG4gICAqIGFuYWx5emVkIGJ1aWxkLlxuICAgKi9cbiAgcGVuZGluZ0VtaXQ6IFNldDxzdHJpbmc+O1xufVxuXG5mdW5jdGlvbiB0c09ubHlGaWxlcyhwcm9ncmFtOiB0cy5Qcm9ncmFtKTogUmVhZG9ubHlBcnJheTx0cy5Tb3VyY2VGaWxlPiB7XG4gIHJldHVybiBwcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkuZmlsdGVyKHNmID0+ICFzZi5pc0RlY2xhcmF0aW9uRmlsZSk7XG59XG4iXX0=