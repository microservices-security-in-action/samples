/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/render3/state.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { assertDefined, assertEqual } from '../util/assert';
import { assertLViewOrUndefined } from './assert';
import { CONTEXT, DECLARATION_VIEW, TVIEW } from './interfaces/view';
import { MATH_ML_NAMESPACE, SVG_NAMESPACE } from './namespaces';
/**
 *
 * @record
 */
function LFrame() { }
if (false) {
    /**
     * Parent LFrame.
     *
     * This is needed when `leaveView` is called to restore the previous state.
     * @type {?}
     */
    LFrame.prototype.parent;
    /**
     * Child LFrame.
     *
     * This is used to cache existing LFrames to relieve the memory pressure.
     * @type {?}
     */
    LFrame.prototype.child;
    /**
     * State of the current view being processed.
     *
     * An array of nodes (text, element, container, etc), pipes, their bindings, and
     * any local variables that need to be stored between invocations.
     * @type {?}
     */
    LFrame.prototype.lView;
    /**
     * Current `TView` associated with the `LFrame.lView`.
     *
     * One can get `TView` from `lFrame[TVIEW]` however because it is so common it makes sense to
     * store it in `LFrame` for perf reasons.
     * @type {?}
     */
    LFrame.prototype.tView;
    /**
     * Used to set the parent property when nodes are created and track query results.
     *
     * This is used in conjunction with `isParent`.
     * @type {?}
     */
    LFrame.prototype.previousOrParentTNode;
    /**
     * If `isParent` is:
     *  - `true`: then `previousOrParentTNode` points to a parent node.
     *  - `false`: then `previousOrParentTNode` points to previous node (sibling).
     * @type {?}
     */
    LFrame.prototype.isParent;
    /**
     * Index of currently selected element in LView.
     *
     * Used by binding instructions. Updated as part of advance instruction.
     * @type {?}
     */
    LFrame.prototype.selectedIndex;
    /**
     * Current pointer to the binding index.
     * @type {?}
     */
    LFrame.prototype.bindingIndex;
    /**
     * The last viewData retrieved by nextContext().
     * Allows building nextContext() and reference() calls.
     *
     * e.g. const inner = x().$implicit; const outer = x().$implicit;
     * @type {?}
     */
    LFrame.prototype.contextLView;
    /**
     * Store the element depth count. This is used to identify the root elements of the template
     * so that we can then attach patch data `LView` to only those elements. We know that those
     * are the only places where the patch data could change, this way we will save on number
     * of places where tha patching occurs.
     * @type {?}
     */
    LFrame.prototype.elementDepthCount;
    /**
     * Current namespace to be used when creating elements
     * @type {?}
     */
    LFrame.prototype.currentNamespace;
    /**
     * Current sanitizer
     * @type {?}
     */
    LFrame.prototype.currentSanitizer;
    /**
     * The root index from which pure function instructions should calculate their binding
     * indices. In component views, this is TView.bindingStartIndex. In a host binding
     * context, this is the TView.expandoStartIndex + any dirs/hostVars before the given dir.
     * @type {?}
     */
    LFrame.prototype.bindingRootIndex;
    /**
     * Current index of a View or Content Query which needs to be processed next.
     * We iterate over the list of Queries and increment current query index at every step.
     * @type {?}
     */
    LFrame.prototype.currentQueryIndex;
    /**
     * When host binding is executing this points to the directive index.
     * `TView.data[currentDirectiveIndex]` is `DirectiveDef`
     * `LView[currentDirectiveIndex]` is directive instance.
     * @type {?}
     */
    LFrame.prototype.currentDirectiveIndex;
}
/**
 * All implicit instruction state is stored here.
 *
 * It is useful to have a single object where all of the state is stored as a mental model
 * (rather it being spread across many different variables.)
 *
 * PERF NOTE: Turns out that writing to a true global variable is slower than
 * having an intermediate object with properties.
 * @record
 */
function InstructionState() { }
if (false) {
    /**
     * Current `LFrame`
     *
     * `null` if we have not called `enterView`
     * @type {?}
     */
    InstructionState.prototype.lFrame;
    /**
     * Stores whether directives should be matched to elements.
     *
     * When template contains `ngNonBindable` then we need to prevent the runtime from matching
     * directives on children of that element.
     *
     * Example:
     * ```
     * <my-comp my-directive>
     *   Should match component / directive.
     * </my-comp>
     * <div ngNonBindable>
     *   <my-comp my-directive>
     *     Should not match component / directive because we are in ngNonBindable.
     *   </my-comp>
     * </div>
     * ```
     * @type {?}
     */
    InstructionState.prototype.bindingsEnabled;
    /**
     * In this mode, any changes in bindings will throw an ExpressionChangedAfterChecked error.
     *
     * Necessary to support ChangeDetectorRef.checkNoChanges().
     * @type {?}
     */
    InstructionState.prototype.checkNoChangesMode;
}
/** @type {?} */
export const instructionState = {
    lFrame: createLFrame(null),
    bindingsEnabled: true,
    checkNoChangesMode: false,
};
/**
 * @return {?}
 */
export function getElementDepthCount() {
    return instructionState.lFrame.elementDepthCount;
}
/**
 * @return {?}
 */
export function increaseElementDepthCount() {
    instructionState.lFrame.elementDepthCount++;
}
/**
 * @return {?}
 */
export function decreaseElementDepthCount() {
    instructionState.lFrame.elementDepthCount--;
}
/**
 * @return {?}
 */
export function getBindingsEnabled() {
    return instructionState.bindingsEnabled;
}
/**
 * Enables directive matching on elements.
 *
 *  * Example:
 * ```
 * <my-comp my-directive>
 *   Should match component / directive.
 * </my-comp>
 * <div ngNonBindable>
 *   <!-- ɵɵdisableBindings() -->
 *   <my-comp my-directive>
 *     Should not match component / directive because we are in ngNonBindable.
 *   </my-comp>
 *   <!-- ɵɵenableBindings() -->
 * </div>
 * ```
 *
 * \@codeGenApi
 * @return {?}
 */
export function ɵɵenableBindings() {
    instructionState.bindingsEnabled = true;
}
/**
 * Disables directive matching on element.
 *
 *  * Example:
 * ```
 * <my-comp my-directive>
 *   Should match component / directive.
 * </my-comp>
 * <div ngNonBindable>
 *   <!-- ɵɵdisableBindings() -->
 *   <my-comp my-directive>
 *     Should not match component / directive because we are in ngNonBindable.
 *   </my-comp>
 *   <!-- ɵɵenableBindings() -->
 * </div>
 * ```
 *
 * \@codeGenApi
 * @return {?}
 */
export function ɵɵdisableBindings() {
    instructionState.bindingsEnabled = false;
}
/**
 * Return the current `LView`.
 * @return {?}
 */
export function getLView() {
    return instructionState.lFrame.lView;
}
/**
 * Return the current `TView`.
 * @return {?}
 */
export function getTView() {
    return instructionState.lFrame.tView;
}
/**
 * Restores `contextViewData` to the given OpaqueViewState instance.
 *
 * Used in conjunction with the getCurrentView() instruction to save a snapshot
 * of the current view and restore it when listeners are invoked. This allows
 * walking the declaration view tree in listeners to get vars from parent views.
 *
 * \@codeGenApi
 * @param {?} viewToRestore The OpaqueViewState instance to restore.
 *
 * @return {?}
 */
export function ɵɵrestoreView(viewToRestore) {
    instructionState.lFrame.contextLView = (/** @type {?} */ ((/** @type {?} */ (viewToRestore))));
}
/**
 * @return {?}
 */
export function getPreviousOrParentTNode() {
    return instructionState.lFrame.previousOrParentTNode;
}
/**
 * @param {?} tNode
 * @param {?} isParent
 * @return {?}
 */
export function setPreviousOrParentTNode(tNode, isParent) {
    instructionState.lFrame.previousOrParentTNode = tNode;
    instructionState.lFrame.isParent = isParent;
}
/**
 * @return {?}
 */
export function getIsParent() {
    return instructionState.lFrame.isParent;
}
/**
 * @return {?}
 */
export function setIsNotParent() {
    instructionState.lFrame.isParent = false;
}
/**
 * @return {?}
 */
export function setIsParent() {
    instructionState.lFrame.isParent = true;
}
/**
 * @return {?}
 */
export function getContextLView() {
    return instructionState.lFrame.contextLView;
}
/**
 * @return {?}
 */
export function getCheckNoChangesMode() {
    // TODO(misko): remove this from the LView since it is ngDevMode=true mode only.
    return instructionState.checkNoChangesMode;
}
/**
 * @param {?} mode
 * @return {?}
 */
export function setCheckNoChangesMode(mode) {
    instructionState.checkNoChangesMode = mode;
}
// top level variables should not be exported for performance reasons (PERF_NOTES.md)
/**
 * @return {?}
 */
export function getBindingRoot() {
    /** @type {?} */
    const lFrame = instructionState.lFrame;
    /** @type {?} */
    let index = lFrame.bindingRootIndex;
    if (index === -1) {
        index = lFrame.bindingRootIndex = lFrame.tView.bindingStartIndex;
    }
    return index;
}
/**
 * @return {?}
 */
export function getBindingIndex() {
    return instructionState.lFrame.bindingIndex;
}
/**
 * @param {?} value
 * @return {?}
 */
export function setBindingIndex(value) {
    return instructionState.lFrame.bindingIndex = value;
}
/**
 * @return {?}
 */
export function nextBindingIndex() {
    return instructionState.lFrame.bindingIndex++;
}
/**
 * @param {?} count
 * @return {?}
 */
export function incrementBindingIndex(count) {
    /** @type {?} */
    const lFrame = instructionState.lFrame;
    /** @type {?} */
    const index = lFrame.bindingIndex;
    lFrame.bindingIndex = lFrame.bindingIndex + count;
    return index;
}
/**
 * Set a new binding root index so that host template functions can execute.
 *
 * Bindings inside the host template are 0 index. But because we don't know ahead of time
 * how many host bindings we have we can't pre-compute them. For this reason they are all
 * 0 index and we just shift the root so that they match next available location in the LView.
 *
 * @param {?} bindingRootIndex Root index for `hostBindings`
 * @param {?} currentDirectiveIndex `TData[currentDirectiveIndex]` will point to the current directive
 *        whose `hostBindings` are being processed.
 * @return {?}
 */
