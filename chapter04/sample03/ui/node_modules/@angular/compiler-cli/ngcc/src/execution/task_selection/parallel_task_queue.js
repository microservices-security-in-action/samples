/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/execution/task_selection/parallel_task_queue", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/execution/utils", "@angular/compiler-cli/ngcc/src/execution/task_selection/base_task_queue"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/execution/utils");
    var base_task_queue_1 = require("@angular/compiler-cli/ngcc/src/execution/task_selection/base_task_queue");
    /**
     * A `TaskQueue` implementation that assumes tasks are processed in parallel, thus has to ensure a
     * task's dependencies have been processed before processing the task.
     */
    var ParallelTaskQueue = /** @class */ (function (_super) {
        tslib_1.__extends(ParallelTaskQueue, _super);
        function ParallelTaskQueue(tasks, graph) {
            var _this = this;
            var blockedTasks = computeBlockedTasks(tasks, graph);
            var sortedTasks = sortTasksByPriority(tasks, blockedTasks);
            _this = _super.call(this, sortedTasks) || this;
            _this.blockedTasks = blockedTasks;
            return _this;
        }
        ParallelTaskQueue.prototype.getNextTask = function () {
            var _this = this;
            // Look for the first available (i.e. not blocked) task.
            // (NOTE: Since tasks are sorted by priority, the first available one is the best choice.)
            var nextTaskIdx = this.tasks.findIndex(function (task) { return !_this.blockedTasks.has(task); });
            if (nextTaskIdx === -1)
                return null;
            // Remove the task from the list of available tasks and add it to the list of in-progress tasks.
            var nextTask = this.tasks[nextTaskIdx];
            this.tasks.splice(nextTaskIdx, 1);
            this.inProgressTasks.add(nextTask);
            return nextTask;
        };
        ParallelTaskQueue.prototype.markTaskCompleted = function (task) {
            var e_1, _a;
            var _this = this;
            _super.prototype.markTaskCompleted.call(this, task);
            var unblockedTasks = [];
            try {
                // Remove the completed task from the lists of tasks blocking other tasks.
                for (var _b = tslib_1.__values(Array.from(this.blockedTasks)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = tslib_1.__read(_c.value, 2), otherTask = _d[0], blockingTasks = _d[1];
                    if (blockingTasks.has(task)) {
                        blockingTasks.delete(task);
                        // If the other task is not blocked any more, mark it for unblocking.
                        if (blockingTasks.size === 0) {
                            unblockedTasks.push(otherTask);
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Unblock tasks that are no longer blocked.
            unblockedTasks.forEach(function (task) { return _this.blockedTasks.delete(task); });
        };
        ParallelTaskQueue.prototype.toString = function () {
            return _super.prototype.toString.call(this) + "\n" +
                ("  Blocked tasks (" + this.blockedTasks.size + "): " + this.stringifyBlockedTasks('    '));
        };
        ParallelTaskQueue.prototype.stringifyBlockedTasks = function (indentation) {
            var _this = this;
            return Array.from(this.blockedTasks)
                .map(function (_a) {
                var _b = tslib_1.__read(_a, 2), task = _b[0], blockingTasks = _b[1];
                return "\n" + indentation + "- " + utils_1.stringifyTask(task) + " (" + blockingTasks.size + "): " +
                    _this.stringifyTasks(Array.from(blockingTasks), indentation + "    ");
            })
                .join('');
        };
        return ParallelTaskQueue;
    }(base_task_queue_1.BaseTaskQueue));
    exports.ParallelTaskQueue = ParallelTaskQueue;
    // Helpers
    /**
     * Compute a mapping of blocked tasks to the tasks that are blocking them.
     *
     * As a performance optimization, we take into account the fact that `tasks` are sorted in such a
     * way that a task can only be blocked by earlier tasks (i.e. dependencies always come before
     * dependants in the list of tasks).
     *
     * @param tasks A (partially ordered) list of tasks.
     * @param graph The dependency graph between entry-points.
     * @return The map of blocked tasks to the tasks that are blocking them.
     */
    function computeBlockedTasks(tasks, graph) {
        var blockedTasksMap = new Map();
        var candidateBlockers = new Map();
        tasks.forEach(function (task) {
            // Find the earlier tasks (`candidateBlockers`) that are blocking this task.
            var deps = graph.dependenciesOf(task.entryPoint.path);
            var blockingTasks = deps.filter(function (dep) { return candidateBlockers.has(dep); }).map(function (dep) { return candidateBlockers.get(dep); });
            // If this task is blocked, add it to the map of blocked tasks.
            if (blockingTasks.length > 0) {
                blockedTasksMap.set(task, new Set(blockingTasks));
            }
            // If this task can be potentially blocking (i.e. it generates typings), add it to the list
            // of candidate blockers for subsequent tasks.
            if (task.processDts) {
                var entryPointPath = task.entryPoint.path;
                // There should only be one task per entry-point that generates typings (and thus can block
                // other tasks), so the following should theoretically never happen, but check just in case.
                if (candidateBlockers.has(entryPointPath)) {
                    var otherTask = candidateBlockers.get(entryPointPath);
                    throw new Error('Invariant violated: Multiple tasks are assigned generating typings for ' +
                        ("'" + entryPointPath + "':\n  - " + utils_1.stringifyTask(otherTask) + "\n  - " + utils_1.stringifyTask(task)));
                }
                candidateBlockers.set(entryPointPath, task);
            }
        });
        return blockedTasksMap;
    }
    /**
     * Sort a list of tasks by priority.
     *
     * Priority is determined by the number of other tasks that a task is (transitively) blocking:
     * The more tasks a task is blocking the higher its priority is, because processing it will
     * potentially unblock more tasks.
     *
     * To keep the behavior predictable, if two tasks block the same number of other tasks, their
     * relative order in the original `tasks` lists is preserved.
     *
     * @param tasks A (partially ordered) list of tasks.
     * @param blockedTasks A mapping from a task to the list of tasks that are blocking it (if any).
     * @return The list of tasks sorted by priority.
     */
    function sortTasksByPriority(tasks, blockedTasks) {
        var priorityPerTask = new Map();
        var allBlockingTaskSets = Array.from(blockedTasks.values());
        var computePriority = function (task, idx) {
            return [allBlockingTaskSets.reduce(function (count, blockingTasks) { return count + (blockingTasks.has(task) ? 1 : 0); }, 0),
                idx,
            ];
        };
        tasks.forEach(function (task, i) { return priorityPerTask.set(task, computePriority(task, i)); });
        return tasks.slice().sort(function (task1, task2) {
            var _a = tslib_1.__read(priorityPerTask.get(task1), 2), p1 = _a[0], idx1 = _a[1];
            var _b = tslib_1.__read(priorityPerTask.get(task2), 2), p2 = _b[0], idx2 = _b[1];
            return (p2 - p1) || (idx1 - idx2);
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYWxsZWxfdGFza19xdWV1ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9leGVjdXRpb24vdGFza19zZWxlY3Rpb24vcGFyYWxsZWxfdGFza19xdWV1ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFNSCx3RUFBdUM7SUFFdkMsMkdBQWdEO0lBR2hEOzs7T0FHRztJQUNIO1FBQXVDLDZDQUFhO1FBYWxELDJCQUFZLEtBQTRCLEVBQUUsS0FBMkI7WUFBckUsaUJBTUM7WUFMQyxJQUFNLFlBQVksR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkQsSUFBTSxXQUFXLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBRTdELFFBQUEsa0JBQU0sV0FBVyxDQUFDLFNBQUM7WUFDbkIsS0FBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7O1FBQ25DLENBQUM7UUFFRCx1Q0FBVyxHQUFYO1lBQUEsaUJBWUM7WUFYQyx3REFBd0Q7WUFDeEQsMEZBQTBGO1lBQzFGLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsQ0FBQyxLQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBNUIsQ0FBNEIsQ0FBQyxDQUFDO1lBQy9FLElBQUksV0FBVyxLQUFLLENBQUMsQ0FBQztnQkFBRSxPQUFPLElBQUksQ0FBQztZQUVwQyxnR0FBZ0c7WUFDaEcsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEMs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QyxDQUFDLENBQUMsQ0FBQyxFQUF6QyxDQUF5QyxFQUFFLENBQUMsQ0FBQztnQkFDM0UsR0FBRzthQUNQO1FBSEcsQ0FHSCxDQUFDO1FBRUYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksRUFBRSxDQUFDLElBQUssT0FBQSxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQW5ELENBQW1ELENBQUMsQ0FBQztRQUVoRixPQUFPLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxLQUFLLEVBQUUsS0FBSztZQUMvQixJQUFBLGtEQUF5QyxFQUF4QyxVQUFFLEVBQUUsWUFBb0MsQ0FBQztZQUMxQyxJQUFBLGtEQUF5QyxFQUF4QyxVQUFFLEVBQUUsWUFBb0MsQ0FBQztZQUVoRCxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3BDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEZXBHcmFwaH0gZnJvbSAnZGVwZW5kZW5jeS1ncmFwaCc7XG5cbmltcG9ydCB7RW50cnlQb2ludH0gZnJvbSAnLi4vLi4vcGFja2FnZXMvZW50cnlfcG9pbnQnO1xuaW1wb3J0IHtQYXJ0aWFsbHlPcmRlcmVkVGFza3MsIFRhc2t9IGZyb20gJy4uL2FwaSc7XG5pbXBvcnQge3N0cmluZ2lmeVRhc2t9IGZyb20gJy4uL3V0aWxzJztcblxuaW1wb3J0IHtCYXNlVGFza1F1ZXVlfSBmcm9tICcuL2Jhc2VfdGFza19xdWV1ZSc7XG5cblxuLyoqXG4gKiBBIGBUYXNrUXVldWVgIGltcGxlbWVudGF0aW9uIHRoYXQgYXNzdW1lcyB0YXNrcyBhcmUgcHJvY2Vzc2VkIGluIHBhcmFsbGVsLCB0aHVzIGhhcyB0byBlbnN1cmUgYVxuICogdGFzaydzIGRlcGVuZGVuY2llcyBoYXZlIGJlZW4gcHJvY2Vzc2VkIGJlZm9yZSBwcm9jZXNzaW5nIHRoZSB0YXNrLlxuICovXG5leHBvcnQgY2xhc3MgUGFyYWxsZWxUYXNrUXVldWUgZXh0ZW5kcyBCYXNlVGFza1F1ZXVlIHtcbiAgLyoqXG4gICAqIEEgbWFwcGluZyBmcm9tIGVhY2ggdGFzayB0byB0aGUgbGlzdCBvZiB0YXNrcyB0aGF0IGFyZSBibG9ja2luZyBpdCAoaWYgYW55KS5cbiAgICpcbiAgICogQSB0YXNrIGNhbiBibG9jayBhbm90aGVyIHRhc2ssIGlmIHRoZSBsYXR0ZXIncyBlbnRyeS1wb2ludCBkZXBlbmRzIG9uIHRoZSBmb3JtZXIncyBlbnRyeS1wb2ludFxuICAgKiBfYW5kXyB0aGUgZm9ybWVyIGlzIGFsc28gZ2VuZXJhdGluZyB0eXBpbmdzIChpLmUuIGhhcyBgcHJvY2Vzc0R0czogdHJ1ZWApLlxuICAgKlxuICAgKiBOT1RFOiBJZiBhIHRhc2sgaXMgbm90IGdlbmVyYXRpbmcgdHlwaW5ncywgdGhlbiBpdCBjYW5ub3QgYWZmZWN0IGFueXRoaW5nIHdoaWNoIGRlcGVuZHMgb24gaXRzXG4gICAqICAgICAgIGVudHJ5LXBvaW50LCByZWdhcmRsZXNzIG9mIHRoZSBkZXBlbmRlbmN5IGdyYXBoLiBUbyBwdXQgdGhpcyBhbm90aGVyIHdheSwgb25seSB0aGUgdGFza1xuICAgKiAgICAgICB3aGljaCBwcm9kdWNlcyB0aGUgdHlwaW5ncyBmb3IgYSBkZXBlbmRlbmN5IG5lZWRzIHRvIGhhdmUgYmVlbiBjb21wbGV0ZWQuXG4gICAqL1xuICBwcml2YXRlIGJsb2NrZWRUYXNrczogTWFwPFRhc2ssIFNldDxUYXNrPj47XG5cbiAgY29uc3RydWN0b3IodGFza3M6IFBhcnRpYWxseU9yZGVyZWRUYXNrcywgZ3JhcGg6IERlcEdyYXBoPEVudHJ5UG9pbnQ+KSB7XG4gICAgY29uc3QgYmxvY2tlZFRhc2tzID0gY29tcHV0ZUJsb2NrZWRUYXNrcyh0YXNrcywgZ3JhcGgpO1xuICAgIGNvbnN0IHNvcnRlZFRhc2tzID0gc29ydFRhc2tzQnlQcmlvcml0eSh0YXNrcywgYmxvY2tlZFRhc2tzKTtcblxuICAgIHN1cGVyKHNvcnRlZFRhc2tzKTtcbiAgICB0aGlzLmJsb2NrZWRUYXNrcyA9IGJsb2NrZWRUYXNrcztcbiAgfVxuXG4gIGdldE5leHRUYXNrKCk6IFRhc2t8bnVsbCB7XG4gICAgLy8gTG9vayBmb3IgdGhlIGZpcnN0IGF2YWlsYWJsZSAoaS5lLiBub3QgYmxvY2tlZCkgdGFzay5cbiAgICAvLyAoTk9URTogU2luY2UgdGFza3MgYXJlIHNvcnRlZCBieSBwcmlvcml0eSwgdGhlIGZpcnN0IGF2YWlsYWJsZSBvbmUgaXMgdGhlIGJlc3QgY2hvaWNlLilcbiAgICBjb25zdCBuZXh0VGFza0lkeCA9IHRoaXMudGFza3MuZmluZEluZGV4KHRhc2sgPT4gIXRoaXMuYmxvY2tlZFRhc2tzLmhhcyh0YXNrKSk7XG4gICAgaWYgKG5leHRUYXNrSWR4ID09PSAtMSkgcmV0dXJuIG51bGw7XG5cbiAgICAvLyBSZW1vdmUgdGhlIHRhc2sgZnJvbSB0aGUgbGlzdCBvZiBhdmFpbGFibGUgdGFza3MgYW5kIGFkZCBpdCB0byB0aGUgbGlzdCBvZiBpbi1wcm9ncmVzcyB0YXNrcy5cbiAgICBjb25zdCBuZXh0VGFzayA9IHRoaXMudGFza3NbbmV4dFRhc2tJZHhdO1xuICAgIHRoaXMudGFza3Muc3BsaWNlKG5leHRUYXNrSWR4LCAxKTtcbiAgICB0aGlzLmluUHJvZ3Jlc3NUYXNrcy5hZGQobmV4dFRhc2spO1xuXG4gICAgcmV0dXJuIG5leHRUYXNrO1xuICB9XG5cbiAgbWFya1Rhc2tDb21wbGV0ZWQodGFzazogVGFzayk6IHZvaWQge1xuICAgIHN1cGVyLm1hcmtUYXNrQ29tcGxldGVkKHRhc2spO1xuXG4gICAgY29uc3QgdW5ibG9ja2VkVGFza3M6IFRhc2tbXSA9IFtdO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBjb21wbGV0ZWQgdGFzayBmcm9tIHRoZSBsaXN0cyBvZiB0YXNrcyBibG9ja2luZyBvdGhlciB0YXNrcy5cbiAgICBmb3IgKGNvbnN0IFtvdGhlclRhc2ssIGJsb2NraW5nVGFza3NdIG9mIEFycmF5LmZyb20odGhpcy5ibG9ja2VkVGFza3MpKSB7XG4gICAgICBpZiAoYmxvY2tpbmdUYXNrcy5oYXModGFzaykpIHtcbiAgICAgICAgYmxvY2tpbmdUYXNrcy5kZWxldGUodGFzayk7XG5cbiAgICAgICAgLy8gSWYgdGhlIG90aGVyIHRhc2sgaXMgbm90IGJsb2NrZWQgYW55IG1vcmUsIG1hcmsgaXQgZm9yIHVuYmxvY2tpbmcuXG4gICAgICAgIGlmIChibG9ja2luZ1Rhc2tzLnNpemUgPT09IDApIHtcbiAgICAgICAgICB1bmJsb2NrZWRUYXNrcy5wdXNoKG90aGVyVGFzayk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBVbmJsb2NrIHRhc2tzIHRoYXQgYXJlIG5vIGxvbmdlciBibG9ja2VkLlxuICAgIHVuYmxvY2tlZFRhc2tzLmZvckVhY2godGFzayA9PiB0aGlzLmJsb2NrZWRUYXNrcy5kZWxldGUodGFzaykpO1xuICB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7c3VwZXIudG9TdHJpbmcoKX1cXG5gICtcbiAgICAgICAgYCAgQmxvY2tlZCB0YXNrcyAoJHt0aGlzLmJsb2NrZWRUYXNrcy5zaXplfSk6ICR7dGhpcy5zdHJpbmdpZnlCbG9ja2VkVGFza3MoJyAgICAnKX1gO1xuICB9XG5cbiAgcHJpdmF0ZSBzdHJpbmdpZnlCbG9ja2VkVGFza3MoaW5kZW50YXRpb246IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5ibG9ja2VkVGFza3MpXG4gICAgICAgIC5tYXAoXG4gICAgICAgICAgICAoW3Rhc2ssIGJsb2NraW5nVGFza3NdKSA9PlxuICAgICAgICAgICAgICAgIGBcXG4ke2luZGVudGF0aW9ufS0gJHtzdHJpbmdpZnlUYXNrKHRhc2spfSAoJHtibG9ja2luZ1Rhc2tzLnNpemV9KTogYCArXG4gICAgICAgICAgICAgICAgdGhpcy5zdHJpbmdpZnlUYXNrcyhBcnJheS5mcm9tKGJsb2NraW5nVGFza3MpLCBgJHtpbmRlbnRhdGlvbn0gICAgYCkpXG4gICAgICAgIC5qb2luKCcnKTtcbiAgfVxufVxuXG4vLyBIZWxwZXJzXG5cbi8qKlxuICogQ29tcHV0ZSBhIG1hcHBpbmcgb2YgYmxvY2tlZCB0YXNrcyB0byB0aGUgdGFza3MgdGhhdCBhcmUgYmxvY2tpbmcgdGhlbS5cbiAqXG4gKiBBcyBhIHBlcmZvcm1hbmNlIG9wdGltaXphdGlvbiwgd2UgdGFrZSBpbnRvIGFjY291bnQgdGhlIGZhY3QgdGhhdCBgdGFza3NgIGFyZSBzb3J0ZWQgaW4gc3VjaCBhXG4gKiB3YXkgdGhhdCBhIHRhc2sgY2FuIG9ubHkgYmUgYmxvY2tlZCBieSBlYXJsaWVyIHRhc2tzIChpLmUuIGRlcGVuZGVuY2llcyBhbHdheXMgY29tZSBiZWZvcmVcbiAqIGRlcGVuZGFudHMgaW4gdGhlIGxpc3Qgb2YgdGFza3MpLlxuICpcbiAqIEBwYXJhbSB0YXNrcyBBIChwYXJ0aWFsbHkgb3JkZXJlZCkgbGlzdCBvZiB0YXNrcy5cbiAqIEBwYXJhbSBncmFwaCBUaGUgZGVwZW5kZW5jeSBncmFwaCBiZXR3ZWVuIGVudHJ5LXBvaW50cy5cbiAqIEByZXR1cm4gVGhlIG1hcCBvZiBibG9ja2VkIHRhc2tzIHRvIHRoZSB0YXNrcyB0aGF0IGFyZSBibG9ja2luZyB0aGVtLlxuICovXG5mdW5jdGlvbiBjb21wdXRlQmxvY2tlZFRhc2tzKFxuICAgIHRhc2tzOiBQYXJ0aWFsbHlPcmRlcmVkVGFza3MsIGdyYXBoOiBEZXBHcmFwaDxFbnRyeVBvaW50Pik6IE1hcDxUYXNrLCBTZXQ8VGFzaz4+IHtcbiAgY29uc3QgYmxvY2tlZFRhc2tzTWFwID0gbmV3IE1hcDxUYXNrLCBTZXQ8VGFzaz4+KCk7XG4gIGNvbnN0IGNhbmRpZGF0ZUJsb2NrZXJzID0gbmV3IE1hcDxzdHJpbmcsIFRhc2s+KCk7XG5cbiAgdGFza3MuZm9yRWFjaCh0YXNrID0+IHtcbiAgICAvLyBGaW5kIHRoZSBlYXJsaWVyIHRhc2tzIChgY2FuZGlkYXRlQmxvY2tlcnNgKSB0aGF0IGFyZSBibG9ja2luZyB0aGlzIHRhc2suXG4gICAgY29uc3QgZGVwcyA9IGdyYXBoLmRlcGVuZGVuY2llc09mKHRhc2suZW50cnlQb2ludC5wYXRoKTtcbiAgICBjb25zdCBibG9ja2luZ1Rhc2tzID1cbiAgICAgICAgZGVwcy5maWx0ZXIoZGVwID0+IGNhbmRpZGF0ZUJsb2NrZXJzLmhhcyhkZXApKS5tYXAoZGVwID0+IGNhbmRpZGF0ZUJsb2NrZXJzLmdldChkZXApICEpO1xuXG4gICAgLy8gSWYgdGhpcyB0YXNrIGlzIGJsb2NrZWQsIGFkZCBpdCB0byB0aGUgbWFwIG9mIGJsb2NrZWQgdGFza3MuXG4gICAgaWYgKGJsb2NraW5nVGFza3MubGVuZ3RoID4gMCkge1xuICAgICAgYmxvY2tlZFRhc2tzTWFwLnNldCh0YXNrLCBuZXcgU2V0KGJsb2NraW5nVGFza3MpKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGlzIHRhc2sgY2FuIGJlIHBvdGVudGlhbGx5IGJsb2NraW5nIChpLmUuIGl0IGdlbmVyYXRlcyB0eXBpbmdzKSwgYWRkIGl0IHRvIHRoZSBsaXN0XG4gICAgLy8gb2YgY2FuZGlkYXRlIGJsb2NrZXJzIGZvciBzdWJzZXF1ZW50IHRhc2tzLlxuICAgIGlmICh0YXNrLnByb2Nlc3NEdHMpIHtcbiAgICAgIGNvbnN0IGVudHJ5UG9pbnRQYXRoID0gdGFzay5lbnRyeVBvaW50LnBhdGg7XG5cbiAgICAgIC8vIFRoZXJlIHNob3VsZCBvbmx5IGJlIG9uZSB0YXNrIHBlciBlbnRyeS1wb2ludCB0aGF0IGdlbmVyYXRlcyB0eXBpbmdzIChhbmQgdGh1cyBjYW4gYmxvY2tcbiAgICAgIC8vIG90aGVyIHRhc2tzKSwgc28gdGhlIGZvbGxvd2luZyBzaG91bGQgdGhlb3JldGljYWxseSBuZXZlciBoYXBwZW4sIGJ1dCBjaGVjayBqdXN0IGluIGNhc2UuXG4gICAgICBpZiAoY2FuZGlkYXRlQmxvY2tlcnMuaGFzKGVudHJ5UG9pbnRQYXRoKSkge1xuICAgICAgICBjb25zdCBvdGhlclRhc2sgPSBjYW5kaWRhdGVCbG9ja2Vycy5nZXQoZW50cnlQb2ludFBhdGgpICE7XG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgJ0ludmFyaWFudCB2aW9sYXRlZDogTXVsdGlwbGUgdGFza3MgYXJlIGFzc2lnbmVkIGdlbmVyYXRpbmcgdHlwaW5ncyBmb3IgJyArXG4gICAgICAgICAgICBgJyR7ZW50cnlQb2ludFBhdGh9JzpcXG4gIC0gJHtzdHJpbmdpZnlUYXNrKG90aGVyVGFzayl9XFxuICAtICR7c3RyaW5naWZ5VGFzayh0YXNrKX1gKTtcbiAgICAgIH1cblxuICAgICAgY2FuZGlkYXRlQmxvY2tlcnMuc2V0KGVudHJ5UG9pbnRQYXRoLCB0YXNrKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBibG9ja2VkVGFza3NNYXA7XG59XG5cbi8qKlxuICogU29ydCBhIGxpc3Qgb2YgdGFza3MgYnkgcHJpb3JpdHkuXG4gKlxuICogUHJpb3JpdHkgaXMgZGV0ZXJtaW5lZCBieSB0aGUgbnVtYmVyIG9mIG90aGVyIHRhc2tzIHRoYXQgYSB0YXNrIGlzICh0cmFuc2l0aXZlbHkpIGJsb2NraW5nOlxuICogVGhlIG1vcmUgdGFza3MgYSB0YXNrIGlzIGJsb2NraW5nIHRoZSBoaWdoZXIgaXRzIHByaW9yaXR5IGlzLCBiZWNhdXNlIHByb2Nlc3NpbmcgaXQgd2lsbFxuICogcG90ZW50aWFsbHkgdW5ibG9jayBtb3JlIHRhc2tzLlxuICpcbiAqIFRvIGtlZXAgdGhlIGJlaGF2aW9yIHByZWRpY3RhYmxlLCBpZiB0d28gdGFza3MgYmxvY2sgdGhlIHNhbWUgbnVtYmVyIG9mIG90aGVyIHRhc2tzLCB0aGVpclxuICogcmVsYXRpdmUgb3JkZXIgaW4gdGhlIG9yaWdpbmFsIGB0YXNrc2AgbGlzdHMgaXMgcHJlc2VydmVkLlxuICpcbiAqIEBwYXJhbSB0YXNrcyBBIChwYXJ0aWFsbHkgb3JkZXJlZCkgbGlzdCBvZiB0YXNrcy5cbiAqIEBwYXJhbSBibG9ja2VkVGFza3MgQSBtYXBwaW5nIGZyb20gYSB0YXNrIHRvIHRoZSBsaXN0IG9mIHRhc2tzIHRoYXQgYXJlIGJsb2NraW5nIGl0IChpZiBhbnkpLlxuICogQHJldHVybiBUaGUgbGlzdCBvZiB0YXNrcyBzb3J0ZWQgYnkgcHJpb3JpdHkuXG4gKi9cbmZ1bmN0aW9uIHNvcnRUYXNrc0J5UHJpb3JpdHkoXG4gICAgdGFza3M6IFBhcnRpYWxseU9yZGVyZWRUYXNrcywgYmxvY2tlZFRhc2tzOiBNYXA8VGFzaywgU2V0PFRhc2s+Pik6IFBhcnRpYWxseU9yZGVyZWRUYXNrcyB7XG4gIGNvbnN0IHByaW9yaXR5UGVyVGFzayA9IG5ldyBNYXA8VGFzaywgW251bWJlciwgbnVtYmVyXT4oKTtcbiAgY29uc3QgYWxsQmxvY2tpbmdUYXNrU2V0cyA9IEFycmF5LmZyb20oYmxvY2tlZFRhc2tzLnZhbHVlcygpKTtcbiAgY29uc3QgY29tcHV0ZVByaW9yaXR5ID0gKHRhc2s6IFRhc2ssIGlkeDogbnVtYmVyKTogW251bWJlciwgbnVtYmVyXSA9PlxuICAgICAgW2FsbEJsb2NraW5nVGFza1NldHMucmVkdWNlKFxuICAgICAgICAgICAoY291bnQsIGJsb2NraW5nVGFza3MpID0+IGNvdW50ICsgKGJsb2NraW5nVGFza3MuaGFzKHRhc2spID8gMSA6IDApLCAwKSxcbiAgICAgICBpZHgsXG4gIF07XG5cbiAgdGFza3MuZm9yRWFjaCgodGFzaywgaSkgPT4gcHJpb3JpdHlQZXJUYXNrLnNldCh0YXNrLCBjb21wdXRlUHJpb3JpdHkodGFzaywgaSkpKTtcblxuICByZXR1cm4gdGFza3Muc2xpY2UoKS5zb3J0KCh0YXNrMSwgdGFzazIpID0+IHtcbiAgICBjb25zdCBbcDEsIGlkeDFdID0gcHJpb3JpdHlQZXJUYXNrLmdldCh0YXNrMSkgITtcbiAgICBjb25zdCBbcDIsIGlkeDJdID0gcHJpb3JpdHlQZXJUYXNrLmdldCh0YXNrMikgITtcblxuICAgIHJldHVybiAocDIgLSBwMSkgfHwgKGlkeDEgLSBpZHgyKTtcbiAgfSk7XG59XG4iXX0=