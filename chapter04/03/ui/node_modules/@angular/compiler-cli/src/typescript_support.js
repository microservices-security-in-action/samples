(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/typescript_support", ["require", "exports", "typescript", "@angular/compiler-cli/src/diagnostics/typescript_version"], factory);
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
    var ts = require("typescript");
    var typescript_version_1 = require("@angular/compiler-cli/src/diagnostics/typescript_version");
    /**
     * Minimum supported TypeScript version
     * ∀ supported typescript version v, v >= MIN_TS_VERSION
     */
    var MIN_TS_VERSION = '3.6.4';
    /**
     * Supremum of supported TypeScript versions
     * ∀ supported typescript version v, v < MAX_TS_VERSION
     * MAX_TS_VERSION is not considered as a supported TypeScript version
     */
    var MAX_TS_VERSION = '3.8.0';
    /**
     * The currently used version of TypeScript, which can be adjusted for testing purposes using
     * `setTypeScriptVersionForTesting` and `restoreTypeScriptVersionForTesting` below.
     */
    var tsVersion = ts.version;
    function setTypeScriptVersionForTesting(version) {
        tsVersion = version;
    }
    exports.setTypeScriptVersionForTesting = setTypeScriptVersionForTesting;
    function restoreTypeScriptVersionForTesting() {
        tsVersion = ts.version;
    }
    exports.restoreTypeScriptVersionForTesting = restoreTypeScriptVersionForTesting;
    /**
     * Checks whether a given version ∈ [minVersion, maxVersion[
     * An error will be thrown if the following statements are simultaneously true:
     * - the given version ∉ [minVersion, maxVersion[,
     *
     * @param version The version on which the check will be performed
     * @param minVersion The lower bound version. A valid version needs to be greater than minVersion
     * @param maxVersion The upper bound version. A valid version needs to be strictly less than
     * maxVersion
     *
     * @throws Will throw an error if the given version ∉ [minVersion, maxVersion[
     */
    function checkVersion(version, minVersion, maxVersion) {
        if ((typescript_version_1.compareVersions(version, minVersion) < 0 || typescript_version_1.compareVersions(version, maxVersion) >= 0)) {
            throw new Error("The Angular Compiler requires TypeScript >=" + minVersion + " and <" + maxVersion + " but " + version + " was found instead.");
        }
    }
    exports.checkVersion = checkVersion;
    function verifySupportedTypeScriptVersion() {
        checkVersion(tsVersion, MIN_TS_VERSION, MAX_TS_VERSION);
    }
    exports.verifySupportedTypeScriptVersion = verifySupportedTypeScriptVersion;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdF9zdXBwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy90eXBlc2NyaXB0X3N1cHBvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwrQkFBaUM7SUFDakMsK0ZBQWlFO0lBRWpFOzs7T0FHRztJQUNILElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQztJQUUvQjs7OztPQUlHO0lBQ0gsSUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDO0lBRS9COzs7T0FHRztJQUNILElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7SUFFM0IsU0FBZ0IsOEJBQThCLENBQUMsT0FBZTtRQUM1RCxTQUFTLEdBQUcsT0FBTyxDQUFDO0lBQ3RCLENBQUM7SUFGRCx3RUFFQztJQUVELFNBQWdCLGtDQUFrQztRQUNoRCxTQUFTLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztJQUN6QixDQUFDO0lBRkQsZ0ZBRUM7SUFFRDs7Ozs7Ozs7Ozs7T0FXRztJQUNILFNBQWdCLFlBQVksQ0FBQyxPQUFlLEVBQUUsVUFBa0IsRUFBRSxVQUFrQjtRQUNsRixJQUFJLENBQUMsb0NBQWUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLG9DQUFlLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO1lBQzNGLE1BQU0sSUFBSSxLQUFLLENBQ1gsZ0RBQThDLFVBQVUsY0FBUyxVQUFVLGFBQVEsT0FBTyx3QkFBcUIsQ0FBQyxDQUFDO1NBQ3RIO0lBQ0gsQ0FBQztJQUxELG9DQUtDO0lBRUQsU0FBZ0IsZ0NBQWdDO1FBQzlDLFlBQVksQ0FBQyxTQUFTLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFGRCw0RUFFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtjb21wYXJlVmVyc2lvbnN9IGZyb20gJy4vZGlhZ25vc3RpY3MvdHlwZXNjcmlwdF92ZXJzaW9uJztcblxuLyoqXG4gKiBNaW5pbXVtIHN1cHBvcnRlZCBUeXBlU2NyaXB0IHZlcnNpb25cbiAqIOKIgCBzdXBwb3J0ZWQgdHlwZXNjcmlwdCB2ZXJzaW9uIHYsIHYgPj0gTUlOX1RTX1ZFUlNJT05cbiAqL1xuY29uc3QgTUlOX1RTX1ZFUlNJT04gPSAnMy42LjQnO1xuXG4vKipcbiAqIFN1cHJlbXVtIG9mIHN1cHBvcnRlZCBUeXBlU2NyaXB0IHZlcnNpb25zXG4gKiDiiIAgc3VwcG9ydGVkIHR5cGVzY3JpcHQgdmVyc2lvbiB2LCB2IDwgTUFYX1RTX1ZFUlNJT05cbiAqIE1BWF9UU19WRVJTSU9OIGlzIG5vdCBjb25zaWRlcmVkIGFzIGEgc3VwcG9ydGVkIFR5cGVTY3JpcHQgdmVyc2lvblxuICovXG5jb25zdCBNQVhfVFNfVkVSU0lPTiA9ICczLjguMCc7XG5cbi8qKlxuICogVGhlIGN1cnJlbnRseSB1c2VkIHZlcnNpb24gb2YgVHlwZVNjcmlwdCwgd2hpY2ggY2FuIGJlIGFkanVzdGVkIGZvciB0ZXN0aW5nIHB1cnBvc2VzIHVzaW5nXG4gKiBgc2V0VHlwZVNjcmlwdFZlcnNpb25Gb3JUZXN0aW5nYCBhbmQgYHJlc3RvcmVUeXBlU2NyaXB0VmVyc2lvbkZvclRlc3RpbmdgIGJlbG93LlxuICovXG5sZXQgdHNWZXJzaW9uID0gdHMudmVyc2lvbjtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFR5cGVTY3JpcHRWZXJzaW9uRm9yVGVzdGluZyh2ZXJzaW9uOiBzdHJpbmcpOiB2b2lkIHtcbiAgdHNWZXJzaW9uID0gdmVyc2lvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc3RvcmVUeXBlU2NyaXB0VmVyc2lvbkZvclRlc3RpbmcoKTogdm9pZCB7XG4gIHRzVmVyc2lvbiA9IHRzLnZlcnNpb247XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiB2ZXJzaW9uIOKIiCBbbWluVmVyc2lvbiwgbWF4VmVyc2lvbltcbiAqIEFuIGVycm9yIHdpbGwgYmUgdGhyb3duIGlmIHRoZSBmb2xsb3dpbmcgc3RhdGVtZW50cyBhcmUgc2ltdWx0YW5lb3VzbHkgdHJ1ZTpcbiAqIC0gdGhlIGdpdmVuIHZlcnNpb24g4oiJIFttaW5WZXJzaW9uLCBtYXhWZXJzaW9uWyxcbiAqXG4gKiBAcGFyYW0gdmVyc2lvbiBUaGUgdmVyc2lvbiBvbiB3aGljaCB0aGUgY2hlY2sgd2lsbCBiZSBwZXJmb3JtZWRcbiAqIEBwYXJhbSBtaW5WZXJzaW9uIFRoZSBsb3dlciBib3VuZCB2ZXJzaW9uLiBBIHZhbGlkIHZlcnNpb24gbmVlZHMgdG8gYmUgZ3JlYXRlciB0aGFuIG1pblZlcnNpb25cbiAqIEBwYXJhbSBtYXhWZXJzaW9uIFRoZSB1cHBlciBib3VuZCB2ZXJzaW9uLiBBIHZhbGlkIHZlcnNpb24gbmVlZHMgdG8gYmUgc3RyaWN0bHkgbGVzcyB0aGFuXG4gKiBtYXhWZXJzaW9uXG4gKlxuICogQHRocm93cyBXaWxsIHRocm93IGFuIGVycm9yIGlmIHRoZSBnaXZlbiB2ZXJzaW9uIOKIiSBbbWluVmVyc2lvbiwgbWF4VmVyc2lvbltcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrVmVyc2lvbih2ZXJzaW9uOiBzdHJpbmcsIG1pblZlcnNpb246IHN0cmluZywgbWF4VmVyc2lvbjogc3RyaW5nKSB7XG4gIGlmICgoY29tcGFyZVZlcnNpb25zKHZlcnNpb24sIG1pblZlcnNpb24pIDwgMCB8fCBjb21wYXJlVmVyc2lvbnModmVyc2lvbiwgbWF4VmVyc2lvbikgPj0gMCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBUaGUgQW5ndWxhciBDb21waWxlciByZXF1aXJlcyBUeXBlU2NyaXB0ID49JHttaW5WZXJzaW9ufSBhbmQgPCR7bWF4VmVyc2lvbn0gYnV0ICR7dmVyc2lvbn0gd2FzIGZvdW5kIGluc3RlYWQuYCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeVN1cHBvcnRlZFR5cGVTY3JpcHRWZXJzaW9uKCk6IHZvaWQge1xuICBjaGVja1ZlcnNpb24odHNWZXJzaW9uLCBNSU5fVFNfVkVSU0lPTiwgTUFYX1RTX1ZFUlNJT04pO1xufVxuIl19