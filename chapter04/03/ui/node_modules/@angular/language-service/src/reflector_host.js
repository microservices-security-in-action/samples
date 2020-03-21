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
        define("@angular/language-service/src/reflector_host", ["require", "exports", "@angular/compiler-cli/src/language_services", "path", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var language_services_1 = require("@angular/compiler-cli/src/language_services");
    var path = require("path");
    var ts = require("typescript");
    var ReflectorModuleModuleResolutionHost = /** @class */ (function () {
        function ReflectorModuleModuleResolutionHost(tsLSHost, getProgram) {
            this.tsLSHost = tsLSHost;
            this.getProgram = getProgram;
            this.metadataCollector = new language_services_1.MetadataCollector({
                // Note: verboseInvalidExpressions is important so that
                // the collector will collect errors instead of throwing
                verboseInvalidExpression: true,
            });
            if (tsLSHost.directoryExists) {
                this.directoryExists = function (directoryName) { return tsLSHost.directoryExists(directoryName); };
            }
        }
        ReflectorModuleModuleResolutionHost.prototype.fileExists = function (fileName) {
            // TypeScript resolution logic walks through the following sequence in order:
            // package.json (read "types" field) -> .ts -> .tsx -> .d.ts
            // For more info, see
            // https://www.typescriptlang.org/docs/handbook/module-resolution.html
            // For Angular specifically, we can skip .tsx lookup
            if (fileName.endsWith('.tsx')) {
                return false;
            }
            if (this.tsLSHost.fileExists) {
                return this.tsLSHost.fileExists(fileName);
            }
            return !!this.tsLSHost.getScriptSnapshot(fileName);
        };
        ReflectorModuleModuleResolutionHost.prototype.readFile = function (fileName) {
            // readFile() is used by TypeScript to read package.json during module
            // resolution, and it's used by Angular to read metadata.json during
            // metadata resolution.
            if (this.tsLSHost.readFile) {
                return this.tsLSHost.readFile(fileName);
            }
            // As a fallback, read the JSON files from the editor snapshot.
            var snapshot = this.tsLSHost.getScriptSnapshot(fileName);
            if (!snapshot) {
                // MetadataReaderHost readFile() declaration should be
                // `readFile(fileName: string): string | undefined`
                return undefined;
            }
            return snapshot.getText(0, snapshot.getLength());
        };
        ReflectorModuleModuleResolutionHost.prototype.getSourceFileMetadata = function (fileName) {
            var sf = this.getProgram().getSourceFile(fileName);
            return sf ? this.metadataCollector.getMetadata(sf) : undefined;
        };
        ReflectorModuleModuleResolutionHost.prototype.cacheMetadata = function (fileName) {
            // Don't cache the metadata for .ts files as they might change in the editor!
            return fileName.endsWith('.d.ts');
        };
        return ReflectorModuleModuleResolutionHost;
    }());
    var ReflectorHost = /** @class */ (function () {
        function ReflectorHost(getProgram, tsLSHost) {
            this.tsLSHost = tsLSHost;
            this.metadataReaderCache = language_services_1.createMetadataReaderCache();
            // tsLSHost.getCurrentDirectory() returns the directory where tsconfig.json
            // is located. This is not the same as process.cwd() because the language
            // service host sets the "project root path" as its current directory.
            var currentDir = tsLSHost.getCurrentDirectory();
            this.fakeContainingPath = currentDir ? path.join(currentDir, 'fakeContainingFile.ts') : '';
            this.hostAdapter = new ReflectorModuleModuleResolutionHost(tsLSHost, getProgram);
            this.moduleResolutionCache = ts.createModuleResolutionCache(currentDir, function (s) { return s; }, // getCanonicalFileName
            tsLSHost.getCompilationSettings());
        }
        ReflectorHost.prototype.getMetadataFor = function (modulePath) {
            return language_services_1.readMetadata(modulePath, this.hostAdapter, this.metadataReaderCache);
        };
        ReflectorHost.prototype.moduleNameToFileName = function (moduleName, containingFile) {
            if (!containingFile) {
                if (moduleName.startsWith('.')) {
                    throw new Error('Resolution of relative paths requires a containing file.');
                }
                if (!this.fakeContainingPath) {
                    // If current directory is empty then the file must belong to an inferred
                    // project (no tsconfig.json), in which case it's not possible to resolve
                    // the module without the caller explicitly providing a containing file.
                    throw new Error("Could not resolve '" + moduleName + "' without a containing file.");
                }
                containingFile = this.fakeContainingPath;
            }
            var compilerOptions = this.tsLSHost.getCompilationSettings();
            var resolved = ts.resolveModuleName(moduleName, containingFile, compilerOptions, this.hostAdapter, this.moduleResolutionCache)
                .resolvedModule;
            return resolved ? resolved.resolvedFileName : null;
        };
        ReflectorHost.prototype.getOutputName = function (filePath) { return filePath; };
        return ReflectorHost;
    }());
    exports.ReflectorHost = ReflectorHost;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmbGVjdG9yX2hvc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9sYW5ndWFnZS1zZXJ2aWNlL3NyYy9yZWZsZWN0b3JfaG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUdILGlGQUEySTtJQUMzSSwyQkFBNkI7SUFDN0IsK0JBQWlDO0lBRWpDO1FBU0UsNkNBQ3FCLFFBQWdDLEVBQ2hDLFVBQTRCO1lBRDVCLGFBQVEsR0FBUixRQUFRLENBQXdCO1lBQ2hDLGVBQVUsR0FBVixVQUFVLENBQWtCO1lBVmhDLHNCQUFpQixHQUFHLElBQUkscUNBQWlCLENBQUM7Z0JBQ3pELHVEQUF1RDtnQkFDdkQsd0RBQXdEO2dCQUN4RCx3QkFBd0IsRUFBRSxJQUFJO2FBQy9CLENBQUMsQ0FBQztZQU9ELElBQUksUUFBUSxDQUFDLGVBQWUsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxVQUFBLGFBQWEsSUFBSSxPQUFBLFFBQVEsQ0FBQyxlQUFpQixDQUFDLGFBQWEsQ0FBQyxFQUF6QyxDQUF5QyxDQUFDO2FBQ25GO1FBQ0gsQ0FBQztRQUVELHdEQUFVLEdBQVYsVUFBVyxRQUFnQjtZQUN6Qiw2RUFBNkU7WUFDN0UsNERBQTREO1lBQzVELHFCQUFxQjtZQUNyQixzRUFBc0U7WUFDdEUsb0RBQW9EO1lBQ3BELElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDN0IsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUU7Z0JBQzVCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDM0M7WUFDRCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JELENB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QUFDO1lBQy9ELElBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FDZCxVQUFVLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUM3RCxJQUFJLENBQUMscUJBQXFCLENBQUM7aUJBQzVCLGNBQWMsQ0FBQztZQUNyQyxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDckQsQ0FBQztRQUVELHFDQUFhLEdBQWIsVUFBYyxRQUFnQixJQUFJLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN0RCxvQkFBQztJQUFELENBQUMsQUE3Q0QsSUE2Q0M7SUE3Q1ksc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U3RhdGljU3ltYm9sUmVzb2x2ZXJIb3N0fSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQge01ldGFkYXRhQ29sbGVjdG9yLCBNZXRhZGF0YVJlYWRlckhvc3QsIGNyZWF0ZU1ldGFkYXRhUmVhZGVyQ2FjaGUsIHJlYWRNZXRhZGF0YX0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXItY2xpL3NyYy9sYW5ndWFnZV9zZXJ2aWNlcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmNsYXNzIFJlZmxlY3Rvck1vZHVsZU1vZHVsZVJlc29sdXRpb25Ib3N0IGltcGxlbWVudHMgdHMuTW9kdWxlUmVzb2x1dGlvbkhvc3QsIE1ldGFkYXRhUmVhZGVySG9zdCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgbWV0YWRhdGFDb2xsZWN0b3IgPSBuZXcgTWV0YWRhdGFDb2xsZWN0b3Ioe1xuICAgIC8vIE5vdGU6IHZlcmJvc2VJbnZhbGlkRXhwcmVzc2lvbnMgaXMgaW1wb3J0YW50IHNvIHRoYXRcbiAgICAvLyB0aGUgY29sbGVjdG9yIHdpbGwgY29sbGVjdCBlcnJvcnMgaW5zdGVhZCBvZiB0aHJvd2luZ1xuICAgIHZlcmJvc2VJbnZhbGlkRXhwcmVzc2lvbjogdHJ1ZSxcbiAgfSk7XG5cbiAgcmVhZG9ubHkgZGlyZWN0b3J5RXhpc3RzPzogKGRpcmVjdG9yeU5hbWU6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgdHNMU0hvc3Q6IHRzLkxhbmd1YWdlU2VydmljZUhvc3QsXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IGdldFByb2dyYW06ICgpID0+IHRzLlByb2dyYW0pIHtcbiAgICBpZiAodHNMU0hvc3QuZGlyZWN0b3J5RXhpc3RzKSB7XG4gICAgICB0aGlzLmRpcmVjdG9yeUV4aXN0cyA9IGRpcmVjdG9yeU5hbWUgPT4gdHNMU0hvc3QuZGlyZWN0b3J5RXhpc3RzICEoZGlyZWN0b3J5TmFtZSk7XG4gICAgfVxuICB9XG5cbiAgZmlsZUV4aXN0cyhmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8gVHlwZVNjcmlwdCByZXNvbHV0aW9uIGxvZ2ljIHdhbGtzIHRocm91Z2ggdGhlIGZvbGxvd2luZyBzZXF1ZW5jZSBpbiBvcmRlcjpcbiAgICAvLyBwYWNrYWdlLmpzb24gKHJlYWQgXCJ0eXBlc1wiIGZpZWxkKSAtPiAudHMgLT4gLnRzeCAtPiAuZC50c1xuICAgIC8vIEZvciBtb3JlIGluZm8sIHNlZVxuICAgIC8vIGh0dHBzOi8vd3d3LnR5cGVzY3JpcHRsYW5nLm9yZy9kb2NzL2hhbmRib29rL21vZHVsZS1yZXNvbHV0aW9uLmh0bWxcbiAgICAvLyBGb3IgQW5ndWxhciBzcGVjaWZpY2FsbHksIHdlIGNhbiBza2lwIC50c3ggbG9va3VwXG4gICAgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcudHN4JykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHRoaXMudHNMU0hvc3QuZmlsZUV4aXN0cykge1xuICAgICAgcmV0dXJuIHRoaXMudHNMU0hvc3QuZmlsZUV4aXN0cyhmaWxlTmFtZSk7XG4gICAgfVxuICAgIHJldHVybiAhIXRoaXMudHNMU0hvc3QuZ2V0U2NyaXB0U25hcHNob3QoZmlsZU5hbWUpO1xuICB9XG5cbiAgcmVhZEZpbGUoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gcmVhZEZpbGUoKSBpcyB1c2VkIGJ5IFR5cGVTY3JpcHQgdG8gcmVhZCBwYWNrYWdlLmpzb24gZHVyaW5nIG1vZHVsZVxuICAgIC8vIHJlc29sdXRpb24sIGFuZCBpdCdzIHVzZWQgYnkgQW5ndWxhciB0byByZWFkIG1ldGFkYXRhLmpzb24gZHVyaW5nXG4gICAgLy8gbWV0YWRhdGEgcmVzb2x1dGlvbi5cbiAgICBpZiAodGhpcy50c0xTSG9zdC5yZWFkRmlsZSkge1xuICAgICAgcmV0dXJuIHRoaXMudHNMU0hvc3QucmVhZEZpbGUoZmlsZU5hbWUpICE7XG4gICAgfVxuICAgIC8vIEFzIGEgZmFsbGJhY2ssIHJlYWQgdGhlIEpTT04gZmlsZXMgZnJvbSB0aGUgZWRpdG9yIHNuYXBzaG90LlxuICAgIGNvbnN0IHNuYXBzaG90ID0gdGhpcy50c0xTSG9zdC5nZXRTY3JpcHRTbmFwc2hvdChmaWxlTmFtZSk7XG4gICAgaWYgKCFzbmFwc2hvdCkge1xuICAgICAgLy8gTWV0YWRhdGFSZWFkZXJIb3N0IHJlYWRGaWxlKCkgZGVjbGFyYXRpb24gc2hvdWxkIGJlXG4gICAgICAvLyBgcmVhZEZpbGUoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZGBcbiAgICAgIHJldHVybiB1bmRlZmluZWQgITtcbiAgICB9XG4gICAgcmV0dXJuIHNuYXBzaG90LmdldFRleHQoMCwgc25hcHNob3QuZ2V0TGVuZ3RoKCkpO1xuICB9XG5cbiAgZ2V0U291cmNlRmlsZU1ldGFkYXRhKGZpbGVOYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBzZiA9IHRoaXMuZ2V0UHJvZ3JhbSgpLmdldFNvdXJjZUZpbGUoZmlsZU5hbWUpO1xuICAgIHJldHVybiBzZiA/IHRoaXMubWV0YWRhdGFDb2xsZWN0b3IuZ2V0TWV0YWRhdGEoc2YpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgY2FjaGVNZXRhZGF0YShmaWxlTmFtZTogc3RyaW5nKSB7XG4gICAgLy8gRG9uJ3QgY2FjaGUgdGhlIG1ldGFkYXRhIGZvciAudHMgZmlsZXMgYXMgdGhleSBtaWdodCBjaGFuZ2UgaW4gdGhlIGVkaXRvciFcbiAgICByZXR1cm4gZmlsZU5hbWUuZW5kc1dpdGgoJy5kLnRzJyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlZmxlY3Rvckhvc3QgaW1wbGVtZW50cyBTdGF0aWNTeW1ib2xSZXNvbHZlckhvc3Qge1xuICBwcml2YXRlIHJlYWRvbmx5IGhvc3RBZGFwdGVyOiBSZWZsZWN0b3JNb2R1bGVNb2R1bGVSZXNvbHV0aW9uSG9zdDtcbiAgcHJpdmF0ZSByZWFkb25seSBtZXRhZGF0YVJlYWRlckNhY2hlID0gY3JlYXRlTWV0YWRhdGFSZWFkZXJDYWNoZSgpO1xuICBwcml2YXRlIHJlYWRvbmx5IG1vZHVsZVJlc29sdXRpb25DYWNoZTogdHMuTW9kdWxlUmVzb2x1dGlvbkNhY2hlO1xuICBwcml2YXRlIHJlYWRvbmx5IGZha2VDb250YWluaW5nUGF0aDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGdldFByb2dyYW06ICgpID0+IHRzLlByb2dyYW0sIHByaXZhdGUgcmVhZG9ubHkgdHNMU0hvc3Q6IHRzLkxhbmd1YWdlU2VydmljZUhvc3QpIHtcbiAgICAvLyB0c0xTSG9zdC5nZXRDdXJyZW50RGlyZWN0b3J5KCkgcmV0dXJucyB0aGUgZGlyZWN0b3J5IHdoZXJlIHRzY29uZmlnLmpzb25cbiAgICAvLyBpcyBsb2NhdGVkLiBUaGlzIGlzIG5vdCB0aGUgc2FtZSBhcyBwcm9jZXNzLmN3ZCgpIGJlY2F1c2UgdGhlIGxhbmd1YWdlXG4gICAgLy8gc2VydmljZSBob3N0IHNldHMgdGhlIFwicHJvamVjdCByb290IHBhdGhcIiBhcyBpdHMgY3VycmVudCBkaXJlY3RvcnkuXG4gICAgY29uc3QgY3VycmVudERpciA9IHRzTFNIb3N0LmdldEN1cnJlbnREaXJlY3RvcnkoKTtcbiAgICB0aGlzLmZha2VDb250YWluaW5nUGF0aCA9IGN1cnJlbnREaXIgPyBwYXRoLmpvaW4oY3VycmVudERpciwgJ2Zha2VDb250YWluaW5nRmlsZS50cycpIDogJyc7XG4gICAgdGhpcy5ob3N0QWRhcHRlciA9IG5ldyBSZWZsZWN0b3JNb2R1bGVNb2R1bGVSZXNvbHV0aW9uSG9zdCh0c0xTSG9zdCwgZ2V0UHJvZ3JhbSk7XG4gICAgdGhpcy5tb2R1bGVSZXNvbHV0aW9uQ2FjaGUgPSB0cy5jcmVhdGVNb2R1bGVSZXNvbHV0aW9uQ2FjaGUoXG4gICAgICAgIGN1cnJlbnREaXIsXG4gICAgICAgIHMgPT4gcywgIC8vIGdldENhbm9uaWNhbEZpbGVOYW1lXG4gICAgICAgIHRzTFNIb3N0LmdldENvbXBpbGF0aW9uU2V0dGluZ3MoKSk7XG4gIH1cblxuICBnZXRNZXRhZGF0YUZvcihtb2R1bGVQYXRoOiBzdHJpbmcpOiB7W2tleTogc3RyaW5nXTogYW55fVtdfHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHJlYWRNZXRhZGF0YShtb2R1bGVQYXRoLCB0aGlzLmhvc3RBZGFwdGVyLCB0aGlzLm1ldGFkYXRhUmVhZGVyQ2FjaGUpO1xuICB9XG5cbiAgbW9kdWxlTmFtZVRvRmlsZU5hbWUobW9kdWxlTmFtZTogc3RyaW5nLCBjb250YWluaW5nRmlsZT86IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAoIWNvbnRhaW5pbmdGaWxlKSB7XG4gICAgICBpZiAobW9kdWxlTmFtZS5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXNvbHV0aW9uIG9mIHJlbGF0aXZlIHBhdGhzIHJlcXVpcmVzIGEgY29udGFpbmluZyBmaWxlLicpO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmZha2VDb250YWluaW5nUGF0aCkge1xuICAgICAgICAvLyBJZiBjdXJyZW50IGRpcmVjdG9yeSBpcyBlbXB0eSB0aGVuIHRoZSBmaWxlIG11c3QgYmVsb25nIHRvIGFuIGluZmVycmVkXG4gICAgICAgIC8vIHByb2plY3QgKG5vIHRzY29uZmlnLmpzb24pLCBpbiB3aGljaCBjYXNlIGl0J3Mgbm90IHBvc3NpYmxlIHRvIHJlc29sdmVcbiAgICAgICAgLy8gdGhlIG1vZHVsZSB3aXRob3V0IHRoZSBjYWxsZXIgZXhwbGljaXRseSBwcm92aWRpbmcgYSBjb250YWluaW5nIGZpbGUuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHJlc29sdmUgJyR7bW9kdWxlTmFtZX0nIHdpdGhvdXQgYSBjb250YWluaW5nIGZpbGUuYCk7XG4gICAgICB9XG4gICAgICBjb250YWluaW5nRmlsZSA9IHRoaXMuZmFrZUNvbnRhaW5pbmdQYXRoO1xuICAgIH1cbiAgICBjb25zdCBjb21waWxlck9wdGlvbnMgPSB0aGlzLnRzTFNIb3N0LmdldENvbXBpbGF0aW9uU2V0dGluZ3MoKTtcbiAgICBjb25zdCByZXNvbHZlZCA9IHRzLnJlc29sdmVNb2R1bGVOYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlTmFtZSwgY29udGFpbmluZ0ZpbGUsIGNvbXBpbGVyT3B0aW9ucywgdGhpcy5ob3N0QWRhcHRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlUmVzb2x1dGlvbkNhY2hlKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXNvbHZlZE1vZHVsZTtcbiAgICByZXR1cm4gcmVzb2x2ZWQgPyByZXNvbHZlZC5yZXNvbHZlZEZpbGVOYW1lIDogbnVsbDtcbiAgfVxuXG4gIGdldE91dHB1dE5hbWUoZmlsZVBhdGg6IHN0cmluZykgeyByZXR1cm4gZmlsZVBhdGg7IH1cbn1cbiJdfQ==