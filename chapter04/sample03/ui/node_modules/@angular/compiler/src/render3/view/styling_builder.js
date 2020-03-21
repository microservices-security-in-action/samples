(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/render3/view/styling_builder", ["require", "exports", "tslib", "@angular/compiler/src/expression_parser/ast", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/template_parser/template_parser", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/view/style_parser", "@angular/compiler/src/render3/view/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ast_1 = require("@angular/compiler/src/expression_parser/ast");
    var o = require("@angular/compiler/src/output/output_ast");
    var template_parser_1 = require("@angular/compiler/src/template_parser/template_parser");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var style_parser_1 = require("@angular/compiler/src/render3/view/style_parser");
    var util_1 = require("@angular/compiler/src/render3/view/util");
    var IMPORTANT_FLAG = '!important';
    /**
     * Minimum amount of binding slots required in the runtime for style/class bindings.
     *
     * Styling in Angular uses up two slots in the runtime LView/TData data structures to
     * record binding data, property information and metadata.
     *
     * When a binding is registered it will place the following information in the `LView`:
     *
     * slot 1) binding value
     * slot 2) cached value (all other values collected before it in string form)
     *
     * When a binding is registered it will place the following information in the `TData`:
     *
     * slot 1) prop name
     * slot 2) binding index that points to the previous style/class binding (and some extra config
     * values)
     *
     * Let's imagine we have a binding that looks like so:
     *
     * ```
     * <div [style.width]="x" [style.height]="y">
     * ```
     *
     * Our `LView` and `TData` data-structures look like so:
     *
     * ```typescript
     * LView = [
     *   // ...
     *   x, // value of x
     *   "width: x",
     *
     *   y, // value of y
     *   "width: x; height: y",
     *   // ...
     * ];
     *
     * TData = [
     *   // ...
     *   "width", // binding slot 20
     *   0,
     *
     *   "height",
     *   20,
     *   // ...
     * ];
     * ```
     *
     * */
    exports.MIN_STYLING_BINDING_SLOTS_REQUIRED = 2;
    /**
     * Produces creation/update instructions for all styling bindings (class and style)
     *
     * It also produces the creation instruction to register all initial styling values
     * (which are all the static class="..." and style="..." attribute values that exist
     * on an element within a template).
     *
     * The builder class below handles producing instructions for the following cases:
     *
     * - Static style/class attributes (style="..." and class="...")
     * - Dynamic style/class map bindings ([style]="map" and [class]="map|string")
     * - Dynamic style/class property bindings ([style.prop]="exp" and [class.name]="exp")
     *
     * Due to the complex relationship of all of these cases, the instructions generated
     * for these attributes/properties/bindings must be done so in the correct order. The
     * order which these must be generated is as follows:
     *
     * if (createMode) {
     *   styling(...)
     * }
     * if (updateMode) {
     *   styleMap(...)
     *   classMap(...)
     *   styleProp(...)
     *   classProp(...)
     * }
     *
     * The creation/update methods within the builder class produce these instructions.
     */
    var StylingBuilder = /** @class */ (function () {
        function StylingBuilder(_directiveExpr) {
            this._directiveExpr = _directiveExpr;
            /** Whether or not there are any static styling values present */
            this._hasInitialValues = false;
            /**
             *  Whether or not there are any styling bindings present
             *  (i.e. `[style]`, `[class]`, `[style.prop]` or `[class.name]`)
             */
            this.hasBindings = false;
            this.hasBindingsWithPipes = false;
            /** the input for [class] (if it exists) */
            this._classMapInput = null;
            /** the input for [style] (if it exists) */
            this._styleMapInput = null;
            /** an array of each [style.prop] input */
            this._singleStyleInputs = null;
            /** an array of each [class.name] input */
            this._singleClassInputs = null;
            this._lastStylingInput = null;
            this._firstStylingInput = null;
            // maps are used instead of hash maps because a Map will
            // retain the ordering of the keys
            /**
             * Represents the location of each style binding in the template
             * (e.g. `<div [style.width]="w" [style.height]="h">` implies
             * that `width=0` and `height=1`)
             */
            this._stylesIndex = new Map();
            /**
             * Represents the location of each class binding in the template
             * (e.g. `<div [class.big]="b" [class.hidden]="h">` implies
             * that `big=0` and `hidden=1`)
             */
            this._classesIndex = new Map();
            this._initialStyleValues = [];
            this._initialClassValues = [];
        }
        /**
         * Registers a given input to the styling builder to be later used when producing AOT code.
         *
         * The code below will only accept the input if it is somehow tied to styling (whether it be
         * style/class bindings or static style/class attributes).
         */
        StylingBuilder.prototype.registerBoundInput = function (input) {
            // [attr.style] or [attr.class] are skipped in the code below,
            // they should not be treated as styling-based bindings since
            // they are intended to be written directly to the attr and
            // will therefore skip all style/class resolution that is present
            // with style="", [style]="" and [style.prop]="", class="",
            // [class.prop]="". [class]="" assignments
            var binding = null;
            var name = input.name;
            switch (input.type) {
                case 0 /* Property */:
                    binding = this.registerInputBasedOnName(name, input.value, input.sourceSpan);
                    break;
                case 3 /* Style */:
                    binding = this.registerStyleInput(name, false, input.value, input.sourceSpan, input.unit);
                    break;
                case 2 /* Class */:
                    binding = this.registerClassInput(name, false, input.value, input.sourceSpan);
                    break;
            }
            return binding ? true : false;
        };
        StylingBuilder.prototype.registerInputBasedOnName = function (name, expression, sourceSpan) {
            var binding = null;
            var prefix = name.substring(0, 6);
            var isStyle = name === 'style' || prefix === 'style.' || prefix === 'style!';
            var isClass = !isStyle && (name === 'class' || prefix === 'class.' || prefix === 'class!');
            if (isStyle || isClass) {
                var isMapBased = name.charAt(5) !== '.'; // style.prop or class.prop makes this a no
                var property = name.substr(isMapBased ? 5 : 6); // the dot explains why there's a +1
                if (isStyle) {
                    binding = this.registerStyleInput(property, isMapBased, expression, sourceSpan);
                }
                else {
                    binding = this.registerClassInput(property, isMapBased, expression, sourceSpan);
                }
            }
            return binding;
        };
        StylingBuilder.prototype.registerStyleInput = function (name, isMapBased, value, sourceSpan, unit) {
            if (template_parser_1.isEmptyExpression(value)) {
                return null;
            }
            name = normalizePropName(name);
            var _a = parseProperty(name), property = _a.property, hasOverrideFlag = _a.hasOverrideFlag, bindingUnit = _a.unit;
            var entry = {
                name: property,
                sanitize: property ? isStyleSanitizable(property) : true,
                unit: unit || bindingUnit, value: value, sourceSpan: sourceSpan, hasOverrideFlag: hasOverrideFlag
            };
            if (isMapBased) {
                this._styleMapInput = entry;
            }
            else {
                (this._singleStyleInputs = this._singleStyleInputs || []).push(entry);
                registerIntoMap(this._stylesIndex, property);
            }
            this._lastStylingInput = entry;
            this._firstStylingInput = this._firstStylingInput || entry;
            this._checkForPipes(value);
            this.hasBindings = true;
            return entry;
        };
        StylingBuilder.prototype.registerClassInput = function (name, isMapBased, value, sourceSpan) {
            if (template_parser_1.isEmptyExpression(value)) {
                return null;
            }
            var _a = parseProperty(name), property = _a.property, hasOverrideFlag = _a.hasOverrideFlag;
            var entry = { name: property, value: value, sourceSpan: sourceSpan, sanitize: false, hasOverrideFlag: hasOverrideFlag, unit: null };
            if (isMapBased) {
                if (this._classMapInput) {
                    throw new Error('[class] and [className] bindings cannot be used on the same element simultaneously');
                }
                this._classMapInput = entry;
            }
            else {
                (this._singleClassInputs = this._singleClassInputs || []).push(entry);
                registerIntoMap(this._classesIndex, property);
            }
            this._lastStylingInput = entry;
            this._firstStylingInput = this._firstStylingInput || entry;
            this._checkForPipes(value);
            this.hasBindings = true;
            return entry;
        };
        StylingBuilder.prototype._checkForPipes = function (value) {
            if ((value instanceof ast_1.ASTWithSource) && (value.ast instanceof ast_1.BindingPipe)) {
                this.hasBindingsWithPipes = true;
            }
        };
        /**
         * Registers the element's static style string value to the builder.
         *
         * @param value the style string (e.g. `width:100px; height:200px;`)
         */
        StylingBuilder.prototype.registerStyleAttr = function (value) {
            this._initialStyleValues = style_parser_1.parse(value);
            this._hasInitialValues = true;
        };
        /**
         * Registers the element's static class string value to the builder.
         *
         * @param value the className string (e.g. `disabled gold zoom`)
         */
        StylingBuilder.prototype.registerClassAttr = function (value) {
            this._initialClassValues = value.trim().split(/\s+/g);
            this._hasInitialValues = true;
        };
        /**
         * Appends all styling-related expressions to the provided attrs array.
         *
         * @param attrs an existing array where each of the styling expressions
         * will be inserted into.
         */
        StylingBuilder.prototype.populateInitialStylingAttrs = function (attrs) {
            // [CLASS_MARKER, 'foo', 'bar', 'baz' ...]
            if (this._initialClassValues.length) {
                attrs.push(o.literal(1 /* Classes */));
                for (var i = 0; i < this._initialClassValues.length; i++) {
                    attrs.push(o.literal(this._initialClassValues[i]));
                }
            }
            // [STYLE_MARKER, 'width', '200px', 'height', '100px', ...]
            if (this._initialStyleValues.length) {
                attrs.push(o.literal(2 /* Styles */));
                for (var i = 0; i < this._initialStyleValues.length; i += 2) {
                    attrs.push(o.literal(this._initialStyleValues[i]), o.literal(this._initialStyleValues[i + 1]));
                }
            }
        };
        /**
         * Builds an instruction with all the expressions and parameters for `elementHostAttrs`.
         *
         * The instruction generation code below is used for producing the AOT statement code which is
         * responsible for registering initial styles (within a directive hostBindings' creation block),
         * as well as any of the provided attribute values, to the directive host element.
         */
        StylingBuilder.prototype.assignHostAttrs = function (attrs, definitionMap) {
            if (this._directiveExpr && (attrs.length || this._hasInitialValues)) {
                this.populateInitialStylingAttrs(attrs);
                definitionMap.set('hostAttrs', o.literalArr(attrs));
            }
        };
        /**
         * Builds an instruction with all the expressions and parameters for `classMap`.
         *
         * The instruction data will contain all expressions for `classMap` to function
         * which includes the `[class]` expression params.
         */
        StylingBuilder.prototype.buildClassMapInstruction = function (valueConverter) {
            if (this._classMapInput) {
                return this._buildMapBasedInstruction(valueConverter, true, this._classMapInput);
            }
            return null;
        };
        /**
         * Builds an instruction with all the expressions and parameters for `styleMap`.
         *
         * The instruction data will contain all expressions for `styleMap` to function
         * which includes the `[style]` expression params.
         */
        StylingBuilder.prototype.buildStyleMapInstruction = function (valueConverter) {
            if (this._styleMapInput) {
                return this._buildMapBasedInstruction(valueConverter, false, this._styleMapInput);
            }
            return null;
        };
        StylingBuilder.prototype._buildMapBasedInstruction = function (valueConverter, isClassBased, stylingInput) {
            // each styling binding value is stored in the LView
            // map-based bindings allocate two slots: one for the
            // previous binding value and another for the previous
            // className or style attribute value.
            var totalBindingSlotsRequired = exports.MIN_STYLING_BINDING_SLOTS_REQUIRED;
            // these values must be outside of the update block so that they can
            // be evaluated (the AST visit call) during creation time so that any
            // pipes can be picked up in time before the template is built
            var mapValue = stylingInput.value.visit(valueConverter);
            var reference;
            if (mapValue instanceof ast_1.Interpolation) {
                totalBindingSlotsRequired += mapValue.expressions.length;
                reference = isClassBased ? getClassMapInterpolationExpression(mapValue) :
                    getStyleMapInterpolationExpression(mapValue);
            }
            else {
                reference = isClassBased ? r3_identifiers_1.Identifiers.classMap : r3_identifiers_1.Identifiers.styleMap;
            }
            return {
                reference: reference,
                calls: [{
                        supportsInterpolation: true,
                        sourceSpan: stylingInput.sourceSpan,
                        allocateBindingSlots: totalBindingSlotsRequired,
                        params: function (convertFn) {
                            var convertResult = convertFn(mapValue);
                            var params = Array.isArray(convertResult) ? convertResult : [convertResult];
                            return params;
                        }
                    }]
            };
        };
        StylingBuilder.prototype._buildSingleInputs = function (reference, inputs, valueConverter, getInterpolationExpressionFn, isClassBased) {
            var instructions = [];
            inputs.forEach(function (input) {
                var previousInstruction = instructions[instructions.length - 1];
                var value = input.value.visit(valueConverter);
                var referenceForCall = reference;
                // each styling binding value is stored in the LView
                // but there are two values stored for each binding:
                //   1) the value itself
                //   2) an intermediate value (concatenation of style up to this point).
                //      We need to store the intermediate value so that we don't allocate
                //      the strings on each CD.
                var totalBindingSlotsRequired = exports.MIN_STYLING_BINDING_SLOTS_REQUIRED;
                if (value instanceof ast_1.Interpolation) {
                    totalBindingSlotsRequired += value.expressions.length;
                    if (getInterpolationExpressionFn) {
                        referenceForCall = getInterpolationExpressionFn(value);
                    }
                }
                var call = {
                    sourceSpan: input.sourceSpan,
                    allocateBindingSlots: totalBindingSlotsRequired,
                    supportsInterpolation: !!getInterpolationExpressionFn,
                    params: function (convertFn) {
                        // params => stylingProp(propName, value, suffix|sanitizer)
                        var params = [];
                        params.push(o.literal(input.name));
                        var convertResult = convertFn(value);
                        if (Array.isArray(convertResult)) {
                            params.push.apply(params, tslib_1.__spread(convertResult));
                        }
                        else {
                            params.push(convertResult);
                        }
                        // [style.prop] bindings may use suffix values (e.g. px, em, etc...) and they
                        // can also use a sanitizer. Sanitization occurs for url-based entries. Having
                        // the suffix value and a sanitizer together into the instruction doesn't make
                        // any sense (url-based entries cannot be sanitized).
                        if (!isClassBased) {
                            if (input.unit) {
                                params.push(o.literal(input.unit));
                            }
                            else if (input.sanitize) {
                                params.push(o.importExpr(r3_identifiers_1.Identifiers.defaultStyleSanitizer));
                            }
                        }
                        return params;
                    }
                };
                // If we ended up generating a call to the same instruction as the previous styling property
                // we can chain the calls together safely to save some bytes, otherwise we have to generate
                // a separate instruction call. This is primarily a concern with interpolation instructions
                // where we may start off with one `reference`, but end up using another based on the
                // number of interpolations.
                if (previousInstruction && previousInstruction.reference === referenceForCall) {
                    previousInstruction.calls.push(call);
                }
                else {
                    instructions.push({ reference: referenceForCall, calls: [call] });
                }
            });
            return instructions;
        };
        StylingBuilder.prototype._buildClassInputs = function (valueConverter) {
            if (this._singleClassInputs) {
                return this._buildSingleInputs(r3_identifiers_1.Identifiers.classProp, this._singleClassInputs, valueConverter, null, true);
            }
            return [];
        };
        StylingBuilder.prototype._buildStyleInputs = function (valueConverter) {
            if (this._singleStyleInputs) {
                return this._buildSingleInputs(r3_identifiers_1.Identifiers.styleProp, this._singleStyleInputs, valueConverter, getStylePropInterpolationExpression, false);
            }
            return [];
        };
        /**
         * Constructs all instructions which contain the expressions that will be placed
         * into the update block of a template function or a directive hostBindings function.
         */
        StylingBuilder.prototype.buildUpdateLevelInstructions = function (valueConverter) {
            var instructions = [];
            if (this.hasBindings) {
                var styleMapInstruction = this.buildStyleMapInstruction(valueConverter);
                if (styleMapInstruction) {
                    instructions.push(styleMapInstruction);
                }
                var classMapInstruction = this.buildClassMapInstruction(valueConverter);
                if (classMapInstruction) {
                    instructions.push(classMapInstruction);
                }
                instructions.push.apply(instructions, tslib_1.__spread(this._buildStyleInputs(valueConverter)));
                instructions.push.apply(instructions, tslib_1.__spread(this._buildClassInputs(valueConverter)));
            }
            return instructions;
        };
        return StylingBuilder;
    }());
    exports.StylingBuilder = StylingBuilder;
    function registerIntoMap(map, key) {
        if (!map.has(key)) {
            map.set(key, map.size);
        }
    }
    function isStyleSanitizable(prop) {
        // Note that browsers support both the dash case and
        // camel case property names when setting through JS.
        return prop === 'background-image' || prop === 'backgroundImage' || prop === 'background' ||
            prop === 'border-image' || prop === 'borderImage' || prop === 'border-image-source' ||
            prop === 'borderImageSource' || prop === 'filter' || prop === 'list-style' ||
            prop === 'listStyle' || prop === 'list-style-image' || prop === 'listStyleImage' ||
            prop === 'clip-path' || prop === 'clipPath';
    }
    /**
     * Simple helper function to either provide the constant literal that will house the value
     * here or a null value if the provided values are empty.
     */
    function getConstantLiteralFromArray(constantPool, values) {
        return values.length ? constantPool.getConstLiteral(o.literalArr(values), true) : o.NULL_EXPR;
    }
    function parseProperty(name) {
        var hasOverrideFlag = false;
        var overrideIndex = name.indexOf(IMPORTANT_FLAG);
        if (overrideIndex !== -1) {
            name = overrideIndex > 0 ? name.substring(0, overrideIndex) : '';
            hasOverrideFlag = true;
        }
        var unit = '';
        var property = name;
        var unitIndex = name.lastIndexOf('.');
        if (unitIndex > 0) {
            unit = name.substr(unitIndex + 1);
            property = name.substring(0, unitIndex);
        }
        return { property: property, unit: unit, hasOverrideFlag: hasOverrideFlag };
    }
    exports.parseProperty = parseProperty;
    /**
     * Gets the instruction to generate for an interpolated class map.
     * @param interpolation An Interpolation AST
     */
    function getClassMapInterpolationExpression(interpolation) {
        switch (util_1.getInterpolationArgsLength(interpolation)) {
            case 1:
                return r3_identifiers_1.Identifiers.classMap;
            case 3:
                return r3_identifiers_1.Identifiers.classMapInterpolate1;
            case 5:
                return r3_identifiers_1.Identifiers.classMapInterpolate2;
            case 7:
                return r3_identifiers_1.Identifiers.classMapInterpolate3;
            case 9:
                return r3_identifiers_1.Identifiers.classMapInterpolate4;
            case 11:
                return r3_identifiers_1.Identifiers.classMapInterpolate5;
            case 13:
                return r3_identifiers_1.Identifiers.classMapInterpolate6;
            case 15:
                return r3_identifiers_1.Identifiers.classMapInterpolate7;
            case 17:
                return r3_identifiers_1.Identifiers.classMapInterpolate8;
            default:
                return r3_identifiers_1.Identifiers.classMapInterpolateV;
        }
    }
    /**
     * Gets the instruction to generate for an interpolated style map.
     * @param interpolation An Interpolation AST
     */
    function getStyleMapInterpolationExpression(interpolation) {
        switch (util_1.getInterpolationArgsLength(interpolation)) {
            case 1:
                return r3_identifiers_1.Identifiers.styleMap;
            case 3:
                return r3_identifiers_1.Identifiers.styleMapInterpolate1;
            case 5:
                return r3_identifiers_1.Identifiers.styleMapInterpolate2;
            case 7:
                return r3_identifiers_1.Identifiers.styleMapInterpolate3;
            case 9:
                return r3_identifiers_1.Identifiers.styleMapInterpolate4;
            case 11:
                return r3_identifiers_1.Identifiers.styleMapInterpolate5;
            case 13:
                return r3_identifiers_1.Identifiers.styleMapInterpolate6;
            case 15:
                return r3_identifiers_1.Identifiers.styleMapInterpolate7;
            case 17:
                return r3_identifiers_1.Identifiers.styleMapInterpolate8;
            default:
                return r3_identifiers_1.Identifiers.styleMapInterpolateV;
        }
    }
    /**
     * Gets the instruction to generate for an interpolated style prop.
     * @param interpolation An Interpolation AST
     */
    function getStylePropInterpolationExpression(interpolation) {
        switch (util_1.getInterpolationArgsLength(interpolation)) {
            case 1:
                return r3_identifiers_1.Identifiers.styleProp;
            case 3:
                return r3_identifiers_1.Identifiers.stylePropInterpolate1;
            case 5:
                return r3_identifiers_1.Identifiers.stylePropInterpolate2;
            case 7:
                return r3_identifiers_1.Identifiers.stylePropInterpolate3;
            case 9:
                return r3_identifiers_1.Identifiers.stylePropInterpolate4;
            case 11:
                return r3_identifiers_1.Identifiers.stylePropInterpolate5;
            case 13:
                return r3_identifiers_1.Identifiers.stylePropInterpolate6;
            case 15:
                return r3_identifiers_1.Identifiers.stylePropInterpolate7;
            case 17:
                return r3_identifiers_1.Identifiers.stylePropInterpolate8;
            default:
                return r3_identifiers_1.Identifiers.stylePropInterpolateV;
        }
    }
    function normalizePropName(prop) {
        return style_parser_1.hyphenate(prop);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZ19idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvdmlldy9zdHlsaW5nX2J1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBU0EsbUVBQXdHO0lBQ3hHLDJEQUE2QztJQUU3Qyx5RkFBd0U7SUFFeEUsK0VBQW9EO0lBRXBELGdGQUE4RDtJQUU5RCxnRUFBaUU7SUFFakUsSUFBTSxjQUFjLEdBQUcsWUFBWSxDQUFDO0lBRXBDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQStDSztJQUNRLFFBQUEsa0NBQWtDLEdBQUcsQ0FBQyxDQUFDO0lBOEJwRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQTRCRztJQUNIO1FBd0NFLHdCQUFvQixjQUFpQztZQUFqQyxtQkFBYyxHQUFkLGNBQWMsQ0FBbUI7WUF2Q3JELGlFQUFpRTtZQUN6RCxzQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFDbEM7OztlQUdHO1lBQ0ksZ0JBQVcsR0FBRyxLQUFLLENBQUM7WUFDcEIseUJBQW9CLEdBQUcsS0FBSyxDQUFDO1lBRXBDLDJDQUEyQztZQUNuQyxtQkFBYyxHQUEyQixJQUFJLENBQUM7WUFDdEQsMkNBQTJDO1lBQ25DLG1CQUFjLEdBQTJCLElBQUksQ0FBQztZQUN0RCwwQ0FBMEM7WUFDbEMsdUJBQWtCLEdBQTZCLElBQUksQ0FBQztZQUM1RCwwQ0FBMEM7WUFDbEMsdUJBQWtCLEdBQTZCLElBQUksQ0FBQztZQUNwRCxzQkFBaUIsR0FBMkIsSUFBSSxDQUFDO1lBQ2pELHVCQUFrQixHQUEyQixJQUFJLENBQUM7WUFFMUQsd0RBQXdEO1lBQ3hELGtDQUFrQztZQUVsQzs7OztlQUlHO1lBQ0ssaUJBQVksR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztZQUVqRDs7OztlQUlHO1lB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QyxLQUFLLENBQUM7Z0JBQ0osT0FBTyw0QkFBRSxDQUFDLHFCQUFxQixDQUFDO1lBQ2xDLEtBQUssQ0FBQztnQkFDSixPQUFPLDRCQUFFLENBQUMscUJBQXFCLENBQUM7WUFDbEMsS0FBSyxFQUFFO2dCQUNMLE9BQU8sNEJBQUUsQ0FBQyxxQkFBcUIsQ0FBQztZQUNsQyxLQUFLLEVBQUU7Z0JBQ0wsT0FBTyw0QkFBRSxDQUFDLHFCQUFxQixDQUFDO1lBQ2xDLEtBQUssRUFBRTtnQkFDTCxPQUFPLDRCQUFFLENBQUMscUJBQXFCLENBQUM7WUFDbEMsS0FBSyxFQUFFO2dCQUNMLE9BQU8sNEJBQUUsQ0FBQyxxQkFBcUIsQ0FBQztZQUNsQztnQkFDRSxPQUFPLDRCQUFFLENBQUMscUJBQXFCLENBQUM7U0FDbkM7SUFDSCxDQUFDO0lBRUQsU0FBUyxpQkFBaUIsQ0FBQyxJQUFZO1FBQ3JDLE9BQU8sd0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtDb25zdGFudFBvb2x9IGZyb20gJy4uLy4uL2NvbnN0YW50X3Bvb2wnO1xuaW1wb3J0IHtBdHRyaWJ1dGVNYXJrZXJ9IGZyb20gJy4uLy4uL2NvcmUnO1xuaW1wb3J0IHtBU1QsIEFTVFdpdGhTb3VyY2UsIEJpbmRpbmdQaXBlLCBCaW5kaW5nVHlwZSwgSW50ZXJwb2xhdGlvbn0gZnJvbSAnLi4vLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uLy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtpc0VtcHR5RXhwcmVzc2lvbn0gZnJvbSAnLi4vLi4vdGVtcGxhdGVfcGFyc2VyL3RlbXBsYXRlX3BhcnNlcic7XG5pbXBvcnQgKiBhcyB0IGZyb20gJy4uL3IzX2FzdCc7XG5pbXBvcnQge0lkZW50aWZpZXJzIGFzIFIzfSBmcm9tICcuLi9yM19pZGVudGlmaWVycyc7XG5cbmltcG9ydCB7aHlwaGVuYXRlLCBwYXJzZSBhcyBwYXJzZVN0eWxlfSBmcm9tICcuL3N0eWxlX3BhcnNlcic7XG5pbXBvcnQge1ZhbHVlQ29udmVydGVyfSBmcm9tICcuL3RlbXBsYXRlJztcbmltcG9ydCB7RGVmaW5pdGlvbk1hcCwgZ2V0SW50ZXJwb2xhdGlvbkFyZ3NMZW5ndGh9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IElNUE9SVEFOVF9GTEFHID0gJyFpbXBvcnRhbnQnO1xuXG4vKipcbiAqIE1pbmltdW0gYW1vdW50IG9mIGJpbmRpbmcgc2xvdHMgcmVxdWlyZWQgaW4gdGhlIHJ1bnRpbWUgZm9yIHN0eWxlL2NsYXNzIGJpbmRpbmdzLlxuICpcbiAqIFN0eWxpbmcgaW4gQW5ndWxhciB1c2VzIHVwIHR3byBzbG90cyBpbiB0aGUgcnVudGltZSBMVmlldy9URGF0YSBkYXRhIHN0cnVjdHVyZXMgdG9cbiAqIHJlY29yZCBiaW5kaW5nIGRhdGEsIHByb3BlcnR5IGluZm9ybWF0aW9uIGFuZCBtZXRhZGF0YS5cbiAqXG4gKiBXaGVuIGEgYmluZGluZyBpcyByZWdpc3RlcmVkIGl0IHdpbGwgcGxhY2UgdGhlIGZvbGxvd2luZyBpbmZvcm1hdGlvbiBpbiB0aGUgYExWaWV3YDpcbiAqXG4gKiBzbG90IDEpIGJpbmRpbmcgdmFsdWVcbiAqIHNsb3QgMikgY2FjaGVkIHZhbHVlIChhbGwgb3RoZXIgdmFsdWVzIGNvbGxlY3RlZCBiZWZvcmUgaXQgaW4gc3RyaW5nIGZvcm0pXG4gKlxuICogV2hlbiBhIGJpbmRpbmcgaXMgcmVnaXN0ZXJlZCBpdCB3aWxsIHBsYWNlIHRoZSBmb2xsb3dpbmcgaW5mb3JtYXRpb24gaW4gdGhlIGBURGF0YWA6XG4gKlxuICogc2xvdCAxKSBwcm9wIG5hbWVcbiAqIHNsb3QgMikgYmluZGluZyBpbmRleCB0aGF0IHBvaW50cyB0byB0aGUgcHJldmlvdXMgc3R5bGUvY2xhc3MgYmluZGluZyAoYW5kIHNvbWUgZXh0cmEgY29uZmlnXG4gKiB2YWx1ZXMpXG4gKlxuICogTGV0J3MgaW1hZ2luZSB3ZSBoYXZlIGEgYmluZGluZyB0aGF0IGxvb2tzIGxpa2Ugc286XG4gKlxuICogYGBgXG4gKiA8ZGl2IFtzdHlsZS53aWR0aF09XCJ4XCIgW3N0eWxlLmhlaWdodF09XCJ5XCI+XG4gKiBgYGBcbiAqXG4gKiBPdXIgYExWaWV3YCBhbmQgYFREYXRhYCBkYXRhLXN0cnVjdHVyZXMgbG9vayBsaWtlIHNvOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIExWaWV3ID0gW1xuICogICAvLyAuLi5cbiAqICAgeCwgLy8gdmFsdWUgb2YgeFxuICogICBcIndpZHRoOiB4XCIsXG4gKlxuICogICB5LCAvLyB2YWx1ZSBvZiB5XG4gKiAgIFwid2lkdGg6IHg7IGhlaWdodDogeVwiLFxuICogICAvLyAuLi5cbiAqIF07XG4gKlxuICogVERhdGEgPSBbXG4gKiAgIC8vIC4uLlxuICogICBcIndpZHRoXCIsIC8vIGJpbmRpbmcgc2xvdCAyMFxuICogICAwLFxuICpcbiAqICAgXCJoZWlnaHRcIixcbiAqICAgMjAsXG4gKiAgIC8vIC4uLlxuICogXTtcbiAqIGBgYFxuICpcbiAqICovXG5leHBvcnQgY29uc3QgTUlOX1NUWUxJTkdfQklORElOR19TTE9UU19SRVFVSVJFRCA9IDI7XG5cbi8qKlxuICogQSBzdHlsaW5nIGV4cHJlc3Npb24gc3VtbWFyeSB0aGF0IGlzIHRvIGJlIHByb2Nlc3NlZCBieSB0aGUgY29tcGlsZXJcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdHlsaW5nSW5zdHJ1Y3Rpb24ge1xuICByZWZlcmVuY2U6IG8uRXh0ZXJuYWxSZWZlcmVuY2U7XG4gIC8qKiBDYWxscyB0byBpbmRpdmlkdWFsIHN0eWxpbmcgaW5zdHJ1Y3Rpb25zLiBVc2VkIHdoZW4gY2hhaW5pbmcgY2FsbHMgdG8gdGhlIHNhbWUgaW5zdHJ1Y3Rpb24uICovXG4gIGNhbGxzOiBTdHlsaW5nSW5zdHJ1Y3Rpb25DYWxsW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3R5bGluZ0luc3RydWN0aW9uQ2FsbCB7XG4gIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsO1xuICBzdXBwb3J0c0ludGVycG9sYXRpb246IGJvb2xlYW47XG4gIGFsbG9jYXRlQmluZGluZ1Nsb3RzOiBudW1iZXI7XG4gIHBhcmFtczogKChjb252ZXJ0Rm46ICh2YWx1ZTogYW55KSA9PiBvLkV4cHJlc3Npb24gfCBvLkV4cHJlc3Npb25bXSkgPT4gby5FeHByZXNzaW9uW10pO1xufVxuXG4vKipcbiAqIEFuIGludGVybmFsIHJlY29yZCBvZiB0aGUgaW5wdXQgZGF0YSBmb3IgYSBzdHlsaW5nIGJpbmRpbmdcbiAqL1xuaW50ZXJmYWNlIEJvdW5kU3R5bGluZ0VudHJ5IHtcbiAgaGFzT3ZlcnJpZGVGbGFnOiBib29sZWFuO1xuICBuYW1lOiBzdHJpbmd8bnVsbDtcbiAgdW5pdDogc3RyaW5nfG51bGw7XG4gIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbjtcbiAgc2FuaXRpemU6IGJvb2xlYW47XG4gIHZhbHVlOiBBU1Q7XG59XG5cbi8qKlxuICogUHJvZHVjZXMgY3JlYXRpb24vdXBkYXRlIGluc3RydWN0aW9ucyBmb3IgYWxsIHN0eWxpbmcgYmluZGluZ3MgKGNsYXNzIGFuZCBzdHlsZSlcbiAqXG4gKiBJdCBhbHNvIHByb2R1Y2VzIHRoZSBjcmVhdGlvbiBpbnN0cnVjdGlvbiB0byByZWdpc3RlciBhbGwgaW5pdGlhbCBzdHlsaW5nIHZhbHVlc1xuICogKHdoaWNoIGFyZSBhbGwgdGhlIHN0YXRpYyBjbGFzcz1cIi4uLlwiIGFuZCBzdHlsZT1cIi4uLlwiIGF0dHJpYnV0ZSB2YWx1ZXMgdGhhdCBleGlzdFxuICogb24gYW4gZWxlbWVudCB3aXRoaW4gYSB0ZW1wbGF0ZSkuXG4gKlxuICogVGhlIGJ1aWxkZXIgY2xhc3MgYmVsb3cgaGFuZGxlcyBwcm9kdWNpbmcgaW5zdHJ1Y3Rpb25zIGZvciB0aGUgZm9sbG93aW5nIGNhc2VzOlxuICpcbiAqIC0gU3RhdGljIHN0eWxlL2NsYXNzIGF0dHJpYnV0ZXMgKHN0eWxlPVwiLi4uXCIgYW5kIGNsYXNzPVwiLi4uXCIpXG4gKiAtIER5bmFtaWMgc3R5bGUvY2xhc3MgbWFwIGJpbmRpbmdzIChbc3R5bGVdPVwibWFwXCIgYW5kIFtjbGFzc109XCJtYXB8c3RyaW5nXCIpXG4gKiAtIER5bmFtaWMgc3R5bGUvY2xhc3MgcHJvcGVydHkgYmluZGluZ3MgKFtzdHlsZS5wcm9wXT1cImV4cFwiIGFuZCBbY2xhc3MubmFtZV09XCJleHBcIilcbiAqXG4gKiBEdWUgdG8gdGhlIGNvbXBsZXggcmVsYXRpb25zaGlwIG9mIGFsbCBvZiB0aGVzZSBjYXNlcywgdGhlIGluc3RydWN0aW9ucyBnZW5lcmF0ZWRcbiAqIGZvciB0aGVzZSBhdHRyaWJ1dGVzL3Byb3BlcnRpZXMvYmluZGluZ3MgbXVzdCBiZSBkb25lIHNvIGluIHRoZSBjb3JyZWN0IG9yZGVyLiBUaGVcbiAqIG9yZGVyIHdoaWNoIHRoZXNlIG11c3QgYmUgZ2VuZXJhdGVkIGlzIGFzIGZvbGxvd3M6XG4gKlxuICogaWYgKGNyZWF0ZU1vZGUpIHtcbiAqICAgc3R5bGluZyguLi4pXG4gKiB9XG4gKiBpZiAodXBkYXRlTW9kZSkge1xuICogICBzdHlsZU1hcCguLi4pXG4gKiAgIGNsYXNzTWFwKC4uLilcbiAqICAgc3R5bGVQcm9wKC4uLilcbiAqICAgY2xhc3NQcm9wKC4uLilcbiAqIH1cbiAqXG4gKiBUaGUgY3JlYXRpb24vdXBkYXRlIG1ldGhvZHMgd2l0aGluIHRoZSBidWlsZGVyIGNsYXNzIHByb2R1Y2UgdGhlc2UgaW5zdHJ1Y3Rpb25zLlxuICovXG5leHBvcnQgY2xhc3MgU3R5bGluZ0J1aWxkZXIge1xuICAvKiogV2hldGhlciBvciBub3QgdGhlcmUgYXJlIGFueSBzdGF0aWMgc3R5bGluZyB2YWx1ZXMgcHJlc2VudCAqL1xuICBwcml2YXRlIF9oYXNJbml0aWFsVmFsdWVzID0gZmFsc2U7XG4gIC8qKlxuICAgKiAgV2hldGhlciBvciBub3QgdGhlcmUgYXJlIGFueSBzdHlsaW5nIGJpbmRpbmdzIHByZXNlbnRcbiAgICogIChpLmUuIGBbc3R5bGVdYCwgYFtjbGFzc11gLCBgW3N0eWxlLnByb3BdYCBvciBgW2NsYXNzLm5hbWVdYClcbiAgICovXG4gIHB1YmxpYyBoYXNCaW5kaW5ncyA9IGZhbHNlO1xuICBwdWJsaWMgaGFzQmluZGluZ3NXaXRoUGlwZXMgPSBmYWxzZTtcblxuICAvKiogdGhlIGlucHV0IGZvciBbY2xhc3NdIChpZiBpdCBleGlzdHMpICovXG4gIHByaXZhdGUgX2NsYXNzTWFwSW5wdXQ6IEJvdW5kU3R5bGluZ0VudHJ5fG51bGwgPSBudWxsO1xuICAvKiogdGhlIGlucHV0IGZvciBbc3R5bGVdIChpZiBpdCBleGlzdHMpICovXG4gIHByaXZhdGUgX3N0eWxlTWFwSW5wdXQ6IEJvdW5kU3R5bGluZ0VudHJ5fG51bGwgPSBudWxsO1xuICAvKiogYW4gYXJyYXkgb2YgZWFjaCBbc3R5bGUucHJvcF0gaW5wdXQgKi9cbiAgcHJpdmF0ZSBfc2luZ2xlU3R5bGVJbnB1dHM6IEJvdW5kU3R5bGluZ0VudHJ5W118bnVsbCA9IG51bGw7XG4gIC8qKiBhbiBhcnJheSBvZiBlYWNoIFtjbGFzcy5uYW1lXSBpbnB1dCAqL1xuICBwcml2YXRlIF9zaW5nbGVDbGFzc0lucHV0czogQm91bmRTdHlsaW5nRW50cnlbXXxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfbGFzdFN0eWxpbmdJbnB1dDogQm91bmRTdHlsaW5nRW50cnl8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2ZpcnN0U3R5bGluZ0lucHV0OiBCb3VuZFN0eWxpbmdFbnRyeXxudWxsID0gbnVsbDtcblxuICAvLyBtYXBzIGFyZSB1c2VkIGluc3RlYWQgb2YgaGFzaCBtYXBzIGJlY2F1c2UgYSBNYXAgd2lsbFxuICAvLyByZXRhaW4gdGhlIG9yZGVyaW5nIG9mIHRoZSBrZXlzXG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgdGhlIGxvY2F0aW9uIG9mIGVhY2ggc3R5bGUgYmluZGluZyBpbiB0aGUgdGVtcGxhdGVcbiAgICogKGUuZy4gYDxkaXYgW3N0eWxlLndpZHRoXT1cIndcIiBbc3R5bGUuaGVpZ2h0XT1cImhcIj5gIGltcGxpZXNcbiAgICogdGhhdCBgd2lkdGg9MGAgYW5kIGBoZWlnaHQ9MWApXG4gICAqL1xuICBwcml2YXRlIF9zdHlsZXNJbmRleCA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgdGhlIGxvY2F0aW9uIG9mIGVhY2ggY2xhc3MgYmluZGluZyBpbiB0aGUgdGVtcGxhdGVcbiAgICogKGUuZy4gYDxkaXYgW2NsYXNzLmJpZ109XCJiXCIgW2NsYXNzLmhpZGRlbl09XCJoXCI+YCBpbXBsaWVzXG4gICAqIHRoYXQgYGJpZz0wYCBhbmQgYGhpZGRlbj0xYClcbiAgICovXG4gIHByaXZhdGUgX2NsYXNzZXNJbmRleCA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG4gIHByaXZhdGUgX2luaXRpYWxTdHlsZVZhbHVlczogc3RyaW5nW10gPSBbXTtcbiAgcHJpdmF0ZSBfaW5pdGlhbENsYXNzVmFsdWVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2RpcmVjdGl2ZUV4cHI6IG8uRXhwcmVzc2lvbnxudWxsKSB7fVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBnaXZlbiBpbnB1dCB0byB0aGUgc3R5bGluZyBidWlsZGVyIHRvIGJlIGxhdGVyIHVzZWQgd2hlbiBwcm9kdWNpbmcgQU9UIGNvZGUuXG4gICAqXG4gICAqIFRoZSBjb2RlIGJlbG93IHdpbGwgb25seSBhY2NlcHQgdGhlIGlucHV0IGlmIGl0IGlzIHNvbWVob3cgdGllZCB0byBzdHlsaW5nICh3aGV0aGVyIGl0IGJlXG4gICAqIHN0eWxlL2NsYXNzIGJpbmRpbmdzIG9yIHN0YXRpYyBzdHlsZS9jbGFzcyBhdHRyaWJ1dGVzKS5cbiAgICovXG4gIHJlZ2lzdGVyQm91bmRJbnB1dChpbnB1dDogdC5Cb3VuZEF0dHJpYnV0ZSk6IGJvb2xlYW4ge1xuICAgIC8vIFthdHRyLnN0eWxlXSBvciBbYXR0ci5jbGFzc10gYXJlIHNraXBwZWQgaW4gdGhlIGNvZGUgYmVsb3csXG4gICAgLy8gdGhleSBzaG91bGQgbm90IGJlIHRyZWF0ZWQgYXMgc3R5bGluZy1iYXNlZCBiaW5kaW5ncyBzaW5jZVxuICAgIC8vIHRoZXkgYXJlIGludGVuZGVkIHRvIGJlIHdyaXR0ZW4gZGlyZWN0bHkgdG8gdGhlIGF0dHIgYW5kXG4gICAgLy8gd2lsbCB0aGVyZWZvcmUgc2tpcCBhbGwgc3R5bGUvY2xhc3MgcmVzb2x1dGlvbiB0aGF0IGlzIHByZXNlbnRcbiAgICAvLyB3aXRoIHN0eWxlPVwiXCIsIFtzdHlsZV09XCJcIiBhbmQgW3N0eWxlLnByb3BdPVwiXCIsIGNsYXNzPVwiXCIsXG4gICAgLy8gW2NsYXNzLnByb3BdPVwiXCIuIFtjbGFzc109XCJcIiBhc3NpZ25tZW50c1xuICAgIGxldCBiaW5kaW5nOiBCb3VuZFN0eWxpbmdFbnRyeXxudWxsID0gbnVsbDtcbiAgICBsZXQgbmFtZSA9IGlucHV0Lm5hbWU7XG4gICAgc3dpdGNoIChpbnB1dC50eXBlKSB7XG4gICAgICBjYXNlIEJpbmRpbmdUeXBlLlByb3BlcnR5OlxuICAgICAgICBiaW5kaW5nID0gdGhpcy5yZWdpc3RlcklucHV0QmFzZWRPbk5hbWUobmFtZSwgaW5wdXQudmFsdWUsIGlucHV0LnNvdXJjZVNwYW4pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluZGluZ1R5cGUuU3R5bGU6XG4gICAgICAgIGJpbmRpbmcgPSB0aGlzLnJlZ2lzdGVyU3R5bGVJbnB1dChuYW1lLCBmYWxzZSwgaW5wdXQudmFsdWUsIGlucHV0LnNvdXJjZVNwYW4sIGlucHV0LnVuaXQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluZGluZ1R5cGUuQ2xhc3M6XG4gICAgICAgIGJpbmRpbmcgPSB0aGlzLnJlZ2lzdGVyQ2xhc3NJbnB1dChuYW1lLCBmYWxzZSwgaW5wdXQudmFsdWUsIGlucHV0LnNvdXJjZVNwYW4pO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIGJpbmRpbmcgPyB0cnVlIDogZmFsc2U7XG4gIH1cblxuICByZWdpc3RlcklucHV0QmFzZWRPbk5hbWUobmFtZTogc3RyaW5nLCBleHByZXNzaW9uOiBBU1QsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge1xuICAgIGxldCBiaW5kaW5nOiBCb3VuZFN0eWxpbmdFbnRyeXxudWxsID0gbnVsbDtcbiAgICBjb25zdCBwcmVmaXggPSBuYW1lLnN1YnN0cmluZygwLCA2KTtcbiAgICBjb25zdCBpc1N0eWxlID0gbmFtZSA9PT0gJ3N0eWxlJyB8fCBwcmVmaXggPT09ICdzdHlsZS4nIHx8IHByZWZpeCA9PT0gJ3N0eWxlISc7XG4gICAgY29uc3QgaXNDbGFzcyA9ICFpc1N0eWxlICYmIChuYW1lID09PSAnY2xhc3MnIHx8IHByZWZpeCA9PT0gJ2NsYXNzLicgfHwgcHJlZml4ID09PSAnY2xhc3MhJyk7XG4gICAgaWYgKGlzU3R5bGUgfHwgaXNDbGFzcykge1xuICAgICAgY29uc3QgaXNNYXBCYXNlZCA9IG5hbWUuY2hhckF0KDUpICE9PSAnLic7ICAgICAgICAgLy8gc3R5bGUucHJvcCBvciBjbGFzcy5wcm9wIG1ha2VzIHRoaXMgYSBub1xuICAgICAgY29uc3QgcHJvcGVydHkgPSBuYW1lLnN1YnN0cihpc01hcEJhc2VkID8gNSA6IDYpOyAgLy8gdGhlIGRvdCBleHBsYWlucyB3aHkgdGhlcmUncyBhICsxXG4gICAgICBpZiAoaXNTdHlsZSkge1xuICAgICAgICBiaW5kaW5nID0gdGhpcy5yZWdpc3RlclN0eWxlSW5wdXQocHJvcGVydHksIGlzTWFwQmFzZWQsIGV4cHJlc3Npb24sIHNvdXJjZVNwYW4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYmluZGluZyA9IHRoaXMucmVnaXN0ZXJDbGFzc0lucHV0KHByb3BlcnR5LCBpc01hcEJhc2VkLCBleHByZXNzaW9uLCBzb3VyY2VTcGFuKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJpbmRpbmc7XG4gIH1cblxuICByZWdpc3RlclN0eWxlSW5wdXQoXG4gICAgICBuYW1lOiBzdHJpbmcsIGlzTWFwQmFzZWQ6IGJvb2xlYW4sIHZhbHVlOiBBU1QsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHVuaXQ/OiBzdHJpbmd8bnVsbCk6IEJvdW5kU3R5bGluZ0VudHJ5fG51bGwge1xuICAgIGlmIChpc0VtcHR5RXhwcmVzc2lvbih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBuYW1lID0gbm9ybWFsaXplUHJvcE5hbWUobmFtZSk7XG4gICAgY29uc3Qge3Byb3BlcnR5LCBoYXNPdmVycmlkZUZsYWcsIHVuaXQ6IGJpbmRpbmdVbml0fSA9IHBhcnNlUHJvcGVydHkobmFtZSk7XG4gICAgY29uc3QgZW50cnk6IEJvdW5kU3R5bGluZ0VudHJ5ID0ge1xuICAgICAgbmFtZTogcHJvcGVydHksXG4gICAgICBzYW5pdGl6ZTogcHJvcGVydHkgPyBpc1N0eWxlU2FuaXRpemFibGUocHJvcGVydHkpIDogdHJ1ZSxcbiAgICAgIHVuaXQ6IHVuaXQgfHwgYmluZGluZ1VuaXQsIHZhbHVlLCBzb3VyY2VTcGFuLCBoYXNPdmVycmlkZUZsYWdcbiAgICB9O1xuICAgIGlmIChpc01hcEJhc2VkKSB7XG4gICAgICB0aGlzLl9zdHlsZU1hcElucHV0ID0gZW50cnk7XG4gICAgfSBlbHNlIHtcbiAgICAgICh0aGlzLl9zaW5nbGVTdHlsZUlucHV0cyA9IHRoaXMuX3NpbmdsZVN0eWxlSW5wdXRzIHx8IFtdKS5wdXNoKGVudHJ5KTtcbiAgICAgIHJlZ2lzdGVySW50b01hcCh0aGlzLl9zdHlsZXNJbmRleCwgcHJvcGVydHkpO1xuICAgIH1cbiAgICB0aGlzLl9sYXN0U3R5bGluZ0lucHV0ID0gZW50cnk7XG4gICAgdGhpcy5fZmlyc3RTdHlsaW5nSW5wdXQgPSB0aGlzLl9maXJzdFN0eWxpbmdJbnB1dCB8fCBlbnRyeTtcbiAgICB0aGlzLl9jaGVja0ZvclBpcGVzKHZhbHVlKTtcbiAgICB0aGlzLmhhc0JpbmRpbmdzID0gdHJ1ZTtcbiAgICByZXR1cm4gZW50cnk7XG4gIH1cblxuICByZWdpc3RlckNsYXNzSW5wdXQobmFtZTogc3RyaW5nLCBpc01hcEJhc2VkOiBib29sZWFuLCB2YWx1ZTogQVNULCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOlxuICAgICAgQm91bmRTdHlsaW5nRW50cnl8bnVsbCB7XG4gICAgaWYgKGlzRW1wdHlFeHByZXNzaW9uKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHtwcm9wZXJ0eSwgaGFzT3ZlcnJpZGVGbGFnfSA9IHBhcnNlUHJvcGVydHkobmFtZSk7XG4gICAgY29uc3QgZW50cnk6IEJvdW5kU3R5bGluZ0VudHJ5ID1cbiAgICAgICAge25hbWU6IHByb3BlcnR5LCB2YWx1ZSwgc291cmNlU3Bhbiwgc2FuaXRpemU6IGZhbHNlLCBoYXNPdmVycmlkZUZsYWcsIHVuaXQ6IG51bGx9O1xuICAgIGlmIChpc01hcEJhc2VkKSB7XG4gICAgICBpZiAodGhpcy5fY2xhc3NNYXBJbnB1dCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnW2NsYXNzXSBhbmQgW2NsYXNzTmFtZV0gYmluZGluZ3MgY2Fubm90IGJlIHVzZWQgb24gdGhlIHNhbWUgZWxlbWVudCBzaW11bHRhbmVvdXNseScpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY2xhc3NNYXBJbnB1dCA9IGVudHJ5O1xuICAgIH0gZWxzZSB7XG4gICAgICAodGhpcy5fc2luZ2xlQ2xhc3NJbnB1dHMgPSB0aGlzLl9zaW5nbGVDbGFzc0lucHV0cyB8fCBbXSkucHVzaChlbnRyeSk7XG4gICAgICByZWdpc3RlckludG9NYXAodGhpcy5fY2xhc3Nlc0luZGV4LCBwcm9wZXJ0eSk7XG4gICAgfVxuICAgIHRoaXMuX2xhc3RTdHlsaW5nSW5wdXQgPSBlbnRyeTtcbiAgICB0aGlzLl9maXJzdFN0eWxpbmdJbnB1dCA9IHRoaXMuX2ZpcnN0U3R5bGluZ0lucHV0IHx8IGVudHJ5O1xuICAgIHRoaXMuX2NoZWNrRm9yUGlwZXModmFsdWUpO1xuICAgIHRoaXMuaGFzQmluZGluZ3MgPSB0cnVlO1xuICAgIHJldHVybiBlbnRyeTtcbiAgfVxuXG4gIHByaXZhdGUgX2NoZWNrRm9yUGlwZXModmFsdWU6IEFTVCkge1xuICAgIGlmICgodmFsdWUgaW5zdGFuY2VvZiBBU1RXaXRoU291cmNlKSAmJiAodmFsdWUuYXN0IGluc3RhbmNlb2YgQmluZGluZ1BpcGUpKSB7XG4gICAgICB0aGlzLmhhc0JpbmRpbmdzV2l0aFBpcGVzID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIHRoZSBlbGVtZW50J3Mgc3RhdGljIHN0eWxlIHN0cmluZyB2YWx1ZSB0byB0aGUgYnVpbGRlci5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIHRoZSBzdHlsZSBzdHJpbmcgKGUuZy4gYHdpZHRoOjEwMHB4OyBoZWlnaHQ6MjAwcHg7YClcbiAgICovXG4gIHJlZ2lzdGVyU3R5bGVBdHRyKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9pbml0aWFsU3R5bGVWYWx1ZXMgPSBwYXJzZVN0eWxlKHZhbHVlKTtcbiAgICB0aGlzLl9oYXNJbml0aWFsVmFsdWVzID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdGhlIGVsZW1lbnQncyBzdGF0aWMgY2xhc3Mgc3RyaW5nIHZhbHVlIHRvIHRoZSBidWlsZGVyLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgdGhlIGNsYXNzTmFtZSBzdHJpbmcgKGUuZy4gYGRpc2FibGVkIGdvbGQgem9vbWApXG4gICAqL1xuICByZWdpc3RlckNsYXNzQXR0cih2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5faW5pdGlhbENsYXNzVmFsdWVzID0gdmFsdWUudHJpbSgpLnNwbGl0KC9cXHMrL2cpO1xuICAgIHRoaXMuX2hhc0luaXRpYWxWYWx1ZXMgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGVuZHMgYWxsIHN0eWxpbmctcmVsYXRlZCBleHByZXNzaW9ucyB0byB0aGUgcHJvdmlkZWQgYXR0cnMgYXJyYXkuXG4gICAqXG4gICAqIEBwYXJhbSBhdHRycyBhbiBleGlzdGluZyBhcnJheSB3aGVyZSBlYWNoIG9mIHRoZSBzdHlsaW5nIGV4cHJlc3Npb25zXG4gICAqIHdpbGwgYmUgaW5zZXJ0ZWQgaW50by5cbiAgICovXG4gIHBvcHVsYXRlSW5pdGlhbFN0eWxpbmdBdHRycyhhdHRyczogby5FeHByZXNzaW9uW10pOiB2b2lkIHtcbiAgICAvLyBbQ0xBU1NfTUFSS0VSLCAnZm9vJywgJ2JhcicsICdiYXonIC4uLl1cbiAgICBpZiAodGhpcy5faW5pdGlhbENsYXNzVmFsdWVzLmxlbmd0aCkge1xuICAgICAgYXR0cnMucHVzaChvLmxpdGVyYWwoQXR0cmlidXRlTWFya2VyLkNsYXNzZXMpKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5faW5pdGlhbENsYXNzVmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGF0dHJzLnB1c2goby5saXRlcmFsKHRoaXMuX2luaXRpYWxDbGFzc1ZhbHVlc1tpXSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFtTVFlMRV9NQVJLRVIsICd3aWR0aCcsICcyMDBweCcsICdoZWlnaHQnLCAnMTAwcHgnLCAuLi5dXG4gICAgaWYgKHRoaXMuX2luaXRpYWxTdHlsZVZhbHVlcy5sZW5ndGgpIHtcbiAgICAgIGF0dHJzLnB1c2goby5saXRlcmFsKEF0dHJpYnV0ZU1hcmtlci5TdHlsZXMpKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5faW5pdGlhbFN0eWxlVmFsdWVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIGF0dHJzLnB1c2goXG4gICAgICAgICAgICBvLmxpdGVyYWwodGhpcy5faW5pdGlhbFN0eWxlVmFsdWVzW2ldKSwgby5saXRlcmFsKHRoaXMuX2luaXRpYWxTdHlsZVZhbHVlc1tpICsgMV0pKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuIGluc3RydWN0aW9uIHdpdGggYWxsIHRoZSBleHByZXNzaW9ucyBhbmQgcGFyYW1ldGVycyBmb3IgYGVsZW1lbnRIb3N0QXR0cnNgLlxuICAgKlxuICAgKiBUaGUgaW5zdHJ1Y3Rpb24gZ2VuZXJhdGlvbiBjb2RlIGJlbG93IGlzIHVzZWQgZm9yIHByb2R1Y2luZyB0aGUgQU9UIHN0YXRlbWVudCBjb2RlIHdoaWNoIGlzXG4gICAqIHJlc3BvbnNpYmxlIGZvciByZWdpc3RlcmluZyBpbml0aWFsIHN0eWxlcyAod2l0aGluIGEgZGlyZWN0aXZlIGhvc3RCaW5kaW5ncycgY3JlYXRpb24gYmxvY2spLFxuICAgKiBhcyB3ZWxsIGFzIGFueSBvZiB0aGUgcHJvdmlkZWQgYXR0cmlidXRlIHZhbHVlcywgdG8gdGhlIGRpcmVjdGl2ZSBob3N0IGVsZW1lbnQuXG4gICAqL1xuICBhc3NpZ25Ib3N0QXR0cnMoYXR0cnM6IG8uRXhwcmVzc2lvbltdLCBkZWZpbml0aW9uTWFwOiBEZWZpbml0aW9uTWFwKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2RpcmVjdGl2ZUV4cHIgJiYgKGF0dHJzLmxlbmd0aCB8fCB0aGlzLl9oYXNJbml0aWFsVmFsdWVzKSkge1xuICAgICAgdGhpcy5wb3B1bGF0ZUluaXRpYWxTdHlsaW5nQXR0cnMoYXR0cnMpO1xuICAgICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2hvc3RBdHRycycsIG8ubGl0ZXJhbEFycihhdHRycykpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW4gaW5zdHJ1Y3Rpb24gd2l0aCBhbGwgdGhlIGV4cHJlc3Npb25zIGFuZCBwYXJhbWV0ZXJzIGZvciBgY2xhc3NNYXBgLlxuICAgKlxuICAgKiBUaGUgaW5zdHJ1Y3Rpb24gZGF0YSB3aWxsIGNvbnRhaW4gYWxsIGV4cHJlc3Npb25zIGZvciBgY2xhc3NNYXBgIHRvIGZ1bmN0aW9uXG4gICAqIHdoaWNoIGluY2x1ZGVzIHRoZSBgW2NsYXNzXWAgZXhwcmVzc2lvbiBwYXJhbXMuXG4gICAqL1xuICBidWlsZENsYXNzTWFwSW5zdHJ1Y3Rpb24odmFsdWVDb252ZXJ0ZXI6IFZhbHVlQ29udmVydGVyKTogU3R5bGluZ0luc3RydWN0aW9ufG51bGwge1xuICAgIGlmICh0aGlzLl9jbGFzc01hcElucHV0KSB7XG4gICAgICByZXR1cm4gdGhpcy5fYnVpbGRNYXBCYXNlZEluc3RydWN0aW9uKHZhbHVlQ29udmVydGVyLCB0cnVlLCB0aGlzLl9jbGFzc01hcElucHV0KTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuIGluc3RydWN0aW9uIHdpdGggYWxsIHRoZSBleHByZXNzaW9ucyBhbmQgcGFyYW1ldGVycyBmb3IgYHN0eWxlTWFwYC5cbiAgICpcbiAgICogVGhlIGluc3RydWN0aW9uIGRhdGEgd2lsbCBjb250YWluIGFsbCBleHByZXNzaW9ucyBmb3IgYHN0eWxlTWFwYCB0byBmdW5jdGlvblxuICAgKiB3aGljaCBpbmNsdWRlcyB0aGUgYFtzdHlsZV1gIGV4cHJlc3Npb24gcGFyYW1zLlxuICAgKi9cbiAgYnVpbGRTdHlsZU1hcEluc3RydWN0aW9uKHZhbHVlQ29udmVydGVyOiBWYWx1ZUNvbnZlcnRlcik6IFN0eWxpbmdJbnN0cnVjdGlvbnxudWxsIHtcbiAgICBpZiAodGhpcy5fc3R5bGVNYXBJbnB1dCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2J1aWxkTWFwQmFzZWRJbnN0cnVjdGlvbih2YWx1ZUNvbnZlcnRlciwgZmFsc2UsIHRoaXMuX3N0eWxlTWFwSW5wdXQpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkTWFwQmFzZWRJbnN0cnVjdGlvbihcbiAgICAgIHZhbHVlQ29udmVydGVyOiBWYWx1ZUNvbnZlcnRlciwgaXNDbGFzc0Jhc2VkOiBib29sZWFuLFxuICAgICAgc3R5bGluZ0lucHV0OiBCb3VuZFN0eWxpbmdFbnRyeSk6IFN0eWxpbmdJbnN0cnVjdGlvbiB7XG4gICAgLy8gZWFjaCBzdHlsaW5nIGJpbmRpbmcgdmFsdWUgaXMgc3RvcmVkIGluIHRoZSBMVmlld1xuICAgIC8vIG1hcC1iYXNlZCBiaW5kaW5ncyBhbGxvY2F0ZSB0d28gc2xvdHM6IG9uZSBmb3IgdGhlXG4gICAgLy8gcHJldmlvdXMgYmluZGluZyB2YWx1ZSBhbmQgYW5vdGhlciBmb3IgdGhlIHByZXZpb3VzXG4gICAgLy8gY2xhc3NOYW1lIG9yIHN0eWxlIGF0dHJpYnV0ZSB2YWx1ZS5cbiAgICBsZXQgdG90YWxCaW5kaW5nU2xvdHNSZXF1aXJlZCA9IE1JTl9TVFlMSU5HX0JJTkRJTkdfU0xPVFNfUkVRVUlSRUQ7XG5cbiAgICAvLyB0aGVzZSB2YWx1ZXMgbXVzdCBiZSBvdXRzaWRlIG9mIHRoZSB1cGRhdGUgYmxvY2sgc28gdGhhdCB0aGV5IGNhblxuICAgIC8vIGJlIGV2YWx1YXRlZCAodGhlIEFTVCB2aXNpdCBjYWxsKSBkdXJpbmcgY3JlYXRpb24gdGltZSBzbyB0aGF0IGFueVxuICAgIC8vIHBpcGVzIGNhbiBiZSBwaWNrZWQgdXAgaW4gdGltZSBiZWZvcmUgdGhlIHRlbXBsYXRlIGlzIGJ1aWx0XG4gICAgY29uc3QgbWFwVmFsdWUgPSBzdHlsaW5nSW5wdXQudmFsdWUudmlzaXQodmFsdWVDb252ZXJ0ZXIpO1xuICAgIGxldCByZWZlcmVuY2U6IG8uRXh0ZXJuYWxSZWZlcmVuY2U7XG4gICAgaWYgKG1hcFZhbHVlIGluc3RhbmNlb2YgSW50ZXJwb2xhdGlvbikge1xuICAgICAgdG90YWxCaW5kaW5nU2xvdHNSZXF1aXJlZCArPSBtYXBWYWx1ZS5leHByZXNzaW9ucy5sZW5ndGg7XG4gICAgICByZWZlcmVuY2UgPSBpc0NsYXNzQmFzZWQgPyBnZXRDbGFzc01hcEludGVycG9sYXRpb25FeHByZXNzaW9uKG1hcFZhbHVlKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRTdHlsZU1hcEludGVycG9sYXRpb25FeHByZXNzaW9uKG1hcFZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVmZXJlbmNlID0gaXNDbGFzc0Jhc2VkID8gUjMuY2xhc3NNYXAgOiBSMy5zdHlsZU1hcDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVmZXJlbmNlLFxuICAgICAgY2FsbHM6IFt7XG4gICAgICAgIHN1cHBvcnRzSW50ZXJwb2xhdGlvbjogdHJ1ZSxcbiAgICAgICAgc291cmNlU3Bhbjogc3R5bGluZ0lucHV0LnNvdXJjZVNwYW4sXG4gICAgICAgIGFsbG9jYXRlQmluZGluZ1Nsb3RzOiB0b3RhbEJpbmRpbmdTbG90c1JlcXVpcmVkLFxuICAgICAgICBwYXJhbXM6IChjb252ZXJ0Rm46ICh2YWx1ZTogYW55KSA9PiBvLkV4cHJlc3Npb24gfCBvLkV4cHJlc3Npb25bXSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbnZlcnRSZXN1bHQgPSBjb252ZXJ0Rm4obWFwVmFsdWUpO1xuICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IEFycmF5LmlzQXJyYXkoY29udmVydFJlc3VsdCkgPyBjb252ZXJ0UmVzdWx0IDogW2NvbnZlcnRSZXN1bHRdO1xuICAgICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgICAgIH1cbiAgICAgIH1dXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkU2luZ2xlSW5wdXRzKFxuICAgICAgcmVmZXJlbmNlOiBvLkV4dGVybmFsUmVmZXJlbmNlLCBpbnB1dHM6IEJvdW5kU3R5bGluZ0VudHJ5W10sIHZhbHVlQ29udmVydGVyOiBWYWx1ZUNvbnZlcnRlcixcbiAgICAgIGdldEludGVycG9sYXRpb25FeHByZXNzaW9uRm46ICgodmFsdWU6IEludGVycG9sYXRpb24pID0+IG8uRXh0ZXJuYWxSZWZlcmVuY2UpfG51bGwsXG4gICAgICBpc0NsYXNzQmFzZWQ6IGJvb2xlYW4pOiBTdHlsaW5nSW5zdHJ1Y3Rpb25bXSB7XG4gICAgY29uc3QgaW5zdHJ1Y3Rpb25zOiBTdHlsaW5nSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuXG4gICAgaW5wdXRzLmZvckVhY2goaW5wdXQgPT4ge1xuICAgICAgY29uc3QgcHJldmlvdXNJbnN0cnVjdGlvbjogU3R5bGluZ0luc3RydWN0aW9ufHVuZGVmaW5lZCA9XG4gICAgICAgICAgaW5zdHJ1Y3Rpb25zW2luc3RydWN0aW9ucy5sZW5ndGggLSAxXTtcbiAgICAgIGNvbnN0IHZhbHVlID0gaW5wdXQudmFsdWUudmlzaXQodmFsdWVDb252ZXJ0ZXIpO1xuICAgICAgbGV0IHJlZmVyZW5jZUZvckNhbGwgPSByZWZlcmVuY2U7XG5cbiAgICAgIC8vIGVhY2ggc3R5bGluZyBiaW5kaW5nIHZhbHVlIGlzIHN0b3JlZCBpbiB0aGUgTFZpZXdcbiAgICAgIC8vIGJ1dCB0aGVyZSBhcmUgdHdvIHZhbHVlcyBzdG9yZWQgZm9yIGVhY2ggYmluZGluZzpcbiAgICAgIC8vICAgMSkgdGhlIHZhbHVlIGl0c2VsZlxuICAgICAgLy8gICAyKSBhbiBpbnRlcm1lZGlhdGUgdmFsdWUgKGNvbmNhdGVuYXRpb24gb2Ygc3R5bGUgdXAgdG8gdGhpcyBwb2ludCkuXG4gICAgICAvLyAgICAgIFdlIG5lZWQgdG8gc3RvcmUgdGhlIGludGVybWVkaWF0ZSB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0IGFsbG9jYXRlXG4gICAgICAvLyAgICAgIHRoZSBzdHJpbmdzIG9uIGVhY2ggQ0QuXG4gICAgICBsZXQgdG90YWxCaW5kaW5nU2xvdHNSZXF1aXJlZCA9IE1JTl9TVFlMSU5HX0JJTkRJTkdfU0xPVFNfUkVRVUlSRUQ7XG5cbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEludGVycG9sYXRpb24pIHtcbiAgICAgICAgdG90YWxCaW5kaW5nU2xvdHNSZXF1aXJlZCArPSB2YWx1ZS5leHByZXNzaW9ucy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKGdldEludGVycG9sYXRpb25FeHByZXNzaW9uRm4pIHtcbiAgICAgICAgICByZWZlcmVuY2VGb3JDYWxsID0gZ2V0SW50ZXJwb2xhdGlvbkV4cHJlc3Npb25Gbih2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgY2FsbCA9IHtcbiAgICAgICAgc291cmNlU3BhbjogaW5wdXQuc291cmNlU3BhbixcbiAgICAgICAgYWxsb2NhdGVCaW5kaW5nU2xvdHM6IHRvdGFsQmluZGluZ1Nsb3RzUmVxdWlyZWQsXG4gICAgICAgIHN1cHBvcnRzSW50ZXJwb2xhdGlvbjogISFnZXRJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbkZuLFxuICAgICAgICBwYXJhbXM6IChjb252ZXJ0Rm46ICh2YWx1ZTogYW55KSA9PiBvLkV4cHJlc3Npb24gfCBvLkV4cHJlc3Npb25bXSkgPT4ge1xuICAgICAgICAgIC8vIHBhcmFtcyA9PiBzdHlsaW5nUHJvcChwcm9wTmFtZSwgdmFsdWUsIHN1ZmZpeHxzYW5pdGl6ZXIpXG4gICAgICAgICAgY29uc3QgcGFyYW1zOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICAgICAgICAgIHBhcmFtcy5wdXNoKG8ubGl0ZXJhbChpbnB1dC5uYW1lKSk7XG5cbiAgICAgICAgICBjb25zdCBjb252ZXJ0UmVzdWx0ID0gY29udmVydEZuKHZhbHVlKTtcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjb252ZXJ0UmVzdWx0KSkge1xuICAgICAgICAgICAgcGFyYW1zLnB1c2goLi4uY29udmVydFJlc3VsdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKGNvbnZlcnRSZXN1bHQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFtzdHlsZS5wcm9wXSBiaW5kaW5ncyBtYXkgdXNlIHN1ZmZpeCB2YWx1ZXMgKGUuZy4gcHgsIGVtLCBldGMuLi4pIGFuZCB0aGV5XG4gICAgICAgICAgLy8gY2FuIGFsc28gdXNlIGEgc2FuaXRpemVyLiBTYW5pdGl6YXRpb24gb2NjdXJzIGZvciB1cmwtYmFzZWQgZW50cmllcy4gSGF2aW5nXG4gICAgICAgICAgLy8gdGhlIHN1ZmZpeCB2YWx1ZSBhbmQgYSBzYW5pdGl6ZXIgdG9nZXRoZXIgaW50byB0aGUgaW5zdHJ1Y3Rpb24gZG9lc24ndCBtYWtlXG4gICAgICAgICAgLy8gYW55IHNlbnNlICh1cmwtYmFzZWQgZW50cmllcyBjYW5ub3QgYmUgc2FuaXRpemVkKS5cbiAgICAgICAgICBpZiAoIWlzQ2xhc3NCYXNlZCkge1xuICAgICAgICAgICAgaWYgKGlucHV0LnVuaXQpIHtcbiAgICAgICAgICAgICAgcGFyYW1zLnB1c2goby5saXRlcmFsKGlucHV0LnVuaXQpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5wdXQuc2FuaXRpemUpIHtcbiAgICAgICAgICAgICAgcGFyYW1zLnB1c2goby5pbXBvcnRFeHByKFIzLmRlZmF1bHRTdHlsZVNhbml0aXplcikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIElmIHdlIGVuZGVkIHVwIGdlbmVyYXRpbmcgYSBjYWxsIHRvIHRoZSBzYW1lIGluc3RydWN0aW9uIGFzIHRoZSBwcmV2aW91cyBzdHlsaW5nIHByb3BlcnR5XG4gICAgICAvLyB3ZSBjYW4gY2hhaW4gdGhlIGNhbGxzIHRvZ2V0aGVyIHNhZmVseSB0byBzYXZlIHNvbWUgYnl0ZXMsIG90aGVyd2lzZSB3ZSBoYXZlIHRvIGdlbmVyYXRlXG4gICAgICAvLyBhIHNlcGFyYXRlIGluc3RydWN0aW9uIGNhbGwuIFRoaXMgaXMgcHJpbWFyaWx5IGEgY29uY2VybiB3aXRoIGludGVycG9sYXRpb24gaW5zdHJ1Y3Rpb25zXG4gICAgICAvLyB3aGVyZSB3ZSBtYXkgc3RhcnQgb2ZmIHdpdGggb25lIGByZWZlcmVuY2VgLCBidXQgZW5kIHVwIHVzaW5nIGFub3RoZXIgYmFzZWQgb24gdGhlXG4gICAgICAvLyBudW1iZXIgb2YgaW50ZXJwb2xhdGlvbnMuXG4gICAgICBpZiAocHJldmlvdXNJbnN0cnVjdGlvbiAmJiBwcmV2aW91c0luc3RydWN0aW9uLnJlZmVyZW5jZSA9PT0gcmVmZXJlbmNlRm9yQ2FsbCkge1xuICAgICAgICBwcmV2aW91c0luc3RydWN0aW9uLmNhbGxzLnB1c2goY2FsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbnN0cnVjdGlvbnMucHVzaCh7cmVmZXJlbmNlOiByZWZlcmVuY2VGb3JDYWxsLCBjYWxsczogW2NhbGxdfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaW5zdHJ1Y3Rpb25zO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRDbGFzc0lucHV0cyh2YWx1ZUNvbnZlcnRlcjogVmFsdWVDb252ZXJ0ZXIpOiBTdHlsaW5nSW5zdHJ1Y3Rpb25bXSB7XG4gICAgaWYgKHRoaXMuX3NpbmdsZUNsYXNzSW5wdXRzKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYnVpbGRTaW5nbGVJbnB1dHMoXG4gICAgICAgICAgUjMuY2xhc3NQcm9wLCB0aGlzLl9zaW5nbGVDbGFzc0lucHV0cywgdmFsdWVDb252ZXJ0ZXIsIG51bGwsIHRydWUpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFN0eWxlSW5wdXRzKHZhbHVlQ29udmVydGVyOiBWYWx1ZUNvbnZlcnRlcik6IFN0eWxpbmdJbnN0cnVjdGlvbltdIHtcbiAgICBpZiAodGhpcy5fc2luZ2xlU3R5bGVJbnB1dHMpIHtcbiAgICAgIHJldHVybiB0aGlzLl9idWlsZFNpbmdsZUlucHV0cyhcbiAgICAgICAgICBSMy5zdHlsZVByb3AsIHRoaXMuX3NpbmdsZVN0eWxlSW5wdXRzLCB2YWx1ZUNvbnZlcnRlcixcbiAgICAgICAgICBnZXRTdHlsZVByb3BJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbiwgZmFsc2UpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhbGwgaW5zdHJ1Y3Rpb25zIHdoaWNoIGNvbnRhaW4gdGhlIGV4cHJlc3Npb25zIHRoYXQgd2lsbCBiZSBwbGFjZWRcbiAgICogaW50byB0aGUgdXBkYXRlIGJsb2NrIG9mIGEgdGVtcGxhdGUgZnVuY3Rpb24gb3IgYSBkaXJlY3RpdmUgaG9zdEJpbmRpbmdzIGZ1bmN0aW9uLlxuICAgKi9cbiAgYnVpbGRVcGRhdGVMZXZlbEluc3RydWN0aW9ucyh2YWx1ZUNvbnZlcnRlcjogVmFsdWVDb252ZXJ0ZXIpIHtcbiAgICBjb25zdCBpbnN0cnVjdGlvbnM6IFN0eWxpbmdJbnN0cnVjdGlvbltdID0gW107XG4gICAgaWYgKHRoaXMuaGFzQmluZGluZ3MpIHtcbiAgICAgIGNvbnN0IHN0eWxlTWFwSW5zdHJ1Y3Rpb24gPSB0aGlzLmJ1aWxkU3R5bGVNYXBJbnN0cnVjdGlvbih2YWx1ZUNvbnZlcnRlcik7XG4gICAgICBpZiAoc3R5bGVNYXBJbnN0cnVjdGlvbikge1xuICAgICAgICBpbnN0cnVjdGlvbnMucHVzaChzdHlsZU1hcEluc3RydWN0aW9uKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNsYXNzTWFwSW5zdHJ1Y3Rpb24gPSB0aGlzLmJ1aWxkQ2xhc3NNYXBJbnN0cnVjdGlvbih2YWx1ZUNvbnZlcnRlcik7XG4gICAgICBpZiAoY2xhc3NNYXBJbnN0cnVjdGlvbikge1xuICAgICAgICBpbnN0cnVjdGlvbnMucHVzaChjbGFzc01hcEluc3RydWN0aW9uKTtcbiAgICAgIH1cbiAgICAgIGluc3RydWN0aW9ucy5wdXNoKC4uLnRoaXMuX2J1aWxkU3R5bGVJbnB1dHModmFsdWVDb252ZXJ0ZXIpKTtcbiAgICAgIGluc3RydWN0aW9ucy5wdXNoKC4uLnRoaXMuX2J1aWxkQ2xhc3NJbnB1dHModmFsdWVDb252ZXJ0ZXIpKTtcbiAgICB9XG4gICAgcmV0dXJuIGluc3RydWN0aW9ucztcbiAgfVxufVxuXG5mdW5jdGlvbiByZWdpc3RlckludG9NYXAobWFwOiBNYXA8c3RyaW5nLCBudW1iZXI+LCBrZXk6IHN0cmluZykge1xuICBpZiAoIW1hcC5oYXMoa2V5KSkge1xuICAgIG1hcC5zZXQoa2V5LCBtYXAuc2l6ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNTdHlsZVNhbml0aXphYmxlKHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAvLyBOb3RlIHRoYXQgYnJvd3NlcnMgc3VwcG9ydCBib3RoIHRoZSBkYXNoIGNhc2UgYW5kXG4gIC8vIGNhbWVsIGNhc2UgcHJvcGVydHkgbmFtZXMgd2hlbiBzZXR0aW5nIHRocm91Z2ggSlMuXG4gIHJldHVybiBwcm9wID09PSAnYmFja2dyb3VuZC1pbWFnZScgfHwgcHJvcCA9PT0gJ2JhY2tncm91bmRJbWFnZScgfHwgcHJvcCA9PT0gJ2JhY2tncm91bmQnIHx8XG4gICAgICBwcm9wID09PSAnYm9yZGVyLWltYWdlJyB8fCBwcm9wID09PSAnYm9yZGVySW1hZ2UnIHx8IHByb3AgPT09ICdib3JkZXItaW1hZ2Utc291cmNlJyB8fFxuICAgICAgcHJvcCA9PT0gJ2JvcmRlckltYWdlU291cmNlJyB8fCBwcm9wID09PSAnZmlsdGVyJyB8fCBwcm9wID09PSAnbGlzdC1zdHlsZScgfHxcbiAgICAgIHByb3AgPT09ICdsaXN0U3R5bGUnIHx8IHByb3AgPT09ICdsaXN0LXN0eWxlLWltYWdlJyB8fCBwcm9wID09PSAnbGlzdFN0eWxlSW1hZ2UnIHx8XG4gICAgICBwcm9wID09PSAnY2xpcC1wYXRoJyB8fCBwcm9wID09PSAnY2xpcFBhdGgnO1xufVxuXG4vKipcbiAqIFNpbXBsZSBoZWxwZXIgZnVuY3Rpb24gdG8gZWl0aGVyIHByb3ZpZGUgdGhlIGNvbnN0YW50IGxpdGVyYWwgdGhhdCB3aWxsIGhvdXNlIHRoZSB2YWx1ZVxuICogaGVyZSBvciBhIG51bGwgdmFsdWUgaWYgdGhlIHByb3ZpZGVkIHZhbHVlcyBhcmUgZW1wdHkuXG4gKi9cbmZ1bmN0aW9uIGdldENvbnN0YW50TGl0ZXJhbEZyb21BcnJheShcbiAgICBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCwgdmFsdWVzOiBvLkV4cHJlc3Npb25bXSk6IG8uRXhwcmVzc2lvbiB7XG4gIHJldHVybiB2YWx1ZXMubGVuZ3RoID8gY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChvLmxpdGVyYWxBcnIodmFsdWVzKSwgdHJ1ZSkgOiBvLk5VTExfRVhQUjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUHJvcGVydHkobmFtZTogc3RyaW5nKTpcbiAgICB7cHJvcGVydHk6IHN0cmluZywgdW5pdDogc3RyaW5nLCBoYXNPdmVycmlkZUZsYWc6IGJvb2xlYW59IHtcbiAgbGV0IGhhc092ZXJyaWRlRmxhZyA9IGZhbHNlO1xuICBjb25zdCBvdmVycmlkZUluZGV4ID0gbmFtZS5pbmRleE9mKElNUE9SVEFOVF9GTEFHKTtcbiAgaWYgKG92ZXJyaWRlSW5kZXggIT09IC0xKSB7XG4gICAgbmFtZSA9IG92ZXJyaWRlSW5kZXggPiAwID8gbmFtZS5zdWJzdHJpbmcoMCwgb3ZlcnJpZGVJbmRleCkgOiAnJztcbiAgICBoYXNPdmVycmlkZUZsYWcgPSB0cnVlO1xuICB9XG5cbiAgbGV0IHVuaXQgPSAnJztcbiAgbGV0IHByb3BlcnR5ID0gbmFtZTtcbiAgY29uc3QgdW5pdEluZGV4ID0gbmFtZS5sYXN0SW5kZXhPZignLicpO1xuICBpZiAodW5pdEluZGV4ID4gMCkge1xuICAgIHVuaXQgPSBuYW1lLnN1YnN0cih1bml0SW5kZXggKyAxKTtcbiAgICBwcm9wZXJ0eSA9IG5hbWUuc3Vic3RyaW5nKDAsIHVuaXRJbmRleCk7XG4gIH1cblxuICByZXR1cm4ge3Byb3BlcnR5LCB1bml0LCBoYXNPdmVycmlkZUZsYWd9O1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGluc3RydWN0aW9uIHRvIGdlbmVyYXRlIGZvciBhbiBpbnRlcnBvbGF0ZWQgY2xhc3MgbWFwLlxuICogQHBhcmFtIGludGVycG9sYXRpb24gQW4gSW50ZXJwb2xhdGlvbiBBU1RcbiAqL1xuZnVuY3Rpb24gZ2V0Q2xhc3NNYXBJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbihpbnRlcnBvbGF0aW9uOiBJbnRlcnBvbGF0aW9uKTogby5FeHRlcm5hbFJlZmVyZW5jZSB7XG4gIHN3aXRjaCAoZ2V0SW50ZXJwb2xhdGlvbkFyZ3NMZW5ndGgoaW50ZXJwb2xhdGlvbikpIHtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gUjMuY2xhc3NNYXA7XG4gICAgY2FzZSAzOlxuICAgICAgcmV0dXJuIFIzLmNsYXNzTWFwSW50ZXJwb2xhdGUxO1xuICAgIGNhc2UgNTpcbiAgICAgIHJldHVybiBSMy5jbGFzc01hcEludGVycG9sYXRlMjtcbiAgICBjYXNlIDc6XG4gICAgICByZXR1cm4gUjMuY2xhc3NNYXBJbnRlcnBvbGF0ZTM7XG4gICAgY2FzZSA5OlxuICAgICAgcmV0dXJuIFIzLmNsYXNzTWFwSW50ZXJwb2xhdGU0O1xuICAgIGNhc2UgMTE6XG4gICAgICByZXR1cm4gUjMuY2xhc3NNYXBJbnRlcnBvbGF0ZTU7XG4gICAgY2FzZSAxMzpcbiAgICAgIHJldHVybiBSMy5jbGFzc01hcEludGVycG9sYXRlNjtcbiAgICBjYXNlIDE1OlxuICAgICAgcmV0dXJuIFIzLmNsYXNzTWFwSW50ZXJwb2xhdGU3O1xuICAgIGNhc2UgMTc6XG4gICAgICByZXR1cm4gUjMuY2xhc3NNYXBJbnRlcnBvbGF0ZTg7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBSMy5jbGFzc01hcEludGVycG9sYXRlVjtcbiAgfVxufVxuXG4vKipcbiAqIEdldHMgdGhlIGluc3RydWN0aW9uIHRvIGdlbmVyYXRlIGZvciBhbiBpbnRlcnBvbGF0ZWQgc3R5bGUgbWFwLlxuICogQHBhcmFtIGludGVycG9sYXRpb24gQW4gSW50ZXJwb2xhdGlvbiBBU1RcbiAqL1xuZnVuY3Rpb24gZ2V0U3R5bGVNYXBJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbihpbnRlcnBvbGF0aW9uOiBJbnRlcnBvbGF0aW9uKTogby5FeHRlcm5hbFJlZmVyZW5jZSB7XG4gIHN3aXRjaCAoZ2V0SW50ZXJwb2xhdGlvbkFyZ3NMZW5ndGgoaW50ZXJwb2xhdGlvbikpIHtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gUjMuc3R5bGVNYXA7XG4gICAgY2FzZSAzOlxuICAgICAgcmV0dXJuIFIzLnN0eWxlTWFwSW50ZXJwb2xhdGUxO1xuICAgIGNhc2UgNTpcbiAgICAgIHJldHVybiBSMy5zdHlsZU1hcEludGVycG9sYXRlMjtcbiAgICBjYXNlIDc6XG4gICAgICByZXR1cm4gUjMuc3R5bGVNYXBJbnRlcnBvbGF0ZTM7XG4gICAgY2FzZSA5OlxuICAgICAgcmV0dXJuIFIzLnN0eWxlTWFwSW50ZXJwb2xhdGU0O1xuICAgIGNhc2UgMTE6XG4gICAgICByZXR1cm4gUjMuc3R5bGVNYXBJbnRlcnBvbGF0ZTU7XG4gICAgY2FzZSAxMzpcbiAgICAgIHJldHVybiBSMy5zdHlsZU1hcEludGVycG9sYXRlNjtcbiAgICBjYXNlIDE1OlxuICAgICAgcmV0dXJuIFIzLnN0eWxlTWFwSW50ZXJwb2xhdGU3O1xuICAgIGNhc2UgMTc6XG4gICAgICByZXR1cm4gUjMuc3R5bGVNYXBJbnRlcnBvbGF0ZTg7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBSMy5zdHlsZU1hcEludGVycG9sYXRlVjtcbiAgfVxufVxuXG4vKipcbiAqIEdldHMgdGhlIGluc3RydWN0aW9uIHRvIGdlbmVyYXRlIGZvciBhbiBpbnRlcnBvbGF0ZWQgc3R5bGUgcHJvcC5cbiAqIEBwYXJhbSBpbnRlcnBvbGF0aW9uIEFuIEludGVycG9sYXRpb24gQVNUXG4gKi9cbmZ1bmN0aW9uIGdldFN0eWxlUHJvcEludGVycG9sYXRpb25FeHByZXNzaW9uKGludGVycG9sYXRpb246IEludGVycG9sYXRpb24pIHtcbiAgc3dpdGNoIChnZXRJbnRlcnBvbGF0aW9uQXJnc0xlbmd0aChpbnRlcnBvbGF0aW9uKSkge1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBSMy5zdHlsZVByb3A7XG4gICAgY2FzZSAzOlxuICAgICAgcmV0dXJuIFIzLnN0eWxlUHJvcEludGVycG9sYXRlMTtcbiAgICBjYXNlIDU6XG4gICAgICByZXR1cm4gUjMuc3R5bGVQcm9wSW50ZXJwb2xhdGUyO1xuICAgIGNhc2UgNzpcbiAgICAgIHJldHVybiBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZTM7XG4gICAgY2FzZSA5OlxuICAgICAgcmV0dXJuIFIzLnN0eWxlUHJvcEludGVycG9sYXRlNDtcbiAgICBjYXNlIDExOlxuICAgICAgcmV0dXJuIFIzLnN0eWxlUHJvcEludGVycG9sYXRlNTtcbiAgICBjYXNlIDEzOlxuICAgICAgcmV0dXJuIFIzLnN0eWxlUHJvcEludGVycG9sYXRlNjtcbiAgICBjYXNlIDE1OlxuICAgICAgcmV0dXJuIFIzLnN0eWxlUHJvcEludGVycG9sYXRlNztcbiAgICBjYXNlIDE3OlxuICAgICAgcmV0dXJuIFIzLnN0eWxlUHJvcEludGVycG9sYXRlODtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFIzLnN0eWxlUHJvcEludGVycG9sYXRlVjtcbiAgfVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVQcm9wTmFtZShwcm9wOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaHlwaGVuYXRlKHByb3ApO1xufVxuIl19