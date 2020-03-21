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
        define("@angular/compiler-cli/ngcc/src/execution/task_selection/base_task_queue", ["require", "exports", "@angular/compiler-cli/ngcc/src/execution/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils_1 = require("@angular/compiler-cli/ngcc/src/execution/utils");
    /**
     * A base `TaskQueue` implementation to be used as base for concrete implementations.
     */
    var BaseTaskQueue = /** @class */ (function () {
        function BaseTaskQueue(tasks) {
            this.tasks = tasks;
            this.inProgressTasks = new Set();
        }
        Object.defineProperty(BaseTaskQueue.prototype, "allTasksCompleted", {
            get: function () {
                return (this.tasks.length === 0) && (this.inProgressTasks.size === 0);
            },
            enumerable: true,
            configurable: true
        });
        BaseTaskQueue.prototype.markTaskCompleted = function (task) {
            if (!this.inProgressTasks.has(task)) {
                throw new Error("Trying to mark task that was not in progress as completed: " + utils_1.stringifyTask(task));
            }
            this.inProgressTasks.delete(task);
        };
        BaseTaskQueue.prototype.toString = function () {
            var inProgTasks = Array.from(this.inProgressTasks);
            return this.constructor.name + "\n" +
                ("  All tasks completed: " + this.allTasksCompleted + "\n") +
                ("  Unprocessed tasks (" + this.tasks.length + "): " + this.stringifyTasks(this.tasks, '    ') + "\n") +
                ("  In-progress tasks (" + inProgTasks.length + "): " + this.stringifyTasks(inProgTasks, '    '));
        };
        BaseTaskQueue.prototype.stringifyTasks = function (tasks, indentation) {
            return tasks.map(function (task) { return "\n" + indentation + "- " + utils_1.stringifyTask(task); }).join('');
        };
        return BaseTaskQueue;
    }());
    exports.BaseTaskQueue = BaseTaskQueue;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZV90YXNrX3F1ZXVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2V4ZWN1dGlvbi90YXNrX3NlbGVjdGlvbi9iYXNlX3Rhc2tfcXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFHSCx3RUFBdUM7SUFHdkM7O09BRUc7SUFDSDtRQU1FLHVCQUFzQixLQUE0QjtZQUE1QixVQUFLLEdBQUwsS0FBSyxDQUF1QjtZQUZ4QyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFRLENBQUM7UUFFUyxDQUFDO1FBTHRELHNCQUFJLDRDQUFpQjtpQkFBckI7Z0JBQ0UsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDeEUsQ0FBQzs7O1dBQUE7UUFPRCx5Q0FBaUIsR0FBakIsVUFBa0IsSUFBVTtZQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ25DLE1BQU0sSUFBSSxLQUFLLENBQ1gsZ0VBQThELHFCQUFhLENBQUMsSUFBSSxDQUFHLENBQUMsQ0FBQzthQUMxRjtZQUVELElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFRCxnQ0FBUSxHQUFSO1lBQ0UsSUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFckQsT0FBVSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksT0FBSTtpQkFDL0IsNEJBQTBCLElBQUksQ0FBQyxpQkFBaUIsT0FBSSxDQUFBO2lCQUNwRCwwQkFBd0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLFdBQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxPQUFJLENBQUE7aUJBQzFGLDBCQUF3QixXQUFXLENBQUMsTUFBTSxXQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBRyxDQUFBLENBQUM7UUFDakcsQ0FBQztRQUVTLHNDQUFjLEdBQXhCLFVBQXlCLEtBQWEsRUFBRSxXQUFtQjtZQUN6RCxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxPQUFLLFdBQVcsVUFBSyxxQkFBYSxDQUFDLElBQUksQ0FBRyxFQUExQyxDQUEwQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFDSCxvQkFBQztJQUFELENBQUMsQUEvQkQsSUErQkM7SUEvQnFCLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BhcnRpYWxseU9yZGVyZWRUYXNrcywgVGFzaywgVGFza1F1ZXVlfSBmcm9tICcuLi9hcGknO1xuaW1wb3J0IHtzdHJpbmdpZnlUYXNrfSBmcm9tICcuLi91dGlscyc7XG5cblxuLyoqXG4gKiBBIGJhc2UgYFRhc2tRdWV1ZWAgaW1wbGVtZW50YXRpb24gdG8gYmUgdXNlZCBhcyBiYXNlIGZvciBjb25jcmV0ZSBpbXBsZW1lbnRhdGlvbnMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlVGFza1F1ZXVlIGltcGxlbWVudHMgVGFza1F1ZXVlIHtcbiAgZ2V0IGFsbFRhc2tzQ29tcGxldGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAodGhpcy50YXNrcy5sZW5ndGggPT09IDApICYmICh0aGlzLmluUHJvZ3Jlc3NUYXNrcy5zaXplID09PSAwKTtcbiAgfVxuICBwcm90ZWN0ZWQgaW5Qcm9ncmVzc1Rhc2tzID0gbmV3IFNldDxUYXNrPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCB0YXNrczogUGFydGlhbGx5T3JkZXJlZFRhc2tzKSB7fVxuXG4gIGFic3RyYWN0IGdldE5leHRUYXNrKCk6IFRhc2t8bnVsbDtcblxuICBtYXJrVGFza0NvbXBsZXRlZCh0YXNrOiBUYXNrKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmluUHJvZ3Jlc3NUYXNrcy5oYXModGFzaykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVHJ5aW5nIHRvIG1hcmsgdGFzayB0aGF0IHdhcyBub3QgaW4gcHJvZ3Jlc3MgYXMgY29tcGxldGVkOiAke3N0cmluZ2lmeVRhc2sodGFzayl9YCk7XG4gICAgfVxuXG4gICAgdGhpcy5pblByb2dyZXNzVGFza3MuZGVsZXRlKHRhc2spO1xuICB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICBjb25zdCBpblByb2dUYXNrcyA9IEFycmF5LmZyb20odGhpcy5pblByb2dyZXNzVGFza3MpO1xuXG4gICAgcmV0dXJuIGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1cXG5gICtcbiAgICAgICAgYCAgQWxsIHRhc2tzIGNvbXBsZXRlZDogJHt0aGlzLmFsbFRhc2tzQ29tcGxldGVkfVxcbmAgK1xuICAgICAgICBgICBVbnByb2Nlc3NlZCB0YXNrcyAoJHt0aGlzLnRhc2tzLmxlbmd0aH0pOiAke3RoaXMuc3RyaW5naWZ5VGFza3ModGhpcy50YXNrcywgJyAgICAnKX1cXG5gICtcbiAgICAgICAgYCAgSW4tcHJvZ3Jlc3MgdGFza3MgKCR7aW5Qcm9nVGFza3MubGVuZ3RofSk6ICR7dGhpcy5zdHJpbmdpZnlUYXNrcyhpblByb2dUYXNrcywgJyAgICAnKX1gO1xuICB9XG5cbiAgcHJvdGVjdGVkIHN0cmluZ2lmeVRhc2tzKHRhc2tzOiBUYXNrW10sIGluZGVudGF0aW9uOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0YXNrcy5tYXAodGFzayA9PiBgXFxuJHtpbmRlbnRhdGlvbn0tICR7c3RyaW5naWZ5VGFzayh0YXNrKX1gKS5qb2luKCcnKTtcbiAgfVxufVxuIl19