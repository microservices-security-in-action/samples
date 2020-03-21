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
        define("@angular/compiler-cli/ngcc/src/writing/package_json_updater", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    /**
     * A utility class providing a fluent API for recording multiple changes to a `package.json` file
     * (and optionally its in-memory parsed representation).
     *
     * NOTE: This class should generally not be instantiated directly; instances are implicitly created
     *       via `PackageJsonUpdater#createUpdate()`.
     */
    var PackageJsonUpdate = /** @class */ (function () {
        function PackageJsonUpdate(writeChangesImpl) {
            this.writeChangesImpl = writeChangesImpl;
            this.changes = [];
            this.applied = false;
        }
        /**
         * Record a change to a `package.json` property.
         *
         * If the ancestor objects do not yet exist in the `package.json` file, they will be created. The
         * positioning of the property can also be specified. (If the property already exists, it will be
         * moved accordingly.)
         *
         * NOTE: Property positioning is only guaranteed to be respected in the serialized `package.json`
         *       file. Positioning will not be taken into account when updating in-memory representations.
         *
         * NOTE 2: Property positioning only affects the last property in `propertyPath`. Ancestor
         *         objects' positioning will not be affected.
         *
         * @param propertyPath The path of a (possibly nested) property to add/update.
         * @param value The new value to set the property to.
         * @param position The desired position for the added/updated property.
         */
        PackageJsonUpdate.prototype.addChange = function (propertyPath, value, positioning) {
            if (positioning === void 0) { positioning = 'unimportant'; }
            this.ensureNotApplied();
            this.changes.push([propertyPath, value, positioning]);
            return this;
        };
        /**
         * Write the recorded changes to the associated `package.json` file (and optionally a
         * pre-existing, in-memory representation of it).
         *
         * @param packageJsonPath The path to the `package.json` file that needs to be updated.
         * @param parsedJson A pre-existing, in-memory representation of the `package.json` file that
         *                   needs to be updated as well.
         */
        PackageJsonUpdate.prototype.writeChanges = function (packageJsonPath, parsedJson) {
            this.ensureNotApplied();
            this.writeChangesImpl(this.changes, packageJsonPath, parsedJson);
            this.applied = true;
        };
        PackageJsonUpdate.prototype.ensureNotApplied = function () {
            if (this.applied) {
                throw new Error('Trying to apply a `PackageJsonUpdate` that has already been applied.');
            }
        };
        return PackageJsonUpdate;
    }());
    exports.PackageJsonUpdate = PackageJsonUpdate;
    /** A `PackageJsonUpdater` that writes directly to the file-system. */
    var DirectPackageJsonUpdater = /** @class */ (function () {
        function DirectPackageJsonUpdater(fs) {
            this.fs = fs;
        }
        DirectPackageJsonUpdater.prototype.createUpdate = function () {
            var _this = this;
            return new PackageJsonUpdate(function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return _this.writeChanges.apply(_this, tslib_1.__spread(args));
            });
        };
        DirectPackageJsonUpdater.prototype.writeChanges = function (changes, packageJsonPath, preExistingParsedJson) {
            var e_1, _a;
            if (changes.length === 0) {
                throw new Error("No changes to write to '" + packageJsonPath + "'.");
            }
            // Read and parse the `package.json` content.
            // NOTE: We are not using `preExistingParsedJson` (even if specified) to avoid corrupting the
            //       content on disk in case `preExistingParsedJson` is outdated.
            var parsedJson = this.fs.exists(packageJsonPath) ? JSON.parse(this.fs.readFile(packageJsonPath)) : {};
            try {
                // Apply all changes to both the canonical representation (read from disk) and any pre-existing,
                // in-memory representation.
                for (var changes_1 = tslib_1.__values(changes), changes_1_1 = changes_1.next(); !changes_1_1.done; changes_1_1 = changes_1.next()) {
                    var _b = tslib_1.__read(changes_1_1.value, 3), propPath = _b[0], value = _b[1], positioning = _b[2];
                    if (propPath.length === 0) {
                        throw new Error("Missing property path for writing value to '" + packageJsonPath + "'.");
                    }
                    applyChange(parsedJson, propPath, value, positioning);
                    if (preExistingParsedJson) {
                        // No need to take property positioning into account for in-memory representations.
                        applyChange(preExistingParsedJson, propPath, value, 'unimportant');
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (changes_1_1 && !changes_1_1.done && (_a = changes_1.return)) _a.call(changes_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Ensure the containing directory exists (in case this is a synthesized `package.json` due to a
            // custom configuration) and write the updated content to disk.
            this.fs.ensureDir(file_system_1.dirname(packageJsonPath));
            this.fs.writeFile(packageJsonPath, JSON.stringify(parsedJson, null, 2) + "\n");
        };
        return DirectPackageJsonUpdater;
    }());
    exports.DirectPackageJsonUpdater = DirectPackageJsonUpdater;
    // Helpers
    function applyChange(ctx, propPath, value, positioning) {
        var lastPropIdx = propPath.length - 1;
        var lastProp = propPath[lastPropIdx];
        for (var i = 0; i < lastPropIdx; i++) {
            var key = propPath[i];
            var newCtx = ctx.hasOwnProperty(key) ? ctx[key] : (ctx[key] = {});
            if ((typeof newCtx !== 'object') || (newCtx === null) || Array.isArray(newCtx)) {
                throw new Error("Property path '" + propPath.join('.') + "' does not point to an object.");
            }
            ctx = newCtx;
        }
        ctx[lastProp] = value;
        positionProperty(ctx, lastProp, positioning);
    }
    exports.applyChange = applyChange;
    function movePropBefore(ctx, prop, isNextProp) {
        var allProps = Object.keys(ctx);
        var otherProps = allProps.filter(function (p) { return p !== prop; });
        var nextPropIdx = otherProps.findIndex(isNextProp);
        var propsToShift = (nextPropIdx === -1) ? [] : otherProps.slice(nextPropIdx);
        movePropToEnd(ctx, prop);
        propsToShift.forEach(function (p) { return movePropToEnd(ctx, p); });
    }
    function movePropToEnd(ctx, prop) {
        var value = ctx[prop];
        delete ctx[prop];
        ctx[prop] = value;
    }
    function positionProperty(ctx, prop, positioning) {
        switch (positioning) {
            case 'alphabetic':
                movePropBefore(ctx, prop, function (p) { return p > prop; });
                break;
            case 'unimportant':
                // Leave the property order unchanged; i.e. newly added properties will be last and existing
                // ones will remain in their old position.
                break;
            default:
                if ((typeof positioning !== 'object') || (positioning.before === undefined)) {
                    throw new Error("Unknown positioning (" + JSON.stringify(positioning) + ") for property '" + prop + "'.");
                }
                movePropBefore(ctx, prop, function (p) { return p === positioning.before; });
                break;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZV9qc29uX3VwZGF0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvd3JpdGluZy9wYWNrYWdlX2pzb25fdXBkYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwyRUFBbUY7SUErQ25GOzs7Ozs7T0FNRztJQUNIO1FBSUUsMkJBQW9CLGdCQUEyQztZQUEzQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQTJCO1lBSHZELFlBQU8sR0FBd0IsRUFBRSxDQUFDO1lBQ2xDLFlBQU8sR0FBRyxLQUFLLENBQUM7UUFFMEMsQ0FBQztRQUVuRTs7Ozs7Ozs7Ozs7Ozs7OztXQWdCRztRQUNILHFDQUFTLEdBQVQsVUFDSSxZQUFzQixFQUFFLEtBQWdCLEVBQ3hDLFdBQTJEO1lBQTNELDRCQUFBLEVBQUEsMkJBQTJEO1lBQzdELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3RELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVEOzs7Ozs7O1dBT0c7UUFDSCx3Q0FBWSxHQUFaLFVBQWEsZUFBK0IsRUFBRSxVQUF1QjtZQUNuRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDdEIsQ0FBQztRQUVPLDRDQUFnQixHQUF4QjtZQUNFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxzRUFBc0UsQ0FB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QUUsSUFBWTtRQUNsRCxJQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakIsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQsU0FBUyxnQkFBZ0IsQ0FDckIsR0FBZSxFQUFFLElBQVksRUFBRSxXQUEyQztRQUM1RSxRQUFRLFdBQVcsRUFBRTtZQUNuQixLQUFLLFlBQVk7Z0JBQ2YsY0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLEdBQUcsSUFBSSxFQUFSLENBQVEsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNO1lBQ1IsS0FBSyxhQUFhO2dCQUNoQiw0RkFBNEY7Z0JBQzVGLDBDQUEwQztnQkFDMUMsTUFBTTtZQUNSO2dCQUNFLElBQUksQ0FBQyxPQUFPLFdBQVcsS0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLEVBQUU7b0JBQzNFLE1BQU0sSUFBSSxLQUFLLENBQ1gsMEJBQXdCLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLHdCQUFtQixJQUFJLE9BQUksQ0FBQyxDQUFDO2lCQUNyRjtnQkFFRCxjQUFjLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsS0FBSyxXQUFXLENBQUMsTUFBTSxFQUF4QixDQUF3QixDQUFDLENBQUM7Z0JBQ3pELE1BQU07U0FDVDtJQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIEZpbGVTeXN0ZW0sIGRpcm5hbWV9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0pzb25PYmplY3QsIEpzb25WYWx1ZX0gZnJvbSAnLi4vcGFja2FnZXMvZW50cnlfcG9pbnQnO1xuXG5cbmV4cG9ydCB0eXBlIFBhY2thZ2VKc29uQ2hhbmdlID0gW3N0cmluZ1tdLCBKc29uVmFsdWUsIFBhY2thZ2VKc29uUHJvcGVydHlQb3NpdGlvbmluZ107XG5leHBvcnQgdHlwZSBQYWNrYWdlSnNvblByb3BlcnR5UG9zaXRpb25pbmcgPSAndW5pbXBvcnRhbnQnIHwgJ2FscGhhYmV0aWMnIHwge2JlZm9yZTogc3RyaW5nfTtcbmV4cG9ydCB0eXBlIFdyaXRlUGFja2FnZUpzb25DaGFuZ2VzRm4gPVxuICAgIChjaGFuZ2VzOiBQYWNrYWdlSnNvbkNoYW5nZVtdLCBwYWNrYWdlSnNvblBhdGg6IEFic29sdXRlRnNQYXRoLCBwYXJzZWRKc29uPzogSnNvbk9iamVjdCkgPT5cbiAgICAgICAgdm9pZDtcblxuLyoqXG4gKiBBIHV0aWxpdHkgb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gc2FmZWx5IHVwZGF0ZSB2YWx1ZXMgaW4gYSBgcGFja2FnZS5qc29uYCBmaWxlLlxuICpcbiAqIEV4YW1wbGUgdXNhZ2U6XG4gKiBgYGB0c1xuICogY29uc3QgdXBkYXRlUGFja2FnZUpzb24gPSBwYWNrYWdlSnNvblVwZGF0ZXJcbiAqICAgICAuY3JlYXRlVXBkYXRlKClcbiAqICAgICAuYWRkQ2hhbmdlKFsnbmFtZSddLCAncGFja2FnZS1mb28nKVxuICogICAgIC5hZGRDaGFuZ2UoWydzY3JpcHRzJywgJ2ZvbyddLCAnZWNobyBGT09PTy4uLicsICd1bmltcG9ydGFudCcpXG4gKiAgICAgLmFkZENoYW5nZShbJ2RlcGVuZGVuY2llcycsICdiYXonXSwgJzEuMC4wJywgJ2FscGhhYmV0aWMnKVxuICogICAgIC5hZGRDaGFuZ2UoWydkZXBlbmRlbmNpZXMnLCAnYmFyJ10sICcyLjAuMCcsIHtiZWZvcmU6ICdiYXonfSlcbiAqICAgICAud3JpdGVDaGFuZ2VzKCcvZm9vL3BhY2thZ2UuanNvbicpO1xuICogICAgIC8vIG9yXG4gKiAgICAgLy8gLndyaXRlQ2hhbmdlcygnL2Zvby9wYWNrYWdlLmpzb24nLCBpbk1lbW9yeVBhcnNlZEpzb24pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGFja2FnZUpzb25VcGRhdGVyIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIGBQYWNrYWdlSnNvblVwZGF0ZWAgb2JqZWN0LCB3aGljaCBwcm92aWRlcyBhIGZsdWVudCBBUEkgZm9yIGJhdGNoaW5nIHVwZGF0ZXMgdG8gYVxuICAgKiBgcGFja2FnZS5qc29uYCBmaWxlLiAoQmF0Y2hpbmcgdGhlIHVwZGF0ZXMgaXMgdXNlZnVsLCBiZWNhdXNlIGl0IGF2b2lkcyB1bm5lY2Vzc2FyeSBJL09cbiAgICogb3BlcmF0aW9ucy4pXG4gICAqL1xuICBjcmVhdGVVcGRhdGUoKTogUGFja2FnZUpzb25VcGRhdGU7XG5cbiAgLyoqXG4gICAqIFdyaXRlIGEgc2V0IG9mIGNoYW5nZXMgdG8gdGhlIHNwZWNpZmllZCBgcGFja2FnZS5qc29uYCBmaWxlIChhbmQgb3B0aW9uYWxseSBhIHByZS1leGlzdGluZyxcbiAgICogaW4tbWVtb3J5IHJlcHJlc2VudGF0aW9uIG9mIGl0KS5cbiAgICpcbiAgICogQHBhcmFtIGNoYW5nZXMgVGhlIHNldCBvZiBjaGFuZ2VzIHRvIGFwcGx5LlxuICAgKiBAcGFyYW0gcGFja2FnZUpzb25QYXRoIFRoZSBwYXRoIHRvIHRoZSBgcGFja2FnZS5qc29uYCBmaWxlIHRoYXQgbmVlZHMgdG8gYmUgdXBkYXRlZC5cbiAgICogQHBhcmFtIHBhcnNlZEpzb24gQSBwcmUtZXhpc3RpbmcsIGluLW1lbW9yeSByZXByZXNlbnRhdGlvbiBvZiB0aGUgYHBhY2thZ2UuanNvbmAgZmlsZSB0aGF0XG4gICAqICAgICAgICAgICAgICAgICAgIG5lZWRzIHRvIGJlIHVwZGF0ZWQgYXMgd2VsbC5cbiAgICovXG4gIHdyaXRlQ2hhbmdlcyhcbiAgICAgIGNoYW5nZXM6IFBhY2thZ2VKc29uQ2hhbmdlW10sIHBhY2thZ2VKc29uUGF0aDogQWJzb2x1dGVGc1BhdGgsIHBhcnNlZEpzb24/OiBKc29uT2JqZWN0KTogdm9pZDtcbn1cblxuLyoqXG4gKiBBIHV0aWxpdHkgY2xhc3MgcHJvdmlkaW5nIGEgZmx1ZW50IEFQSSBmb3IgcmVjb3JkaW5nIG11bHRpcGxlIGNoYW5nZXMgdG8gYSBgcGFja2FnZS5qc29uYCBmaWxlXG4gKiAoYW5kIG9wdGlvbmFsbHkgaXRzIGluLW1lbW9yeSBwYXJzZWQgcmVwcmVzZW50YXRpb24pLlxuICpcbiAqIE5PVEU6IFRoaXMgY2xhc3Mgc2hvdWxkIGdlbmVyYWxseSBub3QgYmUgaW5zdGFudGlhdGVkIGRpcmVjdGx5OyBpbnN0YW5jZXMgYXJlIGltcGxpY2l0bHkgY3JlYXRlZFxuICogICAgICAgdmlhIGBQYWNrYWdlSnNvblVwZGF0ZXIjY3JlYXRlVXBkYXRlKClgLlxuICovXG5leHBvcnQgY2xhc3MgUGFja2FnZUpzb25VcGRhdGUge1xuICBwcml2YXRlIGNoYW5nZXM6IFBhY2thZ2VKc29uQ2hhbmdlW10gPSBbXTtcbiAgcHJpdmF0ZSBhcHBsaWVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB3cml0ZUNoYW5nZXNJbXBsOiBXcml0ZVBhY2thZ2VKc29uQ2hhbmdlc0ZuKSB7fVxuXG4gIC8qKlxuICAgKiBSZWNvcmQgYSBjaGFuZ2UgdG8gYSBgcGFja2FnZS5qc29uYCBwcm9wZXJ0eS5cbiAgICpcbiAgICogSWYgdGhlIGFuY2VzdG9yIG9iamVjdHMgZG8gbm90IHlldCBleGlzdCBpbiB0aGUgYHBhY2thZ2UuanNvbmAgZmlsZSwgdGhleSB3aWxsIGJlIGNyZWF0ZWQuIFRoZVxuICAgKiBwb3NpdGlvbmluZyBvZiB0aGUgcHJvcGVydHkgY2FuIGFsc28gYmUgc3BlY2lmaWVkLiAoSWYgdGhlIHByb3BlcnR5IGFscmVhZHkgZXhpc3RzLCBpdCB3aWxsIGJlXG4gICAqIG1vdmVkIGFjY29yZGluZ2x5LilcbiAgICpcbiAgICogTk9URTogUHJvcGVydHkgcG9zaXRpb25pbmcgaXMgb25seSBndWFyYW50ZWVkIHRvIGJlIHJlc3BlY3RlZCBpbiB0aGUgc2VyaWFsaXplZCBgcGFja2FnZS5qc29uYFxuICAgKiAgICAgICBmaWxlLiBQb3NpdGlvbmluZyB3aWxsIG5vdCBiZSB0YWtlbiBpbnRvIGFjY291bnQgd2hlbiB1cGRhdGluZyBpbi1tZW1vcnkgcmVwcmVzZW50YXRpb25zLlxuICAgKlxuICAgKiBOT1RFIDI6IFByb3BlcnR5IHBvc2l0aW9uaW5nIG9ubHkgYWZmZWN0cyB0aGUgbGFzdCBwcm9wZXJ0eSBpbiBgcHJvcGVydHlQYXRoYC4gQW5jZXN0b3JcbiAgICogICAgICAgICBvYmplY3RzJyBwb3NpdGlvbmluZyB3aWxsIG5vdCBiZSBhZmZlY3RlZC5cbiAgICpcbiAgICogQHBhcmFtIHByb3BlcnR5UGF0aCBUaGUgcGF0aCBvZiBhIChwb3NzaWJseSBuZXN0ZWQpIHByb3BlcnR5IHRvIGFkZC91cGRhdGUuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgbmV3IHZhbHVlIHRvIHNldCB0aGUgcHJvcGVydHkgdG8uXG4gICAqIEBwYXJhbSBwb3NpdGlvbiBUaGUgZGVzaXJlZCBwb3NpdGlvbiBmb3IgdGhlIGFkZGVkL3VwZGF0ZWQgcHJvcGVydHkuXG4gICAqL1xuICBhZGRDaGFuZ2UoXG4gICAgICBwcm9wZXJ0eVBhdGg6IHN0cmluZ1tdLCB2YWx1ZTogSnNvblZhbHVlLFxuICAgICAgcG9zaXRpb25pbmc6IFBhY2thZ2VKc29uUHJvcGVydHlQb3NpdGlvbmluZyA9ICd1bmltcG9ydGFudCcpOiB0aGlzIHtcbiAgICB0aGlzLmVuc3VyZU5vdEFwcGxpZWQoKTtcbiAgICB0aGlzLmNoYW5nZXMucHVzaChbcHJvcGVydHlQYXRoLCB2YWx1ZSwgcG9zaXRpb25pbmddKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBXcml0ZSB0aGUgcmVjb3JkZWQgY2hhbmdlcyB0byB0aGUgYXNzb2NpYXRlZCBgcGFja2FnZS5qc29uYCBmaWxlIChhbmQgb3B0aW9uYWxseSBhXG4gICAqIHByZS1leGlzdGluZywgaW4tbWVtb3J5IHJlcHJlc2VudGF0aW9uIG9mIGl0KS5cbiAgICpcbiAgICogQHBhcmFtIHBhY2thZ2VKc29uUGF0aCBUaGUgcGF0aCB0byB0aGUgYHBhY2thZ2UuanNvbmAgZmlsZSB0aGF0IG5lZWRzIHRvIGJlIHVwZGF0ZWQuXG4gICAqIEBwYXJhbSBwYXJzZWRKc29uIEEgcHJlLWV4aXN0aW5nLCBpbi1tZW1vcnkgcmVwcmVzZW50YXRpb24gb2YgdGhlIGBwYWNrYWdlLmpzb25gIGZpbGUgdGhhdFxuICAgKiAgICAgICAgICAgICAgICAgICBuZWVkcyB0byBiZSB1cGRhdGVkIGFzIHdlbGwuXG4gICAqL1xuICB3cml0ZUNoYW5nZXMocGFja2FnZUpzb25QYXRoOiBBYnNvbHV0ZUZzUGF0aCwgcGFyc2VkSnNvbj86IEpzb25PYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLmVuc3VyZU5vdEFwcGxpZWQoKTtcbiAgICB0aGlzLndyaXRlQ2hhbmdlc0ltcGwodGhpcy5jaGFuZ2VzLCBwYWNrYWdlSnNvblBhdGgsIHBhcnNlZEpzb24pO1xuICAgIHRoaXMuYXBwbGllZCA9IHRydWU7XG4gIH1cblxuICBwcml2YXRlIGVuc3VyZU5vdEFwcGxpZWQoKSB7XG4gICAgaWYgKHRoaXMuYXBwbGllZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUcnlpbmcgdG8gYXBwbHkgYSBgUGFja2FnZUpzb25VcGRhdGVgIHRoYXQgaGFzIGFscmVhZHkgYmVlbiBhcHBsaWVkLicpO1xuICAgIH1cbiAgfVxufVxuXG4vKiogQSBgUGFja2FnZUpzb25VcGRhdGVyYCB0aGF0IHdyaXRlcyBkaXJlY3RseSB0byB0aGUgZmlsZS1zeXN0ZW0uICovXG5leHBvcnQgY2xhc3MgRGlyZWN0UGFja2FnZUpzb25VcGRhdGVyIGltcGxlbWVudHMgUGFja2FnZUpzb25VcGRhdGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBmczogRmlsZVN5c3RlbSkge31cblxuICBjcmVhdGVVcGRhdGUoKTogUGFja2FnZUpzb25VcGRhdGUge1xuICAgIHJldHVybiBuZXcgUGFja2FnZUpzb25VcGRhdGUoKC4uLmFyZ3MpID0+IHRoaXMud3JpdGVDaGFuZ2VzKC4uLmFyZ3MpKTtcbiAgfVxuXG4gIHdyaXRlQ2hhbmdlcyhcbiAgICAgIGNoYW5nZXM6IFBhY2thZ2VKc29uQ2hhbmdlW10sIHBhY2thZ2VKc29uUGF0aDogQWJzb2x1dGVGc1BhdGgsXG4gICAgICBwcmVFeGlzdGluZ1BhcnNlZEpzb24/OiBKc29uT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKGNoYW5nZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIGNoYW5nZXMgdG8gd3JpdGUgdG8gJyR7cGFja2FnZUpzb25QYXRofScuYCk7XG4gICAgfVxuXG4gICAgLy8gUmVhZCBhbmQgcGFyc2UgdGhlIGBwYWNrYWdlLmpzb25gIGNvbnRlbnQuXG4gICAgLy8gTk9URTogV2UgYXJlIG5vdCB1c2luZyBgcHJlRXhpc3RpbmdQYXJzZWRKc29uYCAoZXZlbiBpZiBzcGVjaWZpZWQpIHRvIGF2b2lkIGNvcnJ1cHRpbmcgdGhlXG4gICAgLy8gICAgICAgY29udGVudCBvbiBkaXNrIGluIGNhc2UgYHByZUV4aXN0aW5nUGFyc2VkSnNvbmAgaXMgb3V0ZGF0ZWQuXG4gICAgY29uc3QgcGFyc2VkSnNvbiA9XG4gICAgICAgIHRoaXMuZnMuZXhpc3RzKHBhY2thZ2VKc29uUGF0aCkgPyBKU09OLnBhcnNlKHRoaXMuZnMucmVhZEZpbGUocGFja2FnZUpzb25QYXRoKSkgOiB7fTtcblxuICAgIC8vIEFwcGx5IGFsbCBjaGFuZ2VzIHRvIGJvdGggdGhlIGNhbm9uaWNhbCByZXByZXNlbnRhdGlvbiAocmVhZCBmcm9tIGRpc2spIGFuZCBhbnkgcHJlLWV4aXN0aW5nLFxuICAgIC8vIGluLW1lbW9yeSByZXByZXNlbnRhdGlvbi5cbiAgICBmb3IgKGNvbnN0IFtwcm9wUGF0aCwgdmFsdWUsIHBvc2l0aW9uaW5nXSBvZiBjaGFuZ2VzKSB7XG4gICAgICBpZiAocHJvcFBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyBwcm9wZXJ0eSBwYXRoIGZvciB3cml0aW5nIHZhbHVlIHRvICcke3BhY2thZ2VKc29uUGF0aH0nLmApO1xuICAgICAgfVxuXG4gICAgICBhcHBseUNoYW5nZShwYXJzZWRKc29uLCBwcm9wUGF0aCwgdmFsdWUsIHBvc2l0aW9uaW5nKTtcblxuICAgICAgaWYgKHByZUV4aXN0aW5nUGFyc2VkSnNvbikge1xuICAgICAgICAvLyBObyBuZWVkIHRvIHRha2UgcHJvcGVydHkgcG9zaXRpb25pbmcgaW50byBhY2NvdW50IGZvciBpbi1tZW1vcnkgcmVwcmVzZW50YXRpb25zLlxuICAgICAgICBhcHBseUNoYW5nZShwcmVFeGlzdGluZ1BhcnNlZEpzb24sIHByb3BQYXRoLCB2YWx1ZSwgJ3VuaW1wb3J0YW50Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIHRoZSBjb250YWluaW5nIGRpcmVjdG9yeSBleGlzdHMgKGluIGNhc2UgdGhpcyBpcyBhIHN5bnRoZXNpemVkIGBwYWNrYWdlLmpzb25gIGR1ZSB0byBhXG4gICAgLy8gY3VzdG9tIGNvbmZpZ3VyYXRpb24pIGFuZCB3cml0ZSB0aGUgdXBkYXRlZCBjb250ZW50IHRvIGRpc2suXG4gICAgdGhpcy5mcy5lbnN1cmVEaXIoZGlybmFtZShwYWNrYWdlSnNvblBhdGgpKTtcbiAgICB0aGlzLmZzLndyaXRlRmlsZShwYWNrYWdlSnNvblBhdGgsIGAke0pTT04uc3RyaW5naWZ5KHBhcnNlZEpzb24sIG51bGwsIDIpfVxcbmApO1xuICB9XG59XG5cbi8vIEhlbHBlcnNcbmV4cG9ydCBmdW5jdGlvbiBhcHBseUNoYW5nZShcbiAgICBjdHg6IEpzb25PYmplY3QsIHByb3BQYXRoOiBzdHJpbmdbXSwgdmFsdWU6IEpzb25WYWx1ZSxcbiAgICBwb3NpdGlvbmluZzogUGFja2FnZUpzb25Qcm9wZXJ0eVBvc2l0aW9uaW5nKTogdm9pZCB7XG4gIGNvbnN0IGxhc3RQcm9wSWR4ID0gcHJvcFBhdGgubGVuZ3RoIC0gMTtcbiAgY29uc3QgbGFzdFByb3AgPSBwcm9wUGF0aFtsYXN0UHJvcElkeF07XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXN0UHJvcElkeDsgaSsrKSB7XG4gICAgY29uc3Qga2V5ID0gcHJvcFBhdGhbaV07XG4gICAgY29uc3QgbmV3Q3R4ID0gY3R4Lmhhc093blByb3BlcnR5KGtleSkgPyBjdHhba2V5XSA6IChjdHhba2V5XSA9IHt9KTtcblxuICAgIGlmICgodHlwZW9mIG5ld0N0eCAhPT0gJ29iamVjdCcpIHx8IChuZXdDdHggPT09IG51bGwpIHx8IEFycmF5LmlzQXJyYXkobmV3Q3R4KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9wZXJ0eSBwYXRoICcke3Byb3BQYXRoLmpvaW4oJy4nKX0nIGRvZXMgbm90IHBvaW50IHRvIGFuIG9iamVjdC5gKTtcbiAgICB9XG5cbiAgICBjdHggPSBuZXdDdHg7XG4gIH1cblxuICBjdHhbbGFzdFByb3BdID0gdmFsdWU7XG4gIHBvc2l0aW9uUHJvcGVydHkoY3R4LCBsYXN0UHJvcCwgcG9zaXRpb25pbmcpO1xufVxuXG5mdW5jdGlvbiBtb3ZlUHJvcEJlZm9yZShjdHg6IEpzb25PYmplY3QsIHByb3A6IHN0cmluZywgaXNOZXh0UHJvcDogKHA6IHN0cmluZykgPT4gYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBhbGxQcm9wcyA9IE9iamVjdC5rZXlzKGN0eCk7XG4gIGNvbnN0IG90aGVyUHJvcHMgPSBhbGxQcm9wcy5maWx0ZXIocCA9PiBwICE9PSBwcm9wKTtcbiAgY29uc3QgbmV4dFByb3BJZHggPSBvdGhlclByb3BzLmZpbmRJbmRleChpc05leHRQcm9wKTtcbiAgY29uc3QgcHJvcHNUb1NoaWZ0ID0gKG5leHRQcm9wSWR4ID09PSAtMSkgPyBbXSA6IG90aGVyUHJvcHMuc2xpY2UobmV4dFByb3BJZHgpO1xuXG4gIG1vdmVQcm9wVG9FbmQoY3R4LCBwcm9wKTtcbiAgcHJvcHNUb1NoaWZ0LmZvckVhY2gocCA9PiBtb3ZlUHJvcFRvRW5kKGN0eCwgcCkpO1xufVxuXG5mdW5jdGlvbiBtb3ZlUHJvcFRvRW5kKGN0eDogSnNvbk9iamVjdCwgcHJvcDogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IHZhbHVlID0gY3R4W3Byb3BdO1xuICBkZWxldGUgY3R4W3Byb3BdO1xuICBjdHhbcHJvcF0gPSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gcG9zaXRpb25Qcm9wZXJ0eShcbiAgICBjdHg6IEpzb25PYmplY3QsIHByb3A6IHN0cmluZywgcG9zaXRpb25pbmc6IFBhY2thZ2VKc29uUHJvcGVydHlQb3NpdGlvbmluZyk6IHZvaWQge1xuICBzd2l0Y2ggKHBvc2l0aW9uaW5nKSB7XG4gICAgY2FzZSAnYWxwaGFiZXRpYyc6XG4gICAgICBtb3ZlUHJvcEJlZm9yZShjdHgsIHByb3AsIHAgPT4gcCA+IHByb3ApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndW5pbXBvcnRhbnQnOlxuICAgICAgLy8gTGVhdmUgdGhlIHByb3BlcnR5IG9yZGVyIHVuY2hhbmdlZDsgaS5lLiBuZXdseSBhZGRlZCBwcm9wZXJ0aWVzIHdpbGwgYmUgbGFzdCBhbmQgZXhpc3RpbmdcbiAgICAgIC8vIG9uZXMgd2lsbCByZW1haW4gaW4gdGhlaXIgb2xkIHBvc2l0aW9uLlxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGlmICgodHlwZW9mIHBvc2l0aW9uaW5nICE9PSAnb2JqZWN0JykgfHwgKHBvc2l0aW9uaW5nLmJlZm9yZSA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVW5rbm93biBwb3NpdGlvbmluZyAoJHtKU09OLnN0cmluZ2lmeShwb3NpdGlvbmluZyl9KSBmb3IgcHJvcGVydHkgJyR7cHJvcH0nLmApO1xuICAgICAgfVxuXG4gICAgICBtb3ZlUHJvcEJlZm9yZShjdHgsIHByb3AsIHAgPT4gcCA9PT0gcG9zaXRpb25pbmcuYmVmb3JlKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG4iXX0=