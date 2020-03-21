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
        define("@angular/compiler-cli/src/language_services", ["require", "exports", "@angular/compiler-cli/src/metadata/index", "@angular/compiler-cli/src/transformers/metadata_reader"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /*
    
    The API from compiler-cli that language-service can see.
    It is important that none the exported modules require anything other than
    Angular modules and Typescript as this will indirectly add a dependency
    to the language service.
    
    */
    var metadata_1 = require("@angular/compiler-cli/src/metadata/index");
    exports.MetadataCollector = metadata_1.MetadataCollector;
    var metadata_reader_1 = require("@angular/compiler-cli/src/transformers/metadata_reader");
    exports.createMetadataReaderCache = metadata_reader_1.createMetadataReaderCache;
    exports.readMetadata = metadata_reader_1.readMetadata;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2Vfc2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL2xhbmd1YWdlX3NlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUg7Ozs7Ozs7TUFPRTtJQUNGLHFFQUE2RDtJQUFyRCx1Q0FBQSxpQkFBaUIsQ0FBQTtJQUV6QiwwRkFBZ0k7SUFBL0Usc0RBQUEseUJBQXlCLENBQUE7SUFBRSx5Q0FBQSxZQUFZLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qXG5cblRoZSBBUEkgZnJvbSBjb21waWxlci1jbGkgdGhhdCBsYW5ndWFnZS1zZXJ2aWNlIGNhbiBzZWUuXG5JdCBpcyBpbXBvcnRhbnQgdGhhdCBub25lIHRoZSBleHBvcnRlZCBtb2R1bGVzIHJlcXVpcmUgYW55dGhpbmcgb3RoZXIgdGhhblxuQW5ndWxhciBtb2R1bGVzIGFuZCBUeXBlc2NyaXB0IGFzIHRoaXMgd2lsbCBpbmRpcmVjdGx5IGFkZCBhIGRlcGVuZGVuY3lcbnRvIHRoZSBsYW5ndWFnZSBzZXJ2aWNlLlxuXG4qL1xuZXhwb3J0IHtNZXRhZGF0YUNvbGxlY3RvciwgTW9kdWxlTWV0YWRhdGF9IGZyb20gJy4vbWV0YWRhdGEnO1xuZXhwb3J0IHtDb21waWxlck9wdGlvbnN9IGZyb20gJy4vdHJhbnNmb3JtZXJzL2FwaSc7XG5leHBvcnQge01ldGFkYXRhUmVhZGVyQ2FjaGUsIE1ldGFkYXRhUmVhZGVySG9zdCwgY3JlYXRlTWV0YWRhdGFSZWFkZXJDYWNoZSwgcmVhZE1ldGFkYXRhfSBmcm9tICcuL3RyYW5zZm9ybWVycy9tZXRhZGF0YV9yZWFkZXInO1xuIl19