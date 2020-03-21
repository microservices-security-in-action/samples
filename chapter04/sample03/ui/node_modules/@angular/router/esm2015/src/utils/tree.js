/**
 * @fileoverview added by tsickle
 * Generated from: packages/router/src/utils/tree.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @template T
 */
export class Tree {
    /**
     * @param {?} root
     */
    constructor(root) { this._root = root; }
    /**
     * @return {?}
     */
    get root() { return this._root.value; }
    /**
     * \@internal
     * @param {?} t
     * @return {?}
     */
    parent(t) {
        /** @type {?} */
        const p = this.pathFromRoot(t);
        return p.length > 1 ? p[p.length - 2] : null;
    }
    /**
     * \@internal
     * @param {?} t
     * @return {?}
     */
    children(t) {
        /** @type {?} */
        const n = findNode(t, this._root);
        return n ? n.children.map((/**
         * @param {?} t
         * @return {?}
         */
        t => t.value)) : [];
    }
    /**
     * \@internal
     * @param {?} t
     * @return {?}
     */
    firstChild(t) {
        /** @type {?} */
        const n = findNode(t, this._root);
        return n && n.children.length > 0 ? n.children[0].value : null;
    }
    /**
     * \@internal
     * @param {?} t
     * @return {?}
     */
    siblings(t) {
        /** @type {?} */
        const p = findPath(t, this._root);
        if (p.length < 2)
            return [];
        /** @type {?} */
        const c = p[p.length - 2].children.map((/**
         * @param {?} c
         * @return {?}
         */
        c => c.value));
        return c.filter((/**
         * @param {?} cc
         * @return {?}
         */
        cc => cc !== t));
    }
    /**
     * \@internal
     * @param {?} t
     * @return {?}
     */
    pathFromRoot(t) { return findPath(t, this._root).map((/**
     * @param {?} s
     * @return {?}
     */
    s => s.value)); }
}
if (false) {
    /**
     * \@internal
     * @type {?}
     */
    Tree.prototype._root;
}
// DFS for the node matching the value
/**
 * @template T
 * @param {?} value
 * @param {?} node
 * @return {?}
 */
function findNode(value, node) {
    if (value === node.value)
        return node;
    for (const child of node.children) {
        /** @type {?} */
        const node = findNode(value, child);
        if (node)
            return node;
    }
    return null;
}
// Return the path to the node with the given value using DFS
/**
 * @template T
 * @param {?} value
 * @param {?} node
 * @return {?}
 */
function findPath(value, node) {
    if (value === node.value)
        return [node];
    for (const child of node.children) {
        /** @type {?} */
        const path = findPath(value, child);
        if (path.length) {
            path.unshift(node);
            return path;
        }
    }
    return [];
}
/**
 * @template T
 */
export class TreeNode {
    /**
     * @param {?} value
     * @param {?} children
     */
    constructor(value, children) {
        this.value = value;
        this.children = children;
    }
    /**
     * @return {?}
     */
    toString() { return `TreeNode(${this.value})`; }
}
if (false) {
    /** @type {?} */
    TreeNode.prototype.value;
    /** @type {?} */
    TreeNode.prototype.children;
}
// Return the list of T indexed by outlet name
/**
 * @template T
 * @param {?} node
 * @return {?}
 */
