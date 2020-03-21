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
Zone.__load_patch('ResizeObserver', function (global, Zone, api) {
    var ResizeObserver = global['ResizeObserver'];
    if (!ResizeObserver) {
        return;
    }
    var resizeObserverSymbol = api.symbol('ResizeObserver');
    api.patchMethod(global, 'ResizeObserver', function (delegate) { return function (self, args) {
        var callback = args.length > 0 ? args[0] : null;
        if (callback) {
            args[0] = function (entries, observer) {
                var e_1, _a;
                var _this = this;
                var zones = {};
                var currZone = Zone.current;
                try {
                    for (var entries_1 = __values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
                        var entry = entries_1_1.value;
                        var zone = entry.target[resizeObserverSymbol];
                        if (!zone) {
                            zone = currZone;
                        }
                        var zoneEntriesInfo = zones[zone.name];
                        if (!zoneEntriesInfo) {
                            zones[zone.name] = zoneEntriesInfo = { entries: [], zone: zone };
                        }
                        zoneEntriesInfo.entries.push(entry);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                Object.keys(zones).forEach(function (zoneName) {
                    var zoneEntriesInfo = zones[zoneName];
                    if (zoneEntriesInfo.zone !== Zone.current) {
                        zoneEntriesInfo.zone.run(callback, _this, [zoneEntriesInfo.entries, observer], 'ResizeObserver');
                    }
                    else {
                        callback.call(_this, zoneEntriesInfo.entries, observer);
                    }
                });
            };
        }
        return args.length > 0 ? new ResizeObserver(args[0]) : new ResizeObserver();
    }; });
    api.patchMethod(ResizeObserver.prototype, 'observe', function (delegate) { return function (self, args) {
        var target = args.length > 0 ? args[0] : null;
        if (!target) {
            return delegate.apply(self, args);
        }
        var targets = self[resizeObserverSymbol];
        if (!targets) {
            targets = self[resizeObserverSymbol] = [];
        }
        targets.push(target);
        target[resizeObserverSymbol] = Zone.current;
        return delegate.apply(self, args);
    }; });
    api.patchMethod(ResizeObserver.prototype, 'unobserve', function (delegate) { return function (self, args) {
        var target = args.length > 0 ? args[0] : null;
        if (!target) {
            return delegate.apply(self, args);
        }
        var targets = self[resizeObserverSymbol];
        if (targets) {
            for (var i = 0; i < targets.length; i++) {
                if (targets[i] === target) {
                    targets.splice(i, 1);
                    break;
                }
            }
        }
        target[resizeObserverSymbol] = undefined;
        return delegate.apply(self, args);
    }; });
    api.patchMethod(ResizeObserver.prototype, 'disconnect', function (delegate) { return function (self, args) {
        var targets = self[resizeObserverSymbol];
        if (targets) {
            targets.forEach(function (target) { target[resizeObserverSymbol] = undefined; });
            self[resizeObserverSymbol] = undefined;
        }
        return delegate.apply(self, args);
    }; });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViYXBpcy1yZXNpemUtb2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy96b25lLmpzL2xpYi9icm93c2VyL3dlYmFwaXMtcmVzaXplLW9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxVQUFDLE1BQVcsRUFBRSxJQUFTLEVBQUUsR0FBaUI7SUFDNUUsSUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDaEQsSUFBSSxDQUFDLGNBQWMsRUFBRTtRQUNuQixPQUFPO0tBQ1I7SUFFRCxJQUFNLG9CQUFvQixHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUUxRCxHQUFHLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxVQUFDLFFBQWtCLElBQUssT0FBQSxVQUFDLElBQVMsRUFBRSxJQUFXO1FBQ3ZGLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNsRCxJQUFJLFFBQVEsRUFBRTtZQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFTLE9BQVksRUFBRSxRQUFhOztnQkFBcEMsaUJBd0JUO2dCQXZCQyxJQUFNLEtBQUssR0FBOEIsRUFBRSxDQUFDO2dCQUM1QyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDOztvQkFDOUIsS0FBa0IsSUFBQSxZQUFBLFNBQUEsT0FBTyxDQUFBLGdDQUFBLHFEQUFFO3dCQUF0QixJQUFJLEtBQUssb0JBQUE7d0JBQ1osSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0Is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LEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDekMsSUFBSSxPQUFPLEVBQUU7WUFDWCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdkMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxFQUFFO29CQUN6QixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDckIsTUFBTTtpQkFDUDthQUNGO1NBQ0Y7UUFDRCxNQUFNLENBQUMsb0JBQW9CLENBQUMsR0FBRyxTQUFTLENBQUM7UUFDekMsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNwQyxDQUFDLEVBaEI4RCxDQWdCOUQsQ0FBQyxDQUFDO0lBRVAsR0FBRyxDQUFDLFdBQVcsQ0FDWCxjQUFjLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxVQUFDLFFBQWtCLElBQUssT0FBQSxVQUFDLElBQVMsRUFBRSxJQUFXO1FBQ3JGLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzNDLElBQUksT0FBTyxFQUFFO1lBQ1gsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQVcsSUFBTyxNQUFNLENBQUMsb0JBQW9CLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxTQUFTLENBQUM7U0FDeEM7UUFDRCxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BDLENBQUMsRUFQK0QsQ0FPL0QsQ0FBQyxDQUFDO0FBQ1QsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5ab25lLl9fbG9hZF9wYXRjaCgnUmVzaXplT2JzZXJ2ZXInLCAoZ2xvYmFsOiBhbnksIFpvbmU6IGFueSwgYXBpOiBfWm9uZVByaXZhdGUpID0+IHtcbiAgY29uc3QgUmVzaXplT2JzZXJ2ZXIgPSBnbG9iYWxbJ1Jlc2l6ZU9ic2VydmVyJ107XG4gIGlmICghUmVzaXplT2JzZXJ2ZXIpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCByZXNpemVPYnNlcnZlclN5bWJvbCA9IGFwaS5zeW1ib2woJ1Jlc2l6ZU9ic2VydmVyJyk7XG5cbiAgYXBpLnBhdGNoTWV0aG9kKGdsb2JhbCwgJ1Jlc2l6ZU9ic2VydmVyJywgKGRlbGVnYXRlOiBGdW5jdGlvbikgPT4gKHNlbGY6IGFueSwgYXJnczogYW55W10pID0+IHtcbiAgICBjb25zdCBjYWxsYmFjayA9IGFyZ3MubGVuZ3RoID4gMCA/IGFyZ3NbMF0gOiBudWxsO1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgYXJnc1swXSA9IGZ1bmN0aW9uKGVudHJpZXM6IGFueSwgb2JzZXJ2ZXI6IGFueSkge1xuICAgICAgICBjb25zdCB6b25lczoge1t6b25lTmFtZTogc3RyaW5nXTogYW55fSA9IHt9O1xuICAgICAgICBjb25zdCBjdXJyWm9uZSA9IFpvbmUuY3VycmVudDtcbiAgICAgICAgZm9yIChsZXQgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgIGxldCB6b25lID0gZW50cnkudGFyZ2V0W3Jlc2l6ZU9ic2VydmVyU3ltYm9sXTtcbiAgICAgICAgICBpZiAoIXpvbmUpIHtcbiAgICAgICAgICAgIHpvbmUgPSBjdXJyWm9uZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IHpvbmVFbnRyaWVzSW5mbyA9IHpvbmVzW3pvbmUubmFtZV07XG4gICAgICAgICAgaWYgKCF6b25lRW50cmllc0luZm8pIHtcbiAgICAgICAgICAgIHpvbmVzW3pvbmUubmFtZV0gPSB6b25lRW50cmllc0luZm8gPSB7ZW50cmllczogW10sIHpvbmU6IHpvbmV9O1xuICAgICAgICAgIH1cbiAgICAgICAgICB6b25lRW50cmllc0luZm8uZW50cmllcy5wdXNoKGVudHJ5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5rZXlzKHpvbmVzKS5mb3JFYWNoKHpvbmVOYW1lID0+IHtcbiAgICAgICAgICBjb25zdCB6b25lRW50cmllc0luZm8gPSB6b25lc1t6b25lTmFtZV07XG4gICAgICAgICAgaWYgKHpvbmVFbnRyaWVzSW5mby56b25lICE9PSBab25lLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHpvbmVFbnRyaWVzSW5mby56b25lLnJ1bihcbiAgICAgICAgICAgICAgICBjYWxsYmFjaywgdGhpcywgW3pvbmVFbnRyaWVzSW5mby5lbnRyaWVzLCBvYnNlcnZlcl0sICdSZXNpemVPYnNlcnZlcicpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIHpvbmVFbnRyaWVzSW5mby5lbnRyaWVzLCBvYnNlcnZlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBhcmdzLmxlbmd0aCA+IDAgPyBuZXcgUmVzaXplT2JzZXJ2ZXIoYXJnc1swXSkgOiBuZXcgUmVzaXplT2JzZXJ2ZXIoKTtcbiAgfSk7XG5cbiAgYXBpLnBhdGNoTWV0aG9kKFxuICAgICAgUmVzaXplT2JzZXJ2ZXIucHJvdG90eXBlLCAnb2JzZXJ2ZScsIChkZWxlZ2F0ZTogRnVuY3Rpb24pID0+IChzZWxmOiBhbnksIGFyZ3M6IGFueVtdKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGFyZ3MubGVuZ3RoID4gMCA/IGFyZ3NbMF0gOiBudWxsO1xuICAgICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZS5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGFyZ2V0cyA9IHNlbGZbcmVzaXplT2JzZXJ2ZXJTeW1ib2xdO1xuICAgICAgICBpZiAoIXRhcmdldHMpIHtcbiAgICAgICAgICB0YXJnZXRzID0gc2VsZltyZXNpemVPYnNlcnZlclN5bWJvbF0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0YXJnZXRzLnB1c2godGFyZ2V0KTtcbiAgICAgICAgdGFyZ2V0W3Jlc2l6ZU9ic2VydmVyU3ltYm9sXSA9IFpvbmUuY3VycmVudDtcbiAgICAgICAgcmV0dXJuIGRlbGVnYXRlLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgfSk7XG5cbiAgYXBpLnBhdGNoTWV0aG9kKFxuICAgICAgUmVzaXplT2JzZXJ2ZXIucHJvdG90eXBlLCAndW5vYnNlcnZlJywgKGRlbGVnYXRlOiBGdW5jdGlvbikgPT4gKHNlbGY6IGFueSwgYXJnczogYW55W10pID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gYXJncy5sZW5ndGggPiAwID8gYXJnc1swXSA6IG51bGw7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgcmV0dXJuIGRlbGVnYXRlLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGxldCB0YXJnZXRzID0gc2VsZltyZXNpemVPYnNlcnZlclN5bWJvbF07XG4gICAgICAgIGlmICh0YXJnZXRzKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YXJnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGFyZ2V0c1tpXSA9PT0gdGFyZ2V0KSB7XG4gICAgICAgICAgICAgIHRhcmdldHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0W3Jlc2l6ZU9ic2VydmVyU3ltYm9sXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIGRlbGVnYXRlLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgfSk7XG5cbiAgYXBpLnBhdGNoTWV0aG9kKFxuICAgICAgUmVzaXplT2JzZXJ2ZXIucHJvdG90eXBlLCAnZGlzY29ubmVjdCcsIChkZWxlZ2F0ZTogRnVuY3Rpb24pID0+IChzZWxmOiBhbnksIGFyZ3M6IGFueVtdKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldHMgPSBzZWxmW3Jlc2l6ZU9ic2VydmVyU3ltYm9sXTtcbiAgICAgICAgaWYgKHRhcmdldHMpIHtcbiAgICAgICAgICB0YXJnZXRzLmZvckVhY2goKHRhcmdldDogYW55KSA9PiB7IHRhcmdldFtyZXNpemVPYnNlcnZlclN5bWJvbF0gPSB1bmRlZmluZWQ7IH0pO1xuICAgICAgICAgIHNlbGZbcmVzaXplT2JzZXJ2ZXJTeW1ib2xdID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWxlZ2F0ZS5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgIH0pO1xufSk7XG4iXX0=