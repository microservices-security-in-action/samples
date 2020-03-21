/**
 * @fileoverview added by tsickle
 * Generated from: packages/forms/src/directives/ng_control.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AbstractControlDirective } from './abstract_control_directive';
/**
 * @return {?}
 */
function unimplemented() {
    throw new Error('unimplemented');
}
/**
 * \@description
 * A base class that all control `FormControl`-based directives extend. It binds a `FormControl`
 * object to a DOM element.
 *
 * \@publicApi
 * @abstract
 */
export class NgControl extends AbstractControlDirective {
    constructor() {
        super(...arguments);
        /**
         * \@description
         * The parent form for the control.
         *
         * \@internal
         */
        this._parent = null;
        /**
         * \@description
         * The name for the control
         */
        this.name = null;
        /**
         * \@description
         * The value accessor for the control
         */
        this.valueAccessor = null;
        /**
         * \@description
         * The uncomposed array of synchronous validators for the control
         *
         * \@internal
         */
        this._rawValidators = [];
        /**
         * \@description
         * The uncomposed array of async validators for the control
         *
         * \@internal
         */
        this._rawAsyncValidators = [];
    }
    /**
     * \@description
     * The registered synchronous validator function for the control
     *
     * @throws An exception that this method is not implemented
     * @return {?}
     */
    get validator() { return (/** @type {?} */ (unimplemented())); }
    /**
     * \@description
     * The registered async validator function for the control
     *
     * @throws An exception that this method is not implemented
     * @return {?}
     */
    get asyncValidator() { return (/** @type {?} */ (unimplemented())); }
}
if (false) {
    /**
     * \@description
     * The parent form for the control.
     *
     * \@internal
     * @type {?}
     */
    NgControl.prototype._parent;
    /**
     * \@description
     * The name for the control
     * @type {?}
     */
    NgControl.prototype.name;
    /**
     * \@description
     * The value accessor for the control
     * @type {?}
     */
    NgControl.prototype.valueAccessor;
    /**
     * \@description
     * The uncomposed array of synchronous validators for the control
     *
     * \@internal
     * @type {?}
     */
    NgControl.prototype._rawValidators;
    /**
     * \@description
     * The uncomposed array of async validators for the control
     *
     * \@internal
     * @type {?}
     */
    NgControl.prototype._rawAsyncValidators;
    /**
     * \@description
     * The callback method to update the model from the view when requested
     *
     * @abstract
     * @param {?} newValue The new value for the view
     * @return {?}
     */
    NgControl.prototype.viewToModelUpdate = function (newValue) { };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2Zvcm1zL3NyYy9kaXJlY3RpdmVzL25nX2NvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBU0EsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sOEJBQThCLENBQUM7Ozs7QUFLdEUsU0FBUyxhQUFhO0lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDbkMsQ0FBQzs7Ozs7Ozs7O0FBU0QsTUFBTSxPQUFnQixTQUFVLFNBQVEsd0JBQXdCO0lBQWhFOzs7Ozs7OztRQU9FLFlBQU8sR0FBMEIsSUFBSSxDQUFDOzs7OztRQU10QyxTQUFJLEdBQXVCLElBQUksQ0FBQzs7Ozs7UUFNaEMsa0JBQWEsR0FBOEIsSUFBSSxDQUFDOzs7Ozs7O1FBUWhELG1CQUFjLEdBQWlDLEVBQUUsQ0FBQzs7Ozs7OztRQVFsRCx3QkFBbUIsR0FBMkMsRUFBRSxDQUFDO0lBeUJuRSxDQUFDOzs7Ozs7OztJQWpCQyxJQUFJLFNBQVMsS0FBdUIsT0FBTyxtQkFBYSxhQUFhLEVBQUUsRUFBQSxDQUFDLENBQUMsQ0FBQzs7Ozs7Ozs7SUFRMUUsSUFBSSxjQUFjLEtBQTRCLE9BQU8sbUJBQWtCLGFBQWEsRUFBRSxFQUFBLENBQUMsQ0FBQyxDQUFDO0NBUzFGOzs7Ozs7Ozs7SUFyREMsNEJBQXNDOzs7Ozs7SUFNdEMseUJBQWdDOzs7Ozs7SUFNaEMsa0NBQWdEOzs7Ozs7OztJQVFoRCxtQ0FBa0Q7Ozs7Ozs7O0lBUWxELHdDQUFpRTs7Ozs7Ozs7O0lBd0JqRSxnRUFBZ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuaW1wb3J0IHtBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmV9IGZyb20gJy4vYWJzdHJhY3RfY29udHJvbF9kaXJlY3RpdmUnO1xuaW1wb3J0IHtDb250cm9sQ29udGFpbmVyfSBmcm9tICcuL2NvbnRyb2xfY29udGFpbmVyJztcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3J9IGZyb20gJy4vY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge0FzeW5jVmFsaWRhdG9yLCBBc3luY1ZhbGlkYXRvckZuLCBWYWxpZGF0b3IsIFZhbGlkYXRvckZufSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuXG5mdW5jdGlvbiB1bmltcGxlbWVudGVkKCk6IGFueSB7XG4gIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQSBiYXNlIGNsYXNzIHRoYXQgYWxsIGNvbnRyb2wgYEZvcm1Db250cm9sYC1iYXNlZCBkaXJlY3RpdmVzIGV4dGVuZC4gSXQgYmluZHMgYSBgRm9ybUNvbnRyb2xgXG4gKiBvYmplY3QgdG8gYSBET00gZWxlbWVudC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOZ0NvbnRyb2wgZXh0ZW5kcyBBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmUge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRoZSBwYXJlbnQgZm9ybSBmb3IgdGhlIGNvbnRyb2wuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX3BhcmVudDogQ29udHJvbENvbnRhaW5lcnxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRoZSBuYW1lIGZvciB0aGUgY29udHJvbFxuICAgKi9cbiAgbmFtZTogc3RyaW5nfG51bWJlcnxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRoZSB2YWx1ZSBhY2Nlc3NvciBmb3IgdGhlIGNvbnRyb2xcbiAgICovXG4gIHZhbHVlQWNjZXNzb3I6IENvbnRyb2xWYWx1ZUFjY2Vzc29yfG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGhlIHVuY29tcG9zZWQgYXJyYXkgb2Ygc3luY2hyb25vdXMgdmFsaWRhdG9ycyBmb3IgdGhlIGNvbnRyb2xcbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfcmF3VmFsaWRhdG9yczogQXJyYXk8VmFsaWRhdG9yfFZhbGlkYXRvckZuPiA9IFtdO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGhlIHVuY29tcG9zZWQgYXJyYXkgb2YgYXN5bmMgdmFsaWRhdG9ycyBmb3IgdGhlIGNvbnRyb2xcbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfcmF3QXN5bmNWYWxpZGF0b3JzOiBBcnJheTxBc3luY1ZhbGlkYXRvcnxBc3luY1ZhbGlkYXRvckZuPiA9IFtdO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGhlIHJlZ2lzdGVyZWQgc3luY2hyb25vdXMgdmFsaWRhdG9yIGZ1bmN0aW9uIGZvciB0aGUgY29udHJvbFxuICAgKlxuICAgKiBAdGhyb3dzIEFuIGV4Y2VwdGlvbiB0aGF0IHRoaXMgbWV0aG9kIGlzIG5vdCBpbXBsZW1lbnRlZFxuICAgKi9cbiAgZ2V0IHZhbGlkYXRvcigpOiBWYWxpZGF0b3JGbnxudWxsIHsgcmV0dXJuIDxWYWxpZGF0b3JGbj51bmltcGxlbWVudGVkKCk7IH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRoZSByZWdpc3RlcmVkIGFzeW5jIHZhbGlkYXRvciBmdW5jdGlvbiBmb3IgdGhlIGNvbnRyb2xcbiAgICpcbiAgICogQHRocm93cyBBbiBleGNlcHRpb24gdGhhdCB0aGlzIG1ldGhvZCBpcyBub3QgaW1wbGVtZW50ZWRcbiAgICovXG4gIGdldCBhc3luY1ZhbGlkYXRvcigpOiBBc3luY1ZhbGlkYXRvckZufG51bGwgeyByZXR1cm4gPEFzeW5jVmFsaWRhdG9yRm4+dW5pbXBsZW1lbnRlZCgpOyB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGUgY2FsbGJhY2sgbWV0aG9kIHRvIHVwZGF0ZSB0aGUgbW9kZWwgZnJvbSB0aGUgdmlldyB3aGVuIHJlcXVlc3RlZFxuICAgKlxuICAgKiBAcGFyYW0gbmV3VmFsdWUgVGhlIG5ldyB2YWx1ZSBmb3IgdGhlIHZpZXdcbiAgICovXG4gIGFic3RyYWN0IHZpZXdUb01vZGVsVXBkYXRlKG5ld1ZhbHVlOiBhbnkpOiB2b2lkO1xufVxuIl19