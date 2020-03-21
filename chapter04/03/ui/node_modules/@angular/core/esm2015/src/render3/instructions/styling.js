/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/render3/instructions/styling.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import { unwrapSafeValue } from '../../sanitization/bypass';
import { stylePropNeedsSanitization, ɵɵsanitizeStyle } from '../../sanitization/sanitization';
import { keyValueArrayGet, keyValueArraySet } from '../../util/array_utils';
import { assertDefined, assertEqual, assertLessThan, assertNotEqual, throwError } from '../../util/assert';
import { EMPTY_ARRAY } from '../../util/empty';
import { concatStringsWithSpace, stringify } from '../../util/stringify';
import { assertFirstUpdatePass } from '../assert';
import { bindingUpdated } from '../bindings';
import { getTStylingRangeNext, getTStylingRangeNextDuplicate, getTStylingRangePrev, getTStylingRangePrevDuplicate } from '../interfaces/styling';
import { HEADER_OFFSET, RENDERER } from '../interfaces/view';
import { applyStyling } from '../node_manipulation';
import { getCurrentDirectiveIndex, getCurrentStyleSanitizer, getLView, getSelectedIndex, getTView, incrementBindingIndex, setCurrentStyleSanitizer } from '../state';
import { insertTStylingBinding } from '../styling/style_binding_list';
import { getLastParsedKey, getLastParsedValue, parseClassName, parseClassNameNext, parseStyle, parseStyleNext } from '../styling/styling_parser';
import { NO_CHANGE } from '../tokens';
import { getNativeByIndex } from '../util/view_utils';
import { setDirectiveInputsWhichShadowsStyling } from './property';
/**
 * Sets the current style sanitizer function which will then be used
 * within all follow-up prop and map-based style binding instructions
 * for the given element.
 *
 * Note that once styling has been applied to the element (i.e. once
 * `advance(n)` is executed or the hostBindings/template function exits)
 * then the active `sanitizerFn` will be set to `null`. This means that
 * once styling is applied to another element then a another call to
 * `styleSanitizer` will need to be made.
 *
 * \@codeGenApi
 * @param {?} sanitizer
 * @return {?}
 */
export function ɵɵstyleSanitizer(sanitizer) {
    setCurrentStyleSanitizer(sanitizer);
}
/**
 * Update a style binding on an element with the provided value.
 *
 * If the style value is falsy then it will be removed from the element
 * (or assigned a different value depending if there are any styles placed
 * on the element with `styleMap` or any static styles that are
 * present from when the element was created with `styling`).
 *
 * Note that the styling element is updated as part of `stylingApply`.
 *
 * \@codeGenApi
 * @param {?} prop A valid CSS property.
 * @param {?} value New value to write (`null` or an empty string to remove).
 * @param {?=} suffix Optional suffix. Used with scalar values to add unit such as `px`.
 *        Note that when a suffix is provided then the underlying sanitizer will
 *        be ignored.
 *
 * Note that this will apply the provided style value to the host element if this function is called
 * within a host binding function.
 *
 * @return {?}
 */
export function ɵɵstyleProp(prop, value, suffix) {
    checkStylingProperty(prop, value, suffix, false);
    return ɵɵstyleProp;
}
/**
 * Update a class binding on an element with the provided value.
 *
 * This instruction is meant to handle the `[class.foo]="exp"` case and,
 * therefore, the class binding itself must already be allocated using
 * `styling` within the creation block.
 *
 * \@codeGenApi
 * @param {?} className
 * @param {?} value A true/false value which will turn the class on or off.
 *
 * Note that this will apply the provided class value to the host element if this function
 * is called within a host binding function.
 *
 * @return {?}
 */
export function ɵɵclassProp(className, value) {
    checkStylingProperty(className, value, null, true);
    return ɵɵclassProp;
}
/**
 * Update style bindings using an object literal on an element.
 *
 * This instruction is meant to apply styling via the `[style]="exp"` template bindings.
 * When styles are applied to the element they will then be updated with respect to
 * any styles/classes set via `styleProp`. If any styles are set to falsy
 * then they will be removed from the element.
 *
 * Note that the styling instruction will not be applied until `stylingApply` is called.
 *
 * \@codeGenApi
 * @param {?} styles A key/value style map of the styles that will be applied to the given element.
 *        Any missing styles (that have already been applied to the element beforehand) will be
 *        removed (unset) from the element's styling.
 *
 * Note that this will apply the provided styleMap value to the host element if this function
 * is called within a host binding.
 *
 * @return {?}
 */
export function ɵɵstyleMap(styles) {
    checkStylingMap(styleKeyValueArraySet, styleStringParser, styles, false);
}
/**
 * Parse text as style and add values to KeyValueArray.
 *
 * This code is pulled out to a separate function so that it can be tree shaken away if it is not
 * needed. It is only referenced from `ɵɵstyleMap`.
 *
 * @param {?} keyValueArray KeyValueArray to add parsed values to.
 * @param {?} text text to parse.
 * @return {?}
 */
export function styleStringParser(keyValueArray, text) {
    for (let i = parseStyle(text); i >= 0; i = parseStyleNext(text, i)) {
        styleKeyValueArraySet(keyValueArray, getLastParsedKey(text), getLastParsedValue(text));
    }
}
/**
 * Update class bindings using an object literal or class-string on an element.
 *
 * This instruction is meant to apply styling via the `[class]="exp"` template bindings.
 * When classes are applied to the element they will then be updated with
 * respect to any styles/classes set via `classProp`. If any
 * classes are set to falsy then they will be removed from the element.
 *
 * Note that the styling instruction will not be applied until `stylingApply` is called.
 * Note that this will the provided classMap value to the host element if this function is called
 * within a host binding.
 *
 * \@codeGenApi
 * @param {?} classes A key/value map or string of CSS classes that will be added to the
 *        given element. Any missing classes (that have already been applied to the element
 *        beforehand) will be removed (unset) from the element's list of CSS classes.
 *
 * @return {?}
 */
export function ɵɵclassMap(classes) {
    checkStylingMap(keyValueArraySet, classStringParser, classes, true);
}
/**
 * Parse text as class and add values to KeyValueArray.
 *
 * This code is pulled out to a separate function so that it can be tree shaken away if it is not
 * needed. It is only referenced from `ɵɵclassMap`.
 *
 * @param {?} keyValueArray KeyValueArray to add parsed values to.
 * @param {?} text text to parse.
 * @return {?}
 */
export function classStringParser(keyValueArray, text) {
    for (let i = parseClassName(text); i >= 0; i = parseClassNameNext(text, i)) {
        keyValueArraySet(keyValueArray, getLastParsedKey(text), true);
    }
}
/**
 * Common code between `ɵɵclassProp` and `ɵɵstyleProp`.
 *
 * @param {?} prop property name.
 * @param {?} value binding value.
 * @param {?} suffixOrSanitizer suffix or sanitization function
 * @param {?} isClassBased `true` if `class` change (`false` if `style`)
 * @return {?}
 */
export function checkStylingProperty(prop, value, suffixOrSanitizer, isClassBased) {
    /** @type {?} */
    const lView = getLView();
    /** @type {?} */
    const tView = getTView();
    // Styling instructions use 2 slots per binding.
    // 1. one for the value / TStylingKey
    // 2. one for the intermittent-value / TStylingRange
    /** @type {?} */
    const bindingIndex = incrementBindingIndex(2);
    if (tView.firstUpdatePass) {
        stylingFirstUpdatePass(tView, prop, bindingIndex, isClassBased);
    }
    if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
        // This is a work around. Once PR#34480 lands the sanitizer is passed explicitly and this line
        // can be removed.
        /** @type {?} */
        let styleSanitizer;
        if (suffixOrSanitizer == null) {
            if (styleSanitizer = getCurrentStyleSanitizer()) {
                suffixOrSanitizer = (/** @type {?} */ (styleSanitizer));
            }
        }
        /** @type {?} */
        const tNode = (/** @type {?} */ (tView.data[getSelectedIndex() + HEADER_OFFSET]));
        updateStyling(tView, tNode, lView, lView[RENDERER], prop, lView[bindingIndex + 1] = normalizeAndApplySuffixOrSanitizer(value, suffixOrSanitizer), isClassBased, bindingIndex);
    }
}
/**
 * Common code between `ɵɵclassMap` and `ɵɵstyleMap`.
 *
 * @param {?} keyValueArraySet (See `keyValueArraySet` in "util/array_utils") Gets passed in as a
 * function so that
 *        `style` can pass in version which does sanitization. This is done for tree shaking
 *        purposes.
 * @param {?} stringParser Parser used to parse `value` if `string`. (Passed in as `style` and `class`
 *        have different parsers.)
 * @param {?} value bound value from application
 * @param {?} isClassBased `true` if `class` change (`false` if `style`)
 * @return {?}
 */
export function checkStylingMap(keyValueArraySet, stringParser, value, isClassBased) {
    /** @type {?} */
    const tView = getTView();
    /** @type {?} */
    const bindingIndex = incrementBindingIndex(2);
    if (tView.firstUpdatePass) {
        stylingFirstUpdatePass(tView, null, bindingIndex, isClassBased);
    }
    /** @type {?} */
    const lView = getLView();
    if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
        // `getSelectedIndex()` should be here (rather than in instruction) so that it is guarded by the
        // if so as not to read unnecessarily.
        /** @type {?} */
        const tNode = (/** @type {?} */ (tView.data[getSelectedIndex() + HEADER_OFFSET]));
        if (hasStylingInputShadow(tNode, isClassBased) && !isInHostBindings(tView, bindingIndex)) {
            if (ngDevMode) {
                // verify that if we are shadowing then `TData` is appropriately marked so that we skip
                // processing this binding in styling resolution.
                /** @type {?} */
                const tStylingKey = tView.data[bindingIndex];
                assertEqual(Array.isArray(tStylingKey) ? tStylingKey[1] : tStylingKey, false, 'Styling linked list shadow input should be marked as \'false\'');
            }
            // VE does not concatenate the static portion like we are doing here.
            // Instead VE just ignores the static completely if dynamic binding is present.
            // Because of locality we have already set the static portion because we don't know if there
            // is a dynamic portion until later. If we would ignore the static portion it would look like
            // the binding has removed it. This would confuse `[ngStyle]`/`[ngClass]` to do the wrong
            // thing as it would think that the static portion was removed. For this reason we
            // concatenate it so that `[ngStyle]`/`[ngClass]`  can continue to work on changed.
            /** @type {?} */
            let staticPrefix = isClassBased ? tNode.classes : tNode.styles;
            ngDevMode && isClassBased === false && staticPrefix !== null &&
                assertEqual(staticPrefix.endsWith(';'), true, 'Expecting static portion to end with \';\'');
            if (staticPrefix !== null) {
                // We want to make sure that falsy values of `value` become empty strings.
                value = concatStringsWithSpace(staticPrefix, value ? value : '');
            }
            // Given `<div [style] my-dir>` such that `my-dir` has `@Input('style')`.
            // This takes over the `[style]` binding. (Same for `[class]`)
            setDirectiveInputsWhichShadowsStyling(tView, tNode, lView, value, isClassBased);
        }
        else {
            updateStylingMap(tView, tNode, lView, lView[RENDERER], lView[bindingIndex + 1], lView[bindingIndex + 1] = toStylingKeyValueArray(keyValueArraySet, stringParser, value), isClassBased, bindingIndex);
        }
    }
}
/**
 * Determines when the binding is in `hostBindings` section
 *
 * @param {?} tView Current `TView`
 * @param {?} bindingIndex index of binding which we would like if it is in `hostBindings`
 * @return {?}
 */
function isInHostBindings(tView, bindingIndex) {
    // All host bindings are placed after the expando section.
    return bindingIndex >= tView.expandoStartIndex;
}
/**
 * Collects the necessary information to insert the binding into a linked list of style bindings
 * using `insertTStylingBinding`.
 *
 * @param {?} tView `TView` where the binding linked list will be stored.
 * @param {?} tStylingKey Property/key of the binding.
 * @param {?} bindingIndex Index of binding associated with the `prop`
 * @param {?} isClassBased `true` if `class` change (`false` if `style`)
 * @return {?}
 */
function stylingFirstUpdatePass(tView, tStylingKey, bindingIndex, isClassBased) {
    ngDevMode && assertFirstUpdatePass(tView);
    /** @type {?} */
    const tData = tView.data;
    if (tData[bindingIndex + 1] === null) {
        // The above check is necessary because we don't clear first update pass until first successful
        // (no exception) template execution. This prevents the styling instruction from double adding
        // itself to the list.
        // `getSelectedIndex()` should be here (rather than in instruction) so that it is guarded by the
        // if so as not to read unnecessarily.
        /** @type {?} */
        const tNode = (/** @type {?} */ (tData[getSelectedIndex() + HEADER_OFFSET]));
        /** @type {?} */
        const isHostBindings = isInHostBindings(tView, bindingIndex);
        if (hasStylingInputShadow(tNode, isClassBased) && tStylingKey === null && !isHostBindings) {
            // `tStylingKey === null` implies that we are either `[style]` or `[class]` binding.
            // If there is a directive which uses `@Input('style')` or `@Input('class')` than
            // we need to neutralize this binding since that directive is shadowing it.
            // We turn this into a noop by setting the key to `false`
            tStylingKey = false;
        }
        tStylingKey = wrapInStaticStylingKey(tData, tNode, tStylingKey, isClassBased);
        insertTStylingBinding(tData, tNode, tStylingKey, bindingIndex, isHostBindings, isClassBased);
    }
}
/**
 * Adds static styling information to the binding if applicable.
 *
 * The linked list of styles not only stores the list and keys, but also stores static styling
 * information on some of the keys. This function determines if the key should contain the styling
 * information and computes it.
 *
 * See `TStylingStatic` for more details.
 *
 * @param {?} tData `TData` where the linked list is stored.
 * @param {?} tNode `TNode` for which the styling is being computed.
 * @param {?} stylingKey `TStylingKeyPrimitive` which may need to be wrapped into `TStylingKey`
 * @param {?} isClassBased `true` if `class` (`false` if `style`)
 * @return {?}
 */
export function wrapInStaticStylingKey(tData, tNode, stylingKey, isClassBased) {
    /** @type {?} */
    const hostDirectiveDef = getHostDirectiveDef(tData);
    /** @type {?} */
    let residual = isClassBased ? tNode.residualClasses : tNode.residualStyles;
    if (hostDirectiveDef === null) {
        // We are in template node.
        // If template node already had styling instruction then it has already collected the static
        // styling and there is no need to collect them again. We know that we are the first styling
        // instruction because the `TNode.*Bindings` points to 0 (nothing has been inserted yet).
        /** @type {?} */
        const isFirstStylingInstructionInTemplate = (/** @type {?} */ ((/** @type {?} */ ((isClassBased ? tNode.classBindings : tNode.styleBindings))))) === 0;
        if (isFirstStylingInstructionInTemplate) {
            // It would be nice to be able to get the statics from `mergeAttrs`, however, at this point
            // they are already merged and it would not be possible to figure which property belongs where
            // in the priority.
            stylingKey = collectStylingFromDirectives(null, tData, tNode, stylingKey, isClassBased);
            stylingKey = collectStylingFromTAttrs(stylingKey, tNode.attrs, isClassBased);
            // We know that if we have styling binding in template we can't have residual.
            residual = null;
        }
    }
    else {
        // We are in host binding node and there was no binding instruction in template node.
        // This means that we need to compute the residual.
        /** @type {?} */
        const directiveStylingLast = tNode.directiveStylingLast;
        /** @type {?} */
        const isFirstStylingInstructionInHostBinding = directiveStylingLast === -1 || tData[directiveStylingLast] !== hostDirectiveDef;
        if (isFirstStylingInstructionInHostBinding) {
            stylingKey =
                collectStylingFromDirectives(hostDirectiveDef, tData, tNode, stylingKey, isClassBased);
            if (residual === null) {
                // - If `null` than either:
                //    - Template styling instruction already ran and it has consumed the static
                //      styling into its `TStylingKey` and so there is no need to update residual. Instead
                //      we need to update the `TStylingKey` associated with the first template node
                //      instruction. OR
                //    - Some other styling instruction ran and determined that there are no residuals
                /** @type {?} */
                let templateStylingKey = getTemplateHeadTStylingKey(tData, tNode, isClassBased);
                if (templateStylingKey !== undefined && Array.isArray(templateStylingKey)) {
                    // Only recompute if `templateStylingKey` had static values. (If no static value found
                    // then there is nothing to do since this operation can only produce less static keys, not
                    // more.)
                    templateStylingKey = collectStylingFromDirectives(null, tData, tNode, templateStylingKey[1] /* unwrap previous statics */, isClassBased);
                    templateStylingKey =
                        collectStylingFromTAttrs(templateStylingKey, tNode.attrs, isClassBased);
                    setTemplateHeadTStylingKey(tData, tNode, isClassBased, templateStylingKey);
                }
            }
            else {
                // We only need to recompute residual if it is not `null`.
                // - If existing residual (implies there was no template styling). This means that some of
                //   the statics may have moved from the residual to the `stylingKey` and so we have to
                //   recompute.
                // - If `undefined` this is the first time we are running.
                residual = collectResidual(tData, tNode, isClassBased);
            }
        }
    }
    if (residual !== undefined) {
        isClassBased ? (tNode.residualClasses = residual) : (tNode.residualStyles = residual);
    }
    return stylingKey;
}
/**
 * Retrieve the `TStylingKey` for the template styling instruction.
 *
 * This is needed since `hostBinding` styling instructions are inserted after the template
 * instruction. While the template instruction needs to update the residual in `TNode` the
 * `hostBinding` instructions need to update the `TStylingKey` of the template instruction because
 * the template instruction is downstream from the `hostBindings` instructions.
 *
 * @param {?} tData `TData` where the linked list is stored.
 * @param {?} tNode `TNode` for which the styling is being computed.
 * @param {?} isClassBased `true` if `class` (`false` if `style`)
 * @return {?} `TStylingKey` if found or `undefined` if not found.
 */
function getTemplateHeadTStylingKey(tData, tNode, isClassBased) {
    /** @type {?} */
    const bindings = isClassBased ? tNode.classBindings : tNode.styleBindings;
    if (getTStylingRangeNext(bindings) === 0) {
        // There does not seem to be a styling instruction in the `template`.
        return undefined;
    }
    return (/** @type {?} */ (tData[getTStylingRangePrev(bindings)]));
}
/**
 * Update the `TStylingKey` of the first template instruction in `TNode`.
 *
 * Logically `hostBindings` styling instructions are of lower priority than that of the template.
 * However, they execute after the template styling instructions. This means that they get inserted
 * in front of the template styling instructions.
 *
 * If we have a template styling instruction and a new `hostBindings` styling instruction is
 * executed it means that it may need to steal static fields from the template instruction. This
 * method allows us to update the first template instruction `TStylingKey` with a new value.
 *
 * Assume:
 * ```
 * <div my-dir style="color: red" [style.color]="tmplExp"></div>
 *
 * \@Directive({
 *   host: {
 *     'style': 'width: 100px',
 *     '[style.color]': 'dirExp',
 *   }
 * })
 * class MyDir {}
 * ```
 *
 * when `[style.color]="tmplExp"` executes it creates this data structure.
 * ```
 *  ['', 'color', 'color', 'red', 'width', '100px'],
 * ```
 *
 * The reason for this is that the template instruction does not know if there are styling
 * instructions and must assume that there are none and must collect all of the static styling.
 * (both
 * `color' and 'width`)
 *
 * When `'[style.color]': 'dirExp',` executes we need to insert a new data into the linked list.
 * ```
 *  ['', 'color', 'width', '100px'],  // newly inserted
 *  ['', 'color', 'color', 'red', 'width', '100px'], // this is wrong
 * ```
 *
 * Notice that the template statics is now wrong as it incorrectly contains `width` so we need to
 * update it like so:
 * ```
 *  ['', 'color', 'width', '100px'],
 *  ['', 'color', 'color', 'red'],    // UPDATE
 * ```
 *
 * @param {?} tData `TData` where the linked list is stored.
 * @param {?} tNode `TNode` for which the styling is being computed.
 * @param {?} isClassBased `true` if `class` (`false` if `style`)
 * @param {?} tStylingKey New `TStylingKey` which is replacing the old one.
 * @return {?}
 */
function setTemplateHeadTStylingKey(tData, tNode, isClassBased, tStylingKey) {
    /** @type {?} */
    const bindings = isClassBased ? tNode.classBindings : tNode.styleBindings;
    ngDevMode && assertNotEqual(getTStylingRangeNext(bindings), 0, 'Expecting to have at least one template styling binding.');
    tData[getTStylingRangePrev(bindings)] = tStylingKey;
}
/**
 * Collect all static values after the current `TNode.directiveStylingLast` index.
 *
 * Collect the remaining styling information which has not yet been collected by an existing
 * styling instruction.
 *
 * @param {?} tData `TData` where the `DirectiveDefs` are stored.
 * @param {?} tNode `TNode` which contains the directive range.
 * @param {?} isClassBased `true` if `class` (`false` if `style`)
 * @return {?}
 */
function collectResidual(tData, tNode, isClassBased) {
    /** @type {?} */
    let residual = undefined;
    /** @type {?} */
    const directiveEnd = tNode.directiveEnd;
    ngDevMode &&
        assertNotEqual(tNode.directiveStylingLast, -1, 'By the time this function gets called at least one hostBindings-node styling instruction must have executed.');
    // We add `1 + tNode.directiveStart` because we need to skip the current directive (as we are
    // collecting things after the last `hostBindings` directive which had a styling instruction.)
    for (let i = 1 + tNode.directiveStylingLast; i < directiveEnd; i++) {
        /** @type {?} */
        const attrs = ((/** @type {?} */ (tData[i]))).hostAttrs;
        residual = (/** @type {?} */ (collectStylingFromTAttrs(residual, attrs, isClassBased)));
    }
    return (/** @type {?} */ (collectStylingFromTAttrs(residual, tNode.attrs, isClassBased)));
}
/**
 * Collect the static styling information with lower priority than `hostDirectiveDef`.
 *
 * (This is opposite of residual styling.)
 *
 * @param {?} hostDirectiveDef `DirectiveDef` for which we want to collect lower priority static
 *        styling. (Or `null` if template styling)
 * @param {?} tData `TData` where the linked list is stored.
 * @param {?} tNode `TNode` for which the styling is being computed.
 * @param {?} stylingKey Existing `TStylingKey` to update or wrap.
 * @param {?} isClassBased `true` if `class` (`false` if `style`)
 * @return {?}
 */
function collectStylingFromDirectives(hostDirectiveDef, tData, tNode, stylingKey, isClassBased) {
    // We need to loop because there can be directives which have `hostAttrs` but don't have
    // `hostBindings` so this loop catches up to the current directive..
    /** @type {?} */
    let currentDirective = null;
    /** @type {?} */
    const directiveEnd = tNode.directiveEnd;
    /** @type {?} */
    let directiveStylingLast = tNode.directiveStylingLast;
    if (directiveStylingLast === -1) {
        directiveStylingLast = tNode.directiveStart;
    }
    else {
        directiveStylingLast++;
    }
    while (directiveStylingLast < directiveEnd) {
        currentDirective = (/** @type {?} */ (tData[directiveStylingLast]));
        ngDevMode && assertDefined(currentDirective, 'expected to be defined');
        stylingKey = collectStylingFromTAttrs(stylingKey, currentDirective.hostAttrs, isClassBased);
        if (currentDirective === hostDirectiveDef)
            break;
        directiveStylingLast++;
    }
    if (hostDirectiveDef !== null) {
        // we only advance the styling cursor if we are collecting data from host bindings.
        // Template executes before host bindings and so if we would update the index,
        // host bindings would not get their statics.
        tNode.directiveStylingLast = directiveStylingLast;
    }
    return stylingKey;
}
/**
 * Convert `TAttrs` into `TStylingStatic`.
 *
 * @param {?} stylingKey existing `TStylingKey` to update or wrap.
 * @param {?} attrs `TAttributes` to process.
 * @param {?} isClassBased `true` if `class` (`false` if `style`)
 * @return {?}
 */
