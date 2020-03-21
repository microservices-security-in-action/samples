/**
 * @fileoverview added by tsickle
 * Generated from: packages/animations/browser/testing/src/mock_animation_driver.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AUTO_STYLE, NoopAnimationPlayer } from '@angular/animations';
import { ɵallowPreviousPlayerStylesMerge as allowPreviousPlayerStylesMerge, ɵcontainsElement as containsElement, ɵinvokeQuery as invokeQuery, ɵmatchesElement as matchesElement, ɵvalidateStyleProperty as validateStyleProperty } from '@angular/animations/browser';
/**
 * \@publicApi
 */
export class MockAnimationDriver {
    /**
     * @param {?} prop
     * @return {?}
     */
    validateStyleProperty(prop) { return validateStyleProperty(prop); }
    /**
     * @param {?} element
     * @param {?} selector
     * @return {?}
     */
    matchesElement(element, selector) {
        return matchesElement(element, selector);
    }
    /**
     * @param {?} elm1
     * @param {?} elm2
     * @return {?}
     */
    containsElement(elm1, elm2) { return containsElement(elm1, elm2); }
    /**
     * @param {?} element
     * @param {?} selector
     * @param {?} multi
     * @return {?}
     */
    query(element, selector, multi) {
        return invokeQuery(element, selector, multi);
    }
    /**
     * @param {?} element
     * @param {?} prop
     * @param {?=} defaultValue
     * @return {?}
     */
    computeStyle(element, prop, defaultValue) {
        return defaultValue || '';
    }
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @return {?}
     */
    animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
        /** @type {?} */
        const player = new MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers);
        MockAnimationDriver.log.push((/** @type {?} */ (player)));
        return player;
    }
}
MockAnimationDriver.log = [];
if (false) {
    /** @type {?} */
    MockAnimationDriver.log;
}
/**
 * \@publicApi
 */
