/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { fillProperties } from '../../util/property';
import { EMPTY_ARRAY, EMPTY_OBJ } from '../empty';
import { isComponentDef } from '../interfaces/type_checks';
import { mergeHostAttrs } from '../util/attrs_utils';
export function getSuperType(type) {
    return Object.getPrototypeOf(type.prototype).constructor;
}
/**
 * Merges the definition from a super class to a sub class.
 * @param definition The definition that is a SubClass of another directive of component
 *
 * @codeGenApi
 */
export function ɵɵInheritDefinitionFeature(definition) {
    var superType = getSuperType(definition.type);
    var shouldInheritFields = true;
    var inheritanceChain = [definition];
    while (superType) {
        var superDef = undefined;
        if (isComponentDef(definition)) {
            // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
            superDef = superType.ɵcmp || superType.ɵdir;
        }
        else {
            if (superType.ɵcmp) {
                throw new Error('Directives cannot inherit Components');
            }
            // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
            superDef = superType.ɵdir;
        }
        if (superDef) {
            if (shouldInheritFields) {
                inheritanceChain.push(superDef);
                // Some fields in the definition may be empty, if there were no values to put in them that
                // would've justified object creation. Unwrap them if necessary.
                var writeableDef = definition;
                writeableDef.inputs = maybeUnwrapEmpty(definition.inputs);
                writeableDef.declaredInputs = maybeUnwrapEmpty(definition.declaredInputs);
                writeableDef.outputs = maybeUnwrapEmpty(definition.outputs);
                // Merge hostBindings
                var superHostBindings = superDef.hostBindings;
                superHostBindings && inheritHostBindings(definition, superHostBindings);
                // Merge queries
                var superViewQuery = superDef.viewQuery;
                var superContentQueries = superDef.contentQueries;
                superViewQuery && inheritViewQuery(definition, superViewQuery);
                superContentQueries && inheritContentQueries(definition, superContentQueries);
                // Merge inputs and outputs
                fillProperties(definition.inputs, superDef.inputs);
                fillProperties(definition.declaredInputs, superDef.declaredInputs);
                fillProperties(definition.outputs, superDef.outputs);
                // Merge animations metadata.
                // If `superDef` is a Component, the `data` field is present (defaults to an empty object).
                if (isComponentDef(superDef) && superDef.data.animation) {
                    // If super def is a Component, the `definition` is also a Component, since Directives can
                    // not inherit Components (we throw an error above and cannot reach this code).
                    var defData = definition.data;
                    defData.animation = (defData.animation || []).concat(superDef.data.animation);
                }
                // Inherit hooks
                // Assume super class inheritance feature has already run.
                writeableDef.afterContentChecked =
                    writeableDef.afterContentChecked || superDef.afterContentChecked;
                writeableDef.afterContentInit = definition.afterContentInit || superDef.afterContentInit;
                writeableDef.afterViewChecked = definition.afterViewChecked || superDef.afterViewChecked;
                writeableDef.afterViewInit = definition.afterViewInit || superDef.afterViewInit;
                writeableDef.doCheck = definition.doCheck || superDef.doCheck;
                writeableDef.onDestroy = definition.onDestroy || superDef.onDestroy;
                writeableDef.onInit = definition.onInit || superDef.onInit;
            }
            // Run parent features
            var features = superDef.features;
            if (features) {
                for (var i = 0; i < features.length; i++) {
                    var feature = features[i];
                    if (feature && feature.ngInherit) {
                        feature(definition);
                    }
                    // If `InheritDefinitionFeature` is a part of the current `superDef`, it means that this
                    // def already has all the necessary information inherited from its super class(es), so we
                    // can stop merging fields from super classes. However we need to iterate through the
                    // prototype chain to look for classes that might contain other "features" (like
                    // NgOnChanges), which we should invoke for the original `definition`. We set the
                    // `shouldInheritFields` flag to indicate that, essentially skipping fields inheritance
                    // logic and only invoking functions from the "features" list.
                    if (feature === ɵɵInheritDefinitionFeature) {
                        shouldInheritFields = false;
                    }
                }
            }
        }
        superType = Object.getPrototypeOf(superType);
    }
    mergeHostAttrsAcrossInheritance(inheritanceChain);
}
/**
 * Merge the `hostAttrs` and `hostVars` from the inherited parent to the base class.
 *
 * @param inheritanceChain A list of `WritableDefs` starting at the top most type and listing
 * sub-types in order. For each type take the `hostAttrs` and `hostVars` and merge it with the child
 * type.
 */
function mergeHostAttrsAcrossInheritance(inheritanceChain) {
    var hostVars = 0;
    var hostAttrs = null;
    // We process the inheritance order from the base to the leaves here.
    for (var i = inheritanceChain.length - 1; i >= 0; i--) {
        var def = inheritanceChain[i];
        // For each `hostVars`, we need to add the superclass amount.
        def.hostVars = (hostVars += def.hostVars);
        // for each `hostAttrs` we need to merge it with superclass.
        def.hostAttrs =
            mergeHostAttrs(def.hostAttrs, hostAttrs = mergeHostAttrs(hostAttrs, def.hostAttrs));
    }
}
function maybeUnwrapEmpty(value) {
    if (value === EMPTY_OBJ) {
        return {};
    }
    else if (value === EMPTY_ARRAY) {
        return [];
    }
    else {
        return value;
    }
}
function inheritViewQuery(definition, superViewQuery) {
    var prevViewQuery = definition.viewQuery;
    if (prevViewQuery) {
        definition.viewQuery = function (rf, ctx) {
            superViewQuery(rf, ctx);
            prevViewQuery(rf, ctx);
        };
    }
    else {
        definition.viewQuery = superViewQuery;
    }
}
function inheritContentQueries(definition, superContentQueries) {
    var prevContentQueries = definition.contentQueries;
    if (prevContentQueries) {
        definition.contentQueries = function (rf, ctx, directiveIndex) {
            superContentQueries(rf, ctx, directiveIndex);
            prevContentQueries(rf, ctx, directiveIndex);
        };
    }
    else {
        definition.contentQueries = superContentQueries;
    }
}
function inheritHostBindings(definition, superHostBindings) {
    var prevHostBindings = definition.hostBindings;
    if (prevHostBindings) {
        definition.hostBindings = function (rf, ctx) {
            superHostBindings(rf, ctx);
            prevHostBindings(rf, ctx);
        };
    }
    else {
        definition.hostBindings = superHostBindings;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5oZXJpdF9kZWZpbml0aW9uX2ZlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ZlYXR1cmVzL2luaGVyaXRfZGVmaW5pdGlvbl9mZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBQUMsV0FBVyxFQUFFLFNBQVMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUdoRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDekQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRW5ELE1BQU0sVUFBVSxZQUFZLENBQUMsSUFBZTtJQUUxQyxPQUFPLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztBQUMzRCxDQUFDO0FBSUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUsMEJBQTBCLENBQUMsVUFBZ0Q7SUFDekYsSUFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QyxJQUFJLG1CQUFtQixHQUFHLElBQUksQ0FBQztJQUMvQixJQUFNLGdCQUFnQixHQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRXJELE9BQU8sU0FBUyxFQUFFO1FBQ2hCLElBQUksUUFBUSxHQUFrRCxTQUFTLENBQUM7UUFDeEUsSUFBSSxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDOUIsK0VBQStFO1lBQy9FLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUM7U0FDN0M7YUFBTTtZQUNMLElBQUksU0FBUyxDQUFDLElBQUksRUFBRTtnQkFDbEIsTUFBTSxJQUFJ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LFVBQVUsQ0FBQyxjQUFjLEdBQUcsbUJBQW1CLENBQUM7S0FDakQ7QUFDSCxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FDeEIsVUFBdUIsRUFBRSxpQkFBNEM7SUFDdkUsSUFBTSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDO0lBQ2pELElBQUksZ0JBQWdCLEVBQUU7UUFDcEIsVUFBVSxDQUFDLFlBQVksR0FBRyxVQUFDLEVBQWUsRUFBRSxHQUFRO1lBQ2xELGlCQUFpQixDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMzQixnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDO0tBQ0g7U0FBTTtRQUNMLFVBQVUsQ0FBQyxZQUFZLEdBQUcsaUJBQWlCLENBQUM7S0FDN0M7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1R5cGUsIFdyaXRhYmxlfSBmcm9tICcuLi8uLi9pbnRlcmZhY2UvdHlwZSc7XG5pbXBvcnQge2ZpbGxQcm9wZXJ0aWVzfSBmcm9tICcuLi8uLi91dGlsL3Byb3BlcnR5JztcbmltcG9ydCB7RU1QVFlfQVJSQVksIEVNUFRZX09CSn0gZnJvbSAnLi4vZW1wdHknO1xuaW1wb3J0IHtDb21wb25lbnREZWYsIENvbnRlbnRRdWVyaWVzRnVuY3Rpb24sIERpcmVjdGl2ZURlZiwgRGlyZWN0aXZlRGVmRmVhdHVyZSwgSG9zdEJpbmRpbmdzRnVuY3Rpb24sIFJlbmRlckZsYWdzLCBWaWV3UXVlcmllc0Z1bmN0aW9ufSBmcm9tICcuLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtUQXR0cmlidXRlc30gZnJvbSAnLi4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7aXNDb21wb25lbnREZWZ9IGZyb20gJy4uL2ludGVyZmFjZXMvdHlwZV9jaGVja3MnO1xuaW1wb3J0IHttZXJnZUhvc3RBdHRyc30gZnJvbSAnLi4vdXRpbC9hdHRyc191dGlscyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdXBlclR5cGUodHlwZTogVHlwZTxhbnk+KTogVHlwZTxhbnk+JlxuICAgIHvJtWNtcD86IENvbXBvbmVudERlZjxhbnk+LCDJtWRpcj86IERpcmVjdGl2ZURlZjxhbnk+fSB7XG4gIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodHlwZS5wcm90b3R5cGUpLmNvbnN0cnVjdG9yO1xufVxuXG50eXBlIFdyaXRhYmxlRGVmID0gV3JpdGFibGU8RGlyZWN0aXZlRGVmPGFueT58Q29tcG9uZW50RGVmPGFueT4+O1xuXG4vKipcbiAqIE1lcmdlcyB0aGUgZGVmaW5pdGlvbiBmcm9tIGEgc3VwZXIgY2xhc3MgdG8gYSBzdWIgY2xhc3MuXG4gKiBAcGFyYW0gZGVmaW5pdGlvbiBUaGUgZGVmaW5pdGlvbiB0aGF0IGlzIGEgU3ViQ2xhc3Mgb2YgYW5vdGhlciBkaXJlY3RpdmUgb2YgY29tcG9uZW50XG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVJbmhlcml0RGVmaW5pdGlvbkZlYXR1cmUoZGVmaW5pdGlvbjogRGlyZWN0aXZlRGVmPGFueT58IENvbXBvbmVudERlZjxhbnk+KTogdm9pZCB7XG4gIGxldCBzdXBlclR5cGUgPSBnZXRTdXBlclR5cGUoZGVmaW5pdGlvbi50eXBlKTtcbiAgbGV0IHNob3VsZEluaGVyaXRGaWVsZHMgPSB0cnVlO1xuICBjb25zdCBpbmhlcml0YW5jZUNoYWluOiBXcml0YWJsZURlZltdID0gW2RlZmluaXRpb25dO1xuXG4gIHdoaWxlIChzdXBlclR5cGUpIHtcbiAgICBsZXQgc3VwZXJEZWY6IERpcmVjdGl2ZURlZjxhbnk+fENvbXBvbmVudERlZjxhbnk+fHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoaXNDb21wb25lbnREZWYoZGVmaW5pdGlvbikpIHtcbiAgICAgIC8vIERvbid0IHVzZSBnZXRDb21wb25lbnREZWYvZ2V0RGlyZWN0aXZlRGVmLiBUaGlzIGxvZ2ljIHJlbGllcyBvbiBpbmhlcml0YW5jZS5cbiAgICAgIHN1cGVyRGVmID0gc3VwZXJUeXBlLsm1Y21wIHx8IHN1cGVyVHlwZS7JtWRpcjtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHN1cGVyVHlwZS7JtWNtcCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RpcmVjdGl2ZXMgY2Fubm90IGluaGVyaXQgQ29tcG9uZW50cycpO1xuICAgICAgfVxuICAgICAgLy8gRG9uJ3QgdXNlIGdldENvbXBvbmVudERlZi9nZXREaXJlY3RpdmVEZWYuIFRoaXMgbG9naWMgcmVsaWVzIG9uIGluaGVyaXRhbmNlLlxuICAgICAgc3VwZXJEZWYgPSBzdXBlclR5cGUuybVkaXI7XG4gICAgfVxuXG4gICAgaWYgKHN1cGVyRGVmKSB7XG4gICAgICBpZiAoc2hvdWxkSW5oZXJpdEZpZWxkcykge1xuICAgICAgICBpbmhlcml0YW5jZUNoYWluLnB1c2goc3VwZXJEZWYpO1xuICAgICAgICAvLyBTb21lIGZpZWxkcyBpbiB0aGUgZGVmaW5pdGlvbiBtYXkgYmUgZW1wdHksIGlmIHRoZXJlIHdlcmUgbm8gdmFsdWVzIHRvIHB1dCBpbiB0aGVtIHRoYXRcbiAgICAgICAgLy8gd291bGQndmUganVzdGlmaWVkIG9iamVjdCBjcmVhdGlvbi4gVW53cmFwIHRoZW0gaWYgbmVjZXNzYXJ5LlxuICAgICAgICBjb25zdCB3cml0ZWFibGVEZWYgPSBkZWZpbml0aW9uIGFzIFdyaXRhYmxlRGVmO1xuICAgICAgICB3cml0ZWFibGVEZWYuaW5wdXRzID0gbWF5YmVVbndyYXBFbXB0eShkZWZpbml0aW9uLmlucHV0cyk7XG4gICAgICAgIHdyaXRlYWJsZURlZi5kZWNsYXJlZElucHV0cyA9IG1heWJlVW53cmFwRW1wdHkoZGVmaW5pdGlvbi5kZWNsYXJlZElucHV0cyk7XG4gICAgICAgIHdyaXRlYWJsZURlZi5vdXRwdXRzID0gbWF5YmVVbndyYXBFbXB0eShkZWZpbml0aW9uLm91dHB1dHMpO1xuXG4gICAgICAgIC8vIE1lcmdlIGhvc3RCaW5kaW5nc1xuICAgICAgICBjb25zdCBzdXBlckhvc3RCaW5kaW5ncyA9IHN1cGVyRGVmLmhvc3RCaW5kaW5ncztcbiAgICAgICAgc3VwZXJIb3N0QmluZGluZ3MgJiYgaW5oZXJpdEhvc3RCaW5kaW5ncyhkZWZpbml0aW9uLCBzdXBlckhvc3RCaW5kaW5ncyk7XG5cbiAgICAgICAgLy8gTWVyZ2UgcXVlcmllc1xuICAgICAgICBjb25zdCBzdXBlclZpZXdRdWVyeSA9IHN1cGVyRGVmLnZpZXdRdWVyeTtcbiAgICAgICAgY29uc3Qgc3VwZXJDb250ZW50UXVlcmllcyA9IHN1cGVyRGVmLmNvbnRlbnRRdWVyaWVzO1xuICAgICAgICBzdXBlclZpZXdRdWVyeSAmJiBpbmhlcml0Vmlld1F1ZXJ5KGRlZmluaXRpb24sIHN1cGVyVmlld1F1ZXJ5KTtcbiAgICAgICAgc3VwZXJDb250ZW50UXVlcmllcyAmJiBpbmhlcml0Q29udGVudFF1ZXJpZXMoZGVmaW5pdGlvbiwgc3VwZXJDb250ZW50UXVlcmllcyk7XG5cbiAgICAgICAgLy8gTWVyZ2UgaW5wdXRzIGFuZCBvdXRwdXRzXG4gICAgICAgIGZpbGxQcm9wZXJ0aWVzKGRlZmluaXRpb24uaW5wdXRzLCBzdXBlckRlZi5pbnB1dHMpO1xuICAgICAgICBmaWxsUHJvcGVydGllcyhkZWZpbml0aW9uLmRlY2xhcmVkSW5wdXRzLCBzdXBlckRlZi5kZWNsYXJlZElucHV0cyk7XG4gICAgICAgIGZpbGxQcm9wZXJ0aWVzKGRlZmluaXRpb24ub3V0cHV0cywgc3VwZXJEZWYub3V0cHV0cyk7XG5cbiAgICAgICAgLy8gTWVyZ2UgYW5pbWF0aW9ucyBtZXRhZGF0YS5cbiAgICAgICAgLy8gSWYgYHN1cGVyRGVmYCBpcyBhIENvbXBvbmVudCwgdGhlIGBkYXRhYCBmaWVsZCBpcyBwcmVzZW50IChkZWZhdWx0cyB0byBhbiBlbXB0eSBvYmplY3QpLlxuICAgICAgICBpZiAoaXNDb21wb25lbnREZWYoc3VwZXJEZWYpICYmIHN1cGVyRGVmLmRhdGEuYW5pbWF0aW9uKSB7XG4gICAgICAgICAgLy8gSWYgc3VwZXIgZGVmIGlzIGEgQ29tcG9uZW50LCB0aGUgYGRlZmluaXRpb25gIGlzIGFsc28gYSBDb21wb25lbnQsIHNpbmNlIERpcmVjdGl2ZXMgY2FuXG4gICAgICAgICAgLy8gbm90IGluaGVyaXQgQ29tcG9uZW50cyAod2UgdGhyb3cgYW4gZXJyb3IgYWJvdmUgYW5kIGNhbm5vdCByZWFjaCB0aGlzIGNvZGUpLlxuICAgICAgICAgIGNvbnN0IGRlZkRhdGEgPSAoZGVmaW5pdGlvbiBhcyBDb21wb25lbnREZWY8YW55PikuZGF0YTtcbiAgICAgICAgICBkZWZEYXRhLmFuaW1hdGlvbiA9IChkZWZEYXRhLmFuaW1hdGlvbiB8fCBbXSkuY29uY2F0KHN1cGVyRGVmLmRhdGEuYW5pbWF0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEluaGVyaXQgaG9va3NcbiAgICAgICAgLy8gQXNzdW1lIHN1cGVyIGNsYXNzIGluaGVyaXRhbmNlIGZlYXR1cmUgaGFzIGFscmVhZHkgcnVuLlxuICAgICAgICB3cml0ZWFibGVEZWYuYWZ0ZXJDb250ZW50Q2hlY2tlZCA9XG4gICAgICAgICAgICB3cml0ZWFibGVEZWYuYWZ0ZXJDb250ZW50Q2hlY2tlZCB8fCBzdXBlckRlZi5hZnRlckNvbnRlbnRDaGVja2VkO1xuICAgICAgICB3cml0ZWFibGVEZWYuYWZ0ZXJDb250ZW50SW5pdCA9IGRlZmluaXRpb24uYWZ0ZXJDb250ZW50SW5pdCB8fCBzdXBlckRlZi5hZnRlckNvbnRlbnRJbml0O1xuICAgICAgICB3cml0ZWFibGVEZWYuYWZ0ZXJWaWV3Q2hlY2tlZCA9IGRlZmluaXRpb24uYWZ0ZXJWaWV3Q2hlY2tlZCB8fCBzdXBlckRlZi5hZnRlclZpZXdDaGVja2VkO1xuICAgICAgICB3cml0ZWFibGVEZWYuYWZ0ZXJWaWV3SW5pdCA9IGRlZmluaXRpb24uYWZ0ZXJWaWV3SW5pdCB8fCBzdXBlckRlZi5hZnRlclZpZXdJbml0O1xuICAgICAgICB3cml0ZWFibGVEZWYuZG9DaGVjayA9IGRlZmluaXRpb24uZG9DaGVjayB8fCBzdXBlckRlZi5kb0NoZWNrO1xuICAgICAgICB3cml0ZWFibGVEZWYub25EZXN0cm95ID0gZGVmaW5pdGlvbi5vbkRlc3Ryb3kgfHwgc3VwZXJEZWYub25EZXN0cm95O1xuICAgICAgICB3cml0ZWFibGVEZWYub25Jbml0ID0gZGVmaW5pdGlvbi5vbkluaXQgfHwgc3VwZXJEZWYub25Jbml0O1xuICAgICAgfVxuXG4gICAgICAvLyBSdW4gcGFyZW50IGZlYXR1cmVzXG4gICAgICBjb25zdCBmZWF0dXJlcyA9IHN1cGVyRGVmLmZlYXR1cmVzO1xuICAgICAgaWYgKGZlYXR1cmVzKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmVhdHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBmZWF0dXJlID0gZmVhdHVyZXNbaV07XG4gICAgICAgICAgaWYgKGZlYXR1cmUgJiYgZmVhdHVyZS5uZ0luaGVyaXQpIHtcbiAgICAgICAgICAgIChmZWF0dXJlIGFzIERpcmVjdGl2ZURlZkZlYXR1cmUpKGRlZmluaXRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBJZiBgSW5oZXJpdERlZmluaXRpb25GZWF0dXJlYCBpcyBhIHBhcnQgb2YgdGhlIGN1cnJlbnQgYHN1cGVyRGVmYCwgaXQgbWVhbnMgdGhhdCB0aGlzXG4gICAgICAgICAgLy8gZGVmIGFscmVhZHkgaGFzIGFsbCB0aGUgbmVjZXNzYXJ5IGluZm9ybWF0aW9uIGluaGVyaXRlZCBmcm9tIGl0cyBzdXBlciBjbGFzcyhlcyksIHNvIHdlXG4gICAgICAgICAgLy8gY2FuIHN0b3AgbWVyZ2luZyBmaWVsZHMgZnJvbSBzdXBlciBjbGFzc2VzLiBIb3dldmVyIHdlIG5lZWQgdG8gaXRlcmF0ZSB0aHJvdWdoIHRoZVxuICAgICAgICAgIC8vIHByb3RvdHlwZSBjaGFpbiB0byBsb29rIGZvciBjbGFzc2VzIHRoYXQgbWlnaHQgY29udGFpbiBvdGhlciBcImZlYXR1cmVzXCIgKGxpa2VcbiAgICAgICAgICAvLyBOZ09uQ2hhbmdlcyksIHdoaWNoIHdlIHNob3VsZCBpbnZva2UgZm9yIHRoZSBvcmlnaW5hbCBgZGVmaW5pdGlvbmAuIFdlIHNldCB0aGVcbiAgICAgICAgICAvLyBgc2hvdWxkSW5oZXJpdEZpZWxkc2AgZmxhZyB0byBpbmRpY2F0ZSB0aGF0LCBlc3NlbnRpYWxseSBza2lwcGluZyBmaWVsZHMgaW5oZXJpdGFuY2VcbiAgICAgICAgICAvLyBsb2dpYyBhbmQgb25seSBpbnZva2luZyBmdW5jdGlvbnMgZnJvbSB0aGUgXCJmZWF0dXJlc1wiIGxpc3QuXG4gICAgICAgICAgaWYgKGZlYXR1cmUgPT09IMm1ybVJbmhlcml0RGVmaW5pdGlvbkZlYXR1cmUpIHtcbiAgICAgICAgICAgIHNob3VsZEluaGVyaXRGaWVsZHMgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdXBlclR5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yoc3VwZXJUeXBlKTtcbiAgfVxuICBtZXJnZUhvc3RBdHRyc0Fjcm9zc0luaGVyaXRhbmNlKGluaGVyaXRhbmNlQ2hhaW4pO1xufVxuXG4vKipcbiAqIE1lcmdlIHRoZSBgaG9zdEF0dHJzYCBhbmQgYGhvc3RWYXJzYCBmcm9tIHRoZSBpbmhlcml0ZWQgcGFyZW50IHRvIHRoZSBiYXNlIGNsYXNzLlxuICpcbiAqIEBwYXJhbSBpbmhlcml0YW5jZUNoYWluIEEgbGlzdCBvZiBgV3JpdGFibGVEZWZzYCBzdGFydGluZyBhdCB0aGUgdG9wIG1vc3QgdHlwZSBhbmQgbGlzdGluZ1xuICogc3ViLXR5cGVzIGluIG9yZGVyLiBGb3IgZWFjaCB0eXBlIHRha2UgdGhlIGBob3N0QXR0cnNgIGFuZCBgaG9zdFZhcnNgIGFuZCBtZXJnZSBpdCB3aXRoIHRoZSBjaGlsZFxuICogdHlwZS5cbiAqL1xuZnVuY3Rpb24gbWVyZ2VIb3N0QXR0cnNBY3Jvc3NJbmhlcml0YW5jZShpbmhlcml0YW5jZUNoYWluOiBXcml0YWJsZURlZltdKSB7XG4gIGxldCBob3N0VmFyczogbnVtYmVyID0gMDtcbiAgbGV0IGhvc3RBdHRyczogVEF0dHJpYnV0ZXN8bnVsbCA9IG51bGw7XG4gIC8vIFdlIHByb2Nlc3MgdGhlIGluaGVyaXRhbmNlIG9yZGVyIGZyb20gdGhlIGJhc2UgdG8gdGhlIGxlYXZlcyBoZXJlLlxuICBmb3IgKGxldCBpID0gaW5oZXJpdGFuY2VDaGFpbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGNvbnN0IGRlZiA9IGluaGVyaXRhbmNlQ2hhaW5baV07XG4gICAgLy8gRm9yIGVhY2ggYGhvc3RWYXJzYCwgd2UgbmVlZCB0byBhZGQgdGhlIHN1cGVyY2xhc3MgYW1vdW50LlxuICAgIGRlZi5ob3N0VmFycyA9IChob3N0VmFycyArPSBkZWYuaG9zdFZhcnMpO1xuICAgIC8vIGZvciBlYWNoIGBob3N0QXR0cnNgIHdlIG5lZWQgdG8gbWVyZ2UgaXQgd2l0aCBzdXBlcmNsYXNzLlxuICAgIGRlZi5ob3N0QXR0cnMgPVxuICAgICAgICBtZXJnZUhvc3RBdHRycyhkZWYuaG9zdEF0dHJzLCBob3N0QXR0cnMgPSBtZXJnZUhvc3RBdHRycyhob3N0QXR0cnMsIGRlZi5ob3N0QXR0cnMpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtYXliZVVud3JhcEVtcHR5PFQ+KHZhbHVlOiBUW10pOiBUW107XG5mdW5jdGlvbiBtYXliZVVud3JhcEVtcHR5PFQ+KHZhbHVlOiBUKTogVDtcbmZ1bmN0aW9uIG1heWJlVW53cmFwRW1wdHkodmFsdWU6IGFueSk6IGFueSB7XG4gIGlmICh2YWx1ZSA9PT0gRU1QVFlfT0JKKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9IGVsc2UgaWYgKHZhbHVlID09PSBFTVBUWV9BUlJBWSkge1xuICAgIHJldHVybiBbXTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5oZXJpdFZpZXdRdWVyeShkZWZpbml0aW9uOiBXcml0YWJsZURlZiwgc3VwZXJWaWV3UXVlcnk6IFZpZXdRdWVyaWVzRnVuY3Rpb248YW55Pikge1xuICBjb25zdCBwcmV2Vmlld1F1ZXJ5ID0gZGVmaW5pdGlvbi52aWV3UXVlcnk7XG4gIGlmIChwcmV2Vmlld1F1ZXJ5KSB7XG4gICAgZGVmaW5pdGlvbi52aWV3UXVlcnkgPSAocmYsIGN0eCkgPT4ge1xuICAgICAgc3VwZXJWaWV3UXVlcnkocmYsIGN0eCk7XG4gICAgICBwcmV2Vmlld1F1ZXJ5KHJmLCBjdHgpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgZGVmaW5pdGlvbi52aWV3UXVlcnkgPSBzdXBlclZpZXdRdWVyeTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbmhlcml0Q29udGVudFF1ZXJpZXMoXG4gICAgZGVmaW5pdGlvbjogV3JpdGFibGVEZWYsIHN1cGVyQ29udGVudFF1ZXJpZXM6IENvbnRlbnRRdWVyaWVzRnVuY3Rpb248YW55Pikge1xuICBjb25zdCBwcmV2Q29udGVudFF1ZXJpZXMgPSBkZWZpbml0aW9uLmNvbnRlbnRRdWVyaWVzO1xuICBpZiAocHJldkNvbnRlbnRRdWVyaWVzKSB7XG4gICAgZGVmaW5pdGlvbi5jb250ZW50UXVlcmllcyA9IChyZiwgY3R4LCBkaXJlY3RpdmVJbmRleCkgPT4ge1xuICAgICAgc3VwZXJDb250ZW50UXVlcmllcyhyZiwgY3R4LCBkaXJlY3RpdmVJbmRleCk7XG4gICAgICBwcmV2Q29udGVudFF1ZXJpZXMocmYsIGN0eCwgZGlyZWN0aXZlSW5kZXgpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgZGVmaW5pdGlvbi5jb250ZW50UXVlcmllcyA9IHN1cGVyQ29udGVudFF1ZXJpZXM7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5oZXJpdEhvc3RCaW5kaW5ncyhcbiAgICBkZWZpbml0aW9uOiBXcml0YWJsZURlZiwgc3VwZXJIb3N0QmluZGluZ3M6IEhvc3RCaW5kaW5nc0Z1bmN0aW9uPGFueT4pIHtcbiAgY29uc3QgcHJldkhvc3RCaW5kaW5ncyA9IGRlZmluaXRpb24uaG9zdEJpbmRpbmdzO1xuICBpZiAocHJldkhvc3RCaW5kaW5ncykge1xuICAgIGRlZmluaXRpb24uaG9zdEJpbmRpbmdzID0gKHJmOiBSZW5kZXJGbGFncywgY3R4OiBhbnkpID0+IHtcbiAgICAgIHN1cGVySG9zdEJpbmRpbmdzKHJmLCBjdHgpO1xuICAgICAgcHJldkhvc3RCaW5kaW5ncyhyZiwgY3R4KTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIGRlZmluaXRpb24uaG9zdEJpbmRpbmdzID0gc3VwZXJIb3N0QmluZGluZ3M7XG4gIH1cbn0iXX0=