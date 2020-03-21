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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/context", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics", "@angular/compiler-cli/src/ngtsc/typecheck/src/dom", "@angular/compiler-cli/src/ngtsc/typecheck/src/environment", "@angular/compiler-cli/src/ngtsc/typecheck/src/host", "@angular/compiler-cli/src/ngtsc/typecheck/src/oob", "@angular/compiler-cli/src/ngtsc/typecheck/src/source", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_block", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_file", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_constructor"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics");
    var dom_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/dom");
    var environment_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/environment");
    var host_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/host");
    var oob_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/oob");
    var source_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/source");
    var type_check_block_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_block");
    var type_check_file_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_file");
    var type_constructor_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_constructor");
    /**
     * A template type checking context for a program.
     *
     * The `TypeCheckContext` allows registration of components and their templates which need to be
     * type checked. It also allows generation of modified `ts.SourceFile`s which contain the type
     * checking code.
     */
    var TypeCheckContext = /** @class */ (function () {
        function TypeCheckContext(config, refEmitter, reflector, typeCheckFilePath) {
            this.config = config;
            this.refEmitter = refEmitter;
            this.reflector = reflector;
            /**
             * A `Map` of `ts.SourceFile`s that the context has seen to the operations (additions of methods
             * or type-check blocks) that need to be eventually performed on that file.
             */
            this.opMap = new Map();
            /**
             * Tracks when an a particular class has a pending type constructor patching operation already
             * queued.
             */
            this.typeCtorPending = new Set();
            this.sourceManager = new source_1.TemplateSourceManager();
            this.domSchemaChecker = new dom_1.RegistryDomSchemaChecker(this.sourceManager);
            this.oobRecorder = new oob_1.OutOfBandDiagnosticRecorderImpl(this.sourceManager);
            this.typeCheckFile = new type_check_file_1.TypeCheckFile(typeCheckFilePath, config, refEmitter, reflector);
        }
        /**
         * Record a template for the given component `node`, with a `SelectorMatcher` for directive
         * matching.
         *
         * @param node class of the node being recorded.
         * @param template AST nodes of the template being recorded.
         * @param matcher `SelectorMatcher` which tracks directives that are in scope for this template.
         */
        TypeCheckContext.prototype.addTemplate = function (ref, boundTarget, pipes, schemas, sourceMapping, file) {
            var e_1, _a;
            var id = this.sourceManager.captureSource(sourceMapping, file);
            try {
                // Get all of the directives used in the template and record type constructors for all of them.
                for (var _b = tslib_1.__values(boundTarget.getUsedDirectives()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var dir = _c.value;
                    var dirRef = dir.ref;
                    var dirNode = dirRef.node;
                    if (type_constructor_1.requiresInlineTypeCtor(dirNode, this.reflector)) {
                        // Add a type constructor operation for the directive.
                        this.addInlineTypeCtor(dirNode.getSourceFile(), dirRef, {
                            fnName: 'ngTypeCtor',
                            // The constructor should have a body if the directive comes from a .ts file, but not if
                            // it comes from a .d.ts file. .d.ts declarations don't have bodies.
                            body: !dirNode.getSourceFile().isDeclarationFile,
                            fields: {
                                inputs: Object.keys(dir.inputs),
                                outputs: Object.keys(dir.outputs),
                                // TODO(alxhub): support queries
                                queries: dir.queries,
                            },
                            coercedInputFields: dir.coercedInputFields,
                        });
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var tcbMetadata = { id: id, boundTarget: boundTarget, pipes: pipes, schemas: schemas };
            if (type_check_block_1.requiresInlineTypeCheckBlock(ref.node)) {
                // This class didn't meet the requirements for external type checking, so generate an inline
                // TCB for the class.
                this.addInlineTypeCheckBlock(ref, tcbMetadata);
            }
            else {
                // The class can be type-checked externally as normal.
                this.typeCheckFile.addTypeCheckBlock(ref, tcbMetadata, this.domSchemaChecker, this.oobRecorder);
            }
        };
        /**
         * Record a type constructor for the given `node` with the given `ctorMetadata`.
         */
        TypeCheckContext.prototype.addInlineTypeCtor = function (sf, ref, ctorMeta) {
            if (this.typeCtorPending.has(ref.node)) {
                return;
            }
            this.typeCtorPending.add(ref.node);
            // Lazily construct the operation map.
            if (!this.opMap.has(sf)) {
                this.opMap.set(sf, []);
            }
            var ops = this.opMap.get(sf);
            // Push a `TypeCtorOp` into the operation queue for the source file.
            ops.push(new TypeCtorOp(ref, ctorMeta));
        };
        /**
         * Transform a `ts.SourceFile` into a version that includes type checking code.
         *
         * If this particular source file has no directives that require type constructors, or components
         * that require type check blocks, then it will be returned directly. Otherwise, a new
         * `ts.SourceFile` is parsed from modified text of the original. This is necessary to ensure the
         * added code has correct positional information associated with it.
         */
        TypeCheckContext.prototype.transform = function (sf) {
            var _this = this;
            // If there are no operations pending for this particular file, return it directly.
            if (!this.opMap.has(sf)) {
                return sf;
            }
            // Imports may need to be added to the file to support type-checking of directives used in the
            // template within it.
            var importManager = new translator_1.ImportManager(new imports_1.NoopImportRewriter(), '_i');
            // Each Op has a splitPoint index into the text where it needs to be inserted. Split the
            // original source text into chunks at these split points, where code will be inserted between
            // the chunks.
            var ops = this.opMap.get(sf).sort(orderOps);
            var textParts = splitStringAtPoints(sf.text, ops.map(function (op) { return op.splitPoint; }));
            // Use a `ts.Printer` to generate source code.
            var printer = ts.createPrinter({ omitTrailingSemicolon: true });
            // Begin with the intial section of the code text.
            var code = textParts[0];
            // Process each operation and use the printer to generate source code for it, inserting it into
            // the source code in between the original chunks.
            ops.forEach(function (op, idx) {
                var text = op.execute(importManager, sf, _this.refEmitter, printer);
                code += '\n\n' + text + textParts[idx + 1];
            });
            // Write out the imports that need to be added to the beginning of the file.
            var imports = importManager.getAllImports(sf.fileName)
                .map(function (i) { return "import * as " + i.qualifier + " from '" + i.specifier + "';"; })
                .join('\n');
            code = imports + '\n' + code;
            // Parse the new source file and return it.
            return ts.createSourceFile(sf.fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        };
        TypeCheckContext.prototype.calculateTemplateDiagnostics = function (originalProgram, originalHost, originalOptions) {
            var e_2, _a, e_3, _b;
            var _this = this;
            var typeCheckSf = this.typeCheckFile.render();
            // First, build the map of original source files.
            var sfMap = new Map();
            var interestingFiles = [typeCheckSf];
            try {
                for (var _c = tslib_1.__values(originalProgram.getSourceFiles()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var originalSf = _d.value;
                    var sf = this.transform(originalSf);
                    sfMap.set(sf.fileName, sf);
                    if (!sf.isDeclarationFile && this.opMap.has(originalSf)) {
                        interestingFiles.push(sf);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_2) throw e_2.error; }
            }
            sfMap.set(typeCheckSf.fileName, typeCheckSf);
            var typeCheckProgram = ts.createProgram({
                host: new host_1.TypeCheckProgramHost(sfMap, originalHost),
                options: originalOptions,
                oldProgram: originalProgram,
                rootNames: originalProgram.getRootFileNames(),
            });
            var diagnostics = [];
            var collectDiagnostics = function (diags) {
                var e_4, _a;
                try {
                    for (var diags_1 = tslib_1.__values(diags), diags_1_1 = diags_1.next(); !diags_1_1.done; diags_1_1 = diags_1.next()) {
                        var diagnostic = diags_1_1.value;
                        if (diagnostics_1.shouldReportDiagnostic(diagnostic)) {
                            var translated = diagnostics_1.translateDiagnostic(diagnostic, _this.sourceManager);
                            if (translated !== null) {
                                diagnostics.push(translated);
                            }
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (diags_1_1 && !diags_1_1.done && (_a = diags_1.return)) _a.call(diags_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            };
            try {
                for (var interestingFiles_1 = tslib_1.__values(interestingFiles), interestingFiles_1_1 = interestingFiles_1.next(); !interestingFiles_1_1.done; interestingFiles_1_1 = interestingFiles_1.next()) {
                    var sf = interestingFiles_1_1.value;
                    collectDiagnostics(typeCheckProgram.getSemanticDiagnostics(sf));
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (interestingFiles_1_1 && !interestingFiles_1_1.done && (_b = interestingFiles_1.return)) _b.call(interestingFiles_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            diagnostics.push.apply(diagnostics, tslib_1.__spread(this.domSchemaChecker.diagnostics));
            diagnostics.push.apply(diagnostics, tslib_1.__spread(this.oobRecorder.diagnostics));
            return {
                diagnostics: diagnostics,
                program: typeCheckProgram,
            };
        };
        TypeCheckContext.prototype.addInlineTypeCheckBlock = function (ref, tcbMeta) {
            var sf = ref.node.getSourceFile();
            if (!this.opMap.has(sf)) {
                this.opMap.set(sf, []);
            }
            var ops = this.opMap.get(sf);
            ops.push(new TcbOp(ref, tcbMeta, this.config, this.reflector, this.domSchemaChecker, this.oobRecorder));
        };
        return TypeCheckContext;
    }());
    exports.TypeCheckContext = TypeCheckContext;
    /**
     * A type check block operation which produces type check code for a particular component.
     */
    var TcbOp = /** @class */ (function () {
        function TcbOp(ref, meta, config, reflector, domSchemaChecker, oobRecorder) {
            this.ref = ref;
            this.meta = meta;
            this.config = config;
            this.reflector = reflector;
            this.domSchemaChecker = domSchemaChecker;
            this.oobRecorder = oobRecorder;
        }
        Object.defineProperty(TcbOp.prototype, "splitPoint", {
            /**
             * Type check blocks are inserted immediately after the end of the component class.
             */
            get: function () { return this.ref.node.end + 1; },
            enumerable: true,
            configurable: true
        });
        TcbOp.prototype.execute = function (im, sf, refEmitter, printer) {
            var env = new environment_1.Environment(this.config, im, refEmitter, this.reflector, sf);
            var fnName = ts.createIdentifier("_tcb_" + this.ref.node.pos);
            var fn = type_check_block_1.generateTypeCheckBlock(env, this.ref, fnName, this.meta, this.domSchemaChecker, this.oobRecorder);
            return printer.printNode(ts.EmitHint.Unspecified, fn, sf);
        };
        return TcbOp;
    }());
    /**
     * A type constructor operation which produces type constructor code for a particular directive.
     */
    var TypeCtorOp = /** @class */ (function () {
        function TypeCtorOp(ref, meta) {
            this.ref = ref;
            this.meta = meta;
        }
        Object.defineProperty(TypeCtorOp.prototype, "splitPoint", {
            /**
             * Type constructor operations are inserted immediately before the end of the directive class.
             */
            get: function () { return this.ref.node.end - 1; },
            enumerable: true,
            configurable: true
        });
        TypeCtorOp.prototype.execute = function (im, sf, refEmitter, printer) {
            var tcb = type_constructor_1.generateInlineTypeCtor(this.ref.node, this.meta);
            return printer.printNode(ts.EmitHint.Unspecified, tcb, sf);
        };
        return TypeCtorOp;
    }());
    /**
     * Compare two operations and return their split point ordering.
     */
    function orderOps(op1, op2) {
        return op1.splitPoint - op2.splitPoint;
    }
    /**
     * Split a string into chunks at any number of split points.
     */
    function splitStringAtPoints(str, points) {
        var splits = [];
        var start = 0;
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            splits.push(str.substring(start, point));
            start = point;
        }
        splits.push(str.substring(start));
        return splits;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy9jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUdILCtCQUFpQztJQUdqQyxtRUFBOEU7SUFFOUUseUVBQStDO0lBRy9DLHlGQUEwRTtJQUMxRSx5RUFBaUU7SUFDakUseUZBQTBDO0lBQzFDLDJFQUE0QztJQUM1Qyx5RUFBbUY7SUFDbkYsK0VBQStDO0lBQy9DLG1HQUF3RjtJQUN4RixpR0FBZ0Q7SUFDaEQsbUdBQWtGO0lBSWxGOzs7Ozs7T0FNRztJQUNIO1FBR0UsMEJBQ1ksTUFBMEIsRUFBVSxVQUE0QixFQUNoRSxTQUF5QixFQUFFLGlCQUFpQztZQUQ1RCxXQUFNLEdBQU4sTUFBTSxDQUFvQjtZQUFVLGVBQVUsR0FBVixVQUFVLENBQWtCO1lBQ2hFLGNBQVMsR0FBVCxTQUFTLENBQWdCO1lBSXJDOzs7ZUFHRztZQUNLLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBdUIsQ0FBQztZQUUvQzs7O2VBR0c7WUFDSyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO1lBRWpELGtCQUFhLEdBQUcsSUFBSSw4QkFBcUIsRUFBRSxDQUFDO1lBRTVDLHFCQUFnQixHQUFHLElBQUksOEJBQXdCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXBFLGdCQUFXLEdBQUcsSUFBSSxxQ0FBK0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFuQjVFLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSwrQkFBYSxDQUFDLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDM0YsQ0FBQztRQW9CRDs7Ozs7OztXQU9HO1FBQ0gsc0NBQVcsR0FBWCxVQUNJ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QUUsT0FBbUI7WUFFN0YsSUFBTSxHQUFHLEdBQUcseUNBQXNCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdELE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUNILGlCQUFDO0lBQUQsQ0FBQyxBQWZELElBZUM7SUFFRDs7T0FFRztJQUNILFNBQVMsUUFBUSxDQUFDLEdBQU8sRUFBRSxHQUFPO1FBQ2hDLE9BQU8sR0FBRyxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMsbUJBQW1CLENBQUMsR0FBVyxFQUFFLE1BQWdCO1FBQ3hELElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUM1QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN0QyxJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLEtBQUssR0FBRyxLQUFLLENBQUM7U0FDZjtRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Qm91bmRUYXJnZXQsIFBhcnNlU291cmNlRmlsZSwgU2NoZW1hTWV0YWRhdGF9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0Fic29sdXRlRnNQYXRofSBmcm9tICcuLi8uLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge05vb3BJbXBvcnRSZXdyaXRlciwgUmVmZXJlbmNlLCBSZWZlcmVuY2VFbWl0dGVyfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtJbXBvcnRNYW5hZ2VyfSBmcm9tICcuLi8uLi90cmFuc2xhdG9yJztcblxuaW1wb3J0IHtUZW1wbGF0ZVNvdXJjZU1hcHBpbmcsIFR5cGVDaGVja0Jsb2NrTWV0YWRhdGEsIFR5cGVDaGVja2FibGVEaXJlY3RpdmVNZXRhLCBUeXBlQ2hlY2tpbmdDb25maWcsIFR5cGVDdG9yTWV0YWRhdGF9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7c2hvdWxkUmVwb3J0RGlhZ25vc3RpYywgdHJhbnNsYXRlRGlhZ25vc3RpY30gZnJvbSAnLi9kaWFnbm9zdGljcyc7XG5pbXBvcnQge0RvbVNjaGVtYUNoZWNrZXIsIFJlZ2lzdHJ5RG9tU2NoZW1hQ2hlY2tlcn0gZnJvbSAnLi9kb20nO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSAnLi9lbnZpcm9ubWVudCc7XG5pbXBvcnQge1R5cGVDaGVja1Byb2dyYW1Ib3N0fSBmcm9tICcuL2hvc3QnO1xuaW1wb3J0IHtPdXRPZkJhbmREaWFnbm9zdGljUmVjb3JkZXIsIE91dE9mQmFuZERpYWdub3N0aWNSZWNvcmRlckltcGx9IGZyb20gJy4vb29iJztcbmltcG9ydCB7VGVtcGxhdGVTb3VyY2VNYW5hZ2VyfSBmcm9tICcuL3NvdXJjZSc7XG5pbXBvcnQge2dlbmVyYXRlVHlwZUNoZWNrQmxvY2ssIHJlcXVpcmVzSW5saW5lVHlwZUNoZWNrQmxvY2t9IGZyb20gJy4vdHlwZV9jaGVja19ibG9jayc7XG5pbXBvcnQge1R5cGVDaGVja0ZpbGV9IGZyb20gJy4vdHlwZV9jaGVja19maWxlJztcbmltcG9ydCB7Z2VuZXJhdGVJbmxpbmVUeXBlQ3RvciwgcmVxdWlyZXNJbmxpbmVUeXBlQ3Rvcn0gZnJvbSAnLi90eXBlX2NvbnN0cnVjdG9yJztcblxuXG5cbi8qKlxuICogQSB0ZW1wbGF0ZSB0eXBlIGNoZWNraW5nIGNvbnRleHQgZm9yIGEgcHJvZ3JhbS5cbiAqXG4gKiBUaGUgYFR5cGVDaGVja0NvbnRleHRgIGFsbG93cyByZWdpc3RyYXRpb24gb2YgY29tcG9uZW50cyBhbmQgdGhlaXIgdGVtcGxhdGVzIHdoaWNoIG5lZWQgdG8gYmVcbiAqIHR5cGUgY2hlY2tlZC4gSXQgYWxzbyBhbGxvd3MgZ2VuZXJhdGlvbiBvZiBtb2RpZmllZCBgdHMuU291cmNlRmlsZWBzIHdoaWNoIGNvbnRhaW4gdGhlIHR5cGVcbiAqIGNoZWNraW5nIGNvZGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBUeXBlQ2hlY2tDb250ZXh0IHtcbiAgcHJpdmF0ZSB0eXBlQ2hlY2tGaWxlOiBUeXBlQ2hlY2tGaWxlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBjb25maWc6IFR5cGVDaGVja2luZ0NvbmZpZywgcHJpdmF0ZSByZWZFbWl0dGVyOiBSZWZlcmVuY2VFbWl0dGVyLFxuICAgICAgcHJpdmF0ZSByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LCB0eXBlQ2hlY2tGaWxlUGF0aDogQWJzb2x1dGVGc1BhdGgpIHtcbiAgICB0aGlzLnR5cGVDaGVja0ZpbGUgPSBuZXcgVHlwZUNoZWNrRmlsZSh0eXBlQ2hlY2tGaWxlUGF0aCwgY29uZmlnLCByZWZFbWl0dGVyLCByZWZsZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgYE1hcGAgb2YgYHRzLlNvdXJjZUZpbGVgcyB0aGF0IHRoZSBjb250ZXh0IGhhcyBzZWVuIHRvIHRoZSBvcGVyYXRpb25zIChhZGRpdGlvbnMgb2YgbWV0aG9kc1xuICAgKiBvciB0eXBlLWNoZWNrIGJsb2NrcykgdGhhdCBuZWVkIHRvIGJlIGV2ZW50dWFsbHkgcGVyZm9ybWVkIG9uIHRoYXQgZmlsZS5cbiAgICovXG4gIHByaXZhdGUgb3BNYXAgPSBuZXcgTWFwPHRzLlNvdXJjZUZpbGUsIE9wW10+KCk7XG5cbiAgLyoqXG4gICAqIFRyYWNrcyB3aGVuIGFuIGEgcGFydGljdWxhciBjbGFzcyBoYXMgYSBwZW5kaW5nIHR5cGUgY29uc3RydWN0b3IgcGF0Y2hpbmcgb3BlcmF0aW9uIGFscmVhZHlcbiAgICogcXVldWVkLlxuICAgKi9cbiAgcHJpdmF0ZSB0eXBlQ3RvclBlbmRpbmcgPSBuZXcgU2V0PHRzLkNsYXNzRGVjbGFyYXRpb24+KCk7XG5cbiAgcHJpdmF0ZSBzb3VyY2VNYW5hZ2VyID0gbmV3IFRlbXBsYXRlU291cmNlTWFuYWdlcigpO1xuXG4gIHByaXZhdGUgZG9tU2NoZW1hQ2hlY2tlciA9IG5ldyBSZWdpc3RyeURvbVNjaGVtYUNoZWNrZXIodGhpcy5zb3VyY2VNYW5hZ2VyKTtcblxuICBwcml2YXRlIG9vYlJlY29yZGVyID0gbmV3IE91dE9mQmFuZERpYWdub3N0aWNSZWNvcmRlckltcGwodGhpcy5zb3VyY2VNYW5hZ2VyKTtcblxuICAvKipcbiAgICogUmVjb3JkIGEgdGVtcGxhdGUgZm9yIHRoZSBnaXZlbiBjb21wb25lbnQgYG5vZGVgLCB3aXRoIGEgYFNlbGVjdG9yTWF0Y2hlcmAgZm9yIGRpcmVjdGl2ZVxuICAgKiBtYXRjaGluZy5cbiAgICpcbiAgICogQHBhcmFtIG5vZGUgY2xhc3Mgb2YgdGhlIG5vZGUgYmVpbmcgcmVjb3JkZWQuXG4gICAqIEBwYXJhbSB0ZW1wbGF0ZSBBU1Qgbm9kZXMgb2YgdGhlIHRlbXBsYXRlIGJlaW5nIHJlY29yZGVkLlxuICAgKiBAcGFyYW0gbWF0Y2hlciBgU2VsZWN0b3JNYXRjaGVyYCB3aGljaCB0cmFja3MgZGlyZWN0aXZlcyB0aGF0IGFyZSBpbiBzY29wZSBmb3IgdGhpcyB0ZW1wbGF0ZS5cbiAgICovXG4gIGFkZFRlbXBsYXRlKFxuICAgICAgcmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj4sXG4gICAgICBib3VuZFRhcmdldDogQm91bmRUYXJnZXQ8VHlwZUNoZWNrYWJsZURpcmVjdGl2ZU1ldGE+LFxuICAgICAgcGlwZXM6IE1hcDxzdHJpbmcsIFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+Pj4sXG4gICAgICBzY2hlbWFzOiBTY2hlbWFNZXRhZGF0YVtdLCBzb3VyY2VNYXBwaW5nOiBUZW1wbGF0ZVNvdXJjZU1hcHBpbmcsXG4gICAgICBmaWxlOiBQYXJzZVNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICBjb25zdCBpZCA9IHRoaXMuc291cmNlTWFuYWdlci5jYXB0dXJlU291cmNlKHNvdXJjZU1hcHBpbmcsIGZpbGUpO1xuICAgIC8vIEdldCBhbGwgb2YgdGhlIGRpcmVjdGl2ZXMgdXNlZCBpbiB0aGUgdGVtcGxhdGUgYW5kIHJlY29yZCB0eXBlIGNvbnN0cnVjdG9ycyBmb3IgYWxsIG9mIHRoZW0uXG4gICAgZm9yIChjb25zdCBkaXIgb2YgYm91bmRUYXJnZXQuZ2V0VXNlZERpcmVjdGl2ZXMoKSkge1xuICAgICAgY29uc3QgZGlyUmVmID0gZGlyLnJlZiBhcyBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj47XG4gICAgICBjb25zdCBkaXJOb2RlID0gZGlyUmVmLm5vZGU7XG4gICAgICBpZiAocmVxdWlyZXNJbmxpbmVUeXBlQ3RvcihkaXJOb2RlLCB0aGlzLnJlZmxlY3RvcikpIHtcbiAgICAgICAgLy8gQWRkIGEgdHlwZSBjb25zdHJ1Y3RvciBvcGVyYXRpb24gZm9yIHRoZSBkaXJlY3RpdmUuXG4gICAgICAgIHRoaXMuYWRkSW5saW5lVHlwZUN0b3IoZGlyTm9kZS5nZXRTb3VyY2VGaWxlKCksIGRpclJlZiwge1xuICAgICAgICAgIGZuTmFtZTogJ25nVHlwZUN0b3InLFxuICAgICAgICAgIC8vIFRoZSBjb25zdHJ1Y3RvciBzaG91bGQgaGF2ZSBhIGJvZHkgaWYgdGhlIGRpcmVjdGl2ZSBjb21lcyBmcm9tIGEgLnRzIGZpbGUsIGJ1dCBub3QgaWZcbiAgICAgICAgICAvLyBpdCBjb21lcyBmcm9tIGEgLmQudHMgZmlsZS4gLmQudHMgZGVjbGFyYXRpb25zIGRvbid0IGhhdmUgYm9kaWVzLlxuICAgICAgICAgIGJvZHk6ICFkaXJOb2RlLmdldFNvdXJjZUZpbGUoKS5pc0RlY2xhcmF0aW9uRmlsZSxcbiAgICAgICAgICBmaWVsZHM6IHtcbiAgICAgICAgICAgIGlucHV0czogT2JqZWN0LmtleXMoZGlyLmlucHV0cyksXG4gICAgICAgICAgICBvdXRwdXRzOiBPYmplY3Qua2V5cyhkaXIub3V0cHV0cyksXG4gICAgICAgICAgICAvLyBUT0RPKGFseGh1Yik6IHN1cHBvcnQgcXVlcmllc1xuICAgICAgICAgICAgcXVlcmllczogZGlyLnF1ZXJpZXMsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjb2VyY2VkSW5wdXRGaWVsZHM6IGRpci5jb2VyY2VkSW5wdXRGaWVsZHMsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRjYk1ldGFkYXRhOiBUeXBlQ2hlY2tCbG9ja01ldGFkYXRhID0ge2lkLCBib3VuZFRhcmdldCwgcGlwZXMsIHNjaGVtYXN9O1xuICAgIGlmIChyZXF1aXJlc0lubGluZVR5cGVDaGVja0Jsb2NrKHJlZi5ub2RlKSkge1xuICAgICAgLy8gVGhpcyBjbGFzcyBkaWRuJ3QgbWVldCB0aGUgcmVxdWlyZW1lbnRzIGZvciBleHRlcm5hbCB0eXBlIGNoZWNraW5nLCBzbyBnZW5lcmF0ZSBhbiBpbmxpbmVcbiAgICAgIC8vIFRDQiBmb3IgdGhlIGNsYXNzLlxuICAgICAgdGhpcy5hZGRJbmxpbmVUeXBlQ2hlY2tCbG9jayhyZWYsIHRjYk1ldGFkYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGNsYXNzIGNhbiBiZSB0eXBlLWNoZWNrZWQgZXh0ZXJuYWxseSBhcyBub3JtYWwuXG4gICAgICB0aGlzLnR5cGVDaGVja0ZpbGUuYWRkVHlwZUNoZWNrQmxvY2soXG4gICAgICAgICAgcmVmLCB0Y2JNZXRhZGF0YSwgdGhpcy5kb21TY2hlbWFDaGVja2VyLCB0aGlzLm9vYlJlY29yZGVyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVjb3JkIGEgdHlwZSBjb25zdHJ1Y3RvciBmb3IgdGhlIGdpdmVuIGBub2RlYCB3aXRoIHRoZSBnaXZlbiBgY3Rvck1ldGFkYXRhYC5cbiAgICovXG4gIGFkZElubGluZVR5cGVDdG9yKFxuICAgICAgc2Y6IHRzLlNvdXJjZUZpbGUsIHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+LFxuICAgICAgY3Rvck1ldGE6IFR5cGVDdG9yTWV0YWRhdGEpOiB2b2lkIHtcbiAgICBpZiAodGhpcy50eXBlQ3RvclBlbmRpbmcuaGFzKHJlZi5ub2RlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnR5cGVDdG9yUGVuZGluZy5hZGQocmVmLm5vZGUpO1xuXG4gICAgLy8gTGF6aWx5IGNvbnN0cnVjdCB0aGUgb3BlcmF0aW9uIG1hcC5cbiAgICBpZiAoIXRoaXMub3BNYXAuaGFzKHNmKSkge1xuICAgICAgdGhpcy5vcE1hcC5zZXQoc2YsIFtdKTtcbiAgICB9XG4gICAgY29uc3Qgb3BzID0gdGhpcy5vcE1hcC5nZXQoc2YpICE7XG5cbiAgICAvLyBQdXNoIGEgYFR5cGVDdG9yT3BgIGludG8gdGhlIG9wZXJhdGlvbiBxdWV1ZSBmb3IgdGhlIHNvdXJjZSBmaWxlLlxuICAgIG9wcy5wdXNoKG5ldyBUeXBlQ3Rvck9wKHJlZiwgY3Rvck1ldGEpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm0gYSBgdHMuU291cmNlRmlsZWAgaW50byBhIHZlcnNpb24gdGhhdCBpbmNsdWRlcyB0eXBlIGNoZWNraW5nIGNvZGUuXG4gICAqXG4gICAqIElmIHRoaXMgcGFydGljdWxhciBzb3VyY2UgZmlsZSBoYXMgbm8gZGlyZWN0aXZlcyB0aGF0IHJlcXVpcmUgdHlwZSBjb25zdHJ1Y3RvcnMsIG9yIGNvbXBvbmVudHNcbiAgICogdGhhdCByZXF1aXJlIHR5cGUgY2hlY2sgYmxvY2tzLCB0aGVuIGl0IHdpbGwgYmUgcmV0dXJuZWQgZGlyZWN0bHkuIE90aGVyd2lzZSwgYSBuZXdcbiAgICogYHRzLlNvdXJjZUZpbGVgIGlzIHBhcnNlZCBmcm9tIG1vZGlmaWVkIHRleHQgb2YgdGhlIG9yaWdpbmFsLiBUaGlzIGlzIG5lY2Vzc2FyeSB0byBlbnN1cmUgdGhlXG4gICAqIGFkZGVkIGNvZGUgaGFzIGNvcnJlY3QgcG9zaXRpb25hbCBpbmZvcm1hdGlvbiBhc3NvY2lhdGVkIHdpdGggaXQuXG4gICAqL1xuICB0cmFuc2Zvcm0oc2Y6IHRzLlNvdXJjZUZpbGUpOiB0cy5Tb3VyY2VGaWxlIHtcbiAgICAvLyBJZiB0aGVyZSBhcmUgbm8gb3BlcmF0aW9ucyBwZW5kaW5nIGZvciB0aGlzIHBhcnRpY3VsYXIgZmlsZSwgcmV0dXJuIGl0IGRpcmVjdGx5LlxuICAgIGlmICghdGhpcy5vcE1hcC5oYXMoc2YpKSB7XG4gICAgICByZXR1cm4gc2Y7XG4gICAgfVxuXG4gICAgLy8gSW1wb3J0cyBtYXkgbmVlZCB0byBiZSBhZGRlZCB0byB0aGUgZmlsZSB0byBzdXBwb3J0IHR5cGUtY2hlY2tpbmcgb2YgZGlyZWN0aXZlcyB1c2VkIGluIHRoZVxuICAgIC8vIHRlbXBsYXRlIHdpdGhpbiBpdC5cbiAgICBjb25zdCBpbXBvcnRNYW5hZ2VyID0gbmV3IEltcG9ydE1hbmFnZXIobmV3IE5vb3BJbXBvcnRSZXdyaXRlcigpLCAnX2knKTtcblxuICAgIC8vIEVhY2ggT3AgaGFzIGEgc3BsaXRQb2ludCBpbmRleCBpbnRvIHRoZSB0ZXh0IHdoZXJlIGl0IG5lZWRzIHRvIGJlIGluc2VydGVkLiBTcGxpdCB0aGVcbiAgICAvLyBvcmlnaW5hbCBzb3VyY2UgdGV4dCBpbnRvIGNodW5rcyBhdCB0aGVzZSBzcGxpdCBwb2ludHMsIHdoZXJlIGNvZGUgd2lsbCBiZSBpbnNlcnRlZCBiZXR3ZWVuXG4gICAgLy8gdGhlIGNodW5rcy5cbiAgICBjb25zdCBvcHMgPSB0aGlzLm9wTWFwLmdldChzZikgIS5zb3J0KG9yZGVyT3BzKTtcbiAgICBjb25zdCB0ZXh0UGFydHMgPSBzcGxpdFN0cmluZ0F0UG9pbnRzKHNmLnRleHQsIG9wcy5tYXAob3AgPT4gb3Auc3BsaXRQb2ludCkpO1xuXG4gICAgLy8gVXNlIGEgYHRzLlByaW50ZXJgIHRvIGdlbmVyYXRlIHNvdXJjZSBjb2RlLlxuICAgIGNvbnN0IHByaW50ZXIgPSB0cy5jcmVhdGVQcmludGVyKHtvbWl0VHJhaWxpbmdTZW1pY29sb246IHRydWV9KTtcblxuICAgIC8vIEJlZ2luIHdpdGggdGhlIGludGlhbCBzZWN0aW9uIG9mIHRoZSBjb2RlIHRleHQuXG4gICAgbGV0IGNvZGUgPSB0ZXh0UGFydHNbMF07XG5cbiAgICAvLyBQcm9jZXNzIGVhY2ggb3BlcmF0aW9uIGFuZCB1c2UgdGhlIHByaW50ZXIgdG8gZ2VuZXJhdGUgc291cmNlIGNvZGUgZm9yIGl0LCBpbnNlcnRpbmcgaXQgaW50b1xuICAgIC8vIHRoZSBzb3VyY2UgY29kZSBpbiBiZXR3ZWVuIHRoZSBvcmlnaW5hbCBjaHVua3MuXG4gICAgb3BzLmZvckVhY2goKG9wLCBpZHgpID0+IHtcbiAgICAgIGNvbnN0IHRleHQgPSBvcC5leGVjdXRlKGltcG9ydE1hbmFnZXIsIHNmLCB0aGlzLnJlZkVtaXR0ZXIsIHByaW50ZXIpO1xuICAgICAgY29kZSArPSAnXFxuXFxuJyArIHRleHQgKyB0ZXh0UGFydHNbaWR4ICsgMV07XG4gICAgfSk7XG5cbiAgICAvLyBXcml0ZSBvdXQgdGhlIGltcG9ydHMgdGhhdCBuZWVkIHRvIGJlIGFkZGVkIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpbGUuXG4gICAgbGV0IGltcG9ydHMgPSBpbXBvcnRNYW5hZ2VyLmdldEFsbEltcG9ydHMoc2YuZmlsZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgLm1hcChpID0+IGBpbXBvcnQgKiBhcyAke2kucXVhbGlmaWVyfSBmcm9tICcke2kuc3BlY2lmaWVyfSc7YClcbiAgICAgICAgICAgICAgICAgICAgICAuam9pbignXFxuJyk7XG4gICAgY29kZSA9IGltcG9ydHMgKyAnXFxuJyArIGNvZGU7XG5cbiAgICAvLyBQYXJzZSB0aGUgbmV3IHNvdXJjZSBmaWxlIGFuZCByZXR1cm4gaXQuXG4gICAgcmV0dXJuIHRzLmNyZWF0ZVNvdXJjZUZpbGUoc2YuZmlsZU5hbWUsIGNvZGUsIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsIHRydWUsIHRzLlNjcmlwdEtpbmQuVFMpO1xuICB9XG5cbiAgY2FsY3VsYXRlVGVtcGxhdGVEaWFnbm9zdGljcyhcbiAgICAgIG9yaWdpbmFsUHJvZ3JhbTogdHMuUHJvZ3JhbSwgb3JpZ2luYWxIb3N0OiB0cy5Db21waWxlckhvc3QsXG4gICAgICBvcmlnaW5hbE9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucyk6IHtcbiAgICBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdLFxuICAgIHByb2dyYW06IHRzLlByb2dyYW0sXG4gIH0ge1xuICAgIGNvbnN0IHR5cGVDaGVja1NmID0gdGhpcy50eXBlQ2hlY2tGaWxlLnJlbmRlcigpO1xuICAgIC8vIEZpcnN0LCBidWlsZCB0aGUgbWFwIG9mIG9yaWdpbmFsIHNvdXJjZSBmaWxlcy5cbiAgICBjb25zdCBzZk1hcCA9IG5ldyBNYXA8c3RyaW5nLCB0cy5Tb3VyY2VGaWxlPigpO1xuICAgIGNvbnN0IGludGVyZXN0aW5nRmlsZXM6IHRzLlNvdXJjZUZpbGVbXSA9IFt0eXBlQ2hlY2tTZl07XG4gICAgZm9yIChjb25zdCBvcmlnaW5hbFNmIG9mIG9yaWdpbmFsUHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpKSB7XG4gICAgICBjb25zdCBzZiA9IHRoaXMudHJhbnNmb3JtKG9yaWdpbmFsU2YpO1xuICAgICAgc2ZNYXAuc2V0KHNmLmZpbGVOYW1lLCBzZik7XG4gICAgICBpZiAoIXNmLmlzRGVjbGFyYXRpb25GaWxlICYmIHRoaXMub3BNYXAuaGFzKG9yaWdpbmFsU2YpKSB7XG4gICAgICAgIGludGVyZXN0aW5nRmlsZXMucHVzaChzZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2ZNYXAuc2V0KHR5cGVDaGVja1NmLmZpbGVOYW1lLCB0eXBlQ2hlY2tTZik7XG5cbiAgICBjb25zdCB0eXBlQ2hlY2tQcm9ncmFtID0gdHMuY3JlYXRlUHJvZ3JhbSh7XG4gICAgICBob3N0OiBuZXcgVHlwZUNoZWNrUHJvZ3JhbUhvc3Qoc2ZNYXAsIG9yaWdpbmFsSG9zdCksXG4gICAgICBvcHRpb25zOiBvcmlnaW5hbE9wdGlvbnMsXG4gICAgICBvbGRQcm9ncmFtOiBvcmlnaW5hbFByb2dyYW0sXG4gICAgICByb290TmFtZXM6IG9yaWdpbmFsUHJvZ3JhbS5nZXRSb290RmlsZU5hbWVzKCksXG4gICAgfSk7XG5cbiAgICBjb25zdCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdID0gW107XG4gICAgY29uc3QgY29sbGVjdERpYWdub3N0aWNzID0gKGRpYWdzOiByZWFkb25seSB0cy5EaWFnbm9zdGljW10pOiB2b2lkID0+IHtcbiAgICAgIGZvciAoY29uc3QgZGlhZ25vc3RpYyBvZiBkaWFncykge1xuICAgICAgICBpZiAoc2hvdWxkUmVwb3J0RGlhZ25vc3RpYyhkaWFnbm9zdGljKSkge1xuICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZWQgPSB0cmFuc2xhdGVEaWFnbm9zdGljKGRpYWdub3N0aWMsIHRoaXMuc291cmNlTWFuYWdlcik7XG5cbiAgICAgICAgICBpZiAodHJhbnNsYXRlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgZGlhZ25vc3RpY3MucHVzaCh0cmFuc2xhdGVkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCBzZiBvZiBpbnRlcmVzdGluZ0ZpbGVzKSB7XG4gICAgICBjb2xsZWN0RGlhZ25vc3RpY3ModHlwZUNoZWNrUHJvZ3JhbS5nZXRTZW1hbnRpY0RpYWdub3N0aWNzKHNmKSk7XG4gICAgfVxuXG4gICAgZGlhZ25vc3RpY3MucHVzaCguLi50aGlzLmRvbVNjaGVtYUNoZWNrZXIuZGlhZ25vc3RpY3MpO1xuICAgIGRpYWdub3N0aWNzLnB1c2goLi4udGhpcy5vb2JSZWNvcmRlci5kaWFnbm9zdGljcyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZGlhZ25vc3RpY3MsXG4gICAgICBwcm9ncmFtOiB0eXBlQ2hlY2tQcm9ncmFtLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGFkZElubGluZVR5cGVDaGVja0Jsb2NrKFxuICAgICAgcmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj4sXG4gICAgICB0Y2JNZXRhOiBUeXBlQ2hlY2tCbG9ja01ldGFkYXRhKTogdm9pZCB7XG4gICAgY29uc3Qgc2YgPSByZWYubm9kZS5nZXRTb3VyY2VGaWxlKCk7XG4gICAgaWYgKCF0aGlzLm9wTWFwLmhhcyhzZikpIHtcbiAgICAgIHRoaXMub3BNYXAuc2V0KHNmLCBbXSk7XG4gICAgfVxuICAgIGNvbnN0IG9wcyA9IHRoaXMub3BNYXAuZ2V0KHNmKSAhO1xuICAgIG9wcy5wdXNoKG5ldyBUY2JPcChcbiAgICAgICAgcmVmLCB0Y2JNZXRhLCB0aGlzLmNvbmZpZywgdGhpcy5yZWZsZWN0b3IsIHRoaXMuZG9tU2NoZW1hQ2hlY2tlciwgdGhpcy5vb2JSZWNvcmRlcikpO1xuICB9XG59XG5cbi8qKlxuICogQSBjb2RlIGdlbmVyYXRpb24gb3BlcmF0aW9uIHRoYXQgbmVlZHMgdG8gaGFwcGVuIHdpdGhpbiBhIGdpdmVuIHNvdXJjZSBmaWxlLlxuICovXG5pbnRlcmZhY2UgT3Age1xuICAvKipcbiAgICogVGhlIG5vZGUgaW4gdGhlIGZpbGUgd2hpY2ggd2lsbCBoYXZlIGNvZGUgZ2VuZXJhdGVkIGZvciBpdC5cbiAgICovXG4gIHJlYWRvbmx5IHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+O1xuXG4gIC8qKlxuICAgKiBJbmRleCBpbnRvIHRoZSBzb3VyY2UgdGV4dCB3aGVyZSB0aGUgY29kZSBnZW5lcmF0ZWQgYnkgdGhlIG9wZXJhdGlvbiBzaG91bGQgYmUgaW5zZXJ0ZWQuXG4gICAqL1xuICByZWFkb25seSBzcGxpdFBvaW50OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGUgdGhlIG9wZXJhdGlvbiBhbmQgcmV0dXJuIHRoZSBnZW5lcmF0ZWQgY29kZSBhcyB0ZXh0LlxuICAgKi9cbiAgZXhlY3V0ZShpbTogSW1wb3J0TWFuYWdlciwgc2Y6IHRzLlNvdXJjZUZpbGUsIHJlZkVtaXR0ZXI6IFJlZmVyZW5jZUVtaXR0ZXIsIHByaW50ZXI6IHRzLlByaW50ZXIpOlxuICAgICAgc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgdHlwZSBjaGVjayBibG9jayBvcGVyYXRpb24gd2hpY2ggcHJvZHVjZXMgdHlwZSBjaGVjayBjb2RlIGZvciBhIHBhcnRpY3VsYXIgY29tcG9uZW50LlxuICovXG5jbGFzcyBUY2JPcCBpbXBsZW1lbnRzIE9wIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSByZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+PixcbiAgICAgIHJlYWRvbmx5IG1ldGE6IFR5cGVDaGVja0Jsb2NrTWV0YWRhdGEsIHJlYWRvbmx5IGNvbmZpZzogVHlwZUNoZWNraW5nQ29uZmlnLFxuICAgICAgcmVhZG9ubHkgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCwgcmVhZG9ubHkgZG9tU2NoZW1hQ2hlY2tlcjogRG9tU2NoZW1hQ2hlY2tlcixcbiAgICAgIHJlYWRvbmx5IG9vYlJlY29yZGVyOiBPdXRPZkJhbmREaWFnbm9zdGljUmVjb3JkZXIpIHt9XG5cbiAgLyoqXG4gICAqIFR5cGUgY2hlY2sgYmxvY2tzIGFyZSBpbnNlcnRlZCBpbW1lZGlhdGVseSBhZnRlciB0aGUgZW5kIG9mIHRoZSBjb21wb25lbnQgY2xhc3MuXG4gICAqL1xuICBnZXQgc3BsaXRQb2ludCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5yZWYubm9kZS5lbmQgKyAxOyB9XG5cbiAgZXhlY3V0ZShpbTogSW1wb3J0TWFuYWdlciwgc2Y6IHRzLlNvdXJjZUZpbGUsIHJlZkVtaXR0ZXI6IFJlZmVyZW5jZUVtaXR0ZXIsIHByaW50ZXI6IHRzLlByaW50ZXIpOlxuICAgICAgc3RyaW5nIHtcbiAgICBjb25zdCBlbnYgPSBuZXcgRW52aXJvbm1lbnQodGhpcy5jb25maWcsIGltLCByZWZFbWl0dGVyLCB0aGlzLnJlZmxlY3Rvciwgc2YpO1xuICAgIGNvbnN0IGZuTmFtZSA9IHRzLmNyZWF0ZUlkZW50aWZpZXIoYF90Y2JfJHt0aGlzLnJlZi5ub2RlLnBvc31gKTtcbiAgICBjb25zdCBmbiA9IGdlbmVyYXRlVHlwZUNoZWNrQmxvY2soXG4gICAgICAgIGVudiwgdGhpcy5yZWYsIGZuTmFtZSwgdGhpcy5tZXRhLCB0aGlzLmRvbVNjaGVtYUNoZWNrZXIsIHRoaXMub29iUmVjb3JkZXIpO1xuICAgIHJldHVybiBwcmludGVyLnByaW50Tm9kZSh0cy5FbWl0SGludC5VbnNwZWNpZmllZCwgZm4sIHNmKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgdHlwZSBjb25zdHJ1Y3RvciBvcGVyYXRpb24gd2hpY2ggcHJvZHVjZXMgdHlwZSBjb25zdHJ1Y3RvciBjb2RlIGZvciBhIHBhcnRpY3VsYXIgZGlyZWN0aXZlLlxuICovXG5jbGFzcyBUeXBlQ3Rvck9wIGltcGxlbWVudHMgT3Age1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+LFxuICAgICAgcmVhZG9ubHkgbWV0YTogVHlwZUN0b3JNZXRhZGF0YSkge31cblxuICAvKipcbiAgICogVHlwZSBjb25zdHJ1Y3RvciBvcGVyYXRpb25zIGFyZSBpbnNlcnRlZCBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGVuZCBvZiB0aGUgZGlyZWN0aXZlIGNsYXNzLlxuICAgKi9cbiAgZ2V0IHNwbGl0UG9pbnQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMucmVmLm5vZGUuZW5kIC0gMTsgfVxuXG4gIGV4ZWN1dGUoaW06IEltcG9ydE1hbmFnZXIsIHNmOiB0cy5Tb3VyY2VGaWxlLCByZWZFbWl0dGVyOiBSZWZlcmVuY2VFbWl0dGVyLCBwcmludGVyOiB0cy5QcmludGVyKTpcbiAgICAgIHN0cmluZyB7XG4gICAgY29uc3QgdGNiID0gZ2VuZXJhdGVJbmxpbmVUeXBlQ3Rvcih0aGlzLnJlZi5ub2RlLCB0aGlzLm1ldGEpO1xuICAgIHJldHVybiBwcmludGVyLnByaW50Tm9kZSh0cy5FbWl0SGludC5VbnNwZWNpZmllZCwgdGNiLCBzZik7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21wYXJlIHR3byBvcGVyYXRpb25zIGFuZCByZXR1cm4gdGhlaXIgc3BsaXQgcG9pbnQgb3JkZXJpbmcuXG4gKi9cbmZ1bmN0aW9uIG9yZGVyT3BzKG9wMTogT3AsIG9wMjogT3ApOiBudW1iZXIge1xuICByZXR1cm4gb3AxLnNwbGl0UG9pbnQgLSBvcDIuc3BsaXRQb2ludDtcbn1cblxuLyoqXG4gKiBTcGxpdCBhIHN0cmluZyBpbnRvIGNodW5rcyBhdCBhbnkgbnVtYmVyIG9mIHNwbGl0IHBvaW50cy5cbiAqL1xuZnVuY3Rpb24gc3BsaXRTdHJpbmdBdFBvaW50cyhzdHI6IHN0cmluZywgcG9pbnRzOiBudW1iZXJbXSk6IHN0cmluZ1tdIHtcbiAgY29uc3Qgc3BsaXRzOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgc3RhcnQgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHBvaW50ID0gcG9pbnRzW2ldO1xuICAgIHNwbGl0cy5wdXNoKHN0ci5zdWJzdHJpbmcoc3RhcnQsIHBvaW50KSk7XG4gICAgc3RhcnQgPSBwb2ludDtcbiAgfVxuICBzcGxpdHMucHVzaChzdHIuc3Vic3RyaW5nKHN0YXJ0KSk7XG4gIHJldHVybiBzcGxpdHM7XG59XG4iXX0=