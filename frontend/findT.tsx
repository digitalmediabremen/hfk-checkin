import * as stringsim from "string-similarity";
import {
    Node, Project,
    SyntaxKind
} from "ts-morph";
import * as ts from "typescript";

const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
});


const f = project.getSourceFile("./localization/index.tsx");
const languageService = project.getLanguageService();

const useTFunc = f?.getVariableDeclaration("useTranslation");

const tFuncRefs = useTFunc?.findReferencesAsNodes();

// console.log (tFuncRefs?.map());

// find parameters
// console.log (tFuncRefs?.map(r => languageService.findReferencesAsNodes(r).map(m => m.getParentIfKind(SyntaxKind.CallExpression)?.getArguments().map(t => t.getText()))))
// find local vars
const tDefinitionSet = new Set<string>();
function strip(t: string) {
    return t.replace(/"/g, "");
}

function saveDots(text: string) {
    return text.replace(/\./g, "{{dot}}");
}

function reapplyDots(text: string) {
    return text.replace(/{{dot}}/g, ".");
}

tFuncRefs?.map((p) => {
    let currentModule: string | undefined = undefined;
    console.log(p.getSourceFile().getBaseName());
    const r = p.getSourceFile().forEachDescendant((node, traversal) => {
        const k = node.getKind();
        // console.log("search file: ", )
        // console.log(node.getText())
        if (Node.isCallExpression(node)) {
            const n = node.getText();
            if (n.startsWith("useTranslation(")) {
                const module = strip(
                    node.getArguments()?.[0]?.getText() || "common"
                );
                // console.log(module);
                currentModule = module;
            }
            if (n.startsWith("t(")) {
                if (currentModule === undefined) {
                    console.log(n);
                    throw "t cannt be called without module context";
                }
                const args = node.getArguments();
                const tString = strip((args[2] || args[0]).getText());
                // console.log(node.getArguments().map((a) => a.getText()));
                tDefinitionSet.add(`${currentModule}.${saveDots(tString)}`);
                traversal.skip();
            }
        }

        return undefined;
    });
    return p;
});

function tMapToJson(map: Map<string, string>): string {
    let returnObj: Record<string, any> = {};
    map.forEach((value, key) => {
        if (key.split(".").length < 3) {
            throw "json wrong";
            return;
        }
        const [locale, module, tString] = key.split(".");

        returnObj[locale] = returnObj[locale] || {};
        returnObj[locale][module] = returnObj[locale][module] || {};

        returnObj[locale][module][reapplyDots(tString)] = value;
    });

    return JSON.stringify(returnObj, null, 2);
}

function jsonToMap(json: Record<string, any>) {
    const s = new Map<string, string>();
    function traverse(o: Object, m: "") {
        if (typeof o === "object") {
            // @ts-ignore
            Object.keys(o).forEach((k) => traverse(o[k], `${m}.${saveDots(k)}`));
        }

        if (typeof o === "string") {
            s.set(m.slice(1), o);
        }
    }
    traverse(json, "");
    return s;
}

const translationFile = project.getSourceFile("./localization/translation.ts");
const tsCode = translationFile?.getSourceFile().getText() || "";
// .getFirstDescendantByKindOrThrow(SyntaxKind.VariableStatement)
// .getText() || "";
let result = ts.transpileModule(tsCode, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
});

const badJson = JSON.stringify(eval(result.outputText));
// const json = badJson.replace(/([a-z][^:]*)(?=\s*:)/g, '"$1"');
const json = JSON.parse(badJson);
const tValueMap = jsonToMap(json);

function createNewTranslation(
    tDefinition: Set<string>,
    tValue: Map<string, string>,
    forLocales: Array<string>
) {
    const tObj: Record<string, any> = {};
    const tValueCopy = new Map(tValue);
    const tResultMap = new Map<string, string>();

    forLocales.map((locale) => {
        const tDefinitionCopy = new Set(tDefinition);
        tDefinition.forEach((entry) => {
            // find in value set
            const tString = `${locale}.${entry}`;

            // its a match
            if (tValueCopy.has(tString)) {
                const value = tValueCopy.get(tString)!;
                tValueCopy.delete(tString);
                tDefinitionCopy.delete(entry);
                tResultMap.set(tString, value);
            }
        });

        //second pass
        tDefinitionCopy.forEach((entry) => {
            const tString = `${locale}.${entry}`;

            if (tValueCopy.size > 0) {
                const { bestMatch } = stringsim.findBestMatch(
                    tString,
                    Array.from(tValueCopy.keys() || [])
                );
                const { target, rating } = bestMatch;

                if (rating > 0.6) {
                    console.log(
                        "found match",
                        `"${tString}"`,
                        `"${target}"`,
                        rating
                    );
                    tResultMap.set(tString, tValueCopy.get(target)!);
                    tValueCopy.delete(target);
                    tDefinitionCopy.delete(entry);
                } else {
                    tResultMap.set(tString, "NEW");
                }
            } else {
                tResultMap.set(tString, "NEW");
            }
        });
        console.log(tDefinitionCopy.size, `new translations found for locale "${locale}"`);
    });

    tValueCopy.forEach((v, key) => console.log(key, "not found"));
    if (tValueCopy.size === 0)
        console.log("hoorray. all translations could be matched");

    return tMapToJson(tResultMap);
}

console.log(createNewTranslation(tDefinitionSet, tValueMap, ["en"]));
