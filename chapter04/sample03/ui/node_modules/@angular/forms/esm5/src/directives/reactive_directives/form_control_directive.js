/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __extends, __metadata, __param } from "tslib";
import { Directive, EventEmitter, Inject, InjectionToken, Input, Optional, Output, Self, forwardRef } from '@angular/core';
import { FormControl } from '../../model';
import { NG_ASYNC_VALIDATORS, NG_VALIDATORS } from '../../validators';
import { NG_VALUE_ACCESSOR } from '../control_value_accessor';
import { NgControl } from '../ng_control';
import { ReactiveErrors } from '../reactive_errors';
import { _ngModelWarning, composeAsyncValidators, composeValidators, isPropertyUpdated, selectValueAccessor, setUpControl } from '../shared';
/**
 * Token to provide to turn off the ngModel warning on formControl and formControlName.
 */
export var NG_MODEL_WITH_FORM_CONTROL_WARNING = new InjectionToken('NgModelWithFormControlWarning');
export var formControlBinding = {
    provide: NgControl,
    useExisting: forwardRef(function () { return FormControlDirective; })
};
/**
 * @description
 * * Syncs a standalone `FormControl` instance to a form control element.
 *
 * @see [Reactive Forms Guide](guide/reactive-forms)
 * @see `FormControl`
 * @see `AbstractControl`
 *
 * @usageNotes
 *
 * ### Registering a single form control
 *
 * The following examples shows how to register a standalone control and set its value.
 *
 * {@example forms/ts/simpleFormControl/simple_form_control_example.ts region='Component'}
 *
 * ### Use with ngModel
 *
 * Support for using the `ngModel` input property and `ngModelChange` event with reactive
 * form directives has been deprecated in Angular v6 and will be removed in a future version
 * of Angular.
 *
 * Now deprecated:
 *
 * ```html
 * <input [formControl]="control" [(ngModel)]="value">
 * ```
 *
 * ```ts
 * this.value = 'some value';
 * ```
 *
 * This has been deprecated for a few reasons. First, developers have found this pattern
 * confusing. It seems like the actual `ngModel` directive is being used, but in fact it's
 * an input/output property named `ngModel` on the reactive form directive that simply
 * approximates (some of) its behavior. Specifically, it allows getting/setting the value
 * and intercepting value events. However, some of `ngModel`'s other features - like
 * delaying updates with`ngModelOptions` or exporting the directive - simply don't work,
 * which has understandably caused some confusion.
 *
 * In addition, this pattern mixes template-driven and reactive forms strategies, which
 * we generally don't recommend because it doesn't take advantage of the full benefits of
 * either strategy. Setting the value in the template violates the template-agnostic
 * principles behind reactive forms, whereas adding a `FormControl`/`FormGroup` layer in
 * the class removes the convenience of defining forms in the template.
 *
 * To update your code before support is removed, you'll want to decide whether to stick
 * with reactive form directives (and get/set values using reactive forms patterns) or
 * switch over to template-driven directives.
 *
 * After (choice 1 - use reactive forms):
 *
 * ```html
 * <input [formControl]="control">
 * ```
 *
 * ```ts
 * this.control.setValue('some value');
 * ```
 *
 * After (choice 2 - use template-driven forms):
 *
 * ```html
 * <input [(ngModel)]="value">
 * ```
 *
 * ```ts
 * this.value = 'some value';
 * ```
 *
 * By default, when you use this pattern, you will see a deprecation warning once in dev
 * mode. You can choose to silence this warning by providing a config for
 * `ReactiveFormsModule` at import time:
 *
 * ```ts
 * imports: [
 *   ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'});
 * ]
 * ```
 *
 * Alternatively, you can choose to surface a separate warning for each instance of this
 * pattern with a config value of `"always"`. This may help to track down where in the code
 * the pattern is being used as the code is being updated.
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
var FormControlDirective = /** @class */ (function (_super) {
    __extends(FormControlDirective, _super);
    function FormControlDirective(validators, asyncValidators, valueAccessors, _ngModelWarningConfig) {
        var _this = _super.call(this) || this;
        _this._ngModelWarningConfig = _ngModelWarningConfig;
        /** @deprecated as of v6 */
        _this.update = new EventEmitter();
        /**
         * @description
         * Instance property used to track whether an ngModel warning has been sent out for this
         * particular `FormControlDirective` instance. Used to support warning config of "always".
         *
         * @internal
         */
        _this._ngModelWarningSent = false;
        _this._rawValidators = validators || [];
        _this._rawAsyncValidators = asyncValidators || [];
        _this.valueAccessor = selectValueAccessor(_this, valueAccessors);
        return _this;
    }
    FormControlDirective_1 = FormControlDirective;
    Object.defineProperty(FormControlDirective.prototype, "isDisabled", {
        /**
         * @description
         * Triggers a warning that this input should not be used with reactive forms.
         */
        set: function (isDisabled) { ReactiveErrors.disabledAttrWarning(); },
        enumerable: true,
        configurable: true
    });
    /**
     * @description
     * A lifecycle method called when the directive's inputs change. For internal use
     * only.
     *
     * @param changes A object of key/value pairs for the set of changed inputs.
     */
    FormControlDirective.prototype.ngOnChanges = function (changes) {
        if (this._isControlChanged(changes)) {
            setUpControl(this.form, this);
            if (this.control.disabled && this.valueAccessor.setDisabledState) {
                this.valueAccessor.setDisabledState(true);
            }
            this.form.updateValueAndValidity({ emitEvent: false });
        }
        if (isPropertyUpdated(changes, this.viewModel)) {
            _ngModelWarning('formControl', FormControlDirective_1, this, this._ngModelWarningConfig);
            this.form.setValue(this.model);
            this.viewModel = this.model;
        }
    };
    Object.defineProperty(FormControlDirective.prototype, "path", {
        /**
         * @description
         * Returns an array that represents the path from the top-level form to this control.
         * Each index is the string name of the control on that level.
         */
        get: function () { return []; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormControlDirective.prototype, "validator", {
        /**
         * @description
         * Synchronous validator function composed of all the synchronous validators
         * registered with this directive.
         */
        get: function () { return composeValidators(this._rawValidators); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormControlDirective.prototype, "asyncValidator", {
        /**
         * @description
         * Async validator function composed of all the async validators registered with this
         * directive.
         */
        get: function () {
            return composeAsyncValidators(this._rawAsyncValidators);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormControlDirective.prototype, "control", {
        /**
         * @description
         * The `FormControl` bound to this directive.
         */
        get: function () { return this.form; },
        enumerable: true,
        configurable: true
    });
    /**
     * @description
     * Sets the new value for the view model and emits an `ngModelChange` event.
     *
     * @param newValue The new value for the view model.
     */
    FormControlDirective.prototype.viewToModelUpdate = function (newValue) {
        this.viewModel = newValue;
        this.update.emit(newValue);
    };
    FormControlDirective.prototype._isControlChanged = function (changes) {
        return changes.hasOwnProperty('form');
    };
    var FormControlDirective_1;
    /**
     * @description
     * Static property used to track whether any ngModel warnings have been sent across
     * all instances of FormControlDirective. Used to support warning config of "once".
     *
     * @internal
     */
    FormControlDirective._ngModelWarningSentOnce = false;
    __decorate([
        Input('formControl'),
        __metadata("design:type", FormControl)
    ], FormControlDirective.prototype, "form", void 0);
    __decorate([
        Input('disabled'),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], FormControlDirective.prototype, "isDisabled", null);
    __decorate([
        Input('ngModel'),
        __metadata("design:type", Object)
    ], FormControlDirective.prototype, "model", void 0);
    __decorate([
        Output('ngModelChange'),
        __metadata("design:type", Object)
    ], FormControlDirective.prototype, "update", void 0);
    FormControlDirective = FormControlDirective_1 = __decorate([
        Directive({ selector: '[formControl]', providers: [formControlBinding], exportAs: 'ngForm' }),
        __param(0, Optional()), __param(0, Self()), __param(0, Inject(NG_VALIDATORS)),
        __param(1, Optional()), __param(1, Self()), __param(1, Inject(NG_ASYNC_VALIDATORS)),
        __param(2, Optional()), __param(2, Self()), __param(2, Inject(NG_VALUE_ACCESSOR)),
        __param(3, Optional()), __param(3, Inject(NG_MODEL_WITH_FORM_CONTROL_WARNING)),
        __metadata("design:paramtypes", [Array,
            Array, Array, Object])
    ], FormControlDirective);
    return FormControlDirective;
}(NgControl));
export { FormControlDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9jb250cm9sX2RpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2Zvcm1zL3NyYy9kaXJlY3RpdmVzL3JlYWN0aXZlX2RpcmVjdGl2ZXMvZm9ybV9jb250cm9sX2RpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQWEsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQWlCLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVuSixPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxtQkFBbUIsRUFBRSxhQUFhLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNwRSxPQUFPLEVBQXVCLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDbEYsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN4QyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbEQsT0FBTyxFQUFDLGVBQWUsRUFBRSxzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRSxZQUFZLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFJM0k7O0dBRUc7QUFDSCxNQUFNLENBQUMsSUFBTSxrQ0FBa0MsR0FDM0MsSUFBSSxjQUFjLENBQUMsK0JBQStCLENBQUMsQ0FBQztBQUV4RCxNQUFNLENBQUMsSUFBTSxrQkFBa0IsR0FBUTtJQUNyQyxPQUFPLEVBQUUsU0FBUztJQUNsQixXQUFXLEVBQUUsVUFBVSxDQUFDLGNBQU0sT0FBQSxvQkFBb0IsRUFBcEIsQ0FBb0IsQ0FBQztDQUNwRCxDQUFDO0FBRUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QUFLLENBQUM7SUF4QmpCO1FBQXJCLEtBQUssQ0FBQyxhQUFhLENBQUM7a0NBQVMsV0FBVztzREFBQztJQU8xQztRQURDLEtBQUssQ0FBQyxVQUFVLENBQUM7OzswREFDMkQ7SUFLM0Q7UUFBakIsS0FBSyxDQUFDLFNBQVMsQ0FBQzs7dURBQVk7SUFHSjtRQUF4QixNQUFNLENBQUMsZUFBZSxDQUFDOzt3REFBNkI7SUEzQjFDLG9CQUFvQjtRQUZoQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxDQUFDO1FBaUQ3RSxXQUFBLFFBQVEsRUFBRSxDQUFBLEVBQUUsV0FBQSxJQUFJLEVBQUUsQ0FBQSxFQUFFLFdBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFBO1FBQ3pDLFdBQUEsUUFBUSxFQUFFLENBQUEsRUFBRSxXQUFBLElBQUksRUFBRSxDQUFBLEVBQUUsV0FBQSxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUMvQyxXQUFBLFFBQVEsRUFBRSxDQUFBLEVBQUUsV0FBQSxJQUFJLEVBQUUsQ0FBQSxFQUFFLFdBQUEsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUE7UUFFN0MsV0FBQSxRQUFRLEVBQUUsQ0FBQSxFQUFFLFdBQUEsTUFBTSxDQUFDLGtDQUFrQyxDQUFDLENBQUE7eUNBSkEsS0FBSztZQUNNLEtBQUs7T0FoRHhFLG9CQUFvQixDQTRIaEM7SUFBRCwyQkFBQztDQUFBLEFBNUhELENBQTBDLFNBQVMsR0E0SGxEO1NBNUhZLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEV2ZW50RW1pdHRlciwgSW5qZWN0LCBJbmplY3Rpb25Ub2tlbiwgSW5wdXQsIE9uQ2hhbmdlcywgT3B0aW9uYWwsIE91dHB1dCwgU2VsZiwgU2ltcGxlQ2hhbmdlcywgZm9yd2FyZFJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Rm9ybUNvbnRyb2x9IGZyb20gJy4uLy4uL21vZGVsJztcbmltcG9ydCB7TkdfQVNZTkNfVkFMSURBVE9SUywgTkdfVkFMSURBVE9SU30gZnJvbSAnLi4vLi4vdmFsaWRhdG9ycyc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnLi4vY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge05nQ29udHJvbH0gZnJvbSAnLi4vbmdfY29udHJvbCc7XG5pbXBvcnQge1JlYWN0aXZlRXJyb3JzfSBmcm9tICcuLi9yZWFjdGl2ZV9lcnJvcnMnO1xuaW1wb3J0IHtfbmdNb2RlbFdhcm5pbmcsIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnMsIGNvbXBvc2VWYWxpZGF0b3JzLCBpc1Byb3BlcnR5VXBkYXRlZCwgc2VsZWN0VmFsdWVBY2Nlc3Nvciwgc2V0VXBDb250cm9sfSBmcm9tICcuLi9zaGFyZWQnO1xuaW1wb3J0IHtBc3luY1ZhbGlkYXRvciwgQXN5bmNWYWxpZGF0b3JGbiwgVmFsaWRhdG9yLCBWYWxpZGF0b3JGbn0gZnJvbSAnLi4vdmFsaWRhdG9ycyc7XG5cblxuLyoqXG4gKiBUb2tlbiB0byBwcm92aWRlIHRvIHR1cm4gb2ZmIHRoZSBuZ01vZGVsIHdhcm5pbmcgb24gZm9ybUNvbnRyb2wgYW5kIGZvcm1Db250cm9sTmFtZS5cbiAqL1xuZXhwb3J0IGNvbnN0IE5HX01PREVMX1dJVEhfRk9STV9DT05UUk9MX1dBUk5JTkcgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbignTmdNb2RlbFdpdGhGb3JtQ29udHJvbFdhcm5pbmcnKTtcblxuZXhwb3J0IGNvbnN0IGZvcm1Db250cm9sQmluZGluZzogYW55ID0ge1xuICBwcm92aWRlOiBOZ0NvbnRyb2wsXG4gIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IEZvcm1Db250cm9sRGlyZWN0aXZlKVxufTtcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqICogU3luY3MgYSBzdGFuZGFsb25lIGBGb3JtQ29udHJvbGAgaW5zdGFuY2UgdG8gYSBmb3JtIGNvbnRyb2wgZWxlbWVudC5cbiAqIFxuICogQHNlZSBbUmVhY3RpdmUgRm9ybXMgR3VpZGVdKGd1aWRlL3JlYWN0aXZlLWZvcm1zKVxuICogQHNlZSBgRm9ybUNvbnRyb2xgXG4gKiBAc2VlIGBBYnN0cmFjdENvbnRyb2xgXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgUmVnaXN0ZXJpbmcgYSBzaW5nbGUgZm9ybSBjb250cm9sXG4gKiBcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZXMgc2hvd3MgaG93IHRvIHJlZ2lzdGVyIGEgc3RhbmRhbG9uZSBjb250cm9sIGFuZCBzZXQgaXRzIHZhbHVlLlxuICpcbiAqIHtAZXhhbXBsZSBmb3Jtcy90cy9zaW1wbGVGb3JtQ29udHJvbC9zaW1wbGVfZm9ybV9jb250cm9sX2V4YW1wbGUudHMgcmVnaW9uPSdDb21wb25lbnQnfVxuICpcbiAqICMjIyBVc2Ugd2l0aCBuZ01vZGVsXG4gKlxuICogU3VwcG9ydCBmb3IgdXNpbmcgdGhlIGBuZ01vZGVsYCBpbnB1dCBwcm9wZXJ0eSBhbmQgYG5nTW9kZWxDaGFuZ2VgIGV2ZW50IHdpdGggcmVhY3RpdmVcbiAqIGZvcm0gZGlyZWN0aXZlcyBoYXMgYmVlbiBkZXByZWNhdGVkIGluIEFuZ3VsYXIgdjYgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBhIGZ1dHVyZSB2ZXJzaW9uXG4gKiBvZiBBbmd1bGFyLlxuICpcbiAqIE5vdyBkZXByZWNhdGVkOlxuICpcbiAqIGBgYGh0bWxcbiAqIDxpbnB1dCBbZm9ybUNvbnRyb2xdPVwiY29udHJvbFwiIFsobmdNb2RlbCldPVwidmFsdWVcIj5cbiAqIGBgYFxuICpcbiAqIGBgYHRzXG4gKiB0aGlzLnZhbHVlID0gJ3NvbWUgdmFsdWUnO1xuICogYGBgXG4gKlxuICogVGhpcyBoYXMgYmVlbiBkZXByZWNhdGVkIGZvciBhIGZldyByZWFzb25zLiBGaXJzdCwgZGV2ZWxvcGVycyBoYXZlIGZvdW5kIHRoaXMgcGF0dGVyblxuICogY29uZnVzaW5nLiBJdCBzZWVtcyBsaWtlIHRoZSBhY3R1YWwgYG5nTW9kZWxgIGRpcmVjdGl2ZSBpcyBiZWluZyB1c2VkLCBidXQgaW4gZmFjdCBpdCdzXG4gKiBhbiBpbnB1dC9vdXRwdXQgcHJvcGVydHkgbmFtZWQgYG5nTW9kZWxgIG9uIHRoZSByZWFjdGl2ZSBmb3JtIGRpcmVjdGl2ZSB0aGF0IHNpbXBseVxuICogYXBwcm94aW1hdGVzIChzb21lIG9mKSBpdHMgYmVoYXZpb3IuIFNwZWNpZmljYWxseSwgaXQgYWxsb3dzIGdldHRpbmcvc2V0dGluZyB0aGUgdmFsdWVcbiAqIGFuZCBpbnRlcmNlcHRpbmcgdmFsdWUgZXZlbnRzLiBIb3dldmVyLCBzb21lIG9mIGBuZ01vZGVsYCdzIG90aGVyIGZlYXR1cmVzIC0gbGlrZVxuICogZGVsYXlpbmcgdXBkYXRlcyB3aXRoYG5nTW9kZWxPcHRpb25zYCBvciBleHBvcnRpbmcgdGhlIGRpcmVjdGl2ZSAtIHNpbXBseSBkb24ndCB3b3JrLFxuICogd2hpY2ggaGFzIHVuZGVyc3RhbmRhYmx5IGNhdXNlZCBzb21lIGNvbmZ1c2lvbi5cbiAqXG4gKiBJbiBhZGRpdGlvbiwgdGhpcyBwYXR0ZXJuIG1peGVzIHRlbXBsYXRlLWRyaXZlbiBhbmQgcmVhY3RpdmUgZm9ybXMgc3RyYXRlZ2llcywgd2hpY2hcbiAqIHdlIGdlbmVyYWxseSBkb24ndCByZWNvbW1lbmQgYmVjYXVzZSBpdCBkb2Vzbid0IHRha2UgYWR2YW50YWdlIG9mIHRoZSBmdWxsIGJlbmVmaXRzIG9mXG4gKiBlaXRoZXIgc3RyYXRlZ3kuIFNldHRpbmcgdGhlIHZhbHVlIGluIHRoZSB0ZW1wbGF0ZSB2aW9sYXRlcyB0aGUgdGVtcGxhdGUtYWdub3N0aWNcbiAqIHByaW5jaXBsZXMgYmVoaW5kIHJlYWN0aXZlIGZvcm1zLCB3aGVyZWFzIGFkZGluZyBhIGBGb3JtQ29udHJvbGAvYEZvcm1Hcm91cGAgbGF5ZXIgaW5cbiAqIHRoZSBjbGFzcyByZW1vdmVzIHRoZSBjb252ZW5pZW5jZSBvZiBkZWZpbmluZyBmb3JtcyBpbiB0aGUgdGVtcGxhdGUuXG4gKlxuICogVG8gdXBkYXRlIHlvdXIgY29kZSBiZWZvcmUgc3VwcG9ydCBpcyByZW1vdmVkLCB5b3UnbGwgd2FudCB0byBkZWNpZGUgd2hldGhlciB0byBzdGlja1xuICogd2l0aCByZWFjdGl2ZSBmb3JtIGRpcmVjdGl2ZXMgKGFuZCBnZXQvc2V0IHZhbHVlcyB1c2luZyByZWFjdGl2ZSBmb3JtcyBwYXR0ZXJucykgb3JcbiAqIHN3aXRjaCBvdmVyIHRvIHRlbXBsYXRlLWRyaXZlbiBkaXJlY3RpdmVzLlxuICpcbiAqIEFmdGVyIChjaG9pY2UgMSAtIHVzZSByZWFjdGl2ZSBmb3Jtcyk6XG4gKlxuICogYGBgaHRtbFxuICogPGlucHV0IFtmb3JtQ29udHJvbF09XCJjb250cm9sXCI+XG4gKiBgYGBcbiAqXG4gKiBgYGB0c1xuICogdGhpcy5jb250cm9sLnNldFZhbHVlKCdzb21lIHZhbHVlJyk7XG4gKiBgYGBcbiAqXG4gKiBBZnRlciAoY2hvaWNlIDIgLSB1c2UgdGVtcGxhdGUtZHJpdmVuIGZvcm1zKTpcbiAqXG4gKiBgYGBodG1sXG4gKiA8aW5wdXQgWyhuZ01vZGVsKV09XCJ2YWx1ZVwiPlxuICogYGBgXG4gKlxuICogYGBgdHNcbiAqIHRoaXMudmFsdWUgPSAnc29tZSB2YWx1ZSc7XG4gKiBgYGBcbiAqXG4gKiBCeSBkZWZhdWx0LCB3aGVuIHlvdSB1c2UgdGhpcyBwYXR0ZXJuLCB5b3Ugd2lsbCBzZWUgYSBkZXByZWNhdGlvbiB3YXJuaW5nIG9uY2UgaW4gZGV2XG4gKiBtb2RlLiBZb3UgY2FuIGNob29zZSB0byBzaWxlbmNlIHRoaXMgd2FybmluZyBieSBwcm92aWRpbmcgYSBjb25maWcgZm9yXG4gKiBgUmVhY3RpdmVGb3Jtc01vZHVsZWAgYXQgaW1wb3J0IHRpbWU6XG4gKlxuICogYGBgdHNcbiAqIGltcG9ydHM6IFtcbiAqICAgUmVhY3RpdmVGb3Jtc01vZHVsZS53aXRoQ29uZmlnKHt3YXJuT25OZ01vZGVsV2l0aEZvcm1Db250cm9sOiAnbmV2ZXInfSk7XG4gKiBdXG4gKiBgYGBcbiAqXG4gKiBBbHRlcm5hdGl2ZWx5LCB5b3UgY2FuIGNob29zZSB0byBzdXJmYWNlIGEgc2VwYXJhdGUgd2FybmluZyBmb3IgZWFjaCBpbnN0YW5jZSBvZiB0aGlzXG4gKiBwYXR0ZXJuIHdpdGggYSBjb25maWcgdmFsdWUgb2YgYFwiYWx3YXlzXCJgLiBUaGlzIG1heSBoZWxwIHRvIHRyYWNrIGRvd24gd2hlcmUgaW4gdGhlIGNvZGVcbiAqIHRoZSBwYXR0ZXJuIGlzIGJlaW5nIHVzZWQgYXMgdGhlIGNvZGUgaXMgYmVpbmcgdXBkYXRlZC5cbiAqXG4gKiBAbmdNb2R1bGUgUmVhY3RpdmVGb3Jtc01vZHVsZVxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tmb3JtQ29udHJvbF0nLCBwcm92aWRlcnM6IFtmb3JtQ29udHJvbEJpbmRpbmddLCBleHBvcnRBczogJ25nRm9ybSd9KVxuXG5leHBvcnQgY2xhc3MgRm9ybUNvbnRyb2xEaXJlY3RpdmUgZXh0ZW5kcyBOZ0NvbnRyb2wgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEludGVybmFsIHJlZmVyZW5jZSB0byB0aGUgdmlldyBtb2RlbCB2YWx1ZS5cbiAgICovXG4gIHZpZXdNb2RlbDogYW55O1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVHJhY2tzIHRoZSBgRm9ybUNvbnRyb2xgIGluc3RhbmNlIGJvdW5kIHRvIHRoZSBkaXJlY3RpdmUuXG4gICAqL1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgQElucHV0KCdmb3JtQ29udHJvbCcpIGZvcm0gITogRm9ybUNvbnRyb2w7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUcmlnZ2VycyBhIHdhcm5pbmcgdGhhdCB0aGlzIGlucHV0IHNob3VsZCBub3QgYmUgdXNlZCB3aXRoIHJlYWN0aXZlIGZvcm1zLlxuICAgKi9cbiAgQElucHV0KCdkaXNhYmxlZCcpXG4gIHNldCBpc0Rpc2FibGVkKGlzRGlzYWJsZWQ6IGJvb2xlYW4pIHsgUmVhY3RpdmVFcnJvcnMuZGlzYWJsZWRBdHRyV2FybmluZygpOyB9XG5cbiAgLy8gVE9ETyhrYXJhKTogcmVtb3ZlIG5leHQgNCBwcm9wZXJ0aWVzIG9uY2UgZGVwcmVjYXRpb24gcGVyaW9kIGlzIG92ZXJcblxuICAvKiogQGRlcHJlY2F0ZWQgYXMgb2YgdjYgKi9cbiAgQElucHV0KCduZ01vZGVsJykgbW9kZWw6IGFueTtcblxuICAvKiogQGRlcHJlY2F0ZWQgYXMgb2YgdjYgKi9cbiAgQE91dHB1dCgnbmdNb2RlbENoYW5nZScpIHVwZGF0ZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFN0YXRpYyBwcm9wZXJ0eSB1c2VkIHRvIHRyYWNrIHdoZXRoZXIgYW55IG5nTW9kZWwgd2FybmluZ3MgaGF2ZSBiZWVuIHNlbnQgYWNyb3NzXG4gICAqIGFsbCBpbnN0YW5jZXMgb2YgRm9ybUNvbnRyb2xEaXJlY3RpdmUuIFVzZWQgdG8gc3VwcG9ydCB3YXJuaW5nIGNvbmZpZyBvZiBcIm9uY2VcIi5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBzdGF0aWMgX25nTW9kZWxXYXJuaW5nU2VudE9uY2UgPSBmYWxzZTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEluc3RhbmNlIHByb3BlcnR5IHVzZWQgdG8gdHJhY2sgd2hldGhlciBhbiBuZ01vZGVsIHdhcm5pbmcgaGFzIGJlZW4gc2VudCBvdXQgZm9yIHRoaXNcbiAgICogcGFydGljdWxhciBgRm9ybUNvbnRyb2xEaXJlY3RpdmVgIGluc3RhbmNlLiBVc2VkIHRvIHN1cHBvcnQgd2FybmluZyBjb25maWcgb2YgXCJhbHdheXNcIi5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfbmdNb2RlbFdhcm5pbmdTZW50ID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHZhbGlkYXRvcnM6IEFycmF5PFZhbGlkYXRvcnxWYWxpZGF0b3JGbj4sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19BU1lOQ19WQUxJREFUT1JTKSBhc3luY1ZhbGlkYXRvcnM6IEFycmF5PEFzeW5jVmFsaWRhdG9yfEFzeW5jVmFsaWRhdG9yRm4+LFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMVUVfQUNDRVNTT1IpXG4gICAgICAgICAgICAgIHZhbHVlQWNjZXNzb3JzOiBDb250cm9sVmFsdWVBY2Nlc3NvcltdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE5HX01PREVMX1dJVEhfRk9STV9DT05UUk9MX1dBUk5JTkcpIHByaXZhdGUgX25nTW9kZWxXYXJuaW5nQ29uZmlnOiBzdHJpbmd8bnVsbCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmF3VmFsaWRhdG9ycyA9IHZhbGlkYXRvcnMgfHwgW107XG4gICAgICAgICAgICAgICAgdGhpcy5fcmF3QXN5bmNWYWxpZGF0b3JzID0gYXN5bmNWYWxpZGF0b3JzIHx8IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVBY2Nlc3NvciA9IHNlbGVjdFZhbHVlQWNjZXNzb3IodGhpcywgdmFsdWVBY2Nlc3NvcnMpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgKiBBIGxpZmVjeWNsZSBtZXRob2QgY2FsbGVkIHdoZW4gdGhlIGRpcmVjdGl2ZSdzIGlucHV0cyBjaGFuZ2UuIEZvciBpbnRlcm5hbCB1c2VcbiAgICAgICAgICAgICAgICogb25seS5cbiAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICogQHBhcmFtIGNoYW5nZXMgQSBvYmplY3Qgb2Yga2V5L3ZhbHVlIHBhaXJzIGZvciB0aGUgc2V0IG9mIGNoYW5nZWQgaW5wdXRzLlxuICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pc0NvbnRyb2xDaGFuZ2VkKGNoYW5nZXMpKSB7XG4gICAgICAgICAgICAgICAgICBzZXRVcENvbnRyb2wodGhpcy5mb3JtLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbnRyb2wuZGlzYWJsZWQgJiYgdGhpcy52YWx1ZUFjY2Vzc29yICEuc2V0RGlzYWJsZWRTdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlQWNjZXNzb3IgIS5zZXREaXNhYmxlZFN0YXRlICEodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB0aGlzLmZvcm0udXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXNQcm9wZXJ0eVVwZGF0ZWQoY2hhbmdlcywgdGhpcy52aWV3TW9kZWwpKSB7XG4gICAgICAgICAgICAgICAgICBfbmdNb2RlbFdhcm5pbmcoXG4gICAgICAgICAgICAgICAgICAgICAgJ2Zvcm1Db250cm9sJywgRm9ybUNvbnRyb2xEaXJlY3RpdmUsIHRoaXMsIHRoaXMuX25nTW9kZWxXYXJuaW5nQ29uZmlnKTtcbiAgICAgICAgICAgICAgICAgIHRoaXMuZm9ybS5zZXRWYWx1ZSh0aGlzLm1vZGVsKTtcbiAgICAgICAgICAgICAgICAgIHRoaXMudmlld01vZGVsID0gdGhpcy5tb2RlbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAqIFJldHVybnMgYW4gYXJyYXkgdGhhdCByZXByZXNlbnRzIHRoZSBwYXRoIGZyb20gdGhlIHRvcC1sZXZlbCBmb3JtIHRvIHRoaXMgY29udHJvbC5cbiAgICAgICAgICAgICAgICogRWFjaCBpbmRleCBpcyB0aGUgc3RyaW5nIG5hbWUgb2YgdGhlIGNvbnRyb2wgb24gdGhhdCBsZXZlbC5cbiAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgIGdldCBwYXRoKCk6IHN0cmluZ1tdIHsgcmV0dXJuIFtdOyB9XG5cbiAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgKiBTeW5jaHJvbm91cyB2YWxpZGF0b3IgZnVuY3Rpb24gY29tcG9zZWQgb2YgYWxsIHRoZSBzeW5jaHJvbm91cyB2YWxpZGF0b3JzXG4gICAgICAgICAgICAgICAqIHJlZ2lzdGVyZWQgd2l0aCB0aGlzIGRpcmVjdGl2ZS5cbiAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgIGdldCB2YWxpZGF0b3IoKTogVmFsaWRhdG9yRm58bnVsbCB7IHJldHVybiBjb21wb3NlVmFsaWRhdG9ycyh0aGlzLl9yYXdWYWxpZGF0b3JzKTsgfVxuXG4gICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICogQXN5bmMgdmFsaWRhdG9yIGZ1bmN0aW9uIGNvbXBvc2VkIG9mIGFsbCB0aGUgYXN5bmMgdmFsaWRhdG9ycyByZWdpc3RlcmVkIHdpdGggdGhpc1xuICAgICAgICAgICAgICAgKiBkaXJlY3RpdmUuXG4gICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICBnZXQgYXN5bmNWYWxpZGF0b3IoKTogQXN5bmNWYWxpZGF0b3JGbnxudWxsIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcG9zZUFzeW5jVmFsaWRhdG9ycyh0aGlzLl9yYXdBc3luY1ZhbGlkYXRvcnMpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgKiBUaGUgYEZvcm1Db250cm9sYCBib3VuZCB0byB0aGlzIGRpcmVjdGl2ZS5cbiAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgIGdldCBjb250cm9sKCk6IEZvcm1Db250cm9sIHsgcmV0dXJuIHRoaXMuZm9ybTsgfVxuXG4gICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICogU2V0cyB0aGUgbmV3IHZhbHVlIGZvciB0aGUgdmlldyBtb2RlbCBhbmQgZW1pdHMgYW4gYG5nTW9kZWxDaGFuZ2VgIGV2ZW50LlxuICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgKiBAcGFyYW0gbmV3VmFsdWUgVGhlIG5ldyB2YWx1ZSBmb3IgdGhlIHZpZXcgbW9kZWwuXG4gICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICB2aWV3VG9Nb2RlbFVwZGF0ZShuZXdWYWx1ZTogYW55KTogdm9pZCB7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3TW9kZWwgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZS5lbWl0KG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHByaXZhdGUgX2lzQ29udHJvbENoYW5nZWQoY2hhbmdlczoge1trZXk6IHN0cmluZ106IGFueX0pOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eSgnZm9ybScpO1xuICAgICAgICAgICAgICB9XG59XG4iXX0=