/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata, __param } from "tslib";
import { ɵgetDOM as getDOM } from '@angular/common';
import { Inject, Injectable, InjectionToken, NgZone } from '@angular/core';
/**
 * The injection token for the event-manager plug-in service.
 *
 * @publicApi
 */
export var EVENT_MANAGER_PLUGINS = new InjectionToken('EventManagerPlugins');
/**
 * An injectable service that provides event management for Angular
 * through a browser plug-in.
 *
 * @publicApi
 */
var EventManager = /** @class */ (function () {
    /**
     * Initializes an instance of the event-manager service.
     */
    function EventManager(plugins, _zone) {
        var _this = this;
        this._zone = _zone;
        this._eventNameToPlugin = new Map();
        plugins.forEach(function (p) { return p.manager = _this; });
        this._plugins = plugins.slice().reverse();
    }
    /**
     * Registers a handler for a specific element and event.
     *
     * @param element The HTML element to receive event notifications.
     * @param eventName The name of the event to listen for.
     * @param handler A function to call when the notification occurs. Receives the
     * event object as an argument.
     * @returns  A callback function that can be used to remove the handler.
     */
    EventManager.prototype.addEventListener = function (element, eventName, handler) {
        var plugin = this._findPluginFor(eventName);
        return plugin.addEventListener(element, eventName, handler);
    };
    /**
     * Registers a global handler for an event in a target view.
     *
     * @param target A target for global event notifications. One of "window", "document", or "body".
     * @param eventName The name of the event to listen for.
     * @param handler A function to call when the notification occurs. Receives the
     * event object as an argument.
     * @returns A callback function that can be used to remove the handler.
     */
    EventManager.prototype.addGlobalEventListener = function (target, eventName, handler) {
        var plugin = this._findPluginFor(eventName);
        return plugin.addGlobalEventListener(target, eventName, handler);
    };
    /**
     * Retrieves the compilation zone in which event listeners are registered.
     */
    EventManager.prototype.getZone = function () { return this._zone; };
    /** @internal */
    EventManager.prototype._findPluginFor = function (eventName) {
        var plugin = this._eventNameToPlugin.get(eventName);
        if (plugin) {
            return plugin;
        }
        var plugins = this._plugins;
        for (var i = 0; i < plugins.length; i++) {
            var plugin_1 = plugins[i];
            if (plugin_1.supports(eventName)) {
                this._eventNameToPlugin.set(eventName, plugin_1);
                return plugin_1;
            }
        }
        throw new Error("No event manager plugin found for event " + eventName);
    };
    EventManager = __decorate([
        Injectable(),
        __param(0, Inject(EVENT_MANAGER_PLUGINS)),
        __metadata("design:paramtypes", [Array, NgZone])
    ], EventManager);
    return EventManager;
}());
export { EventManager };
var EventManagerPlugin = /** @class */ (function () {
    function EventManagerPlugin(_doc) {
        this._doc = _doc;
    }
    EventManagerPlugin.prototype.addGlobalEventListener = function (element, eventName, handler) {
        var target = getDOM().getGlobalEventTarget(this._doc, element);
        if (!target) {
            throw new Error("Unsupported event target " + target + " for event " + eventName);
        }
        return this.addEventListener(target, eventName, handler);
    };
    return EventManagerPlugin;
}());
export { EventManagerPlugin };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3BsYXRmb3JtLWJyb3dzZXIvc3JjL2RvbS9ldmVudHMvZXZlbnRfbWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLE9BQU8sSUFBSSxNQUFNLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNsRCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXpFOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsSUFBTSxxQkFBcUIsR0FDOUIsSUFBSSxjQUFjLENBQXVCLHFCQUFxQixDQUFDLENBQUM7QUFFcEU7Ozs7O0dBS0c7QUFFSDtJQUlFOztPQUVHO0lBQ0gsc0JBQTJDLE9BQTZCLEVBQVUsS0FBYTtRQUEvRixpQkFHQztRQUhpRixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBTHZGLHVCQUFrQixHQUFHLElBQUksR0FBRyxFQUE4QixDQUFDO1FBTWpFLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsT0FBTyxHQUFHLEtBQUksRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzVDLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILHVDQUFnQixHQUFoQixVQUFpQixPQUFvQixFQUFFLFNBQWlCLEVBQUUsT0FBaUI7UUFDekUsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QyxPQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILDZDQUFzQixHQUF0QixVQUF1QixNQUFjLEVBQUUsU0FBaUIsRUFBRSxPQUFpQjtRQUN6RSxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlDLE9BQU8sTUFBTSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVEOztPQUVHO0lBQ0gsOEJBQU8sR0FBUCxjQUFvQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRXhDLGdCQUFnQjtJQUNoQixxQ0FBYyxHQUFkLFVBQWUsU0FBaUI7UUFDOUIsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0RCxJQUFJLE1BQU0sRUFBRTtZQUNWLE9BQU8sTUFBTSxDQUFDO1NBQ2Y7UUFFRCxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzlCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3ZDLElBQU0sUUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLFFBQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFFBQU0sQ0FBQyxDQUFDO2dCQUMvQyxPQUFPLFFBQU0sQ0FBQzthQUNmO1NBQ0Y7UUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLDZDQUEyQyxTQUFXLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBN0RVLFlBQVk7UUFEeEIsVUFBVSxFQUFFO1FBUUUsV0FBQSxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQTtnREFBK0MsTUFBTTtPQVBwRixZQUFZLENBOER4QjtJQUFELG1CQUFDO0NBQUEsQUE5REQsSUE4REM7U0E5RFksWUFBWTtBQWdFekI7SUFDRSw0QkFBb0IsSUFBUztRQUFULFNBQUksR0FBSixJQUFJLENBQUs7SUFBRyxDQUFDO0lBU2pDLG1EQUFzQixHQUF0QixVQUF1QixPQUFlLEVBQUUsU0FBaUIsRUFBRSxPQUFpQjtRQUMxRSxJQUFNLE1BQU0sR0FBZ0IsTUFBTSxFQUFFLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBNEIsTUFBTSxtQkFBYyxTQUFXLENBQUMsQ0FBQztTQUM5RTtRQUNELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUNILHlCQUFDO0FBQUQsQ0FBQyxBQWpCRCxJQWlCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHvJtWdldERPTSBhcyBnZXRET019IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogVGhlIGluamVjdGlvbiB0b2tlbiBmb3IgdGhlIGV2ZW50LW1hbmFnZXIgcGx1Zy1pbiBzZXJ2aWNlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IEVWRU5UX01BTkFHRVJfUExVR0lOUyA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPEV2ZW50TWFuYWdlclBsdWdpbltdPignRXZlbnRNYW5hZ2VyUGx1Z2lucycpO1xuXG4vKipcbiAqIEFuIGluamVjdGFibGUgc2VydmljZSB0aGF0IHByb3ZpZGVzIGV2ZW50IG1hbmFnZW1lbnQgZm9yIEFuZ3VsYXJcbiAqIHRocm91Z2ggYSBicm93c2VyIHBsdWctaW4uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRXZlbnRNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBfcGx1Z2luczogRXZlbnRNYW5hZ2VyUGx1Z2luW107XG4gIHByaXZhdGUgX2V2ZW50TmFtZVRvUGx1Z2luID0gbmV3IE1hcDxzdHJpbmcsIEV2ZW50TWFuYWdlclBsdWdpbj4oKTtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgYW4gaW5zdGFuY2Ugb2YgdGhlIGV2ZW50LW1hbmFnZXIgc2VydmljZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRVZFTlRfTUFOQUdFUl9QTFVHSU5TKSBwbHVnaW5zOiBFdmVudE1hbmFnZXJQbHVnaW5bXSwgcHJpdmF0ZSBfem9uZTogTmdab25lKSB7XG4gICAgcGx1Z2lucy5mb3JFYWNoKHAgPT4gcC5tYW5hZ2VyID0gdGhpcyk7XG4gICAgdGhpcy5fcGx1Z2lucyA9IHBsdWdpbnMuc2xpY2UoKS5yZXZlcnNlKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgaGFuZGxlciBmb3IgYSBzcGVjaWZpYyBlbGVtZW50IGFuZCBldmVudC5cbiAgICpcbiAgICogQHBhcmFtIGVsZW1lbnQgVGhlIEhUTUwgZWxlbWVudCB0byByZWNlaXZlIGV2ZW50IG5vdGlmaWNhdGlvbnMuXG4gICAqIEBwYXJhbSBldmVudE5hbWUgVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIGxpc3RlbiBmb3IuXG4gICAqIEBwYXJhbSBoYW5kbGVyIEEgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSBub3RpZmljYXRpb24gb2NjdXJzLiBSZWNlaXZlcyB0aGVcbiAgICogZXZlbnQgb2JqZWN0IGFzIGFuIGFyZ3VtZW50LlxuICAgKiBAcmV0dXJucyAgQSBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlbW92ZSB0aGUgaGFuZGxlci5cbiAgICovXG4gIGFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICBjb25zdCBwbHVnaW4gPSB0aGlzLl9maW5kUGx1Z2luRm9yKGV2ZW50TmFtZSk7XG4gICAgcmV0dXJuIHBsdWdpbi5hZGRFdmVudExpc3RlbmVyKGVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgZ2xvYmFsIGhhbmRsZXIgZm9yIGFuIGV2ZW50IGluIGEgdGFyZ2V0IHZpZXcuXG4gICAqXG4gICAqIEBwYXJhbSB0YXJnZXQgQSB0YXJnZXQgZm9yIGdsb2JhbCBldmVudCBub3RpZmljYXRpb25zLiBPbmUgb2YgXCJ3aW5kb3dcIiwgXCJkb2N1bWVudFwiLCBvciBcImJvZHlcIi5cbiAgICogQHBhcmFtIGV2ZW50TmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gbGlzdGVuIGZvci5cbiAgICogQHBhcmFtIGhhbmRsZXIgQSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlIG5vdGlmaWNhdGlvbiBvY2N1cnMuIFJlY2VpdmVzIHRoZVxuICAgKiBldmVudCBvYmplY3QgYXMgYW4gYXJndW1lbnQuXG4gICAqIEByZXR1cm5zIEEgY2FsbGJhY2sgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byByZW1vdmUgdGhlIGhhbmRsZXIuXG4gICAqL1xuICBhZGRHbG9iYWxFdmVudExpc3RlbmVyKHRhcmdldDogc3RyaW5nLCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgY29uc3QgcGx1Z2luID0gdGhpcy5fZmluZFBsdWdpbkZvcihldmVudE5hbWUpO1xuICAgIHJldHVybiBwbHVnaW4uYWRkR2xvYmFsRXZlbnRMaXN0ZW5lcih0YXJnZXQsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBjb21waWxhdGlvbiB6b25lIGluIHdoaWNoIGV2ZW50IGxpc3RlbmVycyBhcmUgcmVnaXN0ZXJlZC5cbiAgICovXG4gIGdldFpvbmUoKTogTmdab25lIHsgcmV0dXJuIHRoaXMuX3pvbmU7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9maW5kUGx1Z2luRm9yKGV2ZW50TmFtZTogc3RyaW5nKTogRXZlbnRNYW5hZ2VyUGx1Z2luIHtcbiAgICBjb25zdCBwbHVnaW4gPSB0aGlzLl9ldmVudE5hbWVUb1BsdWdpbi5nZXQoZXZlbnROYW1lKTtcbiAgICBpZiAocGx1Z2luKSB7XG4gICAgICByZXR1cm4gcGx1Z2luO1xuICAgIH1cblxuICAgIGNvbnN0IHBsdWdpbnMgPSB0aGlzLl9wbHVnaW5zO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGx1Z2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcGx1Z2luID0gcGx1Z2luc1tpXTtcbiAgICAgIGlmIChwbHVnaW4uc3VwcG9ydHMoZXZlbnROYW1lKSkge1xuICAgICAgICB0aGlzLl9ldmVudE5hbWVUb1BsdWdpbi5zZXQoZXZlbnROYW1lLCBwbHVnaW4pO1xuICAgICAgICByZXR1cm4gcGx1Z2luO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIGV2ZW50IG1hbmFnZXIgcGx1Z2luIGZvdW5kIGZvciBldmVudCAke2V2ZW50TmFtZX1gKTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRXZlbnRNYW5hZ2VyUGx1Z2luIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZG9jOiBhbnkpIHt9XG5cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIG1hbmFnZXIgITogRXZlbnRNYW5hZ2VyO1xuXG4gIGFic3RyYWN0IHN1cHBvcnRzKGV2ZW50TmFtZTogc3RyaW5nKTogYm9vbGVhbjtcblxuICBhYnN0cmFjdCBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbjtcblxuICBhZGRHbG9iYWxFdmVudExpc3RlbmVyKGVsZW1lbnQ6IHN0cmluZywgZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICAgIGNvbnN0IHRhcmdldDogSFRNTEVsZW1lbnQgPSBnZXRET00oKS5nZXRHbG9iYWxFdmVudFRhcmdldCh0aGlzLl9kb2MsIGVsZW1lbnQpO1xuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGV2ZW50IHRhcmdldCAke3RhcmdldH0gZm9yIGV2ZW50ICR7ZXZlbnROYW1lfWApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5hZGRFdmVudExpc3RlbmVyKHRhcmdldCwgZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgfVxufVxuIl19