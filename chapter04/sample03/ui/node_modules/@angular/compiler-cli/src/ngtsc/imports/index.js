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
        define("@angular/compiler-cli/src/ngtsc/imports", ["require", "exports", "@angular/compiler-cli/src/ngtsc/imports/src/alias", "@angular/compiler-cli/src/ngtsc/imports/src/core", "@angular/compiler-cli/src/ngtsc/imports/src/default", "@angular/compiler-cli/src/ngtsc/imports/src/emitter", "@angular/compiler-cli/src/ngtsc/imports/src/references", "@angular/compiler-cli/src/ngtsc/imports/src/resolver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var alias_1 = require("@angular/compiler-cli/src/ngtsc/imports/src/alias");
    exports.AliasStrategy = alias_1.AliasStrategy;
    exports.PrivateExportAliasingHost = alias_1.PrivateExportAliasingHost;
    exports.UnifiedModulesAliasingHost = alias_1.UnifiedModulesAliasingHost;
    var core_1 = require("@angular/compiler-cli/src/ngtsc/imports/src/core");
    exports.NoopImportRewriter = core_1.NoopImportRewriter;
    exports.R3SymbolsImportRewriter = core_1.R3SymbolsImportRewriter;
    exports.validateAndRewriteCoreSymbol = core_1.validateAndRewriteCoreSymbol;
    var default_1 = require("@angular/compiler-cli/src/ngtsc/imports/src/default");
    exports.DefaultImportTracker = default_1.DefaultImportTracker;
    exports.NOOP_DEFAULT_IMPORT_RECORDER = default_1.NOOP_DEFAULT_IMPORT_RECORDER;
    var emitter_1 = require("@angular/compiler-cli/src/ngtsc/imports/src/emitter");
    exports.AbsoluteModuleStrategy = emitter_1.AbsoluteModuleStrategy;
    exports.ImportFlags = emitter_1.ImportFlags;
    exports.LocalIdentifierStrategy = emitter_1.LocalIdentifierStrategy;
    exports.LogicalProjectStrategy = emitter_1.LogicalProjectStrategy;
    exports.ReferenceEmitter = emitter_1.ReferenceEmitter;
    exports.RelativePathStrategy = emitter_1.RelativePathStrategy;
    exports.UnifiedModulesStrategy = emitter_1.UnifiedModulesStrategy;
    var references_1 = require("@angular/compiler-cli/src/ngtsc/imports/src/references");
    exports.Reference = references_1.Reference;
    var resolver_1 = require("@angular/compiler-cli/src/ngtsc/imports/src/resolver");
    exports.ModuleResolver = resolver_1.ModuleResolver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2ltcG9ydHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCwyRUFBK0c7SUFBdkcsZ0NBQUEsYUFBYSxDQUFBO0lBQWdCLDRDQUFBLHlCQUF5QixDQUFBO0lBQUUsNkNBQUEsMEJBQTBCLENBQUE7SUFDMUYseUVBQXFIO0lBQTdGLG9DQUFBLGtCQUFrQixDQUFBO0lBQUUseUNBQUEsdUJBQXVCLENBQUE7SUFBRSw4Q0FBQSw0QkFBNEIsQ0FBQTtJQUNqRywrRUFBd0c7SUFBekUseUNBQUEsb0JBQW9CLENBQUE7SUFBRSxpREFBQSw0QkFBNEIsQ0FBQTtJQUNqRiwrRUFBME07SUFBbE0sMkNBQUEsc0JBQXNCLENBQUE7SUFBRSxnQ0FBQSxXQUFXLENBQUE7SUFBRSw0Q0FBQSx1QkFBdUIsQ0FBQTtJQUFFLDJDQUFBLHNCQUFzQixDQUFBO0lBQXlCLHFDQUFBLGdCQUFnQixDQUFBO0lBQUUseUNBQUEsb0JBQW9CLENBQUE7SUFBRSwyQ0FBQSxzQkFBc0IsQ0FBQTtJQUVuTCxxRkFBeUQ7SUFBbkMsaUNBQUEsU0FBUyxDQUFBO0lBQy9CLGlGQUE4QztJQUF0QyxvQ0FBQSxjQUFjLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCB7QWxpYXNTdHJhdGVneSwgQWxpYXNpbmdIb3N0LCBQcml2YXRlRXhwb3J0QWxpYXNpbmdIb3N0LCBVbmlmaWVkTW9kdWxlc0FsaWFzaW5nSG9zdH0gZnJvbSAnLi9zcmMvYWxpYXMnO1xuZXhwb3J0IHtJbXBvcnRSZXdyaXRlciwgTm9vcEltcG9ydFJld3JpdGVyLCBSM1N5bWJvbHNJbXBvcnRSZXdyaXRlciwgdmFsaWRhdGVBbmRSZXdyaXRlQ29yZVN5bWJvbH0gZnJvbSAnLi9zcmMvY29yZSc7XG5leHBvcnQge0RlZmF1bHRJbXBvcnRSZWNvcmRlciwgRGVmYXVsdEltcG9ydFRyYWNrZXIsIE5PT1BfREVGQVVMVF9JTVBPUlRfUkVDT1JERVJ9IGZyb20gJy4vc3JjL2RlZmF1bHQnO1xuZXhwb3J0IHtBYnNvbHV0ZU1vZHVsZVN0cmF0ZWd5LCBJbXBvcnRGbGFncywgTG9jYWxJZGVudGlmaWVyU3RyYXRlZ3ksIExvZ2ljYWxQcm9qZWN0U3RyYXRlZ3ksIFJlZmVyZW5jZUVtaXRTdHJhdGVneSwgUmVmZXJlbmNlRW1pdHRlciwgUmVsYXRpdmVQYXRoU3RyYXRlZ3ksIFVuaWZpZWRNb2R1bGVzU3RyYXRlZ3l9IGZyb20gJy4vc3JjL2VtaXR0ZXInO1xuZXhwb3J0IHtSZWV4cG9ydH0gZnJvbSAnLi9zcmMvcmVleHBvcnQnO1xuZXhwb3J0IHtPd25pbmdNb2R1bGUsIFJlZmVyZW5jZX0gZnJvbSAnLi9zcmMvcmVmZXJlbmNlcyc7XG5leHBvcnQge01vZHVsZVJlc29sdmVyfSBmcm9tICcuL3NyYy9yZXNvbHZlcic7XG4iXX0=