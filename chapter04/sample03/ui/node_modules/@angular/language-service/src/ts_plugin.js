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
        define("@angular/language-service/src/ts_plugin", ["require", "exports", "tslib", "@angular/language-service/src/language_service", "@angular/language-service/src/typescript_host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var language_service_1 = require("@angular/language-service/src/language_service");
    var typescript_host_1 = require("@angular/language-service/src/typescript_host");
    function create(info) {
        var tsLS = info.languageService, tsLSHost = info.languageServiceHost, config = info.config;
        // This plugin could operate under two different modes:
        // 1. TS + Angular
        //    Plugin augments TS language service to provide additional Angular
        //    information. This only works with inline templates and is meant to be
        //    used as a local plugin (configured via tsconfig.json)
        // 2. Angular only
        //    Plugin only provides information on Angular templates, no TS info at all.
        //    This effectively disables native TS features and is meant for internal
        //    use only.
        var angularOnly = config ? config.angularOnly === true : false;
        var ngLSHost = new typescript_host_1.TypeScriptServiceHost(tsLSHost, tsLS);
        var ngLS = language_service_1.createLanguageService(ngLSHost);
        function getCompletionsAtPosition(fileName, position, options) {
            if (!angularOnly) {
                var results = tsLS.getCompletionsAtPosition(fileName, position, options);
                if (results && results.entries.length) {
                    // If TS could answer the query, then return results immediately.
                    return results;
                }
            }
            return ngLS.getCompletionsAtPosition(fileName, position, options);
        }
        function getQuickInfoAtPosition(fileName, position) {
            if (!angularOnly) {
                var result = tsLS.getQuickInfoAtPosition(fileName, position);
                if (result) {
                    // If TS could answer the query, then return results immediately.
                    return result;
                }
            }
            return ngLS.getQuickInfoAtPosition(fileName, position);
        }
        function getSemanticDiagnostics(fileName) {
            var results = [];
            if (!angularOnly) {
                results.push.apply(results, tslib_1.__spread(tsLS.getSemanticDiagnostics(fileName)));
            }
            // For semantic diagnostics we need to combine both TS + Angular results
            results.push.apply(results, tslib_1.__spread(ngLS.getSemanticDiagnostics(fileName)));
            return results;
        }
        function getDefinitionAtPosition(fileName, position) {
            if (!angularOnly) {
                var results = tsLS.getDefinitionAtPosition(fileName, position);
                if (results) {
                    // If TS could answer the query, then return results immediately.
                    return results;
                }
            }
            var result = ngLS.getDefinitionAndBoundSpan(fileName, position);
            if (!result || !result.definitions || !result.definitions.length) {
                return;
            }
            return result.definitions;
        }
        function getDefinitionAndBoundSpan(fileName, position) {
            if (!angularOnly) {
                var result = tsLS.getDefinitionAndBoundSpan(fileName, position);
                if (result) {
                    // If TS could answer the query, then return results immediately.
                    return result;
                }
            }
            return ngLS.getDefinitionAndBoundSpan(fileName, position);
        }
        var proxy = Object.assign(
        // First clone the original TS language service
        {}, tsLS, 
        // Then override the methods supported by Angular language service
        {
            getCompletionsAtPosition: getCompletionsAtPosition, getQuickInfoAtPosition: getQuickInfoAtPosition, getSemanticDiagnostics: getSemanticDiagnostics,
            getDefinitionAtPosition: getDefinitionAtPosition, getDefinitionAndBoundSpan: getDefinitionAndBoundSpan,
        });
        return proxy;
    }
    exports.create = create;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHNfcGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvbGFuZ3VhZ2Utc2VydmljZS9zcmMvdHNfcGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUlILG1GQUF5RDtJQUN6RCxpRkFBd0Q7SUFFeEQsU0FBZ0IsTUFBTSxDQUFDLElBQWlDO1FBQy9DLElBQUEsMkJBQXFCLEVBQUUsbUNBQTZCLEVBQUUsb0JBQU0sQ0FBUztRQUM1RSx1REFBdUQ7UUFDdkQsa0JBQWtCO1FBQ2xCLHVFQUF1RTtRQUN2RSwyRUFBMkU7UUFDM0UsMkRBQTJEO1FBQzNELGtCQUFrQjtRQUNsQiwrRUFBK0U7UUFDL0UsNEVBQTRFO1FBQzVFLGVBQWU7UUFDZixJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDakUsSUFBTSxRQUFRLEdBQUcsSUFBSSx1Q0FBcUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0QsSUFBTSxJQUFJLEdBQUcsd0NBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFN0MsU0FBUyx3QkFBd0IsQ0FDN0IsUUFBZ0IsRUFBRSxRQUFnQixFQUNsQyxPQUF3RDtZQUMxRCxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNoQixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDM0UsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7b0JBQ3JDLGlFQUFpRTtvQkFDakUsT0FBTyxPQUFPLENBQUM7aUJBQ2hCO2FBQ0Y7WUFDRCxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3BFLENBQUM7UUFFRCxTQUFTLHNCQUFzQixDQUFDLFFBQWdCLEVBQUUsUUFBZ0I7WUFDaEUsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDaEIsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDL0QsSUFBSSxNQUFNLEVBQUU7b0JBQ1YsaUVBQWlFO29CQUNqRSxPQUFPLE1BQU0sQ0FBQztpQkFDZjthQUNGO1lBQ0QsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRCxTQUFTLHNCQUFzQixDQUFDLFFBQWdCO1lBQzlDLElBQU0sT0FBTyxHQUFxQixFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDaEIsT0FBTyxDQUFDLElBQUksT0FBWixPQUFPLG1CQUFTLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsR0FBRTthQUN4RDtZQUNELHdFQUF3RTtZQUN4RSxPQUFPLENBQUMsSUFBSSxPQUFaLE9BQU8sbUJBQVMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxHQUFFO1lBQ3ZELE9BQU8sT0FBTyxDQUFDO1FBQ2pCLENBQUM7UUFFRCxTQUFTLHVCQUF1QixDQUM1QixRQUFnQixFQUFFLFFBQWdCO1lBQ3BDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ2hCLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ2pFLElBQUksT0FBTyxFQUFFO29CQUNYLGlFQUFpRTtvQkFDakUsT0FBTyxPQUFPLENBQUM7aUJBQ2hCO2FBQ0Y7WUFDRCxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hFLE9BQU87YUFDUjtZQUNELE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUM1QixDQUFDO1FBRUQsU0FBUyx5QkFBeUIsQ0FDOUIsUUFBZ0IsRUFBRSxRQUFnQjtZQUNwQyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNoQixJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLE1BQU0sRUFBRTtvQkFDVixpRUFBaUU7b0JBQ2pFLE9BQU8sTUFBTSxDQUFDO2lCQUNmO2FBQ0Y7WUFDRCxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUVELElBQU0sS0FBSyxHQUF3QixNQUFNLENBQUMsTUFBTTtRQUM1QywrQ0FBK0M7UUFDL0MsRUFBRSxFQUFFLElBQUk7UUFDUixrRUFBa0U7UUFDbEU7WUFDSSx3QkFBd0IsMEJBQUEsRUFBRSxzQkFBc0Isd0JBQUEsRUFBRSxzQkFBc0Isd0JBQUE7WUFDeEUsdUJBQXVCLHlCQUFBLEVBQUUseUJBQXlCLDJCQUFBO1NBQ3JELENBQUMsQ0FBQztRQUNQLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQXRGRCx3QkFzRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzcyBmcm9tICd0eXBlc2NyaXB0L2xpYi90c3NlcnZlcmxpYnJhcnknO1xuXG5pbXBvcnQge2NyZWF0ZUxhbmd1YWdlU2VydmljZX0gZnJvbSAnLi9sYW5ndWFnZV9zZXJ2aWNlJztcbmltcG9ydCB7VHlwZVNjcmlwdFNlcnZpY2VIb3N0fSBmcm9tICcuL3R5cGVzY3JpcHRfaG9zdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoaW5mbzogdHNzLnNlcnZlci5QbHVnaW5DcmVhdGVJbmZvKTogdHNzLkxhbmd1YWdlU2VydmljZSB7XG4gIGNvbnN0IHtsYW5ndWFnZVNlcnZpY2U6IHRzTFMsIGxhbmd1YWdlU2VydmljZUhvc3Q6IHRzTFNIb3N0LCBjb25maWd9ID0gaW5mbztcbiAgLy8gVGhpcyBwbHVnaW4gY291bGQgb3BlcmF0ZSB1bmRlciB0d28gZGlmZmVyZW50IG1vZGVzOlxuICAvLyAxLiBUUyArIEFuZ3VsYXJcbiAgLy8gICAgUGx1Z2luIGF1Z21lbnRzIFRTIGxhbmd1YWdlIHNlcnZpY2UgdG8gcHJvdmlkZSBhZGRpdGlvbmFsIEFuZ3VsYXJcbiAgLy8gICAgaW5mb3JtYXRpb24uIFRoaXMgb25seSB3b3JrcyB3aXRoIGlubGluZSB0ZW1wbGF0ZXMgYW5kIGlzIG1lYW50IHRvIGJlXG4gIC8vICAgIHVzZWQgYXMgYSBsb2NhbCBwbHVnaW4gKGNvbmZpZ3VyZWQgdmlhIHRzY29uZmlnLmpzb24pXG4gIC8vIDIuIEFuZ3VsYXIgb25seVxuICAvLyAgICBQbHVnaW4gb25seSBwcm92aWRlcyBpbmZvcm1hdGlvbiBvbiBBbmd1bGFyIHRlbXBsYXRlcywgbm8gVFMgaW5mbyBhdCBhbGwuXG4gIC8vICAgIFRoaXMgZWZmZWN0aXZlbHkgZGlzYWJsZXMgbmF0aXZlIFRTIGZlYXR1cmVzIGFuZCBpcyBtZWFudCBmb3IgaW50ZXJuYWxcbiAgLy8gICAgdXNlIG9ubHkuXG4gIGNvbnN0IGFuZ3VsYXJPbmx5ID0gY29uZmlnID8gY29uZmlnLmFuZ3VsYXJPbmx5ID09PSB0cnVlIDogZmFsc2U7XG4gIGNvbnN0IG5nTFNIb3N0ID0gbmV3IFR5cGVTY3JpcHRTZXJ2aWNlSG9zdCh0c0xTSG9zdCwgdHNMUyk7XG4gIGNvbnN0IG5nTFMgPSBjcmVhdGVMYW5ndWFnZVNlcnZpY2UobmdMU0hvc3QpO1xuXG4gIGZ1bmN0aW9uIGdldENvbXBsZXRpb25zQXRQb3NpdGlvbihcbiAgICAgIGZpbGVOYW1lOiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIsXG4gICAgICBvcHRpb25zOiB0c3MuR2V0Q29tcGxldGlvbnNBdFBvc2l0aW9uT3B0aW9ucyB8IHVuZGVmaW5lZCkge1xuICAgIGlmICghYW5ndWxhck9ubHkpIHtcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSB0c0xTLmdldENvbXBsZXRpb25zQXRQb3NpdGlvbihmaWxlTmFtZSwgcG9zaXRpb24sIG9wdGlvbnMpO1xuICAgICAgaWYgKHJlc3VsdHMgJiYgcmVzdWx0cy5lbnRyaWVzLmxlbmd0aCkge1xuICAgICAgICAvLyBJZiBUUyBjb3VsZCBhbnN3ZXIgdGhlIHF1ZXJ5LCB0aGVuIHJldHVybiByZXN1bHRzIGltbWVkaWF0ZWx5LlxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5nTFMuZ2V0Q29tcGxldGlvbnNBdFBvc2l0aW9uKGZpbGVOYW1lLCBwb3NpdGlvbiwgb3B0aW9ucyk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRRdWlja0luZm9BdFBvc2l0aW9uKGZpbGVOYW1lOiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIpOiB0c3MuUXVpY2tJbmZvfHVuZGVmaW5lZCB7XG4gICAgaWYgKCFhbmd1bGFyT25seSkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gdHNMUy5nZXRRdWlja0luZm9BdFBvc2l0aW9uKGZpbGVOYW1lLCBwb3NpdGlvbik7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIC8vIElmIFRTIGNvdWxkIGFuc3dlciB0aGUgcXVlcnksIHRoZW4gcmV0dXJuIHJlc3VsdHMgaW1tZWRpYXRlbHkuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZ0xTLmdldFF1aWNrSW5mb0F0UG9zaXRpb24oZmlsZU5hbWUsIHBvc2l0aW9uKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFNlbWFudGljRGlhZ25vc3RpY3MoZmlsZU5hbWU6IHN0cmluZyk6IHRzcy5EaWFnbm9zdGljW10ge1xuICAgIGNvbnN0IHJlc3VsdHM6IHRzcy5EaWFnbm9zdGljW10gPSBbXTtcbiAgICBpZiAoIWFuZ3VsYXJPbmx5KSB7XG4gICAgICByZXN1bHRzLnB1c2goLi4udHNMUy5nZXRTZW1hbnRpY0RpYWdub3N0aWNzKGZpbGVOYW1lKSk7XG4gICAgfVxuICAgIC8vIEZvciBzZW1hbnRpYyBkaWFnbm9zdGljcyB3ZSBuZWVkIHRvIGNvbWJpbmUgYm90aCBUUyArIEFuZ3VsYXIgcmVzdWx0c1xuICAgIHJlc3VsdHMucHVzaCguLi5uZ0xTLmdldFNlbWFudGljRGlhZ25vc3RpY3MoZmlsZU5hbWUpKTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldERlZmluaXRpb25BdFBvc2l0aW9uKFxuICAgICAgZmlsZU5hbWU6IHN0cmluZywgcG9zaXRpb246IG51bWJlcik6IFJlYWRvbmx5QXJyYXk8dHNzLkRlZmluaXRpb25JbmZvPnx1bmRlZmluZWQge1xuICAgIGlmICghYW5ndWxhck9ubHkpIHtcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSB0c0xTLmdldERlZmluaXRpb25BdFBvc2l0aW9uKGZpbGVOYW1lLCBwb3NpdGlvbik7XG4gICAgICBpZiAocmVzdWx0cykge1xuICAgICAgICAvLyBJZiBUUyBjb3VsZCBhbnN3ZXIgdGhlIHF1ZXJ5LCB0aGVuIHJldHVybiByZXN1bHRzIGltbWVkaWF0ZWx5LlxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzdWx0ID0gbmdMUy5nZXREZWZpbml0aW9uQW5kQm91bmRTcGFuKGZpbGVOYW1lLCBwb3NpdGlvbik7XG4gICAgaWYgKCFyZXN1bHQgfHwgIXJlc3VsdC5kZWZpbml0aW9ucyB8fCAhcmVzdWx0LmRlZmluaXRpb25zLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0LmRlZmluaXRpb25zO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0RGVmaW5pdGlvbkFuZEJvdW5kU3BhbihcbiAgICAgIGZpbGVOYW1lOiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIpOiB0c3MuRGVmaW5pdGlvbkluZm9BbmRCb3VuZFNwYW58dW5kZWZpbmVkIHtcbiAgICBpZiAoIWFuZ3VsYXJPbmx5KSB7XG4gICAgICBjb25zdCByZXN1bHQgPSB0c0xTLmdldERlZmluaXRpb25BbmRCb3VuZFNwYW4oZmlsZU5hbWUsIHBvc2l0aW9uKTtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgLy8gSWYgVFMgY291bGQgYW5zd2VyIHRoZSBxdWVyeSwgdGhlbiByZXR1cm4gcmVzdWx0cyBpbW1lZGlhdGVseS5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5nTFMuZ2V0RGVmaW5pdGlvbkFuZEJvdW5kU3BhbihmaWxlTmFtZSwgcG9zaXRpb24pO1xuICB9XG5cbiAgY29uc3QgcHJveHk6IHRzcy5MYW5ndWFnZVNlcnZpY2UgPSBPYmplY3QuYXNzaWduKFxuICAgICAgLy8gRmlyc3QgY2xvbmUgdGhlIG9yaWdpbmFsIFRTIGxhbmd1YWdlIHNlcnZpY2VcbiAgICAgIHt9LCB0c0xTLFxuICAgICAgLy8gVGhlbiBvdmVycmlkZSB0aGUgbWV0aG9kcyBzdXBwb3J0ZWQgYnkgQW5ndWxhciBsYW5ndWFnZSBzZXJ2aWNlXG4gICAgICB7XG4gICAgICAgICAgZ2V0Q29tcGxldGlvbnNBdFBvc2l0aW9uLCBnZXRRdWlja0luZm9BdFBvc2l0aW9uLCBnZXRTZW1hbnRpY0RpYWdub3N0aWNzLFxuICAgICAgICAgIGdldERlZmluaXRpb25BdFBvc2l0aW9uLCBnZXREZWZpbml0aW9uQW5kQm91bmRTcGFuLFxuICAgICAgfSk7XG4gIHJldHVybiBwcm94eTtcbn1cbiJdfQ==