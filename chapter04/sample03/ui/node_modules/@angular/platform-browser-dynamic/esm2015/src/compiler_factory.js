/**
 * @fileoverview added by tsickle
 * Generated from: packages/platform-browser-dynamic/src/compiler_factory.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompileMetadataResolver, CompileReflector, CompilerConfig, DirectiveNormalizer, DirectiveResolver, DomElementSchemaRegistry, ElementSchemaRegistry, HtmlParser, I18NHtmlParser, JitCompiler, JitEvaluator, JitSummaryResolver, Lexer, NgModuleCompiler, NgModuleResolver, Parser, PipeResolver, ProviderMeta, ResourceLoader, StaticSymbolCache, StyleCompiler, SummaryResolver, TemplateParser, UrlResolver, ViewCompiler } from '@angular/compiler';
import { Compiler, Inject, InjectionToken, Injector, MissingTranslationStrategy, Optional, PACKAGE_ROOT_URL, TRANSLATIONS, TRANSLATIONS_FORMAT, ViewEncapsulation, isDevMode, ɵConsole as Console } from '@angular/core';
import { JitReflector } from './compiler_reflector';
/** @type {?} */
export const ERROR_COLLECTOR_TOKEN = new InjectionToken('ErrorCollector');
/**
 * A default provider for {\@link PACKAGE_ROOT_URL} that maps to '/'.
 * @type {?}
 */
