/* eslint-disable */
import {
  ArrayBindingElement,
  ArrayBindingPattern,
  ArrayLiteralExpression,
  ArrowFunction,
  AsExpression,
  AwaitExpression,
  BigIntLiteral,
  BinaryExpression,
  BindingElement,
  BindingName,
  Block,
  BooleanLiteral,
  BreakStatement,
  CallExpression,
  CaseBlock,
  CaseClause,
  CatchClause,
  ClassDeclaration,
  ClassExpression,
  CompilerOptions,
  ComputedPropertyName,
  ConditionalExpression,
  ConstructorDeclaration,
  ContinueStatement,
  createIdentifier,
  createSourceFile,
  DebuggerStatement,
  Decorator,
  DefaultClause,
  DeleteExpression,
  DoStatement,
  ElementAccessExpression,
  EmptyStatement,
  EnumDeclaration,
  EnumMember,
  ExportAssignment,
  ExportDeclaration,
  ExportSpecifier,
  ExpressionStatement,
  ExpressionWithTypeArguments,
  ExternalModuleReference,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  FunctionDeclaration,
  FunctionExpression,
  GetAccessorDeclaration,
  HeritageClause,
  Identifier,
  IfStatement,
  ImportClause,
  ImportDeclaration,
  ImportEqualsDeclaration,
  ImportSpecifier,
  InterfaceDeclaration,
  JsxAttribute,
  JsxAttributes,
  JsxChild,
  JsxClosingElement,
  JsxClosingFragment,
  JsxElement,
  JsxExpression,
  JsxFragment,
  JsxOpeningElement,
  JsxOpeningFragment,
  JsxSelfClosingElement,
  JsxSpreadAttribute,
  JsxTagNameExpression,
  JsxText,
  LabeledStatement,
  MetaProperty,
  MethodDeclaration,
  Modifier,
  ModifierFlags,
  ModuleBlock,
  ModuleDeclaration,
  NamedExports,
  NamedImports,
  NamespaceExportDeclaration,
  NamespaceImport,
  NewExpression,
  Node,
  NodeArray,
  NodeFlags,
  NonNullExpression,
  NoSubstitutionTemplateLiteral,
  NullLiteral,
  NumericLiteral,
  ObjectBindingPattern,
  ObjectLiteralElementLike,
  ObjectLiteralExpression,
  OmittedExpression,
  ParameterDeclaration,
  ParenthesizedExpression,
  PostfixUnaryExpression,
  PrefixUnaryExpression,
  PropertyAccessExpression,
  PropertyAssignment,
  PropertyDeclaration,
  PropertyName,
  QualifiedName,
  RegularExpressionLiteral,
  ReturnStatement,
  ScriptTarget,
  SemicolonClassElement,
  SetAccessorDeclaration,
  ShorthandPropertyAssignment,
  SourceFile,
  SpreadAssignment,
  SpreadElement,
  StringLiteral,
  SuperExpression,
  SwitchStatement,
  SyntaxKind,
  TaggedTemplateExpression,
  TemplateExpression,
  TemplateHead,
  TemplateMiddle,
  TemplateSpan,
  TemplateTail,
  ThisExpression,
  ThrowStatement,
  tokenToString,
  TryStatement,
  TypeAliasDeclaration,
  TypeAssertion,
  TypeOfExpression,
  VariableDeclaration,
  VariableDeclarationList,
  VariableStatement,
  VoidExpression,
  WhileStatement,
  WithStatement,
  YieldExpression,
  Statement,
  Expression,
} from 'typescript';
import {
  PLATFORM,
  Writable,
  ILogger,
} from '@aurelia/kernel';
import { IFile } from '../system/interfaces';
import { NPMPackage } from '../system/npm-package-loader';
import { IModule, ResolveSet, ResolvedBindingRecord, Realm } from './realm';
import { empty, $Undefined, $Object, $String, $NamespaceExoticObject, $Empty, $Null, $ECMAScriptFunction, $Reference, $Boolean, $Number } from './value';
import { PatternMatcher } from '../system/pattern-matcher';
import { $ModuleEnvRec, $EnvRec } from './environment';
const {
  emptyArray,
  emptyObject,
} = PLATFORM;

function hasBit(flag: number, bit: number): boolean {
  return (flag & bit) > 0;
}

function hasAllBits(flag: number, bit: number): boolean {
  return (flag & bit) === bit;
}

function clearBit(flag: number, bit: number): number {
  return (flag | bit) ^ bit;
}

const enum Context {
  None                      = 0b00000000000000000,
  InTopLevel                = 0b00000000000000001,
  InExpressionStatement     = 0b00000000000000010,
  InVariableStatement       = 0b00000000000000100,
  IsBindingName             = 0b00000000000001000,
  InParameterDeclaration    = 0b00000000000010000,
  InCatchClause             = 0b00000000000100000,
  InBindingPattern          = 0b00000000001000000,
  InTypeElement             = 0b00000000010000000,
  IsPropertyAccessName      = 0b00000000100000000,
  IsMemberName              = 0b00000001000000000,
  IsLabel                   = 0b00000010000000000,
  IsLabelReference          = 0b00000100000000000,
  InExport                  = 0b00001000000000000,
  IsConst                   = 0b00010000000000000,
  IsLet                     = 0b00100000000000000,
  IsBlockScoped             = 0b00110000000000000,
  IsVar                     = 0b01000000000000000,
  IsFunctionScoped          = 0b01000000000000000,
  InStrictMode              = 0b10000000000000000,
}

const modifiersToModifierFlags = (function () {
  const lookup = Object.assign(Object.create(null) as {}, {
    [SyntaxKind.ConstKeyword]: ModifierFlags.Const,
    [SyntaxKind.DefaultKeyword]: ModifierFlags.Default,
    [SyntaxKind.ExportKeyword]: ModifierFlags.Export,
    [SyntaxKind.AsyncKeyword]: ModifierFlags.Async,
    [SyntaxKind.PrivateKeyword]: ModifierFlags.Private,
    [SyntaxKind.ProtectedKeyword]: ModifierFlags.Protected,
    [SyntaxKind.PublicKeyword]: ModifierFlags.Public,
    [SyntaxKind.StaticKeyword]: ModifierFlags.Static,
    [SyntaxKind.AbstractKeyword]: ModifierFlags.Abstract,
    [SyntaxKind.DeclareKeyword]: ModifierFlags.Ambient,
    [SyntaxKind.ReadonlyKeyword]: ModifierFlags.Readonly,
  } as const);

  return function (mods: readonly Modifier[] | undefined): ModifierFlags {
    if (mods === void 0) {
      return ModifierFlags.None;
    }
    const len = mods.length;
    if (len === 1) {
      return lookup[mods[0].kind];
    } else if (len === 2) {
      return lookup[mods[0].kind] + lookup[mods[1].kind];
    } else if (len === 3) {
      return lookup[mods[0].kind] + lookup[mods[1].kind] + lookup[mods[2].kind];
    } else {
      // More than 4 modifiers is not possible
      return lookup[mods[0].kind] + lookup[mods[1].kind] + lookup[mods[2].kind] + lookup[mods[3].kind];
    }
  }
})();

export interface I$Node<
  TNode extends object = object,
  > {
  readonly depth: number;
  readonly realm: Realm;
  readonly parent: I$Node;
  readonly node: TNode;
  readonly ctx: Context;
}
// #region TS AST unions

type $PrimaryExpressionNode = (
  $LiteralNode |
  ArrayLiteralExpression |
  ClassExpression |
  FunctionExpression |
  Identifier |
  NewExpression |
  ObjectLiteralExpression |
  ParenthesizedExpression |
  TemplateExpression |
  ThisExpression |
  SuperExpression
);

type $MemberExpressionNode = (
  $PrimaryExpressionNode |
  ElementAccessExpression |
  NonNullExpression |
  PropertyAccessExpression |
  TaggedTemplateExpression
);

type $CallExpressionNode = (
  $MemberExpressionNode |
  CallExpression
);

type $LHSExpressionNode = (
  $CallExpressionNode |
  MetaProperty
);

type $UpdateExpressionNode = (
  $LHSExpressionNode |
  JsxElement |
  JsxFragment |
  JsxSelfClosingElement |
  PostfixUnaryExpression |
  PrefixUnaryExpression
);

type $UnaryExpressionNode = (
  $UpdateExpressionNode |
  AwaitExpression |
  DeleteExpression |
  PrefixUnaryExpression |
  TypeAssertion |
  TypeOfExpression |
  VoidExpression
);

type $BinaryExpressionNode = (
  $UnaryExpressionNode |
  AsExpression |
  BinaryExpression
);

type $AssignmentExpressionNode = (
  $BinaryExpressionNode |
  ArrowFunction |
  ConditionalExpression |
  YieldExpression
);

type $ArgumentOrArrayLiteralElementNode = (
  $AssignmentExpressionNode |
  SpreadElement |
  OmittedExpression
);

type $LiteralNode = (
  NumericLiteral |
  BigIntLiteral |
  StringLiteral |
  RegularExpressionLiteral |
  NoSubstitutionTemplateLiteral |
  NullLiteral |
  BooleanLiteral
);

type $ModuleStatementNode = (
  ModuleDeclaration |
  NamespaceExportDeclaration |
  ImportEqualsDeclaration |
  ImportDeclaration |
  ExportAssignment |
  ExportDeclaration
);

type $StatementNode = (
  Block |
  VariableStatement |
  EmptyStatement |
  ExpressionStatement |
  IfStatement |
  DoStatement |
  WhileStatement |
  ForStatement |
  ForInStatement |
  ForOfStatement |
  ContinueStatement |
  BreakStatement |
  ReturnStatement |
  WithStatement |
  SwitchStatement |
  LabeledStatement |
  ThrowStatement |
  TryStatement |
  DebuggerStatement |
  FunctionDeclaration |
  ClassDeclaration |
  InterfaceDeclaration |
  TypeAliasDeclaration |
  EnumDeclaration |
  ModuleDeclaration |
  NamespaceExportDeclaration |
  ImportEqualsDeclaration |
  ImportDeclaration |
  ExportAssignment |
  ExportDeclaration
);

type $ClassElementNode = (
  GetAccessorDeclaration |
  SetAccessorDeclaration |
  ConstructorDeclaration |
  MethodDeclaration |
  SemicolonClassElement |
  PropertyDeclaration
);

// #endregion

// #region $Node type unions

type $AnyParentNode = (
  $$TSModuleItem |
  $ArrayBindingPattern |
  $ArrayLiteralExpression |
  $ArrowFunction |
  $AsExpression |
  $AwaitExpression |
  $BinaryExpression |
  $BindingElement |
  $Block |
  $BreakStatement |
  $CallExpression |
  $CaseBlock |
  $CaseClause |
  $CatchClause |
  $ClassExpression |
  $ComputedPropertyName |
  $ConditionalExpression |
  $ConstructorDeclaration |
  $ContinueStatement |
  $Decorator |
  $DefaultClause |
  $DeleteExpression |
  $DoStatement |
  $ElementAccessExpression |
  $EnumMember |
  $ExportSpecifier |
  $ExpressionStatement |
  $ExpressionWithTypeArguments |
  $ExternalModuleReference |
  $ForInStatement |
  $ForOfStatement |
  $ForStatement |
  $FunctionExpression |
  $GetAccessorDeclaration |
  $HeritageClause |
  $IfStatement |
  $ImportClause |
  $ImportSpecifier |
  $JsxAttribute |
  $JsxAttributes |
  $JsxClosingElement |
  $JsxElement |
  $JsxExpression |
  $JsxFragment |
  $JsxOpeningElement |
  $JsxSelfClosingElement |
  $JsxSpreadAttribute |
  $LabeledStatement |
  $MetaProperty |
  $MethodDeclaration |
  $ModuleBlock |
  $NamedImports |
  $NamespaceImport |
  $NewExpression |
  $NonNullExpression |
  $ObjectBindingPattern |
  $ObjectLiteralExpression |
  $ParameterDeclaration |
  $ParenthesizedExpression |
  $PostfixUnaryExpression |
  $PrefixUnaryExpression |
  $PropertyAccessExpression |
  $PropertyAssignment |
  $PropertyDeclaration |
  $QualifiedName |
  $ReturnStatement |
  $SetAccessorDeclaration |
  $ShorthandPropertyAssignment |
  $SourceFile |
  $SpreadAssignment |
  $SpreadElement |
  $SwitchStatement |
  $TaggedTemplateExpression |
  $TemplateExpression |
  $TemplateSpan |
  $ThrowStatement |
  $TryStatement |
  $TypeAssertion |
  $TypeOfExpression |
  $VariableDeclaration |
  $VariableDeclarationList |
  $VoidExpression |
  $WhileStatement |
  $WithStatement |
  $YieldExpression
);

type $$JsxOpeningLikeElement = (
  $JsxSelfClosingElement |
  $JsxOpeningElement
);

// #endregion

// #region Builders

type $$BinaryExpression = (
  $AsExpression |
  $BinaryExpression
);

type $$BinaryExpressionOrHigher = (
  $$UnaryExpressionOrHigher |
  $$BinaryExpression
);

type $$AssignmentExpression = (
  $ArrowFunction |
  $ConditionalExpression |
  $YieldExpression
);

export type $$AssignmentExpressionOrHigher = (
  $$BinaryExpressionOrHigher |
  $$AssignmentExpression
);

function $assignmentExpression(
  node: undefined,
  parent: $AnyParentNode,
  ctx: Context,
): undefined;
function $assignmentExpression(
  node: $AssignmentExpressionNode,
  parent: $AnyParentNode,
  ctx: Context,
): $$AssignmentExpressionOrHigher;
function $assignmentExpression(
  node: $AssignmentExpressionNode | undefined,
  parent: $AnyParentNode,
  ctx: Context,
): $$AssignmentExpressionOrHigher | undefined;
function $assignmentExpression(
  node: $AssignmentExpressionNode | undefined,
  parent: $AnyParentNode,
  ctx: Context,
): $$AssignmentExpressionOrHigher | undefined {
  if (node === void 0) {
    return void 0;
  }

  switch (node.kind) {
    case SyntaxKind.AsExpression:
      return new $AsExpression(node, parent, ctx);
    case SyntaxKind.BinaryExpression:
      return new $BinaryExpression(node, parent, ctx);
    case SyntaxKind.ArrowFunction:
      return new $ArrowFunction(node, parent, ctx);
    case SyntaxKind.ConditionalExpression:
      return new $ConditionalExpression(node, parent, ctx);
    case SyntaxKind.YieldExpression:
      return new $YieldExpression(node, parent, ctx);
    default:
      return $unaryExpression(node, parent, ctx);
  }
}

type $$UpdateExpression = (
  $JsxElement |
  $JsxFragment |
  $JsxSelfClosingElement |
  $PostfixUnaryExpression |
  $PrefixUnaryExpression
);

type $$UpdateExpressionOrHigher = (
  $$LHSExpressionOrHigher |
  $$UpdateExpression
);

type $$UnaryExpression = (
  $AwaitExpression |
  $DeleteExpression |
  $PrefixUnaryExpression |
  $TypeAssertion |
  $TypeOfExpression |
  $VoidExpression
);

type $$UnaryExpressionOrHigher = (
  $$UpdateExpressionOrHigher |
  $$UnaryExpression
);

function $unaryExpression(
  node: $UnaryExpressionNode,
  parent: $AnyParentNode,
  ctx: Context,
): $$UnaryExpressionOrHigher {
  switch (node.kind) {
    case SyntaxKind.JsxElement:
      return new $JsxElement(node, parent as $$JsxParent, ctx);
    case SyntaxKind.JsxFragment:
      return new $JsxFragment(node, parent as $$JsxParent, ctx);
    case SyntaxKind.JsxSelfClosingElement:
      return new $JsxSelfClosingElement(node, parent as $$JsxParent, ctx);
    case SyntaxKind.PostfixUnaryExpression:
      return new $PostfixUnaryExpression(node, parent, ctx);
    case SyntaxKind.PrefixUnaryExpression:
      return new $PrefixUnaryExpression(node, parent, ctx);
    case SyntaxKind.AwaitExpression:
      return new $AwaitExpression(node, parent, ctx);
    case SyntaxKind.DeleteExpression:
      return new $DeleteExpression(node, parent, ctx);
    case SyntaxKind.TypeAssertionExpression:
      return new $TypeAssertion(node, parent, ctx);
    case SyntaxKind.TypeOfExpression:
      return new $TypeOfExpression(node, parent, ctx);
    case SyntaxKind.VoidExpression:
      return new $VoidExpression(node, parent, ctx);
    default:
      return $LHSExpression(node, parent, ctx);
  }
}

type $$Literal = (
  $BigIntLiteral |
  $BooleanLiteral |
  $NoSubstitutionTemplateLiteral |
  $NullLiteral |
  $NumericLiteral |
  $RegularExpressionLiteral |
  $StringLiteral
);

type $$PrimaryExpression = (
  $ArrayLiteralExpression |
  $ClassExpression |
  $FunctionExpression |
  $Identifier |
  $NewExpression |
  $ObjectLiteralExpression |
  $ParenthesizedExpression |
  $TemplateExpression |
  $ThisExpression |
  $SuperExpression
);

type $$PrimaryExpressionOrHigher = (
  $$Literal |
  $$PrimaryExpression
);

type $$MemberExpression = (
  $ElementAccessExpression |
  $NonNullExpression |
  $PropertyAccessExpression |
  $TaggedTemplateExpression
);

type $$MemberExpressionOrHigher = (
  $$PrimaryExpressionOrHigher |
  $$MemberExpression
);

type $$CallExpressionOrHigher = (
  $$MemberExpressionOrHigher |
  $CallExpression
);

type $$LHSExpression = (
  $MetaProperty
);

type $$LHSExpressionOrHigher = (
  $$CallExpressionOrHigher |
  $$LHSExpression
);

function $LHSExpression(
  node: $LHSExpressionNode,
  parent: $AnyParentNode,
  ctx: Context,
): $$LHSExpressionOrHigher {
  switch (node.kind) {
    case SyntaxKind.ArrayLiteralExpression:
      return new $ArrayLiteralExpression(node, parent, ctx);
    case SyntaxKind.ClassExpression:
      return new $ClassExpression(node, parent, ctx);
    case SyntaxKind.FunctionExpression:
      return new $FunctionExpression(node, parent, ctx);
    case SyntaxKind.Identifier:
      return new $Identifier(node, parent, ctx);
    case SyntaxKind.NewExpression:
      return new $NewExpression(node, parent, ctx);
    case SyntaxKind.ObjectLiteralExpression:
      return new $ObjectLiteralExpression(node, parent, ctx);
    case SyntaxKind.ParenthesizedExpression:
      return new $ParenthesizedExpression(node, parent, ctx);
    case SyntaxKind.TemplateExpression:
      return new $TemplateExpression(node, parent, ctx);
    case SyntaxKind.ElementAccessExpression:
      return new $ElementAccessExpression(node, parent, ctx);
    case SyntaxKind.NonNullExpression:
      return new $NonNullExpression(node, parent, ctx);
    case SyntaxKind.PropertyAccessExpression:
      return new $PropertyAccessExpression(node, parent, ctx);
    case SyntaxKind.TaggedTemplateExpression:
      return new $TaggedTemplateExpression(node, parent, ctx);
    case SyntaxKind.CallExpression:
      return new $CallExpression(node, parent, ctx);
    case SyntaxKind.MetaProperty:
      return new $MetaProperty(node, parent, ctx);
    case SyntaxKind.ThisKeyword:
      return new $ThisExpression(node, parent, ctx);
    case SyntaxKind.SuperKeyword:
      return new $SuperExpression(node, parent, ctx);
    case SyntaxKind.NumericLiteral:
      return new $NumericLiteral(node, parent, ctx);
    case SyntaxKind.BigIntLiteral:
      return new $BigIntLiteral(node, parent, ctx);
    case SyntaxKind.StringLiteral:
      return new $StringLiteral(node, parent, ctx);
    case SyntaxKind.RegularExpressionLiteral:
      return new $RegularExpressionLiteral(node, parent, ctx);
    case SyntaxKind.NoSubstitutionTemplateLiteral:
      return new $NoSubstitutionTemplateLiteral(node, parent, ctx);
    case SyntaxKind.NullKeyword:
      return new $NullLiteral(node, parent, ctx);
    case SyntaxKind.TrueKeyword:
    case SyntaxKind.FalseKeyword:
      return new $BooleanLiteral(node, parent, ctx);
    default:
      throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as any).kind]}.`);
  }
}

function $identifier(
  node: undefined,
  parent: $AnyParentNode,
  ctx: Context,
): undefined;
function $identifier(
  node: Identifier,
  parent: $AnyParentNode,
  ctx: Context,
): $Identifier;
function $identifier(
  node: Identifier | undefined,
  parent: $AnyParentNode,
  ctx: Context,
): $Identifier | undefined;
function $identifier(
  node: Identifier | undefined,
  parent: $AnyParentNode,
  ctx: Context,
): $Identifier | undefined {
  if (node === void 0) {
    return void 0;
  }
  return new $Identifier(node, parent, ctx);
}

type $$PropertyName = (
  $ComputedPropertyName |
  $Identifier |
  $NumericLiteral |
  $StringLiteral
);

function $$propertyName(
  node: PropertyName,
  parent: $AnyParentNode,
  ctx: Context,
): $$PropertyName {
  switch (node.kind) {
    case SyntaxKind.Identifier:
      return new $Identifier(node, parent, ctx);
    case SyntaxKind.StringLiteral:
      return new $StringLiteral(node, parent, ctx);
    case SyntaxKind.NumericLiteral:
      return new $NumericLiteral(node, parent, ctx);
    case SyntaxKind.ComputedPropertyName:
      return new $ComputedPropertyName(node, parent as $$NamedDeclaration, ctx);
  }
}

type $$SignatureDeclaration = (
  $GetAccessorDeclaration |
  $SetAccessorDeclaration |
  $ArrowFunction |
  $ConstructorDeclaration |
  $FunctionDeclaration |
  $FunctionExpression |
  $MethodDeclaration
);

function $parameterDeclarationList(
  nodes: readonly ParameterDeclaration[] | undefined,
  parent: $$SignatureDeclaration,
  ctx: Context,
): readonly $ParameterDeclaration[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $ParameterDeclaration[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $ParameterDeclaration(nodes[i], parent, ctx);
  }
  return $nodes;
}

type $$DestructurableBinding = (
  $VariableDeclaration |
  $ParameterDeclaration |
  $BindingElement
);

type $$BindingName = (
  $ArrayBindingPattern |
  $Identifier |
  $ObjectBindingPattern
);

function $$bindingName(
  node: BindingName,
  parent: $$DestructurableBinding,
  ctx: Context,
): $$BindingName {
  switch (node.kind) {
    case SyntaxKind.Identifier:
      return new $Identifier(node, parent, ctx | Context.IsBindingName);
    case SyntaxKind.ObjectBindingPattern:
      return new $ObjectBindingPattern(node, parent, ctx);
    case SyntaxKind.ArrayBindingPattern:
      return new $ArrayBindingPattern(node, parent, ctx);
  }
}

type $NodeWithStatements = (
  $GetAccessorDeclaration |
  $SetAccessorDeclaration |
  $$IterationStatement |
  $Block |
  $CaseClause |
  $CatchClause |
  $ConstructorDeclaration |
  $DefaultClause |
  $FunctionDeclaration |
  $LabeledStatement |
  $MethodDeclaration |
  $ModuleBlock |
  $SourceFile |
  $TryStatement |
  $WithStatement |
  $FunctionExpression |
  $ArrowFunction |
  $IfStatement
);

type $$IterationStatement = (
  $DoStatement |
  $ForInStatement |
  $ForOfStatement |
  $ForStatement |
  $WhileStatement
);

type $$BreakableStatement = (
  $$IterationStatement |
  $SwitchStatement
);

type $$ModuleDeclarationParent = (
  $SourceFile |
  $ModuleBlock |
  $ModuleDeclaration
);

// http://www.ecma-international.org/ecma-262/#prod-Statement
type $$ESStatement = (
  $Block |
  $VariableStatement | // Note, technically only "var declaration" belongs here but TS clumps them up
  $EmptyStatement |
  $ExpressionStatement |
  $IfStatement |
  $$BreakableStatement |
  $ContinueStatement |
  $BreakStatement |
  $ReturnStatement |
  $WithStatement |
  $LabeledStatement |
  $ThrowStatement |
  $TryStatement |
  $DebuggerStatement
);

function $$esStatement(
  node: $StatementNode,
  parent: $NodeWithStatements,
  ctx: Context,
): $$ESStatement {
  switch (node.kind) {
    case SyntaxKind.Block:
      return new $Block(node, parent, ctx);
    case SyntaxKind.EmptyStatement:
      return new $EmptyStatement(node, parent, ctx);
    case SyntaxKind.ExpressionStatement:
      return new $ExpressionStatement(node, parent, ctx);
    case SyntaxKind.IfStatement:
      return new $IfStatement(node, parent, ctx);
    case SyntaxKind.DoStatement:
      return new $DoStatement(node, parent, ctx);
    case SyntaxKind.WhileStatement:
      return new $WhileStatement(node, parent, ctx);
    case SyntaxKind.ForStatement:
      return new $ForStatement(node, parent, ctx);
    case SyntaxKind.ForInStatement:
      return new $ForInStatement(node, parent, ctx);
    case SyntaxKind.ForOfStatement:
      return new $ForOfStatement(node, parent, ctx);
    case SyntaxKind.ContinueStatement:
      return new $ContinueStatement(node, parent, ctx);
    case SyntaxKind.BreakStatement:
      return new $BreakStatement(node, parent, ctx);
    case SyntaxKind.ReturnStatement:
      return new $ReturnStatement(node, parent, ctx);
    case SyntaxKind.WithStatement:
      return new $WithStatement(node, parent, ctx);
    case SyntaxKind.SwitchStatement:
      return new $SwitchStatement(node, parent, ctx);
    case SyntaxKind.LabeledStatement:
      return new $LabeledStatement(node, parent, ctx);
    case SyntaxKind.ThrowStatement:
      return new $ThrowStatement(node, parent, ctx);
    case SyntaxKind.TryStatement:
      return new $TryStatement(node, parent, ctx);
    case SyntaxKind.DebuggerStatement:
      return new $DebuggerStatement(node, parent, ctx);
    default:
      throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as Node).kind]}.`);
  }
}

