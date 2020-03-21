#!/usr/bin/env node
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/main-ngcc", ["require", "exports", "tslib", "yargs", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/main", "@angular/compiler-cli/ngcc/src/logging/console_logger"], factory);
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
    var yargs = require("yargs");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var main_1 = require("@angular/compiler-cli/ngcc/src/main");
    var console_logger_1 = require("@angular/compiler-cli/ngcc/src/logging/console_logger");
    // CLI entry point
    if (require.main === module) {
        var startTime_1 = Date.now();
        var args = process.argv.slice(2);
        var options_1 = yargs
            .option('s', {
            alias: 'source',
            describe: 'A path (relative to the working directory) of the `node_modules` folder to process.',
            default: './node_modules'
        })
            .option('f', { alias: 'formats', hidden: true, array: true })
            .option('p', {
            alias: 'properties',
            array: true,
            describe: 'An array of names of properties in package.json to compile (e.g. `module` or `es2015`)\n' +
                'Each of these properties should hold the path to a bundle-format.\n' +
                'If provided, only the specified properties are considered for processing.\n' +
                'If not provided, all the supported format properties (e.g. fesm2015, fesm5, es2015, esm2015, esm5, main, module) in the package.json are considered.'
        })
            .option('t', {
            alias: 'target',
            describe: 'A relative path (from the `source` path) to a single entry-point to process (plus its dependencies).',
        })
            .option('first-only', {
            describe: 'If specified then only the first matching package.json property will be compiled.',
            type: 'boolean'
        })
            .option('create-ivy-entry-points', {
            describe: 'If specified then new `*_ivy_ngcc` entry-points will be added to package.json rather than modifying the ones in-place.\n' +
                'For this to work you need to have custom resolution set up (e.g. in webpack) to look for these new entry-points.\n' +
                'The Angular CLI does this already, so it is safe to use this option if the project is being built via the CLI.',
            type: 'boolean',
        })
            .option('legacy-message-ids', {
            describe: 'Render `$localize` messages with legacy format ids.\n' +
                'The default value is `true`. Only set this to `false` if you do not want legacy message ids to\n' +
                'be rendered. For example, if you are not using legacy message ids in your translation files\n' +
                'AND are not doing compile-time inlining of translations, in which case the extra message ids\n' +
                'would add unwanted size to the final source bundle.\n' +
                'It is safe to leave this set to true if you are doing compile-time inlining because the extra\n' +
                'legacy message ids will all be stripped during translation.',
            type: 'boolean',
            default: true,
        })
            .option('async', {
            describe: 'Whether to compile asynchronously. This is enabled by default as it allows compilations to be parallelized.\n' +
                'Disabling asynchronous compilation may be useful for debugging.',
            type: 'boolean',
            default: true,
        })
            .option('l', {
            alias: 'loglevel',
            describe: 'The lowest severity logging message that should be output.',
            choices: ['debug', 'info', 'warn', 'error'],
        })
            .help()
            .parse(args);
        if (options_1['f'] && options_1['f'].length) {
            console.error('The formats option (-f/--formats) has been removed. Consider the properties option (-p/--properties) instead.');
            process.exit(1);
        }
        file_system_1.setFileSystem(new file_system_1.CachedFileSystem(new file_system_1.NodeJSFileSystem()));
        var baseSourcePath_1 = file_system_1.resolve(options_1['s'] || './node_modules');
        var propertiesToConsider_1 = options_1['p'];
        var targetEntryPointPath_1 = options_1['t'] ? options_1['t'] : undefined;
        var compileAllFormats_1 = !options_1['first-only'];
        var createNewEntryPointFormats_1 = options_1['create-ivy-entry-points'];
        var logLevel_1 = options_1['l'];
        var enableI18nLegacyMessageIdFormat_1 = options_1['legacy-message-ids'];
        (function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var logger, duration, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger = logLevel_1 && new console_logger_1.ConsoleLogger(console_logger_1.LogLevel[logLevel_1]);
                        return [4 /*yield*/, main_1.mainNgcc({
                                basePath: baseSourcePath_1,
                                propertiesToConsider: propertiesToConsider_1,
                                targetEntryPointPath: targetEntryPointPath_1,
                                compileAllFormats: compileAllFormats_1,
                                createNewEntryPointFormats: createNewEntryPointFormats_1,
                                logger: logger,
                                enableI18nLegacyMessageIdFormat: enableI18nLegacyMessageIdFormat_1,
                                async: options_1['async'],
                            })];
                    case 1:
                        _a.sent();
                        if (logger) {
                            duration = Math.round((Date.now() - startTime_1) / 1000);
                            logger.debug("Run ngcc in " + duration + "s.");
                        }
                        process.exitCode = 0;
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        console.error(e_1.stack || e_1.message);
                        process.exitCode = 1;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1uZ2NjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2MvbWFpbi1uZ2NjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFDQTs7Ozs7O09BTUc7SUFDSCw2QkFBK0I7SUFFL0IsMkVBQW9HO0lBQ3BHLDREQUFvQztJQUNwQyx3RkFBcUU7SUFFckUsa0JBQWtCO0lBQ2xCLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7UUFDM0IsSUFBTSxXQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRTdCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLElBQU0sU0FBTyxHQUNULEtBQUs7YUFDQSxNQUFNLENBQUMsR0FBRyxFQUFFO1lBQ1gsS0FBSyxFQUFFLFFBQVE7WUFDZixRQUFRLEVBQ0oscUZBQXFGO1lBQ3pGLE9BQU8sRUFBRSxnQkFBZ0I7U0FDMUIsQ0FBQzthQUNELE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDO2FBQzFELE1BQU0sQ0FBQyxHQUFHLEVBQUU7WUFDWCxLQUFLLEVBQUUsWUFBWTtZQUNuQixLQUFLLEVBQUUsSUFBSTtZQUNYLFFBQVEsRUFDSiwwRkFBMEY7Z0JBQzFGLHFFQUFxRTtnQkFDckUsNkVBQTZFO2dCQUM3RSxzSkFBc0o7U0FDM0osQ0FBQzthQUNELE1BQU0sQ0FBQyxHQUFHLEVBQUU7WUFDWCxLQUFLLEVBQUUsUUFBUTtZQUNmLFFBQVEsRUFDSixzR0FBc0c7U0FDM0csQ0FBQzthQUNELE1BQU0sQ0FBQyxZQUFZLEVBQUU7WUFDcEIsUUFBUSxFQUNKLG1GQUFtRjtZQUN2RixJQUFJLEVBQUUsU0FB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LE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBQyxDQUFDLEtBQUssSUFBSSxHQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ3BDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDOzs7OzthQUV4QixDQUFDLEVBQUUsQ0FBQztLQUNOIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge3Jlc29sdmUsIHNldEZpbGVTeXN0ZW0sIENhY2hlZEZpbGVTeXN0ZW0sIE5vZGVKU0ZpbGVTeXN0ZW19IGZyb20gJy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge21haW5OZ2NjfSBmcm9tICcuL3NyYy9tYWluJztcbmltcG9ydCB7Q29uc29sZUxvZ2dlciwgTG9nTGV2ZWx9IGZyb20gJy4vc3JjL2xvZ2dpbmcvY29uc29sZV9sb2dnZXInO1xuXG4vLyBDTEkgZW50cnkgcG9pbnRcbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gIGNvbnN0IGFyZ3MgPSBwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7XG4gIGNvbnN0IG9wdGlvbnMgPVxuICAgICAgeWFyZ3NcbiAgICAgICAgICAub3B0aW9uKCdzJywge1xuICAgICAgICAgICAgYWxpYXM6ICdzb3VyY2UnLFxuICAgICAgICAgICAgZGVzY3JpYmU6XG4gICAgICAgICAgICAgICAgJ0EgcGF0aCAocmVsYXRpdmUgdG8gdGhlIHdvcmtpbmcgZGlyZWN0b3J5KSBvZiB0aGUgYG5vZGVfbW9kdWxlc2AgZm9sZGVyIHRvIHByb2Nlc3MuJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcuL25vZGVfbW9kdWxlcydcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5vcHRpb24oJ2YnLCB7YWxpYXM6ICdmb3JtYXRzJywgaGlkZGVuOsKgdHJ1ZSwgYXJyYXk6IHRydWV9KVxuICAgICAgICAgIC5vcHRpb24oJ3AnLCB7XG4gICAgICAgICAgICBhbGlhczogJ3Byb3BlcnRpZXMnLFxuICAgICAgICAgICAgYXJyYXk6IHRydWUsXG4gICAgICAgICAgICBkZXNjcmliZTpcbiAgICAgICAgICAgICAgICAnQW4gYXJyYXkgb2YgbmFtZXMgb2YgcHJvcGVydGllcyBpbiBwYWNrYWdlLmpzb24gdG8gY29tcGlsZSAoZS5nLiBgbW9kdWxlYCBvciBgZXMyMDE1YClcXG4nICtcbiAgICAgICAgICAgICAgICAnRWFjaCBvZiB0aGVzZSBwcm9wZXJ0aWVzIHNob3VsZCBob2xkIHRoZSBwYXRoIHRvIGEgYnVuZGxlLWZvcm1hdC5cXG4nICtcbiAgICAgICAgICAgICAgICAnSWYgcHJvdmlkZWQsIG9ubHkgdGhlIHNwZWNpZmllZCBwcm9wZXJ0aWVzIGFyZSBjb25zaWRlcmVkIGZvciBwcm9jZXNzaW5nLlxcbicgK1xuICAgICAgICAgICAgICAgICdJZiBub3QgcHJvdmlkZWQsIGFsbCB0aGUgc3VwcG9ydGVkIGZvcm1hdCBwcm9wZXJ0aWVzIChlLmcuIGZlc20yMDE1LCBmZXNtNSwgZXMyMDE1LCBlc20yMDE1LCBlc201LCBtYWluLCBtb2R1bGUpIGluIHRoZSBwYWNrYWdlLmpzb24gYXJlIGNvbnNpZGVyZWQuJ1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLm9wdGlvbigndCcsIHtcbiAgICAgICAgICAgIGFsaWFzOiAndGFyZ2V0JyxcbiAgICAgICAgICAgIGRlc2NyaWJlOlxuICAgICAgICAgICAgICAgICdBIHJlbGF0aXZlIHBhdGggKGZyb20gdGhlIGBzb3VyY2VgIHBhdGgpIHRvIGEgc2luZ2xlIGVudHJ5LXBvaW50IHRvIHByb2Nlc3MgKHBsdXMgaXRzIGRlcGVuZGVuY2llcykuJyxcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5vcHRpb24oJ2ZpcnN0LW9ubHknLCB7XG4gICAgICAgICAgICBkZXNjcmliZTpcbiAgICAgICAgICAgICAgICAnSWYgc3BlY2lmaWVkIHRoZW4gb25seSB0aGUgZmlyc3QgbWF0Y2hpbmcgcGFja2FnZS5qc29uIHByb3BlcnR5IHdpbGwgYmUgY29tcGlsZWQuJyxcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLm9wdGlvbignY3JlYXRlLWl2eS1lbnRyeS1wb2ludHMnLCB7XG4gICAgICAgICAgICBkZXNjcmliZTpcbiAgICAgICAgICAgICAgICAnSWYgc3BlY2lmaWVkIHRoZW4gbmV3IGAqX2l2eV9uZ2NjYCBlbnRyeS1wb2ludHMgd2lsbCBiZSBhZGRlZCB0byBwYWNrYWdlLmpzb24gcmF0aGVyIHRoYW4gbW9kaWZ5aW5nIHRoZSBvbmVzIGluLXBsYWNlLlxcbicgK1xuICAgICAgICAgICAgICAgICdGb3IgdGhpcyB0byB3b3JrIHlvdSBuZWVkIHRvIGhhdmUgY3VzdG9tIHJlc29sdXRpb24gc2V0IHVwIChlLmcuIGluIHdlYnBhY2spIHRvIGxvb2sgZm9yIHRoZXNlIG5ldyBlbnRyeS1wb2ludHMuXFxuJyArXG4gICAgICAgICAgICAgICAgJ1RoZSBBbmd1bGFyIENMSSBkb2VzIHRoaXMgYWxyZWFkeSwgc28gaXQgaXMgc2FmZSB0byB1c2UgdGhpcyBvcHRpb24gaWYgdGhlIHByb2plY3QgaXMgYmVpbmcgYnVpbHQgdmlhIHRoZSBDTEkuJyxcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5vcHRpb24oJ2xlZ2FjeS1tZXNzYWdlLWlkcycsIHtcbiAgICAgICAgICAgIGRlc2NyaWJlOiAnUmVuZGVyIGAkbG9jYWxpemVgIG1lc3NhZ2VzIHdpdGggbGVnYWN5IGZvcm1hdCBpZHMuXFxuJyArXG4gICAgICAgICAgICAgICAgJ1RoZSBkZWZhdWx0IHZhbHVlIGlzIGB0cnVlYC4gT25seSBzZXQgdGhpcyB0byBgZmFsc2VgIGlmIHlvdSBkbyBub3Qgd2FudCBsZWdhY3kgbWVzc2FnZSBpZHMgdG9cXG4nICtcbiAgICAgICAgICAgICAgICAnYmUgcmVuZGVyZWQuIEZvciBleGFtcGxlLCBpZiB5b3UgYXJlIG5vdCB1c2luZyBsZWdhY3kgbWVzc2FnZSBpZHMgaW4geW91ciB0cmFuc2xhdGlvbiBmaWxlc1xcbicgK1xuICAgICAgICAgICAgICAgICdBTkQgYXJlIG5vdCBkb2luZyBjb21waWxlLXRpbWUgaW5saW5pbmcgb2YgdHJhbnNsYXRpb25zLCBpbiB3aGljaCBjYXNlIHRoZSBleHRyYSBtZXNzYWdlIGlkc1xcbicgK1xuICAgICAgICAgICAgICAgICd3b3VsZCBhZGQgdW53YW50ZWQgc2l6ZSB0byB0aGUgZmluYWwgc291cmNlIGJ1bmRsZS5cXG4nICtcbiAgICAgICAgICAgICAgICAnSXQgaXMgc2FmZSB0byBsZWF2ZSB0aGlzIHNldCB0byB0cnVlIGlmIHlvdSBhcmUgZG9pbmcgY29tcGlsZS10aW1lIGlubGluaW5nIGJlY2F1c2UgdGhlIGV4dHJhXFxuJyArXG4gICAgICAgICAgICAgICAgJ2xlZ2FjeSBtZXNzYWdlIGlkcyB3aWxsIGFsbCBiZSBzdHJpcHBlZCBkdXJpbmcgdHJhbnNsYXRpb24uJyxcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgICAub3B0aW9uKCdhc3luYycsIHtcbiAgICAgICAgICAgIGRlc2NyaWJlOlxuICAgICAgICAgICAgICAgICdXaGV0aGVyIHRvIGNvbXBpbGUgYXN5bmNocm9ub3VzbHkuIFRoaXMgaXMgZW5hYmxlZCBieSBkZWZhdWx0IGFzIGl0IGFsbG93cyBjb21waWxhdGlvbnMgdG8gYmUgcGFyYWxsZWxpemVkLlxcbicgK1xuICAgICAgICAgICAgICAgICdEaXNhYmxpbmcgYXN5bmNocm9ub3VzIGNvbXBpbGF0aW9uIG1heSBiZSB1c2VmdWwgZm9yIGRlYnVnZ2luZy4nLFxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5vcHRpb24oJ2wnLCB7XG4gICAgICAgICAgICBhbGlhczogJ2xvZ2xldmVsJyxcbiAgICAgICAgICAgIGRlc2NyaWJlOiAnVGhlIGxvd2VzdCBzZXZlcml0eSBsb2dnaW5nIG1lc3NhZ2UgdGhhdCBzaG91bGQgYmUgb3V0cHV0LicsXG4gICAgICAgICAgICBjaG9pY2VzOiBbJ2RlYnVnJywgJ2luZm8nLCAnd2FybicsICdlcnJvciddLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmhlbHAoKVxuICAgICAgICAgIC5wYXJzZShhcmdzKTtcblxuICBpZiAob3B0aW9uc1snZiddICYmIG9wdGlvbnNbJ2YnXS5sZW5ndGgpIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAnVGhlIGZvcm1hdHMgb3B0aW9uICgtZi8tLWZvcm1hdHMpIGhhcyBiZWVuIHJlbW92ZWQuIENvbnNpZGVyIHRoZSBwcm9wZXJ0aWVzIG9wdGlvbiAoLXAvLS1wcm9wZXJ0aWVzKSBpbnN0ZWFkLicpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIHNldEZpbGVTeXN0ZW0obmV3IENhY2hlZEZpbGVTeXN0ZW0obmV3IE5vZGVKU0ZpbGVTeXN0ZW0oKSkpO1xuXG4gIGNvbnN0IGJhc2VTb3VyY2VQYXRoID0gcmVzb2x2ZShvcHRpb25zWydzJ10gfHwgJy4vbm9kZV9tb2R1bGVzJyk7XG4gIGNvbnN0IHByb3BlcnRpZXNUb0NvbnNpZGVyOiBzdHJpbmdbXSA9IG9wdGlvbnNbJ3AnXTtcbiAgY29uc3QgdGFyZ2V0RW50cnlQb2ludFBhdGggPSBvcHRpb25zWyd0J10gPyBvcHRpb25zWyd0J10gOiB1bmRlZmluZWQ7XG4gIGNvbnN0IGNvbXBpbGVBbGxGb3JtYXRzID0gIW9wdGlvbnNbJ2ZpcnN0LW9ubHknXTtcbiAgY29uc3QgY3JlYXRlTmV3RW50cnlQb2ludEZvcm1hdHMgPSBvcHRpb25zWydjcmVhdGUtaXZ5LWVudHJ5LXBvaW50cyddO1xuICBjb25zdCBsb2dMZXZlbCA9IG9wdGlvbnNbJ2wnXSBhcyBrZXlvZiB0eXBlb2YgTG9nTGV2ZWwgfCB1bmRlZmluZWQ7XG4gIGNvbnN0IGVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQgPSBvcHRpb25zWydsZWdhY3ktbWVzc2FnZS1pZHMnXTtcblxuICAoYXN5bmMoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGxvZ2dlciA9IGxvZ0xldmVsICYmIG5ldyBDb25zb2xlTG9nZ2VyKExvZ0xldmVsW2xvZ0xldmVsXSk7XG5cbiAgICAgIGF3YWl0IG1haW5OZ2NjKHtcbiAgICAgICAgYmFzZVBhdGg6IGJhc2VTb3VyY2VQYXRoLFxuICAgICAgICBwcm9wZXJ0aWVzVG9Db25zaWRlcixcbiAgICAgICAgdGFyZ2V0RW50cnlQb2ludFBhdGgsXG4gICAgICAgIGNvbXBpbGVBbGxGb3JtYXRzLFxuICAgICAgICBjcmVhdGVOZXdFbnRyeVBvaW50Rm9ybWF0cyxcbiAgICAgICAgbG9nZ2VyLFxuICAgICAgICBlbmFibGVJMThuTGVnYWN5TWVzc2FnZUlkRm9ybWF0LFxuICAgICAgICBhc3luYzogb3B0aW9uc1snYXN5bmMnXSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAobG9nZ2VyKSB7XG4gICAgICAgIGNvbnN0IGR1cmF0aW9uID0gTWF0aC5yb3VuZCgoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSkgLyAxMDAwKTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKGBSdW4gbmdjYyBpbiAke2R1cmF0aW9ufXMuYCk7XG4gICAgICB9XG5cbiAgICAgIHByb2Nlc3MuZXhpdENvZGUgPSAwO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZS5zdGFjayB8fCBlLm1lc3NhZ2UpO1xuICAgICAgcHJvY2Vzcy5leGl0Q29kZSA9IDE7XG4gICAgfVxuICB9KSgpO1xufVxuIl19