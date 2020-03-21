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
        define("angular/packages/zone.js/lib/testing/zone-testing", ["require", "exports", "../zone-spec/long-stack-trace", "../zone-spec/proxy", "../zone-spec/sync-test", "../jasmine/jasmine", "angular/packages/zone.js/lib/testing/async-testing", "angular/packages/zone.js/lib/testing/fake-async", "./promise-testing"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // load test related files into bundle in correct order
    require("../zone-spec/long-stack-trace");
    require("../zone-spec/proxy");
    require("../zone-spec/sync-test");
    require("../jasmine/jasmine");
    require("angular/packages/zone.js/lib/testing/async-testing");
    require("angular/packages/zone.js/lib/testing/fake-async");
    require("./promise-testing");
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9uZS10ZXN0aW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvem9uZS5qcy9saWIvdGVzdGluZy96b25lLXRlc3RpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCx1REFBdUQ7SUFDdkQseUNBQXVDO0lBQ3ZDLDhCQUE0QjtJQUM1QixrQ0FBZ0M7SUFDaEMsOEJBQTRCO0lBQzVCLDhEQUF5QjtJQUN6QiwyREFBc0I7SUFDdEIsNkJBQTJCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBsb2FkIHRlc3QgcmVsYXRlZCBmaWxlcyBpbnRvIGJ1bmRsZSBpbiBjb3JyZWN0IG9yZGVyXG5pbXBvcnQgJy4uL3pvbmUtc3BlYy9sb25nLXN0YWNrLXRyYWNlJztcbmltcG9ydCAnLi4vem9uZS1zcGVjL3Byb3h5JztcbmltcG9ydCAnLi4vem9uZS1zcGVjL3N5bmMtdGVzdCc7XG5pbXBvcnQgJy4uL2phc21pbmUvamFzbWluZSc7XG5pbXBvcnQgJy4vYXN5bmMtdGVzdGluZyc7XG5pbXBvcnQgJy4vZmFrZS1hc3luYyc7XG5pbXBvcnQgJy4vcHJvbWlzZS10ZXN0aW5nJzsiXX0=