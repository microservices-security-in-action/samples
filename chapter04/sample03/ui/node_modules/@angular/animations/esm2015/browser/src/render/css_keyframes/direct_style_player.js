/**
 * @fileoverview added by tsickle
 * Generated from: packages/animations/browser/src/render/css_keyframes/direct_style_player.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NoopAnimationPlayer } from '@angular/animations';
import { hypenatePropsObject } from '../shared';
export class DirectStylePlayer extends NoopAnimationPlayer {
    /**
     * @param {?} element
     * @param {?} styles
     */
    constructor(element, styles) {
        super();
        this.element = element;
        this._startingStyles = {};
        this.__initialized = false;
        this._styles = hypenatePropsObject(styles);
    }
    /**
     * @return {?}
     */
    init() {
        if (this.__initialized || !this._startingStyles)
            return;
        this.__initialized = true;
        Object.keys(this._styles).forEach((/**
         * @param {?} prop
         * @return {?}
         */
        prop => {
            (/** @type {?} */ (this._startingStyles))[prop] = this.element.style[prop];
        }));
        super.init();
    }
    /**
     * @return {?}
     */
    play() {
        if (!this._startingStyles)
            return;
        this.init();
        Object.keys(this._styles)
            .forEach((/**
         * @param {?} prop
         * @return {?}
         */
        prop => this.element.style.setProperty(prop, this._styles[prop])));
        super.play();
    }
    /**
     * @return {?}
     */
    destroy() {
        if (!this._startingStyles)
            return;
        Object.keys(this._startingStyles).forEach((/**
         * @param {?} prop
         * @return {?}
         */
        prop => {
            /** @type {?} */
            const value = (/** @type {?} */ (this._startingStyles))[prop];
            if (value) {
                this.element.style.setProperty(prop, value);
            }
            else {
                this.element.style.removeProperty(prop);
            }
        }));
        this._startingStyles = null;
        super.destroy();
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    DirectStylePlayer.prototype._startingStyles;
    /**
     * @type {?}
     * @private
     */
    DirectStylePlayer.prototype.__initialized;
    /**
     * @type {?}
     * @private
     */
    DirectStylePlayer.prototype._styles;
    /** @type {?} */
    DirectStylePlayer.prototype.element;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0X3N0eWxlX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvcmVuZGVyL2Nzc19rZXlmcmFtZXMvZGlyZWN0X3N0eWxlX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFPQSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN4RCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFOUMsTUFBTSxPQUFPLGlCQUFrQixTQUFRLG1CQUFtQjs7Ozs7SUFLeEQsWUFBbUIsT0FBWSxFQUFFLE1BQTRCO1FBQzNELEtBQUssRUFBRSxDQUFDO1FBRFMsWUFBTyxHQUFQLE9BQU8sQ0FBSztRQUp2QixvQkFBZSxHQUE4QixFQUFFLENBQUM7UUFDaEQsa0JBQWEsR0FBRyxLQUFLLENBQUM7UUFLNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM3QyxDQUFDOzs7O0lBRUQsSUFBSTtRQUNGLElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlO1lBQUUsT0FBTztRQUN4RCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPOzs7O1FBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdkMsbUJBQUEsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFELENBQUMsRUFBQyxDQUFDO1FBQ0gsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2YsQ0FBQzs7OztJQUVELElBQUk7UUFDRixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWU7WUFBRSxPQUFPO1FBQ2xDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUNwQixPQUFPOzs7O1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDO1FBQy9FLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNmLENBQUM7Ozs7SUFFRCxPQUFPO1FBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlO1lBQUUsT0FBTztRQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxPQUFPOzs7O1FBQUMsSUFBSSxDQUFDLEVBQUU7O2tCQUN6QyxLQUFLLEdBQUcsbUJBQUEsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksQ0FBQztZQUMxQyxJQUFJLEtBQUssRUFBRTtnQkFDVCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQzdDO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN6QztRQUNILENBQUMsRUFBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFDNUIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2xCLENBQUM7Q0FDRjs7Ozs7O0lBdkNDLDRDQUF3RDs7Ozs7SUFDeEQsMENBQThCOzs7OztJQUM5QixvQ0FBc0M7O0lBRTFCLG9DQUFtQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Tm9vcEFuaW1hdGlvblBsYXllcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge2h5cGVuYXRlUHJvcHNPYmplY3R9IGZyb20gJy4uL3NoYXJlZCc7XG5cbmV4cG9ydCBjbGFzcyBEaXJlY3RTdHlsZVBsYXllciBleHRlbmRzIE5vb3BBbmltYXRpb25QbGF5ZXIge1xuICBwcml2YXRlIF9zdGFydGluZ1N0eWxlczoge1trZXk6IHN0cmluZ106IGFueX18bnVsbCA9IHt9O1xuICBwcml2YXRlIF9faW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfc3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudDogYW55LCBzdHlsZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9zdHlsZXMgPSBoeXBlbmF0ZVByb3BzT2JqZWN0KHN0eWxlcyk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIGlmICh0aGlzLl9faW5pdGlhbGl6ZWQgfHwgIXRoaXMuX3N0YXJ0aW5nU3R5bGVzKSByZXR1cm47XG4gICAgdGhpcy5fX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9zdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICB0aGlzLl9zdGFydGluZ1N0eWxlcyAhW3Byb3BdID0gdGhpcy5lbGVtZW50LnN0eWxlW3Byb3BdO1xuICAgIH0pO1xuICAgIHN1cGVyLmluaXQoKTtcbiAgfVxuXG4gIHBsYXkoKSB7XG4gICAgaWYgKCF0aGlzLl9zdGFydGluZ1N0eWxlcykgcmV0dXJuO1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIE9iamVjdC5rZXlzKHRoaXMuX3N0eWxlcylcbiAgICAgICAgLmZvckVhY2gocHJvcCA9PiB0aGlzLmVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkocHJvcCwgdGhpcy5fc3R5bGVzW3Byb3BdKSk7XG4gICAgc3VwZXIucGxheSgpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAoIXRoaXMuX3N0YXJ0aW5nU3R5bGVzKSByZXR1cm47XG4gICAgT2JqZWN0LmtleXModGhpcy5fc3RhcnRpbmdTdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX3N0YXJ0aW5nU3R5bGVzICFbcHJvcF07XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KHByb3AsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5yZW1vdmVQcm9wZXJ0eShwcm9wKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLl9zdGFydGluZ1N0eWxlcyA9IG51bGw7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG4iXX0=