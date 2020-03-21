(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("angular/packages/zone.js/lib/testing/fake-async", ["require", "exports", "../zone-spec/fake-async-test"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    require("../zone-spec/fake-async-test");
    Zone.__load_patch('fakeasync', function (global, Zone, api) {
        var FakeAsyncTestZoneSpec = Zone && Zone['FakeAsyncTestZoneSpec'];
        var ProxyZoneSpec = Zone && Zone['ProxyZoneSpec'];
        var _fakeAsyncTestZoneSpec = null;
        /**
         * Clears out the shared fake async zone for a test.
         * To be called in a global `beforeEach`.
         *
         * @experimental
         */
        function resetFakeAsyncZone() {
            if (_fakeAsyncTestZoneSpec) {
                _fakeAsyncTestZoneSpec.unlockDatePatch();
            }
            _fakeAsyncTestZoneSpec = null;
            // in node.js testing we may not have ProxyZoneSpec in which case there is nothing to reset.
            ProxyZoneSpec && ProxyZoneSpec.assertPresent().resetDelegate();
        }
        /**
         * Wraps a function to be executed in the fakeAsync zone:
         * - microtasks are manually executed by calling `flushMicrotasks()`,
         * - timers are synchronous, `tick()` simulates the asynchronous passage of time.
         *
         * If there are any pending timers at the end of the function, an exception will be thrown.
         *
         * Can be used to wrap inject() calls.
         *
         * ## Example
         *
         * {@example core/testing/ts/fake_async.ts region='basic'}
         *
         * @param fn
         * @returns The function wrapped to be executed in the fakeAsync zone
         *
         * @experimental
         */
        function fakeAsync(fn) {
            // Not using an arrow function to preserve context passed from call site
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var proxyZoneSpec = ProxyZoneSpec.assertPresent();
                if (Zone.current.get('FakeAsyncTestZoneSpec')) {
                    throw new Error('fakeAsync() calls can not be nested');
                }
                try {
                    // in case jasmine.clock init a fakeAsyncTestZoneSpec
                    if (!_fakeAsyncTestZoneSpec) {
                        if (proxyZoneSpec.getDelegate() instanceof FakeAsyncTestZoneSpec) {
                            throw new Error('fakeAsync() calls can not be nested');
                        }
                        _fakeAsyncTestZoneSpec = new FakeAsyncTestZoneSpec();
                    }
                    var res = void 0;
                    var lastProxyZoneSpec = proxyZoneSpec.getDelegate();
                    proxyZoneSpec.setDelegate(_fakeAsyncTestZoneSpec);
                    _fakeAsyncTestZoneSpec.lockDatePatch();
                    try {
                        res = fn.apply(this, args);
                        flushMicrotasks();
                    }
                    finally {
                        proxyZoneSpec.setDelegate(lastProxyZoneSpec);
                    }
                    if (_fakeAsyncTestZoneSpec.pendingPeriodicTimers.length > 0) {
                        throw new Error(_fakeAsyncTestZoneSpec.pendingPeriodicTimers.length + " " +
                            "periodic timer(s) still in the queue.");
                    }
                    if (_fakeAsyncTestZoneSpec.pendingTimers.length > 0) {
                        throw new Error(_fakeAsyncTestZoneSpec.pendingTimers.length + " timer(s) still in the queue.");
                    }
                    return res;
                }
                finally {
                    resetFakeAsyncZone();
                }
            };
        }
        function _getFakeAsyncZoneSpec() {
            if (_fakeAsyncTestZoneSpec == null) {
                _fakeAsyncTestZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
                if (_fakeAsyncTestZoneSpec == null) {
                    throw new Error('The code should be running in the fakeAsync zone to call this function');
                }
            }
            return _fakeAsyncTestZoneSpec;
        }
        /**
         * Simulates the asynchronous passage of time for the timers in the fakeAsync zone.
         *
         * The microtasks queue is drained at the very start of this function and after any timer callback
         * has been executed.
         *
         * ## Example
         *
         * {@example core/testing/ts/fake_async.ts region='basic'}
         *
         * @experimental
         */
        function tick(millis) {
            if (millis === void 0) { millis = 0; }
            _getFakeAsyncZoneSpec().tick(millis);
        }
        /**
         * Simulates the asynchronous passage of time for the timers in the fakeAsync zone by
         * draining the macrotask queue until it is empty. The returned value is the milliseconds
         * of time that would have been elapsed.
         *
         * @param maxTurns
         * @returns The simulated time elapsed, in millis.
         *
         * @experimental
         */
        function flush(maxTurns) { return _getFakeAsyncZoneSpec().flush(maxTurns); }
        /**
         * Discard all remaining periodic tasks.
         *
         * @experimental
         */
        function discardPeriodicTasks() {
            var zoneSpec = _getFakeAsyncZoneSpec();
            var pendingTimers = zoneSpec.pendingPeriodicTimers;
            zoneSpec.pendingPeriodicTimers.length = 0;
        }
        /**
         * Flush any pending microtasks.
         *
         * @experimental
         */
        function flushMicrotasks() { _getFakeAsyncZoneSpec().flushMicrotasks(); }
        Zone[api.symbol('fakeAsyncTest')] = {
            resetFakeAsyncZone: resetFakeAsyncZone, flushMicrotasks: flushMicrotasks, discardPeriodicTasks: discardPeriodicTasks, tick: tick, flush: flush, fakeAsync: fakeAsync
        };
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZS1hc3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3pvbmUuanMvbGliL3Rlc3RpbmcvZmFrZS1hc3luYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILHdDQUFzQztJQUV0QyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxVQUFDLE1BQVcsRUFBRSxJQUFjLEVBQUUsR0FBaUI7UUFDNUUsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLElBQUssSUFBWSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFJN0UsSUFBTSxhQUFhLEdBQ2YsSUFBSSxJQUFLLElBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUUzQyxJQUFJLHNCQUFzQixHQUFRLElBQUksQ0FBQztRQUV2Qzs7Ozs7V0FLRztRQUNILFNBQVMsa0JBQWtCO1lBQ3pCLElBQUksc0JBQXNCLEVBQUU7Z0JBQzFCLHNCQUFzQixDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQzFDO1lBQ0Qsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO1lBQzlCLDRGQUE0RjtZQUM1RixhQUFhLElBQUksYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ2pFLENBQUM7UUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7V0FpQkc7UUFDSCxTQUFTLFNBQVMsQ0FBQyxFQUFZO1lBQzdCLHdFQUF3RTtZQUN4RSxPQUFPO2dCQUF3QixjQUFjO3FCQUFkLFVBQWMsRUFBZCxxQkFBYyxFQUFkLElBQWM7b0JBQWQseUJBQWM7O2dCQUMzQyxJQUFNLGFBQWEsR0FBRyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3BELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsRUFBRTtvQkFDN0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO2lCQUN4RDtn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KlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAnLi4vem9uZS1zcGVjL2Zha2UtYXN5bmMtdGVzdCc7XG5cblpvbmUuX19sb2FkX3BhdGNoKCdmYWtlYXN5bmMnLCAoZ2xvYmFsOiBhbnksIFpvbmU6IFpvbmVUeXBlLCBhcGk6IF9ab25lUHJpdmF0ZSkgPT4ge1xuICBjb25zdCBGYWtlQXN5bmNUZXN0Wm9uZVNwZWMgPSBab25lICYmIChab25lIGFzIGFueSlbJ0Zha2VBc3luY1Rlc3Rab25lU3BlYyddO1xuICB0eXBlIFByb3h5Wm9uZVNwZWMgPSB7XG4gICAgc2V0RGVsZWdhdGUoZGVsZWdhdGVTcGVjOiBab25lU3BlYyk6IHZvaWQ7IGdldERlbGVnYXRlKCk6IFpvbmVTcGVjOyByZXNldERlbGVnYXRlKCk6IHZvaWQ7XG4gIH07XG4gIGNvbnN0IFByb3h5Wm9uZVNwZWM6IHtnZXQoKTogUHJveHlab25lU3BlYzsgYXNzZXJ0UHJlc2VudDogKCkgPT4gUHJveHlab25lU3BlY30gPVxuICAgICAgWm9uZSAmJiAoWm9uZSBhcyBhbnkpWydQcm94eVpvbmVTcGVjJ107XG5cbiAgbGV0IF9mYWtlQXN5bmNUZXN0Wm9uZVNwZWM6IGFueSA9IG51bGw7XG5cbiAgLyoqXG4gICAqIENsZWFycyBvdXQgdGhlIHNoYXJlZCBmYWtlIGFzeW5jIHpvbmUgZm9yIGEgdGVzdC5cbiAgICogVG8gYmUgY2FsbGVkIGluIGEgZ2xvYmFsIGBiZWZvcmVFYWNoYC5cbiAgICpcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKi9cbiAgZnVuY3Rpb24gcmVzZXRGYWtlQXN5bmNab25lKCkge1xuICAgIGlmIChfZmFrZUFzeW5jVGVzdFpvbmVTcGVjKSB7XG4gICAgICBfZmFrZUFzeW5jVGVzdFpvbmVTcGVjLnVubG9ja0RhdGVQYXRjaCgpO1xuICAgIH1cbiAgICBfZmFrZUFzeW5jVGVzdFpvbmVTcGVjID0gbnVsbDtcbiAgICAvLyBpbiBub2RlLmpzIHRlc3Rpbmcgd2UgbWF5IG5vdCBoYXZlIFByb3h5Wm9uZVNwZWMgaW4gd2hpY2ggY2FzZSB0aGVyZSBpcyBub3RoaW5nIHRvIHJlc2V0LlxuICAgIFByb3h5Wm9uZVNwZWMgJiYgUHJveHlab25lU3BlYy5hc3NlcnRQcmVzZW50KCkucmVzZXREZWxlZ2F0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdyYXBzIGEgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgaW4gdGhlIGZha2VBc3luYyB6b25lOlxuICAgKiAtIG1pY3JvdGFza3MgYXJlIG1hbnVhbGx5IGV4ZWN1dGVkIGJ5IGNhbGxpbmcgYGZsdXNoTWljcm90YXNrcygpYCxcbiAgICogLSB0aW1lcnMgYXJlIHN5bmNocm9ub3VzLCBgdGljaygpYCBzaW11bGF0ZXMgdGhlIGFzeW5jaHJvbm91cyBwYXNzYWdlIG9mIHRpbWUuXG4gICAqXG4gICAqIElmIHRoZXJlIGFyZSBhbnkgcGVuZGluZyB0aW1lcnMgYXQgdGhlIGVuZCBvZiB0aGUgZnVuY3Rpb24sIGFuIGV4Y2VwdGlvbiB3aWxsIGJlIHRocm93bi5cbiAgICpcbiAgICogQ2FuIGJlIHVzZWQgdG8gd3JhcCBpbmplY3QoKSBjYWxscy5cbiAgICpcbiAgICogIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgY29yZS90ZXN0aW5nL3RzL2Zha2VfYXN5bmMudHMgcmVnaW9uPSdiYXNpYyd9XG4gICAqXG4gICAqIEBwYXJhbSBmblxuICAgKiBAcmV0dXJucyBUaGUgZnVuY3Rpb24gd3JhcHBlZCB0byBiZSBleGVjdXRlZCBpbiB0aGUgZmFrZUFzeW5jIHpvbmVcbiAgICpcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKi9cbiAgZnVuY3Rpb24gZmFrZUFzeW5jKGZuOiBGdW5jdGlvbik6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55IHtcbiAgICAvLyBOb3QgdXNpbmcgYW4gYXJyb3cgZnVuY3Rpb24gdG8gcHJlc2VydmUgY29udGV4dCBwYXNzZWQgZnJvbSBjYWxsIHNpdGVcbiAgICByZXR1cm4gZnVuY3Rpb24odGhpczogdW5rbm93biwgLi4uYXJnczogYW55W10pIHtcbiAgICAgIGNvbnN0IHByb3h5Wm9uZVNwZWMgPSBQcm94eVpvbmVTcGVjLmFzc2VydFByZXNlbnQoKTtcbiAgICAgIGlmIChab25lLmN1cnJlbnQuZ2V0KCdGYWtlQXN5bmNUZXN0Wm9uZVNwZWMnKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Zha2VBc3luYygpIGNhbGxzIGNhbiBub3QgYmUgbmVzdGVkJyk7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICAvLyBpbiBjYXNlIGphc21pbmUuY2xvY2sgaW5pdCBhIGZha2VBc3luY1Rlc3Rab25lU3BlY1xuICAgICAgICBpZiAoIV9mYWtlQXN5bmNUZXN0Wm9uZVNwZWMpIHtcbiAgICAgICAgICBpZiAocHJveHlab25lU3BlYy5nZXREZWxlZ2F0ZSgpIGluc3RhbmNlb2YgRmFrZUFzeW5jVGVzdFpvbmVTcGVjKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Zha2VBc3luYygpIGNhbGxzIGNhbiBub3QgYmUgbmVzdGVkJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgX2Zha2VBc3luY1Rlc3Rab25lU3BlYyA9IG5ldyBGYWtlQXN5bmNUZXN0Wm9uZVNwZWMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCByZXM6IGFueTtcbiAgICAgICAgY29uc3QgbGFzdFByb3h5Wm9uZVNwZWMgPSBwcm94eVpvbmVTcGVjLmdldERlbGVnYXRlKCk7XG4gICAgICAgIHByb3h5Wm9uZVNwZWMuc2V0RGVsZWdhdGUoX2Zha2VBc3luY1Rlc3Rab25lU3BlYyk7XG4gICAgICAgIF9mYWtlQXN5bmNUZXN0Wm9uZVNwZWMubG9ja0RhdGVQYXRjaCgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlcyA9IGZuLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIGZsdXNoTWljcm90YXNrcygpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHByb3h5Wm9uZVNwZWMuc2V0RGVsZWdhdGUobGFzdFByb3h5Wm9uZVNwZWMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9mYWtlQXN5bmNUZXN0Wm9uZVNwZWMucGVuZGluZ1BlcmlvZGljVGltZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGAke19mYWtlQXN5bmNUZXN0Wm9uZVNwZWMucGVuZGluZ1BlcmlvZGljVGltZXJzLmxlbmd0aH0gYCArXG4gICAgICAgICAgICAgIGBwZXJpb2RpYyB0aW1lcihzKSBzdGlsbCBpbiB0aGUgcXVldWUuYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX2Zha2VBc3luY1Rlc3Rab25lU3BlYy5wZW5kaW5nVGltZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGAke19mYWtlQXN5bmNUZXN0Wm9uZVNwZWMucGVuZGluZ1RpbWVycy5sZW5ndGh9IHRpbWVyKHMpIHN0aWxsIGluIHRoZSBxdWV1ZS5gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgcmVzZXRGYWtlQXN5bmNab25lKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9nZXRGYWtlQXN5bmNab25lU3BlYygpOiBhbnkge1xuICAgIGlmIChfZmFrZUFzeW5jVGVzdFpvbmVTcGVjID09IG51bGwpIHtcbiAgICAgIF9mYWtlQXN5bmNUZXN0Wm9uZVNwZWMgPSBab25lLmN1cnJlbnQuZ2V0KCdGYWtlQXN5bmNUZXN0Wm9uZVNwZWMnKTtcbiAgICAgIGlmIChfZmFrZUFzeW5jVGVzdFpvbmVTcGVjID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgY29kZSBzaG91bGQgYmUgcnVubmluZyBpbiB0aGUgZmFrZUFzeW5jIHpvbmUgdG8gY2FsbCB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfZmFrZUFzeW5jVGVzdFpvbmVTcGVjO1xuICB9XG5cbiAgLyoqXG4gICAqIFNpbXVsYXRlcyB0aGUgYXN5bmNocm9ub3VzIHBhc3NhZ2Ugb2YgdGltZSBmb3IgdGhlIHRpbWVycyBpbiB0aGUgZmFrZUFzeW5jIHpvbmUuXG4gICAqXG4gICAqIFRoZSBtaWNyb3Rhc2tzIHF1ZXVlIGlzIGRyYWluZWQgYXQgdGhlIHZlcnkgc3RhcnQgb2YgdGhpcyBmdW5jdGlvbiBhbmQgYWZ0ZXIgYW55IHRpbWVyIGNhbGxiYWNrXG4gICAqIGhhcyBiZWVuIGV4ZWN1dGVkLlxuICAgKlxuICAgKiAjIyBFeGFtcGxlXG4gICAqXG4gICAqIHtAZXhhbXBsZSBjb3JlL3Rlc3RpbmcvdHMvZmFrZV9hc3luYy50cyByZWdpb249J2Jhc2ljJ31cbiAgICpcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKi9cbiAgZnVuY3Rpb24gdGljayhtaWxsaXM6IG51bWJlciA9IDApOiB2b2lkIHsgX2dldEZha2VBc3luY1pvbmVTcGVjKCkudGljayhtaWxsaXMpOyB9XG5cbiAgLyoqXG4gICAqIFNpbXVsYXRlcyB0aGUgYXN5bmNocm9ub3VzIHBhc3NhZ2Ugb2YgdGltZSBmb3IgdGhlIHRpbWVycyBpbiB0aGUgZmFrZUFzeW5jIHpvbmUgYnlcbiAgICogZHJhaW5pbmcgdGhlIG1hY3JvdGFzayBxdWV1ZSB1bnRpbCBpdCBpcyBlbXB0eS4gVGhlIHJldHVybmVkIHZhbHVlIGlzIHRoZSBtaWxsaXNlY29uZHNcbiAgICogb2YgdGltZSB0aGF0IHdvdWxkIGhhdmUgYmVlbiBlbGFwc2VkLlxuICAgKlxuICAgKiBAcGFyYW0gbWF4VHVybnNcbiAgICogQHJldHVybnMgVGhlIHNpbXVsYXRlZCB0aW1lIGVsYXBzZWQsIGluIG1pbGxpcy5cbiAgICpcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKi9cbiAgZnVuY3Rpb24gZmx1c2gobWF4VHVybnM/OiBudW1iZXIpOiBudW1iZXIgeyByZXR1cm4gX2dldEZha2VBc3luY1pvbmVTcGVjKCkuZmx1c2gobWF4VHVybnMpOyB9XG5cbiAgLyoqXG4gICAqIERpc2NhcmQgYWxsIHJlbWFpbmluZyBwZXJpb2RpYyB0YXNrcy5cbiAgICpcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKi9cbiAgZnVuY3Rpb24gZGlzY2FyZFBlcmlvZGljVGFza3MoKTogdm9pZCB7XG4gICAgY29uc3Qgem9uZVNwZWMgPSBfZ2V0RmFrZUFzeW5jWm9uZVNwZWMoKTtcbiAgICBjb25zdCBwZW5kaW5nVGltZXJzID0gem9uZVNwZWMucGVuZGluZ1BlcmlvZGljVGltZXJzO1xuICAgIHpvbmVTcGVjLnBlbmRpbmdQZXJpb2RpY1RpbWVycy5sZW5ndGggPSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEZsdXNoIGFueSBwZW5kaW5nIG1pY3JvdGFza3MuXG4gICAqXG4gICAqIEBleHBlcmltZW50YWxcbiAgICovXG4gIGZ1bmN0aW9uIGZsdXNoTWljcm90YXNrcygpOiB2b2lkIHsgX2dldEZha2VBc3luY1pvbmVTcGVjKCkuZmx1c2hNaWNyb3Rhc2tzKCk7IH1cbiAgKFpvbmUgYXMgYW55KVthcGkuc3ltYm9sKCdmYWtlQXN5bmNUZXN0JyldID0ge1xuICAgICAgcmVzZXRGYWtlQXN5bmNab25lLCBmbHVzaE1pY3JvdGFza3MsIGRpc2NhcmRQZXJpb2RpY1Rhc2tzLCB0aWNrLCBmbHVzaCwgZmFrZUFzeW5jfTtcbn0pO1xuIl19