(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/packages/bundle_program", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/packages/patch_ts_expando_initializer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var patch_ts_expando_initializer_1 = require("@angular/compiler-cli/ngcc/src/packages/patch_ts_expando_initializer");
    /**
     * Create a bundle program.
     */
    function makeBundleProgram(fs, isCore, pkg, path, r3FileName, options, host, additionalFiles) {
        if (additionalFiles === void 0) { additionalFiles = []; }
        var r3SymbolsPath = isCore ? findR3SymbolsPath(fs, file_system_1.dirname(path), r3FileName) : null;
        var rootPaths = r3SymbolsPath ? tslib_1.__spread([path, r3SymbolsPath], additionalFiles) : tslib_1.__spread([path], additionalFiles);
        var originalGetExpandoInitializer = patch_ts_expando_initializer_1.patchTsGetExpandoInitializer();
        var program = ts.createProgram(rootPaths, options, host);
        // Ask for the typeChecker to trigger the binding phase of the compilation.
        // This will then exercise the patched function.
        program.getTypeChecker();
        patch_ts_expando_initializer_1.restoreGetExpandoInitializer(originalGetExpandoInitializer);
        var file = program.getSourceFile(path);
        var r3SymbolsFile = r3SymbolsPath && program.getSourceFile(r3SymbolsPath) || null;
        return { program: program, options: options, host: host, package: pkg, path: path, file: file, r3SymbolsPath: r3SymbolsPath, r3SymbolsFile: r3SymbolsFile };
    }
    exports.makeBundleProgram = makeBundleProgram;
    /**
     * Search the given directory hierarchy to find the path to the `r3_symbols` file.
     */
    function findR3SymbolsPath(fs, directory, filename) {
        var e_1, _a;
        var r3SymbolsFilePath = file_system_1.resolve(directory, filename);
        if (fs.exists(r3SymbolsFilePath)) {
            return r3SymbolsFilePath;
        }
        var subDirectories = fs.readdir(directory)
            // Not interested in hidden files
            .filter(function (p) { return !p.startsWith('.'); })
            // Ignore node_modules
            .filter(function (p) { return p !== 'node_modules'; })
            // Only interested in directories (and only those that are not symlinks)
            .filter(function (p) {
            var stat = fs.lstat(file_system_1.resolve(directory, p));
            return stat.isDirectory() && !stat.isSymbolicLink();
        });
        try {
            for (var subDirectories_1 = tslib_1.__values(subDirectories), subDirectories_1_1 = subDirectories_1.next(); !subDirectories_1_1.done; subDirectories_1_1 = subDirectories_1.next()) {
                var subDirectory = subDirectories_1_1.value;
                var r3SymbolsFilePath_1 = findR3SymbolsPath(fs, file_system_1.resolve(directory, subDirectory), filename);
                if (r3SymbolsFilePath_1) {
                    return r3SymbolsFilePath_1;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (subDirectories_1_1 && !subDirectories_1_1.done && (_a = subDirectories_1.return)) _a.call(subDirectories_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    exports.findR3SymbolsPath = findR3SymbolsPath;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlX3Byb2dyYW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcGFja2FnZXMvYnVuZGxlX3Byb2dyYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsK0JBQWlDO0lBQ2pDLDJFQUE0RjtJQUM1RixxSEFBMEc7SUFxQjFHOztPQUVHO0lBQ0gsU0FBZ0IsaUJBQWlCLENBQzdCLEVBQWMsRUFBRSxNQUFlLEVBQUUsR0FBbUIsRUFBRSxJQUFvQixFQUFFLFVBQWtCLEVBQzlGLE9BQTJCLEVBQUUsSUFBcUIsRUFDbEQsZUFBc0M7UUFBdEMsZ0NBQUEsRUFBQSxvQkFBc0M7UUFDeEMsSUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUscUJBQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3ZGLElBQUksU0FBUyxHQUNULGFBQWEsQ0FBQyxDQUFDLG1CQUFFLElBQUksRUFBRSxhQUFhLEdBQUssZUFBZSxFQUFFLENBQUMsbUJBQUUsSUFBSSxHQUFLLGVBQWUsQ0FBQyxDQUFDO1FBRTNGLElBQU0sNkJBQTZCLEdBQUcsMkRBQTRCLEVBQUUsQ0FBQztRQUNyRSxJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0QsMkVBQTJFO1FBQzNFLGdEQUFnRDtRQUNoRCxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDekIsMkRBQTRCLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUU1RCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBRyxDQUFDO1FBQzNDLElBQU0sYUFBYSxHQUFHLGFBQWEsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLElBQUksQ0FBQztRQUVwRixPQUFPLEVBQUMsT0FBTyxTQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLE1BQUEsRUFBRSxJQUFJLE1BQUEsRUFBRSxhQUFhLGVBQUEsRUFBRSxhQUFhLGVBQUEsRUFBQyxDQUFDO0lBQzFGLENBQUM7SUFuQkQsOENBbUJDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixpQkFBaUIsQ0FDN0IsRUFBYyxFQUFFLFNBQXlCLEVBQUUsUUFBZ0I7O1FBQzdELElBQU0saUJBQWlCLEdBQUcscUJBQU8sQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdkQsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDaEMsT0FBTyxpQkFBaUIsQ0FBQztTQUMxQjtRQUVELElBQU0sY0FBYyxHQUNoQixFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztZQUNqQixpQ0FBaUM7YUFDaEMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFsQixDQUFrQixDQUFDO1lBQ2hDLHNCQUFzQjthQUNyQixNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLEtBQUssY0FBYyxFQUFwQixDQUFvQixDQUFDO1lBQ2xDLHdFQUF3RTthQUN2RSxNQUFNLENBQUMsVUFBQSxDQUFDO1lBQ1AsSUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxxQkFBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdDLE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUFDOztZQUVYLEtBQTJCLElBQUEsbUJBQUEsaUJBQUEsY0FBYyxDQUFBLDhDQUFBLDBFQUFFO2dCQUF0QyxJQUFNLFlBQVksMkJBQUE7Z0JBQ3JCLElBQU0sbUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsRUFBRSxFQUFFLHFCQUFPLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUM1RixJQUFJLG1CQUFpQixFQUFFO29CQUNyQixPQUFPLG1CQUFpQixDQUFDO2lCQUMxQjthQUNGOzs7Ozs7Ozs7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUEzQkQsOENBMkJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBGaWxlU3lzdGVtLCBkaXJuYW1lLCByZXNvbHZlfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtwYXRjaFRzR2V0RXhwYW5kb0luaXRpYWxpemVyLCByZXN0b3JlR2V0RXhwYW5kb0luaXRpYWxpemVyfSBmcm9tICcuL3BhdGNoX3RzX2V4cGFuZG9faW5pdGlhbGl6ZXInO1xuXG4vKipcbiogQW4gZW50cnkgcG9pbnQgYnVuZGxlIGNvbnRhaW5zIG9uZSBvciB0d28gcHJvZ3JhbXMsIGUuZy4gYHNyY2AgYW5kIGBkdHNgLFxuKiB0aGF0IGFyZSBjb21waWxlZCB2aWEgVHlwZVNjcmlwdC5cbipcbiogVG8gYWlkIHdpdGggcHJvY2Vzc2luZyB0aGUgcHJvZ3JhbSwgdGhpcyBpbnRlcmZhY2UgZXhwb3NlcyB0aGUgcHJvZ3JhbSBpdHNlbGYsXG4qIGFzIHdlbGwgYXMgcGF0aCBhbmQgVFMgZmlsZSBvZiB0aGUgZW50cnktcG9pbnQgdG8gdGhlIHByb2dyYW0gYW5kIHRoZSByM1N5bWJvbHNcbiogZmlsZSwgaWYgYXBwcm9wcmlhdGUuXG4qL1xuZXhwb3J0IGludGVyZmFjZSBCdW5kbGVQcm9ncmFtIHtcbiAgcHJvZ3JhbTogdHMuUHJvZ3JhbTtcbiAgb3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zO1xuICBob3N0OiB0cy5Db21waWxlckhvc3Q7XG4gIHBhdGg6IEFic29sdXRlRnNQYXRoO1xuICBmaWxlOiB0cy5Tb3VyY2VGaWxlO1xuICBwYWNrYWdlOiBBYnNvbHV0ZUZzUGF0aDtcbiAgcjNTeW1ib2xzUGF0aDogQWJzb2x1dGVGc1BhdGh8bnVsbDtcbiAgcjNTeW1ib2xzRmlsZTogdHMuU291cmNlRmlsZXxudWxsO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGJ1bmRsZSBwcm9ncmFtLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUJ1bmRsZVByb2dyYW0oXG4gICAgZnM6IEZpbGVTeXN0ZW0sIGlzQ29yZTogYm9vbGVhbiwgcGtnOiBBYnNvbHV0ZUZzUGF0aCwgcGF0aDogQWJzb2x1dGVGc1BhdGgsIHIzRmlsZU5hbWU6IHN0cmluZyxcbiAgICBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMsIGhvc3Q6IHRzLkNvbXBpbGVySG9zdCxcbiAgICBhZGRpdGlvbmFsRmlsZXM6IEFic29sdXRlRnNQYXRoW10gPSBbXSk6IEJ1bmRsZVByb2dyYW0ge1xuICBjb25zdCByM1N5bWJvbHNQYXRoID0gaXNDb3JlID8gZmluZFIzU3ltYm9sc1BhdGgoZnMsIGRpcm5hbWUocGF0aCksIHIzRmlsZU5hbWUpIDogbnVsbDtcbiAgbGV0IHJvb3RQYXRocyA9XG4gICAgICByM1N5bWJvbHNQYXRoID8gW3BhdGgsIHIzU3ltYm9sc1BhdGgsIC4uLmFkZGl0aW9uYWxGaWxlc10gOiBbcGF0aCwgLi4uYWRkaXRpb25hbEZpbGVzXTtcblxuICBjb25zdCBvcmlnaW5hbEdldEV4cGFuZG9Jbml0aWFsaXplciA9IHBhdGNoVHNHZXRFeHBhbmRvSW5pdGlhbGl6ZXIoKTtcbiAgY29uc3QgcHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0ocm9vdFBhdGhzLCBvcHRpb25zLCBob3N0KTtcbiAgLy8gQXNrIGZvciB0aGUgdHlwZUNoZWNrZXIgdG8gdHJpZ2dlciB0aGUgYmluZGluZyBwaGFzZSBvZiB0aGUgY29tcGlsYXRpb24uXG4gIC8vIFRoaXMgd2lsbCB0aGVuIGV4ZXJjaXNlIHRoZSBwYXRjaGVkIGZ1bmN0aW9uLlxuICBwcm9ncmFtLmdldFR5cGVDaGVja2VyKCk7XG4gIHJlc3RvcmVHZXRFeHBhbmRvSW5pdGlhbGl6ZXIob3JpZ2luYWxHZXRFeHBhbmRvSW5pdGlhbGl6ZXIpO1xuXG4gIGNvbnN0IGZpbGUgPSBwcm9ncmFtLmdldFNvdXJjZUZpbGUocGF0aCkgITtcbiAgY29uc3QgcjNTeW1ib2xzRmlsZSA9IHIzU3ltYm9sc1BhdGggJiYgcHJvZ3JhbS5nZXRTb3VyY2VGaWxlKHIzU3ltYm9sc1BhdGgpIHx8IG51bGw7XG5cbiAgcmV0dXJuIHtwcm9ncmFtLCBvcHRpb25zLCBob3N0LCBwYWNrYWdlOiBwa2csIHBhdGgsIGZpbGUsIHIzU3ltYm9sc1BhdGgsIHIzU3ltYm9sc0ZpbGV9O1xufVxuXG4vKipcbiAqIFNlYXJjaCB0aGUgZ2l2ZW4gZGlyZWN0b3J5IGhpZXJhcmNoeSB0byBmaW5kIHRoZSBwYXRoIHRvIHRoZSBgcjNfc3ltYm9sc2AgZmlsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRSM1N5bWJvbHNQYXRoKFxuICAgIGZzOiBGaWxlU3lzdGVtLCBkaXJlY3Rvcnk6IEFic29sdXRlRnNQYXRoLCBmaWxlbmFtZTogc3RyaW5nKTogQWJzb2x1dGVGc1BhdGh8bnVsbCB7XG4gIGNvbnN0IHIzU3ltYm9sc0ZpbGVQYXRoID0gcmVzb2x2ZShkaXJlY3RvcnksIGZpbGVuYW1lKTtcbiAgaWYgKGZzLmV4aXN0cyhyM1N5bWJvbHNGaWxlUGF0aCkpIHtcbiAgICByZXR1cm4gcjNTeW1ib2xzRmlsZVBhdGg7XG4gIH1cblxuICBjb25zdCBzdWJEaXJlY3RvcmllcyA9XG4gICAgICBmcy5yZWFkZGlyKGRpcmVjdG9yeSlcbiAgICAgICAgICAvLyBOb3QgaW50ZXJlc3RlZCBpbiBoaWRkZW4gZmlsZXNcbiAgICAgICAgICAuZmlsdGVyKHAgPT4gIXAuc3RhcnRzV2l0aCgnLicpKVxuICAgICAgICAgIC8vIElnbm9yZSBub2RlX21vZHVsZXNcbiAgICAgICAgICAuZmlsdGVyKHAgPT4gcCAhPT0gJ25vZGVfbW9kdWxlcycpXG4gICAgICAgICAgLy8gT25seSBpbnRlcmVzdGVkIGluIGRpcmVjdG9yaWVzIChhbmQgb25seSB0aG9zZSB0aGF0IGFyZSBub3Qgc3ltbGlua3MpXG4gICAgICAgICAgLmZpbHRlcihwID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXQgPSBmcy5sc3RhdChyZXNvbHZlKGRpcmVjdG9yeSwgcCkpO1xuICAgICAgICAgICAgcmV0dXJuIHN0YXQuaXNEaXJlY3RvcnkoKSAmJiAhc3RhdC5pc1N5bWJvbGljTGluaygpO1xuICAgICAgICAgIH0pO1xuXG4gIGZvciAoY29uc3Qgc3ViRGlyZWN0b3J5IG9mIHN1YkRpcmVjdG9yaWVzKSB7XG4gICAgY29uc3QgcjNTeW1ib2xzRmlsZVBhdGggPSBmaW5kUjNTeW1ib2xzUGF0aChmcywgcmVzb2x2ZShkaXJlY3RvcnksIHN1YkRpcmVjdG9yeSksIGZpbGVuYW1lKTtcbiAgICBpZiAocjNTeW1ib2xzRmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiByM1N5bWJvbHNGaWxlUGF0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cbiJdfQ==