import { __decorate, __extends, __metadata, __param } from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, InjectionToken, Optional, ɵɵinject } from '@angular/core';
import { DOCUMENT } from '../dom_tokens';
import { PlatformLocation } from './platform_location';
import { joinWithSlash, normalizeQueryParams } from './util';
import * as i0 from "@angular/core";
/**
 * Enables the `Location` service to read route state from the browser's URL.
 * Angular provides two strategies:
 * `HashLocationStrategy` and `PathLocationStrategy`.
 *
 * Applications should use the `Router` or `Location` services to
 * interact with application route state.
 *
 * For instance, `HashLocationStrategy` produces URLs like
 * <code class="no-auto-link">http://example.com#/foo</code>,
 * and `PathLocationStrategy` produces
 * <code class="no-auto-link">http://example.com/foo</code> as an equivalent URL.
 *
 * See these two classes for more.
 *
 * @publicApi
 */
var LocationStrategy = /** @class */ (function () {
    function LocationStrategy() {
    }
    LocationStrategy.ɵprov = i0.ɵɵdefineInjectable({ factory: provideLocationStrategy, token: LocationStrategy, providedIn: "root" });
    LocationStrategy = __decorate([
        Injectable({ providedIn: 'root', useFactory: provideLocationStrategy })
    ], LocationStrategy);
    return LocationStrategy;
}());
export { LocationStrategy };
export function provideLocationStrategy(platformLocation) {
    // See #23917
    var location = ɵɵinject(DOCUMENT).location;
    return new PathLocationStrategy(ɵɵinject(PlatformLocation), location && location.origin || '');
}
/**
 * A predefined [DI token](guide/glossary#di-token) for the base href
 * to be used with the `PathLocationStrategy`.
 * The base href is the URL prefix that should be preserved when generating
 * and recognizing URLs.
 *
 * @usageNotes
 *
 * The following example shows how to use this token to configure the root app injector
 * with a base href value, so that the DI framework can supply the dependency anywhere in the app.
 *
 * ```typescript
 * import {Component, NgModule} from '@angular/core';
 * import {APP_BASE_HREF} from '@angular/common';
 *
 * @NgModule({
 *   providers: [{provide: APP_BASE_HREF, useValue: '/my/app'}]
 * })
 * class AppModule {}
 * ```
 *
 * @publicApi
 */
export var APP_BASE_HREF = new InjectionToken('appBaseHref');
/**
 * @description
 * A {@link LocationStrategy} used to configure the {@link Location} service to
 * represent its state in the
 * [path](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax) of the
 * browser's URL.
 *
 * If you're using `PathLocationStrategy`, you must provide a {@link APP_BASE_HREF}
 * or add a base element to the document. This URL prefix that will be preserved
 * when generating and recognizing URLs.
 *
 * For instance, if you provide an `APP_BASE_HREF` of `'/my/app'` and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`.
 *
 * Similarly, if you add `<base href='/my/app'/>` to the document and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/location/ts/path_location_component.ts region='LocationComponent'}
 *
 * @publicApi
 */
