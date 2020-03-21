/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/render3/instructions/property.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { bindingUpdated } from '../bindings';
import { getLView, getSelectedIndex, getTView, nextBindingIndex } from '../state';
import { elementPropertyInternal, setInputsForProperty, storePropertyBindingMetadata } from './shared';
/**
 * Update a property on a selected element.
 *
 * Operates on the element selected by index via the {\@link select} instruction.
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `\@Inputs` don't have to be re-compiled
 *
 * \@codeGenApi
 * @template T
 * @param {?} propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param {?} value New value to write.
 * @param {?=} sanitizer An optional function used to sanitize the value.
 * @return {?} This function returns itself so that it may be chained
 * (e.g. `property('name', ctx.name)('title', ctx.title)`)
 *
 */
export function ɵɵproperty(propName, value, sanitizer) {
    /** @type {?} */
    const lView = getLView();
    /** @type {?} */
    const bindingIndex = nextBindingIndex();
    if (bindingUpdated(lView, bindingIndex, value)) {
        /** @type {?} */
        const nodeIndex = getSelectedIndex();
        /** @type {?} */
        const tView = getTView();
        elementPropertyInternal(tView, lView, nodeIndex, propName, value, sanitizer);
        ngDevMode && storePropertyBindingMetadata(tView.data, nodeIndex, propName, bindingIndex);
    }
    return ɵɵproperty;
}
/**
 * Given `<div style="..." my-dir>` and `MyDir` with `\@Input('style')` we need to write to
 * directive input.
 * @param {?} tView
 * @param {?} tNode
 * @param {?} lView
 * @param {?} value
 * @param {?} isClassBased
 * @return {?}
 */
