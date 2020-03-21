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
        define("@angular/compiler-cli/ngcc/src/analysis/ngcc_references_registry", ["require", "exports", "@angular/compiler-cli/ngcc/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils_1 = require("@angular/compiler-cli/ngcc/src/utils");
    /**
     * This is a place for DecoratorHandlers to register references that they
     * find in their analysis of the code.
     *
     * This registry is used to ensure that these references are publicly exported
     * from libraries that are compiled by ngcc.
     */
    var NgccReferencesRegistry = /** @class */ (function () {
        function NgccReferencesRegistry(host) {
            this.host = host;
            this.map = new Map();
        }
        /**
         * Register one or more references in the registry.
         * Only `ResolveReference` references are stored. Other types are ignored.
         * @param references A collection of references to register.
         */
        NgccReferencesRegistry.prototype.add = function (source) {
            var _this = this;
            var references = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                references[_i - 1] = arguments[_i];
            }
            references.forEach(function (ref) {
                // Only store relative references. We are not interested in literals.
                if (ref.bestGuessOwningModule === null && utils_1.hasNameIdentifier(ref.node)) {
                    var declaration = _this.host.getDeclarationOfIdentifier(ref.node.name);
                    if (declaration && declaration.node !== null && utils_1.hasNameIdentifier(declaration.node)) {
                        _this.map.set(declaration.node.name, declaration);
                    }
                }
            });
        };
        /**
         * Create and return a mapping for the registered resolved references.
         * @returns A map of reference identifiers to reference declarations.
         */
        NgccReferencesRegistry.prototype.getDeclarationMap = function () { return this.map; };
        return NgccReferencesRegistry;
    }());
    exports.NgccReferencesRegistry = NgccReferencesRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdjY19yZWZlcmVuY2VzX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2FuYWx5c2lzL25nY2NfcmVmZXJlbmNlc19yZWdpc3RyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQU1ILDhEQUEyQztJQUUzQzs7Ozs7O09BTUc7SUFDSDtRQUdFLGdDQUFvQixJQUFvQjtZQUFwQixTQUFJLEdBQUosSUFBSSxDQUFnQjtZQUZoQyxRQUFHLEdBQUcsSUFBSSxHQUFHLEVBQXNDLENBQUM7UUFFakIsQ0FBQztRQUU1Qzs7OztXQUlHO1FBQ0gsb0NBQUcsR0FBSCxVQUFJLE1BQXNCO1lBQTFCLGlCQVVDO1lBVjJCLG9CQUEwQztpQkFBMUMsVUFBMEMsRUFBMUMscUJBQTBDLEVBQTFDLElBQTBDO2dCQUExQyxtQ0FBMEM7O1lBQ3BFLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHO2dCQUNwQixxRUFBcUU7Z0JBQ3JFLElBQUksR0FBRyxDQUFDLHFCQUFxQixLQUFLLElBQUksSUFBSSx5QkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3JFLElBQU0sV0FBVyxHQUFHLEtBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDeEUsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUkseUJBQWlCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUNuRixLQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztxQkFDbEQ7aUJBQ0Y7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRDs7O1dBR0c7UUFDSCxrREFBaUIsR0FBakIsY0FBK0QsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuRiw2QkFBQztJQUFELENBQUMsQUEzQkQsSUEyQkM7SUEzQlksd0RBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7UmVmZXJlbmNlc1JlZ2lzdHJ5fSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvYW5ub3RhdGlvbnMnO1xuaW1wb3J0IHtSZWZlcmVuY2V9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9pbXBvcnRzJztcbmltcG9ydCB7Q29uY3JldGVEZWNsYXJhdGlvbiwgUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9yZWZsZWN0aW9uJztcbmltcG9ydCB7aGFzTmFtZUlkZW50aWZpZXJ9IGZyb20gJy4uL3V0aWxzJztcblxuLyoqXG4gKiBUaGlzIGlzIGEgcGxhY2UgZm9yIERlY29yYXRvckhhbmRsZXJzIHRvIHJlZ2lzdGVyIHJlZmVyZW5jZXMgdGhhdCB0aGV5XG4gKiBmaW5kIGluIHRoZWlyIGFuYWx5c2lzIG9mIHRoZSBjb2RlLlxuICpcbiAqIFRoaXMgcmVnaXN0cnkgaXMgdXNlZCB0byBlbnN1cmUgdGhhdCB0aGVzZSByZWZlcmVuY2VzIGFyZSBwdWJsaWNseSBleHBvcnRlZFxuICogZnJvbSBsaWJyYXJpZXMgdGhhdCBhcmUgY29tcGlsZWQgYnkgbmdjYy5cbiAqL1xuZXhwb3J0IGNsYXNzIE5nY2NSZWZlcmVuY2VzUmVnaXN0cnkgaW1wbGVtZW50cyBSZWZlcmVuY2VzUmVnaXN0cnkge1xuICBwcml2YXRlIG1hcCA9IG5ldyBNYXA8dHMuSWRlbnRpZmllciwgQ29uY3JldGVEZWNsYXJhdGlvbj4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGhvc3Q6IFJlZmxlY3Rpb25Ib3N0KSB7fVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBvbmUgb3IgbW9yZSByZWZlcmVuY2VzIGluIHRoZSByZWdpc3RyeS5cbiAgICogT25seSBgUmVzb2x2ZVJlZmVyZW5jZWAgcmVmZXJlbmNlcyBhcmUgc3RvcmVkLiBPdGhlciB0eXBlcyBhcmUgaWdub3JlZC5cbiAgICogQHBhcmFtIHJlZmVyZW5jZXMgQSBjb2xsZWN0aW9uIG9mIHJlZmVyZW5jZXMgdG8gcmVnaXN0ZXIuXG4gICAqL1xuICBhZGQoc291cmNlOiB0cy5EZWNsYXJhdGlvbiwgLi4ucmVmZXJlbmNlczogUmVmZXJlbmNlPHRzLkRlY2xhcmF0aW9uPltdKTogdm9pZCB7XG4gICAgcmVmZXJlbmNlcy5mb3JFYWNoKHJlZiA9PiB7XG4gICAgICAvLyBPbmx5IHN0b3JlIHJlbGF0aXZlIHJlZmVyZW5jZXMuIFdlIGFyZSBub3QgaW50ZXJlc3RlZCBpbiBsaXRlcmFscy5cbiAgICAgIGlmIChyZWYuYmVzdEd1ZXNzT3duaW5nTW9kdWxlID09PSBudWxsICYmIGhhc05hbWVJZGVudGlmaWVyKHJlZi5ub2RlKSkge1xuICAgICAgICBjb25zdCBkZWNsYXJhdGlvbiA9IHRoaXMuaG9zdC5nZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcihyZWYubm9kZS5uYW1lKTtcbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uICYmIGRlY2xhcmF0aW9uLm5vZGUgIT09IG51bGwgJiYgaGFzTmFtZUlkZW50aWZpZXIoZGVjbGFyYXRpb24ubm9kZSkpIHtcbiAgICAgICAgICB0aGlzLm1hcC5zZXQoZGVjbGFyYXRpb24ubm9kZS5uYW1lLCBkZWNsYXJhdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIG1hcHBpbmcgZm9yIHRoZSByZWdpc3RlcmVkIHJlc29sdmVkIHJlZmVyZW5jZXMuXG4gICAqIEByZXR1cm5zIEEgbWFwIG9mIHJlZmVyZW5jZSBpZGVudGlmaWVycyB0byByZWZlcmVuY2UgZGVjbGFyYXRpb25zLlxuICAgKi9cbiAgZ2V0RGVjbGFyYXRpb25NYXAoKTogTWFwPHRzLklkZW50aWZpZXIsIENvbmNyZXRlRGVjbGFyYXRpb24+IHsgcmV0dXJuIHRoaXMubWFwOyB9XG59XG4iXX0=