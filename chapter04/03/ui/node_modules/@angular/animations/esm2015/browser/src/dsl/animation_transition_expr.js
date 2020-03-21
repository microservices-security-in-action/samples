/**
 * @fileoverview added by tsickle
 * Generated from: packages/animations/browser/src/dsl/animation_transition_expr.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 * @type {?}
 */
export const ANY_STATE = '*';
/**
 * @param {?} transitionValue
 * @param {?} errors
 * @return {?}
 */
export function parseTransitionExpr(transitionValue, errors) {
    /** @type {?} */
    const expressions = [];
    if (typeof transitionValue == 'string') {
        transitionValue.split(/\s*,\s*/).forEach((/**
         * @param {?} str
         * @return {?}
         */
        str => parseInnerTransitionStr(str, expressions, errors)));
    }
    else {
        expressions.push((/** @type {?} */ (transitionValue)));
    }
    return expressions;
}
/**
 * @param {?} eventStr
 * @param {?} expressions
 * @param {?} errors
 * @return {?}
 */
function parseInnerTransitionStr(eventStr, expressions, errors) {
    if (eventStr[0] == ':') {
        /** @type {?} */
        const result = parseAnimationAlias(eventStr, errors);
        if (typeof result == 'function') {
            expressions.push(result);
            return;
        }
        eventStr = result;
    }
    /** @type {?} */
    const match = eventStr.match(/^(\*|[-\w]+)\s*(<?[=-]>)\s*(\*|[-\w]+)$/);
    if (match == null || match.length < 4) {
        errors.push(`The provided transition expression "${eventStr}" is not supported`);
        return expressions;
    }
    /** @type {?} */
    const fromState = match[1];
    /** @type {?} */
    const separator = match[2];
    /** @type {?} */
    const toState = match[3];
    expressions.push(makeLambdaFromStates(fromState, toState));
    /** @type {?} */
    const isFullAnyStateExpr = fromState == ANY_STATE && toState == ANY_STATE;
    if (separator[0] == '<' && !isFullAnyStateExpr) {
        expressions.push(makeLambdaFromStates(toState, fromState));
    }
}
/**
 * @param {?} alias
 * @param {?} errors
 * @return {?}
 */
function parseAnimationAlias(alias, errors) {
    switch (alias) {
        case ':enter':
            return 'void => *';
        case ':leave':
            return '* => void';
        case ':increment':
            return (/**
             * @param {?} fromState
             * @param {?} toState
             * @return {?}
             */
            (fromState, toState) => parseFloat(toState) > parseFloat(fromState));
        case ':decrement':
            return (/**
             * @param {?} fromState
             * @param {?} toState
             * @return {?}
             */
            (fromState, toState) => parseFloat(toState) < parseFloat(fromState));
        default:
            errors.push(`The transition alias value "${alias}" is not supported`);
            return '* => *';
    }
}
// DO NOT REFACTOR ... keep the follow set instantiations
// with the values intact (closure compiler for some reason
// removes follow-up lines that add the values outside of
// the constructor...
/** @type {?} */
const TRUE_BOOLEAN_VALUES = new Set(['true', '1']);
/** @type {?} */
const FALSE_BOOLEAN_VALUES = new Set(['false', '0']);
/**
 * @param {?} lhs
 * @param {?} rhs
 * @return {?}
 */
