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
        define("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/builtin", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/partial_evaluator/src/dynamic", "@angular/compiler-cli/src/ngtsc/partial_evaluator/src/result"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var dynamic_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/dynamic");
    var result_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/result");
    var ArraySliceBuiltinFn = /** @class */ (function (_super) {
        tslib_1.__extends(ArraySliceBuiltinFn, _super);
        function ArraySliceBuiltinFn(lhs) {
            var _this = _super.call(this) || this;
            _this.lhs = lhs;
            return _this;
        }
        ArraySliceBuiltinFn.prototype.evaluate = function (node, args) {
            if (args.length === 0) {
                return this.lhs;
            }
            else {
                return dynamic_1.DynamicValue.fromUnknown(node);
            }
        };
        return ArraySliceBuiltinFn;
    }(result_1.KnownFn));
    exports.ArraySliceBuiltinFn = ArraySliceBuiltinFn;
    var ArrayConcatBuiltinFn = /** @class */ (function (_super) {
        tslib_1.__extends(ArrayConcatBuiltinFn, _super);
        function ArrayConcatBuiltinFn(lhs) {
            var _this = _super.call(this) || this;
            _this.lhs = lhs;
            return _this;
        }
        ArrayConcatBuiltinFn.prototype.evaluate = function (node, args) {
            var e_1, _a;
            var result = tslib_1.__spread(this.lhs);
            try {
                for (var args_1 = tslib_1.__values(args), args_1_1 = args_1.next(); !args_1_1.done; args_1_1 = args_1.next()) {
                    var arg = args_1_1.value;
                    if (arg instanceof dynamic_1.DynamicValue) {
                        result.push(dynamic_1.DynamicValue.fromDynamicInput(node, arg));
                    }
                    else if (Array.isArray(arg)) {
                        result.push.apply(result, tslib_1.__spread(arg));
                    }
                    else {
                        result.push(arg);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (args_1_1 && !args_1_1.done && (_a = args_1.return)) _a.call(args_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result;
        };
        return ArrayConcatBuiltinFn;
    }(result_1.KnownFn));
    exports.ArrayConcatBuiltinFn = ArrayConcatBuiltinFn;
    var ObjectAssignBuiltinFn = /** @class */ (function (_super) {
        tslib_1.__extends(ObjectAssignBuiltinFn, _super);
        function ObjectAssignBuiltinFn() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ObjectAssignBuiltinFn.prototype.evaluate = function (node, args) {
            var e_2, _a, e_3, _b;
            if (args.length === 0) {
                return dynamic_1.DynamicValue.fromUnsupportedSyntax(node);
            }
            try {
                for (var args_2 = tslib_1.__values(args), args_2_1 = args_2.next(); !args_2_1.done; args_2_1 = args_2.next()) {
                    var arg = args_2_1.value;
                    if (arg instanceof dynamic_1.DynamicValue) {
                        return dynamic_1.DynamicValue.fromDynamicInput(node, arg);
                    }
                    else if (!(arg instanceof Map)) {
                        return dynamic_1.DynamicValue.fromUnsupportedSyntax(node);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (args_2_1 && !args_2_1.done && (_a = args_2.return)) _a.call(args_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            var _c = tslib_1.__read(args), target = _c[0], sources = _c.slice(1);
            try {
                for (var sources_1 = tslib_1.__values(sources), sources_1_1 = sources_1.next(); !sources_1_1.done; sources_1_1 = sources_1.next()) {
                    var source = sources_1_1.value;
                    source.forEach(function (value, key) { return target.set(key, value); });
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (sources_1_1 && !sources_1_1.done && (_b = sources_1.return)) _b.call(sources_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return target;
        };
        return ObjectAssignBuiltinFn;
    }(result_1.KnownFn));
    exports.ObjectAssignBuiltinFn = ObjectAssignBuiltinFn;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbHRpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvcGFydGlhbF9ldmFsdWF0b3Ivc3JjL2J1aWx0aW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBSUgseUZBQXVDO0lBQ3ZDLHVGQUFvRTtJQUVwRTtRQUF5QywrQ0FBTztRQUM5Qyw2QkFBb0IsR0FBdUI7WUFBM0MsWUFBK0MsaUJBQU8sU0FBRztZQUFyQyxTQUFHLEdBQUgsR0FBRyxDQUFvQjs7UUFBYSxDQUFDO1FBRXpELHNDQUFRLEdBQVIsVUFBUyxJQUF1QixFQUFFLElBQXdCO1lBQ3hELElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3JCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQzthQUNqQjtpQkFBTTtnQkFDTCxPQUFPLHNCQUFZLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3ZDO1FBQ0gsQ0FBQztRQUNILDBCQUFDO0lBQUQsQ0FBQyxBQVZELENBQXlDLGdCQUFPLEdBVS9DO0lBVlksa0RBQW1CO0lBWWhDO1FBQTBDLGdEQUFPO1FBQy9DLDhCQUFvQixHQUF1QjtZQUEzQyxZQUErQyxpQkFBTyxTQUFHO1lBQXJDLFNBQUcsR0FBSCxHQUFHLENBQW9COztRQUFhLENBQUM7UUFFekQsdUNBQVEsR0FBUixVQUFTLElBQXVCLEVBQUUsSUFBd0I7O1lBQ3hELElBQU0sTUFBTSxvQkFBMkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztnQkFDakQsS0FBa0IsSUFBQSxTQUFBLGlCQUFBLElBQUksQ0FBQSwwQkFBQSw0Q0FBRTtvQkFBbkIsSUFBTSxHQUFHLGlCQUFBO29CQUNaLElBQUksR0FBRyxZQUFZLHNCQUFZLEVBQUU7d0JBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDdkQ7eUJBQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUM3QixNQUFNLENBQUMsSUFBSSxPQUFYLE1BQU0sbUJBQVMsR0FBRyxHQUFFO3FCQUNyQjt5QkFBTTt3QkFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUNsQjtpQkFDRjs7Ozs7Ozs7O1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUNILDJCQUFDO0lBQUQsQ0FBQyxBQWhCRCxDQUEwQyxnQkFBTyxHQWdCaEQ7SUFoQlksb0RBQW9CO0lBa0JqQztRQUEyQyxpREFBTztRQUFsRDs7UUFrQkEsQ0FBQztRQWpCQyx3Q0FBUSxHQUFSLFVBQVMsSUFBdUIsRUFBRSxJQUF3Qjs7WUFDeEQsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDckIsT0FBTyxzQkFBWSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2pEOztnQkFDRCxLQUFrQixJQUFBLFNBQUEsaUJBQUEsSUFBSSxDQUFBLDBCQUFBLDRDQUFFO29CQUFuQixJQUFNLEdBQUcsaUJBQUE7b0JBQ1osSUFBSSxHQUFHLFlBQVksc0JBQVksRUFBRTt3QkFDL0IsT0FBTyxzQkFBWSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztxQkFDakQ7eUJBQU0sSUFBSSxDQUFDLENBQUMsR0FBRyxZQUFZLEdBQUcsQ0FBQyxFQUFFO3dCQUNoQyxPQUFPLHNCQUFZLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ2pEO2lCQUNGOzs7Ozs7Ozs7WUFDSyxJQUFBLHlCQUEyRCxFQUExRCxjQUFNLEVBQUUscUJBQWtELENBQUM7O2dCQUNsRSxLQUFxQixJQUFBLFlBQUEsaUJBQUEsT0FBTyxDQUFBLGdDQUFBLHFEQUFFO29CQUF6QixJQUFNLE1BQU0sb0JBQUE7b0JBQ2YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUssRUFBRSxHQUFHLElBQUssT0FBQSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDO2lCQUN4RDs7Ozs7Ozs7O1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUNILDRCQUFDO0lBQUQsQ0FBQyxBQWxCRCxDQUEyQyxnQkFBTyxHQWtCakQ7SUFsQlksc0RBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtEeW5hbWljVmFsdWV9IGZyb20gJy4vZHluYW1pYyc7XG5pbXBvcnQge0tub3duRm4sIFJlc29sdmVkVmFsdWUsIFJlc29sdmVkVmFsdWVBcnJheX0gZnJvbSAnLi9yZXN1bHQnO1xuXG5leHBvcnQgY2xhc3MgQXJyYXlTbGljZUJ1aWx0aW5GbiBleHRlbmRzIEtub3duRm4ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGxoczogUmVzb2x2ZWRWYWx1ZUFycmF5KSB7IHN1cGVyKCk7IH1cblxuICBldmFsdWF0ZShub2RlOiB0cy5DYWxsRXhwcmVzc2lvbiwgYXJnczogUmVzb2x2ZWRWYWx1ZUFycmF5KTogUmVzb2x2ZWRWYWx1ZSB7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5saHM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBEeW5hbWljVmFsdWUuZnJvbVVua25vd24obm9kZSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBcnJheUNvbmNhdEJ1aWx0aW5GbiBleHRlbmRzIEtub3duRm4ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGxoczogUmVzb2x2ZWRWYWx1ZUFycmF5KSB7IHN1cGVyKCk7IH1cblxuICBldmFsdWF0ZShub2RlOiB0cy5DYWxsRXhwcmVzc2lvbiwgYXJnczogUmVzb2x2ZWRWYWx1ZUFycmF5KTogUmVzb2x2ZWRWYWx1ZSB7XG4gICAgY29uc3QgcmVzdWx0OiBSZXNvbHZlZFZhbHVlQXJyYXkgPSBbLi4udGhpcy5saHNdO1xuICAgIGZvciAoY29uc3QgYXJnIG9mIGFyZ3MpIHtcbiAgICAgIGlmIChhcmcgaW5zdGFuY2VvZiBEeW5hbWljVmFsdWUpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goRHluYW1pY1ZhbHVlLmZyb21EeW5hbWljSW5wdXQobm9kZSwgYXJnKSk7XG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYXJnKSkge1xuICAgICAgICByZXN1bHQucHVzaCguLi5hcmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0LnB1c2goYXJnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2JqZWN0QXNzaWduQnVpbHRpbkZuIGV4dGVuZHMgS25vd25GbiB7XG4gIGV2YWx1YXRlKG5vZGU6IHRzLkNhbGxFeHByZXNzaW9uLCBhcmdzOiBSZXNvbHZlZFZhbHVlQXJyYXkpOiBSZXNvbHZlZFZhbHVlIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBEeW5hbWljVmFsdWUuZnJvbVVuc3VwcG9ydGVkU3ludGF4KG5vZGUpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGFyZyBvZiBhcmdzKSB7XG4gICAgICBpZiAoYXJnIGluc3RhbmNlb2YgRHluYW1pY1ZhbHVlKSB7XG4gICAgICAgIHJldHVybiBEeW5hbWljVmFsdWUuZnJvbUR5bmFtaWNJbnB1dChub2RlLCBhcmcpO1xuICAgICAgfSBlbHNlIGlmICghKGFyZyBpbnN0YW5jZW9mIE1hcCkpIHtcbiAgICAgICAgcmV0dXJuIER5bmFtaWNWYWx1ZS5mcm9tVW5zdXBwb3J0ZWRTeW50YXgobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IFt0YXJnZXQsIC4uLnNvdXJjZXNdID0gYXJncyBhcyBNYXA8c3RyaW5nLCBSZXNvbHZlZFZhbHVlPltdO1xuICAgIGZvciAoY29uc3Qgc291cmNlIG9mIHNvdXJjZXMpIHtcbiAgICAgIHNvdXJjZS5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB0YXJnZXQuc2V0KGtleSwgdmFsdWUpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxufVxuIl19