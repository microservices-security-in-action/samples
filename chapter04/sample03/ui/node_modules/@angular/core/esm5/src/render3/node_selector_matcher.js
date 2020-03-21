/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import '../util/ng_dev_mode';
import { assertDefined, assertEqual, assertNotEqual } from '../util/assert';
import { unusedValueExportToPlacateAjd as unused1 } from './interfaces/node';
import { unusedValueExportToPlacateAjd as unused2 } from './interfaces/projection';
import { classIndexOf } from './styling/class_differ';
import { isNameOnlyAttributeMarker } from './util/attrs_utils';
var unusedValueToPlacateAjd = unused1 + unused2;
var NG_TEMPLATE_SELECTOR = 'ng-template';
/**
 * Search the `TAttributes` to see if it contains `cssClassToMatch` (case insensitive)
 *
 * @param attrs `TAttributes` to search through.
 * @param cssClassToMatch class to match (lowercase)
 * @param isProjectionMode Whether or not class matching should look into the attribute `class` in
 *    addition to the `AttributeMarker.Classes`.
 */
function isCssClassMatching(attrs, cssClassToMatch, isProjectionMode) {
    // TODO(misko): The fact that this function needs to know about `isProjectionMode` seems suspect.
    // It is strange to me that sometimes the class information comes in form of `class` attribute
    // and sometimes in form of `AttributeMarker.Classes`. Some investigation is needed to determine
    // if that is the right behavior.
    ngDevMode &&
        assertEqual(cssClassToMatch, cssClassToMatch.toLowerCase(), 'Class name expected to be lowercase.');
    var i = 0;
    while (i < attrs.length) {
        var item = attrs[i++];
        if (isProjectionMode && item === 'class') {
            item = attrs[i];
            if (classIndexOf(item.toLowerCase(), cssClassToMatch, 0) !== -1) {
                return true;
            }
        }
        else if (item === 1 /* Classes */) {
            // We found the classes section. Start searching for the class.
            while (i < attrs.length && typeof (item = attrs[i++]) == 'string') {
                // while we have strings
                if (item.toLowerCase() === cssClassToMatch)
                    return true;
            }
            return false;
        }
    }
    return false;
}
/**
 * Function that checks whether a given tNode matches tag-based selector and has a valid type.
 *
 * Matching can be performed in 2 modes: projection mode (when we project nodes) and regular
 * directive matching mode:
 * - in the "directive matching" mode we do _not_ take TContainer's tagName into account if it is
 * different from NG_TEMPLATE_SELECTOR (value different from NG_TEMPLATE_SELECTOR indicates that a
 * tag name was extracted from * syntax so we would match the same directive twice);
 * - in the "projection" mode, we use a tag name potentially extracted from the * syntax processing
 * (applicable to TNodeType.Container only).
 */
function hasTagAndTypeMatch(tNode, currentSelector, isProjectionMode) {
    var tagNameToCompare = tNode.type === 0 /* Container */ && !isProjectionMode ?
        NG_TEMPLATE_SELECTOR :
        tNode.tagName;
    return currentSelector === tagNameToCompare;
}
/**
 * A utility function to match an Ivy node static data against a simple CSS selector
 *
 * @param node static data of the node to match
 * @param selector The selector to try matching against the node.
 * @param isProjectionMode if `true` we are matching for content projection, otherwise we are doing
 * directive matching.
 * @returns true if node matches the selector.
 */
export function isNodeMatchingSelector(tNode, selector, isProjectionMode) {
    ngDevMode && assertDefined(selector[0], 'Selector should have a tag name');
    var mode = 4 /* ELEMENT */;
    var nodeAttrs = tNode.attrs || [];
    // Find the index of first attribute that has no value, only a name.
    var nameOnlyMarkerIdx = getNameOnlyMarkerIndex(nodeAttrs);
    // When processing ":not" selectors, we skip to the next ":not" if the
    // current one doesn't match
    var skipToNextSelector = false;
    for (var i = 0; i < selector.length; i++) {
        var current = selector[i];
        if (typeof current === 'number') {
            // If we finish processing a :not selector and it hasn't failed, return false
            if (!skipToNextSelector && !isPositive(mode) && !isPositive(current)) {
                return false;
            }
            // If we are skipping to the next :not() and this mode flag is positive,
            // it's a part of the current :not() selector, and we should keep skipping
            if (skipToNextSelector && isPositive(current))
                continue;
            skipToNextSelector = false;
            mode = current | (mode & 1 /* NOT */);
            continue;
        }
        if (skipToNextSelector)
            continue;
        if (mode & 4 /* ELEMENT */) {
            mode = 2 /* ATTRIBUTE */ | mode & 1 /* NOT */;
            if (current !== '' && !hasTagAndTypeMatch(tNode, current, isProjectionMode) ||
                current === '' && selector.length === 1) {
                if (isPositive(mode))
                    return false;
                skipToNextSelector = true;
            }
        }
        else {
            var selectorAttrValue = mode & 8 /* CLASS */ ? current : selector[++i];
            // special case for matching against classes when a tNode has been instantiated with
            // class and style values as separate attribute values (e.g. ['title', CLASS, 'foo'])
            if ((mode & 8 /* CLASS */) && tNode.attrs !== null) {
                if (!isCssClassMatching(tNode.attrs, selectorAttrValue, isProjectionMode)) {
                    if (isPositive(mode))
                        return false;
                    skipToNextSelector = true;
                }
                continue;
            }
            var isInlineTemplate = tNode.type == 0 /* Container */ && tNode.tagName !== NG_TEMPLATE_SELECTOR;
            var attrName = (mode & 8 /* CLASS */) ? 'class' : current;
            var attrIndexInNode = findAttrIndexInNode(attrName, nodeAttrs, isInlineTemplate, isProjectionMode);
            if (attrIndexInNode === -1) {
                if (isPositive(mode))
                    return false;
                skipToNextSelector = true;
                continue;
            }
            if (selectorAttrValue !== '') {
                var nodeAttrValue = void 0;
                if (attrIndexInNode > nameOnlyMarkerIdx) {
                    nodeAttrValue = '';
                }
                else {
                    ngDevMode && assertNotEqual(nodeAttrs[attrIndexInNode], 0 /* NamespaceURI */, 'We do not match directives on namespaced attributes');
                    // we lowercase the attribute value to be able to match
                    // selectors without case-sensitivity
                    // (selectors are already in lowercase when generated)
                    nodeAttrValue = nodeAttrs[attrIndexInNode + 1].toLowerCase();
                }
                var compareAgainstClassName = mode & 8 /* CLASS */ ? nodeAttrValue : null;
                if (compareAgainstClassName &&
                    classIndexOf(compareAgainstClassName, selectorAttrValue, 0) !== -1 ||
                    mode & 2 /* ATTRIBUTE */ && selectorAttrValue !== nodeAttrValue) {
                    if (isPositive(mode))
                        return false;
                    skipToNextSelector = true;
                }
            }
        }
    }
    return isPositive(mode) || skipToNextSelector;
}
function isPositive(mode) {
    return (mode & 1 /* NOT */) === 0;
}
/**
 * Examines the attribute's definition array for a node to find the index of the
 * attribute that matches the given `name`.
 *
 * NOTE: This will not match namespaced attributes.
 *
 * Attribute matching depends upon `isInlineTemplate` and `isProjectionMode`.
 * The following table summarizes which types of attributes we attempt to match:
 *
 * ===========================================================================================================
 * Modes                   | Normal Attributes | Bindings Attributes | Template Attributes | I18n
 * Attributes
 * ===========================================================================================================
 * Inline + Projection     | YES               | YES                 | NO                  | YES
 * -----------------------------------------------------------------------------------------------------------
 * Inline + Directive      | NO                | NO                  | YES                 | NO
 * -----------------------------------------------------------------------------------------------------------
 * Non-inline + Projection | YES               | YES                 | NO                  | YES
 * -----------------------------------------------------------------------------------------------------------
 * Non-inline + Directive  | YES               | YES                 | NO                  | YES
 * ===========================================================================================================
 *
 * @param name the name of the attribute to find
 * @param attrs the attribute array to examine
 * @param isInlineTemplate true if the node being matched is an inline template (e.g. `*ngFor`)
 * rather than a manually expanded template node (e.g `<ng-template>`).
 * @param isProjectionMode true if we are matching against content projection otherwise we are
 * matching against directives.
 */
