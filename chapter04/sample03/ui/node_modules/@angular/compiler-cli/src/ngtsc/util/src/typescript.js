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
        define("@angular/compiler-cli/src/ngtsc/util/src/typescript", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var TS = /\.tsx?$/i;
    var D_TS = /\.d\.ts$/i;
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    function isDtsPath(filePath) {
        return D_TS.test(filePath);
    }
    exports.isDtsPath = isDtsPath;
    function isNonDeclarationTsPath(filePath) {
        return TS.test(filePath) && !D_TS.test(filePath);
    }
    exports.isNonDeclarationTsPath = isNonDeclarationTsPath;
    function isFromDtsFile(node) {
        var sf = node.getSourceFile();
        if (sf === undefined) {
            sf = ts.getOriginalNode(node).getSourceFile();
        }
        return sf !== undefined && sf.isDeclarationFile;
    }
    exports.isFromDtsFile = isFromDtsFile;
    function nodeNameForError(node) {
        if (node.name !== undefined && ts.isIdentifier(node.name)) {
            return node.name.text;
        }
        else {
            var kind = ts.SyntaxKind[node.kind];
            var _a = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart()), line = _a.line, character = _a.character;
            return kind + "@" + line + ":" + character;
        }
    }
    exports.nodeNameForError = nodeNameForError;
    function getSourceFile(node) {
        // In certain transformation contexts, `ts.Node.getSourceFile()` can actually return `undefined`,
        // despite the type signature not allowing it. In that event, get the `ts.SourceFile` via the
        // original node instead (which works).
        var directSf = node.getSourceFile();
        return directSf !== undefined ? directSf : ts.getOriginalNode(node).getSourceFile();
    }
    exports.getSourceFile = getSourceFile;
    function getSourceFileOrNull(program, fileName) {
        return program.getSourceFile(fileName) || null;
    }
    exports.getSourceFileOrNull = getSourceFileOrNull;
    function getTokenAtPosition(sf, pos) {
        // getTokenAtPosition is part of TypeScript's private API.
        return ts.getTokenAtPosition(sf, pos);
    }
    exports.getTokenAtPosition = getTokenAtPosition;
    function identifierOfNode(decl) {
        if (decl.name !== undefined && ts.isIdentifier(decl.name)) {
            return decl.name;
        }
        else {
            return null;
        }
    }
    exports.identifierOfNode = identifierOfNode;
    function isDeclaration(node) {
        return isValueDeclaration(node) || isTypeDeclaration(node);
    }
    exports.isDeclaration = isDeclaration;
    function isValueDeclaration(node) {
        return ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node) ||
            ts.isVariableDeclaration(node);
    }
    exports.isValueDeclaration = isValueDeclaration;
    function isTypeDeclaration(node) {
        return ts.isEnumDeclaration(node) || ts.isTypeAliasDeclaration(node) ||
            ts.isInterfaceDeclaration(node);
    }
    exports.isTypeDeclaration = isTypeDeclaration;
    function isExported(node) {
        var topLevel = node;
        if (ts.isVariableDeclaration(node) && ts.isVariableDeclarationList(node.parent)) {
            topLevel = node.parent.parent;
        }
        return topLevel.modifiers !== undefined &&
            topLevel.modifiers.some(function (modifier) { return modifier.kind === ts.SyntaxKind.ExportKeyword; });
    }
    exports.isExported = isExported;
    function getRootDirs(host, options) {
        var rootDirs = [];
        if (options.rootDirs !== undefined) {
            rootDirs.push.apply(rootDirs, tslib_1.__spread(options.rootDirs));
        }
        else if (options.rootDir !== undefined) {
            rootDirs.push(options.rootDir);
        }
        else {
            rootDirs.push(host.getCurrentDirectory());
        }
        // In Windows the above might not always return posix separated paths
        // See:
        // https://github.com/Microsoft/TypeScript/blob/3f7357d37f66c842d70d835bc925ec2a873ecfec/src/compiler/sys.ts#L650
        // Also compiler options might be set via an API which doesn't normalize paths
        return rootDirs.map(function (rootDir) { return file_system_1.absoluteFrom(rootDir); });
    }
    exports.getRootDirs = getRootDirs;
    function nodeDebugInfo(node) {
        var sf = getSourceFile(node);
        var _a = ts.getLineAndCharacterOfPosition(sf, node.pos), line = _a.line, character = _a.character;
        return "[" + sf.fileName + ": " + ts.SyntaxKind[node.kind] + " @ " + line + ":" + character + "]";
    }
    exports.nodeDebugInfo = nodeDebugInfo;
    /**
     * Resolve the specified `moduleName` using the given `compilerOptions` and `compilerHost`.
     *
     * This helper will attempt to use the `CompilerHost.resolveModuleNames()` method if available.
     * Otherwise it will fallback on the `ts.ResolveModuleName()` function.
     */
    function resolveModuleName(moduleName, containingFile, compilerOptions, compilerHost, moduleResolutionCache) {
        if (compilerHost.resolveModuleNames) {
            // FIXME: Additional parameters are required in TS3.6, but ignored in 3.5.
            // Remove the any cast once google3 is fully on TS3.6.
            return compilerHost
                .resolveModuleNames([moduleName], containingFile, undefined, undefined, compilerOptions)[0];
        }
        else {
            return ts
                .resolveModuleName(moduleName, containingFile, compilerOptions, compilerHost, moduleResolutionCache !== null ? moduleResolutionCache : undefined)
                .resolvedModule;
        }
    }
    exports.resolveModuleName = resolveModuleName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdXRpbC9zcmMvdHlwZXNjcmlwdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxJQUFNLEVBQUUsR0FBRyxVQUFVLENBQUM7SUFDdEIsSUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDO0lBRXpCLCtCQUFpQztJQUNqQywyRUFBK0Q7SUFFL0QsU0FBZ0IsU0FBUyxDQUFDLFFBQWdCO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRkQsOEJBRUM7SUFFRCxTQUFnQixzQkFBc0IsQ0FBQyxRQUFnQjtRQUNyRCxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFGRCx3REFFQztJQUVELFNBQWdCLGFBQWEsQ0FBQyxJQUFhO1FBQ3pDLElBQUksRUFBRSxHQUE0QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDdkQsSUFBSSxFQUFFLEtBQUssU0FBUyxFQUFFO1lBQ3BCLEVBQUUsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQy9DO1FBQ0QsT0FBTyxFQUFFLEtBQUssU0FBUyxJQUFJLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztJQUNsRCxDQUFDO0lBTkQsc0NBTUM7SUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxJQUFnQztRQUMvRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pELE9BQU8sSUFBSSxD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Q0FBQyxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pHO2FBQU07WUFDTCxPQUFPLEVBQUU7aUJBQ0osaUJBQWlCLENBQ2QsVUFBVSxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUN6RCxxQkFBcUIsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7aUJBQ3RFLGNBQWMsQ0FBQztTQUNyQjtJQUNILENBQUM7SUFoQkQsOENBZ0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5jb25zdCBUUyA9IC9cXC50c3g/JC9pO1xuY29uc3QgRF9UUyA9IC9cXC5kXFwudHMkL2k7XG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgYWJzb2x1dGVGcm9tfSBmcm9tICcuLi8uLi9maWxlX3N5c3RlbSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0R0c1BhdGgoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gRF9UUy50ZXN0KGZpbGVQYXRoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTm9uRGVjbGFyYXRpb25Uc1BhdGgoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gVFMudGVzdChmaWxlUGF0aCkgJiYgIURfVFMudGVzdChmaWxlUGF0aCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Zyb21EdHNGaWxlKG5vZGU6IHRzLk5vZGUpOiBib29sZWFuIHtcbiAgbGV0IHNmOiB0cy5Tb3VyY2VGaWxlfHVuZGVmaW5lZCA9IG5vZGUuZ2V0U291cmNlRmlsZSgpO1xuICBpZiAoc2YgPT09IHVuZGVmaW5lZCkge1xuICAgIHNmID0gdHMuZ2V0T3JpZ2luYWxOb2RlKG5vZGUpLmdldFNvdXJjZUZpbGUoKTtcbiAgfVxuICByZXR1cm4gc2YgIT09IHVuZGVmaW5lZCAmJiBzZi5pc0RlY2xhcmF0aW9uRmlsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vZGVOYW1lRm9yRXJyb3Iobm9kZTogdHMuTm9kZSAmIHtuYW1lPzogdHMuTm9kZX0pOiBzdHJpbmcge1xuICBpZiAobm9kZS5uYW1lICE9PSB1bmRlZmluZWQgJiYgdHMuaXNJZGVudGlmaWVyKG5vZGUubmFtZSkpIHtcbiAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQ7XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qga2luZCA9IHRzLlN5bnRheEtpbmRbbm9kZS5raW5kXTtcbiAgICBjb25zdCB7bGluZSwgY2hhcmFjdGVyfSA9XG4gICAgICAgIHRzLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKG5vZGUuZ2V0U291cmNlRmlsZSgpLCBub2RlLmdldFN0YXJ0KCkpO1xuICAgIHJldHVybiBgJHtraW5kfUAke2xpbmV9OiR7Y2hhcmFjdGVyfWA7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNvdXJjZUZpbGUobm9kZTogdHMuTm9kZSk6IHRzLlNvdXJjZUZpbGUge1xuICAvLyBJbiBjZXJ0YWluIHRyYW5zZm9ybWF0aW9uIGNvbnRleHRzLCBgdHMuTm9kZS5nZXRTb3VyY2VGaWxlKClgIGNhbiBhY3R1YWxseSByZXR1cm4gYHVuZGVmaW5lZGAsXG4gIC8vIGRlc3BpdGUgdGhlIHR5cGUgc2lnbmF0dXJlIG5vdCBhbGxvd2luZyBpdC4gSW4gdGhhdCBldmVudCwgZ2V0IHRoZSBgdHMuU291cmNlRmlsZWAgdmlhIHRoZVxuICAvLyBvcmlnaW5hbCBub2RlIGluc3RlYWQgKHdoaWNoIHdvcmtzKS5cbiAgY29uc3QgZGlyZWN0U2YgPSBub2RlLmdldFNvdXJjZUZpbGUoKSBhcyB0cy5Tb3VyY2VGaWxlIHwgdW5kZWZpbmVkO1xuICByZXR1cm4gZGlyZWN0U2YgIT09IHVuZGVmaW5lZCA/IGRpcmVjdFNmIDogdHMuZ2V0T3JpZ2luYWxOb2RlKG5vZGUpLmdldFNvdXJjZUZpbGUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNvdXJjZUZpbGVPck51bGwocHJvZ3JhbTogdHMuUHJvZ3JhbSwgZmlsZU5hbWU6IEFic29sdXRlRnNQYXRoKTogdHMuU291cmNlRmlsZXxcbiAgICBudWxsIHtcbiAgcmV0dXJuIHByb2dyYW0uZ2V0U291cmNlRmlsZShmaWxlTmFtZSkgfHwgbnVsbDtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VG9rZW5BdFBvc2l0aW9uKHNmOiB0cy5Tb3VyY2VGaWxlLCBwb3M6IG51bWJlcik6IHRzLk5vZGUge1xuICAvLyBnZXRUb2tlbkF0UG9zaXRpb24gaXMgcGFydCBvZiBUeXBlU2NyaXB0J3MgcHJpdmF0ZSBBUEkuXG4gIHJldHVybiAodHMgYXMgYW55KS5nZXRUb2tlbkF0UG9zaXRpb24oc2YsIHBvcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGlmaWVyT2ZOb2RlKGRlY2w6IHRzLk5vZGUgJiB7bmFtZT86IHRzLk5vZGV9KTogdHMuSWRlbnRpZmllcnxudWxsIHtcbiAgaWYgKGRlY2wubmFtZSAhPT0gdW5kZWZpbmVkICYmIHRzLmlzSWRlbnRpZmllcihkZWNsLm5hbWUpKSB7XG4gICAgcmV0dXJuIGRlY2wubmFtZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEZWNsYXJhdGlvbihub2RlOiB0cy5Ob2RlKTogbm9kZSBpcyB0cy5EZWNsYXJhdGlvbiB7XG4gIHJldHVybiBpc1ZhbHVlRGVjbGFyYXRpb24obm9kZSkgfHwgaXNUeXBlRGVjbGFyYXRpb24obm9kZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbHVlRGVjbGFyYXRpb24obm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgdHMuQ2xhc3NEZWNsYXJhdGlvbnxcbiAgICB0cy5GdW5jdGlvbkRlY2xhcmF0aW9ufHRzLlZhcmlhYmxlRGVjbGFyYXRpb24ge1xuICByZXR1cm4gdHMuaXNDbGFzc0RlY2xhcmF0aW9uKG5vZGUpIHx8IHRzLmlzRnVuY3Rpb25EZWNsYXJhdGlvbihub2RlKSB8fFxuICAgICAgdHMuaXNWYXJpYWJsZURlY2xhcmF0aW9uKG5vZGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNUeXBlRGVjbGFyYXRpb24obm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgdHMuRW51bURlY2xhcmF0aW9ufFxuICAgIHRzLlR5cGVBbGlhc0RlY2xhcmF0aW9ufHRzLkludGVyZmFjZURlY2xhcmF0aW9uIHtcbiAgcmV0dXJuIHRzLmlzRW51bURlY2xhcmF0aW9uKG5vZGUpIHx8IHRzLmlzVHlwZUFsaWFzRGVjbGFyYXRpb24obm9kZSkgfHxcbiAgICAgIHRzLmlzSW50ZXJmYWNlRGVjbGFyYXRpb24obm9kZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0V4cG9ydGVkKG5vZGU6IHRzLkRlY2xhcmF0aW9uKTogYm9vbGVhbiB7XG4gIGxldCB0b3BMZXZlbDogdHMuTm9kZSA9IG5vZGU7XG4gIGlmICh0cy5pc1ZhcmlhYmxlRGVjbGFyYXRpb24obm9kZSkgJiYgdHMuaXNWYXJpYWJsZURlY2xhcmF0aW9uTGlzdChub2RlLnBhcmVudCkpIHtcbiAgICB0b3BMZXZlbCA9IG5vZGUucGFyZW50LnBhcmVudDtcbiAgfVxuICByZXR1cm4gdG9wTGV2ZWwubW9kaWZpZXJzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIHRvcExldmVsLm1vZGlmaWVycy5zb21lKG1vZGlmaWVyID0+IG1vZGlmaWVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXhwb3J0S2V5d29yZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSb290RGlycyhob3N0OiB0cy5Db21waWxlckhvc3QsIG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucyk6IEFic29sdXRlRnNQYXRoW10ge1xuICBjb25zdCByb290RGlyczogc3RyaW5nW10gPSBbXTtcbiAgaWYgKG9wdGlvbnMucm9vdERpcnMgIT09IHVuZGVmaW5lZCkge1xuICAgIHJvb3REaXJzLnB1c2goLi4ub3B0aW9ucy5yb290RGlycyk7XG4gIH0gZWxzZSBpZiAob3B0aW9ucy5yb290RGlyICE9PSB1bmRlZmluZWQpIHtcbiAgICByb290RGlycy5wdXNoKG9wdGlvbnMucm9vdERpcik7XG4gIH0gZWxzZSB7XG4gICAgcm9vdERpcnMucHVzaChob3N0LmdldEN1cnJlbnREaXJlY3RvcnkoKSk7XG4gIH1cblxuICAvLyBJbiBXaW5kb3dzIHRoZSBhYm92ZSBtaWdodCBub3QgYWx3YXlzIHJldHVybiBwb3NpeCBzZXBhcmF0ZWQgcGF0aHNcbiAgLy8gU2VlOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvYmxvYi8zZjczNTdkMzdmNjZjODQyZDcwZDgzNWJjOTI1ZWMyYTg3M2VjZmVjL3NyYy9jb21waWxlci9zeXMudHMjTDY1MFxuICAvLyBBbHNvIGNvbXBpbGVyIG9wdGlvbnMgbWlnaHQgYmUgc2V0IHZpYSBhbiBBUEkgd2hpY2ggZG9lc24ndCBub3JtYWxpemUgcGF0aHNcbiAgcmV0dXJuIHJvb3REaXJzLm1hcChyb290RGlyID0+IGFic29sdXRlRnJvbShyb290RGlyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub2RlRGVidWdJbmZvKG5vZGU6IHRzLk5vZGUpOiBzdHJpbmcge1xuICBjb25zdCBzZiA9IGdldFNvdXJjZUZpbGUobm9kZSk7XG4gIGNvbnN0IHtsaW5lLCBjaGFyYWN0ZXJ9ID0gdHMuZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24oc2YsIG5vZGUucG9zKTtcbiAgcmV0dXJuIGBbJHtzZi5maWxlTmFtZX06ICR7dHMuU3ludGF4S2luZFtub2RlLmtpbmRdfSBAICR7bGluZX06JHtjaGFyYWN0ZXJ9XWA7XG59XG5cbi8qKlxuICogUmVzb2x2ZSB0aGUgc3BlY2lmaWVkIGBtb2R1bGVOYW1lYCB1c2luZyB0aGUgZ2l2ZW4gYGNvbXBpbGVyT3B0aW9uc2AgYW5kIGBjb21waWxlckhvc3RgLlxuICpcbiAqIFRoaXMgaGVscGVyIHdpbGwgYXR0ZW1wdCB0byB1c2UgdGhlIGBDb21waWxlckhvc3QucmVzb2x2ZU1vZHVsZU5hbWVzKClgIG1ldGhvZCBpZiBhdmFpbGFibGUuXG4gKiBPdGhlcndpc2UgaXQgd2lsbCBmYWxsYmFjayBvbiB0aGUgYHRzLlJlc29sdmVNb2R1bGVOYW1lKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZU1vZHVsZU5hbWUoXG4gICAgbW9kdWxlTmFtZTogc3RyaW5nLCBjb250YWluaW5nRmlsZTogc3RyaW5nLCBjb21waWxlck9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucyxcbiAgICBjb21waWxlckhvc3Q6IHRzLkNvbXBpbGVySG9zdCxcbiAgICBtb2R1bGVSZXNvbHV0aW9uQ2FjaGU6IHRzLk1vZHVsZVJlc29sdXRpb25DYWNoZSB8IG51bGwpOiB0cy5SZXNvbHZlZE1vZHVsZXx1bmRlZmluZWQge1xuICBpZiAoY29tcGlsZXJIb3N0LnJlc29sdmVNb2R1bGVOYW1lcykge1xuICAgIC8vIEZJWE1FOiBBZGRpdGlvbmFsIHBhcmFtZXRlcnMgYXJlIHJlcXVpcmVkIGluIFRTMy42LCBidXQgaWdub3JlZCBpbiAzLjUuXG4gICAgLy8gUmVtb3ZlIHRoZSBhbnkgY2FzdCBvbmNlIGdvb2dsZTMgaXMgZnVsbHkgb24gVFMzLjYuXG4gICAgcmV0dXJuIChjb21waWxlckhvc3QgYXMgYW55KVxuICAgICAgICAucmVzb2x2ZU1vZHVsZU5hbWVzKFttb2R1bGVOYW1lXSwgY29udGFpbmluZ0ZpbGUsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjb21waWxlck9wdGlvbnMpWzBdO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0c1xuICAgICAgICAucmVzb2x2ZU1vZHVsZU5hbWUoXG4gICAgICAgICAgICBtb2R1bGVOYW1lLCBjb250YWluaW5nRmlsZSwgY29tcGlsZXJPcHRpb25zLCBjb21waWxlckhvc3QsXG4gICAgICAgICAgICBtb2R1bGVSZXNvbHV0aW9uQ2FjaGUgIT09IG51bGwgPyBtb2R1bGVSZXNvbHV0aW9uQ2FjaGUgOiB1bmRlZmluZWQpXG4gICAgICAgIC5yZXNvbHZlZE1vZHVsZTtcbiAgfVxufVxuXG4vKipcbiAqIEFzc2VydHMgdGhhdCB0aGUga2V5cyBgS2AgZm9ybSBhIHN1YnNldCBvZiB0aGUga2V5cyBvZiBgVGAuXG4gKi9cbmV4cG9ydCB0eXBlIFN1YnNldE9mS2V5czxULCBLIGV4dGVuZHMga2V5b2YgVD4gPSBLO1xuIl19