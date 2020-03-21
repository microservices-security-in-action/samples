/**
 * @fileoverview added by tsickle
 * Generated from: packages/animations/browser/src/render/animation_engine_next.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { buildAnimationAst } from '../dsl/animation_ast_builder';
import { buildTrigger } from '../dsl/animation_trigger';
import { parseTimelineCommand } from './shared';
import { TimelineAnimationEngine } from './timeline_animation_engine';
import { TransitionAnimationEngine } from './transition_animation_engine';
export class AnimationEngine {
    /**
     * @param {?} bodyNode
     * @param {?} _driver
     * @param {?} normalizer
     */
    constructor(bodyNode, _driver, normalizer) {
        this.bodyNode = bodyNode;
        this._driver = _driver;
        this._triggerCache = {};
        // this method is designed to be overridden by the code that uses this engine
        this.onRemovalComplete = (/**
         * @param {?} element
         * @param {?} context
         * @return {?}
         */
        (element, context) => { });
        this._transitionEngine = new TransitionAnimationEngine(bodyNode, _driver, normalizer);
        this._timelineEngine = new TimelineAnimationEngine(bodyNode, _driver, normalizer);
        this._transitionEngine.onRemovalComplete = (/**
         * @param {?} element
         * @param {?} context
         * @return {?}
         */
        (element, context) => this.onRemovalComplete(element, context));
    }
    /**
     * @param {?} componentId
     * @param {?} namespaceId
     * @param {?} hostElement
     * @param {?} name
     * @param {?} metadata
     * @return {?}
     */
    registerTrigger(componentId, namespaceId, hostElement, name, metadata) {
        /** @type {?} */
        const cacheKey = componentId + '-' + name;
        /** @type {?} */
        let trigger = this._triggerCache[cacheKey];
        if (!trigger) {
            /** @type {?} */
            const errors = [];
            /** @type {?} */
            const ast = (/** @type {?} */ (buildAnimationAst(this._driver, (/** @type {?} */ (metadata)), errors)));
            if (errors.length) {
                throw new Error(`The animation trigger "${name}" has failed to build due to the following errors:\n - ${errors.join("\n - ")}`);
            }
            trigger = buildTrigger(name, ast);
            this._triggerCache[cacheKey] = trigger;
        }
        this._transitionEngine.registerTrigger(namespaceId, name, trigger);
    }
    /**
     * @param {?} namespaceId
     * @param {?} hostElement
     * @return {?}
     */
    register(namespaceId, hostElement) {
        this._transitionEngine.register(namespaceId, hostElement);
    }
    /**
     * @param {?} namespaceId
     * @param {?} context
     * @return {?}
     */
    destroy(namespaceId, context) {
        this._transitionEngine.destroy(namespaceId, context);
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} parent
     * @param {?} insertBefore
     * @return {?}
     */
    onInsert(namespaceId, element, parent, insertBefore) {
        this._transitionEngine.insertNode(namespaceId, element, parent, insertBefore);
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} context
     * @param {?=} isHostElement
     * @return {?}
     */
    onRemove(namespaceId, element, context, isHostElement) {
        this._transitionEngine.removeNode(namespaceId, element, isHostElement || false, context);
    }
    /**
     * @param {?} element
     * @param {?} disable
     * @return {?}
     */
    disableAnimations(element, disable) {
        this._transitionEngine.markElementAsDisabled(element, disable);
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} property
     * @param {?} value
     * @return {?}
     */
    process(namespaceId, element, property, value) {
        if (property.charAt(0) == '@') {
            const [id, action] = parseTimelineCommand(property);
            /** @type {?} */
            const args = (/** @type {?} */ (value));
            this._timelineEngine.command(id, element, action, args);
        }
        else {
            this._transitionEngine.trigger(namespaceId, element, property, value);
        }
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} eventName
     * @param {?} eventPhase
     * @param {?} callback
     * @return {?}
     */
    listen(namespaceId, element, eventName, eventPhase, callback) {
        // @@listen
        if (eventName.charAt(0) == '@') {
            const [id, action] = parseTimelineCommand(eventName);
            return this._timelineEngine.listen(id, element, action, callback);
        }
        return this._transitionEngine.listen(namespaceId, element, eventName, eventPhase, callback);
    }
    /**
     * @param {?=} microtaskId
     * @return {?}
     */
    flush(microtaskId = -1) { this._transitionEngine.flush(microtaskId); }
    /**
     * @return {?}
     */
    get players() {
        return ((/** @type {?} */ (this._transitionEngine.players)))
            .concat((/** @type {?} */ (this._timelineEngine.players)));
    }
    /**
     * @return {?}
     */
    whenRenderingDone() { return this._transitionEngine.whenRenderingDone(); }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    AnimationEngine.prototype._transitionEngine;
    /**
     * @type {?}
     * @private
     */
    AnimationEngine.prototype._timelineEngine;
    /**
     * @type {?}
     * @private
     */
    AnimationEngine.prototype._triggerCache;
    /** @type {?} */
    AnimationEngine.prototype.onRemovalComplete;
    /**
     * @type {?}
     * @private
     */
    AnimationEngine.prototype.bodyNode;
    /**
     * @type {?}
     * @private
     */
    AnimationEngine.prototype._driver;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2VuZ2luZV9uZXh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvYW5pbWF0aW9uX2VuZ2luZV9uZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBU0EsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDL0QsT0FBTyxFQUFtQixZQUFZLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUl4RSxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDOUMsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDcEUsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFFeEUsTUFBTSxPQUFPLGVBQWU7Ozs7OztJQVMxQixZQUNZLFFBQWEsRUFBVSxPQUF3QixFQUN2RCxVQUFvQztRQUQ1QixhQUFRLEdBQVIsUUFBUSxDQUFLO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7UUFObkQsa0JBQWEsR0FBc0MsRUFBRSxDQUFDOztRQUd2RCxzQkFBaUI7Ozs7O1FBQUcsQ0FBQyxPQUFZLEVBQUUsT0FBWSxFQUFFLEVBQUUsR0FBRSxDQUFDLEVBQUM7UUFLNUQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUkseUJBQXlCLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN0RixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksdUJBQXVCLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVsRixJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCOzs7OztRQUFHLENBQUMsT0FBWSxFQUFFLE9BQVksRUFBRSxFQUFFLENBQ3RFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsT0FB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QyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFO2tCQUN4QixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsR0FBRyxvQkFBb0IsQ0FBQyxTQUFTLENBQUM7WUFDcEQsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNuRTtRQUNELE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDOUYsQ0FBQzs7Ozs7SUFFRCxLQUFLLENBQUMsY0FBc0IsQ0FBQyxDQUFDLElBQVUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7SUFFcEYsSUFBSSxPQUFPO1FBQ1QsT0FBTyxDQUFDLG1CQUFBLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQXFCLENBQUM7YUFDdkQsTUFBTSxDQUFDLG1CQUFBLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFxQixDQUFDLENBQUM7SUFDakUsQ0FBQzs7OztJQUVELGlCQUFpQixLQUFtQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUN6Rjs7Ozs7O0lBdEZDLDRDQUFxRDs7Ozs7SUFDckQsMENBQWlEOzs7OztJQUVqRCx3Q0FBOEQ7O0lBRzlELDRDQUE4RDs7Ozs7SUFHMUQsbUNBQXFCOzs7OztJQUFFLGtDQUFnQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uTWV0YWRhdGEsIEFuaW1hdGlvblBsYXllciwgQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7VHJpZ2dlckFzdH0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl9hc3QnO1xuaW1wb3J0IHtidWlsZEFuaW1hdGlvbkFzdH0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl9hc3RfYnVpbGRlcic7XG5pbXBvcnQge0FuaW1hdGlvblRyaWdnZXIsIGJ1aWxkVHJpZ2dlcn0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90cmlnZ2VyJztcbmltcG9ydCB7QW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyfSBmcm9tICcuLi9kc2wvc3R5bGVfbm9ybWFsaXphdGlvbi9hbmltYXRpb25fc3R5bGVfbm9ybWFsaXplcic7XG5cbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuL2FuaW1hdGlvbl9kcml2ZXInO1xuaW1wb3J0IHtwYXJzZVRpbWVsaW5lQ29tbWFuZH0gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtUaW1lbGluZUFuaW1hdGlvbkVuZ2luZX0gZnJvbSAnLi90aW1lbGluZV9hbmltYXRpb25fZW5naW5lJztcbmltcG9ydCB7VHJhbnNpdGlvbkFuaW1hdGlvbkVuZ2luZX0gZnJvbSAnLi90cmFuc2l0aW9uX2FuaW1hdGlvbl9lbmdpbmUnO1xuXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uRW5naW5lIHtcbiAgcHJpdmF0ZSBfdHJhbnNpdGlvbkVuZ2luZTogVHJhbnNpdGlvbkFuaW1hdGlvbkVuZ2luZTtcbiAgcHJpdmF0ZSBfdGltZWxpbmVFbmdpbmU6IFRpbWVsaW5lQW5pbWF0aW9uRW5naW5lO1xuXG4gIHByaXZhdGUgX3RyaWdnZXJDYWNoZToge1trZXk6IHN0cmluZ106IEFuaW1hdGlvblRyaWdnZXJ9ID0ge307XG5cbiAgLy8gdGhpcyBtZXRob2QgaXMgZGVzaWduZWQgdG8gYmUgb3ZlcnJpZGRlbiBieSB0aGUgY29kZSB0aGF0IHVzZXMgdGhpcyBlbmdpbmVcbiAgcHVibGljIG9uUmVtb3ZhbENvbXBsZXRlID0gKGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KSA9PiB7fTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgYm9keU5vZGU6IGFueSwgcHJpdmF0ZSBfZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsXG4gICAgICBub3JtYWxpemVyOiBBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXIpIHtcbiAgICB0aGlzLl90cmFuc2l0aW9uRW5naW5lID0gbmV3IFRyYW5zaXRpb25BbmltYXRpb25FbmdpbmUoYm9keU5vZGUsIF9kcml2ZXIsIG5vcm1hbGl6ZXIpO1xuICAgIHRoaXMuX3RpbWVsaW5lRW5naW5lID0gbmV3IFRpbWVsaW5lQW5pbWF0aW9uRW5naW5lKGJvZHlOb2RlLCBfZHJpdmVyLCBub3JtYWxpemVyKTtcblxuICAgIHRoaXMuX3RyYW5zaXRpb25FbmdpbmUub25SZW1vdmFsQ29tcGxldGUgPSAoZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnkpID0+XG4gICAgICAgIHRoaXMub25SZW1vdmFsQ29tcGxldGUoZWxlbWVudCwgY29udGV4dCk7XG4gIH1cblxuICByZWdpc3RlclRyaWdnZXIoXG4gICAgICBjb21wb25lbnRJZDogc3RyaW5nLCBuYW1lc3BhY2VJZDogc3RyaW5nLCBob3N0RWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsXG4gICAgICBtZXRhZGF0YTogQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhKTogdm9pZCB7XG4gICAgY29uc3QgY2FjaGVLZXkgPSBjb21wb25lbnRJZCArICctJyArIG5hbWU7XG4gICAgbGV0IHRyaWdnZXIgPSB0aGlzLl90cmlnZ2VyQ2FjaGVbY2FjaGVLZXldO1xuICAgIGlmICghdHJpZ2dlcikge1xuICAgICAgY29uc3QgZXJyb3JzOiBhbnlbXSA9IFtdO1xuICAgICAgY29uc3QgYXN0ID1cbiAgICAgICAgICBidWlsZEFuaW1hdGlvbkFzdCh0aGlzLl9kcml2ZXIsIG1ldGFkYXRhIGFzIEFuaW1hdGlvbk1ldGFkYXRhLCBlcnJvcnMpIGFzIFRyaWdnZXJBc3Q7XG4gICAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVGhlIGFuaW1hdGlvbiB0cmlnZ2VyIFwiJHtuYW1lfVwiIGhhcyBmYWlsZWQgdG8gYnVpbGQgZHVlIHRvIHRoZSBmb2xsb3dpbmcgZXJyb3JzOlxcbiAtICR7ZXJyb3JzLmpvaW4oXCJcXG4gLSBcIil9YCk7XG4gICAgICB9XG4gICAgICB0cmlnZ2VyID0gYnVpbGRUcmlnZ2VyKG5hbWUsIGFzdCk7XG4gICAgICB0aGlzLl90cmlnZ2VyQ2FjaGVbY2FjaGVLZXldID0gdHJpZ2dlcjtcbiAgICB9XG4gICAgdGhpcy5fdHJhbnNpdGlvbkVuZ2luZS5yZWdpc3RlclRyaWdnZXIobmFtZXNwYWNlSWQsIG5hbWUsIHRyaWdnZXIpO1xuICB9XG5cbiAgcmVnaXN0ZXIobmFtZXNwYWNlSWQ6IHN0cmluZywgaG9zdEVsZW1lbnQ6IGFueSkge1xuICAgIHRoaXMuX3RyYW5zaXRpb25FbmdpbmUucmVnaXN0ZXIobmFtZXNwYWNlSWQsIGhvc3RFbGVtZW50KTtcbiAgfVxuXG4gIGRlc3Ryb3kobmFtZXNwYWNlSWQ6IHN0cmluZywgY29udGV4dDogYW55KSB7XG4gICAgdGhpcy5fdHJhbnNpdGlvbkVuZ2luZS5kZXN0cm95KG5hbWVzcGFjZUlkLCBjb250ZXh0KTtcbiAgfVxuXG4gIG9uSW5zZXJ0KG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgcGFyZW50OiBhbnksIGluc2VydEJlZm9yZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3RyYW5zaXRpb25FbmdpbmUuaW5zZXJ0Tm9kZShuYW1lc3BhY2VJZCwgZWxlbWVudCwgcGFyZW50LCBpbnNlcnRCZWZvcmUpO1xuICB9XG5cbiAgb25SZW1vdmUobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnksIGlzSG9zdEVsZW1lbnQ/OiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fdHJhbnNpdGlvbkVuZ2luZS5yZW1vdmVOb2RlKG5hbWVzcGFjZUlkLCBlbGVtZW50LCBpc0hvc3RFbGVtZW50IHx8IGZhbHNlLCBjb250ZXh0KTtcbiAgfVxuXG4gIGRpc2FibGVBbmltYXRpb25zKGVsZW1lbnQ6IGFueSwgZGlzYWJsZTogYm9vbGVhbikge1xuICAgIHRoaXMuX3RyYW5zaXRpb25FbmdpbmUubWFya0VsZW1lbnRBc0Rpc2FibGVkKGVsZW1lbnQsIGRpc2FibGUpO1xuICB9XG5cbiAgcHJvY2VzcyhuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIHByb3BlcnR5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICBpZiAocHJvcGVydHkuY2hhckF0KDApID09ICdAJykge1xuICAgICAgY29uc3QgW2lkLCBhY3Rpb25dID0gcGFyc2VUaW1lbGluZUNvbW1hbmQocHJvcGVydHkpO1xuICAgICAgY29uc3QgYXJncyA9IHZhbHVlIGFzIGFueVtdO1xuICAgICAgdGhpcy5fdGltZWxpbmVFbmdpbmUuY29tbWFuZChpZCwgZWxlbWVudCwgYWN0aW9uLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdHJhbnNpdGlvbkVuZ2luZS50cmlnZ2VyKG5hbWVzcGFjZUlkLCBlbGVtZW50LCBwcm9wZXJ0eSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIGxpc3RlbihcbiAgICAgIG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50UGhhc2U6IHN0cmluZyxcbiAgICAgIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55KTogKCkgPT4gYW55IHtcbiAgICAvLyBAQGxpc3RlblxuICAgIGlmIChldmVudE5hbWUuY2hhckF0KDApID09ICdAJykge1xuICAgICAgY29uc3QgW2lkLCBhY3Rpb25dID0gcGFyc2VUaW1lbGluZUNvbW1hbmQoZXZlbnROYW1lKTtcbiAgICAgIHJldHVybiB0aGlzLl90aW1lbGluZUVuZ2luZS5saXN0ZW4oaWQsIGVsZW1lbnQsIGFjdGlvbiwgY2FsbGJhY2spO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fdHJhbnNpdGlvbkVuZ2luZS5saXN0ZW4obmFtZXNwYWNlSWQsIGVsZW1lbnQsIGV2ZW50TmFtZSwgZXZlbnRQaGFzZSwgY2FsbGJhY2spO1xuICB9XG5cbiAgZmx1c2gobWljcm90YXNrSWQ6IG51bWJlciA9IC0xKTogdm9pZCB7IHRoaXMuX3RyYW5zaXRpb25FbmdpbmUuZmx1c2gobWljcm90YXNrSWQpOyB9XG5cbiAgZ2V0IHBsYXllcnMoKTogQW5pbWF0aW9uUGxheWVyW10ge1xuICAgIHJldHVybiAodGhpcy5fdHJhbnNpdGlvbkVuZ2luZS5wbGF5ZXJzIGFzIEFuaW1hdGlvblBsYXllcltdKVxuICAgICAgICAuY29uY2F0KHRoaXMuX3RpbWVsaW5lRW5naW5lLnBsYXllcnMgYXMgQW5pbWF0aW9uUGxheWVyW10pO1xuICB9XG5cbiAgd2hlblJlbmRlcmluZ0RvbmUoKTogUHJvbWlzZTxhbnk+IHsgcmV0dXJuIHRoaXMuX3RyYW5zaXRpb25FbmdpbmUud2hlblJlbmRlcmluZ0RvbmUoKTsgfVxufVxuIl19