/**
 * @fileoverview added by tsickle
 * Generated from: packages/animations/browser/src/dsl/animation.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { ENTER_CLASSNAME, LEAVE_CLASSNAME, normalizeStyles } from '../util';
import { buildAnimationAst } from './animation_ast_builder';
import { buildAnimationTimelines } from './animation_timeline_builder';
import { ElementInstructionMap } from './element_instruction_map';
export class Animation {
    /**
     * @param {?} _driver
     * @param {?} input
     */
    constructor(_driver, input) {
        this._driver = _driver;
        /** @type {?} */
        const errors = [];
        /** @type {?} */
        const ast = buildAnimationAst(_driver, input, errors);
        if (errors.length) {
            /** @type {?} */
            const errorMessage = `animation validation failed:\n${errors.join("\n")}`;
            throw new Error(errorMessage);
        }
        this._animationAst = ast;
    }
    /**
     * @param {?} element
     * @param {?} startingStyles
     * @param {?} destinationStyles
     * @param {?} options
     * @param {?=} subInstructions
     * @return {?}
     */
    buildTimelines(element, startingStyles, destinationStyles, options, subInstructions) {
        /** @type {?} */
        const start = Array.isArray(startingStyles) ? normalizeStyles(startingStyles) :
            (/** @type {?} */ (startingStyles));
        /** @type {?} */
        const dest = Array.isArray(destinationStyles) ? normalizeStyles(destinationStyles) :
            (/** @type {?} */ (destinationStyles));
        /** @type {?} */
        const errors = [];
        subInstructions = subInstructions || new ElementInstructionMap();
        /** @type {?} */
        const result = buildAnimationTimelines(this._driver, element, this._animationAst, ENTER_CLASSNAME, LEAVE_CLASSNAME, start, dest, options, subInstructions, errors);
        if (errors.length) {
            /** @type {?} */
            const errorMessage = `animation building failed:\n${errors.join("\n")}`;
            throw new Error(errorMessage);
        }
        return result;
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    Animation.prototype._animationAst;
    /**
     * @type {?}
     * @private
     */
    Animation.prototype._driver;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9kc2wvYW5pbWF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBVUEsT0FBTyxFQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRzFFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzFELE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBRXJFLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRWhFLE1BQU0sT0FBTyxTQUFTOzs7OztJQUVwQixZQUFvQixPQUF3QixFQUFFLEtBQTRDO1FBQXRFLFlBQU8sR0FBUCxPQUFPLENBQWlCOztjQUNwQyxNQUFNLEdBQVUsRUFBRTs7Y0FDbEIsR0FBRyxHQUFHLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDO1FBQ3JELElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTs7a0JBQ1gsWUFBWSxHQUFHLGlDQUFpQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pFLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDL0I7UUFDRCxJQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQztJQUMzQixDQUFDOzs7Ozs7Ozs7SUFFRCxjQUFjLENBQ1YsT0FBWSxFQUFFLGNBQXVDLEVBQ3JELGlCQUEwQyxFQUFFLE9BQXlCLEVBQ3JFLGVBQXVDOztjQUNuQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDakMsbUJBQVksY0FBYyxFQUFBOztjQUNsRSxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLG1CQUFZLGlCQUFpQixFQUFBOztjQUN2RSxNQUFNLEdBQVEsRUFBRTtRQUN0QixlQUFlLEdBQUcsZUFBZSxJQUFJLElBQUkscUJBQXFCLEVBQUUsQ0FBQzs7Y0FDM0QsTUFBTSxHQUFHLHVCQUF1QixDQUNsQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLElBQUksRUFDeEYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLENBQUM7UUFDckMsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFOztrQkFDWCxZQUFZLEdBQUcsK0JBQStCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdkUsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUMvQjtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7Q0FDRjs7Ozs7O0lBOUJDLGtDQUFrRDs7Ozs7SUFDdEMsNEJBQWdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRpb25NZXRhZGF0YSwgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLCBBbmltYXRpb25PcHRpb25zLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuLi9yZW5kZXIvYW5pbWF0aW9uX2RyaXZlcic7XG5pbXBvcnQge0VOVEVSX0NMQVNTTkFNRSwgTEVBVkVfQ0xBU1NOQU1FLCBub3JtYWxpemVTdHlsZXN9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0FzdH0gZnJvbSAnLi9hbmltYXRpb25fYXN0JztcbmltcG9ydCB7YnVpbGRBbmltYXRpb25Bc3R9IGZyb20gJy4vYW5pbWF0aW9uX2FzdF9idWlsZGVyJztcbmltcG9ydCB7YnVpbGRBbmltYXRpb25UaW1lbGluZXN9IGZyb20gJy4vYW5pbWF0aW9uX3RpbWVsaW5lX2J1aWxkZXInO1xuaW1wb3J0IHtBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9ufSBmcm9tICcuL2FuaW1hdGlvbl90aW1lbGluZV9pbnN0cnVjdGlvbic7XG5pbXBvcnQge0VsZW1lbnRJbnN0cnVjdGlvbk1hcH0gZnJvbSAnLi9lbGVtZW50X2luc3RydWN0aW9uX21hcCc7XG5cbmV4cG9ydCBjbGFzcyBBbmltYXRpb24ge1xuICBwcml2YXRlIF9hbmltYXRpb25Bc3Q6IEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGU+O1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgaW5wdXQ6IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW10pIHtcbiAgICBjb25zdCBlcnJvcnM6IGFueVtdID0gW107XG4gICAgY29uc3QgYXN0ID0gYnVpbGRBbmltYXRpb25Bc3QoX2RyaXZlciwgaW5wdXQsIGVycm9ycyk7XG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBhbmltYXRpb24gdmFsaWRhdGlvbiBmYWlsZWQ6XFxuJHtlcnJvcnMuam9pbihcIlxcblwiKX1gO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgfVxuICAgIHRoaXMuX2FuaW1hdGlvbkFzdCA9IGFzdDtcbiAgfVxuXG4gIGJ1aWxkVGltZWxpbmVzKFxuICAgICAgZWxlbWVudDogYW55LCBzdGFydGluZ1N0eWxlczogybVTdHlsZURhdGF8ybVTdHlsZURhdGFbXSxcbiAgICAgIGRlc3RpbmF0aW9uU3R5bGVzOiDJtVN0eWxlRGF0YXzJtVN0eWxlRGF0YVtdLCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zLFxuICAgICAgc3ViSW5zdHJ1Y3Rpb25zPzogRWxlbWVudEluc3RydWN0aW9uTWFwKTogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbltdIHtcbiAgICBjb25zdCBzdGFydCA9IEFycmF5LmlzQXJyYXkoc3RhcnRpbmdTdHlsZXMpID8gbm9ybWFsaXplU3R5bGVzKHN0YXJ0aW5nU3R5bGVzKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDzJtVN0eWxlRGF0YT5zdGFydGluZ1N0eWxlcztcbiAgICBjb25zdCBkZXN0ID0gQXJyYXkuaXNBcnJheShkZXN0aW5hdGlvblN0eWxlcykgPyBub3JtYWxpemVTdHlsZXMoZGVzdGluYXRpb25TdHlsZXMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ybVTdHlsZURhdGE+ZGVzdGluYXRpb25TdHlsZXM7XG4gICAgY29uc3QgZXJyb3JzOiBhbnkgPSBbXTtcbiAgICBzdWJJbnN0cnVjdGlvbnMgPSBzdWJJbnN0cnVjdGlvbnMgfHwgbmV3IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCgpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGJ1aWxkQW5pbWF0aW9uVGltZWxpbmVzKFxuICAgICAgICB0aGlzLl9kcml2ZXIsIGVsZW1lbnQsIHRoaXMuX2FuaW1hdGlvbkFzdCwgRU5URVJfQ0xBU1NOQU1FLCBMRUFWRV9DTEFTU05BTUUsIHN0YXJ0LCBkZXN0LFxuICAgICAgICBvcHRpb25zLCBzdWJJbnN0cnVjdGlvbnMsIGVycm9ycyk7XG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBhbmltYXRpb24gYnVpbGRpbmcgZmFpbGVkOlxcbiR7ZXJyb3JzLmpvaW4oXCJcXG5cIil9YDtcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG4iXX0=