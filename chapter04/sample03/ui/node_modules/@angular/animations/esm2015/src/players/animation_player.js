/**
 * @fileoverview added by tsickle
 * Generated from: packages/animations/src/players/animation_player.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { scheduleMicroTask } from '../util';
/**
 * Provides programmatic control of a reusable animation sequence,
 * built using the `build()` method of `AnimationBuilder`. The `build()` method
 * returns a factory, whose `create()` method instantiates and initializes this interface.
 *
 * @see `AnimationBuilder`
 * @see `AnimationFactory`
 * @see `animate()`
 *
 * \@publicApi
 * @record
 */
export function AnimationPlayer() { }
if (false) {
    /**
     * The parent of this player, if any.
     * @type {?}
     */
    AnimationPlayer.prototype.parentPlayer;
    /**
     * The total run time of the animation, in milliseconds.
     * @type {?}
     */
    AnimationPlayer.prototype.totalTime;
    /**
     * Provides a callback to invoke before the animation is destroyed.
     * @type {?|undefined}
     */
    AnimationPlayer.prototype.beforeDestroy;
    /**
     * \@internal
     * Internal
     * @type {?|undefined}
     */
    AnimationPlayer.prototype.triggerCallback;
    /**
     * \@internal
     * Internal
     * @type {?|undefined}
     */
    AnimationPlayer.prototype.disabled;
    /**
     * Provides a callback to invoke when the animation finishes.
     * @see `finish()`
     * @param {?} fn The callback function.
     * @return {?}
     */
    AnimationPlayer.prototype.onDone = function (fn) { };
    /**
     * Provides a callback to invoke when the animation starts.
     * @see `run()`
     * @param {?} fn The callback function.
     * @return {?}
     */
    AnimationPlayer.prototype.onStart = function (fn) { };
    /**
     * Provides a callback to invoke after the animation is destroyed.
     * @see `destroy()` / `beforeDestroy()`
     * @param {?} fn The callback function.
     * @return {?}
     */
    AnimationPlayer.prototype.onDestroy = function (fn) { };
    /**
     * Initializes the animation.
     * @return {?}
     */
    AnimationPlayer.prototype.init = function () { };
    /**
     * Reports whether the animation has started.
     * @return {?} True if the animation has started, false otherwise.
     */
    AnimationPlayer.prototype.hasStarted = function () { };
    /**
     * Runs the animation, invoking the `onStart()` callback.
     * @return {?}
     */
    AnimationPlayer.prototype.play = function () { };
    /**
     * Pauses the animation.
     * @return {?}
     */
    AnimationPlayer.prototype.pause = function () { };
    /**
     * Restarts the paused animation.
     * @return {?}
     */
    AnimationPlayer.prototype.restart = function () { };
    /**
     * Ends the animation, invoking the `onDone()` callback.
     * @return {?}
     */
    AnimationPlayer.prototype.finish = function () { };
    /**
     * Destroys the animation, after invoking the `beforeDestroy()` callback.
     * Calls the `onDestroy()` callback when destruction is completed.
     * @return {?}
     */
    AnimationPlayer.prototype.destroy = function () { };
    /**
     * Resets the animation to its initial state.
     * @return {?}
     */
    AnimationPlayer.prototype.reset = function () { };
    /**
     * Sets the position of the animation.
     * @param {?} position A 0-based offset into the duration, in milliseconds.
     * @return {?}
     */
    AnimationPlayer.prototype.setPosition = function (position) { };
    /**
     * Reports the current position of the animation.
     * @return {?} A 0-based offset into the duration, in milliseconds.
     */
    AnimationPlayer.prototype.getPosition = function () { };
}
/**
 * An empty programmatic controller for reusable animations.
 * Used internally when animations are disabled, to avoid
 * checking for the null case when an animation player is expected.
 *
 * @see `animate()`
 * @see `AnimationPlayer`
 * @see `GroupPlayer`
 *
 * \@publicApi
 */
