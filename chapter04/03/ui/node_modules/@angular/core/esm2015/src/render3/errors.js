/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/render3/errors.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { stringify } from '../util/stringify';
import { TVIEW } from './interfaces/view';
import { INTERPOLATION_DELIMITER } from './util/misc_utils';
/**
 * Called when directives inject each other (creating a circular dependency)
 * @param {?} token
 * @return {?}
 */
export function throwCyclicDependencyError(token) {
    throw new Error(`Cannot instantiate cyclic dependency! ${token}`);
}
/**
 * Called when there are multiple component selectors that match a given node
 * @param {?} tNode
 * @return {?}
 */
export function throwMultipleComponentError(tNode) {
    throw new Error(`Multiple components match node with tagname ${tNode.tagName}`);
}
/**
 * @return {?}
 */
export function throwMixedMultiProviderError() {
    throw new Error(`Cannot mix multi providers and regular providers`);
}
/**
 * @param {?=} ngModuleType
 * @param {?=} providers
 * @param {?=} provider
 * @return {?}
 */
export function throwInvalidProviderError(ngModuleType, providers, provider) {
    /** @type {?} */
    let ngModuleDetail = '';
    if (ngModuleType && providers) {
        /** @type {?} */
        const providerDetail = providers.map((/**
         * @param {?} v
         * @return {?}
         */
        v => v == provider ? '?' + provider + '?' : '...'));
        ngModuleDetail =
            ` - only instances of Provider and Type are allowed, got: [${providerDetail.join(', ')}]`;
    }
    throw new Error(`Invalid provider for the NgModule '${stringify(ngModuleType)}'` + ngModuleDetail);
}
/**
 * Throws an ExpressionChangedAfterChecked error if checkNoChanges mode is on.
 * @param {?} creationMode
 * @param {?} oldValue
 * @param {?} currValue
 * @param {?=} propName
 * @return {?}
 */
export function throwErrorIfNoChangesMode(creationMode, oldValue, currValue, propName) {
    /** @type {?} */
    const field = propName ? ` for '${propName}'` : '';
    /** @type {?} */
    let msg = `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value${field}: '${oldValue}'. Current value: '${currValue}'.`;
    if (creationMode) {
        msg +=
            ` It seems like the view has been created after its parent and its children have been dirty checked.` +
                ` Has it been created in a change detection hook?`;
    }
    // TODO: include debug context, see `viewDebugError` function in
    // `packages/core/src/view/errors.ts` for reference.
    throw new Error(msg);
}
/**
 * @param {?} lView
 * @param {?} rootIndex
 * @param {?} expressionIndex
 * @param {?} meta
 * @param {?} changedValue
 * @return {?}
 */
function constructDetailsForInterpolation(lView, rootIndex, expressionIndex, meta, changedValue) {
    const [propName, prefix, ...chunks] = meta.split(INTERPOLATION_DELIMITER);
    /** @type {?} */
    let oldValue = prefix;
    /** @type {?} */
    let newValue = prefix;
    for (let i = 0; i < chunks.length; i++) {
        /** @type {?} */
        const slotIdx = rootIndex + i;
        oldValue += `${lView[slotIdx]}${chunks[i]}`;
        newValue += `${slotIdx === expressionIndex ? changedValue : lView[slotIdx]}${chunks[i]}`;
    }
    return { propName, oldValue, newValue };
}
/**
 * Constructs an object that contains details for the ExpressionChangedAfterItHasBeenCheckedError:
 * - property name (for property bindings or interpolations)
 * - old and new values, enriched using information from metadata
 *
 * More information on the metadata storage format can be found in `storePropertyBindingMetadata`
 * function description.
 * @param {?} lView
 * @param {?} bindingIndex
 * @param {?} oldValue
 * @param {?} newValue
 * @return {?}
 */
