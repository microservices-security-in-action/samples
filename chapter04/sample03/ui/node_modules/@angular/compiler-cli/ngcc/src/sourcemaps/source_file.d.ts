/// <amd-module name="@angular/compiler-cli/ngcc/src/sourcemaps/source_file" />
import { AbsoluteFsPath } from '../../../src/ngtsc/file_system';
import { RawSourceMap } from './raw_source_map';
import { SegmentMarker } from './segment_marker';
export declare function removeSourceMapComments(contents: string): string;
export declare class SourceFile {
    /** The path to this source file. */
    readonly sourcePath: AbsoluteFsPath;
    /** The contents of this source file. */
    readonly contents: string;
    /** The raw source map (if any) associated with this source file. */
    readonly rawMap: RawSourceMap | null;
    /** Whether this source file's source map was inline or external. */
    readonly inline: boolean;
    /** Any source files referenced by the raw source map associated with this source file. */
    readonly sources: (SourceFile | null)[];
    /**
     * The parsed mappings that have been flattened so that any intermediate source mappings have been
     * flattened.
     *
     * The result is that any source file mentioned in the flattened mappings have no source map (are
     * pure original source files).
     */
    readonly flattenedMappings: Mapping[];
    readonly lineLengths: number[];
    constructor(
    /** The path to this source file. */
    sourcePath: AbsoluteFsPath, 
    /** The contents of this source file. */
    contents: string, 
    /** The raw source map (if any) associated with this source file. */
    rawMap: RawSourceMap | null, 
    /** Whether this source file's source map was inline or external. */
    inline: boolean, 
    /** Any source files referenced by the raw source map associated with this source file. */
    sources: (SourceFile | null)[]);
    /**
     * Render the raw source map generated from the flattened mappings.
     */
    renderFlattenedSourceMap(): RawSourceMap;
    /**
     * Flatten the parsed mappings for this source file, so that all the mappings are to pure original
     * source files with no transitive source maps.
     */
    private flattenMappings;
}
/**
 * A Mapping consists of two segment markers: one in the generated source and one in the original
 * source, which indicate the start of each segment. The end of a segment is indicated by the first
 * segment marker of another mapping whose start is greater or equal to this one.
 *
 * It may also include a name associated with the segment being mapped.
 */
export interface Mapping {
    readonly generatedSegment: SegmentMarker;
    readonly originalSource: SourceFile;
    readonly originalSegment: SegmentMarker;
    readonly name?: string;
}
/**
 * Merge two mappings that go from A to B and B to C, to result in a mapping that goes from A to C.
 */
export declare function mergeMappings(generatedSource: SourceFile, ab: Mapping, bc: Mapping): Mapping;
/**
 * Parse the `rawMappings` into an array of parsed mappings, which reference source-files provided
 * in the `sources` parameter.
 */
export declare function parseMappings(rawMap: RawSourceMap | null, sources: (SourceFile | null)[]): Mapping[];
export declare function extractOriginalSegments(mappings: Mapping[]): SegmentMarker[];
export declare function computeLineLengths(str: string): number[];
