/**
 * @fileoverview added by tsickle
 * Generated from: packages/animations/browser/src/render/shared.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AUTO_STYLE, NoopAnimationPlayer, ɵAnimationGroupPlayer, ɵPRE_STYLE as PRE_STYLE } from '@angular/animations';
/**
 * @return {?}
 */
export function isBrowser() {
    return (typeof window !== 'undefined' && typeof window.document !== 'undefined');
}
/**
 * @return {?}
 */
export function isNode() {
    // Checking only for `process` isn't enough to identify whether or not we're in a Node
    // environment, because Webpack by default will polyfill the `process`. While we can discern
    // that Webpack polyfilled it by looking at `process.browser`, it's very Webpack-specific and
    // might not be future-proof. Instead we look at the stringified version of `process` which
    // is `[object process]` in Node and `[object Object]` when polyfilled.
    return typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';
}
/**
 * @param {?} players
 * @return {?}
 */
export function optimizeGroupPlayer(players) {
    switch (players.length) {
        case 0:
            return new NoopAnimationPlayer();
        case 1:
            return players[0];
        default:
            return new ɵAnimationGroupPlayer(players);
    }
}
/**
 * @param {?} driver
 * @param {?} normalizer
 * @param {?} element
 * @param {?} keyframes
 * @param {?=} preStyles
 * @param {?=} postStyles
 * @return {?}
 */
export function normalizeKeyframes(driver, normalizer, element, keyframes, preStyles = {}, postStyles = {}) {
    /** @type {?} */
    const errors = [];
    /** @type {?} */
    const normalizedKeyframes = [];
    /** @type {?} */
    let previousOffset = -1;
    /** @type {?} */
    let previousKeyframe = null;
    keyframes.forEach((/**
     * @param {?} kf
     * @return {?}
     */
    kf => {
        /** @type {?} */
        const offset = (/** @type {?} */ (kf['offset']));
        /** @type {?} */
        const isSameOffset = offset == previousOffset;
        /** @type {?} */
        const normalizedKeyframe = (isSameOffset && previousKeyframe) || {};
        Object.keys(kf).forEach((/**
         * @param {?} prop
         * @return {?}
         */
        prop => {
            /** @type {?} */
            let normalizedProp = prop;
            /** @type {?} */
            let normalizedValue = kf[prop];
            if (prop !== 'offset') {
                normalizedProp = normalizer.normalizePropertyName(normalizedProp, errors);
                switch (normalizedValue) {
                    case PRE_STYLE:
                        normalizedValue = preStyles[prop];
                        break;
                    case AUTO_STYLE:
                        normalizedValue = postStyles[prop];
                        break;
                    default:
                        normalizedValue =
                            normalizer.normalizeStyleValue(prop, normalizedProp, normalizedValue, errors);
                        break;
                }
            }
            normalizedKeyframe[normalizedProp] = normalizedValue;
        }));
        if (!isSameOffset) {
            normalizedKeyframes.push(normalizedKeyframe);
        }
        previousKeyframe = normalizedKeyframe;
        previousOffset = offset;
    }));
    if (errors.length) {
        /** @type {?} */
        const LINE_START = '\n - ';
        throw new Error(`Unable to animate due to the following errors:${LINE_START}${errors.join(LINE_START)}`);
    }
    return normalizedKeyframes;
}
/**
 * @param {?} player
 * @param {?} eventName
 * @param {?} event
 * @param {?} callback
 * @return {?}
 */
export function listenOnPlayer(player, eventName, event, callback) {
    switch (eventName) {
        case 'start':
            player.onStart((/**
             * @return {?}
             */
            () => callback(event && copyAnimationEvent(event, 'start', player))));
            break;
        case 'done':
            player.onDone((/**
             * @return {?}
             */
            () => callback(event && copyAnimationEvent(event, 'done', player))));
            break;
        case 'destroy':
            player.onDestroy((/**
             * @return {?}
             */
            () => callback(event && copyAnimationEvent(event, 'destroy', player))));
            break;
    }
}
/**
 * @param {?} e
 * @param {?} phaseName
 * @param {?} player
 * @return {?}
 */