type $$ESDeclaration = (
  $FunctionDeclaration |
  $ClassDeclaration |
  $VariableStatement |
  $VariableDeclaration
);

type $$TSDeclaration = (
  $InterfaceDeclaration |
  $TypeAliasDeclaration |
  $EnumDeclaration
);

type $$ESStatementListItem = (
  $$ESStatement |
  $$ESDeclaration
);

type $$TSStatementListItem = (
  $$ESStatementListItem |
  $$TSDeclaration
);

function $$tsStatementListItem(
  node: $StatementNode,
  parent: $NodeWithStatements,
  ctx: Context,
): $$TSStatementListItem {
  switch (node.kind) {
    case SyntaxKind.VariableStatement:
      return new $VariableStatement(node, parent, ctx);
    case SyntaxKind.FunctionDeclaration:
      return new $FunctionDeclaration(node, parent, ctx);
    case SyntaxKind.ClassDeclaration:
      return new $ClassDeclaration(node, parent, ctx);
    case SyntaxKind.InterfaceDeclaration:
      return new $InterfaceDeclaration(node, parent, ctx);
    case SyntaxKind.TypeAliasDeclaration:
      return new $TypeAliasDeclaration(node, parent, ctx);
    case SyntaxKind.EnumDeclaration:
      return new $EnumDeclaration(node, parent, ctx);
    default:
      return $$esStatement(node, parent, ctx);
  }
}

function $$tsStatementList(
  nodes: readonly $StatementNode[],
  parent: $NodeWithStatements,
  ctx: Context,
): readonly $$TSStatementListItem[] {
  const len = nodes.length;
  let node: $StatementNode;
  const $nodes: $$TSStatementListItem[] = [];

  let x = 0;
  for (let i = 0; i < len; ++i) {
    node = nodes[i];
    if (node.kind === SyntaxKind.FunctionDeclaration && node.body === void 0) {
      continue;
    }
    $nodes[x++] = $$tsStatementListItem(node, parent, ctx);
  }
  return $nodes;
}

type $$ESLabelledItem = (
  $$ESStatement |
  $FunctionDeclaration
);

function $$esLabelledItem(
  node: $StatementNode,
  parent: $NodeWithStatements,
  ctx: Context,
): $$ESLabelledItem {
  switch (node.kind) {
    case SyntaxKind.VariableStatement:
      return new $VariableStatement(node, parent, ctx);
    case SyntaxKind.FunctionDeclaration:
      return new $FunctionDeclaration(node, parent, ctx);
    default:
      return $$esStatement(node, parent, ctx);
  }
}

// #endregion

// #region AST helpers

function GetDirectivePrologue(statements: readonly Statement[]): DirectivePrologue {
  let directivePrologue: ExpressionStatement_T<StringLiteral>[] = emptyArray;

  let statement: ExpressionStatement_T<StringLiteral>;
  const len = statements.length;
  for (let i = 0; i < len; ++i) {
    statement = statements[i] as ExpressionStatement_T<StringLiteral>;
    if (
      statement.kind === SyntaxKind.ExpressionStatement
      && statement.expression.kind === SyntaxKind.StringLiteral
    ) {
      if (directivePrologue === emptyArray) {
        directivePrologue = [statement];
      } else {
        directivePrologue.push(statement);
      }
      if (statement.expression.text === 'use strict') {
        (directivePrologue as Writable<DirectivePrologue>).ContainsUseStrict = true;
      }
    } else {
      break;
    }
  }

  return directivePrologue;
}

function GetExpectedArgumentCount(params: readonly $ParameterDeclaration[]): number {
  for (let i = 0, ii = params.length; i < ii; ++i) {
    if (params[i].HasInitializer) {
      return i;
    }
  }

  return params.length;
}

function isIIFE(expr: $FunctionExpression | $ArrowFunction): boolean {
  let prev = expr as I$Node;
  let parent = expr.parent as I$Node;
  while ((parent.node as Node).kind === SyntaxKind.ParenthesizedExpression) {
    prev = parent;
    parent = parent.parent;
  }

  // Compare node.expression instead of expression because expression is not set yet (that's what we're initializing right now)
  return (parent.node as Node).kind === SyntaxKind.CallExpression && (parent as $CallExpression).node.expression === prev.node;
}

// #endregion

// #region AST

// #region Declaration statements

export class $VariableStatement implements I$Node {
  public readonly $kind = SyntaxKind.VariableStatement;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;
  public readonly nodeFlags: NodeFlags;

  public readonly $declarationList: $VariableDeclarationList;

  public readonly isLexical: boolean;

  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-boundnames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportedbindings
  public readonly ExportedBindings: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportednames
  public readonly ExportedNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportentries
  public readonly ExportEntries: readonly ExportEntryRecord[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-isconstantdeclaration
  public readonly IsConstantDeclaration: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-lexicallyscopeddeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-modulerequests
  public readonly ModuleRequests: readonly $String[];

  public readonly TypeDeclarations: readonly $$TSDeclaration[] = emptyArray;
  public readonly IsType: false = false;

  public constructor(
    public readonly node: VariableStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
    const intrinsics = realm['[[Intrinsics]]'];

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);
    this.nodeFlags = node.flags;

    ctx |= Context.InVariableStatement;

    if (hasBit(this.modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    const $declarationList = this.$declarationList = new $VariableDeclarationList(
      node.declarationList,
      this,
      ctx,
    );

    const isLexical = this.isLexical = $declarationList.isLexical;
    this.IsConstantDeclaration = $declarationList.IsConstantDeclaration;

    const BoundNames = this.BoundNames = $declarationList.BoundNames;
    this.VarScopedDeclarations = $declarationList.VarScopedDeclarations;

    if (hasBit(ctx, Context.InExport)) {
      this.ExportedBindings = BoundNames;
      this.ExportedNames = BoundNames;
      this.ExportEntries = BoundNames.map(name =>
        new ExportEntryRecord(
          /* source */this,
          /* ExportName */name,
          /* ModuleRequest */intrinsics.null,
          /* ImportName */intrinsics.null,
          /* LocalName */name,
        )
      );

      if (isLexical) {
        this.LexicallyScopedDeclarations = [this];
      } else {
        this.LexicallyScopedDeclarations = emptyArray;
      }
    } else {
      this.ExportedBindings = emptyArray;
      this.ExportedNames = emptyArray;
      this.ExportEntries = emptyArray;

      this.LexicallyScopedDeclarations = emptyArray;
    }

    this.ModuleRequests = emptyArray;
  }
}

type $NodeWithDecorators = (
  $GetAccessorDeclaration |
  $SetAccessorDeclaration |
  $ClassDeclaration |
  $ConstructorDeclaration |
  $EnumDeclaration |
  $ExportAssignment |
  $ExportDeclaration |
  $FunctionDeclaration |
  $ImportDeclaration |
  $ImportEqualsDeclaration |
  $InterfaceDeclaration |
  $MethodDeclaration |
  $ModuleDeclaration |
  $ParameterDeclaration |
  $PropertyDeclaration |
  $TypeAliasDeclaration
);

function $decoratorList(
  nodes: readonly Decorator[] | undefined,
  parent: $NodeWithDecorators,
  ctx: Context,
): readonly $Decorator[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  if (nodes.length === 1) {
    return [new $Decorator(nodes[0], parent, ctx)];
  }

  const len = nodes.length;
  const $nodes: $Decorator[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $Decorator(nodes[i], parent, ctx);
  }
  return $nodes;
}

// Simple property accessors used for some map/flatMap/some/every operations,
// to avoid allocating a new arrow function for each of those calls.
function getContainsExpression<T>(obj: { ContainsExpression: T }): T { return obj.ContainsExpression; }
function getHasInitializer<T>(obj: { HasInitializer: T }): T { return obj.HasInitializer; }
function getIsSimpleParameterList<T>(obj: { IsSimpleParameterList: T }): T { return obj.IsSimpleParameterList; }
function getBoundNames<T>(obj: { BoundNames: T }): T { return obj.BoundNames; }
function getVarScopedDeclarations<T>(obj: { VarScopedDeclarations: T }): T {  return obj.VarScopedDeclarations; }
function getLocalName<T>(obj: { LocalName: T }): T { return obj.LocalName; }
function getImportEntriesForModule<T>(obj: { ImportEntriesForModule: T }): T { return obj.ImportEntriesForModule; }
function getExportedNames<T>(obj: { ExportedNames: T }): T { return obj.ExportedNames; }
function getExportEntriesForModule<T>(obj: { ExportEntriesForModule: T }): T { return obj.ExportEntriesForModule; }
function getReferencedBindings<T>(obj: { ReferencedBindings: T }): T { return obj.ReferencedBindings; }

export class $FunctionDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.FunctionDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $Identifier | undefined;
  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block;

  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-boundnames
  // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-static-semantics-boundnames
  // http://www.ecma-international.org/ecma-262/#sec-async-generator-function-definitions-static-semantics-boundnames
  // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-static-semantics-BoundNames
  public readonly BoundNames: readonly [$String | $String<'*default*'>] | readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-containsexpression
  public readonly ContainsExpression: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-containsusestrict
  public readonly ContainsUseStrict: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-expectedargumentcount
  public readonly ExpectedArgumentCount: number;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-hasinitializer
  public readonly HasInitializer: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-hasname
  // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-static-semantics-hasname
  // http://www.ecma-international.org/ecma-262/#sec-async-generator-function-definitions-static-semantics-hasname
  // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-static-semantics-HasName
  public readonly HasName: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-isconstantdeclaration
  // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-static-semantics-isconstantdeclaration
  // http://www.ecma-international.org/ecma-262/#sec-async-generator-function-definitions-static-semantics-isconstantdeclaration
  // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-static-semantics-IsConstantDeclaration
  public readonly IsConstantDeclaration: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-isfunctiondefinition
  // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-static-semantics-isfunctiondefinition
  // http://www.ecma-international.org/ecma-262/#sec-async-generator-function-definitions-static-semantics-isfunctiondefinition
  // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-static-semantics-IsFunctionDefinition
  public readonly IsFunctionDefinition: true = true;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-lexicallyscopeddeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-static-semantics-propname
  // http://www.ecma-international.org/ecma-262/#sec-async-generator-function-definitions-static-semantics-propname
  // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-static-semantics-PropName
  public readonly PropName: $String | $Undefined;

  public readonly DirectivePrologue: DirectivePrologue;

  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportedbindings
  public readonly ExportedBindings: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportednames
  public readonly ExportedNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportentries
  public readonly ExportEntries: readonly ExportEntryRecord[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-modulerequests
  public readonly ModuleRequests: readonly $String[] = emptyArray;

  public readonly TypeDeclarations: readonly $$TSDeclaration[] = emptyArray;
  public readonly IsType: false = false;

  public constructor(
    public readonly node: FunctionDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
    const intrinsics = realm['[[Intrinsics]]'];

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    ctx = clearBit(ctx, Context.InTopLevel);

    const DirectivePrologue = this.DirectivePrologue = GetDirectivePrologue(node.body!.statements);
    if (this.DirectivePrologue.ContainsUseStrict) {
      ctx |= Context.InStrictMode;
    }

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    const $name = this.$name = $identifier(node.name, this, ctx);
    const $parameters = this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
    const $body = this.$body = new $Block(node.body!, this, ctx);

    this.ContainsExpression = $parameters.some(getContainsExpression);
    this.ContainsUseStrict = DirectivePrologue.ContainsUseStrict === true;
    this.ExpectedArgumentCount = GetExpectedArgumentCount($parameters);
    this.HasInitializer = $parameters.some(getHasInitializer);
    const HasName = this.HasName = $name !== void 0;
    this.IsSimpleParameterList = $parameters.every(getIsSimpleParameterList);

    this.LexicallyScopedDeclarations = $body.TopLevelLexicallyScopedDeclarations;
    this.VarScopedDeclarations = $body.TopLevelVarScopedDeclarations;

    if ($name === void 0) {
      this.PropName = new $Undefined(realm);
    } else {
      this.PropName = $name.PropName;
    }

    if (hasBit(ctx, Context.InExport)) {
      if (hasBit(this.modifierFlags, ModifierFlags.Default)) {
        if (HasName) {
          const [localName] = $name!.BoundNames;
          const BoundNames = this.BoundNames = [localName, intrinsics['*default*']];

          this.ExportedBindings = BoundNames;
          this.ExportedNames = [intrinsics['*default*']];
          this.ExportEntries = [
            new ExportEntryRecord(
              /* source */this,
              /* ExportName */intrinsics['*default*'],
              /* ModuleRequest */intrinsics.null,
              /* ImportName */intrinsics.null,
              /* LocalName */localName,
            ),
          ];
        } else {
          const BoundNames = this.BoundNames = [intrinsics['*default*']];

          this.ExportedBindings = BoundNames;
          this.ExportedNames = BoundNames;
          this.ExportEntries = [
            new ExportEntryRecord(
              /* source */this,
              /* ExportName */intrinsics['*default*'],
              /* ModuleRequest */intrinsics.null,
              /* ImportName */intrinsics.null,
              /* LocalName */intrinsics['*default*'],
            ),
          ];
        }
      } else {
        // Must have a name, so we assume it does
        const BoundNames = this.BoundNames = $name!.BoundNames;
        const [localName] = BoundNames;

        this.ExportedBindings = BoundNames;
        this.ExportedNames = BoundNames;
        this.ExportEntries = [
          new ExportEntryRecord(
            /* source */this,
            /* ExportName */localName,
            /* ModuleRequest */intrinsics.null,
            /* ImportName */intrinsics.null,
            /* LocalName */localName,
          ),
        ];
      }
    } else {
      // Must have a name, so we assume it does
      this.BoundNames = $name!.BoundNames;

      this.ExportedBindings = emptyArray;
      this.ExportedNames = emptyArray;
      this.ExportEntries = emptyArray;
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-instantiatefunctionobject
  public InstantiateFunctionObject(
    Scope: $EnvRec,
  ): $ECMAScriptFunction {
    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // FunctionDeclaration : function ( FormalParameters ) { FunctionBody }
    if (this.$name === void 0) {
      // 1. Let F be FunctionCreate(Normal, FormalParameters, FunctionBody, scope, true).
      const F = $ECMAScriptFunction.FunctionCreate('normal', this, Scope, intrinsics.true);

      // 2. Perform MakeConstructor(F).
      F.MakeConstructor();

      // 3. Perform SetFunctionName(F, "default").
      F.SetFunctionName(intrinsics.default);

      // 4. Set F.[[SourceText]] to the source text matched by FunctionDeclaration.
      F['[[SourceText]]'] = new $String(realm, ''); // TODO: get text (need sourceFile for this)

      // 5. Return F.
      return F;
    }

    // FunctionDeclaration : function BindingIdentifier ( FormalParameters ) { FunctionBody }

    // 1. If the function code for FunctionDeclaration is strict mode code, let strict be true. Otherwise let strict be false.
    const strict = intrinsics.true; // TODO: can we actually break stuff by always having this be true? Anyway, still need to double check the scope for this

    // 2. Let name be StringValue of BindingIdentifier.
    const name = this.$name.StringValue;

    // 3. Let F be FunctionCreate(Normal, FormalParameters, FunctionBody, scope, strict).
    const F = $ECMAScriptFunction.FunctionCreate('normal', this, Scope, strict);

    // 4. Perform MakeConstructor(F).
      F.MakeConstructor();

    // 5. Perform SetFunctionName(F, name).
      F.SetFunctionName(name);

    // 6. Set F.[[SourceText]] to the source text matched by FunctionDeclaration.
      F['[[SourceText]]'] = new $String(realm, ''); // TODO: get text (need sourceFile for this)

    // 7. Return F.
    return F;
  }
}

function $heritageClauseList(
  nodes: readonly HeritageClause[] | undefined,
  parent: $$NodeWithHeritageClauses,
  ctx: Context,
): readonly $HeritageClause[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $HeritageClause[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $HeritageClause(nodes[i], parent, ctx);
  }
  return $nodes;
}

function $$classElementList(
  nodes: readonly $ClassElementNode[] | undefined,
  parent: $ClassDeclaration | $ClassExpression,
  ctx: Context,
): readonly $$ClassElement[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $$ClassElement[] = [];
  let $node: $$ClassElement | undefined;
  let node: $ClassElementNode;
  for (let i = 0; i < len; ++i) {
    node = nodes[i];
    if ((node as { body?: Block }).body !== void 0) {
      $node = $$classElement(nodes[i], parent, ctx);
      if ($node !== void 0) {
        $nodes.push($node);
      }
    }
  }
  return $nodes;
}

type $$ClassElement = (
  $GetAccessorDeclaration |
  $SetAccessorDeclaration |
  $ConstructorDeclaration |
  $MethodDeclaration |
  $SemicolonClassElement |
  $PropertyDeclaration
);

function $$classElement(
  node: $ClassElementNode,
  parent: $ClassDeclaration | $ClassExpression,
  ctx: Context,
): $$ClassElement | undefined {
  switch (node.kind) {
    case SyntaxKind.PropertyDeclaration:
      return new $PropertyDeclaration(node, parent, ctx);
    case SyntaxKind.SemicolonClassElement:
      return new $SemicolonClassElement(node, parent, ctx);
    case SyntaxKind.MethodDeclaration:
      return new $MethodDeclaration(node, parent, ctx);
    case SyntaxKind.Constructor:
      return new $ConstructorDeclaration(node, parent, ctx);
    case SyntaxKind.GetAccessor:
      return new $GetAccessorDeclaration(node, parent, ctx);
    case SyntaxKind.SetAccessor:
      return new $SetAccessorDeclaration(node, parent, ctx);
    default:
      return void 0;
  }
}

type $$MethodDefinition = (
  $MethodDeclaration |
  $GetAccessorDeclaration |
  $SetAccessorDeclaration
);

export class $ClassDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.ClassDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $Identifier | $Undefined;
  public readonly $heritageClauses: readonly $HeritageClause[];
  public readonly $members: readonly $$ClassElement[];

  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-boundnames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-constructormethod
  public readonly ConstructorMethod: $ConstructorDeclaration | undefined;
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-hasname
  public readonly HasName: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isconstantdeclaration
  public readonly IsConstantDeclaration: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: true = true;
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-nonconstructormethoddefinitions
  public readonly NonConstructorMethodDefinitions: readonly $$MethodDefinition[];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-prototypepropertynamelist
  public readonly PrototypePropertyNameList: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportedbindings
  public readonly ExportedBindings: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportednames
  public readonly ExportedNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportentries
  public readonly ExportEntries: readonly ExportEntryRecord[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-lexicallyscopeddeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-modulerequests
  public readonly ModuleRequests: readonly $String[];

  public readonly TypeDeclarations: readonly $$TSDeclaration[] = emptyArray;
  public readonly IsType: false = false;

  public constructor(
    public readonly node: ClassDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
    const intrinsics = realm['[[Intrinsics]]'];

    ctx = clearBit(ctx, Context.InTopLevel);

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    let $name: $Identifier | $Undefined;
    if (node.name === void 0) {
      $name = this.$name = new $Undefined(realm, this);
    } else {
      $name = this.$name = new $Identifier(node.name, this, ctx);
    }
    const $heritageClauses = this.$heritageClauses = $heritageClauseList(node.heritageClauses, this, ctx);
    const $members = this.$members = $$classElementList(node.members as NodeArray<$ClassElementNode>, this, ctx);

    const NonConstructorMethodDefinitions = this.NonConstructorMethodDefinitions = [] as $$MethodDefinition[];
    const PrototypePropertyNameList = this.PrototypePropertyNameList = [] as $String[];

    let $member: $$ClassElement;
    for (let i = 0, ii = $members.length; i < ii; ++i) {
      $member = $members[i];
      switch ($member.$kind) {
        case SyntaxKind.PropertyDeclaration:
          break;
        case SyntaxKind.Constructor:
          this.ConstructorMethod = $member;
          break;
        case SyntaxKind.MethodDeclaration:
        case SyntaxKind.GetAccessor:
        case SyntaxKind.SetAccessor:
          NonConstructorMethodDefinitions.push($member);
          if (!$member.PropName.isEmpty && !$member.IsStatic) {
            PrototypePropertyNameList.push($member.PropName as $String);
          }
          break;
        case SyntaxKind.SemicolonClassElement:
      }
    }

    const HasName = this.HasName = !$name.isUndefined;

    if (hasBit(ctx, Context.InExport)) {
      if (hasBit(this.modifierFlags, ModifierFlags.Default)) {
        if (HasName) {
          const [localName] = ($name as $Identifier).BoundNames;
          const BoundNames = this.BoundNames = [localName, intrinsics['*default*']];

          this.ExportedBindings = BoundNames;
          this.ExportedNames = [intrinsics['*default*']];
          this.ExportEntries = [
            new ExportEntryRecord(
              /* source */this,
              /* ExportName */intrinsics['*default*'],
              /* ModuleRequest */intrinsics.null,
              /* ImportName */intrinsics.null,
              /* LocalName */localName,
            ),
          ];
        } else {
          const BoundNames = this.BoundNames = [intrinsics['*default*']];

          this.ExportedBindings = BoundNames;
          this.ExportedNames = BoundNames;
          this.ExportEntries = [
            new ExportEntryRecord(
              /* source */this,
              /* ExportName */intrinsics['*default*'],
              /* ModuleRequest */intrinsics.null,
              /* ImportName */intrinsics.null,
              /* LocalName */intrinsics['*default*'],
            ),
          ];
        }

        this.LexicallyScopedDeclarations = [this];
      } else {
        // Must have a name, so we assume it does
        const BoundNames = this.BoundNames = ($name as $Identifier).BoundNames;
        const [localName] = BoundNames;

        this.ExportedBindings = BoundNames;
        this.ExportedNames = BoundNames;
        this.ExportEntries = [
          new ExportEntryRecord(
            /* source */this,
            /* ExportName */localName,
            /* ModuleRequest */intrinsics.null,
            /* ImportName */intrinsics.null,
            /* LocalName */localName,
          ),
        ];

        this.LexicallyScopedDeclarations = [this];
      }
    } else {
      // Must have a name, so we assume it does
      this.BoundNames = ($name as $Identifier).BoundNames;

      this.ExportedBindings = emptyArray;
      this.ExportedNames = emptyArray;
      this.ExportEntries = emptyArray;

      this.LexicallyScopedDeclarations = emptyArray;
    }

    this.ModuleRequests = emptyArray;
  }
}

export class $InterfaceDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.InterfaceDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly BoundNames: readonly [$String];
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public readonly ExportedBindings: readonly $String[];
  public readonly ExportedNames: readonly $String[];
  public readonly ExportEntries: readonly ExportEntryRecord[];

  public readonly TypeDeclarations: readonly [$InterfaceDeclaration];
  public readonly IsType: true = true;

  public readonly $name: $Identifier;
  public readonly $heritageClauses: readonly $HeritageClause[];

  public constructor(
    public readonly node: InterfaceDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
    const intrinsics = realm['[[Intrinsics]]'];

    ctx = clearBit(ctx, Context.InTopLevel) | Context.InTypeElement;

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    const $name = this.$name = $identifier(node.name, this, ctx);
    this.$heritageClauses = $heritageClauseList(node.heritageClauses, this, ctx);

    const BoundNames = this.BoundNames = $name.BoundNames;
    this.TypeDeclarations = [this];

    if (hasBit(ctx, Context.InExport)) {
      const [localName] = BoundNames;

      this.ExportedBindings = BoundNames;
      this.ExportedNames = BoundNames;
      this.ExportEntries = [
        new ExportEntryRecord(
          /* source */this,
          /* ExportName */localName,
          /* ModuleRequest */intrinsics.null,
          /* ImportName */intrinsics.null,
          /* LocalName */localName,
        ),
      ];
    } else {
      this.ExportedBindings = emptyArray;
      this.ExportedNames = emptyArray;
      this.ExportEntries = emptyArray;
    }
  }
}

export class $TypeAliasDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.TypeAliasDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly BoundNames: readonly [$String];
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public readonly ExportedBindings: readonly $String[];
  public readonly ExportedNames: readonly $String[];
  public readonly ExportEntries: readonly ExportEntryRecord[];

  public readonly TypeDeclarations: readonly [$TypeAliasDeclaration];
  public readonly IsType: true = true;

  public readonly $name: $Identifier;

  public constructor(
    public readonly node: TypeAliasDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
    const intrinsics = realm['[[Intrinsics]]'];

    ctx = clearBit(ctx, Context.InTopLevel) | Context.InTypeElement;

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    const $name = this.$name = $identifier(node.name, this, ctx);

    const BoundNames = this.BoundNames = $name.BoundNames;
    this.TypeDeclarations = [this];

    if (hasBit(ctx, Context.InExport)) {
      const [localName] = BoundNames;

      this.ExportedBindings = BoundNames;
      this.ExportedNames = BoundNames;
      this.ExportEntries = [
        new ExportEntryRecord(
          /* source */this,
          /* ExportName */localName,
          /* ModuleRequest */intrinsics.null,
          /* ImportName */intrinsics.null,
          /* LocalName */localName,
        ),
      ];
    } else {
      this.ExportedBindings = emptyArray;
      this.ExportedNames = emptyArray;
      this.ExportEntries = emptyArray;
    }
  }
}

function $enumMemberList(
  nodes: readonly EnumMember[],
  parent: $EnumDeclaration,
  ctx: Context,
): readonly $EnumMember[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $EnumMember[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $EnumMember(nodes[i], parent, ctx);
  }
  return $nodes;
}

export class $EnumDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.EnumDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly BoundNames: readonly [$String];
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public readonly ExportedBindings: readonly $String[];
  public readonly ExportedNames: readonly $String[];
  public readonly ExportEntries: readonly ExportEntryRecord[];

  public readonly TypeDeclarations: readonly [$EnumDeclaration];
  public readonly IsType: true = true;

  public readonly $name: $Identifier;
  public readonly $members: readonly $EnumMember[];

  public constructor(
    public readonly node: EnumDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InTopLevel);
    const intrinsics = realm['[[Intrinsics]]'];

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    const $name = this.$name = $identifier(node.name, this, ctx);
    this.$members = $enumMemberList(node.members, this, ctx);

    const BoundNames = this.BoundNames = $name.BoundNames;
    this.TypeDeclarations = [this];

    if (hasBit(ctx, Context.InExport)) {
      const [localName] = BoundNames;

      this.ExportedBindings = BoundNames;
      this.ExportedNames = BoundNames;
      this.ExportEntries = [
        new ExportEntryRecord(
          /* source */this,
          /* ExportName */localName,
          /* ModuleRequest */intrinsics.null,
          /* ImportName */intrinsics.null,
          /* LocalName */localName,
        ),
      ];
    } else {
      this.ExportedBindings = emptyArray;
      this.ExportedNames = emptyArray;
      this.ExportEntries = emptyArray;
    }
  }
}

