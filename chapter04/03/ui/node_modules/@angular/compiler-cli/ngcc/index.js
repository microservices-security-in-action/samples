(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc", ["require", "exports", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/main", "@angular/compiler-cli/ngcc/src/logging/console_logger"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var main_1 = require("@angular/compiler-cli/ngcc/src/main");
    var console_logger_1 = require("@angular/compiler-cli/ngcc/src/logging/console_logger");
    exports.ConsoleLogger = console_logger_1.ConsoleLogger;
    exports.LogLevel = console_logger_1.LogLevel;
    function process(options) {
        // Recreate the file system on each call to reset the cache
        file_system_1.setFileSystem(new file_system_1.CachedFileSystem(new file_system_1.NodeJSFileSystem()));
        return main_1.mainNgcc(options);
    }
    exports.process = process;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDJFQUEyRjtJQUUzRiw0REFBb0Y7SUFDcEYsd0ZBQXFFO0lBQTdELHlDQUFBLGFBQWEsQ0FBQTtJQUFFLG9DQUFBLFFBQVEsQ0FBQTtJQU8vQixTQUFnQixPQUFPLENBQUMsT0FBb0I7UUFDMUMsMkRBQTJEO1FBQzNELDJCQUFhLENBQUMsSUFBSSw4QkFBZ0IsQ0FBQyxJQUFJLDhCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVELE9BQU8sZUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFKRCwwQkFJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Q2FjaGVkRmlsZVN5c3RlbSwgTm9kZUpTRmlsZVN5c3RlbSwgc2V0RmlsZVN5c3RlbX0gZnJvbSAnLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcblxuaW1wb3J0IHtBc3luY05nY2NPcHRpb25zLCBOZ2NjT3B0aW9ucywgU3luY05nY2NPcHRpb25zLCBtYWluTmdjY30gZnJvbSAnLi9zcmMvbWFpbic7XG5leHBvcnQge0NvbnNvbGVMb2dnZXIsIExvZ0xldmVsfSBmcm9tICcuL3NyYy9sb2dnaW5nL2NvbnNvbGVfbG9nZ2VyJztcbmV4cG9ydCB7TG9nZ2VyfSBmcm9tICcuL3NyYy9sb2dnaW5nL2xvZ2dlcic7XG5leHBvcnQge0FzeW5jTmdjY09wdGlvbnMsIE5nY2NPcHRpb25zLCBTeW5jTmdjY09wdGlvbnN9IGZyb20gJy4vc3JjL21haW4nO1xuZXhwb3J0IHtQYXRoTWFwcGluZ3N9IGZyb20gJy4vc3JjL3V0aWxzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3Mob3B0aW9uczogQXN5bmNOZ2NjT3B0aW9ucyk6IFByb21pc2U8dm9pZD47XG5leHBvcnQgZnVuY3Rpb24gcHJvY2VzcyhvcHRpb25zOiBTeW5jTmdjY09wdGlvbnMpOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3Mob3B0aW9uczogTmdjY09wdGlvbnMpOiB2b2lkfFByb21pc2U8dm9pZD4ge1xuICAvLyBSZWNyZWF0ZSB0aGUgZmlsZSBzeXN0ZW0gb24gZWFjaCBjYWxsIHRvIHJlc2V0IHRoZSBjYWNoZVxuICBzZXRGaWxlU3lzdGVtKG5ldyBDYWNoZWRGaWxlU3lzdGVtKG5ldyBOb2RlSlNGaWxlU3lzdGVtKCkpKTtcbiAgcmV0dXJuIG1haW5OZ2NjKG9wdGlvbnMpO1xufVxuIl19