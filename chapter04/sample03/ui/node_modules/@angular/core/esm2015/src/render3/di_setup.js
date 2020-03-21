/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/render3/di_setup.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { resolveForwardRef } from '../di/forward_ref';
import { isClassProvider, isTypeProvider, providerToFactory } from '../di/r3_injector';
import { diPublicInInjector, getNodeInjectable, getOrCreateNodeInjectorForNode } from './di';
import { ɵɵdirectiveInject } from './instructions/all';
import { NodeInjectorFactory } from './interfaces/injector';
import { isComponentDef } from './interfaces/type_checks';
import { TVIEW } from './interfaces/view';
import { getLView, getPreviousOrParentTNode, getTView } from './state';
/**
 * Resolves the providers which are defined in the DirectiveDef.
 *
 * When inserting the tokens and the factories in their respective arrays, we can assume that
 * this method is called first for the component (if any), and then for other directives on the same
 * node.
 * As a consequence,the providers are always processed in that order:
 * 1) The view providers of the component
 * 2) The providers of the component
 * 3) The providers of the other directives
 * This matches the structure of the injectables arrays of a view (for each node).
 * So the tokens and the factories can be pushed at the end of the arrays, except
 * in one case for multi providers.
 *
 * @template T
 * @param {?} def the directive definition
 * @param {?} providers
 * @param {?} viewProviders
 * @return {?}
 */
export function providersResolver(def, providers, viewProviders) {
    /** @type {?} */
    const tView = getTView();
    if (tView.firstCreatePass) {
        /** @type {?} */
        const isComponent = isComponentDef(def);
        // The list of view providers is processed first, and the flags are updated
        resolveProvider(viewProviders, tView.data, tView.blueprint, isComponent, true);
        // Then, the list of providers is processed, and the flags are updated
        resolveProvider(providers, tView.data, tView.blueprint, isComponent, false);
    }
}
/**
 * Resolves a provider and publishes it to the DI system.
 * @param {?} provider
 * @param {?} tInjectables
 * @param {?} lInjectablesBlueprint
 * @param {?} isComponent
 * @param {?} isViewProvider
 * @return {?}
 */
function resolveProvider(provider, tInjectables, lInjectablesBlueprint, isComponent, isViewProvider) {
    provider = resolveForwardRef(provider);
    if (Array.isArray(provider)) {
        // Recursively call `resolveProvider`
        // Recursion is OK in this case because this code will not be in hot-path once we implement
        // cloning of the initial state.
        for (let i = 0; i < provider.length; i++) {
            resolveProvider(provider[i], tInjectables, lInjectablesBlueprint, isComponent, isViewProvider);
        }
    }
    else {
        /** @type {?} */
        const tView = getTView();
        /** @type {?} */
        const lView = getLView();
        /** @type {?} */
        let token = isTypeProvider(provider) ? provider : resolveForwardRef(provider.provide);
        /** @type {?} */
        let providerFactory = providerToFactory(provider);
        /** @type {?} */
        const tNode = getPreviousOrParentTNode();
        /** @type {?} */
        const beginIndex = tNode.providerIndexes & 65535 /* ProvidersStartIndexMask */;
        /** @type {?} */
        const endIndex = tNode.directiveStart;
        /** @type {?} */
        const cptViewProvidersCount = tNode.providerIndexes >> 16 /* CptViewProvidersCountShift */;
        if (isTypeProvider(provider) || !provider.multi) {
            // Single provider case: the factory is created and pushed immediately
            /** @type {?} */
            const factory = new NodeInjectorFactory(providerFactory, isViewProvider, ɵɵdirectiveInject);
            /** @type {?} */
            const existingFactoryIndex = indexOf(token, tInjectables, isViewProvider ? beginIndex : beginIndex + cptViewProvidersCount, endIndex);
            if (existingFactoryIndex === -1) {
                diPublicInInjector(getOrCreateNodeInjectorForNode((/** @type {?} */ (tNode)), lView), tView, token);
                registerDestroyHooksIfSupported(tView, provider, tInjectables.length);
                tInjectables.push(token);
                tNode.directiveStart++;
                tNode.directiveEnd++;
                if (isViewProvider) {
                    tNode.providerIndexes += 65536 /* CptViewProvidersCountShifter */;
                }
                lInjectablesBlueprint.push(factory);
                lView.push(factory);
            }
            else {
                lInjectablesBlueprint[existingFactoryIndex] = factory;
                lView[existingFactoryIndex] = factory;
            }
        }
        else {
            // Multi provider case:
            // We create a multi factory which is going to aggregate all the values.
            // Since the output of such a factory depends on content or view injection,
            // we create two of them, which are linked together.
            //
            // The first one (for view providers) is always in the first block of the injectables array,
            // and the second one (for providers) is always in the second block.
            // This is important because view providers have higher priority. When a multi token
            // is being looked up, the view providers should be found first.
            // Note that it is not possible to have a multi factory in the third block (directive block).
            //
            // The algorithm to process multi providers is as follows:
            // 1) If the multi provider comes from the `viewProviders` of the component:
            //   a) If the special view providers factory doesn't exist, it is created and pushed.
            //   b) Else, the multi provider is added to the existing multi factory.
            // 2) If the multi provider comes from the `providers` of the component or of another
            // directive:
            //   a) If the multi factory doesn't exist, it is created and provider pushed into it.
            //      It is also linked to the multi factory for view providers, if it exists.
            //   b) Else, the multi provider is added to the existing multi factory.
            /** @type {?} */
            const existingProvidersFactoryIndex = indexOf(token, tInjectables, beginIndex + cptViewProvidersCount, endIndex);
            /** @type {?} */
            const existingViewProvidersFactoryIndex = indexOf(token, tInjectables, beginIndex, beginIndex + cptViewProvidersCount);
            /** @type {?} */
            const doesProvidersFactoryExist = existingProvidersFactoryIndex >= 0 &&
                lInjectablesBlueprint[existingProvidersFactoryIndex];
            /** @type {?} */
            const doesViewProvidersFactoryExist = existingViewProvidersFactoryIndex >= 0 &&
                lInjectablesBlueprint[existingViewProvidersFactoryIndex];
            if (isViewProvider && !doesViewProvidersFactoryExist ||
                !isViewProvider && !doesProvidersFactoryExist) {
                // Cases 1.a and 2.a
                diPublicInInjector(getOrCreateNodeInjectorForNode((/** @type {?} */ (tNode)), lView), tView, token);
                /** @type {?} */
                const factory = multiFactory(isViewProvider ? multiViewProvidersFactoryResolver : multiProvidersFactoryResolver, lInjectablesBlueprint.length, isViewProvider, isComponent, providerFactory);
                if (!isViewProvider && doesViewProvidersFactoryExist) {
                    lInjectablesBlueprint[existingViewProvidersFactoryIndex].providerFactory = factory;
                }
                registerDestroyHooksIfSupported(tView, provider, tInjectables.length);
                tInjectables.push(token);
                tNode.directiveStart++;
                tNode.directiveEnd++;
                if (isViewProvider) {
                    tNode.providerIndexes += 65536 /* CptViewProvidersCountShifter */;
                }
                lInjectablesBlueprint.push(factory);
                lView.push(factory);
            }
            else {
                // Cases 1.b and 2.b
                registerDestroyHooksIfSupported(tView, provider, existingProvidersFactoryIndex > -1 ?
                    existingProvidersFactoryIndex :
                    existingViewProvidersFactoryIndex);
                multiFactoryAdd((/** @type {?} */ (lInjectablesBlueprint))[isViewProvider ? existingViewProvidersFactoryIndex : existingProvidersFactoryIndex], providerFactory, !isViewProvider && isComponent);
            }
            if (!isViewProvider && isComponent && doesViewProvidersFactoryExist) {
                (/** @type {?} */ (lInjectablesBlueprint[existingViewProvidersFactoryIndex].componentProviders))++;
            }
        }
    }
}
/**
 * Registers the `ngOnDestroy` hook of a provider, if the provider supports destroy hooks.
 * @param {?} tView `TView` in which to register the hook.
 * @param {?} provider Provider whose hook should be registered.
 * @param {?} contextIndex Index under which to find the context for the hook when it's being invoked.
 * @return {?}
 */
