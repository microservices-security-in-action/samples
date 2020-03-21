(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics", ["require", "exports", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/util/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    /**
     * Wraps the node in parenthesis such that inserted span comments become attached to the proper
     * node. This is an alias for `ts.createParen` with the benefit that it signifies that the
     * inserted parenthesis are for diagnostic purposes, not for correctness of the rendered TCB code.
     *
     * Note that it is important that nodes and its attached comment are not wrapped into parenthesis
     * by default, as it prevents correct translation of e.g. diagnostics produced for incorrect method
     * arguments. Such diagnostics would then be produced for the parenthesised node whereas the
     * positional comment would be located within that node, resulting in a mismatch.
     */
    function wrapForDiagnostics(expr) {
        return ts.createParen(expr);
    }
    exports.wrapForDiagnostics = wrapForDiagnostics;
    var IGNORE_MARKER = 'ignore';
    /**
     * Adds a marker to the node that signifies that any errors within the node should not be reported.
     */
    function ignoreDiagnostics(node) {
        ts.addSyntheticTrailingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, IGNORE_MARKER, /* hasTrailingNewLine */ false);
    }
    exports.ignoreDiagnostics = ignoreDiagnostics;
    /**
     * Adds a synthetic comment to the expression that represents the parse span of the provided node.
     * This comment can later be retrieved as trivia of a node to recover original source locations.
     */
    function addParseSpanInfo(node, span) {
        var commentText;
        if (span instanceof compiler_1.AbsoluteSourceSpan) {
            commentText = span.start + "," + span.end;
        }
        else {
            commentText = span.start.offset + "," + span.end.offset;
        }
        ts.addSyntheticTrailingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, commentText, /* hasTrailingNewLine */ false);
    }
    exports.addParseSpanInfo = addParseSpanInfo;
    /**
     * Adds a synthetic comment to the function declaration that contains the template id
     * of the class declaration.
     */
    function addTemplateId(tcb, id) {
        ts.addSyntheticLeadingComment(tcb, ts.SyntaxKind.MultiLineCommentTrivia, id, true);
    }
    exports.addTemplateId = addTemplateId;
    /**
     * Determines if the diagnostic should be reported. Some diagnostics are produced because of the
     * way TCBs are generated; those diagnostics should not be reported as type check errors of the
     * template.
     */
    function shouldReportDiagnostic(diagnostic) {
        var code = diagnostic.code;
        if (code === 6133 /* $var is declared but its value is never read. */) {
            return false;
        }
        else if (code === 6199 /* All variables are unused. */) {
            return false;
        }
        else if (code === 2695 /* Left side of comma operator is unused and has no side effects. */) {
            return false;
        }
        else if (code === 7006 /* Parameter '$event' implicitly has an 'any' type. */) {
            return false;
        }
        return true;
    }
    exports.shouldReportDiagnostic = shouldReportDiagnostic;
    /**
     * Attempts to translate a TypeScript diagnostic produced during template type-checking to their
     * location of origin, based on the comments that are emitted in the TCB code.
     *
     * If the diagnostic could not be translated, `null` is returned to indicate that the diagnostic
     * should not be reported at all. This prevents diagnostics from non-TCB code in a user's source
     * file from being reported as type-check errors.
     */
    function translateDiagnostic(diagnostic, resolver) {
        if (diagnostic.file === undefined || diagnostic.start === undefined) {
            return null;
        }
        // Locate the node that the diagnostic is reported on and determine its location in the source.
        var node = typescript_1.getTokenAtPosition(diagnostic.file, diagnostic.start);
        var sourceLocation = findSourceLocation(node, diagnostic.file);
        if (sourceLocation === null) {
            return null;
        }
        // Now use the external resolver to obtain the full `ParseSourceFile` of the template.
        var span = resolver.toParseSourceSpan(sourceLocation.id, sourceLocation.span);
        if (span === null) {
            return null;
        }
        var mapping = resolver.getSourceMapping(sourceLocation.id);
        return makeTemplateDiagnostic(mapping, span, diagnostic.category, diagnostic.code, diagnostic.messageText);
    }
    exports.translateDiagnostic = translateDiagnostic;
    /**
     * Constructs a `ts.Diagnostic` for a given `ParseSourceSpan` within a template.
     */
    function makeTemplateDiagnostic(mapping, span, category, code, messageText, relatedMessage) {
        if (mapping.type === 'direct') {
            var relatedInformation = undefined;
            if (relatedMessage !== undefined) {
                relatedInformation = [{
                        category: ts.DiagnosticCategory.Message,
                        code: 0,
                        file: mapping.node.getSourceFile(),
                        start: relatedMessage.span.start.offset,
                        length: relatedMessage.span.end.offset - relatedMessage.span.start.offset,
                        messageText: relatedMessage.text,
                    }];
            }
            // For direct mappings, the error is shown inline as ngtsc was able to pinpoint a string
            // constant within the `@Component` decorator for the template. This allows us to map the error
            // directly into the bytes of the source file.
            return {
                source: 'ngtsc',
                code: code,
                category: category,
                messageText: messageText,
                file: mapping.node.getSourceFile(),
                componentFile: mapping.node.getSourceFile(),
                start: span.start.offset,
                length: span.end.offset - span.start.offset, relatedInformation: relatedInformation,
            };
        }
        else if (mapping.type === 'indirect' || mapping.type === 'external') {
            // For indirect mappings (template was declared inline, but ngtsc couldn't map it directly
            // to a string constant in the decorator), the component's file name is given with a suffix
            // indicating it's not the TS file being displayed, but a template.
            // For external temoplates, the HTML filename is used.
            var componentSf = mapping.componentClass.getSourceFile();
            var componentName = mapping.componentClass.name.text;
            // TODO(alxhub): remove cast when TS in g3 supports this narrowing.
            var fileName = mapping.type === 'indirect' ?
                componentSf.fileName + " (" + componentName + " template)" :
                mapping.templateUrl;
            // TODO(alxhub): investigate creating a fake `ts.SourceFile` here instead of invoking the TS
            // parser against the template (HTML is just really syntactically invalid TypeScript code ;).
            // Also investigate caching the file to avoid running the parser multiple times.
            var sf = ts.createSourceFile(fileName, mapping.template, ts.ScriptTarget.Latest, false, ts.ScriptKind.JSX);
            var relatedInformation = [];
            if (relatedMessage !== undefined) {
                relatedInformation.push({
                    category: ts.DiagnosticCategory.Message,
                    code: 0,
                    file: sf,
                    start: relatedMessage.span.start.offset,
                    length: relatedMessage.span.end.offset - relatedMessage.span.start.offset,
                    messageText: relatedMessage.text,
                });
            }
            relatedInformation.push({
                category: ts.DiagnosticCategory.Message,
                code: 0,
                file: componentSf,
                // mapping.node represents either the 'template' or 'templateUrl' expression. getStart()
                // and getEnd() are used because they don't include surrounding whitespace.
                start: mapping.node.getStart(),
                length: mapping.node.getEnd() - mapping.node.getStart(),
                messageText: "Error occurs in the template of component " + componentName + ".",
            });
            return {
                source: 'ngtsc',
                category: category,
                code: code,
                messageText: messageText,
                file: sf,
                componentFile: componentSf,
                start: span.start.offset,
                length: span.end.offset - span.start.offset,
                // Show a secondary message indicating the component whose template contains the error.
                relatedInformation: relatedInformation,
            };
        }
        else {
            throw new Error("Unexpected source mapping type: " + mapping.type);
        }
    }
    exports.makeTemplateDiagnostic = makeTemplateDiagnostic;
    /**
     * Traverses up the AST starting from the given node to extract the source location from comments
     * that have been emitted into the TCB. If the node does not exist within a TCB, or if an ignore
     * marker comment is found up the tree, this function returns null.
     */
    function findSourceLocation(node, sourceFile) {
        // Search for comments until the TCB's function declaration is encountered.
        while (node !== undefined && !ts.isFunctionDeclaration(node)) {
            if (hasIgnoreMarker(node, sourceFile)) {
                // There's an ignore marker on this node, so the diagnostic should not be reported.
                return null;
            }
            var span = readSpanComment(sourceFile, node);
            if (span !== null) {
                // Once the positional information has been extracted, search further up the TCB to extract
                // the unique id that is attached with the TCB's function declaration.
                var id = getTemplateId(node, sourceFile);
                if (id === null) {
                    return null;
                }
                return { id: id, span: span };
            }
            node = node.parent;
        }
        return null;
    }
    function getTemplateId(node, sourceFile) {
        // Walk up to the function declaration of the TCB, the file information is attached there.
        while (!ts.isFunctionDeclaration(node)) {
            if (hasIgnoreMarker(node, sourceFile)) {
                // There's an ignore marker on this node, so the diagnostic should not be reported.
                return null;
            }
            node = node.parent;
            // Bail once we have reached the root.
            if (node === undefined) {
                return null;
            }
        }
        var start = node.getFullStart();
        return ts.forEachLeadingCommentRange(sourceFile.text, start, function (pos, end, kind) {
            if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
                return null;
            }
            var commentText = sourceFile.text.substring(pos + 2, end - 2);
            return commentText;
        }) || null;
    }
    var parseSpanComment = /^(\d+),(\d+)$/;
    function readSpanComment(sourceFile, node) {
        return ts.forEachTrailingCommentRange(sourceFile.text, node.getEnd(), function (pos, end, kind) {
            if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
                return null;
            }
            var commentText = sourceFile.text.substring(pos + 2, end - 2);
            var match = commentText.match(parseSpanComment);
            if (match === null) {
                return null;
            }
            return new compiler_1.AbsoluteSourceSpan(+match[1], +match[2]);
        }) || null;
    }
    function hasIgnoreMarker(node, sourceFile) {
        return ts.forEachTrailingCommentRange(sourceFile.text, node.getEnd(), function (pos, end, kind) {
            if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
                return null;
            }
            var commentText = sourceFile.text.substring(pos + 2, end - 2);
            return commentText === IGNORE_MARKER;
        }) === true;
    }
    function isTemplateDiagnostic(diagnostic) {
        return diagnostic.hasOwnProperty('componentFile') &&
            ts.isSourceFile(diagnostic.componentFile);
    }
    exports.isTemplateDiagnostic = isTemplateDiagnostic;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3R5cGVjaGVjay9zcmMvZGlhZ25vc3RpY3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw4Q0FBc0U7SUFDdEUsK0JBQWlDO0lBRWpDLGtGQUE2RDtJQWtDN0Q7Ozs7Ozs7OztPQVNHO0lBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsSUFBbUI7UUFDcEQsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFGRCxnREFFQztJQUVELElBQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQztJQUUvQjs7T0FFRztJQUNILFNBQWdCLGlCQUFpQixDQUFDLElBQWE7UUFDN0MsRUFBRSxDQUFDLDJCQUEyQixDQUMxQixJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxhQUFhLEVBQUUsd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakcsQ0FBQztJQUhELDhDQUdDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBZ0IsZ0JBQWdCLENBQUMsSUFBYSxFQUFFLElBQTBDO1FBQ3hGLElBQUksV0FBbUIsQ0FBQztRQUN4QixJQUFJLElBQUksWUFBWSw2QkFBa0IsRUFBRTtZQUN0QyxXQUFXLEdBQU0sSUFBSSxDQUFDLEtBQUssU0FBSSxJQUFJLENBQUMsR0FBSyxDQUFDO1NBQzNDO2FBQU07WUFDTCxXQUFXLEdBQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLFNBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFRLENBQUM7U0FDekQ7UUFDRCxFQUFFLENBQUMsMkJBQTJCLENBQzFCLElBQUksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFLFdBQVcsRUFBRSx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvRixDQUFDO0lBVEQsNENBU0M7SUFFRDs7O09BR0c7SUFDSCxTQUFnQixhQUFhLENBQUMsR0FBMkIsRUFBRSxFQUFjO1FBQ3ZFLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUZELHNDQUVDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQWdCLHNCQUFzQixDQUFDLFVBQXlCO1FBQ3ZELElBQUEsc0JBQUksQ0FBZTtRQUMxQixJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsbURBQW1ELEVBQUU7WUFDckUsT0FBTyxLQUFLLENBQUM7U0FDZDthQUFNLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQywrQkFBK0IsRUFBRTtZQUN4RCxPQUFPLEtBQUssQ0FBQztTQUNkO2FBQU0sSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLG9FQUFvRSxFQUFFO1lBQzdGLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7YUFBTSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsc0RBQXNELEVBQUU7WUFDL0UsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQVpELHdEQVlDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILFNBQWdCLG1CQUFtQixDQUMvQixVQUF5QixFQUFFLFFBQWdDO1FBQzdELElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksVUFBVSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7WUFDbkUsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELCtGQUErRjtRQUMvRixJQUFNLElBQUksR0FBRywrQkFBa0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRSxJQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pFLElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtZQUMzQixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsc0ZBQXNGO1FBQ3RGLElBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRixJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDakIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELElBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0QsT0FBTyxzQkFBc0IsQ0FDekIsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUF0QkQsa0RBc0JDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixzQkFBc0IsQ0FDbEMsT0FBOEIsRUFBRSxJQUFxQixFQUFFLFFBQStCLEVBQ3RGLElBQVksRUFBRSxXQUErQyxFQUFFLGNBRzlEO1FBQ0gsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUM3QixJQUFJLGtCQUFrQixHQUFnRCxTQUFTLENBQUM7WUFDaEYsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFO2dCQUNoQyxrQkFBa0IsR0FBRyxDQUFDO3dCQUNwQixRQUFRLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLE9BQU87d0JBQ3ZDLElBQUksRUFBRSxDQUFDO3dCQUNQLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTt3QkFDbEMsS0FBSyxFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU07d0JBQ3ZDLE1BQU0sRUFBRSxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTt3QkFDekUsV0FBVyxFQUFFLGNBQWMsQ0FBQyxJQUFJO3FCQUNqQyxDQUFDLENBQUM7YUFDSjtZQUNELHdGQUF3RjtZQUN4RiwrRkFBK0Y7WUFDL0YsOENBQThDO1lBQzlDLE9BQU87Z0JBQ0wsTUFBTSxFQUFFLE9BQU87Z0JBQ2YsSUFBSSxNQUFBO2dCQUNKLFFBQVEsVUFBQTtnQkFDUixXQUFXLGFBQUE7Z0JBQ1gsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUNsQyxhQUFhLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQzNDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU07Z0JBQ3hCLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxrQkFBa0Isb0JBQUE7YUFDaEUsQ0FBQztTQUNIO2FBQU0sSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFVBQVUsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRTtZQUNyRSwwRkFBMEY7WUFDMUYsMkZBQTJGO1lBQzNGLG1FQUFtRTtZQUNuRSxzREFBc0Q7WUFDdEQsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUMzRCxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDdkQsbUVBQW1FO1lBQ25FLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLFdBQVcsQ0FBQyxRQUFRLFVBQUssYUFBYSxlQUFZLENBQUMsQ0FBQztnQkFDdEQsT0FBeUMsQ0FBQyxXQUFXLENBQUM7WUFDM0QsNEZBQTRGO1lBQzVGLDZGQUE2RjtZQUM3RixnRkFBZ0Y7WUFDaEYsSUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUMxQixRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVsRixJQUFJLGtCQUFrQixHQUFzQyxFQUFFLENBQUM7WUFDL0QsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFO2dCQUNoQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3RCLFFBQVEsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTztvQkFDdkMsSUFBSSxFQUFFLENBQUM7b0JBQ1AsSUFBSSxFQUFFLEVBQUU7b0JBQ1IsS0FBSyxFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU07b0JBQ3ZDLE1BQU0sRUFBRSxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTtvQkFDekUsV0FBVyxFQUFFLGNBQWMsQ0FBQyxJQUFJO2lCQUNqQyxDQUFDLENBQUM7YUFDSjtZQUVELGtCQUFrQixDQUFDLElBQUksQ0FBQztnQkFDdEIsUUFBUSxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPO2dCQUN2QyxJQUFJLEVBQUUsQ0FBQztnQkFDUCxJQUFJLEVBQUUsV0FBVztnQkFDakIsd0ZBQXdGO2dCQUN4RiwyRUFBMkU7Z0JBQzNFLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDOUIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZELFdBQVcsRUFBRSwrQ0FBNkMsYUFBYSxNQUFHO2FBQzNFLENBQUMsQ0FBQztZQUVILE9BQU87Z0JBQ0wsTUFBTSxFQUFFLE9BQU87Z0JBQ2YsUUFBUSxVQUFBO2dCQUNSLElBQUksTUFBQTtnQkFDSixXQUFXLGFBQUE7Z0JBQ1gsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsYUFBYSxFQUFFLFdBQVc7Z0JBQzFCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU07Z0JBQ3hCLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU07Z0JBQzNDLHVGQUF1RjtnQkFDdkYsa0JBQWtCLG9CQUFBO2FBQ25CLENBQUM7U0FDSDthQUFNO1lBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBb0MsT0FBMEIsQ0FBQyxJQUFNLENBQUMsQ0FBQztTQUN4RjtJQUNILENBQUM7SUF0RkQsd0RBc0ZDO0lBT0Q7Ozs7T0FJRztJQUNILFNBQVMsa0JBQWtCLENBQUMsSUFBYSxFQUFFLFVBQXlCO1FBQ2xFLDJFQUEyRTtRQUMzRSxPQUFPLElBQUksS0FBSyxTQUFTLElBQUksQ0FBQyxFQUFFLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDNUQsSUFBSSxlQUFlLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxFQUFFO2dCQUNyQyxtRkFBbUY7Z0JBQ25GLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxJQUFNLElBQUksR0FBRyxlQUFlLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQy9DLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtnQkFDakIsMkZBQTJGO2dCQUMzRixzRUFBc0U7Z0JBQ3RFLElBQU0sRUFBRSxHQUFHLGFBQWEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQzNDLElBQUksRUFBRSxLQUFLLElBQUksRUFBRTtvQkFDZixPQUFPLElBQUksQ0FBQztpQkFDYjtnQkFDRCxPQUFPLEVBQUMsRUFBRSxJQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUMsQ0FBQzthQUNuQjtZQUVELElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1NBQ3BCO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsU0FBUyxhQUFhLENBQUMsSUFBYSxFQUFFLFVBQXlCO1FBQzdELDBGQUEwRjtRQUMxRixPQUFPLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3RDLElBQUksZUFBZSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsRUFBRTtnQkFDckMsbUZBQW1GO2dCQUNuRixPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFFbkIsc0NBQXNDO1lBQ3RDLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtnQkFDdEIsT0FBTyxJQUFJLENBQUM7YUFDYjtTQUNGO1FBRUQsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xDLE9BQU8sRUFBRSxDQUFDLDBCQUEwQixDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJO1lBQzFFLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUU7Z0JBQ2pELE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxJQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoRSxPQUFPLFdBQVcsQ0FBQztRQUNyQixDQUFDLENBQWUsSUFBSSxJQUFJLENBQUM7SUFDM0IsQ0FBQztJQUVELElBQU0sZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO0lBRXpDLFNBQVMsZUFBZSxDQUFDLFVBQXlCLEVBQUUsSUFBYTtRQUMvRCxPQUFPLEVBQUUsQ0FBQywyQkFBMkIsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSTtZQUNuRixJQUFJLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFO2dCQUNqRCxPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsSUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEUsSUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2xELElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtnQkFDbEIsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELE9BQU8sSUFBSSw2QkFBa0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxTQUFTLGVBQWUsQ0FBQyxJQUFhLEVBQUUsVUFBeUI7UUFDL0QsT0FBTyxFQUFFLENBQUMsMkJBQTJCLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUk7WUFDbkYsSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRTtnQkFDakQsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELElBQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sV0FBVyxLQUFLLGFBQWEsQ0FBQztRQUN2QyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsU0FBZ0Isb0JBQW9CLENBQUMsVUFBeUI7UUFDNUQsT0FBTyxVQUFVLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQztZQUM3QyxFQUFFLENBQUMsWUFBWSxDQUFFLFVBQWtCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUhELG9EQUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBYnNvbHV0ZVNvdXJjZVNwYW4sIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Z2V0VG9rZW5BdFBvc2l0aW9ufSBmcm9tICcuLi8uLi91dGlsL3NyYy90eXBlc2NyaXB0JztcblxuaW1wb3J0IHtFeHRlcm5hbFRlbXBsYXRlU291cmNlTWFwcGluZywgVGVtcGxhdGVJZCwgVGVtcGxhdGVTb3VyY2VNYXBwaW5nfSBmcm9tICcuL2FwaSc7XG5cbi8qKlxuICogQSBgdHMuRGlhZ25vc3RpY2Agd2l0aCBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIGFib3V0IHRoZSBkaWFnbm9zdGljIHJlbGF0ZWQgdG8gdGVtcGxhdGVcbiAqIHR5cGUtY2hlY2tpbmcuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVEaWFnbm9zdGljIGV4dGVuZHMgdHMuRGlhZ25vc3RpYyB7XG4gIC8qKlxuICAgKiBUaGUgY29tcG9uZW50IHdpdGggdGhlIHRlbXBsYXRlIHRoYXQgcmVzdWx0ZWQgaW4gdGhpcyBkaWFnbm9zdGljLlxuICAgKi9cbiAgY29tcG9uZW50RmlsZTogdHMuU291cmNlRmlsZTtcbn1cblxuLyoqXG4gKiBBZGFwdGVyIGludGVyZmFjZSB3aGljaCBhbGxvd3MgdGhlIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgZGlhZ25vc3RpY3MgY29kZSB0byBpbnRlcnByZXQgb2Zmc2V0c1xuICogaW4gYSBUQ0IgYW5kIG1hcCB0aGVtIGJhY2sgdG8gb3JpZ2luYWwgbG9jYXRpb25zIGluIHRoZSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZVNvdXJjZVJlc29sdmVyIHtcbiAgLyoqXG4gICAqIEZvciB0aGUgZ2l2ZW4gdGVtcGxhdGUgaWQsIHJldHJpZXZlIHRoZSBvcmlnaW5hbCBzb3VyY2UgbWFwcGluZyB3aGljaCBkZXNjcmliZXMgaG93IHRoZSBvZmZzZXRzXG4gICAqIGluIHRoZSB0ZW1wbGF0ZSBzaG91bGQgYmUgaW50ZXJwcmV0ZWQuXG4gICAqL1xuICBnZXRTb3VyY2VNYXBwaW5nKGlkOiBUZW1wbGF0ZUlkKTogVGVtcGxhdGVTb3VyY2VNYXBwaW5nO1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGFuIGFic29sdXRlIHNvdXJjZSBzcGFuIGFzc29jaWF0ZWQgd2l0aCB0aGUgZ2l2ZW4gdGVtcGxhdGUgaWQgaW50byBhIGZ1bGxcbiAgICogYFBhcnNlU291cmNlU3BhbmAuIFRoZSByZXR1cm5lZCBwYXJzZSBzcGFuIGhhcyBsaW5lIGFuZCBjb2x1bW4gbnVtYmVycyBpbiBhZGRpdGlvbiB0byBvbmx5XG4gICAqIGFic29sdXRlIG9mZnNldHMgYW5kIGdpdmVzIGFjY2VzcyB0byB0aGUgb3JpZ2luYWwgdGVtcGxhdGUgc291cmNlLlxuICAgKi9cbiAgdG9QYXJzZVNvdXJjZVNwYW4oaWQ6IFRlbXBsYXRlSWQsIHNwYW46IEFic29sdXRlU291cmNlU3Bhbik6IFBhcnNlU291cmNlU3BhbnxudWxsO1xufVxuXG4vKipcbiAqIFdyYXBzIHRoZSBub2RlIGluIHBhcmVudGhlc2lzIHN1Y2ggdGhhdCBpbnNlcnRlZCBzcGFuIGNvbW1lbnRzIGJlY29tZSBhdHRhY2hlZCB0byB0aGUgcHJvcGVyXG4gKiBub2RlLiBUaGlzIGlzIGFuIGFsaWFzIGZvciBgdHMuY3JlYXRlUGFyZW5gIHdpdGggdGhlIGJlbmVmaXQgdGhhdCBpdCBzaWduaWZpZXMgdGhhdCB0aGVcbiAqIGluc2VydGVkIHBhcmVudGhlc2lzIGFyZSBmb3IgZGlhZ25vc3RpYyBwdXJwb3Nlcywgbm90IGZvciBjb3JyZWN0bmVzcyBvZiB0aGUgcmVuZGVyZWQgVENCIGNvZGUuXG4gKlxuICogTm90ZSB0aGF0IGl0IGlzIGltcG9ydGFudCB0aGF0IG5vZGVzIGFuZCBpdHMgYXR0YWNoZWQgY29tbWVudCBhcmUgbm90IHdyYXBwZWQgaW50byBwYXJlbnRoZXNpc1xuICogYnkgZGVmYXVsdCwgYXMgaXQgcHJldmVudHMgY29ycmVjdCB0cmFuc2xhdGlvbiBvZiBlLmcuIGRpYWdub3N0aWNzIHByb2R1Y2VkIGZvciBpbmNvcnJlY3QgbWV0aG9kXG4gKiBhcmd1bWVudHMuIFN1Y2ggZGlhZ25vc3RpY3Mgd291bGQgdGhlbiBiZSBwcm9kdWNlZCBmb3IgdGhlIHBhcmVudGhlc2lzZWQgbm9kZSB3aGVyZWFzIHRoZVxuICogcG9zaXRpb25hbCBjb21tZW50IHdvdWxkIGJlIGxvY2F0ZWQgd2l0aGluIHRoYXQgbm9kZSwgcmVzdWx0aW5nIGluIGEgbWlzbWF0Y2guXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cmFwRm9yRGlhZ25vc3RpY3MoZXhwcjogdHMuRXhwcmVzc2lvbik6IHRzLkV4cHJlc3Npb24ge1xuICByZXR1cm4gdHMuY3JlYXRlUGFyZW4oZXhwcik7XG59XG5cbmNvbnN0IElHTk9SRV9NQVJLRVIgPSAnaWdub3JlJztcblxuLyoqXG4gKiBBZGRzIGEgbWFya2VyIHRvIHRoZSBub2RlIHRoYXQgc2lnbmlmaWVzIHRoYXQgYW55IGVycm9ycyB3aXRoaW4gdGhlIG5vZGUgc2hvdWxkIG5vdCBiZSByZXBvcnRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlnbm9yZURpYWdub3N0aWNzKG5vZGU6IHRzLk5vZGUpOiB2b2lkIHtcbiAgdHMuYWRkU3ludGhldGljVHJhaWxpbmdDb21tZW50KFxuICAgICAgbm9kZSwgdHMuU3ludGF4S2luZC5NdWx0aUxpbmVDb21tZW50VHJpdmlhLCBJR05PUkVfTUFSS0VSLCAvKiBoYXNUcmFpbGluZ05ld0xpbmUgKi8gZmFsc2UpO1xufVxuXG4vKipcbiAqIEFkZHMgYSBzeW50aGV0aWMgY29tbWVudCB0byB0aGUgZXhwcmVzc2lvbiB0aGF0IHJlcHJlc2VudHMgdGhlIHBhcnNlIHNwYW4gb2YgdGhlIHByb3ZpZGVkIG5vZGUuXG4gKiBUaGlzIGNvbW1lbnQgY2FuIGxhdGVyIGJlIHJldHJpZXZlZCBhcyB0cml2aWEgb2YgYSBub2RlIHRvIHJlY292ZXIgb3JpZ2luYWwgc291cmNlIGxvY2F0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFBhcnNlU3BhbkluZm8obm9kZTogdHMuTm9kZSwgc3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuIHwgUGFyc2VTb3VyY2VTcGFuKTogdm9pZCB7XG4gIGxldCBjb21tZW50VGV4dDogc3RyaW5nO1xuICBpZiAoc3BhbiBpbnN0YW5jZW9mIEFic29sdXRlU291cmNlU3Bhbikge1xuICAgIGNvbW1lbnRUZXh0ID0gYCR7c3Bhbi5zdGFydH0sJHtzcGFuLmVuZH1gO1xuICB9IGVsc2Uge1xuICAgIGNvbW1lbnRUZXh0ID0gYCR7c3Bhbi5zdGFydC5vZmZzZXR9LCR7c3Bhbi5lbmQub2Zmc2V0fWA7XG4gIH1cbiAgdHMuYWRkU3ludGhldGljVHJhaWxpbmdDb21tZW50KFxuICAgICAgbm9kZSwgdHMuU3ludGF4S2luZC5NdWx0aUxpbmVDb21tZW50VHJpdmlhLCBjb21tZW50VGV4dCwgLyogaGFzVHJhaWxpbmdOZXdMaW5lICovIGZhbHNlKTtcbn1cblxuLyoqXG4gKiBBZGRzIGEgc3ludGhldGljIGNvbW1lbnQgdG8gdGhlIGZ1bmN0aW9uIGRlY2xhcmF0aW9uIHRoYXQgY29udGFpbnMgdGhlIHRlbXBsYXRlIGlkXG4gKiBvZiB0aGUgY2xhc3MgZGVjbGFyYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRUZW1wbGF0ZUlkKHRjYjogdHMuRnVuY3Rpb25EZWNsYXJhdGlvbiwgaWQ6IFRlbXBsYXRlSWQpOiB2b2lkIHtcbiAgdHMuYWRkU3ludGhldGljTGVhZGluZ0NvbW1lbnQodGNiLCB0cy5TeW50YXhLaW5kLk11bHRpTGluZUNvbW1lbnRUcml2aWEsIGlkLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHRoZSBkaWFnbm9zdGljIHNob3VsZCBiZSByZXBvcnRlZC4gU29tZSBkaWFnbm9zdGljcyBhcmUgcHJvZHVjZWQgYmVjYXVzZSBvZiB0aGVcbiAqIHdheSBUQ0JzIGFyZSBnZW5lcmF0ZWQ7IHRob3NlIGRpYWdub3N0aWNzIHNob3VsZCBub3QgYmUgcmVwb3J0ZWQgYXMgdHlwZSBjaGVjayBlcnJvcnMgb2YgdGhlXG4gKiB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZFJlcG9ydERpYWdub3N0aWMoZGlhZ25vc3RpYzogdHMuRGlhZ25vc3RpYyk6IGJvb2xlYW4ge1xuICBjb25zdCB7Y29kZX0gPSBkaWFnbm9zdGljO1xuICBpZiAoY29kZSA9PT0gNjEzMyAvKiAkdmFyIGlzIGRlY2xhcmVkIGJ1dCBpdHMgdmFsdWUgaXMgbmV2ZXIgcmVhZC4gKi8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gZWxzZSBpZiAoY29kZSA9PT0gNjE5OSAvKiBBbGwgdmFyaWFibGVzIGFyZSB1bnVzZWQuICovKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGVsc2UgaWYgKGNvZGUgPT09IDI2OTUgLyogTGVmdCBzaWRlIG9mIGNvbW1hIG9wZXJhdG9yIGlzIHVudXNlZCBhbmQgaGFzIG5vIHNpZGUgZWZmZWN0cy4gKi8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gZWxzZSBpZiAoY29kZSA9PT0gNzAwNiAvKiBQYXJhbWV0ZXIgJyRldmVudCcgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZS4gKi8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gdHJhbnNsYXRlIGEgVHlwZVNjcmlwdCBkaWFnbm9zdGljIHByb2R1Y2VkIGR1cmluZyB0ZW1wbGF0ZSB0eXBlLWNoZWNraW5nIHRvIHRoZWlyXG4gKiBsb2NhdGlvbiBvZiBvcmlnaW4sIGJhc2VkIG9uIHRoZSBjb21tZW50cyB0aGF0IGFyZSBlbWl0dGVkIGluIHRoZSBUQ0IgY29kZS5cbiAqXG4gKiBJZiB0aGUgZGlhZ25vc3RpYyBjb3VsZCBub3QgYmUgdHJhbnNsYXRlZCwgYG51bGxgIGlzIHJldHVybmVkIHRvIGluZGljYXRlIHRoYXQgdGhlIGRpYWdub3N0aWNcbiAqIHNob3VsZCBub3QgYmUgcmVwb3J0ZWQgYXQgYWxsLiBUaGlzIHByZXZlbnRzIGRpYWdub3N0aWNzIGZyb20gbm9uLVRDQiBjb2RlIGluIGEgdXNlcidzIHNvdXJjZVxuICogZmlsZSBmcm9tIGJlaW5nIHJlcG9ydGVkIGFzIHR5cGUtY2hlY2sgZXJyb3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlRGlhZ25vc3RpYyhcbiAgICBkaWFnbm9zdGljOiB0cy5EaWFnbm9zdGljLCByZXNvbHZlcjogVGVtcGxhdGVTb3VyY2VSZXNvbHZlcik6IHRzLkRpYWdub3N0aWN8bnVsbCB7XG4gIGlmIChkaWFnbm9zdGljLmZpbGUgPT09IHVuZGVmaW5lZCB8fCBkaWFnbm9zdGljLnN0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIExvY2F0ZSB0aGUgbm9kZSB0aGF0IHRoZSBkaWFnbm9zdGljIGlzIHJlcG9ydGVkIG9uIGFuZCBkZXRlcm1pbmUgaXRzIGxvY2F0aW9uIGluIHRoZSBzb3VyY2UuXG4gIGNvbnN0IG5vZGUgPSBnZXRUb2tlbkF0UG9zaXRpb24oZGlhZ25vc3RpYy5maWxlLCBkaWFnbm9zdGljLnN0YXJ0KTtcbiAgY29uc3Qgc291cmNlTG9jYXRpb24gPSBmaW5kU291cmNlTG9jYXRpb24obm9kZSwgZGlhZ25vc3RpYy5maWxlKTtcbiAgaWYgKHNvdXJjZUxvY2F0aW9uID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBOb3cgdXNlIHRoZSBleHRlcm5hbCByZXNvbHZlciB0byBvYnRhaW4gdGhlIGZ1bGwgYFBhcnNlU291cmNlRmlsZWAgb2YgdGhlIHRlbXBsYXRlLlxuICBjb25zdCBzcGFuID0gcmVzb2x2ZXIudG9QYXJzZVNvdXJjZVNwYW4oc291cmNlTG9jYXRpb24uaWQsIHNvdXJjZUxvY2F0aW9uLnNwYW4pO1xuICBpZiAoc3BhbiA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgbWFwcGluZyA9IHJlc29sdmVyLmdldFNvdXJjZU1hcHBpbmcoc291cmNlTG9jYXRpb24uaWQpO1xuICByZXR1cm4gbWFrZVRlbXBsYXRlRGlhZ25vc3RpYyhcbiAgICAgIG1hcHBpbmcsIHNwYW4sIGRpYWdub3N0aWMuY2F0ZWdvcnksIGRpYWdub3N0aWMuY29kZSwgZGlhZ25vc3RpYy5tZXNzYWdlVGV4dCk7XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGB0cy5EaWFnbm9zdGljYCBmb3IgYSBnaXZlbiBgUGFyc2VTb3VyY2VTcGFuYCB3aXRoaW4gYSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2VUZW1wbGF0ZURpYWdub3N0aWMoXG4gICAgbWFwcGluZzogVGVtcGxhdGVTb3VyY2VNYXBwaW5nLCBzcGFuOiBQYXJzZVNvdXJjZVNwYW4sIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnksXG4gICAgY29kZTogbnVtYmVyLCBtZXNzYWdlVGV4dDogc3RyaW5nIHwgdHMuRGlhZ25vc3RpY01lc3NhZ2VDaGFpbiwgcmVsYXRlZE1lc3NhZ2U/OiB7XG4gICAgICB0ZXh0OiBzdHJpbmcsXG4gICAgICBzcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgfSk6IFRlbXBsYXRlRGlhZ25vc3RpYyB7XG4gIGlmIChtYXBwaW5nLnR5cGUgPT09ICdkaXJlY3QnKSB7XG4gICAgbGV0IHJlbGF0ZWRJbmZvcm1hdGlvbjogdHMuRGlhZ25vc3RpY1JlbGF0ZWRJbmZvcm1hdGlvbltdfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAocmVsYXRlZE1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVsYXRlZEluZm9ybWF0aW9uID0gW3tcbiAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5NZXNzYWdlLFxuICAgICAgICBjb2RlOiAwLFxuICAgICAgICBmaWxlOiBtYXBwaW5nLm5vZGUuZ2V0U291cmNlRmlsZSgpLFxuICAgICAgICBzdGFydDogcmVsYXRlZE1lc3NhZ2Uuc3Bhbi5zdGFydC5vZmZzZXQsXG4gICAgICAgIGxlbmd0aDogcmVsYXRlZE1lc3NhZ2Uuc3Bhbi5lbmQub2Zmc2V0IC0gcmVsYXRlZE1lc3NhZ2Uuc3Bhbi5zdGFydC5vZmZzZXQsXG4gICAgICAgIG1lc3NhZ2VUZXh0OiByZWxhdGVkTWVzc2FnZS50ZXh0LFxuICAgICAgfV07XG4gICAgfVxuICAgIC8vIEZvciBkaXJlY3QgbWFwcGluZ3MsIHRoZSBlcnJvciBpcyBzaG93biBpbmxpbmUgYXMgbmd0c2Mgd2FzIGFibGUgdG8gcGlucG9pbnQgYSBzdHJpbmdcbiAgICAvLyBjb25zdGFudCB3aXRoaW4gdGhlIGBAQ29tcG9uZW50YCBkZWNvcmF0b3IgZm9yIHRoZSB0ZW1wbGF0ZS4gVGhpcyBhbGxvd3MgdXMgdG8gbWFwIHRoZSBlcnJvclxuICAgIC8vIGRpcmVjdGx5IGludG8gdGhlIGJ5dGVzIG9mIHRoZSBzb3VyY2UgZmlsZS5cbiAgICByZXR1cm4ge1xuICAgICAgc291cmNlOiAnbmd0c2MnLFxuICAgICAgY29kZSxcbiAgICAgIGNhdGVnb3J5LFxuICAgICAgbWVzc2FnZVRleHQsXG4gICAgICBmaWxlOiBtYXBwaW5nLm5vZGUuZ2V0U291cmNlRmlsZSgpLFxuICAgICAgY29tcG9uZW50RmlsZTogbWFwcGluZy5ub2RlLmdldFNvdXJjZUZpbGUoKSxcbiAgICAgIHN0YXJ0OiBzcGFuLnN0YXJ0Lm9mZnNldCxcbiAgICAgIGxlbmd0aDogc3Bhbi5lbmQub2Zmc2V0IC0gc3Bhbi5zdGFydC5vZmZzZXQsIHJlbGF0ZWRJbmZvcm1hdGlvbixcbiAgICB9O1xuICB9IGVsc2UgaWYgKG1hcHBpbmcudHlwZSA9PT0gJ2luZGlyZWN0JyB8fCBtYXBwaW5nLnR5cGUgPT09ICdleHRlcm5hbCcpIHtcbiAgICAvLyBGb3IgaW5kaXJlY3QgbWFwcGluZ3MgKHRlbXBsYXRlIHdhcyBkZWNsYXJlZCBpbmxpbmUsIGJ1dCBuZ3RzYyBjb3VsZG4ndCBtYXAgaXQgZGlyZWN0bHlcbiAgICAvLyB0byBhIHN0cmluZyBjb25zdGFudCBpbiB0aGUgZGVjb3JhdG9yKSwgdGhlIGNvbXBvbmVudCdzIGZpbGUgbmFtZSBpcyBnaXZlbiB3aXRoIGEgc3VmZml4XG4gICAgLy8gaW5kaWNhdGluZyBpdCdzIG5vdCB0aGUgVFMgZmlsZSBiZWluZyBkaXNwbGF5ZWQsIGJ1dCBhIHRlbXBsYXRlLlxuICAgIC8vIEZvciBleHRlcm5hbCB0ZW1vcGxhdGVzLCB0aGUgSFRNTCBmaWxlbmFtZSBpcyB1c2VkLlxuICAgIGNvbnN0IGNvbXBvbmVudFNmID0gbWFwcGluZy5jb21wb25lbnRDbGFzcy5nZXRTb3VyY2VGaWxlKCk7XG4gICAgY29uc3QgY29tcG9uZW50TmFtZSA9IG1hcHBpbmcuY29tcG9uZW50Q2xhc3MubmFtZS50ZXh0O1xuICAgIC8vIFRPRE8oYWx4aHViKTogcmVtb3ZlIGNhc3Qgd2hlbiBUUyBpbiBnMyBzdXBwb3J0cyB0aGlzIG5hcnJvd2luZy5cbiAgICBjb25zdCBmaWxlTmFtZSA9IG1hcHBpbmcudHlwZSA9PT0gJ2luZGlyZWN0JyA/XG4gICAgICAgIGAke2NvbXBvbmVudFNmLmZpbGVOYW1lfSAoJHtjb21wb25lbnROYW1lfSB0ZW1wbGF0ZSlgIDpcbiAgICAgICAgKG1hcHBpbmcgYXMgRXh0ZXJuYWxUZW1wbGF0ZVNvdXJjZU1hcHBpbmcpLnRlbXBsYXRlVXJsO1xuICAgIC8vIFRPRE8oYWx4aHViKTogaW52ZXN0aWdhdGUgY3JlYXRpbmcgYSBmYWtlIGB0cy5Tb3VyY2VGaWxlYCBoZXJlIGluc3RlYWQgb2YgaW52b2tpbmcgdGhlIFRTXG4gICAgLy8gcGFyc2VyIGFnYWluc3QgdGhlIHRlbXBsYXRlIChIVE1MIGlzIGp1c3QgcmVhbGx5IHN5bnRhY3RpY2FsbHkgaW52YWxpZCBUeXBlU2NyaXB0IGNvZGUgOykuXG4gICAgLy8gQWxzbyBpbnZlc3RpZ2F0ZSBjYWNoaW5nIHRoZSBmaWxlIHRvIGF2b2lkIHJ1bm5pbmcgdGhlIHBhcnNlciBtdWx0aXBsZSB0aW1lcy5cbiAgICBjb25zdCBzZiA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoXG4gICAgICAgIGZpbGVOYW1lLCBtYXBwaW5nLnRlbXBsYXRlLCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCBmYWxzZSwgdHMuU2NyaXB0S2luZC5KU1gpO1xuXG4gICAgbGV0IHJlbGF0ZWRJbmZvcm1hdGlvbjogdHMuRGlhZ25vc3RpY1JlbGF0ZWRJbmZvcm1hdGlvbltdID0gW107XG4gICAgaWYgKHJlbGF0ZWRNZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlbGF0ZWRJbmZvcm1hdGlvbi5wdXNoKHtcbiAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5NZXNzYWdlLFxuICAgICAgICBjb2RlOiAwLFxuICAgICAgICBmaWxlOiBzZixcbiAgICAgICAgc3RhcnQ6IHJlbGF0ZWRNZXNzYWdlLnNwYW4uc3RhcnQub2Zmc2V0LFxuICAgICAgICBsZW5ndGg6IHJlbGF0ZWRNZXNzYWdlLnNwYW4uZW5kLm9mZnNldCAtIHJlbGF0ZWRNZXNzYWdlLnNwYW4uc3RhcnQub2Zmc2V0LFxuICAgICAgICBtZXNzYWdlVGV4dDogcmVsYXRlZE1lc3NhZ2UudGV4dCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbGF0ZWRJbmZvcm1hdGlvbi5wdXNoKHtcbiAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuTWVzc2FnZSxcbiAgICAgIGNvZGU6IDAsXG4gICAgICBmaWxlOiBjb21wb25lbnRTZixcbiAgICAgIC8vIG1hcHBpbmcubm9kZSByZXByZXNlbnRzIGVpdGhlciB0aGUgJ3RlbXBsYXRlJyBvciAndGVtcGxhdGVVcmwnIGV4cHJlc3Npb24uIGdldFN0YXJ0KClcbiAgICAgIC8vIGFuZCBnZXRFbmQoKSBhcmUgdXNlZCBiZWNhdXNlIHRoZXkgZG9uJ3QgaW5jbHVkZSBzdXJyb3VuZGluZyB3aGl0ZXNwYWNlLlxuICAgICAgc3RhcnQ6IG1hcHBpbmcubm9kZS5nZXRTdGFydCgpLFxuICAgICAgbGVuZ3RoOiBtYXBwaW5nLm5vZGUuZ2V0RW5kKCkgLSBtYXBwaW5nLm5vZGUuZ2V0U3RhcnQoKSxcbiAgICAgIG1lc3NhZ2VUZXh0OiBgRXJyb3Igb2NjdXJzIGluIHRoZSB0ZW1wbGF0ZSBvZiBjb21wb25lbnQgJHtjb21wb25lbnROYW1lfS5gLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNvdXJjZTogJ25ndHNjJyxcbiAgICAgIGNhdGVnb3J5LFxuICAgICAgY29kZSxcbiAgICAgIG1lc3NhZ2VUZXh0LFxuICAgICAgZmlsZTogc2YsXG4gICAgICBjb21wb25lbnRGaWxlOiBjb21wb25lbnRTZixcbiAgICAgIHN0YXJ0OiBzcGFuLnN0YXJ0Lm9mZnNldCxcbiAgICAgIGxlbmd0aDogc3Bhbi5lbmQub2Zmc2V0IC0gc3Bhbi5zdGFydC5vZmZzZXQsXG4gICAgICAvLyBTaG93IGEgc2Vjb25kYXJ5IG1lc3NhZ2UgaW5kaWNhdGluZyB0aGUgY29tcG9uZW50IHdob3NlIHRlbXBsYXRlIGNvbnRhaW5zIHRoZSBlcnJvci5cbiAgICAgIHJlbGF0ZWRJbmZvcm1hdGlvbixcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBzb3VyY2UgbWFwcGluZyB0eXBlOiAkeyhtYXBwaW5nIGFzIHt0eXBlOiBzdHJpbmd9KS50eXBlfWApO1xuICB9XG59XG5cbmludGVyZmFjZSBTb3VyY2VMb2NhdGlvbiB7XG4gIGlkOiBUZW1wbGF0ZUlkO1xuICBzcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW47XG59XG5cbi8qKlxuICogVHJhdmVyc2VzIHVwIHRoZSBBU1Qgc3RhcnRpbmcgZnJvbSB0aGUgZ2l2ZW4gbm9kZSB0byBleHRyYWN0IHRoZSBzb3VyY2UgbG9jYXRpb24gZnJvbSBjb21tZW50c1xuICogdGhhdCBoYXZlIGJlZW4gZW1pdHRlZCBpbnRvIHRoZSBUQ0IuIElmIHRoZSBub2RlIGRvZXMgbm90IGV4aXN0IHdpdGhpbiBhIFRDQiwgb3IgaWYgYW4gaWdub3JlXG4gKiBtYXJrZXIgY29tbWVudCBpcyBmb3VuZCB1cCB0aGUgdHJlZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIG51bGwuXG4gKi9cbmZ1bmN0aW9uIGZpbmRTb3VyY2VMb2NhdGlvbihub2RlOiB0cy5Ob2RlLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogU291cmNlTG9jYXRpb258bnVsbCB7XG4gIC8vIFNlYXJjaCBmb3IgY29tbWVudHMgdW50aWwgdGhlIFRDQidzIGZ1bmN0aW9uIGRlY2xhcmF0aW9uIGlzIGVuY291bnRlcmVkLlxuICB3aGlsZSAobm9kZSAhPT0gdW5kZWZpbmVkICYmICF0cy5pc0Z1bmN0aW9uRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICBpZiAoaGFzSWdub3JlTWFya2VyKG5vZGUsIHNvdXJjZUZpbGUpKSB7XG4gICAgICAvLyBUaGVyZSdzIGFuIGlnbm9yZSBtYXJrZXIgb24gdGhpcyBub2RlLCBzbyB0aGUgZGlhZ25vc3RpYyBzaG91bGQgbm90IGJlIHJlcG9ydGVkLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgc3BhbiA9IHJlYWRTcGFuQ29tbWVudChzb3VyY2VGaWxlLCBub2RlKTtcbiAgICBpZiAoc3BhbiAhPT0gbnVsbCkge1xuICAgICAgLy8gT25jZSB0aGUgcG9zaXRpb25hbCBpbmZvcm1hdGlvbiBoYXMgYmVlbiBleHRyYWN0ZWQsIHNlYXJjaCBmdXJ0aGVyIHVwIHRoZSBUQ0IgdG8gZXh0cmFjdFxuICAgICAgLy8gdGhlIHVuaXF1ZSBpZCB0aGF0IGlzIGF0dGFjaGVkIHdpdGggdGhlIFRDQidzIGZ1bmN0aW9uIGRlY2xhcmF0aW9uLlxuICAgICAgY29uc3QgaWQgPSBnZXRUZW1wbGF0ZUlkKG5vZGUsIHNvdXJjZUZpbGUpO1xuICAgICAgaWYgKGlkID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtpZCwgc3Bhbn07XG4gICAgfVxuXG4gICAgbm9kZSA9IG5vZGUucGFyZW50O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldFRlbXBsYXRlSWQobm9kZTogdHMuTm9kZSwgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IFRlbXBsYXRlSWR8bnVsbCB7XG4gIC8vIFdhbGsgdXAgdG8gdGhlIGZ1bmN0aW9uIGRlY2xhcmF0aW9uIG9mIHRoZSBUQ0IsIHRoZSBmaWxlIGluZm9ybWF0aW9uIGlzIGF0dGFjaGVkIHRoZXJlLlxuICB3aGlsZSAoIXRzLmlzRnVuY3Rpb25EZWNsYXJhdGlvbihub2RlKSkge1xuICAgIGlmIChoYXNJZ25vcmVNYXJrZXIobm9kZSwgc291cmNlRmlsZSkpIHtcbiAgICAgIC8vIFRoZXJlJ3MgYW4gaWdub3JlIG1hcmtlciBvbiB0aGlzIG5vZGUsIHNvIHRoZSBkaWFnbm9zdGljIHNob3VsZCBub3QgYmUgcmVwb3J0ZWQuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbm9kZSA9IG5vZGUucGFyZW50O1xuXG4gICAgLy8gQmFpbCBvbmNlIHdlIGhhdmUgcmVhY2hlZCB0aGUgcm9vdC5cbiAgICBpZiAobm9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBjb25zdCBzdGFydCA9IG5vZGUuZ2V0RnVsbFN0YXJ0KCk7XG4gIHJldHVybiB0cy5mb3JFYWNoTGVhZGluZ0NvbW1lbnRSYW5nZShzb3VyY2VGaWxlLnRleHQsIHN0YXJ0LCAocG9zLCBlbmQsIGtpbmQpID0+IHtcbiAgICBpZiAoa2luZCAhPT0gdHMuU3ludGF4S2luZC5NdWx0aUxpbmVDb21tZW50VHJpdmlhKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29tbWVudFRleHQgPSBzb3VyY2VGaWxlLnRleHQuc3Vic3RyaW5nKHBvcyArIDIsIGVuZCAtIDIpO1xuICAgIHJldHVybiBjb21tZW50VGV4dDtcbiAgfSkgYXMgVGVtcGxhdGVJZCB8fCBudWxsO1xufVxuXG5jb25zdCBwYXJzZVNwYW5Db21tZW50ID0gL14oXFxkKyksKFxcZCspJC87XG5cbmZ1bmN0aW9uIHJlYWRTcGFuQ29tbWVudChzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBub2RlOiB0cy5Ob2RlKTogQWJzb2x1dGVTb3VyY2VTcGFufG51bGwge1xuICByZXR1cm4gdHMuZm9yRWFjaFRyYWlsaW5nQ29tbWVudFJhbmdlKHNvdXJjZUZpbGUudGV4dCwgbm9kZS5nZXRFbmQoKSwgKHBvcywgZW5kLCBraW5kKSA9PiB7XG4gICAgaWYgKGtpbmQgIT09IHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbW1lbnRUZXh0ID0gc291cmNlRmlsZS50ZXh0LnN1YnN0cmluZyhwb3MgKyAyLCBlbmQgLSAyKTtcbiAgICBjb25zdCBtYXRjaCA9IGNvbW1lbnRUZXh0Lm1hdGNoKHBhcnNlU3BhbkNvbW1lbnQpO1xuICAgIGlmIChtYXRjaCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBBYnNvbHV0ZVNvdXJjZVNwYW4oK21hdGNoWzFdLCArbWF0Y2hbMl0pO1xuICB9KSB8fCBudWxsO1xufVxuXG5mdW5jdGlvbiBoYXNJZ25vcmVNYXJrZXIobm9kZTogdHMuTm9kZSwgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHMuZm9yRWFjaFRyYWlsaW5nQ29tbWVudFJhbmdlKHNvdXJjZUZpbGUudGV4dCwgbm9kZS5nZXRFbmQoKSwgKHBvcywgZW5kLCBraW5kKSA9PiB7XG4gICAgaWYgKGtpbmQgIT09IHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbW1lbnRUZXh0ID0gc291cmNlRmlsZS50ZXh0LnN1YnN0cmluZyhwb3MgKyAyLCBlbmQgLSAyKTtcbiAgICByZXR1cm4gY29tbWVudFRleHQgPT09IElHTk9SRV9NQVJLRVI7XG4gIH0pID09PSB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNUZW1wbGF0ZURpYWdub3N0aWMoZGlhZ25vc3RpYzogdHMuRGlhZ25vc3RpYyk6IGRpYWdub3N0aWMgaXMgVGVtcGxhdGVEaWFnbm9zdGljIHtcbiAgcmV0dXJuIGRpYWdub3N0aWMuaGFzT3duUHJvcGVydHkoJ2NvbXBvbmVudEZpbGUnKSAmJlxuICAgICAgdHMuaXNTb3VyY2VGaWxlKChkaWFnbm9zdGljIGFzIGFueSkuY29tcG9uZW50RmlsZSk7XG59XG4iXX0=