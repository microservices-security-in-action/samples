/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview
 * @suppress {missingRequire}
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("angular/packages/zone.js/lib/common/events", ["require", "exports", "angular/packages/zone.js/lib/common/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils_1 = require("angular/packages/zone.js/lib/common/utils");
    var passiveSupported = false;
    if (typeof window !== 'undefined') {
        try {
            var options = Object.defineProperty({}, 'passive', { get: function () { passiveSupported = true; } });
            window.addEventListener('test', options, options);
            window.removeEventListener('test', options, options);
        }
        catch (err) {
            passiveSupported = false;
        }
    }
    // an identifier to tell ZoneTask do not create a new invoke closure
    var OPTIMIZED_ZONE_EVENT_TASK_DATA = {
        useG: true
    };
    exports.zoneSymbolEventNames = {};
    exports.globalSources = {};
    var EVENT_NAME_SYMBOL_REGX = new RegExp('^' + utils_1.ZONE_SYMBOL_PREFIX + '(\\w+)(true|false)$');
    var IMMEDIATE_PROPAGATION_SYMBOL = utils_1.zoneSymbol('propagationStopped');
    function patchEventTarget(_global, apis, patchOptions) {
        var ADD_EVENT_LISTENER = (patchOptions && patchOptions.add) || utils_1.ADD_EVENT_LISTENER_STR;
        var REMOVE_EVENT_LISTENER = (patchOptions && patchOptions.rm) || utils_1.REMOVE_EVENT_LISTENER_STR;
        var LISTENERS_EVENT_LISTENER = (patchOptions && patchOptions.listeners) || 'eventListeners';
        var REMOVE_ALL_LISTENERS_EVENT_LISTENER = (patchOptions && patchOptions.rmAll) || 'removeAllListeners';
        var zoneSymbolAddEventListener = utils_1.zoneSymbol(ADD_EVENT_LISTENER);
        var ADD_EVENT_LISTENER_SOURCE = '.' + ADD_EVENT_LISTENER + ':';
        var PREPEND_EVENT_LISTENER = 'prependListener';
        var PREPEND_EVENT_LISTENER_SOURCE = '.' + PREPEND_EVENT_LISTENER + ':';
        var invokeTask = function (task, target, event) {
            // for better performance, check isRemoved which is set
            // by removeEventListener
            if (task.isRemoved) {
                return;
            }
            var delegate = task.callback;
            if (typeof delegate === 'object' && delegate.handleEvent) {
                // create the bind version of handleEvent when invoke
                task.callback = function (event) { return delegate.handleEvent(event); };
                task.originalDelegate = delegate;
            }
            // invoke static task.invoke
            task.invoke(task, target, [event]);
            var options = task.options;
            if (options && typeof options === 'object' && options.once) {
                // if options.once is true, after invoke once remove listener here
                // only browser need to do this, nodejs eventEmitter will cal removeListener
                // inside EventEmitter.once
                var delegate_1 = task.originalDelegate ? task.originalDelegate : task.callback;
                target[REMOVE_EVENT_LISTENER].call(target, event.type, delegate_1, options);
            }
        };
        // global shared zoneAwareCallback to handle all event callback with capture = false
        var globalZoneAwareCallback = function (event) {
            // https://github.com/angular/zone.js/issues/911, in IE, sometimes
            // event will be undefined, so we need to use window.event
            event = event || _global.event;
            if (!event) {
                return;
            }
            // event.target is needed for Samsung TV and SourceBuffer
            // || global is needed https://github.com/angular/zone.js/issues/190
            var target = this || event.target || _global;
            var tasks = target[exports.zoneSymbolEventNames[event.type][utils_1.FALSE_STR]];
            if (tasks) {
                // invoke all tasks which attached to current target with given event.type and capture = false
                // for performance concern, if task.length === 1, just invoke
                if (tasks.length === 1) {
                    invokeTask(tasks[0], target, event);
                }
                else {
                    // https://github.com/angular/zone.js/issues/836
                    // copy the tasks array before invoke, to avoid
                    // the callback will remove itself or other listener
                    var copyTasks = tasks.slice();
                    for (var i = 0; i < copyTasks.length; i++) {
                        if (event && event[IMMEDIATE_PROPAGATION_SYMBOL] === true) {
                            break;
                        }
                        invokeTask(copyTasks[i], target, event);
                    }
                }
            }
        };
        // global shared zoneAwareCallback to handle all event callback with capture = true
        var globalZoneAwareCaptureCallback = function (event) {
            // https://github.com/angular/zone.js/issues/911, in IE, sometimes
            // event will be undefined, so we need to use window.event
            event = event || _global.event;
            if (!event) {
                return;
            }
            // event.target is needed for Samsung TV and SourceBuffer
            // || global is needed https://github.com/angular/zone.js/issues/190
            var target = this || event.target || _global;
            var tasks = target[exports.zoneSymbolEventNames[event.type][utils_1.TRUE_STR]];
            if (tasks) {
                // invoke all tasks which attached to current target with given event.type and capture = false
                // for performance concern, if task.length === 1, just invoke
                if (tasks.length === 1) {
                    invokeTask(tasks[0], target, event);
                }
                else {
                    // https://github.com/angular/zone.js/issues/836
                    // copy the tasks array before invoke, to avoid
                    // the callback will remove itself or other listener
                    var copyTasks = tasks.slice();
                    for (var i = 0; i < copyTasks.length; i++) {
                        if (event && event[IMMEDIATE_PROPAGATION_SYMBOL] === true) {
                            break;
                        }
                        invokeTask(copyTasks[i], target, event);
                    }
                }
            }
        };
        function patchEventTargetMethods(obj, patchOptions) {
            if (!obj) {
                return false;
            }
            var useGlobalCallback = true;
            if (patchOptions && patchOptions.useG !== undefined) {
                useGlobalCallback = patchOptions.useG;
            }
            var validateHandler = patchOptions && patchOptions.vh;
            var checkDuplicate = true;
            if (patchOptions && patchOptions.chkDup !== undefined) {
                checkDuplicate = patchOptions.chkDup;
            }
            var returnTarget = false;
            if (patchOptions && patchOptions.rt !== undefined) {
                returnTarget = patchOptions.rt;
            }
            var proto = obj;
            while (proto && !proto.hasOwnProperty(ADD_EVENT_LISTENER)) {
                proto = utils_1.ObjectGetPrototypeOf(proto);
            }
            if (!proto && obj[ADD_EVENT_LISTENER]) {
                // somehow we did not find it, but we can see it. This happens on IE for Window properties.
                proto = obj;
            }
            if (!proto) {
                return false;
            }
            if (proto[zoneSymbolAddEventListener]) {
                return false;
            }
            var eventNameToString = patchOptions && patchOptions.eventNameToString;
            // a shared global taskData to pass data for scheduleEventTask
            // so we do not need to create a new object just for pass some data
            var taskData = {};
            var nativeAddEventListener = proto[zoneSymbolAddEventListener] = proto[ADD_EVENT_LISTENER];
            var nativeRemoveEventListener = proto[utils_1.zoneSymbol(REMOVE_EVENT_LISTENER)] =
                proto[REMOVE_EVENT_LISTENER];
            var nativeListeners = proto[utils_1.zoneSymbol(LISTENERS_EVENT_LISTENER)] =
                proto[LISTENERS_EVENT_LISTENER];
            var nativeRemoveAllListeners = proto[utils_1.zoneSymbol(REMOVE_ALL_LISTENERS_EVENT_LISTENER)] =
                proto[REMOVE_ALL_LISTENERS_EVENT_LISTENER];
            var nativePrependEventListener;
            if (patchOptions && patchOptions.prepend) {
                nativePrependEventListener = proto[utils_1.zoneSymbol(patchOptions.prepend)] =
                    proto[patchOptions.prepend];
            }
            function checkIsPassive(task) {
                if (!passiveSupported && typeof taskData.options !== 'boolean' &&
                    typeof taskData.options !== 'undefined' && taskData.options !== null) {
                    // options is a non-null non-undefined object
                    // passive is not supported
                    // don't pass options as object
                    // just pass capture as a boolean
                    task.options = !!taskData.options.capture;
                    taskData.options = task.options;
                }
            }
            var customScheduleGlobal = function (task) {
                // if there is already a task for the eventName + capture,
                // just return, because we use the shared globalZoneAwareCallback here.
                if (taskData.isExisting) {
                    return;
                }
                checkIsPassive(task);
                return nativeAddEventListener.call(taskData.target, taskData.eventName, taskData.capture ? globalZoneAwareCaptureCallback : globalZoneAwareCallback, taskData.options);
            };
            var customCancelGlobal = function (task) {
                // if task is not marked as isRemoved, this call is directly
                // from Zone.prototype.cancelTask, we should remove the task
                // from tasksList of target first
                if (!task.isRemoved) {
                    var symbolEventNames = exports.zoneSymbolEventNames[task.eventName];
                    var symbolEventName = void 0;
                    if (symbolEventNames) {
                        symbolEventName = symbolEventNames[task.capture ? utils_1.TRUE_STR : utils_1.FALSE_STR];
                    }
                    var existingTasks = symbolEventName && task.target[symbolEventName];
                    if (existingTasks) {
                        for (var i = 0; i < existingTasks.length; i++) {
                            var existingTask = existingTasks[i];
                            if (existingTask === task) {
                                existingTasks.splice(i, 1);
                                // set isRemoved to data for faster invokeTask check
                                task.isRemoved = true;
                                if (existingTasks.length === 0) {
                                    // all tasks for the eventName + capture have gone,
                                    // remove globalZoneAwareCallback and remove the task cache from target
                                    task.allRemoved = true;
                                    task.target[symbolEventName] = null;
                                }
                                break;
                            }
                        }
                    }
                }
                // if all tasks for the eventName + capture have gone,
                // we will really remove the global event callback,
                // if not, return
                if (!task.allRemoved) {
                    return;
                }
                return nativeRemoveEventListener.call(task.target, task.eventName, task.capture ? globalZoneAwareCaptureCallback : globalZoneAwareCallback, task.options);
            };
            var customScheduleNonGlobal = function (task) {
                checkIsPassive(task);
                return nativeAddEventListener.call(taskData.target, taskData.eventName, task.invoke, taskData.options);
            };
            var customSchedulePrepend = function (task) {
                return nativePrependEventListener.call(taskData.target, taskData.eventName, task.invoke, taskData.options);
            };
            var customCancelNonGlobal = function (task) {
                return nativeRemoveEventListener.call(task.target, task.eventName, task.invoke, task.options);
            };
            var customSchedule = useGlobalCallback ? customScheduleGlobal : customScheduleNonGlobal;
            var customCancel = useGlobalCallback ? customCancelGlobal : customCancelNonGlobal;
            var compareTaskCallbackVsDelegate = function (task, delegate) {
                var typeOfDelegate = typeof delegate;
                return (typeOfDelegate === 'function' && task.callback === delegate) ||
                    (typeOfDelegate === 'object' && task.originalDelegate === delegate);
            };
            var compare = (patchOptions && patchOptions.diff) ? patchOptions.diff : compareTaskCallbackVsDelegate;
            var blackListedEvents = Zone[utils_1.zoneSymbol('BLACK_LISTED_EVENTS')];
            var makeAddListener = function (nativeListener, addSource, customScheduleFn, customCancelFn, returnTarget, prepend) {
                if (returnTarget === void 0) { returnTarget = false; }
                if (prepend === void 0) { prepend = false; }
                return function () {
                    var target = this || _global;
                    var eventName = arguments[0];
                    if (patchOptions && patchOptions.transferEventName) {
                        eventName = patchOptions.transferEventName(eventName);
                    }
                    var delegate = arguments[1];
                    if (!delegate) {
                        return nativeListener.apply(this, arguments);
                    }
                    if (utils_1.isNode && eventName === 'uncaughtException') {
                        // don't patch uncaughtException of nodejs to prevent endless loop
                        return nativeListener.apply(this, arguments);
                    }
                    // don't create the bind delegate function for handleEvent
                    // case here to improve addEventListener performance
                    // we will create the bind delegate when invoke
                    var isHandleEvent = false;
                    if (typeof delegate !== 'function') {
                        if (!delegate.handleEvent) {
                            return nativeListener.apply(this, arguments);
                        }
                        isHandleEvent = true;
                    }
                    if (validateHandler && !validateHandler(nativeListener, delegate, target, arguments)) {
                        return;
                    }
                    var options = arguments[2];
                    if (blackListedEvents) {
                        // check black list
                        for (var i = 0; i < blackListedEvents.length; i++) {
                            if (eventName === blackListedEvents[i]) {
                                return nativeListener.apply(this, arguments);
                            }
                        }
                    }
                    var capture;
                    var once = false;
                    if (options === undefined) {
                        capture = false;
                    }
                    else if (options === true) {
                        capture = true;
                    }
                    else if (options === false) {
                        capture = false;
                    }
                    else {
                        capture = options ? !!options.capture : false;
                        once = options ? !!options.once : false;
                    }
                    var zone = Zone.current;
                    var symbolEventNames = exports.zoneSymbolEventNames[eventName];
                    var symbolEventName;
                    if (!symbolEventNames) {
                        // the code is duplicate, but I just want to get some better performance
                        var falseEventName = (eventNameToString ? eventNameToString(eventName) : eventName) + utils_1.FALSE_STR;
                        var trueEventName = (eventNameToString ? eventNameToString(eventName) : eventName) + utils_1.TRUE_STR;
                        var symbol = utils_1.ZONE_SYMBOL_PREFIX + falseEventName;
                        var symbolCapture = utils_1.ZONE_SYMBOL_PREFIX + trueEventName;
                        exports.zoneSymbolEventNames[eventName] = {};
                        exports.zoneSymbolEventNames[eventName][utils_1.FALSE_STR] = symbol;
                        exports.zoneSymbolEventNames[eventName][utils_1.TRUE_STR] = symbolCapture;
                        symbolEventName = capture ? symbolCapture : symbol;
                    }
                    else {
                        symbolEventName = symbolEventNames[capture ? utils_1.TRUE_STR : utils_1.FALSE_STR];
                    }
                    var existingTasks = target[symbolEventName];
                    var isExisting = false;
                    if (existingTasks) {
                        // already have task registered
                        isExisting = true;
                        if (checkDuplicate) {
                            for (var i = 0; i < existingTasks.length; i++) {
                                if (compare(existingTasks[i], delegate)) {
                                    // same callback, same capture, same event name, just return
                                    return;
                                }
                            }
                        }
                    }
                    else {
                        existingTasks = target[symbolEventName] = [];
                    }
                    var source;
                    var constructorName = target.constructor['name'];
                    var targetSource = exports.globalSources[constructorName];
                    if (targetSource) {
                        source = targetSource[eventName];
                    }
                    if (!source) {
                        source = constructorName + addSource +
                            (eventNameToString ? eventNameToString(eventName) : eventName);
                    }
                    // do not create a new object as task.data to pass those things
                    // just use the global shared one
                    taskData.options = options;
                    if (once) {
                        // if addEventListener with once options, we don't pass it to
                        // native addEventListener, instead we keep the once setting
                        // and handle ourselves.
                        taskData.options.once = false;
                    }
                    taskData.target = target;
                    taskData.capture = capture;
                    taskData.eventName = eventName;
                    taskData.isExisting = isExisting;
                    var data = useGlobalCallback ? OPTIMIZED_ZONE_EVENT_TASK_DATA : undefined;
                    // keep taskData into data to allow onScheduleEventTask to access the task information
                    if (data) {
                        data.taskData = taskData;
                    }
                    var task = zone.scheduleEventTask(source, delegate, data, customScheduleFn, customCancelFn);
                    // should clear taskData.target to avoid memory leak
                    // issue, https://github.com/angular/angular/issues/20442
                    taskData.target = null;
                    // need to clear up taskData because it is a global object
                    if (data) {
                        data.taskData = null;
                    }
                    // have to save those information to task in case
                    // application may call task.zone.cancelTask() directly
                    if (once) {
                        options.once = true;
                    }
                    if (!(!passiveSupported && typeof task.options === 'boolean')) {
                        // if not support passive, and we pass an option object
                        // to addEventListener, we should save the options to task
                        task.options = options;
                    }
                    task.target = target;
                    task.capture = capture;
                    task.eventName = eventName;
                    if (isHandleEvent) {
                        // save original delegate for compare to check duplicate
                        task.originalDelegate = delegate;
                    }
                    if (!prepend) {
                        existingTasks.push(task);
                    }
                    else {
                        existingTasks.unshift(task);
                    }
                    if (returnTarget) {
                        return target;
                    }
                };
            };
            proto[ADD_EVENT_LISTENER] = makeAddListener(nativeAddEventListener, ADD_EVENT_LISTENER_SOURCE, customSchedule, customCancel, returnTarget);
            if (nativePrependEventListener) {
                proto[PREPEND_EVENT_LISTENER] = makeAddListener(nativePrependEventListener, PREPEND_EVENT_LISTENER_SOURCE, customSchedulePrepend, customCancel, returnTarget, true);
            }
            proto[REMOVE_EVENT_LISTENER] = function () {
                var target = this || _global;
                var eventName = arguments[0];
                if (patchOptions && patchOptions.transferEventName) {
                    eventName = patchOptions.transferEventName(eventName);
                }
                var options = arguments[2];
                var capture;
                if (options === undefined) {
                    capture = false;
                }
                else if (options === true) {
                    capture = true;
                }
                else if (options === false) {
                    capture = false;
                }
                else {
                    capture = options ? !!options.capture : false;
                }
                var delegate = arguments[1];
                if (!delegate) {
                    return nativeRemoveEventListener.apply(this, arguments);
                }
                if (validateHandler &&
                    !validateHandler(nativeRemoveEventListener, delegate, target, arguments)) {
                    return;
                }
                var symbolEventNames = exports.zoneSymbolEventNames[eventName];
                var symbolEventName;
                if (symbolEventNames) {
                    symbolEventName = symbolEventNames[capture ? utils_1.TRUE_STR : utils_1.FALSE_STR];
                }
                var existingTasks = symbolEventName && target[symbolEventName];
                if (existingTasks) {
                    for (var i = 0; i < existingTasks.length; i++) {
                        var existingTask = existingTasks[i];
                        if (compare(existingTask, delegate)) {
                            existingTasks.splice(i, 1);
                            // set isRemoved to data for faster invokeTask check
                            existingTask.isRemoved = true;
                            if (existingTasks.length === 0) {
                                // all tasks for the eventName + capture have gone,
                                // remove globalZoneAwareCallback and remove the task cache from target
                                existingTask.allRemoved = true;
                                target[symbolEventName] = null;
                                // in the target, we have an event listener which is added by on_property
                                // such as target.onclick = function() {}, so we need to clear this internal
                                // property too if all delegates all removed
                                if (typeof eventName === 'string') {
                                    var onPropertySymbol = utils_1.ZONE_SYMBOL_PREFIX + 'ON_PROPERTY' + eventName;
                                    target[onPropertySymbol] = null;
                                }
                            }
                            existingTask.zone.cancelTask(existingTask);
                            if (returnTarget) {
                                return target;
                            }
                            return;
                        }
                    }
                }
                // issue 930, didn't find the event name or callback
                // from zone kept existingTasks, the callback maybe
                // added outside of zone, we need to call native removeEventListener
                // to try to remove it.
                return nativeRemoveEventListener.apply(this, arguments);
            };
            proto[LISTENERS_EVENT_LISTENER] = function () {
                var target = this || _global;
                var eventName = arguments[0];
                if (patchOptions && patchOptions.transferEventName) {
                    eventName = patchOptions.transferEventName(eventName);
                }
                var listeners = [];
                var tasks = findEventTasks(target, eventNameToString ? eventNameToString(eventName) : eventName);
                for (var i = 0; i < tasks.length; i++) {
                    var task = tasks[i];
                    var delegate = task.originalDelegate ? task.originalDelegate : task.callback;
                    listeners.push(delegate);
                }
                return listeners;
            };
            proto[REMOVE_ALL_LISTENERS_EVENT_LISTENER] = function () {
                var target = this || _global;
                var eventName = arguments[0];
                if (!eventName) {
                    var keys = Object.keys(target);
                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var match = EVENT_NAME_SYMBOL_REGX.exec(prop);
                        var evtName = match && match[1];
                        // in nodejs EventEmitter, removeListener event is
                        // used for monitoring the removeListener call,
                        // so just keep removeListener eventListener until
                        // all other eventListeners are removed
                        if (evtName && evtName !== 'removeListener') {
                            this[REMOVE_ALL_LISTENERS_EVENT_LISTENER].call(this, evtName);
                        }
                    }
                    // remove removeListener listener finally
                    this[REMOVE_ALL_LISTENERS_EVENT_LISTENER].call(this, 'removeListener');
                }
                else {
                    if (patchOptions && patchOptions.transferEventName) {
                        eventName = patchOptions.transferEventName(eventName);
                    }
                    var symbolEventNames = exports.zoneSymbolEventNames[eventName];
                    if (symbolEventNames) {
                        var symbolEventName = symbolEventNames[utils_1.FALSE_STR];
                        var symbolCaptureEventName = symbolEventNames[utils_1.TRUE_STR];
                        var tasks = target[symbolEventName];
                        var captureTasks = target[symbolCaptureEventName];
                        if (tasks) {
                            var removeTasks = tasks.slice();
                            for (var i = 0; i < removeTasks.length; i++) {
                                var task = removeTasks[i];
                                var delegate = task.originalDelegate ? task.originalDelegate : task.callback;
                                this[REMOVE_EVENT_LISTENER].call(this, eventName, delegate, task.options);
                            }
                        }
                        if (captureTasks) {
                            var removeTasks = captureTasks.slice();
                            for (var i = 0; i < removeTasks.length; i++) {
                                var task = removeTasks[i];
                                var delegate = task.originalDelegate ? task.originalDelegate : task.callback;
                                this[REMOVE_EVENT_LISTENER].call(this, eventName, delegate, task.options);
                            }
                        }
                    }
                }
                if (returnTarget) {
                    return this;
                }
            };
            // for native toString patch
            utils_1.attachOriginToPatched(proto[ADD_EVENT_LISTENER], nativeAddEventListener);
            utils_1.attachOriginToPatched(proto[REMOVE_EVENT_LISTENER], nativeRemoveEventListener);
            if (nativeRemoveAllListeners) {
                utils_1.attachOriginToPatched(proto[REMOVE_ALL_LISTENERS_EVENT_LISTENER], nativeRemoveAllListeners);
            }
            if (nativeListeners) {
                utils_1.attachOriginToPatched(proto[LISTENERS_EVENT_LISTENER], nativeListeners);
            }
            return true;
        }
        var results = [];
        for (var i = 0; i < apis.length; i++) {
            results[i] = patchEventTargetMethods(apis[i], patchOptions);
        }
        return results;
    }
    exports.patchEventTarget = patchEventTarget;
    function findEventTasks(target, eventName) {
        var foundTasks = [];
        for (var prop in target) {
            var match = EVENT_NAME_SYMBOL_REGX.exec(prop);
            var evtName = match && match[1];
            if (evtName && (!eventName || evtName === eventName)) {
                var tasks = target[prop];
                if (tasks) {
                    for (var i = 0; i < tasks.length; i++) {
                        foundTasks.push(tasks[i]);
                    }
                }
            }
        }
        return foundTasks;
    }
    exports.findEventTasks = findEventTasks;
    function patchEventPrototype(global, api) {
        var Event = global['Event'];
        if (Event && Event.prototype) {
            api.patchMethod(Event.prototype, 'stopImmediatePropagation', function (delegate) { return function (self, args) {
                self[IMMEDIATE_PROPAGATION_SYMBOL] = true;
                // we need to call the native stopImmediatePropagation
                // in case in some hybrid application, some part of
                // application will be controlled by zone, some are not
                delegate && delegate.apply(self, args);
            }; });
        }
    }
    exports.patchEventPrototype = patchEventPrototype;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvem9uZS5qcy9saWIvY29tbW9uL2V2ZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSDs7O0dBR0c7Ozs7Ozs7Ozs7OztJQUVILG1FQUFvTDtJQVNwTCxJQUFJLGdCQUFnQixHQUFHLEtBQUssQ0FBQztJQUU3QixJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRTtRQUNqQyxJQUFJO1lBQ0YsSUFBTSxPQUFPLEdBQ1QsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUMsR0FBRyxFQUFFLGNBQWEsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztZQUV6RixNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztTQUN0RDtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1NBQzFCO0tBQ0Y7SUFFRCxvRUFBb0U7SUFDcEUsSUFBTSw4QkFBOEIsR0FBa0I7UUFDcEQsSUFBSSxFQUFFLElBQUk7S0FDWCxDQUFDO0lBRVcsUUFBQSxvQkFBb0IsR0FBUSxFQUFFLENBQUM7SUFDL0IsUUFBQSxhQUFhLEdBQVEsRUFBRSxDQUFDO0lBRXJDLElBQU0sc0JBQXNCLEdBQUcsSUFBSSxNQUFNLENBQUMsR0FBRyxHQUFHLDBCQUFrQixHQUFHLHFCQUFxQixDQUFDLENBQUM7SUFDNUYsSUFBTSw0QkFBNEIsR0FBRyxrQkFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUErQnRFLFNBQWdCLGdCQUFnQixDQUM1QixPQUFZLEVBQUUsSUFBVyxFQUFFLFlBQXND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RyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUNyQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUMzQjtpQkFDRjthQUNGO1NBQ0Y7UUFDRCxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0lBZkQsd0NBZUM7SUFFRCxTQUFnQixtQkFBbUIsQ0FBQyxNQUFXLEVBQUUsR0FBaUI7UUFDaEUsSUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlCLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUU7WUFDNUIsR0FBRyxDQUFDLFdBQVcsQ0FDWCxLQUFLLENBQUMsU0FBUyxFQUFFLDBCQUEwQixFQUMzQyxVQUFDLFFBQWtCLElBQUssT0FBQSxVQUFTLElBQVMsRUFBRSxJQUFXO2dCQUNyRCxJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxJQUFJLENBQUM7Z0JBQzFDLHNEQUFzRDtnQkFDdEQsbURBQW1EO2dCQUNuRCx1REFBdUQ7Z0JBQ3ZELFFBQVEsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6QyxDQUFDLEVBTnVCLENBTXZCLENBQUMsQ0FBQztTQUNSO0lBQ0gsQ0FBQztJQWJELGtEQWFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3XG4gKiBAc3VwcHJlc3Mge21pc3NpbmdSZXF1aXJlfVxuICovXG5cbmltcG9ydCB7QUREX0VWRU5UX0xJU1RFTkVSX1NUUiwgRkFMU0VfU1RSLCBPYmplY3RHZXRQcm90b3R5cGVPZiwgUkVNT1ZFX0VWRU5UX0xJU1RFTkVSX1NUUiwgVFJVRV9TVFIsIFpPTkVfU1lNQk9MX1BSRUZJWCwgYXR0YWNoT3JpZ2luVG9QYXRjaGVkLCBpc05vZGUsIHpvbmVTeW1ib2x9IGZyb20gJy4vdXRpbHMnO1xuXG5cbi8qKiBAaW50ZXJuYWwgKiovXG5pbnRlcmZhY2UgRXZlbnRUYXNrRGF0YSBleHRlbmRzIFRhc2tEYXRhIHtcbiAgLy8gdXNlIGdsb2JhbCBjYWxsYmFjayBvciBub3RcbiAgcmVhZG9ubHkgdXNlRz86IGJvb2xlYW47XG59XG5cbmxldCBwYXNzaXZlU3VwcG9ydGVkID0gZmFsc2U7XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICB0cnkge1xuICAgIGNvbnN0IG9wdGlvbnMgPVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge2dldDogZnVuY3Rpb24oKSB7IHBhc3NpdmVTdXBwb3J0ZWQgPSB0cnVlOyB9fSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdCcsIG9wdGlvbnMsIG9wdGlvbnMpO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0ZXN0Jywgb3B0aW9ucywgb3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHBhc3NpdmVTdXBwb3J0ZWQgPSBmYWxzZTtcbiAgfVxufVxuXG4vLyBhbiBpZGVudGlmaWVyIHRvIHRlbGwgWm9uZVRhc2sgZG8gbm90IGNyZWF0ZSBhIG5ldyBpbnZva2UgY2xvc3VyZVxuY29uc3QgT1BUSU1JWkVEX1pPTkVfRVZFTlRfVEFTS19EQVRBOiBFdmVudFRhc2tEYXRhID0ge1xuICB1c2VHOiB0cnVlXG59O1xuXG5leHBvcnQgY29uc3Qgem9uZVN5bWJvbEV2ZW50TmFtZXM6IGFueSA9IHt9O1xuZXhwb3J0IGNvbnN0IGdsb2JhbFNvdXJjZXM6IGFueSA9IHt9O1xuXG5jb25zdCBFVkVOVF9OQU1FX1NZTUJPTF9SRUdYID0gbmV3IFJlZ0V4cCgnXicgKyBaT05FX1NZTUJPTF9QUkVGSVggKyAnKFxcXFx3KykodHJ1ZXxmYWxzZSkkJyk7XG5jb25zdCBJTU1FRElBVEVfUFJPUEFHQVRJT05fU1lNQk9MID0gem9uZVN5bWJvbCgncHJvcGFnYXRpb25TdG9wcGVkJyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGF0Y2hFdmVudFRhcmdldE9wdGlvbnMge1xuICAvLyB2YWxpZGF0ZUhhbmRsZXJcbiAgdmg/OiAobmF0aXZlRGVsZWdhdGU6IGFueSwgZGVsZWdhdGU6IGFueSwgdGFyZ2V0OiBhbnksIGFyZ3M6IGFueSkgPT4gYm9vbGVhbjtcbiAgLy8gYWRkRXZlbnRMaXN0ZW5lciBmdW5jdGlvbiBuYW1lXG4gIGFkZD86IHN0cmluZztcbiAgLy8gcmVtb3ZlRXZlbnRMaXN0ZW5lciBmdW5jdGlvbiBuYW1lXG4gIHJtPzogc3RyaW5nO1xuICAvLyBwcmVwZW5kRXZlbnRMaXN0ZW5lciBmdW5jdGlvbiBuYW1lXG4gIHByZXBlbmQ/OiBzdHJpbmc7XG4gIC8vIGxpc3RlbmVycyBmdW5jdGlvbiBuYW1lXG4gIGxpc3RlbmVycz86IHN0cmluZztcbiAgLy8gcmVtb3ZlQWxsTGlzdGVuZXJzIGZ1bmN0aW9uIG5hbWVcbiAgcm1BbGw/OiBzdHJpbmc7XG4gIC8vIHVzZUdsb2JhbENhbGxiYWNrIGZsYWdcbiAgdXNlRz86IGJvb2xlYW47XG4gIC8vIGNoZWNrIGR1cGxpY2F0ZSBmbGFnIHdoZW4gYWRkRXZlbnRMaXN0ZW5lclxuICBjaGtEdXA/OiBib29sZWFuO1xuICAvLyByZXR1cm4gdGFyZ2V0IGZsYWcgd2hlbiBhZGRFdmVudExpc3RlbmVyXG4gIHJ0PzogYm9vbGVhbjtcbiAgLy8gZXZlbnQgY29tcGFyZSBoYW5kbGVyXG4gIGRpZmY/OiAodGFzazogYW55LCBkZWxlZ2F0ZTogYW55KSA9PiBib29sZWFuO1xuICAvLyBzdXBwb3J0IHBhc3NpdmUgb3Igbm90XG4gIHN1cHBvcnRQYXNzaXZlPzogYm9vbGVhbjtcbiAgLy8gZ2V0IHN0cmluZyBmcm9tIGV2ZW50TmFtZSAoaW4gbm9kZWpzLCBldmVudE5hbWUgbWF5YmUgU3ltYm9sKVxuICBldmVudE5hbWVUb1N0cmluZz86IChldmVudE5hbWU6IGFueSkgPT4gc3RyaW5nO1xuICAvLyB0cmFuc2ZlciBldmVudE5hbWVcbiAgdHJhbnNmZXJFdmVudE5hbWU/OiAoZXZlbnROYW1lOiBzdHJpbmcpID0+IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoRXZlbnRUYXJnZXQoXG4gICAgX2dsb2JhbDogYW55LCBhcGlzOiBhbnlbXSwgcGF0Y2hPcHRpb25zPzogUGF0Y2hFdmVudFRhcmdldE9wdGlvbnMpIHtcbiAgY29uc3QgQUREX0VWRU5UX0xJU1RFTkVSID0gKHBhdGNoT3B0aW9ucyAmJiBwYXRjaE9wdGlvbnMuYWRkKSB8fCBBRERfRVZFTlRfTElTVEVORVJfU1RSO1xuICBjb25zdCBSRU1PVkVfRVZFTlRfTElTVEVORVIgPSAocGF0Y2hPcHRpb25zICYmIHBhdGNoT3B0aW9ucy5ybSkgfHwgUkVNT1ZFX0VWRU5UX0xJU1RFTkVSX1NUUjtcblxuICBjb25zdCBMSVNURU5FUlNfRVZFTlRfTElTVEVORVIgPSAocGF0Y2hPcHRpb25zICYmIHBhdGNoT3B0aW9ucy5saXN0ZW5lcnMpIHx8ICdldmVudExpc3RlbmVycyc7XG4gIGNvbnN0IFJFTU9WRV9BTExfTElTVEVORVJTX0VWRU5UX0xJU1RFTkVSID1cbiAgICAgIChwYXRjaE9wdGlvbnMgJiYgcGF0Y2hPcHRpb25zLnJtQWxsKSB8fCAncmVtb3ZlQWxsTGlzdGVuZXJzJztcblxuICBjb25zdCB6b25lU3ltYm9sQWRkRXZlbnRMaXN0ZW5lciA9IHpvbmVTeW1ib2woQUREX0VWRU5UX0xJU1RFTkVSKTtcblxuICBjb25zdCBBRERfRVZFTlRfTElTVEVORVJfU09VUkNFID0gJy4nICsgQUREX0VWRU5UX0xJU1RFTkVSICsgJzonO1xuXG4gIGNvbnN0IFBSRVBFTkRfRVZFTlRfTElTVEVORVIgPSAncHJlcGVuZExpc3RlbmVyJztcbiAgY29uc3QgUFJFUEVORF9FVkVOVF9MSVNURU5FUl9TT1VSQ0UgPSAnLicgKyBQUkVQRU5EX0VWRU5UX0xJU1RFTkVSICsgJzonO1xuXG4gIGNvbnN0IGludm9rZVRhc2sgPSBmdW5jdGlvbih0YXNrOiBhbnksIHRhcmdldDogYW55LCBldmVudDogRXZlbnQpIHtcbiAgICAvLyBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlLCBjaGVjayBpc1JlbW92ZWQgd2hpY2ggaXMgc2V0XG4gICAgLy8gYnkgcmVtb3ZlRXZlbnRMaXN0ZW5lclxuICAgIGlmICh0YXNrLmlzUmVtb3ZlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBkZWxlZ2F0ZSA9IHRhc2suY2FsbGJhY2s7XG4gICAgaWYgKHR5cGVvZiBkZWxlZ2F0ZSA9PT0gJ29iamVjdCcgJiYgZGVsZWdhdGUuaGFuZGxlRXZlbnQpIHtcbiAgICAgIC8vIGNyZWF0ZSB0aGUgYmluZCB2ZXJzaW9uIG9mIGhhbmRsZUV2ZW50IHdoZW4gaW52b2tlXG4gICAgICB0YXNrLmNhbGxiYWNrID0gKGV2ZW50OiBFdmVudCkgPT4gZGVsZWdhdGUuaGFuZGxlRXZlbnQoZXZlbnQpO1xuICAgICAgdGFzay5vcmlnaW5hbERlbGVnYXRlID0gZGVsZWdhdGU7XG4gICAgfVxuICAgIC8vIGludm9rZSBzdGF0aWMgdGFzay5pbnZva2VcbiAgICB0YXNrLmludm9rZSh0YXNrLCB0YXJnZXQsIFtldmVudF0pO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB0YXNrLm9wdGlvbnM7XG4gICAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIG9wdGlvbnMub25jZSkge1xuICAgICAgLy8gaWYgb3B0aW9ucy5vbmNlIGlzIHRydWUsIGFmdGVyIGludm9rZSBvbmNlIHJlbW92ZSBsaXN0ZW5lciBoZXJlXG4gICAgICAvLyBvbmx5IGJyb3dzZXIgbmVlZCB0byBkbyB0aGlzLCBub2RlanMgZXZlbnRFbWl0dGVyIHdpbGwgY2FsIHJlbW92ZUxpc3RlbmVyXG4gICAgICAvLyBpbnNpZGUgRXZlbnRFbWl0dGVyLm9uY2VcbiAgICAgIGNvbnN0IGRlbGVnYXRlID0gdGFzay5vcmlnaW5hbERlbGVnYXRlID8gdGFzay5vcmlnaW5hbERlbGVnYXRlIDogdGFzay5jYWxsYmFjaztcbiAgICAgIHRhcmdldFtSRU1PVkVfRVZFTlRfTElTVEVORVJdLmNhbGwodGFyZ2V0LCBldmVudC50eXBlLCBkZWxlZ2F0ZSwgb3B0aW9ucyk7XG4gICAgfVxuICB9O1xuXG4gIC8vIGdsb2JhbCBzaGFyZWQgem9uZUF3YXJlQ2FsbGJhY2sgdG8gaGFuZGxlIGFsbCBldmVudCBjYWxsYmFjayB3aXRoIGNhcHR1cmUgPSBmYWxzZVxuICBjb25zdCBnbG9iYWxab25lQXdhcmVDYWxsYmFjayA9IGZ1bmN0aW9uKHRoaXM6IHVua25vd24sIGV2ZW50OiBFdmVudCkge1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL3pvbmUuanMvaXNzdWVzLzkxMSwgaW4gSUUsIHNvbWV0aW1lc1xuICAgIC8vIGV2ZW50IHdpbGwgYmUgdW5kZWZpbmVkLCBzbyB3ZSBuZWVkIHRvIHVzZSB3aW5kb3cuZXZlbnRcbiAgICBldmVudCA9IGV2ZW50IHx8IF9nbG9iYWwuZXZlbnQ7XG4gICAgaWYgKCFldmVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBldmVudC50YXJnZXQgaXMgbmVlZGVkIGZvciBTYW1zdW5nIFRWIGFuZCBTb3VyY2VCdWZmZXJcbiAgICAvLyB8fCBnbG9iYWwgaXMgbmVlZGVkIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL3pvbmUuanMvaXNzdWVzLzE5MFxuICAgIGNvbnN0IHRhcmdldDogYW55ID0gdGhpcyB8fCBldmVudC50YXJnZXQgfHwgX2dsb2JhbDtcbiAgICBjb25zdCB0YXNrcyA9IHRhcmdldFt6b25lU3ltYm9sRXZlbnROYW1lc1tldmVudC50eXBlXVtGQUxTRV9TVFJdXTtcbiAgICBpZiAodGFza3MpIHtcbiAgICAgIC8vIGludm9rZSBhbGwgdGFza3Mgd2hpY2ggYXR0YWNoZWQgdG8gY3VycmVudCB0YXJnZXQgd2l0aCBnaXZlbiBldmVudC50eXBlIGFuZCBjYXB0dXJlID0gZmFsc2VcbiAgICAgIC8vIGZvciBwZXJmb3JtYW5jZSBjb25jZXJuLCBpZiB0YXNrLmxlbmd0aCA9PT0gMSwganVzdCBpbnZva2VcbiAgICAgIGlmICh0YXNrcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaW52b2tlVGFzayh0YXNrc1swXSwgdGFyZ2V0LCBldmVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci96b25lLmpzL2lzc3Vlcy84MzZcbiAgICAgICAgLy8gY29weSB0aGUgdGFza3MgYXJyYXkgYmVmb3JlIGludm9rZSwgdG8gYXZvaWRcbiAgICAgICAgLy8gdGhlIGNhbGxiYWNrIHdpbGwgcmVtb3ZlIGl0c2VsZiBvciBvdGhlciBsaXN0ZW5lclxuICAgICAgICBjb25zdCBjb3B5VGFza3MgPSB0YXNrcy5zbGljZSgpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvcHlUYXNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChldmVudCAmJiAoZXZlbnQgYXMgYW55KVtJTU1FRElBVEVfUFJPUEFHQVRJT05fU1lNQk9MXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGludm9rZVRhc2soY29weVRhc2tzW2ldLCB0YXJnZXQsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBnbG9iYWwgc2hhcmVkIHpvbmVBd2FyZUNhbGxiYWNrIHRvIGhhbmRsZSBhbGwgZXZlbnQgY2FsbGJhY2sgd2l0aCBjYXB0dXJlID0gdHJ1ZVxuICBjb25zdCBnbG9iYWxab25lQXdhcmVDYXB0dXJlQ2FsbGJhY2sgPSBmdW5jdGlvbih0aGlzOiB1bmtub3duLCBldmVudDogRXZlbnQpIHtcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci96b25lLmpzL2lzc3Vlcy85MTEsIGluIElFLCBzb21ldGltZXNcbiAgICAvLyBldmVudCB3aWxsIGJlIHVuZGVmaW5lZCwgc28gd2UgbmVlZCB0byB1c2Ugd2luZG93LmV2ZW50XG4gICAgZXZlbnQgPSBldmVudCB8fCBfZ2xvYmFsLmV2ZW50O1xuICAgIGlmICghZXZlbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gZXZlbnQudGFyZ2V0IGlzIG5lZWRlZCBmb3IgU2Ftc3VuZyBUViBhbmQgU291cmNlQnVmZmVyXG4gICAgLy8gfHwgZ2xvYmFsIGlzIG5lZWRlZCBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci96b25lLmpzL2lzc3Vlcy8xOTBcbiAgICBjb25zdCB0YXJnZXQ6IGFueSA9IHRoaXMgfHwgZXZlbnQudGFyZ2V0IHx8IF9nbG9iYWw7XG4gICAgY29uc3QgdGFza3MgPSB0YXJnZXRbem9uZVN5bWJvbEV2ZW50TmFtZXNbZXZlbnQudHlwZV1bVFJVRV9TVFJdXTtcbiAgICBpZiAodGFza3MpIHtcbiAgICAgIC8vIGludm9rZSBhbGwgdGFza3Mgd2hpY2ggYXR0YWNoZWQgdG8gY3VycmVudCB0YXJnZXQgd2l0aCBnaXZlbiBldmVudC50eXBlIGFuZCBjYXB0dXJlID0gZmFsc2VcbiAgICAgIC8vIGZvciBwZXJmb3JtYW5jZSBjb25jZXJuLCBpZiB0YXNrLmxlbmd0aCA9PT0gMSwganVzdCBpbnZva2VcbiAgICAgIGlmICh0YXNrcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaW52b2tlVGFzayh0YXNrc1swXSwgdGFyZ2V0LCBldmVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci96b25lLmpzL2lzc3Vlcy84MzZcbiAgICAgICAgLy8gY29weSB0aGUgdGFza3MgYXJyYXkgYmVmb3JlIGludm9rZSwgdG8gYXZvaWRcbiAgICAgICAgLy8gdGhlIGNhbGxiYWNrIHdpbGwgcmVtb3ZlIGl0c2VsZiBvciBvdGhlciBsaXN0ZW5lclxuICAgICAgICBjb25zdCBjb3B5VGFza3MgPSB0YXNrcy5zbGljZSgpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvcHlUYXNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChldmVudCAmJiAoZXZlbnQgYXMgYW55KVtJTU1FRElBVEVfUFJPUEFHQVRJT05fU1lNQk9MXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGludm9rZVRhc2soY29weVRhc2tzW2ldLCB0YXJnZXQsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBwYXRjaEV2ZW50VGFyZ2V0TWV0aG9kcyhvYmo6IGFueSwgcGF0Y2hPcHRpb25zPzogUGF0Y2hFdmVudFRhcmdldE9wdGlvbnMpIHtcbiAgICBpZiAoIW9iaikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCB1c2VHbG9iYWxDYWxsYmFjayA9IHRydWU7XG4gICAgaWYgKHBhdGNoT3B0aW9ucyAmJiBwYXRjaE9wdGlvbnMudXNlRyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB1c2VHbG9iYWxDYWxsYmFjayA9IHBhdGNoT3B0aW9ucy51c2VHO1xuICAgIH1cbiAgICBjb25zdCB2YWxpZGF0ZUhhbmRsZXIgPSBwYXRjaE9wdGlvbnMgJiYgcGF0Y2hPcHRpb25zLnZoO1xuXG4gICAgbGV0IGNoZWNrRHVwbGljYXRlID0gdHJ1ZTtcbiAgICBpZiAocGF0Y2hPcHRpb25zICYmIHBhdGNoT3B0aW9ucy5jaGtEdXAgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY2hlY2tEdXBsaWNhdGUgPSBwYXRjaE9wdGlvbnMuY2hrRHVwO1xuICAgIH1cblxuICAgIGxldCByZXR1cm5UYXJnZXQgPSBmYWxzZTtcbiAgICBpZiAocGF0Y2hPcHRpb25zICYmIHBhdGNoT3B0aW9ucy5ydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm5UYXJnZXQgPSBwYXRjaE9wdGlvbnMucnQ7XG4gICAgfVxuXG4gICAgbGV0IHByb3RvID0gb2JqO1xuICAgIHdoaWxlIChwcm90byAmJiAhcHJvdG8uaGFzT3duUHJvcGVydHkoQUREX0VWRU5UX0xJU1RFTkVSKSkge1xuICAgICAgcHJvdG8gPSBPYmplY3RHZXRQcm90b3R5cGVPZihwcm90byk7XG4gICAgfVxuICAgIGlmICghcHJvdG8gJiYgb2JqW0FERF9FVkVOVF9MSVNURU5FUl0pIHtcbiAgICAgIC8vIHNvbWVob3cgd2UgZGlkIG5vdCBmaW5kIGl0LCBidXQgd2UgY2FuIHNlZSBpdC4gVGhpcyBoYXBwZW5zIG9uIElFIGZvciBXaW5kb3cgcHJvcGVydGllcy5cbiAgICAgIHByb3RvID0gb2JqO1xuICAgIH1cblxuICAgIGlmICghcHJvdG8pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHByb3RvW3pvbmVTeW1ib2xBZGRFdmVudExpc3RlbmVyXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGV2ZW50TmFtZVRvU3RyaW5nID0gcGF0Y2hPcHRpb25zICYmIHBhdGNoT3B0aW9ucy5ldmVudE5hbWVUb1N0cmluZztcblxuICAgIC8vIGEgc2hhcmVkIGdsb2JhbCB0YXNrRGF0YSB0byBwYXNzIGRhdGEgZm9yIHNjaGVkdWxlRXZlbnRUYXNrXG4gICAgLy8gc28gd2UgZG8gbm90IG5lZWQgdG8gY3JlYXRlIGEgbmV3IG9iamVjdCBqdXN0IGZvciBwYXNzIHNvbWUgZGF0YVxuICAgIGNvbnN0IHRhc2tEYXRhOiBhbnkgPSB7fTtcblxuICAgIGNvbnN0IG5hdGl2ZUFkZEV2ZW50TGlzdGVuZXIgPSBwcm90b1t6b25lU3ltYm9sQWRkRXZlbnRMaXN0ZW5lcl0gPSBwcm90b1tBRERfRVZFTlRfTElTVEVORVJdO1xuICAgIGNvbnN0IG5hdGl2ZVJlbW92ZUV2ZW50TGlzdGVuZXIgPSBwcm90b1t6b25lU3ltYm9sKFJFTU9WRV9FVkVOVF9MSVNURU5FUildID1cbiAgICAgICAgcHJvdG9bUkVNT1ZFX0VWRU5UX0xJU1RFTkVSXTtcblxuICAgIGNvbnN0IG5hdGl2ZUxpc3RlbmVycyA9IHByb3RvW3pvbmVTeW1ib2woTElTVEVORVJTX0VWRU5UX0xJU1RFTkVSKV0gPVxuICAgICAgICBwcm90b1tMSVNURU5FUlNfRVZFTlRfTElTVEVORVJdO1xuICAgIGNvbnN0IG5hdGl2ZVJlbW92ZUFsbExpc3RlbmVycyA9IHByb3RvW3pvbmVTeW1ib2woUkVNT1ZFX0FMTF9MSVNURU5FUlNfRVZFTlRfTElTVEVORVIpXSA9XG4gICAgICAgIHByb3RvW1JFTU9WRV9BTExfTElTVEVORVJTX0VWRU5UX0xJU1RFTkVSXTtcblxuICAgIGxldCBuYXRpdmVQcmVwZW5kRXZlbnRMaXN0ZW5lcjogYW55O1xuICAgIGlmIChwYXRjaE9wdGlvbnMgJiYgcGF0Y2hPcHRpb25zLnByZXBlbmQpIHtcbiAgICAgIG5hdGl2ZVByZXBlbmRFdmVudExpc3RlbmVyID0gcHJvdG9bem9uZVN5bWJvbChwYXRjaE9wdGlvbnMucHJlcGVuZCldID1cbiAgICAgICAgICBwcm90b1twYXRjaE9wdGlvbnMucHJlcGVuZF07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hlY2tJc1Bhc3NpdmUodGFzazogVGFzaykge1xuICAgICAgaWYgKCFwYXNzaXZlU3VwcG9ydGVkICYmIHR5cGVvZiB0YXNrRGF0YS5vcHRpb25zICE9PSAnYm9vbGVhbicgJiZcbiAgICAgICAgICB0eXBlb2YgdGFza0RhdGEub3B0aW9ucyAhPT0gJ3VuZGVmaW5lZCcgJiYgdGFza0RhdGEub3B0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICAvLyBvcHRpb25zIGlzIGEgbm9uLW51bGwgbm9uLXVuZGVmaW5lZCBvYmplY3RcbiAgICAgICAgLy8gcGFzc2l2ZSBpcyBub3Qgc3VwcG9ydGVkXG4gICAgICAgIC8vIGRvbid0IHBhc3Mgb3B0aW9ucyBhcyBvYmplY3RcbiAgICAgICAgLy8ganVzdCBwYXNzIGNhcHR1cmUgYXMgYSBib29sZWFuXG4gICAgICAgICh0YXNrIGFzIGFueSkub3B0aW9ucyA9ICEhdGFza0RhdGEub3B0aW9ucy5jYXB0dXJlO1xuICAgICAgICB0YXNrRGF0YS5vcHRpb25zID0gKHRhc2sgYXMgYW55KS5vcHRpb25zO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGN1c3RvbVNjaGVkdWxlR2xvYmFsID0gZnVuY3Rpb24odGFzazogVGFzaykge1xuICAgICAgLy8gaWYgdGhlcmUgaXMgYWxyZWFkeSBhIHRhc2sgZm9yIHRoZSBldmVudE5hbWUgKyBjYXB0dXJlLFxuICAgICAgLy8ganVzdCByZXR1cm4sIGJlY2F1c2Ugd2UgdXNlIHRoZSBzaGFyZWQgZ2xvYmFsWm9uZUF3YXJlQ2FsbGJhY2sgaGVyZS5cbiAgICAgIGlmICh0YXNrRGF0YS5pc0V4aXN0aW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNoZWNrSXNQYXNzaXZlKHRhc2spO1xuICAgICAgcmV0dXJuIG5hdGl2ZUFkZEV2ZW50TGlzdGVuZXIuY2FsbChcbiAgICAgICAgICB0YXNrRGF0YS50YXJnZXQsIHRhc2tEYXRhLmV2ZW50TmFtZSxcbiAgICAgICAgICB0YXNrRGF0YS5jYXB0dXJlID8gZ2xvYmFsWm9uZUF3YXJlQ2FwdHVyZUNhbGxiYWNrIDogZ2xvYmFsWm9uZUF3YXJlQ2FsbGJhY2ssXG4gICAgICAgICAgdGFza0RhdGEub3B0aW9ucyk7XG4gICAgfTtcblxuICAgIGNvbnN0IGN1c3RvbUNhbmNlbEdsb2JhbCA9IGZ1bmN0aW9uKHRhc2s6IGFueSkge1xuICAgICAgLy8gaWYgdGFzayBpcyBub3QgbWFya2VkIGFzIGlzUmVtb3ZlZCwgdGhpcyBjYWxsIGlzIGRpcmVjdGx5XG4gICAgICAvLyBmcm9tIFpvbmUucHJvdG90eXBlLmNhbmNlbFRhc2ssIHdlIHNob3VsZCByZW1vdmUgdGhlIHRhc2tcbiAgICAgIC8vIGZyb20gdGFza3NMaXN0IG9mIHRhcmdldCBmaXJzdFxuICAgICAgaWYgKCF0YXNrLmlzUmVtb3ZlZCkge1xuICAgICAgICBjb25zdCBzeW1ib2xFdmVudE5hbWVzID0gem9uZVN5bWJvbEV2ZW50TmFtZXNbdGFzay5ldmVudE5hbWVdO1xuICAgICAgICBsZXQgc3ltYm9sRXZlbnROYW1lO1xuICAgICAgICBpZiAoc3ltYm9sRXZlbnROYW1lcykge1xuICAgICAgICAgIHN5bWJvbEV2ZW50TmFtZSA9IHN5bWJvbEV2ZW50TmFtZXNbdGFzay5jYXB0dXJlID8gVFJVRV9TVFIgOiBGQUxTRV9TVFJdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nVGFza3MgPSBzeW1ib2xFdmVudE5hbWUgJiYgdGFzay50YXJnZXRbc3ltYm9sRXZlbnROYW1lXTtcbiAgICAgICAgaWYgKGV4aXN0aW5nVGFza3MpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4aXN0aW5nVGFza3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nVGFzayA9IGV4aXN0aW5nVGFza3NbaV07XG4gICAgICAgICAgICBpZiAoZXhpc3RpbmdUYXNrID09PSB0YXNrKSB7XG4gICAgICAgICAgICAgIGV4aXN0aW5nVGFza3Muc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAvLyBzZXQgaXNSZW1vdmVkIHRvIGRhdGEgZm9yIGZhc3RlciBpbnZva2VUYXNrIGNoZWNrXG4gICAgICAgICAgICAgIHRhc2suaXNSZW1vdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nVGFza3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gYWxsIHRhc2tzIGZvciB0aGUgZXZlbnROYW1lICsgY2FwdHVyZSBoYXZlIGdvbmUsXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGdsb2JhbFpvbmVBd2FyZUNhbGxiYWNrIGFuZCByZW1vdmUgdGhlIHRhc2sgY2FjaGUgZnJvbSB0YXJnZXRcbiAgICAgICAgICAgICAgICB0YXNrLmFsbFJlbW92ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRhc2sudGFyZ2V0W3N5bWJvbEV2ZW50TmFtZV0gPSBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gaWYgYWxsIHRhc2tzIGZvciB0aGUgZXZlbnROYW1lICsgY2FwdHVyZSBoYXZlIGdvbmUsXG4gICAgICAvLyB3ZSB3aWxsIHJlYWxseSByZW1vdmUgdGhlIGdsb2JhbCBldmVudCBjYWxsYmFjayxcbiAgICAgIC8vIGlmIG5vdCwgcmV0dXJuXG4gICAgICBpZiAoIXRhc2suYWxsUmVtb3ZlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXR1cm4gbmF0aXZlUmVtb3ZlRXZlbnRMaXN0ZW5lci5jYWxsKFxuICAgICAgICAgIHRhc2sudGFyZ2V0LCB0YXNrLmV2ZW50TmFtZSxcbiAgICAgICAgICB0YXNrLmNhcHR1cmUgPyBnbG9iYWxab25lQXdhcmVDYXB0dXJlQ2FsbGJhY2sgOiBnbG9iYWxab25lQXdhcmVDYWxsYmFjaywgdGFzay5vcHRpb25zKTtcbiAgICB9O1xuXG4gICAgY29uc3QgY3VzdG9tU2NoZWR1bGVOb25HbG9iYWwgPSBmdW5jdGlvbih0YXNrOiBUYXNrKSB7XG4gICAgICBjaGVja0lzUGFzc2l2ZSh0YXNrKTtcbiAgICAgIHJldHVybiBuYXRpdmVBZGRFdmVudExpc3RlbmVyLmNhbGwoXG4gICAgICAgICAgdGFza0RhdGEudGFyZ2V0LCB0YXNrRGF0YS5ldmVudE5hbWUsIHRhc2suaW52b2tlLCB0YXNrRGF0YS5vcHRpb25zKTtcbiAgICB9O1xuXG4gICAgY29uc3QgY3VzdG9tU2NoZWR1bGVQcmVwZW5kID0gZnVuY3Rpb24odGFzazogVGFzaykge1xuICAgICAgcmV0dXJuIG5hdGl2ZVByZXBlbmRFdmVudExpc3RlbmVyLmNhbGwoXG4gICAgICAgICAgdGFza0RhdGEudGFyZ2V0LCB0YXNrRGF0YS5ldmVudE5hbWUsIHRhc2suaW52b2tlLCB0YXNrRGF0YS5vcHRpb25zKTtcbiAgICB9O1xuXG4gICAgY29uc3QgY3VzdG9tQ2FuY2VsTm9uR2xvYmFsID0gZnVuY3Rpb24odGFzazogYW55KSB7XG4gICAgICByZXR1cm4gbmF0aXZlUmVtb3ZlRXZlbnRMaXN0ZW5lci5jYWxsKHRhc2sudGFyZ2V0LCB0YXNrLmV2ZW50TmFtZSwgdGFzay5pbnZva2UsIHRhc2sub3B0aW9ucyk7XG4gICAgfTtcblxuICAgIGNvbnN0IGN1c3RvbVNjaGVkdWxlID0gdXNlR2xvYmFsQ2FsbGJhY2sgPyBjdXN0b21TY2hlZHVsZUdsb2JhbCA6IGN1c3RvbVNjaGVkdWxlTm9uR2xvYmFsO1xuICAgIGNvbnN0IGN1c3RvbUNhbmNlbCA9IHVzZUdsb2JhbENhbGxiYWNrID8gY3VzdG9tQ2FuY2VsR2xvYmFsIDogY3VzdG9tQ2FuY2VsTm9uR2xvYmFsO1xuXG4gICAgY29uc3QgY29tcGFyZVRhc2tDYWxsYmFja1ZzRGVsZWdhdGUgPSBmdW5jdGlvbih0YXNrOiBhbnksIGRlbGVnYXRlOiBhbnkpIHtcbiAgICAgIGNvbnN0IHR5cGVPZkRlbGVnYXRlID0gdHlwZW9mIGRlbGVnYXRlO1xuICAgICAgcmV0dXJuICh0eXBlT2ZEZWxlZ2F0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0YXNrLmNhbGxiYWNrID09PSBkZWxlZ2F0ZSkgfHxcbiAgICAgICAgICAodHlwZU9mRGVsZWdhdGUgPT09ICdvYmplY3QnICYmIHRhc2sub3JpZ2luYWxEZWxlZ2F0ZSA9PT0gZGVsZWdhdGUpO1xuICAgIH07XG5cbiAgICBjb25zdCBjb21wYXJlID1cbiAgICAgICAgKHBhdGNoT3B0aW9ucyAmJiBwYXRjaE9wdGlvbnMuZGlmZikgPyBwYXRjaE9wdGlvbnMuZGlmZiA6IGNvbXBhcmVUYXNrQ2FsbGJhY2tWc0RlbGVnYXRlO1xuXG4gICAgY29uc3QgYmxhY2tMaXN0ZWRFdmVudHM6IHN0cmluZ1tdID0gKFpvbmUgYXMgYW55KVt6b25lU3ltYm9sKCdCTEFDS19MSVNURURfRVZFTlRTJyldO1xuXG4gICAgY29uc3QgbWFrZUFkZExpc3RlbmVyID0gZnVuY3Rpb24oXG4gICAgICAgIG5hdGl2ZUxpc3RlbmVyOiBhbnksIGFkZFNvdXJjZTogc3RyaW5nLCBjdXN0b21TY2hlZHVsZUZuOiBhbnksIGN1c3RvbUNhbmNlbEZuOiBhbnksXG4gICAgICAgIHJldHVyblRhcmdldCA9IGZhbHNlLCBwcmVwZW5kID0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbih0aGlzOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMgfHwgX2dsb2JhbDtcbiAgICAgICAgbGV0IGV2ZW50TmFtZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgaWYgKHBhdGNoT3B0aW9ucyAmJiBwYXRjaE9wdGlvbnMudHJhbnNmZXJFdmVudE5hbWUpIHtcbiAgICAgICAgICBldmVudE5hbWUgPSBwYXRjaE9wdGlvbnMudHJhbnNmZXJFdmVudE5hbWUoZXZlbnROYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGVsZWdhdGUgPSBhcmd1bWVudHNbMV07XG4gICAgICAgIGlmICghZGVsZWdhdGUpIHtcbiAgICAgICAgICByZXR1cm4gbmF0aXZlTGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNOb2RlICYmIGV2ZW50TmFtZSA9PT0gJ3VuY2F1Z2h0RXhjZXB0aW9uJykge1xuICAgICAgICAgIC8vIGRvbid0IHBhdGNoIHVuY2F1Z2h0RXhjZXB0aW9uIG9mIG5vZGVqcyB0byBwcmV2ZW50IGVuZGxlc3MgbG9vcFxuICAgICAgICAgIHJldHVybiBuYXRpdmVMaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZG9uJ3QgY3JlYXRlIHRoZSBiaW5kIGRlbGVnYXRlIGZ1bmN0aW9uIGZvciBoYW5kbGVFdmVudFxuICAgICAgICAvLyBjYXNlIGhlcmUgdG8gaW1wcm92ZSBhZGRFdmVudExpc3RlbmVyIHBlcmZvcm1hbmNlXG4gICAgICAgIC8vIHdlIHdpbGwgY3JlYXRlIHRoZSBiaW5kIGRlbGVnYXRlIHdoZW4gaW52b2tlXG4gICAgICAgIGxldCBpc0hhbmRsZUV2ZW50ID0gZmFsc2U7XG4gICAgICAgIGlmICh0eXBlb2YgZGVsZWdhdGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBpZiAoIWRlbGVnYXRlLmhhbmRsZUV2ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gbmF0aXZlTGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaXNIYW5kbGVFdmVudCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsaWRhdGVIYW5kbGVyICYmICF2YWxpZGF0ZUhhbmRsZXIobmF0aXZlTGlzdGVuZXIsIGRlbGVnYXRlLCB0YXJnZXQsIGFyZ3VtZW50cykpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvcHRpb25zID0gYXJndW1lbnRzWzJdO1xuXG4gICAgICAgIGlmIChibGFja0xpc3RlZEV2ZW50cykge1xuICAgICAgICAgIC8vIGNoZWNrIGJsYWNrIGxpc3RcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJsYWNrTGlzdGVkRXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnROYW1lID09PSBibGFja0xpc3RlZEV2ZW50c1tpXSkge1xuICAgICAgICAgICAgICByZXR1cm4gbmF0aXZlTGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY2FwdHVyZTtcbiAgICAgICAgbGV0IG9uY2UgPSBmYWxzZTtcbiAgICAgICAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNhcHR1cmUgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zID09PSB0cnVlKSB7XG4gICAgICAgICAgY2FwdHVyZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBjYXB0dXJlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FwdHVyZSA9IG9wdGlvbnMgPyAhIW9wdGlvbnMuY2FwdHVyZSA6IGZhbHNlO1xuICAgICAgICAgIG9uY2UgPSBvcHRpb25zID8gISFvcHRpb25zLm9uY2UgOiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHpvbmUgPSBab25lLmN1cnJlbnQ7XG4gICAgICAgIGNvbnN0IHN5bWJvbEV2ZW50TmFtZXMgPSB6b25lU3ltYm9sRXZlbnROYW1lc1tldmVudE5hbWVdO1xuICAgICAgICBsZXQgc3ltYm9sRXZlbnROYW1lO1xuICAgICAgICBpZiAoIXN5bWJvbEV2ZW50TmFtZXMpIHtcbiAgICAgICAgICAvLyB0aGUgY29kZSBpcyBkdXBsaWNhdGUsIGJ1dCBJIGp1c3Qgd2FudCB0byBnZXQgc29tZSBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAgICAgICAgICBjb25zdCBmYWxzZUV2ZW50TmFtZSA9XG4gICAgICAgICAgICAgIChldmVudE5hbWVUb1N0cmluZyA/IGV2ZW50TmFtZVRvU3RyaW5nKGV2ZW50TmFtZSkgOiBldmVudE5hbWUpICsgRkFMU0VfU1RSO1xuICAgICAgICAgIGNvbnN0IHRydWVFdmVudE5hbWUgPVxuICAgICAgICAgICAgICAoZXZlbnROYW1lVG9TdHJpbmcgPyBldmVudE5hbWVUb1N0cmluZyhldmVudE5hbWUpIDogZXZlbnROYW1lKSArIFRSVUVfU1RSO1xuICAgICAgICAgIGNvbnN0IHN5bWJvbCA9IFpPTkVfU1lNQk9MX1BSRUZJWCArIGZhbHNlRXZlbnROYW1lO1xuICAgICAgICAgIGNvbnN0IHN5bWJvbENhcHR1cmUgPSBaT05FX1NZTUJPTF9QUkVGSVggKyB0cnVlRXZlbnROYW1lO1xuICAgICAgICAgIHpvbmVTeW1ib2xFdmVudE5hbWVzW2V2ZW50TmFtZV0gPSB7fTtcbiAgICAgICAgICB6b25lU3ltYm9sRXZlbnROYW1lc1tldmVudE5hbWVdW0ZBTFNFX1NUUl0gPSBzeW1ib2w7XG4gICAgICAgICAgem9uZVN5bWJvbEV2ZW50TmFtZXNbZXZlbnROYW1lXVtUUlVFX1NUUl0gPSBzeW1ib2xDYXB0dXJlO1xuICAgICAgICAgIHN5bWJvbEV2ZW50TmFtZSA9IGNhcHR1cmUgPyBzeW1ib2xDYXB0dXJlIDogc3ltYm9sO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN5bWJvbEV2ZW50TmFtZSA9IHN5bWJvbEV2ZW50TmFtZXNbY2FwdHVyZSA/IFRSVUVfU1RSIDogRkFMU0VfU1RSXTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZXhpc3RpbmdUYXNrcyA9IHRhcmdldFtzeW1ib2xFdmVudE5hbWVdO1xuICAgICAgICBsZXQgaXNFeGlzdGluZyA9IGZhbHNlO1xuICAgICAgICBpZiAoZXhpc3RpbmdUYXNrcykge1xuICAgICAgICAgIC8vIGFscmVhZHkgaGF2ZSB0YXNrIHJlZ2lzdGVyZWRcbiAgICAgICAgICBpc0V4aXN0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoY2hlY2tEdXBsaWNhdGUpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXhpc3RpbmdUYXNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICBpZiAoY29tcGFyZShleGlzdGluZ1Rhc2tzW2ldLCBkZWxlZ2F0ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBzYW1lIGNhbGxiYWNrLCBzYW1lIGNhcHR1cmUsIHNhbWUgZXZlbnQgbmFtZSwganVzdCByZXR1cm5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXhpc3RpbmdUYXNrcyA9IHRhcmdldFtzeW1ib2xFdmVudE5hbWVdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHNvdXJjZTtcbiAgICAgICAgY29uc3QgY29uc3RydWN0b3JOYW1lID0gdGFyZ2V0LmNvbnN0cnVjdG9yWyduYW1lJ107XG4gICAgICAgIGNvbnN0IHRhcmdldFNvdXJjZSA9IGdsb2JhbFNvdXJjZXNbY29uc3RydWN0b3JOYW1lXTtcbiAgICAgICAgaWYgKHRhcmdldFNvdXJjZSkge1xuICAgICAgICAgIHNvdXJjZSA9IHRhcmdldFNvdXJjZVtldmVudE5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIGlmICghc291cmNlKSB7XG4gICAgICAgICAgc291cmNlID0gY29uc3RydWN0b3JOYW1lICsgYWRkU291cmNlICtcbiAgICAgICAgICAgICAgKGV2ZW50TmFtZVRvU3RyaW5nID8gZXZlbnROYW1lVG9TdHJpbmcoZXZlbnROYW1lKSA6IGV2ZW50TmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZG8gbm90IGNyZWF0ZSBhIG5ldyBvYmplY3QgYXMgdGFzay5kYXRhIHRvIHBhc3MgdGhvc2UgdGhpbmdzXG4gICAgICAgIC8vIGp1c3QgdXNlIHRoZSBnbG9iYWwgc2hhcmVkIG9uZVxuICAgICAgICB0YXNrRGF0YS5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgaWYgKG9uY2UpIHtcbiAgICAgICAgICAvLyBpZiBhZGRFdmVudExpc3RlbmVyIHdpdGggb25jZSBvcHRpb25zLCB3ZSBkb24ndCBwYXNzIGl0IHRvXG4gICAgICAgICAgLy8gbmF0aXZlIGFkZEV2ZW50TGlzdGVuZXIsIGluc3RlYWQgd2Uga2VlcCB0aGUgb25jZSBzZXR0aW5nXG4gICAgICAgICAgLy8gYW5kIGhhbmRsZSBvdXJzZWx2ZXMuXG4gICAgICAgICAgdGFza0RhdGEub3B0aW9ucy5vbmNlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGFza0RhdGEudGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgICB0YXNrRGF0YS5jYXB0dXJlID0gY2FwdHVyZTtcbiAgICAgICAgdGFza0RhdGEuZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgICAgICB0YXNrRGF0YS5pc0V4aXN0aW5nID0gaXNFeGlzdGluZztcblxuICAgICAgICBjb25zdCBkYXRhID0gdXNlR2xvYmFsQ2FsbGJhY2sgPyBPUFRJTUlaRURfWk9ORV9FVkVOVF9UQVNLX0RBVEEgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8ga2VlcCB0YXNrRGF0YSBpbnRvIGRhdGEgdG8gYWxsb3cgb25TY2hlZHVsZUV2ZW50VGFzayB0byBhY2Nlc3MgdGhlIHRhc2sgaW5mb3JtYXRpb25cbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAoZGF0YSBhcyBhbnkpLnRhc2tEYXRhID0gdGFza0RhdGE7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0YXNrOiBhbnkgPVxuICAgICAgICAgICAgem9uZS5zY2hlZHVsZUV2ZW50VGFzayhzb3VyY2UsIGRlbGVnYXRlLCBkYXRhLCBjdXN0b21TY2hlZHVsZUZuLCBjdXN0b21DYW5jZWxGbik7XG5cbiAgICAgICAgLy8gc2hvdWxkIGNsZWFyIHRhc2tEYXRhLnRhcmdldCB0byBhdm9pZCBtZW1vcnkgbGVha1xuICAgICAgICAvLyBpc3N1ZSwgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMjA0NDJcbiAgICAgICAgdGFza0RhdGEudGFyZ2V0ID0gbnVsbDtcblxuICAgICAgICAvLyBuZWVkIHRvIGNsZWFyIHVwIHRhc2tEYXRhIGJlY2F1c2UgaXQgaXMgYSBnbG9iYWwgb2JqZWN0XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgKGRhdGEgYXMgYW55KS50YXNrRGF0YSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBoYXZlIHRvIHNhdmUgdGhvc2UgaW5mb3JtYXRpb24gdG8gdGFzayBpbiBjYXNlXG4gICAgICAgIC8vIGFwcGxpY2F0aW9uIG1heSBjYWxsIHRhc2suem9uZS5jYW5jZWxUYXNrKCkgZGlyZWN0bHlcbiAgICAgICAgaWYgKG9uY2UpIHtcbiAgICAgICAgICBvcHRpb25zLm9uY2UgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKCFwYXNzaXZlU3VwcG9ydGVkICYmIHR5cGVvZiB0YXNrLm9wdGlvbnMgPT09ICdib29sZWFuJykpIHtcbiAgICAgICAgICAvLyBpZiBub3Qgc3VwcG9ydCBwYXNzaXZlLCBhbmQgd2UgcGFzcyBhbiBvcHRpb24gb2JqZWN0XG4gICAgICAgICAgLy8gdG8gYWRkRXZlbnRMaXN0ZW5lciwgd2Ugc2hvdWxkIHNhdmUgdGhlIG9wdGlvbnMgdG8gdGFza1xuICAgICAgICAgIHRhc2sub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIH1cbiAgICAgICAgdGFzay50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICAgIHRhc2suY2FwdHVyZSA9IGNhcHR1cmU7XG4gICAgICAgIHRhc2suZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgICAgICBpZiAoaXNIYW5kbGVFdmVudCkge1xuICAgICAgICAgIC8vIHNhdmUgb3JpZ2luYWwgZGVsZWdhdGUgZm9yIGNvbXBhcmUgdG8gY2hlY2sgZHVwbGljYXRlXG4gICAgICAgICAgKHRhc2sgYXMgYW55KS5vcmlnaW5hbERlbGVnYXRlID0gZGVsZWdhdGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFwcmVwZW5kKSB7XG4gICAgICAgICAgZXhpc3RpbmdUYXNrcy5wdXNoKHRhc2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGV4aXN0aW5nVGFza3MudW5zaGlmdCh0YXNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXR1cm5UYXJnZXQpIHtcbiAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG5cbiAgICBwcm90b1tBRERfRVZFTlRfTElTVEVORVJdID0gbWFrZUFkZExpc3RlbmVyKFxuICAgICAgICBuYXRpdmVBZGRFdmVudExpc3RlbmVyLCBBRERfRVZFTlRfTElTVEVORVJfU09VUkNFLCBjdXN0b21TY2hlZHVsZSwgY3VzdG9tQ2FuY2VsLFxuICAgICAgICByZXR1cm5UYXJnZXQpO1xuICAgIGlmIChuYXRpdmVQcmVwZW5kRXZlbnRMaXN0ZW5lcikge1xuICAgICAgcHJvdG9bUFJFUEVORF9FVkVOVF9MSVNURU5FUl0gPSBtYWtlQWRkTGlzdGVuZXIoXG4gICAgICAgICAgbmF0aXZlUHJlcGVuZEV2ZW50TGlzdGVuZXIsIFBSRVBFTkRfRVZFTlRfTElTVEVORVJfU09VUkNFLCBjdXN0b21TY2hlZHVsZVByZXBlbmQsXG4gICAgICAgICAgY3VzdG9tQ2FuY2VsLCByZXR1cm5UYXJnZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHByb3RvW1JFTU9WRV9FVkVOVF9MSVNURU5FUl0gPSBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMgfHwgX2dsb2JhbDtcbiAgICAgIGxldCBldmVudE5hbWUgPSBhcmd1bWVudHNbMF07XG4gICAgICBpZiAocGF0Y2hPcHRpb25zICYmIHBhdGNoT3B0aW9ucy50cmFuc2ZlckV2ZW50TmFtZSkge1xuICAgICAgICBldmVudE5hbWUgPSBwYXRjaE9wdGlvbnMudHJhbnNmZXJFdmVudE5hbWUoZXZlbnROYW1lKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBhcmd1bWVudHNbMl07XG5cbiAgICAgIGxldCBjYXB0dXJlO1xuICAgICAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjYXB0dXJlID0gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMgPT09IHRydWUpIHtcbiAgICAgICAgY2FwdHVyZSA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMgPT09IGZhbHNlKSB7XG4gICAgICAgIGNhcHR1cmUgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhcHR1cmUgPSBvcHRpb25zID8gISFvcHRpb25zLmNhcHR1cmUgOiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGVsZWdhdGUgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoIWRlbGVnYXRlKSB7XG4gICAgICAgIHJldHVybiBuYXRpdmVSZW1vdmVFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh2YWxpZGF0ZUhhbmRsZXIgJiZcbiAgICAgICAgICAhdmFsaWRhdGVIYW5kbGVyKG5hdGl2ZVJlbW92ZUV2ZW50TGlzdGVuZXIsIGRlbGVnYXRlLCB0YXJnZXQsIGFyZ3VtZW50cykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzeW1ib2xFdmVudE5hbWVzID0gem9uZVN5bWJvbEV2ZW50TmFtZXNbZXZlbnROYW1lXTtcbiAgICAgIGxldCBzeW1ib2xFdmVudE5hbWU7XG4gICAgICBpZiAoc3ltYm9sRXZlbnROYW1lcykge1xuICAgICAgICBzeW1ib2xFdmVudE5hbWUgPSBzeW1ib2xFdmVudE5hbWVzW2NhcHR1cmUgPyBUUlVFX1NUUiA6IEZBTFNFX1NUUl07XG4gICAgICB9XG4gICAgICBjb25zdCBleGlzdGluZ1Rhc2tzID0gc3ltYm9sRXZlbnROYW1lICYmIHRhcmdldFtzeW1ib2xFdmVudE5hbWVdO1xuICAgICAgaWYgKGV4aXN0aW5nVGFza3MpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleGlzdGluZ1Rhc2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgZXhpc3RpbmdUYXNrID0gZXhpc3RpbmdUYXNrc1tpXTtcbiAgICAgICAgICBpZiAoY29tcGFyZShleGlzdGluZ1Rhc2ssIGRlbGVnYXRlKSkge1xuICAgICAgICAgICAgZXhpc3RpbmdUYXNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAvLyBzZXQgaXNSZW1vdmVkIHRvIGRhdGEgZm9yIGZhc3RlciBpbnZva2VUYXNrIGNoZWNrXG4gICAgICAgICAgICAoZXhpc3RpbmdUYXNrIGFzIGFueSkuaXNSZW1vdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChleGlzdGluZ1Rhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAvLyBhbGwgdGFza3MgZm9yIHRoZSBldmVudE5hbWUgKyBjYXB0dXJlIGhhdmUgZ29uZSxcbiAgICAgICAgICAgICAgLy8gcmVtb3ZlIGdsb2JhbFpvbmVBd2FyZUNhbGxiYWNrIGFuZCByZW1vdmUgdGhlIHRhc2sgY2FjaGUgZnJvbSB0YXJnZXRcbiAgICAgICAgICAgICAgKGV4aXN0aW5nVGFzayBhcyBhbnkpLmFsbFJlbW92ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICB0YXJnZXRbc3ltYm9sRXZlbnROYW1lXSA9IG51bGw7XG4gICAgICAgICAgICAgIC8vIGluIHRoZSB0YXJnZXQsIHdlIGhhdmUgYW4gZXZlbnQgbGlzdGVuZXIgd2hpY2ggaXMgYWRkZWQgYnkgb25fcHJvcGVydHlcbiAgICAgICAgICAgICAgLy8gc3VjaCBhcyB0YXJnZXQub25jbGljayA9IGZ1bmN0aW9uKCkge30sIHNvIHdlIG5lZWQgdG8gY2xlYXIgdGhpcyBpbnRlcm5hbFxuICAgICAgICAgICAgICAvLyBwcm9wZXJ0eSB0b28gaWYgYWxsIGRlbGVnYXRlcyBhbGwgcmVtb3ZlZFxuICAgICAgICAgICAgICBpZiAodHlwZW9mIGV2ZW50TmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvblByb3BlcnR5U3ltYm9sID0gWk9ORV9TWU1CT0xfUFJFRklYICsgJ09OX1BST1BFUlRZJyArIGV2ZW50TmFtZTtcbiAgICAgICAgICAgICAgICB0YXJnZXRbb25Qcm9wZXJ0eVN5bWJvbF0gPSBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBleGlzdGluZ1Rhc2suem9uZS5jYW5jZWxUYXNrKGV4aXN0aW5nVGFzayk7XG4gICAgICAgICAgICBpZiAocmV0dXJuVGFyZ2V0KSB7XG4gICAgICAgICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBpc3N1ZSA5MzAsIGRpZG4ndCBmaW5kIHRoZSBldmVudCBuYW1lIG9yIGNhbGxiYWNrXG4gICAgICAvLyBmcm9tIHpvbmUga2VwdCBleGlzdGluZ1Rhc2tzLCB0aGUgY2FsbGJhY2sgbWF5YmVcbiAgICAgIC8vIGFkZGVkIG91dHNpZGUgb2Ygem9uZSwgd2UgbmVlZCB0byBjYWxsIG5hdGl2ZSByZW1vdmVFdmVudExpc3RlbmVyXG4gICAgICAvLyB0byB0cnkgdG8gcmVtb3ZlIGl0LlxuICAgICAgcmV0dXJuIG5hdGl2ZVJlbW92ZUV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgcHJvdG9bTElTVEVORVJTX0VWRU5UX0xJU1RFTkVSXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gdGhpcyB8fCBfZ2xvYmFsO1xuICAgICAgbGV0IGV2ZW50TmFtZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgIGlmIChwYXRjaE9wdGlvbnMgJiYgcGF0Y2hPcHRpb25zLnRyYW5zZmVyRXZlbnROYW1lKSB7XG4gICAgICAgIGV2ZW50TmFtZSA9IHBhdGNoT3B0aW9ucy50cmFuc2ZlckV2ZW50TmFtZShldmVudE5hbWUpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBsaXN0ZW5lcnM6IGFueVtdID0gW107XG4gICAgICBjb25zdCB0YXNrcyA9XG4gICAgICAgICAgZmluZEV2ZW50VGFza3ModGFyZ2V0LCBldmVudE5hbWVUb1N0cmluZyA/IGV2ZW50TmFtZVRvU3RyaW5nKGV2ZW50TmFtZSkgOiBldmVudE5hbWUpO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhc2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHRhc2s6IGFueSA9IHRhc2tzW2ldO1xuICAgICAgICBsZXQgZGVsZWdhdGUgPSB0YXNrLm9yaWdpbmFsRGVsZWdhdGUgPyB0YXNrLm9yaWdpbmFsRGVsZWdhdGUgOiB0YXNrLmNhbGxiYWNrO1xuICAgICAgICBsaXN0ZW5lcnMucHVzaChkZWxlZ2F0ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGlzdGVuZXJzO1xuICAgIH07XG5cbiAgICBwcm90b1tSRU1PVkVfQUxMX0xJU1RFTkVSU19FVkVOVF9MSVNURU5FUl0gPSBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMgfHwgX2dsb2JhbDtcblxuICAgICAgbGV0IGV2ZW50TmFtZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgIGlmICghZXZlbnROYW1lKSB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0YXJnZXQpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBwcm9wID0ga2V5c1tpXTtcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IEVWRU5UX05BTUVfU1lNQk9MX1JFR1guZXhlYyhwcm9wKTtcbiAgICAgICAgICBsZXQgZXZ0TmFtZSA9IG1hdGNoICYmIG1hdGNoWzFdO1xuICAgICAgICAgIC8vIGluIG5vZGVqcyBFdmVudEVtaXR0ZXIsIHJlbW92ZUxpc3RlbmVyIGV2ZW50IGlzXG4gICAgICAgICAgLy8gdXNlZCBmb3IgbW9uaXRvcmluZyB0aGUgcmVtb3ZlTGlzdGVuZXIgY2FsbCxcbiAgICAgICAgICAvLyBzbyBqdXN0IGtlZXAgcmVtb3ZlTGlzdGVuZXIgZXZlbnRMaXN0ZW5lciB1bnRpbFxuICAgICAgICAgIC8vIGFsbCBvdGhlciBldmVudExpc3RlbmVycyBhcmUgcmVtb3ZlZFxuICAgICAgICAgIGlmIChldnROYW1lICYmIGV2dE5hbWUgIT09ICdyZW1vdmVMaXN0ZW5lcicpIHtcbiAgICAgICAgICAgIHRoaXNbUkVNT1ZFX0FMTF9MSVNURU5FUlNfRVZFTlRfTElTVEVORVJdLmNhbGwodGhpcywgZXZ0TmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIHJlbW92ZSByZW1vdmVMaXN0ZW5lciBsaXN0ZW5lciBmaW5hbGx5XG4gICAgICAgIHRoaXNbUkVNT1ZFX0FMTF9MSVNURU5FUlNfRVZFTlRfTElTVEVORVJdLmNhbGwodGhpcywgJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocGF0Y2hPcHRpb25zICYmIHBhdGNoT3B0aW9ucy50cmFuc2ZlckV2ZW50TmFtZSkge1xuICAgICAgICAgIGV2ZW50TmFtZSA9IHBhdGNoT3B0aW9ucy50cmFuc2ZlckV2ZW50TmFtZShldmVudE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN5bWJvbEV2ZW50TmFtZXMgPSB6b25lU3ltYm9sRXZlbnROYW1lc1tldmVudE5hbWVdO1xuICAgICAgICBpZiAoc3ltYm9sRXZlbnROYW1lcykge1xuICAgICAgICAgIGNvbnN0IHN5bWJvbEV2ZW50TmFtZSA9IHN5bWJvbEV2ZW50TmFtZXNbRkFMU0VfU1RSXTtcbiAgICAgICAgICBjb25zdCBzeW1ib2xDYXB0dXJlRXZlbnROYW1lID0gc3ltYm9sRXZlbnROYW1lc1tUUlVFX1NUUl07XG5cbiAgICAgICAgICBjb25zdCB0YXNrcyA9IHRhcmdldFtzeW1ib2xFdmVudE5hbWVdO1xuICAgICAgICAgIGNvbnN0IGNhcHR1cmVUYXNrcyA9IHRhcmdldFtzeW1ib2xDYXB0dXJlRXZlbnROYW1lXTtcblxuICAgICAgICAgIGlmICh0YXNrcykge1xuICAgICAgICAgICAgY29uc3QgcmVtb3ZlVGFza3MgPSB0YXNrcy5zbGljZSgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZW1vdmVUYXNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICBjb25zdCB0YXNrID0gcmVtb3ZlVGFza3NbaV07XG4gICAgICAgICAgICAgIGxldCBkZWxlZ2F0ZSA9IHRhc2sub3JpZ2luYWxEZWxlZ2F0ZSA/IHRhc2sub3JpZ2luYWxEZWxlZ2F0ZSA6IHRhc2suY2FsbGJhY2s7XG4gICAgICAgICAgICAgIHRoaXNbUkVNT1ZFX0VWRU5UX0xJU1RFTkVSXS5jYWxsKHRoaXMsIGV2ZW50TmFtZSwgZGVsZWdhdGUsIHRhc2sub3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNhcHR1cmVUYXNrcykge1xuICAgICAgICAgICAgY29uc3QgcmVtb3ZlVGFza3MgPSBjYXB0dXJlVGFza3Muc2xpY2UoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVtb3ZlVGFza3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgY29uc3QgdGFzayA9IHJlbW92ZVRhc2tzW2ldO1xuICAgICAgICAgICAgICBsZXQgZGVsZWdhdGUgPSB0YXNrLm9yaWdpbmFsRGVsZWdhdGUgPyB0YXNrLm9yaWdpbmFsRGVsZWdhdGUgOiB0YXNrLmNhbGxiYWNrO1xuICAgICAgICAgICAgICB0aGlzW1JFTU9WRV9FVkVOVF9MSVNURU5FUl0uY2FsbCh0aGlzLCBldmVudE5hbWUsIGRlbGVnYXRlLCB0YXNrLm9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocmV0dXJuVGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBmb3IgbmF0aXZlIHRvU3RyaW5nIHBhdGNoXG4gICAgYXR0YWNoT3JpZ2luVG9QYXRjaGVkKHByb3RvW0FERF9FVkVOVF9MSVNURU5FUl0sIG5hdGl2ZUFkZEV2ZW50TGlzdGVuZXIpO1xuICAgIGF0dGFjaE9yaWdpblRvUGF0Y2hlZChwcm90b1tSRU1PVkVfRVZFTlRfTElTVEVORVJdLCBuYXRpdmVSZW1vdmVFdmVudExpc3RlbmVyKTtcbiAgICBpZiAobmF0aXZlUmVtb3ZlQWxsTGlzdGVuZXJzKSB7XG4gICAgICBhdHRhY2hPcmlnaW5Ub1BhdGNoZWQocHJvdG9bUkVNT1ZFX0FMTF9MSVNURU5FUlNfRVZFTlRfTElTVEVORVJdLCBuYXRpdmVSZW1vdmVBbGxMaXN0ZW5lcnMpO1xuICAgIH1cbiAgICBpZiAobmF0aXZlTGlzdGVuZXJzKSB7XG4gICAgICBhdHRhY2hPcmlnaW5Ub1BhdGNoZWQocHJvdG9bTElTVEVORVJTX0VWRU5UX0xJU1RFTkVSXSwgbmF0aXZlTGlzdGVuZXJzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBsZXQgcmVzdWx0czogYW55W10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgcmVzdWx0c1tpXSA9IHBhdGNoRXZlbnRUYXJnZXRNZXRob2RzKGFwaXNbaV0sIHBhdGNoT3B0aW9ucyk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRFdmVudFRhc2tzKHRhcmdldDogYW55LCBldmVudE5hbWU6IHN0cmluZyk6IFRhc2tbXSB7XG4gIGNvbnN0IGZvdW5kVGFza3M6IGFueVtdID0gW107XG4gIGZvciAobGV0IHByb3AgaW4gdGFyZ2V0KSB7XG4gICAgY29uc3QgbWF0Y2ggPSBFVkVOVF9OQU1FX1NZTUJPTF9SRUdYLmV4ZWMocHJvcCk7XG4gICAgbGV0IGV2dE5hbWUgPSBtYXRjaCAmJiBtYXRjaFsxXTtcbiAgICBpZiAoZXZ0TmFtZSAmJiAoIWV2ZW50TmFtZSB8fCBldnROYW1lID09PSBldmVudE5hbWUpKSB7XG4gICAgICBjb25zdCB0YXNrczogYW55ID0gdGFyZ2V0W3Byb3BdO1xuICAgICAgaWYgKHRhc2tzKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFza3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBmb3VuZFRhc2tzLnB1c2godGFza3NbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBmb3VuZFRhc2tzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGF0Y2hFdmVudFByb3RvdHlwZShnbG9iYWw6IGFueSwgYXBpOiBfWm9uZVByaXZhdGUpIHtcbiAgY29uc3QgRXZlbnQgPSBnbG9iYWxbJ0V2ZW50J107XG4gIGlmIChFdmVudCAmJiBFdmVudC5wcm90b3R5cGUpIHtcbiAgICBhcGkucGF0Y2hNZXRob2QoXG4gICAgICAgIEV2ZW50LnByb3RvdHlwZSwgJ3N0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbicsXG4gICAgICAgIChkZWxlZ2F0ZTogRnVuY3Rpb24pID0+IGZ1bmN0aW9uKHNlbGY6IGFueSwgYXJnczogYW55W10pIHtcbiAgICAgICAgICBzZWxmW0lNTUVESUFURV9QUk9QQUdBVElPTl9TWU1CT0xdID0gdHJ1ZTtcbiAgICAgICAgICAvLyB3ZSBuZWVkIHRvIGNhbGwgdGhlIG5hdGl2ZSBzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb25cbiAgICAgICAgICAvLyBpbiBjYXNlIGluIHNvbWUgaHlicmlkIGFwcGxpY2F0aW9uLCBzb21lIHBhcnQgb2ZcbiAgICAgICAgICAvLyBhcHBsaWNhdGlvbiB3aWxsIGJlIGNvbnRyb2xsZWQgYnkgem9uZSwgc29tZSBhcmUgbm90XG4gICAgICAgICAgZGVsZWdhdGUgJiYgZGVsZWdhdGUuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICAgIH0pO1xuICB9XG59XG4iXX0=