function registerDestroyHooksIfSupported(tView, provider, contextIndex) {
    /** @type {?} */
    const providerIsTypeProvider = isTypeProvider(provider);
    if (providerIsTypeProvider || isClassProvider(provider)) {
        /** @type {?} */
        const prototype = (((/** @type {?} */ (provider))).useClass || provider).prototype;
        /** @type {?} */
        const ngOnDestroy = prototype.ngOnDestroy;
        if (ngOnDestroy) {
            (tView.destroyHooks || (tView.destroyHooks = [])).push(contextIndex, ngOnDestroy);
        }
    }
}
/**
 * Add a factory in a multi factory.
 * @param {?} multiFactory
 * @param {?} factory
 * @param {?} isComponentProvider
 * @return {?}
 */
function multiFactoryAdd(multiFactory, factory, isComponentProvider) {
    (/** @type {?} */ (multiFactory.multi)).push(factory);
    if (isComponentProvider) {
        (/** @type {?} */ (multiFactory.componentProviders))++;
    }
}
/**
 * Returns the index of item in the array, but only in the begin to end range.
 * @param {?} item
 * @param {?} arr
 * @param {?} begin
 * @param {?} end
 * @return {?}
 */
function indexOf(item, arr, begin, end) {
    for (let i = begin; i < end; i++) {
        if (arr[i] === item)
            return i;
    }
    return -1;
}
/**
 * Use this with `multi` `providers`.
 * @this {?}
 * @param {?} _
 * @param {?} tData
 * @param {?} lData
 * @param {?} tNode
 * @return {?}
 */
function multiProvidersFactoryResolver(_, tData, lData, tNode) {
    return multiResolve((/** @type {?} */ (this.multi)), []);
}
/**
 * Use this with `multi` `viewProviders`.
 *
 * This factory knows how to concatenate itself with the existing `multi` `providers`.
 * @this {?}
 * @param {?} _
 * @param {?} tData
 * @param {?} lView
 * @param {?} tNode
 * @return {?}
 */
function multiViewProvidersFactoryResolver(_, tData, lView, tNode) {
    /** @type {?} */
    const factories = (/** @type {?} */ (this.multi));
    /** @type {?} */
    let result;
    if (this.providerFactory) {
        /** @type {?} */
        const componentCount = (/** @type {?} */ (this.providerFactory.componentProviders));
        /** @type {?} */
        const multiProviders = getNodeInjectable(lView, lView[TVIEW], (/** @type {?} */ ((/** @type {?} */ (this.providerFactory)).index)), tNode);
        // Copy the section of the array which contains `multi` `providers` from the component
        result = multiProviders.slice(0, componentCount);
        // Insert the `viewProvider` instances.
        multiResolve(factories, result);
        // Copy the section of the array which contains `multi` `providers` from other directives
        for (let i = componentCount; i < multiProviders.length; i++) {
            result.push(multiProviders[i]);
        }
    }
    else {
        result = [];
        // Insert the `viewProvider` instances.
        multiResolve(factories, result);
    }
    return result;
}
/**
 * Maps an array of factories into an array of values.
 * @param {?} factories
 * @param {?} result
 * @return {?}
 */
function multiResolve(factories, result) {
    for (let i = 0; i < factories.length; i++) {
        /** @type {?} */
        const factory = (/** @type {?} */ ((/** @type {?} */ (factories[i]))));
        result.push(factory());
    }
    return result;
}
/**
 * Creates a multi factory.
 * @param {?} factoryFn
 * @param {?} index
 * @param {?} isViewProvider
 * @param {?} isComponent
 * @param {?} f
 * @return {?}
 */
