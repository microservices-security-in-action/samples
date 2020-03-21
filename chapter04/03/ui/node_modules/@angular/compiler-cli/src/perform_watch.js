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
        define("@angular/compiler-cli/src/perform_watch", ["require", "exports", "chokidar", "path", "typescript", "@angular/compiler-cli/src/perform_compile", "@angular/compiler-cli/src/transformers/api", "@angular/compiler-cli/src/transformers/entry_points", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var chokidar = require("chokidar");
    var path = require("path");
    var ts = require("typescript");
    var perform_compile_1 = require("@angular/compiler-cli/src/perform_compile");
    var api = require("@angular/compiler-cli/src/transformers/api");
    var entry_points_1 = require("@angular/compiler-cli/src/transformers/entry_points");
    var util_1 = require("@angular/compiler-cli/src/transformers/util");
    function totalCompilationTimeDiagnostic(timeInMillis) {
        var duration;
        if (timeInMillis > 1000) {
            duration = (timeInMillis / 1000).toPrecision(2) + "s";
        }
        else {
            duration = timeInMillis + "ms";
        }
        return {
            category: ts.DiagnosticCategory.Message,
            messageText: "Total time: " + duration,
            code: api.DEFAULT_ERROR_CODE,
            source: api.SOURCE,
        };
    }
    var FileChangeEvent;
    (function (FileChangeEvent) {
        FileChangeEvent[FileChangeEvent["Change"] = 0] = "Change";
        FileChangeEvent[FileChangeEvent["CreateDelete"] = 1] = "CreateDelete";
        FileChangeEvent[FileChangeEvent["CreateDeleteDir"] = 2] = "CreateDeleteDir";
    })(FileChangeEvent = exports.FileChangeEvent || (exports.FileChangeEvent = {}));
    function createPerformWatchHost(configFileName, reportDiagnostics, existingOptions, createEmitCallback) {
        return {
            reportDiagnostics: reportDiagnostics,
            createCompilerHost: function (options) { return entry_points_1.createCompilerHost({ options: options }); },
            readConfiguration: function () { return perform_compile_1.readConfiguration(configFileName, existingOptions); },
            createEmitCallback: function (options) { return createEmitCallback ? createEmitCallback(options) : undefined; },
            onFileChange: function (options, listener, ready) {
                if (!options.basePath) {
                    reportDiagnostics([{
                            category: ts.DiagnosticCategory.Error,
                            messageText: 'Invalid configuration option. baseDir not specified',
                            source: api.SOURCE,
                            code: api.DEFAULT_ERROR_CODE
                        }]);
                    return { close: function () { } };
                }
                var watcher = chokidar.watch(options.basePath, {
                    // ignore .dotfiles, .js and .map files.
                    // can't ignore other files as we e.g. want to recompile if an `.html` file changes as well.
                    ignored: /((^[\/\\])\..)|(\.js$)|(\.map$)|(\.metadata\.json|node_modules)/,
                    ignoreInitial: true,
                    persistent: true,
                });
                watcher.on('all', function (event, path) {
                    switch (event) {
                        case 'change':
                            listener(FileChangeEvent.Change, path);
                            break;
                        case 'unlink':
                        case 'add':
                            listener(FileChangeEvent.CreateDelete, path);
                            break;
                        case 'unlinkDir':
                        case 'addDir':
                            listener(FileChangeEvent.CreateDeleteDir, path);
                            break;
                    }
                });
                watcher.on('ready', ready);
                return { close: function () { return watcher.close(); }, ready: ready };
            },
            setTimeout: (ts.sys.clearTimeout && ts.sys.setTimeout) || setTimeout,
            clearTimeout: (ts.sys.setTimeout && ts.sys.clearTimeout) || clearTimeout,
        };
    }
    exports.createPerformWatchHost = createPerformWatchHost;
    /**
     * The logic in this function is adapted from `tsc.ts` from TypeScript.
     */
    function performWatchCompilation(host) {
        var cachedProgram; // Program cached from last compilation
        var cachedCompilerHost; // CompilerHost cached from last compilation
        var cachedOptions; // CompilerOptions cached from last compilation
        var timerHandleForRecompilation; // Handle for 0.25s wait timer to trigger recompilation
        var ignoreFilesForWatch = new Set();
        var fileCache = new Map();
        var firstCompileResult = doCompilation();
        // Watch basePath, ignoring .dotfiles
        var resolveReadyPromise;
        var readyPromise = new Promise(function (resolve) { return resolveReadyPromise = resolve; });
        // Note: ! is ok as options are filled after the first compilation
        // Note: ! is ok as resolvedReadyPromise is filled by the previous call
        var fileWatcher = host.onFileChange(cachedOptions.options, watchedFileChanged, resolveReadyPromise);
        return { close: close, ready: function (cb) { return readyPromise.then(cb); }, firstCompileResult: firstCompileResult };
        function cacheEntry(fileName) {
            fileName = path.normalize(fileName);
            var entry = fileCache.get(fileName);
            if (!entry) {
                entry = {};
                fileCache.set(fileName, entry);
            }
            return entry;
        }
        function close() {
            fileWatcher.close();
            if (timerHandleForRecompilation) {
                host.clearTimeout(timerHandleForRecompilation.timerHandle);
                timerHandleForRecompilation = undefined;
            }
        }
        // Invoked to perform initial compilation or re-compilation in watch mode
        function doCompilation() {
            if (!cachedOptions) {
                cachedOptions = host.readConfiguration();
            }
            if (cachedOptions.errors && cachedOptions.errors.length) {
                host.reportDiagnostics(cachedOptions.errors);
                return cachedOptions.errors;
            }
            var startTime = Date.now();
            if (!cachedCompilerHost) {
                cachedCompilerHost = host.createCompilerHost(cachedOptions.options);
                var originalWriteFileCallback_1 = cachedCompilerHost.writeFile;
                cachedCompilerHost.writeFile = function (fileName, data, writeByteOrderMark, onError, sourceFiles) {
                    if (sourceFiles === void 0) { sourceFiles = []; }
                    ignoreFilesForWatch.add(path.normalize(fileName));
                    return originalWriteFileCallback_1(fileName, data, writeByteOrderMark, onError, sourceFiles);
                };
                var originalFileExists_1 = cachedCompilerHost.fileExists;
                cachedCompilerHost.fileExists = function (fileName) {
                    var ce = cacheEntry(fileName);
                    if (ce.exists == null) {
                        ce.exists = originalFileExists_1.call(this, fileName);
                    }
                    return ce.exists;
                };
                var originalGetSourceFile_1 = cachedCompilerHost.getSourceFile;
                cachedCompilerHost.getSourceFile = function (fileName, languageVersion) {
                    var ce = cacheEntry(fileName);
                    if (!ce.sf) {
                        ce.sf = originalGetSourceFile_1.call(this, fileName, languageVersion);
                    }
                    return ce.sf;
                };
                var originalReadFile_1 = cachedCompilerHost.readFile;
                cachedCompilerHost.readFile = function (fileName) {
                    var ce = cacheEntry(fileName);
                    if (ce.content == null) {
                        ce.content = originalReadFile_1.call(this, fileName);
                    }
                    return ce.content;
                };
                // Provide access to the file paths that triggered this rebuild
                cachedCompilerHost.getModifiedResourceFiles = function () {
                    if (timerHandleForRecompilation === undefined) {
                        return undefined;
                    }
                    return timerHandleForRecompilation.modifiedResourceFiles;
                };
            }
            ignoreFilesForWatch.clear();
            var oldProgram = cachedProgram;
            // We clear out the `cachedProgram` here as a
            // program can only be used as `oldProgram` 1x
            cachedProgram = undefined;
            var compileResult = perform_compile_1.performCompilation({
                rootNames: cachedOptions.rootNames,
                options: cachedOptions.options,
                host: cachedCompilerHost,
                oldProgram: oldProgram,
                emitCallback: host.createEmitCallback(cachedOptions.options)
            });
            if (compileResult.diagnostics.length) {
                host.reportDiagnostics(compileResult.diagnostics);
            }
            var endTime = Date.now();
            if (cachedOptions.options.diagnostics) {
                var totalTime = (endTime - startTime) / 1000;
                host.reportDiagnostics([totalCompilationTimeDiagnostic(endTime - startTime)]);
            }
            var exitCode = perform_compile_1.exitCodeFromResult(compileResult.diagnostics);
            if (exitCode == 0) {
                cachedProgram = compileResult.program;
                host.reportDiagnostics([util_1.createMessageDiagnostic('Compilation complete. Watching for file changes.')]);
            }
            else {
                host.reportDiagnostics([util_1.createMessageDiagnostic('Compilation failed. Watching for file changes.')]);
            }
            return compileResult.diagnostics;
        }
        function resetOptions() {
            cachedProgram = undefined;
            cachedCompilerHost = undefined;
            cachedOptions = undefined;
        }
        function watchedFileChanged(event, fileName) {
            var normalizedPath = path.normalize(fileName);
            if (cachedOptions && event === FileChangeEvent.Change &&
                // TODO(chuckj): validate that this is sufficient to skip files that were written.
                // This assumes that the file path we write is the same file path we will receive in the
                // change notification.
                normalizedPath === path.normalize(cachedOptions.project)) {
                // If the configuration file changes, forget everything and start the recompilation timer
                resetOptions();
            }
            else if (event === FileChangeEvent.CreateDelete || event === FileChangeEvent.CreateDeleteDir) {
                // If a file was added or removed, reread the configuration
                // to determine the new list of root files.
                cachedOptions = undefined;
            }
            if (event === FileChangeEvent.CreateDeleteDir) {
                fileCache.clear();
            }
            else {
                fileCache.delete(normalizedPath);
            }
            if (!ignoreFilesForWatch.has(normalizedPath)) {
                // Ignore the file if the file is one that was written by the compiler.
                startTimerForRecompilation(normalizedPath);
            }
        }
        // Upon detecting a file change, wait for 250ms and then perform a recompilation. This gives batch
        // operations (such as saving all modified files in an editor) a chance to complete before we kick
        // off a new compilation.
        function startTimerForRecompilation(changedPath) {
            if (timerHandleForRecompilation) {
                host.clearTimeout(timerHandleForRecompilation.timerHandle);
            }
            else {
                timerHandleForRecompilation = {
                    modifiedResourceFiles: new Set(),
                    timerHandle: undefined
                };
            }
            timerHandleForRecompilation.timerHandle = host.setTimeout(recompile, 250);
            timerHandleForRecompilation.modifiedResourceFiles.add(changedPath);
        }
        function recompile() {
            host.reportDiagnostics([util_1.createMessageDiagnostic('File change detected. Starting incremental compilation.')]);
            doCompilation();
            timerHandleForRecompilation = undefined;
        }
    }
    exports.performWatchCompilation = performWatchCompilation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZm9ybV93YXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvcGVyZm9ybV93YXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILG1DQUFxQztJQUNyQywyQkFBNkI7SUFDN0IsK0JBQWlDO0lBRWpDLDZFQUF3SjtJQUN4SixnRUFBMEM7SUFDMUMsb0ZBQStEO0lBQy9ELG9FQUE0RDtJQUU1RCxTQUFTLDhCQUE4QixDQUFDLFlBQW9CO1FBQzFELElBQUksUUFBZ0IsQ0FBQztRQUNyQixJQUFJLFlBQVksR0FBRyxJQUFJLEVBQUU7WUFDdkIsUUFBUSxHQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBRyxDQUFDO1NBQ3ZEO2FBQU07WUFDTCxRQUFRLEdBQU0sWUFBWSxPQUFJLENBQUM7U0FDaEM7UUFDRCxPQUFPO1lBQ0wsUUFBUSxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPO1lBQ3ZDLFdBQVcsRUFBRSxpQkFBZSxRQUFVO1lBQ3RDLElBQUksRUFBRSxHQUFHLENBQUMsa0JBQWtCO1lBQzVCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtTQUNuQixDQUFDO0lBQ0osQ0FBQztJQUVELElBQVksZUFJWDtJQUpELFdBQVksZUFBZTtRQUN6Qix5REFBTSxDQUFBO1FBQ04scUVBQVksQ0FBQTtRQUNaLDJFQUFlLENBQUE7SUFDakIsQ0FBQyxFQUpXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBSTFCO0lBY0QsU0FBZ0Isc0JBQXNCLENBQ2xDLGNBQXNCLEVBQUUsaUJBQXFELEVBQzdFLGVBQW9DLEVBQUUsa0JBQ2tDO1FBQzFFLE9BQU87WUFDTCxpQkFBaUIsRUFBRSxpQkFBaUI7WUFDcEMsa0JBQWtCLEVBQUUsVUFBQSxPQUFPLElBQUks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QkFBMkIsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUM1RDtpQkFBTTtnQkFDTCwyQkFBMkIsR0FBRztvQkFDNUIscUJBQXFCLEVBQUUsSUFBSSxHQUFHLEVBQVU7b0JBQ3hDLFdBQVcsRUFBRSxTQUFTO2lCQUN2QixDQUFDO2FBQ0g7WUFDRCwyQkFBMkIsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDMUUsMkJBQTJCLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFFRCxTQUFTLFNBQVM7WUFDaEIsSUFBSSxDQUFDLGlCQUFpQixDQUNsQixDQUFDLDhCQUF1QixDQUFDLHlEQUF5RCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFGLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLDJCQUEyQixHQUFHLFNBQVMsQ0FBQztRQUMxQyxDQUFDO0lBQ0gsQ0FBQztJQXpMRCwwREF5TEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGNob2tpZGFyIGZyb20gJ2Nob2tpZGFyJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtEaWFnbm9zdGljcywgUGFyc2VkQ29uZmlndXJhdGlvbiwgUGVyZm9ybUNvbXBpbGF0aW9uUmVzdWx0LCBleGl0Q29kZUZyb21SZXN1bHQsIHBlcmZvcm1Db21waWxhdGlvbiwgcmVhZENvbmZpZ3VyYXRpb259IGZyb20gJy4vcGVyZm9ybV9jb21waWxlJztcbmltcG9ydCAqIGFzIGFwaSBmcm9tICcuL3RyYW5zZm9ybWVycy9hcGknO1xuaW1wb3J0IHtjcmVhdGVDb21waWxlckhvc3R9IGZyb20gJy4vdHJhbnNmb3JtZXJzL2VudHJ5X3BvaW50cyc7XG5pbXBvcnQge2NyZWF0ZU1lc3NhZ2VEaWFnbm9zdGljfSBmcm9tICcuL3RyYW5zZm9ybWVycy91dGlsJztcblxuZnVuY3Rpb24gdG90YWxDb21waWxhdGlvblRpbWVEaWFnbm9zdGljKHRpbWVJbk1pbGxpczogbnVtYmVyKTogYXBpLkRpYWdub3N0aWMge1xuICBsZXQgZHVyYXRpb246IHN0cmluZztcbiAgaWYgKHRpbWVJbk1pbGxpcyA+IDEwMDApIHtcbiAgICBkdXJhdGlvbiA9IGAkeyh0aW1lSW5NaWxsaXMgLyAxMDAwKS50b1ByZWNpc2lvbigyKX1zYDtcbiAgfSBlbHNlIHtcbiAgICBkdXJhdGlvbiA9IGAke3RpbWVJbk1pbGxpc31tc2A7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5Lk1lc3NhZ2UsXG4gICAgbWVzc2FnZVRleHQ6IGBUb3RhbCB0aW1lOiAke2R1cmF0aW9ufWAsXG4gICAgY29kZTogYXBpLkRFRkFVTFRfRVJST1JfQ09ERSxcbiAgICBzb3VyY2U6IGFwaS5TT1VSQ0UsXG4gIH07XG59XG5cbmV4cG9ydCBlbnVtIEZpbGVDaGFuZ2VFdmVudCB7XG4gIENoYW5nZSxcbiAgQ3JlYXRlRGVsZXRlLFxuICBDcmVhdGVEZWxldGVEaXIsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVyZm9ybVdhdGNoSG9zdCB7XG4gIHJlcG9ydERpYWdub3N0aWNzKGRpYWdub3N0aWNzOiBEaWFnbm9zdGljcyk6IHZvaWQ7XG4gIHJlYWRDb25maWd1cmF0aW9uKCk6IFBhcnNlZENvbmZpZ3VyYXRpb247XG4gIGNyZWF0ZUNvbXBpbGVySG9zdChvcHRpb25zOiBhcGkuQ29tcGlsZXJPcHRpb25zKTogYXBpLkNvbXBpbGVySG9zdDtcbiAgY3JlYXRlRW1pdENhbGxiYWNrKG9wdGlvbnM6IGFwaS5Db21waWxlck9wdGlvbnMpOiBhcGkuVHNFbWl0Q2FsbGJhY2t8dW5kZWZpbmVkO1xuICBvbkZpbGVDaGFuZ2UoXG4gICAgICBvcHRpb25zOiBhcGkuQ29tcGlsZXJPcHRpb25zLCBsaXN0ZW5lcjogKGV2ZW50OiBGaWxlQ2hhbmdlRXZlbnQsIGZpbGVOYW1lOiBzdHJpbmcpID0+IHZvaWQsXG4gICAgICByZWFkeTogKCkgPT4gdm9pZCk6IHtjbG9zZTogKCkgPT4gdm9pZH07XG4gIHNldFRpbWVvdXQoY2FsbGJhY2s6ICgpID0+IHZvaWQsIG1zOiBudW1iZXIpOiBhbnk7XG4gIGNsZWFyVGltZW91dCh0aW1lb3V0SWQ6IGFueSk6IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQZXJmb3JtV2F0Y2hIb3N0KFxuICAgIGNvbmZpZ0ZpbGVOYW1lOiBzdHJpbmcsIHJlcG9ydERpYWdub3N0aWNzOiAoZGlhZ25vc3RpY3M6IERpYWdub3N0aWNzKSA9PiB2b2lkLFxuICAgIGV4aXN0aW5nT3B0aW9ucz86IHRzLkNvbXBpbGVyT3B0aW9ucywgY3JlYXRlRW1pdENhbGxiYWNrPzogKG9wdGlvbnM6IGFwaS5Db21waWxlck9wdGlvbnMpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpLlRzRW1pdENhbGxiYWNrIHwgdW5kZWZpbmVkKTogUGVyZm9ybVdhdGNoSG9zdCB7XG4gIHJldHVybiB7XG4gICAgcmVwb3J0RGlhZ25vc3RpY3M6IHJlcG9ydERpYWdub3N0aWNzLFxuICAgIGNyZWF0ZUNvbXBpbGVySG9zdDogb3B0aW9ucyA9PiBjcmVhdGVDb21waWxlckhvc3Qoe29wdGlvbnN9KSxcbiAgICByZWFkQ29uZmlndXJhdGlvbjogKCkgPT4gcmVhZENvbmZpZ3VyYXRpb24oY29uZmlnRmlsZU5hbWUsIGV4aXN0aW5nT3B0aW9ucyksXG4gICAgY3JlYXRlRW1pdENhbGxiYWNrOiBvcHRpb25zID0+IGNyZWF0ZUVtaXRDYWxsYmFjayA/IGNyZWF0ZUVtaXRDYWxsYmFjayhvcHRpb25zKSA6IHVuZGVmaW5lZCxcbiAgICBvbkZpbGVDaGFuZ2U6IChvcHRpb25zLCBsaXN0ZW5lciwgcmVhZHk6ICgpID0+IHZvaWQpID0+IHtcbiAgICAgIGlmICghb3B0aW9ucy5iYXNlUGF0aCkge1xuICAgICAgICByZXBvcnREaWFnbm9zdGljcyhbe1xuICAgICAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICAgICAgbWVzc2FnZVRleHQ6ICdJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb3B0aW9uLiBiYXNlRGlyIG5vdCBzcGVjaWZpZWQnLFxuICAgICAgICAgIHNvdXJjZTogYXBpLlNPVVJDRSxcbiAgICAgICAgICBjb2RlOiBhcGkuREVGQVVMVF9FUlJPUl9DT0RFXG4gICAgICAgIH1dKTtcbiAgICAgICAgcmV0dXJuIHtjbG9zZTogKCkgPT4ge319O1xuICAgICAgfVxuICAgICAgY29uc3Qgd2F0Y2hlciA9IGNob2tpZGFyLndhdGNoKG9wdGlvbnMuYmFzZVBhdGgsIHtcbiAgICAgICAgLy8gaWdub3JlIC5kb3RmaWxlcywgLmpzIGFuZCAubWFwIGZpbGVzLlxuICAgICAgICAvLyBjYW4ndCBpZ25vcmUgb3RoZXIgZmlsZXMgYXMgd2UgZS5nLiB3YW50IHRvIHJlY29tcGlsZSBpZiBhbiBgLmh0bWxgIGZpbGUgY2hhbmdlcyBhcyB3ZWxsLlxuICAgICAgICBpZ25vcmVkOiAvKCheW1xcL1xcXFxdKVxcLi4pfChcXC5qcyQpfChcXC5tYXAkKXwoXFwubWV0YWRhdGFcXC5qc29ufG5vZGVfbW9kdWxlcykvLFxuICAgICAgICBpZ25vcmVJbml0aWFsOiB0cnVlLFxuICAgICAgICBwZXJzaXN0ZW50OiB0cnVlLFxuICAgICAgfSk7XG4gICAgICB3YXRjaGVyLm9uKCdhbGwnLCAoZXZlbnQ6IHN0cmluZywgcGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoZXZlbnQpIHtcbiAgICAgICAgICBjYXNlICdjaGFuZ2UnOlxuICAgICAgICAgICAgbGlzdGVuZXIoRmlsZUNoYW5nZUV2ZW50LkNoYW5nZSwgcGF0aCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd1bmxpbmsnOlxuICAgICAgICAgIGNhc2UgJ2FkZCc6XG4gICAgICAgICAgICBsaXN0ZW5lcihGaWxlQ2hhbmdlRXZlbnQuQ3JlYXRlRGVsZXRlLCBwYXRoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3VubGlua0Rpcic6XG4gICAgICAgICAgY2FzZSAnYWRkRGlyJzpcbiAgICAgICAgICAgIGxpc3RlbmVyKEZpbGVDaGFuZ2VFdmVudC5DcmVhdGVEZWxldGVEaXIsIHBhdGgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgd2F0Y2hlci5vbigncmVhZHknLCByZWFkeSk7XG4gICAgICByZXR1cm4ge2Nsb3NlOiAoKSA9PiB3YXRjaGVyLmNsb3NlKCksIHJlYWR5fTtcbiAgICB9LFxuICAgIHNldFRpbWVvdXQ6ICh0cy5zeXMuY2xlYXJUaW1lb3V0ICYmIHRzLnN5cy5zZXRUaW1lb3V0KSB8fCBzZXRUaW1lb3V0LFxuICAgIGNsZWFyVGltZW91dDogKHRzLnN5cy5zZXRUaW1lb3V0ICYmIHRzLnN5cy5jbGVhclRpbWVvdXQpIHx8IGNsZWFyVGltZW91dCxcbiAgfTtcbn1cblxuaW50ZXJmYWNlIENhY2hlRW50cnkge1xuICBleGlzdHM/OiBib29sZWFuO1xuICBzZj86IHRzLlNvdXJjZUZpbGU7XG4gIGNvbnRlbnQ/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBRdWV1ZWRDb21waWxhdGlvbkluZm8ge1xuICB0aW1lckhhbmRsZTogYW55O1xuICBtb2RpZmllZFJlc291cmNlRmlsZXM6IFNldDxzdHJpbmc+O1xufVxuXG4vKipcbiAqIFRoZSBsb2dpYyBpbiB0aGlzIGZ1bmN0aW9uIGlzIGFkYXB0ZWQgZnJvbSBgdHNjLnRzYCBmcm9tIFR5cGVTY3JpcHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwZXJmb3JtV2F0Y2hDb21waWxhdGlvbihob3N0OiBQZXJmb3JtV2F0Y2hIb3N0KTpcbiAgICB7Y2xvc2U6ICgpID0+IHZvaWQsIHJlYWR5OiAoY2I6ICgpID0+IHZvaWQpID0+IHZvaWQsIGZpcnN0Q29tcGlsZVJlc3VsdDogRGlhZ25vc3RpY3N9IHtcbiAgbGV0IGNhY2hlZFByb2dyYW06IGFwaS5Qcm9ncmFtfHVuZGVmaW5lZDsgICAgICAgICAgICAvLyBQcm9ncmFtIGNhY2hlZCBmcm9tIGxhc3QgY29tcGlsYXRpb25cbiAgbGV0IGNhY2hlZENvbXBpbGVySG9zdDogYXBpLkNvbXBpbGVySG9zdHx1bmRlZmluZWQ7ICAvLyBDb21waWxlckhvc3QgY2FjaGVkIGZyb20gbGFzdCBjb21waWxhdGlvblxuICBsZXQgY2FjaGVkT3B0aW9uczogUGFyc2VkQ29uZmlndXJhdGlvbnx1bmRlZmluZWQ7ICAvLyBDb21waWxlck9wdGlvbnMgY2FjaGVkIGZyb20gbGFzdCBjb21waWxhdGlvblxuICBsZXQgdGltZXJIYW5kbGVGb3JSZWNvbXBpbGF0aW9uOiBRdWV1ZWRDb21waWxhdGlvbkluZm98XG4gICAgICB1bmRlZmluZWQ7ICAvLyBIYW5kbGUgZm9yIDAuMjVzIHdhaXQgdGltZXIgdG8gdHJpZ2dlciByZWNvbXBpbGF0aW9uXG5cbiAgY29uc3QgaWdub3JlRmlsZXNGb3JXYXRjaCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCBmaWxlQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgQ2FjaGVFbnRyeT4oKTtcblxuICBjb25zdCBmaXJzdENvbXBpbGVSZXN1bHQgPSBkb0NvbXBpbGF0aW9uKCk7XG5cbiAgLy8gV2F0Y2ggYmFzZVBhdGgsIGlnbm9yaW5nIC5kb3RmaWxlc1xuICBsZXQgcmVzb2x2ZVJlYWR5UHJvbWlzZTogKCkgPT4gdm9pZDtcbiAgY29uc3QgcmVhZHlQcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlUmVhZHlQcm9taXNlID0gcmVzb2x2ZSk7XG4gIC8vIE5vdGU6ICEgaXMgb2sgYXMgb3B0aW9ucyBhcmUgZmlsbGVkIGFmdGVyIHRoZSBmaXJzdCBjb21waWxhdGlvblxuICAvLyBOb3RlOiAhIGlzIG9rIGFzIHJlc29sdmVkUmVhZHlQcm9taXNlIGlzIGZpbGxlZCBieSB0aGUgcHJldmlvdXMgY2FsbFxuICBjb25zdCBmaWxlV2F0Y2hlciA9XG4gICAgICBob3N0Lm9uRmlsZUNoYW5nZShjYWNoZWRPcHRpb25zICEub3B0aW9ucywgd2F0Y2hlZEZpbGVDaGFuZ2VkLCByZXNvbHZlUmVhZHlQcm9taXNlICEpO1xuXG4gIHJldHVybiB7Y2xvc2UsIHJlYWR5OiBjYiA9PiByZWFkeVByb21pc2UudGhlbihjYiksIGZpcnN0Q29tcGlsZVJlc3VsdH07XG5cbiAgZnVuY3Rpb24gY2FjaGVFbnRyeShmaWxlTmFtZTogc3RyaW5nKTogQ2FjaGVFbnRyeSB7XG4gICAgZmlsZU5hbWUgPSBwYXRoLm5vcm1hbGl6ZShmaWxlTmFtZSk7XG4gICAgbGV0IGVudHJ5ID0gZmlsZUNhY2hlLmdldChmaWxlTmFtZSk7XG4gICAgaWYgKCFlbnRyeSkge1xuICAgICAgZW50cnkgPSB7fTtcbiAgICAgIGZpbGVDYWNoZS5zZXQoZmlsZU5hbWUsIGVudHJ5KTtcbiAgICB9XG4gICAgcmV0dXJuIGVudHJ5O1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgZmlsZVdhdGNoZXIuY2xvc2UoKTtcbiAgICBpZiAodGltZXJIYW5kbGVGb3JSZWNvbXBpbGF0aW9uKSB7XG4gICAgICBob3N0LmNsZWFyVGltZW91dCh0aW1lckhhbmRsZUZvclJlY29tcGlsYXRpb24udGltZXJIYW5kbGUpO1xuICAgICAgdGltZXJIYW5kbGVGb3JSZWNvbXBpbGF0aW9uID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIC8vIEludm9rZWQgdG8gcGVyZm9ybSBpbml0aWFsIGNvbXBpbGF0aW9uIG9yIHJlLWNvbXBpbGF0aW9uIGluIHdhdGNoIG1vZGVcbiAgZnVuY3Rpb24gZG9Db21waWxhdGlvbigpOiBEaWFnbm9zdGljcyB7XG4gICAgaWYgKCFjYWNoZWRPcHRpb25zKSB7XG4gICAgICBjYWNoZWRPcHRpb25zID0gaG9zdC5yZWFkQ29uZmlndXJhdGlvbigpO1xuICAgIH1cbiAgICBpZiAoY2FjaGVkT3B0aW9ucy5lcnJvcnMgJiYgY2FjaGVkT3B0aW9ucy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgICBob3N0LnJlcG9ydERpYWdub3N0aWNzKGNhY2hlZE9wdGlvbnMuZXJyb3JzKTtcbiAgICAgIHJldHVybiBjYWNoZWRPcHRpb25zLmVycm9ycztcbiAgICB9XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBpZiAoIWNhY2hlZENvbXBpbGVySG9zdCkge1xuICAgICAgY2FjaGVkQ29tcGlsZXJIb3N0ID0gaG9zdC5jcmVhdGVDb21waWxlckhvc3QoY2FjaGVkT3B0aW9ucy5vcHRpb25zKTtcbiAgICAgIGNvbnN0IG9yaWdpbmFsV3JpdGVGaWxlQ2FsbGJhY2sgPSBjYWNoZWRDb21waWxlckhvc3Qud3JpdGVGaWxlO1xuICAgICAgY2FjaGVkQ29tcGlsZXJIb3N0LndyaXRlRmlsZSA9IGZ1bmN0aW9uKFxuICAgICAgICAgIGZpbGVOYW1lOiBzdHJpbmcsIGRhdGE6IHN0cmluZywgd3JpdGVCeXRlT3JkZXJNYXJrOiBib29sZWFuLFxuICAgICAgICAgIG9uRXJyb3I/OiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkLCBzb3VyY2VGaWxlczogUmVhZG9ubHlBcnJheTx0cy5Tb3VyY2VGaWxlPiA9IFtdKSB7XG4gICAgICAgIGlnbm9yZUZpbGVzRm9yV2F0Y2guYWRkKHBhdGgubm9ybWFsaXplKGZpbGVOYW1lKSk7XG4gICAgICAgIHJldHVybiBvcmlnaW5hbFdyaXRlRmlsZUNhbGxiYWNrKGZpbGVOYW1lLCBkYXRhLCB3cml0ZUJ5dGVPcmRlck1hcmssIG9uRXJyb3IsIHNvdXJjZUZpbGVzKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBvcmlnaW5hbEZpbGVFeGlzdHMgPSBjYWNoZWRDb21waWxlckhvc3QuZmlsZUV4aXN0cztcbiAgICAgIGNhY2hlZENvbXBpbGVySG9zdC5maWxlRXhpc3RzID0gZnVuY3Rpb24oZmlsZU5hbWU6IHN0cmluZykge1xuICAgICAgICBjb25zdCBjZSA9IGNhY2hlRW50cnkoZmlsZU5hbWUpO1xuICAgICAgICBpZiAoY2UuZXhpc3RzID09IG51bGwpIHtcbiAgICAgICAgICBjZS5leGlzdHMgPSBvcmlnaW5hbEZpbGVFeGlzdHMuY2FsbCh0aGlzLCBmaWxlTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNlLmV4aXN0cyAhO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IG9yaWdpbmFsR2V0U291cmNlRmlsZSA9IGNhY2hlZENvbXBpbGVySG9zdC5nZXRTb3VyY2VGaWxlO1xuICAgICAgY2FjaGVkQ29tcGlsZXJIb3N0LmdldFNvdXJjZUZpbGUgPSBmdW5jdGlvbihcbiAgICAgICAgICBmaWxlTmFtZTogc3RyaW5nLCBsYW5ndWFnZVZlcnNpb246IHRzLlNjcmlwdFRhcmdldCkge1xuICAgICAgICBjb25zdCBjZSA9IGNhY2hlRW50cnkoZmlsZU5hbWUpO1xuICAgICAgICBpZiAoIWNlLnNmKSB7XG4gICAgICAgICAgY2Uuc2YgPSBvcmlnaW5hbEdldFNvdXJjZUZpbGUuY2FsbCh0aGlzLCBmaWxlTmFtZSwgbGFuZ3VhZ2VWZXJzaW9uKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2Uuc2YgITtcbiAgICAgIH07XG4gICAgICBjb25zdCBvcmlnaW5hbFJlYWRGaWxlID0gY2FjaGVkQ29tcGlsZXJIb3N0LnJlYWRGaWxlO1xuICAgICAgY2FjaGVkQ29tcGlsZXJIb3N0LnJlYWRGaWxlID0gZnVuY3Rpb24oZmlsZU5hbWU6IHN0cmluZykge1xuICAgICAgICBjb25zdCBjZSA9IGNhY2hlRW50cnkoZmlsZU5hbWUpO1xuICAgICAgICBpZiAoY2UuY29udGVudCA9PSBudWxsKSB7XG4gICAgICAgICAgY2UuY29udGVudCA9IG9yaWdpbmFsUmVhZEZpbGUuY2FsbCh0aGlzLCBmaWxlTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNlLmNvbnRlbnQgITtcbiAgICAgIH07XG4gICAgICAvLyBQcm92aWRlIGFjY2VzcyB0byB0aGUgZmlsZSBwYXRocyB0aGF0IHRyaWdnZXJlZCB0aGlzIHJlYnVpbGRcbiAgICAgIGNhY2hlZENvbXBpbGVySG9zdC5nZXRNb2RpZmllZFJlc291cmNlRmlsZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRpbWVySGFuZGxlRm9yUmVjb21waWxhdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGltZXJIYW5kbGVGb3JSZWNvbXBpbGF0aW9uLm1vZGlmaWVkUmVzb3VyY2VGaWxlcztcbiAgICAgIH07XG4gICAgfVxuICAgIGlnbm9yZUZpbGVzRm9yV2F0Y2guY2xlYXIoKTtcbiAgICBjb25zdCBvbGRQcm9ncmFtID0gY2FjaGVkUHJvZ3JhbTtcbiAgICAvLyBXZSBjbGVhciBvdXQgdGhlIGBjYWNoZWRQcm9ncmFtYCBoZXJlIGFzIGFcbiAgICAvLyBwcm9ncmFtIGNhbiBvbmx5IGJlIHVzZWQgYXMgYG9sZFByb2dyYW1gIDF4XG4gICAgY2FjaGVkUHJvZ3JhbSA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCBjb21waWxlUmVzdWx0ID0gcGVyZm9ybUNvbXBpbGF0aW9uKHtcbiAgICAgIHJvb3ROYW1lczogY2FjaGVkT3B0aW9ucy5yb290TmFtZXMsXG4gICAgICBvcHRpb25zOiBjYWNoZWRPcHRpb25zLm9wdGlvbnMsXG4gICAgICBob3N0OiBjYWNoZWRDb21waWxlckhvc3QsXG4gICAgICBvbGRQcm9ncmFtOiBvbGRQcm9ncmFtLFxuICAgICAgZW1pdENhbGxiYWNrOiBob3N0LmNyZWF0ZUVtaXRDYWxsYmFjayhjYWNoZWRPcHRpb25zLm9wdGlvbnMpXG4gICAgfSk7XG5cbiAgICBpZiAoY29tcGlsZVJlc3VsdC5kaWFnbm9zdGljcy5sZW5ndGgpIHtcbiAgICAgIGhvc3QucmVwb3J0RGlhZ25vc3RpY3MoY29tcGlsZVJlc3VsdC5kaWFnbm9zdGljcyk7XG4gICAgfVxuXG4gICAgY29uc3QgZW5kVGltZSA9IERhdGUubm93KCk7XG4gICAgaWYgKGNhY2hlZE9wdGlvbnMub3B0aW9ucy5kaWFnbm9zdGljcykge1xuICAgICAgY29uc3QgdG90YWxUaW1lID0gKGVuZFRpbWUgLSBzdGFydFRpbWUpIC8gMTAwMDtcbiAgICAgIGhvc3QucmVwb3J0RGlhZ25vc3RpY3MoW3RvdGFsQ29tcGlsYXRpb25UaW1lRGlhZ25vc3RpYyhlbmRUaW1lIC0gc3RhcnRUaW1lKV0pO1xuICAgIH1cbiAgICBjb25zdCBleGl0Q29kZSA9IGV4aXRDb2RlRnJvbVJlc3VsdChjb21waWxlUmVzdWx0LmRpYWdub3N0aWNzKTtcbiAgICBpZiAoZXhpdENvZGUgPT0gMCkge1xuICAgICAgY2FjaGVkUHJvZ3JhbSA9IGNvbXBpbGVSZXN1bHQucHJvZ3JhbTtcbiAgICAgIGhvc3QucmVwb3J0RGlhZ25vc3RpY3MoXG4gICAgICAgICAgW2NyZWF0ZU1lc3NhZ2VEaWFnbm9zdGljKCdDb21waWxhdGlvbiBjb21wbGV0ZS4gV2F0Y2hpbmcgZm9yIGZpbGUgY2hhbmdlcy4nKV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBob3N0LnJlcG9ydERpYWdub3N0aWNzKFxuICAgICAgICAgIFtjcmVhdGVNZXNzYWdlRGlhZ25vc3RpYygnQ29tcGlsYXRpb24gZmFpbGVkLiBXYXRjaGluZyBmb3IgZmlsZSBjaGFuZ2VzLicpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbXBpbGVSZXN1bHQuZGlhZ25vc3RpY3M7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldE9wdGlvbnMoKSB7XG4gICAgY2FjaGVkUHJvZ3JhbSA9IHVuZGVmaW5lZDtcbiAgICBjYWNoZWRDb21waWxlckhvc3QgPSB1bmRlZmluZWQ7XG4gICAgY2FjaGVkT3B0aW9ucyA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdhdGNoZWRGaWxlQ2hhbmdlZChldmVudDogRmlsZUNoYW5nZUV2ZW50LCBmaWxlTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBwYXRoLm5vcm1hbGl6ZShmaWxlTmFtZSk7XG5cbiAgICBpZiAoY2FjaGVkT3B0aW9ucyAmJiBldmVudCA9PT0gRmlsZUNoYW5nZUV2ZW50LkNoYW5nZSAmJlxuICAgICAgICAvLyBUT0RPKGNodWNraik6IHZhbGlkYXRlIHRoYXQgdGhpcyBpcyBzdWZmaWNpZW50IHRvIHNraXAgZmlsZXMgdGhhdCB3ZXJlIHdyaXR0ZW4uXG4gICAgICAgIC8vIFRoaXMgYXNzdW1lcyB0aGF0IHRoZSBmaWxlIHBhdGggd2Ugd3JpdGUgaXMgdGhlIHNhbWUgZmlsZSBwYXRoIHdlIHdpbGwgcmVjZWl2ZSBpbiB0aGVcbiAgICAgICAgLy8gY2hhbmdlIG5vdGlmaWNhdGlvbi5cbiAgICAgICAgbm9ybWFsaXplZFBhdGggPT09IHBhdGgubm9ybWFsaXplKGNhY2hlZE9wdGlvbnMucHJvamVjdCkpIHtcbiAgICAgIC8vIElmIHRoZSBjb25maWd1cmF0aW9uIGZpbGUgY2hhbmdlcywgZm9yZ2V0IGV2ZXJ5dGhpbmcgYW5kIHN0YXJ0IHRoZSByZWNvbXBpbGF0aW9uIHRpbWVyXG4gICAgICByZXNldE9wdGlvbnMoKTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgICBldmVudCA9PT0gRmlsZUNoYW5nZUV2ZW50LkNyZWF0ZURlbGV0ZSB8fCBldmVudCA9PT0gRmlsZUNoYW5nZUV2ZW50LkNyZWF0ZURlbGV0ZURpcikge1xuICAgICAgLy8gSWYgYSBmaWxlIHdhcyBhZGRlZCBvciByZW1vdmVkLCByZXJlYWQgdGhlIGNvbmZpZ3VyYXRpb25cbiAgICAgIC8vIHRvIGRldGVybWluZSB0aGUgbmV3IGxpc3Qgb2Ygcm9vdCBmaWxlcy5cbiAgICAgIGNhY2hlZE9wdGlvbnMgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50ID09PSBGaWxlQ2hhbmdlRXZlbnQuQ3JlYXRlRGVsZXRlRGlyKSB7XG4gICAgICBmaWxlQ2FjaGUuY2xlYXIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmlsZUNhY2hlLmRlbGV0ZShub3JtYWxpemVkUGF0aCk7XG4gICAgfVxuXG4gICAgaWYgKCFpZ25vcmVGaWxlc0ZvcldhdGNoLmhhcyhub3JtYWxpemVkUGF0aCkpIHtcbiAgICAgIC8vIElnbm9yZSB0aGUgZmlsZSBpZiB0aGUgZmlsZSBpcyBvbmUgdGhhdCB3YXMgd3JpdHRlbiBieSB0aGUgY29tcGlsZXIuXG4gICAgICBzdGFydFRpbWVyRm9yUmVjb21waWxhdGlvbihub3JtYWxpemVkUGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLy8gVXBvbiBkZXRlY3RpbmcgYSBmaWxlIGNoYW5nZSwgd2FpdCBmb3IgMjUwbXMgYW5kIHRoZW4gcGVyZm9ybSBhIHJlY29tcGlsYXRpb24uIFRoaXMgZ2l2ZXMgYmF0Y2hcbiAgLy8gb3BlcmF0aW9ucyAoc3VjaCBhcyBzYXZpbmcgYWxsIG1vZGlmaWVkIGZpbGVzIGluIGFuIGVkaXRvcikgYSBjaGFuY2UgdG8gY29tcGxldGUgYmVmb3JlIHdlIGtpY2tcbiAgLy8gb2ZmIGEgbmV3IGNvbXBpbGF0aW9uLlxuICBmdW5jdGlvbiBzdGFydFRpbWVyRm9yUmVjb21waWxhdGlvbihjaGFuZ2VkUGF0aDogc3RyaW5nKSB7XG4gICAgaWYgKHRpbWVySGFuZGxlRm9yUmVjb21waWxhdGlvbikge1xuICAgICAgaG9zdC5jbGVhclRpbWVvdXQodGltZXJIYW5kbGVGb3JSZWNvbXBpbGF0aW9uLnRpbWVySGFuZGxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGltZXJIYW5kbGVGb3JSZWNvbXBpbGF0aW9uID0ge1xuICAgICAgICBtb2RpZmllZFJlc291cmNlRmlsZXM6IG5ldyBTZXQ8c3RyaW5nPigpLFxuICAgICAgICB0aW1lckhhbmRsZTogdW5kZWZpbmVkXG4gICAgICB9O1xuICAgIH1cbiAgICB0aW1lckhhbmRsZUZvclJlY29tcGlsYXRpb24udGltZXJIYW5kbGUgPSBob3N0LnNldFRpbWVvdXQocmVjb21waWxlLCAyNTApO1xuICAgIHRpbWVySGFuZGxlRm9yUmVjb21waWxhdGlvbi5tb2RpZmllZFJlc291cmNlRmlsZXMuYWRkKGNoYW5nZWRQYXRoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY29tcGlsZSgpIHtcbiAgICBob3N0LnJlcG9ydERpYWdub3N0aWNzKFxuICAgICAgICBbY3JlYXRlTWVzc2FnZURpYWdub3N0aWMoJ0ZpbGUgY2hhbmdlIGRldGVjdGVkLiBTdGFydGluZyBpbmNyZW1lbnRhbCBjb21waWxhdGlvbi4nKV0pO1xuICAgIGRvQ29tcGlsYXRpb24oKTtcbiAgICB0aW1lckhhbmRsZUZvclJlY29tcGlsYXRpb24gPSB1bmRlZmluZWQ7XG4gIH1cbn1cbiJdfQ==