// #endregion

// #region Declaration members

export class $VariableDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.VariableDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;
  public readonly combinedModifierFlags: ModifierFlags;
  public readonly nodeFlags: NodeFlags;
  public readonly combinedNodeFlags: NodeFlags;

  public readonly $name: $$BindingName;
  public readonly $initializer: $$AssignmentExpressionOrHigher | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-boundnames
  // http://www.ecma-international.org/ecma-262/#sec-let-and-const-declarations-static-semantics-boundnames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  // http://www.ecma-international.org/ecma-262/#sec-let-and-const-declarations-static-semantics-isconstantdeclaration
  public readonly IsConstantDeclaration: boolean;

  public constructor(
    public readonly node: VariableDeclaration,
    public readonly parent: $VariableDeclarationList | $CatchClause,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);
    this.nodeFlags = node.flags;

    if (hasBit(ctx, Context.InVariableStatement)) {
      this.combinedNodeFlags = node.flags | (parent as $VariableDeclarationList).combinedNodeFlags;
      this.combinedModifierFlags = modifierFlags | (parent as $VariableDeclarationList).combinedModifierFlags;
    } else {
      this.combinedNodeFlags = node.flags;
      this.combinedModifierFlags = modifierFlags;
    }

    const $name = this.$name = $$bindingName(node.name, this, ctx);

    // Clear this flag because it's used inside $Identifier to declare locals/exports
    // and we don't want to do that on the identifiers in types/initializers.
    ctx = clearBit(ctx, Context.InVariableStatement);

    this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);

    this.BoundNames = $name.BoundNames;
    if (hasBit(ctx, Context.IsVar)) { // TODO: what about parameter and for declarations?
      this.VarScopedDeclarations = [this];
      this.IsConstantDeclaration = false;
    } else {
      this.VarScopedDeclarations = emptyArray;
      this.IsConstantDeclaration = hasBit(ctx, Context.IsConst);
    }
  }
}

function $variableDeclarationList(
  nodes: readonly VariableDeclaration[],
  parent: $VariableDeclarationList,
  ctx: Context,
): readonly $VariableDeclaration[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $VariableDeclaration[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $VariableDeclaration(nodes[i], parent, ctx);
  }
  return $nodes;
}

export class $VariableDeclarationList implements I$Node {
  public readonly $kind = SyntaxKind.VariableDeclarationList;
  public readonly id: number;

  public readonly combinedModifierFlags: ModifierFlags;
  public readonly nodeFlags: NodeFlags;
  public readonly combinedNodeFlags: NodeFlags;

  public readonly $declarations: readonly $VariableDeclaration[];

  public readonly isLexical: boolean;

  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-boundnames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  // http://www.ecma-international.org/ecma-262/#sec-let-and-const-declarations-static-semantics-isconstantdeclaration
  public readonly IsConstantDeclaration: boolean;

  public constructor(
    public readonly node: VariableDeclarationList,
    public readonly parent: $VariableStatement | $ForStatement | $ForOfStatement | $ForInStatement,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.nodeFlags = node.flags;

    this.isLexical = (node.flags & (NodeFlags.Const | NodeFlags.Let)) > 0;
    this.IsConstantDeclaration = (node.flags & NodeFlags.Const) > 0;

    if (hasBit(ctx, Context.InVariableStatement)) {
      this.combinedNodeFlags = node.flags | (parent as $VariableStatement).nodeFlags;
      this.combinedModifierFlags = (parent as $VariableStatement).modifierFlags;
    } else {
      this.combinedNodeFlags = node.flags;
      this.combinedModifierFlags = ModifierFlags.None;
    }

    if (hasBit(node.flags, NodeFlags.Const)) {
      ctx |= Context.IsConst;
    } else if (hasBit(node.flags, NodeFlags.Let)) {
      ctx |= Context.IsLet;
    } else {
      ctx |= Context.IsVar;
    }

    const $declarations = this.$declarations = $variableDeclarationList(node.declarations, this, ctx);

    this.BoundNames = $declarations.flatMap(getBoundNames);
    this.VarScopedDeclarations = $declarations.flatMap(getVarScopedDeclarations);
  }
}

export class $EnumMember implements I$Node {
  public readonly $kind = SyntaxKind.EnumMember;
  public readonly id: number;

  public readonly $name: $$PropertyName;
  public readonly $initializer: $$AssignmentExpressionOrHigher | undefined;

  public constructor(
    public readonly node: EnumMember,
    public readonly parent: $EnumDeclaration,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);
  }
}

type $$NodeWithHeritageClauses = (
  $ClassDeclaration |
  $ClassExpression |
  $InterfaceDeclaration
);

function $expressionWithTypeArgumentsList(
  nodes: readonly ExpressionWithTypeArguments[],
  parent: $HeritageClause,
  ctx: Context,
): readonly $ExpressionWithTypeArguments[] {
  if (nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $ExpressionWithTypeArguments[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $ExpressionWithTypeArguments(nodes[i], parent, ctx);
  }
  return $nodes;
}

export class $HeritageClause implements I$Node {
  public readonly $kind = SyntaxKind.HeritageClause;
  public readonly id: number;

  public readonly $types: readonly $ExpressionWithTypeArguments[];

  public constructor(
    public readonly node: HeritageClause,
    public readonly parent: $$NodeWithHeritageClauses,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$types = $expressionWithTypeArgumentsList(node.types, this, ctx);
  }
}

export class $ExpressionWithTypeArguments implements I$Node {
  public readonly $kind = SyntaxKind.ExpressionWithTypeArguments;
  public readonly id: number;

  public readonly $expression: $$LHSExpressionOrHigher;

  public constructor(
    public readonly node: ExpressionWithTypeArguments,
    public readonly parent: $HeritageClause,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $LHSExpression(node.expression as $LHSExpressionNode, this, ctx);
  }
}

// #endregion

export class $Decorator implements I$Node {
  public readonly $kind = SyntaxKind.Decorator;
  public readonly id: number;

  public readonly $expression: $$LHSExpressionOrHigher;

  public constructor(
    public readonly node: Decorator,
    public readonly parent: $NodeWithDecorators,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $LHSExpression(node.expression as $LHSExpressionNode, this, ctx);
  }
}

// #region LHS

export class $ThisExpression implements I$Node {
  public readonly $kind = SyntaxKind.ThisKeyword;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $ThisExpression = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: ThisExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
  }
}

export class $SuperExpression implements I$Node {
  public readonly $kind = SyntaxKind.SuperKeyword;
  public readonly id: number;

  public constructor(
    public readonly node: SuperExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
  }
}

type $NodeWithSpreadElements = (
  $ArrayLiteralExpression |
  $CallExpression |
  $NewExpression
);

type $$ArgumentOrArrayLiteralElement = (
  $$AssignmentExpressionOrHigher |
  $SpreadElement |
  $OmittedExpression
);

function $argumentOrArrayLiteralElement(
  node: $ArgumentOrArrayLiteralElementNode,
  parent: $NodeWithSpreadElements,
  ctx: Context,
): $$ArgumentOrArrayLiteralElement {
  switch (node.kind) {
    case SyntaxKind.SpreadElement:
      return new $SpreadElement(node, parent, ctx);
    case SyntaxKind.OmittedExpression:
      return new $OmittedExpression(node, parent, ctx);
    default:
      return $assignmentExpression(node, parent, ctx);
  }
}

function $argumentOrArrayLiteralElementList(
  nodes: readonly $ArgumentOrArrayLiteralElementNode[] | undefined,
  parent: $NodeWithSpreadElements,
  ctx: Context,
): readonly $$ArgumentOrArrayLiteralElement[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $$ArgumentOrArrayLiteralElement[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = $argumentOrArrayLiteralElement(nodes[i], parent, ctx);
  }
  return $nodes;
}

export class $ArrayLiteralExpression implements I$Node {
  public readonly $kind = SyntaxKind.ArrayLiteralExpression;
  public readonly id: number;

  public readonly $elements: readonly $$ArgumentOrArrayLiteralElement[];

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $ArrayLiteralExpression = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: ArrayLiteralExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$elements = $argumentOrArrayLiteralElementList(node.elements as NodeArray<$ArgumentOrArrayLiteralElementNode>, this, ctx);
  }
}

type $$ObjectLiteralElementLike = (
  $PropertyAssignment |
  $ShorthandPropertyAssignment |
  $SpreadAssignment |
  $MethodDeclaration |
  $GetAccessorDeclaration |
  $SetAccessorDeclaration
);

function $$objectLiteralElementLikeList(
  nodes: readonly ObjectLiteralElementLike[],
  parent: $ObjectLiteralExpression,
  ctx: Context,
): readonly $$ObjectLiteralElementLike[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $$ObjectLiteralElementLike[] = Array(len);
  let el: ObjectLiteralElementLike;

  for (let i = 0; i < len; ++i) {
    el = nodes[i];
    switch (el.kind) {
      case SyntaxKind.PropertyAssignment:
        $nodes[i] = new $PropertyAssignment(el, parent, ctx);
        break;
      case SyntaxKind.ShorthandPropertyAssignment:
        $nodes[i] = new $ShorthandPropertyAssignment(el, parent, ctx);
        break;
      case SyntaxKind.SpreadAssignment:
        $nodes[i] = new $SpreadAssignment(el, parent, ctx);
        break;
      case SyntaxKind.MethodDeclaration:
        $nodes[i] = new $MethodDeclaration(el, parent, ctx);
        break;
      case SyntaxKind.GetAccessor:
        $nodes[i] = new $GetAccessorDeclaration(el, parent, ctx);
        break;
      case SyntaxKind.SetAccessor:
        $nodes[i] = new $SetAccessorDeclaration(el, parent, ctx);
        break;
    }
  }
  return $nodes;
}

export class $ObjectLiteralExpression implements I$Node {
  public readonly $kind = SyntaxKind.ObjectLiteralExpression;
  public readonly id: number;

  public readonly $properties: readonly $$ObjectLiteralElementLike[];

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $ObjectLiteralExpression = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: ObjectLiteralExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$properties = $$objectLiteralElementLikeList(node.properties, this, ctx);
  }
}

export class $PropertyAccessExpression implements I$Node {
  public readonly $kind = SyntaxKind.PropertyAccessExpression;
  public readonly id: number;

  public readonly $expression: $$LHSExpressionOrHigher;
  public readonly $name: $Identifier;

  public constructor(
    public readonly node: PropertyAccessExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $LHSExpression(node.expression as $LHSExpressionNode, this, ctx);
    this.$name = $identifier(node.name, this, ctx | Context.IsPropertyAccessName);
  }
}

export class $ElementAccessExpression implements I$Node {
  public readonly $kind = SyntaxKind.ElementAccessExpression;
  public readonly id: number;

  public readonly $expression: $$LHSExpressionOrHigher;
  public readonly $argumentExpression: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: ElementAccessExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $LHSExpression(node.expression as $LHSExpressionNode, this, ctx);
    this.$argumentExpression = $assignmentExpression(node.argumentExpression as $AssignmentExpressionNode, this, ctx);
  }
}

export class $CallExpression implements I$Node {
  public readonly $kind = SyntaxKind.CallExpression;
  public readonly id: number;

  public readonly $expression: $$LHSExpressionOrHigher;
  public readonly $arguments: readonly $$ArgumentOrArrayLiteralElement[];

  public constructor(
    public readonly node: CallExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $LHSExpression(node.expression as $LHSExpressionNode, this, ctx);
    this.$arguments = $argumentOrArrayLiteralElementList(node.arguments as NodeArray<$ArgumentOrArrayLiteralElementNode>, this, ctx);
  }
}

export class $NewExpression implements I$Node {
  public readonly $kind = SyntaxKind.NewExpression;
  public readonly id: number;

  public readonly $expression: $$LHSExpressionOrHigher;
  public readonly $arguments: readonly $$ArgumentOrArrayLiteralElement[];

  public constructor(
    public readonly node: NewExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $LHSExpression(node.expression as $LHSExpressionNode, this, ctx);
    this.$arguments = $argumentOrArrayLiteralElementList(node.arguments as NodeArray<$ArgumentOrArrayLiteralElementNode>, this, ctx);
  }
}

type $$TemplateLiteral = (
  $NoSubstitutionTemplateLiteral |
  $TemplateExpression
);

export class $TaggedTemplateExpression implements I$Node {
  public readonly $kind = SyntaxKind.TaggedTemplateExpression;
  public readonly id: number;

  public readonly $tag: $$LHSExpressionOrHigher;
  public readonly $template: $$TemplateLiteral;

  public constructor(
    public readonly node: TaggedTemplateExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$tag = $LHSExpression(node.tag as $LHSExpressionNode, this, ctx);

    if (node.template.kind === SyntaxKind.NoSubstitutionTemplateLiteral) {
      this.$template = new $NoSubstitutionTemplateLiteral(node.template, this, ctx);
    } else {
      this.$template = new $TemplateExpression(node.template, this, ctx);
    }
  }
}

export class $FunctionExpression implements I$Node {
  public readonly $kind = SyntaxKind.FunctionExpression;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly isIIFE: boolean;

  public readonly $name: $Identifier | undefined;
  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block;

  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-boundnames
  public readonly BoundNames: readonly [$String | $String<'*default*'>] | readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-containsexpression
  public readonly ContainsExpression: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-containsusestrict
  public readonly ContainsUseStrict: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-expectedargumentcount
  public readonly ExpectedArgumentCount: number;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-hasinitializer
  public readonly HasInitializer: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-hasname
  public readonly HasName: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-isconstantdeclaration
  public readonly IsConstantDeclaration: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: true = true;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-lexicallyscopeddeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public readonly DirectivePrologue: DirectivePrologue;

