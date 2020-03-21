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
        define("@angular/language-service/src/diagnostic_messages", ["require", "exports", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ts = require("typescript");
    exports.Diagnostic = {
        directive_not_in_module: {
            message: "%1 '%2' is not included in a module and will not be available inside a template. Consider adding it to a NgModule declaration.",
            kind: 'Suggestion',
        },
        missing_template_and_templateurl: {
            message: "Component '%1' must have a template or templateUrl",
            kind: 'Error',
        },
        both_template_and_templateurl: {
            message: "Component '%1' must not have both template and templateUrl",
            kind: 'Error',
        },
        invalid_templateurl: {
            message: "URL does not point to a valid file",
            kind: 'Error',
        },
        template_context_missing_member: {
            message: "The template context of '%1' does not define %2.\n" +
                "If the context type is a base type or 'any', consider refining it to a more specific type.",
            kind: 'Suggestion',
        },
        callable_expression_expected_method_call: {
            message: 'Unexpected callable expression. Expected a method call',
            kind: 'Warning',
        },
        call_target_not_callable: {
            message: 'Call target is not callable',
            kind: 'Error',
        },
        expression_might_be_null: {
            message: 'The expression might be null',
            kind: 'Error',
        },
        expected_a_number_type: {
            message: 'Expected a number type',
            kind: 'Error',
        },
        expected_a_string_or_number_type: {
            message: 'Expected operands to be a string or number type',
            kind: 'Error',
        },
        expected_operands_of_similar_type_or_any: {
            message: 'Expected operands to be of similar type or any',
            kind: 'Error',
        },
        unrecognized_operator: {
            message: 'Unrecognized operator %1',
            kind: 'Error',
        },
        unrecognized_primitive: {
            message: 'Unrecognized primitive %1',
            kind: 'Error',
        },
        no_pipe_found: {
            message: 'No pipe of name %1 found',
            kind: 'Error',
        },
        // TODO: Consider a better error message here.
        unable_to_resolve_compatible_call_signature: {
            message: 'Unable to resolve compatible call signature',
            kind: 'Error',
        },
        unable_to_resolve_signature: {
            message: 'Unable to resolve signature for call of %1',
            kind: 'Error',
        },
        could_not_resolve_type: {
            message: "Could not resolve the type of '%1'",
            kind: 'Error',
        },
        identifier_not_callable: {
            message: "'%1' is not callable",
            kind: 'Error',
        },
        identifier_possibly_undefined: {
            message: "'%1' is possibly undefined. Consider using the safe navigation operator (%2) or non-null assertion operator (%3).",
            kind: 'Suggestion',
        },
        identifier_not_defined_in_app_context: {
            message: "Identifier '%1' is not defined. The component declaration, template variable declarations, and element references do not contain such a member",
            kind: 'Error',
        },
        identifier_not_defined_on_receiver: {
            message: "Identifier '%1' is not defined. '%2' does not contain such a member",
            kind: 'Error',
        },
        identifier_is_private: {
            message: "Identifier '%1' refers to a private member of %2",
            kind: 'Warning',
        },
    };
    /**
     * Creates a language service diagnostic.
     * @param span location the diagnostic for
     * @param dm diagnostic message
     * @param formatArgs run-time arguments to format the diagnostic message with (see the messages in
     *        the `Diagnostic` object for an example).
     * @returns a created diagnostic
     */
    function createDiagnostic(span, dm) {
        var formatArgs = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            formatArgs[_i - 2] = arguments[_i];
        }
        // Formats "%1 %2" with formatArgs ['a', 'b'] as "a b"
        var formattedMessage = dm.message.replace(/%(\d+)/g, function (_, index) { return formatArgs[+index - 1]; });
        return {
            kind: ts.DiagnosticCategory[dm.kind],
            message: formattedMessage, span: span,
        };
    }
    exports.createDiagnostic = createDiagnostic;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY19tZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2xhbmd1YWdlLXNlcnZpY2Uvc3JjL2RpYWdub3N0aWNfbWVzc2FnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFrQnBCLFFBQUEsVUFBVSxHQUE4QztRQUNuRSx1QkFBdUIsRUFBRTtZQUN2QixPQUFPLEVBQ0gsZ0lBQWdJO1lBQ3BJLElBQUksRUFBRSxZQUFZO1NBQ25CO1FBRUQsZ0NBQWdDLEVBQUU7WUFDaEMsT0FBTyxFQUFFLG9EQUFvRDtZQUM3RCxJQUFJLEVBQUUsT0FBTztTQUNkO1FBRUQsNkJBQTZCLEVBQUU7WUFDN0IsT0FBTyxFQUFFLDREQUE0RDtZQUNyRSxJQUFJLEVBQUUsT0FBTztTQUNkO1FBRUQsbUJBQW1CLEVBQUU7WUFDbkIsT0FBTyxFQUFFLG9DQUFvQztZQUM3QyxJQUFJLEVBQUUsT0FBTztTQUNkO1FBRUQsK0JBQStCLEVBQUU7WUFDL0IsT0FBTyxFQUFFLG9EQUFvRDtnQkFDekQsNEZBQTRGO1lBQ2hHLElBQUksRUFBRSxZQUFZO1NBQ25CO1FBRUQsd0NBQXdDLEVBQUU7WUFDeEMsT0FBTyxFQUFFLHdEQUF3RDtZQUNqRSxJQUFJLEVBQUUsU0FBUztTQUNoQjtRQUVELHdCQUF3QixFQUFFO1lBQ3hCLE9BQU8sRUFBRSw2QkFBNkI7WUFDdEMsSUFBSSxFQUFFLE9BQU87U0FDZDtRQUVELHdCQUF3QixFQUFFO1lBQ3hCLE9BQU8sRUFBRSw4QkFBOEI7WUFDdkMsSUFBSSxFQUFFLE9BQU87U0FDZDtRQUVELHNCQUFzQixFQUFFO1lBQ3RCLE9BQU8sRUFBRSx3QkFBd0I7WUFDakMsSUFBSSxFQUFFLE9BQU87U0FDZDtRQUVELGdDQUFnQyxFQUFFO1lBQ2hDLE9BQU8sRUFBRSxpREFBaUQ7WUFDMUQsSUFBSSxFQUFFLE9BQU87U0FDZDtRQUVELHdDQUF3QyxFQUFFO1lBQ3hDLE9BQU8sRUFBRSxnREFBZ0Q7WUFDekQsSUFBSSxFQUFFLE9BQU87U0FDZDtRQUVELHFCQUFxQixFQUFFO1lBQ3JCLE9BQU8sRUFBRSwwQkFBMEI7WUFDbkMsSUFBSSxFQUFFLE9BQU87U0FDZDtRQUVELHNCQUFzQixFQUFFO1lBQ3RCLE9BQU8sRUFBRSwyQkFBMkI7WUFDcEMsSUFBSSxFQUFFLE9BQU87U0FDZDtRQUVELGFBQWEsRUFBRTtZQUNiLE9BQU8sRUFBRSwwQkFBMEI7WUFDbkMsSUFBSSxFQUFFLE9BQU87U0FDZDtRQUVELDhDQUE4QztRQUM5QywyQ0FBMkMsRUFBRTtZQUMzQyxPQUFPLEVBQUUsNkNBQTZDO1lBQ3RELElBQUksRUFBRSxPQUFPO1NBQ2Q7UUFFRCwyQkFBMkIsRUFBRTtZQUMzQixPQUFPLEVBQUUsNENBQTRDO1lBQ3JELElBQUksRUFBRSxPQUFPO1NBQ2Q7UUFFRCxzQkFBc0IsRUFBRTtZQUN0QixPQUFPLEVBQUUsb0NBQW9DO1lBQzdDLElBQUksRUFBRSxPQUFPO1NBQ2Q7UUFFRCx1QkFBdUIsRUFBRTtZQUN2QixPQUFPLEVBQUUsc0JBQXNCO1lBQy9CLElBQUksRUFBRSxPQUFPO1NBQ2Q7UUFFRCw2QkFBNkIsRUFBRTtZQUM3QixPQUFPLEVBQ0gsbUhBQW1IO1lBQ3ZILElBQUksRUFBRSxZQUFZO1NBQ25CO1FBRUQscUNBQXFDLEVBQUU7WUFDckMsT0FBTyxFQUNILGdKQUFnSjtZQUNwSixJQUFJLEVBQUUsT0FBTztTQUNkO1FBRUQsa0NBQWtDLEVBQUU7WUFDbEMsT0FBTyxFQUFFLHFFQUFxRTtZQUM5RSxJQUFJLEVBQUUsT0FBTztTQUNkO1FBRUQscUJBQXFCLEVBQUU7WUFDckIsT0FBTyxFQUFFLGtEQUFrRDtZQUMzRCxJQUFJLEVBQUUsU0FBUztTQUNoQjtLQUNGLENBQUM7SUFFRjs7Ozs7OztPQU9HO0lBQ0gsU0FBZ0IsZ0JBQWdCLENBQzVCLElBQWEsRUFBRSxFQUFxQjtRQUFFLG9CQUF1QjthQUF2QixVQUF1QixFQUF2QixxQkFBdUIsRUFBdkIsSUFBdUI7WUFBdkIsbUNBQXVCOztRQUMvRCxzREFBc0Q7UUFDdEQsSUFBTSxnQkFBZ0IsR0FDbEIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFVBQUMsQ0FBQyxFQUFFLEtBQWEsSUFBSyxPQUFBLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDO1FBQ2hGLE9BQU87WUFDTCxJQUFJLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDcEMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLElBQUksTUFBQTtTQUNoQyxDQUFDO0lBQ0osQ0FBQztJQVRELDRDQVNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIG5nIGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERpYWdub3N0aWNNZXNzYWdlIHtcbiAgbWVzc2FnZTogc3RyaW5nO1xuICBraW5kOiBrZXlvZiB0eXBlb2YgdHMuRGlhZ25vc3RpY0NhdGVnb3J5O1xufVxuXG50eXBlIERpYWdub3N0aWNOYW1lID0gJ2RpcmVjdGl2ZV9ub3RfaW5fbW9kdWxlJyB8ICdtaXNzaW5nX3RlbXBsYXRlX2FuZF90ZW1wbGF0ZXVybCcgfFxuICAgICdib3RoX3RlbXBsYXRlX2FuZF90ZW1wbGF0ZXVybCcgfCAnaW52YWxpZF90ZW1wbGF0ZXVybCcgfCAndGVtcGxhdGVfY29udGV4dF9taXNzaW5nX21lbWJlcicgfFxuICAgICdjYWxsYWJsZV9leHByZXNzaW9uX2V4cGVjdGVkX21ldGhvZF9jYWxsJyB8ICdjYWxsX3RhcmdldF9ub3RfY2FsbGFibGUnIHxcbiAgICAnZXhwcmVzc2lvbl9taWdodF9iZV9udWxsJyB8ICdleHBlY3RlZF9hX251bWJlcl90eXBlJyB8ICdleHBlY3RlZF9hX3N0cmluZ19vcl9udW1iZXJfdHlwZScgfFxuICAgICdleHBlY3RlZF9vcGVyYW5kc19vZl9zaW1pbGFyX3R5cGVfb3JfYW55JyB8ICd1bnJlY29nbml6ZWRfb3BlcmF0b3InIHxcbiAgICAndW5yZWNvZ25pemVkX3ByaW1pdGl2ZScgfCAnbm9fcGlwZV9mb3VuZCcgfCAndW5hYmxlX3RvX3Jlc29sdmVfY29tcGF0aWJsZV9jYWxsX3NpZ25hdHVyZScgfFxuICAgICd1bmFibGVfdG9fcmVzb2x2ZV9zaWduYXR1cmUnIHwgJ2NvdWxkX25vdF9yZXNvbHZlX3R5cGUnIHwgJ2lkZW50aWZpZXJfbm90X2NhbGxhYmxlJyB8XG4gICAgJ2lkZW50aWZpZXJfcG9zc2libHlfdW5kZWZpbmVkJyB8ICdpZGVudGlmaWVyX25vdF9kZWZpbmVkX2luX2FwcF9jb250ZXh0JyB8XG4gICAgJ2lkZW50aWZpZXJfbm90X2RlZmluZWRfb25fcmVjZWl2ZXInIHwgJ2lkZW50aWZpZXJfaXNfcHJpdmF0ZSc7XG5cbmV4cG9ydCBjb25zdCBEaWFnbm9zdGljOiBSZWNvcmQ8RGlhZ25vc3RpY05hbWUsIERpYWdub3N0aWNNZXNzYWdlPiA9IHtcbiAgZGlyZWN0aXZlX25vdF9pbl9tb2R1bGU6IHtcbiAgICBtZXNzYWdlOlxuICAgICAgICBgJTEgJyUyJyBpcyBub3QgaW5jbHVkZWQgaW4gYSBtb2R1bGUgYW5kIHdpbGwgbm90IGJlIGF2YWlsYWJsZSBpbnNpZGUgYSB0ZW1wbGF0ZS4gQ29uc2lkZXIgYWRkaW5nIGl0IHRvIGEgTmdNb2R1bGUgZGVjbGFyYXRpb24uYCxcbiAgICBraW5kOiAnU3VnZ2VzdGlvbicsXG4gIH0sXG5cbiAgbWlzc2luZ190ZW1wbGF0ZV9hbmRfdGVtcGxhdGV1cmw6IHtcbiAgICBtZXNzYWdlOiBgQ29tcG9uZW50ICclMScgbXVzdCBoYXZlIGEgdGVtcGxhdGUgb3IgdGVtcGxhdGVVcmxgLFxuICAgIGtpbmQ6ICdFcnJvcicsXG4gIH0sXG5cbiAgYm90aF90ZW1wbGF0ZV9hbmRfdGVtcGxhdGV1cmw6IHtcbiAgICBtZXNzYWdlOiBgQ29tcG9uZW50ICclMScgbXVzdCBub3QgaGF2ZSBib3RoIHRlbXBsYXRlIGFuZCB0ZW1wbGF0ZVVybGAsXG4gICAga2luZDogJ0Vycm9yJyxcbiAgfSxcblxuICBpbnZhbGlkX3RlbXBsYXRldXJsOiB7XG4gICAgbWVzc2FnZTogYFVSTCBkb2VzIG5vdCBwb2ludCB0byBhIHZhbGlkIGZpbGVgLFxuICAgIGtpbmQ6ICdFcnJvcicsXG4gIH0sXG5cbiAgdGVtcGxhdGVfY29udGV4dF9taXNzaW5nX21lbWJlcjoge1xuICAgIG1lc3NhZ2U6IGBUaGUgdGVtcGxhdGUgY29udGV4dCBvZiAnJTEnIGRvZXMgbm90IGRlZmluZSAlMi5cXG5gICtcbiAgICAgICAgYElmIHRoZSBjb250ZXh0IHR5cGUgaXMgYSBiYXNlIHR5cGUgb3IgJ2FueScsIGNvbnNpZGVyIHJlZmluaW5nIGl0IHRvIGEgbW9yZSBzcGVjaWZpYyB0eXBlLmAsXG4gICAga2luZDogJ1N1Z2dlc3Rpb24nLFxuICB9LFxuXG4gIGNhbGxhYmxlX2V4cHJlc3Npb25fZXhwZWN0ZWRfbWV0aG9kX2NhbGw6IHtcbiAgICBtZXNzYWdlOiAnVW5leHBlY3RlZCBjYWxsYWJsZSBleHByZXNzaW9uLiBFeHBlY3RlZCBhIG1ldGhvZCBjYWxsJyxcbiAgICBraW5kOiAnV2FybmluZycsXG4gIH0sXG5cbiAgY2FsbF90YXJnZXRfbm90X2NhbGxhYmxlOiB7XG4gICAgbWVzc2FnZTogJ0NhbGwgdGFyZ2V0IGlzIG5vdCBjYWxsYWJsZScsXG4gICAga2luZDogJ0Vycm9yJyxcbiAgfSxcblxuICBleHByZXNzaW9uX21pZ2h0X2JlX251bGw6IHtcbiAgICBtZXNzYWdlOiAnVGhlIGV4cHJlc3Npb24gbWlnaHQgYmUgbnVsbCcsXG4gICAga2luZDogJ0Vycm9yJyxcbiAgfSxcblxuICBleHBlY3RlZF9hX251bWJlcl90eXBlOiB7XG4gICAgbWVzc2FnZTogJ0V4cGVjdGVkIGEgbnVtYmVyIHR5cGUnLFxuICAgIGtpbmQ6ICdFcnJvcicsXG4gIH0sXG5cbiAgZXhwZWN0ZWRfYV9zdHJpbmdfb3JfbnVtYmVyX3R5cGU6IHtcbiAgICBtZXNzYWdlOiAnRXhwZWN0ZWQgb3BlcmFuZHMgdG8gYmUgYSBzdHJpbmcgb3IgbnVtYmVyIHR5cGUnLFxuICAgIGtpbmQ6ICdFcnJvcicsXG4gIH0sXG5cbiAgZXhwZWN0ZWRfb3BlcmFuZHNfb2Zfc2ltaWxhcl90eXBlX29yX2FueToge1xuICAgIG1lc3NhZ2U6ICdFeHBlY3RlZCBvcGVyYW5kcyB0byBiZSBvZiBzaW1pbGFyIHR5cGUgb3IgYW55JyxcbiAgICBraW5kOiAnRXJyb3InLFxuICB9LFxuXG4gIHVucmVjb2duaXplZF9vcGVyYXRvcjoge1xuICAgIG1lc3NhZ2U6ICdVbnJlY29nbml6ZWQgb3BlcmF0b3IgJTEnLFxuICAgIGtpbmQ6ICdFcnJvcicsXG4gIH0sXG5cbiAgdW5yZWNvZ25pemVkX3ByaW1pdGl2ZToge1xuICAgIG1lc3NhZ2U6ICdVbnJlY29nbml6ZWQgcHJpbWl0aXZlICUxJyxcbiAgICBraW5kOiAnRXJyb3InLFxuICB9LFxuXG4gIG5vX3BpcGVfZm91bmQ6IHtcbiAgICBtZXNzYWdlOiAnTm8gcGlwZSBvZiBuYW1lICUxIGZvdW5kJyxcbiAgICBraW5kOiAnRXJyb3InLFxuICB9LFxuXG4gIC8vIFRPRE86IENvbnNpZGVyIGEgYmV0dGVyIGVycm9yIG1lc3NhZ2UgaGVyZS5cbiAgdW5hYmxlX3RvX3Jlc29sdmVfY29tcGF0aWJsZV9jYWxsX3NpZ25hdHVyZToge1xuICAgIG1lc3NhZ2U6ICdVbmFibGUgdG8gcmVzb2x2ZSBjb21wYXRpYmxlIGNhbGwgc2lnbmF0dXJlJyxcbiAgICBraW5kOiAnRXJyb3InLFxuICB9LFxuXG4gIHVuYWJsZV90b19yZXNvbHZlX3NpZ25hdHVyZToge1xuICAgIG1lc3NhZ2U6ICdVbmFibGUgdG8gcmVzb2x2ZSBzaWduYXR1cmUgZm9yIGNhbGwgb2YgJTEnLFxuICAgIGtpbmQ6ICdFcnJvcicsXG4gIH0sXG5cbiAgY291bGRfbm90X3Jlc29sdmVfdHlwZToge1xuICAgIG1lc3NhZ2U6IGBDb3VsZCBub3QgcmVzb2x2ZSB0aGUgdHlwZSBvZiAnJTEnYCxcbiAgICBraW5kOiAnRXJyb3InLFxuICB9LFxuXG4gIGlkZW50aWZpZXJfbm90X2NhbGxhYmxlOiB7XG4gICAgbWVzc2FnZTogYCclMScgaXMgbm90IGNhbGxhYmxlYCxcbiAgICBraW5kOiAnRXJyb3InLFxuICB9LFxuXG4gIGlkZW50aWZpZXJfcG9zc2libHlfdW5kZWZpbmVkOiB7XG4gICAgbWVzc2FnZTpcbiAgICAgICAgYCclMScgaXMgcG9zc2libHkgdW5kZWZpbmVkLiBDb25zaWRlciB1c2luZyB0aGUgc2FmZSBuYXZpZ2F0aW9uIG9wZXJhdG9yICglMikgb3Igbm9uLW51bGwgYXNzZXJ0aW9uIG9wZXJhdG9yICglMykuYCxcbiAgICBraW5kOiAnU3VnZ2VzdGlvbicsXG4gIH0sXG5cbiAgaWRlbnRpZmllcl9ub3RfZGVmaW5lZF9pbl9hcHBfY29udGV4dDoge1xuICAgIG1lc3NhZ2U6XG4gICAgICAgIGBJZGVudGlmaWVyICclMScgaXMgbm90IGRlZmluZWQuIFRoZSBjb21wb25lbnQgZGVjbGFyYXRpb24sIHRlbXBsYXRlIHZhcmlhYmxlIGRlY2xhcmF0aW9ucywgYW5kIGVsZW1lbnQgcmVmZXJlbmNlcyBkbyBub3QgY29udGFpbiBzdWNoIGEgbWVtYmVyYCxcbiAgICBraW5kOiAnRXJyb3InLFxuICB9LFxuXG4gIGlkZW50aWZpZXJfbm90X2RlZmluZWRfb25fcmVjZWl2ZXI6IHtcbiAgICBtZXNzYWdlOiBgSWRlbnRpZmllciAnJTEnIGlzIG5vdCBkZWZpbmVkLiAnJTInIGRvZXMgbm90IGNvbnRhaW4gc3VjaCBhIG1lbWJlcmAsXG4gICAga2luZDogJ0Vycm9yJyxcbiAgfSxcblxuICBpZGVudGlmaWVyX2lzX3ByaXZhdGU6IHtcbiAgICBtZXNzYWdlOiBgSWRlbnRpZmllciAnJTEnIHJlZmVycyB0byBhIHByaXZhdGUgbWVtYmVyIG9mICUyYCxcbiAgICBraW5kOiAnV2FybmluZycsXG4gIH0sXG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBsYW5ndWFnZSBzZXJ2aWNlIGRpYWdub3N0aWMuXG4gKiBAcGFyYW0gc3BhbiBsb2NhdGlvbiB0aGUgZGlhZ25vc3RpYyBmb3JcbiAqIEBwYXJhbSBkbSBkaWFnbm9zdGljIG1lc3NhZ2VcbiAqIEBwYXJhbSBmb3JtYXRBcmdzIHJ1bi10aW1lIGFyZ3VtZW50cyB0byBmb3JtYXQgdGhlIGRpYWdub3N0aWMgbWVzc2FnZSB3aXRoIChzZWUgdGhlIG1lc3NhZ2VzIGluXG4gKiAgICAgICAgdGhlIGBEaWFnbm9zdGljYCBvYmplY3QgZm9yIGFuIGV4YW1wbGUpLlxuICogQHJldHVybnMgYSBjcmVhdGVkIGRpYWdub3N0aWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURpYWdub3N0aWMoXG4gICAgc3BhbjogbmcuU3BhbiwgZG06IERpYWdub3N0aWNNZXNzYWdlLCAuLi5mb3JtYXRBcmdzOiBzdHJpbmdbXSk6IG5nLkRpYWdub3N0aWMge1xuICAvLyBGb3JtYXRzIFwiJTEgJTJcIiB3aXRoIGZvcm1hdEFyZ3MgWydhJywgJ2InXSBhcyBcImEgYlwiXG4gIGNvbnN0IGZvcm1hdHRlZE1lc3NhZ2UgPVxuICAgICAgZG0ubWVzc2FnZS5yZXBsYWNlKC8lKFxcZCspL2csIChfLCBpbmRleDogc3RyaW5nKSA9PiBmb3JtYXRBcmdzWytpbmRleCAtIDFdKTtcbiAgcmV0dXJuIHtcbiAgICBraW5kOiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnlbZG0ua2luZF0sXG4gICAgbWVzc2FnZTogZm9ybWF0dGVkTWVzc2FnZSwgc3BhbixcbiAgfTtcbn1cbiJdfQ==