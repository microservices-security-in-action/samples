/**
 * @fileoverview added by tsickle
 * Generated from: packages/animations/src/players/animation_group_player.ts
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
 * A programmatic controller for a group of reusable animations.
 * Used internally to control animations.
 *
 * @see `AnimationPlayer`
 * @see `{\@link animations/group group()}`
 *
 */
export class AnimationGroupPlayer {
    /**
     * @param {?} _players
     */
    constructor(_players) {
        this._onDoneFns = [];
        this._onStartFns = [];
        this._finished = false;
        this._started = false;
        this._destroyed = false;
        this._onDestroyFns = [];
        this.parentPlayer = null;
        this.totalTime = 0;
        this.players = _players;
        /** @type {?} */
        let doneCount = 0;
        /** @type {?} */
        let destroyCount = 0;
        /** @type {?} */
        let startCount = 0;
        /** @type {?} */
        const total = this.players.length;
        if (total == 0) {
            scheduleMicroTask((/**
             * @return {?}
             */
            () => this._onFinish()));
        }
        else {
            this.players.forEach((/**
             * @param {?} player
             * @return {?}
             */
            player => {
                player.onDone((/**
                 * @return {?}
                 */
                () => {
                    if (++doneCount == total) {
                        this._onFinish();
                    }
                }));
                player.onDestroy((/**
                 * @return {?}
                 */
                () => {
                    if (++destroyCount == total) {
                        this._onDestroy();
                    }
                }));
                player.onStart((/**
                 * @return {?}
                 */
                () => {
                    if (++startCount == total) {
                        this._onStart();
                    }
                }));
            }));
        }
        this.totalTime = this.players.reduce((/**
         * @param {?} time
         * @param {?} player
         * @return {?}
         */
        (time, player) => Math.max(time, player.totalTime)), 0);
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
    init() { this.players.forEach((/**
     * @param {?} player
     * @return {?}
     */
    player => player.init())); }
    /**
     * @param {?} fn
     * @return {?}
     */
    onStart(fn) { this._onStartFns.push(fn); }
    /**
     * @private
     * @return {?}
     */
    _onStart() {
        if (!this.hasStarted()) {
            this._started = true;
            this._onStartFns.forEach((/**
             * @param {?} fn
             * @return {?}
             */
            fn => fn()));
            this._onStartFns = [];
        }
    }
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
    play() {
        if (!this.parentPlayer) {
            this.init();
        }
        this._onStart();
        this.players.forEach((/**
         * @param {?} player
         * @return {?}
         */
        player => player.play()));
    }
    /**
     * @return {?}
     */
    pause() { this.players.forEach((/**
     * @param {?} player
     * @return {?}
     */
    player => player.pause())); }
    /**
     * @return {?}
     */
    restart() { this.players.forEach((/**
     * @param {?} player
     * @return {?}
     */
    player => player.restart())); }
    /**
     * @return {?}
     */
    finish() {
        this._onFinish();
        this.players.forEach((/**
         * @param {?} player
         * @return {?}
         */
        player => player.finish()));
    }
    /**
     * @return {?}
     */
    destroy() { this._onDestroy(); }
    /**
     * @private
     * @return {?}
     */
    _onDestroy() {
        if (!this._destroyed) {
            this._destroyed = true;
            this._onFinish();
            this.players.forEach((/**
             * @param {?} player
             * @return {?}
             */
            player => player.destroy()));
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
    reset() {
        this.players.forEach((/**
         * @param {?} player
         * @return {?}
         */
        player => player.reset()));
        this._destroyed = false;
        this._finished = false;
        this._started = false;
    }
    /**
     * @param {?} p
     * @return {?}
     */
    setPosition(p) {
        /** @type {?} */
        const timeAtPosition = p * this.totalTime;
        this.players.forEach((/**
         * @param {?} player
         * @return {?}
         */
        player => {
            /** @type {?} */
            const position = player.totalTime ? Math.min(1, timeAtPosition / player.totalTime) : 1;
            player.setPosition(position);
        }));
    }
    /**
     * @return {?}
     */
    getPosition() {
        /** @type {?} */
        let min = 0;
        this.players.forEach((/**
         * @param {?} player
         * @return {?}
         */
        player => {
            /** @type {?} */
            const p = player.getPosition();
            min = Math.min(p, min);
        }));
        return min;
    }
    /**
     * @return {?}
     */
    beforeDestroy() {
        this.players.forEach((/**
         * @param {?} player
         * @return {?}
         */
        player => {
            if (player.beforeDestroy) {
                player.beforeDestroy();
            }
        }));
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
    AnimationGroupPlayer.prototype._onDoneFns;
    /**
     * @type {?}
     * @private
     */
    AnimationGroupPlayer.prototype._onStartFns;
    /**
     * @type {?}
     * @private
     */
    AnimationGroupPlayer.prototype._finished;
    /**
     * @type {?}
     * @private
     */
    AnimationGroupPlayer.prototype._started;
    /**
     * @type {?}
     * @private
     */
    AnimationGroupPlayer.prototype._destroyed;
    /**
     * @type {?}
     * @private
     */
    AnimationGroupPlayer.prototype._onDestroyFns;
    /** @type {?} */
    AnimationGroupPlayer.prototype.parentPlayer;
    /** @type {?} */
    AnimationGroupPlayer.prototype.totalTime;
    /** @type {?} */
    AnimationGroupPlayer.prototype.players;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2dyb3VwX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvc3JjL3BsYXllcnMvYW5pbWF0aW9uX2dyb3VwX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxTQUFTLENBQUM7Ozs7Ozs7OztBQVcxQyxNQUFNLE9BQU8sb0JBQW9COzs7O0lBWS9CLFlBQVksUUFBMkI7UUFYL0IsZUFBVSxHQUFlLEVBQUUsQ0FBQztRQUM1QixnQkFBVyxHQUFlLEVBQUUsQ0FBQztRQUM3QixjQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLGFBQVEsR0FBRyxLQUFLLENBQUM7UUFDakIsZUFBVSxHQUFHLEtBQUssQ0FBQztRQUNuQixrQkFBYSxHQUFlLEVBQUUsQ0FBQztRQUVoQyxpQkFBWSxHQUF5QixJQUFJLENBQUM7UUFDMUMsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUkzQixJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQzs7WUFDcEIsU0FBUyxHQUFHLENBQUM7O1lBQ2IsWUFBWSxHQUFHLENBQUM7O1lBQ2hCLFVBQVUsR0FBRyxDQUFDOztjQUNaLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU07UUFFakMsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO1lBQ2QsaUJBQWlCOzs7WUFBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUMsQ0FBQztTQUMzQzthQUFNO1lBQ0wsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPOzs7O1lBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzVCLE1BQU0sQ0FBQyxNQUFNOzs7Z0JBQUMsR0FBRyxFQUFFO29CQUNqQixJQUFJLEVBQUUsU0FBUyxJQUFJLEtBQUssRUFBRTt3QkFDeEIsSUFBSSxDQUFDLFNBQVMsRUFB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MkI7Ozs7O0lBQzNCLDZDQUF1Qzs7SUFFdkMsNENBQWlEOztJQUNqRCx5Q0FBNkI7O0lBQzdCLHVDQUEyQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtzY2hlZHVsZU1pY3JvVGFza30gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQge0FuaW1hdGlvblBsYXllcn0gZnJvbSAnLi9hbmltYXRpb25fcGxheWVyJztcblxuLyoqXG4gKiBBIHByb2dyYW1tYXRpYyBjb250cm9sbGVyIGZvciBhIGdyb3VwIG9mIHJldXNhYmxlIGFuaW1hdGlvbnMuXG4gKiBVc2VkIGludGVybmFsbHkgdG8gY29udHJvbCBhbmltYXRpb25zLlxuICpcbiAqIEBzZWUgYEFuaW1hdGlvblBsYXllcmBcbiAqIEBzZWUgYHtAbGluayBhbmltYXRpb25zL2dyb3VwIGdyb3VwKCl9YFxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbkdyb3VwUGxheWVyIGltcGxlbWVudHMgQW5pbWF0aW9uUGxheWVyIHtcbiAgcHJpdmF0ZSBfb25Eb25lRm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX29uU3RhcnRGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBfZmluaXNoZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfc3RhcnRlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfb25EZXN0cm95Rm5zOiBGdW5jdGlvbltdID0gW107XG5cbiAgcHVibGljIHBhcmVudFBsYXllcjogQW5pbWF0aW9uUGxheWVyfG51bGwgPSBudWxsO1xuICBwdWJsaWMgdG90YWxUaW1lOiBudW1iZXIgPSAwO1xuICBwdWJsaWMgcmVhZG9ubHkgcGxheWVyczogQW5pbWF0aW9uUGxheWVyW107XG5cbiAgY29uc3RydWN0b3IoX3BsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKSB7XG4gICAgdGhpcy5wbGF5ZXJzID0gX3BsYXllcnM7XG4gICAgbGV0IGRvbmVDb3VudCA9IDA7XG4gICAgbGV0IGRlc3Ryb3lDb3VudCA9IDA7XG4gICAgbGV0IHN0YXJ0Q291bnQgPSAwO1xuICAgIGNvbnN0IHRvdGFsID0gdGhpcy5wbGF5ZXJzLmxlbmd0aDtcblxuICAgIGlmICh0b3RhbCA9PSAwKSB7XG4gICAgICBzY2hlZHVsZU1pY3JvVGFzaygoKSA9PiB0aGlzLl9vbkZpbmlzaCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgcGxheWVyLm9uRG9uZSgoKSA9PiB7XG4gICAgICAgICAgaWYgKCsrZG9uZUNvdW50ID09IHRvdGFsKSB7XG4gICAgICAgICAgICB0aGlzLl9vbkZpbmlzaCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4ge1xuICAgICAgICAgIGlmICgrK2Rlc3Ryb3lDb3VudCA9PSB0b3RhbCkge1xuICAgICAgICAgICAgdGhpcy5fb25EZXN0cm95KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4ge1xuICAgICAgICAgIGlmICgrK3N0YXJ0Q291bnQgPT0gdG90YWwpIHtcbiAgICAgICAgICAgIHRoaXMuX29uU3RhcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy50b3RhbFRpbWUgPSB0aGlzLnBsYXllcnMucmVkdWNlKCh0aW1lLCBwbGF5ZXIpID0+IE1hdGgubWF4KHRpbWUsIHBsYXllci50b3RhbFRpbWUpLCAwKTtcbiAgfVxuXG4gIHByaXZhdGUgX29uRmluaXNoKCkge1xuICAgIGlmICghdGhpcy5fZmluaXNoZWQpIHtcbiAgICAgIHRoaXMuX2ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX29uRG9uZUZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgICAgdGhpcy5fb25Eb25lRm5zID0gW107XG4gICAgfVxuICB9XG5cbiAgaW5pdCgpOiB2b2lkIHsgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5pbml0KCkpOyB9XG5cbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9vblN0YXJ0Rm5zLnB1c2goZm4pOyB9XG5cbiAgcHJpdmF0ZSBfb25TdGFydCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZCgpKSB7XG4gICAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX29uU3RhcnRGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIHRoaXMuX29uU3RhcnRGbnMgPSBbXTtcbiAgICB9XG4gIH1cblxuICBvbkRvbmUoZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fb25Eb25lRm5zLnB1c2goZm4pOyB9XG5cbiAgb25EZXN0cm95KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uRGVzdHJveUZucy5wdXNoKGZuKTsgfVxuXG4gIGhhc1N0YXJ0ZWQoKSB7IHJldHVybiB0aGlzLl9zdGFydGVkOyB9XG5cbiAgcGxheSgpIHtcbiAgICBpZiAoIXRoaXMucGFyZW50UGxheWVyKSB7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG4gICAgdGhpcy5fb25TdGFydCgpO1xuICAgIHRoaXMucGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIucGxheSgpKTtcbiAgfVxuXG4gIHBhdXNlKCk6IHZvaWQgeyB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLnBhdXNlKCkpOyB9XG5cbiAgcmVzdGFydCgpOiB2b2lkIHsgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5yZXN0YXJ0KCkpOyB9XG5cbiAgZmluaXNoKCk6IHZvaWQge1xuICAgIHRoaXMuX29uRmluaXNoKCk7XG4gICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5maW5pc2goKSk7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQgeyB0aGlzLl9vbkRlc3Ryb3koKTsgfVxuXG4gIHByaXZhdGUgX29uRGVzdHJveSgpIHtcbiAgICBpZiAoIXRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX29uRmluaXNoKCk7XG4gICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLmRlc3Ryb3koKSk7XG4gICAgICB0aGlzLl9vbkRlc3Ryb3lGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIHRoaXMuX29uRGVzdHJveUZucyA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMucGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIucmVzZXQoKSk7XG4gICAgdGhpcy5fZGVzdHJveWVkID0gZmFsc2U7XG4gICAgdGhpcy5fZmluaXNoZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zdGFydGVkID0gZmFsc2U7XG4gIH1cblxuICBzZXRQb3NpdGlvbihwOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCB0aW1lQXRQb3NpdGlvbiA9IHAgKiB0aGlzLnRvdGFsVGltZTtcbiAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBwbGF5ZXIudG90YWxUaW1lID8gTWF0aC5taW4oMSwgdGltZUF0UG9zaXRpb24gLyBwbGF5ZXIudG90YWxUaW1lKSA6IDE7XG4gICAgICBwbGF5ZXIuc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0UG9zaXRpb24oKTogbnVtYmVyIHtcbiAgICBsZXQgbWluID0gMDtcbiAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgY29uc3QgcCA9IHBsYXllci5nZXRQb3NpdGlvbigpO1xuICAgICAgbWluID0gTWF0aC5taW4ocCwgbWluKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbWluO1xuICB9XG5cbiAgYmVmb3JlRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgaWYgKHBsYXllci5iZWZvcmVEZXN0cm95KSB7XG4gICAgICAgIHBsYXllci5iZWZvcmVEZXN0cm95KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHRyaWdnZXJDYWxsYmFjayhwaGFzZU5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG1ldGhvZHMgPSBwaGFzZU5hbWUgPT0gJ3N0YXJ0JyA/IHRoaXMuX29uU3RhcnRGbnMgOiB0aGlzLl9vbkRvbmVGbnM7XG4gICAgbWV0aG9kcy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIG1ldGhvZHMubGVuZ3RoID0gMDtcbiAgfVxufVxuIl19