  public readonly TypeDeclarations: readonly $$TSDeclaration[] = emptyArray;
  public readonly IsType: false = false;

  public constructor(
    public readonly node: FunctionExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    if (this.isIIFE = isIIFE(this)) {
      ctx = clearBit(ctx, Context.InExpressionStatement);
    } else {
      ctx = clearBit(ctx, Context.InExpressionStatement | Context.InTopLevel);
    }

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    const DirectivePrologue = this.DirectivePrologue = GetDirectivePrologue(node.body!.statements);
    if (DirectivePrologue.ContainsUseStrict) {
      ctx |= Context.InStrictMode;
    }

    const $name = this.$name = $identifier(node.name, this, ctx);
    const $parameters = this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
    const $body = this.$body = new $Block(node.body, this, ctx);

    this.BoundNames = $parameters.flatMap(getBoundNames);
    this.ContainsExpression = $parameters.some(getContainsExpression);
    this.ContainsUseStrict = DirectivePrologue.ContainsUseStrict === true;
    this.ExpectedArgumentCount = GetExpectedArgumentCount($parameters);
    this.HasInitializer = $parameters.some(getHasInitializer);
    this.HasName = $name !== void 0;
    this.IsSimpleParameterList = $parameters.every(getIsSimpleParameterList);

    this.LexicallyScopedDeclarations = $body.TopLevelLexicallyScopedDeclarations;
    this.VarScopedDeclarations = $body.TopLevelVarScopedDeclarations;
  }
}

function $$templateSpanList(
  nodes: readonly TemplateSpan[],
  parent: $TemplateExpression,
  ctx: Context,
): readonly $TemplateSpan[] {
  if (nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $TemplateSpan[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $TemplateSpan(nodes[i], parent, ctx);
  }
  return $nodes;
}

export class $TemplateExpression implements I$Node {
  public readonly $kind = SyntaxKind.TemplateExpression;
  public readonly id: number;

  public readonly $head: $TemplateHead;
  public readonly $templateSpans: readonly $TemplateSpan[];

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $TemplateExpression = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: TemplateExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$head = new $TemplateHead(node.head, this, ctx)
    this.$templateSpans = $$templateSpanList(node.templateSpans, this, ctx);
  }
}

export class $ParenthesizedExpression implements I$Node {
  public readonly $kind = SyntaxKind.ParenthesizedExpression;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: ParenthesizedExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    const $expression = this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);

    this.CoveredParenthesizedExpression = $expression;
  }
}

export class $ClassExpression implements I$Node {
  public readonly $kind = SyntaxKind.ClassExpression;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $name: $Identifier | undefined;
  public readonly $heritageClauses: readonly $HeritageClause[];
  public readonly $members: readonly $$ClassElement[];

  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-boundnames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-constructormethod
  public readonly ConstructorMethod: any;
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-hasname
  public readonly HasName: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isconstantdeclaration
  public readonly IsConstantDeclaration: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: true = true;
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-nonconstructormethoddefinitions
  public readonly NonConstructorMethodDefinitions: any[];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-prototypepropertynamelist
  public readonly PrototypePropertyNameList: readonly $String[];


  public constructor(
    public readonly node: ClassExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
    const intrinsics = realm['[[Intrinsics]]'];

    ctx = clearBit(ctx, Context.InExpressionStatement | Context.InTopLevel);

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    const $name = this.$name = $identifier(node.name, this, ctx);
    this.$heritageClauses = $heritageClauseList(node.heritageClauses, this, ctx);
    const $members = this.$members = $$classElementList(node.members as NodeArray<$ClassElementNode>, this, ctx);

    if ($name === void 0) {
      this.BoundNames = [intrinsics['*default*']];
    } else {
      if (hasAllBits(modifierFlags, ModifierFlags.ExportDefault)) {
        this.BoundNames = [...$name.BoundNames, intrinsics['*default*']];
      } else {
        this.BoundNames = $name.BoundNames;
      }
    }

    const NonConstructorMethodDefinitions = this.NonConstructorMethodDefinitions = [] as $$MethodDefinition[];
    const PrototypePropertyNameList = this.PrototypePropertyNameList = [] as $String[];

    let $member: $$ClassElement;
    for (let i = 0, ii = $members.length; i < ii; ++i) {
      $member = $members[i];
      switch ($member.$kind) {
        case SyntaxKind.PropertyDeclaration:
          break;
        case SyntaxKind.Constructor:
          this.ConstructorMethod = $member;
          break;
        case SyntaxKind.MethodDeclaration:
        case SyntaxKind.GetAccessor:
        case SyntaxKind.SetAccessor:
          NonConstructorMethodDefinitions.push($member);
          if (!$member.PropName.isEmpty && !$member.IsStatic) {
            PrototypePropertyNameList.push($member.PropName as $String);
          }
          break;
        case SyntaxKind.SemicolonClassElement:
      }
    }

    this.HasName = $name !== void 0;
  }
}

export class $NonNullExpression implements I$Node {
  public readonly $kind = SyntaxKind.NonNullExpression;
  public readonly id: number;

  public readonly $expression: $$LHSExpressionOrHigher;

  public constructor(
    public readonly node: NonNullExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $LHSExpression(node.expression as $LHSExpressionNode, this, ctx);
  }
}

export class $MetaProperty implements I$Node {
  public readonly $kind = SyntaxKind.MetaProperty;
  public readonly id: number;

  public readonly $name: $Identifier;

  public constructor(
    public readonly node: MetaProperty,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$name = $identifier(node.name, this, ctx);
  }
}

// #endregion

// #region Unary

export class $DeleteExpression implements I$Node {
  public readonly $kind = SyntaxKind.DeleteExpression;
  public readonly id: number;

  public readonly $expression: $$UnaryExpressionOrHigher;

  public constructor(
    public readonly node: DeleteExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $unaryExpression(node.expression as $UnaryExpressionNode, this, ctx);
  }
}

export class $TypeOfExpression implements I$Node {
  public readonly $kind = SyntaxKind.TypeOfExpression;
  public readonly id: number;

  public readonly $expression: $$UnaryExpressionOrHigher;

  public constructor(
    public readonly node: TypeOfExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $unaryExpression(node.expression as $UnaryExpressionNode, this, ctx);
  }
}

export class $VoidExpression implements I$Node {
  public readonly $kind = SyntaxKind.VoidExpression;
  public readonly id: number;

  public readonly $expression: $$UnaryExpressionOrHigher;

  public constructor(
    public readonly node: VoidExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $unaryExpression(node.expression as $UnaryExpressionNode, this, ctx);
  }
}

export class $AwaitExpression implements I$Node {
  public readonly $kind = SyntaxKind.AwaitExpression;
  public readonly id: number;

  public readonly $expression: $$UnaryExpressionOrHigher;

  public constructor(
    public readonly node: AwaitExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $unaryExpression(node.expression as $UnaryExpressionNode, this, ctx);
  }
}

export class $PrefixUnaryExpression implements I$Node {
  public readonly $kind = SyntaxKind.PrefixUnaryExpression;
  public readonly id: number;

  public readonly $operand: $$UnaryExpressionOrHigher;

  public constructor(
    public readonly node: PrefixUnaryExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$operand = $unaryExpression(node.operand as $UnaryExpressionNode, this, ctx);
  }
}

export class $PostfixUnaryExpression implements I$Node {
  public readonly $kind = SyntaxKind.PostfixUnaryExpression;
  public readonly id: number;

  public readonly $operand: $$LHSExpressionOrHigher;

  public constructor(
    public readonly node: PostfixUnaryExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$operand = $LHSExpression(node.operand as $LHSExpressionNode, this, ctx);
  }
}

export class $TypeAssertion implements I$Node {
  public readonly $kind = SyntaxKind.TypeAssertionExpression;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: TypeAssertion,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx)
  }
}

// #endregion

// #region Assignment

export class $BinaryExpression implements I$Node {
  public readonly $kind = SyntaxKind.BinaryExpression;
  public readonly id: number;

  public readonly $left: $$BinaryExpressionOrHigher;
  public readonly $right: $$BinaryExpressionOrHigher;

  public constructor(
    public readonly node: BinaryExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$left = $assignmentExpression(node.left as $BinaryExpressionNode, this, ctx) as $$BinaryExpressionOrHigher
    this.$right = $assignmentExpression(node.right as $BinaryExpressionNode, this, ctx) as $$BinaryExpressionOrHigher
  }
}

export class $ConditionalExpression implements I$Node {
  public readonly $kind = SyntaxKind.ConditionalExpression;
  public readonly id: number;

  public readonly $condition: $$BinaryExpressionOrHigher;
  public readonly $whenTrue: $$AssignmentExpressionOrHigher;
  public readonly $whenFalse: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: ConditionalExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    if (node.condition.kind === SyntaxKind.BinaryExpression) {
      this.$condition = new $BinaryExpression(node.condition as BinaryExpression, this, ctx);
    } else {
      this.$condition = $unaryExpression(node.condition as $UnaryExpressionNode, this, ctx);
    }

    this.$whenTrue = $assignmentExpression(node.whenTrue as $AssignmentExpressionNode, this, ctx)
    this.$whenFalse = $assignmentExpression(node.whenFalse as $AssignmentExpressionNode, this, ctx)
  }
}

export class $ArrowFunction implements I$Node {
  public readonly $kind = SyntaxKind.ArrowFunction;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly isIIFE: boolean;

  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block | $$AssignmentExpressionOrHigher;

  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-boundnames
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-BoundNames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-containsexpression
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-ContainsExpression
  public readonly ContainsExpression: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-containsusestrict
  public readonly ContainsUseStrict: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-expectedargumentcount
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-ExpectedArgumentCount
  public readonly ExpectedArgumentCount: number;
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-hasname
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-HasName
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-issimpleparameterlist
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-IsSimpleParameterList
  public readonly IsSimpleParameterList: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredformalslist
  public readonly CoveredFormalsList: readonly $ParameterDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-lexicallyscopeddeclarations
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-LexicallyScopedDeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-varscopeddeclarations
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public readonly DirectivePrologue: DirectivePrologue;

  public readonly TypeDeclarations: readonly $$TSDeclaration[] = emptyArray;
  public readonly IsType: false = false;

  public constructor(
    public readonly node: ArrowFunction,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    if (this.isIIFE = isIIFE(this)) {
      ctx = clearBit(ctx, Context.InExpressionStatement);
    } else {
      ctx = clearBit(ctx, Context.InExpressionStatement | Context.InTopLevel);
    }

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (node.body.kind === SyntaxKind.Block) {
      const DirectivePrologue = this.DirectivePrologue = GetDirectivePrologue((node.body as Block).statements);
      if (DirectivePrologue.ContainsUseStrict) {
        ctx |= Context.InStrictMode;
        this.ContainsUseStrict = true;
      } else {
        this.ContainsUseStrict = false;
      }

      const $parameters = this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
      const $body = this.$body = new $Block(node.body as Block, this, ctx);

      this.BoundNames = $parameters.flatMap(getBoundNames);
      this.ExpectedArgumentCount = GetExpectedArgumentCount($parameters);
      this.IsSimpleParameterList = $parameters.every(getIsSimpleParameterList);
      this.CoveredFormalsList = $parameters;

      // TODO: we sure about this?
      this.LexicallyScopedDeclarations = $body.TopLevelLexicallyScopedDeclarations;
      this.VarScopedDeclarations = $body.TopLevelVarScopedDeclarations;
    } else {
      this.DirectivePrologue = emptyArray;
      this.ContainsUseStrict = false;

      const $parameters = this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
      this.$body = $assignmentExpression(node.body as $AssignmentExpressionNode, this, ctx);

      this.BoundNames = $parameters.flatMap(getBoundNames);
      this.ExpectedArgumentCount = GetExpectedArgumentCount($parameters);
      this.IsSimpleParameterList = $parameters.every(getIsSimpleParameterList);
      this.CoveredFormalsList = $parameters;

      this.LexicallyScopedDeclarations = emptyArray;
      this.VarScopedDeclarations = emptyArray;
    }
  }
}

export class $YieldExpression implements I$Node {
  public readonly $kind = SyntaxKind.YieldExpression;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: YieldExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx)
  }
}

export class $AsExpression implements I$Node {
  public readonly $kind = SyntaxKind.AsExpression;
  public readonly id: number;

  public readonly $expression: $$UpdateExpressionOrHigher;

  public constructor(
    public readonly node: AsExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $assignmentExpression(node.expression as $UpdateExpressionNode, this, ctx) as $$UpdateExpressionOrHigher
  }
}

// #endregion

// #region Pseudo-literals

export class $TemplateHead implements I$Node {
  public readonly $kind = SyntaxKind.TemplateHead;
  public readonly id: number;

  public constructor(
    public readonly node: TemplateHead,
    public readonly parent: $TemplateExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
  }
}

export class $TemplateMiddle implements I$Node {
  public readonly $kind = SyntaxKind.TemplateMiddle;
  public readonly id: number;

  public constructor(
    public readonly node: TemplateMiddle,
    public readonly parent: $TemplateExpression | $TemplateSpan,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
  }
}

export class $TemplateTail implements I$Node {
  public readonly $kind = SyntaxKind.TemplateTail;
  public readonly id: number;

  public constructor(
    public readonly node: TemplateTail,
    public readonly parent: $TemplateExpression | $TemplateSpan,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
  }
}

export class $TemplateSpan implements I$Node {
  public readonly $kind = SyntaxKind.TemplateSpan;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $literal: $TemplateMiddle | $TemplateTail;

  public constructor(
    public readonly node: TemplateSpan,
    public readonly parent: $TemplateExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
    if (node.literal.kind === SyntaxKind.TemplateMiddle) {
      this.$literal = new $TemplateMiddle(node.literal, this, ctx);
    } else {
      this.$literal = new $TemplateTail(node.literal, this, ctx);
    }
  }
}

// #endregion

export class $Identifier implements I$Node {
  public readonly $kind = SyntaxKind.Identifier;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-identifiers-static-semantics-stringvalue
  public readonly StringValue: $String;
  // http://www.ecma-international.org/ecma-262/#sec-object-initializer-static-semantics-propname
  public readonly PropName: $String;

  // http://www.ecma-international.org/ecma-262/#sec-identifiers-static-semantics-boundnames
  public readonly BoundNames: readonly [$String];
  // http://www.ecma-international.org/ecma-262/#sec-identifiers-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'strict' | 'simple';

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpressionf
  public readonly CoveredParenthesizedExpression: $Identifier = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: true = true;

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-containsexpression
  public readonly ContainsExpression: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-hasinitializer
  public readonly HasInitializer: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: true = true;

  public get isUndefined(): false { return false; }
  public get isNull(): false { return false; }