function makeLambdaFromStates(lhs, rhs) {
    /** @type {?} */
    const LHS_MATCH_BOOLEAN = TRUE_BOOLEAN_VALUES.has(lhs) || FALSE_BOOLEAN_VALUES.has(lhs);
    /** @type {?} */
    const RHS_MATCH_BOOLEAN = TRUE_BOOLEAN_VALUES.has(rhs) || FALSE_BOOLEAN_VALUES.has(rhs);
    return (/**
     * @param {?} fromState
     * @param {?} toState
     * @return {?}
     */
    (fromState, toState) => {
        /** @type {?} */
        let lhsMatch = lhs == ANY_STATE || lhs == fromState;
        /** @type {?} */
        let rhsMatch = rhs == ANY_STATE || rhs == toState;
        if (!lhsMatch && LHS_MATCH_BOOLEAN && typeof fromState === 'boolean') {
            lhsMatch = fromState ? TRUE_BOOLEAN_VALUES.has(lhs) : FALSE_BOOLEAN_VALUES.has(lhs);
        }
        if (!rhsMatch && RHS_MATCH_BOOLEAN && typeof toState === 'boolean') {
            rhsMatch = toState ? TRUE_BOOLEAN_VALUES.has(rhs) : FALSE_BOOLEAN_VALUES.has(rhs);
        }
        return lhsMatch && rhsMatch;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyYW5zaXRpb25fZXhwci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2V4cHIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQU9BLE1BQU0sT0FBTyxTQUFTLEdBQUcsR0FBRzs7Ozs7O0FBSTVCLE1BQU0sVUFBVSxtQkFBbUIsQ0FDL0IsZUFBNkMsRUFBRSxNQUFnQjs7VUFDM0QsV0FBVyxHQUEwQixFQUFFO0lBQzdDLElBQUksT0FBTyxlQUFlLElBQUksUUFBUSxFQUFFO1FBQ3RDLGVBQWUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTzs7OztRQUNwQyxHQUFHLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLEVBQUMsQ0FBQztLQUMvRDtTQUFNO1FBQ0wsV0FBVyxDQUFDLElBQUksQ0FBQyxtQkFBcUIsZUFBZSxFQUFBLENBQUMsQ0FBQztLQUN4RDtJQUNELE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUM7Ozs7Ozs7QUFFRCxTQUFTLHVCQUF1QixDQUM1QixRQUFnQixFQUFFLFdBQWtDLEVBQUUsTUFBZ0I7SUFDeEUsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFOztjQUNoQixNQUFNLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztRQUNwRCxJQUFJLE9BQU8sTUFBTSxJQUFJLFVBQVUsRUFBRTtZQUMvQixXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pCLE9BQU87U0FDUjtRQUNELFFBQVEsR0FBRyxNQUFNLENBQUM7S0FDbkI7O1VBRUssS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMseUNBQXlDLENBQUM7SUFDdkUsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsdUNBQXVDLFFBQVEsb0JBQW9CLENBQUMsQ0FBQztRQUNqRixPQUFPLFdBQVcsQ0FBQztLQUNwQjs7VUFFSyxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQzs7VUFDcEIsU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7O1VBQ3BCLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3hCLFdBQVcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7O1VBRXJELGtCQUFrQixHQUFHLFNBQVMsSUFBSSxTQUFTLElBQUksT0FBTyxJQUFJLFNBQVM7SUFDekUsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7UUFDOUMsV0FBVyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztLQUM1RDtBQUNILENBQUM7Ozs7OztBQUVELFNBQVMsbUJBQW1CLENBQUMsS0FBYSxFQUFFLE1BQWdCO0lBQzFELFFBQVEsS0FBSyxFQUFFO1FBQ2IsS0FBSyxRQUFRO1lBQ1gsT0FBTyxXQUFXLENBQUM7UUFDckIsS0FBSyxRQUFRO1lBQ1gsT0FBTyxXQUFXLENBQUM7UUFDckIsS0FBSyxZQUFZO1lBQ2Y7Ozs7O1lBQU8sQ0FBQyxTQUFjLEVBQUUsT0FBWSxFQUFXLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFDO1FBQ2hHLEtBQUssWUFBWTtZQUNmOzs7OztZQUFPLENBQUMsU0FBYyxFQUFFLE9BQVksRUFBVyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBQztRQUNoRztZQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsK0JBQStCLEtBQUssb0JBQW9CLENBQUMsQ0FBQztZQUN0RSxPQUFPLFFBQVEsQ0FBQztLQUNuQjtBQUNILENBQUM7Ozs7OztNQU1LLG1CQUFtQixHQUFHLElBQUksR0FBRyxDQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDOztNQUNwRCxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FBUyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQzs7Ozs7O0FBRTVELFNBQVMsb0JBQW9CLENBQUMsR0FBVyxFQUFFLEdBQVc7O1VBQzlDLGlCQUFpQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDOztVQUNqRixpQkFBaUIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksb0JBQW9CLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztJQUV2Rjs7Ozs7SUFBTyxDQUFDLFNBQWMsRUFBRSxPQUFZLEVBQVcsRUFBRTs7WUFDM0MsUUFBUSxHQUFHLEdBQUcsSUFBSSxTQUFTLElBQUksR0FBRyxJQUFJLFNBQVM7O1lBQy9DLFFBQVEsR0FBRyxHQUFHLElBQUksU0FBUyxJQUFJLEdBQUcsSUFBSSxPQUFPO1FBRWpELElBQUksQ0FBQyxRQUFRLElBQUksaUJBQWlCLElBQUksT0FBTyxTQUFTLEtBQUssU0FBUyxFQUFFO1lBQ3BFLFFBQVEsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3JGO1FBQ0QsSUFBSSxDQUFDLFFBQVEsSUFBSSxpQkFBaUIsSUFBSSxPQUFPLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDbEUsUUFBUSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDbkY7UUFFRCxPQUFPLFFBQVEsSUFBSSxRQUFRLENBQUM7SUFDOUIsQ0FBQyxFQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmV4cG9ydCBjb25zdCBBTllfU1RBVEUgPSAnKic7XG5leHBvcnQgZGVjbGFyZSB0eXBlIFRyYW5zaXRpb25NYXRjaGVyRm4gPVxuICAgIChmcm9tU3RhdGU6IGFueSwgdG9TdGF0ZTogYW55LCBlbGVtZW50OiBhbnksIHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0pID0+IGJvb2xlYW47XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRyYW5zaXRpb25FeHByKFxuICAgIHRyYW5zaXRpb25WYWx1ZTogc3RyaW5nIHwgVHJhbnNpdGlvbk1hdGNoZXJGbiwgZXJyb3JzOiBzdHJpbmdbXSk6IFRyYW5zaXRpb25NYXRjaGVyRm5bXSB7XG4gIGNvbnN0IGV4cHJlc3Npb25zOiBUcmFuc2l0aW9uTWF0Y2hlckZuW10gPSBbXTtcbiAgaWYgKHR5cGVvZiB0cmFuc2l0aW9uVmFsdWUgPT0gJ3N0cmluZycpIHtcbiAgICB0cmFuc2l0aW9uVmFsdWUuc3BsaXQoL1xccyosXFxzKi8pLmZvckVhY2goXG4gICAgICAgIHN0ciA9PiBwYXJzZUlubmVyVHJhbnNpdGlvblN0cihzdHIsIGV4cHJlc3Npb25zLCBlcnJvcnMpKTtcbiAgfSBlbHNlIHtcbiAgICBleHByZXNzaW9ucy5wdXNoKDxUcmFuc2l0aW9uTWF0Y2hlckZuPnRyYW5zaXRpb25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIGV4cHJlc3Npb25zO1xufVxuXG5mdW5jdGlvbiBwYXJzZUlubmVyVHJhbnNpdGlvblN0cihcbiAgICBldmVudFN0cjogc3RyaW5nLCBleHByZXNzaW9uczogVHJhbnNpdGlvbk1hdGNoZXJGbltdLCBlcnJvcnM6IHN0cmluZ1tdKSB7XG4gIGlmIChldmVudFN0clswXSA9PSAnOicpIHtcbiAgICBjb25zdCByZXN1bHQgPSBwYXJzZUFuaW1hdGlvbkFsaWFzKGV2ZW50U3RyLCBlcnJvcnMpO1xuICAgIGlmICh0eXBlb2YgcmVzdWx0ID09ICdmdW5jdGlvbicpIHtcbiAgICAgIGV4cHJlc3Npb25zLnB1c2gocmVzdWx0KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZXZlbnRTdHIgPSByZXN1bHQ7XG4gIH1cblxuICBjb25zdCBtYXRjaCA9IGV2ZW50U3RyLm1hdGNoKC9eKFxcKnxbLVxcd10rKVxccyooPD9bPS1dPilcXHMqKFxcKnxbLVxcd10rKSQvKTtcbiAgaWYgKG1hdGNoID09IG51bGwgfHwgbWF0Y2gubGVuZ3RoIDwgNCkge1xuICAgIGVycm9ycy5wdXNoKGBUaGUgcHJvdmlkZWQgdHJhbnNpdGlvbiBleHByZXNzaW9uIFwiJHtldmVudFN0cn1cIiBpcyBub3Qgc3VwcG9ydGVkYCk7XG4gICAgcmV0dXJuIGV4cHJlc3Npb25zO1xuICB9XG5cbiAgY29uc3QgZnJvbVN0YXRlID0gbWF0Y2hbMV07XG4gIGNvbnN0IHNlcGFyYXRvciA9IG1hdGNoWzJdO1xuICBjb25zdCB0b1N0YXRlID0gbWF0Y2hbM107XG4gIGV4cHJlc3Npb25zLnB1c2gobWFrZUxhbWJkYUZyb21TdGF0ZXMoZnJvbVN0YXRlLCB0b1N0YXRlKSk7XG5cbiAgY29uc3QgaXNGdWxsQW55U3RhdGVFeHByID0gZnJvbVN0YXRlID09IEFOWV9TVEFURSAmJiB0b1N0YXRlID09IEFOWV9TVEFURTtcbiAgaWYgKHNlcGFyYXRvclswXSA9PSAnPCcgJiYgIWlzRnVsbEFueVN0YXRlRXhwcikge1xuICAgIGV4cHJlc3Npb25zLnB1c2gobWFrZUxhbWJkYUZyb21TdGF0ZXModG9TdGF0ZSwgZnJvbVN0YXRlKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VBbmltYXRpb25BbGlhcyhhbGlhczogc3RyaW5nLCBlcnJvcnM6IHN0cmluZ1tdKTogc3RyaW5nfFRyYW5zaXRpb25NYXRjaGVyRm4ge1xuICBzd2l0Y2ggKGFsaWFzKSB7XG4gICAgY2FzZSAnOmVudGVyJzpcbiAgICAgIHJldHVybiAndm9pZCA9PiAqJztcbiAgICBjYXNlICc6bGVhdmUnOlxuICAgICAgcmV0dXJuICcqID0+IHZvaWQnO1xuICAgIGNhc2UgJzppbmNyZW1lbnQnOlxuICAgICAgcmV0dXJuIChmcm9tU3RhdGU6IGFueSwgdG9TdGF0ZTogYW55KTogYm9vbGVhbiA9PiBwYXJzZUZsb2F0KHRvU3RhdGUpID4gcGFyc2VGbG9hdChmcm9tU3RhdGUpO1xuICAgIGNhc2UgJzpkZWNyZW1lbnQnOlxuICAgICAgcmV0dXJuIChmcm9tU3RhdGU6IGFueSwgdG9TdGF0ZTogYW55KTogYm9vbGVhbiA9PiBwYXJzZUZsb2F0KHRvU3RhdGUpIDwgcGFyc2VGbG9hdChmcm9tU3RhdGUpO1xuICAgIGRlZmF1bHQ6XG4gICAgICBlcnJvcnMucHVzaChgVGhlIHRyYW5zaXRpb24gYWxpYXMgdmFsdWUgXCIke2FsaWFzfVwiIGlzIG5vdCBzdXBwb3J0ZWRgKTtcbiAgICAgIHJldHVybiAnKiA9PiAqJztcbiAgfVxufVxuXG4vLyBETyBOT1QgUkVGQUNUT1IgLi4uIGtlZXAgdGhlIGZvbGxvdyBzZXQgaW5zdGFudGlhdGlvbnNcbi8vIHdpdGggdGhlIHZhbHVlcyBpbnRhY3QgKGNsb3N1cmUgY29tcGlsZXIgZm9yIHNvbWUgcmVhc29uXG4vLyByZW1vdmVzIGZvbGxvdy11cCBsaW5lcyB0aGF0IGFkZCB0aGUgdmFsdWVzIG91dHNpZGUgb2Zcbi8vIHRoZSBjb25zdHJ1Y3Rvci4uLlxuY29uc3QgVFJVRV9CT09MRUFOX1ZBTFVFUyA9IG5ldyBTZXQ8c3RyaW5nPihbJ3RydWUnLCAnMSddKTtcbmNvbnN0IEZBTFNFX0JPT0xFQU5fVkFMVUVTID0gbmV3IFNldDxzdHJpbmc+KFsnZmFsc2UnLCAnMCddKTtcblxuZnVuY3Rpb24gbWFrZUxhbWJkYUZyb21TdGF0ZXMobGhzOiBzdHJpbmcsIHJoczogc3RyaW5nKTogVHJhbnNpdGlvbk1hdGNoZXJGbiB7XG4gIGNvbnN0IExIU19NQVRDSF9CT09MRUFOID0gVFJVRV9CT09MRUFOX1ZBTFVFUy5oYXMobGhzKSB8fCBGQUxTRV9CT09MRUFOX1ZBTFVFUy5oYXMobGhzKTtcbiAgY29uc3QgUkhTX01BVENIX0JPT0xFQU4gPSBUUlVFX0JPT0xFQU5fVkFMVUVTLmhhcyhyaHMpIHx8IEZBTFNFX0JPT0xFQU5fVkFMVUVTLmhhcyhyaHMpO1xuXG4gIHJldHVybiAoZnJvbVN0YXRlOiBhbnksIHRvU3RhdGU6IGFueSk6IGJvb2xlYW4gPT4ge1xuICAgIGxldCBsaHNNYXRjaCA9IGxocyA9PSBBTllfU1RBVEUgfHwgbGhzID09IGZyb21TdGF0ZTtcbiAgICBsZXQgcmhzTWF0Y2ggPSByaHMgPT0gQU5ZX1NUQVRFIHx8IHJocyA9PSB0b1N0YXRlO1xuXG4gICAgaWYgKCFsaHNNYXRjaCAmJiBMSFNfTUFUQ0hfQk9PTEVBTiAmJiB0eXBlb2YgZnJvbVN0YXRlID09PSAnYm9vbGVhbicpIHtcbiAgICAgIGxoc01hdGNoID0gZnJvbVN0YXRlID8gVFJVRV9CT09MRUFOX1ZBTFVFUy5oYXMobGhzKSA6IEZBTFNFX0JPT0xFQU5fVkFMVUVTLmhhcyhsaHMpO1xuICAgIH1cbiAgICBpZiAoIXJoc01hdGNoICYmIFJIU19NQVRDSF9CT09MRUFOICYmIHR5cGVvZiB0b1N0YXRlID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHJoc01hdGNoID0gdG9TdGF0ZSA/IFRSVUVfQk9PTEVBTl9WQUxVRVMuaGFzKHJocykgOiBGQUxTRV9CT09MRUFOX1ZBTFVFUy5oYXMocmhzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGhzTWF0Y2ggJiYgcmhzTWF0Y2g7XG4gIH07XG59XG4iXX0=