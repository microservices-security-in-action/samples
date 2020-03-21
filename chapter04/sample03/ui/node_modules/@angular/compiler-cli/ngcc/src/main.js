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
        define("@angular/compiler-cli/ngcc/src/main", ["require", "exports", "tslib", "os", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/dependencies/commonjs_dependency_host", "@angular/compiler-cli/ngcc/src/dependencies/dependency_resolver", "@angular/compiler-cli/ngcc/src/dependencies/dts_dependency_host", "@angular/compiler-cli/ngcc/src/dependencies/esm_dependency_host", "@angular/compiler-cli/ngcc/src/dependencies/module_resolver", "@angular/compiler-cli/ngcc/src/dependencies/umd_dependency_host", "@angular/compiler-cli/ngcc/src/entry_point_finder/directory_walker_entry_point_finder", "@angular/compiler-cli/ngcc/src/entry_point_finder/targeted_entry_point_finder", "@angular/compiler-cli/ngcc/src/execution/cluster/executor", "@angular/compiler-cli/ngcc/src/execution/cluster/package_json_updater", "@angular/compiler-cli/ngcc/src/execution/lock_file", "@angular/compiler-cli/ngcc/src/execution/single_process_executor", "@angular/compiler-cli/ngcc/src/execution/task_selection/parallel_task_queue", "@angular/compiler-cli/ngcc/src/execution/task_selection/serial_task_queue", "@angular/compiler-cli/ngcc/src/logging/console_logger", "@angular/compiler-cli/ngcc/src/packages/build_marker", "@angular/compiler-cli/ngcc/src/packages/configuration", "@angular/compiler-cli/ngcc/src/packages/entry_point", "@angular/compiler-cli/ngcc/src/packages/entry_point_bundle", "@angular/compiler-cli/ngcc/src/packages/transformer", "@angular/compiler-cli/ngcc/src/writing/cleaning/package_cleaner", "@angular/compiler-cli/ngcc/src/writing/in_place_file_writer", "@angular/compiler-cli/ngcc/src/writing/new_entry_point_file_writer", "@angular/compiler-cli/ngcc/src/writing/package_json_updater"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var os = require("os");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var commonjs_dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/commonjs_dependency_host");
    var dependency_resolver_1 = require("@angular/compiler-cli/ngcc/src/dependencies/dependency_resolver");
    var dts_dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/dts_dependency_host");
    var esm_dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/esm_dependency_host");
    var module_resolver_1 = require("@angular/compiler-cli/ngcc/src/dependencies/module_resolver");
    var umd_dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/umd_dependency_host");
    var directory_walker_entry_point_finder_1 = require("@angular/compiler-cli/ngcc/src/entry_point_finder/directory_walker_entry_point_finder");
    var targeted_entry_point_finder_1 = require("@angular/compiler-cli/ngcc/src/entry_point_finder/targeted_entry_point_finder");
    var executor_1 = require("@angular/compiler-cli/ngcc/src/execution/cluster/executor");
    var package_json_updater_1 = require("@angular/compiler-cli/ngcc/src/execution/cluster/package_json_updater");
    var lock_file_1 = require("@angular/compiler-cli/ngcc/src/execution/lock_file");
    var single_process_executor_1 = require("@angular/compiler-cli/ngcc/src/execution/single_process_executor");
    var parallel_task_queue_1 = require("@angular/compiler-cli/ngcc/src/execution/task_selection/parallel_task_queue");
    var serial_task_queue_1 = require("@angular/compiler-cli/ngcc/src/execution/task_selection/serial_task_queue");
    var console_logger_1 = require("@angular/compiler-cli/ngcc/src/logging/console_logger");
    var build_marker_1 = require("@angular/compiler-cli/ngcc/src/packages/build_marker");
    var configuration_1 = require("@angular/compiler-cli/ngcc/src/packages/configuration");
    var entry_point_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point");
    var entry_point_bundle_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point_bundle");
    var transformer_1 = require("@angular/compiler-cli/ngcc/src/packages/transformer");
    var package_cleaner_1 = require("@angular/compiler-cli/ngcc/src/writing/cleaning/package_cleaner");
    var in_place_file_writer_1 = require("@angular/compiler-cli/ngcc/src/writing/in_place_file_writer");
    var new_entry_point_file_writer_1 = require("@angular/compiler-cli/ngcc/src/writing/new_entry_point_file_writer");
    var package_json_updater_2 = require("@angular/compiler-cli/ngcc/src/writing/package_json_updater");
    function mainNgcc(_a) {
        var basePath = _a.basePath, targetEntryPointPath = _a.targetEntryPointPath, _b = _a.propertiesToConsider, propertiesToConsider = _b === void 0 ? entry_point_1.SUPPORTED_FORMAT_PROPERTIES : _b, _c = _a.compileAllFormats, compileAllFormats = _c === void 0 ? true : _c, _d = _a.createNewEntryPointFormats, createNewEntryPointFormats = _d === void 0 ? false : _d, _e = _a.logger, logger = _e === void 0 ? new console_logger_1.ConsoleLogger(console_logger_1.LogLevel.info) : _e, pathMappings = _a.pathMappings, _f = _a.async, async = _f === void 0 ? false : _f, _g = _a.enableI18nLegacyMessageIdFormat, enableI18nLegacyMessageIdFormat = _g === void 0 ? true : _g;
        // Execute in parallel, if async execution is acceptable and there are more than 1 CPU cores.
        var inParallel = async && (os.cpus().length > 1);
        // Instantiate common utilities that are always used.
        // NOTE: Avoid eagerly instantiating anything that might not be used when running sync/async or in
        //       master/worker process.
        var fileSystem = file_system_1.getFileSystem();
        var absBasePath = file_system_1.absoluteFrom(basePath);
        var config = new configuration_1.NgccConfiguration(fileSystem, file_system_1.dirname(absBasePath));
        var dependencyResolver = getDependencyResolver(fileSystem, logger, config, pathMappings);
        // Bail out early if the work is already done.
        var supportedPropertiesToConsider = ensureSupportedProperties(propertiesToConsider);
        var absoluteTargetEntryPointPath = targetEntryPointPath !== undefined ? file_system_1.resolve(basePath, targetEntryPointPath) : null;
        var finder = getEntryPointFinder(fileSystem, logger, dependencyResolver, config, absBasePath, absoluteTargetEntryPointPath, pathMappings);
        if (finder instanceof targeted_entry_point_finder_1.TargetedEntryPointFinder &&
            !finder.targetNeedsProcessingOrCleaning(supportedPropertiesToConsider, compileAllFormats)) {
            logger.debug('The target entry-point has already been processed');
            return;
        }
        // NOTE: To avoid file corruption, ensure that each `ngcc` invocation only creates _one_ instance
        //       of `PackageJsonUpdater` that actually writes to disk (across all processes).
        //       This is hard to enforce automatically, when running on multiple processes, so needs to be
        //       enforced manually.
        var pkgJsonUpdater = getPackageJsonUpdater(inParallel, fileSystem);
        // The function for performing the analysis.
        var analyzeEntryPoints = function () {
            var e_1, _a, e_2, _b;
            logger.debug('Analyzing entry-points...');
            var startTime = Date.now();
            var entryPointInfo = finder.findEntryPoints();
            var cleaned = package_cleaner_1.cleanOutdatedPackages(fileSystem, entryPointInfo.entryPoints);
            if (cleaned) {
                // If we had to clean up one or more packages then we must read in the entry-points again.
                entryPointInfo = finder.findEntryPoints();
            }
            var entryPoints = entryPointInfo.entryPoints, invalidEntryPoints = entryPointInfo.invalidEntryPoints, graph = entryPointInfo.graph;
            logInvalidEntryPoints(logger, invalidEntryPoints);
            var unprocessableEntryPointPaths = [];
            // The tasks are partially ordered by virtue of the entry-points being partially ordered too.
            var tasks = [];
            try {
                for (var entryPoints_1 = tslib_1.__values(entryPoints), entryPoints_1_1 = entryPoints_1.next(); !entryPoints_1_1.done; entryPoints_1_1 = entryPoints_1.next()) {
                    var entryPoint = entryPoints_1_1.value;
                    var packageJson = entryPoint.packageJson;
                    var hasProcessedTypings = build_marker_1.hasBeenProcessed(packageJson, 'typings');
                    var _c = getPropertiesToProcess(packageJson, supportedPropertiesToConsider, compileAllFormats), propertiesToProcess = _c.propertiesToProcess, equivalentPropertiesMap = _c.equivalentPropertiesMap;
                    var processDts = !hasProcessedTypings;
                    if (propertiesToProcess.length === 0) {
                        // This entry-point is unprocessable (i.e. there is no format property that is of interest
                        // and can be processed). This will result in an error, but continue looping over
                        // entry-points in order to collect all unprocessable ones and display a more informative
                        // error.
                        unprocessableEntryPointPaths.push(entryPoint.path);
                        continue;
                    }
                    try {
                        for (var propertiesToProcess_1 = (e_2 = void 0, tslib_1.__values(propertiesToProcess)), propertiesToProcess_1_1 = propertiesToProcess_1.next(); !propertiesToProcess_1_1.done; propertiesToProcess_1_1 = propertiesToProcess_1.next()) {
                            var formatProperty = propertiesToProcess_1_1.value;
                            if (build_marker_1.hasBeenProcessed(entryPoint.packageJson, formatProperty)) {
                                // The format-path which the property maps to is already processed - nothing to do.
                                logger.debug("Skipping " + entryPoint.name + " : " + formatProperty + " (already compiled).");
                                continue;
                            }
                            var formatPropertiesToMarkAsProcessed = equivalentPropertiesMap.get(formatProperty);
                            tasks.push({ entryPoint: entryPoint, formatProperty: formatProperty, formatPropertiesToMarkAsProcessed: formatPropertiesToMarkAsProcessed, processDts: processDts });
                            // Only process typings for the first property (if not already processed).
                            processDts = false;
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (propertiesToProcess_1_1 && !propertiesToProcess_1_1.done && (_b = propertiesToProcess_1.return)) _b.call(propertiesToProcess_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (entryPoints_1_1 && !entryPoints_1_1.done && (_a = entryPoints_1.return)) _a.call(entryPoints_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Check for entry-points for which we could not process any format at all.
            if (unprocessableEntryPointPaths.length > 0) {
                throw new Error('Unable to process any formats for the following entry-points (tried ' +
                    (propertiesToConsider.join(', ') + "): ") +
                    unprocessableEntryPointPaths.map(function (path) { return "\n  - " + path; }).join(''));
            }
            var duration = Math.round((Date.now() - startTime) / 1000);
            logger.debug("Analyzed " + entryPoints.length + " entry-points in " + duration + "s. " +
                ("(Total tasks: " + tasks.length + ")"));
            return getTaskQueue(inParallel, tasks, graph);
        };
        // The function for creating the `compile()` function.
        var createCompileFn = function (onTaskCompleted) {
            var fileWriter = getFileWriter(fileSystem, pkgJsonUpdater, createNewEntryPointFormats);
            var transformer = new transformer_1.Transformer(fileSystem, logger);
            return function (task) {
                var entryPoint = task.entryPoint, formatProperty = task.formatProperty, formatPropertiesToMarkAsProcessed = task.formatPropertiesToMarkAsProcessed, processDts = task.processDts;
                var isCore = entryPoint.name === '@angular/core'; // Are we compiling the Angular core?
                var packageJson = entryPoint.packageJson;
                var formatPath = packageJson[formatProperty];
                var format = entry_point_1.getEntryPointFormat(fileSystem, entryPoint, formatProperty);
                // All properties listed in `propertiesToProcess` are guaranteed to point to a format-path
                // (i.e. they are defined in `entryPoint.packageJson`). Furthermore, they are also guaranteed
                // to be among `SUPPORTED_FORMAT_PROPERTIES`.
                // Based on the above, `formatPath` should always be defined and `getEntryPointFormat()`
                // should always return a format here (and not `undefined`).
                if (!formatPath || !format) {
                    // This should never happen.
                    throw new Error("Invariant violated: No format-path or format for " + entryPoint.path + " : " +
                        (formatProperty + " (formatPath: " + formatPath + " | format: " + format + ")"));
                }
                var bundle = entry_point_bundle_1.makeEntryPointBundle(fileSystem, entryPoint, formatPath, isCore, format, processDts, pathMappings, true, enableI18nLegacyMessageIdFormat);
                logger.info("Compiling " + entryPoint.name + " : " + formatProperty + " as " + format);
                var result = transformer.transform(bundle);
                if (result.success) {
                    if (result.diagnostics.length > 0) {
                        logger.warn(diagnostics_1.replaceTsWithNgInErrors(ts.formatDiagnosticsWithColorAndContext(result.diagnostics, bundle.src.host)));
                    }
                    fileWriter.writeBundle(bundle, result.transformedFiles, formatPropertiesToMarkAsProcessed);
                }
                else {
                    var errors = diagnostics_1.replaceTsWithNgInErrors(ts.formatDiagnosticsWithColorAndContext(result.diagnostics, bundle.src.host));
                    throw new Error("Failed to compile entry-point " + entryPoint.name + " (" + formatProperty + " as " + format + ") due to compilation errors:\n" + errors);
                }
                logger.debug("  Successfully compiled " + entryPoint.name + " : " + formatProperty);
                onTaskCompleted(task, 0 /* Processed */);
            };
        };
        // The executor for actually planning and getting the work done.
        var executor = getExecutor(async, inParallel, logger, pkgJsonUpdater, new lock_file_1.LockFile(fileSystem));
        return executor.execute(analyzeEntryPoints, createCompileFn);
    }
    exports.mainNgcc = mainNgcc;
    function ensureSupportedProperties(properties) {
        var e_3, _a;
        // Short-circuit the case where `properties` has fallen back to the default value:
        // `SUPPORTED_FORMAT_PROPERTIES`
        if (properties === entry_point_1.SUPPORTED_FORMAT_PROPERTIES)
            return entry_point_1.SUPPORTED_FORMAT_PROPERTIES;
        var supportedProperties = [];
        try {
            for (var _b = tslib_1.__values(properties), _c = _b.next(); !_c.done; _c = _b.next()) {
                var prop = _c.value;
                if (entry_point_1.SUPPORTED_FORMAT_PROPERTIES.indexOf(prop) !== -1) {
                    supportedProperties.push(prop);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        if (supportedProperties.length === 0) {
            throw new Error("No supported format property to consider among [" + properties.join(', ') + "]. " +
                ("Supported properties: " + entry_point_1.SUPPORTED_FORMAT_PROPERTIES.join(', ')));
        }
        return supportedProperties;
    }
    function getPackageJsonUpdater(inParallel, fs) {
        var directPkgJsonUpdater = new package_json_updater_2.DirectPackageJsonUpdater(fs);
        return inParallel ? new package_json_updater_1.ClusterPackageJsonUpdater(directPkgJsonUpdater) : directPkgJsonUpdater;
    }
    function getFileWriter(fs, pkgJsonUpdater, createNewEntryPointFormats) {
        return createNewEntryPointFormats ? new new_entry_point_file_writer_1.NewEntryPointFileWriter(fs, pkgJsonUpdater) :
            new in_place_file_writer_1.InPlaceFileWriter(fs);
    }
    function getTaskQueue(inParallel, tasks, graph) {
        return inParallel ? new parallel_task_queue_1.ParallelTaskQueue(tasks, graph) : new serial_task_queue_1.SerialTaskQueue(tasks);
    }
    function getExecutor(async, inParallel, logger, pkgJsonUpdater, lockFile) {
        if (inParallel) {
            // Execute in parallel (which implies async).
            // Use up to 8 CPU cores for workers, always reserving one for master.
            var workerCount = Math.min(8, os.cpus().length - 1);
            return new executor_1.ClusterExecutor(workerCount, logger, pkgJsonUpdater, lockFile);
        }
        else {
            // Execute serially, on a single thread (either sync or async).
            return async ? new single_process_executor_1.AsyncSingleProcessExecutor(logger, pkgJsonUpdater, lockFile) :
                new single_process_executor_1.SingleProcessExecutor(logger, pkgJsonUpdater, lockFile);
        }
    }
    function getDependencyResolver(fileSystem, logger, config, pathMappings) {
        var moduleResolver = new module_resolver_1.ModuleResolver(fileSystem, pathMappings);
        var esmDependencyHost = new esm_dependency_host_1.EsmDependencyHost(fileSystem, moduleResolver);
        var umdDependencyHost = new umd_dependency_host_1.UmdDependencyHost(fileSystem, moduleResolver);
        var commonJsDependencyHost = new commonjs_dependency_host_1.CommonJsDependencyHost(fileSystem, moduleResolver);
        var dtsDependencyHost = new dts_dependency_host_1.DtsDependencyHost(fileSystem, pathMappings);
        return new dependency_resolver_1.DependencyResolver(fileSystem, logger, config, {
            esm5: esmDependencyHost,
            esm2015: esmDependencyHost,
            umd: umdDependencyHost,
            commonjs: commonJsDependencyHost
        }, dtsDependencyHost);
    }
    function getEntryPointFinder(fs, logger, resolver, config, basePath, absoluteTargetEntryPointPath, pathMappings) {
        if (absoluteTargetEntryPointPath !== null) {
            return new targeted_entry_point_finder_1.TargetedEntryPointFinder(fs, config, logger, resolver, basePath, absoluteTargetEntryPointPath, pathMappings);
        }
        else {
            return new directory_walker_entry_point_finder_1.DirectoryWalkerEntryPointFinder(fs, config, logger, resolver, basePath, pathMappings);
        }
    }
    function logInvalidEntryPoints(logger, invalidEntryPoints) {
        invalidEntryPoints.forEach(function (invalidEntryPoint) {
            logger.debug("Invalid entry-point " + invalidEntryPoint.entryPoint.path + ".", "It is missing required dependencies:\n" +
                invalidEntryPoint.missingDependencies.map(function (dep) { return " - " + dep; }).join('\n'));
        });
    }
    /**
     * This function computes and returns the following:
     * - `propertiesToProcess`: An (ordered) list of properties that exist and need to be processed,
     *   based on the provided `propertiesToConsider`, the properties in `package.json` and their
     *   corresponding format-paths. NOTE: Only one property per format-path needs to be processed.
     * - `equivalentPropertiesMap`: A mapping from each property in `propertiesToProcess` to the list of
     *   other format properties in `package.json` that need to be marked as processed as soon as the
     *   former has been processed.
     */
    function getPropertiesToProcess(packageJson, propertiesToConsider, compileAllFormats) {
        var e_4, _a, e_5, _b, e_6, _c;
        var formatPathsToConsider = new Set();
        var propertiesToProcess = [];
        try {
            for (var propertiesToConsider_1 = tslib_1.__values(propertiesToConsider), propertiesToConsider_1_1 = propertiesToConsider_1.next(); !propertiesToConsider_1_1.done; propertiesToConsider_1_1 = propertiesToConsider_1.next()) {
                var prop = propertiesToConsider_1_1.value;
                var formatPath = packageJson[prop];
                // Ignore properties that are not defined in `package.json`.
                if (typeof formatPath !== 'string')
                    continue;
                // Ignore properties that map to the same format-path as a preceding property.
                if (formatPathsToConsider.has(formatPath))
                    continue;
                // Process this property, because it is the first one to map to this format-path.
                formatPathsToConsider.add(formatPath);
                propertiesToProcess.push(prop);
                // If we only need one format processed, there is no need to process any more properties.
                if (!compileAllFormats)
                    break;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (propertiesToConsider_1_1 && !propertiesToConsider_1_1.done && (_a = propertiesToConsider_1.return)) _a.call(propertiesToConsider_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        var formatPathToProperties = {};
        try {
            for (var SUPPORTED_FORMAT_PROPERTIES_1 = tslib_1.__values(entry_point_1.SUPPORTED_FORMAT_PROPERTIES), SUPPORTED_FORMAT_PROPERTIES_1_1 = SUPPORTED_FORMAT_PROPERTIES_1.next(); !SUPPORTED_FORMAT_PROPERTIES_1_1.done; SUPPORTED_FORMAT_PROPERTIES_1_1 = SUPPORTED_FORMAT_PROPERTIES_1.next()) {
                var prop = SUPPORTED_FORMAT_PROPERTIES_1_1.value;
                var formatPath = packageJson[prop];
                // Ignore properties that are not defined in `package.json`.
                if (typeof formatPath !== 'string')
                    continue;
                // Ignore properties that do not map to a format-path that will be considered.
                if (!formatPathsToConsider.has(formatPath))
                    continue;
                // Add this property to the map.
                var list = formatPathToProperties[formatPath] || (formatPathToProperties[formatPath] = []);
                list.push(prop);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (SUPPORTED_FORMAT_PROPERTIES_1_1 && !SUPPORTED_FORMAT_PROPERTIES_1_1.done && (_b = SUPPORTED_FORMAT_PROPERTIES_1.return)) _b.call(SUPPORTED_FORMAT_PROPERTIES_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        var equivalentPropertiesMap = new Map();
        try {
            for (var propertiesToConsider_2 = tslib_1.__values(propertiesToConsider), propertiesToConsider_2_1 = propertiesToConsider_2.next(); !propertiesToConsider_2_1.done; propertiesToConsider_2_1 = propertiesToConsider_2.next()) {
                var prop = propertiesToConsider_2_1.value;
                var formatPath = packageJson[prop];
                var equivalentProperties = formatPathToProperties[formatPath];
                equivalentPropertiesMap.set(prop, equivalentProperties);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (propertiesToConsider_2_1 && !propertiesToConsider_2_1.done && (_c = propertiesToConsider_2.return)) _c.call(propertiesToConsider_2);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return { propertiesToProcess: propertiesToProcess, equivalentPropertiesMap: equivalentPropertiesMap };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUtILHVCQUF5QjtJQUN6QiwrQkFBaUM7SUFFakMsMkVBQW9FO0lBQ3BFLDJFQUFzSDtJQUV0SCxpSEFBK0U7SUFDL0UsdUdBQXlGO0lBQ3pGLHVHQUFxRTtJQUNyRSx1R0FBcUU7SUFDckUsK0ZBQThEO0lBQzlELHVHQUFxRTtJQUNyRSw2SUFBeUc7SUFFekcsNkhBQTBGO0lBRTFGLHNGQUE2RDtJQUM3RCw4R0FBbUY7SUFDbkYsZ0ZBQStDO0lBQy9DLDRHQUFzRztJQUN0RyxtSEFBaUY7SUFDakYsK0dBQTZFO0lBQzdFLHdGQUFpRTtJQUVqRSxxRkFBeUQ7SUFDekQsdUZBQTJEO0lBQzNELG1GQUFtSjtJQUNuSixpR0FBbUU7SUFDbkUsbUZBQW1EO0lBRW5ELG1HQUF5RTtJQUV6RSxvR0FBaUU7SUFDakUsa0hBQThFO0lBQzlFLG9HQUE0RjtJQTZGNUYsU0FBZ0IsUUFBUSxDQUNwQixFQUdxRDtZQUhwRCxzQkFBUSxFQUFFLDhDQUFvQixFQUFFLDRCQUFrRCxFQUFsRCxxRkFBa0QsRUFDbEYseUJBQXdCLEVBQXhCLDZDQUF3QixFQUFFLGtDQUFrQyxFQUFsQyx1REFBa0MsRUFDNUQsY0FBeUMsRUFBekMsZ0dBQXlDLEVBQUUsOEJBQVksRUFBRSxhQUFhLEVBQWIsa0NBQWEsRUFDdEUsdUNBQXNDLEVBQXRDLDJEQUFzQztRQUN6Qyw2RkFBNkY7UUFDN0YsSUFBTSxVQUFVLEdBQUcsS0FBSyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVuRCxxREFBcUQ7UUFDckQsa0dBQWtHO1FBQ2xHLCtCQUErQjtRQUMvQixJQUFNLFVBQVUs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O2dCQUM1RCxJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVE7b0JBQUUsU0FBUztnQkFFN0MsOEVBQThFO2dCQUM5RSxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztvQkFBRSxTQUFTO2dCQUVyRCxnQ0FBZ0M7Z0JBQ2hDLElBQU0sSUFBSSxHQUFHLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQzdGLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDakI7Ozs7Ozs7OztRQUVELElBQU0sdUJBQXVCLEdBQUcsSUFBSSxHQUFHLEVBQW9ELENBQUM7O1lBQzVGLEtBQW1CLElBQUEseUJBQUEsaUJBQUEsb0JBQW9CLENBQUEsMERBQUEsNEZBQUU7Z0JBQXBDLElBQU0sSUFBSSxpQ0FBQTtnQkFDYixJQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFHLENBQUM7Z0JBQ3ZDLElBQU0sb0JBQW9CLEdBQUcsc0JBQXNCLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2hFLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLENBQUMsQ0FBQzthQUN6RDs7Ozs7Ozs7O1FBRUQsT0FBTyxFQUFDLG1CQUFtQixxQkFBQSxFQUFFLHVCQUF1Qix5QkFBQSxFQUFDLENBQUM7SUFDeEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJub2RlXCIgLz5cblxuaW1wb3J0IHtEZXBHcmFwaH0gZnJvbSAnZGVwZW5kZW5jeS1ncmFwaCc7XG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtyZXBsYWNlVHNXaXRoTmdJbkVycm9yc30gZnJvbSAnLi4vLi4vc3JjL25ndHNjL2RpYWdub3N0aWNzJztcbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIEZpbGVTeXN0ZW0sIGFic29sdXRlRnJvbSwgZGlybmFtZSwgZ2V0RmlsZVN5c3RlbSwgcmVzb2x2ZX0gZnJvbSAnLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcblxuaW1wb3J0IHtDb21tb25Kc0RlcGVuZGVuY3lIb3N0fSBmcm9tICcuL2RlcGVuZGVuY2llcy9jb21tb25qc19kZXBlbmRlbmN5X2hvc3QnO1xuaW1wb3J0IHtEZXBlbmRlbmN5UmVzb2x2ZXIsIEludmFsaWRFbnRyeVBvaW50fSBmcm9tICcuL2RlcGVuZGVuY2llcy9kZXBlbmRlbmN5X3Jlc29sdmVyJztcbmltcG9ydCB7RHRzRGVwZW5kZW5jeUhvc3R9IGZyb20gJy4vZGVwZW5kZW5jaWVzL2R0c19kZXBlbmRlbmN5X2hvc3QnO1xuaW1wb3J0IHtFc21EZXBlbmRlbmN5SG9zdH0gZnJvbSAnLi9kZXBlbmRlbmNpZXMvZXNtX2RlcGVuZGVuY3lfaG9zdCc7XG5pbXBvcnQge01vZHVsZVJlc29sdmVyfSBmcm9tICcuL2RlcGVuZGVuY2llcy9tb2R1bGVfcmVzb2x2ZXInO1xuaW1wb3J0IHtVbWREZXBlbmRlbmN5SG9zdH0gZnJvbSAnLi9kZXBlbmRlbmNpZXMvdW1kX2RlcGVuZGVuY3lfaG9zdCc7XG5pbXBvcnQge0RpcmVjdG9yeVdhbGtlckVudHJ5UG9pbnRGaW5kZXJ9IGZyb20gJy4vZW50cnlfcG9pbnRfZmluZGVyL2RpcmVjdG9yeV93YWxrZXJfZW50cnlfcG9pbnRfZmluZGVyJztcbmltcG9ydCB7RW50cnlQb2ludEZpbmRlcn0gZnJvbSAnLi9lbnRyeV9wb2ludF9maW5kZXIvaW50ZXJmYWNlJztcbmltcG9ydCB7VGFyZ2V0ZWRFbnRyeVBvaW50RmluZGVyfSBmcm9tICcuL2VudHJ5X3BvaW50X2ZpbmRlci90YXJnZXRlZF9lbnRyeV9wb2ludF9maW5kZXInO1xuaW1wb3J0IHtBbmFseXplRW50cnlQb2ludHNGbiwgQ3JlYXRlQ29tcGlsZUZuLCBFeGVjdXRvciwgUGFydGlhbGx5T3JkZXJlZFRhc2tzLCBUYXNrLCBUYXNrUHJvY2Vzc2luZ091dGNvbWUsIFRhc2tRdWV1ZX0gZnJvbSAnLi9leGVjdXRpb24vYXBpJztcbmltcG9ydCB7Q2x1c3RlckV4ZWN1dG9yfSBmcm9tICcuL2V4ZWN1dGlvbi9jbHVzdGVyL2V4ZWN1dG9yJztcbmltcG9ydCB7Q2x1c3RlclBhY2thZ2VKc29uVXBkYXRlcn0gZnJvbSAnLi9leGVjdXRpb24vY2x1c3Rlci9wYWNrYWdlX2pzb25fdXBkYXRlcic7XG5pbXBvcnQge0xvY2tGaWxlfSBmcm9tICcuL2V4ZWN1dGlvbi9sb2NrX2ZpbGUnO1xuaW1wb3J0IHtBc3luY1NpbmdsZVByb2Nlc3NFeGVjdXRvciwgU2luZ2xlUHJvY2Vzc0V4ZWN1dG9yfSBmcm9tICcuL2V4ZWN1dGlvbi9zaW5nbGVfcHJvY2Vzc19leGVjdXRvcic7XG5pbXBvcnQge1BhcmFsbGVsVGFza1F1ZXVlfSBmcm9tICcuL2V4ZWN1dGlvbi90YXNrX3NlbGVjdGlvbi9wYXJhbGxlbF90YXNrX3F1ZXVlJztcbmltcG9ydCB7U2VyaWFsVGFza1F1ZXVlfSBmcm9tICcuL2V4ZWN1dGlvbi90YXNrX3NlbGVjdGlvbi9zZXJpYWxfdGFza19xdWV1ZSc7XG5pbXBvcnQge0NvbnNvbGVMb2dnZXIsIExvZ0xldmVsfSBmcm9tICcuL2xvZ2dpbmcvY29uc29sZV9sb2dnZXInO1xuaW1wb3J0IHtMb2dnZXJ9IGZyb20gJy4vbG9nZ2luZy9sb2dnZXInO1xuaW1wb3J0IHtoYXNCZWVuUHJvY2Vzc2VkfSBmcm9tICcuL3BhY2thZ2VzL2J1aWxkX21hcmtlcic7XG5pbXBvcnQge05nY2NDb25maWd1cmF0aW9ufSBmcm9tICcuL3BhY2thZ2VzL2NvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHtFbnRyeVBvaW50LCBFbnRyeVBvaW50SnNvblByb3BlcnR5LCBFbnRyeVBvaW50UGFja2FnZUpzb24sIFNVUFBPUlRFRF9GT1JNQVRfUFJPUEVSVElFUywgZ2V0RW50cnlQb2ludEZvcm1hdH0gZnJvbSAnLi9wYWNrYWdlcy9lbnRyeV9wb2ludCc7XG5pbXBvcnQge21ha2VFbnRyeVBvaW50QnVuZGxlfSBmcm9tICcuL3BhY2thZ2VzL2VudHJ5X3BvaW50X2J1bmRsZSc7XG5pbXBvcnQge1RyYW5zZm9ybWVyfSBmcm9tICcuL3BhY2thZ2VzL3RyYW5zZm9ybWVyJztcbmltcG9ydCB7UGF0aE1hcHBpbmdzfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7Y2xlYW5PdXRkYXRlZFBhY2thZ2VzfSBmcm9tICcuL3dyaXRpbmcvY2xlYW5pbmcvcGFja2FnZV9jbGVhbmVyJztcbmltcG9ydCB7RmlsZVdyaXRlcn0gZnJvbSAnLi93cml0aW5nL2ZpbGVfd3JpdGVyJztcbmltcG9ydCB7SW5QbGFjZUZpbGVXcml0ZXJ9IGZyb20gJy4vd3JpdGluZy9pbl9wbGFjZV9maWxlX3dyaXRlcic7XG5pbXBvcnQge05ld0VudHJ5UG9pbnRGaWxlV3JpdGVyfSBmcm9tICcuL3dyaXRpbmcvbmV3X2VudHJ5X3BvaW50X2ZpbGVfd3JpdGVyJztcbmltcG9ydCB7RGlyZWN0UGFja2FnZUpzb25VcGRhdGVyLCBQYWNrYWdlSnNvblVwZGF0ZXJ9IGZyb20gJy4vd3JpdGluZy9wYWNrYWdlX2pzb25fdXBkYXRlcic7XG5cbi8qKlxuICogVGhlIG9wdGlvbnMgdG8gY29uZmlndXJlIHRoZSBuZ2NjIGNvbXBpbGVyIGZvciBzeW5jaHJvbm91cyBleGVjdXRpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3luY05nY2NPcHRpb25zIHtcbiAgLyoqIFRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBgbm9kZV9tb2R1bGVzYCBmb2xkZXIgdGhhdCBjb250YWlucyB0aGUgcGFja2FnZXMgdG8gcHJvY2Vzcy4gKi9cbiAgYmFzZVBhdGg6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIHBhdGggdG8gdGhlIHByaW1hcnkgcGFja2FnZSB0byBiZSBwcm9jZXNzZWQuIElmIG5vdCBhYnNvbHV0ZSB0aGVuIGl0IG11c3QgYmUgcmVsYXRpdmUgdG9cbiAgICogYGJhc2VQYXRoYC5cbiAgICpcbiAgICogQWxsIGl0cyBkZXBlbmRlbmNpZXMgd2lsbCBuZWVkIHRvIGJlIHByb2Nlc3NlZCB0b28uXG4gICAqL1xuICB0YXJnZXRFbnRyeVBvaW50UGF0aD86IHN0cmluZztcblxuICAvKipcbiAgICogV2hpY2ggZW50cnktcG9pbnQgcHJvcGVydGllcyBpbiB0aGUgcGFja2FnZS5qc29uIHRvIGNvbnNpZGVyIHdoZW4gcHJvY2Vzc2luZyBhbiBlbnRyeS1wb2ludC5cbiAgICogRWFjaCBwcm9wZXJ0eSBzaG91bGQgaG9sZCBhIHBhdGggdG8gdGhlIHBhcnRpY3VsYXIgYnVuZGxlIGZvcm1hdCBmb3IgdGhlIGVudHJ5LXBvaW50LlxuICAgKiBEZWZhdWx0cyB0byBhbGwgdGhlIHByb3BlcnRpZXMgaW4gdGhlIHBhY2thZ2UuanNvbi5cbiAgICovXG4gIHByb3BlcnRpZXNUb0NvbnNpZGVyPzogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gcHJvY2VzcyBhbGwgZm9ybWF0cyBzcGVjaWZpZWQgYnkgKGBwcm9wZXJ0aWVzVG9Db25zaWRlcmApICBvciB0byBzdG9wIHByb2Nlc3NpbmdcbiAgICogdGhpcyBlbnRyeS1wb2ludCBhdCB0aGUgZmlyc3QgbWF0Y2hpbmcgZm9ybWF0LiBEZWZhdWx0cyB0byBgdHJ1ZWAuXG4gICAqL1xuICBjb21waWxlQWxsRm9ybWF0cz86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gY3JlYXRlIG5ldyBlbnRyeS1wb2ludHMgYnVuZGxlcyByYXRoZXIgdGhhbiBvdmVyd3JpdGluZyB0aGUgb3JpZ2luYWwgZmlsZXMuXG4gICAqL1xuICBjcmVhdGVOZXdFbnRyeVBvaW50Rm9ybWF0cz86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFByb3ZpZGUgYSBsb2dnZXIgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aXRoIGxvZyBtZXNzYWdlcy5cbiAgICovXG4gIGxvZ2dlcj86IExvZ2dlcjtcblxuICAvKipcbiAgICogUGF0aHMgbWFwcGluZyBjb25maWd1cmF0aW9uIChgcGF0aHNgIGFuZCBgYmFzZVVybGApLCBhcyBmb3VuZCBpbiBgdHMuQ29tcGlsZXJPcHRpb25zYC5cbiAgICogVGhlc2UgYXJlIHVzZWQgdG8gcmVzb2x2ZSBwYXRocyB0byBsb2NhbGx5IGJ1aWx0IEFuZ3VsYXIgbGlicmFyaWVzLlxuICAgKi9cbiAgcGF0aE1hcHBpbmdzPzogUGF0aE1hcHBpbmdzO1xuXG4gIC8qKlxuICAgKiBQcm92aWRlIGEgZmlsZS1zeXN0ZW0gc2VydmljZSB0aGF0IHdpbGwgYmUgdXNlZCBieSBuZ2NjIGZvciBhbGwgZmlsZSBpbnRlcmFjdGlvbnMuXG4gICAqL1xuICBmaWxlU3lzdGVtPzogRmlsZVN5c3RlbTtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY29tcGlsYXRpb24gc2hvdWxkIHJ1biBhbmQgcmV0dXJuIGFzeW5jaHJvbm91c2x5LiBBbGxvd2luZyBhc3luY2hyb25vdXMgZXhlY3V0aW9uXG4gICAqIG1heSBzcGVlZCB1cCB0aGUgY29tcGlsYXRpb24gYnkgdXRpbGl6aW5nIG11bHRpcGxlIENQVSBjb3JlcyAoaWYgYXZhaWxhYmxlKS5cbiAgICpcbiAgICogRGVmYXVsdDogYGZhbHNlYCAoaS5lLiBydW4gc3luY2hyb25vdXNseSlcbiAgICovXG4gIGFzeW5jPzogZmFsc2U7XG5cbiAgLyoqXG4gICAqIFJlbmRlciBgJGxvY2FsaXplYCBtZXNzYWdlcyB3aXRoIGxlZ2FjeSBmb3JtYXQgaWRzLlxuICAgKlxuICAgKiBUaGUgZGVmYXVsdCB2YWx1ZSBpcyBgdHJ1ZWAuIE9ubHkgc2V0IHRoaXMgdG8gYGZhbHNlYCBpZiB5b3UgZG8gbm90IHdhbnQgbGVnYWN5IG1lc3NhZ2UgaWRzIHRvXG4gICAqIGJlIHJlbmRlcmVkLiBGb3IgZXhhbXBsZSwgaWYgeW91IGFyZSBub3QgdXNpbmcgbGVnYWN5IG1lc3NhZ2UgaWRzIGluIHlvdXIgdHJhbnNsYXRpb24gZmlsZXNcbiAgICogQU5EIGFyZSBub3QgZG9pbmcgY29tcGlsZS10aW1lIGlubGluaW5nIG9mIHRyYW5zbGF0aW9ucywgaW4gd2hpY2ggY2FzZSB0aGUgZXh0cmEgbWVzc2FnZSBpZHNcbiAgICogd291bGQgYWRkIHVud2FudGVkIHNpemUgdG8gdGhlIGZpbmFsIHNvdXJjZSBidW5kbGUuXG4gICAqXG4gICAqIEl0IGlzIHNhZmUgdG8gbGVhdmUgdGhpcyBzZXQgdG8gdHJ1ZSBpZiB5b3UgYXJlIGRvaW5nIGNvbXBpbGUtdGltZSBpbmxpbmluZyBiZWNhdXNlIHRoZSBleHRyYVxuICAgKiBsZWdhY3kgbWVzc2FnZSBpZHMgd2lsbCBhbGwgYmUgc3RyaXBwZWQgZHVyaW5nIHRyYW5zbGF0aW9uLlxuICAgKi9cbiAgZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogVGhlIG9wdGlvbnMgdG8gY29uZmlndXJlIHRoZSBuZ2NjIGNvbXBpbGVyIGZvciBhc3luY2hyb25vdXMgZXhlY3V0aW9uLlxuICovXG5leHBvcnQgdHlwZSBBc3luY05nY2NPcHRpb25zID0gT21pdDxTeW5jTmdjY09wdGlvbnMsICdhc3luYyc+JiB7YXN5bmM6IHRydWV9O1xuXG4vKipcbiAqIFRoZSBvcHRpb25zIHRvIGNvbmZpZ3VyZSB0aGUgbmdjYyBjb21waWxlci5cbiAqL1xuZXhwb3J0IHR5cGUgTmdjY09wdGlvbnMgPSBBc3luY05nY2NPcHRpb25zIHwgU3luY05nY2NPcHRpb25zO1xuXG4vKipcbiAqIFRoaXMgaXMgdGhlIG1haW4gZW50cnktcG9pbnQgaW50byBuZ2NjIChhTkd1bGFyIENvbXBhdGliaWxpdHkgQ29tcGlsZXIpLlxuICpcbiAqIFlvdSBjYW4gY2FsbCB0aGlzIGZ1bmN0aW9uIHRvIHByb2Nlc3Mgb25lIG9yIG1vcmUgbnBtIHBhY2thZ2VzLCB0byBlbnN1cmVcbiAqIHRoYXQgdGhleSBhcmUgY29tcGF0aWJsZSB3aXRoIHRoZSBpdnkgY29tcGlsZXIgKG5ndHNjKS5cbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBUaGUgb3B0aW9ucyB0ZWxsaW5nIG5nY2Mgd2hhdCB0byBjb21waWxlIGFuZCBob3cuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWluTmdjYyhvcHRpb25zOiBBc3luY05nY2NPcHRpb25zKTogUHJvbWlzZTx2b2lkPjtcbmV4cG9ydCBmdW5jdGlvbiBtYWluTmdjYyhvcHRpb25zOiBTeW5jTmdjY09wdGlvbnMpOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIG1haW5OZ2NjKFxuICAgIHtiYXNlUGF0aCwgdGFyZ2V0RW50cnlQb2ludFBhdGgsIHByb3BlcnRpZXNUb0NvbnNpZGVyID0gU1VQUE9SVEVEX0ZPUk1BVF9QUk9QRVJUSUVTLFxuICAgICBjb21waWxlQWxsRm9ybWF0cyA9IHRydWUsIGNyZWF0ZU5ld0VudHJ5UG9pbnRGb3JtYXRzID0gZmFsc2UsXG4gICAgIGxvZ2dlciA9IG5ldyBDb25zb2xlTG9nZ2VyKExvZ0xldmVsLmluZm8pLCBwYXRoTWFwcGluZ3MsIGFzeW5jID0gZmFsc2UsXG4gICAgIGVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQgPSB0cnVlfTogTmdjY09wdGlvbnMpOiB2b2lkfFByb21pc2U8dm9pZD4ge1xuICAvLyBFeGVjdXRlIGluIHBhcmFsbGVsLCBpZiBhc3luYyBleGVjdXRpb24gaXMgYWNjZXB0YWJsZSBhbmQgdGhlcmUgYXJlIG1vcmUgdGhhbiAxIENQVSBjb3Jlcy5cbiAgY29uc3QgaW5QYXJhbGxlbCA9IGFzeW5jICYmIChvcy5jcHVzKCkubGVuZ3RoID4gMSk7XG5cbiAgLy8gSW5zdGFudGlhdGUgY29tbW9uIHV0aWxpdGllcyB0aGF0IGFyZSBhbHdheXMgdXNlZC5cbiAgLy8gTk9URTogQXZvaWQgZWFnZXJseSBpbnN0YW50aWF0aW5nIGFueXRoaW5nIHRoYXQgbWlnaHQgbm90IGJlIHVzZWQgd2hlbiBydW5uaW5nIHN5bmMvYXN5bmMgb3IgaW5cbiAgLy8gICAgICAgbWFzdGVyL3dvcmtlciBwcm9jZXNzLlxuICBjb25zdCBmaWxlU3lzdGVtID0gZ2V0RmlsZVN5c3RlbSgpO1xuICBjb25zdCBhYnNCYXNlUGF0aCA9IGFic29sdXRlRnJvbShiYXNlUGF0aCk7XG4gIGNvbnN0IGNvbmZpZyA9IG5ldyBOZ2NjQ29uZmlndXJhdGlvbihmaWxlU3lzdGVtLCBkaXJuYW1lKGFic0Jhc2VQYXRoKSk7XG4gIGNvbnN0IGRlcGVuZGVuY3lSZXNvbHZlciA9IGdldERlcGVuZGVuY3lSZXNvbHZlcihmaWxlU3lzdGVtLCBsb2dnZXIsIGNvbmZpZywgcGF0aE1hcHBpbmdzKTtcblxuICAvLyBCYWlsIG91dCBlYXJseSBpZiB0aGUgd29yayBpcyBhbHJlYWR5IGRvbmUuXG4gIGNvbnN0IHN1cHBvcnRlZFByb3BlcnRpZXNUb0NvbnNpZGVyID0gZW5zdXJlU3VwcG9ydGVkUHJvcGVydGllcyhwcm9wZXJ0aWVzVG9Db25zaWRlcik7XG4gIGNvbnN0IGFic29sdXRlVGFyZ2V0RW50cnlQb2ludFBhdGggPVxuICAgICAgdGFyZ2V0RW50cnlQb2ludFBhdGggIT09IHVuZGVmaW5lZCA/IHJlc29sdmUoYmFzZVBhdGgsIHRhcmdldEVudHJ5UG9pbnRQYXRoKSA6IG51bGw7XG4gIGNvbnN0IGZpbmRlciA9IGdldEVudHJ5UG9pbnRGaW5kZXIoXG4gICAgICBmaWxlU3lzdGVtLCBsb2dnZXIsIGRlcGVuZGVuY3lSZXNvbHZlciwgY29uZmlnLCBhYnNCYXNlUGF0aCwgYWJzb2x1dGVUYXJnZXRFbnRyeVBvaW50UGF0aCxcbiAgICAgIHBhdGhNYXBwaW5ncyk7XG4gIGlmIChmaW5kZXIgaW5zdGFuY2VvZiBUYXJnZXRlZEVudHJ5UG9pbnRGaW5kZXIgJiZcbiAgICAgICFmaW5kZXIudGFyZ2V0TmVlZHNQcm9jZXNzaW5nT3JDbGVhbmluZyhzdXBwb3J0ZWRQcm9wZXJ0aWVzVG9Db25zaWRlciwgY29tcGlsZUFsbEZvcm1hdHMpKSB7XG4gICAgbG9nZ2VyLmRlYnVnKCdUaGUgdGFyZ2V0IGVudHJ5LXBvaW50IGhhcyBhbHJlYWR5IGJlZW4gcHJvY2Vzc2VkJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gTk9URTogVG8gYXZvaWQgZmlsZSBjb3JydXB0aW9uLCBlbnN1cmUgdGhhdCBlYWNoIGBuZ2NjYCBpbnZvY2F0aW9uIG9ubHkgY3JlYXRlcyBfb25lXyBpbnN0YW5jZVxuICAvLyAgICAgICBvZiBgUGFja2FnZUpzb25VcGRhdGVyYCB0aGF0IGFjdHVhbGx5IHdyaXRlcyB0byBkaXNrIChhY3Jvc3MgYWxsIHByb2Nlc3NlcykuXG4gIC8vICAgICAgIFRoaXMgaXMgaGFyZCB0byBlbmZvcmNlIGF1dG9tYXRpY2FsbHksIHdoZW4gcnVubmluZyBvbiBtdWx0aXBsZSBwcm9jZXNzZXMsIHNvIG5lZWRzIHRvIGJlXG4gIC8vICAgICAgIGVuZm9yY2VkIG1hbnVhbGx5LlxuICBjb25zdCBwa2dKc29uVXBkYXRlciA9IGdldFBhY2thZ2VKc29uVXBkYXRlcihpblBhcmFsbGVsLCBmaWxlU3lzdGVtKTtcblxuICAvLyBUaGUgZnVuY3Rpb24gZm9yIHBlcmZvcm1pbmcgdGhlIGFuYWx5c2lzLlxuICBjb25zdCBhbmFseXplRW50cnlQb2ludHM6IEFuYWx5emVFbnRyeVBvaW50c0ZuID0gKCkgPT4ge1xuICAgIGxvZ2dlci5kZWJ1ZygnQW5hbHl6aW5nIGVudHJ5LXBvaW50cy4uLicpO1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG5cbiAgICBsZXQgZW50cnlQb2ludEluZm8gPSBmaW5kZXIuZmluZEVudHJ5UG9pbnRzKCk7XG4gICAgY29uc3QgY2xlYW5lZCA9IGNsZWFuT3V0ZGF0ZWRQYWNrYWdlcyhmaWxlU3lzdGVtLCBlbnRyeVBvaW50SW5mby5lbnRyeVBvaW50cyk7XG4gICAgaWYgKGNsZWFuZWQpIHtcbiAgICAgIC8vIElmIHdlIGhhZCB0byBjbGVhbiB1cCBvbmUgb3IgbW9yZSBwYWNrYWdlcyB0aGVuIHdlIG11c3QgcmVhZCBpbiB0aGUgZW50cnktcG9pbnRzIGFnYWluLlxuICAgICAgZW50cnlQb2ludEluZm8gPSBmaW5kZXIuZmluZEVudHJ5UG9pbnRzKCk7XG4gICAgfVxuXG4gICAgY29uc3Qge2VudHJ5UG9pbnRzLCBpbnZhbGlkRW50cnlQb2ludHMsIGdyYXBofSA9IGVudHJ5UG9pbnRJbmZvO1xuICAgIGxvZ0ludmFsaWRFbnRyeVBvaW50cyhsb2dnZXIsIGludmFsaWRFbnRyeVBvaW50cyk7XG5cbiAgICBjb25zdCB1bnByb2Nlc3NhYmxlRW50cnlQb2ludFBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuICAgIC8vIFRoZSB0YXNrcyBhcmUgcGFydGlhbGx5IG9yZGVyZWQgYnkgdmlydHVlIG9mIHRoZSBlbnRyeS1wb2ludHMgYmVpbmcgcGFydGlhbGx5IG9yZGVyZWQgdG9vLlxuICAgIGNvbnN0IHRhc2tzOiBQYXJ0aWFsbHlPcmRlcmVkVGFza3MgPSBbXSBhcyBhbnk7XG5cbiAgICBmb3IgKGNvbnN0IGVudHJ5UG9pbnQgb2YgZW50cnlQb2ludHMpIHtcbiAgICAgIGNvbnN0IHBhY2thZ2VKc29uID0gZW50cnlQb2ludC5wYWNrYWdlSnNvbjtcbiAgICAgIGNvbnN0IGhhc1Byb2Nlc3NlZFR5cGluZ3MgPSBoYXNCZWVuUHJvY2Vzc2VkKHBhY2thZ2VKc29uLCAndHlwaW5ncycpO1xuICAgICAgY29uc3Qge3Byb3BlcnRpZXNUb1Byb2Nlc3MsIGVxdWl2YWxlbnRQcm9wZXJ0aWVzTWFwfSA9XG4gICAgICAgICAgZ2V0UHJvcGVydGllc1RvUHJvY2VzcyhwYWNrYWdlSnNvbiwgc3VwcG9ydGVkUHJvcGVydGllc1RvQ29uc2lkZXIsIGNvbXBpbGVBbGxGb3JtYXRzKTtcbiAgICAgIGxldCBwcm9jZXNzRHRzID0gIWhhc1Byb2Nlc3NlZFR5cGluZ3M7XG5cbiAgICAgIGlmIChwcm9wZXJ0aWVzVG9Qcm9jZXNzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAvLyBUaGlzIGVudHJ5LXBvaW50IGlzIHVucHJvY2Vzc2FibGUgKGkuZS4gdGhlcmUgaXMgbm8gZm9ybWF0IHByb3BlcnR5IHRoYXQgaXMgb2YgaW50ZXJlc3RcbiAgICAgICAgLy8gYW5kIGNhbiBiZSBwcm9jZXNzZWQpLiBUaGlzIHdpbGwgcmVzdWx0IGluIGFuIGVycm9yLCBidXQgY29udGludWUgbG9vcGluZyBvdmVyXG4gICAgICAgIC8vIGVudHJ5LXBvaW50cyBpbiBvcmRlciB0byBjb2xsZWN0IGFsbCB1bnByb2Nlc3NhYmxlIG9uZXMgYW5kIGRpc3BsYXkgYSBtb3JlIGluZm9ybWF0aXZlXG4gICAgICAgIC8vIGVycm9yLlxuICAgICAgICB1bnByb2Nlc3NhYmxlRW50cnlQb2ludFBhdGhzLnB1c2goZW50cnlQb2ludC5wYXRoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgZm9ybWF0UHJvcGVydHkgb2YgcHJvcGVydGllc1RvUHJvY2Vzcykge1xuICAgICAgICBpZiAoaGFzQmVlblByb2Nlc3NlZChlbnRyeVBvaW50LnBhY2thZ2VKc29uLCBmb3JtYXRQcm9wZXJ0eSkpIHtcbiAgICAgICAgICAvLyBUaGUgZm9ybWF0LXBhdGggd2hpY2ggdGhlIHByb3BlcnR5IG1hcHMgdG8gaXMgYWxyZWFkeSBwcm9jZXNzZWQgLSBub3RoaW5nIHRvIGRvLlxuICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgU2tpcHBpbmcgJHtlbnRyeVBvaW50Lm5hbWV9IDogJHtmb3JtYXRQcm9wZXJ0eX0gKGFscmVhZHkgY29tcGlsZWQpLmApO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZm9ybWF0UHJvcGVydGllc1RvTWFya0FzUHJvY2Vzc2VkID0gZXF1aXZhbGVudFByb3BlcnRpZXNNYXAuZ2V0KGZvcm1hdFByb3BlcnR5KSAhO1xuICAgICAgICB0YXNrcy5wdXNoKHtlbnRyeVBvaW50LCBmb3JtYXRQcm9wZXJ0eSwgZm9ybWF0UHJvcGVydGllc1RvTWFya0FzUHJvY2Vzc2VkLCBwcm9jZXNzRHRzfSk7XG5cbiAgICAgICAgLy8gT25seSBwcm9jZXNzIHR5cGluZ3MgZm9yIHRoZSBmaXJzdCBwcm9wZXJ0eSAoaWYgbm90IGFscmVhZHkgcHJvY2Vzc2VkKS5cbiAgICAgICAgcHJvY2Vzc0R0cyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBlbnRyeS1wb2ludHMgZm9yIHdoaWNoIHdlIGNvdWxkIG5vdCBwcm9jZXNzIGFueSBmb3JtYXQgYXQgYWxsLlxuICAgIGlmICh1bnByb2Nlc3NhYmxlRW50cnlQb2ludFBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnVW5hYmxlIHRvIHByb2Nlc3MgYW55IGZvcm1hdHMgZm9yIHRoZSBmb2xsb3dpbmcgZW50cnktcG9pbnRzICh0cmllZCAnICtcbiAgICAgICAgICBgJHtwcm9wZXJ0aWVzVG9Db25zaWRlci5qb2luKCcsICcpfSk6IGAgK1xuICAgICAgICAgIHVucHJvY2Vzc2FibGVFbnRyeVBvaW50UGF0aHMubWFwKHBhdGggPT4gYFxcbiAgLSAke3BhdGh9YCkuam9pbignJykpO1xuICAgIH1cblxuICAgIGNvbnN0IGR1cmF0aW9uID0gTWF0aC5yb3VuZCgoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSkgLyAxMDAwKTtcbiAgICBsb2dnZXIuZGVidWcoXG4gICAgICAgIGBBbmFseXplZCAke2VudHJ5UG9pbnRzLmxlbmd0aH0gZW50cnktcG9pbnRzIGluICR7ZHVyYXRpb259cy4gYCArXG4gICAgICAgIGAoVG90YWwgdGFza3M6ICR7dGFza3MubGVuZ3RofSlgKTtcblxuICAgIHJldHVybiBnZXRUYXNrUXVldWUoaW5QYXJhbGxlbCwgdGFza3MsIGdyYXBoKTtcbiAgfTtcblxuICAvLyBUaGUgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIHRoZSBgY29tcGlsZSgpYCBmdW5jdGlvbi5cbiAgY29uc3QgY3JlYXRlQ29tcGlsZUZuOiBDcmVhdGVDb21waWxlRm4gPSBvblRhc2tDb21wbGV0ZWQgPT4ge1xuICAgIGNvbnN0IGZpbGVXcml0ZXIgPSBnZXRGaWxlV3JpdGVyKGZpbGVTeXN0ZW0sIHBrZ0pzb25VcGRhdGVyLCBjcmVhdGVOZXdFbnRyeVBvaW50Rm9ybWF0cyk7XG4gICAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtZXIoZmlsZVN5c3RlbSwgbG9nZ2VyKTtcblxuICAgIHJldHVybiAodGFzazogVGFzaykgPT4ge1xuICAgICAgY29uc3Qge2VudHJ5UG9pbnQsIGZvcm1hdFByb3BlcnR5LCBmb3JtYXRQcm9wZXJ0aWVzVG9NYXJrQXNQcm9jZXNzZWQsIHByb2Nlc3NEdHN9ID0gdGFzaztcblxuICAgICAgY29uc3QgaXNDb3JlID0gZW50cnlQb2ludC5uYW1lID09PSAnQGFuZ3VsYXIvY29yZSc7ICAvLyBBcmUgd2UgY29tcGlsaW5nIHRoZSBBbmd1bGFyIGNvcmU/XG4gICAgICBjb25zdCBwYWNrYWdlSnNvbiA9IGVudHJ5UG9pbnQucGFja2FnZUpzb247XG4gICAgICBjb25zdCBmb3JtYXRQYXRoID0gcGFja2FnZUpzb25bZm9ybWF0UHJvcGVydHldO1xuICAgICAgY29uc3QgZm9ybWF0ID0gZ2V0RW50cnlQb2ludEZvcm1hdChmaWxlU3lzdGVtLCBlbnRyeVBvaW50LCBmb3JtYXRQcm9wZXJ0eSk7XG5cbiAgICAgIC8vIEFsbCBwcm9wZXJ0aWVzIGxpc3RlZCBpbiBgcHJvcGVydGllc1RvUHJvY2Vzc2AgYXJlIGd1YXJhbnRlZWQgdG8gcG9pbnQgdG8gYSBmb3JtYXQtcGF0aFxuICAgICAgLy8gKGkuZS4gdGhleSBhcmUgZGVmaW5lZCBpbiBgZW50cnlQb2ludC5wYWNrYWdlSnNvbmApLiBGdXJ0aGVybW9yZSwgdGhleSBhcmUgYWxzbyBndWFyYW50ZWVkXG4gICAgICAvLyB0byBiZSBhbW9uZyBgU1VQUE9SVEVEX0ZPUk1BVF9QUk9QRVJUSUVTYC5cbiAgICAgIC8vIEJhc2VkIG9uIHRoZSBhYm92ZSwgYGZvcm1hdFBhdGhgIHNob3VsZCBhbHdheXMgYmUgZGVmaW5lZCBhbmQgYGdldEVudHJ5UG9pbnRGb3JtYXQoKWBcbiAgICAgIC8vIHNob3VsZCBhbHdheXMgcmV0dXJuIGEgZm9ybWF0IGhlcmUgKGFuZCBub3QgYHVuZGVmaW5lZGApLlxuICAgICAgaWYgKCFmb3JtYXRQYXRoIHx8ICFmb3JtYXQpIHtcbiAgICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuLlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgSW52YXJpYW50IHZpb2xhdGVkOiBObyBmb3JtYXQtcGF0aCBvciBmb3JtYXQgZm9yICR7ZW50cnlQb2ludC5wYXRofSA6IGAgK1xuICAgICAgICAgICAgYCR7Zm9ybWF0UHJvcGVydHl9IChmb3JtYXRQYXRoOiAke2Zvcm1hdFBhdGh9IHwgZm9ybWF0OiAke2Zvcm1hdH0pYCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGJ1bmRsZSA9IG1ha2VFbnRyeVBvaW50QnVuZGxlKFxuICAgICAgICAgIGZpbGVTeXN0ZW0sIGVudHJ5UG9pbnQsIGZvcm1hdFBhdGgsIGlzQ29yZSwgZm9ybWF0LCBwcm9jZXNzRHRzLCBwYXRoTWFwcGluZ3MsIHRydWUsXG4gICAgICAgICAgZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdCk7XG5cbiAgICAgIGxvZ2dlci5pbmZvKGBDb21waWxpbmcgJHtlbnRyeVBvaW50Lm5hbWV9IDogJHtmb3JtYXRQcm9wZXJ0eX0gYXMgJHtmb3JtYXR9YCk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IHRyYW5zZm9ybWVyLnRyYW5zZm9ybShidW5kbGUpO1xuICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgIGlmIChyZXN1bHQuZGlhZ25vc3RpY3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxvZ2dlci53YXJuKHJlcGxhY2VUc1dpdGhOZ0luRXJyb3JzKFxuICAgICAgICAgICAgICB0cy5mb3JtYXREaWFnbm9zdGljc1dpdGhDb2xvckFuZENvbnRleHQocmVzdWx0LmRpYWdub3N0aWNzLCBidW5kbGUuc3JjLmhvc3QpKSk7XG4gICAgICAgIH1cbiAgICAgICAgZmlsZVdyaXRlci53cml0ZUJ1bmRsZShidW5kbGUsIHJlc3VsdC50cmFuc2Zvcm1lZEZpbGVzLCBmb3JtYXRQcm9wZXJ0aWVzVG9NYXJrQXNQcm9jZXNzZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXJyb3JzID0gcmVwbGFjZVRzV2l0aE5nSW5FcnJvcnMoXG4gICAgICAgICAgICB0cy5mb3JtYXREaWFnbm9zdGljc1dpdGhDb2xvckFuZENvbnRleHQocmVzdWx0LmRpYWdub3N0aWNzLCBidW5kbGUuc3JjLmhvc3QpKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEZhaWxlZCB0byBjb21waWxlIGVudHJ5LXBvaW50ICR7ZW50cnlQb2ludC5uYW1lfSAoJHtmb3JtYXRQcm9wZXJ0eX0gYXMgJHtmb3JtYXR9KSBkdWUgdG8gY29tcGlsYXRpb24gZXJyb3JzOlxcbiR7ZXJyb3JzfWApO1xuICAgICAgfVxuXG4gICAgICBsb2dnZXIuZGVidWcoYCAgU3VjY2Vzc2Z1bGx5IGNvbXBpbGVkICR7ZW50cnlQb2ludC5uYW1lfSA6ICR7Zm9ybWF0UHJvcGVydHl9YCk7XG5cbiAgICAgIG9uVGFza0NvbXBsZXRlZCh0YXNrLCBUYXNrUHJvY2Vzc2luZ091dGNvbWUuUHJvY2Vzc2VkKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFRoZSBleGVjdXRvciBmb3IgYWN0dWFsbHkgcGxhbm5pbmcgYW5kIGdldHRpbmcgdGhlIHdvcmsgZG9uZS5cbiAgY29uc3QgZXhlY3V0b3IgPSBnZXRFeGVjdXRvcihhc3luYywgaW5QYXJhbGxlbCwgbG9nZ2VyLCBwa2dKc29uVXBkYXRlciwgbmV3IExvY2tGaWxlKGZpbGVTeXN0ZW0pKTtcblxuICByZXR1cm4gZXhlY3V0b3IuZXhlY3V0ZShhbmFseXplRW50cnlQb2ludHMsIGNyZWF0ZUNvbXBpbGVGbik7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVN1cHBvcnRlZFByb3BlcnRpZXMocHJvcGVydGllczogc3RyaW5nW10pOiBFbnRyeVBvaW50SnNvblByb3BlcnR5W10ge1xuICAvLyBTaG9ydC1jaXJjdWl0IHRoZSBjYXNlIHdoZXJlIGBwcm9wZXJ0aWVzYCBoYXMgZmFsbGVuIGJhY2sgdG8gdGhlIGRlZmF1bHQgdmFsdWU6XG4gIC8vIGBTVVBQT1JURURfRk9STUFUX1BST1BFUlRJRVNgXG4gIGlmIChwcm9wZXJ0aWVzID09PSBTVVBQT1JURURfRk9STUFUX1BST1BFUlRJRVMpIHJldHVybiBTVVBQT1JURURfRk9STUFUX1BST1BFUlRJRVM7XG5cbiAgY29uc3Qgc3VwcG9ydGVkUHJvcGVydGllczogRW50cnlQb2ludEpzb25Qcm9wZXJ0eVtdID0gW107XG5cbiAgZm9yIChjb25zdCBwcm9wIG9mIHByb3BlcnRpZXMgYXMgRW50cnlQb2ludEpzb25Qcm9wZXJ0eVtdKSB7XG4gICAgaWYgKFNVUFBPUlRFRF9GT1JNQVRfUFJPUEVSVElFUy5pbmRleE9mKHByb3ApICE9PSAtMSkge1xuICAgICAgc3VwcG9ydGVkUHJvcGVydGllcy5wdXNoKHByb3ApO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzdXBwb3J0ZWRQcm9wZXJ0aWVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYE5vIHN1cHBvcnRlZCBmb3JtYXQgcHJvcGVydHkgdG8gY29uc2lkZXIgYW1vbmcgWyR7cHJvcGVydGllcy5qb2luKCcsICcpfV0uIGAgK1xuICAgICAgICBgU3VwcG9ydGVkIHByb3BlcnRpZXM6ICR7U1VQUE9SVEVEX0ZPUk1BVF9QUk9QRVJUSUVTLmpvaW4oJywgJyl9YCk7XG4gIH1cblxuICByZXR1cm4gc3VwcG9ydGVkUHJvcGVydGllcztcbn1cblxuZnVuY3Rpb24gZ2V0UGFja2FnZUpzb25VcGRhdGVyKGluUGFyYWxsZWw6IGJvb2xlYW4sIGZzOiBGaWxlU3lzdGVtKTogUGFja2FnZUpzb25VcGRhdGVyIHtcbiAgY29uc3QgZGlyZWN0UGtnSnNvblVwZGF0ZXIgPSBuZXcgRGlyZWN0UGFja2FnZUpzb25VcGRhdGVyKGZzKTtcbiAgcmV0dXJuIGluUGFyYWxsZWwgPyBuZXcgQ2x1c3RlclBhY2thZ2VKc29uVXBkYXRlcihkaXJlY3RQa2dKc29uVXBkYXRlcikgOiBkaXJlY3RQa2dKc29uVXBkYXRlcjtcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZVdyaXRlcihcbiAgICBmczogRmlsZVN5c3RlbSwgcGtnSnNvblVwZGF0ZXI6IFBhY2thZ2VKc29uVXBkYXRlcixcbiAgICBjcmVhdGVOZXdFbnRyeVBvaW50Rm9ybWF0czogYm9vbGVhbik6IEZpbGVXcml0ZXIge1xuICByZXR1cm4gY3JlYXRlTmV3RW50cnlQb2ludEZvcm1hdHMgPyBuZXcgTmV3RW50cnlQb2ludEZpbGVXcml0ZXIoZnMsIHBrZ0pzb25VcGRhdGVyKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJblBsYWNlRmlsZVdyaXRlcihmcyk7XG59XG5cbmZ1bmN0aW9uIGdldFRhc2tRdWV1ZShcbiAgICBpblBhcmFsbGVsOiBib29sZWFuLCB0YXNrczogUGFydGlhbGx5T3JkZXJlZFRhc2tzLCBncmFwaDogRGVwR3JhcGg8RW50cnlQb2ludD4pOiBUYXNrUXVldWUge1xuICByZXR1cm4gaW5QYXJhbGxlbCA/IG5ldyBQYXJhbGxlbFRhc2tRdWV1ZSh0YXNrcywgZ3JhcGgpIDogbmV3IFNlcmlhbFRhc2tRdWV1ZSh0YXNrcyk7XG59XG5cbmZ1bmN0aW9uIGdldEV4ZWN1dG9yKFxuICAgIGFzeW5jOiBib29sZWFuLCBpblBhcmFsbGVsOiBib29sZWFuLCBsb2dnZXI6IExvZ2dlciwgcGtnSnNvblVwZGF0ZXI6IFBhY2thZ2VKc29uVXBkYXRlcixcbiAgICBsb2NrRmlsZTogTG9ja0ZpbGUpOiBFeGVjdXRvciB7XG4gIGlmIChpblBhcmFsbGVsKSB7XG4gICAgLy8gRXhlY3V0ZSBpbiBwYXJhbGxlbCAod2hpY2ggaW1wbGllcyBhc3luYykuXG4gICAgLy8gVXNlIHVwIHRvIDggQ1BVIGNvcmVzIGZvciB3b3JrZXJzLCBhbHdheXMgcmVzZXJ2aW5nIG9uZSBmb3IgbWFzdGVyLlxuICAgIGNvbnN0IHdvcmtlckNvdW50ID0gTWF0aC5taW4oOCwgb3MuY3B1cygpLmxlbmd0aCAtIDEpO1xuICAgIHJldHVybiBuZXcgQ2x1c3RlckV4ZWN1dG9yKHdvcmtlckNvdW50LCBsb2dnZXIsIHBrZ0pzb25VcGRhdGVyLCBsb2NrRmlsZSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gRXhlY3V0ZSBzZXJpYWxseSwgb24gYSBzaW5nbGUgdGhyZWFkIChlaXRoZXIgc3luYyBvciBhc3luYykuXG4gICAgcmV0dXJuIGFzeW5jID8gbmV3IEFzeW5jU2luZ2xlUHJvY2Vzc0V4ZWN1dG9yKGxvZ2dlciwgcGtnSnNvblVwZGF0ZXIsIGxvY2tGaWxlKSA6XG4gICAgICAgICAgICAgICAgICAgbmV3IFNpbmdsZVByb2Nlc3NFeGVjdXRvcihsb2dnZXIsIHBrZ0pzb25VcGRhdGVyLCBsb2NrRmlsZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVwZW5kZW5jeVJlc29sdmVyKFxuICAgIGZpbGVTeXN0ZW06IEZpbGVTeXN0ZW0sIGxvZ2dlcjogTG9nZ2VyLCBjb25maWc6IE5nY2NDb25maWd1cmF0aW9uLFxuICAgIHBhdGhNYXBwaW5nczogUGF0aE1hcHBpbmdzIHwgdW5kZWZpbmVkKTogRGVwZW5kZW5jeVJlc29sdmVyIHtcbiAgY29uc3QgbW9kdWxlUmVzb2x2ZXIgPSBuZXcgTW9kdWxlUmVzb2x2ZXIoZmlsZVN5c3RlbSwgcGF0aE1hcHBpbmdzKTtcbiAgY29uc3QgZXNtRGVwZW5kZW5jeUhvc3QgPSBuZXcgRXNtRGVwZW5kZW5jeUhvc3QoZmlsZVN5c3RlbSwgbW9kdWxlUmVzb2x2ZXIpO1xuICBjb25zdCB1bWREZXBlbmRlbmN5SG9zdCA9IG5ldyBVbWREZXBlbmRlbmN5SG9zdChmaWxlU3lzdGVtLCBtb2R1bGVSZXNvbHZlcik7XG4gIGNvbnN0IGNvbW1vbkpzRGVwZW5kZW5jeUhvc3QgPSBuZXcgQ29tbW9uSnNEZXBlbmRlbmN5SG9zdChmaWxlU3lzdGVtLCBtb2R1bGVSZXNvbHZlcik7XG4gIGNvbnN0IGR0c0RlcGVuZGVuY3lIb3N0ID0gbmV3IER0c0RlcGVuZGVuY3lIb3N0KGZpbGVTeXN0ZW0sIHBhdGhNYXBwaW5ncyk7XG4gIHJldHVybiBuZXcgRGVwZW5kZW5jeVJlc29sdmVyKFxuICAgICAgZmlsZVN5c3RlbSwgbG9nZ2VyLCBjb25maWcsIHtcbiAgICAgICAgZXNtNTogZXNtRGVwZW5kZW5jeUhvc3QsXG4gICAgICAgIGVzbTIwMTU6IGVzbURlcGVuZGVuY3lIb3N0LFxuICAgICAgICB1bWQ6IHVtZERlcGVuZGVuY3lIb3N0LFxuICAgICAgICBjb21tb25qczogY29tbW9uSnNEZXBlbmRlbmN5SG9zdFxuICAgICAgfSxcbiAgICAgIGR0c0RlcGVuZGVuY3lIb3N0KTtcbn1cblxuZnVuY3Rpb24gZ2V0RW50cnlQb2ludEZpbmRlcihcbiAgICBmczogRmlsZVN5c3RlbSwgbG9nZ2VyOiBMb2dnZXIsIHJlc29sdmVyOiBEZXBlbmRlbmN5UmVzb2x2ZXIsIGNvbmZpZzogTmdjY0NvbmZpZ3VyYXRpb24sXG4gICAgYmFzZVBhdGg6IEFic29sdXRlRnNQYXRoLCBhYnNvbHV0ZVRhcmdldEVudHJ5UG9pbnRQYXRoOiBBYnNvbHV0ZUZzUGF0aCB8IG51bGwsXG4gICAgcGF0aE1hcHBpbmdzOiBQYXRoTWFwcGluZ3MgfCB1bmRlZmluZWQpOiBFbnRyeVBvaW50RmluZGVyIHtcbiAgaWYgKGFic29sdXRlVGFyZ2V0RW50cnlQb2ludFBhdGggIT09IG51bGwpIHtcbiAgICByZXR1cm4gbmV3IFRhcmdldGVkRW50cnlQb2ludEZpbmRlcihcbiAgICAgICAgZnMsIGNvbmZpZywgbG9nZ2VyLCByZXNvbHZlciwgYmFzZVBhdGgsIGFic29sdXRlVGFyZ2V0RW50cnlQb2ludFBhdGgsIHBhdGhNYXBwaW5ncyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBEaXJlY3RvcnlXYWxrZXJFbnRyeVBvaW50RmluZGVyKFxuICAgICAgICBmcywgY29uZmlnLCBsb2dnZXIsIHJlc29sdmVyLCBiYXNlUGF0aCwgcGF0aE1hcHBpbmdzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBsb2dJbnZhbGlkRW50cnlQb2ludHMobG9nZ2VyOiBMb2dnZXIsIGludmFsaWRFbnRyeVBvaW50czogSW52YWxpZEVudHJ5UG9pbnRbXSk6IHZvaWQge1xuICBpbnZhbGlkRW50cnlQb2ludHMuZm9yRWFjaChpbnZhbGlkRW50cnlQb2ludCA9PiB7XG4gICAgbG9nZ2VyLmRlYnVnKFxuICAgICAgICBgSW52YWxpZCBlbnRyeS1wb2ludCAke2ludmFsaWRFbnRyeVBvaW50LmVudHJ5UG9pbnQucGF0aH0uYCxcbiAgICAgICAgYEl0IGlzIG1pc3NpbmcgcmVxdWlyZWQgZGVwZW5kZW5jaWVzOlxcbmAgK1xuICAgICAgICAgICAgaW52YWxpZEVudHJ5UG9pbnQubWlzc2luZ0RlcGVuZGVuY2llcy5tYXAoZGVwID0+IGAgLSAke2RlcH1gKS5qb2luKCdcXG4nKSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gY29tcHV0ZXMgYW5kIHJldHVybnMgdGhlIGZvbGxvd2luZzpcbiAqIC0gYHByb3BlcnRpZXNUb1Byb2Nlc3NgOiBBbiAob3JkZXJlZCkgbGlzdCBvZiBwcm9wZXJ0aWVzIHRoYXQgZXhpc3QgYW5kIG5lZWQgdG8gYmUgcHJvY2Vzc2VkLFxuICogICBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgYHByb3BlcnRpZXNUb0NvbnNpZGVyYCwgdGhlIHByb3BlcnRpZXMgaW4gYHBhY2thZ2UuanNvbmAgYW5kIHRoZWlyXG4gKiAgIGNvcnJlc3BvbmRpbmcgZm9ybWF0LXBhdGhzLiBOT1RFOiBPbmx5IG9uZSBwcm9wZXJ0eSBwZXIgZm9ybWF0LXBhdGggbmVlZHMgdG8gYmUgcHJvY2Vzc2VkLlxuICogLSBgZXF1aXZhbGVudFByb3BlcnRpZXNNYXBgOiBBIG1hcHBpbmcgZnJvbSBlYWNoIHByb3BlcnR5IGluIGBwcm9wZXJ0aWVzVG9Qcm9jZXNzYCB0byB0aGUgbGlzdCBvZlxuICogICBvdGhlciBmb3JtYXQgcHJvcGVydGllcyBpbiBgcGFja2FnZS5qc29uYCB0aGF0IG5lZWQgdG8gYmUgbWFya2VkIGFzIHByb2Nlc3NlZCBhcyBzb29uIGFzIHRoZVxuICogICBmb3JtZXIgaGFzIGJlZW4gcHJvY2Vzc2VkLlxuICovXG5mdW5jdGlvbiBnZXRQcm9wZXJ0aWVzVG9Qcm9jZXNzKFxuICAgIHBhY2thZ2VKc29uOiBFbnRyeVBvaW50UGFja2FnZUpzb24sIHByb3BlcnRpZXNUb0NvbnNpZGVyOiBFbnRyeVBvaW50SnNvblByb3BlcnR5W10sXG4gICAgY29tcGlsZUFsbEZvcm1hdHM6IGJvb2xlYW4pOiB7XG4gIHByb3BlcnRpZXNUb1Byb2Nlc3M6IEVudHJ5UG9pbnRKc29uUHJvcGVydHlbXTtcbiAgZXF1aXZhbGVudFByb3BlcnRpZXNNYXA6IE1hcDxFbnRyeVBvaW50SnNvblByb3BlcnR5LCBFbnRyeVBvaW50SnNvblByb3BlcnR5W10+O1xufSB7XG4gIGNvbnN0IGZvcm1hdFBhdGhzVG9Db25zaWRlciA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIGNvbnN0IHByb3BlcnRpZXNUb1Byb2Nlc3M6IEVudHJ5UG9pbnRKc29uUHJvcGVydHlbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHByb3Agb2YgcHJvcGVydGllc1RvQ29uc2lkZXIpIHtcbiAgICBjb25zdCBmb3JtYXRQYXRoID0gcGFja2FnZUpzb25bcHJvcF07XG5cbiAgICAvLyBJZ25vcmUgcHJvcGVydGllcyB0aGF0IGFyZSBub3QgZGVmaW5lZCBpbiBgcGFja2FnZS5qc29uYC5cbiAgICBpZiAodHlwZW9mIGZvcm1hdFBhdGggIT09ICdzdHJpbmcnKSBjb250aW51ZTtcblxuICAgIC8vIElnbm9yZSBwcm9wZXJ0aWVzIHRoYXQgbWFwIHRvIHRoZSBzYW1lIGZvcm1hdC1wYXRoIGFzIGEgcHJlY2VkaW5nIHByb3BlcnR5LlxuICAgIGlmIChmb3JtYXRQYXRoc1RvQ29uc2lkZXIuaGFzKGZvcm1hdFBhdGgpKSBjb250aW51ZTtcblxuICAgIC8vIFByb2Nlc3MgdGhpcyBwcm9wZXJ0eSwgYmVjYXVzZSBpdCBpcyB0aGUgZmlyc3Qgb25lIHRvIG1hcCB0byB0aGlzIGZvcm1hdC1wYXRoLlxuICAgIGZvcm1hdFBhdGhzVG9Db25zaWRlci5hZGQoZm9ybWF0UGF0aCk7XG4gICAgcHJvcGVydGllc1RvUHJvY2Vzcy5wdXNoKHByb3ApO1xuXG4gICAgLy8gSWYgd2Ugb25seSBuZWVkIG9uZSBmb3JtYXQgcHJvY2Vzc2VkLCB0aGVyZSBpcyBubyBuZWVkIHRvIHByb2Nlc3MgYW55IG1vcmUgcHJvcGVydGllcy5cbiAgICBpZiAoIWNvbXBpbGVBbGxGb3JtYXRzKSBicmVhaztcbiAgfVxuXG4gIGNvbnN0IGZvcm1hdFBhdGhUb1Byb3BlcnRpZXM6IHtbZm9ybWF0UGF0aDogc3RyaW5nXTogRW50cnlQb2ludEpzb25Qcm9wZXJ0eVtdfSA9IHt9O1xuICBmb3IgKGNvbnN0IHByb3Agb2YgU1VQUE9SVEVEX0ZPUk1BVF9QUk9QRVJUSUVTKSB7XG4gICAgY29uc3QgZm9ybWF0UGF0aCA9IHBhY2thZ2VKc29uW3Byb3BdO1xuXG4gICAgLy8gSWdub3JlIHByb3BlcnRpZXMgdGhhdCBhcmUgbm90IGRlZmluZWQgaW4gYHBhY2thZ2UuanNvbmAuXG4gICAgaWYgKHR5cGVvZiBmb3JtYXRQYXRoICE9PSAnc3RyaW5nJykgY29udGludWU7XG5cbiAgICAvLyBJZ25vcmUgcHJvcGVydGllcyB0aGF0IGRvIG5vdCBtYXAgdG8gYSBmb3JtYXQtcGF0aCB0aGF0IHdpbGwgYmUgY29uc2lkZXJlZC5cbiAgICBpZiAoIWZvcm1hdFBhdGhzVG9Db25zaWRlci5oYXMoZm9ybWF0UGF0aCkpIGNvbnRpbnVlO1xuXG4gICAgLy8gQWRkIHRoaXMgcHJvcGVydHkgdG8gdGhlIG1hcC5cbiAgICBjb25zdCBsaXN0ID0gZm9ybWF0UGF0aFRvUHJvcGVydGllc1tmb3JtYXRQYXRoXSB8fCAoZm9ybWF0UGF0aFRvUHJvcGVydGllc1tmb3JtYXRQYXRoXSA9IFtdKTtcbiAgICBsaXN0LnB1c2gocHJvcCk7XG4gIH1cblxuICBjb25zdCBlcXVpdmFsZW50UHJvcGVydGllc01hcCA9IG5ldyBNYXA8RW50cnlQb2ludEpzb25Qcm9wZXJ0eSwgRW50cnlQb2ludEpzb25Qcm9wZXJ0eVtdPigpO1xuICBmb3IgKGNvbnN0IHByb3Agb2YgcHJvcGVydGllc1RvQ29uc2lkZXIpIHtcbiAgICBjb25zdCBmb3JtYXRQYXRoID0gcGFja2FnZUpzb25bcHJvcF0gITtcbiAgICBjb25zdCBlcXVpdmFsZW50UHJvcGVydGllcyA9IGZvcm1hdFBhdGhUb1Byb3BlcnRpZXNbZm9ybWF0UGF0aF07XG4gICAgZXF1aXZhbGVudFByb3BlcnRpZXNNYXAuc2V0KHByb3AsIGVxdWl2YWxlbnRQcm9wZXJ0aWVzKTtcbiAgfVxuXG4gIHJldHVybiB7cHJvcGVydGllc1RvUHJvY2VzcywgZXF1aXZhbGVudFByb3BlcnRpZXNNYXB9O1xufVxuIl19