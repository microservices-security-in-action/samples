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
 * @param sanitizerFn The sanitization function that will be used to
 *       process style prop/value entries.
 *
 * @codeGenApi
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
 * @param prop A valid CSS property.
 * @param value New value to write (`null` or an empty string to remove).
 * @param suffix Optional suffix. Used with scalar values to add unit such as `px`.
 *        Note that when a suffix is provided then the underlying sanitizer will
 *        be ignored.
 *
 * Note that this will apply the provided style value to the host element if this function is called
 * within a host binding function.
 *
 * @codeGenApi
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
 * @param prop A valid CSS class (only one).
 * @param value A true/false value which will turn the class on or off.
 *
 * Note that this will apply the provided class value to the host element if this function
 * is called within a host binding function.
 *
 * @codeGenApi
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
 * @param styles A key/value style map of the styles that will be applied to the given element.
 *        Any missing styles (that have already been applied to the element beforehand) will be
 *        removed (unset) from the element's styling.
 *
 * Note that this will apply the provided styleMap value to the host element if this function
 * is called within a host binding.
 *
 * @codeGenApi
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
 * @param keyValueArray KeyValueArray to add parsed values to.
 * @param text text to parse.
 */
export function styleStringParser(keyValueArray, text) {
    for (var i = parseStyle(text); i >= 0; i = parseStyleNext(text, i)) {
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
 * @param classes A key/value map or string of CSS classes that will be added to the
 *        given element. Any missing classes (that have already been applied to the element
 *        beforehand) will be removed (unset) from the element's list of CSS classes.
 *
 * @codeGenApi
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
 * @param keyValueArray KeyValueArray to add parsed values to.
 * @param text text to parse.
 */
export function classStringParser(keyValueArray, text) {
    for (var i = parseClassName(text); i >= 0; i = parseClassNameNext(text, i)) {
        keyValueArraySet(keyValueArray, getLastParsedKey(text), true);
    }
}
/**
 * Common code between `ɵɵclassProp` and `ɵɵstyleProp`.
 *
 * @param prop property name.
 * @param value binding value.
 * @param suffixOrSanitizer suffix or sanitization function
 * @param isClassBased `true` if `class` change (`false` if `style`)
 */
export function checkStylingProperty(prop, value, suffixOrSanitizer, isClassBased) {
    var lView = getLView();
    var tView = getTView();
    // Styling instructions use 2 slots per binding.
    // 1. one for the value / TStylingKey
    // 2. one for the intermittent-value / TStylingRange
    var bindingIndex = incrementBindingIndex(2);
    if (tView.firstUpdatePass) {
        stylingFirstUpdatePass(tView, prop, bindingIndex, isClassBased);
    }
    if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
        // This is a work around. Once PR#34480 lands the sanitizer is passed explicitly and this line
        // can be removed.
        var styleSanitizer = void 0;
        if (suffixOrSanitizer == null) {
            if (styleSanitizer = getCurrentStyleSanitizer()) {
                suffixOrSanitizer = styleSanitizer;
            }
        }
        var tNode = tView.data[getSelectedIndex() + HEADER_OFFSET];
        updateStyling(tView, tNode, lView, lView[RENDERER], prop, lView[bindingIndex + 1] = normalizeAndApplySuffixOrSanitizer(value, suffixOrSanitizer), isClassBased, bindingIndex);
    }
}
/**
 * Common code between `ɵɵclassMap` and `ɵɵstyleMap`.
 *
 * @param keyValueArraySet (See `keyValueArraySet` in "util/array_utils") Gets passed in as a
 * function so that
 *        `style` can pass in version which does sanitization. This is done for tree shaking
 *        purposes.
 * @param stringParser Parser used to parse `value` if `string`. (Passed in as `style` and `class`
 *        have different parsers.)
 * @param value bound value from application
 * @param isClassBased `true` if `class` change (`false` if `style`)
 */
export function checkStylingMap(keyValueArraySet, stringParser, value, isClassBased) {
    var tView = getTView();
    var bindingIndex = incrementBindingIndex(2);
    if (tView.firstUpdatePass) {
        stylingFirstUpdatePass(tView, null, bindingIndex, isClassBased);
    }
    var lView = getLView();
    if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
        // `getSelectedIndex()` should be here (rather than in instruction) so that it is guarded by the
        // if so as not to read unnecessarily.
        var tNode = tView.data[getSelectedIndex() + HEADER_OFFSET];
        if (hasStylingInputShadow(tNode, isClassBased) && !isInHostBindings(tView, bindingIndex)) {
            if (ngDevMode) {
                // verify that if we are shadowing then `TData` is appropriately marked so that we skip
                // processing this binding in styling resolution.
                var tStylingKey = tView.data[bindingIndex];
                assertEqual(Array.isArray(tStylingKey) ? tStylingKey[1] : tStylingKey, false, 'Styling linked list shadow input should be marked as \'false\'');
            }
            // VE does not concatenate the static portion like we are doing here.
            // Instead VE just ignores the static completely if dynamic binding is present.
            // Because of locality we have already set the static portion because we don't know if there
            // is a dynamic portion until later. If we would ignore the static portion it would look like
            // the binding has removed it. This would confuse `[ngStyle]`/`[ngClass]` to do the wrong
            // thing as it would think that the static portion was removed. For this reason we
            // concatenate it so that `[ngStyle]`/`[ngClass]`  can continue to work on changed.
            var staticPrefix = isClassBased ? tNode.classes : tNode.styles;
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
 * @param tView Current `TView`
 * @param bindingIndex index of binding which we would like if it is in `hostBindings`
 */
function isInHostBindings(tView, bindingIndex) {
    // All host bindings are placed after the expando section.
    return bindingIndex >= tView.expandoStartIndex;
}
/**
* Collects the necessary information to insert the binding into a linked list of style bindings
* using `insertTStylingBinding`.
*
* @param tView `TView` where the binding linked list will be stored.
* @param tStylingKey Property/key of the binding.
* @param bindingIndex Index of binding associated with the `prop`
* @param isClassBased `true` if `class` change (`false` if `style`)
*/
function stylingFirstUpdatePass(tView, tStylingKey, bindingIndex, isClassBased) {
    ngDevMode && assertFirstUpdatePass(tView);
    var tData = tView.data;
    if (tData[bindingIndex + 1] === null) {
        // The above check is necessary because we don't clear first update pass until first successful
        // (no exception) template execution. This prevents the styling instruction from double adding
        // itself to the list.
        // `getSelectedIndex()` should be here (rather than in instruction) so that it is guarded by the
        // if so as not to read unnecessarily.
        var tNode = tData[getSelectedIndex() + HEADER_OFFSET];
        var isHostBindings = isInHostBindings(tView, bindingIndex);
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
 * @param tData `TData` where the linked list is stored.
 * @param tNode `TNode` for which the styling is being computed.
 * @param stylingKey `TStylingKeyPrimitive` which may need to be wrapped into `TStylingKey`
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
export function wrapInStaticStylingKey(tData, tNode, stylingKey, isClassBased) {
    var hostDirectiveDef = getHostDirectiveDef(tData);
    var residual = isClassBased ? tNode.residualClasses : tNode.residualStyles;
    if (hostDirectiveDef === null) {
        // We are in template node.
        // If template node already had styling instruction then it has already collected the static
        // styling and there is no need to collect them again. We know that we are the first styling
        // instruction because the `TNode.*Bindings` points to 0 (nothing has been inserted yet).
        var isFirstStylingInstructionInTemplate = (isClassBased ? tNode.classBindings : tNode.styleBindings) === 0;
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
        var directiveStylingLast = tNode.directiveStylingLast;
        var isFirstStylingInstructionInHostBinding = directiveStylingLast === -1 || tData[directiveStylingLast] !== hostDirectiveDef;
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
                var templateStylingKey = getTemplateHeadTStylingKey(tData, tNode, isClassBased);
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
 * @param tData `TData` where the linked list is stored.
 * @param tNode `TNode` for which the styling is being computed.
 * @param isClassBased `true` if `class` (`false` if `style`)
 * @return `TStylingKey` if found or `undefined` if not found.
 */
function getTemplateHeadTStylingKey(tData, tNode, isClassBased) {
    var bindings = isClassBased ? tNode.classBindings : tNode.styleBindings;
    if (getTStylingRangeNext(bindings) === 0) {
        // There does not seem to be a styling instruction in the `template`.
        return undefined;
    }
    return tData[getTStylingRangePrev(bindings)];
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
 * @Directive({
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
 * @param tData `TData` where the linked list is stored.
 * @param tNode `TNode` for which the styling is being computed.
 * @param isClassBased `true` if `class` (`false` if `style`)
 * @param tStylingKey New `TStylingKey` which is replacing the old one.
 */
function setTemplateHeadTStylingKey(tData, tNode, isClassBased, tStylingKey) {
    var bindings = isClassBased ? tNode.classBindings : tNode.styleBindings;
    ngDevMode && assertNotEqual(getTStylingRangeNext(bindings), 0, 'Expecting to have at least one template styling binding.');
    tData[getTStylingRangePrev(bindings)] = tStylingKey;
}
/**
 * Collect all static values after the current `TNode.directiveStylingLast` index.
 *
 * Collect the remaining styling information which has not yet been collected by an existing
 * styling instruction.
 *
 * @param tData `TData` where the `DirectiveDefs` are stored.
 * @param tNode `TNode` which contains the directive range.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
function collectResidual(tData, tNode, isClassBased) {
    var residual = undefined;
    var directiveEnd = tNode.directiveEnd;
    ngDevMode &&
        assertNotEqual(tNode.directiveStylingLast, -1, 'By the time this function gets called at least one hostBindings-node styling instruction must have executed.');
    // We add `1 + tNode.directiveStart` because we need to skip the current directive (as we are
    // collecting things after the last `hostBindings` directive which had a styling instruction.)
    for (var i = 1 + tNode.directiveStylingLast; i < directiveEnd; i++) {
        var attrs = tData[i].hostAttrs;
        residual = collectStylingFromTAttrs(residual, attrs, isClassBased);
    }
    return collectStylingFromTAttrs(residual, tNode.attrs, isClassBased);
}
/**
 * Collect the static styling information with lower priority than `hostDirectiveDef`.
 *
 * (This is opposite of residual styling.)
 *
 * @param hostDirectiveDef `DirectiveDef` for which we want to collect lower priority static
 *        styling. (Or `null` if template styling)
 * @param tData `TData` where the linked list is stored.
 * @param tNode `TNode` for which the styling is being computed.
 * @param stylingKey Existing `TStylingKey` to update or wrap.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
function collectStylingFromDirectives(hostDirectiveDef, tData, tNode, stylingKey, isClassBased) {
    // We need to loop because there can be directives which have `hostAttrs` but don't have
    // `hostBindings` so this loop catches up to the current directive..
    var currentDirective = null;
    var directiveEnd = tNode.directiveEnd;
    var directiveStylingLast = tNode.directiveStylingLast;
    if (directiveStylingLast === -1) {
        directiveStylingLast = tNode.directiveStart;
    }
    else {
        directiveStylingLast++;
    }
    while (directiveStylingLast < directiveEnd) {
        currentDirective = tData[directiveStylingLast];
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
 * @param stylingKey existing `TStylingKey` to update or wrap.
 * @param attrs `TAttributes` to process.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
function collectStylingFromTAttrs(stylingKey, attrs, isClassBased) {
    var desiredMarker = isClassBased ? 1 /* Classes */ : 2 /* Styles */;
    var currentMarker = -1 /* ImplicitAttributes */;
    if (attrs !== null) {
        for (var i = 0; i < attrs.length; i++) {
            var item = attrs[i];
            if (typeof item === 'number') {
                currentMarker = item;
            }
            else {
                if (currentMarker === desiredMarker) {
                    if (!Array.isArray(stylingKey)) {
                        stylingKey = stylingKey === undefined ? [] : ['', stylingKey];
                    }
                    keyValueArraySet(stylingKey, item, isClassBased ? true : attrs[++i]);
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
 * @param tData Current `TData` where the `DirectiveDef` will be looked up at.
 */
export function getHostDirectiveDef(tData) {
    var currentDirectiveIndex = getCurrentDirectiveIndex();
    return currentDirectiveIndex === -1 ? null : tData[currentDirectiveIndex];
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
 * @param keyValueArraySet (See `keyValueArraySet` in "util/array_utils") Gets passed in as a
 * function so that
 *        `style` can pass in version which does sanitization. This is done for tree shaking
 *        purposes.
 * @param stringParser The parser is passed in so that it will be tree shakable. See
 *        `styleStringParser` and `classStringParser`
 * @param value The value to parse/convert to `KeyValueArray`
 */
export function toStylingKeyValueArray(keyValueArraySet, stringParser, value) {
    if (value == null /*|| value === undefined */ || value === '')
        return EMPTY_ARRAY;
    var styleKeyValueArray = [];
    var unwrappedValue = unwrapSafeValue(value);
    if (Array.isArray(unwrappedValue)) {
        for (var i = 0; i < unwrappedValue.length; i++) {
            keyValueArraySet(styleKeyValueArray, unwrappedValue[i], true);
        }
    }
    else if (typeof unwrappedValue === 'object') {
        for (var key in unwrappedValue) {
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
 * @param keyValueArray KeyValueArray to add to.
 * @param key Style key to add. (This key will be checked if it needs sanitization)
 * @param value The value to set (If key needs sanitization it will be sanitized)
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
 * @param tView Associated `TView.data` contains the linked list of binding priorities.
 * @param tNode `TNode` where the binding is located.
 * @param lView `LView` contains the values associated with other styling binding at this `TNode`.
 * @param renderer Renderer to use if any updates.
 * @param oldKeyValueArray Previous value represented as `KeyValueArray`
 * @param newKeyValueArray Current value represented as `KeyValueArray`
 * @param isClassBased `true` if `class` (`false` if `style`)
 * @param bindingIndex Binding index of the binding.
 */
function updateStylingMap(tView, tNode, lView, renderer, oldKeyValueArray, newKeyValueArray, isClassBased, bindingIndex) {
    if (oldKeyValueArray === NO_CHANGE) {
        // On first execution the oldKeyValueArray is NO_CHANGE => treat it as empty KeyValueArray.
        oldKeyValueArray = EMPTY_ARRAY;
    }
    var oldIndex = 0;
    var newIndex = 0;
    var oldKey = 0 < oldKeyValueArray.length ? oldKeyValueArray[0] : null;
    var newKey = 0 < newKeyValueArray.length ? newKeyValueArray[0] : null;
    while (oldKey !== null || newKey !== null) {
        ngDevMode && assertLessThan(oldIndex, 999, 'Are we stuck in infinite loop?');
        ngDevMode && assertLessThan(newIndex, 999, 'Are we stuck in infinite loop?');
        var oldValue = oldIndex < oldKeyValueArray.length ? oldKeyValueArray[oldIndex + 1] : undefined;
        var newValue = newIndex < newKeyValueArray.length ? newKeyValueArray[newIndex + 1] : undefined;
        var setKey = null;
        var setValue = undefined;
        if (oldKey === newKey) {
            // UPDATE: Keys are equal => new value is overwriting old value.
            oldIndex += 2;
            newIndex += 2;
            if (oldValue !== newValue) {
                setKey = newKey;
                setValue = newValue;
            }
        }
        else if (newKey === null || oldKey !== null && oldKey < newKey) {
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
 * @param tView Associated `TView.data` contains the linked list of binding priorities.
 * @param tNode `TNode` where the binding is located.
 * @param lView `LView` contains the values associated with other styling binding at this `TNode`.
 * @param renderer Renderer to use if any updates.
 * @param prop Either style property name or a class name.
 * @param value Either style value for `prop` or `true`/`false` if `prop` is class.
 * @param isClassBased `true` if `class` (`false` if `style`)
 * @param bindingIndex Binding index of the binding.
 */
function updateStyling(tView, tNode, lView, renderer, prop, value, isClassBased, bindingIndex) {
    if (tNode.type !== 3 /* Element */) {
        // It is possible to have styling on non-elements (such as ng-container).
        // This is rare, but it does happen. In such a case, just ignore the binding.
        return;
    }
    var tData = tView.data;
    var tRange = tData[bindingIndex + 1];
    var higherPriorityValue = getTStylingRangeNextDuplicate(tRange) ?
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
        var rNode = getNativeByIndex(getSelectedIndex(), lView);
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
 * @param tData `TData` used for traversing the priority.
 * @param tNode `TNode` to use for resolving static styling. Also controls search direction.
 *   - `TNode` search next and quit as soon as `isStylingValuePresent(value)` is true.
 *      If no value found consult `tNode.residualStyle`/`tNode.residualClass` for default value.
 *   - `null` search prev and go all the way to end. Return last value where
 *     `isStylingValuePresent(value)` is true.
 * @param lView `LView` used for retrieving the actual values.
 * @param prop Property which we are interested in.
 * @param index Starting index in the linked list of styling bindings where the search should start.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
function findStylingValue(tData, tNode, lView, prop, index, isClassBased) {
    // `TNode` to use for resolving static styling. Also controls search direction.
    //   - `TNode` search next and quit as soon as `isStylingValuePresent(value)` is true.
    //      If no value found consult `tNode.residualStyle`/`tNode.residualClass` for default value.
    //   - `null` search prev and go all the way to end. Return last value where
    //     `isStylingValuePresent(value)` is true.
    var isPrevDirection = tNode === null;
    var value = undefined;
    while (index > 0) {
        var rawKey = tData[index];
        var containsStatics = Array.isArray(rawKey);
        // Unwrap the key if we contain static values.
        var key = containsStatics ? rawKey[1] : rawKey;
        var isStylingMap = key === null;
        var valueAtLViewIndex = lView[index + 1];
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
        var currentValue = isStylingMap ? keyValueArrayGet(valueAtLViewIndex, prop) :
            key === prop ? valueAtLViewIndex : undefined;
        if (containsStatics && !isStylingValuePresent(currentValue)) {
            currentValue = keyValueArrayGet(rawKey, prop);
        }
        if (isStylingValuePresent(currentValue)) {
            value = currentValue;
            if (isPrevDirection) {
                return value;
            }
        }
        var tRange = tData[index + 1];
        index = isPrevDirection ? getTStylingRangePrev(tRange) : getTStylingRangeNext(tRange);
    }
    if (tNode !== null) {
        // in case where we are going in next direction AND we did not find anything, we need to
        // consult residual styling
        var residual = isClassBased ? tNode.residualClasses : tNode.residualStyles;
        if (residual != null /** OR residual !=== undefined */) {
            value = keyValueArrayGet(residual, prop);
        }
    }
    return value;
}
/**
 * Determines if the binding value should be used (or if the value is 'undefined' and hence priority
 * resolution should be used.)
 *
 * @param value Binding style value.
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
 * @param value
 * @param suffixOrSanitizer
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
 * An input shadow is when a directive steals (shadows) the input by using `@Input('style')` or
 * `@Input('class')` as input.
 *
 * @param tNode `TNode` which we would like to see if it has shadow.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
export function hasStylingInputShadow(tNode, isClassBased) {
    return (tNode.flags & (isClassBased ? 16 /* hasClassInput */ : 32 /* hasStyleInput */)) !== 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW5zdHJ1Y3Rpb25zL3N0eWxpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztFQU1FO0FBRUYsT0FBTyxFQUFZLGVBQWUsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQ3JFLE9BQU8sRUFBQywwQkFBMEIsRUFBRSxlQUFlLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUU1RixPQUFPLEVBQWdCLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDekYsT0FBTyxFQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUN6RyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDN0MsT0FBTyxFQUFDLHNCQUFzQixFQUFFLFNBQVMsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3ZFLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNoRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBSzNDLE9BQU8sRUFBNkIsb0JBQW9CLEVBQUUsNkJBQTZCLEVBQUUsb0JBQW9CLEVBQUUsNkJBQTZCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMzSyxPQUFPLEVBQUMsYUFBYSxFQUFTLFFBQVEsRUFBZSxNQUFNLG9CQUFvQixDQUFDO0FBQ2hGLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUMsd0JBQXdCLEVBQUUsd0JBQXdCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxxQkFBcUIsRUFBRSx3QkFBd0IsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNuSyxP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QU8sS0FBSyxLQUFLLFNBQVMsQ0FBQztBQUM3QixDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBUyxrQ0FBa0MsQ0FDdkMsS0FBVSxFQUFFLGlCQUEwRDtJQUV4RSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsNkJBQTZCLEVBQUU7UUFDL0MsYUFBYTtLQUNkO1NBQU0sSUFBSSxPQUFPLGlCQUFpQixLQUFLLFVBQVUsRUFBRTtRQUNsRCxzQkFBc0I7UUFDdEIsS0FBSyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2xDO1NBQU0sSUFBSSxPQUFPLGlCQUFpQixLQUFLLFFBQVEsRUFBRTtRQUNoRCxLQUFLLEdBQUcsS0FBSyxHQUFHLGlCQUFpQixDQUFDO0tBQ25DO1NBQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDcEMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUMzQztJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUdEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxVQUFVLHFCQUFxQixDQUFDLEtBQVksRUFBRSxZQUFxQjtJQUN2RSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLHdCQUEwQixDQUFDLHVCQUF5QixDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDcEcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuKiBAbGljZW5zZVxuKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbipcbiogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuKi9cblxuaW1wb3J0IHtTYWZlVmFsdWUsIHVud3JhcFNhZmVWYWx1ZX0gZnJvbSAnLi4vLi4vc2FuaXRpemF0aW9uL2J5cGFzcyc7XG5pbXBvcnQge3N0eWxlUHJvcE5lZWRzU2FuaXRpemF0aW9uLCDJtcm1c2FuaXRpemVTdHlsZX0gZnJvbSAnLi4vLi4vc2FuaXRpemF0aW9uL3Nhbml0aXphdGlvbic7XG5pbXBvcnQge1N0eWxlU2FuaXRpemVGbn0gZnJvbSAnLi4vLi4vc2FuaXRpemF0aW9uL3N0eWxlX3Nhbml0aXplcic7XG5pbXBvcnQge0tleVZhbHVlQXJyYXksIGtleVZhbHVlQXJyYXlHZXQsIGtleVZhbHVlQXJyYXlTZXR9IGZyb20gJy4uLy4uL3V0aWwvYXJyYXlfdXRpbHMnO1xuaW1wb3J0IHthc3NlcnREZWZpbmVkLCBhc3NlcnRFcXVhbCwgYXNzZXJ0TGVzc1RoYW4sIGFzc2VydE5vdEVxdWFsLCB0aHJvd0Vycm9yfSBmcm9tICcuLi8uLi91dGlsL2Fzc2VydCc7XG5pbXBvcnQge0VNUFRZX0FSUkFZfSBmcm9tICcuLi8uLi91dGlsL2VtcHR5JztcbmltcG9ydCB7Y29uY2F0U3RyaW5nc1dpdGhTcGFjZSwgc3RyaW5naWZ5fSBmcm9tICcuLi8uLi91dGlsL3N0cmluZ2lmeSc7XG5pbXBvcnQge2Fzc2VydEZpcnN0VXBkYXRlUGFzc30gZnJvbSAnLi4vYXNzZXJ0JztcbmltcG9ydCB7YmluZGluZ1VwZGF0ZWR9IGZyb20gJy4uL2JpbmRpbmdzJztcbmltcG9ydCB7RGlyZWN0aXZlRGVmfSBmcm9tICcuLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtBdHRyaWJ1dGVNYXJrZXIsIFRBdHRyaWJ1dGVzLCBUTm9kZSwgVE5vZGVGbGFncywgVE5vZGVUeXBlfSBmcm9tICcuLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtSRWxlbWVudCwgUmVuZGVyZXIzfSBmcm9tICcuLi9pbnRlcmZhY2VzL3JlbmRlcmVyJztcbmltcG9ydCB7U2FuaXRpemVyRm59IGZyb20gJy4uL2ludGVyZmFjZXMvc2FuaXRpemF0aW9uJztcbmltcG9ydCB7VFN0eWxpbmdLZXksIFRTdHlsaW5nUmFuZ2UsIGdldFRTdHlsaW5nUmFuZ2VOZXh0LCBnZXRUU3R5bGluZ1JhbmdlTmV4dER1cGxpY2F0ZSwgZ2V0VFN0eWxpbmdSYW5nZVByZXYsIGdldFRTdHlsaW5nUmFuZ2VQcmV2RHVwbGljYXRlfSBmcm9tICcuLi9pbnRlcmZhY2VzL3N0eWxpbmcnO1xuaW1wb3J0IHtIRUFERVJfT0ZGU0VULCBMVmlldywgUkVOREVSRVIsIFREYXRhLCBUVmlld30gZnJvbSAnLi4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7YXBwbHlTdHlsaW5nfSBmcm9tICcuLi9ub2RlX21hbmlwdWxhdGlvbic7XG5pbXBvcnQge2dldEN1cnJlbnREaXJlY3RpdmVJbmRleCwgZ2V0Q3VycmVudFN0eWxlU2FuaXRpemVyLCBnZXRMVmlldywgZ2V0U2VsZWN0ZWRJbmRleCwgZ2V0VFZpZXcsIGluY3JlbWVudEJpbmRpbmdJbmRleCwgc2V0Q3VycmVudFN0eWxlU2FuaXRpemVyfSBmcm9tICcuLi9zdGF0ZSc7XG5pbXBvcnQge2luc2VydFRTdHlsaW5nQmluZGluZ30gZnJvbSAnLi4vc3R5bGluZy9zdHlsZV9iaW5kaW5nX2xpc3QnO1xuaW1wb3J0IHtnZXRMYXN0UGFyc2VkS2V5LCBnZXRMYXN0UGFyc2VkVmFsdWUsIHBhcnNlQ2xhc3NOYW1lLCBwYXJzZUNsYXNzTmFtZU5leHQsIHBhcnNlU3R5bGUsIHBhcnNlU3R5bGVOZXh0fSBmcm9tICcuLi9zdHlsaW5nL3N0eWxpbmdfcGFyc2VyJztcbmltcG9ydCB7Tk9fQ0hBTkdFfSBmcm9tICcuLi90b2tlbnMnO1xuaW1wb3J0IHtnZXROYXRpdmVCeUluZGV4fSBmcm9tICcuLi91dGlsL3ZpZXdfdXRpbHMnO1xuaW1wb3J0IHtzZXREaXJlY3RpdmVJbnB1dHNXaGljaFNoYWRvd3NTdHlsaW5nfSBmcm9tICcuL3Byb3BlcnR5JztcblxuXG4vKipcbiAqIFNldHMgdGhlIGN1cnJlbnQgc3R5bGUgc2FuaXRpemVyIGZ1bmN0aW9uIHdoaWNoIHdpbGwgdGhlbiBiZSB1c2VkXG4gKiB3aXRoaW4gYWxsIGZvbGxvdy11cCBwcm9wIGFuZCBtYXAtYmFzZWQgc3R5bGUgYmluZGluZyBpbnN0cnVjdGlvbnNcbiAqIGZvciB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAqXG4gKiBOb3RlIHRoYXQgb25jZSBzdHlsaW5nIGhhcyBiZWVuIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQgKGkuZS4gb25jZVxuICogYGFkdmFuY2UobilgIGlzIGV4ZWN1dGVkIG9yIHRoZSBob3N0QmluZGluZ3MvdGVtcGxhdGUgZnVuY3Rpb24gZXhpdHMpXG4gKiB0aGVuIHRoZSBhY3RpdmUgYHNhbml0aXplckZuYCB3aWxsIGJlIHNldCB0byBgbnVsbGAuIFRoaXMgbWVhbnMgdGhhdFxuICogb25jZSBzdHlsaW5nIGlzIGFwcGxpZWQgdG8gYW5vdGhlciBlbGVtZW50IHRoZW4gYSBhbm90aGVyIGNhbGwgdG9cbiAqIGBzdHlsZVNhbml0aXplcmAgd2lsbCBuZWVkIHRvIGJlIG1hZGUuXG4gKlxuICogQHBhcmFtIHNhbml0aXplckZuIFRoZSBzYW5pdGl6YXRpb24gZnVuY3Rpb24gdGhhdCB3aWxsIGJlIHVzZWQgdG9cbiAqICAgICAgIHByb2Nlc3Mgc3R5bGUgcHJvcC92YWx1ZSBlbnRyaWVzLlxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1c3R5bGVTYW5pdGl6ZXIoc2FuaXRpemVyOiBTdHlsZVNhbml0aXplRm4gfCBudWxsKTogdm9pZCB7XG4gIHNldEN1cnJlbnRTdHlsZVNhbml0aXplcihzYW5pdGl6ZXIpO1xufVxuXG4vKipcbiAqIFVwZGF0ZSBhIHN0eWxlIGJpbmRpbmcgb24gYW4gZWxlbWVudCB3aXRoIHRoZSBwcm92aWRlZCB2YWx1ZS5cbiAqXG4gKiBJZiB0aGUgc3R5bGUgdmFsdWUgaXMgZmFsc3kgdGhlbiBpdCB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgZWxlbWVudFxuICogKG9yIGFzc2lnbmVkIGEgZGlmZmVyZW50IHZhbHVlIGRlcGVuZGluZyBpZiB0aGVyZSBhcmUgYW55IHN0eWxlcyBwbGFjZWRcbiAqIG9uIHRoZSBlbGVtZW50IHdpdGggYHN0eWxlTWFwYCBvciBhbnkgc3RhdGljIHN0eWxlcyB0aGF0IGFyZVxuICogcHJlc2VudCBmcm9tIHdoZW4gdGhlIGVsZW1lbnQgd2FzIGNyZWF0ZWQgd2l0aCBgc3R5bGluZ2ApLlxuICpcbiAqIE5vdGUgdGhhdCB0aGUgc3R5bGluZyBlbGVtZW50IGlzIHVwZGF0ZWQgYXMgcGFydCBvZiBgc3R5bGluZ0FwcGx5YC5cbiAqXG4gKiBAcGFyYW0gcHJvcCBBIHZhbGlkIENTUyBwcm9wZXJ0eS5cbiAqIEBwYXJhbSB2YWx1ZSBOZXcgdmFsdWUgdG8gd3JpdGUgKGBudWxsYCBvciBhbiBlbXB0eSBzdHJpbmcgdG8gcmVtb3ZlKS5cbiAqIEBwYXJhbSBzdWZmaXggT3B0aW9uYWwgc3VmZml4LiBVc2VkIHdpdGggc2NhbGFyIHZhbHVlcyB0byBhZGQgdW5pdCBzdWNoIGFzIGBweGAuXG4gKiAgICAgICAgTm90ZSB0aGF0IHdoZW4gYSBzdWZmaXggaXMgcHJvdmlkZWQgdGhlbiB0aGUgdW5kZXJseWluZyBzYW5pdGl6ZXIgd2lsbFxuICogICAgICAgIGJlIGlnbm9yZWQuXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgd2lsbCBhcHBseSB0aGUgcHJvdmlkZWQgc3R5bGUgdmFsdWUgdG8gdGhlIGhvc3QgZWxlbWVudCBpZiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZFxuICogd2l0aGluIGEgaG9zdCBiaW5kaW5nIGZ1bmN0aW9uLlxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1c3R5bGVQcm9wKFxuICAgIHByb3A6IHN0cmluZywgdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IFNhZmVWYWx1ZSB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgc3VmZml4Pzogc3RyaW5nIHwgbnVsbCk6IHR5cGVvZiDJtcm1c3R5bGVQcm9wIHtcbiAgY2hlY2tTdHlsaW5nUHJvcGVydHkocHJvcCwgdmFsdWUsIHN1ZmZpeCwgZmFsc2UpO1xuICByZXR1cm4gybXJtXN0eWxlUHJvcDtcbn1cblxuLyoqXG4gKiBVcGRhdGUgYSBjbGFzcyBiaW5kaW5nIG9uIGFuIGVsZW1lbnQgd2l0aCB0aGUgcHJvdmlkZWQgdmFsdWUuXG4gKlxuICogVGhpcyBpbnN0cnVjdGlvbiBpcyBtZWFudCB0byBoYW5kbGUgdGhlIGBbY2xhc3MuZm9vXT1cImV4cFwiYCBjYXNlIGFuZCxcbiAqIHRoZXJlZm9yZSwgdGhlIGNsYXNzIGJpbmRpbmcgaXRzZWxmIG11c3QgYWxyZWFkeSBiZSBhbGxvY2F0ZWQgdXNpbmdcbiAqIGBzdHlsaW5nYCB3aXRoaW4gdGhlIGNyZWF0aW9uIGJsb2NrLlxuICpcbiAqIEBwYXJhbSBwcm9wIEEgdmFsaWQgQ1NTIGNsYXNzIChvbmx5IG9uZSkuXG4gKiBAcGFyYW0gdmFsdWUgQSB0cnVlL2ZhbHNlIHZhbHVlIHdoaWNoIHdpbGwgdHVybiB0aGUgY2xhc3Mgb24gb3Igb2ZmLlxuICpcbiAqIE5vdGUgdGhhdCB0aGlzIHdpbGwgYXBwbHkgdGhlIHByb3ZpZGVkIGNsYXNzIHZhbHVlIHRvIHRoZSBob3N0IGVsZW1lbnQgaWYgdGhpcyBmdW5jdGlvblxuICogaXMgY2FsbGVkIHdpdGhpbiBhIGhvc3QgYmluZGluZyBmdW5jdGlvbi5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtWNsYXNzUHJvcChcbiAgICBjbGFzc05hbWU6IHN0cmluZywgdmFsdWU6IGJvb2xlYW4gfCB1bmRlZmluZWQgfCBudWxsKTogdHlwZW9mIMm1ybVjbGFzc1Byb3Age1xuICBjaGVja1N0eWxpbmdQcm9wZXJ0eShjbGFzc05hbWUsIHZhbHVlLCBudWxsLCB0cnVlKTtcbiAgcmV0dXJuIMm1ybVjbGFzc1Byb3A7XG59XG5cblxuLyoqXG4gKiBVcGRhdGUgc3R5bGUgYmluZGluZ3MgdXNpbmcgYW4gb2JqZWN0IGxpdGVyYWwgb24gYW4gZWxlbWVudC5cbiAqXG4gKiBUaGlzIGluc3RydWN0aW9uIGlzIG1lYW50IHRvIGFwcGx5IHN0eWxpbmcgdmlhIHRoZSBgW3N0eWxlXT1cImV4cFwiYCB0ZW1wbGF0ZSBiaW5kaW5ncy5cbiAqIFdoZW4gc3R5bGVzIGFyZSBhcHBsaWVkIHRvIHRoZSBlbGVtZW50IHRoZXkgd2lsbCB0aGVuIGJlIHVwZGF0ZWQgd2l0aCByZXNwZWN0IHRvXG4gKiBhbnkgc3R5bGVzL2NsYXNzZXMgc2V0IHZpYSBgc3R5bGVQcm9wYC4gSWYgYW55IHN0eWxlcyBhcmUgc2V0IHRvIGZhbHN5XG4gKiB0aGVuIHRoZXkgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGVsZW1lbnQuXG4gKlxuICogTm90ZSB0aGF0IHRoZSBzdHlsaW5nIGluc3RydWN0aW9uIHdpbGwgbm90IGJlIGFwcGxpZWQgdW50aWwgYHN0eWxpbmdBcHBseWAgaXMgY2FsbGVkLlxuICpcbiAqIEBwYXJhbSBzdHlsZXMgQSBrZXkvdmFsdWUgc3R5bGUgbWFwIG9mIHRoZSBzdHlsZXMgdGhhdCB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlIGdpdmVuIGVsZW1lbnQuXG4gKiAgICAgICAgQW55IG1pc3Npbmcgc3R5bGVzICh0aGF0IGhhdmUgYWxyZWFkeSBiZWVuIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQgYmVmb3JlaGFuZCkgd2lsbCBiZVxuICogICAgICAgIHJlbW92ZWQgKHVuc2V0KSBmcm9tIHRoZSBlbGVtZW50J3Mgc3R5bGluZy5cbiAqXG4gKiBOb3RlIHRoYXQgdGhpcyB3aWxsIGFwcGx5IHRoZSBwcm92aWRlZCBzdHlsZU1hcCB2YWx1ZSB0byB0aGUgaG9zdCBlbGVtZW50IGlmIHRoaXMgZnVuY3Rpb25cbiAqIGlzIGNhbGxlZCB3aXRoaW4gYSBob3N0IGJpbmRpbmcuXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVzdHlsZU1hcChzdHlsZXM6IHtbc3R5bGVOYW1lOiBzdHJpbmddOiBhbnl9IHwgc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCk6IHZvaWQge1xuICBjaGVja1N0eWxpbmdNYXAoc3R5bGVLZXlWYWx1ZUFycmF5U2V0LCBzdHlsZVN0cmluZ1BhcnNlciwgc3R5bGVzLCBmYWxzZSk7XG59XG5cblxuLyoqXG4gKiBQYXJzZSB0ZXh0IGFzIHN0eWxlIGFuZCBhZGQgdmFsdWVzIHRvIEtleVZhbHVlQXJyYXkuXG4gKlxuICogVGhpcyBjb2RlIGlzIHB1bGxlZCBvdXQgdG8gYSBzZXBhcmF0ZSBmdW5jdGlvbiBzbyB0aGF0IGl0IGNhbiBiZSB0cmVlIHNoYWtlbiBhd2F5IGlmIGl0IGlzIG5vdFxuICogbmVlZGVkLiBJdCBpcyBvbmx5IHJlZmVyZW5jZWQgZnJvbSBgybXJtXN0eWxlTWFwYC5cbiAqXG4gKiBAcGFyYW0ga2V5VmFsdWVBcnJheSBLZXlWYWx1ZUFycmF5IHRvIGFkZCBwYXJzZWQgdmFsdWVzIHRvLlxuICogQHBhcmFtIHRleHQgdGV4dCB0byBwYXJzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0eWxlU3RyaW5nUGFyc2VyKGtleVZhbHVlQXJyYXk6IEtleVZhbHVlQXJyYXk8YW55PiwgdGV4dDogc3RyaW5nKTogdm9pZCB7XG4gIGZvciAobGV0IGkgPSBwYXJzZVN0eWxlKHRleHQpOyBpID49IDA7IGkgPSBwYXJzZVN0eWxlTmV4dCh0ZXh0LCBpKSkge1xuICAgIHN0eWxlS2V5VmFsdWVBcnJheVNldChrZXlWYWx1ZUFycmF5LCBnZXRMYXN0UGFyc2VkS2V5KHRleHQpLCBnZXRMYXN0UGFyc2VkVmFsdWUodGV4dCkpO1xuICB9XG59XG5cblxuLyoqXG4gKiBVcGRhdGUgY2xhc3MgYmluZGluZ3MgdXNpbmcgYW4gb2JqZWN0IGxpdGVyYWwgb3IgY2xhc3Mtc3RyaW5nIG9uIGFuIGVsZW1lbnQuXG4gKlxuICogVGhpcyBpbnN0cnVjdGlvbiBpcyBtZWFudCB0byBhcHBseSBzdHlsaW5nIHZpYSB0aGUgYFtjbGFzc109XCJleHBcImAgdGVtcGxhdGUgYmluZGluZ3MuXG4gKiBXaGVuIGNsYXNzZXMgYXJlIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQgdGhleSB3aWxsIHRoZW4gYmUgdXBkYXRlZCB3aXRoXG4gKiByZXNwZWN0IHRvIGFueSBzdHlsZXMvY2xhc3NlcyBzZXQgdmlhIGBjbGFzc1Byb3BgLiBJZiBhbnlcbiAqIGNsYXNzZXMgYXJlIHNldCB0byBmYWxzeSB0aGVuIHRoZXkgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGVsZW1lbnQuXG4gKlxuICogTm90ZSB0aGF0IHRoZSBzdHlsaW5nIGluc3RydWN0aW9uIHdpbGwgbm90IGJlIGFwcGxpZWQgdW50aWwgYHN0eWxpbmdBcHBseWAgaXMgY2FsbGVkLlxuICogTm90ZSB0aGF0IHRoaXMgd2lsbCB0aGUgcHJvdmlkZWQgY2xhc3NNYXAgdmFsdWUgdG8gdGhlIGhvc3QgZWxlbWVudCBpZiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZFxuICogd2l0aGluIGEgaG9zdCBiaW5kaW5nLlxuICpcbiAqIEBwYXJhbSBjbGFzc2VzIEEga2V5L3ZhbHVlIG1hcCBvciBzdHJpbmcgb2YgQ1NTIGNsYXNzZXMgdGhhdCB3aWxsIGJlIGFkZGVkIHRvIHRoZVxuICogICAgICAgIGdpdmVuIGVsZW1lbnQuIEFueSBtaXNzaW5nIGNsYXNzZXMgKHRoYXQgaGF2ZSBhbHJlYWR5IGJlZW4gYXBwbGllZCB0byB0aGUgZWxlbWVudFxuICogICAgICAgIGJlZm9yZWhhbmQpIHdpbGwgYmUgcmVtb3ZlZCAodW5zZXQpIGZyb20gdGhlIGVsZW1lbnQncyBsaXN0IG9mIENTUyBjbGFzc2VzLlxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1Y2xhc3NNYXAoXG4gICAgY2xhc3Nlczoge1tjbGFzc05hbWU6IHN0cmluZ106IGJvb2xlYW4gfCB1bmRlZmluZWQgfCBudWxsfSB8IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwpOiB2b2lkIHtcbiAgY2hlY2tTdHlsaW5nTWFwKGtleVZhbHVlQXJyYXlTZXQsIGNsYXNzU3RyaW5nUGFyc2VyLCBjbGFzc2VzLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBQYXJzZSB0ZXh0IGFzIGNsYXNzIGFuZCBhZGQgdmFsdWVzIHRvIEtleVZhbHVlQXJyYXkuXG4gKlxuICogVGhpcyBjb2RlIGlzIHB1bGxlZCBvdXQgdG8gYSBzZXBhcmF0ZSBmdW5jdGlvbiBzbyB0aGF0IGl0IGNhbiBiZSB0cmVlIHNoYWtlbiBhd2F5IGlmIGl0IGlzIG5vdFxuICogbmVlZGVkLiBJdCBpcyBvbmx5IHJlZmVyZW5jZWQgZnJvbSBgybXJtWNsYXNzTWFwYC5cbiAqXG4gKiBAcGFyYW0ga2V5VmFsdWVBcnJheSBLZXlWYWx1ZUFycmF5IHRvIGFkZCBwYXJzZWQgdmFsdWVzIHRvLlxuICogQHBhcmFtIHRleHQgdGV4dCB0byBwYXJzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzU3RyaW5nUGFyc2VyKGtleVZhbHVlQXJyYXk6IEtleVZhbHVlQXJyYXk8YW55PiwgdGV4dDogc3RyaW5nKTogdm9pZCB7XG4gIGZvciAobGV0IGkgPSBwYXJzZUNsYXNzTmFtZSh0ZXh0KTsgaSA+PSAwOyBpID0gcGFyc2VDbGFzc05hbWVOZXh0KHRleHQsIGkpKSB7XG4gICAga2V5VmFsdWVBcnJheVNldChrZXlWYWx1ZUFycmF5LCBnZXRMYXN0UGFyc2VkS2V5KHRleHQpLCB0cnVlKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbW1vbiBjb2RlIGJldHdlZW4gYMm1ybVjbGFzc1Byb3BgIGFuZCBgybXJtXN0eWxlUHJvcGAuXG4gKlxuICogQHBhcmFtIHByb3AgcHJvcGVydHkgbmFtZS5cbiAqIEBwYXJhbSB2YWx1ZSBiaW5kaW5nIHZhbHVlLlxuICogQHBhcmFtIHN1ZmZpeE9yU2FuaXRpemVyIHN1ZmZpeCBvciBzYW5pdGl6YXRpb24gZnVuY3Rpb25cbiAqIEBwYXJhbSBpc0NsYXNzQmFzZWQgYHRydWVgIGlmIGBjbGFzc2AgY2hhbmdlIChgZmFsc2VgIGlmIGBzdHlsZWApXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1N0eWxpbmdQcm9wZXJ0eShcbiAgICBwcm9wOiBzdHJpbmcsIHZhbHVlOiBhbnkgfCBOT19DSEFOR0UsXG4gICAgc3VmZml4T3JTYW5pdGl6ZXI6IFNhbml0aXplckZuIHwgc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCwgaXNDbGFzc0Jhc2VkOiBib29sZWFuKTogdm9pZCB7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgdFZpZXcgPSBnZXRUVmlldygpO1xuICAvLyBTdHlsaW5nIGluc3RydWN0aW9ucyB1c2UgMiBzbG90cyBwZXIgYmluZGluZy5cbiAgLy8gMS4gb25lIGZvciB0aGUgdmFsdWUgLyBUU3R5bGluZ0tleVxuICAvLyAyLiBvbmUgZm9yIHRoZSBpbnRlcm1pdHRlbnQtdmFsdWUgLyBUU3R5bGluZ1JhbmdlXG4gIGNvbnN0IGJpbmRpbmdJbmRleCA9IGluY3JlbWVudEJpbmRpbmdJbmRleCgyKTtcbiAgaWYgKHRWaWV3LmZpcnN0VXBkYXRlUGFzcykge1xuICAgIHN0eWxpbmdGaXJzdFVwZGF0ZVBhc3ModFZpZXcsIHByb3AsIGJpbmRpbmdJbmRleCwgaXNDbGFzc0Jhc2VkKTtcbiAgfVxuICBpZiAodmFsdWUgIT09IE5PX0NIQU5HRSAmJiBiaW5kaW5nVXBkYXRlZChsVmlldywgYmluZGluZ0luZGV4LCB2YWx1ZSkpIHtcbiAgICAvLyBUaGlzIGlzIGEgd29yayBhcm91bmQuIE9uY2UgUFIjMzQ0ODAgbGFuZHMgdGhlIHNhbml0aXplciBpcyBwYXNzZWQgZXhwbGljaXRseSBhbmQgdGhpcyBsaW5lXG4gICAgLy8gY2FuIGJlIHJlbW92ZWQuXG4gICAgbGV0IHN0eWxlU2FuaXRpemVyOiBTdHlsZVNhbml0aXplRm58bnVsbDtcbiAgICBpZiAoc3VmZml4T3JTYW5pdGl6ZXIgPT0gbnVsbCkge1xuICAgICAgaWYgKHN0eWxlU2FuaXRpemVyID0gZ2V0Q3VycmVudFN0eWxlU2FuaXRpemVyKCkpIHtcbiAgICAgICAgc3VmZml4T3JTYW5pdGl6ZXIgPSBzdHlsZVNhbml0aXplciBhcyBhbnk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHROb2RlID0gdFZpZXcuZGF0YVtnZXRTZWxlY3RlZEluZGV4KCkgKyBIRUFERVJfT0ZGU0VUXSBhcyBUTm9kZTtcbiAgICB1cGRhdGVTdHlsaW5nKFxuICAgICAgICB0VmlldywgdE5vZGUsIGxWaWV3LCBsVmlld1tSRU5ERVJFUl0sIHByb3AsXG4gICAgICAgIGxWaWV3W2JpbmRpbmdJbmRleCArIDFdID0gbm9ybWFsaXplQW5kQXBwbHlTdWZmaXhPclNhbml0aXplcih2YWx1ZSwgc3VmZml4T3JTYW5pdGl6ZXIpLFxuICAgICAgICBpc0NsYXNzQmFzZWQsIGJpbmRpbmdJbmRleCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21tb24gY29kZSBiZXR3ZWVuIGDJtcm1Y2xhc3NNYXBgIGFuZCBgybXJtXN0eWxlTWFwYC5cbiAqXG4gKiBAcGFyYW0ga2V5VmFsdWVBcnJheVNldCAoU2VlIGBrZXlWYWx1ZUFycmF5U2V0YCBpbiBcInV0aWwvYXJyYXlfdXRpbHNcIikgR2V0cyBwYXNzZWQgaW4gYXMgYVxuICogZnVuY3Rpb24gc28gdGhhdFxuICogICAgICAgIGBzdHlsZWAgY2FuIHBhc3MgaW4gdmVyc2lvbiB3aGljaCBkb2VzIHNhbml0aXphdGlvbi4gVGhpcyBpcyBkb25lIGZvciB0cmVlIHNoYWtpbmdcbiAqICAgICAgICBwdXJwb3Nlcy5cbiAqIEBwYXJhbSBzdHJpbmdQYXJzZXIgUGFyc2VyIHVzZWQgdG8gcGFyc2UgYHZhbHVlYCBpZiBgc3RyaW5nYC4gKFBhc3NlZCBpbiBhcyBgc3R5bGVgIGFuZCBgY2xhc3NgXG4gKiAgICAgICAgaGF2ZSBkaWZmZXJlbnQgcGFyc2Vycy4pXG4gKiBAcGFyYW0gdmFsdWUgYm91bmQgdmFsdWUgZnJvbSBhcHBsaWNhdGlvblxuICogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCBjaGFuZ2UgKGBmYWxzZWAgaWYgYHN0eWxlYClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrU3R5bGluZ01hcChcbiAgICBrZXlWYWx1ZUFycmF5U2V0OiAoa2V5VmFsdWVBcnJheTogS2V5VmFsdWVBcnJheTxhbnk+LCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSkgPT4gdm9pZCxcbiAgICBzdHJpbmdQYXJzZXI6IChzdHlsZUtleVZhbHVlQXJyYXk6IEtleVZhbHVlQXJyYXk8YW55PiwgdGV4dDogc3RyaW5nKSA9PiB2b2lkLFxuICAgIHZhbHVlOiBhbnl8Tk9fQ0hBTkdFLCBpc0NsYXNzQmFzZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgY29uc3QgdFZpZXcgPSBnZXRUVmlldygpO1xuICBjb25zdCBiaW5kaW5nSW5kZXggPSBpbmNyZW1lbnRCaW5kaW5nSW5kZXgoMik7XG4gIGlmICh0Vmlldy5maXJzdFVwZGF0ZVBhc3MpIHtcbiAgICBzdHlsaW5nRmlyc3RVcGRhdGVQYXNzKHRWaWV3LCBudWxsLCBiaW5kaW5nSW5kZXgsIGlzQ2xhc3NCYXNlZCk7XG4gIH1cbiAgY29uc3QgbFZpZXcgPSBnZXRMVmlldygpO1xuICBpZiAodmFsdWUgIT09IE5PX0NIQU5HRSAmJiBiaW5kaW5nVXBkYXRlZChsVmlldywgYmluZGluZ0luZGV4LCB2YWx1ZSkpIHtcbiAgICAvLyBgZ2V0U2VsZWN0ZWRJbmRleCgpYCBzaG91bGQgYmUgaGVyZSAocmF0aGVyIHRoYW4gaW4gaW5zdHJ1Y3Rpb24pIHNvIHRoYXQgaXQgaXMgZ3VhcmRlZCBieSB0aGVcbiAgICAvLyBpZiBzbyBhcyBub3QgdG8gcmVhZCB1bm5lY2Vzc2FyaWx5LlxuICAgIGNvbnN0IHROb2RlID0gdFZpZXcuZGF0YVtnZXRTZWxlY3RlZEluZGV4KCkgKyBIRUFERVJfT0ZGU0VUXSBhcyBUTm9kZTtcbiAgICBpZiAoaGFzU3R5bGluZ0lucHV0U2hhZG93KHROb2RlLCBpc0NsYXNzQmFzZWQpICYmICFpc0luSG9zdEJpbmRpbmdzKHRWaWV3LCBiaW5kaW5nSW5kZXgpKSB7XG4gICAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICAgIC8vIHZlcmlmeSB0aGF0IGlmIHdlIGFyZSBzaGFkb3dpbmcgdGhlbiBgVERhdGFgIGlzIGFwcHJvcHJpYXRlbHkgbWFya2VkIHNvIHRoYXQgd2Ugc2tpcFxuICAgICAgICAvLyBwcm9jZXNzaW5nIHRoaXMgYmluZGluZyBpbiBzdHlsaW5nIHJlc29sdXRpb24uXG4gICAgICAgIGNvbnN0IHRTdHlsaW5nS2V5ID0gdFZpZXcuZGF0YVtiaW5kaW5nSW5kZXhdO1xuICAgICAgICBhc3NlcnRFcXVhbChcbiAgICAgICAgICAgIEFycmF5LmlzQXJyYXkodFN0eWxpbmdLZXkpID8gdFN0eWxpbmdLZXlbMV0gOiB0U3R5bGluZ0tleSwgZmFsc2UsXG4gICAgICAgICAgICAnU3R5bGluZyBsaW5rZWQgbGlzdCBzaGFkb3cgaW5wdXQgc2hvdWxkIGJlIG1hcmtlZCBhcyBcXCdmYWxzZVxcJycpO1xuICAgICAgfVxuICAgICAgLy8gVkUgZG9lcyBub3QgY29uY2F0ZW5hdGUgdGhlIHN0YXRpYyBwb3J0aW9uIGxpa2Ugd2UgYXJlIGRvaW5nIGhlcmUuXG4gICAgICAvLyBJbnN0ZWFkIFZFIGp1c3QgaWdub3JlcyB0aGUgc3RhdGljIGNvbXBsZXRlbHkgaWYgZHluYW1pYyBiaW5kaW5nIGlzIHByZXNlbnQuXG4gICAgICAvLyBCZWNhdXNlIG9mIGxvY2FsaXR5IHdlIGhhdmUgYWxyZWFkeSBzZXQgdGhlIHN0YXRpYyBwb3J0aW9uIGJlY2F1c2Ugd2UgZG9uJ3Qga25vdyBpZiB0aGVyZVxuICAgICAgLy8gaXMgYSBkeW5hbWljIHBvcnRpb24gdW50aWwgbGF0ZXIuIElmIHdlIHdvdWxkIGlnbm9yZSB0aGUgc3RhdGljIHBvcnRpb24gaXQgd291bGQgbG9vayBsaWtlXG4gICAgICAvLyB0aGUgYmluZGluZyBoYXMgcmVtb3ZlZCBpdC4gVGhpcyB3b3VsZCBjb25mdXNlIGBbbmdTdHlsZV1gL2BbbmdDbGFzc11gIHRvIGRvIHRoZSB3cm9uZ1xuICAgICAgLy8gdGhpbmcgYXMgaXQgd291bGQgdGhpbmsgdGhhdCB0aGUgc3RhdGljIHBvcnRpb24gd2FzIHJlbW92ZWQuIEZvciB0aGlzIHJlYXNvbiB3ZVxuICAgICAgLy8gY29uY2F0ZW5hdGUgaXQgc28gdGhhdCBgW25nU3R5bGVdYC9gW25nQ2xhc3NdYCAgY2FuIGNvbnRpbnVlIHRvIHdvcmsgb24gY2hhbmdlZC5cbiAgICAgIGxldCBzdGF0aWNQcmVmaXggPSBpc0NsYXNzQmFzZWQgPyB0Tm9kZS5jbGFzc2VzIDogdE5vZGUuc3R5bGVzO1xuICAgICAgbmdEZXZNb2RlICYmIGlzQ2xhc3NCYXNlZCA9PT0gZmFsc2UgJiYgc3RhdGljUHJlZml4ICE9PSBudWxsICYmXG4gICAgICAgICAgYXNzZXJ0RXF1YWwoXG4gICAgICAgICAgICAgIHN0YXRpY1ByZWZpeC5lbmRzV2l0aCgnOycpLCB0cnVlLCAnRXhwZWN0aW5nIHN0YXRpYyBwb3J0aW9uIHRvIGVuZCB3aXRoIFxcJztcXCcnKTtcbiAgICAgIGlmIChzdGF0aWNQcmVmaXggIT09IG51bGwpIHtcbiAgICAgICAgLy8gV2Ugd2FudCB0byBtYWtlIHN1cmUgdGhhdCBmYWxzeSB2YWx1ZXMgb2YgYHZhbHVlYCBiZWNvbWUgZW1wdHkgc3RyaW5ncy5cbiAgICAgICAgdmFsdWUgPSBjb25jYXRTdHJpbmdzV2l0aFNwYWNlKHN0YXRpY1ByZWZpeCwgdmFsdWUgPyB2YWx1ZSA6ICcnKTtcbiAgICAgIH1cbiAgICAgIC8vIEdpdmVuIGA8ZGl2IFtzdHlsZV0gbXktZGlyPmAgc3VjaCB0aGF0IGBteS1kaXJgIGhhcyBgQElucHV0KCdzdHlsZScpYC5cbiAgICAgIC8vIFRoaXMgdGFrZXMgb3ZlciB0aGUgYFtzdHlsZV1gIGJpbmRpbmcuIChTYW1lIGZvciBgW2NsYXNzXWApXG4gICAgICBzZXREaXJlY3RpdmVJbnB1dHNXaGljaFNoYWRvd3NTdHlsaW5nKHRWaWV3LCB0Tm9kZSwgbFZpZXcsIHZhbHVlLCBpc0NsYXNzQmFzZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB1cGRhdGVTdHlsaW5nTWFwKFxuICAgICAgICAgIHRWaWV3LCB0Tm9kZSwgbFZpZXcsIGxWaWV3W1JFTkRFUkVSXSwgbFZpZXdbYmluZGluZ0luZGV4ICsgMV0sXG4gICAgICAgICAgbFZpZXdbYmluZGluZ0luZGV4ICsgMV0gPSB0b1N0eWxpbmdLZXlWYWx1ZUFycmF5KGtleVZhbHVlQXJyYXlTZXQsIHN0cmluZ1BhcnNlciwgdmFsdWUpLFxuICAgICAgICAgIGlzQ2xhc3NCYXNlZCwgYmluZGluZ0luZGV4KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZW4gdGhlIGJpbmRpbmcgaXMgaW4gYGhvc3RCaW5kaW5nc2Agc2VjdGlvblxuICpcbiAqIEBwYXJhbSB0VmlldyBDdXJyZW50IGBUVmlld2BcbiAqIEBwYXJhbSBiaW5kaW5nSW5kZXggaW5kZXggb2YgYmluZGluZyB3aGljaCB3ZSB3b3VsZCBsaWtlIGlmIGl0IGlzIGluIGBob3N0QmluZGluZ3NgXG4gKi9cbmZ1bmN0aW9uIGlzSW5Ib3N0QmluZGluZ3ModFZpZXc6IFRWaWV3LCBiaW5kaW5nSW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAvLyBBbGwgaG9zdCBiaW5kaW5ncyBhcmUgcGxhY2VkIGFmdGVyIHRoZSBleHBhbmRvIHNlY3Rpb24uXG4gIHJldHVybiBiaW5kaW5nSW5kZXggPj0gdFZpZXcuZXhwYW5kb1N0YXJ0SW5kZXg7XG59XG5cbi8qKlxuKiBDb2xsZWN0cyB0aGUgbmVjZXNzYXJ5IGluZm9ybWF0aW9uIHRvIGluc2VydCB0aGUgYmluZGluZyBpbnRvIGEgbGlua2VkIGxpc3Qgb2Ygc3R5bGUgYmluZGluZ3NcbiogdXNpbmcgYGluc2VydFRTdHlsaW5nQmluZGluZ2AuXG4qXG4qIEBwYXJhbSB0VmlldyBgVFZpZXdgIHdoZXJlIHRoZSBiaW5kaW5nIGxpbmtlZCBsaXN0IHdpbGwgYmUgc3RvcmVkLlxuKiBAcGFyYW0gdFN0eWxpbmdLZXkgUHJvcGVydHkva2V5IG9mIHRoZSBiaW5kaW5nLlxuKiBAcGFyYW0gYmluZGluZ0luZGV4IEluZGV4IG9mIGJpbmRpbmcgYXNzb2NpYXRlZCB3aXRoIHRoZSBgcHJvcGBcbiogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCBjaGFuZ2UgKGBmYWxzZWAgaWYgYHN0eWxlYClcbiovXG5mdW5jdGlvbiBzdHlsaW5nRmlyc3RVcGRhdGVQYXNzKFxuICAgIHRWaWV3OiBUVmlldywgdFN0eWxpbmdLZXk6IFRTdHlsaW5nS2V5LCBiaW5kaW5nSW5kZXg6IG51bWJlciwgaXNDbGFzc0Jhc2VkOiBib29sZWFuKTogdm9pZCB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRGaXJzdFVwZGF0ZVBhc3ModFZpZXcpO1xuICBjb25zdCB0RGF0YSA9IHRWaWV3LmRhdGE7XG4gIGlmICh0RGF0YVtiaW5kaW5nSW5kZXggKyAxXSA9PT0gbnVsbCkge1xuICAgIC8vIFRoZSBhYm92ZSBjaGVjayBpcyBuZWNlc3NhcnkgYmVjYXVzZSB3ZSBkb24ndCBjbGVhciBmaXJzdCB1cGRhdGUgcGFzcyB1bnRpbCBmaXJzdCBzdWNjZXNzZnVsXG4gICAgLy8gKG5vIGV4Y2VwdGlvbikgdGVtcGxhdGUgZXhlY3V0aW9uLiBUaGlzIHByZXZlbnRzIHRoZSBzdHlsaW5nIGluc3RydWN0aW9uIGZyb20gZG91YmxlIGFkZGluZ1xuICAgIC8vIGl0c2VsZiB0byB0aGUgbGlzdC5cbiAgICAvLyBgZ2V0U2VsZWN0ZWRJbmRleCgpYCBzaG91bGQgYmUgaGVyZSAocmF0aGVyIHRoYW4gaW4gaW5zdHJ1Y3Rpb24pIHNvIHRoYXQgaXQgaXMgZ3VhcmRlZCBieSB0aGVcbiAgICAvLyBpZiBzbyBhcyBub3QgdG8gcmVhZCB1bm5lY2Vzc2FyaWx5LlxuICAgIGNvbnN0IHROb2RlID0gdERhdGFbZ2V0U2VsZWN0ZWRJbmRleCgpICsgSEVBREVSX09GRlNFVF0gYXMgVE5vZGU7XG4gICAgY29uc3QgaXNIb3N0QmluZGluZ3MgPSBpc0luSG9zdEJpbmRpbmdzKHRWaWV3LCBiaW5kaW5nSW5kZXgpO1xuICAgIGlmIChoYXNTdHlsaW5nSW5wdXRTaGFkb3codE5vZGUsIGlzQ2xhc3NCYXNlZCkgJiYgdFN0eWxpbmdLZXkgPT09IG51bGwgJiYgIWlzSG9zdEJpbmRpbmdzKSB7XG4gICAgICAvLyBgdFN0eWxpbmdLZXkgPT09IG51bGxgIGltcGxpZXMgdGhhdCB3ZSBhcmUgZWl0aGVyIGBbc3R5bGVdYCBvciBgW2NsYXNzXWAgYmluZGluZy5cbiAgICAgIC8vIElmIHRoZXJlIGlzIGEgZGlyZWN0aXZlIHdoaWNoIHVzZXMgYEBJbnB1dCgnc3R5bGUnKWAgb3IgYEBJbnB1dCgnY2xhc3MnKWAgdGhhblxuICAgICAgLy8gd2UgbmVlZCB0byBuZXV0cmFsaXplIHRoaXMgYmluZGluZyBzaW5jZSB0aGF0IGRpcmVjdGl2ZSBpcyBzaGFkb3dpbmcgaXQuXG4gICAgICAvLyBXZSB0dXJuIHRoaXMgaW50byBhIG5vb3AgYnkgc2V0dGluZyB0aGUga2V5IHRvIGBmYWxzZWBcbiAgICAgIHRTdHlsaW5nS2V5ID0gZmFsc2U7XG4gICAgfVxuICAgIHRTdHlsaW5nS2V5ID0gd3JhcEluU3RhdGljU3R5bGluZ0tleSh0RGF0YSwgdE5vZGUsIHRTdHlsaW5nS2V5LCBpc0NsYXNzQmFzZWQpO1xuICAgIGluc2VydFRTdHlsaW5nQmluZGluZyh0RGF0YSwgdE5vZGUsIHRTdHlsaW5nS2V5LCBiaW5kaW5nSW5kZXgsIGlzSG9zdEJpbmRpbmdzLCBpc0NsYXNzQmFzZWQpO1xuICB9XG59XG5cbi8qKlxuICogQWRkcyBzdGF0aWMgc3R5bGluZyBpbmZvcm1hdGlvbiB0byB0aGUgYmluZGluZyBpZiBhcHBsaWNhYmxlLlxuICpcbiAqIFRoZSBsaW5rZWQgbGlzdCBvZiBzdHlsZXMgbm90IG9ubHkgc3RvcmVzIHRoZSBsaXN0IGFuZCBrZXlzLCBidXQgYWxzbyBzdG9yZXMgc3RhdGljIHN0eWxpbmdcbiAqIGluZm9ybWF0aW9uIG9uIHNvbWUgb2YgdGhlIGtleXMuIFRoaXMgZnVuY3Rpb24gZGV0ZXJtaW5lcyBpZiB0aGUga2V5IHNob3VsZCBjb250YWluIHRoZSBzdHlsaW5nXG4gKiBpbmZvcm1hdGlvbiBhbmQgY29tcHV0ZXMgaXQuXG4gKlxuICogU2VlIGBUU3R5bGluZ1N0YXRpY2AgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAcGFyYW0gdERhdGEgYFREYXRhYCB3aGVyZSB0aGUgbGlua2VkIGxpc3QgaXMgc3RvcmVkLlxuICogQHBhcmFtIHROb2RlIGBUTm9kZWAgZm9yIHdoaWNoIHRoZSBzdHlsaW5nIGlzIGJlaW5nIGNvbXB1dGVkLlxuICogQHBhcmFtIHN0eWxpbmdLZXkgYFRTdHlsaW5nS2V5UHJpbWl0aXZlYCB3aGljaCBtYXkgbmVlZCB0byBiZSB3cmFwcGVkIGludG8gYFRTdHlsaW5nS2V5YFxuICogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuICovXG5leHBvcnQgZnVuY3Rpb24gd3JhcEluU3RhdGljU3R5bGluZ0tleShcbiAgICB0RGF0YTogVERhdGEsIHROb2RlOiBUTm9kZSwgc3R5bGluZ0tleTogVFN0eWxpbmdLZXksIGlzQ2xhc3NCYXNlZDogYm9vbGVhbik6IFRTdHlsaW5nS2V5IHtcbiAgY29uc3QgaG9zdERpcmVjdGl2ZURlZiA9IGdldEhvc3REaXJlY3RpdmVEZWYodERhdGEpO1xuICBsZXQgcmVzaWR1YWwgPSBpc0NsYXNzQmFzZWQgPyB0Tm9kZS5yZXNpZHVhbENsYXNzZXMgOiB0Tm9kZS5yZXNpZHVhbFN0eWxlcztcbiAgaWYgKGhvc3REaXJlY3RpdmVEZWYgPT09IG51bGwpIHtcbiAgICAvLyBXZSBhcmUgaW4gdGVtcGxhdGUgbm9kZS5cbiAgICAvLyBJZiB0ZW1wbGF0ZSBub2RlIGFscmVhZHkgaGFkIHN0eWxpbmcgaW5zdHJ1Y3Rpb24gdGhlbiBpdCBoYXMgYWxyZWFkeSBjb2xsZWN0ZWQgdGhlIHN0YXRpY1xuICAgIC8vIHN0eWxpbmcgYW5kIHRoZXJlIGlzIG5vIG5lZWQgdG8gY29sbGVjdCB0aGVtIGFnYWluLiBXZSBrbm93IHRoYXQgd2UgYXJlIHRoZSBmaXJzdCBzdHlsaW5nXG4gICAgLy8gaW5zdHJ1Y3Rpb24gYmVjYXVzZSB0aGUgYFROb2RlLipCaW5kaW5nc2AgcG9pbnRzIHRvIDAgKG5vdGhpbmcgaGFzIGJlZW4gaW5zZXJ0ZWQgeWV0KS5cbiAgICBjb25zdCBpc0ZpcnN0U3R5bGluZ0luc3RydWN0aW9uSW5UZW1wbGF0ZSA9XG4gICAgICAgIChpc0NsYXNzQmFzZWQgPyB0Tm9kZS5jbGFzc0JpbmRpbmdzIDogdE5vZGUuc3R5bGVCaW5kaW5ncykgYXMgYW55IGFzIG51bWJlciA9PT0gMDtcbiAgICBpZiAoaXNGaXJzdFN0eWxpbmdJbnN0cnVjdGlvbkluVGVtcGxhdGUpIHtcbiAgICAgIC8vIEl0IHdvdWxkIGJlIG5pY2UgdG8gYmUgYWJsZSB0byBnZXQgdGhlIHN0YXRpY3MgZnJvbSBgbWVyZ2VBdHRyc2AsIGhvd2V2ZXIsIGF0IHRoaXMgcG9pbnRcbiAgICAgIC8vIHRoZXkgYXJlIGFscmVhZHkgbWVyZ2VkIGFuZCBpdCB3b3VsZCBub3QgYmUgcG9zc2libGUgdG8gZmlndXJlIHdoaWNoIHByb3BlcnR5IGJlbG9uZ3Mgd2hlcmVcbiAgICAgIC8vIGluIHRoZSBwcmlvcml0eS5cbiAgICAgIHN0eWxpbmdLZXkgPSBjb2xsZWN0U3R5bGluZ0Zyb21EaXJlY3RpdmVzKG51bGwsIHREYXRhLCB0Tm9kZSwgc3R5bGluZ0tleSwgaXNDbGFzc0Jhc2VkKTtcbiAgICAgIHN0eWxpbmdLZXkgPSBjb2xsZWN0U3R5bGluZ0Zyb21UQXR0cnMoc3R5bGluZ0tleSwgdE5vZGUuYXR0cnMsIGlzQ2xhc3NCYXNlZCk7XG4gICAgICAvLyBXZSBrbm93IHRoYXQgaWYgd2UgaGF2ZSBzdHlsaW5nIGJpbmRpbmcgaW4gdGVtcGxhdGUgd2UgY2FuJ3QgaGF2ZSByZXNpZHVhbC5cbiAgICAgIHJlc2lkdWFsID0gbnVsbDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gV2UgYXJlIGluIGhvc3QgYmluZGluZyBub2RlIGFuZCB0aGVyZSB3YXMgbm8gYmluZGluZyBpbnN0cnVjdGlvbiBpbiB0ZW1wbGF0ZSBub2RlLlxuICAgIC8vIFRoaXMgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIGNvbXB1dGUgdGhlIHJlc2lkdWFsLlxuICAgIGNvbnN0IGRpcmVjdGl2ZVN0eWxpbmdMYXN0ID0gdE5vZGUuZGlyZWN0aXZlU3R5bGluZ0xhc3Q7XG4gICAgY29uc3QgaXNGaXJzdFN0eWxpbmdJbnN0cnVjdGlvbkluSG9zdEJpbmRpbmcgPVxuICAgICAgICBkaXJlY3RpdmVTdHlsaW5nTGFzdCA9PT0gLTEgfHwgdERhdGFbZGlyZWN0aXZlU3R5bGluZ0xhc3RdICE9PSBob3N0RGlyZWN0aXZlRGVmO1xuICAgIGlmIChpc0ZpcnN0U3R5bGluZ0luc3RydWN0aW9uSW5Ib3N0QmluZGluZykge1xuICAgICAgc3R5bGluZ0tleSA9XG4gICAgICAgICAgY29sbGVjdFN0eWxpbmdGcm9tRGlyZWN0aXZlcyhob3N0RGlyZWN0aXZlRGVmLCB0RGF0YSwgdE5vZGUsIHN0eWxpbmdLZXksIGlzQ2xhc3NCYXNlZCk7XG4gICAgICBpZiAocmVzaWR1YWwgPT09IG51bGwpIHtcbiAgICAgICAgLy8gLSBJZiBgbnVsbGAgdGhhbiBlaXRoZXI6XG4gICAgICAgIC8vICAgIC0gVGVtcGxhdGUgc3R5bGluZyBpbnN0cnVjdGlvbiBhbHJlYWR5IHJhbiBhbmQgaXQgaGFzIGNvbnN1bWVkIHRoZSBzdGF0aWNcbiAgICAgICAgLy8gICAgICBzdHlsaW5nIGludG8gaXRzIGBUU3R5bGluZ0tleWAgYW5kIHNvIHRoZXJlIGlzIG5vIG5lZWQgdG8gdXBkYXRlIHJlc2lkdWFsLiBJbnN0ZWFkXG4gICAgICAgIC8vICAgICAgd2UgbmVlZCB0byB1cGRhdGUgdGhlIGBUU3R5bGluZ0tleWAgYXNzb2NpYXRlZCB3aXRoIHRoZSBmaXJzdCB0ZW1wbGF0ZSBub2RlXG4gICAgICAgIC8vICAgICAgaW5zdHJ1Y3Rpb24uIE9SXG4gICAgICAgIC8vICAgIC0gU29tZSBvdGhlciBzdHlsaW5nIGluc3RydWN0aW9uIHJhbiBhbmQgZGV0ZXJtaW5lZCB0aGF0IHRoZXJlIGFyZSBubyByZXNpZHVhbHNcbiAgICAgICAgbGV0IHRlbXBsYXRlU3R5bGluZ0tleSA9IGdldFRlbXBsYXRlSGVhZFRTdHlsaW5nS2V5KHREYXRhLCB0Tm9kZSwgaXNDbGFzc0Jhc2VkKTtcbiAgICAgICAgaWYgKHRlbXBsYXRlU3R5bGluZ0tleSAhPT0gdW5kZWZpbmVkICYmIEFycmF5LmlzQXJyYXkodGVtcGxhdGVTdHlsaW5nS2V5KSkge1xuICAgICAgICAgIC8vIE9ubHkgcmVjb21wdXRlIGlmIGB0ZW1wbGF0ZVN0eWxpbmdLZXlgIGhhZCBzdGF0aWMgdmFsdWVzLiAoSWYgbm8gc3RhdGljIHZhbHVlIGZvdW5kXG4gICAgICAgICAgLy8gdGhlbiB0aGVyZSBpcyBub3RoaW5nIHRvIGRvIHNpbmNlIHRoaXMgb3BlcmF0aW9uIGNhbiBvbmx5IHByb2R1Y2UgbGVzcyBzdGF0aWMga2V5cywgbm90XG4gICAgICAgICAgLy8gbW9yZS4pXG4gICAgICAgICAgdGVtcGxhdGVTdHlsaW5nS2V5ID0gY29sbGVjdFN0eWxpbmdGcm9tRGlyZWN0aXZlcyhcbiAgICAgICAgICAgICAgbnVsbCwgdERhdGEsIHROb2RlLCB0ZW1wbGF0ZVN0eWxpbmdLZXlbMV0gLyogdW53cmFwIHByZXZpb3VzIHN0YXRpY3MgKi8sXG4gICAgICAgICAgICAgIGlzQ2xhc3NCYXNlZCk7XG4gICAgICAgICAgdGVtcGxhdGVTdHlsaW5nS2V5ID1cbiAgICAgICAgICAgICAgY29sbGVjdFN0eWxpbmdGcm9tVEF0dHJzKHRlbXBsYXRlU3R5bGluZ0tleSwgdE5vZGUuYXR0cnMsIGlzQ2xhc3NCYXNlZCk7XG4gICAgICAgICAgc2V0VGVtcGxhdGVIZWFkVFN0eWxpbmdLZXkodERhdGEsIHROb2RlLCBpc0NsYXNzQmFzZWQsIHRlbXBsYXRlU3R5bGluZ0tleSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFdlIG9ubHkgbmVlZCB0byByZWNvbXB1dGUgcmVzaWR1YWwgaWYgaXQgaXMgbm90IGBudWxsYC5cbiAgICAgICAgLy8gLSBJZiBleGlzdGluZyByZXNpZHVhbCAoaW1wbGllcyB0aGVyZSB3YXMgbm8gdGVtcGxhdGUgc3R5bGluZykuIFRoaXMgbWVhbnMgdGhhdCBzb21lIG9mXG4gICAgICAgIC8vICAgdGhlIHN0YXRpY3MgbWF5IGhhdmUgbW92ZWQgZnJvbSB0aGUgcmVzaWR1YWwgdG8gdGhlIGBzdHlsaW5nS2V5YCBhbmQgc28gd2UgaGF2ZSB0b1xuICAgICAgICAvLyAgIHJlY29tcHV0ZS5cbiAgICAgICAgLy8gLSBJZiBgdW5kZWZpbmVkYCB0aGlzIGlzIHRoZSBmaXJzdCB0aW1lIHdlIGFyZSBydW5uaW5nLlxuICAgICAgICByZXNpZHVhbCA9IGNvbGxlY3RSZXNpZHVhbCh0RGF0YSwgdE5vZGUsIGlzQ2xhc3NCYXNlZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChyZXNpZHVhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaXNDbGFzc0Jhc2VkID8gKHROb2RlLnJlc2lkdWFsQ2xhc3NlcyA9IHJlc2lkdWFsKSA6ICh0Tm9kZS5yZXNpZHVhbFN0eWxlcyA9IHJlc2lkdWFsKTtcbiAgfVxuICByZXR1cm4gc3R5bGluZ0tleTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZSB0aGUgYFRTdHlsaW5nS2V5YCBmb3IgdGhlIHRlbXBsYXRlIHN0eWxpbmcgaW5zdHJ1Y3Rpb24uXG4gKlxuICogVGhpcyBpcyBuZWVkZWQgc2luY2UgYGhvc3RCaW5kaW5nYCBzdHlsaW5nIGluc3RydWN0aW9ucyBhcmUgaW5zZXJ0ZWQgYWZ0ZXIgdGhlIHRlbXBsYXRlXG4gKiBpbnN0cnVjdGlvbi4gV2hpbGUgdGhlIHRlbXBsYXRlIGluc3RydWN0aW9uIG5lZWRzIHRvIHVwZGF0ZSB0aGUgcmVzaWR1YWwgaW4gYFROb2RlYCB0aGVcbiAqIGBob3N0QmluZGluZ2AgaW5zdHJ1Y3Rpb25zIG5lZWQgdG8gdXBkYXRlIHRoZSBgVFN0eWxpbmdLZXlgIG9mIHRoZSB0ZW1wbGF0ZSBpbnN0cnVjdGlvbiBiZWNhdXNlXG4gKiB0aGUgdGVtcGxhdGUgaW5zdHJ1Y3Rpb24gaXMgZG93bnN0cmVhbSBmcm9tIHRoZSBgaG9zdEJpbmRpbmdzYCBpbnN0cnVjdGlvbnMuXG4gKlxuICogQHBhcmFtIHREYXRhIGBURGF0YWAgd2hlcmUgdGhlIGxpbmtlZCBsaXN0IGlzIHN0b3JlZC5cbiAqIEBwYXJhbSB0Tm9kZSBgVE5vZGVgIGZvciB3aGljaCB0aGUgc3R5bGluZyBpcyBiZWluZyBjb21wdXRlZC5cbiAqIEBwYXJhbSBpc0NsYXNzQmFzZWQgYHRydWVgIGlmIGBjbGFzc2AgKGBmYWxzZWAgaWYgYHN0eWxlYClcbiAqIEByZXR1cm4gYFRTdHlsaW5nS2V5YCBpZiBmb3VuZCBvciBgdW5kZWZpbmVkYCBpZiBub3QgZm91bmQuXG4gKi9cbmZ1bmN0aW9uIGdldFRlbXBsYXRlSGVhZFRTdHlsaW5nS2V5KHREYXRhOiBURGF0YSwgdE5vZGU6IFROb2RlLCBpc0NsYXNzQmFzZWQ6IGJvb2xlYW4pOiBUU3R5bGluZ0tleXxcbiAgICB1bmRlZmluZWQge1xuICBjb25zdCBiaW5kaW5ncyA9IGlzQ2xhc3NCYXNlZCA/IHROb2RlLmNsYXNzQmluZGluZ3MgOiB0Tm9kZS5zdHlsZUJpbmRpbmdzO1xuICBpZiAoZ2V0VFN0eWxpbmdSYW5nZU5leHQoYmluZGluZ3MpID09PSAwKSB7XG4gICAgLy8gVGhlcmUgZG9lcyBub3Qgc2VlbSB0byBiZSBhIHN0eWxpbmcgaW5zdHJ1Y3Rpb24gaW4gdGhlIGB0ZW1wbGF0ZWAuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gdERhdGFbZ2V0VFN0eWxpbmdSYW5nZVByZXYoYmluZGluZ3MpXSBhcyBUU3R5bGluZ0tleTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgdGhlIGBUU3R5bGluZ0tleWAgb2YgdGhlIGZpcnN0IHRlbXBsYXRlIGluc3RydWN0aW9uIGluIGBUTm9kZWAuXG4gKlxuICogTG9naWNhbGx5IGBob3N0QmluZGluZ3NgIHN0eWxpbmcgaW5zdHJ1Y3Rpb25zIGFyZSBvZiBsb3dlciBwcmlvcml0eSB0aGFuIHRoYXQgb2YgdGhlIHRlbXBsYXRlLlxuICogSG93ZXZlciwgdGhleSBleGVjdXRlIGFmdGVyIHRoZSB0ZW1wbGF0ZSBzdHlsaW5nIGluc3RydWN0aW9ucy4gVGhpcyBtZWFucyB0aGF0IHRoZXkgZ2V0IGluc2VydGVkXG4gKiBpbiBmcm9udCBvZiB0aGUgdGVtcGxhdGUgc3R5bGluZyBpbnN0cnVjdGlvbnMuXG4gKlxuICogSWYgd2UgaGF2ZSBhIHRlbXBsYXRlIHN0eWxpbmcgaW5zdHJ1Y3Rpb24gYW5kIGEgbmV3IGBob3N0QmluZGluZ3NgIHN0eWxpbmcgaW5zdHJ1Y3Rpb24gaXNcbiAqIGV4ZWN1dGVkIGl0IG1lYW5zIHRoYXQgaXQgbWF5IG5lZWQgdG8gc3RlYWwgc3RhdGljIGZpZWxkcyBmcm9tIHRoZSB0ZW1wbGF0ZSBpbnN0cnVjdGlvbi4gVGhpc1xuICogbWV0aG9kIGFsbG93cyB1cyB0byB1cGRhdGUgdGhlIGZpcnN0IHRlbXBsYXRlIGluc3RydWN0aW9uIGBUU3R5bGluZ0tleWAgd2l0aCBhIG5ldyB2YWx1ZS5cbiAqXG4gKiBBc3N1bWU6XG4gKiBgYGBcbiAqIDxkaXYgbXktZGlyIHN0eWxlPVwiY29sb3I6IHJlZFwiIFtzdHlsZS5jb2xvcl09XCJ0bXBsRXhwXCI+PC9kaXY+XG4gKlxuICogQERpcmVjdGl2ZSh7XG4gKiAgIGhvc3Q6IHtcbiAqICAgICAnc3R5bGUnOiAnd2lkdGg6IDEwMHB4JyxcbiAqICAgICAnW3N0eWxlLmNvbG9yXSc6ICdkaXJFeHAnLFxuICogICB9XG4gKiB9KVxuICogY2xhc3MgTXlEaXIge31cbiAqIGBgYFxuICpcbiAqIHdoZW4gYFtzdHlsZS5jb2xvcl09XCJ0bXBsRXhwXCJgIGV4ZWN1dGVzIGl0IGNyZWF0ZXMgdGhpcyBkYXRhIHN0cnVjdHVyZS5cbiAqIGBgYFxuICogIFsnJywgJ2NvbG9yJywgJ2NvbG9yJywgJ3JlZCcsICd3aWR0aCcsICcxMDBweCddLFxuICogYGBgXG4gKlxuICogVGhlIHJlYXNvbiBmb3IgdGhpcyBpcyB0aGF0IHRoZSB0ZW1wbGF0ZSBpbnN0cnVjdGlvbiBkb2VzIG5vdCBrbm93IGlmIHRoZXJlIGFyZSBzdHlsaW5nXG4gKiBpbnN0cnVjdGlvbnMgYW5kIG11c3QgYXNzdW1lIHRoYXQgdGhlcmUgYXJlIG5vbmUgYW5kIG11c3QgY29sbGVjdCBhbGwgb2YgdGhlIHN0YXRpYyBzdHlsaW5nLlxuICogKGJvdGhcbiAqIGBjb2xvcicgYW5kICd3aWR0aGApXG4gKlxuICogV2hlbiBgJ1tzdHlsZS5jb2xvcl0nOiAnZGlyRXhwJyxgIGV4ZWN1dGVzIHdlIG5lZWQgdG8gaW5zZXJ0IGEgbmV3IGRhdGEgaW50byB0aGUgbGlua2VkIGxpc3QuXG4gKiBgYGBcbiAqICBbJycsICdjb2xvcicsICd3aWR0aCcsICcxMDBweCddLCAgLy8gbmV3bHkgaW5zZXJ0ZWRcbiAqICBbJycsICdjb2xvcicsICdjb2xvcicsICdyZWQnLCAnd2lkdGgnLCAnMTAwcHgnXSwgLy8gdGhpcyBpcyB3cm9uZ1xuICogYGBgXG4gKlxuICogTm90aWNlIHRoYXQgdGhlIHRlbXBsYXRlIHN0YXRpY3MgaXMgbm93IHdyb25nIGFzIGl0IGluY29ycmVjdGx5IGNvbnRhaW5zIGB3aWR0aGAgc28gd2UgbmVlZCB0b1xuICogdXBkYXRlIGl0IGxpa2Ugc286XG4gKiBgYGBcbiAqICBbJycsICdjb2xvcicsICd3aWR0aCcsICcxMDBweCddLFxuICogIFsnJywgJ2NvbG9yJywgJ2NvbG9yJywgJ3JlZCddLCAgICAvLyBVUERBVEVcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB0RGF0YSBgVERhdGFgIHdoZXJlIHRoZSBsaW5rZWQgbGlzdCBpcyBzdG9yZWQuXG4gKiBAcGFyYW0gdE5vZGUgYFROb2RlYCBmb3Igd2hpY2ggdGhlIHN0eWxpbmcgaXMgYmVpbmcgY29tcHV0ZWQuXG4gKiBAcGFyYW0gaXNDbGFzc0Jhc2VkIGB0cnVlYCBpZiBgY2xhc3NgIChgZmFsc2VgIGlmIGBzdHlsZWApXG4gKiBAcGFyYW0gdFN0eWxpbmdLZXkgTmV3IGBUU3R5bGluZ0tleWAgd2hpY2ggaXMgcmVwbGFjaW5nIHRoZSBvbGQgb25lLlxuICovXG5mdW5jdGlvbiBzZXRUZW1wbGF0ZUhlYWRUU3R5bGluZ0tleShcbiAgICB0RGF0YTogVERhdGEsIHROb2RlOiBUTm9kZSwgaXNDbGFzc0Jhc2VkOiBib29sZWFuLCB0U3R5bGluZ0tleTogVFN0eWxpbmdLZXkpOiB2b2lkIHtcbiAgY29uc3QgYmluZGluZ3MgPSBpc0NsYXNzQmFzZWQgPyB0Tm9kZS5jbGFzc0JpbmRpbmdzIDogdE5vZGUuc3R5bGVCaW5kaW5ncztcbiAgbmdEZXZNb2RlICYmIGFzc2VydE5vdEVxdWFsKFxuICAgICAgICAgICAgICAgICAgIGdldFRTdHlsaW5nUmFuZ2VOZXh0KGJpbmRpbmdzKSwgMCxcbiAgICAgICAgICAgICAgICAgICAnRXhwZWN0aW5nIHRvIGhhdmUgYXQgbGVhc3Qgb25lIHRlbXBsYXRlIHN0eWxpbmcgYmluZGluZy4nKTtcbiAgdERhdGFbZ2V0VFN0eWxpbmdSYW5nZVByZXYoYmluZGluZ3MpXSA9IHRTdHlsaW5nS2V5O1xufVxuXG4vKipcbiAqIENvbGxlY3QgYWxsIHN0YXRpYyB2YWx1ZXMgYWZ0ZXIgdGhlIGN1cnJlbnQgYFROb2RlLmRpcmVjdGl2ZVN0eWxpbmdMYXN0YCBpbmRleC5cbiAqXG4gKiBDb2xsZWN0IHRoZSByZW1haW5pbmcgc3R5bGluZyBpbmZvcm1hdGlvbiB3aGljaCBoYXMgbm90IHlldCBiZWVuIGNvbGxlY3RlZCBieSBhbiBleGlzdGluZ1xuICogc3R5bGluZyBpbnN0cnVjdGlvbi5cbiAqXG4gKiBAcGFyYW0gdERhdGEgYFREYXRhYCB3aGVyZSB0aGUgYERpcmVjdGl2ZURlZnNgIGFyZSBzdG9yZWQuXG4gKiBAcGFyYW0gdE5vZGUgYFROb2RlYCB3aGljaCBjb250YWlucyB0aGUgZGlyZWN0aXZlIHJhbmdlLlxuICogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuICovXG5mdW5jdGlvbiBjb2xsZWN0UmVzaWR1YWwodERhdGE6IFREYXRhLCB0Tm9kZTogVE5vZGUsIGlzQ2xhc3NCYXNlZDogYm9vbGVhbik6IEtleVZhbHVlQXJyYXk8YW55PnxcbiAgICBudWxsIHtcbiAgbGV0IHJlc2lkdWFsOiBLZXlWYWx1ZUFycmF5PGFueT58bnVsbHx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGNvbnN0IGRpcmVjdGl2ZUVuZCA9IHROb2RlLmRpcmVjdGl2ZUVuZDtcbiAgbmdEZXZNb2RlICYmXG4gICAgICBhc3NlcnROb3RFcXVhbChcbiAgICAgICAgICB0Tm9kZS5kaXJlY3RpdmVTdHlsaW5nTGFzdCwgLTEsXG4gICAgICAgICAgJ0J5IHRoZSB0aW1lIHRoaXMgZnVuY3Rpb24gZ2V0cyBjYWxsZWQgYXQgbGVhc3Qgb25lIGhvc3RCaW5kaW5ncy1ub2RlIHN0eWxpbmcgaW5zdHJ1Y3Rpb24gbXVzdCBoYXZlIGV4ZWN1dGVkLicpO1xuICAvLyBXZSBhZGQgYDEgKyB0Tm9kZS5kaXJlY3RpdmVTdGFydGAgYmVjYXVzZSB3ZSBuZWVkIHRvIHNraXAgdGhlIGN1cnJlbnQgZGlyZWN0aXZlIChhcyB3ZSBhcmVcbiAgLy8gY29sbGVjdGluZyB0aGluZ3MgYWZ0ZXIgdGhlIGxhc3QgYGhvc3RCaW5kaW5nc2AgZGlyZWN0aXZlIHdoaWNoIGhhZCBhIHN0eWxpbmcgaW5zdHJ1Y3Rpb24uKVxuICBmb3IgKGxldCBpID0gMSArIHROb2RlLmRpcmVjdGl2ZVN0eWxpbmdMYXN0OyBpIDwgZGlyZWN0aXZlRW5kOyBpKyspIHtcbiAgICBjb25zdCBhdHRycyA9ICh0RGF0YVtpXSBhcyBEaXJlY3RpdmVEZWY8YW55PikuaG9zdEF0dHJzO1xuICAgIHJlc2lkdWFsID0gY29sbGVjdFN0eWxpbmdGcm9tVEF0dHJzKHJlc2lkdWFsLCBhdHRycywgaXNDbGFzc0Jhc2VkKSBhcyBLZXlWYWx1ZUFycmF5PGFueT58IG51bGw7XG4gIH1cbiAgcmV0dXJuIGNvbGxlY3RTdHlsaW5nRnJvbVRBdHRycyhyZXNpZHVhbCwgdE5vZGUuYXR0cnMsIGlzQ2xhc3NCYXNlZCkgYXMgS2V5VmFsdWVBcnJheTxhbnk+fCBudWxsO1xufVxuXG4vKipcbiAqIENvbGxlY3QgdGhlIHN0YXRpYyBzdHlsaW5nIGluZm9ybWF0aW9uIHdpdGggbG93ZXIgcHJpb3JpdHkgdGhhbiBgaG9zdERpcmVjdGl2ZURlZmAuXG4gKlxuICogKFRoaXMgaXMgb3Bwb3NpdGUgb2YgcmVzaWR1YWwgc3R5bGluZy4pXG4gKlxuICogQHBhcmFtIGhvc3REaXJlY3RpdmVEZWYgYERpcmVjdGl2ZURlZmAgZm9yIHdoaWNoIHdlIHdhbnQgdG8gY29sbGVjdCBsb3dlciBwcmlvcml0eSBzdGF0aWNcbiAqICAgICAgICBzdHlsaW5nLiAoT3IgYG51bGxgIGlmIHRlbXBsYXRlIHN0eWxpbmcpXG4gKiBAcGFyYW0gdERhdGEgYFREYXRhYCB3aGVyZSB0aGUgbGlua2VkIGxpc3QgaXMgc3RvcmVkLlxuICogQHBhcmFtIHROb2RlIGBUTm9kZWAgZm9yIHdoaWNoIHRoZSBzdHlsaW5nIGlzIGJlaW5nIGNvbXB1dGVkLlxuICogQHBhcmFtIHN0eWxpbmdLZXkgRXhpc3RpbmcgYFRTdHlsaW5nS2V5YCB0byB1cGRhdGUgb3Igd3JhcC5cbiAqIEBwYXJhbSBpc0NsYXNzQmFzZWQgYHRydWVgIGlmIGBjbGFzc2AgKGBmYWxzZWAgaWYgYHN0eWxlYClcbiAqL1xuZnVuY3Rpb24gY29sbGVjdFN0eWxpbmdGcm9tRGlyZWN0aXZlcyhcbiAgICBob3N0RGlyZWN0aXZlRGVmOiBEaXJlY3RpdmVEZWY8YW55PnwgbnVsbCwgdERhdGE6IFREYXRhLCB0Tm9kZTogVE5vZGUsIHN0eWxpbmdLZXk6IFRTdHlsaW5nS2V5LFxuICAgIGlzQ2xhc3NCYXNlZDogYm9vbGVhbik6IFRTdHlsaW5nS2V5IHtcbiAgLy8gV2UgbmVlZCB0byBsb29wIGJlY2F1c2UgdGhlcmUgY2FuIGJlIGRpcmVjdGl2ZXMgd2hpY2ggaGF2ZSBgaG9zdEF0dHJzYCBidXQgZG9uJ3QgaGF2ZVxuICAvLyBgaG9zdEJpbmRpbmdzYCBzbyB0aGlzIGxvb3AgY2F0Y2hlcyB1cCB0byB0aGUgY3VycmVudCBkaXJlY3RpdmUuLlxuICBsZXQgY3VycmVudERpcmVjdGl2ZTogRGlyZWN0aXZlRGVmPGFueT58bnVsbCA9IG51bGw7XG4gIGNvbnN0IGRpcmVjdGl2ZUVuZCA9IHROb2RlLmRpcmVjdGl2ZUVuZDtcbiAgbGV0IGRpcmVjdGl2ZVN0eWxpbmdMYXN0ID0gdE5vZGUuZGlyZWN0aXZlU3R5bGluZ0xhc3Q7XG4gIGlmIChkaXJlY3RpdmVTdHlsaW5nTGFzdCA9PT0gLTEpIHtcbiAgICBkaXJlY3RpdmVTdHlsaW5nTGFzdCA9IHROb2RlLmRpcmVjdGl2ZVN0YXJ0O1xuICB9IGVsc2Uge1xuICAgIGRpcmVjdGl2ZVN0eWxpbmdMYXN0Kys7XG4gIH1cbiAgd2hpbGUgKGRpcmVjdGl2ZVN0eWxpbmdMYXN0IDwgZGlyZWN0aXZlRW5kKSB7XG4gICAgY3VycmVudERpcmVjdGl2ZSA9IHREYXRhW2RpcmVjdGl2ZVN0eWxpbmdMYXN0XSBhcyBEaXJlY3RpdmVEZWY8YW55PjtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChjdXJyZW50RGlyZWN0aXZlLCAnZXhwZWN0ZWQgdG8gYmUgZGVmaW5lZCcpO1xuICAgIHN0eWxpbmdLZXkgPSBjb2xsZWN0U3R5bGluZ0Zyb21UQXR0cnMoc3R5bGluZ0tleSwgY3VycmVudERpcmVjdGl2ZS5ob3N0QXR0cnMsIGlzQ2xhc3NCYXNlZCk7XG4gICAgaWYgKGN1cnJlbnREaXJlY3RpdmUgPT09IGhvc3REaXJlY3RpdmVEZWYpIGJyZWFrO1xuICAgIGRpcmVjdGl2ZVN0eWxpbmdMYXN0Kys7XG4gIH1cbiAgaWYgKGhvc3REaXJlY3RpdmVEZWYgIT09IG51bGwpIHtcbiAgICAvLyB3ZSBvbmx5IGFkdmFuY2UgdGhlIHN0eWxpbmcgY3Vyc29yIGlmIHdlIGFyZSBjb2xsZWN0aW5nIGRhdGEgZnJvbSBob3N0IGJpbmRpbmdzLlxuICAgIC8vIFRlbXBsYXRlIGV4ZWN1dGVzIGJlZm9yZSBob3N0IGJpbmRpbmdzIGFuZCBzbyBpZiB3ZSB3b3VsZCB1cGRhdGUgdGhlIGluZGV4LFxuICAgIC8vIGhvc3QgYmluZGluZ3Mgd291bGQgbm90IGdldCB0aGVpciBzdGF0aWNzLlxuICAgIHROb2RlLmRpcmVjdGl2ZVN0eWxpbmdMYXN0ID0gZGlyZWN0aXZlU3R5bGluZ0xhc3Q7XG4gIH1cbiAgcmV0dXJuIHN0eWxpbmdLZXk7XG59XG5cbi8qKlxuICogQ29udmVydCBgVEF0dHJzYCBpbnRvIGBUU3R5bGluZ1N0YXRpY2AuXG4gKlxuICogQHBhcmFtIHN0eWxpbmdLZXkgZXhpc3RpbmcgYFRTdHlsaW5nS2V5YCB0byB1cGRhdGUgb3Igd3JhcC5cbiAqIEBwYXJhbSBhdHRycyBgVEF0dHJpYnV0ZXNgIHRvIHByb2Nlc3MuXG4gKiBAcGFyYW0gaXNDbGFzc0Jhc2VkIGB0cnVlYCBpZiBgY2xhc3NgIChgZmFsc2VgIGlmIGBzdHlsZWApXG4gKi9cbmZ1bmN0aW9uIGNvbGxlY3RTdHlsaW5nRnJvbVRBdHRycyhcbiAgICBzdHlsaW5nS2V5OiBUU3R5bGluZ0tleSB8IHVuZGVmaW5lZCwgYXR0cnM6IFRBdHRyaWJ1dGVzIHwgbnVsbCxcbiAgICBpc0NsYXNzQmFzZWQ6IGJvb2xlYW4pOiBUU3R5bGluZ0tleSB7XG4gIGNvbnN0IGRlc2lyZWRNYXJrZXIgPSBpc0NsYXNzQmFzZWQgPyBBdHRyaWJ1dGVNYXJrZXIuQ2xhc3NlcyA6IEF0dHJpYnV0ZU1hcmtlci5TdHlsZXM7XG4gIGxldCBjdXJyZW50TWFya2VyID0gQXR0cmlidXRlTWFya2VyLkltcGxpY2l0QXR0cmlidXRlcztcbiAgaWYgKGF0dHJzICE9PSBudWxsKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaXRlbSA9IGF0dHJzW2ldIGFzIG51bWJlciB8IHN0cmluZztcbiAgICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY3VycmVudE1hcmtlciA9IGl0ZW07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoY3VycmVudE1hcmtlciA9PT0gZGVzaXJlZE1hcmtlcikge1xuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShzdHlsaW5nS2V5KSkge1xuICAgICAgICAgICAgc3R5bGluZ0tleSA9IHN0eWxpbmdLZXkgPT09IHVuZGVmaW5lZCA/IFtdIDogWycnLCBzdHlsaW5nS2V5XSBhcyBhbnk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGtleVZhbHVlQXJyYXlTZXQoXG4gICAgICAgICAgICAgIHN0eWxpbmdLZXkgYXMgS2V5VmFsdWVBcnJheTxhbnk+LCBpdGVtLCBpc0NsYXNzQmFzZWQgPyB0cnVlIDogYXR0cnNbKytpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0eWxpbmdLZXkgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBzdHlsaW5nS2V5O1xufVxuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBjdXJyZW50IGBEaXJlY3RpdmVEZWZgIHdoaWNoIGlzIGFjdGl2ZSB3aGVuIGBob3N0QmluZGluZ3NgIHN0eWxlIGluc3RydWN0aW9uIGlzXG4gKiBiZWluZyBleGVjdXRlZCAob3IgYG51bGxgIGlmIHdlIGFyZSBpbiBgdGVtcGxhdGVgLilcbiAqXG4gKiBAcGFyYW0gdERhdGEgQ3VycmVudCBgVERhdGFgIHdoZXJlIHRoZSBgRGlyZWN0aXZlRGVmYCB3aWxsIGJlIGxvb2tlZCB1cCBhdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEhvc3REaXJlY3RpdmVEZWYodERhdGE6IFREYXRhKTogRGlyZWN0aXZlRGVmPGFueT58bnVsbCB7XG4gIGNvbnN0IGN1cnJlbnREaXJlY3RpdmVJbmRleCA9IGdldEN1cnJlbnREaXJlY3RpdmVJbmRleCgpO1xuICByZXR1cm4gY3VycmVudERpcmVjdGl2ZUluZGV4ID09PSAtMSA/IG51bGwgOiB0RGF0YVtjdXJyZW50RGlyZWN0aXZlSW5kZXhdIGFzIERpcmVjdGl2ZURlZjxhbnk+O1xufVxuXG4vKipcbiAqIENvbnZlcnQgdXNlciBpbnB1dCB0byBgS2V5VmFsdWVBcnJheWAuXG4gKlxuICogVGhpcyBmdW5jdGlvbiB0YWtlcyB1c2VyIGlucHV0IHdoaWNoIGNvdWxkIGJlIGBzdHJpbmdgLCBPYmplY3QgbGl0ZXJhbCwgb3IgaXRlcmFibGUgYW5kIGNvbnZlcnRzXG4gKiBpdCBpbnRvIGEgY29uc2lzdGVudCByZXByZXNlbnRhdGlvbi4gVGhlIG91dHB1dCBvZiB0aGlzIGlzIGBLZXlWYWx1ZUFycmF5YCAod2hpY2ggaXMgYW4gYXJyYXlcbiAqIHdoZXJlXG4gKiBldmVuIGluZGV4ZXMgY29udGFpbiBrZXlzIGFuZCBvZGQgaW5kZXhlcyBjb250YWluIHZhbHVlcyBmb3IgdGhvc2Uga2V5cykuXG4gKlxuICogVGhlIGFkdmFudGFnZSBvZiBjb252ZXJ0aW5nIHRvIGBLZXlWYWx1ZUFycmF5YCBpcyB0aGF0IHdlIGNhbiBwZXJmb3JtIGRpZmYgaW4gYW4gaW5wdXRcbiAqIGluZGVwZW5kZW50XG4gKiB3YXkuXG4gKiAoaWUgd2UgY2FuIGNvbXBhcmUgYGZvbyBiYXJgIHRvIGBbJ2JhcicsICdiYXonXSBhbmQgZGV0ZXJtaW5lIGEgc2V0IG9mIGNoYW5nZXMgd2hpY2ggbmVlZCB0byBiZVxuICogYXBwbGllZClcbiAqXG4gKiBUaGUgZmFjdCB0aGF0IGBLZXlWYWx1ZUFycmF5YCBpcyBzb3J0ZWQgaXMgdmVyeSBpbXBvcnRhbnQgYmVjYXVzZSBpdCBhbGxvd3MgdXMgdG8gY29tcHV0ZSB0aGVcbiAqIGRpZmZlcmVuY2UgaW4gbGluZWFyIGZhc2hpb24gd2l0aG91dCB0aGUgbmVlZCB0byBhbGxvY2F0ZSBhbnkgYWRkaXRpb25hbCBkYXRhLlxuICpcbiAqIEZvciBleGFtcGxlIGlmIHdlIGtlcHQgdGhpcyBhcyBhIGBNYXBgIHdlIHdvdWxkIGhhdmUgdG8gaXRlcmF0ZSBvdmVyIHByZXZpb3VzIGBNYXBgIHRvIGRldGVybWluZVxuICogd2hpY2ggdmFsdWVzIG5lZWQgdG8gYmUgZGVsZXRlZCwgb3ZlciB0aGUgbmV3IGBNYXBgIHRvIGRldGVybWluZSBhZGRpdGlvbnMsIGFuZCB3ZSB3b3VsZCBoYXZlIHRvXG4gKiBrZWVwIGFkZGl0aW9uYWwgYE1hcGAgdG8ga2VlcCB0cmFjayBvZiBkdXBsaWNhdGVzIG9yIGl0ZW1zIHdoaWNoIGhhdmUgbm90IHlldCBiZWVuIHZpc2l0ZWQuXG4gKlxuICogQHBhcmFtIGtleVZhbHVlQXJyYXlTZXQgKFNlZSBga2V5VmFsdWVBcnJheVNldGAgaW4gXCJ1dGlsL2FycmF5X3V0aWxzXCIpIEdldHMgcGFzc2VkIGluIGFzIGFcbiAqIGZ1bmN0aW9uIHNvIHRoYXRcbiAqICAgICAgICBgc3R5bGVgIGNhbiBwYXNzIGluIHZlcnNpb24gd2hpY2ggZG9lcyBzYW5pdGl6YXRpb24uIFRoaXMgaXMgZG9uZSBmb3IgdHJlZSBzaGFraW5nXG4gKiAgICAgICAgcHVycG9zZXMuXG4gKiBAcGFyYW0gc3RyaW5nUGFyc2VyIFRoZSBwYXJzZXIgaXMgcGFzc2VkIGluIHNvIHRoYXQgaXQgd2lsbCBiZSB0cmVlIHNoYWthYmxlLiBTZWVcbiAqICAgICAgICBgc3R5bGVTdHJpbmdQYXJzZXJgIGFuZCBgY2xhc3NTdHJpbmdQYXJzZXJgXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHBhcnNlL2NvbnZlcnQgdG8gYEtleVZhbHVlQXJyYXlgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1N0eWxpbmdLZXlWYWx1ZUFycmF5KFxuICAgIGtleVZhbHVlQXJyYXlTZXQ6IChrZXlWYWx1ZUFycmF5OiBLZXlWYWx1ZUFycmF5PGFueT4sIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSA9PiB2b2lkLFxuICAgIHN0cmluZ1BhcnNlcjogKHN0eWxlS2V5VmFsdWVBcnJheTogS2V5VmFsdWVBcnJheTxhbnk+LCB0ZXh0OiBzdHJpbmcpID0+IHZvaWQsXG4gICAgdmFsdWU6IHN0cmluZ3xzdHJpbmdbXXx7W2tleTogc3RyaW5nXTogYW55fXxTYWZlVmFsdWV8bnVsbHx1bmRlZmluZWQpOiBLZXlWYWx1ZUFycmF5PGFueT4ge1xuICBpZiAodmFsdWUgPT0gbnVsbCAvKnx8IHZhbHVlID09PSB1bmRlZmluZWQgKi8gfHwgdmFsdWUgPT09ICcnKSByZXR1cm4gRU1QVFlfQVJSQVkgYXMgYW55O1xuICBjb25zdCBzdHlsZUtleVZhbHVlQXJyYXk6IEtleVZhbHVlQXJyYXk8YW55PiA9IFtdIGFzIGFueTtcbiAgY29uc3QgdW53cmFwcGVkVmFsdWUgPSB1bndyYXBTYWZlVmFsdWUodmFsdWUpIGFzIHN0cmluZyB8IHN0cmluZ1tdIHwge1trZXk6IHN0cmluZ106IGFueX07XG4gIGlmIChBcnJheS5pc0FycmF5KHVud3JhcHBlZFZhbHVlKSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdW53cmFwcGVkVmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGtleVZhbHVlQXJyYXlTZXQoc3R5bGVLZXlWYWx1ZUFycmF5LCB1bndyYXBwZWRWYWx1ZVtpXSwgdHJ1ZSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB1bndyYXBwZWRWYWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiB1bndyYXBwZWRWYWx1ZSkge1xuICAgICAgaWYgKHVud3JhcHBlZFZhbHVlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAga2V5VmFsdWVBcnJheVNldChzdHlsZUtleVZhbHVlQXJyYXksIGtleSwgdW53cmFwcGVkVmFsdWVba2V5XSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB1bndyYXBwZWRWYWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICBzdHJpbmdQYXJzZXIoc3R5bGVLZXlWYWx1ZUFycmF5LCB1bndyYXBwZWRWYWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgbmdEZXZNb2RlICYmXG4gICAgICAgIHRocm93RXJyb3IoJ1Vuc3VwcG9ydGVkIHN0eWxpbmcgdHlwZSAnICsgdHlwZW9mIHVud3JhcHBlZFZhbHVlICsgJzogJyArIHVud3JhcHBlZFZhbHVlKTtcbiAgfVxuICByZXR1cm4gc3R5bGVLZXlWYWx1ZUFycmF5O1xufVxuXG4vKipcbiAqIFNldCBhIGB2YWx1ZWAgZm9yIGEgYGtleWAgdGFraW5nIHN0eWxlIHNhbml0aXphdGlvbiBpbnRvIGFjY291bnQuXG4gKlxuICogU2VlOiBga2V5VmFsdWVBcnJheVNldGAgZm9yIGRldGFpbHNcbiAqXG4gKiBAcGFyYW0ga2V5VmFsdWVBcnJheSBLZXlWYWx1ZUFycmF5IHRvIGFkZCB0by5cbiAqIEBwYXJhbSBrZXkgU3R5bGUga2V5IHRvIGFkZC4gKFRoaXMga2V5IHdpbGwgYmUgY2hlY2tlZCBpZiBpdCBuZWVkcyBzYW5pdGl6YXRpb24pXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldCAoSWYga2V5IG5lZWRzIHNhbml0aXphdGlvbiBpdCB3aWxsIGJlIHNhbml0aXplZClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0eWxlS2V5VmFsdWVBcnJheVNldChrZXlWYWx1ZUFycmF5OiBLZXlWYWx1ZUFycmF5PGFueT4sIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gIGlmIChzdHlsZVByb3BOZWVkc1Nhbml0aXphdGlvbihrZXkpKSB7XG4gICAgdmFsdWUgPSDJtcm1c2FuaXRpemVTdHlsZSh2YWx1ZSk7XG4gIH1cbiAga2V5VmFsdWVBcnJheVNldChrZXlWYWx1ZUFycmF5LCBrZXksIHZhbHVlKTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgbWFwIGJhc2VkIHN0eWxpbmcuXG4gKlxuICogTWFwIGJhc2VkIHN0eWxpbmcgY291bGQgYmUgYW55dGhpbmcgd2hpY2ggY29udGFpbnMgbW9yZSB0aGFuIG9uZSBiaW5kaW5nLiBGb3IgZXhhbXBsZSBgc3RyaW5nYCxcbiAqIG9yIG9iamVjdCBsaXRlcmFsLiBEZWFsaW5nIHdpdGggYWxsIG9mIHRoZXNlIHR5cGVzIHdvdWxkIGNvbXBsaWNhdGUgdGhlIGxvZ2ljIHNvXG4gKiBpbnN0ZWFkIHRoaXMgZnVuY3Rpb24gZXhwZWN0cyB0aGF0IHRoZSBjb21wbGV4IGlucHV0IGlzIGZpcnN0IGNvbnZlcnRlZCBpbnRvIG5vcm1hbGl6ZWRcbiAqIGBLZXlWYWx1ZUFycmF5YC4gVGhlIGFkdmFudGFnZSBvZiBub3JtYWxpemF0aW9uIGlzIHRoYXQgd2UgZ2V0IHRoZSB2YWx1ZXMgc29ydGVkLCB3aGljaCBtYWtlcyBpdFxuICogdmVyeSBjaGVhcCB0byBjb21wdXRlIGRlbHRhcyBiZXR3ZWVuIHRoZSBwcmV2aW91cyBhbmQgY3VycmVudCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gdFZpZXcgQXNzb2NpYXRlZCBgVFZpZXcuZGF0YWAgY29udGFpbnMgdGhlIGxpbmtlZCBsaXN0IG9mIGJpbmRpbmcgcHJpb3JpdGllcy5cbiAqIEBwYXJhbSB0Tm9kZSBgVE5vZGVgIHdoZXJlIHRoZSBiaW5kaW5nIGlzIGxvY2F0ZWQuXG4gKiBAcGFyYW0gbFZpZXcgYExWaWV3YCBjb250YWlucyB0aGUgdmFsdWVzIGFzc29jaWF0ZWQgd2l0aCBvdGhlciBzdHlsaW5nIGJpbmRpbmcgYXQgdGhpcyBgVE5vZGVgLlxuICogQHBhcmFtIHJlbmRlcmVyIFJlbmRlcmVyIHRvIHVzZSBpZiBhbnkgdXBkYXRlcy5cbiAqIEBwYXJhbSBvbGRLZXlWYWx1ZUFycmF5IFByZXZpb3VzIHZhbHVlIHJlcHJlc2VudGVkIGFzIGBLZXlWYWx1ZUFycmF5YFxuICogQHBhcmFtIG5ld0tleVZhbHVlQXJyYXkgQ3VycmVudCB2YWx1ZSByZXByZXNlbnRlZCBhcyBgS2V5VmFsdWVBcnJheWBcbiAqIEBwYXJhbSBpc0NsYXNzQmFzZWQgYHRydWVgIGlmIGBjbGFzc2AgKGBmYWxzZWAgaWYgYHN0eWxlYClcbiAqIEBwYXJhbSBiaW5kaW5nSW5kZXggQmluZGluZyBpbmRleCBvZiB0aGUgYmluZGluZy5cbiAqL1xuZnVuY3Rpb24gdXBkYXRlU3R5bGluZ01hcChcbiAgICB0VmlldzogVFZpZXcsIHROb2RlOiBUTm9kZSwgbFZpZXc6IExWaWV3LCByZW5kZXJlcjogUmVuZGVyZXIzLFxuICAgIG9sZEtleVZhbHVlQXJyYXk6IEtleVZhbHVlQXJyYXk8YW55PiwgbmV3S2V5VmFsdWVBcnJheTogS2V5VmFsdWVBcnJheTxhbnk+LFxuICAgIGlzQ2xhc3NCYXNlZDogYm9vbGVhbiwgYmluZGluZ0luZGV4OiBudW1iZXIpIHtcbiAgaWYgKG9sZEtleVZhbHVlQXJyYXkgYXMgS2V5VmFsdWVBcnJheTxhbnk+fCBOT19DSEFOR0UgPT09IE5PX0NIQU5HRSkge1xuICAgIC8vIE9uIGZpcnN0IGV4ZWN1dGlvbiB0aGUgb2xkS2V5VmFsdWVBcnJheSBpcyBOT19DSEFOR0UgPT4gdHJlYXQgaXQgYXMgZW1wdHkgS2V5VmFsdWVBcnJheS5cbiAgICBvbGRLZXlWYWx1ZUFycmF5ID0gRU1QVFlfQVJSQVkgYXMgYW55O1xuICB9XG4gIGxldCBvbGRJbmRleCA9IDA7XG4gIGxldCBuZXdJbmRleCA9IDA7XG4gIGxldCBvbGRLZXk6IHN0cmluZ3xudWxsID0gMCA8IG9sZEtleVZhbHVlQXJyYXkubGVuZ3RoID8gb2xkS2V5VmFsdWVBcnJheVswXSA6IG51bGw7XG4gIGxldCBuZXdLZXk6IHN0cmluZ3xudWxsID0gMCA8IG5ld0tleVZhbHVlQXJyYXkubGVuZ3RoID8gbmV3S2V5VmFsdWVBcnJheVswXSA6IG51bGw7XG4gIHdoaWxlIChvbGRLZXkgIT09IG51bGwgfHwgbmV3S2V5ICE9PSBudWxsKSB7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydExlc3NUaGFuKG9sZEluZGV4LCA5OTksICdBcmUgd2Ugc3R1Y2sgaW4gaW5maW5pdGUgbG9vcD8nKTtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0TGVzc1RoYW4obmV3SW5kZXgsIDk5OSwgJ0FyZSB3ZSBzdHVjayBpbiBpbmZpbml0ZSBsb29wPycpO1xuICAgIGNvbnN0IG9sZFZhbHVlID1cbiAgICAgICAgb2xkSW5kZXggPCBvbGRLZXlWYWx1ZUFycmF5Lmxlbmd0aCA/IG9sZEtleVZhbHVlQXJyYXlbb2xkSW5kZXggKyAxXSA6IHVuZGVmaW5lZDtcbiAgICBjb25zdCBuZXdWYWx1ZSA9XG4gICAgICAgIG5ld0luZGV4IDwgbmV3S2V5VmFsdWVBcnJheS5sZW5ndGggPyBuZXdLZXlWYWx1ZUFycmF5W25ld0luZGV4ICsgMV0gOiB1bmRlZmluZWQ7XG4gICAgbGV0IHNldEtleTogc3RyaW5nfG51bGwgPSBudWxsO1xuICAgIGxldCBzZXRWYWx1ZTogYW55ID0gdW5kZWZpbmVkO1xuICAgIGlmIChvbGRLZXkgPT09IG5ld0tleSkge1xuICAgICAgLy8gVVBEQVRFOiBLZXlzIGFyZSBlcXVhbCA9PiBuZXcgdmFsdWUgaXMgb3ZlcndyaXRpbmcgb2xkIHZhbHVlLlxuICAgICAgb2xkSW5kZXggKz0gMjtcbiAgICAgIG5ld0luZGV4ICs9IDI7XG4gICAgICBpZiAob2xkVmFsdWUgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgIHNldEtleSA9IG5ld0tleTtcbiAgICAgICAgc2V0VmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5ld0tleSA9PT0gbnVsbCB8fCBvbGRLZXkgIT09IG51bGwgJiYgb2xkS2V5IDwgbmV3S2V5ICEpIHtcbiAgICAgIC8vIERFTEVURTogb2xkS2V5IGtleSBpcyBtaXNzaW5nIG9yIHdlIGRpZCBub3QgZmluZCB0aGUgb2xkS2V5IGluIHRoZSBuZXdWYWx1ZVxuICAgICAgLy8gKGJlY2F1c2UgdGhlIGtleVZhbHVlQXJyYXkgaXMgc29ydGVkIGFuZCBgbmV3S2V5YCBpcyBmb3VuZCBsYXRlciBhbHBoYWJldGljYWxseSkuXG4gICAgICAvLyBgXCJiYWNrZ3JvdW5kXCIgPCBcImNvbG9yXCJgIHNvIHdlIG5lZWQgdG8gZGVsZXRlIGBcImJhY2tncm91bmRcImAgYmVjYXVzZSBpdCBpcyBub3QgZm91bmQgaW4gdGhlXG4gICAgICAvLyBuZXcgYXJyYXkuXG4gICAgICBvbGRJbmRleCArPSAyO1xuICAgICAgc2V0S2V5ID0gb2xkS2V5O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDUkVBVEU6IG5ld0tleSdzIGlzIGVhcmxpZXIgYWxwaGFiZXRpY2FsbHkgdGhhbiBvbGRLZXkncyAob3Igbm8gb2xkS2V5KSA9PiB3ZSBoYXZlIG5ldyBrZXkuXG4gICAgICAvLyBgXCJjb2xvclwiID4gXCJiYWNrZ3JvdW5kXCJgIHNvIHdlIG5lZWQgdG8gYWRkIGBjb2xvcmAgYmVjYXVzZSBpdCBpcyBpbiBuZXcgYXJyYXkgYnV0IG5vdCBpblxuICAgICAgLy8gb2xkIGFycmF5LlxuICAgICAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQobmV3S2V5LCAnRXhwZWN0aW5nIHRvIGhhdmUgYSB2YWxpZCBrZXknKTtcbiAgICAgIG5ld0luZGV4ICs9IDI7XG4gICAgICBzZXRLZXkgPSBuZXdLZXk7XG4gICAgICBzZXRWYWx1ZSA9IG5ld1ZhbHVlO1xuICAgIH1cbiAgICBpZiAoc2V0S2V5ICE9PSBudWxsKSB7XG4gICAgICB1cGRhdGVTdHlsaW5nKHRWaWV3LCB0Tm9kZSwgbFZpZXcsIHJlbmRlcmVyLCBzZXRLZXksIHNldFZhbHVlLCBpc0NsYXNzQmFzZWQsIGJpbmRpbmdJbmRleCk7XG4gICAgfVxuICAgIG9sZEtleSA9IG9sZEluZGV4IDwgb2xkS2V5VmFsdWVBcnJheS5sZW5ndGggPyBvbGRLZXlWYWx1ZUFycmF5W29sZEluZGV4XSA6IG51bGw7XG4gICAgbmV3S2V5ID0gbmV3SW5kZXggPCBuZXdLZXlWYWx1ZUFycmF5Lmxlbmd0aCA/IG5ld0tleVZhbHVlQXJyYXlbbmV3SW5kZXhdIDogbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFVwZGF0ZSBhIHNpbXBsZSAocHJvcGVydHkgbmFtZSkgc3R5bGluZy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHRha2VzIGBwcm9wYCBhbmQgdXBkYXRlcyB0aGUgRE9NIHRvIHRoYXQgdmFsdWUuIFRoZSBmdW5jdGlvbiB0YWtlcyB0aGUgYmluZGluZ1xuICogdmFsdWUgYXMgd2VsbCBhcyBiaW5kaW5nIHByaW9yaXR5IGludG8gY29uc2lkZXJhdGlvbiB0byBkZXRlcm1pbmUgd2hpY2ggdmFsdWUgc2hvdWxkIGJlIHdyaXR0ZW5cbiAqIHRvIERPTS4gKEZvciBleGFtcGxlIGl0IG1heSBiZSBkZXRlcm1pbmVkIHRoYXQgdGhlcmUgaXMgYSBoaWdoZXIgcHJpb3JpdHkgb3ZlcndyaXRlIHdoaWNoIGJsb2Nrc1xuICogdGhlIERPTSB3cml0ZSwgb3IgaWYgdGhlIHZhbHVlIGdvZXMgdG8gYHVuZGVmaW5lZGAgYSBsb3dlciBwcmlvcml0eSBvdmVyd3JpdGUgbWF5IGJlIGNvbnN1bHRlZC4pXG4gKlxuICogQHBhcmFtIHRWaWV3IEFzc29jaWF0ZWQgYFRWaWV3LmRhdGFgIGNvbnRhaW5zIHRoZSBsaW5rZWQgbGlzdCBvZiBiaW5kaW5nIHByaW9yaXRpZXMuXG4gKiBAcGFyYW0gdE5vZGUgYFROb2RlYCB3aGVyZSB0aGUgYmluZGluZyBpcyBsb2NhdGVkLlxuICogQHBhcmFtIGxWaWV3IGBMVmlld2AgY29udGFpbnMgdGhlIHZhbHVlcyBhc3NvY2lhdGVkIHdpdGggb3RoZXIgc3R5bGluZyBiaW5kaW5nIGF0IHRoaXMgYFROb2RlYC5cbiAqIEBwYXJhbSByZW5kZXJlciBSZW5kZXJlciB0byB1c2UgaWYgYW55IHVwZGF0ZXMuXG4gKiBAcGFyYW0gcHJvcCBFaXRoZXIgc3R5bGUgcHJvcGVydHkgbmFtZSBvciBhIGNsYXNzIG5hbWUuXG4gKiBAcGFyYW0gdmFsdWUgRWl0aGVyIHN0eWxlIHZhbHVlIGZvciBgcHJvcGAgb3IgYHRydWVgL2BmYWxzZWAgaWYgYHByb3BgIGlzIGNsYXNzLlxuICogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuICogQHBhcmFtIGJpbmRpbmdJbmRleCBCaW5kaW5nIGluZGV4IG9mIHRoZSBiaW5kaW5nLlxuICovXG5mdW5jdGlvbiB1cGRhdGVTdHlsaW5nKFxuICAgIHRWaWV3OiBUVmlldywgdE5vZGU6IFROb2RlLCBsVmlldzogTFZpZXcsIHJlbmRlcmVyOiBSZW5kZXJlcjMsIHByb3A6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCB8IGJvb2xlYW4sIGlzQ2xhc3NCYXNlZDogYm9vbGVhbiwgYmluZGluZ0luZGV4OiBudW1iZXIpIHtcbiAgaWYgKHROb2RlLnR5cGUgIT09IFROb2RlVHlwZS5FbGVtZW50KSB7XG4gICAgLy8gSXQgaXMgcG9zc2libGUgdG8gaGF2ZSBzdHlsaW5nIG9uIG5vbi1lbGVtZW50cyAoc3VjaCBhcyBuZy1jb250YWluZXIpLlxuICAgIC8vIFRoaXMgaXMgcmFyZSwgYnV0IGl0IGRvZXMgaGFwcGVuLiBJbiBzdWNoIGEgY2FzZSwganVzdCBpZ25vcmUgdGhlIGJpbmRpbmcuXG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHREYXRhID0gdFZpZXcuZGF0YTtcbiAgY29uc3QgdFJhbmdlID0gdERhdGFbYmluZGluZ0luZGV4ICsgMV0gYXMgVFN0eWxpbmdSYW5nZTtcbiAgY29uc3QgaGlnaGVyUHJpb3JpdHlWYWx1ZSA9IGdldFRTdHlsaW5nUmFuZ2VOZXh0RHVwbGljYXRlKHRSYW5nZSkgP1xuICAgICAgZmluZFN0eWxpbmdWYWx1ZSh0RGF0YSwgdE5vZGUsIGxWaWV3LCBwcm9wLCBnZXRUU3R5bGluZ1JhbmdlTmV4dCh0UmFuZ2UpLCBpc0NsYXNzQmFzZWQpIDpcbiAgICAgIHVuZGVmaW5lZDtcbiAgaWYgKCFpc1N0eWxpbmdWYWx1ZVByZXNlbnQoaGlnaGVyUHJpb3JpdHlWYWx1ZSkpIHtcbiAgICAvLyBXZSBkb24ndCBoYXZlIGEgbmV4dCBkdXBsaWNhdGUsIG9yIHdlIGRpZCBub3QgZmluZCBhIGR1cGxpY2F0ZSB2YWx1ZS5cbiAgICBpZiAoIWlzU3R5bGluZ1ZhbHVlUHJlc2VudCh2YWx1ZSkpIHtcbiAgICAgIC8vIFdlIHNob3VsZCBkZWxldGUgY3VycmVudCB2YWx1ZSBvciByZXN0b3JlIHRvIGxvd2VyIHByaW9yaXR5IHZhbHVlLlxuICAgICAgaWYgKGdldFRTdHlsaW5nUmFuZ2VQcmV2RHVwbGljYXRlKHRSYW5nZSkpIHtcbiAgICAgICAgLy8gV2UgaGF2ZSBhIHBvc3NpYmxlIHByZXYgZHVwbGljYXRlLCBsZXQncyByZXRyaWV2ZSBpdC5cbiAgICAgICAgdmFsdWUgPSBmaW5kU3R5bGluZ1ZhbHVlKHREYXRhLCBudWxsLCBsVmlldywgcHJvcCwgYmluZGluZ0luZGV4LCBpc0NsYXNzQmFzZWQpO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByTm9kZSA9IGdldE5hdGl2ZUJ5SW5kZXgoZ2V0U2VsZWN0ZWRJbmRleCgpLCBsVmlldykgYXMgUkVsZW1lbnQ7XG4gICAgYXBwbHlTdHlsaW5nKHJlbmRlcmVyLCBpc0NsYXNzQmFzZWQsIHJOb2RlLCBwcm9wLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBTZWFyY2ggZm9yIHN0eWxpbmcgdmFsdWUgd2l0aCBoaWdoZXIgcHJpb3JpdHkgd2hpY2ggaXMgb3ZlcndyaXRpbmcgY3VycmVudCB2YWx1ZSwgb3IgYVxuICogdmFsdWUgb2YgbG93ZXIgcHJpb3JpdHkgdG8gd2hpY2ggd2Ugc2hvdWxkIGZhbGwgYmFjayBpZiB0aGUgdmFsdWUgaXMgYHVuZGVmaW5lZGAuXG4gKlxuICogV2hlbiB2YWx1ZSBpcyBiZWluZyBhcHBsaWVkIGF0IGEgbG9jYXRpb24sIHJlbGF0ZWQgdmFsdWVzIG5lZWQgdG8gYmUgY29uc3VsdGVkLlxuICogLSBJZiB0aGVyZSBpcyBhIGhpZ2hlciBwcmlvcml0eSBiaW5kaW5nLCB3ZSBzaG91bGQgYmUgdXNpbmcgdGhhdCBvbmUgaW5zdGVhZC5cbiAqICAgRm9yIGV4YW1wbGUgYDxkaXYgIFtzdHlsZV09XCJ7Y29sb3I6ZXhwMX1cIiBbc3R5bGUuY29sb3JdPVwiZXhwMlwiPmAgY2hhbmdlIHRvIGBleHAxYFxuICogICByZXF1aXJlcyB0aGF0IHdlIGNoZWNrIGBleHAyYCB0byBzZWUgaWYgaXQgaXMgc2V0IHRvIHZhbHVlIG90aGVyIHRoYW4gYHVuZGVmaW5lZGAuXG4gKiAtIElmIHRoZXJlIGlzIGEgbG93ZXIgcHJpb3JpdHkgYmluZGluZyBhbmQgd2UgYXJlIGNoYW5naW5nIHRvIGB1bmRlZmluZWRgXG4gKiAgIEZvciBleGFtcGxlIGA8ZGl2ICBbc3R5bGVdPVwie2NvbG9yOmV4cDF9XCIgW3N0eWxlLmNvbG9yXT1cImV4cDJcIj5gIGNoYW5nZSB0byBgZXhwMmAgdG9cbiAqICAgYHVuZGVmaW5lZGAgcmVxdWlyZXMgdGhhdCB3ZSBjaGVjayBgZXhwMWAgKGFuZCBzdGF0aWMgdmFsdWVzKSBhbmQgdXNlIHRoYXQgYXMgbmV3IHZhbHVlLlxuICpcbiAqIE5PVEU6IFRoZSBzdHlsaW5nIHN0b3JlcyB0d28gdmFsdWVzLlxuICogMS4gVGhlIHJhdyB2YWx1ZSB3aGljaCBjYW1lIGZyb20gdGhlIGFwcGxpY2F0aW9uIGlzIHN0b3JlZCBhdCBgaW5kZXggKyAwYCBsb2NhdGlvbi4gKFRoaXMgdmFsdWVcbiAqICAgIGlzIHVzZWQgZm9yIGRpcnR5IGNoZWNraW5nKS5cbiAqIDIuIFRoZSBub3JtYWxpemVkIHZhbHVlIChjb252ZXJ0ZWQgdG8gYEtleVZhbHVlQXJyYXlgIGlmIG1hcCBhbmQgc2FuaXRpemVkKSBpcyBzdG9yZWQgYXQgYGluZGV4ICtcbiAqIDFgLlxuICogICAgVGhlIGFkdmFudGFnZSBvZiBzdG9yaW5nIHRoZSBzYW5pdGl6ZWQgdmFsdWUgaXMgdGhhdCBvbmNlIHRoZSB2YWx1ZSBpcyB3cml0dGVuIHdlIGRvbid0IG5lZWRcbiAqICAgIHRvIHdvcnJ5IGFib3V0IHNhbml0aXppbmcgaXQgbGF0ZXIgb3Iga2VlcGluZyB0cmFjayBvZiB0aGUgc2FuaXRpemVyLlxuICpcbiAqIEBwYXJhbSB0RGF0YSBgVERhdGFgIHVzZWQgZm9yIHRyYXZlcnNpbmcgdGhlIHByaW9yaXR5LlxuICogQHBhcmFtIHROb2RlIGBUTm9kZWAgdG8gdXNlIGZvciByZXNvbHZpbmcgc3RhdGljIHN0eWxpbmcuIEFsc28gY29udHJvbHMgc2VhcmNoIGRpcmVjdGlvbi5cbiAqICAgLSBgVE5vZGVgIHNlYXJjaCBuZXh0IGFuZCBxdWl0IGFzIHNvb24gYXMgYGlzU3R5bGluZ1ZhbHVlUHJlc2VudCh2YWx1ZSlgIGlzIHRydWUuXG4gKiAgICAgIElmIG5vIHZhbHVlIGZvdW5kIGNvbnN1bHQgYHROb2RlLnJlc2lkdWFsU3R5bGVgL2B0Tm9kZS5yZXNpZHVhbENsYXNzYCBmb3IgZGVmYXVsdCB2YWx1ZS5cbiAqICAgLSBgbnVsbGAgc2VhcmNoIHByZXYgYW5kIGdvIGFsbCB0aGUgd2F5IHRvIGVuZC4gUmV0dXJuIGxhc3QgdmFsdWUgd2hlcmVcbiAqICAgICBgaXNTdHlsaW5nVmFsdWVQcmVzZW50KHZhbHVlKWAgaXMgdHJ1ZS5cbiAqIEBwYXJhbSBsVmlldyBgTFZpZXdgIHVzZWQgZm9yIHJldHJpZXZpbmcgdGhlIGFjdHVhbCB2YWx1ZXMuXG4gKiBAcGFyYW0gcHJvcCBQcm9wZXJ0eSB3aGljaCB3ZSBhcmUgaW50ZXJlc3RlZCBpbi5cbiAqIEBwYXJhbSBpbmRleCBTdGFydGluZyBpbmRleCBpbiB0aGUgbGlua2VkIGxpc3Qgb2Ygc3R5bGluZyBiaW5kaW5ncyB3aGVyZSB0aGUgc2VhcmNoIHNob3VsZCBzdGFydC5cbiAqIEBwYXJhbSBpc0NsYXNzQmFzZWQgYHRydWVgIGlmIGBjbGFzc2AgKGBmYWxzZWAgaWYgYHN0eWxlYClcbiAqL1xuZnVuY3Rpb24gZmluZFN0eWxpbmdWYWx1ZShcbiAgICB0RGF0YTogVERhdGEsIHROb2RlOiBUTm9kZSB8IG51bGwsIGxWaWV3OiBMVmlldywgcHJvcDogc3RyaW5nLCBpbmRleDogbnVtYmVyLFxuICAgIGlzQ2xhc3NCYXNlZDogYm9vbGVhbik6IGFueSB7XG4gIC8vIGBUTm9kZWAgdG8gdXNlIGZvciByZXNvbHZpbmcgc3RhdGljIHN0eWxpbmcuIEFsc28gY29udHJvbHMgc2VhcmNoIGRpcmVjdGlvbi5cbiAgLy8gICAtIGBUTm9kZWAgc2VhcmNoIG5leHQgYW5kIHF1aXQgYXMgc29vbiBhcyBgaXNTdHlsaW5nVmFsdWVQcmVzZW50KHZhbHVlKWAgaXMgdHJ1ZS5cbiAgLy8gICAgICBJZiBubyB2YWx1ZSBmb3VuZCBjb25zdWx0IGB0Tm9kZS5yZXNpZHVhbFN0eWxlYC9gdE5vZGUucmVzaWR1YWxDbGFzc2AgZm9yIGRlZmF1bHQgdmFsdWUuXG4gIC8vICAgLSBgbnVsbGAgc2VhcmNoIHByZXYgYW5kIGdvIGFsbCB0aGUgd2F5IHRvIGVuZC4gUmV0dXJuIGxhc3QgdmFsdWUgd2hlcmVcbiAgLy8gICAgIGBpc1N0eWxpbmdWYWx1ZVByZXNlbnQodmFsdWUpYCBpcyB0cnVlLlxuICBjb25zdCBpc1ByZXZEaXJlY3Rpb24gPSB0Tm9kZSA9PT0gbnVsbDtcbiAgbGV0IHZhbHVlOiBhbnkgPSB1bmRlZmluZWQ7XG4gIHdoaWxlIChpbmRleCA+IDApIHtcbiAgICBjb25zdCByYXdLZXkgPSB0RGF0YVtpbmRleF0gYXMgVFN0eWxpbmdLZXk7XG4gICAgY29uc3QgY29udGFpbnNTdGF0aWNzID0gQXJyYXkuaXNBcnJheShyYXdLZXkpO1xuICAgIC8vIFVud3JhcCB0aGUga2V5IGlmIHdlIGNvbnRhaW4gc3RhdGljIHZhbHVlcy5cbiAgICBjb25zdCBrZXkgPSBjb250YWluc1N0YXRpY3MgPyAocmF3S2V5IGFzIHN0cmluZ1tdKVsxXSA6IHJhd0tleTtcbiAgICBjb25zdCBpc1N0eWxpbmdNYXAgPSBrZXkgPT09IG51bGw7XG4gICAgbGV0IHZhbHVlQXRMVmlld0luZGV4ID0gbFZpZXdbaW5kZXggKyAxXTtcbiAgICBpZiAodmFsdWVBdExWaWV3SW5kZXggPT09IE5PX0NIQU5HRSkge1xuICAgICAgLy8gSW4gZmlyc3RVcGRhdGVQYXNzIHRoZSBzdHlsaW5nIGluc3RydWN0aW9ucyBjcmVhdGUgYSBsaW5rZWQgbGlzdCBvZiBzdHlsaW5nLlxuICAgICAgLy8gT24gc3Vic2VxdWVudCBwYXNzZXMgaXQgaXMgcG9zc2libGUgZm9yIGEgc3R5bGluZyBpbnN0cnVjdGlvbiB0byB0cnkgdG8gcmVhZCBhIGJpbmRpbmdcbiAgICAgIC8vIHdoaWNoXG4gICAgICAvLyBoYXMgbm90IHlldCBleGVjdXRlZC4gSW4gdGhhdCBjYXNlIHdlIHdpbGwgZmluZCBgTk9fQ0hBTkdFYCBhbmQgd2Ugc2hvdWxkIGFzc3VtZSB0aGF0XG4gICAgICAvLyB3ZSBoYXZlIGB1bmRlZmluZWRgIChvciBlbXB0eSBhcnJheSBpbiBjYXNlIG9mIHN0eWxpbmctbWFwIGluc3RydWN0aW9uKSBpbnN0ZWFkLiBUaGlzXG4gICAgICAvLyBhbGxvd3MgdGhlIHJlc29sdXRpb24gdG8gYXBwbHkgdGhlIHZhbHVlICh3aGljaCBtYXkgbGF0ZXIgYmUgb3ZlcndyaXR0ZW4gd2hlbiB0aGVcbiAgICAgIC8vIGJpbmRpbmcgYWN0dWFsbHkgZXhlY3V0ZXMuKVxuICAgICAgdmFsdWVBdExWaWV3SW5kZXggPSBpc1N0eWxpbmdNYXAgPyBFTVBUWV9BUlJBWSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgbGV0IGN1cnJlbnRWYWx1ZSA9IGlzU3R5bGluZ01hcCA/IGtleVZhbHVlQXJyYXlHZXQodmFsdWVBdExWaWV3SW5kZXgsIHByb3ApIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5ID09PSBwcm9wID8gdmFsdWVBdExWaWV3SW5kZXggOiB1bmRlZmluZWQ7XG4gICAgaWYgKGNvbnRhaW5zU3RhdGljcyAmJiAhaXNTdHlsaW5nVmFsdWVQcmVzZW50KGN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgIGN1cnJlbnRWYWx1ZSA9IGtleVZhbHVlQXJyYXlHZXQocmF3S2V5IGFzIEtleVZhbHVlQXJyYXk8YW55PiwgcHJvcCk7XG4gICAgfVxuICAgIGlmIChpc1N0eWxpbmdWYWx1ZVByZXNlbnQoY3VycmVudFZhbHVlKSkge1xuICAgICAgdmFsdWUgPSBjdXJyZW50VmFsdWU7XG4gICAgICBpZiAoaXNQcmV2RGlyZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgdFJhbmdlID0gdERhdGFbaW5kZXggKyAxXSBhcyBUU3R5bGluZ1JhbmdlO1xuICAgIGluZGV4ID0gaXNQcmV2RGlyZWN0aW9uID8gZ2V0VFN0eWxpbmdSYW5nZVByZXYodFJhbmdlKSA6IGdldFRTdHlsaW5nUmFuZ2VOZXh0KHRSYW5nZSk7XG4gIH1cbiAgaWYgKHROb2RlICE9PSBudWxsKSB7XG4gICAgLy8gaW4gY2FzZSB3aGVyZSB3ZSBhcmUgZ29pbmcgaW4gbmV4dCBkaXJlY3Rpb24gQU5EIHdlIGRpZCBub3QgZmluZCBhbnl0aGluZywgd2UgbmVlZCB0b1xuICAgIC8vIGNvbnN1bHQgcmVzaWR1YWwgc3R5bGluZ1xuICAgIGxldCByZXNpZHVhbCA9IGlzQ2xhc3NCYXNlZCA/IHROb2RlLnJlc2lkdWFsQ2xhc3NlcyA6IHROb2RlLnJlc2lkdWFsU3R5bGVzO1xuICAgIGlmIChyZXNpZHVhbCAhPSBudWxsIC8qKiBPUiByZXNpZHVhbCAhPT09IHVuZGVmaW5lZCAqLykge1xuICAgICAgdmFsdWUgPSBrZXlWYWx1ZUFycmF5R2V0KHJlc2lkdWFsICEsIHByb3ApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0aGUgYmluZGluZyB2YWx1ZSBzaG91bGQgYmUgdXNlZCAob3IgaWYgdGhlIHZhbHVlIGlzICd1bmRlZmluZWQnIGFuZCBoZW5jZSBwcmlvcml0eVxuICogcmVzb2x1dGlvbiBzaG91bGQgYmUgdXNlZC4pXG4gKlxuICogQHBhcmFtIHZhbHVlIEJpbmRpbmcgc3R5bGUgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGlzU3R5bGluZ1ZhbHVlUHJlc2VudCh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gIC8vIEN1cnJlbnRseSBvbmx5IGB1bmRlZmluZWRgIHZhbHVlIGlzIGNvbnNpZGVyZWQgbm9uLWJpbmRpbmcuIFRoYXQgaXMgYHVuZGVmaW5lZGAgc2F5cyBJIGRvbid0XG4gIC8vIGhhdmUgYW4gb3BpbmlvbiBhcyB0byB3aGF0IHRoaXMgYmluZGluZyBzaG91bGQgYmUgYW5kIHlvdSBzaG91bGQgY29uc3VsdCBvdGhlciBiaW5kaW5ncyBieVxuICAvLyBwcmlvcml0eSB0byBkZXRlcm1pbmUgdGhlIHZhbGlkIHZhbHVlLlxuICAvLyBUaGlzIGlzIGV4dHJhY3RlZCBpbnRvIGEgc2luZ2xlIGZ1bmN0aW9uIHNvIHRoYXQgd2UgaGF2ZSBhIHNpbmdsZSBwbGFjZSB0byBjb250cm9sIHRoaXMuXG4gIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFNhbml0aXplcyBvciBhZGRzIHN1ZmZpeCB0byB0aGUgdmFsdWUuXG4gKlxuICogSWYgdmFsdWUgaXMgYG51bGxgL2B1bmRlZmluZWRgIG5vIHN1ZmZpeCBpcyBhZGRlZFxuICogQHBhcmFtIHZhbHVlXG4gKiBAcGFyYW0gc3VmZml4T3JTYW5pdGl6ZXJcbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplQW5kQXBwbHlTdWZmaXhPclNhbml0aXplcihcbiAgICB2YWx1ZTogYW55LCBzdWZmaXhPclNhbml0aXplcjogU2FuaXRpemVyRm4gfCBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsKTogc3RyaW5nfG51bGx8dW5kZWZpbmVkfFxuICAgIGJvb2xlYW4ge1xuICBpZiAodmFsdWUgPT0gbnVsbCAvKiogfHwgdmFsdWUgPT09IHVuZGVmaW5lZCAqLykge1xuICAgIC8vIGRvIG5vdGhpbmdcbiAgfSBlbHNlIGlmICh0eXBlb2Ygc3VmZml4T3JTYW5pdGl6ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBzYW5pdGl6ZSB0aGUgdmFsdWUuXG4gICAgdmFsdWUgPSBzdWZmaXhPclNhbml0aXplcih2YWx1ZSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHN1ZmZpeE9yU2FuaXRpemVyID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUgKyBzdWZmaXhPclNhbml0aXplcjtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgdmFsdWUgPSBzdHJpbmdpZnkodW53cmFwU2FmZVZhbHVlKHZhbHVlKSk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5cbi8qKlxuICogVGVzdHMgaWYgdGhlIGBUTm9kZWAgaGFzIGlucHV0IHNoYWRvdy5cbiAqXG4gKiBBbiBpbnB1dCBzaGFkb3cgaXMgd2hlbiBhIGRpcmVjdGl2ZSBzdGVhbHMgKHNoYWRvd3MpIHRoZSBpbnB1dCBieSB1c2luZyBgQElucHV0KCdzdHlsZScpYCBvclxuICogYEBJbnB1dCgnY2xhc3MnKWAgYXMgaW5wdXQuXG4gKlxuICogQHBhcmFtIHROb2RlIGBUTm9kZWAgd2hpY2ggd2Ugd291bGQgbGlrZSB0byBzZWUgaWYgaXQgaGFzIHNoYWRvdy5cbiAqIEBwYXJhbSBpc0NsYXNzQmFzZWQgYHRydWVgIGlmIGBjbGFzc2AgKGBmYWxzZWAgaWYgYHN0eWxlYClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc1N0eWxpbmdJbnB1dFNoYWRvdyh0Tm9kZTogVE5vZGUsIGlzQ2xhc3NCYXNlZDogYm9vbGVhbikge1xuICByZXR1cm4gKHROb2RlLmZsYWdzICYgKGlzQ2xhc3NCYXNlZCA/IFROb2RlRmxhZ3MuaGFzQ2xhc3NJbnB1dCA6IFROb2RlRmxhZ3MuaGFzU3R5bGVJbnB1dCkpICE9PSAwO1xufVxuIl19