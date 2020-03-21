(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/analysis/private_declarations_analyzer", ["require", "exports", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/utils");
    /**
     * This class will analyze a program to find all the declared classes
     * (i.e. on an NgModule) that are not publicly exported via an entry-point.
     */
    var PrivateDeclarationsAnalyzer = /** @class */ (function () {
        function PrivateDeclarationsAnalyzer(host, referencesRegistry) {
            this.host = host;
            this.referencesRegistry = referencesRegistry;
        }
        PrivateDeclarationsAnalyzer.prototype.analyzeProgram = function (program) {
            var rootFiles = this.getRootFiles(program);
            return this.getPrivateDeclarations(rootFiles, this.referencesRegistry.getDeclarationMap());
        };
        PrivateDeclarationsAnalyzer.prototype.getRootFiles = function (program) {
            return program.getRootFileNames().map(function (f) { return program.getSourceFile(f); }).filter(utils_1.isDefined);
        };
        PrivateDeclarationsAnalyzer.prototype.getPrivateDeclarations = function (rootFiles, declarations) {
            var _this = this;
            var privateDeclarations = new Map(declarations);
            rootFiles.forEach(function (f) {
                var exports = _this.host.getExportsOfModule(f);
                if (exports) {
                    exports.forEach(function (declaration, exportedName) {
                        if (declaration.node !== null && utils_1.hasNameIdentifier(declaration.node)) {
                            if (privateDeclarations.has(declaration.node.name)) {
                                var privateDeclaration = privateDeclarations.get(declaration.node.name);
                                if (privateDeclaration.node !== declaration.node) {
                                    throw new Error(declaration.node.name.text + " is declared multiple times.");
                                }
                                // This declaration is public so we can remove it from the list
                                privateDeclarations.delete(declaration.node.name);
                            }
                        }
                    });
                }
            });
            return Array.from(privateDeclarations.keys()).map(function (id) {
                var from = file_system_1.absoluteFromSourceFile(id.getSourceFile());
                var declaration = privateDeclarations.get(id);
                var dtsDeclaration = _this.host.getDtsDeclaration(declaration.node);
                var dtsFrom = dtsDeclaration && file_system_1.absoluteFromSourceFile(dtsDeclaration.getSourceFile());
                return { identifier: id.text, from: from, dtsFrom: dtsFrom };
            });
        };
        return PrivateDeclarationsAnalyzer;
    }());
    exports.PrivateDeclarationsAnalyzer = PrivateDeclarationsAnalyzer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpdmF0ZV9kZWNsYXJhdGlvbnNfYW5hbHl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvYW5hbHlzaXMvcHJpdmF0ZV9kZWNsYXJhdGlvbnNfYW5hbHl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFTQSwyRUFBc0Y7SUFHdEYsOERBQXNEO0lBVXREOzs7T0FHRztJQUNIO1FBQ0UscUNBQ1ksSUFBd0IsRUFBVSxrQkFBMEM7WUFBNUUsU0FBSSxHQUFKLElBQUksQ0FBb0I7WUFBVSx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXdCO1FBQUcsQ0FBQztRQUU1RixvREFBYyxHQUFkLFVBQWUsT0FBbUI7WUFDaEMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3QyxPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztRQUM3RixDQUFDO1FBRU8sa0RBQVksR0FBcEIsVUFBcUIsT0FBbUI7WUFDdEMsT0FBTyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUF4QixDQUF3QixDQUFDLENBQUMsTUFBTSxDQUFDLGlCQUFTLENBQUMsQ0FBQztRQUN6RixDQUFDO1FBRU8sNERBQXNCLEdBQTlCLFVBQ0ksU0FBMEIsRUFDMUIsWUFBcUQ7WUFGekQsaUJBK0JDO1lBNUJDLElBQU0sbUJBQW1CLEdBQTRDLElBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTNGLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO2dCQUNqQixJQUFNLE9BQU8sR0FBRyxLQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLE9BQU8sRUFBRTtvQkFDWCxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsV0FBVyxFQUFFLFlBQVk7d0JBQ3hDLElBQUksV0FBVyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUkseUJBQWlCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFOzRCQUNwRSxJQUFJLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO2dDQUNsRCxJQUFNLGtCQUFrQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRyxDQUFDO2dDQUM1RSxJQUFJLGtCQUFrQixDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsSUFBSSxFQUFFO29DQUNoRCxNQUFNLElBQUksS0FBSyxDQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksaUNBQThCLENBQUMsQ0FBQztpQ0FDOUU7Z0NBQ0QsK0RBQStEO2dDQUMvRCxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs2QkFDbkQ7eUJBQ0Y7b0JBQ0gsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEVBQUU7Z0JBQ2xELElBQU0sSUFBSSxHQUFHLG9DQUFzQixDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO2dCQUN4RCxJQUFNLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFHLENBQUM7Z0JBQ2xELElBQU0sY0FBYyxHQUFHLEtBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyRSxJQUFNLE9BQU8sR0FBRyxjQUFjLElBQUksb0NBQXNCLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7Z0JBRXpGLE9BQU8sRUFBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLE1BQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO1lBQzlDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNILGtDQUFDO0lBQUQsQ0FBQyxBQTdDRCxJQTZDQztJQTdDWSxrRUFBMkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgYWJzb2x1dGVGcm9tU291cmNlRmlsZX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Q29uY3JldGVEZWNsYXJhdGlvbn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtOZ2NjUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uL2hvc3QvbmdjY19ob3N0JztcbmltcG9ydCB7aGFzTmFtZUlkZW50aWZpZXIsIGlzRGVmaW5lZH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHtOZ2NjUmVmZXJlbmNlc1JlZ2lzdHJ5fSBmcm9tICcuL25nY2NfcmVmZXJlbmNlc19yZWdpc3RyeSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXhwb3J0SW5mbyB7XG4gIGlkZW50aWZpZXI6IHN0cmluZztcbiAgZnJvbTogQWJzb2x1dGVGc1BhdGg7XG4gIGR0c0Zyb20/OiBBYnNvbHV0ZUZzUGF0aHxudWxsO1xufVxuZXhwb3J0IHR5cGUgUHJpdmF0ZURlY2xhcmF0aW9uc0FuYWx5c2VzID0gRXhwb3J0SW5mb1tdO1xuXG4vKipcbiAqIFRoaXMgY2xhc3Mgd2lsbCBhbmFseXplIGEgcHJvZ3JhbSB0byBmaW5kIGFsbCB0aGUgZGVjbGFyZWQgY2xhc3Nlc1xuICogKGkuZS4gb24gYW4gTmdNb2R1bGUpIHRoYXQgYXJlIG5vdCBwdWJsaWNseSBleHBvcnRlZCB2aWEgYW4gZW50cnktcG9pbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBQcml2YXRlRGVjbGFyYXRpb25zQW5hbHl6ZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaG9zdDogTmdjY1JlZmxlY3Rpb25Ib3N0LCBwcml2YXRlIHJlZmVyZW5jZXNSZWdpc3RyeTogTmdjY1JlZmVyZW5jZXNSZWdpc3RyeSkge31cblxuICBhbmFseXplUHJvZ3JhbShwcm9ncmFtOiB0cy5Qcm9ncmFtKTogUHJpdmF0ZURlY2xhcmF0aW9uc0FuYWx5c2VzIHtcbiAgICBjb25zdCByb290RmlsZXMgPSB0aGlzLmdldFJvb3RGaWxlcyhwcm9ncmFtKTtcbiAgICByZXR1cm4gdGhpcy5nZXRQcml2YXRlRGVjbGFyYXRpb25zKHJvb3RGaWxlcywgdGhpcy5yZWZlcmVuY2VzUmVnaXN0cnkuZ2V0RGVjbGFyYXRpb25NYXAoKSk7XG4gIH1cblxuICBwcml2YXRlIGdldFJvb3RGaWxlcyhwcm9ncmFtOiB0cy5Qcm9ncmFtKTogdHMuU291cmNlRmlsZVtdIHtcbiAgICByZXR1cm4gcHJvZ3JhbS5nZXRSb290RmlsZU5hbWVzKCkubWFwKGYgPT4gcHJvZ3JhbS5nZXRTb3VyY2VGaWxlKGYpKS5maWx0ZXIoaXNEZWZpbmVkKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UHJpdmF0ZURlY2xhcmF0aW9ucyhcbiAgICAgIHJvb3RGaWxlczogdHMuU291cmNlRmlsZVtdLFxuICAgICAgZGVjbGFyYXRpb25zOiBNYXA8dHMuSWRlbnRpZmllciwgQ29uY3JldGVEZWNsYXJhdGlvbj4pOiBQcml2YXRlRGVjbGFyYXRpb25zQW5hbHlzZXMge1xuICAgIGNvbnN0IHByaXZhdGVEZWNsYXJhdGlvbnM6IE1hcDx0cy5JZGVudGlmaWVyLCBDb25jcmV0ZURlY2xhcmF0aW9uPiA9IG5ldyBNYXAoZGVjbGFyYXRpb25zKTtcblxuICAgIHJvb3RGaWxlcy5mb3JFYWNoKGYgPT4ge1xuICAgICAgY29uc3QgZXhwb3J0cyA9IHRoaXMuaG9zdC5nZXRFeHBvcnRzT2ZNb2R1bGUoZik7XG4gICAgICBpZiAoZXhwb3J0cykge1xuICAgICAgICBleHBvcnRzLmZvckVhY2goKGRlY2xhcmF0aW9uLCBleHBvcnRlZE5hbWUpID0+IHtcbiAgICAgICAgICBpZiAoZGVjbGFyYXRpb24ubm9kZSAhPT0gbnVsbCAmJiBoYXNOYW1lSWRlbnRpZmllcihkZWNsYXJhdGlvbi5ub2RlKSkge1xuICAgICAgICAgICAgaWYgKHByaXZhdGVEZWNsYXJhdGlvbnMuaGFzKGRlY2xhcmF0aW9uLm5vZGUubmFtZSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgcHJpdmF0ZURlY2xhcmF0aW9uID0gcHJpdmF0ZURlY2xhcmF0aW9ucy5nZXQoZGVjbGFyYXRpb24ubm9kZS5uYW1lKSAhO1xuICAgICAgICAgICAgICBpZiAocHJpdmF0ZURlY2xhcmF0aW9uLm5vZGUgIT09IGRlY2xhcmF0aW9uLm5vZGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVjbGFyYXRpb24ubm9kZS5uYW1lLnRleHR9IGlzIGRlY2xhcmVkIG11bHRpcGxlIHRpbWVzLmApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIFRoaXMgZGVjbGFyYXRpb24gaXMgcHVibGljIHNvIHdlIGNhbiByZW1vdmUgaXQgZnJvbSB0aGUgbGlzdFxuICAgICAgICAgICAgICBwcml2YXRlRGVjbGFyYXRpb25zLmRlbGV0ZShkZWNsYXJhdGlvbi5ub2RlLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gQXJyYXkuZnJvbShwcml2YXRlRGVjbGFyYXRpb25zLmtleXMoKSkubWFwKGlkID0+IHtcbiAgICAgIGNvbnN0IGZyb20gPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKGlkLmdldFNvdXJjZUZpbGUoKSk7XG4gICAgICBjb25zdCBkZWNsYXJhdGlvbiA9IHByaXZhdGVEZWNsYXJhdGlvbnMuZ2V0KGlkKSAhO1xuICAgICAgY29uc3QgZHRzRGVjbGFyYXRpb24gPSB0aGlzLmhvc3QuZ2V0RHRzRGVjbGFyYXRpb24oZGVjbGFyYXRpb24ubm9kZSk7XG4gICAgICBjb25zdCBkdHNGcm9tID0gZHRzRGVjbGFyYXRpb24gJiYgYWJzb2x1dGVGcm9tU291cmNlRmlsZShkdHNEZWNsYXJhdGlvbi5nZXRTb3VyY2VGaWxlKCkpO1xuXG4gICAgICByZXR1cm4ge2lkZW50aWZpZXI6IGlkLnRleHQsIGZyb20sIGR0c0Zyb219O1xuICAgIH0pO1xuICB9XG59XG4iXX0=