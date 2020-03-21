/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __read, __spread } from "tslib";
import '../util/ng_dev_mode';
import { getFactoryDef } from '../render3/definition';
import { throwCyclicDependencyError, throwInvalidProviderError, throwMixedMultiProviderError } from '../render3/errors';
import { deepForEach, newArray } from '../util/array_utils';
import { stringify } from '../util/stringify';
import { resolveForwardRef } from './forward_ref';
import { InjectionToken } from './injection_token';
import { INJECTOR, NG_TEMP_TOKEN_PATH, NullInjector, THROW_IF_NOT_FOUND, USE_VALUE, catchInjectorError, injectArgs, setCurrentInjector, ɵɵinject } from './injector_compatibility';
import { getInheritedInjectableDef, getInjectableDef, getInjectorDef } from './interface/defs';
import { InjectFlags } from './interface/injector';
import { INJECTOR_SCOPE } from './scope';
/**
 * Marker which indicates that a value has not yet been created from the factory function.
 */
var NOT_YET = {};
/**
 * Marker which indicates that the factory function for a token is in the process of being called.
 *
 * If the injector is asked to inject a token with its value set to CIRCULAR, that indicates
 * injection of a dependency has recursively attempted to inject the original token, and there is
 * a circular dependency among the providers.
 */
var CIRCULAR = {};
var EMPTY_ARRAY = [];
/**
 * A lazily initialized NullInjector.
 */
var NULL_INJECTOR = undefined;
function getNullInjector() {
    if (NULL_INJECTOR === undefined) {
        NULL_INJECTOR = new NullInjector();
    }
    return NULL_INJECTOR;
}
/**
 * Create a new `Injector` which is configured using a `defType` of `InjectorType<any>`s.
 *
 * @publicApi
 */
export function createInjector(defType, parent, additionalProviders, name) {
    if (parent === void 0) { parent = null; }
    if (additionalProviders === void 0) { additionalProviders = null; }
    var injector = createInjectorWithoutInjectorInstances(defType, parent, additionalProviders, name);
    injector._resolveInjectorDefTypes();
    return injector;
}
/**
 * Creates a new injector without eagerly resolving its injector types. Can be used in places
 * where resolving the injector types immediately can lead to an infinite loop. The injector types
 * should be resolved at a later point by calling `_resolveInjectorDefTypes`.
 */
export function createInjectorWithoutInjectorInstances(defType, parent, additionalProviders, name) {
    if (parent === void 0) { parent = null; }
    if (additionalProviders === void 0) { additionalProviders = null; }
    return new R3Injector(defType, additionalProviders, parent || getNullInjector(), name);
}
var R3Injector = /** @class */ (function () {
    function R3Injector(def, additionalProviders, parent, source) {
        var _this = this;
        if (source === void 0) { source = null; }
        this.parent = parent;
        /**
         * Map of tokens to records which contain the instances of those tokens.
         * - `null` value implies that we don't have the record. Used by tree-shakable injectors
         * to prevent further searches.
         */
        this.records = new Map();
        /**
         * The transitive set of `InjectorType`s which define this injector.
         */
        this.injectorDefTypes = new Set();
        /**
         * Set of values instantiated by this injector which contain `ngOnDestroy` lifecycle hooks.
         */
        this.onDestroy = new Set();
        this._destroyed = false;
        var dedupStack = [];
        // Start off by creating Records for every provider declared in every InjectorType
        // included transitively in additional providers then do the same for `def`. This order is
        // important because `def` may include providers that override ones in additionalProviders.
        additionalProviders && deepForEach(additionalProviders, function (provider) { return _this.processProvider(provider, def, additionalProviders); });
        deepForEach([def], function (injectorDef) { return _this.processInjectorType(injectorDef, [], dedupStack); });
        // Make sure the INJECTOR token provides this injector.
        this.records.set(INJECTOR, makeRecord(undefined, this));
        // Detect whether this injector has the APP_ROOT_SCOPE token and thus should provide
        // any injectable scoped to APP_ROOT_SCOPE.
        var record = this.records.get(INJECTOR_SCOPE);
        this.scope = record != null ? record.value : null;
        // Source name, used for debugging
        this.source = source || (typeof def === 'object' ? null : stringify(def));
    }
    Object.defineProperty(R3Injector.prototype, "destroyed", {
        /**
         * Flag indicating that this injector was previously destroyed.
         */
        get: function () { return this._destroyed; },
        enumerable: true,
        configurable: true
    });
    /**
     * Destroy the injector and release references to every instance or provider associated with it.
     *
     * Also calls the `OnDestroy` lifecycle hooks of every instance that was created for which a
     * hook was found.
     */
    R3Injector.prototype.destroy = function () {
        this.assertNotDestroyed();
        // Set destroyed = true first, in case lifecycle hooks re-enter destroy().
        this._destroyed = true;
        try {
            // Call all the lifecycle hooks.
            this.onDestroy.forEach(function (service) { return service.ngOnDestroy(); });
        }
        finally {
            // Release all references.
            this.records.clear();
            this.onDestroy.clear();
            this.injectorDefTypes.clear();
        }
    };
    R3Injector.prototype.get = function (token, notFoundValue, flags) {
        if (notFoundValue === void 0) { notFoundValue = THROW_IF_NOT_FOUND; }
        if (flags === void 0) { flags = InjectFlags.Default; }
        this.assertNotDestroyed();
        // Set the injection context.
        var previousInjector = setCurrentInjector(this);
        try {
            // Check for the SkipSelf flag.
            if (!(flags & InjectFlags.SkipSelf)) {
                // SkipSelf isn't set, check if the record belongs to this injector.
                var record = this.records.get(token);
                if (record === undefined) {
                    // No record, but maybe the token is scoped to this injector. Look for an injectable
                    // def with a scope matching this injector.
                    var def = couldBeInjectableType(token) && getInjectableDef(token);
                    if (def && this.injectableDefInScope(def)) {
                        // Found an injectable def and it's scoped to this injector. Pretend as if it was here
                        // all along.
                        record = makeRecord(injectableDefOrInjectorDefFactory(token), NOT_YET);
                    }
                    else {
                        record = null;
                    }
                    this.records.set(token, record);
                }
                // If a record was found, get the instance for it and return it.
                if (record != null /* NOT null || undefined */) {
                    return this.hydrate(token, record);
                }
            }
            // Select the next injector based on the Self flag - if self is set, the next injector is
            // the NullInjector, otherwise it's the parent.
            var nextInjector = !(flags & InjectFlags.Self) ? this.parent : getNullInjector();
            // Set the notFoundValue based on the Optional flag - if optional is set and notFoundValue
            // is undefined, the value is null, otherwise it's the notFoundValue.
            notFoundValue = (flags & InjectFlags.Optional) && notFoundValue === THROW_IF_NOT_FOUND ?
                null :
                notFoundValue;
            return nextInjector.get(token, notFoundValue);
        }
        catch (e) {
            if (e.name === 'NullInjectorError') {
                var path = e[NG_TEMP_TOKEN_PATH] = e[NG_TEMP_TOKEN_PATH] || [];
                path.unshift(stringify(token));
                if (previousInjector) {
                    // We still have a parent injector, keep throwing
                    throw e;
                }
                else {
                    // Format & throw the final error message when we don't have any previous injector
                    return catchInjectorError(e, token, 'R3InjectorError', this.source);
                }
            }
            else {
                throw e;
            }
        }
        finally {
            // Lastly, clean up the state by restoring the previous injector.
            setCurrentInjector(previousInjector);
        }
    };
    /** @internal */
    R3Injector.prototype._resolveInjectorDefTypes = function () {
        var _this = this;
        this.injectorDefTypes.forEach(function (defType) { return _this.get(defType); });
    };
    R3Injector.prototype.toString = function () {
        var tokens = [], records = this.records;
        records.forEach(function (v, token) { return tokens.push(stringify(token)); });
        return "R3Injector[" + tokens.join(', ') + "]";
    };
    R3Injector.prototype.assertNotDestroyed = function () {
        if (this._destroyed) {
            throw new Error('Injector has already been destroyed.');
        }
    };
    /**
     * Add an `InjectorType` or `InjectorTypeWithProviders` and all of its transitive providers
     * to this injector.
     *
     * If an `InjectorTypeWithProviders` that declares providers besides the type is specified,
     * the function will return "true" to indicate that the providers of the type definition need
     * to be processed. This allows us to process providers of injector types after all imports of
     * an injector definition are processed. (following View Engine semantics: see FW-1349)
     */
    R3Injector.prototype.processInjectorType = function (defOrWrappedDef, parents, dedupStack) {
        var _this = this;
        defOrWrappedDef = resolveForwardRef(defOrWrappedDef);
        if (!defOrWrappedDef)
            return false;
        // Either the defOrWrappedDef is an InjectorType (with injector def) or an
        // InjectorDefTypeWithProviders (aka ModuleWithProviders). Detecting either is a megamorphic
        // read, so care is taken to only do the read once.
        // First attempt to read the injector def (`ɵinj`).
        var def = getInjectorDef(defOrWrappedDef);
        // If that's not present, then attempt to read ngModule from the InjectorDefTypeWithProviders.
        var ngModule = (def == null) && defOrWrappedDef.ngModule || undefined;
        // Determine the InjectorType. In the case where `defOrWrappedDef` is an `InjectorType`,
        // then this is easy. In the case of an InjectorDefTypeWithProviders, then the definition type
        // is the `ngModule`.
        var defType = (ngModule === undefined) ? defOrWrappedDef : ngModule;
        // Check for circular dependencies.
        if (ngDevMode && parents.indexOf(defType) !== -1) {
            var defName = stringify(defType);
            throw new Error("Circular dependency in DI detected for type " + defName + ". Dependency path: " + parents.map(function (defType) { return stringify(defType); }).join(' > ') + " > " + defName + ".");
        }
        // Check for multiple imports of the same module
        var isDuplicate = dedupStack.indexOf(defType) !== -1;
        // Finally, if defOrWrappedType was an `InjectorDefTypeWithProviders`, then the actual
        // `InjectorDef` is on its `ngModule`.
        if (ngModule !== undefined) {
            def = getInjectorDef(ngModule);
        }
        // If no definition was found, it might be from exports. Remove it.
        if (def == null) {
            return false;
        }
        // Add providers in the same way that @NgModule resolution did:
        // First, include providers from any imports.
        if (def.imports != null && !isDuplicate) {
            // Before processing defType's imports, add it to the set of parents. This way, if it ends
            // up deeply importing itself, this can be detected.
            ngDevMode && parents.push(defType);
            // Add it to the set of dedups. This way we can detect multiple imports of the same module
            dedupStack.push(defType);
            var importTypesWithProviders_1;
            try {
                deepForEach(def.imports, function (imported) {
                    if (_this.processInjectorType(imported, parents, dedupStack)) {
                        if (importTypesWithProviders_1 === undefined)
                            importTypesWithProviders_1 = [];
                        // If the processed import is an injector type with providers, we store it in the
                        // list of import types with providers, so that we can process those afterwards.
                        importTypesWithProviders_1.push(imported);
                    }
                });
            }
            finally {
                // Remove it from the parents set when finished.
                ngDevMode && parents.pop();
            }
            // Imports which are declared with providers (TypeWithProviders) need to be processed
            // after all imported modules are processed. This is similar to how View Engine
            // processes/merges module imports in the metadata resolver. See: FW-1349.
            if (importTypesWithProviders_1 !== undefined) {
                var _loop_1 = function (i) {
                    var _a = importTypesWithProviders_1[i], ngModule_1 = _a.ngModule, providers = _a.providers;
                    deepForEach(providers, function (provider) { return _this.processProvider(provider, ngModule_1, providers || EMPTY_ARRAY); });
                };
                for (var i = 0; i < importTypesWithProviders_1.length; i++) {
                    _loop_1(i);
                }
            }
        }
        // Track the InjectorType and add a provider for it. It's important that this is done after the
        // def's imports.
        this.injectorDefTypes.add(defType);
        this.records.set(defType, makeRecord(def.factory, NOT_YET));
        // Next, include providers listed on the definition itself.
        var defProviders = def.providers;
        if (defProviders != null && !isDuplicate) {
            var injectorType_1 = defOrWrappedDef;
            deepForEach(defProviders, function (provider) { return _this.processProvider(provider, injectorType_1, defProviders); });
        }
        return (ngModule !== undefined &&
            defOrWrappedDef.providers !== undefined);
    };
    /**
     * Process a `SingleProvider` and add it.
     */
    R3Injector.prototype.processProvider = function (provider, ngModuleType, providers) {
        // Determine the token from the provider. Either it's its own token, or has a {provide: ...}
        // property.
        provider = resolveForwardRef(provider);
        var token = isTypeProvider(provider) ? provider : resolveForwardRef(provider && provider.provide);
        // Construct a `Record` for the provider.
        var record = providerToRecord(provider, ngModuleType, providers);
        if (!isTypeProvider(provider) && provider.multi === true) {
            // If the provider indicates that it's a multi-provider, process it specially.
            // First check whether it's been defined already.
            var multiRecord_1 = this.records.get(token);
            if (multiRecord_1) {
                // It has. Throw a nice error if
                if (multiRecord_1.multi === undefined) {
                    throwMixedMultiProviderError();
                }
            }
            else {
                multiRecord_1 = makeRecord(undefined, NOT_YET, true);
                multiRecord_1.factory = function () { return injectArgs(multiRecord_1.multi); };
                this.records.set(token, multiRecord_1);
            }
            token = provider;
            multiRecord_1.multi.push(provider);
        }
        else {
            var existing = this.records.get(token);
            if (existing && existing.multi !== undefined) {
                throwMixedMultiProviderError();
            }
        }
        this.records.set(token, record);
    };
    R3Injector.prototype.hydrate = function (token, record) {
        if (record.value === CIRCULAR) {
            throwCyclicDependencyError(stringify(token));
        }
        else if (record.value === NOT_YET) {
            record.value = CIRCULAR;
            record.value = record.factory();
        }
        if (typeof record.value === 'object' && record.value && hasOnDestroy(record.value)) {
            this.onDestroy.add(record.value);
        }
        return record.value;
    };
    R3Injector.prototype.injectableDefInScope = function (def) {
        if (!def.providedIn) {
            return false;
        }
        else if (typeof def.providedIn === 'string') {
            return def.providedIn === 'any' || (def.providedIn === this.scope);
        }
        else {
            return this.injectorDefTypes.has(def.providedIn);
        }
    };
    return R3Injector;
}());
export { R3Injector };
function injectableDefOrInjectorDefFactory(token) {
    // Most tokens will have an injectable def directly on them, which specifies a factory directly.
    var injectableDef = getInjectableDef(token);
    var factory = injectableDef !== null ? injectableDef.factory : getFactoryDef(token);
    if (factory !== null) {
        return factory;
    }
    // If the token is an NgModule, it's also injectable but the factory is on its injector def
    // (`ɵinj`)
    var injectorDef = getInjectorDef(token);
    if (injectorDef !== null) {
        return injectorDef.factory;
    }
    // InjectionTokens should have an injectable def (ɵprov) and thus should be handled above.
    // If it's missing that, it's an error.
    if (token instanceof InjectionToken) {
        throw new Error("Token " + stringify(token) + " is missing a \u0275prov definition.");
    }
    // Undecorated types can sometimes be created if they have no constructor arguments.
    if (token instanceof Function) {
        return getUndecoratedInjectableFactory(token);
    }
    // There was no way to resolve a factory for this token.
    throw new Error('unreachable');
}
function getUndecoratedInjectableFactory(token) {
    // If the token has parameters then it has dependencies that we cannot resolve implicitly.
    var paramLength = token.length;
    if (paramLength > 0) {
        var args = newArray(paramLength, '?');
        throw new Error("Can't resolve all parameters for " + stringify(token) + ": (" + args.join(', ') + ").");
    }
    // The constructor function appears to have no parameters.
    // This might be because it inherits from a super-class. In which case, use an injectable
    // def from an ancestor if there is one.
    // Otherwise this really is a simple class with no dependencies, so return a factory that
    // just instantiates the zero-arg constructor.
    var inheritedInjectableDef = getInheritedInjectableDef(token);
    if (inheritedInjectableDef !== null) {
        return function () { return inheritedInjectableDef.factory(token); };
    }
    else {
        return function () { return new token(); };
    }
}
function providerToRecord(provider, ngModuleType, providers) {
    if (isValueProvider(provider)) {
        return makeRecord(undefined, provider.useValue);
    }
    else {
        var factory = providerToFactory(provider, ngModuleType, providers);
        return makeRecord(factory, NOT_YET);
    }
}
/**
 * Converts a `SingleProvider` into a factory function.
 *
 * @param provider provider to convert to factory
 */
