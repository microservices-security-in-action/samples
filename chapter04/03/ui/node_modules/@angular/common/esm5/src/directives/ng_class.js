import { __decorate, __metadata } from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Input, IterableDiffers, KeyValueDiffers, Renderer2, ɵisListLikeIterable as isListLikeIterable, ɵstringify as stringify } from '@angular/core';
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```
 *     <some-element [ngClass]="'first second'">...</some-element>
 *
 *     <some-element [ngClass]="['first', 'second']">...</some-element>
 *
 *     <some-element [ngClass]="{'first': true, 'second': true, 'third': false}">...</some-element>
 *
 *     <some-element [ngClass]="stringExp|arrayExp|objExp">...</some-element>
 *
 *     <some-element [ngClass]="{'class1 class2 class3' : true}">...</some-element>
 * ```
 *
 * @description
 *
 * Adds and removes CSS classes on an HTML element.
 *
 * The CSS classes are updated as follows, depending on the type of the expression evaluation:
 * - `string` - the CSS classes listed in the string (space delimited) are added,
 * - `Array` - the CSS classes declared as Array elements are added,
 * - `Object` - keys are CSS classes that get added when the expression given in the value
 *              evaluates to a truthy value, otherwise they are removed.
 *
 * @publicApi
 */
var NgClass = /** @class */ (function () {
    function NgClass(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
        this._iterableDiffers = _iterableDiffers;
        this._keyValueDiffers = _keyValueDiffers;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this._iterableDiffer = null;
        this._keyValueDiffer = null;
        this._initialClasses = [];
        this._rawClass = null;
    }
    Object.defineProperty(NgClass.prototype, "klass", {
        set: function (value) {
            this._removeClasses(this._initialClasses);
            this._initialClasses = typeof value === 'string' ? value.split(/\s+/) : [];
            this._applyClasses(this._initialClasses);
            this._applyClasses(this._rawClass);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgClass.prototype, "ngClass", {
        set: function (value) {
            this._removeClasses(this._rawClass);
            this._applyClasses(this._initialClasses);
            this._iterableDiffer = null;
            this._keyValueDiffer = null;
            this._rawClass = typeof value === 'string' ? value.split(/\s+/) : value;
            if (this._rawClass) {
                if (isListLikeIterable(this._rawClass)) {
                    this._iterableDiffer = this._iterableDiffers.find(this._rawClass).create();
                }
                else {
                    this._keyValueDiffer = this._keyValueDiffers.find(this._rawClass).create();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    NgClass.prototype.ngDoCheck = function () {
        if (this._iterableDiffer) {
            var iterableChanges = this._iterableDiffer.diff(this._rawClass);
            if (iterableChanges) {
                this._applyIterableChanges(iterableChanges);
            }
        }
        else if (this._keyValueDiffer) {
            var keyValueChanges = this._keyValueDiffer.diff(this._rawClass);
            if (keyValueChanges) {
                this._applyKeyValueChanges(keyValueChanges);
            }
        }
    };
    NgClass.prototype._applyKeyValueChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) { return _this._toggleClass(record.key, record.currentValue); });
        changes.forEachChangedItem(function (record) { return _this._toggleClass(record.key, record.currentValue); });
        changes.forEachRemovedItem(function (record) {
            if (record.previousValue) {
                _this._toggleClass(record.key, false);
            }
        });
    };
    NgClass.prototype._applyIterableChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) {
            if (typeof record.item === 'string') {
                _this._toggleClass(record.item, true);
            }
            else {
                throw new Error("NgClass can only toggle CSS classes expressed as strings, got " + stringify(record.item));
            }
        });
        changes.forEachRemovedItem(function (record) { return _this._toggleClass(record.item, false); });
    };
    /**
     * Applies a collection of CSS classes to the DOM element.
     *
     * For argument of type Set and Array CSS class names contained in those collections are always
     * added.
     * For argument of type Map CSS class name in the map's key is toggled based on the value (added
     * for truthy and removed for falsy).
     */
    NgClass.prototype._applyClasses = function (rawClassVal) {
        var _this = this;
        if (rawClassVal) {
            if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
                rawClassVal.forEach(function (klass) { return _this._toggleClass(klass, true); });
            }
            else {
                Object.keys(rawClassVal).forEach(function (klass) { return _this._toggleClass(klass, !!rawClassVal[klass]); });
            }
        }
    };
    /**
     * Removes a collection of CSS classes from the DOM element. This is mostly useful for cleanup
     * purposes.
     */
    NgClass.prototype._removeClasses = function (rawClassVal) {
        var _this = this;
        if (rawClassVal) {
            if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
                rawClassVal.forEach(function (klass) { return _this._toggleClass(klass, false); });
            }
            else {
                Object.keys(rawClassVal).forEach(function (klass) { return _this._toggleClass(klass, false); });
            }
        }
    };
    NgClass.prototype._toggleClass = function (klass, enabled) {
        var _this = this;
        klass = klass.trim();
        if (klass) {
            klass.split(/\s+/g).forEach(function (klass) {
                if (enabled) {
                    _this._renderer.addClass(_this._ngEl.nativeElement, klass);
                }
                else {
                    _this._renderer.removeClass(_this._ngEl.nativeElement, klass);
                }
            });
        }
    };
    __decorate([
        Input('class'),
        __metadata("design:type", String),
        __metadata("design:paramtypes", [String])
    ], NgClass.prototype, "klass", null);
    __decorate([
        Input('ngClass'),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], NgClass.prototype, "ngClass", null);
    NgClass = __decorate([
        Directive({ selector: '[ngClass]' }),
        __metadata("design:paramtypes", [IterableDiffers, KeyValueDiffers,
            ElementRef, Renderer2])
    ], NgClass);
    return NgClass;
}());
export { NgClass };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBQyxTQUFTLEVBQVcsVUFBVSxFQUFFLEtBQUssRUFBbUMsZUFBZSxFQUFtQyxlQUFlLEVBQUUsU0FBUyxFQUFFLG1CQUFtQixJQUFJLGtCQUFrQixFQUFFLFVBQVUsSUFBSSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFJdlA7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCRztBQUVIO0lBTUUsaUJBQ1ksZ0JBQWlDLEVBQVUsZ0JBQWlDLEVBQzVFLEtBQWlCLEVBQVUsU0FBb0I7UUFEL0MscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFpQjtRQUFVLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBaUI7UUFDNUUsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUFVLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFQbkQsb0JBQWUsR0FBZ0MsSUFBSSxDQUFDO1FBQ3BELG9CQUFlLEdBQXFDLElBQUksQ0FBQztRQUN6RCxvQkFBZSxHQUFhLEVBQUUsQ0FBQztRQUMvQixjQUFTLEdBQTBCLElBQUksQ0FBQztJQUljLENBQUM7SUFJL0Qsc0JBQUksMEJBQUs7YUFBVCxVQUFVLEtBQWE7WUFDckIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUMzRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN6QyxJ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QUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUEvQixDQUErQixDQUFDLENBQUM7YUFDNUU7U0FDRjtJQUNILENBQUM7SUFFTyw4QkFBWSxHQUFwQixVQUFxQixLQUFhLEVBQUUsT0FBZ0I7UUFBcEQsaUJBV0M7UUFWQyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JCLElBQUksS0FBSyxFQUFFO1lBQ1QsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLO2dCQUMvQixJQUFJLE9BQU8sRUFBRTtvQkFDWCxLQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDMUQ7cUJBQU07b0JBQ0wsS0FBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQzdEO1lBQ0gsQ0FBQyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7SUExR0Q7UUFEQyxLQUFLLENBQUMsT0FBTyxDQUFDOzs7d0NBTWQ7SUFHRDtRQURDLEtBQUssQ0FBQyxTQUFTLENBQUM7OzswQ0FpQmhCO0lBcENVLE9BQU87UUFEbkIsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBQyxDQUFDO3lDQVFILGVBQWUsRUFBNEIsZUFBZTtZQUNyRSxVQUFVLEVBQXFCLFNBQVM7T0FSaEQsT0FBTyxDQXVIbkI7SUFBRCxjQUFDO0NBQUEsQUF2SEQsSUF1SEM7U0F2SFksT0FBTyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBFbGVtZW50UmVmLCBJbnB1dCwgSXRlcmFibGVDaGFuZ2VzLCBJdGVyYWJsZURpZmZlciwgSXRlcmFibGVEaWZmZXJzLCBLZXlWYWx1ZUNoYW5nZXMsIEtleVZhbHVlRGlmZmVyLCBLZXlWYWx1ZURpZmZlcnMsIFJlbmRlcmVyMiwgybVpc0xpc3RMaWtlSXRlcmFibGUgYXMgaXNMaXN0TGlrZUl0ZXJhYmxlLCDJtXN0cmluZ2lmeSBhcyBzdHJpbmdpZnl9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG50eXBlIE5nQ2xhc3NTdXBwb3J0ZWRUeXBlcyA9IHN0cmluZ1tdIHwgU2V0PHN0cmluZz58IHtba2xhc3M6IHN0cmluZ106IGFueX0gfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCInZmlyc3Qgc2Vjb25kJ1wiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cIlsnZmlyc3QnLCAnc2Vjb25kJ11cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2ZpcnN0JzogdHJ1ZSwgJ3NlY29uZCc6IHRydWUsICd0aGlyZCc6IGZhbHNlfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cInN0cmluZ0V4cHxhcnJheUV4cHxvYmpFeHBcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2NsYXNzMSBjbGFzczIgY2xhc3MzJyA6IHRydWV9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBZGRzIGFuZCByZW1vdmVzIENTUyBjbGFzc2VzIG9uIGFuIEhUTUwgZWxlbWVudC5cbiAqXG4gKiBUaGUgQ1NTIGNsYXNzZXMgYXJlIHVwZGF0ZWQgYXMgZm9sbG93cywgZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIHRoZSBleHByZXNzaW9uIGV2YWx1YXRpb246XG4gKiAtIGBzdHJpbmdgIC0gdGhlIENTUyBjbGFzc2VzIGxpc3RlZCBpbiB0aGUgc3RyaW5nIChzcGFjZSBkZWxpbWl0ZWQpIGFyZSBhZGRlZCxcbiAqIC0gYEFycmF5YCAtIHRoZSBDU1MgY2xhc3NlcyBkZWNsYXJlZCBhcyBBcnJheSBlbGVtZW50cyBhcmUgYWRkZWQsXG4gKiAtIGBPYmplY3RgIC0ga2V5cyBhcmUgQ1NTIGNsYXNzZXMgdGhhdCBnZXQgYWRkZWQgd2hlbiB0aGUgZXhwcmVzc2lvbiBnaXZlbiBpbiB0aGUgdmFsdWVcbiAqICAgICAgICAgICAgICBldmFsdWF0ZXMgdG8gYSB0cnV0aHkgdmFsdWUsIG90aGVyd2lzZSB0aGV5IGFyZSByZW1vdmVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdDbGFzc10nfSlcbmV4cG9ydCBjbGFzcyBOZ0NsYXNzIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIHByaXZhdGUgX2l0ZXJhYmxlRGlmZmVyOiBJdGVyYWJsZURpZmZlcjxzdHJpbmc+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9rZXlWYWx1ZURpZmZlcjogS2V5VmFsdWVEaWZmZXI8c3RyaW5nLCBhbnk+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9pbml0aWFsQ2xhc3Nlczogc3RyaW5nW10gPSBbXTtcbiAgcHJpdmF0ZSBfcmF3Q2xhc3M6IE5nQ2xhc3NTdXBwb3J0ZWRUeXBlcyA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9pdGVyYWJsZURpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycywgcHJpdmF0ZSBfa2V5VmFsdWVEaWZmZXJzOiBLZXlWYWx1ZURpZmZlcnMsXG4gICAgICBwcml2YXRlIF9uZ0VsOiBFbGVtZW50UmVmLCBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIyKSB7fVxuXG5cbiAgQElucHV0KCdjbGFzcycpXG4gIHNldCBrbGFzcyh2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fcmVtb3ZlQ2xhc3Nlcyh0aGlzLl9pbml0aWFsQ2xhc3Nlcyk7XG4gICAgdGhpcy5faW5pdGlhbENsYXNzZXMgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUuc3BsaXQoL1xccysvKSA6IFtdO1xuICAgIHRoaXMuX2FwcGx5Q2xhc3Nlcyh0aGlzLl9pbml0aWFsQ2xhc3Nlcyk7XG4gICAgdGhpcy5fYXBwbHlDbGFzc2VzKHRoaXMuX3Jhd0NsYXNzKTtcbiAgfVxuXG4gIEBJbnB1dCgnbmdDbGFzcycpXG4gIHNldCBuZ0NsYXNzKHZhbHVlOiBzdHJpbmd8c3RyaW5nW118U2V0PHN0cmluZz58e1trbGFzczogc3RyaW5nXTogYW55fSkge1xuICAgIHRoaXMuX3JlbW92ZUNsYXNzZXModGhpcy5fcmF3Q2xhc3MpO1xuICAgIHRoaXMuX2FwcGx5Q2xhc3Nlcyh0aGlzLl9pbml0aWFsQ2xhc3Nlcyk7XG5cbiAgICB0aGlzLl9pdGVyYWJsZURpZmZlciA9IG51bGw7XG4gICAgdGhpcy5fa2V5VmFsdWVEaWZmZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fcmF3Q2xhc3MgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUuc3BsaXQoL1xccysvKSA6IHZhbHVlO1xuXG4gICAgaWYgKHRoaXMuX3Jhd0NsYXNzKSB7XG4gICAgICBpZiAoaXNMaXN0TGlrZUl0ZXJhYmxlKHRoaXMuX3Jhd0NsYXNzKSkge1xuICAgICAgICB0aGlzLl9pdGVyYWJsZURpZmZlciA9IHRoaXMuX2l0ZXJhYmxlRGlmZmVycy5maW5kKHRoaXMuX3Jhd0NsYXNzKS5jcmVhdGUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2tleVZhbHVlRGlmZmVyID0gdGhpcy5fa2V5VmFsdWVEaWZmZXJzLmZpbmQodGhpcy5fcmF3Q2xhc3MpLmNyZWF0ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG5nRG9DaGVjaygpIHtcbiAgICBpZiAodGhpcy5faXRlcmFibGVEaWZmZXIpIHtcbiAgICAgIGNvbnN0IGl0ZXJhYmxlQ2hhbmdlcyA9IHRoaXMuX2l0ZXJhYmxlRGlmZmVyLmRpZmYodGhpcy5fcmF3Q2xhc3MgYXMgc3RyaW5nW10pO1xuICAgICAgaWYgKGl0ZXJhYmxlQ2hhbmdlcykge1xuICAgICAgICB0aGlzLl9hcHBseUl0ZXJhYmxlQ2hhbmdlcyhpdGVyYWJsZUNoYW5nZXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fa2V5VmFsdWVEaWZmZXIpIHtcbiAgICAgIGNvbnN0IGtleVZhbHVlQ2hhbmdlcyA9IHRoaXMuX2tleVZhbHVlRGlmZmVyLmRpZmYodGhpcy5fcmF3Q2xhc3MgYXN7W2s6IHN0cmluZ106IGFueX0pO1xuICAgICAgaWYgKGtleVZhbHVlQ2hhbmdlcykge1xuICAgICAgICB0aGlzLl9hcHBseUtleVZhbHVlQ2hhbmdlcyhrZXlWYWx1ZUNoYW5nZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5S2V5VmFsdWVDaGFuZ2VzKGNoYW5nZXM6IEtleVZhbHVlQ2hhbmdlczxzdHJpbmcsIGFueT4pOiB2b2lkIHtcbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oKHJlY29yZCkgPT4gdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSkpO1xuICAgIGNoYW5nZXMuZm9yRWFjaENoYW5nZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpKTtcbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbSgocmVjb3JkKSA9PiB7XG4gICAgICBpZiAocmVjb3JkLnByZXZpb3VzVmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLmtleSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlJdGVyYWJsZUNoYW5nZXMoY2hhbmdlczogSXRlcmFibGVDaGFuZ2VzPHN0cmluZz4pOiB2b2lkIHtcbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oKHJlY29yZCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiByZWNvcmQuaXRlbSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLml0ZW0sIHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYE5nQ2xhc3MgY2FuIG9ubHkgdG9nZ2xlIENTUyBjbGFzc2VzIGV4cHJlc3NlZCBhcyBzdHJpbmdzLCBnb3QgJHtzdHJpbmdpZnkocmVjb3JkLml0ZW0pfWApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oKHJlY29yZCkgPT4gdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLml0ZW0sIGZhbHNlKSk7XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyBhIGNvbGxlY3Rpb24gb2YgQ1NTIGNsYXNzZXMgdG8gdGhlIERPTSBlbGVtZW50LlxuICAgKlxuICAgKiBGb3IgYXJndW1lbnQgb2YgdHlwZSBTZXQgYW5kIEFycmF5IENTUyBjbGFzcyBuYW1lcyBjb250YWluZWQgaW4gdGhvc2UgY29sbGVjdGlvbnMgYXJlIGFsd2F5c1xuICAgKiBhZGRlZC5cbiAgICogRm9yIGFyZ3VtZW50IG9mIHR5cGUgTWFwIENTUyBjbGFzcyBuYW1lIGluIHRoZSBtYXAncyBrZXkgaXMgdG9nZ2xlZCBiYXNlZCBvbiB0aGUgdmFsdWUgKGFkZGVkXG4gICAqIGZvciB0cnV0aHkgYW5kIHJlbW92ZWQgZm9yIGZhbHN5KS5cbiAgICovXG4gIHByaXZhdGUgX2FwcGx5Q2xhc3NlcyhyYXdDbGFzc1ZhbDogTmdDbGFzc1N1cHBvcnRlZFR5cGVzKSB7XG4gICAgaWYgKHJhd0NsYXNzVmFsKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShyYXdDbGFzc1ZhbCkgfHwgcmF3Q2xhc3NWYWwgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgKDxhbnk+cmF3Q2xhc3NWYWwpLmZvckVhY2goKGtsYXNzOiBzdHJpbmcpID0+IHRoaXMuX3RvZ2dsZUNsYXNzKGtsYXNzLCB0cnVlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBPYmplY3Qua2V5cyhyYXdDbGFzc1ZhbCkuZm9yRWFjaChrbGFzcyA9PiB0aGlzLl90b2dnbGVDbGFzcyhrbGFzcywgISFyYXdDbGFzc1ZhbFtrbGFzc10pKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGNvbGxlY3Rpb24gb2YgQ1NTIGNsYXNzZXMgZnJvbSB0aGUgRE9NIGVsZW1lbnQuIFRoaXMgaXMgbW9zdGx5IHVzZWZ1bCBmb3IgY2xlYW51cFxuICAgKiBwdXJwb3Nlcy5cbiAgICovXG4gIHByaXZhdGUgX3JlbW92ZUNsYXNzZXMocmF3Q2xhc3NWYWw6IE5nQ2xhc3NTdXBwb3J0ZWRUeXBlcykge1xuICAgIGlmIChyYXdDbGFzc1ZhbCkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmF3Q2xhc3NWYWwpIHx8IHJhd0NsYXNzVmFsIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICg8YW55PnJhd0NsYXNzVmFsKS5mb3JFYWNoKChrbGFzczogc3RyaW5nKSA9PiB0aGlzLl90b2dnbGVDbGFzcyhrbGFzcywgZmFsc2UpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHJhd0NsYXNzVmFsKS5mb3JFYWNoKGtsYXNzID0+IHRoaXMuX3RvZ2dsZUNsYXNzKGtsYXNzLCBmYWxzZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3RvZ2dsZUNsYXNzKGtsYXNzOiBzdHJpbmcsIGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBrbGFzcyA9IGtsYXNzLnRyaW0oKTtcbiAgICBpZiAoa2xhc3MpIHtcbiAgICAgIGtsYXNzLnNwbGl0KC9cXHMrL2cpLmZvckVhY2goa2xhc3MgPT4ge1xuICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLmFkZENsYXNzKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwga2xhc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwga2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==