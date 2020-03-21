/**
 * @fileoverview added by tsickle
 * Generated from: packages/platform-browser/testing/src/matchers.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵgetDOM as getDOM } from '@angular/common';
import { ɵglobal as global } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { childNodesAsList, hasClass, hasStyle, isCommentNode } from './browser_util';
/**
 * Jasmine matchers that check Angular specific conditions.
 *
 * Note: These matchers will only work in a browser environment.
 * @record
 * @template T
 */
export function NgMatchers() { }
if (false) {
    /**
     * Invert the matchers.
     * @type {?}
     */
    NgMatchers.prototype.not;
    /**
     * Expect the value to be a `Promise`.
     *
     * \@usageNotes
     * ### Example
     *
     * {\@example testing/ts/matchers.ts region='toBePromise'}
     * @return {?}
     */
    NgMatchers.prototype.toBePromise = function () { };
    /**
     * Expect the value to be an instance of a class.
     *
     * \@usageNotes
     * ### Example
     *
     * {\@example testing/ts/matchers.ts region='toBeAnInstanceOf'}
     * @param {?} expected
     * @return {?}
     */
    NgMatchers.prototype.toBeAnInstanceOf = function (expected) { };
    /**
     * Expect the element to have exactly the given text.
     *
     * \@usageNotes
     * ### Example
     *
     * {\@example testing/ts/matchers.ts region='toHaveText'}
     * @param {?} expected
     * @return {?}
     */
    NgMatchers.prototype.toHaveText = function (expected) { };
    /**
     * Expect the element to have the given CSS class.
     *
     * \@usageNotes
     * ### Example
     *
     * {\@example testing/ts/matchers.ts region='toHaveCssClass'}
     * @param {?} expected
     * @return {?}
     */
    NgMatchers.prototype.toHaveCssClass = function (expected) { };
    /**
     * Expect the element to have the given CSS styles.
     *
     * \@usageNotes
     * ### Example
     *
     * {\@example testing/ts/matchers.ts region='toHaveCssStyle'}
     * @param {?} expected
     * @return {?}
     */
    NgMatchers.prototype.toHaveCssStyle = function (expected) { };
    /**
     * Expect a class to implement the interface of the given class.
     *
     * \@usageNotes
     * ### Example
     *
     * {\@example testing/ts/matchers.ts region='toImplement'}
     * @param {?} expected
     * @return {?}
     */
    NgMatchers.prototype.toImplement = function (expected) { };
    /**
     * Expect an exception to contain the given error text.
     *
     * \@usageNotes
     * ### Example
     *
     * {\@example testing/ts/matchers.ts region='toContainError'}
     * @param {?} expected
     * @return {?}
     */
    NgMatchers.prototype.toContainError = function (expected) { };
    /**
     * Expect a component of the given type to show.
     * @param {?} expectedComponentType
     * @param {?=} expectationFailOutput
     * @return {?}
     */
    NgMatchers.prototype.toContainComponent = function (expectedComponentType, expectationFailOutput) { };
}
/** @type {?} */
const _global = (/** @type {?} */ ((typeof window === 'undefined' ? global : window)));
/**
 * Jasmine matching function with Angular matchers mixed in.
 *
 * ## Example
 *
 * {\@example testing/ts/matchers.ts region='toHaveText'}
 * @type {?}
 */