export function copyAnimationEvent(e, phaseName, player) {
    /** @type {?} */
    const totalTime = player.totalTime;
    /** @type {?} */
    const disabled = ((/** @type {?} */ (player))).disabled ? true : false;
    /** @type {?} */
    const event = makeAnimationEvent(e.element, e.triggerName, e.fromState, e.toState, phaseName || e.phaseName, totalTime == undefined ? e.totalTime : totalTime, disabled);
    /** @type {?} */
    const data = ((/** @type {?} */ (e)))['_data'];
    if (data != null) {
        ((/** @type {?} */ (event)))['_data'] = data;
    }
    return event;
}
/**
 * @param {?} element
 * @param {?} triggerName
 * @param {?} fromState
 * @param {?} toState
 * @param {?=} phaseName
 * @param {?=} totalTime
 * @param {?=} disabled
 * @return {?}
 */
export function makeAnimationEvent(element, triggerName, fromState, toState, phaseName = '', totalTime = 0, disabled) {
    return { element, triggerName, fromState, toState, phaseName, totalTime, disabled: !!disabled };
}
/**
 * @param {?} map
 * @param {?} key
 * @param {?} defaultValue
 * @return {?}
 */
export function getOrSetAsInMap(map, key, defaultValue) {
    /** @type {?} */
    let value;
    if (map instanceof Map) {
        value = map.get(key);
        if (!value) {
            map.set(key, value = defaultValue);
        }
    }
    else {
        value = map[key];
        if (!value) {
            value = map[key] = defaultValue;
        }
    }
    return value;
}
/**
 * @param {?} command
 * @return {?}
 */
export function parseTimelineCommand(command) {
    /** @type {?} */
    const separatorPos = command.indexOf(':');
    /** @type {?} */
    const id = command.substring(1, separatorPos);
    /** @type {?} */
    const action = command.substr(separatorPos + 1);
    return [id, action];
}
/** @type {?} */
let _contains = (/**
 * @param {?} elm1
 * @param {?} elm2
 * @return {?}
 */
(elm1, elm2) => false);
const ɵ0 = _contains;
/** @type {?} */
let _matches = (/**
 * @param {?} element
 * @param {?} selector
 * @return {?}
 */
(element, selector) => false);
const ɵ1 = _matches;
/** @type {?} */
let _query = (/**
 * @param {?} element
 * @param {?} selector
 * @param {?} multi
 * @return {?}
 */
(element, selector, multi) => {
    return [];
});
const ɵ2 = _query;
// Define utility methods for browsers and platform-server(domino) where Element
// and utility methods exist.
/** @type {?} */
const _isNode = isNode();
if (_isNode || typeof Element !== 'undefined') {
    // this is well supported in all browsers
    _contains = (/**
     * @param {?} elm1
     * @param {?} elm2
     * @return {?}
     */
    (elm1, elm2) => { return (/** @type {?} */ (elm1.contains(elm2))); });
    _matches = ((/**
     * @return {?}
     */
    () => {
        if (_isNode || Element.prototype.matches) {
            return (/**
             * @param {?} element
             * @param {?} selector
             * @return {?}
             */
            (element, selector) => element.matches(selector));
        }
        else {
            /** @type {?} */
            const proto = (/** @type {?} */ (Element.prototype));
            /** @type {?} */
            const fn = proto.matchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector ||
                proto.oMatchesSelector || proto.webkitMatchesSelector;
            if (fn) {
                return (/**
                 * @param {?} element
                 * @param {?} selector
                 * @return {?}
                 */
                (element, selector) => fn.apply(element, [selector]));
            }
            else {
                return _matches;
            }
        }
    }))();
    _query = (/**
     * @param {?} element
     * @param {?} selector
     * @param {?} multi
     * @return {?}
     */
    (element, selector, multi) => {
        /** @type {?} */
        let results = [];
        if (multi) {
            results.push(...element.querySelectorAll(selector));
        }
        else {
            /** @type {?} */
            const elm = element.querySelector(selector);
            if (elm) {
                results.push(elm);
            }
        }
        return results;
    });
}
/**
 * @param {?} prop
 * @return {?}
 */
