/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __values } from "tslib";
var Tree = /** @class */ (function () {
    function Tree(root) {
        this._root = root;
    }
    Object.defineProperty(Tree.prototype, "root", {
        get: function () { return this._root.value; },
        enumerable: true,
        configurable: true
    });
    /**
     * @internal
     */
    Tree.prototype.parent = function (t) {
        var p = this.pathFromRoot(t);
        return p.length > 1 ? p[p.length - 2] : null;
    };
    /**
     * @internal
     */
    Tree.prototype.children = function (t) {
        var n = findNode(t, this._root);
        return n ? n.children.map(function (t) { return t.value; }) : [];
    };
    /**
     * @internal
     */
    Tree.prototype.firstChild = function (t) {
        var n = findNode(t, this._root);
        return n && n.children.length > 0 ? n.children[0].value : null;
    };
    /**
     * @internal
     */
    Tree.prototype.siblings = function (t) {
        var p = findPath(t, this._root);
        if (p.length < 2)
            return [];
        var c = p[p.length - 2].children.map(function (c) { return c.value; });
        return c.filter(function (cc) { return cc !== t; });
    };
    /**
     * @internal
     */
    Tree.prototype.pathFromRoot = function (t) { return findPath(t, this._root).map(function (s) { return s.value; }); };
    return Tree;
}());
export { Tree };
// DFS for the node matching the value
function findNode(value, node) {
    var e_1, _a;
    if (value === node.value)
        return node;
    try {
        for (var _b = __values(node.children), _c = _b.next(); !_c.done; _c = _b.next()) {
            var child = _c.value;
            var node_1 = findNode(value, child);
            if (node_1)
                return node_1;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return null;
}
// Return the path to the node with the given value using DFS
function findPath(value, node) {
    var e_2, _a;
    if (value === node.value)
        return [node];
    try {
        for (var _b = __values(node.children), _c = _b.next(); !_c.done; _c = _b.next()) {
            var child = _c.value;
            var path = findPath(value, child);
            if (path.length) {
                path.unshift(node);
                return path;
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return [];
}
var TreeNode = /** @class */ (function () {
    function TreeNode(value, children) {
        this.value = value;
        this.children = children;
    }
    TreeNode.prototype.toString = function () { return "TreeNode(" + this.value + ")"; };
    return TreeNode;
}());
export { TreeNode };
// Return the list of T indexed by outlet name
export function nodeChildrenAsMap(node) {
    var map = {};
    if (node) {
        node.children.forEach(function (child) { return map[child.value.outlet] = child; });
    }
    return map;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci9zcmMvdXRpbHMvdHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUg7SUFJRSxjQUFZLElBQWlCO1FBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFBQyxDQUFDO0lBRXJELHNCQUFJLHNCQUFJO2FBQVIsY0FBZ0IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRTFDOztPQUVHO0lBQ0gscUJBQU0sR0FBTixVQUFPLENBQUk7UUFDVCxJQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDL0MsQ0FBQztJQUVEOztPQUVHO0lBQ0gsdUJBQVEsR0FBUixVQUFTLENBQUk7UUFDWCxJQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsS0FBSyxFQUFQLENBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVEOztPQUVHO0lBQ0gseUJBQVUsR0FBVixVQUFXLENBQUk7UUFDYixJQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQyxPQUFPLENBQUMsSUFB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LEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxFQUEvQixDQUErQixDQUFDLENBQUM7S0FDakU7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCBjbGFzcyBUcmVlPFQ+IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcm9vdDogVHJlZU5vZGU8VD47XG5cbiAgY29uc3RydWN0b3Iocm9vdDogVHJlZU5vZGU8VD4pIHsgdGhpcy5fcm9vdCA9IHJvb3Q7IH1cblxuICBnZXQgcm9vdCgpOiBUIHsgcmV0dXJuIHRoaXMuX3Jvb3QudmFsdWU7IH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBwYXJlbnQodDogVCk6IFR8bnVsbCB7XG4gICAgY29uc3QgcCA9IHRoaXMucGF0aEZyb21Sb290KHQpO1xuICAgIHJldHVybiBwLmxlbmd0aCA+IDEgPyBwW3AubGVuZ3RoIC0gMl0gOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgY2hpbGRyZW4odDogVCk6IFRbXSB7XG4gICAgY29uc3QgbiA9IGZpbmROb2RlKHQsIHRoaXMuX3Jvb3QpO1xuICAgIHJldHVybiBuID8gbi5jaGlsZHJlbi5tYXAodCA9PiB0LnZhbHVlKSA6IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgZmlyc3RDaGlsZCh0OiBUKTogVHxudWxsIHtcbiAgICBjb25zdCBuID0gZmluZE5vZGUodCwgdGhpcy5fcm9vdCk7XG4gICAgcmV0dXJuIG4gJiYgbi5jaGlsZHJlbi5sZW5ndGggPiAwID8gbi5jaGlsZHJlblswXS52YWx1ZSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBzaWJsaW5ncyh0OiBUKTogVFtdIHtcbiAgICBjb25zdCBwID0gZmluZFBhdGgodCwgdGhpcy5fcm9vdCk7XG4gICAgaWYgKHAubGVuZ3RoIDwgMikgcmV0dXJuIFtdO1xuXG4gICAgY29uc3QgYyA9IHBbcC5sZW5ndGggLSAyXS5jaGlsZHJlbi5tYXAoYyA9PiBjLnZhbHVlKTtcbiAgICByZXR1cm4gYy5maWx0ZXIoY2MgPT4gY2MgIT09IHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgcGF0aEZyb21Sb290KHQ6IFQpOiBUW10geyByZXR1cm4gZmluZFBhdGgodCwgdGhpcy5fcm9vdCkubWFwKHMgPT4gcy52YWx1ZSk7IH1cbn1cblxuXG4vLyBERlMgZm9yIHRoZSBub2RlIG1hdGNoaW5nIHRoZSB2YWx1ZVxuZnVuY3Rpb24gZmluZE5vZGU8VD4odmFsdWU6IFQsIG5vZGU6IFRyZWVOb2RlPFQ+KTogVHJlZU5vZGU8VD58bnVsbCB7XG4gIGlmICh2YWx1ZSA9PT0gbm9kZS52YWx1ZSkgcmV0dXJuIG5vZGU7XG5cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgY29uc3Qgbm9kZSA9IGZpbmROb2RlKHZhbHVlLCBjaGlsZCk7XG4gICAgaWYgKG5vZGUpIHJldHVybiBub2RlO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIFJldHVybiB0aGUgcGF0aCB0byB0aGUgbm9kZSB3aXRoIHRoZSBnaXZlbiB2YWx1ZSB1c2luZyBERlNcbmZ1bmN0aW9uIGZpbmRQYXRoPFQ+KHZhbHVlOiBULCBub2RlOiBUcmVlTm9kZTxUPik6IFRyZWVOb2RlPFQ+W10ge1xuICBpZiAodmFsdWUgPT09IG5vZGUudmFsdWUpIHJldHVybiBbbm9kZV07XG5cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgY29uc3QgcGF0aCA9IGZpbmRQYXRoKHZhbHVlLCBjaGlsZCk7XG4gICAgaWYgKHBhdGgubGVuZ3RoKSB7XG4gICAgICBwYXRoLnVuc2hpZnQobm9kZSk7XG4gICAgICByZXR1cm4gcGF0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gW107XG59XG5cbmV4cG9ydCBjbGFzcyBUcmVlTm9kZTxUPiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogVCwgcHVibGljIGNoaWxkcmVuOiBUcmVlTm9kZTxUPltdKSB7fVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgVHJlZU5vZGUoJHt0aGlzLnZhbHVlfSlgOyB9XG59XG5cbi8vIFJldHVybiB0aGUgbGlzdCBvZiBUIGluZGV4ZWQgYnkgb3V0bGV0IG5hbWVcbmV4cG9ydCBmdW5jdGlvbiBub2RlQ2hpbGRyZW5Bc01hcDxUIGV4dGVuZHN7b3V0bGV0OiBzdHJpbmd9Pihub2RlOiBUcmVlTm9kZTxUPnwgbnVsbCkge1xuICBjb25zdCBtYXA6IHtbb3V0bGV0OiBzdHJpbmddOiBUcmVlTm9kZTxUPn0gPSB7fTtcblxuICBpZiAobm9kZSkge1xuICAgIG5vZGUuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiBtYXBbY2hpbGQudmFsdWUub3V0bGV0XSA9IGNoaWxkKTtcbiAgfVxuXG4gIHJldHVybiBtYXA7XG59Il19