function collectStylingFromTAttrs(stylingKey, attrs, isClassBased) {
    /** @type {?} */
    const desiredMarker = isClassBased ? 1 /* Classes */ : 2 /* Styles */;
    /** @type {?} */
    let currentMarker = -1 /* ImplicitAttributes */;
    if (attrs !== null) {
        for (let i = 0; i < attrs.length; i++) {
            /** @type {?} */
            const item = (/** @type {?} */ (attrs[i]));
            if (typeof item === 'number') {
                currentMarker = item;
            }
            else {
                if (currentMarker === desiredMarker) {
                    if (!Array.isArray(stylingKey)) {
                        stylingKey = stylingKey === undefined ? [] : (/** @type {?} */ (['', stylingKey]));
                    }
                    keyValueArraySet((/** @type {?} */ (stylingKey)), item, isClassBased ? true : attrs[++i]);
                }
            }
        }
    }
    return stylingKey === undefined ? null : stylingKey;
}
/**
 * Retrieve the current `DirectiveDef` which is active when `hostBindings` style instruction is
 * being executed (or `null` if we are in `template`.)
 *
 * @param {?} tData Current `TData` where the `DirectiveDef` will be looked up at.
 * @return {?}
 */
export function getHostDirectiveDef(tData) {
    /** @type {?} */
    const currentDirectiveIndex = getCurrentDirectiveIndex();
    return currentDirectiveIndex === -1 ? null : (/** @type {?} */ (tData[currentDirectiveIndex]));
}
/**
 * Convert user input to `KeyValueArray`.
 *
 * This function takes user input which could be `string`, Object literal, or iterable and converts
 * it into a consistent representation. The output of this is `KeyValueArray` (which is an array
 * where
 * even indexes contain keys and odd indexes contain values for those keys).
 *
 * The advantage of converting to `KeyValueArray` is that we can perform diff in an input
 * independent
 * way.
 * (ie we can compare `foo bar` to `['bar', 'baz'] and determine a set of changes which need to be
 * applied)
 *
 * The fact that `KeyValueArray` is sorted is very important because it allows us to compute the
 * difference in linear fashion without the need to allocate any additional data.
 *
 * For example if we kept this as a `Map` we would have to iterate over previous `Map` to determine
 * which values need to be deleted, over the new `Map` to determine additions, and we would have to
 * keep additional `Map` to keep track of duplicates or items which have not yet been visited.
 *
 * @param {?} keyValueArraySet (See `keyValueArraySet` in "util/array_utils") Gets passed in as a
 * function so that
 *        `style` can pass in version which does sanitization. This is done for tree shaking
 *        purposes.
 * @param {?} stringParser The parser is passed in so that it will be tree shakable. See
 *        `styleStringParser` and `classStringParser`
 * @param {?} value The value to parse/convert to `KeyValueArray`
 * @return {?}
 */
export function toStylingKeyValueArray(keyValueArraySet, stringParser, value) {
    if (value == null /*|| value === undefined */ || value === '')
        return (/** @type {?} */ (EMPTY_ARRAY));
    /** @type {?} */
    const styleKeyValueArray = (/** @type {?} */ ([]));
    /** @type {?} */
    const unwrappedValue = (/** @type {?} */ (unwrapSafeValue(value)));
    if (Array.isArray(unwrappedValue)) {
        for (let i = 0; i < unwrappedValue.length; i++) {
            keyValueArraySet(styleKeyValueArray, unwrappedValue[i], true);
        }
    }
    else if (typeof unwrappedValue === 'object') {
        for (const key in unwrappedValue) {
            if (unwrappedValue.hasOwnProperty(key)) {
                keyValueArraySet(styleKeyValueArray, key, unwrappedValue[key]);
            }
        }
    }
    else if (typeof unwrappedValue === 'string') {
        stringParser(styleKeyValueArray, unwrappedValue);
    }
    else {
        ngDevMode &&
            throwError('Unsupported styling type ' + typeof unwrappedValue + ': ' + unwrappedValue);
    }
    return styleKeyValueArray;
}
/**
 * Set a `value` for a `key` taking style sanitization into account.
 *
 * See: `keyValueArraySet` for details
 *
 * @param {?} keyValueArray KeyValueArray to add to.
 * @param {?} key Style key to add. (This key will be checked if it needs sanitization)
 * @param {?} value The value to set (If key needs sanitization it will be sanitized)
 * @return {?}
 */
export function styleKeyValueArraySet(keyValueArray, key, value) {
    if (stylePropNeedsSanitization(key)) {
        value = ɵɵsanitizeStyle(value);
    }
    keyValueArraySet(keyValueArray, key, value);
}
/**
 * Update map based styling.
 *
 * Map based styling could be anything which contains more than one binding. For example `string`,
 * or object literal. Dealing with all of these types would complicate the logic so
 * instead this function expects that the complex input is first converted into normalized
 * `KeyValueArray`. The advantage of normalization is that we get the values sorted, which makes it
 * very cheap to compute deltas between the previous and current value.
 *
 * @param {?} tView Associated `TView.data` contains the linked list of binding priorities.
 * @param {?} tNode `TNode` where the binding is located.
 * @param {?} lView `LView` contains the values associated with other styling binding at this `TNode`.
 * @param {?} renderer Renderer to use if any updates.
 * @param {?} oldKeyValueArray Previous value represented as `KeyValueArray`
 * @param {?} newKeyValueArray Current value represented as `KeyValueArray`
 * @param {?} isClassBased `true` if `class` (`false` if `style`)
 * @param {?} bindingIndex Binding index of the binding.
 * @return {?}
 */
function updateStylingMap(tView, tNode, lView, renderer, oldKeyValueArray, newKeyValueArray, isClassBased, bindingIndex) {
    if ((/** @type {?} */ (oldKeyValueArray)) === NO_CHANGE) {
        // On first execution the oldKeyValueArray is NO_CHANGE => treat it as empty KeyValueArray.
        oldKeyValueArray = (/** @type {?} */ (EMPTY_ARRAY));
    }
    /** @type {?} */
    let oldIndex = 0;
    /** @type {?} */
    let newIndex = 0;
    /** @type {?} */
    let oldKey = 0 < oldKeyValueArray.length ? oldKeyValueArray[0] : null;
    /** @type {?} */
    let newKey = 0 < newKeyValueArray.length ? newKeyValueArray[0] : null;
    while (oldKey !== null || newKey !== null) {
        ngDevMode && assertLessThan(oldIndex, 999, 'Are we stuck in infinite loop?');
        ngDevMode && assertLessThan(newIndex, 999, 'Are we stuck in infinite loop?');
        /** @type {?} */
        const oldValue = oldIndex < oldKeyValueArray.length ? oldKeyValueArray[oldIndex + 1] : undefined;
        /** @type {?} */
        const newValue = newIndex < newKeyValueArray.length ? newKeyValueArray[newIndex + 1] : undefined;
        /** @type {?} */
        let setKey = null;
        /** @type {?} */
        let setValue = undefined;
        if (oldKey === newKey) {
            // UPDATE: Keys are equal => new value is overwriting old value.
            oldIndex += 2;
            newIndex += 2;
            if (oldValue !== newValue) {
                setKey = newKey;
                setValue = newValue;
            }
        }
        else if (newKey === null || oldKey !== null && oldKey < (/** @type {?} */ (newKey))) {
            // DELETE: oldKey key is missing or we did not find the oldKey in the newValue
            // (because the keyValueArray is sorted and `newKey` is found later alphabetically).
            // `"background" < "color"` so we need to delete `"background"` because it is not found in the
            // new array.
            oldIndex += 2;
            setKey = oldKey;
        }
        else {
            // CREATE: newKey's is earlier alphabetically than oldKey's (or no oldKey) => we have new key.
            // `"color" > "background"` so we need to add `color` because it is in new array but not in
            // old array.
            ngDevMode && assertDefined(newKey, 'Expecting to have a valid key');
            newIndex += 2;
            setKey = newKey;
            setValue = newValue;
        }
        if (setKey !== null) {
            updateStyling(tView, tNode, lView, renderer, setKey, setValue, isClassBased, bindingIndex);
        }
        oldKey = oldIndex < oldKeyValueArray.length ? oldKeyValueArray[oldIndex] : null;
        newKey = newIndex < newKeyValueArray.length ? newKeyValueArray[newIndex] : null;
    }
}
/**
 * Update a simple (property name) styling.
 *
 * This function takes `prop` and updates the DOM to that value. The function takes the binding
 * value as well as binding priority into consideration to determine which value should be written
 * to DOM. (For example it may be determined that there is a higher priority overwrite which blocks
 * the DOM write, or if the value goes to `undefined` a lower priority overwrite may be consulted.)
 *
 * @param {?} tView Associated `TView.data` contains the linked list of binding priorities.
 * @param {?} tNode `TNode` where the binding is located.
 * @param {?} lView `LView` contains the values associated with other styling binding at this `TNode`.
 * @param {?} renderer Renderer to use if any updates.
 * @param {?} prop Either style property name or a class name.
 * @param {?} value Either style value for `prop` or `true`/`false` if `prop` is class.
 * @param {?} isClassBased `true` if `class` (`false` if `style`)
 * @param {?} bindingIndex Binding index of the binding.
 * @return {?}
 */
function updateStyling(tView, tNode, lView, renderer, prop, value, isClassBased, bindingIndex) {
    if (tNode.type !== 3 /* Element */) {
        // It is possible to have styling on non-elements (such as ng-container).
        // This is rare, but it does happen. In such a case, just ignore the binding.
        return;
    }
    /** @type {?} */
    const tData = tView.data;
    /** @type {?} */
    const tRange = (/** @type {?} */ (tData[bindingIndex + 1]));
    /** @type {?} */
    const higherPriorityValue = getTStylingRangeNextDuplicate(tRange) ?
        findStylingValue(tData, tNode, lView, prop, getTStylingRangeNext(tRange), isClassBased) :
        undefined;
    if (!isStylingValuePresent(higherPriorityValue)) {
        // We don't have a next duplicate, or we did not find a duplicate value.
        if (!isStylingValuePresent(value)) {
            // We should delete current value or restore to lower priority value.
            if (getTStylingRangePrevDuplicate(tRange)) {
                // We have a possible prev duplicate, let's retrieve it.
                value = findStylingValue(tData, null, lView, prop, bindingIndex, isClassBased);
            }
        }
        /** @type {?} */
        const rNode = (/** @type {?} */ (getNativeByIndex(getSelectedIndex(), lView)));
        applyStyling(renderer, isClassBased, rNode, prop, value);
    }
}
/**
 * Search for styling value with higher priority which is overwriting current value, or a
 * value of lower priority to which we should fall back if the value is `undefined`.
 *
 * When value is being applied at a location, related values need to be consulted.
 * - If there is a higher priority binding, we should be using that one instead.
 *   For example `<div  [style]="{color:exp1}" [style.color]="exp2">` change to `exp1`
 *   requires that we check `exp2` to see if it is set to value other than `undefined`.
 * - If there is a lower priority binding and we are changing to `undefined`
 *   For example `<div  [style]="{color:exp1}" [style.color]="exp2">` change to `exp2` to
 *   `undefined` requires that we check `exp1` (and static values) and use that as new value.
 *
 * NOTE: The styling stores two values.
 * 1. The raw value which came from the application is stored at `index + 0` location. (This value
 *    is used for dirty checking).
 * 2. The normalized value (converted to `KeyValueArray` if map and sanitized) is stored at `index +
 * 1`.
 *    The advantage of storing the sanitized value is that once the value is written we don't need
 *    to worry about sanitizing it later or keeping track of the sanitizer.
 *
 * @param {?} tData `TData` used for traversing the priority.
 * @param {?} tNode `TNode` to use for resolving static styling. Also controls search direction.
 *   - `TNode` search next and quit as soon as `isStylingValuePresent(value)` is true.
 *      If no value found consult `tNode.residualStyle`/`tNode.residualClass` for default value.
 *   - `null` search prev and go all the way to end. Return last value where
 *     `isStylingValuePresent(value)` is true.
 * @param {?} lView `LView` used for retrieving the actual values.
 * @param {?} prop Property which we are interested in.
 * @param {?} index Starting index in the linked list of styling bindings where the search should start.
 * @param {?} isClassBased `true` if `class` (`false` if `style`)
 * @return {?}
 */
function findStylingValue(tData, tNode, lView, prop, index, isClassBased) {
    // `TNode` to use for resolving static styling. Also controls search direction.
    //   - `TNode` search next and quit as soon as `isStylingValuePresent(value)` is true.
    //      If no value found consult `tNode.residualStyle`/`tNode.residualClass` for default value.
    //   - `null` search prev and go all the way to end. Return last value where
    //     `isStylingValuePresent(value)` is true.
    /** @type {?} */
    const isPrevDirection = tNode === null;
    /** @type {?} */
    let value = undefined;
    while (index > 0) {
        /** @type {?} */
        const rawKey = (/** @type {?} */ (tData[index]));
        /** @type {?} */
        const containsStatics = Array.isArray(rawKey);
        // Unwrap the key if we contain static values.
        /** @type {?} */
        const key = containsStatics ? ((/** @type {?} */ (rawKey)))[1] : rawKey;
        /** @type {?} */
        const isStylingMap = key === null;
        /** @type {?} */
        let valueAtLViewIndex = lView[index + 1];
        if (valueAtLViewIndex === NO_CHANGE) {
            // In firstUpdatePass the styling instructions create a linked list of styling.
            // On subsequent passes it is possible for a styling instruction to try to read a binding
            // which
            // has not yet executed. In that case we will find `NO_CHANGE` and we should assume that
            // we have `undefined` (or empty array in case of styling-map instruction) instead. This
            // allows the resolution to apply the value (which may later be overwritten when the
            // binding actually executes.)
            valueAtLViewIndex = isStylingMap ? EMPTY_ARRAY : undefined;
        }
        /** @type {?} */
        let currentValue = isStylingMap ? keyValueArrayGet(valueAtLViewIndex, prop) :
            key === prop ? valueAtLViewIndex : undefined;
        if (containsStatics && !isStylingValuePresent(currentValue)) {
            currentValue = keyValueArrayGet((/** @type {?} */ (rawKey)), prop);
        }
        if (isStylingValuePresent(currentValue)) {
            value = currentValue;
            if (isPrevDirection) {
                return value;
            }
        }
        /** @type {?} */
        const tRange = (/** @type {?} */ (tData[index + 1]));
        index = isPrevDirection ? getTStylingRangePrev(tRange) : getTStylingRangeNext(tRange);
    }
    if (tNode !== null) {
        // in case where we are going in next direction AND we did not find anything, we need to
        // consult residual styling
        /** @type {?} */
        let residual = isClassBased ? tNode.residualClasses : tNode.residualStyles;
        if (residual != null /** OR residual !=== undefined */) {
            value = keyValueArrayGet((/** @type {?} */ (residual)), prop);
        }
    }
    return value;
}
/**
 * Determines if the binding value should be used (or if the value is 'undefined' and hence priority
 * resolution should be used.)
 *
 * @param {?} value Binding style value.
 * @return {?}
 */
function isStylingValuePresent(value) {
    // Currently only `undefined` value is considered non-binding. That is `undefined` says I don't
    // have an opinion as to what this binding should be and you should consult other bindings by
    // priority to determine the valid value.
    // This is extracted into a single function so that we have a single place to control this.
    return value !== undefined;
}
/**
 * Sanitizes or adds suffix to the value.
 *
 * If value is `null`/`undefined` no suffix is added
 * @param {?} value
 * @param {?} suffixOrSanitizer
 * @return {?}
 */
function normalizeAndApplySuffixOrSanitizer(value, suffixOrSanitizer) {
    if (value == null /** || value === undefined */) {
        // do nothing
    }
    else if (typeof suffixOrSanitizer === 'function') {
        // sanitize the value.
        value = suffixOrSanitizer(value);
    }
    else if (typeof suffixOrSanitizer === 'string') {
        value = value + suffixOrSanitizer;
    }
    else if (typeof value === 'object') {
        value = stringify(unwrapSafeValue(value));
    }
    return value;
}
/**
 * Tests if the `TNode` has input shadow.
 *
 * An input shadow is when a directive steals (shadows) the input by using `\@Input('style')` or
 * `\@Input('class')` as input.
 *
 * @param {?} tNode `TNode` which we would like to see if it has shadow.
 * @param {?} isClassBased `true` if `class` (`false` if `style`)
 * @return {?}
 */
