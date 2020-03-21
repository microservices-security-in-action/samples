/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/language-service/src/template" />
import * as ts from 'typescript';
import * as ng from './types';
import { TypeScriptServiceHost } from './typescript_host';
/**
 * A base class to represent a template and which component class it is
 * associated with. A template source could answer basic questions about
 * top-level declarations of its class through the members() and query()
 * methods.
 */
declare abstract class BaseTemplate implements ng.TemplateSource {
    private readonly host;
    private readonly classDeclNode;
    private readonly classSymbol;
    private readonly program;
    private membersTable;
    private queryCache;
    constructor(host: TypeScriptServiceHost, classDeclNode: ts.ClassDeclaration, classSymbol: ng.StaticSymbol);
    abstract get span(): ng.Span;
    abstract get fileName(): string;
    abstract get source(): string;
    /**
     * Return the Angular StaticSymbol for the class that contains this template.
     */
    get type(): ng.StaticSymbol;
    /**
     * Return a Map-like data structure that allows users to retrieve some or all
     * top-level declarations in the associated component class.
     */
    get members(): ng.SymbolTable;
    /**
     * Return an engine that provides more information about symbols in the
     * template.
     */
    get query(): ng.SymbolQuery;
}
/**
 * An InlineTemplate represents template defined in a TS file through the
 * `template` attribute in the decorator.
 */
export declare class InlineTemplate extends BaseTemplate {
    readonly fileName: string;
    readonly source: string;
    readonly span: ng.Span;
    constructor(templateNode: ts.StringLiteralLike, classDeclNode: ts.ClassDeclaration, classSymbol: ng.StaticSymbol, host: TypeScriptServiceHost);
}
/**
 * An ExternalTemplate represents template defined in an external (most likely
 * HTML, but not necessarily) file through the `templateUrl` attribute in the
 * decorator.
 * Note that there is no ts.Node associated with the template because it's not
 * a TS file.
 */
export declare class ExternalTemplate extends BaseTemplate {
    readonly source: string;
    readonly fileName: string;
    readonly span: ng.Span;
    constructor(source: string, fileName: string, classDeclNode: ts.ClassDeclaration, classSymbol: ng.StaticSymbol, host: TypeScriptServiceHost);
}
/**
 * Returns a property assignment from the assignment value, or `undefined` if there is no
 * assignment.
 */
export declare function getPropertyAssignmentFromValue(value: ts.Node): ts.PropertyAssignment | undefined;
/**
 * Given a decorator property assignment, return the ClassDeclaration node that corresponds to the
 * directive class the property applies to.
 * If the property assignment is not on a class decorator, no declaration is returned.
 *
 * For example,
 *
 * @Component({
 *   template: '<div></div>'
 *   ^^^^^^^^^^^^^^^^^^^^^^^---- property assignment
 * })
 * class AppComponent {}
 *           ^---- class declaration node
 *
 * @param propAsgn property assignment
 */
export declare function getClassDeclFromDecoratorProp(propAsgnNode: ts.PropertyAssignment): ts.ClassDeclaration | undefined;
/**
 * Determines if a property assignment is on a class decorator.
 * See `getClassDeclFromDecoratorProperty`, which gets the class the decorator is applied to, for
 * more details.
 *
 * @param prop property assignment
 */
export declare function isClassDecoratorProperty(propAsgn: ts.PropertyAssignment): boolean;
export {};
