/**
 * @fileoverview added by tsickle
 * Generated from: packages/animations/browser/src/render/web_animations/web_animations_driver.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { allowPreviousPlayerStylesMerge, balancePreviousStylesIntoKeyframes, copyStyles } from '../../util';
import { CssKeyframesDriver } from '../css_keyframes/css_keyframes_driver';
import { containsElement, invokeQuery, isBrowser, matchesElement, validateStyleProperty } from '../shared';
import { packageNonAnimatableStyles } from '../special_cased_styles';
import { WebAnimationsPlayer } from './web_animations_player';
export class WebAnimationsDriver {
    constructor() {
        this._isNativeImpl = /\{\s*\[native\s+code\]\s*\}/.test(getElementAnimateFn().toString());
        this._cssKeyframesDriver = new CssKeyframesDriver();
    }
    /**
     * @param {?} prop
     * @return {?}
     */
    validateStyleProperty(prop) { return validateStyleProperty(prop); }
    /**
     * @param {?} element
     * @param {?} selector
     * @return {?}
     */
    matchesElement(element, selector) {
        return matchesElement(element, selector);
    }
    /**
     * @param {?} elm1
     * @param {?} elm2
     * @return {?}
     */
    containsElement(elm1, elm2) { return containsElement(elm1, elm2); }
    /**
     * @param {?} element
     * @param {?} selector
     * @param {?} multi
     * @return {?}
     */
    query(element, selector, multi) {
        return invokeQuery(element, selector, multi);
    }
    /**
     * @param {?} element
     * @param {?} prop
     * @param {?=} defaultValue
     * @return {?}
     */
    computeStyle(element, prop, defaultValue) {
        return (/** @type {?} */ (((/** @type {?} */ (window.getComputedStyle(element))))[prop]));
    }
    /**
     * @param {?} supported
     * @return {?}
     */
    overrideWebAnimationsSupport(supported) { this._isNativeImpl = supported; }
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @param {?=} scrubberAccessRequested
     * @return {?}
     */
    animate(element, keyframes, duration, delay, easing, previousPlayers = [], scrubberAccessRequested) {
        /** @type {?} */
        const useKeyframes = !scrubberAccessRequested && !this._isNativeImpl;
        if (useKeyframes) {
            return this._cssKeyframesDriver.animate(element, keyframes, duration, delay, easing, previousPlayers);
        }
        /** @type {?} */
        const fill = delay == 0 ? 'both' : 'forwards';
        /** @type {?} */
        const playerOptions = { duration, delay, fill };
        // we check for this to avoid having a null|undefined value be present
        // for the easing (which results in an error for certain browsers #9752)
        if (easing) {
            playerOptions['easing'] = easing;
        }
        /** @type {?} */
        const previousStyles = {};
        /** @type {?} */
        const previousWebAnimationPlayers = (/** @type {?} */ (previousPlayers.filter((/**
         * @param {?} player
         * @return {?}
         */
        player => player instanceof WebAnimationsPlayer))));
        if (allowPreviousPlayerStylesMerge(duration, delay)) {
            previousWebAnimationPlayers.forEach((/**
             * @param {?} player
             * @return {?}
             */
            player => {
                /** @type {?} */
                let styles = player.currentSnapshot;
                Object.keys(styles).forEach((/**
                 * @param {?} prop
                 * @return {?}
                 */
                prop => previousStyles[prop] = styles[prop]));
            }));
        }
        keyframes = keyframes.map((/**
         * @param {?} styles
         * @return {?}
         */
        styles => copyStyles(styles, false)));
        keyframes = balancePreviousStylesIntoKeyframes(element, keyframes, previousStyles);
        /** @type {?} */
        const specialStyles = packageNonAnimatableStyles(element, keyframes);
        return new WebAnimationsPlayer(element, keyframes, playerOptions, specialStyles);
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    WebAnimationsDriver.prototype._isNativeImpl;
    /**
     * @type {?}
     * @private
     */
    WebAnimationsDriver.prototype._cssKeyframesDriver;
}
/**
 * @return {?}
 */
export function supportsWebAnimations() {
    return typeof getElementAnimateFn() === 'function';
}
/**
 * @return {?}
 */
