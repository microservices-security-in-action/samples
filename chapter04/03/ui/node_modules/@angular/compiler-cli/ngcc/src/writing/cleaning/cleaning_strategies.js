(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/writing/cleaning/cleaning_strategies", ["require", "exports", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/packages/build_marker", "@angular/compiler-cli/ngcc/src/writing/in_place_file_writer", "@angular/compiler-cli/ngcc/src/writing/new_entry_point_file_writer", "@angular/compiler-cli/ngcc/src/writing/cleaning/utils"], factory);
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
    var build_marker_1 = require("@angular/compiler-cli/ngcc/src/packages/build_marker");
    var in_place_file_writer_1 = require("@angular/compiler-cli/ngcc/src/writing/in_place_file_writer");
    var new_entry_point_file_writer_1 = require("@angular/compiler-cli/ngcc/src/writing/new_entry_point_file_writer");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/writing/cleaning/utils");
    /**
     * A CleaningStrategy that reverts changes to package.json files by removing the build marker and
     * other properties.
     */
    var PackageJsonCleaner = /** @class */ (function () {
        function PackageJsonCleaner(fs) {
            this.fs = fs;
        }
        PackageJsonCleaner.prototype.canClean = function (_path, basename) {
            return basename === 'package.json';
        };
        PackageJsonCleaner.prototype.clean = function (path, _basename) {
            var packageJson = JSON.parse(this.fs.readFile(path));
            if (build_marker_1.cleanPackageJson(packageJson)) {
                this.fs.writeFile(path, JSON.stringify(packageJson, null, 2) + "\n");
            }
        };
        return PackageJsonCleaner;
    }());
    exports.PackageJsonCleaner = PackageJsonCleaner;
    /**
     * A CleaningStrategy that removes the extra directory containing generated entry-point formats.
     */
    var NgccDirectoryCleaner = /** @class */ (function () {
        function NgccDirectoryCleaner(fs) {
            this.fs = fs;
        }
        NgccDirectoryCleaner.prototype.canClean = function (path, basename) {
            return basename === new_entry_point_file_writer_1.NGCC_DIRECTORY && utils_1.isLocalDirectory(this.fs, path);
        };
        NgccDirectoryCleaner.prototype.clean = function (path, _basename) { this.fs.removeDeep(path); };
        return NgccDirectoryCleaner;
    }());
    exports.NgccDirectoryCleaner = NgccDirectoryCleaner;
    /**
     * A CleaningStrategy that reverts files that were overwritten and removes the backup files that
     * ngcc created.
     */
    var BackupFileCleaner = /** @class */ (function () {
        function BackupFileCleaner(fs) {
            this.fs = fs;
        }
        BackupFileCleaner.prototype.canClean = function (path, basename) {
            return this.fs.extname(basename) === in_place_file_writer_1.NGCC_BACKUP_EXTENSION &&
                this.fs.exists(file_system_1.absoluteFrom(path.replace(in_place_file_writer_1.NGCC_BACKUP_EXTENSION, '')));
        };
        BackupFileCleaner.prototype.clean = function (path, _basename) {
            this.fs.moveFile(path, file_system_1.absoluteFrom(path.replace(in_place_file_writer_1.NGCC_BACKUP_EXTENSION, '')));
        };
        return BackupFileCleaner;
    }());
    exports.BackupFileCleaner = BackupFileCleaner;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYW5pbmdfc3RyYXRlZ2llcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy93cml0aW5nL2NsZWFuaW5nL2NsZWFuaW5nX3N0cmF0ZWdpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyRUFBd0c7SUFDeEcscUZBQTZEO0lBQzdELG9HQUE4RDtJQUM5RCxrSEFBOEQ7SUFDOUQsK0VBQXlDO0lBVXpDOzs7T0FHRztJQUNIO1FBQ0UsNEJBQW9CLEVBQWM7WUFBZCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQUcsQ0FBQztRQUN0QyxxQ0FBUSxHQUFSLFVBQVMsS0FBcUIsRUFBRSxRQUFxQjtZQUNuRCxPQUFPLFFBQVEsS0FBSyxjQUFjLENBQUM7UUFDckMsQ0FBQztRQUNELGtDQUFLLEdBQUwsVUFBTSxJQUFvQixFQUFFLFNBQXNCO1lBQ2hELElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN2RCxJQUFJLCtCQUFnQixDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUNqQyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFJLENBQUMsQ0FBQzthQUN0RTtRQUNILENBQUM7UUFDSCx5QkFBQztJQUFELENBQUMsQUFYRCxJQVdDO0lBWFksZ0RBQWtCO0lBYS9COztPQUVHO0lBQ0g7UUFDRSw4QkFBb0IsRUFBYztZQUFkLE9BQUUsR0FBRixFQUFFLENBQVk7UUFBRyxDQUFDO1FBQ3RDLHVDQUFRLEdBQVIsVUFBUyxJQUFvQixFQUFFLFFBQXFCO1lBQ2xELE9BQU8sUUFBUSxLQUFLLDRDQUFjLElBQUksd0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBQ0Qsb0NBQUssR0FBTCxVQUFNLElBQW9CLEVBQUUsU0FBc0IsSUFBVSxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekYsMkJBQUM7SUFBRCxDQUFDLEFBTkQsSUFNQztJQU5ZLG9EQUFvQjtJQVFqQzs7O09BR0c7SUFDSDtRQUNFLDJCQUFvQixFQUFjO1lBQWQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUFHLENBQUM7UUFDdEMsb0NBQVEsR0FBUixVQUFTLElBQW9CLEVBQUUsUUFBcUI7WUFDbEQsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyw0Q0FBcUI7Z0JBQ3RELElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLDBCQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyw0Q0FBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUUsQ0FBQztRQUNELGlDQUFLLEdBQUwsVUFBTSxJQUFvQixFQUFFLFNBQXNCO1lBQ2hELElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSwwQkFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsNENBQXFCLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFDSCx3QkFBQztJQUFELENBQUMsQUFURCxJQVNDO0lBVFksOENBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgRmlsZVN5c3RlbSwgUGF0aFNlZ21lbnQsIGFic29sdXRlRnJvbX0gZnJvbSAnLi4vLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Y2xlYW5QYWNrYWdlSnNvbn0gZnJvbSAnLi4vLi4vcGFja2FnZXMvYnVpbGRfbWFya2VyJztcbmltcG9ydCB7TkdDQ19CQUNLVVBfRVhURU5TSU9OfSBmcm9tICcuLi9pbl9wbGFjZV9maWxlX3dyaXRlcic7XG5pbXBvcnQge05HQ0NfRElSRUNUT1JZfSBmcm9tICcuLi9uZXdfZW50cnlfcG9pbnRfZmlsZV93cml0ZXInO1xuaW1wb3J0IHtpc0xvY2FsRGlyZWN0b3J5fSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4qIEltcGxlbWVudCB0aGlzIGludGVyZmFjZSB0byBleHRlbmQgdGhlIGNsZWFuaW5nIHN0cmF0ZWdpZXMgb2YgdGhlIGBQYWNrYWdlQ2xlYW5lcmAuXG4qL1xuZXhwb3J0IGludGVyZmFjZSBDbGVhbmluZ1N0cmF0ZWd5IHtcbiAgY2FuQ2xlYW4ocGF0aDogQWJzb2x1dGVGc1BhdGgsIGJhc2VuYW1lOiBQYXRoU2VnbWVudCk6IGJvb2xlYW47XG4gIGNsZWFuKHBhdGg6IEFic29sdXRlRnNQYXRoLCBiYXNlbmFtZTogUGF0aFNlZ21lbnQpOiB2b2lkO1xufVxuXG4vKipcbiAqIEEgQ2xlYW5pbmdTdHJhdGVneSB0aGF0IHJldmVydHMgY2hhbmdlcyB0byBwYWNrYWdlLmpzb24gZmlsZXMgYnkgcmVtb3ZpbmcgdGhlIGJ1aWxkIG1hcmtlciBhbmRcbiAqIG90aGVyIHByb3BlcnRpZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBQYWNrYWdlSnNvbkNsZWFuZXIgaW1wbGVtZW50cyBDbGVhbmluZ1N0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBmczogRmlsZVN5c3RlbSkge31cbiAgY2FuQ2xlYW4oX3BhdGg6IEFic29sdXRlRnNQYXRoLCBiYXNlbmFtZTogUGF0aFNlZ21lbnQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYmFzZW5hbWUgPT09ICdwYWNrYWdlLmpzb24nO1xuICB9XG4gIGNsZWFuKHBhdGg6IEFic29sdXRlRnNQYXRoLCBfYmFzZW5hbWU6IFBhdGhTZWdtZW50KTogdm9pZCB7XG4gICAgY29uc3QgcGFja2FnZUpzb24gPSBKU09OLnBhcnNlKHRoaXMuZnMucmVhZEZpbGUocGF0aCkpO1xuICAgIGlmIChjbGVhblBhY2thZ2VKc29uKHBhY2thZ2VKc29uKSkge1xuICAgICAgdGhpcy5mcy53cml0ZUZpbGUocGF0aCwgYCR7SlNPTi5zdHJpbmdpZnkocGFja2FnZUpzb24sIG51bGwsIDIpfVxcbmApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEEgQ2xlYW5pbmdTdHJhdGVneSB0aGF0IHJlbW92ZXMgdGhlIGV4dHJhIGRpcmVjdG9yeSBjb250YWluaW5nIGdlbmVyYXRlZCBlbnRyeS1wb2ludCBmb3JtYXRzLlxuICovXG5leHBvcnQgY2xhc3MgTmdjY0RpcmVjdG9yeUNsZWFuZXIgaW1wbGVtZW50cyBDbGVhbmluZ1N0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBmczogRmlsZVN5c3RlbSkge31cbiAgY2FuQ2xlYW4ocGF0aDogQWJzb2x1dGVGc1BhdGgsIGJhc2VuYW1lOiBQYXRoU2VnbWVudCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBiYXNlbmFtZSA9PT0gTkdDQ19ESVJFQ1RPUlkgJiYgaXNMb2NhbERpcmVjdG9yeSh0aGlzLmZzLCBwYXRoKTtcbiAgfVxuICBjbGVhbihwYXRoOiBBYnNvbHV0ZUZzUGF0aCwgX2Jhc2VuYW1lOiBQYXRoU2VnbWVudCk6IHZvaWQgeyB0aGlzLmZzLnJlbW92ZURlZXAocGF0aCk7IH1cbn1cblxuLyoqXG4gKiBBIENsZWFuaW5nU3RyYXRlZ3kgdGhhdCByZXZlcnRzIGZpbGVzIHRoYXQgd2VyZSBvdmVyd3JpdHRlbiBhbmQgcmVtb3ZlcyB0aGUgYmFja3VwIGZpbGVzIHRoYXRcbiAqIG5nY2MgY3JlYXRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEJhY2t1cEZpbGVDbGVhbmVyIGltcGxlbWVudHMgQ2xlYW5pbmdTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZnM6IEZpbGVTeXN0ZW0pIHt9XG4gIGNhbkNsZWFuKHBhdGg6IEFic29sdXRlRnNQYXRoLCBiYXNlbmFtZTogUGF0aFNlZ21lbnQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5mcy5leHRuYW1lKGJhc2VuYW1lKSA9PT0gTkdDQ19CQUNLVVBfRVhURU5TSU9OICYmXG4gICAgICAgIHRoaXMuZnMuZXhpc3RzKGFic29sdXRlRnJvbShwYXRoLnJlcGxhY2UoTkdDQ19CQUNLVVBfRVhURU5TSU9OLCAnJykpKTtcbiAgfVxuICBjbGVhbihwYXRoOiBBYnNvbHV0ZUZzUGF0aCwgX2Jhc2VuYW1lOiBQYXRoU2VnbWVudCk6IHZvaWQge1xuICAgIHRoaXMuZnMubW92ZUZpbGUocGF0aCwgYWJzb2x1dGVGcm9tKHBhdGgucmVwbGFjZShOR0NDX0JBQ0tVUF9FWFRFTlNJT04sICcnKSkpO1xuICB9XG59XG4iXX0=