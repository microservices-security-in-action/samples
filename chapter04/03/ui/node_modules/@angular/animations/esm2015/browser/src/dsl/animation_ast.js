/**
 * @fileoverview added by tsickle
 * Generated from: packages/animations/browser/src/dsl/animation_ast.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
const EMPTY_ANIMATION_OPTIONS = {};
/**
 * @record
 */
export function AstVisitor() { }
if (false) {
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AstVisitor.prototype.visitTrigger = function (ast, context) { };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AstVisitor.prototype.visitState = function (ast, context) { };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AstVisitor.prototype.visitTransition = function (ast, context) { };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AstVisitor.prototype.visitSequence = function (ast, context) { };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AstVisitor.prototype.visitGroup = function (ast, context) { };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AstVisitor.prototype.visitAnimate = function (ast, context) { };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AstVisitor.prototype.visitStyle = function (ast, context) { };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AstVisitor.prototype.visitKeyframes = function (ast, context) { };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AstVisitor.prototype.visitReference = function (ast, context) { };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AstVisitor.prototype.visitAnimateChild = function (ast, context) { };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AstVisitor.prototype.visitAnimateRef = function (ast, context) { };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AstVisitor.prototype.visitQuery = function (ast, context) { };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AstVisitor.prototype.visitStagger = function (ast, context) { };
}
/**
 * @record
 * @template T
 */
export function Ast() { }
if (false) {
    /** @type {?} */
    Ast.prototype.type;
    /** @type {?} */
    Ast.prototype.options;
}
/**
 * @record
 */
export function TriggerAst() { }
if (false) {
    /** @type {?} */
    TriggerAst.prototype.type;
    /** @type {?} */
    TriggerAst.prototype.name;
    /** @type {?} */
    TriggerAst.prototype.states;
    /** @type {?} */
    TriggerAst.prototype.transitions;
    /** @type {?} */
    TriggerAst.prototype.queryCount;
    /** @type {?} */
    TriggerAst.prototype.depCount;
}
/**
 * @record
 */
export function StateAst() { }
if (false) {
    /** @type {?} */
    StateAst.prototype.type;
    /** @type {?} */
    StateAst.prototype.name;
    /** @type {?} */
    StateAst.prototype.style;
}
/**
 * @record
 */
export function TransitionAst() { }
if (false) {
    /** @type {?} */
    TransitionAst.prototype.matchers;
    /** @type {?} */
    TransitionAst.prototype.animation;
    /** @type {?} */
    TransitionAst.prototype.queryCount;
    /** @type {?} */
    TransitionAst.prototype.depCount;
}
/**
 * @record
 */
export function SequenceAst() { }
if (false) {
    /** @type {?} */
    SequenceAst.prototype.steps;
}
/**
 * @record
 */
export function GroupAst() { }
if (false) {
    /** @type {?} */
    GroupAst.prototype.steps;
}
/**
 * @record
 */
export function AnimateAst() { }
if (false) {
    /** @type {?} */
    AnimateAst.prototype.timings;
    /** @type {?} */
    AnimateAst.prototype.style;
}
/**
 * @record
 */
export function StyleAst() { }
if (false) {
    /** @type {?} */
    StyleAst.prototype.styles;
    /** @type {?} */
    StyleAst.prototype.easing;
    /** @type {?} */
    StyleAst.prototype.offset;
    /** @type {?} */
    StyleAst.prototype.containsDynamicStyles;
    /** @type {?|undefined} */
    StyleAst.prototype.isEmptyStep;
}
/**
 * @record
 */
export function KeyframesAst() { }
if (false) {
    /** @type {?} */
    KeyframesAst.prototype.styles;
}
/**
 * @record
 */
export function ReferenceAst() { }
if (false) {
    /** @type {?} */
    ReferenceAst.prototype.animation;
}
/**
 * @record
 */
export function AnimateChildAst() { }
/**
 * @record
 */
export function AnimateRefAst() { }
if (false) {
    /** @type {?} */
    AnimateRefAst.prototype.animation;
}
/**
 * @record
 */
export function QueryAst() { }
if (false) {
    /** @type {?} */
    QueryAst.prototype.selector;
    /** @type {?} */
    QueryAst.prototype.limit;
    /** @type {?} */
    QueryAst.prototype.optional;
    /** @type {?} */
    QueryAst.prototype.includeSelf;
    /** @type {?} */
    QueryAst.prototype.animation;
    /** @type {?} */
    QueryAst.prototype.originalSelector;
}
/**
 * @record
 */
export function StaggerAst() { }
if (false) {
    /** @type {?} */
    StaggerAst.prototype.timings;
    /** @type {?} */
    StaggerAst.prototype.animation;
}
/**
 * @record
 */
export function TimingAst() { }
if (false) {
    /** @type {?} */
    TimingAst.prototype.duration;
    /** @type {?} */
    TimingAst.prototype.delay;
    /** @type {?} */
    TimingAst.prototype.easing;
    /** @type {?|undefined} */
    TimingAst.prototype.dynamic;
}
/**
 * @record
 */
