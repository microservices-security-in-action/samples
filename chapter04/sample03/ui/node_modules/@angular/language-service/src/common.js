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
        define("@angular/language-service/src/common", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvbGFuZ3VhZ2Utc2VydmljZS9zcmMvY29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5LCBDb21waWxlUGlwZVN1bW1hcnksIENzc1NlbGVjdG9yLCBOb2RlIGFzIEh0bWxBc3QsIFBhcnNlRXJyb3IsIFBhcnNlciwgVGVtcGxhdGVBc3R9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcblxuaW1wb3J0IHtUZW1wbGF0ZVNvdXJjZX0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXN0UmVzdWx0IHtcbiAgaHRtbEFzdDogSHRtbEFzdFtdO1xuICB0ZW1wbGF0ZUFzdDogVGVtcGxhdGVBc3RbXTtcbiAgZGlyZWN0aXZlOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGE7XG4gIGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5W107XG4gIHBpcGVzOiBDb21waWxlUGlwZVN1bW1hcnlbXTtcbiAgcGFyc2VFcnJvcnM/OiBQYXJzZUVycm9yW107XG4gIGV4cHJlc3Npb25QYXJzZXI6IFBhcnNlcjtcbiAgdGVtcGxhdGU6IFRlbXBsYXRlU291cmNlO1xufVxuXG5leHBvcnQgdHlwZSBTZWxlY3RvckluZm8gPSB7XG4gIHNlbGVjdG9yczogQ3NzU2VsZWN0b3JbXSxcbiAgbWFwOiBNYXA8Q3NzU2VsZWN0b3IsIENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5PlxufTtcbiJdfQ==