  public constructor(
    public readonly node: Identifier,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    const StringValue = this.StringValue = new $String(realm, node.text, this);
    this.PropName = StringValue;
    this.BoundNames = [StringValue] as const;

    if (hasBit(ctx, Context.InStrictMode) && (StringValue.value === 'eval' || StringValue.value === 'arguments')) {
      this.AssignmentTargetType = 'strict';
    } else {
      this.AssignmentTargetType = 'simple';
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-identifiers-runtime-semantics-evaluation
  public Evaluate(): $Reference {
    // IdentifierReference : Identifier

    // 1. Return ? ResolveBinding(StringValue of Identifier).

    // IdentifierReference : yield

    // 1. Return ? ResolveBinding("yield").

    // IdentifierReference : await

    // 1. Return ? ResolveBinding("await").

    return this.realm.ResolveBinding(this.StringValue);
  }
}

type $$JsxParent = (
  $JsxElement |
  $JsxFragment
);

type $$JsxChild = (
  $JsxText |
  $JsxExpression |
  $JsxElement |
  $JsxSelfClosingElement |
  $JsxFragment
);

function $$jsxChildList(
  nodes: readonly JsxChild[],
  parent: $$JsxParent,
  ctx: Context,
): readonly $$JsxChild[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $$JsxChild[] = Array(len);
  for (let i = 0; i < len; ++i) {
    switch (nodes[i].kind) {
      case SyntaxKind.JsxText:
        $nodes[i] = new $JsxText(nodes[i] as JsxText, parent, ctx);
        break;
      case SyntaxKind.JsxExpression:
        $nodes[i] = new $JsxExpression(nodes[i] as JsxExpression, parent, ctx);
        break;
      case SyntaxKind.JsxElement:
        $nodes[i] = new $JsxElement(nodes[i] as JsxElement, parent, ctx);
        break;
      case SyntaxKind.JsxSelfClosingElement:
        $nodes[i] = new $JsxSelfClosingElement(nodes[i] as JsxSelfClosingElement, parent, ctx);
        break;
      case SyntaxKind.JsxFragment:
        $nodes[i] = new $JsxFragment(nodes[i] as JsxFragment, parent, ctx);
        break;
    }
  }
  return $nodes;
}

export class $JsxElement implements I$Node {
  public readonly $kind = SyntaxKind.JsxElement;
  public readonly id: number;

  public readonly $openingElement: $JsxOpeningElement;
  public readonly $children: readonly $$JsxChild[];
  public readonly $closingElement: $JsxClosingElement;

  public constructor(
    public readonly node: JsxElement,
    public readonly parent: $$JsxParent,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$openingElement = new $JsxOpeningElement(node.openingElement, this, ctx);
    this.$children = $$jsxChildList(node.children, this, ctx);
    this.$closingElement = new $JsxClosingElement(node.closingElement, this, ctx);
  }
}

type $$JsxNamed = (
  $JsxOpeningElement |
  $JsxClosingElement |
  $JsxSelfClosingElement
);

type $$JsxTagNamePropertyAccess = $PropertyAccessExpression & {
  expression: $$JsxTagNameExpression;
};

type $$JsxTagNameExpression = (
  $Identifier |
  $ThisExpression |
  $$JsxTagNamePropertyAccess
);

function $$jsxTagNameExpression(
  node: JsxTagNameExpression,
  parent: $$JsxNamed,
  ctx: Context,
): $$JsxTagNameExpression {
  switch (node.kind) {
    case SyntaxKind.Identifier:
      return new $Identifier(node, parent, ctx);
    case SyntaxKind.ThisKeyword:
      return new $ThisExpression(node, parent, ctx);
    case SyntaxKind.PropertyAccessExpression:
      return new $PropertyAccessExpression(node, parent, ctx) as $$JsxTagNamePropertyAccess;
    default:
      throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as Node).kind]}.`);
  }
}

export class $JsxSelfClosingElement implements I$Node {
  public readonly $kind = SyntaxKind.JsxSelfClosingElement;
  public readonly id: number;

  public readonly $tagName: $$JsxTagNameExpression;
  public readonly $attributes: $JsxAttributes;

  public constructor(
    public readonly node: JsxSelfClosingElement,
    public readonly parent: $$JsxParent,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$tagName = $$jsxTagNameExpression(node.tagName, this, ctx);
    this.$attributes = new $JsxAttributes(node.attributes, this, ctx);
  }
}

export class $JsxFragment implements I$Node {
  public readonly $kind = SyntaxKind.JsxFragment;
  public readonly id: number;

  public readonly $openingFragment: $JsxOpeningFragment;
  public readonly $children: readonly $$JsxChild[];
  public readonly $closingFragment: $JsxClosingFragment;

  public constructor(
    public readonly node: JsxFragment,
    public readonly parent: $$JsxParent,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$openingFragment = new $JsxOpeningFragment(node.openingFragment, this, ctx);
    this.$children = $$jsxChildList(node.children, this, ctx);
    this.$closingFragment = new $JsxClosingFragment(node.closingFragment, this, ctx);
  }
}

export class $JsxText implements I$Node {
  public readonly $kind = SyntaxKind.JsxText;
  public readonly id: number;

  public constructor(
    public readonly node: JsxText,
    public readonly parent: $$JsxParent,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
  }
}

export class $JsxOpeningElement implements I$Node {
  public readonly $kind = SyntaxKind.JsxOpeningElement;
  public readonly id: number;

  public readonly $tagName: $$JsxTagNameExpression;
  public readonly $attributes: $JsxAttributes;

  public constructor(
    public readonly node: JsxOpeningElement,
    public readonly parent: $JsxElement,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$tagName = $$jsxTagNameExpression(node.tagName, this, ctx);
    this.$attributes = new $JsxAttributes(node.attributes, this, ctx);
  }
}

export class $JsxClosingElement implements I$Node {
  public readonly $kind = SyntaxKind.JsxClosingElement;
  public readonly id: number;

  public readonly $tagName: $$JsxTagNameExpression;

  public constructor(
    public readonly node: JsxClosingElement,
    public readonly parent: $JsxElement,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$tagName = $$jsxTagNameExpression(node.tagName, this, ctx);
  }
}

export class $JsxOpeningFragment implements I$Node {
  public readonly $kind = SyntaxKind.JsxOpeningFragment;
  public readonly id: number;

  public constructor(
    public readonly node: JsxOpeningFragment,
    public readonly parent: $JsxFragment,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
  }
}

export class $JsxClosingFragment implements I$Node {
  public readonly $kind = SyntaxKind.JsxClosingFragment;
  public readonly id: number;

  public constructor(
    public readonly node: JsxClosingFragment,
    public readonly parent: $JsxFragment,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
  }
}

export class $JsxAttribute implements I$Node {
  public readonly $kind = SyntaxKind.JsxAttribute;
  public readonly id: number;

  public readonly $name: $Identifier;
  public readonly $initializer: $StringLiteral | $JsxExpression | undefined;

  public constructor(
    public readonly node: JsxAttribute,
    public readonly parent: $JsxAttributes,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$name = $identifier(node.name, this, ctx);
    if (node.initializer === void 0) {
      this.$initializer = void 0;
    } else {
      if (node.initializer.kind === SyntaxKind.StringLiteral) {
        this.$initializer = new $StringLiteral(node.initializer, this, ctx);
      } else {
        this.$initializer = new $JsxExpression(node.initializer, this, ctx);
      }
    }
  }
}

type $$JsxAttributeLike = (
  $JsxAttribute |
  $JsxSpreadAttribute
);

export class $JsxAttributes implements I$Node {
  public readonly $kind = SyntaxKind.JsxAttributes;
  public readonly id: number;

  public readonly $properties: readonly $$JsxAttributeLike[];

  public constructor(
    public readonly node: JsxAttributes,
    public readonly parent: $$JsxOpeningLikeElement,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$properties = node.properties.map(
      x => x.kind === SyntaxKind.JsxAttribute
        ? new $JsxAttribute(x, this, ctx)
        : new $JsxSpreadAttribute(x, this, ctx)
    );
  }
}

export class $JsxSpreadAttribute implements I$Node {
  public readonly $kind = SyntaxKind.JsxSpreadAttribute;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: JsxSpreadAttribute,
    public readonly parent: $JsxAttributes,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
  }
}

export class $JsxExpression implements I$Node {
  public readonly $kind = SyntaxKind.JsxExpression;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher | undefined;

  public constructor(
    public readonly node: JsxExpression,
    public readonly parent: $$JsxParent | $$JsxAttributeLike,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
  }
}

export class $NumericLiteral implements I$Node {
  public readonly $kind = SyntaxKind.NumericLiteral;
  public readonly id: number;

  public readonly Value: $Number;

  // http://www.ecma-international.org/ecma-262/#sec-object-initializer-static-semantics-propname
  public readonly PropName: $String;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $NumericLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: NumericLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    const num = Number(node.text);
    this.PropName = new $String(realm, num.toString(), this);
    this.Value = new $Number(realm, num, this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-literals-runtime-semantics-evaluation
  public Evaluate(): $Number {
    // 1. Return the number whose value is MV of NumericLiteral as defined in 11.8.3.
    return this.Value;
  }
}

export class $BigIntLiteral implements I$Node {
  public readonly $kind = SyntaxKind.BigIntLiteral;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $BigIntLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: BigIntLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
  }
}

export class $StringLiteral implements I$Node {
  public readonly $kind = SyntaxKind.StringLiteral;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-string-literals-static-semantics-stringvalue
  public readonly StringValue: $String;
  // http://www.ecma-international.org/ecma-262/#sec-object-initializer-static-semantics-propname
  public readonly PropName: $String;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $StringLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: StringLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    const StringValue = this.StringValue = new $String(realm, node.text, this);
    this.PropName = StringValue;
  }
}

export class $RegularExpressionLiteral implements I$Node {
  public readonly $kind = SyntaxKind.RegularExpressionLiteral;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-regexp-identifier-names-static-semantics-stringvalue
  public readonly StringValue: string;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $RegularExpressionLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: RegularExpressionLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.StringValue = node.text;
  }
}

export class $NoSubstitutionTemplateLiteral implements I$Node {
  public readonly $kind = SyntaxKind.NoSubstitutionTemplateLiteral;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $NoSubstitutionTemplateLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: NoSubstitutionTemplateLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
  }
}

export class $NullLiteral implements I$Node {
  public readonly $kind = SyntaxKind.NullKeyword;
  public readonly id: number;

  public readonly Value: $Null;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $NullLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: NullLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.Value = new $Null(realm, this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-literals-runtime-semantics-evaluation
  public Evaluate(): $Null {
    // Literal : NullLiteral

    // 1. Return null.
    return this.Value;
  }
}

export class $BooleanLiteral implements I$Node {
  public readonly $kind: SyntaxKind.TrueKeyword | SyntaxKind.FalseKeyword;
  public readonly id: number;

  public readonly Value: $Boolean;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $BooleanLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: BooleanLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
    this.$kind = node.kind;

    this.Value = new $Boolean(realm, node.kind === SyntaxKind.TrueKeyword, this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-literals-runtime-semantics-evaluation
  public Evaluate(): $Boolean {
    // Literal : BooleanLiteral

    // 1. If BooleanLiteral is the token false, return false.
    // 2. If BooleanLiteral is the token true, return true.
    return this.Value;
  }
}

export class $PropertyDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.PropertyDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$PropertyName;
  public readonly $initializer: $$AssignmentExpressionOrHigher | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
  public readonly IsStatic: boolean;

  public constructor(
    public readonly node: PropertyDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);

    this.IsStatic = hasBit(modifierFlags, ModifierFlags.Static);
  }
}

export class $MethodDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.MethodDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$PropertyName;
  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
  public readonly IsStatic: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-expectedargumentcount
  public readonly ExpectedArgumentCount: number;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-propname
  public readonly PropName: $String | $Empty;

  public constructor(
    public readonly node: MethodDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression | $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    const $name = this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    const $parameters = this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
    this.$body = new $Block(node.body!, this, ctx);

    this.ExpectedArgumentCount = GetExpectedArgumentCount($parameters);
    this.PropName = $name.PropName;
    this.IsStatic = hasBit(modifierFlags, ModifierFlags.Static);
  }
}

export class $GetAccessorDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.GetAccessor;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$PropertyName;
  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
  public readonly IsStatic: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-expectedargumentcount
  public readonly ExpectedArgumentCount: number = 0;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-propname
  public readonly PropName: $String | $Empty;

  public constructor(
    public readonly node: GetAccessorDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression | $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    const $name = this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
    this.$body = new $Block(node.body!, this, ctx);

    this.PropName = $name.PropName;
    this.IsStatic = hasBit(modifierFlags, ModifierFlags.Static);
  }
}

export class $SetAccessorDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.SetAccessor;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$PropertyName;
  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
  public readonly IsStatic: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-expectedargumentcount
  public readonly ExpectedArgumentCount: number = 1;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-propname
  public readonly PropName: $String | $Empty;

  public constructor(
    public readonly node: SetAccessorDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression | $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    const $name = this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
    this.$body = new $Block(node.body!, this, ctx);

    this.PropName = $name.PropName;
    this.IsStatic = hasBit(modifierFlags, ModifierFlags.Static);
  }
}

export class $SemicolonClassElement implements I$Node {
  public readonly $kind = SyntaxKind.SemicolonClassElement;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
  public readonly IsStatic: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-propname
  public readonly PropName: empty = empty;

  public constructor(
    public readonly node: SemicolonClassElement,
    public readonly parent: $ClassDeclaration | $ClassExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
  }
}

export class $ConstructorDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.Constructor;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block;

  public constructor(
    public readonly node: ConstructorDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
    this.$body = new $Block(node.body!, this, ctx);
  }
}

type $$ESModuleItem = (
  $$ESStatementListItem |
  $ImportDeclaration |
  $ExportDeclaration
);

type $$TSModuleItem = (
  $$ESModuleItem |
  $$TSDeclaration |
  $ExportAssignment |
  $ImportEqualsDeclaration |
  $ModuleDeclaration |
  $NamespaceExportDeclaration
);

export type ModuleStatus = 'uninstantiated' | 'instantiating' | 'instantiated' | 'evaluating' | 'evaluated';

// http://www.ecma-international.org/ecma-262/#sec-abstract-module-records
// http://www.ecma-international.org/ecma-262/#sec-cyclic-module-records
// http://www.ecma-international.org/ecma-262/#sec-source-text-module-records
export class $SourceFile implements I$Node, IModule {
  public readonly '<IModule>': unknown;

  public '[[Environment]]': $ModuleEnvRec | $Undefined;
  public '[[Namespace]]': $Object | $Undefined;
  public '[[HostDefined]]': any;

  public readonly $kind = SyntaxKind.SourceFile;
  public readonly id: number;

  public readonly sourceFile: $SourceFile = this;
  public readonly parent: $SourceFile = this;
  public readonly ctx: Context = Context.None;
  public readonly depth: number = 0;

  public readonly matcher: PatternMatcher | null;
  public readonly logger: ILogger;

  public readonly $statements: readonly $$TSModuleItem[];

  public readonly DirectivePrologue: DirectivePrologue;

  // http://www.ecma-international.org/ecma-262/#sec-module-semantics-static-semantics-exportedbindings
  public readonly ExportedBindings: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-module-semantics-static-semantics-exportednames
  public readonly ExportedNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-module-semantics-static-semantics-exportentries
  public readonly ExportEntries: readonly ExportEntryRecord[];
  // http://www.ecma-international.org/ecma-262/#sec-module-semantics-static-semantics-importentries
  public readonly ImportEntries: readonly ImportEntryRecord[];
  // http://www.ecma-international.org/ecma-262/#sec-importedlocalnames
  public readonly ImportedLocalNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-module-semantics-static-semantics-modulerequests
  public readonly ModuleRequests: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-module-semantics-static-semantics-lexicallyscopeddeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-module-semantics-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public readonly TypeDeclarations: readonly $$TSDeclaration[] = emptyArray;
  public readonly IsType: false = false;

  public Status: ModuleStatus;
  public DFSIndex: number | undefined;
  public DFSAncestorIndex: number | undefined;
  public RequestedModules: $String[];

  public readonly LocalExportEntries: readonly ExportEntryRecord[];
  public readonly IndirectExportEntries: readonly ExportEntryRecord[];
  public readonly StarExportEntries: readonly ExportEntryRecord[];

  public get isNull(): false { return false; }

  public constructor(
    public readonly $file: IFile,
    public readonly node: SourceFile,
    public readonly realm: Realm,
    public readonly pkg: NPMPackage,
    public readonly compilerOptions: CompilerOptions,
  ) {
    this.id = realm.registerNode(this);
    const intrinsics = realm['[[Intrinsics]]'];
    this['[[Environment]]'] = intrinsics.undefined;
    this['[[Namespace]]'] = intrinsics.undefined;

    this.logger = pkg.container.get(ILogger).root.scopeTo(`SourceFile<(...)${$file.rootlessPath}>`);

    this.matcher = PatternMatcher.getOrCreate(compilerOptions, pkg.container);

    let ctx = Context.InTopLevel;
    this.DirectivePrologue = GetDirectivePrologue(node.statements);
    if (this.DirectivePrologue.ContainsUseStrict) {
      ctx |= Context.InStrictMode;
    }

    const ExportedBindings = this.ExportedBindings = [] as $String[];
    const ExportedNames = this.ExportedNames = [] as $String[];
    const ExportEntries = this.ExportEntries = [] as ExportEntryRecord[];
    const ImportEntries = this.ImportEntries = [] as ImportEntryRecord[];
    const ImportedLocalNames = this.ImportedLocalNames = [] as $String[];
    const ModuleRequests = this.ModuleRequests = [] as $String[];
    const LexicallyScopedDeclarations = this.LexicallyScopedDeclarations = [] as $$ESDeclaration[];
    const VarScopedDeclarations = this.VarScopedDeclarations = [] as $$ESDeclaration[];

    const $statements = this.$statements = [] as $$TSModuleItem[];
    const statements = node.statements as readonly $StatementNode[];
    let stmt: $StatementNode;
    let $stmt: $$TSModuleItem;
    let s = 0;
    for (let i = 0, ii = statements.length; i < ii; ++i) {
      stmt = statements[i];

      switch (stmt.kind) {
        case SyntaxKind.ModuleDeclaration:
          $stmt = $statements[s++] = new $ModuleDeclaration(stmt, this, ctx);
          break;
        case SyntaxKind.NamespaceExportDeclaration:
          $stmt = $statements[s++] = new $NamespaceExportDeclaration(stmt, this, ctx);
          break;
        case SyntaxKind.ImportEqualsDeclaration:
          $stmt = $statements[s++] = new $ImportEqualsDeclaration(stmt, this, ctx);
          break;
        case SyntaxKind.ImportDeclaration:
          $stmt = $statements[s++] = new $ImportDeclaration(stmt, this, ctx);

          ImportEntries.push(...$stmt.ImportEntries);
          ImportedLocalNames.push(...$stmt.ImportEntries.map(getLocalName));

          ModuleRequests.push(...$stmt.ModuleRequests);
          break;
        case SyntaxKind.ExportAssignment:
          $stmt = $statements[s++] = new $ExportAssignment(stmt, this, ctx);
          break;
        case SyntaxKind.ExportDeclaration:
          $stmt = $statements[s++] = new $ExportDeclaration(stmt, this, ctx);

          ExportedBindings.push(...$stmt.ExportedBindings);
          ExportedNames.push(...$stmt.ExportedNames);
          ExportEntries.push(...$stmt.ExportEntries);

          ModuleRequests.push(...$stmt.ModuleRequests);

          LexicallyScopedDeclarations.push(...$stmt.LexicallyScopedDeclarations);
          break;
        case SyntaxKind.VariableStatement:
          $stmt = $statements[s++] = new $VariableStatement(stmt, this, ctx);

          if ($stmt.isLexical) {
            LexicallyScopedDeclarations.push($stmt);
          } else {
            VarScopedDeclarations.push($stmt);
          }

          if (hasBit($stmt.modifierFlags, ModifierFlags.Export)) {
            ExportedBindings.push(...$stmt.ExportedBindings);
            ExportedNames.push(...$stmt.ExportedNames);
            ExportEntries.push(...$stmt.ExportEntries);
          }

          break;
        case SyntaxKind.FunctionDeclaration:
          // Skip overload signature
          if (stmt.body === void 0) {
            continue;
          }
          $stmt = $statements[s++] = new $FunctionDeclaration(stmt, this, ctx);

          if (hasBit($stmt.modifierFlags, ModifierFlags.Export)) {
            ExportedBindings.push(...$stmt.ExportedBindings);
            ExportedNames.push(...$stmt.ExportedNames);
            ExportEntries.push(...$stmt.ExportEntries);
          }

          LexicallyScopedDeclarations.push($stmt);
          break;
        case SyntaxKind.ClassDeclaration:
          $stmt = $statements[s++] = new $ClassDeclaration(stmt, this, ctx);

          if (hasBit($stmt.modifierFlags, ModifierFlags.Export)) {
            ExportedBindings.push(...$stmt.ExportedBindings);
            ExportedNames.push(...$stmt.ExportedNames);
            ExportEntries.push(...$stmt.ExportEntries);
          }

          LexicallyScopedDeclarations.push($stmt);
          break;
        case SyntaxKind.InterfaceDeclaration:
          $stmt = $statements[s++] = new $InterfaceDeclaration(stmt, this, ctx);

          if (hasBit($stmt.modifierFlags, ModifierFlags.Export)) {
            ExportedBindings.push(...$stmt.ExportedBindings);
            ExportedNames.push(...$stmt.ExportedNames);
            ExportEntries.push(...$stmt.ExportEntries);
          }
          break;
        case SyntaxKind.TypeAliasDeclaration:
          $stmt = $statements[s++] = new $TypeAliasDeclaration(stmt, this, ctx);

          if (hasBit($stmt.modifierFlags, ModifierFlags.Export)) {
            ExportedBindings.push(...$stmt.ExportedBindings);
            ExportedNames.push(...$stmt.ExportedNames);
            ExportEntries.push(...$stmt.ExportEntries);
          }
          break;
        case SyntaxKind.EnumDeclaration:
          $stmt = $statements[s++] = new $EnumDeclaration(stmt, this, ctx);

          if (hasBit($stmt.modifierFlags, ModifierFlags.Export)) {
            ExportedBindings.push(...$stmt.ExportedBindings);
            ExportedNames.push(...$stmt.ExportedNames);
            ExportEntries.push(...$stmt.ExportEntries);
          }
          break;
        case SyntaxKind.Block:
          $stmt = $statements[s++] = new $Block(stmt, this, ctx);

          VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
          break;
        case SyntaxKind.EmptyStatement:
          $stmt = $statements[s++] = new $EmptyStatement(stmt, this, ctx);
          break;
        case SyntaxKind.ExpressionStatement:
          $stmt = $statements[s++] = new $ExpressionStatement(stmt, this, ctx);
          break;
        case SyntaxKind.IfStatement:
          $stmt = $statements[s++] = new $IfStatement(stmt, this, ctx);

          VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
          break;
        case SyntaxKind.DoStatement:
          $stmt = $statements[s++] = new $DoStatement(stmt, this, ctx);

          VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
          break;
        case SyntaxKind.WhileStatement:
          $stmt = $statements[s++] = new $WhileStatement(stmt, this, ctx);

          VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
          break;
        case SyntaxKind.ForStatement:
          $stmt = $statements[s++] = new $ForStatement(stmt, this, ctx);

          VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
          break;
        case SyntaxKind.ForInStatement:
          $stmt = $statements[s++] = new $ForInStatement(stmt, this, ctx);

          VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
          break;
        case SyntaxKind.ForOfStatement:
          $stmt = $statements[s++] = new $ForOfStatement(stmt, this, ctx);

          VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
          break;
        case SyntaxKind.ContinueStatement:
          $stmt = $statements[s++] = new $ContinueStatement(stmt, this, ctx);
          break;
        case SyntaxKind.BreakStatement:
          $stmt = $statements[s++] = new $BreakStatement(stmt, this, ctx);
          break;
        case SyntaxKind.ReturnStatement:
          $stmt = $statements[s++] = new $ReturnStatement(stmt, this, ctx);
          break;
        case SyntaxKind.WithStatement:
          $stmt = $statements[s++] = new $WithStatement(stmt, this, ctx);

          VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
          break;
        case SyntaxKind.SwitchStatement:
          $stmt = $statements[s++] = new $SwitchStatement(stmt, this, ctx);

          VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
          break;
        case SyntaxKind.LabeledStatement:
          $stmt = $statements[s++] = new $LabeledStatement(stmt, this, ctx);

          VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
          break;
        case SyntaxKind.ThrowStatement:
          $stmt = $statements[s++] = new $ThrowStatement(stmt, this, ctx);
          break;
        case SyntaxKind.TryStatement:
          $stmt = $statements[s++] = new $TryStatement(stmt, this, ctx);

          VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
          break;
        case SyntaxKind.DebuggerStatement:
          $stmt = $statements[s++] = new $DebuggerStatement(stmt, this, ctx);
          break;
        default:
          throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as Node).kind]}.`);
      }
    }

    // http://www.ecma-international.org/ecma-262/#sec-parsemodule

    // 1. Assert: sourceText is an ECMAScript source text (see clause 10).
    // 2. Parse sourceText using Module as the goal symbol and analyse the parse result for any Early Error conditions. If the parse was successful and no early errors were found, let body be the resulting parse tree. Otherwise, let body be a List of one or more SyntaxError or ReferenceError objects representing the parsing errors and/or early errors. Parsing and early error detection may be interweaved in an implementation-dependent manner. If more than one parsing error or early error is present, the number and ordering of error objects in the list is implementation-dependent, but at least one must be present.
    // 3. If body is a List of errors, return body.
    // 4. Let requestedModules be the ModuleRequests of body.
    const requestedModules = ModuleRequests;

    // 5. Let importEntries be ImportEntries of body.
    const importEntries = ImportEntries;

    // 6. Let importedBoundNames be ImportedLocalNames(importEntries).
    const importedBoundNames = ImportedLocalNames;

    // 7. Let indirectExportEntries be a new empty List.
    const indirectExportEntries: ExportEntryRecord[] = [];

    // 8. Let localExportEntries be a new empty List.
    const localExportEntries: ExportEntryRecord[] = [];

    // 9. Let starExportEntries be a new empty List.
    const starExportEntries: ExportEntryRecord[] = [];

    // 10. Let exportEntries be ExportEntries of body.
    const exportEntries = ExportEntries;
    let ee: ExportEntryRecord;

    // 11. For each ExportEntry Record ee in exportEntries, do
    for (let i = 0, ii = exportEntries.length; i < ii; ++i) {
      ee = exportEntries[i];

      // 11. a. If ee.[[ModuleRequest]] is null, then
      if (ee.ModuleRequest.isNull) {
        // 11. a. i. If ee.[[LocalName]] is not an element of importedBoundNames, then
        if (!importedBoundNames.some(x => x.is(ee.LocalName))) {
          // 11. a. i. 1. Append ee to localExportEntries.
          localExportEntries.push(ee);
        }
        // 11. a. ii. Else,
        else {
          // 11. a. ii. 1. Let ie be the element of importEntries whose [[LocalName]] is the same as ee.[[LocalName]].
          const ie = importEntries.find(x => x.LocalName.is(ee.LocalName))!;
          // 11. a. ii. 2. If ie.[[ImportName]] is "*", then
          if (ie.ImportName.value === '*') {
            // 11. a. ii. 2. a. Assert: This is a re-export of an imported module namespace object.
            // 11. a. ii. 2. b. Append ee to localExportEntries.
            localExportEntries.push(ee);
          }
          // 11. a. ii. 3. Else this is a re-export of a single name,
          else {
            // 11. a. ii. 3. a. Append the ExportEntry Record { [[ModuleRequest]]: ie.[[ModuleRequest]], [[ImportName]]: ie.[[ImportName]], [[LocalName]]: null, [[ExportName]]: ee.[[ExportName]] } to indirectExportEntries.
            indirectExportEntries.push(new ExportEntryRecord(
              /* source */this,
              /* ExportName */ee.ExportName,
              /* ModuleRequest */ie.ModuleRequest,
              /* ImportName */ie.ImportName,
              /* LocalName */intrinsics.null,
            ));
          }
        }
      }
      // 11. b. Else if ee.[[ImportName]] is "*", then
      else if (ee.ImportName.value === '*') {
      // 11. b. i. Append ee to starExportEntries.
        starExportEntries.push(ee);
      }
      // 11. c. Else,
      else {
        // 11. c. i. Append ee to indirectExportEntries.
        indirectExportEntries.push(ee);
      }
    }

    // 12. Return Source Text Module Record { [[Realm]]: Realm, [[Environment]]: undefined, [[Namespace]]: undefined, [[Status]]: "uninstantiated", [[EvaluationError]]: undefined, [[HostDefined]]: hostDefined, [[ECMAScriptCode]]: body, [[RequestedModules]]: requestedModules, [[ImportEntries]]: importEntries, [[LocalExportEntries]]: localExportEntries, [[IndirectExportEntries]]: indirectExportEntries, [[StarExportEntries]]: starExportEntries, [[DFSIndex]]: undefined, [[DFSAncestorIndex]]: undefined }.
    this.Status = 'uninstantiated';
    this.DFSIndex = void 0;
    this.DFSAncestorIndex = void 0;

    this.RequestedModules = requestedModules;

    this.IndirectExportEntries = indirectExportEntries;
    this.LocalExportEntries = localExportEntries;
    this.StarExportEntries = starExportEntries;


    this.logger.trace(`RequestedModules: `, requestedModules);

    this.logger.trace(`ImportEntries: `, importEntries);

    this.logger.trace(`IndirectExportEntries: `, indirectExportEntries);
    this.logger.trace(`LocalExportEntries: `, localExportEntries);
    this.logger.trace(`StarExportEntries: `, starExportEntries);
  }

  // http://www.ecma-international.org/ecma-262/#sec-moduledeclarationinstantiation
  public Instantiate(): void {
    const start = PLATFORM.now();
    this.logger.debug(`[Instantiate] starting`);

    // TODO: this is temporary. Should be done by RunJobs
    if (this.realm.stack.length === 1 && this.realm.stack.top.ScriptOrModule.isNull) {
      this.realm.stack.top.ScriptOrModule = this;
    }

    // 1. Let module be this Cyclic Module Record.
    // 2. Assert: module.[[Status]] is not "instantiating" or "evaluating".
    // 3. Let stack be a new empty List.
    const stack = [] as $SourceFile[];

    // 4. Let result be InnerModuleInstantiation(module, stack, 0).
    const result = this._InnerModuleInstantiation(stack, 0);

    // 5. If result is an abrupt completion, then
    // 5. a. For each module m in stack, do
    // 5. a. i. Assert: m.[[Status]] is "instantiating".
    // 5. a. ii. Set m.[[Status]] to "uninstantiated".
    // 5. a. iii. Set m.[[Environment]] to undefined.
    // 5. a. iv. Set m.[[DFSIndex]] to undefined.
    // 5. a. v. Set m.[[DFSAncestorIndex]] to undefined.
    // 5. b. Assert: module.[[Status]] is "uninstantiated".
    // 5. c. Return result.
    // 6. Assert: module.[[Status]] is "instantiated" or "evaluated".
    // 7. Assert: stack is empty.
    // 8. Return undefined.

    const end = PLATFORM.now();
    this.logger.info(`[Instantiate] done in ${Math.round(end - start)}ms`);
  }

  // http://www.ecma-international.org/ecma-262/#sec-innermoduleinstantiation
  /** @internal */
  public _InnerModuleInstantiation(stack: $SourceFile[], index: number): number {
    // 1. If module is not a Cyclic Module Record, then
    // 1. a. Perform ? module.Instantiate().
    // 1. b. Return index.

    // We only deal with cyclic module records for now

    // 2. If module.[[Status]] is "instantiating", "instantiated", or "evaluated", then
    if (this.Status === 'instantiating' || this.Status === 'instantiated' || this.Status === 'evaluated') {
      // 2. Return index.
      return index;
    }

    // 3. Assert: module.[[Status]] is "uninstantiated".
    // 4. Set module.[[Status]] to "instantiating".
    this.Status = 'instantiating';

    // 5. Set module.[[DFSIndex]] to index.
    this.DFSIndex = index;

    // 6. Set module.[[DFSAncestorIndex]] to index.
    this.DFSAncestorIndex = index;

    // 7. Increase index by 1.
    ++index;

    // 8. Append module to stack.
    stack.push(this);

    const realm = this.realm;

    // 9. For each String required that is an element of module.[[RequestedModules]], do
    for (const required of this.RequestedModules) {
      // 9. a. Let requiredModule be ? HostResolveImportedModule(module, required).
      const requiredModule = realm.HostResolveImportedModule(this, required);

      // 9. b. Set index to ? InnerModuleInstantiation(requiredModule, stack, index).
      index = requiredModule._InnerModuleInstantiation(stack, index);

      // 9. c. Assert: requiredModule.[[Status]] is either "instantiating", "instantiated", or "evaluated".
      // 9. d. Assert: requiredModule.[[Status]] is "instantiating" if and only if requiredModule is in stack.
      // 9. e. If requiredModule.[[Status]] is "instantiating", then
      if (requiredModule instanceof $SourceFile && requiredModule.Status === 'instantiating') {
        // 9. e. i. Assert: requiredModule is a Cyclic Module Record.
        this.logger.warn(`[_InnerModuleInstantiation] ${requiredModule.$file.name} is a cyclic module record`);

        // 9. e. ii. Set module.[[DFSAncestorIndex]] to min(module.[[DFSAncestorIndex]], requiredModule.[[DFSAncestorIndex]]).
        this.DFSAncestorIndex = Math.min(this.DFSAncestorIndex, requiredModule.DFSAncestorIndex!);
      }
    }

    // 10. Perform ? module.InitializeEnvironment().
    this.InitializeEnvironment();

    // 11. Assert: module occurs exactly once in stack.
    // 12. Assert: module.[[DFSAncestorIndex]] is less than or equal to module.[[DFSIndex]].
    // 13. If module.[[DFSAncestorIndex]] equals module.[[DFSIndex]], then
    if (this.DFSAncestorIndex === this.DFSIndex) {
      // 13. a. Let done be false.
      let done = false;

      // 13. b. Repeat, while done is false,
      while (!done) {
        // 13. b. i. Let requiredModule be the last element in stack.
        // 13. b. ii. Remove the last element of stack.
        const requiredModule = stack.pop()!;

        // 13. b. iii. Set requiredModule.[[Status]] to "instantiated".
        requiredModule.Status = 'instantiated';
        // 13. b. iv. If requiredModule and module are the same Module Record, set done to true.
        if (requiredModule === this) {
          done = true;
        }
      }
    }

    // 14. Return index.
    return index;
  }

  // http://www.ecma-international.org/ecma-262/#sec-source-text-module-record-initialize-environment
  public InitializeEnvironment(): void {
    this.logger.debug(`[InitializeEnvironment] starting`);

    // 1. Let module be this Source Text Module Record.
    // 2. For each ExportEntry Record e in module.[[IndirectExportEntries]], do
    for (const e of this.IndirectExportEntries) {
      // 2. a. Let resolution be ? module.ResolveExport(e.[[ExportName]], « »).
      const resolution = this.ResolveExport(e.ExportName as $String, new ResolveSet());

      // 2. b. If resolution is null or "ambiguous", throw a SyntaxError exception.
      if (resolution === null || resolution === 'ambiguous') {
        throw new SyntaxError(`ResolveExport(${e.ExportName}) returned ${resolution}`);
      }

      // 2. c. Assert: resolution is a ResolvedBinding Record.
    }

    // 3. Assert: All named exports from module are resolvable.
    // 4. Let realm be module.[[Realm]].
    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 5. Assert: Realm is not undefined.
    // 6. Let env be NewModuleEnvironment(realm.[[GlobalEnv]]).
    const envRec = new $ModuleEnvRec(realm, realm['[[GlobalEnv]]']);

    // 7. Set module.[[Environment]] to env.
    this['[[Environment]]'] = envRec;

    // 8. Let envRec be env's EnvironmentRecord.
    // 9. For each ImportEntry Record in in module.[[ImportEntries]], do
    for (const ie of this.ImportEntries) {
      // 9. a. Let importedModule be ! HostResolveImportedModule(module, in.[[ModuleRequest]]).
      const importedModule = realm.HostResolveImportedModule(this, ie.ModuleRequest);

      // 9. b. NOTE: The above call cannot fail because imported module requests are a subset of module.[[RequestedModules]], and these have been resolved earlier in this algorithm.
      // 9. c. If in.[[ImportName]] is "*", then
      if (ie.ImportName.value === '*') {
        // 9. c. i. Let namespace be ? GetModuleNamespace(importedModule).
        const namespace = (function (mod) {
          // http://www.ecma-international.org/ecma-262/#sec-getmodulenamespace

          // 1. Assert: module is an instance of a concrete subclass of Module Record.
          // 2. Assert: module.[[Status]] is not "uninstantiated".
          // 3. Let namespace be module.[[Namespace]].
          let namespace = mod['[[Namespace]]'];

          // 4. If namespace is undefined, then
          if (namespace.isUndefined) {
            // 4. a. Let exportedNames be ? module.GetExportedNames(« »).
            const exportedNames = mod.GetExportedNames(new Set());

            // 4. b. Let unambiguousNames be a new empty List.
            const unambiguousNames: $String[] = [];

            // 4. c. For each name that is an element of exportedNames, do
            for (const name of exportedNames) {
              // 4. c. i. Let resolution be ? module.ResolveExport(name, « »).
              const resolution = mod.ResolveExport(name, new ResolveSet());

              // 4. c. ii. If resolution is a ResolvedBinding Record, append name to unambiguousNames.
              if (resolution instanceof ResolvedBindingRecord) {
                unambiguousNames.push(name);
              }
            }

            // 4. d. Set namespace to ModuleNamespaceCreate(module, unambiguousNames).
            namespace = new $NamespaceExoticObject(realm, mod, unambiguousNames);
          }

          // 5. Return namespace.
          return namespace;
        })(importedModule);

        // 9. c. ii. Perform ! envRec.CreateImmutableBinding(in.[[LocalName]], true).
        envRec.CreateImmutableBinding(ie.LocalName, intrinsics.true);

        // 9. c. iii. Call envRec.InitializeBinding(in.[[LocalName]], namespace).
        envRec.InitializeBinding(ie.LocalName, namespace);
      }
      // 9. d. Else,
      else {
        // 9. d. i. Let resolution be ? importedModule.ResolveExport(in.[[ImportName]], « »).
        const resolution = importedModule.ResolveExport(ie.ImportName, new ResolveSet());

        // 9. d. ii. If resolution is null or "ambiguous", throw a SyntaxError exception.
        if (resolution === null || resolution === 'ambiguous') {
          throw new SyntaxError(`ResolveExport(${ie.ImportName}) returned ${resolution}`);
        }

        // 9. d. iii. Call envRec.CreateImportBinding(in.[[LocalName]], resolution.[[Module]], resolution.[[BindingName]]).
        envRec.CreateImportBinding(ie.LocalName, resolution.Module, resolution.BindingName);
      }
    }

    // 10. Let code be module.[[ECMAScriptCode]].
    // 11. Let varDeclarations be the VarScopedDeclarations of code.
    const varDeclarations = this.VarScopedDeclarations;

    // 12. Let declaredVarNames be a new empty List.
    const declaredVarNames = [] as $String[];

    // 13. For each element d in varDeclarations, do
    for (const d of varDeclarations) {
      // 13. a. For each element dn of the BoundNames of d, do
      for (const dn of d.BoundNames) {
        // 13. a. i. If dn is not an element of declaredVarNames, then
        if (!declaredVarNames.some(x => x.is(dn))) {
          // 13. a. i. 1. Perform ! envRec.CreateMutableBinding(dn, false).
          envRec.CreateMutableBinding(dn, intrinsics.false);

          // 13. a. i. 2. Call envRec.InitializeBinding(dn, undefined).
          envRec.InitializeBinding(dn, intrinsics.undefined);

          // 13. a. i. 3. Append dn to declaredVarNames.
          declaredVarNames.push(dn);
        }
      }
    }

    // 14. Let lexDeclarations be the LexicallyScopedDeclarations of code.
    const lexDeclarations = this.LexicallyScopedDeclarations;

    // 15. For each element d in lexDeclarations, do
    for (const d of lexDeclarations) {
      // 15. a. For each element dn of the BoundNames of d, do
      for (const dn of d.BoundNames) {
        // 15. a. i. If IsConstantDeclaration of d is true, then
        if (d.IsConstantDeclaration) {
          // 15. a. i. 1. Perform ! envRec.CreateImmutableBinding(dn, true).
          envRec.CreateImmutableBinding(dn, intrinsics.true);
        }
        // 15. a. ii. Else,
        else {
          // 15. a. ii. 1. Perform ! envRec.CreateMutableBinding(dn, false).
          envRec.CreateMutableBinding(dn, intrinsics.false);

          // 15. a. iii. If d is a FunctionDeclaration, a GeneratorDeclaration, an AsyncFunctionDeclaration, or an AsyncGeneratorDeclaration, then
          if (d.$kind === SyntaxKind.FunctionDeclaration) {
            // 15. a. iii. 1. Let fo be the result of performing InstantiateFunctionObject for d with argument env.
            const fo = d.InstantiateFunctionObject(envRec);

            // 15. a. iii. 2. Call envRec.InitializeBinding(dn, fo).
            envRec.InitializeBinding(dn, fo);
          }
        }
      }
    }

    // 16. Return NormalCompletion(empty).

    this.logger.debug(`[InitializeEnvironment] done`);
  }

  // http://www.ecma-international.org/ecma-262/#sec-getexportednames
  public GetExportedNames(exportStarSet: Set<IModule>): readonly $String[] {
    // 1. Let module be this Source Text Module Record.
    const mod = this;

    // 2. If exportStarSet contains module, then
    if (exportStarSet.has(mod)) {
      // 2. a. Assert: We've reached the starting point of an import * circularity.
      // 2. b. Return a new empty List.
      return emptyArray;
    }

    // 3. Append module to exportStarSet.
    exportStarSet.add(mod);

    // 4. Let exportedNames be a new empty List.
    const exportedNames: $String[] = [];

    // 5. For each ExportEntry Record e in module.[[LocalExportEntries]], do
    for (const e of mod.LocalExportEntries) {
      // 5. a. Assert: module provides the direct binding for this export.
      // 5. b. Append e.[[ExportName]] to exportedNames.
      exportedNames.push(e.ExportName as $String);
    }

    // 6. For each ExportEntry Record e in module.[[IndirectExportEntries]], do
    for (const e of mod.IndirectExportEntries) {
      // 6. a. Assert: module imports a specific binding for this export.
      // 6. b. Append e.[[ExportName]] to exportedNames.
      exportedNames.push(e.ExportName as $String);
    }

    const realm = this.realm;

    // 7. For each ExportEntry Record e in module.[[StarExportEntries]], do
    for (const e of mod.StarExportEntries) {
      // 7. a. Let requestedModule be ? HostResolveImportedModule(module, e.[[ModuleRequest]]).
      const requestedModule = realm.HostResolveImportedModule(mod, e.ModuleRequest as $String);

      // 7. b. Let starNames be ? requestedModule.GetExportedNames(exportStarSet).
      const starNames = requestedModule.GetExportedNames(exportStarSet);

      // 7. c. For each element n of starNames, do
      for (const n of starNames) {
        // 7. c. i. If SameValue(n, "default") is false, then
        if (n.value !== 'default') {
          // 7. c. i. 1. If n is not an element of exportedNames, then
          if (!exportedNames.includes(n)) {
            // 7. c. i. 1. a. Append n to exportedNames.
            exportedNames.push(n);
          }
        }
      }
    }

    // 8. Return exportedNames.
    return exportedNames;
  }

  // http://www.ecma-international.org/ecma-262/#sec-resolveexport
  public ResolveExport(exportName: $String, resolveSet: ResolveSet): ResolvedBindingRecord | null | 'ambiguous' {
    // 1. Let module be this Source Text Module Record.
    // 2. For each Record { [[Module]], [[ExportName]] } r in resolveSet, do
    // 2. a. If module and r.[[Module]] are the same Module Record and SameValue(exportName, r.[[ExportName]]) is true, then
    if (resolveSet.has(this, exportName)) {
      // 2. a. i. Assert: This is a circular import request.
      // 2. a. ii. Return null.
      this.logger.warn(`[ResolveExport] Circular import: ${exportName}`);
      return null;
    }

    // 3. Append the Record { [[Module]]: module, [[ExportName]]: exportName } to resolveSet.
    resolveSet.add(this, exportName);

    // 4. For each ExportEntry Record e in module.[[LocalExportEntries]], do
    for (const e of this.LocalExportEntries) {
      // 4. a. If SameValue(exportName, e.[[ExportName]]) is true, then
      if (exportName.is(e.ExportName)) {
        // 4. a. i. Assert: module provides the direct binding for this export.
        this.logger.debug(`[ResolveExport] found direct binding for ${exportName.value}`);

        // 4. a. ii. Return ResolvedBinding Record { [[Module]]: module, [[BindingName]]: e.[[LocalName]] }.
        return new ResolvedBindingRecord(this, e.LocalName as $String);
      }
    }

    const realm = this.realm;

    // 5. For each ExportEntry Record e in module.[[IndirectExportEntries]], do
    for (const e of this.IndirectExportEntries) {
      // 5. a. If SameValue(exportName, e.[[ExportName]]) is true, then
      if (exportName.is(e.ExportName)) {
        // 5. a. i. Assert: module imports a specific binding for this export.
        this.logger.debug(`[ResolveExport] found specific imported binding for ${exportName.value}`);

        // 5. a. ii. Let importedModule be ? HostResolveImportedModule(module, e.[[ModuleRequest]]).
        const importedModule = realm.HostResolveImportedModule(this, e.ModuleRequest as $String);

        // 5. a. iii. Return importedModule.ResolveExport(e.[[ImportName]], resolveSet).
        return importedModule.ResolveExport(e.ImportName as $String, resolveSet);
      }
    }

    // 6. If SameValue(exportName, "default") is true, then
    if (exportName.value === 'default') {
      // 6. a. Assert: A default export was not explicitly defined by this module.
      // 6. b. Return null.
      this.logger.warn(`[ResolveExport] No default export defined`);

      return null;
      // 6. c. NOTE: A default export cannot be provided by an export *.
    }

    // 7. Let starResolution be null.
    let starResolution: ResolvedBindingRecord | null = null;

    // 8. For each ExportEntry Record e in module.[[StarExportEntries]], do
    for (const e of this.StarExportEntries) {
      // 8. a. Let importedModule be ? HostResolveImportedModule(module, e.[[ModuleRequest]]).
      const importedModule = realm.HostResolveImportedModule(this, e.ModuleRequest as $String);

      // 8. b. Let resolution be ? importedModule.ResolveExport(exportName, resolveSet).
      const resolution = importedModule.ResolveExport(exportName, resolveSet);

      // 8. c. If resolution is "ambiguous", return "ambiguous".
      if (resolution === 'ambiguous') {
        this.logger.warn(`[ResolveExport] ambiguous resolution for ${exportName.value}`);

        return 'ambiguous';
      }

      // 8. d. If resolution is not null, then
      if (resolution !== null) {
        // 8. d. i. Assert: resolution is a ResolvedBinding Record.
        // 8. d. ii. If starResolution is null, set starResolution to resolution.
        if (starResolution === null) {
          starResolution = resolution;
        }
        // 8. d. iii. Else,
        else {
          // 8. d. iii. 1. Assert: There is more than one * import that includes the requested name.
          // 8. d. iii. 2. If resolution.[[Module]] and starResolution.[[Module]] are not the same Module Record or SameValue(resolution.[[BindingName]], starResolution.[[BindingName]]) is false, return "ambiguous".
          if (!(resolution.Module === starResolution.Module && resolution.BindingName === starResolution.BindingName)) {
            this.logger.warn(`[ResolveExport] ambiguous resolution for ${exportName.value}`);

            return 'ambiguous';
          }
        }
      }
    }

    if (starResolution === null) {
      this.logger.warn(`[ResolveExport] starResolution is null for ${exportName.value}`);
    }

    // 9. Return starResolution.
    return starResolution;
  }
}

