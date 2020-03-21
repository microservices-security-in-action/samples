/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/upgrade/src/location_upgrade_module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { APP_BASE_HREF, CommonModule, HashLocationStrategy, Location, LocationStrategy, PathLocationStrategy, PlatformLocation } from '@angular/common';
import { Inject, InjectionToken, NgModule, Optional } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { $locationShim, $locationShimProvider } from './location_shim';
import { AngularJSUrlCodec, UrlCodec } from './params';
/**
 * Configuration options for LocationUpgrade.
 *
 * \@publicApi
 * @record
 */
export function LocationUpgradeConfig() { }
if (false) {
    /**
     * Configures whether the location upgrade module should use the `HashLocationStrategy`
     * or the `PathLocationStrategy`
     * @type {?|undefined}
     */
    LocationUpgradeConfig.prototype.useHash;
    /**
     * Configures the hash prefix used in the URL when using the `HashLocationStrategy`
     * @type {?|undefined}
     */
    LocationUpgradeConfig.prototype.hashPrefix;
    /**
     * Configures the URL codec for encoding and decoding URLs. Default is the `AngularJSCodec`
     * @type {?|undefined}
     */
    LocationUpgradeConfig.prototype.urlCodec;
    /**
     * Configures the base href when used in server-side rendered applications
     * @type {?|undefined}
     */
    LocationUpgradeConfig.prototype.serverBaseHref;
    /**
     * Configures the base href when used in client-side rendered applications
     * @type {?|undefined}
     */
    LocationUpgradeConfig.prototype.appBaseHref;
}
/**
 * A provider token used to configure the location upgrade module.
 *
 * \@publicApi
 * @type {?}
 */
export const LOCATION_UPGRADE_CONFIGURATION = new InjectionToken('LOCATION_UPGRADE_CONFIGURATION');
/** @type {?} */
const APP_BASE_HREF_RESOLVED = new InjectionToken('APP_BASE_HREF_RESOLVED');
/**
 * `NgModule` used for providing and configuring Angular's Unified Location Service for upgrading.
 *
 * @see [Using the Unified Angular Location Service](guide/upgrade#using-the-unified-angular-location-service)
 *
 * \@publicApi
 */
export class LocationUpgradeModule {
    /**
     * @param {?=} config
     * @return {?}
     */
    static config(config) {
        return {
            ngModule: LocationUpgradeModule,
            providers: [
                Location,
                {
                    provide: $locationShim,
                    useFactory: provide$location,
                    deps: [UpgradeModule, Location, PlatformLocation, UrlCodec, LocationStrategy]
                },
                { provide: LOCATION_UPGRADE_CONFIGURATION, useValue: config ? config : {} },
                { provide: UrlCodec, useFactory: provideUrlCodec, deps: [LOCATION_UPGRADE_CONFIGURATION] },
                {
                    provide: APP_BASE_HREF_RESOLVED,
                    useFactory: provideAppBaseHref,
                    deps: [LOCATION_UPGRADE_CONFIGURATION, [new Inject(APP_BASE_HREF), new Optional()]]
                },
                {
                    provide: LocationStrategy,
                    useFactory: provideLocationStrategy,
                    deps: [
                        PlatformLocation,
                        APP_BASE_HREF_RESOLVED,
                        LOCATION_UPGRADE_CONFIGURATION,
                    ]
                },
            ],
        };
    }
}
LocationUpgradeModule.decorators = [
    { type: NgModule, args: [{ imports: [CommonModule] },] }
];
/**
 * @param {?} config
 * @param {?=} appBaseHref
 * @return {?}
 */
export function provideAppBaseHref(config, appBaseHref) {
    if (config && config.appBaseHref != null) {
        return config.appBaseHref;
    }
    else if (appBaseHref != null) {
        return appBaseHref;
    }
    return '';
}
/**
 * @param {?} config
 * @return {?}
 */
export function provideUrlCodec(config) {
    /** @type {?} */
    const codec = config && config.urlCodec || AngularJSUrlCodec;
    return new ((/** @type {?} */ (codec)))();
}
/**
 * @param {?} platformLocation
 * @param {?} baseHref
 * @param {?=} options
 * @return {?}
 */
export function provideLocationStrategy(platformLocation, baseHref, options = {}) {
    return options.useHash ? new HashLocationStrategy(platformLocation, baseHref) :
        new PathLocationStrategy(platformLocation, baseHref);
}
/**
 * @param {?} ngUpgrade
 * @param {?} location
 * @param {?} platformLocation
 * @param {?} urlCodec
 * @param {?} locationStrategy
 * @return {?}
 */
