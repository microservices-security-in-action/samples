/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/ngcc/src/execution/cluster/worker" />
import { Logger } from '../../logging/logger';
import { CreateCompileFn } from '../api';
/**
 * A cluster worker is responsible for processing one task (i.e. one format property for a specific
 * entry-point) at a time and reporting results back to the cluster master.
 */
export declare class ClusterWorker {
    private logger;
    private compile;
    constructor(logger: Logger, createCompileFn: CreateCompileFn);
    run(): Promise<void>;
}
