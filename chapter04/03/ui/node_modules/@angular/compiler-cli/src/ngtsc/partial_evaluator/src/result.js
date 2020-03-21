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
        define("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/result", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A collection of publicly exported declarations from a module. Each declaration is evaluated
     * lazily upon request.
     */
    var ResolvedModule = /** @class */ (function () {
        function ResolvedModule(exports, evaluate) {
            this.exports = exports;
            this.evaluate = evaluate;
        }
        ResolvedModule.prototype.getExport = function (name) {
            if (!this.exports.has(name)) {
                return undefined;
            }
            return this.evaluate(this.exports.get(name));
        };
        ResolvedModule.prototype.getExports = function () {
            var _this = this;
            var map = new Map();
            this.exports.forEach(function (decl, name) { map.set(name, _this.evaluate(decl)); });
            return map;
        };
        return ResolvedModule;
    }());
    exports.ResolvedModule = ResolvedModule;
    /**
     * A value member of an enumeration.
     *
     * Contains a `Reference` to the enumeration itself, and the name of the referenced member.
     */
    var EnumValue = /** @class */ (function () {
        function EnumValue(enumRef, name, resolved) {
            this.enumRef = enumRef;
            this.name = name;
            this.resolved = resolved;
        }
        return EnumValue;
    }());
    exports.EnumValue = EnumValue;
    /**
     * An implementation of a known function that can be statically evaluated.
     * It could be a built-in function or method (such as `Array.prototype.slice`) or a TypeScript
     * helper (such as `__spread`).
     */
    var KnownFn = /** @class */ (function () {
        function KnownFn() {
        }
        return KnownFn;
    }());
    exports.KnownFn = KnownFn;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9wYXJ0aWFsX2V2YWx1YXRvci9zcmMvcmVzdWx0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBb0NIOzs7T0FHRztJQUNIO1FBQ0Usd0JBQ1ksT0FBaUMsRUFDakMsUUFBOEM7WUFEOUMsWUFBTyxHQUFQLE9BQU8sQ0FBMEI7WUFDakMsYUFBUSxHQUFSLFFBQVEsQ0FBc0M7UUFBRyxDQUFDO1FBRTlELGtDQUFTLEdBQVQsVUFBVSxJQUFZO1lBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDM0IsT0FBTyxTQUFTLENBQUM7YUFDbEI7WUFFRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFHLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBRUQsbUNBQVUsR0FBVjtZQUFBLGlCQUlDO1lBSEMsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQXlCLENBQUM7WUFDN0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUUsSUFBSSxJQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlFLE9BQU8sR0FBRyxDQUFDO1FBQ2IsQ0FBQztRQUNILHFCQUFDO0lBQUQsQ0FBQyxBQWxCRCxJQWtCQztJQWxCWSx3Q0FBYztJQW9CM0I7Ozs7T0FJRztJQUNIO1FBQ0UsbUJBQ2EsT0FBc0MsRUFBVyxJQUFZLEVBQzdELFFBQXVCO1lBRHZCLFlBQU8sR0FBUCxPQUFPLENBQStCO1lBQVcsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUM3RCxhQUFRLEdBQVIsUUFBUSxDQUFlO1FBQUcsQ0FBQztRQUMxQyxnQkFBQztJQUFELENBQUMsQUFKRCxJQUlDO0lBSlksOEJBQVM7SUFNdEI7Ozs7T0FJRztJQUNIO1FBQUE7UUFFQSxDQUFDO1FBQUQsY0FBQztJQUFELENBQUMsQUFGRCxJQUVDO0lBRnFCLDBCQUFPIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtSZWZlcmVuY2V9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtEZWNsYXJhdGlvbn0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5cbmltcG9ydCB7RHluYW1pY1ZhbHVlfSBmcm9tICcuL2R5bmFtaWMnO1xuXG5cbi8qKlxuICogQSB2YWx1ZSByZXN1bHRpbmcgZnJvbSBzdGF0aWMgcmVzb2x1dGlvbi5cbiAqXG4gKiBUaGlzIGNvdWxkIGJlIGEgcHJpbWl0aXZlLCBjb2xsZWN0aW9uIHR5cGUsIHJlZmVyZW5jZSB0byBhIGB0cy5Ob2RlYCB0aGF0IGRlY2xhcmVzIGFcbiAqIG5vbi1wcmltaXRpdmUgdmFsdWUsIG9yIGEgc3BlY2lhbCBgRHluYW1pY1ZhbHVlYCB0eXBlIHdoaWNoIGluZGljYXRlcyB0aGUgdmFsdWUgd2FzIG5vdFxuICogYXZhaWxhYmxlIHN0YXRpY2FsbHkuXG4gKi9cbmV4cG9ydCB0eXBlIFJlc29sdmVkVmFsdWUgPSBudW1iZXIgfCBib29sZWFuIHwgc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCB8IFJlZmVyZW5jZSB8IEVudW1WYWx1ZSB8XG4gICAgUmVzb2x2ZWRWYWx1ZUFycmF5IHwgUmVzb2x2ZWRWYWx1ZU1hcCB8IFJlc29sdmVkTW9kdWxlIHwgS25vd25GbiB8IER5bmFtaWNWYWx1ZTx1bmtub3duPjtcblxuLyoqXG4gKiBBbiBhcnJheSBvZiBgUmVzb2x2ZWRWYWx1ZWBzLlxuICpcbiAqIFRoaXMgaXMgYSByZWlmaWVkIHR5cGUgdG8gYWxsb3cgdGhlIGNpcmN1bGFyIHJlZmVyZW5jZSBvZiBgUmVzb2x2ZWRWYWx1ZWAgLT4gYFJlc29sdmVkVmFsdWVBcnJheWBcbiAqIC0+IGBSZXNvbHZlZFZhbHVlYC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXNvbHZlZFZhbHVlQXJyYXkgZXh0ZW5kcyBBcnJheTxSZXNvbHZlZFZhbHVlPiB7fVxuXG4vKipcbiAqIEEgbWFwIG9mIHN0cmluZ3MgdG8gYFJlc29sdmVkVmFsdWVgcy5cbiAqXG4gKiBUaGlzIGlzIGEgcmVpZmllZCB0eXBlIHRvIGFsbG93IHRoZSBjaXJjdWxhciByZWZlcmVuY2Ugb2YgYFJlc29sdmVkVmFsdWVgIC0+IGBSZXNvbHZlZFZhbHVlTWFwYFxuICogLT4gYFJlc29sdmVkVmFsdWVgLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlc29sdmVkVmFsdWVNYXAgZXh0ZW5kcyBNYXA8c3RyaW5nLCBSZXNvbHZlZFZhbHVlPiB7fVxuXG4vKipcbiAqIEEgY29sbGVjdGlvbiBvZiBwdWJsaWNseSBleHBvcnRlZCBkZWNsYXJhdGlvbnMgZnJvbSBhIG1vZHVsZS4gRWFjaCBkZWNsYXJhdGlvbiBpcyBldmFsdWF0ZWRcbiAqIGxhemlseSB1cG9uIHJlcXVlc3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNvbHZlZE1vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBleHBvcnRzOiBNYXA8c3RyaW5nLCBEZWNsYXJhdGlvbj4sXG4gICAgICBwcml2YXRlIGV2YWx1YXRlOiAoZGVjbDogRGVjbGFyYXRpb24pID0+IFJlc29sdmVkVmFsdWUpIHt9XG5cbiAgZ2V0RXhwb3J0KG5hbWU6IHN0cmluZyk6IFJlc29sdmVkVmFsdWUge1xuICAgIGlmICghdGhpcy5leHBvcnRzLmhhcyhuYW1lKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5ldmFsdWF0ZSh0aGlzLmV4cG9ydHMuZ2V0KG5hbWUpICEpO1xuICB9XG5cbiAgZ2V0RXhwb3J0cygpOiBSZXNvbHZlZFZhbHVlTWFwIHtcbiAgICBjb25zdCBtYXAgPSBuZXcgTWFwPHN0cmluZywgUmVzb2x2ZWRWYWx1ZT4oKTtcbiAgICB0aGlzLmV4cG9ydHMuZm9yRWFjaCgoZGVjbCwgbmFtZSkgPT4geyBtYXAuc2V0KG5hbWUsIHRoaXMuZXZhbHVhdGUoZGVjbCkpOyB9KTtcbiAgICByZXR1cm4gbWFwO1xuICB9XG59XG5cbi8qKlxuICogQSB2YWx1ZSBtZW1iZXIgb2YgYW4gZW51bWVyYXRpb24uXG4gKlxuICogQ29udGFpbnMgYSBgUmVmZXJlbmNlYCB0byB0aGUgZW51bWVyYXRpb24gaXRzZWxmLCBhbmQgdGhlIG5hbWUgb2YgdGhlIHJlZmVyZW5jZWQgbWVtYmVyLlxuICovXG5leHBvcnQgY2xhc3MgRW51bVZhbHVlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSBlbnVtUmVmOiBSZWZlcmVuY2U8dHMuRW51bURlY2xhcmF0aW9uPiwgcmVhZG9ubHkgbmFtZTogc3RyaW5nLFxuICAgICAgcmVhZG9ubHkgcmVzb2x2ZWQ6IFJlc29sdmVkVmFsdWUpIHt9XG59XG5cbi8qKlxuICogQW4gaW1wbGVtZW50YXRpb24gb2YgYSBrbm93biBmdW5jdGlvbiB0aGF0IGNhbiBiZSBzdGF0aWNhbGx5IGV2YWx1YXRlZC5cbiAqIEl0IGNvdWxkIGJlIGEgYnVpbHQtaW4gZnVuY3Rpb24gb3IgbWV0aG9kIChzdWNoIGFzIGBBcnJheS5wcm90b3R5cGUuc2xpY2VgKSBvciBhIFR5cGVTY3JpcHRcbiAqIGhlbHBlciAoc3VjaCBhcyBgX19zcHJlYWRgKS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEtub3duRm4ge1xuICBhYnN0cmFjdCBldmFsdWF0ZShub2RlOiB0cy5DYWxsRXhwcmVzc2lvbiwgYXJnczogUmVzb2x2ZWRWYWx1ZUFycmF5KTogUmVzb2x2ZWRWYWx1ZTtcbn1cbiJdfQ==