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
        define("@angular/compiler-cli/ngcc/src/execution/cluster/worker", ["require", "exports", "cluster", "@angular/compiler-cli/ngcc/src/execution/utils", "@angular/compiler-cli/ngcc/src/execution/cluster/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <reference types="node" />
    var cluster = require("cluster");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/execution/utils");
    var utils_2 = require("@angular/compiler-cli/ngcc/src/execution/cluster/utils");
    /**
     * A cluster worker is responsible for processing one task (i.e. one format property for a specific
     * entry-point) at a time and reporting results back to the cluster master.
     */
    var ClusterWorker = /** @class */ (function () {
        function ClusterWorker(logger, createCompileFn) {
            this.logger = logger;
            if (cluster.isMaster) {
                throw new Error('Tried to instantiate `ClusterWorker` on the master process.');
            }
            this.compile =
                createCompileFn(function (_task, outcome) { return utils_2.sendMessageToMaster({ type: 'task-completed', outcome: outcome }); });
        }
        ClusterWorker.prototype.run = function () {
            var _this = this;
            // Listen for `ProcessTaskMessage`s and process tasks.
            cluster.worker.on('message', function (msg) {
                try {
                    switch (msg.type) {
                        case 'process-task':
                            _this.logger.debug("[Worker #" + cluster.worker.id + "] Processing task: " + utils_1.stringifyTask(msg.task));
                            return _this.compile(msg.task);
                        default:
                            throw new Error("[Worker #" + cluster.worker.id + "] Invalid message received: " + JSON.stringify(msg));
                    }
                }
                catch (err) {
                    utils_2.sendMessageToMaster({
                        type: 'error',
                        error: (err instanceof Error) ? (err.stack || err.message) : err,
                    });
                }
            });
            // Return a promise that is never resolved.
            return new Promise(function () { return undefined; });
        };
        return ClusterWorker;
    }());
    exports.ClusterWorker = ClusterWorker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2V4ZWN1dGlvbi9jbHVzdGVyL3dvcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDhCQUE4QjtJQUU5QixpQ0FBbUM7SUFJbkMsd0VBQXVDO0lBR3ZDLGdGQUE0QztJQUc1Qzs7O09BR0c7SUFDSDtRQUdFLHVCQUFvQixNQUFjLEVBQUUsZUFBZ0M7WUFBaEQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUNoQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7Z0JBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQzthQUNoRjtZQUVELElBQUksQ0FBQyxPQUFPO2dCQUNSLGVBQWUsQ0FBQyxVQUFDLEtBQUssRUFBRSxPQUFPLElBQUssT0FBQSwyQkFBbUIsQ0FBQyxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDLEVBQXRELENBQXNELENBQUMsQ0FBQztRQUNsRyxDQUFDO1FBRUQsMkJBQUcsR0FBSDtZQUFBLGlCQXVCQztZQXRCQyxzREFBc0Q7WUFDdEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQUMsR0FBb0I7Z0JBQ2hELElBQUk7b0JBQ0YsUUFBUSxHQUFHLENBQUMsSUFBSSxFQUFFO3dCQUNoQixLQUFLLGNBQWM7NEJBQ2pCLEtBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUNiLGNBQVksT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLDJCQUFzQixxQkFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUcsQ0FBQyxDQUFDOzRCQUNsRixPQUFPLEtBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNoQzs0QkFDRSxNQUFNLElBQUksS0FBSyxDQUNYLGNBQVksT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLG9DQUErQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBRyxDQUFDLENBQUM7cUJBQzFGO2lCQUNGO2dCQUFDLE9BQU8sR0FBRyxFQUFFO29CQUNaLDJCQUFtQixDQUFDO3dCQUNsQixJQUFJLEVBQUUsT0FBTzt3QkFDYixLQUFLLEVBQUUsQ0FBQyxHQUFHLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUc7cUJBQ2pFLENBQUMsQ0FBQztpQkFDSjtZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsMkNBQTJDO1lBQzNDLE9BQU8sSUFBSSxPQUFPLENBQUMsY0FBTSxPQUFBLFNBQVMsRUFBVCxDQUFTLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQ0gsb0JBQUM7SUFBRCxDQUFDLEFBcENELElBb0NDO0lBcENZLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLy8gPHJlZmVyZW5jZSB0eXBlcz1cIm5vZGVcIiAvPlxuXG5pbXBvcnQgKiBhcyBjbHVzdGVyIGZyb20gJ2NsdXN0ZXInO1xuXG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZy9sb2dnZXInO1xuaW1wb3J0IHtDb21waWxlRm4sIENyZWF0ZUNvbXBpbGVGbn0gZnJvbSAnLi4vYXBpJztcbmltcG9ydCB7c3RyaW5naWZ5VGFza30gZnJvbSAnLi4vdXRpbHMnO1xuXG5pbXBvcnQge01lc3NhZ2VUb1dvcmtlcn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtzZW5kTWVzc2FnZVRvTWFzdGVyfSBmcm9tICcuL3V0aWxzJztcblxuXG4vKipcbiAqIEEgY2x1c3RlciB3b3JrZXIgaXMgcmVzcG9uc2libGUgZm9yIHByb2Nlc3Npbmcgb25lIHRhc2sgKGkuZS4gb25lIGZvcm1hdCBwcm9wZXJ0eSBmb3IgYSBzcGVjaWZpY1xuICogZW50cnktcG9pbnQpIGF0IGEgdGltZSBhbmQgcmVwb3J0aW5nIHJlc3VsdHMgYmFjayB0byB0aGUgY2x1c3RlciBtYXN0ZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBDbHVzdGVyV29ya2VyIHtcbiAgcHJpdmF0ZSBjb21waWxlOiBDb21waWxlRm47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBsb2dnZXI6IExvZ2dlciwgY3JlYXRlQ29tcGlsZUZuOiBDcmVhdGVDb21waWxlRm4pIHtcbiAgICBpZiAoY2x1c3Rlci5pc01hc3Rlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUcmllZCB0byBpbnN0YW50aWF0ZSBgQ2x1c3RlcldvcmtlcmAgb24gdGhlIG1hc3RlciBwcm9jZXNzLicpO1xuICAgIH1cblxuICAgIHRoaXMuY29tcGlsZSA9XG4gICAgICAgIGNyZWF0ZUNvbXBpbGVGbigoX3Rhc2ssIG91dGNvbWUpID0+IHNlbmRNZXNzYWdlVG9NYXN0ZXIoe3R5cGU6ICd0YXNrLWNvbXBsZXRlZCcsIG91dGNvbWV9KSk7XG4gIH1cblxuICBydW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gTGlzdGVuIGZvciBgUHJvY2Vzc1Rhc2tNZXNzYWdlYHMgYW5kIHByb2Nlc3MgdGFza3MuXG4gICAgY2x1c3Rlci53b3JrZXIub24oJ21lc3NhZ2UnLCAobXNnOiBNZXNzYWdlVG9Xb3JrZXIpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHN3aXRjaCAobXNnLnR5cGUpIHtcbiAgICAgICAgICBjYXNlICdwcm9jZXNzLXRhc2snOlxuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoXG4gICAgICAgICAgICAgICAgYFtXb3JrZXIgIyR7Y2x1c3Rlci53b3JrZXIuaWR9XSBQcm9jZXNzaW5nIHRhc2s6ICR7c3RyaW5naWZ5VGFzayhtc2cudGFzayl9YCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21waWxlKG1zZy50YXNrKTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBbV29ya2VyICMke2NsdXN0ZXIud29ya2VyLmlkfV0gSW52YWxpZCBtZXNzYWdlIHJlY2VpdmVkOiAke0pTT04uc3RyaW5naWZ5KG1zZyl9YCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBzZW5kTWVzc2FnZVRvTWFzdGVyKHtcbiAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgIGVycm9yOiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpID8gKGVyci5zdGFjayB8fCBlcnIubWVzc2FnZSkgOiBlcnIsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUmV0dXJuIGEgcHJvbWlzZSB0aGF0IGlzIG5ldmVyIHJlc29sdmVkLlxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB1bmRlZmluZWQpO1xuICB9XG59XG4iXX0=