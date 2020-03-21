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
        define("@angular/compiler-cli/ngcc/src/execution/cluster/package_json_updater", ["require", "exports", "tslib", "cluster", "@angular/compiler-cli/ngcc/src/writing/package_json_updater", "@angular/compiler-cli/ngcc/src/execution/cluster/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /// <reference types="node" />
    var cluster = require("cluster");
    var package_json_updater_1 = require("@angular/compiler-cli/ngcc/src/writing/package_json_updater");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/execution/cluster/utils");
    /**
     * A `PackageJsonUpdater` that can safely handle update operations on multiple processes.
     */
    var ClusterPackageJsonUpdater = /** @class */ (function () {
        function ClusterPackageJsonUpdater(delegate) {
            this.delegate = delegate;
        }
        ClusterPackageJsonUpdater.prototype.createUpdate = function () {
            var _this = this;
            return new package_json_updater_1.PackageJsonUpdate(function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return _this.writeChanges.apply(_this, tslib_1.__spread(args));
            });
        };
        ClusterPackageJsonUpdater.prototype.writeChanges = function (changes, packageJsonPath, preExistingParsedJson) {
            var e_1, _a;
            if (cluster.isMaster) {
                // This is the master process:
                // Actually apply the changes to the file on disk.
                return this.delegate.writeChanges(changes, packageJsonPath, preExistingParsedJson);
            }
            // This is a worker process:
            // Apply the changes in-memory (if necessary) and send a message to the master process.
            if (preExistingParsedJson) {
                try {
                    for (var changes_1 = tslib_1.__values(changes), changes_1_1 = changes_1.next(); !changes_1_1.done; changes_1_1 = changes_1.next()) {
                        var _b = tslib_1.__read(changes_1_1.value, 2), propPath = _b[0], value = _b[1];
                        if (propPath.length === 0) {
                            throw new Error("Missing property path for writing value to '" + packageJsonPath + "'.");
                        }
                        // No need to take property positioning into account for in-memory representations.
                        package_json_updater_1.applyChange(preExistingParsedJson, propPath, value, 'unimportant');
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (changes_1_1 && !changes_1_1.done && (_a = changes_1.return)) _a.call(changes_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            utils_1.sendMessageToMaster({
                type: 'update-package-json',
                packageJsonPath: packageJsonPath,
                changes: changes,
            });
        };
        return ClusterPackageJsonUpdater;
    }());
    exports.ClusterPackageJsonUpdater = ClusterPackageJsonUpdater;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZV9qc29uX3VwZGF0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvZXhlY3V0aW9uL2NsdXN0ZXIvcGFja2FnZV9qc29uX3VwZGF0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsOEJBQThCO0lBRTlCLGlDQUFtQztJQUluQyxvR0FBeUg7SUFFekgsZ0ZBQTRDO0lBRzVDOztPQUVHO0lBQ0g7UUFDRSxtQ0FBb0IsUUFBNEI7WUFBNUIsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7UUFBRyxDQUFDO1FBRXBELGdEQUFZLEdBQVo7WUFBQSxpQkFFQztZQURDLE9BQU8sSUFBSSx3Q0FBaUIsQ0FBQztnQkFBQyxjQUFPO3FCQUFQLFVBQU8sRUFBUCxxQkFBTyxFQUFQLElBQU87b0JBQVAseUJBQU87O2dCQUFLLE9BQUEsS0FBSSxDQUFDLFlBQVksT0FBakIsS0FBSSxtQkFBaUIsSUFBSTtZQUF6QixDQUEwQixDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUVELGdEQUFZLEdBQVosVUFDSSxPQUE0QixFQUFFLGVBQStCLEVBQzdELHFCQUFrQzs7WUFDcEMsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO2dCQUNwQiw4QkFBOEI7Z0JBQzlCLGtEQUFrRDtnQkFDbEQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLHFCQUFxQixDQUFDLENBQUM7YUFDcEY7WUFFRCw0QkFBNEI7WUFDNUIsdUZBQXVGO1lBQ3ZGLElBQUkscUJBQXFCLEVBQUU7O29CQUN6QixLQUFnQyxJQUFBLFlBQUEsaUJBQUEsT0FBTyxDQUFBLGdDQUFBLHFEQUFFO3dCQUE5QixJQUFBLHlDQUFpQixFQUFoQixnQkFBUSxFQUFFLGFBQUs7d0JBQ3pCLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7NEJBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsaURBQStDLGVBQWUsT0FBSSxDQUFDLENBQUM7eUJBQ3JGO3dCQUVELG1GQUFtRjt3QkFDbkYsa0NBQVcsQ0FBQyxxQkFBcUIsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO3FCQUNwRTs7Ozs7Ozs7O2FBQ0Y7WUFFRCwyQkFBbUIsQ0FBQztnQkFDbEIsSUFBSSxFQUFFLHFCQUFxQjtnQkFDM0IsZUFBZSxpQkFBQTtnQkFDZixPQUFPLFNBQUE7YUFDUixDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0gsZ0NBQUM7SUFBRCxDQUFDLEFBbkNELElBbUNDO0lBbkNZLDhEQUF5QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJub2RlXCIgLz5cblxuaW1wb3J0ICogYXMgY2x1c3RlciBmcm9tICdjbHVzdGVyJztcblxuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aH0gZnJvbSAnLi4vLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7SnNvbk9iamVjdH0gZnJvbSAnLi4vLi4vcGFja2FnZXMvZW50cnlfcG9pbnQnO1xuaW1wb3J0IHtQYWNrYWdlSnNvbkNoYW5nZSwgUGFja2FnZUpzb25VcGRhdGUsIFBhY2thZ2VKc29uVXBkYXRlciwgYXBwbHlDaGFuZ2V9IGZyb20gJy4uLy4uL3dyaXRpbmcvcGFja2FnZV9qc29uX3VwZGF0ZXInO1xuXG5pbXBvcnQge3NlbmRNZXNzYWdlVG9NYXN0ZXJ9IGZyb20gJy4vdXRpbHMnO1xuXG5cbi8qKlxuICogQSBgUGFja2FnZUpzb25VcGRhdGVyYCB0aGF0IGNhbiBzYWZlbHkgaGFuZGxlIHVwZGF0ZSBvcGVyYXRpb25zIG9uIG11bHRpcGxlIHByb2Nlc3Nlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIENsdXN0ZXJQYWNrYWdlSnNvblVwZGF0ZXIgaW1wbGVtZW50cyBQYWNrYWdlSnNvblVwZGF0ZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRlbGVnYXRlOiBQYWNrYWdlSnNvblVwZGF0ZXIpIHt9XG5cbiAgY3JlYXRlVXBkYXRlKCk6IFBhY2thZ2VKc29uVXBkYXRlIHtcbiAgICByZXR1cm4gbmV3IFBhY2thZ2VKc29uVXBkYXRlKCguLi5hcmdzKSA9PiB0aGlzLndyaXRlQ2hhbmdlcyguLi5hcmdzKSk7XG4gIH1cblxuICB3cml0ZUNoYW5nZXMoXG4gICAgICBjaGFuZ2VzOiBQYWNrYWdlSnNvbkNoYW5nZVtdLCBwYWNrYWdlSnNvblBhdGg6IEFic29sdXRlRnNQYXRoLFxuICAgICAgcHJlRXhpc3RpbmdQYXJzZWRKc29uPzogSnNvbk9iamVjdCk6IHZvaWQge1xuICAgIGlmIChjbHVzdGVyLmlzTWFzdGVyKSB7XG4gICAgICAvLyBUaGlzIGlzIHRoZSBtYXN0ZXIgcHJvY2VzczpcbiAgICAgIC8vIEFjdHVhbGx5IGFwcGx5IHRoZSBjaGFuZ2VzIHRvIHRoZSBmaWxlIG9uIGRpc2suXG4gICAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZS53cml0ZUNoYW5nZXMoY2hhbmdlcywgcGFja2FnZUpzb25QYXRoLCBwcmVFeGlzdGluZ1BhcnNlZEpzb24pO1xuICAgIH1cblxuICAgIC8vIFRoaXMgaXMgYSB3b3JrZXIgcHJvY2VzczpcbiAgICAvLyBBcHBseSB0aGUgY2hhbmdlcyBpbi1tZW1vcnkgKGlmIG5lY2Vzc2FyeSkgYW5kIHNlbmQgYSBtZXNzYWdlIHRvIHRoZSBtYXN0ZXIgcHJvY2Vzcy5cbiAgICBpZiAocHJlRXhpc3RpbmdQYXJzZWRKc29uKSB7XG4gICAgICBmb3IgKGNvbnN0IFtwcm9wUGF0aCwgdmFsdWVdIG9mIGNoYW5nZXMpIHtcbiAgICAgICAgaWYgKHByb3BQYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyBwcm9wZXJ0eSBwYXRoIGZvciB3cml0aW5nIHZhbHVlIHRvICcke3BhY2thZ2VKc29uUGF0aH0nLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm8gbmVlZCB0byB0YWtlIHByb3BlcnR5IHBvc2l0aW9uaW5nIGludG8gYWNjb3VudCBmb3IgaW4tbWVtb3J5IHJlcHJlc2VudGF0aW9ucy5cbiAgICAgICAgYXBwbHlDaGFuZ2UocHJlRXhpc3RpbmdQYXJzZWRKc29uLCBwcm9wUGF0aCwgdmFsdWUsICd1bmltcG9ydGFudCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNlbmRNZXNzYWdlVG9NYXN0ZXIoe1xuICAgICAgdHlwZTogJ3VwZGF0ZS1wYWNrYWdlLWpzb24nLFxuICAgICAgcGFja2FnZUpzb25QYXRoLFxuICAgICAgY2hhbmdlcyxcbiAgICB9KTtcbiAgfVxufVxuIl19