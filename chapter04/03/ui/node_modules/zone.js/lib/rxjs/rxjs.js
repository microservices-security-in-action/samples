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
        define("angular/packages/zone.js/lib/rxjs/rxjs", ["require", "exports", "rxjs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var rxjs_1 = require("rxjs");
    Zone.__load_patch('rxjs', function (global, Zone, api) {
        var symbol = Zone.__symbol__;
        var nextSource = 'rxjs.Subscriber.next';
        var errorSource = 'rxjs.Subscriber.error';
        var completeSource = 'rxjs.Subscriber.complete';
        var ObjectDefineProperties = Object.defineProperties;
        var patchObservable = function () {
            var ObservablePrototype = rxjs_1.Observable.prototype;
            var _symbolSubscribe = symbol('_subscribe');
            var _subscribe = ObservablePrototype[_symbolSubscribe] = ObservablePrototype._subscribe;
            ObjectDefineProperties(rxjs_1.Observable.prototype, {
                _zone: { value: null, writable: true, configurable: true },
                _zoneSource: { value: null, writable: true, configurable: true },
                _zoneSubscribe: { value: null, writable: true, configurable: true },
                source: {
                    configurable: true,
                    get: function () { return this._zoneSource; },
                    set: function (source) {
                        this._zone = Zone.current;
                        this._zoneSource = source;
                    }
                },
                _subscribe: {
                    configurable: true,
                    get: function () {
                        if (this._zoneSubscribe) {
                            return this._zoneSubscribe;
                        }
                        else if (this.constructor === rxjs_1.Observable) {
                            return _subscribe;
                        }
                        var proto = Object.getPrototypeOf(this);
                        return proto && proto._subscribe;
                    },
                    set: function (subscribe) {
                        this._zone = Zone.current;
                        this._zoneSubscribe = function () {
                            if (this._zone && this._zone !== Zone.current) {
                                var tearDown_1 = this._zone.run(subscribe, this, arguments);
                                if (tearDown_1 && typeof tearDown_1 === 'function') {
                                    var zone_1 = this._zone;
                                    return function () {
                                        if (zone_1 !== Zone.current) {
                                            return zone_1.run(tearDown_1, this, arguments);
                                        }
                                        return tearDown_1.apply(this, arguments);
                                    };
                                }
                                return tearDown_1;
                            }
                            return subscribe.apply(this, arguments);
                        };
                    }
                },
                subjectFactory: {
                    get: function () { return this._zoneSubjectFactory; },
                    set: function (factory) {
                        var zone = this._zone;
                        this._zoneSubjectFactory = function () {
                            if (zone && zone !== Zone.current) {
                                return zone.run(factory, this, arguments);
                            }
                            return factory.apply(this, arguments);
                        };
                    }
                }
            });
        };
        api.patchMethod(rxjs_1.Observable.prototype, 'lift', function (delegate) { return function (self, args) {
            var observable = delegate.apply(self, args);
            if (observable.operator) {
                observable.operator._zone = Zone.current;
                api.patchMethod(observable.operator, 'call', function (operatorDelegate) { return function (operatorSelf, operatorArgs) {
                    if (operatorSelf._zone && operatorSelf._zone !== Zone.current) {
                        return operatorSelf._zone.run(operatorDelegate, operatorSelf, operatorArgs);
                    }
                    return operatorDelegate.apply(operatorSelf, operatorArgs);
                }; });
            }
            return observable;
        }; });
        var patchSubscription = function () {
            ObjectDefineProperties(rxjs_1.Subscription.prototype, {
                _zone: { value: null, writable: true, configurable: true },
                _zoneUnsubscribe: { value: null, writable: true, configurable: true },
                _unsubscribe: {
                    get: function () {
                        if (this._zoneUnsubscribe) {
                            return this._zoneUnsubscribe;
                        }
                        var proto = Object.getPrototypeOf(this);
                        return proto && proto._unsubscribe;
                    },
                    set: function (unsubscribe) {
                        this._zone = Zone.current;
                        this._zoneUnsubscribe = function () {
                            if (this._zone && this._zone !== Zone.current) {
                                return this._zone.run(unsubscribe, this, arguments);
                            }
                            return unsubscribe.apply(this, arguments);
                        };
                    }
                }
            });
        };
        var patchSubscriber = function () {
            var next = rxjs_1.Subscriber.prototype.next;
            var error = rxjs_1.Subscriber.prototype.error;
            var complete = rxjs_1.Subscriber.prototype.complete;
            Object.defineProperty(rxjs_1.Subscriber.prototype, 'destination', {
                configurable: true,
                get: function () { return this._zoneDestination; },
                set: function (destination) {
                    this._zone = Zone.current;
                    this._zoneDestination = destination;
                }
            });
            // patch Subscriber.next to make sure it run
            // into SubscriptionZone
            rxjs_1.Subscriber.prototype.next = function () {
                var currentZone = Zone.current;
                var subscriptionZone = this._zone;
                // for performance concern, check Zone.current
                // equal with this._zone(SubscriptionZone) or not
                if (subscriptionZone && subscriptionZone !== currentZone) {
                    return subscriptionZone.run(next, this, arguments, nextSource);
                }
                else {
                    return next.apply(this, arguments);
                }
            };
            rxjs_1.Subscriber.prototype.error = function () {
                var currentZone = Zone.current;
                var subscriptionZone = this._zone;
                // for performance concern, check Zone.current
                // equal with this._zone(SubscriptionZone) or not
                if (subscriptionZone && subscriptionZone !== currentZone) {
                    return subscriptionZone.run(error, this, arguments, errorSource);
                }
                else {
                    return error.apply(this, arguments);
                }
            };
            rxjs_1.Subscriber.prototype.complete = function () {
                var currentZone = Zone.current;
                var subscriptionZone = this._zone;
                // for performance concern, check Zone.current
                // equal with this._zone(SubscriptionZone) or not
                if (subscriptionZone && subscriptionZone !== currentZone) {
                    return subscriptionZone.run(complete, this, arguments, completeSource);
                }
                else {
                    return complete.call(this);
                }
            };
        };
        patchObservable();
        patchSubscription();
        patchSubscriber();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnhqcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3pvbmUuanMvbGliL3J4anMvcnhqcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDZCQUEwRDtJQU16RCxJQUFZLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxVQUFDLE1BQVcsRUFBRSxJQUFjLEVBQUUsR0FBaUI7UUFDaEYsSUFBTSxNQUFNLEdBQXNDLElBQVksQ0FBQyxVQUFVLENBQUM7UUFDMUUsSUFBTSxVQUFVLEdBQUcsc0JBQXNCLENBQUM7UUFDMUMsSUFBTSxXQUFXLEdBQUcsdUJBQXVCLENBQUM7UUFDNUMsSUFBTSxjQUFjLEdBQUcsMEJBQTBCLENBQUM7UUFFbEQsSUFBTSxzQkFBc0IsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFFdkQsSUFBTSxlQUFlLEdBQUc7WUFDdEIsSUFBTSxtQkFBbUIsR0FBUSxpQkFBVSxDQUFDLFNBQVMsQ0FBQztZQUN0RCxJQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM5QyxJQUFNLFVBQVUsR0FBRyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLG1CQUFtQixDQUFDLFVBQVUsQ0FBQztZQUUxRixzQkFBc0IsQ0FBQyxpQkFBVSxDQUFDLFNBQVMsRUFBRTtnQkFDM0MsS0FBSyxFQUFFLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUM7Z0JBQ3hELFdBQVcsRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFDO2dCQUM5RCxjQUFjLEVBQUUsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBQztn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Z0JBQWdCLEtBQUssV0FBVyxFQUFFO29CQUN4RCxPQUFPLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUM7aUJBQy9FO3FCQUFNO29CQUNMLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDNUI7WUFDSCxDQUFDLENBQUM7UUFDSixDQUFDLENBQUM7UUFFRixlQUFlLEVBQUUsQ0FBQztRQUNsQixpQkFBaUIsRUFBRSxDQUFDO1FBQ3BCLGVBQWUsRUFBRSxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge09ic2VydmFibGUsIFN1YnNjcmliZXIsIFN1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5cbnR5cGUgWm9uZVN1YnNjcmliZXJDb250ZXh0ID0ge1xuICBfem9uZTogWm9uZVxufSAmIFN1YnNjcmliZXI8YW55PjtcblxuKFpvbmUgYXMgYW55KS5fX2xvYWRfcGF0Y2goJ3J4anMnLCAoZ2xvYmFsOiBhbnksIFpvbmU6IFpvbmVUeXBlLCBhcGk6IF9ab25lUHJpdmF0ZSkgPT4ge1xuICBjb25zdCBzeW1ib2w6IChzeW1ib2xTdHJpbmc6IHN0cmluZykgPT4gc3RyaW5nID0gKFpvbmUgYXMgYW55KS5fX3N5bWJvbF9fO1xuICBjb25zdCBuZXh0U291cmNlID0gJ3J4anMuU3Vic2NyaWJlci5uZXh0JztcbiAgY29uc3QgZXJyb3JTb3VyY2UgPSAncnhqcy5TdWJzY3JpYmVyLmVycm9yJztcbiAgY29uc3QgY29tcGxldGVTb3VyY2UgPSAncnhqcy5TdWJzY3JpYmVyLmNvbXBsZXRlJztcblxuICBjb25zdCBPYmplY3REZWZpbmVQcm9wZXJ0aWVzID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXM7XG5cbiAgY29uc3QgcGF0Y2hPYnNlcnZhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgT2JzZXJ2YWJsZVByb3RvdHlwZTogYW55ID0gT2JzZXJ2YWJsZS5wcm90b3R5cGU7XG4gICAgY29uc3QgX3N5bWJvbFN1YnNjcmliZSA9IHN5bWJvbCgnX3N1YnNjcmliZScpO1xuICAgIGNvbnN0IF9zdWJzY3JpYmUgPSBPYnNlcnZhYmxlUHJvdG90eXBlW19zeW1ib2xTdWJzY3JpYmVdID0gT2JzZXJ2YWJsZVByb3RvdHlwZS5fc3Vic2NyaWJlO1xuXG4gICAgT2JqZWN0RGVmaW5lUHJvcGVydGllcyhPYnNlcnZhYmxlLnByb3RvdHlwZSwge1xuICAgICAgX3pvbmU6IHt2YWx1ZTogbnVsbCwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZX0sXG4gICAgICBfem9uZVNvdXJjZToge3ZhbHVlOiBudWxsLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlfSxcbiAgICAgIF96b25lU3Vic2NyaWJlOiB7dmFsdWU6IG51bGwsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWV9LFxuICAgICAgc291cmNlOiB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbih0aGlzOiBPYnNlcnZhYmxlPGFueT4pIHsgcmV0dXJuICh0aGlzIGFzIGFueSkuX3pvbmVTb3VyY2U7IH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odGhpczogT2JzZXJ2YWJsZTxhbnk+LCBzb3VyY2U6IGFueSkge1xuICAgICAgICAgICh0aGlzIGFzIGFueSkuX3pvbmUgPSBab25lLmN1cnJlbnQ7XG4gICAgICAgICAgKHRoaXMgYXMgYW55KS5fem9uZVNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIF9zdWJzY3JpYmU6IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKHRoaXM6IE9ic2VydmFibGU8YW55Pikge1xuICAgICAgICAgIGlmICgodGhpcyBhcyBhbnkpLl96b25lU3Vic2NyaWJlKSB7XG4gICAgICAgICAgICByZXR1cm4gKHRoaXMgYXMgYW55KS5fem9uZVN1YnNjcmliZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY29uc3RydWN0b3IgPT09IE9ic2VydmFibGUpIHtcbiAgICAgICAgICAgIHJldHVybiBfc3Vic2NyaWJlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKTtcbiAgICAgICAgICByZXR1cm4gcHJvdG8gJiYgcHJvdG8uX3N1YnNjcmliZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih0aGlzOiBPYnNlcnZhYmxlPGFueT4sIHN1YnNjcmliZTogYW55KSB7XG4gICAgICAgICAgKHRoaXMgYXMgYW55KS5fem9uZSA9IFpvbmUuY3VycmVudDtcbiAgICAgICAgICAodGhpcyBhcyBhbnkpLl96b25lU3Vic2NyaWJlID0gZnVuY3Rpb24odGhpczogWm9uZVN1YnNjcmliZXJDb250ZXh0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fem9uZSAmJiB0aGlzLl96b25lICE9PSBab25lLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgY29uc3QgdGVhckRvd24gPSB0aGlzLl96b25lLnJ1bihzdWJzY3JpYmUsIHRoaXMsIGFyZ3VtZW50cyBhcyBhbnkpO1xuICAgICAgICAgICAgICBpZiAodGVhckRvd24gJiYgdHlwZW9mIHRlYXJEb3duID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgem9uZSA9IHRoaXMuX3pvbmU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHRoaXM6IFpvbmVTdWJzY3JpYmVyQ29udGV4dCkge1xuICAgICAgICAgICAgICAgICAgaWYgKHpvbmUgIT09IFpvbmUuY3VycmVudCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gem9uZS5ydW4odGVhckRvd24sIHRoaXMsIGFyZ3VtZW50cyBhcyBhbnkpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRlYXJEb3duLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gdGVhckRvd247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3Vic2NyaWJlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHN1YmplY3RGYWN0b3J5OiB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiAodGhpcyBhcyBhbnkpLl96b25lU3ViamVjdEZhY3Rvcnk7IH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oZmFjdG9yeTogYW55KSB7XG4gICAgICAgICAgY29uc3Qgem9uZSA9IHRoaXMuX3pvbmU7XG4gICAgICAgICAgdGhpcy5fem9uZVN1YmplY3RGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoem9uZSAmJiB6b25lICE9PSBab25lLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHpvbmUucnVuKGZhY3RvcnksIHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBhcGkucGF0Y2hNZXRob2QoT2JzZXJ2YWJsZS5wcm90b3R5cGUsICdsaWZ0JywgKGRlbGVnYXRlOiBhbnkpID0+IChzZWxmOiBhbnksIGFyZ3M6IGFueVtdKSA9PiB7XG4gICAgY29uc3Qgb2JzZXJ2YWJsZTogYW55ID0gZGVsZWdhdGUuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgaWYgKG9ic2VydmFibGUub3BlcmF0b3IpIHtcbiAgICAgIG9ic2VydmFibGUub3BlcmF0b3IuX3pvbmUgPSBab25lLmN1cnJlbnQ7XG4gICAgICBhcGkucGF0Y2hNZXRob2QoXG4gICAgICAgICAgb2JzZXJ2YWJsZS5vcGVyYXRvciwgJ2NhbGwnLFxuICAgICAgICAgIChvcGVyYXRvckRlbGVnYXRlOiBhbnkpID0+IChvcGVyYXRvclNlbGY6IGFueSwgb3BlcmF0b3JBcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgaWYgKG9wZXJhdG9yU2VsZi5fem9uZSAmJiBvcGVyYXRvclNlbGYuX3pvbmUgIT09IFpvbmUuY3VycmVudCkge1xuICAgICAgICAgICAgICByZXR1cm4gb3BlcmF0b3JTZWxmLl96b25lLnJ1bihvcGVyYXRvckRlbGVnYXRlLCBvcGVyYXRvclNlbGYsIG9wZXJhdG9yQXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3BlcmF0b3JEZWxlZ2F0ZS5hcHBseShvcGVyYXRvclNlbGYsIG9wZXJhdG9yQXJncyk7XG4gICAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBvYnNlcnZhYmxlO1xuICB9KTtcblxuICBjb25zdCBwYXRjaFN1YnNjcmlwdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIE9iamVjdERlZmluZVByb3BlcnRpZXMoU3Vic2NyaXB0aW9uLnByb3RvdHlwZSwge1xuICAgICAgX3pvbmU6IHt2YWx1ZTogbnVsbCwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZX0sXG4gICAgICBfem9uZVVuc3Vic2NyaWJlOiB7dmFsdWU6IG51bGwsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWV9LFxuICAgICAgX3Vuc3Vic2NyaWJlOiB7XG4gICAgICAgIGdldDogZnVuY3Rpb24odGhpczogU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgICAgaWYgKCh0aGlzIGFzIGFueSkuX3pvbmVVbnN1YnNjcmliZSkge1xuICAgICAgICAgICAgcmV0dXJuICh0aGlzIGFzIGFueSkuX3pvbmVVbnN1YnNjcmliZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcyk7XG4gICAgICAgICAgcmV0dXJuIHByb3RvICYmIHByb3RvLl91bnN1YnNjcmliZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih0aGlzOiBTdWJzY3JpcHRpb24sIHVuc3Vic2NyaWJlOiBhbnkpIHtcbiAgICAgICAgICAodGhpcyBhcyBhbnkpLl96b25lID0gWm9uZS5jdXJyZW50O1xuICAgICAgICAgICh0aGlzIGFzIGFueSkuX3pvbmVVbnN1YnNjcmliZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUgJiYgdGhpcy5fem9uZSAhPT0gWm9uZS5jdXJyZW50KSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLl96b25lLnJ1bih1bnN1YnNjcmliZSwgdGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB1bnN1YnNjcmliZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCBwYXRjaFN1YnNjcmliZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBuZXh0ID0gU3Vic2NyaWJlci5wcm90b3R5cGUubmV4dDtcbiAgICBjb25zdCBlcnJvciA9IFN1YnNjcmliZXIucHJvdG90eXBlLmVycm9yO1xuICAgIGNvbnN0IGNvbXBsZXRlID0gU3Vic2NyaWJlci5wcm90b3R5cGUuY29tcGxldGU7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3Vic2NyaWJlci5wcm90b3R5cGUsICdkZXN0aW5hdGlvbicsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGdldDogZnVuY3Rpb24odGhpczogU3Vic2NyaWJlcjxhbnk+KSB7IHJldHVybiAodGhpcyBhcyBhbnkpLl96b25lRGVzdGluYXRpb247IH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uKHRoaXM6IFN1YnNjcmliZXI8YW55PiwgZGVzdGluYXRpb246IGFueSkge1xuICAgICAgICAodGhpcyBhcyBhbnkpLl96b25lID0gWm9uZS5jdXJyZW50O1xuICAgICAgICAodGhpcyBhcyBhbnkpLl96b25lRGVzdGluYXRpb24gPSBkZXN0aW5hdGlvbjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHBhdGNoIFN1YnNjcmliZXIubmV4dCB0byBtYWtlIHN1cmUgaXQgcnVuXG4gICAgLy8gaW50byBTdWJzY3JpcHRpb25ab25lXG4gICAgU3Vic2NyaWJlci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKHRoaXM6IFpvbmVTdWJzY3JpYmVyQ29udGV4dCkge1xuICAgICAgY29uc3QgY3VycmVudFpvbmUgPSBab25lLmN1cnJlbnQ7XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb25ab25lID0gdGhpcy5fem9uZTtcblxuICAgICAgLy8gZm9yIHBlcmZvcm1hbmNlIGNvbmNlcm4sIGNoZWNrIFpvbmUuY3VycmVudFxuICAgICAgLy8gZXF1YWwgd2l0aCB0aGlzLl96b25lKFN1YnNjcmlwdGlvblpvbmUpIG9yIG5vdFxuICAgICAgaWYgKHN1YnNjcmlwdGlvblpvbmUgJiYgc3Vic2NyaXB0aW9uWm9uZSAhPT0gY3VycmVudFpvbmUpIHtcbiAgICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvblpvbmUucnVuKG5leHQsIHRoaXMsIGFyZ3VtZW50cyBhcyBhbnksIG5leHRTb3VyY2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5leHQuYXBwbHkodGhpcywgYXJndW1lbnRzIGFzIGFueSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIFN1YnNjcmliZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24odGhpczogWm9uZVN1YnNjcmliZXJDb250ZXh0KSB7XG4gICAgICBjb25zdCBjdXJyZW50Wm9uZSA9IFpvbmUuY3VycmVudDtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvblpvbmUgPSB0aGlzLl96b25lO1xuXG4gICAgICAvLyBmb3IgcGVyZm9ybWFuY2UgY29uY2VybiwgY2hlY2sgWm9uZS5jdXJyZW50XG4gICAgICAvLyBlcXVhbCB3aXRoIHRoaXMuX3pvbmUoU3Vic2NyaXB0aW9uWm9uZSkgb3Igbm90XG4gICAgICBpZiAoc3Vic2NyaXB0aW9uWm9uZSAmJiBzdWJzY3JpcHRpb25ab25lICE9PSBjdXJyZW50Wm9uZSkge1xuICAgICAgICByZXR1cm4gc3Vic2NyaXB0aW9uWm9uZS5ydW4oZXJyb3IsIHRoaXMsIGFyZ3VtZW50cyBhcyBhbnksIGVycm9yU291cmNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBlcnJvci5hcHBseSh0aGlzLCBhcmd1bWVudHMgYXMgYW55KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgU3Vic2NyaWJlci5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbih0aGlzOiBab25lU3Vic2NyaWJlckNvbnRleHQpIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRab25lID0gWm9uZS5jdXJyZW50O1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uWm9uZSA9IHRoaXMuX3pvbmU7XG5cbiAgICAgIC8vIGZvciBwZXJmb3JtYW5jZSBjb25jZXJuLCBjaGVjayBab25lLmN1cnJlbnRcbiAgICAgIC8vIGVxdWFsIHdpdGggdGhpcy5fem9uZShTdWJzY3JpcHRpb25ab25lKSBvciBub3RcbiAgICAgIGlmIChzdWJzY3JpcHRpb25ab25lICYmIHN1YnNjcmlwdGlvblpvbmUgIT09IGN1cnJlbnRab25lKSB7XG4gICAgICAgIHJldHVybiBzdWJzY3JpcHRpb25ab25lLnJ1bihjb21wbGV0ZSwgdGhpcywgYXJndW1lbnRzIGFzIGFueSwgY29tcGxldGVTb3VyY2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbXBsZXRlLmNhbGwodGhpcyk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICBwYXRjaE9ic2VydmFibGUoKTtcbiAgcGF0Y2hTdWJzY3JpcHRpb24oKTtcbiAgcGF0Y2hTdWJzY3JpYmVyKCk7XG59KTtcbiJdfQ==