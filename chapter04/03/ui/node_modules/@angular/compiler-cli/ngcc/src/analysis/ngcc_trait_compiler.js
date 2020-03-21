(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/analysis/ngcc_trait_compiler", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/perf", "@angular/compiler-cli/src/ngtsc/transform", "@angular/compiler-cli/ngcc/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    var transform_1 = require("@angular/compiler-cli/src/ngtsc/transform");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/utils");
    /**
     * Specializes the `TraitCompiler` for ngcc purposes. Mainly, this includes an alternative way of
     * scanning for classes to compile using the reflection host's `findClassSymbols`, together with
     * support to inject synthetic decorators into the compilation for ad-hoc migrations that ngcc
     * performs.
     */
    var NgccTraitCompiler = /** @class */ (function (_super) {
        tslib_1.__extends(NgccTraitCompiler, _super);
        function NgccTraitCompiler(handlers, ngccReflector) {
            var _this = _super.call(this, handlers, ngccReflector, perf_1.NOOP_PERF_RECORDER, new NoIncrementalBuild(), 
            /* compileNonExportedClasses */ true, new transform_1.DtsTransformRegistry()) || this;
            _this.ngccReflector = ngccReflector;
            return _this;
        }
        Object.defineProperty(NgccTraitCompiler.prototype, "analyzedFiles", {
            get: function () { return Array.from(this.fileToClasses.keys()); },
            enumerable: true,
            configurable: true
        });
        /**
         * Analyzes the source file in search for classes to process. For any class that is found in the
         * file, a `ClassRecord` is created and the source file is included in the `analyzedFiles` array.
         */
        NgccTraitCompiler.prototype.analyzeFile = function (sf) {
            var e_1, _a;
            var ngccClassSymbols = this.ngccReflector.findClassSymbols(sf);
            try {
                for (var ngccClassSymbols_1 = tslib_1.__values(ngccClassSymbols), ngccClassSymbols_1_1 = ngccClassSymbols_1.next(); !ngccClassSymbols_1_1.done; ngccClassSymbols_1_1 = ngccClassSymbols_1.next()) {
                    var classSymbol = ngccClassSymbols_1_1.value;
                    this.analyzeClass(classSymbol.declaration.valueDeclaration, null);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (ngccClassSymbols_1_1 && !ngccClassSymbols_1_1.done && (_a = ngccClassSymbols_1.return)) _a.call(ngccClassSymbols_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return undefined;
        };
        /**
         * Associate a new synthesized decorator, which did not appear in the original source, with a
         * given class.
         * @param clazz the class to receive the new decorator.
         * @param decorator the decorator to inject.
         * @param flags optional bitwise flag to influence the compilation of the decorator.
         */
        NgccTraitCompiler.prototype.injectSyntheticDecorator = function (clazz, decorator, flags) {
            var e_2, _a;
            var migratedTraits = this.detectTraits(clazz, [decorator]);
            if (migratedTraits === null) {
                return [];
            }
            try {
                for (var migratedTraits_1 = tslib_1.__values(migratedTraits), migratedTraits_1_1 = migratedTraits_1.next(); !migratedTraits_1_1.done; migratedTraits_1_1 = migratedTraits_1.next()) {
                    var trait = migratedTraits_1_1.value;
                    this.analyzeTrait(clazz, trait, flags);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (migratedTraits_1_1 && !migratedTraits_1_1.done && (_a = migratedTraits_1.return)) _a.call(migratedTraits_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return migratedTraits;
        };
        /**
         * Returns all decorators that have been recognized for the provided class, including any
         * synthetically injected decorators.
         * @param clazz the declaration for which the decorators are returned.
         */
        NgccTraitCompiler.prototype.getAllDecorators = function (clazz) {
            var record = this.recordFor(clazz);
            if (record === null) {
                return null;
            }
            return record.traits.map(function (trait) { return trait.detected.decorator; }).filter(utils_1.isDefined);
        };
        return NgccTraitCompiler;
    }(transform_1.TraitCompiler));
    exports.NgccTraitCompiler = NgccTraitCompiler;
    var NoIncrementalBuild = /** @class */ (function () {
        function NoIncrementalBuild() {
        }
        NoIncrementalBuild.prototype.priorWorkFor = function (sf) { return null; };
        return NoIncrementalBuild;
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdjY190cmFpdF9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9hbmFseXNpcy9uZ2NjX3RyYWl0X2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVVBLDZEQUEyRDtJQUUzRCx1RUFBd0g7SUFFeEgsOERBQW1DO0lBRW5DOzs7OztPQUtHO0lBQ0g7UUFBdUMsNkNBQWE7UUFDbEQsMkJBQ0ksUUFBdUQsRUFDL0MsYUFBaUM7WUFGN0MsWUFHRSxrQkFDSSxRQUFRLEVBQUUsYUFBYSxFQUFFLHlCQUFrQixFQUFFLElBQUksa0JBQWtCLEVBQUU7WUFDckUsK0JBQStCLENBQUMsSUFBSSxFQUFFLElBQUksZ0NBQW9CLEVBQUUsQ0FBQyxTQUN0RTtZQUpXLG1CQUFhLEdBQWIsYUFBYSxDQUFvQjs7UUFJN0MsQ0FBQztRQUVELHNCQUFJLDRDQUFhO2lCQUFqQixjQUF1QyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O1dBQUE7UUFFdEY7OztXQUdHO1FBQ0gsdUNBQVcsR0FBWCxVQUFZLEVBQWlCOztZQUMzQixJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7O2dCQUNqRSxLQUEwQixJQUFBLHFCQUFBLGlCQUFBLGdCQUFnQixDQUFBLGtEQUFBLGdGQUFFO29CQUF2QyxJQUFNLFdBQVcsNkJBQUE7b0JBQ3BCLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDbkU7Ozs7Ozs7OztZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUM7UUFFRDs7Ozs7O1dBTUc7UUFDSCxvREFBd0IsR0FBeEIsVUFBeUIsS0FBdUIsRUFBRSxTQUFvQixFQUFFLEtBQW9COztZQUUxRixJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDN0QsSUFBSSxjQUFjLEtBQUssSUFBSSxFQUFFO2dCQUMzQixPQUFPLEVBQUUsQ0FBQzthQUNYOztnQkFFRCxLQUFvQixJQUFBLG1CQUFBLGlCQUFBLGNBQWMsQ0FBQSw4Q0FBQSwwRUFBRTtvQkFBL0IsSUFBTSxLQUFLLDJCQUFBO29CQUNkLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDeEM7Ozs7Ozs7OztZQUVELE9BQU8sY0FBYyxDQUFDO1FBQ3hCLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsNENBQWdCLEdBQWhCLFVBQWlCLEtBQXVCO1lBQ3RDLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckMsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO2dCQUNuQixPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUF4QixDQUF3QixDQUFDLENBQUMsTUFBTSxDQUFDLGlCQUFTLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBQ0gsd0JBQUM7SUFBRCxDQUFDLEFBMURELENBQXVDLHlCQUFhLEdBMERuRDtJQTFEWSw4Q0FBaUI7SUE0RDlCO1FBQUE7UUFFQSxDQUFDO1FBREMseUNBQVksR0FBWixVQUFhLEVBQWlCLElBQWdCLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5RCx5QkFBQztJQUFELENBQUMsQUFGRCxJQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7SW5jcmVtZW50YWxCdWlsZH0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2luY3JlbWVudGFsL2FwaSc7XG5pbXBvcnQge05PT1BfUEVSRl9SRUNPUkRFUn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL3BlcmYnO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9uLCBEZWNvcmF0b3J9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9yZWZsZWN0aW9uJztcbmltcG9ydCB7RGVjb3JhdG9ySGFuZGxlciwgRHRzVHJhbnNmb3JtUmVnaXN0cnksIEhhbmRsZXJGbGFncywgVHJhaXQsIFRyYWl0Q29tcGlsZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy90cmFuc2Zvcm0nO1xuaW1wb3J0IHtOZ2NjUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uL2hvc3QvbmdjY19ob3N0JztcbmltcG9ydCB7aXNEZWZpbmVkfSBmcm9tICcuLi91dGlscyc7XG5cbi8qKlxuICogU3BlY2lhbGl6ZXMgdGhlIGBUcmFpdENvbXBpbGVyYCBmb3IgbmdjYyBwdXJwb3Nlcy4gTWFpbmx5LCB0aGlzIGluY2x1ZGVzIGFuIGFsdGVybmF0aXZlIHdheSBvZlxuICogc2Nhbm5pbmcgZm9yIGNsYXNzZXMgdG8gY29tcGlsZSB1c2luZyB0aGUgcmVmbGVjdGlvbiBob3N0J3MgYGZpbmRDbGFzc1N5bWJvbHNgLCB0b2dldGhlciB3aXRoXG4gKiBzdXBwb3J0IHRvIGluamVjdCBzeW50aGV0aWMgZGVjb3JhdG9ycyBpbnRvIHRoZSBjb21waWxhdGlvbiBmb3IgYWQtaG9jIG1pZ3JhdGlvbnMgdGhhdCBuZ2NjXG4gKiBwZXJmb3Jtcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE5nY2NUcmFpdENvbXBpbGVyIGV4dGVuZHMgVHJhaXRDb21waWxlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgaGFuZGxlcnM6IERlY29yYXRvckhhbmRsZXI8dW5rbm93biwgdW5rbm93biwgdW5rbm93bj5bXSxcbiAgICAgIHByaXZhdGUgbmdjY1JlZmxlY3RvcjogTmdjY1JlZmxlY3Rpb25Ib3N0KSB7XG4gICAgc3VwZXIoXG4gICAgICAgIGhhbmRsZXJzLCBuZ2NjUmVmbGVjdG9yLCBOT09QX1BFUkZfUkVDT1JERVIsIG5ldyBOb0luY3JlbWVudGFsQnVpbGQoKSxcbiAgICAgICAgLyogY29tcGlsZU5vbkV4cG9ydGVkQ2xhc3NlcyAqLyB0cnVlLCBuZXcgRHRzVHJhbnNmb3JtUmVnaXN0cnkoKSk7XG4gIH1cblxuICBnZXQgYW5hbHl6ZWRGaWxlcygpOiB0cy5Tb3VyY2VGaWxlW10geyByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmZpbGVUb0NsYXNzZXMua2V5cygpKTsgfVxuXG4gIC8qKlxuICAgKiBBbmFseXplcyB0aGUgc291cmNlIGZpbGUgaW4gc2VhcmNoIGZvciBjbGFzc2VzIHRvIHByb2Nlc3MuIEZvciBhbnkgY2xhc3MgdGhhdCBpcyBmb3VuZCBpbiB0aGVcbiAgICogZmlsZSwgYSBgQ2xhc3NSZWNvcmRgIGlzIGNyZWF0ZWQgYW5kIHRoZSBzb3VyY2UgZmlsZSBpcyBpbmNsdWRlZCBpbiB0aGUgYGFuYWx5emVkRmlsZXNgIGFycmF5LlxuICAgKi9cbiAgYW5hbHl6ZUZpbGUoc2Y6IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICBjb25zdCBuZ2NjQ2xhc3NTeW1ib2xzID0gdGhpcy5uZ2NjUmVmbGVjdG9yLmZpbmRDbGFzc1N5bWJvbHMoc2YpO1xuICAgIGZvciAoY29uc3QgY2xhc3NTeW1ib2wgb2YgbmdjY0NsYXNzU3ltYm9scykge1xuICAgICAgdGhpcy5hbmFseXplQ2xhc3MoY2xhc3NTeW1ib2wuZGVjbGFyYXRpb24udmFsdWVEZWNsYXJhdGlvbiwgbnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NvY2lhdGUgYSBuZXcgc3ludGhlc2l6ZWQgZGVjb3JhdG9yLCB3aGljaCBkaWQgbm90IGFwcGVhciBpbiB0aGUgb3JpZ2luYWwgc291cmNlLCB3aXRoIGFcbiAgICogZ2l2ZW4gY2xhc3MuXG4gICAqIEBwYXJhbSBjbGF6eiB0aGUgY2xhc3MgdG8gcmVjZWl2ZSB0aGUgbmV3IGRlY29yYXRvci5cbiAgICogQHBhcmFtIGRlY29yYXRvciB0aGUgZGVjb3JhdG9yIHRvIGluamVjdC5cbiAgICogQHBhcmFtIGZsYWdzIG9wdGlvbmFsIGJpdHdpc2UgZmxhZyB0byBpbmZsdWVuY2UgdGhlIGNvbXBpbGF0aW9uIG9mIHRoZSBkZWNvcmF0b3IuXG4gICAqL1xuICBpbmplY3RTeW50aGV0aWNEZWNvcmF0b3IoY2xheno6IENsYXNzRGVjbGFyYXRpb24sIGRlY29yYXRvcjogRGVjb3JhdG9yLCBmbGFncz86IEhhbmRsZXJGbGFncyk6XG4gICAgICBUcmFpdDx1bmtub3duLCB1bmtub3duLCB1bmtub3duPltdIHtcbiAgICBjb25zdCBtaWdyYXRlZFRyYWl0cyA9IHRoaXMuZGV0ZWN0VHJhaXRzKGNsYXp6LCBbZGVjb3JhdG9yXSk7XG4gICAgaWYgKG1pZ3JhdGVkVHJhaXRzID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCB0cmFpdCBvZiBtaWdyYXRlZFRyYWl0cykge1xuICAgICAgdGhpcy5hbmFseXplVHJhaXQoY2xhenosIHRyYWl0LCBmbGFncyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1pZ3JhdGVkVHJhaXRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWxsIGRlY29yYXRvcnMgdGhhdCBoYXZlIGJlZW4gcmVjb2duaXplZCBmb3IgdGhlIHByb3ZpZGVkIGNsYXNzLCBpbmNsdWRpbmcgYW55XG4gICAqIHN5bnRoZXRpY2FsbHkgaW5qZWN0ZWQgZGVjb3JhdG9ycy5cbiAgICogQHBhcmFtIGNsYXp6IHRoZSBkZWNsYXJhdGlvbiBmb3Igd2hpY2ggdGhlIGRlY29yYXRvcnMgYXJlIHJldHVybmVkLlxuICAgKi9cbiAgZ2V0QWxsRGVjb3JhdG9ycyhjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbik6IERlY29yYXRvcltdfG51bGwge1xuICAgIGNvbnN0IHJlY29yZCA9IHRoaXMucmVjb3JkRm9yKGNsYXp6KTtcbiAgICBpZiAocmVjb3JkID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVjb3JkLnRyYWl0cy5tYXAodHJhaXQgPT4gdHJhaXQuZGV0ZWN0ZWQuZGVjb3JhdG9yKS5maWx0ZXIoaXNEZWZpbmVkKTtcbiAgfVxufVxuXG5jbGFzcyBOb0luY3JlbWVudGFsQnVpbGQgaW1wbGVtZW50cyBJbmNyZW1lbnRhbEJ1aWxkPGFueT4ge1xuICBwcmlvcldvcmtGb3Ioc2Y6IHRzLlNvdXJjZUZpbGUpOiBhbnlbXXxudWxsIHsgcmV0dXJuIG51bGw7IH1cbn1cbiJdfQ==