export function hasStylingInputShadow(tNode, isClassBased) {
    return (tNode.flags & (isClassBased ? 16 /* hasClassInput */ : 32 /* hasStyleInput */)) !== 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW5zdHJ1Y3Rpb25zL3N0eWxpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFZLGVBQWUsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQ3JFLE9BQU8sRUFBQywwQkFBMEIsRUFBRSxlQUFlLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUU1RixPQUFPLEVBQWdCLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDekYsT0FBTyxFQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUN6RyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDN0MsT0FBTyxFQUFDLHNCQUFzQixFQUFFLFNBQVMsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3ZFLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNoRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBSzNDLE9BQU8sRUFBNkIsb0JBQW9CLEVBQUUsNkJBQTZCLEVBQUUsb0JBQW9CLEVBQUUsNkJBQTZCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMzSyxPQUFPLEVBQUMsYUFBYSxFQUFTLFFBQVEsRUFBZSxNQUFNLG9CQUFvQixDQUFDO0FBQ2hGLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUMsd0JBQXdCLEVBQUUsd0JBQXdCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxxQkFBcUIsRUFBRSx3QkFBd0IsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNuSyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNwRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUMvSSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ3BDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxxQ0FBcUMsRUFBQyxNQUFNLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQW1CakUsTUFBTSxVQUFVLGdCQUFnQixDQUFDLFNBQWlDO0lBQ2hFLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUJELE1BQU0sVUFBVSxXQUFXLENBQ3ZCLElBQVksRUFBRSxLQUFxRCxFQUNuRSxNQUFzQjtJQUN4QixvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNqRCxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQWlCRCxNQUFNLFVBQVUsV0FBVyxDQUN2QixTQUFpQixFQUFFLEtBQWlDO0lBQ3RELG9CQUFvQixDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25ELE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCRCxNQUFNLFVBQVUsVUFBVSxDQUFDLE1BQThEO0lBQ3ZGLGVBQWUsQ0FBQyxxQkFBcUIsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDM0UsQ0FBQzs7Ozs7Ozs7Ozs7QUFZRCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsYUFBaUMsRUFBRSxJQUFZO0lBQy9FLEtBQUssSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDbEUscUJBQXFCLENBQUMsYUFBYSxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDeEY7QUFDSCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFCRCxNQUFNLFVBQVUsVUFBVSxDQUN0QixPQUFzRjtJQUN4RixlQUFlLENBQUMsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RFLENBQUM7Ozs7Ozs7Ozs7O0FBV0QsTUFBTSxVQUFVLGlCQUFpQixDQUFDLGFBQWlDLEVBQUUsSUFBWTtJQUMvRSxLQUFLLElBQUksQ0FBQyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDMUUsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQy9EO0FBQ0gsQ0FBQzs7Ozs7Ozs7OztBQVVELE1BQU0sVUFBVSxvQkFBb0IsQ0FDaEMsSUFBWSxFQUFFLEtBQXNCLEVBQ3BDLGlCQUEwRCxFQUFFLFlBQXFCOztVQUM3RSxLQUFLLEdBQUcsUUFBUSxFQUFFOztVQUNsQixLQUFLLEdBQUcsUUFBUSxFQUFFOzs7OztVQUlsQixZQUFZLEdBQUcscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0lBQzdDLElBQUksS0FBSyxDQUFDLGVBQWUsRUFBRTtRQUN6QixzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztLQUNqRTtJQUNELElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxjQUFjLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBRTs7OztZQUdqRSxjQUFvQztRQUN4QyxJQUFJLGlCQUFpQixJQUFJLElBQUksRUFBRTtZQUM3QixJQUFJLGNBQWMsR0FBRyx3QkFBd0IsRUFBRSxFQUFFO2dCQUMvQyxpQkFBaUIsR0FBRyxtQkFBQSxjQUFjLEVBQU8sQ0FBQzthQUMzQztTQUNGOztjQUNLLEtBQUssR0FBRyxtQkFBQSxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsYUFBYSxDQUFDLEVBQVM7UUFDckUsYUFBYSxDQUNULEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLEVBQzFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLEdBQUcsa0NBQWtDLENBQUMsS0FBSyxFQUFFLGlCQUFpQixDQUFDLEVBQ3RGLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztLQUNqQztBQUNILENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBY0QsTUFBTSxVQUFVLGVBQWUsQ0FDM0IsZ0JBQXNGLEVBQ3RGLFlBQTRFLEVBQzVFLEtBQW9CLEVBQUUsWUFBcUI7O1VBQ3ZDLEtBQUssR0FBRyxRQUFRLEVBQUU7O1VBQ2xCLFlBQVksR0FBRyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7SUFDN0MsSUFBSSxLQUFLLENBQUMsZUFBZSxFQUFFO1FBQ3pCLHNCQUFzQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQ2pFOztVQUNLLEtBQUssR0FBRyxRQUFRLEVBQUU7SUFDeEIsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLGNBQWMsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxFQUFFOzs7O2NBRy9ELEtBQUssR0FBRyxtQkFBQSxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsYUFBYSxDQUFDLEVBQVM7UUFDckUsSUFBSSxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLEVBQUU7WUFDeEYsSUFBSSxTQUFTLEVBQUU7Ozs7c0JBR1AsV0FBVyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUM1QyxXQUFXLENBQ1AsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUNoRSxnRUFBZ0UsQ0FBQyxDQUFDO2FBQ3ZFOzs7Ozs7Ozs7Z0JBUUcsWUFBWSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU07WUFDOUQsU0FBUyxJQUFJLFlBQVksS0FBSyxLQUFLLElBQUksWUFBWSxLQUFLLElBQUk7Z0JBQ3hELFdBQVcsQ0FDUCxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSw0Q0FBNEMsQ0FBQyxDQUFDO1lBQ3hGLElBQUksWUFBWSxLQUFLLElBQUksRUFBRTtnQkFDekIsMEVBQTBFO2dCQUMxRSxLQUFLLEdBQUcsc0JBQXNCLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNsRTtZQUNELHlFQUF5RTtZQUN6RSw4REFBOEQ7WUFDOUQscUNBQXFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO1NBQ2pGO2FBQU07WUFDTCxnQkFBZ0IsQ0FDWixLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsRUFDN0QsS0FBSyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsR0FBRyxzQkFBc0IsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLEVBQ3ZGLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztTQUNqQztLQUNGO0FBQ0gsQ0FBQzs7Ozs7Ozs7QUFRRCxTQUFTLGdCQUFnQixDQUFDLEtBQVksRUFBRSxZQUFvQjtJQUMxRCwwREFBMEQ7SUFDMUQsT0FBTyxZQUFZLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDO0FBQ2pELENBQUM7Ozs7Ozs7Ozs7O0FBV0QsU0FBUyxzQkFBc0IsQ0FDM0IsS0FBWSxFQUFFLFdBQXdCLEVBQUUsWUFBb0IsRUFBRSxZQUFxQjtJQUNyRixTQUFTLElBQUkscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7O1VBQ3BDLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSTtJQUN4QixJQUFJLEtBQUssQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFOzs7Ozs7O2NBTTlCLEtBQUssR0FBRyxtQkFBQSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxhQUFhLENBQUMsRUFBUzs7Y0FDMUQsY0FBYyxHQUFHLGdCQUFnQixDQUFDLEtBQUssRUFBRSxZQUFZLENBQUM7UUFDNUQsSUFBSSxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLElBQUksV0FBVyxLQUFLLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUN6RixvRkFBb0Y7WUFDcEYsaUZBQWlGO1lBQ2pGLDJFQUEyRTtZQUMzRSx5REFBeUQ7WUFDekQsV0FBVyxHQUFHLEtBQUssQ0FBQztTQUNyQjtRQUNELFdBQVcsR0FBRyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUM5RSxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQzlGO0FBQ0gsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQWdCRCxNQUFNLFVBQVUsc0JBQXNCLENBQ2xDLEtBQVksRUFBRSxLQUFZLEVBQUUsVUFBdUIsRUFBRSxZQUFxQjs7VUFDdEUsZ0JBQWdCLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxDQUFDOztRQUMvQyxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYztJQUMxRSxJQUFJLGdCQUFnQixLQUFLLElBQUksRUFBRTs7Ozs7O2NBS3ZCLG1DQUFtQyxHQUNyQyxtQkFBQSxtQkFBQSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFPLEVBQVUsS0FBSyxDQUFDO1FBQ3JGLElBQUksbUNBQW1DLEVBQUU7WUFDdkMsMkZBQTJGO1lBQzNGLDhGQUE4RjtZQUM5RixtQkFBbUI7WUFDbkIsVUFBVSxHQUFHLDRCQUE0QixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUN4RixVQUFVLEdBQUcsd0JBQXdCLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDN0UsOEVBQThFO1lBQzlFLFFBQVEsR0FBRyxJQUFJLENBQUM7U0FDakI7S0FDRjtTQUFNOzs7O2NBR0Msb0JBQW9CLEdBQUcsS0FBSyxDQUFDLG9CQUFvQjs7Y0FDakQsc0NBQXNDLEdBQ3hDLG9CQUFvQixLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLGdCQUFnQjtRQUNuRixJQUFJLHNDQUFzQyxFQUFFO1lBQzFDLFVBQVU7Z0JBQ04sNEJBQTRCLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDM0YsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFOzs7Ozs7OztvQkFPakIsa0JBQWtCLEdBQUcsMEJBQTBCLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxZQUFZLENBQUM7Z0JBQy9FLElBQUksa0JBQWtCLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFBRTtvQkFDekUsc0ZBQXNGO29CQUN0RiwwRkFBMEY7b0JBQzFGLFNBQVM7b0JBQ1Qsa0JBQWtCLEdBQUcsNEJBQTRCLENBQzdDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLDZCQUE2QixFQUN2RSxZQUFZLENBQUMsQ0FBQztvQkFDbEIsa0JBQWtCO3dCQUNkLHdCQUF3QixDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBQzVFLDBCQUEwQixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLGtCQUFrQixDQUFDLENBQUM7aUJBQzVFO2FBQ0Y7aUJBQU07Z0JBQ0wsMERBQTBEO2dCQUMxRCwwRkFBMEY7Z0JBQzFGLHVGQUF1RjtnQkFDdkYsZUFBZTtnQkFDZiwwREFBMEQ7Z0JBQzFELFFBQVEsR0FBRyxlQUFlLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQzthQUN4RDtTQUNGO0tBQ0Y7SUFDRCxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7UUFDMUIsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsQ0FBQztLQUN2RjtJQUNELE9BQU8sVUFBVSxDQUFDO0FBQ3BCLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBZUQsU0FBUywwQkFBMEIsQ0FBQyxLQUFZLEVBQUUsS0FBWSxFQUFFLFlBQXFCOztVQUU3RSxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYTtJQUN6RSxJQUFJLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUN4QyxxRUFBcUU7UUFDckUsT0FBTyxTQUFTLENBQUM7S0FDbEI7SUFDRCxPQUFPLG1CQUFBLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFlLENBQUM7QUFDOUQsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0RELFNBQVMsMEJBQTBCLENBQy9CLEtBQVksRUFBRSxLQUFZLEVBQUUsWUFBcUIsRUFBRSxXQUF3Qjs7VUFDdkUsUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWE7SUFDekUsU0FBUyxJQUFJLGNBQWMsQ0FDVixvQkFBb0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQ2pDLDBEQUEwRCxDQUFDLENBQUM7SUFDN0UsS0FBSyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDO0FBQ3RELENBQUM7Ozs7Ozs7Ozs7OztBQVlELFNBQVMsZUFBZSxDQUFDLEtBQVksRUFBRSxLQUFZLEVBQUUsWUFBcUI7O1FBRXBFLFFBQVEsR0FBc0MsU0FBUzs7VUFDckQsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZO0lBQ3ZDLFNBQVM7UUFDTCxjQUFjLENBQ1YsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxFQUM5Qiw4R0FBOEcsQ0FBQyxDQUFDO0lBQ3hILDZGQUE2RjtJQUM3Riw4RkFBOEY7SUFDOUYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUMsR0FBRyxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUU7O2NBQzVELEtBQUssR0FBRyxDQUFDLG1CQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBcUIsQ0FBQyxDQUFDLFNBQVM7UUFDdkQsUUFBUSxHQUFHLG1CQUFBLHdCQUF3QixDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDLEVBQTRCLENBQUM7S0FDaEc7SUFDRCxPQUFPLG1CQUFBLHdCQUF3QixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxFQUE0QixDQUFDO0FBQ25HLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBY0QsU0FBUyw0QkFBNEIsQ0FDakMsZ0JBQXlDLEVBQUUsS0FBWSxFQUFFLEtBQVksRUFBRSxVQUF1QixFQUM5RixZQUFxQjs7OztRQUduQixnQkFBZ0IsR0FBMkIsSUFBSTs7VUFDN0MsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZOztRQUNuQyxvQkFBb0IsR0FBRyxLQUFLLENBQUMsb0JBQW9CO0lBQ3JELElBQUksb0JBQW9CLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDL0Isb0JBQW9CLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQztLQUM3QztTQUFNO1FBQ0wsb0JBQW9CLEVBQUUsQ0FBQztLQUN4QjtJQUNELE9BQU8sb0JBQW9CLEdBQUcsWUFBWSxFQUFFO1FBQzFDLGdCQUFnQixHQUFHLG1CQUFBLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxFQUFxQixDQUFDO1FBQ3BFLFNBQVMsSUFBSSxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztRQUN2RSxVQUFVLEdBQUcsd0JBQXdCLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUM1RixJQUFJLGdCQUFnQixLQUFLLGdCQUFnQjtZQUFFLE1BQU07UUFDakQsb0JBQW9CLEVBQUUsQ0FBQztLQUN4QjtJQUNELElBQUksZ0JBQWdCLEtBQUssSUFBSSxFQUFFO1FBQzdCLG1GQUFtRjtRQUNuRiw4RUFBOEU7UUFDOUUsNkNBQTZDO1FBQzdDLEtBQUssQ0FBQyxvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQztLQUNuRDtJQUNELE9BQU8sVUFBVSxDQUFDO0FBQ3BCLENBQUM7Ozs7Ozs7OztBQVNELFNBQVMsd0JBQXdCLENBQzdCLFVBQW1DLEVBQUUsS0FBeUIsRUFDOUQsWUFBcUI7O1VBQ2pCLGFBQWEsR0FBRyxZQUFZLENBQUMsQ0FBQyxpQkFBeUIsQ0FBQyxlQUF1Qjs7UUFDakYsYUFBYSw4QkFBcUM7SUFDdEQsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO1FBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztrQkFDL0IsSUFBSSxHQUFHLG1CQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBbUI7WUFDeEMsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQzVCLGFBQWEsR0FBRyxJQUFJLENBQUM7YUFDdEI7aUJBQU07Z0JBQ0wsSUFBSSxhQUFhLEtBQUssYUFBYSxFQUFFO29CQUNuQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDOUIsVUFBVSxHQUFHLFVBQVUsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsbUJBQUEsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLEVBQU8sQ0FBQztxQkFDdEU7b0JBQ0QsZ0JBQWdCLENBQ1osbUJBQUEsVUFBVSxFQUFzQixFQUFFLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDL0U7YUFDRjtTQUNGO0tBQ0Y7SUFDRCxPQUFPLFVBQVUsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO0FBQ3RELENBQUM7Ozs7Ozs7O0FBUUQsTUFBTSxVQUFVLG1CQUFtQixDQUFDLEtBQVk7O1VBQ3hDLHFCQUFxQixHQUFHLHdCQUF3QixFQUFFO0lBQ3hELE9BQU8scUJBQXFCLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsbUJBQUEsS0FBSyxDQUFDLHFCQUFxQixDQUFDLEVBQXFCLENBQUM7QUFDakcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQStCRCxNQUFNLFVBQVUsc0JBQXNCLENBQ2xDLGdCQUFzRixFQUN0RixZQUE0RSxFQUM1RSxLQUFvRTtJQUN0RSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsMkJBQTJCLElBQUksS0FBSyxLQUFLLEVBQUU7UUFBRSxPQUFPLG1CQUFBLFdBQVcsRUFBTyxDQUFDOztVQUNuRixrQkFBa0IsR0FBdUIsbUJBQUEsRUFBRSxFQUFPOztVQUNsRCxjQUFjLEdBQUcsbUJBQUEsZUFBZSxDQUFDLEtBQUssQ0FBQyxFQUE0QztJQUN6RixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUU7UUFDakMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDOUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQy9EO0tBQ0Y7U0FBTSxJQUFJLE9BQU8sY0FBYyxLQUFLLFFBQVEsRUFBRTtRQUM3QyxLQUFLLE1BQU0sR0FBRyxJQUFJLGNBQWMsRUFBRTtZQUNoQyxJQUFJLGNBQWMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3RDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRSxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUNoRTtTQUNGO0tBQ0Y7U0FBTSxJQUFJLE9BQU8sY0FBYyxLQUFLLFFBQVEsRUFBRTtRQUM3QyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsY0FBYyxDQUFDLENBQUM7S0FDbEQ7U0FBTTtRQUNMLFNBQVM7WUFDTCxVQUFVLENBQUMsMkJBQTJCLEdBQUcsT0FBTyxjQUFjLEdBQUcsSUFBSSxHQUFHLGNBQWMsQ0FBQyxDQUFDO0tBQzdGO0lBQ0QsT0FBTyxrQkFBa0IsQ0FBQztBQUM1QixDQUFDOzs7Ozs7Ozs7OztBQVdELE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxhQUFpQyxFQUFFLEdBQVcsRUFBRSxLQUFVO0lBQzlGLElBQUksMEJBQTBCLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDbkMsS0FBSyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNoQztJQUNELGdCQUFnQixDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDOUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkQsU0FBUyxnQkFBZ0IsQ0FDckIsS0FBWSxFQUFFLEtBQVksRUFBRSxLQUFZLEVBQUUsUUFBbUIsRUFDN0QsZ0JBQW9DLEVBQUUsZ0JBQW9DLEVBQzFFLFlBQXFCLEVBQUUsWUFBb0I7SUFDN0MsSUFBSSxtQkFBQSxnQkFBZ0IsRUFBaUMsS0FBSyxTQUFTLEVBQUU7UUFDbkUsMkZBQTJGO1FBQzNGLGdCQUFnQixHQUFHLG1CQUFBLFdBQVcsRUFBTyxDQUFDO0tBQ3ZDOztRQUNHLFFBQVEsR0FBRyxDQUFDOztRQUNaLFFBQVEsR0FBRyxDQUFDOztRQUNaLE1BQU0sR0FBZ0IsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7O1FBQzlFLE1BQU0sR0FBZ0IsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7SUFDbEYsT0FBTyxNQUFNLEtBQUssSUFBSSxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7UUFDekMsU0FBUyxJQUFJLGNBQWMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7UUFDN0UsU0FBUyxJQUFJLGNBQWMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7O2NBQ3ZFLFFBQVEsR0FDVixRQUFRLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7O2NBQzdFLFFBQVEsR0FDVixRQUFRLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7O1lBQy9FLE1BQU0sR0FBZ0IsSUFBSTs7WUFDMUIsUUFBUSxHQUFRLFNBQVM7UUFDN0IsSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFO1lBQ3JCLGdFQUFnRTtZQUNoRSxRQUFRLElBQUksQ0FBQyxDQUFDO1lBQ2QsUUFBUSxJQUFJLENBQUMsQ0FBQztZQUNkLElBQUksUUFBUSxLQUFLLFFBQVEsRUFBRTtnQkFDekIsTUFBTSxHQUFHLE1BQU0sQ0FBQztnQkFDaEIsUUFBUSxHQUFHLFFBQVEsQ0FBQzthQUNyQjtTQUNGO2FBQU0sSUFBSSxNQUFNLEtBQUssSUFBSSxJQUFJLE1BQU0sS0FBSyxJQUFJLElBQUksTUFBTSxHQUFHLG1CQUFBLE1BQU0sRUFBRSxFQUFFO1lBQ2xFLDhFQUE4RTtZQUM5RSxvRkFBb0Y7WUFDcEYsOEZBQThGO1lBQzlGLGFBQWE7WUFDYixRQUFRLElBQUksQ0FBQyxDQUFDO1lBQ2QsTUFBTSxHQUFHLE1BQU0sQ0FBQztTQUNqQjthQUFNO1lBQ0wsOEZBQThGO1lBQzlGLDJGQUEyRjtZQUMzRixhQUFhO1lBQ2IsU0FBUyxJQUFJLGFBQWEsQ0FBQyxNQUFNLEVBQUUsK0JBQStCLENBQUMsQ0FBQztZQUNwRSxRQUFRLElBQUksQ0FBQyxDQUFDO1lBQ2QsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNoQixRQUFRLEdBQUcsUUFBUSxDQUFDO1NBQ3JCO1FBQ0QsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO1lBQ25CLGFBQWEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDNUY7UUFDRCxNQUFNLEdBQUcsUUFBUSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNoRixNQUFNLEdBQUcsUUFBUSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztLQUNqRjtBQUNILENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkQsU0FBUyxhQUFhLENBQ2xCLEtBQVksRUFBRSxLQUFZLEVBQUUsS0FBWSxFQUFFLFFBQW1CLEVBQUUsSUFBWSxFQUMzRSxLQUEwQyxFQUFFLFlBQXFCLEVBQUUsWUFBb0I7SUFDekYsSUFBSSxLQUFLLENBQUMsSUFBSSxvQkFBc0IsRUFBRTtRQUNwQyx5RUFBeUU7UUFDekUsNkVBQTZFO1FBQzdFLE9BQU87S0FDUjs7VUFDSyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUk7O1VBQ2xCLE1BQU0sR0FBRyxtQkFBQSxLQUFLLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxFQUFpQjs7VUFDakQsbUJBQW1CLEdBQUcsNkJBQTZCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMvRCxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsb0JBQW9CLENBQUMsTUFBTSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUN6RixTQUFTO0lBQ2IsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLEVBQUU7UUFDL0Msd0VBQXdFO1FBQ3hFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNqQyxxRUFBcUU7WUFDckUsSUFBSSw2QkFBNkIsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDekMsd0RBQXdEO2dCQUN4RCxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQzthQUNoRjtTQUNGOztjQUNLLEtBQUssR0FBRyxtQkFBQSxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFZO1FBQ3JFLFlBQVksQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDMUQ7QUFDSCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQ0QsU0FBUyxnQkFBZ0IsQ0FDckIsS0FBWSxFQUFFLEtBQW1CLEVBQUUsS0FBWSxFQUFFLElBQVksRUFBRSxLQUFhLEVBQzVFLFlBQXFCOzs7Ozs7O1VBTWpCLGVBQWUsR0FBRyxLQUFLLEtBQUssSUFBSTs7UUFDbEMsS0FBSyxHQUFRLFNBQVM7SUFDMUIsT0FBTyxLQUFLLEdBQUcsQ0FBQyxFQUFFOztjQUNWLE1BQU0sR0FBRyxtQkFBQSxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQWU7O2NBQ3BDLGVBQWUsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7O2NBRXZDLEdBQUcsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQUEsTUFBTSxFQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTs7Y0FDeEQsWUFBWSxHQUFHLEdBQUcsS0FBSyxJQUFJOztZQUM3QixpQkFBaUIsR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUN4QyxJQUFJLGlCQUFpQixLQUFLLFNBQVMsRUFBRTtZQUNuQywrRUFBK0U7WUFDL0UseUZBQXlGO1lBQ3pGLFFBQVE7WUFDUix3RkFBd0Y7WUFDeEYsd0ZBQXdGO1lBQ3hGLG9GQUFvRjtZQUNwRiw4QkFBOEI7WUFDOUIsaUJBQWlCLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztTQUM1RDs7WUFDRyxZQUFZLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNDLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQzlFLElBQUksZUFBZSxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDM0QsWUFBWSxHQUFHLGdCQUFnQixDQUFDLG1CQUFBLE1BQU0sRUFBc0IsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNyRTtRQUNELElBQUkscUJBQXFCLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDdkMsS0FBSyxHQUFHLFlBQVksQ0FBQztZQUNyQixJQUFJLGVBQWUsRUFBRTtnQkFDbkIsT0FBTyxLQUFLLENBQUM7YUFDZDtTQUNGOztjQUNLLE1BQU0sR0FBRyxtQkFBQSxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFpQjtRQUNoRCxLQUFLLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDdkY7SUFDRCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7Ozs7WUFHZCxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYztRQUMxRSxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsaUNBQWlDLEVBQUU7WUFDdEQsS0FBSyxHQUFHLGdCQUFnQixDQUFDLG1CQUFBLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzVDO0tBQ0Y7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7Ozs7Ozs7O0FBUUQsU0FBUyxxQkFBcUIsQ0FBQyxLQUFVO0lBQ3ZDLCtGQUErRjtJQUMvRiw2RkFBNkY7SUFDN0YseUNBQXlDO0lBQ3pDLDJGQUEyRjtJQUMzRixPQUFPLEtBQUssS0FBSyxTQUFTLENBQUM7QUFDN0IsQ0FBQzs7Ozs7Ozs7O0FBU0QsU0FBUyxrQ0FBa0MsQ0FDdkMsS0FBVSxFQUFFLGlCQUEwRDtJQUV4RSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsNkJBQTZCLEVBQUU7UUFDL0MsYUFBYTtLQUNkO1NBQU0sSUFBSSxPQUFPLGlCQUFpQixLQUFLLFVBQVUsRUFBRTtRQUNsRCxzQkFBc0I7UUFDdEIsS0FBSyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2xDO1NBQU0sSUFBSSxPQUFPLGlCQUFpQixLQUFLLFFBQVEsRUFBRTtRQUNoRCxLQUFLLEdBQUcsS0FBSyxHQUFHLGlCQUFpQixDQUFDO0tBQ25DO1NBQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDcEMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUMzQztJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQzs7Ozs7Ozs7Ozs7QUFZRCxNQUFNLFVBQVUscUJBQXFCLENBQUMsS0FBWSxFQUFFLFlBQXFCO0lBQ3ZFLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsd0JBQTBCLENBQUMsdUJBQXlCLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNwRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4qIEBsaWNlbnNlXG4qIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuKlxuKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4qL1xuXG5pbXBvcnQge1NhZmVWYWx1ZSwgdW53cmFwU2FmZVZhbHVlfSBmcm9tICcuLi8uLi9zYW5pdGl6YXRpb24vYnlwYXNzJztcbmltcG9ydCB7c3R5bGVQcm9wTmVlZHNTYW5pdGl6YXRpb24sIMm1ybVzYW5pdGl6ZVN0eWxlfSBmcm9tICcuLi8uLi9zYW5pdGl6YXRpb24vc2FuaXRpemF0aW9uJztcbmltcG9ydCB7U3R5bGVTYW5pdGl6ZUZufSBmcm9tICcuLi8uLi9zYW5pdGl6YXRpb24vc3R5bGVfc2FuaXRpemVyJztcbmltcG9ydCB7S2V5VmFsdWVBcnJheSwga2V5VmFsdWVBcnJheUdldCwga2V5VmFsdWVBcnJheVNldH0gZnJvbSAnLi4vLi4vdXRpbC9hcnJheV91dGlscyc7XG5pbXBvcnQge2Fzc2VydERlZmluZWQsIGFzc2VydEVxdWFsLCBhc3NlcnRMZXNzVGhhbiwgYXNzZXJ0Tm90RXF1YWwsIHRocm93RXJyb3J9IGZyb20gJy4uLy4uL3V0aWwvYXNzZXJ0JztcbmltcG9ydCB7RU1QVFlfQVJSQVl9IGZyb20gJy4uLy4uL3V0aWwvZW1wdHknO1xuaW1wb3J0IHtjb25jYXRTdHJpbmdzV2l0aFNwYWNlLCBzdHJpbmdpZnl9IGZyb20gJy4uLy4uL3V0aWwvc3RyaW5naWZ5JztcbmltcG9ydCB7YXNzZXJ0Rmlyc3RVcGRhdGVQYXNzfSBmcm9tICcuLi9hc3NlcnQnO1xuaW1wb3J0IHtiaW5kaW5nVXBkYXRlZH0gZnJvbSAnLi4vYmluZGluZ3MnO1xuaW1wb3J0IHtEaXJlY3RpdmVEZWZ9IGZyb20gJy4uL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge0F0dHJpYnV0ZU1hcmtlciwgVEF0dHJpYnV0ZXMsIFROb2RlLCBUTm9kZUZsYWdzLCBUTm9kZVR5cGV9IGZyb20gJy4uL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge1JFbGVtZW50LCBSZW5kZXJlcjN9IGZyb20gJy4uL2ludGVyZmFjZXMvcmVuZGVyZXInO1xuaW1wb3J0IHtTYW5pdGl6ZXJGbn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9zYW5pdGl6YXRpb24nO1xuaW1wb3J0IHtUU3R5bGluZ0tleSwgVFN0eWxpbmdSYW5nZSwgZ2V0VFN0eWxpbmdSYW5nZU5leHQsIGdldFRTdHlsaW5nUmFuZ2VOZXh0RHVwbGljYXRlLCBnZXRUU3R5bGluZ1JhbmdlUHJldiwgZ2V0VFN0eWxpbmdSYW5nZVByZXZEdXBsaWNhdGV9IGZyb20gJy4uL2ludGVyZmFjZXMvc3R5bGluZyc7XG5pbXBvcnQge0hFQURFUl9PRkZTRVQsIExWaWV3LCBSRU5ERVJFUiwgVERhdGEsIFRWaWV3fSBmcm9tICcuLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHthcHBseVN0eWxpbmd9IGZyb20gJy4uL25vZGVfbWFuaXB1bGF0aW9uJztcbmltcG9ydCB7Z2V0Q3VycmVudERpcmVjdGl2ZUluZGV4LCBnZXRDdXJyZW50U3R5bGVTYW5pdGl6ZXIsIGdldExWaWV3LCBnZXRTZWxlY3RlZEluZGV4LCBnZXRUVmlldywgaW5jcmVtZW50QmluZGluZ0luZGV4LCBzZXRDdXJyZW50U3R5bGVTYW5pdGl6ZXJ9IGZyb20gJy4uL3N0YXRlJztcbmltcG9ydCB7aW5zZXJ0VFN0eWxpbmdCaW5kaW5nfSBmcm9tICcuLi9zdHlsaW5nL3N0eWxlX2JpbmRpbmdfbGlzdCc7XG5pbXBvcnQge2dldExhc3RQYXJzZWRLZXksIGdldExhc3RQYXJzZWRWYWx1ZSwgcGFyc2VDbGFzc05hbWUsIHBhcnNlQ2xhc3NOYW1lTmV4dCwgcGFyc2VTdHlsZSwgcGFyc2VTdHlsZU5leHR9IGZyb20gJy4uL3N0eWxpbmcvc3R5bGluZ19wYXJzZXInO1xuaW1wb3J0IHtOT19DSEFOR0V9IGZyb20gJy4uL3Rva2Vucyc7XG5pbXBvcnQge2dldE5hdGl2ZUJ5SW5kZXh9IGZyb20gJy4uL3V0aWwvdmlld191dGlscyc7XG5pbXBvcnQge3NldERpcmVjdGl2ZUlucHV0c1doaWNoU2hhZG93c1N0eWxpbmd9IGZyb20gJy4vcHJvcGVydHknO1xuXG5cbi8qKlxuICogU2V0cyB0aGUgY3VycmVudCBzdHlsZSBzYW5pdGl6ZXIgZnVuY3Rpb24gd2hpY2ggd2lsbCB0aGVuIGJlIHVzZWRcbiAqIHdpdGhpbiBhbGwgZm9sbG93LXVwIHByb3AgYW5kIG1hcC1iYXNlZCBzdHlsZSBiaW5kaW5nIGluc3RydWN0aW9uc1xuICogZm9yIHRoZSBnaXZlbiBlbGVtZW50LlxuICpcbiAqIE5vdGUgdGhhdCBvbmNlIHN0eWxpbmcgaGFzIGJlZW4gYXBwbGllZCB0byB0aGUgZWxlbWVudCAoaS5lLiBvbmNlXG4gKiBgYWR2YW5jZShuKWAgaXMgZXhlY3V0ZWQgb3IgdGhlIGhvc3RCaW5kaW5ncy90ZW1wbGF0ZSBmdW5jdGlvbiBleGl0cylcbiAqIHRoZW4gdGhlIGFjdGl2ZSBgc2FuaXRpemVyRm5gIHdpbGwgYmUgc2V0IHRvIGBudWxsYC4gVGhpcyBtZWFucyB0aGF0XG4gKiBvbmNlIHN0eWxpbmcgaXMgYXBwbGllZCB0byBhbm90aGVyIGVsZW1lbnQgdGhlbiBhIGFub3RoZXIgY2FsbCB0b1xuICogYHN0eWxlU2FuaXRpemVyYCB3aWxsIG5lZWQgdG8gYmUgbWFkZS5cbiAqXG4gKiBAcGFyYW0gc2FuaXRpemVyRm4gVGhlIHNhbml0aXphdGlvbiBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgdXNlZCB0b1xuICogICAgICAgcHJvY2VzcyBzdHlsZSBwcm9wL3ZhbHVlIGVudHJpZXMuXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVzdHlsZVNhbml0aXplcihzYW5pdGl6ZXI6IFN0eWxlU2FuaXRpemVGbiB8IG51bGwpOiB2b2lkIHtcbiAgc2V0Q3VycmVudFN0eWxlU2FuaXRpemVyKHNhbml0aXplcik7XG59XG5cbi8qKlxuICogVXBkYXRlIGEgc3R5bGUgYmluZGluZyBvbiBhbiBlbGVtZW50IHdpdGggdGhlIHByb3ZpZGVkIHZhbHVlLlxuICpcbiAqIElmIHRoZSBzdHlsZSB2YWx1ZSBpcyBmYWxzeSB0aGVuIGl0IHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZSBlbGVtZW50XG4gKiAob3IgYXNzaWduZWQgYSBkaWZmZXJlbnQgdmFsdWUgZGVwZW5kaW5nIGlmIHRoZXJlIGFyZSBhbnkgc3R5bGVzIHBsYWNlZFxuICogb24gdGhlIGVsZW1lbnQgd2l0aCBgc3R5bGVNYXBgIG9yIGFueSBzdGF0aWMgc3R5bGVzIHRoYXQgYXJlXG4gKiBwcmVzZW50IGZyb20gd2hlbiB0aGUgZWxlbWVudCB3YXMgY3JlYXRlZCB3aXRoIGBzdHlsaW5nYCkuXG4gKlxuICogTm90ZSB0aGF0IHRoZSBzdHlsaW5nIGVsZW1lbnQgaXMgdXBkYXRlZCBhcyBwYXJ0IG9mIGBzdHlsaW5nQXBwbHlgLlxuICpcbiAqIEBwYXJhbSBwcm9wIEEgdmFsaWQgQ1NTIHByb3BlcnR5LlxuICogQHBhcmFtIHZhbHVlIE5ldyB2YWx1ZSB0byB3cml0ZSAoYG51bGxgIG9yIGFuIGVtcHR5IHN0cmluZyB0byByZW1vdmUpLlxuICogQHBhcmFtIHN1ZmZpeCBPcHRpb25hbCBzdWZmaXguIFVzZWQgd2l0aCBzY2FsYXIgdmFsdWVzIHRvIGFkZCB1bml0IHN1Y2ggYXMgYHB4YC5cbiAqICAgICAgICBOb3RlIHRoYXQgd2hlbiBhIHN1ZmZpeCBpcyBwcm92aWRlZCB0aGVuIHRoZSB1bmRlcmx5aW5nIHNhbml0aXplciB3aWxsXG4gKiAgICAgICAgYmUgaWdub3JlZC5cbiAqXG4gKiBOb3RlIHRoYXQgdGhpcyB3aWxsIGFwcGx5IHRoZSBwcm92aWRlZCBzdHlsZSB2YWx1ZSB0byB0aGUgaG9zdCBlbGVtZW50IGlmIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkXG4gKiB3aXRoaW4gYSBob3N0IGJpbmRpbmcgZnVuY3Rpb24uXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVzdHlsZVByb3AoXG4gICAgcHJvcDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgU2FmZVZhbHVlIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBzdWZmaXg/OiBzdHJpbmcgfCBudWxsKTogdHlwZW9mIMm1ybVzdHlsZVByb3Age1xuICBjaGVja1N0eWxpbmdQcm9wZXJ0eShwcm9wLCB2YWx1ZSwgc3VmZml4LCBmYWxzZSk7XG4gIHJldHVybiDJtcm1c3R5bGVQcm9wO1xufVxuXG4vKipcbiAqIFVwZGF0ZSBhIGNsYXNzIGJpbmRpbmcgb24gYW4gZWxlbWVudCB3aXRoIHRoZSBwcm92aWRlZCB2YWx1ZS5cbiAqXG4gKiBUaGlzIGluc3RydWN0aW9uIGlzIG1lYW50IHRvIGhhbmRsZSB0aGUgYFtjbGFzcy5mb29dPVwiZXhwXCJgIGNhc2UgYW5kLFxuICogdGhlcmVmb3JlLCB0aGUgY2xhc3MgYmluZGluZyBpdHNlbGYgbXVzdCBhbHJlYWR5IGJlIGFsbG9jYXRlZCB1c2luZ1xuICogYHN0eWxpbmdgIHdpdGhpbiB0aGUgY3JlYXRpb24gYmxvY2suXG4gKlxuICogQHBhcmFtIHByb3AgQSB2YWxpZCBDU1MgY2xhc3MgKG9ubHkgb25lKS5cbiAqIEBwYXJhbSB2YWx1ZSBBIHRydWUvZmFsc2UgdmFsdWUgd2hpY2ggd2lsbCB0dXJuIHRoZSBjbGFzcyBvbiBvciBvZmYuXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgd2lsbCBhcHBseSB0aGUgcHJvdmlkZWQgY2xhc3MgdmFsdWUgdG8gdGhlIGhvc3QgZWxlbWVudCBpZiB0aGlzIGZ1bmN0aW9uXG4gKiBpcyBjYWxsZWQgd2l0aGluIGEgaG9zdCBiaW5kaW5nIGZ1bmN0aW9uLlxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1Y2xhc3NQcm9wKFxuICAgIGNsYXNzTmFtZTogc3RyaW5nLCB2YWx1ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCB8IG51bGwpOiB0eXBlb2YgybXJtWNsYXNzUHJvcCB7XG4gIGNoZWNrU3R5bGluZ1Byb3BlcnR5KGNsYXNzTmFtZSwgdmFsdWUsIG51bGwsIHRydWUpO1xuICByZXR1cm4gybXJtWNsYXNzUHJvcDtcbn1cblxuXG4vKipcbiAqIFVwZGF0ZSBzdHlsZSBiaW5kaW5ncyB1c2luZyBhbiBvYmplY3QgbGl0ZXJhbCBvbiBhbiBlbGVtZW50LlxuICpcbiAqIFRoaXMgaW5zdHJ1Y3Rpb24gaXMgbWVhbnQgdG8gYXBwbHkgc3R5bGluZyB2aWEgdGhlIGBbc3R5bGVdPVwiZXhwXCJgIHRlbXBsYXRlIGJpbmRpbmdzLlxuICogV2hlbiBzdHlsZXMgYXJlIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQgdGhleSB3aWxsIHRoZW4gYmUgdXBkYXRlZCB3aXRoIHJlc3BlY3QgdG9cbiAqIGFueSBzdHlsZXMvY2xhc3NlcyBzZXQgdmlhIGBzdHlsZVByb3BgLiBJZiBhbnkgc3R5bGVzIGFyZSBzZXQgdG8gZmFsc3lcbiAqIHRoZW4gdGhleSB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgZWxlbWVudC5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlIHN0eWxpbmcgaW5zdHJ1Y3Rpb24gd2lsbCBub3QgYmUgYXBwbGllZCB1bnRpbCBgc3R5bGluZ0FwcGx5YCBpcyBjYWxsZWQuXG4gKlxuICogQHBhcmFtIHN0eWxlcyBBIGtleS92YWx1ZSBzdHlsZSBtYXAgb2YgdGhlIHN0eWxlcyB0aGF0IHdpbGwgYmUgYXBwbGllZCB0byB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAqICAgICAgICBBbnkgbWlzc2luZyBzdHlsZXMgKHRoYXQgaGF2ZSBhbHJlYWR5IGJlZW4gYXBwbGllZCB0byB0aGUgZWxlbWVudCBiZWZvcmVoYW5kKSB3aWxsIGJlXG4gKiAgICAgICAgcmVtb3ZlZCAodW5zZXQpIGZyb20gdGhlIGVsZW1lbnQncyBzdHlsaW5nLlxuICpcbiAqIE5vdGUgdGhhdCB0aGlzIHdpbGwgYXBwbHkgdGhlIHByb3ZpZGVkIHN0eWxlTWFwIHZhbHVlIHRvIHRoZSBob3N0IGVsZW1lbnQgaWYgdGhpcyBmdW5jdGlvblxuICogaXMgY2FsbGVkIHdpdGhpbiBhIGhvc3QgYmluZGluZy5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtXN0eWxlTWFwKHN0eWxlczoge1tzdHlsZU5hbWU6IHN0cmluZ106IGFueX0gfCBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsKTogdm9pZCB7XG4gIGNoZWNrU3R5bGluZ01hcChzdHlsZUtleVZhbHVlQXJyYXlTZXQsIHN0eWxlU3RyaW5nUGFyc2VyLCBzdHlsZXMsIGZhbHNlKTtcbn1cblxuXG4vKipcbiAqIFBhcnNlIHRleHQgYXMgc3R5bGUgYW5kIGFkZCB2YWx1ZXMgdG8gS2V5VmFsdWVBcnJheS5cbiAqXG4gKiBUaGlzIGNvZGUgaXMgcHVsbGVkIG91dCB0byBhIHNlcGFyYXRlIGZ1bmN0aW9uIHNvIHRoYXQgaXQgY2FuIGJlIHRyZWUgc2hha2VuIGF3YXkgaWYgaXQgaXMgbm90XG4gKiBuZWVkZWQuIEl0IGlzIG9ubHkgcmVmZXJlbmNlZCBmcm9tIGDJtcm1c3R5bGVNYXBgLlxuICpcbiAqIEBwYXJhbSBrZXlWYWx1ZUFycmF5IEtleVZhbHVlQXJyYXkgdG8gYWRkIHBhcnNlZCB2YWx1ZXMgdG8uXG4gKiBAcGFyYW0gdGV4dCB0ZXh0IHRvIHBhcnNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3R5bGVTdHJpbmdQYXJzZXIoa2V5VmFsdWVBcnJheTogS2V5VmFsdWVBcnJheTxhbnk+LCB0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgZm9yIChsZXQgaSA9IHBhcnNlU3R5bGUodGV4dCk7IGkgPj0gMDsgaSA9IHBhcnNlU3R5bGVOZXh0KHRleHQsIGkpKSB7XG4gICAgc3R5bGVLZXlWYWx1ZUFycmF5U2V0KGtleVZhbHVlQXJyYXksIGdldExhc3RQYXJzZWRLZXkodGV4dCksIGdldExhc3RQYXJzZWRWYWx1ZSh0ZXh0KSk7XG4gIH1cbn1cblxuXG4vKipcbiAqIFVwZGF0ZSBjbGFzcyBiaW5kaW5ncyB1c2luZyBhbiBvYmplY3QgbGl0ZXJhbCBvciBjbGFzcy1zdHJpbmcgb24gYW4gZWxlbWVudC5cbiAqXG4gKiBUaGlzIGluc3RydWN0aW9uIGlzIG1lYW50IHRvIGFwcGx5IHN0eWxpbmcgdmlhIHRoZSBgW2NsYXNzXT1cImV4cFwiYCB0ZW1wbGF0ZSBiaW5kaW5ncy5cbiAqIFdoZW4gY2xhc3NlcyBhcmUgYXBwbGllZCB0byB0aGUgZWxlbWVudCB0aGV5IHdpbGwgdGhlbiBiZSB1cGRhdGVkIHdpdGhcbiAqIHJlc3BlY3QgdG8gYW55IHN0eWxlcy9jbGFzc2VzIHNldCB2aWEgYGNsYXNzUHJvcGAuIElmIGFueVxuICogY2xhc3NlcyBhcmUgc2V0IHRvIGZhbHN5IHRoZW4gdGhleSB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgZWxlbWVudC5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlIHN0eWxpbmcgaW5zdHJ1Y3Rpb24gd2lsbCBub3QgYmUgYXBwbGllZCB1bnRpbCBgc3R5bGluZ0FwcGx5YCBpcyBjYWxsZWQuXG4gKiBOb3RlIHRoYXQgdGhpcyB3aWxsIHRoZSBwcm92aWRlZCBjbGFzc01hcCB2YWx1ZSB0byB0aGUgaG9zdCBlbGVtZW50IGlmIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkXG4gKiB3aXRoaW4gYSBob3N0IGJpbmRpbmcuXG4gKlxuICogQHBhcmFtIGNsYXNzZXMgQSBrZXkvdmFsdWUgbWFwIG9yIHN0cmluZyBvZiBDU1MgY2xhc3NlcyB0aGF0IHdpbGwgYmUgYWRkZWQgdG8gdGhlXG4gKiAgICAgICAgZ2l2ZW4gZWxlbWVudC4gQW55IG1pc3NpbmcgY2xhc3NlcyAodGhhdCBoYXZlIGFscmVhZHkgYmVlbiBhcHBsaWVkIHRvIHRoZSBlbGVtZW50XG4gKiAgICAgICAgYmVmb3JlaGFuZCkgd2lsbCBiZSByZW1vdmVkICh1bnNldCkgZnJvbSB0aGUgZWxlbWVudCdzIGxpc3Qgb2YgQ1NTIGNsYXNzZXMuXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVjbGFzc01hcChcbiAgICBjbGFzc2VzOiB7W2NsYXNzTmFtZTogc3RyaW5nXTogYm9vbGVhbiB8IHVuZGVmaW5lZCB8IG51bGx9IHwgc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCk6IHZvaWQge1xuICBjaGVja1N0eWxpbmdNYXAoa2V5VmFsdWVBcnJheVNldCwgY2xhc3NTdHJpbmdQYXJzZXIsIGNsYXNzZXMsIHRydWUpO1xufVxuXG4vKipcbiAqIFBhcnNlIHRleHQgYXMgY2xhc3MgYW5kIGFkZCB2YWx1ZXMgdG8gS2V5VmFsdWVBcnJheS5cbiAqXG4gKiBUaGlzIGNvZGUgaXMgcHVsbGVkIG91dCB0byBhIHNlcGFyYXRlIGZ1bmN0aW9uIHNvIHRoYXQgaXQgY2FuIGJlIHRyZWUgc2hha2VuIGF3YXkgaWYgaXQgaXMgbm90XG4gKiBuZWVkZWQuIEl0IGlzIG9ubHkgcmVmZXJlbmNlZCBmcm9tIGDJtcm1Y2xhc3NNYXBgLlxuICpcbiAqIEBwYXJhbSBrZXlWYWx1ZUFycmF5IEtleVZhbHVlQXJyYXkgdG8gYWRkIHBhcnNlZCB2YWx1ZXMgdG8uXG4gKiBAcGFyYW0gdGV4dCB0ZXh0IHRvIHBhcnNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NTdHJpbmdQYXJzZXIoa2V5VmFsdWVBcnJheTogS2V5VmFsdWVBcnJheTxhbnk+LCB0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgZm9yIChsZXQgaSA9IHBhcnNlQ2xhc3NOYW1lKHRleHQpOyBpID49IDA7IGkgPSBwYXJzZUNsYXNzTmFtZU5leHQodGV4dCwgaSkpIHtcbiAgICBrZXlWYWx1ZUFycmF5U2V0KGtleVZhbHVlQXJyYXksIGdldExhc3RQYXJzZWRLZXkodGV4dCksIHRydWUpO1xuICB9XG59XG5cbi8qKlxuICogQ29tbW9uIGNvZGUgYmV0d2VlbiBgybXJtWNsYXNzUHJvcGAgYW5kIGDJtcm1c3R5bGVQcm9wYC5cbiAqXG4gKiBAcGFyYW0gcHJvcCBwcm9wZXJ0eSBuYW1lLlxuICogQHBhcmFtIHZhbHVlIGJpbmRpbmcgdmFsdWUuXG4gKiBAcGFyYW0gc3VmZml4T3JTYW5pdGl6ZXIgc3VmZml4IG9yIHNhbml0aXphdGlvbiBmdW5jdGlvblxuICogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCBjaGFuZ2UgKGBmYWxzZWAgaWYgYHN0eWxlYClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrU3R5bGluZ1Byb3BlcnR5KFxuICAgIHByb3A6IHN0cmluZywgdmFsdWU6IGFueSB8IE5PX0NIQU5HRSxcbiAgICBzdWZmaXhPclNhbml0aXplcjogU2FuaXRpemVyRm4gfCBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLCBpc0NsYXNzQmFzZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgY29uc3QgbFZpZXcgPSBnZXRMVmlldygpO1xuICBjb25zdCB0VmlldyA9IGdldFRWaWV3KCk7XG4gIC8vIFN0eWxpbmcgaW5zdHJ1Y3Rpb25zIHVzZSAyIHNsb3RzIHBlciBiaW5kaW5nLlxuICAvLyAxLiBvbmUgZm9yIHRoZSB2YWx1ZSAvIFRTdHlsaW5nS2V5XG4gIC8vIDIuIG9uZSBmb3IgdGhlIGludGVybWl0dGVudC12YWx1ZSAvIFRTdHlsaW5nUmFuZ2VcbiAgY29uc3QgYmluZGluZ0luZGV4ID0gaW5jcmVtZW50QmluZGluZ0luZGV4KDIpO1xuICBpZiAodFZpZXcuZmlyc3RVcGRhdGVQYXNzKSB7XG4gICAgc3R5bGluZ0ZpcnN0VXBkYXRlUGFzcyh0VmlldywgcHJvcCwgYmluZGluZ0luZGV4LCBpc0NsYXNzQmFzZWQpO1xuICB9XG4gIGlmICh2YWx1ZSAhPT0gTk9fQ0hBTkdFICYmIGJpbmRpbmdVcGRhdGVkKGxWaWV3LCBiaW5kaW5nSW5kZXgsIHZhbHVlKSkge1xuICAgIC8vIFRoaXMgaXMgYSB3b3JrIGFyb3VuZC4gT25jZSBQUiMzNDQ4MCBsYW5kcyB0aGUgc2FuaXRpemVyIGlzIHBhc3NlZCBleHBsaWNpdGx5IGFuZCB0aGlzIGxpbmVcbiAgICAvLyBjYW4gYmUgcmVtb3ZlZC5cbiAgICBsZXQgc3R5bGVTYW5pdGl6ZXI6IFN0eWxlU2FuaXRpemVGbnxudWxsO1xuICAgIGlmIChzdWZmaXhPclNhbml0aXplciA9PSBudWxsKSB7XG4gICAgICBpZiAoc3R5bGVTYW5pdGl6ZXIgPSBnZXRDdXJyZW50U3R5bGVTYW5pdGl6ZXIoKSkge1xuICAgICAgICBzdWZmaXhPclNhbml0aXplciA9IHN0eWxlU2FuaXRpemVyIGFzIGFueTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgdE5vZGUgPSB0Vmlldy5kYXRhW2dldFNlbGVjdGVkSW5kZXgoKSArIEhFQURFUl9PRkZTRVRdIGFzIFROb2RlO1xuICAgIHVwZGF0ZVN0eWxpbmcoXG4gICAgICAgIHRWaWV3LCB0Tm9kZSwgbFZpZXcsIGxWaWV3W1JFTkRFUkVSXSwgcHJvcCxcbiAgICAgICAgbFZpZXdbYmluZGluZ0luZGV4ICsgMV0gPSBub3JtYWxpemVBbmRBcHBseVN1ZmZpeE9yU2FuaXRpemVyKHZhbHVlLCBzdWZmaXhPclNhbml0aXplciksXG4gICAgICAgIGlzQ2xhc3NCYXNlZCwgYmluZGluZ0luZGV4KTtcbiAgfVxufVxuXG4vKipcbiAqIENvbW1vbiBjb2RlIGJldHdlZW4gYMm1ybVjbGFzc01hcGAgYW5kIGDJtcm1c3R5bGVNYXBgLlxuICpcbiAqIEBwYXJhbSBrZXlWYWx1ZUFycmF5U2V0IChTZWUgYGtleVZhbHVlQXJyYXlTZXRgIGluIFwidXRpbC9hcnJheV91dGlsc1wiKSBHZXRzIHBhc3NlZCBpbiBhcyBhXG4gKiBmdW5jdGlvbiBzbyB0aGF0XG4gKiAgICAgICAgYHN0eWxlYCBjYW4gcGFzcyBpbiB2ZXJzaW9uIHdoaWNoIGRvZXMgc2FuaXRpemF0aW9uLiBUaGlzIGlzIGRvbmUgZm9yIHRyZWUgc2hha2luZ1xuICogICAgICAgIHB1cnBvc2VzLlxuICogQHBhcmFtIHN0cmluZ1BhcnNlciBQYXJzZXIgdXNlZCB0byBwYXJzZSBgdmFsdWVgIGlmIGBzdHJpbmdgLiAoUGFzc2VkIGluIGFzIGBzdHlsZWAgYW5kIGBjbGFzc2BcbiAqICAgICAgICBoYXZlIGRpZmZlcmVudCBwYXJzZXJzLilcbiAqIEBwYXJhbSB2YWx1ZSBib3VuZCB2YWx1ZSBmcm9tIGFwcGxpY2F0aW9uXG4gKiBAcGFyYW0gaXNDbGFzc0Jhc2VkIGB0cnVlYCBpZiBgY2xhc3NgIGNoYW5nZSAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tTdHlsaW5nTWFwKFxuICAgIGtleVZhbHVlQXJyYXlTZXQ6IChrZXlWYWx1ZUFycmF5OiBLZXlWYWx1ZUFycmF5PGFueT4sIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSA9PiB2b2lkLFxuICAgIHN0cmluZ1BhcnNlcjogKHN0eWxlS2V5VmFsdWVBcnJheTogS2V5VmFsdWVBcnJheTxhbnk+LCB0ZXh0OiBzdHJpbmcpID0+IHZvaWQsXG4gICAgdmFsdWU6IGFueXxOT19DSEFOR0UsIGlzQ2xhc3NCYXNlZDogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCB0VmlldyA9IGdldFRWaWV3KCk7XG4gIGNvbnN0IGJpbmRpbmdJbmRleCA9IGluY3JlbWVudEJpbmRpbmdJbmRleCgyKTtcbiAgaWYgKHRWaWV3LmZpcnN0VXBkYXRlUGFzcykge1xuICAgIHN0eWxpbmdGaXJzdFVwZGF0ZVBhc3ModFZpZXcsIG51bGwsIGJpbmRpbmdJbmRleCwgaXNDbGFzc0Jhc2VkKTtcbiAgfVxuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGlmICh2YWx1ZSAhPT0gTk9fQ0hBTkdFICYmIGJpbmRpbmdVcGRhdGVkKGxWaWV3LCBiaW5kaW5nSW5kZXgsIHZhbHVlKSkge1xuICAgIC8vIGBnZXRTZWxlY3RlZEluZGV4KClgIHNob3VsZCBiZSBoZXJlIChyYXRoZXIgdGhhbiBpbiBpbnN0cnVjdGlvbikgc28gdGhhdCBpdCBpcyBndWFyZGVkIGJ5IHRoZVxuICAgIC8vIGlmIHNvIGFzIG5vdCB0byByZWFkIHVubmVjZXNzYXJpbHkuXG4gICAgY29uc3QgdE5vZGUgPSB0Vmlldy5kYXRhW2dldFNlbGVjdGVkSW5kZXgoKSArIEhFQURFUl9PRkZTRVRdIGFzIFROb2RlO1xuICAgIGlmIChoYXNTdHlsaW5nSW5wdXRTaGFkb3codE5vZGUsIGlzQ2xhc3NCYXNlZCkgJiYgIWlzSW5Ib3N0QmluZGluZ3ModFZpZXcsIGJpbmRpbmdJbmRleCkpIHtcbiAgICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgICAgLy8gdmVyaWZ5IHRoYXQgaWYgd2UgYXJlIHNoYWRvd2luZyB0aGVuIGBURGF0YWAgaXMgYXBwcm9wcmlhdGVseSBtYXJrZWQgc28gdGhhdCB3ZSBza2lwXG4gICAgICAgIC8vIHByb2Nlc3NpbmcgdGhpcyBiaW5kaW5nIGluIHN0eWxpbmcgcmVzb2x1dGlvbi5cbiAgICAgICAgY29uc3QgdFN0eWxpbmdLZXkgPSB0Vmlldy5kYXRhW2JpbmRpbmdJbmRleF07XG4gICAgICAgIGFzc2VydEVxdWFsKFxuICAgICAgICAgICAgQXJyYXkuaXNBcnJheSh0U3R5bGluZ0tleSkgPyB0U3R5bGluZ0tleVsxXSA6IHRTdHlsaW5nS2V5LCBmYWxzZSxcbiAgICAgICAgICAgICdTdHlsaW5nIGxpbmtlZCBsaXN0IHNoYWRvdyBpbnB1dCBzaG91bGQgYmUgbWFya2VkIGFzIFxcJ2ZhbHNlXFwnJyk7XG4gICAgICB9XG4gICAgICAvLyBWRSBkb2VzIG5vdCBjb25jYXRlbmF0ZSB0aGUgc3RhdGljIHBvcnRpb24gbGlrZSB3ZSBhcmUgZG9pbmcgaGVyZS5cbiAgICAgIC8vIEluc3RlYWQgVkUganVzdCBpZ25vcmVzIHRoZSBzdGF0aWMgY29tcGxldGVseSBpZiBkeW5hbWljIGJpbmRpbmcgaXMgcHJlc2VudC5cbiAgICAgIC8vIEJlY2F1c2Ugb2YgbG9jYWxpdHkgd2UgaGF2ZSBhbHJlYWR5IHNldCB0aGUgc3RhdGljIHBvcnRpb24gYmVjYXVzZSB3ZSBkb24ndCBrbm93IGlmIHRoZXJlXG4gICAgICAvLyBpcyBhIGR5bmFtaWMgcG9ydGlvbiB1bnRpbCBsYXRlci4gSWYgd2Ugd291bGQgaWdub3JlIHRoZSBzdGF0aWMgcG9ydGlvbiBpdCB3b3VsZCBsb29rIGxpa2VcbiAgICAgIC8vIHRoZSBiaW5kaW5nIGhhcyByZW1vdmVkIGl0LiBUaGlzIHdvdWxkIGNvbmZ1c2UgYFtuZ1N0eWxlXWAvYFtuZ0NsYXNzXWAgdG8gZG8gdGhlIHdyb25nXG4gICAgICAvLyB0aGluZyBhcyBpdCB3b3VsZCB0aGluayB0aGF0IHRoZSBzdGF0aWMgcG9ydGlvbiB3YXMgcmVtb3ZlZC4gRm9yIHRoaXMgcmVhc29uIHdlXG4gICAgICAvLyBjb25jYXRlbmF0ZSBpdCBzbyB0aGF0IGBbbmdTdHlsZV1gL2BbbmdDbGFzc11gICBjYW4gY29udGludWUgdG8gd29yayBvbiBjaGFuZ2VkLlxuICAgICAgbGV0IHN0YXRpY1ByZWZpeCA9IGlzQ2xhc3NCYXNlZCA/IHROb2RlLmNsYXNzZXMgOiB0Tm9kZS5zdHlsZXM7XG4gICAgICBuZ0Rldk1vZGUgJiYgaXNDbGFzc0Jhc2VkID09PSBmYWxzZSAmJiBzdGF0aWNQcmVmaXggIT09IG51bGwgJiZcbiAgICAgICAgICBhc3NlcnRFcXVhbChcbiAgICAgICAgICAgICAgc3RhdGljUHJlZml4LmVuZHNXaXRoKCc7JyksIHRydWUsICdFeHBlY3Rpbmcgc3RhdGljIHBvcnRpb24gdG8gZW5kIHdpdGggXFwnO1xcJycpO1xuICAgICAgaWYgKHN0YXRpY1ByZWZpeCAhPT0gbnVsbCkge1xuICAgICAgICAvLyBXZSB3YW50IHRvIG1ha2Ugc3VyZSB0aGF0IGZhbHN5IHZhbHVlcyBvZiBgdmFsdWVgIGJlY29tZSBlbXB0eSBzdHJpbmdzLlxuICAgICAgICB2YWx1ZSA9IGNvbmNhdFN0cmluZ3NXaXRoU3BhY2Uoc3RhdGljUHJlZml4LCB2YWx1ZSA/IHZhbHVlIDogJycpO1xuICAgICAgfVxuICAgICAgLy8gR2l2ZW4gYDxkaXYgW3N0eWxlXSBteS1kaXI+YCBzdWNoIHRoYXQgYG15LWRpcmAgaGFzIGBASW5wdXQoJ3N0eWxlJylgLlxuICAgICAgLy8gVGhpcyB0YWtlcyBvdmVyIHRoZSBgW3N0eWxlXWAgYmluZGluZy4gKFNhbWUgZm9yIGBbY2xhc3NdYClcbiAgICAgIHNldERpcmVjdGl2ZUlucHV0c1doaWNoU2hhZG93c1N0eWxpbmcodFZpZXcsIHROb2RlLCBsVmlldywgdmFsdWUsIGlzQ2xhc3NCYXNlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVwZGF0ZVN0eWxpbmdNYXAoXG4gICAgICAgICAgdFZpZXcsIHROb2RlLCBsVmlldywgbFZpZXdbUkVOREVSRVJdLCBsVmlld1tiaW5kaW5nSW5kZXggKyAxXSxcbiAgICAgICAgICBsVmlld1tiaW5kaW5nSW5kZXggKyAxXSA9IHRvU3R5bGluZ0tleVZhbHVlQXJyYXkoa2V5VmFsdWVBcnJheVNldCwgc3RyaW5nUGFyc2VyLCB2YWx1ZSksXG4gICAgICAgICAgaXNDbGFzc0Jhc2VkLCBiaW5kaW5nSW5kZXgpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hlbiB0aGUgYmluZGluZyBpcyBpbiBgaG9zdEJpbmRpbmdzYCBzZWN0aW9uXG4gKlxuICogQHBhcmFtIHRWaWV3IEN1cnJlbnQgYFRWaWV3YFxuICogQHBhcmFtIGJpbmRpbmdJbmRleCBpbmRleCBvZiBiaW5kaW5nIHdoaWNoIHdlIHdvdWxkIGxpa2UgaWYgaXQgaXMgaW4gYGhvc3RCaW5kaW5nc2BcbiAqL1xuZnVuY3Rpb24gaXNJbkhvc3RCaW5kaW5ncyh0VmlldzogVFZpZXcsIGJpbmRpbmdJbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIC8vIEFsbCBob3N0IGJpbmRpbmdzIGFyZSBwbGFjZWQgYWZ0ZXIgdGhlIGV4cGFuZG8gc2VjdGlvbi5cbiAgcmV0dXJuIGJpbmRpbmdJbmRleCA+PSB0Vmlldy5leHBhbmRvU3RhcnRJbmRleDtcbn1cblxuLyoqXG4qIENvbGxlY3RzIHRoZSBuZWNlc3NhcnkgaW5mb3JtYXRpb24gdG8gaW5zZXJ0IHRoZSBiaW5kaW5nIGludG8gYSBsaW5rZWQgbGlzdCBvZiBzdHlsZSBiaW5kaW5nc1xuKiB1c2luZyBgaW5zZXJ0VFN0eWxpbmdCaW5kaW5nYC5cbipcbiogQHBhcmFtIHRWaWV3IGBUVmlld2Agd2hlcmUgdGhlIGJpbmRpbmcgbGlua2VkIGxpc3Qgd2lsbCBiZSBzdG9yZWQuXG4qIEBwYXJhbSB0U3R5bGluZ0tleSBQcm9wZXJ0eS9rZXkgb2YgdGhlIGJpbmRpbmcuXG4qIEBwYXJhbSBiaW5kaW5nSW5kZXggSW5kZXggb2YgYmluZGluZyBhc3NvY2lhdGVkIHdpdGggdGhlIGBwcm9wYFxuKiBAcGFyYW0gaXNDbGFzc0Jhc2VkIGB0cnVlYCBpZiBgY2xhc3NgIGNoYW5nZSAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuKi9cbmZ1bmN0aW9uIHN0eWxpbmdGaXJzdFVwZGF0ZVBhc3MoXG4gICAgdFZpZXc6IFRWaWV3LCB0U3R5bGluZ0tleTogVFN0eWxpbmdLZXksIGJpbmRpbmdJbmRleDogbnVtYmVyLCBpc0NsYXNzQmFzZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydEZpcnN0VXBkYXRlUGFzcyh0Vmlldyk7XG4gIGNvbnN0IHREYXRhID0gdFZpZXcuZGF0YTtcbiAgaWYgKHREYXRhW2JpbmRpbmdJbmRleCArIDFdID09PSBudWxsKSB7XG4gICAgLy8gVGhlIGFib3ZlIGNoZWNrIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHdlIGRvbid0IGNsZWFyIGZpcnN0IHVwZGF0ZSBwYXNzIHVudGlsIGZpcnN0IHN1Y2Nlc3NmdWxcbiAgICAvLyAobm8gZXhjZXB0aW9uKSB0ZW1wbGF0ZSBleGVjdXRpb24uIFRoaXMgcHJldmVudHMgdGhlIHN0eWxpbmcgaW5zdHJ1Y3Rpb24gZnJvbSBkb3VibGUgYWRkaW5nXG4gICAgLy8gaXRzZWxmIHRvIHRoZSBsaXN0LlxuICAgIC8vIGBnZXRTZWxlY3RlZEluZGV4KClgIHNob3VsZCBiZSBoZXJlIChyYXRoZXIgdGhhbiBpbiBpbnN0cnVjdGlvbikgc28gdGhhdCBpdCBpcyBndWFyZGVkIGJ5IHRoZVxuICAgIC8vIGlmIHNvIGFzIG5vdCB0byByZWFkIHVubmVjZXNzYXJpbHkuXG4gICAgY29uc3QgdE5vZGUgPSB0RGF0YVtnZXRTZWxlY3RlZEluZGV4KCkgKyBIRUFERVJfT0ZGU0VUXSBhcyBUTm9kZTtcbiAgICBjb25zdCBpc0hvc3RCaW5kaW5ncyA9IGlzSW5Ib3N0QmluZGluZ3ModFZpZXcsIGJpbmRpbmdJbmRleCk7XG4gICAgaWYgKGhhc1N0eWxpbmdJbnB1dFNoYWRvdyh0Tm9kZSwgaXNDbGFzc0Jhc2VkKSAmJiB0U3R5bGluZ0tleSA9PT0gbnVsbCAmJiAhaXNIb3N0QmluZGluZ3MpIHtcbiAgICAgIC8vIGB0U3R5bGluZ0tleSA9PT0gbnVsbGAgaW1wbGllcyB0aGF0IHdlIGFyZSBlaXRoZXIgYFtzdHlsZV1gIG9yIGBbY2xhc3NdYCBiaW5kaW5nLlxuICAgICAgLy8gSWYgdGhlcmUgaXMgYSBkaXJlY3RpdmUgd2hpY2ggdXNlcyBgQElucHV0KCdzdHlsZScpYCBvciBgQElucHV0KCdjbGFzcycpYCB0aGFuXG4gICAgICAvLyB3ZSBuZWVkIHRvIG5ldXRyYWxpemUgdGhpcyBiaW5kaW5nIHNpbmNlIHRoYXQgZGlyZWN0aXZlIGlzIHNoYWRvd2luZyBpdC5cbiAgICAgIC8vIFdlIHR1cm4gdGhpcyBpbnRvIGEgbm9vcCBieSBzZXR0aW5nIHRoZSBrZXkgdG8gYGZhbHNlYFxuICAgICAgdFN0eWxpbmdLZXkgPSBmYWxzZTtcbiAgICB9XG4gICAgdFN0eWxpbmdLZXkgPSB3cmFwSW5TdGF0aWNTdHlsaW5nS2V5KHREYXRhLCB0Tm9kZSwgdFN0eWxpbmdLZXksIGlzQ2xhc3NCYXNlZCk7XG4gICAgaW5zZXJ0VFN0eWxpbmdCaW5kaW5nKHREYXRhLCB0Tm9kZSwgdFN0eWxpbmdLZXksIGJpbmRpbmdJbmRleCwgaXNIb3N0QmluZGluZ3MsIGlzQ2xhc3NCYXNlZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBZGRzIHN0YXRpYyBzdHlsaW5nIGluZm9ybWF0aW9uIHRvIHRoZSBiaW5kaW5nIGlmIGFwcGxpY2FibGUuXG4gKlxuICogVGhlIGxpbmtlZCBsaXN0IG9mIHN0eWxlcyBub3Qgb25seSBzdG9yZXMgdGhlIGxpc3QgYW5kIGtleXMsIGJ1dCBhbHNvIHN0b3JlcyBzdGF0aWMgc3R5bGluZ1xuICogaW5mb3JtYXRpb24gb24gc29tZSBvZiB0aGUga2V5cy4gVGhpcyBmdW5jdGlvbiBkZXRlcm1pbmVzIGlmIHRoZSBrZXkgc2hvdWxkIGNvbnRhaW4gdGhlIHN0eWxpbmdcbiAqIGluZm9ybWF0aW9uIGFuZCBjb21wdXRlcyBpdC5cbiAqXG4gKiBTZWUgYFRTdHlsaW5nU3RhdGljYCBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIEBwYXJhbSB0RGF0YSBgVERhdGFgIHdoZXJlIHRoZSBsaW5rZWQgbGlzdCBpcyBzdG9yZWQuXG4gKiBAcGFyYW0gdE5vZGUgYFROb2RlYCBmb3Igd2hpY2ggdGhlIHN0eWxpbmcgaXMgYmVpbmcgY29tcHV0ZWQuXG4gKiBAcGFyYW0gc3R5bGluZ0tleSBgVFN0eWxpbmdLZXlQcmltaXRpdmVgIHdoaWNoIG1heSBuZWVkIHRvIGJlIHdyYXBwZWQgaW50byBgVFN0eWxpbmdLZXlgXG4gKiBAcGFyYW0gaXNDbGFzc0Jhc2VkIGB0cnVlYCBpZiBgY2xhc3NgIChgZmFsc2VgIGlmIGBzdHlsZWApXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cmFwSW5TdGF0aWNTdHlsaW5nS2V5KFxuICAgIHREYXRhOiBURGF0YSwgdE5vZGU6IFROb2RlLCBzdHlsaW5nS2V5OiBUU3R5bGluZ0tleSwgaXNDbGFzc0Jhc2VkOiBib29sZWFuKTogVFN0eWxpbmdLZXkge1xuICBjb25zdCBob3N0RGlyZWN0aXZlRGVmID0gZ2V0SG9zdERpcmVjdGl2ZURlZih0RGF0YSk7XG4gIGxldCByZXNpZHVhbCA9IGlzQ2xhc3NCYXNlZCA/IHROb2RlLnJlc2lkdWFsQ2xhc3NlcyA6IHROb2RlLnJlc2lkdWFsU3R5bGVzO1xuICBpZiAoaG9zdERpcmVjdGl2ZURlZiA9PT0gbnVsbCkge1xuICAgIC8vIFdlIGFyZSBpbiB0ZW1wbGF0ZSBub2RlLlxuICAgIC8vIElmIHRlbXBsYXRlIG5vZGUgYWxyZWFkeSBoYWQgc3R5bGluZyBpbnN0cnVjdGlvbiB0aGVuIGl0IGhhcyBhbHJlYWR5IGNvbGxlY3RlZCB0aGUgc3RhdGljXG4gICAgLy8gc3R5bGluZyBhbmQgdGhlcmUgaXMgbm8gbmVlZCB0byBjb2xsZWN0IHRoZW0gYWdhaW4uIFdlIGtub3cgdGhhdCB3ZSBhcmUgdGhlIGZpcnN0IHN0eWxpbmdcbiAgICAvLyBpbnN0cnVjdGlvbiBiZWNhdXNlIHRoZSBgVE5vZGUuKkJpbmRpbmdzYCBwb2ludHMgdG8gMCAobm90aGluZyBoYXMgYmVlbiBpbnNlcnRlZCB5ZXQpLlxuICAgIGNvbnN0IGlzRmlyc3RTdHlsaW5nSW5zdHJ1Y3Rpb25JblRlbXBsYXRlID1cbiAgICAgICAgKGlzQ2xhc3NCYXNlZCA/IHROb2RlLmNsYXNzQmluZGluZ3MgOiB0Tm9kZS5zdHlsZUJpbmRpbmdzKSBhcyBhbnkgYXMgbnVtYmVyID09PSAwO1xuICAgIGlmIChpc0ZpcnN0U3R5bGluZ0luc3RydWN0aW9uSW5UZW1wbGF0ZSkge1xuICAgICAgLy8gSXQgd291bGQgYmUgbmljZSB0byBiZSBhYmxlIHRvIGdldCB0aGUgc3RhdGljcyBmcm9tIGBtZXJnZUF0dHJzYCwgaG93ZXZlciwgYXQgdGhpcyBwb2ludFxuICAgICAgLy8gdGhleSBhcmUgYWxyZWFkeSBtZXJnZWQgYW5kIGl0IHdvdWxkIG5vdCBiZSBwb3NzaWJsZSB0byBmaWd1cmUgd2hpY2ggcHJvcGVydHkgYmVsb25ncyB3aGVyZVxuICAgICAgLy8gaW4gdGhlIHByaW9yaXR5LlxuICAgICAgc3R5bGluZ0tleSA9IGNvbGxlY3RTdHlsaW5nRnJvbURpcmVjdGl2ZXMobnVsbCwgdERhdGEsIHROb2RlLCBzdHlsaW5nS2V5LCBpc0NsYXNzQmFzZWQpO1xuICAgICAgc3R5bGluZ0tleSA9IGNvbGxlY3RTdHlsaW5nRnJvbVRBdHRycyhzdHlsaW5nS2V5LCB0Tm9kZS5hdHRycywgaXNDbGFzc0Jhc2VkKTtcbiAgICAgIC8vIFdlIGtub3cgdGhhdCBpZiB3ZSBoYXZlIHN0eWxpbmcgYmluZGluZyBpbiB0ZW1wbGF0ZSB3ZSBjYW4ndCBoYXZlIHJlc2lkdWFsLlxuICAgICAgcmVzaWR1YWwgPSBudWxsO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBXZSBhcmUgaW4gaG9zdCBiaW5kaW5nIG5vZGUgYW5kIHRoZXJlIHdhcyBubyBiaW5kaW5nIGluc3RydWN0aW9uIGluIHRlbXBsYXRlIG5vZGUuXG4gICAgLy8gVGhpcyBtZWFucyB0aGF0IHdlIG5lZWQgdG8gY29tcHV0ZSB0aGUgcmVzaWR1YWwuXG4gICAgY29uc3QgZGlyZWN0aXZlU3R5bGluZ0xhc3QgPSB0Tm9kZS5kaXJlY3RpdmVTdHlsaW5nTGFzdDtcbiAgICBjb25zdCBpc0ZpcnN0U3R5bGluZ0luc3RydWN0aW9uSW5Ib3N0QmluZGluZyA9XG4gICAgICAgIGRpcmVjdGl2ZVN0eWxpbmdMYXN0ID09PSAtMSB8fCB0RGF0YVtkaXJlY3RpdmVTdHlsaW5nTGFzdF0gIT09IGhvc3REaXJlY3RpdmVEZWY7XG4gICAgaWYgKGlzRmlyc3RTdHlsaW5nSW5zdHJ1Y3Rpb25Jbkhvc3RCaW5kaW5nKSB7XG4gICAgICBzdHlsaW5nS2V5ID1cbiAgICAgICAgICBjb2xsZWN0U3R5bGluZ0Zyb21EaXJlY3RpdmVzKGhvc3REaXJlY3RpdmVEZWYsIHREYXRhLCB0Tm9kZSwgc3R5bGluZ0tleSwgaXNDbGFzc0Jhc2VkKTtcbiAgICAgIGlmIChyZXNpZHVhbCA9PT0gbnVsbCkge1xuICAgICAgICAvLyAtIElmIGBudWxsYCB0aGFuIGVpdGhlcjpcbiAgICAgICAgLy8gICAgLSBUZW1wbGF0ZSBzdHlsaW5nIGluc3RydWN0aW9uIGFscmVhZHkgcmFuIGFuZCBpdCBoYXMgY29uc3VtZWQgdGhlIHN0YXRpY1xuICAgICAgICAvLyAgICAgIHN0eWxpbmcgaW50byBpdHMgYFRTdHlsaW5nS2V5YCBhbmQgc28gdGhlcmUgaXMgbm8gbmVlZCB0byB1cGRhdGUgcmVzaWR1YWwuIEluc3RlYWRcbiAgICAgICAgLy8gICAgICB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgYFRTdHlsaW5nS2V5YCBhc3NvY2lhdGVkIHdpdGggdGhlIGZpcnN0IHRlbXBsYXRlIG5vZGVcbiAgICAgICAgLy8gICAgICBpbnN0cnVjdGlvbi4gT1JcbiAgICAgICAgLy8gICAgLSBTb21lIG90aGVyIHN0eWxpbmcgaW5zdHJ1Y3Rpb24gcmFuIGFuZCBkZXRlcm1pbmVkIHRoYXQgdGhlcmUgYXJlIG5vIHJlc2lkdWFsc1xuICAgICAgICBsZXQgdGVtcGxhdGVTdHlsaW5nS2V5ID0gZ2V0VGVtcGxhdGVIZWFkVFN0eWxpbmdLZXkodERhdGEsIHROb2RlLCBpc0NsYXNzQmFzZWQpO1xuICAgICAgICBpZiAodGVtcGxhdGVTdHlsaW5nS2V5ICE9PSB1bmRlZmluZWQgJiYgQXJyYXkuaXNBcnJheSh0ZW1wbGF0ZVN0eWxpbmdLZXkpKSB7XG4gICAgICAgICAgLy8gT25seSByZWNvbXB1dGUgaWYgYHRlbXBsYXRlU3R5bGluZ0tleWAgaGFkIHN0YXRpYyB2YWx1ZXMuIChJZiBubyBzdGF0aWMgdmFsdWUgZm91bmRcbiAgICAgICAgICAvLyB0aGVuIHRoZXJlIGlzIG5vdGhpbmcgdG8gZG8gc2luY2UgdGhpcyBvcGVyYXRpb24gY2FuIG9ubHkgcHJvZHVjZSBsZXNzIHN0YXRpYyBrZXlzLCBub3RcbiAgICAgICAgICAvLyBtb3JlLilcbiAgICAgICAgICB0ZW1wbGF0ZVN0eWxpbmdLZXkgPSBjb2xsZWN0U3R5bGluZ0Zyb21EaXJlY3RpdmVzKFxuICAgICAgICAgICAgICBudWxsLCB0RGF0YSwgdE5vZGUsIHRlbXBsYXRlU3R5bGluZ0tleVsxXSAvKiB1bndyYXAgcHJldmlvdXMgc3RhdGljcyAqLyxcbiAgICAgICAgICAgICAgaXNDbGFzc0Jhc2VkKTtcbiAgICAgICAgICB0ZW1wbGF0ZVN0eWxpbmdLZXkgPVxuICAgICAgICAgICAgICBjb2xsZWN0U3R5bGluZ0Zyb21UQXR0cnModGVtcGxhdGVTdHlsaW5nS2V5LCB0Tm9kZS5hdHRycywgaXNDbGFzc0Jhc2VkKTtcbiAgICAgICAgICBzZXRUZW1wbGF0ZUhlYWRUU3R5bGluZ0tleSh0RGF0YSwgdE5vZGUsIGlzQ2xhc3NCYXNlZCwgdGVtcGxhdGVTdHlsaW5nS2V5KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gV2Ugb25seSBuZWVkIHRvIHJlY29tcHV0ZSByZXNpZHVhbCBpZiBpdCBpcyBub3QgYG51bGxgLlxuICAgICAgICAvLyAtIElmIGV4aXN0aW5nIHJlc2lkdWFsIChpbXBsaWVzIHRoZXJlIHdhcyBubyB0ZW1wbGF0ZSBzdHlsaW5nKS4gVGhpcyBtZWFucyB0aGF0IHNvbWUgb2ZcbiAgICAgICAgLy8gICB0aGUgc3RhdGljcyBtYXkgaGF2ZSBtb3ZlZCBmcm9tIHRoZSByZXNpZHVhbCB0byB0aGUgYHN0eWxpbmdLZXlgIGFuZCBzbyB3ZSBoYXZlIHRvXG4gICAgICAgIC8vICAgcmVjb21wdXRlLlxuICAgICAgICAvLyAtIElmIGB1bmRlZmluZWRgIHRoaXMgaXMgdGhlIGZpcnN0IHRpbWUgd2UgYXJlIHJ1bm5pbmcuXG4gICAgICAgIHJlc2lkdWFsID0gY29sbGVjdFJlc2lkdWFsKHREYXRhLCB0Tm9kZSwgaXNDbGFzc0Jhc2VkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKHJlc2lkdWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICBpc0NsYXNzQmFzZWQgPyAodE5vZGUucmVzaWR1YWxDbGFzc2VzID0gcmVzaWR1YWwpIDogKHROb2RlLnJlc2lkdWFsU3R5bGVzID0gcmVzaWR1YWwpO1xuICB9XG4gIHJldHVybiBzdHlsaW5nS2V5O1xufVxuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBgVFN0eWxpbmdLZXlgIGZvciB0aGUgdGVtcGxhdGUgc3R5bGluZyBpbnN0cnVjdGlvbi5cbiAqXG4gKiBUaGlzIGlzIG5lZWRlZCBzaW5jZSBgaG9zdEJpbmRpbmdgIHN0eWxpbmcgaW5zdHJ1Y3Rpb25zIGFyZSBpbnNlcnRlZCBhZnRlciB0aGUgdGVtcGxhdGVcbiAqIGluc3RydWN0aW9uLiBXaGlsZSB0aGUgdGVtcGxhdGUgaW5zdHJ1Y3Rpb24gbmVlZHMgdG8gdXBkYXRlIHRoZSByZXNpZHVhbCBpbiBgVE5vZGVgIHRoZVxuICogYGhvc3RCaW5kaW5nYCBpbnN0cnVjdGlvbnMgbmVlZCB0byB1cGRhdGUgdGhlIGBUU3R5bGluZ0tleWAgb2YgdGhlIHRlbXBsYXRlIGluc3RydWN0aW9uIGJlY2F1c2VcbiAqIHRoZSB0ZW1wbGF0ZSBpbnN0cnVjdGlvbiBpcyBkb3duc3RyZWFtIGZyb20gdGhlIGBob3N0QmluZGluZ3NgIGluc3RydWN0aW9ucy5cbiAqXG4gKiBAcGFyYW0gdERhdGEgYFREYXRhYCB3aGVyZSB0aGUgbGlua2VkIGxpc3QgaXMgc3RvcmVkLlxuICogQHBhcmFtIHROb2RlIGBUTm9kZWAgZm9yIHdoaWNoIHRoZSBzdHlsaW5nIGlzIGJlaW5nIGNvbXB1dGVkLlxuICogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuICogQHJldHVybiBgVFN0eWxpbmdLZXlgIGlmIGZvdW5kIG9yIGB1bmRlZmluZWRgIGlmIG5vdCBmb3VuZC5cbiAqL1xuZnVuY3Rpb24gZ2V0VGVtcGxhdGVIZWFkVFN0eWxpbmdLZXkodERhdGE6IFREYXRhLCB0Tm9kZTogVE5vZGUsIGlzQ2xhc3NCYXNlZDogYm9vbGVhbik6IFRTdHlsaW5nS2V5fFxuICAgIHVuZGVmaW5lZCB7XG4gIGNvbnN0IGJpbmRpbmdzID0gaXNDbGFzc0Jhc2VkID8gdE5vZGUuY2xhc3NCaW5kaW5ncyA6IHROb2RlLnN0eWxlQmluZGluZ3M7XG4gIGlmIChnZXRUU3R5bGluZ1JhbmdlTmV4dChiaW5kaW5ncykgPT09IDApIHtcbiAgICAvLyBUaGVyZSBkb2VzIG5vdCBzZWVtIHRvIGJlIGEgc3R5bGluZyBpbnN0cnVjdGlvbiBpbiB0aGUgYHRlbXBsYXRlYC5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiB0RGF0YVtnZXRUU3R5bGluZ1JhbmdlUHJldihiaW5kaW5ncyldIGFzIFRTdHlsaW5nS2V5O1xufVxuXG4vKipcbiAqIFVwZGF0ZSB0aGUgYFRTdHlsaW5nS2V5YCBvZiB0aGUgZmlyc3QgdGVtcGxhdGUgaW5zdHJ1Y3Rpb24gaW4gYFROb2RlYC5cbiAqXG4gKiBMb2dpY2FsbHkgYGhvc3RCaW5kaW5nc2Agc3R5bGluZyBpbnN0cnVjdGlvbnMgYXJlIG9mIGxvd2VyIHByaW9yaXR5IHRoYW4gdGhhdCBvZiB0aGUgdGVtcGxhdGUuXG4gKiBIb3dldmVyLCB0aGV5IGV4ZWN1dGUgYWZ0ZXIgdGhlIHRlbXBsYXRlIHN0eWxpbmcgaW5zdHJ1Y3Rpb25zLiBUaGlzIG1lYW5zIHRoYXQgdGhleSBnZXQgaW5zZXJ0ZWRcbiAqIGluIGZyb250IG9mIHRoZSB0ZW1wbGF0ZSBzdHlsaW5nIGluc3RydWN0aW9ucy5cbiAqXG4gKiBJZiB3ZSBoYXZlIGEgdGVtcGxhdGUgc3R5bGluZyBpbnN0cnVjdGlvbiBhbmQgYSBuZXcgYGhvc3RCaW5kaW5nc2Agc3R5bGluZyBpbnN0cnVjdGlvbiBpc1xuICogZXhlY3V0ZWQgaXQgbWVhbnMgdGhhdCBpdCBtYXkgbmVlZCB0byBzdGVhbCBzdGF0aWMgZmllbGRzIGZyb20gdGhlIHRlbXBsYXRlIGluc3RydWN0aW9uLiBUaGlzXG4gKiBtZXRob2QgYWxsb3dzIHVzIHRvIHVwZGF0ZSB0aGUgZmlyc3QgdGVtcGxhdGUgaW5zdHJ1Y3Rpb24gYFRTdHlsaW5nS2V5YCB3aXRoIGEgbmV3IHZhbHVlLlxuICpcbiAqIEFzc3VtZTpcbiAqIGBgYFxuICogPGRpdiBteS1kaXIgc3R5bGU9XCJjb2xvcjogcmVkXCIgW3N0eWxlLmNvbG9yXT1cInRtcGxFeHBcIj48L2Rpdj5cbiAqXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgaG9zdDoge1xuICogICAgICdzdHlsZSc6ICd3aWR0aDogMTAwcHgnLFxuICogICAgICdbc3R5bGUuY29sb3JdJzogJ2RpckV4cCcsXG4gKiAgIH1cbiAqIH0pXG4gKiBjbGFzcyBNeURpciB7fVxuICogYGBgXG4gKlxuICogd2hlbiBgW3N0eWxlLmNvbG9yXT1cInRtcGxFeHBcImAgZXhlY3V0ZXMgaXQgY3JlYXRlcyB0aGlzIGRhdGEgc3RydWN0dXJlLlxuICogYGBgXG4gKiAgWycnLCAnY29sb3InLCAnY29sb3InLCAncmVkJywgJ3dpZHRoJywgJzEwMHB4J10sXG4gKiBgYGBcbiAqXG4gKiBUaGUgcmVhc29uIGZvciB0aGlzIGlzIHRoYXQgdGhlIHRlbXBsYXRlIGluc3RydWN0aW9uIGRvZXMgbm90IGtub3cgaWYgdGhlcmUgYXJlIHN0eWxpbmdcbiAqIGluc3RydWN0aW9ucyBhbmQgbXVzdCBhc3N1bWUgdGhhdCB0aGVyZSBhcmUgbm9uZSBhbmQgbXVzdCBjb2xsZWN0IGFsbCBvZiB0aGUgc3RhdGljIHN0eWxpbmcuXG4gKiAoYm90aFxuICogYGNvbG9yJyBhbmQgJ3dpZHRoYClcbiAqXG4gKiBXaGVuIGAnW3N0eWxlLmNvbG9yXSc6ICdkaXJFeHAnLGAgZXhlY3V0ZXMgd2UgbmVlZCB0byBpbnNlcnQgYSBuZXcgZGF0YSBpbnRvIHRoZSBsaW5rZWQgbGlzdC5cbiAqIGBgYFxuICogIFsnJywgJ2NvbG9yJywgJ3dpZHRoJywgJzEwMHB4J10sICAvLyBuZXdseSBpbnNlcnRlZFxuICogIFsnJywgJ2NvbG9yJywgJ2NvbG9yJywgJ3JlZCcsICd3aWR0aCcsICcxMDBweCddLCAvLyB0aGlzIGlzIHdyb25nXG4gKiBgYGBcbiAqXG4gKiBOb3RpY2UgdGhhdCB0aGUgdGVtcGxhdGUgc3RhdGljcyBpcyBub3cgd3JvbmcgYXMgaXQgaW5jb3JyZWN0bHkgY29udGFpbnMgYHdpZHRoYCBzbyB3ZSBuZWVkIHRvXG4gKiB1cGRhdGUgaXQgbGlrZSBzbzpcbiAqIGBgYFxuICogIFsnJywgJ2NvbG9yJywgJ3dpZHRoJywgJzEwMHB4J10sXG4gKiAgWycnLCAnY29sb3InLCAnY29sb3InLCAncmVkJ10sICAgIC8vIFVQREFURVxuICogYGBgXG4gKlxuICogQHBhcmFtIHREYXRhIGBURGF0YWAgd2hlcmUgdGhlIGxpbmtlZCBsaXN0IGlzIHN0b3JlZC5cbiAqIEBwYXJhbSB0Tm9kZSBgVE5vZGVgIGZvciB3aGljaCB0aGUgc3R5bGluZyBpcyBiZWluZyBjb21wdXRlZC5cbiAqIEBwYXJhbSBpc0NsYXNzQmFzZWQgYHRydWVgIGlmIGBjbGFzc2AgKGBmYWxzZWAgaWYgYHN0eWxlYClcbiAqIEBwYXJhbSB0U3R5bGluZ0tleSBOZXcgYFRTdHlsaW5nS2V5YCB3aGljaCBpcyByZXBsYWNpbmcgdGhlIG9sZCBvbmUuXG4gKi9cbmZ1bmN0aW9uIHNldFRlbXBsYXRlSGVhZFRTdHlsaW5nS2V5KFxuICAgIHREYXRhOiBURGF0YSwgdE5vZGU6IFROb2RlLCBpc0NsYXNzQmFzZWQ6IGJvb2xlYW4sIHRTdHlsaW5nS2V5OiBUU3R5bGluZ0tleSk6IHZvaWQge1xuICBjb25zdCBiaW5kaW5ncyA9IGlzQ2xhc3NCYXNlZCA/IHROb2RlLmNsYXNzQmluZGluZ3MgOiB0Tm9kZS5zdHlsZUJpbmRpbmdzO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Tm90RXF1YWwoXG4gICAgICAgICAgICAgICAgICAgZ2V0VFN0eWxpbmdSYW5nZU5leHQoYmluZGluZ3MpLCAwLFxuICAgICAgICAgICAgICAgICAgICdFeHBlY3RpbmcgdG8gaGF2ZSBhdCBsZWFzdCBvbmUgdGVtcGxhdGUgc3R5bGluZyBiaW5kaW5nLicpO1xuICB0RGF0YVtnZXRUU3R5bGluZ1JhbmdlUHJldihiaW5kaW5ncyldID0gdFN0eWxpbmdLZXk7XG59XG5cbi8qKlxuICogQ29sbGVjdCBhbGwgc3RhdGljIHZhbHVlcyBhZnRlciB0aGUgY3VycmVudCBgVE5vZGUuZGlyZWN0aXZlU3R5bGluZ0xhc3RgIGluZGV4LlxuICpcbiAqIENvbGxlY3QgdGhlIHJlbWFpbmluZyBzdHlsaW5nIGluZm9ybWF0aW9uIHdoaWNoIGhhcyBub3QgeWV0IGJlZW4gY29sbGVjdGVkIGJ5IGFuIGV4aXN0aW5nXG4gKiBzdHlsaW5nIGluc3RydWN0aW9uLlxuICpcbiAqIEBwYXJhbSB0RGF0YSBgVERhdGFgIHdoZXJlIHRoZSBgRGlyZWN0aXZlRGVmc2AgYXJlIHN0b3JlZC5cbiAqIEBwYXJhbSB0Tm9kZSBgVE5vZGVgIHdoaWNoIGNvbnRhaW5zIHRoZSBkaXJlY3RpdmUgcmFuZ2UuXG4gKiBAcGFyYW0gaXNDbGFzc0Jhc2VkIGB0cnVlYCBpZiBgY2xhc3NgIChgZmFsc2VgIGlmIGBzdHlsZWApXG4gKi9cbmZ1bmN0aW9uIGNvbGxlY3RSZXNpZHVhbCh0RGF0YTogVERhdGEsIHROb2RlOiBUTm9kZSwgaXNDbGFzc0Jhc2VkOiBib29sZWFuKTogS2V5VmFsdWVBcnJheTxhbnk+fFxuICAgIG51bGwge1xuICBsZXQgcmVzaWR1YWw6IEtleVZhbHVlQXJyYXk8YW55PnxudWxsfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgY29uc3QgZGlyZWN0aXZlRW5kID0gdE5vZGUuZGlyZWN0aXZlRW5kO1xuICBuZ0Rldk1vZGUgJiZcbiAgICAgIGFzc2VydE5vdEVxdWFsKFxuICAgICAgICAgIHROb2RlLmRpcmVjdGl2ZVN0eWxpbmdMYXN0LCAtMSxcbiAgICAgICAgICAnQnkgdGhlIHRpbWUgdGhpcyBmdW5jdGlvbiBnZXRzIGNhbGxlZCBhdCBsZWFzdCBvbmUgaG9zdEJpbmRpbmdzLW5vZGUgc3R5bGluZyBpbnN0cnVjdGlvbiBtdXN0IGhhdmUgZXhlY3V0ZWQuJyk7XG4gIC8vIFdlIGFkZCBgMSArIHROb2RlLmRpcmVjdGl2ZVN0YXJ0YCBiZWNhdXNlIHdlIG5lZWQgdG8gc2tpcCB0aGUgY3VycmVudCBkaXJlY3RpdmUgKGFzIHdlIGFyZVxuICAvLyBjb2xsZWN0aW5nIHRoaW5ncyBhZnRlciB0aGUgbGFzdCBgaG9zdEJpbmRpbmdzYCBkaXJlY3RpdmUgd2hpY2ggaGFkIGEgc3R5bGluZyBpbnN0cnVjdGlvbi4pXG4gIGZvciAobGV0IGkgPSAxICsgdE5vZGUuZGlyZWN0aXZlU3R5bGluZ0xhc3Q7IGkgPCBkaXJlY3RpdmVFbmQ7IGkrKykge1xuICAgIGNvbnN0IGF0dHJzID0gKHREYXRhW2ldIGFzIERpcmVjdGl2ZURlZjxhbnk+KS5ob3N0QXR0cnM7XG4gICAgcmVzaWR1YWwgPSBjb2xsZWN0U3R5bGluZ0Zyb21UQXR0cnMocmVzaWR1YWwsIGF0dHJzLCBpc0NsYXNzQmFzZWQpIGFzIEtleVZhbHVlQXJyYXk8YW55PnwgbnVsbDtcbiAgfVxuICByZXR1cm4gY29sbGVjdFN0eWxpbmdGcm9tVEF0dHJzKHJlc2lkdWFsLCB0Tm9kZS5hdHRycywgaXNDbGFzc0Jhc2VkKSBhcyBLZXlWYWx1ZUFycmF5PGFueT58IG51bGw7XG59XG5cbi8qKlxuICogQ29sbGVjdCB0aGUgc3RhdGljIHN0eWxpbmcgaW5mb3JtYXRpb24gd2l0aCBsb3dlciBwcmlvcml0eSB0aGFuIGBob3N0RGlyZWN0aXZlRGVmYC5cbiAqXG4gKiAoVGhpcyBpcyBvcHBvc2l0ZSBvZiByZXNpZHVhbCBzdHlsaW5nLilcbiAqXG4gKiBAcGFyYW0gaG9zdERpcmVjdGl2ZURlZiBgRGlyZWN0aXZlRGVmYCBmb3Igd2hpY2ggd2Ugd2FudCB0byBjb2xsZWN0IGxvd2VyIHByaW9yaXR5IHN0YXRpY1xuICogICAgICAgIHN0eWxpbmcuIChPciBgbnVsbGAgaWYgdGVtcGxhdGUgc3R5bGluZylcbiAqIEBwYXJhbSB0RGF0YSBgVERhdGFgIHdoZXJlIHRoZSBsaW5rZWQgbGlzdCBpcyBzdG9yZWQuXG4gKiBAcGFyYW0gdE5vZGUgYFROb2RlYCBmb3Igd2hpY2ggdGhlIHN0eWxpbmcgaXMgYmVpbmcgY29tcHV0ZWQuXG4gKiBAcGFyYW0gc3R5bGluZ0tleSBFeGlzdGluZyBgVFN0eWxpbmdLZXlgIHRvIHVwZGF0ZSBvciB3cmFwLlxuICogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuICovXG5mdW5jdGlvbiBjb2xsZWN0U3R5bGluZ0Zyb21EaXJlY3RpdmVzKFxuICAgIGhvc3REaXJlY3RpdmVEZWY6IERpcmVjdGl2ZURlZjxhbnk+fCBudWxsLCB0RGF0YTogVERhdGEsIHROb2RlOiBUTm9kZSwgc3R5bGluZ0tleTogVFN0eWxpbmdLZXksXG4gICAgaXNDbGFzc0Jhc2VkOiBib29sZWFuKTogVFN0eWxpbmdLZXkge1xuICAvLyBXZSBuZWVkIHRvIGxvb3AgYmVjYXVzZSB0aGVyZSBjYW4gYmUgZGlyZWN0aXZlcyB3aGljaCBoYXZlIGBob3N0QXR0cnNgIGJ1dCBkb24ndCBoYXZlXG4gIC8vIGBob3N0QmluZGluZ3NgIHNvIHRoaXMgbG9vcCBjYXRjaGVzIHVwIHRvIHRoZSBjdXJyZW50IGRpcmVjdGl2ZS4uXG4gIGxldCBjdXJyZW50RGlyZWN0aXZlOiBEaXJlY3RpdmVEZWY8YW55PnxudWxsID0gbnVsbDtcbiAgY29uc3QgZGlyZWN0aXZlRW5kID0gdE5vZGUuZGlyZWN0aXZlRW5kO1xuICBsZXQgZGlyZWN0aXZlU3R5bGluZ0xhc3QgPSB0Tm9kZS5kaXJlY3RpdmVTdHlsaW5nTGFzdDtcbiAgaWYgKGRpcmVjdGl2ZVN0eWxpbmdMYXN0ID09PSAtMSkge1xuICAgIGRpcmVjdGl2ZVN0eWxpbmdMYXN0ID0gdE5vZGUuZGlyZWN0aXZlU3RhcnQ7XG4gIH0gZWxzZSB7XG4gICAgZGlyZWN0aXZlU3R5bGluZ0xhc3QrKztcbiAgfVxuICB3aGlsZSAoZGlyZWN0aXZlU3R5bGluZ0xhc3QgPCBkaXJlY3RpdmVFbmQpIHtcbiAgICBjdXJyZW50RGlyZWN0aXZlID0gdERhdGFbZGlyZWN0aXZlU3R5bGluZ0xhc3RdIGFzIERpcmVjdGl2ZURlZjxhbnk+O1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKGN1cnJlbnREaXJlY3RpdmUsICdleHBlY3RlZCB0byBiZSBkZWZpbmVkJyk7XG4gICAgc3R5bGluZ0tleSA9IGNvbGxlY3RTdHlsaW5nRnJvbVRBdHRycyhzdHlsaW5nS2V5LCBjdXJyZW50RGlyZWN0aXZlLmhvc3RBdHRycywgaXNDbGFzc0Jhc2VkKTtcbiAgICBpZiAoY3VycmVudERpcmVjdGl2ZSA9PT0gaG9zdERpcmVjdGl2ZURlZikgYnJlYWs7XG4gICAgZGlyZWN0aXZlU3R5bGluZ0xhc3QrKztcbiAgfVxuICBpZiAoaG9zdERpcmVjdGl2ZURlZiAhPT0gbnVsbCkge1xuICAgIC8vIHdlIG9ubHkgYWR2YW5jZSB0aGUgc3R5bGluZyBjdXJzb3IgaWYgd2UgYXJlIGNvbGxlY3RpbmcgZGF0YSBmcm9tIGhvc3QgYmluZGluZ3MuXG4gICAgLy8gVGVtcGxhdGUgZXhlY3V0ZXMgYmVmb3JlIGhvc3QgYmluZGluZ3MgYW5kIHNvIGlmIHdlIHdvdWxkIHVwZGF0ZSB0aGUgaW5kZXgsXG4gICAgLy8gaG9zdCBiaW5kaW5ncyB3b3VsZCBub3QgZ2V0IHRoZWlyIHN0YXRpY3MuXG4gICAgdE5vZGUuZGlyZWN0aXZlU3R5bGluZ0xhc3QgPSBkaXJlY3RpdmVTdHlsaW5nTGFzdDtcbiAgfVxuICByZXR1cm4gc3R5bGluZ0tleTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGBUQXR0cnNgIGludG8gYFRTdHlsaW5nU3RhdGljYC5cbiAqXG4gKiBAcGFyYW0gc3R5bGluZ0tleSBleGlzdGluZyBgVFN0eWxpbmdLZXlgIHRvIHVwZGF0ZSBvciB3cmFwLlxuICogQHBhcmFtIGF0dHJzIGBUQXR0cmlidXRlc2AgdG8gcHJvY2Vzcy5cbiAqIEBwYXJhbSBpc0NsYXNzQmFzZWQgYHRydWVgIGlmIGBjbGFzc2AgKGBmYWxzZWAgaWYgYHN0eWxlYClcbiAqL1xuZnVuY3Rpb24gY29sbGVjdFN0eWxpbmdGcm9tVEF0dHJzKFxuICAgIHN0eWxpbmdLZXk6IFRTdHlsaW5nS2V5IHwgdW5kZWZpbmVkLCBhdHRyczogVEF0dHJpYnV0ZXMgfCBudWxsLFxuICAgIGlzQ2xhc3NCYXNlZDogYm9vbGVhbik6IFRTdHlsaW5nS2V5IHtcbiAgY29uc3QgZGVzaXJlZE1hcmtlciA9IGlzQ2xhc3NCYXNlZCA/IEF0dHJpYnV0ZU1hcmtlci5DbGFzc2VzIDogQXR0cmlidXRlTWFya2VyLlN0eWxlcztcbiAgbGV0IGN1cnJlbnRNYXJrZXIgPSBBdHRyaWJ1dGVNYXJrZXIuSW1wbGljaXRBdHRyaWJ1dGVzO1xuICBpZiAoYXR0cnMgIT09IG51bGwpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBpdGVtID0gYXR0cnNbaV0gYXMgbnVtYmVyIHwgc3RyaW5nO1xuICAgICAgaWYgKHR5cGVvZiBpdGVtID09PSAnbnVtYmVyJykge1xuICAgICAgICBjdXJyZW50TWFya2VyID0gaXRlbTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChjdXJyZW50TWFya2VyID09PSBkZXNpcmVkTWFya2VyKSB7XG4gICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHN0eWxpbmdLZXkpKSB7XG4gICAgICAgICAgICBzdHlsaW5nS2V5ID0gc3R5bGluZ0tleSA9PT0gdW5kZWZpbmVkID8gW10gOiBbJycsIHN0eWxpbmdLZXldIGFzIGFueTtcbiAgICAgICAgICB9XG4gICAgICAgICAga2V5VmFsdWVBcnJheVNldChcbiAgICAgICAgICAgICAgc3R5bGluZ0tleSBhcyBLZXlWYWx1ZUFycmF5PGFueT4sIGl0ZW0sIGlzQ2xhc3NCYXNlZCA/IHRydWUgOiBhdHRyc1srK2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gc3R5bGluZ0tleSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHN0eWxpbmdLZXk7XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGN1cnJlbnQgYERpcmVjdGl2ZURlZmAgd2hpY2ggaXMgYWN0aXZlIHdoZW4gYGhvc3RCaW5kaW5nc2Agc3R5bGUgaW5zdHJ1Y3Rpb24gaXNcbiAqIGJlaW5nIGV4ZWN1dGVkIChvciBgbnVsbGAgaWYgd2UgYXJlIGluIGB0ZW1wbGF0ZWAuKVxuICpcbiAqIEBwYXJhbSB0RGF0YSBDdXJyZW50IGBURGF0YWAgd2hlcmUgdGhlIGBEaXJlY3RpdmVEZWZgIHdpbGwgYmUgbG9va2VkIHVwIGF0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SG9zdERpcmVjdGl2ZURlZih0RGF0YTogVERhdGEpOiBEaXJlY3RpdmVEZWY8YW55PnxudWxsIHtcbiAgY29uc3QgY3VycmVudERpcmVjdGl2ZUluZGV4ID0gZ2V0Q3VycmVudERpcmVjdGl2ZUluZGV4KCk7XG4gIHJldHVybiBjdXJyZW50RGlyZWN0aXZlSW5kZXggPT09IC0xID8gbnVsbCA6IHREYXRhW2N1cnJlbnREaXJlY3RpdmVJbmRleF0gYXMgRGlyZWN0aXZlRGVmPGFueT47XG59XG5cbi8qKlxuICogQ29udmVydCB1c2VyIGlucHV0IHRvIGBLZXlWYWx1ZUFycmF5YC5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHRha2VzIHVzZXIgaW5wdXQgd2hpY2ggY291bGQgYmUgYHN0cmluZ2AsIE9iamVjdCBsaXRlcmFsLCBvciBpdGVyYWJsZSBhbmQgY29udmVydHNcbiAqIGl0IGludG8gYSBjb25zaXN0ZW50IHJlcHJlc2VudGF0aW9uLiBUaGUgb3V0cHV0IG9mIHRoaXMgaXMgYEtleVZhbHVlQXJyYXlgICh3aGljaCBpcyBhbiBhcnJheVxuICogd2hlcmVcbiAqIGV2ZW4gaW5kZXhlcyBjb250YWluIGtleXMgYW5kIG9kZCBpbmRleGVzIGNvbnRhaW4gdmFsdWVzIGZvciB0aG9zZSBrZXlzKS5cbiAqXG4gKiBUaGUgYWR2YW50YWdlIG9mIGNvbnZlcnRpbmcgdG8gYEtleVZhbHVlQXJyYXlgIGlzIHRoYXQgd2UgY2FuIHBlcmZvcm0gZGlmZiBpbiBhbiBpbnB1dFxuICogaW5kZXBlbmRlbnRcbiAqIHdheS5cbiAqIChpZSB3ZSBjYW4gY29tcGFyZSBgZm9vIGJhcmAgdG8gYFsnYmFyJywgJ2JheiddIGFuZCBkZXRlcm1pbmUgYSBzZXQgb2YgY2hhbmdlcyB3aGljaCBuZWVkIHRvIGJlXG4gKiBhcHBsaWVkKVxuICpcbiAqIFRoZSBmYWN0IHRoYXQgYEtleVZhbHVlQXJyYXlgIGlzIHNvcnRlZCBpcyB2ZXJ5IGltcG9ydGFudCBiZWNhdXNlIGl0IGFsbG93cyB1cyB0byBjb21wdXRlIHRoZVxuICogZGlmZmVyZW5jZSBpbiBsaW5lYXIgZmFzaGlvbiB3aXRob3V0IHRoZSBuZWVkIHRvIGFsbG9jYXRlIGFueSBhZGRpdGlvbmFsIGRhdGEuXG4gKlxuICogRm9yIGV4YW1wbGUgaWYgd2Uga2VwdCB0aGlzIGFzIGEgYE1hcGAgd2Ugd291bGQgaGF2ZSB0byBpdGVyYXRlIG92ZXIgcHJldmlvdXMgYE1hcGAgdG8gZGV0ZXJtaW5lXG4gKiB3aGljaCB2YWx1ZXMgbmVlZCB0byBiZSBkZWxldGVkLCBvdmVyIHRoZSBuZXcgYE1hcGAgdG8gZGV0ZXJtaW5lIGFkZGl0aW9ucywgYW5kIHdlIHdvdWxkIGhhdmUgdG9cbiAqIGtlZXAgYWRkaXRpb25hbCBgTWFwYCB0byBrZWVwIHRyYWNrIG9mIGR1cGxpY2F0ZXMgb3IgaXRlbXMgd2hpY2ggaGF2ZSBub3QgeWV0IGJlZW4gdmlzaXRlZC5cbiAqXG4gKiBAcGFyYW0ga2V5VmFsdWVBcnJheVNldCAoU2VlIGBrZXlWYWx1ZUFycmF5U2V0YCBpbiBcInV0aWwvYXJyYXlfdXRpbHNcIikgR2V0cyBwYXNzZWQgaW4gYXMgYVxuICogZnVuY3Rpb24gc28gdGhhdFxuICogICAgICAgIGBzdHlsZWAgY2FuIHBhc3MgaW4gdmVyc2lvbiB3aGljaCBkb2VzIHNhbml0aXphdGlvbi4gVGhpcyBpcyBkb25lIGZvciB0cmVlIHNoYWtpbmdcbiAqICAgICAgICBwdXJwb3Nlcy5cbiAqIEBwYXJhbSBzdHJpbmdQYXJzZXIgVGhlIHBhcnNlciBpcyBwYXNzZWQgaW4gc28gdGhhdCBpdCB3aWxsIGJlIHRyZWUgc2hha2FibGUuIFNlZVxuICogICAgICAgIGBzdHlsZVN0cmluZ1BhcnNlcmAgYW5kIGBjbGFzc1N0cmluZ1BhcnNlcmBcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gcGFyc2UvY29udmVydCB0byBgS2V5VmFsdWVBcnJheWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvU3R5bGluZ0tleVZhbHVlQXJyYXkoXG4gICAga2V5VmFsdWVBcnJheVNldDogKGtleVZhbHVlQXJyYXk6IEtleVZhbHVlQXJyYXk8YW55Piwga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpID0+IHZvaWQsXG4gICAgc3RyaW5nUGFyc2VyOiAoc3R5bGVLZXlWYWx1ZUFycmF5OiBLZXlWYWx1ZUFycmF5PGFueT4sIHRleHQ6IHN0cmluZykgPT4gdm9pZCxcbiAgICB2YWx1ZTogc3RyaW5nfHN0cmluZ1tdfHtba2V5OiBzdHJpbmddOiBhbnl9fFNhZmVWYWx1ZXxudWxsfHVuZGVmaW5lZCk6IEtleVZhbHVlQXJyYXk8YW55PiB7XG4gIGlmICh2YWx1ZSA9PSBudWxsIC8qfHwgdmFsdWUgPT09IHVuZGVmaW5lZCAqLyB8fCB2YWx1ZSA9PT0gJycpIHJldHVybiBFTVBUWV9BUlJBWSBhcyBhbnk7XG4gIGNvbnN0IHN0eWxlS2V5VmFsdWVBcnJheTogS2V5VmFsdWVBcnJheTxhbnk+ID0gW10gYXMgYW55O1xuICBjb25zdCB1bndyYXBwZWRWYWx1ZSA9IHVud3JhcFNhZmVWYWx1ZSh2YWx1ZSkgYXMgc3RyaW5nIHwgc3RyaW5nW10gfCB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgaWYgKEFycmF5LmlzQXJyYXkodW53cmFwcGVkVmFsdWUpKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1bndyYXBwZWRWYWx1ZS5sZW5ndGg7IGkrKykge1xuICAgICAga2V5VmFsdWVBcnJheVNldChzdHlsZUtleVZhbHVlQXJyYXksIHVud3JhcHBlZFZhbHVlW2ldLCB0cnVlKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHVud3JhcHBlZFZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgIGZvciAoY29uc3Qga2V5IGluIHVud3JhcHBlZFZhbHVlKSB7XG4gICAgICBpZiAodW53cmFwcGVkVmFsdWUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBrZXlWYWx1ZUFycmF5U2V0KHN0eWxlS2V5VmFsdWVBcnJheSwga2V5LCB1bndyYXBwZWRWYWx1ZVtrZXldKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHVud3JhcHBlZFZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHN0cmluZ1BhcnNlcihzdHlsZUtleVZhbHVlQXJyYXksIHVud3JhcHBlZFZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgdGhyb3dFcnJvcignVW5zdXBwb3J0ZWQgc3R5bGluZyB0eXBlICcgKyB0eXBlb2YgdW53cmFwcGVkVmFsdWUgKyAnOiAnICsgdW53cmFwcGVkVmFsdWUpO1xuICB9XG4gIHJldHVybiBzdHlsZUtleVZhbHVlQXJyYXk7XG59XG5cbi8qKlxuICogU2V0IGEgYHZhbHVlYCBmb3IgYSBga2V5YCB0YWtpbmcgc3R5bGUgc2FuaXRpemF0aW9uIGludG8gYWNjb3VudC5cbiAqXG4gKiBTZWU6IGBrZXlWYWx1ZUFycmF5U2V0YCBmb3IgZGV0YWlsc1xuICpcbiAqIEBwYXJhbSBrZXlWYWx1ZUFycmF5IEtleVZhbHVlQXJyYXkgdG8gYWRkIHRvLlxuICogQHBhcmFtIGtleSBTdHlsZSBrZXkgdG8gYWRkLiAoVGhpcyBrZXkgd2lsbCBiZSBjaGVja2VkIGlmIGl0IG5lZWRzIHNhbml0aXphdGlvbilcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0IChJZiBrZXkgbmVlZHMgc2FuaXRpemF0aW9uIGl0IHdpbGwgYmUgc2FuaXRpemVkKVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3R5bGVLZXlWYWx1ZUFycmF5U2V0KGtleVZhbHVlQXJyYXk6IEtleVZhbHVlQXJyYXk8YW55Piwga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgaWYgKHN0eWxlUHJvcE5lZWRzU2FuaXRpemF0aW9uKGtleSkpIHtcbiAgICB2YWx1ZSA9IMm1ybVzYW5pdGl6ZVN0eWxlKHZhbHVlKTtcbiAgfVxuICBrZXlWYWx1ZUFycmF5U2V0KGtleVZhbHVlQXJyYXksIGtleSwgdmFsdWUpO1xufVxuXG4vKipcbiAqIFVwZGF0ZSBtYXAgYmFzZWQgc3R5bGluZy5cbiAqXG4gKiBNYXAgYmFzZWQgc3R5bGluZyBjb3VsZCBiZSBhbnl0aGluZyB3aGljaCBjb250YWlucyBtb3JlIHRoYW4gb25lIGJpbmRpbmcuIEZvciBleGFtcGxlIGBzdHJpbmdgLFxuICogb3Igb2JqZWN0IGxpdGVyYWwuIERlYWxpbmcgd2l0aCBhbGwgb2YgdGhlc2UgdHlwZXMgd291bGQgY29tcGxpY2F0ZSB0aGUgbG9naWMgc29cbiAqIGluc3RlYWQgdGhpcyBmdW5jdGlvbiBleHBlY3RzIHRoYXQgdGhlIGNvbXBsZXggaW5wdXQgaXMgZmlyc3QgY29udmVydGVkIGludG8gbm9ybWFsaXplZFxuICogYEtleVZhbHVlQXJyYXlgLiBUaGUgYWR2YW50YWdlIG9mIG5vcm1hbGl6YXRpb24gaXMgdGhhdCB3ZSBnZXQgdGhlIHZhbHVlcyBzb3J0ZWQsIHdoaWNoIG1ha2VzIGl0XG4gKiB2ZXJ5IGNoZWFwIHRvIGNvbXB1dGUgZGVsdGFzIGJldHdlZW4gdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50IHZhbHVlLlxuICpcbiAqIEBwYXJhbSB0VmlldyBBc3NvY2lhdGVkIGBUVmlldy5kYXRhYCBjb250YWlucyB0aGUgbGlua2VkIGxpc3Qgb2YgYmluZGluZyBwcmlvcml0aWVzLlxuICogQHBhcmFtIHROb2RlIGBUTm9kZWAgd2hlcmUgdGhlIGJpbmRpbmcgaXMgbG9jYXRlZC5cbiAqIEBwYXJhbSBsVmlldyBgTFZpZXdgIGNvbnRhaW5zIHRoZSB2YWx1ZXMgYXNzb2NpYXRlZCB3aXRoIG90aGVyIHN0eWxpbmcgYmluZGluZyBhdCB0aGlzIGBUTm9kZWAuXG4gKiBAcGFyYW0gcmVuZGVyZXIgUmVuZGVyZXIgdG8gdXNlIGlmIGFueSB1cGRhdGVzLlxuICogQHBhcmFtIG9sZEtleVZhbHVlQXJyYXkgUHJldmlvdXMgdmFsdWUgcmVwcmVzZW50ZWQgYXMgYEtleVZhbHVlQXJyYXlgXG4gKiBAcGFyYW0gbmV3S2V5VmFsdWVBcnJheSBDdXJyZW50IHZhbHVlIHJlcHJlc2VudGVkIGFzIGBLZXlWYWx1ZUFycmF5YFxuICogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuICogQHBhcmFtIGJpbmRpbmdJbmRleCBCaW5kaW5nIGluZGV4IG9mIHRoZSBiaW5kaW5nLlxuICovXG5mdW5jdGlvbiB1cGRhdGVTdHlsaW5nTWFwKFxuICAgIHRWaWV3OiBUVmlldywgdE5vZGU6IFROb2RlLCBsVmlldzogTFZpZXcsIHJlbmRlcmVyOiBSZW5kZXJlcjMsXG4gICAgb2xkS2V5VmFsdWVBcnJheTogS2V5VmFsdWVBcnJheTxhbnk+LCBuZXdLZXlWYWx1ZUFycmF5OiBLZXlWYWx1ZUFycmF5PGFueT4sXG4gICAgaXNDbGFzc0Jhc2VkOiBib29sZWFuLCBiaW5kaW5nSW5kZXg6IG51bWJlcikge1xuICBpZiAob2xkS2V5VmFsdWVBcnJheSBhcyBLZXlWYWx1ZUFycmF5PGFueT58IE5PX0NIQU5HRSA9PT0gTk9fQ0hBTkdFKSB7XG4gICAgLy8gT24gZmlyc3QgZXhlY3V0aW9uIHRoZSBvbGRLZXlWYWx1ZUFycmF5IGlzIE5PX0NIQU5HRSA9PiB0cmVhdCBpdCBhcyBlbXB0eSBLZXlWYWx1ZUFycmF5LlxuICAgIG9sZEtleVZhbHVlQXJyYXkgPSBFTVBUWV9BUlJBWSBhcyBhbnk7XG4gIH1cbiAgbGV0IG9sZEluZGV4ID0gMDtcbiAgbGV0IG5ld0luZGV4ID0gMDtcbiAgbGV0IG9sZEtleTogc3RyaW5nfG51bGwgPSAwIDwgb2xkS2V5VmFsdWVBcnJheS5sZW5ndGggPyBvbGRLZXlWYWx1ZUFycmF5WzBdIDogbnVsbDtcbiAgbGV0IG5ld0tleTogc3RyaW5nfG51bGwgPSAwIDwgbmV3S2V5VmFsdWVBcnJheS5sZW5ndGggPyBuZXdLZXlWYWx1ZUFycmF5WzBdIDogbnVsbDtcbiAgd2hpbGUgKG9sZEtleSAhPT0gbnVsbCB8fCBuZXdLZXkgIT09IG51bGwpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0TGVzc1RoYW4ob2xkSW5kZXgsIDk5OSwgJ0FyZSB3ZSBzdHVjayBpbiBpbmZpbml0ZSBsb29wPycpO1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRMZXNzVGhhbihuZXdJbmRleCwgOTk5LCAnQXJlIHdlIHN0dWNrIGluIGluZmluaXRlIGxvb3A/Jyk7XG4gICAgY29uc3Qgb2xkVmFsdWUgPVxuICAgICAgICBvbGRJbmRleCA8IG9sZEtleVZhbHVlQXJyYXkubGVuZ3RoID8gb2xkS2V5VmFsdWVBcnJheVtvbGRJbmRleCArIDFdIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IG5ld1ZhbHVlID1cbiAgICAgICAgbmV3SW5kZXggPCBuZXdLZXlWYWx1ZUFycmF5Lmxlbmd0aCA/IG5ld0tleVZhbHVlQXJyYXlbbmV3SW5kZXggKyAxXSA6IHVuZGVmaW5lZDtcbiAgICBsZXQgc2V0S2V5OiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gICAgbGV0IHNldFZhbHVlOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgaWYgKG9sZEtleSA9PT0gbmV3S2V5KSB7XG4gICAgICAvLyBVUERBVEU6IEtleXMgYXJlIGVxdWFsID0+IG5ldyB2YWx1ZSBpcyBvdmVyd3JpdGluZyBvbGQgdmFsdWUuXG4gICAgICBvbGRJbmRleCArPSAyO1xuICAgICAgbmV3SW5kZXggKz0gMjtcbiAgICAgIGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgc2V0S2V5ID0gbmV3S2V5O1xuICAgICAgICBzZXRWYWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobmV3S2V5ID09PSBudWxsIHx8IG9sZEtleSAhPT0gbnVsbCAmJiBvbGRLZXkgPCBuZXdLZXkgISkge1xuICAgICAgLy8gREVMRVRFOiBvbGRLZXkga2V5IGlzIG1pc3Npbmcgb3Igd2UgZGlkIG5vdCBmaW5kIHRoZSBvbGRLZXkgaW4gdGhlIG5ld1ZhbHVlXG4gICAgICAvLyAoYmVjYXVzZSB0aGUga2V5VmFsdWVBcnJheSBpcyBzb3J0ZWQgYW5kIGBuZXdLZXlgIGlzIGZvdW5kIGxhdGVyIGFscGhhYmV0aWNhbGx5KS5cbiAgICAgIC8vIGBcImJhY2tncm91bmRcIiA8IFwiY29sb3JcImAgc28gd2UgbmVlZCB0byBkZWxldGUgYFwiYmFja2dyb3VuZFwiYCBiZWNhdXNlIGl0IGlzIG5vdCBmb3VuZCBpbiB0aGVcbiAgICAgIC8vIG5ldyBhcnJheS5cbiAgICAgIG9sZEluZGV4ICs9IDI7XG4gICAgICBzZXRLZXkgPSBvbGRLZXk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENSRUFURTogbmV3S2V5J3MgaXMgZWFybGllciBhbHBoYWJldGljYWxseSB0aGFuIG9sZEtleSdzIChvciBubyBvbGRLZXkpID0+IHdlIGhhdmUgbmV3IGtleS5cbiAgICAgIC8vIGBcImNvbG9yXCIgPiBcImJhY2tncm91bmRcImAgc28gd2UgbmVlZCB0byBhZGQgYGNvbG9yYCBiZWNhdXNlIGl0IGlzIGluIG5ldyBhcnJheSBidXQgbm90IGluXG4gICAgICAvLyBvbGQgYXJyYXkuXG4gICAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChuZXdLZXksICdFeHBlY3RpbmcgdG8gaGF2ZSBhIHZhbGlkIGtleScpO1xuICAgICAgbmV3SW5kZXggKz0gMjtcbiAgICAgIHNldEtleSA9IG5ld0tleTtcbiAgICAgIHNldFZhbHVlID0gbmV3VmFsdWU7XG4gICAgfVxuICAgIGlmIChzZXRLZXkgIT09IG51bGwpIHtcbiAgICAgIHVwZGF0ZVN0eWxpbmcodFZpZXcsIHROb2RlLCBsVmlldywgcmVuZGVyZXIsIHNldEtleSwgc2V0VmFsdWUsIGlzQ2xhc3NCYXNlZCwgYmluZGluZ0luZGV4KTtcbiAgICB9XG4gICAgb2xkS2V5ID0gb2xkSW5kZXggPCBvbGRLZXlWYWx1ZUFycmF5Lmxlbmd0aCA/IG9sZEtleVZhbHVlQXJyYXlbb2xkSW5kZXhdIDogbnVsbDtcbiAgICBuZXdLZXkgPSBuZXdJbmRleCA8IG5ld0tleVZhbHVlQXJyYXkubGVuZ3RoID8gbmV3S2V5VmFsdWVBcnJheVtuZXdJbmRleF0gOiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogVXBkYXRlIGEgc2ltcGxlIChwcm9wZXJ0eSBuYW1lKSBzdHlsaW5nLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gdGFrZXMgYHByb3BgIGFuZCB1cGRhdGVzIHRoZSBET00gdG8gdGhhdCB2YWx1ZS4gVGhlIGZ1bmN0aW9uIHRha2VzIHRoZSBiaW5kaW5nXG4gKiB2YWx1ZSBhcyB3ZWxsIGFzIGJpbmRpbmcgcHJpb3JpdHkgaW50byBjb25zaWRlcmF0aW9uIHRvIGRldGVybWluZSB3aGljaCB2YWx1ZSBzaG91bGQgYmUgd3JpdHRlblxuICogdG8gRE9NLiAoRm9yIGV4YW1wbGUgaXQgbWF5IGJlIGRldGVybWluZWQgdGhhdCB0aGVyZSBpcyBhIGhpZ2hlciBwcmlvcml0eSBvdmVyd3JpdGUgd2hpY2ggYmxvY2tzXG4gKiB0aGUgRE9NIHdyaXRlLCBvciBpZiB0aGUgdmFsdWUgZ29lcyB0byBgdW5kZWZpbmVkYCBhIGxvd2VyIHByaW9yaXR5IG92ZXJ3cml0ZSBtYXkgYmUgY29uc3VsdGVkLilcbiAqXG4gKiBAcGFyYW0gdFZpZXcgQXNzb2NpYXRlZCBgVFZpZXcuZGF0YWAgY29udGFpbnMgdGhlIGxpbmtlZCBsaXN0IG9mIGJpbmRpbmcgcHJpb3JpdGllcy5cbiAqIEBwYXJhbSB0Tm9kZSBgVE5vZGVgIHdoZXJlIHRoZSBiaW5kaW5nIGlzIGxvY2F0ZWQuXG4gKiBAcGFyYW0gbFZpZXcgYExWaWV3YCBjb250YWlucyB0aGUgdmFsdWVzIGFzc29jaWF0ZWQgd2l0aCBvdGhlciBzdHlsaW5nIGJpbmRpbmcgYXQgdGhpcyBgVE5vZGVgLlxuICogQHBhcmFtIHJlbmRlcmVyIFJlbmRlcmVyIHRvIHVzZSBpZiBhbnkgdXBkYXRlcy5cbiAqIEBwYXJhbSBwcm9wIEVpdGhlciBzdHlsZSBwcm9wZXJ0eSBuYW1lIG9yIGEgY2xhc3MgbmFtZS5cbiAqIEBwYXJhbSB2YWx1ZSBFaXRoZXIgc3R5bGUgdmFsdWUgZm9yIGBwcm9wYCBvciBgdHJ1ZWAvYGZhbHNlYCBpZiBgcHJvcGAgaXMgY2xhc3MuXG4gKiBAcGFyYW0gaXNDbGFzc0Jhc2VkIGB0cnVlYCBpZiBgY2xhc3NgIChgZmFsc2VgIGlmIGBzdHlsZWApXG4gKiBAcGFyYW0gYmluZGluZ0luZGV4IEJpbmRpbmcgaW5kZXggb2YgdGhlIGJpbmRpbmcuXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZVN0eWxpbmcoXG4gICAgdFZpZXc6IFRWaWV3LCB0Tm9kZTogVE5vZGUsIGxWaWV3OiBMVmlldywgcmVuZGVyZXI6IFJlbmRlcmVyMywgcHJvcDogc3RyaW5nLFxuICAgIHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsIHwgYm9vbGVhbiwgaXNDbGFzc0Jhc2VkOiBib29sZWFuLCBiaW5kaW5nSW5kZXg6IG51bWJlcikge1xuICBpZiAodE5vZGUudHlwZSAhPT0gVE5vZGVUeXBlLkVsZW1lbnQpIHtcbiAgICAvLyBJdCBpcyBwb3NzaWJsZSB0byBoYXZlIHN0eWxpbmcgb24gbm9uLWVsZW1lbnRzIChzdWNoIGFzIG5nLWNvbnRhaW5lcikuXG4gICAgLy8gVGhpcyBpcyByYXJlLCBidXQgaXQgZG9lcyBoYXBwZW4uIEluIHN1Y2ggYSBjYXNlLCBqdXN0IGlnbm9yZSB0aGUgYmluZGluZy5cbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgdERhdGEgPSB0Vmlldy5kYXRhO1xuICBjb25zdCB0UmFuZ2UgPSB0RGF0YVtiaW5kaW5nSW5kZXggKyAxXSBhcyBUU3R5bGluZ1JhbmdlO1xuICBjb25zdCBoaWdoZXJQcmlvcml0eVZhbHVlID0gZ2V0VFN0eWxpbmdSYW5nZU5leHREdXBsaWNhdGUodFJhbmdlKSA/XG4gICAgICBmaW5kU3R5bGluZ1ZhbHVlKHREYXRhLCB0Tm9kZSwgbFZpZXcsIHByb3AsIGdldFRTdHlsaW5nUmFuZ2VOZXh0KHRSYW5nZSksIGlzQ2xhc3NCYXNlZCkgOlxuICAgICAgdW5kZWZpbmVkO1xuICBpZiAoIWlzU3R5bGluZ1ZhbHVlUHJlc2VudChoaWdoZXJQcmlvcml0eVZhbHVlKSkge1xuICAgIC8vIFdlIGRvbid0IGhhdmUgYSBuZXh0IGR1cGxpY2F0ZSwgb3Igd2UgZGlkIG5vdCBmaW5kIGEgZHVwbGljYXRlIHZhbHVlLlxuICAgIGlmICghaXNTdHlsaW5nVmFsdWVQcmVzZW50KHZhbHVlKSkge1xuICAgICAgLy8gV2Ugc2hvdWxkIGRlbGV0ZSBjdXJyZW50IHZhbHVlIG9yIHJlc3RvcmUgdG8gbG93ZXIgcHJpb3JpdHkgdmFsdWUuXG4gICAgICBpZiAoZ2V0VFN0eWxpbmdSYW5nZVByZXZEdXBsaWNhdGUodFJhbmdlKSkge1xuICAgICAgICAvLyBXZSBoYXZlIGEgcG9zc2libGUgcHJldiBkdXBsaWNhdGUsIGxldCdzIHJldHJpZXZlIGl0LlxuICAgICAgICB2YWx1ZSA9IGZpbmRTdHlsaW5nVmFsdWUodERhdGEsIG51bGwsIGxWaWV3LCBwcm9wLCBiaW5kaW5nSW5kZXgsIGlzQ2xhc3NCYXNlZCk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJOb2RlID0gZ2V0TmF0aXZlQnlJbmRleChnZXRTZWxlY3RlZEluZGV4KCksIGxWaWV3KSBhcyBSRWxlbWVudDtcbiAgICBhcHBseVN0eWxpbmcocmVuZGVyZXIsIGlzQ2xhc3NCYXNlZCwgck5vZGUsIHByb3AsIHZhbHVlKTtcbiAgfVxufVxuXG4vKipcbiAqIFNlYXJjaCBmb3Igc3R5bGluZyB2YWx1ZSB3aXRoIGhpZ2hlciBwcmlvcml0eSB3aGljaCBpcyBvdmVyd3JpdGluZyBjdXJyZW50IHZhbHVlLCBvciBhXG4gKiB2YWx1ZSBvZiBsb3dlciBwcmlvcml0eSB0byB3aGljaCB3ZSBzaG91bGQgZmFsbCBiYWNrIGlmIHRoZSB2YWx1ZSBpcyBgdW5kZWZpbmVkYC5cbiAqXG4gKiBXaGVuIHZhbHVlIGlzIGJlaW5nIGFwcGxpZWQgYXQgYSBsb2NhdGlvbiwgcmVsYXRlZCB2YWx1ZXMgbmVlZCB0byBiZSBjb25zdWx0ZWQuXG4gKiAtIElmIHRoZXJlIGlzIGEgaGlnaGVyIHByaW9yaXR5IGJpbmRpbmcsIHdlIHNob3VsZCBiZSB1c2luZyB0aGF0IG9uZSBpbnN0ZWFkLlxuICogICBGb3IgZXhhbXBsZSBgPGRpdiAgW3N0eWxlXT1cIntjb2xvcjpleHAxfVwiIFtzdHlsZS5jb2xvcl09XCJleHAyXCI+YCBjaGFuZ2UgdG8gYGV4cDFgXG4gKiAgIHJlcXVpcmVzIHRoYXQgd2UgY2hlY2sgYGV4cDJgIHRvIHNlZSBpZiBpdCBpcyBzZXQgdG8gdmFsdWUgb3RoZXIgdGhhbiBgdW5kZWZpbmVkYC5cbiAqIC0gSWYgdGhlcmUgaXMgYSBsb3dlciBwcmlvcml0eSBiaW5kaW5nIGFuZCB3ZSBhcmUgY2hhbmdpbmcgdG8gYHVuZGVmaW5lZGBcbiAqICAgRm9yIGV4YW1wbGUgYDxkaXYgIFtzdHlsZV09XCJ7Y29sb3I6ZXhwMX1cIiBbc3R5bGUuY29sb3JdPVwiZXhwMlwiPmAgY2hhbmdlIHRvIGBleHAyYCB0b1xuICogICBgdW5kZWZpbmVkYCByZXF1aXJlcyB0aGF0IHdlIGNoZWNrIGBleHAxYCAoYW5kIHN0YXRpYyB2YWx1ZXMpIGFuZCB1c2UgdGhhdCBhcyBuZXcgdmFsdWUuXG4gKlxuICogTk9URTogVGhlIHN0eWxpbmcgc3RvcmVzIHR3byB2YWx1ZXMuXG4gKiAxLiBUaGUgcmF3IHZhbHVlIHdoaWNoIGNhbWUgZnJvbSB0aGUgYXBwbGljYXRpb24gaXMgc3RvcmVkIGF0IGBpbmRleCArIDBgIGxvY2F0aW9uLiAoVGhpcyB2YWx1ZVxuICogICAgaXMgdXNlZCBmb3IgZGlydHkgY2hlY2tpbmcpLlxuICogMi4gVGhlIG5vcm1hbGl6ZWQgdmFsdWUgKGNvbnZlcnRlZCB0byBgS2V5VmFsdWVBcnJheWAgaWYgbWFwIGFuZCBzYW5pdGl6ZWQpIGlzIHN0b3JlZCBhdCBgaW5kZXggK1xuICogMWAuXG4gKiAgICBUaGUgYWR2YW50YWdlIG9mIHN0b3JpbmcgdGhlIHNhbml0aXplZCB2YWx1ZSBpcyB0aGF0IG9uY2UgdGhlIHZhbHVlIGlzIHdyaXR0ZW4gd2UgZG9uJ3QgbmVlZFxuICogICAgdG8gd29ycnkgYWJvdXQgc2FuaXRpemluZyBpdCBsYXRlciBvciBrZWVwaW5nIHRyYWNrIG9mIHRoZSBzYW5pdGl6ZXIuXG4gKlxuICogQHBhcmFtIHREYXRhIGBURGF0YWAgdXNlZCBmb3IgdHJhdmVyc2luZyB0aGUgcHJpb3JpdHkuXG4gKiBAcGFyYW0gdE5vZGUgYFROb2RlYCB0byB1c2UgZm9yIHJlc29sdmluZyBzdGF0aWMgc3R5bGluZy4gQWxzbyBjb250cm9scyBzZWFyY2ggZGlyZWN0aW9uLlxuICogICAtIGBUTm9kZWAgc2VhcmNoIG5leHQgYW5kIHF1aXQgYXMgc29vbiBhcyBgaXNTdHlsaW5nVmFsdWVQcmVzZW50KHZhbHVlKWAgaXMgdHJ1ZS5cbiAqICAgICAgSWYgbm8gdmFsdWUgZm91bmQgY29uc3VsdCBgdE5vZGUucmVzaWR1YWxTdHlsZWAvYHROb2RlLnJlc2lkdWFsQ2xhc3NgIGZvciBkZWZhdWx0IHZhbHVlLlxuICogICAtIGBudWxsYCBzZWFyY2ggcHJldiBhbmQgZ28gYWxsIHRoZSB3YXkgdG8gZW5kLiBSZXR1cm4gbGFzdCB2YWx1ZSB3aGVyZVxuICogICAgIGBpc1N0eWxpbmdWYWx1ZVByZXNlbnQodmFsdWUpYCBpcyB0cnVlLlxuICogQHBhcmFtIGxWaWV3IGBMVmlld2AgdXNlZCBmb3IgcmV0cmlldmluZyB0aGUgYWN0dWFsIHZhbHVlcy5cbiAqIEBwYXJhbSBwcm9wIFByb3BlcnR5IHdoaWNoIHdlIGFyZSBpbnRlcmVzdGVkIGluLlxuICogQHBhcmFtIGluZGV4IFN0YXJ0aW5nIGluZGV4IGluIHRoZSBsaW5rZWQgbGlzdCBvZiBzdHlsaW5nIGJpbmRpbmdzIHdoZXJlIHRoZSBzZWFyY2ggc2hvdWxkIHN0YXJ0LlxuICogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuICovXG5mdW5jdGlvbiBmaW5kU3R5bGluZ1ZhbHVlKFxuICAgIHREYXRhOiBURGF0YSwgdE5vZGU6IFROb2RlIHwgbnVsbCwgbFZpZXc6IExWaWV3LCBwcm9wOiBzdHJpbmcsIGluZGV4OiBudW1iZXIsXG4gICAgaXNDbGFzc0Jhc2VkOiBib29sZWFuKTogYW55IHtcbiAgLy8gYFROb2RlYCB0byB1c2UgZm9yIHJlc29sdmluZyBzdGF0aWMgc3R5bGluZy4gQWxzbyBjb250cm9scyBzZWFyY2ggZGlyZWN0aW9uLlxuICAvLyAgIC0gYFROb2RlYCBzZWFyY2ggbmV4dCBhbmQgcXVpdCBhcyBzb29uIGFzIGBpc1N0eWxpbmdWYWx1ZVByZXNlbnQodmFsdWUpYCBpcyB0cnVlLlxuICAvLyAgICAgIElmIG5vIHZhbHVlIGZvdW5kIGNvbnN1bHQgYHROb2RlLnJlc2lkdWFsU3R5bGVgL2B0Tm9kZS5yZXNpZHVhbENsYXNzYCBmb3IgZGVmYXVsdCB2YWx1ZS5cbiAgLy8gICAtIGBudWxsYCBzZWFyY2ggcHJldiBhbmQgZ28gYWxsIHRoZSB3YXkgdG8gZW5kLiBSZXR1cm4gbGFzdCB2YWx1ZSB3aGVyZVxuICAvLyAgICAgYGlzU3R5bGluZ1ZhbHVlUHJlc2VudCh2YWx1ZSlgIGlzIHRydWUuXG4gIGNvbnN0IGlzUHJldkRpcmVjdGlvbiA9IHROb2RlID09PSBudWxsO1xuICBsZXQgdmFsdWU6IGFueSA9IHVuZGVmaW5lZDtcbiAgd2hpbGUgKGluZGV4ID4gMCkge1xuICAgIGNvbnN0IHJhd0tleSA9IHREYXRhW2luZGV4XSBhcyBUU3R5bGluZ0tleTtcbiAgICBjb25zdCBjb250YWluc1N0YXRpY3MgPSBBcnJheS5pc0FycmF5KHJhd0tleSk7XG4gICAgLy8gVW53cmFwIHRoZSBrZXkgaWYgd2UgY29udGFpbiBzdGF0aWMgdmFsdWVzLlxuICAgIGNvbnN0IGtleSA9IGNvbnRhaW5zU3RhdGljcyA/IChyYXdLZXkgYXMgc3RyaW5nW10pWzFdIDogcmF3S2V5O1xuICAgIGNvbnN0IGlzU3R5bGluZ01hcCA9IGtleSA9PT0gbnVsbDtcbiAgICBsZXQgdmFsdWVBdExWaWV3SW5kZXggPSBsVmlld1tpbmRleCArIDFdO1xuICAgIGlmICh2YWx1ZUF0TFZpZXdJbmRleCA9PT0gTk9fQ0hBTkdFKSB7XG4gICAgICAvLyBJbiBmaXJzdFVwZGF0ZVBhc3MgdGhlIHN0eWxpbmcgaW5zdHJ1Y3Rpb25zIGNyZWF0ZSBhIGxpbmtlZCBsaXN0IG9mIHN0eWxpbmcuXG4gICAgICAvLyBPbiBzdWJzZXF1ZW50IHBhc3NlcyBpdCBpcyBwb3NzaWJsZSBmb3IgYSBzdHlsaW5nIGluc3RydWN0aW9uIHRvIHRyeSB0byByZWFkIGEgYmluZGluZ1xuICAgICAgLy8gd2hpY2hcbiAgICAgIC8vIGhhcyBub3QgeWV0IGV4ZWN1dGVkLiBJbiB0aGF0IGNhc2Ugd2Ugd2lsbCBmaW5kIGBOT19DSEFOR0VgIGFuZCB3ZSBzaG91bGQgYXNzdW1lIHRoYXRcbiAgICAgIC8vIHdlIGhhdmUgYHVuZGVmaW5lZGAgKG9yIGVtcHR5IGFycmF5IGluIGNhc2Ugb2Ygc3R5bGluZy1tYXAgaW5zdHJ1Y3Rpb24pIGluc3RlYWQuIFRoaXNcbiAgICAgIC8vIGFsbG93cyB0aGUgcmVzb2x1dGlvbiB0byBhcHBseSB0aGUgdmFsdWUgKHdoaWNoIG1heSBsYXRlciBiZSBvdmVyd3JpdHRlbiB3aGVuIHRoZVxuICAgICAgLy8gYmluZGluZyBhY3R1YWxseSBleGVjdXRlcy4pXG4gICAgICB2YWx1ZUF0TFZpZXdJbmRleCA9IGlzU3R5bGluZ01hcCA/IEVNUFRZX0FSUkFZIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBsZXQgY3VycmVudFZhbHVlID0gaXNTdHlsaW5nTWFwID8ga2V5VmFsdWVBcnJheUdldCh2YWx1ZUF0TFZpZXdJbmRleCwgcHJvcCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXkgPT09IHByb3AgPyB2YWx1ZUF0TFZpZXdJbmRleCA6IHVuZGVmaW5lZDtcbiAgICBpZiAoY29udGFpbnNTdGF0aWNzICYmICFpc1N0eWxpbmdWYWx1ZVByZXNlbnQoY3VycmVudFZhbHVlKSkge1xuICAgICAgY3VycmVudFZhbHVlID0ga2V5VmFsdWVBcnJheUdldChyYXdLZXkgYXMgS2V5VmFsdWVBcnJheTxhbnk+LCBwcm9wKTtcbiAgICB9XG4gICAgaWYgKGlzU3R5bGluZ1ZhbHVlUHJlc2VudChjdXJyZW50VmFsdWUpKSB7XG4gICAgICB2YWx1ZSA9IGN1cnJlbnRWYWx1ZTtcbiAgICAgIGlmIChpc1ByZXZEaXJlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB0UmFuZ2UgPSB0RGF0YVtpbmRleCArIDFdIGFzIFRTdHlsaW5nUmFuZ2U7XG4gICAgaW5kZXggPSBpc1ByZXZEaXJlY3Rpb24gPyBnZXRUU3R5bGluZ1JhbmdlUHJldih0UmFuZ2UpIDogZ2V0VFN0eWxpbmdSYW5nZU5leHQodFJhbmdlKTtcbiAgfVxuICBpZiAodE5vZGUgIT09IG51bGwpIHtcbiAgICAvLyBpbiBjYXNlIHdoZXJlIHdlIGFyZSBnb2luZyBpbiBuZXh0IGRpcmVjdGlvbiBBTkQgd2UgZGlkIG5vdCBmaW5kIGFueXRoaW5nLCB3ZSBuZWVkIHRvXG4gICAgLy8gY29uc3VsdCByZXNpZHVhbCBzdHlsaW5nXG4gICAgbGV0IHJlc2lkdWFsID0gaXNDbGFzc0Jhc2VkID8gdE5vZGUucmVzaWR1YWxDbGFzc2VzIDogdE5vZGUucmVzaWR1YWxTdHlsZXM7XG4gICAgaWYgKHJlc2lkdWFsICE9IG51bGwgLyoqIE9SIHJlc2lkdWFsICE9PT0gdW5kZWZpbmVkICovKSB7XG4gICAgICB2YWx1ZSA9IGtleVZhbHVlQXJyYXlHZXQocmVzaWR1YWwgISwgcHJvcCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHRoZSBiaW5kaW5nIHZhbHVlIHNob3VsZCBiZSB1c2VkIChvciBpZiB0aGUgdmFsdWUgaXMgJ3VuZGVmaW5lZCcgYW5kIGhlbmNlIHByaW9yaXR5XG4gKiByZXNvbHV0aW9uIHNob3VsZCBiZSB1c2VkLilcbiAqXG4gKiBAcGFyYW0gdmFsdWUgQmluZGluZyBzdHlsZSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gaXNTdHlsaW5nVmFsdWVQcmVzZW50KHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgLy8gQ3VycmVudGx5IG9ubHkgYHVuZGVmaW5lZGAgdmFsdWUgaXMgY29uc2lkZXJlZCBub24tYmluZGluZy4gVGhhdCBpcyBgdW5kZWZpbmVkYCBzYXlzIEkgZG9uJ3RcbiAgLy8gaGF2ZSBhbiBvcGluaW9uIGFzIHRvIHdoYXQgdGhpcyBiaW5kaW5nIHNob3VsZCBiZSBhbmQgeW91IHNob3VsZCBjb25zdWx0IG90aGVyIGJpbmRpbmdzIGJ5XG4gIC8vIHByaW9yaXR5IHRvIGRldGVybWluZSB0aGUgdmFsaWQgdmFsdWUuXG4gIC8vIFRoaXMgaXMgZXh0cmFjdGVkIGludG8gYSBzaW5nbGUgZnVuY3Rpb24gc28gdGhhdCB3ZSBoYXZlIGEgc2luZ2xlIHBsYWNlIHRvIGNvbnRyb2wgdGhpcy5cbiAgcmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogU2FuaXRpemVzIG9yIGFkZHMgc3VmZml4IHRvIHRoZSB2YWx1ZS5cbiAqXG4gKiBJZiB2YWx1ZSBpcyBgbnVsbGAvYHVuZGVmaW5lZGAgbm8gc3VmZml4IGlzIGFkZGVkXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEBwYXJhbSBzdWZmaXhPclNhbml0aXplclxuICovXG5mdW5jdGlvbiBub3JtYWxpemVBbmRBcHBseVN1ZmZpeE9yU2FuaXRpemVyKFxuICAgIHZhbHVlOiBhbnksIHN1ZmZpeE9yU2FuaXRpemVyOiBTYW5pdGl6ZXJGbiB8IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwpOiBzdHJpbmd8bnVsbHx1bmRlZmluZWR8XG4gICAgYm9vbGVhbiB7XG4gIGlmICh2YWx1ZSA9PSBudWxsIC8qKiB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkICovKSB7XG4gICAgLy8gZG8gbm90aGluZ1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzdWZmaXhPclNhbml0aXplciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIHNhbml0aXplIHRoZSB2YWx1ZS5cbiAgICB2YWx1ZSA9IHN1ZmZpeE9yU2FuaXRpemVyKHZhbHVlKTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygc3VmZml4T3JTYW5pdGl6ZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZSArIHN1ZmZpeE9yU2FuaXRpemVyO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICB2YWx1ZSA9IHN0cmluZ2lmeSh1bndyYXBTYWZlVmFsdWUodmFsdWUpKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cblxuLyoqXG4gKiBUZXN0cyBpZiB0aGUgYFROb2RlYCBoYXMgaW5wdXQgc2hhZG93LlxuICpcbiAqIEFuIGlucHV0IHNoYWRvdyBpcyB3aGVuIGEgZGlyZWN0aXZlIHN0ZWFscyAoc2hhZG93cykgdGhlIGlucHV0IGJ5IHVzaW5nIGBASW5wdXQoJ3N0eWxlJylgIG9yXG4gKiBgQElucHV0KCdjbGFzcycpYCBhcyBpbnB1dC5cbiAqXG4gKiBAcGFyYW0gdE5vZGUgYFROb2RlYCB3aGljaCB3ZSB3b3VsZCBsaWtlIHRvIHNlZSBpZiBpdCBoYXMgc2hhZG93LlxuICogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzU3R5bGluZ0lucHV0U2hhZG93KHROb2RlOiBUTm9kZSwgaXNDbGFzc0Jhc2VkOiBib29sZWFuKSB7XG4gIHJldHVybiAodE5vZGUuZmxhZ3MgJiAoaXNDbGFzc0Jhc2VkID8gVE5vZGVGbGFncy5oYXNDbGFzc0lucHV0IDogVE5vZGVGbGFncy5oYXNTdHlsZUlucHV0KSkgIT09IDA7XG59XG4iXX0=