function findAttrIndexInNode(name, attrs, isInlineTemplate, isProjectionMode) {
    if (attrs === null)
        return -1;
    var i = 0;
    if (isProjectionMode || !isInlineTemplate) {
        var bindingsMode = false;
        while (i < attrs.length) {
            var maybeAttrName = attrs[i];
            if (maybeAttrName === name) {
                return i;
            }
            else if (maybeAttrName === 3 /* Bindings */ || maybeAttrName === 6 /* I18n */) {
                bindingsMode = true;
            }
            else if (maybeAttrName === 1 /* Classes */ || maybeAttrName === 2 /* Styles */) {
                var value = attrs[++i];
                // We should skip classes here because we have a separate mechanism for
                // matching classes in projection mode.
                while (typeof value === 'string') {
                    value = attrs[++i];
                }
                continue;
            }
            else if (maybeAttrName === 4 /* Template */) {
                // We do not care about Template attributes in this scenario.
                break;
            }
            else if (maybeAttrName === 0 /* NamespaceURI */) {
                // Skip the whole namespaced attribute and value. This is by design.
                i += 4;
                continue;
            }
            // In binding mode there are only names, rather than name-value pairs.
            i += bindingsMode ? 1 : 2;
        }
        // We did not match the attribute
        return -1;
    }
    else {
        return matchTemplateAttribute(attrs, name);
    }
}
export function isNodeMatchingSelectorList(tNode, selector, isProjectionMode) {
    if (isProjectionMode === void 0) { isProjectionMode = false; }
    for (var i = 0; i < selector.length; i++) {
        if (isNodeMatchingSelector(tNode, selector[i], isProjectionMode)) {
            return true;
        }
    }
    return false;
}
export function getProjectAsAttrValue(tNode) {
    var nodeAttrs = tNode.attrs;
    if (nodeAttrs != null) {
        var ngProjectAsAttrIdx = nodeAttrs.indexOf(5 /* ProjectAs */);
        // only check for ngProjectAs in attribute names, don't accidentally match attribute's value
        // (attribute names are stored at even indexes)
        if ((ngProjectAsAttrIdx & 1) === 0) {
            return nodeAttrs[ngProjectAsAttrIdx + 1];
        }
    }
    return null;
}
function getNameOnlyMarkerIndex(nodeAttrs) {
    for (var i = 0; i < nodeAttrs.length; i++) {
        var nodeAttr = nodeAttrs[i];
        if (isNameOnlyAttributeMarker(nodeAttr)) {
            return i;
        }
    }
    return nodeAttrs.length;
}
function matchTemplateAttribute(attrs, name) {
    var i = attrs.indexOf(4 /* Template */);
    if (i > -1) {
        i++;
        while (i < attrs.length) {
            if (attrs[i] === name)
                return i;
            i++;
        }
    }
    return -1;
}
/**
 * Checks whether a selector is inside a CssSelectorList
 * @param selector Selector to be checked.
 * @param list List in which to look for the selector.
 */
export function isSelectorInSelectorList(selector, list) {
    selectorListLoop: for (var i = 0; i < list.length; i++) {
        var currentSelectorInList = list[i];
        if (selector.length !== currentSelectorInList.length) {
            continue;
        }
        for (var j = 0; j < selector.length; j++) {
            if (selector[j] !== currentSelectorInList[j]) {
                continue selectorListLoop;
            }
        }
        return true;
    }
    return false;
}
function maybeWrapInNotSelector(isNegativeMode, chunk) {
    return isNegativeMode ? ':not(' + chunk.trim() + ')' : chunk;
}
function stringifyCSSSelector(selector) {
    var result = selector[0];
    var i = 1;
    var mode = 2 /* ATTRIBUTE */;
    var currentChunk = '';
    var isNegativeMode = false;
    while (i < selector.length) {
        var valueOrMarker = selector[i];
        if (typeof valueOrMarker === 'string') {
            if (mode & 2 /* ATTRIBUTE */) {
                var attrValue = selector[++i];
                currentChunk +=
                    '[' + valueOrMarker + (attrValue.length > 0 ? '="' + attrValue + '"' : '') + ']';
            }
            else if (mode & 8 /* CLASS */) {
                currentChunk += '.' + valueOrMarker;
            }
            else if (mode & 4 /* ELEMENT */) {
                currentChunk += ' ' + valueOrMarker;
            }
        }
        else {
            //
            // Append current chunk to the final result in case we come across SelectorFlag, which
            // indicates that the previous section of a selector is over. We need to accumulate content
            // between flags to make sure we wrap the chunk later in :not() selector if needed, e.g.
            // ```
            //  ['', Flags.CLASS, '.classA', Flags.CLASS | Flags.NOT, '.classB', '.classC']
            // ```
            // should be transformed to `.classA :not(.classB .classC)`.
            //
            // Note: for negative selector part, we accumulate content between flags until we find the
            // next negative flag. This is needed to support a case where `:not()` rule contains more than
            // one chunk, e.g. the following selector:
            // ```
            //  ['', Flags.ELEMENT | Flags.NOT, 'p', Flags.CLASS, 'foo', Flags.CLASS | Flags.NOT, 'bar']
            // ```
            // should be stringified to `:not(p.foo) :not(.bar)`
            //
            if (currentChunk !== '' && !isPositive(valueOrMarker)) {
                result += maybeWrapInNotSelector(isNegativeMode, currentChunk);
                currentChunk = '';
            }
            mode = valueOrMarker;
            // According to CssSelector spec, once we come across `SelectorFlags.NOT` flag, the negative
            // mode is maintained for remaining chunks of a selector.
            isNegativeMode = isNegativeMode || !isPositive(mode);
        }
        i++;
    }
    if (currentChunk !== '') {
        result += maybeWrapInNotSelector(isNegativeMode, currentChunk);
    }
    return result;
}
/**
 * Generates string representation of CSS selector in parsed form.
 *
 * ComponentDef and DirectiveDef are generated with the selector in parsed form to avoid doing
 * additional parsing at runtime (for example, for directive matching). However in some cases (for
 * example, while bootstrapping a component), a string version of the selector is required to query
 * for the host element on the page. This function takes the parsed form of a selector and returns
 * its string representation.
 *
 * @param selectorList selector in parsed form
 * @returns string representation of a given selector
 */
export function stringifyCSSSelectorList(selectorList) {
    return selectorList.map(stringifyCSSSelector).join(',');
}
/**
 * Extracts attributes and classes information from a given CSS selector.
 *
 * This function is used while creating a component dynamically. In this case, the host element
 * (that is created dynamically) should contain attributes and classes specified in component's CSS
 * selector.
 *
 * @param selector CSS selector in parsed form (in a form of array)
 * @returns object with `attrs` and `classes` fields that contain extracted information
 */
export function extractAttrsAndClassesFromSelector(selector) {
    var attrs = [];
    var classes = [];
    var i = 1;
    var mode = 2 /* ATTRIBUTE */;
    while (i < selector.length) {
        var valueOrMarker = selector[i];
        if (typeof valueOrMarker === 'string') {
            if (mode === 2 /* ATTRIBUTE */) {
                if (valueOrMarker !== '') {
                    attrs.push(valueOrMarker, selector[++i]);
                }
            }
            else if (mode === 8 /* CLASS */) {
                classes.push(valueOrMarker);
            }
        }
        else {
            // According to CssSelector spec, once we come across `SelectorFlags.NOT` flag, the negative
            // mode is maintained for remaining chunks of a selector. Since attributes and classes are
            // extracted only for "positive" part of the selector, we can stop here.
            if (!isPositive(mode))
                break;
            mode = valueOrMarker;
        }
        i++;
    }
    return { attrs: attrs, classes: classes };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9zZWxlY3Rvcl9tYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9ub2RlX3NlbGVjdG9yX21hdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxxQkFBcUIsQ0FBQztBQUU3QixPQUFPLEVBQUMsYUFBYSxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUUxRSxPQUFPLEVBQWlELDZCQUE2QixJQUFJLE9BQU8sRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzNILE9BQU8sRUFBOEMsNkJBQTZCLElBQUksT0FBTyxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDOUgsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3BELE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBRTdELElBQU0sdUJBQXVCLEdBQUcsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUVsRCxJQUFNLG9CQUFvQixHQUFHLGFBQWEsQ0FBQztBQUUzQzs7Ozs7OztHQU9HO0FBQ0gsU0FBUyxrQkFBa0IsQ0FDdkIsS0FBa0IsRUFBRSxlQUF1QixFQUFFLGdCQUF5QjtJQUN4RSxpR0FBaUc7SUFDakcsOEZBQThGO0lBQzlGLGdHQUFnRztJQUNoRyxpQ0FBaUM7SUFDakMsU0FBUztRQUNMLFdBQVcsQ0FDUCxlQUFlLEVBQUUsZUFBZSxDQUFDLFdBQVcsRUFBRSxFQUFFLHNDQUFzQyxDQUFDLENBQUM7SUFDaEcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRTtRQUN2QixJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJLGdCQUFnQixJQUFJ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LEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFXLENBQUMsQ0FBQztpQkFDcEQ7YUFDRjtpQkFBTSxJQUFJLElBQUksa0JBQXdCLEVBQUU7Z0JBQ3ZDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDN0I7U0FDRjthQUFNO1lBQ0wsNEZBQTRGO1lBQzVGLDBGQUEwRjtZQUMxRix3RUFBd0U7WUFDeEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7Z0JBQUUsTUFBTTtZQUM3QixJQUFJLEdBQUcsYUFBYSxDQUFDO1NBQ3RCO1FBQ0QsQ0FBQyxFQUFFLENBQUM7S0FDTDtJQUNELE9BQU8sRUFBQyxLQUFLLE9BQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQzFCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAnLi4vdXRpbC9uZ19kZXZfbW9kZSc7XG5cbmltcG9ydCB7YXNzZXJ0RGVmaW5lZCwgYXNzZXJ0RXF1YWwsIGFzc2VydE5vdEVxdWFsfSBmcm9tICcuLi91dGlsL2Fzc2VydCc7XG5cbmltcG9ydCB7QXR0cmlidXRlTWFya2VyLCBUQXR0cmlidXRlcywgVE5vZGUsIFROb2RlVHlwZSwgdW51c2VkVmFsdWVFeHBvcnRUb1BsYWNhdGVBamQgYXMgdW51c2VkMX0gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtDc3NTZWxlY3RvciwgQ3NzU2VsZWN0b3JMaXN0LCBTZWxlY3RvckZsYWdzLCB1bnVzZWRWYWx1ZUV4cG9ydFRvUGxhY2F0ZUFqZCBhcyB1bnVzZWQyfSBmcm9tICcuL2ludGVyZmFjZXMvcHJvamVjdGlvbic7XG5pbXBvcnQge2NsYXNzSW5kZXhPZn0gZnJvbSAnLi9zdHlsaW5nL2NsYXNzX2RpZmZlcic7XG5pbXBvcnQge2lzTmFtZU9ubHlBdHRyaWJ1dGVNYXJrZXJ9IGZyb20gJy4vdXRpbC9hdHRyc191dGlscyc7XG5cbmNvbnN0IHVudXNlZFZhbHVlVG9QbGFjYXRlQWpkID0gdW51c2VkMSArIHVudXNlZDI7XG5cbmNvbnN0IE5HX1RFTVBMQVRFX1NFTEVDVE9SID0gJ25nLXRlbXBsYXRlJztcblxuLyoqXG4gKiBTZWFyY2ggdGhlIGBUQXR0cmlidXRlc2AgdG8gc2VlIGlmIGl0IGNvbnRhaW5zIGBjc3NDbGFzc1RvTWF0Y2hgIChjYXNlIGluc2Vuc2l0aXZlKVxuICpcbiAqIEBwYXJhbSBhdHRycyBgVEF0dHJpYnV0ZXNgIHRvIHNlYXJjaCB0aHJvdWdoLlxuICogQHBhcmFtIGNzc0NsYXNzVG9NYXRjaCBjbGFzcyB0byBtYXRjaCAobG93ZXJjYXNlKVxuICogQHBhcmFtIGlzUHJvamVjdGlvbk1vZGUgV2hldGhlciBvciBub3QgY2xhc3MgbWF0Y2hpbmcgc2hvdWxkIGxvb2sgaW50byB0aGUgYXR0cmlidXRlIGBjbGFzc2AgaW5cbiAqICAgIGFkZGl0aW9uIHRvIHRoZSBgQXR0cmlidXRlTWFya2VyLkNsYXNzZXNgLlxuICovXG5mdW5jdGlvbiBpc0Nzc0NsYXNzTWF0Y2hpbmcoXG4gICAgYXR0cnM6IFRBdHRyaWJ1dGVzLCBjc3NDbGFzc1RvTWF0Y2g6IHN0cmluZywgaXNQcm9qZWN0aW9uTW9kZTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAvLyBUT0RPKG1pc2tvKTogVGhlIGZhY3QgdGhhdCB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGtub3cgYWJvdXQgYGlzUHJvamVjdGlvbk1vZGVgIHNlZW1zIHN1c3BlY3QuXG4gIC8vIEl0IGlzIHN0cmFuZ2UgdG8gbWUgdGhhdCBzb21ldGltZXMgdGhlIGNsYXNzIGluZm9ybWF0aW9uIGNvbWVzIGluIGZvcm0gb2YgYGNsYXNzYCBhdHRyaWJ1dGVcbiAgLy8gYW5kIHNvbWV0aW1lcyBpbiBmb3JtIG9mIGBBdHRyaWJ1dGVNYXJrZXIuQ2xhc3Nlc2AuIFNvbWUgaW52ZXN0aWdhdGlvbiBpcyBuZWVkZWQgdG8gZGV0ZXJtaW5lXG4gIC8vIGlmIHRoYXQgaXMgdGhlIHJpZ2h0IGJlaGF2aW9yLlxuICBuZ0Rldk1vZGUgJiZcbiAgICAgIGFzc2VydEVxdWFsKFxuICAgICAgICAgIGNzc0NsYXNzVG9NYXRjaCwgY3NzQ2xhc3NUb01hdGNoLnRvTG93ZXJDYXNlKCksICdDbGFzcyBuYW1lIGV4cGVjdGVkIHRvIGJlIGxvd2VyY2FzZS4nKTtcbiAgbGV0IGkgPSAwO1xuICB3aGlsZSAoaSA8IGF0dHJzLmxlbmd0aCkge1xuICAgIGxldCBpdGVtID0gYXR0cnNbaSsrXTtcbiAgICBpZiAoaXNQcm9qZWN0aW9uTW9kZSAmJiBpdGVtID09PSAnY2xhc3MnKSB7XG4gICAgICBpdGVtID0gYXR0cnNbaV0gYXMgc3RyaW5nO1xuICAgICAgaWYgKGNsYXNzSW5kZXhPZihpdGVtLnRvTG93ZXJDYXNlKCksIGNzc0NsYXNzVG9NYXRjaCwgMCkgIT09IC0xKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXRlbSA9PT0gQXR0cmlidXRlTWFya2VyLkNsYXNzZXMpIHtcbiAgICAgIC8vIFdlIGZvdW5kIHRoZSBjbGFzc2VzIHNlY3Rpb24uIFN0YXJ0IHNlYXJjaGluZyBmb3IgdGhlIGNsYXNzLlxuICAgICAgd2hpbGUgKGkgPCBhdHRycy5sZW5ndGggJiYgdHlwZW9mKGl0ZW0gPSBhdHRyc1tpKytdKSA9PSAnc3RyaW5nJykge1xuICAgICAgICAvLyB3aGlsZSB3ZSBoYXZlIHN0cmluZ3NcbiAgICAgICAgaWYgKGl0ZW0udG9Mb3dlckNhc2UoKSA9PT0gY3NzQ2xhc3NUb01hdGNoKSByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRoYXQgY2hlY2tzIHdoZXRoZXIgYSBnaXZlbiB0Tm9kZSBtYXRjaGVzIHRhZy1iYXNlZCBzZWxlY3RvciBhbmQgaGFzIGEgdmFsaWQgdHlwZS5cbiAqXG4gKiBNYXRjaGluZyBjYW4gYmUgcGVyZm9ybWVkIGluIDIgbW9kZXM6IHByb2plY3Rpb24gbW9kZSAod2hlbiB3ZSBwcm9qZWN0IG5vZGVzKSBhbmQgcmVndWxhclxuICogZGlyZWN0aXZlIG1hdGNoaW5nIG1vZGU6XG4gKiAtIGluIHRoZSBcImRpcmVjdGl2ZSBtYXRjaGluZ1wiIG1vZGUgd2UgZG8gX25vdF8gdGFrZSBUQ29udGFpbmVyJ3MgdGFnTmFtZSBpbnRvIGFjY291bnQgaWYgaXQgaXNcbiAqIGRpZmZlcmVudCBmcm9tIE5HX1RFTVBMQVRFX1NFTEVDVE9SICh2YWx1ZSBkaWZmZXJlbnQgZnJvbSBOR19URU1QTEFURV9TRUxFQ1RPUiBpbmRpY2F0ZXMgdGhhdCBhXG4gKiB0YWcgbmFtZSB3YXMgZXh0cmFjdGVkIGZyb20gKiBzeW50YXggc28gd2Ugd291bGQgbWF0Y2ggdGhlIHNhbWUgZGlyZWN0aXZlIHR3aWNlKTtcbiAqIC0gaW4gdGhlIFwicHJvamVjdGlvblwiIG1vZGUsIHdlIHVzZSBhIHRhZyBuYW1lIHBvdGVudGlhbGx5IGV4dHJhY3RlZCBmcm9tIHRoZSAqIHN5bnRheCBwcm9jZXNzaW5nXG4gKiAoYXBwbGljYWJsZSB0byBUTm9kZVR5cGUuQ29udGFpbmVyIG9ubHkpLlxuICovXG5mdW5jdGlvbiBoYXNUYWdBbmRUeXBlTWF0Y2goXG4gICAgdE5vZGU6IFROb2RlLCBjdXJyZW50U2VsZWN0b3I6IHN0cmluZywgaXNQcm9qZWN0aW9uTW9kZTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICBjb25zdCB0YWdOYW1lVG9Db21wYXJlID0gdE5vZGUudHlwZSA9PT0gVE5vZGVUeXBlLkNvbnRhaW5lciAmJiAhaXNQcm9qZWN0aW9uTW9kZSA/XG4gICAgICBOR19URU1QTEFURV9TRUxFQ1RPUiA6XG4gICAgICB0Tm9kZS50YWdOYW1lO1xuICByZXR1cm4gY3VycmVudFNlbGVjdG9yID09PSB0YWdOYW1lVG9Db21wYXJlO1xufVxuXG4vKipcbiAqIEEgdXRpbGl0eSBmdW5jdGlvbiB0byBtYXRjaCBhbiBJdnkgbm9kZSBzdGF0aWMgZGF0YSBhZ2FpbnN0IGEgc2ltcGxlIENTUyBzZWxlY3RvclxuICpcbiAqIEBwYXJhbSBub2RlIHN0YXRpYyBkYXRhIG9mIHRoZSBub2RlIHRvIG1hdGNoXG4gKiBAcGFyYW0gc2VsZWN0b3IgVGhlIHNlbGVjdG9yIHRvIHRyeSBtYXRjaGluZyBhZ2FpbnN0IHRoZSBub2RlLlxuICogQHBhcmFtIGlzUHJvamVjdGlvbk1vZGUgaWYgYHRydWVgIHdlIGFyZSBtYXRjaGluZyBmb3IgY29udGVudCBwcm9qZWN0aW9uLCBvdGhlcndpc2Ugd2UgYXJlIGRvaW5nXG4gKiBkaXJlY3RpdmUgbWF0Y2hpbmcuXG4gKiBAcmV0dXJucyB0cnVlIGlmIG5vZGUgbWF0Y2hlcyB0aGUgc2VsZWN0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05vZGVNYXRjaGluZ1NlbGVjdG9yKFxuICAgIHROb2RlOiBUTm9kZSwgc2VsZWN0b3I6IENzc1NlbGVjdG9yLCBpc1Byb2plY3Rpb25Nb2RlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKHNlbGVjdG9yWzBdLCAnU2VsZWN0b3Igc2hvdWxkIGhhdmUgYSB0YWcgbmFtZScpO1xuICBsZXQgbW9kZTogU2VsZWN0b3JGbGFncyA9IFNlbGVjdG9yRmxhZ3MuRUxFTUVOVDtcbiAgY29uc3Qgbm9kZUF0dHJzID0gdE5vZGUuYXR0cnMgfHwgW107XG5cbiAgLy8gRmluZCB0aGUgaW5kZXggb2YgZmlyc3QgYXR0cmlidXRlIHRoYXQgaGFzIG5vIHZhbHVlLCBvbmx5IGEgbmFtZS5cbiAgY29uc3QgbmFtZU9ubHlNYXJrZXJJZHggPSBnZXROYW1lT25seU1hcmtlckluZGV4KG5vZGVBdHRycyk7XG5cbiAgLy8gV2hlbiBwcm9jZXNzaW5nIFwiOm5vdFwiIHNlbGVjdG9ycywgd2Ugc2tpcCB0byB0aGUgbmV4dCBcIjpub3RcIiBpZiB0aGVcbiAgLy8gY3VycmVudCBvbmUgZG9lc24ndCBtYXRjaFxuICBsZXQgc2tpcFRvTmV4dFNlbGVjdG9yID0gZmFsc2U7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rvci5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGN1cnJlbnQgPSBzZWxlY3RvcltpXTtcbiAgICBpZiAodHlwZW9mIGN1cnJlbnQgPT09ICdudW1iZXInKSB7XG4gICAgICAvLyBJZiB3ZSBmaW5pc2ggcHJvY2Vzc2luZyBhIDpub3Qgc2VsZWN0b3IgYW5kIGl0IGhhc24ndCBmYWlsZWQsIHJldHVybiBmYWxzZVxuICAgICAgaWYgKCFza2lwVG9OZXh0U2VsZWN0b3IgJiYgIWlzUG9zaXRpdmUobW9kZSkgJiYgIWlzUG9zaXRpdmUoY3VycmVudCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gSWYgd2UgYXJlIHNraXBwaW5nIHRvIHRoZSBuZXh0IDpub3QoKSBhbmQgdGhpcyBtb2RlIGZsYWcgaXMgcG9zaXRpdmUsXG4gICAgICAvLyBpdCdzIGEgcGFydCBvZiB0aGUgY3VycmVudCA6bm90KCkgc2VsZWN0b3IsIGFuZCB3ZSBzaG91bGQga2VlcCBza2lwcGluZ1xuICAgICAgaWYgKHNraXBUb05leHRTZWxlY3RvciAmJiBpc1Bvc2l0aXZlKGN1cnJlbnQpKSBjb250aW51ZTtcbiAgICAgIHNraXBUb05leHRTZWxlY3RvciA9IGZhbHNlO1xuICAgICAgbW9kZSA9IChjdXJyZW50IGFzIG51bWJlcikgfCAobW9kZSAmIFNlbGVjdG9yRmxhZ3MuTk9UKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChza2lwVG9OZXh0U2VsZWN0b3IpIGNvbnRpbnVlO1xuXG4gICAgaWYgKG1vZGUgJiBTZWxlY3RvckZsYWdzLkVMRU1FTlQpIHtcbiAgICAgIG1vZGUgPSBTZWxlY3RvckZsYWdzLkFUVFJJQlVURSB8IG1vZGUgJiBTZWxlY3RvckZsYWdzLk5PVDtcbiAgICAgIGlmIChjdXJyZW50ICE9PSAnJyAmJiAhaGFzVGFnQW5kVHlwZU1hdGNoKHROb2RlLCBjdXJyZW50LCBpc1Byb2plY3Rpb25Nb2RlKSB8fFxuICAgICAgICAgIGN1cnJlbnQgPT09ICcnICYmIHNlbGVjdG9yLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBpZiAoaXNQb3NpdGl2ZShtb2RlKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBza2lwVG9OZXh0U2VsZWN0b3IgPSB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzZWxlY3RvckF0dHJWYWx1ZSA9IG1vZGUgJiBTZWxlY3RvckZsYWdzLkNMQVNTID8gY3VycmVudCA6IHNlbGVjdG9yWysraV07XG5cbiAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgbWF0Y2hpbmcgYWdhaW5zdCBjbGFzc2VzIHdoZW4gYSB0Tm9kZSBoYXMgYmVlbiBpbnN0YW50aWF0ZWQgd2l0aFxuICAgICAgLy8gY2xhc3MgYW5kIHN0eWxlIHZhbHVlcyBhcyBzZXBhcmF0ZSBhdHRyaWJ1dGUgdmFsdWVzIChlLmcuIFsndGl0bGUnLCBDTEFTUywgJ2ZvbyddKVxuICAgICAgaWYgKChtb2RlICYgU2VsZWN0b3JGbGFncy5DTEFTUykgJiYgdE5vZGUuYXR0cnMgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKCFpc0Nzc0NsYXNzTWF0Y2hpbmcodE5vZGUuYXR0cnMsIHNlbGVjdG9yQXR0clZhbHVlIGFzIHN0cmluZywgaXNQcm9qZWN0aW9uTW9kZSkpIHtcbiAgICAgICAgICBpZiAoaXNQb3NpdGl2ZShtb2RlKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIHNraXBUb05leHRTZWxlY3RvciA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlzSW5saW5lVGVtcGxhdGUgPVxuICAgICAgICAgIHROb2RlLnR5cGUgPT0gVE5vZGVUeXBlLkNvbnRhaW5lciAmJiB0Tm9kZS50YWdOYW1lICE9PSBOR19URU1QTEFURV9TRUxFQ1RPUjtcbiAgICAgIGNvbnN0IGF0dHJOYW1lID0gKG1vZGUgJiBTZWxlY3RvckZsYWdzLkNMQVNTKSA/ICdjbGFzcycgOiBjdXJyZW50O1xuICAgICAgY29uc3QgYXR0ckluZGV4SW5Ob2RlID1cbiAgICAgICAgICBmaW5kQXR0ckluZGV4SW5Ob2RlKGF0dHJOYW1lLCBub2RlQXR0cnMsIGlzSW5saW5lVGVtcGxhdGUsIGlzUHJvamVjdGlvbk1vZGUpO1xuXG4gICAgICBpZiAoYXR0ckluZGV4SW5Ob2RlID09PSAtMSkge1xuICAgICAgICBpZiAoaXNQb3NpdGl2ZShtb2RlKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBza2lwVG9OZXh0U2VsZWN0b3IgPSB0cnVlO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGVjdG9yQXR0clZhbHVlICE9PSAnJykge1xuICAgICAgICBsZXQgbm9kZUF0dHJWYWx1ZTogc3RyaW5nO1xuICAgICAgICBpZiAoYXR0ckluZGV4SW5Ob2RlID4gbmFtZU9ubHlNYXJrZXJJZHgpIHtcbiAgICAgICAgICBub2RlQXR0clZhbHVlID0gJyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmdEZXZNb2RlICYmIGFzc2VydE5vdEVxdWFsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZUF0dHJzW2F0dHJJbmRleEluTm9kZV0sIEF0dHJpYnV0ZU1hcmtlci5OYW1lc3BhY2VVUkksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnV2UgZG8gbm90IG1hdGNoIGRpcmVjdGl2ZXMgb24gbmFtZXNwYWNlZCBhdHRyaWJ1dGVzJyk7XG4gICAgICAgICAgLy8gd2UgbG93ZXJjYXNlIHRoZSBhdHRyaWJ1dGUgdmFsdWUgdG8gYmUgYWJsZSB0byBtYXRjaFxuICAgICAgICAgIC8vIHNlbGVjdG9ycyB3aXRob3V0IGNhc2Utc2Vuc2l0aXZpdHlcbiAgICAgICAgICAvLyAoc2VsZWN0b3JzIGFyZSBhbHJlYWR5IGluIGxvd2VyY2FzZSB3aGVuIGdlbmVyYXRlZClcbiAgICAgICAgICBub2RlQXR0clZhbHVlID0gKG5vZGVBdHRyc1thdHRySW5kZXhJbk5vZGUgKyAxXSBhcyBzdHJpbmcpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb21wYXJlQWdhaW5zdENsYXNzTmFtZSA9IG1vZGUgJiBTZWxlY3RvckZsYWdzLkNMQVNTID8gbm9kZUF0dHJWYWx1ZSA6IG51bGw7XG4gICAgICAgIGlmIChjb21wYXJlQWdhaW5zdENsYXNzTmFtZSAmJlxuICAgICAgICAgICAgICAgIGNsYXNzSW5kZXhPZihjb21wYXJlQWdhaW5zdENsYXNzTmFtZSwgc2VsZWN0b3JBdHRyVmFsdWUgYXMgc3RyaW5nLCAwKSAhPT0gLTEgfHxcbiAgICAgICAgICAgIG1vZGUgJiBTZWxlY3RvckZsYWdzLkFUVFJJQlVURSAmJiBzZWxlY3RvckF0dHJWYWx1ZSAhPT0gbm9kZUF0dHJWYWx1ZSkge1xuICAgICAgICAgIGlmIChpc1Bvc2l0aXZlKG1vZGUpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgc2tpcFRvTmV4dFNlbGVjdG9yID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpc1Bvc2l0aXZlKG1vZGUpIHx8IHNraXBUb05leHRTZWxlY3Rvcjtcbn1cblxuZnVuY3Rpb24gaXNQb3NpdGl2ZShtb2RlOiBTZWxlY3RvckZsYWdzKTogYm9vbGVhbiB7XG4gIHJldHVybiAobW9kZSAmIFNlbGVjdG9yRmxhZ3MuTk9UKSA9PT0gMDtcbn1cblxuLyoqXG4gKiBFeGFtaW5lcyB0aGUgYXR0cmlidXRlJ3MgZGVmaW5pdGlvbiBhcnJheSBmb3IgYSBub2RlIHRvIGZpbmQgdGhlIGluZGV4IG9mIHRoZVxuICogYXR0cmlidXRlIHRoYXQgbWF0Y2hlcyB0aGUgZ2l2ZW4gYG5hbWVgLlxuICpcbiAqIE5PVEU6IFRoaXMgd2lsbCBub3QgbWF0Y2ggbmFtZXNwYWNlZCBhdHRyaWJ1dGVzLlxuICpcbiAqIEF0dHJpYnV0ZSBtYXRjaGluZyBkZXBlbmRzIHVwb24gYGlzSW5saW5lVGVtcGxhdGVgIGFuZCBgaXNQcm9qZWN0aW9uTW9kZWAuXG4gKiBUaGUgZm9sbG93aW5nIHRhYmxlIHN1bW1hcml6ZXMgd2hpY2ggdHlwZXMgb2YgYXR0cmlidXRlcyB3ZSBhdHRlbXB0IHRvIG1hdGNoOlxuICpcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBNb2RlcyAgICAgICAgICAgICAgICAgICB8IE5vcm1hbCBBdHRyaWJ1dGVzIHwgQmluZGluZ3MgQXR0cmlidXRlcyB8IFRlbXBsYXRlIEF0dHJpYnV0ZXMgfCBJMThuXG4gKiBBdHRyaWJ1dGVzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogSW5saW5lICsgUHJvamVjdGlvbiAgICAgfCBZRVMgICAgICAgICAgICAgICB8IFlFUyAgICAgICAgICAgICAgICAgfCBOTyAgICAgICAgICAgICAgICAgIHwgWUVTXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogSW5saW5lICsgRGlyZWN0aXZlICAgICAgfCBOTyAgICAgICAgICAgICAgICB8IE5PICAgICAgICAgICAgICAgICAgfCBZRVMgICAgICAgICAgICAgICAgIHwgTk9cbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiBOb24taW5saW5lICsgUHJvamVjdGlvbiB8IFlFUyAgICAgICAgICAgICAgIHwgWUVTICAgICAgICAgICAgICAgICB8IE5PICAgICAgICAgICAgICAgICAgfCBZRVNcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiBOb24taW5saW5lICsgRGlyZWN0aXZlICB8IFlFUyAgICAgICAgICAgICAgIHwgWUVTICAgICAgICAgICAgICAgICB8IE5PICAgICAgICAgICAgICAgICAgfCBZRVNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKlxuICogQHBhcmFtIG5hbWUgdGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZSB0byBmaW5kXG4gKiBAcGFyYW0gYXR0cnMgdGhlIGF0dHJpYnV0ZSBhcnJheSB0byBleGFtaW5lXG4gKiBAcGFyYW0gaXNJbmxpbmVUZW1wbGF0ZSB0cnVlIGlmIHRoZSBub2RlIGJlaW5nIG1hdGNoZWQgaXMgYW4gaW5saW5lIHRlbXBsYXRlIChlLmcuIGAqbmdGb3JgKVxuICogcmF0aGVyIHRoYW4gYSBtYW51YWxseSBleHBhbmRlZCB0ZW1wbGF0ZSBub2RlIChlLmcgYDxuZy10ZW1wbGF0ZT5gKS5cbiAqIEBwYXJhbSBpc1Byb2plY3Rpb25Nb2RlIHRydWUgaWYgd2UgYXJlIG1hdGNoaW5nIGFnYWluc3QgY29udGVudCBwcm9qZWN0aW9uIG90aGVyd2lzZSB3ZSBhcmVcbiAqIG1hdGNoaW5nIGFnYWluc3QgZGlyZWN0aXZlcy5cbiAqL1xuZnVuY3Rpb24gZmluZEF0dHJJbmRleEluTm9kZShcbiAgICBuYW1lOiBzdHJpbmcsIGF0dHJzOiBUQXR0cmlidXRlcyB8IG51bGwsIGlzSW5saW5lVGVtcGxhdGU6IGJvb2xlYW4sXG4gICAgaXNQcm9qZWN0aW9uTW9kZTogYm9vbGVhbik6IG51bWJlciB7XG4gIGlmIChhdHRycyA9PT0gbnVsbCkgcmV0dXJuIC0xO1xuXG4gIGxldCBpID0gMDtcblxuICBpZiAoaXNQcm9qZWN0aW9uTW9kZSB8fCAhaXNJbmxpbmVUZW1wbGF0ZSkge1xuICAgIGxldCBiaW5kaW5nc01vZGUgPSBmYWxzZTtcbiAgICB3aGlsZSAoaSA8IGF0dHJzLmxlbmd0aCkge1xuICAgICAgY29uc3QgbWF5YmVBdHRyTmFtZSA9IGF0dHJzW2ldO1xuICAgICAgaWYgKG1heWJlQXR0ck5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIG1heWJlQXR0ck5hbWUgPT09IEF0dHJpYnV0ZU1hcmtlci5CaW5kaW5ncyB8fCBtYXliZUF0dHJOYW1lID09PSBBdHRyaWJ1dGVNYXJrZXIuSTE4bikge1xuICAgICAgICBiaW5kaW5nc01vZGUgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICBtYXliZUF0dHJOYW1lID09PSBBdHRyaWJ1dGVNYXJrZXIuQ2xhc3NlcyB8fCBtYXliZUF0dHJOYW1lID09PSBBdHRyaWJ1dGVNYXJrZXIuU3R5bGVzKSB7XG4gICAgICAgIGxldCB2YWx1ZSA9IGF0dHJzWysraV07XG4gICAgICAgIC8vIFdlIHNob3VsZCBza2lwIGNsYXNzZXMgaGVyZSBiZWNhdXNlIHdlIGhhdmUgYSBzZXBhcmF0ZSBtZWNoYW5pc20gZm9yXG4gICAgICAgIC8vIG1hdGNoaW5nIGNsYXNzZXMgaW4gcHJvamVjdGlvbiBtb2RlLlxuICAgICAgICB3aGlsZSAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHZhbHVlID0gYXR0cnNbKytpXTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSBpZiAobWF5YmVBdHRyTmFtZSA9PT0gQXR0cmlidXRlTWFya2VyLlRlbXBsYXRlKSB7XG4gICAgICAgIC8vIFdlIGRvIG5vdCBjYXJlIGFib3V0IFRlbXBsYXRlIGF0dHJpYnV0ZXMgaW4gdGhpcyBzY2VuYXJpby5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2UgaWYgKG1heWJlQXR0ck5hbWUgPT09IEF0dHJpYnV0ZU1hcmtlci5OYW1lc3BhY2VVUkkpIHtcbiAgICAgICAgLy8gU2tpcCB0aGUgd2hvbGUgbmFtZXNwYWNlZCBhdHRyaWJ1dGUgYW5kIHZhbHVlLiBUaGlzIGlzIGJ5IGRlc2lnbi5cbiAgICAgICAgaSArPSA0O1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIC8vIEluIGJpbmRpbmcgbW9kZSB0aGVyZSBhcmUgb25seSBuYW1lcywgcmF0aGVyIHRoYW4gbmFtZS12YWx1ZSBwYWlycy5cbiAgICAgIGkgKz0gYmluZGluZ3NNb2RlID8gMSA6IDI7XG4gICAgfVxuICAgIC8vIFdlIGRpZCBub3QgbWF0Y2ggdGhlIGF0dHJpYnV0ZVxuICAgIHJldHVybiAtMTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbWF0Y2hUZW1wbGF0ZUF0dHJpYnV0ZShhdHRycywgbmFtZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JMaXN0KFxuICAgIHROb2RlOiBUTm9kZSwgc2VsZWN0b3I6IENzc1NlbGVjdG9yTGlzdCwgaXNQcm9qZWN0aW9uTW9kZTogYm9vbGVhbiA9IGZhbHNlKTogYm9vbGVhbiB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0b3IubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoaXNOb2RlTWF0Y2hpbmdTZWxlY3Rvcih0Tm9kZSwgc2VsZWN0b3JbaV0sIGlzUHJvamVjdGlvbk1vZGUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm9qZWN0QXNBdHRyVmFsdWUodE5vZGU6IFROb2RlKTogQ3NzU2VsZWN0b3J8bnVsbCB7XG4gIGNvbnN0IG5vZGVBdHRycyA9IHROb2RlLmF0dHJzO1xuICBpZiAobm9kZUF0dHJzICE9IG51bGwpIHtcbiAgICBjb25zdCBuZ1Byb2plY3RBc0F0dHJJZHggPSBub2RlQXR0cnMuaW5kZXhPZihBdHRyaWJ1dGVNYXJrZXIuUHJvamVjdEFzKTtcbiAgICAvLyBvbmx5IGNoZWNrIGZvciBuZ1Byb2plY3RBcyBpbiBhdHRyaWJ1dGUgbmFtZXMsIGRvbid0IGFjY2lkZW50YWxseSBtYXRjaCBhdHRyaWJ1dGUncyB2YWx1ZVxuICAgIC8vIChhdHRyaWJ1dGUgbmFtZXMgYXJlIHN0b3JlZCBhdCBldmVuIGluZGV4ZXMpXG4gICAgaWYgKChuZ1Byb2plY3RBc0F0dHJJZHggJiAxKSA9PT0gMCkge1xuICAgICAgcmV0dXJuIG5vZGVBdHRyc1tuZ1Byb2plY3RBc0F0dHJJZHggKyAxXSBhcyBDc3NTZWxlY3RvcjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldE5hbWVPbmx5TWFya2VySW5kZXgobm9kZUF0dHJzOiBUQXR0cmlidXRlcykge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVBdHRycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG5vZGVBdHRyID0gbm9kZUF0dHJzW2ldO1xuICAgIGlmIChpc05hbWVPbmx5QXR0cmlidXRlTWFya2VyKG5vZGVBdHRyKSkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiBub2RlQXR0cnMubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBtYXRjaFRlbXBsYXRlQXR0cmlidXRlKGF0dHJzOiBUQXR0cmlidXRlcywgbmFtZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgbGV0IGkgPSBhdHRycy5pbmRleE9mKEF0dHJpYnV0ZU1hcmtlci5UZW1wbGF0ZSk7XG4gIGlmIChpID4gLTEpIHtcbiAgICBpKys7XG4gICAgd2hpbGUgKGkgPCBhdHRycy5sZW5ndGgpIHtcbiAgICAgIGlmIChhdHRyc1tpXSA9PT0gbmFtZSkgcmV0dXJuIGk7XG4gICAgICBpKys7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhIHNlbGVjdG9yIGlzIGluc2lkZSBhIENzc1NlbGVjdG9yTGlzdFxuICogQHBhcmFtIHNlbGVjdG9yIFNlbGVjdG9yIHRvIGJlIGNoZWNrZWQuXG4gKiBAcGFyYW0gbGlzdCBMaXN0IGluIHdoaWNoIHRvIGxvb2sgZm9yIHRoZSBzZWxlY3Rvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU2VsZWN0b3JJblNlbGVjdG9yTGlzdChzZWxlY3RvcjogQ3NzU2VsZWN0b3IsIGxpc3Q6IENzc1NlbGVjdG9yTGlzdCk6IGJvb2xlYW4ge1xuICBzZWxlY3Rvckxpc3RMb29wOiBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjdXJyZW50U2VsZWN0b3JJbkxpc3QgPSBsaXN0W2ldO1xuICAgIGlmIChzZWxlY3Rvci5sZW5ndGggIT09IGN1cnJlbnRTZWxlY3RvckluTGlzdC5sZW5ndGgpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNlbGVjdG9yLmxlbmd0aDsgaisrKSB7XG4gICAgICBpZiAoc2VsZWN0b3Jbal0gIT09IGN1cnJlbnRTZWxlY3RvckluTGlzdFtqXSkge1xuICAgICAgICBjb250aW51ZSBzZWxlY3Rvckxpc3RMb29wO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG1heWJlV3JhcEluTm90U2VsZWN0b3IoaXNOZWdhdGl2ZU1vZGU6IGJvb2xlYW4sIGNodW5rOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaXNOZWdhdGl2ZU1vZGUgPyAnOm5vdCgnICsgY2h1bmsudHJpbSgpICsgJyknIDogY2h1bms7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeUNTU1NlbGVjdG9yKHNlbGVjdG9yOiBDc3NTZWxlY3Rvcik6IHN0cmluZyB7XG4gIGxldCByZXN1bHQgPSBzZWxlY3RvclswXSBhcyBzdHJpbmc7XG4gIGxldCBpID0gMTtcbiAgbGV0IG1vZGUgPSBTZWxlY3RvckZsYWdzLkFUVFJJQlVURTtcbiAgbGV0IGN1cnJlbnRDaHVuayA9ICcnO1xuICBsZXQgaXNOZWdhdGl2ZU1vZGUgPSBmYWxzZTtcbiAgd2hpbGUgKGkgPCBzZWxlY3Rvci5sZW5ndGgpIHtcbiAgICBsZXQgdmFsdWVPck1hcmtlciA9IHNlbGVjdG9yW2ldO1xuICAgIGlmICh0eXBlb2YgdmFsdWVPck1hcmtlciA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChtb2RlICYgU2VsZWN0b3JGbGFncy5BVFRSSUJVVEUpIHtcbiAgICAgICAgY29uc3QgYXR0clZhbHVlID0gc2VsZWN0b3JbKytpXSBhcyBzdHJpbmc7XG4gICAgICAgIGN1cnJlbnRDaHVuayArPVxuICAgICAgICAgICAgJ1snICsgdmFsdWVPck1hcmtlciArIChhdHRyVmFsdWUubGVuZ3RoID4gMCA/ICc9XCInICsgYXR0clZhbHVlICsgJ1wiJyA6ICcnKSArICddJztcbiAgICAgIH0gZWxzZSBpZiAobW9kZSAmIFNlbGVjdG9yRmxhZ3MuQ0xBU1MpIHtcbiAgICAgICAgY3VycmVudENodW5rICs9ICcuJyArIHZhbHVlT3JNYXJrZXI7XG4gICAgICB9IGVsc2UgaWYgKG1vZGUgJiBTZWxlY3RvckZsYWdzLkVMRU1FTlQpIHtcbiAgICAgICAgY3VycmVudENodW5rICs9ICcgJyArIHZhbHVlT3JNYXJrZXI7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vXG4gICAgICAvLyBBcHBlbmQgY3VycmVudCBjaHVuayB0byB0aGUgZmluYWwgcmVzdWx0IGluIGNhc2Ugd2UgY29tZSBhY3Jvc3MgU2VsZWN0b3JGbGFnLCB3aGljaFxuICAgICAgLy8gaW5kaWNhdGVzIHRoYXQgdGhlIHByZXZpb3VzIHNlY3Rpb24gb2YgYSBzZWxlY3RvciBpcyBvdmVyLiBXZSBuZWVkIHRvIGFjY3VtdWxhdGUgY29udGVudFxuICAgICAgLy8gYmV0d2VlbiBmbGFncyB0byBtYWtlIHN1cmUgd2Ugd3JhcCB0aGUgY2h1bmsgbGF0ZXIgaW4gOm5vdCgpIHNlbGVjdG9yIGlmIG5lZWRlZCwgZS5nLlxuICAgICAgLy8gYGBgXG4gICAgICAvLyAgWycnLCBGbGFncy5DTEFTUywgJy5jbGFzc0EnLCBGbGFncy5DTEFTUyB8IEZsYWdzLk5PVCwgJy5jbGFzc0InLCAnLmNsYXNzQyddXG4gICAgICAvLyBgYGBcbiAgICAgIC8vIHNob3VsZCBiZSB0cmFuc2Zvcm1lZCB0byBgLmNsYXNzQSA6bm90KC5jbGFzc0IgLmNsYXNzQylgLlxuICAgICAgLy9cbiAgICAgIC8vIE5vdGU6IGZvciBuZWdhdGl2ZSBzZWxlY3RvciBwYXJ0LCB3ZSBhY2N1bXVsYXRlIGNvbnRlbnQgYmV0d2VlbiBmbGFncyB1bnRpbCB3ZSBmaW5kIHRoZVxuICAgICAgLy8gbmV4dCBuZWdhdGl2ZSBmbGFnLiBUaGlzIGlzIG5lZWRlZCB0byBzdXBwb3J0IGEgY2FzZSB3aGVyZSBgOm5vdCgpYCBydWxlIGNvbnRhaW5zIG1vcmUgdGhhblxuICAgICAgLy8gb25lIGNodW5rLCBlLmcuIHRoZSBmb2xsb3dpbmcgc2VsZWN0b3I6XG4gICAgICAvLyBgYGBcbiAgICAgIC8vICBbJycsIEZsYWdzLkVMRU1FTlQgfCBGbGFncy5OT1QsICdwJywgRmxhZ3MuQ0xBU1MsICdmb28nLCBGbGFncy5DTEFTUyB8IEZsYWdzLk5PVCwgJ2JhciddXG4gICAgICAvLyBgYGBcbiAgICAgIC8vIHNob3VsZCBiZSBzdHJpbmdpZmllZCB0byBgOm5vdChwLmZvbykgOm5vdCguYmFyKWBcbiAgICAgIC8vXG4gICAgICBpZiAoY3VycmVudENodW5rICE9PSAnJyAmJiAhaXNQb3NpdGl2ZSh2YWx1ZU9yTWFya2VyKSkge1xuICAgICAgICByZXN1bHQgKz0gbWF5YmVXcmFwSW5Ob3RTZWxlY3Rvcihpc05lZ2F0aXZlTW9kZSwgY3VycmVudENodW5rKTtcbiAgICAgICAgY3VycmVudENodW5rID0gJyc7XG4gICAgICB9XG4gICAgICBtb2RlID0gdmFsdWVPck1hcmtlcjtcbiAgICAgIC8vIEFjY29yZGluZyB0byBDc3NTZWxlY3RvciBzcGVjLCBvbmNlIHdlIGNvbWUgYWNyb3NzIGBTZWxlY3RvckZsYWdzLk5PVGAgZmxhZywgdGhlIG5lZ2F0aXZlXG4gICAgICAvLyBtb2RlIGlzIG1haW50YWluZWQgZm9yIHJlbWFpbmluZyBjaHVua3Mgb2YgYSBzZWxlY3Rvci5cbiAgICAgIGlzTmVnYXRpdmVNb2RlID0gaXNOZWdhdGl2ZU1vZGUgfHwgIWlzUG9zaXRpdmUobW9kZSk7XG4gICAgfVxuICAgIGkrKztcbiAgfVxuICBpZiAoY3VycmVudENodW5rICE9PSAnJykge1xuICAgIHJlc3VsdCArPSBtYXliZVdyYXBJbk5vdFNlbGVjdG9yKGlzTmVnYXRpdmVNb2RlLCBjdXJyZW50Q2h1bmspO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBDU1Mgc2VsZWN0b3IgaW4gcGFyc2VkIGZvcm0uXG4gKlxuICogQ29tcG9uZW50RGVmIGFuZCBEaXJlY3RpdmVEZWYgYXJlIGdlbmVyYXRlZCB3aXRoIHRoZSBzZWxlY3RvciBpbiBwYXJzZWQgZm9ybSB0byBhdm9pZCBkb2luZ1xuICogYWRkaXRpb25hbCBwYXJzaW5nIGF0IHJ1bnRpbWUgKGZvciBleGFtcGxlLCBmb3IgZGlyZWN0aXZlIG1hdGNoaW5nKS4gSG93ZXZlciBpbiBzb21lIGNhc2VzIChmb3JcbiAqIGV4YW1wbGUsIHdoaWxlIGJvb3RzdHJhcHBpbmcgYSBjb21wb25lbnQpLCBhIHN0cmluZyB2ZXJzaW9uIG9mIHRoZSBzZWxlY3RvciBpcyByZXF1aXJlZCB0byBxdWVyeVxuICogZm9yIHRoZSBob3N0IGVsZW1lbnQgb24gdGhlIHBhZ2UuIFRoaXMgZnVuY3Rpb24gdGFrZXMgdGhlIHBhcnNlZCBmb3JtIG9mIGEgc2VsZWN0b3IgYW5kIHJldHVybnNcbiAqIGl0cyBzdHJpbmcgcmVwcmVzZW50YXRpb24uXG4gKlxuICogQHBhcmFtIHNlbGVjdG9yTGlzdCBzZWxlY3RvciBpbiBwYXJzZWQgZm9ybVxuICogQHJldHVybnMgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgZ2l2ZW4gc2VsZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeUNTU1NlbGVjdG9yTGlzdChzZWxlY3Rvckxpc3Q6IENzc1NlbGVjdG9yTGlzdCk6IHN0cmluZyB7XG4gIHJldHVybiBzZWxlY3Rvckxpc3QubWFwKHN0cmluZ2lmeUNTU1NlbGVjdG9yKS5qb2luKCcsJyk7XG59XG5cbi8qKlxuICogRXh0cmFjdHMgYXR0cmlidXRlcyBhbmQgY2xhc3NlcyBpbmZvcm1hdGlvbiBmcm9tIGEgZ2l2ZW4gQ1NTIHNlbGVjdG9yLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB3aGlsZSBjcmVhdGluZyBhIGNvbXBvbmVudCBkeW5hbWljYWxseS4gSW4gdGhpcyBjYXNlLCB0aGUgaG9zdCBlbGVtZW50XG4gKiAodGhhdCBpcyBjcmVhdGVkIGR5bmFtaWNhbGx5KSBzaG91bGQgY29udGFpbiBhdHRyaWJ1dGVzIGFuZCBjbGFzc2VzIHNwZWNpZmllZCBpbiBjb21wb25lbnQncyBDU1NcbiAqIHNlbGVjdG9yLlxuICpcbiAqIEBwYXJhbSBzZWxlY3RvciBDU1Mgc2VsZWN0b3IgaW4gcGFyc2VkIGZvcm0gKGluIGEgZm9ybSBvZiBhcnJheSlcbiAqIEByZXR1cm5zIG9iamVjdCB3aXRoIGBhdHRyc2AgYW5kIGBjbGFzc2VzYCBmaWVsZHMgdGhhdCBjb250YWluIGV4dHJhY3RlZCBpbmZvcm1hdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEF0dHJzQW5kQ2xhc3Nlc0Zyb21TZWxlY3RvcihzZWxlY3RvcjogQ3NzU2VsZWN0b3IpOlxuICAgIHthdHRyczogc3RyaW5nW10sIGNsYXNzZXM6IHN0cmluZ1tdfSB7XG4gIGNvbnN0IGF0dHJzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBjbGFzc2VzOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgaSA9IDE7XG4gIGxldCBtb2RlID0gU2VsZWN0b3JGbGFncy5BVFRSSUJVVEU7XG4gIHdoaWxlIChpIDwgc2VsZWN0b3IubGVuZ3RoKSB7XG4gICAgbGV0IHZhbHVlT3JNYXJrZXIgPSBzZWxlY3RvcltpXTtcbiAgICBpZiAodHlwZW9mIHZhbHVlT3JNYXJrZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAobW9kZSA9PT0gU2VsZWN0b3JGbGFncy5BVFRSSUJVVEUpIHtcbiAgICAgICAgaWYgKHZhbHVlT3JNYXJrZXIgIT09ICcnKSB7XG4gICAgICAgICAgYXR0cnMucHVzaCh2YWx1ZU9yTWFya2VyLCBzZWxlY3RvclsrK2ldIGFzIHN0cmluZyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gU2VsZWN0b3JGbGFncy5DTEFTUykge1xuICAgICAgICBjbGFzc2VzLnB1c2godmFsdWVPck1hcmtlcik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEFjY29yZGluZyB0byBDc3NTZWxlY3RvciBzcGVjLCBvbmNlIHdlIGNvbWUgYWNyb3NzIGBTZWxlY3RvckZsYWdzLk5PVGAgZmxhZywgdGhlIG5lZ2F0aXZlXG4gICAgICAvLyBtb2RlIGlzIG1haW50YWluZWQgZm9yIHJlbWFpbmluZyBjaHVua3Mgb2YgYSBzZWxlY3Rvci4gU2luY2UgYXR0cmlidXRlcyBhbmQgY2xhc3NlcyBhcmVcbiAgICAgIC8vIGV4dHJhY3RlZCBvbmx5IGZvciBcInBvc2l0aXZlXCIgcGFydCBvZiB0aGUgc2VsZWN0b3IsIHdlIGNhbiBzdG9wIGhlcmUuXG4gICAgICBpZiAoIWlzUG9zaXRpdmUobW9kZSkpIGJyZWFrO1xuICAgICAgbW9kZSA9IHZhbHVlT3JNYXJrZXI7XG4gICAgfVxuICAgIGkrKztcbiAgfVxuICByZXR1cm4ge2F0dHJzLCBjbGFzc2VzfTtcbn0iXX0=