export class NoopAnimationPlayer {
    /**
     * @param {?=} duration
     * @param {?=} delay
     */
    constructor(duration = 0, delay = 0) {
        this._onDoneFns = [];
        this._onStartFns = [];
        this._onDestroyFns = [];
        this._started = false;
        this._destroyed = false;
        this._finished = false;
        this.parentPlayer = null;
        this.totalTime = duration + delay;
    }
    /**
     * @private
     * @return {?}
     */
    _onFinish() {
        if (!this._finished) {
            this._finished = true;
            this._onDoneFns.forEach((/**
             * @param {?} fn
             * @return {?}
             */
            fn => fn()));
            this._onDoneFns = [];
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onStart(fn) { this._onStartFns.push(fn); }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDone(fn) { this._onDoneFns.push(fn); }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDestroy(fn) { this._onDestroyFns.push(fn); }
    /**
     * @return {?}
     */
    hasStarted() { return this._started; }
    /**
     * @return {?}
     */
    init() { }
    /**
     * @return {?}
     */
    play() {
        if (!this.hasStarted()) {
            this._onStart();
            this.triggerMicrotask();
        }
        this._started = true;
    }
    /**
     * \@internal
     * @return {?}
     */
    triggerMicrotask() { scheduleMicroTask((/**
     * @return {?}
     */
    () => this._onFinish())); }
    /**
     * @private
     * @return {?}
     */
    _onStart() {
        this._onStartFns.forEach((/**
         * @param {?} fn
         * @return {?}
         */
        fn => fn()));
        this._onStartFns = [];
    }
    /**
     * @return {?}
     */
    pause() { }
    /**
     * @return {?}
     */
    restart() { }
    /**
     * @return {?}
     */
    finish() { this._onFinish(); }
    /**
     * @return {?}
     */
    destroy() {
        if (!this._destroyed) {
            this._destroyed = true;
            if (!this.hasStarted()) {
                this._onStart();
            }
            this.finish();
            this._onDestroyFns.forEach((/**
             * @param {?} fn
             * @return {?}
             */
            fn => fn()));
            this._onDestroyFns = [];
        }
    }
    /**
     * @return {?}
     */
    reset() { }
    /**
     * @param {?} position
     * @return {?}
     */
    setPosition(position) { }
    /**
     * @return {?}
     */
    getPosition() { return 0; }
    /**
     * \@internal
     * @param {?} phaseName
     * @return {?}
     */
    triggerCallback(phaseName) {
        /** @type {?} */
        const methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach((/**
         * @param {?} fn
         * @return {?}
         */
        fn => fn()));
        methods.length = 0;
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    NoopAnimationPlayer.prototype._onDoneFns;
    /**
     * @type {?}
     * @private
     */
    NoopAnimationPlayer.prototype._onStartFns;
    /**
     * @type {?}
     * @private
     */
    NoopAnimationPlayer.prototype._onDestroyFns;
    /**
     * @type {?}
     * @private
     */
    NoopAnimationPlayer.prototype._started;
    /**
     * @type {?}
     * @private
     */
    NoopAnimationPlayer.prototype._destroyed;
    /**
     * @type {?}
     * @private
     */
    NoopAnimationPlayer.prototype._finished;
    /** @type {?} */
    NoopAnimationPlayer.prototype.parentPlayer;
    /** @type {?} */
    NoopAnimationPlayer.prototype.totalTime;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvc3JjL3BsYXllcnMvYW5pbWF0aW9uX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFPQSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxTQUFTLENBQUM7Ozs7Ozs7Ozs7Ozs7QUFhMUMscUNBb0ZDOzs7Ozs7SUFqQkMsdUNBQW1DOzs7OztJQUluQyxvQ0FBMkI7Ozs7O0lBSTNCLHdDQUEwQjs7Ozs7O0lBSTFCLDBDQUE4Qzs7Ozs7O0lBSTlDLG1DQUFtQjs7Ozs7OztJQTdFbkIscURBQTZCOzs7Ozs7O0lBTTdCLHNEQUE4Qjs7Ozs7OztJQU85Qix3REFBZ0M7Ozs7O0lBSWhDLGlEQUFhOzs7OztJQUtiLHVEQUFzQjs7Ozs7SUFJdEIsaURBQWE7Ozs7O0lBSWIsa0RBQWM7Ozs7O0lBSWQsb0RBQWdCOzs7OztJQUloQixtREFBZTs7Ozs7O0lBS2Ysb0RBQWdCOzs7OztJQUloQixrREFBYzs7Ozs7O0lBS2QsZ0VBQW1EOzs7OztJQUtuRCx3REFBc0I7Ozs7Ozs7Ozs7Ozs7QUFrQ3hCLE1BQU0sT0FBTyxtQkFBbUI7Ozs7O0lBUzlCLFlBQVksV0FBbUIsQ0FBQyxFQUFFLFFBQWdCLENBQUM7UUFSM0MsZUFBVSxHQUFlLEVBQUUsQ0FBQztRQUM1QixnQkFBVyxHQUFlLEVBQUUsQ0FBQztRQUM3QixrQkFBYSxHQUFlLEVBQUUsQ0FBQztRQUMvQixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFDbkIsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUNuQixpQkFBWSxHQUF5QixJQUFJLENBQUM7UUFFTSxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFBQyxDQUFDOzs7OztJQUNuRixTQUFTO1FBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDdEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPOzs7O1lBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1NBQ3RCO0lBQ0gsQ0FBQzs7Ozs7SUFDRCxPQUFPLENBQUMsRUFBYyxJQUFVLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFDNUQsTUFBTSxDQUFDLEVBQWMsSUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBQzFELFNBQVMsQ0FBQyxFQUFjLElBQVUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7O0lBQ2hFLFVBQVUsS0FBYyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOzs7O0lBQy9DLElBQUksS0FBVSxDQUFDOzs7O0lBQ2YsSUFBSTtRQUNGLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDdEIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDdkIsQ0FBQzs7Ozs7SUFHRCxnQkFBZ0IsS0FBSyxpQkFBaUI7OztJQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFFekQsUUFBUTtRQUNkLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTzs7OztRQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUN4QixDQUFDOzs7O0lBRUQsS0FBSyxLQUFVLENBQUM7Ozs7SUFDaEIsT0FBTyxLQUFVLENBQUM7Ozs7SUFDbEIsTUFBTSxLQUFXLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7Ozs7SUFDcEMsT0FBTztRQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNqQjtZQUNELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTzs7OztZQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztTQUN6QjtJQUNILENBQUM7Ozs7SUFDRCxLQUFLLEtBQVUsQ0FBQzs7Ozs7SUFDaEIsV0FBVyxDQUFDLFFBQWdCLElBQVMsQ0FBQzs7OztJQUN0QyxXQUFXLEtBQWEsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7Ozs7SUFHbkMsZUFBZSxDQUFDLFNBQWlCOztjQUN6QixPQUFPLEdBQUcsU0FBUyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVU7UUFDekUsT0FBTyxDQUFDLE9BQU87Ozs7UUFBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFDLENBQUM7UUFDNUIsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQztDQUNGOzs7Ozs7SUE3REMseUNBQW9DOzs7OztJQUNwQywwQ0FBcUM7Ozs7O0lBQ3JDLDRDQUF1Qzs7Ozs7SUFDdkMsdUNBQXlCOzs7OztJQUN6Qix5Q0FBMkI7Ozs7O0lBQzNCLHdDQUEwQjs7SUFDMUIsMkNBQWlEOztJQUNqRCx3Q0FBa0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3NjaGVkdWxlTWljcm9UYXNrfSBmcm9tICcuLi91dGlsJztcblxuLyoqXG4gKiBQcm92aWRlcyBwcm9ncmFtbWF0aWMgY29udHJvbCBvZiBhIHJldXNhYmxlIGFuaW1hdGlvbiBzZXF1ZW5jZSxcbiAqIGJ1aWx0IHVzaW5nIHRoZSBgYnVpbGQoKWAgbWV0aG9kIG9mIGBBbmltYXRpb25CdWlsZGVyYC4gVGhlIGBidWlsZCgpYCBtZXRob2RcbiAqIHJldHVybnMgYSBmYWN0b3J5LCB3aG9zZSBgY3JlYXRlKClgIG1ldGhvZCBpbnN0YW50aWF0ZXMgYW5kIGluaXRpYWxpemVzIHRoaXMgaW50ZXJmYWNlLlxuICpcbiAqIEBzZWUgYEFuaW1hdGlvbkJ1aWxkZXJgXG4gKiBAc2VlIGBBbmltYXRpb25GYWN0b3J5YFxuICogQHNlZSBgYW5pbWF0ZSgpYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25QbGF5ZXIge1xuICAvKipcbiAgICogUHJvdmlkZXMgYSBjYWxsYmFjayB0byBpbnZva2Ugd2hlbiB0aGUgYW5pbWF0aW9uIGZpbmlzaGVzLlxuICAgKiBAcGFyYW0gZm4gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgKiBAc2VlIGBmaW5pc2goKWBcbiAgICovXG4gIG9uRG9uZShmbjogKCkgPT4gdm9pZCk6IHZvaWQ7XG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIGNhbGxiYWNrIHRvIGludm9rZSB3aGVuIHRoZSBhbmltYXRpb24gc3RhcnRzLlxuICAgKiBAcGFyYW0gZm4gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgKiBAc2VlIGBydW4oKWBcbiAgICovXG4gIG9uU3RhcnQoZm46ICgpID0+IHZvaWQpOiB2b2lkO1xuICAvKipcbiAgICogUHJvdmlkZXMgYSBjYWxsYmFjayB0byBpbnZva2UgYWZ0ZXIgdGhlIGFuaW1hdGlvbiBpcyBkZXN0cm95ZWQuXG4gICAqIEBwYXJhbSBmbiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAqIEBzZWUgYGRlc3Ryb3koKWBcbiAgICogQHNlZSBgYmVmb3JlRGVzdHJveSgpYFxuICAgKi9cbiAgb25EZXN0cm95KGZuOiAoKSA9PiB2b2lkKTogdm9pZDtcbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBhbmltYXRpb24uXG4gICAqL1xuICBpbml0KCk6IHZvaWQ7XG4gIC8qKlxuICAgKiBSZXBvcnRzIHdoZXRoZXIgdGhlIGFuaW1hdGlvbiBoYXMgc3RhcnRlZC5cbiAgICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgYW5pbWF0aW9uIGhhcyBzdGFydGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gICAqL1xuICBoYXNTdGFydGVkKCk6IGJvb2xlYW47XG4gIC8qKlxuICAgKiBSdW5zIHRoZSBhbmltYXRpb24sIGludm9raW5nIHRoZSBgb25TdGFydCgpYCBjYWxsYmFjay5cbiAgICovXG4gIHBsYXkoKTogdm9pZDtcbiAgLyoqXG4gICAqIFBhdXNlcyB0aGUgYW5pbWF0aW9uLlxuICAgKi9cbiAgcGF1c2UoKTogdm9pZDtcbiAgLyoqXG4gICAqIFJlc3RhcnRzIHRoZSBwYXVzZWQgYW5pbWF0aW9uLlxuICAgKi9cbiAgcmVzdGFydCgpOiB2b2lkO1xuICAvKipcbiAgICogRW5kcyB0aGUgYW5pbWF0aW9uLCBpbnZva2luZyB0aGUgYG9uRG9uZSgpYCBjYWxsYmFjay5cbiAgICovXG4gIGZpbmlzaCgpOiB2b2lkO1xuICAvKipcbiAgICogRGVzdHJveXMgdGhlIGFuaW1hdGlvbiwgYWZ0ZXIgaW52b2tpbmcgdGhlIGBiZWZvcmVEZXN0cm95KClgIGNhbGxiYWNrLlxuICAgKiBDYWxscyB0aGUgYG9uRGVzdHJveSgpYCBjYWxsYmFjayB3aGVuIGRlc3RydWN0aW9uIGlzIGNvbXBsZXRlZC5cbiAgICovXG4gIGRlc3Ryb3koKTogdm9pZDtcbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgYW5pbWF0aW9uIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxuICAgKi9cbiAgcmVzZXQoKTogdm9pZDtcbiAgLyoqXG4gICAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBhbmltYXRpb24uXG4gICAqIEBwYXJhbSBwb3NpdGlvbiBBIDAtYmFzZWQgb2Zmc2V0IGludG8gdGhlIGR1cmF0aW9uLCBpbiBtaWxsaXNlY29uZHMuXG4gICAqL1xuICBzZXRQb3NpdGlvbihwb3NpdGlvbjogYW55IC8qKiBUT0RPICM5MTAwICovKTogdm9pZDtcbiAgLyoqXG4gICAqIFJlcG9ydHMgdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGFuaW1hdGlvbi5cbiAgICogQHJldHVybnMgQSAwLWJhc2VkIG9mZnNldCBpbnRvIHRoZSBkdXJhdGlvbiwgaW4gbWlsbGlzZWNvbmRzLlxuICAgKi9cbiAgZ2V0UG9zaXRpb24oKTogbnVtYmVyO1xuICAvKipcbiAgICogVGhlIHBhcmVudCBvZiB0aGlzIHBsYXllciwgaWYgYW55LlxuICAgKi9cbiAgcGFyZW50UGxheWVyOiBBbmltYXRpb25QbGF5ZXJ8bnVsbDtcbiAgLyoqXG4gICAqIFRoZSB0b3RhbCBydW4gdGltZSBvZiB0aGUgYW5pbWF0aW9uLCBpbiBtaWxsaXNlY29uZHMuXG4gICAqL1xuICByZWFkb25seSB0b3RhbFRpbWU6IG51bWJlcjtcbiAgLyoqXG4gICAqIFByb3ZpZGVzIGEgY2FsbGJhY2sgdG8gaW52b2tlIGJlZm9yZSB0aGUgYW5pbWF0aW9uIGlzIGRlc3Ryb3llZC5cbiAgICovXG4gIGJlZm9yZURlc3Ryb3k/OiAoKSA9PiBhbnk7XG4gIC8qKiBAaW50ZXJuYWxcbiAgICogSW50ZXJuYWxcbiAgICovXG4gIHRyaWdnZXJDYWxsYmFjaz86IChwaGFzZU5hbWU6IHN0cmluZykgPT4gdm9pZDtcbiAgLyoqIEBpbnRlcm5hbFxuICAgKiBJbnRlcm5hbFxuICAgKi9cbiAgZGlzYWJsZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIEFuIGVtcHR5IHByb2dyYW1tYXRpYyBjb250cm9sbGVyIGZvciByZXVzYWJsZSBhbmltYXRpb25zLlxuICogVXNlZCBpbnRlcm5hbGx5IHdoZW4gYW5pbWF0aW9ucyBhcmUgZGlzYWJsZWQsIHRvIGF2b2lkXG4gKiBjaGVja2luZyBmb3IgdGhlIG51bGwgY2FzZSB3aGVuIGFuIGFuaW1hdGlvbiBwbGF5ZXIgaXMgZXhwZWN0ZWQuXG4gKlxuICogQHNlZSBgYW5pbWF0ZSgpYFxuICogQHNlZSBgQW5pbWF0aW9uUGxheWVyYFxuICogQHNlZSBgR3JvdXBQbGF5ZXJgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTm9vcEFuaW1hdGlvblBsYXllciBpbXBsZW1lbnRzIEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX29uRG9uZUZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9vblN0YXJ0Rm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX29uRGVzdHJveUZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9zdGFydGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuICBwcml2YXRlIF9maW5pc2hlZCA9IGZhbHNlO1xuICBwdWJsaWMgcGFyZW50UGxheWVyOiBBbmltYXRpb25QbGF5ZXJ8bnVsbCA9IG51bGw7XG4gIHB1YmxpYyByZWFkb25seSB0b3RhbFRpbWU6IG51bWJlcjtcbiAgY29uc3RydWN0b3IoZHVyYXRpb246IG51bWJlciA9IDAsIGRlbGF5OiBudW1iZXIgPSAwKSB7IHRoaXMudG90YWxUaW1lID0gZHVyYXRpb24gKyBkZWxheTsgfVxuICBwcml2YXRlIF9vbkZpbmlzaCgpIHtcbiAgICBpZiAoIXRoaXMuX2ZpbmlzaGVkKSB7XG4gICAgICB0aGlzLl9maW5pc2hlZCA9IHRydWU7XG4gICAgICB0aGlzLl9vbkRvbmVGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIHRoaXMuX29uRG9uZUZucyA9IFtdO1xuICAgIH1cbiAgfVxuICBvblN0YXJ0KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uU3RhcnRGbnMucHVzaChmbik7IH1cbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uRG9uZUZucy5wdXNoKGZuKTsgfVxuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fb25EZXN0cm95Rm5zLnB1c2goZm4pOyB9XG4gIGhhc1N0YXJ0ZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9zdGFydGVkOyB9XG4gIGluaXQoKTogdm9pZCB7fVxuICBwbGF5KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgIHRoaXMuX29uU3RhcnQoKTtcbiAgICAgIHRoaXMudHJpZ2dlck1pY3JvdGFzaygpO1xuICAgIH1cbiAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlck1pY3JvdGFzaygpIHsgc2NoZWR1bGVNaWNyb1Rhc2soKCkgPT4gdGhpcy5fb25GaW5pc2goKSk7IH1cblxuICBwcml2YXRlIF9vblN0YXJ0KCkge1xuICAgIHRoaXMuX29uU3RhcnRGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICB0aGlzLl9vblN0YXJ0Rm5zID0gW107XG4gIH1cblxuICBwYXVzZSgpOiB2b2lkIHt9XG4gIHJlc3RhcnQoKTogdm9pZCB7fVxuICBmaW5pc2goKTogdm9pZCB7IHRoaXMuX29uRmluaXNoKCk7IH1cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgIGlmICghdGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgICAgdGhpcy5fb25TdGFydCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5maW5pc2goKTtcbiAgICAgIHRoaXMuX29uRGVzdHJveUZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgICAgdGhpcy5fb25EZXN0cm95Rm5zID0gW107XG4gICAgfVxuICB9XG4gIHJlc2V0KCk6IHZvaWQge31cbiAgc2V0UG9zaXRpb24ocG9zaXRpb246IG51bWJlcik6IHZvaWQge31cbiAgZ2V0UG9zaXRpb24oKTogbnVtYmVyIHsgcmV0dXJuIDA7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIHRyaWdnZXJDYWxsYmFjayhwaGFzZU5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG1ldGhvZHMgPSBwaGFzZU5hbWUgPT0gJ3N0YXJ0JyA/IHRoaXMuX29uU3RhcnRGbnMgOiB0aGlzLl9vbkRvbmVGbnM7XG4gICAgbWV0aG9kcy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIG1ldGhvZHMubGVuZ3RoID0gMDtcbiAgfVxufVxuIl19