/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="jasmine"/>
'use strict';
(function (_global) {
    var __extends = function (d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
    // Patch jasmine's describe/it/beforeEach/afterEach functions so test code always runs
    // in a testZone (ProxyZone). (See: angular/zone.js#91 & angular/angular#10503)
    if (!Zone)
        throw new Error('Missing: zone.js');
    if (typeof jasmine == 'undefined')
        throw new Error('Missing: jasmine.js');
    if (jasmine['__zone_patch__'])
        throw new Error("'jasmine' has already been patched with 'Zone'.");
    jasmine['__zone_patch__'] = true;
    var SyncTestZoneSpec = Zone['SyncTestZoneSpec'];
    var ProxyZoneSpec = Zone['ProxyZoneSpec'];
    if (!SyncTestZoneSpec)
        throw new Error('Missing: SyncTestZoneSpec');
    if (!ProxyZoneSpec)
        throw new Error('Missing: ProxyZoneSpec');
    var ambientZone = Zone.current;
    // Create a synchronous-only zone in which to run `describe` blocks in order to raise an
    // error if any asynchronous operations are attempted inside of a `describe` but outside of
    // a `beforeEach` or `it`.
    var syncZone = ambientZone.fork(new SyncTestZoneSpec('jasmine.describe'));
    var symbol = Zone.__symbol__;
    // whether patch jasmine clock when in fakeAsync
    var disablePatchingJasmineClock = _global[symbol('fakeAsyncDisablePatchingClock')] === true;
    // the original variable name fakeAsyncPatchLock is not accurate, so the name will be
    // fakeAsyncAutoFakeAsyncWhenClockPatched and if this enablePatchingJasmineClock is false, we also
    // automatically disable the auto jump into fakeAsync feature
    var enableAutoFakeAsyncWhenClockPatched = !disablePatchingJasmineClock &&
        ((_global[symbol('fakeAsyncPatchLock')] === true) ||
            (_global[symbol('fakeAsyncAutoFakeAsyncWhenClockPatched')] === true));
    var ignoreUnhandledRejection = _global[symbol('ignoreUnhandledRejection')] === true;
    if (!ignoreUnhandledRejection) {
        var globalErrors_1 = jasmine.GlobalErrors;
        if (globalErrors_1 && !jasmine[symbol('GlobalErrors')]) {
            jasmine[symbol('GlobalErrors')] = globalErrors_1;
            jasmine.GlobalErrors = function () {
                var instance = new globalErrors_1();
                var originalInstall = instance.install;
                if (originalInstall && !instance[symbol('install')]) {
                    instance[symbol('install')] = originalInstall;
                    instance.install = function () {
                        var originalHandlers = process.listeners('unhandledRejection');
                        var r = originalInstall.apply(this, arguments);
                        process.removeAllListeners('unhandledRejection');
                        if (originalHandlers) {
                            originalHandlers.forEach(function (h) { return process.on('unhandledRejection', h); });
                        }
                        return r;
                    };
                }
                return instance;
            };
        }
    }
    // Monkey patch all of the jasmine DSL so that each function runs in appropriate zone.
    var jasmineEnv = jasmine.getEnv();
    ['describe', 'xdescribe', 'fdescribe'].forEach(function (methodName) {
        var originalJasmineFn = jasmineEnv[methodName];
        jasmineEnv[methodName] = function (description, specDefinitions) {
            return originalJasmineFn.call(this, description, wrapDescribeInZone(specDefinitions));
        };
    });
    ['it', 'xit', 'fit'].forEach(function (methodName) {
        var originalJasmineFn = jasmineEnv[methodName];
        jasmineEnv[symbol(methodName)] = originalJasmineFn;
        jasmineEnv[methodName] = function (description, specDefinitions, timeout) {
            arguments[1] = wrapTestInZone(specDefinitions);
            return originalJasmineFn.apply(this, arguments);
        };
    });
    ['beforeEach', 'afterEach', 'beforeAll', 'afterAll'].forEach(function (methodName) {
        var originalJasmineFn = jasmineEnv[methodName];
        jasmineEnv[symbol(methodName)] = originalJasmineFn;
        jasmineEnv[methodName] = function (specDefinitions, timeout) {
            arguments[0] = wrapTestInZone(specDefinitions);
            return originalJasmineFn.apply(this, arguments);
        };
    });
    if (!disablePatchingJasmineClock) {
        // need to patch jasmine.clock().mockDate and jasmine.clock().tick() so
        // they can work properly in FakeAsyncTest
        var originalClockFn_1 = (jasmine[symbol('clock')] = jasmine['clock']);
        jasmine['clock'] = function () {
            var clock = originalClockFn_1.apply(this, arguments);
            if (!clock[symbol('patched')]) {
                clock[symbol('patched')] = symbol('patched');
                var originalTick_1 = (clock[symbol('tick')] = clock.tick);
                clock.tick = function () {
                    var fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
                    if (fakeAsyncZoneSpec) {
                        return fakeAsyncZoneSpec.tick.apply(fakeAsyncZoneSpec, arguments);
                    }
                    return originalTick_1.apply(this, arguments);
                };
                var originalMockDate_1 = (clock[symbol('mockDate')] = clock.mockDate);
                clock.mockDate = function () {
                    var fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
                    if (fakeAsyncZoneSpec) {
                        var dateTime = arguments.length > 0 ? arguments[0] : new Date();
                        return fakeAsyncZoneSpec.setCurrentRealTime.apply(fakeAsyncZoneSpec, dateTime && typeof dateTime.getTime === 'function' ?
                            [dateTime.getTime()] :
                            arguments);
                    }
                    return originalMockDate_1.apply(this, arguments);
                };
                // for auto go into fakeAsync feature, we need the flag to enable it
                if (enableAutoFakeAsyncWhenClockPatched) {
                    ['install', 'uninstall'].forEach(function (methodName) {
                        var originalClockFn = (clock[symbol(methodName)] = clock[methodName]);
                        clock[methodName] = function () {
                            var FakeAsyncTestZoneSpec = Zone['FakeAsyncTestZoneSpec'];
                            if (FakeAsyncTestZoneSpec) {
                                jasmine[symbol('clockInstalled')] = 'install' === methodName;
                                return;
                            }
                            return originalClockFn.apply(this, arguments);
                        };
                    });
                }
            }
            return clock;
        };
    }
    /**
     * Gets a function wrapping the body of a Jasmine `describe` block to execute in a
     * synchronous-only zone.
     */
    function wrapDescribeInZone(describeBody) {
        return function () {
            return syncZone.run(describeBody, this, arguments);
        };
    }
    function runInTestZone(testBody, applyThis, queueRunner, done) {
        var isClockInstalled = !!jasmine[symbol('clockInstalled')];
        var testProxyZoneSpec = queueRunner.testProxyZoneSpec;
        var testProxyZone = queueRunner.testProxyZone;
        var lastDelegate;
        if (isClockInstalled && enableAutoFakeAsyncWhenClockPatched) {
            // auto run a fakeAsync
            var fakeAsyncModule = Zone[Zone.__symbol__('fakeAsyncTest')];
            if (fakeAsyncModule && typeof fakeAsyncModule.fakeAsync === 'function') {
                testBody = fakeAsyncModule.fakeAsync(testBody);
            }
        }
        if (done) {
            return testProxyZone.run(testBody, applyThis, [done]);
        }
        else {
            return testProxyZone.run(testBody, applyThis);
        }
    }
    /**
     * Gets a function wrapping the body of a Jasmine `it/beforeEach/afterEach` block to
     * execute in a ProxyZone zone.
     * This will run in `testProxyZone`. The `testProxyZone` will be reset by the `ZoneQueueRunner`
     */
    function wrapTestInZone(testBody) {
        // The `done` callback is only passed through if the function expects at least one argument.
        // Note we have to make a function with correct number of arguments, otherwise jasmine will
        // think that all functions are sync or async.
        return (testBody && (testBody.length ? function (done) {
            return runInTestZone(testBody, this, this.queueRunner, done);
        } : function () {
            return runInTestZone(testBody, this, this.queueRunner);
        }));
    }
    var QueueRunner = jasmine.QueueRunner;
    jasmine.QueueRunner = (function (_super) {
        __extends(ZoneQueueRunner, _super);
        function ZoneQueueRunner(attrs) {
            var _this = this;
            if (attrs.onComplete) {
                attrs.onComplete = (function (fn) { return function () {
                    // All functions are done, clear the test zone.
                    _this.testProxyZone = null;
                    _this.testProxyZoneSpec = null;
                    ambientZone.scheduleMicroTask('jasmine.onComplete', fn);
                }; })(attrs.onComplete);
            }
            var nativeSetTimeout = _global[Zone.__symbol__('setTimeout')];
            var nativeClearTimeout = _global[Zone.__symbol__('clearTimeout')];
            if (nativeSetTimeout) {
                // should run setTimeout inside jasmine outside of zone
                attrs.timeout = {
                    setTimeout: nativeSetTimeout ? nativeSetTimeout : _global.setTimeout,
                    clearTimeout: nativeClearTimeout ? nativeClearTimeout : _global.clearTimeout
                };
            }
            // create a userContext to hold the queueRunner itself
            // so we can access the testProxy in it/xit/beforeEach ...
            if (jasmine.UserContext) {
                if (!attrs.userContext) {
                    attrs.userContext = new jasmine.UserContext();
                }
                attrs.userContext.queueRunner = this;
            }
            else {
                if (!attrs.userContext) {
                    attrs.userContext = {};
                }
                attrs.userContext.queueRunner = this;
            }
            // patch attrs.onException
            var onException = attrs.onException;
            attrs.onException = function (error) {
                if (error &&
                    error.message ===
                        'Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.') {
                    // jasmine timeout, we can make the error message more
                    // reasonable to tell what tasks are pending
                    var proxyZoneSpec = this && this.testProxyZoneSpec;
                    if (proxyZoneSpec) {
                        var pendingTasksInfo = proxyZoneSpec.getAndClearPendingTasksInfo();
                        try {
                            // try catch here in case error.message is not writable
                            error.message += pendingTasksInfo;
                        }
                        catch (err) {
                        }
                    }
                }
                if (onException) {
                    onException.call(this, error);
                }
            };
            _super.call(this, attrs);
        }
        ZoneQueueRunner.prototype.execute = function () {
            var _this = this;
            var zone = Zone.current;
            var isChildOfAmbientZone = false;
            while (zone) {
                if (zone === ambientZone) {
                    isChildOfAmbientZone = true;
                    break;
                }
                zone = zone.parent;
            }
            if (!isChildOfAmbientZone)
                throw new Error('Unexpected Zone: ' + Zone.current.name);
            // This is the zone which will be used for running individual tests.
            // It will be a proxy zone, so that the tests function can retroactively install
            // different zones.
            // Example:
            //   - In beforeEach() do childZone = Zone.current.fork(...);
            //   - In it() try to do fakeAsync(). The issue is that because the beforeEach forked the
            //     zone outside of fakeAsync it will be able to escape the fakeAsync rules.
            //   - Because ProxyZone is parent fo `childZone` fakeAsync can retroactively add
            //     fakeAsync behavior to the childZone.
            this.testProxyZoneSpec = new ProxyZoneSpec();
            this.testProxyZone = ambientZone.fork(this.testProxyZoneSpec);
            if (!Zone.currentTask) {
                // if we are not running in a task then if someone would register a
                // element.addEventListener and then calling element.click() the
                // addEventListener callback would think that it is the top most task and would
                // drain the microtask queue on element.click() which would be incorrect.
                // For this reason we always force a task when running jasmine tests.
                Zone.current.scheduleMicroTask('jasmine.execute().forceTask', function () { return QueueRunner.prototype.execute.call(_this); });
            }
            else {
                _super.prototype.execute.call(this);
            }
        };
        return ZoneQueueRunner;
    })(QueueRunner);
})(typeof window !== 'undefined' && window || typeof self !== 'undefined' && self || global);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamFzbWluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3pvbmUuanMvbGliL2phc21pbmUvamFzbWluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxnQ0FBZ0M7QUFFaEMsWUFBWSxDQUFDO0FBQ2IsQ0FBQyxVQUFDLE9BQVk7SUFDWixJQUFNLFNBQVMsR0FBRyxVQUFTLENBQU0sRUFBRSxDQUFNO1FBQ3ZDLEtBQUssSUFBTSxDQUFDLElBQUksQ0FBQztZQUNmLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QyxTQUFTLEVBQUUsS0FBaUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUssRUFBVSxFQUFFLENBQUMsQ0FBQztJQUNsRyxDQUFDLENBQUM7SUFDRixzRkFBc0Y7SUFDdEYsK0VBQStFO0lBQy9FLElBQUksQ0FBQyxJQUFJO1FBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQy9DLElBQUksT0FBTyxPQUFPLElBQUksV0FBVztRQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUMxRSxJQUFLLE9BQWUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUNwQyxNQUFNLElBQUksS0FBSyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7SUFDcEUsT0FBZSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsSUFBSSxDQUFDO0lBRTFDLElBQU0sZ0JBQWdCLEdBQW9DLElBQVksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQzNGLElBQU0sYUFBYSxHQUF3QixJQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDekUsSUFBSSxDQUFDLGdCQUFnQjtRQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUNwRSxJQUFJLENBQUMsYUFBYTtRQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUU5RCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ2pDLHdGQUF3RjtJQUN4RiwyRkFBMkY7SUFDM0YsMEJBQTBCO0lBQzFCLElBQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7SUFFNUUsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUUvQixnREFBZ0Q7SUFDaEQsSUFBTSwyQkFBMkIsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLCtCQUErQixDQUFDLENBQUMsS0FBSyxJQUFJLENBQUM7SUFDOUYscUZBQXFGO0lBQ3JGLGtHQUFrRztJQUNsRyw2REFBNkQ7SUFDN0QsSUFBTSxtQ0FBbUMsR0FBRyxDQUFDLDJCQUEyQjtRQUNwRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDO1lBQ2hELENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztJQUUzRSxJQUFNLHdCQUF3QixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQztJQUV0RixJQUFJLENBQUMsd0JBQXdCLEVBQUU7UUFDN0IsSUFBTSxjQUFZLEdBQUksT0FBZSxDQUFDLFlBQVksQ0FBQztRQUNuRCxJQUFJLGNBQVksSUFBSSxDQUFFLE9BQWUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRTtZQUM1RCxPQUFlLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsY0FBWSxDQUFDO1lBQ3ZELE9BQWUsQ0FBQyxZQUFZLEdBQUc7Z0JBQzlCLElBQU0sUUFBUSxHQUFHLElBQUksY0FBWSxFQUFFLENBQUM7Z0JBQ3BDLElBQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7Z0JBQ3pDLElBQUksZUFBZSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFO29CQUNuRCxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsZUFBZSxDQUFDO29CQUM5QyxRQUFRLENBQUMsT0FBTyxHQUFHO3dCQUNqQixJQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsQ0FBQzt3QkFDakUsSUFBTSxDQUFDLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7d0JBQ2pELE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO3dCQUNqRCxJQUFJLGdCQUFnQixFQUFFOzRCQUNwQixnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxPQUFPLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxFQUFuQyxDQUFtQyxDQUFDLENBQUM7eUJBQ3BFO3dCQUNELE9BQU8sQ0FBQyxDQUFDO29CQUNYLENBQUMsQ0FBQztpQkFDSDtnQkFDRCxPQUFPLFFBQVEsQ0FBQztZQUNsQixDQUFDLENBQUM7U0FDSDtLQUNGO0lBRUQsc0ZBQXNGO0lBQ3RGLElBQU0sVUFBVSxHQUFRLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN6QyxDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsVUFBVTtRQUN2RCxJQUFJLGlCQUFpQixHQUFhLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RCxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsVUFBUyxXQUFtQixFQUFFLGVBQXlCO1lBQzlFLE9BQU8saUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUN4RixDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUNILENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxVQUFVO1FBQ3JDLElBQUksaUJBQWlCLEdBQWEsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pELFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxpQkFBaUIsQ0FBQztRQUNuRCxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsVUFDckIsV0FBbUIsRUFBRSxlQUF5QixFQUFFLE9BQWU7WUFDakUsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMvQyxPQUFPLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDbEQsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7SUFDSCxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFVBQVU7UUFDckUsSUFBSSxpQkFBaUIsR0FBYSxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDekQsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLGlCQUFpQixDQUFDO1FBQ25ELFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxVQUFTLGVBQXlCLEVBQUUsT0FBZTtZQUMxRSxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQy9DLE9BQU8saUJBQWlCLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNsRCxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQywyQkFBMkIsRUFBRTtRQUNoQyx1RUFBdUU7UUFDdkUsMENBQTBDO1FBQzFDLElBQU0saUJBQWUsR0FBYSxDQUFFLE9BQWUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN4RixPQUFlLENBQUMsT0FBTyxDQUFDLEdBQUc7WUFDMUIsSUFBTSxLQUFLLEdBQUcsaUJBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzdDLElBQU0sY0FBWSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUQsS0FBSyxDQUFDLElBQUksR0FBRztvQkFDWCxJQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7b0JBQ3BFLElBQUksaUJBQWlCLEVBQUU7d0JBQ3JCLE9BQU8saUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLENBQUMsQ0FBQztxQkFDbkU7b0JBQ0QsT0FBTyxjQUFZLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDN0MsQ0FBQyxDQUFDO2dCQUNGLElBQU0sa0JBQWdCLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN0RSxLQUFLLENBQUMsUUFBUSxHQUFHO29CQUNmLElBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztvQkFDcEUsSUFBSSxpQkFBaUIsRUFBRTt3QkFDckIsSUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQzt3QkFDbEUsT0FBTyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQzdDLGlCQUFpQixFQUFFLFFBQVEsSUFBSSxPQUFPLFFBQVEsQ0FBQyxPQUFPLEtBQUssVUFBVSxDQUFDLENBQUM7NEJBQ25FLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQzs0QkFDdEIsU0FBUyxDQUFDLENBQUM7cUJBQ3BCO29CQUNELE9BQU8sa0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDakQsQ0FBQyxDQUFDO2dCQUNGLG9FQUFvRTtnQkFDcEUsSUFBSSxtQ0FBbUMsRUFBRTtvQkFDdkMsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsVUFBVTt3QkFDekMsSUFBTSxlQUFlLEdBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7d0JBQ2xGLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRzs0QkFDbEIsSUFBTSxxQkFBcUIsR0FBSSxJQUFZLENBQUMsdUJBQXVCLENBQUMsQ0FBQzs0QkFDckUsSUFBSSxxQkFBcUIsRUFBRTtnQ0FDeEIsT0FBZSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUcsU0FBUyxLQUFLLFVBQVUsQ0FBQztnQ0FDdEUsT0FBTzs2QkFDUjs0QkFDRCxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO3dCQUNoRCxDQUFDLENBQUM7b0JBQ0osQ0FBQyxDQUFDLENBQUM7aUJBQ0o7YUFDRjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQyxDQUFDO0tBQ0g7SUFDRDs7O09BR0c7SUFDSCxTQUFTLGtCQUFrQixDQUFDLFlBQXNCO1FBQ2hELE9BQU87WUFDTCxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRyxTQUEwQixDQUFDLENBQUM7UUFDdkUsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELFNBQVMsYUFBYSxDQUNsQixRQUFrQixFQUFFLFNBQWMsRUFBRSxXQUF3QixFQUFFLElBQWU7UUFDL0UsSUFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQUUsT0FBZSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDdEUsSUFBTSxpQkFBaUIsR0FBRyxXQUFXLENBQUMsaUJBQW1CLENBQUM7UUFDMUQsSUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDLGFBQWUsQ0FBQztRQUNsRCxJQUFJLFlBQVksQ0FBQztRQUNqQixJQUFJLGdCQUFnQixJQUFJLG1DQUFtQyxFQUFFO1lBQzNELHVCQUF1QjtZQUN2QixJQUFNLGVBQWUsR0FBSSxJQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLElBQUksZUFBZSxJQUFJLE9BQU8sZUFBZSxDQUFDLFNBQVMsS0FBSyxVQUFVLEVBQUU7Z0JBQ3RFLFFBQVEsR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ2hEO1NBQ0Y7UUFDRCxJQUFJLElBQUksRUFBRTtZQUNSLE9BQU8sYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUN2RDthQUFNO1lBQ0wsT0FBTyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUMvQztJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUyxjQUFjLENBQUMsUUFBa0I7UUFDeEMsNEZBQTRGO1FBQzVGLDJGQUEyRjtRQUMzRiw4Q0FBOEM7UUFDOUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQXVDLElBQWM7WUFDbEYsT0FBTyxhQUFhLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsV0FBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDRixPQUFPLGFBQWEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFhLENBQUMsQ0FBQztRQUMzRCxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2QsQ0FBQztJQWlCRCxJQUFNLFdBQVcsR0FBSSxPQUFlLENBQUMsV0FFcEMsQ0FBQztJQUNELE9BQWUsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxVQUFTLE1BQU07UUFDN0MsU0FBUyxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNuQyxTQUFTLGVBQWUsQ0FBb0IsS0FBdUI7WUFBbkUsaUJBMERDO1lBekRDLElBQUksS0FBSyxDQUFDLFVBQVUsRUFBRTtnQkFDcEIsS0FBSyxDQUFDLFVBQVUsR0FBRyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUE7b0JBQ3hCLCtDQUErQztvQkFDL0MsS0FBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7b0JBQzFCLEtBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7b0JBQzlCLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDMUQsQ0FBQyxFQUx5QixDQUt6QixDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3RCO1lBRUQsSUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLElBQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUNwRSxJQUFJLGdCQUFnQixFQUFFO2dCQUNwQix1REFBdUQ7Z0JBQ3ZELEtBQUssQ0FBQyxPQUFPLEdBQUc7b0JBQ2QsVUFBVSxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVU7b0JBQ3BFLFlBQVksRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZO2lCQUM3RSxDQUFDO2FBQ0g7WUFFRCxzREFBc0Q7WUFDdEQsMERBQTBEO1lBQzFELElBQUssT0FBZSxDQUFDLFdBQVcsRUFBRTtnQkFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUU7b0JBQ3RCLEtBQUssQ0FBQyxXQUFXLEdBQUcsSUFBSyxPQUFlLENBQUMsV0FBVyxFQUFFLENBQUM7aUJBQ3hEO2dCQUNELEtBQUssQ0FBQyxXQUFXLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzthQUN0QztpQkFBTTtnQkFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRTtvQkFDdEIsS0FBSyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7aUJBQ3hCO2dCQUNELEtBQUssQ0FBQyxXQUFXLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzthQUN0QztZQUVELDBCQUEwQjtZQUMxQixJQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO1lBQ3RDLEtBQUssQ0FBQyxXQUFXLEdBQUcsVUFBc0MsS0FBVTtnQkFDbEUsSUFBSSxLQUFLO29CQUNMLEtBQUssQ0FBQyxPQUFPO3dCQUNULHdHQUF3RyxFQUFFO29CQUNoSCxzREFBc0Q7b0JBQ3RELDRDQUE0QztvQkFDNUMsSUFBTSxhQUFhLEdBQVEsSUFBSSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztvQkFDMUQsSUFBSSxhQUFhLEVBQUU7d0JBQ2pCLElBQU0sZ0JBQWdCLEdBQUcsYUFBYSxDQUFDLDJCQUEyQixFQUFFLENBQUM7d0JBQ3JFLElBQUk7NEJBQ0YsdURBQXVEOzRCQUN2RCxLQUFLLENBQUMsT0FBTyxJQUFJLGdCQUFnQixDQUFDO3lCQUNuQzt3QkFBQyxPQUFPLEdBQUcsRUFBRTt5QkFDYjtxQkFDRjtpQkFDRjtnQkFDRCxJQUFJLFdBQVcsRUFBRTtvQkFDZixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDL0I7WUFDSCxDQUFDLENBQUM7WUFFRixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBQ0QsZUFBZSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUc7WUFBQSxpQkFvQ25DO1lBbkNDLElBQUksSUFBSSxHQUFjLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDbkMsSUFBSSxvQkFBb0IsR0FBRyxLQUFLLENBQUM7WUFDakMsT0FBTyxJQUFJLEVBQUU7Z0JBQ1gsSUFBSSxJQUFJLEtBQUssV0FBVyxFQUFFO29CQUN4QixvQkFBb0IsR0FBRyxJQUFJLENBQUM7b0JBQzVCLE1BQU07aUJBQ1A7Z0JBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7YUFDcEI7WUFFRCxJQUFJLENBQUMsb0JBQW9CO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVwRixvRUFBb0U7WUFDcEUsZ0ZBQWdGO1lBQ2hGLG1CQUFtQjtZQUNuQixXQUFXO1lBQ1gsNkRBQTZEO1lBQzdELHlGQUF5RjtZQUN6RiwrRUFBK0U7WUFDL0UsaUZBQWlGO1lBQ2pGLDJDQUEyQztZQUUzQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3JCLG1FQUFtRTtnQkFDbkUsZ0VBQWdFO2dCQUNoRSwrRUFBK0U7Z0JBQy9FLHlFQUF5RTtnQkFDekUscUVBQXFFO2dCQUNyRSxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUMxQiw2QkFBNkIsRUFBRSxjQUFNLE9BQUEsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxFQUF4QyxDQUF3QyxDQUFDLENBQUM7YUFDcEY7aUJBQU07Z0JBQ0wsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3JDO1FBQ0gsQ0FBQyxDQUFDO1FBQ0YsT0FBTyxlQUFlLENBQUM7SUFDekIsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbEIsQ0FBQyxDQUFDLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLE1BQU0sSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLy8gPHJlZmVyZW5jZSB0eXBlcz1cImphc21pbmVcIi8+XG5cbid1c2Ugc3RyaWN0JztcbigoX2dsb2JhbDogYW55KSA9PiB7XG4gIGNvbnN0IF9fZXh0ZW5kcyA9IGZ1bmN0aW9uKGQ6IGFueSwgYjogYW55KSB7XG4gICAgZm9yIChjb25zdCBwIGluIGIpXG4gICAgICBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07XG4gICAgZnVuY3Rpb24gX18odGhpczogT2JqZWN0KSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6ICgoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUpLCBuZXcgKF9fIGFzIGFueSkoKSk7XG4gIH07XG4gIC8vIFBhdGNoIGphc21pbmUncyBkZXNjcmliZS9pdC9iZWZvcmVFYWNoL2FmdGVyRWFjaCBmdW5jdGlvbnMgc28gdGVzdCBjb2RlIGFsd2F5cyBydW5zXG4gIC8vIGluIGEgdGVzdFpvbmUgKFByb3h5Wm9uZSkuIChTZWU6IGFuZ3VsYXIvem9uZS5qcyM5MSAmIGFuZ3VsYXIvYW5ndWxhciMxMDUwMylcbiAgaWYgKCFab25lKSB0aHJvdyBuZXcgRXJyb3IoJ01pc3Npbmc6IHpvbmUuanMnKTtcbiAgaWYgKHR5cGVvZiBqYXNtaW5lID09ICd1bmRlZmluZWQnKSB0aHJvdyBuZXcgRXJyb3IoJ01pc3Npbmc6IGphc21pbmUuanMnKTtcbiAgaWYgKChqYXNtaW5lIGFzIGFueSlbJ19fem9uZV9wYXRjaF9fJ10pXG4gICAgdGhyb3cgbmV3IEVycm9yKGAnamFzbWluZScgaGFzIGFscmVhZHkgYmVlbiBwYXRjaGVkIHdpdGggJ1pvbmUnLmApO1xuICAoamFzbWluZSBhcyBhbnkpWydfX3pvbmVfcGF0Y2hfXyddID0gdHJ1ZTtcblxuICBjb25zdCBTeW5jVGVzdFpvbmVTcGVjOiB7bmV3IChuYW1lOiBzdHJpbmcpOiBab25lU3BlY30gPSAoWm9uZSBhcyBhbnkpWydTeW5jVGVzdFpvbmVTcGVjJ107XG4gIGNvbnN0IFByb3h5Wm9uZVNwZWM6IHtuZXcgKCk6IFpvbmVTcGVjfSA9IChab25lIGFzIGFueSlbJ1Byb3h5Wm9uZVNwZWMnXTtcbiAgaWYgKCFTeW5jVGVzdFpvbmVTcGVjKSB0aHJvdyBuZXcgRXJyb3IoJ01pc3Npbmc6IFN5bmNUZXN0Wm9uZVNwZWMnKTtcbiAgaWYgKCFQcm94eVpvbmVTcGVjKSB0aHJvdyBuZXcgRXJyb3IoJ01pc3Npbmc6IFByb3h5Wm9uZVNwZWMnKTtcblxuICBjb25zdCBhbWJpZW50Wm9uZSA9IFpvbmUuY3VycmVudDtcbiAgLy8gQ3JlYXRlIGEgc3luY2hyb25vdXMtb25seSB6b25lIGluIHdoaWNoIHRvIHJ1biBgZGVzY3JpYmVgIGJsb2NrcyBpbiBvcmRlciB0byByYWlzZSBhblxuICAvLyBlcnJvciBpZiBhbnkgYXN5bmNocm9ub3VzIG9wZXJhdGlvbnMgYXJlIGF0dGVtcHRlZCBpbnNpZGUgb2YgYSBgZGVzY3JpYmVgIGJ1dCBvdXRzaWRlIG9mXG4gIC8vIGEgYGJlZm9yZUVhY2hgIG9yIGBpdGAuXG4gIGNvbnN0IHN5bmNab25lID0gYW1iaWVudFpvbmUuZm9yayhuZXcgU3luY1Rlc3Rab25lU3BlYygnamFzbWluZS5kZXNjcmliZScpKTtcblxuICBjb25zdCBzeW1ib2wgPSBab25lLl9fc3ltYm9sX187XG5cbiAgLy8gd2hldGhlciBwYXRjaCBqYXNtaW5lIGNsb2NrIHdoZW4gaW4gZmFrZUFzeW5jXG4gIGNvbnN0IGRpc2FibGVQYXRjaGluZ0phc21pbmVDbG9jayA9IF9nbG9iYWxbc3ltYm9sKCdmYWtlQXN5bmNEaXNhYmxlUGF0Y2hpbmdDbG9jaycpXSA9PT0gdHJ1ZTtcbiAgLy8gdGhlIG9yaWdpbmFsIHZhcmlhYmxlIG5hbWUgZmFrZUFzeW5jUGF0Y2hMb2NrIGlzIG5vdCBhY2N1cmF0ZSwgc28gdGhlIG5hbWUgd2lsbCBiZVxuICAvLyBmYWtlQXN5bmNBdXRvRmFrZUFzeW5jV2hlbkNsb2NrUGF0Y2hlZCBhbmQgaWYgdGhpcyBlbmFibGVQYXRjaGluZ0phc21pbmVDbG9jayBpcyBmYWxzZSwgd2UgYWxzb1xuICAvLyBhdXRvbWF0aWNhbGx5IGRpc2FibGUgdGhlIGF1dG8ganVtcCBpbnRvIGZha2VBc3luYyBmZWF0dXJlXG4gIGNvbnN0IGVuYWJsZUF1dG9GYWtlQXN5bmNXaGVuQ2xvY2tQYXRjaGVkID0gIWRpc2FibGVQYXRjaGluZ0phc21pbmVDbG9jayAmJlxuICAgICAgKChfZ2xvYmFsW3N5bWJvbCgnZmFrZUFzeW5jUGF0Y2hMb2NrJyldID09PSB0cnVlKSB8fFxuICAgICAgIChfZ2xvYmFsW3N5bWJvbCgnZmFrZUFzeW5jQXV0b0Zha2VBc3luY1doZW5DbG9ja1BhdGNoZWQnKV0gPT09IHRydWUpKTtcblxuICBjb25zdCBpZ25vcmVVbmhhbmRsZWRSZWplY3Rpb24gPSBfZ2xvYmFsW3N5bWJvbCgnaWdub3JlVW5oYW5kbGVkUmVqZWN0aW9uJyldID09PSB0cnVlO1xuXG4gIGlmICghaWdub3JlVW5oYW5kbGVkUmVqZWN0aW9uKSB7XG4gICAgY29uc3QgZ2xvYmFsRXJyb3JzID0gKGphc21pbmUgYXMgYW55KS5HbG9iYWxFcnJvcnM7XG4gICAgaWYgKGdsb2JhbEVycm9ycyAmJiAhKGphc21pbmUgYXMgYW55KVtzeW1ib2woJ0dsb2JhbEVycm9ycycpXSkge1xuICAgICAgKGphc21pbmUgYXMgYW55KVtzeW1ib2woJ0dsb2JhbEVycm9ycycpXSA9IGdsb2JhbEVycm9ycztcbiAgICAgIChqYXNtaW5lIGFzIGFueSkuR2xvYmFsRXJyb3JzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IGdsb2JhbEVycm9ycygpO1xuICAgICAgICBjb25zdCBvcmlnaW5hbEluc3RhbGwgPSBpbnN0YW5jZS5pbnN0YWxsO1xuICAgICAgICBpZiAob3JpZ2luYWxJbnN0YWxsICYmICFpbnN0YW5jZVtzeW1ib2woJ2luc3RhbGwnKV0pIHtcbiAgICAgICAgICBpbnN0YW5jZVtzeW1ib2woJ2luc3RhbGwnKV0gPSBvcmlnaW5hbEluc3RhbGw7XG4gICAgICAgICAgaW5zdGFuY2UuaW5zdGFsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxIYW5kbGVycyA9IHByb2Nlc3MubGlzdGVuZXJzKCd1bmhhbmRsZWRSZWplY3Rpb24nKTtcbiAgICAgICAgICAgIGNvbnN0IHIgPSBvcmlnaW5hbEluc3RhbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzKCd1bmhhbmRsZWRSZWplY3Rpb24nKTtcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbEhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgIG9yaWdpbmFsSGFuZGxlcnMuZm9yRWFjaChoID0+IHByb2Nlc3Mub24oJ3VuaGFuZGxlZFJlamVjdGlvbicsIGgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICAvLyBNb25rZXkgcGF0Y2ggYWxsIG9mIHRoZSBqYXNtaW5lIERTTCBzbyB0aGF0IGVhY2ggZnVuY3Rpb24gcnVucyBpbiBhcHByb3ByaWF0ZSB6b25lLlxuICBjb25zdCBqYXNtaW5lRW52OiBhbnkgPSBqYXNtaW5lLmdldEVudigpO1xuICBbJ2Rlc2NyaWJlJywgJ3hkZXNjcmliZScsICdmZGVzY3JpYmUnXS5mb3JFYWNoKG1ldGhvZE5hbWUgPT4ge1xuICAgIGxldCBvcmlnaW5hbEphc21pbmVGbjogRnVuY3Rpb24gPSBqYXNtaW5lRW52W21ldGhvZE5hbWVdO1xuICAgIGphc21pbmVFbnZbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbihkZXNjcmlwdGlvbjogc3RyaW5nLCBzcGVjRGVmaW5pdGlvbnM6IEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gb3JpZ2luYWxKYXNtaW5lRm4uY2FsbCh0aGlzLCBkZXNjcmlwdGlvbiwgd3JhcERlc2NyaWJlSW5ab25lKHNwZWNEZWZpbml0aW9ucykpO1xuICAgIH07XG4gIH0pO1xuICBbJ2l0JywgJ3hpdCcsICdmaXQnXS5mb3JFYWNoKG1ldGhvZE5hbWUgPT4ge1xuICAgIGxldCBvcmlnaW5hbEphc21pbmVGbjogRnVuY3Rpb24gPSBqYXNtaW5lRW52W21ldGhvZE5hbWVdO1xuICAgIGphc21pbmVFbnZbc3ltYm9sKG1ldGhvZE5hbWUpXSA9IG9yaWdpbmFsSmFzbWluZUZuO1xuICAgIGphc21pbmVFbnZbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbihcbiAgICAgICAgZGVzY3JpcHRpb246IHN0cmluZywgc3BlY0RlZmluaXRpb25zOiBGdW5jdGlvbiwgdGltZW91dDogbnVtYmVyKSB7XG4gICAgICBhcmd1bWVudHNbMV0gPSB3cmFwVGVzdEluWm9uZShzcGVjRGVmaW5pdGlvbnMpO1xuICAgICAgcmV0dXJuIG9yaWdpbmFsSmFzbWluZUZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfSk7XG4gIFsnYmVmb3JlRWFjaCcsICdhZnRlckVhY2gnLCAnYmVmb3JlQWxsJywgJ2FmdGVyQWxsJ10uZm9yRWFjaChtZXRob2ROYW1lID0+IHtcbiAgICBsZXQgb3JpZ2luYWxKYXNtaW5lRm46IEZ1bmN0aW9uID0gamFzbWluZUVudlttZXRob2ROYW1lXTtcbiAgICBqYXNtaW5lRW52W3N5bWJvbChtZXRob2ROYW1lKV0gPSBvcmlnaW5hbEphc21pbmVGbjtcbiAgICBqYXNtaW5lRW52W21ldGhvZE5hbWVdID0gZnVuY3Rpb24oc3BlY0RlZmluaXRpb25zOiBGdW5jdGlvbiwgdGltZW91dDogbnVtYmVyKSB7XG4gICAgICBhcmd1bWVudHNbMF0gPSB3cmFwVGVzdEluWm9uZShzcGVjRGVmaW5pdGlvbnMpO1xuICAgICAgcmV0dXJuIG9yaWdpbmFsSmFzbWluZUZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfSk7XG5cbiAgaWYgKCFkaXNhYmxlUGF0Y2hpbmdKYXNtaW5lQ2xvY2spIHtcbiAgICAvLyBuZWVkIHRvIHBhdGNoIGphc21pbmUuY2xvY2soKS5tb2NrRGF0ZSBhbmQgamFzbWluZS5jbG9jaygpLnRpY2soKSBzb1xuICAgIC8vIHRoZXkgY2FuIHdvcmsgcHJvcGVybHkgaW4gRmFrZUFzeW5jVGVzdFxuICAgIGNvbnN0IG9yaWdpbmFsQ2xvY2tGbjogRnVuY3Rpb24gPSAoKGphc21pbmUgYXMgYW55KVtzeW1ib2woJ2Nsb2NrJyldID0gamFzbWluZVsnY2xvY2snXSk7XG4gICAgKGphc21pbmUgYXMgYW55KVsnY2xvY2snXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY2xvY2sgPSBvcmlnaW5hbENsb2NrRm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGlmICghY2xvY2tbc3ltYm9sKCdwYXRjaGVkJyldKSB7XG4gICAgICAgIGNsb2NrW3N5bWJvbCgncGF0Y2hlZCcpXSA9IHN5bWJvbCgncGF0Y2hlZCcpO1xuICAgICAgICBjb25zdCBvcmlnaW5hbFRpY2sgPSAoY2xvY2tbc3ltYm9sKCd0aWNrJyldID0gY2xvY2sudGljayk7XG4gICAgICAgIGNsb2NrLnRpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjb25zdCBmYWtlQXN5bmNab25lU3BlYyA9IFpvbmUuY3VycmVudC5nZXQoJ0Zha2VBc3luY1Rlc3Rab25lU3BlYycpO1xuICAgICAgICAgIGlmIChmYWtlQXN5bmNab25lU3BlYykge1xuICAgICAgICAgICAgcmV0dXJuIGZha2VBc3luY1pvbmVTcGVjLnRpY2suYXBwbHkoZmFrZUFzeW5jWm9uZVNwZWMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBvcmlnaW5hbFRpY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxNb2NrRGF0ZSA9IChjbG9ja1tzeW1ib2woJ21vY2tEYXRlJyldID0gY2xvY2subW9ja0RhdGUpO1xuICAgICAgICBjbG9jay5tb2NrRGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNvbnN0IGZha2VBc3luY1pvbmVTcGVjID0gWm9uZS5jdXJyZW50LmdldCgnRmFrZUFzeW5jVGVzdFpvbmVTcGVjJyk7XG4gICAgICAgICAgaWYgKGZha2VBc3luY1pvbmVTcGVjKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRlVGltZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwID8gYXJndW1lbnRzWzBdIDogbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWtlQXN5bmNab25lU3BlYy5zZXRDdXJyZW50UmVhbFRpbWUuYXBwbHkoXG4gICAgICAgICAgICAgICAgZmFrZUFzeW5jWm9uZVNwZWMsIGRhdGVUaW1lICYmIHR5cGVvZiBkYXRlVGltZS5nZXRUaW1lID09PSAnZnVuY3Rpb24nID9cbiAgICAgICAgICAgICAgICAgICAgW2RhdGVUaW1lLmdldFRpbWUoKV0gOlxuICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxNb2NrRGF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgICAgICAvLyBmb3IgYXV0byBnbyBpbnRvIGZha2VBc3luYyBmZWF0dXJlLCB3ZSBuZWVkIHRoZSBmbGFnIHRvIGVuYWJsZSBpdFxuICAgICAgICBpZiAoZW5hYmxlQXV0b0Zha2VBc3luY1doZW5DbG9ja1BhdGNoZWQpIHtcbiAgICAgICAgICBbJ2luc3RhbGwnLCAndW5pbnN0YWxsJ10uZm9yRWFjaChtZXRob2ROYW1lID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsQ2xvY2tGbjogRnVuY3Rpb24gPSAoY2xvY2tbc3ltYm9sKG1ldGhvZE5hbWUpXSA9IGNsb2NrW21ldGhvZE5hbWVdKTtcbiAgICAgICAgICAgIGNsb2NrW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGNvbnN0IEZha2VBc3luY1Rlc3Rab25lU3BlYyA9IChab25lIGFzIGFueSlbJ0Zha2VBc3luY1Rlc3Rab25lU3BlYyddO1xuICAgICAgICAgICAgICBpZiAoRmFrZUFzeW5jVGVzdFpvbmVTcGVjKSB7XG4gICAgICAgICAgICAgICAgKGphc21pbmUgYXMgYW55KVtzeW1ib2woJ2Nsb2NrSW5zdGFsbGVkJyldID0gJ2luc3RhbGwnID09PSBtZXRob2ROYW1lO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxDbG9ja0ZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY2xvY2s7XG4gICAgfTtcbiAgfVxuICAvKipcbiAgICogR2V0cyBhIGZ1bmN0aW9uIHdyYXBwaW5nIHRoZSBib2R5IG9mIGEgSmFzbWluZSBgZGVzY3JpYmVgIGJsb2NrIHRvIGV4ZWN1dGUgaW4gYVxuICAgKiBzeW5jaHJvbm91cy1vbmx5IHpvbmUuXG4gICAqL1xuICBmdW5jdGlvbiB3cmFwRGVzY3JpYmVJblpvbmUoZGVzY3JpYmVCb2R5OiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICByZXR1cm4gZnVuY3Rpb24odGhpczogdW5rbm93bikge1xuICAgICAgcmV0dXJuIHN5bmNab25lLnJ1bihkZXNjcmliZUJvZHksIHRoaXMsIChhcmd1bWVudHMgYXMgYW55KSBhcyBhbnlbXSk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJ1bkluVGVzdFpvbmUoXG4gICAgICB0ZXN0Qm9keTogRnVuY3Rpb24sIGFwcGx5VGhpczogYW55LCBxdWV1ZVJ1bm5lcjogUXVldWVSdW5uZXIsIGRvbmU/OiBGdW5jdGlvbikge1xuICAgIGNvbnN0IGlzQ2xvY2tJbnN0YWxsZWQgPSAhIShqYXNtaW5lIGFzIGFueSlbc3ltYm9sKCdjbG9ja0luc3RhbGxlZCcpXTtcbiAgICBjb25zdCB0ZXN0UHJveHlab25lU3BlYyA9IHF1ZXVlUnVubmVyLnRlc3RQcm94eVpvbmVTcGVjICE7XG4gICAgY29uc3QgdGVzdFByb3h5Wm9uZSA9IHF1ZXVlUnVubmVyLnRlc3RQcm94eVpvbmUgITtcbiAgICBsZXQgbGFzdERlbGVnYXRlO1xuICAgIGlmIChpc0Nsb2NrSW5zdGFsbGVkICYmIGVuYWJsZUF1dG9GYWtlQXN5bmNXaGVuQ2xvY2tQYXRjaGVkKSB7XG4gICAgICAvLyBhdXRvIHJ1biBhIGZha2VBc3luY1xuICAgICAgY29uc3QgZmFrZUFzeW5jTW9kdWxlID0gKFpvbmUgYXMgYW55KVtab25lLl9fc3ltYm9sX18oJ2Zha2VBc3luY1Rlc3QnKV07XG4gICAgICBpZiAoZmFrZUFzeW5jTW9kdWxlICYmIHR5cGVvZiBmYWtlQXN5bmNNb2R1bGUuZmFrZUFzeW5jID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRlc3RCb2R5ID0gZmFrZUFzeW5jTW9kdWxlLmZha2VBc3luYyh0ZXN0Qm9keSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChkb25lKSB7XG4gICAgICByZXR1cm4gdGVzdFByb3h5Wm9uZS5ydW4odGVzdEJvZHksIGFwcGx5VGhpcywgW2RvbmVdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRlc3RQcm94eVpvbmUucnVuKHRlc3RCb2R5LCBhcHBseVRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgZnVuY3Rpb24gd3JhcHBpbmcgdGhlIGJvZHkgb2YgYSBKYXNtaW5lIGBpdC9iZWZvcmVFYWNoL2FmdGVyRWFjaGAgYmxvY2sgdG9cbiAgICogZXhlY3V0ZSBpbiBhIFByb3h5Wm9uZSB6b25lLlxuICAgKiBUaGlzIHdpbGwgcnVuIGluIGB0ZXN0UHJveHlab25lYC4gVGhlIGB0ZXN0UHJveHlab25lYCB3aWxsIGJlIHJlc2V0IGJ5IHRoZSBgWm9uZVF1ZXVlUnVubmVyYFxuICAgKi9cbiAgZnVuY3Rpb24gd3JhcFRlc3RJblpvbmUodGVzdEJvZHk6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICAgIC8vIFRoZSBgZG9uZWAgY2FsbGJhY2sgaXMgb25seSBwYXNzZWQgdGhyb3VnaCBpZiB0aGUgZnVuY3Rpb24gZXhwZWN0cyBhdCBsZWFzdCBvbmUgYXJndW1lbnQuXG4gICAgLy8gTm90ZSB3ZSBoYXZlIHRvIG1ha2UgYSBmdW5jdGlvbiB3aXRoIGNvcnJlY3QgbnVtYmVyIG9mIGFyZ3VtZW50cywgb3RoZXJ3aXNlIGphc21pbmUgd2lsbFxuICAgIC8vIHRoaW5rIHRoYXQgYWxsIGZ1bmN0aW9ucyBhcmUgc3luYyBvciBhc3luYy5cbiAgICByZXR1cm4gKHRlc3RCb2R5ICYmICh0ZXN0Qm9keS5sZW5ndGggPyBmdW5jdGlvbih0aGlzOiBRdWV1ZVJ1bm5lclVzZXJDb250ZXh0LCBkb25lOiBGdW5jdGlvbikge1xuICAgICAgICAgICAgICByZXR1cm4gcnVuSW5UZXN0Wm9uZSh0ZXN0Qm9keSwgdGhpcywgdGhpcy5xdWV1ZVJ1bm5lciAhLCBkb25lKTtcbiAgICAgICAgICAgIH0gOiBmdW5jdGlvbih0aGlzOiBRdWV1ZVJ1bm5lclVzZXJDb250ZXh0KSB7XG4gICAgICAgICAgICAgIHJldHVybiBydW5JblRlc3Rab25lKHRlc3RCb2R5LCB0aGlzLCB0aGlzLnF1ZXVlUnVubmVyICEpO1xuICAgICAgICAgICAgfSkpO1xuICB9XG4gIGludGVyZmFjZSBRdWV1ZVJ1bm5lciB7XG4gICAgZXhlY3V0ZSgpOiB2b2lkO1xuICAgIHRlc3RQcm94eVpvbmVTcGVjOiBab25lU3BlY3xudWxsO1xuICAgIHRlc3RQcm94eVpvbmU6IFpvbmV8bnVsbDtcbiAgfVxuICBpbnRlcmZhY2UgUXVldWVSdW5uZXJBdHRycyB7XG4gICAgcXVldWVhYmxlRm5zOiB7Zm46IEZ1bmN0aW9ufVtdO1xuICAgIGNsZWFyU3RhY2s6IChmbjogYW55KSA9PiB2b2lkO1xuICAgIGNhdGNoRXhjZXB0aW9uOiAoKSA9PiBib29sZWFuO1xuICAgIGZhaWw6ICgpID0+IHZvaWQ7XG4gICAgb25Db21wbGV0ZTogKCkgPT4gdm9pZDtcbiAgICBvbkV4Y2VwdGlvbjogKGVycm9yOiBhbnkpID0+IHZvaWQ7XG4gICAgdXNlckNvbnRleHQ6IFF1ZXVlUnVubmVyVXNlckNvbnRleHQ7XG4gICAgdGltZW91dDoge3NldFRpbWVvdXQ6IEZ1bmN0aW9uOyBjbGVhclRpbWVvdXQ6IEZ1bmN0aW9ufTtcbiAgfVxuICB0eXBlIFF1ZXVlUnVubmVyVXNlckNvbnRleHQgPSB7cXVldWVSdW5uZXI/OiBRdWV1ZVJ1bm5lcn07XG4gIGNvbnN0IFF1ZXVlUnVubmVyID0gKGphc21pbmUgYXMgYW55KS5RdWV1ZVJ1bm5lciBhcyB7XG4gICAgbmV3IChhdHRyczogUXVldWVSdW5uZXJBdHRycyk6IFF1ZXVlUnVubmVyO1xuICB9O1xuICAoamFzbWluZSBhcyBhbnkpLlF1ZXVlUnVubmVyID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhab25lUXVldWVSdW5uZXIsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gWm9uZVF1ZXVlUnVubmVyKHRoaXM6IFF1ZXVlUnVubmVyLCBhdHRyczogUXVldWVSdW5uZXJBdHRycykge1xuICAgICAgaWYgKGF0dHJzLm9uQ29tcGxldGUpIHtcbiAgICAgICAgYXR0cnMub25Db21wbGV0ZSA9IChmbiA9PiAoKSA9PiB7XG4gICAgICAgICAgLy8gQWxsIGZ1bmN0aW9ucyBhcmUgZG9uZSwgY2xlYXIgdGhlIHRlc3Qgem9uZS5cbiAgICAgICAgICB0aGlzLnRlc3RQcm94eVpvbmUgPSBudWxsO1xuICAgICAgICAgIHRoaXMudGVzdFByb3h5Wm9uZVNwZWMgPSBudWxsO1xuICAgICAgICAgIGFtYmllbnRab25lLnNjaGVkdWxlTWljcm9UYXNrKCdqYXNtaW5lLm9uQ29tcGxldGUnLCBmbik7XG4gICAgICAgIH0pKGF0dHJzLm9uQ29tcGxldGUpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBuYXRpdmVTZXRUaW1lb3V0ID0gX2dsb2JhbFtab25lLl9fc3ltYm9sX18oJ3NldFRpbWVvdXQnKV07XG4gICAgICBjb25zdCBuYXRpdmVDbGVhclRpbWVvdXQgPSBfZ2xvYmFsW1pvbmUuX19zeW1ib2xfXygnY2xlYXJUaW1lb3V0JyldO1xuICAgICAgaWYgKG5hdGl2ZVNldFRpbWVvdXQpIHtcbiAgICAgICAgLy8gc2hvdWxkIHJ1biBzZXRUaW1lb3V0IGluc2lkZSBqYXNtaW5lIG91dHNpZGUgb2Ygem9uZVxuICAgICAgICBhdHRycy50aW1lb3V0ID0ge1xuICAgICAgICAgIHNldFRpbWVvdXQ6IG5hdGl2ZVNldFRpbWVvdXQgPyBuYXRpdmVTZXRUaW1lb3V0IDogX2dsb2JhbC5zZXRUaW1lb3V0LFxuICAgICAgICAgIGNsZWFyVGltZW91dDogbmF0aXZlQ2xlYXJUaW1lb3V0ID8gbmF0aXZlQ2xlYXJUaW1lb3V0IDogX2dsb2JhbC5jbGVhclRpbWVvdXRcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy8gY3JlYXRlIGEgdXNlckNvbnRleHQgdG8gaG9sZCB0aGUgcXVldWVSdW5uZXIgaXRzZWxmXG4gICAgICAvLyBzbyB3ZSBjYW4gYWNjZXNzIHRoZSB0ZXN0UHJveHkgaW4gaXQveGl0L2JlZm9yZUVhY2ggLi4uXG4gICAgICBpZiAoKGphc21pbmUgYXMgYW55KS5Vc2VyQ29udGV4dCkge1xuICAgICAgICBpZiAoIWF0dHJzLnVzZXJDb250ZXh0KSB7XG4gICAgICAgICAgYXR0cnMudXNlckNvbnRleHQgPSBuZXcgKGphc21pbmUgYXMgYW55KS5Vc2VyQ29udGV4dCgpO1xuICAgICAgICB9XG4gICAgICAgIGF0dHJzLnVzZXJDb250ZXh0LnF1ZXVlUnVubmVyID0gdGhpcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghYXR0cnMudXNlckNvbnRleHQpIHtcbiAgICAgICAgICBhdHRycy51c2VyQ29udGV4dCA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGF0dHJzLnVzZXJDb250ZXh0LnF1ZXVlUnVubmVyID0gdGhpcztcbiAgICAgIH1cblxuICAgICAgLy8gcGF0Y2ggYXR0cnMub25FeGNlcHRpb25cbiAgICAgIGNvbnN0IG9uRXhjZXB0aW9uID0gYXR0cnMub25FeGNlcHRpb247XG4gICAgICBhdHRycy5vbkV4Y2VwdGlvbiA9IGZ1bmN0aW9uKHRoaXM6IHVuZGVmaW5lZHxRdWV1ZVJ1bm5lciwgZXJyb3I6IGFueSkge1xuICAgICAgICBpZiAoZXJyb3IgJiZcbiAgICAgICAgICAgIGVycm9yLm1lc3NhZ2UgPT09XG4gICAgICAgICAgICAgICAgJ1RpbWVvdXQgLSBBc3luYyBjYWxsYmFjayB3YXMgbm90IGludm9rZWQgd2l0aGluIHRpbWVvdXQgc3BlY2lmaWVkIGJ5IGphc21pbmUuREVGQVVMVF9USU1FT1VUX0lOVEVSVkFMLicpIHtcbiAgICAgICAgICAvLyBqYXNtaW5lIHRpbWVvdXQsIHdlIGNhbiBtYWtlIHRoZSBlcnJvciBtZXNzYWdlIG1vcmVcbiAgICAgICAgICAvLyByZWFzb25hYmxlIHRvIHRlbGwgd2hhdCB0YXNrcyBhcmUgcGVuZGluZ1xuICAgICAgICAgIGNvbnN0IHByb3h5Wm9uZVNwZWM6IGFueSA9IHRoaXMgJiYgdGhpcy50ZXN0UHJveHlab25lU3BlYztcbiAgICAgICAgICBpZiAocHJveHlab25lU3BlYykge1xuICAgICAgICAgICAgY29uc3QgcGVuZGluZ1Rhc2tzSW5mbyA9IHByb3h5Wm9uZVNwZWMuZ2V0QW5kQ2xlYXJQZW5kaW5nVGFza3NJbmZvKCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAvLyB0cnkgY2F0Y2ggaGVyZSBpbiBjYXNlIGVycm9yLm1lc3NhZ2UgaXMgbm90IHdyaXRhYmxlXG4gICAgICAgICAgICAgIGVycm9yLm1lc3NhZ2UgKz0gcGVuZGluZ1Rhc2tzSW5mbztcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAob25FeGNlcHRpb24pIHtcbiAgICAgICAgICBvbkV4Y2VwdGlvbi5jYWxsKHRoaXMsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgX3N1cGVyLmNhbGwodGhpcywgYXR0cnMpO1xuICAgIH1cbiAgICBab25lUXVldWVSdW5uZXIucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGxldCB6b25lOiBab25lfG51bGwgPSBab25lLmN1cnJlbnQ7XG4gICAgICBsZXQgaXNDaGlsZE9mQW1iaWVudFpvbmUgPSBmYWxzZTtcbiAgICAgIHdoaWxlICh6b25lKSB7XG4gICAgICAgIGlmICh6b25lID09PSBhbWJpZW50Wm9uZSkge1xuICAgICAgICAgIGlzQ2hpbGRPZkFtYmllbnRab25lID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICB6b25lID0gem9uZS5wYXJlbnQ7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNDaGlsZE9mQW1iaWVudFpvbmUpIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCBab25lOiAnICsgWm9uZS5jdXJyZW50Lm5hbWUpO1xuXG4gICAgICAvLyBUaGlzIGlzIHRoZSB6b25lIHdoaWNoIHdpbGwgYmUgdXNlZCBmb3IgcnVubmluZyBpbmRpdmlkdWFsIHRlc3RzLlxuICAgICAgLy8gSXQgd2lsbCBiZSBhIHByb3h5IHpvbmUsIHNvIHRoYXQgdGhlIHRlc3RzIGZ1bmN0aW9uIGNhbiByZXRyb2FjdGl2ZWx5IGluc3RhbGxcbiAgICAgIC8vIGRpZmZlcmVudCB6b25lcy5cbiAgICAgIC8vIEV4YW1wbGU6XG4gICAgICAvLyAgIC0gSW4gYmVmb3JlRWFjaCgpIGRvIGNoaWxkWm9uZSA9IFpvbmUuY3VycmVudC5mb3JrKC4uLik7XG4gICAgICAvLyAgIC0gSW4gaXQoKSB0cnkgdG8gZG8gZmFrZUFzeW5jKCkuIFRoZSBpc3N1ZSBpcyB0aGF0IGJlY2F1c2UgdGhlIGJlZm9yZUVhY2ggZm9ya2VkIHRoZVxuICAgICAgLy8gICAgIHpvbmUgb3V0c2lkZSBvZiBmYWtlQXN5bmMgaXQgd2lsbCBiZSBhYmxlIHRvIGVzY2FwZSB0aGUgZmFrZUFzeW5jIHJ1bGVzLlxuICAgICAgLy8gICAtIEJlY2F1c2UgUHJveHlab25lIGlzIHBhcmVudCBmbyBgY2hpbGRab25lYCBmYWtlQXN5bmMgY2FuIHJldHJvYWN0aXZlbHkgYWRkXG4gICAgICAvLyAgICAgZmFrZUFzeW5jIGJlaGF2aW9yIHRvIHRoZSBjaGlsZFpvbmUuXG5cbiAgICAgIHRoaXMudGVzdFByb3h5Wm9uZVNwZWMgPSBuZXcgUHJveHlab25lU3BlYygpO1xuICAgICAgdGhpcy50ZXN0UHJveHlab25lID0gYW1iaWVudFpvbmUuZm9yayh0aGlzLnRlc3RQcm94eVpvbmVTcGVjKTtcbiAgICAgIGlmICghWm9uZS5jdXJyZW50VGFzaykge1xuICAgICAgICAvLyBpZiB3ZSBhcmUgbm90IHJ1bm5pbmcgaW4gYSB0YXNrIHRoZW4gaWYgc29tZW9uZSB3b3VsZCByZWdpc3RlciBhXG4gICAgICAgIC8vIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBhbmQgdGhlbiBjYWxsaW5nIGVsZW1lbnQuY2xpY2soKSB0aGVcbiAgICAgICAgLy8gYWRkRXZlbnRMaXN0ZW5lciBjYWxsYmFjayB3b3VsZCB0aGluayB0aGF0IGl0IGlzIHRoZSB0b3AgbW9zdCB0YXNrIGFuZCB3b3VsZFxuICAgICAgICAvLyBkcmFpbiB0aGUgbWljcm90YXNrIHF1ZXVlIG9uIGVsZW1lbnQuY2xpY2soKSB3aGljaCB3b3VsZCBiZSBpbmNvcnJlY3QuXG4gICAgICAgIC8vIEZvciB0aGlzIHJlYXNvbiB3ZSBhbHdheXMgZm9yY2UgYSB0YXNrIHdoZW4gcnVubmluZyBqYXNtaW5lIHRlc3RzLlxuICAgICAgICBab25lLmN1cnJlbnQuc2NoZWR1bGVNaWNyb1Rhc2soXG4gICAgICAgICAgICAnamFzbWluZS5leGVjdXRlKCkuZm9yY2VUYXNrJywgKCkgPT4gUXVldWVSdW5uZXIucHJvdG90eXBlLmV4ZWN1dGUuY2FsbCh0aGlzKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfc3VwZXIucHJvdG90eXBlLmV4ZWN1dGUuY2FsbCh0aGlzKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBab25lUXVldWVSdW5uZXI7XG4gIH0pKFF1ZXVlUnVubmVyKTtcbn0pKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdyB8fCB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgJiYgc2VsZiB8fCBnbG9iYWwpO1xuIl19