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
        define("@angular/compiler-cli/src/ngtsc/imports/src/alias", ["require", "exports", "@angular/compiler", "@angular/compiler-cli/src/ngtsc/imports/src/emitter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var compiler_1 = require("@angular/compiler");
    var emitter_1 = require("@angular/compiler-cli/src/ngtsc/imports/src/emitter");
    // Escape anything that isn't alphanumeric, '/' or '_'.
    var CHARS_TO_ESCAPE = /[^a-zA-Z0-9/_]/g;
    /**
     * An `AliasingHost` which generates and consumes alias re-exports when module names for each file
     * are determined by a `UnifiedModulesHost`.
     *
     * When using a `UnifiedModulesHost`, aliasing prevents issues with transitive dependencies. See the
     * README.md for more details.
     */
    var UnifiedModulesAliasingHost = /** @class */ (function () {
        function UnifiedModulesAliasingHost(unifiedModulesHost) {
            this.unifiedModulesHost = unifiedModulesHost;
            /**
             * With a `UnifiedModulesHost`, aliases are chosen automatically without the need to look through
             * the exports present in a .d.ts file, so we can avoid cluttering the .d.ts files.
             */
            this.aliasExportsInDts = false;
        }
        UnifiedModulesAliasingHost.prototype.maybeAliasSymbolAs = function (ref, context, ngModuleName, isReExport) {
            if (!isReExport) {
                // Aliasing is used with a UnifiedModulesHost to prevent transitive dependencies. Thus,
                // aliases
                // only need to be created for directives/pipes which are not direct declarations of an
                // NgModule which exports them.
                return null;
            }
            return this.aliasName(ref.node, context);
        };
        /**
         * Generates an `Expression` to import `decl` from `via`, assuming an export was added when `via`
         * was compiled per `maybeAliasSymbolAs` above.
         */
        UnifiedModulesAliasingHost.prototype.getAliasIn = function (decl, via, isReExport) {
            if (!isReExport) {
                // Directly exported directives/pipes don't require an alias, per the logic in
                // `maybeAliasSymbolAs`.
                return null;
            }
            // viaModule is the module it'll actually be imported from.
            var moduleName = this.unifiedModulesHost.fileNameToModuleName(via.fileName, via.fileName);
            return new compiler_1.ExternalExpr({ moduleName: moduleName, name: this.aliasName(decl, via) });
        };
        /**
         * Generates an alias name based on the full module name of the file which declares the aliased
         * directive/pipe.
         */
        UnifiedModulesAliasingHost.prototype.aliasName = function (decl, context) {
            // The declared module is used to get the name of the alias.
            var declModule = this.unifiedModulesHost.fileNameToModuleName(decl.getSourceFile().fileName, context.fileName);
            var replaced = declModule.replace(CHARS_TO_ESCAPE, '_').replace(/\//g, '$');
            return 'ɵng$' + replaced + '$$' + decl.name.text;
        };
        return UnifiedModulesAliasingHost;
    }());
    exports.UnifiedModulesAliasingHost = UnifiedModulesAliasingHost;
    /**
     * An `AliasingHost` which exports directives from any file containing an NgModule in which they're
     * declared/exported, under a private symbol name.
     *
     * These exports support cases where an NgModule is imported deeply from an absolute module path
     * (that is, it's not part of an Angular Package Format entrypoint), and the compiler needs to
     * import any matched directives/pipes from the same path (to the NgModule file). See README.md for
     * more details.
     */
    var PrivateExportAliasingHost = /** @class */ (function () {
        function PrivateExportAliasingHost(host) {
            this.host = host;
            /**
             * Under private export aliasing, the `AbsoluteModuleStrategy` used for emitting references will
             * will select aliased exports that it finds in the .d.ts file for an NgModule's file. Thus,
             * emitting these exports in .d.ts is a requirement for the `PrivateExportAliasingHost` to
             * function correctly.
             */
            this.aliasExportsInDts = true;
        }
        PrivateExportAliasingHost.prototype.maybeAliasSymbolAs = function (ref, context, ngModuleName) {
            if (ref.hasOwningModuleGuess) {
                // Skip nodes that already have an associated absolute module specifier, since they can be
                // safely imported from that specifier.
                return null;
            }
            // Look for a user-provided export of `decl` in `context`. If one exists, then an alias export
            // is not needed.
            // TODO(alxhub): maybe add a host method to check for the existence of an export without going
            // through the entire list of exports.
            var exports = this.host.getExportsOfModule(context);
            if (exports === null) {
                // Something went wrong, and no exports were available at all. Bail rather than risk creating
                // re-exports when they're not needed.
                throw new Error("Could not determine the exports of: " + context.fileName);
            }
            var found = false;
            exports.forEach(function (value) {
                if (value.node === ref.node) {
                    found = true;
                }
            });
            if (found) {
                // The module exports the declared class directly, no alias is necessary.
                return null;
            }
            return "\u0275ngExport\u0275" + ngModuleName + "\u0275" + ref.node.name.text;
        };
        /**
         * A `PrivateExportAliasingHost` only generates re-exports and does not direct the compiler to
         * directly consume the aliases it creates.
         *
         * Instead, they're consumed indirectly: `AbsoluteModuleStrategy` `ReferenceEmitterStrategy` will
         * select these alias exports automatically when looking for an export of the directive/pipe from
         * the same path as the NgModule was imported.
         *
         * Thus, `getAliasIn` always returns `null`.
         */
        PrivateExportAliasingHost.prototype.getAliasIn = function () { return null; };
        return PrivateExportAliasingHost;
    }());
    exports.PrivateExportAliasingHost = PrivateExportAliasingHost;
    /**
     * A `ReferenceEmitStrategy` which will consume the alias attached to a particular `Reference` to a
     * directive or pipe, if it exists.
     */
    var AliasStrategy = /** @class */ (function () {
        function AliasStrategy() {
        }
        AliasStrategy.prototype.emit = function (ref, context, importMode) {
            if (importMode & emitter_1.ImportFlags.NoAliasing) {
                return null;
            }
            return ref.alias;
        };
        return AliasStrategy;
    }());
    exports.AliasStrategy = AliasStrategy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpYXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2ltcG9ydHMvc3JjL2FsaWFzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgsOENBQTJEO0lBTTNELCtFQUE2RDtJQUs3RCx1REFBdUQ7SUFDdkQsSUFBTSxlQUFlLEdBQUcsaUJBQWlCLENBQUM7SUFtRTFDOzs7Ozs7T0FNRztJQUNIO1FBQ0Usb0NBQW9CLGtCQUFzQztZQUF0Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBRTFEOzs7ZUFHRztZQUNNLHNCQUFpQixHQUFHLEtBQUssQ0FBQztRQU4wQixDQUFDO1FBUTlELHVEQUFrQixHQUFsQixVQUNJLEdBQWdDLEVBQUUsT0FBc0IsRUFBRSxZQUFvQixFQUM5RSxVQUFtQjtZQUNyQixJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNmLHVGQUF1RjtnQkFDdkYsVUFBVTtnQkFDVix1RkFBdUY7Z0JBQ3ZGLCtCQUErQjtnQkFDL0IsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFRDs7O1dBR0c7UUFDSCwrQ0FBVSxHQUFWLFVBQVcsSUFBc0IsRUFBRSxHQUFrQixFQUFFLFVBQW1CO1lBQ3hFLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2YsOEVBQThFO2dCQUM5RSx3QkFBd0I7Z0JBQ3hCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCwyREFBMkQ7WUFDM0QsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVGLE9BQU8sSUFBSSx1QkFBWSxDQUFDLEVBQUMsVUFBVSxZQUFBLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFDLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRUQ7OztXQUdHO1FBQ0ssOENBQVMsR0FBakIsVUFBa0IsSUFBc0IsRUFBRSxPQUFzQjtZQUM5RCw0REFBNEQ7WUFDNUQsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixDQUMzRCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVyRCxJQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzlFLE9BQU8sTUFBTSxHQUFHLFFBQVEsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbkQsQ0FBQztRQUNILGlDQUFDO0lBQUQsQ0FBQyxBQWpERCxJQWlEQztJQWpEWSxnRUFBMEI7SUFtRHZDOzs7Ozs7OztPQVFHO0lBQ0g7UUFDRSxtQ0FBb0IsSUFBb0I7WUFBcEIsU0FBSSxHQUFKLElBQUksQ0FBZ0I7WUFFeEM7Ozs7O2VBS0c7WUFDTSxzQkFBaUIsR0FBRyxJQUFJLENBQUM7UUFSUyxDQUFDO1FBVTVDLHNEQUFrQixHQUFsQixVQUNJLEdBQWdDLEVBQUUsT0FBc0IsRUFBRSxZQUFvQjtZQUNoRixJQUFJLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRTtnQkFDNUIsMEZBQTBGO2dCQUMxRix1Q0FBdUM7Z0JBQ3ZDLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCw4RkFBOEY7WUFDOUYsaUJBQWlCO1lBQ2pCLDhGQUE4RjtZQUM5RixzQ0FBc0M7WUFDdEMsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0RCxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7Z0JBQ3BCLDZGQUE2RjtnQkFDN0Ysc0NBQXNDO2dCQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLHlDQUF1QyxPQUFPLENBQUMsUUFBVSxDQUFDLENBQUM7YUFDNUU7WUFDRCxJQUFJLEtBQUssR0FBWSxLQUFLLENBQUM7WUFDM0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUs7Z0JBQ25CLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxFQUFFO29CQUMzQixLQUFLLEdBQUcsSUFBSSxDQUFDO2lCQUNkO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLEtBQUssRUFBRTtnQkFDVCx5RUFBeUU7Z0JBQ3pFLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxPQUFPLHlCQUFhLFlBQVksY0FBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFNLENBQUM7UUFDM0QsQ0FBQztRQUVEOzs7Ozs7Ozs7V0FTRztRQUNILDhDQUFVLEdBQVYsY0FBcUIsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLGdDQUFDO0lBQUQsQ0FBQyxBQXBERCxJQW9EQztJQXBEWSw4REFBeUI7SUFzRHRDOzs7T0FHRztJQUNIO1FBQUE7UUFRQSxDQUFDO1FBUEMsNEJBQUksR0FBSixVQUFLLEdBQXVCLEVBQUUsT0FBc0IsRUFBRSxVQUF1QjtZQUMzRSxJQUFJLFVBQVUsR0FBRyxxQkFBVyxDQUFDLFVBQVUsRUFBRTtnQkFDdkMsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO1FBQ0gsb0JBQUM7SUFBRCxDQUFDLEFBUkQsSUFRQztJQVJZLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0V4cHJlc3Npb24sIEV4dGVybmFsRXhwcn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7VW5pZmllZE1vZHVsZXNIb3N0fSBmcm9tICcuLi8uLi9jb3JlL2FwaSc7XG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb24sIFJlZmxlY3Rpb25Ib3N0LCBpc05hbWVkQ2xhc3NEZWNsYXJhdGlvbn0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5cbmltcG9ydCB7SW1wb3J0RmxhZ3MsIFJlZmVyZW5jZUVtaXRTdHJhdGVneX0gZnJvbSAnLi9lbWl0dGVyJztcbmltcG9ydCB7UmVmZXJlbmNlfSBmcm9tICcuL3JlZmVyZW5jZXMnO1xuXG5cblxuLy8gRXNjYXBlIGFueXRoaW5nIHRoYXQgaXNuJ3QgYWxwaGFudW1lcmljLCAnLycgb3IgJ18nLlxuY29uc3QgQ0hBUlNfVE9fRVNDQVBFID0gL1teYS16QS1aMC05L19dL2c7XG5cbi8qKlxuICogQSBob3N0IGZvciB0aGUgYWxpYXNpbmcgc3lzdGVtLCB3aGljaCBhbGxvd3MgZm9yIGFsdGVybmF0aXZlIGV4cG9ydHMvaW1wb3J0cyBvZiBkaXJlY3RpdmVzL3BpcGVzLlxuICpcbiAqIEdpdmVuIGFuIGltcG9ydCBvZiBhbiBOZ01vZHVsZSAoZS5nLiBgQ29tbW9uTW9kdWxlYCksIHRoZSBjb21waWxlciBtdXN0IGdlbmVyYXRlIGltcG9ydHMgdG8gdGhlXG4gKiBkaXJlY3RpdmVzIGFuZCBwaXBlcyBleHBvcnRlZCBieSB0aGlzIG1vZHVsZSAoZS5nLiBgTmdJZmApIHdoZW4gdGhleSdyZSB1c2VkIGluIGEgcGFydGljdWxhclxuICogdGVtcGxhdGUuIEluIGl0cyBkZWZhdWx0IGNvbmZpZ3VyYXRpb24sIGlmIHRoZSBjb21waWxlciBpcyBub3QgZGlyZWN0bHkgYWJsZSB0byBpbXBvcnQgdGhlXG4gKiBjb21wb25lbnQgZnJvbSBhbm90aGVyIGZpbGUgd2l0aGluIHRoZSBzYW1lIHByb2plY3QsIGl0IHdpbGwgYXR0ZW1wdCB0byBpbXBvcnQgdGhlIGNvbXBvbmVudFxuICogZnJvbSB0aGUgc2FtZSAoYWJzb2x1dGUpIHBhdGggYnkgd2hpY2ggdGhlIG1vZHVsZSB3YXMgaW1wb3J0ZWQuIFNvIGluIHRoZSBhYm92ZSBleGFtcGxlIGlmXG4gKiBgQ29tbW9uTW9kdWxlYCB3YXMgaW1wb3J0ZWQgZnJvbSAnQGFuZ3VsYXIvY29tbW9uJywgdGhlIGNvbXBpbGVyIHdpbGwgYXR0ZW1wdCB0byBpbXBvcnQgYE5nSWZgXG4gKiBmcm9tICdAYW5ndWxhci9jb21tb24nIGFzIHdlbGwuXG4gKlxuICogVGhlIGFsaWFzaW5nIHN5c3RlbSBpbnRlcmFjdHMgd2l0aCB0aGUgYWJvdmUgbG9naWMgaW4gdHdvIGRpc3RpbmN0IHdheXMuXG4gKlxuICogMSkgSXQgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIFwiYWxpYXNcIiByZS1leHBvcnRzIGZyb20gZGlmZmVyZW50IGZpbGVzLCB3aGljaCBjYW4gYmUgdXNlZCB3aGVuIHRoZVxuICogICAgdXNlciBoYXNuJ3QgZXhwb3J0ZWQgdGhlIGRpcmVjdGl2ZShzKSBmcm9tIHRoZSBFUyBtb2R1bGUgY29udGFpbmluZyB0aGUgTmdNb2R1bGUuIFRoZXNlIHJlLVxuICogICAgZXhwb3J0cyBjYW4gYWxzbyBiZSBoZWxwZnVsIHdoZW4gdXNpbmcgYSBgVW5pZmllZE1vZHVsZXNIb3N0YCwgd2hpY2ggb3ZlcnJpZGVzIHRoZSBpbXBvcnRcbiAqICAgIGxvZ2ljIGRlc2NyaWJlZCBhYm92ZS5cbiAqXG4gKiAyKSBJdCBjYW4gYmUgdXNlZCB0byBnZXQgYW4gYWx0ZXJuYXRpdmUgaW1wb3J0IGV4cHJlc3Npb24gZm9yIGEgZGlyZWN0aXZlIG9yIHBpcGUsIGluc3RlYWQgb2ZcbiAqICAgIHRoZSBpbXBvcnQgdGhhdCB0aGUgbm9ybWFsIGxvZ2ljIHdvdWxkIGFwcGx5LiBUaGUgYWxpYXMgdXNlZCBkZXBlbmRzIG9uIHRoZSBwcm92ZW5hbmNlIG9mIHRoZVxuICogICAgYFJlZmVyZW5jZWAgd2hpY2ggd2FzIG9idGFpbmVkIGZvciB0aGUgZGlyZWN0aXZlL3BpcGUsIHdoaWNoIGlzIHVzdWFsbHkgYSBwcm9wZXJ0eSBvZiBob3cgaXRcbiAqICAgIGNhbWUgdG8gYmUgaW4gYSB0ZW1wbGF0ZSdzIHNjb3BlIChlLmcuIGJ5IHdoaWNoIE5nTW9kdWxlKS5cbiAqXG4gKiBTZWUgdGhlIFJFQURNRS5tZCBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBob3cgYWxpYXNpbmcgd29ya3Mgd2l0aGluIHRoZSBjb21waWxlci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbGlhc2luZ0hvc3Qge1xuICAvKipcbiAgICogQ29udHJvbHMgd2hldGhlciBhbnkgYWxpYXMgcmUtZXhwb3J0cyBhcmUgcmVuZGVyZWQgaW50byAuZC50cyBmaWxlcy5cbiAgICpcbiAgICogVGhpcyBpcyBub3QgYWx3YXlzIG5lY2Vzc2FyeSBmb3IgYWxpYXNpbmcgdG8gZnVuY3Rpb24gY29ycmVjdGx5LCBzbyB0aGlzIGZsYWcgYWxsb3dzIGFuXG4gICAqIGBBbGlhc2luZ0hvc3RgIHRvIGF2b2lkIGNsdXR0ZXJpbmcgdGhlIC5kLnRzIGZpbGVzIGlmIGV4cG9ydHMgYXJlIG5vdCBzdHJpY3RseSBuZWVkZWQuXG4gICAqL1xuICByZWFkb25seSBhbGlhc0V4cG9ydHNJbkR0czogYm9vbGVhbjtcblxuICAvKipcbiAgICogRGV0ZXJtaW5lIGEgbmFtZSBieSB3aGljaCBgZGVjbGAgc2hvdWxkIGJlIHJlLWV4cG9ydGVkIGZyb20gYGNvbnRleHRgLCBkZXBlbmRpbmcgb24gdGhlXG4gICAqIHBhcnRpY3VsYXIgc2V0IG9mIGFsaWFzaW5nIHJ1bGVzIGluIHBsYWNlLlxuICAgKlxuICAgKiBgbWF5YmVBbGlhc1N5bWJvbEFzYCBjYW4gcmV0dXJuIGBudWxsYCwgaW4gd2hpY2ggY2FzZSBubyBhbGlhcyBleHBvcnQgc2hvdWxkIGJlIGdlbmVyYXRlZC5cbiAgICpcbiAgICogQHBhcmFtIHJlZiBhIGBSZWZlcmVuY2VgIHRvIHRoZSBkaXJlY3RpdmUvcGlwZSB0byBjb25zaWRlciBmb3IgYWxpYXNpbmcuXG4gICAqIEBwYXJhbSBjb250ZXh0IHRoZSBgdHMuU291cmNlRmlsZWAgaW4gd2hpY2ggdGhlIGFsaWFzIHJlLWV4cG9ydCBtaWdodCBuZWVkIHRvIGJlIGdlbmVyYXRlZC5cbiAgICogQHBhcmFtIG5nTW9kdWxlTmFtZSB0aGUgZGVjbGFyZWQgbmFtZSBvZiB0aGUgYE5nTW9kdWxlYCB3aXRoaW4gYGNvbnRleHRgIGZvciB3aGljaCB0aGUgYWxpYXNcbiAgICogd291bGQgYmUgZ2VuZXJhdGVkLlxuICAgKiBAcGFyYW0gaXNSZUV4cG9ydCB3aGV0aGVyIHRoZSBkaXJlY3RpdmUvcGlwZSB1bmRlciBjb25zaWRlcmF0aW9uIGlzIHJlLWV4cG9ydGVkIGZyb20gYW5vdGhlclxuICAgKiBOZ01vZHVsZSAoYXMgb3Bwb3NlZCB0byBiZWluZyBkZWNsYXJlZCBieSBpdCBkaXJlY3RseSkuXG4gICAqL1xuICBtYXliZUFsaWFzU3ltYm9sQXMoXG4gICAgICByZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPiwgY29udGV4dDogdHMuU291cmNlRmlsZSwgbmdNb2R1bGVOYW1lOiBzdHJpbmcsXG4gICAgICBpc1JlRXhwb3J0OiBib29sZWFuKTogc3RyaW5nfG51bGw7XG5cbiAgLyoqXG4gICAqIERldGVybWluZSBhbiBgRXhwcmVzc2lvbmAgYnkgd2hpY2ggYGRlY2xgIHNob3VsZCBiZSBpbXBvcnRlZCBmcm9tIGB2aWFgIHVzaW5nIGFuIGFsaWFzIGV4cG9ydFxuICAgKiAod2hpY2ggc2hvdWxkIGhhdmUgYmVlbiBwcmV2aW91c2x5IGNyZWF0ZWQgd2hlbiBjb21waWxpbmcgYHZpYWApLlxuICAgKlxuICAgKiBgZ2V0QWxpYXNJbmAgY2FuIHJldHVybiBgbnVsbGAsIGluIHdoaWNoIGNhc2Ugbm8gYWxpYXMgaXMgbmVlZGVkIHRvIGltcG9ydCBgZGVjbGAgZnJvbSBgdmlhYFxuICAgKiAoYW5kIHRoZSBub3JtYWwgaW1wb3J0IHJ1bGVzIHNob3VsZCBiZSB1c2VkKS5cbiAgICpcbiAgICogQHBhcmFtIGRlY2wgdGhlIGRlY2xhcmF0aW9uIG9mIHRoZSBkaXJlY3RpdmUvcGlwZSB3aGljaCBpcyBiZWluZyBpbXBvcnRlZCwgYW5kIHdoaWNoIG1pZ2h0IGJlXG4gICAqIGFsaWFzZWQuXG4gICAqIEBwYXJhbSB2aWEgdGhlIGB0cy5Tb3VyY2VGaWxlYCB3aGljaCBtaWdodCBjb250YWluIGFuIGFsaWFzIHRvIHRoZVxuICAgKi9cbiAgZ2V0QWxpYXNJbihkZWNsOiBDbGFzc0RlY2xhcmF0aW9uLCB2aWE6IHRzLlNvdXJjZUZpbGUsIGlzUmVFeHBvcnQ6IGJvb2xlYW4pOiBFeHByZXNzaW9ufG51bGw7XG59XG5cbi8qKlxuICogQW4gYEFsaWFzaW5nSG9zdGAgd2hpY2ggZ2VuZXJhdGVzIGFuZCBjb25zdW1lcyBhbGlhcyByZS1leHBvcnRzIHdoZW4gbW9kdWxlIG5hbWVzIGZvciBlYWNoIGZpbGVcbiAqIGFyZSBkZXRlcm1pbmVkIGJ5IGEgYFVuaWZpZWRNb2R1bGVzSG9zdGAuXG4gKlxuICogV2hlbiB1c2luZyBhIGBVbmlmaWVkTW9kdWxlc0hvc3RgLCBhbGlhc2luZyBwcmV2ZW50cyBpc3N1ZXMgd2l0aCB0cmFuc2l0aXZlIGRlcGVuZGVuY2llcy4gU2VlIHRoZVxuICogUkVBRE1FLm1kIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBVbmlmaWVkTW9kdWxlc0FsaWFzaW5nSG9zdCBpbXBsZW1lbnRzIEFsaWFzaW5nSG9zdCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgdW5pZmllZE1vZHVsZXNIb3N0OiBVbmlmaWVkTW9kdWxlc0hvc3QpIHt9XG5cbiAgLyoqXG4gICAqIFdpdGggYSBgVW5pZmllZE1vZHVsZXNIb3N0YCwgYWxpYXNlcyBhcmUgY2hvc2VuIGF1dG9tYXRpY2FsbHkgd2l0aG91dCB0aGUgbmVlZCB0byBsb29rIHRocm91Z2hcbiAgICogdGhlIGV4cG9ydHMgcHJlc2VudCBpbiBhIC5kLnRzIGZpbGUsIHNvIHdlIGNhbiBhdm9pZCBjbHV0dGVyaW5nIHRoZSAuZC50cyBmaWxlcy5cbiAgICovXG4gIHJlYWRvbmx5IGFsaWFzRXhwb3J0c0luRHRzID0gZmFsc2U7XG5cbiAgbWF5YmVBbGlhc1N5bWJvbEFzKFxuICAgICAgcmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4sIGNvbnRleHQ6IHRzLlNvdXJjZUZpbGUsIG5nTW9kdWxlTmFtZTogc3RyaW5nLFxuICAgICAgaXNSZUV4cG9ydDogYm9vbGVhbik6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAoIWlzUmVFeHBvcnQpIHtcbiAgICAgIC8vIEFsaWFzaW5nIGlzIHVzZWQgd2l0aCBhIFVuaWZpZWRNb2R1bGVzSG9zdCB0byBwcmV2ZW50IHRyYW5zaXRpdmUgZGVwZW5kZW5jaWVzLiBUaHVzLFxuICAgICAgLy8gYWxpYXNlc1xuICAgICAgLy8gb25seSBuZWVkIHRvIGJlIGNyZWF0ZWQgZm9yIGRpcmVjdGl2ZXMvcGlwZXMgd2hpY2ggYXJlIG5vdCBkaXJlY3QgZGVjbGFyYXRpb25zIG9mIGFuXG4gICAgICAvLyBOZ01vZHVsZSB3aGljaCBleHBvcnRzIHRoZW0uXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYWxpYXNOYW1lKHJlZi5ub2RlLCBjb250ZXh0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYW4gYEV4cHJlc3Npb25gIHRvIGltcG9ydCBgZGVjbGAgZnJvbSBgdmlhYCwgYXNzdW1pbmcgYW4gZXhwb3J0IHdhcyBhZGRlZCB3aGVuIGB2aWFgXG4gICAqIHdhcyBjb21waWxlZCBwZXIgYG1heWJlQWxpYXNTeW1ib2xBc2AgYWJvdmUuXG4gICAqL1xuICBnZXRBbGlhc0luKGRlY2w6IENsYXNzRGVjbGFyYXRpb24sIHZpYTogdHMuU291cmNlRmlsZSwgaXNSZUV4cG9ydDogYm9vbGVhbik6IEV4cHJlc3Npb258bnVsbCB7XG4gICAgaWYgKCFpc1JlRXhwb3J0KSB7XG4gICAgICAvLyBEaXJlY3RseSBleHBvcnRlZCBkaXJlY3RpdmVzL3BpcGVzIGRvbid0IHJlcXVpcmUgYW4gYWxpYXMsIHBlciB0aGUgbG9naWMgaW5cbiAgICAgIC8vIGBtYXliZUFsaWFzU3ltYm9sQXNgLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIHZpYU1vZHVsZSBpcyB0aGUgbW9kdWxlIGl0J2xsIGFjdHVhbGx5IGJlIGltcG9ydGVkIGZyb20uXG4gICAgY29uc3QgbW9kdWxlTmFtZSA9IHRoaXMudW5pZmllZE1vZHVsZXNIb3N0LmZpbGVOYW1lVG9Nb2R1bGVOYW1lKHZpYS5maWxlTmFtZSwgdmlhLmZpbGVOYW1lKTtcbiAgICByZXR1cm4gbmV3IEV4dGVybmFsRXhwcih7bW9kdWxlTmFtZSwgbmFtZTogdGhpcy5hbGlhc05hbWUoZGVjbCwgdmlhKX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlcyBhbiBhbGlhcyBuYW1lIGJhc2VkIG9uIHRoZSBmdWxsIG1vZHVsZSBuYW1lIG9mIHRoZSBmaWxlIHdoaWNoIGRlY2xhcmVzIHRoZSBhbGlhc2VkXG4gICAqIGRpcmVjdGl2ZS9waXBlLlxuICAgKi9cbiAgcHJpdmF0ZSBhbGlhc05hbWUoZGVjbDogQ2xhc3NEZWNsYXJhdGlvbiwgY29udGV4dDogdHMuU291cmNlRmlsZSk6IHN0cmluZyB7XG4gICAgLy8gVGhlIGRlY2xhcmVkIG1vZHVsZSBpcyB1c2VkIHRvIGdldCB0aGUgbmFtZSBvZiB0aGUgYWxpYXMuXG4gICAgY29uc3QgZGVjbE1vZHVsZSA9IHRoaXMudW5pZmllZE1vZHVsZXNIb3N0LmZpbGVOYW1lVG9Nb2R1bGVOYW1lKFxuICAgICAgICBkZWNsLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZSwgY29udGV4dC5maWxlTmFtZSk7XG5cbiAgICBjb25zdCByZXBsYWNlZCA9IGRlY2xNb2R1bGUucmVwbGFjZShDSEFSU19UT19FU0NBUEUsICdfJykucmVwbGFjZSgvXFwvL2csICckJyk7XG4gICAgcmV0dXJuICfJtW5nJCcgKyByZXBsYWNlZCArICckJCcgKyBkZWNsLm5hbWUudGV4dDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGBBbGlhc2luZ0hvc3RgIHdoaWNoIGV4cG9ydHMgZGlyZWN0aXZlcyBmcm9tIGFueSBmaWxlIGNvbnRhaW5pbmcgYW4gTmdNb2R1bGUgaW4gd2hpY2ggdGhleSdyZVxuICogZGVjbGFyZWQvZXhwb3J0ZWQsIHVuZGVyIGEgcHJpdmF0ZSBzeW1ib2wgbmFtZS5cbiAqXG4gKiBUaGVzZSBleHBvcnRzIHN1cHBvcnQgY2FzZXMgd2hlcmUgYW4gTmdNb2R1bGUgaXMgaW1wb3J0ZWQgZGVlcGx5IGZyb20gYW4gYWJzb2x1dGUgbW9kdWxlIHBhdGhcbiAqICh0aGF0IGlzLCBpdCdzIG5vdCBwYXJ0IG9mIGFuIEFuZ3VsYXIgUGFja2FnZSBGb3JtYXQgZW50cnlwb2ludCksIGFuZCB0aGUgY29tcGlsZXIgbmVlZHMgdG9cbiAqIGltcG9ydCBhbnkgbWF0Y2hlZCBkaXJlY3RpdmVzL3BpcGVzIGZyb20gdGhlIHNhbWUgcGF0aCAodG8gdGhlIE5nTW9kdWxlIGZpbGUpLiBTZWUgUkVBRE1FLm1kIGZvclxuICogbW9yZSBkZXRhaWxzLlxuICovXG5leHBvcnQgY2xhc3MgUHJpdmF0ZUV4cG9ydEFsaWFzaW5nSG9zdCBpbXBsZW1lbnRzIEFsaWFzaW5nSG9zdCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaG9zdDogUmVmbGVjdGlvbkhvc3QpIHt9XG5cbiAgLyoqXG4gICAqIFVuZGVyIHByaXZhdGUgZXhwb3J0IGFsaWFzaW5nLCB0aGUgYEFic29sdXRlTW9kdWxlU3RyYXRlZ3lgIHVzZWQgZm9yIGVtaXR0aW5nIHJlZmVyZW5jZXMgd2lsbFxuICAgKiB3aWxsIHNlbGVjdCBhbGlhc2VkIGV4cG9ydHMgdGhhdCBpdCBmaW5kcyBpbiB0aGUgLmQudHMgZmlsZSBmb3IgYW4gTmdNb2R1bGUncyBmaWxlLiBUaHVzLFxuICAgKiBlbWl0dGluZyB0aGVzZSBleHBvcnRzIGluIC5kLnRzIGlzIGEgcmVxdWlyZW1lbnQgZm9yIHRoZSBgUHJpdmF0ZUV4cG9ydEFsaWFzaW5nSG9zdGAgdG9cbiAgICogZnVuY3Rpb24gY29ycmVjdGx5LlxuICAgKi9cbiAgcmVhZG9ubHkgYWxpYXNFeHBvcnRzSW5EdHMgPSB0cnVlO1xuXG4gIG1heWJlQWxpYXNTeW1ib2xBcyhcbiAgICAgIHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+LCBjb250ZXh0OiB0cy5Tb3VyY2VGaWxlLCBuZ01vZHVsZU5hbWU6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAocmVmLmhhc093bmluZ01vZHVsZUd1ZXNzKSB7XG4gICAgICAvLyBTa2lwIG5vZGVzIHRoYXQgYWxyZWFkeSBoYXZlIGFuIGFzc29jaWF0ZWQgYWJzb2x1dGUgbW9kdWxlIHNwZWNpZmllciwgc2luY2UgdGhleSBjYW4gYmVcbiAgICAgIC8vIHNhZmVseSBpbXBvcnRlZCBmcm9tIHRoYXQgc3BlY2lmaWVyLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIExvb2sgZm9yIGEgdXNlci1wcm92aWRlZCBleHBvcnQgb2YgYGRlY2xgIGluIGBjb250ZXh0YC4gSWYgb25lIGV4aXN0cywgdGhlbiBhbiBhbGlhcyBleHBvcnRcbiAgICAvLyBpcyBub3QgbmVlZGVkLlxuICAgIC8vIFRPRE8oYWx4aHViKTogbWF5YmUgYWRkIGEgaG9zdCBtZXRob2QgdG8gY2hlY2sgZm9yIHRoZSBleGlzdGVuY2Ugb2YgYW4gZXhwb3J0IHdpdGhvdXQgZ29pbmdcbiAgICAvLyB0aHJvdWdoIHRoZSBlbnRpcmUgbGlzdCBvZiBleHBvcnRzLlxuICAgIGNvbnN0IGV4cG9ydHMgPSB0aGlzLmhvc3QuZ2V0RXhwb3J0c09mTW9kdWxlKGNvbnRleHQpO1xuICAgIGlmIChleHBvcnRzID09PSBudWxsKSB7XG4gICAgICAvLyBTb21ldGhpbmcgd2VudCB3cm9uZywgYW5kIG5vIGV4cG9ydHMgd2VyZSBhdmFpbGFibGUgYXQgYWxsLiBCYWlsIHJhdGhlciB0aGFuIHJpc2sgY3JlYXRpbmdcbiAgICAgIC8vIHJlLWV4cG9ydHMgd2hlbiB0aGV5J3JlIG5vdCBuZWVkZWQuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBkZXRlcm1pbmUgdGhlIGV4cG9ydHMgb2Y6ICR7Y29udGV4dC5maWxlTmFtZX1gKTtcbiAgICB9XG4gICAgbGV0IGZvdW5kOiBib29sZWFuID0gZmFsc2U7XG4gICAgZXhwb3J0cy5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgIGlmICh2YWx1ZS5ub2RlID09PSByZWYubm9kZSkge1xuICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKGZvdW5kKSB7XG4gICAgICAvLyBUaGUgbW9kdWxlIGV4cG9ydHMgdGhlIGRlY2xhcmVkIGNsYXNzIGRpcmVjdGx5LCBubyBhbGlhcyBpcyBuZWNlc3NhcnkuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGDJtW5nRXhwb3J0ybUke25nTW9kdWxlTmFtZX3JtSR7cmVmLm5vZGUubmFtZS50ZXh0fWA7XG4gIH1cblxuICAvKipcbiAgICogQSBgUHJpdmF0ZUV4cG9ydEFsaWFzaW5nSG9zdGAgb25seSBnZW5lcmF0ZXMgcmUtZXhwb3J0cyBhbmQgZG9lcyBub3QgZGlyZWN0IHRoZSBjb21waWxlciB0b1xuICAgKiBkaXJlY3RseSBjb25zdW1lIHRoZSBhbGlhc2VzIGl0IGNyZWF0ZXMuXG4gICAqXG4gICAqIEluc3RlYWQsIHRoZXkncmUgY29uc3VtZWQgaW5kaXJlY3RseTogYEFic29sdXRlTW9kdWxlU3RyYXRlZ3lgIGBSZWZlcmVuY2VFbWl0dGVyU3RyYXRlZ3lgIHdpbGxcbiAgICogc2VsZWN0IHRoZXNlIGFsaWFzIGV4cG9ydHMgYXV0b21hdGljYWxseSB3aGVuIGxvb2tpbmcgZm9yIGFuIGV4cG9ydCBvZiB0aGUgZGlyZWN0aXZlL3BpcGUgZnJvbVxuICAgKiB0aGUgc2FtZSBwYXRoIGFzIHRoZSBOZ01vZHVsZSB3YXMgaW1wb3J0ZWQuXG4gICAqXG4gICAqIFRodXMsIGBnZXRBbGlhc0luYCBhbHdheXMgcmV0dXJucyBgbnVsbGAuXG4gICAqL1xuICBnZXRBbGlhc0luKCk6IG51bGwgeyByZXR1cm4gbnVsbDsgfVxufVxuXG4vKipcbiAqIEEgYFJlZmVyZW5jZUVtaXRTdHJhdGVneWAgd2hpY2ggd2lsbCBjb25zdW1lIHRoZSBhbGlhcyBhdHRhY2hlZCB0byBhIHBhcnRpY3VsYXIgYFJlZmVyZW5jZWAgdG8gYVxuICogZGlyZWN0aXZlIG9yIHBpcGUsIGlmIGl0IGV4aXN0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFsaWFzU3RyYXRlZ3kgaW1wbGVtZW50cyBSZWZlcmVuY2VFbWl0U3RyYXRlZ3kge1xuICBlbWl0KHJlZjogUmVmZXJlbmNlPHRzLk5vZGU+LCBjb250ZXh0OiB0cy5Tb3VyY2VGaWxlLCBpbXBvcnRNb2RlOiBJbXBvcnRGbGFncyk6IEV4cHJlc3Npb258bnVsbCB7XG4gICAgaWYgKGltcG9ydE1vZGUgJiBJbXBvcnRGbGFncy5Ob0FsaWFzaW5nKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVmLmFsaWFzO1xuICB9XG59XG4iXX0=