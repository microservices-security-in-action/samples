(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/packages/entry_point_bundle", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/packages/bundle_program", "@angular/compiler-cli/ngcc/src/packages/ngcc_compiler_host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var bundle_program_1 = require("@angular/compiler-cli/ngcc/src/packages/bundle_program");
    var ngcc_compiler_host_1 = require("@angular/compiler-cli/ngcc/src/packages/ngcc_compiler_host");
    /**
     * Get an object that describes a formatted bundle for an entry-point.
     * @param fs The current file-system being used.
     * @param entryPoint The entry-point that contains the bundle.
     * @param formatPath The path to the source files for this bundle.
     * @param isCore This entry point is the Angular core package.
     * @param format The underlying format of the bundle.
     * @param transformDts Whether to transform the typings along with this bundle.
     * @param pathMappings An optional set of mappings to use when compiling files.
     * @param mirrorDtsFromSrc If true then the `dts` program will contain additional files that
     * were guessed by mapping the `src` files to `dts` files.
     * @param enableI18nLegacyMessageIdFormat Whether to render legacy message ids for i18n messages in
     * component templates.
     */
    function makeEntryPointBundle(fs, entryPoint, formatPath, isCore, format, transformDts, pathMappings, mirrorDtsFromSrc, enableI18nLegacyMessageIdFormat) {
        if (mirrorDtsFromSrc === void 0) { mirrorDtsFromSrc = false; }
        if (enableI18nLegacyMessageIdFormat === void 0) { enableI18nLegacyMessageIdFormat = true; }
        // Create the TS program and necessary helpers.
        var rootDir = entryPoint.package;
        var options = tslib_1.__assign({ allowJs: true, maxNodeModuleJsDepth: Infinity, rootDir: rootDir }, pathMappings);
        var srcHost = new ngcc_compiler_host_1.NgccSourcesCompilerHost(fs, options, entryPoint.path);
        var dtsHost = new file_system_1.NgtscCompilerHost(fs, options);
        // Create the bundle programs, as necessary.
        var absFormatPath = fs.resolve(entryPoint.path, formatPath);
        var typingsPath = fs.resolve(entryPoint.path, entryPoint.typings);
        var src = bundle_program_1.makeBundleProgram(fs, isCore, entryPoint.package, absFormatPath, 'r3_symbols.js', options, srcHost);
        var additionalDtsFiles = transformDts && mirrorDtsFromSrc ?
            computePotentialDtsFilesFromJsFiles(fs, src.program, absFormatPath, typingsPath) :
            [];
        var dts = transformDts ? bundle_program_1.makeBundleProgram(fs, isCore, entryPoint.package, typingsPath, 'r3_symbols.d.ts', options, dtsHost, additionalDtsFiles) :
            null;
        var isFlatCore = isCore && src.r3SymbolsFile === null;
        return {
            entryPoint: entryPoint,
            format: format,
            rootDirs: [rootDir], isCore: isCore, isFlatCore: isFlatCore, src: src, dts: dts, enableI18nLegacyMessageIdFormat: enableI18nLegacyMessageIdFormat
        };
    }
    exports.makeEntryPointBundle = makeEntryPointBundle;
    function computePotentialDtsFilesFromJsFiles(fs, srcProgram, formatPath, typingsPath) {
        var e_1, _a;
        var formatRoot = fs.dirname(formatPath);
        var typingsRoot = fs.dirname(typingsPath);
        var additionalFiles = [];
        try {
            for (var _b = tslib_1.__values(srcProgram.getSourceFiles()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var sf = _c.value;
                if (!sf.fileName.endsWith('.js')) {
                    continue;
                }
                // Given a source file at e.g. `esm2015/src/some/nested/index.js`, try to resolve the
                // declaration file under the typings root in `src/some/nested/index.d.ts`.
                var mirroredDtsPath = fs.resolve(typingsRoot, fs.relative(formatRoot, sf.fileName.replace(/\.js$/, '.d.ts')));
                if (fs.exists(mirroredDtsPath)) {
                    additionalFiles.push(mirroredDtsPath);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return additionalFiles;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlfcG9pbnRfYnVuZGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL3BhY2thZ2VzL2VudHJ5X3BvaW50X2J1bmRsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFRQSwyRUFBNkY7SUFFN0YseUZBQWtFO0lBRWxFLGlHQUE2RDtJQWlCN0Q7Ozs7Ozs7Ozs7Ozs7T0FhRztJQUNILFNBQWdCLG9CQUFvQixDQUNoQyxFQUFjLEVBQUUsVUFBc0IsRUFBRSxVQUFrQixFQUFFLE1BQWUsRUFDM0UsTUFBd0IsRUFBRSxZQUFxQixFQUFFLFlBQTJCLEVBQzVFLGdCQUFpQyxFQUNqQywrQkFBK0M7UUFEL0MsaUNBQUEsRUFBQSx3QkFBaUM7UUFDakMsZ0RBQUEsRUFBQSxzQ0FBK0M7UUFDakQsK0NBQStDO1FBQy9DLElBQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7UUFDbkMsSUFBTSxPQUFPLHNCQUNYLE9BQU8sRUFBRSxJQUFJLEVBQ2Isb0JBQW9CLEVBQUUsUUFBUSxFQUFFLE9BQU8sU0FBQSxJQUFLLFlBQVksQ0FDekQsQ0FBQztRQUNGLElBQU0sT0FBTyxHQUFHLElBQUksNENBQXVCLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUUsSUFBTSxPQUFPLEdBQUcsSUFBSSwrQkFBaUIsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFbkQsNENBQTRDO1FBQzVDLElBQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM5RCxJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BFLElBQU0sR0FBRyxHQUFHLGtDQUFpQixDQUN6QixFQUFFLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEYsSUFBTSxrQkFBa0IsR0FBRyxZQUFZLElBQUksZ0JBQWdCLENBQUMsQ0FBQztZQUN6RCxtQ0FBbUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNsRixFQUFFLENBQUM7UUFDUCxJQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLGtDQUFpQixDQUNiLEVBQUUsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQzlELE9BQU8sRUFBRSxPQUFPLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQztRQUNoQyxJQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksR0FBRyxDQUFDLGFBQWEsS0FBSyxJQUFJLENBQUM7UUFFeEQsT0FBTztZQUNMLFVBQVUsWUFBQTtZQUNWLE1BQU0sUUFBQTtZQUNOLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sUUFBQSxFQUFFLFVBQVUsWUFBQSxFQUFFLEdBQUcsS0FBQSxFQUFFLEdBQUcsS0FBQSxFQUFFLCtCQUErQixpQ0FBQTtTQUNuRixDQUFDO0lBQ0osQ0FBQztJQWpDRCxvREFpQ0M7SUFFRCxTQUFTLG1DQUFtQyxDQUN4QyxFQUFjLEVBQUUsVUFBc0IsRUFBRSxVQUEwQixFQUNsRSxXQUEyQjs7UUFDN0IsSUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMxQyxJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVDLElBQU0sZUFBZSxHQUFxQixFQUFFLENBQUM7O1lBQzdDLEtBQWlCLElBQUEsS0FBQSxpQkFBQSxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUEsZ0JBQUEsNEJBQUU7Z0JBQXpDLElBQU0sRUFBRSxXQUFBO2dCQUNYLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDaEMsU0FBUztpQkFDVjtnQkFFRCxxRkFBcUY7Z0JBQ3JGLDJFQUEyRTtnQkFDM0UsSUFBTSxlQUFlLEdBQ2pCLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVGLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBRTtvQkFDOUIsZUFBZSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztpQkFDdkM7YUFDRjs7Ozs7Ozs7O1FBQ0QsT0FBTyxlQUFlLENBQUM7SUFDekIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgRmlsZVN5c3RlbSwgTmd0c2NDb21waWxlckhvc3R9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge1BhdGhNYXBwaW5nc30gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHtCdW5kbGVQcm9ncmFtLCBtYWtlQnVuZGxlUHJvZ3JhbX0gZnJvbSAnLi9idW5kbGVfcHJvZ3JhbSc7XG5pbXBvcnQge0VudHJ5UG9pbnQsIEVudHJ5UG9pbnRGb3JtYXR9IGZyb20gJy4vZW50cnlfcG9pbnQnO1xuaW1wb3J0IHtOZ2NjU291cmNlc0NvbXBpbGVySG9zdH0gZnJvbSAnLi9uZ2NjX2NvbXBpbGVyX2hvc3QnO1xuXG4vKipcbiAqIEEgYnVuZGxlIG9mIGZpbGVzIGFuZCBwYXRocyAoYW5kIFRTIHByb2dyYW1zKSB0aGF0IGNvcnJlc3BvbmQgdG8gYSBwYXJ0aWN1bGFyXG4gKiBmb3JtYXQgb2YgYSBwYWNrYWdlIGVudHJ5LXBvaW50LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVudHJ5UG9pbnRCdW5kbGUge1xuICBlbnRyeVBvaW50OiBFbnRyeVBvaW50O1xuICBmb3JtYXQ6IEVudHJ5UG9pbnRGb3JtYXQ7XG4gIGlzQ29yZTogYm9vbGVhbjtcbiAgaXNGbGF0Q29yZTogYm9vbGVhbjtcbiAgcm9vdERpcnM6IEFic29sdXRlRnNQYXRoW107XG4gIHNyYzogQnVuZGxlUHJvZ3JhbTtcbiAgZHRzOiBCdW5kbGVQcm9ncmFtfG51bGw7XG4gIGVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQ6IGJvb2xlYW47XG59XG5cbi8qKlxuICogR2V0IGFuIG9iamVjdCB0aGF0IGRlc2NyaWJlcyBhIGZvcm1hdHRlZCBidW5kbGUgZm9yIGFuIGVudHJ5LXBvaW50LlxuICogQHBhcmFtIGZzIFRoZSBjdXJyZW50IGZpbGUtc3lzdGVtIGJlaW5nIHVzZWQuXG4gKiBAcGFyYW0gZW50cnlQb2ludCBUaGUgZW50cnktcG9pbnQgdGhhdCBjb250YWlucyB0aGUgYnVuZGxlLlxuICogQHBhcmFtIGZvcm1hdFBhdGggVGhlIHBhdGggdG8gdGhlIHNvdXJjZSBmaWxlcyBmb3IgdGhpcyBidW5kbGUuXG4gKiBAcGFyYW0gaXNDb3JlIFRoaXMgZW50cnkgcG9pbnQgaXMgdGhlIEFuZ3VsYXIgY29yZSBwYWNrYWdlLlxuICogQHBhcmFtIGZvcm1hdCBUaGUgdW5kZXJseWluZyBmb3JtYXQgb2YgdGhlIGJ1bmRsZS5cbiAqIEBwYXJhbSB0cmFuc2Zvcm1EdHMgV2hldGhlciB0byB0cmFuc2Zvcm0gdGhlIHR5cGluZ3MgYWxvbmcgd2l0aCB0aGlzIGJ1bmRsZS5cbiAqIEBwYXJhbSBwYXRoTWFwcGluZ3MgQW4gb3B0aW9uYWwgc2V0IG9mIG1hcHBpbmdzIHRvIHVzZSB3aGVuIGNvbXBpbGluZyBmaWxlcy5cbiAqIEBwYXJhbSBtaXJyb3JEdHNGcm9tU3JjIElmIHRydWUgdGhlbiB0aGUgYGR0c2AgcHJvZ3JhbSB3aWxsIGNvbnRhaW4gYWRkaXRpb25hbCBmaWxlcyB0aGF0XG4gKiB3ZXJlIGd1ZXNzZWQgYnkgbWFwcGluZyB0aGUgYHNyY2AgZmlsZXMgdG8gYGR0c2AgZmlsZXMuXG4gKiBAcGFyYW0gZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdCBXaGV0aGVyIHRvIHJlbmRlciBsZWdhY3kgbWVzc2FnZSBpZHMgZm9yIGkxOG4gbWVzc2FnZXMgaW5cbiAqIGNvbXBvbmVudCB0ZW1wbGF0ZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlRW50cnlQb2ludEJ1bmRsZShcbiAgICBmczogRmlsZVN5c3RlbSwgZW50cnlQb2ludDogRW50cnlQb2ludCwgZm9ybWF0UGF0aDogc3RyaW5nLCBpc0NvcmU6IGJvb2xlYW4sXG4gICAgZm9ybWF0OiBFbnRyeVBvaW50Rm9ybWF0LCB0cmFuc2Zvcm1EdHM6IGJvb2xlYW4sIHBhdGhNYXBwaW5ncz86IFBhdGhNYXBwaW5ncyxcbiAgICBtaXJyb3JEdHNGcm9tU3JjOiBib29sZWFuID0gZmFsc2UsXG4gICAgZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdDogYm9vbGVhbiA9IHRydWUpOiBFbnRyeVBvaW50QnVuZGxlIHtcbiAgLy8gQ3JlYXRlIHRoZSBUUyBwcm9ncmFtIGFuZCBuZWNlc3NhcnkgaGVscGVycy5cbiAgY29uc3Qgcm9vdERpciA9IGVudHJ5UG9pbnQucGFja2FnZTtcbiAgY29uc3Qgb3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zID0ge1xuICAgIGFsbG93SnM6IHRydWUsXG4gICAgbWF4Tm9kZU1vZHVsZUpzRGVwdGg6IEluZmluaXR5LCByb290RGlyLCAuLi5wYXRoTWFwcGluZ3NcbiAgfTtcbiAgY29uc3Qgc3JjSG9zdCA9IG5ldyBOZ2NjU291cmNlc0NvbXBpbGVySG9zdChmcywgb3B0aW9ucywgZW50cnlQb2ludC5wYXRoKTtcbiAgY29uc3QgZHRzSG9zdCA9IG5ldyBOZ3RzY0NvbXBpbGVySG9zdChmcywgb3B0aW9ucyk7XG5cbiAgLy8gQ3JlYXRlIHRoZSBidW5kbGUgcHJvZ3JhbXMsIGFzIG5lY2Vzc2FyeS5cbiAgY29uc3QgYWJzRm9ybWF0UGF0aCA9IGZzLnJlc29sdmUoZW50cnlQb2ludC5wYXRoLCBmb3JtYXRQYXRoKTtcbiAgY29uc3QgdHlwaW5nc1BhdGggPSBmcy5yZXNvbHZlKGVudHJ5UG9pbnQucGF0aCwgZW50cnlQb2ludC50eXBpbmdzKTtcbiAgY29uc3Qgc3JjID0gbWFrZUJ1bmRsZVByb2dyYW0oXG4gICAgICBmcywgaXNDb3JlLCBlbnRyeVBvaW50LnBhY2thZ2UsIGFic0Zvcm1hdFBhdGgsICdyM19zeW1ib2xzLmpzJywgb3B0aW9ucywgc3JjSG9zdCk7XG4gIGNvbnN0IGFkZGl0aW9uYWxEdHNGaWxlcyA9IHRyYW5zZm9ybUR0cyAmJiBtaXJyb3JEdHNGcm9tU3JjID9cbiAgICAgIGNvbXB1dGVQb3RlbnRpYWxEdHNGaWxlc0Zyb21Kc0ZpbGVzKGZzLCBzcmMucHJvZ3JhbSwgYWJzRm9ybWF0UGF0aCwgdHlwaW5nc1BhdGgpIDpcbiAgICAgIFtdO1xuICBjb25zdCBkdHMgPSB0cmFuc2Zvcm1EdHMgPyBtYWtlQnVuZGxlUHJvZ3JhbShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZzLCBpc0NvcmUsIGVudHJ5UG9pbnQucGFja2FnZSwgdHlwaW5nc1BhdGgsICdyM19zeW1ib2xzLmQudHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucywgZHRzSG9zdCwgYWRkaXRpb25hbER0c0ZpbGVzKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGw7XG4gIGNvbnN0IGlzRmxhdENvcmUgPSBpc0NvcmUgJiYgc3JjLnIzU3ltYm9sc0ZpbGUgPT09IG51bGw7XG5cbiAgcmV0dXJuIHtcbiAgICBlbnRyeVBvaW50LFxuICAgIGZvcm1hdCxcbiAgICByb290RGlyczogW3Jvb3REaXJdLCBpc0NvcmUsIGlzRmxhdENvcmUsIHNyYywgZHRzLCBlbmFibGVJMThuTGVnYWN5TWVzc2FnZUlkRm9ybWF0XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVQb3RlbnRpYWxEdHNGaWxlc0Zyb21Kc0ZpbGVzKFxuICAgIGZzOiBGaWxlU3lzdGVtLCBzcmNQcm9ncmFtOiB0cy5Qcm9ncmFtLCBmb3JtYXRQYXRoOiBBYnNvbHV0ZUZzUGF0aCxcbiAgICB0eXBpbmdzUGF0aDogQWJzb2x1dGVGc1BhdGgpIHtcbiAgY29uc3QgZm9ybWF0Um9vdCA9IGZzLmRpcm5hbWUoZm9ybWF0UGF0aCk7XG4gIGNvbnN0IHR5cGluZ3NSb290ID0gZnMuZGlybmFtZSh0eXBpbmdzUGF0aCk7XG4gIGNvbnN0IGFkZGl0aW9uYWxGaWxlczogQWJzb2x1dGVGc1BhdGhbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHNmIG9mIHNyY1Byb2dyYW0uZ2V0U291cmNlRmlsZXMoKSkge1xuICAgIGlmICghc2YuZmlsZU5hbWUuZW5kc1dpdGgoJy5qcycpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBHaXZlbiBhIHNvdXJjZSBmaWxlIGF0IGUuZy4gYGVzbTIwMTUvc3JjL3NvbWUvbmVzdGVkL2luZGV4LmpzYCwgdHJ5IHRvIHJlc29sdmUgdGhlXG4gICAgLy8gZGVjbGFyYXRpb24gZmlsZSB1bmRlciB0aGUgdHlwaW5ncyByb290IGluIGBzcmMvc29tZS9uZXN0ZWQvaW5kZXguZC50c2AuXG4gICAgY29uc3QgbWlycm9yZWREdHNQYXRoID1cbiAgICAgICAgZnMucmVzb2x2ZSh0eXBpbmdzUm9vdCwgZnMucmVsYXRpdmUoZm9ybWF0Um9vdCwgc2YuZmlsZU5hbWUucmVwbGFjZSgvXFwuanMkLywgJy5kLnRzJykpKTtcbiAgICBpZiAoZnMuZXhpc3RzKG1pcnJvcmVkRHRzUGF0aCkpIHtcbiAgICAgIGFkZGl0aW9uYWxGaWxlcy5wdXNoKG1pcnJvcmVkRHRzUGF0aCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBhZGRpdGlvbmFsRmlsZXM7XG59XG4iXX0=