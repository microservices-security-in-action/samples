/**
 * @fileoverview added by tsickle
 * Generated from: packages/platform-browser/src/browser/tools/common_tools.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵgetDOM as getDOM } from '@angular/common';
import { ApplicationRef } from '@angular/core';
import { window } from './browser';
export class ChangeDetectionPerfRecord {
    /**
     * @param {?} msPerTick
     * @param {?} numTicks
     */
    constructor(msPerTick, numTicks) {
        this.msPerTick = msPerTick;
        this.numTicks = numTicks;
    }
}
if (false) {
    /** @type {?} */
    ChangeDetectionPerfRecord.prototype.msPerTick;
    /** @type {?} */
    ChangeDetectionPerfRecord.prototype.numTicks;
}
/**
 * Entry point for all Angular profiling-related debug tools. This object
 * corresponds to the `ng.profiler` in the dev console.
 */
export class AngularProfiler {
    /**
     * @param {?} ref
     */
    constructor(ref) { this.appRef = ref.injector.get(ApplicationRef); }
    // tslint:disable:no-console
    /**
     * Exercises change detection in a loop and then prints the average amount of
     * time in milliseconds how long a single round of change detection takes for
     * the current state of the UI. It runs a minimum of 5 rounds for a minimum
     * of 500 milliseconds.
     *
     * Optionally, a user may pass a `config` parameter containing a map of
     * options. Supported options are:
     *
     * `record` (boolean) - causes the profiler to record a CPU profile while
     * it exercises the change detector. Example:
     *
     * ```
     * ng.profiler.timeChangeDetection({record: true})
     * ```
     * @param {?} config
     * @return {?}
     */
    timeChangeDetection(config) {
        /** @type {?} */
        const record = config && config['record'];
        /** @type {?} */
        const profileName = 'Change Detection';
        // Profiler is not available in Android browsers, nor in IE 9 without dev tools opened
        /** @type {?} */
        const isProfilerAvailable = window.console.profile != null;
        if (record && isProfilerAvailable) {
            window.console.profile(profileName);
        }
        /** @type {?} */
        const start = getDOM().performanceNow();
        /** @type {?} */
        let numTicks = 0;
        while (numTicks < 5 || (getDOM().performanceNow() - start) < 500) {
            this.appRef.tick();
            numTicks++;
        }
        /** @type {?} */
        const end = getDOM().performanceNow();
        if (record && isProfilerAvailable) {
            window.console.profileEnd(profileName);
        }
        /** @type {?} */
        const msPerTick = (end - start) / numTicks;
        window.console.log(`ran ${numTicks} change detection cycles`);
        window.console.log(`${msPerTick.toFixed(2)} ms per check`);
        return new ChangeDetectionPerfRecord(msPerTick, numTicks);
    }
}
if (false) {
    /** @type {?} */
    AngularProfiler.prototype.appRef;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX3Rvb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcGxhdGZvcm0tYnJvd3Nlci9zcmMvYnJvd3Nlci90b29scy9jb21tb25fdG9vbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLE9BQU8sSUFBSSxNQUFNLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNsRCxPQUFPLEVBQUMsY0FBYyxFQUFlLE1BQU0sZUFBZSxDQUFDO0FBQzNELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFakMsTUFBTSxPQUFPLHlCQUF5Qjs7Ozs7SUFDcEMsWUFBbUIsU0FBaUIsRUFBUyxRQUFnQjtRQUExQyxjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQVMsYUFBUSxHQUFSLFFBQVEsQ0FBUTtJQUFHLENBQUM7Q0FDbEU7OztJQURhLDhDQUF3Qjs7SUFBRSw2Q0FBdUI7Ozs7OztBQU8vRCxNQUFNLE9BQU8sZUFBZTs7OztJQUcxQixZQUFZLEdBQXNCLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBbUJ2RixtQkFBbUIsQ0FBQyxNQUFXOztjQUN2QixNQUFNLEdBQUcsTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUM7O2NBQ25DLFdBQVcsR0FBRyxrQkFBa0I7OztjQUVoQyxtQkFBbUIsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxJQUFJO1FBQzFELElBQUksTUFBTSxJQUFJLG1CQUFtQixFQUFFO1lBQ2pDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3JDOztjQUNLLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQyxjQUFjLEVBQUU7O1lBQ25DLFFBQVEsR0FBRyxDQUFDO1FBQ2hCLE9BQU8sUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLGNBQWMsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRTtZQUNoRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ25CLFFBQVEsRUFBRSxDQUFDO1NBQ1o7O2NBQ0ssR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDLGNBQWMsRUFBRTtRQUNyQyxJQUFJLE1BQU0sSUFBSSxtQkFBbUIsRUFBRTtZQUNqQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUN4Qzs7Y0FDSyxTQUFTLEdBQUcsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsUUFBUTtRQUMxQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLFFBQVEsMEJBQTBCLENBQUMsQ0FBQztRQUM5RCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRTNELE9BQU8sSUFBSSx5QkFBeUIsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDNUQsQ0FBQztDQUNGOzs7SUE3Q0MsaUNBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge8m1Z2V0RE9NIGFzIGdldERPTX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7QXBwbGljYXRpb25SZWYsIENvbXBvbmVudFJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge3dpbmRvd30gZnJvbSAnLi9icm93c2VyJztcblxuZXhwb3J0IGNsYXNzIENoYW5nZURldGVjdGlvblBlcmZSZWNvcmQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbXNQZXJUaWNrOiBudW1iZXIsIHB1YmxpYyBudW1UaWNrczogbnVtYmVyKSB7fVxufVxuXG4vKipcbiAqIEVudHJ5IHBvaW50IGZvciBhbGwgQW5ndWxhciBwcm9maWxpbmctcmVsYXRlZCBkZWJ1ZyB0b29scy4gVGhpcyBvYmplY3RcbiAqIGNvcnJlc3BvbmRzIHRvIHRoZSBgbmcucHJvZmlsZXJgIGluIHRoZSBkZXYgY29uc29sZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEFuZ3VsYXJQcm9maWxlciB7XG4gIGFwcFJlZjogQXBwbGljYXRpb25SZWY7XG5cbiAgY29uc3RydWN0b3IocmVmOiBDb21wb25lbnRSZWY8YW55PikgeyB0aGlzLmFwcFJlZiA9IHJlZi5pbmplY3Rvci5nZXQoQXBwbGljYXRpb25SZWYpOyB9XG5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8tY29uc29sZVxuICAvKipcbiAgICogRXhlcmNpc2VzIGNoYW5nZSBkZXRlY3Rpb24gaW4gYSBsb29wIGFuZCB0aGVuIHByaW50cyB0aGUgYXZlcmFnZSBhbW91bnQgb2ZcbiAgICogdGltZSBpbiBtaWxsaXNlY29uZHMgaG93IGxvbmcgYSBzaW5nbGUgcm91bmQgb2YgY2hhbmdlIGRldGVjdGlvbiB0YWtlcyBmb3JcbiAgICogdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIFVJLiBJdCBydW5zIGEgbWluaW11bSBvZiA1IHJvdW5kcyBmb3IgYSBtaW5pbXVtXG4gICAqIG9mIDUwMCBtaWxsaXNlY29uZHMuXG4gICAqXG4gICAqIE9wdGlvbmFsbHksIGEgdXNlciBtYXkgcGFzcyBhIGBjb25maWdgIHBhcmFtZXRlciBjb250YWluaW5nIGEgbWFwIG9mXG4gICAqIG9wdGlvbnMuIFN1cHBvcnRlZCBvcHRpb25zIGFyZTpcbiAgICpcbiAgICogYHJlY29yZGAgKGJvb2xlYW4pIC0gY2F1c2VzIHRoZSBwcm9maWxlciB0byByZWNvcmQgYSBDUFUgcHJvZmlsZSB3aGlsZVxuICAgKiBpdCBleGVyY2lzZXMgdGhlIGNoYW5nZSBkZXRlY3Rvci4gRXhhbXBsZTpcbiAgICpcbiAgICogYGBgXG4gICAqIG5nLnByb2ZpbGVyLnRpbWVDaGFuZ2VEZXRlY3Rpb24oe3JlY29yZDogdHJ1ZX0pXG4gICAqIGBgYFxuICAgKi9cbiAgdGltZUNoYW5nZURldGVjdGlvbihjb25maWc6IGFueSk6IENoYW5nZURldGVjdGlvblBlcmZSZWNvcmQge1xuICAgIGNvbnN0IHJlY29yZCA9IGNvbmZpZyAmJiBjb25maWdbJ3JlY29yZCddO1xuICAgIGNvbnN0IHByb2ZpbGVOYW1lID0gJ0NoYW5nZSBEZXRlY3Rpb24nO1xuICAgIC8vIFByb2ZpbGVyIGlzIG5vdCBhdmFpbGFibGUgaW4gQW5kcm9pZCBicm93c2Vycywgbm9yIGluIElFIDkgd2l0aG91dCBkZXYgdG9vbHMgb3BlbmVkXG4gICAgY29uc3QgaXNQcm9maWxlckF2YWlsYWJsZSA9IHdpbmRvdy5jb25zb2xlLnByb2ZpbGUgIT0gbnVsbDtcbiAgICBpZiAocmVjb3JkICYmIGlzUHJvZmlsZXJBdmFpbGFibGUpIHtcbiAgICAgIHdpbmRvdy5jb25zb2xlLnByb2ZpbGUocHJvZmlsZU5hbWUpO1xuICAgIH1cbiAgICBjb25zdCBzdGFydCA9IGdldERPTSgpLnBlcmZvcm1hbmNlTm93KCk7XG4gICAgbGV0IG51bVRpY2tzID0gMDtcbiAgICB3aGlsZSAobnVtVGlja3MgPCA1IHx8IChnZXRET00oKS5wZXJmb3JtYW5jZU5vdygpIC0gc3RhcnQpIDwgNTAwKSB7XG4gICAgICB0aGlzLmFwcFJlZi50aWNrKCk7XG4gICAgICBudW1UaWNrcysrO1xuICAgIH1cbiAgICBjb25zdCBlbmQgPSBnZXRET00oKS5wZXJmb3JtYW5jZU5vdygpO1xuICAgIGlmIChyZWNvcmQgJiYgaXNQcm9maWxlckF2YWlsYWJsZSkge1xuICAgICAgd2luZG93LmNvbnNvbGUucHJvZmlsZUVuZChwcm9maWxlTmFtZSk7XG4gICAgfVxuICAgIGNvbnN0IG1zUGVyVGljayA9IChlbmQgLSBzdGFydCkgLyBudW1UaWNrcztcbiAgICB3aW5kb3cuY29uc29sZS5sb2coYHJhbiAke251bVRpY2tzfSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlc2ApO1xuICAgIHdpbmRvdy5jb25zb2xlLmxvZyhgJHttc1BlclRpY2sudG9GaXhlZCgyKX0gbXMgcGVyIGNoZWNrYCk7XG5cbiAgICByZXR1cm4gbmV3IENoYW5nZURldGVjdGlvblBlcmZSZWNvcmQobXNQZXJUaWNrLCBudW1UaWNrcyk7XG4gIH1cbn1cbiJdfQ==