function getElementAnimateFn() {
    return (isBrowser() && ((/** @type {?} */ (Element))).prototype['animate']) || {};
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViX2FuaW1hdGlvbnNfZHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvd2ViX2FuaW1hdGlvbnMvd2ViX2FuaW1hdGlvbnNfZHJpdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBU0EsT0FBTyxFQUFDLDhCQUE4QixFQUFFLGtDQUFrQyxFQUFFLFVBQVUsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUUxRyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSx1Q0FBdUMsQ0FBQztBQUN6RSxPQUFPLEVBQUMsZUFBZSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLHFCQUFxQixFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ3pHLE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRW5FLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRTVELE1BQU0sT0FBTyxtQkFBbUI7SUFBaEM7UUFDVSxrQkFBYSxHQUFHLDZCQUE2QixDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDckYsd0JBQW1CLEdBQUcsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO0lBcUR6RCxDQUFDOzs7OztJQW5EQyxxQkFBcUIsQ0FBQyxJQUFZLElBQWEsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7OztJQUVwRixjQUFjLENBQUMsT0FBWSxFQUFFLFFBQWdCO1FBQzNDLE9BQU8sY0FBYyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMzQyxDQUFDOzs7Ozs7SUFFRCxlQUFlLENBQUMsSUFBUyxFQUFFLElBQVMsSUFBYSxPQUFPLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FB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Q3BFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvblBsYXllciwgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge2FsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZSwgYmFsYW5jZVByZXZpb3VzU3R5bGVzSW50b0tleWZyYW1lcywgY29weVN0eWxlc30gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQge0FuaW1hdGlvbkRyaXZlcn0gZnJvbSAnLi4vYW5pbWF0aW9uX2RyaXZlcic7XG5pbXBvcnQge0Nzc0tleWZyYW1lc0RyaXZlcn0gZnJvbSAnLi4vY3NzX2tleWZyYW1lcy9jc3Nfa2V5ZnJhbWVzX2RyaXZlcic7XG5pbXBvcnQge2NvbnRhaW5zRWxlbWVudCwgaW52b2tlUXVlcnksIGlzQnJvd3NlciwgbWF0Y2hlc0VsZW1lbnQsIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eX0gZnJvbSAnLi4vc2hhcmVkJztcbmltcG9ydCB7cGFja2FnZU5vbkFuaW1hdGFibGVTdHlsZXN9IGZyb20gJy4uL3NwZWNpYWxfY2FzZWRfc3R5bGVzJztcblxuaW1wb3J0IHtXZWJBbmltYXRpb25zUGxheWVyfSBmcm9tICcuL3dlYl9hbmltYXRpb25zX3BsYXllcic7XG5cbmV4cG9ydCBjbGFzcyBXZWJBbmltYXRpb25zRHJpdmVyIGltcGxlbWVudHMgQW5pbWF0aW9uRHJpdmVyIHtcbiAgcHJpdmF0ZSBfaXNOYXRpdmVJbXBsID0gL1xce1xccypcXFtuYXRpdmVcXHMrY29kZVxcXVxccypcXH0vLnRlc3QoZ2V0RWxlbWVudEFuaW1hdGVGbigpLnRvU3RyaW5nKCkpO1xuICBwcml2YXRlIF9jc3NLZXlmcmFtZXNEcml2ZXIgPSBuZXcgQ3NzS2V5ZnJhbWVzRHJpdmVyKCk7XG5cbiAgdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3A6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3ApOyB9XG5cbiAgbWF0Y2hlc0VsZW1lbnQoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG1hdGNoZXNFbGVtZW50KGVsZW1lbnQsIHNlbGVjdG9yKTtcbiAgfVxuXG4gIGNvbnRhaW5zRWxlbWVudChlbG0xOiBhbnksIGVsbTI6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gY29udGFpbnNFbGVtZW50KGVsbTEsIGVsbTIpOyB9XG5cbiAgcXVlcnkoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbik6IGFueVtdIHtcbiAgICByZXR1cm4gaW52b2tlUXVlcnkoZWxlbWVudCwgc2VsZWN0b3IsIG11bHRpKTtcbiAgfVxuXG4gIGNvbXB1dGVTdHlsZShlbGVtZW50OiBhbnksIHByb3A6IHN0cmluZywgZGVmYXVsdFZhbHVlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpIGFzIGFueSlbcHJvcF0gYXMgc3RyaW5nO1xuICB9XG5cbiAgb3ZlcnJpZGVXZWJBbmltYXRpb25zU3VwcG9ydChzdXBwb3J0ZWQ6IGJvb2xlYW4pIHsgdGhpcy5faXNOYXRpdmVJbXBsID0gc3VwcG9ydGVkOyB9XG5cbiAgYW5pbWF0ZShcbiAgICAgIGVsZW1lbnQ6IGFueSwga2V5ZnJhbWVzOiDJtVN0eWxlRGF0YVtdLCBkdXJhdGlvbjogbnVtYmVyLCBkZWxheTogbnVtYmVyLCBlYXNpbmc6IHN0cmluZyxcbiAgICAgIHByZXZpb3VzUGxheWVyczogQW5pbWF0aW9uUGxheWVyW10gPSBbXSwgc2NydWJiZXJBY2Nlc3NSZXF1ZXN0ZWQ/OiBib29sZWFuKTogQW5pbWF0aW9uUGxheWVyIHtcbiAgICBjb25zdCB1c2VLZXlmcmFtZXMgPSAhc2NydWJiZXJBY2Nlc3NSZXF1ZXN0ZWQgJiYgIXRoaXMuX2lzTmF0aXZlSW1wbDtcbiAgICBpZiAodXNlS2V5ZnJhbWVzKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY3NzS2V5ZnJhbWVzRHJpdmVyLmFuaW1hdGUoXG4gICAgICAgICAgZWxlbWVudCwga2V5ZnJhbWVzLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgcHJldmlvdXNQbGF5ZXJzKTtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxsID0gZGVsYXkgPT0gMCA/ICdib3RoJyA6ICdmb3J3YXJkcyc7XG4gICAgY29uc3QgcGxheWVyT3B0aW9uczoge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn0gPSB7ZHVyYXRpb24sIGRlbGF5LCBmaWxsfTtcbiAgICAvLyB3ZSBjaGVjayBmb3IgdGhpcyB0byBhdm9pZCBoYXZpbmcgYSBudWxsfHVuZGVmaW5lZCB2YWx1ZSBiZSBwcmVzZW50XG4gICAgLy8gZm9yIHRoZSBlYXNpbmcgKHdoaWNoIHJlc3VsdHMgaW4gYW4gZXJyb3IgZm9yIGNlcnRhaW4gYnJvd3NlcnMgIzk3NTIpXG4gICAgaWYgKGVhc2luZykge1xuICAgICAgcGxheWVyT3B0aW9uc1snZWFzaW5nJ10gPSBlYXNpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgcHJldmlvdXNTdHlsZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gICAgY29uc3QgcHJldmlvdXNXZWJBbmltYXRpb25QbGF5ZXJzID0gPFdlYkFuaW1hdGlvbnNQbGF5ZXJbXT5wcmV2aW91c1BsYXllcnMuZmlsdGVyKFxuICAgICAgICBwbGF5ZXIgPT4gcGxheWVyIGluc3RhbmNlb2YgV2ViQW5pbWF0aW9uc1BsYXllcik7XG5cbiAgICBpZiAoYWxsb3dQcmV2aW91c1BsYXllclN0eWxlc01lcmdlKGR1cmF0aW9uLCBkZWxheSkpIHtcbiAgICAgIHByZXZpb3VzV2ViQW5pbWF0aW9uUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIGxldCBzdHlsZXMgPSBwbGF5ZXIuY3VycmVudFNuYXBzaG90O1xuICAgICAgICBPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2gocHJvcCA9PiBwcmV2aW91c1N0eWxlc1twcm9wXSA9IHN0eWxlc1twcm9wXSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBrZXlmcmFtZXMgPSBrZXlmcmFtZXMubWFwKHN0eWxlcyA9PiBjb3B5U3R5bGVzKHN0eWxlcywgZmFsc2UpKTtcbiAgICBrZXlmcmFtZXMgPSBiYWxhbmNlUHJldmlvdXNTdHlsZXNJbnRvS2V5ZnJhbWVzKGVsZW1lbnQsIGtleWZyYW1lcywgcHJldmlvdXNTdHlsZXMpO1xuICAgIGNvbnN0IHNwZWNpYWxTdHlsZXMgPSBwYWNrYWdlTm9uQW5pbWF0YWJsZVN0eWxlcyhlbGVtZW50LCBrZXlmcmFtZXMpO1xuICAgIHJldHVybiBuZXcgV2ViQW5pbWF0aW9uc1BsYXllcihlbGVtZW50LCBrZXlmcmFtZXMsIHBsYXllck9wdGlvbnMsIHNwZWNpYWxTdHlsZXMpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdXBwb3J0c1dlYkFuaW1hdGlvbnMoKSB7XG4gIHJldHVybiB0eXBlb2YgZ2V0RWxlbWVudEFuaW1hdGVGbigpID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBnZXRFbGVtZW50QW5pbWF0ZUZuKCk6IGFueSB7XG4gIHJldHVybiAoaXNCcm93c2VyKCkgJiYgKDxhbnk+RWxlbWVudCkucHJvdG90eXBlWydhbmltYXRlJ10pIHx8IHt9O1xufVxuIl19