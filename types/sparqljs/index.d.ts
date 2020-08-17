// Type definitions for sparqljs 3.0
// Project: https://github.com/RubenVerborgh/SPARQL.js
// Definitions by: Alexey Morozov <https://github.com/AlexeyMz>
//                 Ruben Taelman <https://github.com/rubensworks>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.1

import * as RdfJs from 'rdf-js';

export const Parser: {
    new (options?: ParserOptions): SparqlParser;
};

export interface ParserOptions {
  prefixes?: { [prefix: string]: string };
  baseIRI?: string;
  factory?: RdfJs.DataFactory;
}

export const Generator: {
    new (options?: GeneratorOptions): SparqlGenerator;
};

export interface GeneratorOptions {
    allPrefixes?: boolean;
}

export interface SparqlParser {
    parse(query: string): SparqlQuery;
}

export interface SparqlGenerator {
    stringify(query: SparqlQuery): string;
}

export class Wildcard {
    readonly termType: 'Wildcard';
    readonly value: '*';
    equals(other: RdfJs.Term | null | undefined): boolean;
}

export type Term = VariableTerm | IriTerm | LiteralTerm | BlankTerm;

export type VariableTerm = RdfJs.Variable;
export type IriTerm = RdfJs.NamedNode;
export type LiteralTerm = RdfJs.Literal;
export type BlankTerm = RdfJs.BlankNode;

export type SparqlQuery = Query | Update;

export type Query = SelectQuery | ConstructQuery | AskQuery | DescribeQuery;

export interface BaseQuery {
    type: 'query';
    base?: string;
    prefixes: { [prefix: string]: string; };
    where?: Pattern[];
    values?: ValuePatternRow[];
}

export interface SelectQuery extends BaseQuery {
    queryType: 'SELECT';
    variables: Variable[] | [Wildcard];
    distinct?: boolean;
    from?: {
        default: IriTerm[];
        named: IriTerm[];
    };
    reduced?: boolean;
    group?: Grouping[];
    having?: Expression[];
    order?: Ordering[];
    limit?: number;
    offset?: number;
}

export interface Grouping {
    expression: Expression;
}

export interface Ordering {
    expression: Expression;
    descending?: boolean;
}

export interface ConstructQuery extends BaseQuery {
    queryType: 'CONSTRUCT';
    template?: Triple[];
}

export interface AskQuery extends BaseQuery {
    queryType: 'ASK';
}

export interface DescribeQuery extends BaseQuery {
    queryType: 'DESCRIBE';
    variables: Variable[] | [Wildcard];
}

export interface Update {
    type: 'update';
    prefixes: { [prefix: string]: string; };
    updates: UpdateOperation[];
}

export type UpdateOperation = InsertDeleteOperation | ManagementOperation;

export interface InsertDeleteOperation {
    updateType: 'insert' | 'delete' | 'deletewhere' | 'insertdelete';
    graph?: IriTerm;
    insert?: Quads[];
    delete?: Quads[];
    where?: Pattern[];
}

export type Quads = BgpPattern | GraphQuads;

export type ManagementOperation =
    | CopyMoveAddOperation
    | LoadOperation
    | CreateOperation
    | ClearDropOperation;

export interface CopyMoveAddOperation {
    type: 'copy' | 'move' | 'add';
    silent: boolean;
    source: GraphOrDefault;
    destination: GraphOrDefault;
}

export interface LoadOperation {
    type: 'load';
    silent: boolean;
    source: IriTerm;
    destination: IriTerm | false;
}

export interface CreateOperation {
    type: 'create';
    silent: boolean;
    graph: IriTerm;
}

export interface ClearDropOperation {
    type: 'clear' | 'drop';
    silent: boolean;
    graph: GraphReference;
}

export interface GraphOrDefault {
    type: 'graph';
    name?: IriTerm;
    default?: boolean;
}

export interface GraphReference extends GraphOrDefault {
    named?: boolean;
    all?: boolean;
}

/**
 * Examples: '?var', '*',
 *   SELECT (?a as ?b) ... ==> { expression: '?a', variable: '?b' }
 */
export type Variable = VariableExpression | VariableTerm;

export interface VariableExpression {
    expression: Expression;
    variable: VariableTerm;
}

export type Pattern =
    | BgpPattern
    | BlockPattern
    | GraphPattern
    | ServicePattern
    | FilterPattern
    | BindPattern
    | ValuesPattern
    | SelectQuery;

/**
 * Basic Graph Pattern
 */
export interface BgpPattern {
    type: 'bgp';
    triples: Triple[];
}

export interface GraphQuads {
    type: 'graph';
    name: IriTerm;
    triples: Triple[];
}

export interface BlockPattern {
    type: 'optional' | 'union' | 'group' | 'minus' | 'graph' | 'service';
    patterns: Pattern[];
}

export interface GroupPattern extends BlockPattern {
    type: 'group';
}

export interface GraphPattern extends BlockPattern {
    type: 'graph';
    name: IriTerm;
}

export interface ServicePattern extends BlockPattern {
    type: 'service';
    name: IriTerm;
    silent: boolean;
}

export interface FilterPattern {
    type: 'filter';
    expression: Expression;
}

export interface BindPattern {
    type: 'bind';
    expression: Expression;
    variable: VariableTerm;
}

export interface ValuesPattern {
    type: 'values';
    values: ValuePatternRow[];
}

export interface ValuePatternRow {
    [variable: string]: IriTerm | BlankTerm | LiteralTerm | undefined;
}

export interface Triple {
    subject: Term;
    predicate: PropertyPath | Term;
    object: Term;
}

export interface PropertyPath {
    type: 'path';
    pathType: '|' | '/' | '^' | '+' | '*' | '!';
    items: Array<PropertyPath | Term>;
}

export type Expression =
    | OperationExpression
    | FunctionCallExpression
    | AggregateExpression
    | BgpPattern
    | GroupPattern
    | Tuple
    | Term;

// allow Expression circularly reference itself
// tslint:disable-next-line no-empty-interface
export interface Tuple extends Array<Expression> {}

export interface BaseExpression {
    type: string;
    distinct?: boolean;
}

export interface OperationExpression extends BaseExpression {
    type: 'operation';
    operator: string;
    args: Expression[];
}

export interface FunctionCallExpression extends BaseExpression {
    type: 'functionCall';
    function: string;
    args: Expression[];
}

export interface AggregateExpression extends BaseExpression {
    type: 'aggregate';
    expression: Expression;
    aggregation: string;
    separator?: string;
}
