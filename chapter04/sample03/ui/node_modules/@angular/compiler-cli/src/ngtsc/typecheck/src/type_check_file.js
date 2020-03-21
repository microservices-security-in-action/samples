(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_file", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/typecheck/src/environment", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_block"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var environment_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/environment");
    var type_check_block_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_block");
    /**
     * An `Environment` representing the single type-checking file into which most (if not all) Type
     * Check Blocks (TCBs) will be generated.
     *
     * The `TypeCheckFile` hosts multiple TCBs and allows the sharing of declarations (e.g. type
     * constructors) between them. Rather than return such declarations via `getPreludeStatements()`, it
     * hoists them to the top of the generated `ts.SourceFile`.
     */
    var TypeCheckFile = /** @class */ (function (_super) {
        tslib_1.__extends(TypeCheckFile, _super);
        function TypeCheckFile(fileName, config, refEmitter, reflector) {
            var _this = _super.call(this, config, new translator_1.ImportManager(new imports_1.NoopImportRewriter(), 'i'), refEmitter, reflector, ts.createSourceFile(fileName, '', ts.ScriptTarget.Latest, true)) || this;
            _this.fileName = fileName;
            _this.nextTcbId = 1;
            _this.tcbStatements = [];
            return _this;
        }
        TypeCheckFile.prototype.addTypeCheckBlock = function (ref, meta, domSchemaChecker, oobRecorder) {
            var fnId = ts.createIdentifier("_tcb" + this.nextTcbId++);
            var fn = type_check_block_1.generateTypeCheckBlock(this, ref, fnId, meta, domSchemaChecker, oobRecorder);
            this.tcbStatements.push(fn);
        };
        TypeCheckFile.prototype.render = function () {
            var e_1, _a, e_2, _b, e_3, _c, e_4, _d;
            var source = this.importManager.getAllImports(this.fileName)
                .map(function (i) { return "import * as " + i.qualifier + " from '" + i.specifier + "';"; })
                .join('\n') +
                '\n\n';
            var printer = ts.createPrinter();
            source += '\n';
            try {
                for (var _e = tslib_1.__values(this.helperStatements), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var stmt = _f.value;
                    source += printer.printNode(ts.EmitHint.Unspecified, stmt, this.contextFile) + '\n';
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                for (var _g = tslib_1.__values(this.pipeInstStatements), _h = _g.next(); !_h.done; _h = _g.next()) {
                    var stmt = _h.value;
                    source += printer.printNode(ts.EmitHint.Unspecified, stmt, this.contextFile) + '\n';
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                }
                finally { if (e_2) throw e_2.error; }
            }
            try {
                for (var _j = tslib_1.__values(this.typeCtorStatements), _k = _j.next(); !_k.done; _k = _j.next()) {
                    var stmt = _k.value;
                    source += printer.printNode(ts.EmitHint.Unspecified, stmt, this.contextFile) + '\n';
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_k && !_k.done && (_c = _j.return)) _c.call(_j);
                }
                finally { if (e_3) throw e_3.error; }
            }
            source += '\n';
            try {
                for (var _l = tslib_1.__values(this.tcbStatements), _m = _l.next(); !_m.done; _m = _l.next()) {
                    var stmt = _m.value;
                    source += printer.printNode(ts.EmitHint.Unspecified, stmt, this.contextFile) + '\n';
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_m && !_m.done && (_d = _l.return)) _d.call(_l);
                }
                finally { if (e_4) throw e_4.error; }
            }
            // Ensure the template type-checking file is an ES module. Otherwise, it's interpreted as some
            // kind of global namespace in TS, which forces a full re-typecheck of the user's program that
            // is somehow more expensive than the initial parse.
            source += '\nexport const IS_A_MODULE = true;\n';
            return ts.createSourceFile(this.fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        };
        TypeCheckFile.prototype.getPreludeStatements = function () { return []; };
        return TypeCheckFile;
    }(environment_1.Environment));
    exports.TypeCheckFile = TypeCheckFile;
    function typeCheckFilePath(rootDirs) {
        var shortest = rootDirs.concat([]).sort(function (a, b) { return a.length - b.length; })[0];
        return file_system_1.join(shortest, '__ng_typecheck__.ts');
    }
    exports.typeCheckFilePath = typeCheckFilePath;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZV9jaGVja19maWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy90eXBlY2hlY2svc3JjL3R5cGVfY2hlY2tfZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwrQkFBaUM7SUFFakMsMkVBQXVEO0lBQ3ZELG1FQUE4RTtJQUU5RSx5RUFBK0M7SUFJL0MseUZBQTBDO0lBRTFDLG1HQUEwRDtJQUkxRDs7Ozs7OztPQU9HO0lBQ0g7UUFBbUMseUNBQVc7UUFJNUMsdUJBQ1ksUUFBZ0IsRUFBRSxNQUEwQixFQUFFLFVBQTRCLEVBQ2xGLFNBQXlCO1lBRjdCLFlBR0Usa0JBQ0ksTUFBTSxFQUFFLElBQUksMEJBQWEsQ0FBQyxJQUFJLDRCQUFrQixFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFDL0UsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsU0FDckU7WUFMVyxjQUFRLEdBQVIsUUFBUSxDQUFRO1lBSnBCLGVBQVMsR0FBRyxDQUFDLENBQUM7WUFDZCxtQkFBYSxHQUFtQixFQUFFLENBQUM7O1FBUTNDLENBQUM7UUFFRCx5Q0FBaUIsR0FBakIsVUFDSSxHQUFxRCxFQUFFLElBQTRCLEVBQ25GLGdCQUFrQyxFQUFFLFdBQXdDO1lBQzlFLElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFPLElBQUksQ0FBQyxTQUFTLEVBQUksQ0FBQyxDQUFDO1lBQzVELElBQU0sRUFBRSxHQUFHLHlDQUFzQixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLENBQUMsQ0FB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Q0FBQztJQUMvQyxDQUFDO0lBSEQsOENBR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgam9pbn0gZnJvbSAnLi4vLi4vZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtOb29wSW1wb3J0UmV3cml0ZXIsIFJlZmVyZW5jZSwgUmVmZXJlbmNlRW1pdHRlcn0gZnJvbSAnLi4vLi4vaW1wb3J0cyc7XG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb24sIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcbmltcG9ydCB7SW1wb3J0TWFuYWdlcn0gZnJvbSAnLi4vLi4vdHJhbnNsYXRvcic7XG5cbmltcG9ydCB7VHlwZUNoZWNrQmxvY2tNZXRhZGF0YSwgVHlwZUNoZWNraW5nQ29uZmlnfSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge0RvbVNjaGVtYUNoZWNrZXJ9IGZyb20gJy4vZG9tJztcbmltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0IHtPdXRPZkJhbmREaWFnbm9zdGljUmVjb3JkZXJ9IGZyb20gJy4vb29iJztcbmltcG9ydCB7Z2VuZXJhdGVUeXBlQ2hlY2tCbG9ja30gZnJvbSAnLi90eXBlX2NoZWNrX2Jsb2NrJztcblxuXG5cbi8qKlxuICogQW4gYEVudmlyb25tZW50YCByZXByZXNlbnRpbmcgdGhlIHNpbmdsZSB0eXBlLWNoZWNraW5nIGZpbGUgaW50byB3aGljaCBtb3N0IChpZiBub3QgYWxsKSBUeXBlXG4gKiBDaGVjayBCbG9ja3MgKFRDQnMpIHdpbGwgYmUgZ2VuZXJhdGVkLlxuICpcbiAqIFRoZSBgVHlwZUNoZWNrRmlsZWAgaG9zdHMgbXVsdGlwbGUgVENCcyBhbmQgYWxsb3dzIHRoZSBzaGFyaW5nIG9mIGRlY2xhcmF0aW9ucyAoZS5nLiB0eXBlXG4gKiBjb25zdHJ1Y3RvcnMpIGJldHdlZW4gdGhlbS4gUmF0aGVyIHRoYW4gcmV0dXJuIHN1Y2ggZGVjbGFyYXRpb25zIHZpYSBgZ2V0UHJlbHVkZVN0YXRlbWVudHMoKWAsIGl0XG4gKiBob2lzdHMgdGhlbSB0byB0aGUgdG9wIG9mIHRoZSBnZW5lcmF0ZWQgYHRzLlNvdXJjZUZpbGVgLlxuICovXG5leHBvcnQgY2xhc3MgVHlwZUNoZWNrRmlsZSBleHRlbmRzIEVudmlyb25tZW50IHtcbiAgcHJpdmF0ZSBuZXh0VGNiSWQgPSAxO1xuICBwcml2YXRlIHRjYlN0YXRlbWVudHM6IHRzLlN0YXRlbWVudFtdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGZpbGVOYW1lOiBzdHJpbmcsIGNvbmZpZzogVHlwZUNoZWNraW5nQ29uZmlnLCByZWZFbWl0dGVyOiBSZWZlcmVuY2VFbWl0dGVyLFxuICAgICAgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCkge1xuICAgIHN1cGVyKFxuICAgICAgICBjb25maWcsIG5ldyBJbXBvcnRNYW5hZ2VyKG5ldyBOb29wSW1wb3J0UmV3cml0ZXIoKSwgJ2knKSwgcmVmRW1pdHRlciwgcmVmbGVjdG9yLFxuICAgICAgICB0cy5jcmVhdGVTb3VyY2VGaWxlKGZpbGVOYW1lLCAnJywgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgdHJ1ZSkpO1xuICB9XG5cbiAgYWRkVHlwZUNoZWNrQmxvY2soXG4gICAgICByZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+PiwgbWV0YTogVHlwZUNoZWNrQmxvY2tNZXRhZGF0YSxcbiAgICAgIGRvbVNjaGVtYUNoZWNrZXI6IERvbVNjaGVtYUNoZWNrZXIsIG9vYlJlY29yZGVyOiBPdXRPZkJhbmREaWFnbm9zdGljUmVjb3JkZXIpOiB2b2lkIHtcbiAgICBjb25zdCBmbklkID0gdHMuY3JlYXRlSWRlbnRpZmllcihgX3RjYiR7dGhpcy5uZXh0VGNiSWQrK31gKTtcbiAgICBjb25zdCBmbiA9IGdlbmVyYXRlVHlwZUNoZWNrQmxvY2sodGhpcywgcmVmLCBmbklkLCBtZXRhLCBkb21TY2hlbWFDaGVja2VyLCBvb2JSZWNvcmRlcik7XG4gICAgdGhpcy50Y2JTdGF0ZW1lbnRzLnB1c2goZm4pO1xuICB9XG5cbiAgcmVuZGVyKCk6IHRzLlNvdXJjZUZpbGUge1xuICAgIGxldCBzb3VyY2U6IHN0cmluZyA9IHRoaXMuaW1wb3J0TWFuYWdlci5nZXRBbGxJbXBvcnRzKHRoaXMuZmlsZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoaSA9PiBgaW1wb3J0ICogYXMgJHtpLnF1YWxpZmllcn0gZnJvbSAnJHtpLnNwZWNpZmllcn0nO2ApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5qb2luKCdcXG4nKSArXG4gICAgICAgICdcXG5cXG4nO1xuICAgIGNvbnN0IHByaW50ZXIgPSB0cy5jcmVhdGVQcmludGVyKCk7XG4gICAgc291cmNlICs9ICdcXG4nO1xuICAgIGZvciAoY29uc3Qgc3RtdCBvZiB0aGlzLmhlbHBlclN0YXRlbWVudHMpIHtcbiAgICAgIHNvdXJjZSArPSBwcmludGVyLnByaW50Tm9kZSh0cy5FbWl0SGludC5VbnNwZWNpZmllZCwgc3RtdCwgdGhpcy5jb250ZXh0RmlsZSkgKyAnXFxuJztcbiAgICB9XG4gICAgZm9yIChjb25zdCBzdG10IG9mIHRoaXMucGlwZUluc3RTdGF0ZW1lbnRzKSB7XG4gICAgICBzb3VyY2UgKz0gcHJpbnRlci5wcmludE5vZGUodHMuRW1pdEhpbnQuVW5zcGVjaWZpZWQsIHN0bXQsIHRoaXMuY29udGV4dEZpbGUpICsgJ1xcbic7XG4gICAgfVxuICAgIGZvciAoY29uc3Qgc3RtdCBvZiB0aGlzLnR5cGVDdG9yU3RhdGVtZW50cykge1xuICAgICAgc291cmNlICs9IHByaW50ZXIucHJpbnROb2RlKHRzLkVtaXRIaW50LlVuc3BlY2lmaWVkLCBzdG10LCB0aGlzLmNvbnRleHRGaWxlKSArICdcXG4nO1xuICAgIH1cbiAgICBzb3VyY2UgKz0gJ1xcbic7XG4gICAgZm9yIChjb25zdCBzdG10IG9mIHRoaXMudGNiU3RhdGVtZW50cykge1xuICAgICAgc291cmNlICs9IHByaW50ZXIucHJpbnROb2RlKHRzLkVtaXRIaW50LlVuc3BlY2lmaWVkLCBzdG10LCB0aGlzLmNvbnRleHRGaWxlKSArICdcXG4nO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB0aGUgdGVtcGxhdGUgdHlwZS1jaGVja2luZyBmaWxlIGlzIGFuIEVTIG1vZHVsZS4gT3RoZXJ3aXNlLCBpdCdzIGludGVycHJldGVkIGFzIHNvbWVcbiAgICAvLyBraW5kIG9mIGdsb2JhbCBuYW1lc3BhY2UgaW4gVFMsIHdoaWNoIGZvcmNlcyBhIGZ1bGwgcmUtdHlwZWNoZWNrIG9mIHRoZSB1c2VyJ3MgcHJvZ3JhbSB0aGF0XG4gICAgLy8gaXMgc29tZWhvdyBtb3JlIGV4cGVuc2l2ZSB0aGFuIHRoZSBpbml0aWFsIHBhcnNlLlxuICAgIHNvdXJjZSArPSAnXFxuZXhwb3J0IGNvbnN0IElTX0FfTU9EVUxFID0gdHJ1ZTtcXG4nO1xuXG4gICAgcmV0dXJuIHRzLmNyZWF0ZVNvdXJjZUZpbGUoXG4gICAgICAgIHRoaXMuZmlsZU5hbWUsIHNvdXJjZSwgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgdHJ1ZSwgdHMuU2NyaXB0S2luZC5UUyk7XG4gIH1cblxuICBnZXRQcmVsdWRlU3RhdGVtZW50cygpOiB0cy5TdGF0ZW1lbnRbXSB7IHJldHVybiBbXTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHlwZUNoZWNrRmlsZVBhdGgocm9vdERpcnM6IEFic29sdXRlRnNQYXRoW10pOiBBYnNvbHV0ZUZzUGF0aCB7XG4gIGNvbnN0IHNob3J0ZXN0ID0gcm9vdERpcnMuY29uY2F0KFtdKS5zb3J0KChhLCBiKSA9PiBhLmxlbmd0aCAtIGIubGVuZ3RoKVswXTtcbiAgcmV0dXJuIGpvaW4oc2hvcnRlc3QsICdfX25nX3R5cGVjaGVja19fLnRzJyk7XG59XG4iXX0=