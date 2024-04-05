import esbuild from "esbuild";
import { normalizePath } from "vite";

const SUPPORTED_FILE_EXTENSIONS = /\.(js|jsx|ts|tsx|mjs|cjs|vue)$/;
const nodeModulesPath = normalizePath(`${__dirname}/node_modules`);

export default function browserRouteModulesVitePlugin({ match }: { match: (path: string) => string[] | undefined }) {
    return {
        name: "browser-route-modules-vite",
        async transform(src, id) {
            const excludeFunctionNames = SUPPORTED_FILE_EXTENSIONS.test(id) ? match(id) : undefined;

            if (
                !excludeFunctionNames ||
                excludeFunctionNames?.length === 0 ||
                /\bexport\s+\*\s+from\s+/.test(src) ||
                id.startsWith(nodeModulesPath)
            ) {
                return null;
            }

            let resultFindExports = await esbuild.build({
                entryPoints: [id],
                platform: "neutral",
                format: "esm",
                metafile: true,
                write: false,
                loader: {
                    ".js": "jsx"
                },
                logLevel: "silent"
            });
            let metafile = resultFindExports.metafile!;
            let exports: string[] = [];
            for (let key in metafile.outputs) {
                let output = metafile.outputs[key];
                if (output.entryPoint) exports = output.exports;
            }

            const containsExcludedExports = exports.some((exportName) => excludeFunctionNames.includes(exportName));
            if (containsExcludedExports) {
                const filteredNames = exports.filter((name) => !excludeFunctionNames.includes(name)).map((name) => name);

                if (filteredNames.length > 0) {
                    const virtual = `${id}?browser`;
                    const result = await esbuild.build({
                        entryPoints: [virtual],
                        bundle: true,
                        format: "esm",
                        outdir: "./none",
                        write: false,
                        sourcemap: true,
                        plugins: [
                            {
                                name: "remove-exports",
                                setup(build) {
                                    build.onResolve({ filter: /.*/ }, (args) => {
                                        if (args.path === id || args.path === virtual) {
                                            return {
                                                path: `${args.path}`
                                            };
                                        }
                                        return {
                                            external: true
                                        };
                                    });
                                    build.onLoad({ filter: /.*/ }, (args) => {
                                        if (args.path === virtual) {
                                            let contents = "module.exports = {};";
                                            if (filteredNames.length !== 0) {
                                                let spec = `{ ${filteredNames.join(", ")} }`;
                                                contents = `export ${spec} from ${JSON.stringify(`${id}`)};`;
                                            }

                                            return {
                                                contents
                                            };
                                        }
                                        if (args.path === id) {
                                            return { contents: src };
                                        }
                                    });
                                }
                            }
                        ]
                    });
                    let jsCode = "";
                    let map = "";
                    for (const file of result.outputFiles) {
                        if (file.path.endsWith(".js")) {
                            jsCode = file.text;
                        } else if (file.path.endsWith(".js.map")) {
                            map = file.text;
                        }
                    }
                    return {
                        code: jsCode.replace(/^\/\/# sourceMappingURL=.+$/m, ""),
                        map: map || undefined
                    };
                }
            }
            return src;
        },
        apply(config, { command }) {
            return command === "build" && !config.build.ssr;
        }
    };
}
