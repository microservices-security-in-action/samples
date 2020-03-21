(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/packages/configuration", ["require", "exports", "tslib", "semver", "vm", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
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
    var semver_1 = require("semver");
    var vm = require("vm");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    /**
     * The default configuration for ngcc.
     *
     * This is the ultimate fallback configuration that ngcc will use if there is no configuration
     * for a package at the package level or project level.
     *
     * This configuration is for packages that are "dead" - i.e. no longer maintained and so are
     * unlikely to be fixed to work with ngcc, nor provide a package level config of their own.
     *
     * The fallback process for looking up configuration is:
     *
     * Project -> Package -> Default
     *
     * If a package provides its own configuration then that would override this default one.
     *
     * Also application developers can always provide configuration at their project level which
     * will override everything else.
     *
     * Note that the fallback is package based not entry-point based.
     * For example, if a there is configuration for a package at the project level this will replace all
     * entry-point configurations that may have been provided in the package level or default level
     * configurations, even if the project level configuration does not provide for a given entry-point.
     */
    exports.DEFAULT_NGCC_CONFIG = {
        packages: {
            // Add default package configuration here. For example:
            // '@angular/fire@^5.2.0': {
            //   entryPoints: {
            //     './database-deprecated': {ignore: true},
            //   },
            // },
            // The package does not contain any `.metadata.json` files in the root directory but only inside
            // `dist/`. Without this config, ngcc does not realize this is a ViewEngine-built Angular
            // package that needs to be compiled to Ivy.
            'angular2-highcharts': {
                entryPoints: {
                    '.': {
                        override: {
                            main: './index.js',
                        },
                    },
                },
            },
            // The `dist/` directory has a duplicate `package.json` pointing to the same files, which (under
            // certain configurations) can causes ngcc to try to process the files twice and fail.
            // Ignore the `dist/` entry-point.
            'ng2-dragula': {
                entryPoints: {
                    './dist': { ignore: true },
                },
            },
        },
    };
    var NGCC_CONFIG_FILENAME = 'ngcc.config.js';
    /**
     * Ngcc has a hierarchical configuration system that lets us "fix up" packages that do not
     * work with ngcc out of the box.
     *
     * There are three levels at which configuration can be declared:
     *
     * * Default level - ngcc comes with built-in configuration for well known cases.
     * * Package level - a library author publishes a configuration with their package to fix known
     *   issues.
     * * Project level - the application developer provides a configuration that fixes issues specific
     *   to the libraries used in their application.
     *
     * Ngcc will match configuration based on the package name but also on its version. This allows
     * configuration to provide different fixes to different version ranges of a package.
     *
     * * Package level configuration is specific to the package version where the configuration is
     *   found.
     * * Default and project level configuration should provide version ranges to ensure that the
     *   configuration is only applied to the appropriate versions of a package.
     *
     * When getting a configuration for a package (via `getConfig()`) the caller should provide the
     * version of the package in question, if available. If it is not provided then the first available
     * configuration for a package is returned.
     */
    var NgccConfiguration = /** @class */ (function () {
        function NgccConfiguration(fs, baseDir) {
            this.fs = fs;
            this.cache = new Map();
            this.defaultConfig = this.processProjectConfig(baseDir, exports.DEFAULT_NGCC_CONFIG);
            this.projectConfig = this.processProjectConfig(baseDir, this.loadProjectConfig(baseDir));
        }
        /**
         * Get a configuration for the given `version` of a package at `packagePath`.
         *
         * @param packagePath The path to the package whose config we want.
         * @param version The version of the package whose config we want, or `null` if the package's
         * package.json did not exist or was invalid.
         */
        NgccConfiguration.prototype.getConfig = function (packagePath, version) {
            var cacheKey = packagePath + (version !== null ? "@" + version : '');
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            var projectLevelConfig = findSatisfactoryVersion(this.projectConfig.packages[packagePath], version);
            if (projectLevelConfig !== null) {
                this.cache.set(cacheKey, projectLevelConfig);
                return projectLevelConfig;
            }
            var packageLevelConfig = this.loadPackageConfig(packagePath, version);
            if (packageLevelConfig !== null) {
                this.cache.set(cacheKey, packageLevelConfig);
                return packageLevelConfig;
            }
            var defaultLevelConfig = findSatisfactoryVersion(this.defaultConfig.packages[packagePath], version);
            if (defaultLevelConfig !== null) {
                this.cache.set(cacheKey, defaultLevelConfig);
                return defaultLevelConfig;
            }
            return { versionRange: '*', entryPoints: {} };
        };
        NgccConfiguration.prototype.processProjectConfig = function (baseDir, projectConfig) {
            var processedConfig = { packages: {} };
            for (var packagePathAndVersion in projectConfig.packages) {
                var packageConfig = projectConfig.packages[packagePathAndVersion];
                if (packageConfig) {
                    var _a = tslib_1.__read(this.splitPathAndVersion(packagePathAndVersion), 2), packagePath = _a[0], _b = _a[1], versionRange = _b === void 0 ? '*' : _b;
                    var absPackagePath = file_system_1.resolve(baseDir, 'node_modules', packagePath);
                    var entryPoints = this.processEntryPoints(absPackagePath, packageConfig);
                    processedConfig.packages[absPackagePath] = processedConfig.packages[absPackagePath] || [];
                    processedConfig.packages[absPackagePath].push(tslib_1.__assign(tslib_1.__assign({}, packageConfig), { versionRange: versionRange, entryPoints: entryPoints }));
                }
            }
            return processedConfig;
        };
        NgccConfiguration.prototype.loadProjectConfig = function (baseDir) {
            var configFilePath = file_system_1.join(baseDir, NGCC_CONFIG_FILENAME);
            if (this.fs.exists(configFilePath)) {
                try {
                    return this.evalSrcFile(configFilePath);
                }
                catch (e) {
                    throw new Error("Invalid project configuration file at \"" + configFilePath + "\": " + e.message);
                }
            }
            else {
                return { packages: {} };
            }
        };
        NgccConfiguration.prototype.loadPackageConfig = function (packagePath, version) {
            var configFilePath = file_system_1.join(packagePath, NGCC_CONFIG_FILENAME);
            if (this.fs.exists(configFilePath)) {
                try {
                    return {
                        versionRange: version || '*',
                        entryPoints: this.processEntryPoints(packagePath, this.evalSrcFile(configFilePath)),
                    };
                }
                catch (e) {
                    throw new Error("Invalid package configuration file at \"" + configFilePath + "\": " + e.message);
                }
            }
            else {
                return null;
            }
        };
        NgccConfiguration.prototype.evalSrcFile = function (srcPath) {
            var src = this.fs.readFile(srcPath);
            var theExports = {};
            var sandbox = {
                module: { exports: theExports },
                exports: theExports, require: require,
                __dirname: file_system_1.dirname(srcPath),
                __filename: srcPath
            };
            vm.runInNewContext(src, sandbox, { filename: srcPath });
            return sandbox.module.exports;
        };
        NgccConfiguration.prototype.processEntryPoints = function (packagePath, packageConfig) {
            var processedEntryPoints = {};
            for (var entryPointPath in packageConfig.entryPoints) {
                // Change the keys to be absolute paths
                processedEntryPoints[file_system_1.resolve(packagePath, entryPointPath)] =
                    packageConfig.entryPoints[entryPointPath];
            }
            return processedEntryPoints;
        };
        NgccConfiguration.prototype.splitPathAndVersion = function (packagePathAndVersion) {
            var versionIndex = packagePathAndVersion.lastIndexOf('@');
            // Note that > 0 is because we don't want to match @ at the start of the line
            // which is what you would have with a namespaced package, e.g. `@angular/common`.
            return versionIndex > 0 ?
                [
                    packagePathAndVersion.substring(0, versionIndex),
                    packagePathAndVersion.substring(versionIndex + 1)
                ] :
                [packagePathAndVersion, undefined];
        };
        return NgccConfiguration;
    }());
    exports.NgccConfiguration = NgccConfiguration;
    function findSatisfactoryVersion(configs, version) {
        if (configs === undefined) {
            return null;
        }
        if (version === null) {
            // The package has no version (!) - perhaps the entry-point was from a deep import, which made
            // it impossible to find the package.json.
            // So just return the first config that matches the package name.
            return configs[0];
        }
        return configs.find(function (config) { return semver_1.satisfies(version, config.versionRange); }) || null;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9wYWNrYWdlcy9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILGlDQUFpQztJQUNqQyx1QkFBeUI7SUFDekIsMkVBQWtHO0lBOERsRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXNCRztJQUNVLFFBQUEsbUJBQW1CLEdBQXNCO1FBQ3BELFFBQVEsRUFBRTtZQUNSLHVEQUF1RDtZQUN2RCw0QkFBNEI7WUFDNUIsbUJBQW1CO1lBQ25CLCtDQUErQztZQUMvQyxPQUFPO1lBQ1AsS0FBSztZQUVMLGdHQUFnRztZQUNoRyx5RkFBeUY7WUFDekYsNENBQTRDO1lBQzVDLHFCQUFxQixFQUFFO2dCQUNyQixXQUFXLEVBQUU7b0JBQ1gsR0FBRyxFQUFFO3dCQUNILFFBQVEsRUFBRTs0QkFDUixJQUFJLEVBQUUsWUFBWTt5QkFDbkI7cUJBQ0Y7aUJBQ0Y7YUFDRjtZQUVELGdHQUFnRztZQUNoRyxzRkFBc0Y7WUFDdEYsa0NBQWtDO1lBQ2xDLGFBQWEsRUFBRTtnQkFDYixXQUFXLEVBQUU7b0JBQ1gsUUFBUSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQztpQkFDekI7YUFDRjtTQUNGO0tBQ0YsQ0FBQztJQU1GLElBQU0sb0JBQW9CLEdBQUcsZ0JBQWdCLENBQUM7SUFFOUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BdUJHO0lBQ0g7UUFLRSwyQkFBb0IsRUFBYyxFQUFFLE9BQXVCO1lBQXZDLE9BQUUsR0FBRixFQUFFLENBQVk7WUFGMUIsVUFBSyxHQUFHLElBQUksR0FBRyxFQUFrQyxDQUFDO1lBR3hELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSwyQkFBbUIs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Q0FBQztRQUN6QyxDQUFDO1FBQ0gsd0JBQUM7SUFBRCxDQUFDLEFBaElELElBZ0lDO0lBaElZLDhDQUFpQjtJQWtJOUIsU0FBUyx1QkFBdUIsQ0FDNUIsT0FBNkMsRUFBRSxPQUFzQjtRQUV2RSxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDekIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtZQUNwQiw4RkFBOEY7WUFDOUYsMENBQTBDO1lBQzFDLGlFQUFpRTtZQUNqRSxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNuQjtRQUNELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLGtCQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBdkMsQ0FBdUMsQ0FBQyxJQUFJLElBQUksQ0FBQztJQUNqRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtzYXRpc2ZpZXN9IGZyb20gJ3NlbXZlcic7XG5pbXBvcnQgKiBhcyB2bSBmcm9tICd2bSc7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBGaWxlU3lzdGVtLCBkaXJuYW1lLCBqb2luLCByZXNvbHZlfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtQYWNrYWdlSnNvbkZvcm1hdFByb3BlcnRpZXNNYXB9IGZyb20gJy4vZW50cnlfcG9pbnQnO1xuXG4vKipcbiAqIFRoZSBmb3JtYXQgb2YgYSBwcm9qZWN0IGxldmVsIGNvbmZpZ3VyYXRpb24gZmlsZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOZ2NjUHJvamVjdENvbmZpZzxUID0gTmdjY1BhY2thZ2VDb25maWc+IHtcbiAgLyoqXG4gICAqIFRoZSBwYWNrYWdlcyB0aGF0IGFyZSBjb25maWd1cmVkIGJ5IHRoaXMgcHJvamVjdCBjb25maWcuXG4gICAqL1xuICBwYWNrYWdlczoge1twYWNrYWdlUGF0aDogc3RyaW5nXTogVH07XG59XG5cbi8qKlxuICogVGhlIGZvcm1hdCBvZiBhIHBhY2thZ2UgbGV2ZWwgY29uZmlndXJhdGlvbiBmaWxlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5nY2NQYWNrYWdlQ29uZmlnIHtcbiAgLyoqXG4gICAqIFRoZSBlbnRyeS1wb2ludHMgdG8gY29uZmlndXJlIGZvciB0aGlzIHBhY2thZ2UuXG4gICAqXG4gICAqIEluIHRoZSBjb25maWcgZmlsZSB0aGUga2V5cyBjYW4gYmUgcGF0aHMgcmVsYXRpdmUgdG8gdGhlIHBhY2thZ2UgcGF0aDtcbiAgICogYnV0IHdoZW4gYmVpbmcgcmVhZCBiYWNrIGZyb20gdGhlIGBOZ2NjQ29uZmlndXJhdGlvbmAgc2VydmljZSwgdGhlc2UgcGF0aHNcbiAgICogd2lsbCBiZSBhYnNvbHV0ZS5cbiAgICovXG4gIGVudHJ5UG9pbnRzOiB7W2VudHJ5UG9pbnRQYXRoOiBzdHJpbmddOiBOZ2NjRW50cnlQb2ludENvbmZpZzt9O1xuICAvKipcbiAgICogQSBjb2xsZWN0aW9uIG9mIHJlZ2V4ZXMgdGhhdCBtYXRjaCBkZWVwIGltcG9ydHMgdG8gaWdub3JlLCBmb3IgdGhpcyBwYWNrYWdlLCByYXRoZXIgdGhhblxuICAgKiBkaXNwbGF5aW5nIGEgd2FybmluZy5cbiAgICovXG4gIGlnbm9yYWJsZURlZXBJbXBvcnRNYXRjaGVycz86IFJlZ0V4cFtdO1xufVxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgYW4gZW50cnktcG9pbnQuXG4gKlxuICogVGhlIGV4aXN0ZW5jZSBvZiBhIGNvbmZpZ3VyYXRpb24gZm9yIGEgcGF0aCB0ZWxscyBuZ2NjIHRoYXQgdGhpcyBzaG91bGQgYmUgY29uc2lkZXJlZCBmb3JcbiAqIHByb2Nlc3NpbmcgYXMgYW4gZW50cnktcG9pbnQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmdjY0VudHJ5UG9pbnRDb25maWcge1xuICAvKiogRG8gbm90IHByb2Nlc3MgKG9yIGV2ZW4gYWNrbm93bGVkZ2UgdGhlIGV4aXN0ZW5jZSBvZikgdGhpcyBlbnRyeS1wb2ludCwgaWYgdHJ1ZS4gKi9cbiAgaWdub3JlPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFRoaXMgcHJvcGVydHksIGlmIHByb3ZpZGVkLCBob2xkcyB2YWx1ZXMgdGhhdCB3aWxsIG92ZXJyaWRlIGVxdWl2YWxlbnQgcHJvcGVydGllcyBpbiBhblxuICAgKiBlbnRyeS1wb2ludCdzIHBhY2thZ2UuanNvbiBmaWxlLlxuICAgKi9cbiAgb3ZlcnJpZGU/OiBQYWNrYWdlSnNvbkZvcm1hdFByb3BlcnRpZXNNYXA7XG5cbiAgLyoqXG4gICAqIE5vcm1hbGx5LCBuZ2NjIHdpbGwgc2tpcCBjb21waWxhdGlvbiBvZiBlbnRyeXBvaW50cyB0aGF0IGNvbnRhaW4gaW1wb3J0cyB0aGF0IGNhbid0IGJlIHJlc29sdmVkXG4gICAqIG9yIHVuZGVyc3Rvb2QuIElmIHRoaXMgb3B0aW9uIGlzIHNwZWNpZmllZCwgbmdjYyB3aWxsIHByb2NlZWQgd2l0aCBjb21waWxpbmcgdGhlIGVudHJ5cG9pbnRcbiAgICogZXZlbiBpbiB0aGUgZmFjZSBvZiBzdWNoIG1pc3NpbmcgZGVwZW5kZW5jaWVzLlxuICAgKi9cbiAgaWdub3JlTWlzc2luZ0RlcGVuZGVuY2llcz86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEVuYWJsaW5nIHRoaXMgb3B0aW9uIGZvciBhbiBlbnRyeXBvaW50IHRlbGxzIG5nY2MgdGhhdCBkZWVwIGltcG9ydHMgbWlnaHQgYmUgdXNlZCBmb3IgdGhlIGZpbGVzXG4gICAqIGl0IGNvbnRhaW5zLCBhbmQgdGhhdCBpdCBzaG91bGQgZ2VuZXJhdGUgcHJpdmF0ZSByZS1leHBvcnRzIGFsb25nc2lkZSB0aGUgTmdNb2R1bGUgb2YgYWxsIHRoZVxuICAgKiBkaXJlY3RpdmVzL3BpcGVzIGl0IG1ha2VzIGF2YWlsYWJsZSBpbiBzdXBwb3J0IG9mIHRob3NlIGltcG9ydHMuXG4gICAqL1xuICBnZW5lcmF0ZURlZXBSZWV4cG9ydHM/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gZm9yIG5nY2MuXG4gKlxuICogVGhpcyBpcyB0aGUgdWx0aW1hdGUgZmFsbGJhY2sgY29uZmlndXJhdGlvbiB0aGF0IG5nY2Mgd2lsbCB1c2UgaWYgdGhlcmUgaXMgbm8gY29uZmlndXJhdGlvblxuICogZm9yIGEgcGFja2FnZSBhdCB0aGUgcGFja2FnZSBsZXZlbCBvciBwcm9qZWN0IGxldmVsLlxuICpcbiAqIFRoaXMgY29uZmlndXJhdGlvbiBpcyBmb3IgcGFja2FnZXMgdGhhdCBhcmUgXCJkZWFkXCIgLSBpLmUuIG5vIGxvbmdlciBtYWludGFpbmVkIGFuZCBzbyBhcmVcbiAqIHVubGlrZWx5IHRvIGJlIGZpeGVkIHRvIHdvcmsgd2l0aCBuZ2NjLCBub3IgcHJvdmlkZSBhIHBhY2thZ2UgbGV2ZWwgY29uZmlnIG9mIHRoZWlyIG93bi5cbiAqXG4gKiBUaGUgZmFsbGJhY2sgcHJvY2VzcyBmb3IgbG9va2luZyB1cCBjb25maWd1cmF0aW9uIGlzOlxuICpcbiAqIFByb2plY3QgLT4gUGFja2FnZSAtPiBEZWZhdWx0XG4gKlxuICogSWYgYSBwYWNrYWdlIHByb3ZpZGVzIGl0cyBvd24gY29uZmlndXJhdGlvbiB0aGVuIHRoYXQgd291bGQgb3ZlcnJpZGUgdGhpcyBkZWZhdWx0IG9uZS5cbiAqXG4gKiBBbHNvIGFwcGxpY2F0aW9uIGRldmVsb3BlcnMgY2FuIGFsd2F5cyBwcm92aWRlIGNvbmZpZ3VyYXRpb24gYXQgdGhlaXIgcHJvamVjdCBsZXZlbCB3aGljaFxuICogd2lsbCBvdmVycmlkZSBldmVyeXRoaW5nIGVsc2UuXG4gKlxuICogTm90ZSB0aGF0IHRoZSBmYWxsYmFjayBpcyBwYWNrYWdlIGJhc2VkIG5vdCBlbnRyeS1wb2ludCBiYXNlZC5cbiAqIEZvciBleGFtcGxlLCBpZiBhIHRoZXJlIGlzIGNvbmZpZ3VyYXRpb24gZm9yIGEgcGFja2FnZSBhdCB0aGUgcHJvamVjdCBsZXZlbCB0aGlzIHdpbGwgcmVwbGFjZSBhbGxcbiAqIGVudHJ5LXBvaW50IGNvbmZpZ3VyYXRpb25zIHRoYXQgbWF5IGhhdmUgYmVlbiBwcm92aWRlZCBpbiB0aGUgcGFja2FnZSBsZXZlbCBvciBkZWZhdWx0IGxldmVsXG4gKiBjb25maWd1cmF0aW9ucywgZXZlbiBpZiB0aGUgcHJvamVjdCBsZXZlbCBjb25maWd1cmF0aW9uIGRvZXMgbm90IHByb3ZpZGUgZm9yIGEgZ2l2ZW4gZW50cnktcG9pbnQuXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX05HQ0NfQ09ORklHOiBOZ2NjUHJvamVjdENvbmZpZyA9IHtcbiAgcGFja2FnZXM6IHtcbiAgICAvLyBBZGQgZGVmYXVsdCBwYWNrYWdlIGNvbmZpZ3VyYXRpb24gaGVyZS4gRm9yIGV4YW1wbGU6XG4gICAgLy8gJ0Bhbmd1bGFyL2ZpcmVAXjUuMi4wJzoge1xuICAgIC8vICAgZW50cnlQb2ludHM6IHtcbiAgICAvLyAgICAgJy4vZGF0YWJhc2UtZGVwcmVjYXRlZCc6IHtpZ25vcmU6IHRydWV9LFxuICAgIC8vICAgfSxcbiAgICAvLyB9LFxuXG4gICAgLy8gVGhlIHBhY2thZ2UgZG9lcyBub3QgY29udGFpbiBhbnkgYC5tZXRhZGF0YS5qc29uYCBmaWxlcyBpbiB0aGUgcm9vdCBkaXJlY3RvcnkgYnV0IG9ubHkgaW5zaWRlXG4gICAgLy8gYGRpc3QvYC4gV2l0aG91dCB0aGlzIGNvbmZpZywgbmdjYyBkb2VzIG5vdCByZWFsaXplIHRoaXMgaXMgYSBWaWV3RW5naW5lLWJ1aWx0IEFuZ3VsYXJcbiAgICAvLyBwYWNrYWdlIHRoYXQgbmVlZHMgdG8gYmUgY29tcGlsZWQgdG8gSXZ5LlxuICAgICdhbmd1bGFyMi1oaWdoY2hhcnRzJzoge1xuICAgICAgZW50cnlQb2ludHM6IHtcbiAgICAgICAgJy4nOiB7XG4gICAgICAgICAgb3ZlcnJpZGU6IHtcbiAgICAgICAgICAgIG1haW46ICcuL2luZGV4LmpzJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gVGhlIGBkaXN0L2AgZGlyZWN0b3J5IGhhcyBhIGR1cGxpY2F0ZSBgcGFja2FnZS5qc29uYCBwb2ludGluZyB0byB0aGUgc2FtZSBmaWxlcywgd2hpY2ggKHVuZGVyXG4gICAgLy8gY2VydGFpbiBjb25maWd1cmF0aW9ucykgY2FuIGNhdXNlcyBuZ2NjIHRvIHRyeSB0byBwcm9jZXNzIHRoZSBmaWxlcyB0d2ljZSBhbmQgZmFpbC5cbiAgICAvLyBJZ25vcmUgdGhlIGBkaXN0L2AgZW50cnktcG9pbnQuXG4gICAgJ25nMi1kcmFndWxhJzoge1xuICAgICAgZW50cnlQb2ludHM6IHtcbiAgICAgICAgJy4vZGlzdCc6IHtpZ25vcmU6IHRydWV9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufTtcblxuaW50ZXJmYWNlIFZlcnNpb25lZFBhY2thZ2VDb25maWcgZXh0ZW5kcyBOZ2NjUGFja2FnZUNvbmZpZyB7XG4gIHZlcnNpb25SYW5nZTogc3RyaW5nO1xufVxuXG5jb25zdCBOR0NDX0NPTkZJR19GSUxFTkFNRSA9ICduZ2NjLmNvbmZpZy5qcyc7XG5cbi8qKlxuICogTmdjYyBoYXMgYSBoaWVyYXJjaGljYWwgY29uZmlndXJhdGlvbiBzeXN0ZW0gdGhhdCBsZXRzIHVzIFwiZml4IHVwXCIgcGFja2FnZXMgdGhhdCBkbyBub3RcbiAqIHdvcmsgd2l0aCBuZ2NjIG91dCBvZiB0aGUgYm94LlxuICpcbiAqIFRoZXJlIGFyZSB0aHJlZSBsZXZlbHMgYXQgd2hpY2ggY29uZmlndXJhdGlvbiBjYW4gYmUgZGVjbGFyZWQ6XG4gKlxuICogKiBEZWZhdWx0IGxldmVsIC0gbmdjYyBjb21lcyB3aXRoIGJ1aWx0LWluIGNvbmZpZ3VyYXRpb24gZm9yIHdlbGwga25vd24gY2FzZXMuXG4gKiAqIFBhY2thZ2UgbGV2ZWwgLSBhIGxpYnJhcnkgYXV0aG9yIHB1Ymxpc2hlcyBhIGNvbmZpZ3VyYXRpb24gd2l0aCB0aGVpciBwYWNrYWdlIHRvIGZpeCBrbm93blxuICogICBpc3N1ZXMuXG4gKiAqIFByb2plY3QgbGV2ZWwgLSB0aGUgYXBwbGljYXRpb24gZGV2ZWxvcGVyIHByb3ZpZGVzIGEgY29uZmlndXJhdGlvbiB0aGF0IGZpeGVzIGlzc3VlcyBzcGVjaWZpY1xuICogICB0byB0aGUgbGlicmFyaWVzIHVzZWQgaW4gdGhlaXIgYXBwbGljYXRpb24uXG4gKlxuICogTmdjYyB3aWxsIG1hdGNoIGNvbmZpZ3VyYXRpb24gYmFzZWQgb24gdGhlIHBhY2thZ2UgbmFtZSBidXQgYWxzbyBvbiBpdHMgdmVyc2lvbi4gVGhpcyBhbGxvd3NcbiAqIGNvbmZpZ3VyYXRpb24gdG8gcHJvdmlkZSBkaWZmZXJlbnQgZml4ZXMgdG8gZGlmZmVyZW50IHZlcnNpb24gcmFuZ2VzIG9mIGEgcGFja2FnZS5cbiAqXG4gKiAqIFBhY2thZ2UgbGV2ZWwgY29uZmlndXJhdGlvbiBpcyBzcGVjaWZpYyB0byB0aGUgcGFja2FnZSB2ZXJzaW9uIHdoZXJlIHRoZSBjb25maWd1cmF0aW9uIGlzXG4gKiAgIGZvdW5kLlxuICogKiBEZWZhdWx0IGFuZCBwcm9qZWN0IGxldmVsIGNvbmZpZ3VyYXRpb24gc2hvdWxkIHByb3ZpZGUgdmVyc2lvbiByYW5nZXMgdG8gZW5zdXJlIHRoYXQgdGhlXG4gKiAgIGNvbmZpZ3VyYXRpb24gaXMgb25seSBhcHBsaWVkIHRvIHRoZSBhcHByb3ByaWF0ZSB2ZXJzaW9ucyBvZiBhIHBhY2thZ2UuXG4gKlxuICogV2hlbiBnZXR0aW5nIGEgY29uZmlndXJhdGlvbiBmb3IgYSBwYWNrYWdlICh2aWEgYGdldENvbmZpZygpYCkgdGhlIGNhbGxlciBzaG91bGQgcHJvdmlkZSB0aGVcbiAqIHZlcnNpb24gb2YgdGhlIHBhY2thZ2UgaW4gcXVlc3Rpb24sIGlmIGF2YWlsYWJsZS4gSWYgaXQgaXMgbm90IHByb3ZpZGVkIHRoZW4gdGhlIGZpcnN0IGF2YWlsYWJsZVxuICogY29uZmlndXJhdGlvbiBmb3IgYSBwYWNrYWdlIGlzIHJldHVybmVkLlxuICovXG5leHBvcnQgY2xhc3MgTmdjY0NvbmZpZ3VyYXRpb24ge1xuICBwcml2YXRlIGRlZmF1bHRDb25maWc6IE5nY2NQcm9qZWN0Q29uZmlnPFZlcnNpb25lZFBhY2thZ2VDb25maWdbXT47XG4gIHByaXZhdGUgcHJvamVjdENvbmZpZzogTmdjY1Byb2plY3RDb25maWc8VmVyc2lvbmVkUGFja2FnZUNvbmZpZ1tdPjtcbiAgcHJpdmF0ZSBjYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBWZXJzaW9uZWRQYWNrYWdlQ29uZmlnPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZnM6IEZpbGVTeXN0ZW0sIGJhc2VEaXI6IEFic29sdXRlRnNQYXRoKSB7XG4gICAgdGhpcy5kZWZhdWx0Q29uZmlnID0gdGhpcy5wcm9jZXNzUHJvamVjdENvbmZpZyhiYXNlRGlyLCBERUZBVUxUX05HQ0NfQ09ORklHKTtcbiAgICB0aGlzLnByb2plY3RDb25maWcgPSB0aGlzLnByb2Nlc3NQcm9qZWN0Q29uZmlnKGJhc2VEaXIsIHRoaXMubG9hZFByb2plY3RDb25maWcoYmFzZURpcikpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBnaXZlbiBgdmVyc2lvbmAgb2YgYSBwYWNrYWdlIGF0IGBwYWNrYWdlUGF0aGAuXG4gICAqXG4gICAqIEBwYXJhbSBwYWNrYWdlUGF0aCBUaGUgcGF0aCB0byB0aGUgcGFja2FnZSB3aG9zZSBjb25maWcgd2Ugd2FudC5cbiAgICogQHBhcmFtIHZlcnNpb24gVGhlIHZlcnNpb24gb2YgdGhlIHBhY2thZ2Ugd2hvc2UgY29uZmlnIHdlIHdhbnQsIG9yIGBudWxsYCBpZiB0aGUgcGFja2FnZSdzXG4gICAqIHBhY2thZ2UuanNvbiBkaWQgbm90IGV4aXN0IG9yIHdhcyBpbnZhbGlkLlxuICAgKi9cbiAgZ2V0Q29uZmlnKHBhY2thZ2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgdmVyc2lvbjogc3RyaW5nfG51bGwpOiBWZXJzaW9uZWRQYWNrYWdlQ29uZmlnIHtcbiAgICBjb25zdCBjYWNoZUtleSA9IHBhY2thZ2VQYXRoICsgKHZlcnNpb24gIT09IG51bGwgPyBgQCR7dmVyc2lvbn1gIDogJycpO1xuICAgIGlmICh0aGlzLmNhY2hlLmhhcyhjYWNoZUtleSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhY2hlLmdldChjYWNoZUtleSkgITtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9qZWN0TGV2ZWxDb25maWcgPVxuICAgICAgICBmaW5kU2F0aXNmYWN0b3J5VmVyc2lvbih0aGlzLnByb2plY3RDb25maWcucGFja2FnZXNbcGFja2FnZVBhdGhdLCB2ZXJzaW9uKTtcbiAgICBpZiAocHJvamVjdExldmVsQ29uZmlnICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmNhY2hlLnNldChjYWNoZUtleSwgcHJvamVjdExldmVsQ29uZmlnKTtcbiAgICAgIHJldHVybiBwcm9qZWN0TGV2ZWxDb25maWc7XG4gICAgfVxuXG4gICAgY29uc3QgcGFja2FnZUxldmVsQ29uZmlnID0gdGhpcy5sb2FkUGFja2FnZUNvbmZpZyhwYWNrYWdlUGF0aCwgdmVyc2lvbik7XG4gICAgaWYgKHBhY2thZ2VMZXZlbENvbmZpZyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5jYWNoZS5zZXQoY2FjaGVLZXksIHBhY2thZ2VMZXZlbENvbmZpZyk7XG4gICAgICByZXR1cm4gcGFja2FnZUxldmVsQ29uZmlnO1xuICAgIH1cblxuICAgIGNvbnN0IGRlZmF1bHRMZXZlbENvbmZpZyA9XG4gICAgICAgIGZpbmRTYXRpc2ZhY3RvcnlWZXJzaW9uKHRoaXMuZGVmYXVsdENvbmZpZy5wYWNrYWdlc1twYWNrYWdlUGF0aF0sIHZlcnNpb24pO1xuICAgIGlmIChkZWZhdWx0TGV2ZWxDb25maWcgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuY2FjaGUuc2V0KGNhY2hlS2V5LCBkZWZhdWx0TGV2ZWxDb25maWcpO1xuICAgICAgcmV0dXJuIGRlZmF1bHRMZXZlbENvbmZpZztcbiAgICB9XG5cbiAgICByZXR1cm4ge3ZlcnNpb25SYW5nZTogJyonLCBlbnRyeVBvaW50czoge319O1xuICB9XG5cbiAgcHJpdmF0ZSBwcm9jZXNzUHJvamVjdENvbmZpZyhiYXNlRGlyOiBBYnNvbHV0ZUZzUGF0aCwgcHJvamVjdENvbmZpZzogTmdjY1Byb2plY3RDb25maWcpOlxuICAgICAgTmdjY1Byb2plY3RDb25maWc8VmVyc2lvbmVkUGFja2FnZUNvbmZpZ1tdPiB7XG4gICAgY29uc3QgcHJvY2Vzc2VkQ29uZmlnOiBOZ2NjUHJvamVjdENvbmZpZzxWZXJzaW9uZWRQYWNrYWdlQ29uZmlnW10+ID0ge3BhY2thZ2VzOiB7fX07XG4gICAgZm9yIChjb25zdCBwYWNrYWdlUGF0aEFuZFZlcnNpb24gaW4gcHJvamVjdENvbmZpZy5wYWNrYWdlcykge1xuICAgICAgY29uc3QgcGFja2FnZUNvbmZpZyA9IHByb2plY3RDb25maWcucGFja2FnZXNbcGFja2FnZVBhdGhBbmRWZXJzaW9uXTtcbiAgICAgIGlmIChwYWNrYWdlQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IFtwYWNrYWdlUGF0aCwgdmVyc2lvblJhbmdlID0gJyonXSA9IHRoaXMuc3BsaXRQYXRoQW5kVmVyc2lvbihwYWNrYWdlUGF0aEFuZFZlcnNpb24pO1xuICAgICAgICBjb25zdCBhYnNQYWNrYWdlUGF0aCA9IHJlc29sdmUoYmFzZURpciwgJ25vZGVfbW9kdWxlcycsIHBhY2thZ2VQYXRoKTtcbiAgICAgICAgY29uc3QgZW50cnlQb2ludHMgPSB0aGlzLnByb2Nlc3NFbnRyeVBvaW50cyhhYnNQYWNrYWdlUGF0aCwgcGFja2FnZUNvbmZpZyk7XG4gICAgICAgIHByb2Nlc3NlZENvbmZpZy5wYWNrYWdlc1thYnNQYWNrYWdlUGF0aF0gPSBwcm9jZXNzZWRDb25maWcucGFja2FnZXNbYWJzUGFja2FnZVBhdGhdIHx8IFtdO1xuICAgICAgICBwcm9jZXNzZWRDb25maWcucGFja2FnZXNbYWJzUGFja2FnZVBhdGhdLnB1c2goXG4gICAgICAgICAgICB7Li4ucGFja2FnZUNvbmZpZywgdmVyc2lvblJhbmdlLCBlbnRyeVBvaW50c30pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvY2Vzc2VkQ29uZmlnO1xuICB9XG5cbiAgcHJpdmF0ZSBsb2FkUHJvamVjdENvbmZpZyhiYXNlRGlyOiBBYnNvbHV0ZUZzUGF0aCk6IE5nY2NQcm9qZWN0Q29uZmlnIHtcbiAgICBjb25zdCBjb25maWdGaWxlUGF0aCA9IGpvaW4oYmFzZURpciwgTkdDQ19DT05GSUdfRklMRU5BTUUpO1xuICAgIGlmICh0aGlzLmZzLmV4aXN0cyhjb25maWdGaWxlUGF0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV2YWxTcmNGaWxlKGNvbmZpZ0ZpbGVQYXRoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHByb2plY3QgY29uZmlndXJhdGlvbiBmaWxlIGF0IFwiJHtjb25maWdGaWxlUGF0aH1cIjogYCArIGUubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7cGFja2FnZXM6IHt9fTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGxvYWRQYWNrYWdlQ29uZmlnKHBhY2thZ2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgdmVyc2lvbjogc3RyaW5nfG51bGwpOlxuICAgICAgVmVyc2lvbmVkUGFja2FnZUNvbmZpZ3xudWxsIHtcbiAgICBjb25zdCBjb25maWdGaWxlUGF0aCA9IGpvaW4ocGFja2FnZVBhdGgsIE5HQ0NfQ09ORklHX0ZJTEVOQU1FKTtcbiAgICBpZiAodGhpcy5mcy5leGlzdHMoY29uZmlnRmlsZVBhdGgpKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHZlcnNpb25SYW5nZTogdmVyc2lvbiB8fCAnKicsXG4gICAgICAgICAgZW50cnlQb2ludHM6IHRoaXMucHJvY2Vzc0VudHJ5UG9pbnRzKHBhY2thZ2VQYXRoLCB0aGlzLmV2YWxTcmNGaWxlKGNvbmZpZ0ZpbGVQYXRoKSksXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYWNrYWdlIGNvbmZpZ3VyYXRpb24gZmlsZSBhdCBcIiR7Y29uZmlnRmlsZVBhdGh9XCI6IGAgKyBlLm1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGV2YWxTcmNGaWxlKHNyY1BhdGg6IEFic29sdXRlRnNQYXRoKTogYW55IHtcbiAgICBjb25zdCBzcmMgPSB0aGlzLmZzLnJlYWRGaWxlKHNyY1BhdGgpO1xuICAgIGNvbnN0IHRoZUV4cG9ydHMgPSB7fTtcbiAgICBjb25zdCBzYW5kYm94ID0ge1xuICAgICAgbW9kdWxlOiB7ZXhwb3J0czogdGhlRXhwb3J0c30sXG4gICAgICBleHBvcnRzOiB0aGVFeHBvcnRzLCByZXF1aXJlLFxuICAgICAgX19kaXJuYW1lOiBkaXJuYW1lKHNyY1BhdGgpLFxuICAgICAgX19maWxlbmFtZTogc3JjUGF0aFxuICAgIH07XG4gICAgdm0ucnVuSW5OZXdDb250ZXh0KHNyYywgc2FuZGJveCwge2ZpbGVuYW1lOiBzcmNQYXRofSk7XG4gICAgcmV0dXJuIHNhbmRib3gubW9kdWxlLmV4cG9ydHM7XG4gIH1cblxuICBwcml2YXRlIHByb2Nlc3NFbnRyeVBvaW50cyhwYWNrYWdlUGF0aDogQWJzb2x1dGVGc1BhdGgsIHBhY2thZ2VDb25maWc6IE5nY2NQYWNrYWdlQ29uZmlnKTpcbiAgICAgIHtbZW50cnlQb2ludFBhdGg6IHN0cmluZ106IE5nY2NFbnRyeVBvaW50Q29uZmlnO30ge1xuICAgIGNvbnN0IHByb2Nlc3NlZEVudHJ5UG9pbnRzOiB7W2VudHJ5UG9pbnRQYXRoOiBzdHJpbmddOiBOZ2NjRW50cnlQb2ludENvbmZpZzt9ID0ge307XG4gICAgZm9yIChjb25zdCBlbnRyeVBvaW50UGF0aCBpbiBwYWNrYWdlQ29uZmlnLmVudHJ5UG9pbnRzKSB7XG4gICAgICAvLyBDaGFuZ2UgdGhlIGtleXMgdG8gYmUgYWJzb2x1dGUgcGF0aHNcbiAgICAgIHByb2Nlc3NlZEVudHJ5UG9pbnRzW3Jlc29sdmUocGFja2FnZVBhdGgsIGVudHJ5UG9pbnRQYXRoKV0gPVxuICAgICAgICAgIHBhY2thZ2VDb25maWcuZW50cnlQb2ludHNbZW50cnlQb2ludFBhdGhdO1xuICAgIH1cbiAgICByZXR1cm4gcHJvY2Vzc2VkRW50cnlQb2ludHM7XG4gIH1cblxuICBwcml2YXRlIHNwbGl0UGF0aEFuZFZlcnNpb24ocGFja2FnZVBhdGhBbmRWZXJzaW9uOiBzdHJpbmcpOiBbc3RyaW5nLCBzdHJpbmd8dW5kZWZpbmVkXSB7XG4gICAgY29uc3QgdmVyc2lvbkluZGV4ID0gcGFja2FnZVBhdGhBbmRWZXJzaW9uLmxhc3RJbmRleE9mKCdAJyk7XG4gICAgLy8gTm90ZSB0aGF0ID4gMCBpcyBiZWNhdXNlIHdlIGRvbid0IHdhbnQgdG8gbWF0Y2ggQCBhdCB0aGUgc3RhcnQgb2YgdGhlIGxpbmVcbiAgICAvLyB3aGljaCBpcyB3aGF0IHlvdSB3b3VsZCBoYXZlIHdpdGggYSBuYW1lc3BhY2VkIHBhY2thZ2UsIGUuZy4gYEBhbmd1bGFyL2NvbW1vbmAuXG4gICAgcmV0dXJuIHZlcnNpb25JbmRleCA+IDAgP1xuICAgICAgICBbXG4gICAgICAgICAgcGFja2FnZVBhdGhBbmRWZXJzaW9uLnN1YnN0cmluZygwLCB2ZXJzaW9uSW5kZXgpLFxuICAgICAgICAgIHBhY2thZ2VQYXRoQW5kVmVyc2lvbi5zdWJzdHJpbmcodmVyc2lvbkluZGV4ICsgMSlcbiAgICAgICAgXSA6XG4gICAgICAgIFtwYWNrYWdlUGF0aEFuZFZlcnNpb24sIHVuZGVmaW5lZF07XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluZFNhdGlzZmFjdG9yeVZlcnNpb24oXG4gICAgY29uZmlnczogVmVyc2lvbmVkUGFja2FnZUNvbmZpZ1tdIHwgdW5kZWZpbmVkLCB2ZXJzaW9uOiBzdHJpbmcgfCBudWxsKTogVmVyc2lvbmVkUGFja2FnZUNvbmZpZ3xcbiAgICBudWxsIHtcbiAgaWYgKGNvbmZpZ3MgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmICh2ZXJzaW9uID09PSBudWxsKSB7XG4gICAgLy8gVGhlIHBhY2thZ2UgaGFzIG5vIHZlcnNpb24gKCEpIC0gcGVyaGFwcyB0aGUgZW50cnktcG9pbnQgd2FzIGZyb20gYSBkZWVwIGltcG9ydCwgd2hpY2ggbWFkZVxuICAgIC8vIGl0IGltcG9zc2libGUgdG8gZmluZCB0aGUgcGFja2FnZS5qc29uLlxuICAgIC8vIFNvIGp1c3QgcmV0dXJuIHRoZSBmaXJzdCBjb25maWcgdGhhdCBtYXRjaGVzIHRoZSBwYWNrYWdlIG5hbWUuXG4gICAgcmV0dXJuIGNvbmZpZ3NbMF07XG4gIH1cbiAgcmV0dXJuIGNvbmZpZ3MuZmluZChjb25maWcgPT4gc2F0aXNmaWVzKHZlcnNpb24sIGNvbmZpZy52ZXJzaW9uUmFuZ2UpKSB8fCBudWxsO1xufVxuIl19