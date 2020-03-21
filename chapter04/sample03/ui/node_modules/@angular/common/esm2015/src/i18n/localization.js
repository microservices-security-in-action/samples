/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/i18n/localization.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Plural, getLocalePluralCase } from './locale_data_api';
/**
 * \@publicApi
 * @abstract
 */
export class NgLocalization {
}
if (false) {
    /**
     * @abstract
     * @param {?} value
     * @param {?=} locale
     * @return {?}
     */
    NgLocalization.prototype.getPluralCategory = function (value, locale) { };
}
/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 * @param {?} value
 * @param {?} cases
 * @param {?} ngLocalization
 * @param {?=} locale
 * @return {?}
 */
export function getPluralCategory(value, cases, ngLocalization, locale) {
    /** @type {?} */
    let key = `=${value}`;
    if (cases.indexOf(key) > -1) {
        return key;
    }
    key = ngLocalization.getPluralCategory(value, locale);
    if (cases.indexOf(key) > -1) {
        return key;
    }
    if (cases.indexOf('other') > -1) {
        return 'other';
    }
    throw new Error(`No plural message found for value "${value}"`);
}
/**
 * Returns the plural case based on the locale
 *
 * \@publicApi
 */
export class NgLocaleLocalization extends NgLocalization {
    /**
     * @param {?} locale
     */
    constructor(locale) {
        super();
        this.locale = locale;
    }
    /**
     * @param {?} value
     * @param {?=} locale
     * @return {?}
     */
    getPluralCategory(value, locale) {
        /** @type {?} */
        const plural = getLocalePluralCase(locale || this.locale)(value);
        switch (plural) {
            case Plural.Zero:
                return 'zero';
            case Plural.One:
                return 'one';
            case Plural.Two:
                return 'two';
            case Plural.Few:
                return 'few';
            case Plural.Many:
                return 'many';
            default:
                return 'other';
        }
    }
}
NgLocaleLocalization.decorators = [
    { type: Injectable }
];
/** @nocollapse */
NgLocaleLocalization.ctorParameters = () => [
    { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] }
];
if (false) {
    /**
     * @type {?}
     * @protected
     */
    NgLocaleLocalization.prototype.locale;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUQsT0FBTyxFQUFDLE1BQU0sRUFBRSxtQkFBbUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDOzs7OztBQU05RCxNQUFNLE9BQWdCLGNBQWM7Q0FFbkM7Ozs7Ozs7O0lBREMsMEVBQWdFOzs7Ozs7Ozs7Ozs7QUFTbEUsTUFBTSxVQUFVLGlCQUFpQixDQUM3QixLQUFhLEVBQUUsS0FBZSxFQUFFLGNBQThCLEVBQUUsTUFBZTs7UUFDN0UsR0FBRyxHQUFHLElBQUksS0FBSyxFQUFFO0lBRXJCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUMzQixPQUFPLEdBQUcsQ0FBQztLQUNaO0lBRUQsR0FBRyxHQUFHLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFdEQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1FBQzNCLE9BQU8sR0FBRyxDQUFDO0tBQ1o7SUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDL0IsT0FBTyxPQUFPLENBQUM7S0FDaEI7SUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2xFLENBQUM7Ozs7OztBQVFELE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxjQUFjOzs7O0lBQ3RELFlBQXlDLE1BQWM7UUFBSSxLQUFLLEVBQUUsQ0FBQztRQUExQixXQUFNLEdBQU4sTUFBTSxDQUFRO0lBQWEsQ0FBQzs7Ozs7O0lBRXJFLGlCQUFpQixDQUFDLEtBQVUsRUFBRSxNQUFlOztjQUNyQyxNQUFNLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFaEUsUUFBUSxNQUFNLEVBQUU7WUFDZCxLQUFLLE1BQU0sQ0FBQyxJQUFJO2dCQUNkLE9BQU8sTUFBTSxDQUFDO1lBQ2hCLEtBQUssTUFBTSxDQUFDLEdBQUc7Z0JBQ2IsT0FBTyxLQUFLLENBQUM7WUFDZixLQUFLLE1BQU0sQ0FBQyxHQUFHO2dCQUNiLE9BQU8sS0FBSyxDQUFDO1lBQ2YsS0FBSyxNQUFNLENBQUMsR0FBRztnQkFDYixPQUFPLEtBQUssQ0FBQztZQUNmLEtBQUssTUFBTSxDQUFDLElBQUk7Z0JBQ2QsT0FBTyxNQUFNLENBQUM7WUFDaEI7Z0JBQ0UsT0FBTyxPQUFPLENBQUM7U0FDbEI7SUFDSCxDQUFDOzs7WUFyQkYsVUFBVTs7Ozt5Q0FFSSxNQUFNLFNBQUMsU0FBUzs7Ozs7OztJQUFqQixzQ0FBMkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBMT0NBTEVfSUR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtQbHVyYWwsIGdldExvY2FsZVBsdXJhbENhc2V9IGZyb20gJy4vbG9jYWxlX2RhdGFfYXBpJztcblxuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5nTG9jYWxpemF0aW9uIHtcbiAgYWJzdHJhY3QgZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWU6IGFueSwgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgcGx1cmFsIGNhdGVnb3J5IGZvciBhIGdpdmVuIHZhbHVlLlxuICogLSBcIj12YWx1ZVwiIHdoZW4gdGhlIGNhc2UgZXhpc3RzLFxuICogLSB0aGUgcGx1cmFsIGNhdGVnb3J5IG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGx1cmFsQ2F0ZWdvcnkoXG4gICAgdmFsdWU6IG51bWJlciwgY2FzZXM6IHN0cmluZ1tdLCBuZ0xvY2FsaXphdGlvbjogTmdMb2NhbGl6YXRpb24sIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBrZXkgPSBgPSR7dmFsdWV9YDtcblxuICBpZiAoY2FzZXMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICByZXR1cm4ga2V5O1xuICB9XG5cbiAga2V5ID0gbmdMb2NhbGl6YXRpb24uZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWUsIGxvY2FsZSk7XG5cbiAgaWYgKGNhc2VzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgcmV0dXJuIGtleTtcbiAgfVxuXG4gIGlmIChjYXNlcy5pbmRleE9mKCdvdGhlcicpID4gLTEpIHtcbiAgICByZXR1cm4gJ290aGVyJztcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihgTm8gcGx1cmFsIG1lc3NhZ2UgZm91bmQgZm9yIHZhbHVlIFwiJHt2YWx1ZX1cImApO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHBsdXJhbCBjYXNlIGJhc2VkIG9uIHRoZSBsb2NhbGVcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOZ0xvY2FsZUxvY2FsaXphdGlvbiBleHRlbmRzIE5nTG9jYWxpemF0aW9uIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfSUQpIHByb3RlY3RlZCBsb2NhbGU6IHN0cmluZykgeyBzdXBlcigpOyB9XG5cbiAgZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWU6IGFueSwgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBwbHVyYWwgPSBnZXRMb2NhbGVQbHVyYWxDYXNlKGxvY2FsZSB8fCB0aGlzLmxvY2FsZSkodmFsdWUpO1xuXG4gICAgc3dpdGNoIChwbHVyYWwpIHtcbiAgICAgIGNhc2UgUGx1cmFsLlplcm86XG4gICAgICAgIHJldHVybiAnemVybyc7XG4gICAgICBjYXNlIFBsdXJhbC5PbmU6XG4gICAgICAgIHJldHVybiAnb25lJztcbiAgICAgIGNhc2UgUGx1cmFsLlR3bzpcbiAgICAgICAgcmV0dXJuICd0d28nO1xuICAgICAgY2FzZSBQbHVyYWwuRmV3OlxuICAgICAgICByZXR1cm4gJ2Zldyc7XG4gICAgICBjYXNlIFBsdXJhbC5NYW55OlxuICAgICAgICByZXR1cm4gJ21hbnknO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdvdGhlcic7XG4gICAgfVxuICB9XG59XG4iXX0=