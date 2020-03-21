/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview
 * @suppress {globalThis}
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("angular/packages/zone.js/lib/browser/property-descriptor", ["require", "exports", "angular/packages/zone.js/lib/common/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils_1 = require("angular/packages/zone.js/lib/common/utils");
    var globalEventHandlersEventNames = [
        'abort',
        'animationcancel',
        'animationend',
        'animationiteration',
        'auxclick',
        'beforeinput',
        'blur',
        'cancel',
        'canplay',
        'canplaythrough',
        'change',
        'compositionstart',
        'compositionupdate',
        'compositionend',
        'cuechange',
        'click',
        'close',
        'contextmenu',
        'curechange',
        'dblclick',
        'drag',
        'dragend',
        'dragenter',
        'dragexit',
        'dragleave',
        'dragover',
        'drop',
        'durationchange',
        'emptied',
        'ended',
        'error',
        'focus',
        'focusin',
        'focusout',
        'gotpointercapture',
        'input',
        'invalid',
        'keydown',
        'keypress',
        'keyup',
        'load',
        'loadstart',
        'loadeddata',
        'loadedmetadata',
        'lostpointercapture',
        'mousedown',
        'mouseenter',
        'mouseleave',
        'mousemove',
        'mouseout',
        'mouseover',
        'mouseup',
        'mousewheel',
        'orientationchange',
        'pause',
        'play',
        'playing',
        'pointercancel',
        'pointerdown',
        'pointerenter',
        'pointerleave',
        'pointerlockchange',
        'mozpointerlockchange',
        'webkitpointerlockerchange',
        'pointerlockerror',
        'mozpointerlockerror',
        'webkitpointerlockerror',
        'pointermove',
        'pointout',
        'pointerover',
        'pointerup',
        'progress',
        'ratechange',
        'reset',
        'resize',
        'scroll',
        'seeked',
        'seeking',
        'select',
        'selectionchange',
        'selectstart',
        'show',
        'sort',
        'stalled',
        'submit',
        'suspend',
        'timeupdate',
        'volumechange',
        'touchcancel',
        'touchmove',
        'touchstart',
        'touchend',
        'transitioncancel',
        'transitionend',
        'waiting',
        'wheel'
    ];
    var documentEventNames = [
        'afterscriptexecute', 'beforescriptexecute', 'DOMContentLoaded', 'freeze', 'fullscreenchange',
        'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange', 'fullscreenerror',
        'mozfullscreenerror', 'webkitfullscreenerror', 'msfullscreenerror', 'readystatechange',
        'visibilitychange', 'resume'
    ];
    var windowEventNames = [
        'absolutedeviceorientation',
        'afterinput',
        'afterprint',
        'appinstalled',
        'beforeinstallprompt',
        'beforeprint',
        'beforeunload',
        'devicelight',
        'devicemotion',
        'deviceorientation',
        'deviceorientationabsolute',
        'deviceproximity',
        'hashchange',
        'languagechange',
        'message',
        'mozbeforepaint',
        'offline',
        'online',
        'paint',
        'pageshow',
        'pagehide',
        'popstate',
        'rejectionhandled',
        'storage',
        'unhandledrejection',
        'unload',
        'userproximity',
        'vrdisplyconnected',
        'vrdisplaydisconnected',
        'vrdisplaypresentchange'
    ];
    var htmlElementEventNames = [
        'beforecopy', 'beforecut', 'beforepaste', 'copy', 'cut', 'paste', 'dragstart', 'loadend',
        'animationstart', 'search', 'transitionrun', 'transitionstart', 'webkitanimationend',
        'webkitanimationiteration', 'webkitanimationstart', 'webkittransitionend'
    ];
    var mediaElementEventNames = ['encrypted', 'waitingforkey', 'msneedkey', 'mozinterruptbegin', 'mozinterruptend'];
    var ieElementEventNames = [
        'activate',
        'afterupdate',
        'ariarequest',
        'beforeactivate',
        'beforedeactivate',
        'beforeeditfocus',
        'beforeupdate',
        'cellchange',
        'controlselect',
        'dataavailable',
        'datasetchanged',
        'datasetcomplete',
        'errorupdate',
        'filterchange',
        'layoutcomplete',
        'losecapture',
        'move',
        'moveend',
        'movestart',
        'propertychange',
        'resizeend',
        'resizestart',
        'rowenter',
        'rowexit',
        'rowsdelete',
        'rowsinserted',
        'command',
        'compassneedscalibration',
        'deactivate',
        'help',
        'mscontentzoom',
        'msmanipulationstatechanged',
        'msgesturechange',
        'msgesturedoubletap',
        'msgestureend',
        'msgesturehold',
        'msgesturestart',
        'msgesturetap',
        'msgotpointercapture',
        'msinertiastart',
        'mslostpointercapture',
        'mspointercancel',
        'mspointerdown',
        'mspointerenter',
        'mspointerhover',
        'mspointerleave',
        'mspointermove',
        'mspointerout',
        'mspointerover',
        'mspointerup',
        'pointerout',
        'mssitemodejumplistitemremoved',
        'msthumbnailclick',
        'stop',
        'storagecommit'
    ];
    var webglEventNames = ['webglcontextrestored', 'webglcontextlost', 'webglcontextcreationerror'];
    var formEventNames = ['autocomplete', 'autocompleteerror'];
    var detailEventNames = ['toggle'];
    var frameEventNames = ['load'];
    var frameSetEventNames = ['blur', 'error', 'focus', 'load', 'resize', 'scroll', 'messageerror'];
    var marqueeEventNames = ['bounce', 'finish', 'start'];
    var XMLHttpRequestEventNames = [
        'loadstart', 'progress', 'abort', 'error', 'load', 'progress', 'timeout', 'loadend',
        'readystatechange'
    ];
    var IDBIndexEventNames = ['upgradeneeded', 'complete', 'abort', 'success', 'error', 'blocked', 'versionchange', 'close'];
    var websocketEventNames = ['close', 'error', 'open', 'message'];
    var workerEventNames = ['error', 'message'];
    exports.eventNames = globalEventHandlersEventNames.concat(webglEventNames, formEventNames, detailEventNames, documentEventNames, windowEventNames, htmlElementEventNames, ieElementEventNames);
    function filterProperties(target, onProperties, ignoreProperties) {
        if (!ignoreProperties || ignoreProperties.length === 0) {
            return onProperties;
        }
        var tip = ignoreProperties.filter(function (ip) { return ip.target === target; });
        if (!tip || tip.length === 0) {
            return onProperties;
        }
        var targetIgnoreProperties = tip[0].ignoreProperties;
        return onProperties.filter(function (op) { return targetIgnoreProperties.indexOf(op) === -1; });
    }
    exports.filterProperties = filterProperties;
    function patchFilteredProperties(target, onProperties, ignoreProperties, prototype) {
        // check whether target is available, sometimes target will be undefined
        // because different browser or some 3rd party plugin.
        if (!target) {
            return;
        }
        var filteredProperties = filterProperties(target, onProperties, ignoreProperties);
        utils_1.patchOnProperties(target, filteredProperties, prototype);
    }
    exports.patchFilteredProperties = patchFilteredProperties;
    function propertyDescriptorPatch(api, _global) {
        if (utils_1.isNode && !utils_1.isMix) {
            return;
        }
        if (Zone[api.symbol('patchEvents')]) {
            // events are already been patched by legacy patch.
            return;
        }
        var supportsWebSocket = typeof WebSocket !== 'undefined';
        var ignoreProperties = _global['__Zone_ignore_on_properties'];
        // for browsers that we can patch the descriptor:  Chrome & Firefox
        if (utils_1.isBrowser) {
            var internalWindow = window;
            var ignoreErrorProperties = utils_1.isIE ? [{ target: internalWindow, ignoreProperties: ['error'] }] : [];
            // in IE/Edge, onProp not exist in window object, but in WindowPrototype
            // so we need to pass WindowPrototype to check onProp exist or not
            patchFilteredProperties(internalWindow, exports.eventNames.concat(['messageerror']), ignoreProperties ? ignoreProperties.concat(ignoreErrorProperties) : ignoreProperties, utils_1.ObjectGetPrototypeOf(internalWindow));
            patchFilteredProperties(Document.prototype, exports.eventNames, ignoreProperties);
            if (typeof internalWindow['SVGElement'] !== 'undefined') {
                patchFilteredProperties(internalWindow['SVGElement'].prototype, exports.eventNames, ignoreProperties);
            }
            patchFilteredProperties(Element.prototype, exports.eventNames, ignoreProperties);
            patchFilteredProperties(HTMLElement.prototype, exports.eventNames, ignoreProperties);
            patchFilteredProperties(HTMLMediaElement.prototype, mediaElementEventNames, ignoreProperties);
            patchFilteredProperties(HTMLFrameSetElement.prototype, windowEventNames.concat(frameSetEventNames), ignoreProperties);
            patchFilteredProperties(HTMLBodyElement.prototype, windowEventNames.concat(frameSetEventNames), ignoreProperties);
            patchFilteredProperties(HTMLFrameElement.prototype, frameEventNames, ignoreProperties);
            patchFilteredProperties(HTMLIFrameElement.prototype, frameEventNames, ignoreProperties);
            var HTMLMarqueeElement_1 = internalWindow['HTMLMarqueeElement'];
            if (HTMLMarqueeElement_1) {
                patchFilteredProperties(HTMLMarqueeElement_1.prototype, marqueeEventNames, ignoreProperties);
            }
            var Worker_1 = internalWindow['Worker'];
            if (Worker_1) {
                patchFilteredProperties(Worker_1.prototype, workerEventNames, ignoreProperties);
            }
        }
        var XMLHttpRequest = _global['XMLHttpRequest'];
        if (XMLHttpRequest) {
            // XMLHttpRequest is not available in ServiceWorker, so we need to check here
            patchFilteredProperties(XMLHttpRequest.prototype, XMLHttpRequestEventNames, ignoreProperties);
        }
        var XMLHttpRequestEventTarget = _global['XMLHttpRequestEventTarget'];
        if (XMLHttpRequestEventTarget) {
            patchFilteredProperties(XMLHttpRequestEventTarget && XMLHttpRequestEventTarget.prototype, XMLHttpRequestEventNames, ignoreProperties);
        }
        if (typeof IDBIndex !== 'undefined') {
            patchFilteredProperties(IDBIndex.prototype, IDBIndexEventNames, ignoreProperties);
            patchFilteredProperties(IDBRequest.prototype, IDBIndexEventNames, ignoreProperties);
            patchFilteredProperties(IDBOpenDBRequest.prototype, IDBIndexEventNames, ignoreProperties);
            patchFilteredProperties(IDBDatabase.prototype, IDBIndexEventNames, ignoreProperties);
            patchFilteredProperties(IDBTransaction.prototype, IDBIndexEventNames, ignoreProperties);
            patchFilteredProperties(IDBCursor.prototype, IDBIndexEventNames, ignoreProperties);
        }
        if (supportsWebSocket) {
            patchFilteredProperties(WebSocket.prototype, websocketEventNames, ignoreProperties);
        }
    }
    exports.propertyDescriptorPatch = propertyDescriptorPatch;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHktZGVzY3JpcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3pvbmUuanMvbGliL2Jyb3dzZXIvcHJvcGVydHktZGVzY3JpcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSDs7O0dBR0c7Ozs7Ozs7Ozs7OztJQUVILG1FQUF3RztJQUV4RyxJQUFNLDZCQUE2QixHQUFHO1FBQ3BDLE9BQU87UUFDUCxpQkFBaUI7UUFDakIsY0FBYztRQUNkLG9CQUFvQjtRQUNwQixVQUFVO1FBQ1YsYUFBYTtRQUNiLE1BQU07UUFDTixRQUFRO1FBQ1IsU0FBUztRQUNULGdCQUFnQjtRQUNoQixRQUFRO1FBQ1Isa0JBQWtCO1FBQ2xCLG1CQUFtQjtRQUNuQixnQkFBZ0I7UUFDaEIsV0FBVztRQUNYLE9BQU87UUFDUCxPQUFPO1FBQ1AsYUFBYTtRQUNiLFlBQVk7UUFDWixVQUFVO1FBQ1YsTUFBTTtRQUNOLFNBQVM7UUFDVCxXQUFXO1FBQ1gsVUFBVTtRQUNWLFdBQVc7UUFDWCxVQUFVO1FBQ1YsTUFBTTtRQUNOLGdCQUFnQjtRQUNoQixTQUFTO1FBQ1QsT0FBTztRQUNQLE9BQU87UUFDUCxPQUFPO1FBQ1AsU0FBUztRQUNULFVBQVU7UUFDVixtQkFBbUI7UUFDbkIsT0FBTztRQUNQLFNBQVM7UUFDVCxTQUFTO1FBQ1QsVUFBVTtRQUNWLE9BQU87UUFDUCxNQUFNO1FBQ04sV0FBVztRQUNYLFlBQVk7UUFDWixnQkFBZ0I7UUFDaEIsb0JBQW9CO1FBQ3BCLFdBQVc7UUFDWCxZQUFZO1FBQ1osWUFBWTtRQUNaLFdBQVc7UUFDWCxVQUFVO1FBQ1YsV0FBVztRQUNYLFNBQVM7UUFDVCxZQUFZO1FBQ1osbUJBQW1CO1FBQ25CLE9BQU87UUFDUCxNQUFNO1FBQ04sU0FBUztRQUNULGVBQWU7UUFDZixhQUFhO1FBQ2IsY0FBYztRQUNkLGNBQWM7UUFDZCxtQkFBbUI7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Q0FBQyxTQUFTLEVBQUUsd0JBQXdCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztTQUMvRjtRQUNELElBQU0seUJBQXlCLEdBQUcsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDdkUsSUFBSSx5QkFBeUIsRUFBRTtZQUM3Qix1QkFBdUIsQ0FDbkIseUJBQXlCLElBQUkseUJBQXlCLENBQUMsU0FBUyxFQUFFLHdCQUF3QixFQUMxRixnQkFBZ0IsQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLEVBQUU7WUFDbkMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxrQkFBa0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2xGLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUNwRix1QkFBdUIsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUMxRix1QkFBdUIsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLGtCQUFrQixFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDckYsdUJBQXVCLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxrQkFBa0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3hGLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztTQUNwRjtRQUNELElBQUksaUJBQWlCLEVBQUU7WUFDckIsdUJBQXVCLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1NBQ3JGO0lBQ0gsQ0FBQztJQXBFRCwwREFvRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXdcbiAqIEBzdXBwcmVzcyB7Z2xvYmFsVGhpc31cbiAqL1xuXG5pbXBvcnQge09iamVjdEdldFByb3RvdHlwZU9mLCBpc0Jyb3dzZXIsIGlzSUUsIGlzTWl4LCBpc05vZGUsIHBhdGNoT25Qcm9wZXJ0aWVzfSBmcm9tICcuLi9jb21tb24vdXRpbHMnO1xuXG5jb25zdCBnbG9iYWxFdmVudEhhbmRsZXJzRXZlbnROYW1lcyA9IFtcbiAgJ2Fib3J0JyxcbiAgJ2FuaW1hdGlvbmNhbmNlbCcsXG4gICdhbmltYXRpb25lbmQnLFxuICAnYW5pbWF0aW9uaXRlcmF0aW9uJyxcbiAgJ2F1eGNsaWNrJyxcbiAgJ2JlZm9yZWlucHV0JyxcbiAgJ2JsdXInLFxuICAnY2FuY2VsJyxcbiAgJ2NhbnBsYXknLFxuICAnY2FucGxheXRocm91Z2gnLFxuICAnY2hhbmdlJyxcbiAgJ2NvbXBvc2l0aW9uc3RhcnQnLFxuICAnY29tcG9zaXRpb251cGRhdGUnLFxuICAnY29tcG9zaXRpb25lbmQnLFxuICAnY3VlY2hhbmdlJyxcbiAgJ2NsaWNrJyxcbiAgJ2Nsb3NlJyxcbiAgJ2NvbnRleHRtZW51JyxcbiAgJ2N1cmVjaGFuZ2UnLFxuICAnZGJsY2xpY2snLFxuICAnZHJhZycsXG4gICdkcmFnZW5kJyxcbiAgJ2RyYWdlbnRlcicsXG4gICdkcmFnZXhpdCcsXG4gICdkcmFnbGVhdmUnLFxuICAnZHJhZ292ZXInLFxuICAnZHJvcCcsXG4gICdkdXJhdGlvbmNoYW5nZScsXG4gICdlbXB0aWVkJyxcbiAgJ2VuZGVkJyxcbiAgJ2Vycm9yJyxcbiAgJ2ZvY3VzJyxcbiAgJ2ZvY3VzaW4nLFxuICAnZm9jdXNvdXQnLFxuICAnZ290cG9pbnRlcmNhcHR1cmUnLFxuICAnaW5wdXQnLFxuICAnaW52YWxpZCcsXG4gICdrZXlkb3duJyxcbiAgJ2tleXByZXNzJyxcbiAgJ2tleXVwJyxcbiAgJ2xvYWQnLFxuICAnbG9hZHN0YXJ0JyxcbiAgJ2xvYWRlZGRhdGEnLFxuICAnbG9hZGVkbWV0YWRhdGEnLFxuICAnbG9zdHBvaW50ZXJjYXB0dXJlJyxcbiAgJ21vdXNlZG93bicsXG4gICdtb3VzZWVudGVyJyxcbiAgJ21vdXNlbGVhdmUnLFxuICAnbW91c2Vtb3ZlJyxcbiAgJ21vdXNlb3V0JyxcbiAgJ21vdXNlb3ZlcicsXG4gICdtb3VzZXVwJyxcbiAgJ21vdXNld2hlZWwnLFxuICAnb3JpZW50YXRpb25jaGFuZ2UnLFxuICAncGF1c2UnLFxuICAncGxheScsXG4gICdwbGF5aW5nJyxcbiAgJ3BvaW50ZXJjYW5jZWwnLFxuICAncG9pbnRlcmRvd24nLFxuICAncG9pbnRlcmVudGVyJyxcbiAgJ3BvaW50ZXJsZWF2ZScsXG4gICdwb2ludGVybG9ja2NoYW5nZScsXG4gICdtb3pwb2ludGVybG9ja2NoYW5nZScsXG4gICd3ZWJraXRwb2ludGVybG9ja2VyY2hhbmdlJyxcbiAgJ3BvaW50ZXJsb2NrZXJyb3InLFxuICAnbW96cG9pbnRlcmxvY2tlcnJvcicsXG4gICd3ZWJraXRwb2ludGVybG9ja2Vycm9yJyxcbiAgJ3BvaW50ZXJtb3ZlJyxcbiAgJ3BvaW50b3V0JyxcbiAgJ3BvaW50ZXJvdmVyJyxcbiAgJ3BvaW50ZXJ1cCcsXG4gICdwcm9ncmVzcycsXG4gICdyYXRlY2hhbmdlJyxcbiAgJ3Jlc2V0JyxcbiAgJ3Jlc2l6ZScsXG4gICdzY3JvbGwnLFxuICAnc2Vla2VkJyxcbiAgJ3NlZWtpbmcnLFxuICAnc2VsZWN0JyxcbiAgJ3NlbGVjdGlvbmNoYW5nZScsXG4gICdzZWxlY3RzdGFydCcsXG4gICdzaG93JyxcbiAgJ3NvcnQnLFxuICAnc3RhbGxlZCcsXG4gICdzdWJtaXQnLFxuICAnc3VzcGVuZCcsXG4gICd0aW1ldXBkYXRlJyxcbiAgJ3ZvbHVtZWNoYW5nZScsXG4gICd0b3VjaGNhbmNlbCcsXG4gICd0b3VjaG1vdmUnLFxuICAndG91Y2hzdGFydCcsXG4gICd0b3VjaGVuZCcsXG4gICd0cmFuc2l0aW9uY2FuY2VsJyxcbiAgJ3RyYW5zaXRpb25lbmQnLFxuICAnd2FpdGluZycsXG4gICd3aGVlbCdcbl07XG5jb25zdCBkb2N1bWVudEV2ZW50TmFtZXMgPSBbXG4gICdhZnRlcnNjcmlwdGV4ZWN1dGUnLCAnYmVmb3Jlc2NyaXB0ZXhlY3V0ZScsICdET01Db250ZW50TG9hZGVkJywgJ2ZyZWV6ZScsICdmdWxsc2NyZWVuY2hhbmdlJyxcbiAgJ21vemZ1bGxzY3JlZW5jaGFuZ2UnLCAnd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsICdtc2Z1bGxzY3JlZW5jaGFuZ2UnLCAnZnVsbHNjcmVlbmVycm9yJyxcbiAgJ21vemZ1bGxzY3JlZW5lcnJvcicsICd3ZWJraXRmdWxsc2NyZWVuZXJyb3InLCAnbXNmdWxsc2NyZWVuZXJyb3InLCAncmVhZHlzdGF0ZWNoYW5nZScsXG4gICd2aXNpYmlsaXR5Y2hhbmdlJywgJ3Jlc3VtZSdcbl07XG5jb25zdCB3aW5kb3dFdmVudE5hbWVzID0gW1xuICAnYWJzb2x1dGVkZXZpY2VvcmllbnRhdGlvbicsXG4gICdhZnRlcmlucHV0JyxcbiAgJ2FmdGVycHJpbnQnLFxuICAnYXBwaW5zdGFsbGVkJyxcbiAgJ2JlZm9yZWluc3RhbGxwcm9tcHQnLFxuICAnYmVmb3JlcHJpbnQnLFxuICAnYmVmb3JldW5sb2FkJyxcbiAgJ2RldmljZWxpZ2h0JyxcbiAgJ2RldmljZW1vdGlvbicsXG4gICdkZXZpY2VvcmllbnRhdGlvbicsXG4gICdkZXZpY2VvcmllbnRhdGlvbmFic29sdXRlJyxcbiAgJ2RldmljZXByb3hpbWl0eScsXG4gICdoYXNoY2hhbmdlJyxcbiAgJ2xhbmd1YWdlY2hhbmdlJyxcbiAgJ21lc3NhZ2UnLFxuICAnbW96YmVmb3JlcGFpbnQnLFxuICAnb2ZmbGluZScsXG4gICdvbmxpbmUnLFxuICAncGFpbnQnLFxuICAncGFnZXNob3cnLFxuICAncGFnZWhpZGUnLFxuICAncG9wc3RhdGUnLFxuICAncmVqZWN0aW9uaGFuZGxlZCcsXG4gICdzdG9yYWdlJyxcbiAgJ3VuaGFuZGxlZHJlamVjdGlvbicsXG4gICd1bmxvYWQnLFxuICAndXNlcnByb3hpbWl0eScsXG4gICd2cmRpc3BseWNvbm5lY3RlZCcsXG4gICd2cmRpc3BsYXlkaXNjb25uZWN0ZWQnLFxuICAndnJkaXNwbGF5cHJlc2VudGNoYW5nZSdcbl07XG5jb25zdCBodG1sRWxlbWVudEV2ZW50TmFtZXMgPSBbXG4gICdiZWZvcmVjb3B5JywgJ2JlZm9yZWN1dCcsICdiZWZvcmVwYXN0ZScsICdjb3B5JywgJ2N1dCcsICdwYXN0ZScsICdkcmFnc3RhcnQnLCAnbG9hZGVuZCcsXG4gICdhbmltYXRpb25zdGFydCcsICdzZWFyY2gnLCAndHJhbnNpdGlvbnJ1bicsICd0cmFuc2l0aW9uc3RhcnQnLCAnd2Via2l0YW5pbWF0aW9uZW5kJyxcbiAgJ3dlYmtpdGFuaW1hdGlvbml0ZXJhdGlvbicsICd3ZWJraXRhbmltYXRpb25zdGFydCcsICd3ZWJraXR0cmFuc2l0aW9uZW5kJ1xuXTtcbmNvbnN0IG1lZGlhRWxlbWVudEV2ZW50TmFtZXMgPVxuICAgIFsnZW5jcnlwdGVkJywgJ3dhaXRpbmdmb3JrZXknLCAnbXNuZWVka2V5JywgJ21vemludGVycnVwdGJlZ2luJywgJ21vemludGVycnVwdGVuZCddO1xuY29uc3QgaWVFbGVtZW50RXZlbnROYW1lcyA9IFtcbiAgJ2FjdGl2YXRlJyxcbiAgJ2FmdGVydXBkYXRlJyxcbiAgJ2FyaWFyZXF1ZXN0JyxcbiAgJ2JlZm9yZWFjdGl2YXRlJyxcbiAgJ2JlZm9yZWRlYWN0aXZhdGUnLFxuICAnYmVmb3JlZWRpdGZvY3VzJyxcbiAgJ2JlZm9yZXVwZGF0ZScsXG4gICdjZWxsY2hhbmdlJyxcbiAgJ2NvbnRyb2xzZWxlY3QnLFxuICAnZGF0YWF2YWlsYWJsZScsXG4gICdkYXRhc2V0Y2hhbmdlZCcsXG4gICdkYXRhc2V0Y29tcGxldGUnLFxuICAnZXJyb3J1cGRhdGUnLFxuICAnZmlsdGVyY2hhbmdlJyxcbiAgJ2xheW91dGNvbXBsZXRlJyxcbiAgJ2xvc2VjYXB0dXJlJyxcbiAgJ21vdmUnLFxuICAnbW92ZWVuZCcsXG4gICdtb3Zlc3RhcnQnLFxuICAncHJvcGVydHljaGFuZ2UnLFxuICAncmVzaXplZW5kJyxcbiAgJ3Jlc2l6ZXN0YXJ0JyxcbiAgJ3Jvd2VudGVyJyxcbiAgJ3Jvd2V4aXQnLFxuICAncm93c2RlbGV0ZScsXG4gICdyb3dzaW5zZXJ0ZWQnLFxuICAnY29tbWFuZCcsXG4gICdjb21wYXNzbmVlZHNjYWxpYnJhdGlvbicsXG4gICdkZWFjdGl2YXRlJyxcbiAgJ2hlbHAnLFxuICAnbXNjb250ZW50em9vbScsXG4gICdtc21hbmlwdWxhdGlvbnN0YXRlY2hhbmdlZCcsXG4gICdtc2dlc3R1cmVjaGFuZ2UnLFxuICAnbXNnZXN0dXJlZG91YmxldGFwJyxcbiAgJ21zZ2VzdHVyZWVuZCcsXG4gICdtc2dlc3R1cmVob2xkJyxcbiAgJ21zZ2VzdHVyZXN0YXJ0JyxcbiAgJ21zZ2VzdHVyZXRhcCcsXG4gICdtc2dvdHBvaW50ZXJjYXB0dXJlJyxcbiAgJ21zaW5lcnRpYXN0YXJ0JyxcbiAgJ21zbG9zdHBvaW50ZXJjYXB0dXJlJyxcbiAgJ21zcG9pbnRlcmNhbmNlbCcsXG4gICdtc3BvaW50ZXJkb3duJyxcbiAgJ21zcG9pbnRlcmVudGVyJyxcbiAgJ21zcG9pbnRlcmhvdmVyJyxcbiAgJ21zcG9pbnRlcmxlYXZlJyxcbiAgJ21zcG9pbnRlcm1vdmUnLFxuICAnbXNwb2ludGVyb3V0JyxcbiAgJ21zcG9pbnRlcm92ZXInLFxuICAnbXNwb2ludGVydXAnLFxuICAncG9pbnRlcm91dCcsXG4gICdtc3NpdGVtb2RlanVtcGxpc3RpdGVtcmVtb3ZlZCcsXG4gICdtc3RodW1ibmFpbGNsaWNrJyxcbiAgJ3N0b3AnLFxuICAnc3RvcmFnZWNvbW1pdCdcbl07XG5jb25zdCB3ZWJnbEV2ZW50TmFtZXMgPSBbJ3dlYmdsY29udGV4dHJlc3RvcmVkJywgJ3dlYmdsY29udGV4dGxvc3QnLCAnd2ViZ2xjb250ZXh0Y3JlYXRpb25lcnJvciddO1xuY29uc3QgZm9ybUV2ZW50TmFtZXMgPSBbJ2F1dG9jb21wbGV0ZScsICdhdXRvY29tcGxldGVlcnJvciddO1xuY29uc3QgZGV0YWlsRXZlbnROYW1lcyA9IFsndG9nZ2xlJ107XG5jb25zdCBmcmFtZUV2ZW50TmFtZXMgPSBbJ2xvYWQnXTtcbmNvbnN0IGZyYW1lU2V0RXZlbnROYW1lcyA9IFsnYmx1cicsICdlcnJvcicsICdmb2N1cycsICdsb2FkJywgJ3Jlc2l6ZScsICdzY3JvbGwnLCAnbWVzc2FnZWVycm9yJ107XG5jb25zdCBtYXJxdWVlRXZlbnROYW1lcyA9IFsnYm91bmNlJywgJ2ZpbmlzaCcsICdzdGFydCddO1xuXG5jb25zdCBYTUxIdHRwUmVxdWVzdEV2ZW50TmFtZXMgPSBbXG4gICdsb2Fkc3RhcnQnLCAncHJvZ3Jlc3MnLCAnYWJvcnQnLCAnZXJyb3InLCAnbG9hZCcsICdwcm9ncmVzcycsICd0aW1lb3V0JywgJ2xvYWRlbmQnLFxuICAncmVhZHlzdGF0ZWNoYW5nZSdcbl07XG5jb25zdCBJREJJbmRleEV2ZW50TmFtZXMgPVxuICAgIFsndXBncmFkZW5lZWRlZCcsICdjb21wbGV0ZScsICdhYm9ydCcsICdzdWNjZXNzJywgJ2Vycm9yJywgJ2Jsb2NrZWQnLCAndmVyc2lvbmNoYW5nZScsICdjbG9zZSddO1xuY29uc3Qgd2Vic29ja2V0RXZlbnROYW1lcyA9IFsnY2xvc2UnLCAnZXJyb3InLCAnb3BlbicsICdtZXNzYWdlJ107XG5jb25zdCB3b3JrZXJFdmVudE5hbWVzID0gWydlcnJvcicsICdtZXNzYWdlJ107XG5cbmV4cG9ydCBjb25zdCBldmVudE5hbWVzID0gZ2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TmFtZXMuY29uY2F0KFxuICAgIHdlYmdsRXZlbnROYW1lcywgZm9ybUV2ZW50TmFtZXMsIGRldGFpbEV2ZW50TmFtZXMsIGRvY3VtZW50RXZlbnROYW1lcywgd2luZG93RXZlbnROYW1lcyxcbiAgICBodG1sRWxlbWVudEV2ZW50TmFtZXMsIGllRWxlbWVudEV2ZW50TmFtZXMpO1xuXG5leHBvcnQgaW50ZXJmYWNlIElnbm9yZVByb3BlcnR5IHtcbiAgdGFyZ2V0OiBhbnk7XG4gIGlnbm9yZVByb3BlcnRpZXM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyUHJvcGVydGllcyhcbiAgICB0YXJnZXQ6IGFueSwgb25Qcm9wZXJ0aWVzOiBzdHJpbmdbXSwgaWdub3JlUHJvcGVydGllczogSWdub3JlUHJvcGVydHlbXSk6IHN0cmluZ1tdIHtcbiAgaWYgKCFpZ25vcmVQcm9wZXJ0aWVzIHx8IGlnbm9yZVByb3BlcnRpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG9uUHJvcGVydGllcztcbiAgfVxuXG4gIGNvbnN0IHRpcDogSWdub3JlUHJvcGVydHlbXSA9IGlnbm9yZVByb3BlcnRpZXMuZmlsdGVyKGlwID0+IGlwLnRhcmdldCA9PT0gdGFyZ2V0KTtcbiAgaWYgKCF0aXAgfHwgdGlwLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBvblByb3BlcnRpZXM7XG4gIH1cblxuICBjb25zdCB0YXJnZXRJZ25vcmVQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IHRpcFswXS5pZ25vcmVQcm9wZXJ0aWVzO1xuICByZXR1cm4gb25Qcm9wZXJ0aWVzLmZpbHRlcihvcCA9PiB0YXJnZXRJZ25vcmVQcm9wZXJ0aWVzLmluZGV4T2Yob3ApID09PSAtMSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXRjaEZpbHRlcmVkUHJvcGVydGllcyhcbiAgICB0YXJnZXQ6IGFueSwgb25Qcm9wZXJ0aWVzOiBzdHJpbmdbXSwgaWdub3JlUHJvcGVydGllczogSWdub3JlUHJvcGVydHlbXSwgcHJvdG90eXBlPzogYW55KSB7XG4gIC8vIGNoZWNrIHdoZXRoZXIgdGFyZ2V0IGlzIGF2YWlsYWJsZSwgc29tZXRpbWVzIHRhcmdldCB3aWxsIGJlIHVuZGVmaW5lZFxuICAvLyBiZWNhdXNlIGRpZmZlcmVudCBicm93c2VyIG9yIHNvbWUgM3JkIHBhcnR5IHBsdWdpbi5cbiAgaWYgKCF0YXJnZXQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgZmlsdGVyZWRQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IGZpbHRlclByb3BlcnRpZXModGFyZ2V0LCBvblByb3BlcnRpZXMsIGlnbm9yZVByb3BlcnRpZXMpO1xuICBwYXRjaE9uUHJvcGVydGllcyh0YXJnZXQsIGZpbHRlcmVkUHJvcGVydGllcywgcHJvdG90eXBlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3BlcnR5RGVzY3JpcHRvclBhdGNoKGFwaTogX1pvbmVQcml2YXRlLCBfZ2xvYmFsOiBhbnkpIHtcbiAgaWYgKGlzTm9kZSAmJiAhaXNNaXgpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKChab25lIGFzIGFueSlbYXBpLnN5bWJvbCgncGF0Y2hFdmVudHMnKV0pIHtcbiAgICAvLyBldmVudHMgYXJlIGFscmVhZHkgYmVlbiBwYXRjaGVkIGJ5IGxlZ2FjeSBwYXRjaC5cbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3Qgc3VwcG9ydHNXZWJTb2NrZXQgPSB0eXBlb2YgV2ViU29ja2V0ICE9PSAndW5kZWZpbmVkJztcbiAgY29uc3QgaWdub3JlUHJvcGVydGllczogSWdub3JlUHJvcGVydHlbXSA9IF9nbG9iYWxbJ19fWm9uZV9pZ25vcmVfb25fcHJvcGVydGllcyddO1xuICAvLyBmb3IgYnJvd3NlcnMgdGhhdCB3ZSBjYW4gcGF0Y2ggdGhlIGRlc2NyaXB0b3I6ICBDaHJvbWUgJiBGaXJlZm94XG4gIGlmIChpc0Jyb3dzZXIpIHtcbiAgICBjb25zdCBpbnRlcm5hbFdpbmRvdzogYW55ID0gd2luZG93O1xuICAgIGNvbnN0IGlnbm9yZUVycm9yUHJvcGVydGllcyA9XG4gICAgICAgIGlzSUUgPyBbe3RhcmdldDogaW50ZXJuYWxXaW5kb3csIGlnbm9yZVByb3BlcnRpZXM6IFsnZXJyb3InXX1dIDogW107XG4gICAgLy8gaW4gSUUvRWRnZSwgb25Qcm9wIG5vdCBleGlzdCBpbiB3aW5kb3cgb2JqZWN0LCBidXQgaW4gV2luZG93UHJvdG90eXBlXG4gICAgLy8gc28gd2UgbmVlZCB0byBwYXNzIFdpbmRvd1Byb3RvdHlwZSB0byBjaGVjayBvblByb3AgZXhpc3Qgb3Igbm90XG4gICAgcGF0Y2hGaWx0ZXJlZFByb3BlcnRpZXMoXG4gICAgICAgIGludGVybmFsV2luZG93LCBldmVudE5hbWVzLmNvbmNhdChbJ21lc3NhZ2VlcnJvciddKSxcbiAgICAgICAgaWdub3JlUHJvcGVydGllcyA/IGlnbm9yZVByb3BlcnRpZXMuY29uY2F0KGlnbm9yZUVycm9yUHJvcGVydGllcykgOiBpZ25vcmVQcm9wZXJ0aWVzLFxuICAgICAgICBPYmplY3RHZXRQcm90b3R5cGVPZihpbnRlcm5hbFdpbmRvdykpO1xuICAgIHBhdGNoRmlsdGVyZWRQcm9wZXJ0aWVzKERvY3VtZW50LnByb3RvdHlwZSwgZXZlbnROYW1lcywgaWdub3JlUHJvcGVydGllcyk7XG5cbiAgICBpZiAodHlwZW9mIGludGVybmFsV2luZG93WydTVkdFbGVtZW50J10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBwYXRjaEZpbHRlcmVkUHJvcGVydGllcyhpbnRlcm5hbFdpbmRvd1snU1ZHRWxlbWVudCddLnByb3RvdHlwZSwgZXZlbnROYW1lcywgaWdub3JlUHJvcGVydGllcyk7XG4gICAgfVxuICAgIHBhdGNoRmlsdGVyZWRQcm9wZXJ0aWVzKEVsZW1lbnQucHJvdG90eXBlLCBldmVudE5hbWVzLCBpZ25vcmVQcm9wZXJ0aWVzKTtcbiAgICBwYXRjaEZpbHRlcmVkUHJvcGVydGllcyhIVE1MRWxlbWVudC5wcm90b3R5cGUsIGV2ZW50TmFtZXMsIGlnbm9yZVByb3BlcnRpZXMpO1xuICAgIHBhdGNoRmlsdGVyZWRQcm9wZXJ0aWVzKEhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlLCBtZWRpYUVsZW1lbnRFdmVudE5hbWVzLCBpZ25vcmVQcm9wZXJ0aWVzKTtcbiAgICBwYXRjaEZpbHRlcmVkUHJvcGVydGllcyhcbiAgICAgICAgSFRNTEZyYW1lU2V0RWxlbWVudC5wcm90b3R5cGUsIHdpbmRvd0V2ZW50TmFtZXMuY29uY2F0KGZyYW1lU2V0RXZlbnROYW1lcyksXG4gICAgICAgIGlnbm9yZVByb3BlcnRpZXMpO1xuICAgIHBhdGNoRmlsdGVyZWRQcm9wZXJ0aWVzKFxuICAgICAgICBIVE1MQm9keUVsZW1lbnQucHJvdG90eXBlLCB3aW5kb3dFdmVudE5hbWVzLmNvbmNhdChmcmFtZVNldEV2ZW50TmFtZXMpLCBpZ25vcmVQcm9wZXJ0aWVzKTtcbiAgICBwYXRjaEZpbHRlcmVkUHJvcGVydGllcyhIVE1MRnJhbWVFbGVtZW50LnByb3RvdHlwZSwgZnJhbWVFdmVudE5hbWVzLCBpZ25vcmVQcm9wZXJ0aWVzKTtcbiAgICBwYXRjaEZpbHRlcmVkUHJvcGVydGllcyhIVE1MSUZyYW1lRWxlbWVudC5wcm90b3R5cGUsIGZyYW1lRXZlbnROYW1lcywgaWdub3JlUHJvcGVydGllcyk7XG5cbiAgICBjb25zdCBIVE1MTWFycXVlZUVsZW1lbnQgPSBpbnRlcm5hbFdpbmRvd1snSFRNTE1hcnF1ZWVFbGVtZW50J107XG4gICAgaWYgKEhUTUxNYXJxdWVlRWxlbWVudCkge1xuICAgICAgcGF0Y2hGaWx0ZXJlZFByb3BlcnRpZXMoSFRNTE1hcnF1ZWVFbGVtZW50LnByb3RvdHlwZSwgbWFycXVlZUV2ZW50TmFtZXMsIGlnbm9yZVByb3BlcnRpZXMpO1xuICAgIH1cbiAgICBjb25zdCBXb3JrZXIgPSBpbnRlcm5hbFdpbmRvd1snV29ya2VyJ107XG4gICAgaWYgKFdvcmtlcikge1xuICAgICAgcGF0Y2hGaWx0ZXJlZFByb3BlcnRpZXMoV29ya2VyLnByb3RvdHlwZSwgd29ya2VyRXZlbnROYW1lcywgaWdub3JlUHJvcGVydGllcyk7XG4gICAgfVxuICB9XG4gIGNvbnN0IFhNTEh0dHBSZXF1ZXN0ID0gX2dsb2JhbFsnWE1MSHR0cFJlcXVlc3QnXTtcbiAgaWYgKFhNTEh0dHBSZXF1ZXN0KSB7XG4gICAgLy8gWE1MSHR0cFJlcXVlc3QgaXMgbm90IGF2YWlsYWJsZSBpbiBTZXJ2aWNlV29ya2VyLCBzbyB3ZSBuZWVkIHRvIGNoZWNrIGhlcmVcbiAgICBwYXRjaEZpbHRlcmVkUHJvcGVydGllcyhYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUsIFhNTEh0dHBSZXF1ZXN0RXZlbnROYW1lcywgaWdub3JlUHJvcGVydGllcyk7XG4gIH1cbiAgY29uc3QgWE1MSHR0cFJlcXVlc3RFdmVudFRhcmdldCA9IF9nbG9iYWxbJ1hNTEh0dHBSZXF1ZXN0RXZlbnRUYXJnZXQnXTtcbiAgaWYgKFhNTEh0dHBSZXF1ZXN0RXZlbnRUYXJnZXQpIHtcbiAgICBwYXRjaEZpbHRlcmVkUHJvcGVydGllcyhcbiAgICAgICAgWE1MSHR0cFJlcXVlc3RFdmVudFRhcmdldCAmJiBYTUxIdHRwUmVxdWVzdEV2ZW50VGFyZ2V0LnByb3RvdHlwZSwgWE1MSHR0cFJlcXVlc3RFdmVudE5hbWVzLFxuICAgICAgICBpZ25vcmVQcm9wZXJ0aWVzKTtcbiAgfVxuICBpZiAodHlwZW9mIElEQkluZGV4ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHBhdGNoRmlsdGVyZWRQcm9wZXJ0aWVzKElEQkluZGV4LnByb3RvdHlwZSwgSURCSW5kZXhFdmVudE5hbWVzLCBpZ25vcmVQcm9wZXJ0aWVzKTtcbiAgICBwYXRjaEZpbHRlcmVkUHJvcGVydGllcyhJREJSZXF1ZXN0LnByb3RvdHlwZSwgSURCSW5kZXhFdmVudE5hbWVzLCBpZ25vcmVQcm9wZXJ0aWVzKTtcbiAgICBwYXRjaEZpbHRlcmVkUHJvcGVydGllcyhJREJPcGVuREJSZXF1ZXN0LnByb3RvdHlwZSwgSURCSW5kZXhFdmVudE5hbWVzLCBpZ25vcmVQcm9wZXJ0aWVzKTtcbiAgICBwYXRjaEZpbHRlcmVkUHJvcGVydGllcyhJREJEYXRhYmFzZS5wcm90b3R5cGUsIElEQkluZGV4RXZlbnROYW1lcywgaWdub3JlUHJvcGVydGllcyk7XG4gICAgcGF0Y2hGaWx0ZXJlZFByb3BlcnRpZXMoSURCVHJhbnNhY3Rpb24ucHJvdG90eXBlLCBJREJJbmRleEV2ZW50TmFtZXMsIGlnbm9yZVByb3BlcnRpZXMpO1xuICAgIHBhdGNoRmlsdGVyZWRQcm9wZXJ0aWVzKElEQkN1cnNvci5wcm90b3R5cGUsIElEQkluZGV4RXZlbnROYW1lcywgaWdub3JlUHJvcGVydGllcyk7XG4gIH1cbiAgaWYgKHN1cHBvcnRzV2ViU29ja2V0KSB7XG4gICAgcGF0Y2hGaWx0ZXJlZFByb3BlcnRpZXMoV2ViU29ja2V0LnByb3RvdHlwZSwgd2Vic29ja2V0RXZlbnROYW1lcywgaWdub3JlUHJvcGVydGllcyk7XG4gIH1cbn1cbiJdfQ==