export function nodeChildrenAsMap(node) {
    /** @type {?} */
    const map = {};
    if (node) {
        node.children.forEach((/**
         * @param {?} child
         * @return {?}
         */
        child => map[child.value.outlet] = child));
    }
    return map;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci9zcmMvdXRpbHMvdHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFRQSxNQUFNLE9BQU8sSUFBSTs7OztJQUlmLFlBQVksSUFBaUIsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7Ozs7SUFFckQsSUFBSSxJQUFJLEtBQVEsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Ozs7OztJQUsxQyxNQUFNLENBQUMsQ0FBSTs7Y0FDSCxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDOUIsT0FBTyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUMvQyxDQUFDOzs7Ozs7SUFLRCxRQUFRLENBQUMsQ0FBSTs7Y0FDTCxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2pDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUc7Ozs7UUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQy9DLENBQUM7Ozs7OztJQUtELFVBQVUsQ0FBQyxDQUFJOztjQUNQLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ2pFLENBQUM7Ozs7OztJQUtELFFBQVEsQ0FBQyxDQUFJOztjQUNMLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDakMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUM7WUFBRSxPQUFPLEVBQUUsQ0FBQzs7Y0FFdEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHOzs7O1FBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFDO1FBQ3BELE9BQU8sQ0FBQyxDQUFDLE1BQU07Ozs7UUFBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUMsQ0FBQztJQUNsQyxDQUFDOzs7Ozs7SUFLRCxZQUFZLENBQUMsQ0FBSSxJQUFTLE9BQU8sUUFBUSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRzs7OztJQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztDQUM5RTs7Ozs7O0lBN0NDLHFCQUFtQjs7Ozs7Ozs7O0FBaURyQixTQUFTLFFBQVEsQ0FBSSxLQUFRLEVBQUUsSUFBaUI7SUFDOUMsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUs7UUFBRSxPQUFPLElBQUksQ0FBQztJQUV0QyxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7O2NBQzNCLElBQUksR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNuQyxJQUFJLElBQUk7WUFBRSxPQUFPLElBQUksQ0FBQztLQUN2QjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQzs7Ozs7Ozs7QUFHRCxTQUFTLFFBQVEsQ0FBSSxLQUFRLEVBQUUsSUFBaUI7SUFDOUMsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUs7UUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFeEMsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFOztjQUMzQixJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDbkMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuQixPQUFPLElBQUksQ0FBQztTQUNiO0tBQ0Y7SUFFRCxPQUFPLEVBQUUsQ0FBQztBQUNaLENBQUM7Ozs7QUFFRCxNQUFNLE9BQU8sUUFBUTs7Ozs7SUFDbkIsWUFBbUIsS0FBUSxFQUFTLFFBQXVCO1FBQXhDLFVBQUssR0FBTCxLQUFLLENBQUc7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFlO0lBQUcsQ0FBQzs7OztJQUUvRCxRQUFRLEtBQWEsT0FBTyxZQUFZLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDekQ7OztJQUhhLHlCQUFlOztJQUFFLDRCQUE4Qjs7Ozs7Ozs7QUFNN0QsTUFBTSxVQUFVLGlCQUFpQixDQUE0QixJQUF1Qjs7VUFDNUUsR0FBRyxHQUFvQyxFQUFFO0lBRS9DLElBQUksSUFBSSxFQUFFO1FBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPOzs7O1FBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLEVBQUMsQ0FBQztLQUNqRTtJQUVELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IGNsYXNzIFRyZWU8VD4ge1xuICAvKiogQGludGVybmFsICovXG4gIF9yb290OiBUcmVlTm9kZTxUPjtcblxuICBjb25zdHJ1Y3Rvcihyb290OiBUcmVlTm9kZTxUPikgeyB0aGlzLl9yb290ID0gcm9vdDsgfVxuXG4gIGdldCByb290KCk6IFQgeyByZXR1cm4gdGhpcy5fcm9vdC52YWx1ZTsgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHBhcmVudCh0OiBUKTogVHxudWxsIHtcbiAgICBjb25zdCBwID0gdGhpcy5wYXRoRnJvbVJvb3QodCk7XG4gICAgcmV0dXJuIHAubGVuZ3RoID4gMSA/IHBbcC5sZW5ndGggLSAyXSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBjaGlsZHJlbih0OiBUKTogVFtdIHtcbiAgICBjb25zdCBuID0gZmluZE5vZGUodCwgdGhpcy5fcm9vdCk7XG4gICAgcmV0dXJuIG4gPyBuLmNoaWxkcmVuLm1hcCh0ID0+IHQudmFsdWUpIDogW107XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBmaXJzdENoaWxkKHQ6IFQpOiBUfG51bGwge1xuICAgIGNvbnN0IG4gPSBmaW5kTm9kZSh0LCB0aGlzLl9yb290KTtcbiAgICByZXR1cm4gbiAmJiBuLmNoaWxkcmVuLmxlbmd0aCA+IDAgPyBuLmNoaWxkcmVuWzBdLnZhbHVlIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHNpYmxpbmdzKHQ6IFQpOiBUW10ge1xuICAgIGNvbnN0IHAgPSBmaW5kUGF0aCh0LCB0aGlzLl9yb290KTtcbiAgICBpZiAocC5sZW5ndGggPCAyKSByZXR1cm4gW107XG5cbiAgICBjb25zdCBjID0gcFtwLmxlbmd0aCAtIDJdLmNoaWxkcmVuLm1hcChjID0+IGMudmFsdWUpO1xuICAgIHJldHVybiBjLmZpbHRlcihjYyA9PiBjYyAhPT0gdCk7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBwYXRoRnJvbVJvb3QodDogVCk6IFRbXSB7IHJldHVybiBmaW5kUGF0aCh0LCB0aGlzLl9yb290KS5tYXAocyA9PiBzLnZhbHVlKTsgfVxufVxuXG5cbi8vIERGUyBmb3IgdGhlIG5vZGUgbWF0Y2hpbmcgdGhlIHZhbHVlXG5mdW5jdGlvbiBmaW5kTm9kZTxUPih2YWx1ZTogVCwgbm9kZTogVHJlZU5vZGU8VD4pOiBUcmVlTm9kZTxUPnxudWxsIHtcbiAgaWYgKHZhbHVlID09PSBub2RlLnZhbHVlKSByZXR1cm4gbm9kZTtcblxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICBjb25zdCBub2RlID0gZmluZE5vZGUodmFsdWUsIGNoaWxkKTtcbiAgICBpZiAobm9kZSkgcmV0dXJuIG5vZGU7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLy8gUmV0dXJuIHRoZSBwYXRoIHRvIHRoZSBub2RlIHdpdGggdGhlIGdpdmVuIHZhbHVlIHVzaW5nIERGU1xuZnVuY3Rpb24gZmluZFBhdGg8VD4odmFsdWU6IFQsIG5vZGU6IFRyZWVOb2RlPFQ+KTogVHJlZU5vZGU8VD5bXSB7XG4gIGlmICh2YWx1ZSA9PT0gbm9kZS52YWx1ZSkgcmV0dXJuIFtub2RlXTtcblxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICBjb25zdCBwYXRoID0gZmluZFBhdGgodmFsdWUsIGNoaWxkKTtcbiAgICBpZiAocGF0aC5sZW5ndGgpIHtcbiAgICAgIHBhdGgudW5zaGlmdChub2RlKTtcbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbXTtcbn1cblxuZXhwb3J0IGNsYXNzIFRyZWVOb2RlPFQ+IHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBULCBwdWJsaWMgY2hpbGRyZW46IFRyZWVOb2RlPFQ+W10pIHt9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBUcmVlTm9kZSgke3RoaXMudmFsdWV9KWA7IH1cbn1cblxuLy8gUmV0dXJuIHRoZSBsaXN0IG9mIFQgaW5kZXhlZCBieSBvdXRsZXQgbmFtZVxuZXhwb3J0IGZ1bmN0aW9uIG5vZGVDaGlsZHJlbkFzTWFwPFQgZXh0ZW5kc3tvdXRsZXQ6IHN0cmluZ30+KG5vZGU6IFRyZWVOb2RlPFQ+fCBudWxsKSB7XG4gIGNvbnN0IG1hcDoge1tvdXRsZXQ6IHN0cmluZ106IFRyZWVOb2RlPFQ+fSA9IHt9O1xuXG4gIGlmIChub2RlKSB7XG4gICAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IG1hcFtjaGlsZC52YWx1ZS5vdXRsZXRdID0gY2hpbGQpO1xuICB9XG5cbiAgcmV0dXJuIG1hcDtcbn0iXX0=