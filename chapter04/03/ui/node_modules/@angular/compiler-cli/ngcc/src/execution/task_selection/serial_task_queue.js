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
        define("@angular/compiler-cli/ngcc/src/execution/task_selection/serial_task_queue", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/execution/utils", "@angular/compiler-cli/ngcc/src/execution/task_selection/base_task_queue"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/execution/utils");
    var base_task_queue_1 = require("@angular/compiler-cli/ngcc/src/execution/task_selection/base_task_queue");
    /**
     * A `TaskQueue` implementation that assumes tasks are processed serially and each one is completed
     * before requesting the next one.
     */
    var SerialTaskQueue = /** @class */ (function (_super) {
        tslib_1.__extends(SerialTaskQueue, _super);
        function SerialTaskQueue() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SerialTaskQueue.prototype.getNextTask = function () {
            var nextTask = this.tasks.shift() || null;
            if (nextTask) {
                if (this.inProgressTasks.size > 0) {
                    // `SerialTaskQueue` can have max one in-progress task.
                    var inProgressTask = this.inProgressTasks.values().next().value;
                    throw new Error('Trying to get next task, while there is already a task in progress: ' +
                        utils_1.stringifyTask(inProgressTask));
                }
                this.inProgressTasks.add(nextTask);
            }
            return nextTask;
        };
        return SerialTaskQueue;
    }(base_task_queue_1.BaseTaskQueue));
    exports.SerialTaskQueue = SerialTaskQueue;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsX3Rhc2tfcXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvZXhlY3V0aW9uL3Rhc2tfc2VsZWN0aW9uL3NlcmlhbF90YXNrX3F1ZXVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUdILHdFQUF1QztJQUV2QywyR0FBZ0Q7SUFHaEQ7OztPQUdHO0lBQ0g7UUFBcUMsMkNBQWE7UUFBbEQ7O1FBa0JBLENBQUM7UUFqQkMscUNBQVcsR0FBWDtZQUNFLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDO1lBRTVDLElBQUksUUFBUSxFQUFFO2dCQUNaLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO29CQUNqQyx1REFBdUQ7b0JBQ3ZELElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDO29CQUNsRSxNQUFNLElBQUksS0FBSyxDQUNYLHNFQUFzRTt3QkFDdEUscUJBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2lCQUNwQztnQkFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNwQztZQUVELE9BQU8sUUFBUSxDQUFDO1FBQ2xCLENBQUM7UUFDSCxzQkFBQztJQUFELENBQUMsQUFsQkQsQ0FBcUMsK0JBQWEsR0FrQmpEO0lBbEJZLDBDQUFlIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1Rhc2t9IGZyb20gJy4uL2FwaSc7XG5pbXBvcnQge3N0cmluZ2lmeVRhc2t9IGZyb20gJy4uL3V0aWxzJztcblxuaW1wb3J0IHtCYXNlVGFza1F1ZXVlfSBmcm9tICcuL2Jhc2VfdGFza19xdWV1ZSc7XG5cblxuLyoqXG4gKiBBIGBUYXNrUXVldWVgIGltcGxlbWVudGF0aW9uIHRoYXQgYXNzdW1lcyB0YXNrcyBhcmUgcHJvY2Vzc2VkIHNlcmlhbGx5IGFuZCBlYWNoIG9uZSBpcyBjb21wbGV0ZWRcbiAqIGJlZm9yZSByZXF1ZXN0aW5nIHRoZSBuZXh0IG9uZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFNlcmlhbFRhc2tRdWV1ZSBleHRlbmRzIEJhc2VUYXNrUXVldWUge1xuICBnZXROZXh0VGFzaygpOiBUYXNrfG51bGwge1xuICAgIGNvbnN0IG5leHRUYXNrID0gdGhpcy50YXNrcy5zaGlmdCgpIHx8IG51bGw7XG5cbiAgICBpZiAobmV4dFRhc2spIHtcbiAgICAgIGlmICh0aGlzLmluUHJvZ3Jlc3NUYXNrcy5zaXplID4gMCkge1xuICAgICAgICAvLyBgU2VyaWFsVGFza1F1ZXVlYCBjYW4gaGF2ZSBtYXggb25lIGluLXByb2dyZXNzIHRhc2suXG4gICAgICAgIGNvbnN0IGluUHJvZ3Jlc3NUYXNrID0gdGhpcy5pblByb2dyZXNzVGFza3MudmFsdWVzKCkubmV4dCgpLnZhbHVlO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnVHJ5aW5nIHRvIGdldCBuZXh0IHRhc2ssIHdoaWxlIHRoZXJlIGlzIGFscmVhZHkgYSB0YXNrIGluIHByb2dyZXNzOiAnICtcbiAgICAgICAgICAgIHN0cmluZ2lmeVRhc2soaW5Qcm9ncmVzc1Rhc2spKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pblByb2dyZXNzVGFza3MuYWRkKG5leHRUYXNrKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dFRhc2s7XG4gIH1cbn1cbiJdfQ==