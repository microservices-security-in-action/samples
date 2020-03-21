/**
 * @fileoverview added by tsickle
 * Generated from: packages/forms/src/directives/ng_control_status.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Self } from '@angular/core';
import { ControlContainer } from './control_container';
import { NgControl } from './ng_control';
export class AbstractControlStatus {
    /**
     * @param {?} cd
     */
    constructor(cd) { this._cd = cd; }
    /**
     * @return {?}
     */
    get ngClassUntouched() { return this._cd.control ? this._cd.control.untouched : false; }
    /**
     * @return {?}
     */
    get ngClassTouched() { return this._cd.control ? this._cd.control.touched : false; }
    /**
     * @return {?}
     */
    get ngClassPristine() { return this._cd.control ? this._cd.control.pristine : false; }
    /**
     * @return {?}
     */
    get ngClassDirty() { return this._cd.control ? this._cd.control.dirty : false; }
    /**
     * @return {?}
     */
    get ngClassValid() { return this._cd.control ? this._cd.control.valid : false; }
    /**
     * @return {?}
     */
    get ngClassInvalid() { return this._cd.control ? this._cd.control.invalid : false; }
    /**
     * @return {?}
     */
    get ngClassPending() { return this._cd.control ? this._cd.control.pending : false; }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    AbstractControlStatus.prototype._cd;
}
/** @type {?} */
export const ngControlStatusHost = {
    '[class.ng-untouched]': 'ngClassUntouched',
    '[class.ng-touched]': 'ngClassTouched',
    '[class.ng-pristine]': 'ngClassPristine',
    '[class.ng-dirty]': 'ngClassDirty',
    '[class.ng-valid]': 'ngClassValid',
    '[class.ng-invalid]': 'ngClassInvalid',
    '[class.ng-pending]': 'ngClassPending',
};
/**
 * \@description
 * Directive automatically applied to Angular form controls that sets CSS classes
 * based on control status.
 *
 * \@usageNotes
 *
 * ### CSS classes applied
 *
 * The following classes are applied as the properties become true:
 *
 * * ng-valid
 * * ng-invalid
 * * ng-pending
 * * ng-pristine
 * * ng-dirty
 * * ng-untouched
 * * ng-touched
 *
 * \@ngModule ReactiveFormsModule
 * \@ngModule FormsModule
 * \@publicApi
 */
export class NgControlStatus extends AbstractControlStatus {
    /**
     * @param {?} cd
     */
    constructor(cd) {
        super(cd);
    }
}
NgControlStatus.decorators = [
    { type: Directive, args: [{ selector: '[formControlName],[ngModel],[formControl]', host: ngControlStatusHost },] }
];
/** @nocollapse */
NgControlStatus.ctorParameters = () => [
    { type: NgControl, decorators: [{ type: Self }] }
];
/**
 * \@description
 * Directive automatically applied to Angular form groups that sets CSS classes
 * based on control status (valid/invalid/dirty/etc).
 *
 * @see `NgControlStatus`
 *
 * \@ngModule ReactiveFormsModule
 * \@ngModule FormsModule
 * \@publicApi
 */
export class NgControlStatusGroup extends AbstractControlStatus {
    /**
     * @param {?} cd
     */
    constructor(cd) {
        super(cd);
    }
}
NgControlStatusGroup.decorators = [
    { type: Directive, args: [{
                selector: '[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]',
                host: ngControlStatusHost
            },] }
];
/** @nocollapse */
NgControlStatusGroup.ctorParameters = () => [
    { type: ControlContainer, decorators: [{ type: Self }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9zdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9mb3Jtcy9zcmMvZGlyZWN0aXZlcy9uZ19jb250cm9sX3N0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsU0FBUyxFQUFFLElBQUksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUc5QyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRXZDLE1BQU0sT0FBTyxxQkFBcUI7Ozs7SUFHaEMsWUFBWSxFQUE0QixJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQzs7OztJQUU1RCxJQUFJLGdCQUFnQixLQUFjLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs7OztJQUNqRyxJQUFJLGNBQWMsS0FBYyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Ozs7SUFDN0YsSUFBSSxlQUFlLEtBQWMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOzs7O0lBQy9GLElBQUksWUFBWSxLQUFjLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs7OztJQUN6RixJQUFJLFlBQVksS0FBYyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Ozs7SUFDekYsSUFBSSxjQUFjLEtBQWMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOzs7O0lBQzdGLElBQUksY0FBYyxLQUFjLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztDQUM5Rjs7Ozs7O0lBWEMsb0NBQXNDOzs7QUFheEMsTUFBTSxPQUFPLG1CQUFtQixHQUFHO0lBQ2pDLHNCQUFzQixFQUFFLGtCQUFrQjtJQUMxQyxvQkFBb0IsRUFBRSxnQkFBZ0I7SUFDdEMscUJBQXFCLEVBQUUsaUJBQWlCO0lBQ3hDLGtCQUFrQixFQUFFLGNBQWM7SUFDbEMsa0JBQWtCLEVBQUUsY0FBYztJQUNsQyxvQkFBb0IsRUFBRSxnQkFBZ0I7SUFDdEMsb0JBQW9CLEVBQUUsZ0JBQWdCO0NBQ3ZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEwQkQsTUFBTSxPQUFPLGVBQWdCLFNBQVEscUJBQXFCOzs7O0lBQ3hELFlBQW9CLEVBQWE7UUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7SUFBQyxDQUFDOzs7WUFGbEQsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLDJDQUEyQyxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBQzs7OztZQWpEckYsU0FBUyx1QkFtREYsSUFBSTs7Ozs7Ozs7Ozs7OztBQW1CbkIsTUFBTSxPQUFPLG9CQUFxQixTQUFRLHFCQUFxQjs7OztJQUM3RCxZQUFvQixFQUFvQjtRQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUFDLENBQUM7OztZQU56RCxTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUNKLDBGQUEwRjtnQkFDOUYsSUFBSSxFQUFFLG1CQUFtQjthQUMxQjs7OztZQXRFTyxnQkFBZ0IsdUJBd0VULElBQUkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBTZWxmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmV9IGZyb20gJy4vYWJzdHJhY3RfY29udHJvbF9kaXJlY3RpdmUnO1xuaW1wb3J0IHtDb250cm9sQ29udGFpbmVyfSBmcm9tICcuL2NvbnRyb2xfY29udGFpbmVyJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuXG5leHBvcnQgY2xhc3MgQWJzdHJhY3RDb250cm9sU3RhdHVzIHtcbiAgcHJpdmF0ZSBfY2Q6IEFic3RyYWN0Q29udHJvbERpcmVjdGl2ZTtcblxuICBjb25zdHJ1Y3RvcihjZDogQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlKSB7IHRoaXMuX2NkID0gY2Q7IH1cblxuICBnZXQgbmdDbGFzc1VudG91Y2hlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2NkLmNvbnRyb2wgPyB0aGlzLl9jZC5jb250cm9sLnVudG91Y2hlZCA6IGZhbHNlOyB9XG4gIGdldCBuZ0NsYXNzVG91Y2hlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2NkLmNvbnRyb2wgPyB0aGlzLl9jZC5jb250cm9sLnRvdWNoZWQgOiBmYWxzZTsgfVxuICBnZXQgbmdDbGFzc1ByaXN0aW5lKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fY2QuY29udHJvbCA/IHRoaXMuX2NkLmNvbnRyb2wucHJpc3RpbmUgOiBmYWxzZTsgfVxuICBnZXQgbmdDbGFzc0RpcnR5KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fY2QuY29udHJvbCA/IHRoaXMuX2NkLmNvbnRyb2wuZGlydHkgOiBmYWxzZTsgfVxuICBnZXQgbmdDbGFzc1ZhbGlkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fY2QuY29udHJvbCA/IHRoaXMuX2NkLmNvbnRyb2wudmFsaWQgOiBmYWxzZTsgfVxuICBnZXQgbmdDbGFzc0ludmFsaWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9jZC5jb250cm9sID8gdGhpcy5fY2QuY29udHJvbC5pbnZhbGlkIDogZmFsc2U7IH1cbiAgZ2V0IG5nQ2xhc3NQZW5kaW5nKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fY2QuY29udHJvbCA/IHRoaXMuX2NkLmNvbnRyb2wucGVuZGluZyA6IGZhbHNlOyB9XG59XG5cbmV4cG9ydCBjb25zdCBuZ0NvbnRyb2xTdGF0dXNIb3N0ID0ge1xuICAnW2NsYXNzLm5nLXVudG91Y2hlZF0nOiAnbmdDbGFzc1VudG91Y2hlZCcsXG4gICdbY2xhc3MubmctdG91Y2hlZF0nOiAnbmdDbGFzc1RvdWNoZWQnLFxuICAnW2NsYXNzLm5nLXByaXN0aW5lXSc6ICduZ0NsYXNzUHJpc3RpbmUnLFxuICAnW2NsYXNzLm5nLWRpcnR5XSc6ICduZ0NsYXNzRGlydHknLFxuICAnW2NsYXNzLm5nLXZhbGlkXSc6ICduZ0NsYXNzVmFsaWQnLFxuICAnW2NsYXNzLm5nLWludmFsaWRdJzogJ25nQ2xhc3NJbnZhbGlkJyxcbiAgJ1tjbGFzcy5uZy1wZW5kaW5nXSc6ICduZ0NsYXNzUGVuZGluZycsXG59O1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogRGlyZWN0aXZlIGF1dG9tYXRpY2FsbHkgYXBwbGllZCB0byBBbmd1bGFyIGZvcm0gY29udHJvbHMgdGhhdCBzZXRzIENTUyBjbGFzc2VzXG4gKiBiYXNlZCBvbiBjb250cm9sIHN0YXR1cy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBDU1MgY2xhc3NlcyBhcHBsaWVkXG4gKlxuICogVGhlIGZvbGxvd2luZyBjbGFzc2VzIGFyZSBhcHBsaWVkIGFzIHRoZSBwcm9wZXJ0aWVzIGJlY29tZSB0cnVlOlxuICpcbiAqICogbmctdmFsaWRcbiAqICogbmctaW52YWxpZFxuICogKiBuZy1wZW5kaW5nXG4gKiAqIG5nLXByaXN0aW5lXG4gKiAqIG5nLWRpcnR5XG4gKiAqIG5nLXVudG91Y2hlZFxuICogKiBuZy10b3VjaGVkXG4gKlxuICogQG5nTW9kdWxlIFJlYWN0aXZlRm9ybXNNb2R1bGVcbiAqIEBuZ01vZHVsZSBGb3Jtc01vZHVsZVxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tmb3JtQ29udHJvbE5hbWVdLFtuZ01vZGVsXSxbZm9ybUNvbnRyb2xdJywgaG9zdDogbmdDb250cm9sU3RhdHVzSG9zdH0pXG5leHBvcnQgY2xhc3MgTmdDb250cm9sU3RhdHVzIGV4dGVuZHMgQWJzdHJhY3RDb250cm9sU3RhdHVzIHtcbiAgY29uc3RydWN0b3IoQFNlbGYoKSBjZDogTmdDb250cm9sKSB7IHN1cGVyKGNkKTsgfVxufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogRGlyZWN0aXZlIGF1dG9tYXRpY2FsbHkgYXBwbGllZCB0byBBbmd1bGFyIGZvcm0gZ3JvdXBzIHRoYXQgc2V0cyBDU1MgY2xhc3Nlc1xuICogYmFzZWQgb24gY29udHJvbCBzdGF0dXMgKHZhbGlkL2ludmFsaWQvZGlydHkvZXRjKS5cbiAqIFxuICogQHNlZSBgTmdDb250cm9sU3RhdHVzYFxuICpcbiAqIEBuZ01vZHVsZSBSZWFjdGl2ZUZvcm1zTW9kdWxlXG4gKiBAbmdNb2R1bGUgRm9ybXNNb2R1bGVcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOlxuICAgICAgJ1tmb3JtR3JvdXBOYW1lXSxbZm9ybUFycmF5TmFtZV0sW25nTW9kZWxHcm91cF0sW2Zvcm1Hcm91cF0sZm9ybTpub3QoW25nTm9Gb3JtXSksW25nRm9ybV0nLFxuICBob3N0OiBuZ0NvbnRyb2xTdGF0dXNIb3N0XG59KVxuZXhwb3J0IGNsYXNzIE5nQ29udHJvbFN0YXR1c0dyb3VwIGV4dGVuZHMgQWJzdHJhY3RDb250cm9sU3RhdHVzIHtcbiAgY29uc3RydWN0b3IoQFNlbGYoKSBjZDogQ29udHJvbENvbnRhaW5lcikgeyBzdXBlcihjZCk7IH1cbn1cbiJdfQ==