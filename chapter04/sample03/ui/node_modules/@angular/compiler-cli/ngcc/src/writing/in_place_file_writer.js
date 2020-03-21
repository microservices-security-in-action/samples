(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/writing/in_place_file_writer", ["require", "exports", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    exports.NGCC_BACKUP_EXTENSION = '.__ivy_ngcc_bak';
    /**
     * This FileWriter overwrites the transformed file, in-place, while creating
     * a back-up of the original file with an extra `.__ivy_ngcc_bak` extension.
     */
    var InPlaceFileWriter = /** @class */ (function () {
        function InPlaceFileWriter(fs) {
            this.fs = fs;
        }
        InPlaceFileWriter.prototype.writeBundle = function (_bundle, transformedFiles, _formatProperties) {
            var _this = this;
            transformedFiles.forEach(function (file) { return _this.writeFileAndBackup(file); });
        };
        InPlaceFileWriter.prototype.writeFileAndBackup = function (file) {
            this.fs.ensureDir(file_system_1.dirname(file.path));
            var backPath = file_system_1.absoluteFrom("" + file.path + exports.NGCC_BACKUP_EXTENSION);
            if (this.fs.exists(backPath)) {
                throw new Error("Tried to overwrite " + backPath + " with an ngcc back up file, which is disallowed.");
            }
            if (this.fs.exists(file.path)) {
                this.fs.moveFile(file.path, backPath);
            }
            this.fs.writeFile(file.path, file.contents);
        };
        return InPlaceFileWriter;
    }());
    exports.InPlaceFileWriter = InPlaceFileWriter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5fcGxhY2VfZmlsZV93cml0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvd3JpdGluZy9pbl9wbGFjZV9maWxlX3dyaXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUNBOzs7Ozs7T0FNRztJQUNILDJFQUFpRjtJQU1wRSxRQUFBLHFCQUFxQixHQUFHLGlCQUFpQixDQUFDO0lBQ3ZEOzs7T0FHRztJQUNIO1FBQ0UsMkJBQXNCLEVBQWM7WUFBZCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQUcsQ0FBQztRQUV4Qyx1Q0FBVyxHQUFYLFVBQ0ksT0FBeUIsRUFBRSxnQkFBK0IsRUFDMUQsaUJBQTRDO1lBRmhELGlCQUlDO1lBREMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsS0FBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUE3QixDQUE2QixDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUVTLDhDQUFrQixHQUE1QixVQUE2QixJQUFpQjtZQUM1QyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxxQkFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLElBQU0sUUFBUSxHQUFHLDBCQUFZLENBQUMsS0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLDZCQUF1QixDQUFDLENBQUM7WUFDdEUsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDNUIsTUFBTSxJQUFJLEtBQUssQ0FDWCx3QkFBc0IsUUFBUSxxREFBa0QsQ0FBQyxDQUFDO2FBQ3ZGO1lBQ0QsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDdkM7WUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBQ0gsd0JBQUM7SUFBRCxDQUFDLEFBckJELElBcUJDO0lBckJZLDhDQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIlxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtGaWxlU3lzdGVtLCBhYnNvbHV0ZUZyb20sIGRpcm5hbWV9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0VudHJ5UG9pbnRKc29uUHJvcGVydHl9IGZyb20gJy4uL3BhY2thZ2VzL2VudHJ5X3BvaW50JztcbmltcG9ydCB7RW50cnlQb2ludEJ1bmRsZX0gZnJvbSAnLi4vcGFja2FnZXMvZW50cnlfcG9pbnRfYnVuZGxlJztcbmltcG9ydCB7RmlsZVRvV3JpdGV9IGZyb20gJy4uL3JlbmRlcmluZy91dGlscyc7XG5pbXBvcnQge0ZpbGVXcml0ZXJ9IGZyb20gJy4vZmlsZV93cml0ZXInO1xuXG5leHBvcnQgY29uc3QgTkdDQ19CQUNLVVBfRVhURU5TSU9OID0gJy5fX2l2eV9uZ2NjX2Jhayc7XG4vKipcbiAqIFRoaXMgRmlsZVdyaXRlciBvdmVyd3JpdGVzIHRoZSB0cmFuc2Zvcm1lZCBmaWxlLCBpbi1wbGFjZSwgd2hpbGUgY3JlYXRpbmdcbiAqIGEgYmFjay11cCBvZiB0aGUgb3JpZ2luYWwgZmlsZSB3aXRoIGFuIGV4dHJhIGAuX19pdnlfbmdjY19iYWtgIGV4dGVuc2lvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIEluUGxhY2VGaWxlV3JpdGVyIGltcGxlbWVudHMgRmlsZVdyaXRlciB7XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBmczogRmlsZVN5c3RlbSkge31cblxuICB3cml0ZUJ1bmRsZShcbiAgICAgIF9idW5kbGU6IEVudHJ5UG9pbnRCdW5kbGUsIHRyYW5zZm9ybWVkRmlsZXM6IEZpbGVUb1dyaXRlW10sXG4gICAgICBfZm9ybWF0UHJvcGVydGllcz86IEVudHJ5UG9pbnRKc29uUHJvcGVydHlbXSkge1xuICAgIHRyYW5zZm9ybWVkRmlsZXMuZm9yRWFjaChmaWxlID0+IHRoaXMud3JpdGVGaWxlQW5kQmFja3VwKGZpbGUpKTtcbiAgfVxuXG4gIHByb3RlY3RlZCB3cml0ZUZpbGVBbmRCYWNrdXAoZmlsZTogRmlsZVRvV3JpdGUpOiB2b2lkIHtcbiAgICB0aGlzLmZzLmVuc3VyZURpcihkaXJuYW1lKGZpbGUucGF0aCkpO1xuICAgIGNvbnN0IGJhY2tQYXRoID0gYWJzb2x1dGVGcm9tKGAke2ZpbGUucGF0aH0ke05HQ0NfQkFDS1VQX0VYVEVOU0lPTn1gKTtcbiAgICBpZiAodGhpcy5mcy5leGlzdHMoYmFja1BhdGgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFRyaWVkIHRvIG92ZXJ3cml0ZSAke2JhY2tQYXRofSB3aXRoIGFuIG5nY2MgYmFjayB1cCBmaWxlLCB3aGljaCBpcyBkaXNhbGxvd2VkLmApO1xuICAgIH1cbiAgICBpZiAodGhpcy5mcy5leGlzdHMoZmlsZS5wYXRoKSkge1xuICAgICAgdGhpcy5mcy5tb3ZlRmlsZShmaWxlLnBhdGgsIGJhY2tQYXRoKTtcbiAgICB9XG4gICAgdGhpcy5mcy53cml0ZUZpbGUoZmlsZS5wYXRoLCBmaWxlLmNvbnRlbnRzKTtcbiAgfVxufVxuIl19