export function getExpressionChangedErrorDetails(lView, bindingIndex, oldValue, newValue) {
    /** @type {?} */
    const tData = lView[TVIEW].data;
    /** @type {?} */
    const metadata = tData[bindingIndex];
    if (typeof metadata === 'string') {
        // metadata for property interpolation
        if (metadata.indexOf(INTERPOLATION_DELIMITER) > -1) {
            return constructDetailsForInterpolation(lView, bindingIndex, bindingIndex, metadata, newValue);
        }
        // metadata for property binding
        return { propName: metadata, oldValue, newValue };
    }
    // metadata is not available for this expression, check if this expression is a part of the
    // property interpolation by going from the current binding index left and look for a string that
    // contains INTERPOLATION_DELIMITER, the layout in tView.data for this case will look like this:
    // [..., 'id�Prefix � and � suffix', null, null, null, ...]
    if (metadata === null) {
        /** @type {?} */
        let idx = bindingIndex - 1;
        while (typeof tData[idx] !== 'string' && tData[idx + 1] === null) {
            idx--;
        }
        /** @type {?} */
        const meta = tData[idx];
        if (typeof meta === 'string') {
            /** @type {?} */
            const matches = meta.match(new RegExp(INTERPOLATION_DELIMITER, 'g'));
            // first interpolation delimiter separates property name from interpolation parts (in case of
            // property interpolations), so we subtract one from total number of found delimiters
            if (matches && (matches.length - 1) > bindingIndex - idx) {
                return constructDetailsForInterpolation(lView, idx, bindingIndex, meta, newValue);
            }
        }
    }
    return { propName: undefined, oldValue, newValue };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9lcnJvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFTQSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFHNUMsT0FBTyxFQUFRLEtBQUssRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQy9DLE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDOzs7Ozs7QUFLMUQsTUFBTSxVQUFVLDBCQUEwQixDQUFDLEtBQVU7SUFDbkQsTUFBTSxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUNwRSxDQUFDOzs7Ozs7QUFHRCxNQUFNLFVBQVUsMkJBQTJCLENBQUMsS0FBWTtJQUN0RCxNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNsRixDQUFDOzs7O0FBRUQsTUFBTSxVQUFVLDRCQUE0QjtJQUMxQyxNQUFNLElBQUksS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7QUFDdEUsQ0FBQzs7Ozs7OztBQUVELE1BQU0sVUFBVSx5QkFBeUIsQ0FDckMsWUFBZ0MsRUFBRSxTQUFpQixFQUFFLFFBQWM7O1FBQ2pFLGNBQWMsR0FBRyxFQUFFO0lBQ3ZCLElBQUksWUFBWSxJQUFJLFNBQVMsRUFBRTs7Y0FDdkIsY0FBYyxHQUFHLFNBQVMsQ0FBQyxHQUFHOzs7O1FBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsUUFBUSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFDO1FBQ3ZGLGNBQWM7WUFDViw2REFBNkQsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0tBQy9GO0lBRUQsTUFB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SSxNQUFNLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDcEUsNkZBQTZGO1lBQzdGLHFGQUFxRjtZQUNyRixJQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsWUFBWSxHQUFHLEdBQUcsRUFBRTtnQkFDeEQsT0FBTyxnQ0FBZ0MsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDbkY7U0FDRjtLQUNGO0lBQ0QsT0FBTyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxDQUFDO0FBQ25ELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7SW5qZWN0b3JUeXBlfSBmcm9tICcuLi9kaS9pbnRlcmZhY2UvZGVmcyc7XG5pbXBvcnQge3N0cmluZ2lmeX0gZnJvbSAnLi4vdXRpbC9zdHJpbmdpZnknO1xuXG5pbXBvcnQge1ROb2RlfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge0xWaWV3LCBUVklFV30gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtJTlRFUlBPTEFUSU9OX0RFTElNSVRFUn0gZnJvbSAnLi91dGlsL21pc2NfdXRpbHMnO1xuXG5cblxuLyoqIENhbGxlZCB3aGVuIGRpcmVjdGl2ZXMgaW5qZWN0IGVhY2ggb3RoZXIgKGNyZWF0aW5nIGEgY2lyY3VsYXIgZGVwZW5kZW5jeSkgKi9cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0N5Y2xpY0RlcGVuZGVuY3lFcnJvcih0b2tlbjogYW55KTogbmV2ZXIge1xuICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBpbnN0YW50aWF0ZSBjeWNsaWMgZGVwZW5kZW5jeSEgJHt0b2tlbn1gKTtcbn1cblxuLyoqIENhbGxlZCB3aGVuIHRoZXJlIGFyZSBtdWx0aXBsZSBjb21wb25lbnQgc2VsZWN0b3JzIHRoYXQgbWF0Y2ggYSBnaXZlbiBub2RlICovXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dNdWx0aXBsZUNvbXBvbmVudEVycm9yKHROb2RlOiBUTm9kZSk6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKGBNdWx0aXBsZSBjb21wb25lbnRzIG1hdGNoIG5vZGUgd2l0aCB0YWduYW1lICR7dE5vZGUudGFnTmFtZX1gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRocm93TWl4ZWRNdWx0aVByb3ZpZGVyRXJyb3IoKSB7XG4gIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IG1peCBtdWx0aSBwcm92aWRlcnMgYW5kIHJlZ3VsYXIgcHJvdmlkZXJzYCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0ludmFsaWRQcm92aWRlckVycm9yKFxuICAgIG5nTW9kdWxlVHlwZT86IEluamVjdG9yVHlwZTxhbnk+LCBwcm92aWRlcnM/OiBhbnlbXSwgcHJvdmlkZXI/OiBhbnkpIHtcbiAgbGV0IG5nTW9kdWxlRGV0YWlsID0gJyc7XG4gIGlmIChuZ01vZHVsZVR5cGUgJiYgcHJvdmlkZXJzKSB7XG4gICAgY29uc3QgcHJvdmlkZXJEZXRhaWwgPSBwcm92aWRlcnMubWFwKHYgPT4gdiA9PSBwcm92aWRlciA/ICc/JyArIHByb3ZpZGVyICsgJz8nIDogJy4uLicpO1xuICAgIG5nTW9kdWxlRGV0YWlsID1cbiAgICAgICAgYCAtIG9ubHkgaW5zdGFuY2VzIG9mIFByb3ZpZGVyIGFuZCBUeXBlIGFyZSBhbGxvd2VkLCBnb3Q6IFske3Byb3ZpZGVyRGV0YWlsLmpvaW4oJywgJyl9XWA7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgSW52YWxpZCBwcm92aWRlciBmb3IgdGhlIE5nTW9kdWxlICcke3N0cmluZ2lmeShuZ01vZHVsZVR5cGUpfSdgICsgbmdNb2R1bGVEZXRhaWwpO1xufVxuXG4vKiogVGhyb3dzIGFuIEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJDaGVja2VkIGVycm9yIGlmIGNoZWNrTm9DaGFuZ2VzIG1vZGUgaXMgb24uICovXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dFcnJvcklmTm9DaGFuZ2VzTW9kZShcbiAgICBjcmVhdGlvbk1vZGU6IGJvb2xlYW4sIG9sZFZhbHVlOiBhbnksIGN1cnJWYWx1ZTogYW55LCBwcm9wTmFtZT86IHN0cmluZyk6IG5ldmVyfHZvaWQge1xuICBjb25zdCBmaWVsZCA9IHByb3BOYW1lID8gYCBmb3IgJyR7cHJvcE5hbWV9J2AgOiAnJztcbiAgbGV0IG1zZyA9XG4gICAgICBgRXhwcmVzc2lvbkNoYW5nZWRBZnRlckl0SGFzQmVlbkNoZWNrZWRFcnJvcjogRXhwcmVzc2lvbiBoYXMgY2hhbmdlZCBhZnRlciBpdCB3YXMgY2hlY2tlZC4gUHJldmlvdXMgdmFsdWUke2ZpZWxkfTogJyR7b2xkVmFsdWV9Jy4gQ3VycmVudCB2YWx1ZTogJyR7Y3VyclZhbHVlfScuYDtcbiAgaWYgKGNyZWF0aW9uTW9kZSkge1xuICAgIG1zZyArPVxuICAgICAgICBgIEl0IHNlZW1zIGxpa2UgdGhlIHZpZXcgaGFzIGJlZW4gY3JlYXRlZCBhZnRlciBpdHMgcGFyZW50IGFuZCBpdHMgY2hpbGRyZW4gaGF2ZSBiZWVuIGRpcnR5IGNoZWNrZWQuYCArXG4gICAgICAgIGAgSGFzIGl0IGJlZW4gY3JlYXRlZCBpbiBhIGNoYW5nZSBkZXRlY3Rpb24gaG9vaz9gO1xuICB9XG4gIC8vIFRPRE86IGluY2x1ZGUgZGVidWcgY29udGV4dCwgc2VlIGB2aWV3RGVidWdFcnJvcmAgZnVuY3Rpb24gaW5cbiAgLy8gYHBhY2thZ2VzL2NvcmUvc3JjL3ZpZXcvZXJyb3JzLnRzYCBmb3IgcmVmZXJlbmNlLlxuICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0RGV0YWlsc0ZvckludGVycG9sYXRpb24oXG4gICAgbFZpZXc6IExWaWV3LCByb290SW5kZXg6IG51bWJlciwgZXhwcmVzc2lvbkluZGV4OiBudW1iZXIsIG1ldGE6IHN0cmluZywgY2hhbmdlZFZhbHVlOiBhbnkpIHtcbiAgY29uc3QgW3Byb3BOYW1lLCBwcmVmaXgsIC4uLmNodW5rc10gPSBtZXRhLnNwbGl0KElOVEVSUE9MQVRJT05fREVMSU1JVEVSKTtcbiAgbGV0IG9sZFZhbHVlID0gcHJlZml4LCBuZXdWYWx1ZSA9IHByZWZpeDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaHVua3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzbG90SWR4ID0gcm9vdEluZGV4ICsgaTtcbiAgICBvbGRWYWx1ZSArPSBgJHtsVmlld1tzbG90SWR4XX0ke2NodW5rc1tpXX1gO1xuICAgIG5ld1ZhbHVlICs9IGAke3Nsb3RJZHggPT09IGV4cHJlc3Npb25JbmRleCA/IGNoYW5nZWRWYWx1ZSA6IGxWaWV3W3Nsb3RJZHhdfSR7Y2h1bmtzW2ldfWA7XG4gIH1cbiAgcmV0dXJuIHtwcm9wTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlfTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGRldGFpbHMgZm9yIHRoZSBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEVycm9yOlxuICogLSBwcm9wZXJ0eSBuYW1lIChmb3IgcHJvcGVydHkgYmluZGluZ3Mgb3IgaW50ZXJwb2xhdGlvbnMpXG4gKiAtIG9sZCBhbmQgbmV3IHZhbHVlcywgZW5yaWNoZWQgdXNpbmcgaW5mb3JtYXRpb24gZnJvbSBtZXRhZGF0YVxuICpcbiAqIE1vcmUgaW5mb3JtYXRpb24gb24gdGhlIG1ldGFkYXRhIHN0b3JhZ2UgZm9ybWF0IGNhbiBiZSBmb3VuZCBpbiBgc3RvcmVQcm9wZXJ0eUJpbmRpbmdNZXRhZGF0YWBcbiAqIGZ1bmN0aW9uIGRlc2NyaXB0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXhwcmVzc2lvbkNoYW5nZWRFcnJvckRldGFpbHMoXG4gICAgbFZpZXc6IExWaWV3LCBiaW5kaW5nSW5kZXg6IG51bWJlciwgb2xkVmFsdWU6IGFueSxcbiAgICBuZXdWYWx1ZTogYW55KToge3Byb3BOYW1lPzogc3RyaW5nLCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55fSB7XG4gIGNvbnN0IHREYXRhID0gbFZpZXdbVFZJRVddLmRhdGE7XG4gIGNvbnN0IG1ldGFkYXRhID0gdERhdGFbYmluZGluZ0luZGV4XTtcblxuICBpZiAodHlwZW9mIG1ldGFkYXRhID09PSAnc3RyaW5nJykge1xuICAgIC8vIG1ldGFkYXRhIGZvciBwcm9wZXJ0eSBpbnRlcnBvbGF0aW9uXG4gICAgaWYgKG1ldGFkYXRhLmluZGV4T2YoSU5URVJQT0xBVElPTl9ERUxJTUlURVIpID4gLTEpIHtcbiAgICAgIHJldHVybiBjb25zdHJ1Y3REZXRhaWxzRm9ySW50ZXJwb2xhdGlvbihcbiAgICAgICAgICBsVmlldywgYmluZGluZ0luZGV4LCBiaW5kaW5nSW5kZXgsIG1ldGFkYXRhLCBuZXdWYWx1ZSk7XG4gICAgfVxuICAgIC8vIG1ldGFkYXRhIGZvciBwcm9wZXJ0eSBiaW5kaW5nXG4gICAgcmV0dXJuIHtwcm9wTmFtZTogbWV0YWRhdGEsIG9sZFZhbHVlLCBuZXdWYWx1ZX07XG4gIH1cblxuICAvLyBtZXRhZGF0YSBpcyBub3QgYXZhaWxhYmxlIGZvciB0aGlzIGV4cHJlc3Npb24sIGNoZWNrIGlmIHRoaXMgZXhwcmVzc2lvbiBpcyBhIHBhcnQgb2YgdGhlXG4gIC8vIHByb3BlcnR5IGludGVycG9sYXRpb24gYnkgZ29pbmcgZnJvbSB0aGUgY3VycmVudCBiaW5kaW5nIGluZGV4IGxlZnQgYW5kIGxvb2sgZm9yIGEgc3RyaW5nIHRoYXRcbiAgLy8gY29udGFpbnMgSU5URVJQT0xBVElPTl9ERUxJTUlURVIsIHRoZSBsYXlvdXQgaW4gdFZpZXcuZGF0YSBmb3IgdGhpcyBjYXNlIHdpbGwgbG9vayBsaWtlIHRoaXM6XG4gIC8vIFsuLi4sICdpZO+/vVByZWZpeCDvv70gYW5kIO+/vSBzdWZmaXgnLCBudWxsLCBudWxsLCBudWxsLCAuLi5dXG4gIGlmIChtZXRhZGF0YSA9PT0gbnVsbCkge1xuICAgIGxldCBpZHggPSBiaW5kaW5nSW5kZXggLSAxO1xuICAgIHdoaWxlICh0eXBlb2YgdERhdGFbaWR4XSAhPT0gJ3N0cmluZycgJiYgdERhdGFbaWR4ICsgMV0gPT09IG51bGwpIHtcbiAgICAgIGlkeC0tO1xuICAgIH1cbiAgICBjb25zdCBtZXRhID0gdERhdGFbaWR4XTtcbiAgICBpZiAodHlwZW9mIG1ldGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBtYXRjaGVzID0gbWV0YS5tYXRjaChuZXcgUmVnRXhwKElOVEVSUE9MQVRJT05fREVMSU1JVEVSLCAnZycpKTtcbiAgICAgIC8vIGZpcnN0IGludGVycG9sYXRpb24gZGVsaW1pdGVyIHNlcGFyYXRlcyBwcm9wZXJ0eSBuYW1lIGZyb20gaW50ZXJwb2xhdGlvbiBwYXJ0cyAoaW4gY2FzZSBvZlxuICAgICAgLy8gcHJvcGVydHkgaW50ZXJwb2xhdGlvbnMpLCBzbyB3ZSBzdWJ0cmFjdCBvbmUgZnJvbSB0b3RhbCBudW1iZXIgb2YgZm91bmQgZGVsaW1pdGVyc1xuICAgICAgaWYgKG1hdGNoZXMgJiYgKG1hdGNoZXMubGVuZ3RoIC0gMSkgPiBiaW5kaW5nSW5kZXggLSBpZHgpIHtcbiAgICAgICAgcmV0dXJuIGNvbnN0cnVjdERldGFpbHNGb3JJbnRlcnBvbGF0aW9uKGxWaWV3LCBpZHgsIGJpbmRpbmdJbmRleCwgbWV0YSwgbmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4ge3Byb3BOYW1lOiB1bmRlZmluZWQsIG9sZFZhbHVlLCBuZXdWYWx1ZX07XG59Il19