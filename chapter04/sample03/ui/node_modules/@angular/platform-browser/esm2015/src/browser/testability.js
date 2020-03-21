/**
 * @fileoverview added by tsickle
 * Generated from: packages/platform-browser/src/browser/testability.ts
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
import { setTestabilityGetter, ɵglobal as global } from '@angular/core';
export class BrowserGetTestability {
    /**
     * @return {?}
     */
    static init() { setTestabilityGetter(new BrowserGetTestability()); }
    /**
     * @param {?} registry
     * @return {?}
     */
    addToWindow(registry) {
        global['getAngularTestability'] = (/**
         * @param {?} elem
         * @param {?=} findInAncestors
         * @return {?}
         */
        (elem, findInAncestors = true) => {
            /** @type {?} */
            const testability = registry.findTestabilityInTree(elem, findInAncestors);
            if (testability == null) {
                throw new Error('Could not find testability for element.');
            }
            return testability;
        });
        global['getAllAngularTestabilities'] = (/**
         * @return {?}
         */
        () => registry.getAllTestabilities());
        global['getAllAngularRootElements'] = (/**
         * @return {?}
         */
        () => registry.getAllRootElements());
        /** @type {?} */
        const whenAllStable = (/**
         * @param {?} callback
         * @return {?}
         */
        (callback /** TODO #9100 */) => {
            /** @type {?} */
            const testabilities = global['getAllAngularTestabilities']();
            /** @type {?} */
            let count = testabilities.length;
            /** @type {?} */
            let didWork = false;
            /** @type {?} */
            const decrement = (/**
             * @param {?} didWork_
             * @return {?}
             */
            function (didWork_ /** TODO #9100 */) {
                didWork = didWork || didWork_;
                count--;
                if (count == 0) {
                    callback(didWork);
                }
            });
            testabilities.forEach((/**
             * @param {?} testability
             * @return {?}
             */
            function (testability /** TODO #9100 */) {
                testability.whenStable(decrement);
            }));
        });
        if (!global['frameworkStabilizers']) {
            global['frameworkStabilizers'] = [];
        }
        global['frameworkStabilizers'].push(whenAllStable);
    }
    /**
     * @param {?} registry
     * @param {?} elem
     * @param {?} findInAncestors
     * @return {?}
     */
    findTestabilityInTree(registry, elem, findInAncestors) {
        if (elem == null) {
            return null;
        }
        /** @type {?} */
        const t = registry.getTestability(elem);
        if (t != null) {
            return t;
        }
        else if (!findInAncestors) {
            return null;
        }
        if (getDOM().isShadowRoot(elem)) {
            return this.findTestabilityInTree(registry, ((/** @type {?} */ (elem))).host, true);
        }
        return this.findTestabilityInTree(registry, elem.parentElement, true);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL3NyYy9icm93c2VyL3Rlc3RhYmlsaXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxPQUFPLElBQUksTUFBTSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDbEQsT0FBTyxFQUFtRCxvQkFBb0IsRUFBRSxPQUFPLElBQUksTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXhILE1BQU0sT0FBTyxxQkFBcUI7Ozs7SUFDaEMsTUFBTSxDQUFDLElBQUksS0FBSyxvQkFBb0IsQ0FBQyxJQUFJLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBRXBFLFdBQVcsQ0FBQyxRQUE2QjtRQUN2QyxNQUFNLENBQUMsdUJBQXVCLENBQUM7Ozs7O1FBQUcsQ0FBQyxJQUFTLEVBQUUsa0JBQTJCLElBQUksRUFBRSxFQUFFOztrQkFDekUsV0FBVyxHQUFHLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDO1lBQ3pFLElBQUksV0FBVyxJQUFJLElBQUksRUFBRTtnQkFDdkIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO2FBQzVEO1lBQ0QsT0FBTyxXQUFXLENBQUM7UUFDckIsQ0FBQyxDQUFBLENBQUM7UUFFRixNQUFNLENBQUMsNEJBQTRCLENBQUM7OztRQUFHLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxDQUFBLENBQUM7UUFFNUUsTUFBTSxDQUFDLDJCQUEyQixDQUFDOzs7UUFBRyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsQ0FBQSxDQUFDOztjQUVwRSxhQUFhOzs7O1FBQUcsQ0FBQyxRQUFhLENBQUMsaUJBQWlCLEVBQUUsRUFBRTs7a0JBQ2xELGFBQWEsR0FBRyxNQUFNLENBQUMsNEJBQTRCLENBQUMsRUFBRTs7Z0JBQ3hELEtBQUssR0FBRyxhQUFhLENBQUMsTUFBTTs7Z0JBQzVCLE9BQU8sR0FBRyxLQUFLOztrQkFDYixTQUFTOzs7O1lBQUcsVUFBUyxRQUFhLENBQUMsaUJBQWlCO2dCQUN4RCxPQUFPLEdBQUcsT0FBTyxJQUFJLFFBQVEsQ0FBQztnQkFDOUIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO29CQUNkLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDbkI7WUFDSCxDQUFDLENBQUE7WUFDRCxhQUFhLENBQUMsT0FBTzs7OztZQUFDLFVBQVMsV0FBZ0IsQ0FBQyxpQkFBaUI7Z0JBQy9ELFdBQVcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDcEMsQ0FBQyxFQUFDLENBQUM7UUFDTCxDQUFDLENBQUE7UUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLEVBQUU7WUFDbkMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ3JDO1FBQ0QsTUFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3JELENBQUM7Ozs7Ozs7SUFFRCxxQkFBcUIsQ0FBQyxRQUE2QixFQUFFLElBQVMsRUFBRSxlQUF3QjtRQUV0RixJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7WUFDaEIsT0FBTyxJQUFJLENBQUM7U0FDYjs7Y0FDSyxDQUFDLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7UUFDdkMsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFO1lBQ2IsT0FBTyxDQUFDLENBQUM7U0FDVjthQUFNLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDM0IsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELElBQUksTUFBTSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQy9CLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxDQUFDLG1CQUFLLElBQUksRUFBQSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3JFO1FBQ0QsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDeEUsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge8m1Z2V0RE9NIGFzIGdldERPTX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7R2V0VGVzdGFiaWxpdHksIFRlc3RhYmlsaXR5LCBUZXN0YWJpbGl0eVJlZ2lzdHJ5LCBzZXRUZXN0YWJpbGl0eUdldHRlciwgybVnbG9iYWwgYXMgZ2xvYmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuZXhwb3J0IGNsYXNzIEJyb3dzZXJHZXRUZXN0YWJpbGl0eSBpbXBsZW1lbnRzIEdldFRlc3RhYmlsaXR5IHtcbiAgc3RhdGljIGluaXQoKSB7IHNldFRlc3RhYmlsaXR5R2V0dGVyKG5ldyBCcm93c2VyR2V0VGVzdGFiaWxpdHkoKSk7IH1cblxuICBhZGRUb1dpbmRvdyhyZWdpc3RyeTogVGVzdGFiaWxpdHlSZWdpc3RyeSk6IHZvaWQge1xuICAgIGdsb2JhbFsnZ2V0QW5ndWxhclRlc3RhYmlsaXR5J10gPSAoZWxlbTogYW55LCBmaW5kSW5BbmNlc3RvcnM6IGJvb2xlYW4gPSB0cnVlKSA9PiB7XG4gICAgICBjb25zdCB0ZXN0YWJpbGl0eSA9IHJlZ2lzdHJ5LmZpbmRUZXN0YWJpbGl0eUluVHJlZShlbGVtLCBmaW5kSW5BbmNlc3RvcnMpO1xuICAgICAgaWYgKHRlc3RhYmlsaXR5ID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCB0ZXN0YWJpbGl0eSBmb3IgZWxlbWVudC4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0ZXN0YWJpbGl0eTtcbiAgICB9O1xuXG4gICAgZ2xvYmFsWydnZXRBbGxBbmd1bGFyVGVzdGFiaWxpdGllcyddID0gKCkgPT4gcmVnaXN0cnkuZ2V0QWxsVGVzdGFiaWxpdGllcygpO1xuXG4gICAgZ2xvYmFsWydnZXRBbGxBbmd1bGFyUm9vdEVsZW1lbnRzJ10gPSAoKSA9PiByZWdpc3RyeS5nZXRBbGxSb290RWxlbWVudHMoKTtcblxuICAgIGNvbnN0IHdoZW5BbGxTdGFibGUgPSAoY2FsbGJhY2s6IGFueSAvKiogVE9ETyAjOTEwMCAqLykgPT4ge1xuICAgICAgY29uc3QgdGVzdGFiaWxpdGllcyA9IGdsb2JhbFsnZ2V0QWxsQW5ndWxhclRlc3RhYmlsaXRpZXMnXSgpO1xuICAgICAgbGV0IGNvdW50ID0gdGVzdGFiaWxpdGllcy5sZW5ndGg7XG4gICAgICBsZXQgZGlkV29yayA9IGZhbHNlO1xuICAgICAgY29uc3QgZGVjcmVtZW50ID0gZnVuY3Rpb24oZGlkV29ya186IGFueSAvKiogVE9ETyAjOTEwMCAqLykge1xuICAgICAgICBkaWRXb3JrID0gZGlkV29yayB8fCBkaWRXb3JrXztcbiAgICAgICAgY291bnQtLTtcbiAgICAgICAgaWYgKGNvdW50ID09IDApIHtcbiAgICAgICAgICBjYWxsYmFjayhkaWRXb3JrKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHRlc3RhYmlsaXRpZXMuZm9yRWFjaChmdW5jdGlvbih0ZXN0YWJpbGl0eTogYW55IC8qKiBUT0RPICM5MTAwICovKSB7XG4gICAgICAgIHRlc3RhYmlsaXR5LndoZW5TdGFibGUoZGVjcmVtZW50KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBpZiAoIWdsb2JhbFsnZnJhbWV3b3JrU3RhYmlsaXplcnMnXSkge1xuICAgICAgZ2xvYmFsWydmcmFtZXdvcmtTdGFiaWxpemVycyddID0gW107XG4gICAgfVxuICAgIGdsb2JhbFsnZnJhbWV3b3JrU3RhYmlsaXplcnMnXS5wdXNoKHdoZW5BbGxTdGFibGUpO1xuICB9XG5cbiAgZmluZFRlc3RhYmlsaXR5SW5UcmVlKHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5LCBlbGVtOiBhbnksIGZpbmRJbkFuY2VzdG9yczogYm9vbGVhbik6XG4gICAgICBUZXN0YWJpbGl0eXxudWxsIHtcbiAgICBpZiAoZWxlbSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgdCA9IHJlZ2lzdHJ5LmdldFRlc3RhYmlsaXR5KGVsZW0pO1xuICAgIGlmICh0ICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0O1xuICAgIH0gZWxzZSBpZiAoIWZpbmRJbkFuY2VzdG9ycykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChnZXRET00oKS5pc1NoYWRvd1Jvb3QoZWxlbSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbmRUZXN0YWJpbGl0eUluVHJlZShyZWdpc3RyeSwgKDxhbnk+ZWxlbSkuaG9zdCwgdHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZpbmRUZXN0YWJpbGl0eUluVHJlZShyZWdpc3RyeSwgZWxlbS5wYXJlbnRFbGVtZW50LCB0cnVlKTtcbiAgfVxufVxuIl19