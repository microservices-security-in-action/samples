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
        define("@angular/compiler-cli/src/ngtsc/indexer/src/context", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A context for storing indexing infromation about components of a program.
     *
     * An `IndexingContext` collects component and template analysis information from
     * `DecoratorHandler`s and exposes them to be indexed.
     */
    var IndexingContext = /** @class */ (function () {
        function IndexingContext() {
            this.components = new Set();
        }
        /**
         * Adds a component to the context.
         */
        IndexingContext.prototype.addComponent = function (info) { this.components.add(info); };
        return IndexingContext;
    }());
    exports.IndexingContext = IndexingContext;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvaW5kZXhlci9zcmMvY29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQXdDSDs7Ozs7T0FLRztJQUNIO1FBQUE7WUFDVyxlQUFVLEdBQUcsSUFBSSxHQUFHLEVBQWlCLENBQUM7UUFNakQsQ0FBQztRQUpDOztXQUVHO1FBQ0gsc0NBQVksR0FBWixVQUFhLElBQW1CLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLHNCQUFDO0lBQUQsQ0FBQyxBQVBELElBT0M7SUFQWSwwQ0FBZSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCb3VuZFRhcmdldCwgRGlyZWN0aXZlTWV0YSwgUGFyc2VTb3VyY2VGaWxlfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQge1JlZmVyZW5jZX0gZnJvbSAnLi4vLi4vaW1wb3J0cyc7XG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb259IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudE1ldGEgZXh0ZW5kcyBEaXJlY3RpdmVNZXRhIHtcbiAgcmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj47XG4gIC8qKlxuICAgKiBVbnBhcnNlZCBzZWxlY3RvciBvZiB0aGUgZGlyZWN0aXZlLCBvciBudWxsIGlmIHRoZSBkaXJlY3RpdmUgZG9lcyBub3QgaGF2ZSBhIHNlbGVjdG9yLlxuICAgKi9cbiAgc2VsZWN0b3I6IHN0cmluZ3xudWxsO1xufVxuXG4vKipcbiAqIEFuIGludGVybWVkaWF0ZSByZXByZXNlbnRhdGlvbiBvZiBhIGNvbXBvbmVudC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRJbmZvIHtcbiAgLyoqIENvbXBvbmVudCBUeXBlU2NyaXB0IGNsYXNzIGRlY2xhcmF0aW9uICovXG4gIGRlY2xhcmF0aW9uOiBDbGFzc0RlY2xhcmF0aW9uO1xuXG4gIC8qKiBDb21wb25lbnQgdGVtcGxhdGUgc2VsZWN0b3IgaWYgaXQgZXhpc3RzLCBvdGhlcndpc2UgbnVsbC4gKi9cbiAgc2VsZWN0b3I6IHN0cmluZ3xudWxsO1xuXG4gIC8qKlxuICAgKiBCb3VuZFRhcmdldCBjb250YWluaW5nIHRoZSBwYXJzZWQgdGVtcGxhdGUuIENhbiBhbHNvIGJlIHVzZWQgdG8gcXVlcnkgZm9yIGRpcmVjdGl2ZXMgdXNlZCBpblxuICAgKiB0aGUgdGVtcGxhdGUuXG4gICAqL1xuICBib3VuZFRlbXBsYXRlOiBCb3VuZFRhcmdldDxDb21wb25lbnRNZXRhPjtcblxuICAvKiogTWV0YWRhdGEgYWJvdXQgdGhlIHRlbXBsYXRlICovXG4gIHRlbXBsYXRlTWV0YToge1xuICAgIC8qKiBXaGV0aGVyIHRoZSBjb21wb25lbnQgdGVtcGxhdGUgaXMgaW5saW5lICovXG4gICAgaXNJbmxpbmU6IGJvb2xlYW47XG5cbiAgICAvKiogVGVtcGxhdGUgZmlsZSByZWNvcmRlZCBieSB0ZW1wbGF0ZSBwYXJzZXIgKi9cbiAgICBmaWxlOiBQYXJzZVNvdXJjZUZpbGU7XG4gIH07XG59XG5cbi8qKlxuICogQSBjb250ZXh0IGZvciBzdG9yaW5nIGluZGV4aW5nIGluZnJvbWF0aW9uIGFib3V0IGNvbXBvbmVudHMgb2YgYSBwcm9ncmFtLlxuICpcbiAqIEFuIGBJbmRleGluZ0NvbnRleHRgIGNvbGxlY3RzIGNvbXBvbmVudCBhbmQgdGVtcGxhdGUgYW5hbHlzaXMgaW5mb3JtYXRpb24gZnJvbVxuICogYERlY29yYXRvckhhbmRsZXJgcyBhbmQgZXhwb3NlcyB0aGVtIHRvIGJlIGluZGV4ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBJbmRleGluZ0NvbnRleHQge1xuICByZWFkb25seSBjb21wb25lbnRzID0gbmV3IFNldDxDb21wb25lbnRJbmZvPigpO1xuXG4gIC8qKlxuICAgKiBBZGRzIGEgY29tcG9uZW50IHRvIHRoZSBjb250ZXh0LlxuICAgKi9cbiAgYWRkQ29tcG9uZW50KGluZm86IENvbXBvbmVudEluZm8pIHsgdGhpcy5jb21wb25lbnRzLmFkZChpbmZvKTsgfVxufVxuIl19