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
        define("@angular/compiler-cli/src/ngtsc/transform/src/trait", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TraitState;
    (function (TraitState) {
        /**
         * Pending traits are freshly created and have never been analyzed.
         */
        TraitState[TraitState["PENDING"] = 1] = "PENDING";
        /**
         * Analyzed traits have successfully been analyzed, but are pending resolution.
         */
        TraitState[TraitState["ANALYZED"] = 2] = "ANALYZED";
        /**
         * Resolved traits have successfully been analyzed and resolved and are ready for compilation.
         */
        TraitState[TraitState["RESOLVED"] = 4] = "RESOLVED";
        /**
         * Errored traits have failed either analysis or resolution and as a result contain diagnostics
         * describing the failure(s).
         */
        TraitState[TraitState["ERRORED"] = 8] = "ERRORED";
        /**
         * Skipped traits are no longer considered for compilation.
         */
        TraitState[TraitState["SKIPPED"] = 16] = "SKIPPED";
    })(TraitState = exports.TraitState || (exports.TraitState = {}));
    /**
     * The value side of `Trait` exposes a helper to create a `Trait` in a pending state (by delegating
     * to `TraitImpl`).
     */
    exports.Trait = {
        pending: function (handler, detected) { return TraitImpl.pending(handler, detected); },
    };
    /**
     * An implementation of the `Trait` type which transitions safely between the various
     * `TraitState`s.
     */
    var TraitImpl = /** @class */ (function () {
        function TraitImpl(handler, detected) {
            this.state = TraitState.PENDING;
            this.analysis = null;
            this.resolution = null;
            this.diagnostics = null;
            this.handler = handler;
            this.detected = detected;
        }
        TraitImpl.prototype.toAnalyzed = function (analysis) {
            // Only pending traits can be analyzed.
            this.assertTransitionLegal(TraitState.PENDING, TraitState.ANALYZED);
            this.analysis = analysis;
            this.state = TraitState.ANALYZED;
            return this;
        };
        TraitImpl.prototype.toErrored = function (diagnostics) {
            // Pending traits (during analysis) or analyzed traits (during resolution) can produce
            // diagnostics and enter an errored state.
            this.assertTransitionLegal(TraitState.PENDING | TraitState.ANALYZED, TraitState.RESOLVED);
            this.diagnostics = diagnostics;
            this.analysis = null;
            this.state = TraitState.ERRORED;
            return this;
        };
        TraitImpl.prototype.toResolved = function (resolution) {
            // Only analyzed traits can be resolved.
            this.assertTransitionLegal(TraitState.ANALYZED, TraitState.RESOLVED);
            this.resolution = resolution;
            this.state = TraitState.RESOLVED;
            return this;
        };
        TraitImpl.prototype.toSkipped = function () {
            // Only pending traits can be skipped.
            this.assertTransitionLegal(TraitState.PENDING, TraitState.SKIPPED);
            this.state = TraitState.SKIPPED;
            return this;
        };
        /**
         * Verifies that the trait is currently in one of the `allowedState`s.
         *
         * If correctly used, the `Trait` type and transition methods prevent illegal transitions from
         * occurring. However, if a reference to the `TraitImpl` instance typed with the previous
         * interface is retained after calling one of its transition methods, it will allow for illegal
         * transitions to take place. Hence, this assertion provides a little extra runtime protection.
         */
        TraitImpl.prototype.assertTransitionLegal = function (allowedState, transitionTo) {
            if (!(this.state & allowedState)) {
                throw new Error("Assertion failure: cannot transition from " + TraitState[this.state] + " to " + TraitState[transitionTo] + ".");
            }
        };
        /**
         * Construct a new `TraitImpl` in the pending state.
         */
        TraitImpl.pending = function (handler, detected) {
            return new TraitImpl(handler, detected);
        };
        return TraitImpl;
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3RyYW5zZm9ybS9zcmMvdHJhaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFLSCxJQUFZLFVBMEJYO0lBMUJELFdBQVksVUFBVTtRQUNwQjs7V0FFRztRQUNILGlEQUFjLENBQUE7UUFFZDs7V0FFRztRQUNILG1EQUFlLENBQUE7UUFFZjs7V0FFRztRQUNILG1EQUFlLENBQUE7UUFFZjs7O1dBR0c7UUFDSCxpREFBYyxDQUFBO1FBRWQ7O1dBRUc7UUFDSCxrREFBYyxDQUFBO0lBQ2hCLENBQUMsRUExQlcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUEwQnJCO0lBa0JEOzs7T0FHRztJQUNVLFFBQUEsS0FBSyxHQUFHO1FBQ25CLE9BQU8sRUFBRSxVQUFVLE9BQWtDLEVBQUUsUUFBeUIsSUFDMUMsT0FBQSxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBcEMsQ0FBb0M7S0FDM0UsQ0FBQztJQW1JRjs7O09BR0c7SUFDSDtRQVFFLG1CQUFZLE9BQWtDLEVBQUUsUUFBeUI7WUFQekUsVUFBSyxHQUFlLFVBQVUsQ0FBQyxPQUFPLENBQUM7WUFHdkMsYUFBUSxHQUFxQixJQUFJLENBQUM7WUFDbEMsZUFBVSxHQUFxQixJQUFJLENBQUM7WUFDcEMsZ0JBQVcsR0FBeUIsSUFBSSxDQUFDO1lBR3ZDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzNCLENBQUM7UUFFRCw4QkFBVSxHQUFWLFVBQVcsUUFBVztZQUNwQix1Q0FBdUM7WUFDdkMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxPQUFPLElBQThCLENBQUM7UUFDeEMsQ0FBQztRQUVELDZCQUFTLEdBQVQsVUFBVSxXQUE0QjtZQUNwQyxzRkFBc0Y7WUFDdEYsMENBQTBDO1lBQzFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFGLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1lBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztZQUNoQyxPQUFPLElBQTZCLENBQUM7UUFDdkMsQ0FBQztRQUVELDhCQUFVLEdBQVYsVUFBVyxVQUFhO1lBQ3RCLHdDQUF3QztZQUN4QyxJQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDN0IsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1lBQ2pDLE9BQU8sSUFBOEIsQ0FBQztRQUN4QyxDQUFDO1FBRUQsNkJBQVMsR0FBVDtZQUNFLHNDQUFzQztZQUN0QyxJQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1lBQ2hDLE9BQU8sSUFBNkIsQ0FBQztRQUN2QyxDQUFDO1FBRUQ7Ozs7Ozs7V0FPRztRQUNLLHlDQUFxQixHQUE3QixVQUE4QixZQUF3QixFQUFFLFlBQXdCO1lBQzlFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDLEVBQUU7Z0JBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQ1gsK0NBQTZDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQU8sVUFBVSxDQUFDLFlBQVksQ0FBQyxNQUFHLENBQUMsQ0FBQzthQUM1RztRQUNILENBQUM7UUFFRDs7V0FFRztRQUNJLGlCQUFPLEdBQWQsVUFBd0IsT0FBa0MsRUFBRSxRQUF5QjtZQUVuRixPQUFPLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQTBCLENBQUM7UUFDbkUsQ0FBQztRQUNILGdCQUFDO0lBQUQsQ0FBQyxBQXBFRCxJQW9FQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge0RlY29yYXRvckhhbmRsZXIsIERldGVjdFJlc3VsdH0gZnJvbSAnLi9hcGknO1xuXG5leHBvcnQgZW51bSBUcmFpdFN0YXRlIHtcbiAgLyoqXG4gICAqIFBlbmRpbmcgdHJhaXRzIGFyZSBmcmVzaGx5IGNyZWF0ZWQgYW5kIGhhdmUgbmV2ZXIgYmVlbiBhbmFseXplZC5cbiAgICovXG4gIFBFTkRJTkcgPSAweDAxLFxuXG4gIC8qKlxuICAgKiBBbmFseXplZCB0cmFpdHMgaGF2ZSBzdWNjZXNzZnVsbHkgYmVlbiBhbmFseXplZCwgYnV0IGFyZSBwZW5kaW5nIHJlc29sdXRpb24uXG4gICAqL1xuICBBTkFMWVpFRCA9IDB4MDIsXG5cbiAgLyoqXG4gICAqIFJlc29sdmVkIHRyYWl0cyBoYXZlIHN1Y2Nlc3NmdWxseSBiZWVuIGFuYWx5emVkIGFuZCByZXNvbHZlZCBhbmQgYXJlIHJlYWR5IGZvciBjb21waWxhdGlvbi5cbiAgICovXG4gIFJFU09MVkVEID0gMHgwNCxcblxuICAvKipcbiAgICogRXJyb3JlZCB0cmFpdHMgaGF2ZSBmYWlsZWQgZWl0aGVyIGFuYWx5c2lzIG9yIHJlc29sdXRpb24gYW5kIGFzIGEgcmVzdWx0IGNvbnRhaW4gZGlhZ25vc3RpY3NcbiAgICogZGVzY3JpYmluZyB0aGUgZmFpbHVyZShzKS5cbiAgICovXG4gIEVSUk9SRUQgPSAweDA4LFxuXG4gIC8qKlxuICAgKiBTa2lwcGVkIHRyYWl0cyBhcmUgbm8gbG9uZ2VyIGNvbnNpZGVyZWQgZm9yIGNvbXBpbGF0aW9uLlxuICAgKi9cbiAgU0tJUFBFRCA9IDB4MTAsXG59XG5cbi8qKlxuICogQW4gSXZ5IGFzcGVjdCBhZGRlZCB0byBhIGNsYXNzIChmb3IgZXhhbXBsZSwgdGhlIGNvbXBpbGF0aW9uIG9mIGEgY29tcG9uZW50IGRlZmluaXRpb24pLlxuICpcbiAqIFRyYWl0cyBhcmUgY3JlYXRlZCB3aGVuIGEgYERlY29yYXRvckhhbmRsZXJgIG1hdGNoZXMgYSBjbGFzcy4gRWFjaCB0cmFpdCBiZWdpbnMgaW4gYSBwZW5kaW5nXG4gKiBzdGF0ZSBhbmQgdW5kZXJnb2VzIHRyYW5zaXRpb25zIGFzIGNvbXBpbGF0aW9uIHByb2NlZWRzIHRocm91Z2ggdGhlIHZhcmlvdXMgc3RlcHMuXG4gKlxuICogSW4gcHJhY3RpY2UsIHRyYWl0cyBhcmUgaW5zdGFuY2VzIG9mIHRoZSBwcml2YXRlIGNsYXNzIGBUcmFpdEltcGxgIGRlY2xhcmVkIGJlbG93LiBUaHJvdWdoIHRoZVxuICogdmFyaW91cyBpbnRlcmZhY2VzIGluY2x1ZGVkIGluIHRoaXMgdW5pb24gdHlwZSwgdGhlIGxlZ2FsIEFQSSBvZiBhIHRyYWl0IGluIGFueSBnaXZlbiBzdGF0ZSBpc1xuICogcmVwcmVzZW50ZWQgaW4gdGhlIHR5cGUgc3lzdGVtLiBUaGlzIGluY2x1ZGVzIGFueSBwb3NzaWJsZSB0cmFuc2l0aW9ucyBmcm9tIG9uZSB0eXBlIHRvIHRoZSBuZXh0LlxuICpcbiAqIFRoaXMgbm90IG9ubHkgc2ltcGxpZmllcyB0aGUgaW1wbGVtZW50YXRpb24sIGJ1dCBlbnN1cmVzIHRyYWl0cyBhcmUgbW9ub21vcnBoaWMgb2JqZWN0cyBhc1xuICogdGhleSdyZSBhbGwganVzdCBcInZpZXdzXCIgaW4gdGhlIHR5cGUgc3lzdGVtIG9mIHRoZSBzYW1lIG9iamVjdCAod2hpY2ggbmV2ZXIgY2hhbmdlcyBzaGFwZSkuXG4gKi9cbmV4cG9ydCB0eXBlIFRyYWl0PEQsIEEsIFI+ID0gUGVuZGluZ1RyYWl0PEQsIEEsIFI+fCBTa2lwcGVkVHJhaXQ8RCwgQSwgUj58IEFuYWx5emVkVHJhaXQ8RCwgQSwgUj58XG4gICAgUmVzb2x2ZWRUcmFpdDxELCBBLCBSPnwgRXJyb3JlZFRyYWl0PEQsIEEsIFI+O1xuXG4vKipcbiAqIFRoZSB2YWx1ZSBzaWRlIG9mIGBUcmFpdGAgZXhwb3NlcyBhIGhlbHBlciB0byBjcmVhdGUgYSBgVHJhaXRgIGluIGEgcGVuZGluZyBzdGF0ZSAoYnkgZGVsZWdhdGluZ1xuICogdG8gYFRyYWl0SW1wbGApLlxuICovXG5leHBvcnQgY29uc3QgVHJhaXQgPSB7XG4gIHBlbmRpbmc6IDxELCBBLCBSPihoYW5kbGVyOiBEZWNvcmF0b3JIYW5kbGVyPEQsIEEsIFI+LCBkZXRlY3RlZDogRGV0ZWN0UmVzdWx0PEQ+KTpcbiAgICAgICAgICAgICAgIFBlbmRpbmdUcmFpdDxELCBBLCBSPiA9PiBUcmFpdEltcGwucGVuZGluZyhoYW5kbGVyLCBkZXRlY3RlZCksXG59O1xuXG4vKipcbiAqIFRoZSBwYXJ0IG9mIHRoZSBgVHJhaXRgIGludGVyZmFjZSB0aGF0J3MgY29tbW9uIHRvIGFsbCB0cmFpdCBzdGF0ZXMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHJhaXRCYXNlPEQsIEEsIFI+IHtcbiAgLyoqXG4gICAqIEN1cnJlbnQgc3RhdGUgb2YgdGhlIHRyYWl0LlxuICAgKlxuICAgKiBUaGlzIHdpbGwgYmUgbmFycm93ZWQgaW4gdGhlIGludGVyZmFjZXMgZm9yIGVhY2ggc3BlY2lmaWMgc3RhdGUuXG4gICAqL1xuICBzdGF0ZTogVHJhaXRTdGF0ZTtcblxuICAvKipcbiAgICogVGhlIGBEZWNvcmF0b3JIYW5kbGVyYCB3aGljaCBtYXRjaGVkIG9uIHRoZSBjbGFzcyB0byBjcmVhdGUgdGhpcyB0cmFpdC5cbiAgICovXG4gIGhhbmRsZXI6IERlY29yYXRvckhhbmRsZXI8RCwgQSwgUj47XG5cbiAgLyoqXG4gICAqIFRoZSBkZXRlY3Rpb24gcmVzdWx0IChvZiBgaGFuZGxlci5kZXRlY3RgKSB3aGljaCBpbmRpY2F0ZWQgdGhhdCB0aGlzIHRyYWl0IGFwcGxpZWQgdG8gdGhlXG4gICAqIGNsYXNzLlxuICAgKlxuICAgKiBUaGlzIGlzIG1haW5seSB1c2VkIHRvIGNhY2hlIHRoZSBkZXRlY3Rpb24gYmV0d2VlbiBwcmUtYW5hbHlzaXMgYW5kIGFuYWx5c2lzLlxuICAgKi9cbiAgZGV0ZWN0ZWQ6IERldGVjdFJlc3VsdDxEPjtcbn1cblxuLyoqXG4gKiBBIHRyYWl0IGluIHRoZSBwZW5kaW5nIHN0YXRlLlxuICpcbiAqIFBlbmRpbmcgdHJhaXRzIGhhdmUgeWV0IHRvIGJlIGFuYWx5emVkIGluIGFueSB3YXkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGVuZGluZ1RyYWl0PEQsIEEsIFI+IGV4dGVuZHMgVHJhaXRCYXNlPEQsIEEsIFI+IHtcbiAgc3RhdGU6IFRyYWl0U3RhdGUuUEVORElORztcblxuICAvKipcbiAgICogVGhpcyBwZW5kaW5nIHRyYWl0IGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBhbmFseXplZCwgYW5kIHNob3VsZCB0cmFuc2l0aW9uIHRvIHRoZSBcImFuYWx5emVkXCJcbiAgICogc3RhdGUuXG4gICAqL1xuICB0b0FuYWx5emVkKGFuYWx5c2lzOiBBKTogQW5hbHl6ZWRUcmFpdDxELCBBLCBSPjtcblxuICAvKipcbiAgICogVGhpcyB0cmFpdCBmYWlsZWQgYW5hbHlzaXMsIGFuZCBzaG91bGQgdHJhbnNpdGlvbiB0byB0aGUgXCJlcnJvcmVkXCIgc3RhdGUgd2l0aCB0aGUgcmVzdWx0aW5nXG4gICAqIGRpYWdub3N0aWNzLlxuICAgKi9cbiAgdG9FcnJvcmVkKGVycm9yczogdHMuRGlhZ25vc3RpY1tdKTogRXJyb3JlZFRyYWl0PEQsIEEsIFI+O1xuXG4gIC8qKlxuICAgKiBEdXJpbmcgYW5hbHlzaXMgaXQgd2FzIGRldGVybWluZWQgdGhhdCB0aGlzIHRyYWl0IGlzIG5vdCBlbGlnaWJsZSBmb3IgY29tcGlsYXRpb24gYWZ0ZXIgYWxsLFxuICAgKiBhbmQgc2hvdWxkIGJlIHRyYW5zaXRpb25lZCB0byB0aGUgXCJza2lwcGVkXCIgc3RhdGUuXG4gICAqL1xuICB0b1NraXBwZWQoKTogU2tpcHBlZFRyYWl0PEQsIEEsIFI+O1xufVxuXG4vKipcbiAqIEEgdHJhaXQgaW4gdGhlIFwiZXJyb3JlZFwiIHN0YXRlLlxuICpcbiAqIEVycm9yZWQgdHJhaXRzIGNvbnRhaW4gYHRzLkRpYWdub3N0aWNgcyBpbmRpY2F0aW5nIGFueSBwcm9ibGVtKHMpIHdpdGggdGhlIGNsYXNzLlxuICpcbiAqIFRoaXMgaXMgYSB0ZXJtaW5hbCBzdGF0ZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFcnJvcmVkVHJhaXQ8RCwgQSwgUj4gZXh0ZW5kcyBUcmFpdEJhc2U8RCwgQSwgUj4ge1xuICBzdGF0ZTogVHJhaXRTdGF0ZS5FUlJPUkVEO1xuXG4gIC8qKlxuICAgKiBEaWFnbm9zdGljcyB3aGljaCB3ZXJlIHByb2R1Y2VkIHdoaWxlIGF0dGVtcHRpbmcgdG8gYW5hbHl6ZSB0aGUgdHJhaXQuXG4gICAqL1xuICBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdO1xufVxuXG4vKipcbiAqIEEgdHJhaXQgaW4gdGhlIFwic2tpcHBlZFwiIHN0YXRlLlxuICpcbiAqIFNraXBwZWQgdHJhaXRzIGFyZW4ndCBjb25zaWRlcmVkIGZvciBjb21waWxhdGlvbi5cbiAqXG4gKiBUaGlzIGlzIGEgdGVybWluYWwgc3RhdGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2tpcHBlZFRyYWl0PEQsIEEsIFI+IGV4dGVuZHMgVHJhaXRCYXNlPEQsIEEsIFI+IHsgc3RhdGU6IFRyYWl0U3RhdGUuU0tJUFBFRDsgfVxuXG4vKipcbiAqIFRoZSBwYXJ0IG9mIHRoZSBgVHJhaXRgIGludGVyZmFjZSBmb3IgYW55IHRyYWl0IHdoaWNoIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBhbmFseXplZC5cbiAqXG4gKiBNYWlubHksIHRoaXMgaXMgdXNlZCB0byBzaGFyZSB0aGUgY29tbWVudCBvbiB0aGUgYGFuYWx5c2lzYCBmaWVsZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUcmFpdFdpdGhBbmFseXNpczxBPiB7XG4gIC8qKlxuICAgKiBUaGUgcmVzdWx0cyByZXR1cm5lZCBieSBhIHN1Y2Nlc3NmdWwgYW5hbHlzaXMgb2YgdGhlIGdpdmVuIGNsYXNzL2BEZWNvcmF0b3JIYW5kbGVyYFxuICAgKiBjb21iaW5hdGlvbi5cbiAgICovXG4gIGFuYWx5c2lzOiBSZWFkb25seTxBPjtcbn1cblxuLyoqXG4gKiBBIHRyYWl0IGluIHRoZSBcImFuYWx5emVkXCIgc3RhdGUuXG4gKlxuICogQW5hbHl6ZWQgdHJhaXRzIGhhdmUgYW5hbHlzaXMgcmVzdWx0cyBhdmFpbGFibGUsIGFuZCBhcmUgZWxpZ2libGUgZm9yIHJlc29sdXRpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5hbHl6ZWRUcmFpdDxELCBBLCBSPiBleHRlbmRzIFRyYWl0QmFzZTxELCBBLCBSPiwgVHJhaXRXaXRoQW5hbHlzaXM8QT4ge1xuICBzdGF0ZTogVHJhaXRTdGF0ZS5BTkFMWVpFRDtcblxuICAvKipcbiAgICogVGhpcyBhbmFseXplZCB0cmFpdCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgcmVzb2x2ZWQsIGFuZCBzaG91bGQgYmUgdHJhbnNpdGlvbmVkIHRvIHRoZVxuICAgKiBcInJlc29sdmVkXCIgc3RhdGUuXG4gICAqL1xuICB0b1Jlc29sdmVkKHJlc29sdXRpb246IFIpOiBSZXNvbHZlZFRyYWl0PEQsIEEsIFI+O1xuXG4gIC8qKlxuICAgKiBUaGlzIHRyYWl0IGZhaWxlZCByZXNvbHV0aW9uLCBhbmQgc2hvdWxkIHRyYW5zaXRpb24gdG8gdGhlIFwiZXJyb3JlZFwiIHN0YXRlIHdpdGggdGhlIHJlc3VsdGluZ1xuICAgKiBkaWFnbm9zdGljcy5cbiAgICovXG4gIHRvRXJyb3JlZChlcnJvcnM6IHRzLkRpYWdub3N0aWNbXSk6IEVycm9yZWRUcmFpdDxELCBBLCBSPjtcbn1cblxuLyoqXG4gKiBBIHRyYWl0IGluIHRoZSBcInJlc29sdmVkXCIgc3RhdGUuXG4gKlxuICogUmVzb2x2ZWQgdHJhaXRzIGhhdmUgYmVlbiBzdWNjZXNzZnVsbHkgYW5hbHl6ZWQgYW5kIHJlc29sdmVkLCBjb250YWluIG5vIGVycm9ycywgYW5kIGFyZSByZWFkeVxuICogZm9yIHRoZSBjb21waWxhdGlvbiBwaGFzZS5cbiAqXG4gKiBUaGlzIGlzIGEgdGVybWluYWwgc3RhdGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb2x2ZWRUcmFpdDxELCBBLCBSPiBleHRlbmRzIFRyYWl0QmFzZTxELCBBLCBSPiwgVHJhaXRXaXRoQW5hbHlzaXM8QT4ge1xuICBzdGF0ZTogVHJhaXRTdGF0ZS5SRVNPTFZFRDtcblxuICAvKipcbiAgICogVGhlIHJlc3VsdHMgcmV0dXJuZWQgYnkgYSBzdWNjZXNzZnVsIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIGNsYXNzL2BEZWNvcmF0b3JIYW5kbGVyYFxuICAgKiBjb21iaW5hdGlvbi5cbiAgICovXG4gIHJlc29sdXRpb246IFJlYWRvbmx5PFI+O1xufVxuXG4vKipcbiAqIEFuIGltcGxlbWVudGF0aW9uIG9mIHRoZSBgVHJhaXRgIHR5cGUgd2hpY2ggdHJhbnNpdGlvbnMgc2FmZWx5IGJldHdlZW4gdGhlIHZhcmlvdXNcbiAqIGBUcmFpdFN0YXRlYHMuXG4gKi9cbmNsYXNzIFRyYWl0SW1wbDxELCBBLCBSPiB7XG4gIHN0YXRlOiBUcmFpdFN0YXRlID0gVHJhaXRTdGF0ZS5QRU5ESU5HO1xuICBoYW5kbGVyOiBEZWNvcmF0b3JIYW5kbGVyPEQsIEEsIFI+O1xuICBkZXRlY3RlZDogRGV0ZWN0UmVzdWx0PEQ+O1xuICBhbmFseXNpczogUmVhZG9ubHk8QT58bnVsbCA9IG51bGw7XG4gIHJlc29sdXRpb246IFJlYWRvbmx5PFI+fG51bGwgPSBudWxsO1xuICBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKGhhbmRsZXI6IERlY29yYXRvckhhbmRsZXI8RCwgQSwgUj4sIGRldGVjdGVkOiBEZXRlY3RSZXN1bHQ8RD4pIHtcbiAgICB0aGlzLmhhbmRsZXIgPSBoYW5kbGVyO1xuICAgIHRoaXMuZGV0ZWN0ZWQgPSBkZXRlY3RlZDtcbiAgfVxuXG4gIHRvQW5hbHl6ZWQoYW5hbHlzaXM6IEEpOiBBbmFseXplZFRyYWl0PEQsIEEsIFI+IHtcbiAgICAvLyBPbmx5IHBlbmRpbmcgdHJhaXRzIGNhbiBiZSBhbmFseXplZC5cbiAgICB0aGlzLmFzc2VydFRyYW5zaXRpb25MZWdhbChUcmFpdFN0YXRlLlBFTkRJTkcsIFRyYWl0U3RhdGUuQU5BTFlaRUQpO1xuICAgIHRoaXMuYW5hbHlzaXMgPSBhbmFseXNpcztcbiAgICB0aGlzLnN0YXRlID0gVHJhaXRTdGF0ZS5BTkFMWVpFRDtcbiAgICByZXR1cm4gdGhpcyBhcyBBbmFseXplZFRyYWl0PEQsIEEsIFI+O1xuICB9XG5cbiAgdG9FcnJvcmVkKGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW10pOiBFcnJvcmVkVHJhaXQ8RCwgQSwgUj4ge1xuICAgIC8vIFBlbmRpbmcgdHJhaXRzIChkdXJpbmcgYW5hbHlzaXMpIG9yIGFuYWx5emVkIHRyYWl0cyAoZHVyaW5nIHJlc29sdXRpb24pIGNhbiBwcm9kdWNlXG4gICAgLy8gZGlhZ25vc3RpY3MgYW5kIGVudGVyIGFuIGVycm9yZWQgc3RhdGUuXG4gICAgdGhpcy5hc3NlcnRUcmFuc2l0aW9uTGVnYWwoVHJhaXRTdGF0ZS5QRU5ESU5HIHwgVHJhaXRTdGF0ZS5BTkFMWVpFRCwgVHJhaXRTdGF0ZS5SRVNPTFZFRCk7XG4gICAgdGhpcy5kaWFnbm9zdGljcyA9IGRpYWdub3N0aWNzO1xuICAgIHRoaXMuYW5hbHlzaXMgPSBudWxsO1xuICAgIHRoaXMuc3RhdGUgPSBUcmFpdFN0YXRlLkVSUk9SRUQ7XG4gICAgcmV0dXJuIHRoaXMgYXMgRXJyb3JlZFRyYWl0PEQsIEEsIFI+O1xuICB9XG5cbiAgdG9SZXNvbHZlZChyZXNvbHV0aW9uOiBSKTogUmVzb2x2ZWRUcmFpdDxELCBBLCBSPiB7XG4gICAgLy8gT25seSBhbmFseXplZCB0cmFpdHMgY2FuIGJlIHJlc29sdmVkLlxuICAgIHRoaXMuYXNzZXJ0VHJhbnNpdGlvbkxlZ2FsKFRyYWl0U3RhdGUuQU5BTFlaRUQsIFRyYWl0U3RhdGUuUkVTT0xWRUQpO1xuICAgIHRoaXMucmVzb2x1dGlvbiA9IHJlc29sdXRpb247XG4gICAgdGhpcy5zdGF0ZSA9IFRyYWl0U3RhdGUuUkVTT0xWRUQ7XG4gICAgcmV0dXJuIHRoaXMgYXMgUmVzb2x2ZWRUcmFpdDxELCBBLCBSPjtcbiAgfVxuXG4gIHRvU2tpcHBlZCgpOiBTa2lwcGVkVHJhaXQ8RCwgQSwgUj4ge1xuICAgIC8vIE9ubHkgcGVuZGluZyB0cmFpdHMgY2FuIGJlIHNraXBwZWQuXG4gICAgdGhpcy5hc3NlcnRUcmFuc2l0aW9uTGVnYWwoVHJhaXRTdGF0ZS5QRU5ESU5HLCBUcmFpdFN0YXRlLlNLSVBQRUQpO1xuICAgIHRoaXMuc3RhdGUgPSBUcmFpdFN0YXRlLlNLSVBQRUQ7XG4gICAgcmV0dXJuIHRoaXMgYXMgU2tpcHBlZFRyYWl0PEQsIEEsIFI+O1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIHRyYWl0IGlzIGN1cnJlbnRseSBpbiBvbmUgb2YgdGhlIGBhbGxvd2VkU3RhdGVgcy5cbiAgICpcbiAgICogSWYgY29ycmVjdGx5IHVzZWQsIHRoZSBgVHJhaXRgIHR5cGUgYW5kIHRyYW5zaXRpb24gbWV0aG9kcyBwcmV2ZW50IGlsbGVnYWwgdHJhbnNpdGlvbnMgZnJvbVxuICAgKiBvY2N1cnJpbmcuIEhvd2V2ZXIsIGlmIGEgcmVmZXJlbmNlIHRvIHRoZSBgVHJhaXRJbXBsYCBpbnN0YW5jZSB0eXBlZCB3aXRoIHRoZSBwcmV2aW91c1xuICAgKiBpbnRlcmZhY2UgaXMgcmV0YWluZWQgYWZ0ZXIgY2FsbGluZyBvbmUgb2YgaXRzIHRyYW5zaXRpb24gbWV0aG9kcywgaXQgd2lsbCBhbGxvdyBmb3IgaWxsZWdhbFxuICAgKiB0cmFuc2l0aW9ucyB0byB0YWtlIHBsYWNlLiBIZW5jZSwgdGhpcyBhc3NlcnRpb24gcHJvdmlkZXMgYSBsaXR0bGUgZXh0cmEgcnVudGltZSBwcm90ZWN0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3NlcnRUcmFuc2l0aW9uTGVnYWwoYWxsb3dlZFN0YXRlOiBUcmFpdFN0YXRlLCB0cmFuc2l0aW9uVG86IFRyYWl0U3RhdGUpOiB2b2lkIHtcbiAgICBpZiAoISh0aGlzLnN0YXRlICYgYWxsb3dlZFN0YXRlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBBc3NlcnRpb24gZmFpbHVyZTogY2Fubm90IHRyYW5zaXRpb24gZnJvbSAke1RyYWl0U3RhdGVbdGhpcy5zdGF0ZV19IHRvICR7VHJhaXRTdGF0ZVt0cmFuc2l0aW9uVG9dfS5gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGBUcmFpdEltcGxgIGluIHRoZSBwZW5kaW5nIHN0YXRlLlxuICAgKi9cbiAgc3RhdGljIHBlbmRpbmc8RCwgQSwgUj4oaGFuZGxlcjogRGVjb3JhdG9ySGFuZGxlcjxELCBBLCBSPiwgZGV0ZWN0ZWQ6IERldGVjdFJlc3VsdDxEPik6XG4gICAgICBQZW5kaW5nVHJhaXQ8RCwgQSwgUj4ge1xuICAgIHJldHVybiBuZXcgVHJhaXRJbXBsKGhhbmRsZXIsIGRldGVjdGVkKSBhcyBQZW5kaW5nVHJhaXQ8RCwgQSwgUj47XG4gIH1cbn1cbiJdfQ==