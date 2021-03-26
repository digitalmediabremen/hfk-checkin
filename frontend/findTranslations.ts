import colors from "colors";
import * as stringsim from "string-similarity";
import { CallExpression, Project, SyntaxKind, ts } from "ts-morph";
import yargs from "yargs";

const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
});

function strip(t: string) {
    return t.replace(/^[\"\']|[\"\']$/g, "");
}

function saveDots(text: string) {
    return text.replace(/\./g, "{{dot}}");
}

function reapplyDots(text: string) {
    return text.replace(/{{dot}}/g, ".");
}

function createDefinitionSet() {
    const f = project.getSourceFile("./localization/index.tsx");
    if (!f) throw "Localization file not found";

    const useTFunc = f?.getVariableDeclarationOrThrow("useTranslation");
    const _tFunc = f?.getFunctionOrThrow("_t");
    const tFunc = useTFunc
        ?.getDescendantsOfKind(SyntaxKind.ShorthandPropertyAssignment)
        .pop();
    const useTFuncRefs = useTFunc?.findReferencesAsNodes();
    const tFuncRefs = tFunc?.findReferencesAsNodes();
    const _tFuncRefs = _tFunc?.findReferencesAsNodes();
    // console.log(tFuncRefs?.[0]);
    const tDefinitionSet = new Set<string>();

    const relevantSourceFiles = new Set(
        [
            ...(tFuncRefs || []),
            ...(_tFuncRefs || []),
            ...(useTFuncRefs || []),
        ]?.map((p) => {
            return p.getSourceFile();
        })
    );

    // console.log(
    //     relevantSourceFiles.forEach((s) =>
    //         console.log(s.getSourceFile().getBaseName())
    //     )
    // );

    // remove definition file
    relevantSourceFiles.delete(useTFunc!.getSourceFile());

    relevantSourceFiles.forEach((file) => {
        let currentModule: string | undefined = undefined;

        const processTCall = (node: CallExpression<ts.CallExpression>) => {
            const args = node.getArguments();
            const tString = strip((args[2] || args[0]).getText());
            // console.log(node.getArguments().map((a) => a.getText()));
            tDefinitionSet.add(`${currentModule}.${saveDots(tString)}`);
        };

        const process_TCall = (node: CallExpression<ts.CallExpression>) => {
            const args = node.getArguments();
            // const locale = strip(args[0].getText());
            const inModule = strip(args[1].getText());
            const tString = strip((args[4] || args[2]).getText());

            tDefinitionSet.add(`${inModule}.${saveDots(tString)}`);
        };

        const processLater: CallExpression<ts.CallExpression>[] = [];

        file.getDescendantsOfKind(ts.SyntaxKind.CallExpression)
            .filter(
                (n) =>
                    n.getText().startsWith("useTranslation(") ||
                    n.getText().startsWith("t(") ||
                    n.getText().startsWith("_t(")
            )
            .forEach((node) => {
                // console.log("search file: ", )
                // console.log(node.getText())
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
                        console.log(node.getText());
                        processLater.push(node);
                    }
                    processTCall(node);
                }

                if (n.startsWith("_t(")) {
                    process_TCall(node);
                }
            });

        if (!currentModule && processLater.length > 0) {
            throw "There a t() calls where a module context cannot be found.";
            //     throw `t() cannot be called without module context in ${p
            //         .getSourceFile()
            //         .getBaseName()}.
            // \nmake sure you never pass the t() function as an argument
            // \n"${node.getText()}"`;
        }

        for (const node of processLater) {
            processTCall(node);
        }
    });
    return tDefinitionSet;
}

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
            Object.keys(o).forEach((k) =>
                // @ts-ignore
                traverse(o[k], `${m}.${saveDots(k)}`)
            );
        }

        if (typeof o === "string") {
            s.set(m.slice(1), o);
        }
    }
    traverse(json, "");
    return s;
}

interface TranslationConsoleOutput {
    unmatchedDefinitions: string[];
    matchedDefinitions: string[];
    unresolvedTranslations: string[];
    output: string;
}

function createExistingTranslationsMap() {
    const translationFile = project.getSourceFile(
        "./localization/translation.ts"
    );
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
    return tValueMap;
}

function createNewTranslation(
    tDefinition: Set<string>,
    tValue: Map<string, string>,
    forLocales: Array<string>,
    consoleOutputObject: TranslationConsoleOutput
): void {
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
        //find unmatched entries
        tDefinitionCopy.forEach((entry) => {
            const tString = `${locale}.${entry}`;

            if (tValueCopy.size > 0) {
                const { bestMatch } = stringsim.findBestMatch(
                    tString,
                    Array.from(tValueCopy.keys() || [])
                );
                const { target, rating } = bestMatch;

                if (rating > 0.6) {
                    consoleOutputObject.matchedDefinitions.push(
                        `"${tString}" "${target}" ${rating}`
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
        tDefinitionCopy.forEach((t) =>
            consoleOutputObject.unmatchedDefinitions.push(
                `"${locale}.${reapplyDots(t)}"`
            )
        );
    });

    tValueCopy.forEach((v, key) =>
        consoleOutputObject.unresolvedTranslations.push(`"${reapplyDots(key)}"`)
    );

    coo.output = tMapToJson(tResultMap);
}

function _consoleHeader() {
    console.log(colors.inverse("Find Translations"));
    console.log();
}

function consoleNewFile(o: TranslationConsoleOutput) {
    _consoleHeader();

    console.log(`${o.matchedDefinitions.length} changed definitions`);
    o.matchedDefinitions.forEach((s) => console.log(s));
    console.log();

    console.log(`${o.unmatchedDefinitions.length} unmatched definitions`);
    o.unmatchedDefinitions.forEach((s) => console.log(s));
    console.log();

    console.log(`${o.unresolvedTranslations.length} unresolved definitions`);
    o.unresolvedTranslations.forEach((s) => console.log(s));
    console.log();

    console.log(o.output);
    console.log();
}

function consoleStatus(o: TranslationConsoleOutput) {
    _consoleHeader();
    if (o.unmatchedDefinitions.length > 0) {
        console.log(
            colors.red(
                `${o.unmatchedDefinitions.length} unmatched definitions: `
            )
        );
        o.unmatchedDefinitions.forEach((s) => console.log(s));
        console.log();
        return;
    }

    if (o.matchedDefinitions.length > 0) {
        console.log(
            colors.red(`${o.matchedDefinitions.length} changed definitions: `)
        );
        o.matchedDefinitions.forEach((s) => console.log(s));
        console.log();
        return;
    }

    console.log(colors.green("All translations ok."));
}

function createConsoleOutputObject(): TranslationConsoleOutput {
    return {
        unmatchedDefinitions: [],
        unresolvedTranslations: [],
        matchedDefinitions: [],
        output: "",
    };
}

let coo = createConsoleOutputObject();

const options = yargs.usage("Usage: --quiet").option("quiet", {
    alias: "q",
    describe: "Runs without output. Exits with error if new translations found",
    type: "boolean",
    demandOption: false,
}).argv;

const newTranslationFile = createNewTranslation(
    createDefinitionSet(),
    createExistingTranslationsMap(),
    ["en"],
    coo
);

if (options.quiet) {
    consoleStatus(coo);
    if (
        coo.unmatchedDefinitions.length > 0 ||
        coo.matchedDefinitions.length > 0
    )
        process.exit(1);
} else {
    consoleNewFile(coo);
}
