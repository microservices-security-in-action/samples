/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __extends, __metadata, __param } from "tslib";
import { DOCUMENT, ɵgetDOM as getDOM } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { TestComponentRenderer } from '@angular/core/testing';
/**
 * A DOM based implementation of the TestComponentRenderer.
 */
var DOMTestComponentRenderer = /** @class */ (function (_super) {
    __extends(DOMTestComponentRenderer, _super);
    function DOMTestComponentRenderer(_doc) {
        var _this = _super.call(this) || this;
        _this._doc = _doc;
        return _this;
    }
    DOMTestComponentRenderer.prototype.insertRootElement = function (rootElId) {
        var template = getDOM().getDefaultDocument().createElement('template');
        template.innerHTML = "<div id=\"" + rootElId + "\"></div>";
        var rootEl = getContent(template).firstChild;
        // TODO(juliemr): can/should this be optional?
        var oldRoots = this._doc.querySelectorAll('[id^=root]');
        for (var i = 0; i < oldRoots.length; i++) {
            getDOM().remove(oldRoots[i]);
        }
        this._doc.body.appendChild(rootEl);
    };
    DOMTestComponentRenderer = __decorate([
        Injectable(),
        __param(0, Inject(DOCUMENT)),
        __metadata("design:paramtypes", [Object])
    ], DOMTestComponentRenderer);
    return DOMTestComponentRenderer;
}(TestComponentRenderer));
export { DOMTestComponentRenderer };
function getContent(node) {
    if ('content' in node) {
        return node.content;
    }
    else {
        return node;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX3Rlc3RfY29tcG9uZW50X3JlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcGxhdGZvcm0tYnJvd3Nlci1keW5hbWljL3Rlc3Rpbmcvc3JjL2RvbV90ZXN0X2NvbXBvbmVudF9yZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBRSxPQUFPLElBQUksTUFBTSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDNUQsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFNUQ7O0dBRUc7QUFFSDtJQUE4Qyw0Q0FBcUI7SUFDakUsa0NBQXNDLElBQVM7UUFBL0MsWUFBbUQsaUJBQU8sU0FBRztRQUF2QixVQUFJLEdBQUosSUFBSSxDQUFLOztJQUFhLENBQUM7SUFFN0Qsb0RBQWlCLEdBQWpCLFVBQWtCLFFBQWdCO1FBQ2hDLElBQU0sUUFBUSxHQUFHLE1BQU0sRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pFLFFBQVEsQ0FBQyxTQUFTLEdBQUcsZUFBWSxRQUFRLGNBQVUsQ0FBQztRQUNwRCxJQUFNLE1BQU0sR0FBZ0IsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFVBQVUsQ0FBQztRQUU1RCw4Q0FBOEM7UUFDOUMsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDOUI7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQWRVLHdCQUF3QjtRQURwQyxVQUFVLEVBQUU7UUFFRSxXQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7T0FEbEIsd0JBQXdCLENBZXBDO0lBQUQsK0JBQUM7Q0FBQSxBQWZELENBQThDLHFCQUFxQixHQWVsRTtTQWZZLHdCQUF3QjtBQWlCckMsU0FBUyxVQUFVLENBQUMsSUFBVTtJQUM1QixJQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7UUFDckIsT0FBYSxJQUFLLENBQUMsT0FBTyxDQUFDO0tBQzVCO1NBQU07UUFDTCxPQUFPLElBQUksQ0FBQztLQUNiO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtET0NVTUVOVCwgybVnZXRET00gYXMgZ2V0RE9NfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtUZXN0Q29tcG9uZW50UmVuZGVyZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUvdGVzdGluZyc7XG5cbi8qKlxuICogQSBET00gYmFzZWQgaW1wbGVtZW50YXRpb24gb2YgdGhlIFRlc3RDb21wb25lbnRSZW5kZXJlci5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERPTVRlc3RDb21wb25lbnRSZW5kZXJlciBleHRlbmRzIFRlc3RDb21wb25lbnRSZW5kZXJlciB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgX2RvYzogYW55KSB7IHN1cGVyKCk7IH1cblxuICBpbnNlcnRSb290RWxlbWVudChyb290RWxJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgdGVtcGxhdGUgPSBnZXRET00oKS5nZXREZWZhdWx0RG9jdW1lbnQoKS5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IGA8ZGl2IGlkPVwiJHtyb290RWxJZH1cIj48L2Rpdj5gO1xuICAgIGNvbnN0IHJvb3RFbCA9IDxIVE1MRWxlbWVudD5nZXRDb250ZW50KHRlbXBsYXRlKS5maXJzdENoaWxkO1xuXG4gICAgLy8gVE9ETyhqdWxpZW1yKTogY2FuL3Nob3VsZCB0aGlzIGJlIG9wdGlvbmFsP1xuICAgIGNvbnN0IG9sZFJvb3RzID0gdGhpcy5fZG9jLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tpZF49cm9vdF0nKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9sZFJvb3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBnZXRET00oKS5yZW1vdmUob2xkUm9vdHNbaV0pO1xuICAgIH1cbiAgICB0aGlzLl9kb2MuYm9keS5hcHBlbmRDaGlsZChyb290RWwpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldENvbnRlbnQobm9kZTogTm9kZSk6IE5vZGUge1xuICBpZiAoJ2NvbnRlbnQnIGluIG5vZGUpIHtcbiAgICByZXR1cm4gKDxhbnk+bm9kZSkuY29udGVudDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxufVxuIl19