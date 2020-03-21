(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/sourcemaps/source_file", ["require", "exports", "tslib", "convert-source-map", "sourcemap-codec", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/sourcemaps/segment_marker"], factory);
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
    var convert_source_map_1 = require("convert-source-map");
    var sourcemap_codec_1 = require("sourcemap-codec");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var segment_marker_1 = require("@angular/compiler-cli/ngcc/src/sourcemaps/segment_marker");
    function removeSourceMapComments(contents) {
        return convert_source_map_1.removeMapFileComments(convert_source_map_1.removeComments(contents)).replace(/\n\n$/, '\n');
    }
    exports.removeSourceMapComments = removeSourceMapComments;
    var SourceFile = /** @class */ (function () {
        function SourceFile(
        /** The path to this source file. */
        sourcePath, 
        /** The contents of this source file. */
        contents, 
        /** The raw source map (if any) associated with this source file. */
        rawMap, 
        /** Whether this source file's source map was inline or external. */
        inline, 
        /** Any source files referenced by the raw source map associated with this source file. */
        sources) {
            this.sourcePath = sourcePath;
            this.contents = contents;
            this.rawMap = rawMap;
            this.inline = inline;
            this.sources = sources;
            this.contents = removeSourceMapComments(contents);
            this.lineLengths = computeLineLengths(this.contents);
            this.flattenedMappings = this.flattenMappings();
        }
        /**
         * Render the raw source map generated from the flattened mappings.
         */
        SourceFile.prototype.renderFlattenedSourceMap = function () {
            var e_1, _a;
            var sources = [];
            var names = [];
            var mappings = [];
            try {
                for (var _b = tslib_1.__values(this.flattenedMappings), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var mapping = _c.value;
                    var sourceIndex = findIndexOrAdd(sources, mapping.originalSource);
                    var mappingArray = [
                        mapping.generatedSegment.column,
                        sourceIndex,
                        mapping.originalSegment.line,
                        mapping.originalSegment.column,
                    ];
                    if (mapping.name !== undefined) {
                        var nameIndex = findIndexOrAdd(names, mapping.name);
                        mappingArray.push(nameIndex);
                    }
                    // Ensure a mapping line array for this mapping.
                    var line = mapping.generatedSegment.line;
                    while (line >= mappings.length) {
                        mappings.push([]);
                    }
                    // Add this mapping to the line
                    mappings[line].push(mappingArray);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var sourcePathDir = file_system_1.dirname(this.sourcePath);
            var sourceMap = {
                version: 3,
                file: file_system_1.relative(sourcePathDir, this.sourcePath),
                sources: sources.map(function (sf) { return file_system_1.relative(sourcePathDir, sf.sourcePath); }), names: names,
                mappings: sourcemap_codec_1.encode(mappings),
                sourcesContent: sources.map(function (sf) { return sf.contents; }),
            };
            return sourceMap;
        };
        /**
         * Flatten the parsed mappings for this source file, so that all the mappings are to pure original
         * source files with no transitive source maps.
         */
        SourceFile.prototype.flattenMappings = function () {
            var mappings = parseMappings(this.rawMap, this.sources);
            var originalSegments = extractOriginalSegments(mappings);
            var flattenedMappings = [];
            var _loop_1 = function (mappingIndex) {
                var aToBmapping = mappings[mappingIndex];
                var bSource = aToBmapping.originalSource;
                if (bSource.flattenedMappings.length === 0) {
                    // The b source file has no mappings of its own (i.e. it is a pure original file)
                    // so just use the mapping as-is.
                    flattenedMappings.push(aToBmapping);
                    return "continue";
                }
                // The `incomingStart` and `incomingEnd` are the `SegmentMarker`s in `B` that represent the
                // section of `B` source file that is being mapped to by the current `aToBmapping`.
                //
                // For example, consider the mappings from A to B:
                //
                // src A   src B     mapping
                //
                //   a ----- a       [0, 0]
                //   b       b
                //   f -  /- c       [4, 2]
                //   g  \ /  d
                //   c -/\   e
                //   d    \- f       [2, 5]
                //   e
                //
                // For mapping [0,0] the incoming start and end are 0 and 2 (i.e. the range a, b, c)
                // For mapping [4,2] the incoming start and end are 2 and 5 (i.e. the range c, d, e, f)
                //
                var incomingStart = aToBmapping.originalSegment;
                var incomingEndIndex = originalSegments.indexOf(incomingStart) + 1;
                var incomingEnd = incomingEndIndex < originalSegments.length ?
                    originalSegments[incomingEndIndex] :
                    undefined;
                // The `outgoingStartIndex` and `outgoingEndIndex` are the indices of the range of mappings
                // that leave `b` that we are interested in merging with the aToBmapping.
                // We actually care about all the markers from the last bToCmapping directly before the
                // `incomingStart` to the last bToCmaping directly before the `incomingEnd`, inclusive.
                //
                // For example, if we consider the range 2 to 5 from above (i.e. c, d, e, f) with the
                // following mappings from B to C:
                //
                //   src B   src C     mapping
                //     a
                //     b ----- b       [1, 0]
                //   - c       c
                //  |  d       d
                //  |  e ----- 1       [4, 3]
                //   - f  \    2
                //         \   3
                //          \- e       [4, 6]
                //
                // The range with `incomingStart` at 2 and `incomingEnd` at 5 has outgoing start mapping of
                // [1,0] and outgoing end mapping of [4, 6], which also includes [4, 3].
                //
                var outgoingStartIndex = findLastIndex(bSource.flattenedMappings, function (mapping) { return segment_marker_1.compareSegments(mapping.generatedSegment, incomingStart) <= 0; });
                if (outgoingStartIndex < 0) {
                    outgoingStartIndex = 0;
                }
                var outgoingEndIndex = incomingEnd !== undefined ?
                    findLastIndex(bSource.flattenedMappings, function (mapping) { return segment_marker_1.compareSegments(mapping.generatedSegment, incomingEnd) < 0; }) :
                    bSource.flattenedMappings.length - 1;
                for (var bToCmappingIndex = outgoingStartIndex; bToCmappingIndex <= outgoingEndIndex; bToCmappingIndex++) {
                    var bToCmapping = bSource.flattenedMappings[bToCmappingIndex];
                    flattenedMappings.push(mergeMappings(this_1, aToBmapping, bToCmapping));
                }
            };
            var this_1 = this;
            for (var mappingIndex = 0; mappingIndex < mappings.length; mappingIndex++) {
                _loop_1(mappingIndex);
            }
            return flattenedMappings;
        };
        return SourceFile;
    }());
    exports.SourceFile = SourceFile;
    function findLastIndex(items, predicate) {
        for (var index = items.length - 1; index >= 0; index--) {
            if (predicate(items[index])) {
                return index;
            }
        }
        return -1;
    }
    /**
     * Find the index of `item` in the `items` array.
     * If it is not found, then push `item` to the end of the array and return its new index.
     *
     * @param items the collection in which to look for `item`.
     * @param item the item to look for.
     * @returns the index of the `item` in the `items` array.
     */
    function findIndexOrAdd(items, item) {
        var itemIndex = items.indexOf(item);
        if (itemIndex > -1) {
            return itemIndex;
        }
        else {
            items.push(item);
            return items.length - 1;
        }
    }
    /**
     * Merge two mappings that go from A to B and B to C, to result in a mapping that goes from A to C.
     */
    function mergeMappings(generatedSource, ab, bc) {
        var name = bc.name || ab.name;
        // We need to modify the segment-markers of the new mapping to take into account the shifts that
        // occur due to the combination of the two mappings.
        // For example:
        // * Simple map where the B->C starts at the same place the A->B ends:
        //
        // ```
        // A: 1 2 b c d
        //        |        A->B [2,0]
        //        |              |
        // B:     b c d    A->C [2,1]
        //        |                |
        //        |        B->C [0,1]
        // C:   a b c d e
        // ```
        // * More complicated case where diffs of segment-markers is needed:
        //
        // ```
        // A: b 1 2 c d
        //     \
        //      |            A->B  [0,1*]    [0,1*]
        //      |                   |         |+3
        // B: a b 1 2 c d    A->C  [0,1]     [3,2]
        //    |      /                |+1       |
        //    |     /        B->C [0*,0]    [4*,2]
        //    |    /
        // C: a b c d e
        // ```
        //
        // `[0,1]` mapping from A->C:
        // The difference between the "original segment-marker" of A->B (1*) and the "generated
        // segment-marker of B->C (0*): `1 - 0 = +1`.
        // Since it is positive we must increment the "original segment-marker" with `1` to give [0,1].
        //
        // `[3,2]` mapping from A->C:
        // The difference between the "original segment-marker" of A->B (1*) and the "generated
        // segment-marker" of B->C (4*): `1 - 4 = -3`.
        // Since it is negative we must increment the "generated segment-marker" with `3` to give [3,2].
        var diff = segment_marker_1.segmentDiff(ab.originalSource.lineLengths, ab.originalSegment, bc.generatedSegment);
        if (diff > 0) {
            return {
                name: name,
                generatedSegment: segment_marker_1.offsetSegment(generatedSource.lineLengths, ab.generatedSegment, diff),
                originalSource: bc.originalSource,
                originalSegment: bc.originalSegment,
            };
        }
        else {
            return {
                name: name,
                generatedSegment: ab.generatedSegment,
                originalSource: bc.originalSource,
                originalSegment: segment_marker_1.offsetSegment(bc.originalSource.lineLengths, bc.originalSegment, -diff),
            };
        }
    }
    exports.mergeMappings = mergeMappings;
    /**
     * Parse the `rawMappings` into an array of parsed mappings, which reference source-files provided
     * in the `sources` parameter.
     */
    function parseMappings(rawMap, sources) {
        var e_2, _a;
        if (rawMap === null) {
            return [];
        }
        var rawMappings = sourcemap_codec_1.decode(rawMap.mappings);
        if (rawMappings === null) {
            return [];
        }
        var mappings = [];
        for (var generatedLine = 0; generatedLine < rawMappings.length; generatedLine++) {
            var generatedLineMappings = rawMappings[generatedLine];
            try {
                for (var generatedLineMappings_1 = (e_2 = void 0, tslib_1.__values(generatedLineMappings)), generatedLineMappings_1_1 = generatedLineMappings_1.next(); !generatedLineMappings_1_1.done; generatedLineMappings_1_1 = generatedLineMappings_1.next()) {
                    var rawMapping = generatedLineMappings_1_1.value;
                    if (rawMapping.length >= 4) {
                        var originalSource = sources[rawMapping[1]];
                        if (originalSource === null || originalSource === undefined) {
                            // the original source is missing so ignore this mapping
                            continue;
                        }
                        var generatedColumn = rawMapping[0];
                        var name = rawMapping.length === 5 ? rawMap.names[rawMapping[4]] : undefined;
                        var mapping = {
                            generatedSegment: { line: generatedLine, column: generatedColumn },
                            originalSource: originalSource,
                            originalSegment: { line: rawMapping[2], column: rawMapping[3] }, name: name
                        };
                        mappings.push(mapping);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (generatedLineMappings_1_1 && !generatedLineMappings_1_1.done && (_a = generatedLineMappings_1.return)) _a.call(generatedLineMappings_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        return mappings;
    }
    exports.parseMappings = parseMappings;
    function extractOriginalSegments(mappings) {
        return mappings.map(function (mapping) { return mapping.originalSegment; }).sort(segment_marker_1.compareSegments);
    }
    exports.extractOriginalSegments = extractOriginalSegments;
    function computeLineLengths(str) {
        return (str.split(/\r?\n/)).map(function (s) { return s.length; });
    }
    exports.computeLineLengths = computeLineLengths;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvc291cmNlbWFwcy9zb3VyY2VfZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCx5REFBeUU7SUFDekUsbURBQW9GO0lBQ3BGLDJFQUFpRjtJQUVqRiwyRkFBNEY7SUFFNUYsU0FBZ0IsdUJBQXVCLENBQUMsUUFBZ0I7UUFDdEQsT0FBTywwQ0FBcUIsQ0FBQyxtQ0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBRkQsMERBRUM7SUFFRDtRQVdFO1FBQ0ksb0NBQW9DO1FBQzNCLFVBQTBCO1FBQ25DLHdDQUF3QztRQUMvQixRQUFnQjtRQUN6QixvRUFBb0U7UUFDM0QsTUFBeUI7UUFDbEMsb0VBQW9FO1FBQzNELE1BQWU7UUFDeEIsMEZBQTBGO1FBQ2pGLE9BQTRCO1lBUjVCLGVBQVUsR0FBVixVQUFVLENBQWdCO1lBRTFCLGFBQVEsR0FBUixRQUFRLENBQVE7WUFFaEIsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7WUFFekIsV0FBTSxHQUFOLE1BQU0sQ0FBUztZQUVmLFlBQU8sR0FBUCxPQUFPLENBQXFCO1lBQ3ZDLElBQUksQ0FBQyxRQUFRLEdBQUcsdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNsRCxDQUFDO1FBRUQ7O1dBRUc7UUFDSCw2Q0FBd0IsR0FBeEI7O1lBQ0UsSUFBTSxPQUFPLEdBQWlCLEVBQUUsQ0FBQztZQUNq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QUMsQ0FBQyxNQUFNLEVBQVIsQ0FBUSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUZELGdEQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZW1vdmVDb21tZW50cywgcmVtb3ZlTWFwRmlsZUNvbW1lbnRzfSBmcm9tICdjb252ZXJ0LXNvdXJjZS1tYXAnO1xuaW1wb3J0IHtTb3VyY2VNYXBNYXBwaW5ncywgU291cmNlTWFwU2VnbWVudCwgZGVjb2RlLCBlbmNvZGV9IGZyb20gJ3NvdXJjZW1hcC1jb2RlYyc7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBkaXJuYW1lLCByZWxhdGl2ZX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7UmF3U291cmNlTWFwfSBmcm9tICcuL3Jhd19zb3VyY2VfbWFwJztcbmltcG9ydCB7U2VnbWVudE1hcmtlciwgY29tcGFyZVNlZ21lbnRzLCBvZmZzZXRTZWdtZW50LCBzZWdtZW50RGlmZn0gZnJvbSAnLi9zZWdtZW50X21hcmtlcic7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVTb3VyY2VNYXBDb21tZW50cyhjb250ZW50czogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJlbW92ZU1hcEZpbGVDb21tZW50cyhyZW1vdmVDb21tZW50cyhjb250ZW50cykpLnJlcGxhY2UoL1xcblxcbiQvLCAnXFxuJyk7XG59XG5cbmV4cG9ydCBjbGFzcyBTb3VyY2VGaWxlIHtcbiAgLyoqXG4gICAqIFRoZSBwYXJzZWQgbWFwcGluZ3MgdGhhdCBoYXZlIGJlZW4gZmxhdHRlbmVkIHNvIHRoYXQgYW55IGludGVybWVkaWF0ZSBzb3VyY2UgbWFwcGluZ3MgaGF2ZSBiZWVuXG4gICAqIGZsYXR0ZW5lZC5cbiAgICpcbiAgICogVGhlIHJlc3VsdCBpcyB0aGF0IGFueSBzb3VyY2UgZmlsZSBtZW50aW9uZWQgaW4gdGhlIGZsYXR0ZW5lZCBtYXBwaW5ncyBoYXZlIG5vIHNvdXJjZSBtYXAgKGFyZVxuICAgKiBwdXJlIG9yaWdpbmFsIHNvdXJjZSBmaWxlcykuXG4gICAqL1xuICByZWFkb25seSBmbGF0dGVuZWRNYXBwaW5nczogTWFwcGluZ1tdO1xuICByZWFkb25seSBsaW5lTGVuZ3RoczogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogVGhlIHBhdGggdG8gdGhpcyBzb3VyY2UgZmlsZS4gKi9cbiAgICAgIHJlYWRvbmx5IHNvdXJjZVBhdGg6IEFic29sdXRlRnNQYXRoLFxuICAgICAgLyoqIFRoZSBjb250ZW50cyBvZiB0aGlzIHNvdXJjZSBmaWxlLiAqL1xuICAgICAgcmVhZG9ubHkgY29udGVudHM6IHN0cmluZyxcbiAgICAgIC8qKiBUaGUgcmF3IHNvdXJjZSBtYXAgKGlmIGFueSkgYXNzb2NpYXRlZCB3aXRoIHRoaXMgc291cmNlIGZpbGUuICovXG4gICAgICByZWFkb25seSByYXdNYXA6IFJhd1NvdXJjZU1hcHxudWxsLFxuICAgICAgLyoqIFdoZXRoZXIgdGhpcyBzb3VyY2UgZmlsZSdzIHNvdXJjZSBtYXAgd2FzIGlubGluZSBvciBleHRlcm5hbC4gKi9cbiAgICAgIHJlYWRvbmx5IGlubGluZTogYm9vbGVhbixcbiAgICAgIC8qKiBBbnkgc291cmNlIGZpbGVzIHJlZmVyZW5jZWQgYnkgdGhlIHJhdyBzb3VyY2UgbWFwIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHNvdXJjZSBmaWxlLiAqL1xuICAgICAgcmVhZG9ubHkgc291cmNlczogKFNvdXJjZUZpbGV8bnVsbClbXSkge1xuICAgIHRoaXMuY29udGVudHMgPSByZW1vdmVTb3VyY2VNYXBDb21tZW50cyhjb250ZW50cyk7XG4gICAgdGhpcy5saW5lTGVuZ3RocyA9IGNvbXB1dGVMaW5lTGVuZ3Rocyh0aGlzLmNvbnRlbnRzKTtcbiAgICB0aGlzLmZsYXR0ZW5lZE1hcHBpbmdzID0gdGhpcy5mbGF0dGVuTWFwcGluZ3MoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdGhlIHJhdyBzb3VyY2UgbWFwIGdlbmVyYXRlZCBmcm9tIHRoZSBmbGF0dGVuZWQgbWFwcGluZ3MuXG4gICAqL1xuICByZW5kZXJGbGF0dGVuZWRTb3VyY2VNYXAoKTogUmF3U291cmNlTWFwIHtcbiAgICBjb25zdCBzb3VyY2VzOiBTb3VyY2VGaWxlW10gPSBbXTtcbiAgICBjb25zdCBuYW1lczogc3RyaW5nW10gPSBbXTtcblxuICAgIGNvbnN0IG1hcHBpbmdzOiBTb3VyY2VNYXBNYXBwaW5ncyA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBtYXBwaW5nIG9mIHRoaXMuZmxhdHRlbmVkTWFwcGluZ3MpIHtcbiAgICAgIGNvbnN0IHNvdXJjZUluZGV4ID0gZmluZEluZGV4T3JBZGQoc291cmNlcywgbWFwcGluZy5vcmlnaW5hbFNvdXJjZSk7XG4gICAgICBjb25zdCBtYXBwaW5nQXJyYXk6IFNvdXJjZU1hcFNlZ21lbnQgPSBbXG4gICAgICAgIG1hcHBpbmcuZ2VuZXJhdGVkU2VnbWVudC5jb2x1bW4sXG4gICAgICAgIHNvdXJjZUluZGV4LFxuICAgICAgICBtYXBwaW5nLm9yaWdpbmFsU2VnbWVudC5saW5lLFxuICAgICAgICBtYXBwaW5nLm9yaWdpbmFsU2VnbWVudC5jb2x1bW4sXG4gICAgICBdO1xuICAgICAgaWYgKG1hcHBpbmcubmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IG5hbWVJbmRleCA9IGZpbmRJbmRleE9yQWRkKG5hbWVzLCBtYXBwaW5nLm5hbWUpO1xuICAgICAgICBtYXBwaW5nQXJyYXkucHVzaChuYW1lSW5kZXgpO1xuICAgICAgfVxuXG4gICAgICAvLyBFbnN1cmUgYSBtYXBwaW5nIGxpbmUgYXJyYXkgZm9yIHRoaXMgbWFwcGluZy5cbiAgICAgIGNvbnN0IGxpbmUgPSBtYXBwaW5nLmdlbmVyYXRlZFNlZ21lbnQubGluZTtcbiAgICAgIHdoaWxlIChsaW5lID49IG1hcHBpbmdzLmxlbmd0aCkge1xuICAgICAgICBtYXBwaW5ncy5wdXNoKFtdKTtcbiAgICAgIH1cbiAgICAgIC8vIEFkZCB0aGlzIG1hcHBpbmcgdG8gdGhlIGxpbmVcbiAgICAgIG1hcHBpbmdzW2xpbmVdLnB1c2gobWFwcGluZ0FycmF5KTtcbiAgICB9XG5cbiAgICBjb25zdCBzb3VyY2VQYXRoRGlyID0gZGlybmFtZSh0aGlzLnNvdXJjZVBhdGgpO1xuICAgIGNvbnN0IHNvdXJjZU1hcDogUmF3U291cmNlTWFwID0ge1xuICAgICAgdmVyc2lvbjogMyxcbiAgICAgIGZpbGU6IHJlbGF0aXZlKHNvdXJjZVBhdGhEaXIsIHRoaXMuc291cmNlUGF0aCksXG4gICAgICBzb3VyY2VzOiBzb3VyY2VzLm1hcChzZiA9PiByZWxhdGl2ZShzb3VyY2VQYXRoRGlyLCBzZi5zb3VyY2VQYXRoKSksIG5hbWVzLFxuICAgICAgbWFwcGluZ3M6IGVuY29kZShtYXBwaW5ncyksXG4gICAgICBzb3VyY2VzQ29udGVudDogc291cmNlcy5tYXAoc2YgPT4gc2YuY29udGVudHMpLFxuICAgIH07XG4gICAgcmV0dXJuIHNvdXJjZU1hcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGbGF0dGVuIHRoZSBwYXJzZWQgbWFwcGluZ3MgZm9yIHRoaXMgc291cmNlIGZpbGUsIHNvIHRoYXQgYWxsIHRoZSBtYXBwaW5ncyBhcmUgdG8gcHVyZSBvcmlnaW5hbFxuICAgKiBzb3VyY2UgZmlsZXMgd2l0aCBubyB0cmFuc2l0aXZlIHNvdXJjZSBtYXBzLlxuICAgKi9cbiAgcHJpdmF0ZSBmbGF0dGVuTWFwcGluZ3MoKTogTWFwcGluZ1tdIHtcbiAgICBjb25zdCBtYXBwaW5ncyA9IHBhcnNlTWFwcGluZ3ModGhpcy5yYXdNYXAsIHRoaXMuc291cmNlcyk7XG4gICAgY29uc3Qgb3JpZ2luYWxTZWdtZW50cyA9IGV4dHJhY3RPcmlnaW5hbFNlZ21lbnRzKG1hcHBpbmdzKTtcbiAgICBjb25zdCBmbGF0dGVuZWRNYXBwaW5nczogTWFwcGluZ1tdID0gW107XG4gICAgZm9yIChsZXQgbWFwcGluZ0luZGV4ID0gMDsgbWFwcGluZ0luZGV4IDwgbWFwcGluZ3MubGVuZ3RoOyBtYXBwaW5nSW5kZXgrKykge1xuICAgICAgY29uc3QgYVRvQm1hcHBpbmcgPSBtYXBwaW5nc1ttYXBwaW5nSW5kZXhdO1xuICAgICAgY29uc3QgYlNvdXJjZSA9IGFUb0JtYXBwaW5nLm9yaWdpbmFsU291cmNlO1xuICAgICAgaWYgKGJTb3VyY2UuZmxhdHRlbmVkTWFwcGluZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIC8vIFRoZSBiIHNvdXJjZSBmaWxlIGhhcyBubyBtYXBwaW5ncyBvZiBpdHMgb3duIChpLmUuIGl0IGlzIGEgcHVyZSBvcmlnaW5hbCBmaWxlKVxuICAgICAgICAvLyBzbyBqdXN0IHVzZSB0aGUgbWFwcGluZyBhcy1pcy5cbiAgICAgICAgZmxhdHRlbmVkTWFwcGluZ3MucHVzaChhVG9CbWFwcGluZyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgYGluY29taW5nU3RhcnRgIGFuZCBgaW5jb21pbmdFbmRgIGFyZSB0aGUgYFNlZ21lbnRNYXJrZXJgcyBpbiBgQmAgdGhhdCByZXByZXNlbnQgdGhlXG4gICAgICAvLyBzZWN0aW9uIG9mIGBCYCBzb3VyY2UgZmlsZSB0aGF0IGlzIGJlaW5nIG1hcHBlZCB0byBieSB0aGUgY3VycmVudCBgYVRvQm1hcHBpbmdgLlxuICAgICAgLy9cbiAgICAgIC8vIEZvciBleGFtcGxlLCBjb25zaWRlciB0aGUgbWFwcGluZ3MgZnJvbSBBIHRvIEI6XG4gICAgICAvL1xuICAgICAgLy8gc3JjIEEgICBzcmMgQiAgICAgbWFwcGluZ1xuICAgICAgLy9cbiAgICAgIC8vICAgYSAtLS0tLSBhICAgICAgIFswLCAwXVxuICAgICAgLy8gICBiICAgICAgIGJcbiAgICAgIC8vICAgZiAtICAvLSBjICAgICAgIFs0LCAyXVxuICAgICAgLy8gICBnICBcXCAvICBkXG4gICAgICAvLyAgIGMgLS9cXCAgIGVcbiAgICAgIC8vICAgZCAgICBcXC0gZiAgICAgICBbMiwgNV1cbiAgICAgIC8vICAgZVxuICAgICAgLy9cbiAgICAgIC8vIEZvciBtYXBwaW5nIFswLDBdIHRoZSBpbmNvbWluZyBzdGFydCBhbmQgZW5kIGFyZSAwIGFuZCAyIChpLmUuIHRoZSByYW5nZSBhLCBiLCBjKVxuICAgICAgLy8gRm9yIG1hcHBpbmcgWzQsMl0gdGhlIGluY29taW5nIHN0YXJ0IGFuZCBlbmQgYXJlIDIgYW5kIDUgKGkuZS4gdGhlIHJhbmdlIGMsIGQsIGUsIGYpXG4gICAgICAvL1xuICAgICAgY29uc3QgaW5jb21pbmdTdGFydCA9IGFUb0JtYXBwaW5nLm9yaWdpbmFsU2VnbWVudDtcbiAgICAgIGNvbnN0IGluY29taW5nRW5kSW5kZXggPSBvcmlnaW5hbFNlZ21lbnRzLmluZGV4T2YoaW5jb21pbmdTdGFydCkgKyAxO1xuICAgICAgY29uc3QgaW5jb21pbmdFbmQgPSBpbmNvbWluZ0VuZEluZGV4IDwgb3JpZ2luYWxTZWdtZW50cy5sZW5ndGggP1xuICAgICAgICAgIG9yaWdpbmFsU2VnbWVudHNbaW5jb21pbmdFbmRJbmRleF0gOlxuICAgICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgLy8gVGhlIGBvdXRnb2luZ1N0YXJ0SW5kZXhgIGFuZCBgb3V0Z29pbmdFbmRJbmRleGAgYXJlIHRoZSBpbmRpY2VzIG9mIHRoZSByYW5nZSBvZiBtYXBwaW5nc1xuICAgICAgLy8gdGhhdCBsZWF2ZSBgYmAgdGhhdCB3ZSBhcmUgaW50ZXJlc3RlZCBpbiBtZXJnaW5nIHdpdGggdGhlIGFUb0JtYXBwaW5nLlxuICAgICAgLy8gV2UgYWN0dWFsbHkgY2FyZSBhYm91dCBhbGwgdGhlIG1hcmtlcnMgZnJvbSB0aGUgbGFzdCBiVG9DbWFwcGluZyBkaXJlY3RseSBiZWZvcmUgdGhlXG4gICAgICAvLyBgaW5jb21pbmdTdGFydGAgdG8gdGhlIGxhc3QgYlRvQ21hcGluZyBkaXJlY3RseSBiZWZvcmUgdGhlIGBpbmNvbWluZ0VuZGAsIGluY2x1c2l2ZS5cbiAgICAgIC8vXG4gICAgICAvLyBGb3IgZXhhbXBsZSwgaWYgd2UgY29uc2lkZXIgdGhlIHJhbmdlIDIgdG8gNSBmcm9tIGFib3ZlIChpLmUuIGMsIGQsIGUsIGYpIHdpdGggdGhlXG4gICAgICAvLyBmb2xsb3dpbmcgbWFwcGluZ3MgZnJvbSBCIHRvIEM6XG4gICAgICAvL1xuICAgICAgLy8gICBzcmMgQiAgIHNyYyBDICAgICBtYXBwaW5nXG4gICAgICAvLyAgICAgYVxuICAgICAgLy8gICAgIGIgLS0tLS0gYiAgICAgICBbMSwgMF1cbiAgICAgIC8vICAgLSBjICAgICAgIGNcbiAgICAgIC8vICB8ICBkICAgICAgIGRcbiAgICAgIC8vICB8ICBlIC0tLS0tIDEgICAgICAgWzQsIDNdXG4gICAgICAvLyAgIC0gZiAgXFwgICAgMlxuICAgICAgLy8gICAgICAgICBcXCAgIDNcbiAgICAgIC8vICAgICAgICAgIFxcLSBlICAgICAgIFs0LCA2XVxuICAgICAgLy9cbiAgICAgIC8vIFRoZSByYW5nZSB3aXRoIGBpbmNvbWluZ1N0YXJ0YCBhdCAyIGFuZCBgaW5jb21pbmdFbmRgIGF0IDUgaGFzIG91dGdvaW5nIHN0YXJ0IG1hcHBpbmcgb2ZcbiAgICAgIC8vIFsxLDBdIGFuZCBvdXRnb2luZyBlbmQgbWFwcGluZyBvZiBbNCwgNl0sIHdoaWNoIGFsc28gaW5jbHVkZXMgWzQsIDNdLlxuICAgICAgLy9cbiAgICAgIGxldCBvdXRnb2luZ1N0YXJ0SW5kZXggPSBmaW5kTGFzdEluZGV4KFxuICAgICAgICAgIGJTb3VyY2UuZmxhdHRlbmVkTWFwcGluZ3MsXG4gICAgICAgICAgbWFwcGluZyA9PiBjb21wYXJlU2VnbWVudHMobWFwcGluZy5nZW5lcmF0ZWRTZWdtZW50LCBpbmNvbWluZ1N0YXJ0KSA8PSAwKTtcbiAgICAgIGlmIChvdXRnb2luZ1N0YXJ0SW5kZXggPCAwKSB7XG4gICAgICAgIG91dGdvaW5nU3RhcnRJbmRleCA9IDA7XG4gICAgICB9XG4gICAgICBjb25zdCBvdXRnb2luZ0VuZEluZGV4ID0gaW5jb21pbmdFbmQgIT09IHVuZGVmaW5lZCA/XG4gICAgICAgICAgZmluZExhc3RJbmRleChcbiAgICAgICAgICAgICAgYlNvdXJjZS5mbGF0dGVuZWRNYXBwaW5ncyxcbiAgICAgICAgICAgICAgbWFwcGluZyA9PiBjb21wYXJlU2VnbWVudHMobWFwcGluZy5nZW5lcmF0ZWRTZWdtZW50LCBpbmNvbWluZ0VuZCkgPCAwKSA6XG4gICAgICAgICAgYlNvdXJjZS5mbGF0dGVuZWRNYXBwaW5ncy5sZW5ndGggLSAxO1xuXG4gICAgICBmb3IgKGxldCBiVG9DbWFwcGluZ0luZGV4ID0gb3V0Z29pbmdTdGFydEluZGV4OyBiVG9DbWFwcGluZ0luZGV4IDw9IG91dGdvaW5nRW5kSW5kZXg7XG4gICAgICAgICAgIGJUb0NtYXBwaW5nSW5kZXgrKykge1xuICAgICAgICBjb25zdCBiVG9DbWFwcGluZzogTWFwcGluZyA9IGJTb3VyY2UuZmxhdHRlbmVkTWFwcGluZ3NbYlRvQ21hcHBpbmdJbmRleF07XG4gICAgICAgIGZsYXR0ZW5lZE1hcHBpbmdzLnB1c2gobWVyZ2VNYXBwaW5ncyh0aGlzLCBhVG9CbWFwcGluZywgYlRvQ21hcHBpbmcpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZsYXR0ZW5lZE1hcHBpbmdzO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRMYXN0SW5kZXg8VD4oaXRlbXM6IFRbXSwgcHJlZGljYXRlOiAoaXRlbTogVCkgPT4gYm9vbGVhbik6IG51bWJlciB7XG4gIGZvciAobGV0IGluZGV4ID0gaXRlbXMubGVuZ3RoIC0gMTsgaW5kZXggPj0gMDsgaW5kZXgtLSkge1xuICAgIGlmIChwcmVkaWNhdGUoaXRlbXNbaW5kZXhdKSkge1xuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogQSBNYXBwaW5nIGNvbnNpc3RzIG9mIHR3byBzZWdtZW50IG1hcmtlcnM6IG9uZSBpbiB0aGUgZ2VuZXJhdGVkIHNvdXJjZSBhbmQgb25lIGluIHRoZSBvcmlnaW5hbFxuICogc291cmNlLCB3aGljaCBpbmRpY2F0ZSB0aGUgc3RhcnQgb2YgZWFjaCBzZWdtZW50LiBUaGUgZW5kIG9mIGEgc2VnbWVudCBpcyBpbmRpY2F0ZWQgYnkgdGhlIGZpcnN0XG4gKiBzZWdtZW50IG1hcmtlciBvZiBhbm90aGVyIG1hcHBpbmcgd2hvc2Ugc3RhcnQgaXMgZ3JlYXRlciBvciBlcXVhbCB0byB0aGlzIG9uZS5cbiAqXG4gKiBJdCBtYXkgYWxzbyBpbmNsdWRlIGEgbmFtZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNlZ21lbnQgYmVpbmcgbWFwcGVkLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1hcHBpbmcge1xuICByZWFkb25seSBnZW5lcmF0ZWRTZWdtZW50OiBTZWdtZW50TWFya2VyO1xuICByZWFkb25seSBvcmlnaW5hbFNvdXJjZTogU291cmNlRmlsZTtcbiAgcmVhZG9ubHkgb3JpZ2luYWxTZWdtZW50OiBTZWdtZW50TWFya2VyO1xuICByZWFkb25seSBuYW1lPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEZpbmQgdGhlIGluZGV4IG9mIGBpdGVtYCBpbiB0aGUgYGl0ZW1zYCBhcnJheS5cbiAqIElmIGl0IGlzIG5vdCBmb3VuZCwgdGhlbiBwdXNoIGBpdGVtYCB0byB0aGUgZW5kIG9mIHRoZSBhcnJheSBhbmQgcmV0dXJuIGl0cyBuZXcgaW5kZXguXG4gKlxuICogQHBhcmFtIGl0ZW1zIHRoZSBjb2xsZWN0aW9uIGluIHdoaWNoIHRvIGxvb2sgZm9yIGBpdGVtYC5cbiAqIEBwYXJhbSBpdGVtIHRoZSBpdGVtIHRvIGxvb2sgZm9yLlxuICogQHJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBgaXRlbWAgaW4gdGhlIGBpdGVtc2AgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGZpbmRJbmRleE9yQWRkPFQ+KGl0ZW1zOiBUW10sIGl0ZW06IFQpOiBudW1iZXIge1xuICBjb25zdCBpdGVtSW5kZXggPSBpdGVtcy5pbmRleE9mKGl0ZW0pO1xuICBpZiAoaXRlbUluZGV4ID4gLTEpIHtcbiAgICByZXR1cm4gaXRlbUluZGV4O1xuICB9IGVsc2Uge1xuICAgIGl0ZW1zLnB1c2goaXRlbSk7XG4gICAgcmV0dXJuIGl0ZW1zLmxlbmd0aCAtIDE7XG4gIH1cbn1cblxuXG4vKipcbiAqIE1lcmdlIHR3byBtYXBwaW5ncyB0aGF0IGdvIGZyb20gQSB0byBCIGFuZCBCIHRvIEMsIHRvIHJlc3VsdCBpbiBhIG1hcHBpbmcgdGhhdCBnb2VzIGZyb20gQSB0byBDLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VNYXBwaW5ncyhnZW5lcmF0ZWRTb3VyY2U6IFNvdXJjZUZpbGUsIGFiOiBNYXBwaW5nLCBiYzogTWFwcGluZyk6IE1hcHBpbmcge1xuICBjb25zdCBuYW1lID0gYmMubmFtZSB8fCBhYi5uYW1lO1xuXG4gIC8vIFdlIG5lZWQgdG8gbW9kaWZ5IHRoZSBzZWdtZW50LW1hcmtlcnMgb2YgdGhlIG5ldyBtYXBwaW5nIHRvIHRha2UgaW50byBhY2NvdW50IHRoZSBzaGlmdHMgdGhhdFxuICAvLyBvY2N1ciBkdWUgdG8gdGhlIGNvbWJpbmF0aW9uIG9mIHRoZSB0d28gbWFwcGluZ3MuXG4gIC8vIEZvciBleGFtcGxlOlxuXG4gIC8vICogU2ltcGxlIG1hcCB3aGVyZSB0aGUgQi0+QyBzdGFydHMgYXQgdGhlIHNhbWUgcGxhY2UgdGhlIEEtPkIgZW5kczpcbiAgLy9cbiAgLy8gYGBgXG4gIC8vIEE6IDEgMiBiIGMgZFxuICAvLyAgICAgICAgfCAgICAgICAgQS0+QiBbMiwwXVxuICAvLyAgICAgICAgfCAgICAgICAgICAgICAgfFxuICAvLyBCOiAgICAgYiBjIGQgICAgQS0+QyBbMiwxXVxuICAvLyAgICAgICAgfCAgICAgICAgICAgICAgICB8XG4gIC8vICAgICAgICB8ICAgICAgICBCLT5DIFswLDFdXG4gIC8vIEM6ICAgYSBiIGMgZCBlXG4gIC8vIGBgYFxuXG4gIC8vICogTW9yZSBjb21wbGljYXRlZCBjYXNlIHdoZXJlIGRpZmZzIG9mIHNlZ21lbnQtbWFya2VycyBpcyBuZWVkZWQ6XG4gIC8vXG4gIC8vIGBgYFxuICAvLyBBOiBiIDEgMiBjIGRcbiAgLy8gICAgIFxcXG4gIC8vICAgICAgfCAgICAgICAgICAgIEEtPkIgIFswLDEqXSAgICBbMCwxKl1cbiAgLy8gICAgICB8ICAgICAgICAgICAgICAgICAgIHwgICAgICAgICB8KzNcbiAgLy8gQjogYSBiIDEgMiBjIGQgICAgQS0+QyAgWzAsMV0gICAgIFszLDJdXG4gIC8vICAgIHwgICAgICAvICAgICAgICAgICAgICAgIHwrMSAgICAgICB8XG4gIC8vICAgIHwgICAgIC8gICAgICAgIEItPkMgWzAqLDBdICAgIFs0KiwyXVxuICAvLyAgICB8ICAgIC9cbiAgLy8gQzogYSBiIGMgZCBlXG4gIC8vIGBgYFxuICAvL1xuICAvLyBgWzAsMV1gIG1hcHBpbmcgZnJvbSBBLT5DOlxuICAvLyBUaGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBcIm9yaWdpbmFsIHNlZ21lbnQtbWFya2VyXCIgb2YgQS0+QiAoMSopIGFuZCB0aGUgXCJnZW5lcmF0ZWRcbiAgLy8gc2VnbWVudC1tYXJrZXIgb2YgQi0+QyAoMCopOiBgMSAtIDAgPSArMWAuXG4gIC8vIFNpbmNlIGl0IGlzIHBvc2l0aXZlIHdlIG11c3QgaW5jcmVtZW50IHRoZSBcIm9yaWdpbmFsIHNlZ21lbnQtbWFya2VyXCIgd2l0aCBgMWAgdG8gZ2l2ZSBbMCwxXS5cbiAgLy9cbiAgLy8gYFszLDJdYCBtYXBwaW5nIGZyb20gQS0+QzpcbiAgLy8gVGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgXCJvcmlnaW5hbCBzZWdtZW50LW1hcmtlclwiIG9mIEEtPkIgKDEqKSBhbmQgdGhlIFwiZ2VuZXJhdGVkXG4gIC8vIHNlZ21lbnQtbWFya2VyXCIgb2YgQi0+QyAoNCopOiBgMSAtIDQgPSAtM2AuXG4gIC8vIFNpbmNlIGl0IGlzIG5lZ2F0aXZlIHdlIG11c3QgaW5jcmVtZW50IHRoZSBcImdlbmVyYXRlZCBzZWdtZW50LW1hcmtlclwiIHdpdGggYDNgIHRvIGdpdmUgWzMsMl0uXG5cbiAgY29uc3QgZGlmZiA9IHNlZ21lbnREaWZmKGFiLm9yaWdpbmFsU291cmNlLmxpbmVMZW5ndGhzLCBhYi5vcmlnaW5hbFNlZ21lbnQsIGJjLmdlbmVyYXRlZFNlZ21lbnQpO1xuICBpZiAoZGlmZiA+IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZSxcbiAgICAgIGdlbmVyYXRlZFNlZ21lbnQ6IG9mZnNldFNlZ21lbnQoZ2VuZXJhdGVkU291cmNlLmxpbmVMZW5ndGhzLCBhYi5nZW5lcmF0ZWRTZWdtZW50LCBkaWZmKSxcbiAgICAgIG9yaWdpbmFsU291cmNlOiBiYy5vcmlnaW5hbFNvdXJjZSxcbiAgICAgIG9yaWdpbmFsU2VnbWVudDogYmMub3JpZ2luYWxTZWdtZW50LFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWUsXG4gICAgICBnZW5lcmF0ZWRTZWdtZW50OiBhYi5nZW5lcmF0ZWRTZWdtZW50LFxuICAgICAgb3JpZ2luYWxTb3VyY2U6IGJjLm9yaWdpbmFsU291cmNlLFxuICAgICAgb3JpZ2luYWxTZWdtZW50OiBvZmZzZXRTZWdtZW50KGJjLm9yaWdpbmFsU291cmNlLmxpbmVMZW5ndGhzLCBiYy5vcmlnaW5hbFNlZ21lbnQsIC1kaWZmKSxcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGByYXdNYXBwaW5nc2AgaW50byBhbiBhcnJheSBvZiBwYXJzZWQgbWFwcGluZ3MsIHdoaWNoIHJlZmVyZW5jZSBzb3VyY2UtZmlsZXMgcHJvdmlkZWRcbiAqIGluIHRoZSBgc291cmNlc2AgcGFyYW1ldGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VNYXBwaW5ncyhcbiAgICByYXdNYXA6IFJhd1NvdXJjZU1hcCB8IG51bGwsIHNvdXJjZXM6IChTb3VyY2VGaWxlIHwgbnVsbClbXSk6IE1hcHBpbmdbXSB7XG4gIGlmIChyYXdNYXAgPT09IG51bGwpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCByYXdNYXBwaW5ncyA9IGRlY29kZShyYXdNYXAubWFwcGluZ3MpO1xuICBpZiAocmF3TWFwcGluZ3MgPT09IG51bGwpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBtYXBwaW5nczogTWFwcGluZ1tdID0gW107XG4gIGZvciAobGV0IGdlbmVyYXRlZExpbmUgPSAwOyBnZW5lcmF0ZWRMaW5lIDwgcmF3TWFwcGluZ3MubGVuZ3RoOyBnZW5lcmF0ZWRMaW5lKyspIHtcbiAgICBjb25zdCBnZW5lcmF0ZWRMaW5lTWFwcGluZ3MgPSByYXdNYXBwaW5nc1tnZW5lcmF0ZWRMaW5lXTtcbiAgICBmb3IgKGNvbnN0IHJhd01hcHBpbmcgb2YgZ2VuZXJhdGVkTGluZU1hcHBpbmdzKSB7XG4gICAgICBpZiAocmF3TWFwcGluZy5sZW5ndGggPj0gNCkge1xuICAgICAgICBjb25zdCBvcmlnaW5hbFNvdXJjZSA9IHNvdXJjZXNbcmF3TWFwcGluZ1sxXSAhXTtcbiAgICAgICAgaWYgKG9yaWdpbmFsU291cmNlID09PSBudWxsIHx8IG9yaWdpbmFsU291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyB0aGUgb3JpZ2luYWwgc291cmNlIGlzIG1pc3Npbmcgc28gaWdub3JlIHRoaXMgbWFwcGluZ1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGdlbmVyYXRlZENvbHVtbiA9IHJhd01hcHBpbmdbMF07XG4gICAgICAgIGNvbnN0IG5hbWUgPSByYXdNYXBwaW5nLmxlbmd0aCA9PT0gNSA/IHJhd01hcC5uYW1lc1tyYXdNYXBwaW5nWzRdXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgbWFwcGluZzogTWFwcGluZyA9IHtcbiAgICAgICAgICBnZW5lcmF0ZWRTZWdtZW50OiB7bGluZTogZ2VuZXJhdGVkTGluZSwgY29sdW1uOiBnZW5lcmF0ZWRDb2x1bW59LFxuICAgICAgICAgIG9yaWdpbmFsU291cmNlLFxuICAgICAgICAgIG9yaWdpbmFsU2VnbWVudDoge2xpbmU6IHJhd01hcHBpbmdbMl0gISwgY29sdW1uOiByYXdNYXBwaW5nWzNdICF9LCBuYW1lXG4gICAgICAgIH07XG4gICAgICAgIG1hcHBpbmdzLnB1c2gobWFwcGluZyk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBtYXBwaW5ncztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RPcmlnaW5hbFNlZ21lbnRzKG1hcHBpbmdzOiBNYXBwaW5nW10pOiBTZWdtZW50TWFya2VyW10ge1xuICByZXR1cm4gbWFwcGluZ3MubWFwKG1hcHBpbmcgPT4gbWFwcGluZy5vcmlnaW5hbFNlZ21lbnQpLnNvcnQoY29tcGFyZVNlZ21lbnRzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVMaW5lTGVuZ3RocyhzdHI6IHN0cmluZyk6IG51bWJlcltdIHtcbiAgcmV0dXJuIChzdHIuc3BsaXQoL1xccj9cXG4vKSkubWFwKHMgPT4gcy5sZW5ndGgpO1xufVxuIl19