/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/ngcc/src/execution/task_selection/parallel_task_queue" />
import { DepGraph } from 'dependency-graph';
import { EntryPoint } from '../../packages/entry_point';
import { PartiallyOrderedTasks, Task } from '../api';
import { BaseTaskQueue } from './base_task_queue';
/**
 * A `TaskQueue` implementation that assumes tasks are processed in parallel, thus has to ensure a
 * task's dependencies have been processed before processing the task.
 */
export declare class ParallelTaskQueue extends BaseTaskQueue {
    /**
     * A mapping from each task to the list of tasks that are blocking it (if any).
     *
     * A task can block another task, if the latter's entry-point depends on the former's entry-point
     * _and_ the former is also generating typings (i.e. has `processDts: true`).
     *
     * NOTE: If a task is not generating typings, then it cannot affect anything which depends on its
     *       entry-point, regardless of the dependency graph. To put this another way, only the task
     *       which produces the typings for a dependency needs to have been completed.
     */
    private blockedTasks;
    constructor(tasks: PartiallyOrderedTasks, graph: DepGraph<EntryPoint>);
    getNextTask(): Task | null;
    markTaskCompleted(task: Task): void;
    toString(): string;
    private stringifyBlockedTasks;
}
