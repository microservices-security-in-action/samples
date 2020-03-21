(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/file_system/src/node_js_file_system", ["require", "exports", "tslib", "fs", "fs-extra", "path", "@angular/compiler-cli/src/ngtsc/file_system/src/helpers"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /// <reference types="node" />
    var fs = require("fs");
    var fsExtra = require("fs-extra");
    var p = require("path");
    var helpers_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/helpers");
    /**
     * A wrapper around the Node.js file-system (i.e the `fs` package).
     */
    var NodeJSFileSystem = /** @class */ (function () {
        function NodeJSFileSystem() {
            this._caseSensitive = undefined;
        }
        NodeJSFileSystem.prototype.exists = function (path) { return fs.existsSync(path); };
        NodeJSFileSystem.prototype.readFile = function (path) { return fs.readFileSync(path, 'utf8'); };
        NodeJSFileSystem.prototype.writeFile = function (path, data, exclusive) {
            if (exclusive === void 0) { exclusive = false; }
            fs.writeFileSync(path, data, exclusive ? { flag: 'wx' } : undefined);
        };
        NodeJSFileSystem.prototype.removeFile = function (path) { fs.unlinkSync(path); };
        NodeJSFileSystem.prototype.symlink = function (target, path) { fs.symlinkSync(target, path); };
        NodeJSFileSystem.prototype.readdir = function (path) { return fs.readdirSync(path); };
        NodeJSFileSystem.prototype.lstat = function (path) { return fs.lstatSync(path); };
        NodeJSFileSystem.prototype.stat = function (path) { return fs.statSync(path); };
        NodeJSFileSystem.prototype.pwd = function () { return this.normalize(process.cwd()); };
        NodeJSFileSystem.prototype.chdir = function (dir) { process.chdir(dir); };
        NodeJSFileSystem.prototype.copyFile = function (from, to) { fs.copyFileSync(from, to); };
        NodeJSFileSystem.prototype.moveFile = function (from, to) { fs.renameSync(from, to); };
        NodeJSFileSystem.prototype.ensureDir = function (path) {
            var parents = [];
            while (!this.isRoot(path) && !this.exists(path)) {
                parents.push(path);
                path = this.dirname(path);
            }
            while (parents.length) {
                this.safeMkdir(parents.pop());
            }
        };
        NodeJSFileSystem.prototype.removeDeep = function (path) { fsExtra.removeSync(path); };
        NodeJSFileSystem.prototype.isCaseSensitive = function () {
            if (this._caseSensitive === undefined) {
                this._caseSensitive = this.exists(togglePathCase(__filename));
            }
            return this._caseSensitive;
        };
        NodeJSFileSystem.prototype.resolve = function () {
            var paths = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                paths[_i] = arguments[_i];
            }
            return this.normalize(p.resolve.apply(p, tslib_1.__spread(paths)));
        };
        NodeJSFileSystem.prototype.dirname = function (file) { return this.normalize(p.dirname(file)); };
        NodeJSFileSystem.prototype.join = function (basePath) {
            var paths = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                paths[_i - 1] = arguments[_i];
            }
            return this.normalize(p.join.apply(p, tslib_1.__spread([basePath], paths)));
        };
        NodeJSFileSystem.prototype.isRoot = function (path) { return this.dirname(path) === this.normalize(path); };
        NodeJSFileSystem.prototype.isRooted = function (path) { return p.isAbsolute(path); };
        NodeJSFileSystem.prototype.relative = function (from, to) {
            return helpers_1.relativeFrom(this.normalize(p.relative(from, to)));
        };
        NodeJSFileSystem.prototype.basename = function (filePath, extension) {
            return p.basename(filePath, extension);
        };
        NodeJSFileSystem.prototype.extname = function (path) { return p.extname(path); };
        NodeJSFileSystem.prototype.realpath = function (path) { return this.resolve(fs.realpathSync(path)); };
        NodeJSFileSystem.prototype.getDefaultLibLocation = function () {
            return this.resolve(require.resolve('typescript'), '..');
        };
        NodeJSFileSystem.prototype.normalize = function (path) {
            // Convert backslashes to forward slashes
            return path.replace(/\\/g, '/');
        };
        NodeJSFileSystem.prototype.safeMkdir = function (path) {
            try {
                fs.mkdirSync(path);
            }
            catch (err) {
                // Ignore the error, if the path already exists and points to a directory.
                // Re-throw otherwise.
                if (!this.exists(path) || !this.stat(path).isDirectory()) {
                    throw err;
                }
            }
        };
        return NodeJSFileSystem;
    }());
    exports.NodeJSFileSystem = NodeJSFileSystem;
    /**
     * Toggle the case of each character in a file path.
     */
    function togglePathCase(str) {
        return helpers_1.absoluteFrom(str.replace(/\w/g, function (ch) { return ch.toUpperCase() === ch ? ch.toLowerCase() : ch.toUpperCase(); }));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9qc19maWxlX3N5c3RlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0vc3JjL25vZGVfanNfZmlsZV9zeXN0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsOEJBQThCO0lBQzlCLHVCQUF5QjtJQUN6QixrQ0FBb0M7SUFDcEMsd0JBQTBCO0lBQzFCLG1GQUFxRDtJQUdyRDs7T0FFRztJQUNIO1FBQUE7WUFDVSxtQkFBYyxHQUFzQixTQUFTLENBQUM7UUFxRXhELENBQUM7UUFwRUMsaUNBQU0sR0FBTixVQUFPLElBQW9CLElBQWEsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRSxtQ0FBUSxHQUFSLFVBQVMsSUFBb0IsSUFBWSxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRixvQ0FBUyxHQUFULFVBQVUsSUFBb0IsRUFBRSxJQUFZLEVBQUUsU0FBMEI7WUFBMUIsMEJBQUEsRUFBQSxpQkFBMEI7WUFDdEUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFDRCxxQ0FBVSxHQUFWLFVBQVcsSUFBb0IsSUFBVSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRCxrQ0FBTyxHQUFQLFVBQVEsTUFBc0IsRUFBRSxJQUFvQixJQUFVLEVBQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMs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QUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7b0JBQ3hELE1BQU0sR0FBRyxDQUFDO2lCQUNYO2FBQ0Y7UUFDSCxDQUFDO1FBQ0gsdUJBQUM7SUFBRCxDQUFDLEFBdEVELElBc0VDO0lBdEVZLDRDQUFnQjtJQXdFN0I7O09BRUc7SUFDSCxTQUFTLGNBQWMsQ0FBQyxHQUFXO1FBQ2pDLE9BQU8sc0JBQVksQ0FDZixHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFBLEVBQUUsSUFBSSxPQUFBLEVBQUUsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxFQUE3RCxDQUE2RCxDQUFDLENBQUMsQ0FBQztJQUMvRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJub2RlXCIgLz5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIGZzRXh0cmEgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcCBmcm9tICdwYXRoJztcbmltcG9ydCB7YWJzb2x1dGVGcm9tLCByZWxhdGl2ZUZyb219IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBGaWxlU3RhdHMsIEZpbGVTeXN0ZW0sIFBhdGhTZWdtZW50LCBQYXRoU3RyaW5nfSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKiBBIHdyYXBwZXIgYXJvdW5kIHRoZSBOb2RlLmpzIGZpbGUtc3lzdGVtIChpLmUgdGhlIGBmc2AgcGFja2FnZSkuXG4gKi9cbmV4cG9ydCBjbGFzcyBOb2RlSlNGaWxlU3lzdGVtIGltcGxlbWVudHMgRmlsZVN5c3RlbSB7XG4gIHByaXZhdGUgX2Nhc2VTZW5zaXRpdmU6IGJvb2xlYW58dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBleGlzdHMocGF0aDogQWJzb2x1dGVGc1BhdGgpOiBib29sZWFuIHsgcmV0dXJuIGZzLmV4aXN0c1N5bmMocGF0aCk7IH1cbiAgcmVhZEZpbGUocGF0aDogQWJzb2x1dGVGc1BhdGgpOiBzdHJpbmcgeyByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHBhdGgsICd1dGY4Jyk7IH1cbiAgd3JpdGVGaWxlKHBhdGg6IEFic29sdXRlRnNQYXRoLCBkYXRhOiBzdHJpbmcsIGV4Y2x1c2l2ZTogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLCBkYXRhLCBleGNsdXNpdmUgPyB7ZmxhZzogJ3d4J30gOiB1bmRlZmluZWQpO1xuICB9XG4gIHJlbW92ZUZpbGUocGF0aDogQWJzb2x1dGVGc1BhdGgpOiB2b2lkIHsgZnMudW5saW5rU3luYyhwYXRoKTsgfVxuICBzeW1saW5rKHRhcmdldDogQWJzb2x1dGVGc1BhdGgsIHBhdGg6IEFic29sdXRlRnNQYXRoKTogdm9pZCB7IGZzLnN5bWxpbmtTeW5jKHRhcmdldCwgcGF0aCk7IH1cbiAgcmVhZGRpcihwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IFBhdGhTZWdtZW50W10geyByZXR1cm4gZnMucmVhZGRpclN5bmMocGF0aCkgYXMgUGF0aFNlZ21lbnRbXTsgfVxuICBsc3RhdChwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IEZpbGVTdGF0cyB7IHJldHVybiBmcy5sc3RhdFN5bmMocGF0aCk7IH1cbiAgc3RhdChwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IEZpbGVTdGF0cyB7IHJldHVybiBmcy5zdGF0U3luYyhwYXRoKTsgfVxuICBwd2QoKTogQWJzb2x1dGVGc1BhdGggeyByZXR1cm4gdGhpcy5ub3JtYWxpemUocHJvY2Vzcy5jd2QoKSkgYXMgQWJzb2x1dGVGc1BhdGg7IH1cbiAgY2hkaXIoZGlyOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQgeyBwcm9jZXNzLmNoZGlyKGRpcik7IH1cbiAgY29weUZpbGUoZnJvbTogQWJzb2x1dGVGc1BhdGgsIHRvOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQgeyBmcy5jb3B5RmlsZVN5bmMoZnJvbSwgdG8pOyB9XG4gIG1vdmVGaWxlKGZyb206IEFic29sdXRlRnNQYXRoLCB0bzogQWJzb2x1dGVGc1BhdGgpOiB2b2lkIHsgZnMucmVuYW1lU3luYyhmcm9tLCB0byk7IH1cbiAgZW5zdXJlRGlyKHBhdGg6IEFic29sdXRlRnNQYXRoKTogdm9pZCB7XG4gICAgY29uc3QgcGFyZW50czogQWJzb2x1dGVGc1BhdGhbXSA9IFtdO1xuICAgIHdoaWxlICghdGhpcy5pc1Jvb3QocGF0aCkgJiYgIXRoaXMuZXhpc3RzKHBhdGgpKSB7XG4gICAgICBwYXJlbnRzLnB1c2gocGF0aCk7XG4gICAgICBwYXRoID0gdGhpcy5kaXJuYW1lKHBhdGgpO1xuICAgIH1cbiAgICB3aGlsZSAocGFyZW50cy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuc2FmZU1rZGlyKHBhcmVudHMucG9wKCkgISk7XG4gICAgfVxuICB9XG4gIHJlbW92ZURlZXAocGF0aDogQWJzb2x1dGVGc1BhdGgpOiB2b2lkIHsgZnNFeHRyYS5yZW1vdmVTeW5jKHBhdGgpOyB9XG4gIGlzQ2FzZVNlbnNpdGl2ZSgpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5fY2FzZVNlbnNpdGl2ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9jYXNlU2Vuc2l0aXZlID0gdGhpcy5leGlzdHModG9nZ2xlUGF0aENhc2UoX19maWxlbmFtZSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY2FzZVNlbnNpdGl2ZTtcbiAgfVxuICByZXNvbHZlKC4uLnBhdGhzOiBzdHJpbmdbXSk6IEFic29sdXRlRnNQYXRoIHtcbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUocC5yZXNvbHZlKC4uLnBhdGhzKSkgYXMgQWJzb2x1dGVGc1BhdGg7XG4gIH1cblxuICBkaXJuYW1lPFQgZXh0ZW5kcyBzdHJpbmc+KGZpbGU6IFQpOiBUIHsgcmV0dXJuIHRoaXMubm9ybWFsaXplKHAuZGlybmFtZShmaWxlKSkgYXMgVDsgfVxuICBqb2luPFQgZXh0ZW5kcyBzdHJpbmc+KGJhc2VQYXRoOiBULCAuLi5wYXRoczogc3RyaW5nW10pOiBUIHtcbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUocC5qb2luKGJhc2VQYXRoLCAuLi5wYXRocykpIGFzIFQ7XG4gIH1cbiAgaXNSb290KHBhdGg6IEFic29sdXRlRnNQYXRoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmRpcm5hbWUocGF0aCkgPT09IHRoaXMubm9ybWFsaXplKHBhdGgpOyB9XG4gIGlzUm9vdGVkKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gcC5pc0Fic29sdXRlKHBhdGgpOyB9XG4gIHJlbGF0aXZlPFQgZXh0ZW5kcyBQYXRoU3RyaW5nPihmcm9tOiBULCB0bzogVCk6IFBhdGhTZWdtZW50IHtcbiAgICByZXR1cm4gcmVsYXRpdmVGcm9tKHRoaXMubm9ybWFsaXplKHAucmVsYXRpdmUoZnJvbSwgdG8pKSk7XG4gIH1cbiAgYmFzZW5hbWUoZmlsZVBhdGg6IHN0cmluZywgZXh0ZW5zaW9uPzogc3RyaW5nKTogUGF0aFNlZ21lbnQge1xuICAgIHJldHVybiBwLmJhc2VuYW1lKGZpbGVQYXRoLCBleHRlbnNpb24pIGFzIFBhdGhTZWdtZW50O1xuICB9XG4gIGV4dG5hbWUocGF0aDogQWJzb2x1dGVGc1BhdGh8UGF0aFNlZ21lbnQpOiBzdHJpbmcgeyByZXR1cm4gcC5leHRuYW1lKHBhdGgpOyB9XG4gIHJlYWxwYXRoKHBhdGg6IEFic29sdXRlRnNQYXRoKTogQWJzb2x1dGVGc1BhdGggeyByZXR1cm4gdGhpcy5yZXNvbHZlKGZzLnJlYWxwYXRoU3luYyhwYXRoKSk7IH1cbiAgZ2V0RGVmYXVsdExpYkxvY2F0aW9uKCk6IEFic29sdXRlRnNQYXRoIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlKHJlcXVpcmUucmVzb2x2ZSgndHlwZXNjcmlwdCcpLCAnLi4nKTtcbiAgfVxuICBub3JtYWxpemU8VCBleHRlbmRzIHN0cmluZz4ocGF0aDogVCk6IFQge1xuICAgIC8vIENvbnZlcnQgYmFja3NsYXNoZXMgdG8gZm9yd2FyZCBzbGFzaGVzXG4gICAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpIGFzIFQ7XG4gIH1cblxuICBwcml2YXRlIHNhZmVNa2RpcihwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBmcy5ta2RpclN5bmMocGF0aCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBJZ25vcmUgdGhlIGVycm9yLCBpZiB0aGUgcGF0aCBhbHJlYWR5IGV4aXN0cyBhbmQgcG9pbnRzIHRvIGEgZGlyZWN0b3J5LlxuICAgICAgLy8gUmUtdGhyb3cgb3RoZXJ3aXNlLlxuICAgICAgaWYgKCF0aGlzLmV4aXN0cyhwYXRoKSB8fCAhdGhpcy5zdGF0KHBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFRvZ2dsZSB0aGUgY2FzZSBvZiBlYWNoIGNoYXJhY3RlciBpbiBhIGZpbGUgcGF0aC5cbiAqL1xuZnVuY3Rpb24gdG9nZ2xlUGF0aENhc2Uoc3RyOiBzdHJpbmcpOiBBYnNvbHV0ZUZzUGF0aCB7XG4gIHJldHVybiBhYnNvbHV0ZUZyb20oXG4gICAgICBzdHIucmVwbGFjZSgvXFx3L2csIGNoID0+IGNoLnRvVXBwZXJDYXNlKCkgPT09IGNoID8gY2gudG9Mb3dlckNhc2UoKSA6IGNoLnRvVXBwZXJDYXNlKCkpKTtcbn1cbiJdfQ==