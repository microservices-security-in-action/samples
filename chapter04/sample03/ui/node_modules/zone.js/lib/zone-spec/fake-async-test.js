"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
(function (global) {
    var OriginalDate = global.Date;
    var FakeDate = /** @class */ (function () {
        function FakeDate() {
            if (arguments.length === 0) {
                var d = new OriginalDate();
                d.setTime(FakeDate.now());
                return d;
            }
            else {
                var args = Array.prototype.slice.call(arguments);
                return new (OriginalDate.bind.apply(OriginalDate, __spread([void 0], args)))();
            }
        }
        FakeDate.now = function () {
            var fakeAsyncTestZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
            if (fakeAsyncTestZoneSpec) {
                return fakeAsyncTestZoneSpec.getCurrentRealTime() + fakeAsyncTestZoneSpec.getCurrentTime();
            }
            return OriginalDate.now.apply(this, arguments);
        };
        return FakeDate;
    }());
    FakeDate.UTC = OriginalDate.UTC;
    FakeDate.parse = OriginalDate.parse;
    // keep a reference for zone patched timer function
    var timers = {
        setTimeout: global.setTimeout,
        setInterval: global.setInterval,
        clearTimeout: global.clearTimeout,
        clearInterval: global.clearInterval
    };
    var Scheduler = /** @class */ (function () {
        function Scheduler() {
            // Scheduler queue with the tuple of end time and callback function - sorted by end time.
            this._schedulerQueue = [];
            // Current simulated time in millis.
            this._currentTime = 0;
            // Current real time in millis.
            this._currentRealTime = OriginalDate.now();
        }
        Scheduler.prototype.getCurrentTime = function () { return this._currentTime; };
        Scheduler.prototype.getCurrentRealTime = function () { return this._currentRealTime; };
        Scheduler.prototype.setCurrentRealTime = function (realTime) { this._currentRealTime = realTime; };
        Scheduler.prototype.scheduleFunction = function (cb, delay, args, isPeriodic, isRequestAnimationFrame, id) {
            if (args === void 0) { args = []; }
            if (isPeriodic === void 0) { isPeriodic = false; }
            if (isRequestAnimationFrame === void 0) { isRequestAnimationFrame = false; }
            if (id === void 0) { id = -1; }
            var currentId = id < 0 ? Scheduler.nextId++ : id;
            var endTime = this._currentTime + delay;
            // Insert so that scheduler queue remains sorted by end time.
            var newEntry = {
                endTime: endTime,
                id: currentId,
                func: cb,
                args: args,
                delay: delay,
                isPeriodic: isPeriodic,
                isRequestAnimationFrame: isRequestAnimationFrame
            };
            var i = 0;
            for (; i < this._schedulerQueue.length; i++) {
                var currentEntry = this._schedulerQueue[i];
                if (newEntry.endTime < currentEntry.endTime) {
                    break;
                }
            }
            this._schedulerQueue.splice(i, 0, newEntry);
            return currentId;
        };
        Scheduler.prototype.removeScheduledFunctionWithId = function (id) {
            for (var i = 0; i < this._schedulerQueue.length; i++) {
                if (this._schedulerQueue[i].id == id) {
                    this._schedulerQueue.splice(i, 1);
                    break;
                }
            }
        };
        Scheduler.prototype.tick = function (millis, doTick) {
            if (millis === void 0) { millis = 0; }
            var finalTime = this._currentTime + millis;
            var lastCurrentTime = 0;
            if (this._schedulerQueue.length === 0 && doTick) {
                doTick(millis);
                return;
            }
            while (this._schedulerQueue.length > 0) {
                var current = this._schedulerQueue[0];
                if (finalTime < current.endTime) {
                    // Done processing the queue since it's sorted by endTime.
                    break;
                }
                else {
                    // Time to run scheduled function. Remove it from the head of queue.
                    var current_1 = this._schedulerQueue.shift();
                    lastCurrentTime = this._currentTime;
                    this._currentTime = current_1.endTime;
                    if (doTick) {
                        doTick(this._currentTime - lastCurrentTime);
                    }
                    var retval = current_1.func.apply(global, current_1.isRequestAnimationFrame ? [this._currentTime] : current_1.args);
                    if (!retval) {
                        // Uncaught exception in the current scheduled function. Stop processing the queue.
                        break;
                    }
                }
            }
            lastCurrentTime = this._currentTime;
            this._currentTime = finalTime;
            if (doTick) {
                doTick(this._currentTime - lastCurrentTime);
            }
        };
        Scheduler.prototype.flush = function (limit, flushPeriodic, doTick) {
            if (limit === void 0) { limit = 20; }
            if (flushPeriodic === void 0) { flushPeriodic = false; }
            if (flushPeriodic) {
                return this.flushPeriodic(doTick);
            }
            else {
                return this.flushNonPeriodic(limit, doTick);
            }
        };
        Scheduler.prototype.flushPeriodic = function (doTick) {
            if (this._schedulerQueue.length === 0) {
                return 0;
            }
            // Find the last task currently queued in the scheduler queue and tick
            // till that time.
            var startTime = this._currentTime;
            var lastTask = this._schedulerQueue[this._schedulerQueue.length - 1];
            this.tick(lastTask.endTime - startTime, doTick);
            return this._currentTime - startTime;
        };
        Scheduler.prototype.flushNonPeriodic = function (limit, doTick) {
            var startTime = this._currentTime;
            var lastCurrentTime = 0;
            var count = 0;
            while (this._schedulerQueue.length > 0) {
                count++;
                if (count > limit) {
                    throw new Error('flush failed after reaching the limit of ' + limit +
                        ' tasks. Does your code use a polling timeout?');
                }
                // flush only non-periodic timers.
                // If the only remaining tasks are periodic(or requestAnimationFrame), finish flushing.
                if (this._schedulerQueue.filter(function (task) { return !task.isPeriodic && !task.isRequestAnimationFrame; })
                    .length === 0) {
                    break;
                }
                var current = this._schedulerQueue.shift();
                lastCurrentTime = this._currentTime;
                this._currentTime = current.endTime;
                if (doTick) {
                    // Update any secondary schedulers like Jasmine mock Date.
                    doTick(this._currentTime - lastCurrentTime);
                }
                var retval = current.func.apply(global, current.args);
                if (!retval) {
                    // Uncaught exception in the current scheduled function. Stop processing the queue.
                    break;
                }
            }
            return this._currentTime - startTime;
        };
        // Next scheduler id.
        Scheduler.nextId = 1;
        return Scheduler;
    }());
    var FakeAsyncTestZoneSpec = /** @class */ (function () {
        function FakeAsyncTestZoneSpec(namePrefix, trackPendingRequestAnimationFrame, macroTaskOptions) {
            if (trackPendingRequestAnimationFrame === void 0) { trackPendingRequestAnimationFrame = false; }
            this.trackPendingRequestAnimationFrame = trackPendingRequestAnimationFrame;
            this.macroTaskOptions = macroTaskOptions;
            this._scheduler = new Scheduler();
            this._microtasks = [];
            this._lastError = null;
            this._uncaughtPromiseErrors = Promise[Zone.__symbol__('uncaughtPromiseErrors')];
            this.pendingPeriodicTimers = [];
            this.pendingTimers = [];
            this.patchDateLocked = false;
            this.properties = { 'FakeAsyncTestZoneSpec': this };
            this.name = 'fakeAsyncTestZone for ' + namePrefix;
            // in case user can't access the construction of FakeAsyncTestSpec
            // user can also define macroTaskOptions by define a global variable.
            if (!this.macroTaskOptions) {
                this.macroTaskOptions = global[Zone.__symbol__('FakeAsyncTestMacroTask')];
            }
        }
        FakeAsyncTestZoneSpec.assertInZone = function () {
            if (Zone.current.get('FakeAsyncTestZoneSpec') == null) {
                throw new Error('The code should be running in the fakeAsync zone to call this function');
            }
        };
        FakeAsyncTestZoneSpec.prototype._fnAndFlush = function (fn, completers) {
            var _this = this;
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                fn.apply(global, args);
                if (_this._lastError === null) { // Success
                    if (completers.onSuccess != null) {
                        completers.onSuccess.apply(global);
                    }
                    // Flush microtasks only on success.
                    _this.flushMicrotasks();
                }
                else { // Failure
                    if (completers.onError != null) {
                        completers.onError.apply(global);
                    }
                }
                // Return true if there were no errors, false otherwise.
                return _this._lastError === null;
            };
        };
        FakeAsyncTestZoneSpec._removeTimer = function (timers, id) {
            var index = timers.indexOf(id);
            if (index > -1) {
                timers.splice(index, 1);
            }
        };
        FakeAsyncTestZoneSpec.prototype._dequeueTimer = function (id) {
            var _this = this;
            return function () { FakeAsyncTestZoneSpec._removeTimer(_this.pendingTimers, id); };
        };
        FakeAsyncTestZoneSpec.prototype._requeuePeriodicTimer = function (fn, interval, args, id) {
            var _this = this;
            return function () {
                // Requeue the timer callback if it's not been canceled.
                if (_this.pendingPeriodicTimers.indexOf(id) !== -1) {
                    _this._scheduler.scheduleFunction(fn, interval, args, true, false, id);
                }
            };
        };
        FakeAsyncTestZoneSpec.prototype._dequeuePeriodicTimer = function (id) {
            var _this = this;
            return function () { FakeAsyncTestZoneSpec._removeTimer(_this.pendingPeriodicTimers, id); };
        };
        FakeAsyncTestZoneSpec.prototype._setTimeout = function (fn, delay, args, isTimer) {
            if (isTimer === void 0) { isTimer = true; }
            var removeTimerFn = this._dequeueTimer(Scheduler.nextId);
            // Queue the callback and dequeue the timer on success and error.
            var cb = this._fnAndFlush(fn, { onSuccess: removeTimerFn, onError: removeTimerFn });
            var id = this._scheduler.scheduleFunction(cb, delay, args, false, !isTimer);
            if (isTimer) {
                this.pendingTimers.push(id);
            }
            return id;
        };
        FakeAsyncTestZoneSpec.prototype._clearTimeout = function (id) {
            FakeAsyncTestZoneSpec._removeTimer(this.pendingTimers, id);
            this._scheduler.removeScheduledFunctionWithId(id);
        };
        FakeAsyncTestZoneSpec.prototype._setInterval = function (fn, interval, args) {
            var id = Scheduler.nextId;
            var completers = { onSuccess: null, onError: this._dequeuePeriodicTimer(id) };
            var cb = this._fnAndFlush(fn, completers);
            // Use the callback created above to requeue on success.
            completers.onSuccess = this._requeuePeriodicTimer(cb, interval, args, id);
            // Queue the callback and dequeue the periodic timer only on error.
            this._scheduler.scheduleFunction(cb, interval, args, true);
            this.pendingPeriodicTimers.push(id);
            return id;
        };
        FakeAsyncTestZoneSpec.prototype._clearInterval = function (id) {
            FakeAsyncTestZoneSpec._removeTimer(this.pendingPeriodicTimers, id);
            this._scheduler.removeScheduledFunctionWithId(id);
        };
        FakeAsyncTestZoneSpec.prototype._resetLastErrorAndThrow = function () {
            var error = this._lastError || this._uncaughtPromiseErrors[0];
            this._uncaughtPromiseErrors.length = 0;
            this._lastError = null;
            throw error;
        };
        FakeAsyncTestZoneSpec.prototype.getCurrentTime = function () { return this._scheduler.getCurrentTime(); };
        FakeAsyncTestZoneSpec.prototype.getCurrentRealTime = function () { return this._scheduler.getCurrentRealTime(); };
        FakeAsyncTestZoneSpec.prototype.setCurrentRealTime = function (realTime) { this._scheduler.setCurrentRealTime(realTime); };
        FakeAsyncTestZoneSpec.patchDate = function () {
            if (!!global[Zone.__symbol__('disableDatePatching')]) {
                // we don't want to patch global Date
                // because in some case, global Date
                // is already being patched, we need to provide
                // an option to let user still use their
                // own version of Date.
                return;
            }
            if (global['Date'] === FakeDate) {
                // already patched
                return;
            }
            global['Date'] = FakeDate;
            FakeDate.prototype = OriginalDate.prototype;
            // try check and reset timers
            // because jasmine.clock().install() may
            // have replaced the global timer
            FakeAsyncTestZoneSpec.checkTimerPatch();
        };
        FakeAsyncTestZoneSpec.resetDate = function () {
            if (global['Date'] === FakeDate) {
                global['Date'] = OriginalDate;
            }
        };
        FakeAsyncTestZoneSpec.checkTimerPatch = function () {
            if (global.setTimeout !== timers.setTimeout) {
                global.setTimeout = timers.setTimeout;
                global.clearTimeout = timers.clearTimeout;
            }
            if (global.setInterval !== timers.setInterval) {
                global.setInterval = timers.setInterval;
                global.clearInterval = timers.clearInterval;
            }
        };
        FakeAsyncTestZoneSpec.prototype.lockDatePatch = function () {
            this.patchDateLocked = true;
            FakeAsyncTestZoneSpec.patchDate();
        };
        FakeAsyncTestZoneSpec.prototype.unlockDatePatch = function () {
            this.patchDateLocked = false;
            FakeAsyncTestZoneSpec.resetDate();
        };
        FakeAsyncTestZoneSpec.prototype.tick = function (millis, doTick) {
            if (millis === void 0) { millis = 0; }
            FakeAsyncTestZoneSpec.assertInZone();
            this.flushMicrotasks();
            this._scheduler.tick(millis, doTick);
            if (this._lastError !== null) {
                this._resetLastErrorAndThrow();
            }
        };
        FakeAsyncTestZoneSpec.prototype.flushMicrotasks = function () {
            var _this = this;
            FakeAsyncTestZoneSpec.assertInZone();
            var flushErrors = function () {
                if (_this._lastError !== null || _this._uncaughtPromiseErrors.length) {
                    // If there is an error stop processing the microtask queue and rethrow the error.
                    _this._resetLastErrorAndThrow();
                }
            };
            while (this._microtasks.length > 0) {
                var microtask = this._microtasks.shift();
                microtask.func.apply(microtask.target, microtask.args);
            }
            flushErrors();
        };
        FakeAsyncTestZoneSpec.prototype.flush = function (limit, flushPeriodic, doTick) {
            FakeAsyncTestZoneSpec.assertInZone();
            this.flushMicrotasks();
            var elapsed = this._scheduler.flush(limit, flushPeriodic, doTick);
            if (this._lastError !== null) {
                this._resetLastErrorAndThrow();
            }
            return elapsed;
        };
        FakeAsyncTestZoneSpec.prototype.onScheduleTask = function (delegate, current, target, task) {
            switch (task.type) {
                case 'microTask':
                    var args = task.data && task.data.args;
                    // should pass additional arguments to callback if have any
                    // currently we know process.nextTick will have such additional
                    // arguments
                    var additionalArgs = void 0;
                    if (args) {
                        var callbackIndex = task.data.cbIdx;
                        if (typeof args.length === 'number' && args.length > callbackIndex + 1) {
                            additionalArgs = Array.prototype.slice.call(args, callbackIndex + 1);
                        }
                    }
                    this._microtasks.push({
                        func: task.invoke,
                        args: additionalArgs,
                        target: task.data && task.data.target
                    });
                    break;
                case 'macroTask':
                    switch (task.source) {
                        case 'setTimeout':
                            task.data['handleId'] = this._setTimeout(task.invoke, task.data['delay'], Array.prototype.slice.call(task.data['args'], 2));
                            break;
                        case 'setImmediate':
                            task.data['handleId'] = this._setTimeout(task.invoke, 0, Array.prototype.slice.call(task.data['args'], 1));
                            break;
                        case 'setInterval':
                            task.data['handleId'] = this._setInterval(task.invoke, task.data['delay'], Array.prototype.slice.call(task.data['args'], 2));
                            break;
                        case 'XMLHttpRequest.send':
                            throw new Error('Cannot make XHRs from within a fake async test. Request URL: ' +
                                task.data['url']);
                        case 'requestAnimationFrame':
                        case 'webkitRequestAnimationFrame':
                        case 'mozRequestAnimationFrame':
                            // Simulate a requestAnimationFrame by using a setTimeout with 16 ms.
                            // (60 frames per second)
                            task.data['handleId'] = this._setTimeout(task.invoke, 16, task.data['args'], this.trackPendingRequestAnimationFrame);
                            break;
                        default:
                            // user can define which macroTask they want to support by passing
                            // macroTaskOptions
                            var macroTaskOption = this.findMacroTaskOption(task);
                            if (macroTaskOption) {
                                var args_1 = task.data && task.data['args'];
                                var delay = args_1 && args_1.length > 1 ? args_1[1] : 0;
                                var callbackArgs = macroTaskOption.callbackArgs ? macroTaskOption.callbackArgs : args_1;
                                if (!!macroTaskOption.isPeriodic) {
                                    // periodic macroTask, use setInterval to simulate
                                    task.data['handleId'] = this._setInterval(task.invoke, delay, callbackArgs);
                                    task.data.isPeriodic = true;
                                }
                                else {
                                    // not periodic, use setTimeout to simulate
                                    task.data['handleId'] = this._setTimeout(task.invoke, delay, callbackArgs);
                                }
                                break;
                            }
                            throw new Error('Unknown macroTask scheduled in fake async test: ' + task.source);
                    }
                    break;
                case 'eventTask':
                    task = delegate.scheduleTask(target, task);
                    break;
            }
            return task;
        };
        FakeAsyncTestZoneSpec.prototype.onCancelTask = function (delegate, current, target, task) {
            switch (task.source) {
                case 'setTimeout':
                case 'requestAnimationFrame':
                case 'webkitRequestAnimationFrame':
                case 'mozRequestAnimationFrame':
                    return this._clearTimeout(task.data['handleId']);
                case 'setInterval':
                    return this._clearInterval(task.data['handleId']);
                default:
                    // user can define which macroTask they want to support by passing
                    // macroTaskOptions
                    var macroTaskOption = this.findMacroTaskOption(task);
                    if (macroTaskOption) {
                        var handleId = task.data['handleId'];
                        return macroTaskOption.isPeriodic ? this._clearInterval(handleId) :
                            this._clearTimeout(handleId);
                    }
                    return delegate.cancelTask(target, task);
            }
        };
        FakeAsyncTestZoneSpec.prototype.onInvoke = function (delegate, current, target, callback, applyThis, applyArgs, source) {
            try {
                FakeAsyncTestZoneSpec.patchDate();
                return delegate.invoke(target, callback, applyThis, applyArgs, source);
            }
            finally {
                if (!this.patchDateLocked) {
                    FakeAsyncTestZoneSpec.resetDate();
                }
            }
        };
        FakeAsyncTestZoneSpec.prototype.findMacroTaskOption = function (task) {
            if (!this.macroTaskOptions) {
                return null;
            }
            for (var i = 0; i < this.macroTaskOptions.length; i++) {
                var macroTaskOption = this.macroTaskOptions[i];
                if (macroTaskOption.source === task.source) {
                    return macroTaskOption;
                }
            }
            return null;
        };
        FakeAsyncTestZoneSpec.prototype.onHandleError = function (parentZoneDelegate, currentZone, targetZone, error) {
            this._lastError = error;
            return false; // Don't propagate error to parent zone.
        };
        return FakeAsyncTestZoneSpec;
    }());
    // Export the class so that new instances can be created with proper
    // constructor params.
    Zone['FakeAsyncTestZoneSpec'] = FakeAsyncTestZoneSpec;
})(typeof window === 'object' && window || typeof self === 'object' && self || global);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZS1hc3luYy10ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvem9uZS5qcy9saWIvem9uZS1zcGVjL2Zha2UtYXN5bmMtdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCxDQUFDLFVBQVMsTUFBVztJQXVCbkIsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNqQztRQUNFO1lBQ0UsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDMUIsSUFBTSxDQUFDLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDN0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDMUIsT0FBTyxDQUFDLENBQUM7YUFDVjtpQkFBTTtnQkFDTCxJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ25ELFlBQVcsWUFBWSxZQUFaLFlBQVkscUJBQUksSUFBSSxNQUFFO2FBQ2xDO1FBQ0gsQ0FBQztRQUVNLFlBQUcsR0FBVjtZQUNFLElBQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUN4RSxJQUFJLHFCQUFxQixFQUFFO2dCQUN6QixPQUFPLHFCQUFxQixDQUFDLGtCQUFrQixFQUFFLEdBQUcscUJBQXFCLENBQUMsY0FBYyxFQUFFLENBQUM7YUFDNUY7WUFDRCxPQUFPLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBQ0gsZUFBQztJQUFELENBQUMsQUFuQkQsSUFtQkM7SUFFQSxRQUFnQixDQUFDLEdBQUcsR0FBRyxZQUFZ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QUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3JELElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakQsSUFBSSxlQUFlLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQzFDLE9BQU8sZUFBZSxDQUFDO2lCQUN4QjthQUNGO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsNkNBQWEsR0FBYixVQUNJLGtCQUFnQyxFQUFFLFdBQWlCLEVBQUUsVUFBZ0IsRUFDckUsS0FBVTtZQUNaLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLE9BQU8sS0FBSyxDQUFDLENBQUUsd0NBQXdDO1FBQ3pELENBQUM7UUFDSCw0QkFBQztJQUFELENBQUMsQUF4VkQsSUF3VkM7SUFFRCxvRUFBb0U7SUFDcEUsc0JBQXNCO0lBQ3JCLElBQVksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLHFCQUFxQixDQUFDO0FBQ2pFLENBQUMsQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxNQUFNLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuKGZ1bmN0aW9uKGdsb2JhbDogYW55KSB7XG4gIGludGVyZmFjZSBTY2hlZHVsZWRGdW5jdGlvbiB7XG4gICAgZW5kVGltZTogbnVtYmVyO1xuICAgIGlkOiBudW1iZXI7XG4gICAgZnVuYzogRnVuY3Rpb247XG4gICAgYXJnczogYW55W107XG4gICAgZGVsYXk6IG51bWJlcjtcbiAgICBpc1BlcmlvZGljOiBib29sZWFuO1xuICAgIGlzUmVxdWVzdEFuaW1hdGlvbkZyYW1lOiBib29sZWFuO1xuICB9XG5cbiAgaW50ZXJmYWNlIE1pY3JvVGFza1NjaGVkdWxlZEZ1bmN0aW9uIHtcbiAgICBmdW5jOiBGdW5jdGlvbjtcbiAgICBhcmdzPzogYW55W107XG4gICAgdGFyZ2V0OiBhbnk7XG4gIH1cblxuICBpbnRlcmZhY2UgTWFjcm9UYXNrT3B0aW9ucyB7XG4gICAgc291cmNlOiBzdHJpbmc7XG4gICAgaXNQZXJpb2RpYz86IGJvb2xlYW47XG4gICAgY2FsbGJhY2tBcmdzPzogYW55O1xuICB9XG5cbiAgY29uc3QgT3JpZ2luYWxEYXRlID0gZ2xvYmFsLkRhdGU7XG4gIGNsYXNzIEZha2VEYXRlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnN0IGQgPSBuZXcgT3JpZ2luYWxEYXRlKCk7XG4gICAgICAgIGQuc2V0VGltZShGYWtlRGF0ZS5ub3coKSk7XG4gICAgICAgIHJldHVybiBkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBuZXcgT3JpZ2luYWxEYXRlKC4uLmFyZ3MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBub3coKSB7XG4gICAgICBjb25zdCBmYWtlQXN5bmNUZXN0Wm9uZVNwZWMgPSBab25lLmN1cnJlbnQuZ2V0KCdGYWtlQXN5bmNUZXN0Wm9uZVNwZWMnKTtcbiAgICAgIGlmIChmYWtlQXN5bmNUZXN0Wm9uZVNwZWMpIHtcbiAgICAgICAgcmV0dXJuIGZha2VBc3luY1Rlc3Rab25lU3BlYy5nZXRDdXJyZW50UmVhbFRpbWUoKSArIGZha2VBc3luY1Rlc3Rab25lU3BlYy5nZXRDdXJyZW50VGltZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIE9yaWdpbmFsRGF0ZS5ub3cuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICAoRmFrZURhdGUgYXMgYW55KS5VVEMgPSBPcmlnaW5hbERhdGUuVVRDO1xuICAoRmFrZURhdGUgYXMgYW55KS5wYXJzZSA9IE9yaWdpbmFsRGF0ZS5wYXJzZTtcblxuICAvLyBrZWVwIGEgcmVmZXJlbmNlIGZvciB6b25lIHBhdGNoZWQgdGltZXIgZnVuY3Rpb25cbiAgY29uc3QgdGltZXJzID0ge1xuICAgIHNldFRpbWVvdXQ6IGdsb2JhbC5zZXRUaW1lb3V0LFxuICAgIHNldEludGVydmFsOiBnbG9iYWwuc2V0SW50ZXJ2YWwsXG4gICAgY2xlYXJUaW1lb3V0OiBnbG9iYWwuY2xlYXJUaW1lb3V0LFxuICAgIGNsZWFySW50ZXJ2YWw6IGdsb2JhbC5jbGVhckludGVydmFsXG4gIH07XG5cbiAgY2xhc3MgU2NoZWR1bGVyIHtcbiAgICAvLyBOZXh0IHNjaGVkdWxlciBpZC5cbiAgICBwdWJsaWMgc3RhdGljIG5leHRJZDogbnVtYmVyID0gMTtcblxuICAgIC8vIFNjaGVkdWxlciBxdWV1ZSB3aXRoIHRoZSB0dXBsZSBvZiBlbmQgdGltZSBhbmQgY2FsbGJhY2sgZnVuY3Rpb24gLSBzb3J0ZWQgYnkgZW5kIHRpbWUuXG4gICAgcHJpdmF0ZSBfc2NoZWR1bGVyUXVldWU6IFNjaGVkdWxlZEZ1bmN0aW9uW10gPSBbXTtcbiAgICAvLyBDdXJyZW50IHNpbXVsYXRlZCB0aW1lIGluIG1pbGxpcy5cbiAgICBwcml2YXRlIF9jdXJyZW50VGltZTogbnVtYmVyID0gMDtcbiAgICAvLyBDdXJyZW50IHJlYWwgdGltZSBpbiBtaWxsaXMuXG4gICAgcHJpdmF0ZSBfY3VycmVudFJlYWxUaW1lOiBudW1iZXIgPSBPcmlnaW5hbERhdGUubm93KCk7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgICBnZXRDdXJyZW50VGltZSgpIHsgcmV0dXJuIHRoaXMuX2N1cnJlbnRUaW1lOyB9XG5cbiAgICBnZXRDdXJyZW50UmVhbFRpbWUoKSB7IHJldHVybiB0aGlzLl9jdXJyZW50UmVhbFRpbWU7IH1cblxuICAgIHNldEN1cnJlbnRSZWFsVGltZShyZWFsVGltZTogbnVtYmVyKSB7IHRoaXMuX2N1cnJlbnRSZWFsVGltZSA9IHJlYWxUaW1lOyB9XG5cbiAgICBzY2hlZHVsZUZ1bmN0aW9uKFxuICAgICAgICBjYjogRnVuY3Rpb24sIGRlbGF5OiBudW1iZXIsIGFyZ3M6IGFueVtdID0gW10sIGlzUGVyaW9kaWM6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICAgICAgaXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gPSBmYWxzZSwgaWQ6IG51bWJlciA9IC0xKTogbnVtYmVyIHtcbiAgICAgIGxldCBjdXJyZW50SWQ6IG51bWJlciA9IGlkIDwgMCA/IFNjaGVkdWxlci5uZXh0SWQrKyA6IGlkO1xuICAgICAgbGV0IGVuZFRpbWUgPSB0aGlzLl9jdXJyZW50VGltZSArIGRlbGF5O1xuXG4gICAgICAvLyBJbnNlcnQgc28gdGhhdCBzY2hlZHVsZXIgcXVldWUgcmVtYWlucyBzb3J0ZWQgYnkgZW5kIHRpbWUuXG4gICAgICBsZXQgbmV3RW50cnk6IFNjaGVkdWxlZEZ1bmN0aW9uID0ge1xuICAgICAgICBlbmRUaW1lOiBlbmRUaW1lLFxuICAgICAgICBpZDogY3VycmVudElkLFxuICAgICAgICBmdW5jOiBjYixcbiAgICAgICAgYXJnczogYXJncyxcbiAgICAgICAgZGVsYXk6IGRlbGF5LFxuICAgICAgICBpc1BlcmlvZGljOiBpc1BlcmlvZGljLFxuICAgICAgICBpc1JlcXVlc3RBbmltYXRpb25GcmFtZTogaXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgIH07XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICBmb3IgKDsgaSA8IHRoaXMuX3NjaGVkdWxlclF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBjdXJyZW50RW50cnkgPSB0aGlzLl9zY2hlZHVsZXJRdWV1ZVtpXTtcbiAgICAgICAgaWYgKG5ld0VudHJ5LmVuZFRpbWUgPCBjdXJyZW50RW50cnkuZW5kVGltZSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9zY2hlZHVsZXJRdWV1ZS5zcGxpY2UoaSwgMCwgbmV3RW50cnkpO1xuICAgICAgcmV0dXJuIGN1cnJlbnRJZDtcbiAgICB9XG5cbiAgICByZW1vdmVTY2hlZHVsZWRGdW5jdGlvbldpdGhJZChpZDogbnVtYmVyKTogdm9pZCB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3NjaGVkdWxlclF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLl9zY2hlZHVsZXJRdWV1ZVtpXS5pZCA9PSBpZCkge1xuICAgICAgICAgIHRoaXMuX3NjaGVkdWxlclF1ZXVlLnNwbGljZShpLCAxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRpY2sobWlsbGlzOiBudW1iZXIgPSAwLCBkb1RpY2s/OiAoZWxhcHNlZDogbnVtYmVyKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgICBsZXQgZmluYWxUaW1lID0gdGhpcy5fY3VycmVudFRpbWUgKyBtaWxsaXM7XG4gICAgICBsZXQgbGFzdEN1cnJlbnRUaW1lID0gMDtcbiAgICAgIGlmICh0aGlzLl9zY2hlZHVsZXJRdWV1ZS5sZW5ndGggPT09IDAgJiYgZG9UaWNrKSB7XG4gICAgICAgIGRvVGljayhtaWxsaXMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB3aGlsZSAodGhpcy5fc2NoZWR1bGVyUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgY3VycmVudCA9IHRoaXMuX3NjaGVkdWxlclF1ZXVlWzBdO1xuICAgICAgICBpZiAoZmluYWxUaW1lIDwgY3VycmVudC5lbmRUaW1lKSB7XG4gICAgICAgICAgLy8gRG9uZSBwcm9jZXNzaW5nIHRoZSBxdWV1ZSBzaW5jZSBpdCdzIHNvcnRlZCBieSBlbmRUaW1lLlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFRpbWUgdG8gcnVuIHNjaGVkdWxlZCBmdW5jdGlvbi4gUmVtb3ZlIGl0IGZyb20gdGhlIGhlYWQgb2YgcXVldWUuXG4gICAgICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLl9zY2hlZHVsZXJRdWV1ZS5zaGlmdCgpICE7XG4gICAgICAgICAgbGFzdEN1cnJlbnRUaW1lID0gdGhpcy5fY3VycmVudFRpbWU7XG4gICAgICAgICAgdGhpcy5fY3VycmVudFRpbWUgPSBjdXJyZW50LmVuZFRpbWU7XG4gICAgICAgICAgaWYgKGRvVGljaykge1xuICAgICAgICAgICAgZG9UaWNrKHRoaXMuX2N1cnJlbnRUaW1lIC0gbGFzdEN1cnJlbnRUaW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IHJldHZhbCA9IGN1cnJlbnQuZnVuYy5hcHBseShcbiAgICAgICAgICAgICAgZ2xvYmFsLCBjdXJyZW50LmlzUmVxdWVzdEFuaW1hdGlvbkZyYW1lID8gW3RoaXMuX2N1cnJlbnRUaW1lXSA6IGN1cnJlbnQuYXJncyk7XG4gICAgICAgICAgaWYgKCFyZXR2YWwpIHtcbiAgICAgICAgICAgIC8vIFVuY2F1Z2h0IGV4Y2VwdGlvbiBpbiB0aGUgY3VycmVudCBzY2hlZHVsZWQgZnVuY3Rpb24uIFN0b3AgcHJvY2Vzc2luZyB0aGUgcXVldWUuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxhc3RDdXJyZW50VGltZSA9IHRoaXMuX2N1cnJlbnRUaW1lO1xuICAgICAgdGhpcy5fY3VycmVudFRpbWUgPSBmaW5hbFRpbWU7XG4gICAgICBpZiAoZG9UaWNrKSB7XG4gICAgICAgIGRvVGljayh0aGlzLl9jdXJyZW50VGltZSAtIGxhc3RDdXJyZW50VGltZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZmx1c2gobGltaXQgPSAyMCwgZmx1c2hQZXJpb2RpYyA9IGZhbHNlLCBkb1RpY2s/OiAoZWxhcHNlZDogbnVtYmVyKSA9PiB2b2lkKTogbnVtYmVyIHtcbiAgICAgIGlmIChmbHVzaFBlcmlvZGljKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZsdXNoUGVyaW9kaWMoZG9UaWNrKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZsdXNoTm9uUGVyaW9kaWMobGltaXQsIGRvVGljayk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmbHVzaFBlcmlvZGljKGRvVGljaz86IChlbGFwc2VkOiBudW1iZXIpID0+IHZvaWQpOiBudW1iZXIge1xuICAgICAgaWYgKHRoaXMuX3NjaGVkdWxlclF1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICAgIC8vIEZpbmQgdGhlIGxhc3QgdGFzayBjdXJyZW50bHkgcXVldWVkIGluIHRoZSBzY2hlZHVsZXIgcXVldWUgYW5kIHRpY2tcbiAgICAgIC8vIHRpbGwgdGhhdCB0aW1lLlxuICAgICAgY29uc3Qgc3RhcnRUaW1lID0gdGhpcy5fY3VycmVudFRpbWU7XG4gICAgICBjb25zdCBsYXN0VGFzayA9IHRoaXMuX3NjaGVkdWxlclF1ZXVlW3RoaXMuX3NjaGVkdWxlclF1ZXVlLmxlbmd0aCAtIDFdO1xuICAgICAgdGhpcy50aWNrKGxhc3RUYXNrLmVuZFRpbWUgLSBzdGFydFRpbWUsIGRvVGljayk7XG4gICAgICByZXR1cm4gdGhpcy5fY3VycmVudFRpbWUgLSBzdGFydFRpbWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmbHVzaE5vblBlcmlvZGljKGxpbWl0OiBudW1iZXIsIGRvVGljaz86IChlbGFwc2VkOiBudW1iZXIpID0+IHZvaWQpOiBudW1iZXIge1xuICAgICAgY29uc3Qgc3RhcnRUaW1lID0gdGhpcy5fY3VycmVudFRpbWU7XG4gICAgICBsZXQgbGFzdEN1cnJlbnRUaW1lID0gMDtcbiAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICB3aGlsZSAodGhpcy5fc2NoZWR1bGVyUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb3VudCsrO1xuICAgICAgICBpZiAoY291bnQgPiBsaW1pdCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ2ZsdXNoIGZhaWxlZCBhZnRlciByZWFjaGluZyB0aGUgbGltaXQgb2YgJyArIGxpbWl0ICtcbiAgICAgICAgICAgICAgJyB0YXNrcy4gRG9lcyB5b3VyIGNvZGUgdXNlIGEgcG9sbGluZyB0aW1lb3V0PycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZmx1c2ggb25seSBub24tcGVyaW9kaWMgdGltZXJzLlxuICAgICAgICAvLyBJZiB0aGUgb25seSByZW1haW5pbmcgdGFza3MgYXJlIHBlcmlvZGljKG9yIHJlcXVlc3RBbmltYXRpb25GcmFtZSksIGZpbmlzaCBmbHVzaGluZy5cbiAgICAgICAgaWYgKHRoaXMuX3NjaGVkdWxlclF1ZXVlLmZpbHRlcih0YXNrID0+ICF0YXNrLmlzUGVyaW9kaWMgJiYgIXRhc2suaXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpXG4gICAgICAgICAgICAgICAgLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY3VycmVudCA9IHRoaXMuX3NjaGVkdWxlclF1ZXVlLnNoaWZ0KCkgITtcbiAgICAgICAgbGFzdEN1cnJlbnRUaW1lID0gdGhpcy5fY3VycmVudFRpbWU7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRUaW1lID0gY3VycmVudC5lbmRUaW1lO1xuICAgICAgICBpZiAoZG9UaWNrKSB7XG4gICAgICAgICAgLy8gVXBkYXRlIGFueSBzZWNvbmRhcnkgc2NoZWR1bGVycyBsaWtlIEphc21pbmUgbW9jayBEYXRlLlxuICAgICAgICAgIGRvVGljayh0aGlzLl9jdXJyZW50VGltZSAtIGxhc3RDdXJyZW50VGltZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmV0dmFsID0gY3VycmVudC5mdW5jLmFwcGx5KGdsb2JhbCwgY3VycmVudC5hcmdzKTtcbiAgICAgICAgaWYgKCFyZXR2YWwpIHtcbiAgICAgICAgICAvLyBVbmNhdWdodCBleGNlcHRpb24gaW4gdGhlIGN1cnJlbnQgc2NoZWR1bGVkIGZ1bmN0aW9uLiBTdG9wIHByb2Nlc3NpbmcgdGhlIHF1ZXVlLlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fY3VycmVudFRpbWUgLSBzdGFydFRpbWU7XG4gICAgfVxuICB9XG5cbiAgY2xhc3MgRmFrZUFzeW5jVGVzdFpvbmVTcGVjIGltcGxlbWVudHMgWm9uZVNwZWMge1xuICAgIHN0YXRpYyBhc3NlcnRJblpvbmUoKTogdm9pZCB7XG4gICAgICBpZiAoWm9uZS5jdXJyZW50LmdldCgnRmFrZUFzeW5jVGVzdFpvbmVTcGVjJykgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBjb2RlIHNob3VsZCBiZSBydW5uaW5nIGluIHRoZSBmYWtlQXN5bmMgem9uZSB0byBjYWxsIHRoaXMgZnVuY3Rpb24nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9zY2hlZHVsZXI6IFNjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXIoKTtcbiAgICBwcml2YXRlIF9taWNyb3Rhc2tzOiBNaWNyb1Rhc2tTY2hlZHVsZWRGdW5jdGlvbltdID0gW107XG4gICAgcHJpdmF0ZSBfbGFzdEVycm9yOiBFcnJvcnxudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIF91bmNhdWdodFByb21pc2VFcnJvcnM6IHtyZWplY3Rpb246IGFueX1bXSA9XG4gICAgICAgIChQcm9taXNlIGFzIGFueSlbKFpvbmUgYXMgYW55KS5fX3N5bWJvbF9fKCd1bmNhdWdodFByb21pc2VFcnJvcnMnKV07XG5cbiAgICBwZW5kaW5nUGVyaW9kaWNUaW1lcnM6IG51bWJlcltdID0gW107XG4gICAgcGVuZGluZ1RpbWVyczogbnVtYmVyW10gPSBbXTtcblxuICAgIHByaXZhdGUgcGF0Y2hEYXRlTG9ja2VkID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgbmFtZVByZWZpeDogc3RyaW5nLCBwcml2YXRlIHRyYWNrUGVuZGluZ1JlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZhbHNlLFxuICAgICAgICBwcml2YXRlIG1hY3JvVGFza09wdGlvbnM/OiBNYWNyb1Rhc2tPcHRpb25zW10pIHtcbiAgICAgIHRoaXMubmFtZSA9ICdmYWtlQXN5bmNUZXN0Wm9uZSBmb3IgJyArIG5hbWVQcmVmaXg7XG4gICAgICAvLyBpbiBjYXNlIHVzZXIgY2FuJ3QgYWNjZXNzIHRoZSBjb25zdHJ1Y3Rpb24gb2YgRmFrZUFzeW5jVGVzdFNwZWNcbiAgICAgIC8vIHVzZXIgY2FuIGFsc28gZGVmaW5lIG1hY3JvVGFza09wdGlvbnMgYnkgZGVmaW5lIGEgZ2xvYmFsIHZhcmlhYmxlLlxuICAgICAgaWYgKCF0aGlzLm1hY3JvVGFza09wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5tYWNyb1Rhc2tPcHRpb25zID0gZ2xvYmFsW1pvbmUuX19zeW1ib2xfXygnRmFrZUFzeW5jVGVzdE1hY3JvVGFzaycpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9mbkFuZEZsdXNoKGZuOiBGdW5jdGlvbiwgY29tcGxldGVyczoge29uU3VjY2Vzcz86IEZ1bmN0aW9uLCBvbkVycm9yPzogRnVuY3Rpb259KTpcbiAgICAgICAgRnVuY3Rpb24ge1xuICAgICAgcmV0dXJuICguLi5hcmdzOiBhbnlbXSk6IGJvb2xlYW4gPT4ge1xuICAgICAgICBmbi5hcHBseShnbG9iYWwsIGFyZ3MpO1xuXG4gICAgICAgIGlmICh0aGlzLl9sYXN0RXJyb3IgPT09IG51bGwpIHsgIC8vIFN1Y2Nlc3NcbiAgICAgICAgICBpZiAoY29tcGxldGVycy5vblN1Y2Nlc3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29tcGxldGVycy5vblN1Y2Nlc3MuYXBwbHkoZ2xvYmFsKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gRmx1c2ggbWljcm90YXNrcyBvbmx5IG9uIHN1Y2Nlc3MuXG4gICAgICAgICAgdGhpcy5mbHVzaE1pY3JvdGFza3MoKTtcbiAgICAgICAgfSBlbHNlIHsgIC8vIEZhaWx1cmVcbiAgICAgICAgICBpZiAoY29tcGxldGVycy5vbkVycm9yICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbXBsZXRlcnMub25FcnJvci5hcHBseShnbG9iYWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBSZXR1cm4gdHJ1ZSBpZiB0aGVyZSB3ZXJlIG5vIGVycm9ycywgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAgICByZXR1cm4gdGhpcy5fbGFzdEVycm9yID09PSBudWxsO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBfcmVtb3ZlVGltZXIodGltZXJzOiBudW1iZXJbXSwgaWQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgbGV0IGluZGV4ID0gdGltZXJzLmluZGV4T2YoaWQpO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgdGltZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZGVxdWV1ZVRpbWVyKGlkOiBudW1iZXIpOiBGdW5jdGlvbiB7XG4gICAgICByZXR1cm4gKCkgPT4geyBGYWtlQXN5bmNUZXN0Wm9uZVNwZWMuX3JlbW92ZVRpbWVyKHRoaXMucGVuZGluZ1RpbWVycywgaWQpOyB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgX3JlcXVldWVQZXJpb2RpY1RpbWVyKGZuOiBGdW5jdGlvbiwgaW50ZXJ2YWw6IG51bWJlciwgYXJnczogYW55W10sIGlkOiBudW1iZXIpOlxuICAgICAgICBGdW5jdGlvbiB7XG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAvLyBSZXF1ZXVlIHRoZSB0aW1lciBjYWxsYmFjayBpZiBpdCdzIG5vdCBiZWVuIGNhbmNlbGVkLlxuICAgICAgICBpZiAodGhpcy5wZW5kaW5nUGVyaW9kaWNUaW1lcnMuaW5kZXhPZihpZCkgIT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnNjaGVkdWxlRnVuY3Rpb24oZm4sIGludGVydmFsLCBhcmdzLCB0cnVlLCBmYWxzZSwgaWQpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgX2RlcXVldWVQZXJpb2RpY1RpbWVyKGlkOiBudW1iZXIpOiBGdW5jdGlvbiB7XG4gICAgICByZXR1cm4gKCkgPT4geyBGYWtlQXN5bmNUZXN0Wm9uZVNwZWMuX3JlbW92ZVRpbWVyKHRoaXMucGVuZGluZ1BlcmlvZGljVGltZXJzLCBpZCk7IH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2V0VGltZW91dChmbjogRnVuY3Rpb24sIGRlbGF5OiBudW1iZXIsIGFyZ3M6IGFueVtdLCBpc1RpbWVyID0gdHJ1ZSk6IG51bWJlciB7XG4gICAgICBsZXQgcmVtb3ZlVGltZXJGbiA9IHRoaXMuX2RlcXVldWVUaW1lcihTY2hlZHVsZXIubmV4dElkKTtcbiAgICAgIC8vIFF1ZXVlIHRoZSBjYWxsYmFjayBhbmQgZGVxdWV1ZSB0aGUgdGltZXIgb24gc3VjY2VzcyBhbmQgZXJyb3IuXG4gICAgICBsZXQgY2IgPSB0aGlzLl9mbkFuZEZsdXNoKGZuLCB7b25TdWNjZXNzOiByZW1vdmVUaW1lckZuLCBvbkVycm9yOiByZW1vdmVUaW1lckZufSk7XG4gICAgICBsZXQgaWQgPSB0aGlzLl9zY2hlZHVsZXIuc2NoZWR1bGVGdW5jdGlvbihjYiwgZGVsYXksIGFyZ3MsIGZhbHNlLCAhaXNUaW1lcik7XG4gICAgICBpZiAoaXNUaW1lcikge1xuICAgICAgICB0aGlzLnBlbmRpbmdUaW1lcnMucHVzaChpZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaWQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY2xlYXJUaW1lb3V0KGlkOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgIEZha2VBc3luY1Rlc3Rab25lU3BlYy5fcmVtb3ZlVGltZXIodGhpcy5wZW5kaW5nVGltZXJzLCBpZCk7XG4gICAgICB0aGlzLl9zY2hlZHVsZXIucmVtb3ZlU2NoZWR1bGVkRnVuY3Rpb25XaXRoSWQoaWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NldEludGVydmFsKGZuOiBGdW5jdGlvbiwgaW50ZXJ2YWw6IG51bWJlciwgYXJnczogYW55W10pOiBudW1iZXIge1xuICAgICAgbGV0IGlkID0gU2NoZWR1bGVyLm5leHRJZDtcbiAgICAgIGxldCBjb21wbGV0ZXJzID0ge29uU3VjY2VzczogbnVsbCBhcyBhbnksIG9uRXJyb3I6IHRoaXMuX2RlcXVldWVQZXJpb2RpY1RpbWVyKGlkKX07XG4gICAgICBsZXQgY2IgPSB0aGlzLl9mbkFuZEZsdXNoKGZuLCBjb21wbGV0ZXJzKTtcblxuICAgICAgLy8gVXNlIHRoZSBjYWxsYmFjayBjcmVhdGVkIGFib3ZlIHRvIHJlcXVldWUgb24gc3VjY2Vzcy5cbiAgICAgIGNvbXBsZXRlcnMub25TdWNjZXNzID0gdGhpcy5fcmVxdWV1ZVBlcmlvZGljVGltZXIoY2IsIGludGVydmFsLCBhcmdzLCBpZCk7XG5cbiAgICAgIC8vIFF1ZXVlIHRoZSBjYWxsYmFjayBhbmQgZGVxdWV1ZSB0aGUgcGVyaW9kaWMgdGltZXIgb25seSBvbiBlcnJvci5cbiAgICAgIHRoaXMuX3NjaGVkdWxlci5zY2hlZHVsZUZ1bmN0aW9uKGNiLCBpbnRlcnZhbCwgYXJncywgdHJ1ZSk7XG4gICAgICB0aGlzLnBlbmRpbmdQZXJpb2RpY1RpbWVycy5wdXNoKGlkKTtcbiAgICAgIHJldHVybiBpZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9jbGVhckludGVydmFsKGlkOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgIEZha2VBc3luY1Rlc3Rab25lU3BlYy5fcmVtb3ZlVGltZXIodGhpcy5wZW5kaW5nUGVyaW9kaWNUaW1lcnMsIGlkKTtcbiAgICAgIHRoaXMuX3NjaGVkdWxlci5yZW1vdmVTY2hlZHVsZWRGdW5jdGlvbldpdGhJZChpZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcmVzZXRMYXN0RXJyb3JBbmRUaHJvdygpOiB2b2lkIHtcbiAgICAgIGxldCBlcnJvciA9IHRoaXMuX2xhc3RFcnJvciB8fCB0aGlzLl91bmNhdWdodFByb21pc2VFcnJvcnNbMF07XG4gICAgICB0aGlzLl91bmNhdWdodFByb21pc2VFcnJvcnMubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMuX2xhc3RFcnJvciA9IG51bGw7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG5cbiAgICBnZXRDdXJyZW50VGltZSgpIHsgcmV0dXJuIHRoaXMuX3NjaGVkdWxlci5nZXRDdXJyZW50VGltZSgpOyB9XG5cbiAgICBnZXRDdXJyZW50UmVhbFRpbWUoKSB7IHJldHVybiB0aGlzLl9zY2hlZHVsZXIuZ2V0Q3VycmVudFJlYWxUaW1lKCk7IH1cblxuICAgIHNldEN1cnJlbnRSZWFsVGltZShyZWFsVGltZTogbnVtYmVyKSB7IHRoaXMuX3NjaGVkdWxlci5zZXRDdXJyZW50UmVhbFRpbWUocmVhbFRpbWUpOyB9XG5cbiAgICBzdGF0aWMgcGF0Y2hEYXRlKCkge1xuICAgICAgaWYgKCEhZ2xvYmFsW1pvbmUuX19zeW1ib2xfXygnZGlzYWJsZURhdGVQYXRjaGluZycpXSkge1xuICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIHBhdGNoIGdsb2JhbCBEYXRlXG4gICAgICAgIC8vIGJlY2F1c2UgaW4gc29tZSBjYXNlLCBnbG9iYWwgRGF0ZVxuICAgICAgICAvLyBpcyBhbHJlYWR5IGJlaW5nIHBhdGNoZWQsIHdlIG5lZWQgdG8gcHJvdmlkZVxuICAgICAgICAvLyBhbiBvcHRpb24gdG8gbGV0IHVzZXIgc3RpbGwgdXNlIHRoZWlyXG4gICAgICAgIC8vIG93biB2ZXJzaW9uIG9mIERhdGUuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGdsb2JhbFsnRGF0ZSddID09PSBGYWtlRGF0ZSkge1xuICAgICAgICAvLyBhbHJlYWR5IHBhdGNoZWRcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZ2xvYmFsWydEYXRlJ10gPSBGYWtlRGF0ZTtcbiAgICAgIEZha2VEYXRlLnByb3RvdHlwZSA9IE9yaWdpbmFsRGF0ZS5wcm90b3R5cGU7XG5cbiAgICAgIC8vIHRyeSBjaGVjayBhbmQgcmVzZXQgdGltZXJzXG4gICAgICAvLyBiZWNhdXNlIGphc21pbmUuY2xvY2soKS5pbnN0YWxsKCkgbWF5XG4gICAgICAvLyBoYXZlIHJlcGxhY2VkIHRoZSBnbG9iYWwgdGltZXJcbiAgICAgIEZha2VBc3luY1Rlc3Rab25lU3BlYy5jaGVja1RpbWVyUGF0Y2goKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcmVzZXREYXRlKCkge1xuICAgICAgaWYgKGdsb2JhbFsnRGF0ZSddID09PSBGYWtlRGF0ZSkge1xuICAgICAgICBnbG9iYWxbJ0RhdGUnXSA9IE9yaWdpbmFsRGF0ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgY2hlY2tUaW1lclBhdGNoKCkge1xuICAgICAgaWYgKGdsb2JhbC5zZXRUaW1lb3V0ICE9PSB0aW1lcnMuc2V0VGltZW91dCkge1xuICAgICAgICBnbG9iYWwuc2V0VGltZW91dCA9IHRpbWVycy5zZXRUaW1lb3V0O1xuICAgICAgICBnbG9iYWwuY2xlYXJUaW1lb3V0ID0gdGltZXJzLmNsZWFyVGltZW91dDtcbiAgICAgIH1cbiAgICAgIGlmIChnbG9iYWwuc2V0SW50ZXJ2YWwgIT09IHRpbWVycy5zZXRJbnRlcnZhbCkge1xuICAgICAgICBnbG9iYWwuc2V0SW50ZXJ2YWwgPSB0aW1lcnMuc2V0SW50ZXJ2YWw7XG4gICAgICAgIGdsb2JhbC5jbGVhckludGVydmFsID0gdGltZXJzLmNsZWFySW50ZXJ2YWw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbG9ja0RhdGVQYXRjaCgpIHtcbiAgICAgIHRoaXMucGF0Y2hEYXRlTG9ja2VkID0gdHJ1ZTtcbiAgICAgIEZha2VBc3luY1Rlc3Rab25lU3BlYy5wYXRjaERhdGUoKTtcbiAgICB9XG4gICAgdW5sb2NrRGF0ZVBhdGNoKCkge1xuICAgICAgdGhpcy5wYXRjaERhdGVMb2NrZWQgPSBmYWxzZTtcbiAgICAgIEZha2VBc3luY1Rlc3Rab25lU3BlYy5yZXNldERhdGUoKTtcbiAgICB9XG5cbiAgICB0aWNrKG1pbGxpczogbnVtYmVyID0gMCwgZG9UaWNrPzogKGVsYXBzZWQ6IG51bWJlcikgPT4gdm9pZCk6IHZvaWQge1xuICAgICAgRmFrZUFzeW5jVGVzdFpvbmVTcGVjLmFzc2VydEluWm9uZSgpO1xuICAgICAgdGhpcy5mbHVzaE1pY3JvdGFza3MoKTtcbiAgICAgIHRoaXMuX3NjaGVkdWxlci50aWNrKG1pbGxpcywgZG9UaWNrKTtcbiAgICAgIGlmICh0aGlzLl9sYXN0RXJyb3IgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fcmVzZXRMYXN0RXJyb3JBbmRUaHJvdygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZsdXNoTWljcm90YXNrcygpOiB2b2lkIHtcbiAgICAgIEZha2VBc3luY1Rlc3Rab25lU3BlYy5hc3NlcnRJblpvbmUoKTtcbiAgICAgIGNvbnN0IGZsdXNoRXJyb3JzID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fbGFzdEVycm9yICE9PSBudWxsIHx8IHRoaXMuX3VuY2F1Z2h0UHJvbWlzZUVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBhbiBlcnJvciBzdG9wIHByb2Nlc3NpbmcgdGhlIG1pY3JvdGFzayBxdWV1ZSBhbmQgcmV0aHJvdyB0aGUgZXJyb3IuXG4gICAgICAgICAgdGhpcy5fcmVzZXRMYXN0RXJyb3JBbmRUaHJvdygpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgd2hpbGUgKHRoaXMuX21pY3JvdGFza3MubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgbWljcm90YXNrID0gdGhpcy5fbWljcm90YXNrcy5zaGlmdCgpICE7XG4gICAgICAgIG1pY3JvdGFzay5mdW5jLmFwcGx5KG1pY3JvdGFzay50YXJnZXQsIG1pY3JvdGFzay5hcmdzKTtcbiAgICAgIH1cbiAgICAgIGZsdXNoRXJyb3JzKCk7XG4gICAgfVxuXG4gICAgZmx1c2gobGltaXQ/OiBudW1iZXIsIGZsdXNoUGVyaW9kaWM/OiBib29sZWFuLCBkb1RpY2s/OiAoZWxhcHNlZDogbnVtYmVyKSA9PiB2b2lkKTogbnVtYmVyIHtcbiAgICAgIEZha2VBc3luY1Rlc3Rab25lU3BlYy5hc3NlcnRJblpvbmUoKTtcbiAgICAgIHRoaXMuZmx1c2hNaWNyb3Rhc2tzKCk7XG4gICAgICBjb25zdCBlbGFwc2VkID0gdGhpcy5fc2NoZWR1bGVyLmZsdXNoKGxpbWl0LCBmbHVzaFBlcmlvZGljLCBkb1RpY2spO1xuICAgICAgaWYgKHRoaXMuX2xhc3RFcnJvciAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9yZXNldExhc3RFcnJvckFuZFRocm93KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZWxhcHNlZDtcbiAgICB9XG5cbiAgICAvLyBab25lU3BlYyBpbXBsZW1lbnRhdGlvbiBiZWxvdy5cblxuICAgIG5hbWU6IHN0cmluZztcblxuICAgIHByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0geydGYWtlQXN5bmNUZXN0Wm9uZVNwZWMnOiB0aGlzfTtcblxuICAgIG9uU2NoZWR1bGVUYXNrKGRlbGVnYXRlOiBab25lRGVsZWdhdGUsIGN1cnJlbnQ6IFpvbmUsIHRhcmdldDogWm9uZSwgdGFzazogVGFzayk6IFRhc2sge1xuICAgICAgc3dpdGNoICh0YXNrLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbWljcm9UYXNrJzpcbiAgICAgICAgICBsZXQgYXJncyA9IHRhc2suZGF0YSAmJiAodGFzay5kYXRhIGFzIGFueSkuYXJncztcbiAgICAgICAgICAvLyBzaG91bGQgcGFzcyBhZGRpdGlvbmFsIGFyZ3VtZW50cyB0byBjYWxsYmFjayBpZiBoYXZlIGFueVxuICAgICAgICAgIC8vIGN1cnJlbnRseSB3ZSBrbm93IHByb2Nlc3MubmV4dFRpY2sgd2lsbCBoYXZlIHN1Y2ggYWRkaXRpb25hbFxuICAgICAgICAgIC8vIGFyZ3VtZW50c1xuICAgICAgICAgIGxldCBhZGRpdGlvbmFsQXJnczogYW55W118dW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICBsZXQgY2FsbGJhY2tJbmRleCA9ICh0YXNrLmRhdGEgYXMgYW55KS5jYklkeDtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXJncy5sZW5ndGggPT09ICdudW1iZXInICYmIGFyZ3MubGVuZ3RoID4gY2FsbGJhY2tJbmRleCArIDEpIHtcbiAgICAgICAgICAgICAgYWRkaXRpb25hbEFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzLCBjYWxsYmFja0luZGV4ICsgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX21pY3JvdGFza3MucHVzaCh7XG4gICAgICAgICAgICBmdW5jOiB0YXNrLmludm9rZSxcbiAgICAgICAgICAgIGFyZ3M6IGFkZGl0aW9uYWxBcmdzLFxuICAgICAgICAgICAgdGFyZ2V0OiB0YXNrLmRhdGEgJiYgKHRhc2suZGF0YSBhcyBhbnkpLnRhcmdldFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtYWNyb1Rhc2snOlxuICAgICAgICAgIHN3aXRjaCAodGFzay5zb3VyY2UpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NldFRpbWVvdXQnOlxuICAgICAgICAgICAgICB0YXNrLmRhdGEgIVsnaGFuZGxlSWQnXSA9IHRoaXMuX3NldFRpbWVvdXQoXG4gICAgICAgICAgICAgICAgICB0YXNrLmludm9rZSwgdGFzay5kYXRhICFbJ2RlbGF5J10gISxcbiAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCh0YXNrLmRhdGEgYXMgYW55KVsnYXJncyddLCAyKSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc2V0SW1tZWRpYXRlJzpcbiAgICAgICAgICAgICAgdGFzay5kYXRhICFbJ2hhbmRsZUlkJ10gPSB0aGlzLl9zZXRUaW1lb3V0KFxuICAgICAgICAgICAgICAgICAgdGFzay5pbnZva2UsIDAsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCh0YXNrLmRhdGEgYXMgYW55KVsnYXJncyddLCAxKSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc2V0SW50ZXJ2YWwnOlxuICAgICAgICAgICAgICB0YXNrLmRhdGEgIVsnaGFuZGxlSWQnXSA9IHRoaXMuX3NldEludGVydmFsKFxuICAgICAgICAgICAgICAgICAgdGFzay5pbnZva2UsIHRhc2suZGF0YSAhWydkZWxheSddICEsXG4gICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCgodGFzay5kYXRhIGFzIGFueSlbJ2FyZ3MnXSwgMikpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1hNTEh0dHBSZXF1ZXN0LnNlbmQnOlxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAnQ2Fubm90IG1ha2UgWEhScyBmcm9tIHdpdGhpbiBhIGZha2UgYXN5bmMgdGVzdC4gUmVxdWVzdCBVUkw6ICcgK1xuICAgICAgICAgICAgICAgICAgKHRhc2suZGF0YSBhcyBhbnkpWyd1cmwnXSk7XG4gICAgICAgICAgICBjYXNlICdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUnOlxuICAgICAgICAgICAgY2FzZSAnd2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lJzpcbiAgICAgICAgICAgIGNhc2UgJ21velJlcXVlc3RBbmltYXRpb25GcmFtZSc6XG4gICAgICAgICAgICAgIC8vIFNpbXVsYXRlIGEgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGJ5IHVzaW5nIGEgc2V0VGltZW91dCB3aXRoIDE2IG1zLlxuICAgICAgICAgICAgICAvLyAoNjAgZnJhbWVzIHBlciBzZWNvbmQpXG4gICAgICAgICAgICAgIHRhc2suZGF0YSAhWydoYW5kbGVJZCddID0gdGhpcy5fc2V0VGltZW91dChcbiAgICAgICAgICAgICAgICAgIHRhc2suaW52b2tlLCAxNiwgKHRhc2suZGF0YSBhcyBhbnkpWydhcmdzJ10sXG4gICAgICAgICAgICAgICAgICB0aGlzLnRyYWNrUGVuZGluZ1JlcXVlc3RBbmltYXRpb25GcmFtZSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgLy8gdXNlciBjYW4gZGVmaW5lIHdoaWNoIG1hY3JvVGFzayB0aGV5IHdhbnQgdG8gc3VwcG9ydCBieSBwYXNzaW5nXG4gICAgICAgICAgICAgIC8vIG1hY3JvVGFza09wdGlvbnNcbiAgICAgICAgICAgICAgY29uc3QgbWFjcm9UYXNrT3B0aW9uID0gdGhpcy5maW5kTWFjcm9UYXNrT3B0aW9uKHRhc2spO1xuICAgICAgICAgICAgICBpZiAobWFjcm9UYXNrT3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXJncyA9IHRhc2suZGF0YSAmJiAodGFzay5kYXRhIGFzIGFueSlbJ2FyZ3MnXTtcbiAgICAgICAgICAgICAgICBjb25zdCBkZWxheSA9IGFyZ3MgJiYgYXJncy5sZW5ndGggPiAxID8gYXJnc1sxXSA6IDA7XG4gICAgICAgICAgICAgICAgbGV0IGNhbGxiYWNrQXJncyA9XG4gICAgICAgICAgICAgICAgICAgIG1hY3JvVGFza09wdGlvbi5jYWxsYmFja0FyZ3MgPyBtYWNyb1Rhc2tPcHRpb24uY2FsbGJhY2tBcmdzIDogYXJncztcbiAgICAgICAgICAgICAgICBpZiAoISFtYWNyb1Rhc2tPcHRpb24uaXNQZXJpb2RpYykge1xuICAgICAgICAgICAgICAgICAgLy8gcGVyaW9kaWMgbWFjcm9UYXNrLCB1c2Ugc2V0SW50ZXJ2YWwgdG8gc2ltdWxhdGVcbiAgICAgICAgICAgICAgICAgIHRhc2suZGF0YSAhWydoYW5kbGVJZCddID0gdGhpcy5fc2V0SW50ZXJ2YWwodGFzay5pbnZva2UsIGRlbGF5LCBjYWxsYmFja0FyZ3MpO1xuICAgICAgICAgICAgICAgICAgdGFzay5kYXRhICEuaXNQZXJpb2RpYyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIC8vIG5vdCBwZXJpb2RpYywgdXNlIHNldFRpbWVvdXQgdG8gc2ltdWxhdGVcbiAgICAgICAgICAgICAgICAgIHRhc2suZGF0YSAhWydoYW5kbGVJZCddID0gdGhpcy5fc2V0VGltZW91dCh0YXNrLmludm9rZSwgZGVsYXksIGNhbGxiYWNrQXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBtYWNyb1Rhc2sgc2NoZWR1bGVkIGluIGZha2UgYXN5bmMgdGVzdDogJyArIHRhc2suc291cmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2V2ZW50VGFzayc6XG4gICAgICAgICAgdGFzayA9IGRlbGVnYXRlLnNjaGVkdWxlVGFzayh0YXJnZXQsIHRhc2spO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRhc2s7XG4gICAgfVxuXG4gICAgb25DYW5jZWxUYXNrKGRlbGVnYXRlOiBab25lRGVsZWdhdGUsIGN1cnJlbnQ6IFpvbmUsIHRhcmdldDogWm9uZSwgdGFzazogVGFzayk6IGFueSB7XG4gICAgICBzd2l0Y2ggKHRhc2suc291cmNlKSB7XG4gICAgICAgIGNhc2UgJ3NldFRpbWVvdXQnOlxuICAgICAgICBjYXNlICdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUnOlxuICAgICAgICBjYXNlICd3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnOlxuICAgICAgICBjYXNlICdtb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnOlxuICAgICAgICAgIHJldHVybiB0aGlzLl9jbGVhclRpbWVvdXQoPG51bWJlcj50YXNrLmRhdGEgIVsnaGFuZGxlSWQnXSk7XG4gICAgICAgIGNhc2UgJ3NldEludGVydmFsJzpcbiAgICAgICAgICByZXR1cm4gdGhpcy5fY2xlYXJJbnRlcnZhbCg8bnVtYmVyPnRhc2suZGF0YSAhWydoYW5kbGVJZCddKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvLyB1c2VyIGNhbiBkZWZpbmUgd2hpY2ggbWFjcm9UYXNrIHRoZXkgd2FudCB0byBzdXBwb3J0IGJ5IHBhc3NpbmdcbiAgICAgICAgICAvLyBtYWNyb1Rhc2tPcHRpb25zXG4gICAgICAgICAgY29uc3QgbWFjcm9UYXNrT3B0aW9uID0gdGhpcy5maW5kTWFjcm9UYXNrT3B0aW9uKHRhc2spO1xuICAgICAgICAgIGlmIChtYWNyb1Rhc2tPcHRpb24pIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZUlkOiBudW1iZXIgPSA8bnVtYmVyPnRhc2suZGF0YSAhWydoYW5kbGVJZCddO1xuICAgICAgICAgICAgcmV0dXJuIG1hY3JvVGFza09wdGlvbi5pc1BlcmlvZGljID8gdGhpcy5fY2xlYXJJbnRlcnZhbChoYW5kbGVJZCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2xlYXJUaW1lb3V0KGhhbmRsZUlkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlbGVnYXRlLmNhbmNlbFRhc2sodGFyZ2V0LCB0YXNrKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvbkludm9rZShcbiAgICAgICAgZGVsZWdhdGU6IFpvbmVEZWxlZ2F0ZSwgY3VycmVudDogWm9uZSwgdGFyZ2V0OiBab25lLCBjYWxsYmFjazogRnVuY3Rpb24sIGFwcGx5VGhpczogYW55LFxuICAgICAgICBhcHBseUFyZ3M/OiBhbnlbXSwgc291cmNlPzogc3RyaW5nKTogYW55IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIEZha2VBc3luY1Rlc3Rab25lU3BlYy5wYXRjaERhdGUoKTtcbiAgICAgICAgcmV0dXJuIGRlbGVnYXRlLmludm9rZSh0YXJnZXQsIGNhbGxiYWNrLCBhcHBseVRoaXMsIGFwcGx5QXJncywgc291cmNlKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmICghdGhpcy5wYXRjaERhdGVMb2NrZWQpIHtcbiAgICAgICAgICBGYWtlQXN5bmNUZXN0Wm9uZVNwZWMucmVzZXREYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmaW5kTWFjcm9UYXNrT3B0aW9uKHRhc2s6IFRhc2spIHtcbiAgICAgIGlmICghdGhpcy5tYWNyb1Rhc2tPcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm1hY3JvVGFza09wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbWFjcm9UYXNrT3B0aW9uID0gdGhpcy5tYWNyb1Rhc2tPcHRpb25zW2ldO1xuICAgICAgICBpZiAobWFjcm9UYXNrT3B0aW9uLnNvdXJjZSA9PT0gdGFzay5zb3VyY2UpIHtcbiAgICAgICAgICByZXR1cm4gbWFjcm9UYXNrT3B0aW9uO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBvbkhhbmRsZUVycm9yKFxuICAgICAgICBwYXJlbnRab25lRGVsZWdhdGU6IFpvbmVEZWxlZ2F0ZSwgY3VycmVudFpvbmU6IFpvbmUsIHRhcmdldFpvbmU6IFpvbmUsXG4gICAgICAgIGVycm9yOiBhbnkpOiBib29sZWFuIHtcbiAgICAgIHRoaXMuX2xhc3RFcnJvciA9IGVycm9yO1xuICAgICAgcmV0dXJuIGZhbHNlOyAgLy8gRG9uJ3QgcHJvcGFnYXRlIGVycm9yIHRvIHBhcmVudCB6b25lLlxuICAgIH1cbiAgfVxuXG4gIC8vIEV4cG9ydCB0aGUgY2xhc3Mgc28gdGhhdCBuZXcgaW5zdGFuY2VzIGNhbiBiZSBjcmVhdGVkIHdpdGggcHJvcGVyXG4gIC8vIGNvbnN0cnVjdG9yIHBhcmFtcy5cbiAgKFpvbmUgYXMgYW55KVsnRmFrZUFzeW5jVGVzdFpvbmVTcGVjJ10gPSBGYWtlQXN5bmNUZXN0Wm9uZVNwZWM7XG59KSh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cgfHwgdHlwZW9mIHNlbGYgPT09ICdvYmplY3QnICYmIHNlbGYgfHwgZ2xvYmFsKTtcbiJdfQ==