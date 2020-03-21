/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/language-service/src/utils" />
import { BoundEventAst, CompileTypeMetadata, HtmlAstPath, Node, ParseSourceSpan, TemplateAst, TemplateAstPath } from '@angular/compiler';
import * as ts from 'typescript';
import { AstResult, SelectorInfo } from './common';
import { DiagnosticTemplateInfo } from './expression_diagnostics';
import { Span, Symbol, SymbolQuery } from './types';
export interface SpanHolder {
    sourceSpan: ParseSourceSpan;
    endSourceSpan?: ParseSourceSpan | null;
    children?: SpanHolder[];
}
export declare function isParseSourceSpan(value: any): value is ParseSourceSpan;
export declare function spanOf(span: SpanHolder): Span;
export declare function spanOf(span: ParseSourceSpan): Span;
export declare function spanOf(span: SpanHolder | ParseSourceSpan | undefined): Span | undefined;
export declare function inSpan(position: number, span?: Span, exclusive?: boolean): boolean;
export declare function offsetSpan(span: Span, amount: number): Span;
export declare function isNarrower(spanA: Span, spanB: Span): boolean;
export declare function hasTemplateReference(type: CompileTypeMetadata): boolean;
export declare function getSelectors(info: AstResult): SelectorInfo;
export declare function isTypescriptVersion(low: string, high?: string): boolean;
export declare function diagnosticInfoFromTemplateInfo(info: AstResult): DiagnosticTemplateInfo;
export declare function findTemplateAstAt(ast: TemplateAst[], position: number): TemplateAstPath;
/**
 * Return the node that most tightly encompass the specified `position`.
 * @param node
 * @param position
 */
export declare function findTightestNode(node: ts.Node, position: number): ts.Node | undefined;
interface DirectiveClassLike {
    decoratorId: ts.Identifier;
    classId: ts.Identifier;
}
/**
 * Return metadata about `node` if it looks like an Angular directive class.
 * In this case, potential matches are `@NgModule`, `@Component`, `@Directive`,
 * `@Pipe`, etc.
 * These class declarations all share some common attributes, namely their
 * decorator takes exactly one parameter and the parameter must be an object
 * literal.
 *
 * For example,
 *     v---------- `decoratorId`
 * @NgModule({           <
 *   declarations: [],   < classDecl
 * })                    <
 * class AppModule {}    <
 *          ^----- `classId`
 *
 * @param node Potential node that represents an Angular directive.
 */
export declare function getDirectiveClassLike(node: ts.Node): DirectiveClassLike | undefined;
/**
 * Finds the value of a property assignment that is nested in a TypeScript node and is of a certain
 * type T.
 *
 * @param startNode node to start searching for nested property assignment from
 * @param propName property assignment name
 * @param predicate function to verify that a node is of type T.
 * @return node property assignment value of type T, or undefined if none is found
 */
export declare function findPropertyValueOfType<T extends ts.Node>(startNode: ts.Node, propName: string, predicate: (node: ts.Node) => node is T): T | undefined;
/**
 * Find the tightest node at the specified `position` from the AST `nodes`, and
 * return the path to the node.
 * @param nodes HTML AST nodes
 * @param position
 */
export declare function getPathToNodeAtPosition(nodes: Node[], position: number): HtmlAstPath;
/**
 * Inverts an object's key-value pairs.
 */
export declare function invertMap(obj: {
    [name: string]: string;
}): {
    [name: string]: string;
};
/**
 * Finds the directive member providing a template output binding, if one exists.
 * @param info aggregate template AST information
 * @param path narrowing
 */
export declare function findOutputBinding(binding: BoundEventAst, path: TemplateAstPath, query: SymbolQuery): Symbol | undefined;
export {};
