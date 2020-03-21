/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("angular/packages/zone.js/lib/node/events", ["require", "exports", "angular/packages/zone.js/lib/common/events"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var events_1 = require("angular/packages/zone.js/lib/common/events");
    Zone.__load_patch('EventEmitter', function (global) {
        // For EventEmitter
        var EE_ADD_LISTENER = 'addListener';
        var EE_PREPEND_LISTENER = 'prependListener';
        var EE_REMOVE_LISTENER = 'removeListener';
        var EE_REMOVE_ALL_LISTENER = 'removeAllListeners';
        var EE_LISTENERS = 'listeners';
        var EE_ON = 'on';
        var compareTaskCallbackVsDelegate = function (task, delegate) {
            // same callback, same capture, same event name, just return
            return task.callback === delegate || task.callback.listener === delegate;
        };
        var eventNameToString = function (eventName) {
            if (typeof eventName === 'string') {
                return eventName;
            }
            if (!eventName) {
                return '';
            }
            return eventName.toString().replace('(', '_').replace(')', '_');
        };
        function patchEventEmitterMethods(obj) {
            var result = events_1.patchEventTarget(global, [obj], {
                useG: false,
                add: EE_ADD_LISTENER,
                rm: EE_REMOVE_LISTENER,
                prepend: EE_PREPEND_LISTENER,
                rmAll: EE_REMOVE_ALL_LISTENER,
                listeners: EE_LISTENERS,
                chkDup: false,
                rt: true,
                diff: compareTaskCallbackVsDelegate,
                eventNameToString: eventNameToString
            });
            if (result && result[0]) {
                obj[EE_ON] = obj[EE_ADD_LISTENER];
            }
        }
        // EventEmitter
        var events;
        try {
            events = require('events');
        }
        catch (err) {
        }
        if (events && events.EventEmitter) {
            patchEventEmitterMethods(events.EventEmitter.prototype);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvem9uZS5qcy9saWIvbm9kZS9ldmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCxxRUFBa0Q7SUFFbEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsVUFBQyxNQUFXO1FBQzVDLG1CQUFtQjtRQUNuQixJQUFNLGVBQWUsR0FBRyxhQUFhLENBQUM7UUFDdEMsSUFBTSxtQkFBbUIsR0FBRyxpQkFBaUIsQ0FBQztRQUM5QyxJQUFNLGtCQUFrQixHQUFHLGdCQUFnQixDQUFDO1FBQzVDLElBQU0sc0JBQXNCLEdBQUcsb0JBQW9CLENBQUM7UUFDcEQsSUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBQ2pDLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQztRQUVuQixJQUFNLDZCQUE2QixHQUFHLFVBQVMsSUFBUyxFQUFFLFFBQWE7WUFDckUsNERBQTREO1lBQzVELE9BQU8sSUFBSSxDQUFDLFFBQVEsS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDO1FBQzNFLENBQUMsQ0FBQztRQUVGLElBQU0saUJBQWlCLEdBQUcsVUFBUyxTQUF3QjtZQUN6RCxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsRUFBRTtnQkFDakMsT0FBTyxTQUFtQixDQUFDO2FBQzVCO1lBQ0QsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDZCxPQUFPLEVBQUUsQ0FBQzthQUNYO1lBQ0QsT0FBTyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xFLENBQUMsQ0FBQztRQUVGLFNBQVMsd0JBQXdCLENBQUMsR0FBUTtZQUN4QyxJQUFNLE1BQU0sR0FBRyx5QkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDN0MsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsR0FBRyxFQUFFLGVBQWU7Z0JBQ3BCLEVBQUUsRUFBRSxrQkFBa0I7Z0JBQ3RCLE9BQU8sRUFBRSxtQkFBbUI7Z0JBQzVCLEtBQUssRUFBRSxzQkFBc0I7Z0JBQzdCLFNBQVMsRUFBRSxZQUFZO2dCQUN2QixNQUFNLEVBQUUsS0FBSztnQkFDYixFQUFFLEVBQUUsSUFBSTtnQkFDUixJQUFJLEVBQUUsNkJBQTZCO2dCQUNuQyxpQkFBaUIsRUFBRSxpQkFBaUI7YUFDckMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN2QixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQ25DO1FBQ0gsQ0FBQztRQUVELGVBQWU7UUFDZixJQUFJLE1BQU0sQ0FBQztRQUNYLElBQUk7WUFDRixNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzVCO1FBQUMsT0FBTyxHQUFHLEVBQUU7U0FDYjtRQUVELElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUU7WUFDakMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUN6RDtJQUNILENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3BhdGNoRXZlbnRUYXJnZXR9IGZyb20gJy4uL2NvbW1vbi9ldmVudHMnO1xuXG5ab25lLl9fbG9hZF9wYXRjaCgnRXZlbnRFbWl0dGVyJywgKGdsb2JhbDogYW55KSA9PiB7XG4gIC8vIEZvciBFdmVudEVtaXR0ZXJcbiAgY29uc3QgRUVfQUREX0xJU1RFTkVSID0gJ2FkZExpc3RlbmVyJztcbiAgY29uc3QgRUVfUFJFUEVORF9MSVNURU5FUiA9ICdwcmVwZW5kTGlzdGVuZXInO1xuICBjb25zdCBFRV9SRU1PVkVfTElTVEVORVIgPSAncmVtb3ZlTGlzdGVuZXInO1xuICBjb25zdCBFRV9SRU1PVkVfQUxMX0xJU1RFTkVSID0gJ3JlbW92ZUFsbExpc3RlbmVycyc7XG4gIGNvbnN0IEVFX0xJU1RFTkVSUyA9ICdsaXN0ZW5lcnMnO1xuICBjb25zdCBFRV9PTiA9ICdvbic7XG5cbiAgY29uc3QgY29tcGFyZVRhc2tDYWxsYmFja1ZzRGVsZWdhdGUgPSBmdW5jdGlvbih0YXNrOiBhbnksIGRlbGVnYXRlOiBhbnkpIHtcbiAgICAvLyBzYW1lIGNhbGxiYWNrLCBzYW1lIGNhcHR1cmUsIHNhbWUgZXZlbnQgbmFtZSwganVzdCByZXR1cm5cbiAgICByZXR1cm4gdGFzay5jYWxsYmFjayA9PT0gZGVsZWdhdGUgfHwgdGFzay5jYWxsYmFjay5saXN0ZW5lciA9PT0gZGVsZWdhdGU7XG4gIH07XG5cbiAgY29uc3QgZXZlbnROYW1lVG9TdHJpbmcgPSBmdW5jdGlvbihldmVudE5hbWU6IHN0cmluZ3xTeW1ib2wpIHtcbiAgICBpZiAodHlwZW9mIGV2ZW50TmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBldmVudE5hbWUgYXMgc3RyaW5nO1xuICAgIH1cbiAgICBpZiAoIWV2ZW50TmFtZSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gZXZlbnROYW1lLnRvU3RyaW5nKCkucmVwbGFjZSgnKCcsICdfJykucmVwbGFjZSgnKScsICdfJyk7XG4gIH07XG5cbiAgZnVuY3Rpb24gcGF0Y2hFdmVudEVtaXR0ZXJNZXRob2RzKG9iajogYW55KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gcGF0Y2hFdmVudFRhcmdldChnbG9iYWwsIFtvYmpdLCB7XG4gICAgICB1c2VHOiBmYWxzZSxcbiAgICAgIGFkZDogRUVfQUREX0xJU1RFTkVSLFxuICAgICAgcm06IEVFX1JFTU9WRV9MSVNURU5FUixcbiAgICAgIHByZXBlbmQ6IEVFX1BSRVBFTkRfTElTVEVORVIsXG4gICAgICBybUFsbDogRUVfUkVNT1ZFX0FMTF9MSVNURU5FUixcbiAgICAgIGxpc3RlbmVyczogRUVfTElTVEVORVJTLFxuICAgICAgY2hrRHVwOiBmYWxzZSxcbiAgICAgIHJ0OiB0cnVlLFxuICAgICAgZGlmZjogY29tcGFyZVRhc2tDYWxsYmFja1ZzRGVsZWdhdGUsXG4gICAgICBldmVudE5hbWVUb1N0cmluZzogZXZlbnROYW1lVG9TdHJpbmdcbiAgICB9KTtcbiAgICBpZiAocmVzdWx0ICYmIHJlc3VsdFswXSkge1xuICAgICAgb2JqW0VFX09OXSA9IG9ialtFRV9BRERfTElTVEVORVJdO1xuICAgIH1cbiAgfVxuXG4gIC8vIEV2ZW50RW1pdHRlclxuICBsZXQgZXZlbnRzO1xuICB0cnkge1xuICAgIGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgfVxuXG4gIGlmIChldmVudHMgJiYgZXZlbnRzLkV2ZW50RW1pdHRlcikge1xuICAgIHBhdGNoRXZlbnRFbWl0dGVyTWV0aG9kcyhldmVudHMuRXZlbnRFbWl0dGVyLnByb3RvdHlwZSk7XG4gIH1cbn0pO1xuIl19