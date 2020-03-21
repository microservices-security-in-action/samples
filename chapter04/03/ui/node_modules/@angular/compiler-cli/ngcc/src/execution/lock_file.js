(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/execution/lock_file", ["require", "exports", "process"], factory);
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
    var process = require("process");
    /**
     * The LockFile is used to prevent more than one instance of ngcc executing at the same time.
     *
     * When ngcc starts executing, it creates a file in the `compiler-cli/ngcc` folder. If it finds one
     * is already there then it fails with a suitable error message.
     * When ngcc completes executing, it removes the file so that future ngcc executions can start.
     */
    var LockFile = /** @class */ (function () {
        function LockFile(fs) {
            var _this = this;
            this.fs = fs;
            this.lockFilePath = this.fs.resolve(require.resolve('@angular/compiler-cli/ngcc'), '../__ngcc_lock_file__');
            /**
             * This handle needs to be defined as a property rather than a method
             * so that it can be passed around as a bound function.
             */
            this.signalHandler = function () {
                _this.remove();
                _this.exit(1);
            };
        }
        /**
         * Run a function guarded by the lock file.
         *
         * Note that T can be a Promise. If so, we run the `remove()` call in the promise's `finally`
         * handler. Otherwise we run the `remove()` call in the `try...finally` block.
         *
         * @param fn The function to run.
         */
        LockFile.prototype.lock = function (fn) {
            var _this = this;
            var isAsync = false;
            this.create();
            try {
                var result = fn();
                if (result instanceof Promise) {
                    isAsync = true;
                    // The cast is necessary because TS cannot deduce that T is now a promise here.
                    return result.finally(function () { return _this.remove(); });
                }
                else {
                    return result;
                }
            }
            finally {
                if (!isAsync) {
                    this.remove();
                }
            }
        };
        /**
         * Write a lock file to disk, or error if there is already one there.
         */
        LockFile.prototype.create = function () {
            try {
                this.addSignalHandlers();
                // To avoid race conditions, we check for existence of the lockfile
                // by actually trying to create it exclusively
                this.fs.writeFile(this.lockFilePath, process.pid.toString(), /* exclusive */ true);
            }
            catch (e) {
                this.removeSignalHandlers();
                if (e.code !== 'EEXIST') {
                    throw e;
                }
                // The lockfile already exists so raise a helpful error.
                // It is feasible that the lockfile was removed between the previous check for existence
                // and this file-read. If so then we still error but as gracefully as possible.
                var pid = void 0;
                try {
                    pid = this.fs.readFile(this.lockFilePath);
                }
                catch (_a) {
                    pid = '{unknown}';
                }
                throw new Error("ngcc is already running at process with id " + pid + ".\n" +
                    "If you are running multiple builds in parallel then you should pre-process your node_modules via the command line ngcc tool before starting the builds;\n" +
                    "See https://v9.angular.io/guide/ivy#speeding-up-ngcc-compilation.\n" +
                    ("(If you are sure no ngcc process is running then you should delete the lockfile at " + this.lockFilePath + ".)"));
            }
        };
        /**
         * Remove the lock file from disk.
         */
        LockFile.prototype.remove = function () {
            this.removeSignalHandlers();
            if (this.fs.exists(this.lockFilePath)) {
                this.fs.removeFile(this.lockFilePath);
            }
        };
        LockFile.prototype.addSignalHandlers = function () {
            process.once('SIGINT', this.signalHandler);
            process.once('SIGHUP', this.signalHandler);
        };
        LockFile.prototype.removeSignalHandlers = function () {
            process.removeListener('SIGINT', this.signalHandler);
            process.removeListener('SIGHUP', this.signalHandler);
        };
        /**
         * This function wraps `process.exit()` which makes it easier to manage in unit tests,
         * since it is not possible to mock out `process.exit()` when it is called from signal handlers.
         */
        LockFile.prototype.exit = function (code) {
            process.exit(code);
        };
        return LockFile;
    }());
    exports.LockFile = LockFile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ja19maWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2V4ZWN1dGlvbi9sb2NrX2ZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxpQ0FBbUM7SUFHbkM7Ozs7OztPQU1HO0lBQ0g7UUFJRSxrQkFBb0IsRUFBYztZQUFsQyxpQkFBc0M7WUFBbEIsT0FBRSxHQUFGLEVBQUUsQ0FBWTtZQUhsQyxpQkFBWSxHQUNSLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsNEJBQTRCLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1lBb0Y1Rjs7O2VBR0c7WUFDTyxrQkFBYSxHQUNuQjtnQkFDRSxLQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2QsS0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNmLENBQUMsQ0FBQTtRQTFGZ0MsQ0FBQztRQUV0Qzs7Ozs7OztXQU9HO1FBQ0gsdUJBQUksR0FBSixVQUFRLEVBQVc7WUFBbkIsaUJBaUJDO1lBaEJDLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZCxJQUFJO2dCQUNGLElBQU0sTUFBTSxHQUFHLEVBQUUsRUFBRSxDQUFDO2dCQUNwQixJQUFJLE1BQU0sWUFBWSxPQUFPLEVBQUU7b0JBQzdCLE9BQU8sR0FBRyxJQUFJLENBQUM7b0JBQ2YsK0VBQStFO29CQUMvRSxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxNQUFNLEVBQUUsRUFBYixDQUFhLENBQWlCLENBQUM7aUJBQzVEO3FCQUFNO29CQUNMLE9BQU8sTUFBTSxDQUFDO2lCQUNmO2FBQ0Y7b0JBQVM7Z0JBQ1IsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDWixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQ2Y7YUFDRjtRQUNILENBQUM7UUFFRDs7V0FFRztRQUNPLHlCQUFNLEdBQWhCO1lBQ0UsSUFBSTtnQkFDRixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDekIsbUVBQW1FO2dCQUNuRSw4Q0FBOEM7Z0JBQzlDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDcEY7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtvQkFDdkIsTUFBTSxDQUFDLENBQUM7aUJBQ1Q7Z0JBRUQsd0RBQXdEO2dCQUN4RCx3RkFBd0Y7Z0JBQ3hGLCtFQUErRTtnQkFDL0UsSUFBSSxHQUFHLFNBQVEsQ0FBQztnQkFDaEIsSUFBSTtvQkFDRixHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO2lCQUMzQztnQkFBQyxXQUFNO29CQUNOLEdBQUcsR0FBRyxXQUFXLENBQUM7aUJBQ25CO2dCQUVELE1BQU0sSUFBSSxLQUFLLENBQ1gsZ0RBQThDLEdBQUcsUUFBSztvQkFDdEQsMkpBQTJKO29CQUMzSixxRUFBcUU7cUJBQ3JFLHdGQUFzRixJQUFJLENBQUMsWUFBWSxPQUFJLENBQUEsQ0FBQyxDQUFDO2FBQ2xIO1FBQ0gsQ0FBQztRQUVEOztXQUVHO1FBQ08seUJBQU0sR0FBaEI7WUFDRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM1QixJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDckMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ3ZDO1FBQ0gsQ0FBQztRQUVTLG9DQUFpQixHQUEzQjtZQUNFLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMzQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVTLHVDQUFvQixHQUE5QjtZQUNFLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNyRCxPQUFPLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQVlEOzs7V0FHRztRQUNPLHVCQUFJLEdBQWQsVUFBZSxJQUFZO1lBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsQ0FBQztRQUNILGVBQUM7SUFBRCxDQUFDLEFBdkdELElBdUdDO0lBdkdZLDRCQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgcHJvY2VzcyBmcm9tICdwcm9jZXNzJztcbmltcG9ydCB7RmlsZVN5c3RlbX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcblxuLyoqXG4gKiBUaGUgTG9ja0ZpbGUgaXMgdXNlZCB0byBwcmV2ZW50IG1vcmUgdGhhbiBvbmUgaW5zdGFuY2Ugb2YgbmdjYyBleGVjdXRpbmcgYXQgdGhlIHNhbWUgdGltZS5cbiAqXG4gKiBXaGVuIG5nY2Mgc3RhcnRzIGV4ZWN1dGluZywgaXQgY3JlYXRlcyBhIGZpbGUgaW4gdGhlIGBjb21waWxlci1jbGkvbmdjY2AgZm9sZGVyLiBJZiBpdCBmaW5kcyBvbmVcbiAqIGlzIGFscmVhZHkgdGhlcmUgdGhlbiBpdCBmYWlscyB3aXRoIGEgc3VpdGFibGUgZXJyb3IgbWVzc2FnZS5cbiAqIFdoZW4gbmdjYyBjb21wbGV0ZXMgZXhlY3V0aW5nLCBpdCByZW1vdmVzIHRoZSBmaWxlIHNvIHRoYXQgZnV0dXJlIG5nY2MgZXhlY3V0aW9ucyBjYW4gc3RhcnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2NrRmlsZSB7XG4gIGxvY2tGaWxlUGF0aCA9XG4gICAgICB0aGlzLmZzLnJlc29sdmUocmVxdWlyZS5yZXNvbHZlKCdAYW5ndWxhci9jb21waWxlci1jbGkvbmdjYycpLCAnLi4vX19uZ2NjX2xvY2tfZmlsZV9fJyk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBmczogRmlsZVN5c3RlbSkge31cblxuICAvKipcbiAgICogUnVuIGEgZnVuY3Rpb24gZ3VhcmRlZCBieSB0aGUgbG9jayBmaWxlLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgVCBjYW4gYmUgYSBQcm9taXNlLiBJZiBzbywgd2UgcnVuIHRoZSBgcmVtb3ZlKClgIGNhbGwgaW4gdGhlIHByb21pc2UncyBgZmluYWxseWBcbiAgICogaGFuZGxlci4gT3RoZXJ3aXNlIHdlIHJ1biB0aGUgYHJlbW92ZSgpYCBjYWxsIGluIHRoZSBgdHJ5Li4uZmluYWxseWAgYmxvY2suXG4gICAqXG4gICAqIEBwYXJhbSBmbiBUaGUgZnVuY3Rpb24gdG8gcnVuLlxuICAgKi9cbiAgbG9jazxUPihmbjogKCkgPT4gVCk6IFQge1xuICAgIGxldCBpc0FzeW5jID0gZmFsc2U7XG4gICAgdGhpcy5jcmVhdGUoKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gZm4oKTtcbiAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIGlzQXN5bmMgPSB0cnVlO1xuICAgICAgICAvLyBUaGUgY2FzdCBpcyBuZWNlc3NhcnkgYmVjYXVzZSBUUyBjYW5ub3QgZGVkdWNlIHRoYXQgVCBpcyBub3cgYSBwcm9taXNlIGhlcmUuXG4gICAgICAgIHJldHVybiByZXN1bHQuZmluYWxseSgoKSA9PiB0aGlzLnJlbW92ZSgpKSBhcyB1bmtub3duIGFzIFQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoIWlzQXN5bmMpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV3JpdGUgYSBsb2NrIGZpbGUgdG8gZGlzaywgb3IgZXJyb3IgaWYgdGhlcmUgaXMgYWxyZWFkeSBvbmUgdGhlcmUuXG4gICAqL1xuICBwcm90ZWN0ZWQgY3JlYXRlKCkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmFkZFNpZ25hbEhhbmRsZXJzKCk7XG4gICAgICAvLyBUbyBhdm9pZCByYWNlIGNvbmRpdGlvbnMsIHdlIGNoZWNrIGZvciBleGlzdGVuY2Ugb2YgdGhlIGxvY2tmaWxlXG4gICAgICAvLyBieSBhY3R1YWxseSB0cnlpbmcgdG8gY3JlYXRlIGl0IGV4Y2x1c2l2ZWx5XG4gICAgICB0aGlzLmZzLndyaXRlRmlsZSh0aGlzLmxvY2tGaWxlUGF0aCwgcHJvY2Vzcy5waWQudG9TdHJpbmcoKSwgLyogZXhjbHVzaXZlICovIHRydWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMucmVtb3ZlU2lnbmFsSGFuZGxlcnMoKTtcbiAgICAgIGlmIChlLmNvZGUgIT09ICdFRVhJU1QnKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSBsb2NrZmlsZSBhbHJlYWR5IGV4aXN0cyBzbyByYWlzZSBhIGhlbHBmdWwgZXJyb3IuXG4gICAgICAvLyBJdCBpcyBmZWFzaWJsZSB0aGF0IHRoZSBsb2NrZmlsZSB3YXMgcmVtb3ZlZCBiZXR3ZWVuIHRoZSBwcmV2aW91cyBjaGVjayBmb3IgZXhpc3RlbmNlXG4gICAgICAvLyBhbmQgdGhpcyBmaWxlLXJlYWQuIElmIHNvIHRoZW4gd2Ugc3RpbGwgZXJyb3IgYnV0IGFzIGdyYWNlZnVsbHkgYXMgcG9zc2libGUuXG4gICAgICBsZXQgcGlkOiBzdHJpbmc7XG4gICAgICB0cnkge1xuICAgICAgICBwaWQgPSB0aGlzLmZzLnJlYWRGaWxlKHRoaXMubG9ja0ZpbGVQYXRoKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICBwaWQgPSAne3Vua25vd259JztcbiAgICAgIH1cblxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBuZ2NjIGlzIGFscmVhZHkgcnVubmluZyBhdCBwcm9jZXNzIHdpdGggaWQgJHtwaWR9LlxcbmAgK1xuICAgICAgICAgIGBJZiB5b3UgYXJlIHJ1bm5pbmcgbXVsdGlwbGUgYnVpbGRzIGluIHBhcmFsbGVsIHRoZW4geW91IHNob3VsZCBwcmUtcHJvY2VzcyB5b3VyIG5vZGVfbW9kdWxlcyB2aWEgdGhlIGNvbW1hbmQgbGluZSBuZ2NjIHRvb2wgYmVmb3JlIHN0YXJ0aW5nIHRoZSBidWlsZHM7XFxuYCArXG4gICAgICAgICAgYFNlZSBodHRwczovL3Y5LmFuZ3VsYXIuaW8vZ3VpZGUvaXZ5I3NwZWVkaW5nLXVwLW5nY2MtY29tcGlsYXRpb24uXFxuYCArXG4gICAgICAgICAgYChJZiB5b3UgYXJlIHN1cmUgbm8gbmdjYyBwcm9jZXNzIGlzIHJ1bm5pbmcgdGhlbiB5b3Ugc2hvdWxkIGRlbGV0ZSB0aGUgbG9ja2ZpbGUgYXQgJHt0aGlzLmxvY2tGaWxlUGF0aH0uKWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIGxvY2sgZmlsZSBmcm9tIGRpc2suXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVtb3ZlKCkge1xuICAgIHRoaXMucmVtb3ZlU2lnbmFsSGFuZGxlcnMoKTtcbiAgICBpZiAodGhpcy5mcy5leGlzdHModGhpcy5sb2NrRmlsZVBhdGgpKSB7XG4gICAgICB0aGlzLmZzLnJlbW92ZUZpbGUodGhpcy5sb2NrRmlsZVBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBhZGRTaWduYWxIYW5kbGVycygpIHtcbiAgICBwcm9jZXNzLm9uY2UoJ1NJR0lOVCcsIHRoaXMuc2lnbmFsSGFuZGxlcik7XG4gICAgcHJvY2Vzcy5vbmNlKCdTSUdIVVAnLCB0aGlzLnNpZ25hbEhhbmRsZXIpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHJlbW92ZVNpZ25hbEhhbmRsZXJzKCkge1xuICAgIHByb2Nlc3MucmVtb3ZlTGlzdGVuZXIoJ1NJR0lOVCcsIHRoaXMuc2lnbmFsSGFuZGxlcik7XG4gICAgcHJvY2Vzcy5yZW1vdmVMaXN0ZW5lcignU0lHSFVQJywgdGhpcy5zaWduYWxIYW5kbGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGhhbmRsZSBuZWVkcyB0byBiZSBkZWZpbmVkIGFzIGEgcHJvcGVydHkgcmF0aGVyIHRoYW4gYSBtZXRob2RcbiAgICogc28gdGhhdCBpdCBjYW4gYmUgcGFzc2VkIGFyb3VuZCBhcyBhIGJvdW5kIGZ1bmN0aW9uLlxuICAgKi9cbiAgcHJvdGVjdGVkIHNpZ25hbEhhbmRsZXIgPVxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICB0aGlzLmV4aXQoMSk7XG4gICAgICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgZnVuY3Rpb24gd3JhcHMgYHByb2Nlc3MuZXhpdCgpYCB3aGljaCBtYWtlcyBpdCBlYXNpZXIgdG8gbWFuYWdlIGluIHVuaXQgdGVzdHMsXG4gICAqIHNpbmNlIGl0IGlzIG5vdCBwb3NzaWJsZSB0byBtb2NrIG91dCBgcHJvY2Vzcy5leGl0KClgIHdoZW4gaXQgaXMgY2FsbGVkIGZyb20gc2lnbmFsIGhhbmRsZXJzLlxuICAgKi9cbiAgcHJvdGVjdGVkIGV4aXQoY29kZTogbnVtYmVyKTogdm9pZCB7XG4gICAgcHJvY2Vzcy5leGl0KGNvZGUpO1xuICB9XG59XG4iXX0=