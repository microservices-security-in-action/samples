(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/writing/new_entry_point_file_writer", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/ngcc/src/writing/in_place_file_writer"], factory);
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
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var in_place_file_writer_1 = require("@angular/compiler-cli/ngcc/src/writing/in_place_file_writer");
    exports.NGCC_DIRECTORY = '__ivy_ngcc__';
    exports.NGCC_PROPERTY_EXTENSION = '_ivy_ngcc';
    /**
     * This FileWriter creates a copy of the original entry-point, then writes the transformed
     * files onto the files in this copy, and finally updates the package.json with a new
     * entry-point format property that points to this new entry-point.
     *
     * If there are transformed typings files in this bundle, they are updated in-place (see the
     * `InPlaceFileWriter`).
     */
    var NewEntryPointFileWriter = /** @class */ (function (_super) {
        tslib_1.__extends(NewEntryPointFileWriter, _super);
        function NewEntryPointFileWriter(fs, pkgJsonUpdater) {
            var _this = _super.call(this, fs) || this;
            _this.pkgJsonUpdater = pkgJsonUpdater;
            return _this;
        }
        NewEntryPointFileWriter.prototype.writeBundle = function (bundle, transformedFiles, formatProperties) {
            var _this = this;
            // The new folder is at the root of the overall package
            var entryPoint = bundle.entryPoint;
            var ngccFolder = file_system_1.join(entryPoint.package, exports.NGCC_DIRECTORY);
            this.copyBundle(bundle, entryPoint.package, ngccFolder);
            transformedFiles.forEach(function (file) { return _this.writeFile(file, entryPoint.package, ngccFolder); });
            this.updatePackageJson(entryPoint, formatProperties, ngccFolder);
        };
        NewEntryPointFileWriter.prototype.copyBundle = function (bundle, packagePath, ngccFolder) {
            var _this = this;
            bundle.src.program.getSourceFiles().forEach(function (sourceFile) {
                var relativePath = file_system_1.relative(packagePath, file_system_1.absoluteFromSourceFile(sourceFile));
                var isOutsidePackage = relativePath.startsWith('..');
                if (!sourceFile.isDeclarationFile && !isOutsidePackage) {
                    var newFilePath = file_system_1.join(ngccFolder, relativePath);
                    _this.fs.ensureDir(file_system_1.dirname(newFilePath));
                    _this.fs.copyFile(file_system_1.absoluteFromSourceFile(sourceFile), newFilePath);
                }
            });
        };
        NewEntryPointFileWriter.prototype.writeFile = function (file, packagePath, ngccFolder) {
            if (typescript_1.isDtsPath(file.path.replace(/\.map$/, ''))) {
                // This is either `.d.ts` or `.d.ts.map` file
                _super.prototype.writeFileAndBackup.call(this, file);
            }
            else {
                var relativePath = file_system_1.relative(packagePath, file.path);
                var newFilePath = file_system_1.join(ngccFolder, relativePath);
                this.fs.ensureDir(file_system_1.dirname(newFilePath));
                this.fs.writeFile(newFilePath, file.contents);
            }
        };
        NewEntryPointFileWriter.prototype.updatePackageJson = function (entryPoint, formatProperties, ngccFolder) {
            var e_1, _a;
            if (formatProperties.length === 0) {
                // No format properties need updating.
                return;
            }
            var packageJson = entryPoint.packageJson;
            var packageJsonPath = file_system_1.join(entryPoint.path, 'package.json');
            // All format properties point to the same format-path.
            var oldFormatProp = formatProperties[0];
            var oldFormatPath = packageJson[oldFormatProp];
            var oldAbsFormatPath = file_system_1.join(entryPoint.path, oldFormatPath);
            var newAbsFormatPath = file_system_1.join(ngccFolder, file_system_1.relative(entryPoint.package, oldAbsFormatPath));
            var newFormatPath = file_system_1.relative(entryPoint.path, newAbsFormatPath);
            // Update all properties in `package.json` (both in memory and on disk).
            var update = this.pkgJsonUpdater.createUpdate();
            try {
                for (var formatProperties_1 = tslib_1.__values(formatProperties), formatProperties_1_1 = formatProperties_1.next(); !formatProperties_1_1.done; formatProperties_1_1 = formatProperties_1.next()) {
                    var formatProperty = formatProperties_1_1.value;
                    if (packageJson[formatProperty] !== oldFormatPath) {
                        throw new Error("Unable to update '" + packageJsonPath + "': Format properties " +
                            ("(" + formatProperties.join(', ') + ") map to more than one format-path."));
                    }
                    update.addChange(["" + formatProperty + exports.NGCC_PROPERTY_EXTENSION], newFormatPath, { before: formatProperty });
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (formatProperties_1_1 && !formatProperties_1_1.done && (_a = formatProperties_1.return)) _a.call(formatProperties_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            update.writeChanges(packageJsonPath, packageJson);
        };
        return NewEntryPointFileWriter;
    }(in_place_file_writer_1.InPlaceFileWriter));
    exports.NewEntryPointFileWriter = NewEntryPointFileWriter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3X2VudHJ5X3BvaW50X2ZpbGVfd3JpdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL3dyaXRpbmcvbmV3X2VudHJ5X3BvaW50X2ZpbGVfd3JpdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUNBOzs7Ozs7T0FNRztJQUNILDJFQUEySDtJQUMzSCxrRkFBaUU7SUFLakUsb0dBQXlEO0lBRzVDLFFBQUEsY0FBYyxHQUFHLGNBQWMsQ0FBQztJQUNoQyxRQUFBLHVCQUF1QixHQUFHLFdBQVcsQ0FBQztJQUVuRDs7Ozs7OztPQU9HO0lBQ0g7UUFBNkMsbURBQWlCO1FBQzVELGlDQUFZLEVBQWMsRUFBVSxjQUFrQztZQUF0RSxZQUEwRSxrQkFBTSxFQUFFLENBQUMsU0FBRztZQUFsRCxvQkFBYyxHQUFkLGNBQWMsQ0FBb0I7O1FBQWUsQ0FBQztRQUV0Riw2Q0FBVyxHQUFYLFVBQ0ksTUFBd0IsRUFBRSxnQkFBK0IsRUFDekQsZ0JBQTBDO1lBRjlDLGlCQVNDO1lBTkMsdURBQXVEO1lBQ3ZELElBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDckMsSUFBTSxVQUFVLEdBQUcsa0JBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLHNCQUFjLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3hELGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLEtBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLEVBQXBELENBQW9ELENBQUMsQ0FBQztZQUN2RixJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLGdCQUFnQixFQUFF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QixJQUFJLFdBQVcsQ0FBQyxjQUFjLENBQUMsS0FBSyxhQUFhLEVBQUU7d0JBQ2pELE1BQU0sSUFBSSxLQUFLLENBQ1gsdUJBQXFCLGVBQWUsMEJBQXVCOzZCQUMzRCxNQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsd0NBQXFDLENBQUEsQ0FBQyxDQUFDO3FCQUMzRTtvQkFFRCxNQUFNLENBQUMsU0FBUyxDQUNaLENBQUMsS0FBRyxjQUFjLEdBQUcsK0JBQXlCLENBQUMsRUFBRSxhQUFhLEVBQUUsRUFBQyxNQUFNLEVBQUUsY0FBYyxFQUFDLENBQUMsQ0FBQztpQkFDL0Y7Ozs7Ozs7OztZQUVELE1BQU0sQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFDSCw4QkFBQztJQUFELENBQUMsQUExRUQsQ0FBNkMsd0NBQWlCLEdBMEU3RDtJQTFFWSwwREFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIEZpbGVTeXN0ZW0sIGFic29sdXRlRnJvbVNvdXJjZUZpbGUsIGRpcm5hbWUsIGpvaW4sIHJlbGF0aXZlfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtpc0R0c1BhdGh9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy91dGlsL3NyYy90eXBlc2NyaXB0JztcbmltcG9ydCB7RW50cnlQb2ludCwgRW50cnlQb2ludEpzb25Qcm9wZXJ0eX0gZnJvbSAnLi4vcGFja2FnZXMvZW50cnlfcG9pbnQnO1xuaW1wb3J0IHtFbnRyeVBvaW50QnVuZGxlfSBmcm9tICcuLi9wYWNrYWdlcy9lbnRyeV9wb2ludF9idW5kbGUnO1xuaW1wb3J0IHtGaWxlVG9Xcml0ZX0gZnJvbSAnLi4vcmVuZGVyaW5nL3V0aWxzJztcblxuaW1wb3J0IHtJblBsYWNlRmlsZVdyaXRlcn0gZnJvbSAnLi9pbl9wbGFjZV9maWxlX3dyaXRlcic7XG5pbXBvcnQge1BhY2thZ2VKc29uVXBkYXRlcn0gZnJvbSAnLi9wYWNrYWdlX2pzb25fdXBkYXRlcic7XG5cbmV4cG9ydCBjb25zdCBOR0NDX0RJUkVDVE9SWSA9ICdfX2l2eV9uZ2NjX18nO1xuZXhwb3J0IGNvbnN0IE5HQ0NfUFJPUEVSVFlfRVhURU5TSU9OID0gJ19pdnlfbmdjYyc7XG5cbi8qKlxuICogVGhpcyBGaWxlV3JpdGVyIGNyZWF0ZXMgYSBjb3B5IG9mIHRoZSBvcmlnaW5hbCBlbnRyeS1wb2ludCwgdGhlbiB3cml0ZXMgdGhlIHRyYW5zZm9ybWVkXG4gKiBmaWxlcyBvbnRvIHRoZSBmaWxlcyBpbiB0aGlzIGNvcHksIGFuZCBmaW5hbGx5IHVwZGF0ZXMgdGhlIHBhY2thZ2UuanNvbiB3aXRoIGEgbmV3XG4gKiBlbnRyeS1wb2ludCBmb3JtYXQgcHJvcGVydHkgdGhhdCBwb2ludHMgdG8gdGhpcyBuZXcgZW50cnktcG9pbnQuXG4gKlxuICogSWYgdGhlcmUgYXJlIHRyYW5zZm9ybWVkIHR5cGluZ3MgZmlsZXMgaW4gdGhpcyBidW5kbGUsIHRoZXkgYXJlIHVwZGF0ZWQgaW4tcGxhY2UgKHNlZSB0aGVcbiAqIGBJblBsYWNlRmlsZVdyaXRlcmApLlxuICovXG5leHBvcnQgY2xhc3MgTmV3RW50cnlQb2ludEZpbGVXcml0ZXIgZXh0ZW5kcyBJblBsYWNlRmlsZVdyaXRlciB7XG4gIGNvbnN0cnVjdG9yKGZzOiBGaWxlU3lzdGVtLCBwcml2YXRlIHBrZ0pzb25VcGRhdGVyOiBQYWNrYWdlSnNvblVwZGF0ZXIpIHsgc3VwZXIoZnMpOyB9XG5cbiAgd3JpdGVCdW5kbGUoXG4gICAgICBidW5kbGU6IEVudHJ5UG9pbnRCdW5kbGUsIHRyYW5zZm9ybWVkRmlsZXM6IEZpbGVUb1dyaXRlW10sXG4gICAgICBmb3JtYXRQcm9wZXJ0aWVzOiBFbnRyeVBvaW50SnNvblByb3BlcnR5W10pIHtcbiAgICAvLyBUaGUgbmV3IGZvbGRlciBpcyBhdCB0aGUgcm9vdCBvZiB0aGUgb3ZlcmFsbCBwYWNrYWdlXG4gICAgY29uc3QgZW50cnlQb2ludCA9IGJ1bmRsZS5lbnRyeVBvaW50O1xuICAgIGNvbnN0IG5nY2NGb2xkZXIgPSBqb2luKGVudHJ5UG9pbnQucGFja2FnZSwgTkdDQ19ESVJFQ1RPUlkpO1xuICAgIHRoaXMuY29weUJ1bmRsZShidW5kbGUsIGVudHJ5UG9pbnQucGFja2FnZSwgbmdjY0ZvbGRlcik7XG4gICAgdHJhbnNmb3JtZWRGaWxlcy5mb3JFYWNoKGZpbGUgPT4gdGhpcy53cml0ZUZpbGUoZmlsZSwgZW50cnlQb2ludC5wYWNrYWdlLCBuZ2NjRm9sZGVyKSk7XG4gICAgdGhpcy51cGRhdGVQYWNrYWdlSnNvbihlbnRyeVBvaW50LCBmb3JtYXRQcm9wZXJ0aWVzLCBuZ2NjRm9sZGVyKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjb3B5QnVuZGxlKFxuICAgICAgYnVuZGxlOiBFbnRyeVBvaW50QnVuZGxlLCBwYWNrYWdlUGF0aDogQWJzb2x1dGVGc1BhdGgsIG5nY2NGb2xkZXI6IEFic29sdXRlRnNQYXRoKSB7XG4gICAgYnVuZGxlLnNyYy5wcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkuZm9yRWFjaChzb3VyY2VGaWxlID0+IHtcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlKHBhY2thZ2VQYXRoLCBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNvdXJjZUZpbGUpKTtcbiAgICAgIGNvbnN0IGlzT3V0c2lkZVBhY2thZ2UgPSByZWxhdGl2ZVBhdGguc3RhcnRzV2l0aCgnLi4nKTtcbiAgICAgIGlmICghc291cmNlRmlsZS5pc0RlY2xhcmF0aW9uRmlsZSAmJiAhaXNPdXRzaWRlUGFja2FnZSkge1xuICAgICAgICBjb25zdCBuZXdGaWxlUGF0aCA9IGpvaW4obmdjY0ZvbGRlciwgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgdGhpcy5mcy5lbnN1cmVEaXIoZGlybmFtZShuZXdGaWxlUGF0aCkpO1xuICAgICAgICB0aGlzLmZzLmNvcHlGaWxlKGFic29sdXRlRnJvbVNvdXJjZUZpbGUoc291cmNlRmlsZSksIG5ld0ZpbGVQYXRoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByb3RlY3RlZCB3cml0ZUZpbGUoZmlsZTogRmlsZVRvV3JpdGUsIHBhY2thZ2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgbmdjY0ZvbGRlcjogQWJzb2x1dGVGc1BhdGgpOlxuICAgICAgdm9pZCB7XG4gICAgaWYgKGlzRHRzUGF0aChmaWxlLnBhdGgucmVwbGFjZSgvXFwubWFwJC8sICcnKSkpIHtcbiAgICAgIC8vIFRoaXMgaXMgZWl0aGVyIGAuZC50c2Agb3IgYC5kLnRzLm1hcGAgZmlsZVxuICAgICAgc3VwZXIud3JpdGVGaWxlQW5kQmFja3VwKGZpbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSByZWxhdGl2ZShwYWNrYWdlUGF0aCwgZmlsZS5wYXRoKTtcbiAgICAgIGNvbnN0IG5ld0ZpbGVQYXRoID0gam9pbihuZ2NjRm9sZGVyLCByZWxhdGl2ZVBhdGgpO1xuICAgICAgdGhpcy5mcy5lbnN1cmVEaXIoZGlybmFtZShuZXdGaWxlUGF0aCkpO1xuICAgICAgdGhpcy5mcy53cml0ZUZpbGUobmV3RmlsZVBhdGgsIGZpbGUuY29udGVudHMpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCB1cGRhdGVQYWNrYWdlSnNvbihcbiAgICAgIGVudHJ5UG9pbnQ6IEVudHJ5UG9pbnQsIGZvcm1hdFByb3BlcnRpZXM6IEVudHJ5UG9pbnRKc29uUHJvcGVydHlbXSxcbiAgICAgIG5nY2NGb2xkZXI6IEFic29sdXRlRnNQYXRoKSB7XG4gICAgaWYgKGZvcm1hdFByb3BlcnRpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBObyBmb3JtYXQgcHJvcGVydGllcyBuZWVkIHVwZGF0aW5nLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhY2thZ2VKc29uID0gZW50cnlQb2ludC5wYWNrYWdlSnNvbjtcbiAgICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSBqb2luKGVudHJ5UG9pbnQucGF0aCwgJ3BhY2thZ2UuanNvbicpO1xuXG4gICAgLy8gQWxsIGZvcm1hdCBwcm9wZXJ0aWVzIHBvaW50IHRvIHRoZSBzYW1lIGZvcm1hdC1wYXRoLlxuICAgIGNvbnN0IG9sZEZvcm1hdFByb3AgPSBmb3JtYXRQcm9wZXJ0aWVzWzBdICE7XG4gICAgY29uc3Qgb2xkRm9ybWF0UGF0aCA9IHBhY2thZ2VKc29uW29sZEZvcm1hdFByb3BdICE7XG4gICAgY29uc3Qgb2xkQWJzRm9ybWF0UGF0aCA9IGpvaW4oZW50cnlQb2ludC5wYXRoLCBvbGRGb3JtYXRQYXRoKTtcbiAgICBjb25zdCBuZXdBYnNGb3JtYXRQYXRoID0gam9pbihuZ2NjRm9sZGVyLCByZWxhdGl2ZShlbnRyeVBvaW50LnBhY2thZ2UsIG9sZEFic0Zvcm1hdFBhdGgpKTtcbiAgICBjb25zdCBuZXdGb3JtYXRQYXRoID0gcmVsYXRpdmUoZW50cnlQb2ludC5wYXRoLCBuZXdBYnNGb3JtYXRQYXRoKTtcblxuICAgIC8vIFVwZGF0ZSBhbGwgcHJvcGVydGllcyBpbiBgcGFja2FnZS5qc29uYCAoYm90aCBpbiBtZW1vcnkgYW5kIG9uIGRpc2spLlxuICAgIGNvbnN0IHVwZGF0ZSA9IHRoaXMucGtnSnNvblVwZGF0ZXIuY3JlYXRlVXBkYXRlKCk7XG5cbiAgICBmb3IgKGNvbnN0IGZvcm1hdFByb3BlcnR5IG9mIGZvcm1hdFByb3BlcnRpZXMpIHtcbiAgICAgIGlmIChwYWNrYWdlSnNvbltmb3JtYXRQcm9wZXJ0eV0gIT09IG9sZEZvcm1hdFBhdGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byB1cGRhdGUgJyR7cGFja2FnZUpzb25QYXRofSc6IEZvcm1hdCBwcm9wZXJ0aWVzIGAgK1xuICAgICAgICAgICAgYCgke2Zvcm1hdFByb3BlcnRpZXMuam9pbignLCAnKX0pIG1hcCB0byBtb3JlIHRoYW4gb25lIGZvcm1hdC1wYXRoLmApO1xuICAgICAgfVxuXG4gICAgICB1cGRhdGUuYWRkQ2hhbmdlKFxuICAgICAgICAgIFtgJHtmb3JtYXRQcm9wZXJ0eX0ke05HQ0NfUFJPUEVSVFlfRVhURU5TSU9OfWBdLCBuZXdGb3JtYXRQYXRoLCB7YmVmb3JlOiBmb3JtYXRQcm9wZXJ0eX0pO1xuICAgIH1cblxuICAgIHVwZGF0ZS53cml0ZUNoYW5nZXMocGFja2FnZUpzb25QYXRoLCBwYWNrYWdlSnNvbik7XG4gIH1cbn1cbiJdfQ==