"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch('ZoneAwarePromise', function (global, Zone, api) {
    var ObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var ObjectDefineProperty = Object.defineProperty;
    function readableObjectToString(obj) {
        if (obj && obj.toString === Object.prototype.toString) {
            var className = obj.constructor && obj.constructor.name;
            return (className ? className : '') + ': ' + JSON.stringify(obj);
        }
        return obj ? obj.toString() : Object.prototype.toString.call(obj);
    }
    var __symbol__ = api.symbol;
    var _uncaughtPromiseErrors = [];
    var symbolPromise = __symbol__('Promise');
    var symbolThen = __symbol__('then');
    var creationTrace = '__creationTrace__';
    api.onUnhandledError = function (e) {
        if (api.showUncaughtError()) {
            var rejection = e && e.rejection;
            if (rejection) {
                console.error('Unhandled Promise rejection:', rejection instanceof Error ? rejection.message : rejection, '; Zone:', e.zone.name, '; Task:', e.task && e.task.source, '; Value:', rejection, rejection instanceof Error ? rejection.stack : undefined);
            }
            else {
                console.error(e);
            }
        }
    };
    api.microtaskDrainDone = function () {
        while (_uncaughtPromiseErrors.length) {
            var _loop_1 = function () {
                var uncaughtPromiseError = _uncaughtPromiseErrors.shift();
                try {
                    uncaughtPromiseError.zone.runGuarded(function () { throw uncaughtPromiseError; });
                }
                catch (error) {
                    handleUnhandledRejection(error);
                }
            };
            while (_uncaughtPromiseErrors.length) {
                _loop_1();
            }
        }
    };
    var UNHANDLED_PROMISE_REJECTION_HANDLER_SYMBOL = __symbol__('unhandledPromiseRejectionHandler');
    function handleUnhandledRejection(e) {
        api.onUnhandledError(e);
        try {
            var handler = Zone[UNHANDLED_PROMISE_REJECTION_HANDLER_SYMBOL];
            if (handler && typeof handler === 'function') {
                handler.call(this, e);
            }
        }
        catch (err) {
        }
    }
    function isThenable(value) { return value && value.then; }
    function forwardResolution(value) { return value; }
    function forwardRejection(rejection) { return ZoneAwarePromise.reject(rejection); }
    var symbolState = __symbol__('state');
    var symbolValue = __symbol__('value');
    var symbolFinally = __symbol__('finally');
    var symbolParentPromiseValue = __symbol__('parentPromiseValue');
    var symbolParentPromiseState = __symbol__('parentPromiseState');
    var source = 'Promise.then';
    var UNRESOLVED = null;
    var RESOLVED = true;
    var REJECTED = false;
    var REJECTED_NO_CATCH = 0;
    function makeResolver(promise, state) {
        return function (v) {
            try {
                resolvePromise(promise, state, v);
            }
            catch (err) {
                resolvePromise(promise, false, err);
            }
            // Do not return value or you will break the Promise spec.
        };
    }
    var once = function () {
        var wasCalled = false;
        return function wrapper(wrappedFunction) {
            return function () {
                if (wasCalled) {
                    return;
                }
                wasCalled = true;
                wrappedFunction.apply(null, arguments);
            };
        };
    };
    var TYPE_ERROR = 'Promise resolved with itself';
    var CURRENT_TASK_TRACE_SYMBOL = __symbol__('currentTaskTrace');
    // Promise Resolution
    function resolvePromise(promise, state, value) {
        var onceWrapper = once();
        if (promise === value) {
            throw new TypeError(TYPE_ERROR);
        }
        if (promise[symbolState] === UNRESOLVED) {
            // should only get value.then once based on promise spec.
            var then = null;
            try {
                if (typeof value === 'object' || typeof value === 'function') {
                    then = value && value.then;
                }
            }
            catch (err) {
                onceWrapper(function () { resolvePromise(promise, false, err); })();
                return promise;
            }
            // if (value instanceof ZoneAwarePromise) {
            if (state !== REJECTED && value instanceof ZoneAwarePromise &&
                value.hasOwnProperty(symbolState) && value.hasOwnProperty(symbolValue) &&
                value[symbolState] !== UNRESOLVED) {
                clearRejectedNoCatch(value);
                resolvePromise(promise, value[symbolState], value[symbolValue]);
            }
            else if (state !== REJECTED && typeof then === 'function') {
                try {
                    then.call(value, onceWrapper(makeResolver(promise, state)), onceWrapper(makeResolver(promise, false)));
                }
                catch (err) {
                    onceWrapper(function () { resolvePromise(promise, false, err); })();
                }
            }
            else {
                promise[symbolState] = state;
                var queue = promise[symbolValue];
                promise[symbolValue] = value;
                if (promise[symbolFinally] === symbolFinally) {
                    // the promise is generated by Promise.prototype.finally
                    if (state === RESOLVED) {
                        // the state is resolved, should ignore the value
                        // and use parent promise value
                        promise[symbolState] = promise[symbolParentPromiseState];
                        promise[symbolValue] = promise[symbolParentPromiseValue];
                    }
                }
                // record task information in value when error occurs, so we can
                // do some additional work such as render longStackTrace
                if (state === REJECTED && value instanceof Error) {
                    // check if longStackTraceZone is here
                    var trace = Zone.currentTask && Zone.currentTask.data &&
                        Zone.currentTask.data[creationTrace];
                    if (trace) {
                        // only keep the long stack trace into error when in longStackTraceZone
                        ObjectDefineProperty(value, CURRENT_TASK_TRACE_SYMBOL, { configurable: true, enumerable: false, writable: true, value: trace });
                    }
                }
                for (var i = 0; i < queue.length;) {
                    scheduleResolveOrReject(promise, queue[i++], queue[i++], queue[i++], queue[i++]);
                }
                if (queue.length == 0 && state == REJECTED) {
                    promise[symbolState] = REJECTED_NO_CATCH;
                    try {
                        // try to print more readable error log
                        throw new Error('Uncaught (in promise): ' + readableObjectToString(value) +
                            (value && value.stack ? '\n' + value.stack : ''));
                    }
                    catch (err) {
                        var error_1 = err;
                        error_1.rejection = value;
                        error_1.promise = promise;
                        error_1.zone = Zone.current;
                        error_1.task = Zone.currentTask;
                        _uncaughtPromiseErrors.push(error_1);
                        api.scheduleMicroTask(); // to make sure that it is running
                    }
                }
            }
        }
        // Resolving an already resolved promise is a noop.
        return promise;
    }
    var REJECTION_HANDLED_HANDLER = __symbol__('rejectionHandledHandler');
    function clearRejectedNoCatch(promise) {
        if (promise[symbolState] === REJECTED_NO_CATCH) {
            // if the promise is rejected no catch status
            // and queue.length > 0, means there is a error handler
            // here to handle the rejected promise, we should trigger
            // windows.rejectionhandled eventHandler or nodejs rejectionHandled
            // eventHandler
            try {
                var handler = Zone[REJECTION_HANDLED_HANDLER];
                if (handler && typeof handler === 'function') {
                    handler.call(this, { rejection: promise[symbolValue], promise: promise });
                }
            }
            catch (err) {
            }
            promise[symbolState] = REJECTED;
            for (var i = 0; i < _uncaughtPromiseErrors.length; i++) {
                if (promise === _uncaughtPromiseErrors[i].promise) {
                    _uncaughtPromiseErrors.splice(i, 1);
                }
            }
        }
    }
    function scheduleResolveOrReject(promise, zone, chainPromise, onFulfilled, onRejected) {
        clearRejectedNoCatch(promise);
        var promiseState = promise[symbolState];
        var delegate = promiseState ?
            (typeof onFulfilled === 'function') ? onFulfilled : forwardResolution :
            (typeof onRejected === 'function') ? onRejected : forwardRejection;
        zone.scheduleMicroTask(source, function () {
            try {
                var parentPromiseValue = promise[symbolValue];
                var isFinallyPromise = !!chainPromise && symbolFinally === chainPromise[symbolFinally];
                if (isFinallyPromise) {
                    // if the promise is generated from finally call, keep parent promise's state and value
                    chainPromise[symbolParentPromiseValue] = parentPromiseValue;
                    chainPromise[symbolParentPromiseState] = promiseState;
                }
                // should not pass value to finally callback
                var value = zone.run(delegate, undefined, isFinallyPromise && delegate !== forwardRejection && delegate !== forwardResolution ?
                    [] :
                    [parentPromiseValue]);
                resolvePromise(chainPromise, true, value);
            }
            catch (error) {
                // if error occurs, should always return this error
                resolvePromise(chainPromise, false, error);
            }
        }, chainPromise);
    }
    var ZONE_AWARE_PROMISE_TO_STRING = 'function ZoneAwarePromise() { [native code] }';
    var ZoneAwarePromise = /** @class */ (function () {
        function ZoneAwarePromise(executor) {
            var promise = this;
            if (!(promise instanceof ZoneAwarePromise)) {
                throw new Error('Must be an instanceof Promise.');
            }
            promise[symbolState] = UNRESOLVED;
            promise[symbolValue] = []; // queue;
            try {
                executor && executor(makeResolver(promise, RESOLVED), makeResolver(promise, REJECTED));
            }
            catch (error) {
                resolvePromise(promise, false, error);
            }
        }
        ZoneAwarePromise.toString = function () { return ZONE_AWARE_PROMISE_TO_STRING; };
        ZoneAwarePromise.resolve = function (value) {
            return resolvePromise(new this(null), RESOLVED, value);
        };
        ZoneAwarePromise.reject = function (error) {
            return resolvePromise(new this(null), REJECTED, error);
        };
        ZoneAwarePromise.race = function (values) {
            var e_1, _a;
            var resolve;
            var reject;
            var promise = new this(function (res, rej) {
                resolve = res;
                reject = rej;
            });
            function onResolve(value) { resolve(value); }
            function onReject(error) { reject(error); }
            try {
                for (var values_1 = __values(values), values_1_1 = values_1.next(); !values_1_1.done; values_1_1 = values_1.next()) {
                    var value = values_1_1.value;
                    if (!isThenable(value)) {
                        value = this.resolve(value);
                    }
                    value.then(onResolve, onReject);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (values_1_1 && !values_1_1.done && (_a = values_1.return)) _a.call(values_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return promise;
        };
        ZoneAwarePromise.all = function (values) { return ZoneAwarePromise.allWithCallback(values); };
        ZoneAwarePromise.allSettled = function (values) {
            var P = this && this.prototype instanceof ZoneAwarePromise ? this : ZoneAwarePromise;
            return P.allWithCallback(values, {
                thenCallback: function (value) { return ({ status: 'fulfilled', value: value }); },
                errorCallback: function (err) { return ({ status: 'rejected', reason: err }); }
            });
        };
        ZoneAwarePromise.allWithCallback = function (values, callback) {
            var e_2, _a;
            var resolve;
            var reject;
            var promise = new this(function (res, rej) {
                resolve = res;
                reject = rej;
            });
            // Start at 2 to prevent prematurely resolving if .then is called immediately.
            var unresolvedCount = 2;
            var valueIndex = 0;
            var resolvedValues = [];
            var _loop_2 = function (value) {
                if (!isThenable(value)) {
                    value = this_1.resolve(value);
                }
                var curValueIndex = valueIndex;
                try {
                    value.then(function (value) {
                        resolvedValues[curValueIndex] = callback ? callback.thenCallback(value) : value;
                        unresolvedCount--;
                        if (unresolvedCount === 0) {
                            resolve(resolvedValues);
                        }
                    }, function (err) {
                        if (!callback) {
                            reject(err);
                        }
                        else {
                            resolvedValues[curValueIndex] = callback.errorCallback(err);
                            unresolvedCount--;
                            if (unresolvedCount === 0) {
                                resolve(resolvedValues);
                            }
                        }
                    });
                }
                catch (thenErr) {
                    reject(thenErr);
                }
                unresolvedCount++;
                valueIndex++;
            };
            var this_1 = this;
            try {
                for (var values_2 = __values(values), values_2_1 = values_2.next(); !values_2_1.done; values_2_1 = values_2.next()) {
                    var value = values_2_1.value;
                    _loop_2(value);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (values_2_1 && !values_2_1.done && (_a = values_2.return)) _a.call(values_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            // Make the unresolvedCount zero-based again.
            unresolvedCount -= 2;
            if (unresolvedCount === 0) {
                resolve(resolvedValues);
            }
            return promise;
        };
        Object.defineProperty(ZoneAwarePromise.prototype, Symbol.toStringTag, {
            get: function () { return 'Promise'; },
            enumerable: true,
            configurable: true
        });
        ZoneAwarePromise.prototype.then = function (onFulfilled, onRejected) {
            var chainPromise = new this.constructor(null);
            var zone = Zone.current;
            if (this[symbolState] == UNRESOLVED) {
                this[symbolValue].push(zone, chainPromise, onFulfilled, onRejected);
            }
            else {
                scheduleResolveOrReject(this, zone, chainPromise, onFulfilled, onRejected);
            }
            return chainPromise;
        };
        ZoneAwarePromise.prototype.catch = function (onRejected) {
            return this.then(null, onRejected);
        };
        ZoneAwarePromise.prototype.finally = function (onFinally) {
            var chainPromise = new this.constructor(null);
            chainPromise[symbolFinally] = symbolFinally;
            var zone = Zone.current;
            if (this[symbolState] == UNRESOLVED) {
                this[symbolValue].push(zone, chainPromise, onFinally, onFinally);
            }
            else {
                scheduleResolveOrReject(this, zone, chainPromise, onFinally, onFinally);
            }
            return chainPromise;
        };
        return ZoneAwarePromise;
    }());
    // Protect against aggressive optimizers dropping seemingly unused properties.
    // E.g. Closure Compiler in advanced mode.
    ZoneAwarePromise['resolve'] = ZoneAwarePromise.resolve;
    ZoneAwarePromise['reject'] = ZoneAwarePromise.reject;
    ZoneAwarePromise['race'] = ZoneAwarePromise.race;
    ZoneAwarePromise['all'] = ZoneAwarePromise.all;
    var NativePromise = global[symbolPromise] = global['Promise'];
    var ZONE_AWARE_PROMISE = Zone.__symbol__('ZoneAwarePromise');
    var desc = ObjectGetOwnPropertyDescriptor(global, 'Promise');
    if (!desc || desc.configurable) {
        desc && delete desc.writable;
        desc && delete desc.value;
        if (!desc) {
            desc = { configurable: true, enumerable: true };
        }
        desc.get = function () {
            // if we already set ZoneAwarePromise, use patched one
            // otherwise return native one.
            return global[ZONE_AWARE_PROMISE] ? global[ZONE_AWARE_PROMISE] : global[symbolPromise];
        };
        desc.set = function (NewNativePromise) {
            if (NewNativePromise === ZoneAwarePromise) {
                // if the NewNativePromise is ZoneAwarePromise
                // save to global
                global[ZONE_AWARE_PROMISE] = NewNativePromise;
            }
            else {
                // if the NewNativePromise is not ZoneAwarePromise
                // for example: after load zone.js, some library just
                // set es6-promise to global, if we set it to global
                // directly, assertZonePatched will fail and angular
                // will not loaded, so we just set the NewNativePromise
                // to global[symbolPromise], so the result is just like
                // we load ES6 Promise before zone.js
                global[symbolPromise] = NewNativePromise;
                if (!NewNativePromise.prototype[symbolThen]) {
                    patchThen(NewNativePromise);
                }
                api.setNativePromise(NewNativePromise);
            }
        };
        ObjectDefineProperty(global, 'Promise', desc);
    }
    global['Promise'] = ZoneAwarePromise;
    var symbolThenPatched = __symbol__('thenPatched');
    function patchThen(Ctor) {
        var proto = Ctor.prototype;
        var prop = ObjectGetOwnPropertyDescriptor(proto, 'then');
        if (prop && (prop.writable === false || !prop.configurable)) {
            // check Ctor.prototype.then propertyDescriptor is writable or not
            // in meteor env, writable is false, we should ignore such case
            return;
        }
        var originalThen = proto.then;
        // Keep a reference to the original method.
        proto[symbolThen] = originalThen;
        Ctor.prototype.then = function (onResolve, onReject) {
            var _this = this;
            var wrapped = new ZoneAwarePromise(function (resolve, reject) { originalThen.call(_this, resolve, reject); });
            return wrapped.then(onResolve, onReject);
        };
        Ctor[symbolThenPatched] = true;
    }
    api.patchThen = patchThen;
    function zoneify(fn) {
        return function () {
            var resultPromise = fn.apply(this, arguments);
            if (resultPromise instanceof ZoneAwarePromise) {
                return resultPromise;
            }
            var ctor = resultPromise.constructor;
            if (!ctor[symbolThenPatched]) {
                patchThen(ctor);
            }
            return resultPromise;
        };
    }
    if (NativePromise) {
        patchThen(NativePromise);
        var fetch_1 = global['fetch'];
        if (typeof fetch_1 == 'function') {
            global[api.symbol('fetch')] = fetch_1;
            global['fetch'] = zoneify(fetch_1);
        }
    }
    // This is not part of public API, but it is useful for tests, so we expose it.
    Promise[Zone.__symbol__('uncaughtPromiseErrors')] = _uncaughtPromiseErrors;
    return ZoneAwarePromise;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvbWlzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3pvbmUuanMvbGliL2NvbW1vbi9wcm9taXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxVQUFDLE1BQVcsRUFBRSxJQUFjLEVBQUUsR0FBaUI7SUFDbkYsSUFBTSw4QkFBOEIsR0FBRyxNQUFNLENBQUMsd0JBQXdCLENBQUM7SUFDdkUsSUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDO0lBRW5ELFNBQVMsc0JBQXNCLENBQUMsR0FBUTtRQUN0QyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxLQUFLLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFO1lBQ3JELElBQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxXQUFXLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7WUFDMUQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNsRTtRQUVELE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUM5QixJQUFNLHNCQUFzQixHQUEyQixFQUFFLENBQUM7SUFDMUQsSUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzVDLElBQU0sVUFBVSxHQUFHLFVBQVUsQ0FB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QUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM5QyxJQUFJLGFBQWEsWUFBWSxnQkFBZ0IsRUFBRTtnQkFDN0MsT0FBTyxhQUFhLENBQUM7YUFDdEI7WUFDRCxJQUFJLElBQUksR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRTtnQkFDNUIsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2pCO1lBQ0QsT0FBTyxhQUFhLENBQUM7UUFDdkIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksYUFBYSxFQUFFO1FBQ2pCLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN6QixJQUFNLE9BQUssR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUIsSUFBSSxPQUFPLE9BQUssSUFBSSxVQUFVLEVBQUU7WUFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxPQUFLLENBQUM7WUFDcEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFLLENBQUMsQ0FBQztTQUNsQztLQUNGO0lBRUQsK0VBQStFO0lBQzlFLE9BQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLENBQUMsR0FBRyxzQkFBc0IsQ0FBQztJQUNwRixPQUFPLGdCQUFnQixDQUFDO0FBQzFCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuWm9uZS5fX2xvYWRfcGF0Y2goJ1pvbmVBd2FyZVByb21pc2UnLCAoZ2xvYmFsOiBhbnksIFpvbmU6IFpvbmVUeXBlLCBhcGk6IF9ab25lUHJpdmF0ZSkgPT4ge1xuICBjb25zdCBPYmplY3RHZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuICBjb25zdCBPYmplY3REZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuICBmdW5jdGlvbiByZWFkYWJsZU9iamVjdFRvU3RyaW5nKG9iajogYW55KSB7XG4gICAgaWYgKG9iaiAmJiBvYmoudG9TdHJpbmcgPT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcpIHtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IubmFtZTtcbiAgICAgIHJldHVybiAoY2xhc3NOYW1lID8gY2xhc3NOYW1lIDogJycpICsgJzogJyArIEpTT04uc3RyaW5naWZ5KG9iaik7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iaiA/IG9iai50b1N0cmluZygpIDogT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaik7XG4gIH1cblxuICBjb25zdCBfX3N5bWJvbF9fID0gYXBpLnN5bWJvbDtcbiAgY29uc3QgX3VuY2F1Z2h0UHJvbWlzZUVycm9yczogVW5jYXVnaHRQcm9taXNlRXJyb3JbXSA9IFtdO1xuICBjb25zdCBzeW1ib2xQcm9taXNlID0gX19zeW1ib2xfXygnUHJvbWlzZScpO1xuICBjb25zdCBzeW1ib2xUaGVuID0gX19zeW1ib2xfXygndGhlbicpO1xuICBjb25zdCBjcmVhdGlvblRyYWNlID0gJ19fY3JlYXRpb25UcmFjZV9fJztcblxuICBhcGkub25VbmhhbmRsZWRFcnJvciA9IChlOiBhbnkpID0+IHtcbiAgICBpZiAoYXBpLnNob3dVbmNhdWdodEVycm9yKCkpIHtcbiAgICAgIGNvbnN0IHJlamVjdGlvbiA9IGUgJiYgZS5yZWplY3Rpb247XG4gICAgICBpZiAocmVqZWN0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAnVW5oYW5kbGVkIFByb21pc2UgcmVqZWN0aW9uOicsXG4gICAgICAgICAgICByZWplY3Rpb24gaW5zdGFuY2VvZiBFcnJvciA/IHJlamVjdGlvbi5tZXNzYWdlIDogcmVqZWN0aW9uLCAnOyBab25lOicsXG4gICAgICAgICAgICAoPFpvbmU+ZS56b25lKS5uYW1lLCAnOyBUYXNrOicsIGUudGFzayAmJiAoPFRhc2s+ZS50YXNrKS5zb3VyY2UsICc7IFZhbHVlOicsIHJlamVjdGlvbixcbiAgICAgICAgICAgIHJlamVjdGlvbiBpbnN0YW5jZW9mIEVycm9yID8gcmVqZWN0aW9uLnN0YWNrIDogdW5kZWZpbmVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGFwaS5taWNyb3Rhc2tEcmFpbkRvbmUgPSAoKSA9PiB7XG4gICAgd2hpbGUgKF91bmNhdWdodFByb21pc2VFcnJvcnMubGVuZ3RoKSB7XG4gICAgICB3aGlsZSAoX3VuY2F1Z2h0UHJvbWlzZUVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgdW5jYXVnaHRQcm9taXNlRXJyb3I6IFVuY2F1Z2h0UHJvbWlzZUVycm9yID0gX3VuY2F1Z2h0UHJvbWlzZUVycm9ycy5zaGlmdCgpICE7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdW5jYXVnaHRQcm9taXNlRXJyb3Iuem9uZS5ydW5HdWFyZGVkKCgpID0+IHsgdGhyb3cgdW5jYXVnaHRQcm9taXNlRXJyb3I7IH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGhhbmRsZVVuaGFuZGxlZFJlamVjdGlvbihlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgY29uc3QgVU5IQU5ETEVEX1BST01JU0VfUkVKRUNUSU9OX0hBTkRMRVJfU1lNQk9MID0gX19zeW1ib2xfXygndW5oYW5kbGVkUHJvbWlzZVJlamVjdGlvbkhhbmRsZXInKTtcblxuICBmdW5jdGlvbiBoYW5kbGVVbmhhbmRsZWRSZWplY3Rpb24odGhpczogdW5rbm93biwgZTogYW55KSB7XG4gICAgYXBpLm9uVW5oYW5kbGVkRXJyb3IoZSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSAoWm9uZSBhcyBhbnkpW1VOSEFORExFRF9QUk9NSVNFX1JFSkVDVElPTl9IQU5ETEVSX1NZTUJPTF07XG4gICAgICBpZiAoaGFuZGxlciAmJiB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgZSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaXNUaGVuYWJsZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7IHJldHVybiB2YWx1ZSAmJiB2YWx1ZS50aGVuOyB9XG5cbiAgZnVuY3Rpb24gZm9yd2FyZFJlc29sdXRpb24odmFsdWU6IGFueSk6IGFueSB7IHJldHVybiB2YWx1ZTsgfVxuXG4gIGZ1bmN0aW9uIGZvcndhcmRSZWplY3Rpb24ocmVqZWN0aW9uOiBhbnkpOiBhbnkgeyByZXR1cm4gWm9uZUF3YXJlUHJvbWlzZS5yZWplY3QocmVqZWN0aW9uKTsgfVxuXG4gIGNvbnN0IHN5bWJvbFN0YXRlOiBzdHJpbmcgPSBfX3N5bWJvbF9fKCdzdGF0ZScpO1xuICBjb25zdCBzeW1ib2xWYWx1ZTogc3RyaW5nID0gX19zeW1ib2xfXygndmFsdWUnKTtcbiAgY29uc3Qgc3ltYm9sRmluYWxseTogc3RyaW5nID0gX19zeW1ib2xfXygnZmluYWxseScpO1xuICBjb25zdCBzeW1ib2xQYXJlbnRQcm9taXNlVmFsdWU6IHN0cmluZyA9IF9fc3ltYm9sX18oJ3BhcmVudFByb21pc2VWYWx1ZScpO1xuICBjb25zdCBzeW1ib2xQYXJlbnRQcm9taXNlU3RhdGU6IHN0cmluZyA9IF9fc3ltYm9sX18oJ3BhcmVudFByb21pc2VTdGF0ZScpO1xuICBjb25zdCBzb3VyY2U6IHN0cmluZyA9ICdQcm9taXNlLnRoZW4nO1xuICBjb25zdCBVTlJFU09MVkVEOiBudWxsID0gbnVsbDtcbiAgY29uc3QgUkVTT0xWRUQgPSB0cnVlO1xuICBjb25zdCBSRUpFQ1RFRCA9IGZhbHNlO1xuICBjb25zdCBSRUpFQ1RFRF9OT19DQVRDSCA9IDA7XG5cbiAgZnVuY3Rpb24gbWFrZVJlc29sdmVyKHByb21pc2U6IFpvbmVBd2FyZVByb21pc2U8YW55Piwgc3RhdGU6IGJvb2xlYW4pOiAodmFsdWU6IGFueSkgPT4gdm9pZCB7XG4gICAgcmV0dXJuICh2KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICByZXNvbHZlUHJvbWlzZShwcm9taXNlLCBzdGF0ZSwgdik7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmVzb2x2ZVByb21pc2UocHJvbWlzZSwgZmFsc2UsIGVycik7XG4gICAgICB9XG4gICAgICAvLyBEbyBub3QgcmV0dXJuIHZhbHVlIG9yIHlvdSB3aWxsIGJyZWFrIHRoZSBQcm9taXNlIHNwZWMuXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IG9uY2UgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgd2FzQ2FsbGVkID0gZmFsc2U7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gd3JhcHBlcih3cmFwcGVkRnVuY3Rpb246IEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh3YXNDYWxsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgd2FzQ2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgd3JhcHBlZEZ1bmN0aW9uLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH07XG4gIH07XG5cbiAgY29uc3QgVFlQRV9FUlJPUiA9ICdQcm9taXNlIHJlc29sdmVkIHdpdGggaXRzZWxmJztcbiAgY29uc3QgQ1VSUkVOVF9UQVNLX1RSQUNFX1NZTUJPTCA9IF9fc3ltYm9sX18oJ2N1cnJlbnRUYXNrVHJhY2UnKTtcblxuICAvLyBQcm9taXNlIFJlc29sdXRpb25cbiAgZnVuY3Rpb24gcmVzb2x2ZVByb21pc2UoXG4gICAgICBwcm9taXNlOiBab25lQXdhcmVQcm9taXNlPGFueT4sIHN0YXRlOiBib29sZWFuLCB2YWx1ZTogYW55KTogWm9uZUF3YXJlUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBvbmNlV3JhcHBlciA9IG9uY2UoKTtcbiAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoVFlQRV9FUlJPUik7XG4gICAgfVxuICAgIGlmICgocHJvbWlzZSBhcyBhbnkpW3N5bWJvbFN0YXRlXSA9PT0gVU5SRVNPTFZFRCkge1xuICAgICAgLy8gc2hvdWxkIG9ubHkgZ2V0IHZhbHVlLnRoZW4gb25jZSBiYXNlZCBvbiBwcm9taXNlIHNwZWMuXG4gICAgICBsZXQgdGhlbjogYW55ID0gbnVsbDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoZW4gPSB2YWx1ZSAmJiB2YWx1ZS50aGVuO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgb25jZVdyYXBwZXIoKCkgPT4geyByZXNvbHZlUHJvbWlzZShwcm9taXNlLCBmYWxzZSwgZXJyKTsgfSkoKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICB9XG4gICAgICAvLyBpZiAodmFsdWUgaW5zdGFuY2VvZiBab25lQXdhcmVQcm9taXNlKSB7XG4gICAgICBpZiAoc3RhdGUgIT09IFJFSkVDVEVEICYmIHZhbHVlIGluc3RhbmNlb2YgWm9uZUF3YXJlUHJvbWlzZSAmJlxuICAgICAgICAgIHZhbHVlLmhhc093blByb3BlcnR5KHN5bWJvbFN0YXRlKSAmJiB2YWx1ZS5oYXNPd25Qcm9wZXJ0eShzeW1ib2xWYWx1ZSkgJiZcbiAgICAgICAgICAodmFsdWUgYXMgYW55KVtzeW1ib2xTdGF0ZV0gIT09IFVOUkVTT0xWRUQpIHtcbiAgICAgICAgY2xlYXJSZWplY3RlZE5vQ2F0Y2goPFByb21pc2U8YW55Pj52YWx1ZSBhcyBhbnkpO1xuICAgICAgICByZXNvbHZlUHJvbWlzZShwcm9taXNlLCAodmFsdWUgYXMgYW55KVtzeW1ib2xTdGF0ZV0sICh2YWx1ZSBhcyBhbnkpW3N5bWJvbFZhbHVlXSk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlICE9PSBSRUpFQ1RFRCAmJiB0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoZW4uY2FsbChcbiAgICAgICAgICAgICAgdmFsdWUsIG9uY2VXcmFwcGVyKG1ha2VSZXNvbHZlcihwcm9taXNlLCBzdGF0ZSkpLFxuICAgICAgICAgICAgICBvbmNlV3JhcHBlcihtYWtlUmVzb2x2ZXIocHJvbWlzZSwgZmFsc2UpKSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIG9uY2VXcmFwcGVyKCgpID0+IHsgcmVzb2x2ZVByb21pc2UocHJvbWlzZSwgZmFsc2UsIGVycik7IH0pKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIChwcm9taXNlIGFzIGFueSlbc3ltYm9sU3RhdGVdID0gc3RhdGU7XG4gICAgICAgIGNvbnN0IHF1ZXVlID0gKHByb21pc2UgYXMgYW55KVtzeW1ib2xWYWx1ZV07XG4gICAgICAgIChwcm9taXNlIGFzIGFueSlbc3ltYm9sVmFsdWVdID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKChwcm9taXNlIGFzIGFueSlbc3ltYm9sRmluYWxseV0gPT09IHN5bWJvbEZpbmFsbHkpIHtcbiAgICAgICAgICAvLyB0aGUgcHJvbWlzZSBpcyBnZW5lcmF0ZWQgYnkgUHJvbWlzZS5wcm90b3R5cGUuZmluYWxseVxuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gUkVTT0xWRUQpIHtcbiAgICAgICAgICAgIC8vIHRoZSBzdGF0ZSBpcyByZXNvbHZlZCwgc2hvdWxkIGlnbm9yZSB0aGUgdmFsdWVcbiAgICAgICAgICAgIC8vIGFuZCB1c2UgcGFyZW50IHByb21pc2UgdmFsdWVcbiAgICAgICAgICAgIChwcm9taXNlIGFzIGFueSlbc3ltYm9sU3RhdGVdID0gKHByb21pc2UgYXMgYW55KVtzeW1ib2xQYXJlbnRQcm9taXNlU3RhdGVdO1xuICAgICAgICAgICAgKHByb21pc2UgYXMgYW55KVtzeW1ib2xWYWx1ZV0gPSAocHJvbWlzZSBhcyBhbnkpW3N5bWJvbFBhcmVudFByb21pc2VWYWx1ZV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVjb3JkIHRhc2sgaW5mb3JtYXRpb24gaW4gdmFsdWUgd2hlbiBlcnJvciBvY2N1cnMsIHNvIHdlIGNhblxuICAgICAgICAvLyBkbyBzb21lIGFkZGl0aW9uYWwgd29yayBzdWNoIGFzIHJlbmRlciBsb25nU3RhY2tUcmFjZVxuICAgICAgICBpZiAoc3RhdGUgPT09IFJFSkVDVEVEICYmIHZhbHVlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAvLyBjaGVjayBpZiBsb25nU3RhY2tUcmFjZVpvbmUgaXMgaGVyZVxuICAgICAgICAgIGNvbnN0IHRyYWNlID0gWm9uZS5jdXJyZW50VGFzayAmJiBab25lLmN1cnJlbnRUYXNrLmRhdGEgJiZcbiAgICAgICAgICAgICAgKFpvbmUuY3VycmVudFRhc2suZGF0YSBhcyBhbnkpW2NyZWF0aW9uVHJhY2VdO1xuICAgICAgICAgIGlmICh0cmFjZSkge1xuICAgICAgICAgICAgLy8gb25seSBrZWVwIHRoZSBsb25nIHN0YWNrIHRyYWNlIGludG8gZXJyb3Igd2hlbiBpbiBsb25nU3RhY2tUcmFjZVpvbmVcbiAgICAgICAgICAgIE9iamVjdERlZmluZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgIHZhbHVlLCBDVVJSRU5UX1RBU0tfVFJBQ0VfU1lNQk9MLFxuICAgICAgICAgICAgICAgIHtjb25maWd1cmFibGU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IHRyYWNlfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7KSB7XG4gICAgICAgICAgc2NoZWR1bGVSZXNvbHZlT3JSZWplY3QocHJvbWlzZSwgcXVldWVbaSsrXSwgcXVldWVbaSsrXSwgcXVldWVbaSsrXSwgcXVldWVbaSsrXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA9PSAwICYmIHN0YXRlID09IFJFSkVDVEVEKSB7XG4gICAgICAgICAgKHByb21pc2UgYXMgYW55KVtzeW1ib2xTdGF0ZV0gPSBSRUpFQ1RFRF9OT19DQVRDSDtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gdHJ5IHRvIHByaW50IG1vcmUgcmVhZGFibGUgZXJyb3IgbG9nXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgJ1VuY2F1Z2h0IChpbiBwcm9taXNlKTogJyArIHJlYWRhYmxlT2JqZWN0VG9TdHJpbmcodmFsdWUpICtcbiAgICAgICAgICAgICAgICAodmFsdWUgJiYgdmFsdWUuc3RhY2sgPyAnXFxuJyArIHZhbHVlLnN0YWNrIDogJycpKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yOiBVbmNhdWdodFByb21pc2VFcnJvciA9IGVycjtcbiAgICAgICAgICAgIGVycm9yLnJlamVjdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgZXJyb3IucHJvbWlzZSA9IHByb21pc2U7XG4gICAgICAgICAgICBlcnJvci56b25lID0gWm9uZS5jdXJyZW50O1xuICAgICAgICAgICAgZXJyb3IudGFzayA9IFpvbmUuY3VycmVudFRhc2sgITtcbiAgICAgICAgICAgIF91bmNhdWdodFByb21pc2VFcnJvcnMucHVzaChlcnJvcik7XG4gICAgICAgICAgICBhcGkuc2NoZWR1bGVNaWNyb1Rhc2soKTsgIC8vIHRvIG1ha2Ugc3VyZSB0aGF0IGl0IGlzIHJ1bm5pbmdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVzb2x2aW5nIGFuIGFscmVhZHkgcmVzb2x2ZWQgcHJvbWlzZSBpcyBhIG5vb3AuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBjb25zdCBSRUpFQ1RJT05fSEFORExFRF9IQU5ETEVSID0gX19zeW1ib2xfXygncmVqZWN0aW9uSGFuZGxlZEhhbmRsZXInKTtcbiAgZnVuY3Rpb24gY2xlYXJSZWplY3RlZE5vQ2F0Y2godGhpczogdW5rbm93biwgcHJvbWlzZTogWm9uZUF3YXJlUHJvbWlzZTxhbnk+KTogdm9pZCB7XG4gICAgaWYgKChwcm9taXNlIGFzIGFueSlbc3ltYm9sU3RhdGVdID09PSBSRUpFQ1RFRF9OT19DQVRDSCkge1xuICAgICAgLy8gaWYgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQgbm8gY2F0Y2ggc3RhdHVzXG4gICAgICAvLyBhbmQgcXVldWUubGVuZ3RoID4gMCwgbWVhbnMgdGhlcmUgaXMgYSBlcnJvciBoYW5kbGVyXG4gICAgICAvLyBoZXJlIHRvIGhhbmRsZSB0aGUgcmVqZWN0ZWQgcHJvbWlzZSwgd2Ugc2hvdWxkIHRyaWdnZXJcbiAgICAgIC8vIHdpbmRvd3MucmVqZWN0aW9uaGFuZGxlZCBldmVudEhhbmRsZXIgb3Igbm9kZWpzIHJlamVjdGlvbkhhbmRsZWRcbiAgICAgIC8vIGV2ZW50SGFuZGxlclxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IChab25lIGFzIGFueSlbUkVKRUNUSU9OX0hBTkRMRURfSEFORExFUl07XG4gICAgICAgIGlmIChoYW5kbGVyICYmIHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIHtyZWplY3Rpb246IChwcm9taXNlIGFzIGFueSlbc3ltYm9sVmFsdWVdLCBwcm9taXNlOiBwcm9taXNlfSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgfVxuICAgICAgKHByb21pc2UgYXMgYW55KVtzeW1ib2xTdGF0ZV0gPSBSRUpFQ1RFRDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgX3VuY2F1Z2h0UHJvbWlzZUVycm9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvbWlzZSA9PT0gX3VuY2F1Z2h0UHJvbWlzZUVycm9yc1tpXS5wcm9taXNlKSB7XG4gICAgICAgICAgX3VuY2F1Z2h0UHJvbWlzZUVycm9ycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzY2hlZHVsZVJlc29sdmVPclJlamVjdDxSLCBVMSwgVTI+KFxuICAgICAgcHJvbWlzZTogWm9uZUF3YXJlUHJvbWlzZTxhbnk+LCB6b25lOiBBbWJpZW50Wm9uZSwgY2hhaW5Qcm9taXNlOiBab25lQXdhcmVQcm9taXNlPGFueT4sXG4gICAgICBvbkZ1bGZpbGxlZD86ICgodmFsdWU6IFIpID0+IFUxKSB8IG51bGwgfCB1bmRlZmluZWQsXG4gICAgICBvblJlamVjdGVkPzogKChlcnJvcjogYW55KSA9PiBVMikgfCBudWxsIHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gICAgY2xlYXJSZWplY3RlZE5vQ2F0Y2gocHJvbWlzZSk7XG4gICAgY29uc3QgcHJvbWlzZVN0YXRlID0gKHByb21pc2UgYXMgYW55KVtzeW1ib2xTdGF0ZV07XG4gICAgY29uc3QgZGVsZWdhdGUgPSBwcm9taXNlU3RhdGUgP1xuICAgICAgICAodHlwZW9mIG9uRnVsZmlsbGVkID09PSAnZnVuY3Rpb24nKSA/IG9uRnVsZmlsbGVkIDogZm9yd2FyZFJlc29sdXRpb24gOlxuICAgICAgICAodHlwZW9mIG9uUmVqZWN0ZWQgPT09ICdmdW5jdGlvbicpID8gb25SZWplY3RlZCA6IGZvcndhcmRSZWplY3Rpb247XG4gICAgem9uZS5zY2hlZHVsZU1pY3JvVGFzayhzb3VyY2UsICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHBhcmVudFByb21pc2VWYWx1ZSA9IChwcm9taXNlIGFzIGFueSlbc3ltYm9sVmFsdWVdO1xuICAgICAgICBjb25zdCBpc0ZpbmFsbHlQcm9taXNlID1cbiAgICAgICAgICAgICEhY2hhaW5Qcm9taXNlICYmIHN5bWJvbEZpbmFsbHkgPT09IChjaGFpblByb21pc2UgYXMgYW55KVtzeW1ib2xGaW5hbGx5XTtcbiAgICAgICAgaWYgKGlzRmluYWxseVByb21pc2UpIHtcbiAgICAgICAgICAvLyBpZiB0aGUgcHJvbWlzZSBpcyBnZW5lcmF0ZWQgZnJvbSBmaW5hbGx5IGNhbGwsIGtlZXAgcGFyZW50IHByb21pc2UncyBzdGF0ZSBhbmQgdmFsdWVcbiAgICAgICAgICAoY2hhaW5Qcm9taXNlIGFzIGFueSlbc3ltYm9sUGFyZW50UHJvbWlzZVZhbHVlXSA9IHBhcmVudFByb21pc2VWYWx1ZTtcbiAgICAgICAgICAoY2hhaW5Qcm9taXNlIGFzIGFueSlbc3ltYm9sUGFyZW50UHJvbWlzZVN0YXRlXSA9IHByb21pc2VTdGF0ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzaG91bGQgbm90IHBhc3MgdmFsdWUgdG8gZmluYWxseSBjYWxsYmFja1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHpvbmUucnVuKFxuICAgICAgICAgICAgZGVsZWdhdGUsIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGlzRmluYWxseVByb21pc2UgJiYgZGVsZWdhdGUgIT09IGZvcndhcmRSZWplY3Rpb24gJiYgZGVsZWdhdGUgIT09IGZvcndhcmRSZXNvbHV0aW9uID9cbiAgICAgICAgICAgICAgICBbXSA6XG4gICAgICAgICAgICAgICAgW3BhcmVudFByb21pc2VWYWx1ZV0pO1xuICAgICAgICByZXNvbHZlUHJvbWlzZShjaGFpblByb21pc2UsIHRydWUsIHZhbHVlKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIGlmIGVycm9yIG9jY3Vycywgc2hvdWxkIGFsd2F5cyByZXR1cm4gdGhpcyBlcnJvclxuICAgICAgICByZXNvbHZlUHJvbWlzZShjaGFpblByb21pc2UsIGZhbHNlLCBlcnJvcik7XG4gICAgICB9XG4gICAgfSwgY2hhaW5Qcm9taXNlIGFzIFRhc2tEYXRhKTtcbiAgfVxuXG4gIGNvbnN0IFpPTkVfQVdBUkVfUFJPTUlTRV9UT19TVFJJTkcgPSAnZnVuY3Rpb24gWm9uZUF3YXJlUHJvbWlzZSgpIHsgW25hdGl2ZSBjb2RlXSB9JztcblxuICBjbGFzcyBab25lQXdhcmVQcm9taXNlPFI+IGltcGxlbWVudHMgUHJvbWlzZTxSPiB7XG4gICAgc3RhdGljIHRvU3RyaW5nKCkgeyByZXR1cm4gWk9ORV9BV0FSRV9QUk9NSVNFX1RPX1NUUklORzsgfVxuXG4gICAgc3RhdGljIHJlc29sdmU8Uj4odmFsdWU6IFIpOiBQcm9taXNlPFI+IHtcbiAgICAgIHJldHVybiByZXNvbHZlUHJvbWlzZSg8Wm9uZUF3YXJlUHJvbWlzZTxSPj5uZXcgdGhpcyhudWxsIGFzIGFueSksIFJFU09MVkVELCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgc3RhdGljIHJlamVjdDxVPihlcnJvcjogVSk6IFByb21pc2U8VT4ge1xuICAgICAgcmV0dXJuIHJlc29sdmVQcm9taXNlKDxab25lQXdhcmVQcm9taXNlPFU+Pm5ldyB0aGlzKG51bGwgYXMgYW55KSwgUkVKRUNURUQsIGVycm9yKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcmFjZTxSPih2YWx1ZXM6IFByb21pc2VMaWtlPGFueT5bXSk6IFByb21pc2U8Uj4ge1xuICAgICAgbGV0IHJlc29sdmU6ICh2OiBhbnkpID0+IHZvaWQ7XG4gICAgICBsZXQgcmVqZWN0OiAodjogYW55KSA9PiB2b2lkO1xuICAgICAgbGV0IHByb21pc2U6IGFueSA9IG5ldyB0aGlzKChyZXMsIHJlaikgPT4ge1xuICAgICAgICByZXNvbHZlID0gcmVzO1xuICAgICAgICByZWplY3QgPSByZWo7XG4gICAgICB9KTtcbiAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZSh2YWx1ZTogYW55KSB7IHJlc29sdmUodmFsdWUpOyB9XG4gICAgICBmdW5jdGlvbiBvblJlamVjdChlcnJvcjogYW55KSB7IHJlamVjdChlcnJvcik7IH1cblxuICAgICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICAgIGlmICghaXNUaGVuYWJsZSh2YWx1ZSkpIHtcbiAgICAgICAgICB2YWx1ZSA9IHRoaXMucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWUudGhlbihvblJlc29sdmUsIG9uUmVqZWN0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIHN0YXRpYyBhbGw8Uj4odmFsdWVzOiBhbnkpOiBQcm9taXNlPFI+IHsgcmV0dXJuIFpvbmVBd2FyZVByb21pc2UuYWxsV2l0aENhbGxiYWNrKHZhbHVlcyk7IH1cblxuICAgIHN0YXRpYyBhbGxTZXR0bGVkPFI+KHZhbHVlczogYW55KTogUHJvbWlzZTxSPiB7XG4gICAgICBjb25zdCBQID0gdGhpcyAmJiB0aGlzLnByb3RvdHlwZSBpbnN0YW5jZW9mIFpvbmVBd2FyZVByb21pc2UgPyB0aGlzIDogWm9uZUF3YXJlUHJvbWlzZTtcbiAgICAgIHJldHVybiBQLmFsbFdpdGhDYWxsYmFjayh2YWx1ZXMsIHtcbiAgICAgICAgdGhlbkNhbGxiYWNrOiAodmFsdWU6IGFueSkgPT4gKHtzdGF0dXM6ICdmdWxmaWxsZWQnLCB2YWx1ZX0pLFxuICAgICAgICBlcnJvckNhbGxiYWNrOiAoZXJyOiBhbnkpID0+ICh7c3RhdHVzOiAncmVqZWN0ZWQnLCByZWFzb246IGVycn0pXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYWxsV2l0aENhbGxiYWNrPFI+KHZhbHVlczogYW55LCBjYWxsYmFjaz86IHtcbiAgICAgIHRoZW5DYWxsYmFjazogKHZhbHVlOiBhbnkpID0+IGFueSxcbiAgICAgIGVycm9yQ2FsbGJhY2s6IChlcnI6IGFueSkgPT4gYW55XG4gICAgfSk6IFByb21pc2U8Uj4ge1xuICAgICAgbGV0IHJlc29sdmU6ICh2OiBhbnkpID0+IHZvaWQ7XG4gICAgICBsZXQgcmVqZWN0OiAodjogYW55KSA9PiB2b2lkO1xuICAgICAgbGV0IHByb21pc2UgPSBuZXcgdGhpczxSPigocmVzLCByZWopID0+IHtcbiAgICAgICAgcmVzb2x2ZSA9IHJlcztcbiAgICAgICAgcmVqZWN0ID0gcmVqO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFN0YXJ0IGF0IDIgdG8gcHJldmVudCBwcmVtYXR1cmVseSByZXNvbHZpbmcgaWYgLnRoZW4gaXMgY2FsbGVkIGltbWVkaWF0ZWx5LlxuICAgICAgbGV0IHVucmVzb2x2ZWRDb3VudCA9IDI7XG4gICAgICBsZXQgdmFsdWVJbmRleCA9IDA7XG5cbiAgICAgIGNvbnN0IHJlc29sdmVkVmFsdWVzOiBhbnlbXSA9IFtdO1xuICAgICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICAgIGlmICghaXNUaGVuYWJsZSh2YWx1ZSkpIHtcbiAgICAgICAgICB2YWx1ZSA9IHRoaXMucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjdXJWYWx1ZUluZGV4ID0gdmFsdWVJbmRleDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YWx1ZS50aGVuKFxuICAgICAgICAgICAgICAodmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmVkVmFsdWVzW2N1clZhbHVlSW5kZXhdID0gY2FsbGJhY2sgPyBjYWxsYmFjay50aGVuQ2FsbGJhY2sodmFsdWUpIDogdmFsdWU7XG4gICAgICAgICAgICAgICAgdW5yZXNvbHZlZENvdW50LS07XG4gICAgICAgICAgICAgICAgaWYgKHVucmVzb2x2ZWRDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgcmVzb2x2ZSAhKHJlc29sdmVkVmFsdWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIChlcnI6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgIHJlamVjdCAhKGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJlc29sdmVkVmFsdWVzW2N1clZhbHVlSW5kZXhdID0gY2FsbGJhY2suZXJyb3JDYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgdW5yZXNvbHZlZENvdW50LS07XG4gICAgICAgICAgICAgICAgICBpZiAodW5yZXNvbHZlZENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUgIShyZXNvbHZlZFZhbHVlcyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAodGhlbkVycikge1xuICAgICAgICAgIHJlamVjdCAhKHRoZW5FcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdW5yZXNvbHZlZENvdW50Kys7XG4gICAgICAgIHZhbHVlSW5kZXgrKztcbiAgICAgIH1cblxuICAgICAgLy8gTWFrZSB0aGUgdW5yZXNvbHZlZENvdW50IHplcm8tYmFzZWQgYWdhaW4uXG4gICAgICB1bnJlc29sdmVkQ291bnQgLT0gMjtcblxuICAgICAgaWYgKHVucmVzb2x2ZWRDb3VudCA9PT0gMCkge1xuICAgICAgICByZXNvbHZlICEocmVzb2x2ZWRWYWx1ZXMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZXhlY3V0b3I6XG4gICAgICAgICAgICAocmVzb2x2ZTogKHZhbHVlPzogUnxQcm9taXNlTGlrZTxSPikgPT4gdm9pZCwgcmVqZWN0OiAoZXJyb3I/OiBhbnkpID0+IHZvaWQpID0+IHZvaWQpIHtcbiAgICAgIGNvbnN0IHByb21pc2U6IFpvbmVBd2FyZVByb21pc2U8Uj4gPSB0aGlzO1xuICAgICAgaWYgKCEocHJvbWlzZSBpbnN0YW5jZW9mIFpvbmVBd2FyZVByb21pc2UpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTXVzdCBiZSBhbiBpbnN0YW5jZW9mIFByb21pc2UuJyk7XG4gICAgICB9XG4gICAgICAocHJvbWlzZSBhcyBhbnkpW3N5bWJvbFN0YXRlXSA9IFVOUkVTT0xWRUQ7XG4gICAgICAocHJvbWlzZSBhcyBhbnkpW3N5bWJvbFZhbHVlXSA9IFtdOyAgLy8gcXVldWU7XG4gICAgICB0cnkge1xuICAgICAgICBleGVjdXRvciAmJiBleGVjdXRvcihtYWtlUmVzb2x2ZXIocHJvbWlzZSwgUkVTT0xWRUQpLCBtYWtlUmVzb2x2ZXIocHJvbWlzZSwgUkVKRUNURUQpKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJlc29sdmVQcm9taXNlKHByb21pc2UsIGZhbHNlLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0W1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7IHJldHVybiAnUHJvbWlzZScgYXMgYW55OyB9XG5cbiAgICB0aGVuPFRSZXN1bHQxID0gUiwgVFJlc3VsdDIgPSBuZXZlcj4oXG4gICAgICAgIG9uRnVsZmlsbGVkPzogKCh2YWx1ZTogUikgPT4gVFJlc3VsdDEgfCBQcm9taXNlTGlrZTxUUmVzdWx0MT4pfHVuZGVmaW5lZHxudWxsLFxuICAgICAgICBvblJlamVjdGVkPzogKChyZWFzb246IGFueSkgPT4gVFJlc3VsdDIgfCBQcm9taXNlTGlrZTxUUmVzdWx0Mj4pfHVuZGVmaW5lZHxcbiAgICAgICAgbnVsbCk6IFByb21pc2U8VFJlc3VsdDF8VFJlc3VsdDI+IHtcbiAgICAgIGNvbnN0IGNoYWluUHJvbWlzZTogUHJvbWlzZTxUUmVzdWx0MXxUUmVzdWx0Mj4gPVxuICAgICAgICAgIG5ldyAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgWm9uZUF3YXJlUHJvbWlzZSkobnVsbCBhcyBhbnkpO1xuICAgICAgY29uc3Qgem9uZSA9IFpvbmUuY3VycmVudDtcbiAgICAgIGlmICgodGhpcyBhcyBhbnkpW3N5bWJvbFN0YXRlXSA9PSBVTlJFU09MVkVEKSB7XG4gICAgICAgICg8YW55W10+KHRoaXMgYXMgYW55KVtzeW1ib2xWYWx1ZV0pLnB1c2goem9uZSwgY2hhaW5Qcm9taXNlLCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY2hlZHVsZVJlc29sdmVPclJlamVjdCh0aGlzLCB6b25lLCBjaGFpblByb21pc2UgYXMgYW55LCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2hhaW5Qcm9taXNlO1xuICAgIH1cblxuICAgIGNhdGNoPFRSZXN1bHQgPSBuZXZlcj4ob25SZWplY3RlZD86ICgocmVhc29uOiBhbnkpID0+IFRSZXN1bHQgfCBQcm9taXNlTGlrZTxUUmVzdWx0Pil8dW5kZWZpbmVkfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCk6IFByb21pc2U8UnxUUmVzdWx0PiB7XG4gICAgICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0ZWQpO1xuICAgIH1cblxuICAgIGZpbmFsbHk8VT4ob25GaW5hbGx5PzogKCkgPT4gVSB8IFByb21pc2VMaWtlPFU+KTogUHJvbWlzZTxSPiB7XG4gICAgICBjb25zdCBjaGFpblByb21pc2U6IFByb21pc2U8UnxuZXZlcj4gPVxuICAgICAgICAgIG5ldyAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgWm9uZUF3YXJlUHJvbWlzZSkobnVsbCBhcyBhbnkpO1xuICAgICAgKGNoYWluUHJvbWlzZSBhcyBhbnkpW3N5bWJvbEZpbmFsbHldID0gc3ltYm9sRmluYWxseTtcbiAgICAgIGNvbnN0IHpvbmUgPSBab25lLmN1cnJlbnQ7XG4gICAgICBpZiAoKHRoaXMgYXMgYW55KVtzeW1ib2xTdGF0ZV0gPT0gVU5SRVNPTFZFRCkge1xuICAgICAgICAoPGFueVtdPih0aGlzIGFzIGFueSlbc3ltYm9sVmFsdWVdKS5wdXNoKHpvbmUsIGNoYWluUHJvbWlzZSwgb25GaW5hbGx5LCBvbkZpbmFsbHkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NoZWR1bGVSZXNvbHZlT3JSZWplY3QodGhpcywgem9uZSwgY2hhaW5Qcm9taXNlIGFzIGFueSwgb25GaW5hbGx5LCBvbkZpbmFsbHkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYWluUHJvbWlzZTtcbiAgICB9XG4gIH1cbiAgLy8gUHJvdGVjdCBhZ2FpbnN0IGFnZ3Jlc3NpdmUgb3B0aW1pemVycyBkcm9wcGluZyBzZWVtaW5nbHkgdW51c2VkIHByb3BlcnRpZXMuXG4gIC8vIEUuZy4gQ2xvc3VyZSBDb21waWxlciBpbiBhZHZhbmNlZCBtb2RlLlxuICBab25lQXdhcmVQcm9taXNlWydyZXNvbHZlJ10gPSBab25lQXdhcmVQcm9taXNlLnJlc29sdmU7XG4gIFpvbmVBd2FyZVByb21pc2VbJ3JlamVjdCddID0gWm9uZUF3YXJlUHJvbWlzZS5yZWplY3Q7XG4gIFpvbmVBd2FyZVByb21pc2VbJ3JhY2UnXSA9IFpvbmVBd2FyZVByb21pc2UucmFjZTtcbiAgWm9uZUF3YXJlUHJvbWlzZVsnYWxsJ10gPSBab25lQXdhcmVQcm9taXNlLmFsbDtcblxuICBjb25zdCBOYXRpdmVQcm9taXNlID0gZ2xvYmFsW3N5bWJvbFByb21pc2VdID0gZ2xvYmFsWydQcm9taXNlJ107XG4gIGNvbnN0IFpPTkVfQVdBUkVfUFJPTUlTRSA9IFpvbmUuX19zeW1ib2xfXygnWm9uZUF3YXJlUHJvbWlzZScpO1xuXG4gIGxldCBkZXNjID0gT2JqZWN0R2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGdsb2JhbCwgJ1Byb21pc2UnKTtcbiAgaWYgKCFkZXNjIHx8IGRlc2MuY29uZmlndXJhYmxlKSB7XG4gICAgZGVzYyAmJiBkZWxldGUgZGVzYy53cml0YWJsZTtcbiAgICBkZXNjICYmIGRlbGV0ZSBkZXNjLnZhbHVlO1xuICAgIGlmICghZGVzYykge1xuICAgICAgZGVzYyA9IHtjb25maWd1cmFibGU6IHRydWUsIGVudW1lcmFibGU6IHRydWV9O1xuICAgIH1cbiAgICBkZXNjLmdldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gaWYgd2UgYWxyZWFkeSBzZXQgWm9uZUF3YXJlUHJvbWlzZSwgdXNlIHBhdGNoZWQgb25lXG4gICAgICAvLyBvdGhlcndpc2UgcmV0dXJuIG5hdGl2ZSBvbmUuXG4gICAgICByZXR1cm4gZ2xvYmFsW1pPTkVfQVdBUkVfUFJPTUlTRV0gPyBnbG9iYWxbWk9ORV9BV0FSRV9QUk9NSVNFXSA6IGdsb2JhbFtzeW1ib2xQcm9taXNlXTtcbiAgICB9O1xuICAgIGRlc2Muc2V0ID0gZnVuY3Rpb24oTmV3TmF0aXZlUHJvbWlzZSkge1xuICAgICAgaWYgKE5ld05hdGl2ZVByb21pc2UgPT09IFpvbmVBd2FyZVByb21pc2UpIHtcbiAgICAgICAgLy8gaWYgdGhlIE5ld05hdGl2ZVByb21pc2UgaXMgWm9uZUF3YXJlUHJvbWlzZVxuICAgICAgICAvLyBzYXZlIHRvIGdsb2JhbFxuICAgICAgICBnbG9iYWxbWk9ORV9BV0FSRV9QUk9NSVNFXSA9IE5ld05hdGl2ZVByb21pc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBpZiB0aGUgTmV3TmF0aXZlUHJvbWlzZSBpcyBub3QgWm9uZUF3YXJlUHJvbWlzZVxuICAgICAgICAvLyBmb3IgZXhhbXBsZTogYWZ0ZXIgbG9hZCB6b25lLmpzLCBzb21lIGxpYnJhcnkganVzdFxuICAgICAgICAvLyBzZXQgZXM2LXByb21pc2UgdG8gZ2xvYmFsLCBpZiB3ZSBzZXQgaXQgdG8gZ2xvYmFsXG4gICAgICAgIC8vIGRpcmVjdGx5LCBhc3NlcnRab25lUGF0Y2hlZCB3aWxsIGZhaWwgYW5kIGFuZ3VsYXJcbiAgICAgICAgLy8gd2lsbCBub3QgbG9hZGVkLCBzbyB3ZSBqdXN0IHNldCB0aGUgTmV3TmF0aXZlUHJvbWlzZVxuICAgICAgICAvLyB0byBnbG9iYWxbc3ltYm9sUHJvbWlzZV0sIHNvIHRoZSByZXN1bHQgaXMganVzdCBsaWtlXG4gICAgICAgIC8vIHdlIGxvYWQgRVM2IFByb21pc2UgYmVmb3JlIHpvbmUuanNcbiAgICAgICAgZ2xvYmFsW3N5bWJvbFByb21pc2VdID0gTmV3TmF0aXZlUHJvbWlzZTtcbiAgICAgICAgaWYgKCFOZXdOYXRpdmVQcm9taXNlLnByb3RvdHlwZVtzeW1ib2xUaGVuXSkge1xuICAgICAgICAgIHBhdGNoVGhlbihOZXdOYXRpdmVQcm9taXNlKTtcbiAgICAgICAgfVxuICAgICAgICBhcGkuc2V0TmF0aXZlUHJvbWlzZShOZXdOYXRpdmVQcm9taXNlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgT2JqZWN0RGVmaW5lUHJvcGVydHkoZ2xvYmFsLCAnUHJvbWlzZScsIGRlc2MpO1xuICB9XG5cbiAgZ2xvYmFsWydQcm9taXNlJ10gPSBab25lQXdhcmVQcm9taXNlO1xuXG4gIGNvbnN0IHN5bWJvbFRoZW5QYXRjaGVkID0gX19zeW1ib2xfXygndGhlblBhdGNoZWQnKTtcblxuICBmdW5jdGlvbiBwYXRjaFRoZW4oQ3RvcjogRnVuY3Rpb24pIHtcbiAgICBjb25zdCBwcm90byA9IEN0b3IucHJvdG90eXBlO1xuXG4gICAgY29uc3QgcHJvcCA9IE9iamVjdEdldE93blByb3BlcnR5RGVzY3JpcHRvcihwcm90bywgJ3RoZW4nKTtcbiAgICBpZiAocHJvcCAmJiAocHJvcC53cml0YWJsZSA9PT0gZmFsc2UgfHwgIXByb3AuY29uZmlndXJhYmxlKSkge1xuICAgICAgLy8gY2hlY2sgQ3Rvci5wcm90b3R5cGUudGhlbiBwcm9wZXJ0eURlc2NyaXB0b3IgaXMgd3JpdGFibGUgb3Igbm90XG4gICAgICAvLyBpbiBtZXRlb3IgZW52LCB3cml0YWJsZSBpcyBmYWxzZSwgd2Ugc2hvdWxkIGlnbm9yZSBzdWNoIGNhc2VcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvcmlnaW5hbFRoZW4gPSBwcm90by50aGVuO1xuICAgIC8vIEtlZXAgYSByZWZlcmVuY2UgdG8gdGhlIG9yaWdpbmFsIG1ldGhvZC5cbiAgICBwcm90b1tzeW1ib2xUaGVuXSA9IG9yaWdpbmFsVGhlbjtcblxuICAgIEN0b3IucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbihvblJlc29sdmU6IGFueSwgb25SZWplY3Q6IGFueSkge1xuICAgICAgY29uc3Qgd3JhcHBlZCA9XG4gICAgICAgICAgbmV3IFpvbmVBd2FyZVByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4geyBvcmlnaW5hbFRoZW4uY2FsbCh0aGlzLCByZXNvbHZlLCByZWplY3QpOyB9KTtcbiAgICAgIHJldHVybiB3cmFwcGVkLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XG4gICAgfTtcbiAgICAoQ3RvciBhcyBhbnkpW3N5bWJvbFRoZW5QYXRjaGVkXSA9IHRydWU7XG4gIH1cblxuICBhcGkucGF0Y2hUaGVuID0gcGF0Y2hUaGVuO1xuXG4gIGZ1bmN0aW9uIHpvbmVpZnkoZm46IEZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHRoaXM6IHVua25vd24pIHtcbiAgICAgIGxldCByZXN1bHRQcm9taXNlID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGlmIChyZXN1bHRQcm9taXNlIGluc3RhbmNlb2YgWm9uZUF3YXJlUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gcmVzdWx0UHJvbWlzZTtcbiAgICAgIH1cbiAgICAgIGxldCBjdG9yID0gcmVzdWx0UHJvbWlzZS5jb25zdHJ1Y3RvcjtcbiAgICAgIGlmICghY3RvcltzeW1ib2xUaGVuUGF0Y2hlZF0pIHtcbiAgICAgICAgcGF0Y2hUaGVuKGN0b3IpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdFByb21pc2U7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChOYXRpdmVQcm9taXNlKSB7XG4gICAgcGF0Y2hUaGVuKE5hdGl2ZVByb21pc2UpO1xuICAgIGNvbnN0IGZldGNoID0gZ2xvYmFsWydmZXRjaCddO1xuICAgIGlmICh0eXBlb2YgZmV0Y2ggPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZ2xvYmFsW2FwaS5zeW1ib2woJ2ZldGNoJyldID0gZmV0Y2g7XG4gICAgICBnbG9iYWxbJ2ZldGNoJ10gPSB6b25laWZ5KGZldGNoKTtcbiAgICB9XG4gIH1cblxuICAvLyBUaGlzIGlzIG5vdCBwYXJ0IG9mIHB1YmxpYyBBUEksIGJ1dCBpdCBpcyB1c2VmdWwgZm9yIHRlc3RzLCBzbyB3ZSBleHBvc2UgaXQuXG4gIChQcm9taXNlIGFzIGFueSlbWm9uZS5fX3N5bWJvbF9fKCd1bmNhdWdodFByb21pc2VFcnJvcnMnKV0gPSBfdW5jYXVnaHRQcm9taXNlRXJyb3JzO1xuICByZXR1cm4gWm9uZUF3YXJlUHJvbWlzZTtcbn0pO1xuIl19