function containsVendorPrefix(prop) {
    // Webkit is the only real popular vendor prefix nowadays
    // cc: http://shouldiprefix.com/
    return prop.substring(1, 6) == 'ebkit'; // webkit or Webkit
}
/** @type {?} */
let _CACHED_BODY = null;
/** @type {?} */
let _IS_WEBKIT = false;
/**
 * @param {?} prop
 * @return {?}
 */
export function validateStyleProperty(prop) {
    if (!_CACHED_BODY) {
        _CACHED_BODY = getBodyNode() || {};
        _IS_WEBKIT = (/** @type {?} */ (_CACHED_BODY)).style ? ('WebkitAppearance' in (/** @type {?} */ (_CACHED_BODY)).style) : false;
    }
    /** @type {?} */
    let result = true;
    if ((/** @type {?} */ (_CACHED_BODY)).style && !containsVendorPrefix(prop)) {
        result = prop in (/** @type {?} */ (_CACHED_BODY)).style;
        if (!result && _IS_WEBKIT) {
            /** @type {?} */
            const camelProp = 'Webkit' + prop.charAt(0).toUpperCase() + prop.substr(1);
            result = camelProp in (/** @type {?} */ (_CACHED_BODY)).style;
        }
    }
    return result;
}
/**
 * @return {?}
 */
export function getBodyNode() {
    if (typeof document != 'undefined') {
        return document.body;
    }
    return null;
}
/** @type {?} */
export const matchesElement = _matches;
/** @type {?} */
export const containsElement = _contains;
/** @type {?} */
export const invokeQuery = _query;
/**
 * @param {?} object
 * @return {?}
 */
