(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("angular/packages/zone.js/lib/testing/async-testing", ["require", "exports", "../zone-spec/async-test"], factory);
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
    require("../zone-spec/async-test");
    Zone.__load_patch('asynctest', function (global, Zone, api) {
        /**
         * Wraps a test function in an asynchronous test zone. The test will automatically
         * complete when all asynchronous calls within this zone are done.
         */
        Zone[api.symbol('asyncTest')] = function asyncTest(fn) {
            // If we're running using the Jasmine test framework, adapt to call the 'done'
            // function when asynchronous activity is finished.
            if (global.jasmine) {
                // Not using an arrow function to preserve context passed from call site
                return function (done) {
                    if (!done) {
                        // if we run beforeEach in @angular/core/testing/testing_internal then we get no done
                        // fake it here and assume sync.
                        done = function () { };
                        done.fail = function (e) { throw e; };
                    }
                    runInTestZone(fn, this, done, function (err) {
                        if (typeof err === 'string') {
                            return done.fail(new Error(err));
                        }
                        else {
                            done.fail(err);
                        }
                    });
                };
            }
            // Otherwise, return a promise which will resolve when asynchronous activity
            // is finished. This will be correctly consumed by the Mocha framework with
            // it('...', async(myFn)); or can be used in a custom framework.
            // Not using an arrow function to preserve context passed from call site
            return function () {
                var _this = this;
                return new Promise(function (finishCallback, failCallback) {
                    runInTestZone(fn, _this, finishCallback, failCallback);
                });
            };
        };
        function runInTestZone(fn, context, finishCallback, failCallback) {
            var currentZone = Zone.current;
            var AsyncTestZoneSpec = Zone['AsyncTestZoneSpec'];
            if (AsyncTestZoneSpec === undefined) {
                throw new Error('AsyncTestZoneSpec is needed for the async() test helper but could not be found. ' +
                    'Please make sure that your environment includes zone.js/dist/async-test.js');
            }
            var ProxyZoneSpec = Zone['ProxyZoneSpec'];
            if (ProxyZoneSpec === undefined) {
                throw new Error('ProxyZoneSpec is needed for the async() test helper but could not be found. ' +
                    'Please make sure that your environment includes zone.js/dist/proxy.js');
            }
            var proxyZoneSpec = ProxyZoneSpec.get();
            ProxyZoneSpec.assertPresent();
            // We need to create the AsyncTestZoneSpec outside the ProxyZone.
            // If we do it in ProxyZone then we will get to infinite recursion.
            var proxyZone = Zone.current.getZoneWith('ProxyZoneSpec');
            var previousDelegate = proxyZoneSpec.getDelegate();
            proxyZone.parent.run(function () {
                var testZoneSpec = new AsyncTestZoneSpec(function () {
                    // Need to restore the original zone.
                    if (proxyZoneSpec.getDelegate() == testZoneSpec) {
                        // Only reset the zone spec if it's
                        // sill this one. Otherwise, assume
                        // it's OK.
                        proxyZoneSpec.setDelegate(previousDelegate);
                    }
                    testZoneSpec.unPatchPromiseForTest();
                    currentZone.run(function () { finishCallback(); });
                }, function (error) {
                    // Need to restore the original zone.
                    if (proxyZoneSpec.getDelegate() == testZoneSpec) {
                        // Only reset the zone spec if it's sill this one. Otherwise, assume it's OK.
                        proxyZoneSpec.setDelegate(previousDelegate);
                    }
                    testZoneSpec.unPatchPromiseForTest();
                    currentZone.run(function () { failCallback(error); });
                }, 'test');
                proxyZoneSpec.setDelegate(testZoneSpec);
                testZoneSpec.patchPromiseForTest();
            });
            return Zone.current.runGuarded(fn, context);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmMtdGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3pvbmUuanMvbGliL3Rlc3RpbmcvYXN5bmMtdGVzdGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILG1DQUFpQztJQUVqQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxVQUFDLE1BQVcsRUFBRSxJQUFjLEVBQUUsR0FBaUI7UUFDNUU7OztXQUdHO1FBQ0YsSUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxTQUFTLFNBQVMsQ0FBQyxFQUFZO1lBQ3RFLDhFQUE4RTtZQUM5RSxtREFBbUQ7WUFDbkQsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO2dCQUNsQix3RUFBd0U7Z0JBQ3hFLE9BQU8sVUFBd0IsSUFBUztvQkFDdEMsSUFBSSxDQUFDLElBQUksRUFBRTt3QkFDVCxxRkFBcUY7d0JBQ3JGLGdDQUFnQzt3QkFDaEMsSUFBSSxHQUFHLGNBQVksQ0FBQyxDQUFDO3dCQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVMsQ0FBTSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUMzQztvQkFDRCxhQUFhLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBQyxHQUFRO3dCQUNyQyxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTs0QkFDM0IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7eUJBQzFDOzZCQUFNOzRCQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7eUJBQ2hCO29CQUNILENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUMsQ0FBQzthQUNIO1lBQ0QsNEVBQTRFO1lBQzVFLDJFQUEyRTtZQUMzRSxnRUFBZ0U7WUFDaEUsd0VBQXdFO1lBQ3hFLE9BQU87Z0JBQUEsaUJBSU47Z0JBSEMsT0FBTyxJQUFJLE9BQU8sQ0FBTyxVQUFDLGNBQWMsRUFBRSxZQUFZO29CQUNwRCxhQUFhLENBQUMsRUFBRSxFQUFFLEtBQUksRUFBRSxjQUFjLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQ3hELENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDO1FBRUYsU0FBUyxhQUFhLENBQ2xCLEVBQVksRUFBRSxPQUFZLEVBQUUsY0FBd0IsRUFBRSxZQUFzQjtZQUM5RSxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ2pDLElBQU0saUJBQWlCLEdBQUksSUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDN0QsSUFBSSxpQkFBaUIsS0FBSyxTQUFTLEVBQUU7Z0JBQ25DLE1BQU0sSUFBSSxLQUFLLENBQ1gsa0ZBQWtGO29CQUNsRiw0RUFBNEUsQ0FBQyxDQUFDO2FBQ25GO1lBQ0QsSUFBTSxhQUFhLEdBQUksSUFBWSxDQUFDLGVBQWUsQ0FHbEQsQ0FBQztZQUNGLElBQUksYUFBYSxLQUFLLFNBQVMsRUFBRTtnQkFDL0IsTUFBTSxJQUFJLEtBQUssQ0FDWCw4RUFBOEU7b0JBQzlFLHVFQUF1RSxDQUFDLENBQUM7YUFDOUU7WUFDRCxJQUFNLGFBQWEsR0FBRyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDMUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzlCLGlFQUFpRTtZQUNqRSxtRUFBbUU7WUFDbkUsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDNUQsSUFBTSxnQkFBZ0IsR0FBRyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDckQsU0FBVyxDQUFDLE1BQVEsQ0FBQyxHQUFHLENBQUM7Z0JBQ3ZCLElBQU0sWUFBWSxHQUFhLElBQUksaUJBQWlCLENBQ2hEO29CQUNFLHFDQUFxQztvQkFDckMsSUFBSSxhQUFhLENBQUMsV0FBVyxFQUFFLElBQUksWUFBWSxFQUFFO3dCQUMvQyxtQ0FBbUM7d0JBQ25DLG1DQUFtQzt3QkFDbkMsV0FBVzt3QkFDWCxhQUFhLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7cUJBQzdDO29CQUNBLFlBQW9CLENBQUMscUJBQXFCLEVBQUUsQ0FBQztvQkFDOUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxjQUFRLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9DLENBQUMsRUFDRCxVQUFDLEtBQVU7b0JBQ1QscUNBQXFDO29CQUNyQyxJQUFJLGFBQWEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxZQUFZLEVBQUU7d0JBQy9DLDZFQUE2RTt3QkFDN0UsYUFBYSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO3FCQUM3QztvQkFDQSxZQUFvQixDQUFDLHFCQUFxQixFQUFFLENBQUM7b0JBQzlDLFdBQVcsQ0FBQyxHQUFHLENBQUMsY0FBUSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEQsQ0FBQyxFQUNELE1BQU0sQ0FBQyxDQUFDO2dCQUNaLGFBQWEsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3ZDLFlBQW9CLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUM5QyxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAnLi4vem9uZS1zcGVjL2FzeW5jLXRlc3QnO1xuXG5ab25lLl9fbG9hZF9wYXRjaCgnYXN5bmN0ZXN0JywgKGdsb2JhbDogYW55LCBab25lOiBab25lVHlwZSwgYXBpOiBfWm9uZVByaXZhdGUpID0+IHtcbiAgLyoqXG4gICAqIFdyYXBzIGEgdGVzdCBmdW5jdGlvbiBpbiBhbiBhc3luY2hyb25vdXMgdGVzdCB6b25lLiBUaGUgdGVzdCB3aWxsIGF1dG9tYXRpY2FsbHlcbiAgICogY29tcGxldGUgd2hlbiBhbGwgYXN5bmNocm9ub3VzIGNhbGxzIHdpdGhpbiB0aGlzIHpvbmUgYXJlIGRvbmUuXG4gICAqL1xuICAoWm9uZSBhcyBhbnkpW2FwaS5zeW1ib2woJ2FzeW5jVGVzdCcpXSA9IGZ1bmN0aW9uIGFzeW5jVGVzdChmbjogRnVuY3Rpb24pOiAoZG9uZTogYW55KSA9PiBhbnkge1xuICAgIC8vIElmIHdlJ3JlIHJ1bm5pbmcgdXNpbmcgdGhlIEphc21pbmUgdGVzdCBmcmFtZXdvcmssIGFkYXB0IHRvIGNhbGwgdGhlICdkb25lJ1xuICAgIC8vIGZ1bmN0aW9uIHdoZW4gYXN5bmNocm9ub3VzIGFjdGl2aXR5IGlzIGZpbmlzaGVkLlxuICAgIGlmIChnbG9iYWwuamFzbWluZSkge1xuICAgICAgLy8gTm90IHVzaW5nIGFuIGFycm93IGZ1bmN0aW9uIHRvIHByZXNlcnZlIGNvbnRleHQgcGFzc2VkIGZyb20gY2FsbCBzaXRlXG4gICAgICByZXR1cm4gZnVuY3Rpb24odGhpczogdW5rbm93biwgZG9uZTogYW55KSB7XG4gICAgICAgIGlmICghZG9uZSkge1xuICAgICAgICAgIC8vIGlmIHdlIHJ1biBiZWZvcmVFYWNoIGluIEBhbmd1bGFyL2NvcmUvdGVzdGluZy90ZXN0aW5nX2ludGVybmFsIHRoZW4gd2UgZ2V0IG5vIGRvbmVcbiAgICAgICAgICAvLyBmYWtlIGl0IGhlcmUgYW5kIGFzc3VtZSBzeW5jLlxuICAgICAgICAgIGRvbmUgPSBmdW5jdGlvbigpIHt9O1xuICAgICAgICAgIGRvbmUuZmFpbCA9IGZ1bmN0aW9uKGU6IGFueSkgeyB0aHJvdyBlOyB9O1xuICAgICAgICB9XG4gICAgICAgIHJ1bkluVGVzdFpvbmUoZm4sIHRoaXMsIGRvbmUsIChlcnI6IGFueSkgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgZXJyID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuIGRvbmUuZmFpbChuZXcgRXJyb3IoPHN0cmluZz5lcnIpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9uZS5mYWlsKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfVxuICAgIC8vIE90aGVyd2lzZSwgcmV0dXJuIGEgcHJvbWlzZSB3aGljaCB3aWxsIHJlc29sdmUgd2hlbiBhc3luY2hyb25vdXMgYWN0aXZpdHlcbiAgICAvLyBpcyBmaW5pc2hlZC4gVGhpcyB3aWxsIGJlIGNvcnJlY3RseSBjb25zdW1lZCBieSB0aGUgTW9jaGEgZnJhbWV3b3JrIHdpdGhcbiAgICAvLyBpdCgnLi4uJywgYXN5bmMobXlGbikpOyBvciBjYW4gYmUgdXNlZCBpbiBhIGN1c3RvbSBmcmFtZXdvcmsuXG4gICAgLy8gTm90IHVzaW5nIGFuIGFycm93IGZ1bmN0aW9uIHRvIHByZXNlcnZlIGNvbnRleHQgcGFzc2VkIGZyb20gY2FsbCBzaXRlXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHRoaXM6IHVua25vd24pIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigoZmluaXNoQ2FsbGJhY2ssIGZhaWxDYWxsYmFjaykgPT4ge1xuICAgICAgICBydW5JblRlc3Rab25lKGZuLCB0aGlzLCBmaW5pc2hDYWxsYmFjaywgZmFpbENhbGxiYWNrKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gcnVuSW5UZXN0Wm9uZShcbiAgICAgIGZuOiBGdW5jdGlvbiwgY29udGV4dDogYW55LCBmaW5pc2hDYWxsYmFjazogRnVuY3Rpb24sIGZhaWxDYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICBjb25zdCBjdXJyZW50Wm9uZSA9IFpvbmUuY3VycmVudDtcbiAgICBjb25zdCBBc3luY1Rlc3Rab25lU3BlYyA9IChab25lIGFzIGFueSlbJ0FzeW5jVGVzdFpvbmVTcGVjJ107XG4gICAgaWYgKEFzeW5jVGVzdFpvbmVTcGVjID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnQXN5bmNUZXN0Wm9uZVNwZWMgaXMgbmVlZGVkIGZvciB0aGUgYXN5bmMoKSB0ZXN0IGhlbHBlciBidXQgY291bGQgbm90IGJlIGZvdW5kLiAnICtcbiAgICAgICAgICAnUGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHlvdXIgZW52aXJvbm1lbnQgaW5jbHVkZXMgem9uZS5qcy9kaXN0L2FzeW5jLXRlc3QuanMnKTtcbiAgICB9XG4gICAgY29uc3QgUHJveHlab25lU3BlYyA9IChab25lIGFzIGFueSlbJ1Byb3h5Wm9uZVNwZWMnXSBhcyB7XG4gICAgICBnZXQoKToge3NldERlbGVnYXRlKHNwZWM6IFpvbmVTcGVjKTogdm9pZDsgZ2V0RGVsZWdhdGUoKTogWm9uZVNwZWM7fTtcbiAgICAgIGFzc2VydFByZXNlbnQ6ICgpID0+IHZvaWQ7XG4gICAgfTtcbiAgICBpZiAoUHJveHlab25lU3BlYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ1Byb3h5Wm9uZVNwZWMgaXMgbmVlZGVkIGZvciB0aGUgYXN5bmMoKSB0ZXN0IGhlbHBlciBidXQgY291bGQgbm90IGJlIGZvdW5kLiAnICtcbiAgICAgICAgICAnUGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHlvdXIgZW52aXJvbm1lbnQgaW5jbHVkZXMgem9uZS5qcy9kaXN0L3Byb3h5LmpzJyk7XG4gICAgfVxuICAgIGNvbnN0IHByb3h5Wm9uZVNwZWMgPSBQcm94eVpvbmVTcGVjLmdldCgpO1xuICAgIFByb3h5Wm9uZVNwZWMuYXNzZXJ0UHJlc2VudCgpO1xuICAgIC8vIFdlIG5lZWQgdG8gY3JlYXRlIHRoZSBBc3luY1Rlc3Rab25lU3BlYyBvdXRzaWRlIHRoZSBQcm94eVpvbmUuXG4gICAgLy8gSWYgd2UgZG8gaXQgaW4gUHJveHlab25lIHRoZW4gd2Ugd2lsbCBnZXQgdG8gaW5maW5pdGUgcmVjdXJzaW9uLlxuICAgIGNvbnN0IHByb3h5Wm9uZSA9IFpvbmUuY3VycmVudC5nZXRab25lV2l0aCgnUHJveHlab25lU3BlYycpO1xuICAgIGNvbnN0IHByZXZpb3VzRGVsZWdhdGUgPSBwcm94eVpvbmVTcGVjLmdldERlbGVnYXRlKCk7XG4gICAgcHJveHlab25lICEucGFyZW50ICEucnVuKCgpID0+IHtcbiAgICAgIGNvbnN0IHRlc3Rab25lU3BlYzogWm9uZVNwZWMgPSBuZXcgQXN5bmNUZXN0Wm9uZVNwZWMoXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgLy8gTmVlZCB0byByZXN0b3JlIHRoZSBvcmlnaW5hbCB6b25lLlxuICAgICAgICAgICAgaWYgKHByb3h5Wm9uZVNwZWMuZ2V0RGVsZWdhdGUoKSA9PSB0ZXN0Wm9uZVNwZWMpIHtcbiAgICAgICAgICAgICAgLy8gT25seSByZXNldCB0aGUgem9uZSBzcGVjIGlmIGl0J3NcbiAgICAgICAgICAgICAgLy8gc2lsbCB0aGlzIG9uZS4gT3RoZXJ3aXNlLCBhc3N1bWVcbiAgICAgICAgICAgICAgLy8gaXQncyBPSy5cbiAgICAgICAgICAgICAgcHJveHlab25lU3BlYy5zZXREZWxlZ2F0ZShwcmV2aW91c0RlbGVnYXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICh0ZXN0Wm9uZVNwZWMgYXMgYW55KS51blBhdGNoUHJvbWlzZUZvclRlc3QoKTtcbiAgICAgICAgICAgIGN1cnJlbnRab25lLnJ1bigoKSA9PiB7IGZpbmlzaENhbGxiYWNrKCk7IH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgKGVycm9yOiBhbnkpID0+IHtcbiAgICAgICAgICAgIC8vIE5lZWQgdG8gcmVzdG9yZSB0aGUgb3JpZ2luYWwgem9uZS5cbiAgICAgICAgICAgIGlmIChwcm94eVpvbmVTcGVjLmdldERlbGVnYXRlKCkgPT0gdGVzdFpvbmVTcGVjKSB7XG4gICAgICAgICAgICAgIC8vIE9ubHkgcmVzZXQgdGhlIHpvbmUgc3BlYyBpZiBpdCdzIHNpbGwgdGhpcyBvbmUuIE90aGVyd2lzZSwgYXNzdW1lIGl0J3MgT0suXG4gICAgICAgICAgICAgIHByb3h5Wm9uZVNwZWMuc2V0RGVsZWdhdGUocHJldmlvdXNEZWxlZ2F0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAodGVzdFpvbmVTcGVjIGFzIGFueSkudW5QYXRjaFByb21pc2VGb3JUZXN0KCk7XG4gICAgICAgICAgICBjdXJyZW50Wm9uZS5ydW4oKCkgPT4geyBmYWlsQ2FsbGJhY2soZXJyb3IpOyB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgICd0ZXN0Jyk7XG4gICAgICBwcm94eVpvbmVTcGVjLnNldERlbGVnYXRlKHRlc3Rab25lU3BlYyk7XG4gICAgICAodGVzdFpvbmVTcGVjIGFzIGFueSkucGF0Y2hQcm9taXNlRm9yVGVzdCgpO1xuICAgIH0pO1xuICAgIHJldHVybiBab25lLmN1cnJlbnQucnVuR3VhcmRlZChmbiwgY29udGV4dCk7XG4gIH1cbn0pO1xuIl19