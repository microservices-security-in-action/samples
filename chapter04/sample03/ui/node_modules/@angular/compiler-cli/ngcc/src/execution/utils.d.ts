/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/ngcc/src/execution/utils" />
import { PackageJsonUpdater } from '../writing/package_json_updater';
import { Task, TaskProcessingOutcome } from './api';
/** A helper function for handling a task's being completed. */
export declare const onTaskCompleted: (pkgJsonUpdater: PackageJsonUpdater, task: Task, outcome: TaskProcessingOutcome) => void;
/** Stringify a task for debugging purposes. */
export declare const stringifyTask: (task: Task) => string;