export function setDirectiveInputsWhichShadowsStyling(tView, tNode, lView, value, isClassBased) {
    /** @type {?} */
    const inputs = (/** @type {?} */ (tNode.inputs));
    /** @type {?} */
    const property = isClassBased ? 'class' : 'style';
    // We support both 'class' and `className` hence the fallback.
    setInputsForProperty(tView, lView, inputs[property], property, value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2luc3RydWN0aW9ucy9wcm9wZXJ0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFPQSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBSTNDLE9BQU8sRUFBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ2hGLE9BQU8sRUFBQyx1QkFBdUIsRUFBRSxvQkFBb0IsRUFBRSw0QkFBNEIsRUFBQyxNQUFNLFVBQVUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxQnJHLE1BQU0sVUFBVSxVQUFVLENBQ3RCLFFBQWdCLEVBQUUsS0FBUSxFQUFFLFNBQThCOztVQUN0RCxLQUFLLEdBQUcsUUFBUSxFQUFFOztVQUNsQixZQUFZLEdBQUcsZ0JBQWdCLEVBQUU7SUFDdkMsSUFBSSxjQUFjLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBRTs7Y0FDeEMsU0FBUyxHQUFHLGdCQUFnQixFQUFFOztjQUM5QixLQUFLLEdBQUcsUUFBUSxFQUFFO1FBQ3hCLHVCQUF1QixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDN0UsU0FBUyxJQUFJLDRCQUE0QixDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUMxRjtJQUNELE9BQU8sVUFBVSxDQUFDO0FBQ3BCLENBQUM7Ozs7Ozs7Ozs7O0FBTUQsTUFBTSxVQUFVLHFDQUFxQyxDQUNqRCxLQUFZLEVBQUUsS0FBWSxFQUFFLEtBQVksRUFBRSxLQUFVLEVBQUUsWUFBcUI7O1VBQ3ZFLE1BQU0sR0FBRyxtQkFBQSxLQUFLLENBQUMsTUFBTSxFQUFFOztVQUN2QixRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU87SUFDakQsOERBQThEO0lBQzlELG9CQUFvQixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN4RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtiaW5kaW5nVXBkYXRlZH0gZnJvbSAnLi4vYmluZGluZ3MnO1xuaW1wb3J0IHtUTm9kZX0gZnJvbSAnLi4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7U2FuaXRpemVyRm59IGZyb20gJy4uL2ludGVyZmFjZXMvc2FuaXRpemF0aW9uJztcbmltcG9ydCB7TFZpZXcsIFRWaWV3fSBmcm9tICcuLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtnZXRMVmlldywgZ2V0U2VsZWN0ZWRJbmRleCwgZ2V0VFZpZXcsIG5leHRCaW5kaW5nSW5kZXh9IGZyb20gJy4uL3N0YXRlJztcbmltcG9ydCB7ZWxlbWVudFByb3BlcnR5SW50ZXJuYWwsIHNldElucHV0c0ZvclByb3BlcnR5LCBzdG9yZVByb3BlcnR5QmluZGluZ01ldGFkYXRhfSBmcm9tICcuL3NoYXJlZCc7XG5cblxuLyoqXG4gKiBVcGRhdGUgYSBwcm9wZXJ0eSBvbiBhIHNlbGVjdGVkIGVsZW1lbnQuXG4gKlxuICogT3BlcmF0ZXMgb24gdGhlIGVsZW1lbnQgc2VsZWN0ZWQgYnkgaW5kZXggdmlhIHRoZSB7QGxpbmsgc2VsZWN0fSBpbnN0cnVjdGlvbi5cbiAqXG4gKiBJZiB0aGUgcHJvcGVydHkgbmFtZSBhbHNvIGV4aXN0cyBhcyBhbiBpbnB1dCBwcm9wZXJ0eSBvbiBvbmUgb2YgdGhlIGVsZW1lbnQncyBkaXJlY3RpdmVzLFxuICogdGhlIGNvbXBvbmVudCBwcm9wZXJ0eSB3aWxsIGJlIHNldCBpbnN0ZWFkIG9mIHRoZSBlbGVtZW50IHByb3BlcnR5LiBUaGlzIGNoZWNrIG11c3RcbiAqIGJlIGNvbmR1Y3RlZCBhdCBydW50aW1lIHNvIGNoaWxkIGNvbXBvbmVudHMgdGhhdCBhZGQgbmV3IGBASW5wdXRzYCBkb24ndCBoYXZlIHRvIGJlIHJlLWNvbXBpbGVkXG4gKlxuICogQHBhcmFtIHByb3BOYW1lIE5hbWUgb2YgcHJvcGVydHkuIEJlY2F1c2UgaXQgaXMgZ29pbmcgdG8gRE9NLCB0aGlzIGlzIG5vdCBzdWJqZWN0IHRvXG4gKiAgICAgICAgcmVuYW1pbmcgYXMgcGFydCBvZiBtaW5pZmljYXRpb24uXG4gKiBAcGFyYW0gdmFsdWUgTmV3IHZhbHVlIHRvIHdyaXRlLlxuICogQHBhcmFtIHNhbml0aXplciBBbiBvcHRpb25hbCBmdW5jdGlvbiB1c2VkIHRvIHNhbml0aXplIHRoZSB2YWx1ZS5cbiAqIEByZXR1cm5zIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBpdHNlbGYgc28gdGhhdCBpdCBtYXkgYmUgY2hhaW5lZFxuICogKGUuZy4gYHByb3BlcnR5KCduYW1lJywgY3R4Lm5hbWUpKCd0aXRsZScsIGN0eC50aXRsZSlgKVxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1cHJvcGVydHk8VD4oXG4gICAgcHJvcE5hbWU6IHN0cmluZywgdmFsdWU6IFQsIHNhbml0aXplcj86IFNhbml0aXplckZuIHwgbnVsbCk6IHR5cGVvZiDJtcm1cHJvcGVydHkge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IGJpbmRpbmdJbmRleCA9IG5leHRCaW5kaW5nSW5kZXgoKTtcbiAgaWYgKGJpbmRpbmdVcGRhdGVkKGxWaWV3LCBiaW5kaW5nSW5kZXgsIHZhbHVlKSkge1xuICAgIGNvbnN0IG5vZGVJbmRleCA9IGdldFNlbGVjdGVkSW5kZXgoKTtcbiAgICBjb25zdCB0VmlldyA9IGdldFRWaWV3KCk7XG4gICAgZWxlbWVudFByb3BlcnR5SW50ZXJuYWwodFZpZXcsIGxWaWV3LCBub2RlSW5kZXgsIHByb3BOYW1lLCB2YWx1ZSwgc2FuaXRpemVyKTtcbiAgICBuZ0Rldk1vZGUgJiYgc3RvcmVQcm9wZXJ0eUJpbmRpbmdNZXRhZGF0YSh0Vmlldy5kYXRhLCBub2RlSW5kZXgsIHByb3BOYW1lLCBiaW5kaW5nSW5kZXgpO1xuICB9XG4gIHJldHVybiDJtcm1cHJvcGVydHk7XG59XG5cbi8qKlxuICogR2l2ZW4gYDxkaXYgc3R5bGU9XCIuLi5cIiBteS1kaXI+YCBhbmQgYE15RGlyYCB3aXRoIGBASW5wdXQoJ3N0eWxlJylgIHdlIG5lZWQgdG8gd3JpdGUgdG9cbiAqIGRpcmVjdGl2ZSBpbnB1dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldERpcmVjdGl2ZUlucHV0c1doaWNoU2hhZG93c1N0eWxpbmcoXG4gICAgdFZpZXc6IFRWaWV3LCB0Tm9kZTogVE5vZGUsIGxWaWV3OiBMVmlldywgdmFsdWU6IGFueSwgaXNDbGFzc0Jhc2VkOiBib29sZWFuKSB7XG4gIGNvbnN0IGlucHV0cyA9IHROb2RlLmlucHV0cyAhO1xuICBjb25zdCBwcm9wZXJ0eSA9IGlzQ2xhc3NCYXNlZCA/ICdjbGFzcycgOiAnc3R5bGUnO1xuICAvLyBXZSBzdXBwb3J0IGJvdGggJ2NsYXNzJyBhbmQgYGNsYXNzTmFtZWAgaGVuY2UgdGhlIGZhbGxiYWNrLlxuICBzZXRJbnB1dHNGb3JQcm9wZXJ0eSh0VmlldywgbFZpZXcsIGlucHV0c1twcm9wZXJ0eV0sIHByb3BlcnR5LCB2YWx1ZSk7XG59XG4iXX0=