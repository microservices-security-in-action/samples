/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/render3/ng_module_ref.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector } from '../di/injector';
import { INJECTOR } from '../di/injector_compatibility';
import { InjectFlags } from '../di/interface/injector';
import { createInjectorWithoutInjectorInstances } from '../di/r3_injector';
import { ComponentFactoryResolver as viewEngine_ComponentFactoryResolver } from '../linker/component_factory_resolver';
import { NgModuleFactory as viewEngine_NgModuleFactory, NgModuleRef as viewEngine_NgModuleRef } from '../linker/ng_module_factory';
import { registerNgModuleType } from '../linker/ng_module_factory_registration';
import { assertDefined } from '../util/assert';
import { stringify } from '../util/stringify';
import { ComponentFactoryResolver } from './component_ref';
import { getNgLocaleIdDef, getNgModuleDef } from './definition';
import { setLocaleId } from './i18n';
import { maybeUnwrapFn } from './util/misc_utils';
/**
 * @record
 * @template T
 */
export function NgModuleType() { }
if (false) {
    /** @type {?} */
    NgModuleType.prototype.ɵmod;
}
/**
 * @template T
 */
export class NgModuleRef extends viewEngine_NgModuleRef {
    /**
     * @param {?} ngModuleType
     * @param {?} _parent
     */
    constructor(ngModuleType, _parent) {
        super();
        this._parent = _parent;
        // tslint:disable-next-line:require-internal-with-underscore
        this._bootstrapComponents = [];
        this.injector = this;
        this.destroyCbs = [];
        // When bootstrapping a module we have a dependency graph that looks like this:
        // ApplicationRef -> ComponentFactoryResolver -> NgModuleRef. The problem is that if the
        // module being resolved tries to inject the ComponentFactoryResolver, it'll create a
        // circular dependency which will result in a runtime error, because the injector doesn't
        // exist yet. We work around the issue by creating the ComponentFactoryResolver ourselves
        // and providing it, rather than letting the injector resolve it.
        this.componentFactoryResolver = new ComponentFactoryResolver(this);
        /** @type {?} */
        const ngModuleDef = getNgModuleDef(ngModuleType);
        ngDevMode && assertDefined(ngModuleDef, `NgModule '${stringify(ngModuleType)}' is not a subtype of 'NgModuleType'.`);
        /** @type {?} */
        const ngLocaleIdDef = getNgLocaleIdDef(ngModuleType);
        ngLocaleIdDef && setLocaleId(ngLocaleIdDef);
        this._bootstrapComponents = maybeUnwrapFn((/** @type {?} */ (ngModuleDef)).bootstrap);
        this._r3Injector = (/** @type {?} */ (createInjectorWithoutInjectorInstances(ngModuleType, _parent, [
            { provide: viewEngine_NgModuleRef, useValue: this },
            { provide: viewEngine_ComponentFactoryResolver, useValue: this.componentFactoryResolver }
        ], stringify(ngModuleType))));
        // We need to resolve the injector types separately from the injector creation, because
        // the module might be trying to use this ref in its contructor for DI which will cause a
        // circular error that will eventually error out, because the injector isn't created yet.
        this._r3Injector._resolveInjectorDefTypes();
        this.instance = this.get(ngModuleType);
    }
    /**
     * @param {?} token
     * @param {?=} notFoundValue
     * @param {?=} injectFlags
     * @return {?}
     */
    get(token, notFoundValue = Injector.THROW_IF_NOT_FOUND, injectFlags = InjectFlags.Default) {
        if (token === Injector || token === viewEngine_NgModuleRef || token === INJECTOR) {
            return this;
        }
        return this._r3Injector.get(token, notFoundValue, injectFlags);
    }
    /**
     * @return {?}
     */
    destroy() {
        ngDevMode && assertDefined(this.destroyCbs, 'NgModule already destroyed');
        /** @type {?} */
        const injector = this._r3Injector;
        !injector.destroyed && injector.destroy();
        (/** @type {?} */ (this.destroyCbs)).forEach((/**
         * @param {?} fn
         * @return {?}
         */
        fn => fn()));
        this.destroyCbs = null;
    }
    /**
     * @param {?} callback
     * @return {?}
     */
    onDestroy(callback) {
        ngDevMode && assertDefined(this.destroyCbs, 'NgModule already destroyed');
        (/** @type {?} */ (this.destroyCbs)).push(callback);
    }
}
if (false) {
    /** @type {?} */
    NgModuleRef.prototype._bootstrapComponents;
    /** @type {?} */
    NgModuleRef.prototype._r3Injector;
    /** @type {?} */
    NgModuleRef.prototype.injector;
    /** @type {?} */
    NgModuleRef.prototype.instance;
    /** @type {?} */
    NgModuleRef.prototype.destroyCbs;
    /** @type {?} */
    NgModuleRef.prototype.componentFactoryResolver;
    /** @type {?} */
    NgModuleRef.prototype._parent;
}
/**
 * @template T
 */
