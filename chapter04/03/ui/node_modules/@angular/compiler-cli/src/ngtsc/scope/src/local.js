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
        define("@angular/compiler-cli/src/ngtsc/scope/src/local", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/util/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    /**
     * A registry which collects information about NgModules, Directives, Components, and Pipes which
     * are local (declared in the ts.Program being compiled), and can produce `LocalModuleScope`s
     * which summarize the compilation scope of a component.
     *
     * This class implements the logic of NgModule declarations, imports, and exports and can produce,
     * for a given component, the set of directives and pipes which are "visible" in that component's
     * template.
     *
     * The `LocalModuleScopeRegistry` has two "modes" of operation. During analysis, data for each
     * individual NgModule, Directive, Component, and Pipe is added to the registry. No attempt is made
     * to traverse or validate the NgModule graph (imports, exports, etc). After analysis, one of
     * `getScopeOfModule` or `getScopeForComponent` can be called, which traverses the NgModule graph
     * and applies the NgModule logic to generate a `LocalModuleScope`, the full scope for the given
     * module or component.
     *
     * The `LocalModuleScopeRegistry` is also capable of producing `ts.Diagnostic` errors when Angular
     * semantics are violated.
     */
    var LocalModuleScopeRegistry = /** @class */ (function () {
        function LocalModuleScopeRegistry(localReader, dependencyScopeReader, refEmitter, aliasingHost) {
            this.localReader = localReader;
            this.dependencyScopeReader = dependencyScopeReader;
            this.refEmitter = refEmitter;
            this.aliasingHost = aliasingHost;
            /**
             * Tracks whether the registry has been asked to produce scopes for a module or component. Once
             * this is true, the registry cannot accept registrations of new directives/pipes/modules as it
             * would invalidate the cached scope data.
             */
            this.sealed = false;
            /**
             * A map of components from the current compilation unit to the NgModule which declared them.
             *
             * As components and directives are not distinguished at the NgModule level, this map may also
             * contain directives. This doesn't cause any problems but isn't useful as there is no concept of
             * a directive's compilation scope.
             */
            this.declarationToModule = new Map();
            /**
             * This maps from the directive/pipe class to a map of data for each NgModule that declares the
             * directive/pipe. This data is needed to produce an error for the given class.
             */
            this.duplicateDeclarations = new Map();
            this.moduleToRef = new Map();
            /**
             * A cache of calculated `LocalModuleScope`s for each NgModule declared in the current program.
             *
             * A value of `undefined` indicates the scope was invalid and produced errors (therefore,
             * diagnostics should exist in the `scopeErrors` map).
             */
            this.cache = new Map();
            /**
             * Tracks whether a given component requires "remote scoping".
             *
             * Remote scoping is when the set of directives which apply to a given component is set in the
             * NgModule's file instead of directly on the component def (which is sometimes needed to get
             * around cyclic import issues). This is not used in calculation of `LocalModuleScope`s, but is
             * tracked here for convenience.
             */
            this.remoteScoping = new Set();
            /**
             * Tracks errors accumulated in the processing of scopes for each module declaration.
             */
            this.scopeErrors = new Map();
            /**
             * Tracks which NgModules are unreliable due to errors within their declarations.
             *
             * This provides a unified view of which modules have errors, across all of the different
             * diagnostic categories that can be produced. Theoretically this can be inferred from the other
             * properties of this class, but is tracked explicitly to simplify the logic.
             */
            this.taintedModules = new Set();
        }
        /**
         * Add an NgModule's data to the registry.
         */
        LocalModuleScopeRegistry.prototype.registerNgModuleMetadata = function (data) {
            var e_1, _a;
            this.assertCollecting();
            var ngModule = data.ref.node;
            this.moduleToRef.set(data.ref.node, data.ref);
            try {
                // Iterate over the module's declarations, and add them to declarationToModule. If duplicates
                // are found, they're instead tracked in duplicateDeclarations.
                for (var _b = tslib_1.__values(data.declarations), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var decl = _c.value;
                    this.registerDeclarationOfModule(ngModule, decl, data.rawDeclarations);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        LocalModuleScopeRegistry.prototype.registerDirectiveMetadata = function (directive) { };
        LocalModuleScopeRegistry.prototype.registerPipeMetadata = function (pipe) { };
        LocalModuleScopeRegistry.prototype.getScopeForComponent = function (clazz) {
            var scope = !this.declarationToModule.has(clazz) ?
                null :
                this.getScopeOfModule(this.declarationToModule.get(clazz).ngModule);
            return scope;
        };
        /**
         * If `node` is declared in more than one NgModule (duplicate declaration), then get the
         * `DeclarationData` for each offending declaration.
         *
         * Ordinarily a class is only declared in one NgModule, in which case this function returns
         * `null`.
         */
        LocalModuleScopeRegistry.prototype.getDuplicateDeclarations = function (node) {
            if (!this.duplicateDeclarations.has(node)) {
                return null;
            }
            return Array.from(this.duplicateDeclarations.get(node).values());
        };
        /**
         * Collects registered data for a module and its directives/pipes and convert it into a full
         * `LocalModuleScope`.
         *
         * This method implements the logic of NgModule imports and exports. It returns the
         * `LocalModuleScope` for the given NgModule if one can be produced, `null` if no scope was ever
         * defined, or the string `'error'` if the scope contained errors.
         */
        LocalModuleScopeRegistry.prototype.getScopeOfModule = function (clazz) {
            var scope = this.moduleToRef.has(clazz) ?
                this.getScopeOfModuleReference(this.moduleToRef.get(clazz)) :
                null;
            // If the NgModule class is marked as tainted, consider it an error.
            if (this.taintedModules.has(clazz)) {
                return 'error';
            }
            // Translate undefined -> 'error'.
            return scope !== undefined ? scope : 'error';
        };
        /**
         * Retrieves any `ts.Diagnostic`s produced during the calculation of the `LocalModuleScope` for
         * the given NgModule, or `null` if no errors were present.
         */
        LocalModuleScopeRegistry.prototype.getDiagnosticsOfModule = function (clazz) {
            // Required to ensure the errors are populated for the given class. If it has been processed
            // before, this will be a no-op due to the scope cache.
            this.getScopeOfModule(clazz);
            if (this.scopeErrors.has(clazz)) {
                return this.scopeErrors.get(clazz);
            }
            else {
                return null;
            }
        };
        /**
         * Returns a collection of the compilation scope for each registered declaration.
         */
        LocalModuleScopeRegistry.prototype.getCompilationScopes = function () {
            var _this = this;
            var scopes = [];
            this.declarationToModule.forEach(function (declData, declaration) {
                var scope = _this.getScopeOfModule(declData.ngModule);
                if (scope !== null && scope !== 'error') {
                    scopes.push(tslib_1.__assign({ declaration: declaration, ngModule: declData.ngModule }, scope.compilation));
                }
            });
            return scopes;
        };
        LocalModuleScopeRegistry.prototype.registerDeclarationOfModule = function (ngModule, decl, rawDeclarations) {
            var declData = {
                ngModule: ngModule,
                ref: decl, rawDeclarations: rawDeclarations,
            };
            // First, check for duplicate declarations of the same directive/pipe.
            if (this.duplicateDeclarations.has(decl.node)) {
                // This directive/pipe has already been identified as being duplicated. Add this module to the
                // map of modules for which a duplicate declaration exists.
                this.duplicateDeclarations.get(decl.node).set(ngModule, declData);
            }
            else if (this.declarationToModule.has(decl.node) &&
                this.declarationToModule.get(decl.node).ngModule !== ngModule) {
                // This directive/pipe is already registered as declared in another module. Mark it as a
                // duplicate instead.
                var duplicateDeclMap = new Map();
                var firstDeclData = this.declarationToModule.get(decl.node);
                // Mark both modules as tainted, since their declarations are missing a component.
                this.taintedModules.add(firstDeclData.ngModule);
                this.taintedModules.add(ngModule);
                // Being detected as a duplicate means there are two NgModules (for now) which declare this
                // directive/pipe. Add both of them to the duplicate tracking map.
                duplicateDeclMap.set(firstDeclData.ngModule, firstDeclData);
                duplicateDeclMap.set(ngModule, declData);
                this.duplicateDeclarations.set(decl.node, duplicateDeclMap);
                // Remove the directive/pipe from `declarationToModule` as it's a duplicate declaration, and
                // therefore not valid.
                this.declarationToModule.delete(decl.node);
            }
            else {
                // This is the first declaration of this directive/pipe, so map it.
                this.declarationToModule.set(decl.node, declData);
            }
        };
        /**
         * Implementation of `getScopeOfModule` which accepts a reference to a class and differentiates
         * between:
         *
         * * no scope being available (returns `null`)
         * * a scope being produced with errors (returns `undefined`).
         */
        LocalModuleScopeRegistry.prototype.getScopeOfModuleReference = function (ref) {
            var e_2, _a, e_3, _b, e_4, _c, e_5, _d, e_6, _e, e_7, _f, e_8, _g;
            if (this.cache.has(ref.node)) {
                return this.cache.get(ref.node);
            }
            // Seal the registry to protect the integrity of the `LocalModuleScope` cache.
            this.sealed = true;
            // `ref` should be an NgModule previously added to the registry. If not, a scope for it
            // cannot be produced.
            var ngModule = this.localReader.getNgModuleMetadata(ref);
            if (ngModule === null) {
                this.cache.set(ref.node, null);
                return null;
            }
            // Errors produced during computation of the scope are recorded here. At the end, if this array
            // isn't empty then `undefined` will be cached and returned to indicate this scope is invalid.
            var diagnostics = [];
            // At this point, the goal is to produce two distinct transitive sets:
            // - the directives and pipes which are visible to components declared in the NgModule.
            // - the directives and pipes which are exported to any NgModules which import this one.
            // Directives and pipes in the compilation scope.
            var compilationDirectives = new Map();
            var compilationPipes = new Map();
            var declared = new Set();
            // Directives and pipes exported to any importing NgModules.
            var exportDirectives = new Map();
            var exportPipes = new Map();
            try {
                // The algorithm is as follows:
                // 1) Add directives/pipes declared in the NgModule to the compilation scope.
                // 2) Add all of the directives/pipes from each NgModule imported into the current one to the
                //    compilation scope. At this point, the compilation scope is complete.
                // 3) For each entry in the NgModule's exports:
                //    a) Attempt to resolve it as an NgModule with its own exported directives/pipes. If it is
                //       one, add them to the export scope of this NgModule.
                //    b) Otherwise, it should be a class in the compilation scope of this NgModule. If it is,
                //       add it to the export scope.
                //    c) If it's neither an NgModule nor a directive/pipe in the compilation scope, then this
                //       is an error.
                // 1) add declarations.
                for (var _h = tslib_1.__values(ngModule.declarations), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var decl = _j.value;
                    var directive = this.localReader.getDirectiveMetadata(decl);
                    var pipe = this.localReader.getPipeMetadata(decl);
                    if (directive !== null) {
                        compilationDirectives.set(decl.node, tslib_1.__assign(tslib_1.__assign({}, directive), { ref: decl }));
                    }
                    else if (pipe !== null) {
                        compilationPipes.set(decl.node, tslib_1.__assign(tslib_1.__assign({}, pipe), { ref: decl }));
                    }
                    else {
                        this.taintedModules.add(ngModule.ref.node);
                        var errorNode = decl.getOriginForDiagnostics(ngModule.rawDeclarations);
                        diagnostics.push(diagnostics_1.makeDiagnostic(diagnostics_1.ErrorCode.NGMODULE_INVALID_DECLARATION, errorNode, "The class '" + decl.node.name.text + "' is listed in the declarations of the NgModule '" + ngModule.ref.node.name.text + "', but is not a directive, a component, or a pipe.\n\nEither remove it from the NgModule's declarations, or add an appropriate Angular decorator.", [{ node: decl.node.name, messageText: "'" + decl.node.name.text + "' is declared here." }]));
                        continue;
                    }
                    declared.add(decl.node);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_a = _h.return)) _a.call(_h);
                }
                finally { if (e_2) throw e_2.error; }
            }
            try {
                // 2) process imports.
                for (var _k = tslib_1.__values(ngModule.imports), _l = _k.next(); !_l.done; _l = _k.next()) {
                    var decl = _l.value;
                    var importScope = this.getExportedScope(decl, diagnostics, ref.node, 'import');
                    if (importScope === null) {
                        // An import wasn't an NgModule, so record an error.
                        diagnostics.push(invalidRef(ref.node, decl, 'import'));
                        continue;
                    }
                    else if (importScope === undefined) {
                        // An import was an NgModule but contained errors of its own. Record this as an error too,
                        // because this scope is always going to be incorrect if one of its imports could not be
                        // read.
                        diagnostics.push(invalidTransitiveNgModuleRef(ref.node, decl, 'import'));
                        continue;
                    }
                    try {
                        for (var _m = (e_4 = void 0, tslib_1.__values(importScope.exported.directives)), _o = _m.next(); !_o.done; _o = _m.next()) {
                            var directive = _o.value;
                            compilationDirectives.set(directive.ref.node, directive);
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (_o && !_o.done && (_c = _m.return)) _c.call(_m);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                    try {
                        for (var _p = (e_5 = void 0, tslib_1.__values(importScope.exported.pipes)), _q = _p.next(); !_q.done; _q = _p.next()) {
                            var pipe = _q.value;
                            compilationPipes.set(pipe.ref.node, pipe);
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (_q && !_q.done && (_d = _p.return)) _d.call(_p);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_l && !_l.done && (_b = _k.return)) _b.call(_k);
                }
                finally { if (e_3) throw e_3.error; }
            }
            try {
                // 3) process exports.
                // Exports can contain modules, components, or directives. They're processed differently.
                // Modules are straightforward. Directives and pipes from exported modules are added to the
                // export maps. Directives/pipes are different - they might be exports of declared types or
                // imported types.
                for (var _r = tslib_1.__values(ngModule.exports), _s = _r.next(); !_s.done; _s = _r.next()) {
                    var decl = _s.value;
                    // Attempt to resolve decl as an NgModule.
                    var importScope = this.getExportedScope(decl, diagnostics, ref.node, 'export');
                    if (importScope === undefined) {
                        // An export was an NgModule but contained errors of its own. Record this as an error too,
                        // because this scope is always going to be incorrect if one of its exports could not be
                        // read.
                        diagnostics.push(invalidTransitiveNgModuleRef(ref.node, decl, 'export'));
                        continue;
                    }
                    else if (importScope !== null) {
                        try {
                            // decl is an NgModule.
                            for (var _t = (e_7 = void 0, tslib_1.__values(importScope.exported.directives)), _u = _t.next(); !_u.done; _u = _t.next()) {
                                var directive = _u.value;
                                exportDirectives.set(directive.ref.node, directive);
                            }
                        }
                        catch (e_7_1) { e_7 = { error: e_7_1 }; }
                        finally {
                            try {
                                if (_u && !_u.done && (_f = _t.return)) _f.call(_t);
                            }
                            finally { if (e_7) throw e_7.error; }
                        }
                        try {
                            for (var _v = (e_8 = void 0, tslib_1.__values(importScope.exported.pipes)), _w = _v.next(); !_w.done; _w = _v.next()) {
                                var pipe = _w.value;
                                exportPipes.set(pipe.ref.node, pipe);
                            }
                        }
                        catch (e_8_1) { e_8 = { error: e_8_1 }; }
                        finally {
                            try {
                                if (_w && !_w.done && (_g = _v.return)) _g.call(_v);
                            }
                            finally { if (e_8) throw e_8.error; }
                        }
                    }
                    else if (compilationDirectives.has(decl.node)) {
                        // decl is a directive or component in the compilation scope of this NgModule.
                        var directive = compilationDirectives.get(decl.node);
                        exportDirectives.set(decl.node, directive);
                    }
                    else if (compilationPipes.has(decl.node)) {
                        // decl is a pipe in the compilation scope of this NgModule.
                        var pipe = compilationPipes.get(decl.node);
                        exportPipes.set(decl.node, pipe);
                    }
                    else {
                        // decl is an unknown export.
                        if (this.localReader.getDirectiveMetadata(decl) !== null ||
                            this.localReader.getPipeMetadata(decl) !== null) {
                            diagnostics.push(invalidReexport(ref.node, decl));
                        }
                        else {
                            diagnostics.push(invalidRef(ref.node, decl, 'export'));
                        }
                        continue;
                    }
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_s && !_s.done && (_e = _r.return)) _e.call(_r);
                }
                finally { if (e_6) throw e_6.error; }
            }
            var exported = {
                directives: Array.from(exportDirectives.values()),
                pipes: Array.from(exportPipes.values()),
            };
            var reexports = this.getReexports(ngModule, ref, declared, exported, diagnostics);
            // Check if this scope had any errors during production.
            if (diagnostics.length > 0) {
                // Cache undefined, to mark the fact that the scope is invalid.
                this.cache.set(ref.node, undefined);
                // Save the errors for retrieval.
                this.scopeErrors.set(ref.node, diagnostics);
                // Mark this module as being tainted.
                this.taintedModules.add(ref.node);
                return undefined;
            }
            // Finally, produce the `LocalModuleScope` with both the compilation and export scopes.
            var scope = {
                compilation: {
                    directives: Array.from(compilationDirectives.values()),
                    pipes: Array.from(compilationPipes.values()),
                },
                exported: exported,
                reexports: reexports,
                schemas: ngModule.schemas,
            };
            this.cache.set(ref.node, scope);
            return scope;
        };
        /**
         * Check whether a component requires remote scoping.
         */
        LocalModuleScopeRegistry.prototype.getRequiresRemoteScope = function (node) { return this.remoteScoping.has(node); };
        /**
         * Set a component as requiring remote scoping.
         */
        LocalModuleScopeRegistry.prototype.setComponentAsRequiringRemoteScoping = function (node) {
            this.remoteScoping.add(node);
        };
        /**
         * Look up the `ExportScope` of a given `Reference` to an NgModule.
         *
         * The NgModule in question may be declared locally in the current ts.Program, or it may be
         * declared in a .d.ts file.
         *
         * @returns `null` if no scope could be found, or `undefined` if an invalid scope
         * was found.
         *
         * May also contribute diagnostics of its own by adding to the given `diagnostics`
         * array parameter.
         */
        LocalModuleScopeRegistry.prototype.getExportedScope = function (ref, diagnostics, ownerForErrors, type) {
            if (ref.node.getSourceFile().isDeclarationFile) {
                // The NgModule is declared in a .d.ts file. Resolve it with the `DependencyScopeReader`.
                if (!ts.isClassDeclaration(ref.node)) {
                    // The NgModule is in a .d.ts file but is not declared as a ts.ClassDeclaration. This is an
                    // error in the .d.ts metadata.
                    var code = type === 'import' ? diagnostics_1.ErrorCode.NGMODULE_INVALID_IMPORT :
                        diagnostics_1.ErrorCode.NGMODULE_INVALID_EXPORT;
                    diagnostics.push(diagnostics_1.makeDiagnostic(code, typescript_1.identifierOfNode(ref.node) || ref.node, "Appears in the NgModule." + type + "s of " + typescript_1.nodeNameForError(ownerForErrors) + ", but could not be resolved to an NgModule"));
                    return undefined;
                }
                return this.dependencyScopeReader.resolve(ref);
            }
            else {
                // The NgModule is declared locally in the current program. Resolve it from the registry.
                return this.getScopeOfModuleReference(ref);
            }
        };
        LocalModuleScopeRegistry.prototype.getReexports = function (ngModule, ref, declared, exported, diagnostics) {
            var e_9, _a, e_10, _b;
            var _this = this;
            var reexports = null;
            var sourceFile = ref.node.getSourceFile();
            if (this.aliasingHost === null) {
                return null;
            }
            reexports = [];
            // Track re-exports by symbol name, to produce diagnostics if two alias re-exports would share
            // the same name.
            var reexportMap = new Map();
            // Alias ngModuleRef added for readability below.
            var ngModuleRef = ref;
            var addReexport = function (exportRef) {
                if (exportRef.node.getSourceFile() === sourceFile) {
                    return;
                }
                var isReExport = !declared.has(exportRef.node);
                var exportName = _this.aliasingHost.maybeAliasSymbolAs(exportRef, sourceFile, ngModule.ref.node.name.text, isReExport);
                if (exportName === null) {
                    return;
                }
                if (!reexportMap.has(exportName)) {
                    if (exportRef.alias && exportRef.alias instanceof compiler_1.ExternalExpr) {
                        reexports.push({
                            fromModule: exportRef.alias.value.moduleName,
                            symbolName: exportRef.alias.value.name,
                            asAlias: exportName,
                        });
                    }
                    else {
                        var expr = _this.refEmitter.emit(exportRef.cloneWithNoIdentifiers(), sourceFile);
                        if (!(expr instanceof compiler_1.ExternalExpr) || expr.value.moduleName === null ||
                            expr.value.name === null) {
                            throw new Error('Expected ExternalExpr');
                        }
                        reexports.push({
                            fromModule: expr.value.moduleName,
                            symbolName: expr.value.name,
                            asAlias: exportName,
                        });
                    }
                    reexportMap.set(exportName, exportRef);
                }
                else {
                    // Another re-export already used this name. Produce a diagnostic.
                    var prevRef = reexportMap.get(exportName);
                    diagnostics.push(reexportCollision(ngModuleRef.node, prevRef, exportRef));
                }
            };
            try {
                for (var _c = tslib_1.__values(exported.directives), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var ref_1 = _d.value.ref;
                    addReexport(ref_1);
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_9) throw e_9.error; }
            }
            try {
                for (var _e = tslib_1.__values(exported.pipes), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var ref_2 = _f.value.ref;
                    addReexport(ref_2);
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_10) throw e_10.error; }
            }
            return reexports;
        };
        LocalModuleScopeRegistry.prototype.assertCollecting = function () {
            if (this.sealed) {
                throw new Error("Assertion: LocalModuleScopeRegistry is not COLLECTING");
            }
        };
        return LocalModuleScopeRegistry;
    }());
    exports.LocalModuleScopeRegistry = LocalModuleScopeRegistry;
    /**
     * Produce a `ts.Diagnostic` for an invalid import or export from an NgModule.
     */
    function invalidRef(clazz, decl, type) {
        var code = type === 'import' ? diagnostics_1.ErrorCode.NGMODULE_INVALID_IMPORT : diagnostics_1.ErrorCode.NGMODULE_INVALID_EXPORT;
        var resolveTarget = type === 'import' ? 'NgModule' : 'NgModule, Component, Directive, or Pipe';
        var message = "Appears in the NgModule." + type + "s of " + typescript_1.nodeNameForError(clazz) + ", but could not be resolved to an " + resolveTarget + " class." +
            '\n\n';
        var library = decl.ownedByModuleGuess !== null ? " (" + decl.ownedByModuleGuess + ")" : '';
        var sf = decl.node.getSourceFile();
        // Provide extra context to the error for the user.
        if (!sf.isDeclarationFile) {
            // This is a file in the user's program.
            var annotationType = type === 'import' ? '@NgModule' : 'Angular';
            message += "Is it missing an " + annotationType + " annotation?";
        }
        else if (sf.fileName.indexOf('node_modules') !== -1) {
            // This file comes from a third-party library in node_modules.
            message +=
                "This likely means that the library" + library + " which declares " + decl.debugName + " has not " +
                    'been processed correctly by ngcc, or is not compatible with Angular Ivy. Check if a ' +
                    'newer version of the library is available, and update if so. Also consider checking ' +
                    'with the library\'s authors to see if the library is expected to be compatible with Ivy.';
        }
        else {
            // This is a monorepo style local dependency. Unfortunately these are too different to really
            // offer much more advice than this.
            message +=
                "This likely means that the dependency" + library + " which declares " + decl.debugName + " has not been processed correctly by ngcc.";
        }
        return diagnostics_1.makeDiagnostic(code, typescript_1.identifierOfNode(decl.node) || decl.node, message);
    }
    /**
     * Produce a `ts.Diagnostic` for an import or export which itself has errors.
     */
    function invalidTransitiveNgModuleRef(clazz, decl, type) {
        var code = type === 'import' ? diagnostics_1.ErrorCode.NGMODULE_INVALID_IMPORT : diagnostics_1.ErrorCode.NGMODULE_INVALID_EXPORT;
        return diagnostics_1.makeDiagnostic(code, typescript_1.identifierOfNode(decl.node) || decl.node, "Appears in the NgModule." + type + "s of " + typescript_1.nodeNameForError(clazz) + ", but itself has errors");
    }
    /**
     * Produce a `ts.Diagnostic` for an exported directive or pipe which was not declared or imported
     * by the NgModule in question.
     */
    function invalidReexport(clazz, decl) {
        return diagnostics_1.makeDiagnostic(diagnostics_1.ErrorCode.NGMODULE_INVALID_REEXPORT, typescript_1.identifierOfNode(decl.node) || decl.node, "Present in the NgModule.exports of " + typescript_1.nodeNameForError(clazz) + " but neither declared nor imported");
    }
    /**
     * Produce a `ts.Diagnostic` for a collision in re-export names between two directives/pipes.
     */
    function reexportCollision(module, refA, refB) {
        var childMessageText = "This directive/pipe is part of the exports of '" + module.name.text + "' and shares the same name as another exported directive/pipe.";
        return diagnostics_1.makeDiagnostic(diagnostics_1.ErrorCode.NGMODULE_REEXPORT_NAME_COLLISION, module.name, ("\n    There was a name collision between two classes named '" + refA.node.name.text + "', which are both part of the exports of '" + module.name.text + "'.\n\n    Angular generates re-exports of an NgModule's exported directives/pipes from the module's source file in certain cases, using the declared name of the class. If two classes of the same name are exported, this automatic naming does not work.\n\n    To fix this problem please re-export one or both classes directly from this file.\n  ").trim(), [
            { node: refA.node.name, messageText: childMessageText },
            { node: refB.node.name, messageText: childMessageText },
        ]);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3Njb3BlL3NyYy9sb2NhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBK0Q7SUFDL0QsK0JBQWlDO0lBRWpDLDJFQUE0RDtJQUk1RCxrRkFBNkU7SUE0QjdFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FrQkc7SUFDSDtRQTBERSxrQ0FDWSxXQUEyQixFQUFVLHFCQUE2QyxFQUNsRixVQUE0QixFQUFVLFlBQStCO1lBRHJFLGdCQUFXLEdBQVgsV0FBVyxDQUFnQjtZQUFVLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFDbEYsZUFBVSxHQUFWLFVBQVUsQ0FBa0I7WUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBbUI7WUEzRGpGOzs7O2VBSUc7WUFDSyxXQUFNLEdBQUcsS0FBSyxDQUFDO1lBRXZCOzs7Ozs7ZUFNRztZQUNLLHdCQUFtQixHQUFHLElBQUksR0FBRyxFQUFxQyxDQUFDO1lBRTNFOzs7ZUFHRztZQUNLLDBCQUFxQixHQUN6QixJQUFJLEdBQUcsRUFBNEQsQ0FBQztZQUVoRSxnQkFBVyxHQUFHLElBQUksR0FBRyxFQUFpRCxDQUFDO1lBRS9FOzs7OztlQUtHO1lBQ0ssVUFBSyxHQUFHLElBQUksR0FBRyxFQUFxRCxDQUFDO1lBRTdFOzs7Ozs7O2VBT0c7WUFDSyxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1lBRXBEOztlQUVHO1lBQ0ssZ0JBQVcsR0FBRyxJQUFJLEdBQUcsRUFBcUMsQ0FBQztZQUVuRTs7Ozs7O2VBTUc7WUFDSyxtQkFBYyxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1FBSStCLENBQUM7UUFFckY7O1dBRUc7UUFDSCwyREFBd0IsR0FBeEIsVUFBeUIsSUFBa0I7O1lBQ3pDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQy9CLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7Z0JBQzlDLDZGQUE2RjtnQkFDN0YsK0RBQStEO2dCQUMvRCxLQUFtQixJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQSxnQkFBQSw0QkFBRTtvQkFBakMsSUFBTSxJQUFJLFdBQUE7b0JBQ2IsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2lCQUN4RTs7Ozs7Ozs7O1FBQ0gsQ0FBQztRQUVELDREQUF5QixHQUF6QixVQUEwQixTQUF3QixJQUFTLENBQUM7UUFFNUQsdURBQW9CLEdBQXBCLFVBQXFCLElBQWMsSUFBUyxDQUFDO1FBRTdDLHVEQUFvQixHQUFwQixVQUFxQixLQUF1QjtZQUMxQyxJQUFNLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLENBQUM7Z0JBQ04sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUUsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBRUQ7Ozs7OztXQU1HO1FBQ0gsMkRBQXdCLEdBQXhCLFVBQXlCLElBQXNCO1lBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN6QyxPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBRUQ7Ozs7Ozs7V0FPRztRQUNILG1EQUFnQixHQUFoQixVQUFpQixLQUF1QjtZQUN0QyxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLENBQUM7WUFDVCxvRUFBb0U7WUFDcEUsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDbEMsT0FBTyxPQUFPLENBQUM7YUFDaEI7WUFFRCxrQ0FBa0M7WUFDbEMsT0FBTyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUMvQyxDQUFDO1FBRUQ7OztXQUdHO1FBQ0gseURBQXNCLEdBQXRCLFVBQXVCLEtBQXVCO1lBQzVDLDRGQUE0RjtZQUM1Rix1REFBdUQ7WUFDdkQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTdCLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQy9CLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFHLENBQUM7YUFDdEM7aUJBQU07Z0JBQ0wsT0FBTyxJQUFJLENBQUM7YUFDYjtRQUNILENBQUM7UUFFRDs7V0FFRztRQUNILHVEQUFvQixHQUFwQjtZQUFBLGlCQVNDO1lBUkMsSUFBTSxNQUFNLEdBQXVCLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBUSxFQUFFLFdBQVc7Z0JBQ3JELElBQU0sS0FBSyxHQUFHLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3ZELElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssT0FBTyxFQUFFO29CQUN2QyxNQUFNLENBQUMsSUFBSSxvQkFBRSxXQUFXLGFBQUEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsSUFBSyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7aUJBQy9FO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRU8sOERBQTJCLEdBQW5DLFVBQ0ksUUFBMEIsRUFBRSxJQUFpQyxFQUM3RCxlQUFtQztZQUNyQyxJQUFNLFFBQVEsR0FBb0I7Z0JBQ2hDLFFBQVEsVUFBQTtnQkFDUixHQUFHLEVBQUUsSUFBSSxFQUFFLGVBQWUsaUJBQUE7YUFDM0IsQ0FBQztZQUVGLHNFQUFzRTtZQUN0RSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM3Qyw4RkFBOEY7Z0JBQzlGLDJEQUEyRDtnQkFDM0QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNyRTtpQkFBTSxJQUNILElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDdkMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFHLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTtnQkFDbkUsd0ZBQXdGO2dCQUN4RixxQkFBcUI7Z0JBQ3JCLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQXFDLENBQUM7Z0JBQ3RFLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRyxDQUFDO2dCQUVoRSxrRkFBa0Y7Z0JBQ2xGLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRWxDLDJGQUEyRjtnQkFDM0Ysa0VBQWtFO2dCQUNsRSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDNUQsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDekMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7Z0JBRTVELDRGQUE0RjtnQkFDNUYsdUJBQXVCO2dCQUN2QixJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM1QztpQkFBTTtnQkFDTCxtRUFBbUU7Z0JBQ25FLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNuRDtRQUNILENBQUM7UUFFRDs7Ozs7O1dBTUc7UUFDSyw0REFBeUIsR0FBakMsVUFBa0MsR0FBZ0M7O1lBRWhFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM1QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNqQztZQUVELDhFQUE4RTtZQUM5RSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUVuQix1RkFBdUY7WUFDdkYsc0JBQXNCO1lBQ3RCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0QsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO2dCQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMvQixPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsK0ZBQStGO1lBQy9GLDhGQUE4RjtZQUM5RixJQUFNLFdBQVcsR0FBb0IsRUFBRSxDQUFDO1lBRXhDLHNFQUFzRTtZQUN0RSx1RkFBdUY7WUFDdkYsd0ZBQXdGO1lBRXhGLGlEQUFpRDtZQUNqRCxJQUFNLHFCQUFxQixHQUFHLElBQUksR0FBRyxFQUFpQyxDQUFDO1lBQ3ZFLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQTRCLENBQUM7WUFFN0QsSUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7WUFFM0MsNERBQTREO1lBQzVELElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7WUFDbEUsSUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQTRCLENBQUM7O2dCQUV4RCwrQkFBK0I7Z0JBQy9CLDZFQUE2RTtnQkFDN0UsNkZBQTZGO2dCQUM3RiwwRUFBMEU7Z0JBQzFFLCtDQUErQztnQkFDL0MsOEZBQThGO2dCQUM5Riw0REFBNEQ7Z0JBQzVELDZGQUE2RjtnQkFDN0Ysb0NBQW9DO2dCQUNwQyw2RkFBNkY7Z0JBQzdGLHFCQUFxQjtnQkFFckIsdUJBQXVCO2dCQUN2QixLQUFtQixJQUFBLEtBQUEsaUJBQUEsUUFBUSxDQUFDLFlBQVksQ0FBQSxnQkFBQSw0QkFBRTtvQkFBckMsSUFBTSxJQUFJLFdBQUE7b0JBQ2IsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDOUQsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BELElBQUksU0FBUyxLQUFLLElBQUksRUFBRTt3QkFDdEIscUJBQXFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLHdDQUFNLFNBQVMsS0FBRSxHQUFHLEVBQUUsSUFBSSxJQUFFLENBQUM7cUJBQ2pFO3lCQUFNLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTt3QkFDeEIsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLHdDQUFNLElBQUksS0FBRSxHQUFHLEVBQUUsSUFBSSxJQUFFLENBQUM7cUJBQ3ZEO3lCQUFNO3dCQUNMLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBRTNDLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsZUFBaUIsQ0FBQyxDQUFDO3dCQUMzRSxXQUFXLENBQUMsSUFBSSxDQUFDLDRCQUFjLENBQzNCLHVCQUFTLENBQUMsNEJBQTRCLEVBQUUsU0FBUyxFQUNqRCxnQkFBYyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLHlEQUFvRCxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxzSkFFaEMsRUFDaEYsQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsTUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFxQixFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzFGLFNBQVM7cUJBQ1Y7b0JBRUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3pCOzs7Ozs7Ozs7O2dCQUVELHNCQUFzQjtnQkFDdEIsS0FBbUIsSUFBQSxLQUFBLGlCQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUEsZ0JBQUEsNEJBQUU7b0JBQWhDLElBQU0sSUFBSSxXQUFBO29CQUNiLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ2pGLElBQUksV0FBVyxLQUFLLElBQUksRUFBRTt3QkFDeEIsb0RBQW9EO3dCQUNwRCxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUN2RCxTQUFTO3FCQUNWO3lCQUFNLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTt3QkFDcEMsMEZBQTBGO3dCQUMxRix3RkFBd0Y7d0JBQ3hGLFFBQVE7d0JBQ1IsV0FBVyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUN6RSxTQUFTO3FCQUNWOzt3QkFDRCxLQUF3QixJQUFBLG9CQUFBLGlCQUFBLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFBLENBQUEsZ0JBQUEsNEJBQUU7NEJBQXBELElBQU0sU0FBUyxXQUFBOzRCQUNsQixxQkFBcUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7eUJBQzFEOzs7Ozs7Ozs7O3dCQUNELEtBQW1CLElBQUEsb0JBQUEsaUJBQUEsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUEsQ0FBQSxnQkFBQSw0QkFBRTs0QkFBMUMsSUFBTSxJQUFJLFdBQUE7NEJBQ2IsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO3lCQUMzQzs7Ozs7Ozs7O2lCQUNGOzs7Ozs7Ozs7O2dCQUVELHNCQUFzQjtnQkFDdEIseUZBQXlGO2dCQUN6RiwyRkFBMkY7Z0JBQzNGLDJGQUEyRjtnQkFDM0Ysa0JBQWtCO2dCQUNsQixLQUFtQixJQUFBLEtBQUEsaUJBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQSxnQkFBQSw0QkFBRTtvQkFBaEMsSUFBTSxJQUFJLFdBQUE7b0JBQ2IsMENBQTBDO29CQUMxQyxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUNqRixJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7d0JBQzdCLDBGQUEwRjt3QkFDMUYsd0ZBQXdGO3dCQUN4RixRQUFRO3dCQUNSLFdBQVcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzt3QkFDekUsU0FBUztxQkFDVjt5QkFBTSxJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7OzRCQUMvQix1QkFBdUI7NEJBQ3ZCLEtBQXdCLElBQUEsb0JBQUEsaUJBQUEsV0FBVyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUEsQ0FBQSxnQkFBQSw0QkFBRTtnQ0FBcEQsSUFBTSxTQUFTLFdBQUE7Z0NBQ2xCLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQzs2QkFDckQ7Ozs7Ozs7Ozs7NEJBQ0QsS0FBbUIsSUFBQSxvQkFBQSxpQkFBQSxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQSxDQUFBLGdCQUFBLDRCQUFFO2dDQUExQyxJQUFNLElBQUksV0FBQTtnQ0FDYixXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDOzZCQUN0Qzs7Ozs7Ozs7O3FCQUNGO3lCQUFNLElBQUkscUJBQXFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDL0MsOEVBQThFO3dCQUM5RSxJQUFNLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRyxDQUFDO3dCQUN6RCxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztxQkFDNUM7eUJBQU0sSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUMxQyw0REFBNEQ7d0JBQzVELElBQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFHLENBQUM7d0JBQy9DLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztxQkFDbEM7eUJBQU07d0JBQ0wsNkJBQTZCO3dCQUM3QixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSTs0QkFDcEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFOzRCQUNuRCxXQUFXLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7eUJBQ25EOzZCQUFNOzRCQUNMLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7eUJBQ3hEO3dCQUNELFNBQVM7cUJBQ1Y7aUJBQ0Y7Ozs7Ozs7OztZQUVELElBQU0sUUFBUSxHQUFHO2dCQUNmLFVBQVUsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNqRCxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDeEMsQ0FBQztZQUVGLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBRXBGLHdEQUF3RDtZQUN4RCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUMxQiwrREFBK0Q7Z0JBQy9ELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBRXBDLGlDQUFpQztnQkFDakMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFFNUMscUNBQXFDO2dCQUNyQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xDLE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1lBRUQsdUZBQXVGO1lBQ3ZGLElBQU0sS0FBSyxHQUFHO2dCQUNaLFdBQVcsRUFBRTtvQkFDWCxVQUFVLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDdEQsS0FBSyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQzdDO2dCQUNELFFBQVEsVUFBQTtnQkFDUixTQUFTLFdBQUE7Z0JBQ1QsT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPO2FBQzFCLENBQUM7WUFDRixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2hDLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVEOztXQUVHO1FBQ0gseURBQXNCLEdBQXRCLFVBQXVCLElBQXNCLElBQWEsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEc7O1dBRUc7UUFDSCx1RUFBb0MsR0FBcEMsVUFBcUMsSUFBc0I7WUFDekQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVEOzs7Ozs7Ozs7OztXQVdHO1FBQ0ssbURBQWdCLEdBQXhCLFVBQ0ksR0FBZ0MsRUFBRSxXQUE0QixFQUM5RCxjQUE4QixFQUFFLElBQXVCO1lBQ3pELElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRTtnQkFDOUMseUZBQXlGO2dCQUN6RixJQUFJLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDcEMsMkZBQTJGO29CQUMzRiwrQkFBK0I7b0JBQy9CLElBQU0sSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLHVCQUFTLENBQUMsdUJBQXVCLENBQUMsQ0FBQzt3QkFDbkMsdUJBQVMsQ0FBQyx1QkFBdUIsQ0FBQztvQkFDbkUsV0FBVyxDQUFDLElBQUksQ0FBQyw0QkFBYyxDQUMzQixJQUFJLEVBQUUsNkJBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQzVDLDZCQUEyQixJQUFJLGFBQVEsNkJBQWdCLENBQUMsY0FBYyxDQUFDLCtDQUE0QyxDQUFDLENBQUMsQ0FBQztvQkFDMUgsT0FBTyxTQUFTLENBQUM7aUJBQ2xCO2dCQUNELE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNoRDtpQkFBTTtnQkFDTCx5RkFBeUY7Z0JBQ3pGLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzVDO1FBQ0gsQ0FBQztRQUVPLCtDQUFZLEdBQXBCLFVBQ0ksUUFBc0IsRUFBRSxHQUFnQyxFQUFFLFFBQTZCLEVBQ3ZGLFFBQTBELEVBQzFELFdBQTRCOztZQUhoQyxpQkEwREM7WUF0REMsSUFBSSxTQUFTLEdBQW9CLElBQUksQ0FBQztZQUN0QyxJQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzVDLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxJQUFJLEVBQUU7Z0JBQzlCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ2YsOEZBQThGO1lBQzlGLGlCQUFpQjtZQUNqQixJQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBdUMsQ0FBQztZQUNuRSxpREFBaUQ7WUFDakQsSUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDO1lBQ3hCLElBQU0sV0FBVyxHQUFHLFVBQUMsU0FBc0M7Z0JBQ3pELElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxVQUFVLEVBQUU7b0JBQ2pELE9BQU87aUJBQ1I7Z0JBQ0QsSUFBTSxVQUFVLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakQsSUFBTSxVQUFVLEdBQUcsS0FBSSxDQUFDLFlBQWMsQ0FBQyxrQkFBa0IsQ0FDckQsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUNwRSxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7b0JBQ3ZCLE9BQU87aUJBQ1I7Z0JBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ2hDLElBQUksU0FBUyxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsS0FBSyxZQUFZLHVCQUFZLEVBQUU7d0JBQzlELFNBQVcsQ0FBQyxJQUFJLENBQUM7NEJBQ2YsVUFBVSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVk7NEJBQzlDLFVBQVUsRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFNOzRCQUN4QyxPQUFPLEVBQUUsVUFBVTt5QkFDcEIsQ0FBQyxDQUFDO3FCQUNKO3lCQUFNO3dCQUNMLElBQU0sSUFBSSxHQUFHLEtBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO3dCQUNsRixJQUFJLENBQUMsQ0FBQyxJQUFJLFlBQVksdUJBQVksQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxLQUFLLElBQUk7NEJBQ2pFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTs0QkFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO3lCQUMxQzt3QkFDRCxTQUFXLENBQUMsSUFBSSxDQUFDOzRCQUNmLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVU7NEJBQ2pDLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUk7NEJBQzNCLE9BQU8sRUFBRSxVQUFVO3lCQUNwQixDQUFDLENBQUM7cUJBQ0o7b0JBQ0QsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7aUJBQ3hDO3FCQUFNO29CQUNMLGtFQUFrRTtvQkFDbEUsSUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUcsQ0FBQztvQkFDOUMsV0FBVyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO2lCQUMzRTtZQUNILENBQUMsQ0FBQzs7Z0JBQ0YsS0FBb0IsSUFBQSxLQUFBLGlCQUFBLFFBQVEsQ0FBQyxVQUFVLENBQUEsZ0JBQUEsNEJBQUU7b0JBQTdCLElBQUEsb0JBQUc7b0JBQ2IsV0FBVyxDQUFDLEtBQUcsQ0FBQyxDQUFDO2lCQUNsQjs7Ozs7Ozs7OztnQkFDRCxLQUFvQixJQUFBLEtBQUEsaUJBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQSxnQkFBQSw0QkFBRTtvQkFBeEIsSUFBQSxvQkFBRztvQkFDYixXQUFXLENBQUMsS0FBRyxDQUFDLENBQUM7aUJBQ2xCOzs7Ozs7Ozs7WUFDRCxPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDO1FBRU8sbURBQWdCLEdBQXhCO1lBQ0UsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELENBQUMsQ0FBQzthQUMxRTtRQUNILENBQUM7UUFDSCwrQkFBQztJQUFELENBQUMsQUFoZUQsSUFnZUM7SUFoZVksNERBQXdCO0lBa2VyQzs7T0FFRztJQUNILFNBQVMsVUFBVSxDQUNmLEtBQXFCLEVBQUUsSUFBK0IsRUFDdEQsSUFBeUI7UUFDM0IsSUFBTSxJQUFJLEdBQ04sSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsdUJBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsdUJBQVMsQ0FBQyx1QkFBdUIsQ0FBQztRQUM5RixJQUFNLGFBQWEsR0FBRyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLHlDQUF5QyxDQUFDO1FBQ2pHLElBQUksT0FBTyxHQUNQLDZCQUEyQixJQUFJLGFBQVEsNkJBQWdCLENBQUMsS0FBSyxDQUFDLDBDQUFxQyxhQUFhLFlBQVM7WUFDekgsTUFBTSxDQUFDO1FBQ1gsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBSyxJQUFJLENBQUMsa0JBQWtCLE1BQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3hGLElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFckMsbURBQW1EO1FBQ25ELElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUU7WUFDekIsd0NBQXdDO1lBQ3hDLElBQU0sY0FBYyxHQUFHLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ25FLE9BQU8sSUFBSSxzQkFBb0IsY0FBYyxpQkFBYyxDQUFDO1NBQzdEO2FBQU0sSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNyRCw4REFBOEQ7WUFDOUQsT0FBTztnQkFDSCx1Q0FBcUMsT0FBTyx3QkFBbUIsSUFBSSxDQUFDLFNBQVMsY0FBVztvQkFDeEYsc0ZBQXNGO29CQUN0RixzRkFBc0Y7b0JBQ3RGLDBGQUEwRixDQUFDO1NBQ2hHO2FBQU07WUFDTCw2RkFBNkY7WUFDN0Ysb0NBQW9DO1lBQ3BDLE9BQU87Z0JBQ0gsMENBQXdDLE9BQU8sd0JBQW1CLElBQUksQ0FBQyxTQUFTLCtDQUE0QyxDQUFDO1NBQ2xJO1FBRUQsT0FBTyw0QkFBYyxDQUFDLElBQUksRUFBRSw2QkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLDRCQUE0QixDQUNqQyxLQUFxQixFQUFFLElBQStCLEVBQ3RELElBQXlCO1FBQzNCLElBQU0sSUFBSSxHQUNOLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLHVCQUFTLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLHVCQUFTLENBQUMsdUJBQXVCLENBQUM7UUFDOUYsT0FBTyw0QkFBYyxDQUNqQixJQUFJLEVBQUUsNkJBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQzlDLDZCQUEyQixJQUFJLGFBQVEsNkJBQWdCLENBQUMsS0FBSyxDQUFDLDRCQUF5QixDQUFDLENBQUM7SUFDL0YsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQVMsZUFBZSxDQUFDLEtBQXFCLEVBQUUsSUFBK0I7UUFDN0UsT0FBTyw0QkFBYyxDQUNqQix1QkFBUyxDQUFDLHlCQUF5QixFQUFFLDZCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUM3RSx3Q0FBc0MsNkJBQWdCLENBQUMsS0FBSyxDQUFDLHVDQUFvQyxDQUFDLENBQUM7SUFDekcsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUyxpQkFBaUIsQ0FDdEIsTUFBd0IsRUFBRSxJQUFpQyxFQUMzRCxJQUFpQztRQUNuQyxJQUFNLGdCQUFnQixHQUNsQixvREFBa0QsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLG1FQUFnRSxDQUFDO1FBQ3ZJLE9BQU8sNEJBQWMsQ0FDakIsdUJBQVMsQ0FBQyxnQ0FBZ0MsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUEsaUVBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxrREFBNkMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLDRWQUt6SSxDQUFBLENBQUMsSUFBSSxFQUFFLEVBQ0o7WUFDRSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQUM7WUFDckQsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFDO1NBQ3RELENBQUMsQ0FBQztJQUNULENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RXh0ZXJuYWxFeHByLCBTY2hlbWFNZXRhZGF0YX0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7RXJyb3JDb2RlLCBtYWtlRGlhZ25vc3RpY30gZnJvbSAnLi4vLi4vZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHtBbGlhc2luZ0hvc3QsIFJlZXhwb3J0LCBSZWZlcmVuY2UsIFJlZmVyZW5jZUVtaXR0ZXJ9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtEaXJlY3RpdmVNZXRhLCBNZXRhZGF0YVJlYWRlciwgTWV0YWRhdGFSZWdpc3RyeSwgTmdNb2R1bGVNZXRhLCBQaXBlTWV0YX0gZnJvbSAnLi4vLi4vbWV0YWRhdGEnO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9ufSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcbmltcG9ydCB7aWRlbnRpZmllck9mTm9kZSwgbm9kZU5hbWVGb3JFcnJvcn0gZnJvbSAnLi4vLi4vdXRpbC9zcmMvdHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7RXhwb3J0U2NvcGUsIFNjb3BlRGF0YX0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtDb21wb25lbnRTY29wZVJlYWRlcn0gZnJvbSAnLi9jb21wb25lbnRfc2NvcGUnO1xuaW1wb3J0IHtEdHNNb2R1bGVTY29wZVJlc29sdmVyfSBmcm9tICcuL2RlcGVuZGVuY3knO1xuXG5leHBvcnQgaW50ZXJmYWNlIExvY2FsTmdNb2R1bGVEYXRhIHtcbiAgZGVjbGFyYXRpb25zOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj5bXTtcbiAgaW1wb3J0czogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+W107XG4gIGV4cG9ydHM6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPltdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExvY2FsTW9kdWxlU2NvcGUgZXh0ZW5kcyBFeHBvcnRTY29wZSB7XG4gIGNvbXBpbGF0aW9uOiBTY29wZURhdGE7XG4gIHJlZXhwb3J0czogUmVleHBvcnRbXXxudWxsO1xuICBzY2hlbWFzOiBTY2hlbWFNZXRhZGF0YVtdO1xufVxuXG4vKipcbiAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjb21waWxhdGlvbiBzY29wZSBvZiBhIHJlZ2lzdGVyZWQgZGVjbGFyYXRpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsYXRpb25TY29wZSBleHRlbmRzIFNjb3BlRGF0YSB7XG4gIC8qKiBUaGUgZGVjbGFyYXRpb24gd2hvc2UgY29tcGlsYXRpb24gc2NvcGUgaXMgZGVzY3JpYmVkIGhlcmUuICovXG4gIGRlY2xhcmF0aW9uOiBDbGFzc0RlY2xhcmF0aW9uO1xuICAvKiogVGhlIGRlY2xhcmF0aW9uIG9mIHRoZSBOZ01vZHVsZSB0aGF0IGRlY2xhcmVzIHRoaXMgYGRlY2xhcmF0aW9uYC4gKi9cbiAgbmdNb2R1bGU6IENsYXNzRGVjbGFyYXRpb247XG59XG5cbi8qKlxuICogQSByZWdpc3RyeSB3aGljaCBjb2xsZWN0cyBpbmZvcm1hdGlvbiBhYm91dCBOZ01vZHVsZXMsIERpcmVjdGl2ZXMsIENvbXBvbmVudHMsIGFuZCBQaXBlcyB3aGljaFxuICogYXJlIGxvY2FsIChkZWNsYXJlZCBpbiB0aGUgdHMuUHJvZ3JhbSBiZWluZyBjb21waWxlZCksIGFuZCBjYW4gcHJvZHVjZSBgTG9jYWxNb2R1bGVTY29wZWBzXG4gKiB3aGljaCBzdW1tYXJpemUgdGhlIGNvbXBpbGF0aW9uIHNjb3BlIG9mIGEgY29tcG9uZW50LlxuICpcbiAqIFRoaXMgY2xhc3MgaW1wbGVtZW50cyB0aGUgbG9naWMgb2YgTmdNb2R1bGUgZGVjbGFyYXRpb25zLCBpbXBvcnRzLCBhbmQgZXhwb3J0cyBhbmQgY2FuIHByb2R1Y2UsXG4gKiBmb3IgYSBnaXZlbiBjb21wb25lbnQsIHRoZSBzZXQgb2YgZGlyZWN0aXZlcyBhbmQgcGlwZXMgd2hpY2ggYXJlIFwidmlzaWJsZVwiIGluIHRoYXQgY29tcG9uZW50J3NcbiAqIHRlbXBsYXRlLlxuICpcbiAqIFRoZSBgTG9jYWxNb2R1bGVTY29wZVJlZ2lzdHJ5YCBoYXMgdHdvIFwibW9kZXNcIiBvZiBvcGVyYXRpb24uIER1cmluZyBhbmFseXNpcywgZGF0YSBmb3IgZWFjaFxuICogaW5kaXZpZHVhbCBOZ01vZHVsZSwgRGlyZWN0aXZlLCBDb21wb25lbnQsIGFuZCBQaXBlIGlzIGFkZGVkIHRvIHRoZSByZWdpc3RyeS4gTm8gYXR0ZW1wdCBpcyBtYWRlXG4gKiB0byB0cmF2ZXJzZSBvciB2YWxpZGF0ZSB0aGUgTmdNb2R1bGUgZ3JhcGggKGltcG9ydHMsIGV4cG9ydHMsIGV0YykuIEFmdGVyIGFuYWx5c2lzLCBvbmUgb2ZcbiAqIGBnZXRTY29wZU9mTW9kdWxlYCBvciBgZ2V0U2NvcGVGb3JDb21wb25lbnRgIGNhbiBiZSBjYWxsZWQsIHdoaWNoIHRyYXZlcnNlcyB0aGUgTmdNb2R1bGUgZ3JhcGhcbiAqIGFuZCBhcHBsaWVzIHRoZSBOZ01vZHVsZSBsb2dpYyB0byBnZW5lcmF0ZSBhIGBMb2NhbE1vZHVsZVNjb3BlYCwgdGhlIGZ1bGwgc2NvcGUgZm9yIHRoZSBnaXZlblxuICogbW9kdWxlIG9yIGNvbXBvbmVudC5cbiAqXG4gKiBUaGUgYExvY2FsTW9kdWxlU2NvcGVSZWdpc3RyeWAgaXMgYWxzbyBjYXBhYmxlIG9mIHByb2R1Y2luZyBgdHMuRGlhZ25vc3RpY2AgZXJyb3JzIHdoZW4gQW5ndWxhclxuICogc2VtYW50aWNzIGFyZSB2aW9sYXRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIExvY2FsTW9kdWxlU2NvcGVSZWdpc3RyeSBpbXBsZW1lbnRzIE1ldGFkYXRhUmVnaXN0cnksIENvbXBvbmVudFNjb3BlUmVhZGVyIHtcbiAgLyoqXG4gICAqIFRyYWNrcyB3aGV0aGVyIHRoZSByZWdpc3RyeSBoYXMgYmVlbiBhc2tlZCB0byBwcm9kdWNlIHNjb3BlcyBmb3IgYSBtb2R1bGUgb3IgY29tcG9uZW50LiBPbmNlXG4gICAqIHRoaXMgaXMgdHJ1ZSwgdGhlIHJlZ2lzdHJ5IGNhbm5vdCBhY2NlcHQgcmVnaXN0cmF0aW9ucyBvZiBuZXcgZGlyZWN0aXZlcy9waXBlcy9tb2R1bGVzIGFzIGl0XG4gICAqIHdvdWxkIGludmFsaWRhdGUgdGhlIGNhY2hlZCBzY29wZSBkYXRhLlxuICAgKi9cbiAgcHJpdmF0ZSBzZWFsZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogQSBtYXAgb2YgY29tcG9uZW50cyBmcm9tIHRoZSBjdXJyZW50IGNvbXBpbGF0aW9uIHVuaXQgdG8gdGhlIE5nTW9kdWxlIHdoaWNoIGRlY2xhcmVkIHRoZW0uXG4gICAqXG4gICAqIEFzIGNvbXBvbmVudHMgYW5kIGRpcmVjdGl2ZXMgYXJlIG5vdCBkaXN0aW5ndWlzaGVkIGF0IHRoZSBOZ01vZHVsZSBsZXZlbCwgdGhpcyBtYXAgbWF5IGFsc29cbiAgICogY29udGFpbiBkaXJlY3RpdmVzLiBUaGlzIGRvZXNuJ3QgY2F1c2UgYW55IHByb2JsZW1zIGJ1dCBpc24ndCB1c2VmdWwgYXMgdGhlcmUgaXMgbm8gY29uY2VwdCBvZlxuICAgKiBhIGRpcmVjdGl2ZSdzIGNvbXBpbGF0aW9uIHNjb3BlLlxuICAgKi9cbiAgcHJpdmF0ZSBkZWNsYXJhdGlvblRvTW9kdWxlID0gbmV3IE1hcDxDbGFzc0RlY2xhcmF0aW9uLCBEZWNsYXJhdGlvbkRhdGE+KCk7XG5cbiAgLyoqXG4gICAqIFRoaXMgbWFwcyBmcm9tIHRoZSBkaXJlY3RpdmUvcGlwZSBjbGFzcyB0byBhIG1hcCBvZiBkYXRhIGZvciBlYWNoIE5nTW9kdWxlIHRoYXQgZGVjbGFyZXMgdGhlXG4gICAqIGRpcmVjdGl2ZS9waXBlLiBUaGlzIGRhdGEgaXMgbmVlZGVkIHRvIHByb2R1Y2UgYW4gZXJyb3IgZm9yIHRoZSBnaXZlbiBjbGFzcy5cbiAgICovXG4gIHByaXZhdGUgZHVwbGljYXRlRGVjbGFyYXRpb25zID1cbiAgICAgIG5ldyBNYXA8Q2xhc3NEZWNsYXJhdGlvbiwgTWFwPENsYXNzRGVjbGFyYXRpb24sIERlY2xhcmF0aW9uRGF0YT4+KCk7XG5cbiAgcHJpdmF0ZSBtb2R1bGVUb1JlZiA9IG5ldyBNYXA8Q2xhc3NEZWNsYXJhdGlvbiwgUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+PigpO1xuXG4gIC8qKlxuICAgKiBBIGNhY2hlIG9mIGNhbGN1bGF0ZWQgYExvY2FsTW9kdWxlU2NvcGVgcyBmb3IgZWFjaCBOZ01vZHVsZSBkZWNsYXJlZCBpbiB0aGUgY3VycmVudCBwcm9ncmFtLlxuICAgKlxuICAgKiBBIHZhbHVlIG9mIGB1bmRlZmluZWRgIGluZGljYXRlcyB0aGUgc2NvcGUgd2FzIGludmFsaWQgYW5kIHByb2R1Y2VkIGVycm9ycyAodGhlcmVmb3JlLFxuICAgKiBkaWFnbm9zdGljcyBzaG91bGQgZXhpc3QgaW4gdGhlIGBzY29wZUVycm9yc2AgbWFwKS5cbiAgICovXG4gIHByaXZhdGUgY2FjaGUgPSBuZXcgTWFwPENsYXNzRGVjbGFyYXRpb24sIExvY2FsTW9kdWxlU2NvcGV8dW5kZWZpbmVkfG51bGw+KCk7XG5cbiAgLyoqXG4gICAqIFRyYWNrcyB3aGV0aGVyIGEgZ2l2ZW4gY29tcG9uZW50IHJlcXVpcmVzIFwicmVtb3RlIHNjb3BpbmdcIi5cbiAgICpcbiAgICogUmVtb3RlIHNjb3BpbmcgaXMgd2hlbiB0aGUgc2V0IG9mIGRpcmVjdGl2ZXMgd2hpY2ggYXBwbHkgdG8gYSBnaXZlbiBjb21wb25lbnQgaXMgc2V0IGluIHRoZVxuICAgKiBOZ01vZHVsZSdzIGZpbGUgaW5zdGVhZCBvZiBkaXJlY3RseSBvbiB0aGUgY29tcG9uZW50IGRlZiAod2hpY2ggaXMgc29tZXRpbWVzIG5lZWRlZCB0byBnZXRcbiAgICogYXJvdW5kIGN5Y2xpYyBpbXBvcnQgaXNzdWVzKS4gVGhpcyBpcyBub3QgdXNlZCBpbiBjYWxjdWxhdGlvbiBvZiBgTG9jYWxNb2R1bGVTY29wZWBzLCBidXQgaXNcbiAgICogdHJhY2tlZCBoZXJlIGZvciBjb252ZW5pZW5jZS5cbiAgICovXG4gIHByaXZhdGUgcmVtb3RlU2NvcGluZyA9IG5ldyBTZXQ8Q2xhc3NEZWNsYXJhdGlvbj4oKTtcblxuICAvKipcbiAgICogVHJhY2tzIGVycm9ycyBhY2N1bXVsYXRlZCBpbiB0aGUgcHJvY2Vzc2luZyBvZiBzY29wZXMgZm9yIGVhY2ggbW9kdWxlIGRlY2xhcmF0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBzY29wZUVycm9ycyA9IG5ldyBNYXA8Q2xhc3NEZWNsYXJhdGlvbiwgdHMuRGlhZ25vc3RpY1tdPigpO1xuXG4gIC8qKlxuICAgKiBUcmFja3Mgd2hpY2ggTmdNb2R1bGVzIGFyZSB1bnJlbGlhYmxlIGR1ZSB0byBlcnJvcnMgd2l0aGluIHRoZWlyIGRlY2xhcmF0aW9ucy5cbiAgICpcbiAgICogVGhpcyBwcm92aWRlcyBhIHVuaWZpZWQgdmlldyBvZiB3aGljaCBtb2R1bGVzIGhhdmUgZXJyb3JzLCBhY3Jvc3MgYWxsIG9mIHRoZSBkaWZmZXJlbnRcbiAgICogZGlhZ25vc3RpYyBjYXRlZ29yaWVzIHRoYXQgY2FuIGJlIHByb2R1Y2VkLiBUaGVvcmV0aWNhbGx5IHRoaXMgY2FuIGJlIGluZmVycmVkIGZyb20gdGhlIG90aGVyXG4gICAqIHByb3BlcnRpZXMgb2YgdGhpcyBjbGFzcywgYnV0IGlzIHRyYWNrZWQgZXhwbGljaXRseSB0byBzaW1wbGlmeSB0aGUgbG9naWMuXG4gICAqL1xuICBwcml2YXRlIHRhaW50ZWRNb2R1bGVzID0gbmV3IFNldDxDbGFzc0RlY2xhcmF0aW9uPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBsb2NhbFJlYWRlcjogTWV0YWRhdGFSZWFkZXIsIHByaXZhdGUgZGVwZW5kZW5jeVNjb3BlUmVhZGVyOiBEdHNNb2R1bGVTY29wZVJlc29sdmVyLFxuICAgICAgcHJpdmF0ZSByZWZFbWl0dGVyOiBSZWZlcmVuY2VFbWl0dGVyLCBwcml2YXRlIGFsaWFzaW5nSG9zdDogQWxpYXNpbmdIb3N0fG51bGwpIHt9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBOZ01vZHVsZSdzIGRhdGEgdG8gdGhlIHJlZ2lzdHJ5LlxuICAgKi9cbiAgcmVnaXN0ZXJOZ01vZHVsZU1ldGFkYXRhKGRhdGE6IE5nTW9kdWxlTWV0YSk6IHZvaWQge1xuICAgIHRoaXMuYXNzZXJ0Q29sbGVjdGluZygpO1xuICAgIGNvbnN0IG5nTW9kdWxlID0gZGF0YS5yZWYubm9kZTtcbiAgICB0aGlzLm1vZHVsZVRvUmVmLnNldChkYXRhLnJlZi5ub2RlLCBkYXRhLnJlZik7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBtb2R1bGUncyBkZWNsYXJhdGlvbnMsIGFuZCBhZGQgdGhlbSB0byBkZWNsYXJhdGlvblRvTW9kdWxlLiBJZiBkdXBsaWNhdGVzXG4gICAgLy8gYXJlIGZvdW5kLCB0aGV5J3JlIGluc3RlYWQgdHJhY2tlZCBpbiBkdXBsaWNhdGVEZWNsYXJhdGlvbnMuXG4gICAgZm9yIChjb25zdCBkZWNsIG9mIGRhdGEuZGVjbGFyYXRpb25zKSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyRGVjbGFyYXRpb25PZk1vZHVsZShuZ01vZHVsZSwgZGVjbCwgZGF0YS5yYXdEZWNsYXJhdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIHJlZ2lzdGVyRGlyZWN0aXZlTWV0YWRhdGEoZGlyZWN0aXZlOiBEaXJlY3RpdmVNZXRhKTogdm9pZCB7fVxuXG4gIHJlZ2lzdGVyUGlwZU1ldGFkYXRhKHBpcGU6IFBpcGVNZXRhKTogdm9pZCB7fVxuXG4gIGdldFNjb3BlRm9yQ29tcG9uZW50KGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogTG9jYWxNb2R1bGVTY29wZXxudWxsfCdlcnJvcicge1xuICAgIGNvbnN0IHNjb3BlID0gIXRoaXMuZGVjbGFyYXRpb25Ub01vZHVsZS5oYXMoY2xhenopID9cbiAgICAgICAgbnVsbCA6XG4gICAgICAgIHRoaXMuZ2V0U2NvcGVPZk1vZHVsZSh0aGlzLmRlY2xhcmF0aW9uVG9Nb2R1bGUuZ2V0KGNsYXp6KSAhLm5nTW9kdWxlKTtcbiAgICByZXR1cm4gc2NvcGU7XG4gIH1cblxuICAvKipcbiAgICogSWYgYG5vZGVgIGlzIGRlY2xhcmVkIGluIG1vcmUgdGhhbiBvbmUgTmdNb2R1bGUgKGR1cGxpY2F0ZSBkZWNsYXJhdGlvbiksIHRoZW4gZ2V0IHRoZVxuICAgKiBgRGVjbGFyYXRpb25EYXRhYCBmb3IgZWFjaCBvZmZlbmRpbmcgZGVjbGFyYXRpb24uXG4gICAqXG4gICAqIE9yZGluYXJpbHkgYSBjbGFzcyBpcyBvbmx5IGRlY2xhcmVkIGluIG9uZSBOZ01vZHVsZSwgaW4gd2hpY2ggY2FzZSB0aGlzIGZ1bmN0aW9uIHJldHVybnNcbiAgICogYG51bGxgLlxuICAgKi9cbiAgZ2V0RHVwbGljYXRlRGVjbGFyYXRpb25zKG5vZGU6IENsYXNzRGVjbGFyYXRpb24pOiBEZWNsYXJhdGlvbkRhdGFbXXxudWxsIHtcbiAgICBpZiAoIXRoaXMuZHVwbGljYXRlRGVjbGFyYXRpb25zLmhhcyhub2RlKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5kdXBsaWNhdGVEZWNsYXJhdGlvbnMuZ2V0KG5vZGUpICEudmFsdWVzKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbGxlY3RzIHJlZ2lzdGVyZWQgZGF0YSBmb3IgYSBtb2R1bGUgYW5kIGl0cyBkaXJlY3RpdmVzL3BpcGVzIGFuZCBjb252ZXJ0IGl0IGludG8gYSBmdWxsXG4gICAqIGBMb2NhbE1vZHVsZVNjb3BlYC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaW1wbGVtZW50cyB0aGUgbG9naWMgb2YgTmdNb2R1bGUgaW1wb3J0cyBhbmQgZXhwb3J0cy4gSXQgcmV0dXJucyB0aGVcbiAgICogYExvY2FsTW9kdWxlU2NvcGVgIGZvciB0aGUgZ2l2ZW4gTmdNb2R1bGUgaWYgb25lIGNhbiBiZSBwcm9kdWNlZCwgYG51bGxgIGlmIG5vIHNjb3BlIHdhcyBldmVyXG4gICAqIGRlZmluZWQsIG9yIHRoZSBzdHJpbmcgYCdlcnJvcidgIGlmIHRoZSBzY29wZSBjb250YWluZWQgZXJyb3JzLlxuICAgKi9cbiAgZ2V0U2NvcGVPZk1vZHVsZShjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbik6IExvY2FsTW9kdWxlU2NvcGV8J2Vycm9yJ3xudWxsIHtcbiAgICBjb25zdCBzY29wZSA9IHRoaXMubW9kdWxlVG9SZWYuaGFzKGNsYXp6KSA/XG4gICAgICAgIHRoaXMuZ2V0U2NvcGVPZk1vZHVsZVJlZmVyZW5jZSh0aGlzLm1vZHVsZVRvUmVmLmdldChjbGF6eikgISkgOlxuICAgICAgICBudWxsO1xuICAgIC8vIElmIHRoZSBOZ01vZHVsZSBjbGFzcyBpcyBtYXJrZWQgYXMgdGFpbnRlZCwgY29uc2lkZXIgaXQgYW4gZXJyb3IuXG4gICAgaWYgKHRoaXMudGFpbnRlZE1vZHVsZXMuaGFzKGNsYXp6KSkge1xuICAgICAgcmV0dXJuICdlcnJvcic7XG4gICAgfVxuXG4gICAgLy8gVHJhbnNsYXRlIHVuZGVmaW5lZCAtPiAnZXJyb3InLlxuICAgIHJldHVybiBzY29wZSAhPT0gdW5kZWZpbmVkID8gc2NvcGUgOiAnZXJyb3InO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhbnkgYHRzLkRpYWdub3N0aWNgcyBwcm9kdWNlZCBkdXJpbmcgdGhlIGNhbGN1bGF0aW9uIG9mIHRoZSBgTG9jYWxNb2R1bGVTY29wZWAgZm9yXG4gICAqIHRoZSBnaXZlbiBOZ01vZHVsZSwgb3IgYG51bGxgIGlmIG5vIGVycm9ycyB3ZXJlIHByZXNlbnQuXG4gICAqL1xuICBnZXREaWFnbm9zdGljc09mTW9kdWxlKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogdHMuRGlhZ25vc3RpY1tdfG51bGwge1xuICAgIC8vIFJlcXVpcmVkIHRvIGVuc3VyZSB0aGUgZXJyb3JzIGFyZSBwb3B1bGF0ZWQgZm9yIHRoZSBnaXZlbiBjbGFzcy4gSWYgaXQgaGFzIGJlZW4gcHJvY2Vzc2VkXG4gICAgLy8gYmVmb3JlLCB0aGlzIHdpbGwgYmUgYSBuby1vcCBkdWUgdG8gdGhlIHNjb3BlIGNhY2hlLlxuICAgIHRoaXMuZ2V0U2NvcGVPZk1vZHVsZShjbGF6eik7XG5cbiAgICBpZiAodGhpcy5zY29wZUVycm9ycy5oYXMoY2xhenopKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY29wZUVycm9ycy5nZXQoY2xhenopICE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgY29sbGVjdGlvbiBvZiB0aGUgY29tcGlsYXRpb24gc2NvcGUgZm9yIGVhY2ggcmVnaXN0ZXJlZCBkZWNsYXJhdGlvbi5cbiAgICovXG4gIGdldENvbXBpbGF0aW9uU2NvcGVzKCk6IENvbXBpbGF0aW9uU2NvcGVbXSB7XG4gICAgY29uc3Qgc2NvcGVzOiBDb21waWxhdGlvblNjb3BlW10gPSBbXTtcbiAgICB0aGlzLmRlY2xhcmF0aW9uVG9Nb2R1bGUuZm9yRWFjaCgoZGVjbERhdGEsIGRlY2xhcmF0aW9uKSA9PiB7XG4gICAgICBjb25zdCBzY29wZSA9IHRoaXMuZ2V0U2NvcGVPZk1vZHVsZShkZWNsRGF0YS5uZ01vZHVsZSk7XG4gICAgICBpZiAoc2NvcGUgIT09IG51bGwgJiYgc2NvcGUgIT09ICdlcnJvcicpIHtcbiAgICAgICAgc2NvcGVzLnB1c2goe2RlY2xhcmF0aW9uLCBuZ01vZHVsZTogZGVjbERhdGEubmdNb2R1bGUsIC4uLnNjb3BlLmNvbXBpbGF0aW9ufSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHNjb3BlcztcbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJEZWNsYXJhdGlvbk9mTW9kdWxlKFxuICAgICAgbmdNb2R1bGU6IENsYXNzRGVjbGFyYXRpb24sIGRlY2w6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPixcbiAgICAgIHJhd0RlY2xhcmF0aW9uczogdHMuRXhwcmVzc2lvbnxudWxsKTogdm9pZCB7XG4gICAgY29uc3QgZGVjbERhdGE6IERlY2xhcmF0aW9uRGF0YSA9IHtcbiAgICAgIG5nTW9kdWxlLFxuICAgICAgcmVmOiBkZWNsLCByYXdEZWNsYXJhdGlvbnMsXG4gICAgfTtcblxuICAgIC8vIEZpcnN0LCBjaGVjayBmb3IgZHVwbGljYXRlIGRlY2xhcmF0aW9ucyBvZiB0aGUgc2FtZSBkaXJlY3RpdmUvcGlwZS5cbiAgICBpZiAodGhpcy5kdXBsaWNhdGVEZWNsYXJhdGlvbnMuaGFzKGRlY2wubm9kZSkpIHtcbiAgICAgIC8vIFRoaXMgZGlyZWN0aXZlL3BpcGUgaGFzIGFscmVhZHkgYmVlbiBpZGVudGlmaWVkIGFzIGJlaW5nIGR1cGxpY2F0ZWQuIEFkZCB0aGlzIG1vZHVsZSB0byB0aGVcbiAgICAgIC8vIG1hcCBvZiBtb2R1bGVzIGZvciB3aGljaCBhIGR1cGxpY2F0ZSBkZWNsYXJhdGlvbiBleGlzdHMuXG4gICAgICB0aGlzLmR1cGxpY2F0ZURlY2xhcmF0aW9ucy5nZXQoZGVjbC5ub2RlKSAhLnNldChuZ01vZHVsZSwgZGVjbERhdGEpO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHRoaXMuZGVjbGFyYXRpb25Ub01vZHVsZS5oYXMoZGVjbC5ub2RlKSAmJlxuICAgICAgICB0aGlzLmRlY2xhcmF0aW9uVG9Nb2R1bGUuZ2V0KGRlY2wubm9kZSkgIS5uZ01vZHVsZSAhPT0gbmdNb2R1bGUpIHtcbiAgICAgIC8vIFRoaXMgZGlyZWN0aXZlL3BpcGUgaXMgYWxyZWFkeSByZWdpc3RlcmVkIGFzIGRlY2xhcmVkIGluIGFub3RoZXIgbW9kdWxlLiBNYXJrIGl0IGFzIGFcbiAgICAgIC8vIGR1cGxpY2F0ZSBpbnN0ZWFkLlxuICAgICAgY29uc3QgZHVwbGljYXRlRGVjbE1hcCA9IG5ldyBNYXA8Q2xhc3NEZWNsYXJhdGlvbiwgRGVjbGFyYXRpb25EYXRhPigpO1xuICAgICAgY29uc3QgZmlyc3REZWNsRGF0YSA9IHRoaXMuZGVjbGFyYXRpb25Ub01vZHVsZS5nZXQoZGVjbC5ub2RlKSAhO1xuXG4gICAgICAvLyBNYXJrIGJvdGggbW9kdWxlcyBhcyB0YWludGVkLCBzaW5jZSB0aGVpciBkZWNsYXJhdGlvbnMgYXJlIG1pc3NpbmcgYSBjb21wb25lbnQuXG4gICAgICB0aGlzLnRhaW50ZWRNb2R1bGVzLmFkZChmaXJzdERlY2xEYXRhLm5nTW9kdWxlKTtcbiAgICAgIHRoaXMudGFpbnRlZE1vZHVsZXMuYWRkKG5nTW9kdWxlKTtcblxuICAgICAgLy8gQmVpbmcgZGV0ZWN0ZWQgYXMgYSBkdXBsaWNhdGUgbWVhbnMgdGhlcmUgYXJlIHR3byBOZ01vZHVsZXMgKGZvciBub3cpIHdoaWNoIGRlY2xhcmUgdGhpc1xuICAgICAgLy8gZGlyZWN0aXZlL3BpcGUuIEFkZCBib3RoIG9mIHRoZW0gdG8gdGhlIGR1cGxpY2F0ZSB0cmFja2luZyBtYXAuXG4gICAgICBkdXBsaWNhdGVEZWNsTWFwLnNldChmaXJzdERlY2xEYXRhLm5nTW9kdWxlLCBmaXJzdERlY2xEYXRhKTtcbiAgICAgIGR1cGxpY2F0ZURlY2xNYXAuc2V0KG5nTW9kdWxlLCBkZWNsRGF0YSk7XG4gICAgICB0aGlzLmR1cGxpY2F0ZURlY2xhcmF0aW9ucy5zZXQoZGVjbC5ub2RlLCBkdXBsaWNhdGVEZWNsTWFwKTtcblxuICAgICAgLy8gUmVtb3ZlIHRoZSBkaXJlY3RpdmUvcGlwZSBmcm9tIGBkZWNsYXJhdGlvblRvTW9kdWxlYCBhcyBpdCdzIGEgZHVwbGljYXRlIGRlY2xhcmF0aW9uLCBhbmRcbiAgICAgIC8vIHRoZXJlZm9yZSBub3QgdmFsaWQuXG4gICAgICB0aGlzLmRlY2xhcmF0aW9uVG9Nb2R1bGUuZGVsZXRlKGRlY2wubm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoaXMgaXMgdGhlIGZpcnN0IGRlY2xhcmF0aW9uIG9mIHRoaXMgZGlyZWN0aXZlL3BpcGUsIHNvIG1hcCBpdC5cbiAgICAgIHRoaXMuZGVjbGFyYXRpb25Ub01vZHVsZS5zZXQoZGVjbC5ub2RlLCBkZWNsRGF0YSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGF0aW9uIG9mIGBnZXRTY29wZU9mTW9kdWxlYCB3aGljaCBhY2NlcHRzIGEgcmVmZXJlbmNlIHRvIGEgY2xhc3MgYW5kIGRpZmZlcmVudGlhdGVzXG4gICAqIGJldHdlZW46XG4gICAqXG4gICAqICogbm8gc2NvcGUgYmVpbmcgYXZhaWxhYmxlIChyZXR1cm5zIGBudWxsYClcbiAgICogKiBhIHNjb3BlIGJlaW5nIHByb2R1Y2VkIHdpdGggZXJyb3JzIChyZXR1cm5zIGB1bmRlZmluZWRgKS5cbiAgICovXG4gIHByaXZhdGUgZ2V0U2NvcGVPZk1vZHVsZVJlZmVyZW5jZShyZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPik6IExvY2FsTW9kdWxlU2NvcGV8bnVsbFxuICAgICAgfHVuZGVmaW5lZCB7XG4gICAgaWYgKHRoaXMuY2FjaGUuaGFzKHJlZi5ub2RlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuZ2V0KHJlZi5ub2RlKTtcbiAgICB9XG5cbiAgICAvLyBTZWFsIHRoZSByZWdpc3RyeSB0byBwcm90ZWN0IHRoZSBpbnRlZ3JpdHkgb2YgdGhlIGBMb2NhbE1vZHVsZVNjb3BlYCBjYWNoZS5cbiAgICB0aGlzLnNlYWxlZCA9IHRydWU7XG5cbiAgICAvLyBgcmVmYCBzaG91bGQgYmUgYW4gTmdNb2R1bGUgcHJldmlvdXNseSBhZGRlZCB0byB0aGUgcmVnaXN0cnkuIElmIG5vdCwgYSBzY29wZSBmb3IgaXRcbiAgICAvLyBjYW5ub3QgYmUgcHJvZHVjZWQuXG4gICAgY29uc3QgbmdNb2R1bGUgPSB0aGlzLmxvY2FsUmVhZGVyLmdldE5nTW9kdWxlTWV0YWRhdGEocmVmKTtcbiAgICBpZiAobmdNb2R1bGUgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuY2FjaGUuc2V0KHJlZi5ub2RlLCBudWxsKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIEVycm9ycyBwcm9kdWNlZCBkdXJpbmcgY29tcHV0YXRpb24gb2YgdGhlIHNjb3BlIGFyZSByZWNvcmRlZCBoZXJlLiBBdCB0aGUgZW5kLCBpZiB0aGlzIGFycmF5XG4gICAgLy8gaXNuJ3QgZW1wdHkgdGhlbiBgdW5kZWZpbmVkYCB3aWxsIGJlIGNhY2hlZCBhbmQgcmV0dXJuZWQgdG8gaW5kaWNhdGUgdGhpcyBzY29wZSBpcyBpbnZhbGlkLlxuICAgIGNvbnN0IGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW10gPSBbXTtcblxuICAgIC8vIEF0IHRoaXMgcG9pbnQsIHRoZSBnb2FsIGlzIHRvIHByb2R1Y2UgdHdvIGRpc3RpbmN0IHRyYW5zaXRpdmUgc2V0czpcbiAgICAvLyAtIHRoZSBkaXJlY3RpdmVzIGFuZCBwaXBlcyB3aGljaCBhcmUgdmlzaWJsZSB0byBjb21wb25lbnRzIGRlY2xhcmVkIGluIHRoZSBOZ01vZHVsZS5cbiAgICAvLyAtIHRoZSBkaXJlY3RpdmVzIGFuZCBwaXBlcyB3aGljaCBhcmUgZXhwb3J0ZWQgdG8gYW55IE5nTW9kdWxlcyB3aGljaCBpbXBvcnQgdGhpcyBvbmUuXG5cbiAgICAvLyBEaXJlY3RpdmVzIGFuZCBwaXBlcyBpbiB0aGUgY29tcGlsYXRpb24gc2NvcGUuXG4gICAgY29uc3QgY29tcGlsYXRpb25EaXJlY3RpdmVzID0gbmV3IE1hcDx0cy5EZWNsYXJhdGlvbiwgRGlyZWN0aXZlTWV0YT4oKTtcbiAgICBjb25zdCBjb21waWxhdGlvblBpcGVzID0gbmV3IE1hcDx0cy5EZWNsYXJhdGlvbiwgUGlwZU1ldGE+KCk7XG5cbiAgICBjb25zdCBkZWNsYXJlZCA9IG5ldyBTZXQ8dHMuRGVjbGFyYXRpb24+KCk7XG5cbiAgICAvLyBEaXJlY3RpdmVzIGFuZCBwaXBlcyBleHBvcnRlZCB0byBhbnkgaW1wb3J0aW5nIE5nTW9kdWxlcy5cbiAgICBjb25zdCBleHBvcnREaXJlY3RpdmVzID0gbmV3IE1hcDx0cy5EZWNsYXJhdGlvbiwgRGlyZWN0aXZlTWV0YT4oKTtcbiAgICBjb25zdCBleHBvcnRQaXBlcyA9IG5ldyBNYXA8dHMuRGVjbGFyYXRpb24sIFBpcGVNZXRhPigpO1xuXG4gICAgLy8gVGhlIGFsZ29yaXRobSBpcyBhcyBmb2xsb3dzOlxuICAgIC8vIDEpIEFkZCBkaXJlY3RpdmVzL3BpcGVzIGRlY2xhcmVkIGluIHRoZSBOZ01vZHVsZSB0byB0aGUgY29tcGlsYXRpb24gc2NvcGUuXG4gICAgLy8gMikgQWRkIGFsbCBvZiB0aGUgZGlyZWN0aXZlcy9waXBlcyBmcm9tIGVhY2ggTmdNb2R1bGUgaW1wb3J0ZWQgaW50byB0aGUgY3VycmVudCBvbmUgdG8gdGhlXG4gICAgLy8gICAgY29tcGlsYXRpb24gc2NvcGUuIEF0IHRoaXMgcG9pbnQsIHRoZSBjb21waWxhdGlvbiBzY29wZSBpcyBjb21wbGV0ZS5cbiAgICAvLyAzKSBGb3IgZWFjaCBlbnRyeSBpbiB0aGUgTmdNb2R1bGUncyBleHBvcnRzOlxuICAgIC8vICAgIGEpIEF0dGVtcHQgdG8gcmVzb2x2ZSBpdCBhcyBhbiBOZ01vZHVsZSB3aXRoIGl0cyBvd24gZXhwb3J0ZWQgZGlyZWN0aXZlcy9waXBlcy4gSWYgaXQgaXNcbiAgICAvLyAgICAgICBvbmUsIGFkZCB0aGVtIHRvIHRoZSBleHBvcnQgc2NvcGUgb2YgdGhpcyBOZ01vZHVsZS5cbiAgICAvLyAgICBiKSBPdGhlcndpc2UsIGl0IHNob3VsZCBiZSBhIGNsYXNzIGluIHRoZSBjb21waWxhdGlvbiBzY29wZSBvZiB0aGlzIE5nTW9kdWxlLiBJZiBpdCBpcyxcbiAgICAvLyAgICAgICBhZGQgaXQgdG8gdGhlIGV4cG9ydCBzY29wZS5cbiAgICAvLyAgICBjKSBJZiBpdCdzIG5laXRoZXIgYW4gTmdNb2R1bGUgbm9yIGEgZGlyZWN0aXZlL3BpcGUgaW4gdGhlIGNvbXBpbGF0aW9uIHNjb3BlLCB0aGVuIHRoaXNcbiAgICAvLyAgICAgICBpcyBhbiBlcnJvci5cblxuICAgIC8vIDEpIGFkZCBkZWNsYXJhdGlvbnMuXG4gICAgZm9yIChjb25zdCBkZWNsIG9mIG5nTW9kdWxlLmRlY2xhcmF0aW9ucykge1xuICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy5sb2NhbFJlYWRlci5nZXREaXJlY3RpdmVNZXRhZGF0YShkZWNsKTtcbiAgICAgIGNvbnN0IHBpcGUgPSB0aGlzLmxvY2FsUmVhZGVyLmdldFBpcGVNZXRhZGF0YShkZWNsKTtcbiAgICAgIGlmIChkaXJlY3RpdmUgIT09IG51bGwpIHtcbiAgICAgICAgY29tcGlsYXRpb25EaXJlY3RpdmVzLnNldChkZWNsLm5vZGUsIHsuLi5kaXJlY3RpdmUsIHJlZjogZGVjbH0pO1xuICAgICAgfSBlbHNlIGlmIChwaXBlICE9PSBudWxsKSB7XG4gICAgICAgIGNvbXBpbGF0aW9uUGlwZXMuc2V0KGRlY2wubm9kZSwgey4uLnBpcGUsIHJlZjogZGVjbH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50YWludGVkTW9kdWxlcy5hZGQobmdNb2R1bGUucmVmLm5vZGUpO1xuXG4gICAgICAgIGNvbnN0IGVycm9yTm9kZSA9IGRlY2wuZ2V0T3JpZ2luRm9yRGlhZ25vc3RpY3MobmdNb2R1bGUucmF3RGVjbGFyYXRpb25zICEpO1xuICAgICAgICBkaWFnbm9zdGljcy5wdXNoKG1ha2VEaWFnbm9zdGljKFxuICAgICAgICAgICAgRXJyb3JDb2RlLk5HTU9EVUxFX0lOVkFMSURfREVDTEFSQVRJT04sIGVycm9yTm9kZSxcbiAgICAgICAgICAgIGBUaGUgY2xhc3MgJyR7ZGVjbC5ub2RlLm5hbWUudGV4dH0nIGlzIGxpc3RlZCBpbiB0aGUgZGVjbGFyYXRpb25zIG9mIHRoZSBOZ01vZHVsZSAnJHtuZ01vZHVsZS5yZWYubm9kZS5uYW1lLnRleHR9JywgYnV0IGlzIG5vdCBhIGRpcmVjdGl2ZSwgYSBjb21wb25lbnQsIG9yIGEgcGlwZS5cblxuRWl0aGVyIHJlbW92ZSBpdCBmcm9tIHRoZSBOZ01vZHVsZSdzIGRlY2xhcmF0aW9ucywgb3IgYWRkIGFuIGFwcHJvcHJpYXRlIEFuZ3VsYXIgZGVjb3JhdG9yLmAsXG4gICAgICAgICAgICBbe25vZGU6IGRlY2wubm9kZS5uYW1lLCBtZXNzYWdlVGV4dDogYCcke2RlY2wubm9kZS5uYW1lLnRleHR9JyBpcyBkZWNsYXJlZCBoZXJlLmB9XSkpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgZGVjbGFyZWQuYWRkKGRlY2wubm9kZSk7XG4gICAgfVxuXG4gICAgLy8gMikgcHJvY2VzcyBpbXBvcnRzLlxuICAgIGZvciAoY29uc3QgZGVjbCBvZiBuZ01vZHVsZS5pbXBvcnRzKSB7XG4gICAgICBjb25zdCBpbXBvcnRTY29wZSA9IHRoaXMuZ2V0RXhwb3J0ZWRTY29wZShkZWNsLCBkaWFnbm9zdGljcywgcmVmLm5vZGUsICdpbXBvcnQnKTtcbiAgICAgIGlmIChpbXBvcnRTY29wZSA9PT0gbnVsbCkge1xuICAgICAgICAvLyBBbiBpbXBvcnQgd2Fzbid0IGFuIE5nTW9kdWxlLCBzbyByZWNvcmQgYW4gZXJyb3IuXG4gICAgICAgIGRpYWdub3N0aWNzLnB1c2goaW52YWxpZFJlZihyZWYubm9kZSwgZGVjbCwgJ2ltcG9ydCcpKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2UgaWYgKGltcG9ydFNjb3BlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gQW4gaW1wb3J0IHdhcyBhbiBOZ01vZHVsZSBidXQgY29udGFpbmVkIGVycm9ycyBvZiBpdHMgb3duLiBSZWNvcmQgdGhpcyBhcyBhbiBlcnJvciB0b28sXG4gICAgICAgIC8vIGJlY2F1c2UgdGhpcyBzY29wZSBpcyBhbHdheXMgZ29pbmcgdG8gYmUgaW5jb3JyZWN0IGlmIG9uZSBvZiBpdHMgaW1wb3J0cyBjb3VsZCBub3QgYmVcbiAgICAgICAgLy8gcmVhZC5cbiAgICAgICAgZGlhZ25vc3RpY3MucHVzaChpbnZhbGlkVHJhbnNpdGl2ZU5nTW9kdWxlUmVmKHJlZi5ub2RlLCBkZWNsLCAnaW1wb3J0JykpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgZGlyZWN0aXZlIG9mIGltcG9ydFNjb3BlLmV4cG9ydGVkLmRpcmVjdGl2ZXMpIHtcbiAgICAgICAgY29tcGlsYXRpb25EaXJlY3RpdmVzLnNldChkaXJlY3RpdmUucmVmLm5vZGUsIGRpcmVjdGl2ZSk7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IHBpcGUgb2YgaW1wb3J0U2NvcGUuZXhwb3J0ZWQucGlwZXMpIHtcbiAgICAgICAgY29tcGlsYXRpb25QaXBlcy5zZXQocGlwZS5yZWYubm9kZSwgcGlwZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gMykgcHJvY2VzcyBleHBvcnRzLlxuICAgIC8vIEV4cG9ydHMgY2FuIGNvbnRhaW4gbW9kdWxlcywgY29tcG9uZW50cywgb3IgZGlyZWN0aXZlcy4gVGhleSdyZSBwcm9jZXNzZWQgZGlmZmVyZW50bHkuXG4gICAgLy8gTW9kdWxlcyBhcmUgc3RyYWlnaHRmb3J3YXJkLiBEaXJlY3RpdmVzIGFuZCBwaXBlcyBmcm9tIGV4cG9ydGVkIG1vZHVsZXMgYXJlIGFkZGVkIHRvIHRoZVxuICAgIC8vIGV4cG9ydCBtYXBzLiBEaXJlY3RpdmVzL3BpcGVzIGFyZSBkaWZmZXJlbnQgLSB0aGV5IG1pZ2h0IGJlIGV4cG9ydHMgb2YgZGVjbGFyZWQgdHlwZXMgb3JcbiAgICAvLyBpbXBvcnRlZCB0eXBlcy5cbiAgICBmb3IgKGNvbnN0IGRlY2wgb2YgbmdNb2R1bGUuZXhwb3J0cykge1xuICAgICAgLy8gQXR0ZW1wdCB0byByZXNvbHZlIGRlY2wgYXMgYW4gTmdNb2R1bGUuXG4gICAgICBjb25zdCBpbXBvcnRTY29wZSA9IHRoaXMuZ2V0RXhwb3J0ZWRTY29wZShkZWNsLCBkaWFnbm9zdGljcywgcmVmLm5vZGUsICdleHBvcnQnKTtcbiAgICAgIGlmIChpbXBvcnRTY29wZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIEFuIGV4cG9ydCB3YXMgYW4gTmdNb2R1bGUgYnV0IGNvbnRhaW5lZCBlcnJvcnMgb2YgaXRzIG93bi4gUmVjb3JkIHRoaXMgYXMgYW4gZXJyb3IgdG9vLFxuICAgICAgICAvLyBiZWNhdXNlIHRoaXMgc2NvcGUgaXMgYWx3YXlzIGdvaW5nIHRvIGJlIGluY29ycmVjdCBpZiBvbmUgb2YgaXRzIGV4cG9ydHMgY291bGQgbm90IGJlXG4gICAgICAgIC8vIHJlYWQuXG4gICAgICAgIGRpYWdub3N0aWNzLnB1c2goaW52YWxpZFRyYW5zaXRpdmVOZ01vZHVsZVJlZihyZWYubm9kZSwgZGVjbCwgJ2V4cG9ydCcpKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2UgaWYgKGltcG9ydFNjb3BlICE9PSBudWxsKSB7XG4gICAgICAgIC8vIGRlY2wgaXMgYW4gTmdNb2R1bGUuXG4gICAgICAgIGZvciAoY29uc3QgZGlyZWN0aXZlIG9mIGltcG9ydFNjb3BlLmV4cG9ydGVkLmRpcmVjdGl2ZXMpIHtcbiAgICAgICAgICBleHBvcnREaXJlY3RpdmVzLnNldChkaXJlY3RpdmUucmVmLm5vZGUsIGRpcmVjdGl2ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwaXBlIG9mIGltcG9ydFNjb3BlLmV4cG9ydGVkLnBpcGVzKSB7XG4gICAgICAgICAgZXhwb3J0UGlwZXMuc2V0KHBpcGUucmVmLm5vZGUsIHBpcGUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGNvbXBpbGF0aW9uRGlyZWN0aXZlcy5oYXMoZGVjbC5ub2RlKSkge1xuICAgICAgICAvLyBkZWNsIGlzIGEgZGlyZWN0aXZlIG9yIGNvbXBvbmVudCBpbiB0aGUgY29tcGlsYXRpb24gc2NvcGUgb2YgdGhpcyBOZ01vZHVsZS5cbiAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gY29tcGlsYXRpb25EaXJlY3RpdmVzLmdldChkZWNsLm5vZGUpICE7XG4gICAgICAgIGV4cG9ydERpcmVjdGl2ZXMuc2V0KGRlY2wubm9kZSwgZGlyZWN0aXZlKTtcbiAgICAgIH0gZWxzZSBpZiAoY29tcGlsYXRpb25QaXBlcy5oYXMoZGVjbC5ub2RlKSkge1xuICAgICAgICAvLyBkZWNsIGlzIGEgcGlwZSBpbiB0aGUgY29tcGlsYXRpb24gc2NvcGUgb2YgdGhpcyBOZ01vZHVsZS5cbiAgICAgICAgY29uc3QgcGlwZSA9IGNvbXBpbGF0aW9uUGlwZXMuZ2V0KGRlY2wubm9kZSkgITtcbiAgICAgICAgZXhwb3J0UGlwZXMuc2V0KGRlY2wubm9kZSwgcGlwZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkZWNsIGlzIGFuIHVua25vd24gZXhwb3J0LlxuICAgICAgICBpZiAodGhpcy5sb2NhbFJlYWRlci5nZXREaXJlY3RpdmVNZXRhZGF0YShkZWNsKSAhPT0gbnVsbCB8fFxuICAgICAgICAgICAgdGhpcy5sb2NhbFJlYWRlci5nZXRQaXBlTWV0YWRhdGEoZGVjbCkgIT09IG51bGwpIHtcbiAgICAgICAgICBkaWFnbm9zdGljcy5wdXNoKGludmFsaWRSZWV4cG9ydChyZWYubm9kZSwgZGVjbCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRpYWdub3N0aWNzLnB1c2goaW52YWxpZFJlZihyZWYubm9kZSwgZGVjbCwgJ2V4cG9ydCcpKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBleHBvcnRlZCA9IHtcbiAgICAgIGRpcmVjdGl2ZXM6IEFycmF5LmZyb20oZXhwb3J0RGlyZWN0aXZlcy52YWx1ZXMoKSksXG4gICAgICBwaXBlczogQXJyYXkuZnJvbShleHBvcnRQaXBlcy52YWx1ZXMoKSksXG4gICAgfTtcblxuICAgIGNvbnN0IHJlZXhwb3J0cyA9IHRoaXMuZ2V0UmVleHBvcnRzKG5nTW9kdWxlLCByZWYsIGRlY2xhcmVkLCBleHBvcnRlZCwgZGlhZ25vc3RpY3MpO1xuXG4gICAgLy8gQ2hlY2sgaWYgdGhpcyBzY29wZSBoYWQgYW55IGVycm9ycyBkdXJpbmcgcHJvZHVjdGlvbi5cbiAgICBpZiAoZGlhZ25vc3RpY3MubGVuZ3RoID4gMCkge1xuICAgICAgLy8gQ2FjaGUgdW5kZWZpbmVkLCB0byBtYXJrIHRoZSBmYWN0IHRoYXQgdGhlIHNjb3BlIGlzIGludmFsaWQuXG4gICAgICB0aGlzLmNhY2hlLnNldChyZWYubm9kZSwgdW5kZWZpbmVkKTtcblxuICAgICAgLy8gU2F2ZSB0aGUgZXJyb3JzIGZvciByZXRyaWV2YWwuXG4gICAgICB0aGlzLnNjb3BlRXJyb3JzLnNldChyZWYubm9kZSwgZGlhZ25vc3RpY3MpO1xuXG4gICAgICAvLyBNYXJrIHRoaXMgbW9kdWxlIGFzIGJlaW5nIHRhaW50ZWQuXG4gICAgICB0aGlzLnRhaW50ZWRNb2R1bGVzLmFkZChyZWYubm9kZSk7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIEZpbmFsbHksIHByb2R1Y2UgdGhlIGBMb2NhbE1vZHVsZVNjb3BlYCB3aXRoIGJvdGggdGhlIGNvbXBpbGF0aW9uIGFuZCBleHBvcnQgc2NvcGVzLlxuICAgIGNvbnN0IHNjb3BlID0ge1xuICAgICAgY29tcGlsYXRpb246IHtcbiAgICAgICAgZGlyZWN0aXZlczogQXJyYXkuZnJvbShjb21waWxhdGlvbkRpcmVjdGl2ZXMudmFsdWVzKCkpLFxuICAgICAgICBwaXBlczogQXJyYXkuZnJvbShjb21waWxhdGlvblBpcGVzLnZhbHVlcygpKSxcbiAgICAgIH0sXG4gICAgICBleHBvcnRlZCxcbiAgICAgIHJlZXhwb3J0cyxcbiAgICAgIHNjaGVtYXM6IG5nTW9kdWxlLnNjaGVtYXMsXG4gICAgfTtcbiAgICB0aGlzLmNhY2hlLnNldChyZWYubm9kZSwgc2NvcGUpO1xuICAgIHJldHVybiBzY29wZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIGEgY29tcG9uZW50IHJlcXVpcmVzIHJlbW90ZSBzY29waW5nLlxuICAgKi9cbiAgZ2V0UmVxdWlyZXNSZW1vdGVTY29wZShub2RlOiBDbGFzc0RlY2xhcmF0aW9uKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnJlbW90ZVNjb3BpbmcuaGFzKG5vZGUpOyB9XG5cbiAgLyoqXG4gICAqIFNldCBhIGNvbXBvbmVudCBhcyByZXF1aXJpbmcgcmVtb3RlIHNjb3BpbmcuXG4gICAqL1xuICBzZXRDb21wb25lbnRBc1JlcXVpcmluZ1JlbW90ZVNjb3Bpbmcobm9kZTogQ2xhc3NEZWNsYXJhdGlvbik6IHZvaWQge1xuICAgIHRoaXMucmVtb3RlU2NvcGluZy5hZGQobm9kZSk7XG4gIH1cblxuICAvKipcbiAgICogTG9vayB1cCB0aGUgYEV4cG9ydFNjb3BlYCBvZiBhIGdpdmVuIGBSZWZlcmVuY2VgIHRvIGFuIE5nTW9kdWxlLlxuICAgKlxuICAgKiBUaGUgTmdNb2R1bGUgaW4gcXVlc3Rpb24gbWF5IGJlIGRlY2xhcmVkIGxvY2FsbHkgaW4gdGhlIGN1cnJlbnQgdHMuUHJvZ3JhbSwgb3IgaXQgbWF5IGJlXG4gICAqIGRlY2xhcmVkIGluIGEgLmQudHMgZmlsZS5cbiAgICpcbiAgICogQHJldHVybnMgYG51bGxgIGlmIG5vIHNjb3BlIGNvdWxkIGJlIGZvdW5kLCBvciBgdW5kZWZpbmVkYCBpZiBhbiBpbnZhbGlkIHNjb3BlXG4gICAqIHdhcyBmb3VuZC5cbiAgICpcbiAgICogTWF5IGFsc28gY29udHJpYnV0ZSBkaWFnbm9zdGljcyBvZiBpdHMgb3duIGJ5IGFkZGluZyB0byB0aGUgZ2l2ZW4gYGRpYWdub3N0aWNzYFxuICAgKiBhcnJheSBwYXJhbWV0ZXIuXG4gICAqL1xuICBwcml2YXRlIGdldEV4cG9ydGVkU2NvcGUoXG4gICAgICByZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPiwgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSxcbiAgICAgIG93bmVyRm9yRXJyb3JzOiB0cy5EZWNsYXJhdGlvbiwgdHlwZTogJ2ltcG9ydCd8J2V4cG9ydCcpOiBFeHBvcnRTY29wZXxudWxsfHVuZGVmaW5lZCB7XG4gICAgaWYgKHJlZi5ub2RlLmdldFNvdXJjZUZpbGUoKS5pc0RlY2xhcmF0aW9uRmlsZSkge1xuICAgICAgLy8gVGhlIE5nTW9kdWxlIGlzIGRlY2xhcmVkIGluIGEgLmQudHMgZmlsZS4gUmVzb2x2ZSBpdCB3aXRoIHRoZSBgRGVwZW5kZW5jeVNjb3BlUmVhZGVyYC5cbiAgICAgIGlmICghdHMuaXNDbGFzc0RlY2xhcmF0aW9uKHJlZi5ub2RlKSkge1xuICAgICAgICAvLyBUaGUgTmdNb2R1bGUgaXMgaW4gYSAuZC50cyBmaWxlIGJ1dCBpcyBub3QgZGVjbGFyZWQgYXMgYSB0cy5DbGFzc0RlY2xhcmF0aW9uLiBUaGlzIGlzIGFuXG4gICAgICAgIC8vIGVycm9yIGluIHRoZSAuZC50cyBtZXRhZGF0YS5cbiAgICAgICAgY29uc3QgY29kZSA9IHR5cGUgPT09ICdpbXBvcnQnID8gRXJyb3JDb2RlLk5HTU9EVUxFX0lOVkFMSURfSU1QT1JUIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRXJyb3JDb2RlLk5HTU9EVUxFX0lOVkFMSURfRVhQT1JUO1xuICAgICAgICBkaWFnbm9zdGljcy5wdXNoKG1ha2VEaWFnbm9zdGljKFxuICAgICAgICAgICAgY29kZSwgaWRlbnRpZmllck9mTm9kZShyZWYubm9kZSkgfHwgcmVmLm5vZGUsXG4gICAgICAgICAgICBgQXBwZWFycyBpbiB0aGUgTmdNb2R1bGUuJHt0eXBlfXMgb2YgJHtub2RlTmFtZUZvckVycm9yKG93bmVyRm9yRXJyb3JzKX0sIGJ1dCBjb3VsZCBub3QgYmUgcmVzb2x2ZWQgdG8gYW4gTmdNb2R1bGVgKSk7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5kZXBlbmRlbmN5U2NvcGVSZWFkZXIucmVzb2x2ZShyZWYpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgTmdNb2R1bGUgaXMgZGVjbGFyZWQgbG9jYWxseSBpbiB0aGUgY3VycmVudCBwcm9ncmFtLiBSZXNvbHZlIGl0IGZyb20gdGhlIHJlZ2lzdHJ5LlxuICAgICAgcmV0dXJuIHRoaXMuZ2V0U2NvcGVPZk1vZHVsZVJlZmVyZW5jZShyZWYpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmVleHBvcnRzKFxuICAgICAgbmdNb2R1bGU6IE5nTW9kdWxlTWV0YSwgcmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4sIGRlY2xhcmVkOiBTZXQ8dHMuRGVjbGFyYXRpb24+LFxuICAgICAgZXhwb3J0ZWQ6IHtkaXJlY3RpdmVzOiBEaXJlY3RpdmVNZXRhW10sIHBpcGVzOiBQaXBlTWV0YVtdfSxcbiAgICAgIGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW10pOiBSZWV4cG9ydFtdfG51bGwge1xuICAgIGxldCByZWV4cG9ydHM6IFJlZXhwb3J0W118bnVsbCA9IG51bGw7XG4gICAgY29uc3Qgc291cmNlRmlsZSA9IHJlZi5ub2RlLmdldFNvdXJjZUZpbGUoKTtcbiAgICBpZiAodGhpcy5hbGlhc2luZ0hvc3QgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZWV4cG9ydHMgPSBbXTtcbiAgICAvLyBUcmFjayByZS1leHBvcnRzIGJ5IHN5bWJvbCBuYW1lLCB0byBwcm9kdWNlIGRpYWdub3N0aWNzIGlmIHR3byBhbGlhcyByZS1leHBvcnRzIHdvdWxkIHNoYXJlXG4gICAgLy8gdGhlIHNhbWUgbmFtZS5cbiAgICBjb25zdCByZWV4cG9ydE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4+KCk7XG4gICAgLy8gQWxpYXMgbmdNb2R1bGVSZWYgYWRkZWQgZm9yIHJlYWRhYmlsaXR5IGJlbG93LlxuICAgIGNvbnN0IG5nTW9kdWxlUmVmID0gcmVmO1xuICAgIGNvbnN0IGFkZFJlZXhwb3J0ID0gKGV4cG9ydFJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+KSA9PiB7XG4gICAgICBpZiAoZXhwb3J0UmVmLm5vZGUuZ2V0U291cmNlRmlsZSgpID09PSBzb3VyY2VGaWxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGlzUmVFeHBvcnQgPSAhZGVjbGFyZWQuaGFzKGV4cG9ydFJlZi5ub2RlKTtcbiAgICAgIGNvbnN0IGV4cG9ydE5hbWUgPSB0aGlzLmFsaWFzaW5nSG9zdCAhLm1heWJlQWxpYXNTeW1ib2xBcyhcbiAgICAgICAgICBleHBvcnRSZWYsIHNvdXJjZUZpbGUsIG5nTW9kdWxlLnJlZi5ub2RlLm5hbWUudGV4dCwgaXNSZUV4cG9ydCk7XG4gICAgICBpZiAoZXhwb3J0TmFtZSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIXJlZXhwb3J0TWFwLmhhcyhleHBvcnROYW1lKSkge1xuICAgICAgICBpZiAoZXhwb3J0UmVmLmFsaWFzICYmIGV4cG9ydFJlZi5hbGlhcyBpbnN0YW5jZW9mIEV4dGVybmFsRXhwcikge1xuICAgICAgICAgIHJlZXhwb3J0cyAhLnB1c2goe1xuICAgICAgICAgICAgZnJvbU1vZHVsZTogZXhwb3J0UmVmLmFsaWFzLnZhbHVlLm1vZHVsZU5hbWUgISxcbiAgICAgICAgICAgIHN5bWJvbE5hbWU6IGV4cG9ydFJlZi5hbGlhcy52YWx1ZS5uYW1lICEsXG4gICAgICAgICAgICBhc0FsaWFzOiBleHBvcnROYW1lLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGV4cHIgPSB0aGlzLnJlZkVtaXR0ZXIuZW1pdChleHBvcnRSZWYuY2xvbmVXaXRoTm9JZGVudGlmaWVycygpLCBzb3VyY2VGaWxlKTtcbiAgICAgICAgICBpZiAoIShleHByIGluc3RhbmNlb2YgRXh0ZXJuYWxFeHByKSB8fCBleHByLnZhbHVlLm1vZHVsZU5hbWUgPT09IG51bGwgfHxcbiAgICAgICAgICAgICAgZXhwci52YWx1ZS5uYW1lID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIEV4dGVybmFsRXhwcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWV4cG9ydHMgIS5wdXNoKHtcbiAgICAgICAgICAgIGZyb21Nb2R1bGU6IGV4cHIudmFsdWUubW9kdWxlTmFtZSxcbiAgICAgICAgICAgIHN5bWJvbE5hbWU6IGV4cHIudmFsdWUubmFtZSxcbiAgICAgICAgICAgIGFzQWxpYXM6IGV4cG9ydE5hbWUsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVleHBvcnRNYXAuc2V0KGV4cG9ydE5hbWUsIGV4cG9ydFJlZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBbm90aGVyIHJlLWV4cG9ydCBhbHJlYWR5IHVzZWQgdGhpcyBuYW1lLiBQcm9kdWNlIGEgZGlhZ25vc3RpYy5cbiAgICAgICAgY29uc3QgcHJldlJlZiA9IHJlZXhwb3J0TWFwLmdldChleHBvcnROYW1lKSAhO1xuICAgICAgICBkaWFnbm9zdGljcy5wdXNoKHJlZXhwb3J0Q29sbGlzaW9uKG5nTW9kdWxlUmVmLm5vZGUsIHByZXZSZWYsIGV4cG9ydFJlZikpO1xuICAgICAgfVxuICAgIH07XG4gICAgZm9yIChjb25zdCB7cmVmfSBvZiBleHBvcnRlZC5kaXJlY3RpdmVzKSB7XG4gICAgICBhZGRSZWV4cG9ydChyZWYpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHtyZWZ9IG9mIGV4cG9ydGVkLnBpcGVzKSB7XG4gICAgICBhZGRSZWV4cG9ydChyZWYpO1xuICAgIH1cbiAgICByZXR1cm4gcmVleHBvcnRzO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3NlcnRDb2xsZWN0aW5nKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnNlYWxlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb246IExvY2FsTW9kdWxlU2NvcGVSZWdpc3RyeSBpcyBub3QgQ09MTEVDVElOR2ApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFByb2R1Y2UgYSBgdHMuRGlhZ25vc3RpY2AgZm9yIGFuIGludmFsaWQgaW1wb3J0IG9yIGV4cG9ydCBmcm9tIGFuIE5nTW9kdWxlLlxuICovXG5mdW5jdGlvbiBpbnZhbGlkUmVmKFxuICAgIGNsYXp6OiB0cy5EZWNsYXJhdGlvbiwgZGVjbDogUmVmZXJlbmNlPHRzLkRlY2xhcmF0aW9uPixcbiAgICB0eXBlOiAnaW1wb3J0JyB8ICdleHBvcnQnKTogdHMuRGlhZ25vc3RpYyB7XG4gIGNvbnN0IGNvZGUgPVxuICAgICAgdHlwZSA9PT0gJ2ltcG9ydCcgPyBFcnJvckNvZGUuTkdNT0RVTEVfSU5WQUxJRF9JTVBPUlQgOiBFcnJvckNvZGUuTkdNT0RVTEVfSU5WQUxJRF9FWFBPUlQ7XG4gIGNvbnN0IHJlc29sdmVUYXJnZXQgPSB0eXBlID09PSAnaW1wb3J0JyA/ICdOZ01vZHVsZScgOiAnTmdNb2R1bGUsIENvbXBvbmVudCwgRGlyZWN0aXZlLCBvciBQaXBlJztcbiAgbGV0IG1lc3NhZ2UgPVxuICAgICAgYEFwcGVhcnMgaW4gdGhlIE5nTW9kdWxlLiR7dHlwZX1zIG9mICR7bm9kZU5hbWVGb3JFcnJvcihjbGF6eil9LCBidXQgY291bGQgbm90IGJlIHJlc29sdmVkIHRvIGFuICR7cmVzb2x2ZVRhcmdldH0gY2xhc3MuYCArXG4gICAgICAnXFxuXFxuJztcbiAgY29uc3QgbGlicmFyeSA9IGRlY2wub3duZWRCeU1vZHVsZUd1ZXNzICE9PSBudWxsID8gYCAoJHtkZWNsLm93bmVkQnlNb2R1bGVHdWVzc30pYCA6ICcnO1xuICBjb25zdCBzZiA9IGRlY2wubm9kZS5nZXRTb3VyY2VGaWxlKCk7XG5cbiAgLy8gUHJvdmlkZSBleHRyYSBjb250ZXh0IHRvIHRoZSBlcnJvciBmb3IgdGhlIHVzZXIuXG4gIGlmICghc2YuaXNEZWNsYXJhdGlvbkZpbGUpIHtcbiAgICAvLyBUaGlzIGlzIGEgZmlsZSBpbiB0aGUgdXNlcidzIHByb2dyYW0uXG4gICAgY29uc3QgYW5ub3RhdGlvblR5cGUgPSB0eXBlID09PSAnaW1wb3J0JyA/ICdATmdNb2R1bGUnIDogJ0FuZ3VsYXInO1xuICAgIG1lc3NhZ2UgKz0gYElzIGl0IG1pc3NpbmcgYW4gJHthbm5vdGF0aW9uVHlwZX0gYW5ub3RhdGlvbj9gO1xuICB9IGVsc2UgaWYgKHNmLmZpbGVOYW1lLmluZGV4T2YoJ25vZGVfbW9kdWxlcycpICE9PSAtMSkge1xuICAgIC8vIFRoaXMgZmlsZSBjb21lcyBmcm9tIGEgdGhpcmQtcGFydHkgbGlicmFyeSBpbiBub2RlX21vZHVsZXMuXG4gICAgbWVzc2FnZSArPVxuICAgICAgICBgVGhpcyBsaWtlbHkgbWVhbnMgdGhhdCB0aGUgbGlicmFyeSR7bGlicmFyeX0gd2hpY2ggZGVjbGFyZXMgJHtkZWNsLmRlYnVnTmFtZX0gaGFzIG5vdCBgICtcbiAgICAgICAgJ2JlZW4gcHJvY2Vzc2VkIGNvcnJlY3RseSBieSBuZ2NjLCBvciBpcyBub3QgY29tcGF0aWJsZSB3aXRoIEFuZ3VsYXIgSXZ5LiBDaGVjayBpZiBhICcgK1xuICAgICAgICAnbmV3ZXIgdmVyc2lvbiBvZiB0aGUgbGlicmFyeSBpcyBhdmFpbGFibGUsIGFuZCB1cGRhdGUgaWYgc28uIEFsc28gY29uc2lkZXIgY2hlY2tpbmcgJyArXG4gICAgICAgICd3aXRoIHRoZSBsaWJyYXJ5XFwncyBhdXRob3JzIHRvIHNlZSBpZiB0aGUgbGlicmFyeSBpcyBleHBlY3RlZCB0byBiZSBjb21wYXRpYmxlIHdpdGggSXZ5Lic7XG4gIH0gZWxzZSB7XG4gICAgLy8gVGhpcyBpcyBhIG1vbm9yZXBvIHN0eWxlIGxvY2FsIGRlcGVuZGVuY3kuIFVuZm9ydHVuYXRlbHkgdGhlc2UgYXJlIHRvbyBkaWZmZXJlbnQgdG8gcmVhbGx5XG4gICAgLy8gb2ZmZXIgbXVjaCBtb3JlwqBhZHZpY2UgdGhhbiB0aGlzLlxuICAgIG1lc3NhZ2UgKz1cbiAgICAgICAgYFRoaXMgbGlrZWx5IG1lYW5zIHRoYXQgdGhlIGRlcGVuZGVuY3kke2xpYnJhcnl9IHdoaWNoIGRlY2xhcmVzICR7ZGVjbC5kZWJ1Z05hbWV9IGhhcyBub3QgYmVlbiBwcm9jZXNzZWQgY29ycmVjdGx5IGJ5IG5nY2MuYDtcbiAgfVxuXG4gIHJldHVybiBtYWtlRGlhZ25vc3RpYyhjb2RlLCBpZGVudGlmaWVyT2ZOb2RlKGRlY2wubm9kZSkgfHwgZGVjbC5ub2RlLCBtZXNzYWdlKTtcbn1cblxuLyoqXG4gKiBQcm9kdWNlIGEgYHRzLkRpYWdub3N0aWNgIGZvciBhbiBpbXBvcnQgb3IgZXhwb3J0IHdoaWNoIGl0c2VsZiBoYXMgZXJyb3JzLlxuICovXG5mdW5jdGlvbiBpbnZhbGlkVHJhbnNpdGl2ZU5nTW9kdWxlUmVmKFxuICAgIGNsYXp6OiB0cy5EZWNsYXJhdGlvbiwgZGVjbDogUmVmZXJlbmNlPHRzLkRlY2xhcmF0aW9uPixcbiAgICB0eXBlOiAnaW1wb3J0JyB8ICdleHBvcnQnKTogdHMuRGlhZ25vc3RpYyB7XG4gIGNvbnN0IGNvZGUgPVxuICAgICAgdHlwZSA9PT0gJ2ltcG9ydCcgPyBFcnJvckNvZGUuTkdNT0RVTEVfSU5WQUxJRF9JTVBPUlQgOiBFcnJvckNvZGUuTkdNT0RVTEVfSU5WQUxJRF9FWFBPUlQ7XG4gIHJldHVybiBtYWtlRGlhZ25vc3RpYyhcbiAgICAgIGNvZGUsIGlkZW50aWZpZXJPZk5vZGUoZGVjbC5ub2RlKSB8fCBkZWNsLm5vZGUsXG4gICAgICBgQXBwZWFycyBpbiB0aGUgTmdNb2R1bGUuJHt0eXBlfXMgb2YgJHtub2RlTmFtZUZvckVycm9yKGNsYXp6KX0sIGJ1dCBpdHNlbGYgaGFzIGVycm9yc2ApO1xufVxuXG4vKipcbiAqIFByb2R1Y2UgYSBgdHMuRGlhZ25vc3RpY2AgZm9yIGFuIGV4cG9ydGVkIGRpcmVjdGl2ZSBvciBwaXBlIHdoaWNoIHdhcyBub3QgZGVjbGFyZWQgb3IgaW1wb3J0ZWRcbiAqIGJ5IHRoZSBOZ01vZHVsZSBpbiBxdWVzdGlvbi5cbiAqL1xuZnVuY3Rpb24gaW52YWxpZFJlZXhwb3J0KGNsYXp6OiB0cy5EZWNsYXJhdGlvbiwgZGVjbDogUmVmZXJlbmNlPHRzLkRlY2xhcmF0aW9uPik6IHRzLkRpYWdub3N0aWMge1xuICByZXR1cm4gbWFrZURpYWdub3N0aWMoXG4gICAgICBFcnJvckNvZGUuTkdNT0RVTEVfSU5WQUxJRF9SRUVYUE9SVCwgaWRlbnRpZmllck9mTm9kZShkZWNsLm5vZGUpIHx8IGRlY2wubm9kZSxcbiAgICAgIGBQcmVzZW50IGluIHRoZSBOZ01vZHVsZS5leHBvcnRzIG9mICR7bm9kZU5hbWVGb3JFcnJvcihjbGF6eil9IGJ1dCBuZWl0aGVyIGRlY2xhcmVkIG5vciBpbXBvcnRlZGApO1xufVxuXG4vKipcbiAqIFByb2R1Y2UgYSBgdHMuRGlhZ25vc3RpY2AgZm9yIGEgY29sbGlzaW9uIGluIHJlLWV4cG9ydCBuYW1lcyBiZXR3ZWVuIHR3byBkaXJlY3RpdmVzL3BpcGVzLlxuICovXG5mdW5jdGlvbiByZWV4cG9ydENvbGxpc2lvbihcbiAgICBtb2R1bGU6IENsYXNzRGVjbGFyYXRpb24sIHJlZkE6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPixcbiAgICByZWZCOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4pOiB0cy5EaWFnbm9zdGljIHtcbiAgY29uc3QgY2hpbGRNZXNzYWdlVGV4dCA9XG4gICAgICBgVGhpcyBkaXJlY3RpdmUvcGlwZSBpcyBwYXJ0IG9mIHRoZSBleHBvcnRzIG9mICcke21vZHVsZS5uYW1lLnRleHR9JyBhbmQgc2hhcmVzIHRoZSBzYW1lIG5hbWUgYXMgYW5vdGhlciBleHBvcnRlZCBkaXJlY3RpdmUvcGlwZS5gO1xuICByZXR1cm4gbWFrZURpYWdub3N0aWMoXG4gICAgICBFcnJvckNvZGUuTkdNT0RVTEVfUkVFWFBPUlRfTkFNRV9DT0xMSVNJT04sIG1vZHVsZS5uYW1lLCBgXG4gICAgVGhlcmUgd2FzIGEgbmFtZSBjb2xsaXNpb24gYmV0d2VlbiB0d28gY2xhc3NlcyBuYW1lZCAnJHtyZWZBLm5vZGUubmFtZS50ZXh0fScsIHdoaWNoIGFyZSBib3RoIHBhcnQgb2YgdGhlIGV4cG9ydHMgb2YgJyR7bW9kdWxlLm5hbWUudGV4dH0nLlxuXG4gICAgQW5ndWxhciBnZW5lcmF0ZXMgcmUtZXhwb3J0cyBvZiBhbiBOZ01vZHVsZSdzIGV4cG9ydGVkIGRpcmVjdGl2ZXMvcGlwZXMgZnJvbSB0aGUgbW9kdWxlJ3Mgc291cmNlIGZpbGUgaW4gY2VydGFpbiBjYXNlcywgdXNpbmcgdGhlIGRlY2xhcmVkIG5hbWUgb2YgdGhlIGNsYXNzLiBJZiB0d28gY2xhc3NlcyBvZiB0aGUgc2FtZSBuYW1lIGFyZSBleHBvcnRlZCwgdGhpcyBhdXRvbWF0aWMgbmFtaW5nIGRvZXMgbm90IHdvcmsuXG5cbiAgICBUbyBmaXggdGhpcyBwcm9ibGVtIHBsZWFzZSByZS1leHBvcnQgb25lIG9yIGJvdGggY2xhc3NlcyBkaXJlY3RseSBmcm9tIHRoaXMgZmlsZS5cbiAgYC50cmltKCksXG4gICAgICBbXG4gICAgICAgIHtub2RlOiByZWZBLm5vZGUubmFtZSwgbWVzc2FnZVRleHQ6IGNoaWxkTWVzc2FnZVRleHR9LFxuICAgICAgICB7bm9kZTogcmVmQi5ub2RlLm5hbWUsIG1lc3NhZ2VUZXh0OiBjaGlsZE1lc3NhZ2VUZXh0fSxcbiAgICAgIF0pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERlY2xhcmF0aW9uRGF0YSB7XG4gIG5nTW9kdWxlOiBDbGFzc0RlY2xhcmF0aW9uO1xuICByZWY6IFJlZmVyZW5jZTtcbiAgcmF3RGVjbGFyYXRpb25zOiB0cy5FeHByZXNzaW9ufG51bGw7XG59XG4iXX0=