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
        define("@angular/language-service/src/typescript_host", ["require", "exports", "tslib", "@angular/compiler", "@angular/core", "typescript/lib/tsserverlibrary", "@angular/language-service/src/language_service", "@angular/language-service/src/reflector_host", "@angular/language-service/src/template", "@angular/language-service/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var core_1 = require("@angular/core");
    var tss = require("typescript/lib/tsserverlibrary");
    var language_service_1 = require("@angular/language-service/src/language_service");
    var reflector_host_1 = require("@angular/language-service/src/reflector_host");
    var template_1 = require("@angular/language-service/src/template");
    var utils_1 = require("@angular/language-service/src/utils");
    /**
     * Create a `LanguageServiceHost`
     */
    function createLanguageServiceFromTypescript(host, service) {
        var ngHost = new TypeScriptServiceHost(host, service);
        var ngServer = language_service_1.createLanguageService(ngHost);
        return ngServer;
    }
    exports.createLanguageServiceFromTypescript = createLanguageServiceFromTypescript;
    /**
     * The language service never needs the normalized versions of the metadata. To avoid parsing
     * the content and resolving references, return an empty file. This also allows normalizing
     * template that are syntatically incorrect which is required to provide completions in
     * syntactically incorrect templates.
     */
    var DummyHtmlParser = /** @class */ (function (_super) {
        tslib_1.__extends(DummyHtmlParser, _super);
        function DummyHtmlParser() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DummyHtmlParser.prototype.parse = function () { return new compiler_1.ParseTreeResult([], []); };
        return DummyHtmlParser;
    }(compiler_1.HtmlParser));
    exports.DummyHtmlParser = DummyHtmlParser;
    /**
     * Avoid loading resources in the language servcie by using a dummy loader.
     */
    var DummyResourceLoader = /** @class */ (function (_super) {
        tslib_1.__extends(DummyResourceLoader, _super);
        function DummyResourceLoader() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DummyResourceLoader.prototype.get = function (url) { return Promise.resolve(''); };
        return DummyResourceLoader;
    }(compiler_1.ResourceLoader));
    exports.DummyResourceLoader = DummyResourceLoader;
    /**
     * An implementation of a `LanguageServiceHost` for a TypeScript project.
     *
     * The `TypeScriptServiceHost` implements the Angular `LanguageServiceHost` using
     * the TypeScript language services.
     *
     * @publicApi
     */
    var TypeScriptServiceHost = /** @class */ (function () {
        function TypeScriptServiceHost(tsLsHost, tsLS) {
            var _this = this;
            this.tsLsHost = tsLsHost;
            this.tsLS = tsLS;
            this.staticSymbolCache = new compiler_1.StaticSymbolCache();
            this.fileToComponent = new Map();
            this.collectedErrors = new Map();
            this.fileVersions = new Map();
            this.lastProgram = undefined;
            this.analyzedModules = {
                files: [],
                ngModuleByPipeOrDirective: new Map(),
                ngModules: [],
            };
            this.summaryResolver = new compiler_1.AotSummaryResolver({
                loadSummary: function (filePath) { return null; },
                isSourceFile: function (sourceFilePath) { return true; },
                toSummaryFileName: function (sourceFilePath) { return sourceFilePath; },
                fromSummaryFileName: function (filePath) { return filePath; },
            }, this.staticSymbolCache);
            this.reflectorHost = new reflector_host_1.ReflectorHost(function () { return _this.program; }, tsLsHost);
            this.staticSymbolResolver = new compiler_1.StaticSymbolResolver(this.reflectorHost, this.staticSymbolCache, this.summaryResolver, function (e, filePath) { return _this.collectError(e, filePath); });
        }
        Object.defineProperty(TypeScriptServiceHost.prototype, "resolver", {
            /**
             * Return the singleton instance of the MetadataResolver.
             */
            get: function () {
                var _this = this;
                if (this._resolver) {
                    return this._resolver;
                }
                // StaticReflector keeps its own private caches that are not clearable.
                // We have no choice but to create a new instance to invalidate the caches.
                // TODO: Revisit this when language service gets rewritten for Ivy.
                var staticReflector = new compiler_1.StaticReflector(this.summaryResolver, this.staticSymbolResolver, [], // knownMetadataClasses
                [], // knownMetadataFunctions
                function (e, filePath) { return _this.collectError(e, filePath); });
                // Because static reflector above is changed, we need to create a new
                // resolver.
                var moduleResolver = new compiler_1.NgModuleResolver(staticReflector);
                var directiveResolver = new compiler_1.DirectiveResolver(staticReflector);
                var pipeResolver = new compiler_1.PipeResolver(staticReflector);
                var elementSchemaRegistry = new compiler_1.DomElementSchemaRegistry();
                var resourceLoader = new DummyResourceLoader();
                var urlResolver = compiler_1.createOfflineCompileUrlResolver();
                var htmlParser = new DummyHtmlParser();
                // This tracks the CompileConfig in codegen.ts. Currently these options
                // are hard-coded.
                var config = new compiler_1.CompilerConfig({
                    defaultEncapsulation: core_1.ViewEncapsulation.Emulated,
                    useJit: false,
                });
                var directiveNormalizer = new compiler_1.DirectiveNormalizer(resourceLoader, urlResolver, htmlParser, config);
                this._resolver = new compiler_1.CompileMetadataResolver(config, htmlParser, moduleResolver, directiveResolver, pipeResolver, new compiler_1.JitSummaryResolver(), elementSchemaRegistry, directiveNormalizer, new core_1.ɵConsole(), this.staticSymbolCache, staticReflector, function (error, type) { return _this.collectError(error, type && type.filePath); });
                return this._resolver;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeScriptServiceHost.prototype, "reflector", {
            /**
             * Return the singleton instance of the StaticReflector hosted in the
             * MetadataResolver.
             */
            get: function () {
                return this.resolver.getReflector();
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Checks whether the program has changed and returns all analyzed modules.
         * If program has changed, invalidate all caches and update fileToComponent
         * and templateReferences.
         * In addition to returning information about NgModules, this method plays the
         * same role as 'synchronizeHostData' in tsserver.
         */
        TypeScriptServiceHost.prototype.getAnalyzedModules = function () {
            var e_1, _a, e_2, _b;
            if (this.upToDate()) {
                return this.analyzedModules;
            }
            // Invalidate caches
            this.fileToComponent.clear();
            this.collectedErrors.clear();
            this.resolver.clearCache();
            var analyzeHost = { isSourceFile: function (filePath) { return true; } };
            var programFiles = this.program.getSourceFiles().map(function (sf) { return sf.fileName; });
            this.analyzedModules =
                compiler_1.analyzeNgModules(programFiles, analyzeHost, this.staticSymbolResolver, this.resolver);
            // update template references and fileToComponent
            var urlResolver = compiler_1.createOfflineCompileUrlResolver();
            try {
                for (var _c = tslib_1.__values(this.analyzedModules.ngModules), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var ngModule = _d.value;
                    try {
                        for (var _e = (e_2 = void 0, tslib_1.__values(ngModule.declaredDirectives)), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var directive = _f.value;
                            var metadata = this.resolver.getNonNormalizedDirectiveMetadata(directive.reference).metadata;
                            if (metadata.isComponent && metadata.template && metadata.template.templateUrl) {
                                var templateName = urlResolver.resolve(this.reflector.componentModuleUrl(directive.reference), metadata.template.templateUrl);
                                this.fileToComponent.set(templateName, directive.reference);
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return this.analyzedModules;
        };
        /**
         * Checks whether the program has changed, and invalidate static symbols in
         * the source files that have changed.
         * Returns true if modules are up-to-date, false otherwise.
         * This should only be called by getAnalyzedModules().
         */
        TypeScriptServiceHost.prototype.upToDate = function () {
            var e_3, _a, e_4, _b, e_5, _c;
            var _d = this, lastProgram = _d.lastProgram, program = _d.program;
            if (lastProgram === program) {
                return true;
            }
            this.lastProgram = program;
            // Even though the program has changed, it could be the case that none of
            // the source files have changed. If all source files remain the same, then
            // program is still up-to-date, and we should not invalidate caches.
            var filesAdded = 0;
            var filesChangedOrRemoved = [];
            // Check if any source files have been added / changed since last computation.
            var seen = new Set();
            try {
                for (var _e = tslib_1.__values(program.getSourceFiles()), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var fileName = _f.value.fileName;
                    seen.add(fileName);
                    var version = this.tsLsHost.getScriptVersion(fileName);
                    var lastVersion = this.fileVersions.get(fileName);
                    if (lastVersion === undefined) {
                        filesAdded++;
                        this.fileVersions.set(fileName, version);
                    }
                    else if (version !== lastVersion) {
                        filesChangedOrRemoved.push(fileName); // changed
                        this.fileVersions.set(fileName, version);
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                }
                finally { if (e_3) throw e_3.error; }
            }
            try {
                // Check if any source files have been removed since last computation.
                for (var _g = tslib_1.__values(this.fileVersions), _h = _g.next(); !_h.done; _h = _g.next()) {
                    var _j = tslib_1.__read(_h.value, 1), fileName = _j[0];
                    if (!seen.has(fileName)) {
                        filesChangedOrRemoved.push(fileName); // removed
                        // Because Maps are iterated in insertion order, it is safe to delete
                        // entries from the same map while iterating.
                        // See https://stackoverflow.com/questions/35940216 and
                        // https://www.ecma-international.org/ecma-262/10.0/index.html#sec-map.prototype.foreach
                        this.fileVersions.delete(fileName);
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                }
                finally { if (e_4) throw e_4.error; }
            }
            try {
                for (var filesChangedOrRemoved_1 = tslib_1.__values(filesChangedOrRemoved), filesChangedOrRemoved_1_1 = filesChangedOrRemoved_1.next(); !filesChangedOrRemoved_1_1.done; filesChangedOrRemoved_1_1 = filesChangedOrRemoved_1.next()) {
                    var fileName = filesChangedOrRemoved_1_1.value;
                    var symbols = this.staticSymbolResolver.invalidateFile(fileName);
                    this.reflector.invalidateSymbols(symbols);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (filesChangedOrRemoved_1_1 && !filesChangedOrRemoved_1_1.done && (_c = filesChangedOrRemoved_1.return)) _c.call(filesChangedOrRemoved_1);
                }
                finally { if (e_5) throw e_5.error; }
            }
            // Program is up-to-date iff no files are added, changed, or removed.
            return filesAdded === 0 && filesChangedOrRemoved.length === 0;
        };
        /**
         * Find all templates in the specified `file`.
         * @param fileName TS or HTML file
         */
        TypeScriptServiceHost.prototype.getTemplates = function (fileName) {
            var _this = this;
            var results = [];
            if (fileName.endsWith('.ts')) {
                // Find every template string in the file
                var visit_1 = function (child) {
                    var template = _this.getInternalTemplate(child);
                    if (template) {
                        results.push(template);
                    }
                    else {
                        tss.forEachChild(child, visit_1);
                    }
                };
                var sourceFile = this.getSourceFile(fileName);
                if (sourceFile) {
                    tss.forEachChild(sourceFile, visit_1);
                }
            }
            else {
                var template = this.getExternalTemplate(fileName);
                if (template) {
                    results.push(template);
                }
            }
            return results;
        };
        /**
         * Return metadata about all class declarations in the file that are Angular
         * directives. Potential matches are `@NgModule`, `@Component`, `@Directive`,
         * `@Pipes`, etc. class declarations.
         *
         * @param fileName TS file
         */
        TypeScriptServiceHost.prototype.getDeclarations = function (fileName) {
            var _this = this;
            if (!fileName.endsWith('.ts')) {
                return [];
            }
            var sourceFile = this.getSourceFile(fileName);
            if (!sourceFile) {
                return [];
            }
            var results = [];
            var visit = function (child) {
                var candidate = utils_1.getDirectiveClassLike(child);
                if (candidate) {
                    var classId = candidate.classId;
                    var declarationSpan = spanOf(classId);
                    var className = classId.getText();
                    var classSymbol = _this.reflector.getStaticSymbol(sourceFile.fileName, className);
                    // Ask the resolver to check if candidate is actually Angular directive
                    if (!_this.resolver.isDirective(classSymbol)) {
                        return;
                    }
                    var data = _this.resolver.getNonNormalizedDirectiveMetadata(classSymbol);
                    if (!data) {
                        return;
                    }
                    results.push({
                        type: classSymbol,
                        declarationSpan: declarationSpan,
                        metadata: data.metadata,
                        errors: _this.getCollectedErrors(declarationSpan, sourceFile),
                    });
                }
                else {
                    child.forEachChild(visit);
                }
            };
            tss.forEachChild(sourceFile, visit);
            return results;
        };
        TypeScriptServiceHost.prototype.getSourceFile = function (fileName) {
            if (!fileName.endsWith('.ts')) {
                throw new Error("Non-TS source file requested: " + fileName);
            }
            return this.program.getSourceFile(fileName);
        };
        Object.defineProperty(TypeScriptServiceHost.prototype, "program", {
            get: function () {
                var program = this.tsLS.getProgram();
                if (!program) {
                    // Program is very very unlikely to be undefined.
                    throw new Error('No program in language service!');
                }
                return program;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Return the TemplateSource if `node` is a template node.
         *
         * For example,
         *
         * @Component({
         *   template: '<div></div>' <-- template node
         * })
         * class AppComponent {}
         *           ^---- class declaration node
         *
         * @param node Potential template node
         */
        TypeScriptServiceHost.prototype.getInternalTemplate = function (node) {
            if (!tss.isStringLiteralLike(node)) {
                return;
            }
            var tmplAsgn = template_1.getPropertyAssignmentFromValue(node);
            if (!tmplAsgn || tmplAsgn.name.getText() !== 'template') {
                return;
            }
            var classDecl = template_1.getClassDeclFromDecoratorProp(tmplAsgn);
            if (!classDecl || !classDecl.name) { // Does not handle anonymous class
                return;
            }
            var fileName = node.getSourceFile().fileName;
            var classSymbol = this.reflector.getStaticSymbol(fileName, classDecl.name.text);
            return new template_1.InlineTemplate(node, classDecl, classSymbol, this);
        };
        /**
         * Return the external template for `fileName`.
         * @param fileName HTML file
         */
        TypeScriptServiceHost.prototype.getExternalTemplate = function (fileName) {
            // First get the text for the template
            var snapshot = this.tsLsHost.getScriptSnapshot(fileName);
            if (!snapshot) {
                return;
            }
            var source = snapshot.getText(0, snapshot.getLength());
            // Next find the component class symbol
            var classSymbol = this.fileToComponent.get(fileName);
            if (!classSymbol) {
                return;
            }
            // Then use the class symbol to find the actual ts.ClassDeclaration node
            var sourceFile = this.getSourceFile(classSymbol.filePath);
            if (!sourceFile) {
                return;
            }
            // TODO: This only considers top-level class declarations in a source file.
            // This would not find a class declaration in a namespace, for example.
            var classDecl = sourceFile.forEachChild(function (child) {
                if (tss.isClassDeclaration(child) && child.name && child.name.text === classSymbol.name) {
                    return child;
                }
            });
            if (!classDecl) {
                return;
            }
            return new template_1.ExternalTemplate(source, fileName, classDecl, classSymbol, this);
        };
        TypeScriptServiceHost.prototype.collectError = function (error, filePath) {
            if (filePath) {
                var errors = this.collectedErrors.get(filePath);
                if (!errors) {
                    errors = [];
                    this.collectedErrors.set(filePath, errors);
                }
                errors.push(error);
            }
        };
        TypeScriptServiceHost.prototype.getCollectedErrors = function (defaultSpan, sourceFile) {
            var errors = this.collectedErrors.get(sourceFile.fileName);
            if (!errors) {
                return [];
            }
            // TODO: Add better typings for the errors
            return errors.map(function (e) {
                var line = e.line || (e.position && e.position.line);
                var column = e.column || (e.position && e.position.column);
                var span = spanAt(sourceFile, line, column) || defaultSpan;
                if (compiler_1.isFormattedError(e)) {
                    return errorToDiagnosticWithChain(e, span);
                }
                return { message: e.message, span: span };
            });
        };
        /**
         * Return the parsed template for the template at the specified `position`.
         * @param fileName TS or HTML file
         * @param position Position of the template in the TS file, otherwise ignored.
         */
        TypeScriptServiceHost.prototype.getTemplateAstAtPosition = function (fileName, position) {
            var template;
            if (fileName.endsWith('.ts')) {
                var sourceFile = this.getSourceFile(fileName);
                if (!sourceFile) {
                    return;
                }
                // Find the node that most closely matches the position
                var node = utils_1.findTightestNode(sourceFile, position);
                if (!node) {
                    return;
                }
                template = this.getInternalTemplate(node);
            }
            else {
                template = this.getExternalTemplate(fileName);
            }
            if (!template) {
                return;
            }
            return this.getTemplateAst(template);
        };
        /**
         * Find the NgModule which the directive associated with the `classSymbol`
         * belongs to, then return its schema and transitive directives and pipes.
         * @param classSymbol Angular Symbol that defines a directive
         */
        TypeScriptServiceHost.prototype.getModuleMetadataForDirective = function (classSymbol) {
            var e_6, _a, e_7, _b, _c;
            var result = {
                directives: [],
                pipes: [],
                schemas: [],
            };
            // First find which NgModule the directive belongs to.
            var ngModule = this.analyzedModules.ngModuleByPipeOrDirective.get(classSymbol) ||
                findSuitableDefaultModule(this.analyzedModules);
            if (!ngModule) {
                return result;
            }
            // Then gather all transitive directives and pipes.
            var _d = ngModule.transitiveModule, directives = _d.directives, pipes = _d.pipes;
            try {
                for (var directives_1 = tslib_1.__values(directives), directives_1_1 = directives_1.next(); !directives_1_1.done; directives_1_1 = directives_1.next()) {
                    var directive = directives_1_1.value;
                    var data = this.resolver.getNonNormalizedDirectiveMetadata(directive.reference);
                    if (data) {
                        result.directives.push(data.metadata.toSummary());
                    }
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (directives_1_1 && !directives_1_1.done && (_a = directives_1.return)) _a.call(directives_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
            try {
                for (var pipes_1 = tslib_1.__values(pipes), pipes_1_1 = pipes_1.next(); !pipes_1_1.done; pipes_1_1 = pipes_1.next()) {
                    var pipe = pipes_1_1.value;
                    var metadata = this.resolver.getOrLoadPipeMetadata(pipe.reference);
                    result.pipes.push(metadata.toSummary());
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (pipes_1_1 && !pipes_1_1.done && (_b = pipes_1.return)) _b.call(pipes_1);
                }
                finally { if (e_7) throw e_7.error; }
            }
            (_c = result.schemas).push.apply(_c, tslib_1.__spread(ngModule.schemas));
            return result;
        };
        /**
         * Parse the `template` and return its AST, if any.
         * @param template template to be parsed
         */
        TypeScriptServiceHost.prototype.getTemplateAst = function (template) {
            var classSymbol = template.type, fileName = template.fileName;
            var data = this.resolver.getNonNormalizedDirectiveMetadata(classSymbol);
            if (!data) {
                return;
            }
            var htmlParser = new compiler_1.HtmlParser();
            var expressionParser = new compiler_1.Parser(new compiler_1.Lexer());
            var parser = new compiler_1.TemplateParser(new compiler_1.CompilerConfig(), this.reflector, expressionParser, new compiler_1.DomElementSchemaRegistry(), htmlParser, null, // console
            [] // tranforms
            );
            var htmlResult = htmlParser.parse(template.source, fileName, {
                tokenizeExpansionForms: true,
                preserveLineEndings: true,
            });
            var _a = this.getModuleMetadataForDirective(classSymbol), directives = _a.directives, pipes = _a.pipes, schemas = _a.schemas;
            var parseResult = parser.tryParseHtml(htmlResult, data.metadata, directives, pipes, schemas);
            if (!parseResult.templateAst) {
                return;
            }
            return {
                htmlAst: htmlResult.rootNodes,
                templateAst: parseResult.templateAst,
                directive: data.metadata, directives: directives, pipes: pipes,
                parseErrors: parseResult.errors, expressionParser: expressionParser, template: template,
            };
        };
        /**
         * Log the specified `msg` to file at INFO level. If logging is not enabled
         * this method is a no-op.
         * @param msg Log message
         */
        TypeScriptServiceHost.prototype.log = function (msg) {
            if (this.tsLsHost.log) {
                this.tsLsHost.log(msg);
            }
        };
        /**
         * Log the specified `msg` to file at ERROR level. If logging is not enabled
         * this method is a no-op.
         * @param msg error message
         */
        TypeScriptServiceHost.prototype.error = function (msg) {
            if (this.tsLsHost.error) {
                this.tsLsHost.error(msg);
            }
        };
        /**
         * Log debugging info to file at INFO level, only if verbose setting is turned
         * on. Otherwise, this method is a no-op.
         * @param msg debugging message
         */
        TypeScriptServiceHost.prototype.debug = function (msg) {
            var project = this.tsLsHost;
            if (!project.projectService) {
                // tsLsHost is not a Project
                return;
            }
            var logger = project.projectService.logger;
            if (logger.hasLevel(tss.server.LogLevel.verbose)) {
                logger.info(msg);
            }
        };
        return TypeScriptServiceHost;
    }());
    exports.TypeScriptServiceHost = TypeScriptServiceHost;
    function findSuitableDefaultModule(modules) {
        var e_8, _a;
        var result = undefined;
        var resultSize = 0;
        try {
            for (var _b = tslib_1.__values(modules.ngModules), _c = _b.next(); !_c.done; _c = _b.next()) {
                var module_1 = _c.value;
                var moduleSize = module_1.transitiveModule.directives.length;
                if (moduleSize > resultSize) {
                    result = module_1;
                    resultSize = moduleSize;
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_8) throw e_8.error; }
        }
        return result;
    }
    function spanOf(node) {
        return { start: node.getStart(), end: node.getEnd() };
    }
    function spanAt(sourceFile, line, column) {
        if (line != null && column != null) {
            var position_1 = tss.getPositionOfLineAndCharacter(sourceFile, line, column);
            var findChild = function findChild(node) {
                if (node.kind > tss.SyntaxKind.LastToken && node.pos <= position_1 && node.end > position_1) {
                    var betterNode = tss.forEachChild(node, findChild);
                    return betterNode || node;
                }
            };
            var node = tss.forEachChild(sourceFile, findChild);
            if (node) {
                return { start: node.getStart(), end: node.getEnd() };
            }
        }
    }
    function convertChain(chain) {
        return { message: chain.message, next: chain.next ? chain.next.map(convertChain) : undefined };
    }
    function errorToDiagnosticWithChain(error, span) {
        return { message: error.chain ? convertChain(error.chain) : error.message, span: span };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdF9ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvbGFuZ3VhZ2Utc2VydmljZS9zcmMvdHlwZXNjcmlwdF9ob3N0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUE2akI7SUFDN2pCLHNDQUFxRjtJQUNyRixvREFBc0Q7SUFHdEQsbUZBQXlEO0lBQ3pELCtFQUErQztJQUMvQyxtRUFBMkg7SUFFM0gsNkRBQWdFO0lBR2hFOztPQUVHO0lBQ0gsU0FBZ0IsbUNBQW1DLENBQy9DLElBQTZCLEVBQUUsT0FBNEI7UUFDN0QsSUFBTSxNQUFNLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDeEQsSUFBTSxRQUFRLEdBQUcsd0NBQXFCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0MsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUxELGtGQUtDO0lBRUQ7Ozs7O09BS0c7SUFDSDtRQUFxQywyQ0FBVTtRQUEvQzs7UUFFQSxDQUFDO1FBREMsK0JBQUssR0FBTCxjQUEyQixPQUFPLElBQUksMEJBQWUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLHNCQUFDO0lBQUQsQ0FBQyxBQUZELENBQXFDLHFCQUFVLEdBRTlDO0lBRlksMENBQWU7SUFJNUI7O09BRUc7SUFDSDtRQUF5QywrQ0FBYztRQUF2RDs7UUFFQSxDQUFDO1FBREMsaUNBQUcsR0FBSCxVQUFJLEdBQVcsSUFBcUIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRSwwQkFBQztJQUFELENBQUMsQUFGRCxDQUF5Qyx5QkFBYyxHQUV0RDtJQUZZLGtEQUFtQjtJQUloQzs7Ozs7OztPQU9HO0lBQ0g7UUFpQkUsK0JBQ2EsUUFBaUMsRUFBbUIs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QUFTLDBCQUEwQixDQUFDLEtBQXFCLEVBQUUsSUFBVTtRQUNuRSxPQUFPLEVBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxNQUFBLEVBQUMsQ0FBQztJQUNsRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FvdFN1bW1hcnlSZXNvbHZlciwgQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnksIENvbXBpbGVNZXRhZGF0YVJlc29sdmVyLCBDb21waWxlTmdNb2R1bGVNZXRhZGF0YSwgQ29tcGlsZVBpcGVTdW1tYXJ5LCBDb21waWxlckNvbmZpZywgRGlyZWN0aXZlTm9ybWFsaXplciwgRGlyZWN0aXZlUmVzb2x2ZXIsIERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSwgRm9ybWF0dGVkRXJyb3IsIEZvcm1hdHRlZE1lc3NhZ2VDaGFpbiwgSHRtbFBhcnNlciwgSTE4Tkh0bWxQYXJzZXIsIEppdFN1bW1hcnlSZXNvbHZlciwgTGV4ZXIsIE5nQW5hbHl6ZWRNb2R1bGVzLCBOZ01vZHVsZVJlc29sdmVyLCBQYXJzZVRyZWVSZXN1bHQsIFBhcnNlciwgUGlwZVJlc29sdmVyLCBSZXNvdXJjZUxvYWRlciwgU3RhdGljUmVmbGVjdG9yLCBTdGF0aWNTeW1ib2wsIFN0YXRpY1N5bWJvbENhY2hlLCBTdGF0aWNTeW1ib2xSZXNvbHZlciwgVGVtcGxhdGVQYXJzZXIsIGFuYWx5emVOZ01vZHVsZXMsIGNyZWF0ZU9mZmxpbmVDb21waWxlVXJsUmVzb2x2ZXIsIGlzRm9ybWF0dGVkRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCB7U2NoZW1hTWV0YWRhdGEsIFZpZXdFbmNhcHN1bGF0aW9uLCDJtUNvbnNvbGUgYXMgQ29uc29sZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgKiBhcyB0c3MgZnJvbSAndHlwZXNjcmlwdC9saWIvdHNzZXJ2ZXJsaWJyYXJ5JztcblxuaW1wb3J0IHtBc3RSZXN1bHR9IGZyb20gJy4vY29tbW9uJztcbmltcG9ydCB7Y3JlYXRlTGFuZ3VhZ2VTZXJ2aWNlfSBmcm9tICcuL2xhbmd1YWdlX3NlcnZpY2UnO1xuaW1wb3J0IHtSZWZsZWN0b3JIb3N0fSBmcm9tICcuL3JlZmxlY3Rvcl9ob3N0JztcbmltcG9ydCB7RXh0ZXJuYWxUZW1wbGF0ZSwgSW5saW5lVGVtcGxhdGUsIGdldENsYXNzRGVjbEZyb21EZWNvcmF0b3JQcm9wLCBnZXRQcm9wZXJ0eUFzc2lnbm1lbnRGcm9tVmFsdWV9IGZyb20gJy4vdGVtcGxhdGUnO1xuaW1wb3J0IHtEZWNsYXJhdGlvbiwgRGVjbGFyYXRpb25FcnJvciwgRGlhZ25vc3RpY01lc3NhZ2VDaGFpbiwgTGFuZ3VhZ2VTZXJ2aWNlLCBMYW5ndWFnZVNlcnZpY2VIb3N0LCBTcGFuLCBUZW1wbGF0ZVNvdXJjZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge2ZpbmRUaWdodGVzdE5vZGUsIGdldERpcmVjdGl2ZUNsYXNzTGlrZX0gZnJvbSAnLi91dGlscyc7XG5cblxuLyoqXG4gKiBDcmVhdGUgYSBgTGFuZ3VhZ2VTZXJ2aWNlSG9zdGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxhbmd1YWdlU2VydmljZUZyb21UeXBlc2NyaXB0KFxuICAgIGhvc3Q6IHRzcy5MYW5ndWFnZVNlcnZpY2VIb3N0LCBzZXJ2aWNlOiB0c3MuTGFuZ3VhZ2VTZXJ2aWNlKTogTGFuZ3VhZ2VTZXJ2aWNlIHtcbiAgY29uc3QgbmdIb3N0ID0gbmV3IFR5cGVTY3JpcHRTZXJ2aWNlSG9zdChob3N0LCBzZXJ2aWNlKTtcbiAgY29uc3QgbmdTZXJ2ZXIgPSBjcmVhdGVMYW5ndWFnZVNlcnZpY2UobmdIb3N0KTtcbiAgcmV0dXJuIG5nU2VydmVyO1xufVxuXG4vKipcbiAqIFRoZSBsYW5ndWFnZSBzZXJ2aWNlIG5ldmVyIG5lZWRzIHRoZSBub3JtYWxpemVkIHZlcnNpb25zIG9mIHRoZSBtZXRhZGF0YS4gVG8gYXZvaWQgcGFyc2luZ1xuICogdGhlIGNvbnRlbnQgYW5kIHJlc29sdmluZyByZWZlcmVuY2VzLCByZXR1cm4gYW4gZW1wdHkgZmlsZS4gVGhpcyBhbHNvIGFsbG93cyBub3JtYWxpemluZ1xuICogdGVtcGxhdGUgdGhhdCBhcmUgc3ludGF0aWNhbGx5IGluY29ycmVjdCB3aGljaCBpcyByZXF1aXJlZCB0byBwcm92aWRlIGNvbXBsZXRpb25zIGluXG4gKiBzeW50YWN0aWNhbGx5IGluY29ycmVjdCB0ZW1wbGF0ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBEdW1teUh0bWxQYXJzZXIgZXh0ZW5kcyBIdG1sUGFyc2VyIHtcbiAgcGFyc2UoKTogUGFyc2VUcmVlUmVzdWx0IHsgcmV0dXJuIG5ldyBQYXJzZVRyZWVSZXN1bHQoW10sIFtdKTsgfVxufVxuXG4vKipcbiAqIEF2b2lkIGxvYWRpbmcgcmVzb3VyY2VzIGluIHRoZSBsYW5ndWFnZSBzZXJ2Y2llIGJ5IHVzaW5nIGEgZHVtbXkgbG9hZGVyLlxuICovXG5leHBvcnQgY2xhc3MgRHVtbXlSZXNvdXJjZUxvYWRlciBleHRlbmRzIFJlc291cmNlTG9hZGVyIHtcbiAgZ2V0KHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgnJyk7IH1cbn1cblxuLyoqXG4gKiBBbiBpbXBsZW1lbnRhdGlvbiBvZiBhIGBMYW5ndWFnZVNlcnZpY2VIb3N0YCBmb3IgYSBUeXBlU2NyaXB0IHByb2plY3QuXG4gKlxuICogVGhlIGBUeXBlU2NyaXB0U2VydmljZUhvc3RgIGltcGxlbWVudHMgdGhlIEFuZ3VsYXIgYExhbmd1YWdlU2VydmljZUhvc3RgIHVzaW5nXG4gKiB0aGUgVHlwZVNjcmlwdCBsYW5ndWFnZSBzZXJ2aWNlcy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBUeXBlU2NyaXB0U2VydmljZUhvc3QgaW1wbGVtZW50cyBMYW5ndWFnZVNlcnZpY2VIb3N0IHtcbiAgcHJpdmF0ZSByZWFkb25seSBzdW1tYXJ5UmVzb2x2ZXI6IEFvdFN1bW1hcnlSZXNvbHZlcjtcbiAgcHJpdmF0ZSByZWFkb25seSByZWZsZWN0b3JIb3N0OiBSZWZsZWN0b3JIb3N0O1xuICBwcml2YXRlIHJlYWRvbmx5IHN0YXRpY1N5bWJvbFJlc29sdmVyOiBTdGF0aWNTeW1ib2xSZXNvbHZlcjtcblxuICBwcml2YXRlIHJlYWRvbmx5IHN0YXRpY1N5bWJvbENhY2hlID0gbmV3IFN0YXRpY1N5bWJvbENhY2hlKCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgZmlsZVRvQ29tcG9uZW50ID0gbmV3IE1hcDxzdHJpbmcsIFN0YXRpY1N5bWJvbD4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBjb2xsZWN0ZWRFcnJvcnMgPSBuZXcgTWFwPHN0cmluZywgYW55W10+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgZmlsZVZlcnNpb25zID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICBwcml2YXRlIGxhc3RQcm9ncmFtOiB0c3MuUHJvZ3JhbXx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIHByaXZhdGUgYW5hbHl6ZWRNb2R1bGVzOiBOZ0FuYWx5emVkTW9kdWxlcyA9IHtcbiAgICBmaWxlczogW10sXG4gICAgbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZTogbmV3IE1hcCgpLFxuICAgIG5nTW9kdWxlczogW10sXG4gIH07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSB0c0xzSG9zdDogdHNzLkxhbmd1YWdlU2VydmljZUhvc3QsIHByaXZhdGUgcmVhZG9ubHkgdHNMUzogdHNzLkxhbmd1YWdlU2VydmljZSkge1xuICAgIHRoaXMuc3VtbWFyeVJlc29sdmVyID0gbmV3IEFvdFN1bW1hcnlSZXNvbHZlcihcbiAgICAgICAge1xuICAgICAgICAgIGxvYWRTdW1tYXJ5KGZpbGVQYXRoOiBzdHJpbmcpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgICAgaXNTb3VyY2VGaWxlKHNvdXJjZUZpbGVQYXRoOiBzdHJpbmcpIHsgcmV0dXJuIHRydWU7IH0sXG4gICAgICAgICAgdG9TdW1tYXJ5RmlsZU5hbWUoc291cmNlRmlsZVBhdGg6IHN0cmluZykgeyByZXR1cm4gc291cmNlRmlsZVBhdGg7IH0sXG4gICAgICAgICAgZnJvbVN1bW1hcnlGaWxlTmFtZShmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5ne3JldHVybiBmaWxlUGF0aDt9LFxuICAgICAgICB9LFxuICAgICAgICB0aGlzLnN0YXRpY1N5bWJvbENhY2hlKTtcbiAgICB0aGlzLnJlZmxlY3Rvckhvc3QgPSBuZXcgUmVmbGVjdG9ySG9zdCgoKSA9PiB0aGlzLnByb2dyYW0sIHRzTHNIb3N0KTtcbiAgICB0aGlzLnN0YXRpY1N5bWJvbFJlc29sdmVyID0gbmV3IFN0YXRpY1N5bWJvbFJlc29sdmVyKFxuICAgICAgICB0aGlzLnJlZmxlY3Rvckhvc3QsIHRoaXMuc3RhdGljU3ltYm9sQ2FjaGUsIHRoaXMuc3VtbWFyeVJlc29sdmVyLFxuICAgICAgICAoZSwgZmlsZVBhdGgpID0+IHRoaXMuY29sbGVjdEVycm9yKGUsIGZpbGVQYXRoKSk7XG4gIH1cblxuICAvLyBUaGUgcmVzb2x2ZXIgaXMgaW5zdGFudGlhdGVkIGxhemlseSBhbmQgc2hvdWxkIG5vdCBiZSBhY2Nlc3NlZCBkaXJlY3RseS5cbiAgLy8gSW5zdGVhZCwgY2FsbCB0aGUgcmVzb2x2ZXIgZ2V0dGVyLiBUaGUgaW5zdGFudGlhdGlvbiBvZiB0aGUgcmVzb2x2ZXIgYWxzb1xuICAvLyByZXF1aXJlcyBpbnN0YW50aWF0aW9uIG9mIHRoZSBTdGF0aWNSZWZsZWN0b3IsIGFuZCB0aGUgbGF0dGVyIHJlcXVpcmVzXG4gIC8vIHJlc29sdXRpb24gb2YgY29yZSBBbmd1bGFyIHN5bWJvbHMuIE1vZHVsZSByZXNvbHV0aW9uIHNob3VsZCBub3QgYmUgZG9uZVxuICAvLyBkdXJpbmcgaW5zdGFudGlhdGlvbiB0byBhdm9pZCBjeWNsaWMgZGVwZW5kZW5jeSBiZXR3ZWVuIHRoZSBwbHVnaW4gYW5kIHRoZVxuICAvLyBjb250YWluaW5nIFByb2plY3QsIHNvIHRoZSBTaW5nbGV0b24gcGF0dGVybiBpcyB1c2VkIGhlcmUuXG4gIHByaXZhdGUgX3Jlc29sdmVyOiBDb21waWxlTWV0YWRhdGFSZXNvbHZlcnx1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBNZXRhZGF0YVJlc29sdmVyLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXQgcmVzb2x2ZXIoKTogQ29tcGlsZU1ldGFkYXRhUmVzb2x2ZXIge1xuICAgIGlmICh0aGlzLl9yZXNvbHZlcikge1xuICAgICAgcmV0dXJuIHRoaXMuX3Jlc29sdmVyO1xuICAgIH1cbiAgICAvLyBTdGF0aWNSZWZsZWN0b3Iga2VlcHMgaXRzIG93biBwcml2YXRlIGNhY2hlcyB0aGF0IGFyZSBub3QgY2xlYXJhYmxlLlxuICAgIC8vIFdlIGhhdmUgbm8gY2hvaWNlIGJ1dCB0byBjcmVhdGUgYSBuZXcgaW5zdGFuY2UgdG8gaW52YWxpZGF0ZSB0aGUgY2FjaGVzLlxuICAgIC8vIFRPRE86IFJldmlzaXQgdGhpcyB3aGVuIGxhbmd1YWdlIHNlcnZpY2UgZ2V0cyByZXdyaXR0ZW4gZm9yIEl2eS5cbiAgICBjb25zdCBzdGF0aWNSZWZsZWN0b3IgPSBuZXcgU3RhdGljUmVmbGVjdG9yKFxuICAgICAgICB0aGlzLnN1bW1hcnlSZXNvbHZlciwgdGhpcy5zdGF0aWNTeW1ib2xSZXNvbHZlcixcbiAgICAgICAgW10sICAvLyBrbm93bk1ldGFkYXRhQ2xhc3Nlc1xuICAgICAgICBbXSwgIC8vIGtub3duTWV0YWRhdGFGdW5jdGlvbnNcbiAgICAgICAgKGUsIGZpbGVQYXRoKSA9PiB0aGlzLmNvbGxlY3RFcnJvcihlLCBmaWxlUGF0aCkpO1xuICAgIC8vIEJlY2F1c2Ugc3RhdGljIHJlZmxlY3RvciBhYm92ZSBpcyBjaGFuZ2VkLCB3ZSBuZWVkIHRvIGNyZWF0ZSBhIG5ld1xuICAgIC8vIHJlc29sdmVyLlxuICAgIGNvbnN0IG1vZHVsZVJlc29sdmVyID0gbmV3IE5nTW9kdWxlUmVzb2x2ZXIoc3RhdGljUmVmbGVjdG9yKTtcbiAgICBjb25zdCBkaXJlY3RpdmVSZXNvbHZlciA9IG5ldyBEaXJlY3RpdmVSZXNvbHZlcihzdGF0aWNSZWZsZWN0b3IpO1xuICAgIGNvbnN0IHBpcGVSZXNvbHZlciA9IG5ldyBQaXBlUmVzb2x2ZXIoc3RhdGljUmVmbGVjdG9yKTtcbiAgICBjb25zdCBlbGVtZW50U2NoZW1hUmVnaXN0cnkgPSBuZXcgRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5KCk7XG4gICAgY29uc3QgcmVzb3VyY2VMb2FkZXIgPSBuZXcgRHVtbXlSZXNvdXJjZUxvYWRlcigpO1xuICAgIGNvbnN0IHVybFJlc29sdmVyID0gY3JlYXRlT2ZmbGluZUNvbXBpbGVVcmxSZXNvbHZlcigpO1xuICAgIGNvbnN0IGh0bWxQYXJzZXIgPSBuZXcgRHVtbXlIdG1sUGFyc2VyKCk7XG4gICAgLy8gVGhpcyB0cmFja3MgdGhlIENvbXBpbGVDb25maWcgaW4gY29kZWdlbi50cy4gQ3VycmVudGx5IHRoZXNlIG9wdGlvbnNcbiAgICAvLyBhcmUgaGFyZC1jb2RlZC5cbiAgICBjb25zdCBjb25maWcgPSBuZXcgQ29tcGlsZXJDb25maWcoe1xuICAgICAgZGVmYXVsdEVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkLFxuICAgICAgdXNlSml0OiBmYWxzZSxcbiAgICB9KTtcbiAgICBjb25zdCBkaXJlY3RpdmVOb3JtYWxpemVyID1cbiAgICAgICAgbmV3IERpcmVjdGl2ZU5vcm1hbGl6ZXIocmVzb3VyY2VMb2FkZXIsIHVybFJlc29sdmVyLCBodG1sUGFyc2VyLCBjb25maWcpO1xuICAgIHRoaXMuX3Jlc29sdmVyID0gbmV3IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyKFxuICAgICAgICBjb25maWcsIGh0bWxQYXJzZXIsIG1vZHVsZVJlc29sdmVyLCBkaXJlY3RpdmVSZXNvbHZlciwgcGlwZVJlc29sdmVyLFxuICAgICAgICBuZXcgSml0U3VtbWFyeVJlc29sdmVyKCksIGVsZW1lbnRTY2hlbWFSZWdpc3RyeSwgZGlyZWN0aXZlTm9ybWFsaXplciwgbmV3IENvbnNvbGUoKSxcbiAgICAgICAgdGhpcy5zdGF0aWNTeW1ib2xDYWNoZSwgc3RhdGljUmVmbGVjdG9yLFxuICAgICAgICAoZXJyb3IsIHR5cGUpID0+IHRoaXMuY29sbGVjdEVycm9yKGVycm9yLCB0eXBlICYmIHR5cGUuZmlsZVBhdGgpKTtcbiAgICByZXR1cm4gdGhpcy5fcmVzb2x2ZXI7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIFN0YXRpY1JlZmxlY3RvciBob3N0ZWQgaW4gdGhlXG4gICAqIE1ldGFkYXRhUmVzb2x2ZXIuXG4gICAqL1xuICBwcml2YXRlIGdldCByZWZsZWN0b3IoKTogU3RhdGljUmVmbGVjdG9yIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlci5nZXRSZWZsZWN0b3IoKSBhcyBTdGF0aWNSZWZsZWN0b3I7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIHByb2dyYW0gaGFzIGNoYW5nZWQgYW5kIHJldHVybnMgYWxsIGFuYWx5emVkIG1vZHVsZXMuXG4gICAqIElmIHByb2dyYW0gaGFzIGNoYW5nZWQsIGludmFsaWRhdGUgYWxsIGNhY2hlcyBhbmQgdXBkYXRlIGZpbGVUb0NvbXBvbmVudFxuICAgKiBhbmQgdGVtcGxhdGVSZWZlcmVuY2VzLlxuICAgKiBJbiBhZGRpdGlvbiB0byByZXR1cm5pbmcgaW5mb3JtYXRpb24gYWJvdXQgTmdNb2R1bGVzLCB0aGlzIG1ldGhvZCBwbGF5cyB0aGVcbiAgICogc2FtZSByb2xlIGFzICdzeW5jaHJvbml6ZUhvc3REYXRhJyBpbiB0c3NlcnZlci5cbiAgICovXG4gIGdldEFuYWx5emVkTW9kdWxlcygpOiBOZ0FuYWx5emVkTW9kdWxlcyB7XG4gICAgaWYgKHRoaXMudXBUb0RhdGUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYW5hbHl6ZWRNb2R1bGVzO1xuICAgIH1cblxuICAgIC8vIEludmFsaWRhdGUgY2FjaGVzXG4gICAgdGhpcy5maWxlVG9Db21wb25lbnQuY2xlYXIoKTtcbiAgICB0aGlzLmNvbGxlY3RlZEVycm9ycy5jbGVhcigpO1xuICAgIHRoaXMucmVzb2x2ZXIuY2xlYXJDYWNoZSgpO1xuXG4gICAgY29uc3QgYW5hbHl6ZUhvc3QgPSB7aXNTb3VyY2VGaWxlKGZpbGVQYXRoOiBzdHJpbmcpIHsgcmV0dXJuIHRydWU7IH19O1xuICAgIGNvbnN0IHByb2dyYW1GaWxlcyA9IHRoaXMucHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpLm1hcChzZiA9PiBzZi5maWxlTmFtZSk7XG4gICAgdGhpcy5hbmFseXplZE1vZHVsZXMgPVxuICAgICAgICBhbmFseXplTmdNb2R1bGVzKHByb2dyYW1GaWxlcywgYW5hbHl6ZUhvc3QsIHRoaXMuc3RhdGljU3ltYm9sUmVzb2x2ZXIsIHRoaXMucmVzb2x2ZXIpO1xuXG4gICAgLy8gdXBkYXRlIHRlbXBsYXRlIHJlZmVyZW5jZXMgYW5kIGZpbGVUb0NvbXBvbmVudFxuICAgIGNvbnN0IHVybFJlc29sdmVyID0gY3JlYXRlT2ZmbGluZUNvbXBpbGVVcmxSZXNvbHZlcigpO1xuICAgIGZvciAoY29uc3QgbmdNb2R1bGUgb2YgdGhpcy5hbmFseXplZE1vZHVsZXMubmdNb2R1bGVzKSB7XG4gICAgICBmb3IgKGNvbnN0IGRpcmVjdGl2ZSBvZiBuZ01vZHVsZS5kZWNsYXJlZERpcmVjdGl2ZXMpIHtcbiAgICAgICAgY29uc3Qge21ldGFkYXRhfSA9IHRoaXMucmVzb2x2ZXIuZ2V0Tm9uTm9ybWFsaXplZERpcmVjdGl2ZU1ldGFkYXRhKGRpcmVjdGl2ZS5yZWZlcmVuY2UpICE7XG4gICAgICAgIGlmIChtZXRhZGF0YS5pc0NvbXBvbmVudCAmJiBtZXRhZGF0YS50ZW1wbGF0ZSAmJiBtZXRhZGF0YS50ZW1wbGF0ZS50ZW1wbGF0ZVVybCkge1xuICAgICAgICAgIGNvbnN0IHRlbXBsYXRlTmFtZSA9IHVybFJlc29sdmVyLnJlc29sdmUoXG4gICAgICAgICAgICAgIHRoaXMucmVmbGVjdG9yLmNvbXBvbmVudE1vZHVsZVVybChkaXJlY3RpdmUucmVmZXJlbmNlKSxcbiAgICAgICAgICAgICAgbWV0YWRhdGEudGVtcGxhdGUudGVtcGxhdGVVcmwpO1xuICAgICAgICAgIHRoaXMuZmlsZVRvQ29tcG9uZW50LnNldCh0ZW1wbGF0ZU5hbWUsIGRpcmVjdGl2ZS5yZWZlcmVuY2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYW5hbHl6ZWRNb2R1bGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIHRoZSBwcm9ncmFtIGhhcyBjaGFuZ2VkLCBhbmQgaW52YWxpZGF0ZSBzdGF0aWMgc3ltYm9scyBpblxuICAgKiB0aGUgc291cmNlIGZpbGVzIHRoYXQgaGF2ZSBjaGFuZ2VkLlxuICAgKiBSZXR1cm5zIHRydWUgaWYgbW9kdWxlcyBhcmUgdXAtdG8tZGF0ZSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKiBUaGlzIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBieSBnZXRBbmFseXplZE1vZHVsZXMoKS5cbiAgICovXG4gIHByaXZhdGUgdXBUb0RhdGUoKTogYm9vbGVhbiB7XG4gICAgY29uc3Qge2xhc3RQcm9ncmFtLCBwcm9ncmFtfSA9IHRoaXM7XG4gICAgaWYgKGxhc3RQcm9ncmFtID09PSBwcm9ncmFtKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy5sYXN0UHJvZ3JhbSA9IHByb2dyYW07XG5cbiAgICAvLyBFdmVuIHRob3VnaCB0aGUgcHJvZ3JhbSBoYXMgY2hhbmdlZCwgaXQgY291bGQgYmUgdGhlIGNhc2UgdGhhdCBub25lIG9mXG4gICAgLy8gdGhlIHNvdXJjZSBmaWxlcyBoYXZlIGNoYW5nZWQuIElmIGFsbCBzb3VyY2UgZmlsZXMgcmVtYWluIHRoZSBzYW1lLCB0aGVuXG4gICAgLy8gcHJvZ3JhbSBpcyBzdGlsbCB1cC10by1kYXRlLCBhbmQgd2Ugc2hvdWxkIG5vdCBpbnZhbGlkYXRlIGNhY2hlcy5cbiAgICBsZXQgZmlsZXNBZGRlZCA9IDA7XG4gICAgY29uc3QgZmlsZXNDaGFuZ2VkT3JSZW1vdmVkOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8gQ2hlY2sgaWYgYW55IHNvdXJjZSBmaWxlcyBoYXZlIGJlZW4gYWRkZWQgLyBjaGFuZ2VkIHNpbmNlIGxhc3QgY29tcHV0YXRpb24uXG4gICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGZvciAoY29uc3Qge2ZpbGVOYW1lfSBvZiBwcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkpIHtcbiAgICAgIHNlZW4uYWRkKGZpbGVOYW1lKTtcbiAgICAgIGNvbnN0IHZlcnNpb24gPSB0aGlzLnRzTHNIb3N0LmdldFNjcmlwdFZlcnNpb24oZmlsZU5hbWUpO1xuICAgICAgY29uc3QgbGFzdFZlcnNpb24gPSB0aGlzLmZpbGVWZXJzaW9ucy5nZXQoZmlsZU5hbWUpO1xuICAgICAgaWYgKGxhc3RWZXJzaW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZmlsZXNBZGRlZCsrO1xuICAgICAgICB0aGlzLmZpbGVWZXJzaW9ucy5zZXQoZmlsZU5hbWUsIHZlcnNpb24pO1xuICAgICAgfSBlbHNlIGlmICh2ZXJzaW9uICE9PSBsYXN0VmVyc2lvbikge1xuICAgICAgICBmaWxlc0NoYW5nZWRPclJlbW92ZWQucHVzaChmaWxlTmFtZSk7ICAvLyBjaGFuZ2VkXG4gICAgICAgIHRoaXMuZmlsZVZlcnNpb25zLnNldChmaWxlTmFtZSwgdmVyc2lvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgYW55IHNvdXJjZSBmaWxlcyBoYXZlIGJlZW4gcmVtb3ZlZCBzaW5jZSBsYXN0IGNvbXB1dGF0aW9uLlxuICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lXSBvZiB0aGlzLmZpbGVWZXJzaW9ucykge1xuICAgICAgaWYgKCFzZWVuLmhhcyhmaWxlTmFtZSkpIHtcbiAgICAgICAgZmlsZXNDaGFuZ2VkT3JSZW1vdmVkLnB1c2goZmlsZU5hbWUpOyAgLy8gcmVtb3ZlZFxuICAgICAgICAvLyBCZWNhdXNlIE1hcHMgYXJlIGl0ZXJhdGVkIGluIGluc2VydGlvbiBvcmRlciwgaXQgaXMgc2FmZSB0byBkZWxldGVcbiAgICAgICAgLy8gZW50cmllcyBmcm9tIHRoZSBzYW1lIG1hcCB3aGlsZSBpdGVyYXRpbmcuXG4gICAgICAgIC8vIFNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zNTk0MDIxNiBhbmRcbiAgICAgICAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi8xMC4wL2luZGV4Lmh0bWwjc2VjLW1hcC5wcm90b3R5cGUuZm9yZWFjaFxuICAgICAgICB0aGlzLmZpbGVWZXJzaW9ucy5kZWxldGUoZmlsZU5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgZmlsZU5hbWUgb2YgZmlsZXNDaGFuZ2VkT3JSZW1vdmVkKSB7XG4gICAgICBjb25zdCBzeW1ib2xzID0gdGhpcy5zdGF0aWNTeW1ib2xSZXNvbHZlci5pbnZhbGlkYXRlRmlsZShmaWxlTmFtZSk7XG4gICAgICB0aGlzLnJlZmxlY3Rvci5pbnZhbGlkYXRlU3ltYm9scyhzeW1ib2xzKTtcbiAgICB9XG5cbiAgICAvLyBQcm9ncmFtIGlzIHVwLXRvLWRhdGUgaWZmIG5vIGZpbGVzIGFyZSBhZGRlZCwgY2hhbmdlZCwgb3IgcmVtb3ZlZC5cbiAgICByZXR1cm4gZmlsZXNBZGRlZCA9PT0gMCAmJiBmaWxlc0NoYW5nZWRPclJlbW92ZWQubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgYWxsIHRlbXBsYXRlcyBpbiB0aGUgc3BlY2lmaWVkIGBmaWxlYC5cbiAgICogQHBhcmFtIGZpbGVOYW1lIFRTIG9yIEhUTUwgZmlsZVxuICAgKi9cbiAgZ2V0VGVtcGxhdGVzKGZpbGVOYW1lOiBzdHJpbmcpOiBUZW1wbGF0ZVNvdXJjZVtdIHtcbiAgICBjb25zdCByZXN1bHRzOiBUZW1wbGF0ZVNvdXJjZVtdID0gW107XG4gICAgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcudHMnKSkge1xuICAgICAgLy8gRmluZCBldmVyeSB0ZW1wbGF0ZSBzdHJpbmcgaW4gdGhlIGZpbGVcbiAgICAgIGNvbnN0IHZpc2l0ID0gKGNoaWxkOiB0c3MuTm9kZSkgPT4ge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0SW50ZXJuYWxUZW1wbGF0ZShjaGlsZCk7XG4gICAgICAgIGlmICh0ZW1wbGF0ZSkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh0ZW1wbGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHNzLmZvckVhY2hDaGlsZChjaGlsZCwgdmlzaXQpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY29uc3Qgc291cmNlRmlsZSA9IHRoaXMuZ2V0U291cmNlRmlsZShmaWxlTmFtZSk7XG4gICAgICBpZiAoc291cmNlRmlsZSkge1xuICAgICAgICB0c3MuZm9yRWFjaENoaWxkKHNvdXJjZUZpbGUsIHZpc2l0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldEV4dGVybmFsVGVtcGxhdGUoZmlsZU5hbWUpO1xuICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh0ZW1wbGF0ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBtZXRhZGF0YSBhYm91dCBhbGwgY2xhc3MgZGVjbGFyYXRpb25zIGluIHRoZSBmaWxlIHRoYXQgYXJlIEFuZ3VsYXJcbiAgICogZGlyZWN0aXZlcy4gUG90ZW50aWFsIG1hdGNoZXMgYXJlIGBATmdNb2R1bGVgLCBgQENvbXBvbmVudGAsIGBARGlyZWN0aXZlYCxcbiAgICogYEBQaXBlc2AsIGV0Yy4gY2xhc3MgZGVjbGFyYXRpb25zLlxuICAgKlxuICAgKiBAcGFyYW0gZmlsZU5hbWUgVFMgZmlsZVxuICAgKi9cbiAgZ2V0RGVjbGFyYXRpb25zKGZpbGVOYW1lOiBzdHJpbmcpOiBEZWNsYXJhdGlvbltdIHtcbiAgICBpZiAoIWZpbGVOYW1lLmVuZHNXaXRoKCcudHMnKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBzb3VyY2VGaWxlID0gdGhpcy5nZXRTb3VyY2VGaWxlKGZpbGVOYW1lKTtcbiAgICBpZiAoIXNvdXJjZUZpbGUpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0czogRGVjbGFyYXRpb25bXSA9IFtdO1xuICAgIGNvbnN0IHZpc2l0ID0gKGNoaWxkOiB0c3MuTm9kZSkgPT4ge1xuICAgICAgY29uc3QgY2FuZGlkYXRlID0gZ2V0RGlyZWN0aXZlQ2xhc3NMaWtlKGNoaWxkKTtcbiAgICAgIGlmIChjYW5kaWRhdGUpIHtcbiAgICAgICAgY29uc3Qge2NsYXNzSWR9ID0gY2FuZGlkYXRlO1xuICAgICAgICBjb25zdCBkZWNsYXJhdGlvblNwYW4gPSBzcGFuT2YoY2xhc3NJZCk7XG4gICAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IGNsYXNzSWQuZ2V0VGV4dCgpO1xuICAgICAgICBjb25zdCBjbGFzc1N5bWJvbCA9IHRoaXMucmVmbGVjdG9yLmdldFN0YXRpY1N5bWJvbChzb3VyY2VGaWxlLmZpbGVOYW1lLCBjbGFzc05hbWUpO1xuICAgICAgICAvLyBBc2sgdGhlIHJlc29sdmVyIHRvIGNoZWNrIGlmIGNhbmRpZGF0ZSBpcyBhY3R1YWxseSBBbmd1bGFyIGRpcmVjdGl2ZVxuICAgICAgICBpZiAoIXRoaXMucmVzb2x2ZXIuaXNEaXJlY3RpdmUoY2xhc3NTeW1ib2wpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLnJlc29sdmVyLmdldE5vbk5vcm1hbGl6ZWREaXJlY3RpdmVNZXRhZGF0YShjbGFzc1N5bWJvbCk7XG4gICAgICAgIGlmICghZGF0YSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgIHR5cGU6IGNsYXNzU3ltYm9sLFxuICAgICAgICAgIGRlY2xhcmF0aW9uU3BhbixcbiAgICAgICAgICBtZXRhZGF0YTogZGF0YS5tZXRhZGF0YSxcbiAgICAgICAgICBlcnJvcnM6IHRoaXMuZ2V0Q29sbGVjdGVkRXJyb3JzKGRlY2xhcmF0aW9uU3Bhbiwgc291cmNlRmlsZSksXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hpbGQuZm9yRWFjaENoaWxkKHZpc2l0KTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRzcy5mb3JFYWNoQ2hpbGQoc291cmNlRmlsZSwgdmlzaXQpO1xuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICBnZXRTb3VyY2VGaWxlKGZpbGVOYW1lOiBzdHJpbmcpOiB0c3MuU291cmNlRmlsZXx1bmRlZmluZWQge1xuICAgIGlmICghZmlsZU5hbWUuZW5kc1dpdGgoJy50cycpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vbi1UUyBzb3VyY2UgZmlsZSByZXF1ZXN0ZWQ6ICR7ZmlsZU5hbWV9YCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnByb2dyYW0uZ2V0U291cmNlRmlsZShmaWxlTmFtZSk7XG4gIH1cblxuICBnZXQgcHJvZ3JhbSgpOiB0c3MuUHJvZ3JhbSB7XG4gICAgY29uc3QgcHJvZ3JhbSA9IHRoaXMudHNMUy5nZXRQcm9ncmFtKCk7XG4gICAgaWYgKCFwcm9ncmFtKSB7XG4gICAgICAvLyBQcm9ncmFtIGlzIHZlcnkgdmVyeSB1bmxpa2VseSB0byBiZSB1bmRlZmluZWQuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHByb2dyYW0gaW4gbGFuZ3VhZ2Ugc2VydmljZSEnKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBUZW1wbGF0ZVNvdXJjZSBpZiBgbm9kZWAgaXMgYSB0ZW1wbGF0ZSBub2RlLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSxcbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgdGVtcGxhdGU6ICc8ZGl2PjwvZGl2PicgPC0tIHRlbXBsYXRlIG5vZGVcbiAgICogfSlcbiAgICogY2xhc3MgQXBwQ29tcG9uZW50IHt9XG4gICAqICAgICAgICAgICBeLS0tLSBjbGFzcyBkZWNsYXJhdGlvbiBub2RlXG4gICAqXG4gICAqIEBwYXJhbSBub2RlIFBvdGVudGlhbCB0ZW1wbGF0ZSBub2RlXG4gICAqL1xuICBwcml2YXRlIGdldEludGVybmFsVGVtcGxhdGUobm9kZTogdHNzLk5vZGUpOiBUZW1wbGF0ZVNvdXJjZXx1bmRlZmluZWQge1xuICAgIGlmICghdHNzLmlzU3RyaW5nTGl0ZXJhbExpa2Uobm9kZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdG1wbEFzZ24gPSBnZXRQcm9wZXJ0eUFzc2lnbm1lbnRGcm9tVmFsdWUobm9kZSk7XG4gICAgaWYgKCF0bXBsQXNnbiB8fCB0bXBsQXNnbi5uYW1lLmdldFRleHQoKSAhPT0gJ3RlbXBsYXRlJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBjbGFzc0RlY2wgPSBnZXRDbGFzc0RlY2xGcm9tRGVjb3JhdG9yUHJvcCh0bXBsQXNnbik7XG4gICAgaWYgKCFjbGFzc0RlY2wgfHwgIWNsYXNzRGVjbC5uYW1lKSB7ICAvLyBEb2VzIG5vdCBoYW5kbGUgYW5vbnltb3VzIGNsYXNzXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZpbGVOYW1lID0gbm9kZS5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWU7XG4gICAgY29uc3QgY2xhc3NTeW1ib2wgPSB0aGlzLnJlZmxlY3Rvci5nZXRTdGF0aWNTeW1ib2woZmlsZU5hbWUsIGNsYXNzRGVjbC5uYW1lLnRleHQpO1xuICAgIHJldHVybiBuZXcgSW5saW5lVGVtcGxhdGUobm9kZSwgY2xhc3NEZWNsLCBjbGFzc1N5bWJvbCwgdGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBleHRlcm5hbCB0ZW1wbGF0ZSBmb3IgYGZpbGVOYW1lYC5cbiAgICogQHBhcmFtIGZpbGVOYW1lIEhUTUwgZmlsZVxuICAgKi9cbiAgcHJpdmF0ZSBnZXRFeHRlcm5hbFRlbXBsYXRlKGZpbGVOYW1lOiBzdHJpbmcpOiBUZW1wbGF0ZVNvdXJjZXx1bmRlZmluZWQge1xuICAgIC8vIEZpcnN0IGdldCB0aGUgdGV4dCBmb3IgdGhlIHRlbXBsYXRlXG4gICAgY29uc3Qgc25hcHNob3QgPSB0aGlzLnRzTHNIb3N0LmdldFNjcmlwdFNuYXBzaG90KGZpbGVOYW1lKTtcbiAgICBpZiAoIXNuYXBzaG90KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHNvdXJjZSA9IHNuYXBzaG90LmdldFRleHQoMCwgc25hcHNob3QuZ2V0TGVuZ3RoKCkpO1xuICAgIC8vIE5leHQgZmluZCB0aGUgY29tcG9uZW50IGNsYXNzIHN5bWJvbFxuICAgIGNvbnN0IGNsYXNzU3ltYm9sID0gdGhpcy5maWxlVG9Db21wb25lbnQuZ2V0KGZpbGVOYW1lKTtcbiAgICBpZiAoIWNsYXNzU3ltYm9sKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFRoZW4gdXNlIHRoZSBjbGFzcyBzeW1ib2wgdG8gZmluZCB0aGUgYWN0dWFsIHRzLkNsYXNzRGVjbGFyYXRpb24gbm9kZVxuICAgIGNvbnN0IHNvdXJjZUZpbGUgPSB0aGlzLmdldFNvdXJjZUZpbGUoY2xhc3NTeW1ib2wuZmlsZVBhdGgpO1xuICAgIGlmICghc291cmNlRmlsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUT0RPOiBUaGlzIG9ubHkgY29uc2lkZXJzIHRvcC1sZXZlbCBjbGFzcyBkZWNsYXJhdGlvbnMgaW4gYSBzb3VyY2UgZmlsZS5cbiAgICAvLyBUaGlzIHdvdWxkIG5vdCBmaW5kIGEgY2xhc3MgZGVjbGFyYXRpb24gaW4gYSBuYW1lc3BhY2UsIGZvciBleGFtcGxlLlxuICAgIGNvbnN0IGNsYXNzRGVjbCA9IHNvdXJjZUZpbGUuZm9yRWFjaENoaWxkKChjaGlsZCkgPT4ge1xuICAgICAgaWYgKHRzcy5pc0NsYXNzRGVjbGFyYXRpb24oY2hpbGQpICYmIGNoaWxkLm5hbWUgJiYgY2hpbGQubmFtZS50ZXh0ID09PSBjbGFzc1N5bWJvbC5uYW1lKSB7XG4gICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWNsYXNzRGVjbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEV4dGVybmFsVGVtcGxhdGUoc291cmNlLCBmaWxlTmFtZSwgY2xhc3NEZWNsLCBjbGFzc1N5bWJvbCwgdGhpcyk7XG4gIH1cblxuICBwcml2YXRlIGNvbGxlY3RFcnJvcihlcnJvcjogYW55LCBmaWxlUGF0aD86IHN0cmluZykge1xuICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgbGV0IGVycm9ycyA9IHRoaXMuY29sbGVjdGVkRXJyb3JzLmdldChmaWxlUGF0aCk7XG4gICAgICBpZiAoIWVycm9ycykge1xuICAgICAgICBlcnJvcnMgPSBbXTtcbiAgICAgICAgdGhpcy5jb2xsZWN0ZWRFcnJvcnMuc2V0KGZpbGVQYXRoLCBlcnJvcnMpO1xuICAgICAgfVxuICAgICAgZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0Q29sbGVjdGVkRXJyb3JzKGRlZmF1bHRTcGFuOiBTcGFuLCBzb3VyY2VGaWxlOiB0c3MuU291cmNlRmlsZSk6IERlY2xhcmF0aW9uRXJyb3JbXSB7XG4gICAgY29uc3QgZXJyb3JzID0gdGhpcy5jb2xsZWN0ZWRFcnJvcnMuZ2V0KHNvdXJjZUZpbGUuZmlsZU5hbWUpO1xuICAgIGlmICghZXJyb3JzKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIC8vIFRPRE86IEFkZCBiZXR0ZXIgdHlwaW5ncyBmb3IgdGhlIGVycm9yc1xuICAgIHJldHVybiBlcnJvcnMubWFwKChlOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGxpbmUgPSBlLmxpbmUgfHwgKGUucG9zaXRpb24gJiYgZS5wb3NpdGlvbi5saW5lKTtcbiAgICAgIGNvbnN0IGNvbHVtbiA9IGUuY29sdW1uIHx8IChlLnBvc2l0aW9uICYmIGUucG9zaXRpb24uY29sdW1uKTtcbiAgICAgIGNvbnN0IHNwYW4gPSBzcGFuQXQoc291cmNlRmlsZSwgbGluZSwgY29sdW1uKSB8fCBkZWZhdWx0U3BhbjtcbiAgICAgIGlmIChpc0Zvcm1hdHRlZEVycm9yKGUpKSB7XG4gICAgICAgIHJldHVybiBlcnJvclRvRGlhZ25vc3RpY1dpdGhDaGFpbihlLCBzcGFuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7bWVzc2FnZTogZS5tZXNzYWdlLCBzcGFufTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHBhcnNlZCB0ZW1wbGF0ZSBmb3IgdGhlIHRlbXBsYXRlIGF0IHRoZSBzcGVjaWZpZWQgYHBvc2l0aW9uYC5cbiAgICogQHBhcmFtIGZpbGVOYW1lIFRTIG9yIEhUTUwgZmlsZVxuICAgKiBAcGFyYW0gcG9zaXRpb24gUG9zaXRpb24gb2YgdGhlIHRlbXBsYXRlIGluIHRoZSBUUyBmaWxlLCBvdGhlcndpc2UgaWdub3JlZC5cbiAgICovXG4gIGdldFRlbXBsYXRlQXN0QXRQb3NpdGlvbihmaWxlTmFtZTogc3RyaW5nLCBwb3NpdGlvbjogbnVtYmVyKTogQXN0UmVzdWx0fHVuZGVmaW5lZCB7XG4gICAgbGV0IHRlbXBsYXRlOiBUZW1wbGF0ZVNvdXJjZXx1bmRlZmluZWQ7XG4gICAgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcudHMnKSkge1xuICAgICAgY29uc3Qgc291cmNlRmlsZSA9IHRoaXMuZ2V0U291cmNlRmlsZShmaWxlTmFtZSk7XG4gICAgICBpZiAoIXNvdXJjZUZpbGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gRmluZCB0aGUgbm9kZSB0aGF0IG1vc3QgY2xvc2VseSBtYXRjaGVzIHRoZSBwb3NpdGlvblxuICAgICAgY29uc3Qgbm9kZSA9IGZpbmRUaWdodGVzdE5vZGUoc291cmNlRmlsZSwgcG9zaXRpb24pO1xuICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRlbXBsYXRlID0gdGhpcy5nZXRJbnRlcm5hbFRlbXBsYXRlKG5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0ZW1wbGF0ZSA9IHRoaXMuZ2V0RXh0ZXJuYWxUZW1wbGF0ZShmaWxlTmFtZSk7XG4gICAgfVxuICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0VGVtcGxhdGVBc3QodGVtcGxhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgdGhlIE5nTW9kdWxlIHdoaWNoIHRoZSBkaXJlY3RpdmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBgY2xhc3NTeW1ib2xgXG4gICAqIGJlbG9uZ3MgdG8sIHRoZW4gcmV0dXJuIGl0cyBzY2hlbWEgYW5kIHRyYW5zaXRpdmUgZGlyZWN0aXZlcyBhbmQgcGlwZXMuXG4gICAqIEBwYXJhbSBjbGFzc1N5bWJvbCBBbmd1bGFyIFN5bWJvbCB0aGF0IGRlZmluZXMgYSBkaXJlY3RpdmVcbiAgICovXG4gIHByaXZhdGUgZ2V0TW9kdWxlTWV0YWRhdGFGb3JEaXJlY3RpdmUoY2xhc3NTeW1ib2w6IFN0YXRpY1N5bWJvbCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgIGRpcmVjdGl2ZXM6IFtdIGFzIENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5W10sXG4gICAgICBwaXBlczogW10gYXMgQ29tcGlsZVBpcGVTdW1tYXJ5W10sXG4gICAgICBzY2hlbWFzOiBbXSBhcyBTY2hlbWFNZXRhZGF0YVtdLFxuICAgIH07XG4gICAgLy8gRmlyc3QgZmluZCB3aGljaCBOZ01vZHVsZSB0aGUgZGlyZWN0aXZlIGJlbG9uZ3MgdG8uXG4gICAgY29uc3QgbmdNb2R1bGUgPSB0aGlzLmFuYWx5emVkTW9kdWxlcy5uZ01vZHVsZUJ5UGlwZU9yRGlyZWN0aXZlLmdldChjbGFzc1N5bWJvbCkgfHxcbiAgICAgICAgZmluZFN1aXRhYmxlRGVmYXVsdE1vZHVsZSh0aGlzLmFuYWx5emVkTW9kdWxlcyk7XG4gICAgaWYgKCFuZ01vZHVsZSkge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgLy8gVGhlbiBnYXRoZXIgYWxsIHRyYW5zaXRpdmUgZGlyZWN0aXZlcyBhbmQgcGlwZXMuXG4gICAgY29uc3Qge2RpcmVjdGl2ZXMsIHBpcGVzfSA9IG5nTW9kdWxlLnRyYW5zaXRpdmVNb2R1bGU7XG4gICAgZm9yIChjb25zdCBkaXJlY3RpdmUgb2YgZGlyZWN0aXZlcykge1xuICAgICAgY29uc3QgZGF0YSA9IHRoaXMucmVzb2x2ZXIuZ2V0Tm9uTm9ybWFsaXplZERpcmVjdGl2ZU1ldGFkYXRhKGRpcmVjdGl2ZS5yZWZlcmVuY2UpO1xuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgcmVzdWx0LmRpcmVjdGl2ZXMucHVzaChkYXRhLm1ldGFkYXRhLnRvU3VtbWFyeSgpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBwaXBlIG9mIHBpcGVzKSB7XG4gICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMucmVzb2x2ZXIuZ2V0T3JMb2FkUGlwZU1ldGFkYXRhKHBpcGUucmVmZXJlbmNlKTtcbiAgICAgIHJlc3VsdC5waXBlcy5wdXNoKG1ldGFkYXRhLnRvU3VtbWFyeSgpKTtcbiAgICB9XG4gICAgcmVzdWx0LnNjaGVtYXMucHVzaCguLi5uZ01vZHVsZS5zY2hlbWFzKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIHRoZSBgdGVtcGxhdGVgIGFuZCByZXR1cm4gaXRzIEFTVCwgaWYgYW55LlxuICAgKiBAcGFyYW0gdGVtcGxhdGUgdGVtcGxhdGUgdG8gYmUgcGFyc2VkXG4gICAqL1xuICBnZXRUZW1wbGF0ZUFzdCh0ZW1wbGF0ZTogVGVtcGxhdGVTb3VyY2UpOiBBc3RSZXN1bHR8dW5kZWZpbmVkIHtcbiAgICBjb25zdCB7dHlwZTogY2xhc3NTeW1ib2wsIGZpbGVOYW1lfSA9IHRlbXBsYXRlO1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLnJlc29sdmVyLmdldE5vbk5vcm1hbGl6ZWREaXJlY3RpdmVNZXRhZGF0YShjbGFzc1N5bWJvbCk7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGh0bWxQYXJzZXIgPSBuZXcgSHRtbFBhcnNlcigpO1xuICAgIGNvbnN0IGV4cHJlc3Npb25QYXJzZXIgPSBuZXcgUGFyc2VyKG5ldyBMZXhlcigpKTtcbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgVGVtcGxhdGVQYXJzZXIoXG4gICAgICAgIG5ldyBDb21waWxlckNvbmZpZygpLCB0aGlzLnJlZmxlY3RvciwgZXhwcmVzc2lvblBhcnNlciwgbmV3IERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSgpLFxuICAgICAgICBodG1sUGFyc2VyLFxuICAgICAgICBudWxsICEsICAvLyBjb25zb2xlXG4gICAgICAgIFtdICAgICAgIC8vIHRyYW5mb3Jtc1xuICAgICAgICApO1xuICAgIGNvbnN0IGh0bWxSZXN1bHQgPSBodG1sUGFyc2VyLnBhcnNlKHRlbXBsYXRlLnNvdXJjZSwgZmlsZU5hbWUsIHtcbiAgICAgIHRva2VuaXplRXhwYW5zaW9uRm9ybXM6IHRydWUsXG4gICAgICBwcmVzZXJ2ZUxpbmVFbmRpbmdzOiB0cnVlLCAgLy8gZG8gbm90IGNvbnZlcnQgQ1JMRiB0byBMRlxuICAgIH0pO1xuICAgIGNvbnN0IHtkaXJlY3RpdmVzLCBwaXBlcywgc2NoZW1hc30gPSB0aGlzLmdldE1vZHVsZU1ldGFkYXRhRm9yRGlyZWN0aXZlKGNsYXNzU3ltYm9sKTtcbiAgICBjb25zdCBwYXJzZVJlc3VsdCA9IHBhcnNlci50cnlQYXJzZUh0bWwoaHRtbFJlc3VsdCwgZGF0YS5tZXRhZGF0YSwgZGlyZWN0aXZlcywgcGlwZXMsIHNjaGVtYXMpO1xuICAgIGlmICghcGFyc2VSZXN1bHQudGVtcGxhdGVBc3QpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGh0bWxBc3Q6IGh0bWxSZXN1bHQucm9vdE5vZGVzLFxuICAgICAgdGVtcGxhdGVBc3Q6IHBhcnNlUmVzdWx0LnRlbXBsYXRlQXN0LFxuICAgICAgZGlyZWN0aXZlOiBkYXRhLm1ldGFkYXRhLCBkaXJlY3RpdmVzLCBwaXBlcyxcbiAgICAgIHBhcnNlRXJyb3JzOiBwYXJzZVJlc3VsdC5lcnJvcnMsIGV4cHJlc3Npb25QYXJzZXIsIHRlbXBsYXRlLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogTG9nIHRoZSBzcGVjaWZpZWQgYG1zZ2AgdG8gZmlsZSBhdCBJTkZPIGxldmVsLiBJZiBsb2dnaW5nIGlzIG5vdCBlbmFibGVkXG4gICAqIHRoaXMgbWV0aG9kIGlzIGEgbm8tb3AuXG4gICAqIEBwYXJhbSBtc2cgTG9nIG1lc3NhZ2VcbiAgICovXG4gIGxvZyhtc2c6IHN0cmluZykge1xuICAgIGlmICh0aGlzLnRzTHNIb3N0LmxvZykge1xuICAgICAgdGhpcy50c0xzSG9zdC5sb2cobXNnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9nIHRoZSBzcGVjaWZpZWQgYG1zZ2AgdG8gZmlsZSBhdCBFUlJPUiBsZXZlbC4gSWYgbG9nZ2luZyBpcyBub3QgZW5hYmxlZFxuICAgKiB0aGlzIG1ldGhvZCBpcyBhIG5vLW9wLlxuICAgKiBAcGFyYW0gbXNnIGVycm9yIG1lc3NhZ2VcbiAgICovXG4gIGVycm9yKG1zZzogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMudHNMc0hvc3QuZXJyb3IpIHtcbiAgICAgIHRoaXMudHNMc0hvc3QuZXJyb3IobXNnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9nIGRlYnVnZ2luZyBpbmZvIHRvIGZpbGUgYXQgSU5GTyBsZXZlbCwgb25seSBpZiB2ZXJib3NlIHNldHRpbmcgaXMgdHVybmVkXG4gICAqIG9uLiBPdGhlcndpc2UsIHRoaXMgbWV0aG9kIGlzIGEgbm8tb3AuXG4gICAqIEBwYXJhbSBtc2cgZGVidWdnaW5nIG1lc3NhZ2VcbiAgICovXG4gIGRlYnVnKG1zZzogc3RyaW5nKSB7XG4gICAgY29uc3QgcHJvamVjdCA9IHRoaXMudHNMc0hvc3QgYXMgdHNzLnNlcnZlci5Qcm9qZWN0O1xuICAgIGlmICghcHJvamVjdC5wcm9qZWN0U2VydmljZSkge1xuICAgICAgLy8gdHNMc0hvc3QgaXMgbm90IGEgUHJvamVjdFxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7bG9nZ2VyfSA9IHByb2plY3QucHJvamVjdFNlcnZpY2U7XG4gICAgaWYgKGxvZ2dlci5oYXNMZXZlbCh0c3Muc2VydmVyLkxvZ0xldmVsLnZlcmJvc2UpKSB7XG4gICAgICBsb2dnZXIuaW5mbyhtc2cpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kU3VpdGFibGVEZWZhdWx0TW9kdWxlKG1vZHVsZXM6IE5nQW5hbHl6ZWRNb2R1bGVzKTogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGF8dW5kZWZpbmVkIHtcbiAgbGV0IHJlc3VsdDogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGF8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBsZXQgcmVzdWx0U2l6ZSA9IDA7XG4gIGZvciAoY29uc3QgbW9kdWxlIG9mIG1vZHVsZXMubmdNb2R1bGVzKSB7XG4gICAgY29uc3QgbW9kdWxlU2l6ZSA9IG1vZHVsZS50cmFuc2l0aXZlTW9kdWxlLmRpcmVjdGl2ZXMubGVuZ3RoO1xuICAgIGlmIChtb2R1bGVTaXplID4gcmVzdWx0U2l6ZSkge1xuICAgICAgcmVzdWx0ID0gbW9kdWxlO1xuICAgICAgcmVzdWx0U2l6ZSA9IG1vZHVsZVNpemU7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHNwYW5PZihub2RlOiB0c3MuTm9kZSk6IFNwYW4ge1xuICByZXR1cm4ge3N0YXJ0OiBub2RlLmdldFN0YXJ0KCksIGVuZDogbm9kZS5nZXRFbmQoKX07XG59XG5cbmZ1bmN0aW9uIHNwYW5BdChzb3VyY2VGaWxlOiB0c3MuU291cmNlRmlsZSwgbGluZTogbnVtYmVyLCBjb2x1bW46IG51bWJlcik6IFNwYW58dW5kZWZpbmVkIHtcbiAgaWYgKGxpbmUgIT0gbnVsbCAmJiBjb2x1bW4gIT0gbnVsbCkge1xuICAgIGNvbnN0IHBvc2l0aW9uID0gdHNzLmdldFBvc2l0aW9uT2ZMaW5lQW5kQ2hhcmFjdGVyKHNvdXJjZUZpbGUsIGxpbmUsIGNvbHVtbik7XG4gICAgY29uc3QgZmluZENoaWxkID0gZnVuY3Rpb24gZmluZENoaWxkKG5vZGU6IHRzcy5Ob2RlKTogdHNzLk5vZGUgfCB1bmRlZmluZWQge1xuICAgICAgaWYgKG5vZGUua2luZCA+IHRzcy5TeW50YXhLaW5kLkxhc3RUb2tlbiAmJiBub2RlLnBvcyA8PSBwb3NpdGlvbiAmJiBub2RlLmVuZCA+IHBvc2l0aW9uKSB7XG4gICAgICAgIGNvbnN0IGJldHRlck5vZGUgPSB0c3MuZm9yRWFjaENoaWxkKG5vZGUsIGZpbmRDaGlsZCk7XG4gICAgICAgIHJldHVybiBiZXR0ZXJOb2RlIHx8IG5vZGU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG5vZGUgPSB0c3MuZm9yRWFjaENoaWxkKHNvdXJjZUZpbGUsIGZpbmRDaGlsZCk7XG4gICAgaWYgKG5vZGUpIHtcbiAgICAgIHJldHVybiB7c3RhcnQ6IG5vZGUuZ2V0U3RhcnQoKSwgZW5kOiBub2RlLmdldEVuZCgpfTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY29udmVydENoYWluKGNoYWluOiBGb3JtYXR0ZWRNZXNzYWdlQ2hhaW4pOiBEaWFnbm9zdGljTWVzc2FnZUNoYWluIHtcbiAgcmV0dXJuIHttZXNzYWdlOiBjaGFpbi5tZXNzYWdlLCBuZXh0OiBjaGFpbi5uZXh0ID8gY2hhaW4ubmV4dC5tYXAoY29udmVydENoYWluKSA6IHVuZGVmaW5lZH07XG59XG5cbmZ1bmN0aW9uIGVycm9yVG9EaWFnbm9zdGljV2l0aENoYWluKGVycm9yOiBGb3JtYXR0ZWRFcnJvciwgc3BhbjogU3Bhbik6IERlY2xhcmF0aW9uRXJyb3Ige1xuICByZXR1cm4ge21lc3NhZ2U6IGVycm9yLmNoYWluID8gY29udmVydENoYWluKGVycm9yLmNoYWluKSA6IGVycm9yLm1lc3NhZ2UsIHNwYW59O1xufVxuIl19