/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/ngcc/src/sourcemaps/segment_marker" />
/**
* A marker that indicates the start of a segment in a mapping.
*
* The end of a segment is indicated by the the first segment-marker of another mapping whose start
* is greater or equal to this one.
*/
export interface SegmentMarker {
    readonly line: number;
    readonly column: number;
}
/**
 * Compare two segment-markers, for use in a search or sorting algorithm.
 *
 * @returns a positive number if `a` is after `b`, a negative number if `b` is after `a`
 * and zero if they are at the same position.
 */
export declare function compareSegments(a: SegmentMarker, b: SegmentMarker): number;
/**
 * Compute the difference between two segment markers in a source file.
 *
 * @param lineLengths the lengths of each line of content of the source file where we are computing
 * the difference
 * @param a the start marker
 * @param b the end marker
 * @returns the number of characters between the two segments `a` and `b`
 */
export declare function segmentDiff(lineLengths: number[], a: SegmentMarker, b: SegmentMarker): number;
/**
 * Return a new segment-marker that is offset by the given number of characters.
 *
 * @param lineLengths The length of each line in the source file whose segment-marker we are
 * offsetting.
 * @param marker The segment to offset.
 * @param offset The number of character to offset by.
 */
export declare function offsetSegment(lineLengths: number[], marker: SegmentMarker, offset: number): SegmentMarker;
