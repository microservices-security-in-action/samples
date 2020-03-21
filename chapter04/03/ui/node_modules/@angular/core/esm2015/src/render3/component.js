/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/render3/component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { assertDataInRange } from '../util/assert';
import { assertComponentType } from './assert';
import { getComponentDef } from './definition';
import { diPublicInInjector, getOrCreateNodeInjectorForNode } from './di';
import { registerPostOrderHooks } from './hooks';
import { CLEAN_PROMISE, addHostBindingsToExpandoInstructions, addToViewTree, createLView, createTView, getOrCreateTComponentView, getOrCreateTNode, growHostVarsSpace, initTNodeFlags, instantiateRootComponent, invokeHostBindingsInCreationMode, locateHostElement, markAsComponentHost, refreshView, renderView } from './instructions/shared';
import { domRendererFactory3 } from './interfaces/renderer';
import { CONTEXT, HEADER_OFFSET, TVIEW } from './interfaces/view';
import { writeDirectClass, writeDirectStyle } from './node_manipulation';
import { enterView, getPreviousOrParentTNode, leaveView, setSelectedIndex } from './state';
import { computeStaticStyling } from './styling/static_styling';
import { setUpAttributes } from './util/attrs_utils';
import { publishDefaultGlobalUtils } from './util/global_utils';
import { defaultScheduler, stringifyForError } from './util/misc_utils';
import { getRootContext } from './util/view_traversal_utils';
import { readPatchedLView } from './util/view_utils';
/**
 * Options that control how the component should be bootstrapped.
 * @record
 */
export function CreateComponentOptions() { }
if (false) {
    /**
     * Which renderer factory to use.
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.rendererFactory;
    /**
     * A custom sanitizer instance
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.sanitizer;
    /**
     * A custom animation player handler
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.playerHandler;
    /**
     * Host element on which the component will be bootstrapped. If not specified,
     * the component definition's `tag` is used to query the existing DOM for the
     * element to bootstrap.
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.host;
    /**
     * Module injector for the component. If unspecified, the injector will be NULL_INJECTOR.
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.injector;
    /**
     * List of features to be applied to the created component. Features are simply
     * functions that decorate a component with a certain behavior.
     *
     * Typically, the features in this list are features that cannot be added to the
     * other features list in the component definition because they rely on other factors.
     *
     * Example: `LifecycleHooksFeature` is a function that adds lifecycle hook capabilities
     * to root components in a tree-shakable way. It cannot be added to the component
     * features list because there's no way of knowing when the component will be used as
     * a root component.
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.hostFeatures;
    /**
     * A function which is used to schedule change detection work in the future.
     *
     * When marking components as dirty, it is necessary to schedule the work of
     * change detection in the future. This is done to coalesce multiple
     * {\@link markDirty} calls into a single changed detection processing.
     *
     * The default value of the scheduler is the `requestAnimationFrame` function.
     *
     * It is also useful to override this function for testing purposes.
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.scheduler;
}
// TODO: A hack to not pull in the NullInjector from @angular/core.
const ɵ0 = /**
 * @param {?} token
 * @param {?=} notFoundValue
 * @return {?}
 */
(token, notFoundValue) => {
    throw new Error('NullInjector: Not found: ' + stringifyForError(token));
};
/** @type {?} */
export const NULL_INJECTOR = {
    get: (ɵ0)
};
/**
 * Bootstraps a Component into an existing host element and returns an instance
 * of the component.
 *
 * Use this function to bootstrap a component into the DOM tree. Each invocation
 * of this function will create a separate tree of components, injectors and
 * change detection cycles and lifetimes. To dynamically insert a new component
 * into an existing tree such that it shares the same injection, change detection
 * and object lifetime, use {\@link ViewContainer#createComponent}.
 *
 * @template T
 * @param {?} componentType Component to bootstrap
 * @param {?=} opts
 * @return {?}
 */
export function renderComponent(componentType /* Type as workaround for: Microsoft/TypeScript/issues/4881 */, opts = {}) {
    ngDevMode && publishDefaultGlobalUtils();
    ngDevMode && assertComponentType(componentType);
    /** @type {?} */
    const rendererFactory = opts.rendererFactory || domRendererFactory3;
    /** @type {?} */
    const sanitizer = opts.sanitizer || null;
    /** @type {?} */
    const componentDef = (/** @type {?} */ (getComponentDef(componentType)));
    if (componentDef.type != componentType)
        ((/** @type {?} */ (componentDef))).type = componentType;
    // The first index of the first selector is the tag name.
    /** @type {?} */
    const componentTag = (/** @type {?} */ ((/** @type {?} */ ((/** @type {?} */ (componentDef.selectors))[0]))[0]));
    /** @type {?} */
    const hostRenderer = rendererFactory.createRenderer(null, null);
    /** @type {?} */
    const hostRNode = locateHostElement(hostRenderer, opts.host || componentTag, componentDef.encapsulation);
    /** @type {?} */
    const rootFlags = componentDef.onPush ? 64 /* Dirty */ | 512 /* IsRoot */ :
        16 /* CheckAlways */ | 512 /* IsRoot */;
    /** @type {?} */
    const rootContext = createRootContext(opts.scheduler, opts.playerHandler);
    /** @type {?} */
    const renderer = rendererFactory.createRenderer(hostRNode, componentDef);
    /** @type {?} */
    const rootTView = createTView(0 /* Root */, -1, null, 1, 0, null, null, null, null, null);
    /** @type {?} */
    const rootView = createLView(null, rootTView, rootContext, rootFlags, null, null, rendererFactory, renderer, undefined, opts.injector || null);
    enterView(rootView, null);
    /** @type {?} */
    let component;
    try {
        if (rendererFactory.begin)
            rendererFactory.begin();
        /** @type {?} */
        const componentView = createRootComponentView(hostRNode, componentDef, rootView, rendererFactory, renderer, sanitizer);
        component = createRootComponent(componentView, componentDef, rootView, rootContext, opts.hostFeatures || null);
        // create mode pass
        renderView(rootTView, rootView, null);
        // update mode pass
        refreshView(rootTView, rootView, null, null);
    }
    finally {
        leaveView();
        if (rendererFactory.end)
            rendererFactory.end();
    }
    return component;
}
/**
 * Creates the root component view and the root component node.
 *
 * @param {?} rNode Render host element.
 * @param {?} def ComponentDef
 * @param {?} rootView The parent view where the host node is stored
 * @param {?} rendererFactory
 * @param {?} hostRenderer The current renderer
 * @param {?=} sanitizer The sanitizer, if provided
 *
 * @return {?} Component view created
 */
export function createRootComponentView(rNode, def, rootView, rendererFactory, hostRenderer, sanitizer) {
    /** @type {?} */
    const tView = rootView[TVIEW];
    ngDevMode && assertDataInRange(rootView, 0 + HEADER_OFFSET);
    rootView[0 + HEADER_OFFSET] = rNode;
    /** @type {?} */
    const tNode = getOrCreateTNode(tView, null, 0, 3 /* Element */, null, null);
    /** @type {?} */
    const mergedAttrs = tNode.mergedAttrs = def.hostAttrs;
    if (mergedAttrs !== null) {
        computeStaticStyling(tNode, mergedAttrs);
        if (rNode !== null) {
            setUpAttributes(hostRenderer, rNode, mergedAttrs);
            if (tNode.classes !== null) {
                writeDirectClass(hostRenderer, rNode, tNode.classes);
            }
            if (tNode.styles !== null) {
                writeDirectStyle(hostRenderer, rNode, tNode.styles);
            }
        }
    }
    /** @type {?} */
    const viewRenderer = rendererFactory.createRenderer(rNode, def);
    /** @type {?} */
    const componentView = createLView(rootView, getOrCreateTComponentView(def), null, def.onPush ? 64 /* Dirty */ : 16 /* CheckAlways */, rootView[HEADER_OFFSET], tNode, rendererFactory, viewRenderer, sanitizer);
    if (tView.firstCreatePass) {
        diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, rootView), tView, def.type);
        markAsComponentHost(tView, tNode);
        initTNodeFlags(tNode, rootView.length, 1);
    }
    addToViewTree(rootView, componentView);
    // Store component view at node index, with node as the HOST
    return rootView[HEADER_OFFSET] = componentView;
}
/**
 * Creates a root component and sets it up with features and host bindings. Shared by
 * renderComponent() and ViewContainerRef.createComponent().
 * @template T
 * @param {?} componentView
 * @param {?} componentDef
 * @param {?} rootLView
 * @param {?} rootContext
 * @param {?} hostFeatures
 * @return {?}
 */