export const expect = _global.expect;
// Some Map polyfills don't polyfill Map.toString correctly, which
// gives us bad error messages in tests.
// The only way to do this in Jasmine is to monkey patch a method
// to the object :-(
((/** @type {?} */ (Map))).prototype['jasmineToString'] = (/**
 * @return {?}
 */
function () {
    /** @type {?} */
    const m = this;
    if (!m) {
        return '' + m;
    }
    /** @type {?} */
    const res = [];
    m.forEach((/**
     * @param {?} v
     * @param {?} k
     * @return {?}
     */
    (v, k) => { res.push(`${String(k)}:${String(v)}`); }));
    return `{ ${res.join(',')} }`;
});
_global.beforeEach((/**
 * @return {?}
 */
function () {
    // Custom handler for Map as we use Jasmine 2.4, and support for maps is not
    // added until Jasmine 2.6.
    jasmine.addCustomEqualityTester((/**
     * @param {?} actual
     * @param {?} expected
     * @return {?}
     */
    function compareMap(actual, expected) {
        if (actual instanceof Map) {
            /** @type {?} */
            let pass = actual.size === expected.size;
            if (pass) {
                actual.forEach((/**
                 * @param {?} v
                 * @param {?} k
                 * @return {?}
                 */
                (v, k) => {
                    pass = pass && jasmine.matchersUtil.equals(v, expected.get(k));
                }));
            }
            return pass;
        }
        else {
            // TODO(misko): we should change the return, but jasmine.d.ts is not null safe
            return (/** @type {?} */ (undefined));
        }
    }));
    jasmine.addMatchers({
        toBePromise: (/**
         * @return {?}
         */
        function () {
            return {
                compare: (/**
                 * @param {?} actual
                 * @return {?}
                 */
                function (actual) {
                    /** @type {?} */
                    const pass = typeof actual === 'object' && typeof actual.then === 'function';
                    return { pass: pass, /**
                         * @return {?}
                         */
                        get message() { return 'Expected ' + actual + ' to be a promise'; } };
                })
            };
        }),
        toBeAnInstanceOf: (/**
         * @return {?}
         */
        function () {
            return {
                compare: (/**
                 * @param {?} actual
                 * @param {?} expectedClass
                 * @return {?}
                 */
                function (actual, expectedClass) {
                    /** @type {?} */
                    const pass = typeof actual === 'object' && actual instanceof expectedClass;
                    return {
                        pass: pass,
                        /**
                         * @return {?}
                         */
                        get message() {
                            return 'Expected ' + actual + ' to be an instance of ' + expectedClass;
                        }
                    };
                })
            };
        }),
        toHaveText: (/**
         * @return {?}
         */
        function () {
            return {
                compare: (/**
                 * @param {?} actual
                 * @param {?} expectedText
                 * @return {?}
                 */
                function (actual, expectedText) {
                    /** @type {?} */
                    const actualText = elementText(actual);
                    return {
                        pass: actualText == expectedText,
                        /**
                         * @return {?}
                         */
                        get message() { return 'Expected ' + actualText + ' to be equal to ' + expectedText; }
                    };
                })
            };
        }),
        toHaveCssClass: (/**
         * @return {?}
         */
        function () {
            return { compare: buildError(false), negativeCompare: buildError(true) };
            /**
             * @param {?} isNot
             * @return {?}
             */
            function buildError(isNot) {
                return (/**
                 * @param {?} actual
                 * @param {?} className
                 * @return {?}
                 */
                function (actual, className) {
                    return {
                        pass: hasClass(actual, className) == !isNot,
                        /**
                         * @return {?}
                         */
                        get message() {
                            return `Expected ${actual.outerHTML} ${isNot ? 'not ' : ''}to contain the CSS class "${className}"`;
                        }
                    };
                });
            }
        }),
        toHaveCssStyle: (/**
         * @return {?}
         */
        function () {
            return {
                compare: (/**
                 * @param {?} actual
                 * @param {?} styles
                 * @return {?}
                 */
                function (actual, styles) {
                    /** @type {?} */
                    let allPassed;
                    if (typeof styles === 'string') {
                        allPassed = hasStyle(actual, styles);
                    }
                    else {
                        allPassed = Object.keys(styles).length !== 0;
                        Object.keys(styles).forEach((/**
                         * @param {?} prop
                         * @return {?}
                         */
                        prop => { allPassed = allPassed && hasStyle(actual, prop, styles[prop]); }));
                    }
                    return {
                        pass: allPassed,
                        /**
                         * @return {?}
                         */
                        get message() {
                            /** @type {?} */
                            const expectedValueStr = typeof styles === 'string' ? styles : JSON.stringify(styles);
                            return `Expected ${actual.outerHTML} ${!allPassed ? ' ' : 'not '}to contain the
                      CSS ${typeof styles === 'string' ? 'property' : 'styles'} "${expectedValueStr}"`;
                        }
                    };
                })
            };
        }),
        toContainError: (/**
         * @return {?}
         */
        function () {
            return {
                compare: (/**
                 * @param {?} actual
                 * @param {?} expectedText
                 * @return {?}
                 */
                function (actual, expectedText) {
                    /** @type {?} */
                    const errorMessage = actual.toString();
                    return {
                        pass: errorMessage.indexOf(expectedText) > -1,
                        /**
                         * @return {?}
                         */
                        get message() { return 'Expected ' + errorMessage + ' to contain ' + expectedText; }
                    };
                })
            };
        }),
        toImplement: (/**
         * @return {?}
         */
        function () {
            return {
                compare: (/**
                 * @param {?} actualObject
                 * @param {?} expectedInterface
                 * @return {?}
                 */
                function (actualObject, expectedInterface) {
                    /** @type {?} */
                    const intProps = Object.keys(expectedInterface.prototype);
                    /** @type {?} */
                    const missedMethods = [];
                    intProps.forEach((/**
                     * @param {?} k
                     * @return {?}
                     */
                    (k) => {
                        if (!actualObject.constructor.prototype[k])
                            missedMethods.push(k);
                    }));
                    return {
                        pass: missedMethods.length == 0,
                        /**
                         * @return {?}
                         */
                        get message() {
                            return 'Expected ' + actualObject + ' to have the following methods: ' +
                                missedMethods.join(', ');
                        }
                    };
                })
            };
        }),
        toContainComponent: (/**
         * @return {?}
         */
        function () {
            return {
                compare: (/**
                 * @param {?} actualFixture
                 * @param {?} expectedComponentType
                 * @return {?}
                 */
                function (actualFixture, expectedComponentType) {
                    /** @type {?} */
                    const failOutput = arguments[2];
                    /** @type {?} */
                    const msgFn = (/**
                     * @param {?} msg
                     * @return {?}
                     */
                    (msg) => [msg, failOutput].filter(Boolean).join(', '));
                    // verify correct actual type
                    if (!(actualFixture instanceof ComponentFixture)) {
                        return {
                            pass: false,
                            message: msgFn(`Expected actual to be of type \'ComponentFixture\' [actual=${actualFixture.constructor.name}]`)
                        };
                    }
                    /** @type {?} */
                    const found = !!actualFixture.debugElement.query(By.directive(expectedComponentType));
                    return found ?
                        { pass: true } :
                        { pass: false, message: msgFn(`Expected ${expectedComponentType.name} to show`) };
                })
            };
        })
    });
}));
/**
 * @param {?} n
 * @return {?}
 */
