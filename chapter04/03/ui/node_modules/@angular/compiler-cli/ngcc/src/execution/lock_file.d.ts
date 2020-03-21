/// <amd-module name="@angular/compiler-cli/ngcc/src/execution/lock_file" />
import { FileSystem } from '../../../src/ngtsc/file_system';
/**
 * The LockFile is used to prevent more than one instance of ngcc executing at the same time.
 *
 * When ngcc starts executing, it creates a file in the `compiler-cli/ngcc` folder. If it finds one
 * is already there then it fails with a suitable error message.
 * When ngcc completes executing, it removes the file so that future ngcc executions can start.
 */
export declare class LockFile {
    private fs;
    lockFilePath: import("@angular/compiler-cli/src/ngtsc/file_system/src/types").BrandedPath<"AbsoluteFsPath">;
    constructor(fs: FileSystem);
    /**
     * Run a function guarded by the lock file.
     *
     * Note that T can be a Promise. If so, we run the `remove()` call in the promise's `finally`
     * handler. Otherwise we run the `remove()` call in the `try...finally` block.
     *
     * @param fn The function to run.
     */
    lock<T>(fn: () => T): T;
    /**
     * Write a lock file to disk, or error if there is already one there.
     */
    protected create(): void;
    /**
     * Remove the lock file from disk.
     */
    protected remove(): void;
    protected addSignalHandlers(): void;
    protected removeSignalHandlers(): void;
    /**
     * This handle needs to be defined as a property rather than a method
     * so that it can be passed around as a bound function.
     */
    protected signalHandler: () => void;
    /**
     * This function wraps `process.exit()` which makes it easier to manage in unit tests,
     * since it is not possible to mock out `process.exit()` when it is called from signal handlers.
     */
    protected exit(code: number): void;
}