export function createRootComponent(componentView, componentDef, rootLView, rootContext, hostFeatures) {
    /** @type {?} */
    const tView = rootLView[TVIEW];
    // Create directive instance with factory() and store at next index in viewData
    /** @type {?} */
    const component = instantiateRootComponent(tView, rootLView, componentDef);
    rootContext.components.push(component);
    componentView[CONTEXT] = component;
    hostFeatures && hostFeatures.forEach((/**
     * @param {?} feature
     * @return {?}
     */
    (feature) => feature(component, componentDef)));
    // We want to generate an empty QueryList for root content queries for backwards
    // compatibility with ViewEngine.
    if (componentDef.contentQueries) {
        componentDef.contentQueries(1 /* Create */, component, rootLView.length - 1);
    }
    /** @type {?} */
    const rootTNode = getPreviousOrParentTNode();
    if (tView.firstCreatePass &&
        (componentDef.hostBindings !== null || componentDef.hostAttrs !== null)) {
        /** @type {?} */
        const elementIndex = rootTNode.index - HEADER_OFFSET;
        setSelectedIndex(elementIndex);
        /** @type {?} */
        const rootTView = rootLView[TVIEW];
        addHostBindingsToExpandoInstructions(rootTView, componentDef);
        growHostVarsSpace(rootTView, rootLView, componentDef.hostVars);
        invokeHostBindingsInCreationMode(componentDef, component);
    }
    return component;
}
/**
 * @param {?=} scheduler
 * @param {?=} playerHandler
 * @return {?}
 */
export function createRootContext(scheduler, playerHandler) {
    return {
        components: [],
        scheduler: scheduler || defaultScheduler,
        clean: CLEAN_PROMISE,
        playerHandler: playerHandler || null,
        flags: 0 /* Empty */
    };
}
/**
 * Used to enable lifecycle hooks on the root component.
 *
 * Include this feature when calling `renderComponent` if the root component
 * you are rendering has lifecycle hooks defined. Otherwise, the hooks won't
 * be called properly.
 *
 * Example:
 *
 * ```
 * renderComponent(AppComponent, {hostFeatures: [LifecycleHooksFeature]});
 * ```
 * @param {?} component
 * @param {?} def
 * @return {?}
 */
export function LifecycleHooksFeature(component, def) {
    /** @type {?} */
    const rootTView = (/** @type {?} */ (readPatchedLView(component)))[TVIEW];
    /** @type {?} */
    const dirIndex = rootTView.data.length - 1;
    // TODO(misko): replace `as TNode` with createTNode call. (needs refactoring to lose dep on
    // LNode).
    registerPostOrderHooks(rootTView, (/** @type {?} */ ({ directiveStart: dirIndex, directiveEnd: dirIndex + 1 })));
}
/**
 * Wait on component until it is rendered.
 *
 * This function returns a `Promise` which is resolved when the component's
 * change detection is executed. This is determined by finding the scheduler
 * associated with the `component`'s render tree and waiting until the scheduler
 * flushes. If nothing is scheduled, the function returns a resolved promise.
 *
 * Example:
 * ```
 * await whenRendered(myComponent);
 * ```
 *
 * @param {?} component Component to wait upon
 * @return {?} Promise which resolves when the component is rendered.
 */
