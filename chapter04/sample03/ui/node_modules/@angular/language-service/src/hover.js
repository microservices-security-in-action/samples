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
        define("@angular/language-service/src/hover", ["require", "exports", "tslib", "typescript", "@angular/language-service/src/locate_symbol", "@angular/language-service/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var locate_symbol_1 = require("@angular/language-service/src/locate_symbol");
    var utils_1 = require("@angular/language-service/src/utils");
    // Reverse mappings of enum would generate strings
    var SYMBOL_SPACE = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.space];
    var SYMBOL_PUNC = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.punctuation];
    var SYMBOL_TEXT = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.text];
    var SYMBOL_INTERFACE = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.interfaceName];
    /**
     * Traverse the template AST and look for the symbol located at `position`, then
     * return the corresponding quick info.
     * @param info template AST
     * @param position location of the symbol
     * @param analyzedModules all NgModules in the program.
     */
    function getTemplateHover(info, position, analyzedModules) {
        var _a, _b, _c;
        var symbolInfo = locate_symbol_1.locateSymbols(info, position)[0];
        if (!symbolInfo) {
            return;
        }
        var symbol = symbolInfo.symbol, span = symbolInfo.span, staticSymbol = symbolInfo.staticSymbol;
        // The container is either the symbol's container (for example, 'AppComponent'
        // is the container of the symbol 'title' in its template) or the NgModule
        // that the directive belongs to (the container of AppComponent is AppModule).
        var containerName = (_a = symbol.container) === null || _a === void 0 ? void 0 : _a.name;
        if (!containerName && staticSymbol) {
            // If there is a static symbol then the target is a directive.
            var ngModule = analyzedModules.ngModuleByPipeOrDirective.get(staticSymbol);
            containerName = (_b = ngModule) === null || _b === void 0 ? void 0 : _b.type.reference.name;
        }
        return createQuickInfo(symbol.name, symbol.kind, span, containerName, (_c = symbol.type) === null || _c === void 0 ? void 0 : _c.name, symbol.documentation);
    }
    exports.getTemplateHover = getTemplateHover;
    /**
     * Get quick info for Angular semantic entities in TypeScript files, like Directives.
     * @param position location of the symbol in the source file
     * @param declarations All Directive-like declarations in the source file.
     * @param analyzedModules all NgModules in the program.
     */
    function getTsHover(position, declarations, analyzedModules) {
        var e_1, _a;
        var _b;
        try {
            for (var declarations_1 = tslib_1.__values(declarations), declarations_1_1 = declarations_1.next(); !declarations_1_1.done; declarations_1_1 = declarations_1.next()) {
                var _c = declarations_1_1.value, declarationSpan = _c.declarationSpan, metadata = _c.metadata;
                if (utils_1.inSpan(position, declarationSpan)) {
                    var staticSymbol = metadata.type.reference;
                    var directiveName = staticSymbol.name;
                    var kind = metadata.isComponent ? 'component' : 'directive';
                    var textSpan = ts.createTextSpanFromBounds(declarationSpan.start, declarationSpan.end);
                    var ngModule = analyzedModules.ngModuleByPipeOrDirective.get(staticSymbol);
                    var moduleName = (_b = ngModule) === null || _b === void 0 ? void 0 : _b.type.reference.name;
                    return createQuickInfo(directiveName, kind, textSpan, moduleName, ts.ScriptElementKind.classElement);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (declarations_1_1 && !declarations_1_1.done && (_a = declarations_1.return)) _a.call(declarations_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    exports.getTsHover = getTsHover;
    /**
     * Construct a QuickInfo object taking into account its container and type.
     * @param name Name of the QuickInfo target
     * @param kind component, directive, pipe, etc.
     * @param textSpan span of the target
     * @param containerName either the Symbol's container or the NgModule that contains the directive
     * @param type user-friendly name of the type
     * @param documentation docstring or comment
     */
    function createQuickInfo(name, kind, textSpan, containerName, type, documentation) {
        var containerDisplayParts = containerName ?
            [
                { text: containerName, kind: SYMBOL_INTERFACE },
                { text: '.', kind: SYMBOL_PUNC },
            ] :
            [];
        var typeDisplayParts = type ?
            [
                { text: ':', kind: SYMBOL_PUNC },
                { text: ' ', kind: SYMBOL_SPACE },
                { text: type, kind: SYMBOL_INTERFACE },
            ] :
            [];
        return {
            kind: kind,
            kindModifiers: ts.ScriptElementKindModifier.none,
            textSpan: textSpan,
            displayParts: tslib_1.__spread([
                { text: '(', kind: SYMBOL_PUNC },
                { text: kind, kind: SYMBOL_TEXT },
                { text: ')', kind: SYMBOL_PUNC },
                { text: ' ', kind: SYMBOL_SPACE }
            ], containerDisplayParts, [
                { text: name, kind: SYMBOL_INTERFACE }
            ], typeDisplayParts),
            documentation: documentation,
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG92ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9sYW5ndWFnZS1zZXJ2aWNlL3NyYy9ob3Zlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFHSCwrQkFBaUM7SUFFakMsNkVBQThDO0lBRTlDLDZEQUErQjtJQUUvQixrREFBa0Q7SUFDbEQsSUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5RSxJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25GLElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUUsSUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRTFGOzs7Ozs7T0FNRztJQUNILFNBQWdCLGdCQUFnQixDQUM1QixJQUFlLEVBQUUsUUFBZ0IsRUFBRSxlQUFrQzs7UUFDdkUsSUFBTSxVQUFVLEdBQUcsNkJBQWEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNmLE9BQU87U0FDUjtRQUNNLElBQUEsMEJBQU0sRUFBRSxzQkFBSSxFQUFFLHNDQUFZLENBQWU7UUFFaEQsOEVBQThFO1FBQzlFLDBFQUEwRTtRQUMxRSw4RUFBOEU7UUFDOUUsSUFBSSxhQUFhLFNBQXFCLE1BQU0sQ0FBQyxTQUFTLDBDQUFHLElBQUksQ0FBQztRQUM5RCxJQUFJLENBQUMsYUFBYSxJQUFJLFlBQVksRUFBRTtZQUNsQyw4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QUUsV0FBVyxFQUFDO2dCQUM5QixFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQztlQUM1QixxQkFBcUI7Z0JBQ3hCLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7ZUFDakMsZ0JBQWdCLENBQ3BCO1lBQ0QsYUFBYSxlQUFBO1NBQ2QsQ0FBQztJQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdBbmFseXplZE1vZHVsZXN9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtBc3RSZXN1bHR9IGZyb20gJy4vY29tbW9uJztcbmltcG9ydCB7bG9jYXRlU3ltYm9sc30gZnJvbSAnLi9sb2NhdGVfc3ltYm9sJztcbmltcG9ydCAqIGFzIG5nIGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHtpblNwYW59IGZyb20gJy4vdXRpbHMnO1xuXG4vLyBSZXZlcnNlIG1hcHBpbmdzIG9mIGVudW0gd291bGQgZ2VuZXJhdGUgc3RyaW5nc1xuY29uc3QgU1lNQk9MX1NQQUNFID0gdHMuU3ltYm9sRGlzcGxheVBhcnRLaW5kW3RzLlN5bWJvbERpc3BsYXlQYXJ0S2luZC5zcGFjZV07XG5jb25zdCBTWU1CT0xfUFVOQyA9IHRzLlN5bWJvbERpc3BsYXlQYXJ0S2luZFt0cy5TeW1ib2xEaXNwbGF5UGFydEtpbmQucHVuY3R1YXRpb25dO1xuY29uc3QgU1lNQk9MX1RFWFQgPSB0cy5TeW1ib2xEaXNwbGF5UGFydEtpbmRbdHMuU3ltYm9sRGlzcGxheVBhcnRLaW5kLnRleHRdO1xuY29uc3QgU1lNQk9MX0lOVEVSRkFDRSA9IHRzLlN5bWJvbERpc3BsYXlQYXJ0S2luZFt0cy5TeW1ib2xEaXNwbGF5UGFydEtpbmQuaW50ZXJmYWNlTmFtZV07XG5cbi8qKlxuICogVHJhdmVyc2UgdGhlIHRlbXBsYXRlIEFTVCBhbmQgbG9vayBmb3IgdGhlIHN5bWJvbCBsb2NhdGVkIGF0IGBwb3NpdGlvbmAsIHRoZW5cbiAqIHJldHVybiB0aGUgY29ycmVzcG9uZGluZyBxdWljayBpbmZvLlxuICogQHBhcmFtIGluZm8gdGVtcGxhdGUgQVNUXG4gKiBAcGFyYW0gcG9zaXRpb24gbG9jYXRpb24gb2YgdGhlIHN5bWJvbFxuICogQHBhcmFtIGFuYWx5emVkTW9kdWxlcyBhbGwgTmdNb2R1bGVzIGluIHRoZSBwcm9ncmFtLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVtcGxhdGVIb3ZlcihcbiAgICBpbmZvOiBBc3RSZXN1bHQsIHBvc2l0aW9uOiBudW1iZXIsIGFuYWx5emVkTW9kdWxlczogTmdBbmFseXplZE1vZHVsZXMpOiB0cy5RdWlja0luZm98dW5kZWZpbmVkIHtcbiAgY29uc3Qgc3ltYm9sSW5mbyA9IGxvY2F0ZVN5bWJvbHMoaW5mbywgcG9zaXRpb24pWzBdO1xuICBpZiAoIXN5bWJvbEluZm8pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3Qge3N5bWJvbCwgc3Bhbiwgc3RhdGljU3ltYm9sfSA9IHN5bWJvbEluZm87XG5cbiAgLy8gVGhlIGNvbnRhaW5lciBpcyBlaXRoZXIgdGhlIHN5bWJvbCdzIGNvbnRhaW5lciAoZm9yIGV4YW1wbGUsICdBcHBDb21wb25lbnQnXG4gIC8vIGlzIHRoZSBjb250YWluZXIgb2YgdGhlIHN5bWJvbCAndGl0bGUnIGluIGl0cyB0ZW1wbGF0ZSkgb3IgdGhlIE5nTW9kdWxlXG4gIC8vIHRoYXQgdGhlIGRpcmVjdGl2ZSBiZWxvbmdzIHRvICh0aGUgY29udGFpbmVyIG9mIEFwcENvbXBvbmVudCBpcyBBcHBNb2R1bGUpLlxuICBsZXQgY29udGFpbmVyTmFtZTogc3RyaW5nfHVuZGVmaW5lZCA9IHN5bWJvbC5jb250YWluZXIgPy5uYW1lO1xuICBpZiAoIWNvbnRhaW5lck5hbWUgJiYgc3RhdGljU3ltYm9sKSB7XG4gICAgLy8gSWYgdGhlcmUgaXMgYSBzdGF0aWMgc3ltYm9sIHRoZW4gdGhlIHRhcmdldCBpcyBhIGRpcmVjdGl2ZS5cbiAgICBjb25zdCBuZ01vZHVsZSA9IGFuYWx5emVkTW9kdWxlcy5uZ01vZHVsZUJ5UGlwZU9yRGlyZWN0aXZlLmdldChzdGF0aWNTeW1ib2wpO1xuICAgIGNvbnRhaW5lck5hbWUgPSBuZ01vZHVsZSA/LnR5cGUucmVmZXJlbmNlLm5hbWU7XG4gIH1cblxuICByZXR1cm4gY3JlYXRlUXVpY2tJbmZvKHN5bWJvbC5uYW1lLCBzeW1ib2wua2luZCwgc3BhbiwgY29udGFpbmVyTmFtZSwgc3ltYm9sLnR5cGU/Lm5hbWUsIHN5bWJvbC5kb2N1bWVudGF0aW9uKTtcbn1cblxuLyoqXG4gKiBHZXQgcXVpY2sgaW5mbyBmb3IgQW5ndWxhciBzZW1hbnRpYyBlbnRpdGllcyBpbiBUeXBlU2NyaXB0IGZpbGVzLCBsaWtlIERpcmVjdGl2ZXMuXG4gKiBAcGFyYW0gcG9zaXRpb24gbG9jYXRpb24gb2YgdGhlIHN5bWJvbCBpbiB0aGUgc291cmNlIGZpbGVcbiAqIEBwYXJhbSBkZWNsYXJhdGlvbnMgQWxsIERpcmVjdGl2ZS1saWtlIGRlY2xhcmF0aW9ucyBpbiB0aGUgc291cmNlIGZpbGUuXG4gKiBAcGFyYW0gYW5hbHl6ZWRNb2R1bGVzIGFsbCBOZ01vZHVsZXMgaW4gdGhlIHByb2dyYW0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUc0hvdmVyKFxuICAgIHBvc2l0aW9uOiBudW1iZXIsIGRlY2xhcmF0aW9uczogbmcuRGVjbGFyYXRpb25bXSxcbiAgICBhbmFseXplZE1vZHVsZXM6IE5nQW5hbHl6ZWRNb2R1bGVzKTogdHMuUXVpY2tJbmZvfHVuZGVmaW5lZCB7XG4gIGZvciAoY29uc3Qge2RlY2xhcmF0aW9uU3BhbiwgbWV0YWRhdGF9IG9mIGRlY2xhcmF0aW9ucykge1xuICAgIGlmIChpblNwYW4ocG9zaXRpb24sIGRlY2xhcmF0aW9uU3BhbikpIHtcbiAgICAgIGNvbnN0IHN0YXRpY1N5bWJvbDogbmcuU3RhdGljU3ltYm9sID0gbWV0YWRhdGEudHlwZS5yZWZlcmVuY2U7XG4gICAgICBjb25zdCBkaXJlY3RpdmVOYW1lID0gc3RhdGljU3ltYm9sLm5hbWU7XG4gICAgICBjb25zdCBraW5kID0gbWV0YWRhdGEuaXNDb21wb25lbnQgPyAnY29tcG9uZW50JyA6ICdkaXJlY3RpdmUnO1xuICAgICAgY29uc3QgdGV4dFNwYW4gPSB0cy5jcmVhdGVUZXh0U3BhbkZyb21Cb3VuZHMoZGVjbGFyYXRpb25TcGFuLnN0YXJ0LCBkZWNsYXJhdGlvblNwYW4uZW5kKTtcbiAgICAgIGNvbnN0IG5nTW9kdWxlID0gYW5hbHl6ZWRNb2R1bGVzLm5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUuZ2V0KHN0YXRpY1N5bWJvbCk7XG4gICAgICBjb25zdCBtb2R1bGVOYW1lID0gbmdNb2R1bGUgPy50eXBlLnJlZmVyZW5jZS5uYW1lO1xuICAgICAgcmV0dXJuIGNyZWF0ZVF1aWNrSW5mbyhcbiAgICAgICAgICBkaXJlY3RpdmVOYW1lLCBraW5kLCB0ZXh0U3BhbiwgbW9kdWxlTmFtZSwgdHMuU2NyaXB0RWxlbWVudEtpbmQuY2xhc3NFbGVtZW50KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3QgYSBRdWlja0luZm8gb2JqZWN0IHRha2luZyBpbnRvIGFjY291bnQgaXRzIGNvbnRhaW5lciBhbmQgdHlwZS5cbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIFF1aWNrSW5mbyB0YXJnZXRcbiAqIEBwYXJhbSBraW5kIGNvbXBvbmVudCwgZGlyZWN0aXZlLCBwaXBlLCBldGMuXG4gKiBAcGFyYW0gdGV4dFNwYW4gc3BhbiBvZiB0aGUgdGFyZ2V0XG4gKiBAcGFyYW0gY29udGFpbmVyTmFtZSBlaXRoZXIgdGhlIFN5bWJvbCdzIGNvbnRhaW5lciBvciB0aGUgTmdNb2R1bGUgdGhhdCBjb250YWlucyB0aGUgZGlyZWN0aXZlXG4gKiBAcGFyYW0gdHlwZSB1c2VyLWZyaWVuZGx5IG5hbWUgb2YgdGhlIHR5cGVcbiAqIEBwYXJhbSBkb2N1bWVudGF0aW9uIGRvY3N0cmluZyBvciBjb21tZW50XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVF1aWNrSW5mbyhcbiAgICBuYW1lOiBzdHJpbmcsIGtpbmQ6IHN0cmluZywgdGV4dFNwYW46IHRzLlRleHRTcGFuLCBjb250YWluZXJOYW1lPzogc3RyaW5nLCB0eXBlPzogc3RyaW5nLFxuICAgIGRvY3VtZW50YXRpb24/OiB0cy5TeW1ib2xEaXNwbGF5UGFydFtdKTogdHMuUXVpY2tJbmZvIHtcbiAgY29uc3QgY29udGFpbmVyRGlzcGxheVBhcnRzID0gY29udGFpbmVyTmFtZSA/XG4gICAgICBbXG4gICAgICAgIHt0ZXh0OiBjb250YWluZXJOYW1lLCBraW5kOiBTWU1CT0xfSU5URVJGQUNFfSxcbiAgICAgICAge3RleHQ6ICcuJywga2luZDogU1lNQk9MX1BVTkN9LFxuICAgICAgXSA6XG4gICAgICBbXTtcblxuICBjb25zdCB0eXBlRGlzcGxheVBhcnRzID0gdHlwZSA/XG4gICAgICBbXG4gICAgICAgIHt0ZXh0OiAnOicsIGtpbmQ6IFNZTUJPTF9QVU5DfSxcbiAgICAgICAge3RleHQ6ICcgJywga2luZDogU1lNQk9MX1NQQUNFfSxcbiAgICAgICAge3RleHQ6IHR5cGUsIGtpbmQ6IFNZTUJPTF9JTlRFUkZBQ0V9LFxuICAgICAgXSA6XG4gICAgICBbXTtcblxuICByZXR1cm4ge1xuICAgIGtpbmQ6IGtpbmQgYXMgdHMuU2NyaXB0RWxlbWVudEtpbmQsXG4gICAga2luZE1vZGlmaWVyczogdHMuU2NyaXB0RWxlbWVudEtpbmRNb2RpZmllci5ub25lLFxuICAgIHRleHRTcGFuOiB0ZXh0U3BhbixcbiAgICBkaXNwbGF5UGFydHM6IFtcbiAgICAgIHt0ZXh0OiAnKCcsIGtpbmQ6IFNZTUJPTF9QVU5DfSxcbiAgICAgIHt0ZXh0OiBraW5kLCBraW5kOiBTWU1CT0xfVEVYVH0sXG4gICAgICB7dGV4dDogJyknLCBraW5kOiBTWU1CT0xfUFVOQ30sXG4gICAgICB7dGV4dDogJyAnLCBraW5kOiBTWU1CT0xfU1BBQ0V9LFxuICAgICAgLi4uY29udGFpbmVyRGlzcGxheVBhcnRzLFxuICAgICAge3RleHQ6IG5hbWUsIGtpbmQ6IFNZTUJPTF9JTlRFUkZBQ0V9LFxuICAgICAgLi4udHlwZURpc3BsYXlQYXJ0cyxcbiAgICBdLFxuICAgIGRvY3VtZW50YXRpb24sXG4gIH07XG59XG4iXX0=