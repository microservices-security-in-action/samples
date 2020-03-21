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
        define("@angular/compiler-cli/ngcc/src/sourcemaps/segment_marker", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Compare two segment-markers, for use in a search or sorting algorithm.
     *
     * @returns a positive number if `a` is after `b`, a negative number if `b` is after `a`
     * and zero if they are at the same position.
     */
    function compareSegments(a, b) {
        return a.line === b.line ? a.column - b.column : a.line - b.line;
    }
    exports.compareSegments = compareSegments;
    // The `1` is to indicate a newline character between the lines.
    // Note that in the actual contents there could be more than one character that indicates a newline
    // - e.g. \r\n - but that is not important here since segment-markers are in line/column pairs and
    // so differences in length due to extra `\r` characters do not affect the algorithms.
    var NEWLINE_MARKER_OFFSET = 1;
    /**
     * Compute the difference between two segment markers in a source file.
     *
     * @param lineLengths the lengths of each line of content of the source file where we are computing
     * the difference
     * @param a the start marker
     * @param b the end marker
     * @returns the number of characters between the two segments `a` and `b`
     */
    function segmentDiff(lineLengths, a, b) {
        var diff = b.column - a.column;
        // Deal with `a` being before `b`
        for (var lineIndex = a.line; lineIndex < b.line; lineIndex++) {
            diff += lineLengths[lineIndex] + NEWLINE_MARKER_OFFSET;
        }
        // Deal with `a` being after `b`
        for (var lineIndex = a.line - 1; lineIndex >= b.line; lineIndex--) {
            // The `+ 1` is the newline character between the lines
            diff -= lineLengths[lineIndex] + NEWLINE_MARKER_OFFSET;
        }
        return diff;
    }
    exports.segmentDiff = segmentDiff;
    /**
     * Return a new segment-marker that is offset by the given number of characters.
     *
     * @param lineLengths The length of each line in the source file whose segment-marker we are
     * offsetting.
     * @param marker The segment to offset.
     * @param offset The number of character to offset by.
     */
    function offsetSegment(lineLengths, marker, offset) {
        if (offset === 0) {
            return marker;
        }
        var line = marker.line;
        var column = marker.column + offset;
        while (line < lineLengths.length - 1 && column > lineLengths[line]) {
            column -= lineLengths[line] + NEWLINE_MARKER_OFFSET;
            line++;
        }
        while (line > 0 && column < 0) {
            line--;
            column += lineLengths[line] + NEWLINE_MARKER_OFFSET;
        }
        return { line: line, column: column };
    }
    exports.offsetSegment = offsetSegment;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VnbWVudF9tYXJrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvc291cmNlbWFwcy9zZWdtZW50X21hcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQWNIOzs7OztPQUtHO0lBQ0gsU0FBZ0IsZUFBZSxDQUFDLENBQWdCLEVBQUUsQ0FBZ0I7UUFDaEUsT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ25FLENBQUM7SUFGRCwwQ0FFQztJQUVELGdFQUFnRTtJQUNoRSxtR0FBbUc7SUFDbkcsa0dBQWtHO0lBQ2xHLHNGQUFzRjtJQUN0RixJQUFNLHFCQUFxQixHQUFHLENBQUMsQ0FBQztJQUVoQzs7Ozs7Ozs7T0FRRztJQUNILFNBQWdCLFdBQVcsQ0FBQyxXQUFxQixFQUFFLENBQWdCLEVBQUUsQ0FBZ0I7UUFDbkYsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBRS9CLGlDQUFpQztRQUNqQyxLQUFLLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUU7WUFDNUQsSUFBSSxJQUFJLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxxQkFBcUIsQ0FBQztTQUN4RDtRQUVELGdDQUFnQztRQUNoQyxLQUFLLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLFNBQVMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxFQUFFO1lBQ2pFLHVEQUF1RDtZQUN2RCxJQUFJLElBQUksV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLHFCQUFxQixDQUFDO1NBQ3hEO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBZEQsa0NBY0M7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsU0FBZ0IsYUFBYSxDQUFDLFdBQXFCLEVBQUUsTUFBcUIsRUFBRSxNQUFjO1FBQ3hGLElBQUksTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNoQixPQUFPLE1BQU0sQ0FBQztTQUNmO1FBRUQsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN2QixJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVwQyxPQUFPLElBQUksR0FBRyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2xFLE1BQU0sSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcscUJBQXFCLENBQUM7WUFDcEQsSUFBSSxFQUFFLENBQUM7U0FDUjtRQUNELE9BQU8sSUFBSSxHQUFHLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzdCLElBQUksRUFBRSxDQUFDO1lBQ1AsTUFBTSxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxxQkFBcUIsQ0FBQztTQUNyRDtRQUVELE9BQU8sRUFBQyxJQUFJLE1BQUEsRUFBRSxNQUFNLFFBQUEsRUFBQyxDQUFDO0lBQ3hCLENBQUM7SUFsQkQsc0NBa0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbi8qKlxuKiBBIG1hcmtlciB0aGF0IGluZGljYXRlcyB0aGUgc3RhcnQgb2YgYSBzZWdtZW50IGluIGEgbWFwcGluZy5cbipcbiogVGhlIGVuZCBvZiBhIHNlZ21lbnQgaXMgaW5kaWNhdGVkIGJ5IHRoZSB0aGUgZmlyc3Qgc2VnbWVudC1tYXJrZXIgb2YgYW5vdGhlciBtYXBwaW5nIHdob3NlIHN0YXJ0XG4qIGlzIGdyZWF0ZXIgb3IgZXF1YWwgdG8gdGhpcyBvbmUuXG4qL1xuZXhwb3J0IGludGVyZmFjZSBTZWdtZW50TWFya2VyIHtcbiAgcmVhZG9ubHkgbGluZTogbnVtYmVyO1xuICByZWFkb25seSBjb2x1bW46IG51bWJlcjtcbn1cblxuLyoqXG4gKiBDb21wYXJlIHR3byBzZWdtZW50LW1hcmtlcnMsIGZvciB1c2UgaW4gYSBzZWFyY2ggb3Igc29ydGluZyBhbGdvcml0aG0uXG4gKlxuICogQHJldHVybnMgYSBwb3NpdGl2ZSBudW1iZXIgaWYgYGFgIGlzIGFmdGVyIGBiYCwgYSBuZWdhdGl2ZSBudW1iZXIgaWYgYGJgIGlzIGFmdGVyIGBhYFxuICogYW5kIHplcm8gaWYgdGhleSBhcmUgYXQgdGhlIHNhbWUgcG9zaXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wYXJlU2VnbWVudHMoYTogU2VnbWVudE1hcmtlciwgYjogU2VnbWVudE1hcmtlcik6IG51bWJlciB7XG4gIHJldHVybiBhLmxpbmUgPT09IGIubGluZSA/IGEuY29sdW1uIC0gYi5jb2x1bW4gOiBhLmxpbmUgLSBiLmxpbmU7XG59XG5cbi8vIFRoZSBgMWAgaXMgdG8gaW5kaWNhdGUgYSBuZXdsaW5lIGNoYXJhY3RlciBiZXR3ZWVuIHRoZSBsaW5lcy5cbi8vIE5vdGUgdGhhdCBpbiB0aGUgYWN0dWFsIGNvbnRlbnRzIHRoZXJlIGNvdWxkIGJlIG1vcmUgdGhhbiBvbmUgY2hhcmFjdGVyIHRoYXQgaW5kaWNhdGVzIGEgbmV3bGluZVxuLy8gLSBlLmcuIFxcclxcbiAtIGJ1dCB0aGF0IGlzIG5vdCBpbXBvcnRhbnQgaGVyZSBzaW5jZSBzZWdtZW50LW1hcmtlcnMgYXJlIGluIGxpbmUvY29sdW1uIHBhaXJzIGFuZFxuLy8gc28gZGlmZmVyZW5jZXMgaW4gbGVuZ3RoIGR1ZSB0byBleHRyYSBgXFxyYCBjaGFyYWN0ZXJzIGRvIG5vdCBhZmZlY3QgdGhlIGFsZ29yaXRobXMuXG5jb25zdCBORVdMSU5FX01BUktFUl9PRkZTRVQgPSAxO1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0d28gc2VnbWVudCBtYXJrZXJzIGluIGEgc291cmNlIGZpbGUuXG4gKlxuICogQHBhcmFtIGxpbmVMZW5ndGhzIHRoZSBsZW5ndGhzIG9mIGVhY2ggbGluZSBvZiBjb250ZW50IG9mIHRoZSBzb3VyY2UgZmlsZSB3aGVyZSB3ZSBhcmUgY29tcHV0aW5nXG4gKiB0aGUgZGlmZmVyZW5jZVxuICogQHBhcmFtIGEgdGhlIHN0YXJ0IG1hcmtlclxuICogQHBhcmFtIGIgdGhlIGVuZCBtYXJrZXJcbiAqIEByZXR1cm5zIHRoZSBudW1iZXIgb2YgY2hhcmFjdGVycyBiZXR3ZWVuIHRoZSB0d28gc2VnbWVudHMgYGFgIGFuZCBgYmBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlZ21lbnREaWZmKGxpbmVMZW5ndGhzOiBudW1iZXJbXSwgYTogU2VnbWVudE1hcmtlciwgYjogU2VnbWVudE1hcmtlcikge1xuICBsZXQgZGlmZiA9IGIuY29sdW1uIC0gYS5jb2x1bW47XG5cbiAgLy8gRGVhbCB3aXRoIGBhYCBiZWluZyBiZWZvcmUgYGJgXG4gIGZvciAobGV0IGxpbmVJbmRleCA9IGEubGluZTsgbGluZUluZGV4IDwgYi5saW5lOyBsaW5lSW5kZXgrKykge1xuICAgIGRpZmYgKz0gbGluZUxlbmd0aHNbbGluZUluZGV4XSArIE5FV0xJTkVfTUFSS0VSX09GRlNFVDtcbiAgfVxuXG4gIC8vIERlYWwgd2l0aCBgYWAgYmVpbmcgYWZ0ZXIgYGJgXG4gIGZvciAobGV0IGxpbmVJbmRleCA9IGEubGluZSAtIDE7IGxpbmVJbmRleCA+PSBiLmxpbmU7IGxpbmVJbmRleC0tKSB7XG4gICAgLy8gVGhlIGArIDFgIGlzIHRoZSBuZXdsaW5lIGNoYXJhY3RlciBiZXR3ZWVuIHRoZSBsaW5lc1xuICAgIGRpZmYgLT0gbGluZUxlbmd0aHNbbGluZUluZGV4XSArIE5FV0xJTkVfTUFSS0VSX09GRlNFVDtcbiAgfVxuICByZXR1cm4gZGlmZjtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYSBuZXcgc2VnbWVudC1tYXJrZXIgdGhhdCBpcyBvZmZzZXQgYnkgdGhlIGdpdmVuIG51bWJlciBvZiBjaGFyYWN0ZXJzLlxuICpcbiAqIEBwYXJhbSBsaW5lTGVuZ3RocyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZSBpbiB0aGUgc291cmNlIGZpbGUgd2hvc2Ugc2VnbWVudC1tYXJrZXIgd2UgYXJlXG4gKiBvZmZzZXR0aW5nLlxuICogQHBhcmFtIG1hcmtlciBUaGUgc2VnbWVudCB0byBvZmZzZXQuXG4gKiBAcGFyYW0gb2Zmc2V0IFRoZSBudW1iZXIgb2YgY2hhcmFjdGVyIHRvIG9mZnNldCBieS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9mZnNldFNlZ21lbnQobGluZUxlbmd0aHM6IG51bWJlcltdLCBtYXJrZXI6IFNlZ21lbnRNYXJrZXIsIG9mZnNldDogbnVtYmVyKSB7XG4gIGlmIChvZmZzZXQgPT09IDApIHtcbiAgICByZXR1cm4gbWFya2VyO1xuICB9XG5cbiAgbGV0IGxpbmUgPSBtYXJrZXIubGluZTtcbiAgbGV0IGNvbHVtbiA9IG1hcmtlci5jb2x1bW4gKyBvZmZzZXQ7XG5cbiAgd2hpbGUgKGxpbmUgPCBsaW5lTGVuZ3Rocy5sZW5ndGggLSAxICYmIGNvbHVtbiA+IGxpbmVMZW5ndGhzW2xpbmVdKSB7XG4gICAgY29sdW1uIC09IGxpbmVMZW5ndGhzW2xpbmVdICsgTkVXTElORV9NQVJLRVJfT0ZGU0VUO1xuICAgIGxpbmUrKztcbiAgfVxuICB3aGlsZSAobGluZSA+IDAgJiYgY29sdW1uIDwgMCkge1xuICAgIGxpbmUtLTtcbiAgICBjb2x1bW4gKz0gbGluZUxlbmd0aHNbbGluZV0gKyBORVdMSU5FX01BUktFUl9PRkZTRVQ7XG4gIH1cblxuICByZXR1cm4ge2xpbmUsIGNvbHVtbn07XG59XG4iXX0=