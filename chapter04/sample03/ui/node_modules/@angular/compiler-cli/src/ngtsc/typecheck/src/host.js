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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/host", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A `ts.CompilerHost` which augments source files with type checking code from a
     * `TypeCheckContext`.
     */
    var TypeCheckProgramHost = /** @class */ (function () {
        function TypeCheckProgramHost(sfMap, delegate) {
            this.delegate = delegate;
            this.sfMap = sfMap;
            if (delegate.getDirectories !== undefined) {
                this.getDirectories = function (path) { return delegate.getDirectories(path); };
            }
            if (delegate.resolveModuleNames !== undefined) {
                this.resolveModuleNames = delegate.resolveModuleNames;
            }
        }
        TypeCheckProgramHost.prototype.getSourceFile = function (fileName, languageVersion, onError, shouldCreateNewSourceFile) {
            // Look in the cache for the source file.
            var sf = this.sfMap.get(fileName);
            if (sf === undefined) {
                // There should be no cache misses, but just in case, delegate getSourceFile in the event of
                // a cache miss.
                sf = this.delegate.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
                sf && this.sfMap.set(fileName, sf);
            }
            else {
                // TypeScript doesn't allow returning redirect source files. To avoid unforseen errors we
                // return the original source file instead of the redirect target.
                var redirectInfo = sf.redirectInfo;
                if (redirectInfo !== undefined) {
                    sf = redirectInfo.unredirected;
                }
            }
            return sf;
        };
        // The rest of the methods simply delegate to the underlying `ts.CompilerHost`.
        TypeCheckProgramHost.prototype.getDefaultLibFileName = function (options) {
            return this.delegate.getDefaultLibFileName(options);
        };
        TypeCheckProgramHost.prototype.writeFile = function (fileName, data, writeByteOrderMark, onError, sourceFiles) {
            throw new Error("TypeCheckProgramHost should never write files");
        };
        TypeCheckProgramHost.prototype.getCurrentDirectory = function () { return this.delegate.getCurrentDirectory(); };
        TypeCheckProgramHost.prototype.getCanonicalFileName = function (fileName) {
            return this.delegate.getCanonicalFileName(fileName);
        };
        TypeCheckProgramHost.prototype.useCaseSensitiveFileNames = function () { return this.delegate.useCaseSensitiveFileNames(); };
        TypeCheckProgramHost.prototype.getNewLine = function () { return this.delegate.getNewLine(); };
        TypeCheckProgramHost.prototype.fileExists = function (fileName) {
            return this.sfMap.has(fileName) || this.delegate.fileExists(fileName);
        };
        TypeCheckProgramHost.prototype.readFile = function (fileName) { return this.delegate.readFile(fileName); };
        return TypeCheckProgramHost;
    }());
    exports.TypeCheckProgramHost = TypeCheckProgramHost;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy9ob3N0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBS0g7OztPQUdHO0lBQ0g7UUFRRSw4QkFBWSxLQUFpQyxFQUFVLFFBQXlCO1lBQXpCLGFBQVEsR0FBUixRQUFRLENBQWlCO1lBQzlFLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBRW5CLElBQUksUUFBUSxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQ3pDLElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBQyxJQUFZLElBQUssT0FBQSxRQUFRLENBQUMsY0FBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBL0IsQ0FBK0IsQ0FBQzthQUN6RTtZQUVELElBQUksUUFBUSxDQUFDLGtCQUFrQixLQUFLLFNBQVMsRUFBRTtnQkFDN0MsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQzthQUN2RDtRQUNILENBQUM7UUFFRCw0Q0FBYSxHQUFiLFVBQ0ksUUFBZ0IsRUFBRSxlQUFnQyxFQUNsRCxPQUErQyxFQUMvQyx5QkFBNkM7WUFDL0MseUNBQXlDO1lBQ3pDLElBQUksRUFBRSxHQUE0QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzRCxJQUFJLEVBQUUsS0FBSyxTQUFTLEVBQUU7Z0JBQ3BCLDRGQUE0RjtnQkFDNUYsZ0JBQWdCO2dCQUNoQixFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQzVCLFFBQVEsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLHlCQUF5QixDQUFDLENBQUM7Z0JBQ25FLEVBQUUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDcEM7aUJBQU07Z0JBQ0wseUZBQXlGO2dCQUN6RixrRUFBa0U7Z0JBQ2xFLElBQU0sWUFBWSxHQUFJLEVBQVUsQ0FBQyxZQUFZLENBQUM7Z0JBQzlDLElBQUksWUFBWSxLQUFLLFNBQVMsRUFBRTtvQkFDOUIsRUFBRSxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUM7aUJBQ2hDO2FBQ0Y7WUFDRCxPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFFRCwrRUFBK0U7UUFFL0Usb0RBQXFCLEdBQXJCLFVBQXNCLE9BQTJCO1lBQy9DLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsd0NBQVMsR0FBVCxVQUNJLFFBQWdCLEVBQUUsSUFBWSxFQUFFLGtCQUEyQixFQUMzRCxPQUE4QyxFQUM5QyxXQUFtRDtZQUNyRCxNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELGtEQUFtQixHQUFuQixjQUFnQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFJN0UsbURBQW9CLEdBQXBCLFVBQXFCLFFBQWdCO1lBQ25DLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsd0RBQXlCLEdBQXpCLGNBQXVDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUUxRix5Q0FBVSxHQUFWLGNBQXVCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFM0QseUNBQVUsR0FBVixVQUFXLFFBQWdCO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUVELHVDQUFRLEdBQVIsVUFBUyxRQUFnQixJQUFzQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRiwyQkFBQztJQUFELENBQUMsQUF6RUQsSUF5RUM7SUF6RVksb0RBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7VHlwZUNoZWNrQ29udGV4dH0gZnJvbSAnLi9jb250ZXh0JztcblxuLyoqXG4gKiBBIGB0cy5Db21waWxlckhvc3RgIHdoaWNoIGF1Z21lbnRzIHNvdXJjZSBmaWxlcyB3aXRoIHR5cGUgY2hlY2tpbmcgY29kZSBmcm9tIGFcbiAqIGBUeXBlQ2hlY2tDb250ZXh0YC5cbiAqL1xuZXhwb3J0IGNsYXNzIFR5cGVDaGVja1Byb2dyYW1Ib3N0IGltcGxlbWVudHMgdHMuQ29tcGlsZXJIb3N0IHtcbiAgLyoqXG4gICAqIE1hcCBvZiBzb3VyY2UgZmlsZSBuYW1lcyB0byBgdHMuU291cmNlRmlsZWAgaW5zdGFuY2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBzZk1hcDogTWFwPHN0cmluZywgdHMuU291cmNlRmlsZT47XG5cbiAgcmVhZG9ubHkgcmVzb2x2ZU1vZHVsZU5hbWVzPzogdHMuQ29tcGlsZXJIb3N0WydyZXNvbHZlTW9kdWxlTmFtZXMnXTtcblxuICBjb25zdHJ1Y3RvcihzZk1hcDogTWFwPHN0cmluZywgdHMuU291cmNlRmlsZT4sIHByaXZhdGUgZGVsZWdhdGU6IHRzLkNvbXBpbGVySG9zdCkge1xuICAgIHRoaXMuc2ZNYXAgPSBzZk1hcDtcblxuICAgIGlmIChkZWxlZ2F0ZS5nZXREaXJlY3RvcmllcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmdldERpcmVjdG9yaWVzID0gKHBhdGg6IHN0cmluZykgPT4gZGVsZWdhdGUuZ2V0RGlyZWN0b3JpZXMgIShwYXRoKTtcbiAgICB9XG5cbiAgICBpZiAoZGVsZWdhdGUucmVzb2x2ZU1vZHVsZU5hbWVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMucmVzb2x2ZU1vZHVsZU5hbWVzID0gZGVsZWdhdGUucmVzb2x2ZU1vZHVsZU5hbWVzO1xuICAgIH1cbiAgfVxuXG4gIGdldFNvdXJjZUZpbGUoXG4gICAgICBmaWxlTmFtZTogc3RyaW5nLCBsYW5ndWFnZVZlcnNpb246IHRzLlNjcmlwdFRhcmdldCxcbiAgICAgIG9uRXJyb3I/OiAoKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCl8dW5kZWZpbmVkLFxuICAgICAgc2hvdWxkQ3JlYXRlTmV3U291cmNlRmlsZT86IGJvb2xlYW58dW5kZWZpbmVkKTogdHMuU291cmNlRmlsZXx1bmRlZmluZWQge1xuICAgIC8vIExvb2sgaW4gdGhlIGNhY2hlIGZvciB0aGUgc291cmNlIGZpbGUuXG4gICAgbGV0IHNmOiB0cy5Tb3VyY2VGaWxlfHVuZGVmaW5lZCA9IHRoaXMuc2ZNYXAuZ2V0KGZpbGVOYW1lKTtcbiAgICBpZiAoc2YgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gVGhlcmUgc2hvdWxkIGJlIG5vIGNhY2hlIG1pc3NlcywgYnV0IGp1c3QgaW4gY2FzZSwgZGVsZWdhdGUgZ2V0U291cmNlRmlsZSBpbiB0aGUgZXZlbnQgb2ZcbiAgICAgIC8vIGEgY2FjaGUgbWlzcy5cbiAgICAgIHNmID0gdGhpcy5kZWxlZ2F0ZS5nZXRTb3VyY2VGaWxlKFxuICAgICAgICAgIGZpbGVOYW1lLCBsYW5ndWFnZVZlcnNpb24sIG9uRXJyb3IsIHNob3VsZENyZWF0ZU5ld1NvdXJjZUZpbGUpO1xuICAgICAgc2YgJiYgdGhpcy5zZk1hcC5zZXQoZmlsZU5hbWUsIHNmKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVHlwZVNjcmlwdCBkb2Vzbid0IGFsbG93IHJldHVybmluZyByZWRpcmVjdCBzb3VyY2UgZmlsZXMuIFRvIGF2b2lkIHVuZm9yc2VlbiBlcnJvcnMgd2VcbiAgICAgIC8vIHJldHVybiB0aGUgb3JpZ2luYWwgc291cmNlIGZpbGUgaW5zdGVhZCBvZiB0aGUgcmVkaXJlY3QgdGFyZ2V0LlxuICAgICAgY29uc3QgcmVkaXJlY3RJbmZvID0gKHNmIGFzIGFueSkucmVkaXJlY3RJbmZvO1xuICAgICAgaWYgKHJlZGlyZWN0SW5mbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNmID0gcmVkaXJlY3RJbmZvLnVucmVkaXJlY3RlZDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNmO1xuICB9XG5cbiAgLy8gVGhlIHJlc3Qgb2YgdGhlIG1ldGhvZHMgc2ltcGx5IGRlbGVnYXRlIHRvIHRoZSB1bmRlcmx5aW5nIGB0cy5Db21waWxlckhvc3RgLlxuXG4gIGdldERlZmF1bHRMaWJGaWxlTmFtZShvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmRlbGVnYXRlLmdldERlZmF1bHRMaWJGaWxlTmFtZShvcHRpb25zKTtcbiAgfVxuXG4gIHdyaXRlRmlsZShcbiAgICAgIGZpbGVOYW1lOiBzdHJpbmcsIGRhdGE6IHN0cmluZywgd3JpdGVCeXRlT3JkZXJNYXJrOiBib29sZWFuLFxuICAgICAgb25FcnJvcjogKChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQpfHVuZGVmaW5lZCxcbiAgICAgIHNvdXJjZUZpbGVzOiBSZWFkb25seUFycmF5PHRzLlNvdXJjZUZpbGU+fHVuZGVmaW5lZCk6IHZvaWQge1xuICAgIHRocm93IG5ldyBFcnJvcihgVHlwZUNoZWNrUHJvZ3JhbUhvc3Qgc2hvdWxkIG5ldmVyIHdyaXRlIGZpbGVzYCk7XG4gIH1cblxuICBnZXRDdXJyZW50RGlyZWN0b3J5KCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmRlbGVnYXRlLmdldEN1cnJlbnREaXJlY3RvcnkoKTsgfVxuXG4gIGdldERpcmVjdG9yaWVzPzogKHBhdGg6IHN0cmluZykgPT4gc3RyaW5nW107XG5cbiAgZ2V0Q2Fub25pY2FsRmlsZU5hbWUoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZGVsZWdhdGUuZ2V0Q2Fub25pY2FsRmlsZU5hbWUoZmlsZU5hbWUpO1xuICB9XG5cbiAgdXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lcygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZGVsZWdhdGUudXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lcygpOyB9XG5cbiAgZ2V0TmV3TGluZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5nZXROZXdMaW5lKCk7IH1cblxuICBmaWxlRXhpc3RzKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zZk1hcC5oYXMoZmlsZU5hbWUpIHx8IHRoaXMuZGVsZWdhdGUuZmlsZUV4aXN0cyhmaWxlTmFtZSk7XG4gIH1cblxuICByZWFkRmlsZShmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nfHVuZGVmaW5lZCB7IHJldHVybiB0aGlzLmRlbGVnYXRlLnJlYWRGaWxlKGZpbGVOYW1lKTsgfVxufSJdfQ==