export class MockAnimationPlayer extends NoopAnimationPlayer {
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?} previousPlayers
     */
    constructor(element, keyframes, duration, delay, easing, previousPlayers) {
        super(duration, delay);
        this.element = element;
        this.keyframes = keyframes;
        this.duration = duration;
        this.delay = delay;
        this.easing = easing;
        this.previousPlayers = previousPlayers;
        this.__finished = false;
        this.__started = false;
        this.previousStyles = {};
        this._onInitFns = [];
        this.currentSnapshot = {};
        if (allowPreviousPlayerStylesMerge(duration, delay)) {
            previousPlayers.forEach((/**
             * @param {?} player
             * @return {?}
             */
            player => {
                if (player instanceof MockAnimationPlayer) {
                    /** @type {?} */
                    const styles = player.currentSnapshot;
                    Object.keys(styles).forEach((/**
                     * @param {?} prop
                     * @return {?}
                     */
                    prop => this.previousStyles[prop] = styles[prop]));
                }
            }));
        }
    }
    /* @internal */
    /**
     * @param {?} fn
     * @return {?}
     */
    onInit(fn) { this._onInitFns.push(fn); }
    /* @internal */
    /**
     * @return {?}
     */
    init() {
        super.init();
        this._onInitFns.forEach((/**
         * @param {?} fn
         * @return {?}
         */
        fn => fn()));
        this._onInitFns = [];
    }
    /**
     * @return {?}
     */
    finish() {
        super.finish();
        this.__finished = true;
    }
    /**
     * @return {?}
     */
    destroy() {
        super.destroy();
        this.__finished = true;
    }
    /* @internal */
    /**
     * @return {?}
     */
    triggerMicrotask() { }
    /**
     * @return {?}
     */
    play() {
        super.play();
        this.__started = true;
    }
    /**
     * @return {?}
     */
    hasStarted() { return this.__started; }
    /**
     * @return {?}
     */
    beforeDestroy() {
        /** @type {?} */
        const captures = {};
        Object.keys(this.previousStyles).forEach((/**
         * @param {?} prop
         * @return {?}
         */
        prop => {
            captures[prop] = this.previousStyles[prop];
        }));
        if (this.hasStarted()) {
            // when assembling the captured styles, it's important that
            // we build the keyframe styles in the following order:
            // {other styles within keyframes, ... previousStyles }
            this.keyframes.forEach((/**
             * @param {?} kf
             * @return {?}
             */
            kf => {
                Object.keys(kf).forEach((/**
                 * @param {?} prop
                 * @return {?}
                 */
                prop => {
                    if (prop != 'offset') {
                        captures[prop] = this.__finished ? kf[prop] : AUTO_STYLE;
                    }
                }));
            }));
        }
        this.currentSnapshot = captures;
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    MockAnimationPlayer.prototype.__finished;
    /**
     * @type {?}
     * @private
     */
    MockAnimationPlayer.prototype.__started;
    /** @type {?} */
    MockAnimationPlayer.prototype.previousStyles;
    /**
     * @type {?}
     * @private
     */
    MockAnimationPlayer.prototype._onInitFns;
    /** @type {?} */
    MockAnimationPlayer.prototype.currentSnapshot;
    /** @type {?} */
    MockAnimationPlayer.prototype.element;
    /** @type {?} */
    MockAnimationPlayer.prototype.keyframes;
    /** @type {?} */
    MockAnimationPlayer.prototype.duration;
    /** @type {?} */
    MockAnimationPlayer.prototype.delay;
    /** @type {?} */
    MockAnimationPlayer.prototype.easing;
    /** @type {?} */
    MockAnimationPlayer.prototype.previousPlayers;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19hbmltYXRpb25fZHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3Rlc3Rpbmcvc3JjL21vY2tfYW5pbWF0aW9uX2RyaXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFPQSxPQUFPLEVBQUMsVUFBVSxFQUFtQixtQkFBbUIsRUFBYSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pHLE9BQU8sRUFBa0IsK0JBQStCLElBQUksOEJBQThCLEVBQUUsZ0JBQWdCLElBQUksZUFBZSxFQUFFLFlBQVksSUFBSSxXQUFXLEVBQUUsZUFBZSxJQUFJLGNBQWMsRUFBRSxzQkFBc0IsSUFBSSxxQkFBcUIsRUFBQyxNQUFNLDZCQUE2QixDQUFDOzs7O0FBTXJSLE1BQU0sT0FBTyxtQkFBbUI7Ozs7O0lBRzlCLHFCQUFxQixDQUFDLElBQVksSUFBYSxPQUFPLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7O0lBRXBGLGNBQWMsQ0FBQyxPQUFZLEVBQUUsUUFBZ0I7UUFDM0MsT0FBTyxjQUFjLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLENBQUM7Ozs7OztJQUVELGVBQWUsQ0FBQyxJQUFTLEVBQUUsSUFBUyxJQUFhLE9BQU8sZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7SUFFdEYsS0FBSyxDQUFDLE9BQVksRUFBRSxRQUFnQixFQUFFLEtBQWM7UUFDbEQsT0FBTyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMvQyxDQUFDOzs7Ozs7O0lBRUQsWUFBWSxDQUFDLE9BQVksRUFBRSxJQUFZLEVBQUUsWUFBcUI7UUFDNUQsT0FBTyxZQUFZLElBQUksRUFBRSxDQUFDO0lBQzVCLENBQUM7Ozs7Ozs7Ozs7SUFF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QUFDLElBQUksQ0FBQyxFQUFFO1lBQzlDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLENBQUMsRUFBQyxDQUFDO1FBRUgsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDckIsMkRBQTJEO1lBQzNELHVEQUF1RDtZQUN2RCx1REFBdUQ7WUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPOzs7O1lBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTzs7OztnQkFBQyxJQUFJLENBQUMsRUFBRTtvQkFDN0IsSUFBSSxJQUFJLElBQUksUUFBUSxFQUFFO3dCQUNwQixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7cUJBQzFEO2dCQUNILENBQUMsRUFBQyxDQUFDO1lBQ0wsQ0FBQyxFQUFDLENBQUM7U0FDSjtRQUVELElBQUksQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDO0lBQ2xDLENBQUM7Q0FDRjs7Ozs7O0lBMUVDLHlDQUEyQjs7Ozs7SUFDM0Isd0NBQTBCOztJQUMxQiw2Q0FBNkQ7Ozs7O0lBQzdELHlDQUF1Qzs7SUFDdkMsOENBQXdDOztJQUdwQyxzQ0FBbUI7O0lBQUUsd0NBQW9EOztJQUN6RSx1Q0FBdUI7O0lBQUUsb0NBQW9COztJQUFFLHFDQUFxQjs7SUFDcEUsOENBQTZCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBVVRPX1NUWUxFLCBBbmltYXRpb25QbGF5ZXIsIE5vb3BBbmltYXRpb25QbGF5ZXIsIMm1U3R5bGVEYXRhfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyLCDJtWFsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZSBhcyBhbGxvd1ByZXZpb3VzUGxheWVyU3R5bGVzTWVyZ2UsIMm1Y29udGFpbnNFbGVtZW50IGFzIGNvbnRhaW5zRWxlbWVudCwgybVpbnZva2VRdWVyeSBhcyBpbnZva2VRdWVyeSwgybVtYXRjaGVzRWxlbWVudCBhcyBtYXRjaGVzRWxlbWVudCwgybV2YWxpZGF0ZVN0eWxlUHJvcGVydHkgYXMgdmFsaWRhdGVTdHlsZVByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zL2Jyb3dzZXInO1xuXG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTW9ja0FuaW1hdGlvbkRyaXZlciBpbXBsZW1lbnRzIEFuaW1hdGlvbkRyaXZlciB7XG4gIHN0YXRpYyBsb2c6IEFuaW1hdGlvblBsYXllcltdID0gW107XG5cbiAgdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3A6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3ApOyB9XG5cbiAgbWF0Y2hlc0VsZW1lbnQoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG1hdGNoZXNFbGVtZW50KGVsZW1lbnQsIHNlbGVjdG9yKTtcbiAgfVxuXG4gIGNvbnRhaW5zRWxlbWVudChlbG0xOiBhbnksIGVsbTI6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gY29udGFpbnNFbGVtZW50KGVsbTEsIGVsbTIpOyB9XG5cbiAgcXVlcnkoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbik6IGFueVtdIHtcbiAgICByZXR1cm4gaW52b2tlUXVlcnkoZWxlbWVudCwgc2VsZWN0b3IsIG11bHRpKTtcbiAgfVxuXG4gIGNvbXB1dGVTdHlsZShlbGVtZW50OiBhbnksIHByb3A6IHN0cmluZywgZGVmYXVsdFZhbHVlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlIHx8ICcnO1xuICB9XG5cbiAgYW5pbWF0ZShcbiAgICAgIGVsZW1lbnQ6IGFueSwga2V5ZnJhbWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfVtdLCBkdXJhdGlvbjogbnVtYmVyLCBkZWxheTogbnVtYmVyLFxuICAgICAgZWFzaW5nOiBzdHJpbmcsIHByZXZpb3VzUGxheWVyczogYW55W10gPSBbXSk6IE1vY2tBbmltYXRpb25QbGF5ZXIge1xuICAgIGNvbnN0IHBsYXllciA9XG4gICAgICAgIG5ldyBNb2NrQW5pbWF0aW9uUGxheWVyKGVsZW1lbnQsIGtleWZyYW1lcywgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIHByZXZpb3VzUGxheWVycyk7XG4gICAgTW9ja0FuaW1hdGlvbkRyaXZlci5sb2cucHVzaCg8QW5pbWF0aW9uUGxheWVyPnBsYXllcik7XG4gICAgcmV0dXJuIHBsYXllcjtcbiAgfVxufVxuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE1vY2tBbmltYXRpb25QbGF5ZXIgZXh0ZW5kcyBOb29wQW5pbWF0aW9uUGxheWVyIHtcbiAgcHJpdmF0ZSBfX2ZpbmlzaGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX19zdGFydGVkID0gZmFsc2U7XG4gIHB1YmxpYyBwcmV2aW91c1N0eWxlczoge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn0gPSB7fTtcbiAgcHJpdmF0ZSBfb25Jbml0Rm5zOiAoKCkgPT4gYW55KVtdID0gW107XG4gIHB1YmxpYyBjdXJyZW50U25hcHNob3Q6IMm1U3R5bGVEYXRhID0ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgZWxlbWVudDogYW55LCBwdWJsaWMga2V5ZnJhbWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfVtdLFxuICAgICAgcHVibGljIGR1cmF0aW9uOiBudW1iZXIsIHB1YmxpYyBkZWxheTogbnVtYmVyLCBwdWJsaWMgZWFzaW5nOiBzdHJpbmcsXG4gICAgICBwdWJsaWMgcHJldmlvdXNQbGF5ZXJzOiBhbnlbXSkge1xuICAgIHN1cGVyKGR1cmF0aW9uLCBkZWxheSk7XG5cbiAgICBpZiAoYWxsb3dQcmV2aW91c1BsYXllclN0eWxlc01lcmdlKGR1cmF0aW9uLCBkZWxheSkpIHtcbiAgICAgIHByZXZpb3VzUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIGlmIChwbGF5ZXIgaW5zdGFuY2VvZiBNb2NrQW5pbWF0aW9uUGxheWVyKSB7XG4gICAgICAgICAgY29uc3Qgc3R5bGVzID0gcGxheWVyLmN1cnJlbnRTbmFwc2hvdDtcbiAgICAgICAgICBPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2gocHJvcCA9PiB0aGlzLnByZXZpb3VzU3R5bGVzW3Byb3BdID0gc3R5bGVzW3Byb3BdKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyogQGludGVybmFsICovXG4gIG9uSW5pdChmbjogKCkgPT4gYW55KSB7IHRoaXMuX29uSW5pdEZucy5wdXNoKGZuKTsgfVxuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICBpbml0KCkge1xuICAgIHN1cGVyLmluaXQoKTtcbiAgICB0aGlzLl9vbkluaXRGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICB0aGlzLl9vbkluaXRGbnMgPSBbXTtcbiAgfVxuXG4gIGZpbmlzaCgpOiB2b2lkIHtcbiAgICBzdXBlci5maW5pc2goKTtcbiAgICB0aGlzLl9fZmluaXNoZWQgPSB0cnVlO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gICAgdGhpcy5fX2ZpbmlzaGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICB0cmlnZ2VyTWljcm90YXNrKCkge31cblxuICBwbGF5KCk6IHZvaWQge1xuICAgIHN1cGVyLnBsYXkoKTtcbiAgICB0aGlzLl9fc3RhcnRlZCA9IHRydWU7XG4gIH1cblxuICBoYXNTdGFydGVkKCkgeyByZXR1cm4gdGhpcy5fX3N0YXJ0ZWQ7IH1cblxuICBiZWZvcmVEZXN0cm95KCkge1xuICAgIGNvbnN0IGNhcHR1cmVzOiDJtVN0eWxlRGF0YSA9IHt9O1xuXG4gICAgT2JqZWN0LmtleXModGhpcy5wcmV2aW91c1N0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNhcHR1cmVzW3Byb3BdID0gdGhpcy5wcmV2aW91c1N0eWxlc1twcm9wXTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLmhhc1N0YXJ0ZWQoKSkge1xuICAgICAgLy8gd2hlbiBhc3NlbWJsaW5nIHRoZSBjYXB0dXJlZCBzdHlsZXMsIGl0J3MgaW1wb3J0YW50IHRoYXRcbiAgICAgIC8vIHdlIGJ1aWxkIHRoZSBrZXlmcmFtZSBzdHlsZXMgaW4gdGhlIGZvbGxvd2luZyBvcmRlcjpcbiAgICAgIC8vIHtvdGhlciBzdHlsZXMgd2l0aGluIGtleWZyYW1lcywgLi4uIHByZXZpb3VzU3R5bGVzIH1cbiAgICAgIHRoaXMua2V5ZnJhbWVzLmZvckVhY2goa2YgPT4ge1xuICAgICAgICBPYmplY3Qua2V5cyhrZikuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgICBpZiAocHJvcCAhPSAnb2Zmc2V0Jykge1xuICAgICAgICAgICAgY2FwdHVyZXNbcHJvcF0gPSB0aGlzLl9fZmluaXNoZWQgPyBrZltwcm9wXSA6IEFVVE9fU1RZTEU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuY3VycmVudFNuYXBzaG90ID0gY2FwdHVyZXM7XG4gIH1cbn1cbiJdfQ==