export const DEFAULT_PACKAGE_URL_PROVIDER = {
    provide: PACKAGE_ROOT_URL,
    useValue: '/'
};
/** @type {?} */
const _NO_RESOURCE_LOADER = {
    /**
     * @param {?} url
     * @return {?}
     */
    get(url) {
        throw new Error(`No ResourceLoader implementation has been provided. Can't read the url "${url}"`);
    }
};
/** @type {?} */
const baseHtmlParser = new InjectionToken('HtmlParser');
export class CompilerImpl {
    /**
     * @param {?} injector
     * @param {?} _metadataResolver
     * @param {?} templateParser
     * @param {?} styleCompiler
     * @param {?} viewCompiler
     * @param {?} ngModuleCompiler
     * @param {?} summaryResolver
     * @param {?} compileReflector
     * @param {?} jitEvaluator
     * @param {?} compilerConfig
     * @param {?} console
     */
    constructor(injector, _metadataResolver, templateParser, styleCompiler, viewCompiler, ngModuleCompiler, summaryResolver, compileReflector, jitEvaluator, compilerConfig, console) {
        this._metadataResolver = _metadataResolver;
        this._delegate = new JitCompiler(_metadataResolver, templateParser, styleCompiler, viewCompiler, ngModuleCompiler, summaryResolver, compileReflector, jitEvaluator, compilerConfig, console, this.getExtraNgModuleProviders.bind(this));
        this.injector = injector;
    }
    /**
     * @private
     * @return {?}
     */
    getExtraNgModuleProviders() {
        return [this._metadataResolver.getProviderMetadata(new ProviderMeta(Compiler, { useValue: this }))];
    }
    /**
     * @template T
     * @param {?} moduleType
     * @return {?}
     */
    compileModuleSync(moduleType) {
        return (/** @type {?} */ (this._delegate.compileModuleSync(moduleType)));
    }
    /**
     * @template T
     * @param {?} moduleType
     * @return {?}
     */
    compileModuleAsync(moduleType) {
        return (/** @type {?} */ (this._delegate.compileModuleAsync(moduleType)));
    }
    /**
     * @template T
     * @param {?} moduleType
     * @return {?}
     */
    compileModuleAndAllComponentsSync(moduleType) {
        /** @type {?} */
        const result = this._delegate.compileModuleAndAllComponentsSync(moduleType);
        return {
            ngModuleFactory: (/** @type {?} */ (result.ngModuleFactory)),
            componentFactories: (/** @type {?} */ (result.componentFactories)),
        };
    }
    /**
     * @template T
     * @param {?} moduleType
     * @return {?}
     */
    compileModuleAndAllComponentsAsync(moduleType) {
        return this._delegate.compileModuleAndAllComponentsAsync(moduleType)
            .then((/**
         * @param {?} result
         * @return {?}
         */
        (result) => ({
            ngModuleFactory: (/** @type {?} */ (result.ngModuleFactory)),
            componentFactories: (/** @type {?} */ (result.componentFactories)),
        })));
    }
    /**
     * @param {?} summaries
     * @return {?}
     */
    loadAotSummaries(summaries) { this._delegate.loadAotSummaries(summaries); }
    /**
     * @param {?} ref
     * @return {?}
     */
    hasAotSummary(ref) { return this._delegate.hasAotSummary(ref); }
    /**
     * @template T
     * @param {?} component
     * @return {?}
     */
    getComponentFactory(component) {
        return (/** @type {?} */ (this._delegate.getComponentFactory(component)));
    }
    /**
     * @return {?}
     */
    clearCache() { this._delegate.clearCache(); }
    /**
     * @param {?} type
     * @return {?}
     */
    clearCacheFor(type) { this._delegate.clearCacheFor(type); }
    /**
     * @param {?} moduleType
     * @return {?}
     */
    getModuleId(moduleType) {
        /** @type {?} */
        const meta = this._metadataResolver.getNgModuleMetadata(moduleType);
        return meta && meta.id || undefined;
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    CompilerImpl.prototype._delegate;
    /** @type {?} */
    CompilerImpl.prototype.injector;
    /**
     * @type {?}
     * @private
     */
    CompilerImpl.prototype._metadataResolver;
}
const ɵ0 = new JitReflector(), ɵ1 = _NO_RESOURCE_LOADER, ɵ2 = /**
 * @param {?} parser
 * @param {?} translations
 * @param {?} format
 * @param {?} config
 * @param {?} console
 * @return {?}
 */
(parser, translations, format, config, console) => {
    translations = translations || '';
    /** @type {?} */
    const missingTranslation = translations ? (/** @type {?} */ (config.missingTranslation)) : MissingTranslationStrategy.Ignore;
    return new I18NHtmlParser(parser, translations, format, missingTranslation, console);
}, ɵ3 = new CompilerConfig();
/**
 * A set of providers that provide `JitCompiler` and its dependencies to use for
 * template compilation.
 * @type {?}
 */
const COMPILER_PROVIDERS__PRE_R3__ = (/** @type {?} */ ([
    { provide: CompileReflector, useValue: ɵ0 },
    { provide: ResourceLoader, useValue: ɵ1 },
    { provide: JitSummaryResolver, deps: [] },
    { provide: SummaryResolver, useExisting: JitSummaryResolver },
    { provide: Console, deps: [] },
    { provide: Lexer, deps: [] },
    { provide: Parser, deps: [Lexer] },
    {
        provide: baseHtmlParser,
        useClass: HtmlParser,
        deps: [],
    },
    {
        provide: I18NHtmlParser,
        useFactory: (ɵ2),
        deps: [
            baseHtmlParser,
            [new Optional(), new Inject(TRANSLATIONS)],
            [new Optional(), new Inject(TRANSLATIONS_FORMAT)],
            [CompilerConfig],
            [Console],
        ]
    },
    {
        provide: HtmlParser,
        useExisting: I18NHtmlParser,
    },
    {
        provide: TemplateParser, deps: [CompilerConfig, CompileReflector,
            Parser, ElementSchemaRegistry,
            I18NHtmlParser, Console]
    },
    { provide: JitEvaluator, useClass: JitEvaluator, deps: [] },
    { provide: DirectiveNormalizer, deps: [ResourceLoader, UrlResolver, HtmlParser, CompilerConfig] },
    { provide: CompileMetadataResolver, deps: [CompilerConfig, HtmlParser, NgModuleResolver,
            DirectiveResolver, PipeResolver,
            SummaryResolver,
            ElementSchemaRegistry,
            DirectiveNormalizer, Console,
            [Optional, StaticSymbolCache],
            CompileReflector,
            [Optional, ERROR_COLLECTOR_TOKEN]] },
    DEFAULT_PACKAGE_URL_PROVIDER,
    { provide: StyleCompiler, deps: [UrlResolver] },
    { provide: ViewCompiler, deps: [CompileReflector] },
    { provide: NgModuleCompiler, deps: [CompileReflector] },
    { provide: CompilerConfig, useValue: ɵ3 },
    { provide: Compiler, useClass: CompilerImpl, deps: [Injector, CompileMetadataResolver,
            TemplateParser, StyleCompiler,
            ViewCompiler, NgModuleCompiler,
            SummaryResolver, CompileReflector, JitEvaluator, CompilerConfig,
            Console] },
    { provide: DomElementSchemaRegistry, deps: [] },
    { provide: ElementSchemaRegistry, useExisting: DomElementSchemaRegistry },
    { provide: UrlResolver, deps: [PACKAGE_ROOT_URL] },
    { provide: DirectiveResolver, deps: [CompileReflector] },
    { provide: PipeResolver, deps: [CompileReflector] },
    { provide: NgModuleResolver, deps: [CompileReflector] },
]));
/** @type {?} */
export const COMPILER_PROVIDERS__POST_R3__ = (/** @type {?} */ ([{ provide: Compiler, useFactory: (/**
         * @return {?}
         */
        () => new Compiler()) }]));
/** @type {?} */
export const COMPILER_PROVIDERS = COMPILER_PROVIDERS__PRE_R3__;
/**
 * \@publicApi
 */
export class JitCompilerFactory {
    /* @internal */
    /**
     * @param {?} defaultOptions
     */
    constructor(defaultOptions) {
        /** @type {?} */
        const compilerOptions = {
            useJit: true,
            defaultEncapsulation: ViewEncapsulation.Emulated,
            missingTranslation: MissingTranslationStrategy.Warning,
        };
        this._defaultOptions = [compilerOptions, ...defaultOptions];
    }
    /**
     * @param {?=} options
     * @return {?}
     */
    createCompiler(options = []) {
        /** @type {?} */
        const opts = _mergeOptions(this._defaultOptions.concat(options));
        /** @type {?} */
        const injector = Injector.create([
            COMPILER_PROVIDERS, {
                provide: CompilerConfig,
                useFactory: (/**
                 * @return {?}
                 */
                () => {
                    return new CompilerConfig({
                        // let explicit values from the compiler options overwrite options
                        // from the app providers
                        useJit: opts.useJit,
                        jitDevMode: isDevMode(),
                        // let explicit values from the compiler options overwrite options
                        // from the app providers
                        defaultEncapsulation: opts.defaultEncapsulation,
                        missingTranslation: opts.missingTranslation,
                        preserveWhitespaces: opts.preserveWhitespaces,
                    });
                }),
                deps: []
            },
            (/** @type {?} */ (opts.providers))
        ]);
        return injector.get(Compiler);
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    JitCompilerFactory.prototype._defaultOptions;
}
/**
 * @param {?} optionsArr
 * @return {?}
 */
function _mergeOptions(optionsArr) {
    return {
        useJit: _lastDefined(optionsArr.map((/**
         * @param {?} options
         * @return {?}
         */
        options => options.useJit))),
        defaultEncapsulation: _lastDefined(optionsArr.map((/**
         * @param {?} options
         * @return {?}
         */
        options => options.defaultEncapsulation))),
        providers: _mergeArrays(optionsArr.map((/**
         * @param {?} options
         * @return {?}
         */
        options => (/** @type {?} */ (options.providers))))),
        missingTranslation: _lastDefined(optionsArr.map((/**
         * @param {?} options
         * @return {?}
         */
        options => options.missingTranslation))),
        preserveWhitespaces: _lastDefined(optionsArr.map((/**
         * @param {?} options
         * @return {?}
         */
        options => options.preserveWhitespaces))),
    };
}
/**
 * @template T
 * @param {?} args
 * @return {?}
 */
function _lastDefined(args) {
    for (let i = args.length - 1; i >= 0; i--) {
        if (args[i] !== undefined) {
            return args[i];
        }
    }
    return undefined;
}
/**
 * @param {?} parts
 * @return {?}
 */
function _mergeArrays(parts) {
    /** @type {?} */
    const result = [];
    parts.forEach((/**
     * @param {?} part
     * @return {?}
     */
    (part) => part && result.push(...part)));
    return result;
}
export { ɵ0, ɵ1, ɵ2, ɵ3 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXJfZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3BsYXRmb3JtLWJyb3dzZXItZHluYW1pYy9zcmMvY29tcGlsZXJfZmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLG1CQUFtQixFQUFFLGlCQUFpQixFQUFFLHdCQUF3QixFQUFFLHFCQUFxQixFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLGlCQUFpQixFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM3YixPQUFPLEVBQUMsUUFBUSxFQUFzRCxNQUFNLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSwwQkFBMEIsRUFBaUQsUUFBUSxFQUFFLGdCQUFnQixFQUFrQixZQUFZLEVBQUUsbUJBQW1CLEVBQVEsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLFFBQVEsSUFBSSxPQUFPLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFaFYsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHNCQUFzQixDQUFDOztBQUVsRCxNQUFNLE9BQU8scUJBQXFCLEdBQUcsSUFBSSxjQUFjLENBQUMsZ0JBQWdCLENBQUM7Ozs7O0FBS3pFLE1BQU0sT0FBTyw0QkFBNEIsR0FBRztJQUMxQyxPQUFPLEVBQUUsZ0JBQWdCO0lBQ3pCLFFBQVEsRUFBRSxHQUFHO0NBQ2Q7O01BRUssbUJBQW1CLEdBQW1COzs7OztJQUMxQyxHQUFHLENBQUMsR0FBVztRQUNYLE1BQU0sSUFBSSxLQUFL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S0FBSyxDQUFDLE9BQU87Ozs7SUFBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBQyxDQUFDO0lBQ3RELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcGlsZU1ldGFkYXRhUmVzb2x2ZXIsIENvbXBpbGVSZWZsZWN0b3IsIENvbXBpbGVyQ29uZmlnLCBEaXJlY3RpdmVOb3JtYWxpemVyLCBEaXJlY3RpdmVSZXNvbHZlciwgRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5LCBFbGVtZW50U2NoZW1hUmVnaXN0cnksIEh0bWxQYXJzZXIsIEkxOE5IdG1sUGFyc2VyLCBKaXRDb21waWxlciwgSml0RXZhbHVhdG9yLCBKaXRTdW1tYXJ5UmVzb2x2ZXIsIExleGVyLCBOZ01vZHVsZUNvbXBpbGVyLCBOZ01vZHVsZVJlc29sdmVyLCBQYXJzZXIsIFBpcGVSZXNvbHZlciwgUHJvdmlkZXJNZXRhLCBSZXNvdXJjZUxvYWRlciwgU3RhdGljU3ltYm9sQ2FjaGUsIFN0eWxlQ29tcGlsZXIsIFN1bW1hcnlSZXNvbHZlciwgVGVtcGxhdGVQYXJzZXIsIFVybFJlc29sdmVyLCBWaWV3Q29tcGlsZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCB7Q29tcGlsZXIsIENvbXBpbGVyRmFjdG9yeSwgQ29tcGlsZXJPcHRpb25zLCBDb21wb25lbnRGYWN0b3J5LCBJbmplY3QsIEluamVjdGlvblRva2VuLCBJbmplY3RvciwgTWlzc2luZ1RyYW5zbGF0aW9uU3RyYXRlZ3ksIE1vZHVsZVdpdGhDb21wb25lbnRGYWN0b3JpZXMsIE5nTW9kdWxlRmFjdG9yeSwgT3B0aW9uYWwsIFBBQ0tBR0VfUk9PVF9VUkwsIFN0YXRpY1Byb3ZpZGVyLCBUUkFOU0xBVElPTlMsIFRSQU5TTEFUSU9OU19GT1JNQVQsIFR5cGUsIFZpZXdFbmNhcHN1bGF0aW9uLCBpc0Rldk1vZGUsIMm1Q29uc29sZSBhcyBDb25zb2xlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtKaXRSZWZsZWN0b3J9IGZyb20gJy4vY29tcGlsZXJfcmVmbGVjdG9yJztcblxuZXhwb3J0IGNvbnN0IEVSUk9SX0NPTExFQ1RPUl9UT0tFTiA9IG5ldyBJbmplY3Rpb25Ub2tlbignRXJyb3JDb2xsZWN0b3InKTtcblxuLyoqXG4gKiBBIGRlZmF1bHQgcHJvdmlkZXIgZm9yIHtAbGluayBQQUNLQUdFX1JPT1RfVVJMfSB0aGF0IG1hcHMgdG8gJy8nLlxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9QQUNLQUdFX1VSTF9QUk9WSURFUiA9IHtcbiAgcHJvdmlkZTogUEFDS0FHRV9ST09UX1VSTCxcbiAgdXNlVmFsdWU6ICcvJ1xufTtcblxuY29uc3QgX05PX1JFU09VUkNFX0xPQURFUjogUmVzb3VyY2VMb2FkZXIgPSB7XG4gIGdldCh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPntcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgTm8gUmVzb3VyY2VMb2FkZXIgaW1wbGVtZW50YXRpb24gaGFzIGJlZW4gcHJvdmlkZWQuIENhbid0IHJlYWQgdGhlIHVybCBcIiR7dXJsfVwiYCk7fVxufTtcblxuY29uc3QgYmFzZUh0bWxQYXJzZXIgPSBuZXcgSW5qZWN0aW9uVG9rZW4oJ0h0bWxQYXJzZXInKTtcblxuZXhwb3J0IGNsYXNzIENvbXBpbGVySW1wbCBpbXBsZW1lbnRzIENvbXBpbGVyIHtcbiAgcHJpdmF0ZSBfZGVsZWdhdGU6IEppdENvbXBpbGVyO1xuICBwdWJsaWMgcmVhZG9ubHkgaW5qZWN0b3I6IEluamVjdG9yO1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIGluamVjdG9yOiBJbmplY3RvciwgcHJpdmF0ZSBfbWV0YWRhdGFSZXNvbHZlcjogQ29tcGlsZU1ldGFkYXRhUmVzb2x2ZXIsXG4gICAgICB0ZW1wbGF0ZVBhcnNlcjogVGVtcGxhdGVQYXJzZXIsIHN0eWxlQ29tcGlsZXI6IFN0eWxlQ29tcGlsZXIsIHZpZXdDb21waWxlcjogVmlld0NvbXBpbGVyLFxuICAgICAgbmdNb2R1bGVDb21waWxlcjogTmdNb2R1bGVDb21waWxlciwgc3VtbWFyeVJlc29sdmVyOiBTdW1tYXJ5UmVzb2x2ZXI8VHlwZTxhbnk+PixcbiAgICAgIGNvbXBpbGVSZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IsIGppdEV2YWx1YXRvcjogSml0RXZhbHVhdG9yLFxuICAgICAgY29tcGlsZXJDb25maWc6IENvbXBpbGVyQ29uZmlnLCBjb25zb2xlOiBDb25zb2xlKSB7XG4gICAgdGhpcy5fZGVsZWdhdGUgPSBuZXcgSml0Q29tcGlsZXIoXG4gICAgICAgIF9tZXRhZGF0YVJlc29sdmVyLCB0ZW1wbGF0ZVBhcnNlciwgc3R5bGVDb21waWxlciwgdmlld0NvbXBpbGVyLCBuZ01vZHVsZUNvbXBpbGVyLFxuICAgICAgICBzdW1tYXJ5UmVzb2x2ZXIsIGNvbXBpbGVSZWZsZWN0b3IsIGppdEV2YWx1YXRvciwgY29tcGlsZXJDb25maWcsIGNvbnNvbGUsXG4gICAgICAgIHRoaXMuZ2V0RXh0cmFOZ01vZHVsZVByb3ZpZGVycy5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmluamVjdG9yID0gaW5qZWN0b3I7XG4gIH1cblxuICBwcml2YXRlIGdldEV4dHJhTmdNb2R1bGVQcm92aWRlcnMoKSB7XG4gICAgcmV0dXJuIFt0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldFByb3ZpZGVyTWV0YWRhdGEoXG4gICAgICAgIG5ldyBQcm92aWRlck1ldGEoQ29tcGlsZXIsIHt1c2VWYWx1ZTogdGhpc30pKV07XG4gIH1cblxuICBjb21waWxlTW9kdWxlU3luYzxUPihtb2R1bGVUeXBlOiBUeXBlPFQ+KTogTmdNb2R1bGVGYWN0b3J5PFQ+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuY29tcGlsZU1vZHVsZVN5bmMobW9kdWxlVHlwZSkgYXMgTmdNb2R1bGVGYWN0b3J5PFQ+O1xuICB9XG4gIGNvbXBpbGVNb2R1bGVBc3luYzxUPihtb2R1bGVUeXBlOiBUeXBlPFQ+KTogUHJvbWlzZTxOZ01vZHVsZUZhY3Rvcnk8VD4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuY29tcGlsZU1vZHVsZUFzeW5jKG1vZHVsZVR5cGUpIGFzIFByb21pc2U8TmdNb2R1bGVGYWN0b3J5PFQ+PjtcbiAgfVxuICBjb21waWxlTW9kdWxlQW5kQWxsQ29tcG9uZW50c1N5bmM8VD4obW9kdWxlVHlwZTogVHlwZTxUPik6IE1vZHVsZVdpdGhDb21wb25lbnRGYWN0b3JpZXM8VD4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2RlbGVnYXRlLmNvbXBpbGVNb2R1bGVBbmRBbGxDb21wb25lbnRzU3luYyhtb2R1bGVUeXBlKTtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGVGYWN0b3J5OiByZXN1bHQubmdNb2R1bGVGYWN0b3J5IGFzIE5nTW9kdWxlRmFjdG9yeTxUPixcbiAgICAgIGNvbXBvbmVudEZhY3RvcmllczogcmVzdWx0LmNvbXBvbmVudEZhY3RvcmllcyBhcyBDb21wb25lbnRGYWN0b3J5PGFueT5bXSxcbiAgICB9O1xuICB9XG4gIGNvbXBpbGVNb2R1bGVBbmRBbGxDb21wb25lbnRzQXN5bmM8VD4obW9kdWxlVHlwZTogVHlwZTxUPik6XG4gICAgICBQcm9taXNlPE1vZHVsZVdpdGhDb21wb25lbnRGYWN0b3JpZXM8VD4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuY29tcGlsZU1vZHVsZUFuZEFsbENvbXBvbmVudHNBc3luYyhtb2R1bGVUeXBlKVxuICAgICAgICAudGhlbigocmVzdWx0KSA9PiAoe1xuICAgICAgICAgICAgICAgIG5nTW9kdWxlRmFjdG9yeTogcmVzdWx0Lm5nTW9kdWxlRmFjdG9yeSBhcyBOZ01vZHVsZUZhY3Rvcnk8VD4sXG4gICAgICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yaWVzOiByZXN1bHQuY29tcG9uZW50RmFjdG9yaWVzIGFzIENvbXBvbmVudEZhY3Rvcnk8YW55PltdLFxuICAgICAgICAgICAgICB9KSk7XG4gIH1cbiAgbG9hZEFvdFN1bW1hcmllcyhzdW1tYXJpZXM6ICgpID0+IGFueVtdKSB7IHRoaXMuX2RlbGVnYXRlLmxvYWRBb3RTdW1tYXJpZXMoc3VtbWFyaWVzKTsgfVxuICBoYXNBb3RTdW1tYXJ5KHJlZjogVHlwZTxhbnk+KTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9kZWxlZ2F0ZS5oYXNBb3RTdW1tYXJ5KHJlZik7IH1cbiAgZ2V0Q29tcG9uZW50RmFjdG9yeTxUPihjb21wb25lbnQ6IFR5cGU8VD4pOiBDb21wb25lbnRGYWN0b3J5PFQ+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuZ2V0Q29tcG9uZW50RmFjdG9yeShjb21wb25lbnQpIGFzIENvbXBvbmVudEZhY3Rvcnk8VD47XG4gIH1cbiAgY2xlYXJDYWNoZSgpOiB2b2lkIHsgdGhpcy5fZGVsZWdhdGUuY2xlYXJDYWNoZSgpOyB9XG4gIGNsZWFyQ2FjaGVGb3IodHlwZTogVHlwZTxhbnk+KSB7IHRoaXMuX2RlbGVnYXRlLmNsZWFyQ2FjaGVGb3IodHlwZSk7IH1cbiAgZ2V0TW9kdWxlSWQobW9kdWxlVHlwZTogVHlwZTxhbnk+KTogc3RyaW5nfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgbWV0YSA9IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0TmdNb2R1bGVNZXRhZGF0YShtb2R1bGVUeXBlKTtcbiAgICByZXR1cm4gbWV0YSAmJiBtZXRhLmlkIHx8IHVuZGVmaW5lZDtcbiAgfVxufVxuLyoqXG4gKiBBIHNldCBvZiBwcm92aWRlcnMgdGhhdCBwcm92aWRlIGBKaXRDb21waWxlcmAgYW5kIGl0cyBkZXBlbmRlbmNpZXMgdG8gdXNlIGZvclxuICogdGVtcGxhdGUgY29tcGlsYXRpb24uXG4gKi9cbmNvbnN0IENPTVBJTEVSX1BST1ZJREVSU19fUFJFX1IzX18gPSA8U3RhdGljUHJvdmlkZXJbXT5bXG4gIHtwcm92aWRlOiBDb21waWxlUmVmbGVjdG9yLCB1c2VWYWx1ZTogbmV3IEppdFJlZmxlY3RvcigpfSxcbiAge3Byb3ZpZGU6IFJlc291cmNlTG9hZGVyLCB1c2VWYWx1ZTogX05PX1JFU09VUkNFX0xPQURFUn0sXG4gIHtwcm92aWRlOiBKaXRTdW1tYXJ5UmVzb2x2ZXIsIGRlcHM6IFtdfSxcbiAge3Byb3ZpZGU6IFN1bW1hcnlSZXNvbHZlciwgdXNlRXhpc3Rpbmc6IEppdFN1bW1hcnlSZXNvbHZlcn0sXG4gIHtwcm92aWRlOiBDb25zb2xlLCBkZXBzOiBbXX0sXG4gIHtwcm92aWRlOiBMZXhlciwgZGVwczogW119LFxuICB7cHJvdmlkZTogUGFyc2VyLCBkZXBzOiBbTGV4ZXJdfSxcbiAge1xuICAgIHByb3ZpZGU6IGJhc2VIdG1sUGFyc2VyLFxuICAgIHVzZUNsYXNzOiBIdG1sUGFyc2VyLFxuICAgIGRlcHM6IFtdLFxuICB9LFxuICB7XG4gICAgcHJvdmlkZTogSTE4Tkh0bWxQYXJzZXIsXG4gICAgdXNlRmFjdG9yeTogKHBhcnNlcjogSHRtbFBhcnNlciwgdHJhbnNsYXRpb25zOiBzdHJpbmcgfCBudWxsLCBmb3JtYXQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgY29uZmlnOiBDb21waWxlckNvbmZpZywgY29uc29sZTogQ29uc29sZSkgPT4ge1xuICAgICAgdHJhbnNsYXRpb25zID0gdHJhbnNsYXRpb25zIHx8ICcnO1xuICAgICAgY29uc3QgbWlzc2luZ1RyYW5zbGF0aW9uID1cbiAgICAgICAgICB0cmFuc2xhdGlvbnMgPyBjb25maWcubWlzc2luZ1RyYW5zbGF0aW9uICEgOiBNaXNzaW5nVHJhbnNsYXRpb25TdHJhdGVneS5JZ25vcmU7XG4gICAgICByZXR1cm4gbmV3IEkxOE5IdG1sUGFyc2VyKHBhcnNlciwgdHJhbnNsYXRpb25zLCBmb3JtYXQsIG1pc3NpbmdUcmFuc2xhdGlvbiwgY29uc29sZSk7XG4gICAgfSxcbiAgICBkZXBzOiBbXG4gICAgICBiYXNlSHRtbFBhcnNlcixcbiAgICAgIFtuZXcgT3B0aW9uYWwoKSwgbmV3IEluamVjdChUUkFOU0xBVElPTlMpXSxcbiAgICAgIFtuZXcgT3B0aW9uYWwoKSwgbmV3IEluamVjdChUUkFOU0xBVElPTlNfRk9STUFUKV0sXG4gICAgICBbQ29tcGlsZXJDb25maWddLFxuICAgICAgW0NvbnNvbGVdLFxuICAgIF1cbiAgfSxcbiAge1xuICAgIHByb3ZpZGU6IEh0bWxQYXJzZXIsXG4gICAgdXNlRXhpc3Rpbmc6IEkxOE5IdG1sUGFyc2VyLFxuICB9LFxuICB7XG4gICAgcHJvdmlkZTogVGVtcGxhdGVQYXJzZXIsIGRlcHM6IFtDb21waWxlckNvbmZpZywgQ29tcGlsZVJlZmxlY3RvcixcbiAgICBQYXJzZXIsIEVsZW1lbnRTY2hlbWFSZWdpc3RyeSxcbiAgICBJMThOSHRtbFBhcnNlciwgQ29uc29sZV1cbiAgfSxcbiAgeyBwcm92aWRlOiBKaXRFdmFsdWF0b3IsIHVzZUNsYXNzOiBKaXRFdmFsdWF0b3IsIGRlcHM6IFtdIH0sXG4gIHsgcHJvdmlkZTogRGlyZWN0aXZlTm9ybWFsaXplciwgZGVwczogW1Jlc291cmNlTG9hZGVyLCBVcmxSZXNvbHZlciwgSHRtbFBhcnNlciwgQ29tcGlsZXJDb25maWddfSxcbiAgeyBwcm92aWRlOiBDb21waWxlTWV0YWRhdGFSZXNvbHZlciwgZGVwczogW0NvbXBpbGVyQ29uZmlnLCBIdG1sUGFyc2VyLCBOZ01vZHVsZVJlc29sdmVyLFxuICAgICAgICAgICAgICAgICAgICAgIERpcmVjdGl2ZVJlc29sdmVyLCBQaXBlUmVzb2x2ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgU3VtbWFyeVJlc29sdmVyLFxuICAgICAgICAgICAgICAgICAgICAgIEVsZW1lbnRTY2hlbWFSZWdpc3RyeSxcbiAgICAgICAgICAgICAgICAgICAgICBEaXJlY3RpdmVOb3JtYWxpemVyLCBDb25zb2xlLFxuICAgICAgICAgICAgICAgICAgICAgIFtPcHRpb25hbCwgU3RhdGljU3ltYm9sQ2FjaGVdLFxuICAgICAgICAgICAgICAgICAgICAgIENvbXBpbGVSZWZsZWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgW09wdGlvbmFsLCBFUlJPUl9DT0xMRUNUT1JfVE9LRU5dXX0sXG4gIERFRkFVTFRfUEFDS0FHRV9VUkxfUFJPVklERVIsXG4gIHsgcHJvdmlkZTogU3R5bGVDb21waWxlciwgZGVwczogW1VybFJlc29sdmVyXX0sXG4gIHsgcHJvdmlkZTogVmlld0NvbXBpbGVyLCBkZXBzOiBbQ29tcGlsZVJlZmxlY3Rvcl19LFxuICB7IHByb3ZpZGU6IE5nTW9kdWxlQ29tcGlsZXIsIGRlcHM6IFtDb21waWxlUmVmbGVjdG9yXSB9LFxuICB7IHByb3ZpZGU6IENvbXBpbGVyQ29uZmlnLCB1c2VWYWx1ZTogbmV3IENvbXBpbGVyQ29uZmlnKCl9LFxuICB7IHByb3ZpZGU6IENvbXBpbGVyLCB1c2VDbGFzczogQ29tcGlsZXJJbXBsLCBkZXBzOiBbSW5qZWN0b3IsIENvbXBpbGVNZXRhZGF0YVJlc29sdmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUZW1wbGF0ZVBhcnNlciwgU3R5bGVDb21waWxlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVmlld0NvbXBpbGVyLCBOZ01vZHVsZUNvbXBpbGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdW1tYXJ5UmVzb2x2ZXIsIENvbXBpbGVSZWZsZWN0b3IsIEppdEV2YWx1YXRvciwgQ29tcGlsZXJDb25maWcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbnNvbGVdfSxcbiAgeyBwcm92aWRlOiBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnksIGRlcHM6IFtdfSxcbiAgeyBwcm92aWRlOiBFbGVtZW50U2NoZW1hUmVnaXN0cnksIHVzZUV4aXN0aW5nOiBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnl9LFxuICB7IHByb3ZpZGU6IFVybFJlc29sdmVyLCBkZXBzOiBbUEFDS0FHRV9ST09UX1VSTF19LFxuICB7IHByb3ZpZGU6IERpcmVjdGl2ZVJlc29sdmVyLCBkZXBzOiBbQ29tcGlsZVJlZmxlY3Rvcl19LFxuICB7IHByb3ZpZGU6IFBpcGVSZXNvbHZlciwgZGVwczogW0NvbXBpbGVSZWZsZWN0b3JdfSxcbiAgeyBwcm92aWRlOiBOZ01vZHVsZVJlc29sdmVyLCBkZXBzOiBbQ29tcGlsZVJlZmxlY3Rvcl19LFxuXTtcblxuZXhwb3J0IGNvbnN0IENPTVBJTEVSX1BST1ZJREVSU19fUE9TVF9SM19fID1cbiAgICA8U3RhdGljUHJvdmlkZXJbXT5be3Byb3ZpZGU6IENvbXBpbGVyLCB1c2VGYWN0b3J5OiAoKSA9PiBuZXcgQ29tcGlsZXIoKX1dO1xuZXhwb3J0IGNvbnN0IENPTVBJTEVSX1BST1ZJREVSUyA9IENPTVBJTEVSX1BST1ZJREVSU19fUFJFX1IzX187XG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEppdENvbXBpbGVyRmFjdG9yeSBpbXBsZW1lbnRzIENvbXBpbGVyRmFjdG9yeSB7XG4gIHByaXZhdGUgX2RlZmF1bHRPcHRpb25zOiBDb21waWxlck9wdGlvbnNbXTtcblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgY29uc3RydWN0b3IoZGVmYXVsdE9wdGlvbnM6IENvbXBpbGVyT3B0aW9uc1tdKSB7XG4gICAgY29uc3QgY29tcGlsZXJPcHRpb25zOiBDb21waWxlck9wdGlvbnMgPSB7XG4gICAgICB1c2VKaXQ6IHRydWUsXG4gICAgICBkZWZhdWx0RW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQsXG4gICAgICBtaXNzaW5nVHJhbnNsYXRpb246IE1pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5Lldhcm5pbmcsXG4gICAgfTtcblxuICAgIHRoaXMuX2RlZmF1bHRPcHRpb25zID0gW2NvbXBpbGVyT3B0aW9ucywgLi4uZGVmYXVsdE9wdGlvbnNdO1xuICB9XG4gIGNyZWF0ZUNvbXBpbGVyKG9wdGlvbnM6IENvbXBpbGVyT3B0aW9uc1tdID0gW10pOiBDb21waWxlciB7XG4gICAgY29uc3Qgb3B0cyA9IF9tZXJnZU9wdGlvbnModGhpcy5fZGVmYXVsdE9wdGlvbnMuY29uY2F0KG9wdGlvbnMpKTtcbiAgICBjb25zdCBpbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZShbXG4gICAgICBDT01QSUxFUl9QUk9WSURFUlMsIHtcbiAgICAgICAgcHJvdmlkZTogQ29tcGlsZXJDb25maWcsXG4gICAgICAgIHVzZUZhY3Rvcnk6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IENvbXBpbGVyQ29uZmlnKHtcbiAgICAgICAgICAgIC8vIGxldCBleHBsaWNpdCB2YWx1ZXMgZnJvbSB0aGUgY29tcGlsZXIgb3B0aW9ucyBvdmVyd3JpdGUgb3B0aW9uc1xuICAgICAgICAgICAgLy8gZnJvbSB0aGUgYXBwIHByb3ZpZGVyc1xuICAgICAgICAgICAgdXNlSml0OiBvcHRzLnVzZUppdCxcbiAgICAgICAgICAgIGppdERldk1vZGU6IGlzRGV2TW9kZSgpLFxuICAgICAgICAgICAgLy8gbGV0IGV4cGxpY2l0IHZhbHVlcyBmcm9tIHRoZSBjb21waWxlciBvcHRpb25zIG92ZXJ3cml0ZSBvcHRpb25zXG4gICAgICAgICAgICAvLyBmcm9tIHRoZSBhcHAgcHJvdmlkZXJzXG4gICAgICAgICAgICBkZWZhdWx0RW5jYXBzdWxhdGlvbjogb3B0cy5kZWZhdWx0RW5jYXBzdWxhdGlvbixcbiAgICAgICAgICAgIG1pc3NpbmdUcmFuc2xhdGlvbjogb3B0cy5taXNzaW5nVHJhbnNsYXRpb24sXG4gICAgICAgICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBvcHRzLnByZXNlcnZlV2hpdGVzcGFjZXMsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlcHM6IFtdXG4gICAgICB9LFxuICAgICAgb3B0cy5wcm92aWRlcnMgIVxuICAgIF0pO1xuICAgIHJldHVybiBpbmplY3Rvci5nZXQoQ29tcGlsZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9tZXJnZU9wdGlvbnMob3B0aW9uc0FycjogQ29tcGlsZXJPcHRpb25zW10pOiBDb21waWxlck9wdGlvbnMge1xuICByZXR1cm4ge1xuICAgIHVzZUppdDogX2xhc3REZWZpbmVkKG9wdGlvbnNBcnIubWFwKG9wdGlvbnMgPT4gb3B0aW9ucy51c2VKaXQpKSxcbiAgICBkZWZhdWx0RW5jYXBzdWxhdGlvbjogX2xhc3REZWZpbmVkKG9wdGlvbnNBcnIubWFwKG9wdGlvbnMgPT4gb3B0aW9ucy5kZWZhdWx0RW5jYXBzdWxhdGlvbikpLFxuICAgIHByb3ZpZGVyczogX21lcmdlQXJyYXlzKG9wdGlvbnNBcnIubWFwKG9wdGlvbnMgPT4gb3B0aW9ucy5wcm92aWRlcnMgISkpLFxuICAgIG1pc3NpbmdUcmFuc2xhdGlvbjogX2xhc3REZWZpbmVkKG9wdGlvbnNBcnIubWFwKG9wdGlvbnMgPT4gb3B0aW9ucy5taXNzaW5nVHJhbnNsYXRpb24pKSxcbiAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBfbGFzdERlZmluZWQob3B0aW9uc0Fyci5tYXAob3B0aW9ucyA9PiBvcHRpb25zLnByZXNlcnZlV2hpdGVzcGFjZXMpKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gX2xhc3REZWZpbmVkPFQ+KGFyZ3M6IFRbXSk6IFR8dW5kZWZpbmVkIHtcbiAgZm9yIChsZXQgaSA9IGFyZ3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoYXJnc1tpXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gYXJnc1tpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gX21lcmdlQXJyYXlzKHBhcnRzOiBhbnlbXVtdKTogYW55W10ge1xuICBjb25zdCByZXN1bHQ6IGFueVtdID0gW107XG4gIHBhcnRzLmZvckVhY2goKHBhcnQpID0+IHBhcnQgJiYgcmVzdWx0LnB1c2goLi4ucGFydCkpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuIl19