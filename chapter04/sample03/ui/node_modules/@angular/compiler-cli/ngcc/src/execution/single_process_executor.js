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
        define("@angular/compiler-cli/ngcc/src/execution/single_process_executor", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/execution/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/execution/utils");
    /**
     * An `Executor` that processes all tasks serially and completes synchronously.
     */
    var SingleProcessExecutor = /** @class */ (function () {
        function SingleProcessExecutor(logger, pkgJsonUpdater, lockFile) {
            this.logger = logger;
            this.pkgJsonUpdater = pkgJsonUpdater;
            this.lockFile = lockFile;
        }
        SingleProcessExecutor.prototype.execute = function (analyzeEntryPoints, createCompileFn) {
            var _this = this;
            this.lockFile.lock(function () {
                _this.logger.debug("Running ngcc on " + _this.constructor.name + ".");
                var taskQueue = analyzeEntryPoints();
                var compile = createCompileFn(function (task, outcome) { return utils_1.onTaskCompleted(_this.pkgJsonUpdater, task, outcome); });
                // Process all tasks.
                _this.logger.debug('Processing tasks...');
                var startTime = Date.now();
                while (!taskQueue.allTasksCompleted) {
                    var task = taskQueue.getNextTask();
                    compile(task);
                    taskQueue.markTaskCompleted(task);
                }
                var duration = Math.round((Date.now() - startTime) / 1000);
                _this.logger.debug("Processed tasks in " + duration + "s.");
            });
        };
        return SingleProcessExecutor;
    }());
    exports.SingleProcessExecutor = SingleProcessExecutor;
    /**
     * An `Executor` that processes all tasks serially, but still completes asynchronously.
     */
    var AsyncSingleProcessExecutor = /** @class */ (function (_super) {
        tslib_1.__extends(AsyncSingleProcessExecutor, _super);
        function AsyncSingleProcessExecutor() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AsyncSingleProcessExecutor.prototype.execute = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    return [2 /*return*/, _super.prototype.execute.apply(this, tslib_1.__spread(args))];
                });
            });
        };
        return AsyncSingleProcessExecutor;
    }(SingleProcessExecutor));
    exports.AsyncSingleProcessExecutor = AsyncSingleProcessExecutor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlX3Byb2Nlc3NfZXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvZXhlY3V0aW9uL3NpbmdsZV9wcm9jZXNzX2V4ZWN1dG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQU9ILHdFQUF3QztJQUd4Qzs7T0FFRztJQUNIO1FBQ0UsK0JBQ1ksTUFBYyxFQUFVLGNBQWtDLEVBQzFELFFBQWtCO1lBRGxCLFdBQU0sR0FBTixNQUFNLENBQVE7WUFBVSxtQkFBYyxHQUFkLGNBQWMsQ0FBb0I7WUFDMUQsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFHLENBQUM7UUFFbEMsdUNBQU8sR0FBUCxVQUFRLGtCQUF3QyxFQUFFLGVBQWdDO1lBQWxGLGlCQXFCQztZQXBCQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDakIsS0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMscUJBQW1CLEtBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxNQUFHLENBQUMsQ0FBQztnQkFFL0QsSUFBTSxTQUFTLEdBQUcsa0JBQWtCLEVBQUUsQ0FBQztnQkFDdkMsSUFBTSxPQUFPLEdBQ1QsZUFBZSxDQUFDLFVBQUMsSUFBSSxFQUFFLE9BQU8sSUFBSyxPQUFBLHVCQUFlLENBQUMsS0FBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQW5ELENBQW1ELENBQUMsQ0FBQztnQkFFNUYscUJBQXFCO2dCQUNyQixLQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUN6QyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBRTdCLE9BQU8sQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUU7b0JBQ25DLElBQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUksQ0FBQztvQkFDdkMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNkLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDbkM7Z0JBRUQsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFDN0QsS0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXNCLFFBQVEsT0FBSSxDQUFDLENBQUM7WUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0gsNEJBQUM7SUFBRCxDQUFDLEFBM0JELElBMkJDO0lBM0JZLHNEQUFxQjtJQTZCbEM7O09BRUc7SUFDSDtRQUFnRCxzREFBcUI7UUFBckU7O1FBSUEsQ0FBQztRQUhPLDRDQUFPLEdBQWI7WUFBYyxjQUF3QztpQkFBeEMsVUFBd0MsRUFBeEMscUJBQXdDLEVBQXhDLElBQXdDO2dCQUF4Qyx5QkFBd0M7Ozs7b0JBQ3BELHNCQUFPLGlCQUFNLE9BQU8sOEJBQUksSUFBSSxJQUFFOzs7U0FDL0I7UUFDSCxpQ0FBQztJQUFELENBQUMsQUFKRCxDQUFnRCxxQkFBcUIsR0FJcEU7SUFKWSxnRUFBMEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TG9nZ2VyfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlcic7XG5pbXBvcnQge1BhY2thZ2VKc29uVXBkYXRlcn0gZnJvbSAnLi4vd3JpdGluZy9wYWNrYWdlX2pzb25fdXBkYXRlcic7XG5cbmltcG9ydCB7QW5hbHl6ZUVudHJ5UG9pbnRzRm4sIENyZWF0ZUNvbXBpbGVGbiwgRXhlY3V0b3J9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7TG9ja0ZpbGV9IGZyb20gJy4vbG9ja19maWxlJztcbmltcG9ydCB7b25UYXNrQ29tcGxldGVkfSBmcm9tICcuL3V0aWxzJztcblxuXG4vKipcbiAqIEFuIGBFeGVjdXRvcmAgdGhhdCBwcm9jZXNzZXMgYWxsIHRhc2tzIHNlcmlhbGx5IGFuZCBjb21wbGV0ZXMgc3luY2hyb25vdXNseS5cbiAqL1xuZXhwb3J0IGNsYXNzIFNpbmdsZVByb2Nlc3NFeGVjdXRvciBpbXBsZW1lbnRzIEV4ZWN1dG9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyLCBwcml2YXRlIHBrZ0pzb25VcGRhdGVyOiBQYWNrYWdlSnNvblVwZGF0ZXIsXG4gICAgICBwcml2YXRlIGxvY2tGaWxlOiBMb2NrRmlsZSkge31cblxuICBleGVjdXRlKGFuYWx5emVFbnRyeVBvaW50czogQW5hbHl6ZUVudHJ5UG9pbnRzRm4sIGNyZWF0ZUNvbXBpbGVGbjogQ3JlYXRlQ29tcGlsZUZuKTogdm9pZCB7XG4gICAgdGhpcy5sb2NrRmlsZS5sb2NrKCgpID0+IHtcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKGBSdW5uaW5nIG5nY2Mgb24gJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9LmApO1xuXG4gICAgICBjb25zdCB0YXNrUXVldWUgPSBhbmFseXplRW50cnlQb2ludHMoKTtcbiAgICAgIGNvbnN0IGNvbXBpbGUgPVxuICAgICAgICAgIGNyZWF0ZUNvbXBpbGVGbigodGFzaywgb3V0Y29tZSkgPT4gb25UYXNrQ29tcGxldGVkKHRoaXMucGtnSnNvblVwZGF0ZXIsIHRhc2ssIG91dGNvbWUpKTtcblxuICAgICAgLy8gUHJvY2VzcyBhbGwgdGFza3MuXG4gICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnUHJvY2Vzc2luZyB0YXNrcy4uLicpO1xuICAgICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblxuICAgICAgd2hpbGUgKCF0YXNrUXVldWUuYWxsVGFza3NDb21wbGV0ZWQpIHtcbiAgICAgICAgY29uc3QgdGFzayA9IHRhc2tRdWV1ZS5nZXROZXh0VGFzaygpICE7XG4gICAgICAgIGNvbXBpbGUodGFzayk7XG4gICAgICAgIHRhc2tRdWV1ZS5tYXJrVGFza0NvbXBsZXRlZCh0YXNrKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZHVyYXRpb24gPSBNYXRoLnJvdW5kKChEYXRlLm5vdygpIC0gc3RhcnRUaW1lKSAvIDEwMDApO1xuICAgICAgdGhpcy5sb2dnZXIuZGVidWcoYFByb2Nlc3NlZCB0YXNrcyBpbiAke2R1cmF0aW9ufXMuYCk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBgRXhlY3V0b3JgIHRoYXQgcHJvY2Vzc2VzIGFsbCB0YXNrcyBzZXJpYWxseSwgYnV0IHN0aWxsIGNvbXBsZXRlcyBhc3luY2hyb25vdXNseS5cbiAqL1xuZXhwb3J0IGNsYXNzIEFzeW5jU2luZ2xlUHJvY2Vzc0V4ZWN1dG9yIGV4dGVuZHMgU2luZ2xlUHJvY2Vzc0V4ZWN1dG9yIHtcbiAgYXN5bmMgZXhlY3V0ZSguLi5hcmdzOiBQYXJhbWV0ZXJzPEV4ZWN1dG9yWydleGVjdXRlJ10+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHN1cGVyLmV4ZWN1dGUoLi4uYXJncyk7XG4gIH1cbn1cbiJdfQ==