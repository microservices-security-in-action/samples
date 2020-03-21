(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/rendering/source_maps", ["require", "exports", "convert-source-map", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/sourcemaps/source_file_loader"], factory);
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
    var convert_source_map_1 = require("convert-source-map");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var source_file_loader_1 = require("@angular/compiler-cli/ngcc/src/sourcemaps/source_file_loader");
    /**
     * Merge the input and output source-maps, replacing the source-map comment in the output file
     * with an appropriate source-map comment pointing to the merged source-map.
     */
    function renderSourceAndMap(logger, fs, sourceFile, generatedMagicString) {
        var _a;
        var generatedPath = file_system_1.absoluteFromSourceFile(sourceFile);
        var generatedMapPath = file_system_1.absoluteFrom(generatedPath + ".map");
        var generatedContent = generatedMagicString.toString();
        var generatedMap = generatedMagicString.generateMap({ file: generatedPath, source: generatedPath, includeContent: true });
        try {
            var loader = new source_file_loader_1.SourceFileLoader(fs);
            var generatedFile = loader.loadSourceFile(generatedPath, generatedContent, { map: generatedMap, mapPath: generatedMapPath });
            var rawMergedMap = generatedFile.renderFlattenedSourceMap();
            var mergedMap = convert_source_map_1.fromObject(rawMergedMap);
            if ((_a = generatedFile.sources[0]) === null || _a === void 0 ? void 0 : _a.inline) {
                // The input source-map was inline so make the output one inline too.
                return [
                    { path: generatedPath, contents: generatedFile.contents + "\n" + mergedMap.toComment() }
                ];
            }
            else {
                var sourceMapComment = convert_source_map_1.generateMapFileComment(file_system_1.basename(generatedPath) + ".map");
                return [
                    { path: generatedPath, contents: generatedFile.contents + "\n" + sourceMapComment },
                    { path: generatedMapPath, contents: mergedMap.toJSON() }
                ];
            }
        }
        catch (e) {
            logger.error("Error when flattening the source-map \"" + generatedMapPath + "\" for \"" + generatedPath + "\": " + e.toString());
            return [
                { path: generatedPath, contents: generatedContent },
                { path: generatedMapPath, contents: convert_source_map_1.fromObject(generatedMap).toJSON() },
            ];
        }
    }
    exports.renderSourceAndMap = renderSourceAndMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX21hcHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcmVuZGVyaW5nL3NvdXJjZV9tYXBzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gseURBQTBGO0lBRzFGLDJFQUEwRztJQUUxRyxtR0FBa0U7SUFVbEU7OztPQUdHO0lBQ0gsU0FBZ0Isa0JBQWtCLENBQzlCLE1BQWMsRUFBRSxFQUFjLEVBQUUsVUFBeUIsRUFDekQsb0JBQWlDOztRQUNuQyxJQUFNLGFBQWEsR0FBRyxvQ0FBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RCxJQUFNLGdCQUFnQixHQUFHLDBCQUFZLENBQUksYUFBYSxTQUFNLENBQUMsQ0FBQztRQUM5RCxJQUFNLGdCQUFnQixHQUFHLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3pELElBQU0sWUFBWSxHQUFpQixvQkFBb0IsQ0FBQyxXQUFXLENBQy9ELEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBRXhFLElBQUk7WUFDRixJQUFNLE1BQU0sR0FBRyxJQUFJLHFDQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hDLElBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQ3ZDLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxFQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFDLENBQUMsQ0FBQztZQUVyRixJQUFNLFlBQVksR0FBaUIsYUFBYSxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDNUUsSUFBTSxTQUFTLEdBQUcsK0JBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMzQyxVQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLDBDQUFFLE1BQU0sRUFBRTtnQkFDcEMscUVBQXFFO2dCQUNyRSxPQUFPO29CQUNMLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUssYUFBYSxDQUFDLFFBQVEsVUFBSyxTQUFTLENBQUMsU0FBUyxFQUFJLEVBQUM7aUJBQ3ZGLENBQUM7YUFDSDtpQkFBTTtnQkFDTCxJQUFNLGdCQUFnQixHQUFHLDJDQUFzQixDQUFJLHNCQUFRLENBQUMsYUFBYSxDQUFDLFNBQU0sQ0FBQyxDQUFDO2dCQUNsRixPQUFPO29CQUNMLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUssYUFBYSxDQUFDLFFBQVEsVUFBSyxnQkFBa0IsRUFBQztvQkFDakYsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBQztpQkFDdkQsQ0FBQzthQUNIO1NBQ0Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE1BQU0sQ0FBQyxLQUFLLENBQ1IsNENBQXlDLGdCQUFnQixpQkFBVSxhQUFhLFlBQU0sQ0FBQyxDQUFDLFFBQVEsRUFBSSxDQUFDLENBQUM7WUFDMUcsT0FBTztnQkFDTCxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFDO2dCQUNqRCxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsK0JBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBQzthQUN0RSxDQUFDO1NBQ0g7SUFDSCxDQUFDO0lBcENELGdEQW9DQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7U291cmNlTWFwQ29udmVydGVyLCBmcm9tT2JqZWN0LCBnZW5lcmF0ZU1hcEZpbGVDb21tZW50fSBmcm9tICdjb252ZXJ0LXNvdXJjZS1tYXAnO1xuaW1wb3J0IE1hZ2ljU3RyaW5nIGZyb20gJ21hZ2ljLXN0cmluZyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7RmlsZVN5c3RlbSwgYWJzb2x1dGVGcm9tU291cmNlRmlsZSwgYmFzZW5hbWUsIGFic29sdXRlRnJvbX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7RmlsZVRvV3JpdGV9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtTb3VyY2VGaWxlTG9hZGVyfSBmcm9tICcuLi9zb3VyY2VtYXBzL3NvdXJjZV9maWxlX2xvYWRlcic7XG5pbXBvcnQge1Jhd1NvdXJjZU1hcH0gZnJvbSAnLi4vc291cmNlbWFwcy9yYXdfc291cmNlX21hcCc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXInO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNvdXJjZU1hcEluZm8ge1xuICBzb3VyY2U6IHN0cmluZztcbiAgbWFwOiBTb3VyY2VNYXBDb252ZXJ0ZXJ8bnVsbDtcbiAgaXNJbmxpbmU6IGJvb2xlYW47XG59XG5cbi8qKlxuICogTWVyZ2UgdGhlIGlucHV0IGFuZCBvdXRwdXQgc291cmNlLW1hcHMsIHJlcGxhY2luZyB0aGUgc291cmNlLW1hcCBjb21tZW50IGluIHRoZSBvdXRwdXQgZmlsZVxuICogd2l0aCBhbiBhcHByb3ByaWF0ZSBzb3VyY2UtbWFwIGNvbW1lbnQgcG9pbnRpbmcgdG8gdGhlIG1lcmdlZCBzb3VyY2UtbWFwLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyU291cmNlQW5kTWFwKFxuICAgIGxvZ2dlcjogTG9nZ2VyLCBmczogRmlsZVN5c3RlbSwgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSxcbiAgICBnZW5lcmF0ZWRNYWdpY1N0cmluZzogTWFnaWNTdHJpbmcpOiBGaWxlVG9Xcml0ZVtdIHtcbiAgY29uc3QgZ2VuZXJhdGVkUGF0aCA9IGFic29sdXRlRnJvbVNvdXJjZUZpbGUoc291cmNlRmlsZSk7XG4gIGNvbnN0IGdlbmVyYXRlZE1hcFBhdGggPSBhYnNvbHV0ZUZyb20oYCR7Z2VuZXJhdGVkUGF0aH0ubWFwYCk7XG4gIGNvbnN0IGdlbmVyYXRlZENvbnRlbnQgPSBnZW5lcmF0ZWRNYWdpY1N0cmluZy50b1N0cmluZygpO1xuICBjb25zdCBnZW5lcmF0ZWRNYXA6IFJhd1NvdXJjZU1hcCA9IGdlbmVyYXRlZE1hZ2ljU3RyaW5nLmdlbmVyYXRlTWFwKFxuICAgICAge2ZpbGU6IGdlbmVyYXRlZFBhdGgsIHNvdXJjZTogZ2VuZXJhdGVkUGF0aCwgaW5jbHVkZUNvbnRlbnQ6IHRydWV9KTtcblxuICB0cnkge1xuICAgIGNvbnN0IGxvYWRlciA9IG5ldyBTb3VyY2VGaWxlTG9hZGVyKGZzKTtcbiAgICBjb25zdCBnZW5lcmF0ZWRGaWxlID0gbG9hZGVyLmxvYWRTb3VyY2VGaWxlKFxuICAgICAgICBnZW5lcmF0ZWRQYXRoLCBnZW5lcmF0ZWRDb250ZW50LCB7bWFwOiBnZW5lcmF0ZWRNYXAsIG1hcFBhdGg6IGdlbmVyYXRlZE1hcFBhdGh9KTtcblxuICAgIGNvbnN0IHJhd01lcmdlZE1hcDogUmF3U291cmNlTWFwID0gZ2VuZXJhdGVkRmlsZS5yZW5kZXJGbGF0dGVuZWRTb3VyY2VNYXAoKTtcbiAgICBjb25zdCBtZXJnZWRNYXAgPSBmcm9tT2JqZWN0KHJhd01lcmdlZE1hcCk7XG4gICAgaWYgKGdlbmVyYXRlZEZpbGUuc291cmNlc1swXT8uaW5saW5lKSB7XG4gICAgICAvLyBUaGUgaW5wdXQgc291cmNlLW1hcCB3YXMgaW5saW5lIHNvIG1ha2UgdGhlIG91dHB1dCBvbmUgaW5saW5lIHRvby5cbiAgICAgIHJldHVybiBbXG4gICAgICAgIHtwYXRoOiBnZW5lcmF0ZWRQYXRoLCBjb250ZW50czogYCR7Z2VuZXJhdGVkRmlsZS5jb250ZW50c31cXG4ke21lcmdlZE1hcC50b0NvbW1lbnQoKX1gfVxuICAgICAgXTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc291cmNlTWFwQ29tbWVudCA9IGdlbmVyYXRlTWFwRmlsZUNvbW1lbnQoYCR7YmFzZW5hbWUoZ2VuZXJhdGVkUGF0aCl9Lm1hcGApO1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAge3BhdGg6IGdlbmVyYXRlZFBhdGgsIGNvbnRlbnRzOiBgJHtnZW5lcmF0ZWRGaWxlLmNvbnRlbnRzfVxcbiR7c291cmNlTWFwQ29tbWVudH1gfSxcbiAgICAgICAge3BhdGg6IGdlbmVyYXRlZE1hcFBhdGgsIGNvbnRlbnRzOiBtZXJnZWRNYXAudG9KU09OKCl9XG4gICAgICBdO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgYEVycm9yIHdoZW4gZmxhdHRlbmluZyB0aGUgc291cmNlLW1hcCBcIiR7Z2VuZXJhdGVkTWFwUGF0aH1cIiBmb3IgXCIke2dlbmVyYXRlZFBhdGh9XCI6ICR7ZS50b1N0cmluZygpfWApO1xuICAgIHJldHVybiBbXG4gICAgICB7cGF0aDogZ2VuZXJhdGVkUGF0aCwgY29udGVudHM6IGdlbmVyYXRlZENvbnRlbnR9LFxuICAgICAge3BhdGg6IGdlbmVyYXRlZE1hcFBhdGgsIGNvbnRlbnRzOiBmcm9tT2JqZWN0KGdlbmVyYXRlZE1hcCkudG9KU09OKCl9LFxuICAgIF07XG4gIH1cbn1cbiJdfQ==