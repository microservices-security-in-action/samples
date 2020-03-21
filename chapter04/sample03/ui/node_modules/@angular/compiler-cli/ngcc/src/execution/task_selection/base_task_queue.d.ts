/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/ngcc/src/execution/task_selection/base_task_queue" />
import { PartiallyOrderedTasks, Task, TaskQueue } from '../api';
/**
 * A base `TaskQueue` implementation to be used as base for concrete implementations.
 */
export declare abstract class BaseTaskQueue implements TaskQueue {
    protected tasks: PartiallyOrderedTasks;
    get allTasksCompleted(): boolean;
    protected inProgressTasks: Set<Task>;
    constructor(tasks: PartiallyOrderedTasks);
    abstract getNextTask(): Task | null;
    markTaskCompleted(task: Task): void;
    toString(): string;
    protected stringifyTasks(tasks: Task[], indentation: string): string;
}