export function hypenatePropsObject(object) {
    /** @type {?} */
    const newObj = {};
    Object.keys(object).forEach((/**
     * @param {?} prop
     * @return {?}
     */
    prop => {
        /** @type {?} */
        const newProp = prop.replace(/([a-z])([A-Z])/g, '$1-$2');
        newObj[newProp] = object[prop];
    }));
    return newObj;
}
export { ɵ0, ɵ1, ɵ2 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvc2hhcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQU9BLE9BQU8sRUFBQyxVQUFVLEVBQW1DLG1CQUFtQixFQUFFLHFCQUFxQixFQUFFLFVBQVUsSUFBSSxTQUFTLEVBQWEsTUFBTSxxQkFBcUIsQ0FBQzs7OztBQVVqSyxNQUFNLFVBQVUsU0FBUztJQUN2QixPQUFPLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLE9BQU8sTUFBTSxDQUFDLFFBQVEsS0FBSyxXQUFXLENBQUMsQ0FBQztBQUNuRixDQUFDOzs7O0FBRUQsTUFBTSxVQUFVLE1BQU07SUFDcEIsc0ZBQXNGO0lBQ3RGLDRGQUE0RjtJQUM1Riw2RkFBNkY7SUFDN0YsMkZBQTJGO0lBQzNGLHVFQUF1RTtJQUN2RSxPQUFPLE9BQU8sT0FBTyxLQUFLLFdBQVcsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxrQkFBa0IsQ0FBQztBQUM1RixDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxPQUEwQjtJQUM1RCxRQUFRLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDdEIsS0FBSyxDQUFDO1lBQ0osT0FBTyxJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDbkMsS0FBSyxDQUFDO1lBQ0osT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEI7WUFDRSxPQUFPLElBQUkscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDN0M7QUFDSCxDQUFDOzs7Ozs7Ozs7O0FBRUQsTUFBTSxVQUFVLGtCQUFrQixDQUM5QixNQUF1QixFQUFFLFVBQW9DLEVBQUUsT0FBWSxFQUMzRSxTQUF1QixFQUFFLFlBQXdCLEVBQUUsRUFDbkQsYUFBeUIs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QUFVLFdBQVc7SUFDekIsSUFBSSxPQUFPLFFBQVEsSUFBSSxXQUFXLEVBQUU7UUFDbEMsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDO0tBQ3RCO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDOztBQUVELE1BQU0sT0FBTyxjQUFjLEdBQUcsUUFBUTs7QUFDdEMsTUFBTSxPQUFPLGVBQWUsR0FBRyxTQUFTOztBQUN4QyxNQUFNLE9BQU8sV0FBVyxHQUFHLE1BQU07Ozs7O0FBRWpDLE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxNQUE0Qjs7VUFDeEQsTUFBTSxHQUF5QixFQUFFO0lBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTzs7OztJQUFDLElBQUksQ0FBQyxFQUFFOztjQUMzQixPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUM7UUFDeEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqQyxDQUFDLEVBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FVVE9fU1RZTEUsIEFuaW1hdGlvbkV2ZW50LCBBbmltYXRpb25QbGF5ZXIsIE5vb3BBbmltYXRpb25QbGF5ZXIsIMm1QW5pbWF0aW9uR3JvdXBQbGF5ZXIsIMm1UFJFX1NUWUxFIGFzIFBSRV9TVFlMRSwgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge0FuaW1hdGlvblN0eWxlTm9ybWFsaXplcn0gZnJvbSAnLi4vLi4vc3JjL2RzbC9zdHlsZV9ub3JtYWxpemF0aW9uL2FuaW1hdGlvbl9zdHlsZV9ub3JtYWxpemVyJztcbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuLi8uLi9zcmMvcmVuZGVyL2FuaW1hdGlvbl9kcml2ZXInO1xuXG4vLyBXZSBkb24ndCBpbmNsdWRlIGFtYmllbnQgbm9kZSB0eXBlcyBoZXJlIHNpbmNlIEBhbmd1bGFyL2FuaW1hdGlvbnMvYnJvd3NlclxuLy8gaXMgbWVhbnQgdG8gdGFyZ2V0IHRoZSBicm93c2VyIHNvIHRlY2huaWNhbGx5IGl0IHNob3VsZCBub3QgZGVwZW5kIG9uIG5vZGVcbi8vIHR5cGVzLiBgcHJvY2Vzc2AgaXMganVzdCBkZWNsYXJlZCBsb2NhbGx5IGhlcmUgYXMgYSByZXN1bHQuXG5kZWNsYXJlIGNvbnN0IHByb2Nlc3M6IGFueTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzQnJvd3NlcigpOiBib29sZWFuIHtcbiAgcmV0dXJuICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93LmRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05vZGUoKTogYm9vbGVhbiB7XG4gIC8vIENoZWNraW5nIG9ubHkgZm9yIGBwcm9jZXNzYCBpc24ndCBlbm91Z2ggdG8gaWRlbnRpZnkgd2hldGhlciBvciBub3Qgd2UncmUgaW4gYSBOb2RlXG4gIC8vIGVudmlyb25tZW50LCBiZWNhdXNlIFdlYnBhY2sgYnkgZGVmYXVsdCB3aWxsIHBvbHlmaWxsIHRoZSBgcHJvY2Vzc2AuIFdoaWxlIHdlIGNhbiBkaXNjZXJuXG4gIC8vIHRoYXQgV2VicGFjayBwb2x5ZmlsbGVkIGl0IGJ5IGxvb2tpbmcgYXQgYHByb2Nlc3MuYnJvd3NlcmAsIGl0J3MgdmVyeSBXZWJwYWNrLXNwZWNpZmljIGFuZFxuICAvLyBtaWdodCBub3QgYmUgZnV0dXJlLXByb29mLiBJbnN0ZWFkIHdlIGxvb2sgYXQgdGhlIHN0cmluZ2lmaWVkIHZlcnNpb24gb2YgYHByb2Nlc3NgIHdoaWNoXG4gIC8vIGlzIGBbb2JqZWN0IHByb2Nlc3NdYCBpbiBOb2RlIGFuZCBgW29iamVjdCBPYmplY3RdYCB3aGVuIHBvbHlmaWxsZWQuXG4gIHJldHVybiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYge30udG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSk6IEFuaW1hdGlvblBsYXllciB7XG4gIHN3aXRjaCAocGxheWVycy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoKTtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gcGxheWVyc1swXTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG5ldyDJtUFuaW1hdGlvbkdyb3VwUGxheWVyKHBsYXllcnMpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVLZXlmcmFtZXMoXG4gICAgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIG5vcm1hbGl6ZXI6IEFuaW1hdGlvblN0eWxlTm9ybWFsaXplciwgZWxlbWVudDogYW55LFxuICAgIGtleWZyYW1lczogybVTdHlsZURhdGFbXSwgcHJlU3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9LFxuICAgIHBvc3RTdHlsZXM6IMm1U3R5bGVEYXRhID0ge30pOiDJtVN0eWxlRGF0YVtdIHtcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBub3JtYWxpemVkS2V5ZnJhbWVzOiDJtVN0eWxlRGF0YVtdID0gW107XG4gIGxldCBwcmV2aW91c09mZnNldCA9IC0xO1xuICBsZXQgcHJldmlvdXNLZXlmcmFtZTogybVTdHlsZURhdGF8bnVsbCA9IG51bGw7XG4gIGtleWZyYW1lcy5mb3JFYWNoKGtmID0+IHtcbiAgICBjb25zdCBvZmZzZXQgPSBrZlsnb2Zmc2V0J10gYXMgbnVtYmVyO1xuICAgIGNvbnN0IGlzU2FtZU9mZnNldCA9IG9mZnNldCA9PSBwcmV2aW91c09mZnNldDtcbiAgICBjb25zdCBub3JtYWxpemVkS2V5ZnJhbWU6IMm1U3R5bGVEYXRhID0gKGlzU2FtZU9mZnNldCAmJiBwcmV2aW91c0tleWZyYW1lKSB8fCB7fTtcbiAgICBPYmplY3Qua2V5cyhrZikuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGxldCBub3JtYWxpemVkUHJvcCA9IHByb3A7XG4gICAgICBsZXQgbm9ybWFsaXplZFZhbHVlID0ga2ZbcHJvcF07XG4gICAgICBpZiAocHJvcCAhPT0gJ29mZnNldCcpIHtcbiAgICAgICAgbm9ybWFsaXplZFByb3AgPSBub3JtYWxpemVyLm5vcm1hbGl6ZVByb3BlcnR5TmFtZShub3JtYWxpemVkUHJvcCwgZXJyb3JzKTtcbiAgICAgICAgc3dpdGNoIChub3JtYWxpemVkVmFsdWUpIHtcbiAgICAgICAgICBjYXNlIFBSRV9TVFlMRTpcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9IHByZVN0eWxlc1twcm9wXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBBVVRPX1NUWUxFOlxuICAgICAgICAgICAgbm9ybWFsaXplZFZhbHVlID0gcG9zdFN0eWxlc1twcm9wXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9XG4gICAgICAgICAgICAgICAgbm9ybWFsaXplci5ub3JtYWxpemVTdHlsZVZhbHVlKHByb3AsIG5vcm1hbGl6ZWRQcm9wLCBub3JtYWxpemVkVmFsdWUsIGVycm9ycyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbm9ybWFsaXplZEtleWZyYW1lW25vcm1hbGl6ZWRQcm9wXSA9IG5vcm1hbGl6ZWRWYWx1ZTtcbiAgICB9KTtcbiAgICBpZiAoIWlzU2FtZU9mZnNldCkge1xuICAgICAgbm9ybWFsaXplZEtleWZyYW1lcy5wdXNoKG5vcm1hbGl6ZWRLZXlmcmFtZSk7XG4gICAgfVxuICAgIHByZXZpb3VzS2V5ZnJhbWUgPSBub3JtYWxpemVkS2V5ZnJhbWU7XG4gICAgcHJldmlvdXNPZmZzZXQgPSBvZmZzZXQ7XG4gIH0pO1xuICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgIGNvbnN0IExJTkVfU1RBUlQgPSAnXFxuIC0gJztcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gYW5pbWF0ZSBkdWUgdG8gdGhlIGZvbGxvd2luZyBlcnJvcnM6JHtMSU5FX1NUQVJUfSR7ZXJyb3JzLmpvaW4oTElORV9TVEFSVCl9YCk7XG4gIH1cblxuICByZXR1cm4gbm9ybWFsaXplZEtleWZyYW1lcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpc3Rlbk9uUGxheWVyKFxuICAgIHBsYXllcjogQW5pbWF0aW9uUGxheWVyLCBldmVudE5hbWU6IHN0cmluZywgZXZlbnQ6IEFuaW1hdGlvbkV2ZW50IHwgdW5kZWZpbmVkLFxuICAgIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55KSB7XG4gIHN3aXRjaCAoZXZlbnROYW1lKSB7XG4gICAgY2FzZSAnc3RhcnQnOlxuICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4gY2FsbGJhY2soZXZlbnQgJiYgY29weUFuaW1hdGlvbkV2ZW50KGV2ZW50LCAnc3RhcnQnLCBwbGF5ZXIpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkb25lJzpcbiAgICAgIHBsYXllci5vbkRvbmUoKCkgPT4gY2FsbGJhY2soZXZlbnQgJiYgY29weUFuaW1hdGlvbkV2ZW50KGV2ZW50LCAnZG9uZScsIHBsYXllcikpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Rlc3Ryb3knOlxuICAgICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiBjYWxsYmFjayhldmVudCAmJiBjb3B5QW5pbWF0aW9uRXZlbnQoZXZlbnQsICdkZXN0cm95JywgcGxheWVyKSkpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlBbmltYXRpb25FdmVudChcbiAgICBlOiBBbmltYXRpb25FdmVudCwgcGhhc2VOYW1lOiBzdHJpbmcsIHBsYXllcjogQW5pbWF0aW9uUGxheWVyKTogQW5pbWF0aW9uRXZlbnQge1xuICBjb25zdCB0b3RhbFRpbWUgPSBwbGF5ZXIudG90YWxUaW1lO1xuICBjb25zdCBkaXNhYmxlZCA9IChwbGF5ZXIgYXMgYW55KS5kaXNhYmxlZCA/IHRydWUgOiBmYWxzZTtcbiAgY29uc3QgZXZlbnQgPSBtYWtlQW5pbWF0aW9uRXZlbnQoXG4gICAgICBlLmVsZW1lbnQsIGUudHJpZ2dlck5hbWUsIGUuZnJvbVN0YXRlLCBlLnRvU3RhdGUsIHBoYXNlTmFtZSB8fCBlLnBoYXNlTmFtZSxcbiAgICAgIHRvdGFsVGltZSA9PSB1bmRlZmluZWQgPyBlLnRvdGFsVGltZSA6IHRvdGFsVGltZSwgZGlzYWJsZWQpO1xuICBjb25zdCBkYXRhID0gKGUgYXMgYW55KVsnX2RhdGEnXTtcbiAgaWYgKGRhdGEgIT0gbnVsbCkge1xuICAgIChldmVudCBhcyBhbnkpWydfZGF0YSddID0gZGF0YTtcbiAgfVxuICByZXR1cm4gZXZlbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQW5pbWF0aW9uRXZlbnQoXG4gICAgZWxlbWVudDogYW55LCB0cmlnZ2VyTmFtZTogc3RyaW5nLCBmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLCBwaGFzZU5hbWU6IHN0cmluZyA9ICcnLFxuICAgIHRvdGFsVGltZTogbnVtYmVyID0gMCwgZGlzYWJsZWQ/OiBib29sZWFuKTogQW5pbWF0aW9uRXZlbnQge1xuICByZXR1cm4ge2VsZW1lbnQsIHRyaWdnZXJOYW1lLCBmcm9tU3RhdGUsIHRvU3RhdGUsIHBoYXNlTmFtZSwgdG90YWxUaW1lLCBkaXNhYmxlZDogISFkaXNhYmxlZH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPclNldEFzSW5NYXAoXG4gICAgbWFwOiBNYXA8YW55LCBhbnk+fCB7W2tleTogc3RyaW5nXTogYW55fSwga2V5OiBhbnksIGRlZmF1bHRWYWx1ZTogYW55KSB7XG4gIGxldCB2YWx1ZTogYW55O1xuICBpZiAobWFwIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgdmFsdWUgPSBtYXAuZ2V0KGtleSk7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgbWFwLnNldChrZXksIHZhbHVlID0gZGVmYXVsdFZhbHVlKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFsdWUgPSBtYXBba2V5XTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IG1hcFtrZXldID0gZGVmYXVsdFZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRpbWVsaW5lQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiBbc3RyaW5nLCBzdHJpbmddIHtcbiAgY29uc3Qgc2VwYXJhdG9yUG9zID0gY29tbWFuZC5pbmRleE9mKCc6Jyk7XG4gIGNvbnN0IGlkID0gY29tbWFuZC5zdWJzdHJpbmcoMSwgc2VwYXJhdG9yUG9zKTtcbiAgY29uc3QgYWN0aW9uID0gY29tbWFuZC5zdWJzdHIoc2VwYXJhdG9yUG9zICsgMSk7XG4gIHJldHVybiBbaWQsIGFjdGlvbl07XG59XG5cbmxldCBfY29udGFpbnM6IChlbG0xOiBhbnksIGVsbTI6IGFueSkgPT4gYm9vbGVhbiA9IChlbG0xOiBhbnksIGVsbTI6IGFueSkgPT4gZmFsc2U7XG5sZXQgX21hdGNoZXM6IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpID0+IGJvb2xlYW4gPSAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKSA9PlxuICAgIGZhbHNlO1xubGV0IF9xdWVyeTogKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pID0+IGFueVtdID1cbiAgICAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbikgPT4ge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH07XG5cbi8vIERlZmluZSB1dGlsaXR5IG1ldGhvZHMgZm9yIGJyb3dzZXJzIGFuZCBwbGF0Zm9ybS1zZXJ2ZXIoZG9taW5vKSB3aGVyZSBFbGVtZW50XG4vLyBhbmQgdXRpbGl0eSBtZXRob2RzIGV4aXN0LlxuY29uc3QgX2lzTm9kZSA9IGlzTm9kZSgpO1xuaWYgKF9pc05vZGUgfHwgdHlwZW9mIEVsZW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIHRoaXMgaXMgd2VsbCBzdXBwb3J0ZWQgaW4gYWxsIGJyb3dzZXJzXG4gIF9jb250YWlucyA9IChlbG0xOiBhbnksIGVsbTI6IGFueSkgPT4geyByZXR1cm4gZWxtMS5jb250YWlucyhlbG0yKSBhcyBib29sZWFuOyB9O1xuXG4gIF9tYXRjaGVzID0gKCgpID0+IHtcbiAgICBpZiAoX2lzTm9kZSB8fCBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gICAgICByZXR1cm4gKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZykgPT4gZWxlbWVudC5tYXRjaGVzKHNlbGVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcHJvdG8gPSBFbGVtZW50LnByb3RvdHlwZSBhcyBhbnk7XG4gICAgICBjb25zdCBmbiA9IHByb3RvLm1hdGNoZXNTZWxlY3RvciB8fCBwcm90by5tb3pNYXRjaGVzU2VsZWN0b3IgfHwgcHJvdG8ubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICBwcm90by5vTWF0Y2hlc1NlbGVjdG9yIHx8IHByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvcjtcbiAgICAgIGlmIChmbikge1xuICAgICAgICByZXR1cm4gKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZykgPT4gZm4uYXBwbHkoZWxlbWVudCwgW3NlbGVjdG9yXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gX21hdGNoZXM7XG4gICAgICB9XG4gICAgfVxuICB9KSgpO1xuXG4gIF9xdWVyeSA9IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKTogYW55W10gPT4ge1xuICAgIGxldCByZXN1bHRzOiBhbnlbXSA9IFtdO1xuICAgIGlmIChtdWx0aSkge1xuICAgICAgcmVzdWx0cy5wdXNoKC4uLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBlbG0gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgaWYgKGVsbSkge1xuICAgICAgICByZXN1bHRzLnB1c2goZWxtKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5zVmVuZG9yUHJlZml4KHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAvLyBXZWJraXQgaXMgdGhlIG9ubHkgcmVhbCBwb3B1bGFyIHZlbmRvciBwcmVmaXggbm93YWRheXNcbiAgLy8gY2M6IGh0dHA6Ly9zaG91bGRpcHJlZml4LmNvbS9cbiAgcmV0dXJuIHByb3Auc3Vic3RyaW5nKDEsIDYpID09ICdlYmtpdCc7ICAvLyB3ZWJraXQgb3IgV2Via2l0XG59XG5cbmxldCBfQ0FDSEVEX0JPRFk6IHtzdHlsZTogYW55fXxudWxsID0gbnVsbDtcbmxldCBfSVNfV0VCS0lUID0gZmFsc2U7XG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoIV9DQUNIRURfQk9EWSkge1xuICAgIF9DQUNIRURfQk9EWSA9IGdldEJvZHlOb2RlKCkgfHwge307XG4gICAgX0lTX1dFQktJVCA9IF9DQUNIRURfQk9EWSAhLnN0eWxlID8gKCdXZWJraXRBcHBlYXJhbmNlJyBpbiBfQ0FDSEVEX0JPRFkgIS5zdHlsZSkgOiBmYWxzZTtcbiAgfVxuXG4gIGxldCByZXN1bHQgPSB0cnVlO1xuICBpZiAoX0NBQ0hFRF9CT0RZICEuc3R5bGUgJiYgIWNvbnRhaW5zVmVuZG9yUHJlZml4KHByb3ApKSB7XG4gICAgcmVzdWx0ID0gcHJvcCBpbiBfQ0FDSEVEX0JPRFkgIS5zdHlsZTtcbiAgICBpZiAoIXJlc3VsdCAmJiBfSVNfV0VCS0lUKSB7XG4gICAgICBjb25zdCBjYW1lbFByb3AgPSAnV2Via2l0JyArIHByb3AuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLnN1YnN0cigxKTtcbiAgICAgIHJlc3VsdCA9IGNhbWVsUHJvcCBpbiBfQ0FDSEVEX0JPRFkgIS5zdHlsZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Qm9keU5vZGUoKTogYW55fG51bGwge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ICE9ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmJvZHk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBjb25zdCBtYXRjaGVzRWxlbWVudCA9IF9tYXRjaGVzO1xuZXhwb3J0IGNvbnN0IGNvbnRhaW5zRWxlbWVudCA9IF9jb250YWlucztcbmV4cG9ydCBjb25zdCBpbnZva2VRdWVyeSA9IF9xdWVyeTtcblxuZXhwb3J0IGZ1bmN0aW9uIGh5cGVuYXRlUHJvcHNPYmplY3Qob2JqZWN0OiB7W2tleTogc3RyaW5nXTogYW55fSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgY29uc3QgbmV3T2JqOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICBPYmplY3Qua2V5cyhvYmplY3QpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgY29uc3QgbmV3UHJvcCA9IHByb3AucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJyk7XG4gICAgbmV3T2JqW25ld1Byb3BdID0gb2JqZWN0W3Byb3BdO1xuICB9KTtcbiAgcmV0dXJuIG5ld09iajtcbn1cbiJdfQ==