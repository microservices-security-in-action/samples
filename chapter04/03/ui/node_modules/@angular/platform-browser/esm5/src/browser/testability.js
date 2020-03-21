/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵgetDOM as getDOM } from '@angular/common';
import { setTestabilityGetter, ɵglobal as global } from '@angular/core';
var BrowserGetTestability = /** @class */ (function () {
    function BrowserGetTestability() {
    }
    BrowserGetTestability.init = function () { setTestabilityGetter(new BrowserGetTestability()); };
    BrowserGetTestability.prototype.addToWindow = function (registry) {
        global['getAngularTestability'] = function (elem, findInAncestors) {
            if (findInAncestors === void 0) { findInAncestors = true; }
            var testability = registry.findTestabilityInTree(elem, findInAncestors);
            if (testability == null) {
                throw new Error('Could not find testability for element.');
            }
            return testability;
        };
        global['getAllAngularTestabilities'] = function () { return registry.getAllTestabilities(); };
        global['getAllAngularRootElements'] = function () { return registry.getAllRootElements(); };
        var whenAllStable = function (callback /** TODO #9100 */) {
            var testabilities = global['getAllAngularTestabilities']();
            var count = testabilities.length;
            var didWork = false;
            var decrement = function (didWork_ /** TODO #9100 */) {
                didWork = didWork || didWork_;
                count--;
                if (count == 0) {
                    callback(didWork);
                }
            };
            testabilities.forEach(function (testability /** TODO #9100 */) {
                testability.whenStable(decrement);
            });
        };
        if (!global['frameworkStabilizers']) {
            global['frameworkStabilizers'] = [];
        }
        global['frameworkStabilizers'].push(whenAllStable);
    };
    BrowserGetTestability.prototype.findTestabilityInTree = function (registry, elem, findInAncestors) {
        if (elem == null) {
            return null;
        }
        var t = registry.getTestability(elem);
        if (t != null) {
            return t;
        }
        else if (!findInAncestors) {
            return null;
        }
        if (getDOM().isShadowRoot(elem)) {
            return this.findTestabilityInTree(registry, elem.host, true);
        }
        return this.findTestabilityInTree(registry, elem.parentElement, true);
    };
    return BrowserGetTestability;
}());
export { BrowserGetTestability };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL3NyYy9icm93c2VyL3Rlc3RhYmlsaXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxPQUFPLElBQUksTUFBTSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDbEQsT0FBTyxFQUFtRCxvQkFBb0IsRUFBRSxPQUFPLElBQUksTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXhIO0lBQUE7SUFzREEsQ0FBQztJQXJEUSwwQkFBSSxHQUFYLGNBQWdCLG9CQUFvQixDQUFDLElBQUkscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVwRSwyQ0FBVyxHQUFYLFVBQVksUUFBNkI7UUFDdkMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsVUFBQyxJQUFTLEVBQUUsZUFBK0I7WUFBL0IsZ0NBQUEsRUFBQSxzQkFBK0I7WUFDM0UsSUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztZQUMxRSxJQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUU7Z0JBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQzthQUM1RDtZQUNELE9BQU8sV0FBVyxDQUFDO1FBQ3JCLENBQUMsQ0FBQztRQUVGLE1BQU0sQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLGNBQU0sT0FBQSxRQUFRLENBQUMsbUJBQW1CLEVBQUUsRUFBOUIsQ0FBOEIsQ0FBQztRQUU1RSxNQUFNLENBQUMsMkJBQTJCLENBQUMsR0FBRyxjQUFNLE9BQUEsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEVBQTdCLENBQTZCLENBQUM7UUFFMUUsSUFBTSxhQUFhLEdBQUcsVUFBQyxRQUFhLENBQUMsaUJBQWlCO1lBQ3BELElBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLENBQUM7WUFDN0QsSUFBSSxLQUFLLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQztZQUNqQyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFBTSxTQUFTLEdBQUcsVUFBUyxRQUFhLENBQUMsaUJBQWlCO2dCQUN4RCxPQUFPLEdBQUcsT0FBTyxJQUFJLFFBQVEsQ0FBQztnQkFDOUIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO29CQUNkLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDbkI7WUFDSCxDQUFDLENBQUM7WUFDRixhQUFhLENBQUMsT0FBTyxDQUFDLFVBQVMsV0FBZ0IsQ0FBQyxpQkFBaUI7Z0JBQy9ELFdBQVcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLEVBQUU7WUFDbkMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ3JDO1FBQ0QsTUFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCxxREFBcUIsR0FBckIsVUFBc0IsUUFBNkIsRUFBRSxJQUFTLEVBQUUsZUFBd0I7UUFFdEYsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1lBQ2hCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRTtZQUNiLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7YUFBTSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQzNCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFJLE1BQU0sRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMvQixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLEVBQVEsSUFBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNyRTtRQUNELE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFDSCw0QkFBQztBQUFELENBQUMsQUF0REQsSUFzREMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ybVnZXRET00gYXMgZ2V0RE9NfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtHZXRUZXN0YWJpbGl0eSwgVGVzdGFiaWxpdHksIFRlc3RhYmlsaXR5UmVnaXN0cnksIHNldFRlc3RhYmlsaXR5R2V0dGVyLCDJtWdsb2JhbCBhcyBnbG9iYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5leHBvcnQgY2xhc3MgQnJvd3NlckdldFRlc3RhYmlsaXR5IGltcGxlbWVudHMgR2V0VGVzdGFiaWxpdHkge1xuICBzdGF0aWMgaW5pdCgpIHsgc2V0VGVzdGFiaWxpdHlHZXR0ZXIobmV3IEJyb3dzZXJHZXRUZXN0YWJpbGl0eSgpKTsgfVxuXG4gIGFkZFRvV2luZG93KHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5KTogdm9pZCB7XG4gICAgZ2xvYmFsWydnZXRBbmd1bGFyVGVzdGFiaWxpdHknXSA9IChlbGVtOiBhbnksIGZpbmRJbkFuY2VzdG9yczogYm9vbGVhbiA9IHRydWUpID0+IHtcbiAgICAgIGNvbnN0IHRlc3RhYmlsaXR5ID0gcmVnaXN0cnkuZmluZFRlc3RhYmlsaXR5SW5UcmVlKGVsZW0sIGZpbmRJbkFuY2VzdG9ycyk7XG4gICAgICBpZiAodGVzdGFiaWxpdHkgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIHRlc3RhYmlsaXR5IGZvciBlbGVtZW50LicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRlc3RhYmlsaXR5O1xuICAgIH07XG5cbiAgICBnbG9iYWxbJ2dldEFsbEFuZ3VsYXJUZXN0YWJpbGl0aWVzJ10gPSAoKSA9PiByZWdpc3RyeS5nZXRBbGxUZXN0YWJpbGl0aWVzKCk7XG5cbiAgICBnbG9iYWxbJ2dldEFsbEFuZ3VsYXJSb290RWxlbWVudHMnXSA9ICgpID0+IHJlZ2lzdHJ5LmdldEFsbFJvb3RFbGVtZW50cygpO1xuXG4gICAgY29uc3Qgd2hlbkFsbFN0YWJsZSA9IChjYWxsYmFjazogYW55IC8qKiBUT0RPICM5MTAwICovKSA9PiB7XG4gICAgICBjb25zdCB0ZXN0YWJpbGl0aWVzID0gZ2xvYmFsWydnZXRBbGxBbmd1bGFyVGVzdGFiaWxpdGllcyddKCk7XG4gICAgICBsZXQgY291bnQgPSB0ZXN0YWJpbGl0aWVzLmxlbmd0aDtcbiAgICAgIGxldCBkaWRXb3JrID0gZmFsc2U7XG4gICAgICBjb25zdCBkZWNyZW1lbnQgPSBmdW5jdGlvbihkaWRXb3JrXzogYW55IC8qKiBUT0RPICM5MTAwICovKSB7XG4gICAgICAgIGRpZFdvcmsgPSBkaWRXb3JrIHx8IGRpZFdvcmtfO1xuICAgICAgICBjb3VudC0tO1xuICAgICAgICBpZiAoY291bnQgPT0gMCkge1xuICAgICAgICAgIGNhbGxiYWNrKGRpZFdvcmspO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdGVzdGFiaWxpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKHRlc3RhYmlsaXR5OiBhbnkgLyoqIFRPRE8gIzkxMDAgKi8pIHtcbiAgICAgICAgdGVzdGFiaWxpdHkud2hlblN0YWJsZShkZWNyZW1lbnQpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGlmICghZ2xvYmFsWydmcmFtZXdvcmtTdGFiaWxpemVycyddKSB7XG4gICAgICBnbG9iYWxbJ2ZyYW1ld29ya1N0YWJpbGl6ZXJzJ10gPSBbXTtcbiAgICB9XG4gICAgZ2xvYmFsWydmcmFtZXdvcmtTdGFiaWxpemVycyddLnB1c2god2hlbkFsbFN0YWJsZSk7XG4gIH1cblxuICBmaW5kVGVzdGFiaWxpdHlJblRyZWUocmVnaXN0cnk6IFRlc3RhYmlsaXR5UmVnaXN0cnksIGVsZW06IGFueSwgZmluZEluQW5jZXN0b3JzOiBib29sZWFuKTpcbiAgICAgIFRlc3RhYmlsaXR5fG51bGwge1xuICAgIGlmIChlbGVtID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB0ID0gcmVnaXN0cnkuZ2V0VGVzdGFiaWxpdHkoZWxlbSk7XG4gICAgaWYgKHQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHQ7XG4gICAgfSBlbHNlIGlmICghZmluZEluQW5jZXN0b3JzKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKGdldERPTSgpLmlzU2hhZG93Um9vdChlbGVtKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZmluZFRlc3RhYmlsaXR5SW5UcmVlKHJlZ2lzdHJ5LCAoPGFueT5lbGVtKS5ob3N0LCB0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmluZFRlc3RhYmlsaXR5SW5UcmVlKHJlZ2lzdHJ5LCBlbGVtLnBhcmVudEVsZW1lbnQsIHRydWUpO1xuICB9XG59XG4iXX0=