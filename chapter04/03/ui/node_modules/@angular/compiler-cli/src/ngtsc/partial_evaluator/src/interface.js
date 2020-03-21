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
        define("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/interface", ["require", "exports", "@angular/compiler-cli/src/ngtsc/partial_evaluator/src/interpreter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var interpreter_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/interpreter");
    var PartialEvaluator = /** @class */ (function () {
        function PartialEvaluator(host, checker, dependencyTracker) {
            this.host = host;
            this.checker = checker;
            this.dependencyTracker = dependencyTracker;
        }
        PartialEvaluator.prototype.evaluate = function (expr, foreignFunctionResolver) {
            var interpreter = new interpreter_1.StaticInterpreter(this.host, this.checker, this.dependencyTracker);
            var sourceFile = expr.getSourceFile();
            return interpreter.visit(expr, {
                originatingFile: sourceFile,
                absoluteModuleName: null,
                resolutionContext: sourceFile.fileName,
                scope: new Map(), foreignFunctionResolver: foreignFunctionResolver,
            });
        };
        return PartialEvaluator;
    }());
    exports.PartialEvaluator = PartialEvaluator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJmYWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9wYXJ0aWFsX2V2YWx1YXRvci9zcmMvaW50ZXJmYWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBUUgsaUdBQWdEO0lBT2hEO1FBQ0UsMEJBQ1ksSUFBb0IsRUFBVSxPQUF1QixFQUNyRCxpQkFBeUM7WUFEekMsU0FBSSxHQUFKLElBQUksQ0FBZ0I7WUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFnQjtZQUNyRCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQXdCO1FBQUcsQ0FBQztRQUV6RCxtQ0FBUSxHQUFSLFVBQVMsSUFBbUIsRUFBRSx1QkFBaUQ7WUFDN0UsSUFBTSxXQUFXLEdBQUcsSUFBSSwrQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDM0YsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3hDLE9BQU8sV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7Z0JBQzdCLGVBQWUsRUFBRSxVQUFVO2dCQUMzQixrQkFBa0IsRUFBRSxJQUFJO2dCQUN4QixpQkFBaUIsRUFBRSxVQUFVLENBQUMsUUFBUTtnQkFDdEMsS0FBSyxFQUFFLElBQUksR0FBRyxFQUEwQyxFQUFFLHVCQUF1Qix5QkFBQTthQUNsRixDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0gsdUJBQUM7SUFBRCxDQUFDLEFBZkQsSUFlQztJQWZZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7UmVmZXJlbmNlfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7RGVwZW5kZW5jeVRyYWNrZXJ9IGZyb20gJy4uLy4uL2luY3JlbWVudGFsL2FwaSc7XG5pbXBvcnQge1JlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcblxuaW1wb3J0IHtTdGF0aWNJbnRlcnByZXRlcn0gZnJvbSAnLi9pbnRlcnByZXRlcic7XG5pbXBvcnQge1Jlc29sdmVkVmFsdWV9IGZyb20gJy4vcmVzdWx0JztcblxuZXhwb3J0IHR5cGUgRm9yZWlnbkZ1bmN0aW9uUmVzb2x2ZXIgPVxuICAgIChub2RlOiBSZWZlcmVuY2U8dHMuRnVuY3Rpb25EZWNsYXJhdGlvbnx0cy5NZXRob2REZWNsYXJhdGlvbnx0cy5GdW5jdGlvbkV4cHJlc3Npb24+LFxuICAgICBhcmdzOiBSZWFkb25seUFycmF5PHRzLkV4cHJlc3Npb24+KSA9PiB0cy5FeHByZXNzaW9uIHwgbnVsbDtcblxuZXhwb3J0IGNsYXNzIFBhcnRpYWxFdmFsdWF0b3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaG9zdDogUmVmbGVjdGlvbkhvc3QsIHByaXZhdGUgY2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsXG4gICAgICBwcml2YXRlIGRlcGVuZGVuY3lUcmFja2VyOiBEZXBlbmRlbmN5VHJhY2tlcnxudWxsKSB7fVxuXG4gIGV2YWx1YXRlKGV4cHI6IHRzLkV4cHJlc3Npb24sIGZvcmVpZ25GdW5jdGlvblJlc29sdmVyPzogRm9yZWlnbkZ1bmN0aW9uUmVzb2x2ZXIpOiBSZXNvbHZlZFZhbHVlIHtcbiAgICBjb25zdCBpbnRlcnByZXRlciA9IG5ldyBTdGF0aWNJbnRlcnByZXRlcih0aGlzLmhvc3QsIHRoaXMuY2hlY2tlciwgdGhpcy5kZXBlbmRlbmN5VHJhY2tlcik7XG4gICAgY29uc3Qgc291cmNlRmlsZSA9IGV4cHIuZ2V0U291cmNlRmlsZSgpO1xuICAgIHJldHVybiBpbnRlcnByZXRlci52aXNpdChleHByLCB7XG4gICAgICBvcmlnaW5hdGluZ0ZpbGU6IHNvdXJjZUZpbGUsXG4gICAgICBhYnNvbHV0ZU1vZHVsZU5hbWU6IG51bGwsXG4gICAgICByZXNvbHV0aW9uQ29udGV4dDogc291cmNlRmlsZS5maWxlTmFtZSxcbiAgICAgIHNjb3BlOiBuZXcgTWFwPHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uLCBSZXNvbHZlZFZhbHVlPigpLCBmb3JlaWduRnVuY3Rpb25SZXNvbHZlcixcbiAgICB9KTtcbiAgfVxufVxuIl19