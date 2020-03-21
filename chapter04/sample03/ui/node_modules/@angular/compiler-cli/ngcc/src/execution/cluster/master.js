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
        define("@angular/compiler-cli/ngcc/src/execution/cluster/master", ["require", "exports", "tslib", "cluster", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/execution/utils", "@angular/compiler-cli/ngcc/src/execution/cluster/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /// <reference types="node" />
    var cluster = require("cluster");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/execution/utils");
    var utils_2 = require("@angular/compiler-cli/ngcc/src/execution/cluster/utils");
    /**
     * The cluster master is responsible for analyzing all entry-points, planning the work that needs to
     * be done, distributing it to worker-processes and collecting/post-processing the results.
     */
    var ClusterMaster = /** @class */ (function () {
        function ClusterMaster(workerCount, logger, pkgJsonUpdater, analyzeEntryPoints) {
            this.workerCount = workerCount;
            this.logger = logger;
            this.pkgJsonUpdater = pkgJsonUpdater;
            this.finishedDeferred = new utils_2.Deferred();
            this.processingStartTime = -1;
            this.taskAssignments = new Map();
            if (!cluster.isMaster) {
                throw new Error('Tried to instantiate `ClusterMaster` on a worker process.');
            }
            this.taskQueue = analyzeEntryPoints();
        }
        ClusterMaster.prototype.run = function () {
            var _this = this;
            if (this.taskQueue.allTasksCompleted) {
                return Promise.resolve();
            }
            // Set up listeners for worker events (emitted on `cluster`).
            cluster.on('online', this.wrapEventHandler(function (worker) { return _this.onWorkerOnline(worker.id); }));
            cluster.on('message', this.wrapEventHandler(function (worker, msg) { return _this.onWorkerMessage(worker.id, msg); }));
            cluster.on('exit', this.wrapEventHandler(function (worker, code, signal) { return _this.onWorkerExit(worker, code, signal); }));
            // Since we have pending tasks at the very minimum we need a single worker.
            cluster.fork();
            return this.finishedDeferred.promise.then(function () { return _this.stopWorkers(); }, function (err) {
                _this.stopWorkers();
                return Promise.reject(err);
            });
        };
        /** Try to find available (idle) workers and assign them available (non-blocked) tasks. */
        ClusterMaster.prototype.maybeDistributeWork = function () {
            var e_1, _a;
            var isWorkerAvailable = false;
            // First, check whether all tasks have been completed.
            if (this.taskQueue.allTasksCompleted) {
                var duration = Math.round((Date.now() - this.processingStartTime) / 1000);
                this.logger.debug("Processed tasks in " + duration + "s.");
                return this.finishedDeferred.resolve();
            }
            try {
                // Look for available workers and available tasks to assign to them.
                for (var _b = tslib_1.__values(Array.from(this.taskAssignments)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = tslib_1.__read(_c.value, 2), workerId = _d[0], assignedTask = _d[1];
                    if (assignedTask !== null) {
                        // This worker already has a job; check other workers.
                        continue;
                    }
                    else {
                        // This worker is available.
                        isWorkerAvailable = true;
                    }
                    // This worker needs a job. See if any are available.
                    var task = this.taskQueue.getNextTask();
                    if (task === null) {
                        // No suitable work available right now.
                        break;
                    }
                    // Process the next task on the worker.
                    this.taskAssignments.set(workerId, task);
                    utils_2.sendMessageToWorker(workerId, { type: 'process-task', task: task });
                    isWorkerAvailable = false;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (!isWorkerAvailable) {
                if (this.taskAssignments.size < this.workerCount) {
                    this.logger.debug('Spawning another worker process as there is more work to be done.');
                    cluster.fork();
                }
                else {
                    // If there are no available workers or no available tasks, log (for debugging purposes).
                    this.logger.debug("All " + this.taskAssignments.size + " workers are currently busy and cannot take on more " +
                        'work.');
                }
            }
            else {
                var busyWorkers = Array.from(this.taskAssignments)
                    .filter(function (_a) {
                    var _b = tslib_1.__read(_a, 2), _workerId = _b[0], task = _b[1];
                    return task !== null;
                })
                    .map(function (_a) {
                    var _b = tslib_1.__read(_a, 1), workerId = _b[0];
                    return workerId;
                });
                var totalWorkerCount = this.taskAssignments.size;
                var idleWorkerCount = totalWorkerCount - busyWorkers.length;
                this.logger.debug("No assignments for " + idleWorkerCount + " idle (out of " + totalWorkerCount + " total) " +
                    ("workers. Busy workers: " + busyWorkers.join(', ')));
                if (busyWorkers.length === 0) {
                    // This is a bug:
                    // All workers are idle (meaning no tasks are in progress) and `taskQueue.allTasksCompleted`
                    // is `false`, but there is still no assignable work.
                    throw new Error('There are still unprocessed tasks in the queue and no tasks are currently in ' +
                        ("progress, yet the queue did not return any available tasks: " + this.taskQueue));
                }
            }
        };
        /** Handle a worker's exiting. (Might be intentional or not.) */
        ClusterMaster.prototype.onWorkerExit = function (worker, code, signal) {
            // If the worker's exiting was intentional, nothing to do.
            if (worker.exitedAfterDisconnect)
                return;
            // The worker exited unexpectedly: Determine it's status and take an appropriate action.
            var currentTask = this.taskAssignments.get(worker.id);
            this.logger.warn("Worker #" + worker.id + " exited unexpectedly (code: " + code + " | signal: " + signal + ").\n" +
                ("  Current assignment: " + ((currentTask == null) ? '-' : utils_1.stringifyTask(currentTask))));
            if (currentTask == null) {
                // The crashed worker process was not in the middle of a task:
                // Just spawn another process.
                this.logger.debug("Spawning another worker process to replace #" + worker.id + "...");
                this.taskAssignments.delete(worker.id);
                cluster.fork();
            }
            else {
                // The crashed worker process was in the middle of a task:
                // Impossible to know whether we can recover (without ending up with a corrupted entry-point).
                throw new Error('Process unexpectedly crashed, while processing format property ' +
                    (currentTask.formatProperty + " for entry-point '" + currentTask.entryPoint.path + "'."));
            }
        };
        /** Handle a message from a worker. */
        ClusterMaster.prototype.onWorkerMessage = function (workerId, msg) {
            if (!this.taskAssignments.has(workerId)) {
                var knownWorkers = Array.from(this.taskAssignments.keys());
                throw new Error("Received message from unknown worker #" + workerId + " (known workers: " +
                    (knownWorkers.join(', ') + "): " + JSON.stringify(msg)));
            }
            switch (msg.type) {
                case 'error':
                    throw new Error("Error on worker #" + workerId + ": " + msg.error);
                case 'task-completed':
                    return this.onWorkerTaskCompleted(workerId, msg);
                case 'update-package-json':
                    return this.onWorkerUpdatePackageJson(workerId, msg);
                default:
                    throw new Error("Invalid message received from worker #" + workerId + ": " + JSON.stringify(msg));
            }
        };
        /** Handle a worker's coming online. */
        ClusterMaster.prototype.onWorkerOnline = function (workerId) {
            if (this.taskAssignments.has(workerId)) {
                throw new Error("Invariant violated: Worker #" + workerId + " came online more than once.");
            }
            if (this.processingStartTime === -1) {
                this.logger.debug('Processing tasks...');
                this.processingStartTime = Date.now();
            }
            this.taskAssignments.set(workerId, null);
            this.maybeDistributeWork();
        };
        /** Handle a worker's having completed their assigned task. */
        ClusterMaster.prototype.onWorkerTaskCompleted = function (workerId, msg) {
            var task = this.taskAssignments.get(workerId) || null;
            if (task === null) {
                throw new Error("Expected worker #" + workerId + " to have a task assigned, while handling message: " +
                    JSON.stringify(msg));
            }
            utils_1.onTaskCompleted(this.pkgJsonUpdater, task, msg.outcome);
            this.taskQueue.markTaskCompleted(task);
            this.taskAssignments.set(workerId, null);
            this.maybeDistributeWork();
        };
        /** Handle a worker's request to update a `package.json` file. */
        ClusterMaster.prototype.onWorkerUpdatePackageJson = function (workerId, msg) {
            var task = this.taskAssignments.get(workerId) || null;
            if (task === null) {
                throw new Error("Expected worker #" + workerId + " to have a task assigned, while handling message: " +
                    JSON.stringify(msg));
            }
            var expectedPackageJsonPath = file_system_1.resolve(task.entryPoint.path, 'package.json');
            var parsedPackageJson = task.entryPoint.packageJson;
            if (expectedPackageJsonPath !== msg.packageJsonPath) {
                throw new Error("Received '" + msg.type + "' message from worker #" + workerId + " for '" + msg.packageJsonPath + "', " +
                    ("but was expecting '" + expectedPackageJsonPath + "' (based on task assignment)."));
            }
            // NOTE: Although the change in the parsed `package.json` will be reflected in tasks objects
            //       locally and thus also in future `process-task` messages sent to worker processes, any
            //       processes already running and processing a task for the same entry-point will not get
            //       the change.
            //       Do not rely on having an up-to-date `package.json` representation in worker processes.
            //       In other words, task processing should only rely on the info that was there when the
            //       file was initially parsed (during entry-point analysis) and not on the info that might
            //       be added later (during task processing).
            this.pkgJsonUpdater.writeChanges(msg.changes, msg.packageJsonPath, parsedPackageJson);
        };
        /** Stop all workers and stop listening on cluster events. */
        ClusterMaster.prototype.stopWorkers = function () {
            var workers = Object.values(cluster.workers);
            this.logger.debug("Stopping " + workers.length + " workers...");
            cluster.removeAllListeners();
            workers.forEach(function (worker) { return worker.kill(); });
        };
        /**
         * Wrap an event handler to ensure that `finishedDeferred` will be rejected on error (regardless
         * if the handler completes synchronously or asynchronously).
         */
        ClusterMaster.prototype.wrapEventHandler = function (fn) {
            var _this = this;
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var err_1;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, fn.apply(void 0, tslib_1.__spread(args))];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                err_1 = _a.sent();
                                this.finishedDeferred.reject(err_1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                });
            };
        };
        return ClusterMaster;
    }());
    exports.ClusterMaster = ClusterMaster;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFzdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2V4ZWN1dGlvbi9jbHVzdGVyL21hc3Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4QkFBOEI7SUFFOUIsaUNBQW1DO0lBRW5DLDJFQUEwRDtJQUkxRCx3RUFBd0Q7SUFHeEQsZ0ZBQXNEO0lBR3REOzs7T0FHRztJQUNIO1FBTUUsdUJBQ1ksV0FBbUIsRUFBVSxNQUFjLEVBQzNDLGNBQWtDLEVBQUUsa0JBQXdDO1lBRDVFLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUMzQyxtQkFBYyxHQUFkLGNBQWMsQ0FBb0I7WUFQdEMscUJBQWdCLEdBQUcsSUFBSSxnQkFBUSxFQUFRLENBQUM7WUFDeEMsd0JBQW1CLEdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDakMsb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztZQU1yRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTtnQkFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDO2FBQzlFO1lBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsRUFBRSxDQUFDO1FBQ3hDLENBQUM7UUFFRCwyQkFBRyxHQUFIO1lBQUEsaUJBc0JDO1lBckJDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRTtnQkFDcEMsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDMUI7WUFFRCw2REFBNkQ7WUFDN0QsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsS0FBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRSxD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YUFFckMsQ0FBQztRQUNKLENBQUM7UUFDSCxvQkFBQztJQUFELENBQUMsQUFsUEQsSUFrUEM7SUFsUFksc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwibm9kZVwiIC8+XG5cbmltcG9ydCAqIGFzIGNsdXN0ZXIgZnJvbSAnY2x1c3Rlcic7XG5cbmltcG9ydCB7cmVzb2x2ZX0gZnJvbSAnLi4vLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7TG9nZ2VyfSBmcm9tICcuLi8uLi9sb2dnaW5nL2xvZ2dlcic7XG5pbXBvcnQge1BhY2thZ2VKc29uVXBkYXRlcn0gZnJvbSAnLi4vLi4vd3JpdGluZy9wYWNrYWdlX2pzb25fdXBkYXRlcic7XG5pbXBvcnQge0FuYWx5emVFbnRyeVBvaW50c0ZuLCBUYXNrLCBUYXNrUXVldWV9IGZyb20gJy4uL2FwaSc7XG5pbXBvcnQge29uVGFza0NvbXBsZXRlZCwgc3RyaW5naWZ5VGFza30gZnJvbSAnLi4vdXRpbHMnO1xuXG5pbXBvcnQge01lc3NhZ2VGcm9tV29ya2VyLCBUYXNrQ29tcGxldGVkTWVzc2FnZSwgVXBkYXRlUGFja2FnZUpzb25NZXNzYWdlfSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge0RlZmVycmVkLCBzZW5kTWVzc2FnZVRvV29ya2VyfSBmcm9tICcuL3V0aWxzJztcblxuXG4vKipcbiAqIFRoZSBjbHVzdGVyIG1hc3RlciBpcyByZXNwb25zaWJsZSBmb3IgYW5hbHl6aW5nIGFsbCBlbnRyeS1wb2ludHMsIHBsYW5uaW5nIHRoZSB3b3JrIHRoYXQgbmVlZHMgdG9cbiAqIGJlIGRvbmUsIGRpc3RyaWJ1dGluZyBpdCB0byB3b3JrZXItcHJvY2Vzc2VzIGFuZCBjb2xsZWN0aW5nL3Bvc3QtcHJvY2Vzc2luZyB0aGUgcmVzdWx0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIENsdXN0ZXJNYXN0ZXIge1xuICBwcml2YXRlIGZpbmlzaGVkRGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQ8dm9pZD4oKTtcbiAgcHJpdmF0ZSBwcm9jZXNzaW5nU3RhcnRUaW1lOiBudW1iZXIgPSAtMTtcbiAgcHJpdmF0ZSB0YXNrQXNzaWdubWVudHMgPSBuZXcgTWFwPG51bWJlciwgVGFza3xudWxsPigpO1xuICBwcml2YXRlIHRhc2tRdWV1ZTogVGFza1F1ZXVlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSB3b3JrZXJDb3VudDogbnVtYmVyLCBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyLFxuICAgICAgcHJpdmF0ZSBwa2dKc29uVXBkYXRlcjogUGFja2FnZUpzb25VcGRhdGVyLCBhbmFseXplRW50cnlQb2ludHM6IEFuYWx5emVFbnRyeVBvaW50c0ZuKSB7XG4gICAgaWYgKCFjbHVzdGVyLmlzTWFzdGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyaWVkIHRvIGluc3RhbnRpYXRlIGBDbHVzdGVyTWFzdGVyYCBvbiBhIHdvcmtlciBwcm9jZXNzLicpO1xuICAgIH1cblxuICAgIHRoaXMudGFza1F1ZXVlID0gYW5hbHl6ZUVudHJ5UG9pbnRzKCk7XG4gIH1cblxuICBydW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMudGFza1F1ZXVlLmFsbFRhc2tzQ29tcGxldGVkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgLy8gU2V0IHVwIGxpc3RlbmVycyBmb3Igd29ya2VyIGV2ZW50cyAoZW1pdHRlZCBvbiBgY2x1c3RlcmApLlxuICAgIGNsdXN0ZXIub24oJ29ubGluZScsIHRoaXMud3JhcEV2ZW50SGFuZGxlcih3b3JrZXIgPT4gdGhpcy5vbldvcmtlck9ubGluZSh3b3JrZXIuaWQpKSk7XG5cbiAgICBjbHVzdGVyLm9uKFxuICAgICAgICAnbWVzc2FnZScsIHRoaXMud3JhcEV2ZW50SGFuZGxlcigod29ya2VyLCBtc2cpID0+IHRoaXMub25Xb3JrZXJNZXNzYWdlKHdvcmtlci5pZCwgbXNnKSkpO1xuXG4gICAgY2x1c3Rlci5vbihcbiAgICAgICAgJ2V4aXQnLFxuICAgICAgICB0aGlzLndyYXBFdmVudEhhbmRsZXIoKHdvcmtlciwgY29kZSwgc2lnbmFsKSA9PiB0aGlzLm9uV29ya2VyRXhpdCh3b3JrZXIsIGNvZGUsIHNpZ25hbCkpKTtcblxuICAgIC8vIFNpbmNlIHdlIGhhdmUgcGVuZGluZyB0YXNrcyBhdCB0aGUgdmVyeSBtaW5pbXVtIHdlIG5lZWQgYSBzaW5nbGUgd29ya2VyLlxuICAgIGNsdXN0ZXIuZm9yaygpO1xuXG4gICAgcmV0dXJuIHRoaXMuZmluaXNoZWREZWZlcnJlZC5wcm9taXNlLnRoZW4oKCkgPT4gdGhpcy5zdG9wV29ya2VycygpLCBlcnIgPT4ge1xuICAgICAgdGhpcy5zdG9wV29ya2VycygpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgfSk7XG4gIH1cblxuICAvKiogVHJ5IHRvIGZpbmQgYXZhaWxhYmxlIChpZGxlKSB3b3JrZXJzIGFuZCBhc3NpZ24gdGhlbSBhdmFpbGFibGUgKG5vbi1ibG9ja2VkKSB0YXNrcy4gKi9cbiAgcHJpdmF0ZSBtYXliZURpc3RyaWJ1dGVXb3JrKCk6IHZvaWQge1xuICAgIGxldCBpc1dvcmtlckF2YWlsYWJsZSA9IGZhbHNlO1xuXG4gICAgLy8gRmlyc3QsIGNoZWNrIHdoZXRoZXIgYWxsIHRhc2tzIGhhdmUgYmVlbiBjb21wbGV0ZWQuXG4gICAgaWYgKHRoaXMudGFza1F1ZXVlLmFsbFRhc2tzQ29tcGxldGVkKSB7XG4gICAgICBjb25zdCBkdXJhdGlvbiA9IE1hdGgucm91bmQoKERhdGUubm93KCkgLSB0aGlzLnByb2Nlc3NpbmdTdGFydFRpbWUpIC8gMTAwMCk7XG4gICAgICB0aGlzLmxvZ2dlci5kZWJ1ZyhgUHJvY2Vzc2VkIHRhc2tzIGluICR7ZHVyYXRpb259cy5gKTtcblxuICAgICAgcmV0dXJuIHRoaXMuZmluaXNoZWREZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgLy8gTG9vayBmb3IgYXZhaWxhYmxlIHdvcmtlcnMgYW5kIGF2YWlsYWJsZSB0YXNrcyB0byBhc3NpZ24gdG8gdGhlbS5cbiAgICBmb3IgKGNvbnN0IFt3b3JrZXJJZCwgYXNzaWduZWRUYXNrXSBvZiBBcnJheS5mcm9tKHRoaXMudGFza0Fzc2lnbm1lbnRzKSkge1xuICAgICAgaWYgKGFzc2lnbmVkVGFzayAhPT0gbnVsbCkge1xuICAgICAgICAvLyBUaGlzIHdvcmtlciBhbHJlYWR5IGhhcyBhIGpvYjsgY2hlY2sgb3RoZXIgd29ya2Vycy5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGlzIHdvcmtlciBpcyBhdmFpbGFibGUuXG4gICAgICAgIGlzV29ya2VyQXZhaWxhYmxlID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhpcyB3b3JrZXIgbmVlZHMgYSBqb2IuIFNlZSBpZiBhbnkgYXJlIGF2YWlsYWJsZS5cbiAgICAgIGNvbnN0IHRhc2sgPSB0aGlzLnRhc2tRdWV1ZS5nZXROZXh0VGFzaygpO1xuICAgICAgaWYgKHRhc2sgPT09IG51bGwpIHtcbiAgICAgICAgLy8gTm8gc3VpdGFibGUgd29yayBhdmFpbGFibGUgcmlnaHQgbm93LlxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gUHJvY2VzcyB0aGUgbmV4dCB0YXNrIG9uIHRoZSB3b3JrZXIuXG4gICAgICB0aGlzLnRhc2tBc3NpZ25tZW50cy5zZXQod29ya2VySWQsIHRhc2spO1xuICAgICAgc2VuZE1lc3NhZ2VUb1dvcmtlcih3b3JrZXJJZCwge3R5cGU6ICdwcm9jZXNzLXRhc2snLCB0YXNrfSk7XG5cbiAgICAgIGlzV29ya2VyQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFpc1dvcmtlckF2YWlsYWJsZSkge1xuICAgICAgaWYgKHRoaXMudGFza0Fzc2lnbm1lbnRzLnNpemUgPCB0aGlzLndvcmtlckNvdW50KSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTcGF3bmluZyBhbm90aGVyIHdvcmtlciBwcm9jZXNzIGFzIHRoZXJlIGlzIG1vcmUgd29yayB0byBiZSBkb25lLicpO1xuICAgICAgICBjbHVzdGVyLmZvcmsoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBhdmFpbGFibGUgd29ya2VycyBvciBubyBhdmFpbGFibGUgdGFza3MsIGxvZyAoZm9yIGRlYnVnZ2luZyBwdXJwb3NlcykuXG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKFxuICAgICAgICAgICAgYEFsbCAke3RoaXMudGFza0Fzc2lnbm1lbnRzLnNpemV9IHdvcmtlcnMgYXJlIGN1cnJlbnRseSBidXN5IGFuZCBjYW5ub3QgdGFrZSBvbiBtb3JlIGAgK1xuICAgICAgICAgICAgJ3dvcmsuJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGJ1c3lXb3JrZXJzID0gQXJyYXkuZnJvbSh0aGlzLnRhc2tBc3NpZ25tZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKFtfd29ya2VySWQsIHRhc2tdKSA9PiB0YXNrICE9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgoW3dvcmtlcklkXSkgPT4gd29ya2VySWQpO1xuICAgICAgY29uc3QgdG90YWxXb3JrZXJDb3VudCA9IHRoaXMudGFza0Fzc2lnbm1lbnRzLnNpemU7XG4gICAgICBjb25zdCBpZGxlV29ya2VyQ291bnQgPSB0b3RhbFdvcmtlckNvdW50IC0gYnVzeVdvcmtlcnMubGVuZ3RoO1xuXG4gICAgICB0aGlzLmxvZ2dlci5kZWJ1ZyhcbiAgICAgICAgICBgTm8gYXNzaWdubWVudHMgZm9yICR7aWRsZVdvcmtlckNvdW50fSBpZGxlIChvdXQgb2YgJHt0b3RhbFdvcmtlckNvdW50fSB0b3RhbCkgYCArXG4gICAgICAgICAgYHdvcmtlcnMuIEJ1c3kgd29ya2VyczogJHtidXN5V29ya2Vycy5qb2luKCcsICcpfWApO1xuXG4gICAgICBpZiAoYnVzeVdvcmtlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYSBidWc6XG4gICAgICAgIC8vIEFsbCB3b3JrZXJzIGFyZSBpZGxlIChtZWFuaW5nIG5vIHRhc2tzIGFyZSBpbiBwcm9ncmVzcykgYW5kIGB0YXNrUXVldWUuYWxsVGFza3NDb21wbGV0ZWRgXG4gICAgICAgIC8vIGlzIGBmYWxzZWAsIGJ1dCB0aGVyZSBpcyBzdGlsbCBubyBhc3NpZ25hYmxlIHdvcmsuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdUaGVyZSBhcmUgc3RpbGwgdW5wcm9jZXNzZWQgdGFza3MgaW4gdGhlIHF1ZXVlIGFuZCBubyB0YXNrcyBhcmUgY3VycmVudGx5IGluICcgK1xuICAgICAgICAgICAgYHByb2dyZXNzLCB5ZXQgdGhlIHF1ZXVlIGRpZCBub3QgcmV0dXJuIGFueSBhdmFpbGFibGUgdGFza3M6ICR7dGhpcy50YXNrUXVldWV9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEhhbmRsZSBhIHdvcmtlcidzIGV4aXRpbmcuIChNaWdodCBiZSBpbnRlbnRpb25hbCBvciBub3QuKSAqL1xuICBwcml2YXRlIG9uV29ya2VyRXhpdCh3b3JrZXI6IGNsdXN0ZXIuV29ya2VyLCBjb2RlOiBudW1iZXJ8bnVsbCwgc2lnbmFsOiBzdHJpbmd8bnVsbCk6IHZvaWQge1xuICAgIC8vIElmIHRoZSB3b3JrZXIncyBleGl0aW5nIHdhcyBpbnRlbnRpb25hbCwgbm90aGluZyB0byBkby5cbiAgICBpZiAod29ya2VyLmV4aXRlZEFmdGVyRGlzY29ubmVjdCkgcmV0dXJuO1xuXG4gICAgLy8gVGhlIHdvcmtlciBleGl0ZWQgdW5leHBlY3RlZGx5OiBEZXRlcm1pbmUgaXQncyBzdGF0dXMgYW5kIHRha2UgYW4gYXBwcm9wcmlhdGUgYWN0aW9uLlxuICAgIGNvbnN0IGN1cnJlbnRUYXNrID0gdGhpcy50YXNrQXNzaWdubWVudHMuZ2V0KHdvcmtlci5pZCk7XG5cbiAgICB0aGlzLmxvZ2dlci53YXJuKFxuICAgICAgICBgV29ya2VyICMke3dvcmtlci5pZH0gZXhpdGVkIHVuZXhwZWN0ZWRseSAoY29kZTogJHtjb2RlfSB8IHNpZ25hbDogJHtzaWduYWx9KS5cXG5gICtcbiAgICAgICAgYCAgQ3VycmVudCBhc3NpZ25tZW50OiAkeyhjdXJyZW50VGFzayA9PSBudWxsKSA/ICctJyA6IHN0cmluZ2lmeVRhc2soY3VycmVudFRhc2spfWApO1xuXG4gICAgaWYgKGN1cnJlbnRUYXNrID09IG51bGwpIHtcbiAgICAgIC8vIFRoZSBjcmFzaGVkIHdvcmtlciBwcm9jZXNzIHdhcyBub3QgaW4gdGhlIG1pZGRsZSBvZiBhIHRhc2s6XG4gICAgICAvLyBKdXN0IHNwYXduIGFub3RoZXIgcHJvY2Vzcy5cbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKGBTcGF3bmluZyBhbm90aGVyIHdvcmtlciBwcm9jZXNzIHRvIHJlcGxhY2UgIyR7d29ya2VyLmlkfS4uLmApO1xuICAgICAgdGhpcy50YXNrQXNzaWdubWVudHMuZGVsZXRlKHdvcmtlci5pZCk7XG4gICAgICBjbHVzdGVyLmZvcmsoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGNyYXNoZWQgd29ya2VyIHByb2Nlc3Mgd2FzIGluIHRoZSBtaWRkbGUgb2YgYSB0YXNrOlxuICAgICAgLy8gSW1wb3NzaWJsZSB0byBrbm93IHdoZXRoZXIgd2UgY2FuIHJlY292ZXIgKHdpdGhvdXQgZW5kaW5nIHVwIHdpdGggYSBjb3JydXB0ZWQgZW50cnktcG9pbnQpLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdQcm9jZXNzIHVuZXhwZWN0ZWRseSBjcmFzaGVkLCB3aGlsZSBwcm9jZXNzaW5nIGZvcm1hdCBwcm9wZXJ0eSAnICtcbiAgICAgICAgICBgJHtjdXJyZW50VGFzay5mb3JtYXRQcm9wZXJ0eX0gZm9yIGVudHJ5LXBvaW50ICcke2N1cnJlbnRUYXNrLmVudHJ5UG9pbnQucGF0aH0nLmApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBIYW5kbGUgYSBtZXNzYWdlIGZyb20gYSB3b3JrZXIuICovXG4gIHByaXZhdGUgb25Xb3JrZXJNZXNzYWdlKHdvcmtlcklkOiBudW1iZXIsIG1zZzogTWVzc2FnZUZyb21Xb3JrZXIpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMudGFza0Fzc2lnbm1lbnRzLmhhcyh3b3JrZXJJZCkpIHtcbiAgICAgIGNvbnN0IGtub3duV29ya2VycyA9IEFycmF5LmZyb20odGhpcy50YXNrQXNzaWdubWVudHMua2V5cygpKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgUmVjZWl2ZWQgbWVzc2FnZSBmcm9tIHVua25vd24gd29ya2VyICMke3dvcmtlcklkfSAoa25vd24gd29ya2VyczogYCArXG4gICAgICAgICAgYCR7a25vd25Xb3JrZXJzLmpvaW4oJywgJyl9KTogJHtKU09OLnN0cmluZ2lmeShtc2cpfWApO1xuICAgIH1cblxuICAgIHN3aXRjaCAobXNnLnR5cGUpIHtcbiAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciBvbiB3b3JrZXIgIyR7d29ya2VySWR9OiAke21zZy5lcnJvcn1gKTtcbiAgICAgIGNhc2UgJ3Rhc2stY29tcGxldGVkJzpcbiAgICAgICAgcmV0dXJuIHRoaXMub25Xb3JrZXJUYXNrQ29tcGxldGVkKHdvcmtlcklkLCBtc2cpO1xuICAgICAgY2FzZSAndXBkYXRlLXBhY2thZ2UtanNvbic6XG4gICAgICAgIHJldHVybiB0aGlzLm9uV29ya2VyVXBkYXRlUGFja2FnZUpzb24od29ya2VySWQsIG1zZyk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgSW52YWxpZCBtZXNzYWdlIHJlY2VpdmVkIGZyb20gd29ya2VyICMke3dvcmtlcklkfTogJHtKU09OLnN0cmluZ2lmeShtc2cpfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBIYW5kbGUgYSB3b3JrZXIncyBjb21pbmcgb25saW5lLiAqL1xuICBwcml2YXRlIG9uV29ya2VyT25saW5lKHdvcmtlcklkOiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy50YXNrQXNzaWdubWVudHMuaGFzKHdvcmtlcklkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhcmlhbnQgdmlvbGF0ZWQ6IFdvcmtlciAjJHt3b3JrZXJJZH0gY2FtZSBvbmxpbmUgbW9yZSB0aGFuIG9uY2UuYCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvY2Vzc2luZ1N0YXJ0VGltZSA9PT0gLTEpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdQcm9jZXNzaW5nIHRhc2tzLi4uJyk7XG4gICAgICB0aGlzLnByb2Nlc3NpbmdTdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIH1cblxuICAgIHRoaXMudGFza0Fzc2lnbm1lbnRzLnNldCh3b3JrZXJJZCwgbnVsbCk7XG4gICAgdGhpcy5tYXliZURpc3RyaWJ1dGVXb3JrKCk7XG4gIH1cblxuICAvKiogSGFuZGxlIGEgd29ya2VyJ3MgaGF2aW5nIGNvbXBsZXRlZCB0aGVpciBhc3NpZ25lZCB0YXNrLiAqL1xuICBwcml2YXRlIG9uV29ya2VyVGFza0NvbXBsZXRlZCh3b3JrZXJJZDogbnVtYmVyLCBtc2c6IFRhc2tDb21wbGV0ZWRNZXNzYWdlKTogdm9pZCB7XG4gICAgY29uc3QgdGFzayA9IHRoaXMudGFza0Fzc2lnbm1lbnRzLmdldCh3b3JrZXJJZCkgfHwgbnVsbDtcblxuICAgIGlmICh0YXNrID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEV4cGVjdGVkIHdvcmtlciAjJHt3b3JrZXJJZH0gdG8gaGF2ZSBhIHRhc2sgYXNzaWduZWQsIHdoaWxlIGhhbmRsaW5nIG1lc3NhZ2U6IGAgK1xuICAgICAgICAgIEpTT04uc3RyaW5naWZ5KG1zZykpO1xuICAgIH1cblxuICAgIG9uVGFza0NvbXBsZXRlZCh0aGlzLnBrZ0pzb25VcGRhdGVyLCB0YXNrLCBtc2cub3V0Y29tZSk7XG5cbiAgICB0aGlzLnRhc2tRdWV1ZS5tYXJrVGFza0NvbXBsZXRlZCh0YXNrKTtcbiAgICB0aGlzLnRhc2tBc3NpZ25tZW50cy5zZXQod29ya2VySWQsIG51bGwpO1xuICAgIHRoaXMubWF5YmVEaXN0cmlidXRlV29yaygpO1xuICB9XG5cbiAgLyoqIEhhbmRsZSBhIHdvcmtlcidzIHJlcXVlc3QgdG8gdXBkYXRlIGEgYHBhY2thZ2UuanNvbmAgZmlsZS4gKi9cbiAgcHJpdmF0ZSBvbldvcmtlclVwZGF0ZVBhY2thZ2VKc29uKHdvcmtlcklkOiBudW1iZXIsIG1zZzogVXBkYXRlUGFja2FnZUpzb25NZXNzYWdlKTogdm9pZCB7XG4gICAgY29uc3QgdGFzayA9IHRoaXMudGFza0Fzc2lnbm1lbnRzLmdldCh3b3JrZXJJZCkgfHwgbnVsbDtcblxuICAgIGlmICh0YXNrID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEV4cGVjdGVkIHdvcmtlciAjJHt3b3JrZXJJZH0gdG8gaGF2ZSBhIHRhc2sgYXNzaWduZWQsIHdoaWxlIGhhbmRsaW5nIG1lc3NhZ2U6IGAgK1xuICAgICAgICAgIEpTT04uc3RyaW5naWZ5KG1zZykpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4cGVjdGVkUGFja2FnZUpzb25QYXRoID0gcmVzb2x2ZSh0YXNrLmVudHJ5UG9pbnQucGF0aCwgJ3BhY2thZ2UuanNvbicpO1xuICAgIGNvbnN0IHBhcnNlZFBhY2thZ2VKc29uID0gdGFzay5lbnRyeVBvaW50LnBhY2thZ2VKc29uO1xuXG4gICAgaWYgKGV4cGVjdGVkUGFja2FnZUpzb25QYXRoICE9PSBtc2cucGFja2FnZUpzb25QYXRoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFJlY2VpdmVkICcke21zZy50eXBlfScgbWVzc2FnZSBmcm9tIHdvcmtlciAjJHt3b3JrZXJJZH0gZm9yICcke21zZy5wYWNrYWdlSnNvblBhdGh9JywgYCArXG4gICAgICAgICAgYGJ1dCB3YXMgZXhwZWN0aW5nICcke2V4cGVjdGVkUGFja2FnZUpzb25QYXRofScgKGJhc2VkIG9uIHRhc2sgYXNzaWdubWVudCkuYCk7XG4gICAgfVxuXG4gICAgLy8gTk9URTogQWx0aG91Z2ggdGhlIGNoYW5nZSBpbiB0aGUgcGFyc2VkIGBwYWNrYWdlLmpzb25gIHdpbGwgYmUgcmVmbGVjdGVkIGluIHRhc2tzIG9iamVjdHNcbiAgICAvLyAgICAgICBsb2NhbGx5IGFuZCB0aHVzIGFsc28gaW4gZnV0dXJlIGBwcm9jZXNzLXRhc2tgIG1lc3NhZ2VzIHNlbnQgdG8gd29ya2VyIHByb2Nlc3NlcywgYW55XG4gICAgLy8gICAgICAgcHJvY2Vzc2VzIGFscmVhZHkgcnVubmluZyBhbmQgcHJvY2Vzc2luZyBhIHRhc2sgZm9yIHRoZSBzYW1lIGVudHJ5LXBvaW50IHdpbGwgbm90IGdldFxuICAgIC8vICAgICAgIHRoZSBjaGFuZ2UuXG4gICAgLy8gICAgICAgRG8gbm90IHJlbHkgb24gaGF2aW5nIGFuIHVwLXRvLWRhdGUgYHBhY2thZ2UuanNvbmAgcmVwcmVzZW50YXRpb24gaW4gd29ya2VyIHByb2Nlc3Nlcy5cbiAgICAvLyAgICAgICBJbiBvdGhlciB3b3JkcywgdGFzayBwcm9jZXNzaW5nIHNob3VsZCBvbmx5IHJlbHkgb24gdGhlIGluZm8gdGhhdCB3YXMgdGhlcmUgd2hlbiB0aGVcbiAgICAvLyAgICAgICBmaWxlIHdhcyBpbml0aWFsbHkgcGFyc2VkIChkdXJpbmcgZW50cnktcG9pbnQgYW5hbHlzaXMpIGFuZCBub3Qgb24gdGhlIGluZm8gdGhhdCBtaWdodFxuICAgIC8vICAgICAgIGJlIGFkZGVkIGxhdGVyIChkdXJpbmcgdGFzayBwcm9jZXNzaW5nKS5cbiAgICB0aGlzLnBrZ0pzb25VcGRhdGVyLndyaXRlQ2hhbmdlcyhtc2cuY2hhbmdlcywgbXNnLnBhY2thZ2VKc29uUGF0aCwgcGFyc2VkUGFja2FnZUpzb24pO1xuICB9XG5cbiAgLyoqIFN0b3AgYWxsIHdvcmtlcnMgYW5kIHN0b3AgbGlzdGVuaW5nIG9uIGNsdXN0ZXIgZXZlbnRzLiAqL1xuICBwcml2YXRlIHN0b3BXb3JrZXJzKCk6IHZvaWQge1xuICAgIGNvbnN0IHdvcmtlcnMgPSBPYmplY3QudmFsdWVzKGNsdXN0ZXIud29ya2VycykgYXMgY2x1c3Rlci5Xb3JrZXJbXTtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZyhgU3RvcHBpbmcgJHt3b3JrZXJzLmxlbmd0aH0gd29ya2Vycy4uLmApO1xuXG4gICAgY2x1c3Rlci5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICB3b3JrZXJzLmZvckVhY2god29ya2VyID0+IHdvcmtlci5raWxsKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdyYXAgYW4gZXZlbnQgaGFuZGxlciB0byBlbnN1cmUgdGhhdCBgZmluaXNoZWREZWZlcnJlZGAgd2lsbCBiZSByZWplY3RlZCBvbiBlcnJvciAocmVnYXJkbGVzc1xuICAgKiBpZiB0aGUgaGFuZGxlciBjb21wbGV0ZXMgc3luY2hyb25vdXNseSBvciBhc3luY2hyb25vdXNseSkuXG4gICAqL1xuICBwcml2YXRlIHdyYXBFdmVudEhhbmRsZXI8QXJncyBleHRlbmRzIHVua25vd25bXT4oZm46ICguLi5hcmdzOiBBcmdzKSA9PiB2b2lkfFByb21pc2U8dm9pZD4pOlxuICAgICAgKC4uLmFyZ3M6IEFyZ3MpID0+IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBhc3luYyguLi5hcmdzOiBBcmdzKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBmbiguLi5hcmdzKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aGlzLmZpbmlzaGVkRGVmZXJyZWQucmVqZWN0KGVycik7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuIl19