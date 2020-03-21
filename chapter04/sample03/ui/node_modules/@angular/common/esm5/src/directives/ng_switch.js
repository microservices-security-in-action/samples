/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata, __param } from "tslib";
import { Directive, Host, Input, TemplateRef, ViewContainerRef } from '@angular/core';
var SwitchView = /** @class */ (function () {
    function SwitchView(_viewContainerRef, _templateRef) {
        this._viewContainerRef = _viewContainerRef;
        this._templateRef = _templateRef;
        this._created = false;
    }
    SwitchView.prototype.create = function () {
        this._created = true;
        this._viewContainerRef.createEmbeddedView(this._templateRef);
    };
    SwitchView.prototype.destroy = function () {
        this._created = false;
        this._viewContainerRef.clear();
    };
    SwitchView.prototype.enforceState = function (created) {
        if (created && !this._created) {
            this.create();
        }
        else if (!created && this._created) {
            this.destroy();
        }
    };
    return SwitchView;
}());
export { SwitchView };
/**
 * @ngModule CommonModule
 *
 * @description A structural directive that adds or removes templates (displaying or hiding views)
 * when the next match expression matches the switch expression.
 *
 * The `[ngSwitch]` directive on a container specifies an expression to match against.
 * The expressions to match are provided by `ngSwitchCase` directives on views within the container.
 * - Every view that matches is rendered.
 * - If there are no matches, a view with the `ngSwitchDefault` directive is rendered.
 * - Elements within the `[NgSwitch]` statement but outside of any `NgSwitchCase`
 * or `ngSwitchDefault` directive are preserved at the location.
 *
 * @usageNotes
 * Define a container element for the directive, and specify the switch expression
 * to match against as an attribute:
 *
 * ```
 * <container-element [ngSwitch]="switch_expression">
 * ```
 *
 * Within the container, `*ngSwitchCase` statements specify the match expressions
 * as attributes. Include `*ngSwitchDefault` as the final case.
 *
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *    <some-element *ngSwitchCase="match_expression_1">...</some-element>
 * ...
 *    <some-element *ngSwitchDefault>...</some-element>
 * </container-element>
 * ```
 *
 * ### Usage Examples
 *
 * The following example shows how to use more than one case to display the same view:
 *
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *   <!-- the same view can be shown in more than one case -->
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *   <some-element *ngSwitchCase="match_expression_2">...</some-element>
 *   <some-other-element *ngSwitchCase="match_expression_3">...</some-other-element>
 *   <!--default case when there are no matches -->
 *   <some-element *ngSwitchDefault>...</some-element>
 * </container-element>
 * ```
 *
 * The following example shows how cases can be nested:
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *       <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *       <some-element *ngSwitchCase="match_expression_2">...</some-element>
 *       <some-other-element *ngSwitchCase="match_expression_3">...</some-other-element>
 *       <ng-container *ngSwitchCase="match_expression_3">
 *         <!-- use a ng-container to group multiple root nodes -->
 *         <inner-element></inner-element>
 *         <inner-other-element></inner-other-element>
 *       </ng-container>
 *       <some-element *ngSwitchDefault>...</some-element>
 *     </container-element>
 * ```
 *
 * @publicApi
 * @see `NgSwitchCase`
 * @see `NgSwitchDefault`
 * @see [Structural Directives](guide/structural-directives)
 *
 */
var NgSwitch = /** @class */ (function () {
    function NgSwitch() {
        this._defaultUsed = false;
        this._caseCount = 0;
        this._lastCaseCheckIndex = 0;
        this._lastCasesMatched = false;
    }
    Object.defineProperty(NgSwitch.prototype, "ngSwitch", {
        set: function (newValue) {
            this._ngSwitch = newValue;
            if (this._caseCount === 0) {
                this._updateDefaultCases(true);
            }
        },
        enumerable: true,
        configurable: true
    });
    /** @internal */
    NgSwitch.prototype._addCase = function () { return this._caseCount++; };
    /** @internal */
    NgSwitch.prototype._addDefault = function (view) {
        if (!this._defaultViews) {
            this._defaultViews = [];
        }
        this._defaultViews.push(view);
    };
    /** @internal */
    NgSwitch.prototype._matchCase = function (value) {
        var matched = value == this._ngSwitch;
        this._lastCasesMatched = this._lastCasesMatched || matched;
        this._lastCaseCheckIndex++;
        if (this._lastCaseCheckIndex === this._caseCount) {
            this._updateDefaultCases(!this._lastCasesMatched);
            this._lastCaseCheckIndex = 0;
            this._lastCasesMatched = false;
        }
        return matched;
    };
    NgSwitch.prototype._updateDefaultCases = function (useDefault) {
        if (this._defaultViews && useDefault !== this._defaultUsed) {
            this._defaultUsed = useDefault;
            for (var i = 0; i < this._defaultViews.length; i++) {
                var defaultView = this._defaultViews[i];
                defaultView.enforceState(useDefault);
            }
        }
    };
    __decorate([
        Input(),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], NgSwitch.prototype, "ngSwitch", null);
    NgSwitch = __decorate([
        Directive({ selector: '[ngSwitch]' })
    ], NgSwitch);
    return NgSwitch;
}());
export { NgSwitch };
/**
 * @ngModule CommonModule
 *
 * @description
 * Provides a switch case expression to match against an enclosing `ngSwitch` expression.
 * When the expressions match, the given `NgSwitchCase` template is rendered.
 * If multiple match expressions match the switch expression value, all of them are displayed.
 *
 * @usageNotes
 *
 * Within a switch container, `*ngSwitchCase` statements specify the match expressions
 * as attributes. Include `*ngSwitchDefault` as the final case.
 *
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *   ...
 *   <some-element *ngSwitchDefault>...</some-element>
 * </container-element>
 * ```
 *
 * Each switch-case statement contains an in-line HTML template or template reference
 * that defines the subtree to be selected if the value of the match expression
 * matches the value of the switch expression.
 *
 * Unlike JavaScript, which uses strict equality, Angular uses loose equality.
 * This means that the empty string, `""` matches 0.
 *
 * @publicApi
 * @see `NgSwitch`
 * @see `NgSwitchDefault`
 *
 */
var NgSwitchCase = /** @class */ (function () {
    function NgSwitchCase(viewContainer, templateRef, ngSwitch) {
        this.ngSwitch = ngSwitch;
        ngSwitch._addCase();
        this._view = new SwitchView(viewContainer, templateRef);
    }
    /**
     * Performs case matching. For internal use only.
     */
    NgSwitchCase.prototype.ngDoCheck = function () { this._view.enforceState(this.ngSwitch._matchCase(this.ngSwitchCase)); };
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], NgSwitchCase.prototype, "ngSwitchCase", void 0);
    NgSwitchCase = __decorate([
        Directive({ selector: '[ngSwitchCase]' }),
        __param(2, Host()),
        __metadata("design:paramtypes", [ViewContainerRef, TemplateRef,
            NgSwitch])
    ], NgSwitchCase);
    return NgSwitchCase;
}());
export { NgSwitchCase };
/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Creates a view that is rendered when no `NgSwitchCase` expressions
 * match the `NgSwitch` expression.
 * This statement should be the final case in an `NgSwitch`.
 *
 * @publicApi
 * @see `NgSwitch`
 * @see `NgSwitchCase`
 *
 */
var NgSwitchDefault = /** @class */ (function () {
    function NgSwitchDefault(viewContainer, templateRef, ngSwitch) {
        ngSwitch._addDefault(new SwitchView(viewContainer, templateRef));
    }
    NgSwitchDefault = __decorate([
        Directive({ selector: '[ngSwitchDefault]' }),
        __param(2, Host()),
        __metadata("design:paramtypes", [ViewContainerRef, TemplateRef,
            NgSwitch])
    ], NgSwitchDefault);
    return NgSwitchDefault;
}());
export { NgSwitchDefault };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBVyxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU3RjtJQUdFLG9CQUNZLGlCQUFtQyxFQUFVLFlBQWlDO1FBQTlFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFIbEYsYUFBUSxHQUFHLEtBQUssQ0FBQztJQUdvRSxDQUFDO0lBRTlGLDJCQUFNLEdBQU47UUFDRSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCw0QkFBTyxHQUFQO1FBQ0UsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxpQ0FBWSxHQUFaLFVBQWEsT0FBZ0I7UUFDM0IsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQzdCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNmO2FBQU0sSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNoQjtJQUNILENBQUM7SUFDSCxpQkFBQztBQUFELENBQUMsQUF2QkQsSUF1QkM7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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SUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBWnJGO1FBREMsS0FBSyxFQUFFOztzREFDVTtJQU5QLFlBQVk7UUFEeEIsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFDLENBQUM7UUFXakMsV0FBQSxJQUFJLEVBQUUsQ0FBQTt5Q0FEUSxnQkFBZ0IsRUFBZSxXQUFXO1lBQy9CLFFBQVE7T0FWM0IsWUFBWSxDQW1CeEI7SUFBRCxtQkFBQztDQUFBLEFBbkJELElBbUJDO1NBbkJZLFlBQVk7QUFxQnpCOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFFSDtJQUNFLHlCQUNJLGFBQStCLEVBQUUsV0FBZ0MsRUFDekQsUUFBa0I7UUFDNUIsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBTFUsZUFBZTtRQUQzQixTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsbUJBQW1CLEVBQUMsQ0FBQztRQUlwQyxXQUFBLElBQUksRUFBRSxDQUFBO3lDQURRLGdCQUFnQixFQUFlLFdBQVc7WUFDdkMsUUFBUTtPQUhuQixlQUFlLENBTTNCO0lBQUQsc0JBQUM7Q0FBQSxBQU5ELElBTUM7U0FOWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgSG9zdCwgSW5wdXQsIFRlbXBsYXRlUmVmLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuZXhwb3J0IGNsYXNzIFN3aXRjaFZpZXcge1xuICBwcml2YXRlIF9jcmVhdGVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLCBwcml2YXRlIF90ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0Pikge31cblxuICBjcmVhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5fY3JlYXRlZCA9IHRydWU7XG4gICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5fdGVtcGxhdGVSZWYpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jcmVhdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jbGVhcigpO1xuICB9XG5cbiAgZW5mb3JjZVN0YXRlKGNyZWF0ZWQ6IGJvb2xlYW4pIHtcbiAgICBpZiAoY3JlYXRlZCAmJiAhdGhpcy5fY3JlYXRlZCkge1xuICAgICAgdGhpcy5jcmVhdGUoKTtcbiAgICB9IGVsc2UgaWYgKCFjcmVhdGVkICYmIHRoaXMuX2NyZWF0ZWQpIHtcbiAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAZGVzY3JpcHRpb24gQSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSB0aGF0IGFkZHMgb3IgcmVtb3ZlcyB0ZW1wbGF0ZXMgKGRpc3BsYXlpbmcgb3IgaGlkaW5nIHZpZXdzKVxuICogd2hlbiB0aGUgbmV4dCBtYXRjaCBleHByZXNzaW9uIG1hdGNoZXMgdGhlIHN3aXRjaCBleHByZXNzaW9uLlxuICpcbiAqIFRoZSBgW25nU3dpdGNoXWAgZGlyZWN0aXZlIG9uIGEgY29udGFpbmVyIHNwZWNpZmllcyBhbiBleHByZXNzaW9uIHRvIG1hdGNoIGFnYWluc3QuXG4gKiBUaGUgZXhwcmVzc2lvbnMgdG8gbWF0Y2ggYXJlIHByb3ZpZGVkIGJ5IGBuZ1N3aXRjaENhc2VgIGRpcmVjdGl2ZXMgb24gdmlld3Mgd2l0aGluIHRoZSBjb250YWluZXIuXG4gKiAtIEV2ZXJ5IHZpZXcgdGhhdCBtYXRjaGVzIGlzIHJlbmRlcmVkLlxuICogLSBJZiB0aGVyZSBhcmUgbm8gbWF0Y2hlcywgYSB2aWV3IHdpdGggdGhlIGBuZ1N3aXRjaERlZmF1bHRgIGRpcmVjdGl2ZSBpcyByZW5kZXJlZC5cbiAqIC0gRWxlbWVudHMgd2l0aGluIHRoZSBgW05nU3dpdGNoXWAgc3RhdGVtZW50IGJ1dCBvdXRzaWRlIG9mIGFueSBgTmdTd2l0Y2hDYXNlYFxuICogb3IgYG5nU3dpdGNoRGVmYXVsdGAgZGlyZWN0aXZlIGFyZSBwcmVzZXJ2ZWQgYXQgdGhlIGxvY2F0aW9uLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBEZWZpbmUgYSBjb250YWluZXIgZWxlbWVudCBmb3IgdGhlIGRpcmVjdGl2ZSwgYW5kIHNwZWNpZnkgdGhlIHN3aXRjaCBleHByZXNzaW9uXG4gKiB0byBtYXRjaCBhZ2FpbnN0IGFzIGFuIGF0dHJpYnV0ZTpcbiAqXG4gKiBgYGBcbiAqIDxjb250YWluZXItZWxlbWVudCBbbmdTd2l0Y2hdPVwic3dpdGNoX2V4cHJlc3Npb25cIj5cbiAqIGBgYFxuICpcbiAqIFdpdGhpbiB0aGUgY29udGFpbmVyLCBgKm5nU3dpdGNoQ2FzZWAgc3RhdGVtZW50cyBzcGVjaWZ5IHRoZSBtYXRjaCBleHByZXNzaW9uc1xuICogYXMgYXR0cmlidXRlcy4gSW5jbHVkZSBgKm5nU3dpdGNoRGVmYXVsdGAgYXMgdGhlIGZpbmFsIGNhc2UuXG4gKlxuICogYGBgXG4gKiA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIC4uLlxuICogICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hEZWZhdWx0Pi4uLjwvc29tZS1lbGVtZW50PlxuICogPC9jb250YWluZXItZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqICMjIyBVc2FnZSBFeGFtcGxlc1xuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gdXNlIG1vcmUgdGhhbiBvbmUgY2FzZSB0byBkaXNwbGF5IHRoZSBzYW1lIHZpZXc6XG4gKlxuICogYGBgXG4gKiA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiAgIDwhLS0gdGhlIHNhbWUgdmlldyBjYW4gYmUgc2hvd24gaW4gbW9yZSB0aGFuIG9uZSBjYXNlIC0tPlxuICogICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8yXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgIDxzb21lLW90aGVyLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fM1wiPi4uLjwvc29tZS1vdGhlci1lbGVtZW50PlxuICogICA8IS0tZGVmYXVsdCBjYXNlIHdoZW4gdGhlcmUgYXJlIG5vIG1hdGNoZXMgLS0+XG4gKiAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoRGVmYXVsdD4uLi48L3NvbWUtZWxlbWVudD5cbiAqIDwvY29udGFpbmVyLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IGNhc2VzIGNhbiBiZSBuZXN0ZWQ6XG4gKiBgYGBcbiAqIDxjb250YWluZXItZWxlbWVudCBbbmdTd2l0Y2hdPVwic3dpdGNoX2V4cHJlc3Npb25cIj5cbiAqICAgICAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogICAgICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8yXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgICAgICA8c29tZS1vdGhlci1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzNcIj4uLi48L3NvbWUtb3RoZXItZWxlbWVudD5cbiAqICAgICAgIDxuZy1jb250YWluZXIgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fM1wiPlxuICogICAgICAgICA8IS0tIHVzZSBhIG5nLWNvbnRhaW5lciB0byBncm91cCBtdWx0aXBsZSByb290IG5vZGVzIC0tPlxuICogICAgICAgICA8aW5uZXItZWxlbWVudD48L2lubmVyLWVsZW1lbnQ+XG4gKiAgICAgICAgIDxpbm5lci1vdGhlci1lbGVtZW50PjwvaW5uZXItb3RoZXItZWxlbWVudD5cbiAqICAgICAgIDwvbmctY29udGFpbmVyPlxuICogICAgICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hEZWZhdWx0Pi4uLjwvc29tZS1lbGVtZW50PlxuICogICAgIDwvY29udGFpbmVyLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAc2VlIGBOZ1N3aXRjaENhc2VgXG4gKiBAc2VlIGBOZ1N3aXRjaERlZmF1bHRgXG4gKiBAc2VlIFtTdHJ1Y3R1cmFsIERpcmVjdGl2ZXNdKGd1aWRlL3N0cnVjdHVyYWwtZGlyZWN0aXZlcylcbiAqXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3dpdGNoXSd9KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX2RlZmF1bHRWaWV3cyAhOiBTd2l0Y2hWaWV3W107XG4gIHByaXZhdGUgX2RlZmF1bHRVc2VkID0gZmFsc2U7XG4gIHByaXZhdGUgX2Nhc2VDb3VudCA9IDA7XG4gIHByaXZhdGUgX2xhc3RDYXNlQ2hlY2tJbmRleCA9IDA7XG4gIHByaXZhdGUgX2xhc3RDYXNlc01hdGNoZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfbmdTd2l0Y2g6IGFueTtcblxuICBASW5wdXQoKVxuICBzZXQgbmdTd2l0Y2gobmV3VmFsdWU6IGFueSkge1xuICAgIHRoaXMuX25nU3dpdGNoID0gbmV3VmFsdWU7XG4gICAgaWYgKHRoaXMuX2Nhc2VDb3VudCA9PT0gMCkge1xuICAgICAgdGhpcy5fdXBkYXRlRGVmYXVsdENhc2VzKHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FkZENhc2UoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX2Nhc2VDb3VudCsrOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkRGVmYXVsdCh2aWV3OiBTd2l0Y2hWaWV3KSB7XG4gICAgaWYgKCF0aGlzLl9kZWZhdWx0Vmlld3MpIHtcbiAgICAgIHRoaXMuX2RlZmF1bHRWaWV3cyA9IFtdO1xuICAgIH1cbiAgICB0aGlzLl9kZWZhdWx0Vmlld3MucHVzaCh2aWV3KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX21hdGNoQ2FzZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgY29uc3QgbWF0Y2hlZCA9IHZhbHVlID09IHRoaXMuX25nU3dpdGNoO1xuICAgIHRoaXMuX2xhc3RDYXNlc01hdGNoZWQgPSB0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkIHx8IG1hdGNoZWQ7XG4gICAgdGhpcy5fbGFzdENhc2VDaGVja0luZGV4Kys7XG4gICAgaWYgKHRoaXMuX2xhc3RDYXNlQ2hlY2tJbmRleCA9PT0gdGhpcy5fY2FzZUNvdW50KSB7XG4gICAgICB0aGlzLl91cGRhdGVEZWZhdWx0Q2FzZXMoIXRoaXMuX2xhc3RDYXNlc01hdGNoZWQpO1xuICAgICAgdGhpcy5fbGFzdENhc2VDaGVja0luZGV4ID0gMDtcbiAgICAgIHRoaXMuX2xhc3RDYXNlc01hdGNoZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoZWQ7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVEZWZhdWx0Q2FzZXModXNlRGVmYXVsdDogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLl9kZWZhdWx0Vmlld3MgJiYgdXNlRGVmYXVsdCAhPT0gdGhpcy5fZGVmYXVsdFVzZWQpIHtcbiAgICAgIHRoaXMuX2RlZmF1bHRVc2VkID0gdXNlRGVmYXVsdDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fZGVmYXVsdFZpZXdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRWaWV3ID0gdGhpcy5fZGVmYXVsdFZpZXdzW2ldO1xuICAgICAgICBkZWZhdWx0Vmlldy5lbmZvcmNlU3RhdGUodXNlRGVmYXVsdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogUHJvdmlkZXMgYSBzd2l0Y2ggY2FzZSBleHByZXNzaW9uIHRvIG1hdGNoIGFnYWluc3QgYW4gZW5jbG9zaW5nIGBuZ1N3aXRjaGAgZXhwcmVzc2lvbi5cbiAqIFdoZW4gdGhlIGV4cHJlc3Npb25zIG1hdGNoLCB0aGUgZ2l2ZW4gYE5nU3dpdGNoQ2FzZWAgdGVtcGxhdGUgaXMgcmVuZGVyZWQuXG4gKiBJZiBtdWx0aXBsZSBtYXRjaCBleHByZXNzaW9ucyBtYXRjaCB0aGUgc3dpdGNoIGV4cHJlc3Npb24gdmFsdWUsIGFsbCBvZiB0aGVtIGFyZSBkaXNwbGF5ZWQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBXaXRoaW4gYSBzd2l0Y2ggY29udGFpbmVyLCBgKm5nU3dpdGNoQ2FzZWAgc3RhdGVtZW50cyBzcGVjaWZ5IHRoZSBtYXRjaCBleHByZXNzaW9uc1xuICogYXMgYXR0cmlidXRlcy4gSW5jbHVkZSBgKm5nU3dpdGNoRGVmYXVsdGAgYXMgdGhlIGZpbmFsIGNhc2UuXG4gKlxuICogYGBgXG4gKiA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogICAuLi5cbiAqICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hEZWZhdWx0Pi4uLjwvc29tZS1lbGVtZW50PlxuICogPC9jb250YWluZXItZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIEVhY2ggc3dpdGNoLWNhc2Ugc3RhdGVtZW50IGNvbnRhaW5zIGFuIGluLWxpbmUgSFRNTCB0ZW1wbGF0ZSBvciB0ZW1wbGF0ZSByZWZlcmVuY2VcbiAqIHRoYXQgZGVmaW5lcyB0aGUgc3VidHJlZSB0byBiZSBzZWxlY3RlZCBpZiB0aGUgdmFsdWUgb2YgdGhlIG1hdGNoIGV4cHJlc3Npb25cbiAqIG1hdGNoZXMgdGhlIHZhbHVlIG9mIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbi5cbiAqXG4gKiBVbmxpa2UgSmF2YVNjcmlwdCwgd2hpY2ggdXNlcyBzdHJpY3QgZXF1YWxpdHksIEFuZ3VsYXIgdXNlcyBsb29zZSBlcXVhbGl0eS5cbiAqIFRoaXMgbWVhbnMgdGhhdCB0aGUgZW1wdHkgc3RyaW5nLCBgXCJcImAgbWF0Y2hlcyAwLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBzZWUgYE5nU3dpdGNoYFxuICogQHNlZSBgTmdTd2l0Y2hEZWZhdWx0YFxuICpcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTd2l0Y2hDYXNlXSd9KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoQ2FzZSBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICBwcml2YXRlIF92aWV3OiBTd2l0Y2hWaWV3O1xuICAvKipcbiAgICogU3RvcmVzIHRoZSBIVE1MIHRlbXBsYXRlIHRvIGJlIHNlbGVjdGVkIG9uIG1hdGNoLlxuICAgKi9cbiAgQElucHV0KClcbiAgbmdTd2l0Y2hDYXNlOiBhbnk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0PixcbiAgICAgIEBIb3N0KCkgcHJpdmF0ZSBuZ1N3aXRjaDogTmdTd2l0Y2gpIHtcbiAgICBuZ1N3aXRjaC5fYWRkQ2FzZSgpO1xuICAgIHRoaXMuX3ZpZXcgPSBuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZVJlZik7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgY2FzZSBtYXRjaGluZy4gRm9yIGludGVybmFsIHVzZSBvbmx5LlxuICAgKi9cbiAgbmdEb0NoZWNrKCkgeyB0aGlzLl92aWV3LmVuZm9yY2VTdGF0ZSh0aGlzLm5nU3dpdGNoLl9tYXRjaENhc2UodGhpcy5uZ1N3aXRjaENhc2UpKTsgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBDcmVhdGVzIGEgdmlldyB0aGF0IGlzIHJlbmRlcmVkIHdoZW4gbm8gYE5nU3dpdGNoQ2FzZWAgZXhwcmVzc2lvbnNcbiAqIG1hdGNoIHRoZSBgTmdTd2l0Y2hgIGV4cHJlc3Npb24uXG4gKiBUaGlzIHN0YXRlbWVudCBzaG91bGQgYmUgdGhlIGZpbmFsIGNhc2UgaW4gYW4gYE5nU3dpdGNoYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAc2VlIGBOZ1N3aXRjaGBcbiAqIEBzZWUgYE5nU3dpdGNoQ2FzZWBcbiAqXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3dpdGNoRGVmYXVsdF0nfSlcbmV4cG9ydCBjbGFzcyBOZ1N3aXRjaERlZmF1bHQge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxPYmplY3Q+LFxuICAgICAgQEhvc3QoKSBuZ1N3aXRjaDogTmdTd2l0Y2gpIHtcbiAgICBuZ1N3aXRjaC5fYWRkRGVmYXVsdChuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZVJlZikpO1xuICB9XG59XG4iXX0=