(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/file_system/src/cached_file_system", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * A wrapper around `FileSystem` that caches hits to `exists()` and
     * `readFile()` to improve performance.
     *
     * Be aware that any changes to the file system from outside of this
     * class could break the cache, leaving it with stale values.
     */
    var CachedFileSystem = /** @class */ (function () {
        function CachedFileSystem(delegate) {
            this.delegate = delegate;
            this.existsCache = new Map();
            this.readFileCache = new Map();
        }
        CachedFileSystem.prototype.exists = function (path) {
            if (!this.existsCache.has(path)) {
                this.existsCache.set(path, this.delegate.exists(path));
            }
            return this.existsCache.get(path);
        };
        CachedFileSystem.prototype.invalidateCaches = function (path) {
            this.readFileCache.delete(path);
            this.existsCache.delete(path);
        };
        CachedFileSystem.prototype.readFile = function (path) {
            if (!this.readFileCache.has(path)) {
                try {
                    if (this.lstat(path).isSymbolicLink()) {
                        // don't cache the value of a symbolic link
                        return this.delegate.readFile(path);
                    }
                    this.readFileCache.set(path, this.delegate.readFile(path));
                }
                catch (e) {
                    this.readFileCache.set(path, e);
                }
            }
            var result = this.readFileCache.get(path);
            if (typeof result === 'string') {
                return result;
            }
            else {
                throw result;
            }
        };
        CachedFileSystem.prototype.writeFile = function (path, data, exclusive) {
            this.delegate.writeFile(path, data, exclusive);
            this.readFileCache.set(path, data);
            this.existsCache.set(path, true);
        };
        CachedFileSystem.prototype.removeFile = function (path) {
            this.delegate.removeFile(path);
            this.readFileCache.delete(path);
            this.existsCache.set(path, false);
        };
        CachedFileSystem.prototype.symlink = function (target, path) {
            this.delegate.symlink(target, path);
            this.existsCache.set(path, true);
        };
        CachedFileSystem.prototype.copyFile = function (from, to) {
            this.delegate.copyFile(from, to);
            this.existsCache.set(to, true);
        };
        CachedFileSystem.prototype.moveFile = function (from, to) {
            this.delegate.moveFile(from, to);
            this.existsCache.set(from, false);
            this.existsCache.set(to, true);
            if (this.readFileCache.has(from)) {
                this.readFileCache.set(to, this.readFileCache.get(from));
                this.readFileCache.delete(from);
            }
            else {
                this.readFileCache.delete(to);
            }
        };
        CachedFileSystem.prototype.ensureDir = function (path) {
            this.delegate.ensureDir(path);
            while (!this.isRoot(path)) {
                this.existsCache.set(path, true);
                path = this.dirname(path);
            }
        };
        CachedFileSystem.prototype.removeDeep = function (path) {
            var e_1, _a, e_2, _b;
            this.delegate.removeDeep(path);
            try {
                // Clear out this directory and all its children from the `exists` cache.
                for (var _c = tslib_1.__values(this.existsCache.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var p = _d.value;
                    if (p.startsWith(path)) {
                        this.existsCache.set(p, false);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                // Clear out this directory and all its children from the `readFile` cache.
                for (var _e = tslib_1.__values(this.readFileCache.keys()), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var p = _f.value;
                    if (p.startsWith(path)) {
                        this.readFileCache.delete(p);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_2) throw e_2.error; }
            }
        };
        CachedFileSystem.prototype.lstat = function (path) {
            var stat = this.delegate.lstat(path);
            // if the `path` does not exist then `lstat` will thrown an error.
            this.existsCache.set(path, true);
            return stat;
        };
        CachedFileSystem.prototype.stat = function (path) {
            var stat = this.delegate.stat(path);
            // if the `path` does not exist then `stat` will thrown an error.
            this.existsCache.set(path, true);
            return stat;
        };
        // The following methods simply call through to the delegate.
        CachedFileSystem.prototype.readdir = function (path) { return this.delegate.readdir(path); };
        CachedFileSystem.prototype.pwd = function () { return this.delegate.pwd(); };
        CachedFileSystem.prototype.chdir = function (path) { this.delegate.chdir(path); };
        CachedFileSystem.prototype.extname = function (path) { return this.delegate.extname(path); };
        CachedFileSystem.prototype.isCaseSensitive = function () { return this.delegate.isCaseSensitive(); };
        CachedFileSystem.prototype.isRoot = function (path) { return this.delegate.isRoot(path); };
        CachedFileSystem.prototype.isRooted = function (path) { return this.delegate.isRooted(path); };
        CachedFileSystem.prototype.resolve = function () {
            var _a;
            var paths = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                paths[_i] = arguments[_i];
            }
            return (_a = this.delegate).resolve.apply(_a, tslib_1.__spread(paths));
        };
        CachedFileSystem.prototype.dirname = function (file) { return this.delegate.dirname(file); };
        CachedFileSystem.prototype.join = function (basePath) {
            var _a;
            var paths = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                paths[_i - 1] = arguments[_i];
            }
            return (_a = this.delegate).join.apply(_a, tslib_1.__spread([basePath], paths));
        };
        CachedFileSystem.prototype.relative = function (from, to) {
            return this.delegate.relative(from, to);
        };
        CachedFileSystem.prototype.basename = function (filePath, extension) {
            return this.delegate.basename(filePath, extension);
        };
        CachedFileSystem.prototype.realpath = function (filePath) { return this.delegate.realpath(filePath); };
        CachedFileSystem.prototype.getDefaultLibLocation = function () { return this.delegate.getDefaultLibLocation(); };
        CachedFileSystem.prototype.normalize = function (path) { return this.delegate.normalize(path); };
        return CachedFileSystem;
    }());
    exports.CachedFileSystem = CachedFileSystem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGVkX2ZpbGVfc3lzdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9maWxlX3N5c3RlbS9zcmMvY2FjaGVkX2ZpbGVfc3lzdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVVBOzs7Ozs7T0FNRztJQUNIO1FBSUUsMEJBQW9CLFFBQW9CO1lBQXBCLGFBQVEsR0FBUixRQUFRLENBQVk7WUFIaEMsZ0JBQVcsR0FBRyxJQUFJLEdBQUcsRUFBMkIsQ0FBQztZQUNqRCxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO1FBRVosQ0FBQztRQUU1QyxpQ0FBTSxHQUFOLFVBQU8sSUFBb0I7WUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUMvQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUN4RDtZQUNELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFHLENBQUM7UUFDdEMsQ0FBQztRQUVELDJDQUFnQixHQUFoQixVQUFpQixJQUFvQjtZQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRUQsbUNBQVEsR0FBUixVQUFTLElBQW9CO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDakMsSUFBSTtvQkFDRixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENB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QUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2Rix1QkFBQztJQUFELENBQUMsQUF6SUQsSUF5SUM7SUF6SVksNENBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgRmlsZVN0YXRzLCBGaWxlU3lzdGVtLCBQYXRoU2VnbWVudCwgUGF0aFN0cmluZ30gZnJvbSAnLi90eXBlcyc7XG5cblxuLyoqXG4gKiBBIHdyYXBwZXIgYXJvdW5kIGBGaWxlU3lzdGVtYCB0aGF0IGNhY2hlcyBoaXRzIHRvIGBleGlzdHMoKWAgYW5kXG4gKiBgcmVhZEZpbGUoKWAgdG8gaW1wcm92ZSBwZXJmb3JtYW5jZS5cbiAqXG4gKiBCZSBhd2FyZSB0aGF0IGFueSBjaGFuZ2VzIHRvIHRoZSBmaWxlIHN5c3RlbSBmcm9tIG91dHNpZGUgb2YgdGhpc1xuICogY2xhc3MgY291bGQgYnJlYWsgdGhlIGNhY2hlLCBsZWF2aW5nIGl0IHdpdGggc3RhbGUgdmFsdWVzLlxuICovXG5leHBvcnQgY2xhc3MgQ2FjaGVkRmlsZVN5c3RlbSBpbXBsZW1lbnRzIEZpbGVTeXN0ZW0ge1xuICBwcml2YXRlIGV4aXN0c0NhY2hlID0gbmV3IE1hcDxBYnNvbHV0ZUZzUGF0aCwgYm9vbGVhbj4oKTtcbiAgcHJpdmF0ZSByZWFkRmlsZUNhY2hlID0gbmV3IE1hcDxBYnNvbHV0ZUZzUGF0aCwgYW55PigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZGVsZWdhdGU6IEZpbGVTeXN0ZW0pIHt9XG5cbiAgZXhpc3RzKHBhdGg6IEFic29sdXRlRnNQYXRoKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmV4aXN0c0NhY2hlLmhhcyhwYXRoKSkge1xuICAgICAgdGhpcy5leGlzdHNDYWNoZS5zZXQocGF0aCwgdGhpcy5kZWxlZ2F0ZS5leGlzdHMocGF0aCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGlzdHNDYWNoZS5nZXQocGF0aCkgITtcbiAgfVxuXG4gIGludmFsaWRhdGVDYWNoZXMocGF0aDogQWJzb2x1dGVGc1BhdGgpIHtcbiAgICB0aGlzLnJlYWRGaWxlQ2FjaGUuZGVsZXRlKHBhdGgpO1xuICAgIHRoaXMuZXhpc3RzQ2FjaGUuZGVsZXRlKHBhdGgpO1xuICB9XG5cbiAgcmVhZEZpbGUocGF0aDogQWJzb2x1dGVGc1BhdGgpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5yZWFkRmlsZUNhY2hlLmhhcyhwYXRoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHRoaXMubHN0YXQocGF0aCkuaXNTeW1ib2xpY0xpbmsoKSkge1xuICAgICAgICAgIC8vIGRvbid0IGNhY2hlIHRoZSB2YWx1ZSBvZiBhIHN5bWJvbGljIGxpbmtcbiAgICAgICAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5yZWFkRmlsZShwYXRoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlYWRGaWxlQ2FjaGUuc2V0KHBhdGgsIHRoaXMuZGVsZWdhdGUucmVhZEZpbGUocGF0aCkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLnJlYWRGaWxlQ2FjaGUuc2V0KHBhdGgsIGUpO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnJlYWRGaWxlQ2FjaGUuZ2V0KHBhdGgpO1xuICAgIGlmICh0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgcmVzdWx0O1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlRmlsZShwYXRoOiBBYnNvbHV0ZUZzUGF0aCwgZGF0YTogc3RyaW5nLCBleGNsdXNpdmU/OiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5kZWxlZ2F0ZS53cml0ZUZpbGUocGF0aCwgZGF0YSwgZXhjbHVzaXZlKTtcbiAgICB0aGlzLnJlYWRGaWxlQ2FjaGUuc2V0KHBhdGgsIGRhdGEpO1xuICAgIHRoaXMuZXhpc3RzQ2FjaGUuc2V0KHBhdGgsIHRydWUpO1xuICB9XG5cbiAgcmVtb3ZlRmlsZShwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQge1xuICAgIHRoaXMuZGVsZWdhdGUucmVtb3ZlRmlsZShwYXRoKTtcbiAgICB0aGlzLnJlYWRGaWxlQ2FjaGUuZGVsZXRlKHBhdGgpO1xuICAgIHRoaXMuZXhpc3RzQ2FjaGUuc2V0KHBhdGgsIGZhbHNlKTtcbiAgfVxuXG4gIHN5bWxpbmsodGFyZ2V0OiBBYnNvbHV0ZUZzUGF0aCwgcGF0aDogQWJzb2x1dGVGc1BhdGgpOiB2b2lkIHtcbiAgICB0aGlzLmRlbGVnYXRlLnN5bWxpbmsodGFyZ2V0LCBwYXRoKTtcbiAgICB0aGlzLmV4aXN0c0NhY2hlLnNldChwYXRoLCB0cnVlKTtcbiAgfVxuXG4gIGNvcHlGaWxlKGZyb206IEFic29sdXRlRnNQYXRoLCB0bzogQWJzb2x1dGVGc1BhdGgpOiB2b2lkIHtcbiAgICB0aGlzLmRlbGVnYXRlLmNvcHlGaWxlKGZyb20sIHRvKTtcbiAgICB0aGlzLmV4aXN0c0NhY2hlLnNldCh0bywgdHJ1ZSk7XG4gIH1cblxuICBtb3ZlRmlsZShmcm9tOiBBYnNvbHV0ZUZzUGF0aCwgdG86IEFic29sdXRlRnNQYXRoKTogdm9pZCB7XG4gICAgdGhpcy5kZWxlZ2F0ZS5tb3ZlRmlsZShmcm9tLCB0byk7XG5cbiAgICB0aGlzLmV4aXN0c0NhY2hlLnNldChmcm9tLCBmYWxzZSk7XG4gICAgdGhpcy5leGlzdHNDYWNoZS5zZXQodG8sIHRydWUpO1xuXG4gICAgaWYgKHRoaXMucmVhZEZpbGVDYWNoZS5oYXMoZnJvbSkpIHtcbiAgICAgIHRoaXMucmVhZEZpbGVDYWNoZS5zZXQodG8sIHRoaXMucmVhZEZpbGVDYWNoZS5nZXQoZnJvbSkpO1xuICAgICAgdGhpcy5yZWFkRmlsZUNhY2hlLmRlbGV0ZShmcm9tKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZWFkRmlsZUNhY2hlLmRlbGV0ZSh0byk7XG4gICAgfVxuICB9XG5cbiAgZW5zdXJlRGlyKHBhdGg6IEFic29sdXRlRnNQYXRoKTogdm9pZCB7XG4gICAgdGhpcy5kZWxlZ2F0ZS5lbnN1cmVEaXIocGF0aCk7XG4gICAgd2hpbGUgKCF0aGlzLmlzUm9vdChwYXRoKSkge1xuICAgICAgdGhpcy5leGlzdHNDYWNoZS5zZXQocGF0aCwgdHJ1ZSk7XG4gICAgICBwYXRoID0gdGhpcy5kaXJuYW1lKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZURlZXAocGF0aDogQWJzb2x1dGVGc1BhdGgpOiB2b2lkIHtcbiAgICB0aGlzLmRlbGVnYXRlLnJlbW92ZURlZXAocGF0aCk7XG5cbiAgICAvLyBDbGVhciBvdXQgdGhpcyBkaXJlY3RvcnkgYW5kIGFsbCBpdHMgY2hpbGRyZW4gZnJvbSB0aGUgYGV4aXN0c2AgY2FjaGUuXG4gICAgZm9yIChjb25zdCBwIG9mIHRoaXMuZXhpc3RzQ2FjaGUua2V5cygpKSB7XG4gICAgICBpZiAocC5zdGFydHNXaXRoKHBhdGgpKSB7XG4gICAgICAgIHRoaXMuZXhpc3RzQ2FjaGUuc2V0KHAsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDbGVhciBvdXQgdGhpcyBkaXJlY3RvcnkgYW5kIGFsbCBpdHMgY2hpbGRyZW4gZnJvbSB0aGUgYHJlYWRGaWxlYCBjYWNoZS5cbiAgICBmb3IgKGNvbnN0IHAgb2YgdGhpcy5yZWFkRmlsZUNhY2hlLmtleXMoKSkge1xuICAgICAgaWYgKHAuc3RhcnRzV2l0aChwYXRoKSkge1xuICAgICAgICB0aGlzLnJlYWRGaWxlQ2FjaGUuZGVsZXRlKHApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgbHN0YXQocGF0aDogQWJzb2x1dGVGc1BhdGgpOiBGaWxlU3RhdHMge1xuICAgIGNvbnN0IHN0YXQgPSB0aGlzLmRlbGVnYXRlLmxzdGF0KHBhdGgpO1xuICAgIC8vIGlmIHRoZSBgcGF0aGAgZG9lcyBub3QgZXhpc3QgdGhlbiBgbHN0YXRgIHdpbGwgdGhyb3duIGFuIGVycm9yLlxuICAgIHRoaXMuZXhpc3RzQ2FjaGUuc2V0KHBhdGgsIHRydWUpO1xuICAgIHJldHVybiBzdGF0O1xuICB9XG5cbiAgc3RhdChwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IEZpbGVTdGF0cyB7XG4gICAgY29uc3Qgc3RhdCA9IHRoaXMuZGVsZWdhdGUuc3RhdChwYXRoKTtcbiAgICAvLyBpZiB0aGUgYHBhdGhgIGRvZXMgbm90IGV4aXN0IHRoZW4gYHN0YXRgIHdpbGwgdGhyb3duIGFuIGVycm9yLlxuICAgIHRoaXMuZXhpc3RzQ2FjaGUuc2V0KHBhdGgsIHRydWUpO1xuICAgIHJldHVybiBzdGF0O1xuICB9XG5cbiAgLy8gVGhlIGZvbGxvd2luZyBtZXRob2RzIHNpbXBseSBjYWxsIHRocm91Z2ggdG8gdGhlIGRlbGVnYXRlLlxuICByZWFkZGlyKHBhdGg6IEFic29sdXRlRnNQYXRoKTogUGF0aFNlZ21lbnRbXSB7IHJldHVybiB0aGlzLmRlbGVnYXRlLnJlYWRkaXIocGF0aCk7IH1cbiAgcHdkKCk6IEFic29sdXRlRnNQYXRoIHsgcmV0dXJuIHRoaXMuZGVsZWdhdGUucHdkKCk7IH1cbiAgY2hkaXIocGF0aDogQWJzb2x1dGVGc1BhdGgpOiB2b2lkIHsgdGhpcy5kZWxlZ2F0ZS5jaGRpcihwYXRoKTsgfVxuICBleHRuYW1lKHBhdGg6IEFic29sdXRlRnNQYXRofFBhdGhTZWdtZW50KTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZGVsZWdhdGUuZXh0bmFtZShwYXRoKTsgfVxuICBpc0Nhc2VTZW5zaXRpdmUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmRlbGVnYXRlLmlzQ2FzZVNlbnNpdGl2ZSgpOyB9XG4gIGlzUm9vdChwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5pc1Jvb3QocGF0aCk7IH1cbiAgaXNSb290ZWQocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmRlbGVnYXRlLmlzUm9vdGVkKHBhdGgpOyB9XG4gIHJlc29sdmUoLi4ucGF0aHM6IHN0cmluZ1tdKTogQWJzb2x1dGVGc1BhdGggeyByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5yZXNvbHZlKC4uLnBhdGhzKTsgfVxuICBkaXJuYW1lPFQgZXh0ZW5kcyBQYXRoU3RyaW5nPihmaWxlOiBUKTogVCB7IHJldHVybiB0aGlzLmRlbGVnYXRlLmRpcm5hbWUoZmlsZSk7IH1cbiAgam9pbjxUIGV4dGVuZHMgUGF0aFN0cmluZz4oYmFzZVBhdGg6IFQsIC4uLnBhdGhzOiBzdHJpbmdbXSk6IFQge1xuICAgIHJldHVybiB0aGlzLmRlbGVnYXRlLmpvaW4oYmFzZVBhdGgsIC4uLnBhdGhzKTtcbiAgfVxuICByZWxhdGl2ZTxUIGV4dGVuZHMgUGF0aFN0cmluZz4oZnJvbTogVCwgdG86IFQpOiBQYXRoU2VnbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuZGVsZWdhdGUucmVsYXRpdmUoZnJvbSwgdG8pO1xuICB9XG4gIGJhc2VuYW1lKGZpbGVQYXRoOiBzdHJpbmcsIGV4dGVuc2lvbj86IHN0cmluZ3x1bmRlZmluZWQpOiBQYXRoU2VnbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuZGVsZWdhdGUuYmFzZW5hbWUoZmlsZVBhdGgsIGV4dGVuc2lvbik7XG4gIH1cbiAgcmVhbHBhdGgoZmlsZVBhdGg6IEFic29sdXRlRnNQYXRoKTogQWJzb2x1dGVGc1BhdGggeyByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5yZWFscGF0aChmaWxlUGF0aCk7IH1cbiAgZ2V0RGVmYXVsdExpYkxvY2F0aW9uKCk6IEFic29sdXRlRnNQYXRoIHsgcmV0dXJuIHRoaXMuZGVsZWdhdGUuZ2V0RGVmYXVsdExpYkxvY2F0aW9uKCk7IH1cbiAgbm9ybWFsaXplPFQgZXh0ZW5kcyBQYXRoU3RyaW5nPihwYXRoOiBUKTogVCB7IHJldHVybiB0aGlzLmRlbGVnYXRlLm5vcm1hbGl6ZShwYXRoKTsgfVxufVxuIl19