export class $DocumentFragment implements I$Node, IModule {
  public readonly '<IModule>': unknown;

  public readonly id: number;

  public readonly documentFragment: $DocumentFragment = this;
  public readonly parent: $DocumentFragment = this;
  public readonly ctx: Context = Context.None;
  public readonly depth: number = 0;

  public readonly logger: ILogger;

  public '[[Environment]]': $ModuleEnvRec | $Undefined;
  public '[[Namespace]]': $Object | $Undefined;
  public '[[HostDefined]]': any;

  public get isNull(): false { return false; }

  public constructor(
    public readonly $file: IFile,
    public readonly node: DocumentFragment,
    public readonly realm: Realm,
    public readonly pkg: NPMPackage,
  ) {
    this.id = realm.registerNode(this);
    const intrinsics = realm['[[Intrinsics]]'];
    this['[[Environment]]'] = intrinsics.undefined;
    this['[[Namespace]]'] = intrinsics.undefined;

    this.logger = pkg.container.get(ILogger).root.scopeTo(`DocumentFragment<(...)${$file.rootlessPath}>`);
  }

  public ResolveExport(exportName: $String, resolveSet: ResolveSet): ResolvedBindingRecord | null | 'ambiguous' {
    this.logger.debug(`[ResolveExport] returning content as '${exportName.value}'`);

    return new ResolvedBindingRecord(this, exportName);
  }

  public GetExportedNames(exportStarSet: Set<IModule>): readonly $String[] {
    return [];
  }

  public Instantiate(): void {

  }

  /** @internal */
  public _InnerModuleInstantiation(stack: IModule[], index: number): number {
    return index;
  }
}

type $$ModuleBody = (
  $ModuleBlock |
  $ModuleDeclaration
);

type $$ModuleName = (
  $Identifier |
  $StringLiteral
);

export class $ModuleDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.ModuleDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $name: $$ModuleName;
  public readonly $body: $Identifier | $ModuleBlock | $ModuleDeclaration | undefined;

  public constructor(
    public readonly node: ModuleDeclaration,
    public readonly parent: $SourceFile | $$ModuleBody,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (node.name.kind === SyntaxKind.Identifier) {
      this.$name = new $Identifier(node.name, this, ctx);
    } else {
      this.$name = new $StringLiteral(node.name, this, ctx);
    }

    if (node.body === void 0) {
      this.$body = void 0;
    } else {
      switch (node.body.kind) {
        case SyntaxKind.Identifier:
          this.$body = new $Identifier(node.body, this, ctx)
          break;
        case SyntaxKind.ModuleBlock:
          this.$body = new $ModuleBlock(node.body, this, ctx)
          break;
        case SyntaxKind.ModuleDeclaration:
          this.$body = new $ModuleDeclaration(node.body, this, ctx)
          break;
        default:
          throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as Node).kind]}.`);
      }
    }
  }
}

// http://www.ecma-international.org/ecma-262/#importentry-record
/**
 * | Import Statement Form          | MR        | IN          | LN        |
 * |:-------------------------------|:----------|:------------|:----------|
 * | `import v from "mod";`         | `"mod"`   | `"default"` | `"v"`     |
 * | `import * as ns from "mod";`   | `"mod"`   | `"*"`       | `"ns"`    |
 * | `import {x} from "mod";`       | `"mod"`   | `"x"`       | `"x"`     |
 * | `import {x as v} from "mod";`  | `"mod"`   | `"x"`       | `"v"`     |
 * | `import "mod";`                | N/A       | N/A         | N/A       |
 */
export class ImportEntryRecord {
  public constructor(
    public readonly source: $ImportClause | $NamespaceImport | $ImportSpecifier,
    public readonly ModuleRequest: $String,
    public readonly ImportName: $String,
    public readonly LocalName: $String,
  ) {}
}

type $$ModuleReference = (
  $$EntityName |
  $ExternalModuleReference
);

/**
 * One of:
 * - import x = require("mod");
 * - import x = M.x;
 */
export class $ImportEqualsDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.ImportEqualsDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $name: $Identifier;
  public readonly $moduleReference: $$ModuleReference;

  public constructor(
    public readonly node: ImportEqualsDeclaration,
    public readonly parent: $SourceFile | $ModuleBlock,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$name = $identifier(node.name, this, ctx);
    switch (node.moduleReference.kind) {
      case SyntaxKind.Identifier:
        this.$moduleReference = new $Identifier(node.moduleReference, this, ctx)
        break;
      case SyntaxKind.QualifiedName:
        this.$moduleReference = new $QualifiedName(node.moduleReference, this, ctx)
        break;
      case SyntaxKind.ExternalModuleReference:
        this.$moduleReference = new $ExternalModuleReference(node.moduleReference, this, ctx)
        break;
      default:
        throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as Node).kind]}.`);
    }
  }
}

