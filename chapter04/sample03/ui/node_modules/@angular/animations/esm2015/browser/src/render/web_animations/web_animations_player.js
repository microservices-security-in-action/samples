/**
 * @fileoverview added by tsickle
 * Generated from: packages/animations/browser/src/render/web_animations/web_animations_player.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { computeStyle } from '../../util';
export class WebAnimationsPlayer {
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} options
     * @param {?=} _specialStyles
     */
    constructor(element, keyframes, options, _specialStyles) {
        this.element = element;
        this.keyframes = keyframes;
        this.options = options;
        this._specialStyles = _specialStyles;
        this._onDoneFns = [];
        this._onStartFns = [];
        this._onDestroyFns = [];
        this._initialized = false;
        this._finished = false;
        this._started = false;
        this._destroyed = false;
        this.time = 0;
        this.parentPlayer = null;
        this.currentSnapshot = {};
        this._duration = (/** @type {?} */ (options['duration']));
        this._delay = (/** @type {?} */ (options['delay'])) || 0;
        this.time = this._duration + this._delay;
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
     * @return {?}
     */
    init() {
        this._buildPlayer();
        this._preparePlayerBeforeStart();
    }
    /**
     * @private
     * @return {?}
     */
    _buildPlayer() {
        if (this._initialized)
            return;
        this._initialized = true;
        /** @type {?} */
        const keyframes = this.keyframes;
        ((/** @type {?} */ (this))).domPlayer =
            this._triggerWebAnimation(this.element, keyframes, this.options);
        this._finalKeyframe = keyframes.length ? keyframes[keyframes.length - 1] : {};
        this.domPlayer.addEventListener('finish', (/**
         * @return {?}
         */
        () => this._onFinish()));
    }
    /**
     * @private
     * @return {?}
     */
    _preparePlayerBeforeStart() {
        // this is required so that the player doesn't start to animate right away
        if (this._delay) {
            this._resetDomPlayerState();
        }
        else {
            this.domPlayer.pause();
        }
    }
    /**
     * \@internal
     * @param {?} element
     * @param {?} keyframes
     * @param {?} options
     * @return {?}
     */
    _triggerWebAnimation(element, keyframes, options) {
        // jscompiler doesn't seem to know animate is a native property because it's not fully
        // supported yet across common browsers (we polyfill it for Edge/Safari) [CL #143630929]
        return (/** @type {?} */ (element['animate'](keyframes, options)));
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
    play() {
        this._buildPlayer();
        if (!this.hasStarted()) {
            this._onStartFns.forEach((/**
             * @param {?} fn
             * @return {?}
             */
            fn => fn()));
            this._onStartFns = [];
            this._started = true;
            if (this._specialStyles) {
                this._specialStyles.start();
            }
        }
        this.domPlayer.play();
    }
    /**
     * @return {?}
     */
    pause() {
        this.init();
        this.domPlayer.pause();
    }
    /**
     * @return {?}
     */
    finish() {
        this.init();
        if (this._specialStyles) {
            this._specialStyles.finish();
        }
        this._onFinish();
        this.domPlayer.finish();
    }
    /**
     * @return {?}
     */
    reset() {
        this._resetDomPlayerState();
        this._destroyed = false;
        this._finished = false;
        this._started = false;
    }
    /**
     * @private
     * @return {?}
     */
    _resetDomPlayerState() {
        if (this.domPlayer) {
            this.domPlayer.cancel();
        }
    }
    /**
     * @return {?}
     */
    restart() {
        this.reset();
        this.play();
    }
    /**
     * @return {?}
     */
    hasStarted() { return this._started; }
    /**
     * @return {?}
     */
    destroy() {
        if (!this._destroyed) {
            this._destroyed = true;
            this._resetDomPlayerState();
            this._onFinish();
            if (this._specialStyles) {
                this._specialStyles.destroy();
            }
            this._onDestroyFns.forEach((/**
             * @param {?} fn
             * @return {?}
             */
            fn => fn()));
            this._onDestroyFns = [];
        }
    }
    /**
     * @param {?} p
     * @return {?}
     */
    setPosition(p) { this.domPlayer.currentTime = p * this.time; }
    /**
     * @return {?}
     */
    getPosition() { return this.domPlayer.currentTime / this.time; }
    /**
     * @return {?}
     */
    get totalTime() { return this._delay + this._duration; }
    /**
     * @return {?}
     */
    beforeDestroy() {
        /** @type {?} */
        const styles = {};
        if (this.hasStarted()) {
            Object.keys(this._finalKeyframe).forEach((/**
             * @param {?} prop
             * @return {?}
             */
            prop => {
                if (prop != 'offset') {
                    styles[prop] =
                        this._finished ? this._finalKeyframe[prop] : computeStyle(this.element, prop);
                }
            }));
        }
        this.currentSnapshot = styles;
    }
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
    WebAnimationsPlayer.prototype._onDoneFns;
    /**
     * @type {?}
     * @private
     */
    WebAnimationsPlayer.prototype._onStartFns;
    /**
     * @type {?}
     * @private
     */
    WebAnimationsPlayer.prototype._onDestroyFns;
    /**
     * @type {?}
     * @private
     */
    WebAnimationsPlayer.prototype._duration;
    /**
     * @type {?}
     * @private
     */
    WebAnimationsPlayer.prototype._delay;
    /**
     * @type {?}
     * @private
     */
    WebAnimationsPlayer.prototype._initialized;
    /**
     * @type {?}
     * @private
     */
    WebAnimationsPlayer.prototype._finished;
    /**
     * @type {?}
     * @private
     */
    WebAnimationsPlayer.prototype._started;
    /**
     * @type {?}
     * @private
     */
    WebAnimationsPlayer.prototype._destroyed;
    /**
     * @type {?}
     * @private
     */
    WebAnimationsPlayer.prototype._finalKeyframe;
    /** @type {?} */
    WebAnimationsPlayer.prototype.domPlayer;
    /** @type {?} */
    WebAnimationsPlayer.prototype.time;
    /** @type {?} */
    WebAnimationsPlayer.prototype.parentPlayer;
    /** @type {?} */
    WebAnimationsPlayer.prototype.currentSnapshot;
    /** @type {?} */
    WebAnimationsPlayer.prototype.element;
    /** @type {?} */
    WebAnimationsPlayer.prototype.keyframes;
    /** @type {?} */
    WebAnimationsPlayer.prototype.options;
    /**
     * @type {?}
     * @private
     */
    WebAnimationsPlayer.prototype._specialStyles;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViX2FuaW1hdGlvbnNfcGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvd2ViX2FuaW1hdGlvbnMvd2ViX2FuaW1hdGlvbnNfcGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBU0EsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLFlBQVksQ0FBQztBQUt4QyxNQUFNLE9BQU8sbUJBQW1COzs7Ozs7O0lBb0I5QixZQUNXLE9BQVksRUFBUyxTQUE2QyxFQUNsRSxPQUF5QyxFQUN4QyxjQUF3QztRQUZ6QyxZQUFPLEdBQVAsT0FBTyxDQUFLO1FBQVMsY0FBUyxHQUFULFNBQVMsQ0FBb0M7UUFDbEUsWUFBTyxHQUFQLE9BQU8sQ0FBa0M7UUFDeEMsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1FBdEI1QyxlQUFVLEdBQWUsRUFBRSxDQUFDO1FBQzVCLGdCQUFXLEdBQWUsRUFBRSxDQUFDO1FBQzdCLGtCQUFhLEdBQWUsRUFBRSxDQUFDO1FBRy9CLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFDbEIsYUFBUSxHQUFHLEtBQUssQ0FBQztRQUNqQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBTXBCLFNBQUksR0FBRyxDQUFDLENBQUM7UUFFVCxpQkFBWSxHQUF5QixJQUFJLENBQUM7UUFDMUMsb0JBQWUsR0FBMkMsRUFBRSxDQUFDO1FBTWxFLElBQUksQ0FBQyxTQUFTLEdBQUcsbUJBQVEsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFBLENBQUM7UUFDN0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxtQkFBUSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUEsSUFBSSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFN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QUMsT0FBTzs7OztRQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUMsQ0FBQztRQUM1QixPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNyQixDQUFDO0NBQ0Y7Ozs7OztJQS9KQyx5Q0FBb0M7Ozs7O0lBQ3BDLDBDQUFxQzs7Ozs7SUFDckMsNENBQXVDOzs7OztJQUN2Qyx3Q0FBMEI7Ozs7O0lBQzFCLHFDQUF1Qjs7Ozs7SUFDdkIsMkNBQTZCOzs7OztJQUM3Qix3Q0FBMEI7Ozs7O0lBQzFCLHVDQUF5Qjs7Ozs7SUFDekIseUNBQTJCOzs7OztJQUUzQiw2Q0FBMkQ7O0lBRzNELHdDQUEwQzs7SUFDMUMsbUNBQWdCOztJQUVoQiwyQ0FBaUQ7O0lBQ2pELDhDQUFvRTs7SUFHaEUsc0NBQW1COztJQUFFLHdDQUFvRDs7SUFDekUsc0NBQWdEOzs7OztJQUNoRCw2Q0FBZ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvblBsYXllcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7Y29tcHV0ZVN0eWxlfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCB7U3BlY2lhbENhc2VkU3R5bGVzfSBmcm9tICcuLi9zcGVjaWFsX2Nhc2VkX3N0eWxlcyc7XG5cbmltcG9ydCB7RE9NQW5pbWF0aW9ufSBmcm9tICcuL2RvbV9hbmltYXRpb24nO1xuXG5leHBvcnQgY2xhc3MgV2ViQW5pbWF0aW9uc1BsYXllciBpbXBsZW1lbnRzIEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX29uRG9uZUZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9vblN0YXJ0Rm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX29uRGVzdHJveUZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9kdXJhdGlvbjogbnVtYmVyO1xuICBwcml2YXRlIF9kZWxheTogbnVtYmVyO1xuICBwcml2YXRlIF9pbml0aWFsaXplZCA9IGZhbHNlO1xuICBwcml2YXRlIF9maW5pc2hlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9zdGFydGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfZmluYWxLZXlmcmFtZSAhOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfTtcblxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHVibGljIHJlYWRvbmx5IGRvbVBsYXllciAhOiBET01BbmltYXRpb247XG4gIHB1YmxpYyB0aW1lID0gMDtcblxuICBwdWJsaWMgcGFyZW50UGxheWVyOiBBbmltYXRpb25QbGF5ZXJ8bnVsbCA9IG51bGw7XG4gIHB1YmxpYyBjdXJyZW50U25hcHNob3Q6IHtbc3R5bGVOYW1lOiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9ID0ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgZWxlbWVudDogYW55LCBwdWJsaWMga2V5ZnJhbWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfVtdLFxuICAgICAgcHVibGljIG9wdGlvbnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9LFxuICAgICAgcHJpdmF0ZSBfc3BlY2lhbFN0eWxlcz86IFNwZWNpYWxDYXNlZFN0eWxlc3xudWxsKSB7XG4gICAgdGhpcy5fZHVyYXRpb24gPSA8bnVtYmVyPm9wdGlvbnNbJ2R1cmF0aW9uJ107XG4gICAgdGhpcy5fZGVsYXkgPSA8bnVtYmVyPm9wdGlvbnNbJ2RlbGF5J10gfHwgMDtcbiAgICB0aGlzLnRpbWUgPSB0aGlzLl9kdXJhdGlvbiArIHRoaXMuX2RlbGF5O1xuICB9XG5cbiAgcHJpdmF0ZSBfb25GaW5pc2goKSB7XG4gICAgaWYgKCF0aGlzLl9maW5pc2hlZCkge1xuICAgICAgdGhpcy5fZmluaXNoZWQgPSB0cnVlO1xuICAgICAgdGhpcy5fb25Eb25lRm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgICB0aGlzLl9vbkRvbmVGbnMgPSBbXTtcbiAgICB9XG4gIH1cblxuICBpbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX2J1aWxkUGxheWVyKCk7XG4gICAgdGhpcy5fcHJlcGFyZVBsYXllckJlZm9yZVN0YXJ0KCk7XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFBsYXllcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHJldHVybjtcbiAgICB0aGlzLl9pbml0aWFsaXplZCA9IHRydWU7XG5cbiAgICBjb25zdCBrZXlmcmFtZXMgPSB0aGlzLmtleWZyYW1lcztcbiAgICAodGhpcyBhc3tkb21QbGF5ZXI6IERPTUFuaW1hdGlvbn0pLmRvbVBsYXllciA9XG4gICAgICAgIHRoaXMuX3RyaWdnZXJXZWJBbmltYXRpb24odGhpcy5lbGVtZW50LCBrZXlmcmFtZXMsIHRoaXMub3B0aW9ucyk7XG4gICAgdGhpcy5fZmluYWxLZXlmcmFtZSA9IGtleWZyYW1lcy5sZW5ndGggPyBrZXlmcmFtZXNba2V5ZnJhbWVzLmxlbmd0aCAtIDFdIDoge307XG4gICAgdGhpcy5kb21QbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZmluaXNoJywgKCkgPT4gdGhpcy5fb25GaW5pc2goKSk7XG4gIH1cblxuICBwcml2YXRlIF9wcmVwYXJlUGxheWVyQmVmb3JlU3RhcnQoKSB7XG4gICAgLy8gdGhpcyBpcyByZXF1aXJlZCBzbyB0aGF0IHRoZSBwbGF5ZXIgZG9lc24ndCBzdGFydCB0byBhbmltYXRlIHJpZ2h0IGF3YXlcbiAgICBpZiAodGhpcy5fZGVsYXkpIHtcbiAgICAgIHRoaXMuX3Jlc2V0RG9tUGxheWVyU3RhdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kb21QbGF5ZXIucGF1c2UoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF90cmlnZ2VyV2ViQW5pbWF0aW9uKGVsZW1lbnQ6IGFueSwga2V5ZnJhbWVzOiBhbnlbXSwgb3B0aW9uczogYW55KTogRE9NQW5pbWF0aW9uIHtcbiAgICAvLyBqc2NvbXBpbGVyIGRvZXNuJ3Qgc2VlbSB0byBrbm93IGFuaW1hdGUgaXMgYSBuYXRpdmUgcHJvcGVydHkgYmVjYXVzZSBpdCdzIG5vdCBmdWxseVxuICAgIC8vIHN1cHBvcnRlZCB5ZXQgYWNyb3NzIGNvbW1vbiBicm93c2VycyAod2UgcG9seWZpbGwgaXQgZm9yIEVkZ2UvU2FmYXJpKSBbQ0wgIzE0MzYzMDkyOV1cbiAgICByZXR1cm4gZWxlbWVudFsnYW5pbWF0ZSddKGtleWZyYW1lcywgb3B0aW9ucykgYXMgRE9NQW5pbWF0aW9uO1xuICB9XG5cbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9vblN0YXJ0Rm5zLnB1c2goZm4pOyB9XG5cbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uRG9uZUZucy5wdXNoKGZuKTsgfVxuXG4gIG9uRGVzdHJveShmbjogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9vbkRlc3Ryb3lGbnMucHVzaChmbik7IH1cblxuICBwbGF5KCk6IHZvaWQge1xuICAgIHRoaXMuX2J1aWxkUGxheWVyKCk7XG4gICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQoKSkge1xuICAgICAgdGhpcy5fb25TdGFydEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgICAgdGhpcy5fb25TdGFydEZucyA9IFtdO1xuICAgICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gICAgICBpZiAodGhpcy5fc3BlY2lhbFN0eWxlcykge1xuICAgICAgICB0aGlzLl9zcGVjaWFsU3R5bGVzLnN0YXJ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZG9tUGxheWVyLnBsYXkoKTtcbiAgfVxuXG4gIHBhdXNlKCk6IHZvaWQge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIHRoaXMuZG9tUGxheWVyLnBhdXNlKCk7XG4gIH1cblxuICBmaW5pc2goKTogdm9pZCB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgaWYgKHRoaXMuX3NwZWNpYWxTdHlsZXMpIHtcbiAgICAgIHRoaXMuX3NwZWNpYWxTdHlsZXMuZmluaXNoKCk7XG4gICAgfVxuICAgIHRoaXMuX29uRmluaXNoKCk7XG4gICAgdGhpcy5kb21QbGF5ZXIuZmluaXNoKCk7XG4gIH1cblxuICByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLl9yZXNldERvbVBsYXllclN0YXRlKCk7XG4gICAgdGhpcy5fZGVzdHJveWVkID0gZmFsc2U7XG4gICAgdGhpcy5fZmluaXNoZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zdGFydGVkID0gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9yZXNldERvbVBsYXllclN0YXRlKCkge1xuICAgIGlmICh0aGlzLmRvbVBsYXllcikge1xuICAgICAgdGhpcy5kb21QbGF5ZXIuY2FuY2VsKCk7XG4gICAgfVxuICB9XG5cbiAgcmVzdGFydCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgdGhpcy5wbGF5KCk7XG4gIH1cblxuICBoYXNTdGFydGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fc3RhcnRlZDsgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9kZXN0cm95ZWQpIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICB0aGlzLl9yZXNldERvbVBsYXllclN0YXRlKCk7XG4gICAgICB0aGlzLl9vbkZpbmlzaCgpO1xuICAgICAgaWYgKHRoaXMuX3NwZWNpYWxTdHlsZXMpIHtcbiAgICAgICAgdGhpcy5fc3BlY2lhbFN0eWxlcy5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9vbkRlc3Ryb3lGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIHRoaXMuX29uRGVzdHJveUZucyA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIHNldFBvc2l0aW9uKHA6IG51bWJlcik6IHZvaWQgeyB0aGlzLmRvbVBsYXllci5jdXJyZW50VGltZSA9IHAgKiB0aGlzLnRpbWU7IH1cblxuICBnZXRQb3NpdGlvbigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5kb21QbGF5ZXIuY3VycmVudFRpbWUgLyB0aGlzLnRpbWU7IH1cblxuICBnZXQgdG90YWxUaW1lKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9kZWxheSArIHRoaXMuX2R1cmF0aW9uOyB9XG5cbiAgYmVmb3JlRGVzdHJveSgpIHtcbiAgICBjb25zdCBzdHlsZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9ID0ge307XG4gICAgaWYgKHRoaXMuaGFzU3RhcnRlZCgpKSB7XG4gICAgICBPYmplY3Qua2V5cyh0aGlzLl9maW5hbEtleWZyYW1lKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICBpZiAocHJvcCAhPSAnb2Zmc2V0Jykge1xuICAgICAgICAgIHN0eWxlc1twcm9wXSA9XG4gICAgICAgICAgICAgIHRoaXMuX2ZpbmlzaGVkID8gdGhpcy5fZmluYWxLZXlmcmFtZVtwcm9wXSA6IGNvbXB1dGVTdHlsZSh0aGlzLmVsZW1lbnQsIHByb3ApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50U25hcHNob3QgPSBzdHlsZXM7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHRyaWdnZXJDYWxsYmFjayhwaGFzZU5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG1ldGhvZHMgPSBwaGFzZU5hbWUgPT0gJ3N0YXJ0JyA/IHRoaXMuX29uU3RhcnRGbnMgOiB0aGlzLl9vbkRvbmVGbnM7XG4gICAgbWV0aG9kcy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIG1ldGhvZHMubGVuZ3RoID0gMDtcbiAgfVxufVxuIl19