export function setBindingRootForHostBindings(bindingRootIndex, currentDirectiveIndex) {
    /** @type {?} */
    const lFrame = instructionState.lFrame;
    lFrame.bindingIndex = lFrame.bindingRootIndex = bindingRootIndex;
    lFrame.currentDirectiveIndex = currentDirectiveIndex;
}
/**
 * When host binding is executing this points to the directive index.
 * `TView.data[getCurrentDirectiveIndex()]` is `DirectiveDef`
 * `LView[getCurrentDirectiveIndex()]` is directive instance.
 * @return {?}
 */
export function getCurrentDirectiveIndex() {
    return instructionState.lFrame.currentDirectiveIndex;
}
/**
 * @return {?}
 */
export function getCurrentQueryIndex() {
    return instructionState.lFrame.currentQueryIndex;
}
/**
 * @param {?} value
 * @return {?}
 */
export function setCurrentQueryIndex(value) {
    instructionState.lFrame.currentQueryIndex = value;
}
/**
 * This is a light weight version of the `enterView` which is needed by the DI system.
 * @param {?} newView
 * @param {?} tNode
 * @return {?}
 */
export function enterDI(newView, tNode) {
    ngDevMode && assertLViewOrUndefined(newView);
    /** @type {?} */
    const newLFrame = allocLFrame();
    instructionState.lFrame = newLFrame;
    newLFrame.previousOrParentTNode = (/** @type {?} */ (tNode));
    newLFrame.lView = newView;
}
/**
 * Swap the current lView with a new lView.
 *
 * For performance reasons we store the lView in the top level of the module.
 * This way we minimize the number of properties to read. Whenever a new view
 * is entered we have to store the lView for later, and when the view is
 * exited the state has to be restored
 *
 * @param {?} newView New lView to become active
 * @param {?} tNode Element to which the View is a child of
 * @return {?} the previously active lView;
 */
export function enterView(newView, tNode) {
    ngDevMode && assertLViewOrUndefined(newView);
    /** @type {?} */
    const newLFrame = allocLFrame();
    if (ngDevMode) {
        assertEqual(newLFrame.isParent, true, 'Expected clean LFrame');
        assertEqual(newLFrame.lView, null, 'Expected clean LFrame');
        assertEqual(newLFrame.tView, null, 'Expected clean LFrame');
        assertEqual(newLFrame.selectedIndex, 0, 'Expected clean LFrame');
        assertEqual(newLFrame.elementDepthCount, 0, 'Expected clean LFrame');
        assertEqual(newLFrame.currentDirectiveIndex, -1, 'Expected clean LFrame');
        assertEqual(newLFrame.currentNamespace, null, 'Expected clean LFrame');
        assertEqual(newLFrame.currentSanitizer, null, 'Expected clean LFrame');
        assertEqual(newLFrame.bindingRootIndex, -1, 'Expected clean LFrame');
        assertEqual(newLFrame.currentQueryIndex, 0, 'Expected clean LFrame');
    }
    /** @type {?} */
    const tView = newView[TVIEW];
    instructionState.lFrame = newLFrame;
    newLFrame.previousOrParentTNode = (/** @type {?} */ (tNode));
    newLFrame.lView = newView;
    newLFrame.tView = tView;
    newLFrame.contextLView = (/** @type {?} */ (newView));
    newLFrame.bindingIndex = tView.bindingStartIndex;
}
/**
 * Allocates next free LFrame. This function tries to reuse the `LFrame`s to lower memory pressure.
 * @return {?}
 */
function allocLFrame() {
    /** @type {?} */
    const currentLFrame = instructionState.lFrame;
    /** @type {?} */
    const childLFrame = currentLFrame === null ? null : currentLFrame.child;
    /** @type {?} */
    const newLFrame = childLFrame === null ? createLFrame(currentLFrame) : childLFrame;
    return newLFrame;
}
/**
 * @param {?} parent
 * @return {?}
 */
function createLFrame(parent) {
    /** @type {?} */
    const lFrame = {
        previousOrParentTNode: (/** @type {?} */ (null)),
        //
        isParent: true,
        //
        lView: (/** @type {?} */ (null)),
        //
        tView: (/** @type {?} */ (null)),
        //
        selectedIndex: 0,
        //
        contextLView: (/** @type {?} */ (null)),
        //
        elementDepthCount: 0,
        //
        currentNamespace: null,
        //
        currentSanitizer: null,
        //
        currentDirectiveIndex: -1,
        //
        bindingRootIndex: -1,
        //
        bindingIndex: -1,
        //
        currentQueryIndex: 0,
        //
        parent: (/** @type {?} */ (parent)),
        //
        child: null,
    };
    parent !== null && (parent.child = lFrame); // link the new LFrame for reuse.
    return lFrame;
}
/**
 * A lightweight version of leave which is used with DI.
 *
 * This function only resets `previousOrParentTNode` and `LView` as those are the only properties
 * used with DI (`enterDI()`).
 *
 * NOTE: This function is reexported as `leaveDI`. However `leaveDI` has return type of `void` where
 * as `leaveViewLight` has `LFrame`. This is so that `leaveViewLight` can be used in `leaveView`.
 * @return {?}
 */
function leaveViewLight() {
    /** @type {?} */
    const oldLFrame = instructionState.lFrame;
    instructionState.lFrame = oldLFrame.parent;
    oldLFrame.previousOrParentTNode = (/** @type {?} */ (null));
    oldLFrame.lView = (/** @type {?} */ (null));
    return oldLFrame;
}
/**
 * This is a lightweight version of the `leaveView` which is needed by the DI system.
 *
 * NOTE: this function is an alias so that we can change the type of the function to have `void`
 * return type.
 * @type {?}
 */
export const leaveDI = leaveViewLight;
/**
 * Leave the current `LView`
 *
 * This pops the `LFrame` with the associated `LView` from the stack.
 *
 * IMPORTANT: We must zero out the `LFrame` values here otherwise they will be retained. This is
 * because for performance reasons we don't release `LFrame` but rather keep it for next use.
 * @return {?}
 */
export function leaveView() {
    /** @type {?} */
    const oldLFrame = leaveViewLight();
    oldLFrame.isParent = true;
    oldLFrame.tView = (/** @type {?} */ (null));
    oldLFrame.selectedIndex = 0;
    oldLFrame.contextLView = (/** @type {?} */ (null));
    oldLFrame.elementDepthCount = 0;
    oldLFrame.currentDirectiveIndex = -1;
    oldLFrame.currentNamespace = null;
    oldLFrame.currentSanitizer = null;
    oldLFrame.bindingRootIndex = -1;
    oldLFrame.bindingIndex = -1;
    oldLFrame.currentQueryIndex = 0;
}
/**
 * @template T
 * @param {?} level
 * @return {?}
 */
export function nextContextImpl(level) {
    /** @type {?} */
    const contextLView = instructionState.lFrame.contextLView =
        walkUpViews(level, (/** @type {?} */ (instructionState.lFrame.contextLView)));
    return (/** @type {?} */ (contextLView[CONTEXT]));
}
/**
 * @param {?} nestingLevel
 * @param {?} currentView
 * @return {?}
 */
function walkUpViews(nestingLevel, currentView) {
    while (nestingLevel > 0) {
        ngDevMode && assertDefined(currentView[DECLARATION_VIEW], 'Declaration view should be defined if nesting level is greater than 0.');
        currentView = (/** @type {?} */ (currentView[DECLARATION_VIEW]));
        nestingLevel--;
    }
    return currentView;
}
/**
 * Gets the currently selected element index.
 *
 * Used with {\@link property} instruction (and more in the future) to identify the index in the
 * current `LView` to act on.
 * @return {?}
 */
export function getSelectedIndex() {
    return instructionState.lFrame.selectedIndex;
}
/**
 * Sets the most recent index passed to {\@link select}
 *
 * Used with {\@link property} instruction (and more in the future) to identify the index in the
 * current `LView` to act on.
 *
 * (Note that if an "exit function" was set earlier (via `setElementExitFn()`) then that will be
 * run if and when the provided `index` value is different from the current selected index value.)
 * @param {?} index
 * @return {?}
 */
export function setSelectedIndex(index) {
    instructionState.lFrame.selectedIndex = index;
}
/**
 * Sets the namespace used to create elements to `'http://www.w3.org/2000/svg'` in global state.
 *
 * \@codeGenApi
 * @return {?}
 */
export function ɵɵnamespaceSVG() {
    instructionState.lFrame.currentNamespace = SVG_NAMESPACE;
}
/**
 * Sets the namespace used to create elements to `'http://www.w3.org/1998/MathML/'` in global state.
 *
 * \@codeGenApi
 * @return {?}
 */
export function ɵɵnamespaceMathML() {
    instructionState.lFrame.currentNamespace = MATH_ML_NAMESPACE;
}
/**
 * Sets the namespace used to create elements to `null`, which forces element creation to use
 * `createElement` rather than `createElementNS`.
 *
 * \@codeGenApi
 * @return {?}
 */
export function ɵɵnamespaceHTML() {
    namespaceHTMLInternal();
}
/**
 * Sets the namespace used to create elements to `null`, which forces element creation to use
 * `createElement` rather than `createElementNS`.
 * @return {?}
 */
export function namespaceHTMLInternal() {
    instructionState.lFrame.currentNamespace = null;
}
/**
 * @return {?}
 */
export function getNamespace() {
    return instructionState.lFrame.currentNamespace;
}
/**
 * @param {?} sanitizer
 * @return {?}
 */
export function setCurrentStyleSanitizer(sanitizer) {
    instructionState.lFrame.currentSanitizer = sanitizer;
}
/**
 * @return {?}
 */
export function resetCurrentStyleSanitizer() {
    setCurrentStyleSanitizer(null);
}
/**
 * @return {?}
 */
