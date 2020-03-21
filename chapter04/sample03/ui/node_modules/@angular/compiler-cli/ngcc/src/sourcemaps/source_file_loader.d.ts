/// <amd-module name="@angular/compiler-cli/ngcc/src/sourcemaps/source_file_loader" />
import { AbsoluteFsPath, FileSystem } from '../../../src/ngtsc/file_system';
import { RawSourceMap } from './raw_source_map';
import { SourceFile } from './source_file';
/**
 * This class can be used to load a source file, its associated source map and any upstream sources.
 *
 * Since a source file might reference (or include) a source map, this class can load those too.
 * Since a source map might reference other source files, these are also loaded as needed.
 *
 * This is done recursively. The result is a "tree" of `SourceFile` objects, each containing
 * mappings to other `SourceFile` objects as necessary.
 */
export declare class SourceFileLoader {
    private fs;
    constructor(fs: FileSystem);
    /**
     * Load a source file, compute its source map, and recursively load any referenced source files.
     *
     * @param sourcePath The path to the source file to load.
     * @param contents The contents of the source file to load (if known).
     * The contents may be known because the source file was inlined into a source map.
     * If it is not known the contents will be read from the file at the `sourcePath`.
     * @param mapAndPath The raw source-map and the path to the source-map file, if known.
     * @param previousPaths An internal parameter used for cyclic dependency tracking.
     * @returns a SourceFile if the content for one was provided or able to be loaded from disk,
     * `null` otherwise.
     */
    loadSourceFile(sourcePath: AbsoluteFsPath, contents: string, mapAndPath: MapAndPath): SourceFile;
    loadSourceFile(sourcePath: AbsoluteFsPath, contents: string | null): SourceFile | null;
    loadSourceFile(sourcePath: AbsoluteFsPath): SourceFile | null;
    loadSourceFile(sourcePath: AbsoluteFsPath, contents: string | null, mapAndPath: null, previousPaths: AbsoluteFsPath[]): SourceFile | null;
    /**
     * Find the source map associated with the source file whose `sourcePath` and `contents` are
     * provided.
     *
     * Source maps can be inline, as part of a base64 encoded comment, or external as a separate file
     * whose path is indicated in a comment or implied from the name of the source file itself.
     */
    private loadSourceMap;
    /**
     * Iterate over each of the "sources" for this source file's source map, recursively loading each
     * source file and its associated source map.
     */
    private processSources;
    /**
     * Load the source map from the file at `mapPath`, parsing its JSON contents into a `RawSourceMap`
     * object.
     */
    private loadRawSourceMap;
}
/** A small helper structure that is returned from `loadSourceMap()`. */
interface MapAndPath {
    /** The path to the source map if it was external or `null` if it was inline. */
    mapPath: AbsoluteFsPath | null;
    /** The raw source map itself. */
    map: RawSourceMap;
}
export {};
