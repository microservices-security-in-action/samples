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
        define("@angular/compiler-cli/src/ngtsc/routing/src/route", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var RouterEntryPoint = /** @class */ (function () {
        function RouterEntryPoint() {
        }
        return RouterEntryPoint;
    }());
    exports.RouterEntryPoint = RouterEntryPoint;
    var RouterEntryPointImpl = /** @class */ (function () {
        function RouterEntryPointImpl(filePath, moduleName) {
            this.filePath = filePath;
            this.moduleName = moduleName;
        }
        Object.defineProperty(RouterEntryPointImpl.prototype, "name", {
            get: function () { return this.moduleName; },
            enumerable: true,
            configurable: true
        });
        // For debugging purposes.
        RouterEntryPointImpl.prototype.toString = function () { return "RouterEntryPoint(name: " + this.name + ", filePath: " + this.filePath + ")"; };
        return RouterEntryPointImpl;
    }());
    var RouterEntryPointManager = /** @class */ (function () {
        function RouterEntryPointManager(moduleResolver) {
            this.moduleResolver = moduleResolver;
            this.map = new Map();
        }
        RouterEntryPointManager.prototype.resolveLoadChildrenIdentifier = function (loadChildrenIdentifier, context) {
            var _a = tslib_1.__read(loadChildrenIdentifier.split('#'), 2), relativeFile = _a[0], moduleName = _a[1];
            if (moduleName === undefined) {
                return null;
            }
            var resolvedSf = this.moduleResolver.resolveModule(relativeFile, context.fileName);
            if (resolvedSf === null) {
                return null;
            }
            return this.fromNgModule(resolvedSf, moduleName);
        };
        RouterEntryPointManager.prototype.fromNgModule = function (sf, moduleName) {
            var key = entryPointKeyFor(sf.fileName, moduleName);
            if (!this.map.has(key)) {
                this.map.set(key, new RouterEntryPointImpl(sf.fileName, moduleName));
            }
            return this.map.get(key);
        };
        return RouterEntryPointManager;
    }());
    exports.RouterEntryPointManager = RouterEntryPointManager;
    function entryPointKeyFor(filePath, moduleName) {
        // Drop the extension to be compatible with how cli calls `listLazyRoutes(entryRoute)`.
        return filePath.replace(/\.tsx?$/i, '') + "#" + moduleName;
    }
    exports.entryPointKeyFor = entryPointKeyFor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3JvdXRpbmcvc3JjL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQU1IO1FBQUE7UUFPQSxDQUFDO1FBQUQsdUJBQUM7SUFBRCxDQUFDLEFBUEQsSUFPQztJQVBxQiw0Q0FBZ0I7SUFTdEM7UUFDRSw4QkFBcUIsUUFBZ0IsRUFBVyxVQUFrQjtZQUE3QyxhQUFRLEdBQVIsUUFBUSxDQUFRO1lBQVcsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUFHLENBQUM7UUFFdEUsc0JBQUksc0NBQUk7aUJBQVIsY0FBcUIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzs7O1dBQUE7UUFFOUMsMEJBQTBCO1FBQzFCLHVDQUFRLEdBQVIsY0FBcUIsT0FBTyw0QkFBMEIsSUFBSSxDQUFDLElBQUksb0JBQWUsSUFBSSxDQUFDLFFBQVEsTUFBRyxDQUFDLENBQUMsQ0FBQztRQUNuRywyQkFBQztJQUFELENBQUMsQUFQRCxJQU9DO0lBRUQ7UUFHRSxpQ0FBb0IsY0FBOEI7WUFBOUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBRjFDLFFBQUcsR0FBRyxJQUFJLEdBQUcsRUFBNEIsQ0FBQztRQUVHLENBQUM7UUFFdEQsK0RBQTZCLEdBQTdCLFVBQThCLHNCQUE4QixFQUFFLE9BQXNCO1lBRTVFLElBQUEseURBQThELEVBQTdELG9CQUFZLEVBQUUsa0JBQStDLENBQUM7WUFDckUsSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO2dCQUM1QixPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyRixJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRCw4Q0FBWSxHQUFaLFVBQWEsRUFBaUIsRUFBRSxVQUFrQjtZQUNoRCxJQUFNLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDdEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksb0JBQW9CLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO2FBQ3RFO1lBQ0QsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUcsQ0FBQztRQUM3QixDQUFDO1FBQ0gsOEJBQUM7SUFBRCxDQUFDLEFBekJELElBeUJDO0lBekJZLDBEQUF1QjtJQTJCcEMsU0FBZ0IsZ0JBQWdCLENBQUMsUUFBZ0IsRUFBRSxVQUFrQjtRQUNuRSx1RkFBdUY7UUFDdkYsT0FBVSxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsU0FBSSxVQUFZLENBQUM7SUFDN0QsQ0FBQztJQUhELDRDQUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtNb2R1bGVSZXNvbHZlcn0gZnJvbSAnLi4vLi4vaW1wb3J0cyc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSb3V0ZXJFbnRyeVBvaW50IHtcbiAgYWJzdHJhY3QgcmVhZG9ubHkgZmlsZVBhdGg6IHN0cmluZztcblxuICBhYnN0cmFjdCByZWFkb25seSBtb2R1bGVOYW1lOiBzdHJpbmc7XG5cbiAgLy8gQWxpYXMgb2YgbW9kdWxlTmFtZSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIHdoYXQgYG5ndG9vbHNfYXBpYCByZXR1cm5lZC5cbiAgYWJzdHJhY3QgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xufVxuXG5jbGFzcyBSb3V0ZXJFbnRyeVBvaW50SW1wbCBpbXBsZW1lbnRzIFJvdXRlckVudHJ5UG9pbnQge1xuICBjb25zdHJ1Y3RvcihyZWFkb25seSBmaWxlUGF0aDogc3RyaW5nLCByZWFkb25seSBtb2R1bGVOYW1lOiBzdHJpbmcpIHt9XG5cbiAgZ2V0IG5hbWUoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMubW9kdWxlTmFtZTsgfVxuXG4gIC8vIEZvciBkZWJ1Z2dpbmcgcHVycG9zZXMuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgUm91dGVyRW50cnlQb2ludChuYW1lOiAke3RoaXMubmFtZX0sIGZpbGVQYXRoOiAke3RoaXMuZmlsZVBhdGh9KWA7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFJvdXRlckVudHJ5UG9pbnRNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBtYXAgPSBuZXcgTWFwPHN0cmluZywgUm91dGVyRW50cnlQb2ludD4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1vZHVsZVJlc29sdmVyOiBNb2R1bGVSZXNvbHZlcikge31cblxuICByZXNvbHZlTG9hZENoaWxkcmVuSWRlbnRpZmllcihsb2FkQ2hpbGRyZW5JZGVudGlmaWVyOiBzdHJpbmcsIGNvbnRleHQ6IHRzLlNvdXJjZUZpbGUpOlxuICAgICAgUm91dGVyRW50cnlQb2ludHxudWxsIHtcbiAgICBjb25zdCBbcmVsYXRpdmVGaWxlLCBtb2R1bGVOYW1lXSA9IGxvYWRDaGlsZHJlbklkZW50aWZpZXIuc3BsaXQoJyMnKTtcbiAgICBpZiAobW9kdWxlTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgcmVzb2x2ZWRTZiA9IHRoaXMubW9kdWxlUmVzb2x2ZXIucmVzb2x2ZU1vZHVsZShyZWxhdGl2ZUZpbGUsIGNvbnRleHQuZmlsZU5hbWUpO1xuICAgIGlmIChyZXNvbHZlZFNmID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZnJvbU5nTW9kdWxlKHJlc29sdmVkU2YsIG1vZHVsZU5hbWUpO1xuICB9XG5cbiAgZnJvbU5nTW9kdWxlKHNmOiB0cy5Tb3VyY2VGaWxlLCBtb2R1bGVOYW1lOiBzdHJpbmcpOiBSb3V0ZXJFbnRyeVBvaW50IHtcbiAgICBjb25zdCBrZXkgPSBlbnRyeVBvaW50S2V5Rm9yKHNmLmZpbGVOYW1lLCBtb2R1bGVOYW1lKTtcbiAgICBpZiAoIXRoaXMubWFwLmhhcyhrZXkpKSB7XG4gICAgICB0aGlzLm1hcC5zZXQoa2V5LCBuZXcgUm91dGVyRW50cnlQb2ludEltcGwoc2YuZmlsZU5hbWUsIG1vZHVsZU5hbWUpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubWFwLmdldChrZXkpICE7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVudHJ5UG9pbnRLZXlGb3IoZmlsZVBhdGg6IHN0cmluZywgbW9kdWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gRHJvcCB0aGUgZXh0ZW5zaW9uIHRvIGJlIGNvbXBhdGlibGUgd2l0aCBob3cgY2xpIGNhbGxzIGBsaXN0TGF6eVJvdXRlcyhlbnRyeVJvdXRlKWAuXG4gIHJldHVybiBgJHtmaWxlUGF0aC5yZXBsYWNlKC9cXC50c3g/JC9pLCAnJyl9IyR7bW9kdWxlTmFtZX1gO1xufVxuIl19