export function whenRendered(component) {
    return getRootContext(component).clean;
}
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBYUEsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDakQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzdDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDN0MsT0FBTyxFQUFDLGtCQUFrQixFQUFFLDhCQUE4QixFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3hFLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUMvQyxPQUFPLEVBQUMsYUFBYSxFQUFFLG9DQUFvQyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLHlCQUF5QixFQUFFLGdCQUFnQixFQUFFLGlCQUFpQixFQUFFLGNBQWMsRUFBRSx3QkFBd0IsRUFBRSxnQ0FBZ0MsRUFBRSxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFJaFYsT0FBTyxFQUF3QyxtQkFBbUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2pHLE9BQU8sRUFBQyxPQUFPLEVBQUUsYUFBYSxFQUFvRCxLQUFLLEVBQVksTUFBTSxtQkFBbUIsQ0FBQztBQUM3SCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RSxPQUFPLEVBQUMsU0FBUyxFQUFFLHdCQUF3QixFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUN6RixPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUM5RCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbkQsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDOUQsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGlCQUFpQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDdEUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBQzNELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDOzs7OztBQUtuRCw0Q0E4Q0M7Ozs7OztJQTVDQyxpREFBbUM7Ozs7O0lBR25DLDJDQUFzQjs7Ozs7SUFHdEIsK0NBQThCOzs7Ozs7O0lBTzlCLHNDQUF1Qjs7Ozs7SUFHdkIsMENBQW9COzs7Ozs7Ozs7Ozs7OztJQWNwQiw4Q0FBNkI7Ozs7Ozs7Ozs7Ozs7SUFhN0IsMkNBQXVDOzs7Ozs7OztBQVFsQyxDQUFDLEtBQVUsRUFBRSxhQUFtQixFQUFFLEVBQUU7SUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzFFLENBQUM7O0FBSEgsTUFBTSxPQUFPLGFBQWEsR0FBYTtJQUNyQyxHQUFHLE1BRUY7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7OztBQWVELE1BQU0sVUFBVSxlQUFlLENBQzNCLGFBQ1csQ0FBQSw4REFBOEQsRUFFekUsT0FBK0IsRUFBRTtJQUNuQyxTQUFTLElBQUkseUJBQXlCLEVBQUUsQ0FBQztJQUN6QyxTQUFTLElBQUksbUJBQW1CLENBQUMsYUFBYSxDQUFDLENBQUM7O1VBRTFDLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxJQUFJLG1CQUFtQjs7VUFDN0QsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSTs7VUFDbEMsWUFBWSxHQUFHLG1CQUFBLGVBQWUsQ0FBSSxhQUFhLENBQUMsRUFBRTtJQUN4RCxJQUFJLFlBQVksQ0FBQyxJQUFJLElBQUksYUFBYTtRQUFFLENBQUMsbUJBQUEsWUFBWSxFQUFvQixDQUFDLENBQUMsSUFBSSxHQUFHLGFBQWEsQ0FBQzs7O1VBRzFGLFlBQVksR0FBRyxtQkFBQSxtQkFBQSxtQkFBQSxZQUFZLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBVTs7VUFDekQsWUFBWSxHQUFHLGVBQWUsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQzs7VUFDekQsU0FBUyxHQUNYLGlCQUFpQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxJQUFJLFlBQVksRUFBRSxZQUFZLENBQUMsYUFBYSxDQUFDOztVQUNwRixTQUFTLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsaUNBQW9DLENBQUMsQ0FBQztRQUN0Qyx1Q0FBMEM7O1VBQzVFLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUM7O1VBRW5FLFFBQVEsR0FBRyxlQUFlLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUM7O1VBQ2xFLFNBQVMsR0FBRyxXQUFXLGVBQWlCLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7O1VBQ3JGLFFBQVEsR0FBVSxXQUFXLENBQy9CLElBQUksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUN6RixJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQztJQUUxQixTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDOztRQUN0QixTQUFZO0lBRWhCLElBQUk7UUFDRixJQUFJLGVBQWUsQ0FBQyxLQUFLO1lBQUUsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDOztjQUM3QyxhQUFhLEdBQUcsdUJBQXVCLENBQ3pDLFNBQVMsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDO1FBQzVFLFNBQVMsR0FBRyxtQkFBbUIsQ0FDM0IsYUFBYSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLENBQUM7UUFFbkYsbUJBQW1CO1FBQ25CLFVBQVUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3RDLG1CQUFtQjtRQUNuQixXQUFXLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FFOUM7WUFBUztRQUNSLFNBQVMsRUFBRSxDQUFDO1FBQ1osSUFBSSxlQUFlLENBQUMsR0FBRztZQUFFLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUNoRDtJQUVELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7Ozs7Ozs7Ozs7Ozs7QUFhRCxNQUFNLFVBQVUsdUJBQXVCLENBQ25DLEtBQXNCLEVBQUUsR0FBc0IsRUFBRSxRQUFlLEVBQy9ELGVBQWlDLEVBQUUsWUFBdUIsRUFDMUQsU0FBNEI7O1VBQ3hCLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO0lBQzdCLFNBQVMsSUFBSSxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxDQUFDO0lBQzVELFFBQVEsQ0FBQyxDQUFDLEdBQUcsYUFBYSxDQUFDLEdBQUcsS0FBSyxDQUFDOztVQUM5QixLQUFLLEdBQWlCLGdCQUFnQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxtQkFBcUIsSUFBSSxFQUFFLElBQUksQ0FBQzs7VUFDckYsV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLFNBQVM7SUFDckQsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO1FBQ3hCLG9CQUFvQixDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztRQUN6QyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDbEIsZUFBZSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDbEQsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLElBQUksRUFBRTtnQkFDMUIsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDdEQ7WUFDRCxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssSUFBSSxFQUFFO2dCQUN6QixnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNyRDtTQUNGO0tBQ0Y7O1VBRUssWUFBWSxHQUFHLGVBQWUsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQzs7VUFDekQsYUFBYSxHQUFHLFdBQVcsQ0FDN0IsUUFBUSxFQUFFLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFDOUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGdCQUFrQixDQUFDLHFCQUF1QixFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxLQUFLLEVBQ3RGLGVBQWUsRUFBRSxZQUFZLEVBQUUsU0FBUyxDQUFDO0lBRTdDLElBQUksS0FBSyxDQUFDLGVBQWUsRUFBRTtRQUN6QixrQkFBa0IsQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyRixtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEMsY0FBYyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzNDO0lBRUQsYUFBYSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUV2Qyw0REFBNEQ7SUFDNUQsT0FBTyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsYUFBYSxDQUFDO0FBQ2pELENBQUM7Ozs7Ozs7Ozs7OztBQU1ELE1BQU0sVUFBVSxtQkFBbUIsQ0FDL0IsYUFBb0IsRUFBRSxZQUE2QixFQUFFLFNBQWdCLEVBQUUsV0FBd0IsRUFDL0YsWUFBa0M7O1VBQzlCLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDOzs7VUFFeEIsU0FBUyxHQUFHLHdCQUF3QixDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsWUFBWSxDQUFDO0lBRTFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZDLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxTQUFTLENBQUM7SUFFbkMsWUFBWSxJQUFJLFlBQVksQ0FBQyxPQUFPOzs7O0lBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLEVBQUMsQ0FBQztJQUVwRixnRkFBZ0Y7SUFDaEYsaUNBQWlDO0lBQ2pDLElBQUksWUFBWSxDQUFDLGNBQWMsRUFBRTtRQUMvQixZQUFZLENBQUMsY0FBYyxpQkFBcUIsU0FBUyxFQUFFLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDbEY7O1VBRUssU0FBUyxHQUFHLHdCQUF3QixFQUFFO0lBQzVDLElBQUksS0FBSyxDQUFDLGVBQWU7UUFDckIsQ0FBQyxZQUFZLENBQUMsWUFBWSxLQUFLLElBQUksSUFBSSxZQUFZLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxFQUFFOztjQUNyRSxZQUFZLEdBQUcsU0FBUyxDQUFDLEtBQUssR0FBRyxhQUFhO1FBQ3BELGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDOztjQUV6QixTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztRQUNsQyxvQ0FBb0MsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDOUQsaUJBQWlCLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFL0QsZ0NBQWdDLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQzNEO0lBQ0QsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQzs7Ozs7O0FBR0QsTUFBTSxVQUFVLGlCQUFpQixDQUM3QixTQUF3QyxFQUFFLGFBQWtDO0lBQzlFLE9BQU87UUFDTCxVQUFVLEVBQUUsRUFBRTtRQUNkLFNBQVMsRUFBRSxTQUFTLElBQUksZ0JBQWdCO1FBQ3hDLEtBQUssRUFBRSxhQUFhO1FBQ3BCLGFBQWEsRUFBRSxhQUFhLElBQUksSUFBSTtRQUNwQyxLQUFLLGVBQXdCO0tBQzlCLENBQUM7QUFDSixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQWVELE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxTQUFjLEVBQUUsR0FBc0I7O1VBQ3BFLFNBQVMsR0FBRyxtQkFBQSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzs7VUFDaEQsUUFBUSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUM7SUFFMUMsMkZBQTJGO0lBQzNGLFVBQVU7SUFDVixzQkFBc0IsQ0FDbEIsU0FBUyxFQUFFLG1CQUFBLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxFQUFTLENBQUMsQ0FBQztBQUNwRixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQWtCRCxNQUFNLFVBQVUsWUFBWSxDQUFDLFNBQWM7SUFDekMsT0FBTyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3pDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFdlIGFyZSB0ZW1wb3JhcmlseSBpbXBvcnRpbmcgdGhlIGV4aXN0aW5nIHZpZXdFbmdpbmUgZnJvbSBjb3JlIHNvIHdlIGNhbiBiZSBzdXJlIHdlIGFyZVxuLy8gY29ycmVjdGx5IGltcGxlbWVudGluZyBpdHMgaW50ZXJmYWNlcyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG5pbXBvcnQge1R5cGV9IGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi4vZGkvaW5qZWN0b3InO1xuaW1wb3J0IHtTYW5pdGl6ZXJ9IGZyb20gJy4uL3Nhbml0aXphdGlvbi9zYW5pdGl6ZXInO1xuaW1wb3J0IHthc3NlcnREYXRhSW5SYW5nZX0gZnJvbSAnLi4vdXRpbC9hc3NlcnQnO1xuaW1wb3J0IHthc3NlcnRDb21wb25lbnRUeXBlfSBmcm9tICcuL2Fzc2VydCc7XG5pbXBvcnQge2dldENvbXBvbmVudERlZn0gZnJvbSAnLi9kZWZpbml0aW9uJztcbmltcG9ydCB7ZGlQdWJsaWNJbkluamVjdG9yLCBnZXRPckNyZWF0ZU5vZGVJbmplY3RvckZvck5vZGV9IGZyb20gJy4vZGknO1xuaW1wb3J0IHtyZWdpc3RlclBvc3RPcmRlckhvb2tzfSBmcm9tICcuL2hvb2tzJztcbmltcG9ydCB7Q0xFQU5fUFJPTUlTRSwgYWRkSG9zdEJpbmRpbmdzVG9FeHBhbmRvSW5zdHJ1Y3Rpb25zLCBhZGRUb1ZpZXdUcmVlLCBjcmVhdGVMVmlldywgY3JlYXRlVFZpZXcsIGdldE9yQ3JlYXRlVENvbXBvbmVudFZpZXcsIGdldE9yQ3JlYXRlVE5vZGUsIGdyb3dIb3N0VmFyc1NwYWNlLCBpbml0VE5vZGVGbGFncywgaW5zdGFudGlhdGVSb290Q29tcG9uZW50LCBpbnZva2VIb3N0QmluZGluZ3NJbkNyZWF0aW9uTW9kZSwgbG9jYXRlSG9zdEVsZW1lbnQsIG1hcmtBc0NvbXBvbmVudEhvc3QsIHJlZnJlc2hWaWV3LCByZW5kZXJWaWV3fSBmcm9tICcuL2luc3RydWN0aW9ucy9zaGFyZWQnO1xuaW1wb3J0IHtDb21wb25lbnREZWYsIENvbXBvbmVudFR5cGUsIFJlbmRlckZsYWdzfSBmcm9tICcuL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge1RFbGVtZW50Tm9kZSwgVE5vZGUsIFROb2RlVHlwZX0gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtQbGF5ZXJIYW5kbGVyfSBmcm9tICcuL2ludGVyZmFjZXMvcGxheWVyJztcbmltcG9ydCB7UkVsZW1lbnQsIFJlbmRlcmVyMywgUmVuZGVyZXJGYWN0b3J5MywgZG9tUmVuZGVyZXJGYWN0b3J5M30gZnJvbSAnLi9pbnRlcmZhY2VzL3JlbmRlcmVyJztcbmltcG9ydCB7Q09OVEVYVCwgSEVBREVSX09GRlNFVCwgTFZpZXcsIExWaWV3RmxhZ3MsIFJvb3RDb250ZXh0LCBSb290Q29udGV4dEZsYWdzLCBUVklFVywgVFZpZXdUeXBlfSBmcm9tICcuL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge3dyaXRlRGlyZWN0Q2xhc3MsIHdyaXRlRGlyZWN0U3R5bGV9IGZyb20gJy4vbm9kZV9tYW5pcHVsYXRpb24nO1xuaW1wb3J0IHtlbnRlclZpZXcsIGdldFByZXZpb3VzT3JQYXJlbnRUTm9kZSwgbGVhdmVWaWV3LCBzZXRTZWxlY3RlZEluZGV4fSBmcm9tICcuL3N0YXRlJztcbmltcG9ydCB7Y29tcHV0ZVN0YXRpY1N0eWxpbmd9IGZyb20gJy4vc3R5bGluZy9zdGF0aWNfc3R5bGluZyc7XG5pbXBvcnQge3NldFVwQXR0cmlidXRlc30gZnJvbSAnLi91dGlsL2F0dHJzX3V0aWxzJztcbmltcG9ydCB7cHVibGlzaERlZmF1bHRHbG9iYWxVdGlsc30gZnJvbSAnLi91dGlsL2dsb2JhbF91dGlscyc7XG5pbXBvcnQge2RlZmF1bHRTY2hlZHVsZXIsIHN0cmluZ2lmeUZvckVycm9yfSBmcm9tICcuL3V0aWwvbWlzY191dGlscyc7XG5pbXBvcnQge2dldFJvb3RDb250ZXh0fSBmcm9tICcuL3V0aWwvdmlld190cmF2ZXJzYWxfdXRpbHMnO1xuaW1wb3J0IHtyZWFkUGF0Y2hlZExWaWV3fSBmcm9tICcuL3V0aWwvdmlld191dGlscyc7XG5cblxuXG4vKiogT3B0aW9ucyB0aGF0IGNvbnRyb2wgaG93IHRoZSBjb21wb25lbnQgc2hvdWxkIGJlIGJvb3RzdHJhcHBlZC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ3JlYXRlQ29tcG9uZW50T3B0aW9ucyB7XG4gIC8qKiBXaGljaCByZW5kZXJlciBmYWN0b3J5IHRvIHVzZS4gKi9cbiAgcmVuZGVyZXJGYWN0b3J5PzogUmVuZGVyZXJGYWN0b3J5MztcblxuICAvKiogQSBjdXN0b20gc2FuaXRpemVyIGluc3RhbmNlICovXG4gIHNhbml0aXplcj86IFNhbml0aXplcjtcblxuICAvKiogQSBjdXN0b20gYW5pbWF0aW9uIHBsYXllciBoYW5kbGVyICovXG4gIHBsYXllckhhbmRsZXI/OiBQbGF5ZXJIYW5kbGVyO1xuXG4gIC8qKlxuICAgKiBIb3N0IGVsZW1lbnQgb24gd2hpY2ggdGhlIGNvbXBvbmVudCB3aWxsIGJlIGJvb3RzdHJhcHBlZC4gSWYgbm90IHNwZWNpZmllZCxcbiAgICogdGhlIGNvbXBvbmVudCBkZWZpbml0aW9uJ3MgYHRhZ2AgaXMgdXNlZCB0byBxdWVyeSB0aGUgZXhpc3RpbmcgRE9NIGZvciB0aGVcbiAgICogZWxlbWVudCB0byBib290c3RyYXAuXG4gICAqL1xuICBob3N0PzogUkVsZW1lbnR8c3RyaW5nO1xuXG4gIC8qKiBNb2R1bGUgaW5qZWN0b3IgZm9yIHRoZSBjb21wb25lbnQuIElmIHVuc3BlY2lmaWVkLCB0aGUgaW5qZWN0b3Igd2lsbCBiZSBOVUxMX0lOSkVDVE9SLiAqL1xuICBpbmplY3Rvcj86IEluamVjdG9yO1xuXG4gIC8qKlxuICAgKiBMaXN0IG9mIGZlYXR1cmVzIHRvIGJlIGFwcGxpZWQgdG8gdGhlIGNyZWF0ZWQgY29tcG9uZW50LiBGZWF0dXJlcyBhcmUgc2ltcGx5XG4gICAqIGZ1bmN0aW9ucyB0aGF0IGRlY29yYXRlIGEgY29tcG9uZW50IHdpdGggYSBjZXJ0YWluIGJlaGF2aW9yLlxuICAgKlxuICAgKiBUeXBpY2FsbHksIHRoZSBmZWF0dXJlcyBpbiB0aGlzIGxpc3QgYXJlIGZlYXR1cmVzIHRoYXQgY2Fubm90IGJlIGFkZGVkIHRvIHRoZVxuICAgKiBvdGhlciBmZWF0dXJlcyBsaXN0IGluIHRoZSBjb21wb25lbnQgZGVmaW5pdGlvbiBiZWNhdXNlIHRoZXkgcmVseSBvbiBvdGhlciBmYWN0b3JzLlxuICAgKlxuICAgKiBFeGFtcGxlOiBgTGlmZWN5Y2xlSG9va3NGZWF0dXJlYCBpcyBhIGZ1bmN0aW9uIHRoYXQgYWRkcyBsaWZlY3ljbGUgaG9vayBjYXBhYmlsaXRpZXNcbiAgICogdG8gcm9vdCBjb21wb25lbnRzIGluIGEgdHJlZS1zaGFrYWJsZSB3YXkuIEl0IGNhbm5vdCBiZSBhZGRlZCB0byB0aGUgY29tcG9uZW50XG4gICAqIGZlYXR1cmVzIGxpc3QgYmVjYXVzZSB0aGVyZSdzIG5vIHdheSBvZiBrbm93aW5nIHdoZW4gdGhlIGNvbXBvbmVudCB3aWxsIGJlIHVzZWQgYXNcbiAgICogYSByb290IGNvbXBvbmVudC5cbiAgICovXG4gIGhvc3RGZWF0dXJlcz86IEhvc3RGZWF0dXJlW107XG5cbiAgLyoqXG4gICAqIEEgZnVuY3Rpb24gd2hpY2ggaXMgdXNlZCB0byBzY2hlZHVsZSBjaGFuZ2UgZGV0ZWN0aW9uIHdvcmsgaW4gdGhlIGZ1dHVyZS5cbiAgICpcbiAgICogV2hlbiBtYXJraW5nIGNvbXBvbmVudHMgYXMgZGlydHksIGl0IGlzIG5lY2Vzc2FyeSB0byBzY2hlZHVsZSB0aGUgd29yayBvZlxuICAgKiBjaGFuZ2UgZGV0ZWN0aW9uIGluIHRoZSBmdXR1cmUuIFRoaXMgaXMgZG9uZSB0byBjb2FsZXNjZSBtdWx0aXBsZVxuICAgKiB7QGxpbmsgbWFya0RpcnR5fSBjYWxscyBpbnRvIGEgc2luZ2xlIGNoYW5nZWQgZGV0ZWN0aW9uIHByb2Nlc3NpbmcuXG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IHZhbHVlIG9mIHRoZSBzY2hlZHVsZXIgaXMgdGhlIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBJdCBpcyBhbHNvIHVzZWZ1bCB0byBvdmVycmlkZSB0aGlzIGZ1bmN0aW9uIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxuICAgKi9cbiAgc2NoZWR1bGVyPzogKHdvcms6ICgpID0+IHZvaWQpID0+IHZvaWQ7XG59XG5cbi8qKiBTZWUgQ3JlYXRlQ29tcG9uZW50T3B0aW9ucy5ob3N0RmVhdHVyZXMgKi9cbnR5cGUgSG9zdEZlYXR1cmUgPSAoPFQ+KGNvbXBvbmVudDogVCwgY29tcG9uZW50RGVmOiBDb21wb25lbnREZWY8VD4pID0+IHZvaWQpO1xuXG4vLyBUT0RPOiBBIGhhY2sgdG8gbm90IHB1bGwgaW4gdGhlIE51bGxJbmplY3RvciBmcm9tIEBhbmd1bGFyL2NvcmUuXG5leHBvcnQgY29uc3QgTlVMTF9JTkpFQ1RPUjogSW5qZWN0b3IgPSB7XG4gIGdldDogKHRva2VuOiBhbnksIG5vdEZvdW5kVmFsdWU/OiBhbnkpID0+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ051bGxJbmplY3RvcjogTm90IGZvdW5kOiAnICsgc3RyaW5naWZ5Rm9yRXJyb3IodG9rZW4pKTtcbiAgfVxufTtcblxuLyoqXG4gKiBCb290c3RyYXBzIGEgQ29tcG9uZW50IGludG8gYW4gZXhpc3RpbmcgaG9zdCBlbGVtZW50IGFuZCByZXR1cm5zIGFuIGluc3RhbmNlXG4gKiBvZiB0aGUgY29tcG9uZW50LlxuICpcbiAqIFVzZSB0aGlzIGZ1bmN0aW9uIHRvIGJvb3RzdHJhcCBhIGNvbXBvbmVudCBpbnRvIHRoZSBET00gdHJlZS4gRWFjaCBpbnZvY2F0aW9uXG4gKiBvZiB0aGlzIGZ1bmN0aW9uIHdpbGwgY3JlYXRlIGEgc2VwYXJhdGUgdHJlZSBvZiBjb21wb25lbnRzLCBpbmplY3RvcnMgYW5kXG4gKiBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlcyBhbmQgbGlmZXRpbWVzLiBUbyBkeW5hbWljYWxseSBpbnNlcnQgYSBuZXcgY29tcG9uZW50XG4gKiBpbnRvIGFuIGV4aXN0aW5nIHRyZWUgc3VjaCB0aGF0IGl0IHNoYXJlcyB0aGUgc2FtZSBpbmplY3Rpb24sIGNoYW5nZSBkZXRlY3Rpb25cbiAqIGFuZCBvYmplY3QgbGlmZXRpbWUsIHVzZSB7QGxpbmsgVmlld0NvbnRhaW5lciNjcmVhdGVDb21wb25lbnR9LlxuICpcbiAqIEBwYXJhbSBjb21wb25lbnRUeXBlIENvbXBvbmVudCB0byBib290c3RyYXBcbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbmFsIHBhcmFtZXRlcnMgd2hpY2ggY29udHJvbCBib290c3RyYXBwaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJDb21wb25lbnQ8VD4oXG4gICAgY29tcG9uZW50VHlwZTogQ29tcG9uZW50VHlwZTxUPnxcbiAgICAgICAgVHlwZTxUPi8qIFR5cGUgYXMgd29ya2Fyb3VuZCBmb3I6IE1pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy80ODgxICovXG4gICAgLFxuICAgIG9wdHM6IENyZWF0ZUNvbXBvbmVudE9wdGlvbnMgPSB7fSk6IFQge1xuICBuZ0Rldk1vZGUgJiYgcHVibGlzaERlZmF1bHRHbG9iYWxVdGlscygpO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Q29tcG9uZW50VHlwZShjb21wb25lbnRUeXBlKTtcblxuICBjb25zdCByZW5kZXJlckZhY3RvcnkgPSBvcHRzLnJlbmRlcmVyRmFjdG9yeSB8fCBkb21SZW5kZXJlckZhY3RvcnkzO1xuICBjb25zdCBzYW5pdGl6ZXIgPSBvcHRzLnNhbml0aXplciB8fCBudWxsO1xuICBjb25zdCBjb21wb25lbnREZWYgPSBnZXRDb21wb25lbnREZWY8VD4oY29tcG9uZW50VHlwZSkgITtcbiAgaWYgKGNvbXBvbmVudERlZi50eXBlICE9IGNvbXBvbmVudFR5cGUpIChjb21wb25lbnREZWYgYXN7dHlwZTogVHlwZTxhbnk+fSkudHlwZSA9IGNvbXBvbmVudFR5cGU7XG5cbiAgLy8gVGhlIGZpcnN0IGluZGV4IG9mIHRoZSBmaXJzdCBzZWxlY3RvciBpcyB0aGUgdGFnIG5hbWUuXG4gIGNvbnN0IGNvbXBvbmVudFRhZyA9IGNvbXBvbmVudERlZi5zZWxlY3RvcnMgIVswXSAhWzBdIGFzIHN0cmluZztcbiAgY29uc3QgaG9zdFJlbmRlcmVyID0gcmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVJlbmRlcmVyKG51bGwsIG51bGwpO1xuICBjb25zdCBob3N0Uk5vZGUgPVxuICAgICAgbG9jYXRlSG9zdEVsZW1lbnQoaG9zdFJlbmRlcmVyLCBvcHRzLmhvc3QgfHwgY29tcG9uZW50VGFnLCBjb21wb25lbnREZWYuZW5jYXBzdWxhdGlvbik7XG4gIGNvbnN0IHJvb3RGbGFncyA9IGNvbXBvbmVudERlZi5vblB1c2ggPyBMVmlld0ZsYWdzLkRpcnR5IHwgTFZpZXdGbGFncy5Jc1Jvb3QgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTFZpZXdGbGFncy5DaGVja0Fsd2F5cyB8IExWaWV3RmxhZ3MuSXNSb290O1xuICBjb25zdCByb290Q29udGV4dCA9IGNyZWF0ZVJvb3RDb250ZXh0KG9wdHMuc2NoZWR1bGVyLCBvcHRzLnBsYXllckhhbmRsZXIpO1xuXG4gIGNvbnN0IHJlbmRlcmVyID0gcmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVJlbmRlcmVyKGhvc3RSTm9kZSwgY29tcG9uZW50RGVmKTtcbiAgY29uc3Qgcm9vdFRWaWV3ID0gY3JlYXRlVFZpZXcoVFZpZXdUeXBlLlJvb3QsIC0xLCBudWxsLCAxLCAwLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsKTtcbiAgY29uc3Qgcm9vdFZpZXc6IExWaWV3ID0gY3JlYXRlTFZpZXcoXG4gICAgICBudWxsLCByb290VFZpZXcsIHJvb3RDb250ZXh0LCByb290RmxhZ3MsIG51bGwsIG51bGwsIHJlbmRlcmVyRmFjdG9yeSwgcmVuZGVyZXIsIHVuZGVmaW5lZCxcbiAgICAgIG9wdHMuaW5qZWN0b3IgfHwgbnVsbCk7XG5cbiAgZW50ZXJWaWV3KHJvb3RWaWV3LCBudWxsKTtcbiAgbGV0IGNvbXBvbmVudDogVDtcblxuICB0cnkge1xuICAgIGlmIChyZW5kZXJlckZhY3RvcnkuYmVnaW4pIHJlbmRlcmVyRmFjdG9yeS5iZWdpbigpO1xuICAgIGNvbnN0IGNvbXBvbmVudFZpZXcgPSBjcmVhdGVSb290Q29tcG9uZW50VmlldyhcbiAgICAgICAgaG9zdFJOb2RlLCBjb21wb25lbnREZWYsIHJvb3RWaWV3LCByZW5kZXJlckZhY3RvcnksIHJlbmRlcmVyLCBzYW5pdGl6ZXIpO1xuICAgIGNvbXBvbmVudCA9IGNyZWF0ZVJvb3RDb21wb25lbnQoXG4gICAgICAgIGNvbXBvbmVudFZpZXcsIGNvbXBvbmVudERlZiwgcm9vdFZpZXcsIHJvb3RDb250ZXh0LCBvcHRzLmhvc3RGZWF0dXJlcyB8fCBudWxsKTtcblxuICAgIC8vIGNyZWF0ZSBtb2RlIHBhc3NcbiAgICByZW5kZXJWaWV3KHJvb3RUVmlldywgcm9vdFZpZXcsIG51bGwpO1xuICAgIC8vIHVwZGF0ZSBtb2RlIHBhc3NcbiAgICByZWZyZXNoVmlldyhyb290VFZpZXcsIHJvb3RWaWV3LCBudWxsLCBudWxsKTtcblxuICB9IGZpbmFsbHkge1xuICAgIGxlYXZlVmlldygpO1xuICAgIGlmIChyZW5kZXJlckZhY3RvcnkuZW5kKSByZW5kZXJlckZhY3RvcnkuZW5kKCk7XG4gIH1cblxuICByZXR1cm4gY29tcG9uZW50O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgdGhlIHJvb3QgY29tcG9uZW50IHZpZXcgYW5kIHRoZSByb290IGNvbXBvbmVudCBub2RlLlxuICpcbiAqIEBwYXJhbSByTm9kZSBSZW5kZXIgaG9zdCBlbGVtZW50LlxuICogQHBhcmFtIGRlZiBDb21wb25lbnREZWZcbiAqIEBwYXJhbSByb290VmlldyBUaGUgcGFyZW50IHZpZXcgd2hlcmUgdGhlIGhvc3Qgbm9kZSBpcyBzdG9yZWRcbiAqIEBwYXJhbSBob3N0UmVuZGVyZXIgVGhlIGN1cnJlbnQgcmVuZGVyZXJcbiAqIEBwYXJhbSBzYW5pdGl6ZXIgVGhlIHNhbml0aXplciwgaWYgcHJvdmlkZWRcbiAqXG4gKiBAcmV0dXJucyBDb21wb25lbnQgdmlldyBjcmVhdGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSb290Q29tcG9uZW50VmlldyhcbiAgICByTm9kZTogUkVsZW1lbnQgfCBudWxsLCBkZWY6IENvbXBvbmVudERlZjxhbnk+LCByb290VmlldzogTFZpZXcsXG4gICAgcmVuZGVyZXJGYWN0b3J5OiBSZW5kZXJlckZhY3RvcnkzLCBob3N0UmVuZGVyZXI6IFJlbmRlcmVyMyxcbiAgICBzYW5pdGl6ZXI/OiBTYW5pdGl6ZXIgfCBudWxsKTogTFZpZXcge1xuICBjb25zdCB0VmlldyA9IHJvb3RWaWV3W1RWSUVXXTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydERhdGFJblJhbmdlKHJvb3RWaWV3LCAwICsgSEVBREVSX09GRlNFVCk7XG4gIHJvb3RWaWV3WzAgKyBIRUFERVJfT0ZGU0VUXSA9IHJOb2RlO1xuICBjb25zdCB0Tm9kZTogVEVsZW1lbnROb2RlID0gZ2V0T3JDcmVhdGVUTm9kZSh0VmlldywgbnVsbCwgMCwgVE5vZGVUeXBlLkVsZW1lbnQsIG51bGwsIG51bGwpO1xuICBjb25zdCBtZXJnZWRBdHRycyA9IHROb2RlLm1lcmdlZEF0dHJzID0gZGVmLmhvc3RBdHRycztcbiAgaWYgKG1lcmdlZEF0dHJzICE9PSBudWxsKSB7XG4gICAgY29tcHV0ZVN0YXRpY1N0eWxpbmcodE5vZGUsIG1lcmdlZEF0dHJzKTtcbiAgICBpZiAock5vZGUgIT09IG51bGwpIHtcbiAgICAgIHNldFVwQXR0cmlidXRlcyhob3N0UmVuZGVyZXIsIHJOb2RlLCBtZXJnZWRBdHRycyk7XG4gICAgICBpZiAodE5vZGUuY2xhc3NlcyAhPT0gbnVsbCkge1xuICAgICAgICB3cml0ZURpcmVjdENsYXNzKGhvc3RSZW5kZXJlciwgck5vZGUsIHROb2RlLmNsYXNzZXMpO1xuICAgICAgfVxuICAgICAgaWYgKHROb2RlLnN0eWxlcyAhPT0gbnVsbCkge1xuICAgICAgICB3cml0ZURpcmVjdFN0eWxlKGhvc3RSZW5kZXJlciwgck5vZGUsIHROb2RlLnN0eWxlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgdmlld1JlbmRlcmVyID0gcmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVJlbmRlcmVyKHJOb2RlLCBkZWYpO1xuICBjb25zdCBjb21wb25lbnRWaWV3ID0gY3JlYXRlTFZpZXcoXG4gICAgICByb290VmlldywgZ2V0T3JDcmVhdGVUQ29tcG9uZW50VmlldyhkZWYpLCBudWxsLFxuICAgICAgZGVmLm9uUHVzaCA/IExWaWV3RmxhZ3MuRGlydHkgOiBMVmlld0ZsYWdzLkNoZWNrQWx3YXlzLCByb290Vmlld1tIRUFERVJfT0ZGU0VUXSwgdE5vZGUsXG4gICAgICByZW5kZXJlckZhY3RvcnksIHZpZXdSZW5kZXJlciwgc2FuaXRpemVyKTtcblxuICBpZiAodFZpZXcuZmlyc3RDcmVhdGVQYXNzKSB7XG4gICAgZGlQdWJsaWNJbkluamVjdG9yKGdldE9yQ3JlYXRlTm9kZUluamVjdG9yRm9yTm9kZSh0Tm9kZSwgcm9vdFZpZXcpLCB0VmlldywgZGVmLnR5cGUpO1xuICAgIG1hcmtBc0NvbXBvbmVudEhvc3QodFZpZXcsIHROb2RlKTtcbiAgICBpbml0VE5vZGVGbGFncyh0Tm9kZSwgcm9vdFZpZXcubGVuZ3RoLCAxKTtcbiAgfVxuXG4gIGFkZFRvVmlld1RyZWUocm9vdFZpZXcsIGNvbXBvbmVudFZpZXcpO1xuXG4gIC8vIFN0b3JlIGNvbXBvbmVudCB2aWV3IGF0IG5vZGUgaW5kZXgsIHdpdGggbm9kZSBhcyB0aGUgSE9TVFxuICByZXR1cm4gcm9vdFZpZXdbSEVBREVSX09GRlNFVF0gPSBjb21wb25lbnRWaWV3O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSByb290IGNvbXBvbmVudCBhbmQgc2V0cyBpdCB1cCB3aXRoIGZlYXR1cmVzIGFuZCBob3N0IGJpbmRpbmdzLiBTaGFyZWQgYnlcbiAqIHJlbmRlckNvbXBvbmVudCgpIGFuZCBWaWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudCgpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUm9vdENvbXBvbmVudDxUPihcbiAgICBjb21wb25lbnRWaWV3OiBMVmlldywgY29tcG9uZW50RGVmOiBDb21wb25lbnREZWY8VD4sIHJvb3RMVmlldzogTFZpZXcsIHJvb3RDb250ZXh0OiBSb290Q29udGV4dCxcbiAgICBob3N0RmVhdHVyZXM6IEhvc3RGZWF0dXJlW10gfCBudWxsKTogYW55IHtcbiAgY29uc3QgdFZpZXcgPSByb290TFZpZXdbVFZJRVddO1xuICAvLyBDcmVhdGUgZGlyZWN0aXZlIGluc3RhbmNlIHdpdGggZmFjdG9yeSgpIGFuZCBzdG9yZSBhdCBuZXh0IGluZGV4IGluIHZpZXdEYXRhXG4gIGNvbnN0IGNvbXBvbmVudCA9IGluc3RhbnRpYXRlUm9vdENvbXBvbmVudCh0Vmlldywgcm9vdExWaWV3LCBjb21wb25lbnREZWYpO1xuXG4gIHJvb3RDb250ZXh0LmNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICBjb21wb25lbnRWaWV3W0NPTlRFWFRdID0gY29tcG9uZW50O1xuXG4gIGhvc3RGZWF0dXJlcyAmJiBob3N0RmVhdHVyZXMuZm9yRWFjaCgoZmVhdHVyZSkgPT4gZmVhdHVyZShjb21wb25lbnQsIGNvbXBvbmVudERlZikpO1xuXG4gIC8vIFdlIHdhbnQgdG8gZ2VuZXJhdGUgYW4gZW1wdHkgUXVlcnlMaXN0IGZvciByb290IGNvbnRlbnQgcXVlcmllcyBmb3IgYmFja3dhcmRzXG4gIC8vIGNvbXBhdGliaWxpdHkgd2l0aCBWaWV3RW5naW5lLlxuICBpZiAoY29tcG9uZW50RGVmLmNvbnRlbnRRdWVyaWVzKSB7XG4gICAgY29tcG9uZW50RGVmLmNvbnRlbnRRdWVyaWVzKFJlbmRlckZsYWdzLkNyZWF0ZSwgY29tcG9uZW50LCByb290TFZpZXcubGVuZ3RoIC0gMSk7XG4gIH1cblxuICBjb25zdCByb290VE5vZGUgPSBnZXRQcmV2aW91c09yUGFyZW50VE5vZGUoKTtcbiAgaWYgKHRWaWV3LmZpcnN0Q3JlYXRlUGFzcyAmJlxuICAgICAgKGNvbXBvbmVudERlZi5ob3N0QmluZGluZ3MgIT09IG51bGwgfHwgY29tcG9uZW50RGVmLmhvc3RBdHRycyAhPT0gbnVsbCkpIHtcbiAgICBjb25zdCBlbGVtZW50SW5kZXggPSByb290VE5vZGUuaW5kZXggLSBIRUFERVJfT0ZGU0VUO1xuICAgIHNldFNlbGVjdGVkSW5kZXgoZWxlbWVudEluZGV4KTtcblxuICAgIGNvbnN0IHJvb3RUVmlldyA9IHJvb3RMVmlld1tUVklFV107XG4gICAgYWRkSG9zdEJpbmRpbmdzVG9FeHBhbmRvSW5zdHJ1Y3Rpb25zKHJvb3RUVmlldywgY29tcG9uZW50RGVmKTtcbiAgICBncm93SG9zdFZhcnNTcGFjZShyb290VFZpZXcsIHJvb3RMVmlldywgY29tcG9uZW50RGVmLmhvc3RWYXJzKTtcblxuICAgIGludm9rZUhvc3RCaW5kaW5nc0luQ3JlYXRpb25Nb2RlKGNvbXBvbmVudERlZiwgY29tcG9uZW50KTtcbiAgfVxuICByZXR1cm4gY29tcG9uZW50O1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSb290Q29udGV4dChcbiAgICBzY2hlZHVsZXI/OiAod29ya0ZuOiAoKSA9PiB2b2lkKSA9PiB2b2lkLCBwbGF5ZXJIYW5kbGVyPzogUGxheWVySGFuZGxlcnxudWxsKTogUm9vdENvbnRleHQge1xuICByZXR1cm4ge1xuICAgIGNvbXBvbmVudHM6IFtdLFxuICAgIHNjaGVkdWxlcjogc2NoZWR1bGVyIHx8IGRlZmF1bHRTY2hlZHVsZXIsXG4gICAgY2xlYW46IENMRUFOX1BST01JU0UsXG4gICAgcGxheWVySGFuZGxlcjogcGxheWVySGFuZGxlciB8fCBudWxsLFxuICAgIGZsYWdzOiBSb290Q29udGV4dEZsYWdzLkVtcHR5XG4gIH07XG59XG5cbi8qKlxuICogVXNlZCB0byBlbmFibGUgbGlmZWN5Y2xlIGhvb2tzIG9uIHRoZSByb290IGNvbXBvbmVudC5cbiAqXG4gKiBJbmNsdWRlIHRoaXMgZmVhdHVyZSB3aGVuIGNhbGxpbmcgYHJlbmRlckNvbXBvbmVudGAgaWYgdGhlIHJvb3QgY29tcG9uZW50XG4gKiB5b3UgYXJlIHJlbmRlcmluZyBoYXMgbGlmZWN5Y2xlIGhvb2tzIGRlZmluZWQuIE90aGVyd2lzZSwgdGhlIGhvb2tzIHdvbid0XG4gKiBiZSBjYWxsZWQgcHJvcGVybHkuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBcbiAqIHJlbmRlckNvbXBvbmVudChBcHBDb21wb25lbnQsIHtob3N0RmVhdHVyZXM6IFtMaWZlY3ljbGVIb29rc0ZlYXR1cmVdfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIExpZmVjeWNsZUhvb2tzRmVhdHVyZShjb21wb25lbnQ6IGFueSwgZGVmOiBDb21wb25lbnREZWY8YW55Pik6IHZvaWQge1xuICBjb25zdCByb290VFZpZXcgPSByZWFkUGF0Y2hlZExWaWV3KGNvbXBvbmVudCkgIVtUVklFV107XG4gIGNvbnN0IGRpckluZGV4ID0gcm9vdFRWaWV3LmRhdGEubGVuZ3RoIC0gMTtcblxuICAvLyBUT0RPKG1pc2tvKTogcmVwbGFjZSBgYXMgVE5vZGVgIHdpdGggY3JlYXRlVE5vZGUgY2FsbC4gKG5lZWRzIHJlZmFjdG9yaW5nIHRvIGxvc2UgZGVwIG9uXG4gIC8vIExOb2RlKS5cbiAgcmVnaXN0ZXJQb3N0T3JkZXJIb29rcyhcbiAgICAgIHJvb3RUVmlldywgeyBkaXJlY3RpdmVTdGFydDogZGlySW5kZXgsIGRpcmVjdGl2ZUVuZDogZGlySW5kZXggKyAxIH0gYXMgVE5vZGUpO1xufVxuXG4vKipcbiAqIFdhaXQgb24gY29tcG9uZW50IHVudGlsIGl0IGlzIHJlbmRlcmVkLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIGBQcm9taXNlYCB3aGljaCBpcyByZXNvbHZlZCB3aGVuIHRoZSBjb21wb25lbnQnc1xuICogY2hhbmdlIGRldGVjdGlvbiBpcyBleGVjdXRlZC4gVGhpcyBpcyBkZXRlcm1pbmVkIGJ5IGZpbmRpbmcgdGhlIHNjaGVkdWxlclxuICogYXNzb2NpYXRlZCB3aXRoIHRoZSBgY29tcG9uZW50YCdzIHJlbmRlciB0cmVlIGFuZCB3YWl0aW5nIHVudGlsIHRoZSBzY2hlZHVsZXJcbiAqIGZsdXNoZXMuIElmIG5vdGhpbmcgaXMgc2NoZWR1bGVkLCB0aGUgZnVuY3Rpb24gcmV0dXJucyBhIHJlc29sdmVkIHByb21pc2UuXG4gKlxuICogRXhhbXBsZTpcbiAqIGBgYFxuICogYXdhaXQgd2hlblJlbmRlcmVkKG15Q29tcG9uZW50KTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBjb21wb25lbnQgQ29tcG9uZW50IHRvIHdhaXQgdXBvblxuICogQHJldHVybnMgUHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aGVuIHRoZSBjb21wb25lbnQgaXMgcmVuZGVyZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aGVuUmVuZGVyZWQoY29tcG9uZW50OiBhbnkpOiBQcm9taXNlPG51bGw+IHtcbiAgcmV0dXJuIGdldFJvb3RDb250ZXh0KGNvbXBvbmVudCkuY2xlYW47XG59XG4iXX0=