export function provide$location(ngUpgrade, location, platformLocation, urlCodec, locationStrategy) {
    /** @type {?} */
    const $locationProvider = new $locationShimProvider(ngUpgrade, location, platformLocation, urlCodec, locationStrategy);
    return $locationProvider.$get();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fdXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vdXBncmFkZS9zcmMvbG9jYXRpb25fdXBncmFkZV9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDdEosT0FBTyxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQXVCLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDOUYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRXRELE9BQU8sRUFBQyxhQUFhLEVBQUUscUJBQXFCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNyRSxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsUUFBUSxFQUFDLE1BQU0sVUFBVSxDQUFDOzs7Ozs7O0FBUXJELDJDQXNCQzs7Ozs7OztJQWpCQyx3Q0FBa0I7Ozs7O0lBSWxCLDJDQUFvQjs7Ozs7SUFJcEIseUNBQTJCOzs7OztJQUkzQiwrQ0FBd0I7Ozs7O0lBSXhCLDRDQUFxQjs7Ozs7Ozs7QUFRdkIsTUFBTSxPQUFPLDhCQUE4QixHQUN2QyxJQUFJLGNBQWMsQ0FBd0IsZ0NBQWdDLENBQUM7O01BRXpFLHNCQUFzQixHQUFHLElBQUksY0FBYyxDQUFTLHdCQUF3QixDQUFDOzs7Ozs7OztBQVVuRixNQUFNLE9BQU8scUJBQXFCOzs7OztJQUNoQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQThCO1FBQzFDLE9BQU87WUFDTCxRQUFRLEVBQUUscUJBQXFCO1lBQy9CLFNBQVMsRUFBRTtnQkFDVCxRQUFRO2dCQUNSO29CQUNFLE9BQU8sRUFBRSxhQUFhO29CQUN0QixVQUFVLEVBQUUsZ0JBQWdCO29CQUM1QixJQUFJLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQztpQkFDOUU7Z0JBQ0QsRUFBQyxPQUFPLEVBQUUsOEJBQThCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUM7Z0JBQ3pFLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDLDhCQUE4QixDQUFDLEVBQUM7Z0JBQ3hGO29CQUNFLE9BQU8sRUFBRSxzQkFBc0I7b0JBQy9CLFVBQVUsRUFBRSxrQkFBa0I7b0JBQzlCLElBQUksRUFBRSxDQUFDLDhCQUE4QixFQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDO2lCQUNwRjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsZ0JBQWdCO29CQUN6QixVQUFVLEVBQUUsdUJBQXVCO29CQUNuQyxJQUFJLEVBQUU7d0JBQ0osZ0JBQWdCO3dCQUNoQixzQkFBc0I7d0JBQ3RCLDhCQUE4QjtxQkFDL0I7aUJBQ0Y7YUFDRjtTQUNGLENBQUM7SUFDSixDQUFDOzs7WUE5QkYsUUFBUSxTQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUM7Ozs7Ozs7QUFpQ25DLE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxNQUE2QixFQUFFLFdBQW9CO0lBQ3BGLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksSUFBSSxFQUFFO1FBQ3hDLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBQztLQUMzQjtTQUFNLElBQUksV0FBVyxJQUFJLElBQUksRUFBRTtRQUM5QixPQUFPLFdBQVcsQ0FBQztLQUNwQjtJQUNELE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsZUFBZSxDQUFDLE1BQTZCOztVQUNyRCxLQUFLLEdBQUcsTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksaUJBQWlCO0lBQzVELE9BQU8sSUFBSSxDQUFDLG1CQUFBLEtBQUssRUFBTyxDQUFDLEVBQUUsQ0FBQztBQUM5QixDQUFDOzs7Ozs7O0FBRUQsTUFBTSxVQUFVLHVCQUF1QixDQUNuQyxnQkFBa0MsRUFBRSxRQUFnQixFQUFFLFVBQWlDLEVBQUU7SUFDM0YsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdEQsSUFBSSxvQkFBb0IsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNoRixDQUFDOzs7Ozs7Ozs7QUFFRCxNQUFNLFVBQVUsZ0JBQWdCLENBQzVCLFNBQXdCLEVBQUUsUUFBa0IsRUFBRSxnQkFBa0MsRUFDaEYsUUFBa0IsRUFBRSxnQkFBa0M7O1VBQ2xELGlCQUFpQixHQUNuQixJQUFJLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixDQUFDO0lBRWhHLE9BQU8saUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBUFBfQkFTRV9IUkVGLCBDb21tb25Nb2R1bGUsIEhhc2hMb2NhdGlvblN0cmF0ZWd5LCBMb2NhdGlvbiwgTG9jYXRpb25TdHJhdGVneSwgUGF0aExvY2F0aW9uU3RyYXRlZ3ksIFBsYXRmb3JtTG9jYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0aW9uVG9rZW4sIE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlLCBPcHRpb25hbH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1VwZ3JhZGVNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL3VwZ3JhZGUvc3RhdGljJztcblxuaW1wb3J0IHskbG9jYXRpb25TaGltLCAkbG9jYXRpb25TaGltUHJvdmlkZXJ9IGZyb20gJy4vbG9jYXRpb25fc2hpbSc7XG5pbXBvcnQge0FuZ3VsYXJKU1VybENvZGVjLCBVcmxDb2RlY30gZnJvbSAnLi9wYXJhbXMnO1xuXG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiBvcHRpb25zIGZvciBMb2NhdGlvblVwZ3JhZGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvY2F0aW9uVXBncmFkZUNvbmZpZyB7XG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHdoZXRoZXIgdGhlIGxvY2F0aW9uIHVwZ3JhZGUgbW9kdWxlIHNob3VsZCB1c2UgdGhlIGBIYXNoTG9jYXRpb25TdHJhdGVneWBcbiAgICogb3IgdGhlIGBQYXRoTG9jYXRpb25TdHJhdGVneWBcbiAgICovXG4gIHVzZUhhc2g/OiBib29sZWFuO1xuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgaGFzaCBwcmVmaXggdXNlZCBpbiB0aGUgVVJMIHdoZW4gdXNpbmcgdGhlIGBIYXNoTG9jYXRpb25TdHJhdGVneWBcbiAgICovXG4gIGhhc2hQcmVmaXg/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBVUkwgY29kZWMgZm9yIGVuY29kaW5nIGFuZCBkZWNvZGluZyBVUkxzLiBEZWZhdWx0IGlzIHRoZSBgQW5ndWxhckpTQ29kZWNgXG4gICAqL1xuICB1cmxDb2RlYz86IHR5cGVvZiBVcmxDb2RlYztcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIGJhc2UgaHJlZiB3aGVuIHVzZWQgaW4gc2VydmVyLXNpZGUgcmVuZGVyZWQgYXBwbGljYXRpb25zXG4gICAqL1xuICBzZXJ2ZXJCYXNlSHJlZj86IHN0cmluZztcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIGJhc2UgaHJlZiB3aGVuIHVzZWQgaW4gY2xpZW50LXNpZGUgcmVuZGVyZWQgYXBwbGljYXRpb25zXG4gICAqL1xuICBhcHBCYXNlSHJlZj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBBIHByb3ZpZGVyIHRva2VuIHVzZWQgdG8gY29uZmlndXJlIHRoZSBsb2NhdGlvbiB1cGdyYWRlIG1vZHVsZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT04gPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxMb2NhdGlvblVwZ3JhZGVDb25maWc+KCdMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT04nKTtcblxuY29uc3QgQVBQX0JBU0VfSFJFRl9SRVNPTFZFRCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KCdBUFBfQkFTRV9IUkVGX1JFU09MVkVEJyk7XG5cbi8qKlxuICogYE5nTW9kdWxlYCB1c2VkIGZvciBwcm92aWRpbmcgYW5kIGNvbmZpZ3VyaW5nIEFuZ3VsYXIncyBVbmlmaWVkIExvY2F0aW9uIFNlcnZpY2UgZm9yIHVwZ3JhZGluZy5cbiAqIFxuICogQHNlZSBbVXNpbmcgdGhlIFVuaWZpZWQgQW5ndWxhciBMb2NhdGlvbiBTZXJ2aWNlXShndWlkZS91cGdyYWRlI3VzaW5nLXRoZS11bmlmaWVkLWFuZ3VsYXItbG9jYXRpb24tc2VydmljZSlcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7aW1wb3J0czogW0NvbW1vbk1vZHVsZV19KVxuZXhwb3J0IGNsYXNzIExvY2F0aW9uVXBncmFkZU1vZHVsZSB7XG4gIHN0YXRpYyBjb25maWcoY29uZmlnPzogTG9jYXRpb25VcGdyYWRlQ29uZmlnKTogTW9kdWxlV2l0aFByb3ZpZGVyczxMb2NhdGlvblVwZ3JhZGVNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IExvY2F0aW9uVXBncmFkZU1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICBMb2NhdGlvbixcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6ICRsb2NhdGlvblNoaW0sXG4gICAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZSRsb2NhdGlvbixcbiAgICAgICAgICBkZXBzOiBbVXBncmFkZU1vZHVsZSwgTG9jYXRpb24sIFBsYXRmb3JtTG9jYXRpb24sIFVybENvZGVjLCBMb2NhdGlvblN0cmF0ZWd5XVxuICAgICAgICB9LFxuICAgICAgICB7cHJvdmlkZTogTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OLCB1c2VWYWx1ZTogY29uZmlnID8gY29uZmlnIDoge319LFxuICAgICAgICB7cHJvdmlkZTogVXJsQ29kZWMsIHVzZUZhY3Rvcnk6IHByb3ZpZGVVcmxDb2RlYywgZGVwczogW0xPQ0FUSU9OX1VQR1JBREVfQ09ORklHVVJBVElPTl19LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogQVBQX0JBU0VfSFJFRl9SRVNPTFZFRCxcbiAgICAgICAgICB1c2VGYWN0b3J5OiBwcm92aWRlQXBwQmFzZUhyZWYsXG4gICAgICAgICAgZGVwczogW0xPQ0FUSU9OX1VQR1JBREVfQ09ORklHVVJBVElPTiwgW25ldyBJbmplY3QoQVBQX0JBU0VfSFJFRiksIG5ldyBPcHRpb25hbCgpXV1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IExvY2F0aW9uU3RyYXRlZ3ksXG4gICAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZUxvY2F0aW9uU3RyYXRlZ3ksXG4gICAgICAgICAgZGVwczogW1xuICAgICAgICAgICAgUGxhdGZvcm1Mb2NhdGlvbixcbiAgICAgICAgICAgIEFQUF9CQVNFX0hSRUZfUkVTT0xWRUQsXG4gICAgICAgICAgICBMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT04sXG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlQXBwQmFzZUhyZWYoY29uZmlnOiBMb2NhdGlvblVwZ3JhZGVDb25maWcsIGFwcEJhc2VIcmVmPzogc3RyaW5nKSB7XG4gIGlmIChjb25maWcgJiYgY29uZmlnLmFwcEJhc2VIcmVmICE9IG51bGwpIHtcbiAgICByZXR1cm4gY29uZmlnLmFwcEJhc2VIcmVmO1xuICB9IGVsc2UgaWYgKGFwcEJhc2VIcmVmICE9IG51bGwpIHtcbiAgICByZXR1cm4gYXBwQmFzZUhyZWY7XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZVVybENvZGVjKGNvbmZpZzogTG9jYXRpb25VcGdyYWRlQ29uZmlnKSB7XG4gIGNvbnN0IGNvZGVjID0gY29uZmlnICYmIGNvbmZpZy51cmxDb2RlYyB8fCBBbmd1bGFySlNVcmxDb2RlYztcbiAgcmV0dXJuIG5ldyAoY29kZWMgYXMgYW55KSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUxvY2F0aW9uU3RyYXRlZ3koXG4gICAgcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbiwgYmFzZUhyZWY6IHN0cmluZywgb3B0aW9uczogTG9jYXRpb25VcGdyYWRlQ29uZmlnID0ge30pIHtcbiAgcmV0dXJuIG9wdGlvbnMudXNlSGFzaCA/IG5ldyBIYXNoTG9jYXRpb25TdHJhdGVneShwbGF0Zm9ybUxvY2F0aW9uLCBiYXNlSHJlZikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBhdGhMb2NhdGlvblN0cmF0ZWd5KHBsYXRmb3JtTG9jYXRpb24sIGJhc2VIcmVmKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGUkbG9jYXRpb24oXG4gICAgbmdVcGdyYWRlOiBVcGdyYWRlTW9kdWxlLCBsb2NhdGlvbjogTG9jYXRpb24sIHBsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb24sXG4gICAgdXJsQ29kZWM6IFVybENvZGVjLCBsb2NhdGlvblN0cmF0ZWd5OiBMb2NhdGlvblN0cmF0ZWd5KSB7XG4gIGNvbnN0ICRsb2NhdGlvblByb3ZpZGVyID1cbiAgICAgIG5ldyAkbG9jYXRpb25TaGltUHJvdmlkZXIobmdVcGdyYWRlLCBsb2NhdGlvbiwgcGxhdGZvcm1Mb2NhdGlvbiwgdXJsQ29kZWMsIGxvY2F0aW9uU3RyYXRlZ3kpO1xuXG4gIHJldHVybiAkbG9jYXRpb25Qcm92aWRlci4kZ2V0KCk7XG59Il19