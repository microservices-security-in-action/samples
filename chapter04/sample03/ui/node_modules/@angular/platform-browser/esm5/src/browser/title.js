import { __decorate, __metadata, __param } from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, ɵɵinject } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Factory to create Title service.
 */
export function createTitle() {
    return new Title(ɵɵinject(DOCUMENT));
}
/**
 * A service that can be used to get and set the title of a current HTML document.
 *
 * Since an Angular application can't be bootstrapped on the entire HTML document (`<html>` tag)
 * it is not possible to bind to the `text` property of the `HTMLTitleElement` elements
 * (representing the `<title>` tag). Instead, this service can be used to set and get the current
 * title value.
 *
 * @publicApi
 */
var Title = /** @class */ (function () {
    function Title(_doc) {
        this._doc = _doc;
    }
    /**
     * Get the title of the current HTML document.
     */
    Title.prototype.getTitle = function () { return this._doc.title; };
    /**
     * Set the title of the current HTML document.
     * @param newTitle
     */
    Title.prototype.setTitle = function (newTitle) { this._doc.title = newTitle || ''; };
    Title.ɵprov = i0.ɵɵdefineInjectable({ factory: createTitle, token: Title, providedIn: "root" });
    Title = __decorate([
        Injectable({ providedIn: 'root', useFactory: createTitle, deps: [] }),
        __param(0, Inject(DOCUMENT)),
        __metadata("design:paramtypes", [Object])
    ], Title);
    return Title;
}());
export { Title };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL3NyYy9icm93c2VyL3RpdGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFvQixNQUFNLGlCQUFpQixDQUFDO0FBQzVELE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFHM0Q7O0dBRUc7QUFDSCxNQUFNLFVBQVUsV0FBVztJQUN6QixPQUFPLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFFRDs7Ozs7Ozs7O0dBU0c7QUFFSDtJQUNFLGVBQXNDLElBQVM7UUFBVCxTQUFJLEdBQUosSUFBSSxDQUFLO0lBQUcsQ0FBQztJQUNuRDs7T0FFRztJQUNILHdCQUFRLEdBQVIsY0FBcUIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFOUM7OztPQUdHO0lBQ0gsd0JBQVEsR0FBUixVQUFTLFFBQWdCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0lBWHJELEtBQUs7UUFEakIsVUFBVSxDQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUMsQ0FBQztRQUVyRCxXQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7T0FEbEIsS0FBSyxDQVlqQjtnQkExQ0Q7Q0EwQ0MsQUFaRCxJQVlDO1NBWlksS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtET0NVTUVOVCwgybVnZXRET00gYXMgZ2V0RE9NfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIMm1ybVpbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5cbi8qKlxuICogRmFjdG9yeSB0byBjcmVhdGUgVGl0bGUgc2VydmljZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRpdGxlKCkge1xuICByZXR1cm4gbmV3IFRpdGxlKMm1ybVpbmplY3QoRE9DVU1FTlQpKTtcbn1cblxuLyoqXG4gKiBBIHNlcnZpY2UgdGhhdCBjYW4gYmUgdXNlZCB0byBnZXQgYW5kIHNldCB0aGUgdGl0bGUgb2YgYSBjdXJyZW50IEhUTUwgZG9jdW1lbnQuXG4gKlxuICogU2luY2UgYW4gQW5ndWxhciBhcHBsaWNhdGlvbiBjYW4ndCBiZSBib290c3RyYXBwZWQgb24gdGhlIGVudGlyZSBIVE1MIGRvY3VtZW50IChgPGh0bWw+YCB0YWcpXG4gKiBpdCBpcyBub3QgcG9zc2libGUgdG8gYmluZCB0byB0aGUgYHRleHRgIHByb3BlcnR5IG9mIHRoZSBgSFRNTFRpdGxlRWxlbWVudGAgZWxlbWVudHNcbiAqIChyZXByZXNlbnRpbmcgdGhlIGA8dGl0bGU+YCB0YWcpLiBJbnN0ZWFkLCB0aGlzIHNlcnZpY2UgY2FuIGJlIHVzZWQgdG8gc2V0IGFuZCBnZXQgdGhlIGN1cnJlbnRcbiAqIHRpdGxlIHZhbHVlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290JywgdXNlRmFjdG9yeTogY3JlYXRlVGl0bGUsIGRlcHM6IFtdfSlcbmV4cG9ydCBjbGFzcyBUaXRsZSB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgX2RvYzogYW55KSB7fVxuICAvKipcbiAgICogR2V0IHRoZSB0aXRsZSBvZiB0aGUgY3VycmVudCBIVE1MIGRvY3VtZW50LlxuICAgKi9cbiAgZ2V0VGl0bGUoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX2RvYy50aXRsZTsgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHRpdGxlIG9mIHRoZSBjdXJyZW50IEhUTUwgZG9jdW1lbnQuXG4gICAqIEBwYXJhbSBuZXdUaXRsZVxuICAgKi9cbiAgc2V0VGl0bGUobmV3VGl0bGU6IHN0cmluZykgeyB0aGlzLl9kb2MudGl0bGUgPSBuZXdUaXRsZSB8fCAnJzsgfVxufVxuIl19