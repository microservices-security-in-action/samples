/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/ngcc/src/execution/single_process_executor" />
import { Logger } from '../logging/logger';
import { PackageJsonUpdater } from '../writing/package_json_updater';
import { AnalyzeEntryPointsFn, CreateCompileFn, Executor } from './api';
import { LockFile } from './lock_file';
/**
 * An `Executor` that processes all tasks serially and completes synchronously.
 */
export declare class SingleProcessExecutor implements Executor {
    private logger;
    private pkgJsonUpdater;
    private lockFile;
    constructor(logger: Logger, pkgJsonUpdater: PackageJsonUpdater, lockFile: LockFile);
    execute(analyzeEntryPoints: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn): void;
}
/**
 * An `Executor` that processes all tasks serially, but still completes asynchronously.
 */
export declare class AsyncSingleProcessExecutor extends SingleProcessExecutor {
    execute(...args: Parameters<Executor['execute']>): Promise<void>;
}
