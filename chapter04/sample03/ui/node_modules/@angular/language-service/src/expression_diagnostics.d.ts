/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/language-service/src/expression_diagnostics" />
import { Node, TemplateAst, TemplateAstPath } from '@angular/compiler';
import { SymbolQuery, SymbolTable } from './symbols';
import * as ng from './types';
export interface DiagnosticTemplateInfo {
    fileName?: string;
    offset: number;
    query: SymbolQuery;
    members: SymbolTable;
    htmlAst: Node[];
    templateAst: TemplateAst[];
}
export declare function getTemplateExpressionDiagnostics(info: DiagnosticTemplateInfo): ng.Diagnostic[];
/**
 * Returns the symbols available in a particular scope of a template.
 * @param info parsed template information
 * @param path path of template nodes narrowing to the context the expression scope should be
 * derived for.
 */
export declare function getExpressionScope(info: DiagnosticTemplateInfo, path: TemplateAstPath): SymbolTable;
