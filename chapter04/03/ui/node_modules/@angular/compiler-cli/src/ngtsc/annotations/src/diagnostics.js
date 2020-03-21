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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/diagnostics", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/annotations/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/util");
    /**
     * Gets the diagnostics for a set of provider classes.
     * @param providerClasses Classes that should be checked.
     * @param providersDeclaration Node that declares the providers array.
     * @param registry Registry that keeps track of the registered injectable classes.
     */
    function getProviderDiagnostics(providerClasses, providersDeclaration, registry) {
        var e_1, _a;
        var diagnostics = [];
        try {
            for (var providerClasses_1 = tslib_1.__values(providerClasses), providerClasses_1_1 = providerClasses_1.next(); !providerClasses_1_1.done; providerClasses_1_1 = providerClasses_1.next()) {
                var provider = providerClasses_1_1.value;
                if (registry.isInjectable(provider.node)) {
                    continue;
                }
                var contextNode = provider.getOriginForDiagnostics(providersDeclaration);
                diagnostics.push(diagnostics_1.makeDiagnostic(diagnostics_1.ErrorCode.UNDECORATED_PROVIDER, contextNode, "The class '" + provider.node.name.text + "' cannot be created via dependency injection, as it does not have an Angular decorator. This will result in an error at runtime.\n\nEither add the @Injectable() decorator to '" + provider.node.name.text + "', or configure a different provider (such as a provider with 'useFactory').\n", [{ node: provider.node, messageText: "'" + provider.node.name.text + "' is declared here." }]));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (providerClasses_1_1 && !providerClasses_1_1.done && (_a = providerClasses_1.return)) _a.call(providerClasses_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return diagnostics;
    }
    exports.getProviderDiagnostics = getProviderDiagnostics;
    function getDirectiveDiagnostics(node, reader, evaluator, reflector, scopeRegistry, kind) {
        var diagnostics = [];
        var addDiagnostics = function (more) {
            if (more === null) {
                return;
            }
            else if (diagnostics === null) {
                diagnostics = Array.isArray(more) ? more : [more];
            }
            else if (Array.isArray(more)) {
                diagnostics.push.apply(diagnostics, tslib_1.__spread(more));
            }
            else {
                diagnostics.push(more);
            }
        };
        var duplicateDeclarations = scopeRegistry.getDuplicateDeclarations(node);
        if (duplicateDeclarations !== null) {
            addDiagnostics(util_1.makeDuplicateDeclarationError(node, duplicateDeclarations, kind));
        }
        addDiagnostics(checkInheritanceOfDirective(node, reader, reflector, evaluator));
        return diagnostics;
    }
    exports.getDirectiveDiagnostics = getDirectiveDiagnostics;
    function checkInheritanceOfDirective(node, reader, reflector, evaluator) {
        if (!reflector.isClass(node) || reflector.getConstructorParameters(node) !== null) {
            // We should skip nodes that aren't classes. If a constructor exists, then no base class
            // definition is required on the runtime side - it's legal to inherit from any class.
            return null;
        }
        // The extends clause is an expression which can be as dynamic as the user wants. Try to
        // evaluate it, but fall back on ignoring the clause if it can't be understood. This is a View
        // Engine compatibility hack: View Engine ignores 'extends' expressions that it cannot understand.
        var baseClass = util_1.readBaseClass(node, reflector, evaluator);
        while (baseClass !== null) {
            if (baseClass === 'dynamic') {
                return null;
            }
            // We can skip the base class if it has metadata.
            var baseClassMeta = reader.getDirectiveMetadata(baseClass);
            if (baseClassMeta !== null) {
                return null;
            }
            // If the base class has a blank constructor we can skip it since it can't be using DI.
            var baseClassConstructorParams = reflector.getConstructorParameters(baseClass.node);
            var newParentClass = util_1.readBaseClass(baseClass.node, reflector, evaluator);
            if (baseClassConstructorParams !== null && baseClassConstructorParams.length > 0) {
                // This class has a non-trivial constructor, that's an error!
                return getInheritedUndecoratedCtorDiagnostic(node, baseClass, reader);
            }
            else if (baseClassConstructorParams !== null || newParentClass === null) {
                // This class has a trivial constructor, or no constructor + is the
                // top of the inheritance chain, so it's okay.
                return null;
            }
            // Go up the chain and continue
            baseClass = newParentClass;
        }
        return null;
    }
    exports.checkInheritanceOfDirective = checkInheritanceOfDirective;
    function getInheritedUndecoratedCtorDiagnostic(node, baseClass, reader) {
        var subclassMeta = reader.getDirectiveMetadata(new imports_1.Reference(node));
        var dirOrComp = subclassMeta.isComponent ? 'Component' : 'Directive';
        var baseClassName = baseClass.debugName;
        return diagnostics_1.makeDiagnostic(diagnostics_1.ErrorCode.DIRECTIVE_INHERITS_UNDECORATED_CTOR, node.name, "The " + dirOrComp.toLowerCase() + " " + node.name.text + " inherits its constructor from " + baseClassName + ", " +
            "but the latter does not have an Angular decorator of its own. Dependency injection will not be able to " +
            ("resolve the parameters of " + baseClassName + "'s constructor. Either add a @Directive decorator ") +
            ("to " + baseClassName + ", or add an explicit constructor to " + node.name.text + "."));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2Fubm90YXRpb25zL3NyYy9kaWFnbm9zdGljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFJSCwyRUFBNEQ7SUFDNUQsbUVBQXdDO0lBTXhDLDZFQUFvRTtJQUVwRTs7Ozs7T0FLRztJQUNILFNBQWdCLHNCQUFzQixDQUNsQyxlQUFpRCxFQUFFLG9CQUFtQyxFQUN0RixRQUFpQzs7UUFDbkMsSUFBTSxXQUFXLEdBQW9CLEVBQUUsQ0FBQzs7WUFFeEMsS0FBdUIsSUFBQSxvQkFBQSxpQkFBQSxlQUFlLENBQUEsZ0RBQUEsNkVBQUU7Z0JBQW5DLElBQU0sUUFBUSw0QkFBQTtnQkFDakIsSUFBSSxRQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDeEMsU0FBUztpQkFDVjtnQkFFRCxJQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsdUJBQXVCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDM0UsV0FBVyxDQUFDLElBQUksQ0FBQyw0QkFBYyxDQUMzQix1QkFBUyxDQUFDLG9CQUFvQixFQUFFLFdBQVcsRUFDM0MsZ0JBQWMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSx1TEFFQSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLG1GQUNuRSxFQUNPLENBQUMsRUFBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsTUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFxQixFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDOUY7Ozs7Ozs7OztRQUVELE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7SUFyQkQsd0RB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SUFBSSxDQUFDO0lBQ2QsQ0FBQztJQTNDRCxrRUEyQ0M7SUFFRCxTQUFTLHFDQUFxQyxDQUMxQyxJQUFzQixFQUFFLFNBQW9CLEVBQUUsTUFBc0I7UUFDdEUsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixDQUFDLElBQUksbUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBRyxDQUFDO1FBQ3hFLElBQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1FBQ3ZFLElBQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7UUFFMUMsT0FBTyw0QkFBYyxDQUNqQix1QkFBUyxDQUFDLG1DQUFtQyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQ3hELFNBQU8sU0FBUyxDQUFDLFdBQVcsRUFBRSxTQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSx1Q0FBa0MsYUFBYSxPQUFJO1lBQy9GLHlHQUF5RzthQUN6RywrQkFBNkIsYUFBYSx1REFBb0QsQ0FBQTthQUM5RixRQUFNLGFBQWEsNENBQXVDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFHLENBQUEsQ0FBQyxDQUFDO0lBQ3ZGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0Vycm9yQ29kZSwgbWFrZURpYWdub3N0aWN9IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzJztcbmltcG9ydCB7UmVmZXJlbmNlfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7SW5qZWN0YWJsZUNsYXNzUmVnaXN0cnksIE1ldGFkYXRhUmVhZGVyfSBmcm9tICcuLi8uLi9tZXRhZGF0YSc7XG5pbXBvcnQge1BhcnRpYWxFdmFsdWF0b3J9IGZyb20gJy4uLy4uL3BhcnRpYWxfZXZhbHVhdG9yJztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtMb2NhbE1vZHVsZVNjb3BlUmVnaXN0cnl9IGZyb20gJy4uLy4uL3Njb3BlJztcblxuaW1wb3J0IHttYWtlRHVwbGljYXRlRGVjbGFyYXRpb25FcnJvciwgcmVhZEJhc2VDbGFzc30gZnJvbSAnLi91dGlsJztcblxuLyoqXG4gKiBHZXRzIHRoZSBkaWFnbm9zdGljcyBmb3IgYSBzZXQgb2YgcHJvdmlkZXIgY2xhc3Nlcy5cbiAqIEBwYXJhbSBwcm92aWRlckNsYXNzZXMgQ2xhc3NlcyB0aGF0IHNob3VsZCBiZSBjaGVja2VkLlxuICogQHBhcmFtIHByb3ZpZGVyc0RlY2xhcmF0aW9uIE5vZGUgdGhhdCBkZWNsYXJlcyB0aGUgcHJvdmlkZXJzIGFycmF5LlxuICogQHBhcmFtIHJlZ2lzdHJ5IFJlZ2lzdHJ5IHRoYXQga2VlcHMgdHJhY2sgb2YgdGhlIHJlZ2lzdGVyZWQgaW5qZWN0YWJsZSBjbGFzc2VzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvdmlkZXJEaWFnbm9zdGljcyhcbiAgICBwcm92aWRlckNsYXNzZXM6IFNldDxSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4+LCBwcm92aWRlcnNEZWNsYXJhdGlvbjogdHMuRXhwcmVzc2lvbixcbiAgICByZWdpc3RyeTogSW5qZWN0YWJsZUNsYXNzUmVnaXN0cnkpOiB0cy5EaWFnbm9zdGljW10ge1xuICBjb25zdCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdID0gW107XG5cbiAgZm9yIChjb25zdCBwcm92aWRlciBvZiBwcm92aWRlckNsYXNzZXMpIHtcbiAgICBpZiAocmVnaXN0cnkuaXNJbmplY3RhYmxlKHByb3ZpZGVyLm5vZGUpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZXh0Tm9kZSA9IHByb3ZpZGVyLmdldE9yaWdpbkZvckRpYWdub3N0aWNzKHByb3ZpZGVyc0RlY2xhcmF0aW9uKTtcbiAgICBkaWFnbm9zdGljcy5wdXNoKG1ha2VEaWFnbm9zdGljKFxuICAgICAgICBFcnJvckNvZGUuVU5ERUNPUkFURURfUFJPVklERVIsIGNvbnRleHROb2RlLFxuICAgICAgICBgVGhlIGNsYXNzICcke3Byb3ZpZGVyLm5vZGUubmFtZS50ZXh0fScgY2Fubm90IGJlIGNyZWF0ZWQgdmlhIGRlcGVuZGVuY3kgaW5qZWN0aW9uLCBhcyBpdCBkb2VzIG5vdCBoYXZlIGFuIEFuZ3VsYXIgZGVjb3JhdG9yLiBUaGlzIHdpbGwgcmVzdWx0IGluIGFuIGVycm9yIGF0IHJ1bnRpbWUuXG5cbkVpdGhlciBhZGQgdGhlIEBJbmplY3RhYmxlKCkgZGVjb3JhdG9yIHRvICcke3Byb3ZpZGVyLm5vZGUubmFtZS50ZXh0fScsIG9yIGNvbmZpZ3VyZSBhIGRpZmZlcmVudCBwcm92aWRlciAoc3VjaCBhcyBhIHByb3ZpZGVyIHdpdGggJ3VzZUZhY3RvcnknKS5cbmAsXG4gICAgICAgIFt7bm9kZTogcHJvdmlkZXIubm9kZSwgbWVzc2FnZVRleHQ6IGAnJHtwcm92aWRlci5ub2RlLm5hbWUudGV4dH0nIGlzIGRlY2xhcmVkIGhlcmUuYH1dKSk7XG4gIH1cblxuICByZXR1cm4gZGlhZ25vc3RpY3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREaXJlY3RpdmVEaWFnbm9zdGljcyhcbiAgICBub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCByZWFkZXI6IE1ldGFkYXRhUmVhZGVyLCBldmFsdWF0b3I6IFBhcnRpYWxFdmFsdWF0b3IsXG4gICAgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCwgc2NvcGVSZWdpc3RyeTogTG9jYWxNb2R1bGVTY29wZVJlZ2lzdHJ5LFxuICAgIGtpbmQ6IHN0cmluZyk6IHRzLkRpYWdub3N0aWNbXXxudWxsIHtcbiAgbGV0IGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW118bnVsbCA9IFtdO1xuXG4gIGNvbnN0IGFkZERpYWdub3N0aWNzID0gKG1vcmU6IHRzLkRpYWdub3N0aWMgfCB0cy5EaWFnbm9zdGljW10gfCBudWxsKSA9PiB7XG4gICAgaWYgKG1vcmUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGRpYWdub3N0aWNzID09PSBudWxsKSB7XG4gICAgICBkaWFnbm9zdGljcyA9IEFycmF5LmlzQXJyYXkobW9yZSkgPyBtb3JlIDogW21vcmVdO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShtb3JlKSkge1xuICAgICAgZGlhZ25vc3RpY3MucHVzaCguLi5tb3JlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGlhZ25vc3RpY3MucHVzaChtb3JlKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgZHVwbGljYXRlRGVjbGFyYXRpb25zID0gc2NvcGVSZWdpc3RyeS5nZXREdXBsaWNhdGVEZWNsYXJhdGlvbnMobm9kZSk7XG5cbiAgaWYgKGR1cGxpY2F0ZURlY2xhcmF0aW9ucyAhPT0gbnVsbCkge1xuICAgIGFkZERpYWdub3N0aWNzKG1ha2VEdXBsaWNhdGVEZWNsYXJhdGlvbkVycm9yKG5vZGUsIGR1cGxpY2F0ZURlY2xhcmF0aW9ucywga2luZCkpO1xuICB9XG5cbiAgYWRkRGlhZ25vc3RpY3MoY2hlY2tJbmhlcml0YW5jZU9mRGlyZWN0aXZlKG5vZGUsIHJlYWRlciwgcmVmbGVjdG9yLCBldmFsdWF0b3IpKTtcbiAgcmV0dXJuIGRpYWdub3N0aWNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tJbmhlcml0YW5jZU9mRGlyZWN0aXZlKFxuICAgIG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIHJlYWRlcjogTWV0YWRhdGFSZWFkZXIsIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QsXG4gICAgZXZhbHVhdG9yOiBQYXJ0aWFsRXZhbHVhdG9yKTogdHMuRGlhZ25vc3RpY3xudWxsIHtcbiAgaWYgKCFyZWZsZWN0b3IuaXNDbGFzcyhub2RlKSB8fCByZWZsZWN0b3IuZ2V0Q29uc3RydWN0b3JQYXJhbWV0ZXJzKG5vZGUpICE9PSBudWxsKSB7XG4gICAgLy8gV2Ugc2hvdWxkIHNraXAgbm9kZXMgdGhhdCBhcmVuJ3QgY2xhc3Nlcy4gSWYgYSBjb25zdHJ1Y3RvciBleGlzdHMsIHRoZW4gbm8gYmFzZSBjbGFzc1xuICAgIC8vIGRlZmluaXRpb24gaXMgcmVxdWlyZWQgb24gdGhlIHJ1bnRpbWUgc2lkZSAtIGl0J3MgbGVnYWwgdG8gaW5oZXJpdCBmcm9tIGFueSBjbGFzcy5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFRoZSBleHRlbmRzIGNsYXVzZSBpcyBhbiBleHByZXNzaW9uIHdoaWNoIGNhbiBiZSBhcyBkeW5hbWljIGFzIHRoZSB1c2VyIHdhbnRzLiBUcnkgdG9cbiAgLy8gZXZhbHVhdGUgaXQsIGJ1dCBmYWxsIGJhY2sgb24gaWdub3JpbmcgdGhlIGNsYXVzZSBpZiBpdCBjYW4ndCBiZSB1bmRlcnN0b29kLiBUaGlzIGlzIGEgVmlld1xuICAvLyBFbmdpbmUgY29tcGF0aWJpbGl0eSBoYWNrOiBWaWV3IEVuZ2luZSBpZ25vcmVzICdleHRlbmRzJyBleHByZXNzaW9ucyB0aGF0IGl0IGNhbm5vdCB1bmRlcnN0YW5kLlxuICBsZXQgYmFzZUNsYXNzID0gcmVhZEJhc2VDbGFzcyhub2RlLCByZWZsZWN0b3IsIGV2YWx1YXRvcik7XG5cbiAgd2hpbGUgKGJhc2VDbGFzcyAhPT0gbnVsbCkge1xuICAgIGlmIChiYXNlQ2xhc3MgPT09ICdkeW5hbWljJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gV2UgY2FuIHNraXAgdGhlIGJhc2UgY2xhc3MgaWYgaXQgaGFzIG1ldGFkYXRhLlxuICAgIGNvbnN0IGJhc2VDbGFzc01ldGEgPSByZWFkZXIuZ2V0RGlyZWN0aXZlTWV0YWRhdGEoYmFzZUNsYXNzKTtcbiAgICBpZiAoYmFzZUNsYXNzTWV0YSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGJhc2UgY2xhc3MgaGFzIGEgYmxhbmsgY29uc3RydWN0b3Igd2UgY2FuIHNraXAgaXQgc2luY2UgaXQgY2FuJ3QgYmUgdXNpbmcgREkuXG4gICAgY29uc3QgYmFzZUNsYXNzQ29uc3RydWN0b3JQYXJhbXMgPSByZWZsZWN0b3IuZ2V0Q29uc3RydWN0b3JQYXJhbWV0ZXJzKGJhc2VDbGFzcy5ub2RlKTtcbiAgICBjb25zdCBuZXdQYXJlbnRDbGFzcyA9IHJlYWRCYXNlQ2xhc3MoYmFzZUNsYXNzLm5vZGUsIHJlZmxlY3RvciwgZXZhbHVhdG9yKTtcblxuICAgIGlmIChiYXNlQ2xhc3NDb25zdHJ1Y3RvclBhcmFtcyAhPT0gbnVsbCAmJiBiYXNlQ2xhc3NDb25zdHJ1Y3RvclBhcmFtcy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBUaGlzIGNsYXNzIGhhcyBhIG5vbi10cml2aWFsIGNvbnN0cnVjdG9yLCB0aGF0J3MgYW4gZXJyb3IhXG4gICAgICByZXR1cm4gZ2V0SW5oZXJpdGVkVW5kZWNvcmF0ZWRDdG9yRGlhZ25vc3RpYyhub2RlLCBiYXNlQ2xhc3MsIHJlYWRlcik7XG4gICAgfSBlbHNlIGlmIChiYXNlQ2xhc3NDb25zdHJ1Y3RvclBhcmFtcyAhPT0gbnVsbCB8fCBuZXdQYXJlbnRDbGFzcyA9PT0gbnVsbCkge1xuICAgICAgLy8gVGhpcyBjbGFzcyBoYXMgYSB0cml2aWFsIGNvbnN0cnVjdG9yLCBvciBubyBjb25zdHJ1Y3RvciArIGlzIHRoZVxuICAgICAgLy8gdG9wIG9mIHRoZSBpbmhlcml0YW5jZSBjaGFpbiwgc28gaXQncyBva2F5LlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gR28gdXAgdGhlIGNoYWluIGFuZCBjb250aW51ZVxuICAgIGJhc2VDbGFzcyA9IG5ld1BhcmVudENsYXNzO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldEluaGVyaXRlZFVuZGVjb3JhdGVkQ3RvckRpYWdub3N0aWMoXG4gICAgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgYmFzZUNsYXNzOiBSZWZlcmVuY2UsIHJlYWRlcjogTWV0YWRhdGFSZWFkZXIpIHtcbiAgY29uc3Qgc3ViY2xhc3NNZXRhID0gcmVhZGVyLmdldERpcmVjdGl2ZU1ldGFkYXRhKG5ldyBSZWZlcmVuY2Uobm9kZSkpICE7XG4gIGNvbnN0IGRpck9yQ29tcCA9IHN1YmNsYXNzTWV0YS5pc0NvbXBvbmVudCA/ICdDb21wb25lbnQnIDogJ0RpcmVjdGl2ZSc7XG4gIGNvbnN0IGJhc2VDbGFzc05hbWUgPSBiYXNlQ2xhc3MuZGVidWdOYW1lO1xuXG4gIHJldHVybiBtYWtlRGlhZ25vc3RpYyhcbiAgICAgIEVycm9yQ29kZS5ESVJFQ1RJVkVfSU5IRVJJVFNfVU5ERUNPUkFURURfQ1RPUiwgbm9kZS5uYW1lLFxuICAgICAgYFRoZSAke2Rpck9yQ29tcC50b0xvd2VyQ2FzZSgpfSAke25vZGUubmFtZS50ZXh0fSBpbmhlcml0cyBpdHMgY29uc3RydWN0b3IgZnJvbSAke2Jhc2VDbGFzc05hbWV9LCBgICtcbiAgICAgICAgICBgYnV0IHRoZSBsYXR0ZXIgZG9lcyBub3QgaGF2ZSBhbiBBbmd1bGFyIGRlY29yYXRvciBvZiBpdHMgb3duLiBEZXBlbmRlbmN5IGluamVjdGlvbiB3aWxsIG5vdCBiZSBhYmxlIHRvIGAgK1xuICAgICAgICAgIGByZXNvbHZlIHRoZSBwYXJhbWV0ZXJzIG9mICR7YmFzZUNsYXNzTmFtZX0ncyBjb25zdHJ1Y3Rvci4gRWl0aGVyIGFkZCBhIEBEaXJlY3RpdmUgZGVjb3JhdG9yIGAgK1xuICAgICAgICAgIGB0byAke2Jhc2VDbGFzc05hbWV9LCBvciBhZGQgYW4gZXhwbGljaXQgY29uc3RydWN0b3IgdG8gJHtub2RlLm5hbWUudGV4dH0uYCk7XG59XG4iXX0=