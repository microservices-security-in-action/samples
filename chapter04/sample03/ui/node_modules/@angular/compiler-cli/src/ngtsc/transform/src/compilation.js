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
        define("@angular/compiler-cli/src/ngtsc/transform/src/compilation", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/src/ngtsc/transform/src/api", "@angular/compiler-cli/src/ngtsc/transform/src/trait"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var api_1 = require("@angular/compiler-cli/src/ngtsc/transform/src/api");
    var trait_1 = require("@angular/compiler-cli/src/ngtsc/transform/src/trait");
    /**
     * The heart of Angular compilation.
     *
     * The `TraitCompiler` is responsible for processing all classes in the program. Any time a
     * `DecoratorHandler` matches a class, a "trait" is created to represent that Angular aspect of the
     * class (such as the class having a component definition).
     *
     * The `TraitCompiler` transitions each trait through the various phases of compilation, culminating
     * in the production of `CompileResult`s instructing the compiler to apply various mutations to the
     * class (like adding fields or type declarations).
     */
    var TraitCompiler = /** @class */ (function () {
        function TraitCompiler(handlers, reflector, perf, incrementalBuild, compileNonExportedClasses, dtsTransforms) {
            var e_1, _a;
            this.handlers = handlers;
            this.reflector = reflector;
            this.perf = perf;
            this.incrementalBuild = incrementalBuild;
            this.compileNonExportedClasses = compileNonExportedClasses;
            this.dtsTransforms = dtsTransforms;
            /**
             * Maps class declarations to their `ClassRecord`, which tracks the Ivy traits being applied to
             * those classes.
             */
            this.classes = new Map();
            /**
             * Maps source files to any class declaration(s) within them which have been discovered to contain
             * Ivy traits.
             */
            this.fileToClasses = new Map();
            this.reexportMap = new Map();
            this.handlersByName = new Map();
            try {
                for (var handlers_1 = tslib_1.__values(handlers), handlers_1_1 = handlers_1.next(); !handlers_1_1.done; handlers_1_1 = handlers_1.next()) {
                    var handler = handlers_1_1.value;
                    this.handlersByName.set(handler.name, handler);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (handlers_1_1 && !handlers_1_1.done && (_a = handlers_1.return)) _a.call(handlers_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        TraitCompiler.prototype.analyzeSync = function (sf) { this.analyze(sf, false); };
        TraitCompiler.prototype.analyzeAsync = function (sf) { return this.analyze(sf, true); };
        TraitCompiler.prototype.analyze = function (sf, preanalyze) {
            var e_2, _a;
            var _this = this;
            // We shouldn't analyze declaration files.
            if (sf.isDeclarationFile) {
                return undefined;
            }
            // analyze() really wants to return `Promise<void>|void`, but TypeScript cannot narrow a return
            // type of 'void', so `undefined` is used instead.
            var promises = [];
            var priorWork = this.incrementalBuild.priorWorkFor(sf);
            if (priorWork !== null) {
                try {
                    for (var priorWork_1 = tslib_1.__values(priorWork), priorWork_1_1 = priorWork_1.next(); !priorWork_1_1.done; priorWork_1_1 = priorWork_1.next()) {
                        var priorRecord = priorWork_1_1.value;
                        this.adopt(priorRecord);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (priorWork_1_1 && !priorWork_1_1.done && (_a = priorWork_1.return)) _a.call(priorWork_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                // Skip the rest of analysis, as this file's prior traits are being reused.
                return;
            }
            var visit = function (node) {
                if (_this.reflector.isClass(node)) {
                    _this.analyzeClass(node, preanalyze ? promises : null);
                }
                ts.forEachChild(node, visit);
            };
            visit(sf);
            if (preanalyze && promises.length > 0) {
                return Promise.all(promises).then(function () { return undefined; });
            }
            else {
                return undefined;
            }
        };
        TraitCompiler.prototype.recordFor = function (clazz) {
            if (this.classes.has(clazz)) {
                return this.classes.get(clazz);
            }
            else {
                return null;
            }
        };
        TraitCompiler.prototype.recordsFor = function (sf) {
            var e_3, _a;
            if (!this.fileToClasses.has(sf)) {
                return null;
            }
            var records = [];
            try {
                for (var _b = tslib_1.__values(this.fileToClasses.get(sf)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var clazz = _c.value;
                    records.push(this.classes.get(clazz));
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return records;
        };
        /**
         * Import a `ClassRecord` from a previous compilation.
         *
         * Traits from the `ClassRecord` have accurate metadata, but the `handler` is from the old program
         * and needs to be updated (matching is done by name). A new pending trait is created and then
         * transitioned to analyzed using the previous analysis. If the trait is in the errored state,
         * instead the errors are copied over.
         */
        TraitCompiler.prototype.adopt = function (priorRecord) {
            var e_4, _a;
            var record = {
                hasPrimaryHandler: priorRecord.hasPrimaryHandler,
                hasWeakHandlers: priorRecord.hasWeakHandlers,
                metaDiagnostics: priorRecord.metaDiagnostics,
                node: priorRecord.node,
                traits: [],
            };
            try {
                for (var _b = tslib_1.__values(priorRecord.traits), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var priorTrait = _c.value;
                    var handler = this.handlersByName.get(priorTrait.handler.name);
                    var trait = trait_1.Trait.pending(handler, priorTrait.detected);
                    if (priorTrait.state === trait_1.TraitState.ANALYZED || priorTrait.state === trait_1.TraitState.RESOLVED) {
                        trait = trait.toAnalyzed(priorTrait.analysis);
                        if (trait.handler.register !== undefined) {
                            trait.handler.register(record.node, trait.analysis);
                        }
                    }
                    else if (priorTrait.state === trait_1.TraitState.SKIPPED) {
                        trait = trait.toSkipped();
                    }
                    else if (priorTrait.state === trait_1.TraitState.ERRORED) {
                        trait = trait.toErrored(priorTrait.diagnostics);
                    }
                    record.traits.push(trait);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            this.classes.set(record.node, record);
            var sf = record.node.getSourceFile();
            if (!this.fileToClasses.has(sf)) {
                this.fileToClasses.set(sf, new Set());
            }
            this.fileToClasses.get(sf).add(record.node);
        };
        TraitCompiler.prototype.scanClassForTraits = function (clazz) {
            if (!this.compileNonExportedClasses && !typescript_1.isExported(clazz)) {
                return null;
            }
            var decorators = this.reflector.getDecoratorsOfDeclaration(clazz);
            return this.detectTraits(clazz, decorators);
        };
        TraitCompiler.prototype.detectTraits = function (clazz, decorators) {
            var e_5, _a;
            var record = this.recordFor(clazz);
            var foundTraits = [];
            try {
                for (var _b = tslib_1.__values(this.handlers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var handler = _c.value;
                    var result = handler.detect(clazz, decorators);
                    if (result === undefined) {
                        continue;
                    }
                    var isPrimaryHandler = handler.precedence === api_1.HandlerPrecedence.PRIMARY;
                    var isWeakHandler = handler.precedence === api_1.HandlerPrecedence.WEAK;
                    var trait = trait_1.Trait.pending(handler, result);
                    foundTraits.push(trait);
                    if (record === null) {
                        // This is the first handler to match this class. This path is a fast path through which
                        // most classes will flow.
                        record = {
                            node: clazz,
                            traits: [trait],
                            metaDiagnostics: null,
                            hasPrimaryHandler: isPrimaryHandler,
                            hasWeakHandlers: isWeakHandler,
                        };
                        this.classes.set(clazz, record);
                        var sf = clazz.getSourceFile();
                        if (!this.fileToClasses.has(sf)) {
                            this.fileToClasses.set(sf, new Set());
                        }
                        this.fileToClasses.get(sf).add(clazz);
                    }
                    else {
                        // This is at least the second handler to match this class. This is a slower path that some
                        // classes will go through, which validates that the set of decorators applied to the class
                        // is valid.
                        // Validate according to rules as follows:
                        //
                        // * WEAK handlers are removed if a non-WEAK handler matches.
                        // * Only one PRIMARY handler can match at a time. Any other PRIMARY handler matching a
                        //   class with an existing PRIMARY handler is an error.
                        if (!isWeakHandler && record.hasWeakHandlers) {
                            // The current handler is not a WEAK handler, but the class has other WEAK handlers.
                            // Remove them.
                            record.traits =
                                record.traits.filter(function (field) { return field.handler.precedence !== api_1.HandlerPrecedence.WEAK; });
                            record.hasWeakHandlers = false;
                        }
                        else if (isWeakHandler && !record.hasWeakHandlers) {
                            // The current handler is a WEAK handler, but the class has non-WEAK handlers already.
                            // Drop the current one.
                            continue;
                        }
                        if (isPrimaryHandler && record.hasPrimaryHandler) {
                            // The class already has a PRIMARY handler, and another one just matched.
                            record.metaDiagnostics = [{
                                    category: ts.DiagnosticCategory.Error,
                                    code: Number('-99' + diagnostics_1.ErrorCode.DECORATOR_COLLISION),
                                    file: typescript_1.getSourceFile(clazz),
                                    start: clazz.getStart(undefined, false),
                                    length: clazz.getWidth(),
                                    messageText: 'Two incompatible decorators on class',
                                }];
                            record.traits = foundTraits = [];
                            break;
                        }
                        // Otherwise, it's safe to accept the multiple decorators here. Update some of the metadata
                        // regarding this class.
                        record.traits.push(trait);
                        record.hasPrimaryHandler = record.hasPrimaryHandler || isPrimaryHandler;
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return foundTraits.length > 0 ? foundTraits : null;
        };
        TraitCompiler.prototype.analyzeClass = function (clazz, preanalyzeQueue) {
            var e_6, _a;
            var _this = this;
            var traits = this.scanClassForTraits(clazz);
            if (traits === null) {
                // There are no Ivy traits on the class, so it can safely be skipped.
                return;
            }
            var _loop_1 = function (trait) {
                var analyze = function () { return _this.analyzeTrait(clazz, trait); };
                var preanalysis = null;
                if (preanalyzeQueue !== null && trait.handler.preanalyze !== undefined) {
                    // Attempt to run preanalysis. This could fail with a `FatalDiagnosticError`; catch it if it
                    // does.
                    try {
                        preanalysis = trait.handler.preanalyze(clazz, trait.detected.metadata) || null;
                    }
                    catch (err) {
                        if (err instanceof diagnostics_1.FatalDiagnosticError) {
                            trait.toErrored([err.toDiagnostic()]);
                            return { value: void 0 };
                        }
                        else {
                            throw err;
                        }
                    }
                }
                if (preanalysis !== null) {
                    preanalyzeQueue.push(preanalysis.then(analyze));
                }
                else {
                    analyze();
                }
            };
            try {
                for (var traits_1 = tslib_1.__values(traits), traits_1_1 = traits_1.next(); !traits_1_1.done; traits_1_1 = traits_1.next()) {
                    var trait = traits_1_1.value;
                    var state_1 = _loop_1(trait);
                    if (typeof state_1 === "object")
                        return state_1.value;
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (traits_1_1 && !traits_1_1.done && (_a = traits_1.return)) _a.call(traits_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
        };
        TraitCompiler.prototype.analyzeTrait = function (clazz, trait, flags) {
            if (trait.state !== trait_1.TraitState.PENDING) {
                throw new Error("Attempt to analyze trait of " + clazz.name.text + " in state " + trait_1.TraitState[trait.state] + " (expected DETECTED)");
            }
            // Attempt analysis. This could fail with a `FatalDiagnosticError`; catch it if it does.
            var result;
            try {
                result = trait.handler.analyze(clazz, trait.detected.metadata, flags);
            }
            catch (err) {
                if (err instanceof diagnostics_1.FatalDiagnosticError) {
                    trait = trait.toErrored([err.toDiagnostic()]);
                    return;
                }
                else {
                    throw err;
                }
            }
            if (result.diagnostics !== undefined) {
                trait = trait.toErrored(result.diagnostics);
            }
            else if (result.analysis !== undefined) {
                // Analysis was successful. Trigger registration.
                if (trait.handler.register !== undefined) {
                    trait.handler.register(clazz, result.analysis);
                }
                // Successfully analyzed and registered.
                trait = trait.toAnalyzed(result.analysis);
            }
            else {
                trait = trait.toSkipped();
            }
        };
        TraitCompiler.prototype.resolve = function () {
            var e_7, _a, e_8, _b, e_9, _c;
            var classes = Array.from(this.classes.keys());
            try {
                for (var classes_1 = tslib_1.__values(classes), classes_1_1 = classes_1.next(); !classes_1_1.done; classes_1_1 = classes_1.next()) {
                    var clazz = classes_1_1.value;
                    var record = this.classes.get(clazz);
                    try {
                        for (var _d = (e_8 = void 0, tslib_1.__values(record.traits)), _e = _d.next(); !_e.done; _e = _d.next()) {
                            var trait = _e.value;
                            var handler = trait.handler;
                            switch (trait.state) {
                                case trait_1.TraitState.SKIPPED:
                                case trait_1.TraitState.ERRORED:
                                    continue;
                                case trait_1.TraitState.PENDING:
                                    throw new Error("Resolving a trait that hasn't been analyzed: " + clazz.name.text + " / " + Object.getPrototypeOf(trait.handler).constructor.name);
                                case trait_1.TraitState.RESOLVED:
                                    throw new Error("Resolving an already resolved trait");
                            }
                            if (handler.resolve === undefined) {
                                // No resolution of this trait needed - it's considered successful by default.
                                trait = trait.toResolved(null);
                                continue;
                            }
                            var result = void 0;
                            try {
                                result = handler.resolve(clazz, trait.analysis);
                            }
                            catch (err) {
                                if (err instanceof diagnostics_1.FatalDiagnosticError) {
                                    trait = trait.toErrored([err.toDiagnostic()]);
                                    continue;
                                }
                                else {
                                    throw err;
                                }
                            }
                            if (result.diagnostics !== undefined && result.diagnostics.length > 0) {
                                trait = trait.toErrored(result.diagnostics);
                            }
                            else {
                                if (result.data !== undefined) {
                                    trait = trait.toResolved(result.data);
                                }
                                else {
                                    trait = trait.toResolved(null);
                                }
                            }
                            if (result.reexports !== undefined) {
                                var fileName = clazz.getSourceFile().fileName;
                                if (!this.reexportMap.has(fileName)) {
                                    this.reexportMap.set(fileName, new Map());
                                }
                                var fileReexports = this.reexportMap.get(fileName);
                                try {
                                    for (var _f = (e_9 = void 0, tslib_1.__values(result.reexports)), _g = _f.next(); !_g.done; _g = _f.next()) {
                                        var reexport = _g.value;
                                        fileReexports.set(reexport.asAlias, [reexport.fromModule, reexport.symbolName]);
                                    }
                                }
                                catch (e_9_1) { e_9 = { error: e_9_1 }; }
                                finally {
                                    try {
                                        if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                                    }
                                    finally { if (e_9) throw e_9.error; }
                                }
                            }
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (classes_1_1 && !classes_1_1.done && (_a = classes_1.return)) _a.call(classes_1);
                }
                finally { if (e_7) throw e_7.error; }
            }
        };
        TraitCompiler.prototype.typeCheck = function (ctx) {
            var e_10, _a, e_11, _b;
            try {
                for (var _c = tslib_1.__values(this.classes.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var clazz = _d.value;
                    var record = this.classes.get(clazz);
                    try {
                        for (var _e = (e_11 = void 0, tslib_1.__values(record.traits)), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var trait = _f.value;
                            if (trait.state !== trait_1.TraitState.RESOLVED) {
                                continue;
                            }
                            else if (trait.handler.typeCheck === undefined) {
                                continue;
                            }
                            trait.handler.typeCheck(ctx, clazz, trait.analysis, trait.resolution);
                        }
                    }
                    catch (e_11_1) { e_11 = { error: e_11_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_11) throw e_11.error; }
                    }
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_10) throw e_10.error; }
            }
        };
        TraitCompiler.prototype.index = function (ctx) {
            var e_12, _a, e_13, _b;
            try {
                for (var _c = tslib_1.__values(this.classes.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var clazz = _d.value;
                    var record = this.classes.get(clazz);
                    try {
                        for (var _e = (e_13 = void 0, tslib_1.__values(record.traits)), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var trait = _f.value;
                            if (trait.state !== trait_1.TraitState.RESOLVED) {
                                // Skip traits that haven't been resolved successfully.
                                continue;
                            }
                            else if (trait.handler.index === undefined) {
                                // Skip traits that don't affect indexing.
                                continue;
                            }
                            trait.handler.index(ctx, clazz, trait.analysis, trait.resolution);
                        }
                    }
                    catch (e_13_1) { e_13 = { error: e_13_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_13) throw e_13.error; }
                    }
                }
            }
            catch (e_12_1) { e_12 = { error: e_12_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_12) throw e_12.error; }
            }
        };
        TraitCompiler.prototype.compile = function (clazz, constantPool) {
            var e_14, _a;
            var original = ts.getOriginalNode(clazz);
            if (!this.reflector.isClass(clazz) || !this.reflector.isClass(original) ||
                !this.classes.has(original)) {
                return null;
            }
            var record = this.classes.get(original);
            var res = [];
            var _loop_2 = function (trait) {
                var e_15, _a;
                if (trait.state !== trait_1.TraitState.RESOLVED) {
                    return "continue";
                }
                var compileSpan = this_1.perf.start('compileClass', original);
                var compileMatchRes = trait.handler.compile(clazz, trait.analysis, trait.resolution, constantPool);
                this_1.perf.stop(compileSpan);
                if (Array.isArray(compileMatchRes)) {
                    var _loop_3 = function (result) {
                        if (!res.some(function (r) { return r.name === result.name; })) {
                            res.push(result);
                        }
                    };
                    try {
                        for (var compileMatchRes_1 = (e_15 = void 0, tslib_1.__values(compileMatchRes)), compileMatchRes_1_1 = compileMatchRes_1.next(); !compileMatchRes_1_1.done; compileMatchRes_1_1 = compileMatchRes_1.next()) {
                            var result = compileMatchRes_1_1.value;
                            _loop_3(result);
                        }
                    }
                    catch (e_15_1) { e_15 = { error: e_15_1 }; }
                    finally {
                        try {
                            if (compileMatchRes_1_1 && !compileMatchRes_1_1.done && (_a = compileMatchRes_1.return)) _a.call(compileMatchRes_1);
                        }
                        finally { if (e_15) throw e_15.error; }
                    }
                }
                else if (!res.some(function (result) { return result.name === compileMatchRes.name; })) {
                    res.push(compileMatchRes);
                }
            };
            var this_1 = this;
            try {
                for (var _b = tslib_1.__values(record.traits), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var trait = _c.value;
                    _loop_2(trait);
                }
            }
            catch (e_14_1) { e_14 = { error: e_14_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_14) throw e_14.error; }
            }
            // Look up the .d.ts transformer for the input file and record that at least one field was
            // generated, which will allow the .d.ts to be transformed later.
            this.dtsTransforms.getIvyDeclarationTransform(original.getSourceFile())
                .addFields(original, res);
            // Return the instruction to the transformer so the fields will be added.
            return res.length > 0 ? res : null;
        };
        TraitCompiler.prototype.decoratorsFor = function (node) {
            var e_16, _a;
            var original = ts.getOriginalNode(node);
            if (!this.reflector.isClass(original) || !this.classes.has(original)) {
                return [];
            }
            var record = this.classes.get(original);
            var decorators = [];
            try {
                for (var _b = tslib_1.__values(record.traits), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var trait = _c.value;
                    if (trait.state !== trait_1.TraitState.RESOLVED) {
                        continue;
                    }
                    if (trait.detected.trigger !== null && ts.isDecorator(trait.detected.trigger)) {
                        decorators.push(trait.detected.trigger);
                    }
                }
            }
            catch (e_16_1) { e_16 = { error: e_16_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_16) throw e_16.error; }
            }
            return decorators;
        };
        Object.defineProperty(TraitCompiler.prototype, "diagnostics", {
            get: function () {
                var e_17, _a, e_18, _b;
                var diagnostics = [];
                try {
                    for (var _c = tslib_1.__values(this.classes.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var clazz = _d.value;
                        var record = this.classes.get(clazz);
                        if (record.metaDiagnostics !== null) {
                            diagnostics.push.apply(diagnostics, tslib_1.__spread(record.metaDiagnostics));
                        }
                        try {
                            for (var _e = (e_18 = void 0, tslib_1.__values(record.traits)), _f = _e.next(); !_f.done; _f = _e.next()) {
                                var trait = _f.value;
                                if (trait.state === trait_1.TraitState.ERRORED) {
                                    diagnostics.push.apply(diagnostics, tslib_1.__spread(trait.diagnostics));
                                }
                            }
                        }
                        catch (e_18_1) { e_18 = { error: e_18_1 }; }
                        finally {
                            try {
                                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                            }
                            finally { if (e_18) throw e_18.error; }
                        }
                    }
                }
                catch (e_17_1) { e_17 = { error: e_17_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_17) throw e_17.error; }
                }
                return diagnostics;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TraitCompiler.prototype, "exportStatements", {
            get: function () { return this.reexportMap; },
            enumerable: true,
            configurable: true
        });
        return TraitCompiler;
    }());
    exports.TraitCompiler = TraitCompiler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3RyYW5zZm9ybS9zcmMvY29tcGlsYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBR0gsK0JBQWlDO0lBRWpDLDJFQUFrRTtJQU1sRSxrRkFBb0U7SUFFcEUseUVBQXNIO0lBRXRILDZFQUF3RDtJQXFDeEQ7Ozs7Ozs7Ozs7T0FVRztJQUNIO1FBaUJFLHVCQUNZLFFBQXVELEVBQ3ZELFNBQXlCLEVBQVUsSUFBa0IsRUFDckQsZ0JBQStDLEVBQy9DLHlCQUFrQyxFQUFVLGFBQW1DOztZQUgvRSxhQUFRLEdBQVIsUUFBUSxDQUErQztZQUN2RCxjQUFTLEdBQVQsU0FBUyxDQUFnQjtZQUFVLFNBQUksR0FBSixJQUFJLENBQWM7WUFDckQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUErQjtZQUMvQyw4QkFBeUIsR0FBekIseUJBQXlCLENBQVM7WUFBVSxrQkFBYSxHQUFiLGFBQWEsQ0FBc0I7WUFwQjNGOzs7ZUFHRztZQUNLLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBaUMsQ0FBQztZQUUzRDs7O2VBR0c7WUFDTyxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUF3QyxDQUFDO1lBRWxFLGdCQUFXLEdBQUcsSUFBSSxHQUFHLEVBQXlDLENBQUM7WUFFL0QsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBdUQsQ0FBQzs7Z0JBT3RGLEtBQXNCLElBQUEsYUFBQSxpQkFBQSxRQUFRLENBQUEsa0NBQUEsd0RBQUU7b0JBQTNCLElBQU0sT0FBTyxxQkFBQTtvQkFDaEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztpQkFDaEQ7Ozs7Ozs7OztRQUNILENBQUM7UUFFRCxtQ0FB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OzZCQUNGOzs7Ozs7Ozs7cUJBQ0Y7Ozs7Ozs7OztnQkFDRCxPQUFPLFdBQVcsQ0FBQztZQUNyQixDQUFDOzs7V0FBQTtRQUVELHNCQUFJLDJDQUFnQjtpQkFBcEIsY0FBcUUsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzs7O1dBQUE7UUFDakcsb0JBQUM7SUFBRCxDQUFDLEFBOWNELElBOGNDO0lBOWNZLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbnN0YW50UG9vbH0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7RXJyb3JDb2RlLCBGYXRhbERpYWdub3N0aWNFcnJvcn0gZnJvbSAnLi4vLi4vZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHtJbmNyZW1lbnRhbEJ1aWxkfSBmcm9tICcuLi8uLi9pbmNyZW1lbnRhbC9hcGknO1xuaW1wb3J0IHtJbmRleGluZ0NvbnRleHR9IGZyb20gJy4uLy4uL2luZGV4ZXInO1xuaW1wb3J0IHtQZXJmUmVjb3JkZXJ9IGZyb20gJy4uLy4uL3BlcmYnO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9uLCBEZWNvcmF0b3IsIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcbmltcG9ydCB7VHlwZUNoZWNrQ29udGV4dH0gZnJvbSAnLi4vLi4vdHlwZWNoZWNrJztcbmltcG9ydCB7Z2V0U291cmNlRmlsZSwgaXNFeHBvcnRlZH0gZnJvbSAnLi4vLi4vdXRpbC9zcmMvdHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7QW5hbHlzaXNPdXRwdXQsIENvbXBpbGVSZXN1bHQsIERlY29yYXRvckhhbmRsZXIsIEhhbmRsZXJGbGFncywgSGFuZGxlclByZWNlZGVuY2UsIFJlc29sdmVSZXN1bHR9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7RHRzVHJhbnNmb3JtUmVnaXN0cnl9IGZyb20gJy4vZGVjbGFyYXRpb24nO1xuaW1wb3J0IHtQZW5kaW5nVHJhaXQsIFRyYWl0LCBUcmFpdFN0YXRlfSBmcm9tICcuL3RyYWl0JztcblxuXG4vKipcbiAqIFJlY29yZHMgaW5mb3JtYXRpb24gYWJvdXQgYSBzcGVjaWZpYyBjbGFzcyB0aGF0IGhhcyBtYXRjaGVkIHRyYWl0cy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDbGFzc1JlY29yZCB7XG4gIC8qKlxuICAgKiBUaGUgYENsYXNzRGVjbGFyYXRpb25gIG9mIHRoZSBjbGFzcyB3aGljaCBoYXMgQW5ndWxhciB0cmFpdHMgYXBwbGllZC5cbiAgICovXG4gIG5vZGU6IENsYXNzRGVjbGFyYXRpb247XG5cbiAgLyoqXG4gICAqIEFsbCB0cmFpdHMgd2hpY2ggbWF0Y2hlZCBvbiB0aGUgY2xhc3MuXG4gICAqL1xuICB0cmFpdHM6IFRyYWl0PHVua25vd24sIHVua25vd24sIHVua25vd24+W107XG5cbiAgLyoqXG4gICAqIE1ldGEtZGlhZ25vc3RpY3MgYWJvdXQgdGhlIGNsYXNzLCB3aGljaCBhcmUgdXN1YWxseSByZWxhdGVkIHRvIHdoZXRoZXIgY2VydGFpbiBjb21iaW5hdGlvbnMgb2ZcbiAgICogQW5ndWxhciBkZWNvcmF0b3JzIGFyZSBub3QgcGVybWl0dGVkLlxuICAgKi9cbiAgbWV0YURpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW118bnVsbDtcblxuICAvLyBTdWJzZXF1ZW50IGZpZWxkcyBhcmUgXCJpbnRlcm5hbFwiIGFuZCB1c2VkIGR1cmluZyB0aGUgbWF0Y2hpbmcgb2YgYERlY29yYXRvckhhbmRsZXJgcy4gVGhpcyBpc1xuICAvLyBtdXRhYmxlIHN0YXRlIGR1cmluZyB0aGUgYGRldGVjdGAvYGFuYWx5emVgIHBoYXNlcyBvZiBjb21waWxhdGlvbi5cblxuICAvKipcbiAgICogV2hldGhlciBgdHJhaXRzYCBjb250YWlucyB0cmFpdHMgbWF0Y2hlZCBmcm9tIGBEZWNvcmF0b3JIYW5kbGVyYHMgbWFya2VkIGFzIGBXRUFLYC5cbiAgICovXG4gIGhhc1dlYWtIYW5kbGVyczogYm9vbGVhbjtcblxuICAvKipcbiAgICogV2hldGhlciBgdHJhaXRzYCBjb250YWlucyBhIHRyYWl0IGZyb20gYSBgRGVjb3JhdG9ySGFuZGxlcmAgbWF0Y2hlZCBhcyBgUFJJTUFSWWAuXG4gICAqL1xuICBoYXNQcmltYXJ5SGFuZGxlcjogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBUaGUgaGVhcnQgb2YgQW5ndWxhciBjb21waWxhdGlvbi5cbiAqXG4gKiBUaGUgYFRyYWl0Q29tcGlsZXJgIGlzIHJlc3BvbnNpYmxlIGZvciBwcm9jZXNzaW5nIGFsbCBjbGFzc2VzIGluIHRoZSBwcm9ncmFtLiBBbnkgdGltZSBhXG4gKiBgRGVjb3JhdG9ySGFuZGxlcmAgbWF0Y2hlcyBhIGNsYXNzLCBhIFwidHJhaXRcIiBpcyBjcmVhdGVkIHRvIHJlcHJlc2VudCB0aGF0IEFuZ3VsYXIgYXNwZWN0IG9mIHRoZVxuICogY2xhc3MgKHN1Y2ggYXMgdGhlIGNsYXNzIGhhdmluZyBhIGNvbXBvbmVudCBkZWZpbml0aW9uKS5cbiAqXG4gKiBUaGUgYFRyYWl0Q29tcGlsZXJgIHRyYW5zaXRpb25zIGVhY2ggdHJhaXQgdGhyb3VnaCB0aGUgdmFyaW91cyBwaGFzZXMgb2YgY29tcGlsYXRpb24sIGN1bG1pbmF0aW5nXG4gKiBpbiB0aGUgcHJvZHVjdGlvbiBvZiBgQ29tcGlsZVJlc3VsdGBzIGluc3RydWN0aW5nIHRoZSBjb21waWxlciB0byBhcHBseSB2YXJpb3VzIG11dGF0aW9ucyB0byB0aGVcbiAqIGNsYXNzIChsaWtlIGFkZGluZyBmaWVsZHMgb3IgdHlwZSBkZWNsYXJhdGlvbnMpLlxuICovXG5leHBvcnQgY2xhc3MgVHJhaXRDb21waWxlciB7XG4gIC8qKlxuICAgKiBNYXBzIGNsYXNzIGRlY2xhcmF0aW9ucyB0byB0aGVpciBgQ2xhc3NSZWNvcmRgLCB3aGljaCB0cmFja3MgdGhlIEl2eSB0cmFpdHMgYmVpbmcgYXBwbGllZCB0b1xuICAgKiB0aG9zZSBjbGFzc2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBjbGFzc2VzID0gbmV3IE1hcDxDbGFzc0RlY2xhcmF0aW9uLCBDbGFzc1JlY29yZD4oKTtcblxuICAvKipcbiAgICogTWFwcyBzb3VyY2UgZmlsZXMgdG8gYW55IGNsYXNzIGRlY2xhcmF0aW9uKHMpIHdpdGhpbiB0aGVtIHdoaWNoIGhhdmUgYmVlbiBkaXNjb3ZlcmVkIHRvIGNvbnRhaW5cbiAgICogSXZ5IHRyYWl0cy5cbiAgICovXG4gIHByb3RlY3RlZCBmaWxlVG9DbGFzc2VzID0gbmV3IE1hcDx0cy5Tb3VyY2VGaWxlLCBTZXQ8Q2xhc3NEZWNsYXJhdGlvbj4+KCk7XG5cbiAgcHJpdmF0ZSByZWV4cG9ydE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBbc3RyaW5nLCBzdHJpbmddPj4oKTtcblxuICBwcml2YXRlIGhhbmRsZXJzQnlOYW1lID0gbmV3IE1hcDxzdHJpbmcsIERlY29yYXRvckhhbmRsZXI8dW5rbm93biwgdW5rbm93biwgdW5rbm93bj4+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGhhbmRsZXJzOiBEZWNvcmF0b3JIYW5kbGVyPHVua25vd24sIHVua25vd24sIHVua25vd24+W10sXG4gICAgICBwcml2YXRlIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QsIHByaXZhdGUgcGVyZjogUGVyZlJlY29yZGVyLFxuICAgICAgcHJpdmF0ZSBpbmNyZW1lbnRhbEJ1aWxkOiBJbmNyZW1lbnRhbEJ1aWxkPENsYXNzUmVjb3JkPixcbiAgICAgIHByaXZhdGUgY29tcGlsZU5vbkV4cG9ydGVkQ2xhc3NlczogYm9vbGVhbiwgcHJpdmF0ZSBkdHNUcmFuc2Zvcm1zOiBEdHNUcmFuc2Zvcm1SZWdpc3RyeSkge1xuICAgIGZvciAoY29uc3QgaGFuZGxlciBvZiBoYW5kbGVycykge1xuICAgICAgdGhpcy5oYW5kbGVyc0J5TmFtZS5zZXQoaGFuZGxlci5uYW1lLCBoYW5kbGVyKTtcbiAgICB9XG4gIH1cblxuICBhbmFseXplU3luYyhzZjogdHMuU291cmNlRmlsZSk6IHZvaWQgeyB0aGlzLmFuYWx5emUoc2YsIGZhbHNlKTsgfVxuXG4gIGFuYWx5emVBc3luYyhzZjogdHMuU291cmNlRmlsZSk6IFByb21pc2U8dm9pZD58dW5kZWZpbmVkIHsgcmV0dXJuIHRoaXMuYW5hbHl6ZShzZiwgdHJ1ZSk7IH1cblxuICBwcml2YXRlIGFuYWx5emUoc2Y6IHRzLlNvdXJjZUZpbGUsIHByZWFuYWx5emU6IGZhbHNlKTogdm9pZDtcbiAgcHJpdmF0ZSBhbmFseXplKHNmOiB0cy5Tb3VyY2VGaWxlLCBwcmVhbmFseXplOiB0cnVlKTogUHJvbWlzZTx2b2lkPnx1bmRlZmluZWQ7XG4gIHByaXZhdGUgYW5hbHl6ZShzZjogdHMuU291cmNlRmlsZSwgcHJlYW5hbHl6ZTogYm9vbGVhbik6IFByb21pc2U8dm9pZD58dW5kZWZpbmVkIHtcbiAgICAvLyBXZSBzaG91bGRuJ3QgYW5hbHl6ZSBkZWNsYXJhdGlvbiBmaWxlcy5cbiAgICBpZiAoc2YuaXNEZWNsYXJhdGlvbkZpbGUpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gYW5hbHl6ZSgpIHJlYWxseSB3YW50cyB0byByZXR1cm4gYFByb21pc2U8dm9pZD58dm9pZGAsIGJ1dCBUeXBlU2NyaXB0IGNhbm5vdCBuYXJyb3cgYSByZXR1cm5cbiAgICAvLyB0eXBlIG9mICd2b2lkJywgc28gYHVuZGVmaW5lZGAgaXMgdXNlZCBpbnN0ZWFkLlxuICAgIGNvbnN0IHByb21pc2VzOiBQcm9taXNlPHZvaWQ+W10gPSBbXTtcblxuICAgIGNvbnN0IHByaW9yV29yayA9IHRoaXMuaW5jcmVtZW50YWxCdWlsZC5wcmlvcldvcmtGb3Ioc2YpO1xuICAgIGlmIChwcmlvcldvcmsgIT09IG51bGwpIHtcbiAgICAgIGZvciAoY29uc3QgcHJpb3JSZWNvcmQgb2YgcHJpb3JXb3JrKSB7XG4gICAgICAgIHRoaXMuYWRvcHQocHJpb3JSZWNvcmQpO1xuICAgICAgfVxuXG4gICAgICAvLyBTa2lwIHRoZSByZXN0IG9mIGFuYWx5c2lzLCBhcyB0aGlzIGZpbGUncyBwcmlvciB0cmFpdHMgYXJlIGJlaW5nIHJldXNlZC5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB2aXNpdCA9IChub2RlOiB0cy5Ob2RlKTogdm9pZCA9PiB7XG4gICAgICBpZiAodGhpcy5yZWZsZWN0b3IuaXNDbGFzcyhub2RlKSkge1xuICAgICAgICB0aGlzLmFuYWx5emVDbGFzcyhub2RlLCBwcmVhbmFseXplID8gcHJvbWlzZXMgOiBudWxsKTtcbiAgICAgIH1cbiAgICAgIHRzLmZvckVhY2hDaGlsZChub2RlLCB2aXNpdCk7XG4gICAgfTtcblxuICAgIHZpc2l0KHNmKTtcblxuICAgIGlmIChwcmVhbmFseXplICYmIHByb21pc2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbigoKSA9PiB1bmRlZmluZWQgYXMgdm9pZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgcmVjb3JkRm9yKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogQ2xhc3NSZWNvcmR8bnVsbCB7XG4gICAgaWYgKHRoaXMuY2xhc3Nlcy5oYXMoY2xhenopKSB7XG4gICAgICByZXR1cm4gdGhpcy5jbGFzc2VzLmdldChjbGF6eikgITtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgcmVjb3Jkc0ZvcihzZjogdHMuU291cmNlRmlsZSk6IENsYXNzUmVjb3JkW118bnVsbCB7XG4gICAgaWYgKCF0aGlzLmZpbGVUb0NsYXNzZXMuaGFzKHNmKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHJlY29yZHM6IENsYXNzUmVjb3JkW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGNsYXp6IG9mIHRoaXMuZmlsZVRvQ2xhc3Nlcy5nZXQoc2YpICEpIHtcbiAgICAgIHJlY29yZHMucHVzaCh0aGlzLmNsYXNzZXMuZ2V0KGNsYXp6KSAhKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlY29yZHM7XG4gIH1cblxuICAvKipcbiAgICogSW1wb3J0IGEgYENsYXNzUmVjb3JkYCBmcm9tIGEgcHJldmlvdXMgY29tcGlsYXRpb24uXG4gICAqXG4gICAqIFRyYWl0cyBmcm9tIHRoZSBgQ2xhc3NSZWNvcmRgIGhhdmUgYWNjdXJhdGUgbWV0YWRhdGEsIGJ1dCB0aGUgYGhhbmRsZXJgIGlzIGZyb20gdGhlIG9sZCBwcm9ncmFtXG4gICAqIGFuZCBuZWVkcyB0byBiZSB1cGRhdGVkIChtYXRjaGluZyBpcyBkb25lIGJ5IG5hbWUpLiBBIG5ldyBwZW5kaW5nIHRyYWl0IGlzIGNyZWF0ZWQgYW5kIHRoZW5cbiAgICogdHJhbnNpdGlvbmVkIHRvIGFuYWx5emVkIHVzaW5nIHRoZSBwcmV2aW91cyBhbmFseXNpcy4gSWYgdGhlIHRyYWl0IGlzIGluIHRoZSBlcnJvcmVkIHN0YXRlLFxuICAgKiBpbnN0ZWFkIHRoZSBlcnJvcnMgYXJlIGNvcGllZCBvdmVyLlxuICAgKi9cbiAgcHJpdmF0ZSBhZG9wdChwcmlvclJlY29yZDogQ2xhc3NSZWNvcmQpOiB2b2lkIHtcbiAgICBjb25zdCByZWNvcmQ6IENsYXNzUmVjb3JkID0ge1xuICAgICAgaGFzUHJpbWFyeUhhbmRsZXI6IHByaW9yUmVjb3JkLmhhc1ByaW1hcnlIYW5kbGVyLFxuICAgICAgaGFzV2Vha0hhbmRsZXJzOiBwcmlvclJlY29yZC5oYXNXZWFrSGFuZGxlcnMsXG4gICAgICBtZXRhRGlhZ25vc3RpY3M6IHByaW9yUmVjb3JkLm1ldGFEaWFnbm9zdGljcyxcbiAgICAgIG5vZGU6IHByaW9yUmVjb3JkLm5vZGUsXG4gICAgICB0cmFpdHM6IFtdLFxuICAgIH07XG5cbiAgICBmb3IgKGNvbnN0IHByaW9yVHJhaXQgb2YgcHJpb3JSZWNvcmQudHJhaXRzKSB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5oYW5kbGVyc0J5TmFtZS5nZXQocHJpb3JUcmFpdC5oYW5kbGVyLm5hbWUpICE7XG4gICAgICBsZXQgdHJhaXQ6IFRyYWl0PHVua25vd24sIHVua25vd24sIHVua25vd24+ID0gVHJhaXQucGVuZGluZyhoYW5kbGVyLCBwcmlvclRyYWl0LmRldGVjdGVkKTtcblxuICAgICAgaWYgKHByaW9yVHJhaXQuc3RhdGUgPT09IFRyYWl0U3RhdGUuQU5BTFlaRUQgfHwgcHJpb3JUcmFpdC5zdGF0ZSA9PT0gVHJhaXRTdGF0ZS5SRVNPTFZFRCkge1xuICAgICAgICB0cmFpdCA9IHRyYWl0LnRvQW5hbHl6ZWQocHJpb3JUcmFpdC5hbmFseXNpcyk7XG4gICAgICAgIGlmICh0cmFpdC5oYW5kbGVyLnJlZ2lzdGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0cmFpdC5oYW5kbGVyLnJlZ2lzdGVyKHJlY29yZC5ub2RlLCB0cmFpdC5hbmFseXNpcyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocHJpb3JUcmFpdC5zdGF0ZSA9PT0gVHJhaXRTdGF0ZS5TS0lQUEVEKSB7XG4gICAgICAgIHRyYWl0ID0gdHJhaXQudG9Ta2lwcGVkKCk7XG4gICAgICB9IGVsc2UgaWYgKHByaW9yVHJhaXQuc3RhdGUgPT09IFRyYWl0U3RhdGUuRVJST1JFRCkge1xuICAgICAgICB0cmFpdCA9IHRyYWl0LnRvRXJyb3JlZChwcmlvclRyYWl0LmRpYWdub3N0aWNzKTtcbiAgICAgIH1cblxuICAgICAgcmVjb3JkLnRyYWl0cy5wdXNoKHRyYWl0KTtcbiAgICB9XG5cbiAgICB0aGlzLmNsYXNzZXMuc2V0KHJlY29yZC5ub2RlLCByZWNvcmQpO1xuICAgIGNvbnN0IHNmID0gcmVjb3JkLm5vZGUuZ2V0U291cmNlRmlsZSgpO1xuICAgIGlmICghdGhpcy5maWxlVG9DbGFzc2VzLmhhcyhzZikpIHtcbiAgICAgIHRoaXMuZmlsZVRvQ2xhc3Nlcy5zZXQoc2YsIG5ldyBTZXQ8Q2xhc3NEZWNsYXJhdGlvbj4oKSk7XG4gICAgfVxuICAgIHRoaXMuZmlsZVRvQ2xhc3Nlcy5nZXQoc2YpICEuYWRkKHJlY29yZC5ub2RlKTtcbiAgfVxuXG4gIHByaXZhdGUgc2NhbkNsYXNzRm9yVHJhaXRzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTpcbiAgICAgIFBlbmRpbmdUcmFpdDx1bmtub3duLCB1bmtub3duLCB1bmtub3duPltdfG51bGwge1xuICAgIGlmICghdGhpcy5jb21waWxlTm9uRXhwb3J0ZWRDbGFzc2VzICYmICFpc0V4cG9ydGVkKGNsYXp6KSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZGVjb3JhdG9ycyA9IHRoaXMucmVmbGVjdG9yLmdldERlY29yYXRvcnNPZkRlY2xhcmF0aW9uKGNsYXp6KTtcblxuICAgIHJldHVybiB0aGlzLmRldGVjdFRyYWl0cyhjbGF6eiwgZGVjb3JhdG9ycyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZGV0ZWN0VHJhaXRzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uLCBkZWNvcmF0b3JzOiBEZWNvcmF0b3JbXXxudWxsKTpcbiAgICAgIFBlbmRpbmdUcmFpdDx1bmtub3duLCB1bmtub3duLCB1bmtub3duPltdfG51bGwge1xuICAgIGxldCByZWNvcmQ6IENsYXNzUmVjb3JkfG51bGwgPSB0aGlzLnJlY29yZEZvcihjbGF6eik7XG4gICAgbGV0IGZvdW5kVHJhaXRzOiBQZW5kaW5nVHJhaXQ8dW5rbm93biwgdW5rbm93biwgdW5rbm93bj5bXSA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBoYW5kbGVyIG9mIHRoaXMuaGFuZGxlcnMpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGhhbmRsZXIuZGV0ZWN0KGNsYXp6LCBkZWNvcmF0b3JzKTtcbiAgICAgIGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNQcmltYXJ5SGFuZGxlciA9IGhhbmRsZXIucHJlY2VkZW5jZSA9PT0gSGFuZGxlclByZWNlZGVuY2UuUFJJTUFSWTtcbiAgICAgIGNvbnN0IGlzV2Vha0hhbmRsZXIgPSBoYW5kbGVyLnByZWNlZGVuY2UgPT09IEhhbmRsZXJQcmVjZWRlbmNlLldFQUs7XG4gICAgICBjb25zdCB0cmFpdCA9IFRyYWl0LnBlbmRpbmcoaGFuZGxlciwgcmVzdWx0KTtcblxuICAgICAgZm91bmRUcmFpdHMucHVzaCh0cmFpdCk7XG5cbiAgICAgIGlmIChyZWNvcmQgPT09IG51bGwpIHtcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZmlyc3QgaGFuZGxlciB0byBtYXRjaCB0aGlzIGNsYXNzLiBUaGlzIHBhdGggaXMgYSBmYXN0IHBhdGggdGhyb3VnaCB3aGljaFxuICAgICAgICAvLyBtb3N0IGNsYXNzZXMgd2lsbCBmbG93LlxuICAgICAgICByZWNvcmQgPSB7XG4gICAgICAgICAgbm9kZTogY2xhenosXG4gICAgICAgICAgdHJhaXRzOiBbdHJhaXRdLFxuICAgICAgICAgIG1ldGFEaWFnbm9zdGljczogbnVsbCxcbiAgICAgICAgICBoYXNQcmltYXJ5SGFuZGxlcjogaXNQcmltYXJ5SGFuZGxlcixcbiAgICAgICAgICBoYXNXZWFrSGFuZGxlcnM6IGlzV2Vha0hhbmRsZXIsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jbGFzc2VzLnNldChjbGF6eiwgcmVjb3JkKTtcbiAgICAgICAgY29uc3Qgc2YgPSBjbGF6ei5nZXRTb3VyY2VGaWxlKCk7XG4gICAgICAgIGlmICghdGhpcy5maWxlVG9DbGFzc2VzLmhhcyhzZikpIHtcbiAgICAgICAgICB0aGlzLmZpbGVUb0NsYXNzZXMuc2V0KHNmLCBuZXcgU2V0PENsYXNzRGVjbGFyYXRpb24+KCkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmlsZVRvQ2xhc3Nlcy5nZXQoc2YpICEuYWRkKGNsYXp6KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYXQgbGVhc3QgdGhlIHNlY29uZCBoYW5kbGVyIHRvIG1hdGNoIHRoaXMgY2xhc3MuIFRoaXMgaXMgYSBzbG93ZXIgcGF0aCB0aGF0IHNvbWVcbiAgICAgICAgLy8gY2xhc3NlcyB3aWxsIGdvIHRocm91Z2gsIHdoaWNoIHZhbGlkYXRlcyB0aGF0IHRoZSBzZXQgb2YgZGVjb3JhdG9ycyBhcHBsaWVkIHRvIHRoZSBjbGFzc1xuICAgICAgICAvLyBpcyB2YWxpZC5cblxuICAgICAgICAvLyBWYWxpZGF0ZSBhY2NvcmRpbmcgdG8gcnVsZXMgYXMgZm9sbG93czpcbiAgICAgICAgLy9cbiAgICAgICAgLy8gKiBXRUFLIGhhbmRsZXJzIGFyZSByZW1vdmVkIGlmIGEgbm9uLVdFQUsgaGFuZGxlciBtYXRjaGVzLlxuICAgICAgICAvLyAqIE9ubHkgb25lIFBSSU1BUlkgaGFuZGxlciBjYW4gbWF0Y2ggYXQgYSB0aW1lLiBBbnkgb3RoZXIgUFJJTUFSWSBoYW5kbGVyIG1hdGNoaW5nIGFcbiAgICAgICAgLy8gICBjbGFzcyB3aXRoIGFuIGV4aXN0aW5nIFBSSU1BUlkgaGFuZGxlciBpcyBhbiBlcnJvci5cblxuICAgICAgICBpZiAoIWlzV2Vha0hhbmRsZXIgJiYgcmVjb3JkLmhhc1dlYWtIYW5kbGVycykge1xuICAgICAgICAgIC8vIFRoZSBjdXJyZW50IGhhbmRsZXIgaXMgbm90IGEgV0VBSyBoYW5kbGVyLCBidXQgdGhlIGNsYXNzIGhhcyBvdGhlciBXRUFLIGhhbmRsZXJzLlxuICAgICAgICAgIC8vIFJlbW92ZSB0aGVtLlxuICAgICAgICAgIHJlY29yZC50cmFpdHMgPVxuICAgICAgICAgICAgICByZWNvcmQudHJhaXRzLmZpbHRlcihmaWVsZCA9PiBmaWVsZC5oYW5kbGVyLnByZWNlZGVuY2UgIT09IEhhbmRsZXJQcmVjZWRlbmNlLldFQUspO1xuICAgICAgICAgIHJlY29yZC5oYXNXZWFrSGFuZGxlcnMgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1dlYWtIYW5kbGVyICYmICFyZWNvcmQuaGFzV2Vha0hhbmRsZXJzKSB7XG4gICAgICAgICAgLy8gVGhlIGN1cnJlbnQgaGFuZGxlciBpcyBhIFdFQUsgaGFuZGxlciwgYnV0IHRoZSBjbGFzcyBoYXMgbm9uLVdFQUsgaGFuZGxlcnMgYWxyZWFkeS5cbiAgICAgICAgICAvLyBEcm9wIHRoZSBjdXJyZW50IG9uZS5cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1ByaW1hcnlIYW5kbGVyICYmIHJlY29yZC5oYXNQcmltYXJ5SGFuZGxlcikge1xuICAgICAgICAgIC8vIFRoZSBjbGFzcyBhbHJlYWR5IGhhcyBhIFBSSU1BUlkgaGFuZGxlciwgYW5kIGFub3RoZXIgb25lIGp1c3QgbWF0Y2hlZC5cbiAgICAgICAgICByZWNvcmQubWV0YURpYWdub3N0aWNzID0gW3tcbiAgICAgICAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICAgICAgICBjb2RlOiBOdW1iZXIoJy05OScgKyBFcnJvckNvZGUuREVDT1JBVE9SX0NPTExJU0lPTiksXG4gICAgICAgICAgICBmaWxlOiBnZXRTb3VyY2VGaWxlKGNsYXp6KSxcbiAgICAgICAgICAgIHN0YXJ0OiBjbGF6ei5nZXRTdGFydCh1bmRlZmluZWQsIGZhbHNlKSxcbiAgICAgICAgICAgIGxlbmd0aDogY2xhenouZ2V0V2lkdGgoKSxcbiAgICAgICAgICAgIG1lc3NhZ2VUZXh0OiAnVHdvIGluY29tcGF0aWJsZSBkZWNvcmF0b3JzIG9uIGNsYXNzJyxcbiAgICAgICAgICB9XTtcbiAgICAgICAgICByZWNvcmQudHJhaXRzID0gZm91bmRUcmFpdHMgPSBbXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgaXQncyBzYWZlIHRvIGFjY2VwdCB0aGUgbXVsdGlwbGUgZGVjb3JhdG9ycyBoZXJlLiBVcGRhdGUgc29tZSBvZiB0aGUgbWV0YWRhdGFcbiAgICAgICAgLy8gcmVnYXJkaW5nIHRoaXMgY2xhc3MuXG4gICAgICAgIHJlY29yZC50cmFpdHMucHVzaCh0cmFpdCk7XG4gICAgICAgIHJlY29yZC5oYXNQcmltYXJ5SGFuZGxlciA9IHJlY29yZC5oYXNQcmltYXJ5SGFuZGxlciB8fCBpc1ByaW1hcnlIYW5kbGVyO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmb3VuZFRyYWl0cy5sZW5ndGggPiAwID8gZm91bmRUcmFpdHMgOiBudWxsO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFuYWx5emVDbGFzcyhjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbiwgcHJlYW5hbHl6ZVF1ZXVlOiBQcm9taXNlPHZvaWQ+W118bnVsbCk6IHZvaWQge1xuICAgIGNvbnN0IHRyYWl0cyA9IHRoaXMuc2NhbkNsYXNzRm9yVHJhaXRzKGNsYXp6KTtcblxuICAgIGlmICh0cmFpdHMgPT09IG51bGwpIHtcbiAgICAgIC8vIFRoZXJlIGFyZSBubyBJdnkgdHJhaXRzIG9uIHRoZSBjbGFzcywgc28gaXQgY2FuIHNhZmVseSBiZSBza2lwcGVkLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgdHJhaXQgb2YgdHJhaXRzKSB7XG4gICAgICBjb25zdCBhbmFseXplID0gKCkgPT4gdGhpcy5hbmFseXplVHJhaXQoY2xhenosIHRyYWl0KTtcblxuICAgICAgbGV0IHByZWFuYWx5c2lzOiBQcm9taXNlPHZvaWQ+fG51bGwgPSBudWxsO1xuICAgICAgaWYgKHByZWFuYWx5emVRdWV1ZSAhPT0gbnVsbCAmJiB0cmFpdC5oYW5kbGVyLnByZWFuYWx5emUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBBdHRlbXB0IHRvIHJ1biBwcmVhbmFseXNpcy4gVGhpcyBjb3VsZCBmYWlsIHdpdGggYSBgRmF0YWxEaWFnbm9zdGljRXJyb3JgOyBjYXRjaCBpdCBpZiBpdFxuICAgICAgICAvLyBkb2VzLlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHByZWFuYWx5c2lzID0gdHJhaXQuaGFuZGxlci5wcmVhbmFseXplKGNsYXp6LCB0cmFpdC5kZXRlY3RlZC5tZXRhZGF0YSkgfHwgbnVsbDtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEZhdGFsRGlhZ25vc3RpY0Vycm9yKSB7XG4gICAgICAgICAgICB0cmFpdC50b0Vycm9yZWQoW2Vyci50b0RpYWdub3N0aWMoKV0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocHJlYW5hbHlzaXMgIT09IG51bGwpIHtcbiAgICAgICAgcHJlYW5hbHl6ZVF1ZXVlICEucHVzaChwcmVhbmFseXNpcy50aGVuKGFuYWx5emUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFuYWx5emUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgYW5hbHl6ZVRyYWl0KFxuICAgICAgY2xheno6IENsYXNzRGVjbGFyYXRpb24sIHRyYWl0OiBUcmFpdDx1bmtub3duLCB1bmtub3duLCB1bmtub3duPixcbiAgICAgIGZsYWdzPzogSGFuZGxlckZsYWdzKTogdm9pZCB7XG4gICAgaWYgKHRyYWl0LnN0YXRlICE9PSBUcmFpdFN0YXRlLlBFTkRJTkcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQXR0ZW1wdCB0byBhbmFseXplIHRyYWl0IG9mICR7Y2xhenoubmFtZS50ZXh0fSBpbiBzdGF0ZSAke1RyYWl0U3RhdGVbdHJhaXQuc3RhdGVdfSAoZXhwZWN0ZWQgREVURUNURUQpYCk7XG4gICAgfVxuXG4gICAgLy8gQXR0ZW1wdCBhbmFseXNpcy4gVGhpcyBjb3VsZCBmYWlsIHdpdGggYSBgRmF0YWxEaWFnbm9zdGljRXJyb3JgOyBjYXRjaCBpdCBpZiBpdCBkb2VzLlxuICAgIGxldCByZXN1bHQ6IEFuYWx5c2lzT3V0cHV0PHVua25vd24+O1xuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSB0cmFpdC5oYW5kbGVyLmFuYWx5emUoY2xhenosIHRyYWl0LmRldGVjdGVkLm1ldGFkYXRhLCBmbGFncyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRmF0YWxEaWFnbm9zdGljRXJyb3IpIHtcbiAgICAgICAgdHJhaXQgPSB0cmFpdC50b0Vycm9yZWQoW2Vyci50b0RpYWdub3N0aWMoKV0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlc3VsdC5kaWFnbm9zdGljcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0cmFpdCA9IHRyYWl0LnRvRXJyb3JlZChyZXN1bHQuZGlhZ25vc3RpY3MpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LmFuYWx5c2lzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEFuYWx5c2lzIHdhcyBzdWNjZXNzZnVsLiBUcmlnZ2VyIHJlZ2lzdHJhdGlvbi5cbiAgICAgIGlmICh0cmFpdC5oYW5kbGVyLnJlZ2lzdGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdHJhaXQuaGFuZGxlci5yZWdpc3RlcihjbGF6eiwgcmVzdWx0LmFuYWx5c2lzKTtcbiAgICAgIH1cblxuICAgICAgLy8gU3VjY2Vzc2Z1bGx5IGFuYWx5emVkIGFuZCByZWdpc3RlcmVkLlxuICAgICAgdHJhaXQgPSB0cmFpdC50b0FuYWx5emVkKHJlc3VsdC5hbmFseXNpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyYWl0ID0gdHJhaXQudG9Ta2lwcGVkKCk7XG4gICAgfVxuICB9XG5cbiAgcmVzb2x2ZSgpOiB2b2lkIHtcbiAgICBjb25zdCBjbGFzc2VzID0gQXJyYXkuZnJvbSh0aGlzLmNsYXNzZXMua2V5cygpKTtcbiAgICBmb3IgKGNvbnN0IGNsYXp6IG9mIGNsYXNzZXMpIHtcbiAgICAgIGNvbnN0IHJlY29yZCA9IHRoaXMuY2xhc3Nlcy5nZXQoY2xhenopICE7XG4gICAgICBmb3IgKGxldCB0cmFpdCBvZiByZWNvcmQudHJhaXRzKSB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0cmFpdC5oYW5kbGVyO1xuICAgICAgICBzd2l0Y2ggKHRyYWl0LnN0YXRlKSB7XG4gICAgICAgICAgY2FzZSBUcmFpdFN0YXRlLlNLSVBQRUQ6XG4gICAgICAgICAgY2FzZSBUcmFpdFN0YXRlLkVSUk9SRUQ6XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICBjYXNlIFRyYWl0U3RhdGUuUEVORElORzpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgUmVzb2x2aW5nIGEgdHJhaXQgdGhhdCBoYXNuJ3QgYmVlbiBhbmFseXplZDogJHtjbGF6ei5uYW1lLnRleHR9IC8gJHtPYmplY3QuZ2V0UHJvdG90eXBlT2YodHJhaXQuaGFuZGxlcikuY29uc3RydWN0b3IubmFtZX1gKTtcbiAgICAgICAgICBjYXNlIFRyYWl0U3RhdGUuUkVTT0xWRUQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlc29sdmluZyBhbiBhbHJlYWR5IHJlc29sdmVkIHRyYWl0YCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFuZGxlci5yZXNvbHZlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBObyByZXNvbHV0aW9uIG9mIHRoaXMgdHJhaXQgbmVlZGVkIC0gaXQncyBjb25zaWRlcmVkIHN1Y2Nlc3NmdWwgYnkgZGVmYXVsdC5cbiAgICAgICAgICB0cmFpdCA9IHRyYWl0LnRvUmVzb2x2ZWQobnVsbCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmVzdWx0OiBSZXNvbHZlUmVzdWx0PHVua25vd24+O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3VsdCA9IGhhbmRsZXIucmVzb2x2ZShjbGF6eiwgdHJhaXQuYW5hbHlzaXMgYXMgUmVhZG9ubHk8dW5rbm93bj4pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRmF0YWxEaWFnbm9zdGljRXJyb3IpIHtcbiAgICAgICAgICAgIHRyYWl0ID0gdHJhaXQudG9FcnJvcmVkKFtlcnIudG9EaWFnbm9zdGljKCldKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3VsdC5kaWFnbm9zdGljcyAhPT0gdW5kZWZpbmVkICYmIHJlc3VsdC5kaWFnbm9zdGljcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdHJhaXQgPSB0cmFpdC50b0Vycm9yZWQocmVzdWx0LmRpYWdub3N0aWNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocmVzdWx0LmRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdHJhaXQgPSB0cmFpdC50b1Jlc29sdmVkKHJlc3VsdC5kYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJhaXQgPSB0cmFpdC50b1Jlc29sdmVkKG51bGwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXN1bHQucmVleHBvcnRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjb25zdCBmaWxlTmFtZSA9IGNsYXp6LmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZTtcbiAgICAgICAgICBpZiAoIXRoaXMucmVleHBvcnRNYXAuaGFzKGZpbGVOYW1lKSkge1xuICAgICAgICAgICAgdGhpcy5yZWV4cG9ydE1hcC5zZXQoZmlsZU5hbWUsIG5ldyBNYXA8c3RyaW5nLCBbc3RyaW5nLCBzdHJpbmddPigpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZmlsZVJlZXhwb3J0cyA9IHRoaXMucmVleHBvcnRNYXAuZ2V0KGZpbGVOYW1lKSAhO1xuICAgICAgICAgIGZvciAoY29uc3QgcmVleHBvcnQgb2YgcmVzdWx0LnJlZXhwb3J0cykge1xuICAgICAgICAgICAgZmlsZVJlZXhwb3J0cy5zZXQocmVleHBvcnQuYXNBbGlhcywgW3JlZXhwb3J0LmZyb21Nb2R1bGUsIHJlZXhwb3J0LnN5bWJvbE5hbWVdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0eXBlQ2hlY2soY3R4OiBUeXBlQ2hlY2tDb250ZXh0KTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBjbGF6eiBvZiB0aGlzLmNsYXNzZXMua2V5cygpKSB7XG4gICAgICBjb25zdCByZWNvcmQgPSB0aGlzLmNsYXNzZXMuZ2V0KGNsYXp6KSAhO1xuICAgICAgZm9yIChjb25zdCB0cmFpdCBvZiByZWNvcmQudHJhaXRzKSB7XG4gICAgICAgIGlmICh0cmFpdC5zdGF0ZSAhPT0gVHJhaXRTdGF0ZS5SRVNPTFZFRCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHRyYWl0LmhhbmRsZXIudHlwZUNoZWNrID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB0cmFpdC5oYW5kbGVyLnR5cGVDaGVjayhjdHgsIGNsYXp6LCB0cmFpdC5hbmFseXNpcywgdHJhaXQucmVzb2x1dGlvbik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaW5kZXgoY3R4OiBJbmRleGluZ0NvbnRleHQpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGNsYXp6IG9mIHRoaXMuY2xhc3Nlcy5rZXlzKCkpIHtcbiAgICAgIGNvbnN0IHJlY29yZCA9IHRoaXMuY2xhc3Nlcy5nZXQoY2xhenopICE7XG4gICAgICBmb3IgKGNvbnN0IHRyYWl0IG9mIHJlY29yZC50cmFpdHMpIHtcbiAgICAgICAgaWYgKHRyYWl0LnN0YXRlICE9PSBUcmFpdFN0YXRlLlJFU09MVkVEKSB7XG4gICAgICAgICAgLy8gU2tpcCB0cmFpdHMgdGhhdCBoYXZlbid0IGJlZW4gcmVzb2x2ZWQgc3VjY2Vzc2Z1bGx5LlxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHRyYWl0LmhhbmRsZXIuaW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIFNraXAgdHJhaXRzIHRoYXQgZG9uJ3QgYWZmZWN0IGluZGV4aW5nLlxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJhaXQuaGFuZGxlci5pbmRleChjdHgsIGNsYXp6LCB0cmFpdC5hbmFseXNpcywgdHJhaXQucmVzb2x1dGlvbik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29tcGlsZShjbGF6ejogdHMuRGVjbGFyYXRpb24sIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sKTogQ29tcGlsZVJlc3VsdFtdfG51bGwge1xuICAgIGNvbnN0IG9yaWdpbmFsID0gdHMuZ2V0T3JpZ2luYWxOb2RlKGNsYXp6KSBhcyB0eXBlb2YgY2xheno7XG4gICAgaWYgKCF0aGlzLnJlZmxlY3Rvci5pc0NsYXNzKGNsYXp6KSB8fCAhdGhpcy5yZWZsZWN0b3IuaXNDbGFzcyhvcmlnaW5hbCkgfHxcbiAgICAgICAgIXRoaXMuY2xhc3Nlcy5oYXMob3JpZ2luYWwpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvcmQgPSB0aGlzLmNsYXNzZXMuZ2V0KG9yaWdpbmFsKSAhO1xuXG4gICAgbGV0IHJlczogQ29tcGlsZVJlc3VsdFtdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IHRyYWl0IG9mIHJlY29yZC50cmFpdHMpIHtcbiAgICAgIGlmICh0cmFpdC5zdGF0ZSAhPT0gVHJhaXRTdGF0ZS5SRVNPTFZFRCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29tcGlsZVNwYW4gPSB0aGlzLnBlcmYuc3RhcnQoJ2NvbXBpbGVDbGFzcycsIG9yaWdpbmFsKTtcbiAgICAgIGNvbnN0IGNvbXBpbGVNYXRjaFJlcyA9XG4gICAgICAgICAgdHJhaXQuaGFuZGxlci5jb21waWxlKGNsYXp6LCB0cmFpdC5hbmFseXNpcywgdHJhaXQucmVzb2x1dGlvbiwgY29uc3RhbnRQb29sKTtcbiAgICAgIHRoaXMucGVyZi5zdG9wKGNvbXBpbGVTcGFuKTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvbXBpbGVNYXRjaFJlcykpIHtcbiAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgY29tcGlsZU1hdGNoUmVzKSB7XG4gICAgICAgICAgaWYgKCFyZXMuc29tZShyID0+IHIubmFtZSA9PT0gcmVzdWx0Lm5hbWUpKSB7XG4gICAgICAgICAgICByZXMucHVzaChyZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghcmVzLnNvbWUocmVzdWx0ID0+IHJlc3VsdC5uYW1lID09PSBjb21waWxlTWF0Y2hSZXMubmFtZSkpIHtcbiAgICAgICAgcmVzLnB1c2goY29tcGlsZU1hdGNoUmVzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMb29rIHVwIHRoZSAuZC50cyB0cmFuc2Zvcm1lciBmb3IgdGhlIGlucHV0IGZpbGUgYW5kIHJlY29yZCB0aGF0IGF0IGxlYXN0IG9uZSBmaWVsZCB3YXNcbiAgICAvLyBnZW5lcmF0ZWQsIHdoaWNoIHdpbGwgYWxsb3cgdGhlIC5kLnRzIHRvIGJlIHRyYW5zZm9ybWVkIGxhdGVyLlxuICAgIHRoaXMuZHRzVHJhbnNmb3Jtcy5nZXRJdnlEZWNsYXJhdGlvblRyYW5zZm9ybShvcmlnaW5hbC5nZXRTb3VyY2VGaWxlKCkpXG4gICAgICAgIC5hZGRGaWVsZHMob3JpZ2luYWwsIHJlcyk7XG5cbiAgICAvLyBSZXR1cm4gdGhlIGluc3RydWN0aW9uIHRvIHRoZSB0cmFuc2Zvcm1lciBzbyB0aGUgZmllbGRzIHdpbGwgYmUgYWRkZWQuXG4gICAgcmV0dXJuIHJlcy5sZW5ndGggPiAwID8gcmVzIDogbnVsbDtcbiAgfVxuXG4gIGRlY29yYXRvcnNGb3Iobm9kZTogdHMuRGVjbGFyYXRpb24pOiB0cy5EZWNvcmF0b3JbXSB7XG4gICAgY29uc3Qgb3JpZ2luYWwgPSB0cy5nZXRPcmlnaW5hbE5vZGUobm9kZSkgYXMgdHlwZW9mIG5vZGU7XG4gICAgaWYgKCF0aGlzLnJlZmxlY3Rvci5pc0NsYXNzKG9yaWdpbmFsKSB8fCAhdGhpcy5jbGFzc2VzLmhhcyhvcmlnaW5hbCkpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvcmQgPSB0aGlzLmNsYXNzZXMuZ2V0KG9yaWdpbmFsKSAhO1xuICAgIGNvbnN0IGRlY29yYXRvcnM6IHRzLkRlY29yYXRvcltdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IHRyYWl0IG9mIHJlY29yZC50cmFpdHMpIHtcbiAgICAgIGlmICh0cmFpdC5zdGF0ZSAhPT0gVHJhaXRTdGF0ZS5SRVNPTFZFRCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRyYWl0LmRldGVjdGVkLnRyaWdnZXIgIT09IG51bGwgJiYgdHMuaXNEZWNvcmF0b3IodHJhaXQuZGV0ZWN0ZWQudHJpZ2dlcikpIHtcbiAgICAgICAgZGVjb3JhdG9ycy5wdXNoKHRyYWl0LmRldGVjdGVkLnRyaWdnZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkZWNvcmF0b3JzO1xuICB9XG5cbiAgZ2V0IGRpYWdub3N0aWNzKCk6IFJlYWRvbmx5QXJyYXk8dHMuRGlhZ25vc3RpYz4ge1xuICAgIGNvbnN0IGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGNsYXp6IG9mIHRoaXMuY2xhc3Nlcy5rZXlzKCkpIHtcbiAgICAgIGNvbnN0IHJlY29yZCA9IHRoaXMuY2xhc3Nlcy5nZXQoY2xhenopICE7XG4gICAgICBpZiAocmVjb3JkLm1ldGFEaWFnbm9zdGljcyAhPT0gbnVsbCkge1xuICAgICAgICBkaWFnbm9zdGljcy5wdXNoKC4uLnJlY29yZC5tZXRhRGlhZ25vc3RpY3MpO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCB0cmFpdCBvZiByZWNvcmQudHJhaXRzKSB7XG4gICAgICAgIGlmICh0cmFpdC5zdGF0ZSA9PT0gVHJhaXRTdGF0ZS5FUlJPUkVEKSB7XG4gICAgICAgICAgZGlhZ25vc3RpY3MucHVzaCguLi50cmFpdC5kaWFnbm9zdGljcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRpYWdub3N0aWNzO1xuICB9XG5cbiAgZ2V0IGV4cG9ydFN0YXRlbWVudHMoKTogTWFwPHN0cmluZywgTWFwPHN0cmluZywgW3N0cmluZywgc3RyaW5nXT4+IHsgcmV0dXJuIHRoaXMucmVleHBvcnRNYXA7IH1cbn1cbiJdfQ==