// In case of:
// import "mod"  => importClause = undefined, moduleSpecifier = "mod"
// In rest of the cases, module specifier is string literal corresponding to module
// ImportClause information is shown at its declaration below.
export class $ImportDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.ImportDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $importClause: $ImportClause | $Undefined;
  public readonly $moduleSpecifier: $StringLiteral;

  public readonly moduleSpecifier: $String;

  // http://www.ecma-international.org/ecma-262/#sec-imports-static-semantics-boundnames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-imports-static-semantics-importentries
  public readonly ImportEntries: readonly ImportEntryRecord[];
  // http://www.ecma-international.org/ecma-262/#sec-imports-static-semantics-modulerequests
  public readonly ModuleRequests: readonly $String[];

  public constructor(
    public readonly node: ImportDeclaration,
    public readonly parent: $SourceFile | $ModuleBlock,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    const $moduleSpecifier = this.$moduleSpecifier = new $StringLiteral(node.moduleSpecifier as StringLiteral, this, ctx);

    const moduleSpecifier = this.moduleSpecifier = $moduleSpecifier.StringValue;

    if (node.importClause === void 0) {
      this.$importClause = new $Undefined(realm, this);

      this.BoundNames = emptyArray;
      this.ImportEntries = emptyArray;
    } else {
      const $importClause = this.$importClause = new $ImportClause(node.importClause, this, ctx);

      this.BoundNames = $importClause.BoundNames;
      this.ImportEntries = $importClause.ImportEntriesForModule;
    }

    this.ModuleRequests = [moduleSpecifier];
  }
}

// In case of:
// import d from "mod" => name = d, namedBinding = undefined
// import * as ns from "mod" => name = undefined, namedBinding: NamespaceImport = { name: ns }
// import d, * as ns from "mod" => name = d, namedBinding: NamespaceImport = { name: ns }
// import { a, b as x } from "mod" => name = undefined, namedBinding: NamedImports = { elements: [{ name: a }, { name: x, propertyName: b}]}
// import d, { a, b as x } from "mod" => name = d, namedBinding: NamedImports = { elements: [{ name: a }, { name: x, propertyName: b}]}
export class $ImportClause implements I$Node {
  public readonly $kind = SyntaxKind.ImportClause;
  public readonly id: number;

  public readonly $name: $Identifier | $Undefined;
  public readonly $namedBindings: $NamespaceImport | $NamedImports | undefined;

  public readonly moduleSpecifier: $String;

  // http://www.ecma-international.org/ecma-262/#sec-imports-static-semantics-boundnames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-importentriesformodule
  public readonly ImportEntriesForModule: readonly ImportEntryRecord[];

  public constructor(
    public readonly node: ImportClause,
    public readonly parent: $ImportDeclaration,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
    const intrinsics = realm['[[Intrinsics]]'];

    const moduleSpecifier = this.moduleSpecifier = parent.moduleSpecifier;

    const BoundNames = this.BoundNames = [] as $String[];
    const ImportEntriesForModule = this.ImportEntriesForModule = [] as ImportEntryRecord[];

    if (node.name === void 0) {
      this.$name = new $Undefined(realm, this);
    } else {
      const $name = this.$name = new $Identifier(node.name, this, ctx);

      const [localName] = $name.BoundNames;
      BoundNames.push(localName);
      ImportEntriesForModule.push(
        new ImportEntryRecord(
          /* source */this,
          /* ModuleRequest */moduleSpecifier,
          /* ImportName */intrinsics.default,
          /* LocalName */localName,
        ),
      );
    }

    if (node.namedBindings === void 0) {
      this.$namedBindings = void 0;
    } else {
      if (node.namedBindings.kind === SyntaxKind.NamespaceImport) {
        const $namedBindings = this.$namedBindings = new $NamespaceImport(node.namedBindings, this, ctx);
        BoundNames.push(...$namedBindings.BoundNames);
        ImportEntriesForModule.push(...$namedBindings.ImportEntriesForModule);
      } else {
        const $namedBindings = this.$namedBindings = new $NamedImports(node.namedBindings, this, ctx);
        BoundNames.push(...$namedBindings.BoundNames);
        ImportEntriesForModule.push(...$namedBindings.ImportEntriesForModule);
      }
    }
  }
}

export class $NamedImports implements I$Node {
  public readonly $kind = SyntaxKind.NamedImports;
  public readonly id: number;

  public readonly $elements: readonly $ImportSpecifier[];

  public readonly moduleSpecifier: $String;

  // http://www.ecma-international.org/ecma-262/#sec-imports-static-semantics-boundnames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-importentriesformodule
  public readonly ImportEntriesForModule: readonly ImportEntryRecord[];

  public constructor(
    public readonly node: NamedImports,
    public readonly parent: $ImportClause,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.moduleSpecifier = parent.moduleSpecifier;

    const $elements = this.$elements = node.elements.map(x => new $ImportSpecifier(x, this, ctx));

    this.BoundNames = $elements.flatMap(getBoundNames);
    this.ImportEntriesForModule = $elements.flatMap(getImportEntriesForModule);
  }
}

export class $ImportSpecifier implements I$Node {
  public readonly $kind = SyntaxKind.ImportSpecifier;
  public readonly id: number;

  public readonly $propertyName: $Identifier | $Undefined;
  public readonly $name: $Identifier;

  // http://www.ecma-international.org/ecma-262/#sec-imports-static-semantics-boundnames
  public readonly BoundNames: readonly [$String];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-importentriesformodule
  public readonly ImportEntriesForModule: readonly [ImportEntryRecord];

  public constructor(
    public readonly node: ImportSpecifier,
    public readonly parent: $NamedImports,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    let $propertyName: $Identifier | $Undefined;
    if (node.propertyName === void 0) {
      $propertyName = this.$propertyName = new $Undefined(realm, this);
    } else {
      $propertyName = this.$propertyName = new $Identifier(node.propertyName, this, ctx);
    }
    const $name = this.$name = $identifier(node.name, this, ctx);

    const BoundNames = this.BoundNames = this.$name.BoundNames;

    const moduleSpecifier = parent.moduleSpecifier;

    if ($propertyName.isUndefined) {
      const [localName] = BoundNames;
      this.ImportEntriesForModule = [
        new ImportEntryRecord(
          /* source */this,
          /* ModuleRequest */moduleSpecifier,
          /* ImportName */localName,
          /* LocalName */localName,
        ),
      ];
    } else {
      const importName = $propertyName.StringValue;
      const localName = $name.StringValue;
      this.ImportEntriesForModule = [
        new ImportEntryRecord(
          /* source */this,
          /* ModuleRequest */moduleSpecifier,
          /* ImportName */importName,
          /* LocalName */localName,
        ),
      ];
    }
  }
}

export class $NamespaceImport implements I$Node {
  public readonly $kind = SyntaxKind.NamespaceImport;
  public readonly id: number;

  public readonly $name: $Identifier;

  // http://www.ecma-international.org/ecma-262/#sec-imports-static-semantics-boundnames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-importentriesformodule
  public readonly ImportEntriesForModule: readonly [ImportEntryRecord];

  public constructor(
    public readonly node: NamespaceImport,
    public readonly parent: $ImportClause,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
    const intrinsics = realm['[[Intrinsics]]'];

    const $name = this.$name = new $Identifier(node.name, this, ctx);

    this.BoundNames = $name.BoundNames;

    const moduleSpecifier = parent.moduleSpecifier;

    const localName = $name.StringValue;
    this.ImportEntriesForModule = [
      new ImportEntryRecord(
        /* source */this,
        /* ModuleRequest */moduleSpecifier,
        /* ImportName */intrinsics['*'],
        /* LocalName */localName,
      ),
    ];
  }
}

/**
 * | Export Statement Form           | EN           | MR            | IN         | LN            |
 * |:--------------------------------|:-------------|:--------------|:-----------|:--------------|
 * | `export var v;`                 | `"v"`        | `null`        | `null`     | `"v"`         |
 * | `export default function f(){}` | `"default"`  | `null`        | `null`     | `"f"`         |
 * | `export default function(){}`   | `"default"`  | `null`        | `null`     | `"*default*"` |
 * | `export default 42;`            | `"default"`  | `null`        | `null`     | `"*default*"` |
 * | `export {x};`                   | `"x"`        | `null`        | `null`     | `"x"`         |
 * | `export {v as x};`              | `"x"`        | `null`        | `null`     | `"v"`         |
 * | `export {x} from "mod";`        | `"x"`        | `"mod"`       | `"x"`      | `null`        |
 * | `export {v as x} from "mod";`   | `"x"`        | `"mod"`       | `"v"`      | `null`        |
 * | `export * from "mod";`          | `null`       | `"mod"`       | `"*"`      | `null`        |
 */
export class ExportEntryRecord {
  public constructor(
    public readonly source: $FunctionDeclaration | $ClassDeclaration | $VariableStatement | $ExportDeclaration | $ExportSpecifier | $SourceFile | $TypeAliasDeclaration | $InterfaceDeclaration | $EnumDeclaration,
    public readonly ExportName: $String | $Null,
    public readonly ModuleRequest: $String | $Null,
    public readonly ImportName: $String | $Null,
    public readonly LocalName: $String | $Null,
  ) {}
}

export class $ExportAssignment implements I$Node {
  public readonly $kind = SyntaxKind.ExportAssignment;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public readonly BoundNames: readonly [$String<'*default*'>];

  public constructor(
    public readonly node: ExportAssignment,
    public readonly parent: $SourceFile,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
    const intrinsics = realm['[[Intrinsics]]'];

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);

    this.BoundNames = [intrinsics['*default*']];
  }
}

export class $ExportDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.ExportDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $exportClause: $NamedExports | undefined;
  public readonly $moduleSpecifier: $StringLiteral | undefined;

  public readonly moduleSpecifier: $String | $Null;

  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-boundnames
  public readonly BoundNames: readonly $String[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportedbindings
  public readonly ExportedBindings: readonly $String[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportednames
  public readonly ExportedNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportentries
  public readonly ExportEntries: readonly ExportEntryRecord[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-isconstantdeclaration
  public readonly IsConstantDeclaration: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-lexicallyscopeddeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-modulerequests
  public readonly ModuleRequests: readonly $String[];

  public readonly TypeDeclarations: readonly $$TSDeclaration[] = emptyArray;
  public readonly IsType: false = false;

  public constructor(
    public readonly node: ExportDeclaration,
    public readonly parent: $SourceFile | $ModuleBlock,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
    const intrinsics = realm['[[Intrinsics]]'];

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    let moduleSpecifier: $String | $Null;
    if (node.moduleSpecifier === void 0) {
      this.$moduleSpecifier = void 0;
      moduleSpecifier = this.moduleSpecifier = intrinsics.null;

      this.ModuleRequests = emptyArray;
    } else {
      const $moduleSpecifier = this.$moduleSpecifier = new $StringLiteral(node.moduleSpecifier as StringLiteral, this, ctx);
      moduleSpecifier = this.moduleSpecifier = $moduleSpecifier!.StringValue;

      this.ModuleRequests = [moduleSpecifier];
    }

    if (node.exportClause === void 0) {
      this.$exportClause = void 0;

      this.ExportedNames = emptyArray;
      this.ExportEntries = [
        new ExportEntryRecord(
          /* source */this,
          /* ExportName */intrinsics.null,
          /* ModuleRequest */moduleSpecifier,
          /* ImportName */intrinsics['*'],
          /* LocalName */intrinsics.null,
        ),
      ];
    } else {
      const $exportClause = this.$exportClause = new $NamedExports(node.exportClause, this, ctx);

      this.ExportedNames = $exportClause.ExportedNames;
      this.ExportEntries = $exportClause.ExportEntriesForModule;
    }
  }
}

export class $NamedExports implements I$Node {
  public readonly $kind = SyntaxKind.NamedExports;
  public readonly id: number;

  public readonly $elements: readonly $ExportSpecifier[];

  public readonly moduleSpecifier: $String | $Null;

  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportednames
  public readonly ExportedNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-exportentriesformodule
  public readonly ExportEntriesForModule: readonly ExportEntryRecord[];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-referencedbindings
  public readonly ReferencedBindings: readonly $String[];

  public constructor(
    public readonly node: NamedExports,
    public readonly parent: $ExportDeclaration,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.moduleSpecifier = parent.moduleSpecifier;

    const $elements = this.$elements = node.elements.map(x => new $ExportSpecifier(x, this, ctx));

    this.ExportedNames = $elements.flatMap(getExportedNames);
    this.ExportEntriesForModule = $elements.flatMap(getExportEntriesForModule);
    this.ReferencedBindings = $elements.flatMap(getReferencedBindings);
  }
}

export class $ExportSpecifier implements I$Node {
  public readonly $kind = SyntaxKind.ExportSpecifier;
  public readonly id: number;

  public readonly $propertyName: $Identifier | $Undefined;
  public readonly $name: $Identifier;

  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportednames
  public readonly ExportedNames: readonly [$String];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-exportentriesformodule
  public readonly ExportEntriesForModule: readonly [ExportEntryRecord];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-referencedbindings
  public readonly ReferencedBindings: readonly [$String];

  public constructor(
    public readonly node: ExportSpecifier,
    public readonly parent: $NamedExports,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
    const intrinsics = realm['[[Intrinsics]]'];

    let $propertyName: $Identifier | $Undefined;
    if (node.propertyName === void 0) {
      $propertyName = this.$propertyName = new $Undefined(realm, this);
    } else {
      $propertyName = this.$propertyName = new $Identifier(node.propertyName, this, ctx);
    }
    const $name = this.$name = new $Identifier(node.name, this, ctx);

    const moduleSpecifier = parent.moduleSpecifier;

    if ($propertyName.isUndefined) {
      const sourceName = $name.StringValue;

      this.ReferencedBindings = [sourceName];
      this.ExportedNames = [sourceName];

      if (moduleSpecifier.isNull) {
        this.ExportEntriesForModule = [
          new ExportEntryRecord(
            /* source */this,
            /* ExportName */sourceName,
            /* ModuleRequest */moduleSpecifier,
            /* ImportName */intrinsics.null,
            /* LocalName */sourceName,
          ),
        ];
      } else {
        this.ExportEntriesForModule = [
          new ExportEntryRecord(
            /* source */this,
            /* ExportName */sourceName,
            /* ModuleRequest */moduleSpecifier,
            /* ImportName */sourceName,
            /* LocalName */intrinsics.null,
          ),
        ];
      }
    } else {
      const exportName = $name.StringValue;
      const sourceName = $propertyName.StringValue;
      this.ReferencedBindings = [sourceName];

      this.ExportedNames = [exportName];

      if (moduleSpecifier.isNull) {
        this.ExportEntriesForModule = [
          new ExportEntryRecord(
            /* source */this,
            /* ExportName */exportName,
            /* ModuleRequest */moduleSpecifier,
            /* ImportName */intrinsics.null,
            /* LocalName */sourceName,
          ),
        ];
      } else {
        this.ExportEntriesForModule = [
          new ExportEntryRecord(
            /* source */this,
            /* ExportName */exportName,
            /* ModuleRequest */moduleSpecifier,
            /* ImportName */sourceName,
            /* LocalName */intrinsics.null,
          ),
        ];
      }
    }
  }
}

export class $NamespaceExportDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.NamespaceExportDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $name: $Identifier;

  public constructor(
    public readonly node: NamespaceExportDeclaration,
    public readonly parent: $$ModuleDeclarationParent,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$name = $identifier(node.name, this, ctx);
  }
}

export class $ModuleBlock implements I$Node {
  public readonly $kind = SyntaxKind.ModuleBlock;
  public readonly id: number;

  // TODO: ModuleBlock shares a lot in common with SourceFile, so we implement this last to try to maximize code reuse / reduce refactoring overhead and/or see if the two can be consolidated.
  public readonly $statements: readonly $$TSModuleItem[] = emptyArray;

  public constructor(
    public readonly node: ModuleBlock,
    public readonly parent: $ModuleDeclaration,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
  }
}

export class $ExternalModuleReference implements I$Node {
  public readonly $kind = SyntaxKind.ExternalModuleReference;
  public readonly id: number;

  public readonly $expression: $StringLiteral;

  public constructor(
    public readonly node: ExternalModuleReference,
    public readonly parent: $ImportEqualsDeclaration,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = new $StringLiteral(node.expression as StringLiteral, this, ctx);
  }
}

type $$NodeWithQualifiedName = (
  $ImportEqualsDeclaration |
  $QualifiedName
);

type $$EntityName = (
  $Identifier |
  $QualifiedName
);

export class $QualifiedName implements I$Node {
  public readonly $kind = SyntaxKind.QualifiedName;
  public readonly id: number;

  public readonly $left: $$EntityName;
  public readonly $right: $Identifier;

  public constructor(
    public readonly node: QualifiedName,
    public readonly parent: $$NodeWithQualifiedName,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    if (node.left.kind === SyntaxKind.Identifier) {
      this.$left = new $Identifier(node.left, this, ctx);
    } else {
      this.$left = new $QualifiedName(node.left, this, ctx);
    }

    this.$right = new $Identifier(node.right, this, ctx);
  }
}

type $$NamedDeclaration = (
  $GetAccessorDeclaration |
  $SetAccessorDeclaration |
  $MethodDeclaration |
  $PropertyAssignment |
  $ShorthandPropertyAssignment |
  $SpreadAssignment |
  $BindingElement |
  $EnumMember |
  $PropertyDeclaration
);

export class $ComputedPropertyName implements I$Node {
  public readonly $kind = SyntaxKind.ComputedPropertyName;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  // http://www.ecma-international.org/ecma-262/#sec-object-initializer-static-semantics-propname
  public readonly PropName: $String | $Empty;

  public constructor(
    public readonly node: ComputedPropertyName,
    public readonly parent: $$NamedDeclaration,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);

    this.PropName = new $Empty(realm, this);
  }
}


export class $ParameterDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.Parameter;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;
  public readonly combinedModifierFlags: ModifierFlags;
  public readonly nodeFlags: NodeFlags;
  public readonly combinedNodeFlags: NodeFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$BindingName;
  public readonly $initializer: $$AssignmentExpressionOrHigher | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-boundnames
  public readonly BoundNames: readonly $String[] | readonly [$String];
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-containsexpression
  public readonly ContainsExpression: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-hasinitializer
  public readonly HasInitializer: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: boolean;

  public constructor(
    public readonly node: ParameterDeclaration,
    public readonly parent: $$SignatureDeclaration,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.modifierFlags = this.combinedModifierFlags = modifiersToModifierFlags(node.modifiers);
    this.nodeFlags = this.combinedNodeFlags = node.flags;

    ctx |= Context.InParameterDeclaration;

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    const $name = this.$name = $$bindingName(node.name, this, ctx);

    this.BoundNames = $name.BoundNames;
    if (node.initializer === void 0) {
      this.$initializer = void 0;
      this.ContainsExpression = $name.ContainsExpression;
      this.HasInitializer = false;
      this.IsSimpleParameterList = $name.IsSimpleParameterList;
    } else {
      this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);
      this.ContainsExpression = true;
      this.HasInitializer = true;
      this.IsSimpleParameterList = false;
    }
  }
}


export class $ObjectBindingPattern implements I$Node {
  public readonly $kind = SyntaxKind.ObjectBindingPattern;
  public readonly id: number;

  public readonly combinedModifierFlags: ModifierFlags;
  public readonly nodeFlags: NodeFlags;
  public readonly combinedNodeFlags: NodeFlags;

  public readonly $elements: readonly $BindingElement[];

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-boundnames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-containsexpression
  public readonly ContainsExpression: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-hasinitializer
  public readonly HasInitializer: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: boolean;

  public constructor(
    public readonly node: ObjectBindingPattern,
    public readonly parent: $$DestructurableBinding,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.combinedModifierFlags = parent.combinedModifierFlags;
    this.nodeFlags = node.flags;
    this.combinedNodeFlags = node.flags | parent.combinedModifierFlags;

    ctx |= Context.InBindingPattern;

    const $elements = this.$elements = node.elements.map(x => new $BindingElement(x, this, ctx));

    this.BoundNames = $elements.flatMap(getBoundNames);
    this.ContainsExpression = $elements.some(getContainsExpression);
    this.HasInitializer = $elements.some(getHasInitializer);
    this.IsSimpleParameterList = $elements.every(getIsSimpleParameterList);
  }
}

type $$ArrayBindingElement = (
  $BindingElement |
  $OmittedExpression
);

function $$arrayBindingElement(
  node: ArrayBindingElement,
  parent: $ArrayBindingPattern,
  ctx: Context,
): $$ArrayBindingElement {
  switch (node.kind) {
    case SyntaxKind.BindingElement:
      return new $BindingElement(node, parent, ctx);
    case SyntaxKind.OmittedExpression:
      return new $OmittedExpression(node, parent, ctx);
  }
}


function $$arrayBindingElementList(
  nodes: readonly ArrayBindingElement[],
  parent: $ArrayBindingPattern,
  ctx: Context,
): readonly $$ArrayBindingElement[] {
  const len = nodes.length;
  const $nodes: $$ArrayBindingElement[] = Array(len);

  for (let i = 0; i < len; ++i) {
    $nodes[i] = $$arrayBindingElement(nodes[i], parent, ctx);
  }

  return $nodes;
}

