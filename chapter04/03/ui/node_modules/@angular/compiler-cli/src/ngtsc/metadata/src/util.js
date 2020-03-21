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
        define("@angular/compiler-cli/src/ngtsc/metadata/src/util", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/ngtsc/util/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    function extractReferencesFromType(checker, def, ngModuleImportedFrom, resolutionContext) {
        if (!ts.isTupleTypeNode(def)) {
            return [];
        }
        return def.elementTypes.map(function (element) {
            if (!ts.isTypeQueryNode(element)) {
                throw new Error("Expected TypeQueryNode: " + typescript_1.nodeDebugInfo(element));
            }
            var type = element.exprName;
            var _a = reflection_1.reflectTypeEntityToDeclaration(type, checker), node = _a.node, from = _a.from;
            if (!reflection_1.isNamedClassDeclaration(node)) {
                throw new Error("Expected named ClassDeclaration: " + typescript_1.nodeDebugInfo(node));
            }
            var specifier = (from !== null && !from.startsWith('.') ? from : ngModuleImportedFrom);
            if (specifier !== null) {
                return new imports_1.Reference(node, { specifier: specifier, resolutionContext: resolutionContext });
            }
            else {
                return new imports_1.Reference(node);
            }
        });
    }
    exports.extractReferencesFromType = extractReferencesFromType;
    function readStringType(type) {
        if (!ts.isLiteralTypeNode(type) || !ts.isStringLiteral(type.literal)) {
            return null;
        }
        return type.literal.text;
    }
    exports.readStringType = readStringType;
    function readStringMapType(type) {
        if (!ts.isTypeLiteralNode(type)) {
            return {};
        }
        var obj = {};
        type.members.forEach(function (member) {
            if (!ts.isPropertySignature(member) || member.type === undefined || member.name === undefined ||
                !ts.isStringLiteral(member.name)) {
                return;
            }
            var value = readStringType(member.type);
            if (value === null) {
                return null;
            }
            obj[member.name.text] = value;
        });
        return obj;
    }
    exports.readStringMapType = readStringMapType;
    function readStringArrayType(type) {
        if (!ts.isTupleTypeNode(type)) {
            return [];
        }
        var res = [];
        type.elementTypes.forEach(function (el) {
            if (!ts.isLiteralTypeNode(el) || !ts.isStringLiteral(el.literal)) {
                return;
            }
            res.push(el.literal.text);
        });
        return res;
    }
    exports.readStringArrayType = readStringArrayType;
    function extractDirectiveGuards(node, reflector) {
        var staticMembers = reflector.getMembersOfClass(node).filter(function (member) { return member.isStatic; });
        var ngTemplateGuards = staticMembers.map(extractTemplateGuard)
            .filter(function (guard) { return guard !== null; });
        var hasNgTemplateContextGuard = staticMembers.some(function (member) { return member.kind === reflection_1.ClassMemberKind.Method && member.name === 'ngTemplateContextGuard'; });
        var coercedInputFields = new Set(staticMembers.map(extractCoercedInput)
            .filter(function (inputName) { return inputName !== null; }));
        return { hasNgTemplateContextGuard: hasNgTemplateContextGuard, ngTemplateGuards: ngTemplateGuards, coercedInputFields: coercedInputFields };
    }
    exports.extractDirectiveGuards = extractDirectiveGuards;
    function extractTemplateGuard(member) {
        if (!member.name.startsWith('ngTemplateGuard_')) {
            return null;
        }
        var inputName = afterUnderscore(member.name);
        if (member.kind === reflection_1.ClassMemberKind.Property) {
            var type = null;
            if (member.type !== null && ts.isLiteralTypeNode(member.type) &&
                ts.isStringLiteral(member.type.literal)) {
                type = member.type.literal.text;
            }
            // Only property members with string literal type 'binding' are considered as template guard.
            if (type !== 'binding') {
                return null;
            }
            return { inputName: inputName, type: type };
        }
        else if (member.kind === reflection_1.ClassMemberKind.Method) {
            return { inputName: inputName, type: 'invocation' };
        }
        else {
            return null;
        }
    }
    function extractCoercedInput(member) {
        if (member.kind !== reflection_1.ClassMemberKind.Property || !member.name.startsWith('ngAcceptInputType_')) {
            return null;
        }
        return afterUnderscore(member.name);
    }
    /**
     * A `MetadataReader` that reads from an ordered set of child readers until it obtains the requested
     * metadata.
     *
     * This is used to combine `MetadataReader`s that read from different sources (e.g. from a registry
     * and from .d.ts files).
     */
    var CompoundMetadataReader = /** @class */ (function () {
        function CompoundMetadataReader(readers) {
            this.readers = readers;
        }
        CompoundMetadataReader.prototype.getDirectiveMetadata = function (node) {
            var e_1, _a;
            try {
                for (var _b = tslib_1.__values(this.readers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var reader = _c.value;
                    var meta = reader.getDirectiveMetadata(node);
                    if (meta !== null) {
                        return meta;
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
            return null;
        };
        CompoundMetadataReader.prototype.getNgModuleMetadata = function (node) {
            var e_2, _a;
            try {
                for (var _b = tslib_1.__values(this.readers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var reader = _c.value;
                    var meta = reader.getNgModuleMetadata(node);
                    if (meta !== null) {
                        return meta;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return null;
        };
        CompoundMetadataReader.prototype.getPipeMetadata = function (node) {
            var e_3, _a;
            try {
                for (var _b = tslib_1.__values(this.readers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var reader = _c.value;
                    var meta = reader.getPipeMetadata(node);
                    if (meta !== null) {
                        return meta;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return null;
        };
        return CompoundMetadataReader;
    }());
    exports.CompoundMetadataReader = CompoundMetadataReader;
    function afterUnderscore(str) {
        var pos = str.indexOf('_');
        if (pos === -1) {
            throw new Error("Expected '" + str + "' to contain '_'");
        }
        return str.substr(pos + 1);
    }
    /** Returns whether a class declaration has the necessary class fields to make it injectable. */
    function hasInjectableFields(clazz, host) {
        var members = host.getMembersOfClass(clazz);
        return members.some(function (_a) {
            var isStatic = _a.isStatic, name = _a.name;
            return isStatic && (name === 'ɵprov' || name === 'ɵfac' || name === 'ɵinj');
        });
    }
    exports.hasInjectableFields = hasInjectableFields;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvbWV0YWRhdGEvc3JjL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBRWpDLG1FQUF3QztJQUN4Qyx5RUFBeUo7SUFDekosa0ZBQXdEO0lBSXhELFNBQWdCLHlCQUF5QixDQUNyQyxPQUF1QixFQUFFLEdBQWdCLEVBQUUsb0JBQW1DLEVBQzlFLGlCQUF5QjtRQUMzQixJQUFJLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM1QixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsT0FBTyxHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFBLE9BQU87WUFDakMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTJCLDBCQUFhLENBQUMsT0FBTyxDQUFHLENBQUMsQ0FBQzthQUN0RTtZQUNELElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7WUFDeEIsSUFBQSwrREFBNEQsRUFBM0QsY0FBSSxFQUFFLGNBQXFELENBQUM7WUFDbkUsSUFBSSxDQUFDLG9DQUF1QixDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNsQyxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFvQywwQkFBYSxDQUFDLElBQUksQ0FBRyxDQUFDLENBQUM7YUFDNUU7WUFDRCxJQUFNLFNBQVMsR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDekYsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO2dCQUN0QixPQUFPLElBQUksbUJBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBQyxTQUFTLFdBQUEsRUFBRSxpQkFBaUIsbUJBQUEsRUFBQyxDQUFDLENBQUM7YUFDNUQ7aUJBQU07Z0JBQ0wsT0FBTyxJQUFJLG1CQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDNUI7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUF0QkQsOERBc0JDO0lBRUQsU0FBZ0IsY0FBYyxDQUFDLElBQWlCO1FBQzlDLElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNwRSxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztJQUMzQixDQUFDO0lBTEQsd0NBS0M7SUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxJQUFpQjtRQUNqRCxJQUFJLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQy9CLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFDRCxJQUFNLEdBQUcsR0FBNEIsRUFBRSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTTtZQUN6QixJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUztnQkFDekYsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDcEMsT0FBTzthQUNSO1lBQ0QsSUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQ2xCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFqQkQsOENBaUJDO0lBRUQsU0FBZ0IsbUJBQW1CLENBQUMsSUFBaUI7UUFDbkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDN0IsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUNELElBQU0sR0FBRyxHQUFhLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUU7WUFDMUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNoRSxPQUFPO2FBQ1I7WUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFaRCxrREFZQztJQUdELFNBQWdCLHNCQUFzQixDQUFDLElBQXNCLEVBQUUsU0FBeUI7UUFLdEYsSUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLE1BQU0sQ0FBQyxRQUFRLEVBQWYsQ0FBZSxDQUFDLENBQUM7UUFDMUYsSUFBTSxnQkFBZ0IsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDO2FBQ2xDLE1BQU0sQ0FBQyxVQUFDLEtBQUssSUFBaUMsT0FBQSxLQUFLLEtBQUssSUFBSSxFQUFkLENBQWMsQ0FBQyxDQUFDO1FBQzVGLElBQU0seUJBQXlCLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FDaEQsVUFBQSxNQUFNLElBQUksT0FBQSxNQUFNLENBQUMsSUFBSSxLQUFLLDRCQUFlLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssd0JBQXdCLEVBQWxGLENBQWtGLENBQUMsQ0FBQztRQUVsRyxJQUFNLGtCQUFrQixHQUNwQixJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDO2FBQ2pDLE1BQU0sQ0FBQyxVQUFDLFNBQVMsSUFBMEIsT0FBQSxTQUFTLEtBQUssSUFBSSxFQUFsQixDQUFrQixDQUFDLENBQUMsQ0FBQztRQUNqRixPQUFPLEVBQUMseUJBQXlCLDJCQUFBLEVBQUUsZ0JBQWdCLGtCQUFBLEVBQUUsa0JBQWtCLG9CQUFBLEVBQUMsQ0FBQztJQUMzRSxDQUFDO0lBZkQsd0RBZUM7SUFFRCxTQUFTLG9CQUFvQixDQUFDLE1BQW1CO1FBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1lBQy9DLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFNLFNBQVMsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyw0QkFBZSxDQUFDLFFBQVEsRUFBRTtZQUM1QyxJQUFJLElBQUksR0FBZ0IsSUFBSSxDQUFDO1lBQzdCLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksRUFBRSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ3pELEVBQUUsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDM0MsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQzthQUNqQztZQUVELDZGQUE2RjtZQUM3RixJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7Z0JBQ3RCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxPQUFPLEVBQUMsU0FBUyxXQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUMsQ0FBQztTQUMxQjthQUFNLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyw0QkFBZSxDQUFDLE1BQU0sRUFBRTtZQUNqRCxPQUFPLEVBQUMsU0FBUyxXQUFBLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQyxDQUFDO1NBQ3hDO2FBQU07WUFDTCxPQUFPLElBQUksQ0FBQztTQUNiO0lBQ0gsQ0FBQztJQUVELFNBQVMsbUJBQW1CLENBQUMsTUFBbUI7UUFDOUMsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLDRCQUFlLENBQUMsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsRUFBRTtZQUM3RixPQUFPLElBQU0sQ0FBQztTQUNmO1FBQ0QsT0FBTyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSDtRQUNFLGdDQUFvQixPQUF5QjtZQUF6QixZQUFPLEdBQVAsT0FBTyxDQUFrQjtRQUFHLENBQUM7UUFFakQscURBQW9CLEdBQXBCLFVBQXFCLElBQWlEOzs7Z0JBQ3BFLEtBQXFCLElBQUEsS0FBQSxpQkFBQSxJQUFJLENBQUMsT0FBTyxDQUFBLGdCQUFBLDRCQUFFO29CQUE5QixJQUFNLE1BQU0sV0FBQTtvQkFDZixJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQy9DLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTt3QkFDakIsT0FBTyxJQUFJLENBQUM7cUJBQ2I7aUJBQ0Y7Ozs7Ozs7OztZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELG9EQUFtQixHQUFuQixVQUFvQixJQUFpRDs7O2dCQUNuRSxLQUFxQixJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQSxnQkFBQSw0QkFBRTtvQkFBOUIsSUFBTSxNQUFNLFdBQUE7b0JBQ2YsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM5QyxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7d0JBQ2pCLE9BQU8sSUFBSSxDQUFDO3FCQUNiO2lCQUNGOzs7Ozs7Ozs7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxnREFBZSxHQUFmLFVBQWdCLElBQWlEOzs7Z0JBQy9ELEtBQXFCLElBQUEsS0FBQSxpQkFBQSxJQUFJLENBQUMsT0FBTyxDQUFBLGdCQUFBLDRCQUFFO29CQUE5QixJQUFNLE1BQU0sV0FBQTtvQkFDZixJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMxQyxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7d0JBQ2pCLE9BQU8sSUFBSSxDQUFDO3FCQUNiO2lCQUNGOzs7Ozs7Ozs7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDSCw2QkFBQztJQUFELENBQUMsQUEvQkQsSUErQkM7SUEvQlksd0RBQXNCO0lBaUNuQyxTQUFTLGVBQWUsQ0FBQyxHQUFXO1FBQ2xDLElBQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDZCxNQUFNLElBQUksS0FBSyxDQUFDLGVBQWEsR0FBRyxxQkFBa0IsQ0FBQyxDQUFDO1NBQ3JEO1FBQ0QsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQsZ0dBQWdHO0lBQ2hHLFNBQWdCLG1CQUFtQixDQUFDLEtBQXVCLEVBQUUsSUFBb0I7UUFDL0UsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlDLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FDZixVQUFDLEVBQWdCO2dCQUFmLHNCQUFRLEVBQUUsY0FBSTtZQUFNLE9BQUEsUUFBUSxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sSUFBSSxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxNQUFNLENBQUM7UUFBcEUsQ0FBb0UsQ0FBQyxDQUFDO0lBQ2xHLENBQUM7SUFKRCxrREFJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7UmVmZXJlbmNlfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgQ2xhc3NNZW1iZXIsIENsYXNzTWVtYmVyS2luZCwgUmVmbGVjdGlvbkhvc3QsIGlzTmFtZWRDbGFzc0RlY2xhcmF0aW9uLCByZWZsZWN0VHlwZUVudGl0eVRvRGVjbGFyYXRpb259IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtub2RlRGVidWdJbmZvfSBmcm9tICcuLi8uLi91dGlsL3NyYy90eXBlc2NyaXB0JztcblxuaW1wb3J0IHtEaXJlY3RpdmVNZXRhLCBNZXRhZGF0YVJlYWRlciwgTmdNb2R1bGVNZXRhLCBQaXBlTWV0YSwgVGVtcGxhdGVHdWFyZE1ldGF9IGZyb20gJy4vYXBpJztcblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RSZWZlcmVuY2VzRnJvbVR5cGUoXG4gICAgY2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIGRlZjogdHMuVHlwZU5vZGUsIG5nTW9kdWxlSW1wb3J0ZWRGcm9tOiBzdHJpbmcgfCBudWxsLFxuICAgIHJlc29sdXRpb25Db250ZXh0OiBzdHJpbmcpOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj5bXSB7XG4gIGlmICghdHMuaXNUdXBsZVR5cGVOb2RlKGRlZikpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgcmV0dXJuIGRlZi5lbGVtZW50VHlwZXMubWFwKGVsZW1lbnQgPT4ge1xuICAgIGlmICghdHMuaXNUeXBlUXVlcnlOb2RlKGVsZW1lbnQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIFR5cGVRdWVyeU5vZGU6ICR7bm9kZURlYnVnSW5mbyhlbGVtZW50KX1gKTtcbiAgICB9XG4gICAgY29uc3QgdHlwZSA9IGVsZW1lbnQuZXhwck5hbWU7XG4gICAgY29uc3Qge25vZGUsIGZyb219ID0gcmVmbGVjdFR5cGVFbnRpdHlUb0RlY2xhcmF0aW9uKHR5cGUsIGNoZWNrZXIpO1xuICAgIGlmICghaXNOYW1lZENsYXNzRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgbmFtZWQgQ2xhc3NEZWNsYXJhdGlvbjogJHtub2RlRGVidWdJbmZvKG5vZGUpfWApO1xuICAgIH1cbiAgICBjb25zdCBzcGVjaWZpZXIgPSAoZnJvbSAhPT0gbnVsbCAmJiAhZnJvbS5zdGFydHNXaXRoKCcuJykgPyBmcm9tIDogbmdNb2R1bGVJbXBvcnRlZEZyb20pO1xuICAgIGlmIChzcGVjaWZpZXIgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBuZXcgUmVmZXJlbmNlKG5vZGUsIHtzcGVjaWZpZXIsIHJlc29sdXRpb25Db250ZXh0fSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgUmVmZXJlbmNlKG5vZGUpO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkU3RyaW5nVHlwZSh0eXBlOiB0cy5UeXBlTm9kZSk6IHN0cmluZ3xudWxsIHtcbiAgaWYgKCF0cy5pc0xpdGVyYWxUeXBlTm9kZSh0eXBlKSB8fCAhdHMuaXNTdHJpbmdMaXRlcmFsKHR5cGUubGl0ZXJhbCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gdHlwZS5saXRlcmFsLnRleHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkU3RyaW5nTWFwVHlwZSh0eXBlOiB0cy5UeXBlTm9kZSk6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9IHtcbiAgaWYgKCF0cy5pc1R5cGVMaXRlcmFsTm9kZSh0eXBlKSkge1xuICAgIHJldHVybiB7fTtcbiAgfVxuICBjb25zdCBvYmo6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIHR5cGUubWVtYmVycy5mb3JFYWNoKG1lbWJlciA9PiB7XG4gICAgaWYgKCF0cy5pc1Byb3BlcnR5U2lnbmF0dXJlKG1lbWJlcikgfHwgbWVtYmVyLnR5cGUgPT09IHVuZGVmaW5lZCB8fCBtZW1iZXIubmFtZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICF0cy5pc1N0cmluZ0xpdGVyYWwobWVtYmVyLm5hbWUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlID0gcmVhZFN0cmluZ1R5cGUobWVtYmVyLnR5cGUpO1xuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIG9ialttZW1iZXIubmFtZS50ZXh0XSA9IHZhbHVlO1xuICB9KTtcbiAgcmV0dXJuIG9iajtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRTdHJpbmdBcnJheVR5cGUodHlwZTogdHMuVHlwZU5vZGUpOiBzdHJpbmdbXSB7XG4gIGlmICghdHMuaXNUdXBsZVR5cGVOb2RlKHR5cGUpKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IHJlczogc3RyaW5nW10gPSBbXTtcbiAgdHlwZS5lbGVtZW50VHlwZXMuZm9yRWFjaChlbCA9PiB7XG4gICAgaWYgKCF0cy5pc0xpdGVyYWxUeXBlTm9kZShlbCkgfHwgIXRzLmlzU3RyaW5nTGl0ZXJhbChlbC5saXRlcmFsKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXMucHVzaChlbC5saXRlcmFsLnRleHQpO1xuICB9KTtcbiAgcmV0dXJuIHJlcztcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdERpcmVjdGl2ZUd1YXJkcyhub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0KToge1xuICBuZ1RlbXBsYXRlR3VhcmRzOiBUZW1wbGF0ZUd1YXJkTWV0YVtdLFxuICBoYXNOZ1RlbXBsYXRlQ29udGV4dEd1YXJkOiBib29sZWFuLFxuICBjb2VyY2VkSW5wdXRGaWVsZHM6IFNldDxzdHJpbmc+LFxufSB7XG4gIGNvbnN0IHN0YXRpY01lbWJlcnMgPSByZWZsZWN0b3IuZ2V0TWVtYmVyc09mQ2xhc3Mobm9kZSkuZmlsdGVyKG1lbWJlciA9PiBtZW1iZXIuaXNTdGF0aWMpO1xuICBjb25zdCBuZ1RlbXBsYXRlR3VhcmRzID0gc3RhdGljTWVtYmVycy5tYXAoZXh0cmFjdFRlbXBsYXRlR3VhcmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoZ3VhcmQpOiBndWFyZCBpcyBUZW1wbGF0ZUd1YXJkTWV0YSA9PiBndWFyZCAhPT0gbnVsbCk7XG4gIGNvbnN0IGhhc05nVGVtcGxhdGVDb250ZXh0R3VhcmQgPSBzdGF0aWNNZW1iZXJzLnNvbWUoXG4gICAgICBtZW1iZXIgPT4gbWVtYmVyLmtpbmQgPT09IENsYXNzTWVtYmVyS2luZC5NZXRob2QgJiYgbWVtYmVyLm5hbWUgPT09ICduZ1RlbXBsYXRlQ29udGV4dEd1YXJkJyk7XG5cbiAgY29uc3QgY29lcmNlZElucHV0RmllbGRzID1cbiAgICAgIG5ldyBTZXQoc3RhdGljTWVtYmVycy5tYXAoZXh0cmFjdENvZXJjZWRJbnB1dClcbiAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGlucHV0TmFtZSk6IGlucHV0TmFtZSBpcyBzdHJpbmcgPT4gaW5wdXROYW1lICE9PSBudWxsKSk7XG4gIHJldHVybiB7aGFzTmdUZW1wbGF0ZUNvbnRleHRHdWFyZCwgbmdUZW1wbGF0ZUd1YXJkcywgY29lcmNlZElucHV0RmllbGRzfTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdFRlbXBsYXRlR3VhcmQobWVtYmVyOiBDbGFzc01lbWJlcik6IFRlbXBsYXRlR3VhcmRNZXRhfG51bGwge1xuICBpZiAoIW1lbWJlci5uYW1lLnN0YXJ0c1dpdGgoJ25nVGVtcGxhdGVHdWFyZF8nKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGlucHV0TmFtZSA9IGFmdGVyVW5kZXJzY29yZShtZW1iZXIubmFtZSk7XG4gIGlmIChtZW1iZXIua2luZCA9PT0gQ2xhc3NNZW1iZXJLaW5kLlByb3BlcnR5KSB7XG4gICAgbGV0IHR5cGU6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgICBpZiAobWVtYmVyLnR5cGUgIT09IG51bGwgJiYgdHMuaXNMaXRlcmFsVHlwZU5vZGUobWVtYmVyLnR5cGUpICYmXG4gICAgICAgIHRzLmlzU3RyaW5nTGl0ZXJhbChtZW1iZXIudHlwZS5saXRlcmFsKSkge1xuICAgICAgdHlwZSA9IG1lbWJlci50eXBlLmxpdGVyYWwudGV4dDtcbiAgICB9XG5cbiAgICAvLyBPbmx5IHByb3BlcnR5IG1lbWJlcnMgd2l0aCBzdHJpbmcgbGl0ZXJhbCB0eXBlICdiaW5kaW5nJyBhcmUgY29uc2lkZXJlZCBhcyB0ZW1wbGF0ZSBndWFyZC5cbiAgICBpZiAodHlwZSAhPT0gJ2JpbmRpbmcnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtpbnB1dE5hbWUsIHR5cGV9O1xuICB9IGVsc2UgaWYgKG1lbWJlci5raW5kID09PSBDbGFzc01lbWJlcktpbmQuTWV0aG9kKSB7XG4gICAgcmV0dXJuIHtpbnB1dE5hbWUsIHR5cGU6ICdpbnZvY2F0aW9uJ307XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0cmFjdENvZXJjZWRJbnB1dChtZW1iZXI6IENsYXNzTWVtYmVyKTogc3RyaW5nfG51bGwge1xuICBpZiAobWVtYmVyLmtpbmQgIT09IENsYXNzTWVtYmVyS2luZC5Qcm9wZXJ0eSB8fCAhbWVtYmVyLm5hbWUuc3RhcnRzV2l0aCgnbmdBY2NlcHRJbnB1dFR5cGVfJykpIHtcbiAgICByZXR1cm4gbnVsbCAhO1xuICB9XG4gIHJldHVybiBhZnRlclVuZGVyc2NvcmUobWVtYmVyLm5hbWUpO1xufVxuXG4vKipcbiAqIEEgYE1ldGFkYXRhUmVhZGVyYCB0aGF0IHJlYWRzIGZyb20gYW4gb3JkZXJlZCBzZXQgb2YgY2hpbGQgcmVhZGVycyB1bnRpbCBpdCBvYnRhaW5zIHRoZSByZXF1ZXN0ZWRcbiAqIG1ldGFkYXRhLlxuICpcbiAqIFRoaXMgaXMgdXNlZCB0byBjb21iaW5lIGBNZXRhZGF0YVJlYWRlcmBzIHRoYXQgcmVhZCBmcm9tIGRpZmZlcmVudCBzb3VyY2VzIChlLmcuIGZyb20gYSByZWdpc3RyeVxuICogYW5kIGZyb20gLmQudHMgZmlsZXMpLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcG91bmRNZXRhZGF0YVJlYWRlciBpbXBsZW1lbnRzIE1ldGFkYXRhUmVhZGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkZXJzOiBNZXRhZGF0YVJlYWRlcltdKSB7fVxuXG4gIGdldERpcmVjdGl2ZU1ldGFkYXRhKG5vZGU6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPHRzLkRlY2xhcmF0aW9uPj4pOiBEaXJlY3RpdmVNZXRhfG51bGwge1xuICAgIGZvciAoY29uc3QgcmVhZGVyIG9mIHRoaXMucmVhZGVycykge1xuICAgICAgY29uc3QgbWV0YSA9IHJlYWRlci5nZXREaXJlY3RpdmVNZXRhZGF0YShub2RlKTtcbiAgICAgIGlmIChtZXRhICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBtZXRhO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldE5nTW9kdWxlTWV0YWRhdGEobm9kZTogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuRGVjbGFyYXRpb24+Pik6IE5nTW9kdWxlTWV0YXxudWxsIHtcbiAgICBmb3IgKGNvbnN0IHJlYWRlciBvZiB0aGlzLnJlYWRlcnMpIHtcbiAgICAgIGNvbnN0IG1ldGEgPSByZWFkZXIuZ2V0TmdNb2R1bGVNZXRhZGF0YShub2RlKTtcbiAgICAgIGlmIChtZXRhICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBtZXRhO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBnZXRQaXBlTWV0YWRhdGEobm9kZTogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuRGVjbGFyYXRpb24+Pik6IFBpcGVNZXRhfG51bGwge1xuICAgIGZvciAoY29uc3QgcmVhZGVyIG9mIHRoaXMucmVhZGVycykge1xuICAgICAgY29uc3QgbWV0YSA9IHJlYWRlci5nZXRQaXBlTWV0YWRhdGEobm9kZSk7XG4gICAgICBpZiAobWV0YSAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbWV0YTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWZ0ZXJVbmRlcnNjb3JlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgcG9zID0gc3RyLmluZGV4T2YoJ18nKTtcbiAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkICcke3N0cn0nIHRvIGNvbnRhaW4gJ18nYCk7XG4gIH1cbiAgcmV0dXJuIHN0ci5zdWJzdHIocG9zICsgMSk7XG59XG5cbi8qKiBSZXR1cm5zIHdoZXRoZXIgYSBjbGFzcyBkZWNsYXJhdGlvbiBoYXMgdGhlIG5lY2Vzc2FyeSBjbGFzcyBmaWVsZHMgdG8gbWFrZSBpdCBpbmplY3RhYmxlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc0luamVjdGFibGVGaWVsZHMoY2xheno6IENsYXNzRGVjbGFyYXRpb24sIGhvc3Q6IFJlZmxlY3Rpb25Ib3N0KTogYm9vbGVhbiB7XG4gIGNvbnN0IG1lbWJlcnMgPSBob3N0LmdldE1lbWJlcnNPZkNsYXNzKGNsYXp6KTtcbiAgcmV0dXJuIG1lbWJlcnMuc29tZShcbiAgICAgICh7aXNTdGF0aWMsIG5hbWV9KSA9PiBpc1N0YXRpYyAmJiAobmFtZSA9PT0gJ8m1cHJvdicgfHwgbmFtZSA9PT0gJ8m1ZmFjJyB8fCBuYW1lID09PSAnybVpbmonKSk7XG59XG4iXX0=