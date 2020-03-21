(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/sourcemaps/source_file_loader", ["require", "exports", "convert-source-map", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/sourcemaps/source_file"], factory);
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
    var source_file_1 = require("@angular/compiler-cli/ngcc/src/sourcemaps/source_file");
    /**
     * This class can be used to load a source file, its associated source map and any upstream sources.
     *
     * Since a source file might reference (or include) a source map, this class can load those too.
     * Since a source map might reference other source files, these are also loaded as needed.
     *
     * This is done recursively. The result is a "tree" of `SourceFile` objects, each containing
     * mappings to other `SourceFile` objects as necessary.
     */
    var SourceFileLoader = /** @class */ (function () {
        function SourceFileLoader(fs) {
            this.fs = fs;
        }
        SourceFileLoader.prototype.loadSourceFile = function (sourcePath, contents, mapAndPath, previousPaths) {
            if (contents === void 0) { contents = null; }
            if (mapAndPath === void 0) { mapAndPath = null; }
            if (previousPaths === void 0) { previousPaths = []; }
            if (contents === null) {
                if (!this.fs.exists(sourcePath)) {
                    return null;
                }
                // Track source file paths if we have loaded them from disk so that we don't get into an
                // infinite recursion
                if (previousPaths.includes(sourcePath)) {
                    throw new Error("Circular source file mapping dependency: " + previousPaths.join(' -> ') + " -> " + sourcePath);
                }
                previousPaths = previousPaths.concat([sourcePath]);
                contents = this.fs.readFile(sourcePath);
            }
            // If not provided try to load the source map based on the source itself
            if (mapAndPath === null) {
                mapAndPath = this.loadSourceMap(sourcePath, contents);
            }
            var map = null;
            var inline = true;
            var sources = [];
            if (mapAndPath !== null) {
                var basePath = mapAndPath.mapPath || sourcePath;
                sources = this.processSources(basePath, mapAndPath.map, previousPaths);
                map = mapAndPath.map;
                inline = mapAndPath.mapPath === null;
            }
            return new source_file_1.SourceFile(sourcePath, contents, map, inline, sources);
        };
        /**
         * Find the source map associated with the source file whose `sourcePath` and `contents` are
         * provided.
         *
         * Source maps can be inline, as part of a base64 encoded comment, or external as a separate file
         * whose path is indicated in a comment or implied from the name of the source file itself.
         */
        SourceFileLoader.prototype.loadSourceMap = function (sourcePath, contents) {
            var inline = convert_source_map_1.commentRegex.exec(contents);
            if (inline !== null) {
                return { map: convert_source_map_1.fromComment(inline.pop()).sourcemap, mapPath: null };
            }
            var external = convert_source_map_1.mapFileCommentRegex.exec(contents);
            if (external) {
                try {
                    var fileName = external[1] || external[2];
                    var externalMapPath = this.fs.resolve(this.fs.dirname(sourcePath), fileName);
                    return { map: this.loadRawSourceMap(externalMapPath), mapPath: externalMapPath };
                }
                catch (_a) {
                    return null;
                }
            }
            var impliedMapPath = file_system_1.absoluteFrom(sourcePath + '.map');
            if (this.fs.exists(impliedMapPath)) {
                return { map: this.loadRawSourceMap(impliedMapPath), mapPath: impliedMapPath };
            }
            return null;
        };
        /**
         * Iterate over each of the "sources" for this source file's source map, recursively loading each
         * source file and its associated source map.
         */
        SourceFileLoader.prototype.processSources = function (basePath, map, previousPaths) {
            var _this = this;
            var sourceRoot = this.fs.resolve(this.fs.dirname(basePath), map.sourceRoot || '');
            return map.sources.map(function (source, index) {
                var path = _this.fs.resolve(sourceRoot, source);
                var content = map.sourcesContent && map.sourcesContent[index] || null;
                return _this.loadSourceFile(path, content, null, previousPaths);
            });
        };
        /**
         * Load the source map from the file at `mapPath`, parsing its JSON contents into a `RawSourceMap`
         * object.
         */
        SourceFileLoader.prototype.loadRawSourceMap = function (mapPath) {
            return JSON.parse(this.fs.readFile(mapPath));
        };
        return SourceFileLoader;
    }());
    exports.SourceFileLoader = SourceFileLoader;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX2ZpbGVfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL3NvdXJjZW1hcHMvc291cmNlX2ZpbGVfbG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gseURBQWtGO0lBQ2xGLDJFQUF3RjtJQUV4RixxRkFBeUM7SUFFekM7Ozs7Ozs7O09BUUc7SUFDSDtRQUNFLDBCQUFvQixFQUFjO1lBQWQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUFHLENBQUM7UUFvQnRDLHlDQUFjLEdBQWQsVUFDSSxVQUEwQixFQUFFLFFBQTRCLEVBQUUsVUFBa0MsRUFDNUYsYUFBb0M7WUFEUix5QkFBQSxFQUFBLGVBQTRCO1lBQUUsMkJBQUEsRUFBQSxpQkFBa0M7WUFDNUYsOEJBQUEsRUFBQSxrQkFBb0M7WUFDdEMsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO2dCQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQy9CLE9BQU8sSUFBSSxDQUFDO2lCQUNiO2dCQUVELHdGQUF3RjtnQkFDeEYscUJBQXFCO2dCQUNyQixJQUFJLGFBQWEsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ3RDLE1BQU0sSUFBSSxLQUFLLENBQ1gsOENBQTRDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQU8sVUFBWSxDQUFDLENBQUM7aUJBQ2hHO2dCQUNELGFBQWEsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFFbkQsUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3pDO1lBRUQsd0VBQXdFO1lBQ3hFLElBQUksVUFBVSxL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QWMsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQztnQkFDeEUsT0FBTyxLQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ2pFLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVEOzs7V0FHRztRQUNLLDJDQUFnQixHQUF4QixVQUF5QixPQUF1QjtZQUM5QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBQ0gsdUJBQUM7SUFBRCxDQUFDLEFBaEhELElBZ0hDO0lBaEhZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Y29tbWVudFJlZ2V4LCBmcm9tQ29tbWVudCwgbWFwRmlsZUNvbW1lbnRSZWdleH0gZnJvbSAnY29udmVydC1zb3VyY2UtbWFwJztcbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIEZpbGVTeXN0ZW0sIGFic29sdXRlRnJvbX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7UmF3U291cmNlTWFwfSBmcm9tICcuL3Jhd19zb3VyY2VfbWFwJztcbmltcG9ydCB7U291cmNlRmlsZX0gZnJvbSAnLi9zb3VyY2VfZmlsZSc7XG5cbi8qKlxuICogVGhpcyBjbGFzcyBjYW4gYmUgdXNlZCB0byBsb2FkIGEgc291cmNlIGZpbGUsIGl0cyBhc3NvY2lhdGVkIHNvdXJjZSBtYXAgYW5kIGFueSB1cHN0cmVhbSBzb3VyY2VzLlxuICpcbiAqIFNpbmNlIGEgc291cmNlIGZpbGUgbWlnaHQgcmVmZXJlbmNlIChvciBpbmNsdWRlKSBhIHNvdXJjZSBtYXAsIHRoaXMgY2xhc3MgY2FuIGxvYWQgdGhvc2UgdG9vLlxuICogU2luY2UgYSBzb3VyY2UgbWFwIG1pZ2h0IHJlZmVyZW5jZSBvdGhlciBzb3VyY2UgZmlsZXMsIHRoZXNlIGFyZSBhbHNvIGxvYWRlZCBhcyBuZWVkZWQuXG4gKlxuICogVGhpcyBpcyBkb25lIHJlY3Vyc2l2ZWx5LiBUaGUgcmVzdWx0IGlzIGEgXCJ0cmVlXCIgb2YgYFNvdXJjZUZpbGVgIG9iamVjdHMsIGVhY2ggY29udGFpbmluZ1xuICogbWFwcGluZ3MgdG8gb3RoZXIgYFNvdXJjZUZpbGVgIG9iamVjdHMgYXMgbmVjZXNzYXJ5LlxuICovXG5leHBvcnQgY2xhc3MgU291cmNlRmlsZUxvYWRlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZnM6IEZpbGVTeXN0ZW0pIHt9XG5cbiAgLyoqXG4gICAqIExvYWQgYSBzb3VyY2UgZmlsZSwgY29tcHV0ZSBpdHMgc291cmNlIG1hcCwgYW5kIHJlY3Vyc2l2ZWx5IGxvYWQgYW55IHJlZmVyZW5jZWQgc291cmNlIGZpbGVzLlxuICAgKlxuICAgKiBAcGFyYW0gc291cmNlUGF0aCBUaGUgcGF0aCB0byB0aGUgc291cmNlIGZpbGUgdG8gbG9hZC5cbiAgICogQHBhcmFtIGNvbnRlbnRzIFRoZSBjb250ZW50cyBvZiB0aGUgc291cmNlIGZpbGUgdG8gbG9hZCAoaWYga25vd24pLlxuICAgKiBUaGUgY29udGVudHMgbWF5IGJlIGtub3duIGJlY2F1c2UgdGhlIHNvdXJjZSBmaWxlIHdhcyBpbmxpbmVkIGludG8gYSBzb3VyY2UgbWFwLlxuICAgKiBJZiBpdCBpcyBub3Qga25vd24gdGhlIGNvbnRlbnRzIHdpbGwgYmUgcmVhZCBmcm9tIHRoZSBmaWxlIGF0IHRoZSBgc291cmNlUGF0aGAuXG4gICAqIEBwYXJhbSBtYXBBbmRQYXRoIFRoZSByYXcgc291cmNlLW1hcCBhbmQgdGhlIHBhdGggdG8gdGhlIHNvdXJjZS1tYXAgZmlsZSwgaWYga25vd24uXG4gICAqIEBwYXJhbSBwcmV2aW91c1BhdGhzIEFuIGludGVybmFsIHBhcmFtZXRlciB1c2VkIGZvciBjeWNsaWMgZGVwZW5kZW5jeSB0cmFja2luZy5cbiAgICogQHJldHVybnMgYSBTb3VyY2VGaWxlIGlmIHRoZSBjb250ZW50IGZvciBvbmUgd2FzIHByb3ZpZGVkIG9yIGFibGUgdG8gYmUgbG9hZGVkIGZyb20gZGlzayxcbiAgICogYG51bGxgIG90aGVyd2lzZS5cbiAgICovXG4gIGxvYWRTb3VyY2VGaWxlKHNvdXJjZVBhdGg6IEFic29sdXRlRnNQYXRoLCBjb250ZW50czogc3RyaW5nLCBtYXBBbmRQYXRoOiBNYXBBbmRQYXRoKTogU291cmNlRmlsZTtcbiAgbG9hZFNvdXJjZUZpbGUoc291cmNlUGF0aDogQWJzb2x1dGVGc1BhdGgsIGNvbnRlbnRzOiBzdHJpbmd8bnVsbCk6IFNvdXJjZUZpbGV8bnVsbDtcbiAgbG9hZFNvdXJjZUZpbGUoc291cmNlUGF0aDogQWJzb2x1dGVGc1BhdGgpOiBTb3VyY2VGaWxlfG51bGw7XG4gIGxvYWRTb3VyY2VGaWxlKFxuICAgICAgc291cmNlUGF0aDogQWJzb2x1dGVGc1BhdGgsIGNvbnRlbnRzOiBzdHJpbmd8bnVsbCwgbWFwQW5kUGF0aDogbnVsbCxcbiAgICAgIHByZXZpb3VzUGF0aHM6IEFic29sdXRlRnNQYXRoW10pOiBTb3VyY2VGaWxlfG51bGw7XG4gIGxvYWRTb3VyY2VGaWxlKFxuICAgICAgc291cmNlUGF0aDogQWJzb2x1dGVGc1BhdGgsIGNvbnRlbnRzOiBzdHJpbmd8bnVsbCA9IG51bGwsIG1hcEFuZFBhdGg6IE1hcEFuZFBhdGh8bnVsbCA9IG51bGwsXG4gICAgICBwcmV2aW91c1BhdGhzOiBBYnNvbHV0ZUZzUGF0aFtdID0gW10pOiBTb3VyY2VGaWxlfG51bGwge1xuICAgIGlmIChjb250ZW50cyA9PT0gbnVsbCkge1xuICAgICAgaWYgKCF0aGlzLmZzLmV4aXN0cyhzb3VyY2VQYXRoKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gVHJhY2sgc291cmNlIGZpbGUgcGF0aHMgaWYgd2UgaGF2ZSBsb2FkZWQgdGhlbSBmcm9tIGRpc2sgc28gdGhhdCB3ZSBkb24ndCBnZXQgaW50byBhblxuICAgICAgLy8gaW5maW5pdGUgcmVjdXJzaW9uXG4gICAgICBpZiAocHJldmlvdXNQYXRocy5pbmNsdWRlcyhzb3VyY2VQYXRoKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgQ2lyY3VsYXIgc291cmNlIGZpbGUgbWFwcGluZyBkZXBlbmRlbmN5OiAke3ByZXZpb3VzUGF0aHMuam9pbignIC0+ICcpfSAtPiAke3NvdXJjZVBhdGh9YCk7XG4gICAgICB9XG4gICAgICBwcmV2aW91c1BhdGhzID0gcHJldmlvdXNQYXRocy5jb25jYXQoW3NvdXJjZVBhdGhdKTtcblxuICAgICAgY29udGVudHMgPSB0aGlzLmZzLnJlYWRGaWxlKHNvdXJjZVBhdGgpO1xuICAgIH1cblxuICAgIC8vIElmIG5vdCBwcm92aWRlZCB0cnkgdG8gbG9hZCB0aGUgc291cmNlIG1hcCBiYXNlZCBvbiB0aGUgc291cmNlIGl0c2VsZlxuICAgIGlmIChtYXBBbmRQYXRoID09PSBudWxsKSB7XG4gICAgICBtYXBBbmRQYXRoID0gdGhpcy5sb2FkU291cmNlTWFwKHNvdXJjZVBhdGgsIGNvbnRlbnRzKTtcbiAgICB9XG5cbiAgICBsZXQgbWFwOiBSYXdTb3VyY2VNYXB8bnVsbCA9IG51bGw7XG4gICAgbGV0IGlubGluZSA9IHRydWU7XG4gICAgbGV0IHNvdXJjZXM6IChTb3VyY2VGaWxlIHwgbnVsbClbXSA9IFtdO1xuICAgIGlmIChtYXBBbmRQYXRoICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IG1hcEFuZFBhdGgubWFwUGF0aCB8fCBzb3VyY2VQYXRoO1xuICAgICAgc291cmNlcyA9IHRoaXMucHJvY2Vzc1NvdXJjZXMoYmFzZVBhdGgsIG1hcEFuZFBhdGgubWFwLCBwcmV2aW91c1BhdGhzKTtcbiAgICAgIG1hcCA9IG1hcEFuZFBhdGgubWFwO1xuICAgICAgaW5saW5lID0gbWFwQW5kUGF0aC5tYXBQYXRoID09PSBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgU291cmNlRmlsZShzb3VyY2VQYXRoLCBjb250ZW50cywgbWFwLCBpbmxpbmUsIHNvdXJjZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgdGhlIHNvdXJjZSBtYXAgYXNzb2NpYXRlZCB3aXRoIHRoZSBzb3VyY2UgZmlsZSB3aG9zZSBgc291cmNlUGF0aGAgYW5kIGBjb250ZW50c2AgYXJlXG4gICAqIHByb3ZpZGVkLlxuICAgKlxuICAgKiBTb3VyY2UgbWFwcyBjYW4gYmUgaW5saW5lLCBhcyBwYXJ0IG9mIGEgYmFzZTY0IGVuY29kZWQgY29tbWVudCwgb3IgZXh0ZXJuYWwgYXMgYSBzZXBhcmF0ZSBmaWxlXG4gICAqIHdob3NlIHBhdGggaXMgaW5kaWNhdGVkIGluIGEgY29tbWVudCBvciBpbXBsaWVkIGZyb20gdGhlIG5hbWUgb2YgdGhlIHNvdXJjZSBmaWxlIGl0c2VsZi5cbiAgICovXG4gIHByaXZhdGUgbG9hZFNvdXJjZU1hcChzb3VyY2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgY29udGVudHM6IHN0cmluZyk6IE1hcEFuZFBhdGh8bnVsbCB7XG4gICAgY29uc3QgaW5saW5lID0gY29tbWVudFJlZ2V4LmV4ZWMoY29udGVudHMpO1xuICAgIGlmIChpbmxpbmUgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB7bWFwOiBmcm9tQ29tbWVudChpbmxpbmUucG9wKCkgISkuc291cmNlbWFwLCBtYXBQYXRoOiBudWxsfTtcbiAgICB9XG5cbiAgICBjb25zdCBleHRlcm5hbCA9IG1hcEZpbGVDb21tZW50UmVnZXguZXhlYyhjb250ZW50cyk7XG4gICAgaWYgKGV4dGVybmFsKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IGV4dGVybmFsWzFdIHx8IGV4dGVybmFsWzJdO1xuICAgICAgICBjb25zdCBleHRlcm5hbE1hcFBhdGggPSB0aGlzLmZzLnJlc29sdmUodGhpcy5mcy5kaXJuYW1lKHNvdXJjZVBhdGgpLCBmaWxlTmFtZSk7XG4gICAgICAgIHJldHVybiB7bWFwOiB0aGlzLmxvYWRSYXdTb3VyY2VNYXAoZXh0ZXJuYWxNYXBQYXRoKSwgbWFwUGF0aDogZXh0ZXJuYWxNYXBQYXRofTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbXBsaWVkTWFwUGF0aCA9IGFic29sdXRlRnJvbShzb3VyY2VQYXRoICsgJy5tYXAnKTtcbiAgICBpZiAodGhpcy5mcy5leGlzdHMoaW1wbGllZE1hcFBhdGgpKSB7XG4gICAgICByZXR1cm4ge21hcDogdGhpcy5sb2FkUmF3U291cmNlTWFwKGltcGxpZWRNYXBQYXRoKSwgbWFwUGF0aDogaW1wbGllZE1hcFBhdGh9O1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb3ZlciBlYWNoIG9mIHRoZSBcInNvdXJjZXNcIiBmb3IgdGhpcyBzb3VyY2UgZmlsZSdzIHNvdXJjZSBtYXAsIHJlY3Vyc2l2ZWx5IGxvYWRpbmcgZWFjaFxuICAgKiBzb3VyY2UgZmlsZSBhbmQgaXRzIGFzc29jaWF0ZWQgc291cmNlIG1hcC5cbiAgICovXG4gIHByaXZhdGUgcHJvY2Vzc1NvdXJjZXMoXG4gICAgICBiYXNlUGF0aDogQWJzb2x1dGVGc1BhdGgsIG1hcDogUmF3U291cmNlTWFwLFxuICAgICAgcHJldmlvdXNQYXRoczogQWJzb2x1dGVGc1BhdGhbXSk6IChTb3VyY2VGaWxlfG51bGwpW10ge1xuICAgIGNvbnN0IHNvdXJjZVJvb3QgPSB0aGlzLmZzLnJlc29sdmUodGhpcy5mcy5kaXJuYW1lKGJhc2VQYXRoKSwgbWFwLnNvdXJjZVJvb3QgfHwgJycpO1xuICAgIHJldHVybiBtYXAuc291cmNlcy5tYXAoKHNvdXJjZSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHBhdGggPSB0aGlzLmZzLnJlc29sdmUoc291cmNlUm9vdCwgc291cmNlKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBtYXAuc291cmNlc0NvbnRlbnQgJiYgbWFwLnNvdXJjZXNDb250ZW50W2luZGV4XSB8fCBudWxsO1xuICAgICAgcmV0dXJuIHRoaXMubG9hZFNvdXJjZUZpbGUocGF0aCwgY29udGVudCwgbnVsbCwgcHJldmlvdXNQYXRocyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTG9hZCB0aGUgc291cmNlIG1hcCBmcm9tIHRoZSBmaWxlIGF0IGBtYXBQYXRoYCwgcGFyc2luZyBpdHMgSlNPTiBjb250ZW50cyBpbnRvIGEgYFJhd1NvdXJjZU1hcGBcbiAgICogb2JqZWN0LlxuICAgKi9cbiAgcHJpdmF0ZSBsb2FkUmF3U291cmNlTWFwKG1hcFBhdGg6IEFic29sdXRlRnNQYXRoKTogUmF3U291cmNlTWFwIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZSh0aGlzLmZzLnJlYWRGaWxlKG1hcFBhdGgpKTtcbiAgfVxufVxuXG4vKiogQSBzbWFsbCBoZWxwZXIgc3RydWN0dXJlIHRoYXQgaXMgcmV0dXJuZWQgZnJvbSBgbG9hZFNvdXJjZU1hcCgpYC4gKi9cbmludGVyZmFjZSBNYXBBbmRQYXRoIHtcbiAgLyoqIFRoZSBwYXRoIHRvIHRoZSBzb3VyY2UgbWFwIGlmIGl0IHdhcyBleHRlcm5hbCBvciBgbnVsbGAgaWYgaXQgd2FzIGlubGluZS4gKi9cbiAgbWFwUGF0aDogQWJzb2x1dGVGc1BhdGh8bnVsbDtcbiAgLyoqIFRoZSByYXcgc291cmNlIG1hcCBpdHNlbGYuICovXG4gIG1hcDogUmF3U291cmNlTWFwO1xufVxuIl19