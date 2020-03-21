/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/ngcc/src/execution/cluster/executor" />
import { Logger } from '../../logging/logger';
import { PackageJsonUpdater } from '../../writing/package_json_updater';
import { AnalyzeEntryPointsFn, CreateCompileFn, Executor } from '../api';
import { LockFile } from '../lock_file';
/**
 * An `Executor` that processes tasks in parallel (on multiple processes) and completes
 * asynchronously.
 */
export declare class ClusterExecutor implements Executor {
    private workerCount;
    private logger;
    private pkgJsonUpdater;
    private lockFile;
    constructor(workerCount: number, logger: Logger, pkgJsonUpdater: PackageJsonUpdater, lockFile: LockFile);
    execute(analyzeEntryPoints: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn): Promise<void>;
}
