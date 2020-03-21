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
        define("@angular/compiler-cli/src/ngtsc/resource/src/loader", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/util/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var CSS_PREPROCESSOR_EXT = /(\.scss|\.sass|\.less|\.styl)$/;
    /**
     * `ResourceLoader` which delegates to a `CompilerHost` resource loading method.
     */
    var HostResourceLoader = /** @class */ (function () {
        function HostResourceLoader(host, options) {
            this.host = host;
            this.options = options;
            this.cache = new Map();
            this.fetching = new Map();
            this.canPreload = !!this.host.readResource;
            this.rootDirs = typescript_1.getRootDirs(host, options);
        }
        /**
         * Resolve the url of a resource relative to the file that contains the reference to it.
         * The return value of this method can be used in the `load()` and `preload()` methods.
         *
         * Uses the provided CompilerHost if it supports mapping resources to filenames.
         * Otherwise, uses a fallback mechanism that searches the module resolution candidates.
         *
         * @param url The, possibly relative, url of the resource.
         * @param fromFile The path to the file that contains the URL of the resource.
         * @returns A resolved url of resource.
         * @throws An error if the resource cannot be resolved.
         */
        HostResourceLoader.prototype.resolve = function (url, fromFile) {
            var resolvedUrl = null;
            if (this.host.resourceNameToFileName) {
                resolvedUrl = this.host.resourceNameToFileName(url, fromFile);
            }
            else {
                resolvedUrl = this.fallbackResolve(url, fromFile);
            }
            if (resolvedUrl === null) {
                throw new Error("HostResourceResolver: could not resolve " + url + " in context of " + fromFile + ")");
            }
            return resolvedUrl;
        };
        /**
         * Preload the specified resource, asynchronously.
         *
         * Once the resource is loaded, its value is cached so it can be accessed synchronously via the
         * `load()` method.
         *
         * @param resolvedUrl The url (resolved by a call to `resolve()`) of the resource to preload.
         * @returns A Promise that is resolved once the resource has been loaded or `undefined` if the
         * file has already been loaded.
         * @throws An Error if pre-loading is not available.
         */
        HostResourceLoader.prototype.preload = function (resolvedUrl) {
            var _this = this;
            if (!this.host.readResource) {
                throw new Error('HostResourceLoader: the CompilerHost provided does not support pre-loading resources.');
            }
            if (this.cache.has(resolvedUrl)) {
                return undefined;
            }
            else if (this.fetching.has(resolvedUrl)) {
                return this.fetching.get(resolvedUrl);
            }
            var result = this.host.readResource(resolvedUrl);
            if (typeof result === 'string') {
                this.cache.set(resolvedUrl, result);
                return undefined;
            }
            else {
                var fetchCompletion = result.then(function (str) {
                    _this.fetching.delete(resolvedUrl);
                    _this.cache.set(resolvedUrl, str);
                });
                this.fetching.set(resolvedUrl, fetchCompletion);
                return fetchCompletion;
            }
        };
        /**
         * Load the resource at the given url, synchronously.
         *
         * The contents of the resource may have been cached by a previous call to `preload()`.
         *
         * @param resolvedUrl The url (resolved by a call to `resolve()`) of the resource to load.
         * @returns The contents of the resource.
         */
        HostResourceLoader.prototype.load = function (resolvedUrl) {
            if (this.cache.has(resolvedUrl)) {
                return this.cache.get(resolvedUrl);
            }
            var result = this.host.readResource ? this.host.readResource(resolvedUrl) :
                this.host.readFile(resolvedUrl);
            if (typeof result !== 'string') {
                throw new Error("HostResourceLoader: loader(" + resolvedUrl + ") returned a Promise");
            }
            this.cache.set(resolvedUrl, result);
            return result;
        };
        /**
         * Attempt to resolve `url` in the context of `fromFile`, while respecting the rootDirs
         * option from the tsconfig. First, normalize the file name.
         */
        HostResourceLoader.prototype.fallbackResolve = function (url, fromFile) {
            var e_1, _a;
            var candidateLocations;
            if (url.startsWith('/')) {
                // This path is not really an absolute path, but instead the leading '/' means that it's
                // rooted in the project rootDirs. So look for it according to the rootDirs.
                candidateLocations = this.getRootedCandidateLocations(url);
            }
            else {
                // This path is a "relative" path and can be resolved as such. To make this easier on the
                // downstream resolver, the './' prefix is added if missing to distinguish these paths from
                // absolute node_modules paths.
                if (!url.startsWith('.')) {
                    url = "./" + url;
                }
                candidateLocations = this.getResolvedCandidateLocations(url, fromFile);
            }
            try {
                for (var candidateLocations_1 = tslib_1.__values(candidateLocations), candidateLocations_1_1 = candidateLocations_1.next(); !candidateLocations_1_1.done; candidateLocations_1_1 = candidateLocations_1.next()) {
                    var candidate = candidateLocations_1_1.value;
                    if (this.host.fileExists(candidate)) {
                        return candidate;
                    }
                    else if (CSS_PREPROCESSOR_EXT.test(candidate)) {
                        /**
                         * If the user specified styleUrl points to *.scss, but the Sass compiler was run before
                         * Angular, then the resource may have been generated as *.css. Simply try the resolution
                         * again.
                         */
                        var cssFallbackUrl = candidate.replace(CSS_PREPROCESSOR_EXT, '.css');
                        if (this.host.fileExists(cssFallbackUrl)) {
                            return cssFallbackUrl;
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (candidateLocations_1_1 && !candidateLocations_1_1.done && (_a = candidateLocations_1.return)) _a.call(candidateLocations_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return null;
        };
        HostResourceLoader.prototype.getRootedCandidateLocations = function (url) {
            // The path already starts with '/', so add a '.' to make it relative.
            var segment = ('.' + url);
            return this.rootDirs.map(function (rootDir) { return file_system_1.join(rootDir, segment); });
        };
        /**
         * TypeScript provides utilities to resolve module names, but not resource files (which aren't
         * a part of the ts.Program). However, TypeScript's module resolution can be used creatively
         * to locate where resource files should be expected to exist. Since module resolution returns
         * a list of file names that were considered, the loader can enumerate the possible locations
         * for the file by setting up a module resolution for it that will fail.
         */
        HostResourceLoader.prototype.getResolvedCandidateLocations = function (url, fromFile) {
            // clang-format off
            var failedLookup = ts.resolveModuleName(url + '.$ngresource$', fromFile, this.options, this.host);
            // clang-format on
            if (failedLookup.failedLookupLocations === undefined) {
                throw new Error("Internal error: expected to find failedLookupLocations during resolution of resource '" + url + "' in context of " + fromFile);
            }
            return failedLookup.failedLookupLocations
                .filter(function (candidate) { return candidate.endsWith('.$ngresource$.ts'); })
                .map(function (candidate) { return candidate.replace(/\.\$ngresource\$\.ts$/, ''); });
        };
        return HostResourceLoader;
    }());
    exports.HostResourceLoader = HostResourceLoader;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9yZXNvdXJjZS9zcmMvbG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUlqQywyRUFBb0U7SUFDcEUsa0ZBQXNEO0lBRXRELElBQU0sb0JBQW9CLEdBQUcsZ0NBQWdDLENBQUM7SUFFOUQ7O09BRUc7SUFDSDtRQVFFLDRCQUFvQixJQUE0QixFQUFVLE9BQTJCO1lBQWpFLFNBQUksR0FBSixJQUFJLENBQXdCO1lBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBb0I7WUFQN0UsVUFBSyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBQ2xDLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztZQUlwRCxlQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBR3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsd0JBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVEOzs7Ozs7Ozs7OztXQVdHO1FBQ0gsb0NBQU8sR0FBUCxVQUFRLEdBQVcsRUFBRSxRQUFnQjtZQUNuQyxJQUFJLFdBQVcsR0FBZ0IsSUFBSSxDQUFDO1lBQ3BDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtnQkFDcEMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQy9EO2lCQUFNO2dCQUNMLFdBQVcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNuRDtZQUNELElBQUksV0FBVyxLQUFLLElBQUksRUFBRTtnQkFDeEIsTUFBTSxJQUFJ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QUMvSSxrQkFBa0I7WUFDbEIsSUFBSSxZQUFZLENBQUMscUJBQXFCLEtBQUssU0FBUyxFQUFFO2dCQUNwRCxNQUFNLElBQUksS0FBSyxDQUNYLDJGQUF5RixHQUFHLHdCQUFtQixRQUFVLENBQUMsQ0FBQzthQUNoSTtZQUVELE9BQU8sWUFBWSxDQUFDLHFCQUFxQjtpQkFDcEMsTUFBTSxDQUFDLFVBQUEsU0FBUyxJQUFJLE9BQUEsU0FBUyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUF0QyxDQUFzQyxDQUFDO2lCQUMzRCxHQUFHLENBQUMsVUFBQSxTQUFTLElBQUksT0FBQSxTQUFTLENBQUMsT0FBTyxDQUFDLHVCQUF1QixFQUFFLEVBQUUsQ0FBQyxFQUE5QyxDQUE4QyxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUNILHlCQUFDO0lBQUQsQ0FBQyxBQXJLRCxJQXFLQztJQXJLWSxnREFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge1Jlc291cmNlTG9hZGVyfSBmcm9tICcuLi8uLi9hbm5vdGF0aW9ucyc7XG5pbXBvcnQge0V4dGVuZGVkVHNDb21waWxlckhvc3R9IGZyb20gJy4uLy4uL2NvcmUvYXBpJztcbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIFBhdGhTZWdtZW50LCBqb2lufSBmcm9tICcuLi8uLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge2dldFJvb3REaXJzfSBmcm9tICcuLi8uLi91dGlsL3NyYy90eXBlc2NyaXB0JztcblxuY29uc3QgQ1NTX1BSRVBST0NFU1NPUl9FWFQgPSAvKFxcLnNjc3N8XFwuc2Fzc3xcXC5sZXNzfFxcLnN0eWwpJC87XG5cbi8qKlxuICogYFJlc291cmNlTG9hZGVyYCB3aGljaCBkZWxlZ2F0ZXMgdG8gYSBgQ29tcGlsZXJIb3N0YCByZXNvdXJjZSBsb2FkaW5nIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEhvc3RSZXNvdXJjZUxvYWRlciBpbXBsZW1lbnRzIFJlc291cmNlTG9hZGVyIHtcbiAgcHJpdmF0ZSBjYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIHByaXZhdGUgZmV0Y2hpbmcgPSBuZXcgTWFwPHN0cmluZywgUHJvbWlzZTx2b2lkPj4oKTtcblxuICBwcml2YXRlIHJvb3REaXJzOiBBYnNvbHV0ZUZzUGF0aFtdO1xuXG4gIGNhblByZWxvYWQgPSAhIXRoaXMuaG9zdC5yZWFkUmVzb3VyY2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBob3N0OiBFeHRlbmRlZFRzQ29tcGlsZXJIb3N0LCBwcml2YXRlIG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucykge1xuICAgIHRoaXMucm9vdERpcnMgPSBnZXRSb290RGlycyhob3N0LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlIHRoZSB1cmwgb2YgYSByZXNvdXJjZSByZWxhdGl2ZSB0byB0aGUgZmlsZSB0aGF0IGNvbnRhaW5zIHRoZSByZWZlcmVuY2UgdG8gaXQuXG4gICAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhpcyBtZXRob2QgY2FuIGJlIHVzZWQgaW4gdGhlIGBsb2FkKClgIGFuZCBgcHJlbG9hZCgpYCBtZXRob2RzLlxuICAgKlxuICAgKiBVc2VzIHRoZSBwcm92aWRlZCBDb21waWxlckhvc3QgaWYgaXQgc3VwcG9ydHMgbWFwcGluZyByZXNvdXJjZXMgdG8gZmlsZW5hbWVzLlxuICAgKiBPdGhlcndpc2UsIHVzZXMgYSBmYWxsYmFjayBtZWNoYW5pc20gdGhhdCBzZWFyY2hlcyB0aGUgbW9kdWxlIHJlc29sdXRpb24gY2FuZGlkYXRlcy5cbiAgICpcbiAgICogQHBhcmFtIHVybCBUaGUsIHBvc3NpYmx5IHJlbGF0aXZlLCB1cmwgb2YgdGhlIHJlc291cmNlLlxuICAgKiBAcGFyYW0gZnJvbUZpbGUgVGhlIHBhdGggdG8gdGhlIGZpbGUgdGhhdCBjb250YWlucyB0aGUgVVJMIG9mIHRoZSByZXNvdXJjZS5cbiAgICogQHJldHVybnMgQSByZXNvbHZlZCB1cmwgb2YgcmVzb3VyY2UuXG4gICAqIEB0aHJvd3MgQW4gZXJyb3IgaWYgdGhlIHJlc291cmNlIGNhbm5vdCBiZSByZXNvbHZlZC5cbiAgICovXG4gIHJlc29sdmUodXJsOiBzdHJpbmcsIGZyb21GaWxlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCByZXNvbHZlZFVybDogc3RyaW5nfG51bGwgPSBudWxsO1xuICAgIGlmICh0aGlzLmhvc3QucmVzb3VyY2VOYW1lVG9GaWxlTmFtZSkge1xuICAgICAgcmVzb2x2ZWRVcmwgPSB0aGlzLmhvc3QucmVzb3VyY2VOYW1lVG9GaWxlTmFtZSh1cmwsIGZyb21GaWxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzb2x2ZWRVcmwgPSB0aGlzLmZhbGxiYWNrUmVzb2x2ZSh1cmwsIGZyb21GaWxlKTtcbiAgICB9XG4gICAgaWYgKHJlc29sdmVkVXJsID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEhvc3RSZXNvdXJjZVJlc29sdmVyOiBjb3VsZCBub3QgcmVzb2x2ZSAke3VybH0gaW4gY29udGV4dCBvZiAke2Zyb21GaWxlfSlgKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc29sdmVkVXJsO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZWxvYWQgdGhlIHNwZWNpZmllZCByZXNvdXJjZSwgYXN5bmNocm9ub3VzbHkuXG4gICAqXG4gICAqIE9uY2UgdGhlIHJlc291cmNlIGlzIGxvYWRlZCwgaXRzIHZhbHVlIGlzIGNhY2hlZCBzbyBpdCBjYW4gYmUgYWNjZXNzZWQgc3luY2hyb25vdXNseSB2aWEgdGhlXG4gICAqIGBsb2FkKClgIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIHJlc29sdmVkVXJsIFRoZSB1cmwgKHJlc29sdmVkIGJ5IGEgY2FsbCB0byBgcmVzb2x2ZSgpYCkgb2YgdGhlIHJlc291cmNlIHRvIHByZWxvYWQuXG4gICAqIEByZXR1cm5zIEEgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIG9uY2UgdGhlIHJlc291cmNlIGhhcyBiZWVuIGxvYWRlZCBvciBgdW5kZWZpbmVkYCBpZiB0aGVcbiAgICogZmlsZSBoYXMgYWxyZWFkeSBiZWVuIGxvYWRlZC5cbiAgICogQHRocm93cyBBbiBFcnJvciBpZiBwcmUtbG9hZGluZyBpcyBub3QgYXZhaWxhYmxlLlxuICAgKi9cbiAgcHJlbG9hZChyZXNvbHZlZFVybDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPnx1bmRlZmluZWQge1xuICAgIGlmICghdGhpcy5ob3N0LnJlYWRSZXNvdXJjZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdIb3N0UmVzb3VyY2VMb2FkZXI6IHRoZSBDb21waWxlckhvc3QgcHJvdmlkZWQgZG9lcyBub3Qgc3VwcG9ydCBwcmUtbG9hZGluZyByZXNvdXJjZXMuJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmNhY2hlLmhhcyhyZXNvbHZlZFVybCkpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIGlmICh0aGlzLmZldGNoaW5nLmhhcyhyZXNvbHZlZFVybCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmZldGNoaW5nLmdldChyZXNvbHZlZFVybCk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5ob3N0LnJlYWRSZXNvdXJjZShyZXNvbHZlZFVybCk7XG4gICAgaWYgKHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLmNhY2hlLnNldChyZXNvbHZlZFVybCwgcmVzdWx0KTtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGZldGNoQ29tcGxldGlvbiA9IHJlc3VsdC50aGVuKHN0ciA9PiB7XG4gICAgICAgIHRoaXMuZmV0Y2hpbmcuZGVsZXRlKHJlc29sdmVkVXJsKTtcbiAgICAgICAgdGhpcy5jYWNoZS5zZXQocmVzb2x2ZWRVcmwsIHN0cik7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuZmV0Y2hpbmcuc2V0KHJlc29sdmVkVXJsLCBmZXRjaENvbXBsZXRpb24pO1xuICAgICAgcmV0dXJuIGZldGNoQ29tcGxldGlvbjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9hZCB0aGUgcmVzb3VyY2UgYXQgdGhlIGdpdmVuIHVybCwgc3luY2hyb25vdXNseS5cbiAgICpcbiAgICogVGhlIGNvbnRlbnRzIG9mIHRoZSByZXNvdXJjZSBtYXkgaGF2ZSBiZWVuIGNhY2hlZCBieSBhIHByZXZpb3VzIGNhbGwgdG8gYHByZWxvYWQoKWAuXG4gICAqXG4gICAqIEBwYXJhbSByZXNvbHZlZFVybCBUaGUgdXJsIChyZXNvbHZlZCBieSBhIGNhbGwgdG8gYHJlc29sdmUoKWApIG9mIHRoZSByZXNvdXJjZSB0byBsb2FkLlxuICAgKiBAcmV0dXJucyBUaGUgY29udGVudHMgb2YgdGhlIHJlc291cmNlLlxuICAgKi9cbiAgbG9hZChyZXNvbHZlZFVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5jYWNoZS5oYXMocmVzb2x2ZWRVcmwpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXQocmVzb2x2ZWRVcmwpICE7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5ob3N0LnJlYWRSZXNvdXJjZSA/IHRoaXMuaG9zdC5yZWFkUmVzb3VyY2UocmVzb2x2ZWRVcmwpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3N0LnJlYWRGaWxlKHJlc29sdmVkVXJsKTtcbiAgICBpZiAodHlwZW9mIHJlc3VsdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSG9zdFJlc291cmNlTG9hZGVyOiBsb2FkZXIoJHtyZXNvbHZlZFVybH0pIHJldHVybmVkIGEgUHJvbWlzZWApO1xuICAgIH1cbiAgICB0aGlzLmNhY2hlLnNldChyZXNvbHZlZFVybCwgcmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHQgdG8gcmVzb2x2ZSBgdXJsYCBpbiB0aGUgY29udGV4dCBvZiBgZnJvbUZpbGVgLCB3aGlsZSByZXNwZWN0aW5nIHRoZSByb290RGlyc1xuICAgKiBvcHRpb24gZnJvbSB0aGUgdHNjb25maWcuIEZpcnN0LCBub3JtYWxpemUgdGhlIGZpbGUgbmFtZS5cbiAgICovXG4gIHByaXZhdGUgZmFsbGJhY2tSZXNvbHZlKHVybDogc3RyaW5nLCBmcm9tRmlsZTogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIGxldCBjYW5kaWRhdGVMb2NhdGlvbnM6IHN0cmluZ1tdO1xuICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICAvLyBUaGlzIHBhdGggaXMgbm90IHJlYWxseSBhbiBhYnNvbHV0ZSBwYXRoLCBidXQgaW5zdGVhZCB0aGUgbGVhZGluZyAnLycgbWVhbnMgdGhhdCBpdCdzXG4gICAgICAvLyByb290ZWQgaW4gdGhlIHByb2plY3Qgcm9vdERpcnMuIFNvIGxvb2sgZm9yIGl0IGFjY29yZGluZyB0byB0aGUgcm9vdERpcnMuXG4gICAgICBjYW5kaWRhdGVMb2NhdGlvbnMgPSB0aGlzLmdldFJvb3RlZENhbmRpZGF0ZUxvY2F0aW9ucyh1cmwpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIHBhdGggaXMgYSBcInJlbGF0aXZlXCIgcGF0aCBhbmQgY2FuIGJlIHJlc29sdmVkIGFzIHN1Y2guIFRvIG1ha2UgdGhpcyBlYXNpZXIgb24gdGhlXG4gICAgICAvLyBkb3duc3RyZWFtIHJlc29sdmVyLCB0aGUgJy4vJyBwcmVmaXggaXMgYWRkZWQgaWYgbWlzc2luZyB0byBkaXN0aW5ndWlzaCB0aGVzZSBwYXRocyBmcm9tXG4gICAgICAvLyBhYnNvbHV0ZSBub2RlX21vZHVsZXMgcGF0aHMuXG4gICAgICBpZiAoIXVybC5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgICAgdXJsID0gYC4vJHt1cmx9YDtcbiAgICAgIH1cbiAgICAgIGNhbmRpZGF0ZUxvY2F0aW9ucyA9IHRoaXMuZ2V0UmVzb2x2ZWRDYW5kaWRhdGVMb2NhdGlvbnModXJsLCBmcm9tRmlsZSk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2FuZGlkYXRlTG9jYXRpb25zKSB7XG4gICAgICBpZiAodGhpcy5ob3N0LmZpbGVFeGlzdHMoY2FuZGlkYXRlKSkge1xuICAgICAgICByZXR1cm4gY2FuZGlkYXRlO1xuICAgICAgfSBlbHNlIGlmIChDU1NfUFJFUFJPQ0VTU09SX0VYVC50ZXN0KGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHRoZSB1c2VyIHNwZWNpZmllZCBzdHlsZVVybCBwb2ludHMgdG8gKi5zY3NzLCBidXQgdGhlIFNhc3MgY29tcGlsZXIgd2FzIHJ1biBiZWZvcmVcbiAgICAgICAgICogQW5ndWxhciwgdGhlbiB0aGUgcmVzb3VyY2UgbWF5IGhhdmUgYmVlbiBnZW5lcmF0ZWQgYXMgKi5jc3MuIFNpbXBseSB0cnkgdGhlIHJlc29sdXRpb25cbiAgICAgICAgICogYWdhaW4uXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBjc3NGYWxsYmFja1VybCA9IGNhbmRpZGF0ZS5yZXBsYWNlKENTU19QUkVQUk9DRVNTT1JfRVhULCAnLmNzcycpO1xuICAgICAgICBpZiAodGhpcy5ob3N0LmZpbGVFeGlzdHMoY3NzRmFsbGJhY2tVcmwpKSB7XG4gICAgICAgICAgcmV0dXJuIGNzc0ZhbGxiYWNrVXJsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSb290ZWRDYW5kaWRhdGVMb2NhdGlvbnModXJsOiBzdHJpbmcpOiBBYnNvbHV0ZUZzUGF0aFtdIHtcbiAgICAvLyBUaGUgcGF0aCBhbHJlYWR5IHN0YXJ0cyB3aXRoICcvJywgc28gYWRkIGEgJy4nIHRvIG1ha2UgaXQgcmVsYXRpdmUuXG4gICAgY29uc3Qgc2VnbWVudDogUGF0aFNlZ21lbnQgPSAoJy4nICsgdXJsKSBhcyBQYXRoU2VnbWVudDtcbiAgICByZXR1cm4gdGhpcy5yb290RGlycy5tYXAocm9vdERpciA9PiBqb2luKHJvb3REaXIsIHNlZ21lbnQpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUeXBlU2NyaXB0IHByb3ZpZGVzIHV0aWxpdGllcyB0byByZXNvbHZlIG1vZHVsZSBuYW1lcywgYnV0IG5vdCByZXNvdXJjZSBmaWxlcyAod2hpY2ggYXJlbid0XG4gICAqIGEgcGFydCBvZiB0aGUgdHMuUHJvZ3JhbSkuIEhvd2V2ZXIsIFR5cGVTY3JpcHQncyBtb2R1bGUgcmVzb2x1dGlvbiBjYW4gYmUgdXNlZCBjcmVhdGl2ZWx5XG4gICAqIHRvIGxvY2F0ZSB3aGVyZSByZXNvdXJjZSBmaWxlcyBzaG91bGQgYmUgZXhwZWN0ZWQgdG8gZXhpc3QuIFNpbmNlIG1vZHVsZSByZXNvbHV0aW9uIHJldHVybnNcbiAgICogYSBsaXN0IG9mIGZpbGUgbmFtZXMgdGhhdCB3ZXJlIGNvbnNpZGVyZWQsIHRoZSBsb2FkZXIgY2FuIGVudW1lcmF0ZSB0aGUgcG9zc2libGUgbG9jYXRpb25zXG4gICAqIGZvciB0aGUgZmlsZSBieSBzZXR0aW5nIHVwIGEgbW9kdWxlIHJlc29sdXRpb24gZm9yIGl0IHRoYXQgd2lsbCBmYWlsLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRSZXNvbHZlZENhbmRpZGF0ZUxvY2F0aW9ucyh1cmw6IHN0cmluZywgZnJvbUZpbGU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICAvLyBgZmFpbGVkTG9va3VwTG9jYXRpb25zYCBpcyBpbiB0aGUgbmFtZSBvZiB0aGUgdHlwZSB0cy5SZXNvbHZlZE1vZHVsZVdpdGhGYWlsZWRMb29rdXBMb2NhdGlvbnNcbiAgICAvLyBidXQgaXMgbWFya2VkIEBpbnRlcm5hbCBpbiBUeXBlU2NyaXB0LiBTZWVcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzI4NzcwLlxuICAgIHR5cGUgUmVzb2x2ZWRNb2R1bGVXaXRoRmFpbGVkTG9va3VwTG9jYXRpb25zID1cbiAgICAgICAgdHMuUmVzb2x2ZWRNb2R1bGVXaXRoRmFpbGVkTG9va3VwTG9jYXRpb25zICYge2ZhaWxlZExvb2t1cExvY2F0aW9uczogUmVhZG9ubHlBcnJheTxzdHJpbmc+fTtcblxuICAgIC8vIGNsYW5nLWZvcm1hdCBvZmZcbiAgICBjb25zdCBmYWlsZWRMb29rdXAgPSB0cy5yZXNvbHZlTW9kdWxlTmFtZSh1cmwgKyAnLiRuZ3Jlc291cmNlJCcsIGZyb21GaWxlLCB0aGlzLm9wdGlvbnMsIHRoaXMuaG9zdCkgYXMgUmVzb2x2ZWRNb2R1bGVXaXRoRmFpbGVkTG9va3VwTG9jYXRpb25zO1xuICAgIC8vIGNsYW5nLWZvcm1hdCBvblxuICAgIGlmIChmYWlsZWRMb29rdXAuZmFpbGVkTG9va3VwTG9jYXRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgSW50ZXJuYWwgZXJyb3I6IGV4cGVjdGVkIHRvIGZpbmQgZmFpbGVkTG9va3VwTG9jYXRpb25zIGR1cmluZyByZXNvbHV0aW9uIG9mIHJlc291cmNlICcke3VybH0nIGluIGNvbnRleHQgb2YgJHtmcm9tRmlsZX1gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFpbGVkTG9va3VwLmZhaWxlZExvb2t1cExvY2F0aW9uc1xuICAgICAgICAuZmlsdGVyKGNhbmRpZGF0ZSA9PiBjYW5kaWRhdGUuZW5kc1dpdGgoJy4kbmdyZXNvdXJjZSQudHMnKSlcbiAgICAgICAgLm1hcChjYW5kaWRhdGUgPT4gY2FuZGlkYXRlLnJlcGxhY2UoL1xcLlxcJG5ncmVzb3VyY2VcXCRcXC50cyQvLCAnJykpO1xuICB9XG59XG4iXX0=