export class NgModuleFactory extends viewEngine_NgModuleFactory {
    /**
     * @param {?} moduleType
     */
    constructor(moduleType) {
        super();
        this.moduleType = moduleType;
        /** @type {?} */
        const ngModuleDef = getNgModuleDef(moduleType);
        if (ngModuleDef !== null) {
            // Register the NgModule with Angular's module registry. The location (and hence timing) of
            // this call is critical to ensure this works correctly (modules get registered when expected)
            // without bloating bundles (modules are registered when otherwise not referenced).
            //
            // In View Engine, registration occurs in the .ngfactory.js file as a side effect. This has
            // several practical consequences:
            //
            // - If an .ngfactory file is not imported from, the module won't be registered (and can be
            //   tree shaken).
            // - If an .ngfactory file is imported from, the module will be registered even if an instance
            //   is not actually created (via `create` below).
            // - Since an .ngfactory file in View Engine references the .ngfactory files of the NgModule's
            //   imports,
            //
            // In Ivy, things are a bit different. .ngfactory files still exist for compatibility, but are
            // not a required API to use - there are other ways to obtain an NgModuleFactory for a given
            // NgModule. Thus, relying on a side effect in the .ngfactory file is not sufficient. Instead,
            // the side effect of registration is added here, in the constructor of NgModuleFactory,
            // ensuring no matter how a factory is created, the module is registered correctly.
            //
            // An alternative would be to include the registration side effect inline following the actual
            // NgModule definition. This also has the correct timing, but breaks tree-shaking - modules
            // will be registered and retained even if they're otherwise never referenced.
            registerNgModuleType((/** @type {?} */ (moduleType)));
        }
    }
    /**
     * @param {?} parentInjector
     * @return {?}
     */
    create(parentInjector) {
        return new NgModuleRef(this.moduleType, parentInjector);
    }
}
if (false) {
    /** @type {?} */
    NgModuleFactory.prototype.moduleType;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kdWxlX3JlZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvbmdfbW9kdWxlX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEMsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ3RELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNyRCxPQUFPLEVBQWEsc0NBQXNDLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVyRixPQUFPLEVBQUMsd0JBQXdCLElBQUksbUNBQW1DLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQUNySCxPQUFPLEVBQXNCLGVBQWUsSUFBSSwwQkFBMEIsRUFBRSxXQUFXLElBQUksc0JBQXNCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUN0SixPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwwQ0FBMEMsQ0FBQztBQUU5RSxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRTVDLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pELE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxjQUFjLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDOUQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUNuQyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7Ozs7O0FBRWhELGtDQUFnRjs7O0lBQXZCLDRCQUFxQjs7Ozs7QUFFOUUsTUFBTSxPQUFPLFdBQWUsU0FBUSxzQkFBeUI7Ozs7O0lBaUIzRCxZQUFZLFlBQXFCLEVBQVMsT0FBc0I7UUFDOUQsS0FB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QUM7UUFDOUMsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO1lBQ3hCLDJGQUEyRjtZQUMzRiw4RkFBOEY7WUFDOUYsbUZBQW1GO1lBQ25GLEVBQUU7WUFDRiwyRkFBMkY7WUFDM0Ysa0NBQWtDO1lBQ2xDLEVBQUU7WUFDRiwyRkFBMkY7WUFDM0Ysa0JBQWtCO1lBQ2xCLDhGQUE4RjtZQUM5RixrREFBa0Q7WUFDbEQsOEZBQThGO1lBQzlGLGFBQWE7WUFDYixFQUFFO1lBQ0YsOEZBQThGO1lBQzlGLDRGQUE0RjtZQUM1Riw4RkFBOEY7WUFDOUYsd0ZBQXdGO1lBQ3hGLG1GQUFtRjtZQUNuRixFQUFFO1lBQ0YsOEZBQThGO1lBQzlGLDJGQUEyRjtZQUMzRiw4RUFBOEU7WUFDOUUsb0JBQW9CLENBQUMsbUJBQUEsVUFBVSxFQUFnQixDQUFDLENBQUM7U0FDbEQ7SUFDSCxDQUFDOzs7OztJQUVELE1BQU0sQ0FBQyxjQUE2QjtRQUNsQyxPQUFPLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDMUQsQ0FBQztDQUNGOzs7SUFuQ2EscUNBQTBCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yfSBmcm9tICcuLi9kaS9pbmplY3Rvcic7XG5pbXBvcnQge0lOSkVDVE9SfSBmcm9tICcuLi9kaS9pbmplY3Rvcl9jb21wYXRpYmlsaXR5JztcbmltcG9ydCB7SW5qZWN0RmxhZ3N9IGZyb20gJy4uL2RpL2ludGVyZmFjZS9pbmplY3Rvcic7XG5pbXBvcnQge1IzSW5qZWN0b3IsIGNyZWF0ZUluamVjdG9yV2l0aG91dEluamVjdG9ySW5zdGFuY2VzfSBmcm9tICcuLi9kaS9yM19pbmplY3Rvcic7XG5pbXBvcnQge1R5cGV9IGZyb20gJy4uL2ludGVyZmFjZS90eXBlJztcbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyIGFzIHZpZXdFbmdpbmVfQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyfSBmcm9tICcuLi9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnlfcmVzb2x2ZXInO1xuaW1wb3J0IHtJbnRlcm5hbE5nTW9kdWxlUmVmLCBOZ01vZHVsZUZhY3RvcnkgYXMgdmlld0VuZ2luZV9OZ01vZHVsZUZhY3RvcnksIE5nTW9kdWxlUmVmIGFzIHZpZXdFbmdpbmVfTmdNb2R1bGVSZWZ9IGZyb20gJy4uL2xpbmtlci9uZ19tb2R1bGVfZmFjdG9yeSc7XG5pbXBvcnQge3JlZ2lzdGVyTmdNb2R1bGVUeXBlfSBmcm9tICcuLi9saW5rZXIvbmdfbW9kdWxlX2ZhY3RvcnlfcmVnaXN0cmF0aW9uJztcbmltcG9ydCB7TmdNb2R1bGVEZWZ9IGZyb20gJy4uL21ldGFkYXRhL25nX21vZHVsZSc7XG5pbXBvcnQge2Fzc2VydERlZmluZWR9IGZyb20gJy4uL3V0aWwvYXNzZXJ0JztcbmltcG9ydCB7c3RyaW5naWZ5fSBmcm9tICcuLi91dGlsL3N0cmluZ2lmeSc7XG5cbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyfSBmcm9tICcuL2NvbXBvbmVudF9yZWYnO1xuaW1wb3J0IHtnZXROZ0xvY2FsZUlkRGVmLCBnZXROZ01vZHVsZURlZn0gZnJvbSAnLi9kZWZpbml0aW9uJztcbmltcG9ydCB7c2V0TG9jYWxlSWR9IGZyb20gJy4vaTE4bic7XG5pbXBvcnQge21heWJlVW53cmFwRm59IGZyb20gJy4vdXRpbC9taXNjX3V0aWxzJztcblxuZXhwb3J0IGludGVyZmFjZSBOZ01vZHVsZVR5cGU8VCA9IGFueT4gZXh0ZW5kcyBUeXBlPFQ+IHsgybVtb2Q6IE5nTW9kdWxlRGVmPFQ+OyB9XG5cbmV4cG9ydCBjbGFzcyBOZ01vZHVsZVJlZjxUPiBleHRlbmRzIHZpZXdFbmdpbmVfTmdNb2R1bGVSZWY8VD4gaW1wbGVtZW50cyBJbnRlcm5hbE5nTW9kdWxlUmVmPFQ+IHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnJlcXVpcmUtaW50ZXJuYWwtd2l0aC11bmRlcnNjb3JlXG4gIF9ib290c3RyYXBDb21wb25lbnRzOiBUeXBlPGFueT5bXSA9IFtdO1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6cmVxdWlyZS1pbnRlcm5hbC13aXRoLXVuZGVyc2NvcmVcbiAgX3IzSW5qZWN0b3I6IFIzSW5qZWN0b3I7XG4gIGluamVjdG9yOiBJbmplY3RvciA9IHRoaXM7XG4gIGluc3RhbmNlOiBUO1xuICBkZXN0cm95Q2JzOiAoKCkgPT4gdm9pZClbXXxudWxsID0gW107XG5cbiAgLy8gV2hlbiBib290c3RyYXBwaW5nIGEgbW9kdWxlIHdlIGhhdmUgYSBkZXBlbmRlbmN5IGdyYXBoIHRoYXQgbG9va3MgbGlrZSB0aGlzOlxuICAvLyBBcHBsaWNhdGlvblJlZiAtPiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgLT4gTmdNb2R1bGVSZWYuIFRoZSBwcm9ibGVtIGlzIHRoYXQgaWYgdGhlXG4gIC8vIG1vZHVsZSBiZWluZyByZXNvbHZlZCB0cmllcyB0byBpbmplY3QgdGhlIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgaXQnbGwgY3JlYXRlIGFcbiAgLy8gY2lyY3VsYXIgZGVwZW5kZW5jeSB3aGljaCB3aWxsIHJlc3VsdCBpbiBhIHJ1bnRpbWUgZXJyb3IsIGJlY2F1c2UgdGhlIGluamVjdG9yIGRvZXNuJ3RcbiAgLy8gZXhpc3QgeWV0LiBXZSB3b3JrIGFyb3VuZCB0aGUgaXNzdWUgYnkgY3JlYXRpbmcgdGhlIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciBvdXJzZWx2ZXNcbiAgLy8gYW5kIHByb3ZpZGluZyBpdCwgcmF0aGVyIHRoYW4gbGV0dGluZyB0aGUgaW5qZWN0b3IgcmVzb2x2ZSBpdC5cbiAgcmVhZG9ubHkgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgPSBuZXcgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKHRoaXMpO1xuXG4gIGNvbnN0cnVjdG9yKG5nTW9kdWxlVHlwZTogVHlwZTxUPiwgcHVibGljIF9wYXJlbnQ6IEluamVjdG9yfG51bGwpIHtcbiAgICBzdXBlcigpO1xuICAgIGNvbnN0IG5nTW9kdWxlRGVmID0gZ2V0TmdNb2R1bGVEZWYobmdNb2R1bGVUeXBlKTtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChcbiAgICAgICAgICAgICAgICAgICAgIG5nTW9kdWxlRGVmLFxuICAgICAgICAgICAgICAgICAgICAgYE5nTW9kdWxlICcke3N0cmluZ2lmeShuZ01vZHVsZVR5cGUpfScgaXMgbm90IGEgc3VidHlwZSBvZiAnTmdNb2R1bGVUeXBlJy5gKTtcblxuICAgIGNvbnN0IG5nTG9jYWxlSWREZWYgPSBnZXROZ0xvY2FsZUlkRGVmKG5nTW9kdWxlVHlwZSk7XG4gICAgbmdMb2NhbGVJZERlZiAmJiBzZXRMb2NhbGVJZChuZ0xvY2FsZUlkRGVmKTtcbiAgICB0aGlzLl9ib290c3RyYXBDb21wb25lbnRzID0gbWF5YmVVbndyYXBGbihuZ01vZHVsZURlZiAhLmJvb3RzdHJhcCk7XG4gICAgdGhpcy5fcjNJbmplY3RvciA9IGNyZWF0ZUluamVjdG9yV2l0aG91dEluamVjdG9ySW5zdGFuY2VzKFxuICAgICAgICBuZ01vZHVsZVR5cGUsIF9wYXJlbnQsXG4gICAgICAgIFtcbiAgICAgICAgICB7cHJvdmlkZTogdmlld0VuZ2luZV9OZ01vZHVsZVJlZiwgdXNlVmFsdWU6IHRoaXN9LFxuICAgICAgICAgIHtwcm92aWRlOiB2aWV3RW5naW5lX0NvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgdXNlVmFsdWU6IHRoaXMuY29tcG9uZW50RmFjdG9yeVJlc29sdmVyfVxuICAgICAgICBdLFxuICAgICAgICBzdHJpbmdpZnkobmdNb2R1bGVUeXBlKSkgYXMgUjNJbmplY3RvcjtcblxuICAgIC8vIFdlIG5lZWQgdG8gcmVzb2x2ZSB0aGUgaW5qZWN0b3IgdHlwZXMgc2VwYXJhdGVseSBmcm9tIHRoZSBpbmplY3RvciBjcmVhdGlvbiwgYmVjYXVzZVxuICAgIC8vIHRoZSBtb2R1bGUgbWlnaHQgYmUgdHJ5aW5nIHRvIHVzZSB0aGlzIHJlZiBpbiBpdHMgY29udHJ1Y3RvciBmb3IgREkgd2hpY2ggd2lsbCBjYXVzZSBhXG4gICAgLy8gY2lyY3VsYXIgZXJyb3IgdGhhdCB3aWxsIGV2ZW50dWFsbHkgZXJyb3Igb3V0LCBiZWNhdXNlIHRoZSBpbmplY3RvciBpc24ndCBjcmVhdGVkIHlldC5cbiAgICB0aGlzLl9yM0luamVjdG9yLl9yZXNvbHZlSW5qZWN0b3JEZWZUeXBlcygpO1xuICAgIHRoaXMuaW5zdGFuY2UgPSB0aGlzLmdldChuZ01vZHVsZVR5cGUpO1xuICB9XG5cbiAgZ2V0KHRva2VuOiBhbnksIG5vdEZvdW5kVmFsdWU6IGFueSA9IEluamVjdG9yLlRIUk9XX0lGX05PVF9GT1VORCxcbiAgICAgIGluamVjdEZsYWdzOiBJbmplY3RGbGFncyA9IEluamVjdEZsYWdzLkRlZmF1bHQpOiBhbnkge1xuICAgIGlmICh0b2tlbiA9PT0gSW5qZWN0b3IgfHwgdG9rZW4gPT09IHZpZXdFbmdpbmVfTmdNb2R1bGVSZWYgfHwgdG9rZW4gPT09IElOSkVDVE9SKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3IzSW5qZWN0b3IuZ2V0KHRva2VuLCBub3RGb3VuZFZhbHVlLCBpbmplY3RGbGFncyk7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKHRoaXMuZGVzdHJveUNicywgJ05nTW9kdWxlIGFscmVhZHkgZGVzdHJveWVkJyk7XG4gICAgY29uc3QgaW5qZWN0b3IgPSB0aGlzLl9yM0luamVjdG9yO1xuICAgICFpbmplY3Rvci5kZXN0cm95ZWQgJiYgaW5qZWN0b3IuZGVzdHJveSgpO1xuICAgIHRoaXMuZGVzdHJveUNicyAhLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgdGhpcy5kZXN0cm95Q2JzID0gbnVsbDtcbiAgfVxuICBvbkRlc3Ryb3koY2FsbGJhY2s6ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZCh0aGlzLmRlc3Ryb3lDYnMsICdOZ01vZHVsZSBhbHJlYWR5IGRlc3Ryb3llZCcpO1xuICAgIHRoaXMuZGVzdHJveUNicyAhLnB1c2goY2FsbGJhY2spO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOZ01vZHVsZUZhY3Rvcnk8VD4gZXh0ZW5kcyB2aWV3RW5naW5lX05nTW9kdWxlRmFjdG9yeTxUPiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBtb2R1bGVUeXBlOiBUeXBlPFQ+KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGNvbnN0IG5nTW9kdWxlRGVmID0gZ2V0TmdNb2R1bGVEZWYobW9kdWxlVHlwZSk7XG4gICAgaWYgKG5nTW9kdWxlRGVmICE9PSBudWxsKSB7XG4gICAgICAvLyBSZWdpc3RlciB0aGUgTmdNb2R1bGUgd2l0aCBBbmd1bGFyJ3MgbW9kdWxlIHJlZ2lzdHJ5LiBUaGUgbG9jYXRpb24gKGFuZCBoZW5jZSB0aW1pbmcpIG9mXG4gICAgICAvLyB0aGlzIGNhbGwgaXMgY3JpdGljYWwgdG8gZW5zdXJlIHRoaXMgd29ya3MgY29ycmVjdGx5IChtb2R1bGVzIGdldCByZWdpc3RlcmVkIHdoZW4gZXhwZWN0ZWQpXG4gICAgICAvLyB3aXRob3V0IGJsb2F0aW5nIGJ1bmRsZXMgKG1vZHVsZXMgYXJlIHJlZ2lzdGVyZWQgd2hlbiBvdGhlcndpc2Ugbm90IHJlZmVyZW5jZWQpLlxuICAgICAgLy9cbiAgICAgIC8vIEluIFZpZXcgRW5naW5lLCByZWdpc3RyYXRpb24gb2NjdXJzIGluIHRoZSAubmdmYWN0b3J5LmpzIGZpbGUgYXMgYSBzaWRlIGVmZmVjdC4gVGhpcyBoYXNcbiAgICAgIC8vIHNldmVyYWwgcHJhY3RpY2FsIGNvbnNlcXVlbmNlczpcbiAgICAgIC8vXG4gICAgICAvLyAtIElmIGFuIC5uZ2ZhY3RvcnkgZmlsZSBpcyBub3QgaW1wb3J0ZWQgZnJvbSwgdGhlIG1vZHVsZSB3b24ndCBiZSByZWdpc3RlcmVkIChhbmQgY2FuIGJlXG4gICAgICAvLyAgIHRyZWUgc2hha2VuKS5cbiAgICAgIC8vIC0gSWYgYW4gLm5nZmFjdG9yeSBmaWxlIGlzIGltcG9ydGVkIGZyb20sIHRoZSBtb2R1bGUgd2lsbCBiZSByZWdpc3RlcmVkIGV2ZW4gaWYgYW4gaW5zdGFuY2VcbiAgICAgIC8vICAgaXMgbm90IGFjdHVhbGx5IGNyZWF0ZWQgKHZpYSBgY3JlYXRlYCBiZWxvdykuXG4gICAgICAvLyAtIFNpbmNlIGFuIC5uZ2ZhY3RvcnkgZmlsZSBpbiBWaWV3IEVuZ2luZSByZWZlcmVuY2VzIHRoZSAubmdmYWN0b3J5IGZpbGVzIG9mIHRoZSBOZ01vZHVsZSdzXG4gICAgICAvLyAgIGltcG9ydHMsXG4gICAgICAvL1xuICAgICAgLy8gSW4gSXZ5LCB0aGluZ3MgYXJlIGEgYml0IGRpZmZlcmVudC4gLm5nZmFjdG9yeSBmaWxlcyBzdGlsbCBleGlzdCBmb3IgY29tcGF0aWJpbGl0eSwgYnV0IGFyZVxuICAgICAgLy8gbm90IGEgcmVxdWlyZWQgQVBJIHRvIHVzZSAtIHRoZXJlIGFyZSBvdGhlciB3YXlzIHRvIG9idGFpbiBhbiBOZ01vZHVsZUZhY3RvcnkgZm9yIGEgZ2l2ZW5cbiAgICAgIC8vIE5nTW9kdWxlLiBUaHVzLCByZWx5aW5nIG9uIGEgc2lkZSBlZmZlY3QgaW4gdGhlIC5uZ2ZhY3RvcnkgZmlsZSBpcyBub3Qgc3VmZmljaWVudC4gSW5zdGVhZCxcbiAgICAgIC8vIHRoZSBzaWRlIGVmZmVjdCBvZiByZWdpc3RyYXRpb24gaXMgYWRkZWQgaGVyZSwgaW4gdGhlIGNvbnN0cnVjdG9yIG9mIE5nTW9kdWxlRmFjdG9yeSxcbiAgICAgIC8vIGVuc3VyaW5nIG5vIG1hdHRlciBob3cgYSBmYWN0b3J5IGlzIGNyZWF0ZWQsIHRoZSBtb2R1bGUgaXMgcmVnaXN0ZXJlZCBjb3JyZWN0bHkuXG4gICAgICAvL1xuICAgICAgLy8gQW4gYWx0ZXJuYXRpdmUgd291bGQgYmUgdG8gaW5jbHVkZSB0aGUgcmVnaXN0cmF0aW9uIHNpZGUgZWZmZWN0IGlubGluZSBmb2xsb3dpbmcgdGhlIGFjdHVhbFxuICAgICAgLy8gTmdNb2R1bGUgZGVmaW5pdGlvbi4gVGhpcyBhbHNvIGhhcyB0aGUgY29ycmVjdCB0aW1pbmcsIGJ1dCBicmVha3MgdHJlZS1zaGFraW5nIC0gbW9kdWxlc1xuICAgICAgLy8gd2lsbCBiZSByZWdpc3RlcmVkIGFuZCByZXRhaW5lZCBldmVuIGlmIHRoZXkncmUgb3RoZXJ3aXNlIG5ldmVyIHJlZmVyZW5jZWQuXG4gICAgICByZWdpc3Rlck5nTW9kdWxlVHlwZShtb2R1bGVUeXBlIGFzIE5nTW9kdWxlVHlwZSk7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlKHBhcmVudEluamVjdG9yOiBJbmplY3RvcnxudWxsKTogdmlld0VuZ2luZV9OZ01vZHVsZVJlZjxUPiB7XG4gICAgcmV0dXJuIG5ldyBOZ01vZHVsZVJlZih0aGlzLm1vZHVsZVR5cGUsIHBhcmVudEluamVjdG9yKTtcbiAgfVxufVxuIl19