function multiFactory(factoryFn, index, isViewProvider, isComponent, f) {
    /** @type {?} */
    const factory = new NodeInjectorFactory(factoryFn, isViewProvider, ɵɵdirectiveInject);
    factory.multi = [];
    factory.index = index;
    factory.componentProviders = 0;
    multiFactoryAdd(factory, f, isComponent && !isViewProvider);
    return factory;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlfc2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2RpX3NldHVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVNBLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRXBELE9BQU8sRUFBQyxlQUFlLEVBQUUsY0FBYyxFQUFFLGlCQUFpQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFckYsT0FBTyxFQUFDLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLDhCQUE4QixFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzNGLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBRXJELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRTFELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQWUsS0FBSyxFQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFDN0QsT0FBTyxFQUFDLFFBQVEsRUFBRSx3QkFBd0IsRUFBRSxRQUFRLEVBQUMsTUFBTSxTQUFTLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCckUsTUFBTSxVQUFVLGlCQUFpQixDQUM3QixHQUFvQixFQUFFLFNBQXFCLEVBQUUsYUFBeUI7O1VBQ2xFLEtBQUssR0FBRyxRQUFRLEVBQUU7SUFDeEIsSUFBSSxLQUFLLENBQUMsZUFBZSxFQUFFOztjQUNuQixXQUFXLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQztRQUV2QywyRUFBMkU7UUFDM0UsZUFBZSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRS9FLHNFQUFzRTtRQUN0RSxlQUFlLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxJ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QyxFQUFFLFdBQVcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzVELE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnLi4vZGkvZm9yd2FyZF9yZWYnO1xuaW1wb3J0IHtDbGFzc1Byb3ZpZGVyLCBQcm92aWRlcn0gZnJvbSAnLi4vZGkvaW50ZXJmYWNlL3Byb3ZpZGVyJztcbmltcG9ydCB7aXNDbGFzc1Byb3ZpZGVyLCBpc1R5cGVQcm92aWRlciwgcHJvdmlkZXJUb0ZhY3Rvcnl9IGZyb20gJy4uL2RpL3IzX2luamVjdG9yJztcblxuaW1wb3J0IHtkaVB1YmxpY0luSW5qZWN0b3IsIGdldE5vZGVJbmplY3RhYmxlLCBnZXRPckNyZWF0ZU5vZGVJbmplY3RvckZvck5vZGV9IGZyb20gJy4vZGknO1xuaW1wb3J0IHvJtcm1ZGlyZWN0aXZlSW5qZWN0fSBmcm9tICcuL2luc3RydWN0aW9ucy9hbGwnO1xuaW1wb3J0IHtEaXJlY3RpdmVEZWZ9IGZyb20gJy4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7Tm9kZUluamVjdG9yRmFjdG9yeX0gZnJvbSAnLi9pbnRlcmZhY2VzL2luamVjdG9yJztcbmltcG9ydCB7VENvbnRhaW5lck5vZGUsIFREaXJlY3RpdmVIb3N0Tm9kZSwgVEVsZW1lbnRDb250YWluZXJOb2RlLCBURWxlbWVudE5vZGUsIFROb2RlUHJvdmlkZXJJbmRleGVzfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge2lzQ29tcG9uZW50RGVmfSBmcm9tICcuL2ludGVyZmFjZXMvdHlwZV9jaGVja3MnO1xuaW1wb3J0IHtMVmlldywgVERhdGEsIFRWSUVXLCBUVmlld30gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtnZXRMVmlldywgZ2V0UHJldmlvdXNPclBhcmVudFROb2RlLCBnZXRUVmlld30gZnJvbSAnLi9zdGF0ZSc7XG5cblxuXG4vKipcbiAqIFJlc29sdmVzIHRoZSBwcm92aWRlcnMgd2hpY2ggYXJlIGRlZmluZWQgaW4gdGhlIERpcmVjdGl2ZURlZi5cbiAqXG4gKiBXaGVuIGluc2VydGluZyB0aGUgdG9rZW5zIGFuZCB0aGUgZmFjdG9yaWVzIGluIHRoZWlyIHJlc3BlY3RpdmUgYXJyYXlzLCB3ZSBjYW4gYXNzdW1lIHRoYXRcbiAqIHRoaXMgbWV0aG9kIGlzIGNhbGxlZCBmaXJzdCBmb3IgdGhlIGNvbXBvbmVudCAoaWYgYW55KSwgYW5kIHRoZW4gZm9yIG90aGVyIGRpcmVjdGl2ZXMgb24gdGhlIHNhbWVcbiAqIG5vZGUuXG4gKiBBcyBhIGNvbnNlcXVlbmNlLHRoZSBwcm92aWRlcnMgYXJlIGFsd2F5cyBwcm9jZXNzZWQgaW4gdGhhdCBvcmRlcjpcbiAqIDEpIFRoZSB2aWV3IHByb3ZpZGVycyBvZiB0aGUgY29tcG9uZW50XG4gKiAyKSBUaGUgcHJvdmlkZXJzIG9mIHRoZSBjb21wb25lbnRcbiAqIDMpIFRoZSBwcm92aWRlcnMgb2YgdGhlIG90aGVyIGRpcmVjdGl2ZXNcbiAqIFRoaXMgbWF0Y2hlcyB0aGUgc3RydWN0dXJlIG9mIHRoZSBpbmplY3RhYmxlcyBhcnJheXMgb2YgYSB2aWV3IChmb3IgZWFjaCBub2RlKS5cbiAqIFNvIHRoZSB0b2tlbnMgYW5kIHRoZSBmYWN0b3JpZXMgY2FuIGJlIHB1c2hlZCBhdCB0aGUgZW5kIG9mIHRoZSBhcnJheXMsIGV4Y2VwdFxuICogaW4gb25lIGNhc2UgZm9yIG11bHRpIHByb3ZpZGVycy5cbiAqXG4gKiBAcGFyYW0gZGVmIHRoZSBkaXJlY3RpdmUgZGVmaW5pdGlvblxuICogQHBhcmFtIHByb3ZpZGVyczogQXJyYXkgb2YgYHByb3ZpZGVyc2AuXG4gKiBAcGFyYW0gdmlld1Byb3ZpZGVyczogQXJyYXkgb2YgYHZpZXdQcm92aWRlcnNgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZXJzUmVzb2x2ZXI8VD4oXG4gICAgZGVmOiBEaXJlY3RpdmVEZWY8VD4sIHByb3ZpZGVyczogUHJvdmlkZXJbXSwgdmlld1Byb3ZpZGVyczogUHJvdmlkZXJbXSk6IHZvaWQge1xuICBjb25zdCB0VmlldyA9IGdldFRWaWV3KCk7XG4gIGlmICh0Vmlldy5maXJzdENyZWF0ZVBhc3MpIHtcbiAgICBjb25zdCBpc0NvbXBvbmVudCA9IGlzQ29tcG9uZW50RGVmKGRlZik7XG5cbiAgICAvLyBUaGUgbGlzdCBvZiB2aWV3IHByb3ZpZGVycyBpcyBwcm9jZXNzZWQgZmlyc3QsIGFuZCB0aGUgZmxhZ3MgYXJlIHVwZGF0ZWRcbiAgICByZXNvbHZlUHJvdmlkZXIodmlld1Byb3ZpZGVycywgdFZpZXcuZGF0YSwgdFZpZXcuYmx1ZXByaW50LCBpc0NvbXBvbmVudCwgdHJ1ZSk7XG5cbiAgICAvLyBUaGVuLCB0aGUgbGlzdCBvZiBwcm92aWRlcnMgaXMgcHJvY2Vzc2VkLCBhbmQgdGhlIGZsYWdzIGFyZSB1cGRhdGVkXG4gICAgcmVzb2x2ZVByb3ZpZGVyKHByb3ZpZGVycywgdFZpZXcuZGF0YSwgdFZpZXcuYmx1ZXByaW50LCBpc0NvbXBvbmVudCwgZmFsc2UpO1xuICB9XG59XG5cbi8qKlxuICogUmVzb2x2ZXMgYSBwcm92aWRlciBhbmQgcHVibGlzaGVzIGl0IHRvIHRoZSBESSBzeXN0ZW0uXG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVQcm92aWRlcihcbiAgICBwcm92aWRlcjogUHJvdmlkZXIsIHRJbmplY3RhYmxlczogVERhdGEsIGxJbmplY3RhYmxlc0JsdWVwcmludDogTm9kZUluamVjdG9yRmFjdG9yeVtdLFxuICAgIGlzQ29tcG9uZW50OiBib29sZWFuLCBpc1ZpZXdQcm92aWRlcjogYm9vbGVhbik6IHZvaWQge1xuICBwcm92aWRlciA9IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyKTtcbiAgaWYgKEFycmF5LmlzQXJyYXkocHJvdmlkZXIpKSB7XG4gICAgLy8gUmVjdXJzaXZlbHkgY2FsbCBgcmVzb2x2ZVByb3ZpZGVyYFxuICAgIC8vIFJlY3Vyc2lvbiBpcyBPSyBpbiB0aGlzIGNhc2UgYmVjYXVzZSB0aGlzIGNvZGUgd2lsbCBub3QgYmUgaW4gaG90LXBhdGggb25jZSB3ZSBpbXBsZW1lbnRcbiAgICAvLyBjbG9uaW5nIG9mIHRoZSBpbml0aWFsIHN0YXRlLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvdmlkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc29sdmVQcm92aWRlcihcbiAgICAgICAgICBwcm92aWRlcltpXSwgdEluamVjdGFibGVzLCBsSW5qZWN0YWJsZXNCbHVlcHJpbnQsIGlzQ29tcG9uZW50LCBpc1ZpZXdQcm92aWRlcik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IHRWaWV3ID0gZ2V0VFZpZXcoKTtcbiAgICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gICAgbGV0IHRva2VuOiBhbnkgPSBpc1R5cGVQcm92aWRlcihwcm92aWRlcikgPyBwcm92aWRlciA6IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyLnByb3ZpZGUpO1xuICAgIGxldCBwcm92aWRlckZhY3Rvcnk6ICgpID0+IGFueSA9IHByb3ZpZGVyVG9GYWN0b3J5KHByb3ZpZGVyKTtcblxuICAgIGNvbnN0IHROb2RlID0gZ2V0UHJldmlvdXNPclBhcmVudFROb2RlKCk7XG4gICAgY29uc3QgYmVnaW5JbmRleCA9IHROb2RlLnByb3ZpZGVySW5kZXhlcyAmIFROb2RlUHJvdmlkZXJJbmRleGVzLlByb3ZpZGVyc1N0YXJ0SW5kZXhNYXNrO1xuICAgIGNvbnN0IGVuZEluZGV4ID0gdE5vZGUuZGlyZWN0aXZlU3RhcnQ7XG4gICAgY29uc3QgY3B0Vmlld1Byb3ZpZGVyc0NvdW50ID1cbiAgICAgICAgdE5vZGUucHJvdmlkZXJJbmRleGVzID4+IFROb2RlUHJvdmlkZXJJbmRleGVzLkNwdFZpZXdQcm92aWRlcnNDb3VudFNoaWZ0O1xuXG4gICAgaWYgKGlzVHlwZVByb3ZpZGVyKHByb3ZpZGVyKSB8fCAhcHJvdmlkZXIubXVsdGkpIHtcbiAgICAgIC8vIFNpbmdsZSBwcm92aWRlciBjYXNlOiB0aGUgZmFjdG9yeSBpcyBjcmVhdGVkIGFuZCBwdXNoZWQgaW1tZWRpYXRlbHlcbiAgICAgIGNvbnN0IGZhY3RvcnkgPSBuZXcgTm9kZUluamVjdG9yRmFjdG9yeShwcm92aWRlckZhY3RvcnksIGlzVmlld1Byb3ZpZGVyLCDJtcm1ZGlyZWN0aXZlSW5qZWN0KTtcbiAgICAgIGNvbnN0IGV4aXN0aW5nRmFjdG9yeUluZGV4ID0gaW5kZXhPZihcbiAgICAgICAgICB0b2tlbiwgdEluamVjdGFibGVzLCBpc1ZpZXdQcm92aWRlciA/IGJlZ2luSW5kZXggOiBiZWdpbkluZGV4ICsgY3B0Vmlld1Byb3ZpZGVyc0NvdW50LFxuICAgICAgICAgIGVuZEluZGV4KTtcbiAgICAgIGlmIChleGlzdGluZ0ZhY3RvcnlJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgZGlQdWJsaWNJbkluamVjdG9yKFxuICAgICAgICAgICAgZ2V0T3JDcmVhdGVOb2RlSW5qZWN0b3JGb3JOb2RlKFxuICAgICAgICAgICAgICAgIHROb2RlIGFzIFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgVEVsZW1lbnRDb250YWluZXJOb2RlLCBsVmlldyksXG4gICAgICAgICAgICB0VmlldywgdG9rZW4pO1xuICAgICAgICByZWdpc3RlckRlc3Ryb3lIb29rc0lmU3VwcG9ydGVkKHRWaWV3LCBwcm92aWRlciwgdEluamVjdGFibGVzLmxlbmd0aCk7XG4gICAgICAgIHRJbmplY3RhYmxlcy5wdXNoKHRva2VuKTtcbiAgICAgICAgdE5vZGUuZGlyZWN0aXZlU3RhcnQrKztcbiAgICAgICAgdE5vZGUuZGlyZWN0aXZlRW5kKys7XG4gICAgICAgIGlmIChpc1ZpZXdQcm92aWRlcikge1xuICAgICAgICAgIHROb2RlLnByb3ZpZGVySW5kZXhlcyArPSBUTm9kZVByb3ZpZGVySW5kZXhlcy5DcHRWaWV3UHJvdmlkZXJzQ291bnRTaGlmdGVyO1xuICAgICAgICB9XG4gICAgICAgIGxJbmplY3RhYmxlc0JsdWVwcmludC5wdXNoKGZhY3RvcnkpO1xuICAgICAgICBsVmlldy5wdXNoKGZhY3RvcnkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbEluamVjdGFibGVzQmx1ZXByaW50W2V4aXN0aW5nRmFjdG9yeUluZGV4XSA9IGZhY3Rvcnk7XG4gICAgICAgIGxWaWV3W2V4aXN0aW5nRmFjdG9yeUluZGV4XSA9IGZhY3Rvcnk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE11bHRpIHByb3ZpZGVyIGNhc2U6XG4gICAgICAvLyBXZSBjcmVhdGUgYSBtdWx0aSBmYWN0b3J5IHdoaWNoIGlzIGdvaW5nIHRvIGFnZ3JlZ2F0ZSBhbGwgdGhlIHZhbHVlcy5cbiAgICAgIC8vIFNpbmNlIHRoZSBvdXRwdXQgb2Ygc3VjaCBhIGZhY3RvcnkgZGVwZW5kcyBvbiBjb250ZW50IG9yIHZpZXcgaW5qZWN0aW9uLFxuICAgICAgLy8gd2UgY3JlYXRlIHR3byBvZiB0aGVtLCB3aGljaCBhcmUgbGlua2VkIHRvZ2V0aGVyLlxuICAgICAgLy9cbiAgICAgIC8vIFRoZSBmaXJzdCBvbmUgKGZvciB2aWV3IHByb3ZpZGVycykgaXMgYWx3YXlzIGluIHRoZSBmaXJzdCBibG9jayBvZiB0aGUgaW5qZWN0YWJsZXMgYXJyYXksXG4gICAgICAvLyBhbmQgdGhlIHNlY29uZCBvbmUgKGZvciBwcm92aWRlcnMpIGlzIGFsd2F5cyBpbiB0aGUgc2Vjb25kIGJsb2NrLlxuICAgICAgLy8gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSB2aWV3IHByb3ZpZGVycyBoYXZlIGhpZ2hlciBwcmlvcml0eS4gV2hlbiBhIG11bHRpIHRva2VuXG4gICAgICAvLyBpcyBiZWluZyBsb29rZWQgdXAsIHRoZSB2aWV3IHByb3ZpZGVycyBzaG91bGQgYmUgZm91bmQgZmlyc3QuXG4gICAgICAvLyBOb3RlIHRoYXQgaXQgaXMgbm90IHBvc3NpYmxlIHRvIGhhdmUgYSBtdWx0aSBmYWN0b3J5IGluIHRoZSB0aGlyZCBibG9jayAoZGlyZWN0aXZlIGJsb2NrKS5cbiAgICAgIC8vXG4gICAgICAvLyBUaGUgYWxnb3JpdGhtIHRvIHByb2Nlc3MgbXVsdGkgcHJvdmlkZXJzIGlzIGFzIGZvbGxvd3M6XG4gICAgICAvLyAxKSBJZiB0aGUgbXVsdGkgcHJvdmlkZXIgY29tZXMgZnJvbSB0aGUgYHZpZXdQcm92aWRlcnNgIG9mIHRoZSBjb21wb25lbnQ6XG4gICAgICAvLyAgIGEpIElmIHRoZSBzcGVjaWFsIHZpZXcgcHJvdmlkZXJzIGZhY3RvcnkgZG9lc24ndCBleGlzdCwgaXQgaXMgY3JlYXRlZCBhbmQgcHVzaGVkLlxuICAgICAgLy8gICBiKSBFbHNlLCB0aGUgbXVsdGkgcHJvdmlkZXIgaXMgYWRkZWQgdG8gdGhlIGV4aXN0aW5nIG11bHRpIGZhY3RvcnkuXG4gICAgICAvLyAyKSBJZiB0aGUgbXVsdGkgcHJvdmlkZXIgY29tZXMgZnJvbSB0aGUgYHByb3ZpZGVyc2Agb2YgdGhlIGNvbXBvbmVudCBvciBvZiBhbm90aGVyXG4gICAgICAvLyBkaXJlY3RpdmU6XG4gICAgICAvLyAgIGEpIElmIHRoZSBtdWx0aSBmYWN0b3J5IGRvZXNuJ3QgZXhpc3QsIGl0IGlzIGNyZWF0ZWQgYW5kIHByb3ZpZGVyIHB1c2hlZCBpbnRvIGl0LlxuICAgICAgLy8gICAgICBJdCBpcyBhbHNvIGxpbmtlZCB0byB0aGUgbXVsdGkgZmFjdG9yeSBmb3IgdmlldyBwcm92aWRlcnMsIGlmIGl0IGV4aXN0cy5cbiAgICAgIC8vICAgYikgRWxzZSwgdGhlIG11bHRpIHByb3ZpZGVyIGlzIGFkZGVkIHRvIHRoZSBleGlzdGluZyBtdWx0aSBmYWN0b3J5LlxuXG4gICAgICBjb25zdCBleGlzdGluZ1Byb3ZpZGVyc0ZhY3RvcnlJbmRleCA9XG4gICAgICAgICAgaW5kZXhPZih0b2tlbiwgdEluamVjdGFibGVzLCBiZWdpbkluZGV4ICsgY3B0Vmlld1Byb3ZpZGVyc0NvdW50LCBlbmRJbmRleCk7XG4gICAgICBjb25zdCBleGlzdGluZ1ZpZXdQcm92aWRlcnNGYWN0b3J5SW5kZXggPVxuICAgICAgICAgIGluZGV4T2YodG9rZW4sIHRJbmplY3RhYmxlcywgYmVnaW5JbmRleCwgYmVnaW5JbmRleCArIGNwdFZpZXdQcm92aWRlcnNDb3VudCk7XG4gICAgICBjb25zdCBkb2VzUHJvdmlkZXJzRmFjdG9yeUV4aXN0ID0gZXhpc3RpbmdQcm92aWRlcnNGYWN0b3J5SW5kZXggPj0gMCAmJlxuICAgICAgICAgIGxJbmplY3RhYmxlc0JsdWVwcmludFtleGlzdGluZ1Byb3ZpZGVyc0ZhY3RvcnlJbmRleF07XG4gICAgICBjb25zdCBkb2VzVmlld1Byb3ZpZGVyc0ZhY3RvcnlFeGlzdCA9IGV4aXN0aW5nVmlld1Byb3ZpZGVyc0ZhY3RvcnlJbmRleCA+PSAwICYmXG4gICAgICAgICAgbEluamVjdGFibGVzQmx1ZXByaW50W2V4aXN0aW5nVmlld1Byb3ZpZGVyc0ZhY3RvcnlJbmRleF07XG5cbiAgICAgIGlmIChpc1ZpZXdQcm92aWRlciAmJiAhZG9lc1ZpZXdQcm92aWRlcnNGYWN0b3J5RXhpc3QgfHxcbiAgICAgICAgICAhaXNWaWV3UHJvdmlkZXIgJiYgIWRvZXNQcm92aWRlcnNGYWN0b3J5RXhpc3QpIHtcbiAgICAgICAgLy8gQ2FzZXMgMS5hIGFuZCAyLmFcbiAgICAgICAgZGlQdWJsaWNJbkluamVjdG9yKFxuICAgICAgICAgICAgZ2V0T3JDcmVhdGVOb2RlSW5qZWN0b3JGb3JOb2RlKFxuICAgICAgICAgICAgICAgIHROb2RlIGFzIFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgVEVsZW1lbnRDb250YWluZXJOb2RlLCBsVmlldyksXG4gICAgICAgICAgICB0VmlldywgdG9rZW4pO1xuICAgICAgICBjb25zdCBmYWN0b3J5ID0gbXVsdGlGYWN0b3J5KFxuICAgICAgICAgICAgaXNWaWV3UHJvdmlkZXIgPyBtdWx0aVZpZXdQcm92aWRlcnNGYWN0b3J5UmVzb2x2ZXIgOiBtdWx0aVByb3ZpZGVyc0ZhY3RvcnlSZXNvbHZlcixcbiAgICAgICAgICAgIGxJbmplY3RhYmxlc0JsdWVwcmludC5sZW5ndGgsIGlzVmlld1Byb3ZpZGVyLCBpc0NvbXBvbmVudCwgcHJvdmlkZXJGYWN0b3J5KTtcbiAgICAgICAgaWYgKCFpc1ZpZXdQcm92aWRlciAmJiBkb2VzVmlld1Byb3ZpZGVyc0ZhY3RvcnlFeGlzdCkge1xuICAgICAgICAgIGxJbmplY3RhYmxlc0JsdWVwcmludFtleGlzdGluZ1ZpZXdQcm92aWRlcnNGYWN0b3J5SW5kZXhdLnByb3ZpZGVyRmFjdG9yeSA9IGZhY3Rvcnk7XG4gICAgICAgIH1cbiAgICAgICAgcmVnaXN0ZXJEZXN0cm95SG9va3NJZlN1cHBvcnRlZCh0VmlldywgcHJvdmlkZXIsIHRJbmplY3RhYmxlcy5sZW5ndGgpO1xuICAgICAgICB0SW5qZWN0YWJsZXMucHVzaCh0b2tlbik7XG4gICAgICAgIHROb2RlLmRpcmVjdGl2ZVN0YXJ0Kys7XG4gICAgICAgIHROb2RlLmRpcmVjdGl2ZUVuZCsrO1xuICAgICAgICBpZiAoaXNWaWV3UHJvdmlkZXIpIHtcbiAgICAgICAgICB0Tm9kZS5wcm92aWRlckluZGV4ZXMgKz0gVE5vZGVQcm92aWRlckluZGV4ZXMuQ3B0Vmlld1Byb3ZpZGVyc0NvdW50U2hpZnRlcjtcbiAgICAgICAgfVxuICAgICAgICBsSW5qZWN0YWJsZXNCbHVlcHJpbnQucHVzaChmYWN0b3J5KTtcbiAgICAgICAgbFZpZXcucHVzaChmYWN0b3J5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIENhc2VzIDEuYiBhbmQgMi5iXG4gICAgICAgIHJlZ2lzdGVyRGVzdHJveUhvb2tzSWZTdXBwb3J0ZWQoXG4gICAgICAgICAgICB0VmlldywgcHJvdmlkZXIsIGV4aXN0aW5nUHJvdmlkZXJzRmFjdG9yeUluZGV4ID4gLTEgP1xuICAgICAgICAgICAgICAgIGV4aXN0aW5nUHJvdmlkZXJzRmFjdG9yeUluZGV4IDpcbiAgICAgICAgICAgICAgICBleGlzdGluZ1ZpZXdQcm92aWRlcnNGYWN0b3J5SW5kZXgpO1xuICAgICAgICBtdWx0aUZhY3RvcnlBZGQoXG4gICAgICAgICAgICBsSW5qZWN0YWJsZXNCbHVlcHJpbnQgIVtpc1ZpZXdQcm92aWRlciA/IGV4aXN0aW5nVmlld1Byb3ZpZGVyc0ZhY3RvcnlJbmRleCA6IGV4aXN0aW5nUHJvdmlkZXJzRmFjdG9yeUluZGV4XSxcbiAgICAgICAgICAgIHByb3ZpZGVyRmFjdG9yeSwgIWlzVmlld1Byb3ZpZGVyICYmIGlzQ29tcG9uZW50KTtcbiAgICAgIH1cbiAgICAgIGlmICghaXNWaWV3UHJvdmlkZXIgJiYgaXNDb21wb25lbnQgJiYgZG9lc1ZpZXdQcm92aWRlcnNGYWN0b3J5RXhpc3QpIHtcbiAgICAgICAgbEluamVjdGFibGVzQmx1ZXByaW50W2V4aXN0aW5nVmlld1Byb3ZpZGVyc0ZhY3RvcnlJbmRleF0uY29tcG9uZW50UHJvdmlkZXJzICErKztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZWdpc3RlcnMgdGhlIGBuZ09uRGVzdHJveWAgaG9vayBvZiBhIHByb3ZpZGVyLCBpZiB0aGUgcHJvdmlkZXIgc3VwcG9ydHMgZGVzdHJveSBob29rcy5cbiAqIEBwYXJhbSB0VmlldyBgVFZpZXdgIGluIHdoaWNoIHRvIHJlZ2lzdGVyIHRoZSBob29rLlxuICogQHBhcmFtIHByb3ZpZGVyIFByb3ZpZGVyIHdob3NlIGhvb2sgc2hvdWxkIGJlIHJlZ2lzdGVyZWQuXG4gKiBAcGFyYW0gY29udGV4dEluZGV4IEluZGV4IHVuZGVyIHdoaWNoIHRvIGZpbmQgdGhlIGNvbnRleHQgZm9yIHRoZSBob29rIHdoZW4gaXQncyBiZWluZyBpbnZva2VkLlxuICovXG5mdW5jdGlvbiByZWdpc3RlckRlc3Ryb3lIb29rc0lmU3VwcG9ydGVkKFxuICAgIHRWaWV3OiBUVmlldywgcHJvdmlkZXI6IEV4Y2x1ZGU8UHJvdmlkZXIsIGFueVtdPiwgY29udGV4dEluZGV4OiBudW1iZXIpIHtcbiAgY29uc3QgcHJvdmlkZXJJc1R5cGVQcm92aWRlciA9IGlzVHlwZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgaWYgKHByb3ZpZGVySXNUeXBlUHJvdmlkZXIgfHwgaXNDbGFzc1Byb3ZpZGVyKHByb3ZpZGVyKSkge1xuICAgIGNvbnN0IHByb3RvdHlwZSA9ICgocHJvdmlkZXIgYXMgQ2xhc3NQcm92aWRlcikudXNlQ2xhc3MgfHwgcHJvdmlkZXIpLnByb3RvdHlwZTtcbiAgICBjb25zdCBuZ09uRGVzdHJveSA9IHByb3RvdHlwZS5uZ09uRGVzdHJveTtcbiAgICBpZiAobmdPbkRlc3Ryb3kpIHtcbiAgICAgICh0Vmlldy5kZXN0cm95SG9va3MgfHwgKHRWaWV3LmRlc3Ryb3lIb29rcyA9IFtdKSkucHVzaChjb250ZXh0SW5kZXgsIG5nT25EZXN0cm95KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgYSBmYWN0b3J5IGluIGEgbXVsdGkgZmFjdG9yeS5cbiAqL1xuZnVuY3Rpb24gbXVsdGlGYWN0b3J5QWRkKFxuICAgIG11bHRpRmFjdG9yeTogTm9kZUluamVjdG9yRmFjdG9yeSwgZmFjdG9yeTogKCkgPT4gYW55LCBpc0NvbXBvbmVudFByb3ZpZGVyOiBib29sZWFuKTogdm9pZCB7XG4gIG11bHRpRmFjdG9yeS5tdWx0aSAhLnB1c2goZmFjdG9yeSk7XG4gIGlmIChpc0NvbXBvbmVudFByb3ZpZGVyKSB7XG4gICAgbXVsdGlGYWN0b3J5LmNvbXBvbmVudFByb3ZpZGVycyAhKys7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbmRleCBvZiBpdGVtIGluIHRoZSBhcnJheSwgYnV0IG9ubHkgaW4gdGhlIGJlZ2luIHRvIGVuZCByYW5nZS5cbiAqL1xuZnVuY3Rpb24gaW5kZXhPZihpdGVtOiBhbnksIGFycjogYW55W10sIGJlZ2luOiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG4gIGZvciAobGV0IGkgPSBiZWdpbjsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGFycltpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG4vKipcbiAqIFVzZSB0aGlzIHdpdGggYG11bHRpYCBgcHJvdmlkZXJzYC5cbiAqL1xuZnVuY3Rpb24gbXVsdGlQcm92aWRlcnNGYWN0b3J5UmVzb2x2ZXIoXG4gICAgdGhpczogTm9kZUluamVjdG9yRmFjdG9yeSwgXzogdW5kZWZpbmVkLCB0RGF0YTogVERhdGEsIGxEYXRhOiBMVmlldyxcbiAgICB0Tm9kZTogVERpcmVjdGl2ZUhvc3ROb2RlKTogYW55W10ge1xuICByZXR1cm4gbXVsdGlSZXNvbHZlKHRoaXMubXVsdGkgISwgW10pO1xufVxuXG4vKipcbiAqIFVzZSB0aGlzIHdpdGggYG11bHRpYCBgdmlld1Byb3ZpZGVyc2AuXG4gKlxuICogVGhpcyBmYWN0b3J5IGtub3dzIGhvdyB0byBjb25jYXRlbmF0ZSBpdHNlbGYgd2l0aCB0aGUgZXhpc3RpbmcgYG11bHRpYCBgcHJvdmlkZXJzYC5cbiAqL1xuZnVuY3Rpb24gbXVsdGlWaWV3UHJvdmlkZXJzRmFjdG9yeVJlc29sdmVyKFxuICAgIHRoaXM6IE5vZGVJbmplY3RvckZhY3RvcnksIF86IHVuZGVmaW5lZCwgdERhdGE6IFREYXRhLCBsVmlldzogTFZpZXcsXG4gICAgdE5vZGU6IFREaXJlY3RpdmVIb3N0Tm9kZSk6IGFueVtdIHtcbiAgY29uc3QgZmFjdG9yaWVzID0gdGhpcy5tdWx0aSAhO1xuICBsZXQgcmVzdWx0OiBhbnlbXTtcbiAgaWYgKHRoaXMucHJvdmlkZXJGYWN0b3J5KSB7XG4gICAgY29uc3QgY29tcG9uZW50Q291bnQgPSB0aGlzLnByb3ZpZGVyRmFjdG9yeS5jb21wb25lbnRQcm92aWRlcnMgITtcbiAgICBjb25zdCBtdWx0aVByb3ZpZGVycyA9XG4gICAgICAgIGdldE5vZGVJbmplY3RhYmxlKGxWaWV3LCBsVmlld1tUVklFV10sIHRoaXMucHJvdmlkZXJGYWN0b3J5ICEuaW5kZXggISwgdE5vZGUpO1xuICAgIC8vIENvcHkgdGhlIHNlY3Rpb24gb2YgdGhlIGFycmF5IHdoaWNoIGNvbnRhaW5zIGBtdWx0aWAgYHByb3ZpZGVyc2AgZnJvbSB0aGUgY29tcG9uZW50XG4gICAgcmVzdWx0ID0gbXVsdGlQcm92aWRlcnMuc2xpY2UoMCwgY29tcG9uZW50Q291bnQpO1xuICAgIC8vIEluc2VydCB0aGUgYHZpZXdQcm92aWRlcmAgaW5zdGFuY2VzLlxuICAgIG11bHRpUmVzb2x2ZShmYWN0b3JpZXMsIHJlc3VsdCk7XG4gICAgLy8gQ29weSB0aGUgc2VjdGlvbiBvZiB0aGUgYXJyYXkgd2hpY2ggY29udGFpbnMgYG11bHRpYCBgcHJvdmlkZXJzYCBmcm9tIG90aGVyIGRpcmVjdGl2ZXNcbiAgICBmb3IgKGxldCBpID0gY29tcG9uZW50Q291bnQ7IGkgPCBtdWx0aVByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0LnB1c2gobXVsdGlQcm92aWRlcnNbaV0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSBbXTtcbiAgICAvLyBJbnNlcnQgdGhlIGB2aWV3UHJvdmlkZXJgIGluc3RhbmNlcy5cbiAgICBtdWx0aVJlc29sdmUoZmFjdG9yaWVzLCByZXN1bHQpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogTWFwcyBhbiBhcnJheSBvZiBmYWN0b3JpZXMgaW50byBhbiBhcnJheSBvZiB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIG11bHRpUmVzb2x2ZShmYWN0b3JpZXM6IEFycmF5PCgpID0+IGFueT4sIHJlc3VsdDogYW55W10pOiBhbnlbXSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZmFjdG9yaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgZmFjdG9yeSA9IGZhY3Rvcmllc1tpXSAhYXMoKSA9PiBudWxsO1xuICAgIHJlc3VsdC5wdXNoKGZhY3RvcnkoKSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbXVsdGkgZmFjdG9yeS5cbiAqL1xuZnVuY3Rpb24gbXVsdGlGYWN0b3J5KFxuICAgIGZhY3RvcnlGbjogKFxuICAgICAgICB0aGlzOiBOb2RlSW5qZWN0b3JGYWN0b3J5LCBfOiB1bmRlZmluZWQsIHREYXRhOiBURGF0YSwgbERhdGE6IExWaWV3LFxuICAgICAgICB0Tm9kZTogVERpcmVjdGl2ZUhvc3ROb2RlKSA9PiBhbnksXG4gICAgaW5kZXg6IG51bWJlciwgaXNWaWV3UHJvdmlkZXI6IGJvb2xlYW4sIGlzQ29tcG9uZW50OiBib29sZWFuLFxuICAgIGY6ICgpID0+IGFueSk6IE5vZGVJbmplY3RvckZhY3Rvcnkge1xuICBjb25zdCBmYWN0b3J5ID0gbmV3IE5vZGVJbmplY3RvckZhY3RvcnkoZmFjdG9yeUZuLCBpc1ZpZXdQcm92aWRlciwgybXJtWRpcmVjdGl2ZUluamVjdCk7XG4gIGZhY3RvcnkubXVsdGkgPSBbXTtcbiAgZmFjdG9yeS5pbmRleCA9IGluZGV4O1xuICBmYWN0b3J5LmNvbXBvbmVudFByb3ZpZGVycyA9IDA7XG4gIG11bHRpRmFjdG9yeUFkZChmYWN0b3J5LCBmLCBpc0NvbXBvbmVudCAmJiAhaXNWaWV3UHJvdmlkZXIpO1xuICByZXR1cm4gZmFjdG9yeTtcbn1cbiJdfQ==