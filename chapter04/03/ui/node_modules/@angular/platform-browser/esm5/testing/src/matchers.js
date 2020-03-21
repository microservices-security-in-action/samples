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
var _global = (typeof window === 'undefined' ? global : window);
/**
 * Jasmine matching function with Angular matchers mixed in.
 *
 * ## Example
 *
 * {@example testing/ts/matchers.ts region='toHaveText'}
 */
export var expect = _global.expect;
// Some Map polyfills don't polyfill Map.toString correctly, which
// gives us bad error messages in tests.
// The only way to do this in Jasmine is to monkey patch a method
// to the object :-(
Map.prototype['jasmineToString'] = function () {
    var m = this;
    if (!m) {
        return '' + m;
    }
    var res = [];
    m.forEach(function (v, k) { res.push(String(k) + ":" + String(v)); });
    return "{ " + res.join(',') + " }";
};
_global.beforeEach(function () {
    // Custom handler for Map as we use Jasmine 2.4, and support for maps is not
    // added until Jasmine 2.6.
    jasmine.addCustomEqualityTester(function compareMap(actual, expected) {
        if (actual instanceof Map) {
            var pass_1 = actual.size === expected.size;
            if (pass_1) {
                actual.forEach(function (v, k) {
                    pass_1 = pass_1 && jasmine.matchersUtil.equals(v, expected.get(k));
                });
            }
            return pass_1;
        }
        else {
            // TODO(misko): we should change the return, but jasmine.d.ts is not null safe
            return undefined;
        }
    });
    jasmine.addMatchers({
        toBePromise: function () {
            return {
                compare: function (actual) {
                    var pass = typeof actual === 'object' && typeof actual.then === 'function';
                    return { pass: pass, get message() { return 'Expected ' + actual + ' to be a promise'; } };
                }
            };
        },
        toBeAnInstanceOf: function () {
            return {
                compare: function (actual, expectedClass) {
                    var pass = typeof actual === 'object' && actual instanceof expectedClass;
                    return {
                        pass: pass,
                        get message() {
                            return 'Expected ' + actual + ' to be an instance of ' + expectedClass;
                        }
                    };
                }
            };
        },
        toHaveText: function () {
            return {
                compare: function (actual, expectedText) {
                    var actualText = elementText(actual);
                    return {
                        pass: actualText == expectedText,
                        get message() { return 'Expected ' + actualText + ' to be equal to ' + expectedText; }
                    };
                }
            };
        },
        toHaveCssClass: function () {
            return { compare: buildError(false), negativeCompare: buildError(true) };
            function buildError(isNot) {
                return function (actual, className) {
                    return {
                        pass: hasClass(actual, className) == !isNot,
                        get message() {
                            return "Expected " + actual.outerHTML + " " + (isNot ? 'not ' : '') + "to contain the CSS class \"" + className + "\"";
                        }
                    };
                };
            }
        },
        toHaveCssStyle: function () {
            return {
                compare: function (actual, styles) {
                    var allPassed;
                    if (typeof styles === 'string') {
                        allPassed = hasStyle(actual, styles);
                    }
                    else {
                        allPassed = Object.keys(styles).length !== 0;
                        Object.keys(styles).forEach(function (prop) { allPassed = allPassed && hasStyle(actual, prop, styles[prop]); });
                    }
                    return {
                        pass: allPassed,
                        get message() {
                            var expectedValueStr = typeof styles === 'string' ? styles : JSON.stringify(styles);
                            return "Expected " + actual.outerHTML + " " + (!allPassed ? ' ' : 'not ') + "to contain the\n                      CSS " + (typeof styles === 'string' ? 'property' : 'styles') + " \"" + expectedValueStr + "\"";
                        }
                    };
                }
            };
        },
        toContainError: function () {
            return {
                compare: function (actual, expectedText) {
                    var errorMessage = actual.toString();
                    return {
                        pass: errorMessage.indexOf(expectedText) > -1,
                        get message() { return 'Expected ' + errorMessage + ' to contain ' + expectedText; }
                    };
                }
            };
        },
        toImplement: function () {
            return {
                compare: function (actualObject, expectedInterface) {
                    var intProps = Object.keys(expectedInterface.prototype);
                    var missedMethods = [];
                    intProps.forEach(function (k) {
                        if (!actualObject.constructor.prototype[k])
                            missedMethods.push(k);
                    });
                    return {
                        pass: missedMethods.length == 0,
                        get message() {
                            return 'Expected ' + actualObject + ' to have the following methods: ' +
                                missedMethods.join(', ');
                        }
                    };
                }
            };
        },
        toContainComponent: function () {
            return {
                compare: function (actualFixture, expectedComponentType) {
                    var failOutput = arguments[2];
                    var msgFn = function (msg) { return [msg, failOutput].filter(Boolean).join(', '); };
                    // verify correct actual type
                    if (!(actualFixture instanceof ComponentFixture)) {
                        return {
                            pass: false,
                            message: msgFn("Expected actual to be of type 'ComponentFixture' [actual=" + actualFixture.constructor.name + "]")
                        };
                    }
                    var found = !!actualFixture.debugElement.query(By.directive(expectedComponentType));
                    return found ?
                        { pass: true } :
                        { pass: false, message: msgFn("Expected " + expectedComponentType.name + " to show") };
                }
            };
        }
    });
});
function elementText(n) {
    var hasNodes = function (n) {
        var children = n.childNodes;
        return children && children.length > 0;
    };
    if (n instanceof Array) {
        return n.map(elementText).join('');
    }
    if (isCommentNode(n)) {
        return '';
    }
    if (getDOM().isElementNode(n) && n.tagName == 'CONTENT') {
        return elementText(Array.prototype.slice.apply(n.getDistributedNodes()));
    }
    if (hasShadowRoot(n)) {
        return elementText(childNodesAsList(n.shadowRoot));
    }
    if (hasNodes(n)) {
        return elementText(childNodesAsList(n));
    }
    return n.textContent;
}
function hasShadowRoot(node) {
    return node.shadowRoot != null && node instanceof HTMLElement;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0Y2hlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL3Rlc3Rpbmcvc3JjL21hdGNoZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBQyxPQUFPLElBQUksTUFBTSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDbEQsT0FBTyxFQUFPLE9BQU8sSUFBSSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdEQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdkQsT0FBTyxFQUFDLEVBQUUsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBMEZuRixJQUFNLE9BQU8sR0FBUSxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUV2RTs7Ozs7O0dBTUc7QUFDSCxNQUFNLENBQUMsSUFBTSxNQUFNLEdBQTBDLE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFHNUUsa0VBQWtFO0FBQ2xFLHdDQUF3QztBQUN4QyxpRUFBaUU7QUFDakUsb0JBQW9CO0FBQ25CLEdBQVcsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsR0FBRztJQUMxQyxJQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDZixJQUFJLENBQUMsQ0FBQyxFQUFFO1FBQ04sT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ2Y7SUFDRCxJQUFNLEdBQUcsR0FBVSxFQUFFLENBQUM7SUFDdEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQU0sRUFBRSxDQUFNLElBQU8sR0FBRyxDQUFDLElBQUksQ0FB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QUFJLENBQUMsWUFBWSxLQUFLLEVBQUU7UUFDdEIsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNwQztJQUVELElBQUksYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ3BCLE9BQU8sRUFBRSxDQUFDO0tBQ1g7SUFFRCxJQUFJLE1BQU0sRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSyxDQUFhLENBQUMsT0FBTyxJQUFJLFNBQVMsRUFBRTtRQUNwRSxPQUFPLFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQU8sQ0FBRSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ2pGO0lBRUQsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDcEIsT0FBTyxXQUFXLENBQUMsZ0JBQWdCLENBQU8sQ0FBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7S0FDM0Q7SUFFRCxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNmLE9BQU8sV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDekM7SUFFRCxPQUFRLENBQVMsQ0FBQyxXQUFXLENBQUM7QUFDaEMsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLElBQVM7SUFDOUIsT0FBTyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksSUFBSSxJQUFJLFlBQVksV0FBVyxDQUFDO0FBQ2hFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuaW1wb3J0IHvJtWdldERPTSBhcyBnZXRET019IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1R5cGUsIMm1Z2xvYmFsIGFzIGdsb2JhbH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbXBvbmVudEZpeHR1cmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUvdGVzdGluZyc7XG5pbXBvcnQge0J5fSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbmltcG9ydCB7Y2hpbGROb2Rlc0FzTGlzdCwgaGFzQ2xhc3MsIGhhc1N0eWxlLCBpc0NvbW1lbnROb2RlfSBmcm9tICcuL2Jyb3dzZXJfdXRpbCc7XG5cblxuLyoqXG4gKiBKYXNtaW5lIG1hdGNoZXJzIHRoYXQgY2hlY2sgQW5ndWxhciBzcGVjaWZpYyBjb25kaXRpb25zLlxuICpcbiAqIE5vdGU6IFRoZXNlIG1hdGNoZXJzIHdpbGwgb25seSB3b3JrIGluIGEgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOZ01hdGNoZXJzPFQgPSBhbnk+IGV4dGVuZHMgamFzbWluZS5NYXRjaGVyczxUPiB7XG4gIC8qKlxuICAgKiBFeHBlY3QgdGhlIHZhbHVlIHRvIGJlIGEgYFByb21pc2VgLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgdGVzdGluZy90cy9tYXRjaGVycy50cyByZWdpb249J3RvQmVQcm9taXNlJ31cbiAgICovXG4gIHRvQmVQcm9taXNlKCk6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEV4cGVjdCB0aGUgdmFsdWUgdG8gYmUgYW4gaW5zdGFuY2Ugb2YgYSBjbGFzcy5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIHRlc3RpbmcvdHMvbWF0Y2hlcnMudHMgcmVnaW9uPSd0b0JlQW5JbnN0YW5jZU9mJ31cbiAgICovXG4gIHRvQmVBbkluc3RhbmNlT2YoZXhwZWN0ZWQ6IGFueSk6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEV4cGVjdCB0aGUgZWxlbWVudCB0byBoYXZlIGV4YWN0bHkgdGhlIGdpdmVuIHRleHQuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL21hdGNoZXJzLnRzIHJlZ2lvbj0ndG9IYXZlVGV4dCd9XG4gICAqL1xuICB0b0hhdmVUZXh0KGV4cGVjdGVkOiBzdHJpbmcpOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBFeHBlY3QgdGhlIGVsZW1lbnQgdG8gaGF2ZSB0aGUgZ2l2ZW4gQ1NTIGNsYXNzLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgdGVzdGluZy90cy9tYXRjaGVycy50cyByZWdpb249J3RvSGF2ZUNzc0NsYXNzJ31cbiAgICovXG4gIHRvSGF2ZUNzc0NsYXNzKGV4cGVjdGVkOiBzdHJpbmcpOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBFeHBlY3QgdGhlIGVsZW1lbnQgdG8gaGF2ZSB0aGUgZ2l2ZW4gQ1NTIHN0eWxlcy5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIHRlc3RpbmcvdHMvbWF0Y2hlcnMudHMgcmVnaW9uPSd0b0hhdmVDc3NTdHlsZSd9XG4gICAqL1xuICB0b0hhdmVDc3NTdHlsZShleHBlY3RlZDoge1trOiBzdHJpbmddOiBzdHJpbmd9fHN0cmluZyk6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEV4cGVjdCBhIGNsYXNzIHRvIGltcGxlbWVudCB0aGUgaW50ZXJmYWNlIG9mIHRoZSBnaXZlbiBjbGFzcy5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIHRlc3RpbmcvdHMvbWF0Y2hlcnMudHMgcmVnaW9uPSd0b0ltcGxlbWVudCd9XG4gICAqL1xuICB0b0ltcGxlbWVudChleHBlY3RlZDogYW55KTogYm9vbGVhbjtcblxuICAvKipcbiAgICogRXhwZWN0IGFuIGV4Y2VwdGlvbiB0byBjb250YWluIHRoZSBnaXZlbiBlcnJvciB0ZXh0LlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgdGVzdGluZy90cy9tYXRjaGVycy50cyByZWdpb249J3RvQ29udGFpbkVycm9yJ31cbiAgICovXG4gIHRvQ29udGFpbkVycm9yKGV4cGVjdGVkOiBhbnkpOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBFeHBlY3QgYSBjb21wb25lbnQgb2YgdGhlIGdpdmVuIHR5cGUgdG8gc2hvdy5cbiAgICovXG4gIHRvQ29udGFpbkNvbXBvbmVudChleHBlY3RlZENvbXBvbmVudFR5cGU6IFR5cGU8YW55PiwgZXhwZWN0YXRpb25GYWlsT3V0cHV0PzogYW55KTogYm9vbGVhbjtcblxuICAvKipcbiAgICogSW52ZXJ0IHRoZSBtYXRjaGVycy5cbiAgICovXG4gIG5vdDogTmdNYXRjaGVyczxUPjtcbn1cblxuY29uc3QgX2dsb2JhbCA9IDxhbnk+KHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93KTtcblxuLyoqXG4gKiBKYXNtaW5lIG1hdGNoaW5nIGZ1bmN0aW9uIHdpdGggQW5ndWxhciBtYXRjaGVycyBtaXhlZCBpbi5cbiAqXG4gKiAjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvbWF0Y2hlcnMudHMgcmVnaW9uPSd0b0hhdmVUZXh0J31cbiAqL1xuZXhwb3J0IGNvbnN0IGV4cGVjdDogPFQgPSBhbnk+KGFjdHVhbDogVCkgPT4gTmdNYXRjaGVyczxUPiA9IF9nbG9iYWwuZXhwZWN0O1xuXG5cbi8vIFNvbWUgTWFwIHBvbHlmaWxscyBkb24ndCBwb2x5ZmlsbCBNYXAudG9TdHJpbmcgY29ycmVjdGx5LCB3aGljaFxuLy8gZ2l2ZXMgdXMgYmFkIGVycm9yIG1lc3NhZ2VzIGluIHRlc3RzLlxuLy8gVGhlIG9ubHkgd2F5IHRvIGRvIHRoaXMgaW4gSmFzbWluZSBpcyB0byBtb25rZXkgcGF0Y2ggYSBtZXRob2Rcbi8vIHRvIHRoZSBvYmplY3QgOi0oXG4oTWFwIGFzIGFueSkucHJvdG90eXBlWydqYXNtaW5lVG9TdHJpbmcnXSA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBtID0gdGhpcztcbiAgaWYgKCFtKSB7XG4gICAgcmV0dXJuICcnICsgbTtcbiAgfVxuICBjb25zdCByZXM6IGFueVtdID0gW107XG4gIG0uZm9yRWFjaCgodjogYW55LCBrOiBhbnkpID0+IHsgcmVzLnB1c2goYCR7U3RyaW5nKGspfToke1N0cmluZyh2KX1gKTsgfSk7XG4gIHJldHVybiBgeyAke3Jlcy5qb2luKCcsJyl9IH1gO1xufTtcblxuX2dsb2JhbC5iZWZvcmVFYWNoKGZ1bmN0aW9uKCkge1xuICAvLyBDdXN0b20gaGFuZGxlciBmb3IgTWFwIGFzIHdlIHVzZSBKYXNtaW5lIDIuNCwgYW5kIHN1cHBvcnQgZm9yIG1hcHMgaXMgbm90XG4gIC8vIGFkZGVkIHVudGlsIEphc21pbmUgMi42LlxuICBqYXNtaW5lLmFkZEN1c3RvbUVxdWFsaXR5VGVzdGVyKGZ1bmN0aW9uIGNvbXBhcmVNYXAoYWN0dWFsOiBhbnksIGV4cGVjdGVkOiBhbnkpOiBib29sZWFuIHtcbiAgICBpZiAoYWN0dWFsIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICBsZXQgcGFzcyA9IGFjdHVhbC5zaXplID09PSBleHBlY3RlZC5zaXplO1xuICAgICAgaWYgKHBhc3MpIHtcbiAgICAgICAgYWN0dWFsLmZvckVhY2goKHY6IGFueSwgazogYW55KSA9PiB7XG4gICAgICAgICAgcGFzcyA9IHBhc3MgJiYgamFzbWluZS5tYXRjaGVyc1V0aWwuZXF1YWxzKHYsIGV4cGVjdGVkLmdldChrKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhc3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRPRE8obWlza28pOiB3ZSBzaG91bGQgY2hhbmdlIHRoZSByZXR1cm4sIGJ1dCBqYXNtaW5lLmQudHMgaXMgbm90IG51bGwgc2FmZVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZCAhO1xuICAgIH1cbiAgfSk7XG4gIGphc21pbmUuYWRkTWF0Y2hlcnMoe1xuICAgIHRvQmVQcm9taXNlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbXBhcmU6IGZ1bmN0aW9uKGFjdHVhbDogYW55KSB7XG4gICAgICAgICAgY29uc3QgcGFzcyA9IHR5cGVvZiBhY3R1YWwgPT09ICdvYmplY3QnICYmIHR5cGVvZiBhY3R1YWwudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbiAgICAgICAgICByZXR1cm4ge3Bhc3M6IHBhc3MsIGdldCBtZXNzYWdlKCkgeyByZXR1cm4gJ0V4cGVjdGVkICcgKyBhY3R1YWwgKyAnIHRvIGJlIGEgcHJvbWlzZSc7IH19O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB0b0JlQW5JbnN0YW5jZU9mOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbXBhcmU6IGZ1bmN0aW9uKGFjdHVhbDogYW55LCBleHBlY3RlZENsYXNzOiBhbnkpIHtcbiAgICAgICAgICBjb25zdCBwYXNzID0gdHlwZW9mIGFjdHVhbCA9PT0gJ29iamVjdCcgJiYgYWN0dWFsIGluc3RhbmNlb2YgZXhwZWN0ZWRDbGFzcztcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcGFzczogcGFzcyxcbiAgICAgICAgICAgIGdldCBtZXNzYWdlKCkge1xuICAgICAgICAgICAgICByZXR1cm4gJ0V4cGVjdGVkICcgKyBhY3R1YWwgKyAnIHRvIGJlIGFuIGluc3RhbmNlIG9mICcgKyBleHBlY3RlZENsYXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHRvSGF2ZVRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tcGFyZTogZnVuY3Rpb24oYWN0dWFsOiBhbnksIGV4cGVjdGVkVGV4dDogc3RyaW5nKSB7XG4gICAgICAgICAgY29uc3QgYWN0dWFsVGV4dCA9IGVsZW1lbnRUZXh0KGFjdHVhbCk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBhc3M6IGFjdHVhbFRleHQgPT0gZXhwZWN0ZWRUZXh0LFxuICAgICAgICAgICAgZ2V0IG1lc3NhZ2UoKSB7IHJldHVybiAnRXhwZWN0ZWQgJyArIGFjdHVhbFRleHQgKyAnIHRvIGJlIGVxdWFsIHRvICcgKyBleHBlY3RlZFRleHQ7IH1cbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB0b0hhdmVDc3NDbGFzczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge2NvbXBhcmU6IGJ1aWxkRXJyb3IoZmFsc2UpLCBuZWdhdGl2ZUNvbXBhcmU6IGJ1aWxkRXJyb3IodHJ1ZSl9O1xuXG4gICAgICBmdW5jdGlvbiBidWlsZEVycm9yKGlzTm90OiBib29sZWFuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihhY3R1YWw6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcGFzczogaGFzQ2xhc3MoYWN0dWFsLCBjbGFzc05hbWUpID09ICFpc05vdCxcbiAgICAgICAgICAgIGdldCBtZXNzYWdlKCkge1xuICAgICAgICAgICAgICByZXR1cm4gYEV4cGVjdGVkICR7YWN0dWFsLm91dGVySFRNTH0gJHtpc05vdCA/ICdub3QgJyA6ICcnfXRvIGNvbnRhaW4gdGhlIENTUyBjbGFzcyBcIiR7Y2xhc3NOYW1lfVwiYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB0b0hhdmVDc3NTdHlsZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21wYXJlOiBmdW5jdGlvbihhY3R1YWw6IGFueSwgc3R5bGVzOiB7W2s6IHN0cmluZ106IHN0cmluZ318c3RyaW5nKSB7XG4gICAgICAgICAgbGV0IGFsbFBhc3NlZDogYm9vbGVhbjtcbiAgICAgICAgICBpZiAodHlwZW9mIHN0eWxlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGFsbFBhc3NlZCA9IGhhc1N0eWxlKGFjdHVhbCwgc3R5bGVzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWxsUGFzc2VkID0gT2JqZWN0LmtleXMoc3R5bGVzKS5sZW5ndGggIT09IDA7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2goXG4gICAgICAgICAgICAgICAgcHJvcCA9PiB7IGFsbFBhc3NlZCA9IGFsbFBhc3NlZCAmJiBoYXNTdHlsZShhY3R1YWwsIHByb3AsIHN0eWxlc1twcm9wXSk7IH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwYXNzOiBhbGxQYXNzZWQsXG4gICAgICAgICAgICBnZXQgbWVzc2FnZSgpIHtcbiAgICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRWYWx1ZVN0ciA9IHR5cGVvZiBzdHlsZXMgPT09ICdzdHJpbmcnID8gc3R5bGVzIDogSlNPTi5zdHJpbmdpZnkoc3R5bGVzKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGBFeHBlY3RlZCAke2FjdHVhbC5vdXRlckhUTUx9ICR7IWFsbFBhc3NlZCA/ICcgJyA6ICdub3QgJ310byBjb250YWluIHRoZVxuICAgICAgICAgICAgICAgICAgICAgIENTUyAke3R5cGVvZiBzdHlsZXMgPT09ICdzdHJpbmcnID8gJ3Byb3BlcnR5JyA6ICdzdHlsZXMnfSBcIiR7ZXhwZWN0ZWRWYWx1ZVN0cn1cImA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdG9Db250YWluRXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tcGFyZTogZnVuY3Rpb24oYWN0dWFsOiBhbnksIGV4cGVjdGVkVGV4dDogYW55KSB7XG4gICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYWN0dWFsLnRvU3RyaW5nKCk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBhc3M6IGVycm9yTWVzc2FnZS5pbmRleE9mKGV4cGVjdGVkVGV4dCkgPiAtMSxcbiAgICAgICAgICAgIGdldCBtZXNzYWdlKCkgeyByZXR1cm4gJ0V4cGVjdGVkICcgKyBlcnJvck1lc3NhZ2UgKyAnIHRvIGNvbnRhaW4gJyArIGV4cGVjdGVkVGV4dDsgfVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHRvSW1wbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbXBhcmU6IGZ1bmN0aW9uKGFjdHVhbE9iamVjdDogYW55LCBleHBlY3RlZEludGVyZmFjZTogYW55KSB7XG4gICAgICAgICAgY29uc3QgaW50UHJvcHMgPSBPYmplY3Qua2V5cyhleHBlY3RlZEludGVyZmFjZS5wcm90b3R5cGUpO1xuXG4gICAgICAgICAgY29uc3QgbWlzc2VkTWV0aG9kczogYW55W10gPSBbXTtcbiAgICAgICAgICBpbnRQcm9wcy5mb3JFYWNoKChrKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWFjdHVhbE9iamVjdC5jb25zdHJ1Y3Rvci5wcm90b3R5cGVba10pIG1pc3NlZE1ldGhvZHMucHVzaChrKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwYXNzOiBtaXNzZWRNZXRob2RzLmxlbmd0aCA9PSAwLFxuICAgICAgICAgICAgZ2V0IG1lc3NhZ2UoKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnRXhwZWN0ZWQgJyArIGFjdHVhbE9iamVjdCArICcgdG8gaGF2ZSB0aGUgZm9sbG93aW5nIG1ldGhvZHM6ICcgK1xuICAgICAgICAgICAgICAgICAgbWlzc2VkTWV0aG9kcy5qb2luKCcsICcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHRvQ29udGFpbkNvbXBvbmVudDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21wYXJlOiBmdW5jdGlvbihhY3R1YWxGaXh0dXJlOiBhbnksIGV4cGVjdGVkQ29tcG9uZW50VHlwZTogVHlwZTxhbnk+KSB7XG4gICAgICAgICAgY29uc3QgZmFpbE91dHB1dCA9IGFyZ3VtZW50c1syXTtcbiAgICAgICAgICBjb25zdCBtc2dGbiA9IChtc2c6IHN0cmluZyk6IHN0cmluZyA9PiBbbXNnLCBmYWlsT3V0cHV0XS5maWx0ZXIoQm9vbGVhbikuam9pbignLCAnKTtcblxuICAgICAgICAgIC8vIHZlcmlmeSBjb3JyZWN0IGFjdHVhbCB0eXBlXG4gICAgICAgICAgaWYgKCEoYWN0dWFsRml4dHVyZSBpbnN0YW5jZW9mIENvbXBvbmVudEZpeHR1cmUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBwYXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgbWVzc2FnZTogbXNnRm4oXG4gICAgICAgICAgICAgICAgICBgRXhwZWN0ZWQgYWN0dWFsIHRvIGJlIG9mIHR5cGUgXFwnQ29tcG9uZW50Rml4dHVyZVxcJyBbYWN0dWFsPSR7YWN0dWFsRml4dHVyZS5jb25zdHJ1Y3Rvci5uYW1lfV1gKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBmb3VuZCA9ICEhYWN0dWFsRml4dHVyZS5kZWJ1Z0VsZW1lbnQucXVlcnkoQnkuZGlyZWN0aXZlKGV4cGVjdGVkQ29tcG9uZW50VHlwZSkpO1xuICAgICAgICAgIHJldHVybiBmb3VuZCA/XG4gICAgICAgICAgICAgIHtwYXNzOiB0cnVlfSA6XG4gICAgICAgICAgICAgIHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogbXNnRm4oYEV4cGVjdGVkICR7ZXhwZWN0ZWRDb21wb25lbnRUeXBlLm5hbWV9IHRvIHNob3dgKX07XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9KTtcbn0pO1xuXG5mdW5jdGlvbiBlbGVtZW50VGV4dChuOiBhbnkpOiBzdHJpbmcge1xuICBjb25zdCBoYXNOb2RlcyA9IChuOiBhbnkpID0+IHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IG4uY2hpbGROb2RlcztcbiAgICByZXR1cm4gY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoID4gMDtcbiAgfTtcblxuICBpZiAobiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgcmV0dXJuIG4ubWFwKGVsZW1lbnRUZXh0KS5qb2luKCcnKTtcbiAgfVxuXG4gIGlmIChpc0NvbW1lbnROb2RlKG4pKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgaWYgKGdldERPTSgpLmlzRWxlbWVudE5vZGUobikgJiYgKG4gYXMgRWxlbWVudCkudGFnTmFtZSA9PSAnQ09OVEVOVCcpIHtcbiAgICByZXR1cm4gZWxlbWVudFRleHQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KCg8YW55Pm4pLmdldERpc3RyaWJ1dGVkTm9kZXMoKSkpO1xuICB9XG5cbiAgaWYgKGhhc1NoYWRvd1Jvb3QobikpIHtcbiAgICByZXR1cm4gZWxlbWVudFRleHQoY2hpbGROb2Rlc0FzTGlzdCgoPGFueT5uKS5zaGFkb3dSb290KSk7XG4gIH1cblxuICBpZiAoaGFzTm9kZXMobikpIHtcbiAgICByZXR1cm4gZWxlbWVudFRleHQoY2hpbGROb2Rlc0FzTGlzdChuKSk7XG4gIH1cblxuICByZXR1cm4gKG4gYXMgYW55KS50ZXh0Q29udGVudDtcbn1cblxuZnVuY3Rpb24gaGFzU2hhZG93Um9vdChub2RlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5vZGUuc2hhZG93Um9vdCAhPSBudWxsICYmIG5vZGUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudDtcbn1cbiJdfQ==