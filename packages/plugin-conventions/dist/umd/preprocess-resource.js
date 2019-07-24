(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "typescript", "modify-code", "@aurelia/kernel", "./name-convention", "./file-base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ts = require("typescript");
    const modify_code_1 = require("modify-code");
    const kernel_1 = require("@aurelia/kernel");
    const name_convention_1 = require("./name-convention");
    const file_base_1 = require("./file-base");
    function preprocessResource(filePath, jsCode, hasHtmlPair = false) {
        const m = modify_code_1.default(jsCode, filePath);
        const basename = file_base_1.fileBase(filePath);
        const implicitCustomElementName = kernel_1.kebabCase(basename);
        const sf = ts.createSourceFile(filePath, jsCode, ts.ScriptTarget.Latest);
        const runtimeImport = { names: [], start: 0, end: 0 };
        const jitImport = { names: [], start: 0, end: 0 };
        let implicitElementStart = -1;
        let implicitElementEnd = -1;
        // When there are multiple exported classes (e.g. local value converters),
        // they might be deps for rendering the main implicit custom element.
        const mayBeDependencies = [];
        const conventionalDecorators = [];
        sf.statements.forEach(s => {
            // Find existing import {customElement} from '@aurelia/runtime';
            const runtime = captureImport(s, '@aurelia/runtime');
            if (runtime) {
                runtimeImport.names = runtime.names;
                runtimeImport.start = ensureTokenStart(runtime.start, jsCode);
                runtimeImport.end = runtime.end;
                return;
            }
            // Find existing import {bindingCommand} from '@aurelia/jit';
            const jit = captureImport(s, '@aurelia/jit');
            if (jit) {
                jitImport.names = jit.names;
                jitImport.start = ensureTokenStart(jit.start, jsCode);
                jitImport.end = jit.end;
                return;
            }
            // Only care about export class Foo {...}.
            // Note this convention simply doesn't work for
            //   class Foo {}
            //   export {Foo};
            if (!ts.isClassDeclaration(s))
                return;
            if (!s.name)
                return;
            let exportPos = findExportPos(s);
            if (typeof exportPos !== 'number')
                return;
            exportPos = ensureTokenStart(exportPos, jsCode);
            const className = s.name.text;
            const { name, type } = name_convention_1.nameConvention(className);
            const isImplicitResource = name === implicitCustomElementName;
            const decoratedType = findDecoratedResourceType(s);
            if (decoratedType) {
                // Explicitly decorated resource
                if (!isImplicitResource && decoratedType !== 'customElement') {
                    mayBeDependencies.push(className);
                }
            }
            else {
                if (type === 'customElement') {
                    // Custom element can only be implicit resource
                    if (isImplicitResource && hasHtmlPair) {
                        implicitElementStart = exportPos;
                        implicitElementEnd = s.end;
                        ensureTypeIsExported(runtimeImport.names, type);
                    }
                }
                else {
                    conventionalDecorators.push([exportPos, `@${type}('${name}')\n`]);
                    mayBeDependencies.push(className);
                    if (type === 'bindingCommand') {
                        ensureTypeIsExported(jitImport.names, type);
                    }
                    else {
                        ensureTypeIsExported(runtimeImport.names, type);
                    }
                }
            }
        });
        if (implicitElementStart >= 0) {
            const viewDef = '__' + kernel_1.camelCase(basename) + 'ViewDef';
            m.prepend(`import * as ${viewDef} from './${basename}.html';\n`);
            if (mayBeDependencies.length) {
                // When in-file deps are used, move the body of custom element to end of the file,
                // in order to avoid TS2449: Class '...' used before its declaration.
                const elementStatement = jsCode.slice(implicitElementStart, implicitElementEnd);
                m.replace(implicitElementStart, implicitElementEnd, '');
                m.append(`\n@customElement({ ...${viewDef}, dependencies: [ ...${viewDef}.dependencies, ${mayBeDependencies.join(', ')} ] })\n${elementStatement}\n`);
            }
            else {
                conventionalDecorators.push([implicitElementStart, `@customElement(${viewDef})\n`]);
            }
        }
        if (conventionalDecorators.length) {
            if (runtimeImport.names.length) {
                let runtimeImportStatement = `import { ${runtimeImport.names.join(', ')} } from '@aurelia/runtime';`;
                if (runtimeImport.end === runtimeImport.start)
                    runtimeImportStatement += '\n';
                m.replace(runtimeImport.start, runtimeImport.end, runtimeImportStatement);
            }
            if (jitImport.names.length) {
                let jitImportStatement = `import { ${jitImport.names.join(', ')} } from '@aurelia/jit';`;
                if (jitImport.end === jitImport.start)
                    jitImportStatement += '\n';
                m.replace(jitImport.start, jitImport.end, jitImportStatement);
            }
            conventionalDecorators.forEach(([pos, str]) => m.insert(pos, str));
        }
        return m.transform();
    }
    exports.preprocessResource = preprocessResource;
    function captureImport(s, lib) {
        if (ts.isImportDeclaration(s) &&
            ts.isStringLiteral(s.moduleSpecifier) &&
            s.moduleSpecifier.text === lib &&
            s.importClause &&
            s.importClause.namedBindings &&
            ts.isNamedImports(s.importClause.namedBindings)) {
            return {
                names: s.importClause.namedBindings.elements.map(e => e.name.text),
                start: s.pos,
                end: s.end
            };
        }
    }
    // This method mutates runtimeExports.
    function ensureTypeIsExported(runtimeExports, type) {
        if (!runtimeExports.includes(type)) {
            runtimeExports.push(type);
        }
    }
    // TypeScript parsed statement could contain leading white spaces.
    // This find the exact starting position for latter code injection.
    function ensureTokenStart(start, code) {
        while (start < code.length - 1 && code[start].match(/^\s$/))
            start++;
        return start;
    }
    function findExportPos(node) {
        if (!node.modifiers)
            return;
        for (const mod of node.modifiers) {
            if (mod.kind === ts.SyntaxKind.ExportKeyword)
                return mod.pos;
        }
    }
    const KNOWN_DECORATORS = ['customElement', 'customAttribute', 'valueConverter', 'bindingBehavior', 'bindingCommand'];
    function findDecoratedResourceType(node) {
        if (!node.decorators)
            return;
        for (let d of node.decorators) {
            if (!ts.isCallExpression(d.expression))
                return;
            const exp = d.expression.expression;
            if (ts.isIdentifier(exp)) {
                const name = exp.text;
                if (KNOWN_DECORATORS.includes(name)) {
                    return name;
                }
            }
        }
    }
});
//# sourceMappingURL=preprocess-resource.js.map