(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/rendering/umd_rendering_formatter", ["require", "exports", "tslib", "canonical-path", "typescript", "@angular/compiler-cli/ngcc/src/rendering/esm5_rendering_formatter", "@angular/compiler-cli/ngcc/src/rendering/utils"], factory);
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
    var canonical_path_1 = require("canonical-path");
    var ts = require("typescript");
    var esm5_rendering_formatter_1 = require("@angular/compiler-cli/ngcc/src/rendering/esm5_rendering_formatter");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/rendering/utils");
    /**
     * A RenderingFormatter that works with UMD files, instead of `import` and `export` statements
     * the module is an IIFE with a factory function call with dependencies, which are defined in a
     * wrapper function for AMD, CommonJS and global module formats.
     */
    var UmdRenderingFormatter = /** @class */ (function (_super) {
        tslib_1.__extends(UmdRenderingFormatter, _super);
        function UmdRenderingFormatter(umdHost, isCore) {
            var _this = _super.call(this, umdHost, isCore) || this;
            _this.umdHost = umdHost;
            return _this;
        }
        /**
         * Add the imports to the UMD module IIFE.
         *
         * Note that imports at "prepended" to the start of the parameter list of the factory function,
         * and so also to the arguments passed to it when it is called.
         * This is because there are scenarios where the factory function does not accept as many
         * parameters as are passed as argument in the call. For example:
         *
         * ```
         * (function (global, factory) {
         *     typeof exports === 'object' && typeof module !== 'undefined' ?
         *         factory(exports,require('x'),require('z')) :
         *     typeof define === 'function' && define.amd ?
         *         define(['exports', 'x', 'z'], factory) :
         *     (global = global || self, factory(global.myBundle = {}, global.x));
         * }(this, (function (exports, x) { ... }
         * ```
         *
         * (See that the `z` import is not being used by the factory function.)
         */
        UmdRenderingFormatter.prototype.addImports = function (output, imports, file) {
            if (imports.length === 0) {
                return;
            }
            // Assume there is only one UMD module in the file
            var umdModule = this.umdHost.getUmdModule(file);
            if (!umdModule) {
                return;
            }
            var wrapperFunction = umdModule.wrapperFn;
            // We need to add new `require()` calls for each import in the CommonJS initializer
            renderCommonJsDependencies(output, wrapperFunction, imports);
            renderAmdDependencies(output, wrapperFunction, imports);
            renderGlobalDependencies(output, wrapperFunction, imports);
            renderFactoryParameters(output, wrapperFunction, imports);
        };
        /**
         * Add the exports to the bottom of the UMD module factory function.
         */
        UmdRenderingFormatter.prototype.addExports = function (output, entryPointBasePath, exports, importManager, file) {
            var umdModule = this.umdHost.getUmdModule(file);
            if (!umdModule) {
                return;
            }
            var factoryFunction = umdModule.factoryFn;
            var lastStatement = factoryFunction.body.statements[factoryFunction.body.statements.length - 1];
            var insertionPoint = lastStatement ? lastStatement.getEnd() : factoryFunction.body.getEnd() - 1;
            exports.forEach(function (e) {
                var basePath = utils_1.stripExtension(e.from);
                var relativePath = './' + canonical_path_1.relative(canonical_path_1.dirname(entryPointBasePath), basePath);
                var namedImport = entryPointBasePath !== basePath ?
                    importManager.generateNamedImport(relativePath, e.identifier) :
                    { symbol: e.identifier, moduleImport: null };
                var importNamespace = namedImport.moduleImport ? namedImport.moduleImport + "." : '';
                var exportStr = "\nexports." + e.identifier + " = " + importNamespace + namedImport.symbol + ";";
                output.appendRight(insertionPoint, exportStr);
            });
        };
        UmdRenderingFormatter.prototype.addDirectExports = function (output, exports, importManager, file) {
            var e_1, _a;
            var umdModule = this.umdHost.getUmdModule(file);
            if (!umdModule) {
                return;
            }
            var factoryFunction = umdModule.factoryFn;
            var lastStatement = factoryFunction.body.statements[factoryFunction.body.statements.length - 1];
            var insertionPoint = lastStatement ? lastStatement.getEnd() : factoryFunction.body.getEnd() - 1;
            try {
                for (var exports_1 = tslib_1.__values(exports), exports_1_1 = exports_1.next(); !exports_1_1.done; exports_1_1 = exports_1.next()) {
                    var e = exports_1_1.value;
                    var namedImport = importManager.generateNamedImport(e.fromModule, e.symbolName);
                    var importNamespace = namedImport.moduleImport ? namedImport.moduleImport + "." : '';
                    var exportStr = "\nexports." + e.asAlias + " = " + importNamespace + namedImport.symbol + ";";
                    output.appendRight(insertionPoint, exportStr);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (exports_1_1 && !exports_1_1.done && (_a = exports_1.return)) _a.call(exports_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        /**
         * Add the constants to the top of the UMD factory function.
         */
        UmdRenderingFormatter.prototype.addConstants = function (output, constants, file) {
            if (constants === '') {
                return;
            }
            var umdModule = this.umdHost.getUmdModule(file);
            if (!umdModule) {
                return;
            }
            var factoryFunction = umdModule.factoryFn;
            var firstStatement = factoryFunction.body.statements[0];
            var insertionPoint = firstStatement ? firstStatement.getStart() : factoryFunction.body.getStart() + 1;
            output.appendLeft(insertionPoint, '\n' + constants + '\n');
        };
        return UmdRenderingFormatter;
    }(esm5_rendering_formatter_1.Esm5RenderingFormatter));
    exports.UmdRenderingFormatter = UmdRenderingFormatter;
    /**
     * Add dependencies to the CommonJS part of the UMD wrapper function.
     */
    function renderCommonJsDependencies(output, wrapperFunction, imports) {
        var conditional = find(wrapperFunction.body.statements[0], isCommonJSConditional);
        if (!conditional) {
            return;
        }
        var factoryCall = conditional.whenTrue;
        var injectionPoint = factoryCall.arguments.length > 0 ?
            // Add extra dependencies before the first argument
            factoryCall.arguments[0].getFullStart() :
            // Backup one char to account for the closing parenthesis on the call
            factoryCall.getEnd() - 1;
        var importString = imports.map(function (i) { return "require('" + i.specifier + "')"; }).join(',');
        output.appendLeft(injectionPoint, importString + (factoryCall.arguments.length > 0 ? ',' : ''));
    }
    /**
     * Add dependencies to the AMD part of the UMD wrapper function.
     */
    function renderAmdDependencies(output, wrapperFunction, imports) {
        var conditional = find(wrapperFunction.body.statements[0], isAmdConditional);
        if (!conditional) {
            return;
        }
        var amdDefineCall = conditional.whenTrue;
        var importString = imports.map(function (i) { return "'" + i.specifier + "'"; }).join(',');
        // The dependency array (if it exists) is the second to last argument
        // `define(id?, dependencies?, factory);`
        var factoryIndex = amdDefineCall.arguments.length - 1;
        var dependencyArray = amdDefineCall.arguments[factoryIndex - 1];
        if (dependencyArray === undefined || !ts.isArrayLiteralExpression(dependencyArray)) {
            // No array provided: `define(factory)` or `define(id, factory)`.
            // Insert a new array in front the `factory` call.
            var injectionPoint = amdDefineCall.arguments[factoryIndex].getFullStart();
            output.appendLeft(injectionPoint, "[" + importString + "],");
        }
        else {
            // Already an array
            var injectionPoint = dependencyArray.elements.length > 0 ?
                // Add imports before the first item.
                dependencyArray.elements[0].getFullStart() :
                // Backup one char to account for the closing square bracket on the array
                dependencyArray.getEnd() - 1;
            output.appendLeft(injectionPoint, importString + (dependencyArray.elements.length > 0 ? ',' : ''));
        }
    }
    /**
     * Add dependencies to the global part of the UMD wrapper function.
     */
    function renderGlobalDependencies(output, wrapperFunction, imports) {
        var globalFactoryCall = find(wrapperFunction.body.statements[0], isGlobalFactoryCall);
        if (!globalFactoryCall) {
            return;
        }
        var injectionPoint = globalFactoryCall.arguments.length > 0 ?
            // Add extra dependencies before the first argument
            globalFactoryCall.arguments[0].getFullStart() :
            // Backup one char to account for the closing parenthesis on the call
            globalFactoryCall.getEnd() - 1;
        var importString = imports.map(function (i) { return "global." + getGlobalIdentifier(i); }).join(',');
        output.appendLeft(injectionPoint, importString + (globalFactoryCall.arguments.length > 0 ? ',' : ''));
    }
    /**
     * Add dependency parameters to the UMD factory function.
     */
    function renderFactoryParameters(output, wrapperFunction, imports) {
        var wrapperCall = wrapperFunction.parent;
        var secondArgument = wrapperCall.arguments[1];
        if (!secondArgument) {
            return;
        }
        // Be resilient to the factory being inside parentheses
        var factoryFunction = ts.isParenthesizedExpression(secondArgument) ? secondArgument.expression : secondArgument;
        if (!ts.isFunctionExpression(factoryFunction)) {
            return;
        }
        var parameters = factoryFunction.parameters;
        var parameterString = imports.map(function (i) { return i.qualifier; }).join(',');
        if (parameters.length > 0) {
            var injectionPoint = parameters[0].getFullStart();
            output.appendLeft(injectionPoint, parameterString + ',');
        }
        else {
            // If there are no parameters then the factory function will look like:
            // function () { ... }
            // The AST does not give us a way to find the insertion point - between the two parentheses.
            // So we must use a regular expression on the text of the function.
            var injectionPoint = factoryFunction.getStart() + factoryFunction.getText().indexOf('()') + 1;
            output.appendLeft(injectionPoint, parameterString);
        }
    }
    /**
     * Is this node the CommonJS conditional expression in the UMD wrapper?
     */
    function isCommonJSConditional(value) {
        if (!ts.isConditionalExpression(value)) {
            return false;
        }
        if (!ts.isBinaryExpression(value.condition) ||
            value.condition.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken) {
            return false;
        }
        if (!oneOfBinaryConditions(value.condition, function (exp) { return isTypeOf(exp, 'exports', 'module'); })) {
            return false;
        }
        if (!ts.isCallExpression(value.whenTrue) || !ts.isIdentifier(value.whenTrue.expression)) {
            return false;
        }
        return value.whenTrue.expression.text === 'factory';
    }
    /**
     * Is this node the AMD conditional expression in the UMD wrapper?
     */
    function isAmdConditional(value) {
        if (!ts.isConditionalExpression(value)) {
            return false;
        }
        if (!ts.isBinaryExpression(value.condition) ||
            value.condition.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken) {
            return false;
        }
        if (!oneOfBinaryConditions(value.condition, function (exp) { return isTypeOf(exp, 'define'); })) {
            return false;
        }
        if (!ts.isCallExpression(value.whenTrue) || !ts.isIdentifier(value.whenTrue.expression)) {
            return false;
        }
        return value.whenTrue.expression.text === 'define';
    }
    /**
     * Is this node the call to setup the global dependencies in the UMD wrapper?
     */
    function isGlobalFactoryCall(value) {
        if (ts.isCallExpression(value) && !!value.parent) {
            // Be resilient to the value being part of a comma list
            value = isCommaExpression(value.parent) ? value.parent : value;
            // Be resilient to the value being inside parentheses
            value = ts.isParenthesizedExpression(value.parent) ? value.parent : value;
            return !!value.parent && ts.isConditionalExpression(value.parent) &&
                value.parent.whenFalse === value;
        }
        else {
            return false;
        }
    }
    function isCommaExpression(value) {
        return ts.isBinaryExpression(value) && value.operatorToken.kind === ts.SyntaxKind.CommaToken;
    }
    /**
     * Compute a global identifier for the given import (`i`).
     *
     * The identifier used to access a package when using the "global" form of a UMD bundle usually
     * follows a special format where snake-case is conveted to camelCase and path separators are
     * converted to dots. In addition there are special cases such as `@angular` is mapped to `ng`.
     *
     * For example
     *
     * * `@ns/package/entry-point` => `ns.package.entryPoint`
     * * `@angular/common/testing` => `ng.common.testing`
     * * `@angular/platform-browser-dynamic` => `ng.platformBrowserDynamic`
     *
     * It is possible for packages to specify completely different identifiers for attaching the package
     * to the global, and so there is no guaranteed way to compute this.
     * Currently, this approach appears to work for the known scenarios; also it is not known how common
     * it is to use globals for importing packages.
     *
     * If it turns out that there are packages that are being used via globals, where this approach
     * fails, we should consider implementing a configuration based solution, similar to what would go
     * in a rollup configuration for mapping import paths to global indentifiers.
     */
    function getGlobalIdentifier(i) {
        return i.specifier.replace(/^@angular\//, 'ng.')
            .replace(/^@/, '')
            .replace(/\//g, '.')
            .replace(/[-_]+(.?)/g, function (_, c) { return c.toUpperCase(); })
            .replace(/^./, function (c) { return c.toLowerCase(); });
    }
    function find(node, test) {
        return test(node) ? node : node.forEachChild(function (child) { return find(child, test); });
    }
    function oneOfBinaryConditions(node, test) {
        return test(node.left) || test(node.right);
    }
    function isTypeOf(node) {
        var types = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            types[_i - 1] = arguments[_i];
        }
        return ts.isBinaryExpression(node) && ts.isTypeOfExpression(node.left) &&
            ts.isIdentifier(node.left.expression) && types.indexOf(node.left.expression.text) !== -1;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW1kX3JlbmRlcmluZ19mb3JtYXR0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcmVuZGVyaW5nL3VtZF9yZW5kZXJpbmdfZm9ybWF0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILGlEQUFpRDtJQUNqRCwrQkFBaUM7SUFLakMsOEdBQWtFO0lBQ2xFLHdFQUF1QztJQU12Qzs7OztPQUlHO0lBQ0g7UUFBMkMsaURBQXNCO1FBQy9ELCtCQUFzQixPQUEwQixFQUFFLE1BQWU7WUFBakUsWUFBcUUsa0JBQU0sT0FBTyxFQUFFLE1BQU0sQ0FBQyxTQUFHO1lBQXhFLGFBQU8sR0FBUCxPQUFPLENBQW1COztRQUE2QyxDQUFDO1FBRTlGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBbUJHO1FBQ0gsMENBQVUsR0FBVixVQUFXLE1BQW1CLEVBQUUsT0FBaUIsRUFBRSxJQUFtQjtZQUNwRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4QixPQUFPO2FBQ1I7WUFFRCxrREFBa0Q7WUFDbEQsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDZCxPQUFPO2FBQ1I7WUFFRCxJQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO1lBRTVDLG1GQUFtRjtZQUNuRiwwQkFBMEIsQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzdELHFCQUFxQixDQUFDLE1BQU0sRUFBRSxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDeEQsd0JBQXdCLENBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMzRCx1QkFBdUIsQ0FB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SyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUMvRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtkaXJuYW1lLCByZWxhdGl2ZX0gZnJvbSAnY2Fub25pY2FsLXBhdGgnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgTWFnaWNTdHJpbmcgZnJvbSAnbWFnaWMtc3RyaW5nJztcbmltcG9ydCB7SW1wb3J0LCBJbXBvcnRNYW5hZ2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvdHJhbnNsYXRvcic7XG5pbXBvcnQge0V4cG9ydEluZm99IGZyb20gJy4uL2FuYWx5c2lzL3ByaXZhdGVfZGVjbGFyYXRpb25zX2FuYWx5emVyJztcbmltcG9ydCB7VW1kUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uL2hvc3QvdW1kX2hvc3QnO1xuaW1wb3J0IHtFc201UmVuZGVyaW5nRm9ybWF0dGVyfSBmcm9tICcuL2VzbTVfcmVuZGVyaW5nX2Zvcm1hdHRlcic7XG5pbXBvcnQge3N0cmlwRXh0ZW5zaW9ufSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7UmVleHBvcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9pbXBvcnRzJztcblxudHlwZSBDb21tb25Kc0NvbmRpdGlvbmFsID0gdHMuQ29uZGl0aW9uYWxFeHByZXNzaW9uICYge3doZW5UcnVlOiB0cy5DYWxsRXhwcmVzc2lvbn07XG50eXBlIEFtZENvbmRpdGlvbmFsID0gdHMuQ29uZGl0aW9uYWxFeHByZXNzaW9uICYge3doZW5UcnVlOiB0cy5DYWxsRXhwcmVzc2lvbn07XG5cbi8qKlxuICogQSBSZW5kZXJpbmdGb3JtYXR0ZXIgdGhhdCB3b3JrcyB3aXRoIFVNRCBmaWxlcywgaW5zdGVhZCBvZiBgaW1wb3J0YCBhbmQgYGV4cG9ydGAgc3RhdGVtZW50c1xuICogdGhlIG1vZHVsZSBpcyBhbiBJSUZFIHdpdGggYSBmYWN0b3J5IGZ1bmN0aW9uIGNhbGwgd2l0aCBkZXBlbmRlbmNpZXMsIHdoaWNoIGFyZSBkZWZpbmVkIGluIGFcbiAqIHdyYXBwZXIgZnVuY3Rpb24gZm9yIEFNRCwgQ29tbW9uSlMgYW5kIGdsb2JhbCBtb2R1bGUgZm9ybWF0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFVtZFJlbmRlcmluZ0Zvcm1hdHRlciBleHRlbmRzIEVzbTVSZW5kZXJpbmdGb3JtYXR0ZXIge1xuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgdW1kSG9zdDogVW1kUmVmbGVjdGlvbkhvc3QsIGlzQ29yZTogYm9vbGVhbikgeyBzdXBlcih1bWRIb3N0LCBpc0NvcmUpOyB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgaW1wb3J0cyB0byB0aGUgVU1EIG1vZHVsZSBJSUZFLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgaW1wb3J0cyBhdCBcInByZXBlbmRlZFwiIHRvIHRoZSBzdGFydCBvZiB0aGUgcGFyYW1ldGVyIGxpc3Qgb2YgdGhlIGZhY3RvcnkgZnVuY3Rpb24sXG4gICAqIGFuZCBzbyBhbHNvIHRvIHRoZSBhcmd1bWVudHMgcGFzc2VkIHRvIGl0IHdoZW4gaXQgaXMgY2FsbGVkLlxuICAgKiBUaGlzIGlzIGJlY2F1c2UgdGhlcmUgYXJlIHNjZW5hcmlvcyB3aGVyZSB0aGUgZmFjdG9yeSBmdW5jdGlvbiBkb2VzIG5vdCBhY2NlcHQgYXMgbWFueVxuICAgKiBwYXJhbWV0ZXJzIGFzIGFyZSBwYXNzZWQgYXMgYXJndW1lbnQgaW4gdGhlIGNhbGwuIEZvciBleGFtcGxlOlxuICAgKlxuICAgKiBgYGBcbiAgICogKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgICogICAgIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/XG4gICAqICAgICAgICAgZmFjdG9yeShleHBvcnRzLHJlcXVpcmUoJ3gnKSxyZXF1aXJlKCd6JykpIDpcbiAgICogICAgIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/XG4gICAqICAgICAgICAgZGVmaW5lKFsnZXhwb3J0cycsICd4JywgJ3onXSwgZmFjdG9yeSkgOlxuICAgKiAgICAgKGdsb2JhbCA9IGdsb2JhbCB8fCBzZWxmLCBmYWN0b3J5KGdsb2JhbC5teUJ1bmRsZSA9IHt9LCBnbG9iYWwueCkpO1xuICAgKiB9KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cywgeCkgeyAuLi4gfVxuICAgKiBgYGBcbiAgICpcbiAgICogKFNlZSB0aGF0IHRoZSBgemAgaW1wb3J0IGlzIG5vdCBiZWluZyB1c2VkIGJ5IHRoZSBmYWN0b3J5IGZ1bmN0aW9uLilcbiAgICovXG4gIGFkZEltcG9ydHMob3V0cHV0OiBNYWdpY1N0cmluZywgaW1wb3J0czogSW1wb3J0W10sIGZpbGU6IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICBpZiAoaW1wb3J0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBBc3N1bWUgdGhlcmUgaXMgb25seSBvbmUgVU1EIG1vZHVsZSBpbiB0aGUgZmlsZVxuICAgIGNvbnN0IHVtZE1vZHVsZSA9IHRoaXMudW1kSG9zdC5nZXRVbWRNb2R1bGUoZmlsZSk7XG4gICAgaWYgKCF1bWRNb2R1bGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB3cmFwcGVyRnVuY3Rpb24gPSB1bWRNb2R1bGUud3JhcHBlckZuO1xuXG4gICAgLy8gV2UgbmVlZCB0byBhZGQgbmV3IGByZXF1aXJlKClgIGNhbGxzIGZvciBlYWNoIGltcG9ydCBpbiB0aGUgQ29tbW9uSlMgaW5pdGlhbGl6ZXJcbiAgICByZW5kZXJDb21tb25Kc0RlcGVuZGVuY2llcyhvdXRwdXQsIHdyYXBwZXJGdW5jdGlvbiwgaW1wb3J0cyk7XG4gICAgcmVuZGVyQW1kRGVwZW5kZW5jaWVzKG91dHB1dCwgd3JhcHBlckZ1bmN0aW9uLCBpbXBvcnRzKTtcbiAgICByZW5kZXJHbG9iYWxEZXBlbmRlbmNpZXMob3V0cHV0LCB3cmFwcGVyRnVuY3Rpb24sIGltcG9ydHMpO1xuICAgIHJlbmRlckZhY3RvcnlQYXJhbWV0ZXJzKG91dHB1dCwgd3JhcHBlckZ1bmN0aW9uLCBpbXBvcnRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgdGhlIGV4cG9ydHMgdG8gdGhlIGJvdHRvbSBvZiB0aGUgVU1EIG1vZHVsZSBmYWN0b3J5IGZ1bmN0aW9uLlxuICAgKi9cbiAgYWRkRXhwb3J0cyhcbiAgICAgIG91dHB1dDogTWFnaWNTdHJpbmcsIGVudHJ5UG9pbnRCYXNlUGF0aDogc3RyaW5nLCBleHBvcnRzOiBFeHBvcnRJbmZvW10sXG4gICAgICBpbXBvcnRNYW5hZ2VyOiBJbXBvcnRNYW5hZ2VyLCBmaWxlOiB0cy5Tb3VyY2VGaWxlKTogdm9pZCB7XG4gICAgY29uc3QgdW1kTW9kdWxlID0gdGhpcy51bWRIb3N0LmdldFVtZE1vZHVsZShmaWxlKTtcbiAgICBpZiAoIXVtZE1vZHVsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmYWN0b3J5RnVuY3Rpb24gPSB1bWRNb2R1bGUuZmFjdG9yeUZuO1xuICAgIGNvbnN0IGxhc3RTdGF0ZW1lbnQgPVxuICAgICAgICBmYWN0b3J5RnVuY3Rpb24uYm9keS5zdGF0ZW1lbnRzW2ZhY3RvcnlGdW5jdGlvbi5ib2R5LnN0YXRlbWVudHMubGVuZ3RoIC0gMV07XG4gICAgY29uc3QgaW5zZXJ0aW9uUG9pbnQgPVxuICAgICAgICBsYXN0U3RhdGVtZW50ID8gbGFzdFN0YXRlbWVudC5nZXRFbmQoKSA6IGZhY3RvcnlGdW5jdGlvbi5ib2R5LmdldEVuZCgpIC0gMTtcbiAgICBleHBvcnRzLmZvckVhY2goZSA9PiB7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHN0cmlwRXh0ZW5zaW9uKGUuZnJvbSk7XG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSAnLi8nICsgcmVsYXRpdmUoZGlybmFtZShlbnRyeVBvaW50QmFzZVBhdGgpLCBiYXNlUGF0aCk7XG4gICAgICBjb25zdCBuYW1lZEltcG9ydCA9IGVudHJ5UG9pbnRCYXNlUGF0aCAhPT0gYmFzZVBhdGggP1xuICAgICAgICAgIGltcG9ydE1hbmFnZXIuZ2VuZXJhdGVOYW1lZEltcG9ydChyZWxhdGl2ZVBhdGgsIGUuaWRlbnRpZmllcikgOlxuICAgICAgICAgIHtzeW1ib2w6IGUuaWRlbnRpZmllciwgbW9kdWxlSW1wb3J0OiBudWxsfTtcbiAgICAgIGNvbnN0IGltcG9ydE5hbWVzcGFjZSA9IG5hbWVkSW1wb3J0Lm1vZHVsZUltcG9ydCA/IGAke25hbWVkSW1wb3J0Lm1vZHVsZUltcG9ydH0uYCA6ICcnO1xuICAgICAgY29uc3QgZXhwb3J0U3RyID0gYFxcbmV4cG9ydHMuJHtlLmlkZW50aWZpZXJ9ID0gJHtpbXBvcnROYW1lc3BhY2V9JHtuYW1lZEltcG9ydC5zeW1ib2x9O2A7XG4gICAgICBvdXRwdXQuYXBwZW5kUmlnaHQoaW5zZXJ0aW9uUG9pbnQsIGV4cG9ydFN0cik7XG4gICAgfSk7XG4gIH1cblxuICBhZGREaXJlY3RFeHBvcnRzKFxuICAgICAgb3V0cHV0OiBNYWdpY1N0cmluZywgZXhwb3J0czogUmVleHBvcnRbXSwgaW1wb3J0TWFuYWdlcjogSW1wb3J0TWFuYWdlcixcbiAgICAgIGZpbGU6IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICBjb25zdCB1bWRNb2R1bGUgPSB0aGlzLnVtZEhvc3QuZ2V0VW1kTW9kdWxlKGZpbGUpO1xuICAgIGlmICghdW1kTW9kdWxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZhY3RvcnlGdW5jdGlvbiA9IHVtZE1vZHVsZS5mYWN0b3J5Rm47XG4gICAgY29uc3QgbGFzdFN0YXRlbWVudCA9XG4gICAgICAgIGZhY3RvcnlGdW5jdGlvbi5ib2R5LnN0YXRlbWVudHNbZmFjdG9yeUZ1bmN0aW9uLmJvZHkuc3RhdGVtZW50cy5sZW5ndGggLSAxXTtcbiAgICBjb25zdCBpbnNlcnRpb25Qb2ludCA9XG4gICAgICAgIGxhc3RTdGF0ZW1lbnQgPyBsYXN0U3RhdGVtZW50LmdldEVuZCgpIDogZmFjdG9yeUZ1bmN0aW9uLmJvZHkuZ2V0RW5kKCkgLSAxO1xuICAgIGZvciAoY29uc3QgZSBvZiBleHBvcnRzKSB7XG4gICAgICBjb25zdCBuYW1lZEltcG9ydCA9IGltcG9ydE1hbmFnZXIuZ2VuZXJhdGVOYW1lZEltcG9ydChlLmZyb21Nb2R1bGUsIGUuc3ltYm9sTmFtZSk7XG4gICAgICBjb25zdCBpbXBvcnROYW1lc3BhY2UgPSBuYW1lZEltcG9ydC5tb2R1bGVJbXBvcnQgPyBgJHtuYW1lZEltcG9ydC5tb2R1bGVJbXBvcnR9LmAgOiAnJztcbiAgICAgIGNvbnN0IGV4cG9ydFN0ciA9IGBcXG5leHBvcnRzLiR7ZS5hc0FsaWFzfSA9ICR7aW1wb3J0TmFtZXNwYWNlfSR7bmFtZWRJbXBvcnQuc3ltYm9sfTtgO1xuICAgICAgb3V0cHV0LmFwcGVuZFJpZ2h0KGluc2VydGlvblBvaW50LCBleHBvcnRTdHIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgdGhlIGNvbnN0YW50cyB0byB0aGUgdG9wIG9mIHRoZSBVTUQgZmFjdG9yeSBmdW5jdGlvbi5cbiAgICovXG4gIGFkZENvbnN0YW50cyhvdXRwdXQ6IE1hZ2ljU3RyaW5nLCBjb25zdGFudHM6IHN0cmluZywgZmlsZTogdHMuU291cmNlRmlsZSk6IHZvaWQge1xuICAgIGlmIChjb25zdGFudHMgPT09ICcnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHVtZE1vZHVsZSA9IHRoaXMudW1kSG9zdC5nZXRVbWRNb2R1bGUoZmlsZSk7XG4gICAgaWYgKCF1bWRNb2R1bGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmFjdG9yeUZ1bmN0aW9uID0gdW1kTW9kdWxlLmZhY3RvcnlGbjtcbiAgICBjb25zdCBmaXJzdFN0YXRlbWVudCA9IGZhY3RvcnlGdW5jdGlvbi5ib2R5LnN0YXRlbWVudHNbMF07XG4gICAgY29uc3QgaW5zZXJ0aW9uUG9pbnQgPVxuICAgICAgICBmaXJzdFN0YXRlbWVudCA/IGZpcnN0U3RhdGVtZW50LmdldFN0YXJ0KCkgOiBmYWN0b3J5RnVuY3Rpb24uYm9keS5nZXRTdGFydCgpICsgMTtcbiAgICBvdXRwdXQuYXBwZW5kTGVmdChpbnNlcnRpb25Qb2ludCwgJ1xcbicgKyBjb25zdGFudHMgKyAnXFxuJyk7XG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgZGVwZW5kZW5jaWVzIHRvIHRoZSBDb21tb25KUyBwYXJ0IG9mIHRoZSBVTUQgd3JhcHBlciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gcmVuZGVyQ29tbW9uSnNEZXBlbmRlbmNpZXMoXG4gICAgb3V0cHV0OiBNYWdpY1N0cmluZywgd3JhcHBlckZ1bmN0aW9uOiB0cy5GdW5jdGlvbkV4cHJlc3Npb24sIGltcG9ydHM6IEltcG9ydFtdKSB7XG4gIGNvbnN0IGNvbmRpdGlvbmFsID0gZmluZCh3cmFwcGVyRnVuY3Rpb24uYm9keS5zdGF0ZW1lbnRzWzBdLCBpc0NvbW1vbkpTQ29uZGl0aW9uYWwpO1xuICBpZiAoIWNvbmRpdGlvbmFsKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGZhY3RvcnlDYWxsID0gY29uZGl0aW9uYWwud2hlblRydWU7XG4gIGNvbnN0IGluamVjdGlvblBvaW50ID0gZmFjdG9yeUNhbGwuYXJndW1lbnRzLmxlbmd0aCA+IDAgP1xuICAgICAgLy8gQWRkIGV4dHJhIGRlcGVuZGVuY2llcyBiZWZvcmUgdGhlIGZpcnN0IGFyZ3VtZW50XG4gICAgICBmYWN0b3J5Q2FsbC5hcmd1bWVudHNbMF0uZ2V0RnVsbFN0YXJ0KCkgOlxuICAgICAgLy8gQmFja3VwIG9uZSBjaGFyIHRvIGFjY291bnQgZm9yIHRoZSBjbG9zaW5nIHBhcmVudGhlc2lzIG9uIHRoZSBjYWxsXG4gICAgICBmYWN0b3J5Q2FsbC5nZXRFbmQoKSAtIDE7XG4gIGNvbnN0IGltcG9ydFN0cmluZyA9IGltcG9ydHMubWFwKGkgPT4gYHJlcXVpcmUoJyR7aS5zcGVjaWZpZXJ9JylgKS5qb2luKCcsJyk7XG4gIG91dHB1dC5hcHBlbmRMZWZ0KGluamVjdGlvblBvaW50LCBpbXBvcnRTdHJpbmcgKyAoZmFjdG9yeUNhbGwuYXJndW1lbnRzLmxlbmd0aCA+IDAgPyAnLCcgOiAnJykpO1xufVxuXG4vKipcbiAqIEFkZCBkZXBlbmRlbmNpZXMgdG8gdGhlIEFNRCBwYXJ0IG9mIHRoZSBVTUQgd3JhcHBlciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gcmVuZGVyQW1kRGVwZW5kZW5jaWVzKFxuICAgIG91dHB1dDogTWFnaWNTdHJpbmcsIHdyYXBwZXJGdW5jdGlvbjogdHMuRnVuY3Rpb25FeHByZXNzaW9uLCBpbXBvcnRzOiBJbXBvcnRbXSkge1xuICBjb25zdCBjb25kaXRpb25hbCA9IGZpbmQod3JhcHBlckZ1bmN0aW9uLmJvZHkuc3RhdGVtZW50c1swXSwgaXNBbWRDb25kaXRpb25hbCk7XG4gIGlmICghY29uZGl0aW9uYWwpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgYW1kRGVmaW5lQ2FsbCA9IGNvbmRpdGlvbmFsLndoZW5UcnVlO1xuICBjb25zdCBpbXBvcnRTdHJpbmcgPSBpbXBvcnRzLm1hcChpID0+IGAnJHtpLnNwZWNpZmllcn0nYCkuam9pbignLCcpO1xuICAvLyBUaGUgZGVwZW5kZW5jeSBhcnJheSAoaWYgaXQgZXhpc3RzKSBpcyB0aGUgc2Vjb25kIHRvIGxhc3QgYXJndW1lbnRcbiAgLy8gYGRlZmluZShpZD8sIGRlcGVuZGVuY2llcz8sIGZhY3RvcnkpO2BcbiAgY29uc3QgZmFjdG9yeUluZGV4ID0gYW1kRGVmaW5lQ2FsbC5hcmd1bWVudHMubGVuZ3RoIC0gMTtcbiAgY29uc3QgZGVwZW5kZW5jeUFycmF5ID0gYW1kRGVmaW5lQ2FsbC5hcmd1bWVudHNbZmFjdG9yeUluZGV4IC0gMV07XG4gIGlmIChkZXBlbmRlbmN5QXJyYXkgPT09IHVuZGVmaW5lZCB8fCAhdHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKGRlcGVuZGVuY3lBcnJheSkpIHtcbiAgICAvLyBObyBhcnJheSBwcm92aWRlZDogYGRlZmluZShmYWN0b3J5KWAgb3IgYGRlZmluZShpZCwgZmFjdG9yeSlgLlxuICAgIC8vIEluc2VydCBhIG5ldyBhcnJheSBpbiBmcm9udCB0aGUgYGZhY3RvcnlgIGNhbGwuXG4gICAgY29uc3QgaW5qZWN0aW9uUG9pbnQgPSBhbWREZWZpbmVDYWxsLmFyZ3VtZW50c1tmYWN0b3J5SW5kZXhdLmdldEZ1bGxTdGFydCgpO1xuICAgIG91dHB1dC5hcHBlbmRMZWZ0KGluamVjdGlvblBvaW50LCBgWyR7aW1wb3J0U3RyaW5nfV0sYCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQWxyZWFkeSBhbiBhcnJheVxuICAgIGNvbnN0IGluamVjdGlvblBvaW50ID0gZGVwZW5kZW5jeUFycmF5LmVsZW1lbnRzLmxlbmd0aCA+IDAgP1xuICAgICAgICAvLyBBZGQgaW1wb3J0cyBiZWZvcmUgdGhlIGZpcnN0IGl0ZW0uXG4gICAgICAgIGRlcGVuZGVuY3lBcnJheS5lbGVtZW50c1swXS5nZXRGdWxsU3RhcnQoKSA6XG4gICAgICAgIC8vIEJhY2t1cCBvbmUgY2hhciB0byBhY2NvdW50IGZvciB0aGUgY2xvc2luZyBzcXVhcmUgYnJhY2tldCBvbiB0aGUgYXJyYXlcbiAgICAgICAgZGVwZW5kZW5jeUFycmF5LmdldEVuZCgpIC0gMTtcbiAgICBvdXRwdXQuYXBwZW5kTGVmdChcbiAgICAgICAgaW5qZWN0aW9uUG9pbnQsIGltcG9ydFN0cmluZyArIChkZXBlbmRlbmN5QXJyYXkuZWxlbWVudHMubGVuZ3RoID4gMCA/ICcsJyA6ICcnKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgZGVwZW5kZW5jaWVzIHRvIHRoZSBnbG9iYWwgcGFydCBvZiB0aGUgVU1EIHdyYXBwZXIgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHJlbmRlckdsb2JhbERlcGVuZGVuY2llcyhcbiAgICBvdXRwdXQ6IE1hZ2ljU3RyaW5nLCB3cmFwcGVyRnVuY3Rpb246IHRzLkZ1bmN0aW9uRXhwcmVzc2lvbiwgaW1wb3J0czogSW1wb3J0W10pIHtcbiAgY29uc3QgZ2xvYmFsRmFjdG9yeUNhbGwgPSBmaW5kKHdyYXBwZXJGdW5jdGlvbi5ib2R5LnN0YXRlbWVudHNbMF0sIGlzR2xvYmFsRmFjdG9yeUNhbGwpO1xuICBpZiAoIWdsb2JhbEZhY3RvcnlDYWxsKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGluamVjdGlvblBvaW50ID0gZ2xvYmFsRmFjdG9yeUNhbGwuYXJndW1lbnRzLmxlbmd0aCA+IDAgP1xuICAgICAgLy8gQWRkIGV4dHJhIGRlcGVuZGVuY2llcyBiZWZvcmUgdGhlIGZpcnN0IGFyZ3VtZW50XG4gICAgICBnbG9iYWxGYWN0b3J5Q2FsbC5hcmd1bWVudHNbMF0uZ2V0RnVsbFN0YXJ0KCkgOlxuICAgICAgLy8gQmFja3VwIG9uZSBjaGFyIHRvIGFjY291bnQgZm9yIHRoZSBjbG9zaW5nIHBhcmVudGhlc2lzIG9uIHRoZSBjYWxsXG4gICAgICBnbG9iYWxGYWN0b3J5Q2FsbC5nZXRFbmQoKSAtIDE7XG4gIGNvbnN0IGltcG9ydFN0cmluZyA9IGltcG9ydHMubWFwKGkgPT4gYGdsb2JhbC4ke2dldEdsb2JhbElkZW50aWZpZXIoaSl9YCkuam9pbignLCcpO1xuICBvdXRwdXQuYXBwZW5kTGVmdChcbiAgICAgIGluamVjdGlvblBvaW50LCBpbXBvcnRTdHJpbmcgKyAoZ2xvYmFsRmFjdG9yeUNhbGwuYXJndW1lbnRzLmxlbmd0aCA+IDAgPyAnLCcgOiAnJykpO1xufVxuXG4vKipcbiAqIEFkZCBkZXBlbmRlbmN5IHBhcmFtZXRlcnMgdG8gdGhlIFVNRCBmYWN0b3J5IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiByZW5kZXJGYWN0b3J5UGFyYW1ldGVycyhcbiAgICBvdXRwdXQ6IE1hZ2ljU3RyaW5nLCB3cmFwcGVyRnVuY3Rpb246IHRzLkZ1bmN0aW9uRXhwcmVzc2lvbiwgaW1wb3J0czogSW1wb3J0W10pIHtcbiAgY29uc3Qgd3JhcHBlckNhbGwgPSB3cmFwcGVyRnVuY3Rpb24ucGFyZW50IGFzIHRzLkNhbGxFeHByZXNzaW9uO1xuICBjb25zdCBzZWNvbmRBcmd1bWVudCA9IHdyYXBwZXJDYWxsLmFyZ3VtZW50c1sxXTtcbiAgaWYgKCFzZWNvbmRBcmd1bWVudCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEJlIHJlc2lsaWVudCB0byB0aGUgZmFjdG9yeSBiZWluZyBpbnNpZGUgcGFyZW50aGVzZXNcbiAgY29uc3QgZmFjdG9yeUZ1bmN0aW9uID1cbiAgICAgIHRzLmlzUGFyZW50aGVzaXplZEV4cHJlc3Npb24oc2Vjb25kQXJndW1lbnQpID8gc2Vjb25kQXJndW1lbnQuZXhwcmVzc2lvbiA6IHNlY29uZEFyZ3VtZW50O1xuICBpZiAoIXRzLmlzRnVuY3Rpb25FeHByZXNzaW9uKGZhY3RvcnlGdW5jdGlvbikpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBwYXJhbWV0ZXJzID0gZmFjdG9yeUZ1bmN0aW9uLnBhcmFtZXRlcnM7XG4gIGNvbnN0IHBhcmFtZXRlclN0cmluZyA9IGltcG9ydHMubWFwKGkgPT4gaS5xdWFsaWZpZXIpLmpvaW4oJywnKTtcbiAgaWYgKHBhcmFtZXRlcnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGluamVjdGlvblBvaW50ID0gcGFyYW1ldGVyc1swXS5nZXRGdWxsU3RhcnQoKTtcbiAgICBvdXRwdXQuYXBwZW5kTGVmdChpbmplY3Rpb25Qb2ludCwgcGFyYW1ldGVyU3RyaW5nICsgJywnKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBJZiB0aGVyZSBhcmUgbm8gcGFyYW1ldGVycyB0aGVuIHRoZSBmYWN0b3J5IGZ1bmN0aW9uIHdpbGwgbG9vayBsaWtlOlxuICAgIC8vIGZ1bmN0aW9uICgpIHsgLi4uIH1cbiAgICAvLyBUaGUgQVNUIGRvZXMgbm90IGdpdmUgdXMgYSB3YXkgdG8gZmluZCB0aGUgaW5zZXJ0aW9uIHBvaW50IC0gYmV0d2VlbiB0aGUgdHdvIHBhcmVudGhlc2VzLlxuICAgIC8vIFNvIHdlIG11c3QgdXNlIGEgcmVndWxhciBleHByZXNzaW9uIG9uIHRoZSB0ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAgICBjb25zdCBpbmplY3Rpb25Qb2ludCA9IGZhY3RvcnlGdW5jdGlvbi5nZXRTdGFydCgpICsgZmFjdG9yeUZ1bmN0aW9uLmdldFRleHQoKS5pbmRleE9mKCcoKScpICsgMTtcbiAgICBvdXRwdXQuYXBwZW5kTGVmdChpbmplY3Rpb25Qb2ludCwgcGFyYW1ldGVyU3RyaW5nKTtcbiAgfVxufVxuXG4vKipcbiAqIElzIHRoaXMgbm9kZSB0aGUgQ29tbW9uSlMgY29uZGl0aW9uYWwgZXhwcmVzc2lvbiBpbiB0aGUgVU1EIHdyYXBwZXI/XG4gKi9cbmZ1bmN0aW9uIGlzQ29tbW9uSlNDb25kaXRpb25hbCh2YWx1ZTogdHMuTm9kZSk6IHZhbHVlIGlzIENvbW1vbkpzQ29uZGl0aW9uYWwge1xuICBpZiAoIXRzLmlzQ29uZGl0aW9uYWxFeHByZXNzaW9uKHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoIXRzLmlzQmluYXJ5RXhwcmVzc2lvbih2YWx1ZS5jb25kaXRpb24pIHx8XG4gICAgICB2YWx1ZS5jb25kaXRpb24ub3BlcmF0b3JUb2tlbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLkFtcGVyc2FuZEFtcGVyc2FuZFRva2VuKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICghb25lT2ZCaW5hcnlDb25kaXRpb25zKHZhbHVlLmNvbmRpdGlvbiwgKGV4cCkgPT4gaXNUeXBlT2YoZXhwLCAnZXhwb3J0cycsICdtb2R1bGUnKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKCF0cy5pc0NhbGxFeHByZXNzaW9uKHZhbHVlLndoZW5UcnVlKSB8fCAhdHMuaXNJZGVudGlmaWVyKHZhbHVlLndoZW5UcnVlLmV4cHJlc3Npb24pKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB2YWx1ZS53aGVuVHJ1ZS5leHByZXNzaW9uLnRleHQgPT09ICdmYWN0b3J5Jztcbn1cblxuLyoqXG4gKiBJcyB0aGlzIG5vZGUgdGhlIEFNRCBjb25kaXRpb25hbCBleHByZXNzaW9uIGluIHRoZSBVTUQgd3JhcHBlcj9cbiAqL1xuZnVuY3Rpb24gaXNBbWRDb25kaXRpb25hbCh2YWx1ZTogdHMuTm9kZSk6IHZhbHVlIGlzIEFtZENvbmRpdGlvbmFsIHtcbiAgaWYgKCF0cy5pc0NvbmRpdGlvbmFsRXhwcmVzc2lvbih2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKCF0cy5pc0JpbmFyeUV4cHJlc3Npb24odmFsdWUuY29uZGl0aW9uKSB8fFxuICAgICAgdmFsdWUuY29uZGl0aW9uLm9wZXJhdG9yVG9rZW4ua2luZCAhPT0gdHMuU3ludGF4S2luZC5BbXBlcnNhbmRBbXBlcnNhbmRUb2tlbikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoIW9uZU9mQmluYXJ5Q29uZGl0aW9ucyh2YWx1ZS5jb25kaXRpb24sIChleHApID0+IGlzVHlwZU9mKGV4cCwgJ2RlZmluZScpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoIXRzLmlzQ2FsbEV4cHJlc3Npb24odmFsdWUud2hlblRydWUpIHx8ICF0cy5pc0lkZW50aWZpZXIodmFsdWUud2hlblRydWUuZXhwcmVzc2lvbikpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHZhbHVlLndoZW5UcnVlLmV4cHJlc3Npb24udGV4dCA9PT0gJ2RlZmluZSc7XG59XG5cbi8qKlxuICogSXMgdGhpcyBub2RlIHRoZSBjYWxsIHRvIHNldHVwIHRoZSBnbG9iYWwgZGVwZW5kZW5jaWVzIGluIHRoZSBVTUQgd3JhcHBlcj9cbiAqL1xuZnVuY3Rpb24gaXNHbG9iYWxGYWN0b3J5Q2FsbCh2YWx1ZTogdHMuTm9kZSk6IHZhbHVlIGlzIHRzLkNhbGxFeHByZXNzaW9uIHtcbiAgaWYgKHRzLmlzQ2FsbEV4cHJlc3Npb24odmFsdWUpICYmICEhdmFsdWUucGFyZW50KSB7XG4gICAgLy8gQmUgcmVzaWxpZW50IHRvIHRoZSB2YWx1ZSBiZWluZyBwYXJ0IG9mIGEgY29tbWEgbGlzdFxuICAgIHZhbHVlID0gaXNDb21tYUV4cHJlc3Npb24odmFsdWUucGFyZW50KSA/IHZhbHVlLnBhcmVudCA6IHZhbHVlO1xuICAgIC8vIEJlIHJlc2lsaWVudCB0byB0aGUgdmFsdWUgYmVpbmcgaW5zaWRlIHBhcmVudGhlc2VzXG4gICAgdmFsdWUgPSB0cy5pc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uKHZhbHVlLnBhcmVudCkgPyB2YWx1ZS5wYXJlbnQgOiB2YWx1ZTtcbiAgICByZXR1cm4gISF2YWx1ZS5wYXJlbnQgJiYgdHMuaXNDb25kaXRpb25hbEV4cHJlc3Npb24odmFsdWUucGFyZW50KSAmJlxuICAgICAgICB2YWx1ZS5wYXJlbnQud2hlbkZhbHNlID09PSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNDb21tYUV4cHJlc3Npb24odmFsdWU6IHRzLk5vZGUpOiB2YWx1ZSBpcyB0cy5CaW5hcnlFeHByZXNzaW9uIHtcbiAgcmV0dXJuIHRzLmlzQmluYXJ5RXhwcmVzc2lvbih2YWx1ZSkgJiYgdmFsdWUub3BlcmF0b3JUb2tlbi5raW5kID09PSB0cy5TeW50YXhLaW5kLkNvbW1hVG9rZW47XG59XG5cbi8qKlxuICogQ29tcHV0ZSBhIGdsb2JhbCBpZGVudGlmaWVyIGZvciB0aGUgZ2l2ZW4gaW1wb3J0IChgaWApLlxuICpcbiAqIFRoZSBpZGVudGlmaWVyIHVzZWQgdG8gYWNjZXNzIGEgcGFja2FnZSB3aGVuIHVzaW5nIHRoZSBcImdsb2JhbFwiIGZvcm0gb2YgYSBVTUQgYnVuZGxlIHVzdWFsbHlcbiAqIGZvbGxvd3MgYSBzcGVjaWFsIGZvcm1hdCB3aGVyZSBzbmFrZS1jYXNlIGlzIGNvbnZldGVkIHRvIGNhbWVsQ2FzZSBhbmQgcGF0aCBzZXBhcmF0b3JzIGFyZVxuICogY29udmVydGVkIHRvIGRvdHMuIEluIGFkZGl0aW9uIHRoZXJlIGFyZSBzcGVjaWFsIGNhc2VzIHN1Y2ggYXMgYEBhbmd1bGFyYCBpcyBtYXBwZWQgdG8gYG5nYC5cbiAqXG4gKiBGb3IgZXhhbXBsZVxuICpcbiAqICogYEBucy9wYWNrYWdlL2VudHJ5LXBvaW50YCA9PiBgbnMucGFja2FnZS5lbnRyeVBvaW50YFxuICogKiBgQGFuZ3VsYXIvY29tbW9uL3Rlc3RpbmdgID0+IGBuZy5jb21tb24udGVzdGluZ2BcbiAqICogYEBhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXItZHluYW1pY2AgPT4gYG5nLnBsYXRmb3JtQnJvd3NlckR5bmFtaWNgXG4gKlxuICogSXQgaXMgcG9zc2libGUgZm9yIHBhY2thZ2VzIHRvIHNwZWNpZnkgY29tcGxldGVseSBkaWZmZXJlbnQgaWRlbnRpZmllcnMgZm9yIGF0dGFjaGluZyB0aGUgcGFja2FnZVxuICogdG8gdGhlIGdsb2JhbCwgYW5kIHNvIHRoZXJlIGlzIG5vIGd1YXJhbnRlZWQgd2F5IHRvIGNvbXB1dGUgdGhpcy5cbiAqIEN1cnJlbnRseSwgdGhpcyBhcHByb2FjaCBhcHBlYXJzIHRvIHdvcmsgZm9yIHRoZSBrbm93biBzY2VuYXJpb3M7IGFsc28gaXQgaXMgbm90IGtub3duIGhvdyBjb21tb25cbiAqIGl0IGlzIHRvIHVzZSBnbG9iYWxzIGZvciBpbXBvcnRpbmcgcGFja2FnZXMuXG4gKlxuICogSWYgaXQgdHVybnMgb3V0IHRoYXQgdGhlcmUgYXJlIHBhY2thZ2VzIHRoYXQgYXJlIGJlaW5nIHVzZWQgdmlhIGdsb2JhbHMsIHdoZXJlIHRoaXMgYXBwcm9hY2hcbiAqIGZhaWxzLCB3ZSBzaG91bGQgY29uc2lkZXIgaW1wbGVtZW50aW5nIGEgY29uZmlndXJhdGlvbiBiYXNlZCBzb2x1dGlvbiwgc2ltaWxhciB0byB3aGF0IHdvdWxkIGdvXG4gKiBpbiBhIHJvbGx1cCBjb25maWd1cmF0aW9uIGZvciBtYXBwaW5nIGltcG9ydCBwYXRocyB0byBnbG9iYWwgaW5kZW50aWZpZXJzLlxuICovXG5mdW5jdGlvbiBnZXRHbG9iYWxJZGVudGlmaWVyKGk6IEltcG9ydCk6IHN0cmluZyB7XG4gIHJldHVybiBpLnNwZWNpZmllci5yZXBsYWNlKC9eQGFuZ3VsYXJcXC8vLCAnbmcuJylcbiAgICAgIC5yZXBsYWNlKC9eQC8sICcnKVxuICAgICAgLnJlcGxhY2UoL1xcLy9nLCAnLicpXG4gICAgICAucmVwbGFjZSgvWy1fXSsoLj8pL2csIChfLCBjKSA9PiBjLnRvVXBwZXJDYXNlKCkpXG4gICAgICAucmVwbGFjZSgvXi4vLCBjID0+IGMudG9Mb3dlckNhc2UoKSk7XG59XG5cbmZ1bmN0aW9uIGZpbmQ8VD4obm9kZTogdHMuTm9kZSwgdGVzdDogKG5vZGU6IHRzLk5vZGUpID0+IG5vZGUgaXMgdHMuTm9kZSAmIFQpOiBUfHVuZGVmaW5lZCB7XG4gIHJldHVybiB0ZXN0KG5vZGUpID8gbm9kZSA6IG5vZGUuZm9yRWFjaENoaWxkKGNoaWxkID0+IGZpbmQ8VD4oY2hpbGQsIHRlc3QpKTtcbn1cblxuZnVuY3Rpb24gb25lT2ZCaW5hcnlDb25kaXRpb25zKFxuICAgIG5vZGU6IHRzLkJpbmFyeUV4cHJlc3Npb24sIHRlc3Q6IChleHByZXNzaW9uOiB0cy5FeHByZXNzaW9uKSA9PiBib29sZWFuKSB7XG4gIHJldHVybiB0ZXN0KG5vZGUubGVmdCkgfHwgdGVzdChub2RlLnJpZ2h0KTtcbn1cblxuZnVuY3Rpb24gaXNUeXBlT2Yobm9kZTogdHMuRXhwcmVzc2lvbiwgLi4udHlwZXM6IHN0cmluZ1tdKTogYm9vbGVhbiB7XG4gIHJldHVybiB0cy5pc0JpbmFyeUV4cHJlc3Npb24obm9kZSkgJiYgdHMuaXNUeXBlT2ZFeHByZXNzaW9uKG5vZGUubGVmdCkgJiZcbiAgICAgIHRzLmlzSWRlbnRpZmllcihub2RlLmxlZnQuZXhwcmVzc2lvbikgJiYgdHlwZXMuaW5kZXhPZihub2RlLmxlZnQuZXhwcmVzc2lvbi50ZXh0KSAhPT0gLTE7XG59XG4iXX0=