export function getCurrentStyleSanitizer() {
    // TODO(misko): This should throw when there is no LView, but it turns out we can get here from
    // `NodeStyleDebug` hence we return `null`. This should be fixed
    /** @type {?} */
    const lFrame = instructionState.lFrame;
    return lFrame === null ? null : lFrame.currentSanitizer;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL3N0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVNBLE9BQU8sRUFBQyxhQUFhLEVBQUUsV0FBVyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDMUQsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRWhELE9BQU8sRUFBQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQTBCLEtBQUssRUFBUSxNQUFNLG1CQUFtQixDQUFDO0FBQ2xHLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxhQUFhLEVBQUMsTUFBTSxjQUFjLENBQUM7Ozs7O0FBTTlELHFCQXVHQzs7Ozs7Ozs7SUFqR0Msd0JBQWU7Ozs7Ozs7SUFPZix1QkFBbUI7Ozs7Ozs7O0lBUW5CLHVCQUFhOzs7Ozs7OztJQVFiLHVCQUFhOzs7Ozs7O0lBT2IsdUNBQTZCOzs7Ozs7O0lBTzdCLDBCQUFrQjs7Ozs7OztJQU9sQiwrQkFBc0I7Ozs7O0lBS3RCLDhCQUFxQjs7Ozs7Ozs7SUFRckIsOEJBQW9COzs7Ozs7OztJQVFwQixtQ0FBMEI7Ozs7O0lBSzFCLGtDQUE4Qjs7Ozs7SUFLOUIsa0NBQXVDOzs7Ozs7O0lBUXZDLGtDQUF5Qjs7Ozs7O0lBTXpCLG1DQUEwQjs7Ozs7OztJQU8xQix1Q0FBOEI7Ozs7Ozs7Ozs7OztBQVloQywrQkFrQ0M7Ozs7Ozs7O0lBNUJDLGtDQUFlOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQW9CZiwyQ0FBeUI7Ozs7Ozs7SUFPekIsOENBQTRCOzs7QUFHOUIsTUFBTSxPQUFPLGdCQUFnQixHQUFxQjtJQUNoRCxNQUFNLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQztJQUMxQixlQUFlLEVBQUUsSUFBSTtJQUNyQixrQkFBa0IsRUFBRSxLQUFLO0NBQzFCOzs7O0FBR0QsTUFBTSxVQUFVLG9CQUFvQjtJQUNsQyxPQUFPLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztBQUNuRCxDQUFDOzs7O0FBRUQsTUFBTSxVQUFVLHlCQUF5QjtJQUN2QyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUM5QyxDQUFDOzs7O0FBRUQsTUFBTSxVQUFVLHlCQUF5QjtJQUN2QyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUM5QyxDQUFDOzs7O0FBRUQsTUFBTSxVQUFVLGtCQUFrQjtJQUNoQyxPQUFPLGdCQUFnQixDQUFDLGVBQWUsQ0FBQztBQUMxQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkQsTUFBTSxVQUFVLGdCQUFnQjtJQUM5QixnQkFBZ0IsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBQzFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFCRCxNQUFNLFVBQVUsaUJBQWlCO0lBQy9CLGdCQUFnQixDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7QUFDM0MsQ0FBQzs7Ozs7QUFLRCxNQUFNLFVBQVUsUUFBUTtJQUN0QixPQUFPLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDdkMsQ0FBQzs7Ozs7QUFLRCxNQUFNLFVBQVUsUUFBUTtJQUN0QixPQUFPLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDdkMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQWFELE1BQU0sVUFBVSxhQUFhLENBQUMsYUFBOEI7SUFDMUQsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFlBQVksR0FBRyxtQkFBQSxtQkFBQSxhQUFhLEVBQU8sRUFBUyxDQUFDO0FBQ3ZFLENBQUM7Ozs7QUFFRCxNQUFNLFVBQVUsd0JBQXdCO0lBQ3RDLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDO0FBQ3ZELENBQUM7Ozs7OztBQUVELE1BQU0sVUFBVSx3QkFBd0IsQ0FBQyxLQUFZLEVBQUUsUUFBaUI7SUFDdEUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztJQUN0RCxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUM5QyxDQUFDOzs7O0FBRUQsTUFBTSxVQUFVLFdBQVc7SUFDekIsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQzFDLENBQUM7Ozs7QUFFRCxNQUFNLFVBQVUsY0FBYztJQUM1QixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztBQUMzQyxDQUFDOzs7O0FBQ0QsTUFBTSxVQUFVLFdBQVc7SUFDekIsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDMUMsQ0FBQzs7OztBQUVELE1BQU0sVUFBVSxlQUFlO0lBQzdCLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUM5QyxDQUFDOzs7O0FBRUQsTUFBTSxVQUFVLHFCQUFxQjtJQUNuQyxnRkFBZ0Y7SUFDaEYsT0FBTyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQztBQUM3QyxDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxJQUFhO0lBQ2pELGdCQUFnQixDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztBQUM3QyxDQUFDOzs7OztBQUdELE1BQU0sVUFBVSxjQUFjOztVQUN0QixNQUFNLEdBQUcsZ0JBQWdCLENBQUMsTUFBTTs7UUFDbEMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0I7SUFDbkMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDaEIsS0FBSyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDO0tBQ2xFO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDOzs7O0FBRUQsTUFBTSxVQUFVLGVBQWU7SUFDN0IsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQzlDLENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLGVBQWUsQ0FBQyxLQUFhO0lBQzNDLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7QUFDdEQsQ0FBQzs7OztBQUVELE1BQU0sVUFBVSxnQkFBZ0I7SUFDOUIsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDaEQsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUscUJBQXFCLENBQUMsS0FBYTs7VUFDM0MsTUFBTSxHQUFHLGdCQUFnQixDQUFDLE1BQU07O1VBQ2hDLEtBQUssR0FBRyxNQUFNLENBQUMsWUFBWTtJQUNqQyxNQUFNLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO0lBQ2xELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQzs7Ozs7Ozs7Ozs7OztBQWFELE1BQU0sVUFBVSw2QkFBNkIsQ0FDekMsZ0JBQXdCLEVBQUUscUJBQTZCOztVQUNuRCxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsTUFBTTtJQUN0QyxNQUFNLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztJQUNqRSxNQUFNLENBQUMscUJBQXFCLEdBQUcscUJBQXFCLENBQUM7QUFDdkQsQ0FBQzs7Ozs7OztBQU9ELE1BQU0sVUFBVSx3QkFBd0I7SUFDdEMsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUM7QUFDdkQsQ0FBQzs7OztBQUVELE1BQU0sVUFBVSxvQkFBb0I7SUFDbEMsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7QUFDbkQsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsb0JBQW9CLENBQUMsS0FBYTtJQUNoRCxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO0FBQ3BELENBQUM7Ozs7Ozs7QUFPRCxNQUFNLFVBQVUsT0FBTyxDQUFDLE9BQWMsRUFBRSxLQUFZO0lBQ2xELFNBQVMsSUFBSSxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7VUFDdkMsU0FBUyxHQUFHLFdBQVcsRUFBRTtJQUMvQixnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO0lBQ3BDLFNBQVMsQ0FBQyxxQkFBcUIsR0FBRyxtQkFBQSxLQUFLLEVBQUUsQ0FBQztJQUMxQyxTQUFTLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztBQUM1QixDQUFDOzs7Ozs7Ozs7Ozs7O0FBY0QsTUFBTSxVQUFVLFNBQVMsQ0FBQyxPQUFjLEVBQUUsS0FBbUI7SUFDM0QsU0FBUyxJQUFJLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDOztVQUN2QyxTQUFTLEdBQUcsV0FBVyxFQUFFO0lBQy9CLElBQUksU0FBUyxFQUFFO1FBQ2IsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixDQUFDLENBQUM7UUFDL0QsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixDQUFDLENBQUM7UUFDNUQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixDQUFDLENBQUM7UUFDNUQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLENBQUM7UUFDakUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUNyRSxXQUFXLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLENBQUM7UUFDMUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUN2RSxXQUFXLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3ZFLFdBQVcsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUNyRSxXQUFXLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0tBQ3RFOztVQUNLLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQzVCLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7SUFDcEMsU0FBUyxDQUFDLHFCQUFxQixHQUFHLG1CQUFBLEtBQUssRUFBRSxDQUFDO0lBQzFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0lBQzFCLFNBQVMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLFNBQVMsQ0FBQyxZQUFZLEdBQUcsbUJBQUEsT0FBTyxFQUFFLENBQUM7SUFDbkMsU0FBUyxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUM7QUFDbkQsQ0FBQzs7Ozs7QUFLRCxTQUFTLFdBQVc7O1VBQ1osYUFBYSxHQUFHLGdCQUFnQixDQUFDLE1BQU07O1VBQ3ZDLFdBQVcsR0FBRyxhQUFhLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLOztVQUNqRSxTQUFTLEdBQUcsV0FBVyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXO0lBQ2xGLE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7Ozs7O0FBRUQsU0FBUyxZQUFZLENBQUMsTUFBcUI7O1VBQ25DLE1BQU0sR0FBVztRQUNyQixxQkFBcUIsRUFBRSxtQkFBQSxJQUFJLEVBQUU7O1FBQzdCLFFBQVEsRUFBRSxJQUFJOztRQUNkLEtBQUssRUFBRSxtQkFBQSxJQUFJLEVBQUU7O1FBQ2IsS0FBSyxFQUFFLG1CQUFBLElBQUksRUFBRTs7UUFDYixhQUFhLEVBQUUsQ0FBQzs7UUFDaEIsWUFBWSxFQUFFLG1CQUFBLElBQUksRUFBRTs7UUFDcEIsaUJBQWlCLEVBQUUsQ0FBQzs7UUFDcEIsZ0JBQWdCLEVBQUUsSUFBSTs7UUFDdEIsZ0JBQWdCLEVBQUUsSUFBSTs7UUFDdEIscUJBQXFCLEVBQUUsQ0FBQyxDQUFDOztRQUN6QixnQkFBZ0IsRUFBRSxDQUFDLENBQUM7O1FBQ3BCLFlBQVksRUFBRSxDQUFDLENBQUM7O1FBQ2hCLGlCQUFpQixFQUFFLENBQUM7O1FBQ3BCLE1BQU0sRUFBRSxtQkFBQSxNQUFNLEVBQUU7O1FBQ2hCLEtBQUssRUFBRSxJQUFJO0tBQ1o7SUFDRCxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFFLGlDQUFpQztJQUM5RSxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDOzs7Ozs7Ozs7OztBQVdELFNBQVMsY0FBYzs7VUFDZixTQUFTLEdBQUcsZ0JBQWdCLENBQUMsTUFBTTtJQUN6QyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztJQUMzQyxTQUFTLENBQUMscUJBQXFCLEdBQUcsbUJBQUEsSUFBSSxFQUFFLENBQUM7SUFDekMsU0FBUyxDQUFDLEtBQUssR0FBRyxtQkFBQSxJQUFJLEVBQUUsQ0FBQztJQUN6QixPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDOzs7Ozs7OztBQVFELE1BQU0sT0FBTyxPQUFPLEdBQWUsY0FBYzs7Ozs7Ozs7OztBQVVqRCxNQUFNLFVBQVUsU0FBUzs7VUFDakIsU0FBUyxHQUFHLGNBQWMsRUFBRTtJQUNsQyxTQUFTLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztJQUMxQixTQUFTLENBQUMsS0FBSyxHQUFHLG1CQUFBLElBQUksRUFBRSxDQUFDO0lBQ3pCLFNBQVMsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO0lBQzVCLFNBQVMsQ0FBQyxZQUFZLEdBQUcsbUJBQUEsSUFBSSxFQUFFLENBQUM7SUFDaEMsU0FBUyxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQztJQUNoQyxTQUFTLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDckMsU0FBUyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztJQUNsQyxTQUFTLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0lBQ2xDLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNoQyxTQUFTLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzVCLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7QUFDbEMsQ0FBQzs7Ozs7O0FBRUQsTUFBTSxVQUFVLGVBQWUsQ0FBVSxLQUFhOztVQUM5QyxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFlBQVk7UUFDckQsV0FBVyxDQUFDLEtBQUssRUFBRSxtQkFBQSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDOUQsT0FBTyxtQkFBQSxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUssQ0FBQztBQUNwQyxDQUFDOzs7Ozs7QUFFRCxTQUFTLFdBQVcsQ0FBQyxZQUFvQixFQUFFLFdBQWtCO0lBQzNELE9BQU8sWUFBWSxHQUFHLENBQUMsRUFBRTtRQUN2QixTQUFTLElBQUksYUFBYSxDQUNULFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUM3Qix3RUFBd0UsQ0FBQyxDQUFDO1FBQzNGLFdBQVcsR0FBRyxtQkFBQSxXQUFXLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO1FBQzlDLFlBQVksRUFBRSxDQUFDO0tBQ2hCO0lBQ0QsT0FBTyxXQUFXLENBQUM7QUFDckIsQ0FBQzs7Ozs7Ozs7QUFRRCxNQUFNLFVBQVUsZ0JBQWdCO0lBQzlCLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztBQUMvQyxDQUFDOzs7Ozs7Ozs7Ozs7QUFXRCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsS0FBYTtJQUM1QyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztBQUNoRCxDQUFDOzs7Ozs7O0FBUUQsTUFBTSxVQUFVLGNBQWM7SUFDNUIsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLGFBQWEsQ0FBQztBQUMzRCxDQUFDOzs7Ozs7O0FBT0QsTUFBTSxVQUFVLGlCQUFpQjtJQUMvQixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsaUJBQWlCLENBQUM7QUFDL0QsQ0FBQzs7Ozs7Ozs7QUFRRCxNQUFNLFVBQVUsZUFBZTtJQUM3QixxQkFBcUIsRUFBRSxDQUFDO0FBQzFCLENBQUM7Ozs7OztBQU1ELE1BQU0sVUFBVSxxQkFBcUI7SUFDbkMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUNsRCxDQUFDOzs7O0FBRUQsTUFBTSxVQUFVLFlBQVk7SUFDMUIsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7QUFDbEQsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsd0JBQXdCLENBQUMsU0FBaUM7SUFDeEUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztBQUN2RCxDQUFDOzs7O0FBRUQsTUFBTSxVQUFVLDBCQUEwQjtJQUN4Qyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQyxDQUFDOzs7O0FBRUQsTUFBTSxVQUFVLHdCQUF3Qjs7OztVQUdoQyxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsTUFBTTtJQUN0QyxPQUFPLE1BQU0sS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO0FBQzFELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U3R5bGVTYW5pdGl6ZUZufSBmcm9tICcuLi9zYW5pdGl6YXRpb24vc3R5bGVfc2FuaXRpemVyJztcbmltcG9ydCB7YXNzZXJ0RGVmaW5lZCwgYXNzZXJ0RXF1YWx9IGZyb20gJy4uL3V0aWwvYXNzZXJ0JztcbmltcG9ydCB7YXNzZXJ0TFZpZXdPclVuZGVmaW5lZH0gZnJvbSAnLi9hc3NlcnQnO1xuaW1wb3J0IHtUTm9kZX0gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtDT05URVhULCBERUNMQVJBVElPTl9WSUVXLCBMVmlldywgT3BhcXVlVmlld1N0YXRlLCBUVklFVywgVFZpZXd9IGZyb20gJy4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7TUFUSF9NTF9OQU1FU1BBQ0UsIFNWR19OQU1FU1BBQ0V9IGZyb20gJy4vbmFtZXNwYWNlcyc7XG5cblxuLyoqXG4gKlxuICovXG5pbnRlcmZhY2UgTEZyYW1lIHtcbiAgLyoqXG4gICAqIFBhcmVudCBMRnJhbWUuXG4gICAqXG4gICAqIFRoaXMgaXMgbmVlZGVkIHdoZW4gYGxlYXZlVmlld2AgaXMgY2FsbGVkIHRvIHJlc3RvcmUgdGhlIHByZXZpb3VzIHN0YXRlLlxuICAgKi9cbiAgcGFyZW50OiBMRnJhbWU7XG5cbiAgLyoqXG4gICAqIENoaWxkIExGcmFtZS5cbiAgICpcbiAgICogVGhpcyBpcyB1c2VkIHRvIGNhY2hlIGV4aXN0aW5nIExGcmFtZXMgdG8gcmVsaWV2ZSB0aGUgbWVtb3J5IHByZXNzdXJlLlxuICAgKi9cbiAgY2hpbGQ6IExGcmFtZXxudWxsO1xuXG4gIC8qKlxuICAgKiBTdGF0ZSBvZiB0aGUgY3VycmVudCB2aWV3IGJlaW5nIHByb2Nlc3NlZC5cbiAgICpcbiAgICogQW4gYXJyYXkgb2Ygbm9kZXMgKHRleHQsIGVsZW1lbnQsIGNvbnRhaW5lciwgZXRjKSwgcGlwZXMsIHRoZWlyIGJpbmRpbmdzLCBhbmRcbiAgICogYW55IGxvY2FsIHZhcmlhYmxlcyB0aGF0IG5lZWQgdG8gYmUgc3RvcmVkIGJldHdlZW4gaW52b2NhdGlvbnMuXG4gICAqL1xuICBsVmlldzogTFZpZXc7XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgYFRWaWV3YCBhc3NvY2lhdGVkIHdpdGggdGhlIGBMRnJhbWUubFZpZXdgLlxuICAgKlxuICAgKiBPbmUgY2FuIGdldCBgVFZpZXdgIGZyb20gYGxGcmFtZVtUVklFV11gIGhvd2V2ZXIgYmVjYXVzZSBpdCBpcyBzbyBjb21tb24gaXQgbWFrZXMgc2Vuc2UgdG9cbiAgICogc3RvcmUgaXQgaW4gYExGcmFtZWAgZm9yIHBlcmYgcmVhc29ucy5cbiAgICovXG4gIHRWaWV3OiBUVmlldztcblxuICAvKipcbiAgICogVXNlZCB0byBzZXQgdGhlIHBhcmVudCBwcm9wZXJ0eSB3aGVuIG5vZGVzIGFyZSBjcmVhdGVkIGFuZCB0cmFjayBxdWVyeSByZXN1bHRzLlxuICAgKlxuICAgKiBUaGlzIGlzIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBgaXNQYXJlbnRgLlxuICAgKi9cbiAgcHJldmlvdXNPclBhcmVudFROb2RlOiBUTm9kZTtcblxuICAvKipcbiAgICogSWYgYGlzUGFyZW50YCBpczpcbiAgICogIC0gYHRydWVgOiB0aGVuIGBwcmV2aW91c09yUGFyZW50VE5vZGVgIHBvaW50cyB0byBhIHBhcmVudCBub2RlLlxuICAgKiAgLSBgZmFsc2VgOiB0aGVuIGBwcmV2aW91c09yUGFyZW50VE5vZGVgIHBvaW50cyB0byBwcmV2aW91cyBub2RlIChzaWJsaW5nKS5cbiAgICovXG4gIGlzUGFyZW50OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBJbmRleCBvZiBjdXJyZW50bHkgc2VsZWN0ZWQgZWxlbWVudCBpbiBMVmlldy5cbiAgICpcbiAgICogVXNlZCBieSBiaW5kaW5nIGluc3RydWN0aW9ucy4gVXBkYXRlZCBhcyBwYXJ0IG9mIGFkdmFuY2UgaW5zdHJ1Y3Rpb24uXG4gICAqL1xuICBzZWxlY3RlZEluZGV4OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgcG9pbnRlciB0byB0aGUgYmluZGluZyBpbmRleC5cbiAgICovXG4gIGJpbmRpbmdJbmRleDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGUgbGFzdCB2aWV3RGF0YSByZXRyaWV2ZWQgYnkgbmV4dENvbnRleHQoKS5cbiAgICogQWxsb3dzIGJ1aWxkaW5nIG5leHRDb250ZXh0KCkgYW5kIHJlZmVyZW5jZSgpIGNhbGxzLlxuICAgKlxuICAgKiBlLmcuIGNvbnN0IGlubmVyID0geCgpLiRpbXBsaWNpdDsgY29uc3Qgb3V0ZXIgPSB4KCkuJGltcGxpY2l0O1xuICAgKi9cbiAgY29udGV4dExWaWV3OiBMVmlldztcblxuICAvKipcbiAgICogU3RvcmUgdGhlIGVsZW1lbnQgZGVwdGggY291bnQuIFRoaXMgaXMgdXNlZCB0byBpZGVudGlmeSB0aGUgcm9vdCBlbGVtZW50cyBvZiB0aGUgdGVtcGxhdGVcbiAgICogc28gdGhhdCB3ZSBjYW4gdGhlbiBhdHRhY2ggcGF0Y2ggZGF0YSBgTFZpZXdgIHRvIG9ubHkgdGhvc2UgZWxlbWVudHMuIFdlIGtub3cgdGhhdCB0aG9zZVxuICAgKiBhcmUgdGhlIG9ubHkgcGxhY2VzIHdoZXJlIHRoZSBwYXRjaCBkYXRhIGNvdWxkIGNoYW5nZSwgdGhpcyB3YXkgd2Ugd2lsbCBzYXZlIG9uIG51bWJlclxuICAgKiBvZiBwbGFjZXMgd2hlcmUgdGhhIHBhdGNoaW5nIG9jY3Vycy5cbiAgICovXG4gIGVsZW1lbnREZXB0aENvdW50OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgbmFtZXNwYWNlIHRvIGJlIHVzZWQgd2hlbiBjcmVhdGluZyBlbGVtZW50c1xuICAgKi9cbiAgY3VycmVudE5hbWVzcGFjZTogc3RyaW5nfG51bGw7XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgc2FuaXRpemVyXG4gICAqL1xuICBjdXJyZW50U2FuaXRpemVyOiBTdHlsZVNhbml0aXplRm58bnVsbDtcblxuXG4gIC8qKlxuICAgKiBUaGUgcm9vdCBpbmRleCBmcm9tIHdoaWNoIHB1cmUgZnVuY3Rpb24gaW5zdHJ1Y3Rpb25zIHNob3VsZCBjYWxjdWxhdGUgdGhlaXIgYmluZGluZ1xuICAgKiBpbmRpY2VzLiBJbiBjb21wb25lbnQgdmlld3MsIHRoaXMgaXMgVFZpZXcuYmluZGluZ1N0YXJ0SW5kZXguIEluIGEgaG9zdCBiaW5kaW5nXG4gICAqIGNvbnRleHQsIHRoaXMgaXMgdGhlIFRWaWV3LmV4cGFuZG9TdGFydEluZGV4ICsgYW55IGRpcnMvaG9zdFZhcnMgYmVmb3JlIHRoZSBnaXZlbiBkaXIuXG4gICAqL1xuICBiaW5kaW5nUm9vdEluZGV4OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgaW5kZXggb2YgYSBWaWV3IG9yIENvbnRlbnQgUXVlcnkgd2hpY2ggbmVlZHMgdG8gYmUgcHJvY2Vzc2VkIG5leHQuXG4gICAqIFdlIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBvZiBRdWVyaWVzIGFuZCBpbmNyZW1lbnQgY3VycmVudCBxdWVyeSBpbmRleCBhdCBldmVyeSBzdGVwLlxuICAgKi9cbiAgY3VycmVudFF1ZXJ5SW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogV2hlbiBob3N0IGJpbmRpbmcgaXMgZXhlY3V0aW5nIHRoaXMgcG9pbnRzIHRvIHRoZSBkaXJlY3RpdmUgaW5kZXguXG4gICAqIGBUVmlldy5kYXRhW2N1cnJlbnREaXJlY3RpdmVJbmRleF1gIGlzIGBEaXJlY3RpdmVEZWZgXG4gICAqIGBMVmlld1tjdXJyZW50RGlyZWN0aXZlSW5kZXhdYCBpcyBkaXJlY3RpdmUgaW5zdGFuY2UuXG4gICAqL1xuICBjdXJyZW50RGlyZWN0aXZlSW5kZXg6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBBbGwgaW1wbGljaXQgaW5zdHJ1Y3Rpb24gc3RhdGUgaXMgc3RvcmVkIGhlcmUuXG4gKlxuICogSXQgaXMgdXNlZnVsIHRvIGhhdmUgYSBzaW5nbGUgb2JqZWN0IHdoZXJlIGFsbCBvZiB0aGUgc3RhdGUgaXMgc3RvcmVkIGFzIGEgbWVudGFsIG1vZGVsXG4gKiAocmF0aGVyIGl0IGJlaW5nIHNwcmVhZCBhY3Jvc3MgbWFueSBkaWZmZXJlbnQgdmFyaWFibGVzLilcbiAqXG4gKiBQRVJGIE5PVEU6IFR1cm5zIG91dCB0aGF0IHdyaXRpbmcgdG8gYSB0cnVlIGdsb2JhbCB2YXJpYWJsZSBpcyBzbG93ZXIgdGhhblxuICogaGF2aW5nIGFuIGludGVybWVkaWF0ZSBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzLlxuICovXG5pbnRlcmZhY2UgSW5zdHJ1Y3Rpb25TdGF0ZSB7XG4gIC8qKlxuICAgKiBDdXJyZW50IGBMRnJhbWVgXG4gICAqXG4gICAqIGBudWxsYCBpZiB3ZSBoYXZlIG5vdCBjYWxsZWQgYGVudGVyVmlld2BcbiAgICovXG4gIGxGcmFtZTogTEZyYW1lO1xuXG4gIC8qKlxuICAgKiBTdG9yZXMgd2hldGhlciBkaXJlY3RpdmVzIHNob3VsZCBiZSBtYXRjaGVkIHRvIGVsZW1lbnRzLlxuICAgKlxuICAgKiBXaGVuIHRlbXBsYXRlIGNvbnRhaW5zIGBuZ05vbkJpbmRhYmxlYCB0aGVuIHdlIG5lZWQgdG8gcHJldmVudCB0aGUgcnVudGltZSBmcm9tIG1hdGNoaW5nXG4gICAqIGRpcmVjdGl2ZXMgb24gY2hpbGRyZW4gb2YgdGhhdCBlbGVtZW50LlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKiBgYGBcbiAgICogPG15LWNvbXAgbXktZGlyZWN0aXZlPlxuICAgKiAgIFNob3VsZCBtYXRjaCBjb21wb25lbnQgLyBkaXJlY3RpdmUuXG4gICAqIDwvbXktY29tcD5cbiAgICogPGRpdiBuZ05vbkJpbmRhYmxlPlxuICAgKiAgIDxteS1jb21wIG15LWRpcmVjdGl2ZT5cbiAgICogICAgIFNob3VsZCBub3QgbWF0Y2ggY29tcG9uZW50IC8gZGlyZWN0aXZlIGJlY2F1c2Ugd2UgYXJlIGluIG5nTm9uQmluZGFibGUuXG4gICAqICAgPC9teS1jb21wPlxuICAgKiA8L2Rpdj5cbiAgICogYGBgXG4gICAqL1xuICBiaW5kaW5nc0VuYWJsZWQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEluIHRoaXMgbW9kZSwgYW55IGNoYW5nZXMgaW4gYmluZGluZ3Mgd2lsbCB0aHJvdyBhbiBFeHByZXNzaW9uQ2hhbmdlZEFmdGVyQ2hlY2tlZCBlcnJvci5cbiAgICpcbiAgICogTmVjZXNzYXJ5IHRvIHN1cHBvcnQgQ2hhbmdlRGV0ZWN0b3JSZWYuY2hlY2tOb0NoYW5nZXMoKS5cbiAgICovXG4gIGNoZWNrTm9DaGFuZ2VzTW9kZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IGluc3RydWN0aW9uU3RhdGU6IEluc3RydWN0aW9uU3RhdGUgPSB7XG4gIGxGcmFtZTogY3JlYXRlTEZyYW1lKG51bGwpLFxuICBiaW5kaW5nc0VuYWJsZWQ6IHRydWUsXG4gIGNoZWNrTm9DaGFuZ2VzTW9kZTogZmFsc2UsXG59O1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50RGVwdGhDb3VudCgpIHtcbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmVsZW1lbnREZXB0aENvdW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5jcmVhc2VFbGVtZW50RGVwdGhDb3VudCgpIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuZWxlbWVudERlcHRoQ291bnQrKztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY3JlYXNlRWxlbWVudERlcHRoQ291bnQoKSB7XG4gIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmVsZW1lbnREZXB0aENvdW50LS07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCaW5kaW5nc0VuYWJsZWQoKTogYm9vbGVhbiB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmJpbmRpbmdzRW5hYmxlZDtcbn1cblxuXG4vKipcbiAqIEVuYWJsZXMgZGlyZWN0aXZlIG1hdGNoaW5nIG9uIGVsZW1lbnRzLlxuICpcbiAqICAqIEV4YW1wbGU6XG4gKiBgYGBcbiAqIDxteS1jb21wIG15LWRpcmVjdGl2ZT5cbiAqICAgU2hvdWxkIG1hdGNoIGNvbXBvbmVudCAvIGRpcmVjdGl2ZS5cbiAqIDwvbXktY29tcD5cbiAqIDxkaXYgbmdOb25CaW5kYWJsZT5cbiAqICAgPCEtLSDJtcm1ZGlzYWJsZUJpbmRpbmdzKCkgLS0+XG4gKiAgIDxteS1jb21wIG15LWRpcmVjdGl2ZT5cbiAqICAgICBTaG91bGQgbm90IG1hdGNoIGNvbXBvbmVudCAvIGRpcmVjdGl2ZSBiZWNhdXNlIHdlIGFyZSBpbiBuZ05vbkJpbmRhYmxlLlxuICogICA8L215LWNvbXA+XG4gKiAgIDwhLS0gybXJtWVuYWJsZUJpbmRpbmdzKCkgLS0+XG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1ZW5hYmxlQmluZGluZ3MoKTogdm9pZCB7XG4gIGluc3RydWN0aW9uU3RhdGUuYmluZGluZ3NFbmFibGVkID0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBEaXNhYmxlcyBkaXJlY3RpdmUgbWF0Y2hpbmcgb24gZWxlbWVudC5cbiAqXG4gKiAgKiBFeGFtcGxlOlxuICogYGBgXG4gKiA8bXktY29tcCBteS1kaXJlY3RpdmU+XG4gKiAgIFNob3VsZCBtYXRjaCBjb21wb25lbnQgLyBkaXJlY3RpdmUuXG4gKiA8L215LWNvbXA+XG4gKiA8ZGl2IG5nTm9uQmluZGFibGU+XG4gKiAgIDwhLS0gybXJtWRpc2FibGVCaW5kaW5ncygpIC0tPlxuICogICA8bXktY29tcCBteS1kaXJlY3RpdmU+XG4gKiAgICAgU2hvdWxkIG5vdCBtYXRjaCBjb21wb25lbnQgLyBkaXJlY3RpdmUgYmVjYXVzZSB3ZSBhcmUgaW4gbmdOb25CaW5kYWJsZS5cbiAqICAgPC9teS1jb21wPlxuICogICA8IS0tIMm1ybVlbmFibGVCaW5kaW5ncygpIC0tPlxuICogPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtWRpc2FibGVCaW5kaW5ncygpOiB2b2lkIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5iaW5kaW5nc0VuYWJsZWQgPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGN1cnJlbnQgYExWaWV3YC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExWaWV3KCk6IExWaWV3IHtcbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmxWaWV3O1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBgVFZpZXdgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VFZpZXcoKTogVFZpZXcge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUudFZpZXc7XG59XG5cbi8qKlxuICogUmVzdG9yZXMgYGNvbnRleHRWaWV3RGF0YWAgdG8gdGhlIGdpdmVuIE9wYXF1ZVZpZXdTdGF0ZSBpbnN0YW5jZS5cbiAqXG4gKiBVc2VkIGluIGNvbmp1bmN0aW9uIHdpdGggdGhlIGdldEN1cnJlbnRWaWV3KCkgaW5zdHJ1Y3Rpb24gdG8gc2F2ZSBhIHNuYXBzaG90XG4gKiBvZiB0aGUgY3VycmVudCB2aWV3IGFuZCByZXN0b3JlIGl0IHdoZW4gbGlzdGVuZXJzIGFyZSBpbnZva2VkLiBUaGlzIGFsbG93c1xuICogd2Fsa2luZyB0aGUgZGVjbGFyYXRpb24gdmlldyB0cmVlIGluIGxpc3RlbmVycyB0byBnZXQgdmFycyBmcm9tIHBhcmVudCB2aWV3cy5cbiAqXG4gKiBAcGFyYW0gdmlld1RvUmVzdG9yZSBUaGUgT3BhcXVlVmlld1N0YXRlIGluc3RhbmNlIHRvIHJlc3RvcmUuXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVyZXN0b3JlVmlldyh2aWV3VG9SZXN0b3JlOiBPcGFxdWVWaWV3U3RhdGUpIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuY29udGV4dExWaWV3ID0gdmlld1RvUmVzdG9yZSBhcyBhbnkgYXMgTFZpZXc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcmV2aW91c09yUGFyZW50VE5vZGUoKTogVE5vZGUge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUucHJldmlvdXNPclBhcmVudFROb2RlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJldmlvdXNPclBhcmVudFROb2RlKHROb2RlOiBUTm9kZSwgaXNQYXJlbnQ6IGJvb2xlYW4pIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUucHJldmlvdXNPclBhcmVudFROb2RlID0gdE5vZGU7XG4gIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmlzUGFyZW50ID0gaXNQYXJlbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJc1BhcmVudCgpOiBib29sZWFuIHtcbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmlzUGFyZW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0SXNOb3RQYXJlbnQoKTogdm9pZCB7XG4gIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmlzUGFyZW50ID0gZmFsc2U7XG59XG5leHBvcnQgZnVuY3Rpb24gc2V0SXNQYXJlbnQoKTogdm9pZCB7XG4gIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmlzUGFyZW50ID0gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRleHRMVmlldygpOiBMVmlldyB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5jb250ZXh0TFZpZXc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDaGVja05vQ2hhbmdlc01vZGUoKTogYm9vbGVhbiB7XG4gIC8vIFRPRE8obWlza28pOiByZW1vdmUgdGhpcyBmcm9tIHRoZSBMVmlldyBzaW5jZSBpdCBpcyBuZ0Rldk1vZGU9dHJ1ZSBtb2RlIG9ubHkuXG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmNoZWNrTm9DaGFuZ2VzTW9kZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldENoZWNrTm9DaGFuZ2VzTW9kZShtb2RlOiBib29sZWFuKTogdm9pZCB7XG4gIGluc3RydWN0aW9uU3RhdGUuY2hlY2tOb0NoYW5nZXNNb2RlID0gbW9kZTtcbn1cblxuLy8gdG9wIGxldmVsIHZhcmlhYmxlcyBzaG91bGQgbm90IGJlIGV4cG9ydGVkIGZvciBwZXJmb3JtYW5jZSByZWFzb25zIChQRVJGX05PVEVTLm1kKVxuZXhwb3J0IGZ1bmN0aW9uIGdldEJpbmRpbmdSb290KCkge1xuICBjb25zdCBsRnJhbWUgPSBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZTtcbiAgbGV0IGluZGV4ID0gbEZyYW1lLmJpbmRpbmdSb290SW5kZXg7XG4gIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICBpbmRleCA9IGxGcmFtZS5iaW5kaW5nUm9vdEluZGV4ID0gbEZyYW1lLnRWaWV3LmJpbmRpbmdTdGFydEluZGV4O1xuICB9XG4gIHJldHVybiBpbmRleDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJpbmRpbmdJbmRleCgpOiBudW1iZXIge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuYmluZGluZ0luZGV4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QmluZGluZ0luZGV4KHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuYmluZGluZ0luZGV4ID0gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuZXh0QmluZGluZ0luZGV4KCk6IG51bWJlciB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5iaW5kaW5nSW5kZXgrKztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluY3JlbWVudEJpbmRpbmdJbmRleChjb3VudDogbnVtYmVyKTogbnVtYmVyIHtcbiAgY29uc3QgbEZyYW1lID0gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWU7XG4gIGNvbnN0IGluZGV4ID0gbEZyYW1lLmJpbmRpbmdJbmRleDtcbiAgbEZyYW1lLmJpbmRpbmdJbmRleCA9IGxGcmFtZS5iaW5kaW5nSW5kZXggKyBjb3VudDtcbiAgcmV0dXJuIGluZGV4O1xufVxuXG4vKipcbiAqIFNldCBhIG5ldyBiaW5kaW5nIHJvb3QgaW5kZXggc28gdGhhdCBob3N0IHRlbXBsYXRlIGZ1bmN0aW9ucyBjYW4gZXhlY3V0ZS5cbiAqXG4gKiBCaW5kaW5ncyBpbnNpZGUgdGhlIGhvc3QgdGVtcGxhdGUgYXJlIDAgaW5kZXguIEJ1dCBiZWNhdXNlIHdlIGRvbid0IGtub3cgYWhlYWQgb2YgdGltZVxuICogaG93IG1hbnkgaG9zdCBiaW5kaW5ncyB3ZSBoYXZlIHdlIGNhbid0IHByZS1jb21wdXRlIHRoZW0uIEZvciB0aGlzIHJlYXNvbiB0aGV5IGFyZSBhbGxcbiAqIDAgaW5kZXggYW5kIHdlIGp1c3Qgc2hpZnQgdGhlIHJvb3Qgc28gdGhhdCB0aGV5IG1hdGNoIG5leHQgYXZhaWxhYmxlIGxvY2F0aW9uIGluIHRoZSBMVmlldy5cbiAqXG4gKiBAcGFyYW0gYmluZGluZ1Jvb3RJbmRleCBSb290IGluZGV4IGZvciBgaG9zdEJpbmRpbmdzYFxuICogQHBhcmFtIGN1cnJlbnREaXJlY3RpdmVJbmRleCBgVERhdGFbY3VycmVudERpcmVjdGl2ZUluZGV4XWAgd2lsbCBwb2ludCB0byB0aGUgY3VycmVudCBkaXJlY3RpdmVcbiAqICAgICAgICB3aG9zZSBgaG9zdEJpbmRpbmdzYCBhcmUgYmVpbmcgcHJvY2Vzc2VkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0QmluZGluZ1Jvb3RGb3JIb3N0QmluZGluZ3MoXG4gICAgYmluZGluZ1Jvb3RJbmRleDogbnVtYmVyLCBjdXJyZW50RGlyZWN0aXZlSW5kZXg6IG51bWJlcikge1xuICBjb25zdCBsRnJhbWUgPSBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZTtcbiAgbEZyYW1lLmJpbmRpbmdJbmRleCA9IGxGcmFtZS5iaW5kaW5nUm9vdEluZGV4ID0gYmluZGluZ1Jvb3RJbmRleDtcbiAgbEZyYW1lLmN1cnJlbnREaXJlY3RpdmVJbmRleCA9IGN1cnJlbnREaXJlY3RpdmVJbmRleDtcbn1cblxuLyoqXG4gKiBXaGVuIGhvc3QgYmluZGluZyBpcyBleGVjdXRpbmcgdGhpcyBwb2ludHMgdG8gdGhlIGRpcmVjdGl2ZSBpbmRleC5cbiAqIGBUVmlldy5kYXRhW2dldEN1cnJlbnREaXJlY3RpdmVJbmRleCgpXWAgaXMgYERpcmVjdGl2ZURlZmBcbiAqIGBMVmlld1tnZXRDdXJyZW50RGlyZWN0aXZlSW5kZXgoKV1gIGlzIGRpcmVjdGl2ZSBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnREaXJlY3RpdmVJbmRleCgpOiBudW1iZXIge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuY3VycmVudERpcmVjdGl2ZUluZGV4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudFF1ZXJ5SW5kZXgoKTogbnVtYmVyIHtcbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmN1cnJlbnRRdWVyeUluZGV4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q3VycmVudFF1ZXJ5SW5kZXgodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5jdXJyZW50UXVlcnlJbmRleCA9IHZhbHVlO1xufVxuXG4vKipcbiAqIFRoaXMgaXMgYSBsaWdodCB3ZWlnaHQgdmVyc2lvbiBvZiB0aGUgYGVudGVyVmlld2Agd2hpY2ggaXMgbmVlZGVkIGJ5IHRoZSBESSBzeXN0ZW0uXG4gKiBAcGFyYW0gbmV3Vmlld1xuICogQHBhcmFtIHROb2RlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnRlckRJKG5ld1ZpZXc6IExWaWV3LCB0Tm9kZTogVE5vZGUpIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydExWaWV3T3JVbmRlZmluZWQobmV3Vmlldyk7XG4gIGNvbnN0IG5ld0xGcmFtZSA9IGFsbG9jTEZyYW1lKCk7XG4gIGluc3RydWN0aW9uU3RhdGUubEZyYW1lID0gbmV3TEZyYW1lO1xuICBuZXdMRnJhbWUucHJldmlvdXNPclBhcmVudFROb2RlID0gdE5vZGUgITtcbiAgbmV3TEZyYW1lLmxWaWV3ID0gbmV3Vmlldztcbn1cblxuLyoqXG4gKiBTd2FwIHRoZSBjdXJyZW50IGxWaWV3IHdpdGggYSBuZXcgbFZpZXcuXG4gKlxuICogRm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgd2Ugc3RvcmUgdGhlIGxWaWV3IGluIHRoZSB0b3AgbGV2ZWwgb2YgdGhlIG1vZHVsZS5cbiAqIFRoaXMgd2F5IHdlIG1pbmltaXplIHRoZSBudW1iZXIgb2YgcHJvcGVydGllcyB0byByZWFkLiBXaGVuZXZlciBhIG5ldyB2aWV3XG4gKiBpcyBlbnRlcmVkIHdlIGhhdmUgdG8gc3RvcmUgdGhlIGxWaWV3IGZvciBsYXRlciwgYW5kIHdoZW4gdGhlIHZpZXcgaXNcbiAqIGV4aXRlZCB0aGUgc3RhdGUgaGFzIHRvIGJlIHJlc3RvcmVkXG4gKlxuICogQHBhcmFtIG5ld1ZpZXcgTmV3IGxWaWV3IHRvIGJlY29tZSBhY3RpdmVcbiAqIEBwYXJhbSB0Tm9kZSBFbGVtZW50IHRvIHdoaWNoIHRoZSBWaWV3IGlzIGEgY2hpbGQgb2ZcbiAqIEByZXR1cm5zIHRoZSBwcmV2aW91c2x5IGFjdGl2ZSBsVmlldztcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVudGVyVmlldyhuZXdWaWV3OiBMVmlldywgdE5vZGU6IFROb2RlIHwgbnVsbCk6IHZvaWQge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0TFZpZXdPclVuZGVmaW5lZChuZXdWaWV3KTtcbiAgY29uc3QgbmV3TEZyYW1lID0gYWxsb2NMRnJhbWUoKTtcbiAgaWYgKG5nRGV2TW9kZSkge1xuICAgIGFzc2VydEVxdWFsKG5ld0xGcmFtZS5pc1BhcmVudCwgdHJ1ZSwgJ0V4cGVjdGVkIGNsZWFuIExGcmFtZScpO1xuICAgIGFzc2VydEVxdWFsKG5ld0xGcmFtZS5sVmlldywgbnVsbCwgJ0V4cGVjdGVkIGNsZWFuIExGcmFtZScpO1xuICAgIGFzc2VydEVxdWFsKG5ld0xGcmFtZS50VmlldywgbnVsbCwgJ0V4cGVjdGVkIGNsZWFuIExGcmFtZScpO1xuICAgIGFzc2VydEVxdWFsKG5ld0xGcmFtZS5zZWxlY3RlZEluZGV4LCAwLCAnRXhwZWN0ZWQgY2xlYW4gTEZyYW1lJyk7XG4gICAgYXNzZXJ0RXF1YWwobmV3TEZyYW1lLmVsZW1lbnREZXB0aENvdW50LCAwLCAnRXhwZWN0ZWQgY2xlYW4gTEZyYW1lJyk7XG4gICAgYXNzZXJ0RXF1YWwobmV3TEZyYW1lLmN1cnJlbnREaXJlY3RpdmVJbmRleCwgLTEsICdFeHBlY3RlZCBjbGVhbiBMRnJhbWUnKTtcbiAgICBhc3NlcnRFcXVhbChuZXdMRnJhbWUuY3VycmVudE5hbWVzcGFjZSwgbnVsbCwgJ0V4cGVjdGVkIGNsZWFuIExGcmFtZScpO1xuICAgIGFzc2VydEVxdWFsKG5ld0xGcmFtZS5jdXJyZW50U2FuaXRpemVyLCBudWxsLCAnRXhwZWN0ZWQgY2xlYW4gTEZyYW1lJyk7XG4gICAgYXNzZXJ0RXF1YWwobmV3TEZyYW1lLmJpbmRpbmdSb290SW5kZXgsIC0xLCAnRXhwZWN0ZWQgY2xlYW4gTEZyYW1lJyk7XG4gICAgYXNzZXJ0RXF1YWwobmV3TEZyYW1lLmN1cnJlbnRRdWVyeUluZGV4LCAwLCAnRXhwZWN0ZWQgY2xlYW4gTEZyYW1lJyk7XG4gIH1cbiAgY29uc3QgdFZpZXcgPSBuZXdWaWV3W1RWSUVXXTtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUgPSBuZXdMRnJhbWU7XG4gIG5ld0xGcmFtZS5wcmV2aW91c09yUGFyZW50VE5vZGUgPSB0Tm9kZSAhO1xuICBuZXdMRnJhbWUubFZpZXcgPSBuZXdWaWV3O1xuICBuZXdMRnJhbWUudFZpZXcgPSB0VmlldztcbiAgbmV3TEZyYW1lLmNvbnRleHRMVmlldyA9IG5ld1ZpZXcgITtcbiAgbmV3TEZyYW1lLmJpbmRpbmdJbmRleCA9IHRWaWV3LmJpbmRpbmdTdGFydEluZGV4O1xufVxuXG4vKipcbiAqIEFsbG9jYXRlcyBuZXh0IGZyZWUgTEZyYW1lLiBUaGlzIGZ1bmN0aW9uIHRyaWVzIHRvIHJldXNlIHRoZSBgTEZyYW1lYHMgdG8gbG93ZXIgbWVtb3J5IHByZXNzdXJlLlxuICovXG5mdW5jdGlvbiBhbGxvY0xGcmFtZSgpIHtcbiAgY29uc3QgY3VycmVudExGcmFtZSA9IGluc3RydWN0aW9uU3RhdGUubEZyYW1lO1xuICBjb25zdCBjaGlsZExGcmFtZSA9IGN1cnJlbnRMRnJhbWUgPT09IG51bGwgPyBudWxsIDogY3VycmVudExGcmFtZS5jaGlsZDtcbiAgY29uc3QgbmV3TEZyYW1lID0gY2hpbGRMRnJhbWUgPT09IG51bGwgPyBjcmVhdGVMRnJhbWUoY3VycmVudExGcmFtZSkgOiBjaGlsZExGcmFtZTtcbiAgcmV0dXJuIG5ld0xGcmFtZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTEZyYW1lKHBhcmVudDogTEZyYW1lIHwgbnVsbCk6IExGcmFtZSB7XG4gIGNvbnN0IGxGcmFtZTogTEZyYW1lID0ge1xuICAgIHByZXZpb3VzT3JQYXJlbnRUTm9kZTogbnVsbCAhLCAgLy9cbiAgICBpc1BhcmVudDogdHJ1ZSwgICAgICAgICAgICAgICAgIC8vXG4gICAgbFZpZXc6IG51bGwgISwgICAgICAgICAgICAgICAgICAvL1xuICAgIHRWaWV3OiBudWxsICEsICAgICAgICAgICAgICAgICAgLy9cbiAgICBzZWxlY3RlZEluZGV4OiAwLCAgICAgICAgICAgICAgIC8vXG4gICAgY29udGV4dExWaWV3OiBudWxsICEsICAgICAgICAgICAvL1xuICAgIGVsZW1lbnREZXB0aENvdW50OiAwLCAgICAgICAgICAgLy9cbiAgICBjdXJyZW50TmFtZXNwYWNlOiBudWxsLCAgICAgICAgIC8vXG4gICAgY3VycmVudFNhbml0aXplcjogbnVsbCwgICAgICAgICAvL1xuICAgIGN1cnJlbnREaXJlY3RpdmVJbmRleDogLTEsICAgICAgLy9cbiAgICBiaW5kaW5nUm9vdEluZGV4OiAtMSwgICAgICAgICAgIC8vXG4gICAgYmluZGluZ0luZGV4OiAtMSwgICAgICAgICAgICAgICAvL1xuICAgIGN1cnJlbnRRdWVyeUluZGV4OiAwLCAgICAgICAgICAgLy9cbiAgICBwYXJlbnQ6IHBhcmVudCAhLCAgICAgICAgICAgICAgIC8vXG4gICAgY2hpbGQ6IG51bGwsICAgICAgICAgICAgICAgICAgICAvL1xuICB9O1xuICBwYXJlbnQgIT09IG51bGwgJiYgKHBhcmVudC5jaGlsZCA9IGxGcmFtZSk7ICAvLyBsaW5rIHRoZSBuZXcgTEZyYW1lIGZvciByZXVzZS5cbiAgcmV0dXJuIGxGcmFtZTtcbn1cblxuLyoqXG4gKiBBIGxpZ2h0d2VpZ2h0IHZlcnNpb24gb2YgbGVhdmUgd2hpY2ggaXMgdXNlZCB3aXRoIERJLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gb25seSByZXNldHMgYHByZXZpb3VzT3JQYXJlbnRUTm9kZWAgYW5kIGBMVmlld2AgYXMgdGhvc2UgYXJlIHRoZSBvbmx5IHByb3BlcnRpZXNcbiAqIHVzZWQgd2l0aCBESSAoYGVudGVyREkoKWApLlxuICpcbiAqIE5PVEU6IFRoaXMgZnVuY3Rpb24gaXMgcmVleHBvcnRlZCBhcyBgbGVhdmVESWAuIEhvd2V2ZXIgYGxlYXZlRElgIGhhcyByZXR1cm4gdHlwZSBvZiBgdm9pZGAgd2hlcmVcbiAqIGFzIGBsZWF2ZVZpZXdMaWdodGAgaGFzIGBMRnJhbWVgLiBUaGlzIGlzIHNvIHRoYXQgYGxlYXZlVmlld0xpZ2h0YCBjYW4gYmUgdXNlZCBpbiBgbGVhdmVWaWV3YC5cbiAqL1xuZnVuY3Rpb24gbGVhdmVWaWV3TGlnaHQoKTogTEZyYW1lIHtcbiAgY29uc3Qgb2xkTEZyYW1lID0gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWU7XG4gIGluc3RydWN0aW9uU3RhdGUubEZyYW1lID0gb2xkTEZyYW1lLnBhcmVudDtcbiAgb2xkTEZyYW1lLnByZXZpb3VzT3JQYXJlbnRUTm9kZSA9IG51bGwgITtcbiAgb2xkTEZyYW1lLmxWaWV3ID0gbnVsbCAhO1xuICByZXR1cm4gb2xkTEZyYW1lO1xufVxuXG4vKipcbiAqIFRoaXMgaXMgYSBsaWdodHdlaWdodCB2ZXJzaW9uIG9mIHRoZSBgbGVhdmVWaWV3YCB3aGljaCBpcyBuZWVkZWQgYnkgdGhlIERJIHN5c3RlbS5cbiAqXG4gKiBOT1RFOiB0aGlzIGZ1bmN0aW9uIGlzIGFuIGFsaWFzIHNvIHRoYXQgd2UgY2FuIGNoYW5nZSB0aGUgdHlwZSBvZiB0aGUgZnVuY3Rpb24gdG8gaGF2ZSBgdm9pZGBcbiAqIHJldHVybiB0eXBlLlxuICovXG5leHBvcnQgY29uc3QgbGVhdmVESTogKCkgPT4gdm9pZCA9IGxlYXZlVmlld0xpZ2h0O1xuXG4vKipcbiAqIExlYXZlIHRoZSBjdXJyZW50IGBMVmlld2BcbiAqXG4gKiBUaGlzIHBvcHMgdGhlIGBMRnJhbWVgIHdpdGggdGhlIGFzc29jaWF0ZWQgYExWaWV3YCBmcm9tIHRoZSBzdGFjay5cbiAqXG4gKiBJTVBPUlRBTlQ6IFdlIG11c3QgemVybyBvdXQgdGhlIGBMRnJhbWVgIHZhbHVlcyBoZXJlIG90aGVyd2lzZSB0aGV5IHdpbGwgYmUgcmV0YWluZWQuIFRoaXMgaXNcbiAqIGJlY2F1c2UgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgd2UgZG9uJ3QgcmVsZWFzZSBgTEZyYW1lYCBidXQgcmF0aGVyIGtlZXAgaXQgZm9yIG5leHQgdXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVhdmVWaWV3KCkge1xuICBjb25zdCBvbGRMRnJhbWUgPSBsZWF2ZVZpZXdMaWdodCgpO1xuICBvbGRMRnJhbWUuaXNQYXJlbnQgPSB0cnVlO1xuICBvbGRMRnJhbWUudFZpZXcgPSBudWxsICE7XG4gIG9sZExGcmFtZS5zZWxlY3RlZEluZGV4ID0gMDtcbiAgb2xkTEZyYW1lLmNvbnRleHRMVmlldyA9IG51bGwgITtcbiAgb2xkTEZyYW1lLmVsZW1lbnREZXB0aENvdW50ID0gMDtcbiAgb2xkTEZyYW1lLmN1cnJlbnREaXJlY3RpdmVJbmRleCA9IC0xO1xuICBvbGRMRnJhbWUuY3VycmVudE5hbWVzcGFjZSA9IG51bGw7XG4gIG9sZExGcmFtZS5jdXJyZW50U2FuaXRpemVyID0gbnVsbDtcbiAgb2xkTEZyYW1lLmJpbmRpbmdSb290SW5kZXggPSAtMTtcbiAgb2xkTEZyYW1lLmJpbmRpbmdJbmRleCA9IC0xO1xuICBvbGRMRnJhbWUuY3VycmVudFF1ZXJ5SW5kZXggPSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV4dENvbnRleHRJbXBsPFQgPSBhbnk+KGxldmVsOiBudW1iZXIpOiBUIHtcbiAgY29uc3QgY29udGV4dExWaWV3ID0gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuY29udGV4dExWaWV3ID1cbiAgICAgIHdhbGtVcFZpZXdzKGxldmVsLCBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5jb250ZXh0TFZpZXcgISk7XG4gIHJldHVybiBjb250ZXh0TFZpZXdbQ09OVEVYVF0gYXMgVDtcbn1cblxuZnVuY3Rpb24gd2Fsa1VwVmlld3MobmVzdGluZ0xldmVsOiBudW1iZXIsIGN1cnJlbnRWaWV3OiBMVmlldyk6IExWaWV3IHtcbiAgd2hpbGUgKG5lc3RpbmdMZXZlbCA+IDApIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChcbiAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRWaWV3W0RFQ0xBUkFUSU9OX1ZJRVddLFxuICAgICAgICAgICAgICAgICAgICAgJ0RlY2xhcmF0aW9uIHZpZXcgc2hvdWxkIGJlIGRlZmluZWQgaWYgbmVzdGluZyBsZXZlbCBpcyBncmVhdGVyIHRoYW4gMC4nKTtcbiAgICBjdXJyZW50VmlldyA9IGN1cnJlbnRWaWV3W0RFQ0xBUkFUSU9OX1ZJRVddICE7XG4gICAgbmVzdGluZ0xldmVsLS07XG4gIH1cbiAgcmV0dXJuIGN1cnJlbnRWaWV3O1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBlbGVtZW50IGluZGV4LlxuICpcbiAqIFVzZWQgd2l0aCB7QGxpbmsgcHJvcGVydHl9IGluc3RydWN0aW9uIChhbmQgbW9yZSBpbiB0aGUgZnV0dXJlKSB0byBpZGVudGlmeSB0aGUgaW5kZXggaW4gdGhlXG4gKiBjdXJyZW50IGBMVmlld2AgdG8gYWN0IG9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VsZWN0ZWRJbmRleCgpIHtcbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLnNlbGVjdGVkSW5kZXg7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgbW9zdCByZWNlbnQgaW5kZXggcGFzc2VkIHRvIHtAbGluayBzZWxlY3R9XG4gKlxuICogVXNlZCB3aXRoIHtAbGluayBwcm9wZXJ0eX0gaW5zdHJ1Y3Rpb24gKGFuZCBtb3JlIGluIHRoZSBmdXR1cmUpIHRvIGlkZW50aWZ5IHRoZSBpbmRleCBpbiB0aGVcbiAqIGN1cnJlbnQgYExWaWV3YCB0byBhY3Qgb24uXG4gKlxuICogKE5vdGUgdGhhdCBpZiBhbiBcImV4aXQgZnVuY3Rpb25cIiB3YXMgc2V0IGVhcmxpZXIgKHZpYSBgc2V0RWxlbWVudEV4aXRGbigpYCkgdGhlbiB0aGF0IHdpbGwgYmVcbiAqIHJ1biBpZiBhbmQgd2hlbiB0aGUgcHJvdmlkZWQgYGluZGV4YCB2YWx1ZSBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgY3VycmVudCBzZWxlY3RlZCBpbmRleCB2YWx1ZS4pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZWxlY3RlZEluZGV4KGluZGV4OiBudW1iZXIpIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xufVxuXG5cbi8qKlxuICogU2V0cyB0aGUgbmFtZXNwYWNlIHVzZWQgdG8gY3JlYXRlIGVsZW1lbnRzIHRvIGAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnYCBpbiBnbG9iYWwgc3RhdGUuXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVuYW1lc3BhY2VTVkcoKSB7XG4gIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmN1cnJlbnROYW1lc3BhY2UgPSBTVkdfTkFNRVNQQUNFO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIG5hbWVzcGFjZSB1c2VkIHRvIGNyZWF0ZSBlbGVtZW50cyB0byBgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTgvTWF0aE1MLydgIGluIGdsb2JhbCBzdGF0ZS5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtW5hbWVzcGFjZU1hdGhNTCgpIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuY3VycmVudE5hbWVzcGFjZSA9IE1BVEhfTUxfTkFNRVNQQUNFO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIG5hbWVzcGFjZSB1c2VkIHRvIGNyZWF0ZSBlbGVtZW50cyB0byBgbnVsbGAsIHdoaWNoIGZvcmNlcyBlbGVtZW50IGNyZWF0aW9uIHRvIHVzZVxuICogYGNyZWF0ZUVsZW1lbnRgIHJhdGhlciB0aGFuIGBjcmVhdGVFbGVtZW50TlNgLlxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1bmFtZXNwYWNlSFRNTCgpIHtcbiAgbmFtZXNwYWNlSFRNTEludGVybmFsKCk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgbmFtZXNwYWNlIHVzZWQgdG8gY3JlYXRlIGVsZW1lbnRzIHRvIGBudWxsYCwgd2hpY2ggZm9yY2VzIGVsZW1lbnQgY3JlYXRpb24gdG8gdXNlXG4gKiBgY3JlYXRlRWxlbWVudGAgcmF0aGVyIHRoYW4gYGNyZWF0ZUVsZW1lbnROU2AuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuYW1lc3BhY2VIVE1MSW50ZXJuYWwoKSB7XG4gIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmN1cnJlbnROYW1lc3BhY2UgPSBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmFtZXNwYWNlKCk6IHN0cmluZ3xudWxsIHtcbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmN1cnJlbnROYW1lc3BhY2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDdXJyZW50U3R5bGVTYW5pdGl6ZXIoc2FuaXRpemVyOiBTdHlsZVNhbml0aXplRm4gfCBudWxsKSB7XG4gIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmN1cnJlbnRTYW5pdGl6ZXIgPSBzYW5pdGl6ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldEN1cnJlbnRTdHlsZVNhbml0aXplcigpIHtcbiAgc2V0Q3VycmVudFN0eWxlU2FuaXRpemVyKG51bGwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudFN0eWxlU2FuaXRpemVyKCkge1xuICAvLyBUT0RPKG1pc2tvKTogVGhpcyBzaG91bGQgdGhyb3cgd2hlbiB0aGVyZSBpcyBubyBMVmlldywgYnV0IGl0IHR1cm5zIG91dCB3ZSBjYW4gZ2V0IGhlcmUgZnJvbVxuICAvLyBgTm9kZVN0eWxlRGVidWdgIGhlbmNlIHdlIHJldHVybiBgbnVsbGAuIFRoaXMgc2hvdWxkIGJlIGZpeGVkXG4gIGNvbnN0IGxGcmFtZSA9IGluc3RydWN0aW9uU3RhdGUubEZyYW1lO1xuICByZXR1cm4gbEZyYW1lID09PSBudWxsID8gbnVsbCA6IGxGcmFtZS5jdXJyZW50U2FuaXRpemVyO1xufVxuIl19