export function providerToFactory(provider, ngModuleType, providers) {
    var factory = undefined;
    if (isTypeProvider(provider)) {
        var unwrappedProvider = resolveForwardRef(provider);
        return getFactoryDef(unwrappedProvider) || injectableDefOrInjectorDefFactory(unwrappedProvider);
    }
    else {
        if (isValueProvider(provider)) {
            factory = function () { return resolveForwardRef(provider.useValue); };
        }
        else if (isFactoryProvider(provider)) {
            factory = function () { return provider.useFactory.apply(provider, __spread(injectArgs(provider.deps || []))); };
        }
        else if (isExistingProvider(provider)) {
            factory = function () { return ɵɵinject(resolveForwardRef(provider.useExisting)); };
        }
        else {
            var classRef_1 = resolveForwardRef(provider &&
                (provider.useClass || provider.provide));
            if (!classRef_1) {
                throwInvalidProviderError(ngModuleType, providers, provider);
            }
            if (hasDeps(provider)) {
                factory = function () { return new ((classRef_1).bind.apply((classRef_1), __spread([void 0], injectArgs(provider.deps))))(); };
            }
            else {
                return getFactoryDef(classRef_1) || injectableDefOrInjectorDefFactory(classRef_1);
            }
        }
    }
    return factory;
}
function makeRecord(factory, value, multi) {
    if (multi === void 0) { multi = false; }
    return {
        factory: factory,
        value: value,
        multi: multi ? [] : undefined,
    };
}
function isValueProvider(value) {
    return value !== null && typeof value == 'object' && USE_VALUE in value;
}
function isExistingProvider(value) {
    return !!(value && value.useExisting);
}
function isFactoryProvider(value) {
    return !!(value && value.useFactory);
}
export function isTypeProvider(value) {
    return typeof value === 'function';
}
export function isClassProvider(value) {
    return !!value.useClass;
}
function hasDeps(value) {
    return !!value.deps;
}
function hasOnDestroy(value) {
    return value !== null && typeof value === 'object' &&
        typeof value.ngOnDestroy === 'function';
}
function couldBeInjectableType(value) {
    return (typeof value === 'function') ||
        (typeof value === 'object' && value instanceof InjectionToken);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfaW5qZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9kaS9yM19pbmplY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxxQkFBcUIsQ0FBQztBQUk3QixPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDcEQsT0FBTyxFQUFDLDBCQUEwQixFQUFFLHlCQUF5QixFQUFFLDRCQUE0QixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFdEgsT0FBTyxFQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMxRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDNUMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2hELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVqRCxPQUFPLEVBQUMsUUFBUSxFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLGtCQUFrQixFQUFFLFFBQVEsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ2pMLE9BQU8sRUFBMEMseUJBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFrQixNQUFNLGtCQUFrQixDQUFDO0FBQ3ZKLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUVqRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBVXZDOztHQUVHO0FBQ0gsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBRW5COzs7Ozs7R0FNRztBQUNILElBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUVwQixJQUFNLFdBQVcsR0FBRyxFQUFXLENBQUM7QUFFaEM7O0dB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QUFLLEtBQUssUUFBUSxJQUFJLEtBQUssWUFBWSxjQUFjLENBQUMsQ0FBQztBQUNyRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgJy4uL3V0aWwvbmdfZGV2X21vZGUnO1xuXG5pbXBvcnQge09uRGVzdHJveX0gZnJvbSAnLi4vaW50ZXJmYWNlL2xpZmVjeWNsZV9ob29rcyc7XG5pbXBvcnQge1R5cGV9IGZyb20gJy4uL2ludGVyZmFjZS90eXBlJztcbmltcG9ydCB7Z2V0RmFjdG9yeURlZn0gZnJvbSAnLi4vcmVuZGVyMy9kZWZpbml0aW9uJztcbmltcG9ydCB7dGhyb3dDeWNsaWNEZXBlbmRlbmN5RXJyb3IsIHRocm93SW52YWxpZFByb3ZpZGVyRXJyb3IsIHRocm93TWl4ZWRNdWx0aVByb3ZpZGVyRXJyb3J9IGZyb20gJy4uL3JlbmRlcjMvZXJyb3JzJztcbmltcG9ydCB7RmFjdG9yeUZufSBmcm9tICcuLi9yZW5kZXIzL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge2RlZXBGb3JFYWNoLCBuZXdBcnJheX0gZnJvbSAnLi4vdXRpbC9hcnJheV91dGlscyc7XG5pbXBvcnQge3N0cmluZ2lmeX0gZnJvbSAnLi4vdXRpbC9zdHJpbmdpZnknO1xuaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnLi9mb3J3YXJkX3JlZic7XG5pbXBvcnQge0luamVjdGlvblRva2VufSBmcm9tICcuL2luamVjdGlvbl90b2tlbic7XG5pbXBvcnQge0luamVjdG9yfSBmcm9tICcuL2luamVjdG9yJztcbmltcG9ydCB7SU5KRUNUT1IsIE5HX1RFTVBfVE9LRU5fUEFUSCwgTnVsbEluamVjdG9yLCBUSFJPV19JRl9OT1RfRk9VTkQsIFVTRV9WQUxVRSwgY2F0Y2hJbmplY3RvckVycm9yLCBpbmplY3RBcmdzLCBzZXRDdXJyZW50SW5qZWN0b3IsIMm1ybVpbmplY3R9IGZyb20gJy4vaW5qZWN0b3JfY29tcGF0aWJpbGl0eSc7XG5pbXBvcnQge0luamVjdG9yVHlwZSwgSW5qZWN0b3JUeXBlV2l0aFByb3ZpZGVycywgZ2V0SW5oZXJpdGVkSW5qZWN0YWJsZURlZiwgZ2V0SW5qZWN0YWJsZURlZiwgZ2V0SW5qZWN0b3JEZWYsIMm1ybVJbmplY3RhYmxlRGVmfSBmcm9tICcuL2ludGVyZmFjZS9kZWZzJztcbmltcG9ydCB7SW5qZWN0RmxhZ3N9IGZyb20gJy4vaW50ZXJmYWNlL2luamVjdG9yJztcbmltcG9ydCB7Q2xhc3NQcm92aWRlciwgQ29uc3RydWN0b3JQcm92aWRlciwgRXhpc3RpbmdQcm92aWRlciwgRmFjdG9yeVByb3ZpZGVyLCBTdGF0aWNDbGFzc1Byb3ZpZGVyLCBTdGF0aWNQcm92aWRlciwgVHlwZVByb3ZpZGVyLCBWYWx1ZVByb3ZpZGVyfSBmcm9tICcuL2ludGVyZmFjZS9wcm92aWRlcic7XG5pbXBvcnQge0lOSkVDVE9SX1NDT1BFfSBmcm9tICcuL3Njb3BlJztcblxuXG5cbi8qKlxuICogSW50ZXJuYWwgdHlwZSBmb3IgYSBzaW5nbGUgcHJvdmlkZXIgaW4gYSBkZWVwIHByb3ZpZGVyIGFycmF5LlxuICovXG50eXBlIFNpbmdsZVByb3ZpZGVyID0gVHlwZVByb3ZpZGVyIHwgVmFsdWVQcm92aWRlciB8IENsYXNzUHJvdmlkZXIgfCBDb25zdHJ1Y3RvclByb3ZpZGVyIHxcbiAgICBFeGlzdGluZ1Byb3ZpZGVyIHwgRmFjdG9yeVByb3ZpZGVyIHwgU3RhdGljQ2xhc3NQcm92aWRlcjtcblxuLyoqXG4gKiBNYXJrZXIgd2hpY2ggaW5kaWNhdGVzIHRoYXQgYSB2YWx1ZSBoYXMgbm90IHlldCBiZWVuIGNyZWF0ZWQgZnJvbSB0aGUgZmFjdG9yeSBmdW5jdGlvbi5cbiAqL1xuY29uc3QgTk9UX1lFVCA9IHt9O1xuXG4vKipcbiAqIE1hcmtlciB3aGljaCBpbmRpY2F0ZXMgdGhhdCB0aGUgZmFjdG9yeSBmdW5jdGlvbiBmb3IgYSB0b2tlbiBpcyBpbiB0aGUgcHJvY2VzcyBvZiBiZWluZyBjYWxsZWQuXG4gKlxuICogSWYgdGhlIGluamVjdG9yIGlzIGFza2VkIHRvIGluamVjdCBhIHRva2VuIHdpdGggaXRzIHZhbHVlIHNldCB0byBDSVJDVUxBUiwgdGhhdCBpbmRpY2F0ZXNcbiAqIGluamVjdGlvbiBvZiBhIGRlcGVuZGVuY3kgaGFzIHJlY3Vyc2l2ZWx5IGF0dGVtcHRlZCB0byBpbmplY3QgdGhlIG9yaWdpbmFsIHRva2VuLCBhbmQgdGhlcmUgaXNcbiAqIGEgY2lyY3VsYXIgZGVwZW5kZW5jeSBhbW9uZyB0aGUgcHJvdmlkZXJzLlxuICovXG5jb25zdCBDSVJDVUxBUiA9IHt9O1xuXG5jb25zdCBFTVBUWV9BUlJBWSA9IFtdIGFzIGFueVtdO1xuXG4vKipcbiAqIEEgbGF6aWx5IGluaXRpYWxpemVkIE51bGxJbmplY3Rvci5cbiAqL1xubGV0IE5VTExfSU5KRUNUT1I6IEluamVjdG9yfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gZ2V0TnVsbEluamVjdG9yKCk6IEluamVjdG9yIHtcbiAgaWYgKE5VTExfSU5KRUNUT1IgPT09IHVuZGVmaW5lZCkge1xuICAgIE5VTExfSU5KRUNUT1IgPSBuZXcgTnVsbEluamVjdG9yKCk7XG4gIH1cbiAgcmV0dXJuIE5VTExfSU5KRUNUT1I7XG59XG5cbi8qKlxuICogQW4gZW50cnkgaW4gdGhlIGluamVjdG9yIHdoaWNoIHRyYWNrcyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZ2l2ZW4gdG9rZW4sIGluY2x1ZGluZyBhIHBvc3NpYmxlXG4gKiBjdXJyZW50IHZhbHVlLlxuICovXG5pbnRlcmZhY2UgUmVjb3JkPFQ+IHtcbiAgZmFjdG9yeTogKCgpID0+IFQpfHVuZGVmaW5lZDtcbiAgdmFsdWU6IFR8e307XG4gIG11bHRpOiBhbnlbXXx1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IGBJbmplY3RvcmAgd2hpY2ggaXMgY29uZmlndXJlZCB1c2luZyBhIGBkZWZUeXBlYCBvZiBgSW5qZWN0b3JUeXBlPGFueT5gcy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJbmplY3RvcihcbiAgICBkZWZUeXBlOiAvKiBJbmplY3RvclR5cGU8YW55PiAqLyBhbnksIHBhcmVudDogSW5qZWN0b3IgfCBudWxsID0gbnVsbCxcbiAgICBhZGRpdGlvbmFsUHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdIHwgbnVsbCA9IG51bGwsIG5hbWU/OiBzdHJpbmcpOiBJbmplY3RvciB7XG4gIGNvbnN0IGluamVjdG9yID1cbiAgICAgIGNyZWF0ZUluamVjdG9yV2l0aG91dEluamVjdG9ySW5zdGFuY2VzKGRlZlR5cGUsIHBhcmVudCwgYWRkaXRpb25hbFByb3ZpZGVycywgbmFtZSk7XG4gIGluamVjdG9yLl9yZXNvbHZlSW5qZWN0b3JEZWZUeXBlcygpO1xuICByZXR1cm4gaW5qZWN0b3I7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpbmplY3RvciB3aXRob3V0IGVhZ2VybHkgcmVzb2x2aW5nIGl0cyBpbmplY3RvciB0eXBlcy4gQ2FuIGJlIHVzZWQgaW4gcGxhY2VzXG4gKiB3aGVyZSByZXNvbHZpbmcgdGhlIGluamVjdG9yIHR5cGVzIGltbWVkaWF0ZWx5IGNhbiBsZWFkIHRvIGFuIGluZmluaXRlIGxvb3AuIFRoZSBpbmplY3RvciB0eXBlc1xuICogc2hvdWxkIGJlIHJlc29sdmVkIGF0IGEgbGF0ZXIgcG9pbnQgYnkgY2FsbGluZyBgX3Jlc29sdmVJbmplY3RvckRlZlR5cGVzYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUluamVjdG9yV2l0aG91dEluamVjdG9ySW5zdGFuY2VzKFxuICAgIGRlZlR5cGU6IC8qIEluamVjdG9yVHlwZTxhbnk+ICovIGFueSwgcGFyZW50OiBJbmplY3RvciB8IG51bGwgPSBudWxsLFxuICAgIGFkZGl0aW9uYWxQcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10gfCBudWxsID0gbnVsbCwgbmFtZT86IHN0cmluZyk6IFIzSW5qZWN0b3Ige1xuICByZXR1cm4gbmV3IFIzSW5qZWN0b3IoZGVmVHlwZSwgYWRkaXRpb25hbFByb3ZpZGVycywgcGFyZW50IHx8IGdldE51bGxJbmplY3RvcigpLCBuYW1lKTtcbn1cblxuZXhwb3J0IGNsYXNzIFIzSW5qZWN0b3Ige1xuICAvKipcbiAgICogTWFwIG9mIHRva2VucyB0byByZWNvcmRzIHdoaWNoIGNvbnRhaW4gdGhlIGluc3RhbmNlcyBvZiB0aG9zZSB0b2tlbnMuXG4gICAqIC0gYG51bGxgIHZhbHVlIGltcGxpZXMgdGhhdCB3ZSBkb24ndCBoYXZlIHRoZSByZWNvcmQuIFVzZWQgYnkgdHJlZS1zaGFrYWJsZSBpbmplY3RvcnNcbiAgICogdG8gcHJldmVudCBmdXJ0aGVyIHNlYXJjaGVzLlxuICAgKi9cbiAgcHJpdmF0ZSByZWNvcmRzID0gbmV3IE1hcDxUeXBlPGFueT58SW5qZWN0aW9uVG9rZW48YW55PiwgUmVjb3JkPGFueT58bnVsbD4oKTtcblxuICAvKipcbiAgICogVGhlIHRyYW5zaXRpdmUgc2V0IG9mIGBJbmplY3RvclR5cGVgcyB3aGljaCBkZWZpbmUgdGhpcyBpbmplY3Rvci5cbiAgICovXG4gIHByaXZhdGUgaW5qZWN0b3JEZWZUeXBlcyA9IG5ldyBTZXQ8SW5qZWN0b3JUeXBlPGFueT4+KCk7XG5cbiAgLyoqXG4gICAqIFNldCBvZiB2YWx1ZXMgaW5zdGFudGlhdGVkIGJ5IHRoaXMgaW5qZWN0b3Igd2hpY2ggY29udGFpbiBgbmdPbkRlc3Ryb3lgIGxpZmVjeWNsZSBob29rcy5cbiAgICovXG4gIHByaXZhdGUgb25EZXN0cm95ID0gbmV3IFNldDxPbkRlc3Ryb3k+KCk7XG5cbiAgLyoqXG4gICAqIEZsYWcgaW5kaWNhdGluZyB0aGlzIGluamVjdG9yIHByb3ZpZGVzIHRoZSBBUFBfUk9PVF9TQ09QRSB0b2tlbiwgYW5kIHRodXMgY291bnRzIGFzIHRoZVxuICAgKiByb290IHNjb3BlLlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBzY29wZTogJ3Jvb3QnfCdwbGF0Zm9ybSd8bnVsbDtcblxuICByZWFkb25seSBzb3VyY2U6IHN0cmluZ3xudWxsO1xuXG4gIC8qKlxuICAgKiBGbGFnIGluZGljYXRpbmcgdGhhdCB0aGlzIGluamVjdG9yIHdhcyBwcmV2aW91c2x5IGRlc3Ryb3llZC5cbiAgICovXG4gIGdldCBkZXN0cm95ZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9kZXN0cm95ZWQ7IH1cbiAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBkZWY6IEluamVjdG9yVHlwZTxhbnk+LCBhZGRpdGlvbmFsUHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdfG51bGwsIHJlYWRvbmx5IHBhcmVudDogSW5qZWN0b3IsXG4gICAgICBzb3VyY2U6IHN0cmluZ3xudWxsID0gbnVsbCkge1xuICAgIGNvbnN0IGRlZHVwU3RhY2s6IEluamVjdG9yVHlwZTxhbnk+W10gPSBbXTtcblxuICAgIC8vIFN0YXJ0IG9mZiBieSBjcmVhdGluZyBSZWNvcmRzIGZvciBldmVyeSBwcm92aWRlciBkZWNsYXJlZCBpbiBldmVyeSBJbmplY3RvclR5cGVcbiAgICAvLyBpbmNsdWRlZCB0cmFuc2l0aXZlbHkgaW4gYWRkaXRpb25hbCBwcm92aWRlcnMgdGhlbiBkbyB0aGUgc2FtZSBmb3IgYGRlZmAuIFRoaXMgb3JkZXIgaXNcbiAgICAvLyBpbXBvcnRhbnQgYmVjYXVzZSBgZGVmYCBtYXkgaW5jbHVkZSBwcm92aWRlcnMgdGhhdCBvdmVycmlkZSBvbmVzIGluIGFkZGl0aW9uYWxQcm92aWRlcnMuXG4gICAgYWRkaXRpb25hbFByb3ZpZGVycyAmJiBkZWVwRm9yRWFjaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvdmlkZXJzLCBwcm92aWRlciA9PiB0aGlzLnByb2Nlc3NQcm92aWRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXIsIGRlZiwgYWRkaXRpb25hbFByb3ZpZGVycykpO1xuXG4gICAgZGVlcEZvckVhY2goW2RlZl0sIGluamVjdG9yRGVmID0+IHRoaXMucHJvY2Vzc0luamVjdG9yVHlwZShpbmplY3RvckRlZiwgW10sIGRlZHVwU3RhY2spKTtcblxuICAgIC8vIE1ha2Ugc3VyZSB0aGUgSU5KRUNUT1IgdG9rZW4gcHJvdmlkZXMgdGhpcyBpbmplY3Rvci5cbiAgICB0aGlzLnJlY29yZHMuc2V0KElOSkVDVE9SLCBtYWtlUmVjb3JkKHVuZGVmaW5lZCwgdGhpcykpO1xuXG4gICAgLy8gRGV0ZWN0IHdoZXRoZXIgdGhpcyBpbmplY3RvciBoYXMgdGhlIEFQUF9ST09UX1NDT1BFIHRva2VuIGFuZCB0aHVzIHNob3VsZCBwcm92aWRlXG4gICAgLy8gYW55IGluamVjdGFibGUgc2NvcGVkIHRvIEFQUF9ST09UX1NDT1BFLlxuICAgIGNvbnN0IHJlY29yZCA9IHRoaXMucmVjb3Jkcy5nZXQoSU5KRUNUT1JfU0NPUEUpO1xuICAgIHRoaXMuc2NvcGUgPSByZWNvcmQgIT0gbnVsbCA/IHJlY29yZC52YWx1ZSA6IG51bGw7XG5cbiAgICAvLyBTb3VyY2UgbmFtZSwgdXNlZCBmb3IgZGVidWdnaW5nXG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2UgfHwgKHR5cGVvZiBkZWYgPT09ICdvYmplY3QnID8gbnVsbCA6IHN0cmluZ2lmeShkZWYpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95IHRoZSBpbmplY3RvciBhbmQgcmVsZWFzZSByZWZlcmVuY2VzIHRvIGV2ZXJ5IGluc3RhbmNlIG9yIHByb3ZpZGVyIGFzc29jaWF0ZWQgd2l0aCBpdC5cbiAgICpcbiAgICogQWxzbyBjYWxscyB0aGUgYE9uRGVzdHJveWAgbGlmZWN5Y2xlIGhvb2tzIG9mIGV2ZXJ5IGluc3RhbmNlIHRoYXQgd2FzIGNyZWF0ZWQgZm9yIHdoaWNoIGFcbiAgICogaG9vayB3YXMgZm91bmQuXG4gICAqL1xuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuYXNzZXJ0Tm90RGVzdHJveWVkKCk7XG5cbiAgICAvLyBTZXQgZGVzdHJveWVkID0gdHJ1ZSBmaXJzdCwgaW4gY2FzZSBsaWZlY3ljbGUgaG9va3MgcmUtZW50ZXIgZGVzdHJveSgpLlxuICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIC8vIENhbGwgYWxsIHRoZSBsaWZlY3ljbGUgaG9va3MuXG4gICAgICB0aGlzLm9uRGVzdHJveS5mb3JFYWNoKHNlcnZpY2UgPT4gc2VydmljZS5uZ09uRGVzdHJveSgpKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgLy8gUmVsZWFzZSBhbGwgcmVmZXJlbmNlcy5cbiAgICAgIHRoaXMucmVjb3Jkcy5jbGVhcigpO1xuICAgICAgdGhpcy5vbkRlc3Ryb3kuY2xlYXIoKTtcbiAgICAgIHRoaXMuaW5qZWN0b3JEZWZUeXBlcy5jbGVhcigpO1xuICAgIH1cbiAgfVxuXG4gIGdldDxUPihcbiAgICAgIHRva2VuOiBUeXBlPFQ+fEluamVjdGlvblRva2VuPFQ+LCBub3RGb3VuZFZhbHVlOiBhbnkgPSBUSFJPV19JRl9OT1RfRk9VTkQsXG4gICAgICBmbGFncyA9IEluamVjdEZsYWdzLkRlZmF1bHQpOiBUIHtcbiAgICB0aGlzLmFzc2VydE5vdERlc3Ryb3llZCgpO1xuICAgIC8vIFNldCB0aGUgaW5qZWN0aW9uIGNvbnRleHQuXG4gICAgY29uc3QgcHJldmlvdXNJbmplY3RvciA9IHNldEN1cnJlbnRJbmplY3Rvcih0aGlzKTtcbiAgICB0cnkge1xuICAgICAgLy8gQ2hlY2sgZm9yIHRoZSBTa2lwU2VsZiBmbGFnLlxuICAgICAgaWYgKCEoZmxhZ3MgJiBJbmplY3RGbGFncy5Ta2lwU2VsZikpIHtcbiAgICAgICAgLy8gU2tpcFNlbGYgaXNuJ3Qgc2V0LCBjaGVjayBpZiB0aGUgcmVjb3JkIGJlbG9uZ3MgdG8gdGhpcyBpbmplY3Rvci5cbiAgICAgICAgbGV0IHJlY29yZDogUmVjb3JkPFQ+fHVuZGVmaW5lZHxudWxsID0gdGhpcy5yZWNvcmRzLmdldCh0b2tlbik7XG4gICAgICAgIGlmIChyZWNvcmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIE5vIHJlY29yZCwgYnV0IG1heWJlIHRoZSB0b2tlbiBpcyBzY29wZWQgdG8gdGhpcyBpbmplY3Rvci4gTG9vayBmb3IgYW4gaW5qZWN0YWJsZVxuICAgICAgICAgIC8vIGRlZiB3aXRoIGEgc2NvcGUgbWF0Y2hpbmcgdGhpcyBpbmplY3Rvci5cbiAgICAgICAgICBjb25zdCBkZWYgPSBjb3VsZEJlSW5qZWN0YWJsZVR5cGUodG9rZW4pICYmIGdldEluamVjdGFibGVEZWYodG9rZW4pO1xuICAgICAgICAgIGlmIChkZWYgJiYgdGhpcy5pbmplY3RhYmxlRGVmSW5TY29wZShkZWYpKSB7XG4gICAgICAgICAgICAvLyBGb3VuZCBhbiBpbmplY3RhYmxlIGRlZiBhbmQgaXQncyBzY29wZWQgdG8gdGhpcyBpbmplY3Rvci4gUHJldGVuZCBhcyBpZiBpdCB3YXMgaGVyZVxuICAgICAgICAgICAgLy8gYWxsIGFsb25nLlxuICAgICAgICAgICAgcmVjb3JkID0gbWFrZVJlY29yZChpbmplY3RhYmxlRGVmT3JJbmplY3RvckRlZkZhY3RvcnkodG9rZW4pLCBOT1RfWUVUKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVjb3JkID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5yZWNvcmRzLnNldCh0b2tlbiwgcmVjb3JkKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBhIHJlY29yZCB3YXMgZm91bmQsIGdldCB0aGUgaW5zdGFuY2UgZm9yIGl0IGFuZCByZXR1cm4gaXQuXG4gICAgICAgIGlmIChyZWNvcmQgIT0gbnVsbCAvKiBOT1QgbnVsbCB8fCB1bmRlZmluZWQgKi8pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5oeWRyYXRlKHRva2VuLCByZWNvcmQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNlbGVjdCB0aGUgbmV4dCBpbmplY3RvciBiYXNlZCBvbiB0aGUgU2VsZiBmbGFnIC0gaWYgc2VsZiBpcyBzZXQsIHRoZSBuZXh0IGluamVjdG9yIGlzXG4gICAgICAvLyB0aGUgTnVsbEluamVjdG9yLCBvdGhlcndpc2UgaXQncyB0aGUgcGFyZW50LlxuICAgICAgY29uc3QgbmV4dEluamVjdG9yID0gIShmbGFncyAmIEluamVjdEZsYWdzLlNlbGYpID8gdGhpcy5wYXJlbnQgOiBnZXROdWxsSW5qZWN0b3IoKTtcbiAgICAgIC8vIFNldCB0aGUgbm90Rm91bmRWYWx1ZSBiYXNlZCBvbiB0aGUgT3B0aW9uYWwgZmxhZyAtIGlmIG9wdGlvbmFsIGlzIHNldCBhbmQgbm90Rm91bmRWYWx1ZVxuICAgICAgLy8gaXMgdW5kZWZpbmVkLCB0aGUgdmFsdWUgaXMgbnVsbCwgb3RoZXJ3aXNlIGl0J3MgdGhlIG5vdEZvdW5kVmFsdWUuXG4gICAgICBub3RGb3VuZFZhbHVlID0gKGZsYWdzICYgSW5qZWN0RmxhZ3MuT3B0aW9uYWwpICYmIG5vdEZvdW5kVmFsdWUgPT09IFRIUk9XX0lGX05PVF9GT1VORCA/XG4gICAgICAgICAgbnVsbCA6XG4gICAgICAgICAgbm90Rm91bmRWYWx1ZTtcbiAgICAgIHJldHVybiBuZXh0SW5qZWN0b3IuZ2V0KHRva2VuLCBub3RGb3VuZFZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lID09PSAnTnVsbEluamVjdG9yRXJyb3InKSB7XG4gICAgICAgIGNvbnN0IHBhdGg6IGFueVtdID0gZVtOR19URU1QX1RPS0VOX1BBVEhdID0gZVtOR19URU1QX1RPS0VOX1BBVEhdIHx8IFtdO1xuICAgICAgICBwYXRoLnVuc2hpZnQoc3RyaW5naWZ5KHRva2VuKSk7XG4gICAgICAgIGlmIChwcmV2aW91c0luamVjdG9yKSB7XG4gICAgICAgICAgLy8gV2Ugc3RpbGwgaGF2ZSBhIHBhcmVudCBpbmplY3Rvciwga2VlcCB0aHJvd2luZ1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRm9ybWF0ICYgdGhyb3cgdGhlIGZpbmFsIGVycm9yIG1lc3NhZ2Ugd2hlbiB3ZSBkb24ndCBoYXZlIGFueSBwcmV2aW91cyBpbmplY3RvclxuICAgICAgICAgIHJldHVybiBjYXRjaEluamVjdG9yRXJyb3IoZSwgdG9rZW4sICdSM0luamVjdG9yRXJyb3InLCB0aGlzLnNvdXJjZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIExhc3RseSwgY2xlYW4gdXAgdGhlIHN0YXRlIGJ5IHJlc3RvcmluZyB0aGUgcHJldmlvdXMgaW5qZWN0b3IuXG4gICAgICBzZXRDdXJyZW50SW5qZWN0b3IocHJldmlvdXNJbmplY3Rvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVzb2x2ZUluamVjdG9yRGVmVHlwZXMoKSB7IHRoaXMuaW5qZWN0b3JEZWZUeXBlcy5mb3JFYWNoKGRlZlR5cGUgPT4gdGhpcy5nZXQoZGVmVHlwZSkpOyB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgY29uc3QgdG9rZW5zID0gPHN0cmluZ1tdPltdLCByZWNvcmRzID0gdGhpcy5yZWNvcmRzO1xuICAgIHJlY29yZHMuZm9yRWFjaCgodiwgdG9rZW4pID0+IHRva2Vucy5wdXNoKHN0cmluZ2lmeSh0b2tlbikpKTtcbiAgICByZXR1cm4gYFIzSW5qZWN0b3JbJHt0b2tlbnMuam9pbignLCAnKX1dYDtcbiAgfVxuXG4gIHByaXZhdGUgYXNzZXJ0Tm90RGVzdHJveWVkKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9kZXN0cm95ZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW5qZWN0b3IgaGFzIGFscmVhZHkgYmVlbiBkZXN0cm95ZWQuJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBgSW5qZWN0b3JUeXBlYCBvciBgSW5qZWN0b3JUeXBlV2l0aFByb3ZpZGVyc2AgYW5kIGFsbCBvZiBpdHMgdHJhbnNpdGl2ZSBwcm92aWRlcnNcbiAgICogdG8gdGhpcyBpbmplY3Rvci5cbiAgICpcbiAgICogSWYgYW4gYEluamVjdG9yVHlwZVdpdGhQcm92aWRlcnNgIHRoYXQgZGVjbGFyZXMgcHJvdmlkZXJzIGJlc2lkZXMgdGhlIHR5cGUgaXMgc3BlY2lmaWVkLFxuICAgKiB0aGUgZnVuY3Rpb24gd2lsbCByZXR1cm4gXCJ0cnVlXCIgdG8gaW5kaWNhdGUgdGhhdCB0aGUgcHJvdmlkZXJzIG9mIHRoZSB0eXBlIGRlZmluaXRpb24gbmVlZFxuICAgKiB0byBiZSBwcm9jZXNzZWQuIFRoaXMgYWxsb3dzIHVzIHRvIHByb2Nlc3MgcHJvdmlkZXJzIG9mIGluamVjdG9yIHR5cGVzIGFmdGVyIGFsbCBpbXBvcnRzIG9mXG4gICAqIGFuIGluamVjdG9yIGRlZmluaXRpb24gYXJlIHByb2Nlc3NlZC4gKGZvbGxvd2luZyBWaWV3IEVuZ2luZSBzZW1hbnRpY3M6IHNlZSBGVy0xMzQ5KVxuICAgKi9cbiAgcHJpdmF0ZSBwcm9jZXNzSW5qZWN0b3JUeXBlKFxuICAgICAgZGVmT3JXcmFwcGVkRGVmOiBJbmplY3RvclR5cGU8YW55PnxJbmplY3RvclR5cGVXaXRoUHJvdmlkZXJzPGFueT4sXG4gICAgICBwYXJlbnRzOiBJbmplY3RvclR5cGU8YW55PltdLFxuICAgICAgZGVkdXBTdGFjazogSW5qZWN0b3JUeXBlPGFueT5bXSk6IGRlZk9yV3JhcHBlZERlZiBpcyBJbmplY3RvclR5cGVXaXRoUHJvdmlkZXJzPGFueT4ge1xuICAgIGRlZk9yV3JhcHBlZERlZiA9IHJlc29sdmVGb3J3YXJkUmVmKGRlZk9yV3JhcHBlZERlZik7XG4gICAgaWYgKCFkZWZPcldyYXBwZWREZWYpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIEVpdGhlciB0aGUgZGVmT3JXcmFwcGVkRGVmIGlzIGFuIEluamVjdG9yVHlwZSAod2l0aCBpbmplY3RvciBkZWYpIG9yIGFuXG4gICAgLy8gSW5qZWN0b3JEZWZUeXBlV2l0aFByb3ZpZGVycyAoYWthIE1vZHVsZVdpdGhQcm92aWRlcnMpLiBEZXRlY3RpbmcgZWl0aGVyIGlzIGEgbWVnYW1vcnBoaWNcbiAgICAvLyByZWFkLCBzbyBjYXJlIGlzIHRha2VuIHRvIG9ubHkgZG8gdGhlIHJlYWQgb25jZS5cblxuICAgIC8vIEZpcnN0IGF0dGVtcHQgdG8gcmVhZCB0aGUgaW5qZWN0b3IgZGVmIChgybVpbmpgKS5cbiAgICBsZXQgZGVmID0gZ2V0SW5qZWN0b3JEZWYoZGVmT3JXcmFwcGVkRGVmKTtcblxuICAgIC8vIElmIHRoYXQncyBub3QgcHJlc2VudCwgdGhlbiBhdHRlbXB0IHRvIHJlYWQgbmdNb2R1bGUgZnJvbSB0aGUgSW5qZWN0b3JEZWZUeXBlV2l0aFByb3ZpZGVycy5cbiAgICBjb25zdCBuZ01vZHVsZSA9XG4gICAgICAgIChkZWYgPT0gbnVsbCkgJiYgKGRlZk9yV3JhcHBlZERlZiBhcyBJbmplY3RvclR5cGVXaXRoUHJvdmlkZXJzPGFueT4pLm5nTW9kdWxlIHx8IHVuZGVmaW5lZDtcblxuICAgIC8vIERldGVybWluZSB0aGUgSW5qZWN0b3JUeXBlLiBJbiB0aGUgY2FzZSB3aGVyZSBgZGVmT3JXcmFwcGVkRGVmYCBpcyBhbiBgSW5qZWN0b3JUeXBlYCxcbiAgICAvLyB0aGVuIHRoaXMgaXMgZWFzeS4gSW4gdGhlIGNhc2Ugb2YgYW4gSW5qZWN0b3JEZWZUeXBlV2l0aFByb3ZpZGVycywgdGhlbiB0aGUgZGVmaW5pdGlvbiB0eXBlXG4gICAgLy8gaXMgdGhlIGBuZ01vZHVsZWAuXG4gICAgY29uc3QgZGVmVHlwZTogSW5qZWN0b3JUeXBlPGFueT4gPVxuICAgICAgICAobmdNb2R1bGUgPT09IHVuZGVmaW5lZCkgPyAoZGVmT3JXcmFwcGVkRGVmIGFzIEluamVjdG9yVHlwZTxhbnk+KSA6IG5nTW9kdWxlO1xuXG4gICAgLy8gQ2hlY2sgZm9yIGNpcmN1bGFyIGRlcGVuZGVuY2llcy5cbiAgICBpZiAobmdEZXZNb2RlICYmIHBhcmVudHMuaW5kZXhPZihkZWZUeXBlKSAhPT0gLTEpIHtcbiAgICAgIGNvbnN0IGRlZk5hbWUgPSBzdHJpbmdpZnkoZGVmVHlwZSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYENpcmN1bGFyIGRlcGVuZGVuY3kgaW4gREkgZGV0ZWN0ZWQgZm9yIHR5cGUgJHtkZWZOYW1lfS4gRGVwZW5kZW5jeSBwYXRoOiAke3BhcmVudHMubWFwKGRlZlR5cGUgPT4gc3RyaW5naWZ5KGRlZlR5cGUpKS5qb2luKCcgPiAnKX0gPiAke2RlZk5hbWV9LmApO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBtdWx0aXBsZSBpbXBvcnRzIG9mIHRoZSBzYW1lIG1vZHVsZVxuICAgIGNvbnN0IGlzRHVwbGljYXRlID0gZGVkdXBTdGFjay5pbmRleE9mKGRlZlR5cGUpICE9PSAtMTtcblxuICAgIC8vIEZpbmFsbHksIGlmIGRlZk9yV3JhcHBlZFR5cGUgd2FzIGFuIGBJbmplY3RvckRlZlR5cGVXaXRoUHJvdmlkZXJzYCwgdGhlbiB0aGUgYWN0dWFsXG4gICAgLy8gYEluamVjdG9yRGVmYCBpcyBvbiBpdHMgYG5nTW9kdWxlYC5cbiAgICBpZiAobmdNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZGVmID0gZ2V0SW5qZWN0b3JEZWYobmdNb2R1bGUpO1xuICAgIH1cblxuICAgIC8vIElmIG5vIGRlZmluaXRpb24gd2FzIGZvdW5kLCBpdCBtaWdodCBiZSBmcm9tIGV4cG9ydHMuIFJlbW92ZSBpdC5cbiAgICBpZiAoZGVmID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBBZGQgcHJvdmlkZXJzIGluIHRoZSBzYW1lIHdheSB0aGF0IEBOZ01vZHVsZSByZXNvbHV0aW9uIGRpZDpcblxuICAgIC8vIEZpcnN0LCBpbmNsdWRlIHByb3ZpZGVycyBmcm9tIGFueSBpbXBvcnRzLlxuICAgIGlmIChkZWYuaW1wb3J0cyAhPSBudWxsICYmICFpc0R1cGxpY2F0ZSkge1xuICAgICAgLy8gQmVmb3JlIHByb2Nlc3NpbmcgZGVmVHlwZSdzIGltcG9ydHMsIGFkZCBpdCB0byB0aGUgc2V0IG9mIHBhcmVudHMuIFRoaXMgd2F5LCBpZiBpdCBlbmRzXG4gICAgICAvLyB1cCBkZWVwbHkgaW1wb3J0aW5nIGl0c2VsZiwgdGhpcyBjYW4gYmUgZGV0ZWN0ZWQuXG4gICAgICBuZ0Rldk1vZGUgJiYgcGFyZW50cy5wdXNoKGRlZlR5cGUpO1xuICAgICAgLy8gQWRkIGl0IHRvIHRoZSBzZXQgb2YgZGVkdXBzLiBUaGlzIHdheSB3ZSBjYW4gZGV0ZWN0IG11bHRpcGxlIGltcG9ydHMgb2YgdGhlIHNhbWUgbW9kdWxlXG4gICAgICBkZWR1cFN0YWNrLnB1c2goZGVmVHlwZSk7XG5cbiAgICAgIGxldCBpbXBvcnRUeXBlc1dpdGhQcm92aWRlcnM6IChJbmplY3RvclR5cGVXaXRoUHJvdmlkZXJzPGFueT5bXSl8dW5kZWZpbmVkO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGVlcEZvckVhY2goZGVmLmltcG9ydHMsIGltcG9ydGVkID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5wcm9jZXNzSW5qZWN0b3JUeXBlKGltcG9ydGVkLCBwYXJlbnRzLCBkZWR1cFN0YWNrKSkge1xuICAgICAgICAgICAgaWYgKGltcG9ydFR5cGVzV2l0aFByb3ZpZGVycyA9PT0gdW5kZWZpbmVkKSBpbXBvcnRUeXBlc1dpdGhQcm92aWRlcnMgPSBbXTtcbiAgICAgICAgICAgIC8vIElmIHRoZSBwcm9jZXNzZWQgaW1wb3J0IGlzIGFuIGluamVjdG9yIHR5cGUgd2l0aCBwcm92aWRlcnMsIHdlIHN0b3JlIGl0IGluIHRoZVxuICAgICAgICAgICAgLy8gbGlzdCBvZiBpbXBvcnQgdHlwZXMgd2l0aCBwcm92aWRlcnMsIHNvIHRoYXQgd2UgY2FuIHByb2Nlc3MgdGhvc2UgYWZ0ZXJ3YXJkcy5cbiAgICAgICAgICAgIGltcG9ydFR5cGVzV2l0aFByb3ZpZGVycy5wdXNoKGltcG9ydGVkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgLy8gUmVtb3ZlIGl0IGZyb20gdGhlIHBhcmVudHMgc2V0IHdoZW4gZmluaXNoZWQuXG4gICAgICAgIG5nRGV2TW9kZSAmJiBwYXJlbnRzLnBvcCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBJbXBvcnRzIHdoaWNoIGFyZSBkZWNsYXJlZCB3aXRoIHByb3ZpZGVycyAoVHlwZVdpdGhQcm92aWRlcnMpIG5lZWQgdG8gYmUgcHJvY2Vzc2VkXG4gICAgICAvLyBhZnRlciBhbGwgaW1wb3J0ZWQgbW9kdWxlcyBhcmUgcHJvY2Vzc2VkLiBUaGlzIGlzIHNpbWlsYXIgdG8gaG93IFZpZXcgRW5naW5lXG4gICAgICAvLyBwcm9jZXNzZXMvbWVyZ2VzIG1vZHVsZSBpbXBvcnRzIGluIHRoZSBtZXRhZGF0YSByZXNvbHZlci4gU2VlOiBGVy0xMzQ5LlxuICAgICAgaWYgKGltcG9ydFR5cGVzV2l0aFByb3ZpZGVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW1wb3J0VHlwZXNXaXRoUHJvdmlkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3Qge25nTW9kdWxlLCBwcm92aWRlcnN9ID0gaW1wb3J0VHlwZXNXaXRoUHJvdmlkZXJzW2ldO1xuICAgICAgICAgIGRlZXBGb3JFYWNoKFxuICAgICAgICAgICAgICBwcm92aWRlcnMgISxcbiAgICAgICAgICAgICAgcHJvdmlkZXIgPT4gdGhpcy5wcm9jZXNzUHJvdmlkZXIocHJvdmlkZXIsIG5nTW9kdWxlLCBwcm92aWRlcnMgfHwgRU1QVFlfQVJSQVkpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBUcmFjayB0aGUgSW5qZWN0b3JUeXBlIGFuZCBhZGQgYSBwcm92aWRlciBmb3IgaXQuIEl0J3MgaW1wb3J0YW50IHRoYXQgdGhpcyBpcyBkb25lIGFmdGVyIHRoZVxuICAgIC8vIGRlZidzIGltcG9ydHMuXG4gICAgdGhpcy5pbmplY3RvckRlZlR5cGVzLmFkZChkZWZUeXBlKTtcbiAgICB0aGlzLnJlY29yZHMuc2V0KGRlZlR5cGUsIG1ha2VSZWNvcmQoZGVmLmZhY3RvcnksIE5PVF9ZRVQpKTtcblxuICAgIC8vIE5leHQsIGluY2x1ZGUgcHJvdmlkZXJzIGxpc3RlZCBvbiB0aGUgZGVmaW5pdGlvbiBpdHNlbGYuXG4gICAgY29uc3QgZGVmUHJvdmlkZXJzID0gZGVmLnByb3ZpZGVycztcbiAgICBpZiAoZGVmUHJvdmlkZXJzICE9IG51bGwgJiYgIWlzRHVwbGljYXRlKSB7XG4gICAgICBjb25zdCBpbmplY3RvclR5cGUgPSBkZWZPcldyYXBwZWREZWYgYXMgSW5qZWN0b3JUeXBlPGFueT47XG4gICAgICBkZWVwRm9yRWFjaChcbiAgICAgICAgICBkZWZQcm92aWRlcnMsIHByb3ZpZGVyID0+IHRoaXMucHJvY2Vzc1Byb3ZpZGVyKHByb3ZpZGVyLCBpbmplY3RvclR5cGUsIGRlZlByb3ZpZGVycykpO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICAgIG5nTW9kdWxlICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgKGRlZk9yV3JhcHBlZERlZiBhcyBJbmplY3RvclR5cGVXaXRoUHJvdmlkZXJzPGFueT4pLnByb3ZpZGVycyAhPT0gdW5kZWZpbmVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzIGEgYFNpbmdsZVByb3ZpZGVyYCBhbmQgYWRkIGl0LlxuICAgKi9cbiAgcHJpdmF0ZSBwcm9jZXNzUHJvdmlkZXIoXG4gICAgICBwcm92aWRlcjogU2luZ2xlUHJvdmlkZXIsIG5nTW9kdWxlVHlwZTogSW5qZWN0b3JUeXBlPGFueT4sIHByb3ZpZGVyczogYW55W10pOiB2b2lkIHtcbiAgICAvLyBEZXRlcm1pbmUgdGhlIHRva2VuIGZyb20gdGhlIHByb3ZpZGVyLiBFaXRoZXIgaXQncyBpdHMgb3duIHRva2VuLCBvciBoYXMgYSB7cHJvdmlkZTogLi4ufVxuICAgIC8vIHByb3BlcnR5LlxuICAgIHByb3ZpZGVyID0gcmVzb2x2ZUZvcndhcmRSZWYocHJvdmlkZXIpO1xuICAgIGxldCB0b2tlbjogYW55ID1cbiAgICAgICAgaXNUeXBlUHJvdmlkZXIocHJvdmlkZXIpID8gcHJvdmlkZXIgOiByZXNvbHZlRm9yd2FyZFJlZihwcm92aWRlciAmJiBwcm92aWRlci5wcm92aWRlKTtcblxuICAgIC8vIENvbnN0cnVjdCBhIGBSZWNvcmRgIGZvciB0aGUgcHJvdmlkZXIuXG4gICAgY29uc3QgcmVjb3JkID0gcHJvdmlkZXJUb1JlY29yZChwcm92aWRlciwgbmdNb2R1bGVUeXBlLCBwcm92aWRlcnMpO1xuXG4gICAgaWYgKCFpc1R5cGVQcm92aWRlcihwcm92aWRlcikgJiYgcHJvdmlkZXIubXVsdGkgPT09IHRydWUpIHtcbiAgICAgIC8vIElmIHRoZSBwcm92aWRlciBpbmRpY2F0ZXMgdGhhdCBpdCdzIGEgbXVsdGktcHJvdmlkZXIsIHByb2Nlc3MgaXQgc3BlY2lhbGx5LlxuICAgICAgLy8gRmlyc3QgY2hlY2sgd2hldGhlciBpdCdzIGJlZW4gZGVmaW5lZCBhbHJlYWR5LlxuICAgICAgbGV0IG11bHRpUmVjb3JkID0gdGhpcy5yZWNvcmRzLmdldCh0b2tlbik7XG4gICAgICBpZiAobXVsdGlSZWNvcmQpIHtcbiAgICAgICAgLy8gSXQgaGFzLiBUaHJvdyBhIG5pY2UgZXJyb3IgaWZcbiAgICAgICAgaWYgKG11bHRpUmVjb3JkLm11bHRpID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aHJvd01peGVkTXVsdGlQcm92aWRlckVycm9yKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG11bHRpUmVjb3JkID0gbWFrZVJlY29yZCh1bmRlZmluZWQsIE5PVF9ZRVQsIHRydWUpO1xuICAgICAgICBtdWx0aVJlY29yZC5mYWN0b3J5ID0gKCkgPT4gaW5qZWN0QXJncyhtdWx0aVJlY29yZCAhLm11bHRpICEpO1xuICAgICAgICB0aGlzLnJlY29yZHMuc2V0KHRva2VuLCBtdWx0aVJlY29yZCk7XG4gICAgICB9XG4gICAgICB0b2tlbiA9IHByb3ZpZGVyO1xuICAgICAgbXVsdGlSZWNvcmQubXVsdGkgIS5wdXNoKHByb3ZpZGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSB0aGlzLnJlY29yZHMuZ2V0KHRva2VuKTtcbiAgICAgIGlmIChleGlzdGluZyAmJiBleGlzdGluZy5tdWx0aSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93TWl4ZWRNdWx0aVByb3ZpZGVyRXJyb3IoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5yZWNvcmRzLnNldCh0b2tlbiwgcmVjb3JkKTtcbiAgfVxuXG4gIHByaXZhdGUgaHlkcmF0ZTxUPih0b2tlbjogVHlwZTxUPnxJbmplY3Rpb25Ub2tlbjxUPiwgcmVjb3JkOiBSZWNvcmQ8VD4pOiBUIHtcbiAgICBpZiAocmVjb3JkLnZhbHVlID09PSBDSVJDVUxBUikge1xuICAgICAgdGhyb3dDeWNsaWNEZXBlbmRlbmN5RXJyb3Ioc3RyaW5naWZ5KHRva2VuKSk7XG4gICAgfSBlbHNlIGlmIChyZWNvcmQudmFsdWUgPT09IE5PVF9ZRVQpIHtcbiAgICAgIHJlY29yZC52YWx1ZSA9IENJUkNVTEFSO1xuICAgICAgcmVjb3JkLnZhbHVlID0gcmVjb3JkLmZhY3RvcnkgISgpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHJlY29yZC52YWx1ZSA9PT0gJ29iamVjdCcgJiYgcmVjb3JkLnZhbHVlICYmIGhhc09uRGVzdHJveShyZWNvcmQudmFsdWUpKSB7XG4gICAgICB0aGlzLm9uRGVzdHJveS5hZGQocmVjb3JkLnZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlY29yZC52YWx1ZSBhcyBUO1xuICB9XG5cbiAgcHJpdmF0ZSBpbmplY3RhYmxlRGVmSW5TY29wZShkZWY6IMm1ybVJbmplY3RhYmxlRGVmPGFueT4pOiBib29sZWFuIHtcbiAgICBpZiAoIWRlZi5wcm92aWRlZEluKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmLnByb3ZpZGVkSW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gZGVmLnByb3ZpZGVkSW4gPT09ICdhbnknIHx8IChkZWYucHJvdmlkZWRJbiA9PT0gdGhpcy5zY29wZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmluamVjdG9yRGVmVHlwZXMuaGFzKGRlZi5wcm92aWRlZEluKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5qZWN0YWJsZURlZk9ySW5qZWN0b3JEZWZGYWN0b3J5KHRva2VuOiBUeXBlPGFueT58IEluamVjdGlvblRva2VuPGFueT4pOiBGYWN0b3J5Rm48YW55PiB7XG4gIC8vIE1vc3QgdG9rZW5zIHdpbGwgaGF2ZSBhbiBpbmplY3RhYmxlIGRlZiBkaXJlY3RseSBvbiB0aGVtLCB3aGljaCBzcGVjaWZpZXMgYSBmYWN0b3J5IGRpcmVjdGx5LlxuICBjb25zdCBpbmplY3RhYmxlRGVmID0gZ2V0SW5qZWN0YWJsZURlZih0b2tlbik7XG4gIGNvbnN0IGZhY3RvcnkgPSBpbmplY3RhYmxlRGVmICE9PSBudWxsID8gaW5qZWN0YWJsZURlZi5mYWN0b3J5IDogZ2V0RmFjdG9yeURlZih0b2tlbik7XG5cbiAgaWYgKGZhY3RvcnkgIT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFjdG9yeTtcbiAgfVxuXG4gIC8vIElmIHRoZSB0b2tlbiBpcyBhbiBOZ01vZHVsZSwgaXQncyBhbHNvIGluamVjdGFibGUgYnV0IHRoZSBmYWN0b3J5IGlzIG9uIGl0cyBpbmplY3RvciBkZWZcbiAgLy8gKGDJtWluamApXG4gIGNvbnN0IGluamVjdG9yRGVmID0gZ2V0SW5qZWN0b3JEZWYodG9rZW4pO1xuICBpZiAoaW5qZWN0b3JEZWYgIT09IG51bGwpIHtcbiAgICByZXR1cm4gaW5qZWN0b3JEZWYuZmFjdG9yeTtcbiAgfVxuXG4gIC8vIEluamVjdGlvblRva2VucyBzaG91bGQgaGF2ZSBhbiBpbmplY3RhYmxlIGRlZiAoybVwcm92KSBhbmQgdGh1cyBzaG91bGQgYmUgaGFuZGxlZCBhYm92ZS5cbiAgLy8gSWYgaXQncyBtaXNzaW5nIHRoYXQsIGl0J3MgYW4gZXJyb3IuXG4gIGlmICh0b2tlbiBpbnN0YW5jZW9mIEluamVjdGlvblRva2VuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBUb2tlbiAke3N0cmluZ2lmeSh0b2tlbil9IGlzIG1pc3NpbmcgYSDJtXByb3YgZGVmaW5pdGlvbi5gKTtcbiAgfVxuXG4gIC8vIFVuZGVjb3JhdGVkIHR5cGVzIGNhbiBzb21ldGltZXMgYmUgY3JlYXRlZCBpZiB0aGV5IGhhdmUgbm8gY29uc3RydWN0b3IgYXJndW1lbnRzLlxuICBpZiAodG9rZW4gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgIHJldHVybiBnZXRVbmRlY29yYXRlZEluamVjdGFibGVGYWN0b3J5KHRva2VuKTtcbiAgfVxuXG4gIC8vIFRoZXJlIHdhcyBubyB3YXkgdG8gcmVzb2x2ZSBhIGZhY3RvcnkgZm9yIHRoaXMgdG9rZW4uXG4gIHRocm93IG5ldyBFcnJvcigndW5yZWFjaGFibGUnKTtcbn1cblxuZnVuY3Rpb24gZ2V0VW5kZWNvcmF0ZWRJbmplY3RhYmxlRmFjdG9yeSh0b2tlbjogRnVuY3Rpb24pIHtcbiAgLy8gSWYgdGhlIHRva2VuIGhhcyBwYXJhbWV0ZXJzIHRoZW4gaXQgaGFzIGRlcGVuZGVuY2llcyB0aGF0IHdlIGNhbm5vdCByZXNvbHZlIGltcGxpY2l0bHkuXG4gIGNvbnN0IHBhcmFtTGVuZ3RoID0gdG9rZW4ubGVuZ3RoO1xuICBpZiAocGFyYW1MZW5ndGggPiAwKSB7XG4gICAgY29uc3QgYXJnczogc3RyaW5nW10gPSBuZXdBcnJheShwYXJhbUxlbmd0aCwgJz8nKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IHJlc29sdmUgYWxsIHBhcmFtZXRlcnMgZm9yICR7c3RyaW5naWZ5KHRva2VuKX06ICgke2FyZ3Muam9pbignLCAnKX0pLmApO1xuICB9XG5cbiAgLy8gVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGFwcGVhcnMgdG8gaGF2ZSBubyBwYXJhbWV0ZXJzLlxuICAvLyBUaGlzIG1pZ2h0IGJlIGJlY2F1c2UgaXQgaW5oZXJpdHMgZnJvbSBhIHN1cGVyLWNsYXNzLiBJbiB3aGljaCBjYXNlLCB1c2UgYW4gaW5qZWN0YWJsZVxuICAvLyBkZWYgZnJvbSBhbiBhbmNlc3RvciBpZiB0aGVyZSBpcyBvbmUuXG4gIC8vIE90aGVyd2lzZSB0aGlzIHJlYWxseSBpcyBhIHNpbXBsZSBjbGFzcyB3aXRoIG5vIGRlcGVuZGVuY2llcywgc28gcmV0dXJuIGEgZmFjdG9yeSB0aGF0XG4gIC8vIGp1c3QgaW5zdGFudGlhdGVzIHRoZSB6ZXJvLWFyZyBjb25zdHJ1Y3Rvci5cbiAgY29uc3QgaW5oZXJpdGVkSW5qZWN0YWJsZURlZiA9IGdldEluaGVyaXRlZEluamVjdGFibGVEZWYodG9rZW4pO1xuICBpZiAoaW5oZXJpdGVkSW5qZWN0YWJsZURlZiAhPT0gbnVsbCkge1xuICAgIHJldHVybiAoKSA9PiBpbmhlcml0ZWRJbmplY3RhYmxlRGVmLmZhY3RvcnkodG9rZW4gYXMgVHlwZTxhbnk+KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKCkgPT4gbmV3ICh0b2tlbiBhcyBUeXBlPGFueT4pKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvdmlkZXJUb1JlY29yZChcbiAgICBwcm92aWRlcjogU2luZ2xlUHJvdmlkZXIsIG5nTW9kdWxlVHlwZTogSW5qZWN0b3JUeXBlPGFueT4sIHByb3ZpZGVyczogYW55W10pOiBSZWNvcmQ8YW55PiB7XG4gIGlmIChpc1ZhbHVlUHJvdmlkZXIocHJvdmlkZXIpKSB7XG4gICAgcmV0dXJuIG1ha2VSZWNvcmQodW5kZWZpbmVkLCBwcm92aWRlci51c2VWYWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZmFjdG9yeTogKCgpID0+IGFueSl8dW5kZWZpbmVkID0gcHJvdmlkZXJUb0ZhY3RvcnkocHJvdmlkZXIsIG5nTW9kdWxlVHlwZSwgcHJvdmlkZXJzKTtcbiAgICByZXR1cm4gbWFrZVJlY29yZChmYWN0b3J5LCBOT1RfWUVUKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgYFNpbmdsZVByb3ZpZGVyYCBpbnRvIGEgZmFjdG9yeSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gcHJvdmlkZXIgcHJvdmlkZXIgdG8gY29udmVydCB0byBmYWN0b3J5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlclRvRmFjdG9yeShcbiAgICBwcm92aWRlcjogU2luZ2xlUHJvdmlkZXIsIG5nTW9kdWxlVHlwZT86IEluamVjdG9yVHlwZTxhbnk+LCBwcm92aWRlcnM/OiBhbnlbXSk6ICgpID0+IGFueSB7XG4gIGxldCBmYWN0b3J5OiAoKCkgPT4gYW55KXx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGlmIChpc1R5cGVQcm92aWRlcihwcm92aWRlcikpIHtcbiAgICBjb25zdCB1bndyYXBwZWRQcm92aWRlciA9IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyKTtcbiAgICByZXR1cm4gZ2V0RmFjdG9yeURlZih1bndyYXBwZWRQcm92aWRlcikgfHwgaW5qZWN0YWJsZURlZk9ySW5qZWN0b3JEZWZGYWN0b3J5KHVud3JhcHBlZFByb3ZpZGVyKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaXNWYWx1ZVByb3ZpZGVyKHByb3ZpZGVyKSkge1xuICAgICAgZmFjdG9yeSA9ICgpID0+IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyLnVzZVZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKGlzRmFjdG9yeVByb3ZpZGVyKHByb3ZpZGVyKSkge1xuICAgICAgZmFjdG9yeSA9ICgpID0+IHByb3ZpZGVyLnVzZUZhY3RvcnkoLi4uaW5qZWN0QXJncyhwcm92aWRlci5kZXBzIHx8IFtdKSk7XG4gICAgfSBlbHNlIGlmIChpc0V4aXN0aW5nUHJvdmlkZXIocHJvdmlkZXIpKSB7XG4gICAgICBmYWN0b3J5ID0gKCkgPT4gybXJtWluamVjdChyZXNvbHZlRm9yd2FyZFJlZihwcm92aWRlci51c2VFeGlzdGluZykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjbGFzc1JlZiA9IHJlc29sdmVGb3J3YXJkUmVmKFxuICAgICAgICAgIHByb3ZpZGVyICYmXG4gICAgICAgICAgKChwcm92aWRlciBhcyBTdGF0aWNDbGFzc1Byb3ZpZGVyIHwgQ2xhc3NQcm92aWRlcikudXNlQ2xhc3MgfHwgcHJvdmlkZXIucHJvdmlkZSkpO1xuICAgICAgaWYgKCFjbGFzc1JlZikge1xuICAgICAgICB0aHJvd0ludmFsaWRQcm92aWRlckVycm9yKG5nTW9kdWxlVHlwZSwgcHJvdmlkZXJzLCBwcm92aWRlcik7XG4gICAgICB9XG4gICAgICBpZiAoaGFzRGVwcyhwcm92aWRlcikpIHtcbiAgICAgICAgZmFjdG9yeSA9ICgpID0+IG5ldyAoY2xhc3NSZWYpKC4uLmluamVjdEFyZ3MocHJvdmlkZXIuZGVwcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGdldEZhY3RvcnlEZWYoY2xhc3NSZWYpIHx8IGluamVjdGFibGVEZWZPckluamVjdG9yRGVmRmFjdG9yeShjbGFzc1JlZik7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWN0b3J5O1xufVxuXG5mdW5jdGlvbiBtYWtlUmVjb3JkPFQ+KFxuICAgIGZhY3Rvcnk6ICgoKSA9PiBUKSB8IHVuZGVmaW5lZCwgdmFsdWU6IFQgfCB7fSwgbXVsdGk6IGJvb2xlYW4gPSBmYWxzZSk6IFJlY29yZDxUPiB7XG4gIHJldHVybiB7XG4gICAgZmFjdG9yeTogZmFjdG9yeSxcbiAgICB2YWx1ZTogdmFsdWUsXG4gICAgbXVsdGk6IG11bHRpID8gW10gOiB1bmRlZmluZWQsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGlzVmFsdWVQcm92aWRlcih2YWx1ZTogU2luZ2xlUHJvdmlkZXIpOiB2YWx1ZSBpcyBWYWx1ZVByb3ZpZGVyIHtcbiAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiBVU0VfVkFMVUUgaW4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGlzRXhpc3RpbmdQcm92aWRlcih2YWx1ZTogU2luZ2xlUHJvdmlkZXIpOiB2YWx1ZSBpcyBFeGlzdGluZ1Byb3ZpZGVyIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmICh2YWx1ZSBhcyBFeGlzdGluZ1Byb3ZpZGVyKS51c2VFeGlzdGluZyk7XG59XG5cbmZ1bmN0aW9uIGlzRmFjdG9yeVByb3ZpZGVyKHZhbHVlOiBTaW5nbGVQcm92aWRlcik6IHZhbHVlIGlzIEZhY3RvcnlQcm92aWRlciB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiAodmFsdWUgYXMgRmFjdG9yeVByb3ZpZGVyKS51c2VGYWN0b3J5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVHlwZVByb3ZpZGVyKHZhbHVlOiBTaW5nbGVQcm92aWRlcik6IHZhbHVlIGlzIFR5cGVQcm92aWRlciB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NsYXNzUHJvdmlkZXIodmFsdWU6IFNpbmdsZVByb3ZpZGVyKTogdmFsdWUgaXMgQ2xhc3NQcm92aWRlciB7XG4gIHJldHVybiAhISh2YWx1ZSBhcyBTdGF0aWNDbGFzc1Byb3ZpZGVyIHwgQ2xhc3NQcm92aWRlcikudXNlQ2xhc3M7XG59XG5cbmZ1bmN0aW9uIGhhc0RlcHModmFsdWU6IENsYXNzUHJvdmlkZXIgfCBDb25zdHJ1Y3RvclByb3ZpZGVyIHwgU3RhdGljQ2xhc3NQcm92aWRlcik6XG4gICAgdmFsdWUgaXMgQ2xhc3NQcm92aWRlciZ7ZGVwczogYW55W119IHtcbiAgcmV0dXJuICEhKHZhbHVlIGFzIGFueSkuZGVwcztcbn1cblxuZnVuY3Rpb24gaGFzT25EZXN0cm95KHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBPbkRlc3Ryb3kge1xuICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mKHZhbHVlIGFzIE9uRGVzdHJveSkubmdPbkRlc3Ryb3kgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGNvdWxkQmVJbmplY3RhYmxlVHlwZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgVHlwZTxhbnk+fEluamVjdGlvblRva2VuPGFueT4ge1xuICByZXR1cm4gKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykgfHxcbiAgICAgICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlIGluc3RhbmNlb2YgSW5qZWN0aW9uVG9rZW4pO1xufVxuIl19