export function DynamicTimingAst() { }
if (false) {
    /** @type {?} */
    DynamicTimingAst.prototype.strValue;
    /** @type {?} */
    DynamicTimingAst.prototype.dynamic;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2FzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvZHNsL2FuaW1hdGlvbl9hc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O01BU00sdUJBQXVCLEdBQXFCLEVBQUU7Ozs7QUFFcEQsZ0NBY0M7Ozs7Ozs7SUFiQyxnRUFBaUQ7Ozs7OztJQUNqRCw4REFBNkM7Ozs7OztJQUM3QyxtRUFBdUQ7Ozs7OztJQUN2RCxpRUFBbUQ7Ozs7OztJQUNuRCw4REFBNkM7Ozs7OztJQUM3QyxnRUFBaUQ7Ozs7OztJQUNqRCw4REFBNkM7Ozs7OztJQUM3QyxrRUFBcUQ7Ozs7OztJQUNyRCxrRUFBcUQ7Ozs7OztJQUNyRCxxRUFBMkQ7Ozs7OztJQUMzRCxtRUFBdUQ7Ozs7OztJQUN2RCw4REFBNkM7Ozs7OztJQUM3QyxnRUFBaUQ7Ozs7OztBQUduRCx5QkFHQzs7O0lBRkMsbUJBQVE7O0lBQ1Isc0JBQStCOzs7OztBQUdqQyxnQ0FPQzs7O0lBTkMsMEJBQW9DOztJQUNwQywwQkFBYTs7SUFDYiw0QkFBbUI7O0lBQ25CLGlDQUE2Qjs7SUFDN0IsZ0NBQW1COztJQUNuQiw4QkFBaUI7Ozs7O0FBR25CLDhCQUlDOzs7SUFIQyx3QkFBa0M7O0lBQ2xDLHdCQUFhOztJQUNiLHlCQUFnQjs7Ozs7QUFHbEIsbUNBTUM7OztJQUxDLGlDQUMrRjs7SUFDL0Ysa0NBQXNDOztJQUN0QyxtQ0FBbUI7O0lBQ25CLGlDQUFpQjs7Ozs7QUFHbkIsaUNBRUM7OztJQURDLDRCQUFvQzs7Ozs7QUFHdEMsOEJBRUM7OztJQURDLHlCQUFvQzs7Ozs7QUFHdEMsZ0NBR0M7OztJQUZDLDZCQUFtQjs7SUFDbkIsMkJBQTZCOzs7OztBQUcvQiw4QkFNQzs7O0lBTEMsMEJBQThCOztJQUM5QiwwQkFBb0I7O0lBQ3BCLDBCQUFvQjs7SUFDcEIseUNBQStCOztJQUMvQiwrQkFBc0I7Ozs7O0FBR3hCLGtDQUFrRzs7O0lBQXJCLDhCQUFtQjs7Ozs7QUFFaEcsa0NBRUM7OztJQURDLGlDQUFzQzs7Ozs7QUFHeEMscUNBQW1GOzs7O0FBRW5GLG1DQUVDOzs7SUFEQyxrQ0FBd0I7Ozs7O0FBRzFCLDhCQU9DOzs7SUFOQyw0QkFBaUI7O0lBQ2pCLHlCQUFjOztJQUNkLDRCQUFrQjs7SUFDbEIsK0JBQXFCOztJQUNyQiw2QkFBc0M7O0lBQ3RDLG9DQUF5Qjs7Ozs7QUFHM0IsZ0NBR0M7OztJQUZDLDZCQUF3Qjs7SUFDeEIsK0JBQXNDOzs7OztBQUd4QywrQkFLQzs7O0lBSkMsNkJBQWlCOztJQUNqQiwwQkFBYzs7SUFDZCwyQkFBb0I7O0lBQ3BCLDRCQUFrQjs7Ozs7QUFHcEIsc0NBR0M7OztJQUZDLG9DQUFpQjs7SUFDakIsbUNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGVUaW1pbmdzLCBBbmltYXRpb25NZXRhZGF0YVR5cGUsIEFuaW1hdGlvbk9wdGlvbnMsIMm1U3R5bGVEYXRhfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuY29uc3QgRU1QVFlfQU5JTUFUSU9OX09QVElPTlM6IEFuaW1hdGlvbk9wdGlvbnMgPSB7fTtcblxuZXhwb3J0IGludGVyZmFjZSBBc3RWaXNpdG9yIHtcbiAgdmlzaXRUcmlnZ2VyKGFzdDogVHJpZ2dlckFzdCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFN0YXRlKGFzdDogU3RhdGVBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRUcmFuc2l0aW9uKGFzdDogVHJhbnNpdGlvbkFzdCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFNlcXVlbmNlKGFzdDogU2VxdWVuY2VBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRHcm91cChhc3Q6IEdyb3VwQXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0QW5pbWF0ZShhc3Q6IEFuaW1hdGVBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRTdHlsZShhc3Q6IFN0eWxlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0S2V5ZnJhbWVzKGFzdDogS2V5ZnJhbWVzQXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0UmVmZXJlbmNlKGFzdDogUmVmZXJlbmNlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0QW5pbWF0ZUNoaWxkKGFzdDogQW5pbWF0ZUNoaWxkQXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0QW5pbWF0ZVJlZihhc3Q6IEFuaW1hdGVSZWZBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRRdWVyeShhc3Q6IFF1ZXJ5QXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0U3RhZ2dlcihhc3Q6IFN0YWdnZXJBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBc3Q8VCBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhVHlwZT4ge1xuICB0eXBlOiBUO1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHJpZ2dlckFzdCBleHRlbmRzIEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJpZ2dlcj4ge1xuICB0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJpZ2dlcjtcbiAgbmFtZTogc3RyaW5nO1xuICBzdGF0ZXM6IFN0YXRlQXN0W107XG4gIHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uQXN0W107XG4gIHF1ZXJ5Q291bnQ6IG51bWJlcjtcbiAgZGVwQ291bnQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdGF0ZUFzdCBleHRlbmRzIEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGUuU3RhdGU+IHtcbiAgdHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0YXRlO1xuICBuYW1lOiBzdHJpbmc7XG4gIHN0eWxlOiBTdHlsZUFzdDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUcmFuc2l0aW9uQXN0IGV4dGVuZHMgQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmFuc2l0aW9uPiB7XG4gIG1hdGNoZXJzOiAoKGZyb21TdGF0ZTogc3RyaW5nLCB0b1N0YXRlOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgcGFyYW1zOiB7W2tleTogc3RyaW5nXTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW55fSkgPT4gYm9vbGVhbilbXTtcbiAgYW5pbWF0aW9uOiBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPjtcbiAgcXVlcnlDb3VudDogbnVtYmVyO1xuICBkZXBDb3VudDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNlcXVlbmNlQXN0IGV4dGVuZHMgQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TZXF1ZW5jZT4ge1xuICBzdGVwczogQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZT5bXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHcm91cEFzdCBleHRlbmRzIEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGUuR3JvdXA+IHtcbiAgc3RlcHM6IEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGU+W107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0ZUFzdCBleHRlbmRzIEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZT4ge1xuICB0aW1pbmdzOiBUaW1pbmdBc3Q7XG4gIHN0eWxlOiBTdHlsZUFzdHxLZXlmcmFtZXNBc3Q7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3R5bGVBc3QgZXh0ZW5kcyBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0eWxlPiB7XG4gIHN0eWxlczogKMm1U3R5bGVEYXRhfHN0cmluZylbXTtcbiAgZWFzaW5nOiBzdHJpbmd8bnVsbDtcbiAgb2Zmc2V0OiBudW1iZXJ8bnVsbDtcbiAgY29udGFpbnNEeW5hbWljU3R5bGVzOiBib29sZWFuO1xuICBpc0VtcHR5U3RlcD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgS2V5ZnJhbWVzQXN0IGV4dGVuZHMgQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5LZXlmcmFtZXM+IHsgc3R5bGVzOiBTdHlsZUFzdFtdOyB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVmZXJlbmNlQXN0IGV4dGVuZHMgQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5SZWZlcmVuY2U+IHtcbiAgYW5pbWF0aW9uOiBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbmltYXRlQ2hpbGRBc3QgZXh0ZW5kcyBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGVDaGlsZD4ge31cblxuZXhwb3J0IGludGVyZmFjZSBBbmltYXRlUmVmQXN0IGV4dGVuZHMgQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlUmVmPiB7XG4gIGFuaW1hdGlvbjogUmVmZXJlbmNlQXN0O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXJ5QXN0IGV4dGVuZHMgQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5RdWVyeT4ge1xuICBzZWxlY3Rvcjogc3RyaW5nO1xuICBsaW1pdDogbnVtYmVyO1xuICBvcHRpb25hbDogYm9vbGVhbjtcbiAgaW5jbHVkZVNlbGY6IGJvb2xlYW47XG4gIGFuaW1hdGlvbjogQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZT47XG4gIG9yaWdpbmFsU2VsZWN0b3I6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdGFnZ2VyQXN0IGV4dGVuZHMgQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdGFnZ2VyPiB7XG4gIHRpbWluZ3M6IEFuaW1hdGVUaW1pbmdzO1xuICBhbmltYXRpb246IEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGU+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRpbWluZ0FzdCB7XG4gIGR1cmF0aW9uOiBudW1iZXI7XG4gIGRlbGF5OiBudW1iZXI7XG4gIGVhc2luZzogc3RyaW5nfG51bGw7XG4gIGR5bmFtaWM/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIER5bmFtaWNUaW1pbmdBc3QgZXh0ZW5kcyBUaW1pbmdBc3Qge1xuICBzdHJWYWx1ZTogc3RyaW5nO1xuICBkeW5hbWljOiB0cnVlO1xufVxuIl19