function elementText(n) {
    /** @type {?} */
    const hasNodes = (/**
     * @param {?} n
     * @return {?}
     */
    (n) => {
        /** @type {?} */
        const children = n.childNodes;
        return children && children.length > 0;
    });
    if (n instanceof Array) {
        return n.map(elementText).join('');
    }
    if (isCommentNode(n)) {
        return '';
    }
    if (getDOM().isElementNode(n) && ((/** @type {?} */ (n))).tagName == 'CONTENT') {
        return elementText(Array.prototype.slice.apply(((/** @type {?} */ (n))).getDistributedNodes()));
    }
    if (hasShadowRoot(n)) {
        return elementText(childNodesAsList(((/** @type {?} */ (n))).shadowRoot));
    }
    if (hasNodes(n)) {
        return elementText(childNodesAsList(n));
    }
    return ((/** @type {?} */ (n))).textContent;
}
/**
 * @param {?} node
 * @return {?}
 */
function hasShadowRoot(node) {
    return node.shadowRoot != null && node instanceof HTMLElement;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0Y2hlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL3Rlc3Rpbmcvc3JjL21hdGNoZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVNBLE9BQU8sRUFBQyxPQUFPLElBQUksTUFBTSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDbEQsT0FBTyxFQUFPLE9BQU8sSUFBSSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdEQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdkQsT0FBTyxFQUFDLEVBQUUsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQyxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7OztBQVFuRixnQ0FnRkM7Ozs7OztJQURDLHlCQUFtQjs7Ozs7Ozs7OztJQXRFbkIsbURBQXVCOzs7Ozs7Ozs7OztJQVV2QixnRUFBeUM7Ozs7Ozs7Ozs7O0lBVXpDLDBEQUFzQzs7Ozs7Ozs7Ozs7SUFVdEMsOERBQTBDOzs7Ozs7Ozs7OztJQVUxQyw4REFBZ0U7Ozs7Ozs7Ozs7O0lBVWhFLDJEQUFvQzs7Ozs7Ozs7Ozs7SUFVcEMsOERBQXVDOzs7Ozs7O0lBS3ZDLHNHQUEyRjs7O01BUXZGLE9BQU8sR0FBRyxtQkFBSyxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBQTs7Ozs7Ozs7O0FBU3RFLE1BQU0sT0FBTyxNQUFNLEdBQTBDLE9BQU8sQ0FBQyxNQUFNOzs7OztBQU8zRSxDQUFDLG1CQUFBLEdBQUcsRUFBTyxDQUFDLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDOzs7QUFBRzs7VUFDcEMsQ0FBQyxHQUFHLElBQUk7SUFDZCxJ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QUMsbUJBQUEsQ0FBQyxFQUFPLENBQUMsQ0FBQyxXQUFXLENBQUM7QUFDaEMsQ0FBQzs7Ozs7QUFFRCxTQUFTLGFBQWEsQ0FBQyxJQUFTO0lBQzlCLE9BQU8sSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLElBQUksSUFBSSxZQUFZLFdBQVcsQ0FBQztBQUNoRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbmltcG9ydCB7ybVnZXRET00gYXMgZ2V0RE9NfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtUeXBlLCDJtWdsb2JhbCBhcyBnbG9iYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb21wb25lbnRGaXh0dXJlfSBmcm9tICdAYW5ndWxhci9jb3JlL3Rlc3RpbmcnO1xuaW1wb3J0IHtCeX0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5pbXBvcnQge2NoaWxkTm9kZXNBc0xpc3QsIGhhc0NsYXNzLCBoYXNTdHlsZSwgaXNDb21tZW50Tm9kZX0gZnJvbSAnLi9icm93c2VyX3V0aWwnO1xuXG5cbi8qKlxuICogSmFzbWluZSBtYXRjaGVycyB0aGF0IGNoZWNrIEFuZ3VsYXIgc3BlY2lmaWMgY29uZGl0aW9ucy5cbiAqXG4gKiBOb3RlOiBUaGVzZSBtYXRjaGVycyB3aWxsIG9ubHkgd29yayBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmdNYXRjaGVyczxUID0gYW55PiBleHRlbmRzIGphc21pbmUuTWF0Y2hlcnM8VD4ge1xuICAvKipcbiAgICogRXhwZWN0IHRoZSB2YWx1ZSB0byBiZSBhIGBQcm9taXNlYC5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIHRlc3RpbmcvdHMvbWF0Y2hlcnMudHMgcmVnaW9uPSd0b0JlUHJvbWlzZSd9XG4gICAqL1xuICB0b0JlUHJvbWlzZSgpOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBFeHBlY3QgdGhlIHZhbHVlIHRvIGJlIGFuIGluc3RhbmNlIG9mIGEgY2xhc3MuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL21hdGNoZXJzLnRzIHJlZ2lvbj0ndG9CZUFuSW5zdGFuY2VPZid9XG4gICAqL1xuICB0b0JlQW5JbnN0YW5jZU9mKGV4cGVjdGVkOiBhbnkpOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBFeHBlY3QgdGhlIGVsZW1lbnQgdG8gaGF2ZSBleGFjdGx5IHRoZSBnaXZlbiB0ZXh0LlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgdGVzdGluZy90cy9tYXRjaGVycy50cyByZWdpb249J3RvSGF2ZVRleHQnfVxuICAgKi9cbiAgdG9IYXZlVGV4dChleHBlY3RlZDogc3RyaW5nKTogYm9vbGVhbjtcblxuICAvKipcbiAgICogRXhwZWN0IHRoZSBlbGVtZW50IHRvIGhhdmUgdGhlIGdpdmVuIENTUyBjbGFzcy5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIHRlc3RpbmcvdHMvbWF0Y2hlcnMudHMgcmVnaW9uPSd0b0hhdmVDc3NDbGFzcyd9XG4gICAqL1xuICB0b0hhdmVDc3NDbGFzcyhleHBlY3RlZDogc3RyaW5nKTogYm9vbGVhbjtcblxuICAvKipcbiAgICogRXhwZWN0IHRoZSBlbGVtZW50IHRvIGhhdmUgdGhlIGdpdmVuIENTUyBzdHlsZXMuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL21hdGNoZXJzLnRzIHJlZ2lvbj0ndG9IYXZlQ3NzU3R5bGUnfVxuICAgKi9cbiAgdG9IYXZlQ3NzU3R5bGUoZXhwZWN0ZWQ6IHtbazogc3RyaW5nXTogc3RyaW5nfXxzdHJpbmcpOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBFeHBlY3QgYSBjbGFzcyB0byBpbXBsZW1lbnQgdGhlIGludGVyZmFjZSBvZiB0aGUgZ2l2ZW4gY2xhc3MuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL21hdGNoZXJzLnRzIHJlZ2lvbj0ndG9JbXBsZW1lbnQnfVxuICAgKi9cbiAgdG9JbXBsZW1lbnQoZXhwZWN0ZWQ6IGFueSk6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEV4cGVjdCBhbiBleGNlcHRpb24gdG8gY29udGFpbiB0aGUgZ2l2ZW4gZXJyb3IgdGV4dC5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIHRlc3RpbmcvdHMvbWF0Y2hlcnMudHMgcmVnaW9uPSd0b0NvbnRhaW5FcnJvcid9XG4gICAqL1xuICB0b0NvbnRhaW5FcnJvcihleHBlY3RlZDogYW55KTogYm9vbGVhbjtcblxuICAvKipcbiAgICogRXhwZWN0IGEgY29tcG9uZW50IG9mIHRoZSBnaXZlbiB0eXBlIHRvIHNob3cuXG4gICAqL1xuICB0b0NvbnRhaW5Db21wb25lbnQoZXhwZWN0ZWRDb21wb25lbnRUeXBlOiBUeXBlPGFueT4sIGV4cGVjdGF0aW9uRmFpbE91dHB1dD86IGFueSk6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEludmVydCB0aGUgbWF0Y2hlcnMuXG4gICAqL1xuICBub3Q6IE5nTWF0Y2hlcnM8VD47XG59XG5cbmNvbnN0IF9nbG9iYWwgPSA8YW55Pih0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHdpbmRvdyk7XG5cbi8qKlxuICogSmFzbWluZSBtYXRjaGluZyBmdW5jdGlvbiB3aXRoIEFuZ3VsYXIgbWF0Y2hlcnMgbWl4ZWQgaW4uXG4gKlxuICogIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL21hdGNoZXJzLnRzIHJlZ2lvbj0ndG9IYXZlVGV4dCd9XG4gKi9cbmV4cG9ydCBjb25zdCBleHBlY3Q6IDxUID0gYW55PihhY3R1YWw6IFQpID0+IE5nTWF0Y2hlcnM8VD4gPSBfZ2xvYmFsLmV4cGVjdDtcblxuXG4vLyBTb21lIE1hcCBwb2x5ZmlsbHMgZG9uJ3QgcG9seWZpbGwgTWFwLnRvU3RyaW5nIGNvcnJlY3RseSwgd2hpY2hcbi8vIGdpdmVzIHVzIGJhZCBlcnJvciBtZXNzYWdlcyBpbiB0ZXN0cy5cbi8vIFRoZSBvbmx5IHdheSB0byBkbyB0aGlzIGluIEphc21pbmUgaXMgdG8gbW9ua2V5IHBhdGNoIGEgbWV0aG9kXG4vLyB0byB0aGUgb2JqZWN0IDotKFxuKE1hcCBhcyBhbnkpLnByb3RvdHlwZVsnamFzbWluZVRvU3RyaW5nJ10gPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgbSA9IHRoaXM7XG4gIGlmICghbSkge1xuICAgIHJldHVybiAnJyArIG07XG4gIH1cbiAgY29uc3QgcmVzOiBhbnlbXSA9IFtdO1xuICBtLmZvckVhY2goKHY6IGFueSwgazogYW55KSA9PiB7IHJlcy5wdXNoKGAke1N0cmluZyhrKX06JHtTdHJpbmcodil9YCk7IH0pO1xuICByZXR1cm4gYHsgJHtyZXMuam9pbignLCcpfSB9YDtcbn07XG5cbl9nbG9iYWwuYmVmb3JlRWFjaChmdW5jdGlvbigpIHtcbiAgLy8gQ3VzdG9tIGhhbmRsZXIgZm9yIE1hcCBhcyB3ZSB1c2UgSmFzbWluZSAyLjQsIGFuZCBzdXBwb3J0IGZvciBtYXBzIGlzIG5vdFxuICAvLyBhZGRlZCB1bnRpbCBKYXNtaW5lIDIuNi5cbiAgamFzbWluZS5hZGRDdXN0b21FcXVhbGl0eVRlc3RlcihmdW5jdGlvbiBjb21wYXJlTWFwKGFjdHVhbDogYW55LCBleHBlY3RlZDogYW55KTogYm9vbGVhbiB7XG4gICAgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgbGV0IHBhc3MgPSBhY3R1YWwuc2l6ZSA9PT0gZXhwZWN0ZWQuc2l6ZTtcbiAgICAgIGlmIChwYXNzKSB7XG4gICAgICAgIGFjdHVhbC5mb3JFYWNoKCh2OiBhbnksIGs6IGFueSkgPT4ge1xuICAgICAgICAgIHBhc3MgPSBwYXNzICYmIGphc21pbmUubWF0Y2hlcnNVdGlsLmVxdWFscyh2LCBleHBlY3RlZC5nZXQoaykpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXNzO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUT0RPKG1pc2tvKTogd2Ugc2hvdWxkIGNoYW5nZSB0aGUgcmV0dXJuLCBidXQgamFzbWluZS5kLnRzIGlzIG5vdCBudWxsIHNhZmVcbiAgICAgIHJldHVybiB1bmRlZmluZWQgITtcbiAgICB9XG4gIH0pO1xuICBqYXNtaW5lLmFkZE1hdGNoZXJzKHtcbiAgICB0b0JlUHJvbWlzZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21wYXJlOiBmdW5jdGlvbihhY3R1YWw6IGFueSkge1xuICAgICAgICAgIGNvbnN0IHBhc3MgPSB0eXBlb2YgYWN0dWFsID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgYWN0dWFsLnRoZW4gPT09ICdmdW5jdGlvbic7XG4gICAgICAgICAgcmV0dXJuIHtwYXNzOiBwYXNzLCBnZXQgbWVzc2FnZSgpIHsgcmV0dXJuICdFeHBlY3RlZCAnICsgYWN0dWFsICsgJyB0byBiZSBhIHByb21pc2UnOyB9fTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdG9CZUFuSW5zdGFuY2VPZjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21wYXJlOiBmdW5jdGlvbihhY3R1YWw6IGFueSwgZXhwZWN0ZWRDbGFzczogYW55KSB7XG4gICAgICAgICAgY29uc3QgcGFzcyA9IHR5cGVvZiBhY3R1YWwgPT09ICdvYmplY3QnICYmIGFjdHVhbCBpbnN0YW5jZW9mIGV4cGVjdGVkQ2xhc3M7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBhc3M6IHBhc3MsXG4gICAgICAgICAgICBnZXQgbWVzc2FnZSgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdFeHBlY3RlZCAnICsgYWN0dWFsICsgJyB0byBiZSBhbiBpbnN0YW5jZSBvZiAnICsgZXhwZWN0ZWRDbGFzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB0b0hhdmVUZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbXBhcmU6IGZ1bmN0aW9uKGFjdHVhbDogYW55LCBleHBlY3RlZFRleHQ6IHN0cmluZykge1xuICAgICAgICAgIGNvbnN0IGFjdHVhbFRleHQgPSBlbGVtZW50VGV4dChhY3R1YWwpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwYXNzOiBhY3R1YWxUZXh0ID09IGV4cGVjdGVkVGV4dCxcbiAgICAgICAgICAgIGdldCBtZXNzYWdlKCkgeyByZXR1cm4gJ0V4cGVjdGVkICcgKyBhY3R1YWxUZXh0ICsgJyB0byBiZSBlcXVhbCB0byAnICsgZXhwZWN0ZWRUZXh0OyB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdG9IYXZlQ3NzQ2xhc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtjb21wYXJlOiBidWlsZEVycm9yKGZhbHNlKSwgbmVnYXRpdmVDb21wYXJlOiBidWlsZEVycm9yKHRydWUpfTtcblxuICAgICAgZnVuY3Rpb24gYnVpbGRFcnJvcihpc05vdDogYm9vbGVhbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYWN0dWFsOiBhbnksIGNsYXNzTmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBhc3M6IGhhc0NsYXNzKGFjdHVhbCwgY2xhc3NOYW1lKSA9PSAhaXNOb3QsXG4gICAgICAgICAgICBnZXQgbWVzc2FnZSgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGBFeHBlY3RlZCAke2FjdHVhbC5vdXRlckhUTUx9ICR7aXNOb3QgPyAnbm90ICcgOiAnJ310byBjb250YWluIHRoZSBDU1MgY2xhc3MgXCIke2NsYXNzTmFtZX1cImA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdG9IYXZlQ3NzU3R5bGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tcGFyZTogZnVuY3Rpb24oYWN0dWFsOiBhbnksIHN0eWxlczoge1trOiBzdHJpbmddOiBzdHJpbmd9fHN0cmluZykge1xuICAgICAgICAgIGxldCBhbGxQYXNzZWQ6IGJvb2xlYW47XG4gICAgICAgICAgaWYgKHR5cGVvZiBzdHlsZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBhbGxQYXNzZWQgPSBoYXNTdHlsZShhY3R1YWwsIHN0eWxlcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFsbFBhc3NlZCA9IE9iamVjdC5rZXlzKHN0eWxlcykubGVuZ3RoICE9PSAwO1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKFxuICAgICAgICAgICAgICAgIHByb3AgPT4geyBhbGxQYXNzZWQgPSBhbGxQYXNzZWQgJiYgaGFzU3R5bGUoYWN0dWFsLCBwcm9wLCBzdHlsZXNbcHJvcF0pOyB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcGFzczogYWxsUGFzc2VkLFxuICAgICAgICAgICAgZ2V0IG1lc3NhZ2UoKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkVmFsdWVTdHIgPSB0eXBlb2Ygc3R5bGVzID09PSAnc3RyaW5nJyA/IHN0eWxlcyA6IEpTT04uc3RyaW5naWZ5KHN0eWxlcyk7XG4gICAgICAgICAgICAgIHJldHVybiBgRXhwZWN0ZWQgJHthY3R1YWwub3V0ZXJIVE1MfSAkeyFhbGxQYXNzZWQgPyAnICcgOiAnbm90ICd9dG8gY29udGFpbiB0aGVcbiAgICAgICAgICAgICAgICAgICAgICBDU1MgJHt0eXBlb2Ygc3R5bGVzID09PSAnc3RyaW5nJyA/ICdwcm9wZXJ0eScgOiAnc3R5bGVzJ30gXCIke2V4cGVjdGVkVmFsdWVTdHJ9XCJgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHRvQ29udGFpbkVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbXBhcmU6IGZ1bmN0aW9uKGFjdHVhbDogYW55LCBleHBlY3RlZFRleHQ6IGFueSkge1xuICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGFjdHVhbC50b1N0cmluZygpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwYXNzOiBlcnJvck1lc3NhZ2UuaW5kZXhPZihleHBlY3RlZFRleHQpID4gLTEsXG4gICAgICAgICAgICBnZXQgbWVzc2FnZSgpIHsgcmV0dXJuICdFeHBlY3RlZCAnICsgZXJyb3JNZXNzYWdlICsgJyB0byBjb250YWluICcgKyBleHBlY3RlZFRleHQ7IH1cbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB0b0ltcGxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21wYXJlOiBmdW5jdGlvbihhY3R1YWxPYmplY3Q6IGFueSwgZXhwZWN0ZWRJbnRlcmZhY2U6IGFueSkge1xuICAgICAgICAgIGNvbnN0IGludFByb3BzID0gT2JqZWN0LmtleXMoZXhwZWN0ZWRJbnRlcmZhY2UucHJvdG90eXBlKTtcblxuICAgICAgICAgIGNvbnN0IG1pc3NlZE1ldGhvZHM6IGFueVtdID0gW107XG4gICAgICAgICAgaW50UHJvcHMuZm9yRWFjaCgoaykgPT4ge1xuICAgICAgICAgICAgaWYgKCFhY3R1YWxPYmplY3QuY29uc3RydWN0b3IucHJvdG90eXBlW2tdKSBtaXNzZWRNZXRob2RzLnB1c2goayk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcGFzczogbWlzc2VkTWV0aG9kcy5sZW5ndGggPT0gMCxcbiAgICAgICAgICAgIGdldCBtZXNzYWdlKCkge1xuICAgICAgICAgICAgICByZXR1cm4gJ0V4cGVjdGVkICcgKyBhY3R1YWxPYmplY3QgKyAnIHRvIGhhdmUgdGhlIGZvbGxvd2luZyBtZXRob2RzOiAnICtcbiAgICAgICAgICAgICAgICAgIG1pc3NlZE1ldGhvZHMuam9pbignLCAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB0b0NvbnRhaW5Db21wb25lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tcGFyZTogZnVuY3Rpb24oYWN0dWFsRml4dHVyZTogYW55LCBleHBlY3RlZENvbXBvbmVudFR5cGU6IFR5cGU8YW55Pikge1xuICAgICAgICAgIGNvbnN0IGZhaWxPdXRwdXQgPSBhcmd1bWVudHNbMl07XG4gICAgICAgICAgY29uc3QgbXNnRm4gPSAobXNnOiBzdHJpbmcpOiBzdHJpbmcgPT4gW21zZywgZmFpbE91dHB1dF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJywgJyk7XG5cbiAgICAgICAgICAvLyB2ZXJpZnkgY29ycmVjdCBhY3R1YWwgdHlwZVxuICAgICAgICAgIGlmICghKGFjdHVhbEZpeHR1cmUgaW5zdGFuY2VvZiBDb21wb25lbnRGaXh0dXJlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgcGFzczogZmFsc2UsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6IG1zZ0ZuKFxuICAgICAgICAgICAgICAgICAgYEV4cGVjdGVkIGFjdHVhbCB0byBiZSBvZiB0eXBlIFxcJ0NvbXBvbmVudEZpeHR1cmVcXCcgW2FjdHVhbD0ke2FjdHVhbEZpeHR1cmUuY29uc3RydWN0b3IubmFtZX1dYClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgZm91bmQgPSAhIWFjdHVhbEZpeHR1cmUuZGVidWdFbGVtZW50LnF1ZXJ5KEJ5LmRpcmVjdGl2ZShleHBlY3RlZENvbXBvbmVudFR5cGUpKTtcbiAgICAgICAgICByZXR1cm4gZm91bmQgP1xuICAgICAgICAgICAgICB7cGFzczogdHJ1ZX0gOlxuICAgICAgICAgICAgICB7cGFzczogZmFsc2UsIG1lc3NhZ2U6IG1zZ0ZuKGBFeHBlY3RlZCAke2V4cGVjdGVkQ29tcG9uZW50VHlwZS5uYW1lfSB0byBzaG93YCl9O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG59KTtcblxuZnVuY3Rpb24gZWxlbWVudFRleHQobjogYW55KTogc3RyaW5nIHtcbiAgY29uc3QgaGFzTm9kZXMgPSAobjogYW55KSA9PiB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBuLmNoaWxkTm9kZXM7XG4gICAgcmV0dXJuIGNoaWxkcmVuICYmIGNoaWxkcmVuLmxlbmd0aCA+IDA7XG4gIH07XG5cbiAgaWYgKG4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIHJldHVybiBuLm1hcChlbGVtZW50VGV4dCkuam9pbignJyk7XG4gIH1cblxuICBpZiAoaXNDb21tZW50Tm9kZShuKSkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGlmIChnZXRET00oKS5pc0VsZW1lbnROb2RlKG4pICYmIChuIGFzIEVsZW1lbnQpLnRhZ05hbWUgPT0gJ0NPTlRFTlQnKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRUZXh0KEFycmF5LnByb3RvdHlwZS5zbGljZS5hcHBseSgoPGFueT5uKS5nZXREaXN0cmlidXRlZE5vZGVzKCkpKTtcbiAgfVxuXG4gIGlmIChoYXNTaGFkb3dSb290KG4pKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRUZXh0KGNoaWxkTm9kZXNBc0xpc3QoKDxhbnk+bikuc2hhZG93Um9vdCkpO1xuICB9XG5cbiAgaWYgKGhhc05vZGVzKG4pKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRUZXh0KGNoaWxkTm9kZXNBc0xpc3QobikpO1xuICB9XG5cbiAgcmV0dXJuIChuIGFzIGFueSkudGV4dENvbnRlbnQ7XG59XG5cbmZ1bmN0aW9uIGhhc1NoYWRvd1Jvb3Qobm9kZTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlLnNoYWRvd1Jvb3QgIT0gbnVsbCAmJiBub2RlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQ7XG59XG4iXX0=