export class $ArrayBindingPattern implements I$Node {
  public readonly $kind = SyntaxKind.ArrayBindingPattern;
  public readonly id: number;

  public readonly combinedModifierFlags: ModifierFlags;
  public readonly nodeFlags: NodeFlags;
  public readonly combinedNodeFlags: NodeFlags;

  public readonly $elements: readonly $$ArrayBindingElement[];

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-boundnames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-containsexpression
  public readonly ContainsExpression: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-hasinitializer
  public readonly HasInitializer: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: boolean;

  public constructor(
    public readonly node: ArrayBindingPattern,
    public readonly parent: $$DestructurableBinding,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.combinedModifierFlags = parent.combinedModifierFlags;
    this.nodeFlags = node.flags;
    this.combinedNodeFlags = node.flags | parent.combinedModifierFlags;

    ctx |= Context.InBindingPattern;

    const $elements = this.$elements = $$arrayBindingElementList(node.elements, this, ctx);

    this.BoundNames = $elements.flatMap(getBoundNames);
    this.ContainsExpression = $elements.some(getContainsExpression);
    this.HasInitializer = $elements.some(getHasInitializer);
    this.IsSimpleParameterList = $elements.every(getIsSimpleParameterList);
  }
}

type $$BindingPattern = (
  $ArrayBindingPattern |
  $ObjectBindingPattern
);

export class $BindingElement implements I$Node {
  public readonly $kind = SyntaxKind.BindingElement;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;
  public readonly combinedModifierFlags: ModifierFlags;
  public readonly nodeFlags: NodeFlags;
  public readonly combinedNodeFlags: NodeFlags;

  public readonly $propertyName: $$PropertyName | undefined;
  public readonly $name: $$BindingName;
  public readonly $initializer: $$AssignmentExpressionOrHigher | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-boundnames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-containsexpression
  public readonly ContainsExpression: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-hasinitializer
  public readonly HasInitializer: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: boolean;

  public constructor(
    public readonly node: BindingElement,
    public readonly parent: $$BindingPattern,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);
    this.combinedModifierFlags = this.modifierFlags | parent.combinedModifierFlags;
    this.nodeFlags = node.flags;
    this.combinedNodeFlags = node.flags | parent.combinedModifierFlags;

    ctx = clearBit(ctx, Context.IsBindingName);

    if (node.propertyName === void 0) {
      this.$propertyName = void 0;
      const $name = this.$name = $$bindingName(node.name, this, ctx | Context.IsBindingName);

      this.BoundNames = $name.BoundNames;

      if (node.initializer === void 0) {
        this.$initializer = void 0;

        this.ContainsExpression = $name.ContainsExpression;
        this.HasInitializer = false;
        this.IsSimpleParameterList = $name.$kind === SyntaxKind.Identifier;
      } else {
        this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);

        this.ContainsExpression = true;
        this.HasInitializer = true;
        this.IsSimpleParameterList = false;
      }

    } else {
      const $propertyName = this.$propertyName = $$propertyName(node.propertyName, this, ctx);
      const $name = this.$name = $$bindingName(node.name, this, ctx | Context.IsBindingName);

      this.BoundNames = $name.BoundNames;

      if (node.initializer === void 0) {
        this.$initializer = void 0;

        this.ContainsExpression = $propertyName.$kind === SyntaxKind.ComputedPropertyName || $name.ContainsExpression;
        this.HasInitializer = false;
        this.IsSimpleParameterList = $name.$kind === SyntaxKind.Identifier;
      } else {
        this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);

        this.ContainsExpression = true;
        this.HasInitializer = true;
        this.IsSimpleParameterList = false;
      }
    }
  }
}

export class $SpreadElement implements I$Node {
  public readonly $kind = SyntaxKind.SpreadElement;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: SpreadElement,
    public readonly parent: $NodeWithSpreadElements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
  }
}

export class $PropertyAssignment implements I$Node {
  public readonly $kind = SyntaxKind.PropertyAssignment;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $name: $$PropertyName;
  public readonly $initializer: $$AssignmentExpressionOrHigher;

  // http://www.ecma-international.org/ecma-262/#sec-object-initializer-static-semantics-propname
  public readonly PropName: $String | $Empty;

  public constructor(
    public readonly node: PropertyAssignment,
    public readonly parent: $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    const $name = this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);

    this.PropName = $name.PropName;
  }
}

export class $ShorthandPropertyAssignment implements I$Node {
  public readonly $kind = SyntaxKind.ShorthandPropertyAssignment;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $name: $Identifier;
  public readonly $objectAssignmentInitializer: $$AssignmentExpressionOrHigher | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-object-initializer-static-semantics-propname
  public readonly PropName: $String;

  public constructor(
    public readonly node: ShorthandPropertyAssignment,
    public readonly parent: $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    const $name = this.$name = $identifier(node.name, this, ctx);
    this.$objectAssignmentInitializer = $assignmentExpression(node.objectAssignmentInitializer as $AssignmentExpressionNode, this, ctx);

    this.PropName = $name.PropName;
  }
}

export class $SpreadAssignment implements I$Node {
  public readonly $kind = SyntaxKind.SpreadAssignment;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  // http://www.ecma-international.org/ecma-262/#sec-object-initializer-static-semantics-propname
  public readonly PropName: empty = empty;

  public constructor(
    public readonly node: SpreadAssignment,
    public readonly parent: $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
  }
}

export class $OmittedExpression implements I$Node {
  public readonly $kind = SyntaxKind.OmittedExpression;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-boundnames
  public readonly BoundNames: readonly $String[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-containsexpression
  public readonly ContainsExpression: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-hasinitializer
  public readonly HasInitializer: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: false = false;

  public constructor(
    public readonly node: OmittedExpression,
    public readonly parent: $ArrayBindingPattern | $ArrayLiteralExpression | $NewExpression | $CallExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
  }
}

// #region Statements

export class $Block implements I$Node {
  public readonly $kind = SyntaxKind.Block;
  public readonly id: number;

  public readonly $statements: readonly $$TSStatementListItem[];

  // http://www.ecma-international.org/ecma-262/#sec-block-static-semantics-lexicallyscopeddeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-block-static-semantics-toplevellexicallyscopeddeclarations
  public readonly TopLevelLexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-block-static-semantics-toplevelvarscopeddeclarations
  public readonly TopLevelVarScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-block-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public readonly TypeDeclarations: readonly $$TSDeclaration[] = emptyArray;
  public readonly IsType: false = false;

  public constructor(
    public readonly node: Block,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    const $statements = this.$statements = $$tsStatementList(node.statements as NodeArray<$StatementNode>, this, ctx);

    const LexicallyScopedDeclarations = this.LexicallyScopedDeclarations = [] as $$ESDeclaration[];
    const TopLevelLexicallyScopedDeclarations = this.TopLevelLexicallyScopedDeclarations = [] as $$ESDeclaration[];
    const TopLevelVarScopedDeclarations = this.TopLevelVarScopedDeclarations = [] as $$ESDeclaration[];
    const VarScopedDeclarations = this.VarScopedDeclarations = [] as $$ESDeclaration[];

    const len = $statements.length;
    let $statement: $$TSStatementListItem;
    for (let i = 0; i < len; ++i) {
      $statement = $statements[i];
      switch ($statement.$kind) {
        case SyntaxKind.FunctionDeclaration:
          LexicallyScopedDeclarations.push($statement);

          TopLevelVarScopedDeclarations.push($statement);
          break;
        case SyntaxKind.ClassDeclaration:
          LexicallyScopedDeclarations.push($statement);

          TopLevelLexicallyScopedDeclarations.push($statement);
          break;
        case SyntaxKind.VariableStatement:
          if ($statement.isLexical) {
            LexicallyScopedDeclarations.push($statement);

            TopLevelLexicallyScopedDeclarations.push($statement);
          } else {
            VarScopedDeclarations.push(...$statement.VarScopedDeclarations);
          }
          break;
        case SyntaxKind.LabeledStatement:
          LexicallyScopedDeclarations.push(...$statement.LexicallyScopedDeclarations);

          VarScopedDeclarations.push(...$statement.VarScopedDeclarations);
          break;
        case SyntaxKind.Block:
        case SyntaxKind.IfStatement:
        case SyntaxKind.DoStatement:
        case SyntaxKind.WhileStatement:
        case SyntaxKind.ForStatement:
        case SyntaxKind.ForInStatement:
        case SyntaxKind.ForOfStatement:
        case SyntaxKind.WithStatement:
        case SyntaxKind.SwitchStatement:
        case SyntaxKind.TryStatement:
          VarScopedDeclarations.push(...$statement.VarScopedDeclarations);
      }
    }
  }
}

export class $EmptyStatement implements I$Node {
  public readonly $kind = SyntaxKind.EmptyStatement;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public constructor(
    public readonly node: EmptyStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
  }
}

type ExpressionStatement_T<T extends Expression> = ExpressionStatement & {
  readonly expression: T;
};

type DirectivePrologue = readonly ExpressionStatement_T<StringLiteral>[] & {
  readonly ContainsUseStrict?: true;
};

export class $ExpressionStatement implements I$Node {
  public readonly $kind = SyntaxKind.ExpressionStatement;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public constructor(
    public readonly node: ExpressionStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx | Context.InExpressionStatement);
  }
}

export class $IfStatement implements I$Node {
  public readonly $kind = SyntaxKind.IfStatement;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $thenStatement: $$ESStatement;
  public readonly $elseStatement: $$ESStatement | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-if-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public constructor(
    public readonly node: IfStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
    const $thenStatement = this.$thenStatement = $$esStatement(node.thenStatement as $StatementNode, this, ctx);

    if (node.elseStatement === void 0) {
      this.$elseStatement = void 0;

      this.VarScopedDeclarations = $thenStatement.VarScopedDeclarations;
    } else {
      const $elseStatement = $$esStatement(node.elseStatement as $StatementNode, this, ctx);

      this.VarScopedDeclarations = [
        ...$thenStatement.VarScopedDeclarations,
        ...$elseStatement.VarScopedDeclarations,
      ];
    }
  }
}

export class $DoStatement implements I$Node {
  public readonly $kind = SyntaxKind.DoStatement;
  public readonly id: number;

  public readonly $statement: $$ESStatement;
  public readonly $expression: $$AssignmentExpressionOrHigher;

  // http://www.ecma-international.org/ecma-262/#sec-do-while-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public constructor(
    public readonly node: DoStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    const $statement = this.$statement = $$esStatement(node.statement as $StatementNode, this, ctx);
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);

    this.VarScopedDeclarations = $statement.VarScopedDeclarations;
  }
}

export class $WhileStatement implements I$Node {
  public readonly $kind = SyntaxKind.WhileStatement;
  public readonly id: number;

  public readonly $statement: $$ESStatement;
  public readonly $expression: $$AssignmentExpressionOrHigher;

  // http://www.ecma-international.org/ecma-262/#sec-while-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public constructor(
    public readonly node: WhileStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    const $statement = this.$statement = $$esStatement(node.statement as $StatementNode, this, ctx);
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);

    this.VarScopedDeclarations = $statement.VarScopedDeclarations;
  }
}

type $$Initializer = (
  $$AssignmentExpressionOrHigher |
  $VariableDeclarationList
);

export class $ForStatement implements I$Node {
  public readonly $kind = SyntaxKind.ForStatement;
  public readonly id: number;

  public readonly $initializer: $$Initializer | undefined;
  public readonly $condition: $$AssignmentExpressionOrHigher | undefined;
  public readonly $incrementor: $$AssignmentExpressionOrHigher | undefined;
  public readonly $statement: $$ESStatement;

  // http://www.ecma-international.org/ecma-262/#sec-for-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public constructor(
    public readonly node: ForStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$condition = $assignmentExpression(node.condition as $AssignmentExpressionNode, this, ctx);
    this.$incrementor = $assignmentExpression(node.incrementor as $AssignmentExpressionNode, this, ctx);
    const $statement = this.$statement = $$esStatement(node.statement as $StatementNode, this, ctx);

    if (node.initializer === void 0) {
      this.$initializer = void 0;

      this.VarScopedDeclarations = $statement.VarScopedDeclarations;
    } else {
      if (node.initializer.kind === SyntaxKind.VariableDeclarationList) {
        const $initializer = this.$initializer = new $VariableDeclarationList(node.initializer as VariableDeclarationList, this, ctx);
        if ($initializer.isLexical) {
          this.VarScopedDeclarations = $statement.VarScopedDeclarations;
        } else {
          this.VarScopedDeclarations = [
            ...$initializer.VarScopedDeclarations,
            ...$statement.VarScopedDeclarations,
          ];
        }
      } else {
        this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);

        this.VarScopedDeclarations = $statement.VarScopedDeclarations;
      }
    }
  }
}

export class $ForInStatement implements I$Node {
  public readonly $kind = SyntaxKind.ForInStatement;
  public readonly id: number;

  public readonly $initializer: $$Initializer;
  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $statement: $$ESStatement;

  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public constructor(
    public readonly node: ForInStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
    const $statement = this.$statement = $$esStatement(node.statement as $StatementNode, this, ctx);

    if (node.initializer.kind === SyntaxKind.VariableDeclarationList) {
      const $initializer = this.$initializer = new $VariableDeclarationList(node.initializer as VariableDeclarationList, this, ctx);
      if ($initializer.isLexical) {
        this.BoundNames = $initializer.BoundNames;
        this.VarScopedDeclarations = $statement.VarScopedDeclarations;
      } else {
        this.BoundNames = emptyArray;
        this.VarScopedDeclarations = [
          ...$initializer.$declarations,
          ...$statement.VarScopedDeclarations,
        ];
      }
    } else {
      this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);

      this.BoundNames = emptyArray;
      this.VarScopedDeclarations = $statement.VarScopedDeclarations;
    }
  }
}

export class $ForOfStatement implements I$Node {
  public readonly $kind = SyntaxKind.ForOfStatement;
  public readonly id: number;

  public readonly $initializer: $$Initializer;
  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $statement: $$ESStatement;

  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public constructor(
    public readonly node: ForOfStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
    const $statement = this.$statement = $$esStatement(node.statement as $StatementNode, this, ctx);

    if (node.initializer.kind === SyntaxKind.VariableDeclarationList) {
      const $initializer = this.$initializer = new $VariableDeclarationList(node.initializer as VariableDeclarationList, this, ctx);
      if ($initializer.isLexical) {
        this.BoundNames = $initializer.BoundNames;
        this.VarScopedDeclarations = $statement.VarScopedDeclarations;
      } else {
        this.BoundNames = emptyArray;
        this.VarScopedDeclarations = [
          ...$initializer.$declarations,
          ...$statement.VarScopedDeclarations,
        ];
      }
    } else {
      this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);

      this.BoundNames = emptyArray;
      this.VarScopedDeclarations = $statement.VarScopedDeclarations;
    }
  }
}

export class $ContinueStatement implements I$Node {
  public readonly $kind = SyntaxKind.ContinueStatement;
  public readonly id: number;

  public readonly $label: $Identifier | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public constructor(
    public readonly node: ContinueStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$label = $identifier(node.label, this, ctx | Context.IsLabelReference);
  }
}

export class $BreakStatement implements I$Node {
  public readonly $kind = SyntaxKind.BreakStatement;
  public readonly id: number;

  public readonly $label: $Identifier | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public constructor(
    public readonly node: BreakStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$label = $identifier(node.label, this, ctx | Context.IsLabelReference);
  }
}

export class $ReturnStatement implements I$Node {
  public readonly $kind = SyntaxKind.ReturnStatement;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public constructor(
    public readonly node: ReturnStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    if (node.expression === void 0) {
      this.$expression = void 0;
    } else {
      this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
    }
  }
}

export class $WithStatement implements I$Node {
  public readonly $kind = SyntaxKind.WithStatement;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $statement: $$ESStatement;

  // http://www.ecma-international.org/ecma-262/#sec-with-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public constructor(
    public readonly node: WithStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
    const $statement = this.$statement = $$esStatement(node.statement as $StatementNode, this, ctx);

    this.VarScopedDeclarations = $statement.VarScopedDeclarations;
  }
}

export class $SwitchStatement implements I$Node {
  public readonly $kind = SyntaxKind.SwitchStatement;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $caseBlock: $CaseBlock;

  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public constructor(
    public readonly node: SwitchStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
    const $caseBlock = this.$caseBlock = new $CaseBlock(node.caseBlock, this, ctx);

    this.VarScopedDeclarations = $caseBlock.VarScopedDeclarations;
  }
}

export class $LabeledStatement implements I$Node {
  public readonly $kind = SyntaxKind.LabeledStatement;
  public readonly id: number;

  public readonly $label: $Identifier;
  public readonly $statement: $$ESLabelledItem;

  // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-static-semantics-lexicallyscopeddeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-static-semantics-toplevellexicallyscopeddeclarations
  public readonly TopLevelLexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-static-semantics-toplevelvarscopeddeclarations
  public readonly TopLevelVarScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public readonly TypeDeclarations: readonly $$TSDeclaration[] = emptyArray;
  public readonly IsType: false = false;

  public constructor(
    public readonly node: LabeledStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$label = $identifier(node.label, this, ctx | Context.IsLabel);
    const $statement = this.$statement = $$esLabelledItem(node.statement as $StatementNode, this, ctx);

    if ($statement.$kind === SyntaxKind.FunctionDeclaration) {
      this.LexicallyScopedDeclarations = [$statement];
      this.TopLevelVarScopedDeclarations = [$statement];
      this.VarScopedDeclarations = emptyArray;
    } else {
      this.LexicallyScopedDeclarations = emptyArray;
      if ($statement.$kind === SyntaxKind.LabeledStatement) {
        this.TopLevelVarScopedDeclarations = $statement.TopLevelVarScopedDeclarations;
      } else {
        this.TopLevelVarScopedDeclarations = $statement.VarScopedDeclarations;
      }
      this.VarScopedDeclarations = $statement.VarScopedDeclarations
    };
  }
}

export class $ThrowStatement implements I$Node {
  public readonly $kind = SyntaxKind.ThrowStatement;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public constructor(
    public readonly node: ThrowStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
  }
}

export class $TryStatement implements I$Node {
  public readonly $kind = SyntaxKind.TryStatement;
  public readonly id: number;

  public readonly $tryBlock: $Block;
  public readonly $catchClause: $CatchClause | undefined;
  public readonly $finallyBlock: $Block | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-try-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public constructor(
    public readonly node: TryStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    const $tryBlock = this.$tryBlock = new $Block(node.tryBlock, this, ctx);
    if (node.catchClause === void 0) {
      // finallyBlock must be defined
      this.$catchClause = void 0;
      const $finallyBlock = this.$finallyBlock = new $Block(node.finallyBlock!, this, ctx);

      this.VarScopedDeclarations = [
        ...$tryBlock.VarScopedDeclarations,
        ...$finallyBlock.VarScopedDeclarations,
      ];
    } else if (node.finallyBlock === void 0) {
      // catchClause must be defined
      const $catchClause = this.$catchClause = new $CatchClause(node.catchClause!, this, ctx);
      this.$finallyBlock = void 0;

      this.VarScopedDeclarations = [
        ...$tryBlock.VarScopedDeclarations,
        ...$catchClause.VarScopedDeclarations,
      ];
    } else {
      const $catchClause = this.$catchClause = new $CatchClause(node.catchClause!, this, ctx);
      const $finallyBlock = this.$finallyBlock = new $Block(node.finallyBlock!, this, ctx);

      this.VarScopedDeclarations = [
        ...$tryBlock.VarScopedDeclarations,
        ...$catchClause.VarScopedDeclarations,
        ...$finallyBlock.VarScopedDeclarations,
      ];
    }
  }
}

export class $DebuggerStatement implements I$Node {
  public readonly $kind = SyntaxKind.DebuggerStatement;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public constructor(
    public readonly node: DebuggerStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);
  }
}

// #endregion

// #region Statement members

export class $CaseBlock implements I$Node {
  public readonly $kind = SyntaxKind.CaseBlock;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public readonly $clauses: readonly ($CaseClause | $DefaultClause)[];

  public constructor(
    public readonly node: CaseBlock,
    public readonly parent: $SwitchStatement,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    const $clauses = this.$clauses = node.clauses.map(
      x => x.kind === SyntaxKind.CaseClause
        ? new $CaseClause(x, this, ctx)
        : new $DefaultClause(x, this, ctx)
    );

    this.VarScopedDeclarations = $clauses.flatMap(getVarScopedDeclarations);
  }
}

export class $CaseClause implements I$Node {
  public readonly $kind = SyntaxKind.CaseClause;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $statements: readonly $$TSStatementListItem[];

  public constructor(
    public readonly node: CaseClause,
    public readonly parent: $CaseBlock,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
    const $statements = this.$statements = $$tsStatementList(node.statements as NodeArray<$StatementNode>, this, ctx);

    this.VarScopedDeclarations = $statements.flatMap(getVarScopedDeclarations);
  }
}

export class $DefaultClause implements I$Node {
  public readonly $kind = SyntaxKind.DefaultClause;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public readonly $statements: readonly $$TSStatementListItem[];

  public constructor(
    public readonly node: DefaultClause,
    public readonly parent: $CaseBlock,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    const $statements = this.$statements = $$tsStatementList(node.statements as NodeArray<$StatementNode>, this, ctx);

    this.VarScopedDeclarations = $statements.flatMap(getVarScopedDeclarations);
  }
}

export class $CatchClause implements I$Node {
  public readonly $kind = SyntaxKind.CatchClause;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[];

  public readonly $variableDeclaration: $VariableDeclaration | undefined;
  public readonly $block: $Block;

  public constructor(
    public readonly node: CatchClause,
    public readonly parent: $TryStatement,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = realm.registerNode(this);

    ctx |= Context.InCatchClause;

    if (node.variableDeclaration === void 0) {
      this.$variableDeclaration = void 0;
    } else {
      this.$variableDeclaration = new $VariableDeclaration(node.variableDeclaration, this, ctx);
    }
    const $block = this.$block = new $Block(node.block, this, ctx);

    this.VarScopedDeclarations = $block.VarScopedDeclarations;
  }
}

  // #endregion


  // #endregion