var PathLocationStrategy = /** @class */ (function (_super) {
    __extends(PathLocationStrategy, _super);
    function PathLocationStrategy(_platformLocation, href) {
        var _this = _super.call(this) || this;
        _this._platformLocation = _platformLocation;
        if (href == null) {
            href = _this._platformLocation.getBaseHrefFromDOM();
        }
        if (href == null) {
            throw new Error("No base href set. Please provide a value for the APP_BASE_HREF token or add a base element to the document.");
        }
        _this._baseHref = href;
        return _this;
    }
    PathLocationStrategy.prototype.onPopState = function (fn) {
        this._platformLocation.onPopState(fn);
        this._platformLocation.onHashChange(fn);
    };
    PathLocationStrategy.prototype.getBaseHref = function () { return this._baseHref; };
    PathLocationStrategy.prototype.prepareExternalUrl = function (internal) { return joinWithSlash(this._baseHref, internal); };
    PathLocationStrategy.prototype.path = function (includeHash) {
        if (includeHash === void 0) { includeHash = false; }
        var pathname = this._platformLocation.pathname + normalizeQueryParams(this._platformLocation.search);
        var hash = this._platformLocation.hash;
        return hash && includeHash ? "" + pathname + hash : pathname;
    };
    PathLocationStrategy.prototype.pushState = function (state, title, url, queryParams) {
        var externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
        this._platformLocation.pushState(state, title, externalUrl);
    };
    PathLocationStrategy.prototype.replaceState = function (state, title, url, queryParams) {
        var externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
        this._platformLocation.replaceState(state, title, externalUrl);
    };
    PathLocationStrategy.prototype.forward = function () { this._platformLocation.forward(); };
    PathLocationStrategy.prototype.back = function () { this._platformLocation.back(); };
    PathLocationStrategy = __decorate([
        Injectable(),
        __param(1, Optional()), __param(1, Inject(APP_BASE_HREF)),
        __metadata("design:paramtypes", [PlatformLocation, String])
    ], PathLocationStrategy);
    return PathLocationStrategy;
}(LocationStrategy));
export { PathLocationStrategy };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL2xvY2F0aW9uX3N0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyRixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBeUIsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM3RSxPQUFPLEVBQUMsYUFBYSxFQUFFLG9CQUFvQixFQUFDLE1BQU0sUUFBUSxDQUFDOztBQUUzRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUVIO0lBQUE7S0FTQzs7SUFUcUIsZ0JBQWdCO1FBRHJDLFVBQVUsQ0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLHVCQUF1QixFQUFDLENBQUM7T0FDaEQsZ0JBQWdCLENBU3JDOzJCQXhDRDtDQXdDQyxBQVRELElBU0M7U0FUcUIsZ0JBQWdCO0FBV3RDLE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxnQkFBa0M7SUFDeEUsYUFBYTtJQUNiLElBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUM7SUFDN0MsT0FBTyxJQUFJLG9CQUFvQixDQUMzQixRQUFRLENBQUMsZ0JBQXVCLENBQUMsRUFBRSxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM1RSxDQUFDO0FBR0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQkc7QUFDSCxNQUFNLENBQUMsSUFBTSxhQUFhLEdBQUcsSUFBSSxjQUFjLENBQVMsYUFBYSxDQUFDLENBQUM7QUFFdkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMEJHO0FBRUg7SUFBMEMsd0NBQWdCO0lBR3hELDhCQUNZLGlCQUFtQyxFQUNSLElBQWE7UUFGcEQsWUFHRSxpQkFBTyxTQVlSO1FBZFcsdUJBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUk3QyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7WUFDaEIsSUFBSSxHQUFHLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1NBQ3BEO1FBRUQsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQ1gsNkdBQTZHLENBQUMsQ0FBQztTQUNwSDtRQUVELEtBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOztJQUN4QixDQUFDO0lBRUQseUNBQVUsR0FBVixVQUFXLEVBQTBCO1FBQ25DLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsMENBQVcsR0FBWCxjQUF3QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBRWhELGlEQUFrQixHQUFsQixVQUFtQixRQUFnQixJQUFZLE9BQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRWhHLG1DQUFJLEdBQUosVUFBSyxXQUE0QjtRQUE1Qiw0QkFBQSxFQUFBLG1CQUE0QjtRQUMvQixJQUFNLFFBQVEsR0FDVixJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxRixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBRyxRQUFRLEdBQUcsSUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7SUFDL0QsQ0FBQztJQUVELHdDQUFTLEdBQVQsVUFBVSxLQUFVLEVBQUUsS0FBYSxFQUFFLEdBQVcsRUFBRSxXQUFtQjtRQUNuRSxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxHQUFHLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDckYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRCwyQ0FBWSxHQUFaLFVBQWEsS0FBVSxFQUFFLEtBQWEsRUFBRSxHQUFXLEVBQUUsV0FBbUI7UUFDdEUsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsR0FBRyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3JGLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsc0NBQU8sR0FBUCxjQUFrQixJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXJELG1DQUFJLEdBQUosY0FBZSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBaERwQyxvQkFBb0I7UUFEaEMsVUFBVSxFQUFFO1FBTU4sV0FBQSxRQUFRLEVBQUUsQ0FBQSxFQUFFLFdBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFBO3lDQURQLGdCQUFnQjtPQUpwQyxvQkFBb0IsQ0FpRGhDO0lBQUQsMkJBQUM7Q0FBQSxBQWpERCxDQUEwQyxnQkFBZ0IsR0FpRHpEO1NBakRZLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBPcHRpb25hbCwgybXJtWluamVjdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuLi9kb21fdG9rZW5zJztcbmltcG9ydCB7TG9jYXRpb25DaGFuZ2VMaXN0ZW5lciwgUGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnLi9wbGF0Zm9ybV9sb2NhdGlvbic7XG5pbXBvcnQge2pvaW5XaXRoU2xhc2gsIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIEVuYWJsZXMgdGhlIGBMb2NhdGlvbmAgc2VydmljZSB0byByZWFkIHJvdXRlIHN0YXRlIGZyb20gdGhlIGJyb3dzZXIncyBVUkwuXG4gKiBBbmd1bGFyIHByb3ZpZGVzIHR3byBzdHJhdGVnaWVzOlxuICogYEhhc2hMb2NhdGlvblN0cmF0ZWd5YCBhbmQgYFBhdGhMb2NhdGlvblN0cmF0ZWd5YC5cbiAqXG4gKiBBcHBsaWNhdGlvbnMgc2hvdWxkIHVzZSB0aGUgYFJvdXRlcmAgb3IgYExvY2F0aW9uYCBzZXJ2aWNlcyB0b1xuICogaW50ZXJhY3Qgd2l0aCBhcHBsaWNhdGlvbiByb3V0ZSBzdGF0ZS5cbiAqXG4gKiBGb3IgaW5zdGFuY2UsIGBIYXNoTG9jYXRpb25TdHJhdGVneWAgcHJvZHVjZXMgVVJMcyBsaWtlXG4gKiA8Y29kZSBjbGFzcz1cIm5vLWF1dG8tbGlua1wiPmh0dHA6Ly9leGFtcGxlLmNvbSMvZm9vPC9jb2RlPixcbiAqIGFuZCBgUGF0aExvY2F0aW9uU3RyYXRlZ3lgIHByb2R1Y2VzXG4gKiA8Y29kZSBjbGFzcz1cIm5vLWF1dG8tbGlua1wiPmh0dHA6Ly9leGFtcGxlLmNvbS9mb288L2NvZGU+IGFzIGFuIGVxdWl2YWxlbnQgVVJMLlxuICpcbiAqIFNlZSB0aGVzZSB0d28gY2xhc3NlcyBmb3IgbW9yZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCcsIHVzZUZhY3Rvcnk6IHByb3ZpZGVMb2NhdGlvblN0cmF0ZWd5fSlcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBMb2NhdGlvblN0cmF0ZWd5IHtcbiAgYWJzdHJhY3QgcGF0aChpbmNsdWRlSGFzaD86IGJvb2xlYW4pOiBzdHJpbmc7XG4gIGFic3RyYWN0IHByZXBhcmVFeHRlcm5hbFVybChpbnRlcm5hbDogc3RyaW5nKTogc3RyaW5nO1xuICBhYnN0cmFjdCBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBzdHJpbmcpOiB2b2lkO1xuICBhYnN0cmFjdCByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBzdHJpbmcpOiB2b2lkO1xuICBhYnN0cmFjdCBmb3J3YXJkKCk6IHZvaWQ7XG4gIGFic3RyYWN0IGJhY2soKTogdm9pZDtcbiAgYWJzdHJhY3Qgb25Qb3BTdGF0ZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IHZvaWQ7XG4gIGFic3RyYWN0IGdldEJhc2VIcmVmKCk6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVMb2NhdGlvblN0cmF0ZWd5KHBsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb24pIHtcbiAgLy8gU2VlICMyMzkxN1xuICBjb25zdCBsb2NhdGlvbiA9IMm1ybVpbmplY3QoRE9DVU1FTlQpLmxvY2F0aW9uO1xuICByZXR1cm4gbmV3IFBhdGhMb2NhdGlvblN0cmF0ZWd5KFxuICAgICAgybXJtWluamVjdChQbGF0Zm9ybUxvY2F0aW9uIGFzIGFueSksIGxvY2F0aW9uICYmIGxvY2F0aW9uLm9yaWdpbiB8fCAnJyk7XG59XG5cblxuLyoqXG4gKiBBIHByZWRlZmluZWQgW0RJIHRva2VuXShndWlkZS9nbG9zc2FyeSNkaS10b2tlbikgZm9yIHRoZSBiYXNlIGhyZWZcbiAqIHRvIGJlIHVzZWQgd2l0aCB0aGUgYFBhdGhMb2NhdGlvblN0cmF0ZWd5YC5cbiAqIFRoZSBiYXNlIGhyZWYgaXMgdGhlIFVSTCBwcmVmaXggdGhhdCBzaG91bGQgYmUgcHJlc2VydmVkIHdoZW4gZ2VuZXJhdGluZ1xuICogYW5kIHJlY29nbml6aW5nIFVSTHMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IHRvIHVzZSB0aGlzIHRva2VuIHRvIGNvbmZpZ3VyZSB0aGUgcm9vdCBhcHAgaW5qZWN0b3JcbiAqIHdpdGggYSBiYXNlIGhyZWYgdmFsdWUsIHNvIHRoYXQgdGhlIERJIGZyYW1ld29yayBjYW4gc3VwcGx5IHRoZSBkZXBlbmRlbmN5IGFueXdoZXJlIGluIHRoZSBhcHAuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtDb21wb25lbnQsIE5nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAqIGltcG9ydCB7QVBQX0JBU0VfSFJFRn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbiAqXG4gKiBATmdNb2R1bGUoe1xuICogICBwcm92aWRlcnM6IFt7cHJvdmlkZTogQVBQX0JBU0VfSFJFRiwgdXNlVmFsdWU6ICcvbXkvYXBwJ31dXG4gKiB9KVxuICogY2xhc3MgQXBwTW9kdWxlIHt9XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBBUFBfQkFTRV9IUkVGID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oJ2FwcEJhc2VIcmVmJyk7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBBIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fSB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUge0BsaW5rIExvY2F0aW9ufSBzZXJ2aWNlIHRvXG4gKiByZXByZXNlbnQgaXRzIHN0YXRlIGluIHRoZVxuICogW3BhdGhdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1VuaWZvcm1fUmVzb3VyY2VfTG9jYXRvciNTeW50YXgpIG9mIHRoZVxuICogYnJvd3NlcidzIFVSTC5cbiAqXG4gKiBJZiB5b3UncmUgdXNpbmcgYFBhdGhMb2NhdGlvblN0cmF0ZWd5YCwgeW91IG11c3QgcHJvdmlkZSBhIHtAbGluayBBUFBfQkFTRV9IUkVGfVxuICogb3IgYWRkIGEgYmFzZSBlbGVtZW50IHRvIHRoZSBkb2N1bWVudC4gVGhpcyBVUkwgcHJlZml4IHRoYXQgd2lsbCBiZSBwcmVzZXJ2ZWRcbiAqIHdoZW4gZ2VuZXJhdGluZyBhbmQgcmVjb2duaXppbmcgVVJMcy5cbiAqXG4gKiBGb3IgaW5zdGFuY2UsIGlmIHlvdSBwcm92aWRlIGFuIGBBUFBfQkFTRV9IUkVGYCBvZiBgJy9teS9hcHAnYCBhbmQgY2FsbFxuICogYGxvY2F0aW9uLmdvKCcvZm9vJylgLCB0aGUgYnJvd3NlcidzIFVSTCB3aWxsIGJlY29tZVxuICogYGV4YW1wbGUuY29tL215L2FwcC9mb29gLlxuICpcbiAqIFNpbWlsYXJseSwgaWYgeW91IGFkZCBgPGJhc2UgaHJlZj0nL215L2FwcCcvPmAgdG8gdGhlIGRvY3VtZW50IGFuZCBjYWxsXG4gKiBgbG9jYXRpb24uZ28oJy9mb28nKWAsIHRoZSBicm93c2VyJ3MgVVJMIHdpbGwgYmVjb21lXG4gKiBgZXhhbXBsZS5jb20vbXkvYXBwL2Zvb2AuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbG9jYXRpb24vdHMvcGF0aF9sb2NhdGlvbl9jb21wb25lbnQudHMgcmVnaW9uPSdMb2NhdGlvbkNvbXBvbmVudCd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGF0aExvY2F0aW9uU3RyYXRlZ3kgZXh0ZW5kcyBMb2NhdGlvblN0cmF0ZWd5IHtcbiAgcHJpdmF0ZSBfYmFzZUhyZWY6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX3BsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb24sXG4gICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEFQUF9CQVNFX0hSRUYpIGhyZWY/OiBzdHJpbmcpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKGhyZWYgPT0gbnVsbCkge1xuICAgICAgaHJlZiA9IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uZ2V0QmFzZUhyZWZGcm9tRE9NKCk7XG4gICAgfVxuXG4gICAgaWYgKGhyZWYgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBObyBiYXNlIGhyZWYgc2V0LiBQbGVhc2UgcHJvdmlkZSBhIHZhbHVlIGZvciB0aGUgQVBQX0JBU0VfSFJFRiB0b2tlbiBvciBhZGQgYSBiYXNlIGVsZW1lbnQgdG8gdGhlIGRvY3VtZW50LmApO1xuICAgIH1cblxuICAgIHRoaXMuX2Jhc2VIcmVmID0gaHJlZjtcbiAgfVxuXG4gIG9uUG9wU3RhdGUoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLm9uUG9wU3RhdGUoZm4pO1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ub25IYXNoQ2hhbmdlKGZuKTtcbiAgfVxuXG4gIGdldEJhc2VIcmVmKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9iYXNlSHJlZjsgfVxuXG4gIHByZXBhcmVFeHRlcm5hbFVybChpbnRlcm5hbDogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIGpvaW5XaXRoU2xhc2godGhpcy5fYmFzZUhyZWYsIGludGVybmFsKTsgfVxuXG4gIHBhdGgoaW5jbHVkZUhhc2g6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgY29uc3QgcGF0aG5hbWUgPVxuICAgICAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnBhdGhuYW1lICsgbm9ybWFsaXplUXVlcnlQYXJhbXModGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5zZWFyY2gpO1xuICAgIGNvbnN0IGhhc2ggPSB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmhhc2g7XG4gICAgcmV0dXJuIGhhc2ggJiYgaW5jbHVkZUhhc2ggPyBgJHtwYXRobmFtZX0ke2hhc2h9YCA6IHBhdGhuYW1lO1xuICB9XG5cbiAgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKSB7XG4gICAgY29uc3QgZXh0ZXJuYWxVcmwgPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybCh1cmwgKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeVBhcmFtcykpO1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucHVzaFN0YXRlKHN0YXRlLCB0aXRsZSwgZXh0ZXJuYWxVcmwpO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKSB7XG4gICAgY29uc3QgZXh0ZXJuYWxVcmwgPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybCh1cmwgKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeVBhcmFtcykpO1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucmVwbGFjZVN0YXRlKHN0YXRlLCB0aXRsZSwgZXh0ZXJuYWxVcmwpO1xuICB9XG5cbiAgZm9yd2FyZCgpOiB2b2lkIHsgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5mb3J3YXJkKCk7IH1cblxuICBiYWNrKCk6IHZvaWQgeyB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmJhY2soKTsgfVxufVxuIl19